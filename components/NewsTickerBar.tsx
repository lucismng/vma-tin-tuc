import React from 'react';
import { Clock } from './Clock';
import { ScrollingNews } from './ScrollingNews';
import { useAppContext } from '../context/AppContext';

interface NewsTickerBarProps {
  newsString: string;
}

export const NewsTickerBar = ({ newsString }: NewsTickerBarProps) => {
  const { newsMode, breakingNewsTag, openAdvancedSettings } = useAppContext();
  const isBreaking = newsMode === 'breaking';

  return (
    <div className={`flex h-10 items-stretch shadow-md rounded-t-lg news-ticker-bar ${isBreaking ? 'breaking' : ''}`}>
      {/* Container for clock to allow separate styling */}
      <div className="clock-container">
        <Clock onClick={openAdvancedSettings} className="clock-text" />
      </div>
      
      {/* Container for scroller and breaking tag to allow separate styling */}
      <div className="scroller-container flex-1 flex items-stretch">
        {isBreaking && (
          <div className="flex-shrink-0 flex items-center justify-center px-4 font-black text-xl uppercase breaking-news-tag">
            {breakingNewsTag}
          </div>
        )}
        <ScrollingNews
          key={newsString}
          text={newsString}
          textClassName="scroller-text"
          loadingClassName="scroller-text opacity-70"
        />
      </div>
    </div>
  );
};