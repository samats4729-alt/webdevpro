"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Sparkles, FileText, Clock, HelpCircle, Plus, Settings, Loader2, X, Save } from "lucide-react";
import BotSetupWizard from "./BotSetupWizard";
import { GreetingStep, ServicesStep, ScheduleStep, FaqStep, PhonePreview, BotSettingsStep } from "./BotWizardSteps";

interface SectionData {
    greeting: {
        mode: 'ai' | 'template';
        text: string;
        trigger?: string;
        keywords?: string[];
        media?: string;
        ai_style?: string;
    };
    services: {
        mode: 'ai' | 'template';
        items: { name: string; price: number; category?: string; description?: string; image?: string }[];
        ai_prompt?: string;
    };
    schedule: { mode: 'ai' | 'template'; days: { day: string; enabled: boolean; from: string; to: string }[] };
    faq: { mode: 'ai' | 'template'; items: { question: string; answer: string }[] };
}

interface Props {
    botId: string;
    botName: string;
    platform?: string;
    description?: string;
}

const SECTIONS = [
    { id: 'settings', title: 'О боте', icon: Settings, color: 'gray' },
    { id: 'greeting', title: 'Приветствие', icon: Sparkles, color: 'emerald' },
    { id: 'services', title: 'Услуги', icon: FileText, color: 'blue' },
    { id: 'schedule', title: 'График', icon: Clock, color: 'purple' },
    { id: 'faq', title: 'FAQ', icon: HelpCircle, color: 'amber' },
];

