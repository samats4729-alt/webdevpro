"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Check, Sparkles, FileText, Clock, HelpCircle, Rocket, Settings } from "lucide-react";
import { GreetingStep, ServicesStep, ScheduleStep, FaqStep, DoneStep, PhonePreview, BotSettingsStep } from "./BotWizardSteps";

interface WizardStep {
    id: string;
    title: string;
    icon: any;
}

interface WizardData {
    settings: {
        name: string;
        platform: string;
        description: string;
    };
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
    { id: 'settings', title: 'О боте', icon: Settings },
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
        settings: {
            name: botName,
            platform: 'whatsapp',
            description: '',
        },
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
            // 1. Save sections
            await fetch(`/api/bots/${botId}/sections`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    greeting: data.greeting,
                    services: data.services,
                    schedule: data.schedule,
                    faq: data.faq
                }),
            });

            // 2. Update bot details (name, platform)
            await fetch(`/api/bots/${botId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: data.settings.name,
                    platform: data.settings.platform,
                    description: data.settings.description
                }),
            });

            onComplete();
        } catch (error) {
            console.error('Failed to save:', error);
        } finally {
            setSaving(false);
        }
    };

    const updateSettings = (updates: Partial<WizardData['settings']>) => {
        setData(prev => ({ ...prev, settings: { ...prev.settings, ...updates } }));
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

    // Generate preview message based on current step
    const getPreviewMessage = (): string => {
        switch (step) {
            case 0: // Settings
                return `Привет! Я ${data.settings.name}. \nПлатформа: ${data.settings.platform}\n${data.settings.description}`;
            case 1: // Greeting
                if (data.greeting.mode === 'ai') {
                    return `🤖 Привет! Я ваш ИИ-ассистент ${data.settings.name}. Чем могу помочь сегодня?`;
                }
                return data.greeting.text || 'Введите приветствие...';
            case 2: // Services
                if (data.services.mode === 'ai') {
                    return '🤖 Расскажу о наших услугах! Вот что мы предлагаем...';
                }
                const services = data.services.items.filter(s => s.name);
                if (services.length === 0) return 'Добавьте услуги...';
                return `💰 Наши услуги:\n${services.map(s => `• ${s.name} — ${s.price}₸`).join('\n')}`;
            case 3: // Schedule
                if (data.schedule.mode === 'ai') {
                    return '🤖 Мы работаем по удобному графику. Когда вам удобно?';
                }
                const workDays = data.schedule.days.filter(d => d.enabled);
                if (workDays.length === 0) return 'Укажите рабочие дни...';
                return `📅 График работы:\n${workDays.map(d => `• ${d.day}: ${d.from} - ${d.to}`).join('\n')}`;
            case 4: // FAQ
                if (data.faq.mode === 'ai') {
                    return '🤖 Отвечу на любые ваши вопросы!';
                }
                const faqs = data.faq.items.filter(f => f.question);
                if (faqs.length === 0) return 'Добавьте частые вопросы...';
                return faqs[0].answer || 'Введите ответ...';
            default:
                return `Привет! Я бот ${data.settings.name}. Рад вас видеть! 👋`;
        }
    };

    return (
        <div className="flex flex-col-reverse lg:grid lg:grid-cols-2 gap-8">
            {/* Left: Wizard Steps */}
            <div>
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
                        <BotSettingsStep
                            data={data.settings}
                            onChange={updateSettings}
                        />
                    )}
                    {step === 1 && (
                        <GreetingStep
                            data={data.greeting}
                            onChange={updateGreeting}
                        />
                    )}
                    {step === 2 && (
                        <ServicesStep
                            data={data.services}
                            onChange={updateServices}
                        />
                    )}
                    {step === 3 && (
                        <ScheduleStep
                            data={data.schedule}
                            onChange={updateSchedule}
                        />
                    )}
                    {step === 4 && (
                        <FaqStep
                            data={data.faq}
                            onChange={updateFaq}
                        />
                    )}
                    {step === 5 && (
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

            {/* Right: Phone Preview */}
            <div className="flex flex-col items-center justify-start pt-8">
                <div className="mb-4 text-center lg:hidden">
                    <p className="text-emerald-400 text-sm font-medium">Предпросмотр на телефоне ↓</p>
                </div>
                <PhonePreview message={getPreviewMessage()} botName={data.settings.name} />
                <p className="mt-4 text-xs text-gray-500 text-center max-w-xs">
                    * Это предпросмотр. Реальный бот обновится после нажатия "Запустить бота".
                </p>
            </div>
        </div>
    );
}
