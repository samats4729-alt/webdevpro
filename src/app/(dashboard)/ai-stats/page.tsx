import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { BarChart3, Zap, MessageCircle, CheckCircle } from "lucide-react";

export default function AIStatsPage() {
    return (
        <PageContainer>
            <PageHeader
                title="AI Statistics"
                description="Monitor performance and usage metrics."
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard icon={Zap} label="Token Usage" value="0" sub="Approx. $0.00" />
                <StatCard icon={MessageCircle} label="Total Messages" value="0" sub="Last 30 days" />
                <StatCard icon={CheckCircle} label="Resolution Rate" value="0%" sub="Automated closures" />
            </div>

            <div className="h-64 dark-card flex items-center justify-center text-gray-500">
                Chart Visualization Placeholder
            </div>
        </PageContainer>
    );
}

function StatCard({ icon: Icon, label, value, sub }: any) {
    return (
        <div className="dark-card p-6">
            <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-accent" />
                </div>
                <span className="text-gray-400 font-medium">{label}</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{value}</div>
            <div className="text-xs text-gray-500">{sub}</div>
        </div>
    )
}
