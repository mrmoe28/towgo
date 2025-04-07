import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Location } from '@/types';
import { MapPin, Share2, Copy, Check, AlertTriangle } from "lucide-react";

// Add Google Maps type declaration
declare global {
  interface Window {
    google: any;
  }
}

// Location sharing data props
interface LocationSharingProps {
  location?: Location;
  address?: string;
  isEnabled?: boolean;
}

export default function LocationSharingSimple({ 
  location, 
  address, 
  isEnabled = true 
}: LocationSharingProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  
  // Initialize map when component mounts and location changes
  useEffect(() => {
    if (!location || !mapContainerRef.current) return;
    
    const initMap = () => {
      try {
        if (!window.google) {
          console.error("Google Maps not loaded");
          return;
        }
        
        // Create map if it doesn't exist yet
        if (!mapInstanceRef.current) {
          mapInstanceRef.current = new window.google.maps.Map(mapContainerRef.current, {
            center: { lat: location.lat, lng: location.lng },
            zoom: 15,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false
          });
        } else {
          // Just update center if map already exists
          mapInstanceRef.current.setCenter({ lat: location.lat, lng: location.lng });
        }
        
        // Create or update marker
        if (!markerRef.current) {
          markerRef.current = new window.google.maps.Marker({
            position: { lat: location.lat, lng: location.lng },
            map: mapInstanceRef.current,
            animation: window.google.maps.Animation.DROP
          });
        } else {
          markerRef.current.setPosition({ lat: location.lat, lng: location.lng });
        }
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    };
    
    initMap();
  }, [location]);
  
  // Handle location sharing
  const handleShare = async () => {
    try {
      if (!address) {
        toast({
          variant: "destructive",
          title: "Cannot share location",
          description: "No address information available to share",
        });
        return;
      }
      
      setIsSharing(true);
      
      // Calculate expiry time - default to 1 hour
      const now = new Date();
      let expiryDate = new Date(now);
      expiryDate.setHours(now.getHours() + 1);
      
      // Prepare share data
      const shareData = {
        address: address,
        location: location,
        accuracy: 'exact',
        expires: expiryDate.toISOString(),
        includeVehicleInfo: false
      };
      
      // Send data to server to create share
      const response = await fetch('/api/location-share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(shareData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create location share');
      }
      
      const result = await response.json();
      
      // Create shareable URL
      const shareableUrl = `${window.location.origin}/location-share?id=${result.shareId}`;
      setShareLink(shareableUrl);
      
      toast({
        title: "Location Shared",
        description: "Your location has been shared successfully",
      });
    } catch (error) {
      console.error('Error sharing location:', error);
      toast({
        variant: "destructive",
        title: "Sharing Failed",
        description: error instanceof Error ? error.message : "Failed to share location",
      });
    } finally {
      setIsSharing(false);
    }
  };
  
  // Copy link to clipboard
  const copyLink = () => {
    if (!shareLink) return;
    
    navigator.clipboard.writeText(shareLink).then(
      () => {
        setLinkCopied(true);
        toast({
          title: "Link Copied",
          description: "Location link copied to clipboard",
        });
        
        // Reset the copied state after 3 seconds
        setTimeout(() => setLinkCopied(false), 3000);
      },
      (err) => {
        console.error('Could not copy link: ', err);
        toast({
          variant: "destructive",
          title: "Copy Failed",
          description: "Could not copy link to clipboard",
        });
      }
    );
  };
  
  // Reset sharing state
  const resetShare = () => {
    setShareLink(null);
  };
  
  if (!isEnabled) {
    return null;
  }
  
  return (
    <div className="mt-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5 text-primary" />
            Your Location
          </CardTitle>
        </CardHeader>
        
        <CardContent className="pt-2 pb-4">
          {/* Map container */}
          <div 
            ref={mapContainerRef} 
            className="w-full h-[200px] rounded-md overflow-hidden mb-3 border"
            style={{ display: location ? 'block' : 'none' }}
          ></div>
          
          {/* Address display */}
          {address ? (
            <div className="mb-4 p-3 bg-muted rounded-md">
              <div className="font-medium">{address}</div>
            </div>
          ) : (
            <div className="mb-4 p-3 bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-md text-sm flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0 text-yellow-600" />
              <span>No location set. Please enter your location above to enable all features.</span>
            </div>
          )}
          
          {/* Share link display */}
          {shareLink && (
            <div className="p-3 bg-primary/10 rounded-md border mb-3">
              <h3 className="font-medium mb-1">Your location is ready to share!</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Use this link to share your location
              </p>
              
              <div className="flex space-x-2">
                <Input 
                  value={shareLink} 
                  readOnly 
                  className="bg-background text-sm"
                />
                <Button 
                  size="sm"
                  onClick={copyLink}
                  variant={linkCopied ? "default" : "outline"}
                >
                  {linkCopied ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter>
          {shareLink ? (
            <Button 
              variant="outline"
              className="w-full"
              onClick={resetShare}
            >
              Create New Share
            </Button>
          ) : (
            <Button 
              className="w-full"
              disabled={!address || isSharing}
              onClick={handleShare}
            >
              {isSharing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Share Link...
                </>
              ) : (
                <>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share My Location
                </>
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}