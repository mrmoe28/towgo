import { useState, useCallback } from 'react';
import { Location } from '../types';
import { 
  searchSmitheryLocations, 
  getSmitheryLocationDetails, 
  SmitheryLocation, 
  SmitheryLocationDetails 
} from '../lib/smithery';

interface UseSmitherySearchReturn {
  smitheryLocations: SmitheryLocation[];
  selectedLocation: SmitheryLocationDetails | null;
  isSearching: boolean;
  error: string | null;
  search: (query: string, latitude: number, longitude: number, radius?: number) => Promise<void>;
  getLocationDetails: (locationId: string) => Promise<void>;
  clearSelectedLocation: () => void;
}

export function useSmitherySearch(): UseSmitherySearchReturn {
  const [smitheryLocations, setSmitheryLocations] = useState<SmitheryLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<SmitheryLocationDetails | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Search for smithery locations
  const search = useCallback(async (
    query: string,
    latitude: number,
    longitude: number,
    radius: number = 10
  ) => {
    setIsSearching(true);
    setError(null);
    
    try {
      console.log(`Searching for smithery locations: ${query} at ${latitude},${longitude}`);
      const response = await searchSmitheryLocations(query, latitude, longitude, radius);
      
      if (response && response.results) {
        console.log(`Found ${response.results.length} smithery locations`);
        setSmitheryLocations(response.results);
      } else {
        console.log('No smithery locations found or invalid response');
        setSmitheryLocations([]);
      }
    } catch (error) {
      console.error('Error searching smithery locations:', error);
      setError(error instanceof Error ? error.message : 'Failed to search smithery locations');
      setSmitheryLocations([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Get details for a specific location
  const getLocationDetails = useCallback(async (locationId: string) => {
    setIsSearching(true);
    setError(null);
    
    try {
      console.log(`Getting details for smithery location: ${locationId}`);
      const details = await getSmitheryLocationDetails(locationId);
      
      if (details) {
        console.log('Smithery location details retrieved successfully');
        setSelectedLocation(details);
      } else {
        console.log('Invalid location details response');
        setError('Failed to get location details');
      }
    } catch (error) {
      console.error('Error getting smithery location details:', error);
      setError(error instanceof Error ? error.message : 'Failed to get location details');
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Clear selected location
  const clearSelectedLocation = useCallback(() => {
    setSelectedLocation(null);
  }, []);

  return {
    smitheryLocations,
    selectedLocation,
    isSearching,
    error,
    search,
    getLocationDetails,
    clearSelectedLocation
  };
}