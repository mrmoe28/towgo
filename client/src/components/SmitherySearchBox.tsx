import { useState, FormEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search } from "lucide-react";
import { useIsMobile } from '../hooks/use-mobile';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

interface SmitherySearchBoxProps {
  onSearch: (query: string) => Promise<void>;
  isSearching: boolean;
}

export default function SmitherySearchBox({ onSearch, isSearching }: SmitherySearchBoxProps) {
  const [query, setQuery] = useState<string>('');
  const isMobile = useIsMobile();
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      await onSearch(query.trim());
    }
  };

  return (
    <Card className="p-4 mb-4">
      <div className="space-y-2">
        <Label htmlFor="smithery-search" className="font-medium text-sm">
          Search Smithery Locations
        </Label>
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              id="smithery-search"
              type="text"
              placeholder="Search for blacksmiths, metal working..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pr-8"
              disabled={isSearching}
              data-testid="smithery-search-input"
            />
            {isSearching && (
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
          <Button 
            type="submit" 
            disabled={isSearching || !query.trim()} 
            className={isMobile ? "px-2 min-w-[40px]" : ""}
            data-testid="smithery-search-button"
          >
            {isMobile ? <Search className="h-4 w-4" /> : "Search Smithery"}
          </Button>
        </form>
        <p className="text-xs text-muted-foreground">
          Search for blacksmiths, metal workers, and other smithery services using the Smithery API.
        </p>
      </div>
    </Card>
  );
}