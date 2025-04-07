import axios from 'axios';
import { log } from '../vite';

// Smithery Registry API base URL
const SMITHERY_BASE_URL = 'https://registry.smithery.ai';

// Smithery API key from environment variables
const SMITHERY_API_KEY = process.env.SMITHERY_API_KEY;

// Check if Smithery API key is configured
const isSmitheryConfigured = (): boolean => {
  const configured = !!SMITHERY_API_KEY;
  if (configured) {
    log('Smithery API key is configured - Smithery features are available', 'smithery');
  } else {
    log('No Smithery API key found - Smithery features are disabled', 'smithery');
  }
  return configured;
};

// Configure axios instance with base URL and authentication
const smitheryApi = axios.create({
  baseURL: SMITHERY_BASE_URL,
  headers: {
    'Authorization': `Bearer ${SMITHERY_API_KEY}`,
    'Content-Type': 'application/json'
  }
});

/**
 * Interface for Smithery server
 */
interface SmitheryServer {
  qualifiedName: string;
  displayName: string;
  description: string;
  homepage: string;
  useCount: string;
  isDeployed: boolean;
  createdAt: string;
}

/**
 * Interface for server connection
 */
interface ServerConnection {
  type: string;
  url?: string;
  configSchema: any; // JSONSchema
}

/**
 * Interface for pagination
 */
interface Pagination {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
}

/**
 * Interface for server list response
 */
interface ServerListResponse {
  servers: SmitheryServer[];
  pagination: Pagination;
}

/**
 * Interface for server details response
 */
interface ServerDetailsResponse {
  qualifiedName: string;
  displayName: string;
  deploymentUrl: string;
  connections: ServerConnection[];
}

/**
 * List available MCP servers with optional filtering
 * 
 * @param searchQuery Search query for semantic search
 * @param owner Filter by repository owner
 * @param repo Filter by repository name
 * @param deployedOnly Show only deployed servers
 * @param page Page number for pagination
 * @param pageSize Number of items per page
 * @returns List of available servers
 */
export async function listSmitheryServers(
  searchQuery?: string,
  owner?: string, 
  repo?: string,
  deployedOnly: boolean = false,
  page: number = 1,
  pageSize: number = 10
): Promise<ServerListResponse> {
  if (!isSmitheryConfigured()) {
    throw new Error('Smithery API key not configured');
  }

  try {
    // Build the query string with filters
    let query = '';
    
    if (searchQuery) {
      query += searchQuery + ' ';
    }
    
    if (owner) {
      query += `owner:${owner} `;
    }
    
    if (repo) {
      query += `repo:${repo} `;
    }
    
    if (deployedOnly) {
      query += 'is:deployed ';
    }
    
    query = query.trim();
    
    log(`Listing Smithery servers with query: "${query}"`, 'smithery');
    
    const response = await smitheryApi.get('/servers', {
      params: {
        q: query || undefined,
        page,
        pageSize
      }
    });

    const serverList: ServerListResponse = response.data;
    log(`Smithery API returned ${serverList.servers.length} servers (page ${serverList.pagination.currentPage} of ${serverList.pagination.totalPages})`, 'smithery');
    
    return serverList;
  } catch (error) {
    console.error('Smithery API error:', error);
    if (axios.isAxiosError(error)) {
      log(`Smithery API error (${error.response?.status || 'unknown'}): ${error.message}`, 'smithery');
      throw new Error(`Smithery API error: ${error.response?.data?.message || error.message}`);
    }
    throw error;
  }
}

/**
 * Get details for a specific server by its qualified name
 * 
 * @param qualifiedName Qualified name of the server
 * @returns Detailed server information including connection options
 */
export async function getSmitheryServerDetails(qualifiedName: string): Promise<ServerDetailsResponse> {
  if (!isSmitheryConfigured()) {
    throw new Error('Smithery API key not configured');
  }

  try {
    log(`Getting Smithery server details for: ${qualifiedName}`, 'smithery');
    
    const response = await smitheryApi.get(`/servers/${qualifiedName}`);
    
    return response.data;
  } catch (error) {
    console.error('Smithery API error:', error);
    if (axios.isAxiosError(error)) {
      log(`Smithery API error (${error.response?.status || 'unknown'}): ${error.message}`, 'smithery');
      throw new Error(`Smithery API error: ${error.response?.data?.message || error.message}`);
    }
    throw error;
  }
}

/**
 * Generate a WebSocket URL for connecting to a Smithery MCP server
 * 
 * @param qualifiedName Qualified name of the server
 * @param config Configuration that complies with the server's schema
 * @returns Full WebSocket URL for connection
 */
export function createSmitheryWebSocketUrl(qualifiedName: string, config: any): string {
  // Base64 encode the config
  const encodedConfig = Buffer.from(JSON.stringify(config)).toString('base64');
  
  // Format: https://server.smithery.ai/${qualifiedName}/ws?config=${base64encode(config)}
  return `https://server.smithery.ai/${qualifiedName}/ws?config=${encodedConfig}`;
}

// Initialize and check API key on module load
isSmitheryConfigured();