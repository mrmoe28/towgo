import { Business, SearchParams } from '@shared/schema';
import { loadGoogleMapsApi } from './maps';
import { PlacesSearchResponse } from '@/types';

// Geocode an address to coordinates
export const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number }> => {
  await loadGoogleMapsApi();

  return new Promise((resolve, reject) => {
    const geocoder = new google.maps.Geocoder();
    
    geocoder.geocode({ address }, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
        const location = results[0].geometry.location;
        resolve({
          lat: location.lat(),
          lng: location.lng(),
        });
      } else {
        reject(new Error(`Geocoding failed: ${status}`));
      }
    });
  });
};

// Cache for PlacesService to avoid recreating it for each search
let placesServiceInstance: google.maps.places.PlacesService | null = null;
let placesServiceMapElement: HTMLElement | null = null;

// Cache for geocoded locations to avoid redundant API calls
const geocodeCache: Record<string, {lat: number, lng: number}> = {};

// Initialize the PlacesService once and reuse it
const getPlacesService = (): Promise<google.maps.places.PlacesService> => {
  return new Promise(async (resolve, reject) => {
    try {
      // Return existing instance if available
      if (placesServiceInstance) {
        console.log('Using cached PlacesService instance');
        return resolve(placesServiceInstance);
      }
      
      // Load Google Maps API if needed
      await loadGoogleMapsApi();
      
      if (!window.google || !window.google.maps || !window.google.maps.places) {
        throw new Error('Google Maps API not loaded properly');
      }

      // Create a map element if it doesn't exist
      if (!placesServiceMapElement) {
        placesServiceMapElement = document.createElement('div');
        placesServiceMapElement.id = 'places-service-map';
        placesServiceMapElement.style.cssText = 'height:1px;width:1px;position:absolute;left:-1000px;top:-1000px;';
        document.body.appendChild(placesServiceMapElement);
      }
      
      // Create a minimal map for the PlacesService
      const tempMap = new google.maps.Map(placesServiceMapElement, {
        center: {lat: 0, lng: 0},
        zoom: 1,
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false,
        zoomControl: false
      });
      
      // Create and cache the service
      placesServiceInstance = new google.maps.places.PlacesService(tempMap);
      console.log('PlacesService initialized and cached');
      resolve(placesServiceInstance);
    } catch (error) {
      console.error('Failed to initialize PlacesService:', error);
      reject(error);
    }
  });
};

