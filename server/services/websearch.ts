import axios from 'axios';
import * as cheerio from 'cheerio';
import { log } from '../vite';

interface ScrapedBusiness {
  title: string;
  url: string;
  description: string;
  phone?: string;
  address?: string;
  rating?: string;
  hours?: string[];
  categories?: string[];
  website?: string;
  source: string;
  sourceType: 'search' | 'directory' | 'social';
}

interface WebSearchResult {
  originalQuery: string;
  businesses: ScrapedBusiness[];
  totalResults: number;
  timeTaken: string;
  sources: string[];
}

/**
 * Extracts phone numbers from text using regex
 */
function extractPhoneNumbers(text: string): string[] {
  // This regex matches common US phone number formats
  const phoneRegex = /(\+?1[-\s.]?)?\(?([0-9]{3})\)?[-\s.]?([0-9]{3})[-\s.]?([0-9]{4})/g;
  const matches = text.match(phoneRegex) || [];
  return matches;
}

/**
 * Extracts addresses from text using regex patterns
 */
function extractAddresses(text: string): string[] {
  // This is a simplified pattern that looks for address-like strings
  // A more comprehensive solution would use NLP or a specialized API
  const addressRegex = /\d+\s+[A-Za-z0-9\s,]+(?:Avenue|Ave|Street|St|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Place|Pl|Court|Ct|Highway|Hwy|Parkway|Pkwy)[,.\s]+(?:[A-Za-z\s]+,\s*)?[A-Z]{2}\s+\d{5}(-\d{4})?/g;
  const matches = text.match(addressRegex) || [];
  return matches;
}

/**
 * Searches for businesses using Google Search and scrapes the results
 * 
 * @param query Search query for business
 * @param location Optional location to restrict search to
 * @returns Promise with scraped business data
 */
