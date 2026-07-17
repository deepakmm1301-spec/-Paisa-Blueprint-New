import { Request, Response, NextFunction } from "express";
import { generateRemoteInsights, hasServerApiKey } from "../services/geminiService";
import { offlineInsightsEn, offlineInsightsHi } from "../services/localAdvisorService";
import { logger } from "../utils/logger";

export const insightController = {
  getMarketInsights: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const lang = req.query.lang === "hi" ? "hi" : "en";
      const forceLocal = req.query.forceLocal === "true";

      logger.info(`Market Insights requested. Lang: ${lang}, ForceLocal: ${forceLocal}`);

      // If forceLocal is requested or no server API key is configured, fallback instantly
      if (forceLocal || !hasServerApiKey()) {
        logger.info("Serving offline local dataset for market insights.");
        res.json({
          source: "local",
          insights: lang === "hi" ? offlineInsightsHi : offlineInsightsEn
        });
        return;
      }

      // Try calling Gemini API for fresh dynamic insights
      const remoteInsights = await generateRemoteInsights(lang === "hi");
      if (remoteInsights) {
        logger.info("Serving dynamically generated Gemini AI market insights.");
        res.json({
          source: "gemini",
          insights: remoteInsights
        });
        return;
      }

      // Fallback if remote fails
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
