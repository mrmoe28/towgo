import { useEffect, useRef, useState, lazy, Suspense } from 'react';
import { MapViewProps, SortOption } from '@/types';
import { 
  initializeMap, 
  addBusinessesToMap, 
  zoomIn as zoomInMap, 
  zoomOut as zoomOutMap, 
  centerMap, 
  loadGoogleMapsApi
} from '@/lib/maps';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Minus, Crosshair, AlertCircle, Map as MapIcon } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
// Import dynamic loading utilities
import { loadGoogleMapsModules } from '@/lib/dynamicImports';

export default function MapView({ 
  businesses, 
  isLoading, 
  center, 
  onSelectBusiness,
  onToggleFavorite,
  favorites, 
  sortBy,
  onSortChange
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  
  // Initialize Google Maps API early on component mount using dynamic imports
  useEffect(() => {
    let isMounted = true;
    
    // Use dynamic imports to load Google Maps API modules only when needed
    const loadMapsModules = async () => {
      try {
        // Load maps API modules dynamically to reduce initial bundle size
        await loadGoogleMapsModules();
        
        // After dynamic modules are loaded, proceed with normal API loading
        await loadGoogleMapsApi();
      } catch (err) {
        // Only log errors, don't show to user yet until we try to initialize the map
        console.error('Initial Google Maps preload failed:', err);
      }
    };
    
    // Start the dynamic loading process
    loadMapsModules();
    
    return () => {
      isMounted = false;
    };
  }, []);
    
  // Optimized map initialization on center or visibility change
  useEffect(() => {
    let isMounted = true;
    
    // Skip if map is already initialized or no center is provided
    if (mapInitialized || !center) return;
    
    async function initMap() {
      // Skip if map is already initialized or component unmounted
      if (mapInitialized || !isMounted) return;
      
      try {
        // Reset any previous errors
        if (isMounted) setMapError(null);
        
        // Load Google Maps API (should be fast since we preloaded)
        await loadGoogleMapsApi();
        
        // After API is loaded, initialize the map if we have a container and center
        if (!isMounted || !mapContainerRef.current) return;
        
        // Apply explicit dimensions for consistent rendering
        mapContainerRef.current.style.width = '100%';
        mapContainerRef.current.style.height = '500px';
        mapContainerRef.current.style.display = 'block';
        
        // Use willChange hint for better browser rendering performance
        mapContainerRef.current.style.willChange = 'transform';
        
        // Initialize map with minimal options for faster loading
        // Use center or fallback to San Francisco if undefined (should not happen due to guard clause)
        const mapCenter = center || { lat: 37.7749, lng: -122.4194 };
        const map = initializeMap('map', mapCenter);
        mapRef.current = map;
        setMapInitialized(true);
      } catch (error) {
        console.error('Map initialization failed:', error);
        if (isMounted) setMapError('Map failed to load. Try refreshing the page.');
      }
    }
    
    // Start map initialization with a very short delay to ensure DOM is ready
    requestAnimationFrame(() => {
      initMap();
    });
    
    return () => {
      isMounted = false;
    };
  }, [mapInitialized, center]);

  // Update markers when businesses change
  useEffect(() => {
    if (mapInitialized && businesses.length > 0) {
      try {
        addBusinessesToMap(businesses, onSelectBusiness);
      } catch (error) {
        console.error('Failed to add businesses to map:', error);
      }
    }
  }, [businesses, mapInitialized, onSelectBusiness]);
  
  // Update map center when center changes
  useEffect(() => {
    if (mapInitialized && center && mapRef.current) {
      try {
        centerMap(center);
      } catch (error) {
        console.error('Failed to center map:', error);
      }
    }
  }, [center, mapInitialized]);

  const handleZoomIn = () => {
    try {
      zoomInMap();
    } catch (error) {
      console.error('Failed to zoom in:', error);
    }
  };

  const handleZoomOut = () => {
    try {
      zoomOutMap();
    } catch (error) {
      console.error('Failed to zoom out:', error);
    }
  };

  const handleRecenter = () => {
    if (center) {
      try {
        centerMap(center);
      } catch (error) {
        console.error('Failed to recenter map:', error);
      }
    }
  };

  const handleSortChange = (value: string) => {
    onSortChange(value as SortOption);
  };

  return (
    <div className="block">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-medium">
          {businesses.length} businesses found
        </h2>
        <div className="flex items-center">
          <label htmlFor="sort-select" className="mr-2 text-sm">Sort by:</label>
          <Select
            value={sortBy}
            onValueChange={handleSortChange}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="distance">Distance</SelectItem>
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="category">Category</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div
          id="map" 
          ref={mapContainerRef}
          className="map-container"
          style={{ 
            height: '600px', 
            width: '100%', 
            position: 'relative',
            backgroundColor: '#f0f0f0',
            minHeight: '400px'
          }}
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
              <div className="text-center p-4">
                <Skeleton className="h-12 w-12 rounded-full mx-auto mb-4" />
                <Skeleton className="h-4 w-32 mx-auto mb-2" />
                <Skeleton className="h-3 w-48 mx-auto" />
              </div>
            </div>
          )}
          
          {mapError && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{mapError}</AlertDescription>
                </Alert>
                <p className="text-sm text-gray-600 mb-2">Possible solutions:</p>
                <ul className="text-sm text-gray-600 list-disc pl-5 mb-4">
                  <li>Check your internet connection</li>
                  <li>Try refreshing the page</li>
                </ul>
              </div>
            </div>
          )}

          {!mapInitialized && !isLoading && !mapError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-4">
                <div className="mb-4 text-neutral-dark">
                  <MapIcon className="h-24 w-24 mx-auto" />
                </div>
                <p className="text-neutral-darkest">Map loading...</p>
                <p className="text-sm text-neutral-dark mt-2">The map will display business locations within your selected radius</p>
              </div>
            </div>
          )}
          
          {/* Map Controls */}
          <div className="absolute bottom-4 right-4 flex flex-col gap-2">
            <button 
              className="bg-white p-2 rounded-full shadow-md hover:bg-neutral-light focus:outline-none focus:ring-2 focus:ring-primary"
              onClick={handleZoomIn}
              aria-label="Zoom in"
            >
              <Plus className="h-5 w-5" />
            </button>
            <button 
              className="bg-white p-2 rounded-full shadow-md hover:bg-neutral-light focus:outline-none focus:ring-2 focus:ring-primary"
              onClick={handleZoomOut}
              aria-label="Zoom out"
            >
              <Minus className="h-5 w-5" />
            </button>
            <button 
              className="bg-accent text-white p-2 rounded-full shadow-md hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-accent"
              onClick={handleRecenter}
              aria-label="Recenter map"
            >
              <Crosshair className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


