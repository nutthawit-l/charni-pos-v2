import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const DB_NAME = 'charnipos-v2-db';
export const isRemote = process.argv.includes('--remote');
export const wranglerFlag = isRemote ? '--remote' : '--local';
export const envLabel = isRemote ? 'remote' : 'local';

export function sqlString(value: string): string {
    return value.replace(/'/g, "''");
}

export function parseWranglerJson(output: string): unknown {
    const startIndex = output.indexOf('[');
    const startObject = output.indexOf('{');
    const index =
        startIndex !== -1 && startObject !== -1
            ? Math.min(startIndex, startObject)
            : startIndex !== -1
                ? startIndex
                : startObject;

    if (index === -1) throw new Error(`No JSON found in wrangler output: ${output}`);
    return JSON.parse(output.slice(index).trim());
}

export function d1Execute(command: string): unknown {
    const cmd = `npx wrangler d1 execute ${DB_NAME} ${wranglerFlag} --command="${command}" --json`;
    return parseWranglerJson(execSync(cmd, { encoding: 'utf-8' }));
}

export function d1Rows<T>(result: unknown): T[] {
    if (Array.isArray(result)) return (result[0] as { results?: T[] })?.results ?? [];
    return (result as { results?: T[] }).results ?? [];
}

export const COUNTRY_UTC_OFFSET_HOURS = {
    Thailand: 7,
    Singapore: 8,
} as const;

export type EventCountry = keyof typeof COUNTRY_UTC_OFFSET_HOURS;

export function utcOffsetHours(country: EventCountry): number {
    return COUNTRY_UTC_OFFSET_HOURS[country];
}

export function localToUtcIso(
    localDate: string,
    localTime: string,
    country: EventCountry,
): string {
    const [y, m, d] = localDate.split('-').map(Number);
    const [hh, mm] = localTime.split(':').map(Number);
    const utcMs = Date.UTC(y, m - 1, d, hh - utcOffsetHours(country), mm, 0);
    return new Date(utcMs).toISOString().replace(/\.\d{3}Z$/, 'Z');
}

export interface ProductSeedRow {
    originalUrl: string;
    name: string;
    category: string;
    thb: number;
    sgd: number | null;
    filename: string;
}

const PRODUCTS_CSV = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    'products.csv',
);

export function parseProductsCsv(limit = 15): ProductSeedRow[] {
    const content = fs.readFileSync(PRODUCTS_CSV, 'utf-8');
    const lines = content.split('\n').map((l) => l.trim()).filter((l) => l !== '');
    const rows: ProductSeedRow[] = [];
    const max = Math.min(lines.length, limit + 1);

    for (let i = 1; i < max; i++) {
        const cols = lines[i].split(',');
        if (cols.length < 4) continue;

        const originalUrl = cols[0].trim();
        const name = cols[1].trim();
        const category = cols[2].trim();
        const thb = parseFloat(cols[3].trim()) || 0;
        const sgd = cols[4]?.trim() ? parseFloat(cols[4].trim()) : null;

        const rawFilename = originalUrl.split('/').pop() ?? `image-${i}.jpg`;
        const ext = path.extname(rawFilename) || '.jpg';
        const filename = `seed-${path.basename(rawFilename, ext)}${ext}`;

        rows.push({ originalUrl, name, category, thb, sgd, filename });
    }

    return rows;
}

export function readWranglerToml(): string {
    return fs.readFileSync(path.resolve(process.cwd(), 'wrangler.toml'), 'utf-8');
}

export function readTomlVar(toml: string, key: string): string | null {
    const match = toml.match(new RegExp(`${key}\\s*=\\s*"([^"]*)"`));
    return match?.[1] ?? null;
}

export function normalizePublicUrl(url: string): string {
    const trimmed = url.replace(/\/$/, '');
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/')) {
        return trimmed;
    }
    return `https://${trimmed}`;
}
