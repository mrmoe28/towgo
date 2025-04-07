import { useState, useEffect, useRef, FormEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, MapIcon, Loader2, AlertTriangle } from "lucide-react";
import { 
  Card, 
  CardContent
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { loadGoogleMaps, getAddressFromSearch } from '../lib/geolocation';
import { Location } from "@/types";

// Add type declaration for window.google
declare global {
  interface Window {
    google: any;
  }
}

interface LocationDisplayProps {
  onLocationUpdate?: (location: string) => void;
  onCoordinatesUpdate?: (coords: Location) => void;
}

export default function LocationDisplay({ onLocationUpdate, onCoordinatesUpdate }: LocationDisplayProps) {
  const [manualLocation, setManualLocation] = useState('');
  const [formattedAddress, setFormattedAddress] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [geocodeError, setGeocodeError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  // Using any type to avoid TypeScript issues with Google Maps API
  const autocompleteRef = useRef<any>(null);

  // State for Google Maps loading status
  const [placesApiStatus, setPlacesApiStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  
  // Initialize Google Places Autocomplete
  useEffect(() => {
    if (inputRef.current) {
      const setupAutocomplete = async () => {
        try {
          setPlacesApiStatus('loading');
          console.log('Setting up Places Autocomplete...');
          
          // Load the Google Maps API with Places library
          await loadGoogleMaps({ libraries: ['places'] });
          
          if (!window.google || !window.google.maps || !window.google.maps.places) {
            throw new Error('Google Maps Places API not available after loading');
          }
          
          console.log('Places API loaded successfully, creating Autocomplete instance');
          
          // Default options for the autocomplete - don't mix 'address' with other types
          const options = {
            componentRestrictions: { country: 'us' },
            fields: ['address_components', 'formatted_address', 'geometry', 'name'],
            types: ['address'] // Using just one type as mixing causes errors
          };
          
          // Create the autocomplete instance directly
          const autocomplete = new window.google.maps.places.Autocomplete(
            inputRef.current!, 
            options
          );
          
          // Store the reference
          autocompleteRef.current = autocomplete;
          
          // Add event listener for place selection
          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            
            if (place && place.formatted_address) {
              console.log('Place selected:', place.formatted_address);
              setManualLocation(place.formatted_address);
              setFormattedAddress(place.formatted_address);
              
              // Automatically update location when selected from autocomplete
              if (onLocationUpdate) {
                onLocationUpdate(place.formatted_address);
              }
              
              // Update coordinates if available
              if (onCoordinatesUpdate && place.geometry && place.geometry.location) {
                const location: Location = {
                  lat: place.geometry.location.lat(),
                  lng: place.geometry.location.lng()
                };
                onCoordinatesUpdate(location);
              }
            } else {
              console.warn('Selected place has no formatted address');
            }
          });
          
          setPlacesApiStatus('loaded');
          console.log('Autocomplete setup complete');
        } catch (error) {
          console.error('Failed to initialize Places Autocomplete:', error);
          setPlacesApiStatus('error');
          // Continue without autocomplete - user can still manually enter location
        }
      };
      
      setupAutocomplete();
      
      // Cleanup function - using try/catch to avoid potential errors
      return () => {
        try {
          if (autocompleteRef.current && window.google && window.google.maps && window.google.maps.event) {
            window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
            autocompleteRef.current = null;
          }
        } catch (error) {
          console.error('Error cleaning up autocomplete:', error);
        }
      };
    }
  }, [onLocationUpdate, onCoordinatesUpdate]);

  const handleManualLocationSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!manualLocation.trim()) return;
    
    setIsValidating(true);
    setGeocodeError('');
    
    // If the location was selected from autocomplete, we already have the formatted address
    if (formattedAddress && formattedAddress === manualLocation) {
      if (onLocationUpdate) {
        onLocationUpdate(formattedAddress);
      }
      setIsValidating(false);
      return;
    }
    
    console.log("Attempting to geocode manually entered location:", manualLocation);
    
    try {
      // Try to use the getAddressFromSearch utility function
      const locationDetails = await getAddressFromSearch(manualLocation);
      
      if (locationDetails && locationDetails.formattedAddress) {
        console.log("Found address:", locationDetails.formattedAddress);
        console.log("with coordinates:", locationDetails.location);
        
        // Update state with the formatted address
        setFormattedAddress(locationDetails.formattedAddress);
        
        // Notify parent component
        if (onLocationUpdate) {
          onLocationUpdate(locationDetails.formattedAddress);
        }
        
        // Update coordinates if available
        if (onCoordinatesUpdate && locationDetails.location) {
          onCoordinatesUpdate(locationDetails.location);
        }
      } else {
        throw new Error('Geocoding returned no results');
      }
    } catch (error) {
      console.error('Error geocoding location:', error);
      
      // Try direct geocoding as a fallback
      try {
        // Load Google Maps API with Geocoding
        const google = await loadGoogleMaps({ libraries: ['geocoding'] });
        
        if (!google || !google.maps || !google.maps.Geocoder) {
          throw new Error('Google Maps Geocoder not available');
        }
        
        // Create geocoder
        const geocoder = new google.maps.Geocoder();
        
        // Wrap geocoder in a Promise for better error handling
        const geocodePromise = new Promise<string>((resolve, reject) => {
          geocoder.geocode({ 
            address: manualLocation,
            region: 'us' // Add region to improve geocoding accuracy
          }, (results: any, status: any) => {
            console.log("Geocode status:", status);
            
            if (status === 'OK' && results && results[0]) {
              resolve(results[0].formatted_address);
            } else if (status === 'ZERO_RESULTS') {
              reject(new Error('No locations found'));
            } else {
              reject(new Error(`Geocoding failed: ${status}`));
            }
          });
        });
        
        // Wait for geocoding to complete
        const address = await geocodePromise;
        
        // Update state with the formatted address
        setFormattedAddress(address);
        
        // Notify parent component
        if (onLocationUpdate) {
          onLocationUpdate(address);
        }
      } catch (error) {
        const fallbackError = error as Error;
        console.error('Fallback geocoding also failed:', fallbackError);
        
        if (fallbackError.message?.includes('No locations found')) {
          setGeocodeError('No locations found. Please try with a more specific address.');
        } else if (fallbackError.message?.includes('OVER_QUERY_LIMIT')) {
          setGeocodeError('Too many requests. Please try again in a moment.');
        } else if (fallbackError.message?.includes('REQUEST_DENIED')) {
          setGeocodeError('Location service access denied. Please try again later.');
        } else if (fallbackError.message?.includes('INVALID_REQUEST')) {
          setGeocodeError('Please enter a valid location.');
        } else {
          setGeocodeError('Could not find that location. Please try with a more specific address.');
        }
        
        setFormattedAddress('');
      }
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <Card className="mb-6 overflow-hidden shadow-md border border-gray-100 relative">
      <div className="absolute -inset-[50%] bg-purple-300/5 blur-3xl rounded-full animate-float"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-xl -mr-8 -mt-8 animate-pulse-purple"></div>
      <CardContent className="px-6 py-5 relative z-10">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Your Location</h3>
        
        {placesApiStatus === 'error' && (
          <Alert variant="destructive" className="mb-4 shadow-sm">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Address autocomplete isn't available, but you can still manually enter and verify your location.
            </AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleManualLocationSubmit} className="space-y-4">
          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              Enter your city, state or full address below
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    ref={inputRef}
                    placeholder="e.g. Atlanta, GA or 123 Main St, Atlanta, GA"
                    value={manualLocation}
                    onChange={(e) => setManualLocation(e.target.value)}
                    className="w-full pl-10 py-6 border-gray-200 bg-gray-50 focus:bg-white transition-colors"
                    disabled={isValidating}
                  />
                </div>
                {geocodeError && (
                  <p className="text-xs text-destructive mt-2">{geocodeError}</p>
                )}
              </div>
              <Button 
                type="submit" 
                className="shadow-sm bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white" 
                disabled={!manualLocation.trim() || isValidating}
              >
                {isValidating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <MapIcon className="h-4 w-4 mr-2" />
                    Set Location
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {formattedAddress && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-md mt-4 shadow-sm">
              <div className="flex items-start">
                <MapPin className="h-5 w-5 mt-0.5 mr-3 text-gray-500" />
                <div>
                  <p className="font-medium text-gray-800">{formattedAddress}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Verified location
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {!formattedAddress && (
            <Button 
              type="button"
              variant="outline"
              className="w-full border border-purple-100 text-purple-600 bg-purple-50 hover:bg-purple-100 mt-2 shadow-sm"
              onClick={() => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(
                    (position) => {
                      console.log("Got current position:", position.coords);
                      if (onCoordinatesUpdate) {
                        const location: Location = {
                          lat: position.coords.latitude,
                          lng: position.coords.longitude
                        };
                        onCoordinatesUpdate(location);
                      }
                      setIsValidating(true);
                      
                      const geocoder = new window.google.maps.Geocoder();
                      geocoder.geocode({
                        location: {
                          lat: position.coords.latitude,
                          lng: position.coords.longitude
                        }
                      }, (results: any[] | null, status: string) => {
                        setIsValidating(false);
                        if (status === "OK" && results && results[0]) {
                          const address = results[0].formatted_address;
                          setManualLocation(address);
                          setFormattedAddress(address);
                          
                          if (onLocationUpdate) {
                            onLocationUpdate(address);
                          }
                        } else {
                          console.error("Geocoder failed:", status);
                        }
                      });
                    },
                    (error) => {
                      console.error("Geolocation error:", error);
                      setGeocodeError("Couldn't access your location. Please enter it manually.");
                    }
                  );
                } else {
                  setGeocodeError("Geolocation is not supported by your browser. Please enter your location manually.");
                }
              }}
            >
              <MapIcon className="h-4 w-4 mr-2" />
              Use my current location
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  );
}