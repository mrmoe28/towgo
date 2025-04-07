import React from 'react';

export function TowGoLogo({ className = "" }: { className?: string }) {
  return (
    <svg 
      width="40" 
      height="40" 
      viewBox="0 0 40 40" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Circular background */}
      <circle cx="20" cy="20" r="20" fill="url(#paint0_linear)" />
      
      {/* TG letters */}
      <g>
        {/* T */}
        <path 
          d="M13 13H27V16H22V28H18V16H13V13Z" 
          fill="white"
        />
        
        {/* G */}
        <path 
          d="M22 21H25V28H15V18H25V21H19V25H22V21Z" 
          fill="white"
        />
      </g>
      
      {/* Linear gradient for the circle */}
      <defs>
        <linearGradient id="paint0_linear" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#9333EA" />
          <stop offset="1" stopColor="#4F46E5" />
        </linearGradient>
      </defs>
    </svg>
  );
}