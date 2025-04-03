import { Loader } from '@googlemaps/js-api-loader';
import { Location } from '../types';

// Simple declaration for window.google
declare global {
  interface Window {
    google: any;
  }
}

// Get the Google Maps API key from environment variables
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// Debug API key format (partial display for security)
const apiKeyDebug = GOOGLE_MAPS_API_KEY ? 
  `Key present (starts with: ${GOOGLE_MAPS_API_KEY.substring(0, 3)}..., length: ${GOOGLE_MAPS_API_KEY.length})` : 
  'No Google Maps API key found';
console.log('Google Maps API key status:', apiKeyDebug);

// Add more specific debugging
if (!GOOGLE_MAPS_API_KEY) {
  console.error('ERROR: Google Maps API key is missing. Location services will not work properly.');
} else if (GOOGLE_MAPS_API_KEY.length < 20) {
  console.error('ERROR: Google Maps API key appears to be invalid (too short).');
}

// Define loader options type to avoid TypeScript errors
interface CustomLoaderOptions {
  apiKey: string;
  version: string;
  libraries: string[];
}

// Default Google Maps loader options
const DEFAULT_OPTIONS: CustomLoaderOptions = {
  apiKey: GOOGLE_MAPS_API_KEY || '',
  version: 'quarterly',
  libraries: ['places', 'geometry', 'geocoding']
};

/**
 * Load the Google Maps API with specified libraries
 * @param options Options for loading Google Maps API (apiKey, version, libraries)
 * @returns Promise that resolves when Google Maps is loaded
 */
