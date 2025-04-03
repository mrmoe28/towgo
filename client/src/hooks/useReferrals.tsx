import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { defaultReferralRewards } from '@/components/ui/referral';

interface ReferralData {
  code: string;
  url: string;
  referralCount: number;
  totalInvites: number;
  points: number;
}

interface ReferralsContextType {
  referralData: ReferralData;
  incrementReferralCount: (count?: number) => void;
  incrementInviteCount: (count?: number) => void;
  resetReferrals: () => void;
  generateReferralCode: () => string;
}

const defaultReferralData: ReferralData = {
  code: 'TOW4YOU',
  url: 'https://towgo.replit.app/ref/TOW4YOU',
  referralCount: 0,
  totalInvites: 0,
  points: 0
};

const ReferralsContext = createContext<ReferralsContextType | undefined>(undefined);

export function ReferralsProvider({ children }: { children: ReactNode }) {
  const [referralData, setReferralData] = useState<ReferralData>(defaultReferralData);
  
  useEffect(() => {
    // Load referral data from localStorage if available
    const savedReferralData = localStorage.getItem('referralData');
    
    if (savedReferralData) {
      try {
        setReferralData(JSON.parse(savedReferralData));
      } catch (error) {
        console.error('Error parsing saved referral data:', error);
        setReferralData(defaultReferralData);
      }
    } else {
      // Generate a random referral code if there isn't one already
      const code = generateReferralCode();
      setReferralData({
        ...defaultReferralData,
        code,
        url: `https://towgo.replit.app/ref/${code}`
      });
    }
  }, []);
  
  useEffect(() => {
    // Save referral data to localStorage when it changes
    localStorage.setItem('referralData', JSON.stringify(referralData));
  }, [referralData]);
  
  const incrementReferralCount = (count = 1) => {
    setReferralData(prev => ({
      ...prev,
      referralCount: prev.referralCount + count,
      points: prev.points + (count * 25) // Each referral is worth 25 points
    }));
  };
  
  const incrementInviteCount = (count = 1) => {
    setReferralData(prev => ({
      ...prev,
      totalInvites: prev.totalInvites + count
    }));
  };
  
  const resetReferrals = () => {
    const code = generateReferralCode();
    setReferralData({
      ...defaultReferralData,
      code,
      url: `https://towgo.replit.app/ref/${code}`
    });
    localStorage.removeItem('referralData');
  };
  
  const generateReferralCode = (): string => {
    // Generate a random 8-character alphanumeric code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };
  
  return (
    <ReferralsContext.Provider
      value={{
        referralData,
        incrementReferralCount,
        incrementInviteCount,
        resetReferrals,
        generateReferralCode
      }}
    >
      {children}
    </ReferralsContext.Provider>
  );
}

export function useReferrals() {
  const context = useContext(ReferralsContext);
  
  if (context === undefined) {
    throw new Error('useReferrals must be used within a ReferralsProvider');
  }
  
  return context;
}