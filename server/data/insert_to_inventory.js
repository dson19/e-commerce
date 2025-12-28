import fs from 'fs';
import pg from 'pg';
import pool from '../config/db.js';
import dotenv from 'dotenv';
import path from 'path';
import { randomInt } from 'crypto';

dotenv.config();

const importInventory = async () => {
    const __dirname = path.resolve();
    const dataPath = path.join(__dirname, 'data', 'monitors.json');
    
    // Check file tồn tại
    if (!fs.existsSync(dataPath)) {
        console.error("File not found");
        return;
    }

    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const products = JSON.parse(rawData);

    console.log("Start importing inventory...");

    for (let i = 0; i < products.length; i++) {
        const product = products[i];
        const variants = product.variants || [];

        for (let j = 0; j < variants.length; j++) {
            const variant = variants[j];

            // Kiểm tra nếu không có SKU thì bỏ qua (vì cần SKU để map với DB)
            if (!variant.sku) {
                console.warn(`Skipping variant ${variant.name} - No SKU`);
                continue;
            }

            // --- SỬA LỖI SQL: Dùng INSERT ... SELECT ---
            // Ý nghĩa: Tìm dòng trong product_variants có sku = $2, lấy ID của nó để ném vào inventory
            const insertQuery = `
                INSERT INTO inventory (variant_id, stock, reserved_stock)
                SELECT variant_id, $1, 0
                FROM product_variants
                WHERE sku = $2
                ON CONFLICT (variant_id) 
                DO UPDATE SET stock = $1; -- Update lại stock nếu đã tồn tại
            `;

            const insertValues = [
                randomInt(10, 100), // $1: Stock ngẫu nhiên
                variant.sku         // $2: SKU dùng để tìm ID
            ];

            // --- SỬA LỖI JS: Đưa try/catch vào TRONG vòng lặp ---
            try {
                // Kiểm tra xem query có insert/update được dòng nào không
                const res = await pool.query(insertQuery, insertValues);
                
                if (res.rowCount > 0) {
                    console.log(`✅ Updated inventory for SKU: ${variant.sku}`);
                } else {
                    console.log(`⚠️ SKU not found in DB: ${variant.sku}`);
                }
            } catch (err) {
                console.error(`❌ Error logic for SKU: ${variant.sku}`, err.message);
            }
        }
    }
    console.log("Done!");
};

importInventory();