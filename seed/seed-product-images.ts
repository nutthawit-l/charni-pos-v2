import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import {
    envLabel,
    parseProductsCsv,
    readTomlVar,
    readWranglerToml,
    wranglerFlag,
} from './helpers';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const SEED_PRODUCT_LIMIT = 15;
const TEMP_DIR = path.resolve(process.cwd(), 'seed/images');
const BG_COLORS = ['#8D6E63', '#A1887F', '#D7CCC8', '#FFA726', '#FFB74D', '#FFE082', '#A1887F', '#8D6E63'];

function bucketName(): string {
    const toml = readWranglerToml();
    return readTomlVar(toml, 'bucket_name') ?? 'charnipos-v2-images';
}

async function downloadImage(url: string, destPath: string): Promise<boolean> {
    try {
        const res = await fetch(url);
        if (!res.ok) return false;
        fs.writeFileSync(destPath, Buffer.from(await res.arrayBuffer()));
        return true;
    } catch {
        return false;
    }
}

async function generatePlaceholder(filePath: string, text: string, bgColor: string) {
    const svg = `
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="${bgColor}" />
        <text x="100" y="110" font-family="sans-serif" font-size="16" font-weight="bold"
              fill="#ffffff" text-anchor="middle">${text}</text>
      </svg>`;
    await sharp(Buffer.from(svg)).png().toFile(filePath);
}

function existsInR2(bucket: string, filename: string): boolean {
    const checkPath = path.join(TEMP_DIR, `.check-${filename}`);
    try {
        execSync(
            `npx wrangler r2 object get ${bucket}/${filename} ${wranglerFlag} --file=${checkPath}`,
            { stdio: 'ignore' },
        );
        if (fs.existsSync(checkPath)) fs.unlinkSync(checkPath);
        return true;
    } catch {
        return false;
    }
}

function uploadToR2(bucket: string, filename: string, filePath: string) {
    execSync(
        `npx wrangler r2 object put ${bucket}/${filename} ${wranglerFlag} --file=${filePath}`,
        { stdio: 'inherit' },
    );
}

async function run() {
    if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

    const bucket = bucketName();
    const products = parseProductsCsv(SEED_PRODUCT_LIMIT);

    console.log(`Seeding ${products.length} product images to ${envLabel} R2 (${bucket})...`);

    for (let i = 0; i < products.length; i++) {
        const p = products[i];
        const filePath = path.join(TEMP_DIR, p.filename);

        if (fs.existsSync(filePath)) {
            console.log(`   -> Local cache exists: seed/images/${p.filename}`);
        } else {
            console.log(`[${i + 1}/${products.length}] Fetching ${p.name}...`);
            const ok = await downloadImage(p.originalUrl, filePath);
            if (!ok) {
                const bg = BG_COLORS[i % BG_COLORS.length];
                console.log(`   -> Download failed; generating placeholder (${bg})`);
                await generatePlaceholder(filePath, p.name, bg);
            }
        }

        if (existsInR2(bucket, p.filename)) {
            console.log(`   -> ${p.filename} already in R2, skipping upload`);
            continue;
        }

        console.log(`   -> Uploading ${p.filename}...`);
        uploadToR2(bucket, p.filename, filePath);
    }

    console.log('Product image seeding completed.');
}

run().catch((error) => {
    console.error('Product image seeding failed:', error);
    process.exit(1);
});
