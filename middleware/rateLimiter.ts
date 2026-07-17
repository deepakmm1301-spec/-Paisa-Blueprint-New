import rateLimit from "express-rate-limit";
import { logger } from "../utils/logger";

/**
 * General API Rate Limiter
 * 300 requests every 15 minutes
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  message: {
    error: "Too many requests from this client. Please try again after 15 minutes."
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res, next, options) => {
    logger.warn(`Rate limit triggered for general API: ${req.ip} -> ${req.originalUrl}`);
    res.status(options.statusCode).send(options.message);
  }
});

/**
 * High-Resource Route Rate Limiter (Chat / Heavy operations)
 * 30 requests per minute
 */
export const heavyLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30,
  message: {
    error: "Too many heavy operations request. Please try again in a minute."
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    logger.warn(`Heavy rate limit triggered: ${req.ip} -> ${req.originalUrl}`);
    res.status(options.statusCode).send(options.message);
  }
});
