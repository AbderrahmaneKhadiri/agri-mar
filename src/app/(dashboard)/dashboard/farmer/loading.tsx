import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown } from "lucide-react";

export default function FarmerDashboardLoading() {
    return (
        <main className="flex flex-1 flex-col gap-4 p-4 lg:p-6 lg:gap-6">
            {/* Minimalist Top Indicator Skeleton */}
            <div className="flex items-center justify-between pb-4 border-b border-border/60 pl-2">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-200" />
                    <Skeleton className="h-3 w-48 bg-neutral-100" />
                </div>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-3 w-24 bg-neutral-100" />
                    <Skeleton className="h-4 w-28 rounded bg-neutral-100" />
                </div>
            </div>

            {/* Contextual Breadcrumb Skeleton */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-16 bg-neutral-100" />
                        <ChevronDown className="size-3 text-neutral-300" />
                        <Skeleton className="h-4 w-32 bg-neutral-100" />
                    </div>
                </div>
            </div>

            {/* Hero Banner Skeleton - MATCHING DARK GREEN THEME */}
            <div className="rounded-[2rem] bg-[#2c5f42]/10 px-8 py-8 md:py-10 flex flex-col md:flex-row md:items-center gap-6 relative overflow-hidden border border-[#2c5f42]/5">
                <div className="flex-1 space-y-3">
                    <Skeleton className="h-3 w-32 bg-[#2c5f42]/20 shadow-none border-none" />
                    <Skeleton className="h-8 w-64 bg-[#2c5f42]/20 shadow-none border-none" />
                    <Skeleton className="h-4 w-full max-w-xl bg-[#2c5f42]/20 shadow-none border-none" />
                </div>
                <div className="flex gap-6 shrink-0 md:border-l md:border-emerald-900/10 md:pl-8">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="text-center space-y-2">
                            <Skeleton className="h-7 w-12 bg-[#2c5f42]/20 shadow-none border-none" />
                            <Skeleton className="h-3 w-16 bg-[#2c5f42]/20 shadow-none border-none" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Stats Row Skeleton - Monochromatic & Subtle Emerald */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={`rounded-xl border border-border p-5 flex flex-col gap-3 shadow-sm ${i === 2 ? 'bg-[#f0f8f4] border-[#c4dece]' : 'bg-white'}`}>
                        <div className="flex items-center justify-between">
                            <Skeleton className={`h-3 w-20 ${i === 2 ? 'bg-emerald-200/50' : 'bg-neutral-100'}`} />
                            <Skeleton className={`size-3.5 rounded-full ${i === 2 ? 'bg-emerald-300/50' : 'bg-neutral-100'}`} />
                        </div>
                        <Skeleton className={`h-8 w-12 ${i === 2 ? 'bg-emerald-300/50' : 'bg-neutral-100'}`} />
                        <Skeleton className={`h-3 w-24 ${i === 2 ? 'bg-emerald-200/50' : 'bg-neutral-100'}`} />
                    </div>
                ))}
            </div>

            {/* Chart + Partners Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2 bg-white rounded-xl border border-border p-6 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-32 bg-neutral-100" />
                            <Skeleton className="h-3 w-48 bg-neutral-100" />
                        </div>
                        <Skeleton className="h-6 w-32 rounded-full bg-emerald-50 border border-emerald-100" />
                    </div>
                    <Skeleton className="h-[180px] w-full bg-neutral-50 rounded-lg" />
                </div>

                <div className="bg-white rounded-xl border border-border shadow-sm flex flex-col overflow-hidden">
                    <div className="px-5 py-4 bg-[#f8fdf9] border-b border-[#e0ede5] flex items-center justify-between">
                        <Skeleton className="h-4 w-24 bg-emerald-800/20" />
                        <Skeleton className="h-5 w-12 rounded-full bg-emerald-100/50" />
                    </div>
                    <div className="p-5 space-y-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex items-center gap-3">
                                <Skeleton className="size-8 rounded-lg bg-neutral-100" />
                                <div className="flex-1 space-y-1.5">
                                    <Skeleton className="h-3 w-24 bg-neutral-100" />
                                    <Skeleton className="h-2 w-16 bg-neutral-50" />
                                </div>
                                <div className="size-1.5 rounded-full bg-emerald-400 opacity-20" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Section - Parcel Management UI matching */}
            <div className="flex flex-col gap-4">
                <div className="bg-white border border-border rounded-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-5 w-46 bg-neutral-100" />
                        <div className="flex gap-2">
                            <Skeleton className="h-8 w-8 rounded-lg bg-neutral-100" />
                            <Skeleton className="h-8 w-24 rounded-lg bg-neutral-100" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="border border-neutral-100 p-4 rounded-xl space-y-3">
                                <Skeleton className="h-32 w-full rounded-lg bg-neutral-50" />
                                <Skeleton className="h-4 w-24 bg-neutral-100" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Data Access Indicator Skeleton */}
                <div className="bg-neutral-50 border border-neutral-100 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Skeleton className="size-10 rounded-xl bg-emerald-100/50" />
                        <div className="space-y-2">
                            <Skeleton className="h-3 w-40 bg-neutral-200" />
                            <Skeleton className="h-3 w-64 bg-neutral-100" />
                        </div>
                    </div>
                    <Skeleton className="h-9 w-40 rounded-xl bg-white border border-neutral-200" />
                </div>
            </div>
        </main>
    );
}
