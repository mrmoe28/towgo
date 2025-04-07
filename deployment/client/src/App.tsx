import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { lazy, Suspense } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { SettingsProvider } from "./hooks/useSettings.tsx";
import { FavoritesProvider } from "./hooks/useFavorites.tsx";
import { ReferralsProvider } from "./hooks/useReferrals.tsx";
import { AchievementsProvider } from "./hooks/useAchievements.tsx";
import { useAuth } from "./hooks/use-auth";
import { Layout } from "@/components/layout/Layout";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

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



// Protected route component
function ProtectedRoute({ component: Component, ...rest }: any) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    // Show loading state while checking authentication
    return <LoadingSpinner />;
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
  const { isAuthenticated, isLoading } = useAuth();
  
  // Common suspense fallback for all lazily loaded routes
  const suspenseFallback = <div className="flex items-center justify-center h-full w-full py-12"><LoadingSpinner /></div>;
  
  return (
    <Layout>
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
          {isLoading ? <LoadingSpinner /> : (
            <Suspense fallback={suspenseFallback}>
              <LazyLandingPage />
            </Suspense>
          )}
        </Route>
        <Route path="/search">
          {isLoading ? (
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



function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SettingsProvider>
          <FavoritesProvider>
            <ReferralsProvider>
              <AchievementsProvider>
                <Router />
              </AchievementsProvider>
            </ReferralsProvider>
          </FavoritesProvider>
        </SettingsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
