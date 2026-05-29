import z from "zod";

export const courseParamZod = z.object({ courseId: z.string().min(1) });

export const checkoutBodyZod = z.object({
  provider: z.enum(["sslcommerz"]),
  couponCode: z.string().optional()
});
