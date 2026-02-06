"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function TermsOfService() {
    return (
        <div className="min-h-screen bg-[#020202] text-white font-sans selection:bg-accent/30 selection:text-accent">
            {/* Back Button */}
            <div className="fixed top-8 left-8 z-50">
                <Link href="/" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors group">
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-white/20 transition-all">
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    </div>
                    <span className="text-sm font-light">На главную</span>
                </Link>
            </div>

            <div className="max-w-3xl mx-auto px-6 py-24">
                <h1 className="text-4xl font-bold mb-2">Публичная оферта и Условия использования</h1>
                <p className="text-gray-400 mb-12">Последнее обновление: 29 января 2026 г.</p>

                <div className="space-y-8 text-gray-300 font-light leading-relaxed">
                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4">1. Введение</h2>
                        <p>
                            Эти Условия использования представляют собой юридически обязательное соглашение между вами ("вы") и WebDevPro ("мы", "нас").
                            Получая доступ к сервису, вы подтверждаете, что прочитали, поняли и согласны соблюдать все эти Условия.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4">2. Публичная оферта</h2>
                        <p>
                            В соответствии с законодательством Республики Казахстан, этот документ является публичной офертой.
                            Акцептом данной оферты является регистрация пользователя на сайте или оплата услуг Сервиса.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4">3. Предоставляемые услуги</h2>
                        <p>
                            WebDevPro предоставляет инструменты автоматизации WhatsApp на базе искусственного интеллекта.
                            Мы оставляем за собой право изменять, приостанавливать или прекращать работу сервиса в любое время.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4">4. Оплата и Возврат средств</h2>
                        <p>
                            Цены на наши услуги описаны на странице тарифов. Все платежи безопасно обрабатываются через наших партнеров (например, Robokassa).
                        </p>
                        <div className="bg-white/5 border border-white/5 p-4 rounded-xl mt-4 text-sm text-gray-400">
                            <p className="mb-2">
                                Оформляя заказ, вы соглашаетесь с условиями <Link href="/terms" className="text-accent hover:underline">Публичной оферты</Link> и <Link href="/privacy" className="text-accent hover:underline">Политикой конфиденциальности</Link>.
                            </p>
                            <p>
                                Безопасность платежей гарантируется платежным агрегатором <strong className="text-white">Robokassa</strong>. Мы не храним данные ваших банковских карт. Все транзакции защищены технологией 3D-Secure.
                            </p>
                        </div>
                        <h3 className="text-lg font-medium text-white mt-6 mb-2">Политика возврата (Refund Policy)</h3>
                        <p>
                            Вы имеете право запросить полный возврат средств в течение <strong className="text-white">14 календарных дней</strong> с момента покупки, если сервис не соответствует заявленным функциям.
                        </p>
                        <p className="mt-2">
                            Для запроса возврата отправьте заявление в свободной форме на email: <a href="mailto:support@webdevpro.com" className="text-accent hover:underline">support@webdevpro.com</a>.
                        </p>
                        <p className="mt-2">
                            Возврат осуществляется на ту же банковскую карту, с которой была произведена оплата. Средства поступят на ваш счет в срок от <strong className="text-white">5 до 30 рабочих дней</strong> (в зависимости от банка).
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4">5. Доставка и доступ к услугам</h2>
                        <p>
                            Услуги предоставляются полностью в цифровом виде. Физическая доставка товаров не осуществляется.
                        </p>
                        <p className="mt-4">
                            После успешной оплаты вы <strong className="text-white">автоматически получаете доступ</strong> к личному кабинету WebDevPro.
                        </p>
                        <p className="mt-4">
                            Данные для входа (логин и пароль) отправляются на указанный при оплате Email в течение <strong className="text-white">5 минут</strong>.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4">6. Ответственность пользователя</h2>
                        <p>
                            Используя Сайт, вы заявляете и гарантируете, что: (1) вся предоставленная вами регистрационная информация будет правдивой, точной, актуальной и полной;
                            (2) вы будете поддерживать точность такой информации;
                            (3) вы обладаете дееспособностью и соглашаетесь соблюдать настоящие Условия использования.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4">7. Отказ от ответственности и Риски</h2>
                        <div className="space-y-4 text-sm mt-4">
                            <p>
                                <strong className="text-white">Неофициальное использование API:</strong> Вы понимаете и признаете, что наш сервис работает с использованием неофициального шлюза к платформе WhatsApp. Эта интеграция не одобрена, не аффилирована и не поддерживается Meta Platforms, Inc. или WhatsApp LLC.
                            </p>
                            <p>
                                <strong className="text-white">Риск блокировки:</strong> Использование инструментов автоматизации с личными или бизнес-аккаунтами несет в себе неотъемлемый риск. WhatsApp определяет, какая деятельность считается "спамом" или поведением "бота". Мы не можем гарантировать, что ваш номер не будет заблокирован или забанен WhatsApp.
                            </p>
                            <p>
                                <strong className="text-white">Принятие ответственности:</strong> Используя этот сервис, вы явно соглашаетесь с тем, что берете на себя все риски, связанные с возможной блокировкой вашего номера WhatsApp. Вы подтверждаете, что используете этот сервис на свой страх и риск.
                            </p>
                            <p>
                                <strong className="text-white">Отсутствие ответственности:</strong> ИП "EA Trade" (WebDevPro) НЕ несет ответственности за любые прямые, косвенные, случайные или побочные убытки, возникшие в результате обоснованной или необоснованной блокировки вашего аккаунта WhatsApp, потери истории чатов или каналов деловой связи.
                            </p>
                            <p>
                                <strong className="text-white">Запрещенное использование:</strong> Вы соглашаетесь НЕ использовать сервис для отправки спама, нежелательных массовых сообщений или любого контента, нарушающего Коммерческую политику или Условия использования WhatsApp.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4">8. Контактная информация</h2>
                        <p>
                            ИП "EA Trade"<br />
                            ИИН: 981225300653<br />
                            Адрес: Алматы, Казахстан<br />
                            Email: support@webdevpro.com
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
