import { Request, Response, NextFunction } from "express";
import { auditLog } from "./auditLogger";

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const sanitizeErrorMessage = (message: string): string => {
  const sensitivePatterns = [
    /password/gi,
    /secret/gi,
    /key/gi,
    /token/gi,
    /credential/gi,
    /api_key/gi,
    /apikey/gi,
    /database/gi,
    /connection/gi,
    /postgres/gi,
    /supabase/gi,
    /jwt/gi
  ];

  let sanitized = message;
  for (const pattern of sensitivePatterns) {
    if (pattern.test(sanitized)) {
      return "An error occurred. Please try again.";
    }
  }
  
  return sanitized.length > 200 ? sanitized.substring(0, 200) : sanitized;
};

const getClientMessage = (statusCode: number, originalMessage?: string): string => {
  const messages: Record<number, string> = {
    400: "Invalid request. Please check your input.",
    401: "Authentication required. Please log in.",
    403: "You don't have permission to access this resource.",
    404: "The requested resource was not found.",
    409: "A conflict occurred. Please try again.",
    413: "Request too large.",
    429: "Too many requests. Please slow down.",
    500: "Something went wrong. Please try again later.",
    502: "Service temporarily unavailable.",
    503: "Service temporarily unavailable."
  };

  if (originalMessage && statusCode < 500) {
    return sanitizeErrorMessage(originalMessage);
  }
  
  return messages[statusCode] || "An error occurred. Please try again.";
};

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let clientMessage = "Something went wrong. Please try again later.";
  
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    clientMessage = getClientMessage(statusCode, err.message);
  } else if ((err as any).statusCode) {
    statusCode = (err as any).statusCode;
    clientMessage = getClientMessage(statusCode);
  } else if ((err as any).status) {
    statusCode = (err as any).status;
    clientMessage = getClientMessage(statusCode);
  }

  console.error(`[ERROR] ${req.method} ${req.path}`, {
    message: err.message,
    stack: err.stack,
    statusCode,
    timestamp: new Date().toISOString()
  });

  if (statusCode >= 500) {
    auditLog("SECURITY_EVENT", {
      type: "SERVER_ERROR",
      path: req.path,
      method: req.method,
      errorMessage: err.message.substring(0, 100)
    });
  }

  if (res.headersSent) {
    return next(err);
  }

  return res.status(statusCode).json({
    error: clientMessage,
    ...(process.env.NODE_ENV === "development" && statusCode < 500 ? { 
      debug: err.message 
    } : {})
  });
};

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({ error: "Not found" });
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
