"use client";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { Bot, Workflow, Plus, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n";

const mockFlows = [
    {
        botId: "1",
        botName: "Support Assistant",
        flows: [
            { id: "f1", name: "Welcome Flow", nodes: 5, lastEdited: "2 hours ago" },
            { id: "f2", name: "Price Inquiry", nodes: 3, lastEdited: "1 day ago" },
        ]
    }
];

export default function FlowsPage() {
    const { t } = useLanguage();

    return (
        <PageContainer>
            <PageHeader
                title={t.flows.title}
                description={t.flows.subtitle}
            >
                <button className="btn-primary flex items-center gap-2 text-sm px-4 py-2">
                    <Plus className="w-4 h-4" />
                    {t.flows.newFlow}
                </button>
            </PageHeader>

            <div className="space-y-6">
                {mockFlows.map((bot) => (
                    <div key={bot.botId} className="dark-card p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent to-green-600 flex items-center justify-center">
                                <Bot className="w-5 h-5 text-black" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white">{bot.botName}</h3>
                                <p className="text-xs text-gray-500">{bot.flows.length} flows</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {bot.flows.map((flow) => (
                                <Link
                                    key={flow.id}
                                    href={`/my-bots/${bot.botId}?tab=flows&flow=${flow.id}`}
                                    className="block"
                                >
                                    <div className="flex items-center justify-between p-4 rounded-lg border border-card-border hover:border-accent/50 transition-colors group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                                <Workflow className="w-4 h-4 text-blue-500" />
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-white">{flow.name}</h4>
                                                <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                                                    <span>{flow.nodes} {t.flows.nodes}</span>
                                                    <span>•</span>
                                                    <span>{t.flows.edited} {flow.lastEdited}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-red-400">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </PageContainer>
    );
}
