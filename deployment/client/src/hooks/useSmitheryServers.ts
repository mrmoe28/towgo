import { useState, useCallback } from 'react';
import { 
  listSmitheryServers, 
  getSmitheryServerDetails, 
  getSmitheryWebSocketUrl,
  SmitheryServer,
  ServerDetailsResponse,
  ServerListResponse
} from '../lib/smithery';

interface UseSmitheryServersReturn {
  servers: SmitheryServer[];
  pagination: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalCount: number;
  };
  selectedServer: ServerDetailsResponse | null;
  websocketUrl: string | null;
  isLoading: boolean;
  error: string | null;
  searchServers: (query?: string, owner?: string, repo?: string, deployedOnly?: boolean, page?: number) => Promise<void>;
  getServerDetails: (qualifiedName: string) => Promise<void>;
  generateWebSocketUrl: (qualifiedName: string, config?: any) => Promise<void>;
  clearSelectedServer: () => void;
}

export function useSmitheryServers(): UseSmitheryServersReturn {
  const [servers, setServers] = useState<SmitheryServer[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    totalCount: 0
  });
  const [selectedServer, setSelectedServer] = useState<ServerDetailsResponse | null>(null);
  const [websocketUrl, setWebsocketUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Search for Smithery servers
  const searchServers = useCallback(async (
    query?: string,
    owner?: string,
    repo?: string,
    deployedOnly: boolean = false,
    page: number = 1
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Searching Smithery servers: query=${query}, owner=${owner}, repo=${repo}, deployedOnly=${deployedOnly}, page=${page}`);
      const response = await listSmitheryServers(query, owner, repo, deployedOnly, page);
      
      if (response && response.servers) {
        setServers(response.servers);
        setPagination({
          currentPage: response.pagination.currentPage,
          totalPages: response.pagination.totalPages,
          pageSize: response.pagination.pageSize,
          totalCount: response.pagination.totalCount
        });
        console.log(`Found ${response.servers.length} Smithery servers (page ${response.pagination.currentPage} of ${response.pagination.totalPages})`);
      } else {
        console.error('Invalid response from Smithery API');
        setServers([]);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          pageSize: 10,
          totalCount: 0
        });
        setError('Failed to load Smithery servers');
      }
    } catch (error) {
      console.error('Error searching Smithery servers:', error);
      setError(error instanceof Error ? error.message : 'Failed to search Smithery servers');
      setServers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get details for a specific server
  const getServerDetails = useCallback(async (qualifiedName: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Getting details for Smithery server: ${qualifiedName}`);
      const details = await getSmitheryServerDetails(qualifiedName);
      
      if (details) {
        setSelectedServer(details);
        console.log('Smithery server details retrieved successfully');
      } else {
        console.error('Invalid server details response');
        setSelectedServer(null);
        setError('Failed to get server details');
      }
    } catch (error) {
      console.error('Error getting Smithery server details:', error);
      setError(error instanceof Error ? error.message : 'Failed to get server details');
      setSelectedServer(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Generate WebSocket URL for a server
  const generateWebSocketUrl = useCallback(async (qualifiedName: string, config: any = {}) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Generating WebSocket URL for Smithery server: ${qualifiedName}`);
      const result = await getSmitheryWebSocketUrl(qualifiedName, config);
      
      if (result && result.url) {
        setWebsocketUrl(result.url);
        console.log('WebSocket URL generated successfully');
      } else {
        console.error('Invalid WebSocket URL response');
        setWebsocketUrl(null);
        setError('Failed to generate WebSocket URL');
      }
    } catch (error) {
      console.error('Error generating Smithery WebSocket URL:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate WebSocket URL');
      setWebsocketUrl(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Clear selected server
  const clearSelectedServer = useCallback(() => {
    setSelectedServer(null);
    setWebsocketUrl(null);
  }, []);

  return {
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
  };
}