'use client';

import { Suspense } from 'react';
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

// Inner component that uses useSearchParams
function ScheduleSettingsContent() {
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
                    setSchedule(data.schedule);
                }
                if (data.hours) {
                    setHours(data.hours);
                }
                if (data.services) {
                    setServices(data.services);
                }
                if (data.exceptions) {
                    setExceptions(data.exceptions);
                }
                setLoading(false);
            });
    }, [botId]);

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

    const handleSave = async () => {
        if (!botId) return;
        setSaving(true);
        await fetch('/api/schedule', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                bot_id: botId,
                schedule,
                hours
            })
        });
        setSaving(false);
    };

    const handleAddException = async () => {
        if (!botId || !newException.date) return;
        await fetch('/api/schedule', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                bot_id: botId,
                exception_date: newException.date,
                reason: newException.reason,
                is_day_off: true
            })
        });
        const res = await fetch(`/api/schedule?bot_id=${botId}`);
        const data = await res.json();
        setExceptions(data.exceptions || []);
        setNewException({ date: '', reason: '' });
    };

    const handleDeleteException = async (id: string) => {
        await fetch(`/api/schedule?exception_id=${id}`, { method: 'DELETE' });
        setExceptions(exceptions.filter(e => e.id !== id));
    };

    const handleAddService = async () => {
        if (!botId || !newService.name) return;
        await fetch('/api/services', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                bot_id: botId,
                ...newService,
                price: parseFloat(newService.price) || 0,
                currency: 'KZT'
            })
        });
        const res = await fetch(`/api/schedule?bot_id=${botId}`);
        const data = await res.json();
        setServices(data.services || []);
        setNewService({ name: '', duration_minutes: 60, price: '' });
    };

    const handleDeleteService = async (id: string) => {
        await fetch(`/api/services?id=${id}`, { method: 'DELETE' });
        setServices(services.filter(s => s.id !== id));
    };

    if (!botId) {
        return (
            <PageContainer>
                <div className="text-center py-20 text-gray-400">
                    Не указан ID бота. Вернитесь на страницу записей.
                </div>
            </PageContainer>
        );
    }

    if (loading) {
        return (
            <PageContainer>
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/appointments" className="p-2 rounded-lg bg-dark-50 hover:bg-dark-100 transition-colors">
                        <ArrowLeft className="w-5 h-5 text-gray-400" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-white">Настройки расписания</h1>
                        <p className="text-sm text-gray-500">Рабочие часы, услуги и выходные</p>
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-primary flex items-center gap-2"
                >
                    <Save className="w-4 h-4" />
                    {saving ? 'Сохранение...' : 'Сохранить'}
                </button>
            </div>

            {/* Schedule Type Toggle */}
            <div className="dark-card p-4 mb-6">
                <label className="text-sm text-gray-400 mb-3 block">Тип графика</label>
                <div className="flex gap-2">
                    <button
                        onClick={() => setSchedule({ ...schedule, schedule_type: 'weekly' })}
                        className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all ${schedule.schedule_type === 'weekly' ? 'bg-accent text-white' : 'bg-dark-50 text-gray-400 hover:bg-dark-100'}`}
                    >
                        <Calendar className="w-4 h-4" />
                        По дням недели
                    </button>
                    <button
                        onClick={() => setSchedule({ ...schedule, schedule_type: 'shift' })}
                        className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all ${schedule.schedule_type === 'shift' ? 'bg-accent text-white' : 'bg-dark-50 text-gray-400 hover:bg-dark-100'}`}
                    >
                        <Repeat className="w-4 h-4" />
                        Сменный график
                    </button>
                </div>
            </div>

            {/* Shift Schedule Settings */}
            {schedule.schedule_type === 'shift' && (
                <div className="dark-card p-4 mb-6">
                    <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                        <Repeat className="w-4 h-4 text-accent" />
                        Настройки сменного графика
                    </h3>

                    {/* Presets */}
                    <div className="mb-4">
                        <label className="text-sm text-gray-400 mb-2 block">Быстрый выбор</label>
                        <div className="flex gap-2">
                            {SHIFT_PRESETS.map(preset => (
                                <button
                                    key={preset.label}
                                    onClick={() => setSchedule({
                                        ...schedule,
                                        shift_work_days: preset.work,
                                        shift_off_days: preset.off
                                    })}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${schedule.shift_work_days === preset.work && schedule.shift_off_days === preset.off
                                        ? 'bg-accent text-white'
                                        : 'bg-dark-50 text-gray-400 hover:bg-dark-100'
                                        }`}
                                >
                                    {preset.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Custom values */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                            <label className="text-sm text-gray-400 mb-1 block">Рабочих дней</label>
                            <input
                                type="number"
                                min="1"
                                max="14"
                                value={schedule.shift_work_days}
                                onChange={e => setSchedule({ ...schedule, shift_work_days: parseInt(e.target.value) || 1 })}
                                className="w-full bg-dark-50 border border-card-border rounded-lg px-3 py-2 text-white"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-gray-400 mb-1 block">Выходных дней</label>
                            <input
                                type="number"
                                min="1"
                                max="14"
                                value={schedule.shift_off_days}
                                onChange={e => setSchedule({ ...schedule, shift_off_days: parseInt(e.target.value) || 1 })}
                                className="w-full bg-dark-50 border border-card-border rounded-lg px-3 py-2 text-white"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-gray-400 mb-1 block">Начало цикла</label>
                            <input
                                type="date"
                                value={schedule.cycle_start_date}
                                onChange={e => setSchedule({ ...schedule, cycle_start_date: e.target.value })}
                                className="w-full bg-dark-50 border border-card-border rounded-lg px-3 py-2 text-white"
                            />
                        </div>
                    </div>

                    {/* Work time for shift */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="text-sm text-gray-400 mb-1 block">Начало рабочего дня</label>
                            <select
                                value={schedule.work_start_time || '09:00'}
                                onChange={e => setSchedule({ ...schedule, work_start_time: e.target.value })}
                                className="w-full bg-dark-50 border border-card-border rounded-lg px-3 py-2 text-white"
                            >
                                {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm text-gray-400 mb-1 block">Конец рабочего дня</label>
                            <select
                                value={schedule.work_end_time || '18:00'}
                                onChange={e => setSchedule({ ...schedule, work_end_time: e.target.value })}
                                className="w-full bg-dark-50 border border-card-border rounded-lg px-3 py-2 text-white"
                            >
                                {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Preview */}
                    <div>
                        <label className="text-sm text-gray-400 mb-2 block">Предпросмотр (ближайшие 7 дней)</label>
                        <div className="flex gap-2">
                            {getShiftPreview().map((day, i) => (
                                <div
                                    key={i}
                                    className={`flex-1 p-2 rounded-lg text-center ${day.isWorking ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'}`}
                                >
                                    <div className="text-xs text-gray-400">{day.dayName}</div>
                                    <div className={`text-lg font-bold ${day.isWorking ? 'text-green-400' : 'text-red-400'}`}>
                                        {day.dayNum}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Tab Navigation */}
            <div className="flex gap-2 mb-4">
                {[
                    { id: 'hours' as const, label: 'Рабочие часы', icon: Clock },
                    { id: 'services' as const, label: 'Услуги', icon: Calendar },
                    { id: 'exceptions' as const, label: 'Выходные', icon: Calendar }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${activeTab === tab.id ? 'bg-accent text-white' : 'bg-dark-50 text-gray-400 hover:bg-dark-100'}`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'hours' && schedule.schedule_type === 'weekly' && (
                <div className="dark-card p-4">
                    <h3 className="font-semibold text-white mb-4">Рабочие часы по дням</h3>
                    <div className="space-y-3">
                        {DAYS_ORDER.map(dayIndex => {
                            const dayHours = hours.find(h => h.day_of_week === dayIndex) || {
                                day_of_week: dayIndex,
                                is_working: false,
                                start_time: '09:00',
                                end_time: '18:00'
                            };
                            return (
                                <div key={dayIndex} className="flex items-center gap-4 p-3 bg-dark-50 rounded-lg">
                                    <div className="w-28">
                                        <span className="text-white font-medium text-sm">{DAYS_FULL[dayIndex]}</span>
                                    </div>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={dayHours.is_working}
                                            onChange={e => {
                                                const newHours = hours.filter(h => h.day_of_week !== dayIndex);
                                                newHours.push({ ...dayHours, is_working: e.target.checked });
                                                setHours(newHours);
                                            }}
                                            className="w-4 h-4 accent-accent"
                                        />
                                        <span className="text-xs text-gray-400">Рабочий</span>
                                    </label>
                                    {dayHours.is_working && (
                                        <>
                                            <select
                                                value={dayHours.start_time}
                                                onChange={e => {
                                                    const newHours = hours.filter(h => h.day_of_week !== dayIndex);
                                                    newHours.push({ ...dayHours, start_time: e.target.value });
                                                    setHours(newHours);
                                                }}
                                                className="bg-dark-100 border border-card-border rounded px-2 py-1 text-sm text-white"
                                            >
                                                {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                            <span className="text-gray-500">—</span>
                                            <select
                                                value={dayHours.end_time}
                                                onChange={e => {
                                                    const newHours = hours.filter(h => h.day_of_week !== dayIndex);
                                                    newHours.push({ ...dayHours, end_time: e.target.value });
                                                    setHours(newHours);
                                                }}
                                                className="bg-dark-100 border border-card-border rounded px-2 py-1 text-sm text-white"
                                            >
                                                {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {activeTab === 'services' && (
                <div className="dark-card p-4">
                    <h3 className="font-semibold text-white mb-4">Услуги</h3>
                    <div className="space-y-2 mb-4">
                        {services.map(service => (
                            <div key={service.id} className="flex items-center justify-between p-3 bg-dark-50 rounded-lg">
                                <div>
                                    <span className="text-white font-medium">{service.name}</span>
                                    <span className="text-gray-500 text-sm ml-2">{service.duration_minutes} мин</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-accent font-semibold">{service.price?.toLocaleString()} ₸</span>
                                    <button onClick={() => handleDeleteService(service.id)} className="text-red-400 hover:text-red-300">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Название услуги"
                            value={newService.name}
                            onChange={e => setNewService({ ...newService, name: e.target.value })}
                            className="flex-1 bg-dark-50 border border-card-border rounded-lg px-3 py-2 text-white text-sm"
                        />
                        <input
                            type="number"
                            placeholder="Мин"
                            value={newService.duration_minutes}
                            onChange={e => setNewService({ ...newService, duration_minutes: parseInt(e.target.value) || 60 })}
                            className="w-20 bg-dark-50 border border-card-border rounded-lg px-3 py-2 text-white text-sm"
                        />
                        <input
                            type="text"
                            placeholder="Цена"
                            value={newService.price}
                            onChange={e => setNewService({ ...newService, price: e.target.value })}
                            className="w-24 bg-dark-50 border border-card-border rounded-lg px-3 py-2 text-white text-sm"
                        />
                        <button onClick={handleAddService} className="btn-primary px-3 py-2">
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {activeTab === 'exceptions' && (
                <div className="dark-card p-4">
                    <h3 className="font-semibold text-white mb-4">Выходные и особые дни</h3>
                    <div className="space-y-2 mb-4">
                        {exceptions.map(ex => (
                            <div key={ex.id} className="flex items-center justify-between p-3 bg-dark-50 rounded-lg">
                                <div>
                                    <span className="text-white font-medium">
                                        {new Date(ex.exception_date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </span>
                                    {ex.reason && <span className="text-gray-500 text-sm ml-2">({ex.reason})</span>}
                                </div>
                                <button onClick={() => handleDeleteException(ex.id)} className="text-red-400 hover:text-red-300">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="date"
                            value={newException.date}
                            onChange={e => setNewException({ ...newException, date: e.target.value })}
                            className="bg-dark-50 border border-card-border rounded-lg px-3 py-2 text-white text-sm"
                        />
                        <input
                            type="text"
                            placeholder="Причина (опционально)"
                            value={newException.reason}
                            onChange={e => setNewException({ ...newException, reason: e.target.value })}
                            className="flex-1 bg-dark-50 border border-card-border rounded-lg px-3 py-2 text-white text-sm"
                        />
                        <button onClick={handleAddException} className="btn-primary px-3 py-2">
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </PageContainer>
    );
}

// Main component with Suspense wrapper
export default function ScheduleSettingsPage() {
    return (
        <Suspense fallback={
            <PageContainer>
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
                </div>
            </PageContainer>
        }>
            <ScheduleSettingsContent />
        </Suspense>
    );
}
