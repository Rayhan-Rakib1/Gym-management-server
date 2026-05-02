"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initiateSSLCommerzPayment = initiateSSLCommerzPayment;
const axios_1 = __importDefault(require("axios"));
async function initiateSSLCommerzPayment(data) {
    const isLive = process.env.SSLCOMMERZ_IS_LIVE === 'true';
    const storeId = process.env.SSLCOMMERZ_STORE_ID;
    const storePassword = process.env.SSLCOMMERZ_STORE_PASSWORD;
    const baseUrl = isLive
        ? 'https://securepay.sslcommerz.com'
        : 'https://sandbox.sslcommerz.com';
    const paymentData = {
        store_id: storeId,
        store_passwd: storePassword,
        total_amount: data.amount,
        currency: 'BDT',
        tran_id: data.transactionId,
        success_url: data.successUrl,
        fail_url: data.failUrl,
        cancel_url: data.cancelUrl,
        ipn_url: `${process.env.BACKEND_URL}/api/v1/payments/sslcommerz/ipn`,
        // Customer info
        cus_name: data.customerName,
        cus_email: data.customerEmail,
        cus_phone: data.customerPhone,
        cus_add1: 'Chittagong, Bangladesh',
        cus_city: 'Chittagong',
        cus_country: 'Bangladesh',
        // Product info
        product_name: data.productName,
        product_category: 'Membership',
        product_profile: 'general',
        // Shipping info
        shipping_method: 'NO',
        num_of_item: 1,
    };
    try {
        const response = await axios_1.default.post(`${baseUrl}/gwprocess/v4/api.php`, paymentData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        if (response.data.status === 'SUCCESS') {
            return response.data;
        }
        else {
            throw new Error(response.data.failedreason || 'Payment initiation failed');
        }
    }
    catch (error) {
        console.error('SSLCommerz Error:', error.message);
        throw new Error('Failed to initiate payment gateway');
    }
}
