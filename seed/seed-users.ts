import { execSync } from 'child_process';

const DB_NAME = 'charnipos-v2-db';
const isRemote = process.argv.includes('--remote');
const wranglerFlag = isRemote ? '--remote' : '--local';
const envLabel = isRemote ? 'remote' : 'local';

type Provider = 'phone' | 'apple' | 'google' | 'facebook';

interface SeedUser {
    displayName: string;
    email: string | null;
    phone?: string;
    avatarUrl?: string;
    isVerified: boolean;
    provider: Provider;
    providerSubjectId: string;
    password?: string; // only for email provider
}

const users: SeedUser[] = [
    {
        displayName: 'Nut Lee',
        email: 'nut.lee@example.com',
        phone: '+66812345678',
        isVerified: true,
        provider: 'phone',
        providerSubjectId: '+66812345678',
    },
    {
        displayName: 'Vi Lee',
        email: 'vi.lee@gmail.com',
        isVerified: true,
        provider: 'google',
        providerSubjectId: 'google-sub-1001',
    },
    {
        displayName: 'Aya Lee',
        email: 'aya.lee@facebook.com',
        isVerified: true,
        provider: 'facebook',
        providerSubjectId: 'facebook-id-2002',
    },
    {
        displayName: 'Amo Lee',
        email: 'amo.lee@privaterelay.appleid.com',
        isVerified: true,
        provider: 'apple',
        providerSubjectId: 'apple-sub-3003',
    },
];

function sqlString(value: string): string {
    return value.replace(/'/g, "''");
}

function parseWranglerJson(output: string): unknown {
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

function d1Execute(command: string): unknown {
    const cmd = `npx wrangler d1 execute ${DB_NAME} ${wranglerFlag} --command="${command}" --json`;
    return parseWranglerJson(execSync(cmd, { encoding: 'utf-8' }));
}

function findIdentity(provider: Provider, subjectId: string) {
    const result = d1Execute(
       `SELECT id, user_id FROM user_auth_identity WHERE provider = '${provider}' AND provider_subject_id = '${sqlString(subjectId)}'`, 
    ) as { results?: {id: number, user_id: number}[] }[];
       
    const rows = Array.isArray(result) ? result[0]?.results ?? [] : (result as { results?: { id: number, user_id: number}[] }).results ?? [];
    return rows[0] ?? null;
}

function resolveDisplayName(seed: SeedUser): string {
    if (seed.displayName.trim()) return seed.displayName.trim();
    if (seed.email) return seed.email.split('@')[0];
    return 'User';
}

async function seedOne(seed: SeedUser) {
    const displayName = resolveDisplayName(seed);
    const existing = await findIdentity(seed.provider, seed.providerSubjectId);
    
    if (existing) {
        console.log(`   -> ${seed.provider} identity exists (user_id=${existing.user_id}), skipping`);
        return;
    }
    
    const emailSql = seed.email ? `'${sqlString(seed.email)}'` : 'NULL';
    const phoneSql = seed.phone ? `'${sqlString(seed.phone)}'` : 'NULL';
    const avatarSql = seed.avatarUrl ? `'${sqlString(seed.avatarUrl)}'` : 'NULL';
    const verified = seed.isVerified ? '1' : '0';
    
    // 1) Create shop_user
    d1Execute(`INSERT INTO shop_user (display_name, email, phone, avatar_url, is_verified) VALUES ('${sqlString(displayName)}', ${emailSql}, ${phoneSql}, ${avatarSql}, ${verified})`);
    
    // 2) Get new user id
    const userResult = d1Execute(
        seed.email
            ? `SELECT id FROM shop_user WHERE email = '${sqlString(seed.email)}'`   
            : `SELECT id FROM shop_user WHERE display_name = '${sqlString(displayName)}' ORDER BY id DESC LIMIT 1`,
    ) as { results?: { id: number }[] }[];
            
    const userRows = Array.isArray(userResult) ? userResult[0]?.results ?? [] : (userResult as { results?: { id: number }[] }).results ?? [];
    const userId = userRows[0]?.id;
    
    if (!userId) throw new Error(`Failed to resolve user id for ${seed.provider}`);
    
    // 3) Create auth identity
    d1Execute(`INSERT INTO user_auth_identity (provider, provider_subject_id, user_id) VALUES ('${seed.provider}', '${sqlString(seed.providerSubjectId)}', ${userId})`);
    
    console.log(`   -> Seeded ${seed.provider} user (user_id=${userId})`);
}

async function run() {
    console.log(`Seeding users in ${envLabel} D1 (${DB_NAME})...`);
    
    for (const seed of users) {
        await seedOne(seed);
    }
    
    console.log('User seeding completed.');
}

run().catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
});