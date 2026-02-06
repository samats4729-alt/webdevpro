'use client';

import dynamic from "next/dynamic";
import React from "react";
import { SidebarProvider, useSidebar } from "@/components/layout/SidebarContext";

const Sidebar = dynamic(() => import("@/components/layout/Sidebar"), { ssr: false });

function DashboardContent({ children }: { children: React.ReactNode }) {
    const { isCollapsed } = useSidebar();

    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <main
                className="flex-1 p-4 overflow-auto transition-all duration-300"
                style={{ marginLeft: isCollapsed ? '64px' : '200px' }}
            >
                {children}
            </main>
        </div>
    );
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider>
            <DashboardContent>{children}</DashboardContent>
        </SidebarProvider>
    );
}
