import { supabase } from "./utils/supabaseClient";

export const API_BASE = "";

/**
 * Returns the authorization headers (empty since we are temporarily guest-first).
 */
export function getAuthHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
  };
}

interface SavedItem {
  id: string;
  title: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  data: any;
  isFavourite: boolean;
}

function getLockerProperty(type: string): string | null {
  const t = type.toLowerCase().replace(/_/g, "");
  if (t === "salary" || t === "salarycalculations" || t === "salary_calculations") return "salaryCalculations";
  if (t === "pension" || t === "pensioncalculations" || t === "pension_calculations") return "pensionCalculations";
  if (t === "sip" || t === "sipplans" || t === "sip_plans") return "sipPlans";
  if (t === "nps" || t === "npsplans" || t === "nps_plans") return "npsPlans";
  if (t === "tax" || t === "taxcalculations" || t === "tax_calculations") return "taxCalculations";
  if (t === "goal" || t === "financialgoals" || t === "financial_goals") return "financialGoals";
  return null;
}

function getGuestLocker(): any {
  if (typeof window === "undefined") {
    return {
      savedCalculations: [],
      salaryCalculations: [],
      pensionCalculations: [],
      sipPlans: [],
      npsPlans: [],
      taxCalculations: [],
      financialGoals: [],
      favourites: [],
      recentlyViewed: []
    };
  }
  const itemsStr = localStorage.getItem("paisa_guest_locker_items");
  const items: SavedItem[] = itemsStr ? JSON.parse(itemsStr) : [];
  
  const response: any = {
    savedCalculations: [],
    salaryCalculations: [],
    pensionCalculations: [],
    sipPlans: [],
    npsPlans: [],
    taxCalculations: [],
    financialGoals: [],
    favourites: [],
    recentlyViewed: []
  };

  const sortedItems = [...items].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  response.savedCalculations = sortedItems;

  sortedItems.forEach(item => {
    const prop = getLockerProperty(item.type);
    if (prop && response[prop]) {
      response[prop].push(item);
    }
    if (item.isFavourite) {
      response.favourites.push(item);
    }
  });

  response.recentlyViewed = sortedItems.slice(0, 10);
  return response;
}

function formatLockerData(savedCalculations: any[]): any {
  const response: any = {
    savedCalculations: [],
    salaryCalculations: [],
    pensionCalculations: [],
    sipPlans: [],
    npsPlans: [],
    taxCalculations: [],
    financialGoals: [],
    favourites: [],
    recentlyViewed: []
  };

  const sortedItems = [...(savedCalculations || [])].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  response.savedCalculations = sortedItems;

  sortedItems.forEach(item => {
    const prop = getLockerProperty(item.type);
    if (prop && response[prop]) {
      response[prop].push(item);
    }
    if (item.isFavourite) {
      response.favourites.push(item);
    }
  });

  response.recentlyViewed = sortedItems.slice(0, 10);
  return response;
}

function mockResponse(data: any, status = 200, statusText = "OK"): Response {
  return new Response(JSON.stringify(data), {
    status,
    statusText,
    headers: { "Content-Type": "application/json" }
  });
}

async function logFrontendSaveAudit(endpoint: string, options: RequestInit, response: Response | null, stage: "REQUEST" | "RESPONSE") {
  if (endpoint.split("?")[0] !== "/api/locker/save") return;

  try {
    if (stage === "REQUEST") {
      console.log("%c--- FRONTEND SAVE TO VAULT AUDIT (REQUEST) ---", "color: #2563eb; font-weight: bold; font-size: 14px;");
      
      let session = null;
      try {
        const { data } = await supabase.auth.getSession();
        session = data.session;
      } catch (err) {
        console.error("[FRONTEND SAVE AUDIT] Failed to fetch session from Supabase:", err);
      }

      console.log("[FRONTEND SAVE AUDIT] 1. Log whether a Supabase session exists:", session !== null);
      console.log("[FRONTEND SAVE AUDIT] 2. Log the authenticated user object:", session?.user || null);
      console.log("[FRONTEND SAVE AUDIT] 3. Log the access token length:", session?.access_token ? session.access_token.length : 0);
      console.log("[FRONTEND SAVE AUDIT] 4. Log the exact API endpoint being called:", endpoint);
      console.log("[FRONTEND SAVE AUDIT] 5. Log the full request payload:", options.body ? JSON.parse(options.body as string) : null);
      console.log("%c---------------------------------------------", "color: #2563eb; font-weight: bold;");
    } else if (stage === "RESPONSE" && response) {
      console.log("%c--- FRONTEND SAVE TO VAULT AUDIT (RESPONSE) ---", "color: #10b981; font-weight: bold; font-size: 14px;");
      const clone = response.clone();
      let responseBody: any = "";
      try {
        const text = await clone.text();
        try {
          responseBody = JSON.parse(text);
        } catch (_) {
          responseBody = text;
        }
      } catch (err) {
        responseBody = "Error reading response body: " + String(err);
      }

      console.log("[FRONTEND SAVE AUDIT] 6. Log the full server response:", {
        status: response.status,
        statusText: response.statusText,
        headers: Array.from(response.headers.entries()),
        body: responseBody
      });
      console.log("%c----------------------------------------------", "color: #10b981; font-weight: bold;");
    }
  } catch (err) {
    console.error("[FRONTEND SAVE AUDIT] Error printing audit logs:", err);
  }
}

