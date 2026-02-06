"use client";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { Webhook, CheckCircle2, XCircle } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export default function IntegrationsPage() {
    const { t } = useLanguage();

    return (
        <PageContainer>
            <PageHeader
                title={t.integrations.title}
                description={t.integrations.subtitle}
            />

            <div className="grid grid-cols-1 gap-4">
                <IntegrationCard
                    name="Webhooks"
                    description="Send data to any URL when a lead is captured."
                    status="active"
                    icon={Webhook}
                    t={t}
                />
                <IntegrationCard
                    name="HubSpot CRM"
                    description="Sync contacts and conversations automatically."
                    status="inactive"
                    icon={() => <div className="font-bold text-orange-500 text-xl">H</div>}
                    t={t}
                />
                <IntegrationCard
                    name="Salesforce"
                    description="Enterprise-grade CRM integration."
                    status="inactive"
                    icon={() => <div className="font-bold text-blue-500 text-xl">S</div>}
                    t={t}
                />
                <IntegrationCard
                    name="Google Sheets"
                    description="Export leads to a spreadsheet in real-time."
                    status="active"
                    icon={() => <div className="font-bold text-green-500 text-xl">G</div>}
                    t={t}
                />
            </div>

            <div className="mt-8 dark-card p-6">
                <h3 className="text-lg font-medium text-white mb-4">{t.integrations.apiKeys}</h3>
                <div className="flex gap-2">
                    <input type="text" readOnly value="sk_live_51M..." className="search-input font-mono text-gray-400" />
                    <button className="btn-secondary px-4">{t.integrations.copy}</button>
                    <button className="btn-secondary px-4 text-red-400 border-red-400/20 hover:bg-red-500/10">{t.integrations.revoke}</button>
                </div>
                <p className="text-xs text-gray-500 mt-2">{t.integrations.warning}</p>
            </div>
        </PageContainer>
    );
}

function IntegrationCard({ name, description, status, icon: Icon, t }: any) {
    return (
        <div className="dark-card p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full">
                <div className="w-12 h-12 rounded-xl bg-accent/5 border border-card-border flex items-center justify-center">
                    <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h4 className="text-lg font-medium text-white">{name}</h4>
                    <p className="text-sm text-gray-500">{description}</p>
                </div>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto">
                {status === 'active' ? (
                    <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {t.integrations.connected}
                    </span>
                ) : (
                    <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-gray-500/10 px-2.5 py-1 rounded-full">
                        <XCircle className="w-3.5 h-3.5" />
                        {t.integrations.notConnected}
                    </span>
                )}
                <button className="btn-secondary text-sm px-4 whitespace-nowrap">{t.integrations.configure}</button>
            </div>
        </div>
    )
}
