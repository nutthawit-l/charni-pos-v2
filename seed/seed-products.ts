import {
    d1Execute,
    d1Rows,
    envLabel,
    isRemote,
    normalizePublicUrl,
    parseProductsCsv,
    readTomlVar,
    readWranglerToml,
    sqlString,
} from './helpers';

const SHOP_NAME = 'Fly away to somewhere';
const DEFAULT_STOCK = 10;
const SEED_PRODUCT_LIMIT = 15;

function findShopByName(name: string): number | null {
    const result = d1Execute(
        `SELECT id FROM shop WHERE name = '${sqlString(name)}'`,
    );
    return d1Rows<{ id: number }>(result)[0]?.id ?? null;
}

function loadCategories(shopId: number): Map<string, number> {
    const result = d1Execute(
        `SELECT id, name FROM category WHERE shop_id = ${shopId}`,
    );
    const map = new Map<string, number>();
    for (const row of d1Rows<{ id: number; name: string }>(result)) {
        map.set(row.name, row.id);
    }
    return map;
}

function productExists(shopId: number, name: string): boolean {
    const result = d1Execute(
        `SELECT id FROM product WHERE shop_id = ${shopId} AND name = '${sqlString(name)}'`,
    );
    return d1Rows(result).length > 0;
}

function imageBaseUrl(): string {
    if (!isRemote) return '/api/images';
    const toml = readWranglerToml();
    const url = readTomlVar(toml, 'R2_PUBLIC_URL');
    if (!url) throw new Error('R2_PUBLIC_URL is empty in wrangler.toml');
    return normalizePublicUrl(url);
}

function ensureCategories(
    shopId: number,
    names: string[],
    map: Map<string, number>,
): Map<string, number> {
    const missing = names.filter((name) => !map.has(name));
    if (missing.length > 0) {
        console.log(`   -> Inserting categories: ${missing.join(', ')}`);
        for (const name of missing) {
            d1Execute(
                `INSERT INTO category (shop_id, name) VALUES (${shopId}, '${sqlString(name)}')`,
            );
        }
    }

    const updated = new Map(map);
    for (const row of d1Rows<{ id: number; name: string }>(
        d1Execute(`SELECT id, name FROM category WHERE shop_id = ${shopId}`),
    )) {
        updated.set(row.name, row.id);
    }
    return updated;
}

function upsertPrice(shopId: number, name: string, currency: string, price: number) {
    d1Execute(
        `INSERT OR REPLACE INTO product_price (product_id, currency_code, price)
         VALUES (
           (SELECT id FROM product WHERE name = '${sqlString(name)}' AND shop_id = ${shopId}),
           '${currency}',
           ${price}
         )`,
    );
}

async function run() {
    console.log(`Seeding products in ${envLabel} D1...`);

    const shopId = findShopByName(SHOP_NAME);
    if (!shopId) {
        throw new Error(`Shop "${SHOP_NAME}" not found. Run "make seed-shop" first.`);
    }

    const products = parseProductsCsv(SEED_PRODUCT_LIMIT);
    const categoryNames = [...new Set(products.map((p) => p.category))];
    const categoryMap = ensureCategories(shopId, categoryNames, loadCategories(shopId));

    const baseUrl = imageBaseUrl();

    for (const p of products) {
        const categoryId = categoryMap.get(p.category);
        const imageUrl = `${baseUrl}/${p.filename}`;

        if (!productExists(shopId, p.name)) {
            const catSql = categoryId != null ? String(categoryId) : 'NULL';
            d1Execute(
                `INSERT INTO product (shop_id, category_id, name, image_url, stock)
                 VALUES (${shopId}, ${catSql}, '${sqlString(p.name)}', '${sqlString(imageUrl)}', ${DEFAULT_STOCK})`,
            );
            console.log(`   -> Inserted product "${p.name}"`);
        } else {
            d1Execute(
                `UPDATE product SET image_url = '${sqlString(imageUrl)}'
                 WHERE shop_id = ${shopId} AND name = '${sqlString(p.name)}'`,
            );
            console.log(`   -> Product "${p.name}" already exists, updated image_url`);
        }

        upsertPrice(shopId, p.name, 'THB', p.thb);
        if (p.sgd != null) upsertPrice(shopId, p.name, 'SGD', p.sgd);
    }

    console.log('Product seeding completed.');
}

run().catch((error) => {
    console.error('Product seeding failed:', error);
    process.exit(1);
});
