"use client";

import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Send,
    Sparkles,
    Bot,
    User,
    Loader2,
    RefreshCcw,
    AlertCircle,
    Info,
    ArrowRight,
    Mic,
    Square
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";

interface Message {
    role: "user" | "assistant";
    content: string;
}

export function AIAdvisorChat() {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            content: "Bonjour ! Je suis votre conseiller AgriMar IA. Je suis connecté à vos parcelles et aux données AgroMonitoring. Comment puis-je vous aider aujourd'hui ?"
        }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                handleSend(undefined, blob);
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("Impossible d'accéder au micro. Veuillez vérifier vos réglages.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            setIsRecording(false);
        }
    };

    const handleSend = async (e?: React.FormEvent, audioToSend?: Blob) => {
        e?.preventDefault();
        if (!input.trim() && !audioToSend && !isLoading) return;

        const userMessage = input.trim();
        setInput("");

        // If it's a text message
        if (userMessage && !audioToSend) {
            setMessages(prev => [...prev, { role: "user", content: userMessage }]);
        } else if (audioToSend) {
            setMessages(prev => [...prev, { role: "user", content: "🎤 [Message vocal...]" }]);
        }

        setIsLoading(true);

        try {
            let body: any = {
                messages: [...messages, { role: "user", content: userMessage || "Message vocal" }]
            };

            if (audioToSend) {
                // Convert blob to base64
                const reader = new FileReader();
                const base64Promise = new Promise<string>((resolve) => {
                    reader.onloadend = () => {
                        const base64String = (reader.result as string).split(',')[1];
                        resolve(base64String);
                    };
                });
                reader.readAsDataURL(audioToSend);
                const base64Audio = await base64Promise;
                body.audio = base64Audio;
            }

            const response = await fetch("/api/chat/advisor", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || errorData.details || "Erreur API");
            }

            const data = await response.json();
            setMessages(prev => [...prev, { role: "assistant", content: data.content }]);
        } catch (error: any) {
            console.error("Chat Error:", error);
            setMessages(prev => [...prev, {
                role: "assistant",
                content: `Erreur : ${error.message}. Veuillez vérifier votre clé API ou redémarrer le serveur.`
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const suggestions = [
        "Comment va ma terre aujourd'hui ?",
        "Conseils pour l'irrigation",
        "Analyse du NDVI de mes parcelles",
        "Prévisions météo pour ma ferme"
    ];

    return (
        <div className="flex flex-col h-full bg-slate-50/50 rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            {/* Header */}
            <div className="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2c5f42] to-[#4a8c5c] flex items-center justify-center text-white shadow-md shadow-[#2c5f42]/20">
                        <Sparkles className="size-5" />
                    </div>
                    <div>
                        <h2 className="text-[14px] font-bold text-slate-900 tracking-tight">Conseiller AgriMar IA</h2>
                        <div className="flex items-center gap-1.5">
                            <span className="size-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Connecté à vos terres</span>
                        </div>
                    </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400" onClick={() => setMessages([messages[0]])}>
                    <RefreshCcw className="size-4" />
                </Button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                <AnimatePresence initial={false}>
                    {messages.map((m, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className={cn(
                                "flex gap-4 max-w-[85%]",
                                m.role === "user" ? "ml-auto flex-row-reverse" : ""
                            )}
                        >
                            <Avatar className={cn(
                                "size-9 rounded-xl border shadow-sm shrink-0",
                                m.role === "assistant" ? "bg-[#2c5f42] border-[#2c5f42]/10" : "bg-white border-slate-200"
                            )}>
                                {m.role === "assistant" ? (
                                    <div className="flex items-center justify-center w-full h-full text-white">
                                        <Bot className="size-5" />
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center w-full h-full text-slate-600">
                                        <User className="size-5" />
                                    </div>
                                )}
                            </Avatar>
                            <div className={cn(
                                "p-4 rounded-2xl text-[13.5px] leading-relaxed shadow-sm",
                                m.role === "assistant"
                                    ? "bg-white border border-slate-100 text-slate-700 rounded-tl-none"
                                    : "bg-[#2c5f42] text-white rounded-tr-none"
                            )}>
                                {m.content.split('\n').map((line, idx) => {
                                    // Basic Markdown Rendering
                                    let content = line;

                                    // Headers
                                    if (content.startsWith('### ')) {
                                        return <h3 key={idx} className="text-sm font-bold mt-3 mb-1 text-slate-900">{content.replace('### ', '')}</h3>;
                                    }
                                    if (content.startsWith('## ')) {
                                        return <h2 key={idx} className="text-base font-bold mt-4 mb-2 text-slate-900">{content.replace('## ', '')}</h2>;
                                    }

                                    // List items
                                    if (content.trim().startsWith('* ') || content.trim().startsWith('- ')) {
                                        const text = content.trim().substring(2);
                                        return (
                                            <div key={idx} className="flex gap-2 ml-2 mt-1">
                                                <span className="text-[#2c5f42]">•</span>
                                                <span dangerouslySetInnerHTML={{
                                                    __html: text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                                }} />
                                            </div>
                                        );
                                    }

                                    // Bold text only
                                    const formattedLine = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

                                    return (
                                        <p
                                            key={idx}
                                            className={idx > 0 ? "mt-2" : ""}
                                            dangerouslySetInnerHTML={{ __html: formattedLine }}
                                        />
                                    );
                                })}
                            </div>
                        </motion.div>
                    ))}
                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex gap-4 max-w-[85%]"
                        >
                            <Avatar className="size-9 rounded-xl bg-[#2c5f42] border border-[#2c5f42]/10 shadow-sm shrink-0">
                                <div className="flex items-center justify-center w-full h-full text-white">
                                    <Loader2 className="size-5 animate-spin" />
                                </div>
                            </Avatar>
                            <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                                <span className="size-1.5 bg-slate-300 rounded-full animate-bounce" />
                                <span className="size-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                                <span className="size-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]" />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Input Overlay for suggestions */}
            {messages.length === 1 && (
                <div className="px-6 py-2 flex flex-wrap gap-2">
                    {suggestions.map((s, i) => (
                        <button
                            key={i}
                            onClick={() => setInput(s)}
                            className="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-[11px] font-semibold text-slate-600 hover:border-[#2c5f42] hover:text-[#2c5f42] transition-all flex items-center gap-1.5"
                        >
                            {s} <ArrowRight className="size-3" />
                        </button>
                    ))}
                </div>
            )}

            {/* Footer */}
            <div className="p-4 bg-white border-t border-slate-200">
                <form onSubmit={handleSend} className="relative flex items-center gap-2 max-w-4xl mx-auto">
                    <div className="relative flex-1 group">
                        <Input
                            placeholder="Posez une question sur vos cultures..."
                            className="h-12 bg-slate-50 border-slate-200 rounded-xl px-5 py-4 text-[13px] font-medium focus-visible:ring-[#2c5f42]/10 focus-visible:bg-white transition-all pr-14"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={isLoading}
                        />
                        <div className="absolute right-1.5 top-1.5 flex items-center gap-1.5">
                            <Button
                                type="button"
                                size="icon"
                                onClick={isRecording ? stopRecording : startRecording}
                                className={cn(
                                    "size-9 rounded-lg transition-all",
                                    isRecording
                                        ? "bg-red-500 text-white animate-pulse"
                                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                )}
                                disabled={isLoading}
                            >
                                {isRecording ? <Square className="size-4" /> : <Mic className="size-4" />}
                            </Button>
                            <Button
                                type="submit"
                                size="icon"
                                disabled={!input.trim() || isLoading || isRecording}
                                className={cn(
                                    "size-9 rounded-lg transition-all",
                                    input.trim() && !isLoading ? "bg-[#2c5f42] text-white shadow-lg shadow-[#2c5f42]/20" : "bg-slate-100 text-slate-400"
                                )}
                            >
                                <Send className="size-4" />
                            </Button>
                        </div>
                    </div>
                </form>
                <p className="text-center text-[10px] text-slate-400 mt-3 flex items-center justify-center gap-1.5">
                    <Info className="size-3" /> Basé sur les relevés AgroMonitoring et votre profil d'exploitation.
                </p>
            </div>
        </div>
    );
}
