const axios = require('axios');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from server/.env
dotenv.config({ path: path.join(__dirname, 'server', '.env') });

const SERVER_URL = 'http://localhost:5000/api/payment/casso-webhook';
const SECURE_TOKEN = process.env.CASSO_SECURE_TOKEN;

if (!SECURE_TOKEN) {
    console.error('Error: CASSO_SECURE_TOKEN not found in server/.env');
    process.exit(1);
}

const orderId = process.argv[2];
const amount = process.argv[3] || 100000; // Default amount if not specified

if (!orderId) {
    console.log('Usage: node simulate-casso-webhook.js <orderId> [amount]');
    console.log('Example: node simulate-casso-webhook.js 123 500000');
    process.exit(1);
}

const payload = {
    data: [
        {
            id: Math.floor(Math.random() * 1000000),
            tid: `TID${Math.floor(Math.random() * 1000000)}`,
            description: `Payment for OrderID${orderId}`,
            amount: parseInt(amount),
            when: new Date().toISOString(),
            bank_sub_acc_id: "000000"
        }
    ]
};

console.log(`Simulating payment for Order ID: ${orderId} with Amount: ${amount}`);
console.log(`Target URL: ${SERVER_URL}`);

axios.post(SERVER_URL, payload, {
    headers: {
        'Content-Type': 'application/json',
        'secure-token': SECURE_TOKEN
    }
})
    .then(response => {
        console.log('Response:', response.data);
        if (response.data.success || response.data.message === "Webhook processed") {
            console.log('✅ Payment simulation successful! Check the frontend.');
        } else {
            console.log('⚠️  Payment simulation processed but check message.');
        }
    })
    .catch(error => {
        if (error.response) {
            console.error('❌ Server Error:', error.response.status, error.response.data);
        } else {
            console.error('❌ Network Error:', error.message);
        }
    });
