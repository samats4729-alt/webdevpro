"use client";

import { useEffect, useState, useRef } from 'react';
import { Loader2, Smartphone, CheckCircle, RefreshCw, LogOut } from 'lucide-react';
import Image from 'next/image';
import HolographicTicket from './HolographicTicket';

interface WhatsAppConnectorProps {
    botId: string;
}

type ConnectionStatus = 'disconnected' | 'initializing' | 'connected' | 'qr_ready';

export default function WhatsAppConnector({ botId }: WhatsAppConnectorProps) {
    const [status, setStatus] = useState<ConnectionStatus>('disconnected');
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [deviceInfo, setDeviceInfo] = useState<any>(null);

    // Polling for status
    useEffect(() => {
        checkStatus();
        const interval = setInterval(checkStatus, 5000);
        return () => clearInterval(interval);
    }, [botId]);

    const checkStatus = async () => {
        try {
            const res = await fetch(`/api/whatsapp/status?botId=${botId}&t=${Date.now()}`, {
                cache: 'no-store',
                headers: { 'Pragma': 'no-cache' }
            });

            if (!res.ok) {
                // If 401/500, just log and retry later, don't crash state
                console.warn('Status check failed:', res.status);
                return;
            }

            const data = await res.json();

            if (data.connected) {
                setStatus('connected');
                setDeviceInfo(data.info);
                setQrCode(null);
            } else if (data.status === 'initializing') {
                setStatus('initializing');
                setQrCode(null); // Clear QR if initializing (e.g. after scan)
            } else if (status === 'connected') {
                // Was connected, now disconnected
                setStatus('disconnected');
                setDeviceInfo(null);
            } else if (data.qrCode) {
                // Update QR if available
                setQrCode(data.qrCode);
                if (status !== 'initializing') setStatus('qr_ready');
            }
        } catch (err) {
            console.error('Failed to check status', err);
        }
    };

    const handleConnect = async () => {
        setLoading(true);
        setError(null);
        setStatus('initializing');

        try {
            const res = await fetch('/api/whatsapp/init', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ botId, force: true }) // Force fresh session on user action
            });

            const data = await res.json();

            if (data.error) {
                throw new Error(data.error);
            }

            if (data.qrCode) {
                setQrCode(data.qrCode);
                setStatus('qr_ready');
            } else if (data.status === 'already_initialized') {
                checkStatus();
            } else if (data.status === 'initializing') {
                // If still initializing, just wait for the poller (checkStatus) to pick it up
                setStatus('initializing');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to initialize WhatsApp');
            setStatus('disconnected');
        } finally {
            setLoading(false);
        }
    };

    const handleDisconnect = async () => {
        if (!confirm('Отключить бота? Он исчезнет из списка "Связанные устройства" в вашем WhatsApp на телефоне.\n\nСам бот останется в панели управления, но перейдет в статус OFFLINE.')) {
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/whatsapp/disconnect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ botId })
            });

            const data = await res.json();
            if (data.error) {
                throw new Error(data.error);
            }

            setStatus('disconnected');
            setQrCode(null);
        } catch (err: any) {
            setError(err.message || 'Failed to disconnect');
        } finally {
            setLoading(false);
        }
    };

    if (status === 'connected') {
        return (
            <div className="dark-card p-4 border-green-500/30 bg-green-500/5">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-green-500/20 flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-white">WhatsApp Подключен</h3>
                            <p className="text-xs text-gray-400">
                                {deviceInfo?.pushname || 'Неизвестно'} · <span className="text-gray-500">{deviceInfo?.me?._serialized?.split('@')[0]}</span>
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleDisconnect}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-colors rounded-lg border border-red-500/20"
                        title="Завершить сессию на телефоне"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                        Выйти
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="dark-card p-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                <Smartphone className="w-6 h-6 text-accent" />
            </div>

            <h3 className="text-base font-semibold text-white mb-1">Connect WhatsApp</h3>
            <p className="text-xs text-gray-400 mb-6 max-w-sm">
                Scan the QR code with your phone to connect your WhatsApp account to this bot.
            </p>

            {error && (
                <div className="bg-red-500/10 text-red-400 p-3 rounded-lg text-sm mb-6 max-w-sm w-full">
                    {error}
                </div>
            )}

            {status === 'qr_ready' && qrCode ? (
                <div className="w-full mb-6 flex flex-col items-center">
                    <HolographicTicket qrCodeUrl={qrCode} />
                    <p className="text-xs text-gray-500 mt-[-50px] relative z-20">
                        Обновлено: {new Date().toLocaleTimeString()}
                    </p>
                </div>
            ) : null}

            {status === 'initializing' && !qrCode && (
                <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-accent animate-spin mb-4" />
                    <p className="text-sm text-gray-400">Initializing WhatsApp client...</p>
                    <p className="text-xs text-gray-500 mt-2">This may take a few seconds</p>
                </div>
            )}

            {status === 'disconnected' && (
                <button
                    onClick={handleConnect}
                    disabled={loading}
                    className="btn-primary py-2 px-6 text-sm flex items-center gap-2"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Connecting...
                        </>
                    ) : (
                        <>
                            <RefreshCw className="w-3.5 h-3.5" />
                            Generate QR Code
                        </>
                    )}
                </button>
            )}

            {status === 'qr_ready' && (
                <p className="text-xs text-gray-500 mt-4 animate-pulse">
                    Waiting for scan...
                </p>
            )}
        </div>
    );
}
