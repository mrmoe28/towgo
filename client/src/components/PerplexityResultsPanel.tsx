import React, { useEffect } from 'react';
import { PerplexityResult } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { ExternalLink, Lightbulb, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface PerplexityResultsPanelProps {
  perplexityData: PerplexityResult | null;
  isVisible: boolean;
  onClose: () => void;
}

function CitationItem({ citation }: { citation: { url: string; title?: string; text?: string } }) {
  return (
    <a 
      href={citation.url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="block p-3 hover:bg-neutral-100 rounded-md transition-colors text-sm border border-neutral-200 mb-2"
    >
      <div className="flex items-start">
        <ExternalLink className="h-4 w-4 mr-2 mt-1 flex-shrink-0 text-neutral-500" />
        <div>
          <p className="font-medium text-primary-700 hover:underline line-clamp-1">{citation.title || citation.url}</p>
          {citation.text && (
            <p className="text-neutral-600 text-xs mt-1 line-clamp-2">{citation.text}</p>
          )}
        </div>
      </div>
    </a>
  );
}

export default function PerplexityResultsPanel({ 
  perplexityData, 
  isVisible,
  onClose
}: PerplexityResultsPanelProps) {
  
  useEffect(() => {
    if (perplexityData && isVisible) {
      console.log("Perplexity panel should be visible now with data:", perplexityData);
    } else if (isVisible) {
      console.log("Perplexity panel is visible but no data is available");
    }
  }, [perplexityData, isVisible]);

  // Always render the Dialog if visible is true, even without data
  // This ensures the Dialog opens properly
  if (!perplexityData && !isVisible) {
    console.log("No perplexity data available and not visible");
    return null;
  }
  
  // If we're asked to be visible but have no data
  if (!perplexityData && isVisible) {
    return (
      <Dialog open={isVisible} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="flex items-center text-xl font-bold">
              <Lightbulb className="h-6 w-6 mr-2 text-yellow-500" /> 
              AI Enhanced Search Results
            </DialogTitle>
          </DialogHeader>
          <div className="py-8 text-center text-gray-500">
            No AI-enhanced search data is available at this time.
          </div>
          <DialogFooter className="border-t pt-4">
            <Button 
              variant="outline" 
              onClick={onClose}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // At this point we know perplexityData is not null
  const hasQuery = perplexityData?.originalQuery && perplexityData?.enhancedQuery;
  const hasCitations = perplexityData?.citations && Array.isArray(perplexityData?.citations) && perplexityData?.citations.length > 0;

  console.log("Rendering panel with data:", { 
    hasQuery,
    hasCitations, 
    isVisible,
    citations: perplexityData?.citations || []
  });

  // Use the Dialog component for a more prominent modal display
  return (
    <Dialog open={isVisible} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="flex items-center text-xl font-bold">
            <Lightbulb className="h-6 w-6 mr-2 text-yellow-500" /> 
            AI Enhanced Search Results
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {hasQuery && (
            <div className="mb-4">
              <div className="p-4 bg-yellow-50 rounded-md border border-yellow-200">
                <div className="mb-2">
                  <span className="font-semibold text-sm text-gray-700">Original Query:</span>
                  <p className="text-gray-800 font-medium">{perplexityData.originalQuery}</p>
                </div>
                <div>
                  <span className="font-semibold text-sm text-gray-700">Enhanced Query:</span>
                  <p className="text-primary font-medium">{perplexityData.enhancedQuery}</p>
                </div>
              </div>
            </div>
          )}
          
          {hasCitations ? (
            <div className="mt-4">
              <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center">
                <span className="inline-block mr-2 text-primary">Information Sources</span>
                <span className="text-xs text-gray-500 font-normal">(Click to visit)</span>
              </h3>
              <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-1">
                {perplexityData.citations && perplexityData.citations.map((citation, index) => (
                  <CitationItem key={index} citation={citation} />
                ))}
              </div>
            </div>
          ) : (
            <div className="py-4 text-center text-gray-500">
              No additional information sources available for this search.
            </div>
          )}
        </div>
        
        <DialogFooter className="border-t pt-4">
          <div className="flex justify-between items-center w-full">
            <span className="text-xs text-gray-500">Powered by Perplexity AI</span>
            <Button 
              variant="outline" 
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}