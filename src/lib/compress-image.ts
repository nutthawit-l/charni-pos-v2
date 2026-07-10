const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const MAX_DIMENSION = 1920;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

function loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const image = new Image();
        image.onload = () => {
            URL.revokeObjectURL(url);
            resolve(image);
        };
        image.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Failed to load image'));
        };
        image.src = url;
    });
}

function scaledDimensions(
    width: number,
    height: number,
    maxDimension: number,
): { width: number; height: number } {
    const longest = Math.max(width, height);
    if (longest <= maxDimension) {
        return { width, height };
    }
    const scale = maxDimension / longest;
    return {
        width: Math.round(width * scale),
        height: Math.round(height * scale),
    };
}

async function canvasToBlob(
    canvas: HTMLCanvasElement,
    type: string,
    quality: number,
): Promise<Blob> {
    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (!blob) {
                    reject(new Error('Failed to compress image'));
                    return;
                }
                resolve(blob);
            },
            type,
            quality,
        );
    });
}

async function compressToTargetSize(
    canvas: HTMLCanvasElement,
    maxBytes: number,
): Promise<Blob> {
    let quality = 0.85;
    let blob = await canvasToBlob(canvas, 'image/jpeg', quality);

    while (blob.size > maxBytes && quality > 0.4) {
        quality -= 0.1;
        blob = await canvasToBlob(canvas, 'image/jpeg', quality);
    }

    return blob;
}

export async function prepareImageForUpload(file: File): Promise<File> {
    if (!ALLOWED_TYPES.has(file.type)) {
        return file;
    }

    const needsCompression = file.size > MAX_UPLOAD_BYTES;
    const image = await loadImage(file);
    const needsResize = Math.max(image.naturalWidth, image.naturalHeight) > MAX_DIMENSION;

    if (!needsCompression && !needsResize) {
        return file;
    }

    const { width, height } = scaledDimensions(
        image.naturalWidth,
        image.naturalHeight,
        MAX_DIMENSION,
    );

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        throw new Error('Failed to prepare image');
    }

    ctx.drawImage(image, 0, 0, width, height);

    const blob = await compressToTargetSize(canvas, MAX_UPLOAD_BYTES - 64 * 1024);
    const baseName = file.name.replace(/\.[^.]+$/, '') || 'product-image';

    return new File([blob], `${baseName}.jpg`, {
        type: 'image/jpeg',
        lastModified: Date.now(),
    });
}
