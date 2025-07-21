import React from 'react';

interface IconProps {
  className?: string;
}

export const OilIcon = ({ className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M22 7.5a1.5 1.5 0 00-1.5-1.5h-2.5V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2H7.5A1.5 1.5 0 006 7.5v1a1.5 1.5 0 001.5 1.5h.5V20a2 2 0 002 2h4a2 2 0 002-2V10h.5a1.5 1.5 0 001.5-1.5v-1zM16 4h-2v2h2V4z"/>
  </svg>
);
