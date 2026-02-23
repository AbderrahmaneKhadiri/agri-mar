import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { companyRepository } from "@/persistence/repositories/company.repository";
import { getAcceptedPartners } from "@/data-access/connections.dal";
import { ChatInterface } from "@/components/dashboard/chat/chat-interface";

export default async function MessagesPage() {
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
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Messagerie</h1>
                <p className="text-slate-500 mt-2">Communiquez avec vos fournisseurs et partenaires agricoles.</p>
            </div>

            <ChatInterface
                partners={partners}
                currentUserId={session.user.id}
            />
        </div>
    );
}
