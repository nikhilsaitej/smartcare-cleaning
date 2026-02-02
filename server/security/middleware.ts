import { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import { supabase } from "../supabase";

type AuditEventType = string;
const auditLog = (eventType: AuditEventType, data: Record<string, any> = {}): void => {
  const timestamp = new Date().toISOString();
  console.log(`[AUDIT] [${timestamp}] ${eventType}`, JSON.stringify(data));
};

const ADMIN_EMAIL = "smartcarecleaningsolutions@gmail.com";

export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    const token = authHeader.split(" ")[1];
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      auditLog("AUTH_FAILURE", { reason: "Invalid token", ip: req.ip });
      return res.status(401).json({ error: "Invalid or expired session" });
    }
    
    (req as any).user = user;
    (req as any).token = token;
    next();
  } catch (error) {
    auditLog("AUTH_ERROR", { error: String(error), ip: req.ip });
    return res.status(500).json({ error: "Authentication failed" });
  }
};

export const verifyAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      auditLog("ADMIN_ACCESS_DENIED", { reason: "No token", ip: req.ip, path: req.path });
      return res.status(401).json({ error: "Authentication required" });
    }
    
    const token = authHeader.split(" ")[1];
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      auditLog("ADMIN_ACCESS_DENIED", { reason: "Invalid token", ip: req.ip, path: req.path });
      return res.status(401).json({ error: "Invalid or expired session" });
    }
    
    if (user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      auditLog("ADMIN_ACCESS_DENIED", { 
        reason: "Not admin email", 
        attemptedBy: user.email, 
        ip: req.ip, 
        path: req.path 
      });
      return res.status(403).json({ error: "Access denied" });
    }
    
    auditLog("ADMIN_ACCESS_GRANTED", { adminEmail: user.email, path: req.path, ip: req.ip });
    (req as any).user = user;
    (req as any).isAdmin = true;
    next();
  } catch (error) {
    auditLog("ADMIN_AUTH_ERROR", { error: String(error), ip: req.ip });
    return res.status(500).json({ error: "Authentication failed" });
  }
};

export const verifyUserOwnership = (userIdParam: string = "user_id") => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const token = authHeader.split(" ")[1];
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (error || !user) {
        return res.status(401).json({ error: "Invalid or expired session" });
      }
      
      const requestedUserId = req.query[userIdParam] || req.body[userIdParam] || req.params[userIdParam];
      
      if (requestedUserId && requestedUserId !== user.id) {
        auditLog("IDOR_ATTEMPT", { 
          attackerUserId: user.id, 
          targetUserId: requestedUserId, 
          path: req.path,
          ip: req.ip 
        });
        return res.status(403).json({ error: "Access denied" });
      }
      
      (req as any).user = user;
      next();
    } catch (error) {
      return res.status(500).json({ error: "Authorization failed" });
    }
  };
};

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Too many attempts. Please try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    auditLog("RATE_LIMIT_AUTH", { ip: req.ip, path: req.path });
    res.status(429).json({ error: "Too many attempts. Please try again in 15 minutes." });
  }
});

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { error: "Too many requests. Please slow down." },
  standardHeaders: true,
  legacyHeaders: false
});

export const strictLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: "Rate limit exceeded." },
  standardHeaders: true,
  legacyHeaders: false
});

export const otpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { error: "Too many OTP requests. Please try again in 1 hour." },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    auditLog("RATE_LIMIT_OTP", { ip: req.ip, phone: req.body?.phone });
    res.status(429).json({ error: "Too many OTP requests. Please try again in 1 hour." });
  }
});

export const checkoutLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: { error: "Too many checkout attempts." },
  standardHeaders: true,
  legacyHeaders: false
});

export const adminLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { error: "Too many admin requests." },
  standardHeaders: true,
  legacyHeaders: false
});

export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  const sanitize = (obj: any): any => {
    if (typeof obj === 'string') {
      return obj
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+=/gi, '')
        .trim()
        .slice(0, 10000);
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const key of Object.keys(obj)) {
        if (!key.startsWith('__') && !key.startsWith('$')) {
          sanitized[key] = sanitize(obj[key]);
        }
      }
      return sanitized;
    }
    return obj;
  };

  if (req.body) {
    req.body = sanitize(req.body);
  }
  next();
};

export const requestSizeLimit = (maxBytes: number = 1024 * 100) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);
    if (contentLength > maxBytes) {
      return res.status(413).json({ error: "Request too large" });
    }
    next();
  };
};
