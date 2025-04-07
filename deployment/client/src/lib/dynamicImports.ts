// This file provides dynamic imports for heavy libraries
// to reduce initial bundle size and improve loading performance

/**
 * Dynamically imports Google Maps related modules
 * This helps reduce initial bundle size for users who don't access map features
 */
export const loadGoogleMapsModules = async () => {
  const [Loader, mapReact] = await Promise.all([
    import('@googlemaps/js-api-loader'),
    import('google-map-react')
  ]);
  
  return {
    Loader: Loader.Loader,
    GoogleMapReact: mapReact.default
  };
};

/**
 * Dynamically imports chart libraries
 * This helps reduce initial bundle size for users who don't view charts
 */
export const loadChartModules = async () => {
  const chartsModule = await import('recharts');
  
  return {
    LineChart: chartsModule.LineChart,
    Line: chartsModule.Line,
    XAxis: chartsModule.XAxis,
    YAxis: chartsModule.YAxis,
    CartesianGrid: chartsModule.CartesianGrid,
    Tooltip: chartsModule.Tooltip,
    Legend: chartsModule.Legend,
    ResponsiveContainer: chartsModule.ResponsiveContainer,
    AreaChart: chartsModule.AreaChart,
    Area: chartsModule.Area,
    PieChart: chartsModule.PieChart,
    Pie: chartsModule.Pie,
    Cell: chartsModule.Cell
  };
};

/**
 * Dynamically imports animation modules
 * This helps reduce initial bundle size for non-animation pages
 */
export const loadAnimationModules = async () => {
  const framerMotion = await import('framer-motion');
  
  return {
    motion: framerMotion.motion,
    AnimatePresence: framerMotion.AnimatePresence
  };
};

/**
 * Dynamically imports stripe modules
 * This helps reduce initial bundle size for users who don't access payment pages
 */
export const loadStripeModules = async () => {
  const [reactStripe, stripe] = await Promise.all([
    import('@stripe/react-stripe-js'),
    import('@stripe/stripe-js')
  ]);
  
  return {
    Elements: reactStripe.Elements,
    CardElement: reactStripe.CardElement,
    useStripe: reactStripe.useStripe,
    useElements: reactStripe.useElements,
    loadStripe: stripe.loadStripe
  };
};