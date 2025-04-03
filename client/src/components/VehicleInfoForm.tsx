import { useState, ChangeEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, ImageIcon, Phone, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VehicleInfo {
  make: string;
  model: string;
  year: string;
  type: string;
  size: string;
  additionalInfo: string;
  phoneNumber: string;
  pickupLocation: string;
  dropoffLocation: string;
  image?: File | null;
}

interface VehicleInfoFormProps {
  onSubmit: (vehicleInfo: VehicleInfo) => void;
  isSubmitting: boolean;
}

export default function VehicleInfoForm({ onSubmit, isSubmitting }: VehicleInfoFormProps) {
  const [vehicleInfo, setVehicleInfo] = useState<VehicleInfo>({
    make: '',
    model: '',
    year: '',
    type: '',
    size: '',
    additionalInfo: '',
    phoneNumber: '',
    pickupLocation: '',
    dropoffLocation: '',
    image: null
  });
  
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setVehicleInfo(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Check form completion status
    checkFormCompletion({
      ...vehicleInfo,
      [name]: value
    });
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive"
        });
        return;
      }
      
      // Check file type
      if (!file.type.match('image.*')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive"
        });
        return;
      }
      
      setVehicleInfo(prev => ({
        ...prev,
        image: file
      }));
      
      // Create image preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      checkFormCompletion({
        ...vehicleInfo,
        image: file
      });
    }
  };
  
  const checkFormCompletion = (info: VehicleInfo) => {
    // Check if required fields are filled
    const required = ['make', 'model', 'year', 'phoneNumber'];
    const isComplete = required.every(field => 
      info[field as keyof VehicleInfo] && 
      String(info[field as keyof VehicleInfo]).trim() !== ''
    );
    setIsComplete(isComplete);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isComplete) {
      toast({
        title: "Incomplete information",
        description: "Please fill in all required fields (make, model, year, phone number)",
        variant: "destructive"
      });
      return;
    }
    
    onSubmit(vehicleInfo);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Vehicle Details</CardTitle>
        <CardDescription>
          Provide information about your vehicle to help the tow truck company assist you better
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="make" className="font-medium">
                Vehicle Make <span className="text-red-500">*</span>
              </Label>
              <Input
                id="make"
                name="make"
                placeholder="e.g. Toyota, Ford, BMW"
                value={vehicleInfo.make}
                onChange={handleInputChange}
                disabled={isSubmitting}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="model" className="font-medium">
                Vehicle Model <span className="text-red-500">*</span>
              </Label>
              <Input
                id="model"
                name="model"
                placeholder="e.g. Camry, F-150, X5"
                value={vehicleInfo.model}
                onChange={handleInputChange}
                disabled={isSubmitting}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="year" className="font-medium">
                Year <span className="text-red-500">*</span>
              </Label>
              <Input
                id="year"
                name="year"
                placeholder="e.g. 2020"
                value={vehicleInfo.year}
                onChange={handleInputChange}
                disabled={isSubmitting}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type" className="font-medium">
                Vehicle Type
              </Label>
              <Input
                id="type"
                name="type"
                placeholder="e.g. Sedan, SUV, Truck"
                value={vehicleInfo.type}
                onChange={handleInputChange}
                disabled={isSubmitting}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="size" className="font-medium">
                Vehicle Size
              </Label>
              <Input
                id="size"
                name="size"
                placeholder="e.g. Compact, Mid-size, Full-size"
                value={vehicleInfo.size}
                onChange={handleInputChange}
                disabled={isSubmitting}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="font-medium">
                Your Phone Number <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  placeholder="e.g. (123) 456-7890"
                  value={vehicleInfo.phoneNumber}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  required
                  className="pl-10"
                />
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>
          
          {/* Location Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="pickupLocation" className="font-medium">
                Pickup Location
              </Label>
              <Input
                id="pickupLocation"
                name="pickupLocation"
                placeholder="Current vehicle location"
                value={vehicleInfo.pickupLocation}
                onChange={handleInputChange}
                disabled={isSubmitting}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dropoffLocation" className="font-medium">
                Drop-off Location
              </Label>
              <Input
                id="dropoffLocation"
                name="dropoffLocation"
                placeholder="Where to tow the vehicle"
                value={vehicleInfo.dropoffLocation}
                onChange={handleInputChange}
                disabled={isSubmitting}
              />
            </div>
          </div>
          
          <div className="space-y-2 mt-4">
            <Label htmlFor="additionalInfo" className="font-medium">
              Additional Information
            </Label>
            <Textarea
              id="additionalInfo"
              name="additionalInfo"
              placeholder="Describe your situation or any specific requirements..."
              value={vehicleInfo.additionalInfo}
              onChange={handleInputChange}
              disabled={isSubmitting}
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="vehicleImage" className="font-medium">
              Upload Vehicle Photo
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div>
                <div className="border-2 border-dashed rounded-md border-gray-300 dark:border-gray-600 p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors relative">
                  <input
                    type="file"
                    id="vehicleImage"
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleImageChange}
                    disabled={isSubmitting}
                  />
                  <div className="flex flex-col items-center justify-center py-2">
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm font-medium">
                      Drag and drop or click to upload
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      JPEG, PNG, or GIF up to 5MB
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-center h-full">
                {imagePreview ? (
                  <div className="relative w-full h-36 rounded-md overflow-hidden border">
                    <img
                      src={imagePreview}
                      alt="Vehicle preview"
                      className="object-cover w-full h-full"
                    />
                  </div>
                ) : (
                  <div className="border rounded-md w-full h-36 flex items-center justify-center bg-muted/30">
                    <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || !isComplete}
          >
            {isSubmitting ? (
              <>Submitting...</>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Submit Vehicle Information
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}