/**
 * A central request wrapper that:
 * 1. Intercepts auth, profiles, and locker endpoints to run completely client-side in Guest Mode.
 * 2. Proxies actual APIs (e.g. AI Coach /chat, /api/market-insights, /api/visitors) to backend.
 */
export async function paisaFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
  // Normalize endpoint path
  const path = endpoint.startsWith("http") 
    ? new URL(endpoint).pathname 
    : endpoint.split("?")[0];

  // Detect if user is authenticated or guest using local storage or Supabase Client
  let isGuest = true;
  let jwtToken: string | null = null;
  let currentUser: any = null;

  if (typeof window !== "undefined") {
    try {
      const localToken = localStorage.getItem("paisa_jwt_token");
      if (localToken) {
        jwtToken = localToken;
        isGuest = false;
        console.log("[paisaFetch AUTH LOG] Current user verified via local JWT token.");
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        currentUser = user;
        if (user) {
          console.log("[paisaFetch AUTH LOG] Current user verified via getUser:", user.email, "ID:", user.id);
          isGuest = false;
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            jwtToken = session.access_token;
            console.log("[paisaFetch AUTH LOG] Current session active. Access token exists:", !!jwtToken);
          }
        } else {
          console.log("[paisaFetch AUTH LOG] Current user is not logged in. Defaulting to Guest.");
        }
      }
    } catch (e) {
      console.warn("Error reading active session in paisaFetch:", e);
    }
  }

  // Helper to construct request options with dynamic token embedding
  const getFetchOptions = (customHeaders: Record<string, string> = {}) => {
    const headers = { ...options.headers, ...customHeaders } as Record<string, string>;
    if (jwtToken) {
      headers["Authorization"] = `Bearer ${jwtToken}`;
    }
    return {
      ...options,
      credentials: "include" as RequestCredentials,
      headers
    } as RequestInit;
  };

  // If the user is NOT a guest, intercept specific locker endpoints to fetch real backend data and format it
  if (!isGuest) {
    if (path === "/api/locker") {
      try {
        const response = await fetch(endpoint.startsWith("http") ? endpoint : `${API_BASE}${endpoint}`, getFetchOptions());
        if (response.ok) {
          const rawData = await response.json();
          const formatted = formatLockerData(rawData.savedCalculations || []);
          return mockResponse(formatted);
        }
        return response;
      } catch (err) {
        console.error("Error fetching and formatting locker:", err);
      }
    }

    if (path === "/api/locker/recent") {
      try {
        const response = await fetch(endpoint.startsWith("http") ? endpoint : `${API_BASE}/api/locker`, getFetchOptions());
        if (response.ok) {
          const rawData = await response.json();
          const formatted = formatLockerData(rawData.savedCalculations || []);
          return mockResponse(formatted.recentlyViewed);
        }
        return response;
      } catch (err) {
        console.error("Error fetching locker/recent:", err);
      }
    }

    if (path === "/api/locker/favourites") {
      try {
        const response = await fetch(endpoint.startsWith("http") ? endpoint : `${API_BASE}/api/locker`, getFetchOptions());
        if (response.ok) {
          const rawData = await response.json();
          const formatted = formatLockerData(rawData.savedCalculations || []);
          return mockResponse(formatted.favourites);
        }
        return response;
      } catch (err) {
        console.error("Error fetching locker/favourites:", err);
      }
    }

    if (path === "/api/locker/search") {
      try {
        const response = await fetch(endpoint.startsWith("http") ? endpoint : `${API_BASE}/api/locker`, getFetchOptions());
        if (response.ok) {
          const rawData = await response.json();
          let query = "";
          if (endpoint.includes("?")) {
            const searchParams = new URLSearchParams(endpoint.split("?")[1]);
            query = searchParams.get("q") || "";
          }
          const items = rawData.savedCalculations || [];
          const results = items
            .filter((i: any) => i.title.toLowerCase().includes(query.toLowerCase()))
            .sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
          return mockResponse(results);
        }
        return response;
      } catch (err) {
        console.error("Error searching locker:", err);
      }
    }
  }

  // 1. Intercept Auth endpoints in Guest Mode only
  if (isGuest) {
    if (path === "/api/auth/me") {
      const user = {
        name: "Guest",
        fullName: "Guest User",
        email: "guest@paisablueprint.in",
        profilePhoto: "🧑‍💼"
      };
      return mockResponse({ user });
    }

    if (path === "/api/auth/logout") {
      if (typeof window !== "undefined") {
        localStorage.removeItem("paisa_jwt_token");
      }
      return mockResponse({ success: true });
    }

    if (path === "/api/auth/get-profiles" || path === "/api/auth/get-profile") {
      const profilesListStr = localStorage.getItem("paisa_family_profiles_list");
      const profilesList = profilesListStr ? JSON.parse(profilesListStr) : [];
      const activeProfileId = localStorage.getItem("paisa_active_profile_id") || "profile-main";
      return mockResponse({ profilesList, activeProfileId });
    }

    if (path === "/api/auth/update-profiles" || path === "/api/auth/update-profile") {
      try {
        const body = JSON.parse(options.body as string);
        if (body.profilesList) {
          localStorage.setItem("paisa_family_profiles_list", JSON.stringify(body.profilesList));
        }
        if (body.activeProfileId) {
          localStorage.setItem("paisa_active_profile_id", body.activeProfileId);
        }
        return mockResponse({ success: true });
      } catch (e) {
        return mockResponse({ error: "Bad Request" }, 400);
      }
    }

    if (path === "/api/auth/update-account-name") {
      return mockResponse({ success: true });
    }

    // 2. Intercept Locker endpoints in Guest Mode only
    if (path === "/api/locker") {
      return mockResponse(getGuestLocker());
    }

    if (path === "/api/locker/recent") {
      const locker = getGuestLocker();
      return mockResponse(locker.recentlyViewed);
    }

    if (path === "/api/locker/save") {
      return new Promise<Response>((resolve) => {
        const proceedWithGuestSave = () => {
          try {
            const body = JSON.parse(options.body as string);
            const itemsStr = localStorage.getItem("paisa_guest_locker_items");
            const items: SavedItem[] = itemsStr ? JSON.parse(itemsStr) : [];
            const now = new Date().toISOString();
            const newItem: SavedItem = {
              id: "item-" + Math.random().toString(36).substring(2, 15),
              title: (body.title || "").trim(),
              type: (body.type || "").trim(),
              createdAt: now,
              updatedAt: now,
              data: body.data,
              isFavourite: false
            };
            items.push(newItem);
            localStorage.setItem("paisa_guest_locker_items", JSON.stringify(items));
            resolve(mockResponse(newItem));
          } catch (e) {
            resolve(mockResponse({ error: "Bad Request" }, 400));
          }
        };

        const triggerEvent = new CustomEvent("paisa-trigger-auth", {
          detail: {
            feature: "Save to Vault",
            onSuccess: async (user: any) => {
              localStorage.setItem("paisa_active_session", JSON.stringify(user));
              let freshToken = localStorage.getItem("paisa_jwt_token");
              try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                  freshToken = session.access_token;
                }
              } catch (_) {}
              try {
                const headers = {
                  ...options.headers,
                  "Content-Type": "application/json"
                } as Record<string, string>;
                if (freshToken) {
                  headers["Authorization"] = `Bearer ${freshToken}`;
                }
                const destUrl = endpoint.startsWith("http") ? endpoint : `${API_BASE}${endpoint}`;
                
                await logFrontendSaveAudit(endpoint, { ...options, headers }, null, "REQUEST");
                
                const response = await fetch(destUrl, {
                  ...options,
                  credentials: "include",
                  headers
                });
                
                await logFrontendSaveAudit(endpoint, { ...options, headers }, response, "RESPONSE");
                
                resolve(response);
              } catch (err) {
                proceedWithGuestSave();
              }
            },
            onGuestContinue: () => {
              proceedWithGuestSave();
            }
          }
        });
        window.dispatchEvent(triggerEvent);
      });
    }

    if (path.startsWith("/api/locker/update/")) {
      try {
        const id = path.substring("/api/locker/update/".length);
        const body = JSON.parse(options.body as string);
        const itemsStr = localStorage.getItem("paisa_guest_locker_items");
        const items: SavedItem[] = itemsStr ? JSON.parse(itemsStr) : [];
        const item = items.find(i => i.id === id);
        if (item) {
          if (body.title !== undefined) item.title = body.title.trim();
          if (body.data !== undefined) item.data = body.data;
          item.updatedAt = new Date().toISOString();
          localStorage.setItem("paisa_guest_locker_items", JSON.stringify(items));
          return mockResponse(item);
        }
        return mockResponse({ error: "Not Found", message: "Item not found" }, 404);
      } catch (e) {
        return mockResponse({ error: "Bad Request" }, 400);
      }
    }

    if (path.startsWith("/api/locker/delete/")) {
      try {
        const id = path.substring("/api/locker/delete/".length);
        const itemsStr = localStorage.getItem("paisa_guest_locker_items");
        let items: SavedItem[] = itemsStr ? JSON.parse(itemsStr) : [];
        items = items.filter(i => i.id !== id);
        localStorage.setItem("paisa_guest_locker_items", JSON.stringify(items));
        return mockResponse({ success: true, message: "Locker item deleted successfully." });
      } catch (e) {
        return mockResponse({ error: "Bad Request" }, 400);
      }
    }

    if (path.startsWith("/api/locker/favourite/")) {
      try {
        const id = path.substring("/api/locker/favourite/".length);
        const itemsStr = localStorage.getItem("paisa_guest_locker_items");
        const items: SavedItem[] = itemsStr ? JSON.parse(itemsStr) : [];
        const item = items.find(i => i.id === id);
        if (item) {
          item.isFavourite = !item.isFavourite;
          item.updatedAt = new Date().toISOString();
          localStorage.setItem("paisa_guest_locker_items", JSON.stringify(items));
          return mockResponse(item);
        }
        return mockResponse({ error: "Not Found", message: "Item not found" }, 404);
      } catch (e) {
        return mockResponse({ error: "Bad Request" }, 400);
      }
    }

    if (path === "/api/locker/favourites") {
      const locker = getGuestLocker();
      return mockResponse(locker.favourites);
    }

    if (path === "/api/locker/search") {
      let query = "";
      if (endpoint.includes("?")) {
        const searchParams = new URLSearchParams(endpoint.split("?")[1]);
        query = searchParams.get("q") || "";
      }
      const itemsStr = localStorage.getItem("paisa_guest_locker_items");
      const items: SavedItem[] = itemsStr ? JSON.parse(itemsStr) : [];
      const results = items
        .filter(i => i.title.toLowerCase().includes(query.toLowerCase()))
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      return mockResponse(results);
    }
  }

  // 3. Fallthrough actual network call for non-intercepted endpoints or Authenticated Users
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE}${endpoint}`;
  
  console.log("[paisaFetch API REQUEST] URL:", url, "Method:", options.method || "GET", "Headers:", getFetchOptions()["headers"]);
  
  try {
    const fetchOpts = getFetchOptions({ "Content-Type": "application/json" });
    await logFrontendSaveAudit(endpoint, fetchOpts, null, "REQUEST");
    
    const response = await fetch(url, fetchOpts);
    
    await logFrontendSaveAudit(endpoint, fetchOpts, response, "RESPONSE");
    
    console.log("[paisaFetch API RESPONSE] Status:", response.status, "URL:", response.url);
    
    // Auto-capture JWT tokens for authenticated sessions to handle iframe same-site cookies
    if (response.ok && (path === "/api/auth/login" || path === "/api/auth/signup")) {
      try {
        const clone = response.clone();
        const data = await clone.json();
        console.log("[paisaFetch API RESPONSE BODY] Auth result:", data);
        if (data.success && data.token) {
          localStorage.setItem("paisa_jwt_token", data.token);
        }
        if (data.success && data.supabaseSession) {
          console.log("[paisaFetch AUTH SYNC] Syncing session to Supabase Client...");
          const { error } = await supabase.auth.setSession({
            access_token: data.supabaseSession.access_token,
            refresh_token: data.supabaseSession.refresh_token
          });
          if (error) {
            console.error("[paisaFetch AUTH SYNC ERROR] Failed to set session:", error);
          } else {
            console.log("[paisaFetch AUTH SYNC SUCCESS] Session synced successfully.");
          }
        }
      } catch (err) {
        console.warn("Failed to parse response clone for token extraction:", err);
      }
    }

    if (response.ok && path === "/api/auth/logout") {
      if (typeof window !== "undefined") {
        localStorage.removeItem("paisa_jwt_token");
      }
      console.log("[paisaFetch AUTH LOGOUT] Signing out from Supabase client...");
      await supabase.auth.signOut();
    }

    return response;
  } catch (error) {
    console.error(`paisaFetch failed for URL [${url}] with error:`, error);
    throw error;
  }
}
