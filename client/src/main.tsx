import { createRoot } from "react-dom/client";
import { lazy, Suspense, useEffect } from "react";
import "./index.css";
import { Toaster } from "@/components/ui/toaster";

// Lazy load the main App component for faster initial rendering
// This dramatically reduces the initial bundle size
const App = lazy(() => import("./App"));

// Register service worker for PWA functionality
const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
        });
    });
  }
};

// Initialize PWA service worker
registerServiceWorker();

// Function to mark the root element as loaded (for CSS transition)
const markAsLoaded = () => {
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.classList.add("loaded");
  }
};

// Create and render the app
const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(
    <>
      <Suspense fallback={
        <div className="flex h-screen w-full items-center justify-center bg-background">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading Business Finder...</p>
          </div>
        </div>
      }>
        <App />
      </Suspense>
      <Toaster />
    </>
  );
  
  // Mark the root as loaded once the page is fully rendered
  window.addEventListener("load", markAsLoaded);
}
