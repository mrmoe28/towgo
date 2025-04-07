import { useState, useEffect, useRef } from 'react';
import { useDeviceDetect } from '../hooks/useDeviceDetect';

/**
 * Determines if the browser supports adding the app to home screen
 */
export function usePwaInstallPrompt() {
  const { isMobile, isIOS, isAndroid, isStandalone } = useDeviceDetect();
  
  // Check if the app can be installed (not already installed and on a mobile device)
  const canInstall = isMobile && !isStandalone;
  
  // Get platform-specific installation instructions
  const getInstallInstructions = () => {
    if (isIOS) {
      return {
        title: 'Install TowGo on your iPhone',
        steps: [
          'Tap the Share button in your browser',
          'Scroll down and tap "Add to Home Screen"',
          'Tap "Add" in the upper right corner'
        ]
      };
    } else if (isAndroid) {
      return {
        title: 'Install TowGo on your Android device',
        steps: [
          'Tap the menu button in your browser',
          'Tap "Install app" or "Add to Home Screen"',
          'Follow the on-screen instructions'
        ]
      };
    } else {
      return {
        title: 'Install TowGo',
        steps: [
          'Open this site in a mobile browser',
          'Follow the prompts to add to your home screen'
        ]
      };
    }
  };
  
  return {
    canInstall,
    isStandalone,
    installInstructions: getInstallInstructions()
  };
}

/**
 * Detects network status for offline capabilities
 */
export function useNetworkStatus() {
  const onlineState = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const isOnline = onlineState[0];
  const setIsOnline = onlineState[1];
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return { isOnline };
}

/**
 * Optimizes the app for mobile by preventing unwanted behaviors like
 * pinch-zoom, double-tap, and handling the viewport
 */
export function useMobileOptimizations() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Prevent pinch zoom on iOS
    document.addEventListener('gesturestart', (e) => {
      e.preventDefault();
    });
    
    // Prevent double-tap zoom
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (e) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    }, false);
    
    // Set viewport on orientation change
    const setViewportHeight = () => {
      // First we get the viewport height and we multiply it by 1% to get a value for a vh unit
      const vh = window.innerHeight * 0.01;
      // Then we set the value in the --vh custom property to the root of the document
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    // Set viewport height initially and on resize/orientation change
    setViewportHeight();
    window.addEventListener('resize', setViewportHeight);
    window.addEventListener('orientationchange', setViewportHeight);
    
    return () => {
      document.removeEventListener('gesturestart', (e) => {
        e.preventDefault();
      });
      window.removeEventListener('resize', setViewportHeight);
      window.removeEventListener('orientationchange', setViewportHeight);
    };
  }, []);
}

/**
 * Hook for handling mobile-specific pull-to-refresh behavior
 */
export function usePullToRefresh(onRefresh: () => Promise<void>) {
  const refreshingState = useState(false);
  const refreshing = refreshingState[0];
  const setRefreshing = refreshingState[1];
  const startY = useRef(0);
  const { isMobile } = useDeviceDetect();
  
  useEffect(() => {
    if (!isMobile || typeof window === 'undefined') return;
    
    const handleTouchStart = (e: TouchEvent) => {
      startY.current = e.touches[0].clientY;
    };
    
    const handleTouchMove = async (e: TouchEvent) => {
      const currentY = e.touches[0].clientY;
      const scrollTop = document.documentElement.scrollTop;
      
      // Only trigger refresh when at the top of the page and pulling down
      if (scrollTop <= 0 && currentY - startY.current > 150 && !refreshing) {
        setRefreshing(true);
        
        try {
          await onRefresh();
        } finally {
          setRefreshing(false);
        }
      }
    };
    
    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);
    
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isMobile, onRefresh, refreshing]);
  
  return { refreshing };
}