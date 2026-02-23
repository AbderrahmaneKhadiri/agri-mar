"use client";

import { useState, useEffect } from "react";
import {
    getNotificationsAction,
    getUnreadNotificationsCountAction,
    markNotificationAsReadAction,
    markAllAsReadAction
} from "@/actions/notifications.actions";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
    PopoverHeader,
    PopoverTitle
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, MessageSquare, UserPlus, CheckCircle2, MoreHorizontal, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";

export function NotificationBell() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    const loadNotifications = async () => {
        const [list, count] = await Promise.all([
            getNotificationsAction(),
            getUnreadNotificationsCountAction()
        ]);
        setNotifications(list);
        setUnreadCount(count);
    };

    useEffect(() => {
        loadNotifications();
        // Polling basique toutes les 10 secondes pour simuler le temps réel
        const interval = setInterval(loadNotifications, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const result = await markNotificationAsReadAction(id);
        if (result.success) {
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        }
    };

    const handleMarkAllRead = async () => {
        const result = await markAllAsReadAction();
        if (result.success) {
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case "NEW_MESSAGE": return <MessageSquare className="h-4 w-4 text-blue-500" />;
            case "CONNECTION_REQUEST": return <UserPlus className="h-4 w-4 text-orange-500" />;
            case "CONNECTION_ACCEPTED": return <CheckCircle2 className="h-4 w-4 text-green-500" />;
            default: return <Bell className="h-4 w-4 text-slate-400" />;
        }
    };

    return (
        <Popover onOpenChange={(open) => open && loadNotifications()}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-10 w-10 rounded-xl hover:bg-slate-100 transition-all border-none"
                >
                    <Bell className="h-5 w-5 text-slate-600" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-4 ring-white">
                            {unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 border-none shadow-2xl rounded-3xl overflow-hidden bg-white mt-2" align="end">
                <PopoverHeader className="p-5 border-b border-slate-50 bg-white">
                    <div className="flex items-center justify-between">
                        <PopoverTitle className="text-sm font-black text-slate-900 tracking-tight uppercase">NOTIFICATIONS</PopoverTitle>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="text-[10px] font-bold text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-widest"
                            >
                                Tout lire
                            </button>
                        )}
                    </div>
                </PopoverHeader>
                <div className="max-h-[400px] overflow-y-auto bg-slate-50/20">
                    {notifications.length === 0 ? (
                        <div className="p-10 text-center flex flex-col items-center justify-center space-y-3">
                            <Bell className="h-8 w-8 text-slate-200" />
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Aucune notification</p>
                        </div>
                    ) : (
                        notifications.map((notif) => (
                            <Link
                                key={notif.id}
                                href={notif.link || "#"}
                                onClick={(e) => !notif.isRead && handleMarkAsRead(notif.id, e)}
                                className={cn(
                                    "flex gap-4 p-5 transition-all hover:bg-white border-b border-slate-50 relative",
                                    !notif.isRead ? "bg-white" : "opacity-60"
                                )}
                            >
                                {!notif.isRead && (
                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-full" />
                                )}
                                <div className={cn(
                                    "h-10 w-10 rounded-xl shrink-0 flex items-center justify-center",
                                    notif.type === "NEW_MESSAGE" ? "bg-blue-50" :
                                        notif.type === "CONNECTION_REQUEST" ? "bg-orange-50" : "bg-green-50"
                                )}>
                                    {getIcon(notif.type)}
                                </div>
                                <div className="space-y-1 min-w-0">
                                    <p className="text-xs font-black text-slate-900 leading-tight truncate uppercase tracking-tight">{notif.title}</p>
                                    <p className="text-[11px] text-slate-500 leading-normal line-clamp-2 font-medium">{notif.description}</p>
                                    <div className="flex items-center gap-1.5 pt-1 text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                                        <Clock className="h-3 w-3" />
                                        {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: fr })}
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
