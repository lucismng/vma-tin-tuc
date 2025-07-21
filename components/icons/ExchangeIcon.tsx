import React from 'react';

interface IconProps {
  className?: string;
}

export const ExchangeIcon = ({ className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M7 11v2h10v-2H7zm5-6L8.5 8.5h7L12 5zm0 14l3.5-3.5h-7L12 19z"/>
  </svg>
);
