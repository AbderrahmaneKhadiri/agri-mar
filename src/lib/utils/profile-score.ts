
export function calculateFarmerScore(profile: any): number {
    let score = 0;

    // Identity (18%)
    if (profile.fullName) score += 3;
    if (profile.farmName) score += 3;
    if (profile.phone) score += 3;
    if (profile.businessEmail && !profile.businessEmail.includes("agrimar.ma")) score += 3;
    if (profile.city) score += 3;
    if (profile.region) score += 3;

    // Capacity (12%)
    if (profile.totalAreaHectares && Number(profile.totalAreaHectares) > 0) score += 3;
    if (profile.irrigationType) score += 3;
    if (profile.hasColdStorage) score += 3;
    if (profile.deliveryCapacity) score += 3;

    // Business Model (10%)
    if (profile.businessModel && profile.businessModel.length > 0) score += 10;

    // B2B Verification (60%)
    if (profile.iceNumber && profile.iceNumber.length >= 15) score += 30;
    if (profile.onssaCert) score += 30;

    return Math.min(score, 100);
}

export function calculateCompanyScore(profile: any): number {
    let score = 0;

    // Identity (18%)
    if (profile.companyName) score += 3;
    if (profile.industry) score += 3;
    if (profile.city) score += 3;
    if (profile.establishedYear) score += 3;
    if (profile.phone) score += 3;
    if (profile.businessEmail) score += 3;

    // Sourcing (12%)
    if (profile.purchasingCapacity && profile.purchasingCapacity !== "Non spécifiée") score += 6;
    if (profile.partnershipType && profile.partnershipType !== "Non spécifié") score += 6;

    // B2B Verification (70%)
    if (profile.iceNumber && profile.iceNumber.length >= 15) score += 35;
    if (profile.rcNumber) score += 35;

    return Math.min(score, 100);
}
