import { z } from "zod";
import { Request, Response, NextFunction } from "express";

const phoneRegex = /^[+]?[\d\s\-()]{10,20}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const schemas = {
  sendOtp: z.object({
    phone: z.string().min(10).max(20).regex(phoneRegex, "Invalid phone number format")
  }),

  verifyOtp: z.object({
    phone: z.string().min(10).max(20).regex(phoneRegex, "Invalid phone number format"),
    otp: z.string().length(6).regex(/^\d{6}$/, "OTP must be 6 digits")
  }),

  signupSuccess: z.object({
    email: z.string().email().max(255)
  }),

  passwordReset: z.object({
    email: z.string().email().max(255),
    resetLink: z.string().url().max(500)
  }),

  booking: z.object({
    name: z.string().min(1).max(100).trim(),
    phone: z.string().regex(phoneRegex).optional(),
    email: z.string().email().max(255).optional(),
    service_name: z.string().min(1).max(100).optional(),
    date: z.string().max(50).optional(),
    time_slot: z.string().max(50).optional(),
    address: z.string().max(500).optional(),
    user_id: z.string().uuid().optional()
  }).refine(data => data.phone || data.email, {
    message: "Either phone or email is required"
  }),

  contact: z.object({
    name: z.string().min(1).max(100).trim(),
    email: z.string().email().max(255),
    message: z.string().min(1).max(2000).trim()
  }),

  cartAdd: z.object({
    user_id: z.string().uuid(),
    product_id: z.string().uuid(),
    quantity: z.number().int().min(1).max(100)
  }),

  cartUpdate: z.object({
    quantity: z.number().int().min(1).max(100)
  }),

  product: z.object({
    name: z.string().min(1).max(200).trim(),
    description: z.string().max(2000).optional(),
    price: z.number().positive().max(1000000),
    image_url: z.string().url().max(500).optional().nullable(),
    category: z.string().max(100).optional(),
    stock: z.number().int().min(0).max(100000).optional(),
    original_price: z.number().positive().max(1000000).optional(),
    is_bestseller: z.boolean().optional()
  }),

  productUpdate: z.object({
    name: z.string().min(1).max(200).trim().optional(),
    description: z.string().max(2000).optional(),
    price: z.number().positive().max(1000000).optional(),
    image_url: z.string().url().max(500).optional().nullable(),
    category: z.string().max(100).optional(),
    stock: z.number().int().min(0).max(100000).optional(),
    original_price: z.number().positive().max(1000000).optional().nullable(),
    is_bestseller: z.boolean().optional()
  }),

  service: z.object({
    name: z.string().min(1).max(200).trim(),
    description: z.string().max(2000).optional(),
    price: z.number().positive().max(1000000),
    duration: z.string().max(50).optional(),
    image_url: z.string().url().max(500).optional().nullable(),
    category: z.string().max(100).optional()
  }),

  serviceUpdate: z.object({
    name: z.string().min(1).max(200).trim().optional(),
    description: z.string().max(2000).optional(),
    price: z.number().positive().max(1000000).optional(),
    duration: z.string().max(50).optional(),
    image_url: z.string().url().max(500).optional().nullable(),
    category: z.string().max(100).optional()
  }),

  bookingStatusUpdate: z.object({
    status: z.enum(["pending", "confirmed", "in_progress", "completed", "cancelled"])
  }),

  uuidParam: z.object({
    id: z.string().uuid()
  }),

  userIdQuery: z.object({
    user_id: z.string().uuid().optional()
  }),

  createOrder: z.object({
    items: z.array(z.object({
      productId: z.string(),
      name: z.string().min(1).max(200),
      quantity: z.number().int().min(1).max(100),
      price: z.number().positive(),
      category: z.string().optional()
    })).min(1).max(50),
    tip: z.number().min(0).max(10000).optional(),
    address: z.any().optional(),
    slot: z.any().optional(),
    avoidCalling: z.boolean().optional(),
    idempotencyKey: z.string().min(10).max(100)
  }),

  verifyPayment: z.object({
    razorpay_order_id: z.string().min(1).max(100),
    razorpay_payment_id: z.string().min(1).max(100),
    razorpay_signature: z.string().min(1).max(200)
  })
};

export const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.body);
      if (!result.success) {
        const errors = result.error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }));
        return res.status(400).json({ 
          error: "Validation failed", 
          details: errors 
        });
      }
      req.body = result.data;
      next();
    } catch (error) {
      return res.status(400).json({ error: "Invalid request data" });
    }
  };
};

export const validateParams = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.params);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid parameters" });
      }
      next();
    } catch (error) {
      return res.status(400).json({ error: "Invalid parameters" });
    }
  };
};

export const validateQuery = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.query);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid query parameters" });
      }
      next();
    } catch (error) {
      return res.status(400).json({ error: "Invalid query parameters" });
    }
  };
};
