"use client";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import PlaceholderState from "@/components/ui/PlaceholderState";
import { Share2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export default function ChannelsPage() {
    const { t } = useLanguage();

    return (
        <PageContainer>
            <PageHeader
                title={t.channels.title}
                description={t.channels.subtitle}
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { name: 'WhatsApp', color: 'bg-[#25D366]' },
                    { name: 'Telegram', color: 'bg-[#229ED9]' },
                    { name: 'Instagram', color: 'bg-[#C13584]' }
                ].map((channel) => (
                    <div key={channel.name} className="dark-card p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full ${channel.color} flex items-center justify-center text-white font-bold`}>
                                {channel.name[0]}
                            </div>
                            <div>
                                <h3 className="font-semibold text-white">{channel.name}</h3>
                                <p className="text-xs text-gray-500">{t.channels.notConnected}</p>
                            </div>
                        </div>
                        <button className="btn-secondary text-xs px-3 py-1.5 h-auto">{t.channels.connect}</button>
                    </div>
                ))}
            </div>
        </PageContainer>
    );
}
