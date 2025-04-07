import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { lazy, Suspense, useEffect, createContext, useContext, useState } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { LoadingProvider } from "./contexts/LoadingContext";
import { SettingsProvider } from "./hooks/useSettings.tsx";
import { FavoritesProvider } from "./hooks/useFavorites.tsx";
import { ReferralsProvider } from "./hooks/useReferrals.tsx";
import { AchievementsProvider } from "./hooks/useAchievements.tsx";
import { useAuth } from "./hooks/use-auth";
import { useLoading } from "./contexts/LoadingContext";
import { Layout } from "@/components/layout/Layout";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import LoadingScreen from "./components/LoadingScreen";
import { useDeviceDetect } from "./hooks/useDeviceDetect";
import { useMobileOptimizations, usePwaInstallPrompt, useNetworkStatus } from "./utils/pwaHelpers";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

// Lazy load all pages to reduce initial bundle size - default exports
const NotFound = lazy(() => import("@/pages/not-found"));
const TowTruckSearchPage = lazy(() => import("@/pages/TowTruckSearchPage"));
const LocationSharePage = lazy(() => import("@/pages/LocationSharePage"));
const ReferralsPage = lazy(() => import("@/pages/ReferralsPage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
const SubscriptionPage = lazy(() => import("@/components/subscription/SubscriptionPage"));

// Lazy load named exports by wrapping them in a default property
const LazyLandingPage = lazy(() => 
  import("@/components/landing-page").then(module => ({ default: module.LandingPage }))
);
const LazyServicesPage = lazy(() => 
  import("@/components/checkout/ServicesPage").then(module => ({ default: module.ServicesPage }))
);
const LazyCheckoutPage = lazy(() => 
  import("@/components/checkout/CheckoutPage").then(module => ({ default: module.CheckoutPage }))
);
const LazyLoginPage = lazy(() =>
  import("@/pages/LoginPage").then(module => ({ default: module.LoginPage }))
);
const LazySignupPage = lazy(() =>
  import("@/pages/SignupPage").then(module => ({ default: module.SignupPage }))
);



// Mobile context for app-wide access to device information
type MobileContextType = {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isStandalone: boolean;
  isOnline: boolean;
  installPrompt: {
    show: boolean;
    setShow: (show: boolean) => void;
  };
};

const MobileContext = createContext<MobileContextType>({
  isMobile: false,
  isTablet: false,
  isDesktop: true,
  isIOS: false,
  isAndroid: false,
  isStandalone: false,
  isOnline: true,
  installPrompt: {
    show: false,
    setShow: () => {}
  }
});

export const useMobile = () => useContext(MobileContext);

// Protected route component
function ProtectedRoute({ component: Component, ...rest }: any) {
  const { isAuthenticated, isLoading } = useAuth();
  const { showLoading, hideLoading } = useLoading();
  
  useEffect(() => {
    if (isLoading) {
      showLoading("Verifying your account...");
    } else {
      hideLoading();
    }
    
    return () => {
      hideLoading();
    };
  }, [isLoading, showLoading, hideLoading]);
  
  if (isLoading) {
    // Loading state is now handled by LoadingScreen
    return null;
  }
  
  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Redirect to="/login" />;
  }
  
  // If authenticated, render the component
  return <Component {...rest} />;
}

function Router() {
  const [location] = useLocation();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { isLoading, loadingMessage } = useLoading();
  
  // Common suspense fallback for all lazily loaded routes
  const suspenseFallback = <div className="flex items-center justify-center h-full w-full py-12"><LoadingSpinner /></div>;
  
  return (
    <Layout>
      {/* Global animated loading screen */}
      <LoadingScreen isLoading={isLoading} message={loadingMessage} />
      
      <Switch>
        <Route path="/landing">
          <Suspense fallback={suspenseFallback}>
            <LazyLandingPage />
          </Suspense>
        </Route>
        <Route path="/login">
          <Suspense fallback={suspenseFallback}>
            <LazyLoginPage />
          </Suspense>
        </Route>
        <Route path="/signup">
          <Suspense fallback={suspenseFallback}>
            <LazySignupPage />
          </Suspense>
        </Route>
        <Route path="/">
          {authLoading ? <LoadingSpinner /> : (
            <Suspense fallback={suspenseFallback}>
              <LazyLandingPage />
            </Suspense>
          )}
        </Route>
        <Route path="/search">
          {authLoading ? (
            <LoadingSpinner />
          ) : isAuthenticated ? (
            <Suspense fallback={suspenseFallback}>
              <TowTruckSearchPage />
            </Suspense>
          ) : (
            <Redirect to="/login" />
          )}
        </Route>
        <Route path="/location-share">
          {isAuthenticated ? (
            <Suspense fallback={suspenseFallback}>
              <LocationSharePage />
            </Suspense>
          ) : (
            <Redirect to="/login" />
          )}
        </Route>
        <Route path="/referrals">
          {isAuthenticated ? (
            <Suspense fallback={suspenseFallback}>
              <ReferralsPage />
            </Suspense>
          ) : (
            <Redirect to="/login" />
          )}
        </Route>
        <Route path="/profile">
          {isAuthenticated ? (
            <Suspense fallback={suspenseFallback}>
              <ProfilePage />
            </Suspense>
          ) : (
            <Redirect to="/login" />
          )}
        </Route>
        <Route path="/settings">
          {isAuthenticated ? (
            <Suspense fallback={suspenseFallback}>
              <SettingsPage />
            </Suspense>
          ) : (
            <Redirect to="/login" />
          )}
        </Route>
        <Route path="/services">
          {isAuthenticated ? (
            <Suspense fallback={suspenseFallback}>
              <LazyServicesPage />
            </Suspense>
          ) : (
            <Redirect to="/login" />
          )}
        </Route>
        <Route path="/subscription">
          {isAuthenticated ? (
            <Suspense fallback={suspenseFallback}>
              <SubscriptionPage />
            </Suspense>
          ) : (
            <Redirect to="/login" />
          )}
        </Route>
        <Route path="/checkout/:id">
          {isAuthenticated ? (
            <Suspense fallback={suspenseFallback}>
              <LazyCheckoutPage />
            </Suspense>
          ) : (
            <Redirect to="/login" />
          )}
        </Route>
        <Route path="/checkout/success">
          {isAuthenticated ? (
            <Suspense fallback={suspenseFallback}>
              <LazyCheckoutPage />
            </Suspense>
          ) : (
            <Redirect to="/login" />
          )}
        </Route>
        <Route path="/checkout/cancel">
          {isAuthenticated ? (
            <Suspense fallback={suspenseFallback}>
              <LazyCheckoutPage />
            </Suspense>
          ) : (
            <Redirect to="/login" />
          )}
        </Route>
        <Route>
          <Suspense fallback={suspenseFallback}>
            <NotFound />
          </Suspense>
        </Route>
      </Switch>
    </Layout>
  );
}



function MobileProvider({ children }: { children: React.ReactNode }) {
  // Apply mobile optimizations like preventing pinch zoom, handling viewport
  useMobileOptimizations();
  
  // Get device information
  const deviceInfo = useDeviceDetect();
  
  // Get network status
  const { isOnline } = useNetworkStatus();
  
  // PWA installation prompt state
  const showInstallPromptState = useState(false);
  const showInstallPrompt = showInstallPromptState[0];
  const setShowInstallPrompt = showInstallPromptState[1];
  const { canInstall, installInstructions } = usePwaInstallPrompt();
  
  // Show installation prompt after 3 seconds if the app is installable and not already installed
  useEffect(() => {
    if (canInstall) {
      const timer = setTimeout(() => {
        setShowInstallPrompt(true);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [canInstall]);
  
  // Context value for mobile information
  const mobileContextValue = {
    ...deviceInfo,
    isOnline,
    installPrompt: {
      show: showInstallPrompt,
      setShow: setShowInstallPrompt
    }
  };
  
  return (
    <MobileContext.Provider value={mobileContextValue}>
      {children}
      
      {/* PWA Installation Dialog */}
      <AlertDialog open={showInstallPrompt} onOpenChange={setShowInstallPrompt}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{installInstructions.title}</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-2 mt-2">
                {installInstructions.steps.map((step, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowInstallPrompt(false)}>Got it</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Offline Status Banner */}
      {!isOnline && (
        <div className="fixed bottom-0 left-0 w-full bg-red-500 text-white p-2 text-sm text-center z-50">
          You're currently offline. Some features may not work properly.
        </div>
      )}
    </MobileContext.Provider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LoadingProvider>
          <SettingsProvider>
            <FavoritesProvider>
              <ReferralsProvider>
                <AchievementsProvider>
                  <MobileProvider>
                    <Router />
                  </MobileProvider>
                </AchievementsProvider>
              </ReferralsProvider>
            </FavoritesProvider>
          </SettingsProvider>
        </LoadingProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
