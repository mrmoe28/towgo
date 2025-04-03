import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  CarFront,
  MapPin,
  Bell,
  RotateCw,
  Check,
  X,
  ArrowLeft,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface OnboardingStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  component: React.ReactNode;
  required?: boolean;
}

interface OnboardingProps {
  onComplete: (data: any) => void;
  onSkip?: () => void;
}

export function Onboarding({ onComplete, onSkip }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    defaultLocation: '',
    notifications: true,
    autoCheckLocation: true
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };
  
  const steps: OnboardingStep[] = [
    {
      title: "Welcome to TowGo",
      description: "Let's set up your profile to help you find tow trucks quickly in emergencies. This only takes a minute!",
      icon: <Sparkles className="h-5 w-5" />,
      component: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Your Name</Label>
            <Input 
              id="name" 
              name="name" 
              placeholder="Enter your name" 
              value={formData.name}
              onChange={handleInputChange}
            />
          </div>
        </div>
      )
    },
    {
      title: "Vehicle Information",
      description: "Add your vehicle details to speed up emergency service requests",
      icon: <CarFront className="h-5 w-5" />,
      component: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vehicleMake">Vehicle Make</Label>
            <Select 
              onValueChange={(value) => handleSelectChange('vehicleMake', value)}
              value={formData.vehicleMake}
            >
              <SelectTrigger id="vehicleMake">
                <SelectValue placeholder="Select make" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="toyota">Toyota</SelectItem>
                <SelectItem value="honda">Honda</SelectItem>
                <SelectItem value="ford">Ford</SelectItem>
                <SelectItem value="chevrolet">Chevrolet</SelectItem>
                <SelectItem value="bmw">BMW</SelectItem>
                <SelectItem value="mercedes">Mercedes</SelectItem>
                <SelectItem value="audi">Audi</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="vehicleModel">Vehicle Model</Label>
            <Input 
              id="vehicleModel" 
              name="vehicleModel" 
              placeholder="Enter model" 
              value={formData.vehicleModel}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="vehicleYear">Year</Label>
            <Select 
              onValueChange={(value) => handleSelectChange('vehicleYear', value)}
              value={formData.vehicleYear}
            >
              <SelectTrigger id="vehicleYear">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 30 }, (_, i) => {
                  const year = new Date().getFullYear() - i;
                  return (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>
      )
    },
    {
      title: "Location Settings",
      description: "Configure your location preferences for accurate tow truck search results",
      icon: <MapPin className="h-5 w-5" />,
      component: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="defaultLocation">Default Location (Optional)</Label>
            <Input 
              id="defaultLocation" 
              name="defaultLocation" 
              placeholder="E.g. Atlanta, GA" 
              value={formData.defaultLocation}
              onChange={handleInputChange}
            />
            <p className="text-xs text-gray-500">
              Set a default location or we'll use your current location when searching
            </p>
          </div>
          
          <div className="flex items-center justify-between space-y-2">
            <div className="space-y-0.5">
              <Label htmlFor="autoCheckLocation">Auto-detect Location</Label>
              <p className="text-xs text-gray-500">
                Automatically detect your location when the app starts
              </p>
            </div>
            <Switch 
              id="autoCheckLocation" 
              checked={formData.autoCheckLocation}
              onCheckedChange={(checked) => handleSwitchChange('autoCheckLocation', checked)}
            />
          </div>
        </div>
      )
    },
    {
      title: "Notification Preferences",
      description: "Configure when and how you receive emergency notifications",
      icon: <Bell className="h-5 w-5" />,
      component: (
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div className="space-y-0.5">
              <Label htmlFor="notifications">Emergency Notifications</Label>
              <p className="text-xs text-gray-500">
                Receive alerts about tow truck availability during emergencies
              </p>
            </div>
            <Switch 
              id="notifications" 
              checked={formData.notifications}
              onCheckedChange={(checked) => handleSwitchChange('notifications', checked)}
            />
          </div>
        </div>
      )
    }
  ];
  
  const totalSteps = steps.length;
  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / totalSteps) * 100;
  
  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete(formData);
    }
  };
  
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };
  
  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    } else {
      onComplete(formData);
    }
  };
  
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;
  const isStepRequired = currentStepData.required || false;
  const isStepComplete = currentStepData.required
    ? Object.entries(formData)
        .filter(([key]) => key in currentStepData)
        .every(([_, value]) => Boolean(value))
    : true;
  
  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="animate-slide-up shadow-xl">
        <CardHeader className="pb-3">
          <div className="mb-2 mt-1 flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-purple-700">
              {currentStepData.icon}
            </div>
            <CardTitle>{currentStepData.title}</CardTitle>
          </div>
          <Progress value={progress} className="h-1" />
          <p className="mt-2 text-sm text-gray-600">
            {currentStepData.description}
          </p>
        </CardHeader>
        
        <CardContent>
          {currentStepData.component}
        </CardContent>
        
        <CardFooter className="flex justify-between border-t bg-gray-50 px-6 py-4">
          <div>
            {!isFirstStep && (
              <Button variant="ghost" onClick={handleBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            )}
          </div>
          
          <div className="flex space-x-2">
            {!isStepRequired && (
              <Button variant="outline" onClick={handleSkip}>
                {isLastStep ? 'Skip & Finish' : 'Skip'}
              </Button>
            )}
            
            <Button 
              onClick={handleNext} 
              disabled={isStepRequired && !isStepComplete}
              className="btn-gradient"
            >
              {isLastStep ? (
                <>
                  Finish
                  <Check className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

export function OnboardingProgress({ 
  completed, 
  total, 
  onViewChecklist 
}: { 
  completed: number; 
  total: number;
  onViewChecklist: () => void;
}) {
  const progress = Math.min(100, Math.round((completed / total) * 100));
  
  return (
    <Card className="animate-slide-up bg-gradient-to-r from-purple-50 to-indigo-50 shadow-md">
      <CardContent className="px-6 py-5">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-medium text-gray-800">
            Getting Started: {completed}/{total} steps complete
          </h3>
          <Button variant="ghost" size="sm" onClick={onViewChecklist}>
            View All
          </Button>
        </div>
        
        <div className="mt-3 space-y-1">
          <Progress value={progress} className="h-2" />
          <p className="text-right text-xs text-gray-500">
            {progress}% complete
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function OnboardingChecklist({
  steps,
  onComplete
}: {
  steps: { 
    title: string; 
    description: string; 
    completed: boolean;
    action?: () => void;
  }[];
  onComplete: () => void;
}) {
  const completedCount = steps.filter(step => step.completed).length;
  const totalSteps = steps.length;
  const progress = Math.min(100, Math.round((completedCount / totalSteps) * 100));
  const allCompleted = completedCount === totalSteps;
  
  return (
    <Card className="animate-slide-up shadow-md">
      <CardHeader className="pb-3">
        <CardTitle>Getting Started Checklist</CardTitle>
        <div className="mt-3 space-y-1">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-gray-700">
              {completedCount} of {totalSteps} tasks completed
            </span>
            <span className="text-purple-600">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>
      
      <CardContent className="pb-3">
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div 
              key={index}
              className={`flex items-start justify-between rounded-lg ${
                step.completed ? 'bg-green-50' : 'bg-gray-50'
              } p-3 transition-colors`}
            >
              <div className="flex items-start space-x-3">
                <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                  step.completed 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step.completed ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <span className="text-xs">{index + 1}</span>
                  )}
                </div>
                <div>
                  <h4 className={`font-medium ${
                    step.completed ? 'text-green-800' : 'text-gray-700'
                  }`}>
                    {step.title}
                  </h4>
                  <p className="text-xs text-gray-600">
                    {step.description}
                  </p>
                </div>
              </div>
              
              {!step.completed && step.action && (
                <Button 
                  size="sm" 
                  variant="outline"
                  className="shrink-0 text-xs"
                  onClick={step.action}
                >
                  Complete
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="border-t bg-gray-50 px-6 py-3">
        {allCompleted ? (
          <Button className="btn-gradient w-full" onClick={onComplete}>
            <Check className="mr-2 h-4 w-4" />
            All Set! Continue to App
          </Button>
        ) : (
          <Button className="w-full" variant="outline" onClick={onComplete}>
            Continue to App Anyway
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export const defaultOnboardingSteps = [
  {
    title: "Add your vehicle information",
    description: "Help us identify your vehicle type for specific tow truck needs",
    completed: false,
    action: () => {}
  },
  {
    title: "Enable location services",
    description: "For accurate tow truck search results near you",
    completed: false,
    action: () => {}
  },
  {
    title: "Complete your profile",
    description: "Add contact details for emergency services to reach you",
    completed: false,
    action: () => {}
  },
  {
    title: "Set notification preferences",
    description: "Stay informed about your tow truck arrival",
    completed: false,
    action: () => {}
  }
];