import { GoogleGenAI, Type } from "@google/genai";
import { env } from "../config/env";
import { logger } from "../utils/logger";

let aiInstance: GoogleGenAI | null = null;

/**
 * Initializes and retrieves the GoogleGenAI instance.
 * Supports a custom API key from request payload if provided.
 */
export function getAIClient(customApiKey?: string): GoogleGenAI {
  if (customApiKey && customApiKey.trim() !== "") {
    return new GoogleGenAI({
      apiKey: customApiKey.trim(),
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        }
      }
    });
  }

  if (!aiInstance) {
    const apiKey = env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GEMINI_API_KEY is not configured in your environment secrets on this server host. " +
        "To proceed, please provide your own custom Gemini API Key in the Coach settings panel."
      );
    }
    aiInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        }
      }
    });
  }
  return aiInstance;
}

/**
 * Checks if a default Gemini API Key is available on the server host.
 */
export function hasServerApiKey(): boolean {
  return typeof env.GEMINI_API_KEY === "string" && env.GEMINI_API_KEY.trim() !== "";
}

/**
 * Calls Gemini API to generate structured market insights.
 * Falls back if call fails or times out.
 */
export async function generateRemoteInsights(isHindi: boolean): Promise<any[] | null> {
  try {
    const ai = getAIClient();
    let prompt = `Generate exactly 4 fresh, highly informative and realistic market insights targeting:
1. Bihar Teacher Transfer policies (specifically the new 'Bihar State Teacher Transfer Rules, 2026' notified on June 25, 2026, implementing a Point-Based Seniority System with max 20 pts for medical/disability, 15 pts for spouse posting, and service tenure points)
2. Bihar Teacher Salary (BPSC salaries, 7th Pay DA updates at 50-53%, pension structures, actual numbers)
3. Teachers news of neighbouring states (UP recruitment board, Jharkhand DA at 50-53% raises, West Bengal scaling)
4. State & Central government employees (8th Pay Commission fitment factor memorandum, Unified Pension Scheme UPS vs NPS options)`;

    if (isHindi) {
      prompt += `\n\nCRITICAL REQUIRED TRANSLATION: You MUST write all textual fields (title, summary, status, date, and impact) in fluent, natural Hindi using the Devanagari script.
However, the 'category' field MUST remain in English as one of the following exact strings: "Bihar Teacher Transfer", "Bihar Teacher Salary", "Neighbouring States", "State & Central Employees" for programmatic filtering to work on the client side.`;
    } else {
      prompt += `\n\nThe 'category' field MUST be exactly one of: "Bihar Teacher Transfer", "Bihar Teacher Salary", "Neighbouring States", "State & Central Employees". All other text fields should be in English.`;
    }

    // 4.5 second timeout promise to avoid hanging connections or Gateway/Nginx timeouts
    let timeoutId: NodeJS.Timeout | undefined;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error("Gemini API call timed out after 4500ms")), 4500);
    });

    // Race the actual Gemini API call against the timeout promise
    const result = await Promise.race([
      ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          temperature: 0.7,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                category: { type: Type.STRING },
                title: { type: Type.STRING },
                summary: { type: Type.STRING },
                status: { type: Type.STRING },
                statusColor: { type: Type.STRING },
                date: { type: Type.STRING },
                impact: { type: Type.STRING }
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
