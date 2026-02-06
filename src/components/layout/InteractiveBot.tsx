"use client";

import React, { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const InteractiveBot = ({ inline = false, hiddenOnHome = false, endpoint = '/api/chat/public', persistenceKey }: { inline?: boolean; hiddenOnHome?: boolean; endpoint?: string; persistenceKey?: string }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Chat State
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Load from localStorage on mount (Smart Expiry: 24h)
  useEffect(() => {
    if (persistenceKey) {
      const saved = localStorage.getItem(persistenceKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);

          // Legacy format was just array, new format is { messages, timestamp }
          const history = Array.isArray(parsed) ? parsed : parsed.messages;
          const timestamp = Array.isArray(parsed) ? 0 : parsed.timestamp; // Treat old format as expired

          const now = Date.now();
          const EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

          if (history && (now - timestamp < EXPIRY_MS)) {
            setMessages(history);
          } else {
            // Expired -> Clear storage
            localStorage.removeItem(persistenceKey);
          }
        } catch (e) {
          console.error('Failed to load chat history', e);
        }
      }
    }
  }, [persistenceKey]);

  // Save to localStorage on change
  useEffect(() => {
    if (persistenceKey && messages.length > 0) {
      const payload = {
        messages,
        timestamp: Date.now()
      };
      localStorage.setItem(persistenceKey, JSON.stringify(payload));
    }
  }, [messages, persistenceKey]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  useEffect(() => {
    // Listen for global toggle events
    const handleToggle = (e: CustomEvent) => {
      if (e.detail?.target === 'global' && !inline) {
        // If global bot receives command, set state
        setIsOpen(e.detail.isOpen);
      }
    };

    window.addEventListener('bot-toggle', handleToggle as any);
    return () => window.removeEventListener('bot-toggle', handleToggle as any);
  }, [inline]);

  useEffect(() => {
    if (isOpen && inline) {
      // If inline bot somehow got opened, close it and open global instead (safety check)
      setIsOpen(false);
      window.dispatchEvent(new CustomEvent('bot-toggle', { detail: { target: 'global', isOpen: true } }));
    }
  }, [isOpen, inline]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!cardRef.current || isOpen) return;

      const rect = cardRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const mouseX = e.clientX;
      const mouseY = e.clientY;

      const maxRotation = 25;

      const xOffset = (mouseX - centerX) / window.innerWidth;
      const yOffset = (mouseY - centerY) / window.innerHeight;

      const rotateY = xOffset * maxRotation * 2;
      const rotateX = -yOffset * maxRotation * 2;

      setRotation({ x: rotateX, y: rotateY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isOpen]);

  // Hiding logic:
  // If hiddenOnHome (Global Bot) AND on Home Page AND NOT Open -> Render nothing (hidden).
  // If Open -> Render (even on home page, so it overlays everything correctly).
  if (hiddenOnHome && pathname === '/' && !isOpen) return null;

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMsg = inputValue.trim();
    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      // Detect language roughly by context or use default from app (simple implementation, ideally pass locale prop)
      const locale = 'ru';

      const newHistory = [...messages, { role: 'user', content: userMsg }];

      console.log('Sending message to endpoint:', endpoint); // DEBUG

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newHistory, locale })
      });

      const data = await res.json();

      if (data.reply) {
        setMessages(prev => [...prev, { role: 'ai', content: data.reply }]);

        // If server requested a refresh (e.g. after creating/editing a bot), trigger it
        if (data.refreshType === 'full') {
          console.log('🔄 AI Action triggered FULL refresh');
          router.refresh();
        } else if (data.refreshType === 'flow') {
          console.log('⚡ AI Action triggered FLOW refresh (Async)');
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('refresh-flow-data'));
          }
        }
      } else {
        setMessages(prev => [...prev, { role: 'ai', content: 'Извините, произошла ошибка соединения.' }]);
      }

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'ai', content: 'Что-то пошло не так. Попробуйте позже.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const customStyles = `
        @keyframes blink {
            0%, 45% { height: 20px; }
            48% { height: 2px; }
            50% { height: 20px; }
            95% { height: 20px; }
            98% { height: 2px; }
            100% { height: 20px; }
        }
        @keyframes excited {
            0%, 100% { transform: translateY(0); }
            25% { transform: translateY(-3px); }
            50% { transform: translateY(0); }
            75% { transform: translateY(-1.5px); }
        }
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
    `;

  const handleClick = () => {
    if (inline) {
      // If inline, trigger global bot to open
      window.dispatchEvent(new CustomEvent('bot-toggle', { detail: { target: 'global', isOpen: true } }));
    } else {
      // If global, toggle self
      setIsOpen(!isOpen);
    }
    setRotation({ x: 0, y: 0 });
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
  };

  // Global bot (not inline) uses fixed positioning and large z-index
  // Inline bot uses relative positioning
  const containerClasses = isOpen
    ? 'fixed bottom-[20px] right-[20px] w-[380px] h-[600px] z-[9999]'
    : inline
      ? 'relative w-[122px] h-[64px] z-10'  // Wider rectangular shape
      : 'fixed bottom-[20px] right-[20px] w-[110px] h-[110px] z-[9999]';

  return (
    <div
      className={`${containerClasses} pointer-events-auto transition-all duration-300 ease-spring`}
    >
      <style>{customStyles}</style>

      <div
        className={`w-full h-full flex items-center justify-center cursor-pointer`}
        style={{
          animation: isHovering && !isOpen ? 'excited 0.5s infinite ease-in-out' : 'none'
        }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onClick={handleClick}
      >
        <div
          className={`relative rounded-[28px] overflow-hidden transition-all duration-300 ease-out bg-[#141414]/90 backdrop-blur-xl border border-[#4ade80]/30 shadow-[0_0_20px_rgba(74,222,128,0.2),inset_0_0_20px_rgba(74,222,128,0.05)]`}
          ref={cardRef}
          style={{
            width: !isOpen && inline ? '220px' : '100%',
            height: !isOpen && inline ? '110px' : '100%',
            transformStyle: 'preserve-3d',
            // If inline and closed, scale down to 0.55
            transform: !isOpen
              ? inline
                ? `scale(0.55) perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) translateZ(0)`
                : `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) translateZ(0)`
              : 'none',
            // Center the scaled element
            transformOrigin: 'center center',
          }}
        >
          {/* Ambient Glow Balls */}
          <div className="absolute inset-0 z-[-10] overflow-hidden opacity-60 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 w-full h-full animate-[spin_10s_linear_infinite]" style={{ transform: 'translate(-50%, -50%)' }}>
              <div className="absolute top-[10%] left-[10%] w-[40px] h-[40px] rounded-full blur-[20px] bg-[#4ade80]" />
              <div className="absolute bottom-[10%] right-[10%] w-[40px] h-[40px] rounded-full blur-[20px] bg-[#a855f7]" />
            </div>
          </div>

          {/* FACE CONTAINER (Visible only when closed) */}
          <div className={`absolute inset-0 flex flex-col items-center justify-center pt-2 transition-opacity duration-300 ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            {/* Eyes Container */}
            <div className={`flex gap-[10px] mb-4 transition-all duration-300 ${isHovering ? 'translate-y-[2px]' : ''}`}>
              {/* Standard Eyes with Blink Animation */}
              <div className={`transition-opacity duration-300 ${isHovering ? 'opacity-0 absolute' : 'opacity-100 flex gap-[10px]'}`}>
                <div
                  className="w-[10px] bg-white/90 rounded-[8px] shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                  style={{ animation: 'blink 6s infinite linear' }}
                />
                <div
                  className="w-[10px] bg-white/90 rounded-[8px] shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                  style={{ animation: 'blink 6s infinite linear' }}
                />
              </div>

              {/* Happy Eyes (Only on Hover) */}
              <div className={`flex gap-[4px] text-[#4ade80] transition-opacity duration-300 ${isHovering ? 'opacity-100' : 'opacity-0 absolute'}`}>
                <svg fill="none" viewBox="0 0 24 24" className="w-[26px] h-[26px] drop-shadow-[0_0_5px_rgba(74,222,128,0.5)]">
                  <path fill="currentColor" d="M8.28386 16.2843C8.9917 15.7665 9.8765 14.731 12 14.731C14.1235 14.731 15.0083 15.7665 15.7161 16.2843C17.8397 17.8376 18.7542 16.4845 18.9014 15.7665C19.4323 13.1777 17.6627 11.1066 17.3088 10.5888C16.3844 9.23666 14.1235 8 12 8C9.87648 8 7.61556 9.23666 6.69122 10.5888C6.33728 11.1066 4.56771 13.1777 5.09858 15.7665C5.24582 16.4845 6.16034 17.8376 8.28386 16.2843Z" />
                </svg>
                <svg fill="none" viewBox="0 0 24 24" className="w-[26px] h-[26px] drop-shadow-[0_0_5px_rgba(74,222,128,0.5)]">
                  <path fill="currentColor" d="M8.28386 16.2843C8.9917 15.7665 9.8765 14.731 12 14.731C14.1235 14.731 15.0083 15.7665 15.7161 16.2843C17.8397 17.8376 18.7542 16.4845 18.9014 15.7665C19.4323 13.1777 17.6627 11.1066 17.3088 10.5888C16.3844 9.23666 14.1235 8 12 8C9.87648 8 7.61556 9.23666 6.69122 10.5888C6.33728 11.1066 4.56771 13.1777 5.09858 15.7665C5.24582 16.4845 6.16034 17.8376 8.28386 16.2843Z" />
                </svg>
              </div>
            </div>

            {/* Mouth - Neutral to Smile */}
            <div
              className={`
                                transition-all duration-300 ease-in-out mt-1
                                ${isHovering
                  ? 'w-[30px] h-[16px] border-b-[3px] border-[#4ade80] rounded-b-full bg-transparent'
                  : 'w-[16px] h-[3px] bg-white/80 rounded-full'
                }
                            `}
            />
          </div>

          {/* CHAT CONTAINER (Visible only when open) */}
          <div className={`absolute inset-0 flex flex-col p-4 transition-opacity duration-300 delay-100 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse" />
                <span className="text-sm font-semibold text-white">ИИ Ассистент</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMessages([]);
                    if (persistenceKey) localStorage.removeItem(persistenceKey);
                  }}
                  className="text-gray-400 hover:text-red-400 transition-colors p-1"
                  title="Очистить чат"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto mb-3 space-y-3 scrollbar-hide" onClick={(e) => e.stopPropagation()}>
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] p-3 rounded-xl text-xs leading-relaxed whitespace-pre-wrap ${msg.role === 'user'
                      ? 'bg-[#4ade80] text-black rounded-tr-none font-medium'
                      : 'bg-white/5 text-gray-200 rounded-tl-none border border-white/5'
                      }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 p-3 rounded-xl rounded-tl-none border border-white/5">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                placeholder="Напишите сообщение..."
                className="w-full bg-black/20 border border-white/10 rounded-xl p-3 pr-10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#4ade80]/50 resize-none h-[40px] focus:h-[80px] transition-all disabled:opacity-50"
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !inputValue.trim()}
                className="absolute right-2 bottom-2 p-1.5 bg-[#4ade80] rounded-lg text-black hover:bg-[#22c55e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveBot;
