import type { Express, Request, Response } from "express";
import { type Server } from "http";
import { supabase } from "./supabase";
import { sendContactConfirmationEmail, sendBookingConfirmationEmail, sendWelcomeEmail, sendPasswordResetEmail } from "./resend";
import { sendBookingSMS, sendBookingWhatsApp, sendOTP } from "./twilio";
import { 
  verifyAdmin, 
  verifyToken, 
  verifyUserOwnership,
  authLimiter, 
  otpLimiter,
  strictLimiter,
  adminLimiter,
  checkoutLimiter
} from "./security/middleware";
import { 
  createOrder, 
  verifyPaymentSignature, 
  verifyWebhookSignature, 
  handlePaymentSuccess, 
  handleWebhookEvent,
  getRazorpayKeyId 
} from "./razorpay";
import { getCloudinarySignature } from "./cloudinary";
import { schemas, validate, validateParams, validateQuery } from "./security/validation";
import { asyncHandler } from "./security/errorHandler";
import { auditLog } from "./security/auditLogger";

const otpStore = new Map<string, { otp: string; expires: number; attempts: number }>();

const cleanExpiredOTPs = () => {
  const now = Date.now();
  const entries = Array.from(otpStore.entries());
  for (let i = 0; i < entries.length; i++) {
    const [key, value] = entries[i];
    if (value.expires < now) {
      otpStore.delete(key);
    }
  }
};

