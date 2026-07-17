import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabaseAnonKey = (process.env as any).SUPABASE_ANON_KEY || "";

const mask = (val: string | undefined) => {
  if (!val) return "UNDEFINED";
  if (val.length <= 8) return "*".repeat(val.length);
  return `${val.slice(0, 5)}...${val.slice(-5)} (length: ${val.length})`;
};

console.log("%c--- FRONTEND SUPABASE CONFIGURATION AUDIT ---", "color: #3b82f6; font-weight: bold; font-size: 13px;");
console.log("[FRONTEND ENV] SUPABASE_URL :", mask(supabaseUrl));
console.log("[FRONTEND ENV] SUPABASE_ANON_KEY :", mask(supabaseAnonKey));
console.log("[FRONTEND ENV] SUPABASE_SERVICE_ROLE_KEY :", mask(supabaseKey));
console.log("---------------------------------------------");

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false
  }
});
