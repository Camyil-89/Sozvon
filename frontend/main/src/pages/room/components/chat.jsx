import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageSquare, Send, Mic, MicOff } from 'lucide-react';
import {
    useChat,
} from '@livekit/components-react';

const Chat = ({ localParticipant }) => {
    const [message, setMessage] = useState('');
    const chatEndRef = useRef(null);
    const messagesContainerRef = useRef(null); // Новый ref для контейнера сообщений
    const inputRef = useRef(null);
    const { chatMessages, send } = useChat();
    const [isOpen, setIsOpen] = useState(true); // Для контроля состояния через JS

    // Синхронизация внутреннего состояния с элементом <details>
    const handleToggle = (e) => {
        setIsOpen(e.target.open);
    };

    useEffect(() => {
        const container = messagesContainerRef.current;
        if (!container || !isOpen) return;

        // Прокручиваем только если пользователь близко к низу
        const isNearBottom =
            container.scrollHeight - container.scrollTop - container.clientHeight < 100;

        if (isNearBottom || chatMessages.length <= 1) {
            chatEndRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            });
        }
    }, [chatMessages, isOpen]);

    const handleMessageChange = useCallback((e) => {
        if (e.target.value.length <= 255) {
            setMessage(e.target.value);
        }
    }, []);

    const handleSendMessage = useCallback(() => {
        if (message.trim() === '') return;
        send(message);
        setMessage('');
        inputRef.current?.focus();
    }, [message]);

    const renderMessage = (msg) => {
        const sender = typeof msg.from === 'string' ? msg.from : msg?.from?.identity;
        const isMe = sender === localParticipant.identity;
        const senderName = isMe ? 'Вы' : sender?.split('@')[0] || 'Участник';
        const time = new Date(msg.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        });
        return (
            <div
                key={`${msg.timestamp}-${sender}`}
                className={`flex mb-3 ${isMe ? 'justify-end' : 'justify-start'}`}
            >
                <div
                    className={`flex max-w-[80%] rounded-lg p-3 ${isMe ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
                >
                    {!isMe && (
                        <div className="mr-2">
                            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                                {senderName.charAt(0).toUpperCase()}
                            </div>
                        </div>
                    )}
                    <div className="overflow-hidden">
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`text-sm font-medium ${isMe ? 'text-white' : 'text-gray-700'}`}>
                                {senderName}
                            </span>
                            <span className={`text-xs ${isMe ? 'text-blue-100' : 'text-gray-500'}`}>{time}</span>
                            {msg.from && (
                                <span className="ml-1">
                                    {msg.from.isMicrophoneEnabled ? (
                                        <Mic size={12} className={isMe ? 'text-blue-200' : 'text-green-500'} />
                                    ) : (
                                        <MicOff size={12} className={isMe ? 'text-blue-200' : 'text-red-500'} />
                                    )}
                                </span>
                            )}
                        </div>
                        <p className={`text-sm break-words ${isMe ? 'text-white' : 'text-gray-800'}`}>
                            {msg.message}
                        </p>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <details
            open={isOpen}
            onToggle={handleToggle}
            className="border rounded-lg overflow-hidden w-full h-full flex flex-col"
        >
            <summary className="list-none cursor-pointer p-4 border-b bg-gray-50 text-lg font-semibold text-gray-800 focus:outline-none">
                Чат
            </summary>

            {/* Контент чата */}
            <div className="flex-1 flex flex-col h-full">
                <div
                    ref={messagesContainerRef}
                    className="flex-1 overflow-y-auto p-4 min-h-0 max-h-full h-full"
                    style={{ maxHeight: 'calc(100vh - 400px)' }}
                >
                    {chatMessages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400">
                            <MessageSquare size={24} className="mb-2" />
                            <p>Начните общение в чате</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {chatMessages.map(renderMessage)}
                            <div ref={chatEndRef} />
                        </div>
                    )}
                </div>

                {/* Поле ввода - фиксированное */}
                <div className="p-4 border-t flex-shrink-0">
                    <div className="flex gap-2">
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Написать сообщение..."
                            value={message}
                            onChange={handleMessageChange}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            maxLength={255}
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={!message.trim()}
                            className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                            aria-label="Отправить сообщение"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                    {message.length > 200 && (
                        <div className="text-xs text-gray-500 mt-1 text-right">
                            Осталось {255 - message.length} символов
                        </div>
                    )}
                </div>
            </div>
        </details>
    );
};

export default Chat;