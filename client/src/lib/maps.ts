import { Business } from '@shared/schema';
import { Location } from '../types';

// Google Maps API key from environment variables
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

// Add window declaration to ensure proper Google Maps types
declare global {
  interface Window {
    google: any;
  }
}

// Map instance and markers
let map: any = null;
let markers: any[] = [];
let infoWindow: any = null;
let userLocationMarker: any = null;
let userLocationAccuracyCircle: any = null; // Using any for Circle to avoid TypeScript issues

// Maps API loader with a single instance to prevent multiple loads
let googleMapsPromise: Promise<void> | null = null;

// Pre-load the Google Maps API as early as possible
// This will run when this file is imported
(function preloadGoogleMapsScript() {
  // Create a link element for DNS prefetching
  const dnsPrefetch = document.createElement('link');
  dnsPrefetch.rel = 'dns-prefetch';
  dnsPrefetch.href = 'https://maps.googleapis.com';
  document.head.appendChild(dnsPrefetch);
  
  // Create a preconnect link to establish early connection
  const preconnect = document.createElement('link');
  preconnect.rel = 'preconnect';
  preconnect.href = 'https://maps.googleapis.com';
  preconnect.crossOrigin = 'anonymous';
  document.head.appendChild(preconnect);
  
  // Create a preload link for the script itself
  const preload = document.createElement('link');
  preload.rel = 'preload';
  preload.as = 'script';
  preload.href = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geometry,drawing,visualization`;
  document.head.appendChild(preload);
})();

// Fast Google Maps API loading - optimized
export const loadGoogleMapsApi = (): Promise<void> => {
  // If we already have a promise in progress, return it
  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  // Create a new promise to load the API
  googleMapsPromise = new Promise((resolve, reject) => {
    try {
      // If the API is already loaded, resolve immediately
      if (window.google && window.google.maps) {
        resolve();
        return;
      }

      if (!GOOGLE_MAPS_API_KEY) {
        reject(new Error('Google Maps API key is missing'));
        googleMapsPromise = null;
        return;
      }

      // Check if we already have a script tag for Google Maps
      const existingScript = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
      if (existingScript) {
        existingScript.remove();
      }

      // Shorter timeout for faster failure detection
      const timeoutId = setTimeout(() => {
        if (window.google && window.google.maps) {
          resolve();
        } else {
          googleMapsPromise = null;
          reject(new Error('Timeout waiting for Google Maps API'));
        }
      }, 10000);

      // Add a callback function to the window that Google Maps will call when loaded
      const callbackName = 'googleMapsInitialized';
      (window as any)[callbackName] = () => {
        clearTimeout(timeoutId);
        if (window.google && window.google.maps) {
          resolve();
        } else {
          googleMapsPromise = null;
          reject(new Error('Google Maps API loaded but objects not available'));
        }
        // Clean up the callback
        delete (window as any)[callbackName];
      };

      // Load the API with all required libraries
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geometry,drawing,visualization&callback=${callbackName}&v=quarterly`;
      script.async = true;
      script.defer = true;
      
      script.addEventListener('error', (e) => {
        clearTimeout(timeoutId);
        googleMapsPromise = null;
        reject(new Error('Failed to load Google Maps API'));
      });

      document.head.appendChild(script);
    } catch (error) {
      googleMapsPromise = null;
      reject(error);
    }
  });

  return googleMapsPromise;
};

// Prerender map tiles lazily
let mapTilesPrerendered = false;

// Initialize the map with optimized rendering
export const initializeMap = (
  elementId: string,
  center: Location,
  zoom: number = 13
): any => {
  // Verify Google Maps API is loaded
  if (!window.google || !window.google.maps) {
    throw new Error('Google Maps API not loaded');
  }

  // Get the map container element
  const mapElement = document.getElementById(elementId);
  if (!mapElement) {
    throw new Error(`Element with id "${elementId}" not found`);
  }
  
  // Ensure the map element has width and height
  mapElement.style.width = '100%';
  mapElement.style.height = '500px';
  mapElement.style.display = 'block';

  // Define minimal map options for faster initial loading
  const mapOptions = {
    center,
    zoom,
    mapTypeControl: false,
    fullscreenControl: false,
    streetViewControl: false,
    zoomControl: false,
    gestureHandling: 'cooperative',
    maxZoom: 18,
    // Add fast loading specific optimizations
    clickableIcons: false,   // Disable clickable POIs for faster rendering
    isFractionalZoomEnabled: false,  // Disable fractional zoom for better performance
    disableDefaultUI: true,  // Disable all UI elements by default
    backgroundColor: '#f8f9fa'  // Set a background color to avoid flash of white
  };
  
  try {
    // Force any existing map to be cleared
    if (map) {
      map = null;
      markers = [];
      if (infoWindow) infoWindow.close();
    }
    
    // Create a new map with minimal initialization
    map = new google.maps.Map(mapElement, mapOptions as any);
    
    // Create info window for markers (create only when needed)
    if (!infoWindow) {
      infoWindow = new google.maps.InfoWindow({
        maxWidth: 300
      });
    }
    
    // If this is the first map load, prerender map tiles in the background
    if (!mapTilesPrerendered) {
      mapTilesPrerendered = true;
      
      // Defer non-critical map operations to after initial render
      requestAnimationFrame(() => {
        if (map) {
          // Force a resize to make sure map renders correctly after layout is stable
          setTimeout(() => {
            if (map) {
              google.maps.event.trigger(map, 'resize');
            }
          }, 300);
        }
      });
    }
    
    // Return the map instance immediately
    return map;
  } catch (error) {
    console.error('Error creating Google Map:', error);
    throw error;
  }
};

