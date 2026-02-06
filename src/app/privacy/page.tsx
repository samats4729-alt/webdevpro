"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function PrivacyPolicy() {
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
                <h1 className="text-4xl font-bold mb-2">Политика конфиденциальности</h1>
                <p className="text-gray-400 mb-12">Последнее обновление: 29 января 2026 г.</p>

                <div className="space-y-8 text-gray-300 font-light leading-relaxed">
                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4">1. Введение</h2>
                        <p>
                            Добро пожаловать в WebDevPro (ИП EA Trade) (далее "мы", "наш" или "нам"). Мы уважаем вашу конфиденциальность и обязуемся защищать ваши персональные данные.
                            Настоящая политика конфиденциальности информирует вас о том, как мы обрабатываем ваши данные при посещении нашего веб-сайта
                            и рассказывает о ваших правах на конфиденциальность и о том, как закон защищает вас.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4">2. Данные, которые мы собираем</h2>
                        <p>
                            Персональные данные означают любую информацию о физическом лице, по которой это лицо может быть идентифицировано.
                            Они не включают данные, где личность была удалена (анонимные данные).
                        </p>
                        <p className="mt-4">
                            Мы можем собирать, использовать, хранить и передавать различные виды персональных данных:
                        </p>
                        <ul className="list-disc pl-5 mt-4 space-y-2 text-gray-400">
                            <li><strong>Идентификационные данные:</strong> включают имя, фамилию, имя пользователя.</li>
                            <li><strong>Контактные данные:</strong> включают адрес электронной почты и телефонные номера.</li>
                            <li><strong>Финансовые данные:</strong> включают детали платежей (безопасно обрабатываются нашими платежными партнерами). Мы не храним полные данные ваших карт.</li>
                            <li><strong>Технические данные:</strong> включают IP-адрес, данные для входа, тип и версию браузера.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4">3. Как мы используем ваши данные</h2>
                        <p>
                            Мы используем ваши данные только в случаях, предусмотренных законом. Чаще всего мы используем ваши данные в следующих случаях:
                        </p>
                        <ul className="list-disc pl-5 mt-4 space-y-2 text-gray-400">
                            <li>Когда нам нужно выполнить контракт, который мы собираемся заключить или уже заключили с вами.</li>
                            <li>Когда это необходимо для наших законных интересов (или интересов третьих лиц), и ваши интересы и фундаментальные права не превалируют над этими интересами.</li>
                            <li>Когда нам нужно соблюсти юридическое или нормативное обязательство.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4">4. Безопасность данных</h2>
                        <p>
                            Мы внедрили соответствующие меры безопасности, чтобы предотвратить случайную потерю, использование или несанкционированный доступ, изменение или раскрытие ваших персональных данных.
                            Кроме того, мы ограничиваем доступ к вашим персональным данным теми сотрудниками и подрядчиками, которым это необходимо для работы.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4">5. Контакты</h2>
                        <p>
                            Если у вас есть вопросы по поводу этой политики конфиденциальности, пожалуйста, свяжитесь с нами по адресу: support@webdevpro.com
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
