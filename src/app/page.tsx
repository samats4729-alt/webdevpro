"use client";

import Link from "next/link";
import dynamic from 'next/dynamic';
import { Bot, MessageSquare, Zap, BarChart3, CheckCircle, ArrowRight, Sparkles, Globe } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import AnimatedPricingCard from "@/components/landing/AnimatedPricingCard";
import NeonButton from "@/components/landing/NeonButton";
import InteractiveBot from "@/components/layout/InteractiveBot";

// Динамический импорт 3D компонента (только на клиенте) с placeholder
const HeroCanvas = dynamic(() => import('@/components/3d/HeroCanvas'), {
    ssr: false,
    loading: () => (
        <div className="absolute inset-0 flex items-center justify-center">
            {/* Gradient glow placeholder while 3D loads */}
            <div className="absolute right-[15%] top-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#00ff44]/20 rounded-full blur-[100px] animate-pulse" />
        </div>
    )
});

export default function LandingPage() {
    const { t, language, setLanguage } = useLanguage();
    const router = useRouter();

    useEffect(() => {
        const supabase = createClient();
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                router.replace('/dashboard');
            }
        };
        checkUser();
    }, [router]);

    const toggleLanguage = () => {
        setLanguage(language === 'ru' ? 'en' : 'ru');
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans">
            {/* Кнопки авторизации (плавающие, без навигационной панели) */}
            <div className="absolute top-6 right-6 z-50 flex items-center gap-4">
                <button
                    onClick={toggleLanguage}
                    className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10"
                >
                    <Globe className="w-4 h-4" />
                    <span>{language === 'ru' ? 'RU' : 'EN'}</span>
                </button>
                <div className="h-4 w-[1px] bg-white/20 mx-1" />
                <Link href="/login" className="text-sm text-gray-300 hover:text-white transition-colors backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-white/5">
                    {t.landing.login}
                </Link>
                <Link href="/signup" className="bg-[#00cc66] text-[#002211] hover:bg-[#00ea75] font-bold text-sm px-6 py-2 rounded-full shadow-lg shadow-[#00cc66]/20 transition-all transform hover:scale-105">
                    {t.landing.startFreeTrial}
                </Link>
            </div>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-6 overflow-hidden min-h-screen">
                {/* 3D Background */}
                <div className="absolute inset-0 z-0 h-full w-full">
                    <HeroCanvas />
                </div>

                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10 pointer-events-none h-full pt-12">
                    <div className="text-left">
                        <div className="pointer-events-auto inline-flex items-center gap-2 bg-[#00ff66]/5 border border-[#00ff66]/10 rounded-full px-5 py-2.5 mb-8 backdrop-blur-md transition-all hover:bg-[#00ff66]/10">
                            <Sparkles className="w-4 h-4 text-[#00ff66]" />
                            <span className="text-sm text-[#00ff66] font-medium tracking-wide uppercase">{t.landing.hero.badge}</span>
                        </div>

                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-100 to-gray-400 drop-shadow-2xl leading-[1.1] tracking-tight">
                            {t.landing.hero.title}
                        </h1>
                        <p className="text-lg md:text-xl text-gray-300/80 mb-10 max-w-xl leading-relaxed drop-shadow-lg font-light tracking-wide">
                            {t.landing.hero.subtitle}
                        </p>

                        <div className="pointer-events-auto flex flex-col sm:flex-row items-center justify-start gap-6">
                            <Link href="/signup" className="bg-[#00cc66] text-[#002211] hover:bg-[#00ea75] text-lg font-bold px-8 py-4 rounded-full flex items-center gap-2 group shadow-xl shadow-[#00cc66]/20 hover:shadow-[#00cc66]/40 transition-all transform hover:scale-105 hover:-translate-y-1">
                                {t.landing.hero.startTrial}
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <div className="h-[64px] flex items-center">
                                <InteractiveBot inline />
                            </div>
                        </div>
                    </div>
                    {/* Empty column for 3D visual balance */}
                    <div className="hidden lg:block"></div>
                </div>
            </section>

            {/* Features */}
            <section className="py-20 px-6 bg-white/5 relative z-20 backdrop-blur-sm border-t border-white/5">
                <div className="max-w-7xl mx-auto">
                    <h3 className="text-4xl font-bold text-center mb-16">{t.landing.features.title}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={MessageSquare}
                            title={t.landing.features.multiChannel.title}
                            description={t.landing.features.multiChannel.description}
                        />
                        <FeatureCard
                            icon={Zap}
                            title={t.landing.features.flowBuilder.title}
                            description={t.landing.features.flowBuilder.description}
                        />
                        <FeatureCard
                            icon={BarChart3}
                            title={t.landing.features.analytics.title}
                            description={t.landing.features.analytics.description}
                        />
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section id="pricing" className="py-20 px-6 relative z-20">
                <div className="max-w-6xl mx-auto">
                    <h3 className="text-4xl font-bold text-center mb-4">{t.landing.pricing.title}</h3>
                    <p className="text-gray-400 text-center mb-16">{t.landing.pricing.subtitle}</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <AnimatedPricingCard
                            name={t.landing.pricing.starter.name}
                            price={t.landing.pricing.starter.price}
                            monthText={t.landing.pricing.month}
                            features={t.landing.pricing.starter.features}
                            getStartedText={t.landing.pricing.getStarted}
                            includedText={t.landing.pricing.included}
                        />
                        <AnimatedPricingCard
                            name={t.landing.pricing.pro.name}
                            price={t.landing.pricing.pro.price}
                            monthText={t.landing.pricing.month}
                            features={t.landing.pricing.pro.features}
                            getStartedText={t.landing.pricing.getStarted}
                            popular
                            popularText={t.landing.pricing.pro.popular}
                            includedText={t.landing.pricing.included}
                        />
                        <AnimatedPricingCard
                            name={t.landing.pricing.enterprise.name}
                            price={t.landing.pricing.enterprise.price}
                            monthText={t.landing.pricing.month}
                            features={t.landing.pricing.enterprise.features}
                            getStartedText={t.landing.pricing.getStarted}
                            includedText={t.landing.pricing.included}
                        />
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 px-6 relative z-20 overflow-hidden">
                <div className="max-w-5xl mx-auto relative">
                    {/* Ambient Glow Behind */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[100px] animate-pulse-slow" />

                    <div className="relative bg-[#0a0a0a] rounded-[2rem] border border-white/5 p-16 text-center overflow-hidden group hover:border-accent/30 transition-all duration-500">
                        {/* Animated Grid Background */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />

                        {/* Flying Particle */}
                        <div className="absolute top-10 left-10 w-2 h-2 bg-accent rounded-full animate-ping" />
                        <div className="absolute bottom-10 right-10 w-2 h-2 bg-accent rounded-full animate-ping delay-700" />

                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-8 border border-accent/20">
                                <Sparkles className="w-3 h-3" />
                                <span>Get Started Now</span>
                            </div>

                            <h3 className="text-3xl md:text-5xl font-thin text-white mb-6 tracking-tight leading-tight">
                                {t.landing.cta.title}
                            </h3>

                            <p className="text-white/50 text-base md:text-lg font-light mb-12 max-w-2xl mx-auto leading-relaxed">
                                {t.landing.cta.subtitle}
                            </p>

                            <div className="flex justify-center">
                                <NeonButton href="/signup" text={t.landing.cta.button} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 px-6 border-t border-white/5 relative z-20 bg-[#020202]">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                        {/* Brand Column */}
                        <div className="col-span-1 md:col-span-1">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center border border-accent/20">
                                    <Bot className="w-5 h-5 text-accent" />
                                </div>
                                <span className="font-bold text-xl tracking-wide text-white">WebDevPro</span>
                            </div>
                            <p className="text-white/40 font-light text-sm leading-relaxed mb-6">
                                Transforming customer communication with intelligent AI-powered WhatsApp bots.
                            </p>
                            <div className="flex gap-4">
                                {/* Social Icons Placeholders */}
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-accent hover:text-black transition-all cursor-pointer">
                                        <div className="w-4 h-4 bg-current rounded-full opacity-50" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Links Columns */}
                        <div>
                            <h4 className="text-white font-medium tracking-widest uppercase text-xs mb-8">Продукт</h4>
                            <ul className="space-y-4">
                                <li>
                                    <Link href="#pricing" className="text-white/40 hover:text-accent font-light text-sm transition-colors">
                                        Цены
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-white font-medium tracking-widest uppercase text-xs mb-8">Ресурсы</h4>
                            <ul className="space-y-4">
                                <li>
                                    <Link href="/contacts" className="text-white/40 hover:text-accent font-light text-sm transition-colors">
                                        Контакты и Реквизиты
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-white font-medium tracking-widest uppercase text-xs mb-8">Правовая информация</h4>
                            <ul className="space-y-4">
                                {[
                                    { name: 'Политика конфиденциальности', href: '/privacy' },
                                    { name: 'Публичная оферта', href: '/terms' },
                                ].map((item) => (
                                    <li key={item.name}>
                                        <Link href={item.href} className="text-white/40 hover:text-accent font-light text-sm transition-colors">
                                            {item.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-white/20 text-xs font-light">
                            © 2026 WebDevPro. All rights reserved.
                        </p>
                        <div className="text-xs text-white/20 font-light">
                            Made in Kazakhstan 🇰🇿
                        </div>
                    </div>
                </div>
            </footer>

            {/* Глобальный бот для лендинга (скрыт, пока не вызван) */}
            <InteractiveBot hiddenOnHome />
        </div>
    );
}

function FeatureCard({ icon: Icon, title, description }: any) {
    return (
        <div className="group relative bg-[#0a0a0a] rounded-2xl border border-white/5 p-8 overflow-hidden hover:border-accent/30 transition-all duration-500">
            {/* Hover Glow Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Subtle Neon Blob */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-accent/10 rounded-full blur-[40px] group-hover:bg-accent/20 transition-all duration-500" />

            <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-6 h-6 text-accent" />
                </div>

                <h4 className="text-sm font-medium text-white tracking-[0.15em] uppercase mb-4 group-hover:text-accent transition-colors duration-300">{title}</h4>
                <p className="text-white/60 font-light leading-relaxed text-sm">{description}</p>
            </div>
        </div>
    );
}
