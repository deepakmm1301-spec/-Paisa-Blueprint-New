import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { logger } from "./logger";

/**
 * Hashing helper using bcryptjs with a standard cost of 10 rounds
 */
export async function hashPassword(plainText: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainText, salt);
}

/**
 * Synchronous or asynchronous comparison helper
 */
export async function comparePassword(plainText: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(plainText, hash);
  } catch (err) {
    logger.error("Bcrypt compare error:", err);
    return false;
  }
}

/**
 * Generates a short-lived JSON Web Token for secure request authentication (e.g. 15 minutes)
 */
export function generateAccessToken(payload: { email: string; id: string; role: string }): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: "15m"
  });
}

/**
 * Generates a long-lived JSON Web Token for session persistence (e.g. 7 days or 30 days if rememberMe)
 */
export function generateRefreshToken(payload: { email: string; id: string }, rememberMe: boolean = false): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: rememberMe ? "30d" : "7d"
  });
}

/**
 * Verifies an access token
 */
export function verifyAccessToken(token: string): any {
  try {
    return jwt.verify(token, env.JWT_SECRET);
  } catch (err) {
    return null;
  }
}

/**
 * Verifies a refresh token
 */
export function verifyRefreshToken(token: string): any {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET);
  } catch (err) {
    return null;
  }
}
