var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// server.ts
var server_exports = {};
__export(server_exports, {
  default: () => server_default
});
module.exports = __toCommonJS(server_exports);
var import_express2 = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_cookie_parser = __toESM(require("cookie-parser"), 1);
var import_vite = require("vite");

// config/env.ts
var import_dotenv = __toESM(require("dotenv"), 1);

// utils/logger.ts
var logger = {
  info: (message, ...args) => {
    console.log(`[INFO] [${(/* @__PURE__ */ new Date()).toISOString()}] ${message}`, ...args);
  },
  warn: (message, ...args) => {
    console.warn(`[WARN] [${(/* @__PURE__ */ new Date()).toISOString()}] ${message}`, ...args);
  },
  error: (message, error, ...args) => {
    console.error(`[ERROR] [${(/* @__PURE__ */ new Date()).toISOString()}] ${message}`, error || "", ...args);
  }
};

// config/env.ts
import_dotenv.default.config();
var env = {
  PORT: parseInt(process.env.PORT || "3000", 10),
  NODE_ENV: process.env.NODE_ENV || "development",
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  JWT_SECRET: process.env.JWT_SECRET || "secure_access_token_secret_paisa_blueprint_default_fallback",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "secure_refresh_token_secret_paisa_blueprint_default_fallback"
};
function validateEnv() {
  logger.info(`Starting Paisa Blueprint in ${env.NODE_ENV} mode...`);
  const mask = (val) => {
    if (!val) return "UNDEFINED";
    if (val.length <= 8) return "*".repeat(val.length);
    return `${val.slice(0, 5)}...${val.slice(-5)} (length: ${val.length})`;
  };
  console.log("%c--- BACKEND SUPABASE CONFIGURATION AUDIT ---", "color: #eab308; font-weight: bold;");
  console.log("[BACKEND ENV] SUPABASE_URL :", mask(process.env.SUPABASE_URL));
  console.log("[BACKEND ENV] SUPABASE_ANON_KEY :", mask(process.env.SUPABASE_ANON_KEY));
  console.log("[BACKEND ENV] SUPABASE_SERVICE_ROLE_KEY :", mask(process.env.SUPABASE_SERVICE_ROLE_KEY));
  console.log("--------------------------------------------");
  if (!env.GEMINI_API_KEY) {
    logger.warn(
      "GEMINI_API_KEY is not defined in the environment secrets. The server will gracefully fallback to high-fidelity rule-based local expert simulation for all chat and insights queries."
    );
  } else {
    logger.info("GEMINI_API_KEY is successfully loaded and validated.");
  }
}

// utils/dbCheck.ts
var import_supabase_js = require("@supabase/supabase-js");
async function verifyDbSchema() {
  const supabaseUrl6 = process.env.SUPABASE_URL;
  const supabaseKey6 = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl6 || !supabaseKey6) {
    logger.warn("[DATABASE STARTUP WARNING] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment secrets. Database features will not be available.");
    return;
  }
  const supabase6 = (0, import_supabase_js.createClient)(supabaseUrl6, supabaseKey6, {
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
  const missingTables = [];
  for (const table of requiredTables) {
    try {
      const { error } = await supabase6.from(table).select("*").limit(1);
      if (error) {
        const errMsg = error.message || "";
        const errCode = error.code || "";
        const isMissing = errCode === "PGRST205" || errCode === "42P01" || errMsg.includes("relation") || errMsg.includes("does not exist") || errMsg.includes("Could not find the table") || errMsg.includes("schema cache");
        if (isMissing) {
          missingTables.push(table);
        } else {
          logger.warn(`[DATABASE STARTUP] Warning checking table '${table}': ${error.message} (code: ${errCode})`);
        }
      }
    } catch (err) {
      logger.error(`[DATABASE STARTUP] Exception checking table '${table}': ${err.message}`);
      missingTables.push(table);
    }
  }
  if (missingTables.length > 0) {
    console.error("\n====================================================================");
    console.error("\u26A0\uFE0F DATABASE WARNING: MISSING REQUIRED TABLES");
    console.error("====================================================================");
    console.error(`The following required tables are missing from your Supabase database:
`);
    for (const mt of missingTables) {
      console.error(`  - ${mt}`);
    }
    console.error(`
ACTION REQUIRED:`);
    console.error(`Please locate '/migration.sql' or '/supabase_schema.sql' in this workspace,`);
    console.error(`copy its contents, and execute it in your Supabase project's SQL Editor.`);
    console.error("====================================================================\n");
  } else {
    logger.info("[DATABASE STARTUP SUCCESS] All 8 required database tables have been verified and are online!");
  }
}

// middleware/security.ts
var import_helmet = __toESM(require("helmet"), 1);

// utils/sanitizer.ts
function sanitizeString(val) {
  if (typeof val !== "string") return val;
  return val.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;").replace(/\//g, "&#x2F;");
}
function sanitizeInput(input) {
  if (input === null || input === void 0) {
    return input;
  }
  if (typeof input === "string") {
    return sanitizeString(input);
  }
  if (Array.isArray(input)) {
    return input.map((item) => sanitizeInput(item));
  }
  if (typeof input === "object") {
    const sanitizedObj = {};
    for (const key of Object.keys(input)) {
      sanitizedObj[key] = sanitizeInput(input[key]);
    }
    return sanitizedObj;
  }
  return input;
}

// middleware/security.ts
var helmetMiddleware = (0, import_helmet.default)({
  contentSecurityPolicy: false,
  // Vite uses style tags, dynamic scripts, and remote CDNs
  frameguard: false,
  // Absolutely necessary for AI Studio preview iframe compatibility
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
});
function corsMiddleware(req, res, next) {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    const host = req.headers.host;
    const protocol = req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
    if (host) {
      res.setHeader("Access-Control-Allow-Origin", `${protocol}://${host}`);
    } else {
      res.setHeader("Access-Control-Allow-Origin", "https://www.paisablueprint.in");
    }
  }
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
    return;
  }
  next();
}
function sanitizeRequestMiddleware(req, res, next) {
  if (req.body) {
    req.body = sanitizeInput(req.body);
  }
  if (req.query) {
    req.query = sanitizeInput(req.query);
  }
  if (req.params) {
    req.params = sanitizeInput(req.params);
  }
  next();
}

// middleware/errorHandler.ts
function requestLogger(req, res, next) {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms [IP: ${req.ip}]`);
  });
  next();
}
function notFoundHandler(req, res, next) {
  logger.warn(`404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    error: "Route not found",
    message: `Cannot ${req.method} ${req.originalUrl}. Check the API documentation.`
  });
}
function globalErrorHandler(err, req, res, next) {
  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || "An unexpected error occurred on the server.";
  logger.error(`Unhandled Exception during ${req.method} ${req.originalUrl}`, err);
  res.status(statusCode).json({
    error: "Internal Server Error",
    message: process.env.NODE_ENV === "production" ? "Something went wrong on our side." : message,
    stack: process.env.NODE_ENV === "production" ? void 0 : err.stack
  });
}

// routes/index.ts
var import_express = require("express");

// services/geminiService.ts
var import_genai = require("@google/genai");
var aiInstance = null;
function getAIClient(customApiKey) {
  if (customApiKey && customApiKey.trim() !== "") {
    return new import_genai.GoogleGenAI({
      apiKey: customApiKey.trim(),
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }
  if (!aiInstance) {
    const apiKey = env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GEMINI_API_KEY is not configured in your environment secrets on this server host. To proceed, please provide your own custom Gemini API Key in the Coach settings panel."
      );
    }
    aiInstance = new import_genai.GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }
  return aiInstance;
}
function hasServerApiKey() {
  return typeof env.GEMINI_API_KEY === "string" && env.GEMINI_API_KEY.trim() !== "";
}
async function generateRemoteInsights(isHindi) {
  try {
    const ai = getAIClient();
    let prompt = `Generate exactly 4 fresh, highly informative and realistic market insights targeting:
1. Bihar Teacher Transfer policies (specifically the new 'Bihar State Teacher Transfer Rules, 2026' notified on June 25, 2026, implementing a Point-Based Seniority System with max 20 pts for medical/disability, 15 pts for spouse posting, and service tenure points)
2. Bihar Teacher Salary (BPSC salaries, 7th Pay DA updates at 50-53%, pension structures, actual numbers)
3. Teachers news of neighbouring states (UP recruitment board, Jharkhand DA at 50-53% raises, West Bengal scaling)
4. State & Central government employees (8th Pay Commission fitment factor memorandum, Unified Pension Scheme UPS vs NPS options)`;
    if (isHindi) {
      prompt += `

CRITICAL REQUIRED TRANSLATION: You MUST write all textual fields (title, summary, status, date, and impact) in fluent, natural Hindi using the Devanagari script.
However, the 'category' field MUST remain in English as one of the following exact strings: "Bihar Teacher Transfer", "Bihar Teacher Salary", "Neighbouring States", "State & Central Employees" for programmatic filtering to work on the client side.`;
    } else {
      prompt += `

The 'category' field MUST be exactly one of: "Bihar Teacher Transfer", "Bihar Teacher Salary", "Neighbouring States", "State & Central Employees". All other text fields should be in English.`;
    }
    let timeoutId;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error("Gemini API call timed out after 4500ms")), 4500);
    });
    const result = await Promise.race([
      ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          temperature: 0.7,
          responseMimeType: "application/json",
          responseSchema: {
            type: import_genai.Type.ARRAY,
            items: {
              type: import_genai.Type.OBJECT,
              properties: {
                id: { type: import_genai.Type.STRING },
                category: { type: import_genai.Type.STRING },
                title: { type: import_genai.Type.STRING },
                summary: { type: import_genai.Type.STRING },
                status: { type: import_genai.Type.STRING },
                statusColor: { type: import_genai.Type.STRING },
                date: { type: import_genai.Type.STRING },
                impact: { type: import_genai.Type.STRING }
              },
              required: ["id", "category", "title", "summary", "status", "statusColor", "date", "impact"]
            }
          }
        }
      }),
      timeoutPromise
    ]);
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    const responseText = result.text || "";
    const cleanJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleanJson);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (err) {
    logger.error("Gemini Market Insights error:", err);
  }
  return null;
}

