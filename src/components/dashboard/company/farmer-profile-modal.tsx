"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { FarmerProfileContent } from "./farmer-profile-content";
import { Button } from "@/components/ui/button";

export interface FarmerProfileData {
    id: string;
    name: string;
    avatarUrl?: string | null;
    location?: string;
    farmName?: string;
    phone?: string;
    email?: string;
    totalArea?: string;
    cropTypes?: string[];
    livestock?: string;
    certifications?: string[];
    farmingMethods?: string[];
    seasonality?: string[];
    exportCapacity?: boolean;
    logistics?: boolean;
    iceNumber?: string | null;
    onssaCert?: string | null;
    irrigationType?: string[] | string | null;
    hasColdStorage?: boolean;
    deliveryCapacity?: boolean;
    businessModel?: string[] | null;
    longTermContractAvailable?: boolean;
    production?: string;
    since?: Date;
    sentAt?: Date;
}

interface FarmerProfileModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    data: FarmerProfileData | null;
}

export function FarmerProfileModal({ isOpen, onOpenChange, data }: FarmerProfileModalProps) {
    if (!data) return null;

    const displayName = data.name || "Agriculteur";
    const displayLocation = data.location || "Localisation non renseignée";

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl rounded-2xl p-0 overflow-hidden border border-border shadow-2xl">
                <div className="flex flex-col">
                    <div className="h-24 bg-slate-50 w-full relative border-b border-border">
                        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_top_right,var(--slate-200)_1px,transparent_1px)] [background-size:20px_20px]" />
                    </div>
                    <div className="px-8 pb-8 -mt-8 relative">
                        <FarmerProfileContent data={data} />
                        <div className="mt-10 pt-6 border-t flex justify-end">
                            <Button onClick={() => onOpenChange(false)} className="h-10 px-8 font-semibold rounded-xl">
                                Fermer
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
