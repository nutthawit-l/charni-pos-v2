const UTC_OFFSET_HOURS: Record<string, number> = {
    Thailand: 7,
    Singapore: 8,
};

export function formatEventDatetime(startAt: string, country: string): string {
    const offset = UTC_OFFSET_HOURS[country] ?? 0;
    const date = new Date(startAt);
    const localMs = date.getTime() + offset * 60 * 60 * 1000;
    const local = new Date(localMs);

    const weekday = local.toLocaleDateString('en-GB', { weekday: 'short', timeZone: 'UTC' });
    const day = local.getUTCDate();
    const month = local.toLocaleDateString('en-GB', { month: 'short', timeZone: 'UTC' });
    const hours = String(local.getUTCHours()).padStart(2, '0');
    const minutes = String(local.getUTCMinutes()).padStart(2, '0');

    return `${weekday} ${day} ${month}, ${hours}:${minutes} UTC+${offset}`;
}