setInterval(cleanExpiredOTPs, 5 * 60 * 1000);

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.post("/api/auth/send-otp", otpLimiter, validate(schemas.sendOtp), asyncHandler(async (req: Request, res: Response) => {
    const { phone } = req.body;
    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 10 * 60 * 1000;
    
    otpStore.set(phone, { otp, expires, attempts: 0 });
    
    await sendOTP(phone, otp);
    
    auditLog("AUTH_SUCCESS", { action: "OTP_SENT", phone: phone.slice(-4) });
    res.json({ success: true, message: "OTP sent successfully" });
  }));

  app.post("/api/auth/verify-otp", authLimiter, validate(schemas.verifyOtp), asyncHandler(async (req: Request, res: Response) => {
    const { phone, otp } = req.body;
    
    const stored = otpStore.get(phone);
    
    if (!stored) {
      return res.status(400).json({ error: "No OTP found. Please request a new one." });
    }
    
    if (stored.expires < Date.now()) {
      otpStore.delete(phone);
      return res.status(400).json({ error: "OTP expired. Please request a new one." });
    }
    
    stored.attempts++;
    if (stored.attempts > 3) {
      otpStore.delete(phone);
      auditLog("AUTH_FAILURE", { reason: "OTP_MAX_ATTEMPTS", phone: phone.slice(-4) });
      return res.status(400).json({ error: "Too many attempts. Please request a new OTP." });
    }
    
    if (stored.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }
    
    otpStore.delete(phone);
    auditLog("AUTH_SUCCESS", { action: "OTP_VERIFIED", phone: phone.slice(-4) });
    res.json({ success: true, verified: true });
  }));

  app.get("/api/config", (req: Request, res: Response) => {
    res.json({
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY
    });
  });

  app.post("/api/auth/signup-success", authLimiter, validate(schemas.signupSuccess), asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    await sendWelcomeEmail(email);
    auditLog("AUTH_SUCCESS", { action: "SIGNUP", email: email.split("@")[0] + "@***" });
    res.json({ success: true });
  }));

  app.post("/api/auth/password-reset", authLimiter, validate(schemas.passwordReset), asyncHandler(async (req: Request, res: Response) => {
    const { email, resetLink } = req.body;
    await sendPasswordResetEmail(email, resetLink);
    res.json({ success: true });
  }));

  app.get("/api/products", asyncHandler(async (req: Request, res: Response) => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) throw error;
    res.json(data || []);
  }));

  app.get("/api/services", asyncHandler(async (req: Request, res: Response) => {
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) throw error;
    res.json(data || []);
  }));

  app.post("/api/bookings", strictLimiter, validate(schemas.booking), asyncHandler(async (req: Request, res: Response) => {
    const { name, phone, email, service_name, date, time_slot, address, user_id } = req.body;
    
    const { data, error } = await supabase
      .from("bookings")
      .insert([{ name, phone, email, service_name, date, time_slot, address, user_id }])
      .select()
      .single();
    
    if (error) throw error;
    
    auditLog("BOOKING_CREATED", { bookingId: data.id, service: service_name });
    
    if (email) {
      sendBookingConfirmationEmail(email, name, service_name || 'Cleaning Service', date || 'To be confirmed').catch(console.error);
    }
    if (phone) {
      sendBookingSMS(phone, name, service_name || 'Cleaning Service', date || 'To be confirmed').catch(console.error);
      sendBookingWhatsApp(phone, name, service_name || 'Cleaning Service', date || 'To be confirmed').catch(console.error);
    }
    
    res.json(data);
  }));

  app.get("/api/bookings", verifyToken, verifyUserOwnership("user_id"), asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user;
    
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    
    if (error) throw error;
    res.json(data || []);
  }));

  app.post("/api/contacts", strictLimiter, validate(schemas.contact), asyncHandler(async (req: Request, res: Response) => {
    const { name, email, message } = req.body;
    
    let savedToDb = false;
    try {
      const { error } = await supabase
        .from("contacts")
        .insert([{ name, email, message }]);
      
      if (!error) savedToDb = true;
    } catch (dbError) {
      console.log("Database save skipped:", dbError);
    }
    
    sendContactConfirmationEmail(email, name).catch(console.error);
    
    res.json({ 
      success: true, 
      message: "Contact form submitted successfully"
    });
  }));

  app.get("/api/cart", verifyToken, verifyUserOwnership("user_id"), asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user;
    
    const { data, error } = await supabase
      .from("cart_items")
      .select("*, products(*)")
      .eq("user_id", user.id);
    
    if (error) throw error;
    res.json(data || []);
  }));

  app.post("/api/cart", verifyToken, validate(schemas.cartAdd), asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user;
    const { product_id, quantity } = req.body;
    
    if (req.body.user_id !== user.id) {
      auditLog("IDOR_ATTEMPT", { attackerId: user.id, targetId: req.body.user_id, action: "cart_add" });
      return res.status(403).json({ error: "Access denied" });
    }
    
    const { data: existing } = await supabase
      .from("cart_items")
      .select("*")
      .eq("user_id", user.id)
      .eq("product_id", product_id)
      .single();
    
    if (existing) {
      const newQuantity = Math.min(existing.quantity + quantity, 100);
      const { data, error } = await supabase
        .from("cart_items")
        .update({ quantity: newQuantity })
        .eq("id", existing.id)
        .select()
        .single();
      
      if (error) throw error;
      res.json(data);
    } else {
      const { data, error } = await supabase
        .from("cart_items")
        .insert([{ user_id: user.id, product_id, quantity: Math.min(quantity, 100) }])
        .select()
        .single();
      
      if (error) throw error;
      res.json(data);
    }
  }));

  app.patch("/api/cart/:id", verifyToken, validateParams(schemas.uuidParam), validate(schemas.cartUpdate), asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user;
    
    const { data: cartItem } = await supabase
      .from("cart_items")
      .select("user_id")
      .eq("id", req.params.id)
      .single();
    
    if (!cartItem || cartItem.user_id !== user.id) {
      return res.status(403).json({ error: "Access denied" });
    }
    
    const { data, error } = await supabase
      .from("cart_items")
      .update({ quantity: Math.min(req.body.quantity, 100) })
      .eq("id", req.params.id)
      .select()
      .single();
    
    if (error) throw error;
    res.json(data);
  }));

  app.delete("/api/cart/:id", verifyToken, validateParams(schemas.uuidParam), asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user;
    
    const { data: cartItem } = await supabase
      .from("cart_items")
      .select("user_id")
      .eq("id", req.params.id)
      .single();
    
    if (!cartItem || cartItem.user_id !== user.id) {
      return res.status(403).json({ error: "Access denied" });
    }
    
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", req.params.id);
    
    if (error) throw error;
    res.json({ success: true });
  }));

  app.get("/api/admin/contacts", adminLimiter, verifyAdmin, asyncHandler(async (req: Request, res: Response) => {
    const { data, error } = await supabase
      .from("contacts")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) return res.json([]);
    res.json(data || []);
  }));

  app.delete("/api/admin/contacts/:id", adminLimiter, verifyAdmin, validateParams(schemas.uuidParam), asyncHandler(async (req: Request, res: Response) => {
    const admin = (req as any).user;
    
    const { error } = await supabase
      .from("contacts")
      .delete()
      .eq("id", req.params.id);
    
    if (error) throw error;
    
    auditLog("SECURITY_EVENT", { action: "CONTACT_DELETED", contactId: req.params.id, adminEmail: admin.email });
    res.json({ success: true });
  }));

  app.get("/api/admin/bookings", adminLimiter, verifyAdmin, asyncHandler(async (req: Request, res: Response) => {
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) return res.json([]);
    res.json(data || []);
  }));

  app.patch("/api/admin/bookings/:id", adminLimiter, verifyAdmin, validateParams(schemas.uuidParam), validate(schemas.bookingStatusUpdate), asyncHandler(async (req: Request, res: Response) => {
    const admin = (req as any).user;
    
    const { data, error } = await supabase
      .from("bookings")
      .update({ status: req.body.status })
      .eq("id", req.params.id)
      .select()
      .single();
    
    if (error) throw error;
    
    auditLog("ORDER_STATUS_CHANGED", { bookingId: req.params.id, newStatus: req.body.status, adminEmail: admin.email });
    res.json(data);
  }));

  app.delete("/api/admin/bookings/:id", adminLimiter, verifyAdmin, validateParams(schemas.uuidParam), asyncHandler(async (req: Request, res: Response) => {
    const admin = (req as any).user;
    
    const { error } = await supabase
      .from("bookings")
      .delete()
      .eq("id", req.params.id);
    
    if (error) throw error;
    
    auditLog("SECURITY_EVENT", { action: "BOOKING_DELETED", bookingId: req.params.id, adminEmail: admin.email });
    res.json({ success: true });
  }));

  app.get("/api/admin/products", adminLimiter, verifyAdmin, asyncHandler(async (req: Request, res: Response) => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) return res.json([]);
    res.json(data || []);
  }));

  app.post("/api/admin/products", adminLimiter, verifyAdmin, validate(schemas.product), asyncHandler(async (req: Request, res: Response) => {
    const admin = (req as any).user;
    
    const { data, error } = await supabase
      .from("products")
      .insert([req.body])
      .select()
      .single();
    
    if (error) throw error;
    
    auditLog("PRODUCT_CREATED", { productId: data.id, productName: data.name, adminEmail: admin.email });
    res.json(data);
  }));

  app.patch("/api/admin/products/:id", adminLimiter, verifyAdmin, validateParams(schemas.uuidParam), validate(schemas.productUpdate), asyncHandler(async (req: Request, res: Response) => {
    const admin = (req as any).user;
    
    const { data, error } = await supabase
      .from("products")
      .update(req.body)
      .eq("id", req.params.id)
      .select()
      .single();
    
    if (error) throw error;
    
    auditLog("PRODUCT_UPDATED", { productId: req.params.id, adminEmail: admin.email });
    res.json(data);
  }));

  app.delete("/api/admin/products/:id", adminLimiter, verifyAdmin, validateParams(schemas.uuidParam), asyncHandler(async (req: Request, res: Response) => {
    const admin = (req as any).user;
    
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", req.params.id);
    
    if (error) throw error;
    
    auditLog("PRODUCT_DELETED", { productId: req.params.id, adminEmail: admin.email });
    res.json({ success: true });
  }));

  app.get("/api/admin/services", adminLimiter, verifyAdmin, asyncHandler(async (req: Request, res: Response) => {
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) return res.json([]);
    res.json(data || []);
  }));

  app.post("/api/admin/services", adminLimiter, verifyAdmin, validate(schemas.service), asyncHandler(async (req: Request, res: Response) => {
    const admin = (req as any).user;
    
    const { data, error } = await supabase
      .from("services")
      .insert([req.body])
      .select()
      .single();
    
    if (error) throw error;
    
    auditLog("SERVICE_CREATED", { serviceId: data.id, serviceName: data.name, adminEmail: admin.email });
    res.json(data);
  }));

  app.patch("/api/admin/services/:id", adminLimiter, verifyAdmin, validateParams(schemas.uuidParam), validate(schemas.serviceUpdate), asyncHandler(async (req: Request, res: Response) => {
    const admin = (req as any).user;
    
    const { data, error } = await supabase
      .from("services")
      .update(req.body)
      .eq("id", req.params.id)
      .select()
      .single();
    
    if (error) throw error;
    
    auditLog("SERVICE_UPDATED", { serviceId: req.params.id, adminEmail: admin.email });
    res.json(data);
  }));

  app.delete("/api/admin/services/:id", adminLimiter, verifyAdmin, validateParams(schemas.uuidParam), asyncHandler(async (req: Request, res: Response) => {
    const admin = (req as any).user;
    
    const { error } = await supabase
      .from("services")
      .delete()
      .eq("id", req.params.id);
    
    if (error) throw error;
    
    auditLog("SERVICE_DELETED", { serviceId: req.params.id, adminEmail: admin.email });
    res.json({ success: true });
  }));

  app.get("/api/payment/config", verifyToken, (req: Request, res: Response) => {
    const keyId = getRazorpayKeyId();
    if (!keyId) {
      return res.status(503).json({ error: "Payment gateway not configured" });
    }
    res.json({ keyId });
  });

  app.post("/api/payment/create-order", checkoutLimiter, verifyToken, validate(schemas.createOrder), asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user;
    const { items, tip, idempotencyKey } = req.body;

    let subtotalAmount = 0;
    for (const item of items) {
      subtotalAmount += item.price * item.quantity;
    }

    // Calculate additional costs matching Checkout.tsx
    const taxes = Math.round(subtotalAmount * 0.05);
    const platformFee = 10;
    const hasServices = items.some((item: any) => item.category === "Service");
    const hasProducts = items.some((item: any) => item.category !== "Service");
    const isProductsOnly = hasProducts && !hasServices;
    const deliveryFee = subtotalAmount > 1000 ? 0 : (isProductsOnly ? 40 : 50);
    const tipAmount = tip || 0;

    const totalAmount = (subtotalAmount + taxes + platformFee + deliveryFee + tipAmount) * 100;

    const order = await createOrder({
      amount: totalAmount,
      currency: "INR",
      receipt: `order_${Date.now()}`,
      userId: user.id,
      items,
      idempotencyKey,
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  }));

  app.post("/api/payment/verify", checkoutLimiter, verifyToken, validate(schemas.verifyPayment), asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const isValid = verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);

    if (!isValid) {
      auditLog("PAYMENT_FAILURE", {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        userId: user.id,
        reason: "Invalid signature",
      });
      return res.status(400).json({ error: "Payment verification failed" });
    }

    const order = await handlePaymentSuccess(razorpay_order_id, razorpay_payment_id, user.id);

    res.json({ 
      success: true, 
      orderId: order.id,
      message: "Payment verified successfully" 
    });
  }));

  app.post("/api/payment/webhook", asyncHandler(async (req: Request, res: Response) => {
    const signature = req.headers["x-razorpay-signature"] as string;
    
    if (!signature) {
      auditLog("PAYMENT_WEBHOOK_INVALID", { reason: "Missing signature" });
      return res.status(400).json({ error: "Missing signature" });
    }

    const rawBody = (req as any).rawBody;
    const isValid = verifyWebhookSignature(rawBody, signature);

    if (!isValid) {
      auditLog("PAYMENT_WEBHOOK_INVALID", { reason: "Invalid signature" });
      return res.status(400).json({ error: "Invalid signature" });
    }

    await handleWebhookEvent(req.body);

    res.json({ status: "ok" });
  }));

  app.get("/api/orders", verifyToken, asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user;
    
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    
    if (error) throw error;
    res.json(data || []);
  }));

  app.get("/api/admin/orders", adminLimiter, verifyAdmin, asyncHandler(async (req: Request, res: Response) => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) return res.json([]);
    res.json(data || []);
  }));

  app.get("/api/admin/stats", adminLimiter, verifyAdmin, asyncHandler(async (req: Request, res: Response) => {
    const [contactsRes, bookingsRes, productsRes, servicesRes, ordersRes] = await Promise.all([
      supabase.from("contacts").select("*", { count: "exact", head: true }),
      supabase.from("bookings").select("*", { count: "exact", head: true }),
      supabase.from("products").select("*", { count: "exact", head: true }),
      supabase.from("services").select("*", { count: "exact", head: true }),
      supabase.from("orders").select("*", { count: "exact", head: true }),
    ]);

    res.json({
      contacts: contactsRes.count || 0,
      bookings: bookingsRes.count || 0,
      products: productsRes.count || 0,
      services: servicesRes.count || 0,
      orders: ordersRes.count || 0,
      integrations: {
        supabase: { status: "connected" },
        resend: { status: "connected" },
        twilio: { status: "connected" },
        razorpay: { status: getRazorpayKeyId() ? "connected" : "not_configured" },
        cloudinary: { status: process.env.CLOUDINARY_CLOUD_NAME ? "connected" : "not_configured" },
      }
    });
  }));

  app.get("/api/upload/signature", verifyAdmin, (req: Request, res: Response) => {
    try {
      const folder = req.query.folder as string || 'smartcare';
      const signatureData = getCloudinarySignature(folder);
      res.json(signatureData);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate upload signature" });
    }
  });

  return httpServer;
}
