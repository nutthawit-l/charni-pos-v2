import {
    d1Execute,
    d1Rows,
    envLabel,
    localToUtcIso,
    sqlString,
} from './helpers';

const SHOP_NAME = 'Fly away to somewhere';

type EventMemberRole = 'creator' | 'collaborator' | 'assistant';

const EVENT_MEMBERS: { email: string; role: EventMemberRole }[] = [
    { email: 'nut.lee@example.com', role: 'creator' },
    { email: 'vi.lee@gmail.com', role: 'collaborator' },
    { email: 'aya.lee@facebook.com', role: 'assistant' },
    { email: 'amo.lee@privaterelay.appleid.com', role: 'assistant' },
];

const EVENT = {
    name: 'Creators Super Fest Singapore 2026 (CSFSG26)',
    country: 'Singapore' as const,
    /* Date and time in Singapore time zone (UTC+8) */
    startDate: '2026-07-11',
    startTime: '10:00',
    endDate: '2026-07-12',
    endTime: '19:00',
    boothCost: 11_118, // 436 SGD × 25.5 THB
    travelCost: 20_000,
    hotelCost: 10_000,
    foodCost: 2_000,
};

function findShopByName(name: string): number | null {
    const result = d1Execute(
        `SELECT id FROM shop WHERE name = '${sqlString(name)}'`,
    );
    return d1Rows<{ id: number }>(result)[0]?.id ?? null;
}

function findUserByEmail(email: string): number | null {
    const result = d1Execute(
        `SELECT id FROM shop_user WHERE email = '${sqlString(email)}'`,
    );
    return d1Rows<{ id: number }>(result)[0]?.id ?? null;
}

function findEvent(shopId: number, name: string): number | null {
    const result = d1Execute(
        `SELECT id FROM event WHERE shop_id = ${shopId} AND name = '${sqlString(name)}'`,
    );
    return d1Rows<{ id: number }>(result)[0]?.id ?? null;
}

function bindEventMember(eventId: number, email: string, role: EventMemberRole) {
    const userId = findUserByEmail(email);
    if (!userId) throw new Error(`User ${email} not found. Run "make seed-users" first.`);

    d1Execute(
        `INSERT INTO event_member (event_id, user_id, role) VALUES (${eventId}, ${userId}, '${role}')
         ON CONFLICT(event_id, user_id) DO UPDATE SET role = excluded.role`,
    );
    console.log(`   -> Bound ${email} as ${role}`);
}

async function run() {
    console.log(`Seeding events in ${envLabel} D1...`);

    const shopId = findShopByName(SHOP_NAME);
    if (!shopId) {
        throw new Error(`Shop "${SHOP_NAME}" not found. Run "make seed-shop" first.`);
    }

    const startAt = localToUtcIso(EVENT.startDate, EVENT.startTime, EVENT.country);
    const endAt = localToUtcIso(EVENT.endDate, EVENT.endTime, EVENT.country);

    let eventId = findEvent(shopId, EVENT.name);
    if (!eventId) {
        d1Execute(
            `INSERT INTO event (shop_id, name, country, start_at, end_at, booth_cost, travel_cost, hotel_cost, food_cost)
             VALUES (${shopId}, '${sqlString(EVENT.name)}', '${EVENT.country}', '${startAt}', '${endAt}', ${EVENT.boothCost}, ${EVENT.travelCost}, ${EVENT.hotelCost}, ${EVENT.foodCost})`,
        );
        eventId = findEvent(shopId, EVENT.name);
        if (!eventId) throw new Error(`Failed to create event "${EVENT.name}"`);
        console.log(`   -> Created event "${EVENT.name}" (event_id=${eventId})`);
    } else {
        d1Execute(
            `UPDATE event SET country = '${EVENT.country}', start_at = '${startAt}', end_at = '${endAt}',
             booth_cost = ${EVENT.boothCost}, travel_cost = ${EVENT.travelCost},
             hotel_cost = ${EVENT.hotelCost}, food_cost = ${EVENT.foodCost}
             WHERE id = ${eventId}`,
        );
        console.log(`   -> Updated event "${EVENT.name}" (event_id=${eventId})`);
    }

    for (const member of EVENT_MEMBERS) {
        bindEventMember(eventId, member.email, member.role);
    }

    console.log(`   -> start_at=${startAt} end_at=${endAt}`);
    console.log('Event seeding completed.');
}

run().catch((error) => {
    console.error('Event seeding failed:', error);
    process.exit(1);
});
