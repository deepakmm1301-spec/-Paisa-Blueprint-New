import express from "express";
import path from "path";
import fs from "fs";
import cookieParser from "cookie-parser";
import { createServer as createViteServer } from "vite";
import { env, validateEnv } from "./config/env";
import { logger } from "./utils/logger";
import { verifyDbSchema } from "./utils/dbCheck";
import { helmetMiddleware, corsMiddleware, sanitizeRequestMiddleware } from "./middleware/security";
import { requestLogger, notFoundHandler, globalErrorHandler } from "./middleware/errorHandler";
import apiRouter from "./routes/index";

const app = express();
const PORT = env.PORT;

// Configure Express to trust proxy headers from Nginx reverse proxy
app.set("trust proxy", 1);

// 1. Run environment variables validation and central logging startup messages
validateEnv();

// 2. Request logger to log every api call with latency metrics
app.use(requestLogger);

// 3. Apply secure headers & CORS settings
app.use(helmetMiddleware);
app.use(corsMiddleware);

// 4. Parse cookies for HttpOnly JWT tokens
app.use(cookieParser());

// 5. Set payload size limits to protect against denial of service
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

// 6. Input sanitization to prevent persistent/reflected XSS injection
app.use(sanitizeRequestMiddleware);

// 301 Redirect for .html extension to keep URLs clean and SEO-friendly
app.use((req, res, next) => {
  if (req.path.endsWith(".html") && !req.path.startsWith("/api")) {
    const cleanPath = req.path.slice(0, -5);
    const query = req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
    return res.redirect(301, cleanPath + query);
  }
  next();
});

// 6. Mount decoupled and structured API routes
app.use("/api", apiRouter);

// Fallback JSON error handler for unmatched /api/* routes to prevent returning HTML index
app.all("/api/*", (req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: `API endpoint ${req.method} ${req.originalUrl} does not exist.`
  });
});

// 7. Initialize assets pipelines & serve index files
async function startServer() {
  // Enforce schema validation at startup to fail-fast if tables are missing in Supabase
  await verifyDbSchema();

  if (env.NODE_ENV !== "production") {
    // Development Mode: Mount Vite's connect server in middlewareMode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });

    // Explicitly register /reset-password GET route to serve the spa index
    app.get("/reset-password", async (req, res, next) => {
      try {
        const htmlPath = path.join(process.cwd(), "index.html");
        if (fs.existsSync(htmlPath)) {
          let html = fs.readFileSync(htmlPath, "utf-8");
          html = await vite.transformIndexHtml(req.originalUrl, html);
          res.status(200).set({ "Content-Type": "text/html" }).end(html);
          return;
        }
        next();
      } catch (err) {
        next(err);
      }
    });

    app.use(vite.middlewares);

    // Serve index.html or other route-specific html files in development
    app.get("*", async (req, res, next) => {
      if (req.path.startsWith("/api")) {
        return next();
      }
      if (req.path.includes(".") && !req.path.endsWith(".html")) {
        return next();
      }
      try {
        let htmlPath = "";
        const cleanPath = req.path.replace(/\/$/, "");

        if (cleanPath.endsWith(".html")) {
          const targetFile = path.join(process.cwd(), cleanPath);
          if (fs.existsSync(targetFile)) {
            htmlPath = targetFile;
          }
        } else if (cleanPath) {
          const dirIndex = path.join(process.cwd(), cleanPath, "index.html");
          const htmlWithExt = path.join(process.cwd(), cleanPath + ".html");

          if (fs.existsSync(dirIndex)) {
            htmlPath = dirIndex;
          } else if (fs.existsSync(htmlWithExt)) {
            htmlPath = htmlWithExt;
          }
        }

        if (!htmlPath) {
          htmlPath = path.join(process.cwd(), "index.html");
        }

        if (fs.existsSync(htmlPath)) {
          let html = fs.readFileSync(htmlPath, "utf-8");
          html = await vite.transformIndexHtml(req.originalUrl, html);
          res.status(200).set({ "Content-Type": "text/html" }).end(html);
          return;
        }
        
        next();
      } catch (err) {
        next(err);
      }
    });

    logger.info("Joined Vite dev asset pipeline and middlewares successfully with MPA router.");
  } else {
    // Production Mode: Serve static build output cleanly with MPA routing
    const distPath = path.join(process.cwd(), "dist");
    
    // Explicitly register /reset-password GET route to serve the pre-compiled spa index
    app.get("/reset-password", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });

    app.use(express.static(distPath));
    
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api")) {
        return next();
      }
      
      const cleanPath = req.path.replace(/\/$/, "");
      
      let htmlPath = "";
      if (cleanPath.endsWith(".html")) {
        const targetFile = path.join(distPath, cleanPath);
        if (fs.existsSync(targetFile)) {
          htmlPath = targetFile;
        }
      } else if (cleanPath) {
        const dirIndex = path.join(distPath, cleanPath, "index.html");
        const htmlWithExt = path.join(distPath, cleanPath + ".html");
        
        if (fs.existsSync(dirIndex)) {
          htmlPath = dirIndex;
        } else if (fs.existsSync(htmlWithExt)) {
          htmlPath = htmlWithExt;
        }
      }
      
      if (!htmlPath) {
        htmlPath = path.join(distPath, "index.html");
      }
      
      if (fs.existsSync(htmlPath)) {
        res.sendFile(htmlPath);
        return;
      }
      
      next();
    });
    logger.info(`Serving pre-compiled static assets from production folder with MPA router: ${distPath}`);
  }

  // 8. 404 handler for unmatched routes
  app.use(notFoundHandler);

  // 9. Centralized Error handling to catch and safely log uncaught controller exceptions
  app.use(globalErrorHandler);

  app.listen(PORT, "0.0.0.0", () => {
    logger.info(`Paisa Blueprint Backend booted successfully. Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
export default app;
