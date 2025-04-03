import axios from 'axios';
import { log } from '../vite';
import { PerplexityCitation, PerplexityResult } from '@shared/schema';

// API configuration
const API_URL = 'https://api.perplexity.ai/chat/completions';
const API_KEY = process.env.PERPLEXITY_API_KEY;

// Log warning if API key is missing
if (!API_KEY) {
  log('Warning: PERPLEXITY_API_KEY environment variable is not set. AI-enhanced search features will be limited.', 'perplexity');
} else {
  log('Perplexity API key is configured - AI features are available', 'perplexity');
}

// Define interfaces for Perplexity API
interface PerplexityMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface PerplexityResponse {
  id: string;
  model: string;
  created: number;
  citations?: string[];
  choices: {
    message: PerplexityMessage;
    finish_reason: string;
    index: number;
  }[];
}

/**
 * Enhanced search service using Perplexity AI
 * 
 * @param query User's search query
 * @param locationContext Optional location context to improve search relevance
 * @returns PerplexityResult object with enhanced query and citations
 */
export async function enhanceSearchQuery(query: string, locationContext?: string): Promise<PerplexityResult> {
  // Return original query if API key is not available
  if (!API_KEY) {
    log('Skipping search enhancement: No API key available', 'perplexity');
    return {
      originalQuery: query,
      enhancedQuery: query,
      isEnhanced: false
    };
  }
  
  try {
    const messages: PerplexityMessage[] = [
      {
        role: 'system',
        content: 'You are a business search specialist for a location-based business search application. ' +
                'Your task is to refine user queries to improve search relevance by using real-time web search. ' +
                'Focus on finding accurate, location-specific information about businesses that will yield results in Google Maps. ' +
                'For each search query: ' +
                '1. Identify the specific business category or type in the query ' +
                '2. Research current business information and terminology used for this type of business ' +
                '3. Format the query to work optimally with map-based search systems ' +
                '4. Consider common features that users might be looking for with this business type ' +
                '5. If the query is too generic, make it more specific with popular features ' +
                'You MUST search the web to find the most accurate business information. ' +
                'Format your response as a precise search query that would work in Google Maps. ' +
                'For example, transform "coffee" into "coffee shops with wifi", "pharmacy" into "24-hour pharmacy with prescription delivery", or "entertainment" into "family entertainment centers with arcade games". ' + 
                'DO NOT include explanations or JSON formatting. Your answer should be ONLY the optimized search query text.'
      },
      {
        role: 'user',
        content: `Refine this search query: "${query}"${locationContext ? ` near ${locationContext}` : ''}`
      }
    ];

    console.log('Calling Perplexity API with messages:', JSON.stringify(messages, null, 2));
    
    // Print out API key status (not the key itself)
    console.log(`API_KEY status: ${API_KEY ? 'exists' : 'missing'}`);
    
    // Prepare the request payload
    const requestPayload = {
      model: 'llama-3.1-sonar-large-128k-online', // Upgrade to large model for better results
      messages: messages,
      max_tokens: 150,
      temperature: 0.1, // Lower temperature for more focused results
      // Enable web search
      search_domain_filter: [],
      search_recency_filter: "day", // Get recent results
      top_p: 0.95,
      frequency_penalty: 0,
      presence_penalty: 0
    };
    
    console.log('Request payload:', JSON.stringify(requestPayload, null, 2));
    
    // Make the API call
    const response = await axios.post<PerplexityResponse>(
      API_URL,
      requestPayload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        }
      }
    );
    
    console.log('Perplexity API response:', JSON.stringify(response.data, null, 2));

    const enhancedQuery = response.data.choices[0].message.content.trim();
    
    // Process citations if available
    const citations: PerplexityCitation[] = [];
    if (response.data.citations && response.data.citations.length > 0) {
      response.data.citations.forEach(url => {
        citations.push({
          url,
          title: url.split('/').pop() || url
        });
      });
    }

    return {
      originalQuery: query,
      enhancedQuery: enhancedQuery,
      isEnhanced: enhancedQuery !== query,
      citations: citations.length > 0 ? citations : undefined
    };
  } catch (error) {
    console.error('Perplexity API error details:', error);
    
    if (axios.isAxiosError(error)) {
      console.error('Axios error response:', error.response?.data);
      console.error('Axios error status:', error.response?.status);
      console.error('Axios error headers:', error.response?.headers);
    }
    
    log(`Perplexity API error: ${error instanceof Error ? error.message : String(error)}`, 'perplexity');
    // Return the original query if there's an error
    return {
      originalQuery: query,
      enhancedQuery: query,
      isEnhanced: false
    };
  }
}

