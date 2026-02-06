"use client";

import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import {
    Headphones,
    Calendar,
    Target,
    ShoppingBag,
    Wrench,
    Stethoscope,
    Check,
    Clock,
    Users,
    Zap,
    Star,
    Scissors,
    Loader2
} from "lucide-react";
import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const blueprints = [
    {
        id: 'ai-consultant',
        name: 'AI Консультант',
        icon: Zap,
        color: 'from-violet-500 to-purple-600',
        description: 'Умный AI-ассистент, который отвечает на вопросы клиентов, используя базу знаний вашего бизнеса.',
        features: ['Ответы 24/7', 'База знаний', 'Естественный диалог', 'Обучение на ходу'],
        popular: true,
        setupTime: '1 мин'
    },
    {
        id: 'beauty-salon',
        name: 'Салон красоты / Парикмахерская',
        icon: Scissors,
        color: 'from-pink-500 to-rose-500',
        description: 'Полная автоматизация записи для салонов красоты. Меню услуг, цены, адрес и запись.',
        features: ['Меню услуг', 'Прайс-лист', 'Запись онлайн', 'Контактная информация'],
        popular: false,
        setupTime: '2 мин'
    },
    {
        id: 'customer-support',
        name: 'Служба поддержки',
        icon: Headphones,
        color: 'from-blue-500 to-cyan-500',
        description: 'Автоматические ответы на частые вопросы и решение типовых проблем 24/7.',
        features: ['Работает 24/7', 'FAQ-ответы', 'Создание заявок'],
        popular: false,
        setupTime: '5 мин'
    },
    {
        id: 'appointment-booking',
        name: 'Онлайн-запись',
        icon: Calendar,
        color: 'from-purple-500 to-pink-500',
        description: 'Клиенты могут записаться, перенести или отменить запись через чат.',
        features: ['Синхронизация', 'Напоминания', 'Подтверждения'],
        popular: false,
        setupTime: '8 мин'
    },
    {
        id: 'lead-quantification',
        name: 'Квалификация лидов',
        icon: Target,
        color: 'from-orange-500 to-red-500',
        description: 'Автоматическая квалификация лидов и отправка горячих клиентов в отдел продаж.',
        features: ['Интеграция с CRM', 'Скоринг', 'Авто-распределение'],
        popular: false,
        setupTime: '10 мин'
    },
    {
        id: 'ecommerce-assistant',
        name: 'Интернет-магазин',
        icon: ShoppingBag,
        color: 'from-green-500 to-emerald-500',
        description: 'Рекомендации товаров, статус заказа и помощь с оформлением покупки.',
        features: ['Каталог товаров', 'Статус заказа', 'Допродажи'],
        popular: true,
        setupTime: '12 мин'
    }
];

export default function BlueprintsPage() {
    const { t } = useLanguage();
    const router = useRouter();
    const [bots, setBots] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [applying, setApplying] = useState<string | null>(null);
    const [selectedBotId, setSelectedBotId] = useState<string>('');

    useEffect(() => {
        fetchBots();
    }, []);

    const fetchBots = async () => {
        const supabase = createClient();
        const { data, error } = await supabase.from('bots').select('id, name').order('created_at', { ascending: false });
        console.log('[Blueprints] Fetched bots:', data, 'Error:', error);
        if (data && data.length > 0) {
            setBots(data);
            setSelectedBotId(data[0].id);
        }
    };

    const handleApply = async (templateId: string) => {
        if (!selectedBotId) {
            alert('Сначала создайте бота!');
            return;
        }

        // Skip confirmation for "Beauty Salon" if it's new bot, but generally safer to ask.
        // User asked: "if user chose template... automatically configured".
        // I will keep it simple.

        if (!confirm('Это действие перезапишет текущие настройки бота. Продолжить?')) return;

        setApplying(templateId);
        try {
            const res = await fetch('/api/templates/apply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ botId: selectedBotId, templateId })
            });

            if (res.ok) {
                alert('Шаблон успешно применен!');
                router.push(`/my-bots/${selectedBotId}?tab=flows`);
            } else {
                throw new Error('Failed to apply template');
            }
        } catch (e) {
            alert('Ошибка при применении шаблона');
        } finally {
            setApplying(null);
        }
    };

    return (
        <PageContainer>
            <PageHeader
                title="Шаблоны"
                description="Готовые сценарии для быстрого запуска бота"
            />

            {/* Bot Selector */}
            <div className="mb-5 p-3 dark-card flex items-center gap-3">
                <span className="text-xs text-gray-400">Выберите бота:</span>
                <select
                    value={selectedBotId}
                    onChange={(e) => setSelectedBotId(e.target.value)}
                    className="bg-dark-50 border border-card-border rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:border-accent"
                >
                    {bots.length === 0 && <option>Нет ботов</option>}
                    {bots.map(bot => (
                        <option key={bot.id} value={bot.id}>{bot.name}</option>
                    ))}
                </select>
                {/* Auto select hint */}
                {bots.length === 0 && (
                    <span className="text-red-400 text-xs">Сначала создайте бота</span>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {blueprints.map((blueprint) => (
                    <div
                        key={blueprint.id}
                        className="dark-card p-4 hover:border-accent/50 transition-all cursor-pointer group relative overflow-hidden flex flex-col"
                    >
                        {blueprint.popular && (
                            <div className="absolute top-2 right-2">
                                <div className="flex items-center gap-1 bg-accent/20 text-accent text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                                    <Star className="w-2 h-2 fill-current" />
                                    ПОПУЛЯРНЫЙ
                                </div>
                            </div>
                        )}

                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${blueprint.color} p-0.5 mb-3 group-hover:scale-110 transition-transform`}>
                            <div className="w-full h-full bg-dark-card rounded-[6px] flex items-center justify-center">
                                <blueprint.icon className="w-5 h-5 text-white" />
                            </div>
                        </div>

                        <h3 className="font-bold text-sm text-white mb-1">{blueprint.name}</h3>
                        <p className="text-xs text-gray-400 mb-3 leading-relaxed flex-grow">{blueprint.description}</p>

                        <div className="space-y-1.5 mb-4">
                            {blueprint.features.map((feature, i) => (
                                <div key={i} className="flex items-center gap-1.5 text-[10px] text-gray-300">
                                    <Check className="w-3 h-3 text-accent flex-shrink-0" />
                                    {feature}
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-card-border mt-auto">
                            <div className="flex items-center gap-1 text-[10px] text-gray-500">
                                <Clock className="w-3 h-3" />
                                {blueprint.setupTime}
                            </div>
                            <button
                                onClick={() => handleApply(blueprint.id)}
                                disabled={Boolean(bots.length === 0) || Boolean(applying)}
                                className={`text-xs font-medium flex items-center gap-1.5 ${bots.length === 0 ? 'text-gray-600 cursor-not-allowed' : 'text-accent hover:underline'}`}
                            >
                                {applying === blueprint.id && <Loader2 className="w-2.5 h-2.5 animate-spin" />}
                                {applying === blueprint.id ? 'Применяем...' : 'Использовать →'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-5 dark-card p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center">
                        <Zap className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-sm text-white">Нужно индивидуальное решение?</h4>
                        <p className="text-xs text-gray-500">Мы можем создать шаблон специально под вашу отрасль.</p>
                    </div>
                </div>
                <button className="btn-primary text-xs px-4 py-2">Заказать</button>
            </div>
        </PageContainer>
    );
}
