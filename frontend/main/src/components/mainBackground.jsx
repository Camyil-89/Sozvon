// App.js

import Header from './header';
import { createContext, useContext, useState, useEffect } from 'react';

const BackgroundContext = createContext();
const MainBackground = ({ children }) => {
    const [visibleHeader, setHeaderVisibility] = useState(true);
    return (
        <BackgroundContext.Provider value={{ setHeaderVisibility }}>
            <div className="fixed inset-0 overflow-y-auto bg-gradient-to-br from-[#092b44] to-[#165072] text-white">
                <div className="min-h-screen grid grid-rows-[auto_1fr]">
                    {/* Навигация */}
                    {visibleHeader && (<Header className="relative z-20" />)}

                    {/* Фоновое изображение */}
                    <img
                        src="/logoSozvon1.png"
                        alt="Logo"
                        className="absolute z-[-1] opacity-25 left-1/2 transform -translate-x-1/2 top-1/2 -translate-y-1/2"
                    />

                    <main className="flex-grow z-10">
                        {children}
                    </main>
                </div>
            </div>
        </BackgroundContext.Provider>

    );
};

export default MainBackground;

export const useBackround = () => useContext(BackgroundContext);