import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const endpoints = [
  "/pg/sql",
  "/pg/query",
  "/pg/queries",
  "/api/pg-query",
  "/api/sql"
];

async function run() {
  for (const endpoint of endpoints) {
    const url = `${supabaseUrl}${endpoint}`;
    console.log(`\nTesting POST ${url}...`);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`
        },
        body: JSON.stringify({ query: "SELECT 1;" })
      });
      console.log(`Response: ${res.status} ${res.statusText}`);
      const text = await res.text();
      console.log("Body:", text.slice(0, 200));
    } catch (err: any) {
      console.log("Error:", err.message);
    }
  }
}

run();
