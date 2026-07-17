const dotenv = require("dotenv");
dotenv.config();

console.log("Environment variable keys:");
Object.keys(process.env).sort().forEach(k => {
  if (k.includes("SUPABASE") || k.includes("DATABASE") || k.includes("POSTGRES") || k.includes("PG") || k.includes("SQL")) {
    console.log(`- ${k}: exists (length: ${process.env[k] ? process.env[k].length : 0})`);
  }
});
