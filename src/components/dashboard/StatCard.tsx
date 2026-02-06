"use client";

import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
    label: string;
    value: string;
    subtext?: string;
    change?: string;
    changeType?: "positive" | "negative" | "neutral";
    icon?: LucideIcon;
}

export default function StatCard({ label, value, subtext, change, changeType = "neutral" }: StatCardProps) {
    return (
        <div className="stat-card">
            <p className="text-gray-400 text-sm mb-1">{label}</p>
            <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-white">{value}</p>
                {change && (
                    <span className={`text-sm flex items-center gap-1 ${changeType === "positive" ? "text-accent" :
                            changeType === "negative" ? "text-red-400" : "text-gray-400"
                        }`}>
                        {changeType === "positive" && <TrendingUp className="w-3 h-3" />}
                        {changeType === "negative" && <TrendingDown className="w-3 h-3" />}
                        {change}
                    </span>
                )}
            </div>
            {subtext && (
                <p className="text-xs text-gray-500 mt-1">{subtext}</p>
            )}
        </div>
    );
}
