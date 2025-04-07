import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  ReferralProgram,
  defaultReferralRewards 
} from '@/components/ui/referral';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ActivityFeed, sampleActivityItems } from '@/components/ui/social-proof';
import { ShareButton, ChallengeCard } from '@/components/ui/share-card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Link } from 'wouter';
import { 
  ArrowLeft,
  Gift,
  Users,
  Share2,
  CheckCircle
} from 'lucide-react';

export default function ReferralsPage() {
  const [challengeOpen, setChallengeOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // This would be fetched from your backend in a real implementation
  const [referralStats, setReferralStats] = useState({
    code: "TOW4YOU",
    url: "https://towgo.replit.app/ref/TOW4YOU",
    count: 2
  });
  
  const handleShareViaEmail = (emails: string[]) => {
    console.log("Sharing via email to:", emails);
    // This would trigger an API call to send emails in a real implementation
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };
  
  const handleShareViaSms = (phoneNumbers: string[]) => {
    console.log("Sharing via SMS to:", phoneNumbers);
    // This would trigger an API call to send SMS in a real implementation
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };
  
  return (
    <div className="container p-4 mx-auto max-w-4xl">
      <div className="mb-6 flex items-center">
        <Button variant="ghost" size="icon" className="mr-2" asChild>
          <Link to="/">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Refer Friends & Earn Rewards</h1>
      </div>
      
      {showSuccess && (
        <Alert className="mb-6 animate-slide-up bg-green-50 text-green-700">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Your invitations have been sent successfully!
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <ReferralProgram
            referralCode={referralStats.code}
            referralUrl={referralStats.url}
            referralCount={referralStats.count}
            rewards={defaultReferralRewards.map(reward => ({
              ...reward,
              unlocked: referralStats.count >= reward.threshold
            }))}
            onShareViaEmail={handleShareViaEmail}
            onShareViaSms={handleShareViaSms}
          />
          
          <Card className="mt-6 animate-slide-up border-purple-100 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl">Your Referral Stats</CardTitle>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg bg-purple-50 p-4 text-center">
                  <p className="text-sm text-gray-600">Total Invites</p>
                  <p className="mt-1 text-3xl font-bold text-purple-700">{referralStats.count + 5}</p>
                </div>
                <div className="rounded-lg bg-indigo-50 p-4 text-center">
                  <p className="text-sm text-gray-600">Registered</p>
                  <p className="mt-1 text-3xl font-bold text-indigo-700">{referralStats.count}</p>
                </div>
                <div className="rounded-lg bg-blue-50 p-4 text-center">
                  <p className="text-sm text-gray-600">Points Earned</p>
                  <p className="mt-1 text-3xl font-bold text-blue-700">{referralStats.count * 25}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t bg-gray-50 px-6 py-3">
              <div className="w-full flex justify-between items-center">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100"
                  onClick={() => setChallengeOpen(true)}
                >
                  <Gift className="mr-2 h-4 w-4" />
                  Challenge Friends
                </Button>
                
                <ShareButton onClick={() => setShareOpen(true)} />
              </div>
            </CardFooter>
          </Card>
        </div>
        
        <div>
          <ActivityFeed items={sampleActivityItems} title="Recent Referrals" />
          
          <Card className="mt-6 border-purple-100 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Referral Benefits</CardTitle>
            </CardHeader>
            <CardContent className="pb-3">
              <ul className="space-y-3">
                {[
                  "Extended search radius up to 50 miles",
                  "Priority customer service during emergencies",
                  "Advanced tow truck filtering options",
                  "Unlock achievement badges and rewards",
                  "Help friends find tow trucks faster"
                ].map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="mr-2 h-4 w-4 mt-0.5 text-green-600" />
                    <span className="text-sm">{benefit}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="flex justify-center border-t bg-gray-50 p-3">
              <p className="text-xs text-center text-gray-600">
                Every successful referral earns you 25 points
              </p>
            </CardFooter>
          </Card>
          
          <Card className="mt-6 hover:shadow-md transition-shadow border-purple-100 bg-gradient-to-br from-purple-50 to-indigo-50 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">Group Emergency</h3>
                  <p className="text-sm text-gray-600">
                    Create a group of friends for shared roadside emergencies
                  </p>
                </div>
              </div>
              
              <Separator className="my-3" />
              
              <Button 
                className="w-full btn-gradient"
                onClick={() => setChallengeOpen(true)}
              >
                <Users className="mr-2 h-4 w-4" />
                Create Emergency Group
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Dialog open={challengeOpen} onOpenChange={setChallengeOpen}>
        <DialogContent className="sm:max-w-md">
          <ChallengeCard
            title="Challenge Friends to Join TowGo"
            description="Invite 3 friends to join TowGo and both you and your friends will get extended search radius up to 50 miles!"
            imageUrl="https://images.unsplash.com/photo-1617886903355-ec86fcf925e3?q=80&w=500&auto=format&fit=crop"
            onInvite={() => {
              setChallengeOpen(false);
              setShareOpen(true);
            }}
            onClose={() => setChallengeOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-2">Share TowGo</h2>
            <p className="text-gray-600 mb-4">
              Invite friends to join TowGo and earn rewards when they sign up!
            </p>
            
            <div className="flex flex-col space-y-3">
              <Button
                className="w-full bg-[#1DA1F2] hover:bg-[#0d95e8] text-white"
                onClick={() => {
                  const text = "I'm using TowGo to find emergency tow truck services quickly! Try it out:";
                  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(referralStats.url)}`, '_blank');
                }}
              >
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
                Share on Twitter
              </Button>
              
              <Button
                className="w-full bg-[#4267B2] hover:bg-[#365899] text-white"
                onClick={() => {
                  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralStats.url)}`, '_blank');
                }}
              >
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Share on Facebook
              </Button>
              
              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                onClick={() => {
                  const text = "Join me on TowGo for quick roadside assistance! Use my referral code:";
                  window.open(`https://wa.me/?text=${encodeURIComponent(text + " " + referralStats.code + " " + referralStats.url)}`, '_blank');
                }}
              >
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 6.627 5.373 12 12 12 6.627 0 12-5.373 12-12 0-6.627-5.373-12-12-12zm.03 18.15c-1.792 0-3.558-.471-5.106-1.363l-3.574.934.953-3.5a10.02 10.02 0 01-1.484-5.251c0-5.533 4.5-10.03 10.03-10.03 5.532 0 10.03 4.497 10.03 10.03 0 5.532-4.498 10.03-10.03 10.03z"/>
                </svg>
                Share on WhatsApp
              </Button>
              
              <Button
                className="w-full bg-gray-900 hover:bg-gray-800 text-white"
                onClick={() => {
                  navigator.clipboard.writeText(`${referralStats.url}`);
                  alert("Referral link copied to clipboard!");
                }}
              >
                <Share2 className="h-5 w-5 mr-2" />
                Copy Referral Link
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}