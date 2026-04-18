// src/utils/generate-image-name.ts
import path from "path";
import crypto from "crypto";

export const slugifyFileName = (value: string): string => {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "") // remove special chars
        .replace(/\s+/g, "-") // spaces to hyphen
        .replace(/-+/g, "-") // collapse multiple hyphens
        .replace(/^-+|-+$/g, ""); // trim hyphens
};

export const generateImageFileName = (
    originalName: string,
    prefix = "image",
): string => {
    const ext = path.extname(originalName).toLowerCase();
    const baseName = path.basename(originalName, ext);

    const safeBaseName = slugifyFileName(baseName).slice(0, 60) || "file";
    const safePrefix = slugifyFileName(prefix) || "image";

    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;

    return `${safePrefix}-${safeBaseName}-${uniqueSuffix}${ext}`;
};