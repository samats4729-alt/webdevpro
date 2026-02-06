'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Bot, User, Trash2, Plus, Mic, MicOff, Settings, Zap, ChevronDown, History, MessageSquare, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useLanguage } from '@/lib/i18n';

// Add type definitions for Web Speech API
declare global {
    interface Window {
        webkitSpeechRecognition: any;
        SpeechRecognition: any;
    }
}

interface Message {
    role: 'user' | 'ai';
    content: string;
    timestamp: number;
    actionResults?: any[];
}

interface Session {
    id: string;
    title: string;
    updated_at: string;
}

type ChatMode = 'generate' | 'configure';

export function FullPageChat() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [mode, setMode] = useState<ChatMode>('generate');
    const [bots, setBots] = useState<any[]>([]);
    const [selectedBotId, setSelectedBotId] = useState<string | null>(null);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [showHistory, setShowHistory] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<any>(null);
    const { language } = useLanguage();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Fetch bots and sessions on mount
    const fetchBots = async () => {
        try {
            const res = await fetch('/api/bots');
            const data = await res.json();
            setBots(data.bots || []);
            // Only defaults if nothing selected
            if (data.bots?.length > 0 && !selectedBotId) {
                setSelectedBotId(data.bots[0].id);
            }
        } catch (e) {
            console.error(e);
        }
    };

    // Fetch bots and sessions on mount
    useEffect(() => {
        fetchBots();
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            const res = await fetch('/api/architect/sessions');
            const data = await res.json();
            if (data.sessions) {
                setSessions(data.sessions);
            }
        } catch (e) {
            console.error('Failed to fetch sessions', e);
        }
    };

    // Initial greeting based on mode
    useEffect(() => {
        if (messages.length === 0 && !sessionId) {
            setGreeting();
        }
    }, [language, mode, sessionId]); // Depend on sessionId to not override loaded history

    const setGreeting = () => {
        const greeting: Message = mode === 'configure'
            ? {
                role: 'ai',
                content: language === 'ru'
                    ? `👋 Привет! Я AI-Помощник для настройки бота.
\nМогу помочь:
1️⃣ **Настроить график работы** — рабочие дни и часы
2️⃣ **Добавить услуги** — с ценами и длительностью
3️⃣ **Управлять выходными** — праздники и отпуска
\nЧто настроим? Или просто опишите задачу!`
                    : `👋 Hello! I'm the AI Assistant for bot configuration.
\nI can help:
1️⃣ **Configure schedule** — working days and hours
2️⃣ **Add services** — with prices and duration
3️⃣ **Manage holidays** — days off and vacations
\nWhat would you like to configure?`,
                timestamp: Date.now()
            }
            : {
                role: 'ai',
                content: language === 'ru'
                    ? '👋 Привет. Я AI-Архитектор.\n\nГотов помочь с созданием бота. Опишите задачу, и мы начнем.'
                    : '👋 Hello. I am the AI Architect.\n\nReady to help you build a bot. Describe your task, and we will begin.',
                timestamp: Date.now()
            };

        setMessages([greeting]);
    };

    // Initialize Speech Recognition
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                const recognition = new SpeechRecognition();
                recognition.continuous = false;
                recognition.interimResults = false;
                recognition.lang = language === 'ru' ? 'ru-RU' : 'en-US';

                recognition.onresult = (event: any) => {
                    const transcript = event.results[0][0].transcript;
                    setInput((prev) => (prev ? prev + ' ' + transcript : transcript));
                    setIsListening(false);
                };

                recognition.onerror = (event: any) => {
                    console.error('Speech recognition error', event.error);
                    setIsListening(false);
                };

                recognition.onend = () => {
                    setIsListening(false);
                };

                recognitionRef.current = recognition;
            }
        }
    }, [language]);

    const toggleListening = () => {
        if (!recognitionRef.current) {
            alert('Your browser does not support Web Speech API. Try Chrome/Edge.');
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            try {
                recognitionRef.current.start();
                setIsListening(true);
            } catch (e) {
                console.error("Start error:", e);
                setIsListening(false);
            }
        }
    };

    const loadSession = async (id: string) => {
        setLoading(true);
        // Optimistic UI update
        const session = sessions.find(s => s.id === id);
        if (session) {
            // Optional: set title somewhere?
        }

        try {
            setSessionId(id);
            setMessages([]); // Clear current view while loading
            setShowHistory(false);

            const res = await fetch(`/api/architect/chat?sessionId=${id}`);
            const data = await res.json();

            if (data.messages) {
                const loadedMessages: Message[] = data.messages.map((m: any) => ({
                    role: m.role === 'user' ? 'user' : 'ai',
                    content: m.content,
                    timestamp: new Date(m.created_at).getTime(),
                    actionResults: m.action_results ? JSON.parse(m.action_results) : undefined
                }));
                setMessages(loadedMessages);
            }
        } catch (e) {
            console.error('Failed to load session messages', e);
        } finally {
            setLoading(false);
        }
    };

    const handleNewChat = () => {
        setSessionId(null);
        setMessages([]); // Will trigger setGreeting
        setShowHistory(false);
    };

    const deleteSession = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation(); // prevent loading session
        if (!confirm('Are you sure you want to delete this chat?')) return;

        try {
            await fetch(`/api/architect/sessions?id=${id}`, { method: 'DELETE' });
            setSessions(prev => prev.filter(s => s.id !== id));
            if (sessionId === id) {
                handleNewChat();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMsg: Message = { role: 'user', content: input, timestamp: Date.now() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            // Combined API call
            const payload: any = {
                messages: [...messages, userMsg].map(m => ({ role: m.role === 'ai' ? 'assistant' : m.role, content: m.content })),
                mode: mode,
                sessionId: sessionId
            };

            if (selectedBotId) payload.botId = selectedBotId;

            const response = await fetch('/api/architect/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            // Update Session ID if created
            if (data.sessionId && !sessionId) {
                setSessionId(data.sessionId);
                fetchSessions(); // Refresh list
            }

            // Handle Created Bot
            if (data.createdBotId) {
                await fetchBots(); // Refresh bots list
                setSelectedBotId(data.createdBotId);
                // Switch to configure mode so future requests send the botId
                setMode('configure');
            }

            if (data.response) {
                const aiMsg: Message = {
                    role: 'ai',
                    content: data.response,
                    timestamp: Date.now(),
                    actionResults: data.actionResults
                };
                setMessages(prev => [...prev, aiMsg]);
            } else if (data.error) {
                setMessages(prev => [...prev, {
                    role: 'ai',
                    content: `⚠️ Ошибка: ${data.error}`,
                    timestamp: Date.now()
                }]);
            }

        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, { role: 'ai', content: 'Connection error.', timestamp: Date.now() }]);
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

    // Quick actions for configure mode
    const quickActions = [
        { label: '📅 Настроить график', prompt: 'Помоги настроить график работы' },
        { label: '💼 Добавить услугу', prompt: 'Хочу добавить новую услугу' },
        { label: '📋 Показать настройки', prompt: 'Покажи текущие настройки бота' },
    ];

    return (
        <div className="flex relative h-full w-full bg-black text-gray-100 font-sans overflow-hidden">

            {/* History Sidebar - Slide Over */}
            <div className={`absolute top-0 left-0 h-full w-64 bg-[#111111] border-r border-white/10 transform transition-transform duration-300 z-20 ${showHistory ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center justify-between p-4 border-b border-white/5">
                    <h3 className="font-medium text-sm text-gray-300">История чатов</h3>
                    <button onClick={() => setShowHistory(false)} className="text-gray-500 hover:text-white">
                        <X size={18} />
                    </button>
                </div>
                <div className="p-3">
                    <button
                        onClick={handleNewChat}
                        className="w-full flex items-center justify-center gap-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 py-2 rounded-lg border border-green-500/20 text-sm font-medium transition-colors mb-4"
                    >
                        <Plus size={16} /> Новая беседа
                    </button>

                    <div className="space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
                        {sessions.map(session => (
                            <div key={session.id} className="relative group">
                                <button
                                    onClick={() => loadSession(session.id)}
                                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm truncate transition-colors pr-8 ${sessionId === session.id ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-gray-300'}`}
                                >
                                    {session.title}
                                </button>
                                <button
                                    onClick={(e) => deleteSession(e, session.id)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                    title="Delete chat"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                        {sessions.length === 0 && (
                            <p className="text-xs text-gray-600 text-center py-4">Нет сохраненных чатов</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className={`flex-1 flex flex-col h-full transition-all duration-300 ${showHistory ? 'ml-64' : 'ml-0'}`}>
                {/* Mode Tabs & Header */}
                <div className="flex items-center justify-between border-b border-white/10 px-6 py-3 bg-black z-10">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowHistory(!showHistory)}
                            className={`p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors mr-2 ${showHistory ? 'text-white bg-white/10' : ''}`}
                            title="History"
                        >
                            <History size={18} />
                        </button>

                        <button
                            onClick={() => setMode('generate')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${mode === 'generate'
                                ? 'bg-white/10 text-white'
                                : 'text-gray-500 hover:text-gray-300'
                                }`}
                        >
                            <Sparkles size={16} />
                            {language === 'ru' ? 'Создать бота' : 'Create Bot'}
                        </button>
                        <button
                            onClick={() => setMode('configure')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${mode === 'configure'
                                ? 'bg-green-500/20 text-green-400'
                                : 'text-gray-500 hover:text-gray-300'
                                }`}
                        >
                            <Settings size={16} />
                            {language === 'ru' ? 'Настроить' : 'Configure'}
                        </button>
                    </div>

                    {/* Bot selector for configure mode */}
                    {mode === 'configure' && bots.length > 0 && (
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">Бот:</span>
                            <select
                                value={selectedBotId || ''}
                                onChange={(e) => setSelectedBotId(e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-gray-300 focus:outline-none focus:border-green-500"
                                style={{ colorScheme: 'dark' }}
                            >
                                {bots.map(bot => (
                                    <option key={bot.id} value={bot.id} style={{ background: '#1f2937' }}>
                                        {bot.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-black relative">
                    {/* Overlay for mobile/history open if needed */}
                    {showHistory && <div className="absolute inset-0 bg-black/50 z-10 md:hidden" onClick={() => setShowHistory(false)} />}

                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>

                            {/* Avatar AI */}
                            {msg.role === 'ai' && (
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${mode === 'configure' ? 'bg-green-500/20' : 'bg-white/5'
                                    }`}>
                                    {mode === 'configure' ? (
                                        <Settings size={16} className="text-green-400" />
                                    ) : (
                                        <Bot size={16} className="text-gray-500" />
                                    )}
                                </div>
                            )}

                            {/* Message Bubble */}
                            <div className={`max-w-[85%] px-4 py-2 text-sm leading-relaxed ${msg.role === 'user'
                                ? 'bg-[#1c1c1f] text-gray-200 rounded-lg'
                                : 'bg-transparent text-gray-300 pl-0'
                                }`}>
                                <div className={`prose prose-invert prose-sm max-w-none ${msg.role === 'user' ? 'prose-p:text-gray-200' : 'prose-p:text-gray-300'
                                    }`}>
                                    <ReactMarkdown
                                        components={{
                                            strong: ({ node, ...props }) => <span className="text-green-500 font-bold" {...props} />
                                        }}
                                    >
                                        {msg.content}
                                    </ReactMarkdown>
                                </div>

                                {/* Action Results */}
                                {msg.actionResults?.map((result, i) => (
                                    <div key={i} className="mt-2 px-3 py-2 bg-green-500/10 rounded-lg text-xs text-green-400 flex items-center gap-2">
                                        <Zap size={12} />
                                        {result.success ? '✓' : '✗'} {result.action}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {loading && (
                        <div className="flex gap-4 justify-start">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${mode === 'configure' ? 'bg-green-500/20' : 'bg-white/5'
                                }`}>
                                {mode === 'configure' ? (
                                    <Settings size={16} className="text-green-400 animate-pulse" />
                                ) : (
                                    <Bot size={16} className="text-gray-500 animate-pulse" />
                                )}
                            </div>
                            <div className="flex items-center gap-1 pl-1 pt-2">
                                <span className="text-xs text-gray-600 animate-pulse">thinking...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Quick Actions for Configure Mode */}
                {mode === 'configure' && messages.length <= 1 && (
                    <div className="px-6 py-3 flex flex-wrap gap-2 border-t border-white/5 bg-black">
                        {quickActions.map((action, idx) => (
                            <button
                                key={idx}
                                onClick={() => setInput(action.prompt)}
                                className="px-4 py-2 bg-white/5 hover:bg-green-500/10 border border-white/10 hover:border-green-500/30 rounded-full text-sm text-gray-400 hover:text-green-400 transition-all"
                            >
                                {action.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* Input Area - Pill Shape */}
                <div className="p-6 bg-black">
                    <div className={`relative flex items-end gap-2 bg-[#1c1c1f] rounded-3xl p-2 border transition-all ${isListening
                        ? 'border-red-500/50 ring-1 ring-red-500/20'
                        : mode === 'configure'
                            ? 'border-green-500/20 focus-within:border-green-500/40 focus-within:ring-1 focus-within:ring-green-500/20'
                            : 'border-white/5 focus-within:border-white/10 focus-within:ring-1 focus-within:ring-white/10'
                        }`}>

                        <button className="p-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-colors flex-shrink-0">
                            <Plus size={20} />
                        </button>

                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={isListening
                                ? (language === 'ru' ? "Слушаю..." : "Listening...")
                                : mode === 'configure'
                                    ? (language === 'ru' ? "Опишите что настроить..." : "Describe what to configure...")
                                    : (language === 'ru' ? "Спросите что-нибудь..." : "Ask something...")
                            }
                            className="flex-1 max-h-[120px] py-3 bg-transparent text-gray-200 placeholder:text-gray-600 resize-none focus:outline-none text-sm scrollbar-hide"
                            rows={1}
                            style={{ minHeight: '44px' }}
                        />

                        {input.trim() ? (
                            <button
                                onClick={handleSend}
                                disabled={loading}
                                className={`p-3 rounded-full transition-all shadow-lg flex-shrink-0 ${mode === 'configure'
                                    ? 'bg-green-500 text-white hover:bg-green-600 shadow-green-500/20'
                                    : 'bg-white text-black hover:bg-gray-200 shadow-white/5'
                                    }`}
                            >
                                <Send size={18} fill="currentColor" className="ml-0.5" />
                            </button>
                        ) : (
                            <button
                                onClick={toggleListening}
                                className={`p-3 rounded-full transition-all flex-shrink-0 ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                            >
                                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                            </button>
                        )}
                    </div>
                    {isListening && <p className="text-[10px] text-center text-red-500 mt-2 animate-pulse font-medium">recording...</p>}
                    {!isListening && <p className="text-[10px] text-center text-gray-700 mt-2 font-medium">AI can make mistakes.</p>}
                </div>
            </div>
        </div>
    );
}
