"use client";

import { useState, useEffect, useRef } from "react";
import { PartnerDTO } from "@/data-access/connections.dal";
import { sendMessageAction, getConversationAction } from "@/actions/messaging.actions";
import { markNotificationsAsReadByLinkAction, markAllMessageNotificationsAsReadAction } from "@/actions/notifications.actions";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Send,
    MapPin,
    Building2,
    User,
    Loader2,
    FilePlus,
    Search,
    MoreHorizontal,
    MessageSquare,
    ChevronDown,
    Clock,
    CheckCheck,
    Check,
    Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { pusherClient } from "@/lib/pusher-client";
import { QuoteForm } from "./quote-form";
import { QuoteMessage } from "./quote-message";
import { ProductInquiryCard } from "./product-inquiry-card";
import { Separator } from "@/components/ui/separator";
import { ConversationSkeleton } from "./chat-skeletons";

interface ChatItem {
    id: string;
    type: "MESSAGE" | "QUOTE" | "PRODUCT_INQUIRY";
    content?: string;
    senderUserId: string;
    createdAt: Date;
    metadata?: any;
    sender?: {
        id: string;
        name: string;
        image: string | null;
        role: string;
    };
    status?: "sending" | "sent" | "error" | "PENDING" | "ACCEPTED" | "DECLINED" | string;
    clientId?: string;
    // Quote specific fields
    productName?: string;
    quantity?: string;
    unitPrice?: string;
    totalAmount?: string;
    currency?: string;
    notes?: string;
}

