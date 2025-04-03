import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Loader2, Copy, ArrowLeft, ExternalLink, Check } from "lucide-react";
import { ServerDetailsResponse } from "../lib/smithery";
import { Separator } from '@/components/ui/separator';
import { useToast } from '../hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';

interface SmitheryServerDetailsProps {
  server: ServerDetailsResponse | null;
  websocketUrl: string | null;
  isLoading: boolean;
  error: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerateWebSocketUrl: (qualifiedName: string, config: any) => Promise<void>;
  onBackToList: () => void;
}

export default function SmitheryServerDetails({ 
  server, 
  websocketUrl,
  isLoading, 
  error,
  open, 
  onOpenChange,
  onGenerateWebSocketUrl,
  onBackToList
}: SmitheryServerDetailsProps) {
  const [selectedConnectionType, setSelectedConnectionType] = useState<string>('ws');
  const [configInput, setConfigInput] = useState<string>('{}');
  const [configError, setConfigError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleGenerateUrl = async () => {
    if (!server) return;
    
    setConfigError(null);
    
    try {
      // Parse the config JSON
      const config = JSON.parse(configInput);
      await onGenerateWebSocketUrl(server.qualifiedName, config);
    } catch (error) {
      if (error instanceof SyntaxError) {
        setConfigError('Invalid JSON configuration');
        toast({
          title: 'Invalid JSON',
          description: 'Please enter valid JSON configuration',
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to generate WebSocket URL',
          variant: 'destructive'
        });
      }
    }
  };

  const handleCopyUrl = () => {
    if (websocketUrl) {
      navigator.clipboard.writeText(websocketUrl);
      setCopied(true);
      toast({
        title: 'Copied',
        description: 'WebSocket URL copied to clipboard'
      });
      
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const findConnectionByType = (type: string) => {
    if (!server || !server.connections) return null;
    return server.connections.find(conn => conn.type === type);
  };

  const connection = selectedConnectionType ? findConnectionByType(selectedConnectionType) : null;
  
  const renderSchema = () => {
    if (!connection || !connection.configSchema) {
      return <p className="text-muted-foreground text-sm">No configuration schema available</p>;
    }

    return (
      <div className="space-y-2">
        <ScrollArea className="h-60 rounded border p-4 bg-muted/20">
          <pre className="text-xs">{JSON.stringify(connection.configSchema, null, 2)}</pre>
        </ScrollArea>
      </div>
    );
  };

  const renderConfigEditor = () => {
    return (
      <div className="space-y-2">
        <Textarea
          value={configInput}
          onChange={(e) => setConfigInput(e.target.value)}
          placeholder='Enter configuration JSON here... e.g., {"param1": "value1"}'
          className={`font-mono h-40 ${configError ? 'border-destructive' : ''}`}
        />
        {configError && <p className="text-destructive text-xs">{configError}</p>}
        <div className="flex justify-end">
          <Button 
            onClick={handleGenerateUrl}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Generate WebSocket URL
          </Button>
        </div>
      </div>
    );
  };

  const renderWebSocketUrl = () => {
    if (!websocketUrl) return null;
    
    return (
      <div className="mt-4 space-y-2">
        <h3 className="text-sm font-medium">WebSocket URL:</h3>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <ScrollArea className="h-24 rounded border p-2 bg-muted/20">
              <p className="text-xs break-all font-mono">{websocketUrl}</p>
            </ScrollArea>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleCopyUrl}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    );
  };

  if (!server) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <Button 
            variant="ghost" 
            size="sm" 
            className="absolute left-4 top-4"
            onClick={onBackToList}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <DialogTitle className="text-xl pt-4">{server.displayName}</DialogTitle>
          <DialogDescription className="flex items-center gap-1">
            {server.qualifiedName}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-2">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium">Server Connections</h3>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => window.open(`https://smithery.ai/server/${server.qualifiedName}`, '_blank', 'noopener,noreferrer')}
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              Open on Smithery
            </Button>
          </div>
          
          <Tabs 
            defaultValue={server.connections?.[0]?.type || "ws"} 
            onValueChange={setSelectedConnectionType}
          >
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="ws" disabled={!findConnectionByType('ws')}>
                WebSocket
              </TabsTrigger>
              <TabsTrigger value="stdio" disabled={!findConnectionByType('stdio')}>
                Standard IO
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="ws" className="mt-4">
              {findConnectionByType('ws') ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm">
                      This server is available via WebSocket at:
                    </p>
                    <Badge className="mt-1 text-xs" variant="outline">
                      {connection?.url || server.deploymentUrl}
                    </Badge>
                  </div>
                  
                  <Separator />
                  
                  <Accordion
                    type="single"
                    collapsible
                    defaultValue="config"
                  >
                    <AccordionItem value="schema">
                      <AccordionTrigger>Configuration Schema</AccordionTrigger>
                      <AccordionContent>
                        {renderSchema()}
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="config">
                      <AccordionTrigger>Configuration</AccordionTrigger>
                      <AccordionContent>
                        {renderConfigEditor()}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                  
                  {renderWebSocketUrl()}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm py-4">
                  This server does not support WebSocket connections.
                </p>
              )}
            </TabsContent>
            
            <TabsContent value="stdio" className="mt-4">
              {findConnectionByType('stdio') ? (
                <div className="space-y-4">
                  <p className="text-sm">
                    This server supports Standard IO connections. You can use it locally via the command line.
                  </p>
                  
                  <Accordion
                    type="single"
                    collapsible
                    defaultValue="schema"
                  >
                    <AccordionItem value="schema">
                      <AccordionTrigger>Configuration Schema</AccordionTrigger>
                      <AccordionContent>
                        {renderSchema()}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm py-4">
                  This server does not support Standard IO connections.
                </p>
              )}
            </TabsContent>
          </Tabs>
        </div>
        
        {error && (
          <div className="text-destructive text-sm mt-2">
            {error}
          </div>
        )}
        
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}