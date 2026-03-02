import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function ChatListSkeleton() {
    return (
        <div className="flex-1 overflow-y-auto py-2">
            {[...Array(8)].map((_, i) => (
                <div key={i} className="mx-2 px-3 py-3 flex items-center gap-3 rounded-xl">
                    <Skeleton className="size-10 rounded-xl shrink-0 opacity-80" />
                    <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex justify-between items-baseline">
                            <Skeleton className="h-3.5 w-24 opacity-80" />
                            <Skeleton className="h-2.5 w-8 opacity-60" />
                        </div>
                        <Skeleton className="h-2.5 w-32 opacity-60" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function ConversationSkeleton() {
    return (
        <div className="p-8 space-y-10 min-h-full">
            {[...Array(5)].map((_, i) => {
                const isLeft = i % 2 === 0;
                return (
                    <div key={i} className={cn("flex flex-col max-w-[75%]", !isLeft ? "ml-auto items-end" : "items-start")}>
                        <div className="flex items-end gap-3 w-full">
                            {!isLeft && <div className="flex-1" />}
                            <Skeleton className={cn(
                                "h-14 w-full max-w-[280px]",
                                isLeft ? "rounded-2xl rounded-tl-none" : "rounded-2xl rounded-tr-none"
                            )} />
                        </div>
                        <div className={cn("mt-2.5 flex items-center gap-1.5", !isLeft ? "justify-end" : "justify-start")}>
                            <Skeleton className="h-2 w-10 opacity-40" />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
