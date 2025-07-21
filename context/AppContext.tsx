import React, { createContext, useState, useMemo, useCallback, useEffect, useContext, ReactNode } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { useNews } from '../hooks/useNews';
import { useWeather } from '../hooks/useWeather';
import { NewsMode, InfoType, WeatherData, NewsSource, AiNewsItem } from '../types';
import { CITIES_DATA } from '../constants';

// --- Context Type Definition ---
interface AppContextType {
    isAppVisible: boolean;
    isModalOpen: boolean;
    openAdvancedSettings: () => void;
    closeAdvancedSettings: () => void;
    isLoading: boolean;
    newsMode: NewsMode;
    isMourningMode: boolean;
    toggleMourningMode: () => void;
    isTetMode: boolean;
    toggleTetMode: () => void;
    customNews: string[];
    addCustomNews: (news: string) => void;
    removeCustomNews: (index: number) => void;
    clearCustomNews: () => void;
    setCustomNewsAsSource: () => void;
    breakingNews: string[];
    breakingNewsTag: string;
    generateBreakingNews: (topic: string, tag: string, count?: number) => void;
    setCustomBreakingNews: (tag: string, content: string) => void;
    resetBreakingNews: () => void;
    setRssAsSource: () => void;
    displayNewsString: string;
    currentWeather: WeatherData | null;
    aiGeneratedHeadlines: string[]; // Used for error messages
    aiNewsSources: NewsSource[];
    setBreakingNewsFromSelection: (items: AiNewsItem[], tag: string) => void;
    clearAiHeadlines: () => void;
    // Headline Selection Modal
    isHeadlineModalOpen: boolean;
    itemsForSelection: AiNewsItem[];
    sourcesForSelection: NewsSource[];
    tagForSelection: string;
    closeHeadlineModal: () => void;
    // Spell Check
    spellingSuggestion: string | null;
    checkSpelling: (text: string) => Promise<void>;
    clearSpellingSuggestion: () => void;
    // RSS Refetch
    isRssFetching: boolean;
    refetchRssNews: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

// --- Helper Functions ---
const formatNewsString = (titles: string[], error?: string | null): string => {
    if (error) return error;
    if (titles.length === 0) return 'Đang tải tin tức...';
    const NBSP = '\u00A0';
    // Increased spacing for better readability
    const SEPARATOR = `${NBSP.repeat(12)}•${NBSP.repeat(12)}`;
    return titles.map(title => `${title.trim().replace(/\.$/, '')}`).join(SEPARATOR);
};

// Helper function to get an AI client
const getAiClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("API key is missing. Please set the API_KEY environment variable.");
    }
    // Adheres to the guideline to use the API_KEY directly.
    return new GoogleGenAI({ apiKey });
};


