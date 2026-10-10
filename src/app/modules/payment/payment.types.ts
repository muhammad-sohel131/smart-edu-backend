export type Provider = "sslcommerz";
export type PaymentSource = "course" | "event" | "Donation";

export type CreateSessionInput = {
  provider: Provider;
  source: PaymentSource;
  userId: string;

  orderId: string;
  amount: number;
  currency: string;
  courseId?: string;
  eventId?: string;
};

export type CreateSessionResult = {
  sessionId: string;
  checkoutUrl: string | null;
  // orderId: string;
};
