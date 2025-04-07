import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, Globe, MapPin, Navigation, Info } from "lucide-react";
import { SmitheryLocation } from "../lib/smithery";
import { getDirectionsUrl } from "../lib/maps";

interface SmitheryLocationCardProps {
  location: SmitheryLocation;
  onViewDetails: (locationId: string) => void;
}

export default function SmitheryLocationCard({ location, onViewDetails }: SmitheryLocationCardProps) {
  // Format distance to show in miles with 1 decimal place
  const formattedDistance = location.distance 
    ? `${(location.distance / 1609.34).toFixed(1)} mi`
    : 'Unknown distance';

  const handleGetDirections = () => {
    if (location.location) {
      const directionsUrl = getDirectionsUrl(location.location);
      window.open(directionsUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleCallPhone = () => {
    if (location.phoneNumber) {
      window.open(`tel:${location.phoneNumber}`, '_self');
    }
  };

  const handleVisitWebsite = () => {
    if (location.website) {
      window.open(location.website, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Card className="mb-3 overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-lg line-clamp-1">{location.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-1">
                {location.city}, {location.state} • {formattedDistance}
              </p>
            </div>
          </div>
          
          <div className="space-y-1 mt-2">
            {location.address && (
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" />
                <span className="text-sm line-clamp-2">
                  {location.address}, {location.city}, {location.state} {location.postalCode}
                </span>
              </div>
            )}
            
            {location.phoneNumber && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="text-sm">{location.phoneNumber}</span>
              </div>
            )}
            
            {location.website && (
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="text-sm line-clamp-1 text-blue-600 hover:underline cursor-pointer" onClick={handleVisitWebsite}>
                  {location.website.replace(/^https?:\/\//, '')}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-3 pt-0 flex justify-between gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1"
          onClick={() => onViewDetails(location.id)}
        >
          <Info className="h-4 w-4 mr-1" />
          Details
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1"
          onClick={handleGetDirections}
        >
          <Navigation className="h-4 w-4 mr-1" />
          Directions
        </Button>
        
        {location.phoneNumber && (
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={handleCallPhone}
          >
            <Phone className="h-4 w-4 mr-1" />
            Call
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}