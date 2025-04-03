import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './card';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { Badge } from './badge';
import { Button } from './button';
import { ChevronLeft, ChevronRight, Users, MapPin, ThumbsUp, Clock, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  date: string;
  avatar?: string;
  rating: number;
  text: string;
  verified?: boolean;
}

export interface TestimonialCarouselProps {
  testimonials: Testimonial[];
}

export function TestimonialCarousel({ testimonials }: TestimonialCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const nextTestimonial = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setCurrentIndex((prevIndex) => 
      prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
    );
    
    setTimeout(() => setIsAnimating(false), 500);
  };
  
  const prevTestimonial = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
    
    setTimeout(() => setIsAnimating(false), 500);
  };
  
  // Auto-advance testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      nextTestimonial();
    }, 8000);
    
    return () => clearInterval(timer);
  }, [testimonials, currentIndex]);
  
  if (testimonials.length === 0) return null;
  
  return (
    <div className="relative max-w-3xl mx-auto">
      <div className="overflow-hidden rounded-lg">
        <div 
          className={cn(
            "transition-transform duration-500 ease-in-out flex",
            isAnimating ? "opacity-90" : "opacity-100"
          )}
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="min-w-full px-4 py-8"
            >
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-16 w-16 mb-4 ring-4 ring-purple-100">
                  <AvatarImage src={testimonial.avatar} />
                  <AvatarFallback className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < testimonial.rating ? "text-yellow-400" : "text-gray-300"}>
                      ★
                    </span>
                  ))}
                  {testimonial.verified && (
                    <Badge variant="outline" className="ml-2 text-xs border-green-300 text-green-600">
                      Verified
                    </Badge>
                  )}
                </div>
                
                <blockquote className="text-lg italic text-gray-700 mb-4">
                  "{testimonial.text}"
                </blockquote>
                
                <div className="font-medium">{testimonial.name}</div>
                <div className="text-sm text-gray-500 flex items-center">
                  <MapPin className="h-3 w-3 mr-1" /> {testimonial.location} • {testimonial.date}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="absolute -left-2 top-1/2 -translate-y-1/2">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={prevTestimonial}
          className="rounded-full shadow-md h-10 w-10 bg-white/90"
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="sr-only">Previous</span>
        </Button>
      </div>
      
      <div className="absolute -right-2 top-1/2 -translate-y-1/2">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={nextTestimonial}
          className="rounded-full shadow-md h-10 w-10 bg-white/90"
        >
          <ChevronRight className="h-5 w-5" />
          <span className="sr-only">Next</span>
        </Button>
      </div>
      
      <div className="mt-4 flex justify-center space-x-2">
        {testimonials.map((_, index) => (
          <button
            key={index}
            className={cn(
              "h-2 w-2 rounded-full transition-all duration-300",
              index === currentIndex 
                ? "bg-purple-600 w-6" 
                : "bg-gray-300 hover:bg-gray-400"
            )}
            onClick={() => {
              setIsAnimating(true);
              setCurrentIndex(index);
              setTimeout(() => setIsAnimating(false), 500);
            }}
            aria-label={`Go to testimonial ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export interface UserStatisticsProps {
  userCount: {
    total: number;
    active: number;
    increment: number;
  };
  searchCount: number;
  helpCount: number;
}

export function UserStatistics({ userCount, searchCount, helpCount }: UserStatisticsProps) {
  const [animatedUserCount, setAnimatedUserCount] = useState(userCount.total);
  const [animatedSearchCount, setAnimatedSearchCount] = useState(searchCount);
  const [animatedHelpCount, setAnimatedHelpCount] = useState(helpCount);
  
  // Simulate incrementing stats
  useEffect(() => {
    const timer = setInterval(() => {
      setAnimatedUserCount(prev => prev + 1);
    }, 30000);
    
    return () => clearInterval(timer);
  }, []);
  
  useEffect(() => {
    setAnimatedUserCount(userCount.total);
    setAnimatedSearchCount(searchCount);
    setAnimatedHelpCount(helpCount);
  }, [userCount.total, searchCount, helpCount]);
  
  const formatLargeNumber = (num: number) => {
    return num.toLocaleString();
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="overflow-hidden border-purple-100 transition-all duration-300 hover:shadow-md bg-gradient-to-br from-white to-purple-50">
        <CardContent className="p-6">
          <div className="flex items-start">
            <div className="mr-4 rounded-full p-2 bg-purple-100 text-purple-600">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-baseline">
                <span className="text-2xl font-bold text-gray-900">{formatLargeNumber(animatedUserCount)}</span>
                <span className="ml-2 text-sm font-medium text-green-600">+{userCount.increment}/day</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-600">Total Users</span>
                <span className="text-xs text-gray-500">{userCount.active} active now</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="overflow-hidden border-blue-100 transition-all duration-300 hover:shadow-md bg-gradient-to-br from-white to-blue-50">
        <CardContent className="p-6">
          <div className="flex items-start">
            <div className="mr-4 rounded-full p-2 bg-blue-100 text-blue-600">
              <MapPin className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-baseline">
                <span className="text-2xl font-bold text-gray-900">{formatLargeNumber(animatedSearchCount)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-600">Total Searches</span>
                <span className="text-xs text-gray-500">Tow trucks found in seconds</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="overflow-hidden border-green-100 transition-all duration-300 hover:shadow-md bg-gradient-to-br from-white to-green-50">
        <CardContent className="p-6">
          <div className="flex items-start">
            <div className="mr-4 rounded-full p-2 bg-green-100 text-green-600">
              <ThumbsUp className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-baseline">
                <span className="text-2xl font-bold text-gray-900">{formatLargeNumber(animatedHelpCount)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-600">Drivers Helped</span>
                <span className="text-xs text-gray-500">Back on the road safely</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export interface ActivityItem {
  id: string;
  user: {
    name: string;
    avatar?: string;
    location?: string;
  };
  action: string;
  target?: string;
  timestamp: string;
  icon: React.ReactNode;
}

export interface ActivityFeedProps {
  items: ActivityItem[];
  title?: string;
  emptyMessage?: string;
  className?: string;
}

export function ActivityFeed({ 
  items, 
  title = "Recent Activity", 
  emptyMessage = "No recent activity", 
  className 
}: ActivityFeedProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-0">
        <div className="p-4 border-b">
          <h3 className="font-medium text-lg">{title}</h3>
        </div>
        
        {items.length === 0 ? (
          <div className="p-6 text-center text-gray-500">{emptyMessage}</div>
        ) : (
          <div className="divide-y">
            {items.map((item) => (
              <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex">
                  <div className="mr-4 flex-shrink-0">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={item.user.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white">
                        {item.user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.user.name}
                      </p>
                      <p className="text-xs text-gray-500 whitespace-nowrap">
                        {item.timestamp}
                      </p>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-700">
                      <span className="inline-block mr-2 rounded-full p-1 bg-purple-100 text-purple-600">
                        {React.cloneElement(item.icon as React.ReactElement, { 
                          className: "h-3 w-3" 
                        })}
                      </span>
                      <span>
                        <span className="font-medium">{item.action}</span>
                        {item.target && <span> {item.target}</span>}
                      </span>
                    </div>
                    
                    {item.user.location && (
                      <p className="mt-1 text-xs text-gray-500 flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {item.user.location}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export const sampleActivityItems: ActivityItem[] = [
  {
    id: '1',
    user: {
      name: 'Jordan Lee',
      location: 'Buckhead, Atlanta'
    },
    action: 'Found a tow truck in under 2 minutes',
    timestamp: '5 min ago',
    icon: <Clock />
  },
  {
    id: '2',
    user: {
      name: 'Taylor Swift',
      location: 'Midtown, Atlanta'
    },
    action: 'Shared their location with a friend',
    timestamp: '25 min ago',
    icon: <MapPin />
  },
  {
    id: '3',
    user: {
      name: 'Alex Johnson',
      location: 'Sandy Springs, GA'
    },
    action: 'Unlocked the "Road Warrior" achievement',
    timestamp: '1 hour ago',
    icon: <Award />
  },
  {
    id: '4',
    user: {
      name: 'Morgan Freeman',
      location: 'Downtown, Atlanta'
    },
    action: 'Referred 3 new users',
    timestamp: '2 hours ago',
    icon: <Users />
  },
  {
    id: '5',
    user: {
      name: 'Zoe Williams',
      location: 'Decatur, GA'
    },
    action: 'Left a 5-star review',
    timestamp: '3 hours ago',
    icon: <ThumbsUp />
  }
];

export const sampleTestimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    location: 'Atlanta, GA',
    date: '2 days ago',
    rating: 5,
    text: 'This app literally saved me! I was stranded on I-85 with a flat tire and found a tow truck in under 3 minutes. The driver was excellent and got me back on the road quickly.',
    verified: true
  },
  {
    id: '2',
    name: 'Michael Rodriguez',
    location: 'Marietta, GA',
    date: '1 week ago',
    rating: 4,
    text: 'After my car wouldn\'t start outside the mall, I used this app to find help. Easy to use, quick response times, and the location sharing feature was really helpful.',
    verified: true
  },
  {
    id: '3',
    name: 'Jennifer Williams',
    location: 'Decatur, GA',
    date: '2 weeks ago',
    rating: 5,
    text: 'As someone who drives a lot for work, having this app gives me peace of mind. I\'ve used it twice now and both experiences were excellent - fast service and professional tow operators.',
    verified: true
  }
];