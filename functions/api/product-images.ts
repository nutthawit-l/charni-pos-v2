import type { PagesFunction } from "@cloudflare/workers-types";
import type { ApiContextData, ApiEnv } from "./_middleware";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
};

interface UploadFile {
    size: number;
    type: string;
    stream(): ReadableStream<Uint8Array>;
}

function isUploadFile(entry: unknown): entry is UploadFile {
    return typeof entry === "object"
        && entry !== null
        && "size" in entry
        && "type" in entry
        && "stream" in entry;
}

function jsonResponse(body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
    });
}

function normalizePublicUrl(url: string): string {
    const trimmed = url.replace(/\/$/, "");
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("/")) {
        return trimmed;
    }
    return `https://${trimmed}`;
}

function buildImageUrl(env: ApiEnv, key: string, requestUrl: string): string {
    const publicUrl = env.R2_PUBLIC_URL;
    if (publicUrl) {
        return `${normalizePublicUrl(publicUrl)}/${key}`;
    }
    const origin = new URL(requestUrl).origin;
    return `${origin}/api/images/${key}`;
}

export const onRequestPost: PagesFunction<ApiEnv, never, ApiContextData> = async (context) => {
    try {
        const formData = await context.request.formData();
        const entry = formData.get("file");

        if (!isUploadFile(entry)) {
            return jsonResponse({ error: "File is required" }, 400);
        }

        const file = entry;

        if (file.size > MAX_FILE_SIZE) {
            return jsonResponse({ error: "File exceeds 5MB size limit" }, 400);
        }

        const ext = ALLOWED_TYPES[file.type];
        if (!ext) {
            return jsonResponse({ error: "Unsupported file type. Use JPEG, PNG, or WebP" }, 400);
        }

        const key = `products/${crypto.randomUUID()}.${ext}`;
        await context.env.IMAGES_BUCKET.put(key, file.stream(), {
            httpMetadata: { contentType: file.type },
        });

        const imageUrl = buildImageUrl(context.env, key, context.request.url);
        return jsonResponse({ imageUrl }, 201);
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return jsonResponse({ error: message }, 500);
    }
};
