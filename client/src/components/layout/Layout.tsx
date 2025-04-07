import React, { ReactNode } from "react";
import { useLocation } from "wouter";
import { Header } from "./Header";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  
  const isLandingPage = location === '/' || location === '/landing';
  const isAuthPage = location === '/login' || location === '/signup';
  
  const showHeaderFooter = !isLandingPage && !isAuthPage;
  
  return (
    <>
      {showHeaderFooter && <Header />}
      
      <main>
        {children}
      </main>
      
      {showHeaderFooter && (
        <footer className="border-t py-4 text-center text-gray-500 text-sm">
          <div className="container mx-auto">
            &copy; {new Date().getFullYear()} TowGo
          </div>
        </footer>
      )}
    </>
  );
}