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
        this.isSandbox = true; // Set to false in production
    }
    createCheckoutSession(input) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
            const data = {
                total_amount: input.amount,
                currency: input.currency || "BDT",
                tran_id: input.orderId,
                success_url: `${env_1.envVars.BASE_URL || 'http://localhost:5000'}/api/v1/payment/webhooks/sslcommerz/success?orderId=${input.orderId}`,
                fail_url: `${env_1.envVars.BASE_URL || 'http://localhost:5000'}/api/v1/payment/webhooks/sslcommerz/fail?orderId=${input.orderId}`,
                cancel_url: `${env_1.envVars.BASE_URL || 'http://localhost:5000'}/api/v1/payment/webhooks/sslcommerz/cancel?orderId=${input.orderId}`,
                ipn_url: `${env_1.envVars.BASE_URL || 'http://localhost:5000'}/api/v1/payment/webhooks/sslcommerz/ipn`,
                shipping_method: 'NO',
                product_name: input.source,
                product_category: input.source,
                product_profile: 'general',
                cus_name: ((_a = input.shippingAddress) === null || _a === void 0 ? void 0 : _a.name) || 'Customer',
                cus_email: 'customer@example.com',
                cus_add1: ((_b = input.shippingAddress) === null || _b === void 0 ? void 0 : _b.line1) || 'Dhaka',
                cus_add2: ((_c = input.shippingAddress) === null || _c === void 0 ? void 0 : _c.line2) || 'Dhaka',
                cus_city: ((_d = input.shippingAddress) === null || _d === void 0 ? void 0 : _d.city) || 'Dhaka',
                cus_state: ((_e = input.shippingAddress) === null || _e === void 0 ? void 0 : _e.state) || 'Dhaka',
                cus_postcode: ((_f = input.shippingAddress) === null || _f === void 0 ? void 0 : _f.postcode) || '1000',
                cus_country: ((_g = input.shippingAddress) === null || _g === void 0 ? void 0 : _g.country) || 'Bangladesh',
                cus_phone: ((_h = input.shippingAddress) === null || _h === void 0 ? void 0 : _h.phone) || '01711111111',
                cus_fax: '01711111111',
                ship_name: ((_j = input.shippingAddress) === null || _j === void 0 ? void 0 : _j.name) || 'Customer',
                ship_add1: ((_k = input.shippingAddress) === null || _k === void 0 ? void 0 : _k.line1) || 'Dhaka',
                ship_add2: ((_l = input.shippingAddress) === null || _l === void 0 ? void 0 : _l.line2) || 'Dhaka',
                ship_city: ((_m = input.shippingAddress) === null || _m === void 0 ? void 0 : _m.city) || 'Dhaka',
                ship_state: ((_o = input.shippingAddress) === null || _o === void 0 ? void 0 : _o.state) || 'Dhaka',
                ship_postcode: ((_p = input.shippingAddress) === null || _p === void 0 ? void 0 : _p.postcode) || '1000',
                ship_country: ((_q = input.shippingAddress) === null || _q === void 0 ? void 0 : _q.country) || 'Bangladesh',
            };
            const sslcz = new sslcommerz_lts_1.default(this.storeId, this.storePass, this.isSandbox);
            try {
                const apiResponse = yield sslcz.init(data);
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
