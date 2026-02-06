"use client";

import Link from "next/link";
import { ChevronLeft, Building2, MapPin, Mail, Phone, FileText } from "lucide-react";

export default function ContactsPage() {
    return (
        <div className="min-h-screen bg-[#020202] text-white font-sans selection:bg-accent/30 selection:text-accent">
            <div className="fixed top-8 left-8 z-50">
                <Link href="/" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors group">
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-white/20 transition-all">
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    </div>
                    <span className="text-sm font-light">На главную</span>
                </Link>
            </div>

            <div className="max-w-3xl mx-auto px-6 py-24">
                <h1 className="text-4xl font-bold mb-12">Контакты и Реквизиты</h1>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Requisites Card */}
                    <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-3xl space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Building2 className="w-6 h-6 text-accent" />
                            <h2 className="text-xl font-semibold">Реквизиты</h2>
                        </div>

                        <div className="space-y-4 text-sm text-gray-300">
                            <div>
                                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Наименование</p>
                                <p className="font-medium text-white">ИП EA Trade</p>
                            </div>

                            <div>
                                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">ИИН</p>
                                <p className="font-mono text-white">981225300653</p>
                            </div>

                            <div>
                                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Уведомление</p>
                                <p className="font-medium text-white">KZ77UWQ02448345</p>
                                <p className="text-xs text-gray-400">от 17.03.2021</p>
                            </div>
                        </div>
                    </div>

                    {/* Contacts Card */}
                    <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-3xl space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <MapPin className="w-6 h-6 text-accent" />
                            <h2 className="text-xl font-semibold">Контакты</h2>
                        </div>

                        <div className="space-y-6">


                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                                    <Mail className="w-5 h-5 text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Email</p>
                                    <a href="mailto:support@webdevpro.com" className="text-white text-sm hover:text-accent transition-colors">support@webdevpro.com</a>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                                    <Phone className="w-5 h-5 text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Телефон</p>
                                    <a href="tel:+77771228209" className="text-white text-sm hover:text-accent transition-colors">+7 777 122 82 09</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional Info */}
                <div className="mt-8 bg-[#0a0a0a] border border-white/5 p-8 rounded-3xl">
                    <div className="flex items-center gap-3 mb-4">
                        <FileText className="w-6 h-6 text-accent" />
                        <h2 className="text-xl font-semibold">Безопасность платежей</h2>
                    </div>
                    <p className="text-gray-400 font-light text-sm leading-relaxed">
                        Оформляя заказ, вы соглашаетесь с условиями Договора публичной оферты и Политикой конфиденциальности.
                        Безопасность платежей гарантируется платежным агрегатором <strong className="text-white">Robokassa</strong>.
                        Мы не храним данные ваших банковских карт. Все транзакции защищены технологией 3D-Secure.
                    </p>
                </div>
            </div>
        </div>
    );
}
