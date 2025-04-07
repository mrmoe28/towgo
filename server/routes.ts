import express, { type Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  searchParamsSchema, 
  insertFavoriteSchema, 
  businessSchema, 
  PerplexityResult, 
  checkoutSessionSchema,
  insertServiceSchema
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { enhanceSearchQuery, generateRecommendations } from "./services/perplexity";
import { simulateBusinessSearch } from "./services/websearch";
import { 
  createLocationShare, 
  getLocationShare, 
  deleteLocationShare, 
  locationSharingSchema, 
  getAllActiveShares
} from "./services/locationSharing";
import { 
  createCheckoutSession, 
  handleStripeWebhook, 
  getPaymentStatus, 
  isStripeConfigured 
} from "./services/stripe";
import { 
  subscriptionPlans, 
  createSubscriptionCheckout, 
  startTrial, 
  handleSubscriptionWebhook,
  getUserSubscriptionStatus,
  hasActivePremium,
  initializeSubscriptionProducts
} from "./services/subscription";
import { log } from "./vite";
import Stripe from "stripe";
import axios from "axios";
import expressSession from "express-session";
import MemoryStore from "memorystore";
import connectPgSession from "connect-pg-simple";
import pkg from "pg";
import passport from "passport";
const { Pool } = pkg;
import authRoutes from "./routes/auth";
import oauthRoutes from "./services/authRoutes";
import { configurePassport, ensureAuthenticated, getCurrentUser } from "./services/oauth";

// Reference these functions to prevent unused reference errors
const _unusedFunctions = () => {
  console.log('These functions are not used anymore but needed for the LSP');
  return {
    listSmitheryServers: () => {},
    getSmitheryServerDetails: () => {},
    createSmitheryWebSocketUrl: () => {}
  };
};

// Mock user ID since we don't have auth
const MOCK_USER_ID = 1;

// Session store provider
function storageProvider() {
  // Use PostgreSQL session store if available, otherwise use MemoryStore
  if (process.env.DATABASE_URL) {
    try {
      const PgSession = connectPgSession(expressSession);
      return new PgSession({
        pool: new Pool({
          connectionString: process.env.DATABASE_URL,
        }),
        tableName: 'sessions',
        createTableIfMissing: true,
      });
    } catch (error) {
      console.error('Error setting up PostgreSQL session store:', error);
      // Fall back to MemoryStore
    }
  }
  
  // Use MemoryStore as fallback
  const MemoryStoreSession = MemoryStore(expressSession);
  return new MemoryStoreSession({
    checkPeriod: 86400000, // Prune expired entries every 24h
  });
}

// Create mock user if it doesn't exist
async function ensureUserExists() {
  let user = await storage.getUserByUsername("user");
  if (!user) {
    user = await storage.createUser({
      username: "user",
      password: "password",
    });
  }
  return user;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure session middleware - required before auth routes
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  
  // Special route to serve the deployment package
  app.get('/download', (req: Request, res: Response) => {
    res.sendFile(process.cwd() + '/download.html');
  });
  
  app.get('/towgo-deployment.zip', (req: Request, res: Response) => {
    res.download(process.cwd() + '/towgo-deployment.zip');
  });
  
  // Configure express-session with properly typed configuration
  const sessionConfig: expressSession.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'towgo-session-secret',
    resave: true,
    saveUninitialized: true,
    proxy: true,
    cookie: {
      secure: false, // Set to false to work with both HTTP and HTTPS
      sameSite: 'lax', // TypeScript knows this is valid
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      httpOnly: true,
      path: '/',
    },
    store: storageProvider()
  };
  
  // Log session configuration (except for the secret)
  console.log('Session configuration:', {
    ...sessionConfig,
    secret: '[HIDDEN]',
    store: 'Configured',
  });
  
  app.use(expressSession(sessionConfig));
  
  // Configure Passport authentication
  configurePassport();
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Register authentication routes and email verification routes
  console.log('Registering OAuth routes at /auth path');
  app.use('/auth', oauthRoutes);
  console.log('Registering API auth routes at /api/auth path');
  app.use('/api/auth', authRoutes);
  
  // Debug route to check Google OAuth credentials
  app.get('/debug/oauth', (req: Request, res: Response) => {
    // Don't show full keys, just first few characters
    const googleClientId = process.env.GOOGLE_CLIENT_ID 
      ? `${process.env.GOOGLE_CLIENT_ID.substring(0, 8)}...` 
      : 'Not configured';
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET 
      ? 'Configured (hidden)' 
      : 'Not configured';
    
    res.json({
      googleClientId,
      googleClientSecret,
      googleOAuthConfigured: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
      sessionSecret: process.env.SESSION_SECRET ? 'Configured (hidden)' : 'Using default value',
      authStatus: req.isAuthenticated() ? 'Authenticated' : 'Not authenticated',
      user: req.user ? 'User in session' : 'No user in session'
    });
  });
  
  // Create API routes
  const apiRouter = express.Router();

  // Initialize mock user for backward compatibility
  await ensureUserExists();

  // Search for businesses with Perplexity enhancement
  apiRouter.get("/search", async (req: Request, res: Response) => {
    try {
      // Parse and validate query parameters
      console.log('Search API request params:', req.query);
      
      const queryParams = {
        location: req.query.location as string | undefined,
        latitude: req.query.latitude ? parseFloat(req.query.latitude as string) : undefined,
        longitude: req.query.longitude ? parseFloat(req.query.longitude as string) : undefined,
        radius: req.query.radius ? parseInt(req.query.radius as string) : 5000, // Default to 5km
        sortBy: (req.query.sortBy as string) || "distance",
        businessType: req.query.businessType as string | undefined,
      };
      
      console.log('Parsed search params:', queryParams);

      const validatedParams = searchParamsSchema.parse(queryParams);
      
      // Use business type if provided, otherwise use a general query
      let originalQuery = validatedParams.businessType || "popular businesses";
      
      console.log(`Business type for search: "${originalQuery}"`);
      
      // Initialize perplexity result with the original query
      let perplexityResult: PerplexityResult = {
        originalQuery,
        enhancedQuery: originalQuery,
        isEnhanced: false
      };
      
      // Always try to enhance the query with Perplexity AI
      try {
        console.log(`Starting to enhance search query: ${originalQuery}`);
        log(`Enhancing search query: ${originalQuery}`, 'perplexity');
        
        perplexityResult = await enhanceSearchQuery(
          originalQuery, 
          validatedParams.location
        );
        
        console.log(`Perplexity result:`, JSON.stringify(perplexityResult, null, 2));
        log(`Enhanced to: ${perplexityResult.enhancedQuery}`, 'perplexity');
        
        // Update the businessType with the enhanced query for search
        validatedParams.businessType = perplexityResult.enhancedQuery;
      } catch (perplexityError) {
        console.error('Detailed perplexity error:', perplexityError);
        log(`Error enhancing query: ${perplexityError}`, 'perplexity');
        // Continue with original query if enhancement fails
      }
      
      // Return the enhanced query and citations to be used by the frontend
      res.json({ 
        results: [], // Frontend will populate with Google Maps results
        status: "SUCCESS",
        originalQuery: perplexityResult.originalQuery,
        enhancedQuery: perplexityResult.enhancedQuery,
        isEnhanced: perplexityResult.isEnhanced,
        citations: perplexityResult.citations
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });
  
  // Get recommendations based on search history and favorites
  apiRouter.get("/recommendations", async (req: Request, res: Response) => {
    try {
      // Get user's favorites to build preference profile
      const favorites = await storage.getFavorites(MOCK_USER_ID);
      
      // Extract business types and locations from favorites
      const preferences = favorites.map(fav => fav.name).filter(Boolean);
      const location = req.query.location as string | undefined;
      
      // Generate recommendations using Perplexity
      const recommendations = await generateRecommendations(preferences, location);
      
      res.json({ recommendations });
    } catch (error) {
      console.error('Error generating recommendations:', error);
      res.status(500).json({ message: "Error generating recommendations" });
    }
  });

  // Get favorites
  apiRouter.get("/favorites", async (_req: Request, res: Response) => {
    try {
      const favorites = await storage.getFavorites(MOCK_USER_ID);
      res.json(favorites);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Add a favorite
  apiRouter.post("/favorites", async (req: Request, res: Response) => {
    try {
      const favoriteData = {
        ...req.body,
        userId: MOCK_USER_ID,
      };

      const validatedData = insertFavoriteSchema.parse(favoriteData);
      
      // Check if favorite already exists
      const existingFavorite = await storage.getFavoriteByPlaceId(MOCK_USER_ID, validatedData.placeId);
      if (existingFavorite) {
        return res.status(409).json({ message: "Favorite already exists" });
      }
      
      const favorite = await storage.createFavorite(validatedData);
      res.status(201).json(favorite);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // Delete a favorite
  apiRouter.delete("/favorites/:placeId", async (req: Request, res: Response) => {
    try {
      const placeId = req.params.placeId;
      const deleted = await storage.deleteFavoriteByPlaceId(MOCK_USER_ID, placeId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Favorite not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Direct Perplexity AI search endpoint
  apiRouter.get("/perplexity", async (req: Request, res: Response) => {
    try {
      const query = req.query.query as string;
      const location = req.query.location as string | undefined;
      
      if (!query) {
        return res.status(400).json({ message: "Query parameter is required" });
      }
      
      console.log(`Performing direct Perplexity search: "${query}" with location: ${location || 'not specified'}`);
      log(`Direct Perplexity search: "${query}"`, 'perplexity');
      
      if (!process.env.PERPLEXITY_API_KEY) {
        console.error('Perplexity API key not found in environment');
        return res.status(500).json({ message: "Perplexity API key not configured" });
      }
      
      const result = await enhanceSearchQuery(query, location);
      
      console.log('Perplexity direct search result:', JSON.stringify(result, null, 2));
      log(`Perplexity search completed with ${result.citations?.length || 0} citations`, 'perplexity');
      
      res.json(result);
    } catch (error) {
      console.error('Error in Perplexity direct search:', error);
      res.status(500).json({ 
        message: "Failed to perform AI search",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Web search for businesses using Perplexity
  apiRouter.get("/websearch", async (req: Request, res: Response) => {
    try {
      const query = req.query.query as string;
      const location = req.query.location as string | undefined;
      const radius = req.query.radius ? parseInt(req.query.radius as string, 10) : undefined;
      
      if (!query) {
        console.log('Missing query parameter');
        return res.status(400).send(JSON.stringify({ message: "Query parameter is required" }));
      }
      
      console.log("Web search request with:");
      console.log(`- query: "${query}"`);
      console.log(`- location: "${location || 'none'}"`);
      console.log(`- radius: ${radius || 'none'} meters`);
      
      // Always focus search on tow truck services
      const isTowTruckQuery = query.toLowerCase().includes('tow') || query.toLowerCase().includes('truck');
      
      // Form proper search query with location and radius information
      let fullQuery = isTowTruckQuery ? `${query}` : `tow truck ${query} services`;
      
      // Add location info if provided
      if (location) {
        fullQuery += ` in ${location}`;
      }
      
      // Add radius info if provided (convert meters to miles for better human readability)
      if (radius) {
        const radiusInMiles = Math.round(radius / 1609.34);
        fullQuery += ` within ${radiusInMiles} miles radius`;
      }
      
      console.log(`Performing Perplexity search for: "${fullQuery}"`);
      log(`Web search request using Perplexity: "${fullQuery}"`, 'websearch');

      // Check if we have the Perplexity API key
      if (!process.env.PERPLEXITY_API_KEY) {
        console.error('Perplexity API key not found in environment');
        res.setHeader('Content-Type', 'application/json');
        return res.status(500).send(JSON.stringify({ 
          message: "Perplexity API key not configured", 
          error: true 
        }));
      }
      
      try {
        // Try to use Perplexity API first
        try {
          // Only try Perplexity if the API key is available
          if (process.env.PERPLEXITY_API_KEY) {
            console.log('Attempting to use Perplexity API...');
            const perplexityResponse = await axios.post(
              'https://api.perplexity.ai/chat/completions',
              {
                model: "llama-3.1-sonar-small-128k-online",
                messages: [
                  {
                    role: "system",
                    content: `You are a specialized business search assistant focusing on tow truck and roadside assistance services.`
                  },
                  {
                    role: "user",
                    content: `Find tow truck businesses ${fullQuery}. VERY IMPORTANT: Only return businesses from the exact location mentioned in the query. Format results as a JSON array of objects with: title, description, address, phone, website, rating, categories, hours.`
                  }
                ],
                temperature: 0.1
              },
              {
                headers: {
                  'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
                  'Content-Type': 'application/json'
                }
              }
            );
            
            console.log('Perplexity response received');
            
            // Extract the content from Perplexity's response
            const aiContent = perplexityResponse.data.choices[0].message.content;
            const sources = perplexityResponse.data.citations || [];
            
            // Extract JSON from the content (in case there's markdown or explanation text)
            const jsonMatch = aiContent.match(/```json\n([\s\S]*?)```/) || 
                              aiContent.match(/```\n([\s\S]*?)```/) || 
                              [null, aiContent];
            
            let businessData: any[] = [];
            let contentToTryParsing = jsonMatch[1] || aiContent;
            
            try {
              // Try to parse the content as JSON
              businessData = JSON.parse(contentToTryParsing);
              console.log(`Successfully parsed ${businessData.length} businesses from Perplexity`);
              
              // Format the response according to our WebSearchResult schema
              const formattedBusinesses = businessData.map(biz => ({
                title: biz.title || "Unknown Business",
                url: biz.website || "",
                description: biz.description || "",
                phone: biz.phone || undefined,
                address: biz.address || undefined,
                rating: biz.rating?.toString() || undefined,
                categories: Array.isArray(biz.categories) ? biz.categories : 
                           (biz.categories ? [biz.categories] : ["Tow Truck", "Roadside Assistance"]),
                website: biz.website || undefined,
                hours: Array.isArray(biz.hours) ? biz.hours : undefined,
                source: "Google Search",
                sourceType: "search"
              }));
              
              const result = {
                originalQuery: query,
                businesses: formattedBusinesses,
                totalResults: formattedBusinesses.length,
                timeTaken: `${((new Date().getTime() - new Date(perplexityResponse.data.created * 1000).getTime()) / 1000).toFixed(2)}s`,
                sources: sources.length > 0 ? sources : ["Google Search"]
              };
              
              console.log(`Returning ${formattedBusinesses.length} businesses from Perplexity`);
              
              // Set Content-Type header and send JSON response
              res.setHeader('Content-Type', 'application/json');
              return res.send(JSON.stringify(result));
            } catch (parseError) {
              // If parsing failed, continue to fallback
              throw new Error("Failed to parse Perplexity response");
            }
          } else {
            throw new Error("Perplexity API key not configured");
          }
        } catch (error) {
          // Log the error but continue to fallback
          console.error('Perplexity API failed, falling back to simulated search:', error);
          // Check if it's an axios error
          const axiosError = error as any;
          if (axiosError.response && axiosError.response.data) {
            console.error('Perplexity API error details:', JSON.stringify(axiosError.response.data));
          }
          throw error; // Re-throw to trigger the fallback
        }
      } catch (error) {
        // Try the fallback search if Perplexity fails
        console.log('Using fallback search mechanism...');
        try {
          // Use passed location parameter first, otherwise try to extract it from fullQuery
          let extractedLocation = location;
          
          if (!extractedLocation) {
            const locationMatch = fullQuery.match(/(in|near|around)\s+([^,]+)/i);
            extractedLocation = locationMatch ? locationMatch[2] : undefined;
          }
          
          // Log locations for debugging
          console.log(`Location from request params: ${location || 'none'}`);
          console.log(`Extracted location from query: ${extractedLocation || 'none'}`);
          
          // Extract just the tow truck part from the query
          const queryMatch = fullQuery.match(/^(tow truck|.*?)\s+(within|in|near)/i);
          const cleanQuery = queryMatch ? queryMatch[1] : "tow truck";
          
          // Use the simulated search as a fallback
          const simulatedResult = await simulateBusinessSearch(cleanQuery, extractedLocation);
          
          console.log(`Returning ${simulatedResult.businesses.length} businesses from fallback search`);
          
          // Set Content-Type header and send JSON response
          res.setHeader('Content-Type', 'application/json');
          return res.send(JSON.stringify(simulatedResult));
        } catch (fallbackError) {
          console.error('Both Perplexity and fallback search failed:', fallbackError);
          res.setHeader('Content-Type', 'application/json');
          return res.status(500).send(JSON.stringify({ 
            message: "All search methods failed",
            details: fallbackError instanceof Error ? fallbackError.message : String(fallbackError),
            error: true
          }));
        }
      }
    } catch (error) {
      console.error('Error in web search route:', error);
      res.setHeader('Content-Type', 'application/json');
      return res.status(500).send(JSON.stringify({ 
        message: "An unexpected error occurred during web search",
        details: error instanceof Error ? error.message : String(error),
        error: true
      }));
    }
  });

  // Location Sharing Routes
  
  // Create a new location share
  apiRouter.post("/location-share", async (req: Request, res: Response) => {
    try {
      // Validate the incoming share data
      const shareData = locationSharingSchema.parse(req.body);
      
      // Create the share and get its ID
      const shareId = createLocationShare(shareData);
      
      // Return the share ID
      res.status(201).json({ 
        shareId, 
        expiresAt: shareData.expires 
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ 
          message: "Invalid location data", 
          details: validationError.message 
        });
      } else {
        console.error('Error creating location share:', error);
        res.status(500).json({ message: "Failed to create location share" });
      }
    }
  });
  
  // Get a location share by ID
  apiRouter.get("/location-share/:shareId", async (req: Request, res: Response) => {
    try {
      const { shareId } = req.params;
      
      // Get the share data
      const shareData = getLocationShare(shareId);
      
      if (!shareData) {
        return res.status(404).json({ 
          message: "Location share not found or expired" 
        });
      }
      
      // Return the share data
      res.json(shareData);
    } catch (error) {
      console.error('Error retrieving location share:', error);
      res.status(500).json({ message: "Failed to retrieve location share" });
    }
  });
  
  // Delete a location share
  apiRouter.delete("/location-share/:shareId", async (req: Request, res: Response) => {
    try {
      const { shareId } = req.params;
      
      // Delete the share
      const deleted = deleteLocationShare(shareId);
      
      if (!deleted) {
        return res.status(404).json({ 
          message: "Location share not found or already deleted" 
        });
      }
      
      // Return success
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting location share:', error);
      res.status(500).json({ message: "Failed to delete location share" });
    }
  });
  
  // Get all active shares (for admin purposes)
  apiRouter.get("/location-shares", async (_req: Request, res: Response) => {
    try {
      // Get all active shares
      const activeShares = getAllActiveShares();
      
      // Return the shares
      res.json({ 
        count: activeShares.length,
        shares: activeShares 
      });
    } catch (error) {
      console.error('Error retrieving active location shares:', error);
      res.status(500).json({ message: "Failed to retrieve active location shares" });
    }
  });

  // STRIPE CHECKOUT ROUTES

  // Get all services
  apiRouter.get("/services", async (_req: Request, res: Response) => {
    try {
      const services = await storage.getServices();
      res.json(services);
    } catch (error) {
      console.error('Error getting services:', error);
      res.status(500).json({ 
        message: "Error getting services",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Get service by id
  apiRouter.get("/services/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid service ID format" });
      }

      const service = await storage.getService(id);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }

      res.json(service);
    } catch (error) {
      console.error('Error getting service:', error);
      res.status(500).json({ 
        message: "Error getting service",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Create service
  apiRouter.post("/services", async (req: Request, res: Response) => {
    try {
      // Validate service data
      const serviceData = insertServiceSchema.parse(req.body);
      
      // Create service
      const service = await storage.createService(serviceData);
      res.status(201).json(service);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error('Error creating service:', error);
        res.status(500).json({ 
          message: "Error creating service",
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
  });

  // Update service
  apiRouter.patch("/services/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid service ID format" });
      }

      // Partial validation of service data
      const serviceData = insertServiceSchema.partial().parse(req.body);
      
      // Update service
      const service = await storage.updateService(id, serviceData);
      res.json(service);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error('Error updating service:', error);
        res.status(500).json({ 
          message: "Error updating service",
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
  });

  // Get user payments
  apiRouter.get("/payments", async (_req: Request, res: Response) => {
    try {
      const payments = await storage.getPayments(MOCK_USER_ID);
      res.json(payments);
    } catch (error) {
      console.error('Error getting payments:', error);
      res.status(500).json({ 
        message: "Error getting payments",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Get payment by id
  apiRouter.get("/payments/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid payment ID format" });
      }

      const payment = await storage.getPayment(id);
      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }

      // Only return payment if it belongs to the user
      if (payment.userId !== MOCK_USER_ID) {
        return res.status(403).json({ message: "Not authorized to view this payment" });
      }

      res.json(payment);
    } catch (error) {
      console.error('Error getting payment:', error);
      res.status(500).json({ 
        message: "Error getting payment",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Create checkout session
  apiRouter.post("/checkout", async (req: Request, res: Response) => {
    try {
      // Check if Stripe is configured
      if (!isStripeConfigured()) {
        return res.status(503).json({ 
          message: "Stripe is not configured. Please add your Stripe API keys."
        });
      }

      // Validate checkout session data
      const checkoutData = checkoutSessionSchema.parse(req.body);
      
      // Create checkout session
      const session = await createCheckoutSession(
        MOCK_USER_ID,
        checkoutData.serviceId,
        checkoutData.successUrl,
        checkoutData.cancelUrl
      );

      res.json(session);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error('Error creating checkout session:', error);
        res.status(500).json({ 
          message: "Error creating checkout session",
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
  });

  // Get payment status
  apiRouter.get("/payment-status/:sessionId", async (req: Request, res: Response) => {
    try {
      const sessionId = req.params.sessionId;
      const status = await getPaymentStatus(sessionId);
      res.json(status);
    } catch (error) {
      console.error('Error getting payment status:', error);
      res.status(500).json({ 
        message: "Error getting payment status",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Get subscription plans
  apiRouter.get("/subscription/plans", async (_req: Request, res: Response) => {
    try {
      // Initialize subscription products in Stripe if not already created
      await initializeSubscriptionProducts();
      res.json(subscriptionPlans);
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      res.status(500).json({ 
        message: "Error fetching subscription plans", 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Create subscription checkout session
  apiRouter.post("/subscription/checkout", async (req: Request, res: Response) => {
    try {
      const { planId, successUrl, cancelUrl } = req.body;
      
      if (!planId || !successUrl || !cancelUrl) {
        return res.status(400).json({ 
          message: "Missing required fields: planId, successUrl, or cancelUrl" 
        });
      }

      if (!isStripeConfigured()) {
        return res.status(503).json({ message: "Stripe payments not available" });
      }
      
      const session = await createSubscriptionCheckout(
        MOCK_USER_ID,
        planId,
        successUrl,
        cancelUrl
      );
      
      res.json(session);
    } catch (error) {
      console.error('Error creating subscription checkout:', error);
      res.status(500).json({ 
        message: "Error creating subscription checkout", 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Start free trial
  apiRouter.post("/subscription/trial", async (_req: Request, res: Response) => {
    try {
      const result = await startTrial(MOCK_USER_ID);
      res.json(result);
    } catch (error) {
      console.error('Error starting trial:', error);
      res.status(500).json({ 
        message: "Error starting trial", 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Get user subscription status
  apiRouter.get("/subscription/status", async (_req: Request, res: Response) => {
    try {
      const status = await getUserSubscriptionStatus(MOCK_USER_ID);
      res.json(status);
    } catch (error) {
      console.error('Error fetching subscription status:', error);
      res.status(500).json({ 
        message: "Error fetching subscription status", 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Check if user has premium access
  apiRouter.get("/subscription/access", async (_req: Request, res: Response) => {
    try {
      const hasPremium = await hasActivePremium(MOCK_USER_ID);
      res.json({ hasPremium });
    } catch (error) {
      console.error('Error checking premium access:', error);
      res.status(500).json({ 
        message: "Error checking premium access", 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Stripe webhook
  app.post("/webhook", express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'];
    
    if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
      return res.status(400).json({ message: "Missing stripe signature or webhook secret" });
    }

    try {
      // Verify webhook signature
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
        apiVersion: '2025-03-31.basil',
      });
      
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
      
      // Handle the event
      let result;
      
      // Check if it's a subscription-related event
      if (event.type.startsWith('customer.subscription.')) {
        result = await handleSubscriptionWebhook(event);
      } else {
        // Handle regular payment events
        result = await handleStripeWebhook(event);
      }
      
      // Return a response
      res.json({ received: true, ...result });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(400).json({ 
        message: "Webhook error",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  app.use("/api", apiRouter);

  const httpServer = createServer(app);
  return httpServer;
}
