import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { farmerRepository } from "@/persistence/repositories/farmer.repository";
import { getAcceptedPartners } from "@/data-access/connections.dal";
import { ChatInterface } from "@/components/dashboard/chat/chat-interface";

export default async function MessagesPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) return null;

    const profile = await farmerRepository.findByUserId(session.user.id);
    if (!profile) return <div>Profil non trouvé</div>;

    const partners = await getAcceptedPartners(profile.id, "FARMER");

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Messagerie</h1>
                <p className="text-slate-500 mt-2">Communiquez avec vos partenaires commerciaux en toute sécurité.</p>
            </div>

            <ChatInterface
                partners={partners}
                currentUserId={session.user.id}
            />
        </div>
    );
}