// Search for places near a location with performance optimizations
export const searchNearbyPlaces = async (params: SearchParams): Promise<PlacesSearchResponse> => {
  console.time('totalSearchTime');
  try {
    console.log('Searching for businesses with params:', params);
    
    // Load Google Maps API
    await loadGoogleMapsApi();
    
    console.time('locationResolution');
    // Get location coordinates for Google Places search (using cache if available)
    let location;
    if (params.location) {
      const cacheKey = params.location.toLowerCase().trim();
      if (geocodeCache[cacheKey]) {
        console.log('Using cached geocode result for:', params.location);
        location = geocodeCache[cacheKey];
      } else {
        location = await geocodeAddress(params.location);
        geocodeCache[cacheKey] = location; // Cache the result
      }
    } else if (params.latitude !== undefined && params.longitude !== undefined) {
      location = { lat: params.latitude, lng: params.longitude };
    } else {
      throw new Error('A location or coordinates are required');
    }
    console.timeEnd('locationResolution');

    // Get the singleton PlacesService instance
    console.time('placesServiceInit');
    const service = await getPlacesService();
    console.timeEnd('placesServiceInit');
    
    // Use the business type directly
    const keyword = params.businessType;
    console.log('Using keyword for Places API search:', keyword);
    
    return new Promise<PlacesSearchResponse>((resolve, reject) => {
      // Create request for nearbySearch
      const request: google.maps.places.PlaceSearchRequest = {
        location,
        // Convert radius from miles to meters (1 mile ≈ 1609.34 meters)
        radius: params.radius * 1609.34
      };
      
      // Add keyword if provided
      if (keyword) {
        request.keyword = keyword;
      } else {
        request.type = 'business';
      }
      
      console.log('Google Places API request:', request);
      console.time('placesApiCall');
      
      service.nearbySearch(
        request,
        (results, status) => {
          console.timeEnd('placesApiCall');
          console.log('Google Places API response status:', status);
          console.log('Google Places API results count:', results?.length || 0);
          
          if (status === 'OK' && results) {
            console.time('resultsProcessing');
            // Process results into our Business type
            const businesses: Business[] = results
              .map((place) => {
                // Calculate distance from search location in meters (using direct calculation)
                const placeLoc = place.geometry?.location;
                let distance = 0;
                
                if (placeLoc) {
                  // Calculate direct distance using Pythagorean theorem for simplicity and speed
                  // This is an approximation that works well for small distances
                  const lat1 = location.lat;
                  const lng1 = location.lng;
                  const lat2 = placeLoc.lat();
                  const lng2 = placeLoc.lng();
                  
                  // Convert to radians
                  const toRad = (x: number) => x * Math.PI / 180;
                  const R = 6371e3; // Earth radius in meters
                  
                  const dLat = toRad(lat2 - lat1);
                  const dLng = toRad(lng2 - lng1);
                  
                  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
                            Math.sin(dLng/2) * Math.sin(dLng/2);
                  
                  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                  distance = R * c; // Distance in meters
                }

                return {
                  placeId: place.place_id || '',
                  name: place.name || '',
                  category: place.types?.join(', ') || '',
                  address: place.vicinity || '',
                  phoneNumber: '', // We would need an additional details request to get this
                  website: place.website || '', // Added website field
                  location: {
                    lat: place.geometry?.location.lat() || 0,
                    lng: place.geometry?.location.lng() || 0,
                  },
                  distance: distance,
                };
              })
              // Filter by radius
              .filter(business => {
                const radiusInMeters = params.radius * 1609.34;
                const isWithinRadius = business.distance <= radiusInMeters;
                return isWithinRadius;
              });

            // Log filtering summary
            console.log(`Found ${results.length} total businesses, ${businesses.length} within the ${params.radius} mile radius`);
            
            // Sort by distance by default
            if (params.sortBy === 'distance') {
              businesses.sort((a, b) => (a.distance || 0) - (b.distance || 0));
            }

            console.timeEnd('resultsProcessing');
            console.timeEnd('totalSearchTime');
            
            // Return businesses with direct search info
            resolve({
              results: businesses,
              originalQuery: params.businessType || '',
              enhancedQuery: '',
              isEnhanced: false,
              citations: [],
              status: "SUCCESS"
            });
          } else if (status === 'ZERO_RESULTS') {
            console.timeEnd('totalSearchTime');
            // Handle case where no results were found
            resolve({ 
              results: [],
              originalQuery: params.businessType || '',
              enhancedQuery: '',
              isEnhanced: false,
              citations: [],
              status: "ZERO_RESULTS"
            });
          } else {
            console.timeEnd('totalSearchTime');
            // Log detailed error information for debugging
            console.error('Google Places API error:', status);
            
            // Reject with descriptive error
            reject(new Error(`Places search failed: ${status}`));
          }
        }
      );
    });
  } catch (error) {
    console.error('Error in searchNearbyPlaces:', error);
    console.timeEnd('totalSearchTime');
    throw error;
  }
};

// Cache for place details to avoid redundant API calls
const placeDetailsCache: Record<string, Business> = {};

// Get more details for a specific place with caching
export const getPlaceDetails = async (placeId: string): Promise<Business> => {
  console.time('placeDetailsTime');
  
  // Return cached result if available
  if (placeDetailsCache[placeId]) {
    console.log('Using cached place details for:', placeId);
    console.timeEnd('placeDetailsTime');
    return placeDetailsCache[placeId];
  }
  
  try {
    // Use the same PlacesService singleton
    const service = await getPlacesService();
    console.log('Getting place details for placeId:', placeId);
    
    return new Promise((resolve, reject) => {
      service.getDetails(
        {
          placeId,
          fields: ['name', 'formatted_address', 'formatted_phone_number', 'geometry', 'types', 'website'],
        },
        (place: any, status: any) => {
          console.timeEnd('placeDetailsTime');
          
          if (status === 'OK' && place) {
            const business: Business = {
              placeId: place.place_id || '',
              name: place.name || '',
              category: place.types?.join(', ') || '',
              address: place.formatted_address || '',
              phoneNumber: place.formatted_phone_number || '',
              website: place.website || '',
              location: {
                lat: place.geometry?.location.lat() || 0,
                lng: place.geometry?.location.lng() || 0,
              },
            };
            
            // Cache the result
            placeDetailsCache[placeId] = business;
            
            resolve(business);
          } else {
            console.error('Place details request failed:', status);
            reject(new Error(`Place details request failed: ${status}`));
          }
        }
      );
    });
  } catch (error) {
    console.error('Error in getPlaceDetails:', error);
    console.timeEnd('placeDetailsTime');
    throw error;
  }
};