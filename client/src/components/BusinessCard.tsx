import { BusinessCardProps } from '@/types';
import { Heart, MapPin, Phone, Globe, ExternalLink, Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function BusinessCard({
  business,
  isFavorite,
  onToggleFavorite,
  onDirections
}: BusinessCardProps) {
  const handleToggleFavorite = () => {
    onToggleFavorite(business);
  };

  const handleDirections = () => {
    onDirections(business);
  };

  // Handle call button click
  const handleCall = () => {
    if (business.phoneNumber) {
      window.location.href = `tel:${business.phoneNumber.replace(/\D/g, '')}`;
    }
  };

  // Format distance to show in miles with 1 decimal place
  const distanceInMiles = business.distance 
    ? (business.distance / 1609.34).toFixed(1) 
    : null;

  return (
    <div className="bg-white border border-gray-200 rounded-md mb-2 overflow-hidden">
      <div className="p-3 flex flex-col sm:flex-row">
        {/* Business name and distance */}
        <div className="flex-grow pr-2">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-lg text-primary mr-2">{business.name}</h3>
            <div className="flex items-center">
              {distanceInMiles && (
                <span className="text-sm text-neutral-dark mr-2">
                  {distanceInMiles} mi
                </span>
              )}
              <button 
                className={cn(
                  "p-1 rounded-full focus:outline-none",
                  isFavorite ? "text-red-500" : "text-neutral-dark hover:text-red-500"
                )}
                onClick={handleToggleFavorite}
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                <Heart className={cn("h-4 w-4", isFavorite ? "fill-current" : "")} />
              </button>
            </div>
          </div>
          
          {/* Category */}
          {business.category && (
            <p className="text-sm text-neutral-dark mb-2">{business.category}</p>
          )}
          
          {/* Address */}
          <div className="flex items-start mb-1">
            <MapPin className="h-4 w-4 text-primary mr-1 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-neutral-dark">{business.address}</p>
          </div>
          
          {/* Phone */}
          {business.phoneNumber && (
            <div className="flex items-center mb-1">
              <Phone className="h-4 w-4 text-primary mr-1 flex-shrink-0" />
              <a 
                href={`tel:${business.phoneNumber.replace(/\D/g, '')}`}
                className="text-sm text-neutral-dark hover:underline"
              >
                {business.phoneNumber}
              </a>
            </div>
          )}
          
          {/* Website */}
          {business.website && (
            <div className="flex items-center">
              <Globe className="h-4 w-4 text-primary mr-1 flex-shrink-0" />
              <a 
                href={business.website} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-sm text-primary hover:underline flex items-center"
              >
                Website
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </div>
          )}
        </div>
        
        {/* Action buttons */}
        <div className="flex flex-col md:flex-row items-center gap-2 mt-3 sm:mt-0 sm:ml-2">
          {business.phoneNumber && (
            <Button
              variant="secondary"
              size="sm"
              className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white w-full md:w-auto"
              onClick={handleCall}
            >
              <Phone className="h-4 w-4" /> Call Now
            </Button>
          )}
          <Button 
            variant="default"
            size="sm"
            className="flex items-center gap-1 bg-primary text-white w-full md:w-auto hover:bg-primary-dark"
            onClick={handleDirections}
          >
            <Navigation className="h-4 w-4" /> Directions
          </Button>
        </div>
      </div>
    </div>
  );
}