// --- Provider Component ---
export const AppProvider = ({ children }: { children: ReactNode }) => {
    const { newsTitles: rssTitles, error: rssError, isFetching: isRssFetching, refetchNews: refetchRssNews } = useNews();
    
    // --- State Initialization ---
    const [isAppVisible, setIsAppVisible] = useState(true); // Always visible to prevent blank screen
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    // Initialize state from localStorage or use defaults
    const [newsMode, setNewsMode] = useState<NewsMode>(() => (localStorage.getItem('newsMode') as NewsMode) || 'rss');
    const [breakingNews, setBreakingNews] = useState<string[]>(() => {
        try {
            const saved = localStorage.getItem('breakingNews');
            if (saved) {
                const parsed = JSON.parse(saved);
                // Basic validation
                if (Array.isArray(parsed) && parsed.every(item => typeof item === 'string')) {
                    return parsed;
                }
            }
        } catch (error) {
            console.error("Failed to parse breakingNews from localStorage:", error);
            localStorage.removeItem('breakingNews'); // Clear corrupted data
        }
        return [];
    });
    const [breakingNewsTag, setBreakingNewsTag] = useState<string>(() => localStorage.getItem('breakingNewsTag') || 'TIN KHẨN');

    const [isMourningMode, setIsMourningMode] = useState(false);
    const [isTetMode, setIsTetMode] = useState(false);
    const [customNews, setCustomNews] = useState<string[]>([]);
    
    // AI & Modal related state
    const [aiGeneratedHeadlines, setAiGeneratedHeadlines] = useState<string[]>([]); // For errors
    const [aiNewsSources, setAiNewsSources] = useState<NewsSource[]>([]);
    const [isHeadlineModalOpen, setIsHeadlineModalOpen] = useState(false);
    const [itemsForSelection, setItemsForSelection] = useState<AiNewsItem[]>([]);
    const [sourcesForSelection, setSourcesForSelection] = useState<NewsSource[]>([]);
    const [tagForSelection, setTagForSelection] = useState<string>('');
    const [spellingSuggestion, setSpellingSuggestion] = useState<string | null>(null);
    
    const [cityIndex, setCityIndex] = useState(0);
    const currentWeather = useWeather(cityIndex);

    // --- LocalStorage Effects ---
    useEffect(() => {
        localStorage.setItem('newsMode', newsMode);
    }, [newsMode]);

    useEffect(() => {
        localStorage.setItem('breakingNews', JSON.stringify(breakingNews));
    }, [breakingNews]);

    useEffect(() => {
        localStorage.setItem('breakingNewsTag', breakingNewsTag);
    }, [breakingNewsTag]);

    // --- Core Logic Effects ---
    // Weather rotation
    useEffect(() => {
        const timerId = setTimeout(() => {
            setCityIndex(prev => (prev + 1) % CITIES_DATA.length);
        }, 5000); // Cycle weather every 5 seconds
        return () => clearTimeout(timerId);
    }, [cityIndex]);

    // --- Functions ---
    const closeHeadlineModal = useCallback(() => {
        setIsHeadlineModalOpen(false);
        setItemsForSelection([]);
        setSourcesForSelection([]);
        setTagForSelection('');
    }, []);

    const openAdvancedSettings = useCallback(() => setIsModalOpen(true), []);
    const closeAdvancedSettings = useCallback(() => {
        setIsModalOpen(false);
        clearAiHeadlines();
        closeHeadlineModal();
    }, [closeHeadlineModal]);
    
    const toggleMourningMode = useCallback(() => {
        setIsMourningMode(prev => {
            const newMode = !prev;
            if (newMode) setIsTetMode(false); // Disable Tet mode if mourning mode is enabled
            return newMode;
        });
    }, []);
    
    const toggleTetMode = useCallback(() => {
        setIsTetMode(prev => {
            const newMode = !prev;
            if (newMode) setIsMourningMode(false); // Disable mourning mode if Tet mode is enabled
            return newMode;
        });
    }, []);
    
    const generateBreakingNews = useCallback(async (topic: string, tag: string, count?: number) => {
        setIsLoading(true);
        setAiGeneratedHeadlines([]); // Clear previous errors
        setItemsForSelection([]);
        setAiNewsSources([]);

        try {
            const ai = getAiClient();

            const stormKeywords = ['bão', 'áp thấp', 'lũ', 'lụt', 'thiên tai', 'storm', 'typhoon', 'hurricane', 'cyclone'];
            const isStormTopic = stormKeywords.some(keyword => topic.toLowerCase().includes(keyword));
            
            const prompt = `Sử dụng Google Search để tìm thông tin thời sự MỚI NHẤT (ƯU TIÊN TIN TRONG VÒNG 3 GIỜ GẦN NHẤT) về chủ đề "${topic}". Dựa vào đó, hãy đóng vai một biên tập viên và tạo ra một danh sách gồm ÍT NHẤT 30 bản tóm tắt tin tức khác nhau.
            
    ${isStormTopic ? `YÊU CẦU ƯU TIÊN CHO TIN BÃO:
    - 10 tin đầu tiên: Phải tập trung vào các thông tin định lượng quan trọng nhất: vị trí chính xác của tâm bão (kinh độ, vĩ độ), sức gió mạnh nhất, hướng và tốc độ di chuyển. Cung cấp dự báo lượng mưa cụ thể cho các tỉnh/thành phố trong vùng ảnh hưởng.
    - Các tin tiếp theo: Cập nhật về công tác chỉ đạo, ứng phó của chính quyền, di dời dân, và các thiệt hại (nếu có).
    ` : ''}

    Mỗi mục trong danh sách phải là một đối tượng JSON chứa:
    1. "headline": một tiêu đề tin tức rất ngắn gọn, hấp dẫn, VIẾT HOA.
    2. "summary": một bản tóm tắt chi tiết hơn (1-2 câu) cung cấp nội dung chính của tin.

    QUAN TRỌNG: Chỉ trả về một mảng JSON của các đối tượng này. ĐẢM BẢO TUYỆT ĐỐI JSON HỢP LỆ. Bất kỳ chuỗi nào chứa dấu ngoặc kép (") phải được thoát đúng cách (\\").
    Toàn bộ phản hồi của bạn PHẢI được bọc trong một khối mã JSON duy nhất, như sau:
    \`\`\`json
    [
      { "headline": "...", "summary": "..." },
      { "headline": "...", "summary": "..." }
    ]
    \`\`\`
    Không thêm bất kỳ văn bản giải thích nào bên ngoài khối mã.`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    tools: [{googleSearch: {}}],
                }
            });
            
            const rawText = response.text;
            // Robust regex to find the JSON block, robust against surrounding text
            const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
            const match = rawText.match(jsonRegex);

            if (!match || !match[1]) {
                throw new Error("AI đã trả về dữ liệu không chứa một khối JSON hợp lệ. Vui lòng thử lại với chủ đề khác.");
            }

            const jsonString = match[1];
            let parsedData: AiNewsItem[];
            try {
                 parsedData = JSON.parse(jsonString);
            } catch (e) {
                 console.error("Lỗi phân tích JSON từ AI:", e);
                 console.error("Dữ liệu JSON chuỗi nhận được:", jsonString);
                 throw new Error("AI đã trả về dữ liệu JSON không hợp lệ. Vui lòng thử lại.");
            }
            
            if (!Array.isArray(parsedData) || parsedData.length === 0) {
              throw new Error("AI không thể tạo tóm tắt tin tức từ chủ đề được cung cấp.");
            }
            
            const sourcesRaw = response.candidates?.[0]?.groundingMetadata?.groundingChunks
                ?.map((chunk: any) => chunk.web)
                .filter((source: any) => source && source.uri)
                .map((source: any) => ({ uri: source.uri, title: source.title || new URL(source.uri).hostname })) || [];
            
            const uniqueSources = Array.from(new Map(sourcesRaw.map((s: NewsSource) => [s.uri, s])).values());
            
            setItemsForSelection(parsedData);
            setSourcesForSelection(uniqueSources);
            setTagForSelection(tag);
            setIsHeadlineModalOpen(true);

        } catch (err) {
            console.error("Lỗi khi tạo danh sách tin tức khẩn cấp:", err);
            const message = err instanceof Error ? err.message : JSON.stringify(err);
            setAiGeneratedHeadlines([`Không thể tạo tin: ${message}. Vui lòng thử lại.`]);
            setAiNewsSources([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const setBreakingNewsFromSelection = useCallback((items: AiNewsItem[], tag: string) => {
        if (items.length > 0 && tag.trim()) {
            const summaries = items.map(item => item.summary);
            setBreakingNewsTag(tag.trim());
            setBreakingNews(summaries);
            setNewsMode('breaking');
            closeHeadlineModal();
            closeAdvancedSettings();
        }
    }, [closeAdvancedSettings, closeHeadlineModal]);

    const clearAiHeadlines = useCallback(() => {
        setAiGeneratedHeadlines([]);
        setItemsForSelection([]);
        setAiNewsSources([]);
    }, []);

    const setCustomBreakingNews = useCallback((tag: string, content: string) => {
        if (tag.trim() && content.trim()) {
            setBreakingNewsTag(tag.trim());
            setBreakingNews([content.trim()]);
            setNewsMode('breaking');
            closeAdvancedSettings();
        }
    }, [closeAdvancedSettings]);

    const resetBreakingNews = useCallback(() => {
        setNewsMode('rss');
        setBreakingNews([]);
        setBreakingNewsTag('TIN KHẨN');
        // Clear from localStorage
        localStorage.removeItem('newsMode');
        localStorage.removeItem('breakingNews');
        localStorage.removeItem('breakingNewsTag');
    }, []);

    const addCustomNews = useCallback((news: string) => {
        setCustomNews(prev => [...prev, news]);
    }, []);
    
    const removeCustomNews = useCallback((indexToRemove: number) => {
        setCustomNews(prev => prev.filter((_, index) => index !== indexToRemove));
    }, []);

    const clearCustomNews = useCallback(() => {
        setCustomNews([]);
    }, []);

    const setCustomNewsAsSource = useCallback(() => {
        if (customNews.length > 0) {
            setNewsMode('custom');
            closeAdvancedSettings();
        }
    }, [customNews, closeAdvancedSettings]);
    
    const setRssAsSource = useCallback(() => {
        setNewsMode('rss');
        if (isMourningMode) setIsMourningMode(false);
        if (isTetMode) setIsTetMode(false);
        closeAdvancedSettings();
    }, [isMourningMode, isTetMode, closeAdvancedSettings]);

    const displayNewsString = useMemo(() => {
        switch(newsMode) {
            case 'custom':
                return formatNewsString(customNews);
            case 'breaking':
                return formatNewsString(breakingNews);
            case 'rss':
            default:
                return formatNewsString(rssTitles, rssError);
        }
    }, [newsMode, rssTitles, customNews, breakingNews, rssError]);
    
    // --- Spell Checking ---
    const checkSpelling = useCallback(async (text: string) => {
        if (!text) return;
        try {
            const ai = getAiClient();
            const prompt = `Correct any spelling or grammatical errors in the following Vietnamese phrase. If it is already correct, return the original phrase. Only return the corrected phrase, nothing else. Phrase: "${text}"`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                 config: {
                    temperature: 0,
                },
            });

            const correctedText = response.text.trim().replace(/"/g, '');
            
            if (correctedText.toLowerCase() !== text.toLowerCase() && correctedText.length > 0) {
                setSpellingSuggestion(correctedText);
            } else {
                setSpellingSuggestion(null);
            }
        } catch (err) {
            console.error("Spell check error:", err);
            setSpellingSuggestion(null);
        }
    }, []);

    const clearSpellingSuggestion = useCallback(() => {
        setSpellingSuggestion(null);
    }, []);


    const value: AppContextType = {
        isAppVisible,
        isModalOpen,
        openAdvancedSettings,
        closeAdvancedSettings,
        isLoading,
        newsMode,
        isMourningMode,
        toggleMourningMode,
        isTetMode,
        toggleTetMode,
        customNews,
        addCustomNews,
        removeCustomNews,
        clearCustomNews,
        setCustomNewsAsSource,
        breakingNews,
        breakingNewsTag,
        generateBreakingNews,
        setCustomBreakingNews,
        resetBreakingNews,
        setRssAsSource,
        displayNewsString,
        currentWeather,
        aiGeneratedHeadlines,
        aiNewsSources,
        setBreakingNewsFromSelection,
        clearAiHeadlines,
        isHeadlineModalOpen,
        itemsForSelection,
        sourcesForSelection,
        tagForSelection,
        closeHeadlineModal,
        spellingSuggestion,
        checkSpelling,
        clearSpellingSuggestion,
        isRssFetching,
        refetchRssNews,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// --- Custom Hook ---
export const useAppContext = (): AppContextType => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};
