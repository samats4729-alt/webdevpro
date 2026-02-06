"use client";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { Check, CreditCard, Crown, Zap, Building2, Clock, Loader2, CheckCircle, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

interface UserPlan {
    plan: string;
    trialEnds: string | null;
    botsCount: number;
    botsLimit: number;
}

const PLANS = [
    {
        id: 'starter',
        name: 'Starter',
        price: 7000,
        botsLimit: 1,
        features: [
            '1 AI бот',
            'Безлимитные сообщения',
            'WhatsApp интеграция',
            'Онлайн-запись клиентов',
            'Email поддержка',
        ],
        icon: Zap,
        popular: false,
    },
    {
        id: 'pro',
        name: 'Pro',
        price: 10000,
        botsLimit: 3,
        features: [
            '3 AI бота',
            'Безлимитные сообщения',
            'WhatsApp интеграция',
            'Онлайн-запись клиентов',
            'Приоритетная поддержка',
            'Рассылки',
        ],
        icon: Crown,
        popular: true,
    },
    {
        id: 'business',
        name: 'Business',
        price: 30000,
        botsLimit: 10,
        features: [
            '10 AI ботов',
            'Безлимитные сообщения',
            'WhatsApp интеграция',
            'Онлайн-запись клиентов',
            'Выделенная поддержка',
            'Рассылки',
            'API доступ',
            'Анализ и отчёты',
        ],
        icon: Building2,
        popular: false,
    },
];

export default function BillingPage() {
    const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
    const [loading, setLoading] = useState(true);
    const [changingPlan, setChangingPlan] = useState<string | null>(null);

    async function loadUserPlan() {
        try {
            const res = await fetch('/api/billing');
            if (res.ok) {
                const data = await res.json();
                setUserPlan(data);
            }
        } catch (e) {
            console.error('Failed to load plan:', e);
        }
        setLoading(false);
    }

    useEffect(() => {
        loadUserPlan();
    }, []);

    async function selectPlan(planId: string) {
        if (changingPlan) return;

        setChangingPlan(planId);
        try {
            const res = await fetch('/api/billing', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plan: planId }),
            });

            if (res.ok) {
                alert('Тариф успешно изменён!');
                await loadUserPlan();
            } else {
                const data = await res.json();
                alert(data.error || 'Ошибка при смене тарифа');
            }
        } catch (e) {
            alert('Ошибка соединения');
        }
        setChangingPlan(null);
    }

    const isTrialActive = userPlan?.plan === 'trial' && userPlan?.trialEnds && new Date(userPlan.trialEnds) > new Date();
    const daysLeft = userPlan?.trialEnds
        ? Math.max(0, Math.ceil((new Date(userPlan.trialEnds).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
        : 0;

    if (loading) {
        return (
            <PageContainer>
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-accent" />
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <PageHeader
                title="Тарифы"
                description="Выберите подходящий тариф для вашего бизнеса"
            />

            {/* Trial Banner */}
            {isTrialActive && (
                <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border border-emerald-500/30">
                    <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-emerald-400" />
                        <div>
                            <p className="text-white font-medium">Пробный период активен</p>
                            <p className="text-sm text-gray-400">
                                Осталось {daysLeft} {daysLeft === 1 ? 'день' : daysLeft < 5 ? 'дня' : 'дней'}.
                                Выберите тариф для продолжения работы.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Current Plan Info */}
            {userPlan && (
                <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-400">Текущий тариф</p>
                            <p className="text-xl font-bold text-white capitalize">
                                {userPlan.plan === 'trial' ? 'Пробный период' : userPlan.plan}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-400">Использовано ботов</p>
                            <p className="text-xl font-bold text-white">
                                {userPlan.botsCount} / {userPlan.botsLimit}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {PLANS.map((plan) => {
                    const Icon = plan.icon;
                    const isCurrent = userPlan?.plan === plan.id;
                    const isChanging = changingPlan === plan.id;
                    const cannotDowngrade = userPlan && userPlan.botsCount > plan.botsLimit;

                    return (
                        <div
                            key={plan.id}
                            className={`
                                relative p-6 rounded-2xl overflow-hidden transition-all
                                ${plan.popular
                                    ? 'bg-gradient-to-br from-accent/20 to-transparent border-accent/50'
                                    : 'bg-white/5 border-white/10'
                                }
                                ${isCurrent ? 'ring-2 ring-emerald-500' : ''}
                                border
                            `}
                        >
                            {plan.popular && (
                                <div className="absolute top-0 right-0 bg-accent text-black text-xs font-bold px-3 py-1 rounded-bl-lg">
                                    Популярный
                                </div>
                            )}

                            {isCurrent && (
                                <div className="absolute top-0 left-0 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-br-lg">
                                    Текущий
                                </div>
                            )}

                            <div className="flex items-center gap-3 mb-4 mt-2">
                                <div className={`w-10 h-10 rounded-xl ${plan.popular ? 'bg-accent/20' : 'bg-white/10'} flex items-center justify-center`}>
                                    <Icon className={`w-5 h-5 ${plan.popular ? 'text-accent' : 'text-gray-400'}`} />
                                </div>
                                <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
                            </div>

                            <div className="flex items-baseline gap-1 mb-6">
                                <span className="text-4xl font-bold text-white">
                                    {plan.price.toLocaleString()}
                                </span>
                                <span className="text-gray-400">₸/мес</span>
                            </div>

                            <ul className="space-y-3 mb-6">
                                {plan.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-center gap-3 text-sm text-gray-300">
                                        <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => !isCurrent && !cannotDowngrade && selectPlan(plan.id)}
                                disabled={isCurrent || isChanging || !!cannotDowngrade}
                                className={`
                                    w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2
                                    ${isCurrent
                                        ? 'bg-emerald-500/20 text-emerald-400 cursor-default'
                                        : cannotDowngrade
                                            ? 'bg-red-500/10 text-red-400 cursor-not-allowed'
                                            : plan.popular
                                                ? 'bg-accent text-black hover:bg-accent/90'
                                                : 'bg-white/10 text-white hover:bg-white/20'
                                    }
                                    disabled:opacity-50
                                `}
                            >
                                {isChanging && <Loader2 className="w-4 h-4 animate-spin" />}
                                {isCurrent
                                    ? 'Текущий тариф'
                                    : cannotDowngrade
                                        ? `Нужно удалить ${userPlan!.botsCount - plan.botsLimit} бот(а)`
                                        : 'Выбрать'
                                }
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Payment Info */}
            <div className="mt-8 p-6 rounded-xl bg-white/5 border border-white/10">
                <h4 className="text-lg font-medium text-white mb-4">Способы оплаты</h4>
                <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5">
                        <CreditCard className="w-5 h-5 text-gray-400" />
                        <span className="text-sm text-gray-300">Kaspi перевод</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5">
                        <CreditCard className="w-5 h-5 text-gray-400" />
                        <span className="text-sm text-gray-300">Банковская карта</span>
                    </div>
                </div>
                <p className="mt-4 text-sm text-gray-500">
                    После выбора тарифа свяжитесь с нами для оплаты: <a href="mailto:support@tenderai.kz" className="text-accent hover:underline">support@tenderai.kz</a>
                </p>
            </div>
        </PageContainer>
    );
}
