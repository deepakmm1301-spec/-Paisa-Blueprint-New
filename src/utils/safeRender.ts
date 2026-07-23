/**
 * Defensive utility function to safely render text in React JSX.
 * Prevents "Objects are not valid as a React child" (Minified React Error #31).
 */
export function safeRenderText(val: any, fallback: string = ""): string {
  if (val === null || val === undefined) return fallback;
  if (typeof val === "string") return val;
  if (typeof val === "number" || typeof val === "boolean") return String(val);
  
  if (typeof val === "object") {
    if (typeof val.option_text === "string") return val.option_text;
    if (typeof val.option_text === "object" && val.option_text !== null) {
      return safeRenderText(val.option_text, fallback);
    }
    if (typeof val.text === "string") return val.text;
    if (typeof val.label === "string") return val.label;
    if (typeof val.title === "string") return val.title;
    if (typeof val.name === "string") return val.name;
    if (typeof val.question === "string") return val.question;
    if (typeof val.message === "string") return val.message;
    if (typeof val.value === "string" || typeof val.value === "number") return String(val.value);
    
    try {
      return JSON.stringify(val);
    } catch {
      return fallback;
    }
  }
  
  return String(val);
}

/**
 * Safely extracts a string ID from an object or string
 */
export function safeExtractId(val: any): string {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (typeof val === "number") return String(val);
  if (typeof val === "object") {
    if (val.id) return String(val.id);
    if (val._id) return String(val._id);
  }
  return String(val);
}
