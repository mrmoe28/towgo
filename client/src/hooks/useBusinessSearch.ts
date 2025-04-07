import { useState, useCallback } from 'react';
import { Business, SearchParams, PerplexityCitation, PerplexityResult } from '@shared/schema';
import { Location, SortOption } from '../types';
import { searchNearbyPlaces } from '../lib/places';

interface UseBusinessSearchReturn {
  businesses: Business[];
  isSearching: boolean;
  error: string | null;
  currentLocation: Location | null;
  searchRadius: number;
  sortBy: SortOption;
  search: (params: { location?: string, latitude?: number, longitude?: number, radius: number, businessType?: string }) => Promise<void>;
  sortBusinesses: (sortBy: SortOption) => void;
  enhancedSearch: PerplexityResult | null;
}

export function useBusinessSearch(): UseBusinessSearchReturn {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [searchRadius, setSearchRadius] = useState(5000); // Default to 5km
  const [sortBy, setSortBy] = useState<SortOption>('distance');
  const [enhancedSearch, setEnhancedSearch] = useState<PerplexityResult | null>(null);

  const search = useCallback(async (params: { 
    location?: string, 
    latitude?: number, 
    longitude?: number, 
    radius: number,
    businessType?: string
  }) => {
    setIsSearching(true);
    setError(null);
    
    try {
      // Log parameters for debugging
      console.log('Starting business search with params:', {
        location: params.location,
        coordinates: params.latitude && params.longitude ? 
          `${params.latitude.toFixed(5)}, ${params.longitude.toFixed(5)}` : 'none',
        radius: params.radius,
        businessType: params.businessType || 'none'
      });
      
      // Set search radius in meters (convert from miles)
      const radiusInMeters = params.radius * 1609.34;
      setSearchRadius(radiusInMeters);
      
      // Update location state if coordinates provided
      if (params.latitude && params.longitude) {
        setCurrentLocation({ lat: params.latitude, lng: params.longitude });
      }

      // Prepare search parameters
      const searchParams: SearchParams = {
        radius: radiusInMeters,
        sortBy,
      };
      
      // Add optional parameters if provided
      if (params.businessType) {
        searchParams.businessType = params.businessType;
      }
      
      if (params.location) {
        searchParams.location = params.location;
      } else if (params.latitude && params.longitude) {
        searchParams.latitude = params.latitude;
        searchParams.longitude = params.longitude;
      } else {
        throw new Error('A location or coordinates are required');
      }

      // Clear current businesses to show loading state immediately
      setBusinesses([]);
      
      // Use Promise.all for parallel execution and minimum perceived loading time
      const [response] = await Promise.all([
        searchNearbyPlaces(searchParams),
        // Small delay ensures loading indicators are visible for better UX
        new Promise(resolve => setTimeout(resolve, 300))
      ]);
      
      // Performance optimization for large result sets
      const results = response.results;
      if (results.length > 20) {
        // Show first batch immediately for faster initial display
        const initialBatch = results.slice(0, 10);
        setBusinesses(initialBatch);
        
        // Load remaining results after a short delay to keep UI responsive
        setTimeout(() => {
          setBusinesses(results);
        }, 50);
      } else {
        setBusinesses(results);
      }
      
      // Process and update enhanced search data if available
      if (response.isEnhanced || response.citations) {
        const perplexityData = {
          originalQuery: response.originalQuery || '',
          enhancedQuery: response.enhancedQuery || '',
          isEnhanced: response.isEnhanced || false,
          citations: response.citations || []
        };
        
        setEnhancedSearch(perplexityData);
        
        // Show Perplexity panel if there are citations
        if (perplexityData.citations?.length > 0) {
          window.dispatchEvent(new CustomEvent('perplexity-results-available'));
        }
      } else {
        setEnhancedSearch(null);
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during search';
      console.error('Search error:', errorMessage, err);
      setError(errorMessage);
    } finally {
      setIsSearching(false);
      console.log('Search completed');
    }
  }, [sortBy]);

  const sortBusinesses = useCallback((newSortBy: SortOption) => {
    setSortBy(newSortBy);
    
    const sortedBusinesses = [...businesses];
    
    switch (newSortBy) {
      case 'distance':
        sortedBusinesses.sort((a, b) => (a.distance || 0) - (b.distance || 0));
        break;
      case 'relevance':
        // In a real app, this would sort by relevance score from the API
        // For now, we'll keep the original order which is usually relevance
        break;
      case 'category':
        sortedBusinesses.sort((a, b) => {
          const catA = a.category || '';
          const catB = b.category || '';
          return catA.localeCompare(catB);
        });
        break;
    }
    
    setBusinesses(sortedBusinesses);
  }, [businesses]);

  return {
    businesses,
    isSearching,
    error,
    currentLocation,
    searchRadius,
    sortBy,
    search,
    sortBusinesses,
    enhancedSearch
  };
}
