"use client";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { MessageCircle, Send, Phone, Video, Search, MoreVertical, Bot } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export default function LiveChatPage() {
    const { t } = useLanguage();

    return (
        <PageContainer>
            <div className="h-[calc(100vh-8rem)] flex rounded-2xl overflow-hidden border border-card-border bg-dark-card">
                {/* Contacts Sidebar */}
                <div className="w-80 border-r border-card-border flex flex-col">
                    <div className="p-4 border-b border-card-border">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input type="text" placeholder={t.liveChat.search} className="w-full bg-dark-bg border border-card-border rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-accent/50" />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {[
                            { name: 'Alice Wilson', msg: 'I need help with my order', time: '2m', unread: 2, online: true },
                            { name: 'Robert Fox', msg: 'Thanks for the info!', time: '1h', unread: 0, online: false },
                            { name: 'Cody Fisher', msg: 'When will it arrive?', time: '3h', unread: 0, online: true },
                        ].map((chat, i) => (
                            <div key={i} className={`p-4 flex gap-3 hover:bg-white/5 cursor-pointer transition-colors ${i === 0 ? 'bg-white/5 border-l-2 border-accent' : ''}`}>
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold">
                                        {chat.name[0]}
                                    </div>
                                    {chat.online && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-dark-card rounded-full"></div>}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-0.5">
                                        <h4 className="font-medium text-white truncate">{chat.name}</h4>
                                        <span className="text-xs text-gray-500">{chat.time}</span>
                                    </div>
                                    <p className="text-sm text-gray-400 truncate">{chat.msg}</p>
                                </div>
                                {chat.unread > 0 && (
                                    <div className="flex flex-col justify-center">
                                        <div className="w-5 h-5 rounded-full bg-accent text-black text-xs font-bold flex items-center justify-center">
                                            {chat.unread}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col bg-[#0f0f0f]">
                    {/* Chat Header */}
                    <div className="p-4 border-b border-card-border flex justify-between items-center bg-dark-card">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold">
                                A
                            </div>
                            <div>
                                <h3 className="font-bold text-white">Alice Wilson</h3>
                                <span className="text-xs text-green-500 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                    Online via WhatsApp
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 text-gray-400">
                            <button className="hover:text-white"><Phone className="w-5 h-5" /></button>
                            <button className="hover:text-white"><Video className="w-5 h-5" /></button>
                            <button className="hover:text-white"><MoreVertical className="w-5 h-5" /></button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 p-6 overflow-y-auto space-y-6">
                        <div className="flex justify-center">
                            <span className="text-xs text-gray-500 bg-white/5 px-3 py-1 rounded-full">{t.liveChat.today}, 10:23 AM</span>
                        </div>

                        {/* Bot Message */}
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
                                <Bot className="w-5 h-5 text-black" />
                            </div>
                            <div className="bg-dark-card border border-card-border p-3 rounded-2xl rounded-tl-none max-w-md text-gray-300 text-sm">
                                Hello! How can I assist you today?
                            </div>
                        </div>

                        {/* User Message */}
                        <div className="flex gap-4 flex-row-reverse">
                            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold flex-shrink-0 text-xs">A</div>
                            <div className="bg-accent/10 border border-accent/20 p-3 rounded-2xl rounded-tr-none max-w-md text-white text-sm">
                                Hi, I need help with my recent order #12345. It hasn't arrived yet.
                            </div>
                        </div>

                        {/* Bot Message */}
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
                                <Bot className="w-5 h-5 text-black" />
                            </div>
                            <div className="bg-dark-card border border-card-border p-3 rounded-2xl rounded-tl-none max-w-md text-gray-300 text-sm">
                                I can check that for you. Please give me a moment to look up the details...
                            </div>
                        </div>
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-dark-card border-t border-card-border">
                        <div className="flex items-center gap-3">
                            <input
                                type="text"
                                placeholder={t.liveChat.typeMessage}
                                className="flex-1 bg-dark-bg border border-card-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent/50"
                            />
                            <button className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center text-black hover:bg-accent/90 transition-colors">
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex justify-between mt-2 px-1">
                            <div className="text-xs text-gray-500">{t.liveChat.enterToSend}</div>
                            <button className="text-xs text-accent hover:underline">{t.liveChat.takeOver}</button>
                        </div>
                    </div>
                </div>
            </div>
        </PageContainer>
    );
}
