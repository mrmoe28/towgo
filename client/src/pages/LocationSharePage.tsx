import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { LocationShareCard } from '@/components/ui/share-card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';
import {
  ArrowLeft,
  MapPin,
  Share2,
  Clock,
  Copy,
  CheckCircle,
  AlertTriangle,
  Shield
} from 'lucide-react';

interface LocationShare {
  id: string;
  name: string;
  location: {
    address: string;
    lat: number;
    lng: number;
  };
  expiresAt: string;
  createdAt: string;
}

export default function LocationSharePage() {
  const [isCreating, setIsCreating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPrivacyOptions, setShowPrivacyOptions] = useState(false);
  const [locationShares, setLocationShares] = useState<LocationShare[]>([]);
  const [currentLocationShare, setCurrentLocationShare] = useState<LocationShare | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    expiration: 30, // minutes
    privacyLevel: 'exact' as 'exact' | 'approximate' | 'area',
    includeContactInfo: true
  });
  
  const { toast } = useToast();
  
  useEffect(() => {
    // This would fetch real data from your API in a production environment
    const mockLocationShares: LocationShare[] = [
      {
        id: 'loc-123',
        name: 'Current Location',
        location: {
          address: 'I-85 North, Atlanta, GA',
          lat: 33.7490,
          lng: -84.3880
        },
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes from now
        createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString() // 5 minutes ago
      }
    ];
    
    setLocationShares(mockLocationShares);
    if (mockLocationShares.length > 0) {
      setCurrentLocationShare(mockLocationShares[0]);
    }
  }, []);
  
  const handleCreateShare = () => {
    if (!formData.location.trim()) {
      toast({
        title: "Location required",
        description: "Please enter a location to share",
        variant: "destructive"
      });
      return;
    }
    
    // This would create a real location share via your API in a production environment
    const newShare: LocationShare = {
      id: `loc-${Date.now()}`,
      name: formData.name || 'My Location',
      location: {
        address: formData.location,
        lat: 33.7490, // Example coordinates
        lng: -84.3880
      },
      expiresAt: new Date(Date.now() + formData.expiration * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString()
    };
    
    setLocationShares([newShare, ...locationShares]);
    setCurrentLocationShare(newShare);
    setIsCreating(false);
    setShowSuccess(true);
    
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };
  
  const handleCopyLink = () => {
    if (currentLocationShare) {
      const shareUrl = `https://towgo.replit.app/location/${currentLocationShare.id}`;
      navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
      
      toast({
        title: "Link copied",
        description: "Share link copied to clipboard"
      });
    }
  };
  
  const handleDeleteShare = (id: string) => {
    // This would delete a real location share via your API in a production environment
    setLocationShares(locationShares.filter(share => share.id !== id));
    
    if (currentLocationShare && currentLocationShare.id === id) {
      setCurrentLocationShare(locationShares.length > 1 ? locationShares[1] : null);
    }
    
    toast({
      title: "Location share deleted",
      description: "Your location is no longer being shared"
    });
  };
  
  const getRemainingTime = (expiresAt: string): string => {
    const expirationTime = new Date(expiresAt).getTime();
    const now = Date.now();
    const diffMs = expirationTime - now;
    
    if (diffMs <= 0) return 'Expired';
    
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffHours > 0) {
      const remainingMins = diffMins % 60;
      return `${diffHours}h ${remainingMins}m`;
    }
    
    return `${diffMins}m`;
  };
  
  const handleShare = () => {
    if (currentLocationShare) {
      const shareUrl = `https://towgo.replit.app/location/${currentLocationShare.id}`;
      const text = `I'm sharing my location via TowGo. You can see where I am here:`;
      
      if (navigator.share) {
        navigator.share({
          title: 'My Location | TowGo',
          text,
          url: shareUrl
        }).catch(console.error);
      } else {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
      }
    }
  };
  
  return (
    <div className="container p-4 mx-auto max-w-4xl">
      <div className="mb-6 flex items-center">
        <Button variant="ghost" size="icon" className="mr-2" asChild>
          <Link to="/">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Location Sharing</h1>
      </div>
      
      {showSuccess && (
        <Alert className="mb-6 animate-slide-up bg-green-50 text-green-700">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Your location has been shared successfully!
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          {currentLocationShare ? (
            <div className="animate-slide-up">
              <LocationShareCard
                name="Your Location"
                location={currentLocationShare.location.address}
                locationUrl={`towgo.replit.app/location/${currentLocationShare.id}`}
                expiresIn={getRemainingTime(currentLocationShare.expiresAt)}
                initials="YL"
                onCopyLink={handleCopyLink}
                onShare={handleShare}
                onUpdate={() => setIsCreating(true)}
                onCancel={() => handleDeleteShare(currentLocationShare.id)}
              />
              
              <div className="mt-6 flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreating(true)}
                >
                  Create New Share
                </Button>
                
                <Button 
                  className="btn-gradient"
                  onClick={handleShare}
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Share Location
                </Button>
              </div>
            </div>
          ) : (
            <Card className="animate-slide-up border-dashed border-gray-300">
              <CardContent className="pt-6 flex flex-col items-center justify-center min-h-[300px] text-center">
                <div className="mb-4 rounded-full bg-purple-100 p-3">
                  <MapPin className="h-6 w-6 text-purple-600" />
                </div>
                
                <h3 className="mb-2 text-xl font-medium">No Active Location Shares</h3>
                <p className="mb-6 text-gray-600 max-w-md">
                  Share your current location with friends, family, or tow truck drivers.
                  Set an expiration time for added security.
                </p>
                
                <Button 
                  className="btn-gradient" 
                  onClick={() => setIsCreating(true)}
                >
                  Share My Location
                </Button>
              </CardContent>
            </Card>
          )}
          
          {locationShares.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-medium mb-4">Your Recent Location Shares</h2>
              
              <div className="space-y-4">
                {locationShares.map(share => (
                  <Card key={share.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                            <MapPin className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium">{share.name}</p>
                            <p className="text-sm text-gray-600">{share.location.address}</p>
                            <div className="mt-1 flex items-center text-xs text-gray-500">
                              <Clock className="mr-1 h-3 w-3" />
                              <span>
                                Expires in {getRemainingTime(share.expiresAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="shrink-0 text-gray-500"
                          onClick={() => handleDeleteShare(share.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div>
          <Card className="shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center">
                <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>Privacy Settings</CardTitle>
                  <CardDescription>
                    Control how your location is shared
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pb-3">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="expiration">Default Expiration</Label>
                    <p className="text-xs text-gray-500">
                      Set how long your location is shared
                    </p>
                  </div>
                  <span className="font-medium text-purple-600">
                    {formData.expiration} min
                  </span>
                </div>
                
                <Slider
                  id="expiration"
                  value={[formData.expiration]}
                  min={5}
                  max={120}
                  step={5}
                  onValueChange={(value) => setFormData({ ...formData, expiration: value[0] })}
                />
                
                <Separator className="my-4" />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Location Accuracy</Label>
                    <p className="text-xs text-gray-500">
                      Control the precision of your shared location
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowPrivacyOptions(true)}
                  >
                    {formData.privacyLevel === 'exact' 
                      ? 'Exact Location' 
                      : formData.privacyLevel === 'approximate' 
                      ? 'Approximate' 
                      : 'General Area'}
                  </Button>
                </div>
                
                <Separator className="my-4" />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="contact-info">Share Contact Info</Label>
                    <p className="text-xs text-gray-500">
                      Include your name and phone with location
                    </p>
                  </div>
                  <Switch
                    id="contact-info"
                    checked={formData.includeContactInfo}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, includeContactInfo: checked })
                    }
                  />
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="bg-gray-50 p-4 border-t">
              <Alert className="bg-amber-50 text-amber-700 border-amber-200">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Only share your location with people you trust. All links automatically expire.
                </AlertDescription>
              </Alert>
            </CardFooter>
          </Card>
          
          <Card className="mt-6 bg-gradient-to-br from-purple-50 to-indigo-50 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                  <Clock className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">Emergency Mode</h3>
                  <p className="text-sm text-gray-600">
                    Automatically update your location every 2 minutes until you're safe
                  </p>
                </div>
              </div>
              
              <Separator className="my-3" />
              
              <Button 
                className="w-full"
                variant="outline"
              >
                Enable Emergency Mode
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent className="sm:max-w-md">
          <Card>
            <CardHeader>
              <CardTitle>Share Your Location</CardTitle>
              <CardDescription>
                Create a temporary link to share your current location
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="share-name">Share Name (Optional)</Label>
                <Input
                  id="share-name"
                  placeholder="E.g. My Current Location"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Your Location</Label>
                <div className="flex">
                  <Input
                    id="location"
                    placeholder="Enter your location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="rounded-r-none"
                  />
                  <Button 
                    variant="secondary" 
                    className="rounded-l-none shrink-0"
                    onClick={() => {
                      // This would get the user's real location in a production environment
                      setFormData({ 
                        ...formData, 
                        location: 'I-85 North, Atlanta, GA'
                      });
                    }}
                  >
                    <MapPin className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="expiration-time">Expiration Time</Label>
                  <span className="text-sm font-medium text-purple-600">
                    {formData.expiration} minutes
                  </span>
                </div>
                <Slider
                  id="expiration-time"
                  value={[formData.expiration]}
                  min={5}
                  max={120}
                  step={5}
                  onValueChange={(value) => setFormData({ ...formData, expiration: value[0] })}
                />
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setIsCreating(false)}
              >
                Cancel
              </Button>
              
              <Button 
                className="btn-gradient"
                onClick={handleCreateShare}
              >
                Share Location
                <Share2 className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showPrivacyOptions} onOpenChange={setShowPrivacyOptions}>
        <DialogContent className="sm:max-w-md">
          <Card>
            <CardHeader>
              <CardTitle>Location Accuracy</CardTitle>
              <CardDescription>
                Choose how precise your shared location will be
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <RadioGroup
                value={formData.privacyLevel}
                onValueChange={(value: 'exact' | 'approximate' | 'area') => 
                  setFormData({ ...formData, privacyLevel: value })
                }
                className="space-y-4"
              >
                <div className="flex items-start space-x-3 rounded-lg border p-3">
                  <RadioGroupItem value="exact" id="exact" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="exact" className="font-medium">Exact Location</Label>
                    <p className="text-sm text-gray-600">
                      Share your precise coordinates (within a few meters)
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 rounded-lg border p-3">
                  <RadioGroupItem value="approximate" id="approximate" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="approximate" className="font-medium">Approximate Location</Label>
                    <p className="text-sm text-gray-600">
                      Share your general location (within 0.5 miles)
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 rounded-lg border p-3">
                  <RadioGroupItem value="area" id="area" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="area" className="font-medium">General Area Only</Label>
                    <p className="text-sm text-gray-600">
                      Only share the neighborhood or area name
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
            
            <CardFooter className="justify-end">
              <Button 
                onClick={() => setShowPrivacyOptions(false)}
              >
                Save Settings
              </Button>
            </CardFooter>
          </Card>
        </DialogContent>
      </Dialog>
    </div>
  );
}