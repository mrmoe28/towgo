import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Bell, Menu, X, Gift, MapPin, Car, Share2, User, Settings, CreditCard, Crown, LogOut } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { TowGoLogo } from "@/components/ui/logo";
import { useAuth } from "@/hooks/use-auth";

// Header component
export function Header() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { logout } = useAuth();

  // Don't show header on landing page
  const isLandingPage = location === '/' || location === '/landing';
  
  if (isLandingPage) {
    return null;
  }
  
  return (
    <header className="bg-white border-b py-4 mb-4 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <TowGoLogo className="h-10 w-10" />
            <span className="font-bold text-xl bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              TowGo
            </span>
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-2">
          <Link href="/search">
            <Button variant={location === '/search' ? "default" : "ghost"} className={location === '/search' ? 'btn-gradient' : ''}>
              Search
            </Button>
          </Link>
          <Link href="/location-share">
            <Button variant={location === '/location-share' ? "default" : "ghost"} className={location === '/location-share' ? 'btn-gradient' : ''}>
              Share Location
            </Button>
          </Link>

          <Link href="/referrals">
            <Button variant={location === '/referrals' ? "default" : "ghost"} className={location === '/referrals' ? 'btn-gradient' : ''}>
              <Gift className="h-4 w-4 mr-2" />
              Referrals
            </Button>
          </Link>
          <Link href="/services">
            <Button variant={location === '/services' ? "default" : "ghost"} className={location === '/services' ? 'btn-gradient' : ''}>
              <CreditCard className="h-4 w-4 mr-2" />
              Services
            </Button>
          </Link>
          <Link href="/subscription">
            <Button variant={location === '/subscription' ? "default" : "ghost"} className={location === '/subscription' ? 'btn-gradient' : ''}>
              <Crown className="h-4 w-4 mr-2" />
              Premium
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
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-500 hover:text-red-700" onClick={async () => {
                try {
                  await logout();
                } catch (error) {
                  console.error('Logout failed:', error);
                }
              }}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
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
                  <Link href="/" className="flex items-center space-x-2" onClick={() => setIsMobileMenuOpen(false)}>
                    <TowGoLogo className="h-8 w-8" />
                    <span className="font-bold text-xl bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                      TowGo
                    </span>
                  </Link>
                  <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                
                <div className="flex flex-col space-y-4">
                  <Link href="/search" onClick={() => setIsMobileMenuOpen(false)}>
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

                  <Link href="/referrals" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <Gift className="h-4 w-4 mr-2" />
                      Referrals
                    </Button>
                  </Link>
                  <Link href="/services" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Services
                    </Button>
                  </Link>
                  <Link href="/subscription" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <Crown className="h-4 w-4 mr-2" />
                      Premium
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
                  
                  <Separator className="my-2" />
                  
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={async () => {
                      setIsMobileMenuOpen(false);
                      try {
                        await logout();
                      } catch (error) {
                        console.error('Logout failed:', error);
                      }
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

// Logout button component
export function LogoutButton({ onLogout }: { onLogout: () => Promise<void> }) {
  const [, navigate] = useLocation();
  
  const handleLogout = async () => {
    try {
      await onLogout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  
  return (
    <Button variant="ghost" onClick={handleLogout} className="text-red-500 hover:text-red-700 hover:bg-red-50">
      <LogOut className="h-4 w-4 mr-2" />
      Logout
    </Button>
  );
}