import passport from 'passport';
import { Strategy as GoogleStrategy, StrategyProfile as GoogleProfile } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy, StrategyProfile as GitHubProfile } from 'passport-github2';
import { Strategy as LocalStrategy } from 'passport-local';
import { storage } from '../storage';
import { User, InsertUser } from '@shared/schema';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

// Load environment variables
dotenv.config();

// Configure Passport authentication strategies
export function configurePassport() {
  // Serial/deserialize user functions
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  // Local strategy (username/password)
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        
        if (!user) {
          return done(null, false, { message: 'Incorrect username' });
        }
        
        // Check password using bcrypt
        if (!user.password) {
          return done(null, false, { message: 'Password not set for this account' });
        }
        
        // TypeScript type guard
        const userPassword: string = user.password;
        const isMatch = await bcrypt.compare(password, userPassword);
        
        if (!isMatch) {
          return done(null, false, { message: 'Incorrect password' });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );

  // Google OAuth strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    // Get the Replit domain or use fallback for local development
    const domain = process.env.REPLIT_DOMAINS || 'localhost:5000';
    const protocol = process.env.REPLIT_DOMAINS ? 'https' : 'http';
    const googleCallbackURL = `${protocol}://${domain}/auth/google/callback`;
    
    // Enhanced debugging for Google OAuth
    console.log("Google OAuth configuration:");
    console.log(`- Client ID: ${process.env.GOOGLE_CLIENT_ID.substring(0, 8)}...${process.env.GOOGLE_CLIENT_ID.substring(process.env.GOOGLE_CLIENT_ID.length - 4)}`);
    console.log(`- Client Secret: ${process.env.GOOGLE_CLIENT_SECRET ? "Configured (hidden)" : "Not configured"}`);
    console.log(`- Callback URL: ${googleCallbackURL}`);
    console.log(`- Environment: ${process.env.NODE_ENV || 'Not set'}`);
    console.log(`- Host platform: ${process.env.REPLIT_DOMAINS ? 'Replit' : 'Local development'}`);
    
    // Validate Google OAuth credentials format
    const clientIdValid = /^\d+-[a-zA-Z0-9]+\.apps\.googleusercontent\.com$/.test(process.env.GOOGLE_CLIENT_ID);
    if (!clientIdValid) {
      console.warn("WARNING: Google Client ID may be invalid - it should have format like '123456789-abcdef.apps.googleusercontent.com'");
    } else {
      console.log("- Client ID format appears valid");
    }
    
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: googleCallbackURL,
          proxy: true
        },
        async (accessToken: string, refreshToken: string, profile: GoogleProfile, done) => {
          console.log('Google OAuth profile received:');
          
          // Validate profile data
          if (!profile || !profile.id) {
            console.error('Invalid Google profile received:', profile);
            return done(new Error('Invalid profile data received from Google'));
          }
          
          // Enhanced logging with more detailed profile data
          console.log('Profile details:', {
            id: profile.id,
            displayName: profile.displayName || 'Not provided',
            name: profile._json?.name || 'Not available',
            emails: profile.emails ? profile.emails.map(e => e.value).join(', ') : 'No emails',
            photos: profile.photos ? `${profile.photos.length} photos available` : 'No photos',
            locale: profile._json?.locale || 'Not available'
          });
          
          try {
            // Enhanced error checking and logging
            if (!profile.id) {
              throw new Error('No profile ID provided by Google');
            }
            
            // Check if user exists by provider ID and provider user ID
            console.log(`Searching for user with Google ID: ${profile.id}`);
            const existingUser = await findUserByProvider('google', profile.id);
            
            if (existingUser) {
              console.log('Existing Google user found:', {
                userId: existingUser.id,
                username: existingUser.username,
                email: existingUser.email,
                displayName: existingUser.displayName
              });
              
              // Update user information if needed (e.g., profile picture)
              // This can be implemented if needed
              
              return done(null, existingUser);
            }
            
            console.log('No existing user found, creating new user for Google account');
            
            // Handle potential email conflicts
            const email = profile.emails?.[0]?.value;
            if (email) {
              const existingEmailUser = await storage.getUserByEmail(email);
              if (existingEmailUser) {
                console.log(`User with email ${email} already exists, linking Google account`);
                // Here you could implement account linking if desired
              }
            }
            
            // Create new user with improved default values
            const newUser: InsertUser = {
              username: profile.emails?.[0]?.value || `google_${profile.id.substring(0, 8)}`,
              email: profile.emails?.[0]?.value || null,
              displayName: profile.displayName || profile._json?.name || `Google User ${profile.id.substring(0, 6)}`,
              providerId: 'google',
              providerUserId: profile.id,
              avatar: profile.photos?.[0]?.value || null,
              subscriptionTier: 'free'
            };
            
            console.log('Creating user with data:', {
              username: newUser.username,
              email: newUser.email,
              displayName: newUser.displayName,
              providerId: newUser.providerId
            });
            
            const createdUser = await storage.createUser(newUser);
            console.log('Successfully created new user:', {
              id: createdUser.id,
              username: createdUser.username,
              email: createdUser.email
            });
            
            return done(null, createdUser);
          } catch (error) {
            console.error('Error in Google OAuth callback:', error);
            return done(error);
          }
        }
      )
    );
  }

  // GitHub OAuth strategy
  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    const githubCallbackURL = process.env.REPLIT_DOMAINS ? 
      `https://${process.env.REPLIT_DOMAINS}/auth/github/callback` : 
      '/auth/github/callback';
    
    console.log("GitHub OAuth configured with client ID:", process.env.GITHUB_CLIENT_ID.substring(0, 5) + "...");
    console.log("GitHub OAuth callback URL:", githubCallbackURL);
    
    passport.use(
      new GitHubStrategy(
        {
          clientID: process.env.GITHUB_CLIENT_ID,
          clientSecret: process.env.GITHUB_CLIENT_SECRET,
          callbackURL: githubCallbackURL,
          // Add proxy to true to help with Replit environment
          proxy: true
        },
        async (accessToken: string, refreshToken: string, profile: GitHubProfile, done) => {
          try {
            // Check if user exists by provider ID and provider user ID
            const existingUser = await findUserByProvider('github', profile.id);
            
            if (existingUser) {
              return done(null, existingUser);
            }
            
            // Create new user
            const newUser: InsertUser = {
              username: profile.username || `github_${profile.id}`,
              email: profile.emails?.[0]?.value || null,
              displayName: profile.displayName || null,
              providerId: 'github',
              providerUserId: profile.id,
              avatar: profile.photos?.[0]?.value || null,
              subscriptionTier: 'free'
            };
            
            const createdUser = await storage.createUser(newUser);
            return done(null, createdUser);
          } catch (error) {
            return done(error);
          }
        }
      )
    );
  }
}

// Helper function to find a user by provider and provider user ID
async function findUserByProvider(providerId: string, providerUserId: string): Promise<User | undefined> {
  return storage.getUserByProvider(providerId, providerUserId);
}

// Add helper functions for auth-related operations
export function ensureAuthenticated(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Not authenticated' });
}

export function getCurrentUser(req: any): User | undefined {
  return req.user;
}