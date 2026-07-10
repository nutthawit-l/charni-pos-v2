const THAI_MOBILE_E164 = /^\+66[689]\d{8}$/;

export function normalizePhone(input: string): string | null {
    const stripped = input.replace(/[\s\-()]/g, '');
    if (!stripped) return null;

    let normalized: string;
    if (stripped.startsWith('+')) {
        normalized = stripped;
    } else if (stripped.startsWith('0')) {
        normalized = `+66${stripped.slice(1)}`;
    } else if (stripped.startsWith('66')) {
        normalized = `+${stripped}`;
    } else {
        return null;
    }

    if (!THAI_MOBILE_E164.test(normalized)) return null;
    return normalized;
}
