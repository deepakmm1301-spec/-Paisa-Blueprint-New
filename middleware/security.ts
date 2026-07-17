import { Request, Response, NextFunction } from "express";
import helmet from "helmet";
import { sanitizeInput } from "../utils/sanitizer";
import { env } from "../config/env";

/**
 * Configure helmet with custom rules that won't break the sandboxed preview iframe.
 */
export const helmetMiddleware = helmet({
  contentSecurityPolicy: false, // Vite uses style tags, dynamic scripts, and remote CDNs
  frameguard: false, // Absolutely necessary for AI Studio preview iframe compatibility
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
});

/**
 * Direct CORS handler middleware.
 */
export function corsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const origin = req.headers.origin;
  
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    // If no Origin header (standard same-origin request), derive from the Host header or fallback
    const host = req.headers.host;
    const protocol = req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
    if (host) {
      res.setHeader("Access-Control-Allow-Origin", `${protocol}://${host}`);
    } else {
      res.setHeader("Access-Control-Allow-Origin", "https://www.paisablueprint.in");
    }
  }

  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
    return;
  }
  next();
}

/**
 * XSS Protection & Input Sanitizer Middleware.
 * Recursively sanitizes body, query parameters, and route parameters.
 */
export function sanitizeRequestMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (req.body) {
    req.body = sanitizeInput(req.body);
  }
  if (req.query) {
    req.query = sanitizeInput(req.query);
  }
  if (req.params) {
    req.params = sanitizeInput(req.params);
  }
  next();
}
