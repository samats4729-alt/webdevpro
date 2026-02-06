"use client";
import { AlertTriangle, Clock, Mail, RefreshCw, Zap, Shield } from "lucide-react";
import { useEffect, useState } from "react";

export default function MaintenancePage() {
    const [dots, setDots] = useState("");

    useEffect(() => {
        const interval = setInterval(() => {
            setDots(prev => prev.length >= 3 ? "" : prev + ".");
        }, 500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-[#030308] flex items-center justify-center p-4 overflow-hidden relative">
            {/* Animated gradient orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-amber-500/20 via-orange-500/10 to-transparent blur-[120px] animate-pulse" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-amber-600/10 to-transparent rounded-full blur-[100px]" />
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gradient-to-tl from-orange-600/10 to-transparent rounded-full blur-[100px]" />
            </div>

            {/* Grid pattern overlay */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
                    backgroundSize: '60px 60px'
                }}
            />

            {/* Floating particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-amber-500/30 rounded-full animate-float"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${5 + Math.random() * 10}s`
                        }}
                    />
                ))}
            </div>

            <div className="relative z-10 max-w-2xl w-full">
                {/* Main card */}
                <div className="relative">
                    {/* Glow effect behind card */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 rounded-3xl blur-xl opacity-50" />

                    <div className="relative bg-gradient-to-b from-white/[0.08] to-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-3xl p-8 md:p-12 overflow-hidden">
                        {/* Inner glow */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[1px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

                        {/* Icon with rings */}
                        <div className="relative w-24 h-24 mx-auto mb-8">
                            <div className="absolute inset-0 rounded-full bg-amber-500/5 animate-ping" style={{ animationDuration: '3s' }} />
                            <div className="absolute inset-2 rounded-full bg-amber-500/10 animate-ping" style={{ animationDuration: '3s', animationDelay: '0.5s' }} />
                            <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center shadow-lg shadow-amber-500/20">
                                <Zap className="w-12 h-12 text-amber-400" />
                            </div>
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl md:text-4xl font-bold text-center mb-4">
                            <span className="bg-gradient-to-r from-white via-amber-100 to-white bg-clip-text text-transparent">
                                Обновление системы
                            </span>
                        </h1>

                        {/* Description */}
                        <p className="text-gray-400 text-center text-lg mb-8 max-w-md mx-auto">
                            Мы проводим плановые работы для повышения качества сервиса{dots}
                        </p>

                        {/* Status indicators */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-white/[0.03] rounded-2xl p-4 border border-white/5">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                                    <span className="text-xs text-amber-400 font-medium uppercase tracking-wider">Статус</span>
                                </div>
                                <p className="text-white font-semibold">Работы ведутся</p>
                            </div>
                            <div className="bg-white/[0.03] rounded-2xl p-4 border border-white/5">
                                <div className="flex items-center gap-3 mb-2">
                                    <Clock className="w-3 h-3 text-gray-500" />
                                    <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Время</span>
                                </div>
                                <p className="text-white font-semibold">~15 минут</p>
                            </div>
                        </div>

                        {/* Progress bar */}
                        <div className="mb-8">
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full animate-progress"
                                    style={{ width: '65%' }}
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={() => window.location.reload()}
                                className="flex-1 group relative px-6 py-4 rounded-xl overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <div className="absolute inset-0 bg-white/5 group-hover:bg-white/10 transition-colors" />
                                <div className="absolute inset-0 border border-white/10 group-hover:border-white/20 rounded-xl transition-colors" />
                                <div className="relative flex items-center justify-center gap-2 text-white font-medium">
                                    <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                                    Обновить
                                </div>
                            </button>

                            <a
                                href="mailto:support@tenderai.kz"
                                className="flex-1 group relative px-6 py-4 rounded-xl overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500" />
                                <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="relative flex items-center justify-center gap-2 text-black font-medium">
                                    <Mail className="w-4 h-4" />
                                    Связаться
                                </div>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Trust badge */}
                <div className="mt-8 flex items-center justify-center gap-3 text-gray-500">
                    <Shield className="w-4 h-4" />
                    <span className="text-sm">Ваши данные в безопасности</span>
                </div>
            </div>

            {/* Floating animation styles */}
            <style jsx global>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0) translateX(0); opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { transform: translateY(-100vh) translateX(20px); opacity: 0; }
                }
                .animate-float {
                    animation: float linear infinite;
                }
                @keyframes progress {
                    0% { width: 0%; }
                    50% { width: 65%; }
                    100% { width: 100%; }
                }
                .animate-progress {
                    animation: progress 8s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}
