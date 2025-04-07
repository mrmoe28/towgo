import { useState, useEffect } from 'react';
import { useWebSearch } from '../hooks/useWebSearch';
import WebSearchBar from '../components/WebSearchBar';
import VehicleInfoForm from '../components/VehicleInfoForm';
import LocationDisplay from '../components/LocationDisplay';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, AlertTriangle, Loader2, Phone, MapPin, Globe, Star, Clock } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { loadGoogleMaps } from '../lib/geolocation';
import { useLoadingState } from '../hooks/useLoadingState';
import { useLoading } from '../contexts/LoadingContext';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from '@/components/ui/separator';
import { Location } from '@/types';

// Interface for vehicle information
interface VehicleInfo {
  make: string;
  model: string;
  year: string;
  type: string;
  size: string;
  additionalInfo: string;
  phoneNumber: string;
  pickupLocation: string;
  dropoffLocation: string;
  image?: File | null;
}

export default function TowTruckSearchPage() {
  const { searchResults, isSearching, error, search } = useWebSearch();
  const [vehicleInfo, setVehicleInfo] = useState<VehicleInfo | null>(null);
  const [isSubmittingVehicle, setIsSubmittingVehicle] = useState(false);
  const [activeTab, setActiveTab] = useState('search');
  const [userLocation, setUserLocation] = useState<string | undefined>(undefined);
  const [coordinates, setCoordinates] = useState<Location | undefined>(undefined);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const { toast } = useToast();
  const { showLoading, hideLoading } = useLoading();
  
  // Use our loading state hook to show the animated loading screen
  useLoadingState(isSearching, 'search');
  
  // Use loading animation for submitting vehicle info
  useEffect(() => {
    if (isSubmittingVehicle) {
      showLoading("Saving your vehicle information...");
    } else {
      hideLoading();
    }
  }, [isSubmittingVehicle, showLoading, hideLoading]);

  // Load Google Maps
  useEffect(() => {
    const loadMaps = async () => {
      try {
        await loadGoogleMaps();
        setGoogleMapsLoaded(true);
        console.log("Google Maps loaded successfully");
      } catch (error) {
        console.error("Failed to load Google Maps:", error);
      }
    };
    
    loadMaps();
  }, []);
  
  // Don't auto-search when the page loads (commented out)
  // useEffect(() => {
  //   const performInitialSearch = async () => {
  //     try {
  //       // If we have a user location, use it for search
  //       if (userLocation) {
  //         await search("tow truck service", { location: userLocation, radius: 10 });
  //       } else {
  //         await search("tow truck service");
  //       }
  //     } catch (error) {
  //       console.error("Error during initial search:", error);
  //     }
  //   };
  //   
  //   performInitialSearch();
  // }, [search, userLocation]);
  
  // Handle location updates (without auto-search)
  const handleLocationUpdate = (location: string) => {
    setUserLocation(location ? location : undefined);
    // Don't auto-search when location updates
    // if (location && !isSearching) {
    //   search("tow truck service", { location, radius: 10 });
    // }
  };

  // Handle search errors
  useEffect(() => {
    if (error) {
      toast({
        title: 'Search Error',
        description: error,
        variant: 'destructive'
      });
    }
  }, [error, toast]);

  const handleSearch = async (query: string, params?: { location?: string, radius?: number }) => {
    console.log("Search triggered with query:", query, "and params:", params);
    // Always search for tow truck companies regardless of query
    const towQuery = query.toLowerCase().includes("tow") ? query : `tow truck ${query}`;
    
    // If no location is provided in params but we have userLocation from LocationDisplay,
    // use that instead
    const searchParams = { ...params };
    if (!searchParams.location && userLocation) {
      console.log("Using user location from LocationDisplay:", userLocation);
      searchParams.location = userLocation;
    }
    
    console.log("Final search params:", searchParams);
    
    try {
      // Direct API call to websearch endpoint instead of using Google Places
      await search(towQuery, searchParams);
    } catch (error) {
      console.error("Search error in handler:", error);
      // Error already handled by the hook
    }
  };
  
  const handleVehicleSubmit = (info: VehicleInfo) => {
    setIsSubmittingVehicle(true);
    
    // Simulate submission process
    setTimeout(() => {
      setVehicleInfo(info);
      setIsSubmittingVehicle(false);
      
      toast({
        title: "Vehicle Information Submitted",
        description: "Your vehicle details have been saved. You can now contact a tow truck company.",
        variant: "default"
      });
      
      // Switch to the search tab
      setActiveTab("search");
    }, 1500);
  };
  
  const formatPhoneNumber = (phone?: string | object) => {
    if (!phone) return 'N/A';
    
    // If phone is an object (like {Main: "123", Mobile: "456"})
    if (typeof phone === 'object') {
      try {
        // Try to extract the first phone number from the object
        const phoneObj = phone as Record<string, string>;
        const firstPhone = Object.values(phoneObj)[0];
        return firstPhone || 'N/A';
      } catch (e) {
        console.error('Error parsing phone object:', e);
        return 'N/A';
      }
    }
    
    // If it's a string, return as is
    return phone;
  };

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <div className="mb-8 relative rounded-lg overflow-hidden">
        {/* Animated dark purple and white gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 animate-gradient-shift"></div>
        
        {/* Animated overlay effects */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent animate-pulse-slow"></div>
        <div className="absolute -inset-[50%] bg-gradient-to-r from-white/5 via-purple-600/5 to-white/10 blur-3xl animate-float"></div>
        
        {/* Content with shadows */}
        <div className="relative py-12 px-8 z-10">
          <div className="flex flex-col items-center text-center">
            <span className="bg-white/20 text-white font-semibold text-sm mb-3 tracking-wider px-4 py-1 rounded-full shadow-sm backdrop-blur-sm">
              PROFESSIONAL ROADSIDE ASSISTANCE
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold mb-3 text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]">
              TowGo Quick Tow
            </h1>
            <div className="bg-gradient-to-r from-white/80 to-purple-200 h-1 w-32 my-3 rounded-full animate-pulse-white"></div>
            <p className="text-white/90 text-lg mb-3 max-w-xl">
              Fast, reliable towing when you need it most
            </p>
            
            {/* Badge with animation */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/30 rounded-full px-6 py-2 text-white text-sm font-medium shadow-md relative overflow-hidden group">
              <span className="relative z-10">24/7 Roadside Assistance</span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/30 to-indigo-600/30 opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
            </div>
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="search" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 mb-6 bg-purple-50 p-1 shadow-md">
          <TabsTrigger 
            value="search" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white"
          >
            Find Tow Trucks
          </TabsTrigger>
          <TabsTrigger 
            value="vehicle" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white"
          >
            Vehicle Details
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="search">
          <LocationDisplay 
            onLocationUpdate={handleLocationUpdate}
            onCoordinatesUpdate={setCoordinates}
          />
          
          <WebSearchBar 
            onSearch={handleSearch}
            isSearching={isSearching}
          />
          
          {vehicleInfo && (
            <Alert className="mb-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <div>
                  <AlertTitle className="text-primary">Vehicle Information Submitted</AlertTitle>
                  <AlertDescription>
                    {vehicleInfo.year} {vehicleInfo.make} {vehicleInfo.model}
                    {vehicleInfo.type ? ` (${vehicleInfo.type})` : ''}
                    {vehicleInfo.pickupLocation && 
                      <div className="mt-1 text-xs">
                        <span className="font-medium">Pickup:</span> {vehicleInfo.pickupLocation}
                      </div>
                    }
                    {vehicleInfo.dropoffLocation && 
                      <div className="text-xs">
                        <span className="font-medium">Drop-off:</span> {vehicleInfo.dropoffLocation}
                      </div>
                    }
                  </AlertDescription>
                </div>
                <Button size="sm" variant="outline" onClick={() => setActiveTab("vehicle")}>
                  Edit Details
                </Button>
              </div>
            </Alert>
          )}
          
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          )}
          
          {isSearching && (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground">Searching for tow truck services...</p>
              </div>
            </div>
          )}
          
          {!isSearching && searchResults && userLocation && (
            <div className="mt-6 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Tow Truck Companies Near You</h2>
                <span className="text-sm text-muted-foreground">
                  {searchResults.totalResults} results • {searchResults.timeTaken}
                </span>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {searchResults.businesses.map((business, index) => (
                  <Card key={index} className="overflow-hidden border border-gray-100 shadow-md hover:shadow-lg transition-all duration-300 relative group">
                    {/* Subtle purple animation effects */}
                    <div className="absolute top-0 left-0 w-1 h-full bg-purple-400 opacity-80 group-hover:h-1 group-hover:w-full group-hover:opacity-10 transition-all duration-300"></div>
                    <div className="absolute -inset-0 bg-purple-300/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <CardHeader className="pb-2 bg-gradient-to-r from-gray-50 to-white relative z-10">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl text-gray-800 group-hover:text-purple-800 transition-colors">{business.title}</CardTitle>
                          {business.rating && (
                            <div className="flex items-center mt-1">
                              <Star className="h-4 w-4 text-amber-500 fill-amber-500 mr-1" />
                              <span className="text-sm font-medium">{business.rating}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-wrap justify-end gap-1 max-w-[180px]">
                          {business.categories?.map((category, i) => (
                            <Badge variant="outline" key={i} className="whitespace-nowrap bg-white shadow-sm border-purple-100">{category}</Badge>
                          ))}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4 pb-2">
                      <p className="text-sm text-gray-600 mb-4">{business.description}</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4">
                        {business.address && (
                          <div className="flex items-start bg-gray-50 p-2 rounded-md">
                            <MapPin className="h-4 w-4 mr-2 mt-0.5 shrink-0 text-gray-500" />
                            <span className="text-sm text-gray-700">{business.address}</span>
                          </div>
                        )}
                        
                        {business.phone && (
                          <div className="flex items-center bg-gray-50 p-2 rounded-md">
                            <Phone className="h-4 w-4 mr-2 shrink-0 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">{formatPhoneNumber(business.phone)}</span>
                          </div>
                        )}
                        
                        {business.website && (
                          <div className="flex items-center bg-gray-50 p-2 rounded-md">
                            <Globe className="h-4 w-4 mr-2 shrink-0 text-gray-500" />
                            <a 
                              href={business.website.startsWith('http') ? business.website : `https://${business.website}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-gray-700 hover:text-gray-900 hover:underline truncate"
                            >
                              {business.website.replace(/^https?:\/\//i, '')}
                            </a>
                          </div>
                        )}
                        
                        {business.hours && Array.isArray(business.hours) && business.hours.length > 0 && (
                          <div className="flex items-start sm:col-span-2 bg-gray-50 p-2 rounded-md">
                            <Clock className="h-4 w-4 mr-2 mt-0.5 shrink-0 text-gray-500" />
                            <div className="text-xs text-gray-700">
                              {business.hours.map((hour, i) => (
                                <div key={i} className="mb-0.5">{hour}</div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    
                    {/* Divider for action buttons */}
                    <div className="px-6">
                      <Separator className="my-2" />
                    </div>
                    
                    <CardFooter className="py-4 flex justify-between items-center bg-white">
                      <div className="text-xs text-gray-500 flex items-center">
                        {vehicleInfo ? (
                          <Badge variant="outline" className="mr-2 bg-green-50 text-green-700 border-green-200 shadow-sm">
                            Vehicle Info Ready
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="mr-2 hover:bg-gray-100 cursor-pointer shadow-sm" onClick={() => setActiveTab("vehicle")}>
                            Add Vehicle Info
                          </Badge>
                        )}
                        <span>Source: {business.source}</span>
                      </div>
                      <div className="flex space-x-2">
                        {/* Always show Call button with a phone number if available, or use a default emergency number */}
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="bg-white text-purple-700 hover:text-purple-900 hover:bg-purple-50 border-purple-200 shadow-sm transition-colors" 
                          asChild
                        >
                          <a href={business.phone && typeof business.phone === 'string' && business.phone !== 'Not provided' && business.phone !== 'N/A' 
                              ? `tel:${business.phone.replace(/[^0-9]/g, '')}` 
                              : `tel:4042221111`}
                          >
                            <Phone className="h-4 w-4 mr-1.5" />
                            {business.phone && typeof business.phone === 'string' && business.phone !== 'Not provided' && business.phone !== 'N/A' 
                              ? 'Call Now' 
                              : 'Call Emergency'}
                          </a>
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="bg-white text-purple-700 hover:text-purple-900 hover:bg-purple-50 border-purple-200 shadow-sm transition-colors" 
                          asChild
                        >
                          <a 
                            href={business.address && typeof business.address === 'string' && business.address !== 'Not specified' && business.address !== 'N/A'
                              ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(business.address)}&travelmode=driving`
                              : `https://www.google.com/maps/search/tow+truck+near+me`
                            } 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <MapPin className="h-4 w-4 mr-1.5" />
                            {business.address && typeof business.address === 'string' && business.address !== 'Not specified' && business.address !== 'N/A'
                              ? 'Directions' 
                              : 'Find Nearby'
                            }
                          </a>
                        </Button>
                        {/* Only show website button if it's available */}
                        {business.website && typeof business.website === 'string' && business.website !== 'Not specified' && (
                          <Button 
                            size="sm" 
                            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-sm transition-colors" 
                            asChild
                          >
                            <a 
                              href={business.website.startsWith('http') ? business.website : `https://${business.website}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              Visit Website
                            </a>
                          </Button>
                        )}
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
              
              {searchResults.sources && searchResults.sources.length > 0 && (
                <div className="mt-4">
                  <Separator className="my-4" />
                  <p className="text-xs text-muted-foreground">
                    Information sourced from: {searchResults.sources.join(', ')}
                  </p>
                </div>
              )}
            </div>
          )}
          
          {!isSearching && !searchResults && !error && (
            <div className="text-center py-12 border rounded-lg bg-muted/10">
              <p className="text-xl font-semibold mb-2">Looking for tow truck services</p>
              <p className="text-muted-foreground">
                Enter your location above to find tow truck companies nearby
              </p>
            </div>
          )}
          
          {!isSearching && searchResults && !userLocation && (
            <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200 shadow-sm">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 mr-3 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-yellow-800">Location Required</h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    Please set your location above to see tow truck services near you. We need this to provide accurate results.
                  </p>
                </div>
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="vehicle">
          <VehicleInfoForm
            onSubmit={handleVehicleSubmit}
            isSubmitting={isSubmittingVehicle}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}