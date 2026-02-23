import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { companyRepository } from "@/persistence/repositories/company.repository";
import { getAcceptedPartners } from "@/data-access/connections.dal";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Calendar, MessageSquare, Phone, Tractor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default async function SuppliersPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) return null;

    const profile = await companyRepository.findByUserId(session.user.id);
    if (!profile) return <div>Profil non trouvé</div>;

    const partners = await getAcceptedPartners(profile.id, "COMPANY");

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Mes Fournisseurs</h1>
                <p className="text-slate-500 mt-2">Gérez votre réseau de producteurs partenaires.</p>
            </div>

            {partners.length === 0 ? (
                <div className="h-96 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed rounded-3xl bg-white/50">
                    <Tractor className="w-12 h-12 mb-4 opacity-20" />
                    <p className="font-medium">Vous n'avez pas encore de fournisseurs partenaires.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {partners.map((partner) => (
                        <Card key={partner.id} className="border-none shadow-sm hover:shadow-md transition-all bg-white group overflow-hidden">
                            <CardContent className="p-0">
                                <div className="h-2 bg-green-600 w-full" />
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <Avatar className="h-16 w-16 border-2 border-slate-50 shadow-sm">
                                            <AvatarImage src={partner.avatarUrl || ""} alt={partner.name} />
                                            <AvatarFallback className="bg-green-50 text-green-700 font-bold text-xl">
                                                {partner.name.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="bg-green-50 text-green-600 p-2 rounded-xl">
                                            <Tractor className="h-5 w-5" />
                                        </div>
                                    </div>

                                    <h4 className="text-lg font-bold text-slate-900 group-hover:text-green-600 transition-colors">{partner.name}</h4>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Producteur Agricole</p>

                                    <div className="space-y-3 mt-6">
                                        <div className="flex items-center text-sm text-slate-500">
                                            <MapPin className="h-4 w-4 mr-2 text-slate-400" />
                                            {partner.location}
                                        </div>
                                        <div className="flex items-center text-sm text-slate-500">
                                            <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                                            Partenaire depuis {format(new Date(partner.since), "MMM yyyy", { locale: fr })}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mt-8">
                                        <Button variant="outline" className="rounded-xl border-slate-100 hover:bg-slate-50 h-10">
                                            <MessageSquare className="h-4 w-4 mr-2" />
                                            Message
                                        </Button>
                                        <Button variant="outline" className="rounded-xl border-slate-100 hover:bg-slate-50 h-10">
                                            <Phone className="h-4 w-4 mr-2" />
                                            Appeler
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
