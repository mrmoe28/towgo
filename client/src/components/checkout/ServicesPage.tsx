import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Service } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Check, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function ServicesPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);

  // Fetch available services
  const { data: services, isLoading, error } = useQuery({
    queryKey: ['/api/services'],
    queryFn: async () => {
      const response = await fetch('/api/services');
      if (!response.ok) throw new Error('Failed to load services');
      return response.json() as Promise<Service[]>;
    },
  });

  // Handle checkout button click
  const handleSelectService = (serviceId: number) => {
    setSelectedServiceId(serviceId);
  };

  const handleCheckout = () => {
    if (!selectedServiceId) {
      toast({
        title: 'Please select a service',
        description: 'You need to select a service before proceeding to checkout',
        variant: 'destructive',
      });
      return;
    }
    
    setLocation(`/checkout/${selectedServiceId}`);
  };

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto my-12 px-4 text-center">
        <Loader2 className="w-8 h-8 mx-auto animate-spin" />
        <p className="mt-4">Loading available services...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-4xl mx-auto my-12 px-4">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load services. Please try again later.
            {error instanceof Error && (
              <span className="block mt-2">{error.message}</span>
            )}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!services || services.length === 0) {
    return (
      <div className="container max-w-4xl mx-auto my-12 px-4">
        <Alert>
          <AlertTitle>No Services Available</AlertTitle>
          <AlertDescription>
            There are currently no services available for purchase. Please check back later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto my-12 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Our Towing Services</h1>
        <p className="text-gray-600 mt-2">
          Choose from our selection of professional towing services
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <Card 
            key={service.id}
            className={`${
              selectedServiceId === service.id 
                ? 'ring-2 ring-primary ring-offset-2' 
                : ''
            } transition-all hover:shadow-md`}
          >
            <CardHeader>
              <CardTitle className="flex justify-between items-start">
                <span>{service.name}</span>
                <span className="text-xl font-bold">${parseFloat(service.price).toFixed(2)}</span>
              </CardTitle>
              <CardDescription>{service.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  <span>24/7 Service</span>
                </div>
                <div className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  <span>Fast Response Time</span>
                </div>
                <div className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  <span>Professional Equipment</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => handleSelectService(service.id)}
                variant={selectedServiceId === service.id ? "default" : "outline"}
                className="w-full"
              >
                {selectedServiceId === service.id ? "Selected" : "Select"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <Button
          size="lg"
          onClick={handleCheckout}
          disabled={!selectedServiceId}
        >
          Proceed to Checkout
        </Button>
      </div>
    </div>
  );
}