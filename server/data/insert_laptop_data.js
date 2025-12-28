import fs from 'fs';
import pg from 'pg';
import pool from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();
const rawData = fs.readFileSync('/Users/Administrator/Coding/mobile_store/server/data/laptops.json', 'utf-8');
const products = JSON.parse(rawData);

for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const productQuery = `
        INSERT INTO products (name, min_price, img, category_id, brand_id, specs)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (name) DO NOTHING
        RETURNING ID;
    `;
    const productValues = [
        product.name,
        product.currentPrice,
        getHigherQualityImageUrl(product.variants?.[0]?.img || ""),
        product.categoryId,
        product.brandId,
        product.specs ? JSON.stringify(product.specs) : null
    ];
    try {
        const res = await pool.query(productQuery, productValues);
        product.id = res.rows[0] ? res.rows[0].id : null;
        console.log(`Inserted: ${product.name}`);
        if (product.variants){
        for (let j = 0; j < product.variants.length; j++) {
            const variant = product.variants[j];
            const variantQuery = `
                INSERT INTO product_variants (product_id, color, price, old_price, sku,image_url)
                VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT (sku) DO NOTHING;
            `;
            const variantValues = [
                product.id,
                variant.color,
                variant.bestPrice,
                variant.lastPrice,
                variant.sku,
                getHigherQualityImageUrl(variant.img)
            ];
            await pool.query(variantQuery, variantValues);
        }
    }
    } catch (err) {
        console.error(`Error inserting ${product.name}:`, err);
    }
}
function getHigherQualityImageUrl(url) {
    if (!url) return url;
    let highResUrl = url.replaceAll('/productlist/dst/', '/previewV2/');
    const semicolonIndex = highResUrl.indexOf(';');
    if (semicolonIndex !== -1) {
        highResUrl = highResUrl.substring(0, semicolonIndex);
    }
    return highResUrl;
}