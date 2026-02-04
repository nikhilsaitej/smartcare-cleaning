import Razorpay from "razorpay";
import crypto from "crypto";
import { supabase } from "./supabase";
import { auditLog } from "./security/auditLogger";

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.warn("Razorpay credentials not configured. Payment features will be disabled.");
}

const razorpay = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  : null;

const idempotencyStore = new Map<string, { result: any; expires: number }>();

setInterval(() => {
  const now = Date.now();
  const entries = Array.from(idempotencyStore.entries());
  for (let i = 0; i < entries.length; i++) {
    const [key, value] = entries[i];
    if (value.expires < now) {
      idempotencyStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export const checkIdempotency = (key: string): any | null => {
  const stored = idempotencyStore.get(key);
  if (stored && stored.expires > Date.now()) {
    return stored.result;
  }
  return null;
};

export const storeIdempotency = (key: string, result: any, ttlMs: number = 24 * 60 * 60 * 1000): void => {
  idempotencyStore.set(key, {
    result,
    expires: Date.now() + ttlMs,
  });
};

export interface CreateOrderParams {
  amount: number;
  currency?: string;
  receipt: string;
  userId: string;
  items: Array<{ productId: string; quantity: number; price: number; category?: string }>;
  tip?: number;
  address?: any;
  slot?: any;
  avoidCalling?: boolean;
  idempotencyKey: string;
}

export const createOrder = async (params: CreateOrderParams) => {
  if (!razorpay) {
    throw new Error("Payment gateway not configured");
  }

  const cached = checkIdempotency(params.idempotencyKey);
  if (cached) {
    auditLog("PAYMENT_INITIATED", { 
      type: "IDEMPOTENT_CACHE_HIT", 
      orderId: cached.id,
      userId: params.userId 
    });
    return cached;
  }

  const amountInPaise = Math.round(params.amount);

  if (amountInPaise < 100) {
    throw new Error("Amount must be at least ₹1");
  }

  const options = {
    amount: amountInPaise,
    currency: params.currency || "INR",
    receipt: params.receipt,
    notes: {
      userId: params.userId,
      idempotencyKey: params.idempotencyKey,
    },
  };

  const order = await razorpay.orders.create(options);

  const { error: dbError } = await supabase
    .from("orders")
    .insert([{
      razorpay_order_id: order.id,
      user_id: params.userId,
      amount: amountInPaise / 100,
      currency: params.currency || "INR",
      status: "created",
      items: params.items,
      tip: params.tip || 0,
      address: params.address || null,
      slot: params.slot || null,
      avoid_calling: params.avoidCalling || false,
      idempotency_key: params.idempotencyKey,
    }]);

  if (dbError) {
    console.error("Failed to save order to database:", dbError);
  }

  auditLog("PAYMENT_INITIATED", {
    orderId: order.id,
    amount: amountInPaise / 100,
    userId: params.userId,
  });

  storeIdempotency(params.idempotencyKey, order);

  return order;
};

export const verifyPaymentSignature = (
  orderId: string,
  paymentId: string,
  signature: string
): boolean => {
  if (!process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("Payment gateway not configured");
  }

  const body = orderId + "|" + paymentId;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  const isValid = crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );

  if (!isValid) {
    auditLog("PAYMENT_WEBHOOK_INVALID", {
      orderId,
      paymentId,
      reason: "Signature mismatch",
    });
  }

  return isValid;
};

export const verifyWebhookSignature = (
  body: string | Buffer,
  signature: string
): boolean => {
  if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
    console.warn("Razorpay webhook secret not configured");
    return false;
  }

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(body)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
};

export const handlePaymentSuccess = async (
  orderId: string,
  paymentId: string,
  userId: string
) => {
  const { data, error } = await supabase
    .from("orders")
    .update({
      status: "paid",
      razorpay_payment_id: paymentId,
      paid_at: new Date().toISOString(),
    })
    .eq("razorpay_order_id", orderId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    auditLog("PAYMENT_FAILURE", {
      orderId,
      paymentId,
      error: error.message,
    });
    throw error;
  }

  auditLog("PAYMENT_SUCCESS", {
    orderId,
    paymentId,
    userId,
    amount: data.amount,
  });

  return data;
};

export const handleWebhookEvent = async (event: any) => {
  const eventType = event.event;
  const payload = event.payload;

  auditLog("PAYMENT_WEBHOOK_RECEIVED", {
    eventType,
    orderId: payload?.order?.entity?.id,
    paymentId: payload?.payment?.entity?.id,
  });

  switch (eventType) {
    case "payment.captured":
      const payment = payload.payment.entity;
      await supabase
        .from("orders")
        .update({
          status: "captured",
          razorpay_payment_id: payment.id,
          captured_at: new Date().toISOString(),
        })
        .eq("razorpay_order_id", payment.order_id);
      break;

    case "payment.failed":
      const failedPayment = payload.payment.entity;
      await supabase
        .from("orders")
        .update({
          status: "failed",
          failure_reason: failedPayment.error_description,
        })
        .eq("razorpay_order_id", failedPayment.order_id);
      
      auditLog("PAYMENT_FAILURE", {
        orderId: failedPayment.order_id,
        reason: failedPayment.error_description,
      });
      break;

    case "refund.created":
      const refund = payload.refund.entity;
      await supabase
        .from("orders")
        .update({
          status: "refunded",
          refund_id: refund.id,
          refunded_at: new Date().toISOString(),
        })
        .eq("razorpay_payment_id", refund.payment_id);
      break;

    default:
      console.log("Unhandled webhook event:", eventType);
  }
};

export const getRazorpayKeyId = (): string | null => {
  return process.env.RAZORPAY_KEY_ID || null;
};

export const fetchOrderStatus = async (orderId: string): Promise<{ status: string; amount_paid: number } | null> => {
  if (!razorpay) {
    return null;
  }
  
  try {
    const order = await razorpay.orders.fetch(orderId);
    return {
      status: order.status,
      amount_paid: order.amount_paid
    };
  } catch (error) {
    console.error("Error fetching Razorpay order:", error);
    return null;
  }
};