// services/localAdvisorService.ts
function calculateTaxOld(grossAnnual, deductions = 25e4) {
  const taxable = Math.max(0, grossAnnual - deductions);
  if (taxable <= 5e5) return 0;
  let tax = 0;
  const s1 = Math.min(25e4, Math.max(0, taxable - 25e4));
  const s2 = Math.min(5e5, Math.max(0, taxable - 5e5));
  const s3 = Math.max(0, taxable - 1e6);
  tax += s1 * 0.05;
  tax += s2 * 0.2;
  tax += s3 * 0.3;
  return tax * 1.04;
}
function calculateTaxNew(grossAnnual) {
  const taxable = Math.max(0, grossAnnual - 75e3);
  if (taxable <= 7e5) return 0;
  let tax = 0;
  const s1 = Math.min(3e5, Math.max(0, taxable - 3e5));
  const s2 = Math.min(3e5, Math.max(0, taxable - 6e5));
  const s3 = Math.min(3e5, Math.max(0, taxable - 9e5));
  const s4 = Math.min(3e5, Math.max(0, taxable - 12e5));
  const s5 = Math.max(0, taxable - 15e5);
  tax += s1 * 0.05;
  tax += s2 * 0.1;
  tax += s3 * 0.15;
  tax += s4 * 0.2;
  tax += s5 * 0.3;
  return tax * 1.04;
}
function calculateCompound(monthlyAmount, years, rate) {
  const n = years * 12;
  const r = rate / 100 / 12;
  const totalValue = monthlyAmount * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
  const totalInvested = monthlyAmount * n;
  return {
    totalInvested,
    totalValue,
    wealthGained: Math.max(0, totalValue - totalInvested)
  };
}
function generateLocalAdvisorReply(messages, userProfile) {
  const lastUserMsg = [...messages].reverse().find((m) => m.role === "user")?.content || "";
  const query = lastUserMsg.toLowerCase();
  const profile = userProfile || {
    name: "Financier",
    age: 32,
    retirementAge: 60,
    salary: 8e4,
    city: "tier2",
    maritalStatus: "single",
    dependentsCount: 0,
    currentSavings: 15e4,
    monthlyExpenses: 3e4,
    loans: { homeLoan: 0, personalLoan: 0, carLoan: 0, otherLoan: 0 },
    investments: { mutualFunds: 5e4, stocks: 2e4, gold: 1e4, epf: 3e4, ppf: 15e3, nps: 0, realEstate: 0 },
    customSip: 1e4,
    healthInsuranceCover: 3e5,
    termInsuranceCover: 0
  };
  const name = profile.name || "friend";
  const salary = profile.salary || 0;
  const annualGross = salary * 12;
  const expenses = profile.monthlyExpenses || salary * 0.4 || 2e4;
  const currentSavings = profile.currentSavings || 0;
  const loans = profile.loans || {};
  const homeLoan = loans.homeLoan || 0;
  const personalLoan = loans.personalLoan || 0;
  const carLoan = loans.carLoan || 0;
  const otherLoan = loans.otherLoan || 0;
  const totalLoans = homeLoan + personalLoan + carLoan + otherLoan;
  const investments = profile.investments || {};
  const mutualFunds = investments.mutualFunds || 0;
  const stocks = investments.stocks || 0;
  const gold = investments.gold || 0;
  const epf = investments.epf || 0;
  const ppf = investments.ppf || 0;
  const nps = investments.nps || 0;
  const realEstate = investments.realEstate || 0;
  const totalInvestments = mutualFunds + stocks + gold + epf + ppf + nps + realEstate;
  if (query.match(/\b(hello|hi|hey|greetings|namaste|start|get started)\b/) || lastUserMsg.trim() === "") {
    return `### Namaste, **${name}**! \u{1F44B} 
    
I am your **Paisa Blueprint Local Expert System** \u{1F1EE}\u{1F1F3}. Since your cloud Gemini API Key is currently unregistered or we are functioning in air-gap local configuration mode, I've booted my high-fidelity rule-based advice advice bank to guide you instantly!

Here is a quick summary of your financial portfolio markers:
- **Income Base (Gross Monthly):** \u20B9${salary.toLocaleString("en-IN")}
- **Active Borrowing/Locker Debts:** \u20B9${totalLoans.toLocaleString("en-IN")}
- **Total Invested Capital:** \u20B9${totalInvestments.toLocaleString("en-IN")}
- **Monthly Expenses Cushion:** \u20B9${expenses.toLocaleString("en-IN")}

I am fully operational with local algorithmic financial intelligence! Ask me about:
1. \u{1F4CA} **Old vs New Tax Regime** comparison for your income bracket (just type **"Tax"**).
2. \u{1F4C8} **SIP Compounding Wealth Projection** (type **"SIP"**).
3. \u{1F6A8} **Emergency Reserve Buffer** assessment (type **"Emergency"**).
4. \u{1F6E1}\uFE0F **Insurance Cover adequacy audit** (type **"Insurance"**).
5. \u{1F4C9} **Loan paydown strategy** (type **"Loan"**).

How shall we navigate your compounding plan today? Just enter a keyword or ask a customized question!`;
  }
  if (query.match(/\b(tax|regime|old|new|slab|deduction|80c|80d|standard deduction)\b/)) {
    const oldTax = calculateTaxOld(annualGross);
    const newTax = calculateTaxNew(annualGross);
    const taxDiff = Math.abs(oldTax - newTax);
    const recommendation = oldTax < newTax ? "Old Tax Regime" : "New Tax Regime";
    const recommendedRegimeStr = taxDiff === 0 ? `Both Old and New regimes yield \u20B90 tax liability for you! However, the **New Tax Regime** is typically simpler since you do not need to lock up capital in tax-saving instruments.` : `Based on your Gross Salary of \u20B9${salary.toLocaleString("en-IN")}/mo (\u20B9${annualGross.toLocaleString("en-IN")}/year), the **${recommendation}** will save you approximately **\u20B9${Math.round(taxDiff).toLocaleString("en-IN")}** per year in taxes.`;
    return `### \u{1F4CA} Indian Income Tax Regime Assessment
    
Let's analyze your personal tax slab for your gross annual salary of **\u20B9${annualGross.toLocaleString("en-IN")}**:

1. **Old Tax Regime Estimates:**
   - **Assumed Deductions & Exemptions:** \u20B92,50,000 (Section 80C: \u20B91.5L such as EPF/PPF/ELSS, NPS Section 80CCD(1B): \u20B950k, Standard Deduction: \u20B950k).
   - **Calculated Tax Liability:** \u20B9${Math.round(oldTax).toLocaleString("en-IN")} per annum.

2. **New Tax Regime Estimates:**
   - **Deductions:** \u20B975,000 Section 16(ia) Standard Deduction only. No Section 80C exemptions allowed.
   - **Calculated Tax Liability:** \u20B9${Math.round(newTax).toLocaleString("en-IN")} per annum.

---

### **\u{1F4A1} Recommendation:**
**${recommendedRegimeStr}**

* **If opting for the Old Regime:** Ensure your Section 80C investments (including your PPF contribution of \u20B9${ppf.toLocaleString("en-IN")} and EPF contribution of \u20B9${epf.toLocaleString("en-IN")}) are fully deployed before March 31st to avail of the rebate!
* **If opting for the New Regime:** You enjoy zero filing complexity and higher month-on-month liquidity, which you can redirect into active SIP compounding.`;
  }
  if (query.match(/\b(sip|compound|interest|grow|wealth|future|mutual|fund|invest|stock|gold)\b/)) {
    const defaultSip = profile.customSip || Math.round(salary * 0.2) || 12e3;
    const sip10_12 = calculateCompound(defaultSip, 10, 12);
    const sip10_15 = calculateCompound(defaultSip, 10, 15);
    const sip15_12 = calculateCompound(defaultSip, 15, 12);
    const sip15_15 = calculateCompound(defaultSip, 15, 15);
    const sip20_12 = calculateCompound(defaultSip, 20, 12);
    const sip20_15 = calculateCompound(defaultSip, 20, 15);
    return `### \u{1F4C8} Mutual Fund SIP Wealth Accumulation Chart (Local Simulation)
    
Compounding is the 8th wonder of the world! Let's project how your SIP grows over time.
We will assume you start a dedicated Monthly SIP of **\u20B9${defaultSip.toLocaleString("en-IN")}** (about ${Math.round(defaultSip / salary * 100)}% of your monthly gross income):

#### \u{1F4C5} 10-Year Runway
* **Total Invested Cost:** \u20B9${sip10_12.totalInvested.toLocaleString("en-IN")}
* **Value at 12% CAGR (Conservative Index):** \u20B9${Math.round(sip10_12.totalValue).toLocaleString("en-IN")} *(Wealth Gained: +\u20B9${Math.round(sip10_12.wealthGained).toLocaleString("en-IN")})*
* **Value at 15% CAGR (Aggressive Mid/Smallcap):** \u20B9${Math.round(sip10_15.totalValue).toLocaleString("en-IN")} *(Wealth Gained: +\u20B9${Math.round(sip10_15.wealthGained).toLocaleString("en-IN")})*

#### \u{1F4C5} 15-Year Runway
* **Total Invested Cost:** \u20B9${sip15_12.totalInvested.toLocaleString("en-IN")}
* **Value at 12% CAGR:** \u20B9${Math.round(sip15_12.totalValue).toLocaleString("en-IN")} *(Wealth Gained: +\u20B9${Math.round(sip15_12.wealthGained).toLocaleString("en-IN")})*
* **Value at 15% CAGR:** \u20B9${Math.round(sip15_15.totalValue).toLocaleString("en-IN")} *(Wealth Gained: +\u20B9${Math.round(sip15_15.wealthGained).toLocaleString("en-IN")})*

#### \u{1F4C5} 20-Year Runway *(Compounding hockey stick curve)*
* **Total Invested Cost:** \u20B9${sip20_12.totalInvested.toLocaleString("en-IN")}
* **Value at 12% CAGR:** **\u20B9${Math.round(sip20_12.totalValue).toLocaleString("en-IN")}** *(Wealth Gained: +\u20B9${Math.round(sip20_12.wealthGained).toLocaleString("en-IN")})*
* **Value at 15% CAGR:** **\u20B9${Math.round(sip20_15.totalValue).toLocaleString("en-IN")}** *(Wealth Gained: +\u20B9${Math.round(sip20_15.wealthGained).toLocaleString("en-IN")})*

---

### **\u{1F4A1} Action Plan for ${name}:**
1. **Automate It:** Set up automatic monthly NACH mandates on your bank account for mutual fund SIPs as it keeps discipline.
2. **Recommended Basket:** 
   - **50% Core Index:** Nifty 50 Index Mutual Fund for stable compounding.
   - **30% Next Tier:** Nifty LargeMidcap 250 Index Fund or Active Midcap fund.
   - **20% Smallcap Satellite:** Smallcap mutual fund if your retirement run allows a 15+ year timeline.
3. **Step-Up:** Try to step-up your SIP by 10% every year as your salary increases to reach your retirement goals twice as fast!`;
  }
  if (query.match(/\b(emergency|expense|buffer|cushion|savings|liquid|backup|fd)\b/)) {
    const recBuffer = expenses * 6;
    const isAdequate = currentSavings >= recBuffer;
    const diff = recBuffer - currentSavings;
    return `### \u{1F6A8} Emergency Reserve Buffer Audit for **${name}**
    
In the blueprint of Indian personal finance, an emergency fund is your primary moat.
- **Your Monthly Cash Outflows:** \u20B9${expenses.toLocaleString("en-IN")}
- **Ideal 6-Month Emergency Fund size:** **\u20B9${recBuffer.toLocaleString("en-IN")}**
- **Your Enrolled Liquid Cash/Savings Balance:** \u20B9${currentSavings.toLocaleString("en-IN")}

---

### **\u2696\uFE0F Safety Adequacy Assessment:**
${isAdequate ? `\u2714\uFE0F **EXCELLENT STABILITY!** Your current liquid reserves of **\u20B9${currentSavings.toLocaleString("en-IN")}** cover approximately **${(currentSavings / expenses).toFixed(1)} months** of complete expenditure. This keeps you safe from job interruptions or temporary pay delays.` : `\u26A0\uFE0F **BUFFERS ARE INSUFFICIENT!** You are short by **\u20B9${diff.toLocaleString("en-IN")}** of the ideal 6-month safety net. Your current cash lasts only **${(currentSavings / expenses).toFixed(1)} months**.`}

---

### **\u{1F4A1} Master Blueprint Recommendations:**
1. **Where to park this reservoir:**
   - **50% in a Sweep-in Fixed Deposit** tied to your primary bank account (earns higher interest than savings, instantly withdrawable).
   - **50% in an Arbitrage/Liquid Mutual Fund** (very low risk, highly tax-efficient compared to normal FDs for high-slab earners).
2. **Immediate Step:** If under-covered, pause or reduce your stock investments temporarily and direct all monthly surplus (Gross income of \u20B9${salary.toLocaleString("en-IN")} minus \u20B9${expenses.toLocaleString("en-IN")} expenses) into building this buffer first.`;
  }
  if (query.match(/\b(insurance|term|health|lic|cover|medical|adequacy|audit)\b/)) {
    const idealTerm = annualGross * 15;
    const pathTerm = profile.termInsuranceCover || 0;
    const pathHealth = profile.healthInsuranceCover || 0;
    const isTermAdequate = pathTerm >= idealTerm;
    const isHealthAdequate = pathHealth >= 5e5;
    return `### \u{1F6E1}\uFE0F Insurance Cover Adequacy Check
    
Insurance exists to protect dependencies, not to act as investment vehicles. Let's inspect your risk-management boundaries:

#### 1. Term Life Insurance (Pure Protection)
- **Rule of Thumb:** 10x - 15x of Gross Annual Salary. 
- **Your Recommended pure-term cover:** **\u20B9${idealTerm.toLocaleString("en-IN")}**
- **Your Registered pure-term cover:** \u20B9${pathTerm.toLocaleString("en-IN")}
- **Assessment:** ${isTermAdequate ? `\u2714\uFE0F **Fully Covered!** Your pure term cover of \u20B9${pathTerm.toLocaleString("en-IN")} shields your family robustly.` : `\u26A0\uFE0F **Under-Covered!** Your active term cover of \u20B9${pathTerm.toLocaleString("en-IN")} is below the recommended safety cap. If you have dependents, you should purchase a pure-term structure immediately (HDFC Life, Max Life, or ICICI Pru). Avoid LIC endowment or ULIPs, which charge high fees and yield only 5-6% returns!`}

#### 2. Health Medical Insurance
- **Recommended base Cover:** Minimum \u20B95,00,000 (5 Lakhs) for yourself, plus dedicated corporate coverage.
- **Your Enrolled Health Cover:** \u20B9${pathHealth.toLocaleString("en-IN")}
- **Assessment:** ${isHealthAdequate ? `\u2714\uFE0F **Adequate base health insurance!** Keeping a private cover of \u20B9${pathHealth.toLocaleString("en-IN")} ensures you remain safe even during corporate career shifts.` : `\u26A0\uFE0F **Refine Health Protection:** Your cover of \u20B9${pathHealth.toLocaleString("en-IN")} might be low for metro hospital expenses. Consider taking a base cover of 5 Lakhs or adding a high-deductible super-top-up helper policy containing a low premium.`}`;
  }
  if (query.match(/\b(loan|debt|emi|borrow|home loan|car loan|personal loan|avalanche|snowball)\b/)) {
    if (totalLoans === 0) {
      return `### \u{1FA7A} Debt & Leverage Health Report
      
**Status:** \u{1F389} **COMPLETE LIABILITY FREEDOM!**
You have registered \u20B90 outstanding long-term liabilities! This is an exceptional personal finance feat. With zero monthly EMIs pulling down your cash flow, you should route at least **35% of your income (\u20B9${Math.round(salary * 0.35).toLocaleString("en-IN")})** straight into active SIP index mutual funds to let compound interest work for you!`;
    }
    const loanCount = [homeLoan, personalLoan, carLoan, otherLoan].filter((l) => l > 0).length;
    return `### \u{1F4C9} Debt Reduction paydown Strategy (${loanCount} Active Liabilities)
    
Your registered long-term liabilities sum up to **\u20B9${totalLoans.toLocaleString("en-IN")}**:
${homeLoan > 0 ? `- \u{1F3E0} **Home Loan Principal:** \u20B9${homeLoan.toLocaleString("en-IN")}
` : ""}${personalLoan > 0 ? `- \u{1F4B3} **High-Risk Personal Loan:** \u20B9${personalLoan.toLocaleString("en-IN")} *(Urgent Category)*
` : ""}${carLoan > 0 ? `- \u{1F697} **Car Loan principal:** \u20B9${carLoan.toLocaleString("en-IN")}
` : ""}${otherLoan > 0 ? `- \u{1F4C2} **Other auxiliary loan:** \u20B9${otherLoan.toLocaleString("en-IN")}
` : ""}

---

### **\u{1F4A1} Strategic Leverage Roadmap:**
1. **Nuke High-Interest First (Avalanche Method):**
   - Personal loans typically charge **12% to 18% interest**, car loans **9% to 11%**, home loans **8% to 9%**. 
   - **Immediately prioritize** clearing your ${personalLoan > 0 ? `**Personal Loan of \u20B9${personalLoan.toLocaleString("en-IN")}**` : "highest interest loan"} by prepaying as much of your monthly gross (\u20B9${salary.toLocaleString("en-IN")}) surplus into it. This is a guaranteed 14% tax-free savings return on your money!
2. **Prepay Home Loan Principle:** 
   - If you have an active Home Loan, make a pledge to prepay **1 extra EMI every year**, or increase your monthly EMI by **5% annually**. This simple step trims a 20-year run down to just **12 to 13 years**, saving you lakhs in interest costs!`;
  }
  if (query.match(/\b(7th pay|pay scale|basic|da|hra|allowance|government|salary|salary structure)\b/)) {
    const computedBasic = Math.round(salary * 0.4);
    const computedDA = Math.round(computedBasic * 0.5);
    return `### \u{1F3DB}\uFE0F Government Salary Architecture (7th Pay Commission)
    
Since you are analyzing structured salaried scales (often aligned with Central or State pay rules):

- **Gross registered scale:** \u20B9${salary.toLocaleString("en-IN")} / month
- **Assumed Basic Pay (typically ~40-50%):** \u20B9${computedBasic.toLocaleString("en-IN")}
- **Dearness Allowance (current 50% DA):** \u20B9${computedDA.toLocaleString("en-IN")}
- **HRA Bracket allocation:** Aligned to your city tier (${profile.city === "tier1" ? "Metro 27% HRA" : profile.city === "tier2" ? "Town 18% HRA" : "Rural 9% HRA"}).

---

### **\u{1F4A1} Optimizing Government Allowances:**
1. **NPS Under Section 80CCD(2):** 
   - The Employer's NPS contribution (14% of Basic + DA) is fully tax-free under both tax regimes! Ensure your department files this to lower your taxable net.
2. **LTA (Leave Travel Allowance) & Fuel Reimbursements:** Ensure you submit rent receipts (HRA exemption under Old Regime) and other declarations directly to your DDO (Drawing and Disbursing Officer) before January to prevent heavy TDS tax deductions!`;
  }
  return `### \u{1F4A1} Holistic Paisa Blueprint Advice for **${name}**
  
I have analyzed your entire financial ledger and here is your core optimize path:

1. **Compounding Force:** You have **\u20B9${totalInvestments.toLocaleString("en-IN")}** invested across mutual funds, stocks, and fixed income. Keeping an active Nifty 50 SIP will double this amount dynamically behind the scenes.
2. **Risk Barrier:** Your current liquid savings are **\u20B9${currentSavings.toLocaleString("en-IN")}** against a target emergency buffer of **\u20B9${(expenses * 6).toLocaleString("en-IN")}**. Fill this up before expanding stock operations.
3. **Debt Drag:** Your active liabilities total **\u20B9${totalLoans.toLocaleString("en-IN")}**. Leverage prepayments of the high-rate segments to unlock massive cash flow.
4. **Tax Leakage:** At gross \u20B9${salary.toLocaleString("en-IN")}/mo, you are likely in a high-bracket. Use the tax tab to compare regimes precisely and maximize direct index funds.

*Feel free to ask me something specific, like **"Compare tax old vs new"** or **"How much will \u20B910,000 monthly grow to?"**!*`;
}
var offlineInsightsEn = [
  {
    id: "bihar-transfer-1",
    category: "Bihar Teacher Transfer",
    title: "Official Notification: Bihar State Teacher Transfer Rules, 2026 Released",
    summary: "The Education Department of Bihar has officially notified the 'Bihar State Teacher Transfer Rules, 2026' (Memo 11/Vi-33/2026) dated June 25, 2026. It introduces a highly structured Point-Based Seniority System (\u0905\u0902\u0915-\u0906\u0927\u093E\u0930\u093F\u0924 \u0935\u0930\u0940\u092F\u0924\u093E \u092A\u094D\u0930\u0923\u093E\u0932\u0940) for primary, middle, secondary, and higher secondary government school teachers, with transparent rules for mutual and general transfers.",
    status: "Policy Notified",
    statusColor: "emerald",
    date: "June 25, 2026",
    impact: "Establishes transparent point scores (up to 20 pts for medical/disability, 15 pts for spouse posting, 10 pts for single parent, plus service-linked points) for over 1.5 Lakh teachers."
  },
  {
    id: "bihar-salary-1",
    category: "Bihar Teacher Salary",
    title: "BPSC Shikshak Dearness Allowance Disbursed at 50%",
    summary: "Dearness Allowance (DA) of 50% calculated on basic pay scaled by the 7th Pay Commission has been successfully disbursed for BPSC primary, secondary, and senior secondary teacher cadres.",
    status: "Slabs Disbursed",
    statusColor: "blue",
    date: "May 2026",
    impact: "Direct increase in take-home monthly salary by \u20B93,800 - \u20B96,000 depending on pay levels."
  },
  {
    id: "neighbour-states-1",
    category: "Neighbouring States",
    title: "Jharkhand & UP Teacher Pay Harmonization Projects",
    summary: "Jharkhand cabinet approved alignment of public teacher scale DA to 53% starting mid-year. Uttar Pradesh establishes unified educational recruitment boards to evaluate pending scale hikes.",
    status: "Scale Synced",
    statusColor: "purple",
    date: "June 2026",
    impact: "Averages salaries across border districts, preventing cross-state employee departures."
  },
  {
    id: "state-central-1",
    category: "State & Central Employees",
    title: "8th Pay Commission Memorandum Filed; UPS vs NPS Debate",
    summary: "Joint staff employees federations have submitted official memorandums urging the prompt formation of the 8th Pay Commission with recommended fitment factors of 2.86x or 3.0x. Unified Pension Scheme (UPS) implementation rules are also under union evaluation.",
    status: "Whitepaper Stage",
    statusColor: "amber",
    date: "June 2026",
    impact: "A 2.86x fitment factor would raise minimum initial basic pay scales from \u20B918,000 up to \u20B951,480."
  }
];
var offlineInsightsHi = [
  {
    id: "bihar-transfer-1",
    category: "Bihar Teacher Transfer",
    title: "\u0906\u0927\u093F\u0915\u093E\u0930\u093F\u0915 \u0905\u0927\u093F\u0938\u0942\u091A\u0928\u093E: '\u092C\u093F\u0939\u093E\u0930 \u0930\u093E\u091C\u094D\u092F \u0936\u093F\u0915\u094D\u0937\u0915 \u0938\u094D\u0925\u093E\u0928\u093E\u0928\u094D\u0924\u0930\u0923 \u0928\u093F\u092F\u092E\u093E\u0935\u0932\u0940, 2026' \u091C\u093E\u0930\u0940",
    summary: "\u092C\u093F\u0939\u093E\u0930 \u0936\u093F\u0915\u094D\u0937\u093E \u0935\u093F\u092D\u093E\u0917 \u0928\u0947 25 \u091C\u0942\u0928 2026 \u0915\u094B '\u092C\u093F\u0939\u093E\u0930 \u0930\u093E\u091C\u094D\u092F \u0936\u093F\u0915\u094D\u0937\u0915 \u0938\u094D\u0925\u093E\u0928\u093E\u0928\u094D\u0924\u0930\u0923 \u0928\u093F\u092F\u092E\u093E\u0935\u0932\u0940, 2026' (\u0938\u0902\u091A\u093F\u0915\u093E \u0938\u0902\u0916\u094D\u092F\u093E 11/\u0935\u093F\u0966-33/2026) \u0915\u0940 \u0906\u0927\u093F\u0915\u093E\u0930\u093F\u0915 \u0905\u0927\u093F\u0938\u0942\u091A\u0928\u093E \u091C\u093E\u0930\u0940 \u0915\u0930 \u0926\u0940 \u0939\u0948\u0964 \u0907\u0938\u0915\u0947 \u0924\u0939\u0924 \u092A\u094D\u0930\u093E\u0925\u092E\u093F\u0915, \u092E\u0927\u094D\u092F, \u092E\u093E\u0927\u094D\u092F\u092E\u093F\u0915 \u0914\u0930 \u0909\u091A\u094D\u091A\u0924\u0930 \u092E\u093E\u0927\u094D\u092F\u092E\u093F\u0915 \u0936\u093F\u0915\u094D\u0937\u0915\u094B\u0902 \u0915\u0947 \u0938\u094D\u0925\u093E\u0928\u093E\u0902\u0924\u0930\u0923 \u0915\u0947 \u0932\u093F\u090F \u090F\u0915 \u092A\u093E\u0930\u0926\u0930\u094D\u0936\u0940 '\u0905\u0902\u0915-\u0906\u0927\u093E\u0930\u093F\u0924 \u0935\u0930\u0940\u092F\u0924\u093E \u092A\u094D\u0930\u0923\u093E\u0932\u0940' (Point-Based Seniority System) \u0932\u093E\u0917\u0942 \u0915\u0940 \u0917\u0908 \u0939\u0948\u0964",
    status: "\u0928\u093F\u092F\u092E\u093E\u0935\u0932\u0940 \u0905\u0927\u093F\u0938\u0942\u091A\u093F\u0924",
    statusColor: "emerald",
    date: "25 \u091C\u0942\u0928 2026",
    impact: "\u0924\u092C\u093E\u0926\u0932\u094B\u0902 \u092E\u0947\u0902 \u092A\u0942\u0930\u094D\u0923 \u092A\u093E\u0930\u0926\u0930\u094D\u0936\u093F\u0924\u093E \u0906\u090F\u0917\u0940; \u0936\u093F\u0915\u094D\u0937\u0915 \u0905\u092A\u0928\u0940 \u0938\u0947\u0935\u093E \u0905\u0935\u0927\u093F (1 \u0905\u0902\u0915 \u092A\u094D\u0930\u0924\u093F \u0936\u0948\u0915\u094D\u0937\u0923\u093F\u0915 \u0935\u0930\u094D\u0937), \u0938\u094D\u0915\u0942\u0932 \u0936\u094D\u0930\u0947\u0923\u0940 (1-5 \u0905\u0902\u0915) \u0914\u0930 \u0935\u093F\u0936\u0947\u0937 \u0936\u094D\u0930\u0947\u0923\u093F\u092F\u094B\u0902 \u091C\u0948\u0938\u0947 \u0917\u0902\u092D\u0940\u0930 \u092C\u0940\u092E\u093E\u0930\u0940/\u0926\u093F\u0935\u094D\u092F\u093E\u0902\u0917\u0924\u093E (20 \u0905\u0902\u0915), \u092A\u0924\u093F-\u092A\u0924\u094D\u0928\u0940 \u092A\u0926\u0938\u094D\u0925\u093E\u092A\u0928 (15 \u0905\u0902\u0915) \u0915\u0947 \u0906\u0927\u093E\u0930 \u092A\u0930 \u0935\u0930\u0940\u092F\u0924\u093E \u0938\u094D\u0915\u094B\u0930 \u0915\u0940 \u0917\u0923\u0928\u093E \u0915\u0930 \u0938\u0915\u0947\u0902\u0917\u0947\u0964"
  },
  {
    id: "bihar-salary-1",
    category: "Bihar Teacher Salary",
    title: "\u092C\u0940\u092A\u0940\u090F\u0938\u0938\u0940 \u0936\u093F\u0915\u094D\u0937\u0915 \u092E\u0939\u0902\u0917\u093E\u0908 \u092D\u0924\u094D\u0924\u093E (DA) 50% \u0938\u094D\u0935\u0940\u0915\u0943\u0924 \u0914\u0930 \u0935\u093F\u0924\u0930\u093F\u0924",
    summary: "\u0938\u093E\u0924\u0935\u0947\u0902 \u0935\u0947\u0924\u0928 \u0906\u092F\u094B\u0917 \u0915\u0940 \u0938\u093F\u092B\u093E\u0930\u093F\u0936\u094B\u0902 \u0915\u0947 \u0906\u0927\u093E\u0930 \u092A\u0930 \u0924\u092F \u0915\u093F\u090F \u0917\u090F \u092E\u0942\u0932 \u0935\u0947\u0924\u0928 \u092A\u0930 50% \u0915\u0940 \u0926\u0930 \u0938\u0947 \u092E\u0939\u0902\u0917\u093E\u0908 \u092D\u0924\u094D\u0924\u093E (DA) \u092C\u0940\u092A\u0940\u090F\u0938\u0938\u0940 \u092A\u094D\u0930\u093E\u0925\u092E\u093F\u0915, \u092E\u093E\u0927\u094D\u092F\u092E\u093F\u0915 \u0914\u0930 \u0909\u091A\u094D\u091A\u0924\u0930 \u092E\u093E\u0927\u094D\u092F\u092E\u093F\u0915 \u0936\u093F\u0915\u094D\u0937\u0915 \u0938\u0902\u0935\u0930\u094D\u0917\u094B\u0902 \u0915\u0947 \u0932\u093F\u090F \u0938\u092B\u0932\u0924\u093E\u092A\u0942\u0930\u094D\u0935\u0915 \u091C\u093E\u0930\u0940 \u0915\u0930 \u0926\u093F\u092F\u093E \u0917\u092F\u093E \u0939\u0948\u0964",
    status: "\u0921\u0940\u090F \u0935\u093F\u0924\u0930\u093F\u0924",
    statusColor: "blue",
    date: "\u092E\u0908 2026",
    impact: "\u0935\u0947\u0924\u0928 \u0938\u094D\u0924\u0930 \u0915\u0947 \u0906\u0927\u093E\u0930 \u092A\u0930 \u092E\u093E\u0938\u093F\u0915 \u0907\u0928-\u0939\u0948\u0902\u0921 \u0938\u0948\u0932\u0930\u0940 \u092E\u0947\u0902 \u20B93,800 \u0938\u0947 \u20B96,000 \u0924\u0915 \u0915\u0940 \u0938\u0940\u0927\u0940 \u0914\u0930 \u0924\u0924\u094D\u0915\u093E\u0932 \u092C\u0922\u093C\u094B\u0924\u0930\u0940\u0964"
  },
  {
    id: "neighbour-states-1",
    category: "Neighbouring States",
    title: "\u091D\u093E\u0930\u0916\u0902\u0921 \u0914\u0930 \u0909\u0924\u094D\u0924\u0930 \u092A\u094D\u0930\u0926\u0947\u0936 \u0936\u093F\u0915\u094D\u0937\u0915 \u0935\u0947\u0924\u0928 \u0938\u0902\u0930\u0947\u0916\u0923 \u092A\u0930\u093F\u092F\u094B\u091C\u0928\u093E\u090F\u0902",
    summary: "\u091D\u093E\u0930\u0916\u0902\u0921 \u0915\u0948\u092C\u093F\u0928\u0947\u091F \u0928\u0947 \u0938\u0930\u0915\u093E\u0930\u0940 \u0936\u093F\u0915\u094D\u0937\u0915\u094B\u0902 \u0915\u0947 \u092E\u0939\u0902\u0917\u093E\u0908 \u092D\u0924\u094D\u0924\u0947 \u0915\u094B \u092C\u0922\u093C\u093E\u0915\u0930 53% \u0915\u0930\u0928\u0947 \u0915\u0940 \u092E\u0902\u091C\u0942\u0930\u0940 \u0926\u0947 \u0926\u0940 \u0939\u0948\u0964 \u0935\u0939\u0940\u0902 \u0909\u0924\u094D\u0924\u0930 \u092A\u094D\u0930\u0926\u0947\u0936 \u0938\u0930\u0915\u093E\u0930 \u0932\u0902\u092C\u093F\u0924 \u0935\u0947\u0924\u0928\u092E\u093E\u0928 \u0935\u093F\u0938\u0902\u0917\u0924\u093F\u092F\u094B\u0902 \u0915\u094B \u0926\u0942\u0930 \u0915\u0930\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F \u0928\u090F \u0936\u093F\u0915\u094D\u0937\u093E \u0938\u0947\u0935\u093E \u091A\u092F\u0928 \u092C\u094B\u0930\u094D\u0921 \u0915\u093E \u0917\u0920\u0928 \u0915\u0930 \u0930\u0939\u0940 \u0939\u0948\u0964",
    status: "\u0935\u0947\u0924\u0928\u092E\u093E\u0928 \u0938\u0902\u0930\u0947\u0916\u093F\u0924",
    statusColor: "purple",
    date: "\u091C\u0942\u0928 2026",
    impact: "\u0938\u0940\u092E\u093E\u0935\u0930\u094D\u0924\u0940 \u091C\u093F\u0932\u094B\u0902 \u092E\u0947\u0902 \u0915\u093E\u0930\u094D\u092F\u0930\u0924 \u0936\u093F\u0915\u094D\u0937\u0915\u094B\u0902 \u0915\u0947 \u0935\u0947\u0924\u0928 \u092E\u0947\u0902 \u0905\u0938\u092E\u093E\u0928\u0924\u093E \u0915\u092E \u0939\u094B\u0917\u0940, \u091C\u093F\u0938\u0938\u0947 \u0936\u093F\u0915\u094D\u0937\u0915\u094B\u0902 \u0915\u0947 \u092A\u0932\u093E\u092F\u0928 \u092A\u0930 \u0930\u094B\u0915 \u0932\u0917\u0947\u0917\u0940\u0964"
  },
  {
    id: "state-central-1",
    category: "State & Central Employees",
    title: "8\u0935\u0947\u0902 \u0935\u0947\u0924\u0928 \u0906\u092F\u094B\u0917 \u0915\u093E \u091C\u094D\u091E\u093E\u092A\u0928 \u092A\u094D\u0930\u0938\u094D\u0924\u0941\u0924; \u092F\u0942\u092A\u0940\u090F\u0938 \u092C\u0928\u093E\u092E \u090F\u0928\u092A\u0940\u090F\u0938 \u092C\u0939\u0938 \u0924\u0947\u091C",
    summary: "\u0915\u0930\u094D\u092E\u091A\u093E\u0930\u0940 \u092E\u0939\u093E\u0938\u0902\u0918\u094B\u0902 \u0928\u0947 2.86x \u092F\u093E 3.0x \u092B\u093F\u091F\u092E\u0947\u0902\u091F \u092B\u0948\u0915\u094D\u091F\u0930 \u0915\u0940 \u0938\u093F\u092B\u093E\u0930\u093F\u0936 \u0915\u0947 \u0938\u093E\u0925 8\u0935\u0947\u0902 \u0935\u0947\u0924\u0928 \u0906\u092F\u094B\u0917 \u0915\u0947 \u0924\u0924\u094D\u0915\u093E\u0932 \u0917\u0920\u0928 \u0915\u0947 \u0932\u093F\u090F \u0906\u0927\u093F\u0915\u093E\u0930\u093F\u0915 \u092E\u093E\u0902\u0917 \u092A\u0924\u094D\u0930 \u0938\u094C\u0902\u092A\u093E \u0939\u0948\u0964 \u0907\u0938\u0915\u0947 \u0938\u093E\u0925 \u0939\u0940 \u092F\u0942\u0928\u093F\u092F\u0928\u094B\u0902 \u0926\u094D\u0935\u093E\u0930\u093E \u090F\u0915\u0940\u0915\u0943\u0924 \u092A\u0947\u0902\u0936\u0928 \u092F\u094B\u091C\u0928\u093E (UPS) \u0915\u0947 \u0928\u093F\u092F\u092E\u094B\u0902 \u0915\u093E \u092D\u0940 \u0917\u0939\u0928 \u0935\u093F\u0936\u094D\u0932\u0947\u0937\u0923 \u0915\u093F\u092F\u093E \u091C\u093E \u0930\u0939\u093E \u0939\u0948\u0964",
    status: "\u091C\u094D\u091E\u093E\u092A\u0928 \u0938\u094D\u0924\u0930",
    statusColor: "amber",
    date: "\u091C\u0942\u0928 2026",
    impact: "\u092F\u0926\u093F 2.86x \u092B\u093F\u091F\u092E\u0947\u0902\u091F \u092B\u0948\u0915\u094D\u091F\u0930 \u0932\u093E\u0917\u0942 \u0939\u094B\u0924\u093E \u0939\u0948, \u0924\u094B \u0928\u094D\u092F\u0942\u0928\u0924\u092E \u092A\u094D\u0930\u093E\u0930\u0902\u092D\u093F\u0915 \u092E\u0942\u0932 \u0935\u0947\u0924\u0928 \u20B918,000 \u0938\u0947 \u092C\u0922\u093C\u0915\u0930 \u0938\u0940\u0927\u0947 \u20B951,480 \u0939\u094B \u091C\u093E\u090F\u0917\u093E\u0964"
  }
];

