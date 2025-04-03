import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Phone, 
  Globe, 
  MapPin, 
  Clock, 
  ExternalLink, 
  Tag,
  Building2,
  Shield,
  Search
} from "lucide-react";
import { ScrapedBusiness } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface WebSearchResultsProps {
  businesses: ScrapedBusiness[];
  query: string;
  timeTaken: string;
  sources: string[];
}

export default function WebSearchResults({ 
  businesses, 
  query, 
  timeTaken,
  sources 
}: WebSearchResultsProps) {
  
  const getSourceIcon = (source: string, type: string) => {
    if (type === 'social') {
      return <Shield className="h-4 w-4 text-blue-500" />;
    } else if (type === 'directory') {
      return <Building2 className="h-4 w-4 text-green-500" />;
    } else {
      return <Search className="h-4 w-4 text-purple-500" />;
    }
  };
  
  const formatSourceName = (source: string) => {
    return source.replace(/Search$/, '');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Search Results</h2>
          <p className="text-sm text-muted-foreground">
            Found {businesses.length} businesses for "{query}" in {timeTaken}
          </p>
        </div>
        
        <div className="flex gap-1 flex-wrap justify-end">
          {sources.map((source, i) => (
            <Badge key={i} variant="outline" className="text-xs">
              {source}
            </Badge>
          ))}
        </div>
      </div>
      
      <Separator />
      
      {businesses.length > 0 ? (
        <div className="space-y-4">
          {businesses.map((business, index) => (
            <Card key={index} className="overflow-hidden transition-all hover:shadow-md">
              <CardHeader className="p-4 pb-2">
                <div className="flex justify-between">
                  <div>
                    <CardTitle className="text-xl font-semibold">{business.title}</CardTitle>
                    {business.rating && (
                      <div className="flex items-center mt-1">
                        <div className="flex items-center">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <svg 
                              key={i} 
                              className={`h-4 w-4 ${i < Math.floor(parseFloat(business.rating || '0')) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 fill-gray-300'}`} 
                              xmlns="http://www.w3.org/2000/svg" 
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                            </svg>
                          ))}
                        </div>
                        <span className="ml-1 text-sm font-medium">{business.rating}</span>
                      </div>
                    )}
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`
                      flex items-center gap-1 
                      ${business.sourceType === 'directory' ? 'bg-green-50 text-green-700 border-green-200' : 
                        business.sourceType === 'social' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                        'bg-purple-50 text-purple-700 border-purple-200'}
                    `}
                  >
                    {getSourceIcon(business.source, business.sourceType)}
                    {formatSourceName(business.source)}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="p-4 pt-2 pb-2">
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {business.description}
                </p>
                
                <div className="grid gap-1">
                  {business.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" />
                      <span className="text-sm line-clamp-2">{business.address}</span>
                    </div>
                  )}
                  
                  {business.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="text-sm">{business.phone}</span>
                    </div>
                  )}
                  
                  {business.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <a 
                        href={business.website.startsWith('http') ? business.website : `https://${business.website}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline line-clamp-1"
                      >
                        {business.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
              
              {(business.hours?.length || business.categories?.length) && (
                <Accordion type="single" collapsible className="w-full">
                  {business.hours?.length ? (
                    <AccordionItem value="hours" className="border-t">
                      <AccordionTrigger className="p-4 py-2 text-sm">
                        <Clock className="h-4 w-4 mr-2" />
                        Business Hours
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-3">
                        <div className="grid grid-cols-1 gap-1 text-sm">
                          {business.hours.map((hour, i) => (
                            <div key={i} className="flex justify-between">
                              <span className="text-muted-foreground">{hour}</span>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ) : null}
                  
                  {business.categories?.length ? (
                    <AccordionItem value="categories" className="border-t">
                      <AccordionTrigger className="p-4 py-2 text-sm">
                        <Tag className="h-4 w-4 mr-2" />
                        Categories
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-3">
                        <div className="flex flex-wrap gap-1">
                          {business.categories.map((category, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {category}
                            </Badge>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ) : null}
                </Accordion>
              )}
              
              <CardFooter className="p-4 pt-3 flex flex-wrap justify-end gap-2 border-t">
                {business.address && (
                  <Button 
                    variant="default" 
                    size="sm"
                    className="bg-primary hover:bg-primary-dark flex items-center gap-1"
                    asChild
                  >
                    <a 
                      href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(business.address)}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <MapPin className="h-4 w-4" />
                      Directions
                    </a>
                  </Button>
                )}
                
                {business.phone && (
                  <Button 
                    variant="secondary" 
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1"
                    asChild
                  >
                    <a href={`tel:${business.phone.replace(/[^\d+]/g, '')}`}>
                      <Phone className="h-4 w-4" />
                      Call Now
                    </a>
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-1"
                  asChild
                >
                  <a 
                    href={business.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View Source
                  </a>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No businesses found matching your search criteria</p>
        </div>
      )}
    </div>
  );
}