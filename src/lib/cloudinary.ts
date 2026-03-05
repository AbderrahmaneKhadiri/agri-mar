"use client";

/**
 * Uploads a file to Cloudinary using the configured cloud name and upload preset.
 * @param file The file to upload.
 * @returns A promise that resolves to the secure URL of the uploaded image.
 */
export async function uploadToCloudinary(file: File): Promise<string> {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dthwalyfh";
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "agrimar";

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

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || "Erreur lors de l'envoi à Cloudinary");
        }

        const data = await response.json();
        return data.secure_url;
    } catch (error) {
        console.error("Cloudinary upload error:", error);
        throw error;
    }
}
