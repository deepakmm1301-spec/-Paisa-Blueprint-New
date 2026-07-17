import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

/**
 * Request logger middleware to track application access and API performance.
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms [IP: ${req.ip}]`);
  });
  next();
}

/**
 * Handle missing/invalid routes (404 Error Handler)
 */
export function notFoundHandler(req: Request, res: Response, next: NextFunction): void {
  logger.warn(`404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    error: "Route not found",
    message: `Cannot ${req.method} ${req.originalUrl}. Check the API documentation.`
  });
}

/**
 * Global Uncaught Error Handler
 */
export function globalErrorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || "An unexpected error occurred on the server.";
  
  logger.error(`Unhandled Exception during ${req.method} ${req.originalUrl}`, err);

  res.status(statusCode).json({
    error: "Internal Server Error",
    message: process.env.NODE_ENV === "production" ? "Something went wrong on our side." : message,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack
  });
}