/**
 * Generate business recommendations based on user preferences
 * 
 * @param userPreferences User preferences and past searches
 * @param currentLocation Current user location
 * @returns List of recommended business types
 */
export async function generateRecommendations(
  userPreferences: string[], 
  currentLocation?: string
): Promise<string[]> {
  // Return default recommendations if API key is not available
  if (!API_KEY) {
    log('Skipping recommendations generation: No API key available', 'perplexity');
    return ['Coffee Shops', 'Local Restaurants', 'Shopping Centers', 'Entertainment Venues', 'Outdoor Activities'];
  }
  
  // Return default recommendations if no preferences are provided
  if (userPreferences.length === 0) {
    return ['Coffee Shops', 'Local Restaurants', 'Shopping Centers', 'Entertainment Venues', 'Outdoor Activities'];
  }
  
  try {
    const preferencesText = userPreferences.join(', ');
    
    const messages: PerplexityMessage[] = [
      {
        role: 'system',
        content: 'You are a local business expert for a location-based discovery app focused on Rite Aid customers. ' +
                'Your task is to suggest business categories that are both practical and interesting, with an emphasis on health, wellness, and everyday needs. ' +
                'Use web search to research what types of businesses are popular and available in the user\'s specific location. ' +
                'Consider the following when making recommendations: ' +
                '1. Businesses that complement pharmacy visits (health services, medical specialists) ' +
                '2. Everyday essentials (grocery stores, convenience shops) ' +
                '3. Quick service options (restaurants, coffee shops) ' +
                '4. Specialty services based on local trends and availability ' +
                '5. Seasonal businesses relevant to the current time of year ' +
                'Return ONLY a JSON array of 5 specific business categories, formatted as search terms that would work well in Google Maps. ' +
                'Each recommendation should be concise (1-4 words) but specific enough to yield relevant results in a map search. ' +
                'For example: ["Urgent Care Centers", "Healthy Meal Prep", "Coffee Shops", "Physical Therapy", "Organic Markets"]'
      },
      {
        role: 'user',
        content: `Based on these user preferences: ${preferencesText}, ` +
                `${currentLocation ? `near ${currentLocation}, ` : ''}` +
                'suggest 5 business types they might be interested in. ' +
                'Respond with only a JSON array of business type strings.'
      }
    ];

    console.log('Calling Perplexity recommendations with messages:', JSON.stringify(messages, null, 2));
    
    // Print out API key status (not the key itself)
    console.log(`Recommendations API_KEY status: ${API_KEY ? 'exists' : 'missing'}`);
    
    // Prepare the request payload
    const requestPayload = {
      model: 'llama-3.1-sonar-large-128k-online', // Upgrade to large model for better results
      messages: messages,
      max_tokens: 200,
      temperature: 0.1, // Lower temperature for more focused results
      // Enable web search
      search_domain_filter: [],
      search_recency_filter: "day", // Get recent results
      top_p: 0.95,
      frequency_penalty: 0,
      presence_penalty: 0
    };
    
    console.log('Recommendations request payload:', JSON.stringify(requestPayload, null, 2));
    
    // Make the API call
    const response = await axios.post<PerplexityResponse>(
      API_URL,
      requestPayload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        }
      }
    );
    
    console.log('Perplexity recommendations response:', JSON.stringify(response.data, null, 2));

    // Extract the JSON array from the response
    const content = response.data.choices[0].message.content.trim();
    try {
      // Try to parse the whole content as JSON first
      try {
        return JSON.parse(content);
      } catch {
        // If that fails, try to extract a JSON array
        const startIndex = content.indexOf('[');
        const endIndex = content.lastIndexOf(']');
        
        if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
          const jsonArrayString = content.substring(startIndex, endIndex + 1);
          return JSON.parse(jsonArrayString);
        }
        // If we can't extract an array, return an empty array
        return [];
      }
    } catch (parseError) {
      log(`Error parsing recommendations JSON: ${parseError instanceof Error ? parseError.message : String(parseError)}`, 'perplexity');
      return [];
    }
  } catch (error) {
    console.error('Perplexity recommendations API error details:', error);
    
    if (axios.isAxiosError(error)) {
      console.error('Axios error response:', error.response?.data);
      console.error('Axios error status:', error.response?.status);
      console.error('Axios error headers:', error.response?.headers);
    }
    
    log(`Perplexity API error in recommendations: ${error instanceof Error ? error.message : String(error)}`, 'perplexity');
    return ['Coffee Shops', 'Local Restaurants', 'Shopping Centers', 'Entertainment Venues', 'Outdoor Activities']; // Return default recommendations on error
  }
}