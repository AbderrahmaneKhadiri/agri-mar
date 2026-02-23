import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { farmerRepository } from "@/persistence/repositories/farmer.repository";
import { companyRepository } from "@/persistence/repositories/company.repository";
import { FarmerSettingsForm } from "./farmer-settings-form";
import { CompanySettingsForm } from "./company-settings-form";

export default async function SettingsPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) return null;

    if (session.user.role === "FARMER") {
        const profile = await farmerRepository.findByUserId(session.user.id);
        if (!profile) return <div>Profil non trouvé</div>;

        const photos = await farmerRepository.getPhotos(profile.id);

        return <FarmerSettingsForm profile={profile} initialPhotos={photos} />;
    } else {
        const profile = await companyRepository.findByUserId(session.user.id);
        if (!profile) return <div>Profil non trouvé</div>;
        return <CompanySettingsForm profile={profile} />;
    }
}
