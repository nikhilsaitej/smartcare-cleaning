type AuditEventType = 
  | "AUTH_FAILURE"
  | "AUTH_SUCCESS"
  | "AUTH_ERROR"
  | "ADMIN_ACCESS_GRANTED"
  | "ADMIN_ACCESS_DENIED"
  | "ADMIN_AUTH_ERROR"
  | "IDOR_ATTEMPT"
  | "RATE_LIMIT_AUTH"
  | "RATE_LIMIT_OTP"
  | "RATE_LIMIT_CHECKOUT"
  | "VALIDATION_FAILURE"
  | "PAYMENT_INITIATED"
  | "PAYMENT_SUCCESS"
  | "PAYMENT_FAILURE"
  | "PAYMENT_WEBHOOK_RECEIVED"
  | "PAYMENT_WEBHOOK_INVALID"
  | "ORDER_CREATED"
  | "ORDER_STATUS_CHANGED"
  | "BOOKING_CREATED"
  | "PRODUCT_CREATED"
  | "PRODUCT_UPDATED"
  | "PRODUCT_DELETED"
  | "SERVICE_CREATED"
  | "SERVICE_UPDATED"
  | "SERVICE_DELETED"
  | "SUSPICIOUS_ACTIVITY"
  | "SECURITY_EVENT";

interface AuditLogEntry {
  timestamp: string;
  eventType: AuditEventType;
  data: Record<string, any>;
  severity: "INFO" | "WARNING" | "CRITICAL";
}

const getSeverity = (eventType: AuditEventType): "INFO" | "WARNING" | "CRITICAL" => {
  const criticalEvents: AuditEventType[] = [
    "IDOR_ATTEMPT",
    "PAYMENT_FAILURE",
    "PAYMENT_WEBHOOK_INVALID",
    "SUSPICIOUS_ACTIVITY"
  ];
  
  const warningEvents: AuditEventType[] = [
    "AUTH_FAILURE",
    "ADMIN_ACCESS_DENIED",
    "RATE_LIMIT_AUTH",
    "RATE_LIMIT_OTP",
    "VALIDATION_FAILURE"
  ];
  
  if (criticalEvents.includes(eventType)) return "CRITICAL";
  if (warningEvents.includes(eventType)) return "WARNING";
  return "INFO";
};

const formatLogEntry = (entry: AuditLogEntry): string => {
  const severityColors: Record<string, string> = {
    INFO: "\x1b[34m",
    WARNING: "\x1b[33m",
    CRITICAL: "\x1b[31m"
  };
  const reset = "\x1b[0m";
  const color = severityColors[entry.severity] || "";
  
  return `${color}[${entry.timestamp}] [${entry.severity}] ${entry.eventType}${reset} ${JSON.stringify(entry.data)}`;
};

export const auditLog = (
  eventType: AuditEventType, 
  data: Record<string, any> = {}
): void => {
  const entry: AuditLogEntry = {
    timestamp: new Date().toISOString(),
    eventType,
    data: {
      ...data,
      ip: data.ip ? maskIP(data.ip) : undefined
    },
    severity: getSeverity(eventType)
  };
  
  console.log(formatLogEntry(entry));
  
  if (entry.severity === "CRITICAL") {
    console.error(`🚨 CRITICAL SECURITY EVENT: ${eventType}`, JSON.stringify(entry.data));
  }
};

const maskIP = (ip: string): string => {
  if (!ip) return "unknown";
  const parts = ip.split(".");
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.*.*`;
  }
  return ip.substring(0, Math.min(ip.length, 20)) + "...";
};

export const createRequestLogger = () => {
  return (req: any, res: any, next: any) => {
    const start = Date.now();
    
    res.on("finish", () => {
      const duration = Date.now() - start;
      const logLevel = res.statusCode >= 400 ? "WARNING" : "INFO";
      
      if (req.path.startsWith("/api")) {
        const entry = {
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          duration: `${duration}ms`,
          ip: maskIP(req.ip),
          userId: req.user?.id
        };
        
        if (logLevel === "WARNING") {
          console.warn(`[REQUEST] ${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
        }
      }
    });
    
    next();
  };
};
