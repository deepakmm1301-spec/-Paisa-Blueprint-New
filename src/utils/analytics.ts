/**
 * Google Analytics 4 (GA4) Integration Utility
 * Handles dynamic script loading, single-instance initialization, and SPA route tracking.
 */

const GA_MEASUREMENT_ID = ((import.meta as any).env?.VITE_GA_MEASUREMENT_ID as string) || "G-D51086S0ZT";

/**
 * Initializes Google Analytics (gtag.js) if not already loaded.
 * Ensures the script is injected once and the gtag helper is bound to window.
 */
export function initGA(): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  // Prevent duplicate script insertion
  if (document.getElementById("google-analytics-script")) {
    return;
  }

  try {
    // 1. Create and inject gtag.js script
    const script = document.createElement("script");
    script.id = "google-analytics-script";
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    // 2. Initialize dataLayer and window.gtag function
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).gtag = function (...args: any[]) {
      (window as any).dataLayer.push(args);
    };

    // 3. Configure defaults (with send_page_view: false to prevent duplicate pageviews on initial load)
    const gtag = (window as any).gtag;
    gtag("js", new Date());
    gtag("config", GA_MEASUREMENT_ID, {
      send_page_view: false,
    });
  } catch (error) {
    console.error("Failed to initialize Google Analytics:", error);
  }
}

/**
 * Tracks a page view event with the specified title and path.
 * Dynamically updates the configuration and triggers the page_view event.
 * 
 * @param title The page or widget title
 * @param path The current URL path
 */
export function trackPageView(title: string, path: string): void {
  if (typeof window === "undefined") return;

  // Lazily initialize GA if it hasn't been done yet
  initGA();

  try {
    const gtag = (window as any).gtag;
    if (typeof gtag === "function") {
      gtag("event", "page_view", {
        page_title: title,
        page_location: window.location.href,
        page_path: path,
        send_to: GA_MEASUREMENT_ID,
      });
    }
  } catch (error) {
    console.error("Failed to track page view:", error);
  }
}
