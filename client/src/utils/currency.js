export const formatCurrency = (amount) => {
    if (!amount) return '0 ₫';
    
    // If input is string like "10.000.000 ₫", try to clean it first
    let num = amount;
    if (typeof amount === 'string') {
        // If it's a valid standard number string (e.g. "41990000.00" from DB), parse it directly
        if (!isNaN(amount)) {
            num = parseFloat(amount);
        } else {
            // Otherwise assume it's a formatted string (e.g. "10.000.000") and strip non-digits
            const cleanStr = amount.replace(/[^\d]/g, '');
            num = parseInt(cleanStr, 10);
        }
    }
    
    if (isNaN(num)) return '0 ₫';

    // Format using Vietnamese locale
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(num);
};
