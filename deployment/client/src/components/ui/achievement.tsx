import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from './card';
import { Button } from './button';
import { Badge } from './badge';
import { Separator } from './separator';
import { Trophy, Award, Clock, MapPin, Car, Star, Phone, Gift, Share2, ThumbsUp, Medal, Search, Lock, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  points: number;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
  category?: 'beginner' | 'intermediate' | 'advanced';
  date_unlocked?: string;
  shareText?: string;
}

export interface AchievementBadgeProps {
  achievement: Achievement;
}

export function AchievementBadge({ achievement }: AchievementBadgeProps) {
  const progressPercentage = achievement.progress && achievement.maxProgress
    ? Math.min(100, (achievement.progress / achievement.maxProgress) * 100)
    : 0;
  
  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-300 h-full flex flex-col",
      achievement.unlocked
        ? "bg-white border-purple-200 shadow-md"
        : "bg-gray-50 border-gray-100 opacity-70 hover:opacity-90"
    )}>
      <CardContent className="p-4 text-center flex-1 flex flex-col items-center justify-center">
        <div className={cn(
          "mx-auto mb-3 rounded-full flex items-center justify-center w-14 h-14",
          achievement.unlocked
            ? "bg-gradient-to-br from-purple-600 to-indigo-600 text-white"
            : "bg-gray-200 text-gray-400"
        )}>
          {achievement.icon}
        </div>
        
        <h3 className={cn(
          "text-sm font-medium mb-1",
          achievement.unlocked ? "text-gray-900" : "text-gray-600"
        )}>
          {achievement.title}
        </h3>
        
        <p className="text-xs text-gray-500 line-clamp-3 mb-2 flex-1">
          {achievement.description}
        </p>
        
        {achievement.progress !== undefined && achievement.maxProgress !== undefined && (
          <div className="w-full">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-500">{achievement.progress}/{achievement.maxProgress}</span>
              <span className={cn(
                "font-medium",
                achievement.unlocked ? "text-purple-600" : "text-gray-400"
              )}>
                {progressPercentage}%
              </span>
            </div>
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full",
                  achievement.unlocked 
                    ? "bg-gradient-to-r from-purple-500 to-indigo-500" 
                    : "bg-gray-300"
                )} 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className={cn(
        "p-2 text-center text-xs flex justify-center",
        achievement.unlocked 
          ? "bg-purple-50 text-purple-700" 
          : "bg-gray-100 text-gray-500"
      )}>
        <Trophy className="h-3 w-3 mr-1" />
        <span>{achievement.points} Points</span>
      </CardFooter>
    </Card>
  );
}

export interface AchievementCardProps {
  achievement: Achievement;
  onShare: (achievement: Achievement) => void;
}

