import React, { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Car, 
  MapPin, 
  Share2, 
  ArrowRight, 
  Clock, 
  Award, 
  Map, 
  Phone,
  Trophy,
  Gift
} from 'lucide-react';

import { Separator } from '@/components/ui/separator';

import { TestimonialCarousel, UserStatistics, sampleTestimonials } from '@/components/ui/social-proof';
import { defaultReferralRewards } from '@/components/ui/referral';
import { TowGoLogo } from '@/components/ui/logo';

export function LandingPage() {
  const [isFirstVisit, setIsFirstVisit] = useState(true);
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Landing Page Header with Auth Options */}
      <header className="bg-white py-4 px-6 shadow-sm relative z-10">
        <div className="container mx-auto max-w-5xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <h1 className="font-bold text-xl bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                TowGo
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
              <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white" asChild>
                <Link to="/signup">Sign Up</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-purple-50 to-white pt-16 pb-12 md:pt-20 md:pb-16">
        {/* Decorative background elements */}
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-purple-100 opacity-50 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-indigo-100 opacity-50 blur-3xl"></div>
        
        <div className="container px-4 mx-auto max-w-5xl">
          <div className="flex flex-col items-center text-center md:flex-row md:text-left md:justify-between md:items-start">
            <div className="md:max-w-xl mb-10 md:mb-0">
              <div className="mb-2 animate-float">
                <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
                  TowGo
                </h1>
              </div>
              <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
                <span className="text-gradient animate-gradient">Roadside Relief</span> When You Need It Most
              </h1>
              <p className="mb-6 text-lg text-gray-600">
                Instantly find nearby tow truck services with our location-based search. 
                We connect stranded drivers with reliable emergency assistance in seconds.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Button className="btn-gradient" size="lg" asChild>
                  <Link to="/login">
                    Find Tow Trucks Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/signup">
                    Sign Up Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
              

            </div>
            
            <div className="relative w-full max-w-sm animate-float">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 opacity-10 blur-lg transform scale-105"></div>
              <Card className="overflow-hidden border-purple-100 shadow-lg">
                <CardContent className="p-0">
                  <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 text-white">
                    <h3 className="text-xl font-semibold">Find Help Fast</h3>
                    <p className="text-purple-100 text-sm">Emergency tow services near you</p>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                        <MapPin className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Location</p>
                        <p className="text-gray-800">Atlanta, GA</p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center space-x-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
                        <Clock className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Response Time</p>
                        <p className="text-gray-800">15-30 minutes</p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center space-x-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                        <Award className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Services</p>
                        <p className="text-gray-800">Towing, Jump Start, Tire Change</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 text-center">
                    <Button className="btn-gradient w-full" asChild>
                      <Link to="/login">
                        Connect Now
                        <Phone className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Social Proof */}
          <div className="mt-16">
            <UserStatistics 
              userCount={{ total: 15420, active: 342, increment: 20 }}
              searchCount={67890}
              helpCount={12045}
            />
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container px-4 mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="mb-3 text-3xl font-bold text-gray-900">How It Works</h2>
            <p className="mx-auto max-w-2xl text-gray-600">
              Get back on the road quickly with our simple 3-step process
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: <MapPin className="h-6 w-6" />,
                title: "Share Your Location",
                description: "Enable location services or manually enter your location to find nearby tow services."
              },
              {
                icon: <Car className="h-6 w-6" />,
                title: "Enter Vehicle Details",
                description: "Add your vehicle information to help tow truck companies provide the right equipment."
              },
              {
                icon: <Phone className="h-6 w-6" />,
                title: "Connect Instantly",
                description: "Call or message tow truck services directly through our app for immediate assistance."
              }
            ].map((feature, index) => (
              <Card key={index} className="border-purple-100 transition-all duration-300 hover:shadow-md">
                <CardHeader className="pb-2">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* Referral Rewards Section */}
      <section className="py-16 bg-gradient-to-b from-white to-purple-50">
        <div className="container px-4 mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="mb-3 text-3xl font-bold text-gray-900">Earn Referral Rewards</h2>
            <p className="mx-auto max-w-2xl text-gray-600">
              Invite friends to TowGo and unlock exclusive rewards
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            {defaultReferralRewards.map((reward, index) => (
              <Card key={index} className="border-purple-100 transition-all duration-300 hover:shadow-md">
                <CardHeader className="pb-2">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                    {reward.icon}
                  </div>
                  <CardTitle className="text-xl">{reward.title}</CardTitle>
                </CardHeader>
                <CardContent className="pb-6">
                  <p className="text-gray-600 mb-4">{reward.description}</p>
                  <div className="px-2 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-medium inline-block">
                    Unlock with {reward.threshold} referrals
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Button className="btn-gradient" asChild>
              <Link to="/referrals">
                Refer Friends
                <Gift className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* Social Sharing */}
      <section className="py-16 bg-white">
        <div className="container px-4 mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="md:w-1/2">
              <h2 className="mb-3 text-3xl font-bold text-gray-900">Share Your Location</h2>
              <p className="mb-6 text-gray-600">
                Instantly share your location with friends, family, or tow truck drivers for quicker roadside assistance. 
                Our secure location sharing provides peace of mind during stressful situations.
              </p>
              
              <div className="space-y-4">
                {[
                  {
                    icon: <Map className="h-5 w-5 text-purple-600" />,
                    title: "Precision Location Sharing",
                    description: "Share your exact GPS coordinates with one click"
                  },
                  {
                    icon: <Clock className="h-5 w-5 text-purple-600" />,
                    title: "Temporary Access",
                    description: "Set expiration times for location sharing links"
                  },
                  {
                    icon: <Share2 className="h-5 w-5 text-purple-600" />,
                    title: "Multiple Sharing Options",
                    description: "Share via SMS, email, or generate a link"
                  }
                ].map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <div className="mr-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{feature.title}</h3>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8">
                <Button className="btn-gradient" asChild>
                  <Link to="/location-share">
                    Try Location Sharing
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
            
            <div className="md:w-1/2 relative animate-float">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 opacity-10 blur-lg transform scale-105"></div>
              <Card className="overflow-hidden border-purple-100 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 text-white">
                  <CardTitle>Location Sharing</CardTitle>
                  <CardDescription className="text-purple-100">
                    Share your location securely
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-600 mr-3">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">Your Location</p>
                        <p className="text-sm text-gray-600">I-85 North, Atlanta, GA</p>
                      </div>
                    </div>
                    <div className="animate-pulse-purple">
                      <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    </div>
                  </div>
                  
                  <div className="rounded-md bg-purple-50 p-4 mt-4">
                    <p className="mb-2 text-sm font-medium text-purple-800">Share via link:</p>
                    <div className="flex items-center rounded-md bg-white p-2">
                      <p className="text-xs text-gray-500 truncate flex-1">
                        https://towgo.com/location/share/84f59d3e...
                      </p>
                      <Button variant="ghost" size="sm" className="shrink-0">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">Link expires in:</span>
                      <span className="font-medium text-purple-600">30 minutes</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100">
                      <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500"></div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 p-4 flex justify-between">
                  <Button variant="outline" size="sm">
                    Cancel
                  </Button>
                  <Button className="btn-gradient" size="sm">
                    Update Location
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="py-16 bg-purple-50">
        <div className="container px-4 mx-auto max-w-5xl">
          <TestimonialCarousel testimonials={sampleTestimonials} />
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="container px-4 mx-auto max-w-5xl text-center">
          <h2 className="mb-4 text-3xl font-bold">Ready to Get Started?</h2>
          <p className="mb-8 mx-auto max-w-2xl text-purple-100">
            Join thousands of drivers who trust TowGo to find reliable tow truck services in minutes.
          </p>
          <Button 
            size="lg" 
            variant="outline"
            className="bg-white text-purple-600 hover:bg-purple-50 border-purple-300"
            asChild
          >
            <Link to="/login">
              Find Tow Trucks Near Me
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 bg-gray-900 text-gray-300">
        <div className="container px-4 mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-bold text-white mb-1">TowGo</h3>
              <p className="text-sm text-gray-400">TowGo Quick Tow</p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Footer links or social media icons could go here */}
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-800 flex flex-col md:flex-row justify-between">
            <p className="text-sm text-gray-500 mb-4 md:mb-0">
              © {new Date().getFullYear()} TowGo. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link to="/terms" className="text-sm text-gray-500 hover:text-gray-300">Terms</Link>
              <Link to="/privacy" className="text-sm text-gray-500 hover:text-gray-300">Privacy</Link>
              <Link to="/contact" className="text-sm text-gray-500 hover:text-gray-300">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}