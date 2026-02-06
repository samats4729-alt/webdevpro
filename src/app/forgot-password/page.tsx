"use client";

import { useState } from "react";
import Link from "next/link";
import { Bot, Mail, ArrowRight, ChevronLeft, Sparkles, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/i18n";

export default function ForgotPasswordPage() {
    const { t } = useLanguage();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const supabase = createClient();
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/update-password`,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            setSuccess(true);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020202] flex items-center justify-center px-6 relative overflow-hidden font-sans text-white">
            {/* --- Premium Background Effects --- */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px] opacity-20" />
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-accent/10 rounded-full blur-[120px] animate-pulse-slow" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] animate-pulse-slow delay-1000" />

            {/* Back Button */}
            <Link href="/login" className="absolute top-8 left-8 flex items-center gap-2 text-white/50 hover:text-white transition-colors group z-20">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-white/20 transition-all">
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                </div>
                <span className="text-sm font-light">{t.auth.forgotPassword.backToLogin}</span>
            </Link>

            <div className="w-full max-w-[420px] relative z-10">
                {/* Brand Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/20 to-transparent border border-accent/20 mb-6 shadow-[0_0_30px_rgba(74,222,128,0.2)]">
                        <Bot className="w-8 h-8 text-accent" />
                    </div>
                </div>

                {/* Premium Glass Card */}
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-accent/50 to-purple-500/50 rounded-3xl opacity-20 blur group-hover:opacity-40 transition duration-1000"></div>
                    <div className="relative bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">

                        {success ? (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle className="w-8 h-8 text-accent" />
                                </div>
                                <h2 className="text-2xl font-bold mb-4">{t.auth.forgotPassword.checkEmail}</h2>
                                <p className="text-gray-400 mb-8">
                                    {t.auth.forgotPassword.checkEmailDescription} <span className="text-white font-medium">{email}</span>
                                </p>
                                <Link
                                    href="/login"
                                    className="block w-full bg-white/5 text-white font-medium py-3 rounded-xl hover:bg-white/10 transition-colors border border-white/10"
                                >
                                    {t.auth.forgotPassword.backToLogin}
                                </Link>
                            </div>
                        ) : (
                            <>
                                <h2 className="text-xl font-semibold mb-2">{t.auth.forgotPassword.title}</h2>
                                <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                                    {t.auth.forgotPassword.subtitle}
                                </p>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {error && (
                                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
                                            <Sparkles className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                            <p className="text-sm text-red-400 font-light">{error}</p>
                                        </div>
                                    )}

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-gray-400 ml-1 uppercase tracking-wider">{t.auth.common.email}</label>
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

                                    <button
                                        type="submit"
                                        className="w-full bg-accent text-black font-bold py-4 rounded-xl hover:bg-accent/90 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(74,222,128,0.3)] hover:shadow-[0_0_30px_rgba(74,222,128,0.5)] flex items-center justify-center gap-2 group/btn relative overflow-hidden"
                                        disabled={loading}
                                    >
                                        <span className="relative">{loading ? t.auth.forgotPassword.submitting : t.auth.forgotPassword.submit}</span>
                                        {!loading && <ArrowRight className="w-5 h-5 relative group-hover/btn:translate-x-1 transition-transform" />}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
