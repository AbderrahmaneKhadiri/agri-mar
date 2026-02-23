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
            <div className="h-96 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed rounded-3xl bg-white/50">
                <Building2 className="w-12 h-12 mb-4 opacity-20" />
                <p className="font-medium">Aucune demande de partenariat en attente.</p>
            </div>
        );
    }

    return (
        <div className="grid gap-4">
            {requests.map((request) => (
                <Card key={request.id} className="border-none shadow-sm hover:shadow-md transition-all overflow-hidden bg-white">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16 border-2 border-slate-100">
                                    <AvatarImage src={request.senderLogo || ""} alt={request.senderName} />
                                    <AvatarFallback className="bg-blue-100 text-blue-700 font-bold text-xl">
                                        {request.senderName.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h4 className="text-lg font-bold text-slate-900">{request.senderName}</h4>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded-full">
                                            {request.senderIndustry || "Entreprise"}
                                        </span>
                                        <span className="flex items-center text-xs text-slate-400 font-medium">
                                            <Calendar className="h-3 w-3 mr-1" />
                                            Reçue le {format(new Date(request.sentAt), "d MMMM yyyy", { locale: fr })}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Button
                                    variant="outline"
                                    className="flex-1 md:flex-none border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700 h-11 px-6 rounded-xl font-bold transition-colors"
                                    onClick={() => handleAction(request.id, "REJECTED")}
                                    disabled={!!isProcessing}
                                >
                                    <X className="h-4 w-4 mr-2" />
                                    Refuser
                                </Button>
                                <Button
                                    className="flex-1 md:flex-none bg-green-600 hover:bg-green-500 text-white h-11 px-8 rounded-xl font-bold shadow-lg shadow-green-900/10 transition-all border-none"
                                    onClick={() => handleAction(request.id, "ACCEPTED")}
                                    disabled={!!isProcessing}
                                >
                                    {isProcessing === request.id ? (
                                        "Validation..."
                                    ) : (
                                        <>
                                            <Check className="h-4 w-4 mr-2" />
                                            Accepter
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
