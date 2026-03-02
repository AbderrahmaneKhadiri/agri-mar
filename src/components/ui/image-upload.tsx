"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ImagePlus, X, Loader2 } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ImageUploadProps {
    value: string[]; // URLs of the uploaded images
    onChange: (urls: string[]) => void;
    onRemove: (url: string) => void;
    maxFiles?: number;
    className?: string;
    hidePreview?: boolean;
}

export function ImageUpload({ value, onChange, onRemove, maxFiles = 1, className, hidePreview = false }: ImageUploadProps) {
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const file = e.dataTransfer.files?.[0];
        if (!file || !file.type.startsWith("image/")) return;

        // Reuse the same upload logic but with the dropped file
        await uploadFile(file);
    };

    const uploadFile = async (file: File) => {
        setIsLoading(true);

        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "agrimar";
        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "agrimar";

        console.log("Starting upload to Cloudinary...", { cloudName, uploadPreset });

        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", uploadPreset);

        try {
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                {
                    method: "POST",
                    body: formData,
                }
            );

            const data = await response.json();
            console.log("Cloudinary response:", data);

            if (response.ok && data.secure_url) {
                const newValues = maxFiles === 1 ? [data.secure_url] : [...value, data.secure_url];
                onChange(newValues);
                toast.success("Image uploadée avec succès");
            } else {
                const errorMessage = data.error?.message || "Erreur lors de l'envoi";
                toast.error(`Erreur: ${errorMessage}`);
                console.error("Upload failed:", data);
            }
        } catch (error) {
            console.error("Cloudinary upload error:", error);
            toast.error("Erreur réseau lors de l'envoi de l'image");
        } finally {
            setIsLoading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const onFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        await uploadFile(file);
    };

    return (
        <div className={cn("space-y-4", className)}>
            {!hidePreview && (
                <div className="flex flex-wrap gap-4">
                    {value.map((url) => (
                        <div key={url} className="relative size-24 md:size-32 rounded-lg overflow-hidden border border-border bg-muted">
                            <div className="z-10 absolute top-1 right-1">
                                <Button
                                    type="button"
                                    onClick={() => onRemove(url)}
                                    variant="destructive"
                                    size="icon"
                                    className="h-6 w-6 rounded-full shadow-sm"
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </div>
                            <Image
                                fill
                                className="object-cover"
                                alt="Uploaded Image"
                                src={url}
                            />
                        </div>
                    ))}
                </div>
            )}

            <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={onFileSelect}
                disabled={isLoading}
            />

            {(value.length < maxFiles || maxFiles === 1) && (
                <Button
                    type="button"
                    variant="outline"
                    disabled={isLoading}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onDrop={handleDrop}
                    className="border-dashed border-2 hover:bg-muted/50 h-24 md:h-32 w-full max-w-[200px] flex flex-col gap-2 transition-all"
                >
                    {isLoading ? (
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    ) : (
                        <ImagePlus className="h-6 w-6 text-muted-foreground" />
                    )}
                    <span className="text-xs font-medium text-muted-foreground">
                        {isLoading ? "Envoi..." : (
                            value.length > 0 && maxFiles === 1
                                ? "Changer l'image"
                                : (maxFiles === 1 ? "Ajouter une image" : "Ajouter des images")
                        )}
                    </span>
                </Button>
            )}
        </div>
    );
}
