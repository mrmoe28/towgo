import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Achievement, defaultAchievements } from '@/components/ui/achievement';

interface AchievementsContextType {
  achievements: Achievement[];
  unlockAchievement: (id: string) => void;
  incrementAchievementProgress: (id: string, amount?: number) => void;
  resetAchievements: () => void;
  isAchievementUnlocked: (id: string) => boolean;
  getAchievementProgress: (id: string) => { current: number; max: number } | null;
  totalPoints: number;
}

const AchievementsContext = createContext<AchievementsContextType | undefined>(undefined);

export function AchievementsProvider({ children }: { children: ReactNode }) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  
  useEffect(() => {
    // Load achievements from localStorage if available
    const savedAchievements = localStorage.getItem('achievements');
    
    if (savedAchievements) {
      try {
        setAchievements(JSON.parse(savedAchievements));
      } catch (error) {
        console.error('Error parsing saved achievements:', error);
        setAchievements(defaultAchievements);
      }
    } else {
      setAchievements(defaultAchievements);
    }
  }, []);
  
  useEffect(() => {
    // Save achievements to localStorage when they change
    if (achievements.length > 0) {
      localStorage.setItem('achievements', JSON.stringify(achievements));
    }
  }, [achievements]);
  
  const unlockAchievement = (id: string) => {
    setAchievements(prev => {
      return prev.map(achievement => {
        if (achievement.id === id && !achievement.unlocked) {
          return { 
            ...achievement, 
            unlocked: true,
            date_unlocked: new Date().toLocaleDateString()
          };
        }
        return achievement;
      });
    });
  };
  
  const incrementAchievementProgress = (id: string, amount = 1) => {
    setAchievements(prev => {
      return prev.map(achievement => {
        if (achievement.id === id && 
            achievement.progress !== undefined && 
            achievement.maxProgress !== undefined &&
            !achievement.unlocked) {
          
          const newProgress = Math.min(achievement.maxProgress, (achievement.progress + amount));
          
          // If reached max progress, unlock the achievement
          if (newProgress >= achievement.maxProgress) {
            return { 
              ...achievement, 
              progress: newProgress,
              unlocked: true,
              date_unlocked: new Date().toLocaleDateString()
            };
          }
          
          // Otherwise just update the progress
          return { 
            ...achievement, 
            progress: newProgress
          };
        }
        return achievement;
      });
    });
  };
  
  const resetAchievements = () => {
    setAchievements(defaultAchievements);
    localStorage.removeItem('achievements');
  };
  
  const isAchievementUnlocked = (id: string): boolean => {
    const achievement = achievements.find(a => a.id === id);
    return achievement?.unlocked || false;
  };
  
  const getAchievementProgress = (id: string) => {
    const achievement = achievements.find(a => a.id === id);
    
    if (achievement?.progress !== undefined && achievement?.maxProgress !== undefined) {
      return {
        current: achievement.progress,
        max: achievement.maxProgress
      };
    }
    
    return null;
  };
  
  const totalPoints = achievements.reduce((total, achievement) => {
    return total + (achievement.unlocked ? achievement.points : 0);
  }, 0);
  
  return (
    <AchievementsContext.Provider
      value={{
        achievements,
        unlockAchievement,
        incrementAchievementProgress,
        resetAchievements,
        isAchievementUnlocked,
        getAchievementProgress,
        totalPoints
      }}
    >
      {children}
    </AchievementsContext.Provider>
  );
}

export function useAchievements() {
  const context = useContext(AchievementsContext);
  
  if (context === undefined) {
    throw new Error('useAchievements must be used within an AchievementsProvider');
  }
  
  return context;
}