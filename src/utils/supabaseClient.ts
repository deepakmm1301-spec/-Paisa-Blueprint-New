import { createClient } from "@supabase/supabase-js";

const rawUrl = process.env.SUPABASE_URL || (process.env as any).VITE_SUPABASE_URL || "";
const rawKey = process.env.SUPABASE_ANON_KEY || (process.env as any).VITE_SUPABASE_ANON_KEY || "";

// Provide fallback values if environment variables are not present, preventing "supabaseKey is required" crash
const supabaseUrl = rawUrl || "https://placeholder-project.supabase.co";
const supabaseAnonKey = rawKey || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2MDAwMDAwMDAsImV4cCI6MjAwMDAwMDAwMH0.placeholder";

const mask = (val: string | undefined) => {
  if (!val) return "UNDEFINED";
  if (val.length <= 8) return "*".repeat(val.length);
  return `${val.slice(0, 5)}...${val.slice(-5)} (length: ${val.length})`;
};

console.log("%c--- FRONTEND SUPABASE CONFIGURATION AUDIT ---", "color: #3b82f6; font-weight: bold; font-size: 13px;");
console.log("[FRONTEND ENV] SUPABASE_URL :", mask(supabaseUrl));
console.log("[FRONTEND ENV] SUPABASE_ANON_KEY :", mask(supabaseAnonKey));
console.log("---------------------------------------------");

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false
  }
});
