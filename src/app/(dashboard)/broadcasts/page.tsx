'use client';

import { useState, useEffect } from 'react';
import { Send, Plus, Clock, Users, CheckCircle, XCircle, Play, Pause, Trash2, AlertCircle } from 'lucide-react';

interface Broadcast {
    id: string;
    bot_id: string;
    name: string;
    message: string;
    scheduled_at: string | null;
    target_type: 'all' | 'with_appointments' | 'custom';
    daily_limit: number;
    delay_seconds: number;
    status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'cancelled';
    total_recipients: number;
    sent_count: number;
    failed_count: number;
    created_at: string;
}

export default function BroadcastsPage() {
    const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
    const [loading, setLoading] = useState(true);
    const [bots, setBots] = useState<any[]>([]);
    const [selectedBotId, setSelectedBotId] = useState<string | null>(null);
    const [dailyRemaining, setDailyRemaining] = useState(30);
    const [showCreateForm, setShowCreateForm] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        message: '',
        target_type: 'all' as 'all' | 'with_appointments' | 'custom',
        scheduled_at: '',
        daily_limit: 30,
        delay_seconds: 60
    });

    // Load bots
    useEffect(() => {
        fetch('/api/bots')
            .then(res => res.json())
            .then(data => {
                setBots(data.bots || []);
                if (data.bots?.length > 0) {
                    setSelectedBotId(data.bots[0].id);
                }
            });
    }, []);

    // Load broadcasts
    useEffect(() => {
        if (!selectedBotId) return;
        setLoading(true);
        fetch(`/api/broadcasts?bot_id=${selectedBotId}`)
            .then(res => res.json())
            .then(data => {
                setBroadcasts(data.broadcasts || []);
                setDailyRemaining(data.dailyRemaining || 30);
                setLoading(false);
            });
    }, [selectedBotId]);

    const handleCreate = async () => {
        if (!formData.message || !selectedBotId) return;

        const res = await fetch('/api/broadcasts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                bot_id: selectedBotId,
                ...formData,
                scheduled_at: formData.scheduled_at || null
            })
        });

        const data = await res.json();
        if (data.broadcast) {
            setBroadcasts([data.broadcast, ...broadcasts]);
            setFormData({
                name: '',
                message: '',
                target_type: 'all',
                scheduled_at: '',
                daily_limit: 30,
                delay_seconds: 60
            });
            setShowCreateForm(false);
        }
    };

    const handleAction = async (id: string, action: 'start' | 'cancel') => {
        await fetch('/api/broadcasts', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, action })
        });

        // Refresh
        const res = await fetch(`/api/broadcasts?bot_id=${selectedBotId}`);
        const data = await res.json();
        setBroadcasts(data.broadcasts || []);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Удалить эту рассылку?')) return;
        await fetch(`/api/broadcasts?id=${id}`, { method: 'DELETE' });
        setBroadcasts(broadcasts.filter(b => b.id !== id));
    };

    const getStatusBadge = (status: Broadcast['status']) => {
        const styles: Record<string, { bg: string; color: string; icon: any }> = {
            draft: { bg: '#374151', color: '#9ca3af', icon: Clock },
            scheduled: { bg: '#1e3a5f', color: '#60a5fa', icon: Clock },
            sending: { bg: '#065f46', color: '#34d399', icon: Play },
            completed: { bg: '#14532d', color: '#22c55e', icon: CheckCircle },
            cancelled: { bg: '#7f1d1d', color: '#f87171', icon: XCircle }
        };
        const style = styles[status] || styles.draft;
        const Icon = style.icon;
        const labels: Record<string, string> = {
            draft: 'Черновик',
            scheduled: 'Запланировано',
            sending: 'Отправляется',
            completed: 'Завершено',
            cancelled: 'Отменено'
        };
        return (
            <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 10px',
                borderRadius: 6,
                background: style.bg,
                color: style.color,
                fontSize: 13
            }}>
                <Icon size={14} />
                {labels[status]}
            </span>
        );
    };

    return (
        <div className="broadcasts-page">
            <style jsx>{`
                .broadcasts-page {
                    padding: 24px;
                    max-width: 1000px;
                    margin: 0 auto;
                }

                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                    flex-wrap: wrap;
                    gap: 16px;
                }

                .page-title {
                    font-size: 24px;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .quota-badge {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 16px;
                    background: var(--bg-secondary);
                    border-radius: 8px;
                    font-size: 14px;
                    color: var(--text-secondary);
                }

                .quota-number {
                    font-weight: 600;
                    color: #22c55e;
                }

                .controls-bar {
                    display: flex;
                    gap: 12px;
                    margin-bottom: 24px;
                }

                .btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 16px;
                    border-radius: 8px;
                    border: none;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                    transition: all 0.2s;
                }

                .btn-primary {
                    background: #22c55e;
                    color: white;
                }

                .btn-primary:hover {
                    background: #16a34a;
                }

                .btn-secondary {
                    background: var(--bg-secondary);
                    color: var(--text-primary);
                    border: 1px solid var(--border-color);
                }

                .btn-secondary:hover {
                    background: var(--bg-tertiary);
                }

                .btn-icon {
                    padding: 8px;
                }

                .btn-danger {
                    background: #7f1d1d;
                    color: #f87171;
                }

                .bot-select {
                    padding: 10px 16px;
                    border-radius: 8px;
                    border: 1px solid var(--border-color);
                    background: var(--bg-secondary);
                    color: var(--text-primary);
                    font-size: 14px;
                }

                .create-form {
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    padding: 20px;
                    margin-bottom: 24px;
                }

                .form-group {
                    margin-bottom: 16px;
                }

                .form-group label {
                    display: block;
                    font-size: 13px;
                    color: var(--text-secondary);
                    margin-bottom: 6px;
                }

                .form-group input,
                .form-group textarea,
                .form-group select {
                    width: 100%;
                    padding: 10px 12px;
                    border-radius: 8px;
                    border: 1px solid var(--border-color);
                    background: var(--bg-primary);
                    color: var(--text-primary);
                    font-size: 14px;
                }

                .form-group textarea {
                    min-height: 100px;
                    resize: vertical;
                }

                .form-row {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                    gap: 16px;
                }

                .form-actions {
                    display: flex;
                    gap: 12px;
                    justify-content: flex-end;
                    margin-top: 20px;
                }

                .broadcast-card {
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    padding: 20px;
                    margin-bottom: 16px;
                }

                .broadcast-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 12px;
                }

                .broadcast-name {
                    font-size: 16px;
                    font-weight: 600;
                }

                .broadcast-message {
                    background: var(--bg-primary);
                    padding: 12px;
                    border-radius: 8px;
                    font-size: 14px;
                    margin-bottom: 16px;
                    white-space: pre-wrap;
                    max-height: 100px;
                    overflow: hidden;
                }

                .broadcast-stats {
                    display: flex;
                    gap: 20px;
                    padding-top: 12px;
                    border-top: 1px solid var(--border-color);
                    flex-wrap: wrap;
                }

                .stat-item {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 13px;
                    color: var(--text-secondary);
                }

                .stat-value {
                    font-weight: 600;
                    color: var(--text-primary);
                }

                .broadcast-actions {
                    display: flex;
                    gap: 8px;
                    margin-top: 16px;
                }

                .empty-state {
                    text-align: center;
                    padding: 60px 20px;
                    color: var(--text-secondary);
                }

                .empty-state h3 {
                    font-size: 18px;
                    margin-bottom: 8px;
                    color: var(--text-primary);
                }

                .warning-box {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    padding: 16px;
                    background: rgba(251, 191, 36, 0.1);
                    border: 1px solid rgba(251, 191, 36, 0.3);
                    border-radius: 8px;
                    margin-bottom: 20px;
                }

                .warning-icon {
                    color: #fbbf24;
                    flex-shrink: 0;
                }

                .warning-text {
                    font-size: 13px;
                    color: var(--text-secondary);
                    line-height: 1.5;
                }
            `}</style>

            <div className="page-header">
                <h1 className="page-title">
                    <Send size={24} />
                    Рассылки
                </h1>
                <div className="quota-badge">
                    <Clock size={16} />
                    Сегодня осталось: <span className="quota-number">{dailyRemaining}</span> / 30
                </div>
            </div>

            <div className="controls-bar">
                <select
                    className="bot-select"
                    value={selectedBotId || ''}
                    onChange={(e) => setSelectedBotId(e.target.value)}
                    style={{ colorScheme: 'dark' }}
                >
                    {bots.map(bot => (
                        <option key={bot.id} value={bot.id}>{bot.name}</option>
                    ))}
                </select>
                <button className="btn btn-primary" onClick={() => setShowCreateForm(true)}>
                    <Plus size={16} />
                    Новая рассылка
                </button>
            </div>

            {showCreateForm && (
                <div className="create-form">
                    <div className="warning-box">
                        <AlertCircle size={20} className="warning-icon" />
                        <div className="warning-text">
                            <strong>Защита от спама:</strong> Максимум 30 сообщений в день.
                            Сообщения отправляются с интервалом, чтобы не блокировали аккаунт.
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Название рассылки</label>
                        <input
                            placeholder="Например: Напоминание о записи"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label>Текст сообщения *</label>
                        <textarea
                            placeholder="Введите текст сообщения...

Можно использовать HTML-теги:
<b>жирный</b>, <i>курсив</i>"
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Кому отправить</label>
                            <select
                                value={formData.target_type}
                                onChange={(e) => setFormData({ ...formData, target_type: e.target.value as any })}
                                style={{ colorScheme: 'dark' }}
                            >
                                <option value="all">Всем клиентам</option>
                                <option value="with_appointments">С активными записями</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Запланировать на</label>
                            <input
                                type="datetime-local"
                                value={formData.scheduled_at}
                                onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Лимит в день</label>
                            <input
                                type="number"
                                value={formData.daily_limit}
                                onChange={(e) => setFormData({ ...formData, daily_limit: parseInt(e.target.value) || 30 })}
                                min={1}
                                max={100}
                            />
                        </div>

                        <div className="form-group">
                            <label>Интервал между сообщениями (сек)</label>
                            <input
                                type="number"
                                value={formData.delay_seconds}
                                onChange={(e) => setFormData({ ...formData, delay_seconds: parseInt(e.target.value) || 60 })}
                                min={10}
                                max={600}
                            />
                        </div>
                    </div>

                    <div className="form-actions">
                        <button className="btn btn-secondary" onClick={() => setShowCreateForm(false)}>
                            Отмена
                        </button>
                        <button className="btn btn-primary" onClick={handleCreate}>
                            <Plus size={16} />
                            Создать рассылку
                        </button>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="empty-state">Загрузка...</div>
            ) : broadcasts.length === 0 ? (
                <div className="empty-state">
                    <Send size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
                    <h3>Нет рассылок</h3>
                    <p>Создайте первую рассылку для уведомления клиентов</p>
                </div>
            ) : (
                broadcasts.map(bc => (
                    <div key={bc.id} className="broadcast-card">
                        <div className="broadcast-header">
                            <div className="broadcast-name">{bc.name}</div>
                            {getStatusBadge(bc.status)}
                        </div>

                        <div className="broadcast-message">{bc.message}</div>

                        <div className="broadcast-stats">
                            <div className="stat-item">
                                <Users size={14} />
                                Получателей: <span className="stat-value">{bc.total_recipients}</span>
                            </div>
                            <div className="stat-item">
                                <CheckCircle size={14} style={{ color: '#22c55e' }} />
                                Отправлено: <span className="stat-value">{bc.sent_count}</span>
                            </div>
                            {bc.failed_count > 0 && (
                                <div className="stat-item">
                                    <XCircle size={14} style={{ color: '#f87171' }} />
                                    Ошибок: <span className="stat-value">{bc.failed_count}</span>
                                </div>
                            )}
                            {bc.scheduled_at && (
                                <div className="stat-item">
                                    <Clock size={14} />
                                    Запуск: <span className="stat-value">
                                        {new Date(bc.scheduled_at).toLocaleString('ru-RU')}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="broadcast-actions">
                            {(bc.status === 'draft' || bc.status === 'scheduled') && (
                                <button
                                    className="btn btn-primary"
                                    onClick={() => handleAction(bc.id, 'start')}
                                >
                                    <Play size={14} />
                                    Запустить
                                </button>
                            )}
                            {bc.status === 'sending' && (
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => handleAction(bc.id, 'cancel')}
                                >
                                    <Pause size={14} />
                                    Остановить
                                </button>
                            )}
                            <button
                                className="btn btn-icon btn-danger"
                                onClick={() => handleDelete(bc.id)}
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}
