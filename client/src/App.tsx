import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Bell, Menu, X, Trophy, Gift, MapPin, Car, Share2, User, Settings } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
// Dialog removed as part of onboarding removal
// Onboarding component removed as requested
import NotFound from "@/pages/not-found";
import TowTruckSearchPage from "@/pages/TowTruckSearchPage";
import LocationSharePage from "@/pages/LocationSharePage";
import AchievementsPage from "@/pages/AchievementsPage";
import ReferralsPage from "@/pages/ReferralsPage";
import SettingsPage from "@/pages/SettingsPage";
import ProfilePage from "@/pages/ProfilePage";
import { LandingPage } from "@/components/landing-page";
import { SettingsProvider } from "./hooks/useSettings.tsx";
import { FavoritesProvider } from "./hooks/useFavorites.tsx";
import { AchievementsProvider } from "./hooks/useAchievements.tsx";
import { ReferralsProvider } from "./hooks/useReferrals.tsx";

// Header component
function Header() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Don't show header on landing page
  const isLandingPage = location === '/landing';
  
  if (isLandingPage) {
    return null;
  }
  
  return (
    <header className="bg-white border-b py-4 mb-4 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="font-bold text-xl bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            TowGo
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-2">
          <Link href="/">
            <Button variant={location === '/' ? "default" : "ghost"} className={location === '/' ? 'btn-gradient' : ''}>
              Search
            </Button>
          </Link>
          <Link href="/location-share">
            <Button variant={location === '/location-share' ? "default" : "ghost"} className={location === '/location-share' ? 'btn-gradient' : ''}>
              Share Location
            </Button>
          </Link>
          <Link href="/achievements">
            <Button variant={location === '/achievements' ? "default" : "ghost"} className={location === '/achievements' ? 'btn-gradient' : ''}>
              <Trophy className="h-4 w-4 mr-2" />
              Achievements
            </Button>
          </Link>
          <Link href="/referrals">
            <Button variant={location === '/referrals' ? "default" : "ghost"} className={location === '/referrals' ? 'btn-gradient' : ''}>
              <Gift className="h-4 w-4 mr-2" />
              Referrals
            </Button>
          </Link>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-purple-100 text-purple-600 text-xs">
                    JD
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Link href="/profile" className="w-full">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/settings" className="w-full">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link href="/landing" className="w-full">View Landing Page</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
        
        {/* Mobile Navigation */}
        <div className="flex items-center md:hidden">
          <Button variant="ghost" size="icon" className="mr-2">
            <Bell className="h-5 w-5" />
          </Button>
          
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-center mb-8">
                  <Link href="/" className="font-bold text-xl bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent" onClick={() => setIsMobileMenuOpen(false)}>
                    TowGo
                  </Link>
                  <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                
                <div className="flex flex-col space-y-4">
                  <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <Car className="h-4 w-4 mr-2" />
                      Search
                    </Button>
                  </Link>
                  <Link href="/location-share" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <MapPin className="h-4 w-4 mr-2" />
                      Share Location
                    </Button>
                  </Link>
                  <Link href="/achievements" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <Trophy className="h-4 w-4 mr-2" />
                      Achievements
                    </Button>
                  </Link>
                  <Link href="/referrals" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <Gift className="h-4 w-4 mr-2" />
                      Referrals
                    </Button>
                  </Link>
                  
                  <Separator className="my-2" />
                  
                  <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Button>
                  </Link>
                  <Link href="/settings" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Button>
                  </Link>
                  <Link href="/landing" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <Share2 className="h-4 w-4 mr-2" />
                      View Landing Page
                    </Button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

function Router() {
  const [location] = useLocation();
  
  // Removed onboarding/tutorial functionality as requested
  
  const isLandingPage = location === '/landing';
  
  return (
    <>
      {!isLandingPage && <Header />}
      <Switch>
        <Route path="/landing" component={LandingPage} />
        <Route path="/" component={TowTruckSearchPage} />
        <Route path="/location-share" component={LocationSharePage} />
        <Route path="/achievements" component={AchievementsPage} />
        <Route path="/referrals" component={ReferralsPage} />
        <Route path="/profile" component={ProfilePage} />
        <Route path="/settings" component={SettingsPage} />
        <Route component={NotFound} />
      </Switch>
      
      {!isLandingPage && (
        <footer className="border-t py-4 text-center text-gray-500 text-sm">
          <div className="container mx-auto">
            &copy; {new Date().getFullYear()} TowGo
          </div>
        </footer>
      )}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <FavoritesProvider>
          <AchievementsProvider>
            <ReferralsProvider>
              <Router />
            </ReferralsProvider>
          </AchievementsProvider>
        </FavoritesProvider>
      </SettingsProvider>
    </QueryClientProvider>
  );
}

export default App;
