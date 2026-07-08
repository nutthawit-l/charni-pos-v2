import { d1Execute, d1Rows, envLabel, sqlString } from './helpers';

const SHOP_NAME = 'Fly away to somewhere';
const DEV_SESSION_EXPIRES = '2099-12-31T23:59:59Z';

type ShopRole = 'owner' | 'employee';

const SHOP_MEMBERS: { email: string; role: ShopRole, sessionId: string }[] = [
    { email: 'nut.lee@example.com', role: 'owner', sessionId: 'dev-session-00000001' },
    { email: 'vi.lee@gmail.com', role: 'employee', sessionId: 'dev-session-00000002' },
    { email: 'aya.lee@facebook.com', role: 'employee', sessionId: 'dev-session-00000003' },
    { email: 'amo.lee@privaterelay.appleid.com', role: 'employee', sessionId: 'dev-session-00000004' },
];

function upsertSession(userId: number, sessionId: string, email: string) {
    d1Execute(`INSERT OR REPLACE INTO session (id, user_id, expires_at) VALUES ('${sqlString(sessionId)}', ${userId}, '${sqlString(DEV_SESSION_EXPIRES)}')`);
    console.log(`   -> Upserted session ${sessionId} for ${email}`);
}

function findShopMember(shopId: number, userId: number) {
    const result = d1Execute(
        `SELECT id FROM shop_member WHERE shop_id = ${shopId} AND user_id = ${userId}`,
    );
    return d1Rows<{ id: number }>(result)[0]?.id ?? null;
}

function findUserByEmail(email: string): number | null {
    const result = d1Execute(
        `SELECT id FROM shop_user WHERE email = '${sqlString(email)}'`,
    );
    return d1Rows<{ id: number }>(result)[0]?.id ?? null;
}

function bindMember(shopId: number, email: string, role: ShopRole) {
    const userId = findUserByEmail(email);
    if (!userId) throw new Error(`User ${email} not found. Run "make seed-users" first.`);
    
    const existing = findShopMember(shopId, userId);
    if (existing) {
        console.log(`   -> ${email} is already bound to shop ${SHOP_NAME}, skipping`);
        return userId;
    }
    
    d1Execute(`INSERT INTO shop_member (shop_id, user_id, role) VALUES (${shopId}, ${userId}, '${role}')`);
    console.log(`   -> Bound ${email} to shop ${SHOP_NAME} as ${role}`);
    return userId;
}

function findShopByName(name: string): number | null {
    const result = d1Execute(
       `SELECT id FROM shop WHERE name = '${sqlString(name)}'`,
    );
    return d1Rows<{ id: number }>(result)[0]?.id ?? null;
}

async function run() {
    console.log(`Seeding shop and session in ${envLabel} D1...`);
    
    let shop = findShopByName(SHOP_NAME);
    if (!shop) {
        d1Execute(`INSERT INTO shop (name) VALUES ('${sqlString(SHOP_NAME)}')`);
        shop = findShopByName(SHOP_NAME);
        if (!shop) throw new Error(`Failed to create shop ${SHOP_NAME}`);
        console.log(`   -> Created shop ${SHOP_NAME} (shop_id=${shop})`);
    } else {
        console.log(`   -> Shop ${SHOP_NAME} already exists (shop_id=${shop}), skipping`);
    }
    
    const shopId = shop;
    
    for (const member of SHOP_MEMBERS) {
        const userId = bindMember(shopId, member.email, member.role);
        upsertSession(userId, member.sessionId, member.email);
    }
    
    console.log('Shop seeding completed.');
    console.log('Dev sessions ready:');
    for (const member of SHOP_MEMBERS) {
        console.log(`   ${member.email} -> session_token=${member.sessionId}`);
    }
}

run().catch(error => {
    console.error('Shop seeding failed:', error);
    process.exit(1);
});