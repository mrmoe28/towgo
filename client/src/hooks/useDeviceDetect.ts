import { useState, useEffect } from 'react';

interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isStandalone: boolean;
  isPortrait: boolean;
  screenWidth: number;
  screenHeight: number;
}

export function useDeviceDetect(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isIOS: false,
    isAndroid: false,
    isStandalone: false,
    isPortrait: true,
    screenWidth: typeof window !== 'undefined' ? window.innerWidth : 0,
    screenHeight: typeof window !== 'undefined' ? window.innerHeight : 0
  });

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    const userAgent = window.navigator.userAgent.toLowerCase();
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // Check if running as standalone PWA
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true;

    // Detect iOS
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    
    // Detect Android
    const isAndroid = /android/.test(userAgent);
    
    // Detect mobile - includes phones and small tablets
    const isMobile = 
      /android|webos|iphone|ipod|blackberry|iemobile|opera mini/.test(userAgent) || 
      (width <= 767);
    
    // Detect tablet - typically iPads and larger Android tablets
    const isTablet = 
      /ipad/.test(userAgent) || 
      (/android/.test(userAgent) && !/mobile/.test(userAgent)) ||
      (width >= 768 && width <= 1024);

    // Update device info state
    setDeviceInfo({
      isMobile,
      isTablet,
      isDesktop: !isMobile && !isTablet,
      isIOS,
      isAndroid,
      isStandalone,
      isPortrait: height > width,
      screenWidth: width,
      screenHeight: height
    });

    // Listen for orientation changes
    const handleResize = () => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;
      
      setDeviceInfo(prev => ({
        ...prev,
        isPortrait: newHeight > newWidth,
        screenWidth: newWidth,
        screenHeight: newHeight
      }));
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return deviceInfo;
}

// Utility hook for responsive design based on breakpoints
export function useResponsive() {
  const { screenWidth } = useDeviceDetect();
  
  return {
    isXs: screenWidth < 640, // Mobile small
    isSm: screenWidth >= 640 && screenWidth < 768, // Mobile large
    isMd: screenWidth >= 768 && screenWidth < 1024, // Tablet
    isLg: screenWidth >= 1024 && screenWidth < 1280, // Desktop
    isXl: screenWidth >= 1280, // Large desktop
    // Utility breakpoint checkers
    isMobile: screenWidth < 768,
    isTablet: screenWidth >= 768 && screenWidth < 1024,
    isDesktop: screenWidth >= 1024
  };
}