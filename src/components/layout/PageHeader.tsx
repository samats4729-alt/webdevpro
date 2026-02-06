import React from "react";

interface PageHeaderProps {
    title: string;
    description?: string;
    children?: React.ReactNode;
}

export default function PageHeader({ title, description, children }: PageHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
            <div>
                <h1 className="text-lg font-semibold tracking-tight text-white">{title}</h1>
                {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
            </div>
            {children && <div className="flex bg-white/5 p-1 rounded-lg">{children}</div>}
        </div>
    );
}
