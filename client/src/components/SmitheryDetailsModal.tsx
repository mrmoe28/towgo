import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Phone, 
  Globe, 
  MapPin, 
  Navigation, 
  Clock, 
  Star, 
  Loader2 
} from "lucide-react";
import { getSmitheryServices, SmitheryLocationDetails, SmitheryService } from "../lib/smithery";
import { getDirectionsUrl } from "../lib/maps";
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface SmitheryDetailsModalProps {
  location: SmitheryLocationDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SmitheryDetailsModal({ 
  location, 
  open, 
  onOpenChange 
}: SmitheryDetailsModalProps) {
  const [services, setServices] = useState<SmitheryService[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load services when a location is selected and dialog is open
    if (location && open) {
      loadServices(location.id);
    } else {
      // Reset state when modal closes
      setServices([]);
      setError(null);
    }
  }, [location, open]);

  const loadServices = async (locationId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const servicesData = await getSmitheryServices(locationId);
      setServices(servicesData || []);
    } catch (error) {
      console.error('Error loading smithery services:', error);
      setError('Failed to load services for this location');
      setServices([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetDirections = () => {
    if (location?.location) {
      const directionsUrl = getDirectionsUrl(location.location);
      window.open(directionsUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleCallPhone = () => {
    if (location?.phoneNumber) {
      window.open(`tel:${location.phoneNumber}`, '_self');
    }
  };

  const handleVisitWebsite = () => {
    if (location?.website) {
      window.open(location.website, '_blank', 'noopener,noreferrer');
    }
  };

  if (!location) return null;

  const renderHours = () => {
    if (!location.hours) return null;
    
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    return (
      <div className="mt-4">
        <h4 className="text-sm font-medium flex items-center gap-1 mb-2">
          <Clock className="h-4 w-4" /> Hours
        </h4>
        <div className="grid grid-cols-2 gap-1 text-sm">
          {days.map((day) => {
            const hours = location.hours?.[day as keyof typeof location.hours];
            return (
              <div key={day} className="flex justify-between">
                <span className="capitalize">{day}:</span>
                <span>{hours || 'Closed'}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderServices = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="py-2 text-sm text-red-500">
          {error}
        </div>
      );
    }
    
    if (services.length === 0) {
      return (
        <div className="py-2 text-sm text-muted-foreground">
          No services information available
        </div>
      );
    }
    
    return (
      <div className="space-y-3 mt-2">
        {services.map((service) => (
          <div key={service.id} className="bg-muted p-3 rounded-md">
            <div className="flex justify-between items-start">
              <h4 className="font-medium">{service.name}</h4>
              {service.price && <Badge variant="outline">{service.price}</Badge>}
            </div>
            {service.description && (
              <p className="text-sm mt-1 text-muted-foreground">{service.description}</p>
            )}
            {service.duration && (
              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" /> {service.duration}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{location.name}</DialogTitle>
          <DialogDescription className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {location.city}, {location.state}
            {location.distance && (
              <span className="ml-1">
                • {(location.distance / 1609.34).toFixed(1)} mi
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
          
        <div className="space-y-4">
          {location.description && (
            <p className="text-sm">{location.description}</p>
          )}
          
          <div className="grid gap-2">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" />
              <span className="text-sm">
                {location.address}, {location.city}, {location.state} {location.postalCode}
              </span>
            </div>
            
            {location.phoneNumber && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="text-sm">{location.phoneNumber}</span>
              </div>
            )}
            
            {location.website && (
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span 
                  className="text-sm text-blue-600 hover:underline cursor-pointer"
                  onClick={handleVisitWebsite}
                >
                  {location.website.replace(/^https?:\/\//, '')}
                </span>
              </div>
            )}
          </div>
          
          {renderHours()}
          
          {(location.rating || location.reviews?.length > 0) && (
            <div className="mt-4">
              {location.rating && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{location.rating.toFixed(1)}</span>
                  {location.reviews && (
                    <span className="text-sm text-muted-foreground">
                      ({location.reviews.length} {location.reviews.length === 1 ? 'review' : 'reviews'})
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
          
          <Separator />
          
          <div>
            <h3 className="text-lg font-medium mb-2">Services</h3>
            {renderServices()}
          </div>
        </div>
        
        <DialogFooter className="flex sm:justify-end gap-2 mt-6">
          <Button onClick={handleGetDirections} className="flex-1 sm:flex-initial">
            <Navigation className="h-4 w-4 mr-2" />
            Directions
          </Button>
          
          {location.phoneNumber && (
            <Button onClick={handleCallPhone} variant="outline" className="flex-1 sm:flex-initial">
              <Phone className="h-4 w-4 mr-2" />
              Call
            </Button>
          )}
          
          {location.website && (
            <Button onClick={handleVisitWebsite} variant="outline" className="flex-1 sm:flex-initial">
              <Globe className="h-4 w-4 mr-2" />
              Website
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}