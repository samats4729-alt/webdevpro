'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, X, MessageSquare, RefreshCw, Bot, User, Smartphone } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Message {
    role: 'user' | 'bot';
    content: string;
    timestamp: number;
    type?: 'text' | 'image';
}

interface EmulatorWindowProps {
    botId: string;
    botName: string;
    isOpen: boolean;
    onClose: () => void;
}

export function EmulatorWindow({ botId, botName, isOpen, onClose }: EmulatorWindowProps) {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'bot', content: 'Привет! Я тестовый бот. Напишите мне что-нибудь.', timestamp: Date.now() }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userText = input.trim();
        const userMsg: Message = { role: 'user', content: userText, timestamp: Date.now() };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            // Convert messages to format expected by API
            // Filter out the system greeting and format for AI context
            const historyForApi = messages
                .filter(m => m.content !== 'Привет! Я тестовый бот. Напишите мне что-нибудь.' &&
                    m.content !== 'Чат очищен. Напишите сообщение.')
                .map(m => ({
                    type: m.role, // 'user' or 'bot'
                    content: m.content
                }));

            // Add current message to history
            historyForApi.push({ type: 'user', content: userText });

            const res = await fetch(`/api/bots/${botId}/emulate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userText,
                    previousMessages: historyForApi
                })
            });

            const data = await res.json();

            if (data.responses && data.responses.length > 0) {
                const newMessages: Message[] = data.responses.map((r: any) => ({
                    role: 'bot',
                    content: r.content,
                    type: r.type,
                    timestamp: Date.now()
                }));
                // Add with small delay between messages for realism
                for (const msg of newMessages) {
                    await new Promise(r => setTimeout(r, 500));
                    setMessages(prev => [...prev, msg]);
                }
            } else {
                setMessages(prev => [...prev, { role: 'bot', content: '⚠️ Бот не нашел ответа.', timestamp: Date.now() }]);
            }

        } catch (error) {
            console.error('Emulation error:', error);
            setMessages(prev => [...prev, { role: 'bot', content: '💥 Ошибка эмулятора.', timestamp: Date.now() }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 w-[350px] h-[600px] flex flex-col bg-[#0b141a] rounded-3xl shadow-2xl border border-gray-800 overflow-hidden font-sans animation-slide-up">
            {/* Header */}
            <div className="bg-[#202c33] px-4 py-3 flex items-center justify-between border-b border-gray-700">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white">
                        <Bot size={20} />
                    </div>
                    <div>
                        <h3 className="text-gray-100 font-medium text-sm">{botName}</h3>
                        <p className="text-gray-400 text-xs">Test Mode</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setMessages([{ role: 'bot', content: 'Чат очищен. Напишите сообщение.', timestamp: Date.now() }])}
                        className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/5"
                        title="Restart"
                    >
                        <RefreshCw size={18} />
                    </button>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/5">
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat bg-opacity-10">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div
                            className={`max-w-[80%] rounded-lg px-3 py-2 text-sm shadow-sm ${msg.role === 'user'
                                ? 'bg-[#005c4b] text-white rounded-tr-none'
                                : 'bg-[#202c33] text-gray-100 rounded-tl-none'
                                }`}
                        >
                            <div className="prose prose-invert prose-sm max-w-none prose-p:my-0 prose-p:leading-relaxed">
                                <ReactMarkdown
                                    components={{
                                        p: ({ node, ...props }) => <p className="whitespace-pre-wrap" {...props} />
                                    }}
                                >
                                    {msg.content}
                                </ReactMarkdown>
                            </div>
                            <div className={`text-[10px] mt-1 text-right ${msg.role === 'user' ? 'text-green-200' : 'text-gray-400'}`}>
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-[#202c33] rounded-lg rounded-tl-none px-4 py-3 shadow-md">
                            <div className="flex gap-1">
                                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-[#202c33] p-3 flex items-center gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Напишите сообщение..."
                    className="flex-1 bg-[#2a3942] text-white rounded-lg px-4 py-2 text-sm focus:outline-none placeholder:text-gray-500"
                />
                <button
                    onClick={handleSend}
                    disabled={!input.trim() || loading}
                    className={`p-2 rounded-full flex-shrink-0 transition-colors ${input.trim()
                        ? 'bg-[#00a884] text-white hover:bg-[#008f72]'
                        : 'text-gray-500'
                        }`}
                >
                    <Send size={20} />
                </button>
            </div>
        </div>
    );
}

// Floating Trigger Button
export function EmulatorTrigger({ onClick }: { onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="fixed bottom-6 right-6 z-40 bg-[#00a884] hover:bg-[#008f72] text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105"
            title="Тест Бота"
        >
            <Smartphone size={28} />
        </button>
    );
}
