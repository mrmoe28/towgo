import { useState, useEffect, useCallback } from 'react';
import { getLocationWithGoogleMaps, loadGoogleMaps } from '../lib/geolocation';

interface GeolocationPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  method?: 'browser-gps' | 'browser-gps-standard' | 'google-ip' | 'ip-service' | 'default';
  isApproximate?: boolean;
}

interface GeolocationAddress {
  city: string;
  state: string;
  country: string;
  formattedAddress: string;
}

interface UseGeolocationReturn {
  position: GeolocationPosition | null;
  address: GeolocationAddress | null;
  isLoading: boolean;
  error: string | null;
  getLocation: () => Promise<GeolocationPosition | null>;
}

export function useGeolocation(): UseGeolocationReturn {
  const [position, setPosition] = useState<GeolocationPosition | null>(null);
  const [address, setAddress] = useState<GeolocationAddress | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Function to get reverse geocoding data from coordinates
  const getAddressFromCoordinates = async (latitude: number, longitude: number): Promise<GeolocationAddress | null> => {
    try {
      // Try to use Google Maps Geocoding API first
      if (window.google && window.google.maps) {
        return new Promise((resolve) => {
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode(
            { location: { lat: latitude, lng: longitude } },
            (results, status) => {
              if (status === 'OK' && results && results[0]) {
                let city = '';
                let state = '';
                let country = '';
                
                // Extract components from address
                for (const component of results[0].address_components) {
                  if (component.types.includes('locality')) {
                    city = component.long_name;
                  } else if (component.types.includes('administrative_area_level_1')) {
                    state = component.short_name;
                  } else if (component.types.includes('country')) {
                    country = component.long_name;
                  }
                }
                
                resolve({
                  city,
                  state,
                  country,
                  formattedAddress: results[0].formatted_address
                });
              } else {
                resolve(null);
              }
            }
          );
        });
      }
      
      // Fallback to OpenStreetMap if Google Maps is not available
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`
      );
      
      if (!response.ok) {
        throw new Error('Failed to get address information');
      }
      
      const data = await response.json();
      
      return {
        city: data.address.city || data.address.town || data.address.village || data.address.county || '',
        state: data.address.state || '',
        country: data.address.country || '',
        formattedAddress: data.display_name || ''
      };
    } catch (error) {
      console.error('Error getting address from coordinates:', error);
      return null;
    }
  };

  // Function to get current position
  const getLocation = useCallback(async (): Promise<GeolocationPosition | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // First, try to load Google Maps API
      try {
        await loadGoogleMaps();
        console.log('Google Maps loaded successfully');
      } catch (error) {
        console.warn('Could not load Google Maps API, will try alternative methods:', error);
      }
      
      // Try to get location using Google Maps API first
      try {
        const googleLocation = await getLocationWithGoogleMaps();
        
        if (googleLocation) {
          // Convert Google Maps location to our GeolocationPosition interface
          const positionResult: GeolocationPosition = {
            latitude: googleLocation.lat,
            longitude: googleLocation.lng,
            accuracy: googleLocation.accuracy || 50, // Use provided accuracy or default
            timestamp: Date.now(),
            method: googleLocation.method,
            isApproximate: googleLocation.isApproximate
          };
          
          setPosition(positionResult);
          
          // Get address information from coordinates
          const addressInfo = await getAddressFromCoordinates(positionResult.latitude, positionResult.longitude);
          if (addressInfo) {
            setAddress(addressInfo);
          }
          
          // If using approximate location, show a more specific message but not an error
          if (googleLocation.isApproximate) {
            console.log('Using approximate location based on IP address or default region');
          }
          
          return positionResult;
        }
      } catch (googleError) {
        console.warn('Google Maps geolocation failed, trying browser geolocation:', googleError);
      }
      
      // Fallback to browser geolocation if Google Maps API fails
      if (!navigator.geolocation) {
        setError('Geolocation is not supported by your browser');
        return null;
      }
      
      // Create a geolocation promise with a manual timeout
      const getPositionWithTimeout = () => {
        return new Promise<GeolocationPosition | null>((resolve) => {
          // Set a timeout to handle cases where geolocation is slow
          const timeoutId = setTimeout(() => {
            console.warn('Browser geolocation request timed out');
            resolve(null);
          }, 10000);
          
          // Try to get the position
          navigator.geolocation.getCurrentPosition(
            (position) => {
              // Clear the timeout since we got a response
              clearTimeout(timeoutId);
              
              // Convert browser GeolocationPosition to our GeolocationPosition interface
              resolve({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                timestamp: position.timestamp,
                method: 'browser-gps',
                isApproximate: false
              });
            },
            (error) => {
              // Clear the timeout since we got an error
              clearTimeout(timeoutId);
              
              // Handle specific geolocation errors
              let errorMessage = 'Failed to get your location';
              
              switch (error.code) {
                case error.PERMISSION_DENIED:
                  errorMessage = 'Location access was denied. Please enable location services.';
                  break;
                case error.POSITION_UNAVAILABLE:
                  errorMessage = 'Location information is unavailable. Please try again.';
                  break;
                case error.TIMEOUT:
                  errorMessage = 'Location request timed out. Please try again.';
                  break;
                default:
                  errorMessage = `Location error: ${error.message}`;
              }
              
              setError(errorMessage);
              resolve(null);
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0
            }
          );
        });
      };
      
      const positionResult = await getPositionWithTimeout();
      
      // If position is null, we already set the error in the callback
      if (!positionResult) {
        if (!error) {
          setError('Location request timed out. Please try again.');
        }
        return null;
      }
      
      setPosition(positionResult);
      
      // Get address information from coordinates
      const addressInfo = await getAddressFromCoordinates(positionResult.latitude, positionResult.longitude);
      if (addressInfo) {
        setAddress(addressInfo);
      }
      
      return positionResult;
    } catch (e) {
      console.error('Unexpected error in geolocation:', e);
      setError('An unexpected error occurred. Please try again.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-get location when component mounts
  useEffect(() => {
    getLocation();
  }, [getLocation]);

  return {
    position,
    address,
    isLoading,
    error,
    getLocation
  };
}