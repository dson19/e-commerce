import puppeteer from 'puppeteer';
import fs from 'fs';

const BRAND_MAPPING = [
    // --- DIỆN THOẠI & TABLET ---
    { id: 1,  name: 'Apple',      keywords: ['apple', 'iphone', 'ipad', 'macbook', 'imac', 'mac mini'] },
    { id: 2,  name: 'Samsung',    keywords: ['samsung', 'galaxy', 'z fold', 'z flip'] },
    { id: 3,  name: 'Xiaomi',     keywords: ['xiaomi', 'redmi', 'poco', 'mi ', 'pad'] },
    { id: 4,  name: 'Sony',       keywords: ['sony', 'xperia', 'bravia', 'playstation'] },
    { id: 5,  name: 'OPPO',       keywords: ['oppo', 'reno', 'find'] },
    { id: 6,  name: 'Vivo',       keywords: ['vivo', 'iqoo'] },
    { id: 7,  name: 'Realme',     keywords: ['realme', 'narzo', 'gt'] },
    { id: 8,  name: 'Asus',       keywords: ['asus', 'rog', 'tuf', 'zenbook', 'vivobook'] },
    { id: 9,  name: 'Nokia',      keywords: ['nokia'] },
    { id: 10, name: 'Tecno',      keywords: ['tecno', 'pova', 'spark', 'camon', 'phantom'] },

    // --- LAPTOP & PC ---
    { id: 11, name: 'Dell',       keywords: ['dell', 'inspiron', 'vostro', 'xps', 'alienware', 'latitude'] },
    { id: 12, name: 'HP',         keywords: ['hp', 'pavilion', 'envy', 'omen', 'victus', 'probook', 'elitebook'] },
    { id: 13, name: 'Lenovo',     keywords: ['lenovo', 'ideapad', 'thinkpad', 'legion', 'yoga', 'loq'] },
    { id: 14, name: 'MSI',        keywords: ['msi', 'katana', 'cyborg', 'modern', 'prestige', 'titan', 'stealth'] },
    { id: 15, name: 'Acer',       keywords: ['acer', 'aspire', 'nitro', 'predator', 'swift'] },
    { id: 16, name: 'Microsoft',  keywords: ['microsoft', 'surface'] },
    { id: 17, name: 'Razer',      keywords: ['razer', 'blade'] },
    { id: 18, name: 'LG',         keywords: ['lg', 'gram', 'ultragear'] }, // LG Gram là laptop, UltraGear là màn hình

    // --- MÀN HÌNH & PHỤ KIỆN ---
    { id: 19, name: 'ViewSonic',  keywords: ['viewsonic', 'vx', 'va'] },
    { id: 20, name: 'AOC',        keywords: ['aoc'] },
    { id: 21, name: 'BenQ',       keywords: ['benq', 'zowie'] },
    { id: 22, name: 'Gigabyte',   keywords: ['gigabyte', 'aorus', 'g5', 'g6'] }, // Gigabyte làm cả Laptop (G5/G6)
    { id: 23, name: 'Corsair',    keywords: ['corsair', 'elgato'] },
    { id: 24, name: 'Logitech',   keywords: ['logitech', 'mx master', 'g pro'] },
    
];
const DB_LAPTOP_CATEGORIES = [
    { id: 15, name: 'MacBook', keywords: ['macbook', 'mac book', 'apple', 'm1', 'm2', 'm3', 'air', 'pro'] },
    { id: 16, name: 'Dell',    keywords: ['dell', 'inspiron', 'vostro', 'xps', 'latitude', 'alienware', 'precision'] },
    { id: 17, name: 'HP',      keywords: ['hp', 'pavilion', 'envy', 'omen', 'victus', 'probook', 'elitebook'] },
    { id: 18, name: 'Asus',    keywords: ['asus', 'rog', 'tuf', 'zenbook', 'vivobook', 'expertbook'] },
    { id: 19, name: 'Acer',    keywords: ['acer', 'aspire', 'nitro', 'predator', 'swift'] },
    { id: 20, name: 'Lenovo',  keywords: ['lenovo', 'ideapad', 'thinkpad', 'legion', 'yoga', 'loq'] },
    { id: 21, name: 'MSI',     keywords: ['msi', 'katana', 'cyborg', 'modern', 'prestige', 'titan', 'stealth', 'bravo'] },
    { id: 22, name: 'LG Gram', keywords: ['lg', 'gram', 'ultra'] }, 

];