// Add businesses as markers to the map with optimized rendering
export const addBusinessesToMap = (
  businesses: Business[],
  onMarkerClick: (business: Business) => void
): void => {
  if (!map) {
    throw new Error('Map not initialized');
  }

  // Clear existing markers
  clearMarkers();
  
  // Skip if no businesses
  if (businesses.length === 0) {
    return;
  }
  
  // Use batch rendering for better performance
  // Split the rendering into chunks to avoid UI freezes
  const BATCH_SIZE = 10;
  const batches = Math.ceil(businesses.length / BATCH_SIZE);
  
  // Process the markers in batches
  for (let i = 0; i < batches; i++) {
    // Use setTimeout to allow UI to remain responsive between batches
    setTimeout(() => {
      // Get the current batch
      const start = i * BATCH_SIZE;
      const end = Math.min(start + BATCH_SIZE, businesses.length);
      const batch = businesses.slice(start, end);
      
      // Process this batch
      batch.forEach((business) => {
        if (!map) return;
        
        const marker = new google.maps.Marker({
          position: business.location,
          map: map,
          title: business.name,
          // Conditional animation only for first batch (smoother loading)
          ...(i === 0 ? { animation: 2 } : {}) // 2 is the value for DROP animation
        });

        // Add click event handler
        google.maps.event.addListener(marker, 'click', () => {
          onMarkerClick(business);
          
          if (infoWindow && map) {
            // Create infoWindow content (simplified for faster rendering)
            const content = `
              <div style="padding:8px;max-width:280px">
                <div style="font-weight:500;font-size:16px;margin-bottom:4px">${business.name}</div>
                <div style="color:#666;font-size:14px">${business.address}</div>
                ${business.distance ? `<div style="color:#666;font-size:14px;margin-top:4px">${(business.distance / 1609.34).toFixed(1)} miles</div>` : ''}
              </div>
            `;
            
            infoWindow.setContent(content);
            infoWindow.close(); // Close first to reset state
            
            // Open the info window with the marker as anchor
            infoWindow.open({
              map,
              anchor: marker
            });
          }
        });

        markers.push(marker);
      });
    }, i * 10); // Small delay between batches for smoother rendering
  }
};

// Clear all markers from the map
export const clearMarkers = (): void => {
  markers.forEach((marker) => {
    marker.setMap(null);
  });
  markers = [];
};

// Default location for use when geolocation fails (Atlanta, GA)
const DEFAULT_LOCATION: Location = { lat: 33.749, lng: -84.388 };

// Get current location with fallback to default location for testing
export const getCurrentLocation = (useDefaultFallback = false): Promise<Location> => {
  console.log('Requesting current location from browser...');
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by this browser');
      
      if (useDefaultFallback) {
        console.log('Using default location fallback:', DEFAULT_LOCATION);
        resolve(DEFAULT_LOCATION);
      } else {
        reject(new Error('Geolocation is not supported by your browser. Please enter a location manually.'));
      }
      return;
    }

    // Set a shorter timeout for better user experience
    const timeoutId = setTimeout(() => {
      if (useDefaultFallback) {
        console.log('Location request timed out. Using default location fallback:', DEFAULT_LOCATION);
        resolve(DEFAULT_LOCATION);
      } else {
        reject(new Error('Location request timed out. Please enter a location manually.'));
      }
    }, 5000); // 5 second timeout for faster response

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timeoutId);
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        
        // Format and log the location for debugging
        const locationString = `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`;
        console.log(`Successfully got current location: ${locationString}`);
        
        resolve(location);
      },
      (error) => {
        clearTimeout(timeoutId);
        let errorMessage = 'Failed to get your location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access was denied.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Your location is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }
        console.error('Geolocation error:', errorMessage, error);
        
        if (useDefaultFallback) {
          console.log('Using default location due to error:', errorMessage);
          resolve(DEFAULT_LOCATION);
        } else {
          reject(new Error(`${errorMessage} Please enter a location manually.`));
        }
      },
      {
        enableHighAccuracy: false, // Lower accuracy for faster response
        timeout: 7000,             // 7 second timeout
        maximumAge: 60000          // Allow cached position up to a minute old
      }
    );
  });
};

