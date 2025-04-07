import { createRoot } from "react-dom/client";
import { lazy, Suspense } from "react";
import "./index.css";
import { Toaster } from "@/components/ui/toaster";

// Lazy load the main App component for faster initial rendering
// This dramatically reduces the initial bundle size
const App = lazy(() => import("./App"));

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
