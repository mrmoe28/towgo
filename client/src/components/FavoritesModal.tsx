import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { useFavorites } from '@/hooks/useFavorites';
import { Favorite } from '@shared/schema';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, MapPin, Phone, Heart } from 'lucide-react';
import { getDirectionsUrl } from '@/lib/maps';
import { Skeleton } from '@/components/ui/skeleton';

interface FavoritesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onViewOnMap: (favorite: Favorite) => void;
}

export default function FavoritesModal({
  open,
  onOpenChange,
  onViewOnMap
}: FavoritesModalProps) {
  const { favorites, removeFavorite, isLoading } = useFavorites();

  const handleViewOnMap = (favorite: Favorite) => {
    onOpenChange(false);
    onViewOnMap(favorite);
  };

  const handleRemoveFavorite = async (placeId: string) => {
    await removeFavorite(placeId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full mx-4 max-h-[80vh] flex flex-col">
        <DialogHeader className="border-b border-neutral pb-2">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl font-medium">Saved Favorites</DialogTitle>
            <DialogClose className="text-neutral-dark hover:text-neutral-darkest focus:outline-none">
              <X className="h-5 w-5" />
            </DialogClose>
          </div>
        </DialogHeader>
        
        <ScrollArea className="flex-grow px-1">
          {isLoading ? (
            // Loading skeletons
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="border-b border-neutral py-4 last:border-b-0">
                <div className="flex justify-between">
                  <div>
                    <Skeleton className="h-6 w-40 mb-2" />
                    <Skeleton className="h-4 w-56" />
                  </div>
                  <Skeleton className="h-6 w-6 rounded-full" />
                </div>
                <div className="mt-3 flex gap-6">
                  <Skeleton className="h-5 w-28 rounded" />
                  <Skeleton className="h-5 w-20 rounded" />
                </div>
              </div>
            ))
          ) : favorites.length > 0 ? (
            favorites.map((favorite) => (
              <div key={favorite.id} className="border-b border-neutral py-4 last:border-b-0 hover:bg-gray-50 rounded-md">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-medium text-primary text-lg">{favorite.name}</h3>
                    <p className="text-neutral-dark text-sm mt-1">{favorite.address}</p>
                  </div>
                  <div className="flex items-start">
                    <button 
                      className="text-neutral-dark hover:text-red-500 focus:outline-none p-1 rounded-full hover:bg-red-50"
                      onClick={() => handleRemoveFavorite(favorite.placeId)}
                      aria-label="Remove favorite"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div className="mt-3 flex gap-4">
                  <a 
                    href={favorite.location ? 
                      `https://www.google.com/maps/dir/?api=1&destination=${favorite.location.lat},${favorite.location.lng}` : 
                      '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-primary text-white px-3 py-1 rounded-md hover:bg-primary-dark text-sm flex items-center"
                  >
                    <MapPin className="h-4 w-4 mr-1" />
                    Get Directions
                  </a>
                  {favorite.phoneNumber && (
                    <a 
                      href={`tel:${favorite.phoneNumber.replace(/\D/g, '')}`}
                      className="bg-accent text-white px-3 py-1 rounded-md hover:bg-accent-dark text-sm flex items-center"
                    >
                      <Phone className="h-4 w-4 mr-1" />
                      Call
                    </a>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div id="no-favorites" className="text-center py-10 px-4">
              <div className="bg-red-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <Heart className="text-red-500 h-10 w-10" />
              </div>
              <h3 className="text-lg font-medium text-primary mb-2">No Favorites Yet</h3>
              <p className="text-neutral-dark text-sm max-w-md mx-auto">
                Tap the heart icon on any business card to save it to your favorites for quick access later.
              </p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
