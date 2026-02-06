"use client";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { Sparkles, MessageSquare } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export default function AIPersonaPage() {
    const { t } = useLanguage();

    return (
        <PageContainer>
            <PageHeader
                title={t.aiPersona.title}
                description={t.aiPersona.subtitle}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="dark-card p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-accent" />
                        {t.aiPersona.systemPrompt}
                    </h3>
                    <textarea
                        className="w-full h-64 bg-dark-bg border border-card-border rounded-xl p-4 text-gray-300 focus:outline-none focus:border-accent/50"
                        placeholder={t.aiPersona.systemPromptPlaceholder}
                    ></textarea>
                    <div className="mt-4 flex justify-end">
                        <button className="btn-primary">{t.aiPersona.save}</button>
                    </div>
                </div>

                <div className="dark-card p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-accent" />
                        {t.aiPersona.testSandbox}
                    </h3>
                    <div className="h-64 bg-dark-bg rounded-xl border border-dashed border-card-border flex items-center justify-center text-gray-500 text-sm">
                        {t.aiPersona.preview}
                    </div>
                </div>
            </div>
        </PageContainer>
    );
}