export function AchievementCard({ achievement, onShare }: AchievementCardProps) {
  const progressPercentage = achievement.progress && achievement.maxProgress
    ? Math.min(100, (achievement.progress / achievement.maxProgress) * 100)
    : 0;
  
  return (
    <Card className={cn(
      "mb-4 overflow-hidden transition-all duration-200",
      achievement.unlocked ? "border-purple-200" : "border-gray-200"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start">
          <div className={cn(
            "mr-4 rounded-full flex items-center justify-center h-12 w-12 flex-shrink-0",
            achievement.unlocked
              ? "bg-gradient-to-br from-purple-600 to-indigo-600 text-white"
              : "bg-gray-100 text-gray-400"
          )}>
            {achievement.unlocked ? (
              achievement.icon
            ) : (
              <Lock className="h-5 w-5" />
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">
                {achievement.title}
                {achievement.unlocked && (
                  <Badge variant="secondary" className="ml-2 bg-purple-100 text-purple-700">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Unlocked
                  </Badge>
                )}
              </h3>
              
              <Badge className="bg-purple-50 text-purple-700 border-purple-200">
                <Trophy className="h-3 w-3 mr-1" />
                {achievement.points} pts
              </Badge>
            </div>
            
            <p className="mt-1 text-sm text-gray-600">{achievement.description}</p>
            
            {(achievement.progress !== undefined && achievement.maxProgress !== undefined) && (
              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">Progress</span>
                  <span className="font-medium">
                    {achievement.progress} / {achievement.maxProgress}
                  </span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={
                      achievement.unlocked 
                        ? "h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500" 
                        : "h-full rounded-full bg-purple-200"
                    } 
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>
            )}
            
            {achievement.unlocked && achievement.date_unlocked && (
              <div className="mt-3 flex items-center text-xs text-gray-500">
                <Clock className="h-3 w-3 mr-1" />
                <span>Unlocked on {achievement.date_unlocked}</span>
              </div>
            )}
            
            <div className="mt-3 flex justify-end">
              {achievement.unlocked ? (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-purple-600 border-purple-200"
                  onClick={() => onShare(achievement)}
                >
                  <Share2 className="h-3 w-3 mr-2" />
                  Share Achievement
                </Button>
              ) : (
                achievement.progress !== undefined && achievement.maxProgress !== undefined && (
                  <span className="text-xs text-gray-500">
                    {achievement.maxProgress - achievement.progress} more to unlock
                  </span>
                )
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export interface AchievementProgressProps {
  completed: number;
  total: number;
}

export function AchievementProgress({ completed, total }: AchievementProgressProps) {
  const percentage = Math.round((completed / total) * 100) || 0;
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Achievement Progress</h2>
          <Badge variant="outline">
            {percentage}% Complete
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500" 
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{completed} of {total} achievements unlocked</span>
            <span className="font-medium text-purple-600">
              {total - completed} remaining
            </span>
          </div>
          
          <Separator />
          
          <div className="flex justify-between text-sm">
            <div>
              <p className="font-medium">Current Level</p>
              <p className="text-xs text-gray-500">
                {percentage < 20 ? 'Beginner' : 
                 percentage < 50 ? 'Explorer' : 
                 percentage < 80 ? 'Expert' : 'Master'}
              </p>
            </div>
            
            <div className="text-right">
              <p className="font-medium">Next Level</p>
              <p className="text-xs text-gray-500">
                {percentage < 20 ? 'Explorer (20%)' : 
                 percentage < 50 ? 'Expert (50%)' : 
                 percentage < 80 ? 'Master (80%)' : 'Completed!'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export const defaultAchievements: Omit<Achievement, 'unlocked'>[] = [
  {
    id: 'first-search',
    title: 'First Search',
    description: 'Complete your first tow truck search',
    icon: <Search className="h-6 w-6" />,
    points: 10,
  },
  {
    id: 'location-master',
    title: 'Location Master',
    description: 'Share your location 5 times',
    icon: <MapPin className="h-6 w-6" />,
    points: 25,
    progress: 3,
    maxProgress: 5
  },
  {
    id: 'vehicle-expert',
    title: 'Vehicle Expert',
    description: 'Add details for 3 different vehicles',
    icon: <Car className="h-6 w-6" />,
    points: 30,
    progress: 1,
    maxProgress: 3
  },
  {
    id: 'five-star',
    title: 'Five Star',
    description: 'Rate 10 tow services',
    icon: <Star className="h-6 w-6" />,
    points: 50,
    progress: 2,
    maxProgress: 10
  },
  {
    id: 'quick-caller',
    title: 'Quick Caller',
    description: 'Call 5 tow services',
    icon: <Phone className="h-6 w-6" />,
    points: 40,
    progress: 0,
    maxProgress: 5
  },
  {
    id: 'referral-champ',
    title: 'Referral Champion',
    description: 'Refer 3 friends who complete a search',
    icon: <Gift className="h-6 w-6" />,
    points: 75,
    progress: 0,
    maxProgress: 3
  },
  {
    id: 'social-sharer',
    title: 'Social Sharer',
    description: 'Share the app on social media',
    icon: <Share2 className="h-6 w-6" />,
    points: 20,
  },
  {
    id: 'feedback-provider',
    title: 'Feedback Provider',
    description: 'Provide feedback on the app',
    icon: <ThumbsUp className="h-6 w-6" />,
    points: 15,
  },
  {
    id: 'gold-member',
    title: 'Gold Member',
    description: 'Reach 500 points',
    icon: <Medal className="h-6 w-6" />,
    points: 100,
    progress: 320,
    maxProgress: 500
  },
  {
    id: 'help-others',
    title: 'Help Others',
    description: 'Share a location to help another driver',
    icon: <Award className="h-6 w-6" />,
    points: 35,
  }
];