// controllers/chatController.ts
var chatController = {
  chat: async (req, res, next) => {
    const { messages, userProfile, customApiKey, forceLocal } = req.body;
    try {
      const serverKeyAvailable = hasServerApiKey();
      const hasAnyKey = serverKeyAvailable || customApiKey && customApiKey.trim() !== "";
      logger.info(`Chat request received. ForceLocal: ${forceLocal}, ServerKeyAvailable: ${serverKeyAvailable}, HasCustomKey: ${!!customApiKey}`);
      if (forceLocal || !hasAnyKey) {
        logger.info("Serving rule-based local expert simulation response.");
        const content = generateLocalAdvisorReply(messages || [], userProfile);
        res.json({
          role: "assistant",
          content
        });
        return;
      }
      const ai = getAIClient(customApiKey);
      const systemInstruction = `You are "Paisa Blueprint AI Coach", an expert personal financial adviser specializing in Indian personal finance, salaried employees, and government salary structures.
Your tone is encouraging, objective, smart, and financially prudent. You think like a typical middle-class or wealthy Indian household optimizer (minimizing taxes, maximizing safe compounding via Mutual Funds/SIP, buying Term over ULIP, keeping a solid emergency fund).

Use Indian Rupees (\u20B9, Lakhs, Crores) for all numbers.
Where relevant, consider Indian tax schemes:
- Old Tax Regime deductions (Section 80C up to 1.5L, NPS Section 80CCD(1B) up to 50k, Standard Deduction 50k, Section 80D health insurance, HRA exempt).
- New Tax Regime (Standard deduction 75k, no major deductions, lower overall slab rates).
- High priority to safe compounding, NPS, PPF, EPF, and direct/regular mutual fund SIP schemes.

User Context:
${userProfile ? JSON.stringify(userProfile, null, 2) : "No specific profile shared yet. Ask them details if needed."}

Follow these instructions strictly:
1. Always give concrete, real Indian financial recommendations, never vague generalities.
2. If given salary figures, analyze their savings potential using the 50/30/20 rule adjusted for Indian scenarios.
3. Suggest clear action items (e.g., "Park 6 months of expenses in an arbitrage fund or sweep-in FD for emergency").`;
      const contents = (messages || []).map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content || "" }]
      }));
      while (contents.length > 20) {
        contents.shift();
      }
      if (contents.length === 0) {
        contents.push({
          role: "user",
          parts: [{ text: "Hello, I want to talk about personal finance." }]
        });
      }
      logger.info("Generating content via Gemini API...");
      const result = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
        config: {
          systemInstruction,
          temperature: 0.7
        }
      });
      const responseText = result.text || "I was unable to formulate a response. Please try again.";
      res.json({
        role: "assistant",
        content: responseText
      });
    } catch (error) {
      logger.error("AI Coach Error - Fallback to Local Expert:", error);
      try {
        const content = generateLocalAdvisorReply(messages || [], userProfile);
        res.json({
          role: "assistant",
          content: `*(Fallback Local Advisory Enabled)*

${content}`
        });
      } catch (fallbackErr) {
        next(fallbackErr);
      }
    }
  },
  getStatus: (req, res, next) => {
    try {
      res.json({ hasApiKey: hasServerApiKey() });
    } catch (err) {
      next(err);
    }
  }
};

// controllers/insightController.ts
var insightController = {
  getMarketInsights: async (req, res, next) => {
    try {
      const lang = req.query.lang === "hi" ? "hi" : "en";
      const forceLocal = req.query.forceLocal === "true";
      logger.info(`Market Insights requested. Lang: ${lang}, ForceLocal: ${forceLocal}`);
      if (forceLocal || !hasServerApiKey()) {
        logger.info("Serving offline local dataset for market insights.");
        res.json({
          source: "local",
          insights: lang === "hi" ? offlineInsightsHi : offlineInsightsEn
        });
        return;
      }
      const remoteInsights = await generateRemoteInsights(lang === "hi");
      if (remoteInsights) {
        logger.info("Serving dynamically generated Gemini AI market insights.");
        res.json({
          source: "gemini",
          insights: remoteInsights
        });
        return;
      }
      logger.warn("Remote insights failed to generate. Falling back to local offline dataset.");
      res.json({
        source: "local-fallback",
        insights: lang === "hi" ? offlineInsightsHi : offlineInsightsEn
      });
    } catch (err) {
      next(err);
    }
  }
};

// models/visitorModel.ts
var import_supabase_js2 = require("@supabase/supabase-js");
var supabaseUrl = process.env.SUPABASE_URL;
var supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
var supabase = supabaseUrl && supabaseKey ? (0, import_supabase_js2.createClient)(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
}) : null;
var cachedCount = 1420;
var isInitialized = false;
async function syncFromSupabase() {
  if (supabase) {
    try {
      const { data, error } = await supabase.from("teacher_hub_data").select("payload").eq("id", "visitor_stats").single();
      if (!error && data && data.payload && typeof data.payload.count === "number") {
        cachedCount = data.payload.count;
        isInitialized = true;
      } else if (error && error.code === "PGRST116") {
        await supabase.from("teacher_hub_data").insert({
          id: "visitor_stats",
          payload: { count: 1420 }
        });
        isInitialized = true;
      } else {
        logger.warn(`[VISITOR MODEL] Non-fatal issue loading visitor count, using cached default. Error: ${error?.message}`);
      }
    } catch (err) {
      logger.error("[VISITOR MODEL] Exception during visitor count sync:", err.message || err);
    }
  } else {
    isInitialized = true;
  }
}
var visitorModel = {
  getVisitorCount: async () => {
    if (!isInitialized) {
      await syncFromSupabase();
    }
    return cachedCount;
  },
  incrementVisitorCount: async () => {
    if (!isInitialized) {
      await syncFromSupabase();
    }
    cachedCount += 1;
    if (supabase) {
      try {
        await supabase.from("teacher_hub_data").upsert({
          id: "visitor_stats",
          payload: { count: cachedCount },
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        });
      } catch (err) {
        logger.error("[VISITOR MODEL] Error saving incremented visitor count:", err.message || err);
      }
    }
    return cachedCount;
  }
};

// controllers/visitorController.ts
var visitorController = {
  getVisitors: async (req, res, next) => {
    try {
      const count = await visitorModel.getVisitorCount();
      res.json({ count });
    } catch (err) {
      next(err);
    }
  },
  hitVisitor: async (req, res, next) => {
    try {
      const nextCount = await visitorModel.incrementVisitorCount();
      logger.info(`Visitor hit recorded. New count: ${nextCount}`);
      res.json({ success: true, count: nextCount });
    } catch (err) {
      next(err);
    }
  }
};

// models/teacherHubModel.ts
var import_supabase_js3 = require("@supabase/supabase-js");
var supabaseUrl2 = process.env.SUPABASE_URL;
var supabaseKey2 = process.env.SUPABASE_SERVICE_ROLE_KEY;
var supabase2 = null;
if (!supabaseUrl2 || !supabaseKey2) {
  logger.warn("[SUPABASE CLIENT ERROR] Missing Supabase environment variables! Teacher Hub database operations will fail on invocation.");
} else {
  supabase2 = (0, import_supabase_js3.createClient)(supabaseUrl2, supabaseKey2, {
    auth: {
      persistSession: false
    }
  });
  logger.info("[SUPABASE CLIENT] Supabase client initialized cleanly for strict Teacher Hub operations.");
}
var teacherHubModel = {
  getData: async () => {
    try {
      logger.info("[SUPABASE FETCH] Fetching global state from Supabase 'teacher_hub_data' table...");
      const { data, error } = await supabase2.from("teacher_hub_data").select("payload").eq("id", "global_state").single();
      if (error) {
        throw error;
      }
      if (data && data.payload) {
        const parsed = data.payload;
        return {
          teachers: Array.isArray(parsed.teachers) ? parsed.teachers : [],
          requests: Array.isArray(parsed.requests) ? parsed.requests : [],
          notifications: Array.isArray(parsed.notifications) ? parsed.notifications : [],
          successStories: Array.isArray(parsed.successStories) ? parsed.successStories : [],
          auditLogs: Array.isArray(parsed.auditLogs) ? parsed.auditLogs : []
        };
      }
    } catch (err) {
      logger.error("[SUPABASE FETCH ERROR] Unexpected exception during Supabase query:", err.message);
      throw err;
    }
    return null;
  },
  saveData: async (data) => {
    let existing = {
      teachers: [],
      requests: [],
      notifications: [],
      successStories: [],
      auditLogs: []
    };
    const currentData = await teacherHubModel.getData();
    if (currentData) {
      existing = currentData;
    }
    const mergedTeachers = [...existing.teachers];
    for (const incoming of data.teachers) {
      const indexByMobile = mergedTeachers.findIndex((t) => t.mobile && incoming.mobile && t.mobile === incoming.mobile);
      const indexById = mergedTeachers.findIndex((t) => t.id === incoming.id);
      if (indexByMobile > -1) {
        mergedTeachers[indexByMobile] = { ...mergedTeachers[indexByMobile], ...incoming };
      } else if (indexById > -1) {
        mergedTeachers[indexById] = { ...mergedTeachers[indexById], ...incoming };
      } else {
        const isFiller = incoming.id && incoming.id.startsWith("t-gen-");
        if (!isFiller) {
          logger.info(`[REGISTRATION REQUEST] Registering/adding new profile: ${incoming.name} (Mobile: ${incoming.mobile})`);
          mergedTeachers.unshift(incoming);
        }
      }
    }
    const mergedRequests = [...existing.requests];
    for (const incoming of data.requests) {
      const index = mergedRequests.findIndex((r) => r.id === incoming.id);
      if (index > -1) {
        mergedRequests[index] = { ...mergedRequests[index], ...incoming };
      } else {
        mergedRequests.push(incoming);
      }
    }
    const mergedNotifications = [...existing.notifications];
    for (const incoming of data.notifications) {
      const index = mergedNotifications.findIndex((n) => n.id === incoming.id);
      if (index > -1) {
        mergedNotifications[index] = { ...mergedNotifications[index], ...incoming };
      } else {
        mergedNotifications.unshift(incoming);
      }
    }
    const mergedSuccessStories = [...existing.successStories];
    for (const incoming of data.successStories) {
      const index = mergedSuccessStories.findIndex((s) => s.id === incoming.id);
      if (index > -1) {
        mergedSuccessStories[index] = { ...mergedSuccessStories[index], ...incoming };
      } else {
        mergedSuccessStories.unshift(incoming);
      }
    }
    const mergedAuditLogs = [...existing.auditLogs];
    for (const incoming of data.auditLogs) {
      const index = mergedAuditLogs.findIndex((a) => a.id === incoming.id);
      if (index > -1) {
        mergedAuditLogs[index] = { ...mergedAuditLogs[index], ...incoming };
      } else {
        mergedAuditLogs.unshift(incoming);
      }
    }
    const mergedPayload = {
      teachers: mergedTeachers,
      requests: mergedRequests,
      notifications: mergedNotifications.slice(0, 500),
      successStories: mergedSuccessStories,
      auditLogs: mergedAuditLogs.slice(0, 500)
    };
    try {
      logger.info("[SUPABASE SAVE] Upserting merged payload to Supabase 'teacher_hub_data' table...");
      const { error } = await supabase2.from("teacher_hub_data").upsert({
        id: "global_state",
        payload: mergedPayload,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      });
      if (error) {
        throw error;
      }
      logger.info(`[SUPABASE SAVE SUCCESS] Successfully committed merged database to Supabase. Total teachers: ${mergedTeachers.length}`);
      return true;
    } catch (err) {
      logger.error(`[SUPABASE SAVE ERROR] Failed to save merged state to Supabase: ${err.message || err}.`);
      throw err;
    }
  }
};

// controllers/teacherHubController.ts
var teacherHubController = {
  getData: async (req, res, next) => {
    try {
      const data = await teacherHubModel.getData();
      if (!data) {
        res.json({ exists: false });
        return;
      }
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      res.json({ exists: true, ...data });
    } catch (err) {
      next(err);
    }
  },
  saveData: async (req, res, next) => {
    try {
      const { teachers, requests, notifications, successStories, auditLogs } = req.body;
      const success = await teacherHubModel.saveData({
        teachers: Array.isArray(teachers) ? teachers : [],
        requests: Array.isArray(requests) ? requests : [],
        notifications: Array.isArray(notifications) ? notifications : [],
        successStories: Array.isArray(successStories) ? successStories : [],
        auditLogs: Array.isArray(auditLogs) ? auditLogs : []
      });
      if (success) {
        logger.info(`Teacher Hub centralized database synced successfully with ${teachers?.length || 0} profiles.`);
        res.json({ success: true });
      } else {
        res.status(500).json({ success: false, error: "Failed to write database file." });
      }
    } catch (err) {
      next(err);
    }
  }
};

// controllers/authController.ts
var import_jsonwebtoken = __toESM(require("jsonwebtoken"), 1);

