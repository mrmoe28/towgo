import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
// Define types based on shared schema
interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  priceId: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  isFree: boolean;
  trialDays: number;
}

interface SubscriptionStatus {
  subscriptionId?: string;
  customerId?: string;
  status?: string;
  currentPeriodEnd?: number;
  cancelAtPeriodEnd?: boolean;
  trialEnd?: number;
}

export default function SubscriptionPage() {
  const { toast } = useToast();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Get subscription plans
  const plansQuery = useQuery({
    queryKey: ['/api/subscription/plans'],
    retry: 1,
  });

  // Get user's subscription status
  const statusQuery = useQuery({
    queryKey: ['/api/subscription/status'],
    retry: 1,
  });

  // Start trial mutation
  const trialMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/subscription/trial');
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Trial Started',
        description: data.message || 'Your free trial has started successfully!',
      });
      // Refresh subscription status
      statusQuery.refetch();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to start trial',
        variant: 'destructive',
      });
    },
  });

  // Subscribe mutation
  const subscribeMutation = useMutation({
    mutationFn: async (planId: string) => {
      setIsRedirecting(true);
      const data = {
        planId,
        successUrl: `${window.location.origin}/subscription?success=true`,
        cancelUrl: `${window.location.origin}/subscription?canceled=true`,
      };
      const res = await apiRequest('POST', '/api/subscription/checkout', data);
      return await res.json();
    },
    onSuccess: (data) => {
      // Redirect to Stripe checkout
      window.location.href = data.url;
    },
    onError: (error: any) => {
      setIsRedirecting(false);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create subscription',
        variant: 'destructive',
      });
    },
  });

  // Handle URL parameters on return from Stripe
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const canceled = urlParams.get('canceled');

    if (success === 'true') {
      toast({
        title: 'Subscription Successful',
        description: 'Thank you for subscribing to TowGo Premium!',
      });
      // Clean URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
      // Refresh subscription status
      statusQuery.refetch();
    } else if (canceled === 'true') {
      toast({
        title: 'Subscription Canceled',
        description: 'You have canceled the subscription process.',
        variant: 'default',
      });
      // Clean URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [toast, statusQuery]);

  const plans = plansQuery.data as SubscriptionPlan[] || [];
  const status = statusQuery.data as SubscriptionStatus || {};
  const isLoading = plansQuery.isLoading || statusQuery.isLoading;
  const hasPremium = status.status === 'active' || status.status === 'trialing';
  const isTrial = status.status === 'trialing';
  const trialEndDate = status.trialEnd ? new Date(status.trialEnd) : null;

  // Format trial end date
  const formatTrialEnd = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="container max-w-5xl py-8">
      <h1 className="text-3xl font-bold mb-2">Subscription</h1>
      <p className="text-muted-foreground mb-8">
        Unlock premium features and enhance your towing experience
      </p>

      {/* Current status */}
      {!isLoading && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Subscription</CardTitle>
            <CardDescription>
              Current subscription status and benefits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-medium">Status:</span>
                  <Badge variant={hasPremium ? 'default' : 'outline'}>
                    {hasPremium ? 'Premium' : 'Free'}
                  </Badge>
                </div>
                {isTrial && trialEndDate && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Trial ends on {formatTrialEnd(trialEndDate)}
                  </p>
                )}
              </div>
              {!hasPremium && (
                <Button
                  disabled={trialMutation.isPending}
                  onClick={() => trialMutation.mutate()}
                >
                  {trialMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Starting trial...
                    </>
                  ) : (
                    'Start Free Trial'
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}

      {/* Subscription plans */}
      {!isLoading && (
        <div className="grid gap-6 md:grid-cols-2">
          {plans.map((plan) => (
            <Card key={plan.id} className={plan.isFree ? 'border-gray-200' : 'border-primary'}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  {plan.name}
                  {plan.isFree ? (
                    <Badge variant="outline">Current</Badge>
                  ) : hasPremium ? (
                    <Badge>Active</Badge>
                  ) : null}
                </CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold mb-4">
                  ${(plan.price / 100).toFixed(2)}
                  <span className="text-sm font-normal text-muted-foreground">
                    /{plan.interval}
                  </span>
                </p>
                <ul className="space-y-2">
                  {plan.features.map((feature: string, i: number) => (
                    <li key={i} className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-5 h-5 mr-2 text-green-500"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                {plan.isFree ? (
                  <Button variant="outline" disabled className="w-full">
                    Free Plan
                  </Button>
                ) : hasPremium ? (
                  <Button variant="secondary" disabled className="w-full">
                    Current Plan
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    disabled={isRedirecting || subscribeMutation.isPending}
                    onClick={() => subscribeMutation.mutate(plan.id)}
                  >
                    {isRedirecting || subscribeMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>Subscribe</>
                    )}
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}