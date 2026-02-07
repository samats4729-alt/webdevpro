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



                        <p className="text-center text-xs text-gray-500 mt-6">
                            {t.auth.signup.hasAccount} <Link href="/login" className="text-accent hover:text-accent/80 font-medium transition-colors ml-1 hover:underline decoration-accent/30">{t.auth.signup.signin}</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