export async function searchBusinesses(query: string, location?: string): Promise<WebSearchResult> {
  const startTime = new Date();
  let searchQuery = query;
  
  // Add location to query if provided
  if (location) {
    searchQuery += ` in ${location}`;
  }
  
  log(`Performing web search for businesses: "${searchQuery}"`, 'websearch');
  
  try {
    // We'll use multiple sources and combine the results
    const results = await Promise.all([
      scrapeGoogleSearch(searchQuery),
      scrapeYelpLike(searchQuery),
      scrapeBingSearch(searchQuery)
    ]);
    
    // Combine and deduplicate results by URL
    const allBusinesses = results.flat();
    const uniqueBusinesses: ScrapedBusiness[] = [];
    const urlSet = new Set<string>();
    
    for (const business of allBusinesses) {
      if (!urlSet.has(business.url)) {
        urlSet.add(business.url);
        uniqueBusinesses.push(business);
      }
    }
    
    // Sort by relevance (if we had a ranking algorithm)
    const sortedBusinesses = uniqueBusinesses.sort((a, b) => {
      // For now, just prioritize results with phone numbers
      if (a.phone && !b.phone) return -1;
      if (!a.phone && b.phone) return 1;
      return 0;
    });
    
    // Calculate search stats
    const endTime = new Date();
    const timeTaken = ((endTime.getTime() - startTime.getTime()) / 1000).toFixed(2);
    const sourcesSet = new Set<string>();
    sortedBusinesses.forEach(b => sourcesSet.add(b.source));
    const sources = Array.from(sourcesSet);
    
    log(`Web search completed with ${sortedBusinesses.length} results in ${timeTaken}s`, 'websearch');
    
    return {
      originalQuery: query,
      businesses: sortedBusinesses,
      totalResults: sortedBusinesses.length,
      timeTaken: `${timeTaken}s`,
      sources
    };
  } catch (error) {
    log(`Error searching for businesses: ${error}`, 'websearch');
    console.error('Web search error:', error);
    throw new Error(`Failed to search for businesses: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Scrapes Google search results for business information
 */
async function scrapeGoogleSearch(query: string): Promise<ScrapedBusiness[]> {
  try {
    // In a real implementation, we would use a proxy service or API to avoid IP blocks
    // For demonstration, we're using a direct request which might get blocked
    const response = await axios.get(`https://www.google.com/search?q=${encodeURIComponent(query)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });
    
    const $ = cheerio.load(response.data);
    const businesses: ScrapedBusiness[] = [];
    
    // Extract organic search results
    $('.g').each((i, element) => {
      const title = $(element).find('h3').text().trim();
      const url = $(element).find('a').attr('href') || '';
      const description = $(element).find('.VwiC3b').text().trim();
      
      // Skip non-business results
      if (!title || !url) return;
      
      // Extract potential phone numbers and addresses
      const content = $(element).text();
      const phones = extractPhoneNumbers(content);
      const addresses = extractAddresses(content);
      
      businesses.push({
        title,
        url: url.startsWith('/url?q=') ? url.substring(7, url.indexOf('&')) : url,
        description,
        phone: phones.length > 0 ? phones[0] : undefined,
        address: addresses.length > 0 ? addresses[0] : undefined,
        source: 'Google Search',
        sourceType: 'search'
      });
    });
    
    return businesses;
  } catch (error) {
    console.error('Error scraping Google search:', error);
    return []; // Return empty array rather than failing the entire search
  }
}

/**
 * Scrapes Yelp-like directories for business information
 */
async function scrapeYelpLike(query: string): Promise<ScrapedBusiness[]> {
  // In a real implementation, this would scrape actual directory sites
  // For now, we'll return a simulated result
  return [{
    title: `Simulated ${query} from Directory`,
    url: `https://example.com/${encodeURIComponent(query)}`,
    description: `This is a simulated result for ${query} from a business directory.`,
    phone: '(555) 123-4567',
    address: '123 Main St, Anytown, CA 90210',
    rating: '4.5',
    categories: ['Business', 'Service'],
    source: 'Business Directory',
    sourceType: 'directory'
  }];
}

/**
 * Scrapes Bing search results for business information
 */
async function scrapeBingSearch(query: string): Promise<ScrapedBusiness[]> {
  try {
    // As with Google, in a real implementation we would use a proxy or API
    const response = await axios.get(`https://www.bing.com/search?q=${encodeURIComponent(query)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });
    
    const $ = cheerio.load(response.data);
    const businesses: ScrapedBusiness[] = [];
    
    // Extract search results
    $('.b_algo').each((i, element) => {
      const title = $(element).find('h2').text().trim();
      const url = $(element).find('h2 a').attr('href') || '';
      const description = $(element).find('.b_caption p').text().trim();
      
      if (!title || !url) return;
      
      // Extract potential phone numbers and addresses
      const content = $(element).text();
      const phones = extractPhoneNumbers(content);
      const addresses = extractAddresses(content);
      
      businesses.push({
        title,
        url,
        description,
        phone: phones.length > 0 ? phones[0] : undefined,
        address: addresses.length > 0 ? addresses[0] : undefined,
        source: 'Bing Search',
        sourceType: 'search'
      });
    });
    
    return businesses;
  } catch (error) {
    console.error('Error scraping Bing search:', error);
    return []; // Return empty array rather than failing the entire search
  }
}

// Adding a simulated search function that won't get blocked by search engines
// This is for demonstration purposes
export async function simulateBusinessSearch(query: string, location?: string): Promise<WebSearchResult> {
  try {
    const startTime = new Date();
    // Sanitize inputs
    const sanitizedQuery = (query || "").trim();
    let searchQuery = sanitizedQuery;
    
    if (!sanitizedQuery) {
      throw new Error("Query cannot be empty");
    }
    
    if (location) {
      searchQuery += ` in ${location}`;
    }
    
    log(`Performing simulated web search for businesses: "${searchQuery}"`, 'websearch');
    
    // Generate a consistent number of results based on the query
    const numResults = (sanitizedQuery.length + (location?.length || 0)) % 10 + 5;
    const businesses: ScrapedBusiness[] = [];
    
    for (let i = 0; i < numResults; i++) {
      const businessTypes = ['LLC', 'Inc.', 'Services', 'Company', 'Group', 'Associates'];
      const businessType = businessTypes[i % businessTypes.length];
      
      businesses.push({
        title: `${sanitizedQuery} ${businessType} ${i + 1}`,
        url: `https://example.com/${encodeURIComponent(sanitizedQuery.toLowerCase().replace(/\s+/g, '-'))}-${i + 1}`,
        description: `${sanitizedQuery} ${businessType} offers professional services in ${location || 'your area'}. Contact us for more information about our services and rates.`,
        phone: `(555) ${String(i * 111 + 100).padStart(3, '0')}-${String(i * 1234 % 10000).padStart(4, '0')}`,
        address: `${i * 100 + 123} Main St, ${location || 'Anytown'}, CA ${90000 + i * 10}`,
        rating: `${(i % 5) + 1}.${i % 10}`,
        hours: [
          'Monday: 9:00 AM - 5:00 PM',
          'Tuesday: 9:00 AM - 5:00 PM',
          'Wednesday: 9:00 AM - 5:00 PM',
          'Thursday: 9:00 AM - 5:00 PM',
          'Friday: 9:00 AM - 5:00 PM',
          'Saturday: ' + (i % 2 === 0 ? '10:00 AM - 3:00 PM' : 'Closed'),
          'Sunday: Closed'
        ],
        categories: [sanitizedQuery, businessType, 'Service Provider'],
        website: `https://www.${sanitizedQuery.toLowerCase().replace(/\s+/g, '')}-${i + 1}.com`,
        source: i % 3 === 0 ? 'Google Search' : (i % 3 === 1 ? 'Bing Search' : 'Business Directory'),
        sourceType: i % 3 === 2 ? 'directory' : 'search'
      });
    }
    
    // Add some random "social" results
    businesses.push({
      title: `${sanitizedQuery} Community Page`,
      url: `https://facebook.com/${encodeURIComponent(sanitizedQuery.toLowerCase().replace(/\s+/g, ''))}`,
      description: `Community page for ${sanitizedQuery} professionals in ${location || 'the area'}.`,
      source: 'Facebook',
      sourceType: 'social'
    });
    
    // Sort by simulated relevance
    const sortedBusinesses = businesses.sort((a, b) => {
      if (a.rating && b.rating) {
        return parseFloat(b.rating) - parseFloat(a.rating);
      }
      return 0;
    });
    
    const endTime = new Date();
    const timeTaken = ((endTime.getTime() - startTime.getTime()) / 1000).toFixed(2);
    
    // Add a small delay to simulate network latency
    await new Promise(resolve => setTimeout(resolve, 500));
    
    log(`Simulated web search completed with ${sortedBusinesses.length} results in ${timeTaken}s`, 'websearch');
    
    // Calculate sources list
    const sourcesSet = new Set<string>();
    sortedBusinesses.forEach(b => sourcesSet.add(b.source));
    const sources = Array.from(sourcesSet);
    
    // Validate the result object before returning
    const result: WebSearchResult = {
      originalQuery: sanitizedQuery,
      businesses: sortedBusinesses,
      totalResults: sortedBusinesses.length,
      timeTaken: `${timeTaken}s`,
      sources
    };
    
    // Make sure the result is serializable
    try {
      JSON.stringify(result);
    } catch (jsonError) {
      log(`Error serializing search result: ${jsonError}`, 'websearch');
      throw new Error("Generated results could not be serialized to JSON");
    }
    
    return result;
  } catch (error) {
    log(`Error in simulateBusinessSearch: ${error}`, 'websearch');
    console.error("Error generating simulated business search results:", error);
    // Throw a clean error that can be caught and handled by the route handler
    throw new Error(error instanceof Error ? error.message : "Failed to simulate business search");
  }
}