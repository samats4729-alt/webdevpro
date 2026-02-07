"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bot, Mail, Lock, User, ArrowRight, ChevronLeft, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/i18n";

export default function SignupPage() {
    const router = useRouter();
    const { t } = useLanguage();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

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

    const handleGoogleSignup = async () => {
        const supabase = createClient();
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/auth/callback`,
            },
        });

        if (error) {
            setError(error.message);
        }
    };

    return (
        <div className="min-h-screen bg-[#020202] flex items-center justify-center px-6 py-12 relative overflow-hidden font-sans text-white">
            {/* --- Premium Background Effects --- */}

            {/* Animated Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px] opacity-20" />

            {/* Floating Orbs */}
            <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-accent/10 rounded-full blur-[120px] animate-pulse-slow" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] animate-pulse-slow delay-1000" />

            {/* Back Button */}
            <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-white/50 hover:text-white transition-colors group z-20">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-white/20 transition-all">
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                </div>
                <span className="text-sm font-light">Back to Home</span>
            </Link>

            <div className="w-full max-w-[400px] relative z-10">
                {/* Brand Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-accent/20 to-transparent border border-accent/20 mb-4 shadow-[0_0_20px_rgba(74,222,128,0.15)]">
                        <Bot className="w-6 h-6 text-accent" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight mb-1">Join the Future</h1>
                    <p className="text-white/40 text-xs font-light">Create your AI-powered account</p>
                </div>

                {/* Premium Glass Card */}
                <div className="relative group">
                    {/* Border Gradient Animation */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-accent/50 to-purple-500/50 rounded-3xl opacity-20 blur group-hover:opacity-40 transition duration-1000"></div>

                    <div className="relative bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold">{t.auth.signup.title}</h2>
                            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10">
                                <span className="text-[9px] font-bold text-gray-400 tracking-wider uppercase">Free Tier</span>
                            </div>
                        </div>

                        <form onSubmit={handleSignup} className="space-y-4">
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-start gap-3">
                                    <Sparkles className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                                    <p className="text-xs text-red-400 font-light">{error}</p>
                                </div>
                            )}

                            <div className="space-y-1">
                                <label className="text-[10px] font-medium text-gray-400 ml-1 uppercase tracking-wider">{t.auth.signup.fullName}</label>
                                <div className="relative group/input">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within/input:text-accent transition-colors" />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="John Doe"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:bg-white/10 focus:border-accent/50 transition-all duration-300"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-medium text-gray-400 ml-1 uppercase tracking-wider">{t.auth.common.email}</label>
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
                                <label className="text-[10px] font-medium text-gray-400 ml-1 uppercase tracking-wider">{t.auth.common.password}</label>
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
                                <p className="text-[10px] text-gray-500 ml-1">{t.auth.signup.passwordHint}</p>
                            </div>

                            <div className="flex items-start gap-3 text-[10px] text-gray-400 ml-1">
                                <input type="checkbox" className="mt-0.5 rounded border-white/10 bg-white/5 checked:bg-accent text-accent focus:ring-accent/20" required />
                                <label className="leading-relaxed">
                                    {t.auth.signup.agree} <Link href="/terms" className="text-accent hover:text-accent/80 hover:underline">{t.auth.signup.terms}</Link> {t.auth.signup.and} <Link href="/privacy" className="text-accent hover:text-accent/80 hover:underline">{t.auth.signup.privacy}</Link>
                                </label>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-accent text-black font-bold py-3 rounded-xl hover:bg-accent/90 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(74,222,128,0.3)] hover:shadow-[0_0_30px_rgba(74,222,128,0.5)] flex items-center justify-center gap-2 group/btn relative overflow-hidden"
                                disabled={loading}
                            >
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 pointer-events-none" />
                                <span className="relative text-sm">{loading ? t.auth.signup.submitting : t.auth.signup.submit}</span>
                                {!loading && <ArrowRight className="w-4 h-4 relative group-hover/btn:translate-x-1 transition-transform" />}
                            </button>
                        </form>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/10"></div>
                            </div>
                            <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
                                <span className="px-3 bg-[#0a0a0a] text-gray-500">{t.auth.common.orContinue}</span>
                            </div>
                        </div>

                        <button onClick={handleGoogleSignup} type="button" className="w-full py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all text-white font-medium flex items-center justify-center gap-3 group/google">
                            <svg className="w-4 h-4 opacity-70 group-hover/google:opacity-100 transition-opacity" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            <span className="text-sm">{t.auth.common.google}</span>
                        </button>

                        <p className="text-center text-xs text-gray-500 mt-6">
                            {t.auth.signup.hasAccount} <Link href="/login" className="text-accent hover:text-accent/80 font-medium transition-colors ml-1 hover:underline decoration-accent/30">{t.auth.signup.signin}</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
