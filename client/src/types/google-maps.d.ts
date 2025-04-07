// This file adds missing TypeScript declarations for Google Maps API

declare namespace google {
  namespace maps {
    namespace geometry {
      namespace spherical {
        function computeDistanceBetween(
          from: LatLng | LatLngLiteral,
          to: LatLng | LatLngLiteral
        ): number;
      }
    }
    class Map {
      constructor(mapDiv: Element | null, opts?: MapOptions);
      setCenter(latLng: LatLng | LatLngLiteral): void;
      getZoom(): number;
      setZoom(zoom: number): void;
    }
    
    class Marker {
      constructor(opts?: MarkerOptions);
      setMap(map: Map | null): void;
    }
    
    class InfoWindow {
      constructor(opts?: InfoWindowOptions);
      setContent(content: string | Node): void;
      open(opts?: InfoWindowOpenOptions): void;
      open(map?: Map, anchor?: MVCObject): void;
      close(): void;
    }
    
    interface InfoWindowOptions {
      content?: string | Node;
      position?: LatLng | LatLngLiteral;
      maxWidth?: number;
    }
    
    interface InfoWindowOpenOptions {
      map?: Map;
      anchor?: MVCObject;
    }
    
    interface LatLng {
      lat(): number;
      lng(): number;
    }
    
    interface LatLngLiteral {
      lat: number;
      lng: number;
    }
    
    interface MapOptions {
      center?: LatLng | LatLngLiteral;
      zoom?: number;
      mapTypeControl?: boolean;
      fullscreenControl?: boolean;
      streetViewControl?: boolean;
      zoomControl?: boolean;
      gestureHandling?: string;
      minZoom?: number;
      maxZoom?: number;
    }
    
    interface MarkerOptions {
      position: LatLng | LatLngLiteral;
      map?: Map;
      title?: string;
    }
    
    interface MVCObject {}
    
    interface MapsEventListener {
      remove(): void;
    }
    
    namespace event {
      function addListener(instance: any, eventName: string, handler: Function): MapsEventListener;
      function trigger(instance: any, eventName: string): void;
    }
    
    namespace places {
      class PlacesService {
        constructor(attrContainer: HTMLElement | Map);
        nearbySearch(request: PlaceSearchRequest, callback: (results: Array<PlaceResult>, status: any) => void): void;
        getDetails(request: PlaceDetailsRequest, callback: (result: PlaceResult, status: any) => void): void;
      }
      
      interface PlaceSearchRequest {
        location?: LatLng | LatLngLiteral;
        radius?: number;
        type?: string;
        keyword?: string;
      }
      
      interface PlaceDetailsRequest {
        placeId: string;
        fields?: string[];
      }
      
      interface PlaceResult {
        place_id: string;
        name: string;
        geometry?: {
          location: LatLng;
        };
        formatted_address?: string;
        vicinity?: string;
        types?: string[];
        rating?: number;
        user_ratings_total?: number;
        photos?: PhotoReference[];
        opening_hours?: {
          open_now?: boolean;
          weekday_text?: string[];
        };
        formatted_phone_number?: string;
        international_phone_number?: string;
        website?: string;
      }
      
      interface PhotoReference {
        getUrl(opts: PhotoOptions): string;
        height: number;
        width: number;
        html_attributions: string[];
      }
      
      interface PhotoOptions {
        maxWidth?: number;
        maxHeight?: number;
      }
    }
    
    class Geocoder {
      geocode(request: GeocoderRequest, callback: (results: any, status: any) => void): void;
    }
    
    interface GeocoderRequest {
      address?: string;
      location?: LatLng | LatLngLiteral;
    }
    
    const GeocoderStatus: {
      OK: string;
      ZERO_RESULTS: string;
      OVER_QUERY_LIMIT: string;
      REQUEST_DENIED: string;
      INVALID_REQUEST: string;
      UNKNOWN_ERROR: string;
    };
    
    class Size {
      constructor(width: number, height: number, widthUnit?: string, heightUnit?: string);
    }
    
    class LatLngBounds {
      constructor(sw?: LatLng | LatLngLiteral, ne?: LatLng | LatLngLiteral);
      extend(point: LatLng | LatLngLiteral): LatLngBounds;
      contains(latLng: LatLng | LatLngLiteral): boolean;
      getCenter(): LatLng;
    }
  }
}