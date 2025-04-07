import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Info, Moon, Sun, Palette, Globe, Shield, BellRing, Eye, EyeOff, Trash2, Download, Save } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import { ViewType } from '@/types';

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings();
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  
  // Local state for pending changes
  const [formValues, setFormValues] = useState({
    ...settings,
    theme: 'system',
    language: 'en-US',
    autoRefresh: true,
    dataCollection: true,
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    cacheSize: 50
  });
  
  const handleSwitchChange = (key: string, checked: boolean) => {
    setFormValues(prev => ({
      ...prev,
      [key]: checked
    }));
  };
  
  const handleSliderChange = (key: string, value: number[]) => {
    setFormValues(prev => ({
      ...prev,
      [key]: value[0]
    }));
  };
  
  const handleSelectChange = (key: string, value: string) => {
    setFormValues(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  const handleSaveSettings = () => {
    setIsProcessing(true);
    
    // Update the global app settings
    updateSettings({
      highContrastMode: formValues.highContrastMode,
      largerTextMode: formValues.largerTextMode,
      defaultRadius: formValues.defaultRadius,
      defaultView: formValues.defaultView as ViewType
    });
    
    // Simulate API call for other settings
    setTimeout(() => {
      setIsProcessing(false);
      
      toast({
        title: "Settings updated",
        description: "Your preference changes have been saved successfully.",
      });
    }, 1500);
  };
  
  const handleClearData = () => {
    setIsProcessing(true);
    
    // Simulate clearing data
    setTimeout(() => {
      setIsProcessing(false);
      
      toast({
        title: "Data cleared",
        description: "Your app data has been successfully cleared.",
      });
    }, 1500);
  };
  
  const handleExportData = () => {
    // In a real app, this would generate and download a JSON file
    toast({
      title: "Data export",
      description: "Your data export would be generated and downloaded here.",
    });
  };
  
  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <div className="mb-8 relative rounded-lg overflow-hidden">
        {/* Header Banner with Animated Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 animate-gradient-shift"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent animate-pulse-slow"></div>
        
        {/* Content */}
        <div className="relative py-8 px-6 z-10">
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-white/80 max-w-2xl">
            Configure your app preferences, appearance, and notification settings
          </p>
        </div>
      </div>
      
      <Tabs defaultValue="appearance" className="space-y-6">
        <TabsList className="bg-purple-50 p-1 shadow-md">
          <TabsTrigger 
            value="appearance" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white"
          >
            <Palette className="h-4 w-4 mr-2" />
            Appearance
          </TabsTrigger>
          <TabsTrigger 
            value="search" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white"
          >
            <Globe className="h-4 w-4 mr-2" />
            Search
          </TabsTrigger>
          <TabsTrigger 
            value="notifications" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white"
          >
            <BellRing className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger 
            value="privacy" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white"
          >
            <Shield className="h-4 w-4 mr-2" />
            Privacy
          </TabsTrigger>
        </TabsList>
        
        {/* Appearance Tab */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>
                Customize how the app looks and feels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="theme">Theme</Label>
                    <p className="text-sm text-gray-500">
                      Choose your preferred color theme
                    </p>
                  </div>
                  <Select 
                    value={formValues.theme} 
                    onValueChange={(value) => handleSelectChange('theme', value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">
                        <div className="flex items-center">
                          <Sun className="h-4 w-4 mr-2" />
                          Light
                        </div>
                      </SelectItem>
                      <SelectItem value="dark">
                        <div className="flex items-center">
                          <Moon className="h-4 w-4 mr-2" />
                          Dark
                        </div>
                      </SelectItem>
                      <SelectItem value="system">
                        <div className="flex items-center">
                          <Palette className="h-4 w-4 mr-2" />
                          System
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="high-contrast">High Contrast Mode</Label>
                    <p className="text-sm text-gray-500">
                      Increase contrast for better visibility
                    </p>
                  </div>
                  <Switch 
                    id="high-contrast" 
                    checked={formValues.highContrastMode}
                    onCheckedChange={(checked) => handleSwitchChange('highContrastMode', checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="larger-text">Larger Text</Label>
                    <p className="text-sm text-gray-500">
                      Increase text size throughout the app
                    </p>
                  </div>
                  <Switch 
                    id="larger-text" 
                    checked={formValues.largerTextMode}
                    onCheckedChange={(checked) => handleSwitchChange('largerTextMode', checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="language">Language</Label>
                    <p className="text-sm text-gray-500">
                      Set your preferred language
                    </p>
                  </div>
                  <Select 
                    value={formValues.language} 
                    onValueChange={(value) => handleSelectChange('language', value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en-US">English (US)</SelectItem>
                      <SelectItem value="es-ES">Español</SelectItem>
                      <SelectItem value="fr-FR">Français</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Search Tab */}
        <TabsContent value="search">
          <Card>
            <CardHeader>
              <CardTitle>Search Preferences</CardTitle>
              <CardDescription>
                Configure how searches work in the application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="default-radius">Default Search Radius (miles)</Label>
                    <span className="text-sm font-medium">{formValues.defaultRadius} miles</span>
                  </div>
                  <Slider 
                    id="default-radius"
                    min={5}
                    max={30}
                    step={5}
                    value={[formValues.defaultRadius]}
                    onValueChange={(value) => handleSliderChange('defaultRadius', value)}
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>5 miles</span>
                    <span>30 miles</span>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label htmlFor="default-view">Default View</Label>
                  <Select 
                    value={formValues.defaultView} 
                    onValueChange={(value) => handleSelectChange('defaultView', value)}
                  >
                    <SelectTrigger id="default-view">
                      <SelectValue placeholder="Select default view" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="map">Map View</SelectItem>
                      <SelectItem value="list">List View</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto-refresh">Auto-Refresh Results</Label>
                    <p className="text-sm text-gray-500">
                      Automatically refresh search results
                    </p>
                  </div>
                  <Switch 
                    id="auto-refresh" 
                    checked={formValues.autoRefresh}
                    onCheckedChange={(checked) => handleSwitchChange('autoRefresh', checked)}
                  />
                </div>
                
                <Alert className="bg-blue-50 text-blue-800 border-blue-200">
                  <AlertDescription className="flex items-center">
                    <Info className="h-4 w-4 mr-2" />
                    Setting a higher search radius may increase load times but will show more results.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Control how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-gray-500">
                      Receive updates via email
                    </p>
                  </div>
                  <Switch 
                    id="email-notifications" 
                    checked={formValues.emailNotifications}
                    onCheckedChange={(checked) => handleSwitchChange('emailNotifications', checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="push-notifications">Push Notifications</Label>
                    <p className="text-sm text-gray-500">
                      Receive in-app notifications
                    </p>
                  </div>
                  <Switch 
                    id="push-notifications" 
                    checked={formValues.pushNotifications}
                    onCheckedChange={(checked) => handleSwitchChange('pushNotifications', checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="sms-notifications">SMS Notifications</Label>
                    <p className="text-sm text-gray-500">
                      Receive text message alerts
                    </p>
                  </div>
                  <Switch 
                    id="sms-notifications" 
                    checked={formValues.smsNotifications}
                    onCheckedChange={(checked) => handleSwitchChange('smsNotifications', checked)}
                  />
                </div>
                
                <Alert className="bg-yellow-50 text-yellow-800 border-yellow-200">
                  <AlertDescription className="flex items-center">
                    <Info className="h-4 w-4 mr-2" />
                    SMS notifications may incur carrier charges. Standard rates apply.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Privacy Tab */}
        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle>Privacy & Data</CardTitle>
              <CardDescription>
                Manage your privacy settings and data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="data-collection">Data Collection</Label>
                    <p className="text-sm text-gray-500">
                      Allow anonymous usage data collection to improve the app
                    </p>
                  </div>
                  <Switch 
                    id="data-collection" 
                    checked={formValues.dataCollection}
                    onCheckedChange={(checked) => handleSwitchChange('dataCollection', checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="cache-size">Cache Size (MB)</Label>
                    <span className="text-sm font-medium">{formValues.cacheSize} MB</span>
                  </div>
                  <Slider 
                    id="cache-size"
                    min={10}
                    max={100}
                    step={10}
                    value={[formValues.cacheSize]}
                    onValueChange={(value) => handleSliderChange('cacheSize', value)}
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>10 MB</span>
                    <span>100 MB</span>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4 pt-2">
                  <h3 className="font-medium">Data Management</h3>
                  
                  <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
                    <Button 
                      variant="outline" 
                      className="flex-1 space-x-2"
                      onClick={handleExportData}
                    >
                      <Download className="h-4 w-4" />
                      <span>Export Data</span>
                    </Button>
                    <Button 
                      variant="destructive" 
                      className="flex-1 space-x-2"
                      onClick={handleClearData}
                      disabled={isProcessing}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Clear All Data</span>
                    </Button>
                  </div>
                </div>
                
                <Alert className="bg-red-50 text-red-800 border-red-200">
                  <AlertDescription className="flex items-center">
                    <Info className="h-4 w-4 mr-2" />
                    Clearing all data will remove your saved preferences, search history, and favorites. This action cannot be undone.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="mt-6 flex justify-end">
        <Button 
          onClick={handleSaveSettings}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
          disabled={isProcessing}
        >
          <Save className="h-4 w-4 mr-2" />
          {isProcessing ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}