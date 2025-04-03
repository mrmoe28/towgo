import { ListViewProps, SortOption } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import BusinessCard from './BusinessCard';
import { Skeleton } from '@/components/ui/skeleton';
import { getDirectionsUrl } from '@/lib/maps';

export default function ListView({
  businesses,
  isLoading,
  favorites,
  onToggleFavorite,
  sortBy,
  onSortChange
}: ListViewProps) {
  const handleSortChange = (value: string) => {
    onSortChange(value as SortOption);
  };

  const handleDirections = (business: any) => {
    const url = getDirectionsUrl(business.location);
    window.open(url, '_blank');
  };

  return (
    <div className="block">
      <div className="flex justify-between items-center mb-4 bg-white rounded-lg shadow-sm p-4">
        <h2 className="text-xl font-semibold text-primary">
          {businesses.length > 0 ? `${businesses.length} businesses found` : 'Search Results'}
        </h2>
        <div className="flex items-center">
          <label htmlFor="list-sort-select" className="mr-2 text-sm font-medium">Sort by:</label>
          <Select
            value={sortBy}
            onValueChange={handleSortChange}
          >
            <SelectTrigger className="w-[160px] border-primary-light">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="distance">Distance</SelectItem>
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="category">Category</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="list-container pr-1 h-[calc(100vh-200px)] md:h-[calc(100vh-200px)] overflow-y-auto">
        {isLoading ? (
          // Loading skeletons - simpler list format
          Array(5).fill(0).map((_, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-md mb-2 overflow-hidden">
              <div className="p-3">
                <div className="flex justify-between items-start mb-2">
                  <Skeleton className="h-6 w-48" />
                  <div className="flex items-center">
                    <Skeleton className="h-4 w-12 mr-2" />
                    <Skeleton className="h-4 w-4 rounded-full" />
                  </div>
                </div>
                
                <Skeleton className="h-4 w-32 mb-2" />
                
                <div className="flex items-center mb-1">
                  <Skeleton className="h-4 w-4 mr-1 rounded-md" />
                  <Skeleton className="h-4 w-64" />
                </div>
                
                <div className="flex items-center mb-1">
                  <Skeleton className="h-4 w-4 mr-1 rounded-md" />
                  <Skeleton className="h-4 w-40" />
                </div>
                
                <div className="flex items-center mb-1">
                  <Skeleton className="h-4 w-4 mr-1 rounded-md" />
                  <Skeleton className="h-4 w-24" />
                </div>
                
                <div className="sm:flex sm:justify-end mt-2">
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
            </div>
          ))
        ) : businesses.length > 0 ? (
          businesses.map((business) => (
            <BusinessCard
              key={business.placeId}
              business={business}
              isFavorite={favorites.some(fav => fav.placeId === business.placeId)}
              onToggleFavorite={onToggleFavorite}
              onDirections={handleDirections}
            />
          ))
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 mb-3 text-center">
            <div className="mb-6 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto text-primary opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold mb-3 text-primary">No Results Found</h3>
            <div className="max-w-md mx-auto">
              <p className="text-neutral-dark mb-4">
                We couldn't find any businesses matching your search criteria.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg text-left">
                <h4 className="font-medium mb-2 text-primary">Try these suggestions:</h4>
                <ul className="text-sm space-y-2 text-neutral-dark">
                  <li className="flex items-start">
                    <span className="inline-block bg-primary text-white rounded-full h-5 w-5 text-xs flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">1</span>
                    <span>Check the spelling of your search terms</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block bg-primary text-white rounded-full h-5 w-5 text-xs flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">2</span>
                    <span>Use more general search terms</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block bg-primary text-white rounded-full h-5 w-5 text-xs flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">3</span>
                    <span>Increase your search radius in Settings</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block bg-primary text-white rounded-full h-5 w-5 text-xs flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">4</span>
                    <span>Try a different location</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
