"use client";

import { useEffect, useState } from "react";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { Plus, Loader2, MessageSquare, Trash2 } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n";

interface BotData {
    id: string;
    name: string;
    description?: string;
    created_at: string;
    status: 'online' | 'offline';
}

export default function MyBotsPage() {
    const [bots, setBots] = useState<BotData[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const router = useRouter();
    const supabase = createClient();
    const { t } = useLanguage();

    useEffect(() => {
        fetchBots();
        // Poll for status updates every 5 seconds
        const interval = setInterval(fetchBots, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchBots = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data } = await supabase
                .from('bots')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (data) setBots(data as BotData[]);
        }
        setLoading(false);
    };

    const handleCreateBot = async () => {
        setCreating(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('bots')
                .insert([
                    {
                        user_id: user.id,
                        name: 'My New Bot',
                        platform: 'whatsapp',
                        status: 'offline'
                    }
                ])
                .select()
                .single();

            if (error) {
                console.error('Supabase error:', error);
                alert(`Error creating bot: ${error.message}`);
                return;
            }

            if (data) {
                // Create default flow
                const defaultRules = [
                    {
                        id: crypto.randomUUID(),
                        trigger: { type: 'contains', value: 'привет' },
                        action: { type: 'reply', message: 'Привет! Чем могу помочь?' },
                        enabled: true
                    },
                    {
                        id: crypto.randomUUID(),
                        trigger: { type: 'contains', value: 'цена' },
                        action: { type: 'reply', message: 'Для уточнения цен, пожалуйста, опишите что вас интересует.' },
                        enabled: true
                    }
                ];

                await supabase
                    .from('flows')
                    .insert([{
                        bot_id: data.id,
                        name: 'Основной сценарий',
                        nodes: defaultRules
                    }]);

                router.push(`/my-bots/${data.id}?tab=settings&wizard=true`);
            }
        } catch (error: any) {
            console.error('Error creating bot:', error);
            alert(`Error creating bot: ${error.message}`);
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteBot = async (e: React.MouseEvent, botId: string, botName: string) => {
        e.preventDefault(); // Prevent Link navigation
        e.stopPropagation();

        if (!confirm(t.bots.confirmDelete)) {
            return;
        }

        try {
            const res = await fetch(`/api/bots/${botId}`, {
                method: 'DELETE'
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to delete bot');
            }

            // Remove from local state
            setBots(bots.filter(b => b.id !== botId));
        } catch (error: any) {
            console.error('Error deleting bot:', error);
            alert(`Error deleting bot: ${error.message}`);
        }
    };

    return (
        <PageContainer>
            <PageHeader
                title={t.bots.myBots}
                description="Manage your AI assistants and their connection status."
            >
                <button
                    onClick={handleCreateBot}
                    disabled={creating}
                    className="btn-primary flex items-center gap-2 text-sm px-4 py-2"
                >
                    {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    {t.bots.newBot}
                </button>
            </PageHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-2">
                {loading ? (
                    <div className="col-span-full flex justify-center py-8">
                        <Loader2 className="w-6 h-6 text-accent animate-spin" />
                    </div>
                ) : bots.length > 0 ? (
                    bots.map((bot, index) => {
                        // Premium gradient themes
                        const themes = [
                            {
                                gradient: "from-emerald-500/20 via-cyan-500/10 to-transparent",
                                accent: "#10b981",
                                glow: "shadow-emerald-500/20",
                                ring: "ring-emerald-500/30"
                            },
                            {
                                gradient: "from-violet-500/20 via-purple-500/10 to-transparent",
                                accent: "#8b5cf6",
                                glow: "shadow-violet-500/20",
                                ring: "ring-violet-500/30"
                            },
                            {
                                gradient: "from-amber-500/20 via-orange-500/10 to-transparent",
                                accent: "#f59e0b",
                                glow: "shadow-amber-500/20",
                                ring: "ring-amber-500/30"
                            },
                            {
                                gradient: "from-rose-500/20 via-pink-500/10 to-transparent",
                                accent: "#f43f5e",
                                glow: "shadow-rose-500/20",
                                ring: "ring-rose-500/30"
                            },
                            {
                                gradient: "from-cyan-500/20 via-blue-500/10 to-transparent",
                                accent: "#06b6d4",
                                glow: "shadow-cyan-500/20",
                                ring: "ring-cyan-500/30"
                            }
                        ];

                        const theme = themes[index % themes.length];
                        const isConnected = bot.status === 'online';

                        return (
                            <Link
                                key={bot.id}
                                href={`/my-bots/${bot.id}`}
                                className="block group relative"
                            >
                                {/* Glow effect */}
                                <div
                                    className={`absolute -inset-0.5 rounded-2xl bg-gradient-to-r ${theme.gradient} opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500`}
                                    style={{ background: isConnected ? `linear-gradient(135deg, ${theme.accent}20, transparent)` : 'transparent' }}
                                />

                                {/* Card */}
                                <div className={`
                                    relative h-full min-h-[220px]
                                    bg-gradient-to-br from-white/[0.08] to-white/[0.02]
                                    backdrop-blur-xl
                                    border border-white/10
                                    rounded-2xl
                                    p-6
                                    transition-all duration-300
                                    group-hover:border-white/20
                                    group-hover:translate-y-[-4px]
                                    group-hover:shadow-2xl
                                    ${isConnected ? theme.glow : ''}
                                    overflow-hidden
                                `}>
                                    {/* Decorative gradient orb */}
                                    <div
                                        className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-30 blur-3xl transition-opacity duration-500 group-hover:opacity-50"
                                        style={{ background: `radial-gradient(circle, ${theme.accent}, transparent 70%)` }}
                                    />

                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-4 relative z-10">
                                        {/* Icon */}
                                        <div
                                            className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                                            style={{
                                                background: `linear-gradient(135deg, ${theme.accent}30, ${theme.accent}10)`,
                                                boxShadow: isConnected ? `0 4px 20px ${theme.accent}30` : 'none'
                                            }}
                                        >
                                            <MessageSquare className="w-5 h-5" style={{ color: theme.accent }} />
                                        </div>

                                        {/* Status & Actions */}
                                        <div className="flex items-center gap-2">
                                            {/* Status pill */}
                                            <div className={`
                                                px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide
                                                flex items-center gap-1.5
                                                ${isConnected
                                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                                    : 'bg-white/5 text-gray-500 border border-white/10'
                                                }
                                            `}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'}`} />
                                                {isConnected ? 'ACTIVE' : 'OFFLINE'}
                                            </div>

                                            {/* Delete button */}
                                            <button
                                                onClick={(e) => handleDeleteBot(e, bot.id, bot.name)}
                                                className="
                                                    p-1.5 rounded-lg
                                                    bg-white/5 border border-white/10
                                                    text-gray-500
                                                    opacity-0 group-hover:opacity-100
                                                    hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30
                                                    transition-all duration-200
                                                "
                                                title="Delete Bot"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="relative z-10 flex-1">
                                        <h3 className="text-lg font-bold text-white mb-2 line-clamp-1 group-hover:text-white/90 transition-colors">
                                            {bot.name}
                                        </h3>
                                        <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                                            {bot.description || 'AI-powered assistant ready to handle customer conversations.'}
                                        </p>
                                    </div>

                                    {/* Footer */}
                                    <div className="mt-6 flex justify-between items-center relative z-10">
                                        <div className="text-[10px] text-gray-500 font-medium">
                                            Created {new Date(bot.created_at).toLocaleDateString('ru-RU')}
                                        </div>

                                        {/* Arrow button */}
                                        <div
                                            className="
                                                w-8 h-8 rounded-full
                                                flex items-center justify-center
                                                bg-white/5 border border-white/10
                                                group-hover:bg-white/10 group-hover:border-white/20
                                                transition-all duration-300
                                                group-hover:translate-x-1
                                            "
                                        >
                                            <svg className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>

                                    {/* Bottom accent line */}
                                    <div
                                        className="absolute bottom-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                        style={{ background: `linear-gradient(90deg, transparent, ${theme.accent}, transparent)` }}
                                    />
                                </div>
                            </Link>
                        );
                    })
                ) : (
                    <div className="col-span-full text-center py-12 text-gray-500">
                        {t.bots.noBots}
                    </div>
                )}

                <div
                    onClick={handleCreateBot}
                    className="min-h-[220px] cursor-pointer group relative"
                >
                    {/* Animated gradient border on hover */}
                    <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-accent/50 via-purple-500/30 to-accent/50 opacity-0 group-hover:opacity-100 blur transition-all duration-500" />

                    <div className="
                        relative h-full min-h-[220px]
                        bg-gradient-to-br from-white/[0.05] to-transparent
                        backdrop-blur-xl
                        border border-dashed border-white/20
                        rounded-2xl
                        p-6
                        flex flex-col items-center justify-center text-center
                        transition-all duration-300
                        group-hover:border-white/30
                        group-hover:bg-white/[0.08]
                        group-hover:translate-y-[-4px]
                        overflow-hidden
                    ">
                        {/* Decorative orb */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-accent/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="
                            w-14 h-14 rounded-2xl
                            bg-gradient-to-br from-accent/20 to-accent/5
                            border border-accent/20
                            flex items-center justify-center mb-4
                            group-hover:scale-110 group-hover:border-accent/40
                            transition-all duration-300
                            relative z-10
                        ">
                            <Plus className="w-6 h-6 text-accent" />
                        </div>
                        <h3 className="font-bold text-white text-base relative z-10">{t.bots.newBot}</h3>
                        <p className="text-xs text-gray-500 mt-2 max-w-[140px] relative z-10">
                            {t.bots.createBot}
                        </p>
                    </div>
                </div>
            </div>
        </PageContainer>
    );
}
