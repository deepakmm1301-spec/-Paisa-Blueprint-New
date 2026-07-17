import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

async function run() {
  try {
    const url = `${supabaseUrl}/rest/v1/`;
    console.log(`Fetching OpenAPI schema from ${url}...`);
    const res = await fetch(url, {
      headers: {
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`
      }
    });

    if (!res.ok) {
      console.error(`HTTP Error: ${res.status} ${res.statusText}`);
      const text = await res.text();
      console.error(text);
      return;
    }

    const data = await res.json();
    console.log("Exposed Tables/Views:");
    if (data.definitions) {
      Object.keys(data.definitions).forEach(table => {
        console.log(`- ${table}`);
      });
    }

    console.log("\nExposed Paths (including RPCs):");
    if (data.paths) {
      Object.keys(data.paths).forEach(p => {
        if (p.startsWith("/rpc/")) {
          console.log(`- ${p}`);
        }
      });
    }
  } catch (err: any) {
    console.error("Exception fetching schema:", err.message);
  }
}

run();
