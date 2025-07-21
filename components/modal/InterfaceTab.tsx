import React from 'react';
import { useAppContext } from '../../context/AppContext';

export const InterfaceTab = () => {
    const { isMourningMode, toggleMourningMode, isTetMode, toggleTetMode } = useAppContext();
    return (
        <div className="space-y-4">
            <div>
                <h3 className="font-semibold mb-2 text-gray-700">Chế độ Hiển thị</h3>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                    <span className="font-semibold text-gray-700">Chế độ quốc tang</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                        type="checkbox" 
                        checked={isMourningMode}
                        onChange={toggleMourningMode}
                        className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-focus:ring-2 peer-focus:ring-gray-400 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-800"></div>
                    </label>
                </div>
                <p className="text-xs text-gray-500 mt-2">Bật chế độ này sẽ chuyển toàn bộ giao diện sang tông màu đen-trắng.</p>
            </div>
             <div className="mt-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                    <span className="font-semibold text-red-600">Chế độ Tết</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                        type="checkbox" 
                        checked={isTetMode}
                        onChange={toggleTetMode}
                        className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-focus:ring-2 peer-focus:ring-red-400 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                    </label>
                </div>
                <p className="text-xs text-gray-500 mt-2">Bật chế độ này sẽ chuyển toàn bộ giao diện sang tông màu đỏ - vàng ngày Tết.</p>
            </div>
        </div>
    );
};
