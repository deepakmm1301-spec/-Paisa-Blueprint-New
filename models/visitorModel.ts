import { createClient } from "@supabase/supabase-js";
import { logger } from "../utils/logger";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    })
  : null;

let cachedCount = 1420;
let isInitialized = false;

async function syncFromSupabase(): Promise<void> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("teacher_hub_data")
        .select("payload")
        .eq("id", "visitor_stats")
        .single();
      
      if (!error && data && data.payload && typeof data.payload.count === "number") {
        cachedCount = data.payload.count;
        isInitialized = true;
      } else if (error && error.code === "PGRST116") {
        // Row not found, initialize it in Supabase
        await supabase.from("teacher_hub_data").insert({
          id: "visitor_stats",
          payload: { count: 1420 }
        });
        isInitialized = true;
      } else {
        logger.warn(`[VISITOR MODEL] Non-fatal issue loading visitor count, using cached default. Error: ${error?.message}`);
      }
    } catch (err: any) {
      logger.error("[VISITOR MODEL] Exception during visitor count sync:", err.message || err);
    }
  } else {
    isInitialized = true;
  }
}

export const visitorModel = {
  getVisitorCount: async (): Promise<number> => {
    if (!isInitialized) {
      await syncFromSupabase();
    }
    return cachedCount;
  },

  incrementVisitorCount: async (): Promise<number> => {
    if (!isInitialized) {
      await syncFromSupabase();
    }
    cachedCount += 1;
    if (supabase) {
      try {
        await supabase.from("teacher_hub_data").upsert({
          id: "visitor_stats",
          payload: { count: cachedCount },
          updated_at: new Date().toISOString()
        });
      } catch (err: any) {
        logger.error("[VISITOR MODEL] Error saving incremented visitor count:", err.message || err);
      }
    }
    return cachedCount;
  }
};

