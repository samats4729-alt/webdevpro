"use client";

import { useState } from "react";
import { Sparkles, FileText, Clock, HelpCircle, Plus, Settings } from "lucide-react";
import BotSetupWizard from "./BotSetupWizard";

interface SectionData {
    greeting: { mode: 'ai' | 'template'; text: string };
    services: { mode: 'ai' | 'template'; items: { name: string; price: number }[] };
    schedule: { mode: 'ai' | 'template'; days: { day: string; enabled: boolean; from: string; to: string }[] };
    faq: { mode: 'ai' | 'template'; items: { question: string; answer: string }[] };
}

interface Props {
    botId: string;
    botName: string;
    initialData?: SectionData;
}

const SECTIONS = [
    { id: 'greeting', title: 'Приветствие', icon: Sparkles, color: 'emerald' },
    { id: 'services', title: 'Услуги', icon: FileText, color: 'blue' },
    { id: 'schedule', title: 'График', icon: Clock, color: 'purple' },
    { id: 'faq', title: 'FAQ', icon: HelpCircle, color: 'amber' },
];

export default function BotSectionsPanel({ botId, botName, initialData }: Props) {
    const [editingSection, setEditingSection] = useState<string | null>(null);
    const [data, setData] = useState<SectionData | null>(initialData || null);
    const [showWizard, setShowWizard] = useState(!initialData);

    const getSectionSummary = (sectionId: string): string => {
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
        // Reload data
        try {
            const res = await fetch(`/api/bots/${botId}/sections`);
            if (res.ok) {
                const newData = await res.json();
                setData(newData);
            }
        } catch (e) { }
        setShowWizard(false);
    };

    if (showWizard) {
        return (
            <BotSetupWizard
                botId={botId}
                botName={botName}
                onComplete={handleWizardComplete}
                initialData={data || undefined}
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
                    const isConfigured = data && (data as any)[section.id];

                    return (
                        <button
                            key={section.id}
                            onClick={() => setEditingSection(section.id)}
                            className={`p-4 rounded-2xl border text-left transition-all hover:scale-[1.02] ${isConfigured
                                    ? 'bg-white/[0.03] border-white/[0.08] hover:border-white/[0.15]'
                                    : 'bg-white/[0.02] border-dashed border-white/[0.1] hover:border-white/[0.2]'
                                }`}
                        >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${section.color === 'emerald' ? 'bg-emerald-500/20' :
                                    section.color === 'blue' ? 'bg-blue-500/20' :
                                        section.color === 'purple' ? 'bg-purple-500/20' :
                                            'bg-amber-500/20'
                                }`}>
                                <Icon className={`w-5 h-5 ${section.color === 'emerald' ? 'text-emerald-400' :
                                        section.color === 'blue' ? 'text-blue-400' :
                                            section.color === 'purple' ? 'text-purple-400' :
                                                'text-amber-400'
                                    }`} />
                            </div>
                            <h3 className="font-medium text-white text-sm mb-1">{section.title}</h3>
                            <p className="text-xs text-gray-500">{getSectionSummary(section.id)}</p>
                        </button>
                    );
                })}
            </div>

            {/* Section Edit Modal - TODO: later */}
        </div>
    );
}
