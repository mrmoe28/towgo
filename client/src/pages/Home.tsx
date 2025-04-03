import { useState, useEffect } from 'react';
import { Heart, Settings, Lightbulb } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import { useFavorites } from '@/hooks/useFavorites';
import { useBusinessSearch } from '@/hooks/useBusinessSearch';
import { usePerplexitySearch } from '@/hooks/usePerplexitySearch';
import SearchBar from '@/components/SearchBar';
import ListView from '@/components/ListView';
import FavoritesModal from '@/components/FavoritesModal';
import SettingsModal from '@/components/SettingsModal';
import PerplexityResultsPanel from '@/components/PerplexityResultsPanel';
import { SortOption, Location } from '@/types';
import { Business, Favorite, PerplexityResult } from '@shared/schema';
import { getCurrentLocation } from '@/lib/maps';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  const { settings } = useSettings();
  const { favorites, addFavorite, removeFavorite, isFavorite } = useFavorites();
  
  // State
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showPerplexityResults, setShowPerplexityResults] = useState(false);
  const [initialView, setInitialView] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  
  // Try to get device location on initial load
  useEffect(() => {
    // Try to get current location on component mount
    const getInitialLocation = async () => {
      try {
        setStatusMessage('Getting your device location...');
        const location = await getCurrentLocation();
        setStatusMessage(`Found your location (${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}). Ready to search!`);
        
        // Don't auto-search, but keep the location ready
        setInitialView(false);
        
      } catch (err) {
        console.error('Could not get initial location:', err);
        // Don't show error to user yet, they haven't explicitly requested location
      }
    };
    
    getInitialLocation();
  }, []);
  
  // Business search hook
  const { 
    businesses, 
    isSearching, 
    error, 
    currentLocation, 
    sortBy, 
    search, 
    sortBusinesses,
    enhancedSearch
  } = useBusinessSearch();
  
  // Perplexity search hook
  const {
    isSearching: isPerplexitySearching,
    error: perplexityError,
    perplexityData,
    search: performPerplexitySearch
  } = usePerplexitySearch();
  
  // Handle search
  const handleSearch = async (params: { location?: string; radius: number; latitude?: number; longitude?: number; businessType?: string }) => {
    setErrorMessage('');
    setInitialView(false);
    
    // Create a detailed status message
    let statusText = 'Searching for ';
    statusText += params.businessType ? `${params.businessType}` : 'businesses';
    
    if (params.location) {
      statusText += ` near "${params.location}"`;
    } else if (params.latitude && params.longitude) {
      const coordsText = `${params.latitude.toFixed(4)}, ${params.longitude.toFixed(4)}`;
      statusText += ` near your location (${coordsText})`;
    }
    
    statusText += ` within ${params.radius} miles...`;
    setStatusMessage(statusText);
    
    try {
      // AI enhancement disabled as per user request
      // We'll only perform the standard Places API search without Perplexity enhancement
      
      await search(params);
      // Show results count
      if (businesses.length > 0) {
        setStatusMessage(`Found ${businesses.length} results`);
        // Clear the status message after 3 seconds
        setTimeout(() => setStatusMessage(''), 3000);
      } else {
        setStatusMessage('');
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'An error occurred during search');
      setStatusMessage('');
    }
  };

  // Handle current location
  const handleCurrentLocation = async () => {
    setErrorMessage('');
    setInitialView(false);
    setStatusMessage('Getting your current location...');
    
    try {
      // Use the fallback location if geolocation fails
      const location = await getCurrentLocation(true);
      
      // Show the actual coordinates that were detected
      const coordsText = `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`;
      setStatusMessage(`Using location (${coordsText}). Searching for businesses...`);
      
      await handleSearch({
        radius: settings.defaultRadius,
        latitude: location.lat,
        longitude: location.lng
      });
    } catch (err) {
      // This shouldn't happen with fallback, but just in case
      const errorMsg = err instanceof Error ? err.message : 'Failed to get your location';
      setErrorMessage(errorMsg);
      setStatusMessage('');
    }
  };

  // Handle favorite toggle
  const handleToggleFavorite = async (business: Business) => {
    try {
      if (isFavorite(business.placeId)) {
        await removeFavorite(business.placeId);
      } else {
        await addFavorite(business);
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to update favorites');
    }
  };

  // Handle view business from favorites
  const handleViewBusiness = (favorite: Favorite) => {
    // Convert favorite to business format
    const business: Business = {
      placeId: favorite.placeId,
      name: favorite.name,
      address: favorite.address,
      phoneNumber: favorite.phoneNumber || undefined,
      location: favorite.location as Location,
    };
    
    // If we have the location, search businesses around it
    if (business.location) {
      handleSearch({
        radius: settings.defaultRadius,
        latitude: business.location.lat,
        longitude: business.location.lng,
        businessType: business.category
      });
    }
  };

  // Handle sort change
  const handleSortChange = (newSortBy: SortOption) => {
    sortBusinesses(newSortBy);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-primary text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-xl font-medium">TowGo</h1>
          </div>
          <div className="flex items-center">
            <button 
              className="mr-2 p-2 rounded-full hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-white"
              onClick={() => setShowFavoritesModal(true)}
              aria-label="Show favorites"
            >
              <Heart className="h-5 w-5" />
            </button>
            <button 
              className="p-2 rounded-full hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-white"
              onClick={() => setShowSettingsModal(true)}
              aria-label="Show settings"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <SearchBar onSearch={handleSearch} isSearching={isSearching} />

      {/* Main Content */}
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-4">
          {/* Error Alert */}
          {errorMessage && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {/* Initial State */}
          {initialView ? (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="mb-4 text-primary">
                <Settings className="h-16 w-16 mx-auto" />
              </div>
              <h2 className="text-xl font-medium mb-2">Find Businesses Nearby</h2>
              <p className="text-neutral-darkest mb-6">Enter a location or use your current position to discover businesses around you.</p>
              <div className="flex flex-col gap-3 max-w-sm mx-auto">
                <Button 
                  variant="default"
                  className="bg-primary hover:bg-primary-dark text-white font-medium py-3 px-6 flex items-center justify-center"
                  onClick={handleCurrentLocation}
                >
                  <Settings className="mr-2 h-5 w-5" />
                  Use My Current Location
                </Button>
                <Button 
                  variant="outline"
                  className="bg-white hover:bg-neutral-light border border-neutral text-neutral-darkest font-medium py-3 px-6"
                  onClick={() => setInitialView(false)}
                >
                  Enter an Address
                </Button>
              </div>
            </div>
          ) : (
            // List View
            <ListView 
              businesses={businesses}
              isLoading={isSearching}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
              sortBy={sortBy}
              onSortChange={handleSortChange}
            />
          )}
        </div>
      </main>

      {/* Status Message */}
      {statusMessage && (
        <div className="bg-primary text-white p-3 text-center fixed bottom-0 left-0 right-0 shadow-lg z-50 font-medium">
          {statusMessage}
        </div>
      )}

      {/* Modals */}
      <FavoritesModal 
        open={showFavoritesModal}
        onOpenChange={setShowFavoritesModal}
        onViewOnMap={handleViewBusiness}
      />

      <SettingsModal 
        open={showSettingsModal}
        onOpenChange={setShowSettingsModal}
      />
      
      {/* Perplexity AI enhancement removed as per user request */}
    </div>
  );
}