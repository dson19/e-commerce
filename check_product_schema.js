const axios = require('axios');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from server/.env
dotenv.config({ path: path.join(__dirname, 'server', '.env') });

const SERVER_URL = 'http://localhost:5000/api/products';

(async () => {
    try {
        // 1. Get List to find a product
        const listRes = await axios.get(`${SERVER_URL}?limit=1`);
        const product = listRes.data.data[0];

        if (!product) {
            console.log('No products found.');
            return;
        }

        console.log(`Checking Product ID: ${product.id}`);

        // 2. Get Details
        const detailRes = await axios.get(`${SERVER_URL}/${product.id}`);
        const fullProduct = detailRes.data.data;

        console.log('Product Variants Keys:', fullProduct.variants && fullProduct.variants.length > 0 ? Object.keys(fullProduct.variants[0]) : 'No variants');

        if (fullProduct.variants && fullProduct.variants.length > 0) {
            console.log('Sample Variant:', JSON.stringify(fullProduct.variants[0], null, 2));
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
})();
