import { apiRequest } from './queryClient';

/**
 * Interface for Smithery Server
 */
export interface SmitheryServer {
  qualifiedName: string;
  displayName: string;
  description: string;
  homepage: string;
  useCount: string;
  isDeployed: boolean;
  createdAt: string;
}

/**
 * Interface for pagination
 */
export interface Pagination {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
}

/**
 * Interface for server list response
 */
export interface ServerListResponse {
  servers: SmitheryServer[];
  pagination: Pagination;
}

/**
 * Interface for server connection
 */
export interface ServerConnection {
  type: string;
  url?: string;
  configSchema: any; // JSONSchema
}

/**
 * Interface for server details
 */
export interface ServerDetailsResponse {
  qualifiedName: string;
  displayName: string;
  deploymentUrl: string;
  connections: ServerConnection[];
}

/**
 * Interface for WebSocket URL response
 */
export interface WebSocketUrlResponse {
  url: string;
}

/**
 * List available Smithery MCP servers
 * 
 * @param searchQuery Search query text
 * @param owner Filter by repository owner
 * @param repo Filter by repository name
 * @param deployedOnly Show only deployed servers
 * @param page Page number
 * @param pageSize Items per page
 * @returns List of servers with pagination
 */
export const listSmitheryServers = async (
  searchQuery?: string,
  owner?: string,
  repo?: string,
  deployedOnly: boolean = false,
  page: number = 1,
  pageSize: number = 10
): Promise<ServerListResponse> => {
  try {
    // Build query params
    const params = new URLSearchParams();
    
    if (searchQuery) {
      params.append('q', searchQuery);
    }
    
    if (owner) {
      params.append('owner', owner);
    }
    
    if (repo) {
      params.append('repo', repo);
    }
    
    if (deployedOnly) {
      params.append('deployed', 'true');
    }
    
    params.append('page', page.toString());
    params.append('pageSize', pageSize.toString());
    
    const response = await fetch(`/api/smithery/servers?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`Failed to list servers: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error listing Smithery servers:', error);
    throw error;
  }
};

/**
 * Get details of a specific Smithery server
 * 
 * @param qualifiedName Qualified name of the server
 * @returns Server details with connection info
 */
export const getSmitheryServerDetails = async (
  qualifiedName: string
): Promise<ServerDetailsResponse> => {
  try {
    const response = await fetch(`/api/smithery/servers/${encodeURIComponent(qualifiedName)}`);
    if (!response.ok) {
      throw new Error(`Failed to get server details: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting Smithery server details:', error);
    throw error;
  }
};

/**
 * Get WebSocket URL for connecting to a Smithery server
 * 
 * @param qualifiedName Qualified name of the server
 * @param config Configuration for the server (must match configSchema)
 * @returns WebSocket URL for connection
 */
export const getSmitheryWebSocketUrl = async (
  qualifiedName: string,
  config: any = {}
): Promise<WebSocketUrlResponse> => {
  try {
    const response = await fetch('/api/smithery/websocket-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        qualifiedName,
        config
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to generate WebSocket URL: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error generating Smithery WebSocket URL:', error);
    throw error;
  }
};