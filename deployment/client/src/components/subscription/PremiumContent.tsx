import React, { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Lock } from 'lucide-react';
import { Link } from 'wouter';

interface PremiumContentProps {
  children: ReactNode;
  title?: string;
  description?: string;
  fallback?: ReactNode;
}

export default function PremiumContent({
  children,
  title = 'Premium Feature',
  description = 'This feature requires a premium subscription.',
  fallback,
}: PremiumContentProps) {
  // Check if user has premium access
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/subscription/access'],
    retry: 1,
  });

  // If loading, show a spinner
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If error, show error message
  if (error || !data) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Failed to check premium access. Please try again later.</p>
        </CardContent>
      </Card>
    );
  }

  // If user has premium access, show the content
  const accessData = data as any;
  if (accessData && accessData.hasPremium) {
    return <>{children}</>;
  }

  // If fallback is provided, show that instead of the default paywall
  if (fallback) {
    return <>{fallback}</>;
  }

  // Otherwise, show premium paywall
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="space-y-1">
        <CardTitle className="flex items-center text-xl">
          <Lock className="mr-2 h-5 w-5 text-primary" />
          {title}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent>
        <p>
          Get unlimited access to all premium features with TowGo Premium.
          Start with a 24-hour free trial.
        </p>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
        <Button asChild className="w-full sm:w-auto">
          <Link to="/subscription">Subscribe Now</Link>
        </Button>
        <Button variant="outline" asChild className="w-full sm:w-auto">
          <Link to="/subscription">Start Free Trial</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}