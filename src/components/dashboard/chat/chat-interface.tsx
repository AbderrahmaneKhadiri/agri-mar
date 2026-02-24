"use client";

import { useState, useEffect, useRef } from "react";
import { PartnerDTO } from "@/data-access/connections.dal";
import { sendMessageAction, getConversationAction } from "@/actions/messaging.actions";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, MapPin, Building2, User, Loader2, FilePlus, Search, MoreHorizontal, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { pusherClient } from "@/lib/pusher-client";
import { QuoteForm } from "./quote-form";
import { QuoteMessage } from "./quote-message";

interface ChatItem {
    id: string;
    type: "MESSAGE" | "QUOTE";
    content?: string;
    senderUserId: string;
    createdAt: Date;
    sender?: {
        id: string;
        name: string;
        image: string | null;
        role: string;
    };
    // Quote specific fields
    productName?: string;
    quantity?: string;
    unitPrice?: string;
    totalAmount?: string;
    currency?: string;
    status?: string;
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

    // Fetch conversation history when partner changes
    useEffect(() => {
        if (selectedPartner) {
            loadConversation(selectedPartner.id);
        }
    }, [selectedPartner]);

    // Pusher Subscription for Real-time Messaging
    useEffect(() => {
        if (!selectedPartner) return;

        const channelName = `chat-${selectedPartner.id}`;
        const channel = pusherClient.subscribe(channelName);

        channel.bind("new-message", (message: ChatItem) => {
            setItems((prev) => {
                // Avoid duplicates (local append by sender vs pusher event)
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

    // Scroll to bottom when messages update
    useEffect(() => {
        if (scrollRef.current) {
            const scrollContainer = scrollRef.current;
            // Scroll direct au bas
            scrollContainer.scrollTop = scrollContainer.scrollHeight;

            // Et un petit ajustement au cas où les images/composants chargent
            const scrollTimeout = setTimeout(() => {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }, 50);
            return () => clearTimeout(scrollTimeout);
        }
    }, [items, isLoading]);

    const loadConversation = async (connectionId: string) => {
        setIsLoading(true);
        const history = await getConversationAction(connectionId);
        setItems(history as ChatItem[]);
        setIsLoading(false);
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedPartner || isSending) return;

        setIsSending(true);
        const result = await sendMessageAction({
            connectionId: selectedPartner.id,
            content: newMessage,
        });

        if (result.success && result.data) {
            const sentMsg = { ...(result.data as any), type: "MESSAGE" };
            setItems(prev => [...prev, sentMsg as ChatItem]);
            setNewMessage("");
        } else if (result.error) {
            alert(result.error);
        }
        setIsSending(false);
    };

    if (partners.length === 0) {
        return (
            <div className="h-[600px] flex flex-col items-center justify-center text-slate-400 border-2 border-dashed rounded-3xl bg-white/50">
                <Building2 className="w-12 h-12 mb-4 opacity-20" />
                <p className="font-medium text-center px-4">
                    Vous n'avez pas encore de partenaires pour discuter.<br />
                    Connectez-vous avec des entreprises sur le marché pour commencer.
                </p>
            </div>
        );
    }

    return (
        <div className="flex h-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
            {/* SIDEBAR: PARTNERS LIST */}
            <div className="w-80 border-r border-slate-100 flex flex-col bg-white">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-xl text-slate-900 tracking-tight">Messages</h3>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                        <Search className="h-4 w-4" />
                    </Button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {partners.map((partner) => (
                        <div
                            key={partner.id}
                            onClick={() => setSelectedPartner(partner)}
                            className={cn(
                                "p-4 rounded-2xl cursor-pointer transition-all flex items-center gap-4 group",
                                selectedPartner?.id === partner.id
                                    ? "bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100"
                                    : "hover:bg-white hover:border-slate-100 border border-transparent text-slate-600"
                            )}
                        >
                            <Avatar className="h-12 w-12 border-2 border-white shrink-0 shadow-sm">
                                <AvatarImage src={partner.avatarUrl || ""} />
                                <AvatarFallback className={cn(
                                    selectedPartner?.id === partner.id ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"
                                )}>
                                    {partner.name.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-[13px] truncate capitalize">{partner.name.toLowerCase()}</h4>
                                <p className={cn(
                                    "text-[10px] font-bold truncate mt-0.5 uppercase tracking-wider",
                                    selectedPartner?.id === partner.id ? "text-emerald-600/70" : "text-slate-400"
                                )}>
                                    {partner.industry || "PARTENAIRE"}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* MAIN CHAT AREA */}
            <div className="flex-1 grid grid-rows-[auto_1fr_auto] bg-white min-h-0 overflow-hidden">
                {selectedPartner ? (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white z-10">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10 border border-slate-100">
                                    <AvatarImage src={selectedPartner.avatarUrl || ""} />
                                    <AvatarFallback className="bg-emerald-50 text-emerald-700 font-bold">
                                        {selectedPartner.name.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h4 className="font-bold text-slate-900 text-sm tracking-tight capitalize">{selectedPartner.name.toLowerCase()}</h4>
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                        En ligne
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-300">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto bg-white"
                        >
                            <div className="min-h-full flex flex-col p-4 space-y-6">

                                {isLoading ? (
                                    <div className="flex items-center justify-center py-20">
                                        <Loader2 className="h-8 w-8 text-slate-200 animate-spin" />
                                    </div>
                                ) : items.length === 0 ? (
                                    <div className="flex-1 flex flex-col items-center justify-center text-slate-300 py-20">
                                        <MessageSquare className="h-12 w-12 mb-3 opacity-10" />
                                        <p className="text-[10px] font-bold uppercase tracking-[2px]">Début de la conversation</p>
                                    </div>
                                ) : (
                                    items.map((item, i) => {
                                        const isMe = item.senderUserId === currentUserId;

                                        // Show avatar logic: only if first message or sender changed
                                        const showAvatar = i === 0 || items[i - 1].senderUserId !== item.senderUserId;

                                        if (item.type === "QUOTE") {
                                            return (
                                                <div
                                                    key={item.id}
                                                    className={cn(
                                                        "flex flex-col w-full px-4",
                                                        isMe ? "items-end" : "items-start"
                                                    )}
                                                >
                                                    <QuoteMessage quote={item} currentUserId={currentUserId} />
                                                </div>
                                            );
                                        }

                                        return (
                                            <div
                                                key={item.id}
                                                className={cn(
                                                    "flex items-end gap-3 max-w-[85%] group",
                                                    isMe ? "ml-auto flex-row-reverse" : "flex-row"
                                                )}
                                            >
                                                {/* Messenger Avatar */}
                                                <div className="w-8 shrink-0">
                                                    {showAvatar && (
                                                        <Avatar className="h-8 w-8 border border-slate-100 shadow-sm">
                                                            <AvatarImage src={isMe ? "" : selectedPartner.avatarUrl || ""} />
                                                            <AvatarFallback className={cn(
                                                                "text-[10px] font-bold",
                                                                isMe ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"
                                                            )}>
                                                                {isMe ? "ME" : selectedPartner.name.charAt(0)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    )}
                                                </div>

                                                <div className={cn(
                                                    "flex flex-col gap-1.5",
                                                    isMe ? "items-end" : "items-start"
                                                )}>
                                                    <div className={cn(
                                                        "px-5 py-3 rounded-2xl text-[13px] font-medium transition-all relative shadow-sm",
                                                        isMe
                                                            ? "bg-emerald-600 text-white rounded-br-none"
                                                            : "bg-[#F3F4F6] text-slate-700 rounded-bl-none border border-slate-100"
                                                    )}>
                                                        {item.content}
                                                    </div>
                                                    <span className="text-[9px] font-bold text-slate-400 px-1 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {format(new Date(item.createdAt), "HH:mm")}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* Input Area - RentCar Style */}
                        <div className="p-4 border-t border-slate-100 bg-white z-10 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)]">
                            <form
                                onSubmit={handleSend}
                                className="flex items-center gap-3"
                            >
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setIsQuoteFormOpen(true)}
                                    className="h-11 w-11 rounded-xl border-slate-100 bg-slate-50 text-slate-400 hover:text-emerald-600 hover:border-emerald-100 hover:bg-emerald-50 shrink-0 transition-all group"
                                    title="Proposer un devis"
                                >
                                    <FilePlus className="h-5 w-5 group-hover:scale-110 transition-transform" />
                                </Button>

                                <div className="relative flex-1">
                                    <Input
                                        placeholder="Écrivez votre message..."
                                        className="w-full bg-slate-50 border-none h-12 pl-5 pr-12 rounded-xl focus-visible:ring-emerald-500/10 focus-visible:bg-white transition-all text-[13px] font-medium shadow-inner"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        disabled={isSending}
                                    />
                                    <Button
                                        type="submit"
                                        size="icon"
                                        className="absolute right-1.5 top-1.5 h-9 w-9 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-md shadow-emerald-500/10"
                                        disabled={!newMessage.trim() || isSending}
                                    >
                                        {isSending ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Send className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
                        <User className="h-12 w-12 mb-3 opacity-10" />
                        <p className="text-xs font-bold uppercase tracking-[2px]">Sélectionnez un partenaire pour discuter</p>
                    </div>
                )}
            </div>

            {selectedPartner && (
                <QuoteForm
                    connectionId={selectedPartner.id}
                    isOpen={isQuoteFormOpen}
                    onClose={() => setIsQuoteFormOpen(false)}
                    onSuccess={(newQuote: any) => {
                        setItems(prev => [...prev, { ...newQuote, type: "QUOTE" } as ChatItem]);
                    }}
                />
            )}
        </div>
    );
}


