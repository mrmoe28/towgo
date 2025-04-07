import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Edit, User, Car, Medal, Activity, Clock, Map, Share2, Settings, Award, ChevronRight } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth'; 

export default function ProfilePage() {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  
  // Use actual user data from auth context
  const { user } = useAuth();
  const [userData, setUserData] = useState({
    username: user?.username || '',
    displayName: user?.displayName || user?.username || '',
    email: user?.email || '',
    phone: '(Not provided)',
    bio: 'TowGo member',
    profileImage: user?.avatar || '',
    memberSince: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
    lastActive: 'Today',
    completedSearches: 0,
    helpReceived: 0,
    totalPoints: 0,
    level: 'Bronze',
    vehicles: [] as {id: number; name: string; make: string; model: string; year: number; color: string; plateNumber: string}[]
  });

  // User stats
  const userStats = {
    achievementsCount: 3,
    achievementsTotal: 10
  };
  
  const handleSaveProfile = () => {
    // In a real app, this would save to a database
    toast({
      title: "Profile updated",
      description: "Your profile information has been updated successfully."
    });
    setIsEditing(false);
  };
  
  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <div className="mb-8 relative rounded-lg overflow-hidden">
        {/* Header Banner with Animated Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 animate-gradient-shift"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent animate-pulse-slow"></div>
        
        {/* Content */}
        <div className="relative py-8 px-6 z-10">
          <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
          <p className="text-white/80 max-w-2xl">
            Manage your personal information, vehicles, and view your achievements
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Summary Card */}
        <Card className="md:col-span-1">
          <CardHeader className="text-center relative pb-0">
            <div className="absolute top-4 right-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsEditing(!isEditing)}
                className="h-8 w-8 text-gray-500 hover:text-purple-700"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex flex-col items-center">
              <Avatar className="h-24 w-24 mb-4 border-4 border-purple-100">
                <AvatarImage src={userData.profileImage} />
                <AvatarFallback className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xl">
                  {userData.displayName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <CardTitle className="text-xl mb-1">{userData.displayName}</CardTitle>
              <CardDescription className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {userData.username}
              </CardDescription>
              
              <div className="mt-3">
                <Badge variant="secondary" className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-none">
                  {userData.level} Member
                </Badge>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 text-center gap-2 mb-6">
              <div className="flex flex-col items-center">
                <div className="text-lg font-semibold text-purple-700">{userData.completedSearches}</div>
                <div className="text-xs text-gray-500">Searches</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-lg font-semibold text-purple-700">{userData.helpReceived}</div>
                <div className="text-xs text-gray-500">Assists</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-lg font-semibold text-purple-700">{userData.totalPoints}</div>
                <div className="text-xs text-gray-500">Points</div>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            {/* Quick Stats */}
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <Clock className="h-4 w-4 mr-2 text-gray-400" />
                <span className="text-gray-600">Member since: </span>
                <span className="ml-auto font-medium">{userData.memberSince}</span>
              </div>
              <div className="flex items-center text-sm">
                <Activity className="h-4 w-4 mr-2 text-gray-400" />
                <span className="text-gray-600">Last active: </span>
                <span className="ml-auto font-medium">{userData.lastActive}</span>
              </div>
              <div className="flex items-center text-sm">
                <Car className="h-4 w-4 mr-2 text-gray-400" />
                <span className="text-gray-600">Vehicles: </span>
                <span className="ml-auto font-medium">{userData.vehicles.length}</span>
              </div>
              <div className="flex items-center text-sm">
                <Medal className="h-4 w-4 mr-2 text-gray-400" />
                <span className="text-gray-600">Achievements: </span>
                <span className="ml-auto font-medium">
                  {userStats.achievementsCount}/{userStats.achievementsTotal}
                </span>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-2">
            <Button
              variant="outline"
              className="w-full justify-between"
              asChild
            >
              <Link to="/settings">
                <div className="flex items-center">
                  <Settings className="h-4 w-4 mr-2" />
                  <span>Account Settings</span>
                </div>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-between"
              asChild
            >
              <Link to="/location-share">
                <div className="flex items-center">
                  <Share2 className="h-4 w-4 mr-2" />
                  <span>Share Location</span>
                </div>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
        
        {/* Main Content Area */}
        <div className="md:col-span-2 space-y-6">
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="bg-purple-50 p-1 mb-4 shadow-md">
              <TabsTrigger 
                value="info" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white"
              >
                <User className="h-4 w-4 mr-2" />
                Personal Info
              </TabsTrigger>
              <TabsTrigger 
                value="vehicles" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white"
              >
                <Car className="h-4 w-4 mr-2" />
                Vehicles
              </TabsTrigger>
              <TabsTrigger 
                value="achievements" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white"
              >
                <Award className="h-4 w-4 mr-2" />
                Achievements
              </TabsTrigger>
              <TabsTrigger 
                value="history" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white"
              >
                <Map className="h-4 w-4 mr-2" />
                History
              </TabsTrigger>
            </TabsList>
            
            {/* Personal Info Tab */}
            <TabsContent value="info">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Update your account details and contact information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="displayName">Display Name</Label>
                      <Input 
                        id="displayName" 
                        value={userData.displayName} 
                        onChange={(e) => setUserData({...userData, displayName: e.target.value})}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input 
                        id="username" 
                        value={userData.username} 
                        disabled
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={userData.email} 
                        onChange={(e) => setUserData({...userData, email: e.target.value})}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input 
                        id="phone" 
                        type="tel" 
                        value={userData.phone} 
                        onChange={(e) => setUserData({...userData, phone: e.target.value})}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea 
                        id="bio" 
                        rows={3} 
                        value={userData.bio} 
                        onChange={(e) => setUserData({...userData, bio: e.target.value})}
                        disabled={!isEditing}
                        className="resize-none"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  {isEditing && (
                    <>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                      <Button 
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                        onClick={handleSaveProfile}
                      >
                        Save Changes
                      </Button>
                    </>
                  )}
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Vehicles Tab */}
            <TabsContent value="vehicles">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>My Vehicles</CardTitle>
                    <CardDescription>
                      Manage your saved vehicles for faster assistance
                    </CardDescription>
                  </div>
                  <Button 
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                  >
                    Add Vehicle
                  </Button>
                </CardHeader>
                <CardContent>
                  {userData.vehicles.length > 0 ? (
                    <div className="space-y-4">
                      {userData.vehicles.map((vehicle: {
                        id: number;
                        name: string;
                        make: string;
                        model: string;
                        year: number;
                        color: string;
                        plateNumber: string;
                      }) => (
                        <Card key={vehicle.id} className="overflow-hidden">
                          <div className="flex flex-col md:flex-row">
                            <div className="p-4 md:p-6 flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-lg">{vehicle.name}</h3>
                                <Badge>{vehicle.year}</Badge>
                              </div>
                              <p className="text-gray-700 mb-4">
                                {vehicle.make} {vehicle.model} • {vehicle.color}
                              </p>
                              
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                  <span className="text-gray-500">Plate Number:</span>
                                  <p className="font-medium">{vehicle.plateNumber}</p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex md:flex-col justify-around items-center p-4 bg-purple-50 gap-2">
                              <Button size="sm" variant="ghost" className="w-full">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </Button>
                              <Button size="sm" variant="ghost" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50">
                                Remove
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Car className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                      <h3 className="font-medium text-gray-700 mb-1">No vehicles added yet</h3>
                      <p className="text-gray-500 mb-4">
                        Add your vehicle details for faster roadside assistance
                      </p>
                      <Button>Add Your First Vehicle</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Achievements Tab */}
            <TabsContent value="achievements">
              <Card>
                <CardHeader>
                  <CardTitle>My Achievements</CardTitle>
                  <CardDescription>
                    Track your progress and unlock rewards
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 bg-purple-50 rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-medium mb-1">Total Points: {userData.totalPoints}</h3>
                      <p className="text-sm text-gray-600">Keep using the app to earn more points!</p>
                    </div>
                    <Badge className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-none">
                      {userData.level} Level
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {userAchievements.map((achievement) => (
                      <div key={achievement.id}>
                        <AchievementBadge achievement={achievement} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* History Tab */}
            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Search History</CardTitle>
                  <CardDescription>
                    Recent tow truck searches and assistance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {userData.completedSearches > 0 ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-start border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                          <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-600 mr-3">
                            <Map className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-gray-900">Tow Truck Search</h4>
                              <span className="text-xs text-gray-500">
                                {i === 0 ? 'Today' : i === 1 ? 'Yesterday' : '3 days ago'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {i === 0 ? 'I-85 North, Atlanta, GA' : 
                               i === 1 ? 'Peachtree St, Atlanta, GA' : 
                               'Centennial Olympic Park, Atlanta, GA'}
                            </p>
                            <div className="flex items-center mt-2">
                              <Badge variant="outline" className="mr-2 text-xs">
                                {i === 0 ? 'Flat Tire' : i === 1 ? 'Jump Start' : 'Towing'}
                              </Badge>
                              {i === 0 && (
                                <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 border-green-200">
                                  Completed
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Map className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                      <h3 className="font-medium text-gray-700 mb-1">No search history yet</h3>
                      <p className="text-gray-500 mb-4">
                        Your search history will appear here
                      </p>
                      <Button asChild>
                        <Link to="/">
                          Find Tow Trucks
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}