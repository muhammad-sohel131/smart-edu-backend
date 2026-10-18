"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SSLCommerzProvider = void 0;
// @ts-ignore
const sslcommerz_lts_1 = __importDefault(require("sslcommerz-lts"));
const env_1 = require("../../../config/env");
const AppError_1 = __importDefault(require("../../../errorHelpers/AppError"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
class SSLCommerzProvider {
    constructor() {
        var _a, _b;
        this.storeId = ((_a = env_1.envVars.SSLCOMMERZ) === null || _a === void 0 ? void 0 : _a.STORE_ID) || process.env.STORE_ID || "testbox";
        this.storePass = ((_b = env_1.envVars.SSLCOMMERZ) === null || _b === void 0 ? void 0 : _b.STORE_PASS) || process.env.STORE_PASS || "qwerty";
        this.isLive = false; // Set to true in production
    }
    createCheckoutSession(input) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const data = {
                total_amount: input.amount,
                currency: input.currency || "BDT",
                tran_id: input.orderId,
                success_url: `${env_1.envVars.BASE_URL || 'http://localhost:5000'}/api/payment/webhooks/sslcommerz/success?orderId=${input.orderId}`,
                fail_url: `${env_1.envVars.BASE_URL || 'http://localhost:5000'}/api/payment/webhooks/sslcommerz/fail?orderId=${input.orderId}`,
                cancel_url: `${env_1.envVars.BASE_URL || 'http://localhost:5000'}/api/payment/webhooks/sslcommerz/cancel?orderId=${input.orderId}`,
                ipn_url: `${env_1.envVars.BASE_URL || 'http://localhost:5000'}/api/payment/webhooks/sslcommerz/ipn`,
                shipping_method: 'NO',
                product_name: input.source,
                product_category: input.source,
                product_profile: 'general',
                cus_name: ((_a = input.billingInfo) === null || _a === void 0 ? void 0 : _a.name) || 'Customer',
                cus_email: ((_b = input.billingInfo) === null || _b === void 0 ? void 0 : _b.email) || 'customer@example.com',
                cus_add1: 'Dhaka',
                cus_add2: 'Dhaka',
                cus_city: 'Dhaka',
                cus_state: 'Dhaka',
                cus_postcode: '1000',
                cus_country: 'Bangladesh',
                cus_phone: ((_c = input.billingInfo) === null || _c === void 0 ? void 0 : _c.phone) || '01711111111',
                cus_fax: '01711111111',
                ship_name: 'Customer',
                ship_add1: 'Dhaka',
                ship_add2: 'Dhaka',
                ship_city: 'Dhaka',
                ship_state: 'Dhaka',
                ship_postcode: '1000',
                ship_country: 'Bangladesh',
            };
            const sslcz = new sslcommerz_lts_1.default(this.storeId, this.storePass, this.isLive);
            try {
                const apiResponse = yield sslcz.init(data);
                console.log("SSLCommerz Init Response:", apiResponse);
                if (apiResponse === null || apiResponse === void 0 ? void 0 : apiResponse.GatewayPageURL) {
                    return {
                        sessionId: input.orderId, // We use orderId as tran_id/sessionId
                        checkoutUrl: apiResponse.GatewayPageURL,
                    };
                }
                else {
                    throw new AppError_1.default(http_status_codes_1.default.INTERNAL_SERVER_ERROR, "Failed to generate SSLCommerz checkout URL");
                }
            }
            catch (error) {
                console.error("SSLCommerz Init Error:", error);
                throw new AppError_1.default(http_status_codes_1.default.INTERNAL_SERVER_ERROR, "SSLCommerz payment initialization failed");
            }
        });
    }
}
exports.SSLCommerzProvider = SSLCommerzProvider;
