import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Server, Globe, ExternalLink } from "lucide-react";
import { 
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { SmitheryServer } from '../lib/smithery';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '../hooks/use-toast';

interface SmitheryServerListProps {
  servers: SmitheryServer[];
  pagination: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalCount: number;
  };
  isLoading: boolean;
  error: string | null;
  onSearch: (query: string, owner: string, repo: string, deployedOnly: boolean, page: number) => Promise<void>;
  onSelectServer: (qualifiedName: string) => void;
}

export default function SmitheryServerList({
  servers,
  pagination,
  isLoading,
  error,
  onSearch,
  onSelectServer
}: SmitheryServerListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('');
  const [repoFilter, setRepoFilter] = useState('');
  const [deployedOnly, setDeployedOnly] = useState(true);
  const { toast } = useToast();

  const handleSearch = async () => {
    try {
      await onSearch(searchQuery, ownerFilter, repoFilter, deployedOnly, 1);
    } catch (error) {
      toast({
        title: "Search Failed",
        description: error instanceof Error ? error.message : "Failed to search Smithery servers",
        variant: "destructive"
      });
    }
  };

  const handlePageChange = async (page: number) => {
    try {
      await onSearch(searchQuery, ownerFilter, repoFilter, deployedOnly, page);
    } catch (error) {
      toast({
        title: "Page Load Failed",
        description: error instanceof Error ? error.message : "Failed to load page",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderPagination = () => {
    if (pagination.totalPages <= 1) return null;
    
    const pages = [];
    const currentPage = pagination.currentPage;
    const totalPages = pagination.totalPages;
    
    // Always show first page
    pages.push(
      <PaginationItem key="first">
        <PaginationLink 
          onClick={() => handlePageChange(1)}
          isActive={currentPage === 1}
        >
          1
        </PaginationLink>
      </PaginationItem>
    );
    
    // Show ellipsis if needed
    if (currentPage > 3) {
      pages.push(
        <PaginationItem key="ellipsis1">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }
    
    // Show pages around current page
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (i === 1 || i === totalPages) continue; // Skip first and last page as they're always shown
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink 
            onClick={() => handlePageChange(i)}
            isActive={currentPage === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    // Show ellipsis if needed
    if (currentPage < totalPages - 2) {
      pages.push(
        <PaginationItem key="ellipsis2">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }
    
    // Always show last page if more than one page
    if (totalPages > 1) {
      pages.push(
        <PaginationItem key="last">
          <PaginationLink 
            onClick={() => handlePageChange(totalPages)}
            isActive={currentPage === totalPages}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    return (
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => currentPage > 1 ? handlePageChange(currentPage - 1) : undefined}
              className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
          
          {pages}
          
          <PaginationItem>
            <PaginationNext 
              onClick={() => currentPage < totalPages ? handlePageChange(currentPage + 1) : undefined}
              className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  const renderServerCards = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="py-8 text-center">
          <p className="text-destructive mb-2">{error}</p>
          <Button variant="outline" onClick={handleSearch}>Retry</Button>
        </div>
      );
    }
    
    if (servers.length === 0) {
      return (
        <div className="py-8 text-center">
          <p className="text-muted-foreground mb-2">No Smithery servers found matching your criteria</p>
          <Button variant="outline" onClick={() => {
            setSearchQuery('');
            setOwnerFilter('');
            setRepoFilter('');
            onSearch('', '', '', deployedOnly, 1);
          }}>Clear Filters</Button>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {servers.map((server) => (
          <Card key={server.qualifiedName} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg font-semibold">{server.displayName}</CardTitle>
                  <CardDescription className="text-xs">{server.qualifiedName}</CardDescription>
                </div>
                {server.isDeployed && (
                  <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700">
                    Deployed
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <p className="text-sm line-clamp-2">{server.description}</p>
              
              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                <Server className="h-3 w-3" />
                <span>Use count: {server.useCount}</span>
                <span className="mx-1">•</span>
                <span>Created: {formatDate(server.createdAt)}</span>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => window.open(server.homepage, '_blank', 'noopener,noreferrer')}
              >
                <Globe className="h-4 w-4 mr-1" />
                View on Smithery
              </Button>
              
              <Button 
                variant="default" 
                size="sm"
                onClick={() => onSelectServer(server.qualifiedName)}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Details
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="space-y-4">
          <div>
            <Label htmlFor="search">Search Smithery Registry</Label>
            <div className="flex gap-2 mt-1.5">
              <div className="relative flex-1">
                <Input
                  id="search"
                  placeholder="Search for MCP servers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button 
                onClick={handleSearch}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                <span className="ml-2">Search</span>
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="owner" className="text-sm">Owner</Label>
              <Input
                id="owner"
                placeholder="e.g., smithery-ai"
                value={ownerFilter}
                onChange={(e) => setOwnerFilter(e.target.value)}
                className="mt-1"
                disabled={isLoading}
              />
            </div>
            
            <div>
              <Label htmlFor="repo" className="text-sm">Repository</Label>
              <Input
                id="repo"
                placeholder="e.g., fetch"
                value={repoFilter}
                onChange={(e) => setRepoFilter(e.target.value)}
                className="mt-1"
                disabled={isLoading}
              />
            </div>
            
            <div className="flex items-center pt-5">
              <Checkbox
                id="deployed-only"
                checked={deployedOnly}
                onCheckedChange={(checked) => setDeployedOnly(checked as boolean)}
                disabled={isLoading}
              />
              <Label htmlFor="deployed-only" className="ml-2">
                Show deployed servers only
              </Label>
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground">
            <p>
              Filter examples: owner:smithery-ai, repo:fetch, is:deployed, machine learning
            </p>
          </div>
        </div>
      </Card>
      
      {renderServerCards()}
      
      {renderPagination()}
      
      {pagination.totalCount > 0 && (
        <p className="text-xs text-center text-muted-foreground">
          Showing {servers.length} of {pagination.totalCount} servers
        </p>
      )}
    </div>
  );
}