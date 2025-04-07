import { useState } from 'react';
import { PerplexityResult } from '@shared/schema';

interface UsePerplexitySearchReturn {
  isSearching: boolean;
  error: string | null;
  perplexityData: PerplexityResult | null;
  search: (query: string, location?: string) => Promise<PerplexityResult | null>;
}

export function usePerplexitySearch(): UsePerplexitySearchReturn {
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [perplexityData, setPerplexityData] = useState<PerplexityResult | null>(null);

  const search = async (query: string, location?: string): Promise<PerplexityResult | null> => {
    if (!query.trim()) {
      setError('Please enter a search query');
      return null;
    }

    setIsSearching(true);
    setError(null);
    
    try {
      console.log('Performing Perplexity search with query:', query, 'location:', location);
      
      const url = new URL('/api/perplexity', window.location.origin);
      url.searchParams.append('query', query);
      if (location) {
        url.searchParams.append('location', location);
      }
      
      const response = await fetch(url.toString(), {
        method: 'GET',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to search: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json() as PerplexityResult;
      console.log('Perplexity search result:', result);
      
      // Dispatch event to notify components that results are available
      const event = new CustomEvent('perplexity-results-available');
      window.dispatchEvent(event);
      
      setPerplexityData(result);
      return result;
    } catch (err) {
      console.error('Perplexity search error:', err);
      setError(err instanceof Error ? err.message : 'Failed to perform AI search');
      return null;
    } finally {
      setIsSearching(false);
    }
  };

  return {
    isSearching,
    error,
    perplexityData,
    search,
  };
}