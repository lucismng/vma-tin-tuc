import React, { useState, useEffect } from 'react';

export const Clock = ({ onClick, className }: { onClick: () => void; className?: string }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);

  const formatTime = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  return (
    <div 
        className={`flex-shrink-0 flex items-center justify-center font-black text-xl px-4 h-full cursor-pointer hover:opacity-80 transition-opacity ${className}`}
        onClick={onClick}
    >
      {formatTime(time)}
    </div>
  );
};