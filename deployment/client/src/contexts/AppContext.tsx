import React, { createContext, ReactNode, useContext, useMemo } from 'react';
import { AuthProvider } from './AuthContext';
import { SettingsProvider } from '../hooks/useSettings.tsx';
import { FavoritesProvider } from '../hooks/useFavorites.tsx';
import { ReferralsProvider } from '../hooks/useReferrals.tsx';
import { AchievementsProvider } from '../hooks/useAchievements.tsx';

// Create a context to track if all providers are initialized
const AppContext = createContext<{ initialized: boolean }>({
  initialized: false
});

export const useAppContext = () => useContext(AppContext);

interface AppProviderProps {
  children: ReactNode;
}

/**
 * AppProvider combines all the application state providers
 * into a single organized component tree, making it easier to:
 * 1. Understand the overall state structure
 * 2. Manage provider dependencies
 * 3. Debug state-related issues
 */
export function AppProvider({ children }: AppProviderProps) {
  // Using useMemo to avoid unnecessary re-creation of the context value
  const contextValue = useMemo(() => ({ initialized: true }), []);

  return (
    <AppContext.Provider value={contextValue}>
      <AuthProvider>
        <SettingsProvider>
          <FavoritesProvider>
            <ReferralsProvider>
              <AchievementsProvider>
                {children}
              </AchievementsProvider>
            </ReferralsProvider>
          </FavoritesProvider>
        </SettingsProvider>
      </AuthProvider>
    </AppContext.Provider>
  );
}