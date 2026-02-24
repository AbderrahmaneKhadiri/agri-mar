"use client";

import { useState } from "react";
import { IncomingRequestDTO } from "@/data-access/connections.dal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, X, Building2, Calendar } from "lucide-react";
import { respondConnectionAction } from "@/actions/networking.actions";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export function FarmerRequestsClient({ initialRequests }: { initialRequests: IncomingRequestDTO[] }) {
    const [requests, setRequests] = useState<IncomingRequestDTO[]>(initialRequests);
    const [isProcessing, setIsProcessing] = useState<string | null>(null);

    const handleAction = async (connectionId: string, status: "ACCEPTED" | "REJECTED") => {
        setIsProcessing(connectionId);
        const result = await respondConnectionAction({ connectionId, response: status });

        if (result.error) {
            alert(result.error);
        } else {
            // Remove from list on success
            setRequests(prev => prev.filter(r => r.id !== connectionId));
        }
        setIsProcessing(null);
    };

    if (requests.length === 0) {
        return (
            <Card className="h-64 flex border border-slate-200 rounded-2xl bg-white shadow-sm mt-6">
                <CardContent className="flex flex-col items-center justify-center flex-1 p-0">
                    <Building2 className="w-10 h-10 mb-4 opacity-20" />
                    <p className="font-bold uppercase tracking-widest text-[10px] text-slate-400">Aucune demande de partenariat en attente.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="grid gap-4">
            {requests.map((request) => (
                <Card key={request.id} className="border border-slate-200 shadow-sm hover:shadow-md transition-all bg-white rounded-2xl">
                    <CardContent className="p-6 md:p-8">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-6">
                                <Avatar className="h-16 w-16 border border-slate-100 rounded-2xl">
                                    <AvatarImage src={request.senderLogo || ""} alt={request.senderName} />
                                    <AvatarFallback className="bg-slate-50 flex items-center justify-center text-2xl font-black text-slate-300 rounded-2xl">
                                        {request.senderName?.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h4 className="text-xl font-black text-slate-900 tracking-tight">{request.senderName}</h4>
                                    <div className="flex items-center gap-3 mt-2">
                                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-[1.5px]">
                                            {request.senderIndustry || "Secteur d'activité non défini"}
                                        </span>
                                        <span className="w-1 h-1 rounded-full bg-slate-200" />
                                        <span className="flex items-center text-[9px] text-slate-400 font-bold uppercase tracking-[1px]">
                                            <Calendar className="h-3 w-3 mr-1" />
                                            {format(new Date(request.sentAt), "d MMM yyyy", { locale: fr })}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 flex-wrap md:flex-nowrap w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t border-slate-50 md:border-none">
                                <Button
                                    variant="outline"
                                    className="flex-1 md:flex-none flex items-center justify-center border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700 h-12 px-6 rounded-xl text-[10px] font-black uppercase tracking-[1.5px] transition-colors"
                                    onClick={() => handleAction(request.id, "REJECTED")}
                                    disabled={!!isProcessing}
                                >
                                    <X className="h-4 w-4 mr-2" />
                                    Refuser
                                </Button>
                                <Button
                                    className="flex-1 md:flex-none flex items-center justify-center bg-emerald-600 hover:bg-emerald-500 text-white h-12 px-8 rounded-xl text-[10px] font-black uppercase tracking-[1.5px] shadow-sm transition-all border-none"
                                    onClick={() => handleAction(request.id, "ACCEPTED")}
                                    disabled={!!isProcessing}
                                >
                                    {isProcessing === request.id ? (
                                        "Validation..."
                                    ) : (
                                        <>
                                            <Check className="h-4 w-4 mr-2" />
                                            Autoriser l'accès
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
