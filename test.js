import puppeteer from 'puppeteer';
import fs from 'fs';

const BRAND_MAPPING = [
    { id: 1, keywords: ['apple', 'iphone', 'ipad', 'macbook', 'mac', 'airpods', 'watch'] },
    { id: 2, keywords: ['samsung', 'galaxy', 'z fold', 'z flip', 'buds'] },
    { id: 3, keywords: ['xiaomi', 'redmi', 'poco', 'mi '] }, 
    { id: 4, keywords: ['sony', 'xperia', 'wh-', 'wf-', 'bravia'] },
    { id: 5, keywords: ['oppo', 'reno', 'find'] },
    { id: 6, keywords: ['vivo', 'iqoo', 'y series', 'v series'] },
    { id: 7, keywords: ['realme', 'narzo', 'gt'] },
    { id: 8, keywords: ['asus', 'rog', 'tuf', 'zenbook', 'vivobook', 'expertbook'] },
    { id: 9, keywords: ['nokia'] },
    { id: 10, keywords: ['tecno', 'pova', 'spark', 'camon'] },
];
const DEFAULT_BRAND_ID = 25;

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const finalProducts = [];
    // Chặn ảnh/font để load nhanh hơn (vì ta phải đợi click)
    await page.setRequestInterception(true);
    page.on('request', (req) => {
        if (['image', 'font'].includes(req.resourceType())) req.abort();
        else req.continue();
    });

    const url = 'https://hoanghamobile.com/dien-thoai-di-dong/'; 
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

    products.forEach(p => p.brandId = detectBrandId(p.name));

    console.log(`\nTổng cộng: ${products.length} sản phẩm. Bắt đầu quét chi tiết...`);
    
    for (let i = 0; i < products.length; i++) {
        const product = products[i];
        console.log(`[${i+1}/${products.length}] ${product.name}`);
        
        try {
            await page.goto(product.link, { waitUntil: 'domcontentloaded', timeout: 60000 });

   
            const btnSelector = 'a.ajax-modal-show';
            
            try {
                const btn = await page.$(btnSelector);
                if (btn) {
                    await btn.click();
                    try {
                        await page.waitForSelector('#popup-modal', { visible: true, timeout: 5000 });
                        await new Promise(r => setTimeout(r, 3000));
                    } 
                    catch(e) {
                        console.log('   -> Timeout: Modal không hiện hoặc load quá lâu.');
                    }
                 }
                }
                catch (e) {
                    console.log('   -> Lỗi khi bấm mở modal:', e.message);
                }

            const specs = await page.evaluate(() => {
                let specObj = {};

                const box = document.querySelector('#popup-modal .box-technical-specifications')
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
            }

        } catch (error) {
            console.error(`   -> Lỗi: ${error.message}`);
            product.specs = {};
        }
    }

    fs.writeFileSync('products.json', JSON.stringify(finalProducts, null, 2));
    console.log(`Đã lấy tổng cộng ${finalProducts.length} sản phẩm chi tiết.`);
    await browser.close();
})();

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