import { useEffect } from 'react';
import { useLoading } from '../contexts/LoadingContext';

/**
 * A custom hook to manage loading state for data fetching operations
 * with appropriate loading messages for the animated loading screen.
 */
export function useLoadingState(isLoading: boolean, type: 'search' | 'location' | 'services' | 'auth' = 'search') {
  const { showLoading, hideLoading } = useLoading();
  
  // Define loading messages based on the type of operation
  const getLoadingMessage = () => {
    switch (type) {
      case 'search':
        return "Finding the best tow services nearby...";
      case 'location':
        return "Pinpointing your location...";
      case 'services':
        return "Loading available services...";
      case 'auth':
        return "Verifying your account...";
      default:
        return "Loading...";
    }
  };
  
  useEffect(() => {
    if (isLoading) {
      showLoading(getLoadingMessage());
    } else {
      hideLoading();
    }
    
    // Clean up
    return () => {
      hideLoading();
    };
  }, [isLoading, showLoading, hideLoading]);
  
  return { getLoadingMessage };
}