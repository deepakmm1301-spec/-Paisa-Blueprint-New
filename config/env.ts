import dotenv from "dotenv";
import { logger } from "../utils/logger";

dotenv.config();

export interface EnvConfig {
  PORT: number;
  NODE_ENV: string;
  GEMINI_API_KEY?: string;
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
}

export const env: EnvConfig = {
  PORT: parseInt(process.env.PORT || "3000", 10),
  NODE_ENV: process.env.NODE_ENV || "development",
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  JWT_SECRET: process.env.JWT_SECRET || "secure_access_token_secret_paisa_blueprint_default_fallback",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "secure_refresh_token_secret_paisa_blueprint_default_fallback",
};

/**
 * Validates environment variables at startup.
 * Logs status and warnings cleanly.
 */
export function validateEnv(): void {
  logger.info(`Starting Paisa Blueprint in ${env.NODE_ENV} mode...`);
  
  const mask = (val: string | undefined) => {
    if (!val) return "UNDEFINED";
    if (val.length <= 8) return "*".repeat(val.length);
    return `${val.slice(0, 5)}...${val.slice(-5)} (length: ${val.length})`;
  };

  console.log("%c--- BACKEND SUPABASE CONFIGURATION AUDIT ---", "color: #eab308; font-weight: bold;");
  console.log("[BACKEND ENV] SUPABASE_URL :", mask(process.env.SUPABASE_URL));
  console.log("[BACKEND ENV] SUPABASE_ANON_KEY :", mask(process.env.SUPABASE_ANON_KEY));
  console.log("[BACKEND ENV] SUPABASE_SERVICE_ROLE_KEY :", mask(process.env.SUPABASE_SERVICE_ROLE_KEY));
  console.log("--------------------------------------------");

  if (!env.GEMINI_API_KEY) {
    logger.warn(
      "GEMINI_API_KEY is not defined in the environment secrets. " +
      "The server will gracefully fallback to high-fidelity rule-based local expert simulation for all chat and insights queries."
    );
  } else {
    logger.info("GEMINI_API_KEY is successfully loaded and validated.");
  }
}
