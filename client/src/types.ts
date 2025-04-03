import { Business, Favorite } from "@shared/schema";

export type ViewType = "map" | "list";
export type SortOption = "distance" | "relevance" | "category";

export interface Location {
  lat: number;
  lng: number;
}

export interface SearchState {
  input: string;
  location?: Location;
  radius: number;
  sortBy: SortOption;
  isSearching: boolean;
  error?: string;
}

export interface UserSettings {
  highContrastMode: boolean;
  largerTextMode: boolean;
  defaultRadius: number;
  defaultView: ViewType;
}

export interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRecenter: () => void;
}

export interface StatusBarProps {
  message: string;
  isVisible: boolean | undefined;
  actionText?: string;
  onAction?: () => void;
  enhancedInfo?: {
    originalQuery: string;
    enhancedQuery: string;
  };
}

export interface BusinessCardProps {
  business: Business;
  isFavorite: boolean;
  onToggleFavorite: (business: Business) => void;
  onDirections: (business: Business) => void;
}

export interface SearchBarProps {
  onSearch: (params: { location?: string, radius: number, businessType?: string, latitude?: number, longitude?: number }) => void;
  isSearching: boolean;
}

export interface TabBarProps {
  activeTab: ViewType;
  onTabChange: (tab: ViewType) => void;
}

export interface MapViewProps {
  businesses: Business[];
  isLoading: boolean;
  selectedBusiness?: Business;
  center?: Location;
  onSelectBusiness: (business: Business) => void;
  favorites: Favorite[];
  onToggleFavorite: (business: Business) => void;
  sortBy: SortOption;
  onSortChange: (sortBy: SortOption) => void;
}

export interface ListViewProps {
  businesses: Business[];
  isLoading: boolean;
  favorites: Favorite[];
  onToggleFavorite: (business: Business) => void;
  sortBy: SortOption;
  onSortChange: (sortBy: SortOption) => void;
}

export interface PlacesSearchResponse {
  results: Business[];
  status: string;
  originalQuery?: string;
  enhancedQuery?: string;
  isEnhanced?: boolean;
  citations?: Array<{
    url: string;
    text?: string;
    title?: string;
  }>;
}
