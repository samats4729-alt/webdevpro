"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bot, Mail, Lock, ArrowRight, ChevronLeft, Sparkles, Phone, MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/i18n";

export default function LoginPage() {
    const router = useRouter();
    const { t } = useLanguage();
    const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [otpCode, setOtpCode] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");



    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const supabase = createClient();
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            router.push("/dashboard");
            router.refresh();
        }
    };

    const handleSendOTP = async () => {
        if (!phone) {
            setError("Введите номер телефона");
            return;
        }

        setError("");
        setSuccess("");
        setLoading(true);

        try {
            const res = await fetch('/api/auth/phone/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone })
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Ошибка отправки кода');
            } else {
                setOtpSent(true);
                setSuccess('Код отправлен в WhatsApp!');
            }
        } catch (err) {
            setError('Ошибка соединения');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!otpCode) {
            setError("Введите код из WhatsApp");
            return;
        }

        setError("");
        setLoading(true);

        try {
            const res = await fetch('/api/auth/phone/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, code: otpCode })
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Неверный код');
            } else {
                // Refresh the page to get the new session
                router.push("/dashboard");
                router.refresh();
            }
        } catch (err) {
            setError('Ошибка соединения');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020202] flex items-center justify-center px-6 relative overflow-hidden font-sans text-white">
            {/* --- Premium Background Effects --- */}

            {/* Animated Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px] opacity-20" />

            {/* Floating Orbs */}
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-accent/10 rounded-full blur-[120px] animate-pulse-slow" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] animate-pulse-slow delay-1000" />

            {/* Back Button */}
            <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-white/50 hover:text-white transition-colors group z-20">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-white/20 transition-all">
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                </div>
                <span className="text-sm font-light">На главную</span>
            </Link>

            <div className="w-full max-w-[420px] relative z-10">

                {/* Brand Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/20 to-transparent border border-accent/20 mb-6 shadow-[0_0_30px_rgba(74,222,128,0.2)]">
                        <Bot className="w-8 h-8 text-accent" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">WebDevPro</h1>
                    <p className="text-white/40 text-sm font-light">С возвращением!</p>
                </div>

                {/* Premium Glass Card */}
                <div className="relative group">
                    {/* Border Gradient Animation */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-accent/50 to-blue-500/50 rounded-3xl opacity-20 blur group-hover:opacity-40 transition duration-1000"></div>

                    <div className="relative bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">

                        {/* Auth Method Tabs */}
                        <div className="flex gap-2 mb-6 p-1 bg-white/5 rounded-xl">
                            <button
                                type="button"
                                onClick={() => { setAuthMethod('email'); setError(''); setSuccess(''); }}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${authMethod === 'email'
                                    ? 'bg-accent text-black'
                                    : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                <Mail className="w-4 h-4" />
                                Email
                            </button>
                            <button
                                type="button"
                                onClick={() => { setAuthMethod('phone'); setError(''); setSuccess(''); }}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${authMethod === 'phone'
                                    ? 'bg-green-500 text-white'
                                    : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                <MessageCircle className="w-4 h-4" />
                                WhatsApp
                            </button>
                        </div>

                        {/* Error/Success Messages */}
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3 mb-4">
                                <Sparkles className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-red-400 font-light">{error}</p>
                            </div>
                        )}
                        {success && (
                            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-start gap-3 mb-4">
                                <MessageCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-green-400 font-light">{success}</p>
                            </div>
                        )}

                        {/* Email Login Form */}
                        {authMethod === 'email' && (
                            <form onSubmit={handleLogin} className="space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-gray-400 ml-1 uppercase tracking-wider">Email</label>
                                    <div className="relative group/input">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within/input:text-accent transition-colors" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="name@company.com"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder:text-gray-600 focus:outline-none focus:bg-white/10 focus:border-accent/50 transition-all duration-300"
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-center ml-1">
                                        <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Пароль</label>
                                        <Link href="/forgot-password" className="text-xs text-accent hover:text-accent/80 transition-colors">Забыли пароль?</Link>
                                    </div>
                                    <div className="relative group/input">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within/input:text-accent transition-colors" />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder:text-gray-600 focus:outline-none focus:bg-white/10 focus:border-accent/50 transition-all duration-300"
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-accent text-black font-bold py-4 rounded-xl hover:bg-accent/90 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(74,222,128,0.3)] hover:shadow-[0_0_30px_rgba(74,222,128,0.5)] flex items-center justify-center gap-2 group/btn relative overflow-hidden"
                                    disabled={loading}
                                >
                                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 pointer-events-none" />
                                    <span className="relative">{loading ? 'Вход...' : 'Войти'}</span>
                                    {!loading && <ArrowRight className="w-5 h-5 relative group-hover/btn:translate-x-1 transition-transform" />}
                                </button>
                            </form>
                        )}

                        {/* Phone Login Form */}
                        {authMethod === 'phone' && (
                            <form onSubmit={handleVerifyOTP} className="space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-gray-400 ml-1 uppercase tracking-wider">Номер телефона</label>
                                    <div className="relative group/input">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within/input:text-green-400 transition-colors" />
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="+7 (XXX) XXX-XX-XX"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder:text-gray-600 focus:outline-none focus:bg-white/10 focus:border-green-500/50 transition-all duration-300"
                                            required
                                            disabled={loading || otpSent}
                                        />
                                    </div>
                                </div>

                                {!otpSent ? (
                                    <button
                                        type="button"
                                        onClick={handleSendOTP}
                                        className="w-full bg-green-500 text-white font-bold py-4 rounded-xl hover:bg-green-600 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] flex items-center justify-center gap-2"
                                        disabled={loading}
                                    >
                                        <MessageCircle className="w-5 h-5" />
                                        <span>{loading ? 'Отправка...' : 'Получить код в WhatsApp'}</span>
                                    </button>
                                ) : (
                                    <>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-medium text-gray-400 ml-1 uppercase tracking-wider">Код из WhatsApp</label>
                                            <input
                                                type="text"
                                                value={otpCode}
                                                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                placeholder="XXXXXX"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white text-center text-2xl tracking-[0.5em] placeholder:text-gray-600 focus:outline-none focus:bg-white/10 focus:border-green-500/50 transition-all duration-300"
                                                maxLength={6}
                                                required
                                                disabled={loading}
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            className="w-full bg-green-500 text-white font-bold py-4 rounded-xl hover:bg-green-600 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(34,197,94,0.3)] flex items-center justify-center gap-2"
                                            disabled={loading || otpCode.length !== 6}
                                        >
                                            <span>{loading ? 'Проверка...' : 'Войти'}</span>
                                            {!loading && <ArrowRight className="w-5 h-5" />}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => { setOtpSent(false); setOtpCode(''); setSuccess(''); }}
                                            className="w-full text-gray-400 hover:text-white text-sm transition-colors"
                                        >
                                            Отправить код повторно
                                        </button>
                                    </>
                                )}
                            </form>
                        )}

                        <p className="text-center text-sm text-gray-500 mt-8">
                            Нет аккаунта? <Link href="/signup" className="text-accent hover:text-accent/80 font-medium transition-colors ml-1 hover:underline decoration-accent/30">Регистрация</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
