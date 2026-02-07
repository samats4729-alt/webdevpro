'use client';

import { useState, useEffect } from 'react';
import { Users, CreditCard, MessageCircle, Bot, Calendar, TrendingUp, Send, X, ChevronRight, Wifi, WifiOff, QrCode, RefreshCw, Phone } from 'lucide-react';
import QRCode from 'qrcode';

interface AdminStats {
    users: { total: number; newToday: number; newWeek: number; newMonth: number };
    plans: { trial: number; starter: number; pro: number; business: number };
    revenue: { starter: number; pro: number; business: number; total: number };
    activity: { bots: number; leads: number; appointments: number };
    support: { openTickets: number; tickets: any[] };
}

const PLAN_COLORS = {
    trial: 'text-gray-400',
    starter: 'text-blue-400',
    pro: 'text-purple-400',
    business: 'text-amber-400'
};

export default function AdminPage() {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTicket, setSelectedTicket] = useState<any>(null);
    const [replyText, setReplyText] = useState('');
    const [sending, setSending] = useState(false);

    // OTP Bot state
    const [otpBot, setOtpBot] = useState<{ status: string; qrCode: string | null; deviceInfo: any } | null>(null);
    const [qrImage, setQrImage] = useState<string | null>(null);
    const [otpLoading, setOtpLoading] = useState(false);

    const loadStats = async () => {
        try {
            const res = await fetch('/api/admin');
            if (res.status === 403) {
                setError('Доступ запрещён');
                setLoading(false);
                return;
            }
            const data = await res.json();
            setStats(data);
            setLoading(false);
        } catch (e) {
            setError('Ошибка загрузки');
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStats();
        const interval = setInterval(loadStats, 30000); // Refresh every 30s
        return () => clearInterval(interval);
    }, []);

    // OTP Bot functions
    const loadOtpBotStatus = async () => {
        try {
            const res = await fetch('/api/admin/otp-bot');
            if (res.ok) {
                const data = await res.json();
                setOtpBot(data);
                if (data.qrCode) {
                    const qr = await QRCode.toDataURL(data.qrCode, { width: 200 });
                    setQrImage(qr);
                } else {
                    setQrImage(null);
                }
            }
        } catch (e) {
            console.error('Error loading OTP bot:', e);
        }
    };

    useEffect(() => {
        loadOtpBotStatus();
        const otpInterval = setInterval(loadOtpBotStatus, 3000);
        return () => clearInterval(otpInterval);
    }, []);

    const connectOtpBot = async () => {
        setOtpLoading(true);
        await fetch('/api/admin/otp-bot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'connect' })
        });
        await loadOtpBotStatus();
        setOtpLoading(false);
    };

    const disconnectOtpBot = async () => {
        setOtpLoading(true);
        await fetch('/api/admin/otp-bot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'disconnect' })
        });
        await loadOtpBotStatus();
        setOtpLoading(false);
    };

    const sendReply = async () => {
        if (!selectedTicket || !replyText.trim()) return;
        setSending(true);
        await fetch('/api/admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ticket_id: selectedTicket.id, message: replyText })
        });
        setReplyText('');
        setSending(false);
        loadStats();
    };

    const closeTicket = async (ticketId: string) => {
        await fetch('/api/admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ticket_id: ticketId, action: 'close' })
        });
        setSelectedTicket(null);
        loadStats();
    };

    if (loading) return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white/20 border-t-emerald-500 rounded-full animate-spin" />
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
            <div className="text-center">
                <div className="text-6xl mb-4">🔒</div>
                <p className="text-xl text-white mb-2">{error}</p>
                <p className="text-gray-500">Эта страница доступна только администратору</p>
            </div>
        </div>
    );

    if (!stats) return null;

    const formatCurrency = (n: number) => n.toLocaleString('ru-RU') + ' ₸';

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Админ-панель</h1>
                    <p className="text-gray-500">Статистика и поддержка</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Stats */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* User Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <StatCard icon={Users} label="Всего" value={stats.users.total} color="emerald" />
                            <StatCard icon={TrendingUp} label="Сегодня" value={`+${stats.users.newToday}`} color="blue" />
                            <StatCard icon={TrendingUp} label="Неделя" value={`+${stats.users.newWeek}`} color="purple" />
                            <StatCard icon={TrendingUp} label="Месяц" value={`+${stats.users.newMonth}`} color="amber" />
                        </div>

                        {/* Plans & Revenue */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Plans */}
                            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 text-emerald-400" />
                                    Подписки
                                </h3>
                                <div className="space-y-3">
                                    {Object.entries(stats.plans).map(([plan, count]) => (
                                        <div key={plan} className="flex items-center justify-between">
                                            <span className={`capitalize ${PLAN_COLORS[plan as keyof typeof PLAN_COLORS]}`}>
                                                {plan === 'trial' ? 'Trial' : plan === 'starter' ? 'Starter' : plan === 'pro' ? 'Pro' : 'Business'}
                                            </span>
                                            <span className="font-semibold">{count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Revenue */}
                            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                                    Доход (месяц)
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-400">Starter</span>
                                        <span>{formatCurrency(stats.revenue.starter)}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-400">Pro</span>
                                        <span>{formatCurrency(stats.revenue.pro)}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-400">Business</span>
                                        <span>{formatCurrency(stats.revenue.business)}</span>
                                    </div>
                                    <div className="pt-3 mt-3 border-t border-white/[0.06] flex items-center justify-between">
                                        <span className="font-semibold">Итого</span>
                                        <span className="text-xl font-bold text-emerald-400">{formatCurrency(stats.revenue.total)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Activity */}
                        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                            <h3 className="text-lg font-semibold mb-4">Активность</h3>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="text-center p-4 rounded-xl bg-white/[0.02]">
                                    <Bot className="w-6 h-6 mx-auto mb-2 text-emerald-400" />
                                    <p className="text-2xl font-bold">{stats.activity.bots}</p>
                                    <p className="text-xs text-gray-500">Ботов</p>
                                </div>
                                <div className="text-center p-4 rounded-xl bg-white/[0.02]">
                                    <Users className="w-6 h-6 mx-auto mb-2 text-blue-400" />
                                    <p className="text-2xl font-bold">{stats.activity.leads}</p>
                                    <p className="text-xs text-gray-500">Лидов</p>
                                </div>
                                <div className="text-center p-4 rounded-xl bg-white/[0.02]">
                                    <Calendar className="w-6 h-6 mx-auto mb-2 text-purple-400" />
                                    <p className="text-2xl font-bold">{stats.activity.appointments}</p>
                                    <p className="text-xs text-gray-500">Записей</p>
                                </div>
                            </div>
                        </div>

                        {/* OTP Bot Section */}
                        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Phone className="w-5 h-5 text-green-400" />
                                OTP Бот (WhatsApp)
                                {otpBot?.status === 'connected' && (
                                    <span className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs">
                                        <Wifi className="w-3 h-3" /> Подключен
                                    </span>
                                )}
                            </h3>

                            {otpBot?.status === 'connecting' && qrImage && (
                                <div className="flex flex-col items-center mb-4">
                                    <div className="bg-white p-3 rounded-xl mb-2">
                                        <img src={qrImage} alt="QR" className="w-48 h-48" />
                                    </div>
                                    <p className="text-xs text-gray-500 text-center">Сканируйте в WhatsApp → Связанные устройства</p>
                                </div>
                            )}

                            {otpBot?.status === 'connected' && otpBot?.deviceInfo && (
                                <div className="mb-4 p-3 rounded-xl bg-white/[0.02] text-sm">
                                    <p className="text-gray-400">Номер: <span className="text-white">{otpBot.deviceInfo.phone || '...'}</span></p>
                                </div>
                            )}

                            <div className="flex gap-2">
                                {otpBot?.status !== 'connected' ? (
                                    <button
                                        onClick={connectOtpBot}
                                        disabled={otpLoading}
                                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-medium disabled:opacity-50"
                                    >
                                        {otpLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <QrCode className="w-4 h-4" />}
                                        Подключить
                                    </button>
                                ) : (
                                    <button
                                        onClick={disconnectOtpBot}
                                        disabled={otpLoading}
                                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm font-medium"
                                    >
                                        <WifiOff className="w-4 h-4" />
                                        Отключить
                                    </button>
                                )}
                            </div>
                            <p className="mt-3 text-xs text-gray-500">Этот бот отправляет коды авторизации через WhatsApp</p>
                        </div>
                    </div>

                    {/* Right Column - Support Chat */}
                    <div className="space-y-4">
                        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <MessageCircle className="w-5 h-5 text-emerald-400" />
                                Поддержка
                                {stats.support.openTickets > 0 && (
                                    <span className="ml-auto px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs">
                                        {stats.support.openTickets} открытых
                                    </span>
                                )}
                            </h3>

                            {stats.support.tickets.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    Нет открытых обращений
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {stats.support.tickets.map(ticket => (
                                        <button
                                            key={ticket.id}
                                            onClick={() => setSelectedTicket(ticket)}
                                            className={`w-full p-3 rounded-xl text-left transition-all flex items-center justify-between ${selectedTicket?.id === ticket.id
                                                ? 'bg-emerald-500/10 border border-emerald-500/30'
                                                : 'bg-white/[0.02] hover:bg-white/[0.04] border border-transparent'
                                                }`}
                                        >
                                            <div>
                                                <p className="font-medium text-sm">{ticket.user_name || ticket.user_email || 'Пользователь'}</p>
                                                <p className="text-xs text-gray-500">
                                                    {ticket.support_messages?.length || 0} сообщений
                                                </p>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-gray-500" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Selected Ticket Chat */}
                        {selectedTicket && (
                            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-semibold">{selectedTicket.user_name || selectedTicket.user_email}</h4>
                                    <button
                                        onClick={() => closeTicket(selectedTicket.id)}
                                        className="px-3 py-1 rounded-lg bg-red-500/10 text-red-400 text-xs hover:bg-red-500/20"
                                    >
                                        Закрыть
                                    </button>
                                </div>

                                <div className="h-64 overflow-y-auto space-y-2 mb-4 p-2 rounded-xl bg-black/20">
                                    {selectedTicket.support_messages?.map((msg: any) => (
                                        <div
                                            key={msg.id}
                                            className={`p-2 rounded-lg text-sm max-w-[80%] ${msg.sender_type === 'admin'
                                                ? 'ml-auto bg-emerald-500/20 text-emerald-100'
                                                : 'bg-white/[0.06]'
                                                }`}
                                        >
                                            {msg.message}
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-2">
                                    <input
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && sendReply()}
                                        placeholder="Ответ..."
                                        className="flex-1 px-3 py-2 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm"
                                    />
                                    <button
                                        onClick={sendReply}
                                        disabled={sending || !replyText.trim()}
                                        className="p-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50"
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) {
    const colors = {
        emerald: 'text-emerald-400 bg-emerald-500/10',
        blue: 'text-blue-400 bg-blue-500/10',
        purple: 'text-purple-400 bg-purple-500/10',
        amber: 'text-amber-400 bg-amber-500/10'
    };

    return (
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
            <div className={`w-10 h-10 rounded-xl ${colors[color as keyof typeof colors]} flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
        </div>
    );
}
