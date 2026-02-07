"use client";

import { useState, useEffect } from "react";
import { Bot, QrCode, Wifi, WifiOff, RefreshCw, MessageCircle } from "lucide-react";
import QRCode from "qrcode";

export default function AdminPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [otpBot, setOtpBot] = useState<{
        status: string;
        qrCode: string | null;
        deviceInfo: any;
    } | null>(null);
    const [qrImage, setQrImage] = useState<string | null>(null);

    const fetchOtpBotStatus = async () => {
        try {
            const res = await fetch('/api/admin/otp-bot');
            if (res.ok) {
                const data = await res.json();
                setOtpBot(data);

                // Generate QR image if qrCode exists
                if (data.qrCode) {
                    const qrImageUrl = await QRCode.toDataURL(data.qrCode, { width: 256 });
                    setQrImage(qrImageUrl);
                } else {
                    setQrImage(null);
                }
            } else if (res.status === 403) {
                setError('Доступ запрещен. Только для администратора.');
            }
        } catch (err) {
            console.error('Error fetching OTP bot status:', err);
        }
    };

    useEffect(() => {
        fetchOtpBotStatus();

        // Poll for status updates
        const interval = setInterval(fetchOtpBotStatus, 3000);
        return () => clearInterval(interval);
    }, []);

    const handleConnect = async () => {
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/admin/otp-bot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'connect' })
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Ошибка подключения');
            } else {
                await fetchOtpBotStatus();
            }
        } catch (err) {
            setError('Ошибка соединения');
        } finally {
            setLoading(false);
        }
    };

    const handleDisconnect = async () => {
        setLoading(true);

        try {
            await fetch('/api/admin/otp-bot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'disconnect' })
            });
            await fetchOtpBotStatus();
        } catch (err) {
            setError('Ошибка отключения');
        } finally {
            setLoading(false);
        }
    };

    if (error === 'Доступ запрещен. Только для администратора.') {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="text-center">
                    <Bot className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-white mb-2">Доступ запрещен</h1>
                    <p className="text-gray-400">Эта страница только для администратора</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Bot className="w-8 h-8 text-accent" />
                Admin Panel
            </h1>

            {/* OTP Bot Section */}
            <div className="bg-[#111] border border-white/10 rounded-2xl p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                            <MessageCircle className="w-6 h-6 text-green-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">OTP Bot (WhatsApp)</h2>
                            <p className="text-sm text-gray-400">Бот для отправки кодов авторизации</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {otpBot?.status === 'connected' ? (
                            <span className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 text-green-400 rounded-full text-sm">
                                <Wifi className="w-4 h-4" />
                                Подключен
                            </span>
                        ) : otpBot?.status === 'connecting' ? (
                            <span className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/20 text-yellow-400 rounded-full text-sm">
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                Подключение...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 text-red-400 rounded-full text-sm">
                                <WifiOff className="w-4 h-4" />
                                Отключен
                            </span>
                        )}
                    </div>
                </div>

                {error && error !== 'Доступ запрещен. Только для администратора.' && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-4">
                        <p className="text-red-400 text-sm">{error}</p>
                    </div>
                )}

                {/* QR Code Section */}
                {otpBot?.status === 'connecting' && qrImage && (
                    <div className="flex flex-col items-center mb-6">
                        <div className="bg-white p-4 rounded-2xl mb-4">
                            <img src={qrImage} alt="QR Code" className="w-64 h-64" />
                        </div>
                        <p className="text-gray-400 text-sm text-center">
                            Откройте WhatsApp → Связанные устройства → Привязать устройство
                        </p>
                    </div>
                )}

                {/* Device Info */}
                {otpBot?.status === 'connected' && otpBot?.deviceInfo && (
                    <div className="bg-white/5 rounded-xl p-4 mb-6">
                        <p className="text-sm text-gray-300">
                            <span className="text-gray-500">Устройство:</span> {otpBot.deviceInfo.platform || 'WhatsApp'}
                        </p>
                        <p className="text-sm text-gray-300">
                            <span className="text-gray-500">Номер:</span> {otpBot.deviceInfo.phone || 'Загрузка...'}
                        </p>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                    {otpBot?.status !== 'connected' ? (
                        <button
                            onClick={handleConnect}
                            disabled={loading}
                            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <RefreshCw className="w-5 h-5 animate-spin" />
                            ) : (
                                <QrCode className="w-5 h-5" />
                            )}
                            {loading ? 'Подключение...' : 'Подключить WhatsApp'}
                        </button>
                    ) : (
                        <button
                            onClick={handleDisconnect}
                            disabled={loading}
                            className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-medium py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                            <WifiOff className="w-5 h-5" />
                            Отключить
                        </button>
                    )}

                    <button
                        onClick={fetchOtpBotStatus}
                        className="bg-white/5 hover:bg-white/10 text-gray-400 p-3 rounded-xl transition-all"
                    >
                        <RefreshCw className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Info Section */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <h3 className="text-blue-400 font-medium mb-2">ℹ️ Как это работает</h3>
                <ul className="text-sm text-gray-400 space-y-1">
                    <li>• Этот бот используется для отправки OTP кодов при авторизации по телефону</li>
                    <li>• Подключите WhatsApp аккаунт, который будет отправлять коды</li>
                    <li>• Рекомендуется использовать отдельный номер для бизнеса</li>
                </ul>
            </div>
        </div>
    );
}
