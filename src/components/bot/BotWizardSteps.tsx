"use client";

import { Sparkles, FileText, Clock, HelpCircle, Plus } from "lucide-react";

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

// Step 1: Greeting
export function GreetingStep({ data, onChange }: { data: { mode: 'ai' | 'template'; text: string }; onChange: (updates: any) => void }) {
    return (
        <div>
            <p className="text-gray-400 text-sm mb-4">Что бот скажет когда клиент напишет первый раз?</p>
            <ModeToggle mode={data.mode} onChange={(mode) => onChange({ mode })} />

            {data.mode === 'template' && (
                <textarea
                    value={data.text}
                    onChange={(e) => onChange({ text: e.target.value })}
                    placeholder="Напишите приветственное сообщение..."
                    className="w-full h-32 px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 resize-none"
                />
            )}

            {data.mode === 'ai' && (
                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-sm text-purple-300">
                    <Sparkles className="w-4 h-4 inline mr-2" />
                    ИИ сам сформулирует приветствие на основе контекста беседы
                </div>
            )}
        </div>
    );
}

// Step 2: Services
export function ServicesStep({ data, onChange }: { data: { mode: 'ai' | 'template'; items: any[] }; onChange: (updates: any) => void }) {
    const addService = () => {
        onChange({ items: [...data.items, { name: '', price: 0 }] });
    };

    const updateService = (index: number, updates: any) => {
        const newItems = [...data.items];
        newItems[index] = { ...newItems[index], ...updates };
        onChange({ items: newItems });
    };

    const removeService = (index: number) => {
        onChange({ items: data.items.filter((_, i) => i !== index) });
    };

    return (
        <div>
            <p className="text-gray-400 text-sm mb-4">Какие услуги вы предлагаете?</p>
            <ModeToggle mode={data.mode} onChange={(mode) => onChange({ mode })} />

            {data.mode === 'template' && (
                <div className="space-y-3">
                    {data.items.map((item, i) => (
                        <div key={i} className="flex gap-2">
                            <input
                                value={item.name}
                                onChange={(e) => updateService(i, { name: e.target.value })}
                                placeholder="Название услуги"
                                className="flex-1 px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 text-sm"
                            />
                            <input
                                type="number"
                                value={item.price || ''}
                                onChange={(e) => updateService(i, { price: parseInt(e.target.value) || 0 })}
                                placeholder="Цена"
                                className="w-28 px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 text-sm"
                            />
                            {data.items.length > 1 && (
                                <button
                                    onClick={() => removeService(i)}
                                    className="px-3 text-red-400 hover:text-red-300"
                                >
                                    ×
                                </button>
                            )}
                        </div>
                    ))}
                    <button
                        onClick={addService}
                        className="w-full py-2.5 border border-dashed border-white/[0.15] rounded-xl text-gray-500 hover:text-white hover:border-white/[0.3] text-sm transition-colors"
                    >
                        + Добавить услугу
                    </button>
                </div>
            )}

            {data.mode === 'ai' && (
                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-sm text-purple-300">
                    <Sparkles className="w-4 h-4 inline mr-2" />
                    ИИ расскажет об услугах из базы знаний
                </div>
            )}
        </div>
    );
}

// Step 3: Schedule
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

// Step 4: FAQ
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

