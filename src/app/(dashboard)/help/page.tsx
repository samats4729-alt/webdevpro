"use client";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { HelpCircle, Mail, MessageSquare, Book, Phone, ExternalLink, ChevronDown, Bot, Calendar, Send, Users, Zap, Settings } from "lucide-react";
import { useState } from "react";

const FAQ_ITEMS = [
    {
        category: "Начало работы",
        questions: [
            {
                q: "Как подключить WhatsApp бота?",
                a: "1. Перейдите в раздел 'Мои боты'\n2. Создайте нового бота или выберите существующего\n3. Нажмите 'Подключить WhatsApp'\n4. Отсканируйте QR-код камерой телефона через WhatsApp → Связанные устройства → Привязать устройство"
            },
            {
                q: "Сколько длится пробный период?",
                a: "Пробный период длится 3 дня. За это время вы можете создать 1 бота и протестировать все функции платформы. После окончания выберите подходящий тариф."
            },
            {
                q: "Как настроить ответы бота?",
                a: "Есть несколько способов:\n• AI Архитектор — опишите словами что должен делать бот\n• Flow Builder — визуальный редактор сценариев\n• База знаний — загрузите документы для обучения бота"
            },
        ]
    },
    {
        category: "Запись клиентов",
        questions: [
            {
                q: "Как настроить онлайн-запись?",
                a: "1. Перейдите в 'Каталог услуг' и добавьте ваши услуги с ценами и длительностью\n2. В настройках бота включите 'Расписание работы' и укажите рабочие часы\n3. Бот автоматически будет предлагать свободные слоты и записывать клиентов"
            },
            {
                q: "Где посмотреть записи клиентов?",
                a: "Все записи отображаются в разделе 'Записи'. Там вы увидите календарь с предстоящими визитами, можете подтвердить, отменить или перенести запись."
            },
            {
                q: "Бот может напоминать о записи?",
                a: "Да! Бот автоматически отправляет напоминание клиенту за день до визита. Это помогает снизить количество пропущенных записей."
            },
        ]
    },
    {
        category: "AI и автоматизация",
        questions: [
            {
                q: "Какой AI используется?",
                a: "Мы используем модель DeepSeek-V3 — это продвинутая языковая модель, которая отлично понимает русский язык и контекст разговора."
            },
            {
                q: "Как обучить бота знаниям о моём бизнесе?",
                a: "Используйте раздел 'База знаний'. Загрузите текстовые файлы с информацией о вашем бизнесе, прайс-листы, FAQ. Бот будет использовать эти данные для ответов."
            },
            {
                q: "Что такое Flow Builder?",
                a: "Flow Builder — это визуальный редактор сценариев. Вы создаёте блоки (триггеры, условия, ответы) и соединяете их линиями. Идеально для создания меню, опросов, цепочек сообщений."
            },
        ]
    },
    {
        category: "Тарифы и оплата",
        questions: [
            {
                q: "Какие есть тарифы?",
                a: "• Starter (7 000 ₸/мес) — 1 бот\n• Pro (10 000 ₸/мес) — 3 бота\n• Business (30 000 ₸/мес) — 10 ботов\n\nВсе тарифы включают безлимитные сообщения."
            },
            {
                q: "Как оплатить тариф?",
                a: "Выберите тариф в разделе 'Тарифы' и свяжитесь с нами для оплаты через Kaspi перевод или банковскую карту."
            },
            {
                q: "Можно ли сменить тариф?",
                a: "Да, вы можете повысить тариф в любой момент. При понижении тарифа убедитесь, что количество ботов не превышает лимит нового тарифа."
            },
        ]
    },
];

const QUICK_GUIDES = [
    { icon: Bot, title: "Создание бота", desc: "Пошаговая инструкция" },
    { icon: Calendar, title: "Настройка записи", desc: "Услуги и расписание" },
    { icon: Send, title: "Рассылки", desc: "Массовые сообщения" },
    { icon: Zap, title: "Flow Builder", desc: "Автоматизация" },
];

export default function HelpPage() {
    const [openCategory, setOpenCategory] = useState<string | null>("Начало работы");
    const [openQuestion, setOpenQuestion] = useState<string | null>(null);

    return (
        <PageContainer>
            <PageHeader
                title="Помощь"
                description="Ответы на частые вопросы и контакты поддержки"
            />

            {/* Contact Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <a
                    href="mailto:support@tenderai.kz"
                    className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-accent/50 transition-all flex items-center gap-4"
                >
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                        <Mail className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-white">Email</h4>
                        <p className="text-sm text-gray-400">support@tenderai.kz</p>
                    </div>
                </a>

                <a
                    href="https://wa.me/77001234567"
                    target="_blank"
                    className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/50 transition-all flex items-center gap-4"
                >
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                        <MessageSquare className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-white">WhatsApp</h4>
                        <p className="text-sm text-gray-400">Напишите нам</p>
                    </div>
                </a>

                <a
                    href="tel:+77001234567"
                    className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/50 transition-all flex items-center gap-4"
                >
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                        <Phone className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-white">Телефон</h4>
                        <p className="text-sm text-gray-400">+7 700 123 45 67</p>
                    </div>
                </a>
            </div>

            {/* FAQ Section */}
            <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
                <div className="p-5 border-b border-white/10">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <HelpCircle className="w-5 h-5 text-accent" />
                        Частые вопросы
                    </h3>
                </div>

                <div className="divide-y divide-white/5">
                    {FAQ_ITEMS.map((category) => (
                        <div key={category.category}>
                            <button
                                onClick={() => setOpenCategory(openCategory === category.category ? null : category.category)}
                                className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                            >
                                <span className="font-medium text-white">{category.category}</span>
                                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${openCategory === category.category ? 'rotate-180' : ''}`} />
                            </button>

                            {openCategory === category.category && (
                                <div className="px-4 pb-4 space-y-2">
                                    {category.questions.map((item) => (
                                        <div key={item.q} className="rounded-xl bg-white/[0.02] border border-white/5 overflow-hidden">
                                            <button
                                                onClick={() => setOpenQuestion(openQuestion === item.q ? null : item.q)}
                                                className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                                            >
                                                <span className="text-sm text-gray-300">{item.q}</span>
                                                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform flex-shrink-0 ml-2 ${openQuestion === item.q ? 'rotate-180' : ''}`} />
                                            </button>

                                            {openQuestion === item.q && (
                                                <div className="px-4 pb-4">
                                                    <p className="text-sm text-gray-400 whitespace-pre-line">{item.a}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Tip */}
            <div className="mt-8 p-5 rounded-2xl bg-gradient-to-r from-accent/10 to-blue-500/10 border border-accent/20">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0">
                        <Zap className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-white mb-1">Совет</h4>
                        <p className="text-sm text-gray-400">
                            Используйте <strong className="text-white">AI Архитектор</strong> для быстрой настройки бота.
                            Просто опишите словами что должен делать ваш бот, и AI создаст сценарий автоматически.
                        </p>
                    </div>
                </div>
            </div>
        </PageContainer>
    );
}
