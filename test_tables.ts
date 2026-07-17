import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

const tablesToCheck = [
  "audit_logs",
  "notifications",
  "requests",
  "success_stories",
  "teacher_hub_data",
  "teachers",
  "paisa_user_data",
  "petitions",
  "petition_signatures",
  "petition_comments",
  "petition_updates",
  "petition_categories",
  "petition_documents"
];

async function run() {
  console.log("=== CHECKING TABLE ACCESSIBILITY AND SCHEMAS ===");
  for (const table of tablesToCheck) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .limit(1);

      if (error) {
        console.log(`Table '${table}': ERROR - ${error.message} (code: ${error.code})`);
      } else {
        console.log(`Table '${table}': EXISTS - columns found in data:`, data && data[0] ? Object.keys(data[0]) : "No data rows present");
      }
    } catch (err: any) {
      console.log(`Table '${table}': EXCEPTION - ${err.message}`);
    }
  }

  // Let's also try to query Postgres catalog if we can run an RPC or raw SQL
  // (In Supabase, we can't run raw SQL unless there is an RPC function, but let's try calling typical RPCs if any exist, or querying information_schema if enabled as a REST resource)
  try {
    console.log("\n=== TESTING INFORMATION_SCHEMA VIA POSTGREST ===");
    const { data, error } = await supabase
      .from("information_schema.tables" as any)
      .select("table_name")
      .eq("table_schema", "public");
    if (error) {
      console.log("Reading information_schema.tables failed (expected in standard PostgREST setup):", error.message);
    } else {
      console.log("Tables list from information_schema:", data);
    }
  } catch (err: any) {
    console.log("Exception reading information_schema:", err.message);
  }
}

run();