export function ChatInterface({
    partners,
    currentUserId
}: {
    partners: PartnerDTO[],
    currentUserId: string
}) {
    const [selectedPartner, setSelectedPartner] = useState<PartnerDTO | null>(partners[0] || null);
    const [items, setItems] = useState<ChatItem[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [isQuoteFormOpen, setIsQuoteFormOpen] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Broadly clear all message notifications when entering chat
        markAllMessageNotificationsAsReadAction();

        // Listen for ANY new notification and clear if it's a message, since we are on the Chat page
        if (!currentUserId) return;
        const channelName = `user-${currentUserId}`;
        const channel = pusherClient.subscribe(channelName);

        channel.bind("new-notification", (notif: any) => {
            if (notif.type === "NEW_MESSAGE") {
                markAllMessageNotificationsAsReadAction();
            }
        });

        return () => {
            channel.unbind_all();
            channel.unsubscribe();
        };
    }, [currentUserId]);

    useEffect(() => {
        if (selectedPartner) {
            loadConversation(selectedPartner.id);
            // Also broadly clear once more on partner change to be safe
            markAllMessageNotificationsAsReadAction();
        }
    }, [selectedPartner]);

    useEffect(() => {
        if (!selectedPartner) return;
        const channelName = `chat-${selectedPartner.id}`;
        const channel = pusherClient.subscribe(channelName);

        channel.bind("new-message", (message: ChatItem) => {
            // If we receive a message for the current connection, clear notifications
            markNotificationsAsReadByLinkAction(selectedPartner.id);

            setItems((prev) => {
                if (message.clientId) {
                    const existingIndex = prev.findIndex(m => m.clientId === message.clientId);
                    if (existingIndex !== -1) {
                        const newItems = [...prev];
                        newItems[existingIndex] = { ...message, status: "sent" };
                        return newItems;
                    }
                }
                if (prev.some((m) => m.id === message.id)) return prev;
                return [...prev, message];
            });
        });

        channel.bind("quote-status-update", ({ quoteId, status }: { quoteId: string, status: string }) => {
            setItems((prev) => prev.map(item =>
                item.id === quoteId ? { ...item, status } : item
            ));
        });

        return () => {
            channel.unbind_all();
            channel.unsubscribe();
        };
    }, [selectedPartner]);

    useEffect(() => {
        if (scrollRef.current) {
            const scrollContainer = scrollRef.current;
            scrollContainer.scrollTop = scrollContainer.scrollHeight;
            const scrollTimeout = setTimeout(() => {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }, 100);
            return () => clearTimeout(scrollTimeout);
        }
    }, [items, isLoading]);

    const loadConversation = async (connectionId: string) => {
        setIsLoading(true);
        const history = await getConversationAction(connectionId);
        setItems(history as ChatItem[]);
        setIsLoading(false);
        // Mark notifications for this connection as read
        markNotificationsAsReadByLinkAction(connectionId);
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        const content = newMessage.trim();
        if (!content || !selectedPartner || isSending) return;

        const clientId = crypto.randomUUID();
        const optimisticMsg: ChatItem = {
            id: clientId,
            clientId: clientId,
            type: "MESSAGE",
            content: content,
            senderUserId: currentUserId,
            createdAt: new Date(),
            status: "sending"
        };

        setItems(prev => [...prev, optimisticMsg]);
        setNewMessage("");
        setIsSending(true);
        const result = await sendMessageAction({
            connectionId: selectedPartner.id,
            content: content,
            clientId: clientId
        });

        if (result.error) {
            setItems(prev => prev.map(m => m.clientId === clientId ? { ...m, status: "error" as const } : m));
        }
        setIsSending(false);
    };

    if (partners.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 border border-border border-dashed rounded-xl bg-slate-50/50">
                <MessageSquare className="w-12 h-12 mb-4 text-slate-200" />
                <p className="text-[14px] font-semibold text-slate-900">Aucun message pour le moment</p>
                <p className="text-[12px] text-slate-500 mt-1">Connectez-vous avec des partenaires pour commencer à discuter.</p>
            </div>
        );
    }

    return (
        <div className="flex h-full bg-white rounded-xl shadow-sm border border-border overflow-hidden">
            {/* Sidebar */}
            <div className="w-[300px] border-r border-border flex flex-col bg-white">
                {/* Header */}
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                    <div>
                        <h3 className="text-[13px] font-semibold text-foreground tracking-tight">Messages</h3>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{partners.length} conversation{partners.length > 1 ? "s" : ""}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg">
                        <Search className="size-3.5" />
                    </Button>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto py-2">
                    {partners.map((partner) => {
                        const isSelected = selectedPartner?.id === partner.id;
                        return (
                            <div
                                key={partner.id}
                                onClick={() => setSelectedPartner(partner)}
                                className={cn(
                                    "mx-2 px-3 py-3 rounded-xl cursor-pointer transition-all flex items-center gap-3",
                                    isSelected
                                        ? "bg-muted"
                                        : "hover:bg-muted/50"
                                )}
                            >
                                {/* Avatar */}
                                <div className="relative shrink-0">
                                    <Avatar className="size-10 rounded-xl border border-border">
                                        <AvatarImage src={partner.avatarUrl || ""} />
                                        <AvatarFallback className="bg-muted text-foreground text-[11px] font-semibold rounded-xl">
                                            {partner.name.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="absolute -right-0.5 -bottom-0.5 size-2.5 bg-emerald-500 rounded-full border-2 border-white" />
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline gap-2 mb-0.5">
                                        <span className={cn(
                                            "text-[13px] font-semibold truncate",
                                            isSelected ? "text-foreground" : "text-foreground"
                                        )}>
                                            {partner.name}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground shrink-0">12:45</span>
                                    </div>
                                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest truncate">
                                        {partner.industry || "Partenaire"}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>


            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-white overflow-hidden">
                {selectedPartner ? (
                    <>
                        {/* Top Bar */}
                        <div className="h-[64px] border-b px-6 flex items-center justify-between bg-white z-20">
                            <div className="flex items-center gap-4">
                                <Avatar className="size-9 rounded-lg shadow-sm border border-border">
                                    <AvatarImage src={selectedPartner.avatarUrl || ""} />
                                    <AvatarFallback className="text-[10px] font-bold bg-slate-50 text-slate-900">{selectedPartner.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h4 className="font-bold text-[14px] text-slate-900 tracking-tight leading-none mb-1">{selectedPartner.name}</h4>
                                    <div className="flex items-center gap-2">
                                        <span className="size-1.5 bg-green-500 rounded-full" />
                                        <span className="text-[10px] font-medium text-green-600 uppercase tracking-widest">En ligne</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 rounded-lg"><MoreHorizontal className="size-4" /></Button>
                            </div>
                        </div>

                        {/* Messages Flow */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto bg-slate-50/10 custom-scrollbar">
                            <div className="p-8 space-y-8 min-h-full">
                                {isLoading ? (
                                    <ConversationSkeleton />
                                ) : items.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center text-center py-20 opacity-30">
                                        <MessageSquare className="size-12 mb-4" />
                                        <p className="text-[11px] font-bold uppercase tracking-widest">Démarrez la discussion</p>
                                    </div>
                                ) : (
                                    items.map((item, i) => {
                                        const isMe = item.senderUserId === currentUserId;
                                        const nextIsMe = items[i + 1]?.senderUserId === item.senderUserId;

                                        if (item.type === "QUOTE") {
                                            return (
                                                <div key={item.id} className={cn("flex flex-col", isMe ? "items-end" : "items-start")}>
                                                    <QuoteMessage quote={item} currentUserId={currentUserId} />
                                                </div>
                                            );
                                        }

                                        if (item.type === "PRODUCT_INQUIRY") {
                                            return (
                                                <div key={item.id} className={cn("flex flex-col", isMe ? "items-end" : "items-start")}>
                                                    <ProductInquiryCard metadata={item.metadata} isMe={isMe} />
                                                    <div className={cn("mt-1.5 flex items-center gap-1.5", isMe ? "justify-end" : "justify-start")}>
                                                        <span className="text-[9px] font-bold text-slate-400 uppercase">{format(new Date(item.createdAt), "HH:mm")}</span>
                                                    </div>
                                                </div>
                                            );
                                        }

                                        return (
                                            <div key={item.id} className={cn("flex flex-col max-w-[75%]", isMe ? "ml-auto items-end" : "items-start")}>
                                                <div className={cn(
                                                    "px-4 py-3 text-[13.5px] font-medium leading-relaxed shadow-sm relative",
                                                    isMe
                                                        ? "bg-slate-900 text-white rounded-2xl rounded-tr-none"
                                                        : "bg-white border border-border text-slate-700 rounded-2xl rounded-tl-none",
                                                    item.status === "sending" && "opacity-50"
                                                )}>
                                                    {item.content}
                                                    {isMe && (
                                                        <div className="absolute right-0 top-full mt-1.5 flex items-center gap-1.5">
                                                            <span className="text-[9px] font-bold text-slate-400 uppercase">{format(new Date(item.createdAt), "HH:mm")}</span>
                                                            {item.status === "sending" ? <Loader2 className="size-2.5 animate-spin text-slate-300" /> : <CheckCheck className="size-2.5 text-slate-400" />}
                                                        </div>
                                                    )}
                                                    {!isMe && (
                                                        <div className="absolute left-0 top-full mt-1.5">
                                                            <span className="text-[9px] font-bold text-slate-400 uppercase">{format(new Date(item.createdAt), "HH:mm")}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* Input Footer */}
                        <div className="p-4 border-t bg-white">
                            <form onSubmit={handleSend} className="max-w-4xl mx-auto flex items-center gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setIsQuoteFormOpen(true)}
                                    className="size-11 bg-slate-50 text-slate-400 shrink-0"
                                >
                                    <FilePlus className="size-5" />
                                </Button>

                                <div className="relative flex-1 group">
                                    <Input
                                        placeholder="Taper un message..."
                                        className="h-11 bg-slate-50 border-border rounded-xl px-4 text-[13px] font-semibold focus-visible:ring-slate-900/5 focus-visible:bg-white transition-all pr-12"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        disabled={isSending}
                                    />
                                    <Button
                                        type="submit"
                                        size="icon"
                                        className="absolute right-1.5 top-1.5 size-8"
                                        disabled={!newMessage.trim() || isSending}
                                    >
                                        {isSending ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center opacity-30">
                        <User className="size-16 mb-4" />
                        <p className="text-[12px] font-bold uppercase tracking-widest text-slate-900">Sélectionnez une discussion</p>
                    </div>
                )}
            </div>

            {selectedPartner && (
                <QuoteForm
                    connectionId={selectedPartner.id}
                    isOpen={isQuoteFormOpen}
                    onClose={() => setIsQuoteFormOpen(false)}
                    onSuccess={(quote) => {
                        setItems(prev => prev.some(m => m.id === quote.id) ? prev : [...prev, { ...quote, type: "QUOTE" } as ChatItem]);
                    }}
                />
            )}
        </div>
    );
}
