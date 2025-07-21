import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';

export const BreakingNewsTab = () => {
  const { 
    isLoading,
    newsMode,
    generateBreakingNews, 
    setCustomBreakingNews,
    resetBreakingNews,
    aiGeneratedHeadlines, // Kept for showing generation errors
    spellingSuggestion,
    checkSpelling,
    clearSpellingSuggestion
  } = useAppContext();

  const [breakingNewsTopic, setBreakingNewsTopic] = useState('');
  const [breakingNewsTag, setBreakingNewsTag] = useState('TIN KHẨN');
  const [headlineCount, setHeadlineCount] = useState('');

  // State for the manual section remains separate
  const [customBreakingTag, setCustomBreakingTag] = useState('TIN KHẨN');
  const [customBreakingContent, setCustomBreakingContent] = useState('');

  // Debounced spell checking
  useEffect(() => {
      const topic = breakingNewsTopic.trim();
      if (!topic) {
          clearSpellingSuggestion();
          return;
      }

      const handler = setTimeout(() => {
          checkSpelling(topic);
      }, 700); // 700ms debounce

      return () => {
          clearTimeout(handler);
      };
  }, [breakingNewsTopic, checkSpelling, clearSpellingSuggestion]);
  
  const handleGenerateBreakingNews = () => {
    if (breakingNewsTopic.trim()) {
      clearSpellingSuggestion();
      const count = headlineCount ? parseInt(headlineCount, 10) : undefined;
      generateBreakingNews(breakingNewsTopic, breakingNewsTag, count);
    }
  };

  const handleSetCustomBreaking = () => {
    setCustomBreakingNews(customBreakingTag, customBreakingContent);
  };
  
  const handleAcceptSuggestion = () => {
    if (spellingSuggestion) {
      setBreakingNewsTopic(spellingSuggestion);
      clearSpellingSuggestion();
    }
  };


  const renderAiSection = () => {
    // This section is now only for input, the results are in HeadlineSelectionModal
    return (
      <div className="space-y-3">
         <div>
          <label htmlFor="breaking-news-tag" className="block text-sm font-medium text-gray-600 mb-1">
            Nhãn tin (ví dụ: TIN KHẨN, TRỰC TIẾP)
          </label>
          <input
              id="breaking-news-tag"
              type="text"
              value={breakingNewsTag}
              onChange={(e) => setBreakingNewsTag(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#ff4d4d]"
          />
        </div>
        <div>
          <label htmlFor="breaking-news-topic" className="block text-sm font-medium text-gray-600 mb-1">
            Chủ đề tin
          </label>
          <input
              id="breaking-news-topic"
              type="text"
              value={breakingNewsTopic}
              onChange={(e) => setBreakingNewsTopic(e.target.value)}
              placeholder="Ví dụ: Bão Biển Đông, giá vàng..."
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#ff4d4d]"
          />
        </div>
        {spellingSuggestion && (
          <div className="text-xs -mt-2 p-1.5 bg-blue-50 text-gray-700 rounded-md">
            Có phải ý bạn là: <button onClick={handleAcceptSuggestion} className="font-bold text-blue-600 hover:underline">{spellingSuggestion}</button>
          </div>
        )}
         <div>
          <label htmlFor="breaking-news-count" className="block text-sm font-medium text-gray-600 mb-1">
            Số lượng tin (để trống để lấy tối đa)
          </label>
          <input
              id="breaking-news-count"
              type="number"
              min="1"
              value={headlineCount}
              onChange={(e) => setHeadlineCount(e.target.value)}
              placeholder="Tùy chọn"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#ff4d4d]"
          />
        </div>
        <button
          onClick={handleGenerateBreakingNews}
          disabled={!breakingNewsTopic.trim() || !breakingNewsTag.trim() || isLoading}
          className="w-full bg-[#ff4d4d] hover:bg-[#ff1a1a] text-white font-bold py-2 px-4 rounded transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
          <span>Tạo danh sách tin khẩn cấp</span>
        </button>
        {/* Display errors here if any */}
        {aiGeneratedHeadlines.length > 0 && (
          <p className="text-sm text-red-600 p-2 bg-red-50 rounded-md">{aiGeneratedHeadlines[0]}</p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Reset Breaking News */}
      {newsMode === 'breaking' && (
        <>
            <div>
              <h3 className="font-semibold mb-2 text-gray-700">Quản lý Tin khẩn cấp</h3>
                <div className="flex">
                    <button
                        onClick={resetBreakingNews}
                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded transition-colors"
                    >
                        Reset và Quay về Tin thường
                    </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">Xóa các tin khẩn cấp đã lưu và trở về chế độ phát tin từ RSS.</p>
            </div>
            <hr/>
        </>
      )}

      {/* AI Breaking News Section */}
      <div>
        <h3 className="font-semibold mb-2 text-gray-700">Tạo tin bằng AI (hỗ trợ bởi Google Search)</h3>
        {renderAiSection()}
      </div>

      <hr/>
      
      {/* Custom Breaking News Section */}
      <div>
        <h3 className="font-semibold mb-2 text-gray-700">Tùy chỉnh Tin khẩn cấp (Thủ công)</h3>
        <div className="space-y-2">
          <input
            type="text"
            value={customBreakingTag}
            onChange={(e) => setCustomBreakingTag(e.target.value)}
            placeholder="Nhãn tin, ví dụ: TIN KHẨN"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#ff4d4d]"
          />
          <input
            type="text"
            value={customBreakingContent}
            onChange={(e) => setCustomBreakingContent(e.target.value)}
            placeholder="Nội dung tin khẩn cấp chạy chữ..."
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#ff4d4d]"
          />
          <button
            onClick={handleSetCustomBreaking}
            disabled={!customBreakingTag.trim() || !customBreakingContent.trim()}
            className="w-full bg-[#c62828] hover:bg-[#b71c1c] text-white font-bold py-2 px-4 rounded transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Kích hoạt Tin khẩn cấp thủ công
          </button>
        </div>
      </div>
    </div>
  );
};