export async function loadGoogleMaps(options?: Partial<CustomLoaderOptions>): Promise<any> {
  // Check if Google Maps is already loaded
  if (window.google && window.google.maps) {
    console.log('Google Maps already loaded, reusing existing instance');
    return window.google;
  }

  // Merge default options with provided options
  const loaderOptions = {
    ...DEFAULT_OPTIONS,
    ...options
  } as any;

  // Show a warning if no API key is provided
  if (!loaderOptions.apiKey) {
    console.warn('No Google Maps API key provided. Map functionality may be limited.');
  }

  console.log(`Loading Google Maps with libraries: ${loaderOptions.libraries.join(', ')}`);

  // Create a new loader with the specified options
  const loader = new Loader(loaderOptions);

  // Implement retry mechanism
  let attempts = 0;
  const maxAttempts = 3;
  const baseDelay = 2;

  while (attempts < maxAttempts) {
    try {
      // Load Google Maps and return it
      await loader.load();
      
      // Verify the API loaded correctly
      if (window.google && window.google.maps) {
        console.log('Google Maps loaded successfully');
        
        // Check if required components are available
        if (options?.libraries?.includes('places') && !window.google.maps.places) {
          console.warn('Places library was requested but not loaded correctly');
        }
        
        if (options?.libraries?.includes('geocoding') && !window.google.maps.Geocoder) {
          console.warn('Geocoding library was requested but Geocoder is not available');
        }
        
        return window.google;
      } else {
        throw new Error('Google Maps API loaded but objects not available');
      }
    } catch (error) {
      attempts++;
      console.error(`Google Maps loading attempt ${attempts} failed:`, error);
      
      if (attempts >= maxAttempts) {
        console.error('Failed to load Google Maps after multiple attempts:', error);
        throw new Error('Failed to load Google Maps. Please try again later.');
      }
      
      // Exponential backoff
      const delay = Math.pow(baseDelay, attempts) * 1000; // Convert to milliseconds
      console.log(`Retrying in ${delay} ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw new Error('Failed to load Google Maps after multiple attempts.');
}

/**
 * Get a formatted address from coordinates using reverse geocoding
 * @param latitude Latitude coordinate
 * @param longitude Longitude coordinate
 * @returns Promise that resolves with formatted address and components
 */
export async function getAddressFromCoordinates(latitude: number, longitude: number) {
  try {
    // Load Google Maps API with Geocoding
    await loadGoogleMaps({ libraries: ['geocoding'] });

    return new Promise((resolve, reject) => {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode(
        { location: { lat: latitude, lng: longitude } },
        (results: any, status: any) => {
          if (status === 'OK' && results && results[0]) {
            // Extract address components
            const addressComponents = {
              formattedAddress: results[0].formatted_address,
              components: results[0].address_components.reduce((acc: Record<string, string>, component: any) => {
                component.types.forEach((type: string) => {
                  acc[type] = component.long_name;
                });
                return acc;
              }, {})
            };
            
            resolve(addressComponents);
          } else {
            reject(new Error(`Geocoder failed due to: ${status}`));
          }
        }
      );
    });
  } catch (error) {
    console.error('Error in reverse geocoding:', error);
    throw error;
  }
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param lat1 Latitude of first point
 * @param lon1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lon2 Longitude of second point
 * @returns Distance in miles
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in miles
  
  return parseFloat(distance.toFixed(2));
}

/**
 * Initialize Google Places Autocomplete on an input element
 * @param inputElement The HTML input element to attach autocomplete to
 * @param onPlaceSelected Callback function when a place is selected
 * @param options Optional autocomplete options
 * @returns The autocomplete instance
 */
export async function initPlacesAutocomplete(
  inputElement: HTMLInputElement,
  onPlaceSelected: (place: any) => void,
  options?: any
): Promise<any> {
  try {
    // Load Google Maps API with Places library
    await loadGoogleMaps({ libraries: ['places'] });
    
    // Default options for the autocomplete
    const defaultOptions = {
      componentRestrictions: { country: 'us' },
      fields: ['address_components', 'formatted_address', 'geometry', 'name'],
      types: ['address'] // Use only one type to avoid mixing errors
    };
    
    // Create the autocomplete instance
    const autocomplete = new window.google.maps.places.Autocomplete(
      inputElement,
      { ...defaultOptions, ...options }
    );
    
    // Add event listener for place selection
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      
      if (place.geometry) {
        onPlaceSelected(place);
      } else {
        console.warn('No geometry available for the selected place');
      }
    });
    
    // Prevent form submission on Enter key in autocomplete field
    inputElement.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        if (document.activeElement === inputElement) {
          e.preventDefault();
        }
      }
    });
    
    return autocomplete;
  } catch (error) {
    console.error('Error initializing Places Autocomplete:', error);
    throw error;
  }
}

/**
 * Get address details and coordinates from a search term using Google Places API
 * @param searchTerm The location search term (address, city, etc.)
 * @returns Promise that resolves with location details
 */
export async function getAddressFromSearch(searchTerm: string): Promise<{
  formattedAddress: string;
  location: Location;
  components: Record<string, string>;
}> {
  try {
    // Load Google Maps API first
    await loadGoogleMaps({ libraries: ['geocoding'] });
    
    return new Promise((resolve, reject) => {
      const geocoder = new window.google.maps.Geocoder();
      
      geocoder.geocode({ address: searchTerm }, (results: any, status: any) => {
        if (status === 'OK' && results && results[0]) {
          // Extract the formatted address
          const formattedAddress = results[0].formatted_address;
          
          // Extract the location coordinates
          const location = {
            lat: results[0].geometry.location.lat(),
            lng: results[0].geometry.location.lng()
          };
          
          // Extract address components
          const components = results[0].address_components.reduce((acc: Record<string, string>, component: any) => {
            component.types.forEach((type: string) => {
              acc[type] = component.long_name;
            });
            return acc;
          }, {});
          
          resolve({
            formattedAddress,
            location,
            components
          });
        } else {
          reject(new Error(`Geocoding failed due to: ${status}`));
        }
      });
    });
  } catch (error) {
    console.error('Error in address search:', error);
    throw error;
  }
}