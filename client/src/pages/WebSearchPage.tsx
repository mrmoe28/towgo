import { useEffect } from 'react';
import { useWebSearch } from '../hooks/useWebSearch';
import WebSearchBar from '../components/WebSearchBar';
import WebSearchResults from '../components/WebSearchResults';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

export default function WebSearchPage() {
  const { searchResults, isSearching, error, search } = useWebSearch();
  const { toast } = useToast();

  // Handle search errors
  useEffect(() => {
    if (error) {
      toast({
        title: 'Search Error',
        description: error,
        variant: 'destructive'
      });
    }
  }, [error, toast]);

  const handleSearch = async (query: string, params?: { location?: string, radius?: number }) => {
    try {
      await search(query, params);
    } catch (error) {
      // Error already handled by the hook
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Web Business Search</h1>
        <p className="text-muted-foreground">
          Search for businesses across multiple websites and directories
        </p>
      </div>
      
      <WebSearchBar 
        onSearch={handleSearch}
        isSearching={isSearching}
      />
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}
      
      {isSearching && (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Searching multiple sources...</p>
          </div>
        </div>
      )}
      
      {!isSearching && searchResults && (
        <WebSearchResults 
          businesses={searchResults.businesses}
          query={searchResults.originalQuery}
          timeTaken={searchResults.timeTaken}
          sources={searchResults.sources}
        />
      )}
      
      {!isSearching && !searchResults && !error && (
        <div className="text-center py-12 border rounded-lg bg-muted/10">
          <p className="text-xl font-semibold mb-2">Start your search</p>
          <p className="text-muted-foreground">
            Enter a business type above to find businesses from around the web
          </p>
        </div>
      )}
    </div>
  );
}