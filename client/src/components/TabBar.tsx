import { TabBarProps, ViewType } from '@/types';
import { Map, List } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function TabBar({ activeTab, onTabChange }: TabBarProps) {
  return (
    <div className="bg-white border-b border-neutral">
      <div className="container mx-auto px-4">
        <div className="flex">
          <button 
            className={cn(
              "py-3 px-6 font-medium border-b-2 flex items-center",
              activeTab === 'map' 
                ? "border-primary text-primary" 
                : "border-transparent text-neutral-darkest hover:text-primary"
            )}
            onClick={() => onTabChange('map')}
            aria-pressed={activeTab === 'map'}
          >
            <Map className="h-5 w-5 mr-2" />
            Map View
          </button>
          <button 
            className={cn(
              "py-3 px-6 font-medium border-b-2 flex items-center",
              activeTab === 'list' 
                ? "border-primary text-primary" 
                : "border-transparent text-neutral-darkest hover:text-primary"
            )}
            onClick={() => onTabChange('list')}
            aria-pressed={activeTab === 'list'}
          >
            <List className="h-5 w-5 mr-2" />
            List View
          </button>
        </div>
      </div>
    </div>
  );
}
