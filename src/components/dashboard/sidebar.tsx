"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    FARMER_NAV_ITEMS,
    COMPANY_NAV_ITEMS,
    COMMON_FOOTER_NAV_ITEMS,
    NavItem
} from "@/lib/config/navigation";
import { LogOut, Leaf } from "lucide-react";
import { signOut, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "./notifications/notification-bell";

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { data: session, isPending } = useSession();

    if (isPending) return <div className="w-64 bg-slate-900 h-screen animate-pulse" />;

    const role = session?.user?.role as "FARMER" | "COMPANY" | undefined;
    const navItems = role === "FARMER" ? FARMER_NAV_ITEMS : COMPANY_NAV_ITEMS;

    const handleLogout = async () => {
        await signOut({
            fetchOptions: {
                onSuccess: () => {
                    router.push("/connexion");
                },
            },
        });
    };

    return (
        <div className="w-64 flex flex-col h-screen bg-slate-900 text-slate-300 border-r border-slate-800 fixed left-0 top-0 z-40">
            {/* Logo Section */}
            <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-green-600 p-2 rounded-xl">
                        <Leaf className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-bold text-white tracking-tight">AGRIMAR</span>
                </div>
                <NotificationBell />
            </div>

            {/* Navigation Section */}
            <div className="flex-1 px-4 py-4 space-y-8 overflow-y-auto">
                <div>
                    <h3 className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
                        Menu Principal
                    </h3>
                    <nav className="space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group relative",
                                        isActive
                                            ? "bg-green-600/10 text-green-500 font-medium"
                                            : "hover:bg-slate-800 hover:text-white"
                                    )}
                                >
                                    {isActive && (
                                        <div className="absolute left-0 w-1 h-6 bg-green-500 rounded-r-full" />
                                    )}
                                    <Icon className={cn(
                                        "w-5 h-5",
                                        isActive ? "text-green-500" : "text-slate-400 group-hover:text-white"
                                    )} />
                                    {item.title}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </div>

            {/* Footer Section */}
            <div className="p-4 border-t border-slate-800 space-y-2">
                <h3 className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Compte
                </h3>
                {COMMON_FOOTER_NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-all group"
                        >
                            <Icon className="w-5 h-5 text-slate-400 group-hover:text-white" />
                            {item.title}
                        </Link>
                    );
                })}
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all group"
                >
                    <LogOut className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" />
                    Déconnexion
                </button>
            </div>
        </div>
    );
}
