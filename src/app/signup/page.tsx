"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bot, Mail, Lock, User, ArrowRight, ChevronLeft, Sparkles, Phone, MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/i18n";

export default function SignupPage() {
    const router = useRouter();
    const { t } = useLanguage();
    const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [otpCode, setOtpCode] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");



    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const supabase = createClient();
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name,
                },
            },
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
        <div className="min-h-screen bg-[#020202] flex items-center justify-center px-6 py-12 relative overflow-hidden font-sans text-white">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px] opacity-20" />
            <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-accent/10 rounded-full blur-[120px] animate-pulse-slow" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] animate-pulse-slow delay-1000" />

            <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-white/50 hover:text-white transition-colors group z-20">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-white/20 transition-all">
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                </div>
                <span className="text-sm font-light">На главную</span>
            </Link>

            <div className="w-full max-w-[420px] relative z-10">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-accent/20 to-transparent border border-accent/20 mb-4 shadow-[0_0_20px_rgba(74,222,128,0.15)]">
                        <Bot className="w-6 h-6 text-accent" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight mb-1">Регистрация</h1>
                    <p className="text-white/40 text-xs font-light">Создайте аккаунт</p>
                </div>

                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-accent/50 to-purple-500/50 rounded-3xl opacity-20 blur group-hover:opacity-40 transition duration-1000"></div>

                    <div className="relative bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">

                        {/* Auth Method Tabs */}
                        <div className="flex gap-2 mb-5 p-1 bg-white/5 rounded-xl">
                            <button
                                type="button"
                                onClick={() => { setAuthMethod('email'); setError(''); setSuccess(''); }}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${authMethod === 'email'
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
                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${authMethod === 'phone'
                                    ? 'bg-green-500 text-white'
                                    : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                <MessageCircle className="w-4 h-4" />
                                WhatsApp
                            </button>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-start gap-3 mb-4">
                                <Sparkles className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-red-400 font-light">{error}</p>
                            </div>
                        )}
                        {success && (
                            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 flex items-start gap-3 mb-4">
                                <MessageCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-green-400 font-light">{success}</p>
                            </div>
                        )}

                        {/* Email Form */}
                        {authMethod === 'email' && (
                            <form onSubmit={handleSignup} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-medium text-gray-400 ml-1 uppercase tracking-wider">Имя</label>
                                    <div className="relative group/input">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within/input:text-accent transition-colors" />
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Ваше имя"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:bg-white/10 focus:border-accent/50 transition-all duration-300"
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-medium text-gray-400 ml-1 uppercase tracking-wider">Email</label>
                                    <div className="relative group/input">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within/input:text-accent transition-colors" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="name@company.com"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:bg-white/10 focus:border-accent/50 transition-all duration-300"
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-medium text-gray-400 ml-1 uppercase tracking-wider">Пароль</label>
                                    <div className="relative group/input">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within/input:text-accent transition-colors" />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:bg-white/10 focus:border-accent/50 transition-all duration-300"
                                            required
                                            minLength={8}
                                            disabled={loading}
                                        />
                                    </div>
                                    <p className="text-[10px] text-gray-500 ml-1">Минимум 8 символов</p>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-accent text-black font-bold py-3 rounded-xl hover:bg-accent/90 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(74,222,128,0.3)] flex items-center justify-center gap-2"
                                    disabled={loading}
                                >
                                    <span className="text-sm">{loading ? 'Регистрация...' : 'Создать аккаунт'}</span>
                                    {!loading && <ArrowRight className="w-4 h-4" />}
                                </button>
                            </form>
                        )}

                        {/* Phone Form */}
                        {authMethod === 'phone' && (
                            <form onSubmit={handleVerifyOTP} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-medium text-gray-400 ml-1 uppercase tracking-wider">Номер телефона</label>
                                    <div className="relative group/input">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within/input:text-green-400 transition-colors" />
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="+7 (XXX) XXX-XX-XX"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:bg-white/10 focus:border-green-500/50 transition-all duration-300"
                                            required
                                            disabled={loading || otpSent}
                                        />
                                    </div>
                                </div>

                                {!otpSent ? (
                                    <button
                                        type="button"
                                        onClick={handleSendOTP}
                                        className="w-full bg-green-500 text-white font-bold py-3 rounded-xl hover:bg-green-600 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(34,197,94,0.3)] flex items-center justify-center gap-2"
                                        disabled={loading}
                                    >
                                        <MessageCircle className="w-4 h-4" />
                                        <span className="text-sm">{loading ? 'Отправка...' : 'Получить код в WhatsApp'}</span>
                                    </button>
                                ) : (
                                    <>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-medium text-gray-400 ml-1 uppercase tracking-wider">Код из WhatsApp</label>
                                            <input
                                                type="text"
                                                value={otpCode}
                                                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                placeholder="XXXXXX"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-center text-xl tracking-[0.5em] placeholder:text-gray-600 focus:outline-none focus:bg-white/10 focus:border-green-500/50 transition-all duration-300"
                                                maxLength={6}
                                                required
                                                disabled={loading}
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            className="w-full bg-green-500 text-white font-bold py-3 rounded-xl hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                                            disabled={loading || otpCode.length !== 6}
                                        >
                                            <span className="text-sm">{loading ? 'Проверка...' : 'Создать аккаунт'}</span>
                                            {!loading && <ArrowRight className="w-4 h-4" />}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => { setOtpSent(false); setOtpCode(''); setSuccess(''); }}
                                            className="w-full text-gray-400 hover:text-white text-xs transition-colors"
                                        >
                                            Отправить код повторно
                                        </button>
                                    </>
                                )}
                            </form>
                        )}

                        <p className="text-center text-xs text-gray-500 mt-6">
                            Уже есть аккаунт? <Link href="/login" className="text-accent hover:text-accent/80 font-medium transition-colors ml-1 hover:underline decoration-accent/30">Войти</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
