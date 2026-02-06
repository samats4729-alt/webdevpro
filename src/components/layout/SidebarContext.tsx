'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface SidebarContextType {
    isCollapsed: boolean;
    setIsCollapsed: (value: boolean) => void;
    toggleCollapsed: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleCollapsed = () => setIsCollapsed(!isCollapsed);

    return (
        <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed, toggleCollapsed }}>
            {children}
        </SidebarContext.Provider>
    );
}

export function useSidebar() {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error('useSidebar must be used within a SidebarProvider');
    }
    return context;
}
