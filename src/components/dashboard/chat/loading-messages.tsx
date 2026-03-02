import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingMessages() {
    return (
        <div className="h-[calc(100vh-6rem)] bg-white rounded-xl shadow-sm border border-border overflow-hidden flex">
            {/* Sidebar Skeleton */}
            <div className="w-[300px] border-r border-border flex flex-col bg-white">
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="size-8 rounded-lg" />
                </div>
                <div className="flex-1 overflow-y-auto py-2 space-y-4 px-2">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="px-3 py-3 flex items-center gap-3">
                            <Skeleton className="size-10 rounded-xl shrink-0" />
                            <div className="flex-1 min-w-0 space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-3 w-32" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Area Skeleton */}
            <div className="flex-1 flex flex-col bg-white">
                <div className="h-[64px] border-b px-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Skeleton className="size-9 rounded-lg" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-2 w-16" />
                        </div>
                    </div>
                    <Skeleton className="size-8 rounded-lg" />
                </div>
                <div className="flex-1 p-8 space-y-8">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className={`flex flex-col max-w-[70%] ${i % 2 === 1 ? 'ml-auto items-end' : 'items-start'}`}>
                            <Skeleton className={`h-16 w-full ${i % 2 === 1 ? 'rounded-2xl rounded-tr-none' : 'rounded-2xl rounded-tl-none'}`} />
                        </div>
                    ))}
                </div>
                <div className="p-4 border-t">
                    <div className="flex gap-3">
                        <Skeleton className="size-11 rounded-xl" />
                        <Skeleton className="h-11 flex-1 rounded-xl" />
                    </div>
                </div>
            </div>
        </div>
    );
}
