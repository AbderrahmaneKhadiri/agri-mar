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
import { NotificationBell } from "./notifications/notification-bell";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { data: session, isPending } = useSession();

    if (isPending) return <div className="w-[280px] bg-white h-screen animate-pulse border-r border-slate-100" />;

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
        <div className="w-[280px] flex flex-col h-screen bg-white text-slate-800 border-r border-slate-100/60 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.05)] fixed left-0 top-0 z-40">
            {/* Logo Section */}
            <div className="p-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-emerald-600 p-2.5 rounded-2xl shadow-lg shadow-emerald-600/20">
                        <Leaf className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-black text-slate-900 tracking-tight">AGRIMAR</span>
                </div>
                <NotificationBell userId={session?.user?.id} />
            </div>

            {/* Navigation Section */}
            <div className="flex-1 px-4 py-2 space-y-8 overflow-y-auto hide-scrollbar">
                <div>
                    <h3 className="px-5 text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-5">
                        MAIN OPERATIONS
                    </h3>
                    <nav className="space-y-1.5 px-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/dashboard/farmer" && item.href !== "/dashboard/company");

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group font-bold text-[13px]",
                                        isActive
                                            ? "bg-emerald-50 text-emerald-700 shadow-sm"
                                            : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                                    )}
                                >
                                    <Icon className={cn(
                                        "w-5 h-5",
                                        isActive ? "text-emerald-600" : "text-slate-400 group-hover:text-emerald-600 transition-colors"
                                    )} />
                                    {item.title}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </div>

            {/* Footer Section */}
            <div className="p-5 space-y-2 mt-auto pb-8">
                <h3 className="px-5 text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-4">
                    SECURITY & SUPPORT
                </h3>
                <div className="px-1 space-y-1">
                    {COMMON_FOOTER_NAV_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group font-bold text-[13px]",
                                    isActive
                                        ? "bg-emerald-50 text-emerald-700 shadow-sm"
                                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                                )}
                            >
                                <Icon className={cn(
                                    "w-5 h-5",
                                    isActive ? "text-emerald-600" : "text-slate-400 group-hover:text-emerald-600"
                                )} />
                                {item.title}
                            </Link>
                        );
                    })}
                    <Button
                        onClick={handleLogout}
                        variant="ghost"
                        className="w-full flex justify-start items-center gap-4 px-4 py-3.5 h-auto rounded-2xl text-red-500 font-bold text-[13px] hover:bg-red-50 hover:text-red-700 transition-all group"
                    >
                        <LogOut className="w-5 h-5 text-red-400 group-hover:scale-110 transition-transform" />
                        Déconnexion
                    </Button>

                    {/* User profile mini badge */}
                    <div className="mt-8">
                        <Separator className="mb-6 bg-slate-100" />
                        <div className="flex items-center gap-3 px-2">
                            <Avatar className="h-10 w-10 ring-2 ring-white shadow-sm border border-emerald-100">
                                <AvatarFallback className="bg-emerald-100 text-emerald-700 font-bold text-sm">
                                    {session?.user?.name?.charAt(0).toUpperCase() || "U"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-black text-slate-900 truncate tracking-tight">{session?.user?.name}</p>
                                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest">{role === "FARMER" ? "Agriculteur" : "Entreprise"}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
