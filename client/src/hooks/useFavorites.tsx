import React, { createContext, useContext, ReactNode } from 'react';
import { Favorite, Business } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Create context
interface FavoritesContextProps {
  favorites: Favorite[];
  isLoading: boolean;
  addFavorite: (business: Business) => Promise<void>;
  removeFavorite: (placeId: string) => Promise<void>;
  isFavorite: (placeId: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextProps | undefined>(undefined);

// Provider component
export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();

  // Fetch favorites from API
  const { data: favorites = [], isLoading } = useQuery<Favorite[]>({
    queryKey: ['/api/favorites'],
  });

  // Add a favorite
  const addFavoriteMutation = useMutation({
    mutationFn: async (business: Business) => {
      const favoriteData = {
        placeId: business.placeId,
        name: business.name,
        address: business.address,
        phoneNumber: business.phoneNumber || '',
        location: business.location,
      };
      
      await apiRequest('POST', '/api/favorites', favoriteData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
    },
  });

  // Remove a favorite
  const removeFavoriteMutation = useMutation({
    mutationFn: async (placeId: string) => {
      await apiRequest('DELETE', `/api/favorites/${placeId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
    },
  });

  // Add a business to favorites
  const addFavorite = async (business: Business) => {
    await addFavoriteMutation.mutateAsync(business);
  };

  // Remove a business from favorites
  const removeFavorite = async (placeId: string) => {
    await removeFavoriteMutation.mutateAsync(placeId);
  };

  // Check if a business is in favorites
  const isFavorite = (placeId: string) => {
    return favorites.some(fav => fav.placeId === placeId);
  };

  return (
    <FavoritesContext.Provider value={{
      favorites,
      isLoading,
      addFavorite,
      removeFavorite,
      isFavorite,
    }}>
      {children}
    </FavoritesContext.Provider>
  );
};

// Hook for using the favorites context
export const useFavorites = (): FavoritesContextProps => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};