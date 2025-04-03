import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Badge } from './badge';
import { Progress } from './progress';
import { Avatar, AvatarFallback } from './avatar';
import { Input } from './input';
import { useToast } from '@/hooks/use-toast';
import { Gift, Medal, Zap, Shield, Star, Tag, Coins, Copy, Check, Share2, Award, Users, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ReferralReward {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  threshold: number;
}

export interface ReferralProgramProps {
  referralCode: string;
  referralLink?: string;
  referralUrl?: string;  // For compatibility with existing code
  referralsCount?: number;
  referralCount?: number; // For compatibility with existing code
  rewards: ReferralReward[];
  activeRewardId?: string;
  nextRewardId?: string;
  onCopyLink?: () => void;
  onShare?: () => void;
  onShareViaEmail?: (emails: string[]) => void;
  onShareViaSms?: (phoneNumbers: string[]) => void;
}

export function ReferralProgram({
  referralCode,
  referralLink,
  referralUrl,
  referralsCount,
  referralCount,
  rewards,
  activeRewardId,
  nextRewardId,
  onCopyLink,
  onShare,
  onShareViaEmail,
  onShareViaSms
}: ReferralProgramProps) {
  // Handle compatibility with different prop names
  const actualReferralLink = referralLink || referralUrl || '';
  const actualReferralsCount = referralsCount || referralCount || 0;
  const { toast } = useToast();
  const [copied, setCopied] = React.useState(false);
  
  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode).then(
      () => {
        setCopied(true);
        toast({
          title: "Code copied",
          description: "Referral code copied to clipboard"
        });
        
        setTimeout(() => setCopied(false), 2000);
      },
      () => {
        toast({
          title: "Failed to copy",
          description: "Could not copy referral code",
          variant: "destructive"
        });
      }
    );
  };
  
  // Find the next reward based on referral count
  const nextReward = rewards.find(r => r.threshold > actualReferralsCount);
  const progress = nextReward ? (actualReferralsCount / nextReward.threshold) * 100 : 100;
  
  // Calculate how many more referrals needed
  const referralsNeeded = nextReward ? nextReward.threshold - actualReferralsCount : 0;
  
  return (
    <div className="space-y-6">
      <Card className="border-purple-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Gift className="h-5 w-5 text-purple-600 mr-2" />
            Your Referral Program
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">Share your referral code</p>
              <div className="flex">
                <Input 
                  value={referralCode} 
                  readOnly 
                  className="bg-gray-50 font-mono text-center font-medium border-r-0 rounded-r-none" 
                />
                <Button 
                  onClick={handleCopyCode} 
                  variant="outline" 
                  size="icon"
                  className="rounded-l-none border-l-0"
                >
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-600 mb-2">Or share your referral link</p>
              <div className="flex">
                <Button 
                  onClick={onCopyLink}
                  variant="outline"
                  className="flex-1 justify-start font-normal text-gray-600 truncate"
                >
                  <span className="truncate">
                    {actualReferralLink}
                  </span>
                </Button>
                <Button 
                  onClick={onShare}
                  className="ml-2 bg-gradient-to-r from-purple-600 to-indigo-600"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>
          
          <div className="rounded-lg bg-purple-50 p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Users className="h-5 w-5 text-purple-600 mr-2" />
                <span className="font-medium">{actualReferralsCount} Successful Referrals</span>
              </div>
              
              <Badge variant="outline" className="bg-white">
                {nextReward 
                  ? `${referralsNeeded} more to unlock ${nextReward.title}`
                  : "All rewards unlocked!"}
              </Badge>
            </div>
            
            <div className="mt-3">
              <Progress value={progress} className="h-2 bg-gray-200" />
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-center pt-0">
          <Button variant="link" className="text-purple-600">
            View Full Referral History <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
      
      <h3 className="text-lg font-medium mt-6">Rewards You Can Earn</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {rewards.map((reward) => {
          const isActive = activeRewardId === reward.id;
          const isNext = nextRewardId === reward.id;
          const isUnlocked = reward.threshold <= actualReferralsCount;
          
          return (
            <Card 
              key={reward.id} 
              className={cn(
                "overflow-hidden transition-all border hover:shadow-md",
                isActive && "ring-2 ring-purple-600 border-purple-200",
                isNext && !isUnlocked && "border-purple-200 bg-purple-50/50",
                !isUnlocked && "opacity-70"
              )}
            >
              <div className={cn(
                "p-4 flex items-center justify-center",
                isUnlocked
                  ? "bg-gradient-to-br from-purple-600 to-indigo-600 text-white"
                  : "bg-gray-100"
              )}>
                <div className="h-14 w-14 rounded-full bg-white/20 flex items-center justify-center">
                  {React.cloneElement(reward.icon as React.ReactElement, { 
                    className: "h-7 w-7" 
                  })}
                </div>
              </div>
              
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{reward.title}</h4>
                  <Badge variant={isUnlocked ? "default" : "outline"} className={isUnlocked ? "bg-green-500" : ""}>
                    {isUnlocked ? "Unlocked" : `${reward.threshold} referrals`}
                  </Badge>
                </div>
                
                <p className="text-sm text-gray-600">{reward.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export interface ShareButtonProps {
  onClick: () => void;
  className?: string;
  children?: React.ReactNode;
}

export function ShareButton({ onClick, className, children }: ShareButtonProps) {
  return (
    <Button 
      onClick={onClick}
      className={cn("bg-gradient-to-r from-purple-600 to-indigo-600 text-white", className)}
    >
      <Share2 className="h-4 w-4 mr-2" />
      {children || "Share"}
    </Button>
  );
}

export interface ChallengeCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  reward: string | React.ReactNode;
  onClick: () => void;
}

export function ChallengeCard({ title, description, icon, reward, onClick }: ChallengeCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-all duration-200">
      <CardContent className="p-0">
        <div className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white p-4">
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center mr-3">
              {icon}
            </div>
            <div>
              <h3 className="font-medium text-lg">{title}</h3>
              <p className="text-sm text-purple-100">{description}</p>
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Award className="h-5 w-5 text-purple-500 mr-2" />
              <span className="font-medium">Reward:</span>
            </div>
            <div className="text-purple-700 font-medium">{reward}</div>
          </div>
          
          <Button 
            onClick={onClick}
            className="w-full mt-4 bg-gradient-to-r from-purple-600 to-indigo-600"
          >
            Start Challenge
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export const defaultReferralRewards: ReferralReward[] = [
  {
    id: 'discount',
    title: 'Premium Discount',
    description: 'Get 25% off on premium features for 3 months',
    icon: <Tag className="h-6 w-6" />,
    threshold: 3
  },
  {
    id: 'priority',
    title: 'Priority Service',
    description: 'Get priority tow truck assistance for 1 month',
    icon: <Zap className="h-6 w-6" />,
    threshold: 5
  },
  {
    id: 'points',
    title: 'Bonus Points',
    description: 'Earn 500 bonus points to unlock higher tier rewards',
    icon: <Coins className="h-6 w-6" />,
    threshold: 10
  },
  {
    id: 'premium',
    title: 'Premium Account',
    description: 'Unlock premium account features for 6 months',
    icon: <Star className="h-6 w-6" />,
    threshold: 15
  },
  {
    id: 'year-free',
    title: 'One Year Free',
    description: 'Get one year of premium service completely free',
    icon: <Medal className="h-6 w-6" />,
    threshold: 25
  },
  {
    id: 'lifetime',
    title: 'Lifetime Membership',
    description: 'Get lifetime membership with all premium features',
    icon: <Shield className="h-6 w-6" />,
    threshold: 50
  }
];