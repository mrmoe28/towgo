import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Location } from '@/types';
import { 
  Share2, 
  Shield, 
  Clock, 
  Car, 
  Copy,
  Check,
  X
} from "lucide-react";

// Location sharing data props
interface LocationSharingProps {
  location?: Location;
  address?: string;
  isEnabled?: boolean;
}

// Location sharing form schema
const locationSharingSchema = z.object({
  accuracy: z.enum(['exact', 'approximate', 'city'], {
    required_error: "Please select a privacy level",
  }),
  expiresIn: z.enum(['15m', '1h', '3h', '24h'], {
    required_error: "Please select an expiration time",
  }),
  includeVehicleInfo: z.boolean().default(false),
  vehicleInfo: z.object({
    make: z.string().optional(),
    model: z.string().optional(),
    year: z.string().optional(),
    color: z.string().optional(),
    type: z.string().optional(),
    licensePlate: z.string().optional(),
  }).optional(),
});

type LocationSharingFormValues = z.infer<typeof locationSharingSchema>;

export default function LocationSharing({ 
  location, 
  address, 
  isEnabled = true 
}: LocationSharingProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  
  // Default form values
  const defaultValues: Partial<LocationSharingFormValues> = {
    accuracy: 'exact',
    expiresIn: '1h',
    includeVehicleInfo: false,
    vehicleInfo: {
      make: '',
      model: '',
      year: '',
      color: '',
      type: '',
      licensePlate: '',
    },
  };
  
  // Setup form
  const form = useForm<LocationSharingFormValues>({
    resolver: zodResolver(locationSharingSchema),
    defaultValues,
  });
  
  // Watch includeVehicleInfo to conditionally show vehicle fields
  const includeVehicleInfo = form.watch('includeVehicleInfo');
  
  // Handle form submission
  const onSubmit = async (values: LocationSharingFormValues) => {
    try {
      if (!address) {
        toast({
          variant: "destructive",
          title: "Cannot share location",
          description: "No address information available to share",
        });
        return;
      }
      
      setIsSharing(true);
      
      // Calculate expiry time
      const now = new Date();
      let expiryDate = new Date(now);
      
      switch (values.expiresIn) {
        case '15m': 
          expiryDate.setMinutes(now.getMinutes() + 15);
          break;
        case '1h':
          expiryDate.setHours(now.getHours() + 1);
          break;
        case '3h':
          expiryDate.setHours(now.getHours() + 3);
          break;
        case '24h':
          expiryDate.setHours(now.getHours() + 24);
          break;
      }
      
      // Prepare share data
      const shareData = {
        address: address,
        location: location,
        accuracy: values.accuracy,
        expires: expiryDate.toISOString(),
        includeVehicleInfo: values.includeVehicleInfo,
        vehicleInfo: values.includeVehicleInfo ? values.vehicleInfo : undefined,
      };
      
      // Send data to server to create share
      const response = await fetch('/api/location-share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(shareData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create location share');
      }
      
      const result = await response.json();
      
      // Create shareable URL
      const shareableUrl = `${window.location.origin}/location-share?id=${result.shareId}`;
      setShareLink(shareableUrl);
      
      toast({
        title: "Location Shared",
        description: "Your location has been shared successfully",
      });
    } catch (error) {
      console.error('Error sharing location:', error);
      toast({
        variant: "destructive",
        title: "Sharing Failed",
        description: error instanceof Error ? error.message : "Failed to share location",
      });
    } finally {
      setIsSharing(false);
    }
  };
  
  // Copy link to clipboard
  const copyLink = () => {
    if (!shareLink) return;
    
    navigator.clipboard.writeText(shareLink).then(
      () => {
        setLinkCopied(true);
        toast({
          title: "Link Copied",
          description: "Location link copied to clipboard",
        });
        
        // Reset the copied state after 3 seconds
        setTimeout(() => setLinkCopied(false), 3000);
      },
      (err) => {
        console.error('Could not copy link: ', err);
        toast({
          variant: "destructive",
          title: "Copy Failed",
          description: "Could not copy link to clipboard",
        });
      }
    );
  };
  
  // Close the share dialog
  const closeShare = () => {
    setShareLink(null);
    form.reset(defaultValues);
  };
  
  // Format the privacy level text
  const formatPrivacyLevel = (level: string) => {
    switch (level) {
      case 'exact':
        return 'Exact Location (precise coordinates)';
      case 'approximate':
        return 'Approximate (within ~1 mile)';
      case 'city':
        return 'City Level Only (no exact location)';
      default:
        return level;
    }
  };
  
  // Format the expiry time
  const formatExpiryTime = (time: string) => {
    switch (time) {
      case '15m':
        return '15 minutes';
      case '1h':
        return '1 hour';
      case '3h':
        return '3 hours';
      case '24h':
        return '24 hours';
      default:
        return time;
    }
  };
  
  if (!isEnabled) {
    return null;
  }
  
  return (
    <div className="mt-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Your Location
          </CardTitle>
        </CardHeader>
        
        {shareLink ? (
          <>
            <CardContent className="space-y-4">
              <div className="p-3 bg-primary/10 rounded-md border">
                <h3 className="font-medium mb-1">Your location is ready to share!</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Use this link to share your location with others
                </p>
                
                <div className="flex space-x-2">
                  <Input 
                    value={shareLink} 
                    readOnly 
                    className="bg-background"
                  />
                  <Button 
                    size="sm"
                    onClick={copyLink}
                    variant={linkCopied ? "default" : "outline"}
                  >
                    {linkCopied ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">
                    Privacy Level: {formatPrivacyLevel(form.getValues('accuracy'))}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">
                    Expires in: {formatExpiryTime(form.getValues('expiresIn'))}
                  </span>
                </div>
              </div>
            </CardContent>
            
            <CardFooter>
              <Button 
                variant="ghost" 
                className="w-full"
                onClick={closeShare}
              >
                Create Another Share
              </Button>
            </CardFooter>
          </>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-6">
                {!address && (
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-md text-sm">
                    You need to set your location first before you can share it.
                  </div>
                )}
                
                <FormField
                  control={form.control}
                  name="accuracy"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Privacy Level</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="space-y-2"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="exact" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Exact Location
                              <span className="block text-sm text-muted-foreground">
                                Shares your precise coordinates
                              </span>
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="approximate" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Approximate Location
                              <span className="block text-sm text-muted-foreground">
                                Reduces precision to within ~1 mile
                              </span>
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="city" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              City Only
                              <span className="block text-sm text-muted-foreground">
                                Only shares city-level location
                              </span>
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="expiresIn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link Expiration</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select how long this share is valid" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="15m">15 minutes</SelectItem>
                          <SelectItem value="1h">1 hour</SelectItem>
                          <SelectItem value="3h">3 hours</SelectItem>
                          <SelectItem value="24h">24 hours</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Your shared location will automatically expire after this time
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="includeVehicleInfo"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="flex items-center gap-2">
                          <Car className="h-4 w-4" />
                          Include Vehicle Information
                        </FormLabel>
                        <FormDescription>
                          Share details about your vehicle with the tow truck driver
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                {includeVehicleInfo && (
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="vehicleInfo.make"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Make</FormLabel>
                          <FormControl>
                            <Input placeholder="Ford, Toyota, etc." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="vehicleInfo.model"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Model</FormLabel>
                          <FormControl>
                            <Input placeholder="F-150, Camry, etc." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="vehicleInfo.year"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Year</FormLabel>
                          <FormControl>
                            <Input placeholder="2020" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="vehicleInfo.color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Color</FormLabel>
                          <FormControl>
                            <Input placeholder="Red, Blue, etc." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="vehicleInfo.type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vehicle Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="sedan">Sedan</SelectItem>
                              <SelectItem value="suv">SUV</SelectItem>
                              <SelectItem value="truck">Truck</SelectItem>
                              <SelectItem value="van">Van</SelectItem>
                              <SelectItem value="motorcycle">Motorcycle</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="vehicleInfo.licensePlate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>License Plate</FormLabel>
                          <FormControl>
                            <Input placeholder="ABC123" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </CardContent>
              
              <CardFooter>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isSharing || !address}
                >
                  {isSharing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Share Link...
                    </>
                  ) : (
                    <>
                      <Share2 className="h-4 w-4 mr-2" />
                      Create Share Link
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Form>
        )}
      </Card>
    </div>
  );
}