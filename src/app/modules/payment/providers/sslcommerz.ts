// @ts-ignore
import SSLCommerzPayment from "sslcommerz-lts";
import { CreateSessionInput, CreateSessionResult } from "../payment.types";
import { envVars } from "../../../config/env";
import AppError from "../../../errorHelpers/AppError";
import httpStatus from "http-status-codes";

export class SSLCommerzProvider {
  private storeId: string;
  private storePass: string;
  private isLive: boolean;

  constructor() {
    this.storeId = envVars.SSLCOMMERZ?.STORE_ID || process.env.STORE_ID || "testbox";
    this.storePass = envVars.SSLCOMMERZ?.STORE_PASS || process.env.STORE_PASS || "qwerty";
    this.isLive = false; // Set to true in production
  }

  async createCheckoutSession(input: CreateSessionInput): Promise<CreateSessionResult> {
    const data = {
      total_amount: input.amount,
      currency: input.currency || "BDT",
      tran_id: input.orderId,
      success_url: `${envVars.BASE_URL || 'http://localhost:5000'}/api/payment/webhooks/sslcommerz/success?orderId=${input.orderId}`,
      fail_url: `${envVars.BASE_URL || 'http://localhost:5000'}/api/payment/webhooks/sslcommerz/fail?orderId=${input.orderId}`,
      cancel_url: `${envVars.BASE_URL || 'http://localhost:5000'}/api/payment/webhooks/sslcommerz/cancel?orderId=${input.orderId}`,
      ipn_url: `${envVars.BASE_URL || 'http://localhost:5000'}/api/payment/webhooks/sslcommerz/ipn`,
      shipping_method: 'NO',
      product_name: input.source,
      product_category: input.source,
      product_profile: 'general',
      cus_name: input.shippingAddress?.name || 'Customer',
      cus_email: 'customer@example.com',
      cus_add1: input.shippingAddress?.line1 || 'Dhaka',
      cus_add2: input.shippingAddress?.line2 || 'Dhaka',
      cus_city: input.shippingAddress?.city || 'Dhaka',
      cus_state: input.shippingAddress?.state || 'Dhaka',
      cus_postcode: input.shippingAddress?.postcode || '1000',
      cus_country: input.shippingAddress?.country || 'Bangladesh',
      cus_phone: input.shippingAddress?.phone || '01711111111',
      cus_fax: '01711111111',
      ship_name: input.shippingAddress?.name || 'Customer',
      ship_add1: input.shippingAddress?.line1 || 'Dhaka',
      ship_add2: input.shippingAddress?.line2 || 'Dhaka',
      ship_city: input.shippingAddress?.city || 'Dhaka',
      ship_state: input.shippingAddress?.state || 'Dhaka',
      ship_postcode: input.shippingAddress?.postcode || '1000',
      ship_country: input.shippingAddress?.country || 'Bangladesh',
    };

    const sslcz = new SSLCommerzPayment(this.storeId, this.storePass, this.isLive);
    
    try {
      const apiResponse = await sslcz.init(data);
      console.log("SSLCommerz Init Response:", apiResponse);
      if (apiResponse?.GatewayPageURL) {
        return {
          sessionId: input.orderId, // We use orderId as tran_id/sessionId
          checkoutUrl: apiResponse.GatewayPageURL,
        };
      } else {
        throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to generate SSLCommerz checkout URL");
      }
    } catch (error: any) {
      console.error("SSLCommerz Init Error:", error);
      throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "SSLCommerz payment initialization failed");
    }
  }
}
