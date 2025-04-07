import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation, useRoute } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { Service } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Loader2, CheckCircle, XCircle, CreditCard } from 'lucide-react';

export function CheckoutPage() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute<{ id: string }>('/checkout/:id');
  const { toast } = useToast();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [checkoutStatus, setCheckoutStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Get the service details
  const { data: service, isLoading: isLoadingService, error: serviceError } = useQuery({
    queryKey: ['/api/services', params?.id],
    queryFn: async () => {
      if (!params?.id) throw new Error('Service ID is required');
      const response = await fetch(`/api/services/${params.id}`);
      if (!response.ok) throw new Error('Failed to load service');
      return response.json() as Promise<Service>;
    },
    enabled: !!params?.id,
  });

  // Create checkout session mutation
  const { mutate: createCheckout, isPending: isCreatingCheckout } = useMutation({
    mutationFn: async () => {
      if (!params?.id) throw new Error('Service ID is required');
      
      // Use current URL for success and cancel paths
      const currentUrl = window.location.origin;
      const successUrl = `${currentUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${currentUrl}/checkout/cancel`;
      
      return apiRequest(
        'POST',
        '/api/checkout',
        {
          serviceId: parseInt(params.id),
          successUrl,
          cancelUrl
        }
      );
    },
    onSuccess: (data) => {
      // Redirect to Stripe checkout
      if (data.url) {
        setIsRedirecting(true);
        window.location.href = data.url;
      } else {
        setCheckoutStatus('error');
        setPaymentError('Invalid checkout response. Please try again.');
      }
    },
    onError: (error) => {
      console.error('Checkout error:', error);
      setCheckoutStatus('error');
      
      if (error instanceof Error) {
        if (error.message.includes('not configured')) {
          setPaymentError('Payment system is not yet configured. Please add Stripe API keys to enable payments.');
        } else {
          setPaymentError(error.message);
        }
      } else {
        setPaymentError('Failed to create checkout session');
      }
      
      toast({
        title: 'Checkout Error',
        description: 'There was a problem creating your checkout session',
        variant: 'destructive',
      });
    }
  });

  // Check if this is a success or cancel return from Stripe
  useEffect(() => {
    if (window.location.pathname === '/checkout/success') {
      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = urlParams.get('session_id');
      
      if (sessionId) {
        // Verify payment status with backend
        const checkPaymentStatus = async () => {
          try {
            const response = await fetch(`/api/payment-status/${sessionId}`);
            if (response.ok) {
              const data = await response.json();
              if (data.status === 'complete' || data.status === 'paid') {
                setCheckoutStatus('ready');
                toast({
                  title: 'Payment Successful',
                  description: 'Your payment has been processed successfully',
                  variant: 'default',
                });
              } else {
                setCheckoutStatus('error');
                setPaymentError(`Payment status: ${data.status}`);
              }
            } else {
              setCheckoutStatus('error');
              setPaymentError('Could not verify payment status');
            }
          } catch (error) {
            console.error('Error checking payment status:', error);
            setCheckoutStatus('error');
            setPaymentError('Failed to verify payment status');
          }
        };
        
        checkPaymentStatus();
      }
    } else if (window.location.pathname === '/checkout/cancel') {
      setCheckoutStatus('error');
      setPaymentError('Checkout was canceled');
      toast({
        title: 'Checkout Canceled',
        description: 'Your payment process was canceled',
        variant: 'destructive',
      });
    } else {
      setCheckoutStatus('ready');
    }
  }, [toast]);

  // Handle checkout button click
  const handleCheckout = () => {
    setCheckoutStatus('loading');
    createCheckout();
  };

  // If we're on a success or cancel page, show appropriate UI
  if (window.location.pathname === '/checkout/success') {
    return (
      <div className="container max-w-xl mx-auto my-12 px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center">
              {checkoutStatus === 'loading' ? (
                <Loader2 className="w-6 h-6 mr-2 animate-spin" />
              ) : checkoutStatus === 'ready' ? (
                <CheckCircle className="w-6 h-6 mr-2 text-green-500" />
              ) : (
                <XCircle className="w-6 h-6 mr-2 text-red-500" />
              )}
              Payment Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {checkoutStatus === 'loading' ? (
              <p>Verifying your payment status...</p>
            ) : checkoutStatus === 'ready' ? (
              <div>
                <p className="text-green-600 font-semibold">Your payment was successful!</p>
                <p className="mt-4">Thank you for your purchase. You will receive a confirmation shortly.</p>
              </div>
            ) : (
              <div>
                <p className="text-red-600 font-semibold">Payment verification failed</p>
                <p className="mt-2">{paymentError || 'There was an issue verifying your payment'}</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={() => setLocation('/')}>Return to Home</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (window.location.pathname === '/checkout/cancel') {
    return (
      <div className="container max-w-xl mx-auto my-12 px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center">
              <XCircle className="w-6 h-6 mr-2 text-red-500" />
              Checkout Canceled
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>Your checkout process was canceled. No payment has been processed.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => setLocation('/')}>Return to Home</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Show loading state while fetching service
  if (isLoadingService) {
    return (
      <div className="container max-w-xl mx-auto my-12 px-4 text-center">
        <Loader2 className="w-8 h-8 mx-auto animate-spin" />
        <p className="mt-4">Loading service details...</p>
      </div>
    );
  }

  // Show error if service couldn't be loaded
  if (serviceError || !service) {
    return (
      <div className="container max-w-xl mx-auto my-12 px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Unable to load service details. Please try again.</p>
            {serviceError instanceof Error && (
              <p className="text-sm text-gray-500 mt-2">{serviceError.message}</p>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={() => setLocation('/')}>Return to Home</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-xl mx-auto my-12 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Checkout</CardTitle>
          <CardDescription>Complete your purchase</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Order Summary</h3>
              <div className="mt-4 bg-gray-50 p-4 rounded-md">
                <div className="flex justify-between mb-2">
                  <span className="font-medium">{service.name}</span>
                  <span>${parseFloat(service.price).toFixed(2)}</span>
                </div>
                <p className="text-sm text-gray-600 mb-4">{service.description}</p>
                <Separator className="my-4" />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${parseFloat(service.price).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {paymentError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                <p className="font-bold">Payment Error</p>
                <p className="text-sm">{paymentError}</p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => setLocation('/')}>
            Cancel
          </Button>
          <Button
            onClick={handleCheckout}
            disabled={isCreatingCheckout || isRedirecting}
            className="ml-2"
          >
            {isCreatingCheckout || isRedirecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Proceed to Payment
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}