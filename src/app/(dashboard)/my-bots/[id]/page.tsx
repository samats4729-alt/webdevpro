"use client";

import { useState, useEffect } from "react";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { Bot, ArrowLeft, Workflow, BarChart3, MessageCircle, Loader2, Save, Check, Send, Package, Settings } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import WhatsAppConnector from "@/components/whatsapp/WhatsAppConnector";
import TelegramConnector from "@/components/telegram/TelegramConnector";
import CatalogTab from "@/components/bot/CatalogTab";
import { EmulatorWindow, EmulatorTrigger } from "@/components/bot/EmulatorWindow";
import BotSectionsPanel from "@/components/bot/BotSectionsPanel";

interface BotData {
    id: string;
    name: string;
    welcome_message: string;
    auto_reply_enabled: boolean;
    auto_reply_message: string;
    ai_enabled?: boolean;
    ai_system_prompt?: string;
    ai_model?: string;
    ai_temperature?: number;
}

export default function BotDetailPage({ params }: { params: { id: string } }) {
    const searchParams = useSearchParams();
    const initialTab = searchParams.get('tab') as any || 'whatsapp';
    const isWizardMode = searchParams.get('wizard') === 'true';

    // Validate tab
    const validTabs = ['overview', 'settings', 'flows', 'whatsapp', 'telegram', 'catalog'];
    const [activeTab, setActiveTab] = useState<'overview' | 'settings' | 'flows' | 'whatsapp' | 'telegram' | 'catalog'>(
        validTabs.includes(initialTab) ? initialTab : 'settings'
    );
    const [bot, setBot] = useState<BotData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEmulatorOpen, setIsEmulatorOpen] = useState(false);

    useEffect(() => {
        fetchBot();
    }, [params.id]);

    // Optional: Sync URL when tab changes (good UX but not strictly required for this fix)
    // I'll skip verify sync for now to keep it simple, just want deep link to work.


    const fetchBot = async () => {
        try {
            const res = await fetch(`/api/bots/${params.id}`);
            if (res.ok) {
                const data = await res.json();
                setBot(data);
            }
        } catch (error) {
            console.error('Failed to fetch bot:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <PageContainer>
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 text-accent animate-spin" />
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            {/* Back Button & Header */}
            <div className="flex items-center gap-3 mb-4">
                <Link href="/my-bots" className="text-gray-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                </Link>
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent to-green-600 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-black" />
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold text-white">{bot?.name || 'Bot'}</h1>
                        <span className="text-[10px] text-gray-500">WhatsApp Bot</span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 border-b border-white/[0.08] mb-5">
                <TabButton
                    icon={BarChart3}
                    label="Overview"
                    active={activeTab === 'overview'}
                    onClick={() => setActiveTab('overview')}
                />
                <TabButton
                    icon={Settings}
                    label="Настройки"
                    active={activeTab === 'settings'}
                    onClick={() => setActiveTab('settings')}
                />
                <TabButton
                    icon={Workflow}
                    label="Flows"
                    active={activeTab === 'flows'}
                    onClick={() => setActiveTab('flows')}
                />
                <TabButton
                    icon={MessageCircle}
                    label="WhatsApp"
                    active={activeTab === 'whatsapp'}
                    onClick={() => setActiveTab('whatsapp')}
                />
                <TabButton
                    icon={Send}
                    label="Telegram"
                    active={activeTab === 'telegram'}
                    onClick={() => setActiveTab('telegram')}
                />
                <TabButton
                    icon={Package}
                    label="Каталог"
                    active={activeTab === 'catalog'}
                    onClick={() => setActiveTab('catalog')}
                />
            </div>

            {activeTab === 'overview' && <OverviewTab />}
            {activeTab === 'settings' && bot && <BotSectionsPanel botId={params.id} botName={bot.name} />}
            {activeTab === 'flows' && <FlowsTab botId={params.id} />}
            {activeTab === 'whatsapp' && <WhatsAppConnector botId={params.id} />}
            {activeTab === 'telegram' && <TelegramConnector botId={params.id} />}
            {activeTab === 'catalog' && <CatalogTab botId={params.id} />}

            {!isWizardMode && (
                <>
                    <EmulatorTrigger onClick={() => setIsEmulatorOpen(true)} />
                    <EmulatorWindow
                        botId={params.id}
                        botName={bot?.name || 'Bot'}
                        isOpen={isEmulatorOpen}
                        onClose={() => setIsEmulatorOpen(false)}
                    />
                </>
            )}
        </PageContainer>
    );
}

function TabButton({ icon: Icon, label, active, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs border-b-2 transition-colors ${active
                ? 'border-accent text-accent font-medium'
                : 'border-transparent text-gray-500 hover:text-gray-300'
                }`}
        >
            <Icon className="w-3.5 h-3.5" />
            {label}
        </button>
    );
}

function OverviewTab() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="dark-card p-4">
                <div className="text-xs text-gray-500 mb-1">Messages Today</div>
                <div className="text-2xl font-bold text-white">0</div>
            </div>
            <div className="dark-card p-4">
                <div className="text-xs text-gray-500 mb-1">Avg Response Time</div>
                <div className="text-2xl font-bold text-white">--</div>
            </div>
            <div className="dark-card p-4">
                <div className="text-xs text-gray-500 mb-1">Auto-replies sent</div>
                <div className="text-2xl font-bold text-white">0</div>
            </div>
        </div>
    );
}

import VisualFlowEditor from "@/components/flow-builder/VisualFlowEditor";
import { Plus, Trash2, Edit2, HelpCircle, DollarSign, Info } from 'lucide-react';

function FlowsTab({ botId }: { botId: string }) {
    return <VisualFlowEditor botId={botId} />;
}



// AI Settings Tab



