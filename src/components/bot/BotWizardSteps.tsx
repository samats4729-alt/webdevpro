"use client";

import { useState } from "react";
import { Sparkles, FileText, Clock, HelpCircle, Plus, Settings } from "lucide-react";

// Shared Components
export function ModeToggle({ mode, onChange }: { mode: 'ai' | 'template'; onChange: (mode: 'ai' | 'template') => void }) {
    return (
        <div className="flex gap-2 mb-4">
            <button
                onClick={() => onChange('ai')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-sm transition-all ${mode === 'ai'
                    ? 'bg-purple-500/20 border-purple-500/50 text-purple-400'
                    : 'bg-white/[0.02] border-white/[0.08] text-gray-500 hover:border-white/[0.15]'
                    }`}
            >
                <Sparkles className="w-4 h-4" />
                ИИ отвечает
            </button>
            <button
                onClick={() => onChange('template')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-sm transition-all ${mode === 'template'
                    ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                    : 'bg-white/[0.02] border-white/[0.08] text-gray-500 hover:border-white/[0.15]'
                    }`}
            >
                <FileText className="w-4 h-4" />
                Мой шаблон
            </button>
        </div>
    );
}

export function PhonePreview({ message, botName }: { message: string; botName: string }) {
    return (
        <div className="relative">
            {/* Phone Frame */}
            <div className="w-72 h-[520px] bg-gradient-to-b from-gray-800 to-gray-900 rounded-[3rem] p-2 shadow-2xl border border-white/10">
                {/* Screen */}
                <div className="w-full h-full bg-[#0b141a] rounded-[2.5rem] overflow-hidden flex flex-col">
                    {/* WhatsApp Header */}
                    <div className="bg-[#1f2c34] px-4 py-3 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-white text-sm font-bold">
                            {botName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                            <p className="text-white text-sm font-medium">{botName}</p>
                            <p className="text-emerald-400 text-xs">онлайн</p>
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 p-4 overflow-y-auto" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.03\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}>

                        {/* User Message */}
                        <div className="flex justify-end mb-3">
                            <div className="max-w-[80%] bg-[#005c4b] rounded-lg rounded-tr-none px-3 py-2">
                                <p className="text-white text-sm">Привет!</p>
                                <p className="text-[10px] text-gray-300 text-right mt-1">12:00 ✓✓</p>
                            </div>
                        </div>

                        {/* Bot Message */}
                        <div className="flex justify-start mb-3">
                            <div className="max-w-[80%] bg-[#1f2c34] rounded-lg rounded-tl-none px-3 py-2 shadow-sm">
                                <p className="text-white text-sm whitespace-pre-line">{message}</p>
                                <p className="text-[10px] text-gray-400 text-right mt-1">12:00</p>
                            </div>
                        </div>
                    </div>

                    {/* Input Area */}
                    <div className="bg-[#1f2c34] px-3 py-2 flex items-center gap-2">
                        <div className="flex-1 bg-[#2a3942] rounded-full px-4 py-2">
                            <p className="text-gray-500 text-sm">Сообщение</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Live Preview Badge */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 text-xs font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Живое превью
            </div>
        </div>
    );
}

// Step 1: General Settings
export function BotSettingsStep({ data, onChange }: { data: { name: string; platforms: string[]; description: string }; onChange: (updates: any) => void }) {
    const togglePlatform = (platform: string) => {
        const current = data.platforms || [];
        const exists = current.includes(platform);
        let newPlatforms;

        if (exists) {
            newPlatforms = current.filter(p => p !== platform);
        } else {
            newPlatforms = [...current, platform];
        }

        onChange({ platforms: newPlatforms });
    };

    const platforms = [
        { id: 'whatsapp', name: 'WhatsApp', icon: <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center"><svg viewBox="0 0 24 24" className="w-3 h-3 text-white fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg></div> },
        { id: 'telegram', name: 'Telegram', icon: <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center"><svg viewBox="0 0 24 24" className="w-3 h-3 text-white fill-current"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 11.944 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg></div> },
        { id: 'instagram', name: 'Instagram', icon: <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 flex items-center justify-center"><svg viewBox="0 0 24 24" className="w-3 h-3 text-white fill-current"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" /></svg></div> }
    ];

    return (
        <div className="space-y-6">
            <div>
                <label className="block text-sm text-gray-400 mb-2">Название бота</label>
                <input
                    value={data.name}
                    onChange={(e) => onChange({ name: e.target.value })}
                    placeholder="Мой крутой бот..."
                    className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
            </div>

            <div>
                <label className="block text-sm text-gray-400 mb-3">Где будет работать бот?</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {platforms.map((p) => {
                        const isSelected = (data.platforms || []).includes(p.id);
                        return (
                            <button
                                key={p.id}
                                onClick={() => togglePlatform(p.id)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${isSelected
                                    ? 'bg-emerald-500/10 border-emerald-500/50'
                                    : 'bg-white/[0.04] border-white/[0.08] hover:border-white/[0.15]'
                                    }`}
                            >
                                {p.icon}
                                <div className="flex-1">
                                    <p className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                                        {p.name}
                                    </p>
                                </div>
                                {isSelected && (
                                    <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                                        <svg viewBox="0 0 24 24" className="w-3 h-3 text-white fill-none stroke-current stroke-2">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
                {(data.platforms || []).length > 1 && (
                    <div className="mt-3 flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <div className="w-4 h-4 mt-0.5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold">i</span>
                        </div>
                        <p className="text-xs text-blue-300">
                            Ваш бот будет работать везде одинаково. Настройки (приветствие, услуги, график) применятся ко всем выбранным каналам.
                        </p>
                    </div>
                )}
            </div>

            <div>
                <label className="block text-sm text-gray-400 mb-2">Описание (опционально)</label>
                <textarea
                    value={data.description}
                    onChange={(e) => onChange({ description: e.target.value })}
                    placeholder="Для чего этот бот?"
                    className="w-full h-24 px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 resize-none transition-colors"
                />
            </div>
        </div>
    );
}

// Step 2: Greeting
export function GreetingStep({ data, onChange, botName }: { data: { mode: 'ai' | 'template'; text: string; trigger?: string; keywords?: string[]; media?: string; ai_style?: string }; onChange: (updates: any) => void; botName?: string }) {
    const trigger = data.trigger || 'all';
    const keywords = data.keywords || [];
    const media = data.media;
    const aiStyle = data.ai_style;

    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = () => {
        setIsGenerating(true);
        // Simulate API call
        setTimeout(() => {
            let generatedText = '';
            const name = botName || 'наш бот';
            switch (aiStyle) {
                case 'business':
                    generatedText = `Здравствуйте! Вас приветствует ${name}. Мы ценим ваше время. Чем можем быть полезны?`;
                    break;
                case 'friendly':
                    generatedText = `Привет! 👋 Я ${name}. Рад тебя видеть! Чем могу помочь? 😊`;
                    break;
                case 'sales':
                    generatedText = `🔥 Привет! Это ${name}. У нас для тебя супер-предложение! Хочешь узнать подробности?`;
                    break;
                default:
                    generatedText = `Привет! Я ${name}. Чем могу помочь?`;
            }
            onChange({ text: generatedText, mode: 'template' }); // Switch to template so user can edit
            setIsGenerating(false);
        }, 1000);
    };

    return (
        <div className="space-y-6">
            {/* 1. Trigger Condition */}
            <div>
                <label className="block text-sm text-gray-400 mb-2">Когда бот должен ответить?</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                        onClick={() => onChange({ trigger: 'all' })}
                        className={`p-3 rounded-xl border text-sm text-left transition-all ${trigger === 'all'
                            ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                            : 'bg-white/[0.04] border-white/[0.08] text-gray-500 hover:border-white/[0.15]'
                            }`}
                    >
                        <div className="font-medium mb-1">На любое сообщение</div>
                        <div className="text-xs opacity-70">Для новых клиентов</div>
                    </button>
                    <button
                        onClick={() => onChange({ trigger: 'keyword' })}
                        className={`p-3 rounded-xl border text-sm text-left transition-all ${trigger === 'keyword'
                            ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                            : 'bg-white/[0.04] border-white/[0.08] text-gray-500 hover:border-white/[0.15]'
                            }`}
                    >
                        <div className="font-medium mb-1">На ключевое слово</div>
                        <div className="text-xs opacity-70">"Прайс", "Запись"...</div>
                    </button>
                    <button
                        onClick={() => onChange({ trigger: 'start' })}
                        className={`p-3 rounded-xl border text-sm text-left transition-all ${trigger === 'start'
                            ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                            : 'bg-white/[0.04] border-white/[0.08] text-gray-500 hover:border-white/[0.15]'
                            }`}
                    >
                        <div className="font-medium mb-1">Кнопка "Старт"</div>
                        <div className="text-xs opacity-70">Только Telegram</div>
                    </button>
                </div>

                {trigger === 'keyword' && (
                    <div className="mt-3">
                        <input
                            value={keywords.join(', ')}
                            onChange={(e) => onChange({ keywords: e.target.value.split(',').map(k => k.trim()) })}
                            placeholder="Введите слова через запятую: Цена, Прайс, Купить"
                            className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 text-sm"
                        />
                    </div>
                )}
            </div>

            {/* 2. Media Upload (Mock) */}
            <div>
                <label className="block text-sm text-gray-400 mb-2">Медиа файл (опционально)</label>
                {!media ? (
                    <button
                        onClick={() => onChange({ media: 'https://placehold.co/600x400/png' })} // Mock upload
                        className="w-full py-3 border border-dashed border-white/[0.15] rounded-xl text-gray-500 hover:text-white hover:border-white/[0.3] text-sm transition-colors flex items-center justify-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        Прикрепить фото/файл
                    </button>
                ) : (
                    <div className="relative w-full h-32 bg-cover bg-center rounded-xl border border-white/[0.1]" style={{ backgroundImage: `url(${media})` }}>
                        <button
                            onClick={() => onChange({ media: null })}
                            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                        >
                            ×
                        </button>
                    </div>
                )}
            </div>

            {/* 3. Greeting Message */}
            <div>
                <p className="text-gray-400 text-sm mb-4">Текст приветствия</p>
                <div className="flex gap-2 mb-4">
                    <button
                        onClick={() => onChange({ mode: 'template' })}
                        className={`flex-1 py-2 px-4 rounded-xl border text-sm transition-all ${data.mode === 'template'
                            ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                            : 'bg-white/[0.02] border-white/[0.08] text-gray-500 hover:border-white/[0.15]'
                            }`}
                    >
                        Свой текст
                    </button>
                    <button
                        onClick={() => onChange({ mode: 'ai' })}
                        className={`flex-1 py-2 px-4 rounded-xl border text-sm transition-all ${data.mode === 'ai'
                            ? 'bg-purple-500/20 border-purple-500/50 text-purple-400'
                            : 'bg-white/[0.02] border-white/[0.08] text-gray-500 hover:border-white/[0.15]'
                            }`}
                    >
                        <Sparkles className="w-4 h-4 inline mr-2" />
                        ИИ-Архитектор
                    </button>
                </div>

                {data.mode === 'template' && (
                    <textarea
                        value={data.text}
                        onChange={(e) => onChange({ text: e.target.value })}
                        placeholder="Здравствуйте! Спасибо, что написали..."
                        className="w-full h-32 px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 resize-none"
                    />
                )}

                {data.mode === 'ai' && (
                    <div className="space-y-4 p-4 rounded-xl bg-purple-500/5 border border-purple-500/20">
                        <div>
                            <label className="block text-xs text-purple-300/70 mb-2 uppercase font-medium">Стиль общения</label>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { id: 'business', icon: '💼', label: 'Деловой' },
                                    { id: 'friendly', icon: '👋', label: 'Дружелюбный' },
                                    { id: 'sales', icon: '🔥', label: 'Продающий' }
                                ].map((style) => (
                                    <button
                                        key={style.id}
                                        onClick={() => onChange({ ai_style: style.id })} // Just select style
                                        className={`p-2 rounded-lg border text-sm transition-all ${aiStyle === style.id
                                            ? 'bg-purple-500/20 border-purple-500/50 text-white'
                                            : 'bg-white/[0.04] border-white/[0.08] text-gray-400 hover:bg-white/[0.08]'
                                            }`}
                                    >
                                        <span className="mr-1">{style.icon}</span> {style.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={!aiStyle || isGenerating}
                            className="w-full py-2.5 rounded-xl bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
                        >
                            {isGenerating ? (
                                <>
                                    <Sparkles className="w-4 h-4 animate-spin" />
                                    Генерирую...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4" />
                                    Сгенерировать текст
                                </>
                            )}
                        </button>

                        <p className="text-xs text-purple-300/50 text-center">
                            ИИ создаст вариант, который можно будет отредактировать
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

// Step 3: Services
export function ServicesStep({ data, onChange, botName }: { data: { mode: 'ai' | 'template'; items: any[]; ai_prompt?: string }; onChange: (updates: any) => void; botName?: string }) {
    const [isGenerating, setIsGenerating] = useState(false);

    const addService = () => {
        onChange({ items: [...data.items, { name: '', price: 0, category: '', description: '', image: null }] });
    };

    const updateService = (index: number, updates: any) => {
        const newItems = [...data.items];
        newItems[index] = { ...newItems[index], ...updates };
        onChange({ items: newItems });
    };

    const removeService = (index: number) => {
        onChange({ items: data.items.filter((_, i) => i !== index) });
    };

    // Mock AI Generation
    const handleGenerate = () => {
        setIsGenerating(true);
        setTimeout(() => {
            const mockServices = [
                { name: 'Консультация', price: 5000, category: 'Услуги', description: 'Первичная консультация специалиста (30 мин)', image: null },
                { name: 'Диагностика', price: 10000, category: 'Услуги', description: 'Полная диагностика и план работ', image: null },
                { name: 'Абонемент Standard', price: 45000, category: 'Абонементы', description: '10 посещений в любое время', image: null },
                { name: 'Абонемент VIP', price: 80000, category: 'Абонементы', description: 'Безлимитное посещение + персональный менеджер', image: null },
            ];
            onChange({ items: mockServices, mode: 'template' });
            setIsGenerating(false);
        }, 1500);
    };

    return (
        <div className="space-y-6">
            <p className="text-gray-400 text-sm mb-4">Какие услуги вы предлагаете?</p>

            <div className="flex gap-2 mb-4">
                <button
                    onClick={() => onChange({ mode: 'template' })}
                    className={`flex-1 py-2 px-4 rounded-xl border text-sm transition-all ${data.mode === 'template'
                        ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                        : 'bg-white/[0.02] border-white/[0.08] text-gray-500 hover:border-white/[0.15]'
                        }`}
                >
                    Каталог услуг
                </button>
                <button
                    onClick={() => onChange({ mode: 'ai' })}
                    className={`flex-1 py-2 px-4 rounded-xl border text-sm transition-all ${data.mode === 'ai'
                        ? 'bg-purple-500/20 border-purple-500/50 text-purple-400'
                        : 'bg-white/[0.02] border-white/[0.08] text-gray-500 hover:border-white/[0.15]'
                        }`}
                >
                    <Sparkles className="w-4 h-4 inline mr-2" />
                    ИИ-Консультант
                </button>
            </div>

            {data.mode === 'template' && (
                <div className="space-y-4">
                    {/* AI Generator Button inside Template Mode */}
                    <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 flex items-center justify-between">
                        <div>
                            <h4 className="text-sm font-medium text-white mb-1">Заполнить автоматически?</h4>
                            <p className="text-xs text-gray-400">ИИ придумает услуги для "{botName || 'вашего бизнеса'}"</p>
                        </div>
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className="px-4 py-2 rounded-lg bg-white/[0.1] hover:bg-white/[0.2] text-xs text-white font-medium transition-colors flex items-center gap-2"
                        >
                            {isGenerating ? <Sparkles className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 text-purple-400" />}
                            {isGenerating ? 'Думаю...' : 'Сгенерировать'}
                        </button>
                    </div>

                    <div className="space-y-3">
                        {data.items.map((item, i) => (
                            <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] hover:border-white/[0.15] transition-all group">
                                <div className="flex gap-3 mb-3">
                                    {/* Image Placeholder */}
                                    <div className="w-16 h-16 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0 cursor-pointer hover:bg-white/[0.08] transition-colors relative overflow-hidden group/img">
                                        {item.image ? (
                                            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${item.image})` }} />
                                        ) : (
                                            <div className="text-center">
                                                <div className="text-xs text-gray-500 mb-0.5">Фото</div>
                                                <Plus className="w-3 h-3 text-gray-600 mx-auto" />
                                            </div>
                                        )}
                                        <button
                                            onClick={() => updateService(i, { image: item.image ? null : 'https://placehold.co/100x100/png' })}
                                            className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 flex items-center justify-center text-xs text-white transition-opacity"
                                        >
                                            {item.image ? 'Удалить' : 'Загрузить'}
                                        </button>
                                    </div>

                                    <div className="flex-1 space-y-2">
                                        <div className="flex gap-2">
                                            <input
                                                value={item.name}
                                                onChange={(e) => updateService(i, { name: e.target.value })}
                                                placeholder="Название услуги"
                                                className="flex-1 px-3 py-1.5 bg-transparent border-b border-white/[0.1] text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 text-sm"
                                            />
                                            <div className="relative w-24">
                                                <input
                                                    type="number"
                                                    value={item.price || ''}
                                                    onChange={(e) => updateService(i, { price: parseInt(e.target.value) || 0 })}
                                                    placeholder="0"
                                                    className="w-full px-3 py-1.5 bg-transparent border-b border-white/[0.1] text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 text-sm text-right pr-6"
                                                />
                                                <span className="absolute right-0 top-1.5 text-xs text-gray-500">₸</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <input
                                                value={item.category || ''}
                                                onChange={(e) => updateService(i, { category: e.target.value })}
                                                placeholder="Категория (напр. 'Стрижки')"
                                                className="w-1/3 px-3 py-1.5 bg-white/[0.02] rounded-lg border border-transparent focus:border-white/[0.1] text-xs text-gray-300 placeholder:text-gray-700 focus:outline-none"
                                            />
                                            <input
                                                value={item.description || ''}
                                                onChange={(e) => updateService(i, { description: e.target.value })}
                                                placeholder="Краткое описание..."
                                                className="flex-1 px-3 py-1.5 bg-white/[0.02] rounded-lg border border-transparent focus:border-white/[0.1] text-xs text-gray-300 placeholder:text-gray-700 focus:outline-none"
                                            />
                                        </div>
                                    </div>

                                    {data.items.length > 1 && (
                                        <button
                                            onClick={() => removeService(i)}
                                            className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 p-1 transition-all"
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={addService}
                        className="w-full py-3 border border-dashed border-white/[0.15] rounded-xl text-gray-500 hover:text-white hover:border-white/[0.3] text-sm transition-colors flex items-center justify-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Добавить услугу
                    </button>
                </div>
            )}

            {data.mode === 'ai' && (
                <div className="p-6 rounded-xl bg-purple-500/5 border border-purple-500/20 text-center">
                    <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
                        <Sparkles className="w-6 h-6 text-purple-400" />
                    </div>
                    <h4 className="text-white font-medium mb-2">ИИ-Консультант работает за вас</h4>
                    <p className="text-sm text-gray-400 mb-4">
                        В этом режиме бот не показывает фиксированный список кнопок. Вместо этого он использует базу знаний и ваш сайт, чтобы отвечать на вопросы о ценах и услугах в свободной форме.
                    </p>
                    <div className="text-xs text-purple-300/70 p-3 bg-purple-500/10 rounded-lg inline-block">
                        Рекомендуется, если у вас &gt;50 товаров или сложные услуги
                    </div>
                </div>
            )}
        </div>
    );
}

// Step 4: Schedule
export function ScheduleStep({ data, onChange }: { data: { mode: 'ai' | 'template'; days: any[] }; onChange: (updates: any) => void }) {
    const toggleDay = (index: number) => {
        const newDays = [...data.days];
        newDays[index] = { ...newDays[index], enabled: !newDays[index].enabled };
        onChange({ days: newDays });
    };

    const updateTime = (index: number, field: 'from' | 'to', value: string) => {
        const newDays = [...data.days];
        newDays[index] = { ...newDays[index], [field]: value };
        onChange({ days: newDays });
    };

    return (
        <div>
            <p className="text-gray-400 text-sm mb-4">Когда вы работаете?</p>
            <ModeToggle mode={data.mode} onChange={(mode) => onChange({ mode })} />

            {data.mode === 'template' && (
                <div className="space-y-2">
                    {data.days.map((day, i) => (
                        <div key={day.day} className="flex items-center gap-3">
                            <button
                                onClick={() => toggleDay(i)}
                                className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-medium transition-all ${day.enabled
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                                    : 'bg-white/[0.04] text-gray-600 border border-white/[0.08]'
                                    }`}
                            >
                                {day.day}
                            </button>
                            {day.enabled ? (
                                <>
                                    <input
                                        type="time"
                                        value={day.from}
                                        onChange={(e) => updateTime(i, 'from', e.target.value)}
                                        className="px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/50"
                                    />
                                    <span className="text-gray-600">—</span>
                                    <input
                                        type="time"
                                        value={day.to}
                                        onChange={(e) => updateTime(i, 'to', e.target.value)}
                                        className="px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/50"
                                    />
                                </>
                            ) : (
                                <span className="text-gray-600 text-sm">Выходной</span>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {data.mode === 'ai' && (
                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-sm text-purple-300">
                    <Sparkles className="w-4 h-4 inline mr-2" />
                    ИИ сам определит ответы о графике
                </div>
            )}
        </div>
    );
}

// Step 5: FAQ
export function FaqStep({ data, onChange }: { data: { mode: 'ai' | 'template'; items: any[] }; onChange: (updates: any) => void }) {
    const addFaq = () => {
        onChange({ items: [...data.items, { question: '', answer: '' }] });
    };

    const updateFaq = (index: number, updates: any) => {
        const newItems = [...data.items];
        newItems[index] = { ...newItems[index], ...updates };
        onChange({ items: newItems });
    };

    const removeFaq = (index: number) => {
        onChange({ items: data.items.filter((_, i) => i !== index) });
    };

    return (
        <div>
            <p className="text-gray-400 text-sm mb-4">Частые вопросы клиентов</p>
            <ModeToggle mode={data.mode} onChange={(mode) => onChange({ mode })} />

            {data.mode === 'template' && (
                <div className="space-y-4">
                    {data.items.map((item, i) => (
                        <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08]">
                            <div className="flex justify-between mb-2">
                                <span className="text-xs text-gray-500">Вопрос {i + 1}</span>
                                {data.items.length > 1 && (
                                    <button onClick={() => removeFaq(i)} className="text-xs text-red-400 hover:text-red-300">
                                        Удалить
                                    </button>
                                )}
                            </div>
                            <input
                                value={item.question}
                                onChange={(e) => updateFaq(i, { question: e.target.value })}
                                placeholder="Например: Где вы находитесь?"
                                className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 text-sm mb-2"
                            />
                            <textarea
                                value={item.answer}
                                onChange={(e) => updateFaq(i, { answer: e.target.value })}
                                placeholder="Ответ бота..."
                                className="w-full h-20 px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 text-sm resize-none"
                            />
                        </div>
                    ))}
                    <button
                        onClick={addFaq}
                        className="w-full py-2.5 border border-dashed border-white/[0.15] rounded-xl text-gray-500 hover:text-white hover:border-white/[0.3] text-sm transition-colors"
                    >
                        + Добавить вопрос
                    </button>
                </div>
            )}

            {data.mode === 'ai' && (
                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-sm text-purple-300">
                    <Sparkles className="w-4 h-4 inline mr-2" />
                    ИИ сам ответит на вопросы клиентов
                </div>
            )}
        </div>
    );
}

// Done Step
export function DoneStep({ data }: { data: any }) {
    const servicesCount = data.services.items.filter((s: any) => s.name).length;
    const faqCount = data.faq.items.filter((f: any) => f.question).length;
    const workDays = data.schedule.days.filter((d: any) => d.enabled).map((d: any) => d.day).join(', ');

    return (
        <div className="text-center py-6">
            <h3 className="text-xl font-semibold text-white mb-2">Бот готов к запуску!</h3>
            <p className="text-gray-500 mb-6">Проверьте настройки и нажмите "Запустить"</p>

            <div className="grid grid-cols-2 gap-3 text-left">
                <div className="p-3 rounded-xl bg-white/[0.04]">
                    <span className="text-xs text-gray-500">Бот</span>
                    <p className="text-sm text-white font-medium">{data.settings.name}</p>
                    <p className="text-xs text-gray-600 capitalize">{(data.settings.platforms || []).join(', ')}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.04]">
                    <span className="text-xs text-gray-500">Приветствие</span>
                    <p className="text-sm text-white">{data.greeting.mode === 'ai' ? '🤖 ИИ' : '📝 Шаблон'}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.04]">
                    <span className="text-xs text-gray-500">Услуги</span>
                    <p className="text-sm text-white">{data.services.mode === 'ai' ? '🤖 ИИ' : `${servicesCount} шт.`}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.04]">
                    <span className="text-xs text-gray-500">График</span>
                    <p className="text-sm text-white">{data.schedule.mode === 'ai' ? '🤖 ИИ' : workDays}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.04]">
                    <span className="text-xs text-gray-500">FAQ</span>
                    <p className="text-sm text-white">{data.faq.mode === 'ai' ? '🤖 ИИ' : `${faqCount} вопросов`}</p>
                </div>
            </div>
        </div>
    );
}
