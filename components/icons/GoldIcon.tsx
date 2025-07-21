import React from 'react';

interface IconProps {
  className?: string;
}

export const GoldIcon = ({ className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M1 21h22L12 2 1 21zm3.23-2L12 6.11 19.77 19H4.23z"/>
  </svg>
);
