import React from "react";

export function LoadingSpinner({ fullScreen = true }: { fullScreen?: boolean }) {
  return (
    <div className={`${fullScreen ? 'min-h-[80vh]' : 'min-h-[200px]'} flex items-center justify-center`}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
        <p className="text-gray-500">Loading...</p>
      </div>
    </div>
  );
}