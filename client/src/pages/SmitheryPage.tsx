import { useEffect } from 'react';
import SmitheryServerList from '../components/SmitheryServerList';
import SmitheryServerDetails from '../components/SmitheryServerDetails';
import { useSmitheryServers } from '../hooks/useSmitheryServers';
import { useToast } from '../hooks/use-toast';

export default function SmitheryPage() {
  const { 
    servers,
    pagination,
    selectedServer,
    websocketUrl,
    isLoading,
    error,
    searchServers,
    getServerDetails,
    generateWebSocketUrl,
    clearSelectedServer
  } = useSmitheryServers();
  
  const { toast } = useToast();

  // Load initial data on mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await searchServers(undefined, undefined, undefined, true);
      } catch (error) {
        toast({
          title: "Failed to Load Servers",
          description: error instanceof Error ? error.message : "Could not load Smithery servers",
          variant: "destructive"
        });
      }
    };
    
    loadInitialData();
  }, [searchServers, toast]);

  const handleSearch = async (
    query: string,
    owner: string,
    repo: string,
    deployedOnly: boolean,
    page: number
  ) => {
    try {
      await searchServers(query || undefined, owner || undefined, repo || undefined, deployedOnly, page);
    } catch (error) {
      toast({
        title: "Search Failed",
        description: error instanceof Error ? error.message : "Failed to search Smithery servers",
        variant: "destructive"
      });
    }
  };

  const handleSelectServer = async (qualifiedName: string) => {
    try {
      await getServerDetails(qualifiedName);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get server details",
        variant: "destructive"
      });
    }
  };

  const handleGenerateWebSocketUrl = async (qualifiedName: string, config: any) => {
    try {
      await generateWebSocketUrl(qualifiedName, config);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate WebSocket URL",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Smithery Registry</h1>
        <p className="text-muted-foreground mt-2">
          Browse and connect to Model Context Protocol (MCP) servers from the Smithery Registry
        </p>
      </div>
      
      <SmitheryServerList
        servers={servers}
        pagination={pagination}
        isLoading={isLoading}
        error={error}
        onSearch={handleSearch}
        onSelectServer={handleSelectServer}
      />
      
      <SmitheryServerDetails
        server={selectedServer}
        websocketUrl={websocketUrl}
        isLoading={isLoading}
        error={error}
        open={!!selectedServer}
        onOpenChange={(open) => {
          if (!open) clearSelectedServer();
        }}
        onGenerateWebSocketUrl={handleGenerateWebSocketUrl}
        onBackToList={clearSelectedServer}
      />
    </div>
  );
}