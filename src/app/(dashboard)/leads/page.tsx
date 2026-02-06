'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import PageContainer from "@/components/layout/PageContainer";
import { Users, Download, Search, MessageCircle, Phone, ChevronRight } from "lucide-react";
import Link from 'next/link';

interface Lead {
    id: string;
    phone: string;
    name: string | null;
    platform: string;
    status: string;
    last_message_at: string;
    created_at: string;
    bot_id: string;
    bots?: { name: string };
}

export default function LeadsPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const supabase = createClient();

    const fetchLeads = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('leads')
            .select(`*, bots:bot_id (name)`)
            .order('last_message_at', { ascending: false });
        setLeads(data || []);
        setLoading(false);
    };

    useEffect(() => { fetchLeads(); }, []);

    const filteredLeads = leads.filter(lead => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return lead.phone.toLowerCase().includes(q) || lead.name?.toLowerCase().includes(q);
    });

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        if (diffMins < 60) return `${diffMins}м`;
        if (diffHours < 24) return `${diffHours}ч`;
        if (diffDays < 7) return `${diffDays}д`;
        return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    };

    const exportCSV = () => {
        const rows = filteredLeads.map(l => [l.name || '', l.phone, l.platform, l.status].join(','));
        const blob = new Blob([['Имя,Телефон,Платформа,Статус', ...rows].join('\n')], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `leads_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const updateStatus = async (id: string, status: string) => {
        await supabase.from('leads').update({ status }).eq('id', id);
        setLeads(leads.map(l => l.id === id ? { ...l, status } : l));
    };

    return (
        <PageContainer>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-semibold text-white">Клиенты</h1>
                    <p className="text-sm text-gray-500 mt-1">{leads.length} контактов</p>
                </div>
                <button
                    onClick={exportCSV}
                    className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-gray-400 hover:text-white transition-all"
                >
                    <Download className="w-4 h-4" />
                </button>
            </div>

            {/* Search */}
            <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input
                    type="text"
                    placeholder="Поиск..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white/[0.02] border border-white/[0.06] rounded-2xl text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-white/[0.12] transition-colors"
                />
            </div>

            {/* List */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                </div>
            ) : filteredLeads.length === 0 ? (
                <div className="text-center py-20">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/[0.03] flex items-center justify-center">
                        <Users className="w-8 h-8 text-gray-600" />
                    </div>
                    <p className="text-gray-500">Нет клиентов</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {filteredLeads.map((lead) => (
                        <div
                            key={lead.id}
                            className="group p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08] transition-all cursor-pointer"
                        >
                            <div className="flex items-center gap-4">
                                {/* Avatar */}
                                <div className={`
                                    w-11 h-11 rounded-xl flex items-center justify-center text-sm font-semibold shrink-0
                                    ${lead.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' :
                                        lead.status === 'pending' ? 'bg-amber-500/10 text-amber-400' :
                                            'bg-gray-500/10 text-gray-500'}
                                `}>
                                    {(lead.name || lead.phone)[0].toUpperCase()}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium text-white truncate">
                                            {lead.name || 'Без имени'}
                                        </p>
                                        {lead.platform === 'whatsapp' && (
                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#25D366]/10 text-[#25D366]">WA</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 truncate">+{lead.phone}</p>
                                </div>

                                {/* Time */}
                                <span className="text-xs text-gray-600 shrink-0">
                                    {formatTime(lead.last_message_at)}
                                </span>

                                {/* Status */}
                                <select
                                    value={lead.status}
                                    onChange={(e) => updateStatus(lead.id, e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    className={`
                                        text-[10px] font-medium px-2 py-1 rounded-lg border-0 cursor-pointer appearance-none shrink-0
                                        ${lead.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' :
                                            lead.status === 'pending' ? 'bg-amber-500/10 text-amber-400' :
                                                'bg-gray-500/10 text-gray-500'}
                                    `}
                                >
                                    <option value="active">Активный</option>
                                    <option value="pending">Ожидание</option>
                                    <option value="closed">Закрыт</option>
                                </select>

                                {/* Arrow */}
                                <ChevronRight className="w-4 h-4 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </PageContainer>
    );
}