const DEFAULT_BRAND_ID = 25;
const DEFAULT_CATEGORY_ID = 43;
let count = 0;
(async () => {
    // Thêm args để mở rộng viewport, tránh bị ẩn element trên màn hình nhỏ
    const browser = await puppeteer.launch({
        headless: "new", // Hoặc false nếu muốn xem chạy
        args: ['--window-size=1920,1080']
    });
    
    const page = await browser.newPage();
    // Set viewport lớn để chắc chắn modal không bị che
    await page.setViewport({ width: 1920, height: 1080 });

    const finalProducts = [];
    
    await page.setRequestInterception(true);
    page.on('request', (req) => {
        if (['image', 'font'].includes(req.resourceType())) req.abort();
        else req.continue();
    });

    const url = 'https://hoanghamobile.com/laptop?filters=%7B%7D&search=true&pmin=20%2C000%2C000&pmax=52%2C300%2C000';
    console.log(`Đang truy cập: ${url}`);
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    console.log('Đã load hết sản phẩm, bắt đầu lấy dữ liệu...');
    await loadFullPage(page);

    // --- LẤY DANH SÁCH SẢN PHẨM ---
    const products = await page.evaluate(() => {
        const productNodes = document.querySelectorAll('.pj16-item');
        const data = [];
        const convertToNumber = (str) => {
            if (!str) return 0;
            const cleanStr = str.replace(/[^0-9]/g, '');
            return parseInt(cleanStr, 10);
        };
        productNodes.forEach(node => {
            const anchorEl = node.querySelector('h3 a');
            if (anchorEl) {
                const title = anchorEl.getAttribute('title') ? anchorEl.getAttribute('title').trim() : anchorEl.innerText.trim();
                const currentPriceEl = node.querySelector('.price strong');
                const oldPriceEl = node.querySelector('.price-last strike') || node.querySelector('.price .strike');

                data.push({
                    name: title,
                    link: anchorEl.href,
                    currentPrice: currentPriceEl ? convertToNumber(currentPriceEl.innerText) : 0,
                    oldPrice: oldPriceEl ? convertToNumber(oldPriceEl.innerText) : 0,
                    img: node.querySelector('img') ? node.querySelector('img').src : null
                });
            }
        });
        return data;
    });

    products.forEach(p => {
        p.brandId = detectBrandId(p.name);
        p.categoryId = detectCategory(p.name);
    });

    console.log(`\nTổng cộng: ${products.length} sản phẩm. Bắt đầu quét chi tiết...`);
    // lấy specs
    for (let i = 0; i < products.length; i++) {
        const product = products[i];
        console.log(`[${i + 1}/${products.length}] ${product.name}`);

        try {
            // Tăng timeout load page lên chút để chắc chắn
            await page.goto(product.link, { waitUntil: 'domcontentloaded', timeout: 60000 });

            const btnSelector = 'a.ajax-modal-show';
            const modalSelector = '#popup-modal';
            
            // Gọi hàm click an toàn (tự động thử lại 3 lần)
            const isModalOpened = await safeOpenModal(page, btnSelector, modalSelector);

            if (isModalOpened) {
                // Nếu mở được modal thì mới lấy dữ liệu
                const specs = await page.evaluate(() => {
                    let specObj = {};
                    const box = document.querySelector('#popup-modal .box-technical-specifications');
                    // Chỉ lấy li nếu box tồn tại
                    const rows = box ? box.querySelectorAll('li') : [];

                    rows.forEach(row => {
                        let key = '', value = '';
                        const keyEl = row.querySelector('strong');
                        const valEl = row.querySelector('span');
                        if (keyEl && valEl) {
                            key = keyEl.textContent.replace(/:/g, '').trim();
                            value = valEl.textContent.trim();
                        }
                        if (key && value && key.length < 50) {
                            specObj[key] = value;
                        }
                    });
                    return specObj;
                });

                if (Object.keys(specs).length > 0) {
                    product.specs = specs;
                    finalProducts.push(product);
                    if (finalProducts.length >= 100){
                        console.log('Đã đủ 100 sản phẩm có specs, dừng lại.');
                        break;
                    }
                    console.log(`   -> ✅ Đã lấy được specs.`);
                } else {
                    console.log(`   -> ⚠️ Modal mở nhưng không thấy thông số.`);
                }
            } else {
                console.log(`   -> ❌ Bỏ qua (Không mở được Modal).`);
                product.specs = {};
            }

        } catch (error) {
            console.error(`   -> Lỗi trang: ${error.message}`);
            product.specs = {};
        }
    }
    //lấy variants cho từng sản phẩm trong final products
    for (let i = 0; i < finalProducts.length; i++) {
        const product = finalProducts[i];
        console.log(`Lấy variants cho: ${product.name}`);

        try {
            await page.goto(product.link, { waitUntil: 'networkidle0', timeout: 60000 });
            const variants = await page.evaluate(() => {
                const optionColorsList = document.querySelector('#option-color');
                const variantList = [];
                if (optionColorsList) {
                    const optionElements = optionColorsList.querySelectorAll('.item-option');
                    optionElements.forEach(optionEl => {
                        const colorName =optionEl.getAttribute('data-name') ? optionEl.getAttribute('data-name').trim() : null;
                        const bestPrice = optionEl.getAttribute('data-bestprice') ? parseInt(optionEl.getAttribute('data-bestprice').replace(/[^0-9]/g, '')) : null;
                        const lastPrice = optionEl.getAttribute('data-lastprice') ? parseInt(optionEl.getAttribute('data-lastprice').replace(/[^0-9]/g, '')) : null;
                        const sku = optionEl.getAttribute('data-sku') ? optionEl.getAttribute('data-sku').trim() : null;
                        const imgEl = optionEl.querySelector('img');
                        const img = imgEl ? imgEl.src : null;
                        variantList.push({
                            color: colorName,
                            bestPrice: bestPrice,
                            lastPrice: lastPrice,
                            sku: sku,
                            img: img
                        });
                    });
                }
                return variantList;
            });
            if (variants.length > 0) {
                product.variants = variants;
                console.log(`   -> ✅ Đã lấy được ${variants.length} variants cho ${product.name}.`);
            }
            else {
                console.log(`   -> ⚠️ Không tìm thấy variants cho ${product.name}.`);
                count++;
                product.variants = {};
            }
        } catch (error) {
            console.error(`   -> Lỗi lấy variants: ${error.message}`);
        }
    }
    saveProductsSmart('laptops.json', finalProducts);
    console.log(`Tổng cộng ${count} sản phẩm không có variants.`);
    await browser.close();
})();

