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
        <div className="h-[calc(100vh-6rem)]">
            <ChatInterface
                partners={partners}
                currentUserId={session.user.id}
            />
        </div>
    );
}
