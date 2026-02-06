'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Plus, Trash2, Save, ArrowLeft, Calendar, Clock, Repeat } from 'lucide-react';
import Link from 'next/link';
import PageContainer from "@/components/layout/PageContainer";

const DAYS_FULL = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
const DAYS_ORDER = [1, 2, 3, 4, 5, 6, 0];

const TIME_OPTIONS: string[] = [];
for (let i = 0; i < 24; i++) {
    for (let j = 0; j < 60; j += 30) {
        TIME_OPTIONS.push(`${i.toString().padStart(2, '0')}:${j.toString().padStart(2, '0')}`);
    }
}

const TIMEZONES = [
    { value: 'Asia/Almaty', label: 'Алматы (UTC+5)' },
    { value: 'Europe/Moscow', label: 'Москва (UTC+3)' },
    { value: 'Asia/Tashkent', label: 'Ташкент (UTC+5)' },
    { value: 'Asia/Bishkek', label: 'Бишкек (UTC+6)' },
];

const SHIFT_PRESETS = [
    { label: '2/2', work: 2, off: 2 },
    { label: '4/3', work: 4, off: 3 },
    { label: '5/2', work: 5, off: 2 },
    { label: '3/3', work: 3, off: 3 },
];

export default function ScheduleSettingsPage() {
    const searchParams = useSearchParams();
    const botId = searchParams.get('bot_id');

    const [schedule, setSchedule] = useState<any>({
        timezone: 'Asia/Almaty',
        schedule_type: 'weekly',
        shift_work_days: 2,
        shift_off_days: 2,
        cycle_start_date: new Date().toISOString().split('T')[0],
        work_start_time: '09:00',
        work_end_time: '18:00'
    });
    const [hours, setHours] = useState<any[]>([]);
    const [services, setServices] = useState<any[]>([]);
    const [exceptions, setExceptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'hours' | 'services' | 'exceptions'>('hours');
    const [newService, setNewService] = useState({ name: '', duration_minutes: 60, price: '' });
    const [newException, setNewException] = useState({ date: '', reason: '' });

    useEffect(() => {
        if (!botId) return;
        fetch(`/api/schedule?bot_id=${botId}`)
            .then(res => res.json())
            .then(data => {
                if (data.schedule) {
                    setSchedule({ ...schedule, ...data.schedule });
                }
                const normalizedHours = Array.from({ length: 7 }, (_, i) => {
                    const existing = data.hours?.find((h: any) => h.day_of_week === i);
                    return existing || { day_of_week: i, is_working: false, start_time: '09:00', end_time: '18:00', bot_id: botId };
                });
                setHours(normalizedHours);
                setServices(data.services || []);
                setExceptions(data.exceptions || []);
                setLoading(false);
            });
    }, [botId]);

    const saveSchedule = async () => {
        setSaving(true);
        await fetch('/api/schedule', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bot_id: botId, schedule, hours })
        });
        setSaving(false);
    };

    const updateHour = (day: number, field: string, value: any) => {
        setHours(prev => prev.map(h => h.day_of_week === day ? { ...h, [field]: value } : h));
    };

    const toggleDay = (day: number) => {
        const h = hours.find(x => x.day_of_week === day);
        updateHour(day, 'is_working', !h?.is_working);
    };

    const addService = async () => {
        if (!newService.name) return;
        const { service } = await fetch('/api/services', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bot_id: botId, ...newService })
        }).then(res => res.json());
        if (service) {
            setServices([...services, service]);
            setNewService({ name: '', duration_minutes: 60, price: '' });
        }
    };

    const deleteService = async (id: string) => {
        await fetch(`/api/services?id=${id}`, { method: 'DELETE' });
        setServices(services.filter(s => s.id !== id));
    };

    const addException = async () => {
        if (!newException.date) return;
        const { data } = await fetch('/api/schedule', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bot_id: botId, exception_date: newException.date, is_day_off: true, reason: newException.reason })
        }).then(res => res.json());
        if (data?.exception) {
            setExceptions([...exceptions, data.exception]);
            setNewException({ date: '', reason: '' });
        }
    };

    const deleteException = async (id: string) => {
        await fetch(`/api/schedule?exception_id=${id}`, { method: 'DELETE' });
        setExceptions(exceptions.filter(e => e.id !== id));
    };

    // Calculate next 7 days for shift preview
    const getShiftPreview = () => {
        const days = [];

        // Parse start date as local date (avoid UTC issues)
        const dateStr = schedule.cycle_start_date || new Date().toISOString().split('T')[0];
        const [year, month, day] = dateStr.split('-').map(Number);
        const startDate = new Date(year, month - 1, day);
        startDate.setHours(0, 0, 0, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const cycleLength = schedule.shift_work_days + schedule.shift_off_days;

        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            date.setHours(0, 0, 0, 0);

            // Calculate days difference properly
            const daysDiff = Math.round((date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
            const positionInCycle = ((daysDiff % cycleLength) + cycleLength) % cycleLength;
            const isWorking = positionInCycle < schedule.shift_work_days;

            days.push({
                date,
                dayName: date.toLocaleDateString('ru-RU', { weekday: 'short' }),
                dayNum: date.getDate(),
                isWorking
            });
        }
        return days;
    };

    if (!botId) return <div className="p-8 text-gray-500">Выберите бота</div>;
    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
    );

    return (
        <PageContainer>
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link href="/appointments" className="p-2 rounded-xl hover:bg-white/[0.04] text-gray-400 hover:text-white transition-all">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-semibold text-white">Настройки</h1>
                    <p className="text-sm text-gray-500 mt-1">График работы и услуги</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-6">
                {(['hours', 'services', 'exceptions'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === tab
                            ? 'bg-white/[0.08] text-white'
                            : 'text-gray-500 hover:text-white hover:bg-white/[0.04]'
                            }`}
                    >
                        {tab === 'hours' ? 'График' : tab === 'services' ? 'Услуги' : 'Выходные'}
                    </button>
                ))}
            </div>

            {/* Hours Tab */}
            {activeTab === 'hours' && (
                <div className="space-y-4">
                    {/* Schedule Type Selector */}
                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                        <p className="text-sm text-gray-400 mb-3">Тип графика</p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setSchedule({ ...schedule, schedule_type: 'weekly' })}
                                className={`flex-1 p-3 rounded-xl border transition-all flex items-center justify-center gap-2 ${schedule.schedule_type === 'weekly'
                                    ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'
                                    : 'bg-white/[0.02] border-white/[0.06] text-gray-400 hover:border-white/[0.12]'
                                    }`}
                            >
                                <Calendar className="w-4 h-4" />
                                <span className="text-sm font-medium">По дням недели</span>
                            </button>
                            <button
                                onClick={() => setSchedule({ ...schedule, schedule_type: 'shift' })}
                                className={`flex-1 p-3 rounded-xl border transition-all flex items-center justify-center gap-2 ${schedule.schedule_type === 'shift'
                                    ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'
                                    : 'bg-white/[0.02] border-white/[0.06] text-gray-400 hover:border-white/[0.12]'
                                    }`}
                            >
                                <Repeat className="w-4 h-4" />
                                <span className="text-sm font-medium">Сменный (2/2, 4/3...)</span>
                            </button>
                        </div>
                    </div>

                    {/* Timezone */}
                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">Часовой пояс</span>
                            <select
                                value={schedule.timezone || 'Asia/Almaty'}
                                onChange={(e) => setSchedule({ ...schedule, timezone: e.target.value })}
                                className="px-3 py-1.5 bg-white/[0.04] border border-white/[0.06] rounded-lg text-sm text-white"
                            >
                                {TIMEZONES.map(tz => <option key={tz.value} value={tz.value}>{tz.label}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Shift Schedule Settings */}
                    {schedule.schedule_type === 'shift' && (
                        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] space-y-4">
                            {/* Presets */}
                            <div>
                                <p className="text-sm text-gray-400 mb-3">Быстрый выбор</p>
                                <div className="flex gap-2">
                                    {SHIFT_PRESETS.map(preset => (
                                        <button
                                            key={preset.label}
                                            onClick={() => setSchedule({
                                                ...schedule,
                                                shift_work_days: preset.work,
                                                shift_off_days: preset.off
                                            })}
                                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${schedule.shift_work_days === preset.work && schedule.shift_off_days === preset.off
                                                ? 'bg-emerald-500 text-white'
                                                : 'bg-white/[0.04] text-gray-400 hover:bg-white/[0.08]'
                                                }`}
                                        >
                                            {preset.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Custom */}
                            <div className="flex items-center gap-4">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Рабочих</p>
                                    <input
                                        type="number"
                                        min="1"
                                        max="30"
                                        value={schedule.shift_work_days}
                                        onChange={(e) => setSchedule({ ...schedule, shift_work_days: parseInt(e.target.value) || 1 })}
                                        className="w-16 px-3 py-2 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm text-white text-center"
                                    />
                                </div>
                                <span className="text-gray-600 mt-5">/</span>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Выходных</p>
                                    <input
                                        type="number"
                                        min="1"
                                        max="30"
                                        value={schedule.shift_off_days}
                                        onChange={(e) => setSchedule({ ...schedule, shift_off_days: parseInt(e.target.value) || 1 })}
                                        className="w-16 px-3 py-2 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm text-white text-center"
                                    />
                                </div>
                            </div>

                            {/* Cycle Start Date */}
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Начало цикла (первый рабочий день)</p>
                                <input
                                    type="date"
                                    value={schedule.cycle_start_date}
                                    onChange={(e) => setSchedule({ ...schedule, cycle_start_date: e.target.value })}
                                    className="px-3 py-2 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm text-white"
                                />
                            </div>

                            {/* Work Hours */}
                            <div className="flex items-center gap-3">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Начало работы</p>
                                    <select
                                        value={schedule.work_start_time || '09:00'}
                                        onChange={(e) => setSchedule({ ...schedule, work_start_time: e.target.value })}
                                        className="px-3 py-2 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm text-white"
                                    >
                                        {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <span className="text-gray-600 mt-5">—</span>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Конец работы</p>
                                    <select
                                        value={schedule.work_end_time || '18:00'}
                                        onChange={(e) => setSchedule({ ...schedule, work_end_time: e.target.value })}
                                        className="px-3 py-2 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm text-white"
                                    >
                                        {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Preview */}
                            <div>
                                <p className="text-xs text-gray-500 mb-2">Предпросмотр (след. 7 дней)</p>
                                <div className="flex gap-2">
                                    {getShiftPreview().map((day, i) => (
                                        <div
                                            key={i}
                                            className={`flex-1 p-2 rounded-xl text-center ${day.isWorking
                                                ? 'bg-emerald-500/10 border border-emerald-500/30'
                                                : 'bg-white/[0.02] border border-white/[0.04]'
                                                }`}
                                        >
                                            <p className={`text-[10px] ${day.isWorking ? 'text-emerald-400' : 'text-gray-600'}`}>
                                                {day.dayName}
                                            </p>
                                            <p className={`text-sm font-medium ${day.isWorking ? 'text-white' : 'text-gray-500'}`}>
                                                {day.dayNum}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Weekly Schedule */}
                    {schedule.schedule_type === 'weekly' && (
                        <div className="rounded-2xl bg-white/[0.02] border border-white/[0.04] divide-y divide-white/[0.04]">
                            {DAYS_ORDER.map(day => {
                                const h = hours.find(x => x.day_of_week === day);
                                if (!h) return null;
                                return (
                                    <div key={day} className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => toggleDay(day)}
                                                    className={`w-10 h-6 rounded-full transition-all ${h.is_working ? 'bg-emerald-500' : 'bg-white/[0.08]'}`}
                                                >
                                                    <div className={`w-4 h-4 rounded-full bg-white transition-all ${h.is_working ? 'ml-5' : 'ml-1'}`} />
                                                </button>
                                                <span className={`font-medium ${h.is_working ? 'text-white' : 'text-gray-500'}`}>
                                                    {DAYS_FULL[day]}
                                                </span>
                                            </div>

                                            {h.is_working && (
                                                <div className="flex items-center gap-2">
                                                    <select
                                                        value={h.start_time}
                                                        onChange={(e) => updateHour(day, 'start_time', e.target.value)}
                                                        className="px-2 py-1 bg-white/[0.04] border border-white/[0.06] rounded-lg text-sm text-white"
                                                    >
                                                        {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                                                    </select>
                                                    <span className="text-gray-600">—</span>
                                                    <select
                                                        value={h.end_time}
                                                        onChange={(e) => updateHour(day, 'end_time', e.target.value)}
                                                        className="px-2 py-1 bg-white/[0.04] border border-white/[0.06] rounded-lg text-sm text-white"
                                                    >
                                                        {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                                                    </select>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Services Tab */}
            {activeTab === 'services' && (
                <div className="space-y-3">
                    {services.map(s => (
                        <div key={s.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between">
                            <div>
                                <p className="font-medium text-white">{s.name}</p>
                                <p className="text-xs text-gray-500">{s.duration_minutes} мин • {s.price ? `${s.price} ₸` : 'Бесплатно'}</p>
                            </div>
                            <button onClick={() => deleteService(s.id)} className="p-2 rounded-xl hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-all">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}

                    {services.length === 0 && (
                        <div className="text-center py-12 text-gray-500">Нет услуг</div>
                    )}

                    {/* Add Service */}
                    <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
                        <div className="flex gap-3 flex-wrap">
                            <input
                                placeholder="Название"
                                value={newService.name}
                                onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                                className="flex-1 min-w-[150px] px-3 py-2 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-gray-600"
                            />
                            <input
                                type="number"
                                placeholder="Мин"
                                value={newService.duration_minutes}
                                onChange={(e) => setNewService({ ...newService, duration_minutes: parseInt(e.target.value) })}
                                className="w-20 px-3 py-2 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm text-white"
                            />
                            <input
                                placeholder="Цена ₸"
                                value={newService.price}
                                onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                                className="w-24 px-3 py-2 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-gray-600"
                            />
                            <button onClick={addService} className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-all flex items-center gap-2">
                                <Plus className="w-4 h-4" /> Добавить
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Exceptions Tab */}
            {activeTab === 'exceptions' && (
                <div className="space-y-3">
                    {exceptions.map(e => (
                        <div key={e.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between">
                            <div>
                                <p className="font-medium text-white">{new Date(e.exception_date).toLocaleDateString('ru-RU')}</p>
                                {e.reason && <p className="text-xs text-gray-500">{e.reason}</p>}
                            </div>
                            <button onClick={() => deleteException(e.id)} className="p-2 rounded-xl hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-all">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}

                    {exceptions.length === 0 && (
                        <div className="text-center py-12 text-gray-500">Нет выходных дней</div>
                    )}

                    {/* Add Exception */}
                    <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
                        <div className="flex gap-3 flex-wrap">
                            <input
                                type="date"
                                value={newException.date}
                                onChange={(e) => setNewException({ ...newException, date: e.target.value })}
                                className="px-3 py-2 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm text-white"
                            />
                            <input
                                placeholder="Причина (опц.)"
                                value={newException.reason}
                                onChange={(e) => setNewException({ ...newException, reason: e.target.value })}
                                className="flex-1 min-w-[150px] px-3 py-2 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-gray-600"
                            />
                            <button onClick={addException} className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-all">
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Save Button */}
            <div className="mt-8">
                <button
                    onClick={saveSchedule}
                    disabled={saving}
                    className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-medium transition-all flex items-center justify-center gap-2"
                >
                    <Save className="w-4 h-4" />
                    {saving ? 'Сохранение...' : 'Сохранить'}
                </button>
            </div>
        </PageContainer>
    );
}