// models/userModel.ts
var import_supabase_js4 = require("@supabase/supabase-js");
var import_crypto = __toESM(require("crypto"), 1);
var supabaseUrl3 = process.env.SUPABASE_URL;
var supabaseKey3 = process.env.SUPABASE_SERVICE_ROLE_KEY;
var supabase3 = null;
if (!supabaseUrl3 || !supabaseKey3) {
  logger.warn("[SUPABASE USER MODEL] Missing Supabase environment variables! User database operations will fail on invocation.");
} else {
  supabase3 = (0, import_supabase_js4.createClient)(supabaseUrl3, supabaseKey3, {
    auth: {
      persistSession: false
    }
  });
  logger.info("[SUPABASE USER MODEL] Supabase client initialized for User Authentication and cloud user-data syncing.");
}
var userModel = {
  /**
   * Helper to retrieve auth user ID (UUID) by email
   */
  getAuthUuidByEmail: async (email) => {
    try {
      const { data, error } = await supabase3.auth.admin.listUsers();
      if (!error && data?.users) {
        const user = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase().trim());
        if (user) return user.id;
      }
    } catch (e) {
      console.error("[getAuthUuidByEmail] Error resolving UUID:", e);
    }
    return null;
  },
  /**
   * Helper to fetch data for a user by stable UUID or email
   */
  getUserDataByUuidOrEmail: async (uuid, email) => {
    const cleanEmail = email.toLowerCase().trim();
    let account = null;
    try {
      console.log(`[DATABASE QUERY AUDIT] Searching profile in 'paisa_user_data' by UUID: ${uuid}`);
      let { data, error } = await supabase3.from("paisa_user_data").select("*").eq("id", uuid).single();
      if (!error && data) {
        console.log(`[DATABASE QUERY SUCCESS] Profile found by UUID in 'paisa_user_data': ${uuid}`);
        account = {
          email: cleanEmail,
          userId: uuid,
          name: data.name || cleanEmail.split("@")[0],
          role: data.role || "user",
          profilePhoto: data.profile_photo || "\u{1F9D1}\u200D\u{1F4BC}",
          profilesList: Array.isArray(data.profiles_list) ? data.profiles_list : [],
          activeProfileId: data.active_profile_id || "profile-main",
          savedCalculations: Array.isArray(data.saved_calculations) ? data.saved_calculations : [],
          bookmarkedTools: Array.isArray(data.bookmarked_tools) ? data.bookmarked_tools : [],
          notifications: Array.isArray(data.notifications) ? data.notifications : [],
          createdAt: data.created_at || (/* @__PURE__ */ new Date()).toISOString(),
          updatedAt: data.updated_at,
          status: data.status || "active",
          last_login_at: data.last_login_at
        };
      } else {
        console.log(`[DATABASE QUERY AUDIT] Profile not found by UUID. Searching by Email in 'paisa_user_data': ${cleanEmail}`);
        let { data: emailData, error: emailErr } = await supabase3.from("paisa_user_data").select("*").eq("email", cleanEmail).single();
        if (!emailErr && emailData) {
          console.log(`[DATABASE QUERY SUCCESS] Profile found by Email in 'paisa_user_data': ${cleanEmail}`);
          if (emailData.id !== uuid && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(emailData.id)) {
            console.log(`[USER MODEL] Migrating legacy profile ID ${emailData.id} to UUID ${uuid}`);
            await supabase3.from("paisa_user_data").delete().eq("id", emailData.id);
          }
          account = {
            email: cleanEmail,
            userId: uuid,
            // Bind the UUID now
            name: emailData.name || cleanEmail.split("@")[0],
            role: emailData.role || "user",
            profilePhoto: emailData.profile_photo || "\u{1F9D1}\u200D\u{1F4BC}",
            profilesList: Array.isArray(emailData.profiles_list) ? emailData.profiles_list : [],
            activeProfileId: emailData.active_profile_id || "profile-main",
            savedCalculations: Array.isArray(emailData.saved_calculations) ? emailData.saved_calculations : [],
            bookmarkedTools: Array.isArray(emailData.bookmarked_tools) ? emailData.bookmarked_tools : [],
            notifications: Array.isArray(emailData.notifications) ? emailData.notifications : [],
            createdAt: emailData.created_at || (/* @__PURE__ */ new Date()).toISOString(),
            updatedAt: emailData.updated_at,
            status: emailData.status || "active",
            last_login_at: emailData.last_login_at
          };
          await userModel.saveUserData(account);
        }
      }
    } catch (err) {
      console.error("[DATABASE QUERY EXCEPTION] Unexpected error in getUserDataByUuidOrEmail:", err);
      throw err;
    }
    return account;
  },
  /**
   * Helper to fetch data for a user
   */
  getUserData: async (emailOrId) => {
    const cleanIdentifier = emailOrId.toLowerCase().trim();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanIdentifier);
    let account = null;
    let uuid = isUuid ? cleanIdentifier : null;
    let email = isUuid ? null : cleanIdentifier;
    try {
      if (uuid) {
        console.log(`[DATABASE QUERY AUDIT] Executing select query on table 'paisa_user_data' for UUID: ${uuid}`);
        const { data, error } = await supabase3.from("paisa_user_data").select("*").eq("id", uuid).single();
        if (!error && data) {
          console.log(`[DATABASE QUERY SUCCESS] Successfully retrieved user record for UUID: ${uuid}`);
          account = {
            email: data.email || "",
            userId: uuid,
            name: data.name || "",
            role: data.role || "user",
            profilePhoto: data.profile_photo || "\u{1F9D1}\u200D\u{1F4BC}",
            profilesList: Array.isArray(data.profiles_list) ? data.profiles_list : [],
            activeProfileId: data.active_profile_id || "profile-main",
            savedCalculations: Array.isArray(data.saved_calculations) ? data.saved_calculations : [],
            bookmarkedTools: Array.isArray(data.bookmarked_tools) ? data.bookmarked_tools : [],
            notifications: Array.isArray(data.notifications) ? data.notifications : [],
            createdAt: data.created_at || (/* @__PURE__ */ new Date()).toISOString(),
            updatedAt: data.updated_at,
            status: data.status || "active",
            last_login_at: data.last_login_at
          };
        }
      }
      if (!account && email) {
        console.log(`[DATABASE QUERY AUDIT] Executing select query on table 'paisa_user_data' for email: ${email}`);
        const { data, error } = await supabase3.from("paisa_user_data").select("*").eq("email", email).single();
        if (!error && data) {
          console.log(`[DATABASE QUERY SUCCESS] Successfully retrieved user record for email: ${email}`);
          account = {
            email,
            userId: data.id,
            name: data.name || "",
            role: data.role || "user",
            profilePhoto: data.profile_photo || "\u{1F9D1}\u200D\u{1F4BC}",
            profilesList: Array.isArray(data.profiles_list) ? data.profiles_list : [],
            activeProfileId: data.active_profile_id || "profile-main",
            savedCalculations: Array.isArray(data.saved_calculations) ? data.saved_calculations : [],
            bookmarkedTools: Array.isArray(data.bookmarked_tools) ? data.bookmarked_tools : [],
            notifications: Array.isArray(data.notifications) ? data.notifications : [],
            createdAt: data.created_at || (/* @__PURE__ */ new Date()).toISOString(),
            updatedAt: data.updated_at,
            status: data.status || "active",
            last_login_at: data.last_login_at
          };
        }
      }
    } catch (err) {
      console.error("[DATABASE QUERY EXCEPTION] Unexpected error in select query:", err);
      throw err;
    }
    if (!account && email) {
      console.log(`[USER MODEL] User account not found for ${email}. Automatically provisioning default profile...`);
      let resolvedUuid = await userModel.getAuthUuidByEmail(email);
      if (!resolvedUuid) {
        resolvedUuid = import_crypto.default.randomUUID();
        console.log(`[USER MODEL] Generated random UUID for default profile: ${resolvedUuid}`);
      }
      const defaultUser = {
        email,
        userId: resolvedUuid,
        name: email.split("@")[0] || "User",
        role: email === "deepak.mm1301@gmail.com" ? "super_admin" : "user",
        profilePhoto: "\u{1F9D1}\u200D\u{1F4BC}",
        profilesList: [{
          id: "profile-main",
          name: email.split("@")[0] || "User",
          mobile: "",
          state: "Bihar",
          district: "",
          occupation: "Teacher",
          schoolDept: "",
          age: 26,
          retirementAge: 60,
          salary: 75e3,
          city: "tier2",
          maritalStatus: "dependents",
          dependentsCount: 2,
          currentSavings: 12e4,
          loans: { homeLoan: 0, personalLoan: 0, carLoan: 0, otherLoan: 0 },
          investments: { mutualFunds: 0, stocks: 0, gold: 0, epf: 0, ppf: 0, nps: 0, realEstate: 0 },
          monthlyExpenses: 35e3,
          healthInsuranceCover: 5e5,
          termInsuranceCover: 5e6
        }],
        activeProfileId: "profile-main",
        savedCalculations: [],
        bookmarkedTools: [],
        notifications: [
          {
            id: "welcome-noti-" + Date.now(),
            title: "Welcome to Paisa Blueprint!",
            body: "Create or switch portfolios, bookmark financial calculators, and save plans directly in your account.",
            type: "system",
            isRead: false,
            createdAt: (/* @__PURE__ */ new Date()).toISOString()
          }
        ],
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      try {
        await userModel.saveUserData(defaultUser);
        console.log(`[USER MODEL] Successfully auto-provisioned default profile for ${email}`);
        account = defaultUser;
      } catch (err) {
        console.error(`[USER MODEL ERROR] Failed to auto-provision profile for ${email}:`, err);
        throw err;
      }
    }
    return account;
  },
  /**
   * Helper to save/update user account data
   */
  saveUserData: async (user) => {
    const cleanEmail = user.email.toLowerCase().trim();
    user.email = cleanEmail;
    try {
      let resolvedId = user.userId;
      if (!resolvedId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(resolvedId)) {
        console.log(`[USER MODEL] saveUserData called with invalid or missing UUID for ${cleanEmail}. Resolving from Supabase Auth...`);
        const foundUuid = await userModel.getAuthUuidByEmail(cleanEmail);
        if (foundUuid) {
          resolvedId = foundUuid;
          user.userId = foundUuid;
        } else {
          resolvedId = import_crypto.default.randomUUID();
          user.userId = resolvedId;
          console.warn(`[USER MODEL] No Supabase Auth user found for ${cleanEmail}. Generated random UUID: ${resolvedId}`);
        }
      }
      const payload = {
        id: resolvedId,
        // Store strictly by stable Supabase UUID
        email: cleanEmail,
        name: user.name,
        role: cleanEmail === "deepak.mm1301@gmail.com" ? "super_admin" : user.role || "user",
        profile_photo: user.profilePhoto || "\u{1F9D1}\u200D\u{1F4BC}",
        profiles_list: user.profilesList,
        active_profile_id: user.activeProfileId,
        saved_calculations: user.savedCalculations,
        bookmarked_tools: user.bookmarkedTools,
        notifications: user.notifications,
        updated_at: (/* @__PURE__ */ new Date()).toISOString(),
        last_login_at: user.last_login_at,
        status: user.status || "active"
      };
      console.log(`[DATABASE QUERY AUDIT] Executing upsert query on table 'paisa_user_data' for user ID: ${payload.id}`);
      const { error } = await supabase3.from("paisa_user_data").upsert(payload);
      if (error) {
        console.error(`[DATABASE RESPONSE ERROR] Supabase upsert failed for ${payload.id}:`, error);
        throw error;
      }
      logger.info(`[SUPABASE SYNC SUCCESS] Synced profile details for ${payload.id} to Supabase 'paisa_user_data'.`);
      return true;
    } catch (err) {
      console.error(`[DATABASE QUERY EXCEPTION] Complete database error during upsert for ${cleanEmail}:`, err);
      throw err;
    }
  },
  /**
   * Admin: Get all registered user accounts
   */
  getAllUsers: async () => {
    try {
      const { data, error } = await supabase3.from("paisa_user_data").select("*");
      if (error) {
        throw error;
      }
      if (data) {
        return data.map((d) => ({
          email: d.email || "",
          userId: d.id,
          name: d.name,
          role: d.email === "deepak.mm1301@gmail.com" ? "super_admin" : d.role || "user",
          status: d.status || "active",
          profilePhoto: d.profile_photo || "\u{1F9D1}\u200D\u{1F4BC}",
          profilesList: Array.isArray(d.profiles_list) ? d.profiles_list : [],
          activeProfileId: d.active_profile_id || "profile-main",
          savedCalculations: Array.isArray(d.saved_calculations) ? d.saved_calculations : [],
          bookmarkedTools: Array.isArray(d.bookmarked_tools) ? d.bookmarked_tools : [],
          notifications: Array.isArray(d.notifications) ? d.notifications : [],
          createdAt: d.created_at || (/* @__PURE__ */ new Date()).toISOString()
        }));
      }
    } catch (err) {
      logger.error("[USER MODEL ERROR] Failed to fetch all users from Supabase:", err.message);
      throw err;
    }
    return [];
  },
  /**
   * Admin: Update user role (e.g. from user to moderator or admin)
   */
  updateUserRole: async (email, role) => {
    const cleanEmail = email.toLowerCase().trim();
    if (cleanEmail === "deepak.mm1301@gmail.com") {
      logger.warn("[USER MODEL] Protection trigger: cannot modify super_admin role for deepak.mm1301@gmail.com");
      return false;
    }
    try {
      const { data, error: fetchErr } = await supabase3.from("paisa_user_data").select("id").eq("email", cleanEmail).single();
      if (fetchErr || !data) {
        throw new Error(`User ${cleanEmail} not found in database.`);
      }
      const { error } = await supabase3.from("paisa_user_data").update({ role, updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", data.id);
      if (error) throw error;
      logger.info(`[SUPABASE ROLE UPDATE] Updated role for ${cleanEmail} to ${role}`);
      return true;
    } catch (err) {
      logger.error(`[USER MODEL ROLE UPDATE ERROR] Supabase role update failed for ${cleanEmail}:`, err.message);
      throw err;
    }
  },
  /**
   * Admin: Update user status (active vs suspended)
   */
  updateUserStatus: async (email, status) => {
    const cleanEmail = email.toLowerCase().trim();
    if (cleanEmail === "deepak.mm1301@gmail.com") {
      logger.warn("[USER MODEL] Protection trigger: cannot suspend primary owner deepak.mm1301@gmail.com");
      return false;
    }
    try {
      const { data, error: fetchErr } = await supabase3.from("paisa_user_data").select("id").eq("email", cleanEmail).single();
      if (fetchErr || !data) {
        throw new Error(`User ${cleanEmail} not found in database.`);
      }
      const { error } = await supabase3.from("paisa_user_data").update({ status, updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", data.id);
      if (error) throw error;
      logger.info(`[SUPABASE STATUS UPDATE] Updated status for ${cleanEmail} to ${status}`);
      return true;
    } catch (err) {
      logger.error(`[USER MODEL STATUS UPDATE ERROR] Supabase status update failed for ${cleanEmail}:`, err.message);
      throw err;
    }
  },
  /**
   * Admin: Direct administrative reset of password
   */
  adminResetPassword: async (email, passwordHash) => {
    const cleanEmail = email.toLowerCase().trim();
    try {
      const { data, error } = await supabase3.auth.admin.listUsers();
      if (error) throw error;
      const usersList = data?.users || [];
      const user = usersList.find((u) => u.email?.toLowerCase() === cleanEmail);
      if (user) {
        const { error: updateError } = await supabase3.auth.admin.updateUserById(user.id, {
          password: passwordHash
          // directly sets a new password
        });
        if (updateError) throw updateError;
        logger.info(`[ADMIN PASSWORD RESET SUCCESS] Supabase Auth password updated for ${cleanEmail}`);
        return true;
      } else {
        throw new Error(`User with email ${cleanEmail} not found in Supabase Auth.`);
      }
    } catch (err) {
      logger.error(`[ADMIN PASSWORD RESET ERROR] Failed to administratively reset password for ${cleanEmail}:`, err.message);
      throw err;
    }
  },
  /**
   * Authenticate / Register using Supabase Auth
   */
  registerUser: async (email, password, name) => {
    const cleanEmail = email.toLowerCase().trim();
    const cleanName = name.trim();
    if (!cleanEmail.includes("@") || cleanEmail.length < 5) {
      return { success: false, error: "Please provide a valid email address." };
    }
    if (password.length < 6) {
      return { success: false, error: "Password must be at least 6 characters long." };
    }
    try {
      logger.info(`[SUPABASE AUTH REGISTER] Registering user in Supabase Auth: ${cleanEmail}`);
      const { data, error } = await supabase3.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            name: cleanName,
            role: cleanEmail === "deepak.mm1301@gmail.com" ? "super_admin" : "user"
          }
        }
      });
      if (error) {
        logger.error(`[SUPABASE REGISTER ERROR] Auth.signUp failed: ${error.message}`);
        return { success: false, error: error.message };
      }
      const uuid = data.user?.id;
      if (!uuid) {
        return { success: false, error: "Registration failed: No user UUID returned from Supabase Auth." };
      }
      const newUser = {
        email: cleanEmail,
        userId: uuid,
        // Permanent UUID
        name: cleanName,
        role: cleanEmail === "deepak.mm1301@gmail.com" ? "super_admin" : "user",
        profilePhoto: "\u{1F9D1}\u200D\u{1F4BC}",
        profilesList: [{
          id: "profile-main",
          name: cleanName,
          age: 26,
          retirementAge: 60,
          salary: 75e3,
          city: "tier2",
          maritalStatus: "dependents",
          dependentsCount: 2,
          currentSavings: 12e4,
          loans: { homeLoan: 0, personalLoan: 0, carLoan: 0, otherLoan: 0 },
          investments: { mutualFunds: 0, stocks: 0, gold: 0, epf: 0, ppf: 0, nps: 0, realEstate: 0 },
          monthlyExpenses: 35e3,
          healthInsuranceCover: 5e5,
          termInsuranceCover: 5e6
        }],
        activeProfileId: "profile-main",
        savedCalculations: [],
        bookmarkedTools: [],
        notifications: [
          {
            id: "welcome-noti-" + Date.now(),
            title: "Welcome to Paisa Blueprint!",
            body: "Create or switch portfolios, bookmark financial calculators, and save plans directly in your account.",
            type: "system",
            isRead: false,
            createdAt: (/* @__PURE__ */ new Date()).toISOString()
          }
        ],
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      await userModel.saveUserData(newUser);
      logger.info(`[SUPABASE REGISTER SUCCESS] Created user profile keyed by stable UUID: ${uuid}`);
      return { success: true, user: newUser, session: data.session };
    } catch (err) {
      logger.error("[SUPABASE REGISTER EXCEPTION] Registration failed on cloud:", err);
      return { success: false, error: err.message || "Central signup server error. Please try again." };
    }
  },
  /**
   * User login auth verification
   */
  authenticateUser: async (email, password) => {
    const cleanEmail = email.toLowerCase().trim();
    try {
      logger.info(`[SUPABASE AUTH LOGIN] Authenticating email: ${cleanEmail}`);
      const { data, error } = await supabase3.auth.signInWithPassword({
        email: cleanEmail,
        password
      });
      if (error) {
        logger.error(`[SUPABASE AUTH LOGIN ERROR] Sign in failed for ${cleanEmail}: ${error.message}`);
        return { success: false, error: error.message };
      }
      const uuid = data.user?.id;
      if (!uuid) {
        return { success: false, error: "Authentication failed: No user ID returned from Supabase Auth." };
      }
      let userProfile = await userModel.getUserDataByUuidOrEmail(uuid, cleanEmail);
      if (!userProfile) {
        console.log(`[USER MODEL] Profile metadata missing for ${cleanEmail} (ID: ${uuid}) during login. Creating default profile...`);
        const defaultUser = {
          email: cleanEmail,
          userId: uuid,
          name: data.user?.user_metadata?.name || cleanEmail.split("@")[0] || "User",
          role: cleanEmail === "deepak.mm1301@gmail.com" ? "super_admin" : "user",
          profilePhoto: "\u{1F9D1}\u200D\u{1F4BC}",
          profilesList: [{
            id: "profile-main",
            name: data.user?.user_metadata?.name || cleanEmail.split("@")[0] || "User",
            mobile: "",
            state: "Bihar",
            district: "",
            occupation: "Teacher",
            schoolDept: "",
            age: 26,
            retirementAge: 60,
            salary: 75e3,
            city: "tier2",
            maritalStatus: "dependents",
            dependentsCount: 2,
            currentSavings: 12e4,
            loans: { homeLoan: 0, personalLoan: 0, carLoan: 0, otherLoan: 0 },
            investments: { mutualFunds: 0, stocks: 0, gold: 0, epf: 0, ppf: 0, nps: 0, realEstate: 0 },
            monthlyExpenses: 35e3,
            healthInsuranceCover: 5e5,
            termInsuranceCover: 5e6
          }],
          activeProfileId: "profile-main",
          savedCalculations: [],
          bookmarkedTools: [],
          notifications: [
            {
              id: "welcome-noti-" + Date.now(),
              title: "Welcome to Paisa Blueprint!",
              body: "Create or switch portfolios, bookmark financial calculators, and save plans directly in your account.",
              type: "system",
              isRead: false,
              createdAt: (/* @__PURE__ */ new Date()).toISOString()
            }
          ],
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        try {
          await userModel.saveUserData(defaultUser);
          console.log(`[USER MODEL] Successfully auto-created profile for ${cleanEmail} during login.`);
          userProfile = defaultUser;
        } catch (createErr) {
          console.error(`[USER MODEL ERROR] Failed to auto-create profile during login for ${cleanEmail}:`, createErr);
          return { success: false, error: "Failed to automatically provision user profile during login." };
        }
      }
      userProfile.last_login_at = (/* @__PURE__ */ new Date()).toISOString();
      await userModel.saveUserData(userProfile);
      logger.info(`[SUPABASE AUTH LOGIN SUCCESS] Authenticated successfully for ${cleanEmail}`);
      return { success: true, user: userProfile, session: data.session };
    } catch (err) {
      logger.error(`[SUPABASE AUTH LOGIN EXCEPTION] Sign in exception for ${cleanEmail}:`, err);
      return { success: false, error: err.message || "An unexpected error occurred during login." };
    }
  },
  /**
   * Delete user account completely
   */
  deleteUser: async (email) => {
    const cleanEmail = email.toLowerCase().trim();
    try {
      const { data: profile } = await supabase3.from("paisa_user_data").select("id").eq("email", cleanEmail).single();
      const uuid = profile?.id;
      if (uuid) {
        await supabase3.from("paisa_user_data").delete().eq("id", uuid);
      }
      if (uuid) {
        await supabase3.auth.admin.deleteUser(uuid);
      }
      logger.info(`[SUPABASE DELETION SUCCESS] Deleted profile and auth for ${cleanEmail}.`);
      return true;
    } catch (err) {
      logger.error(`[SUPABASE DELETION ERROR] Failed to completely delete user ${cleanEmail}:`, err.message);
      throw err;
    }
  }
};

// controllers/authController.ts
var originalFetch = globalThis.fetch;
globalThis.fetch = async function(input, init) {
  const url = typeof input === "string" ? input : input?.url || "";
  if (url.includes("/auth/v1/recover")) {
    console.log("=====================================================");
    console.log("[OUTGOING SUPABASE AUDIT] Intercepted /auth/v1/recover");
    console.log("[OUTGOING SUPABASE AUDIT] Request URL:", url);
    console.log("[OUTGOING SUPABASE AUDIT] Request Headers:", init?.headers);
    if (init?.body) {
      try {
        const bodyStr = typeof init.body === "string" ? init.body : new TextDecoder().decode(init.body);
        console.log("[OUTGOING SUPABASE AUDIT] Request Body:", bodyStr);
      } catch (e) {
        console.log("[OUTGOING SUPABASE AUDIT] Request Body (failed to decode):", init.body);
      }
    }
    console.log("=====================================================");
  }
  return originalFetch.apply(this, arguments);
};
var ACCESS_COOKIE_NAME = "paisa_access_token";
function generateAccessToken(payload) {
  return import_jsonwebtoken.default.sign(payload, env.JWT_SECRET, { expiresIn: "7d" });
}
var authController = {
  /**
   * Middleware to protect secure API routes
   */
  requireAuth: async (req, res, next) => {
    try {
      const hasAuthHeader = !!req.headers.authorization;
      const authHeaderValue = req.headers.authorization || "";
      const cookiePresent = !!req.cookies[ACCESS_COOKIE_NAME];
      const token = req.headers.authorization?.split(" ")[1] || req.cookies[ACCESS_COOKIE_NAME];
      console.log("[BACKEND AUTH AUDIT] Received Authorization Header:", hasAuthHeader ? "YES" : "NO");
      console.log("[BACKEND AUTH AUDIT] Header Value:", authHeaderValue ? `${authHeaderValue.slice(0, 15)}...` : "NONE");
      console.log("[BACKEND AUTH AUDIT] Cookie Present:", cookiePresent ? "YES" : "NO");
      console.log("[BACKEND AUTH AUDIT] Extracted Token length:", token ? token.length : 0);
      if (!token) {
        console.error("[BACKEND AUTH ERROR] Authentication failed: No token found in request headers or cookies.");
        res.status(401).json({ error: "Unauthorized", message: "Please log in to access this feature." });
        return;
      }
      let email = null;
      let nameFallback = "";
      let roleFallback = "user";
      let userIdFallback = void 0;
      try {
        console.log("[BACKEND AUTH AUDIT] Attempting local JWT verification...");
        const decoded = import_jsonwebtoken.default.verify(token, env.JWT_SECRET);
        console.log("[BACKEND AUTH SUCCESS] User verified via Local JWT:", decoded.email);
        email = decoded.email;
        nameFallback = decoded.name;
        roleFallback = decoded.role;
        userIdFallback = decoded.userId;
      } catch (localErr) {
        console.log("[BACKEND AUTH INFO] Local JWT verification failed or bypassed:", localErr.message || localErr);
      }
      if (!email && supabase3) {
        try {
          console.log("[BACKEND AUTH AUDIT] Attempting Supabase token verification with official getUser...");
          const { data: { user }, error } = await supabase3.auth.getUser(token);
          if (error) {
            console.error("[BACKEND AUTH ERROR] Supabase token verification failed:", error.message, "Full error details:", error);
            let mappedMsg = error.message;
            if (error.message.includes("expired") || error.message.includes("token is expired")) {
              mappedMsg = "Session expired";
            } else if (error.message.includes("invalid") || error.message.includes("signature") || error.message.includes("bad_jwt")) {
              mappedMsg = "Invalid token";
            }
            res.status(401).json({ error: "Unauthorized", message: mappedMsg, details: error });
            return;
          }
          if (user) {
            console.log("[BACKEND AUTH SUCCESS] User verified via Supabase JWT:", user.email);
            email = user.email || "";
            nameFallback = user.user_metadata?.name || user.email?.split("@")[0] || "User";
            roleFallback = user.user_metadata?.role || "user";
            userIdFallback = user.id;
          }
        } catch (sbErr) {
          console.error("[BACKEND AUTH WARNING] Supabase token check exception:", sbErr.message || sbErr);
          res.status(401).json({ error: "Unauthorized", message: "Supabase authorization failed", details: sbErr.message || sbErr });
          return;
        }
      }
      if (email) {
        const cleanEmail = email.toLowerCase().trim();
        const lookupKey = userIdFallback || cleanEmail;
        const account = await userModel.getUserData(lookupKey);
        if (account && account.status === "suspended") {
          console.warn("[BACKEND AUTH EXCLUSION] Suspended user rejected immediately:", cleanEmail);
          res.status(403).json({
            error: "Forbidden",
            message: "Your account has been suspended. Access is denied. Please contact our support desk."
          });
          return;
        }
        req.user = {
          email: cleanEmail,
          name: account ? account.name : nameFallback || cleanEmail.split("@")[0],
          role: account ? account.role : roleFallback || "user",
          userId: account ? account.userId : userIdFallback
        };
        next();
        return;
      }
      console.error("[BACKEND AUTH ERROR] All verification methods failed. Denying access.");
      res.status(401).json({ error: "Unauthorized", message: "Invalid or expired token. Please log in again." });
    } catch (err) {
      console.error("[BACKEND AUTH EXCEPTION] Token verification threw an error:", err.message || err);
      logger.warn(`[AUTH MIDDLEWARE WARNING] Token verification failed: ${err}`);
      const errMsg = err.message || "";
      let mappedMsg = "Your session has expired. Please log in again.";
      if (errMsg.includes("expired")) {
        mappedMsg = "Session expired";
      } else if (errMsg.includes("invalid") || errMsg.includes("signature")) {
        mappedMsg = "Invalid token";
      }
      res.status(401).json({ error: "Unauthorized", message: mappedMsg, details: err });
    }
  },
  /**
   * Middleware to protect admin endpoints
   */
  requireAdmin: async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(" ")[1] || req.cookies[ACCESS_COOKIE_NAME];
      if (!token) {
        res.status(401).json({ error: "Unauthorized", message: "Access denied. Admin authorization required." });
        return;
      }
      let email = null;
      let nameFallback = "";
      let roleFallback = "user";
      let userIdFallback = void 0;
      try {
        const decoded = import_jsonwebtoken.default.verify(token, env.JWT_SECRET);
        email = decoded.email;
        nameFallback = decoded.name;
        roleFallback = decoded.role;
        userIdFallback = decoded.userId;
      } catch (localErr) {
      }
      if (!email && supabase3) {
        const { data: { user }, error } = await supabase3.auth.getUser(token);
        if (user && !error) {
          email = user.email || null;
          nameFallback = user.user_metadata?.name || user.email?.split("@")[0] || "User";
          roleFallback = user.user_metadata?.role || "user";
          userIdFallback = user.id;
        }
      }
      if (email) {
        const cleanEmail = email.toLowerCase().trim();
        const lookupKey = userIdFallback || cleanEmail;
        const account = await userModel.getUserData(lookupKey);
        if (account && account.status === "suspended") {
          console.warn("[BACKEND AUTH EXCLUSION] Suspended user rejected from Admin endpoint:", cleanEmail);
          res.status(403).json({
            error: "Forbidden",
            message: "Your account has been suspended. Access is denied. Please contact our support desk."
          });
          return;
        }
        const role = account ? account.role : roleFallback;
        if (role !== "admin" && role !== "super_admin" && role !== "super admin") {
          res.status(403).json({ error: "Forbidden", message: "Access denied. Admin permissions required." });
          return;
        }
        req.user = {
          email: cleanEmail,
          name: account ? account.name : nameFallback || cleanEmail.split("@")[0],
          role,
          userId: account ? account.userId : userIdFallback
        };
        next();
        return;
      }
      res.status(401).json({ error: "Unauthorized", message: "Admin authorization failed." });
    } catch (err) {
      logger.warn(`[AUTH MIDDLEWARE WARNING] Admin verification failed: ${err}`);
      res.status(401).json({ error: "Unauthorized", message: "Session expired or invalid token. Please log in again." });
    }
  },
  /**
   * Email/Password sign up
   */
  signUp: async (req, res, next) => {
    try {
      const { email, password, name } = req.body;
      if (!email || !password || !name) {
        res.status(400).json({ error: "Bad Request", message: "Email, password, and name are required." });
        return;
      }
      const result = await userModel.registerUser(email, password, name);
      if (!result.success || !result.user) {
        res.status(400).json({ error: "Registration Failed", message: result.error || "Failed to register account." });
        return;
      }
      const token = generateAccessToken({
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
        userId: result.user.userId
      });
      res.cookie(ACCESS_COOKIE_NAME, token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1e3
        // 7 days
      });
      res.status(201).json({
        success: true,
        token,
        supabaseSession: result.session,
        user: {
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
          profilePhoto: result.user.profilePhoto || "\u{1F9D1}\u200D\u{1F4BC}",
          userId: result.user.userId
        }
      });
    } catch (err) {
      next(err);
    }
  },
  /**
   * Email/Password login
   */
  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400).json({ error: "Bad Request", message: "Email and password are required." });
        return;
      }
      const result = await userModel.authenticateUser(email, password);
      if (!result.success || !result.user) {
        res.status(401).json({ error: "Authentication Failed", message: result.error || "Invalid email or password." });
        return;
      }
      const token = generateAccessToken({
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
        userId: result.user.userId
      });
      res.cookie(ACCESS_COOKIE_NAME, token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1e3
        // 7 days
      });
      res.json({
        success: true,
        token,
        supabaseSession: result.session,
        user: {
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
          profilePhoto: result.user.profilePhoto || "\u{1F9D1}\u200D\u{1F4BC}",
          userId: result.user.userId
        },
        profilesList: result.user.profilesList,
        activeProfileId: result.user.activeProfileId,
        savedCalculations: result.user.savedCalculations || [],
        bookmarkedTools: result.user.bookmarkedTools || [],
        notifications: result.user.notifications || []
      });
    } catch (err) {
      next(err);
    }
  },
  /**
   * Logout session
   */
  logout: async (req, res) => {
    res.clearCookie(ACCESS_COOKIE_NAME, {
      httpOnly: true,
      secure: true,
      sameSite: "none"
    });
    res.json({ success: true, message: "Logged out successfully." });
  },
  /**
   * Get authenticated user profile and session parameters
   */
  getMe: async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(" ")[1] || req.cookies[ACCESS_COOKIE_NAME];
      if (!token) {
        res.json({ user: null });
        return;
      }
      let email = null;
      let userIdFallback = void 0;
      try {
        const decoded = import_jsonwebtoken.default.verify(token, env.JWT_SECRET);
        email = decoded.email;
        userIdFallback = decoded.userId;
      } catch (localErr) {
      }
      if (!email && supabase3) {
        try {
          const { data: { user }, error } = await supabase3.auth.getUser(token);
          if (user && !error) {
            email = user.email || null;
            userIdFallback = user.id;
          }
        } catch (sbErr) {
          console.warn("[getMe] Supabase verification exception:", sbErr);
        }
      }
      if (!email) {
        res.clearCookie(ACCESS_COOKIE_NAME, {
          httpOnly: true,
          secure: true,
          sameSite: "none"
        });
        res.json({ user: null });
        return;
      }
      const lookupKey = userIdFallback || email;
      const account = await userModel.getUserData(lookupKey);
      if (!account) {
        res.clearCookie(ACCESS_COOKIE_NAME, {
          httpOnly: true,
          secure: true,
          sameSite: "none"
        });
        res.json({ user: null });
        return;
      }
      res.json({
        user: {
          name: account.name,
          email: account.email,
          role: account.role || "user",
          profilePhoto: account.profilePhoto || "\u{1F9D1}\u200D\u{1F4BC}"
        },
        profilesList: account.profilesList,
        profiles: account.profilesList,
        // for UserDashboard compatibility
        activeProfileId: account.activeProfileId,
        savedCalculations: account.savedCalculations || [],
        bookmarkedTools: account.bookmarkedTools || [],
        notifications: account.notifications || []
      });
    } catch (err) {
      res.clearCookie(ACCESS_COOKIE_NAME, {
        httpOnly: true,
        secure: true,
        sameSite: "none"
      });
      res.json({ user: null });
    }
  },
  /**
   * Secure user password update
   */
  changePassword: async (req, res, next) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const email = req.user?.email;
      if (!email || !currentPassword || !newPassword) {
        res.status(400).json({ error: "Bad Request", message: "Current and new passwords are required." });
        return;
      }
      if (!supabase3) {
        res.status(500).json({ error: "Database offline", message: "Supabase connection is not available." });
        return;
      }
      const { data: signInData, error: verifyError } = await supabase3.auth.signInWithPassword({
        email,
        password: currentPassword
      });
      if (verifyError) {
        res.status(400).json({ error: "Invalid Current Password", message: "The current password provided is incorrect." });
        return;
      }
      const { error: updateError } = await supabase3.auth.admin.updateUserById(signInData.user.id, {
        password: newPassword
      });
      if (updateError) {
        res.status(400).json({ error: "Password Update Failed", message: updateError.message });
        return;
      }
      res.json({ success: true, message: "Password updated successfully." });
    } catch (err) {
      next(err);
    }
  },
  /**
   * Forgot password placeholder (notifies via dashboard/email fallback)
   */
  forgotPassword: async (req, res, next) => {
    try {
      const { email } = req.body;
      if (!email) {
        res.status(400).json({ error: "Bad Request", message: "Email is required." });
        return;
      }
      if (supabase3) {
        const rawOrigin = req.get("origin") || process.env.APP_URL || "https://paisablueprint.in";
        const origin = rawOrigin.replace(/\/+$/, "");
        const redirectToUrl = `${origin}/reset-password`;
        console.log("------------------ FORGOT PASSWORD AUDIT ------------------");
        console.log("[AUDIT] Input Email:", email.trim());
        console.log("[AUDIT] req.get('origin'):", req.get("origin"));
        console.log("[AUDIT] process.env.APP_URL:", process.env.APP_URL);
        console.log("[AUDIT] Raw Origin:", rawOrigin);
        console.log("[AUDIT] Cleaned Origin:", origin);
        console.log("[AUDIT] Computed redirectTo url passed to Supabase:", redirectToUrl);
        console.log("-----------------------------------------------------------");
        const { error } = await supabase3.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: redirectToUrl
        });
        if (error) {
          console.error("[AUDIT] Supabase resetPasswordForEmail failed:", error);
          res.status(400).json({ error: "Reset Failed", message: error.message });
          return;
        }
        res.json({ success: true, message: "A password reset link has been dispatched to your email address." });
        return;
      }
      res.status(500).json({ error: "Database offline", message: "Supabase connection is not available." });
    } catch (err) {
      next(err);
    }
  },
  /**
   * Reset Password
   */
  resetPassword: async (req, res, next) => {
    try {
      const { email, newPassword } = req.body;
      if (!email || !newPassword) {
        res.status(400).json({ error: "Bad Request", message: "Email and new password are required." });
        return;
      }
      if (!supabase3) {
        res.status(500).json({ error: "Database offline", message: "Supabase connection is not available." });
        return;
      }
      const { data: authData, error: listError } = await supabase3.auth.admin.listUsers();
      if (listError) {
        res.status(500).json({ error: "Error", message: listError.message });
        return;
      }
      const usersList = authData?.users || [];
      const user = usersList.find((u) => u.email?.toLowerCase() === email.toLowerCase().trim());
      if (!user) {
        res.status(404).json({ error: "Not Found", message: "Account not found." });
        return;
      }
      const { error: updateError } = await supabase3.auth.admin.updateUserById(user.id, {
        password: newPassword
      });
      if (updateError) {
        res.status(400).json({ error: "Reset Failed", message: updateError.message });
        return;
      }
      res.json({ success: true, message: "Your password has been successfully reset. Please log in with your new password." });
    } catch (err) {
      next(err);
    }
  },
  /**
   * Edit profile info
   */
  updateProfile: async (req, res, next) => {
    try {
      const { name, profilePhoto } = req.body;
      const lookupKey = req.user?.userId || req.user?.email;
      if (!lookupKey) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      const account = await userModel.getUserData(lookupKey);
      if (!account) {
        res.status(404).json({ error: "Not Found", message: "Account not found." });
        return;
      }
      if (name) account.name = name.trim();
      if (profilePhoto) account.profilePhoto = profilePhoto;
      await userModel.saveUserData(account);
      res.json({
        success: true,
        user: {
          name: account.name,
          email: account.email,
          role: account.role || "user",
          profilePhoto: account.profilePhoto || "\u{1F9D1}\u200D\u{1F4BC}"
        }
      });
    } catch (err) {
      next(err);
    }
  },
  /**
   * Delete Account
   */
  deleteAccount: async (req, res, next) => {
    try {
      const email = req.user?.email;
      if (!email) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      await userModel.deleteUser(email);
      res.clearCookie(ACCESS_COOKIE_NAME, {
        httpOnly: true,
        secure: true,
        sameSite: "none"
      });
      res.json({ success: true, message: "Your account has been deleted permanently." });
    } catch (err) {
      next(err);
    }
  },
  /**
   * Update full list of user portfolios profiles (sync endpoint called by client-side)
   */
  updateProfilesList: async (req, res, next) => {
    try {
      const lookupKey = req.user?.userId || req.user?.email;
      const { profilesList, activeProfileId } = req.body;
      if (!lookupKey) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      const account = await userModel.getUserData(lookupKey);
      if (!account) {
        res.status(404).json({ error: "Not Found" });
        return;
      }
      if (Array.isArray(profilesList)) {
        account.profilesList = profilesList;
      }
      if (activeProfileId) {
        account.activeProfileId = activeProfileId;
      }
      await userModel.saveUserData(account);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  },
  /**
   * Update single portfolio name
   */
  updateAccountName: async (req, res, next) => {
    try {
      const lookupKey = req.user?.userId || req.user?.email;
      const { name, fullName, mobile, state, district, occupation, schoolDept } = req.body;
      const displayName = name || fullName;
      if (!lookupKey || !displayName) {
        res.status(400).json({ error: "Bad Request", message: "Name is required." });
        return;
      }
      const account = await userModel.getUserData(lookupKey);
      if (!account) {
        res.status(404).json({ error: "Not Found", message: "Account not found." });
        return;
      }
      account.name = displayName.trim();
      if (!Array.isArray(account.profilesList)) {
        account.profilesList = [];
      }
      const activeProfileId = account.activeProfileId || "profile-main";
      let profileIndex = account.profilesList.findIndex((p) => p.id === activeProfileId);
      if (profileIndex === -1 && account.profilesList.length > 0) {
        profileIndex = 0;
      }
      if (profileIndex !== -1) {
        const prof = account.profilesList[profileIndex];
        prof.name = displayName.trim();
        if (mobile !== void 0) prof.mobile = mobile;
        if (state !== void 0) prof.state = state;
        if (district !== void 0) prof.district = district;
        if (occupation !== void 0) prof.occupation = occupation;
        if (schoolDept !== void 0) prof.schoolDept = schoolDept;
      } else {
        account.profilesList.push({
          id: "profile-main",
          name: displayName.trim(),
          mobile: mobile || "",
          state: state || "Bihar",
          district: district || "",
          occupation: occupation || "Teacher",
          schoolDept: schoolDept || "",
          age: 26,
          retirementAge: 60,
          salary: 75e3,
          city: "tier2",
          maritalStatus: "dependents",
          dependentsCount: 2,
          currentSavings: 12e4,
          loans: { homeLoan: 0, personalLoan: 0, carLoan: 0, otherLoan: 0 },
          investments: { mutualFunds: 0, stocks: 0, gold: 0, epf: 0, ppf: 0, nps: 0, realEstate: 0 },
          monthlyExpenses: 35e3,
          healthInsuranceCover: 5e5,
          termInsuranceCover: 5e6
        });
      }
      await userModel.saveUserData(account);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  },
  /**
   * Fetch full list of user portfolios profiles
   */
  getProfiles: async (req, res, next) => {
    try {
      const lookupKey = req.query.email || req.user?.userId || req.user?.email;
      if (!lookupKey) {
        res.status(400).json({ error: "Bad Request", message: "Email or User ID is required." });
        return;
      }
      const account = await userModel.getUserData(lookupKey);
      if (!account) {
        res.status(404).json({ error: "Not Found", message: "User account not found." });
        return;
      }
      res.json({
        profilesList: account.profilesList || [],
        profiles: account.profilesList || [],
        activeProfileId: account.activeProfileId || "profile-main"
      });
    } catch (err) {
      next(err);
    }
  }
};

// controllers/lockerController.ts
var lockerController = {
  /**
   * Get all user saved calculations, bookmarks, and notifications
   */
  getLocker: async (req, res, next) => {
    try {
      const email = req.user?.email;
      if (!email) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      const account = await userModel.getUserData(email);
      if (!account) {
        res.status(404).json({ error: "Not Found", message: "User account not found." });
        return;
      }
      res.json({
        savedCalculations: account.savedCalculations || [],
        bookmarkedTools: account.bookmarkedTools || [],
        notifications: account.notifications || []
      });
    } catch (err) {
      next(err);
    }
  },
  /**
   * Save a calculation (Salary, SIP, Loan, Pension, Tax, etc.)
   */
  saveCalculation: async (req, res, next) => {
    try {
      const email = req.user?.email;
      const { title, type, data } = req.body;
      if (!email) {
        console.error("[BACKEND SAVE ERROR] saveCalculation: Missing user id");
        res.status(401).json({ error: "Unauthorized", message: "Missing user id" });
        return;
      }
      if (!title || !type || !data) {
        res.status(400).json({ error: "Bad Request", message: "Title, type, and calculation data are required." });
        return;
      }
      console.log("[DATABASE REQUEST] Fetching user details for:", email);
      const account = await userModel.getUserData(email);
      console.log("[DATABASE RESPONSE] Fetched user account details exists:", !!account);
      if (!account) {
        console.error("[BACKEND SAVE ERROR] User account not found for:", email);
        res.status(404).json({ error: "Not Found", message: "User account not found." });
        return;
      }
      const now = (/* @__PURE__ */ new Date()).toISOString();
      const newCalculation = {
        id: "calc-" + Math.random().toString(36).substring(2, 15),
        title: title.trim(),
        type: type.trim(),
        createdAt: now,
        updatedAt: now,
        data
      };
      if (!account.savedCalculations) {
        account.savedCalculations = [];
      }
      account.savedCalculations.push(newCalculation);
      console.log("[DATABASE REQUEST] Saving updated user account details to database for:", email);
      try {
        await userModel.saveUserData(account);
        console.log("[DATABASE RESPONSE] Save user data succeeded.");
        res.status(201).json(newCalculation);
      } catch (saveErr) {
        console.error("[DATABASE RESPONSE ERROR] Complete database error during Save to Vault:", saveErr);
        res.status(500).json({
          error: "Database Insertion Failed",
          message: saveErr.message || "Database insert failed",
          details: saveErr
        });
      }
    } catch (err) {
      next(err);
    }
  },
  /**
   * Update saved calculation (title or data payload)
   */
  updateCalculation: async (req, res, next) => {
    try {
      const email = req.user?.email;
      const { id } = req.params;
      const { title, data } = req.body;
      if (!email) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      const account = await userModel.getUserData(email);
      if (!account) {
        res.status(404).json({ error: "Not Found" });
        return;
      }
      const item = account.savedCalculations?.find((c) => c.id === id);
      if (!item) {
        res.status(404).json({ error: "Not Found", message: "Calculation not found." });
        return;
      }
      if (title !== void 0) item.title = title.trim();
      if (data !== void 0) item.data = data;
      item.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
      await userModel.saveUserData(account);
      res.json(item);
    } catch (err) {
      next(err);
    }
  },
  /**
   * Delete saved calculation
   */
  deleteCalculation: async (req, res, next) => {
    try {
      const email = req.user?.email;
      const { id } = req.params;
      if (!email) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      const account = await userModel.getUserData(email);
      if (!account) {
        res.status(404).json({ error: "Not Found" });
        return;
      }
      account.savedCalculations = account.savedCalculations?.filter((c) => c.id !== id) || [];
      await userModel.saveUserData(account);
      res.json({ success: true, message: "Calculation plan deleted successfully." });
    } catch (err) {
      next(err);
    }
  },
  /**
   * Toggle Bookmark for a tool/calculator
   */
  toggleBookmark: async (req, res, next) => {
    try {
      const email = req.user?.email;
      const { toolId, name, category, path: path2 } = req.body;
      if (!email) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      if (!toolId || !name) {
        res.status(400).json({ error: "Bad Request", message: "Tool ID and name are required." });
        return;
      }
      const account = await userModel.getUserData(email);
      if (!account) {
        res.status(404).json({ error: "Not Found" });
        return;
      }
      if (!account.bookmarkedTools) {
        account.bookmarkedTools = [];
      }
      const exists = account.bookmarkedTools.some((b) => b.toolId === toolId);
      if (exists) {
        account.bookmarkedTools = account.bookmarkedTools.filter((b) => b.toolId !== toolId);
      } else {
        account.bookmarkedTools.push({
          toolId,
          name: name.trim(),
          category: category || "Calculator",
          path: path2 || "/",
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        });
      }
      await userModel.saveUserData(account);
      res.json({ success: true, bookmarkedTools: account.bookmarkedTools });
    } catch (err) {
      next(err);
    }
  },
  /**
   * Mark user notification as read
   */
  markNotificationRead: async (req, res, next) => {
    try {
      const email = req.user?.email;
      const { id } = req.params;
      if (!email) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      const account = await userModel.getUserData(email);
      if (!account) {
        res.status(404).json({ error: "Not Found" });
        return;
      }
      const notification = account.notifications?.find((n) => n.id === id);
      if (notification) {
        notification.isRead = true;
        await userModel.saveUserData(account);
      }
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  },
  /**
   * Delete a notification
   */
  deleteNotification: async (req, res, next) => {
    try {
      const email = req.user?.email;
      const { id } = req.params;
      if (!email) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      const account = await userModel.getUserData(email);
      if (!account) {
        res.status(404).json({ error: "Not Found" });
        return;
      }
      account.notifications = account.notifications?.filter((n) => n.id !== id) || [];
      await userModel.saveUserData(account);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  },
  /**
   * Toggle favourite status of a saved calculation
   */
  toggleFavourite: async (req, res, next) => {
    try {
      const email = req.user?.email;
      const { id } = req.params;
      if (!email) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      const account = await userModel.getUserData(email);
      if (!account) {
        res.status(404).json({ error: "Not Found" });
        return;
      }
      const item = account.savedCalculations?.find((c) => c.id === id);
      if (!item) {
        res.status(404).json({ error: "Not Found", message: "Calculation not found." });
        return;
      }
      item.isFavourite = !item.isFavourite;
      item.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
      await userModel.saveUserData(account);
      res.json(item);
    } catch (err) {
      next(err);
    }
  }
};

// controllers/petitionController.ts
var import_bcryptjs = __toESM(require("bcryptjs"), 1);

// models/petitionModel.ts
var import_supabase_js5 = require("@supabase/supabase-js");
var supabaseUrl4 = process.env.SUPABASE_URL;
var supabaseKey4 = process.env.SUPABASE_SERVICE_ROLE_KEY;
var supabase4 = null;
if (!supabaseUrl4 || !supabaseKey4) {
  logger.warn("[PETITION MODEL ERROR] Missing Supabase environment variables! Petition database operations will fail on invocation.");
} else {
  supabase4 = (0, import_supabase_js5.createClient)(supabaseUrl4, supabaseKey4, {
    auth: { persistSession: false }
  });
  logger.info("[PETITION MODEL] Supabase client initialized cleanly in strict database mode.");
}
var petitionModel = {
  /**
   * Fetch all petitions (or matching filters)
   */
  getPetitions: async () => {
    try {
      console.log("[DATABASE QUERY AUDIT] Executing select query on table 'petitions'");
      const { data, error } = await supabase4.from("petitions").select("*").eq("is_deleted", false);
      if (error) {
        throw error;
      }
      if (data) {
        return data.map((p) => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          shortDescription: p.short_description,
          fullDescription: p.full_description,
          category: p.category,
          bannerImage: p.banner_image,
          featuredImage: p.featured_image,
          govDepartment: p.gov_department,
          petitionGoal: p.petition_goal,
          currentSignatures: p.current_signatures,
          status: p.status,
          startDate: p.start_date,
          endDate: p.end_date,
          seoTitle: p.seo_title,
          seoDescription: p.seo_description,
          featured: p.featured,
          createdBy: p.created_by,
          createdAt: p.created_at,
          updatedAt: p.updated_at
        }));
      }
    } catch (err) {
      logger.error("[PETITION MODEL ERROR] Failed to fetch petitions from Supabase:", err.message);
      throw err;
    }
    return [];
  },
  /**
   * Fetch individual petition by slug
   */
  getPetitionBySlug: async (slug) => {
    try {
      console.log(`[DATABASE QUERY AUDIT] Executing select query on table 'petitions' for slug: ${slug}`);
      const { data, error } = await supabase4.from("petitions").select("*").eq("slug", slug).eq("is_deleted", false).single();
      if (error) {
        if (error.code === "PGRST116") {
          return null;
        }
        throw error;
      }
      if (data) {
        return {
          id: data.id,
          title: data.title,
          slug: data.slug,
          shortDescription: data.short_description,
          fullDescription: data.full_description,
          category: data.category,
          bannerImage: data.banner_image,
          featuredImage: data.featured_image,
          govDepartment: data.gov_department,
          petitionGoal: data.petition_goal,
          currentSignatures: data.current_signatures,
          status: data.status,
          startDate: data.start_date,
          endDate: data.end_date,
          seoTitle: data.seo_title,
          seoDescription: data.seo_description,
          featured: data.featured,
          createdBy: data.created_by,
          createdAt: data.created_at,
          updatedAt: data.updated_at
        };
      }
    } catch (err) {
      logger.error(`[PETITION MODEL ERROR] Failed to fetch petition by slug ${slug}:`, err.message);
      throw err;
    }
    return null;
  },
  /**
   * Create a new petition
   */
  createPetition: async (petition) => {
    try {
      const payload = {
        id: petition.id,
        title: petition.title,
        slug: petition.slug,
        short_description: petition.shortDescription,
        full_description: petition.fullDescription,
        category: petition.category,
        banner_image: petition.bannerImage,
        featured_image: petition.featuredImage,
        gov_department: petition.govDepartment,
        petition_goal: petition.petitionGoal,
        current_signatures: petition.currentSignatures,
        status: petition.status,
        start_date: petition.startDate,
        end_date: petition.endDate,
        seo_title: petition.seoTitle,
        seo_description: petition.seoDescription,
        featured: petition.featured,
        created_by: petition.createdBy,
        is_deleted: false,
        created_at: petition.createdAt || (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: petition.updatedAt || (/* @__PURE__ */ new Date()).toISOString()
      };
      console.log(`[DATABASE QUERY AUDIT] Executing insert query on table 'petitions' for ID: ${petition.id}`);
      const { error } = await supabase4.from("petitions").insert(payload);
      if (error) {
        throw error;
      }
      logger.info(`[SUPABASE PETITION CREATE SUCCESS] Created petition ${petition.id}`);
      return true;
    } catch (err) {
      logger.error(`[PETITION MODEL ERROR] Failed to create petition ${petition.id}:`, err.message);
      throw err;
    }
  },
  /**
   * Update an existing petition
   */
  updatePetition: async (id, petition) => {
    try {
      const updates = {};
      if (petition.title !== void 0) updates.title = petition.title;
      if (petition.slug !== void 0) updates.slug = petition.slug;
      if (petition.shortDescription !== void 0) updates.short_description = petition.shortDescription;
      if (petition.fullDescription !== void 0) updates.full_description = petition.fullDescription;
      if (petition.category !== void 0) updates.category = petition.category;
      if (petition.bannerImage !== void 0) updates.banner_image = petition.bannerImage;
      if (petition.featuredImage !== void 0) updates.featured_image = petition.featuredImage;
      if (petition.govDepartment !== void 0) updates.gov_department = petition.govDepartment;
      if (petition.petitionGoal !== void 0) updates.petition_goal = petition.petitionGoal;
      if (petition.currentSignatures !== void 0) updates.current_signatures = petition.currentSignatures;
      if (petition.status !== void 0) updates.status = petition.status;
      if (petition.startDate !== void 0) updates.start_date = petition.startDate;
      if (petition.endDate !== void 0) updates.end_date = petition.endDate;
      if (petition.seoTitle !== void 0) updates.seo_title = petition.seoTitle;
      if (petition.seoDescription !== void 0) updates.seo_description = petition.seoDescription;
      if (petition.featured !== void 0) updates.featured = petition.featured;
      if (petition.createdBy !== void 0) updates.created_by = petition.createdBy;
      updates.updated_at = (/* @__PURE__ */ new Date()).toISOString();
      console.log(`[DATABASE QUERY AUDIT] Executing update query on table 'petitions' for ID: ${id}`);
      const { error } = await supabase4.from("petitions").update(updates).eq("id", id);
      if (error) {
        throw error;
      }
      logger.info(`[SUPABASE PETITION UPDATE SUCCESS] Updated petition ${id}`);
      return true;
    } catch (err) {
      logger.error(`[PETITION MODEL ERROR] Failed to update petition ${id}:`, err.message);
      throw err;
    }
  },
  /**
   * Soft-delete petition
   */
  deletePetition: async (id) => {
    try {
      console.log(`[DATABASE QUERY AUDIT] Executing soft delete query on table 'petitions' for ID: ${id}`);
      const { error } = await supabase4.from("petitions").update({ is_deleted: true, updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", id);
      if (error) {
        throw error;
      }
      logger.info(`[SUPABASE PETITION SOFT DELETE] Soft deleted petition ${id}`);
      return true;
    } catch (err) {
      logger.error(`[PETITION MODEL ERROR] Failed to soft-delete petition ${id}:`, err.message);
      throw err;
    }
  },
  /**
   * Add a signature to a petition and return the final sequence number
   */
  addSignature: async (signature) => {
    try {
      const { count, error: countErr } = await supabase4.from("petition_signatures").select("*", { count: "exact", head: true }).eq("petition_id", signature.petitionId);
      const nextNumber = (count || 0) + 1;
      const payload = {
        id: signature.id,
        petition_id: signature.petitionId,
        user_email: signature.userEmail,
        name: signature.name,
        district: signature.district,
        block: signature.block,
        school: signature.school,
        teacher_category: signature.teacherCategory,
        phone: signature.phone,
        consent: signature.consent,
        signature_number: nextNumber,
        created_at: signature.createdAt || (/* @__PURE__ */ new Date()).toISOString()
      };
      console.log(`[DATABASE QUERY AUDIT] Executing insert query on table 'petition_signatures' for signature: ${signature.id}`);
      const { error: insError } = await supabase4.from("petition_signatures").insert(payload);
      if (insError) {
        throw insError;
      }
      await supabase4.from("petitions").update({ current_signatures: nextNumber, updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", signature.petitionId);
      logger.info(`[SUPABASE SIGNATURE SUCCESS] Registered signature on petition ${signature.petitionId} for email ${signature.userEmail}`);
      return nextNumber;
    } catch (err) {
      logger.error(`[PETITION MODEL ERROR] Failed to register signature:`, err.message);
      throw err;
    }
  },
  /**
   * Check if a user has already signed a specific petition
   */
  hasSigned: async (petitionId, email) => {
    try {
      console.log(`[DATABASE QUERY AUDIT] Checking signature existence for ${email} on petition ${petitionId}`);
      const { data, error } = await supabase4.from("petition_signatures").select("id").eq("petition_id", petitionId).eq("user_email", email.toLowerCase().trim()).limit(1);
      if (error) throw error;
      return Array.isArray(data) && data.length > 0;
    } catch (err) {
      logger.error(`[PETITION MODEL ERROR] Failed to check if user ${email} signed:`, err.message);
      throw err;
    }
  },
  /**
   * Create or update a petition (saves state)
   */
  savePetition: async (petition) => {
    try {
      const payload = {
        id: petition.id,
        title: petition.title,
        slug: petition.slug,
        short_description: petition.shortDescription,
        full_description: petition.fullDescription,
        category: petition.category,
        banner_image: petition.bannerImage,
        featured_image: petition.featuredImage,
        gov_department: petition.govDepartment,
        petition_goal: petition.petitionGoal,
        current_signatures: petition.currentSignatures,
        status: petition.status,
        start_date: petition.startDate,
        end_date: petition.endDate,
        seo_title: petition.seoTitle,
        seo_description: petition.seoDescription,
        featured: petition.featured,
        created_by: petition.createdBy,
        is_deleted: false,
        created_at: petition.createdAt || (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: petition.updatedAt || (/* @__PURE__ */ new Date()).toISOString()
      };
      console.log(`[DATABASE QUERY AUDIT] Executing upsert query on table 'petitions' for ID: ${petition.id}`);
      const { error } = await supabase4.from("petitions").upsert(payload);
      if (error) {
        throw error;
      }
      logger.info(`[SUPABASE PETITION SAVE SUCCESS] Saved petition ${petition.id}`);
      return true;
    } catch (err) {
      logger.error(`[PETITION MODEL ERROR] Failed to save petition ${petition.id}:`, err.message);
      throw err;
    }
  },
  /**
   * Update comment status and pinned flag
   */
  updateCommentStatus: async (commentId, status, isPinned) => {
    try {
      const updates = { status };
      if (isPinned !== void 0) {
        updates.is_pinned = isPinned;
      }
      console.log(`[DATABASE QUERY AUDIT] Executing update query on 'petition_comments' for ID: ${commentId}`);
      const { error } = await supabase4.from("petition_comments").update(updates).eq("id", commentId);
      if (error) {
        throw error;
      }
      logger.info(`[SUPABASE COMMENT STATUS UPDATE] Updated comment ${commentId} to status ${status}`);
      return true;
    } catch (err) {
      logger.error(`[PETITION MODEL ERROR] Failed to update comment status for ${commentId}:`, err.message);
      throw err;
    }
  },
  /**
   * Controller alias: get signatures by petition ID
   */
  getSignaturesByPetitionId: async (petitionId) => {
    return petitionModel.getSignatures(petitionId);
  },
  /**
   * Controller alias: get comments by petition ID
   */
  getCommentsByPetitionId: async (petitionId) => {
    return petitionModel.getComments(petitionId);
  },
  /**
   * Controller alias: get documents by petition ID
   */
  getDocumentsByPetitionId: async (petitionId) => {
    return petitionModel.getDocuments(petitionId);
  },
  /**
   * Retrieve all announcements/updates for a petition
   */
  getUpdatesByPetitionId: async (petitionId) => {
    try {
      console.log(`[DATABASE QUERY AUDIT] Executing select query on 'petition_updates' for petition ID: ${petitionId}`);
      const { data, error } = await supabase4.from("petition_updates").select("*").eq("petition_id", petitionId).order("created_at", { ascending: false });
      if (error) {
        throw error;
      }
      if (data) {
        return data.map((u) => ({
          id: u.id,
          petitionId: u.petition_id,
          title: u.title,
          content: u.content,
          createdAt: u.created_at,
          createdBy: u.created_by
        }));
      }
    } catch (err) {
      logger.error(`[PETITION MODEL ERROR] Failed to fetch updates for ${petitionId}:`, err.message);
      throw err;
    }
    return [];
  },
  /**
   * Get all signatures for a petition
   */
  getSignatures: async (petitionId) => {
    try {
      console.log(`[DATABASE QUERY AUDIT] Executing select query on 'petition_signatures' for petition ID: ${petitionId}`);
      const { data, error } = await supabase4.from("petition_signatures").select("*").eq("petition_id", petitionId).order("created_at", { ascending: false });
      if (error) {
        throw error;
      }
      if (data) {
        return data.map((s) => ({
          id: s.id,
          petitionId: s.petition_id,
          userEmail: s.user_email,
          name: s.name,
          district: s.district,
          block: s.block,
          school: s.school,
          teacherCategory: s.teacher_category,
          phone: s.phone,
          consent: s.consent,
          signatureNumber: s.signature_number,
          createdAt: s.created_at
        }));
      }
    } catch (err) {
      logger.error(`[PETITION MODEL ERROR] Failed to fetch signatures for ${petitionId}:`, err.message);
      throw err;
    }
    return [];
  },
  /**
   * Add a petition update/announcement
   */
  addUpdate: async (update) => {
    try {
      const payload = {
        id: update.id,
        petition_id: update.petitionId,
        title: update.title,
        content: update.content,
        created_by: update.createdBy,
        created_at: update.createdAt || (/* @__PURE__ */ new Date()).toISOString()
      };
      console.log(`[DATABASE QUERY AUDIT] Executing insert query on 'petition_updates' for: ${update.id}`);
      const { error } = await supabase4.from("petition_updates").insert(payload);
      if (error) {
        throw error;
      }
      logger.info(`[SUPABASE UPDATE SUCCESS] Added update to petition ${update.petitionId}`);
      return true;
    } catch (err) {
      logger.error(`[PETITION MODEL ERROR] Failed to add update:`, err.message);
      throw err;
    }
  },
  /**
   * Add comment to petition
   */
  addComment: async (comment) => {
    try {
      const payload = {
        id: comment.id,
        petition_id: comment.petitionId,
        user_email: comment.userEmail,
        user_name: comment.userName,
        content: comment.content,
        status: comment.status || "approved",
        is_pinned: comment.isPinned || false,
        created_at: comment.createdAt || (/* @__PURE__ */ new Date()).toISOString()
      };
      console.log(`[DATABASE QUERY AUDIT] Executing insert query on 'petition_comments' for comment: ${comment.id}`);
      const { error } = await supabase4.from("petition_comments").insert(payload);
      if (error) {
        throw error;
      }
      logger.info(`[SUPABASE COMMENT SUCCESS] Added comment to petition ${comment.petitionId}`);
      return true;
    } catch (err) {
      logger.error(`[PETITION MODEL ERROR] Failed to add comment:`, err.message);
      throw err;
    }
  },
  /**
   * Fetch comments for a petition
   */
  getComments: async (petitionId) => {
    try {
      console.log(`[DATABASE QUERY AUDIT] Executing select query on 'petition_comments' for petition ID: ${petitionId}`);
      const { data, error } = await supabase4.from("petition_comments").select("*").eq("petition_id", petitionId).order("created_at", { ascending: false });
      if (error) {
        throw error;
      }
      if (data) {
        return data.map((c) => ({
          id: c.id,
          petitionId: c.petition_id,
          userEmail: c.user_email,
          userName: c.user_name,
          content: c.content,
          status: c.status,
          isPinned: c.is_pinned,
          createdAt: c.created_at
        }));
      }
    } catch (err) {
      logger.error(`[PETITION MODEL ERROR] Failed to fetch comments for ${petitionId}:`, err.message);
      throw err;
    }
    return [];
  },
  /**
   * Get all categories for petition center
   */
  getCategories: async () => {
    try {
      console.log("[DATABASE QUERY AUDIT] Executing select query on table 'petition_categories'");
      const { data, error } = await supabase4.from("petition_categories").select("*");
      if (error) {
        throw error;
      }
      if (data) {
        return data.map((cat) => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug
        }));
      }
    } catch (err) {
      logger.error("[PETITION MODEL ERROR] Failed to fetch categories:", err.message);
      throw err;
    }
    return [];
  },
  /**
   * Get all documents attached to a petition
   */
  getDocuments: async (petitionId) => {
    try {
      console.log(`[DATABASE QUERY AUDIT] Executing select query on 'petition_documents' for petition ID: ${petitionId}`);
      const { data, error } = await supabase4.from("petition_documents").select("*").eq("petition_id", petitionId);
      if (error) {
        throw error;
      }
      if (data) {
        return data.map((doc) => ({
          id: doc.id,
          petitionId: doc.petition_id,
          title: doc.title,
          fileUrl: doc.file_url,
          fileType: doc.file_type
        }));
      }
    } catch (err) {
      logger.error(`[PETITION MODEL ERROR] Failed to fetch documents for ${petitionId}:`, err.message);
      throw err;
    }
    return [];
  },
  /**
   * Attach a document to a petition
   */
  addDocument: async (doc) => {
    try {
      const payload = {
        id: doc.id,
        petition_id: doc.petitionId,
        title: doc.title,
        file_url: doc.fileUrl,
        file_type: doc.fileType
      };
      console.log(`[DATABASE QUERY AUDIT] Executing insert query on 'petition_documents' for: ${doc.id}`);
      const { error } = await supabase4.from("petition_documents").insert(payload);
      if (error) {
        throw error;
      }
      logger.info(`[SUPABASE DOCUMENT SUCCESS] Attached document to petition ${doc.petitionId}`);
      return true;
    } catch (err) {
      logger.error(`[PETITION MODEL ERROR] Failed to attach document:`, err.message);
      throw err;
    }
  }
};

// controllers/petitionController.ts
var petitionController = {
  // -------------------------------------------------------------
  // PUBLIC VIEWING ENDPOINTS
  // -------------------------------------------------------------
  /**
   * List all active petitions
   */
  getPetitions: async (req, res, next) => {
    try {
      const petitions = await petitionModel.getPetitions();
      res.json({ success: true, petitions });
    } catch (err) {
      logger.error("[PETITION CONTROLLER] Error getting petitions:", err);
      next(err);
    }
  },
  /**
   * Get single petition details by slug
   */
  getPetitionBySlug: async (req, res, next) => {
    try {
      const { slug } = req.params;
      const userEmail = req.query.email;
      const petition = await petitionModel.getPetitionBySlug(slug);
      if (!petition) {
        res.status(404).json({ error: "Not Found", message: "Petition not found" });
        return;
      }
      const signatures = await petitionModel.getSignaturesByPetitionId(petition.id);
      const comments = await petitionModel.getCommentsByPetitionId(petition.id);
      const updates = await petitionModel.getUpdatesByPetitionId(petition.id);
      const documents = await petitionModel.getDocumentsByPetitionId(petition.id);
      let hasSigned = false;
      if (userEmail) {
        hasSigned = await petitionModel.hasSigned(petition.id, userEmail);
      }
      res.json({
        success: true,
        petition,
        hasSigned,
        stats: {
          totalSignatures: signatures.length,
          recentSignatures: signatures.slice(-10).reverse()
          // Latest 10
        },
        comments: comments.filter((c) => c.status === "approved" || c.status === "pending"),
        // Filter deleted/spam
        updates,
        documents
      });
    } catch (err) {
      logger.error("[PETITION CONTROLLER] Error getting petition details:", err);
      next(err);
    }
  },
  // -------------------------------------------------------------
  // SIGNING & PUBLIC INTERACTION ENDPOINTS
  // -------------------------------------------------------------
  /**
   * Sign a petition (Double-signing protection)
   */
  signPetition: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { name, district, block, school, teacherCategory, phone, consent, userEmail } = req.body;
      const emailToUse = (userEmail || req.user?.email || "").toLowerCase().trim();
      if (!emailToUse) {
        res.status(400).json({ error: "Bad Request", message: "User email is required to sign the petition." });
        return;
      }
      if (!name || !district || !block || !teacherCategory || !consent) {
        res.status(400).json({ error: "Bad Request", message: "All form fields are required to sign the petition." });
        return;
      }
      const alreadySigned = await petitionModel.hasSigned(id, emailToUse);
      if (alreadySigned) {
        res.status(409).json({ error: "Conflict", message: "You have already signed this petition." });
        return;
      }
      const petitions = await petitionModel.getPetitions();
      const petition = petitions.find((p) => p.id === id);
      if (!petition) {
        res.status(404).json({ error: "Not Found", message: "Petition not found" });
        return;
      }
      const signature = {
        id: "sig-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5),
        petitionId: id,
        userEmail: emailToUse,
        name: name.trim(),
        district: district.trim(),
        block: block.trim(),
        school: school ? school.trim() : "",
        teacherCategory: teacherCategory.trim(),
        phone: phone ? phone.trim() : void 0,
        consent: !!consent,
        signatureNumber: 0,
        // Assigned by model
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      const finalSigNumber = await petitionModel.addSignature(signature);
      res.status(201).json({
        success: true,
        message: "Thank you! Your signature has been recorded successfully.",
        signatureNumber: finalSigNumber
      });
    } catch (err) {
      logger.error("[PETITION CONTROLLER] Error signing petition:", err);
      next(err);
    }
  },
  /**
   * Get all signatures for a petition
   */
  getSignatures: async (req, res, next) => {
    try {
      const { id } = req.params;
      const signatures = await petitionModel.getSignaturesByPetitionId(id);
      res.json({ success: true, count: signatures.length, signatures });
    } catch (err) {
      logger.error("[PETITION CONTROLLER] Error getting signatures:", err);
      next(err);
    }
  },
  /**
   * Submit a comment to a petition
   */
  addComment: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { content, userName, userEmail } = req.body;
      const emailToUse = (userEmail || req.user?.email || "anonymous@paisablueprint.in").toLowerCase().trim();
      const nameToUse = (userName || req.user?.name || "Anonymous Teacher").trim();
      if (!content || content.trim().length < 3) {
        res.status(400).json({ error: "Bad Request", message: "Comment content must be at least 3 characters long." });
        return;
      }
      const comment = {
        id: "com-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5),
        petitionId: id,
        userEmail: emailToUse,
        userName: nameToUse,
        content: content.trim(),
        status: "approved",
        // default approved, admin can moderate later
        isPinned: false,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      await petitionModel.addComment(comment);
      res.status(201).json({
        success: true,
        message: "Comment posted successfully.",
        comment
      });
    } catch (err) {
      logger.error("[PETITION CONTROLLER] Error posting comment:", err);
      next(err);
    }
  },
  // -------------------------------------------------------------
  // ADMINISTRATIVE PETITION CRUD & MODERATION ENDPOINTS
  // -------------------------------------------------------------
  /**
   * Admin: Create or Edit a petition
   */
  savePetition: async (req, res, next) => {
    try {
      const { id, title, slug, shortDescription, fullDescription, category, bannerImage, featuredImage, govDepartment, petitionGoal, status, seoTitle, seoDescription, featured } = req.body;
      if (!title || !slug || !shortDescription || !fullDescription) {
        res.status(400).json({ error: "Bad Request", message: "Title, slug, short description, and full description are required." });
        return;
      }
      const cleanSlug = slug.toLowerCase().trim().replace(/[^a-z0-9-_]/g, "-");
      const petitionId = id || "pet-" + Date.now();
      const creatorEmail = req.user?.email || "deepak.mm1301@gmail.com";
      let existing = null;
      if (id) {
        existing = await petitionModel.getPetitionBySlug(cleanSlug);
      }
      const petition = {
        id: petitionId,
        title: title.trim(),
        slug: cleanSlug,
        shortDescription: shortDescription.trim(),
        fullDescription,
        category: category || "Education",
        bannerImage: bannerImage || "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=1200",
        featuredImage: featuredImage || "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=400",
        govDepartment: govDepartment || "Education Department, Government of Bihar",
        petitionGoal: Number(petitionGoal) || 5e3,
        currentSignatures: existing ? existing.currentSignatures : 0,
        status: status || "draft",
        startDate: existing ? existing.startDate : (/* @__PURE__ */ new Date()).toISOString(),
        endDate: req.body.endDate || (existing ? existing.endDate : new Date(Date.now() + 60 * 24 * 60 * 60 * 1e3).toISOString()),
        seoTitle: seoTitle || title.trim() + " | Paisa Blueprint",
        seoDescription: seoDescription || shortDescription.trim(),
        featured: !!featured,
        createdBy: existing ? existing.createdBy : creatorEmail,
        createdAt: existing ? existing.createdAt : (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      await petitionModel.savePetition(petition);
      res.json({
        success: true,
        message: id ? "Petition updated successfully." : "Petition created successfully.",
        petition
      });
    } catch (err) {
      logger.error("[PETITION CONTROLLER] Error saving petition:", err);
      next(err);
    }
  },
  /**
   * Admin: Add an update update to a petition
   */
  addPetitionUpdate: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { title, content } = req.body;
      if (!title || !content) {
        res.status(400).json({ error: "Bad Request", message: "Update title and content are required." });
        return;
      }
      const update = {
        id: "upd-" + Date.now(),
        petitionId: id,
        title: title.trim(),
        content: content.trim(),
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        createdBy: req.user?.email || "deepak.mm1301@gmail.com"
      };
      await petitionModel.addUpdate(update);
      res.status(201).json({
        success: true,
        message: "Petition update posted successfully.",
        update
      });
    } catch (err) {
      logger.error("[PETITION CONTROLLER] Error adding update:", err);
      next(err);
    }
  },
  /**
   * Admin: Moderate a petition comment
   */
  moderateComment: async (req, res, next) => {
    try {
      const { commentId } = req.params;
      const { status, isPinned } = req.body;
      if (!status) {
        res.status(400).json({ error: "Bad Request", message: "Moderation status is required." });
        return;
      }
      await petitionModel.updateCommentStatus(commentId, status, isPinned);
      res.json({
        success: true,
        message: "Comment moderated successfully."
      });
    } catch (err) {
      logger.error("[PETITION CONTROLLER] Error moderating comment:", err);
      next(err);
    }
  },
  /**
   * Admin: Delete a petition
   */
  deletePetition: async (req, res, next) => {
    try {
      const { id } = req.params;
      await petitionModel.deletePetition(id);
      res.json({ success: true, message: "Petition soft-deleted successfully." });
    } catch (err) {
      logger.error("[PETITION CONTROLLER] Error deleting petition:", err);
      next(err);
    }
  },
  // -------------------------------------------------------------
  // CENTRAL ADMIN SYSTEM METRICS & USER CONTROL ENDPOINTS
  // -------------------------------------------------------------
  /**
   * Admin: Get general metrics dashboard stats
   */
  getAdminStats: async (req, res, next) => {
    try {
      const users = await userModel.getAllUsers();
      const petitions = await petitionModel.getPetitions();
      let totalSignaturesCount = 0;
      petitions.forEach((p) => {
        totalSignaturesCount += p.currentSignatures;
      });
      const activePetitions = petitions.filter((p) => p.status === "published").length;
      const draftPetitions = petitions.filter((p) => p.status === "draft").length;
      const recentActivities = [];
      users.slice(-5).forEach((u) => {
        recentActivities.push({
          type: "signup",
          message: `New user registration: ${u.name} (${u.email})`,
          time: u.createdAt,
          badge: "bg-teal-50 text-teal-700"
        });
      });
      const bpscSignatures = await petitionModel.getSignaturesByPetitionId("pet-bpsc-transfer-2026");
      bpscSignatures.slice(-5).forEach((s) => {
        recentActivities.push({
          type: "signature",
          message: `${s.name} signed "Bihar BPSC Teacher Mutual Transfer"`,
          time: s.createdAt,
          badge: "bg-blue-50 text-blue-700"
        });
      });
      recentActivities.sort((a, b) => b.time.localeCompare(a.time));
      res.json({
        success: true,
        stats: {
          totalUsers: users.length,
          totalSignatures: totalSignaturesCount,
          activePetitions,
          draftPetitions,
          recentActivities: recentActivities.slice(0, 10)
          // Top 10 activities
        }
      });
    } catch (err) {
      logger.error("[PETITION CONTROLLER] Error compiling admin dashboard stats:", err);
      next(err);
    }
  },
  /**
   * Admin: User Directory (list, search, filter)
   */
  getAdminUsers: async (req, res, next) => {
    try {
      const users = await userModel.getAllUsers();
      res.json({ success: true, users });
    } catch (err) {
      logger.error("[PETITION CONTROLLER] Error compiling user list:", err);
      next(err);
    }
  },
  /**
   * Admin: Update User Role (User, Moderator, Admin, Super Admin)
   */
  updateUserRole: async (req, res, next) => {
    try {
      const { email } = req.params;
      const { role } = req.body;
      if (!role) {
        res.status(400).json({ error: "Bad Request", message: "Role value is required." });
        return;
      }
      const success = await userModel.updateUserRole(email, role);
      if (!success) {
        res.status(403).json({ error: "Forbidden", message: "Cannot alter permissions of this user account." });
        return;
      }
      res.json({ success: true, message: `Successfully updated user role to ${role}` });
    } catch (err) {
      logger.error("[PETITION CONTROLLER] Error updating user role:", err);
      next(err);
    }
  },
  /**
   * Admin: Suspend or Activate user account
   */
  updateUserStatus: async (req, res, next) => {
    try {
      const { email } = req.params;
      const { status } = req.body;
      if (!status || status !== "active" && status !== "suspended") {
        res.status(400).json({ error: "Bad Request", message: "Valid status ('active' or 'suspended') is required." });
        return;
      }
      const success = await userModel.updateUserStatus(email, status);
      if (!success) {
        res.status(403).json({ error: "Forbidden", message: "Cannot alter status of this user account." });
        return;
      }
      res.json({ success: true, message: `Successfully updated user status to ${status}` });
    } catch (err) {
      logger.error("[PETITION CONTROLLER] Error updating user status:", err);
      next(err);
    }
  },
  /**
   * Admin: Administrative push password reset for a user
   */
  adminResetPassword: async (req, res, next) => {
    try {
      const { email } = req.params;
      const { newPassword } = req.body;
      if (!newPassword || newPassword.trim().length < 6) {
        res.status(400).json({ error: "Bad Request", message: "A secure password of at least 6 characters is required." });
        return;
      }
      const hashedPassword = import_bcryptjs.default.hashSync(newPassword.trim(), 10);
      const success = await userModel.adminResetPassword(email, hashedPassword);
      if (!success) {
        res.status(404).json({ error: "Not Found", message: "User account not found." });
        return;
      }
      res.json({ success: true, message: `Successfully pushed administrative password reset for ${email}.` });
    } catch (err) {
      logger.error("[PETITION CONTROLLER] Error in administrative reset:", err);
      next(err);
    }
  }
};

// models/cmsModel.ts
var import_supabase_js6 = require("@supabase/supabase-js");
var supabaseUrl5 = process.env.SUPABASE_URL;
var supabaseKey5 = process.env.SUPABASE_SERVICE_ROLE_KEY;
var supabase5 = supabaseUrl5 && supabaseKey5 ? (0, import_supabase_js6.createClient)(supabaseUrl5, supabaseKey5, {
  auth: { persistSession: false }
}) : null;
var defaultCmsDb = {
  homepage: {
    heroBanner: {
      imageUrl: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=1200",
      headline: "Bihar BPSC Teacher Advocacy & Financial Intelligence Hub",
      description: "Access high-fidelity salary calculators, Bihar State Teacher Transfer Rules, dearness allowance forecasts, and secure advocacy petitions for our mutual transfer rights.",
      ctaText: "Sign the Mutual Transfer Petition",
      ctaLink: "/petitions/bihar-bpsc-teacher-mutual-transfer"
    },
    sections: [
      { id: "hero", name: "Hero Banner", visible: true, order: 1 },
      { id: "announcements", name: "Announcements Board", visible: true, order: 2 },
      { id: "calculators", name: "Financial Calculators Grid", visible: true, order: 3 },
      { id: "circulars", name: "Bihar Govt Official Circulars", visible: true, order: 4 },
      { id: "petitions", name: "Active Petitions Landing", visible: true, order: 5 },
      { id: "blog", name: "Teacher Insights & Blogs", visible: true, order: 6 },
      { id: "faqs", name: "FAQ Board", visible: true, order: 7 }
    ]
  },
  announcements: [
    {
      id: "ann-1",
      title: "Urgent Update: Point-Based Seniority Guidelines Released",
      description: "The Bihar Education Department has finalized the draft transfer points policy. Check your score now in our transfer analysis modules.",
      priority: "high",
      startDate: "2026-07-10T00:00:00.000Z",
      endDate: "2026-08-10T23:59:59.000Z",
      backgroundColor: "#fee2e2",
      icon: "Megaphone",
      targetAudience: "BPSC TRE 1.0 & 2.0 Teachers",
      published: true
    }
  ],
  circulars: [
    {
      id: "circ-1",
      title: "Bihar State Teacher Transfer Rules, 2026 (Memo 11/Vi-33/2026)",
      department: "Education Department",
      category: "Transfer Policy",
      circularNumber: "Memo 11/Vi-33/2026",
      publishDate: "2026-06-25",
      effectiveDate: "2026-07-01",
      fileUrl: "#",
      thumbnail: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=300",
      tags: ["Transfer", "Bihar Govt", "Rules"],
      description: "Official notification detailing the Point-Based Seniority System for general and mutual teacher transfers.",
      featured: true,
      downloadCount: 412,
      viewCount: 1250,
      status: "active"
    }
  ],
  blogs: [
    {
      id: "blog-1",
      featuredImage: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&q=80&w=800",
      title: "Understanding Bihar Teacher Point-Based Seniority System",
      slug: "understanding-bihar-teacher-point-based-seniority-system",
      category: "Transfer Policy",
      author: "Aditya Narayan",
      metaTitle: "Bihar Teacher Point System Demystified | Paisa Blueprint",
      metaDescription: "A deep dive explanation of how the 2026 teacher transfer points are calculated including spouse posting, medical options and service tenure.",
      keywords: ["transfer rules", "point-based seniority", "bihar bpsc teacher"],
      tags: ["Seniority Points", "Mutual Transfer", "Bihar Education"],
      publishDate: "2026-07-12",
      content: "<p>The new Bihar State Teacher Transfer Rules introduce a <strong>Point-Based Seniority System</strong>. Teachers can score up to 100 points based on various criteria. Our analysis breaks down exactly how to claim points for spouse postings, medical priorities, and tenure.</p>",
      status: "published"
    }
  ],
  faqs: [
    {
      id: "faq-1",
      question: "What is the point eligibility threshold for mutual transfers?",
      answer: "For mutual transfers, both teachers must be in the same pay-grade and subject category. Standard seniority points act as tie-breakers but are not highly restrictive if a mutual peer is matched.",
      category: "Mutual Transfer",
      order: 1
    },
    {
      id: "faq-2",
      question: "Are there special transfer quotas for women or disabled teachers?",
      answer: "Yes, female teachers and disabled candidates are awarded up to 20 points of medical/priority seniority, allowing them priority slots in transfer rounds.",
      category: "General Rules",
      order: 2
    }
  ],
  downloads: [
    {
      id: "dl-1",
      title: "Mutual Transfer NOC No-Objection Template",
      description: "The official draft declaration template for mutual peer matching to be submitted to district educational authorities.",
      category: "Templates",
      fileUrl: "#",
      fileType: "pdf",
      version: "1.1",
      publishDate: "2026-07-01",
      downloadCount: 890,
      viewCount: 2201
    }
  ],
  banners: [
    {
      id: "ban-1",
      imageUrl: "https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&q=80&w=800",
      title: "Join the BPSC Teacher Telegram Support Portal",
      description: "Connect with over 25,000 Bihar teachers for immediate peer matching, school reviews and salary discussions.",
      ctaText: "Join Telegram Portal",
      targetLink: "https://t.me/paisablueprint",
      priority: 1,
      startDate: "2026-07-01T00:00:00.000Z",
      endDate: "2026-12-31T23:59:59.000Z",
      enabled: true,
      homepagePosition: "sidebar"
    }
  ],
  petitions: [
    {
      petitionId: "pet-bpsc-transfer-2026",
      title: "Simplification of Bihar BPSC Teacher Mutual Transfer Rules",
      description: "Join the collective demand of 1.5 Lakh BPSC TRE teachers seeking simplified, unconditional, and immediate online mutual transfer policies with home-district provisions.",
      imageUrl: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=1200",
      enableCountdown: true,
      enableProgressBar: true,
      enableComments: true,
      enableSharing: true,
      featured: true,
      archived: false
    }
  ],
  navigation: [
    { id: "nav-1", label: "Salary Calculator", path: "/salary-calculator", icon: "Calculator", visible: true, order: 1 },
    { id: "nav-2", label: "NPS & Pension", path: "/nps-calculator", icon: "PiggyBank", visible: true, order: 2 },
    { id: "nav-3", label: "DA Calculator", path: "/bihar-da-calculator", icon: "TrendingUp", visible: true, order: 3 },
    { id: "nav-4", label: "Mutual Transfer Hub", path: "/teacher-hub", icon: "Users", visible: true, order: 4 },
    { id: "nav-5", label: "Petitions Center", path: "/petitions", icon: "FileText", visible: true, order: 5 }
  ],
  footer: {
    contact: {
      email: "support@paisablueprint.in",
      phone: "+91 612 222 3456",
      address: "Advocacy & Support Desk, Frazer Road, Patna, Bihar, 800001"
    },
    socialLinks: {
      facebook: "https://facebook.com/paisablueprint",
      twitter: "https://twitter.com/paisablueprint",
      youtube: "https://youtube.com/paisablueprint",
      telegram: "https://t.me/paisablueprint"
    },
    copyright: "\xA9 2026 Paisa Blueprint. Independent advocacy platform built for Bihar Government State Teachers.",
    quickLinks: [
      { label: "BPSC Teacher Salary", url: "/bpsc-teacher-salary-calculator" },
      { label: "8th Pay Commission Guide", url: "/8th-pay-commission-salary-calculator" },
      { label: "Mutual Transfer Guidelines", url: "/teacher-hub" },
      { label: "Sign Demands Petition", url: "/petitions" }
    ],
    privacyPolicyUrl: "/privacy",
    termsUrl: "/terms"
  },
  media: [],
  seo: {
    pages: [
      {
        pagePath: "/",
        metaTitle: "Paisa Blueprint | Bihar BPSC Teacher Salary & advocacy Portal",
        metaDescription: "Calculate Bihar teacher salaries under 7th pay commission, explore 8th CPC forecasts, and support mutual transfer simplification.",
        keywords: ["BPSC teacher salary", "Bihar teacher transfer", "8th pay commission"],
        canonicalUrl: "https://paisablueprint.in/",
        ogImage: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=1200",
        twitterCard: "summary_large_image",
        schemaMarkup: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Paisa Blueprint",
          "url": "https://paisablueprint.in/"
        })
      }
    ],
    sitemap: '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>https://paisablueprint.in/</loc><priority>1.0</priority></url>\n</urlset>',
    robotsTxt: "User-agent: *\nAllow: /\nSitemap: https://paisablueprint.in/sitemap.xml"
  },
  revisions: [],
  activityLogs: [],
  suggestions: []
};
var cachedCmsDb = null;
var cmsModel = {
  /**
   * Reads all data from Supabase PostgreSQL (teacher_hub_data under id 'cms_global_state')
   */
  readDb: async () => {
    if (cachedCmsDb) {
      return cachedCmsDb;
    }
    if (supabase5) {
      try {
        console.log("[DATABASE QUERY AUDIT] Executing select query on table 'teacher_hub_data' for 'cms_global_state'");
        const { data, error } = await supabase5.from("teacher_hub_data").select("payload").eq("id", "cms_global_state").single();
        if (!error && data && data.payload) {
          console.log("[DATABASE QUERY SUCCESS] Successfully retrieved 'cms_global_state' from Supabase.");
          const parsed = data.payload;
          cachedCmsDb = {
            homepage: parsed.homepage || defaultCmsDb.homepage,
            announcements: parsed.announcements || defaultCmsDb.announcements,
            circulars: parsed.circulars || defaultCmsDb.circulars,
            blogs: parsed.blogs || defaultCmsDb.blogs,
            faqs: parsed.faqs || defaultCmsDb.faqs,
            downloads: parsed.downloads || defaultCmsDb.downloads,
            banners: parsed.banners || defaultCmsDb.banners,
            petitions: parsed.petitions || defaultCmsDb.petitions,
            navigation: parsed.navigation || defaultCmsDb.navigation,
            footer: parsed.footer || defaultCmsDb.footer,
            media: parsed.media || defaultCmsDb.media,
            seo: parsed.seo || defaultCmsDb.seo,
            revisions: parsed.revisions || defaultCmsDb.revisions,
            activityLogs: parsed.activityLogs || defaultCmsDb.activityLogs,
            suggestions: parsed.suggestions || defaultCmsDb.suggestions
          };
          return cachedCmsDb;
        } else if (error && error.code === "PGRST116") {
          console.log("[DATABASE QUERY INFO] 'cms_global_state' row not found. Initializing with default seed...");
          cachedCmsDb = JSON.parse(JSON.stringify(defaultCmsDb));
          await cmsModel.writeDb(cachedCmsDb);
          return cachedCmsDb;
        } else {
          logger.warn(`[CMS MODEL] Non-fatal issue loading CMS state from Supabase, using defaults: ${error?.message}`);
        }
      } catch (err) {
        logger.error("[CMS MODEL] Exception loading CMS state from Supabase:", err.message || err);
      }
    }
    cachedCmsDb = JSON.parse(JSON.stringify(defaultCmsDb));
    return cachedCmsDb;
  },
  /**
   * Writes data back to Supabase PostgreSQL (teacher_hub_data under id 'cms_global_state')
   */
  writeDb: async (data) => {
    cachedCmsDb = data;
    if (supabase5) {
      try {
        console.log("[DATABASE QUERY AUDIT] Executing upsert query on table 'teacher_hub_data' for 'cms_global_state'");
        const { error } = await supabase5.from("teacher_hub_data").upsert({
          id: "cms_global_state",
          payload: data,
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        });
        if (error) {
          logger.error("[CMS MODEL] Supabase upsert failed for 'cms_global_state':", error);
          return false;
        }
        console.log("[DATABASE QUERY SUCCESS] Successfully upserted 'cms_global_state' to Supabase.");
        return true;
      } catch (err) {
        logger.error("[CMS MODEL] Exception during CMS write:", err.message || err);
        return false;
      }
    }
    return true;
  },
  /**
   * Log an activity
   */
  logActivity: async (userName, userEmail, action, moduleId, oldValue, newValue, ipAddress, browser) => {
    const db = await cmsModel.readDb();
    const log = {
      id: "log-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5),
      userName,
      userEmail,
      action,
      moduleId,
      oldValue,
      newValue,
      ipAddress: ipAddress || "127.0.0.1",
      browser: browser || "Unknown Browser",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    db.activityLogs.unshift(log);
    if (db.activityLogs.length > 500) {
      db.activityLogs = db.activityLogs.slice(0, 500);
    }
    await cmsModel.writeDb(db);
  },
  /**
   * Creates a revision of a module
   */
  createRevision: async (moduleId, title, content, status, createdBy) => {
    const db = await cmsModel.readDb();
    if (status === "published") {
      db.revisions.forEach((rev) => {
        if (rev.moduleId === moduleId && rev.status === "published") {
          rev.status = "previous";
        }
      });
    } else if (status === "draft") {
      db.revisions.forEach((rev) => {
        if (rev.moduleId === moduleId && rev.status === "draft") {
          rev.status = "previous";
        }
      });
    }
    const currentModuleRevisions = db.revisions.filter((r) => r.moduleId === moduleId);
    const nextVersion = currentModuleRevisions.length > 0 ? Math.max(...currentModuleRevisions.map((r) => r.version)) + 1 : 1;
    const revision = {
      id: "rev-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5),
      moduleId,
      title,
      content,
      status,
      version: nextVersion,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      createdBy
    };
    db.revisions.unshift(revision);
    await cmsModel.writeDb(db);
  },
  /**
   * Submits a suggestion (for moderators)
   */
  addSuggestion: async (moduleId, suggestedByEmail, suggestedByName, action, content) => {
    const db = await cmsModel.readDb();
    const suggestion = {
      id: "sug-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5),
      moduleId,
      suggestedByEmail,
      suggestedByName,
      action,
      content,
      status: "pending",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    db.suggestions.unshift(suggestion);
    await cmsModel.writeDb(db);
    return suggestion;
  }
};

// controllers/cmsController.ts
var cmsController = {
  /**
   * Retrieves the current full CMS database state
   */
  getCmsData: async (req, res, next) => {
    try {
      const db = await cmsModel.readDb();
      res.json({ success: true, data: db });
    } catch (err) {
      next(err);
    }
  },
  /**
   * Unified updater for any standard CMS module
   */
  updateModule: async (req, res, next) => {
    try {
      const { moduleId } = req.params;
      const { payload, publish, actionName } = req.body;
      const user = req.user;
      if (!user) {
        res.status(401).json({ success: false, message: "Unauthenticated user" });
        return;
      }
      if (!payload) {
        res.status(400).json({ success: false, message: "Payload is required" });
        return;
      }
      const db = await cmsModel.readDb();
      const currentModuleData = db[moduleId];
      if (currentModuleData === void 0) {
        res.status(404).json({ success: false, message: `Module '${moduleId}' not found in DB schema` });
        return;
      }
      const ip = req.ip || req.headers["x-forwarded-for"] || "127.0.0.1";
      const userAgent = req.headers["user-agent"] || "Unknown Browser";
      if (user.role === "admin" || user.role === "super_admin" || user.role === "super admin") {
        const oldValue = JSON.parse(JSON.stringify(currentModuleData));
        db[moduleId] = payload;
        const cleanActionName = actionName || `Updated content of ${moduleId}`;
        await cmsModel.logActivity(
          user.name,
          user.email,
          cleanActionName,
          moduleId,
          oldValue,
          payload,
          Array.isArray(ip) ? ip[0] : ip,
          userAgent
        );
        const revisionStatus = publish ? "published" : "draft";
        await cmsModel.createRevision(
          moduleId,
          cleanActionName,
          payload,
          revisionStatus,
          user.email
        );
        await cmsModel.writeDb(db);
        res.json({
          success: true,
          message: publish ? "Content published successfully!" : "Draft saved successfully!",
          data: payload
        });
      } else if (user.role === "moderator") {
        const cleanActionName = actionName || `Moderator suggestion for ${moduleId}`;
        const suggestion = await cmsModel.addSuggestion(
          moduleId,
          user.email,
          user.name,
          cleanActionName,
          payload
        );
        res.json({
          success: true,
          message: "Your changes have been submitted as a suggestion for Admin approval.",
          suggestion
        });
      } else {
        res.status(403).json({ success: false, message: "Forbidden: Insufficient privileges to modify CMS content" });
      }
    } catch (err) {
      next(err);
    }
  },
  /**
   * Upload a base64 media asset directly into the Media Library
   */
  uploadMedia: async (req, res, next) => {
    try {
      const { name, base64Data, size, category, mimeType } = req.body;
      const user = req.user;
      if (!user) {
        res.status(401).json({ success: false, message: "Unauthenticated user" });
        return;
      }
      if (user.role !== "admin" && user.role !== "super_admin" && user.role !== "super admin") {
        res.status(403).json({ success: false, message: "Only administrators can upload files to the media library." });
        return;
      }
      if (!name || !base64Data) {
        res.status(400).json({ success: false, message: "Name and base64Data are required" });
        return;
      }
      const db = await cmsModel.readDb();
      const mediaId = "med-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5);
      const newMediaItem = {
        id: mediaId,
        name: name.trim(),
        url: base64Data,
        // In this Cloud Run env, storing Base64 inline guarantees absolute persistence
        size: size || "N/A",
        category: category || "Uncategorized",
        uploadedAt: (/* @__PURE__ */ new Date()).toISOString(),
        mimeType: mimeType || "image/jpeg",
        usageCount: 0,
        usedInPages: []
      };
      db.media.unshift(newMediaItem);
      const ip = req.ip || req.headers["x-forwarded-for"] || "127.0.0.1";
      const userAgent = req.headers["user-agent"] || "Unknown Browser";
      await cmsModel.logActivity(
        user.name,
        user.email,
        `Uploaded media asset: ${name}`,
        "media",
        null,
        { id: mediaId, name },
        Array.isArray(ip) ? ip[0] : ip,
        userAgent
      );
      await cmsModel.writeDb(db);
      res.json({ success: true, message: "Asset uploaded to Media Library", asset: newMediaItem });
    } catch (err) {
      next(err);
    }
  },
  /**
   * Rename or recategorize a Media Library asset
   */
  updateMediaItem: async (req, res, next) => {
    try {
      const { mediaId } = req.params;
      const { name, category } = req.body;
      const user = req.user;
      if (!user) {
        res.status(401).json({ success: false, message: "Unauthenticated user" });
        return;
      }
      if (user.role !== "admin" && user.role !== "super_admin" && user.role !== "super admin") {
        res.status(403).json({ success: false, message: "Permission Denied." });
        return;
      }
      const db = await cmsModel.readDb();
      const item = db.media.find((m) => m.id === mediaId);
      if (!item) {
        res.status(404).json({ success: false, message: "Media asset not found" });
        return;
      }
      const oldValue = { name: item.name, category: item.category };
      if (name) item.name = name.trim();
      if (category) item.category = category.trim();
      const ip = req.ip || req.headers["x-forwarded-for"] || "127.0.0.1";
      const userAgent = req.headers["user-agent"] || "Unknown Browser";
      await cmsModel.logActivity(
        user.name,
        user.email,
        `Updated media metadata: ${item.name}`,
        "media",
        oldValue,
        { name: item.name, category: item.category },
        Array.isArray(ip) ? ip[0] : ip,
        userAgent
      );
      await cmsModel.writeDb(db);
      res.json({ success: true, message: "Media asset updated", asset: item });
    } catch (err) {
      next(err);
    }
  },
  /**
   * Remove an asset from Media Library
   */
  deleteMediaItem: async (req, res, next) => {
    try {
      const { mediaId } = req.params;
      const user = req.user;
      if (!user) {
        res.status(401).json({ success: false, message: "Unauthenticated user" });
        return;
      }
      if (user.role !== "admin" && user.role !== "super_admin" && user.role !== "super admin") {
        res.status(403).json({ success: false, message: "Permission Denied" });
        return;
      }
      const db = await cmsModel.readDb();
      const index = db.media.findIndex((m) => m.id === mediaId);
      if (index === -1) {
        res.status(404).json({ success: false, message: "Asset not found" });
        return;
      }
      const deletedItem = db.media[index];
      db.media.splice(index, 1);
      const ip = req.ip || req.headers["x-forwarded-for"] || "127.0.0.1";
      const userAgent = req.headers["user-agent"] || "Unknown Browser";
      await cmsModel.logActivity(
        user.name,
        user.email,
        `Deleted media asset: ${deletedItem.name}`,
        "media",
        { id: mediaId, name: deletedItem.name },
        null,
        Array.isArray(ip) ? ip[0] : ip,
        userAgent
      );
      await cmsModel.writeDb(db);
      res.json({ success: true, message: "Media asset deleted successfully." });
    } catch (err) {
      next(err);
    }
  },
  /**
   * Restores a previously saved version from Revision History
   */
  restoreRevision: async (req, res, next) => {
    try {
      const { revisionId } = req.params;
      const user = req.user;
      if (!user) {
        res.status(401).json({ success: false, message: "Unauthenticated user" });
        return;
      }
      if (user.role !== "admin" && user.role !== "super_admin" && user.role !== "super admin") {
        res.status(403).json({ success: false, message: "Only administrators can restore content revisions" });
        return;
      }
      const db = await cmsModel.readDb();
      const rev = db.revisions.find((r) => r.id === revisionId);
      if (!rev) {
        res.status(404).json({ success: false, message: "Revision version not found" });
        return;
      }
      const moduleId = rev.moduleId;
      const oldValue = JSON.parse(JSON.stringify(db[moduleId]));
      db[moduleId] = rev.content;
      db.revisions.forEach((r) => {
        if (r.moduleId === moduleId) {
          r.status = r.id === revisionId ? "published" : "previous";
        }
      });
      const ip = req.ip || req.headers["x-forwarded-for"] || "127.0.0.1";
      const userAgent = req.headers["user-agent"] || "Unknown Browser";
      await cmsModel.logActivity(
        user.name,
        user.email,
        `Restored module '${moduleId}' to Version ${rev.version}`,
        moduleId,
        oldValue,
        rev.content,
        Array.isArray(ip) ? ip[0] : ip,
        userAgent
      );
      await cmsModel.writeDb(db);
      res.json({ success: true, message: `Successfully restored content to version ${rev.version}!`, data: rev.content });
    } catch (err) {
      next(err);
    }
  },
  /**
   * Action for admin to moderate suggestions submitted by moderators
   */
  moderateSuggestion: async (req, res, next) => {
    try {
      const { suggestionId } = req.params;
      const { status } = req.body;
      const user = req.user;
      if (!user) {
        res.status(401).json({ success: false, message: "Unauthenticated" });
        return;
      }
      if (user.role !== "admin" && user.role !== "super_admin" && user.role !== "super admin") {
        res.status(403).json({ success: false, message: "Access Denied. Admin permissions required to moderate suggestions" });
        return;
      }
      if (status !== "approved" && status !== "rejected") {
        res.status(400).json({ success: false, message: "Status must be 'approved' or 'rejected'" });
        return;
      }
      const db = await cmsModel.readDb();
      const index = db.suggestions.findIndex((s) => s.id === suggestionId);
      if (index === -1) {
        res.status(404).json({ success: false, message: "Suggestion not found" });
        return;
      }
      const suggestion = db.suggestions[index];
      suggestion.status = status;
      const ip = req.ip || req.headers["x-forwarded-for"] || "127.0.0.1";
      const userAgent = req.headers["user-agent"] || "Unknown Browser";
      if (status === "approved") {
        const moduleId = suggestion.moduleId;
        const oldValue = JSON.parse(JSON.stringify(db[moduleId]));
        db[moduleId] = suggestion.content;
        await cmsModel.logActivity(
          user.name,
          user.email,
          `Approved and applied change: ${suggestion.action}`,
          moduleId,
          oldValue,
          suggestion.content,
          Array.isArray(ip) ? ip[0] : ip,
          userAgent
        );
        await cmsModel.createRevision(
          moduleId,
          `Approved Suggestion from ${suggestion.suggestedByName}: ${suggestion.action}`,
          suggestion.content,
          "published",
          user.email
        );
      } else {
        await cmsModel.logActivity(
          user.name,
          user.email,
          `Rejected moderator suggestion: ${suggestion.action}`,
          suggestion.moduleId,
          null,
          null,
          Array.isArray(ip) ? ip[0] : ip,
          userAgent
        );
      }
      await cmsModel.writeDb(db);
      res.json({ success: true, message: `Suggestion successfully ${status}!`, suggestion });
    } catch (err) {
      next(err);
    }
  }
};

// middleware/rateLimiter.ts
var import_express_rate_limit = __toESM(require("express-rate-limit"), 1);
var apiLimiter = (0, import_express_rate_limit.default)({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: 300,
  message: {
    error: "Too many requests from this client. Please try again after 15 minutes."
  },
  standardHeaders: true,
  // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false,
  // Disable the `X-RateLimit-*` headers
  handler: (req, res, next, options) => {
    logger.warn(`Rate limit triggered for general API: ${req.ip} -> ${req.originalUrl}`);
    res.status(options.statusCode).send(options.message);
  }
});
var heavyLimiter = (0, import_express_rate_limit.default)({
  windowMs: 1 * 60 * 1e3,
  // 1 minute
  max: 30,
  message: {
    error: "Too many heavy operations request. Please try again in a minute."
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    logger.warn(`Heavy rate limit triggered: ${req.ip} -> ${req.originalUrl}`);
    res.status(options.statusCode).send(options.message);
  }
});

// routes/index.ts
var router = (0, import_express.Router)();
router.use(apiLimiter);
var requireCmsAccess = async (req, res, next) => {
  authController.requireAuth(req, res, () => {
    const role = req.user?.role;
    if (role === "admin" || role === "super_admin" || role === "super admin" || role === "moderator") {
      next();
    } else {
      res.status(403).json({ error: "Forbidden", message: "CMS access is restricted to Administrators and Moderators." });
    }
  });
};
router.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
});
router.post("/auth/signup", authController.signUp);
router.post("/auth/login", authController.login);
router.post("/auth/logout", authController.logout);
router.get("/auth/me", authController.getMe);
router.get("/auth/get-profiles", authController.requireAuth, authController.getProfiles);
router.post("/auth/change-password", authController.requireAuth, authController.changePassword);
router.post("/auth/forgot-password", authController.forgotPassword);
router.post("/auth/reset-password", authController.resetPassword);
router.post("/auth/profile/update", authController.requireAuth, authController.updateProfile);
router.delete("/auth/profile/delete", authController.requireAuth, authController.deleteAccount);
router.post("/auth/update-profiles", authController.requireAuth, authController.updateProfilesList);
router.post("/auth/update-profile", authController.requireAuth, authController.updateProfilesList);
router.post("/auth/update-account-name", authController.requireAuth, authController.updateAccountName);
router.get("/petitions", petitionController.getPetitions);
router.get("/petitions/:slug", petitionController.getPetitionBySlug);
router.get("/petitions/:id/signatures", petitionController.getSignatures);
router.get("/petitions/:id/comments", petitionController.addComment);
router.post("/petitions/:id/sign", authController.requireAuth, petitionController.signPetition);
router.post("/petitions/:id/comments", authController.requireAuth, petitionController.addComment);
router.get("/admin/stats", authController.requireAdmin, petitionController.getAdminStats);
router.get("/admin/users", authController.requireAdmin, petitionController.getAdminUsers);
router.put("/admin/users/:email/role", authController.requireAdmin, petitionController.updateUserRole);
router.put("/admin/users/:email/status", authController.requireAdmin, petitionController.updateUserStatus);
router.post("/admin/users/:email/reset-password", authController.requireAdmin, petitionController.adminResetPassword);
router.post("/petitions", authController.requireAdmin, petitionController.savePetition);
router.post("/petitions/:id/updates", authController.requireAdmin, petitionController.addPetitionUpdate);
router.post("/petitions/comments/:commentId/status", authController.requireAdmin, petitionController.moderateComment);
router.delete("/petitions/:id", authController.requireAdmin, petitionController.deletePetition);
router.get("/cms/data", requireCmsAccess, cmsController.getCmsData);
router.post("/cms/update/:moduleId", requireCmsAccess, cmsController.updateModule);
router.post("/cms/media/upload", requireCmsAccess, cmsController.uploadMedia);
router.put("/cms/media/:mediaId", requireCmsAccess, cmsController.updateMediaItem);
router.delete("/cms/media/:mediaId", requireCmsAccess, cmsController.deleteMediaItem);
router.post("/cms/revisions/:revisionId/restore", requireCmsAccess, cmsController.restoreRevision);
router.post("/cms/suggestions/:suggestionId/moderate", requireCmsAccess, cmsController.moderateSuggestion);
router.get("/locker", authController.requireAuth, lockerController.getLocker);
router.post("/locker/save", authController.requireAuth, lockerController.saveCalculation);
router.post("/locker/update/:id", authController.requireAuth, lockerController.updateCalculation);
router.post("/locker/delete/:id", authController.requireAuth, lockerController.deleteCalculation);
router.delete("/locker/delete/:id", authController.requireAuth, lockerController.deleteCalculation);
router.post("/locker/favourite/:id", authController.requireAuth, lockerController.toggleFavourite);
router.post("/locker/bookmark", authController.requireAuth, lockerController.toggleBookmark);
router.post("/locker/notifications/:id/read", authController.requireAuth, lockerController.markNotificationRead);
router.post("/locker/notifications/:id/delete", authController.requireAuth, lockerController.deleteNotification);
router.get("/visitors", visitorController.getVisitors);
router.post("/visitors/hit", visitorController.hitVisitor);
router.get("/teacher-hub/data", teacherHubController.getData);
router.post("/teacher-hub/save", teacherHubController.saveData);
router.post("/chat", heavyLimiter, chatController.chat);
router.get("/chat/status", chatController.getStatus);
router.get("/market-insights", insightController.getMarketInsights);
var routes_default = router;

// server.ts
var app = (0, import_express2.default)();
var PORT = env.PORT;
app.set("trust proxy", 1);
validateEnv();
app.use(requestLogger);
app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use((0, import_cookie_parser.default)());
app.use(import_express2.default.json({ limit: "5mb" }));
app.use(import_express2.default.urlencoded({ extended: true, limit: "5mb" }));
app.use(sanitizeRequestMiddleware);
app.use((req, res, next) => {
  if (req.path.endsWith(".html") && !req.path.startsWith("/api")) {
    const cleanPath = req.path.slice(0, -5);
    const query = req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
    return res.redirect(301, cleanPath + query);
  }
  next();
});
app.use("/api", routes_default);
app.all("/api/*", (req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: `API endpoint ${req.method} ${req.originalUrl} does not exist.`
  });
});
async function startServer() {
  await verifyDbSchema();
  if (env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.get("/reset-password", async (req, res, next) => {
      try {
        const htmlPath = import_path.default.join(process.cwd(), "index.html");
        if (import_fs.default.existsSync(htmlPath)) {
          let html = import_fs.default.readFileSync(htmlPath, "utf-8");
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
          const targetFile = import_path.default.join(process.cwd(), cleanPath);
          if (import_fs.default.existsSync(targetFile)) {
            htmlPath = targetFile;
          }
        } else if (cleanPath) {
          const dirIndex = import_path.default.join(process.cwd(), cleanPath, "index.html");
          const htmlWithExt = import_path.default.join(process.cwd(), cleanPath + ".html");
          if (import_fs.default.existsSync(dirIndex)) {
            htmlPath = dirIndex;
          } else if (import_fs.default.existsSync(htmlWithExt)) {
            htmlPath = htmlWithExt;
          }
        }
        if (!htmlPath) {
          htmlPath = import_path.default.join(process.cwd(), "index.html");
        }
        if (import_fs.default.existsSync(htmlPath)) {
          let html = import_fs.default.readFileSync(htmlPath, "utf-8");
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
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.get("/reset-password", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
    app.use(import_express2.default.static(distPath));
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api")) {
        return next();
      }
      const cleanPath = req.path.replace(/\/$/, "");
      let htmlPath = "";
      if (cleanPath.endsWith(".html")) {
        const targetFile = import_path.default.join(distPath, cleanPath);
        if (import_fs.default.existsSync(targetFile)) {
          htmlPath = targetFile;
        }
      } else if (cleanPath) {
        const dirIndex = import_path.default.join(distPath, cleanPath, "index.html");
        const htmlWithExt = import_path.default.join(distPath, cleanPath + ".html");
        if (import_fs.default.existsSync(dirIndex)) {
          htmlPath = dirIndex;
        } else if (import_fs.default.existsSync(htmlWithExt)) {
          htmlPath = htmlWithExt;
        }
      }
      if (!htmlPath) {
        htmlPath = import_path.default.join(distPath, "index.html");
      }
      if (import_fs.default.existsSync(htmlPath)) {
        res.sendFile(htmlPath);
        return;
      }
      next();
    });
    logger.info(`Serving pre-compiled static assets from production folder with MPA router: ${distPath}`);
  }
  app.use(notFoundHandler);
  app.use(globalErrorHandler);
  app.listen(PORT, "0.0.0.0", () => {
    logger.info(`Paisa Blueprint Backend booted successfully. Running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
var server_default = app;
//# sourceMappingURL=server.cjs.map
