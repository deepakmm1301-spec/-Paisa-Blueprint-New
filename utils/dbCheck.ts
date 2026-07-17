import { createClient } from "@supabase/supabase-js";
import { logger } from "./logger";

export async function verifyDbSchema(): Promise<void> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    logger.warn("[DATABASE STARTUP WARNING] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment secrets. Database features will not be available.");
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false }
  });

  const requiredTables = [
    "teacher_hub_data",
    "paisa_user_data",
    "petitions",
    "petition_signatures",
    "petition_comments",
    "petition_updates",
    "petition_categories",
    "petition_documents"
  ];

  logger.info("[DATABASE STARTUP AUDIT] Beginning verification of required Supabase tables...");

  const missingTables: string[] = [];

  for (const table of requiredTables) {
    try {
      const { error } = await supabase
        .from(table)
        .select("*")
        .limit(1);

      if (error) {
        // Match standard PostgREST / Postgres relation missing errors
        const errMsg = error.message || "";
        const errCode = error.code || "";
        const isMissing = 
          errCode === "PGRST205" || 
          errCode === "42P01" || 
          errMsg.includes("relation") || 
          errMsg.includes("does not exist") || 
          errMsg.includes("Could not find the table") ||
          errMsg.includes("schema cache");

        if (isMissing) {
          missingTables.push(table);
        } else {
          logger.warn(`[DATABASE STARTUP] Warning checking table '${table}': ${error.message} (code: ${errCode})`);
        }
      }
    } catch (err: any) {
      logger.error(`[DATABASE STARTUP] Exception checking table '${table}': ${err.message}`);
      missingTables.push(table);
    }
  }

  if (missingTables.length > 0) {
    console.error("\n====================================================================");
    console.error("⚠️ DATABASE WARNING: MISSING REQUIRED TABLES");
    console.error("====================================================================");
    console.error(`The following required tables are missing from your Supabase database:\n`);
    for (const mt of missingTables) {
      console.error(`  - ${mt}`);
    }
    console.error(`\nACTION REQUIRED:`);
    console.error(`Please locate '/migration.sql' or '/supabase_schema.sql' in this workspace,`);
    console.error(`copy its contents, and execute it in your Supabase project's SQL Editor.`);
    console.error("====================================================================\n");
  } else {
    logger.info("[DATABASE STARTUP SUCCESS] All 8 required database tables have been verified and are online!");
  }
}
