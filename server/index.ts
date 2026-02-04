import express, { type Request, Response, NextFunction } from "express";
import helmet from "helmet";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { errorHandler, notFoundHandler } from "./security/errorHandler";
import { sanitizeInput, requestSizeLimit } from "./security/middleware";
import { createRequestLogger } from "./security/auditLogger";

const app = express();
app.set("trust proxy", 1);
const httpServer = createServer(app);

const ALLOWED_ORIGINS = [
  "https://website-aesthetic-builder.replit.app",
  "https://smartcare-cleaning.replit.app",
  process.env.NODE_ENV === "development" ? "http://localhost:5000" : null,
  process.env.NODE_ENV === "development" ? "http://0.0.0.0:5000" : null
].filter(Boolean) as string[];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  } else if (process.env.NODE_ENV === "development") {
    res.header("Access-Control-Allow-Origin", "*");
  }
  
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,PATCH,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Max-Age", "86400");
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

const isDev = process.env.NODE_ENV !== "production";

app.use(helmet({
  contentSecurityPolicy: isDev ? false : {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://*.supabase.co", "https://checkout.razorpay.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "https://*.supabase.co", "wss://*.supabase.co", "ws:", "https://lumberjack.razorpay.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'self'", "https://api.razorpay.com"],
      workerSrc: ["'self'", "blob:"],
      formAction: ["'self'"]
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: isDev ? false : {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  xContentTypeOptions: true,
  xFrameOptions: { action: "sameorigin" },
  xXssProtection: true
}));

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(requestSizeLimit(1024 * 500));

app.use(
  express.json({
    limit: "500kb",
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false, limit: "500kb" }));

app.use(sanitizeInput);

app.use(createRequestLogger());

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

(async () => {
  await registerRoutes(httpServer, app);

  app.use(errorHandler);

  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
