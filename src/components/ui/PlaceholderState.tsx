import React from "react";
import { LucideIcon } from "lucide-react";

interface PlaceholderStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: React.ReactNode;
}

export default function PlaceholderState({ icon: Icon, title, description, action }: PlaceholderStateProps) {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border-2 border-dashed border-card-border bg-white/5 h-[400px]">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-6">
                <Icon className="w-8 h-8 text-accent" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
            <p className="text-gray-400 max-w-sm mb-8">{description}</p>
            {action}
        </div>
    );
}
