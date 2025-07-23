// App.js
import React from 'react';
import Header from '../../components/header';
import MainBackground from '../../components/mainBackground';

const App = () => {
    return (
        <div>
            <main className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 py-12 md:py-20 relative z-10">
                {/* Добавлена обертка с большими боковыми отступами */}
                <div className="px-[200px]">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col lg:flex-row items-center">
                            <div className="lg:w-1/2 mb-12 lg:mb-0 lg:pr-12">
                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                                    Проводите встречи <br />
                                    <span className="text-[#6e9eac]">без границ</span>
                                </h1>
                                <p className="text-xl text-[#9e9d8a] mb-8 max-w-lg">
                                    Простые и надежные видеоконференции для работы, учебы и общения.
                                    Подключайтесь за секунды с любого устройства.
                                </p>
                                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                                    <button className="px-8 py-4 bg-[#256e91] rounded-xl font-semibold hover:bg-[#1e4c61] transition transform hover:-translate-y-1">
                                        Начать встречу
                                    </button>
                                    <button className="px-8 py-4 border-2 border-[#6e9eac] rounded-xl font-semibold hover:bg-[#1e4c61] transition">
                                        Присоединиться
                                    </button>
                                </div>
                            </div>
                            <div className="lg:w-1/2 relative">
                                <div className="relative">
                                    <div className="bg-[#1e4c61] rounded-2xl p-6 shadow-2xl">
                                        <div className="bg-gray-800 rounded-xl overflow-hidden">
                                            <div className="h-64 bg-gradient-to-r from-[#256e91] to-[#165072] relative">
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-16 h-16 rounded-full bg-[#6e9eac] flex items-center justify-center">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                </div>
                                                <div className="absolute bottom-4 left-4 flex space-x-2">
                                                    <div className="w-8 h-8 rounded-full bg-[#373f3f]"></div>
                                                    <div className="w-8 h-8 rounded-full bg-[#373f3f]"></div>
                                                    <div className="w-8 h-8 rounded-full bg-[#373f3f]"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-[#6e9eac] rounded-2xl opacity-20"></div>
                                    <div className="absolute -top-6 -right-6 w-24 h-24 bg-[#256e91] rounded-2xl opacity-30"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Преимущества */}
            <section className="py-16 relative z-10">
                <div className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20">
                    <div className="px-[200px]">
                        <div className="max-w-7xl mx-auto">
                            <h2 className="text-3xl font-bold text-center mb-16">Почему выбирают Sozvon</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="bg-[#092b44] p-8 rounded-2xl hover:shadow-xl transition">
                                    <div className="w-12 h-12 rounded-full bg-[#256e91] flex items-center justify-center mb-6">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold mb-3">Мгновенное подключение</h3>
                                    <p className="text-[#9e9d8a]">
                                        Начните встречу за секунды без установки дополнительного ПО
                                    </p>
                                </div>
                                <div className="bg-[#092b44] p-8 rounded-2xl hover:shadow-xl transition">
                                    <div className="w-12 h-12 rounded-full bg-[#256e91] flex items-center justify-center mb-6">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold mb-3">Высокая безопасность</h3>
                                    <p className="text-[#9e9d8a]">
                                        Защита данных и сквозное шифрование для всех встреч
                                    </p>
                                </div>
                                <div className="bg-[#092b44] p-8 rounded-2xl hover:shadow-xl transition">
                                    <div className="w-12 h-12 rounded-full bg-[#256e91] flex items-center justify-center mb-6">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold mb-3">Стабильная связь</h3>
                                    <p className="text-[#9e9d8a]">
                                        Кристально чистое качество звука и видео даже при слабом интернете
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default App;