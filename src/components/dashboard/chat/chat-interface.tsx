"use client";

import { useState, useEffect, useRef } from "react";
import { PartnerDTO } from "@/data-access/connections.dal";
import { sendMessageAction, getConversationAction } from "@/actions/messaging.actions";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, MapPin, Building2, User, Loader2, FilePlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
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

    // Scroll to bottom when messages update
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [items]);

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
        <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white min-h-[600px] flex">
            {/* SIDEBAR: PARTNERS LIST */}
            <div className="w-72 border-r border-slate-100 flex flex-col bg-slate-50/30">
                <div className="p-4 border-b border-slate-100 bg-white text-center">
                    <h3 className="font-black text-slate-400 text-[10px] tracking-[2px] uppercase">Discussions</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {partners.map((partner) => (
                        <div
                            key={partner.id}
                            onClick={() => setSelectedPartner(partner)}
                            className={cn(
                                "p-4 rounded-2xl cursor-pointer transition-all flex items-center gap-4 group",
                                selectedPartner?.id === partner.id
                                    ? "bg-slate-900 text-white shadow-lg"
                                    : "hover:bg-white hover:shadow-sm text-slate-600"
                            )}
                        >
                            <Avatar className="h-12 w-12 border-2 border-white/10 shrink-0">
                                <AvatarImage src={partner.avatarUrl || ""} />
                                <AvatarFallback className={cn(
                                    selectedPartner?.id === partner.id ? "bg-slate-800 text-slate-200" : "bg-blue-50 text-blue-700"
                                )}>
                                    {partner.name.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-sm truncate uppercase tracking-tight">{partner.name}</h4>
                                <p className={cn(
                                    "text-[10px] font-bold truncate mt-0.5",
                                    selectedPartner?.id === partner.id ? "text-slate-400" : "text-blue-500"
                                )}>
                                    {partner.industry || "PARTENAIRE"}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* MAIN CHAT AREA */}
            <div className="flex-1 flex flex-col bg-white">
                {selectedPartner ? (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b border-slate-50 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={selectedPartner.avatarUrl || ""} />
                                    <AvatarFallback className="bg-blue-50 text-blue-700 font-bold">
                                        {selectedPartner.name.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h4 className="font-black text-slate-900 text-sm tracking-tight">{selectedPartner.name.toUpperCase()}</h4>
                                    <div className="flex items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider gap-3">
                                        <span className="flex items-center">
                                            <MapPin className="h-3 w-3 mr-1" /> {selectedPartner.location}
                                        </span>
                                        <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                        <span>EN LIGNE</span>
                                    </div>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsQuoteFormOpen(true)}
                                className="rounded-xl border-slate-200 text-[10px] font-black uppercase tracking-widest gap-2 bg-slate-50 hover:bg-slate-100 transition-all hidden sm:flex"
                            >
                                <FilePlus className="h-3.5 w-3.5" />
                                Proposer un devis
                            </Button>
                        </div>

                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/20"
                        >
                            {isLoading ? (
                                <div className="h-full flex items-center justify-center">
                                    <Loader2 className="h-8 w-8 text-slate-200 animate-spin" />
                                </div>
                            ) : items.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-300">
                                    <MessageSquareIcon className="h-12 w-12 mb-3 opacity-10" />
                                    <p className="text-xs font-bold uppercase tracking-[2px]">Début de la conversation</p>
                                </div>
                            ) : (
                                items.map((item, i) => {
                                    const isMe = item.senderUserId === currentUserId;

                                    if (item.type === "QUOTE") {
                                        return (
                                            <div
                                                key={item.id}
                                                className={cn(
                                                    "flex flex-col w-full",
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
                                                "flex flex-col max-w-[80%]",
                                                isMe ? "ml-auto items-end" : "items-start"
                                            )}
                                        >
                                            <div className={cn(
                                                "px-5 py-3.5 rounded-[2rem] text-sm font-medium shadow-sm",
                                                isMe
                                                    ? "bg-slate-900 text-white rounded-tr-none"
                                                    : "bg-white border border-slate-100 text-slate-700 rounded-tl-none"
                                            )}>
                                                {item.content}
                                            </div>
                                            <span className="text-[9px] font-bold text-slate-400 mt-2 px-2 uppercase tracking-tighter">
                                                {format(new Date(item.createdAt), "HH:mm")}
                                            </span>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-slate-50">
                            <form
                                onSubmit={handleSend}
                                className="relative flex items-center gap-3"
                            >
                                <Input
                                    placeholder="Écrivez votre message professionnel..."
                                    className="flex-1 bg-slate-50 border-none h-14 pl-6 pr-16 rounded-2xl focus-visible:ring-slate-900/10 focus-visible:bg-white transition-all text-sm font-medium"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    disabled={isSending}
                                />
                                <Button
                                    type="submit"
                                    size="icon"
                                    className="absolute right-2 h-10 w-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-all active:scale-95 shadow-lg shadow-slate-900/10"
                                    disabled={!newMessage.trim() || isSending}
                                >
                                    {isSending ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Send className="h-4 w-4" />
                                    )}
                                </Button>
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
                    onSuccess={() => loadConversation(selectedPartner.id)}
                />
            )}
        </Card>
    );
}

// Simple Icon Fallback if lucide doesn't export MessageSquare here
function MessageSquareIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
    );
}
