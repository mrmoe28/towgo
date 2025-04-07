import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AchievementCard, 
  AchievementProgress, 
  defaultAchievements, 
  Achievement 
} from '@/components/ui/achievement';
import { ShareCard } from '@/components/ui/share-card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';
import { 
  ArrowLeft,
  Share2,
  Trophy,
  Clock,
  Search,
  User,
  Car
} from 'lucide-react';

export default function AchievementsPage() {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [achievements, setAchievements] = useState<Achievement[]>(
    defaultAchievements.map(achievement => ({
      ...achievement,
      unlocked: achievement.id === 'first-search', // Example: only one achievement unlocked
      date_unlocked: achievement.id === 'first-search' ? new Date().toLocaleDateString() : undefined,
      progress: achievement.progress || 0
    }))
  );
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  
  const completedAchievements = achievements.filter(a => a.unlocked);
  const inProgressAchievements = achievements.filter(a => !a.unlocked && a.progress !== undefined && a.maxProgress !== undefined);
  const lockedAchievements = achievements.filter(a => !a.unlocked && (a.progress === undefined || a.maxProgress === undefined));
  
  const handleShare = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    setShareDialogOpen(true);
  };
  
  const filterAchievements = (filter: string) => {
    if (filter === 'all') return achievements;
    if (filter === 'completed') return completedAchievements;
    if (filter === 'in-progress') return inProgressAchievements;
    if (filter === 'locked') return lockedAchievements;
    if (filter === 'beginner' || filter === 'intermediate' || filter === 'advanced') {
      return achievements.filter(a => a.category === filter);
    }
    return achievements;
  };
  
  return (
    <div className="container p-4 mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="mr-2" asChild>
            <Link to="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Your Achievements</h1>
        </div>
        
        <div>
          <Badge variant="outline" className="bg-purple-50 text-purple-700 mr-2">
            <Trophy className="h-3 w-3 mr-1" />
            {completedAchievements.length}/{achievements.length}
          </Badge>
          
          <Badge variant="outline">
            {achievements.reduce((total, a) => total + (a.unlocked ? a.points : 0), 0)} Points
          </Badge>
        </div>
      </div>
      
      <div className="mb-6">
        <AchievementProgress 
          completed={completedAchievements.length} 
          total={achievements.length} 
        />
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full mb-6">
          <TabsTrigger 
            value="all" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white"
          >
            All
          </TabsTrigger>
          <TabsTrigger 
            value="completed" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white"
          >
            Completed
          </TabsTrigger>
          <TabsTrigger 
            value="in-progress" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white"
          >
            In Progress
          </TabsTrigger>
          <TabsTrigger 
            value="locked" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white"
          >
            Locked
          </TabsTrigger>
        </TabsList>
        
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {activeTab === 'all' ? 'All Achievements' : 
               activeTab === 'completed' ? 'Completed Achievements' :
               activeTab === 'in-progress' ? 'In Progress' : 'Locked Achievements'}
            </h2>
            
            <Button variant="outline" size="sm" onClick={() => setActiveTab('beginner')} className={activeTab === 'beginner' ? 'bg-purple-50 text-purple-700' : ''}>
              Beginner
            </Button>
          </div>
          
          <Separator className="my-4" />
          
          <div className="space-y-1">
            {filterAchievements(activeTab).length > 0 ? (
              filterAchievements(activeTab).map(achievement => (
                <AchievementCard 
                  key={achievement.id} 
                  achievement={achievement} 
                  onShare={handleShare}
                />
              ))
            ) : (
              <div className="text-center py-12">
                <div className="flex justify-center mb-4">
                  {activeTab === 'completed' ? (
                    <Trophy className="h-12 w-12 text-gray-300" />
                  ) : activeTab === 'in-progress' ? (
                    <Clock className="h-12 w-12 text-gray-300" />
                  ) : (
                    <Trophy className="h-12 w-12 text-gray-300" />
                  )}
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">No achievements found</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  {activeTab === 'completed' 
                    ? "You haven't completed any achievements yet. Keep using the app to earn achievements!"
                    : activeTab === 'in-progress'
                    ? "No achievements in progress. Start using the app features to make progress!"
                    : "No achievements match the current filter. Try selecting a different category."}
                </p>
                
                <div className="mt-6">
                  <Button onClick={() => setActiveTab('all')}>
                    View All Achievements
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Suggested Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                icon: <Search className="h-5 w-5 text-purple-600" />,
                title: "Search for a Tow Truck",
                description: "Complete a search to unlock 'First Responder' achievement",
                link: "/"
              },
              {
                icon: <Car className="h-5 w-5 text-purple-600" />,
                title: "Add Your Vehicle",
                description: "Add vehicle info to earn the 'Road Warrior' achievement",
                link: "/?tab=vehicle"
              },
              {
                icon: <Share2 className="h-5 w-5 text-purple-600" />,
                title: "Share Your Location",
                description: "Share location with a friend for the 'Safety First' badge",
                link: "/share-location"
              }
            ].map((action, index) => (
              <div key={index} className="rounded-lg border border-purple-100 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                    {action.icon}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">{action.title}</h3>
                    <p className="mt-1 text-sm text-gray-600">{action.description}</p>
                    <Button 
                      variant="link" 
                      className="mt-2 h-auto p-0 text-purple-600" 
                      asChild
                    >
                      <Link to={action.link}>Try Now</Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Tabs>
      
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          {selectedAchievement && (
            <ShareCard 
              title={`I unlocked ${selectedAchievement.title}!`}
              description={selectedAchievement.shareText || `I just earned the ${selectedAchievement.title} achievement on TowGo! Try it yourself to unlock achievements while finding tow truck services.`}
              shareUrl={`https://towgo.replit.app/share/achievements/${selectedAchievement.id}`}
              hashtags={['RoadsideAssistance', 'AchievementUnlocked', 'TowGo']}
              onClose={() => setShareDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}