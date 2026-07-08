import { execSync } from 'node:child_process';

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
