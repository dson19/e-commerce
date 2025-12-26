import puppeteer from 'puppeteer';
import fs from 'fs';

(async () => {
    const browser = await puppeteer.launch({ headless: false, defaultViewport: null });
    const page = await browser.newPage();

    const url = 'https://hoanghamobile.com/dien-thoai-di-dong/iphone'; 
    console.log(`Đang truy cập: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle2' });

    console.log('Đã load hết sản phẩm, bắt đầu lấy dữ liệu...');
    // lấy tên, giá , link sản phẩm
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
            const link = anchorEl ? anchorEl.href : null;
            const title = anchorEl ? anchorEl.getAttribute('title').trim() : null;
            const currentPriceEl = node.querySelector('.price strong');
            // Cập nhật selector giá cũ theo ảnh bạn gửi lúc nãy (.price-last strike)
            const oldPriceEl = node.querySelector('.price-last strike') || node.querySelector('.price .strike');
            
            if (anchorEl) {
                // Xử lý tiêu đề an toàn: Nếu không có attribute title thì lấy innerText
                const rawTitle = anchorEl.getAttribute('title');
                const title = rawTitle ? rawTitle.trim() : anchorEl.innerText.trim();

                // Xử lý giá an toàn: Kiểm tra element có tồn tại không rồi mới lấy innerText
                const currentPriceText = currentPriceEl ? currentPriceEl.innerText.trim() : null;
                const oldPriceText = oldPriceEl ? oldPriceEl.innerText.trim() : null;
                
                data.push({
                    name: title,
                    link: link,
                    currentPrice: convertToNumber(currentPriceText),
                    oldPrice: convertToNumber(oldPriceText), // Nếu không có giá cũ, hàm sẽ trả về 0
                    img: node.querySelector('img') ? node.querySelector('img').src : null
                });
            }
        });
        return data;
    });
    // truy cập vào link và lấy specs
    /*for (let i = 0; i < products.length; i++) {
        const product = products[i];
        console.log(`Đang lấy thông tin chi tiết cho sản phẩm: ${product.name}`);
        try{
            await page.goto(product.link, { waitUntil: 'networkidle2' });
            const specs = await page.evaluate(() => {
                const 
        });
    }*/
    fs.writeFileSync('products.json', JSON.stringify(products, null, 2));
    console.log(`Tổng cộng tìm thấy: ${products.length} sản phẩm.`);
    await browser.close();
})();

