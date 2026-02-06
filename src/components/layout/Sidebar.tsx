"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLanguage, Language } from "@/lib/i18n";
import { useSidebar } from "./SidebarContext";
import {
    LayoutDashboard,
    Bot,
    LayoutTemplate,
    Share2,
    BookOpen,
    Sparkles,
    Users,
    BarChart3,
    CreditCard,
    Webhook,
    HelpCircle,
    MessageSquare,
    Search,
    Workflow,
    LogOut,
    Lock,
    Globe,
    ChevronLeft,
    ChevronRight,
    Menu,
    Calendar,
    Package,
    Send
} from "lucide-react";

interface SidebarItem {
    href: string;
    icon: any;
    labelKey: keyof typeof import("@/lib/i18n").translations.ru.sidebar;
    locked?: boolean;
}

interface SidebarSection {
    titleKey: keyof typeof import("@/lib/i18n").translations.ru.sidebar;
    items: SidebarItem[];
}

const sidebarSections: SidebarSection[] = [
    {
        titleKey: "main",
        items: [
            { href: "/dashboard", icon: LayoutDashboard, labelKey: "overview" },
        ],
    },
    {
        titleKey: "botManagement",
        items: [
            { href: "/my-bots", icon: Bot, labelKey: "myBots" },
            { href: "/blueprints", icon: LayoutTemplate, labelKey: "blueprints" },
        ],
    },
    {
        titleKey: "aiEngine",
        items: [
            { href: "/ai-chat", icon: MessageSquare, labelKey: "createWithAI", locked: false },
        ],
    },
    {
        titleKey: "analytics",
        items: [
            { href: "/leads", icon: Users, labelKey: "leads", locked: false },
            { href: "/appointments", icon: Calendar, labelKey: "appointments" as any, locked: false },
            { href: "/broadcasts", icon: Send, labelKey: "broadcasts" as any, locked: false },
        ],
    },
    {
        titleKey: "settings",
        items: [
            { href: "/billing", icon: CreditCard, labelKey: "billing", locked: false },
            { href: "/help", icon: HelpCircle, labelKey: "help", locked: false },
        ],
    },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [user, setUser] = useState<any>(null);
    const { isCollapsed, setIsCollapsed } = useSidebar();
    const supabase = createClient();
    const { language, setLanguage, t } = useLanguage();

    useEffect(() => {
        async function getUser() {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        }
        getUser();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = '/';
    };

    const toggleLanguage = () => {
        setLanguage(language === 'ru' ? 'en' : 'ru');
    };

    const getUserInitial = () => {
        if (user?.user_metadata?.full_name) {
            return user.user_metadata.full_name.charAt(0).toUpperCase();
        }
        if (user?.email) {
            return user.email.charAt(0).toUpperCase();
        }
        return 'U';
    };

    const getUserName = () => {
        return user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
    };

    return (
        <aside
            className={`
                fixed left-0 top-0 h-screen 
                bg-[#0c0c0c]
                border-r border-white/[0.08]
                flex flex-col z-50 
                transition-all duration-300 ease-out
                ${isCollapsed ? "w-[64px]" : "w-[200px]"}
            `}
        >
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/[0.03] via-transparent to-purple-500/[0.02] pointer-events-none" />

            {/* Logo Area */}
            <div className={`
                relative h-16 flex items-center
                border-b border-white/[0.08]
                transition-all duration-300 
                ${isCollapsed ? "justify-center px-0" : "px-4"}
            `}>
                {/* Logo glow */}
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-16 h-16 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

                <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden relative z-10">
                    <div className="
                        w-9 h-9 rounded-xl 
                        bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 
                        flex items-center justify-center 
                        shadow-lg shadow-emerald-500/25
                        shrink-0
                        ring-1 ring-emerald-400/20
                    ">
                        <Bot className="w-5 h-5 text-white" />
                    </div>

                    <div className={`transition-all duration-300 ${isCollapsed ? "w-0 opacity-0 absolute" : "w-auto opacity-100"}`}>
                        <h1 className="font-bold text-sm text-white tracking-tight whitespace-nowrap">WebDevPro</h1>
                        <p className="text-[8px] text-emerald-400/70 font-medium tracking-widest uppercase">AI Platform</p>
                    </div>
                </Link>
            </div>

            {/* Navigation Sections */}
            <nav className="flex-1 px-3 overflow-y-auto overflow-x-hidden py-4 scrollbar-hide space-y-5 relative z-10">
                {sidebarSections.map((section, index) => (
                    <div key={index}>
                        {!isCollapsed && (
                            <p className="text-[9px] font-semibold text-gray-500/70 uppercase tracking-widest px-2 mb-2">
                                {t.sidebar[section.titleKey]}
                            </p>
                        )}
                        <div className="space-y-1">
                            {section.items.map((item) => {
                                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                                const isLocked = item.locked;

                                return (
                                    <Link
                                        key={item.href}
                                        href={isLocked ? '#' : item.href}
                                        className={`
                                            group relative flex items-center gap-2.5 
                                            py-2 rounded-xl
                                            font-medium text-xs
                                            transition-all duration-200
                                            ${isCollapsed ? "justify-center px-0" : "px-3"}
                                            ${isActive
                                                ? "text-white bg-white/10"
                                                : isLocked
                                                    ? "text-gray-600 cursor-not-allowed"
                                                    : "text-gray-400 hover:text-white hover:bg-white/[0.05]"
                                            }
                                        `}
                                        onClick={(e) => isLocked && e.preventDefault()}
                                    >
                                        {/* Active indicator */}
                                        {isActive && (
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-emerald-500 rounded-r-lg shadow-lg shadow-emerald-500/50" />
                                        )}

                                        <item.icon className={`w-4 h-4 shrink-0 transition-transform duration-200 ${!isLocked && "group-hover:scale-110"}`} />

                                        {!isCollapsed && (
                                            <>
                                                <span className="truncate flex-1">{t.sidebar[item.labelKey]}</span>
                                                {isLocked && <Lock className="w-3 h-3 text-gray-600" />}
                                            </>
                                        )}

                                        {/* Tooltip for collapsed state */}
                                        {isCollapsed && (
                                            <div className="
                                                absolute left-full ml-2 px-2.5 py-1.5 
                                                bg-[#1a1a1a] border border-white/10 
                                                rounded-lg text-xs text-white 
                                                opacity-0 invisible 
                                                group-hover:opacity-100 group-hover:visible 
                                                transition-all duration-200
                                                whitespace-nowrap z-50
                                                shadow-xl
                                            ">
                                                {t.sidebar[item.labelKey]}
                                                {isLocked && <span className="text-gray-500 ml-1">(скоро)</span>}
                                            </div>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Bottom Section */}
            <div className={`
                relative border-t border-white/[0.08] 
                transition-all duration-300
                ${isCollapsed ? "p-2 space-y-2" : "p-3 space-y-3"}
            `}>
                {/* Subtle glow */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

                {/* Language toggle */}
                <button
                    onClick={toggleLanguage}
                    className={`
                        relative z-10
                        w-full flex items-center justify-center gap-1.5 
                        py-2 rounded-lg
                        bg-white/[0.04] 
                        border border-white/[0.06]
                        hover:bg-white/[0.08] hover:border-white/10
                        transition-all duration-200
                        text-[10px] font-medium text-gray-400 hover:text-white
                        ${isCollapsed ? "px-0" : "px-3"}
                    `}
                >
                    <Globe className="w-3 h-3" />
                    {!isCollapsed && <span>{language === 'ru' ? 'RU' : 'EN'}</span>}
                </button>

                {/* Collapse/Expand Button */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className={`
                        relative z-10
                        w-full flex items-center justify-center gap-1.5 
                        py-2 rounded-lg
                        bg-white/[0.04] 
                        border border-white/[0.06]
                        hover:bg-white/[0.08] hover:border-white/10
                        transition-all duration-200
                        text-[10px] font-medium text-gray-400 hover:text-white
                    `}
                >
                    {isCollapsed ? (
                        <ChevronRight className="w-4 h-4" />
                    ) : (
                        <>
                            <ChevronLeft className="w-3 h-3" />
                            <span>Свернуть</span>
                        </>
                    )}
                </button>

                {/* User profile */}
                <div className={`relative z-10 flex items-center gap-2 ${isCollapsed ? "justify-center" : ""}`}>
                    <div className="
                        w-8 h-8 rounded-lg 
                        bg-gradient-to-br from-gray-600 to-gray-800 
                        border border-white/10 
                        flex items-center justify-center 
                        text-xs font-bold text-white 
                        shrink-0
                    ">
                        {getUserInitial()}
                    </div>

                    {!isCollapsed && (
                        <div className="flex-1 min-w-0 overflow-hidden">
                            <p className="text-xs font-medium text-white truncate">{getUserName()}</p>
                            <p className="text-[9px] text-emerald-400/60 truncate">Pro Plan</p>
                        </div>
                    )}

                    {!isCollapsed && (
                        <button
                            onClick={handleLogout}
                            className="
                                p-1.5 rounded-lg 
                                hover:bg-red-500/15 
                                text-gray-500 hover:text-red-400 
                                transition-all duration-200
                            "
                            title={t.sidebar.logout}
                        >
                            <LogOut className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            </div>
        </aside>
    );
}
