'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, Settings, Sparkles, HelpCircle, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
    actionResults?: any[];
}

interface ConfiguratorChatProps {
    botId: string;
    botName?: string;
    onClose?: () => void;
}

export function ConfiguratorChat({ botId, botName, onClose }: ConfiguratorChatProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Load initial greeting
    useEffect(() => {
        loadInitialGreeting();
    }, [botId]);

    const loadInitialGreeting = async () => {
        try {
            const response = await fetch('/api/architect/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ botId, messages: [] })
            });
            const data = await response.json();
            if (data.response) {
                setMessages([{
                    role: 'assistant',
                    content: data.response,
                    timestamp: Date.now()
                }]);
            }
        } catch (error) {
            console.error('Failed to load greeting:', error);
        }
    };

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMsg: Message = { role: 'user', content: input, timestamp: Date.now() };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setInput('');
        setLoading(true);

        try {
            // Convert to API format
            const apiMessages = newMessages.map(m => ({
                role: m.role === 'assistant' ? 'assistant' : 'user',
                content: m.content
            }));

            const response = await fetch('/api/architect/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ botId, messages: apiMessages })
            });

            const data = await response.json();

            if (data.response) {
                const aiMsg: Message = {
                    role: 'assistant',
                    content: data.response,
                    timestamp: Date.now(),
                    actionResults: data.actionResults
                };
                setMessages(prev => [...prev, aiMsg]);
            } else if (data.error) {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: `⚠️ Ошибка: ${data.error}`,
                    timestamp: Date.now()
                }]);
            }

        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: '⚠️ Произошла ошибка связи',
                timestamp: Date.now()
            }]);
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

    // Quick action buttons
    const quickActions = [
        { label: '📅 Настроить график', prompt: 'Помоги настроить график работы' },
        { label: '💼 Добавить услугу', prompt: 'Хочу добавить новую услугу' },
        { label: '📋 Показать настройки', prompt: 'Покажи текущие настройки' },
    ];

    return (
        <div className="configurator-chat">
            <style jsx>{`
                .configurator-chat {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    background: var(--bg-primary);
                    border-radius: 16px;
                    overflow: hidden;
                    border: 1px solid var(--border-color);
                }
                
                .chat-header {
                    padding: 16px 20px;
                    background: linear-gradient(135deg, #22c55e, #16a34a);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                
                .header-title {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                
                .header-title h3 {
                    font-size: 16px;
                    font-weight: 600;
                }
                
                .header-subtitle {
                    font-size: 12px;
                    opacity: 0.9;
                }
                
                .close-btn {
                    background: rgba(255,255,255,0.2);
                    border: none;
                    color: white;
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .close-btn:hover {
                    background: rgba(255,255,255,0.3);
                }
                
                .messages-area {
                    flex: 1;
                    overflow-y: auto;
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                
                .message {
                    display: flex;
                    gap: 12px;
                    max-width: 85%;
                }
                
                .message.user {
                    align-self: flex-end;
                    flex-direction: row-reverse;
                }
                
                .message-avatar {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }
                
                .message.assistant .message-avatar {
                    background: linear-gradient(135deg, #22c55e, #16a34a);
                    color: white;
                }
                
                .message.user .message-avatar {
                    background: var(--bg-tertiary);
                    color: var(--text-secondary);
                }
                
                .message-content {
                    padding: 12px 16px;
                    border-radius: 16px;
                    font-size: 14px;
                    line-height: 1.5;
                }
                
                .message.assistant .message-content {
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-color);
                    border-bottom-left-radius: 4px;
                }
                
                .message.user .message-content {
                    background: #22c55e;
                    color: white;
                    border-bottom-right-radius: 4px;
                }
                
                .message-content :global(p) {
                    margin: 0;
                }
                
                .message-content :global(strong) {
                    color: #22c55e;
                }
                
                .message.user .message-content :global(strong) {
                    color: white;
                }
                
                .action-result {
                    margin-top: 8px;
                    padding: 8px 12px;
                    background: rgba(34, 197, 94, 0.1);
                    border-radius: 8px;
                    font-size: 12px;
                    color: #22c55e;
                }
                
                .quick-actions {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    padding: 12px 20px;
                    border-top: 1px solid var(--border-color);
                    background: var(--bg-secondary);
                }
                
                .quick-btn {
                    padding: 8px 16px;
                    border-radius: 20px;
                    border: 1px solid var(--border-color);
                    background: var(--bg-primary);
                    color: var(--text-primary);
                    font-size: 13px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                
                .quick-btn:hover {
                    border-color: #22c55e;
                    color: #22c55e;
                }
                
                .input-area {
                    padding: 16px 20px;
                    border-top: 1px solid var(--border-color);
                    background: var(--bg-secondary);
                }
                
                .input-wrapper {
                    display: flex;
                    gap: 12px;
                    align-items: flex-end;
                }
                
                .input-wrapper textarea {
                    flex: 1;
                    padding: 12px 16px;
                    border-radius: 24px;
                    border: 1px solid var(--border-color);
                    background: var(--bg-primary);
                    color: var(--text-primary);
                    font-size: 14px;
                    resize: none;
                    min-height: 44px;
                    max-height: 120px;
                }
                
                .input-wrapper textarea:focus {
                    outline: none;
                    border-color: #22c55e;
                }
                
                .send-btn {
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    border: none;
                    background: #22c55e;
                    color: white;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                    flex-shrink: 0;
                }
                
                .send-btn:hover {
                    background: #16a34a;
                }
                
                .send-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                
                .typing-indicator {
                    display: flex;
                    gap: 4px;
                    padding: 12px 16px;
                }
                
                .typing-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: var(--text-secondary);
                    animation: typing 1.4s infinite ease-in-out;
                }
                
                .typing-dot:nth-child(1) { animation-delay: 0s; }
                .typing-dot:nth-child(2) { animation-delay: 0.2s; }
                .typing-dot:nth-child(3) { animation-delay: 0.4s; }
                
                @keyframes typing {
                    0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
                    30% { transform: translateY(-4px); opacity: 1; }
                }
            `}</style>

            <div className="chat-header">
                <div className="header-title">
                    <Bot size={24} />
                    <div>
                        <h3>AI Архитектор</h3>
                        <div className="header-subtitle">
                            Настройка бота {botName ? `"${botName}"` : ''}
                        </div>
                    </div>
                </div>
                {onClose && (
                    <button className="close-btn" onClick={onClose}>
                        <X size={18} />
                    </button>
                )}
            </div>

            <div className="messages-area">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`message ${msg.role}`}>
                        <div className="message-avatar">
                            {msg.role === 'assistant' ? <Sparkles size={16} /> : <Settings size={14} />}
                        </div>
                        <div className="message-content">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                            {msg.actionResults?.map((result, i) => (
                                <div key={i} className="action-result">
                                    {result.success ? '✅' : '❌'} {result.action}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="message assistant">
                        <div className="message-avatar">
                            <Sparkles size={16} />
                        </div>
                        <div className="message-content">
                            <div className="typing-indicator">
                                <div className="typing-dot" />
                                <div className="typing-dot" />
                                <div className="typing-dot" />
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {messages.length <= 1 && (
                <div className="quick-actions">
                    {quickActions.map((action, idx) => (
                        <button
                            key={idx}
                            className="quick-btn"
                            onClick={() => {
                                setInput(action.prompt);
                            }}
                        >
                            {action.label}
                        </button>
                    ))}
                </div>
            )}

            <div className="input-area">
                <div className="input-wrapper">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Опишите что настроить..."
                        rows={1}
                    />
                    <button
                        className="send-btn"
                        onClick={handleSend}
                        disabled={!input.trim() || loading}
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
