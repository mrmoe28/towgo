import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Avatar, AvatarFallback } from './avatar';
import { Share2, Twitter, Facebook, Linkedin, Mail, Copy, ExternalLink, MapPin, Clock, Edit, X, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export interface ShareCardProps {
  title: string;
  description: string;
  url?: string;
  className?: string;
  shareUrl?: string;
  hashtags?: string[];
  onClose?: () => void;
}

export function ShareCard({ 
  title, 
  description, 
  url = "https://towgo.replit.app", 
  className,
  shareUrl,
  hashtags = [],
  onClose
}: ShareCardProps) {
  const { toast } = useToast();
  const shareUrlToUse = shareUrl || url;
  
  const handleCopyLink = () => {
    if (shareUrlToUse) {
      navigator.clipboard.writeText(shareUrlToUse).then(
        () => {
          toast({
            title: "Link copied",
            description: "Share link has been copied to clipboard."
          });
        },
        () => {
          toast({
            title: "Failed to copy",
            description: "Could not copy link to clipboard. Please try again.",
            variant: "destructive"
          });
        }
      );
    }
  };
  
  const shareOnTwitter = () => {
    const text = `${title}: ${description}`;
    const hashtagsString = hashtags.length > 0 ? `&hashtags=${hashtags.join(',')}` : '';
    if (shareUrlToUse) {
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrlToUse)}${hashtagsString}`;
      window.open(twitterUrl, '_blank', 'noopener,noreferrer');
    }
  };
  
  const shareOnFacebook = () => {
    if (shareUrlToUse) {
      const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrlToUse)}`;
      window.open(facebookUrl, '_blank', 'noopener,noreferrer');
    }
  };
  
  const shareOnLinkedIn = () => {
    if (shareUrlToUse) {
      const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrlToUse)}`;
      window.open(linkedinUrl, '_blank', 'noopener,noreferrer');
    }
  };
  
  const shareByEmail = () => {
    const subject = encodeURIComponent(title);
    if (shareUrlToUse) {
      const body = encodeURIComponent(`${description}\n\n${shareUrlToUse}`);
      window.location.href = `mailto:?subject=${subject}&body=${body}`;
    }
  };
  
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Share This</h3>
          <Share2 className="h-5 w-5 text-purple-600" />
        </div>
        
        <p className="text-sm text-gray-600">
          Help others discover roadside assistance by sharing this link
        </p>
        
        <div className="bg-gray-50 rounded-md p-3 flex justify-between items-center">
          <span className="text-xs text-gray-500 truncate flex-1">
            {shareUrlToUse && shareUrlToUse.length > 40 ? shareUrlToUse.substring(0, 40) + '...' : shareUrlToUse}
          </span>
          <Button variant="ghost" size="sm" onClick={handleCopyLink}>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-wrap justify-between gap-2 p-6 pt-0">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1 text-[#1DA1F2] hover:bg-[#1DA1F2]/10"
          onClick={shareOnTwitter}
        >
          <Twitter className="h-4 w-4 mr-2" />
          Twitter
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1 text-[#1877F2] hover:bg-[#1877F2]/10"
          onClick={shareOnFacebook}
        >
          <Facebook className="h-4 w-4 mr-2" />
          Facebook
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1 text-[#0A66C2] hover:bg-[#0A66C2]/10"
          onClick={shareOnLinkedIn}
        >
          <Linkedin className="h-4 w-4 mr-2" />
          LinkedIn
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1 text-gray-600 hover:bg-gray-100"
          onClick={shareByEmail}
        >
          <Mail className="h-4 w-4 mr-2" />
          Email
        </Button>
      </CardFooter>
    </Card>
  );
}

export interface LocationShareCardProps {
  name: string;
  location: string;
  locationUrl: string;
  expiresIn: string;
  initials: string;
  onCopyLink: () => void;
  onShare: () => void;
  onUpdate: () => void;
  onCancel: () => void;
}

export function LocationShareCard({
  name,
  location,
  locationUrl,
  expiresIn,
  initials,
  onCopyLink,
  onShare,
  onUpdate,
  onCancel
}: LocationShareCardProps) {
  return (
    <Card className="overflow-hidden border-purple-100 shadow-md animate-float">
      <CardHeader className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white relative p-5">
        <div className="absolute top-3 right-3 flex space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-white hover:bg-white/20"
            onClick={onUpdate}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-white hover:bg-white/20"
            onClick={onCancel}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center mb-2">
          <Avatar className="h-12 w-12 mr-3 border-2 border-white/30">
            <AvatarFallback className="bg-purple-800 text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-xl mb-1">{name}</CardTitle>
            <div className="flex items-center text-purple-100 text-sm">
              <MapPin className="h-3 w-3 mr-1" />
              <span>Shared location</span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-5 space-y-4">
        <div className="bg-purple-50 p-4 rounded-md">
          <div className="flex items-center mb-2">
            <MapPin className="h-5 w-5 text-purple-600 mr-2" />
            <span className="font-medium">Current Location</span>
          </div>
          <p className="text-gray-800">{location}</p>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 flex items-center">
              <Clock className="h-4 w-4 mr-1 text-gray-500" />
              Link expires in:
            </span>
            <span className="font-medium text-purple-600">{expiresIn}</span>
          </div>
          <div className="h-2 rounded-full bg-gray-100">
            <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 w-3/4"></div>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-md p-3 flex justify-between items-center">
          <span className="text-xs text-gray-500 truncate flex-1">
            {locationUrl}
          </span>
          <Button variant="ghost" size="sm" onClick={onCopyLink}>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
      
      <CardFooter className="p-5 pt-0">
        <Button 
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
          onClick={onShare}
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share Location
        </Button>
      </CardFooter>
    </Card>
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
  imageUrl?: string;
  onInvite: () => void;
  onClose: () => void;
}

export function ChallengeCard({ title, description, imageUrl, onInvite, onClose }: ChallengeCardProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <h2 className="text-lg font-medium">{title}</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      {imageUrl && (
        <div className="rounded-lg overflow-hidden aspect-video bg-gray-100">
          <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
        </div>
      )}
      
      <p className="text-gray-600">{description}</p>
      
      <div className="flex flex-col space-y-3">
        <Button 
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
          onClick={onInvite}
        >
          <Users className="h-4 w-4 mr-2" />
          Invite Friends
        </Button>
      </div>
    </div>
  );
}

export function ReplitBadge({ className }: { className?: string }) {
  return (
    <a 
      href="https://replit.com" 
      target="_blank" 
      rel="noopener noreferrer"
      className={cn(
        "flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium",
        className
      )}
    >
      <div className="bg-white rounded-full shadow-sm h-6 w-6 flex items-center justify-center">
        <svg width="16" height="16" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 5.5C7 4.67157 7.67157 4 8.5 4H15.5C16.3284 4 17 4.67157 17 5.5V12.5C17 13.3284 16.3284 14 15.5 14H8.5C7.67157 14 7 13.3284 7 12.5V5.5Z" fill="#F26207"/>
          <path d="M17 19.5C17 18.6716 17.6716 18 18.5 18H25.5C26.3284 18 27 18.6716 27 19.5V26.5C27 27.3284 26.3284 28 25.5 28H18.5C17.6716 28 17 27.3284 17 26.5V19.5Z" fill="#F26207"/>
          <path d="M4 18.5C4 17.6716 4.67157 17 5.5 17H12.5C13.3284 17 14 17.6716 14 18.5V25.5C14 26.3284 13.3284 27 12.5 27H5.5C4.67157 27 4 26.3284 4 25.5V18.5Z" fill="#F26207"/>
        </svg>
      </div>
      <span>Made with Replit</span>
      <ExternalLink className="h-3 w-3" />
    </a>
  );
}