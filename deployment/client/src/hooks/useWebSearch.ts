import { useState, useCallback } from 'react';
import { WebSearchResult, ScrapedBusiness } from '@shared/schema';

interface UseWebSearchReturn {
  searchResults: WebSearchResult | null;
  isSearching: boolean;
  error: string | null;
  search: (query: string, params?: { location?: string, radius?: number }) => Promise<void>;
}

export function useWebSearch(): UseWebSearchReturn {
  const [searchResults, setSearchResults] = useState<WebSearchResult | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string, params?: { location?: string, radius?: number }) => {
    if (!query.trim()) {
      setError('Please provide a search query');
      return;
    }

    console.log("Web search initiated with query:", query);
    console.time("totalSearchTime");
    setIsSearching(true);
    setError(null);
    
    try {
      // Make sure query includes "tow truck" if not already present
      const searchQuery = query.toLowerCase().includes('tow truck') 
        ? query 
        : `tow truck ${query}`;
        
      // Build the query parameters
      const urlParams = new URLSearchParams();
      urlParams.append('query', searchQuery);
      
      // Add location if provided
      if (params?.location) {
        urlParams.append('location', params.location);
        console.log(`Location parameter: ${params.location}`);
      }
      
      // Add radius if provided (convert miles to meters for the API)
      if (params?.radius) {
        // Convert miles to meters (1 mile = 1609.34 meters)
        const radiusInMeters = Math.round(params.radius * 1609.34);
        urlParams.append('radius', radiusInMeters.toString());
        console.log(`Radius parameter: ${params.radius} miles (${radiusInMeters} meters)`);
      }
      
      console.log(`Making request to /api/websearch with query: "${searchQuery}" in ${params?.location || 'any location'} with radius ${params?.radius || 'default'} miles`);
      
      // Make the API request
      console.time("apiCallTime");
      const response = await fetch(`/api/websearch?${urlParams.toString()}`);
      console.timeEnd("apiCallTime");
      
      // Check if response is OK
      if (!response.ok) {
        console.warn(`API response not OK: ${response.status} ${response.statusText}`);
        const contentType = response.headers.get('content-type');
        
        // Try to parse error message if available
        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await response.json();
            throw new Error(errorData.message || `Search failed: ${response.statusText}`);
          } catch (jsonError) {
            // If JSON parsing fails, fall back to status text
            console.error("Failed to parse error JSON:", jsonError);
            throw new Error(`Search failed: ${response.statusText}`);
          }
        } else {
          // Not JSON, just use status text
          throw new Error(`Search failed: ${response.statusText}`);
        }
      }
      
      // Get the raw text first for debugging
      console.time("responseParsingTime");
      const rawText = await response.text();
      
      // Log the response headers and status
      console.log('Response status:', response.status);
      console.log('Response content type:', response.headers.get('content-type'));
      
      // Try to parse the JSON
      let data;
      try {
        data = JSON.parse(rawText);
        console.log('Parsed JSON data successfully');
      } catch (jsonError) {
        console.error('Error parsing JSON response:', jsonError);
        console.log('Raw response first 500 chars:', rawText.substring(0, 500));
        throw new Error('The server returned invalid data. Please try again later.');
      }
      console.timeEnd("responseParsingTime");
      
      // Validate response structure
      if (!data) {
        console.error('Empty response data');
        throw new Error('The server returned an empty response.');
      }
      
      if (data.error) {
        console.error('Error response from server:', data);
        throw new Error(data.message || 'Server error during search');
      }
      
      // Check businesses array
      if (!Array.isArray(data.businesses)) {
        console.error('Invalid response format (businesses not an array):', data);
        throw new Error('The server returned an unexpected response format.');
      }
      
      console.log(`Web search returned ${data.businesses.length} results from ${data.sources ? data.sources.length : 'unknown'} sources`);
      
      // Log some details about the results
      if (data.businesses.length > 0) {
        console.log('Sample business data:', {
          title: data.businesses[0].title,
          hasPhone: !!data.businesses[0].phone,
          hasAddress: !!data.businesses[0].address,
          hasWebsite: !!data.businesses[0].website,
          categoriesCount: data.businesses[0].categories?.length || 0
        });
      }
      
      setSearchResults(data);
    } catch (error) {
      console.error('Error during web search:', error);
      setError(error instanceof Error ? error.message : 'Failed to perform search');
      setSearchResults(null);
    } finally {
      setIsSearching(false);
      console.timeEnd("totalSearchTime");
    }
  }, []);

  return {
    searchResults,
    isSearching,
    error,
    search
  };
}