export default function BotSectionsPanel({ botId, botName, platform, description }: Props) {
    const searchParams = useSearchParams();
    const isNewBot = searchParams.get('wizard') === 'true';

    const [editingSection, setEditingSection] = useState<string | null>(null);
    const [data, setData] = useState<SectionData | null>(null);
    const [loading, setLoading] = useState(true);
    const [showWizard, setShowWizard] = useState(false);
    const [saving, setSaving] = useState(false);

    // Initial data for edit modal (to support canceling changes)
    const [editData, setEditData] = useState<any | null>(null);

    // Load sections on mount
    useEffect(() => {
        loadSections();
    }, [botId]);

    const loadSections = async () => {
        try {
            const res = await fetch(`/api/bots/${botId}/sections`);
            if (res.ok) {
                const existingData = await res.json();
                if (existingData) {
                    setData(existingData);
                    setShowWizard(false);
                } else {
                    // No data - show wizard for new bots
                    setShowWizard(true);
                }
            } else {
                setShowWizard(true);
            }
        } catch (e) {
            setShowWizard(true);
        } finally {
            setLoading(false);
        }
    };

    // Force wizard for new bots
    useEffect(() => {
        if (isNewBot && !loading) {
            setShowWizard(true);
        }
    }, [isNewBot, loading]);

    const getSectionSummary = (sectionId: string): string => {
        if (sectionId === 'settings') {
            return `${botName} (${platform || 'whatsapp'})`;
        }

        if (!data) return 'Не настроено';

        switch (sectionId) {
            case 'greeting':
                return data.greeting.mode === 'ai' ? '🤖 ИИ' : '📝 Шаблон';
            case 'services':
                if (data.services.mode === 'ai') return '🤖 ИИ';
                const count = data.services.items.filter(s => s.name).length;
                return `${count} услуг`;
            case 'schedule':
                if (data.schedule.mode === 'ai') return '🤖 ИИ';
                const days = data.schedule.days.filter(d => d.enabled).length;
                return `${days} дней`;
            case 'faq':
                if (data.faq.mode === 'ai') return '🤖 ИИ';
                const faqCount = data.faq.items.filter(f => f.question).length;
                return `${faqCount} вопросов`;
            default:
                return '';
        }
    };

    const handleWizardComplete = async () => {
        // Reload page to reflect name/platform changes
        window.location.reload();
    };

    const openEditModal = (sectionId: string) => {
        setEditingSection(sectionId);
        if (sectionId === 'settings') {
            setEditData({
                name: botName,
                platforms: [platform || 'whatsapp'], // Convert single platform to array
                description: description || ''
            });
        } else {
            // Ensure greeting fields exist if not present in legacy data
            const currentData = JSON.parse(JSON.stringify(data));
            if (currentData.greeting && !currentData.greeting.trigger) {
                currentData.greeting.trigger = 'all';
                currentData.greeting.keywords = [];
                currentData.greeting.media = null;
                currentData.greeting.ai_style = null;
            }
            if (currentData.services && !currentData.services.items[0]?.category) {
                // Migration for legacy services
                currentData.services.items = currentData.services.items.map((item: any) => ({
                    ...item,
                    category: item.category || 'Общее',
                    description: item.description || '',
                    image: item.image || null
                }));
                currentData.services.ai_prompt = null;
            }
            setEditData(currentData);
        }
    };

    const closeEditModal = () => {
        setEditingSection(null);
        setEditData(null);
    };

    const handleSaveSection = async () => {
        if (!editData) return;
        setSaving(true);
        try {
            if (editingSection === 'settings') {
                const primaryPlatform = (editData.platforms && editData.platforms.length > 0)
                    ? editData.platforms[0]
                    : 'whatsapp';

                await fetch(`/api/bots/${botId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: editData.name,
                        platform: primaryPlatform, // Send primary platform
                        description: editData.description
                    }),
                });
                window.location.reload(); // Reload to update bot name/platform in header
            } else {
                await fetch(`/api/bots/${botId}/sections`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(editData),
                });
                setData(editData);
                setEditingSection(null);
            }
        } catch (error) {
            console.error('Failed to save:', error);
        } finally {
            setSaving(false);
        }
    };

    const updateEditData = (section: string, updates: any) => {
        if (!editData) return;

        if (editingSection === 'settings') {
            setEditData({ ...editData, ...updates });
        } else {
            setEditData({
                ...editData,
                [section]: { ...editData[section as keyof SectionData], ...updates }
            });
        }
    };

    // Generate preview message
    const getPreviewMessage = (): string => {
        if (!editData || !editingSection) return '';

        if (editingSection === 'settings') {
            const platforms = editData.platforms ? editData.platforms.join(', ') : '';
            return `Привет! Я ${editData.name}. \nПлатформы: ${platforms}\n${editData.description}`;
        }

        // Cast editData to SectionData for the following sections
        const data = editData as SectionData;
        const section = editingSection as keyof SectionData;

        switch (section) {
            case 'greeting':
                const triggerInfo = data.greeting.trigger === 'keyword'
                    ? `(По словам: ${data.greeting.keywords?.join(', ')})`
                    : data.greeting.trigger === 'start' ? '(По кнопке Старт)' : '';

                if (data.greeting.mode === 'ai') {
                    return `🤖 Привет! Я ваш ИИ-ассистент ${botName}. ${triggerInfo}\nЧем могу помочь сегодня?`;
                }
                return `${data.greeting.text || 'Введите приветствие...'}\n${triggerInfo}`;
            case 'services':
                if (data.services.mode === 'ai') {
                    return '🤖 Расскажу о наших услугах! Вот что мы предлагаем...';
                }
                const services = (data.services.items || []).filter((s) => s.name);
                if (services.length === 0) return 'Добавьте услуги...';

                // Group by category if present
                const hasCategories = services.some(s => s.category);
                if (hasCategories) {
                    const categories = Array.from(new Set(services.map(s => s.category || 'Общее')));
                    return `💰 Наши услуги:\n\n${categories.map(cat => {
                        const catServices = services.filter(s => (s.category || 'Общее') === cat);
                        return `*${cat}*\n${catServices.map(s => `• ${s.name} — ${s.price}₸`).join('\n')}`;
                    }).join('\n\n')}`;
                }

                return `💰 Наши услуги:\n${services.map((s) => `• ${s.name} — ${s.price}₸`).join('\n')}`;
            case 'schedule':
                if (data.schedule.mode === 'ai') {
                    return '🤖 Мы работаем по удобному графику. Когда вам удобно?';
                }
                const workDays = (data.schedule.days || []).filter((d) => d.enabled);
                if (workDays.length === 0) return 'Укажите рабочие дни...';
                return `📅 График работы:\n${workDays.map((d) => `• ${d.day}: ${d.from} - ${d.to}`).join('\n')}`;
            case 'faq':
                if (data.faq.mode === 'ai') {
                    return '🤖 Отвечу на любые ваши вопросы!';
                }
                const faqs = (data.faq.items || []).filter((f) => f.question);
                if (faqs.length === 0) return 'Добавьте частые вопросы...';
                return faqs[0].answer || 'Введите ответ...';
            default:
                return '';
        }
    };


    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            </div>
        );
    }

    if (showWizard) {
        return (
            <BotSetupWizard
                botId={botId}
                botName={botName}
                onComplete={handleWizardComplete}
                initialData={{
                    ...data,
                    settings: {
                        name: botName,
                        platforms: [platform || 'whatsapp'],
                        description: description || ''
                    }
                }}
            />
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-lg font-semibold text-white">Настройки бота</h2>
                    <p className="text-sm text-gray-500">Нажмите на секцию чтобы изменить</p>
                </div>
                <button
                    onClick={() => setShowWizard(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-sm text-gray-400 hover:text-white transition-colors"
                >
                    <Settings className="w-4 h-4" />
                    Мастер настройки
                </button>
            </div>

            {/* Sections Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {SECTIONS.map((section) => {
                    const Icon = section.icon;
                    // For settings, it's always configured. For others, check data.
                    const isConfigured = section.id === 'settings' || (data && (data as any)[section.id]);

                    return (
                        <button
                            key={section.id}
                            onClick={() => openEditModal(section.id)}
                            className={`p-4 rounded-2xl border text-left transition-all hover:scale-[1.02] ${isConfigured
                                ? 'bg-white/[0.03] border-white/[0.08] hover:border-white/[0.15]'
                                : 'bg-white/[0.02] border-dashed border-white/[0.1] hover:border-white/[0.2]'
                                }`}
                        >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${section.color === 'emerald' ? 'bg-emerald-500/20' :
                                section.color === 'blue' ? 'bg-blue-500/20' :
                                    section.color === 'purple' ? 'bg-purple-500/20' :
                                        section.color === 'amber' ? 'bg-amber-500/20' :
                                            'bg-white/10'
                                }`}>
                                <Icon className={`w-5 h-5 ${section.color === 'emerald' ? 'text-emerald-400' :
                                    section.color === 'blue' ? 'text-blue-400' :
                                        section.color === 'purple' ? 'text-purple-400' :
                                            section.color === 'amber' ? 'text-amber-400' :
                                                'text-white'
                                    }`} />
                            </div>
                            <h3 className="font-medium text-white text-sm mb-1">{section.title}</h3>
                            <p className="text-xs text-gray-500">{getSectionSummary(section.id)}</p>
                        </button>
                    );
                })}
            </div>

            {/* Edit Modal */}
            {editingSection && editData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl w-full max-w-5xl h-[85vh] flex overflow-hidden shadow-2xl">

                        {/* Left: Settings */}
                        <div className="flex-1 flex flex-col min-w-0 border-r border-white/10">
                            <div className="p-6 border-b border-white/10 flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-white">
                                    {SECTIONS.find(s => s.id === editingSection)?.title}
                                </h3>
                                <button onClick={closeEditModal} className="text-gray-400 hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6">
                                {editingSection === 'settings' && (
                                    <BotSettingsStep
                                        data={editData}
                                        onChange={(updates) => updateEditData('settings', updates)}
                                    />
                                )}
                                {editingSection === 'greeting' && (
                                    <GreetingStep
                                        data={editData.greeting}
                                        onChange={(updates) => updateEditData('greeting', updates)}
                                        botName={botName}
                                    />
                                )}
                                {editingSection === 'services' && (
                                    <ServicesStep
                                        data={editData.services}
                                        onChange={(updates) => updateEditData('services', updates)}
                                    />
                                )}
                                {editingSection === 'schedule' && (
                                    <ScheduleStep
                                        data={editData.schedule}
                                        onChange={(updates) => updateEditData('schedule', updates)}
                                    />
                                )}
                                {editingSection === 'faq' && (
                                    <FaqStep
                                        data={editData.faq}
                                        onChange={(updates) => updateEditData('faq', updates)}
                                    />
                                )}
                            </div>

                            <div className="p-6 border-t border-white/10 flex justify-end gap-3">
                                <button
                                    onClick={closeEditModal}
                                    className="px-4 py-2 text-sm text-gray-400 hover:text-white"
                                >
                                    Отмена
                                </button>
                                <button
                                    onClick={handleSaveSection}
                                    disabled={saving}
                                    className="flex items-center gap-2 px-6 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium disabled:opacity-50"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Сохранить
                                </button>
                            </div>
                        </div>

                        {/* Right: Preview */}
                        <div className="w-[360px] bg-[#111] p-8 hidden lg:flex flex-col items-center justify-center bg-[url('/grid-pattern.svg')]">
                            <div className="mb-6 text-center">
                                <h4 className="text-white font-medium mb-1">Live Preview</h4>
                                <p className="text-xs text-gray-500">Как это видит клиент</p>
                            </div>
                            <PhonePreview message={getPreviewMessage()} botName={editData.name || botName} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