// Center map on location
export const centerMap = (location: Location): void => {
  if (!map) {
    throw new Error('Map not initialized');
  }
  map.setCenter(location);
};

// Zoom in
export const zoomIn = (): void => {
  if (!map) {
    throw new Error('Map not initialized');
  }
  const currentZoom = map.getZoom() || 13;
  map.setZoom(Math.min(20, currentZoom + 1));
};

// Zoom out
export const zoomOut = (): void => {
  if (!map) {
    throw new Error('Map not initialized');
  }
  const currentZoom = map.getZoom() || 13;
  map.setZoom(Math.max(1, currentZoom - 1));
};

// Get directions to a location
export const getDirectionsUrl = (destination: Location): string => {
  const destinationStr = `${destination.lat},${destination.lng}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${destinationStr}`;
};

/**
 * Display "You are here" marker on the map with accuracy radius
 * @param location User's current location
 * @param accuracy Accuracy of the location in meters (optional)
 * @returns void
 */
export const showUserLocationOnMap = (
  location: Location, 
  accuracy?: number
): void => {
  if (!map) {
    throw new Error('Map not initialized');
  }

  // Remove existing user location marker and accuracy circle
  if (userLocationMarker) {
    userLocationMarker.setMap(null);
    userLocationMarker = null;
  }
  
  if (userLocationAccuracyCircle) {
    userLocationAccuracyCircle.setMap(null);
    userLocationAccuracyCircle = null;
  }

  // Create a custom icon for better visibility and performance
  // Blue dot with white border - standard "You are here" appearance
  const userLocationIcon = {
    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='%234285F4' stroke='white' stroke-width='2'%3E%3Ccircle cx='12' cy='12' r='8'/%3E%3C/svg%3E",
    scaledSize: new google.maps.Size(24, 24)
  };

  // Create the user location marker
  userLocationMarker = new google.maps.Marker({
    position: location,
    map: map,
    title: 'You are here',
    zIndex: 999, // Ensure it's above other markers
  } as google.maps.MarkerOptions);
  
  // Set the icon and animation separately to avoid TypeScript errors
  (userLocationMarker as any).setIcon(userLocationIcon);
  // Use the animation constant (2 represents BOUNCE) 
  (userLocationMarker as any).setAnimation(2);
  
  // Stop the animation after a short time
  setTimeout(() => {
    if (userLocationMarker) {
      // Stop the animation by explicitly setting to null
      (userLocationMarker as any).setAnimation(null);
    }
  }, 2100);

  // If accuracy is provided, add a circle to show accuracy radius
  if (accuracy && accuracy > 0) {
    // Create the accuracy circle using the Drawing library
    // Using any type to bypass TypeScript issues
    userLocationAccuracyCircle = new (google.maps as any).Circle({
      map: map,
      center: location,
      radius: accuracy, // Radius in meters
      fillColor: '#4285F480', // Semi-transparent blue
      fillOpacity: 0.15,
      strokeColor: '#4285F4',
      strokeOpacity: 0.3,
      strokeWeight: 1,
      clickable: false
    });
  }

  // Add info window with "You are here" message
  if (infoWindow) {
    // Create content for the info window
    const content = `
      <div style="padding:8px;max-width:200px;text-align:center">
        <div style="font-weight:500;color:#4285F4">Your Location</div>
        ${accuracy ? `<div style="color:#666;font-size:12px;margin-top:4px">Accuracy: ±${Math.round(accuracy)} meters</div>` : ''}
      </div>
    `;
    
    // Set the content and open the info window
    infoWindow.setContent(content);
    
    // Open the info window on the marker
    infoWindow.open({
      map,
      anchor: userLocationMarker
    });
    
    // Close the info window after a few seconds
    setTimeout(() => {
      if (infoWindow) {
        infoWindow.close();
      }
    }, 5000);
  }
};

/**
 * Start watching user's location and update the "You are here" marker in real-time
 * @returns A function to stop watching location
 */
export const watchUserLocation = (): (() => void) => {
  if (!navigator.geolocation) {
    throw new Error('Geolocation is not supported by this browser');
  }
  
  if (!map) {
    throw new Error('Map not initialized');
  }
  
  // Set up ID to clear the watch later
  let watchId: number;
  
  // Start watching location with high accuracy
  watchId = navigator.geolocation.watchPosition(
    (position) => {
      const location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      
      // Update the user location marker
      showUserLocationOnMap(location, position.coords.accuracy);
    },
    (error) => {
      console.error('Error watching location:', error);
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  );
  
  // Return a function to stop watching
  return () => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
    }
    
    // Remove the marker when done
    if (userLocationMarker) {
      userLocationMarker.setMap(null);
      userLocationMarker = null;
    }
    
    if (userLocationAccuracyCircle) {
      userLocationAccuracyCircle.setMap(null);
      userLocationAccuracyCircle = null;
    }
  };
};
