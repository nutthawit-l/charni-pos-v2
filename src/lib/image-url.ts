export function normalizeImageUrl(url: string): string {
    const trimmed = url.trim();
    if (!trimmed) return trimmed;
    if (
        trimmed.startsWith('http://')
        || trimmed.startsWith('https://')
        || trimmed.startsWith('/')
        || trimmed.startsWith('data:')
    ) {
        return trimmed;
    }
    return `https://${trimmed}`;
}
