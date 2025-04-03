import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lightbulb, Search } from 'lucide-react';
import { PerplexityResult } from '@shared/schema';

interface PerplexitySearchBoxProps {
  onSearch: (query: string) => Promise<void>;
  isSearching: boolean;
}

export default function PerplexitySearchBox({ onSearch, isSearching }: PerplexitySearchBoxProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a search query');
      return;
    }
    
    try {
      setError(null);
      console.log('Performing Perplexity AI search with query:', searchQuery);
      await onSearch(searchQuery);
    } catch (err) {
      console.error('Error performing Perplexity search:', err);
      setError(err instanceof Error ? err.message : 'Search failed. Please try again.');
    }
  }, [searchQuery, onSearch]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isSearching) {
      handleSearch();
    }
  }, [handleSearch, isSearching]);

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 shadow-sm">
      <h3 className="text-lg font-medium mb-2 flex items-center">
        <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
        AI Enhanced Search
      </h3>
      <p className="text-sm text-gray-600 mb-3">
        Get detailed information about businesses and services with Perplexity AI
      </p>
      <div className="flex gap-2">
        <div className="relative flex-grow">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-gray-500" />
          </span>
          <Input
            type="text"
            placeholder="Ask about businesses or services..."
            className="pl-9 pr-4 w-full"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (error) setError(null);
            }}
            onKeyDown={handleKeyDown}
            aria-invalid={!!error}
          />
        </div>
        <Button
          variant="default"
          className="bg-yellow-500 hover:bg-yellow-600 text-white"
          onClick={handleSearch}
          disabled={isSearching}
        >
          {isSearching ? 'Searching...' : 'Ask AI'}
        </Button>
      </div>
      {error && (
        <p className="text-sm text-red-500 mt-2">{error}</p>
      )}
    </div>
  );
}