"use client";
import PageContainer from "@/components/layout/PageContainer";
import { Bot, MessageSquare, Users, Calendar, Clock, ArrowUpRight, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

interface DashboardStats {
    activeBots: number;
    totalBots: number;
    totalLeads: number;
    messagesToday: number;
    appointmentsThisWeek: number;
    recentMessages: { content: string; direction: string; created_at: string; lead_name: string }[];
    upcomingAppointments: { client_name: string; start_time: string; service_name: string }[];
}

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [greeting, setGreeting] = useState("");

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting("Доброе утро");
        else if (hour < 18) setGreeting("Добрый день");
        else setGreeting("Добрый вечер");
    }, []);

    useEffect(() => {
        async function loadStats() {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setLoading(false);
                return;
            }

            const { data: bots } = await supabase
                .from('bots')
                .select('id, status')
                .eq('user_id', user.id);

            const botIds = bots?.map(b => b.id) || [];
            const activeBots = bots?.filter(b => b.status === 'online').length || 0;

            const { count: leadsCount } = await supabase
                .from('leads')
                .select('*', { count: 'exact', head: true })
                .in('bot_id', botIds.length > 0 ? botIds : ['00000000-0000-0000-0000-000000000000']);

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const { data: leads } = await supabase
                .from('leads')
                .select('id, name')
                .in('bot_id', botIds.length > 0 ? botIds : ['00000000-0000-0000-0000-000000000000']);

            const leadIds = leads?.map(l => l.id) || [];

            const { count: messagesToday } = await supabase
                .from('messages')
                .select('*', { count: 'exact', head: true })
                .in('lead_id', leadIds.length > 0 ? leadIds : ['00000000-0000-0000-0000-000000000000'])
                .gte('created_at', today.toISOString());

            const weekEnd = new Date();
            weekEnd.setDate(weekEnd.getDate() + 7);

            const { count: appointmentsCount } = await supabase
                .from('appointments')
                .select('*', { count: 'exact', head: true })
                .in('bot_id', botIds.length > 0 ? botIds : ['00000000-0000-0000-0000-000000000000'])
                .gte('start_time', new Date().toISOString())
                .lte('start_time', weekEnd.toISOString());

            const { data: recentMsgs } = await supabase
                .from('messages')
                .select('content, direction, created_at, lead_id')
                .in('lead_id', leadIds.length > 0 ? leadIds : ['00000000-0000-0000-0000-000000000000'])
                .order('created_at', { ascending: false })
                .limit(4);

            const recentMessages = recentMsgs?.map(msg => {
                const lead = leads?.find(l => l.id === msg.lead_id);
                return { ...msg, lead_name: lead?.name || 'Клиент' };
            }) || [];

            const { data: upcomingAppts } = await supabase
                .from('appointments')
                .select('client_name, start_time, service_id')
                .in('bot_id', botIds.length > 0 ? botIds : ['00000000-0000-0000-0000-000000000000'])
                .gte('start_time', new Date().toISOString())
                .order('start_time', { ascending: true })
                .limit(3);

            const upcomingAppointments = upcomingAppts?.map(apt => ({
                client_name: apt.client_name,
                start_time: apt.start_time,
                service_name: 'Услуга'
            })) || [];

            setStats({
                activeBots,
                totalBots: bots?.length || 0,
                totalLeads: leadsCount || 0,
                messagesToday: messagesToday || 0,
                appointmentsThisWeek: appointmentsCount || 0,
                recentMessages,
                upcomingAppointments,
            });
            setLoading(false);
        }
        loadStats();
    }, []);

    if (loading) {
        return (
            <PageContainer>
                <div className="flex items-center justify-center h-[60vh]">
                    <div className="relative">
                        <div className="w-16 h-16 rounded-2xl bg-accent/20 animate-pulse" />
                        <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-accent animate-spin" style={{ animationDuration: '3s' }} />
                    </div>
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                    icon={Bot}
                    label="Активные боты"
                    value={stats?.activeBots || 0}
                    total={stats?.totalBots || 0}
                    color="emerald"
                    href="/my-bots"
                />
                <StatCard
                    icon={Users}
                    label="Всего клиентов"
                    value={stats?.totalLeads || 0}
                    color="blue"
                    href="/leads"
                />
                <StatCard
                    icon={MessageSquare}
                    label="Сообщений сегодня"
                    value={stats?.messagesToday || 0}
                    color="violet"
                    href="/live-chat"
                />
                <StatCard
                    icon={Calendar}
                    label="Записей на неделе"
                    value={stats?.appointmentsThisWeek || 0}
                    color="amber"
                    href="/appointments"
                />
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Messages */}
                <div className="group">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-white">Последние сообщения</h2>
                        <Link href="/live-chat" className="text-sm text-gray-500 hover:text-accent transition-colors flex items-center gap-1">
                            Все сообщения <ArrowUpRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {stats?.recentMessages && stats.recentMessages.length > 0 ? (
                            stats.recentMessages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className="p-5 rounded-2xl bg-gradient-to-br from-white/[0.04] to-transparent border border-white/[0.06] hover:border-white/[0.12] transition-all hover:translate-x-1"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-semibold ${msg.direction === 'in'
                                            ? 'bg-blue-500/10 text-blue-400'
                                            : 'bg-emerald-500/10 text-emerald-400'
                                            }`}>
                                            {msg.lead_name.slice(0, 2).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <p className="font-medium text-white">{msg.lead_name}</p>
                                                <span className="text-xs text-gray-600">
                                                    {new Date(msg.created_at).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-400 truncate">{msg.content}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <EmptyState icon={MessageSquare} text="Нет сообщений" />
                        )}
                    </div>
                </div>

                {/* Upcoming Appointments */}
                <div className="group">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-white">Ближайшие записи</h2>
                        <Link href="/appointments" className="text-sm text-gray-500 hover:text-accent transition-colors flex items-center gap-1">
                            Все записи <ArrowUpRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {stats?.upcomingAppointments && stats.upcomingAppointments.length > 0 ? (
                            stats.upcomingAppointments.map((apt, idx) => (
                                <div
                                    key={idx}
                                    className="p-5 rounded-2xl bg-gradient-to-br from-white/[0.04] to-transparent border border-white/[0.06] hover:border-white/[0.12] transition-all hover:translate-x-1"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/20 flex flex-col items-center justify-center">
                                            <span className="text-lg font-bold text-amber-400">
                                                {new Date(apt.start_time).getDate()}
                                            </span>
                                            <span className="text-[10px] text-amber-400/70 uppercase">
                                                {new Date(apt.start_time).toLocaleString('ru', { month: 'short' })}
                                            </span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-white mb-1">{apt.client_name}</p>
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <Clock className="w-4 h-4" />
                                                {new Date(apt.start_time).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <EmptyState icon={Calendar} text="Нет записей" />
                        )}
                    </div>
                </div>
            </div>
        </PageContainer>
    );
}

function EmptyState({ icon: Icon, text }: { icon: any; text: string }) {
    return (
        <div className="p-12 rounded-2xl bg-white/[0.02] border border-white/[0.04] text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/[0.03] flex items-center justify-center">
                <Icon className="w-8 h-8 text-gray-600" />
            </div>
            <p className="text-gray-500">{text}</p>
        </div>
    );
}

const colorMap: Record<string, { bg: string; text: string; glow: string }> = {
    emerald: { bg: 'from-emerald-500/20 to-emerald-500/5', text: 'text-emerald-400', glow: 'shadow-emerald-500/20' },
    blue: { bg: 'from-blue-500/20 to-blue-500/5', text: 'text-blue-400', glow: 'shadow-blue-500/20' },
    violet: { bg: 'from-violet-500/20 to-violet-500/5', text: 'text-violet-400', glow: 'shadow-violet-500/20' },
    amber: { bg: 'from-amber-500/20 to-amber-500/5', text: 'text-amber-400', glow: 'shadow-amber-500/20' },
};

function StatCard({ icon: Icon, label, value, total, color = 'emerald', href }: any) {
    const colors = colorMap[color];

    return (
        <Link href={href} className="block group">
            <div
                className="
                    relative p-5 rounded-2xl overflow-hidden cursor-pointer
                    bg-gradient-to-br from-white/[0.06] to-white/[0.02]
                    border border-white/[0.08]
                    transition-all duration-500 ease-out
                    hover:border-white/[0.15]
                "
                style={{
                    perspective: '1000px',
                    transformStyle: 'preserve-3d'
                }}
                onMouseMove={(e) => {
                    const card = e.currentTarget;
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;
                    const rotateX = (centerY - y) / 15;
                    const rotateY = (x - centerX) / 15;
                    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
                }}
            >
                {/* Gradient glow */}
                <div className={`absolute -inset-1 bg-gradient-to-r ${colors.bg} opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-700`} />

                {/* Top accent line */}
                <div className={`absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent ${colors.bg} to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />

                <div className="relative z-10">
                    {/* Icon */}
                    <div className={`w-10 h-10 mb-4 rounded-xl bg-gradient-to-br ${colors.bg} flex items-center justify-center ring-1 ring-white/10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                        <Icon className={`w-5 h-5 ${colors.text}`} />
                    </div>

                    {/* Value */}
                    <div className="mb-1">
                        <span className="text-2xl font-bold text-white tracking-tight">{value}</span>
                        {total !== undefined && (
                            <span className="text-sm text-gray-500 ml-1">/ {total}</span>
                        )}
                    </div>

                    {/* Label */}
                    <p className="text-xs text-gray-500 font-medium">{label}</p>
                </div>
            </div>
        </Link>
    );
}
