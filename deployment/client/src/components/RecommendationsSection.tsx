import React from 'react';
import { useRecommendations } from '@/hooks/useRecommendations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Sparkles } from 'lucide-react';

interface RecommendationsSectionProps {
  location?: string;
  onSelectRecommendation: (type: string) => void;
}

export default function RecommendationsSection({
  location,
  onSelectRecommendation
}: RecommendationsSectionProps) {
  const { recommendations, isLoading, error } = useRecommendations(location);

  if (error) {
    return null; // Don't show section if there's an error
  }

  return (
    <Card className="w-full mb-4 border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Sparkles className="h-5 w-5 mr-2 text-yellow-500" />
          Recommended for You
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex gap-2 flex-wrap">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-8 w-24 rounded-full" />
            ))}
          </div>
        ) : recommendations.length > 0 ? (
          <div className="flex gap-2 flex-wrap">
            {recommendations.map((recommendation: string, index: number) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="cursor-pointer hover:bg-secondary transition-colors py-2 px-3"
                onClick={() => onSelectRecommendation(recommendation)}
              >
                {recommendation}
                <ArrowRight className="h-3 w-3 ml-1" />
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Save favorites to get personalized recommendations.
          </p>
        )}
      </CardContent>
    </Card>
  );
}