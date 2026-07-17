import { Request, Response, NextFunction } from "express";
import { getAIClient, hasServerApiKey } from "../services/geminiService";
import { generateLocalAdvisorReply } from "../services/localAdvisorService";
import { logger } from "../utils/logger";

export const chatController = {
  chat: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { messages, userProfile, customApiKey, forceLocal } = req.body;
    
    try {
      const serverKeyAvailable = hasServerApiKey();
      const hasAnyKey = serverKeyAvailable || (customApiKey && customApiKey.trim() !== "");

      logger.info(`Chat request received. ForceLocal: ${forceLocal}, ServerKeyAvailable: ${serverKeyAvailable}, HasCustomKey: ${!!customApiKey}`);

      // If no key is configured or local is forced, instantly output high-fidelity local advice
      if (forceLocal || !hasAnyKey) {
        logger.info("Serving rule-based local expert simulation response.");
        const content = generateLocalAdvisorReply(messages || [], userProfile);
        res.json({
          role: "assistant",
          content: content
        });
        return;
      }

      // Initialize Gemini Client
      const ai = getAIClient(customApiKey);

      // Inject profile and guidelines as a strong system instruction
      const systemInstruction = `You are "Paisa Blueprint AI Coach", an expert personal financial adviser specializing in Indian personal finance, salaried employees, and government salary structures.
Your tone is encouraging, objective, smart, and financially prudent. You think like a typical middle-class or wealthy Indian household optimizer (minimizing taxes, maximizing safe compounding via Mutual Funds/SIP, buying Term over ULIP, keeping a solid emergency fund).

Use Indian Rupees (₹, Lakhs, Crores) for all numbers.
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

      // Transform raw client messages into the structure expected by the GoogleGenAI SDK
      const contents = (messages || []).map((m: any) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content || "" }]
      }));

      // Keep context length under model limits if necessary
      while (contents.length > 20) {
        contents.shift();
      }

      // If history is empty for any reason, provide a baseline fallback prompt
      if (contents.length === 0) {
        contents.push({
          role: "user",
          parts: [{ text: "Hello, I want to talk about personal finance." }]
        });
      }

      logger.info("Generating content via Gemini API...");
      const result = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      const responseText = result.text || "I was unable to formulate a response. Please try again.";

      res.json({
        role: "assistant",
        content: responseText
      });

    } catch (error: any) {
      logger.error("AI Coach Error - Fallback to Local Expert:", error);
      try {
        // Fallback to local advisor
        const content = generateLocalAdvisorReply(messages || [], userProfile);
        res.json({
          role: "assistant",
          content: `*(Fallback Local Advisory Enabled)*\n\n${content}`
        });
      } catch (fallbackErr) {
        next(fallbackErr);
      }
    }
  },

  getStatus: (req: Request, res: Response, next: NextFunction): void => {
    try {
      res.json({ hasApiKey: hasServerApiKey() });
    } catch (err) {
      next(err);
    }
  }
};
