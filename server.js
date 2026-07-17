import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverPath = path.join(__dirname, "dist", "server.cjs");

if (fs.existsSync(serverPath)) {
  import("./dist/server.cjs");
} else {
  console.error("==========================================================");
  console.error("CRITICAL ERROR: 'dist/server.cjs' was not found!");
  console.error("Please ensure that you run 'npm run build' before starting.");
  console.error("==========================================================");
  
  import("express")
    .then(({ default: express }) => {
      const app = express();
      const port = process.env.PORT || 3000;
      
      app.get("*", (req, res) => {
        res.status(500).send(
          "<html>" +
          "<body style=\"font-family: sans-serif; padding: 40px; max-width: 600px; margin: 0 auto; line-height: 1.6;\">" +
          "<h1 style=\"color: #e11d48; margin-bottom: 16px;\">Backend Build Missing</h1>" +
          "<p>The compiled production server file (<code>dist/server.cjs</code>) could not be found.</p>" +
          "<p><strong>Required Action:</strong> Please run <code>npm run build</code> in your deployment pipeline or console to compile the bundle, then restart the application.</p>" +
          "<p style=\"color: #64748b; font-size: 0.875rem; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 16px;\">" +
          "Hostinger Node.js Application Diagnostics" +
          "</p>" +
          "</body>" +
          "</html>"
        );
      });
      
      app.listen(port, () => {
        console.log(`Fallback diagnostics server listening on port ${port}`);
      });
    })
    .catch((err) => {
      console.error("Failed to boot fallback server:", err);
      process.exit(1);
    });
}
