import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { useSettings } from '@/hooks/useSettings';
import { SearchBarProps } from '@/types';
import { getCurrentLocation } from '@/lib/maps';
import { MapPin, Search } from 'lucide-react';

export default function SearchBar({ onSearch, isSearching }: SearchBarProps) {
  const { settings } = useSettings();
  const [locationInput, setLocationInput] = useState('');
  const [businessTypeInput, setBusinessTypeInput] = useState('');
  const [searchRadius, setSearchRadius] = useState(settings.defaultRadius);
  const [locationError, setLocationError] = useState('');
  const [isPerformingSearch, setIsPerformingSearch] = useState(false);

  // Reset error when inputs change
  useEffect(() => {
    if (locationError) {
      setLocationError('');
    }
  }, [locationInput, businessTypeInput, searchRadius, locationError]);

  const handleCurrentLocation = useCallback(async () => {
    // Reset any previous errors
    setLocationError('');
    
    // Don't allow concurrent searches
    if (isPerformingSearch || isSearching) {
      console.log('Search already in progress, ignoring request');
      return false;
    }
    
    try {
      setIsPerformingSearch(true);
      console.log('Getting current location...');
      
      // Use default fallback location if geolocation fails
      const location = await getCurrentLocation(true);
      const queryType = businessTypeInput.trim();
      
      // Log key parameters for debugging
      console.log('Search with location:', {
        radius: searchRadius,
        location: `${location.lat}, ${location.lng}`,
        businessType: queryType || 'undefined'
      });
      
      await onSearch({
        radius: searchRadius,
        latitude: location.lat,
        longitude: location.lng,
        businessType: queryType || undefined
      });
      
      // Return successfully to indicate we were able to use location
      return true;
    } catch (error) {
      setLocationError(error instanceof Error ? error.message : 'Failed to get location');
      console.error('Error getting location:', error);
      // Don't re-throw, just return false to indicate failure
      return false;
    } finally {
      setIsPerformingSearch(false);
    }
  }, [onSearch, searchRadius, businessTypeInput, isSearching, isPerformingSearch]);

  const handleSearch = useCallback(async () => {
    // Don't allow concurrent searches
    if (isPerformingSearch || isSearching) {
      console.log('Search already in progress, ignoring request');
      return;
    }
    
    // Reset any previous errors
    setLocationError('');
    setIsPerformingSearch(true);
    console.log('Search button clicked');
    
    // Get the business type
    const queryType = businessTypeInput.trim();
    
    if (!queryType) {
      setLocationError('Please enter a business type to search for');
      setIsPerformingSearch(false);
      return;
    }
    
    try {
      // Get business type from input
      if (locationInput.trim()) {
        // If we have a manually entered location, use that
        await onSearch({
          location: locationInput.trim(),
          radius: searchRadius,
          businessType: queryType
        });
        console.log("Search completed with manually entered location");
        return;
      }
      
      // If no manual location, try to get device location with fallback
      try {
        const location = await getCurrentLocation(true);
        
        await onSearch({
          radius: searchRadius,
          latitude: location.lat,
          longitude: location.lng,
          businessType: queryType
        });
        
        console.log("Search completed with location");
        return;
      } catch (locationError) {
        console.error("Location search failed completely", locationError);
        // This shouldn't happen with fallback, but just in case
        throw new Error('Unable to determine location. Please enter an address to search.');
      }
    } catch (error) {
      console.error('Search failed:', error);
      setLocationError(error instanceof Error ? error.message : 'Search failed. Please try again.');
    } finally {
      setIsPerformingSearch(false);
    }
  }, [locationInput, businessTypeInput, searchRadius, onSearch, isSearching, isPerformingSearch]);

  const handleRadiusChange = useCallback((value: number[]) => {
    setSearchRadius(value[0]);
  }, []);

  return (
    <div className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-5">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <div className="grid grid-cols-1 gap-4">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-5 w-5 text-primary" />
                </span>
                <Input
                  type="text"
                  id="business-type-input"
                  placeholder="What are you looking for? (restaurants, pharmacies, coffee shops, etc.)"
                  className="w-full pl-10 pr-10 text-lg py-6 border-2 border-primary-light focus:border-primary"
                  value={businessTypeInput}
                  onChange={(e) => setBusinessTypeInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button 
                  className="absolute inset-y-0 right-0 flex items-center pr-3 bg-primary text-white px-3 mr-2 my-2 rounded-md hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleCurrentLocation}
                  disabled={isSearching || isPerformingSearch}
                  title="Search using your current location"
                >
                  <MapPin className="h-5 w-5 mr-1" />
                  <span className="hidden sm:inline">Current Location</span>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div className="relative">
                  <label htmlFor="location-input" className="text-sm text-neutral-dark font-medium mb-1 block">Optional Address (current location used by default)</label>
                  <Input
                    type="text"
                    id="location-input"
                    placeholder="Enter an address or city"
                    className="w-full"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    aria-invalid={!!locationError}
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="radius-slider" className="text-sm text-neutral-dark mb-1 font-medium">
                    Search Radius: <span id="radius-value" className="text-primary font-semibold">{searchRadius}</span> miles
                  </label>
                  <Slider
                    id="radius-slider"
                    min={1}
                    max={30}
                    step={1}
                    value={[searchRadius]}
                    onValueChange={handleRadiusChange}
                    className="radius-slider w-full"
                  />
                </div>
              </div>
            </div>
            {locationError && (
              <p className="text-sm text-red-500 mt-1">{locationError}</p>
            )}
          </div>
          <div className="flex justify-end items-center">
            <Button
              variant="default"
              className="bg-primary hover:bg-primary-dark text-white font-medium h-12 px-6 text-base disabled:opacity-50"
              onClick={handleSearch}
              disabled={isSearching || isPerformingSearch}
            >
              {isSearching || isPerformingSearch ? 'Searching...' : 'Find Businesses'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
