import { createClient } from "@supabase/supabase-js";
import { logger } from "../utils/logger";

export interface TeacherHubData {
  teachers: any[];
  requests: any[];
  notifications: any[];
  successStories: any[];
  auditLogs: any[];
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase: any = null;

if (!supabaseUrl || !supabaseKey) {
  logger.warn("[SUPABASE CLIENT ERROR] Missing Supabase environment variables! Teacher Hub database operations will fail on invocation.");
} else {
  supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false
    }
  });
  logger.info("[SUPABASE CLIENT] Supabase client initialized cleanly for strict Teacher Hub operations.");
}

export const teacherHubModel = {
  getData: async (): Promise<TeacherHubData | null> => {
    try {
      logger.info("[SUPABASE FETCH] Fetching global state from Supabase 'teacher_hub_data' table...");
      const { data, error } = await supabase
        .from("teacher_hub_data")
        .select("payload")
        .eq("id", "global_state")
        .single();

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
          auditLogs: Array.isArray(parsed.auditLogs) ? parsed.auditLogs : [],
        };
      }
    } catch (err: any) {
      logger.error("[SUPABASE FETCH ERROR] Unexpected exception during Supabase query:", err.message);
      throw err;
    }
    return null;
  },

  saveData: async (data: TeacherHubData): Promise<boolean> => {
    // Load current existing data first to perform a safe merge and preserve registrations
    let existing: TeacherHubData = {
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

    // Merge Teachers array: match by mobile or by id to update or insert safely.
    const mergedTeachers = [...existing.teachers];
    for (const incoming of data.teachers) {
      const indexByMobile = mergedTeachers.findIndex(t => t.mobile && incoming.mobile && t.mobile === incoming.mobile);
      const indexById = mergedTeachers.findIndex(t => t.id === incoming.id);
      
      if (indexByMobile > -1) {
        mergedTeachers[indexByMobile] = { ...mergedTeachers[indexByMobile], ...incoming };
      } else if (indexById > -1) {
        mergedTeachers[indexById] = { ...mergedTeachers[indexById], ...incoming };
      } else {
        // Only insert if it is NOT a randomized client filler profile (which starts with 't-gen-')
        const isFiller = incoming.id && incoming.id.startsWith("t-gen-");
        if (!isFiller) {
          logger.info(`[REGISTRATION REQUEST] Registering/adding new profile: ${incoming.name} (Mobile: ${incoming.mobile})`);
          mergedTeachers.unshift(incoming);
        }
      }
    }

    // Merge Requests array by ID
    const mergedRequests = [...existing.requests];
    for (const incoming of data.requests) {
      const index = mergedRequests.findIndex(r => r.id === incoming.id);
      if (index > -1) {
        mergedRequests[index] = { ...mergedRequests[index], ...incoming };
      } else {
        mergedRequests.push(incoming);
      }
    }

    // Merge Notifications array by ID
    const mergedNotifications = [...existing.notifications];
    for (const incoming of data.notifications) {
      const index = mergedNotifications.findIndex(n => n.id === incoming.id);
      if (index > -1) {
        mergedNotifications[index] = { ...mergedNotifications[index], ...incoming };
      } else {
        mergedNotifications.unshift(incoming);
      }
    }

    // Merge Success Stories by ID
    const mergedSuccessStories = [...existing.successStories];
    for (const incoming of data.successStories) {
      const index = mergedSuccessStories.findIndex(s => s.id === incoming.id);
      if (index > -1) {
        mergedSuccessStories[index] = { ...mergedSuccessStories[index], ...incoming };
      } else {
        mergedSuccessStories.unshift(incoming);
      }
    }

    // Merge Audit Logs by ID
    const mergedAuditLogs = [...existing.auditLogs];
    for (const incoming of data.auditLogs) {
      const index = mergedAuditLogs.findIndex(a => a.id === incoming.id);
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
      auditLogs: mergedAuditLogs.slice(0, 500),
    };

    try {
      logger.info("[SUPABASE SAVE] Upserting merged payload to Supabase 'teacher_hub_data' table...");
      const { error } = await supabase
        .from("teacher_hub_data")
        .upsert({
          id: "global_state",
          payload: mergedPayload,
          updated_at: new Date().toISOString()
        });

      if (error) {
        throw error;
      }

      logger.info(`[SUPABASE SAVE SUCCESS] Successfully committed merged database to Supabase. Total teachers: ${mergedTeachers.length}`);
      return true;
    } catch (err: any) {
      logger.error(`[SUPABASE SAVE ERROR] Failed to save merged state to Supabase: ${err.message || err}.`);
      throw err;
    }
  },

  overwriteState: async (payload: any): Promise<boolean> => {
    try {
      logger.info("[SUPABASE OVERWRITE] Overwriting entire payload in 'teacher_hub_data' table...");
      const { error } = await supabase
        .from("teacher_hub_data")
        .upsert({
          id: "global_state",
          payload,
          updated_at: new Date().toISOString()
        });

      if (error) {
        throw error;
      }

      logger.info(`[SUPABASE OVERWRITE SUCCESS] Successfully committed clean database. Teachers: ${payload.teachers?.length}`);
      return true;
    } catch (err: any) {
      logger.error(`[SUPABASE OVERWRITE ERROR] Failed to overwrite state: ${err.message || err}.`);
      throw err;
    }
  }
};
