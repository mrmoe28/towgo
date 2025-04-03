import { useQuery } from '@tanstack/react-query';

interface RecommendationsResponse {
  recommendations: string[];
}

export function useRecommendations(location?: string) {
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery<RecommendationsResponse>({
    queryKey: ['/api/recommendations' + (location ? `?location=${encodeURIComponent(location)}` : '')],
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  return {
    recommendations: data?.recommendations || [],
    isLoading,
    error: error ? (error as Error).message : null,
    refetch
  };
}