// --- HÀM MỚI: RETRY LOGIC (Bấm thử 3 lần) ---
async function safeOpenModal(page, btnSelector, modalSelector) {
    const maxRetries = 3;
    
    for (let i = 0; i < maxRetries; i++) {
        try {
            // 1. Đợi nút xuất hiện và sẵn sàng click (timeout ngắn để fail nhanh nếu không có nút)
            await page.waitForSelector(btnSelector, { visible: true, timeout: 3000 });
            
            // 2. Thử Click
            await page.click(btnSelector);
            
            // 3. QUAN TRỌNG: Đợi Modal hiện ra (xác nhận click thành công)
            await page.waitForSelector(modalSelector, { visible: true, timeout: 5000 });
            
            // 4. Đợi thêm 1 chút cho nội dung bên trong modal load xong (animation)
            await new Promise(r => setTimeout(r, 1000));
            
            return true; // Thành công thoát luôn
            
        } catch (error) {
            console.log(`   -> ⚠️ Lần thử ${i + 1} thất bại (Click lỗi hoặc Modal chưa hiện).`);
            
            if (i < maxRetries - 1) {
                console.log(`   -> Đang thử lại sau 2s...`);
                await new Promise(r => setTimeout(r, 2000)); // Nghỉ 2s rồi thử lại
            } else {
                return false; // Hết 3 lần vẫn lỗi
            }
        }
    }
}

async function loadFullPage(page) {
    while (true) {
        try {
            const buttonSelector = '#page-pager a, .v5-more-product a';
            try { await page.waitForSelector(buttonSelector, { timeout: 2000 }); } catch (e) { break; }
            const loadMoreButton = await page.$(buttonSelector);
            if (loadMoreButton) {
                await loadMoreButton.click();
                await new Promise(r => setTimeout(r, 2000));
            } else { break; }
        } catch (error) { break; }
    }
}

function detectBrandId(productName) {
    if (!productName) return DEFAULT_BRAND_ID;
    const nameLower = productName.toLowerCase();
    for (const brand of BRAND_MAPPING) {
        if (brand.keywords.some(keyword => nameLower.includes(keyword))) return brand.id;
    }
    return DEFAULT_BRAND_ID;
}

function detectCategory(productName) {
    if (!productName) return DEFAULT_CATEGORY_ID;
    const nameLower = productName.toLowerCase();
    for (const cat of DB_LAPTOP_CATEGORIES) {
        const isMatch = cat.keywords.some(keyword => nameLower.includes(keyword));
        if (isMatch) return cat.id;
    }
    return DEFAULT_CATEGORY_ID;
}

function saveProductsSmart(filePath, newProducts) {
    let existingProducts = [];
    if (fs.existsSync(filePath)) {
        try {
            const fileContent = fs.readFileSync(filePath, 'utf8');
            existingProducts = JSON.parse(fileContent);
        } catch (e) {
            console.log('⚠️ File JSON lỗi hoặc rỗng, sẽ tạo mới.');
            existingProducts = [];
        }
    }
    const productMap = new Map();
    existingProducts.forEach(p => productMap.set(p.name, p));
    newProducts.forEach(p => productMap.set(p.name, p));
    const mergedList = Array.from(productMap.values());
    fs.writeFileSync(filePath, JSON.stringify(mergedList, null, 2));

    console.log(`✅ Đã lưu thông minh!`);
    console.log(`   - File gốc có: ${existingProducts.length}`);
    console.log(`   - Crawl được: ${newProducts.length}`);
    console.log(`   - Tổng sau khi gộp: ${mergedList.length}`);
}