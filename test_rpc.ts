import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

const rpcs = ["exec_sql", "execute_sql", "run_sql", "query", "sql"];

async function run() {
  for (const rpc of rpcs) {
    console.log(`Testing RPC '${rpc}'...`);
    try {
      const { data, error } = await supabase.rpc(rpc, { sql: "SELECT 1;" });
      if (error) {
        console.log(`RPC '${rpc}': error - ${error.message} (code: ${error.code})`);
      } else {
        console.log(`RPC '${rpc}': success! data:`, data);
      }
    } catch (err: any) {
      console.log(`RPC '${rpc}': exception - ${err.message}`);
    }
  }
}

run();
