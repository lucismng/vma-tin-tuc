import React from 'react';
import { useAppContext } from '../context/AppContext';
import { NewsTickerBar } from './NewsTickerBar';
import { WeatherBar } from './WeatherBar';
import { AdvancedSettingsModal } from './AdvancedSettingsModal';
import { HeadlineSelectionModal } from './modal/HeadlineSelectionModal';

export const AppUI = () => {
    const { 
        isAppVisible,
        isMourningMode, 
        isTetMode,
        newsMode, 
        displayNewsString,
        currentWeather,
        // State for Headline Selection Modal
        isHeadlineModalOpen,
        itemsForSelection,
        sourcesForSelection,
        tagForSelection,
        closeHeadlineModal,
        setBreakingNewsFromSelection,
    } = useAppContext();

    if (!isAppVisible) {
        return null;
    }

    return (
        <>
            <div 
                key={`${newsMode}-${isMourningMode}-${isTetMode}`}
                className={`fixed bottom-6 left-5 right-5 shadow-2xl rounded-lg animate-flip-in ${isMourningMode ? 'mourning-mode' : ''} ${isTetMode ? 'tet-mode' : ''}`}
            >
                <NewsTickerBar newsString={displayNewsString} />
                <WeatherBar 
                    weatherData={currentWeather}
                />
            </div>
            <AdvancedSettingsModal />
            <HeadlineSelectionModal 
                isOpen={isHeadlineModalOpen}
                items={itemsForSelection}
                sources={sourcesForSelection}
                tag={tagForSelection}
                onClose={closeHeadlineModal}
                onConfirm={setBreakingNewsFromSelection}
            />
        </>
    );
};