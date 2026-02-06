'use client';

import { useState, useEffect } from 'react';
import { Send, Loader2, Check, XCircle, RefreshCw, ExternalLink, Copy } from 'lucide-react';

interface TelegramConnectorProps {
    botId: string;
}

export default function TelegramConnector({ botId }: TelegramConnectorProps) {
    const [token, setToken] = useState('');
    const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
    const [botInfo, setBotInfo] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [hasToken, setHasToken] = useState(false);

    useEffect(() => {
        checkStatus();
    }, [botId]);

    const checkStatus = async () => {
        try {
            const res = await fetch('/api/telegram/status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ botId })
            });
            const data = await res.json();

            if (data.isRunning) {
                setStatus('connected');
            } else {
                setStatus('disconnected');
            }
            setHasToken(data.hasToken || false);
        } catch (e) {
            console.error('Status check failed:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = async () => {
        if (!token.trim() && !hasToken) {
            setError('Введите токен бота');
            return;
        }

        setStatus('connecting');
        setError(null);

        try {
            const res = await fetch('/api/telegram/init', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    botId,
                    token: token.trim() || undefined
                })
            });

            const data = await res.json();

            if (res.ok) {
                setStatus('connected');
                setBotInfo(data.botInfo);
                setHasToken(true);
                setToken('');
            } else {
                setError(data.error || 'Не удалось подключиться');
                setStatus('disconnected');
            }
        } catch (e: any) {
            setError(e.message);
            setStatus('disconnected');
        }
    };

    const handleDisconnect = async () => {
        try {
            await fetch('/api/telegram/disconnect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ botId })
            });
            setStatus('disconnected');
            setBotInfo(null);
        } catch (e) {
            console.error('Disconnect failed:', e);
        }
    };

    if (loading) {
        return (
            <div className="dark-card p-8 flex justify-center">
                <Loader2 className="w-8 h-8 text-accent animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Status Card */}
            <div className="dark-card p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-white flex items-center gap-2">
                        <Send className="w-5 h-5 text-[#229ED9]" />
                        Telegram Bot
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${status === 'connected'
                            ? 'bg-emerald-500/20 text-emerald-500'
                            : status === 'connecting'
                                ? 'bg-amber-500/20 text-amber-500'
                                : 'bg-gray-500/20 text-gray-500'
                        }`}>
                        {status === 'connected' ? 'Подключен' :
                            status === 'connecting' ? 'Подключение...' : 'Отключен'}
                    </span>
                </div>

                {status === 'connected' ? (
                    <div className="space-y-4">
                        {/* Connected Info */}
                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Check className="w-6 h-6 text-emerald-500" />
                                <div>
                                    <p className="text-white font-medium">
                                        Бот активен{botInfo?.username ? `: @${botInfo.username}` : ''}
                                    </p>
                                    <p className="text-sm text-gray-400">
                                        Сообщения обрабатываются автоматически
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Bot Link */}
                        {botInfo?.username && (
                            <a
                                href={`https://t.me/${botInfo.username}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-[#229ED9] hover:underline"
                            >
                                <ExternalLink className="w-4 h-4" />
                                Открыть в Telegram
                            </a>
                        )}

                        {/* Disconnect Button */}
                        <button
                            onClick={handleDisconnect}
                            className="btn-secondary flex items-center gap-2"
                        >
                            <XCircle className="w-4 h-4" />
                            Отключить бота
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Instructions */}
                        <div className="p-4 bg-[#1a1a1a] rounded-lg">
                            <h4 className="font-medium text-white mb-2">Как получить токен:</h4>
                            <ol className="text-sm text-gray-400 space-y-1 list-decimal list-inside">
                                <li>Откройте <a href="https://t.me/BotFather" target="_blank" className="text-[#229ED9] hover:underline">@BotFather</a> в Telegram</li>
                                <li>Отправьте команду <code className="bg-gray-700 px-1 rounded">/newbot</code></li>
                                <li>Следуйте инструкциям и скопируйте токен</li>
                            </ol>
                        </div>

                        {/* Token Input */}
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">
                                Токен бота {hasToken && <span className="text-gray-600">(уже сохранён)</span>}
                            </label>
                            <input
                                type="text"
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                placeholder={hasToken ? "Оставьте пустым для использования сохранённого" : "123456:ABC-DEF1234ghIkl..."}
                                className="search-input w-full font-mono text-sm"
                            />
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Connect Button */}
                        <button
                            onClick={handleConnect}
                            disabled={status === 'connecting'}
                            className="btn-primary flex items-center gap-2"
                        >
                            {status === 'connecting' ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Send className="w-4 h-4" />
                            )}
                            {status === 'connecting' ? 'Подключение...' : 'Подключить бота'}
                        </button>
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="dark-card p-6">
                <h4 className="font-medium text-white mb-3">Как это работает</h4>
                <ul className="text-sm text-gray-400 space-y-2">
                    <li className="flex items-start gap-2">
                        <span className="text-accent">•</span>
                        Бот использует тот же Flow Builder что и WhatsApp
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-accent">•</span>
                        Все лиды сохраняются на странице "Лиды"
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-accent">•</span>
                        AI отвечает если нет подходящего правила
                    </li>
                </ul>
            </div>
        </div>
    );
}
