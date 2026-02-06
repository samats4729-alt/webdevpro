'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, User, Phone, Check, X, ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import Link from 'next/link';
import PageContainer from "@/components/layout/PageContainer";

interface Appointment {
    id: string;
    start_time: string;
    end_time: string;
    status: string;
    client_name: string;
    client_phone: string;
    notes: string;
    lead?: { name: string; phone: string };
    service?: { name: string; duration_minutes: number; price: number };
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    pending: { label: 'Ожидает', color: 'text-amber-400', bg: 'bg-amber-500/10' },
    confirmed: { label: 'Подтверждено', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    completed: { label: 'Завершено', color: 'text-blue-400', bg: 'bg-blue-500/10' },
    cancelled: { label: 'Отменено', color: 'text-gray-500', bg: 'bg-gray-500/10' },
    no_show: { label: 'Не пришёл', color: 'text-red-400', bg: 'bg-red-500/10' },
};

export default function AppointmentsPage() {
    const [selectedBotId, setSelectedBotId] = useState<string | null>(null);
    const [bots, setBots] = useState<any[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/bots')
            .then(res => res.json())
            .then(data => {
                setBots(data.bots || []);
                if (data.bots?.length > 0) setSelectedBotId(data.bots[0].id);
            });
    }, []);

    useEffect(() => {
        if (!selectedBotId) return;
        setLoading(true);
        fetch(`/api/appointments?bot_id=${selectedBotId}&date=${selectedDate.toISOString().split('T')[0]}`)
            .then(res => res.json())
            .then(data => {
                setAppointments(data.appointments || []);
                setLoading(false);
            });
    }, [selectedBotId, selectedDate]);

    const formatTime = (iso: string) => new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

    const formatDate = (date: Date) => {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (date.toDateString() === today.toDateString()) return 'Сегодня';
        if (date.toDateString() === tomorrow.toDateString()) return 'Завтра';
        return date.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'short' });
    };

    const changeDate = (days: number) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + days);
        setSelectedDate(newDate);
    };

    const updateStatus = async (id: string, status: string) => {
        await fetch('/api/appointments', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, status })
        });
        setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    };

    return (
        <PageContainer>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-semibold text-white">Записи</h1>
                    <p className="text-sm text-gray-500 mt-1">{appointments.length} на {formatDate(selectedDate).toLowerCase()}</p>
                </div>
                <div className="flex items-center gap-3">
                    {bots.length > 1 && (
                        <select
                            value={selectedBotId || ''}
                            onChange={(e) => setSelectedBotId(e.target.value)}
                            className="px-3 py-2 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm text-white"
                        >
                            {bots.map(bot => <option key={bot.id} value={bot.id}>{bot.name}</option>)}
                        </select>
                    )}
                    <Link href={`/appointments/settings?bot_id=${selectedBotId}`}>
                        <button className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-gray-400 hover:text-white transition-all">
                            <Settings className="w-4 h-4" />
                        </button>
                    </Link>
                </div>
            </div>

            {/* Date Navigation */}
            <div className="flex items-center justify-center gap-4 mb-8">
                <button onClick={() => changeDate(-1)} className="p-2 rounded-xl hover:bg-white/[0.04] text-gray-400 hover:text-white transition-all">
                    <ChevronLeft className="w-5 h-5" />
                </button>

                <button
                    onClick={() => setSelectedDate(new Date())}
                    className="px-5 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white font-medium min-w-[140px]"
                >
                    {formatDate(selectedDate)}
                </button>

                <button onClick={() => changeDate(1)} className="p-2 rounded-xl hover:bg-white/[0.04] text-gray-400 hover:text-white transition-all">
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                </div>
            ) : appointments.length === 0 ? (
                <div className="text-center py-20">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/[0.03] flex items-center justify-center">
                        <Calendar className="w-8 h-8 text-gray-600" />
                    </div>
                    <p className="text-gray-500 mb-1">Нет записей</p>
                    <p className="text-sm text-gray-600">Клиенты записываются через бота</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {appointments.map(apt => {
                        const status = statusConfig[apt.status] || statusConfig.pending;
                        return (
                            <div
                                key={apt.id}
                                className="group p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08] transition-all"
                            >
                                <div className="flex items-center gap-5">
                                    {/* Time */}
                                    <div className="w-16 text-center shrink-0">
                                        <div className="text-lg font-semibold text-white">{formatTime(apt.start_time)}</div>
                                        <div className="text-xs text-gray-600">{formatTime(apt.end_time)}</div>
                                    </div>

                                    {/* Divider */}
                                    <div className="w-px h-12 bg-white/[0.06]" />

                                    {/* Client Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="font-medium text-white truncate">
                                                {apt.client_name || apt.lead?.name || 'Клиент'}
                                            </p>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${status.bg} ${status.color}`}>
                                                {status.label}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                            <Phone className="w-3 h-3" />
                                            {apt.client_phone || apt.lead?.phone || '—'}
                                        </p>
                                        {apt.service && (
                                            <p className="text-xs text-gray-600 mt-1">
                                                {apt.service.name} • {apt.service.duration_minutes} мин
                                            </p>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 shrink-0">
                                        {apt.status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => updateStatus(apt.id, 'confirmed')}
                                                    className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white transition-all"
                                                    title="Подтвердить"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => updateStatus(apt.id, 'cancelled')}
                                                    className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white transition-all"
                                                    title="Отменить"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </>
                                        )}
                                        {apt.status === 'confirmed' && (
                                            <button
                                                onClick={() => updateStatus(apt.id, 'completed')}
                                                className="p-2 rounded-xl bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white transition-all"
                                                title="Завершить"
                                            >
                                                <Check className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </PageContainer>
    );
}
