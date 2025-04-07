declare module 'google-map-react' {
  import * as React from 'react';

  interface MapOptions {
    // Add specific map options here
    center?: { lat: number; lng: number };
    zoom?: number;
    disableDefaultUI?: boolean;
    gestureHandling?: string;
    clickableIcons?: boolean;
    styles?: any[];
    mapTypeControl?: boolean;
    zoomControl?: boolean;
    fullscreenControl?: boolean;
    streetViewControl?: boolean;
    [key: string]: any;
  }

  interface Props {
    bootstrapURLKeys?: { key: string; libraries?: string };
    defaultCenter?: { lat: number; lng: number };
    center?: { lat: number; lng: number };
    defaultZoom?: number;
    zoom?: number;
    options?: MapOptions;
    margin?: any[];
    debounced?: boolean;
    hoverDistance?: number;
    yesIWantToUseGoogleMapApiInternals?: boolean;
    onGoogleApiLoaded?: ({ map, maps }: { map: any; maps: any }) => void;
    onBoundsChange?: (
      center: { lat: number; lng: number },
      zoom: number,
      bounds: any,
      marginBounds: any
    ) => void;
    onChildClick?: (hoverKey: any, childProps: any) => void;
    onChildMouseEnter?: (hoverKey: any, childProps: any) => void;
    onChildMouseLeave?: (hoverKey: any, childProps: any) => void;
    onChange?: (
      center: { lat: number; lng: number },
      zoom: number,
      bounds: any,
      marginBounds: any
    ) => void;
    onClick?: (event: any) => void;
    onDrag?: (map: any) => void;
    onDragEnd?: (map: any) => void;
    onZoomAnimationStart?: (maps: any) => void;
    onZoomAnimationEnd?: (maps: any) => void;
    [key: string]: any;
  }

  export interface ChildComponentProps {
    lat: number;
    lng: number;
    [key: string]: any;
  }

  export default class GoogleMapReact extends React.Component<Props> {}
}