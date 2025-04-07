import { useState, FormEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, MapPin } from "lucide-react";
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useIsMobile } from '../hooks/use-mobile';
import { Slider } from "@/components/ui/slider";

interface WebSearchBarProps {
  onSearch: (query: string, params?: { location?: string, radius?: number }) => Promise<void>;
  isSearching: boolean;
}

export default function WebSearchBar({ onSearch, isSearching }: WebSearchBarProps) {
  const [radius, setRadius] = useState<number>(19);
  const isMobile = useIsMobile();
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    // Use a predefined query for tow trucks
    await onSearch("tow truck", { radius });
  };

  return (
    <Card className="p-6 mb-6 shadow-md border border-gray-100 relative overflow-hidden">
      {/* Animated purple background elements */}
      <div className="absolute -inset-[50%] bg-purple-300/5 blur-3xl rounded-full animate-float"></div>
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/5 rounded-full blur-xl -ml-12 -mb-12 animate-pulse-purple"></div>
      
      <form onSubmit={handleSubmit} className="relative z-10">
        <div className="space-y-5">
          <div>
            <Label htmlFor="radius" className="text-lg font-medium flex justify-between text-gray-800">
              <span>Search radius: <span className="text-purple-600">{radius} miles</span></span>
            </Label>
            <div className="px-1 py-3">
              <Slider
                id="radius"
                defaultValue={[19]}
                value={[radius]}
                min={1}
                max={30}
                step={1}
                disabled={isSearching}
                onValueChange={(values) => setRadius(values[0])}
                className="mt-2"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2 px-1">
                <span>1mi</span>
                <span>15mi</span>
                <span>30mi</span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Button 
              type="submit" 
              className="w-full py-6 text-base bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-md transition-all duration-200"
              disabled={isSearching} 
              data-testid="search-button"
            >
              {isSearching ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Finding Tow Trucks...
                </>
              ) : (
                <>
                  <Search className="h-5 w-5 mr-2" />
                  Find Tow Truck Services
                </>
              )}
            </Button>
          </div>
          
          <div className="text-xs text-purple-600 text-center">
            <MapPin className="h-3 w-3 inline-block mr-1" />
            Search will find tow truck companies within {radius} miles of your location
          </div>
        </div>
      </form>
    </Card>
  );
}