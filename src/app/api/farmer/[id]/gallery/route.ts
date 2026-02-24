import { NextResponse } from 'next/server';
import { getFarmerPhotos, getFarmerReviews, getFarmerAverageRating } from '@/data-access/farmers.dal';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id: farmerId } = await params;
    // photos by farmer profile id (assuming profile id equals farmerId)
    const photos = await getFarmerPhotos(farmerId);
    const reviews = await getFarmerReviews(farmerId);
    const avg = await getFarmerAverageRating(farmerId);
    return NextResponse.json({ photos, reviews, averageRating: avg.average, reviewCount: avg.count });
}
