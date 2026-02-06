import React from "react";

interface PageContainerProps {
    children: React.ReactNode;
}

export default function PageContainer({ children }: PageContainerProps) {
    return (
        <div className="w-full max-w-7xl mx-auto space-y-4">
            {children}
        </div>
    );
}
