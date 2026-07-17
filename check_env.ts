import dotenv from "dotenv";

dotenv.config();

console.log("=== ALL DETECTED ENVIRONMENT VARIABLES ===");
Object.keys(process.env).sort().forEach(k => {
  const val = process.env[k];
  const length = val ? val.length : 0;
  console.log(`${k}: length = ${length}`);
});
