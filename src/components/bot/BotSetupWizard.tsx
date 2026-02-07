"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Check, Sparkles, FileText, Clock, HelpCircle, Rocket } from "lucide-react";

interface WizardStep {
    id: string;
    title: string;
    icon: any;
}

interface WizardData {
    greeting: {
        mode: 'ai' | 'template';
        text: string;
    };
    services: {
        mode: 'ai' | 'template';
        items: { name: string; price: number }[];
    };
    schedule: {
        mode: 'ai' | 'template';
        days: { day: string; enabled: boolean; from: string; to: string }[];
    };
    faq: {
        mode: 'ai' | 'template';
        items: { question: string; answer: string }[];
    };
}

const STEPS: WizardStep[] = [
    { id: 'greeting', title: 'Приветствие', icon: Sparkles },
    { id: 'services', title: 'Услуги', icon: FileText },
    { id: 'schedule', title: 'График', icon: Clock },
    { id: 'faq', title: 'FAQ', icon: HelpCircle },
    { id: 'done', title: 'Готово', icon: Rocket },
];

const DEFAULT_DAYS = [
    { day: 'Пн', enabled: true, from: '10:00', to: '20:00' },
    { day: 'Вт', enabled: true, from: '10:00', to: '20:00' },
    { day: 'Ср', enabled: true, from: '10:00', to: '20:00' },
    { day: 'Чт', enabled: true, from: '10:00', to: '20:00' },
    { day: 'Пт', enabled: true, from: '10:00', to: '20:00' },
    { day: 'Сб', enabled: true, from: '10:00', to: '18:00' },
    { day: 'Вс', enabled: false, from: '10:00', to: '18:00' },
];

interface Props {
    botId: string;
    botName: string;
    onComplete: () => void;
    initialData?: Partial<WizardData>;
}

export default function BotSetupWizard({ botId, botName, onComplete, initialData }: Props) {
    const [step, setStep] = useState(0);
    const [saving, setSaving] = useState(false);
    const [data, setData] = useState<WizardData>({
        greeting: {
            mode: initialData?.greeting?.mode || 'ai',
            text: initialData?.greeting?.text || `Привет! Я бот ${botName}. Чем могу помочь?`,
        },
        services: {
            mode: initialData?.services?.mode || 'template',
            items: initialData?.services?.items || [{ name: '', price: 0 }],
        },
        schedule: {
            mode: initialData?.schedule?.mode || 'template',
            days: initialData?.schedule?.days || DEFAULT_DAYS,
        },
        faq: {
            mode: initialData?.faq?.mode || 'ai',
            items: initialData?.faq?.items || [{ question: '', answer: '' }],
        },
    });

    const currentStep = STEPS[step];
    const isLastStep = step === STEPS.length - 1;

    const handleSave = async () => {
        setSaving(true);
        try {
            await fetch(`/api/bots/${botId}/sections`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            onComplete();
        } catch (error) {
            console.error('Failed to save:', error);
        } finally {
            setSaving(false);
        }
    };

    const updateGreeting = (updates: Partial<WizardData['greeting']>) => {
        setData(prev => ({ ...prev, greeting: { ...prev.greeting, ...updates } }));
    };

    const updateServices = (updates: Partial<WizardData['services']>) => {
        setData(prev => ({ ...prev, services: { ...prev.services, ...updates } }));
    };

    const updateSchedule = (updates: Partial<WizardData['schedule']>) => {
        setData(prev => ({ ...prev, schedule: { ...prev.schedule, ...updates } }));
    };

    const updateFaq = (updates: Partial<WizardData['faq']>) => {
        setData(prev => ({ ...prev, faq: { ...prev.faq, ...updates } }));
    };

    return (
        <div className="max-w-2xl mx-auto">
            {/* Progress */}
            <div className="flex items-center gap-2 mb-8">
                {STEPS.map((s, i) => (
                    <div key={s.id} className="flex items-center">
                        <button
                            onClick={() => i < step && setStep(i)}
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${i < step
                                    ? 'bg-emerald-500 text-white cursor-pointer'
                                    : i === step
                                        ? 'bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500'
                                        : 'bg-white/[0.04] text-gray-600'
                                }`}
                        >
                            {i < step ? <Check className="w-4 h-4" /> : i + 1}
                        </button>
                        {i < STEPS.length - 1 && (
                            <div className={`w-8 h-0.5 mx-1 ${i < step ? 'bg-emerald-500' : 'bg-white/[0.08]'}`} />
                        )}
                    </div>
                ))}
            </div>

            {/* Step Title */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <currentStep.icon className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                    <h2 className="text-xl font-semibold text-white">{currentStep.title}</h2>
                    <p className="text-sm text-gray-500">Шаг {step + 1} из {STEPS.length}</p>
                </div>
            </div>

            {/* Step Content */}
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] mb-6">
                {step === 0 && (
                    <GreetingStep
                        data={data.greeting}
                        onChange={updateGreeting}
                    />
                )}
                {step === 1 && (
                    <ServicesStep
                        data={data.services}
                        onChange={updateServices}
                    />
                )}
                {step === 2 && (
                    <ScheduleStep
                        data={data.schedule}
                        onChange={updateSchedule}
                    />
                )}
                {step === 3 && (
                    <FaqStep
                        data={data.faq}
                        onChange={updateFaq}
                    />
                )}
                {step === 4 && (
                    <DoneStep data={data} />
                )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => setStep(prev => prev - 1)}
                    disabled={step === 0}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Назад
                </button>

                {isLastStep ? (
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium disabled:opacity-50"
                    >
                        {saving ? 'Сохранение...' : 'Запустить бота'}
                        <Rocket className="w-4 h-4" />
                    </button>
                ) : (
                    <button
                        onClick={() => setStep(prev => prev + 1)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white text-sm font-medium"
                    >
                        Далее
                        <ChevronRight className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );
}

// Mode Toggle Component
function ModeToggle({ mode, onChange }: { mode: 'ai' | 'template'; onChange: (mode: 'ai' | 'template') => void }) {
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

// Step 1: Greeting
function GreetingStep({ data, onChange }: { data: WizardData['greeting']; onChange: (updates: Partial<WizardData['greeting']>) => void }) {
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
function ServicesStep({ data, onChange }: { data: WizardData['services']; onChange: (updates: Partial<WizardData['services']>) => void }) {
    const addService = () => {
        onChange({ items: [...data.items, { name: '', price: 0 }] });
    };

    const updateService = (index: number, updates: Partial<{ name: string; price: number }>) => {
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
function ScheduleStep({ data, onChange }: { data: WizardData['schedule']; onChange: (updates: Partial<WizardData['schedule']>) => void }) {
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
function FaqStep({ data, onChange }: { data: WizardData['faq']; onChange: (updates: Partial<WizardData['faq']>) => void }) {
    const addFaq = () => {
        onChange({ items: [...data.items, { question: '', answer: '' }] });
    };

    const updateFaq = (index: number, updates: Partial<{ question: string; answer: string }>) => {
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

// Step 5: Done
function DoneStep({ data }: { data: WizardData }) {
    const servicesCount = data.services.items.filter(s => s.name).length;
    const faqCount = data.faq.items.filter(f => f.question).length;
    const workDays = data.schedule.days.filter(d => d.enabled).map(d => d.day).join(', ');

    return (
        <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <Rocket className="w-8 h-8 text-emerald-400" />
            </div>
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
