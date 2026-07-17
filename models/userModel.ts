import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import { logger } from "../utils/logger";

export interface SavedCalculation {
  id: string;
  title: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  data: any;
  isFavourite?: boolean;
}

export interface UserAccount {
  email: string;
  name: string;
  role: string;
  status?: "active" | "suspended"; // Added for administrative suspension
  profilePhoto?: string;
  profilesList: any[];
  activeProfileId: string;
  savedCalculations: SavedCalculation[];
  bookmarkedTools: any[];
  notifications: any[];
  createdAt: string;
  updatedAt?: string;
  userId?: string; // stable Supabase Auth UUID
  last_login_at?: string; // stable login timestamp
}

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export let supabase: any = null;

if (!supabaseUrl || !supabaseKey) {
  logger.warn("[SUPABASE USER MODEL] Missing Supabase environment variables! User database operations will fail on invocation.");
} else {
  supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false
    }
  });
  logger.info("[SUPABASE USER MODEL] Supabase client initialized for User Authentication and cloud user-data syncing.");
}

// -------------------------------------------------------------
// USER MODEL METHODS (STRICT SUPABASE MODE - NO FALLBACKS)
// -------------------------------------------------------------
export const userModel = {
  /**
   * Helper to retrieve auth user ID (UUID) by email
   */
  getAuthUuidByEmail: async (email: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase.auth.admin.listUsers();
      if (!error && data?.users) {
        const user = data.users.find((u: any) => u.email?.toLowerCase() === email.toLowerCase().trim());
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
  getUserDataByUuidOrEmail: async (uuid: string, email: string): Promise<UserAccount | null> => {
    const cleanEmail = email.toLowerCase().trim();
    let account: UserAccount | null = null;

    try {
      // 1. First, search by UUID (id = uuid)
      console.log(`[DATABASE QUERY AUDIT] Searching profile in 'paisa_user_data' by UUID: ${uuid}`);
      let { data, error } = await supabase
        .from("paisa_user_data")
        .select("*")
        .eq("id", uuid)
        .single();

      if (!error && data) {
        console.log(`[DATABASE QUERY SUCCESS] Profile found by UUID in 'paisa_user_data': ${uuid}`);
        account = {
          email: cleanEmail,
          userId: uuid,
          name: data.name || cleanEmail.split("@")[0],
          role: data.role || "user",
          profilePhoto: data.profile_photo || "🧑‍💼",
          profilesList: Array.isArray(data.profiles_list) ? data.profiles_list : [],
          activeProfileId: data.active_profile_id || "profile-main",
          savedCalculations: Array.isArray(data.saved_calculations) ? data.saved_calculations : [],
          bookmarkedTools: Array.isArray(data.bookmarked_tools) ? data.bookmarked_tools : [],
          notifications: Array.isArray(data.notifications) ? data.notifications : [],
          createdAt: data.created_at || new Date().toISOString(),
          updatedAt: data.updated_at,
          status: data.status || "active",
          last_login_at: data.last_login_at
        };
      } else {
        // 2. Not found by UUID. Search by email strictly
        console.log(`[DATABASE QUERY AUDIT] Profile not found by UUID. Searching by Email in 'paisa_user_data': ${cleanEmail}`);
        let { data: emailData, error: emailErr } = await supabase
          .from("paisa_user_data")
          .select("*")
          .eq("email", cleanEmail)
          .single();

        if (!emailErr && emailData) {
          console.log(`[DATABASE QUERY SUCCESS] Profile found by Email in 'paisa_user_data': ${cleanEmail}`);
          
          // Migrate old record if its ID was a legacy email instead of UUID
          if (emailData.id !== uuid && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(emailData.id)) {
            console.log(`[USER MODEL] Migrating legacy profile ID ${emailData.id} to UUID ${uuid}`);
            await supabase.from("paisa_user_data").delete().eq("id", emailData.id);
          }

          account = {
            email: cleanEmail,
            userId: uuid, // Bind the UUID now
            name: emailData.name || cleanEmail.split("@")[0],
            role: emailData.role || "user",
            profilePhoto: emailData.profile_photo || "🧑‍💼",
            profilesList: Array.isArray(emailData.profiles_list) ? emailData.profiles_list : [],
            activeProfileId: emailData.active_profile_id || "profile-main",
            savedCalculations: Array.isArray(emailData.saved_calculations) ? emailData.saved_calculations : [],
            bookmarkedTools: Array.isArray(emailData.bookmarked_tools) ? emailData.bookmarked_tools : [],
            notifications: Array.isArray(emailData.notifications) ? emailData.notifications : [],
            createdAt: emailData.created_at || new Date().toISOString(),
            updatedAt: emailData.updated_at,
            status: emailData.status || "active",
            last_login_at: emailData.last_login_at
          };

          // Save migrated record with UUID primary key
          await userModel.saveUserData(account);
        }
      }
    } catch (err: any) {
      console.error("[DATABASE QUERY EXCEPTION] Unexpected error in getUserDataByUuidOrEmail:", err);
      throw err;
    }

    return account;
  },

  /**
   * Helper to fetch data for a user
   */
  getUserData: async (emailOrId: string): Promise<UserAccount | null> => {
    const cleanIdentifier = emailOrId.toLowerCase().trim();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanIdentifier);
    
    let account: UserAccount | null = null;
    let uuid: string | null = isUuid ? cleanIdentifier : null;
    let email: string | null = isUuid ? null : cleanIdentifier;

    try {
      // 1. Try fetching by UUID if we have one
      if (uuid) {
        console.log(`[DATABASE QUERY AUDIT] Executing select query on table 'paisa_user_data' for UUID: ${uuid}`);
        const { data, error } = await supabase
          .from("paisa_user_data")
          .select("*")
          .eq("id", uuid)
          .single();

        if (!error && data) {
          console.log(`[DATABASE QUERY SUCCESS] Successfully retrieved user record for UUID: ${uuid}`);
          account = {
            email: data.email || "",
            userId: uuid,
            name: data.name || "",
            role: data.role || "user",
            profilePhoto: data.profile_photo || "🧑‍💼",
            profilesList: Array.isArray(data.profiles_list) ? data.profiles_list : [],
            activeProfileId: data.active_profile_id || "profile-main",
            savedCalculations: Array.isArray(data.saved_calculations) ? data.saved_calculations : [],
            bookmarkedTools: Array.isArray(data.bookmarked_tools) ? data.bookmarked_tools : [],
            notifications: Array.isArray(data.notifications) ? data.notifications : [],
            createdAt: data.created_at || new Date().toISOString(),
            updatedAt: data.updated_at,
            status: data.status || "active",
            last_login_at: data.last_login_at
          };
        }
      }

      // 2. Try fetching by email strictly
      if (!account && email) {
        console.log(`[DATABASE QUERY AUDIT] Executing select query on table 'paisa_user_data' for email: ${email}`);
        const { data, error } = await supabase
          .from("paisa_user_data")
          .select("*")
          .eq("email", email)
          .single();

        if (!error && data) {
          console.log(`[DATABASE QUERY SUCCESS] Successfully retrieved user record for email: ${email}`);
          account = {
            email: email,
            userId: data.id,
            name: data.name || "",
            role: data.role || "user",
            profilePhoto: data.profile_photo || "🧑‍💼",
            profilesList: Array.isArray(data.profiles_list) ? data.profiles_list : [],
            activeProfileId: data.active_profile_id || "profile-main",
            savedCalculations: Array.isArray(data.saved_calculations) ? data.saved_calculations : [],
            bookmarkedTools: Array.isArray(data.bookmarked_tools) ? data.bookmarked_tools : [],
            notifications: Array.isArray(data.notifications) ? data.notifications : [],
            createdAt: data.created_at || new Date().toISOString(),
            updatedAt: data.updated_at,
            status: data.status || "active",
            last_login_at: data.last_login_at
          };
        }
      }
    } catch (err: any) {
      console.error("[DATABASE QUERY EXCEPTION] Unexpected error in select query:", err);
      throw err;
    }

    // Automatically provision user profile on first read if not found
    if (!account && email) {
      console.log(`[USER MODEL] User account not found for ${email}. Automatically provisioning default profile...`);
      
      let resolvedUuid = await userModel.getAuthUuidByEmail(email);
      if (!resolvedUuid) {
        resolvedUuid = crypto.randomUUID();
        console.log(`[USER MODEL] Generated random UUID for default profile: ${resolvedUuid}`);
      }

      const defaultUser: UserAccount = {
        email: email,
        userId: resolvedUuid,
        name: email.split("@")[0] || "User",
        role: email === "deepak.mm1301@gmail.com" ? "super_admin" : "user",
        profilePhoto: "🧑‍💼",
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
          salary: 75000,
          city: "tier2",
          maritalStatus: "dependents",
          dependentsCount: 2,
          currentSavings: 120000,
          loans: { homeLoan: 0, personalLoan: 0, carLoan: 0, otherLoan: 0 },
          investments: { mutualFunds: 0, stocks: 0, gold: 0, epf: 0, ppf: 0, nps: 0, realEstate: 0 },
          monthlyExpenses: 35000,
          healthInsuranceCover: 500000,
          termInsuranceCover: 5000000
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
            createdAt: new Date().toISOString()
          }
        ],
        createdAt: new Date().toISOString()
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
  saveUserData: async (user: UserAccount): Promise<boolean> => {
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
          resolvedId = crypto.randomUUID();
          user.userId = resolvedId;
          console.warn(`[USER MODEL] No Supabase Auth user found for ${cleanEmail}. Generated random UUID: ${resolvedId}`);
        }
      }

      const payload = {
        id: resolvedId, // Store strictly by stable Supabase UUID
        email: cleanEmail,
        name: user.name,
        role: cleanEmail === "deepak.mm1301@gmail.com" ? "super_admin" : (user.role || "user"),
        profile_photo: user.profilePhoto || "🧑‍💼",
        profiles_list: user.profilesList,
        active_profile_id: user.activeProfileId,
        saved_calculations: user.savedCalculations,
        bookmarked_tools: user.bookmarkedTools,
        notifications: user.notifications,
        updated_at: new Date().toISOString(),
        last_login_at: user.last_login_at,
        status: user.status || "active"
      };

      console.log(`[DATABASE QUERY AUDIT] Executing upsert query on table 'paisa_user_data' for user ID: ${payload.id}`);

      const { error } = await supabase
        .from("paisa_user_data")
        .upsert(payload);

      if (error) {
        console.error(`[DATABASE RESPONSE ERROR] Supabase upsert failed for ${payload.id}:`, error);
        throw error;
      }
      logger.info(`[SUPABASE SYNC SUCCESS] Synced profile details for ${payload.id} to Supabase 'paisa_user_data'.`);
      return true;
    } catch (err: any) {
      console.error(`[DATABASE QUERY EXCEPTION] Complete database error during upsert for ${cleanEmail}:`, err);
      throw err;
    }
  },

  /**
   * Admin: Get all registered user accounts
   */
  getAllUsers: async (): Promise<UserAccount[]> => {
    try {
      const { data, error } = await supabase
        .from("paisa_user_data")
        .select("*");
      if (error) {
        throw error;
      }
      if (data) {
        return data.map(d => ({
          email: d.email || "",
          userId: d.id,
          name: d.name,
          role: (d.email === "deepak.mm1301@gmail.com") ? "super_admin" : (d.role || "user"),
          status: d.status || "active",
          profilePhoto: d.profile_photo || "🧑‍💼",
          profilesList: Array.isArray(d.profiles_list) ? d.profiles_list : [],
          activeProfileId: d.active_profile_id || "profile-main",
          savedCalculations: Array.isArray(d.saved_calculations) ? d.saved_calculations : [],
          bookmarkedTools: Array.isArray(d.bookmarked_tools) ? d.bookmarked_tools : [],
          notifications: Array.isArray(d.notifications) ? d.notifications : [],
          createdAt: d.created_at || new Date().toISOString()
        }));
      }
    } catch (err: any) {
      logger.error("[USER MODEL ERROR] Failed to fetch all users from Supabase:", err.message);
      throw err;
    }
    return [];
  },

  /**
   * Admin: Update user role (e.g. from user to moderator or admin)
   */
  updateUserRole: async (email: string, role: string): Promise<boolean> => {
    const cleanEmail = email.toLowerCase().trim();
    if (cleanEmail === "deepak.mm1301@gmail.com") {
      logger.warn("[USER MODEL] Protection trigger: cannot modify super_admin role for deepak.mm1301@gmail.com");
      return false; // Prevent removing super admin role from primary owner
    }

    try {
      // Find the user's UUID strictly by email
      const { data, error: fetchErr } = await supabase
        .from("paisa_user_data")
        .select("id")
        .eq("email", cleanEmail)
        .single();

      if (fetchErr || !data) {
        throw new Error(`User ${cleanEmail} not found in database.`);
      }

      const { error } = await supabase
        .from("paisa_user_data")
        .update({ role, updated_at: new Date().toISOString() })
        .eq("id", data.id);

      if (error) throw error;
      logger.info(`[SUPABASE ROLE UPDATE] Updated role for ${cleanEmail} to ${role}`);
      return true;
    } catch (err: any) {
      logger.error(`[USER MODEL ROLE UPDATE ERROR] Supabase role update failed for ${cleanEmail}:`, err.message);
      throw err;
    }
  },

  /**
   * Admin: Update user status (active vs suspended)
   */
  updateUserStatus: async (email: string, status: "active" | "suspended"): Promise<boolean> => {
    const cleanEmail = email.toLowerCase().trim();
    if (cleanEmail === "deepak.mm1301@gmail.com") {
      logger.warn("[USER MODEL] Protection trigger: cannot suspend primary owner deepak.mm1301@gmail.com");
      return false;
    }

    try {
      // Find the user's UUID strictly by email
      const { data, error: fetchErr } = await supabase
        .from("paisa_user_data")
        .select("id")
        .eq("email", cleanEmail)
        .single();

      if (fetchErr || !data) {
        throw new Error(`User ${cleanEmail} not found in database.`);
      }

      const { error } = await supabase
        .from("paisa_user_data")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", data.id);

      if (error) throw error;
      logger.info(`[SUPABASE STATUS UPDATE] Updated status for ${cleanEmail} to ${status}`);
      return true;
    } catch (err: any) {
      logger.error(`[USER MODEL STATUS UPDATE ERROR] Supabase status update failed for ${cleanEmail}:`, err.message);
      throw err;
    }
  },

  /**
   * Admin: Direct administrative reset of password
   */
  adminResetPassword: async (email: string, passwordHash: string): Promise<boolean> => {
    const cleanEmail = email.toLowerCase().trim();

    try {
      // Find user in Supabase Auth via listing users
      const { data, error } = await supabase.auth.admin.listUsers();
      if (error) throw error;

      const usersList = (data as any)?.users || [];
      const user = usersList.find((u: any) => u.email?.toLowerCase() === cleanEmail);
      if (user) {
        const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
          password: passwordHash // directly sets a new password
        });
        if (updateError) throw updateError;
        logger.info(`[ADMIN PASSWORD RESET SUCCESS] Supabase Auth password updated for ${cleanEmail}`);
        return true;
      } else {
        throw new Error(`User with email ${cleanEmail} not found in Supabase Auth.`);
      }
    } catch (err: any) {
      logger.error(`[ADMIN PASSWORD RESET ERROR] Failed to administratively reset password for ${cleanEmail}:`, err.message);
      throw err;
    }
  },

  /**
   * Authenticate / Register using Supabase Auth
   */
  registerUser: async (email: string, password: string, name: string): Promise<{ success: boolean; user?: UserAccount; error?: string; session?: any }> => {
    const cleanEmail = email.toLowerCase().trim();
    const cleanName = name.trim();

    // Validate email format
    if (!cleanEmail.includes("@") || cleanEmail.length < 5) {
      return { success: false, error: "Please provide a valid email address." };
    }
    if (password.length < 6) {
      return { success: false, error: "Password must be at least 6 characters long." };
    }

    try {
      logger.info(`[SUPABASE AUTH REGISTER] Registering user in Supabase Auth: ${cleanEmail}`);
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: password,
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

      const newUser: UserAccount = {
        email: cleanEmail,
        userId: uuid, // Permanent UUID
        name: cleanName,
        role: cleanEmail === "deepak.mm1301@gmail.com" ? "super_admin" : "user",
        profilePhoto: "🧑‍💼",
        profilesList: [{
          id: "profile-main",
          name: cleanName,
          age: 26,
          retirementAge: 60,
          salary: 75000,
          city: "tier2",
          maritalStatus: "dependents",
          dependentsCount: 2,
          currentSavings: 120000,
          loans: { homeLoan: 0, personalLoan: 0, carLoan: 0, otherLoan: 0 },
          investments: { mutualFunds: 0, stocks: 0, gold: 0, epf: 0, ppf: 0, nps: 0, realEstate: 0 },
          monthlyExpenses: 35000,
          healthInsuranceCover: 500000,
          termInsuranceCover: 5000000
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
            createdAt: new Date().toISOString()
          }
        ],
        createdAt: new Date().toISOString()
      };

      await userModel.saveUserData(newUser);
      logger.info(`[SUPABASE REGISTER SUCCESS] Created user profile keyed by stable UUID: ${uuid}`);
      return { success: true, user: newUser, session: data.session };

    } catch (err: any) {
      logger.error("[SUPABASE REGISTER EXCEPTION] Registration failed on cloud:", err);
      return { success: false, error: err.message || "Central signup server error. Please try again." };
    }
  },

  /**
   * User login auth verification
   */
  authenticateUser: async (email: string, password: string): Promise<{ success: boolean; user?: UserAccount; error?: string; session?: any }> => {
    const cleanEmail = email.toLowerCase().trim();

    try {
      logger.info(`[SUPABASE AUTH LOGIN] Authenticating email: ${cleanEmail}`);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password
      });

      if (error) {
        logger.error(`[SUPABASE AUTH LOGIN ERROR] Sign in failed for ${cleanEmail}: ${error.message}`);
        return { success: false, error: error.message };
      }

      const uuid = data.user?.id;
      if (!uuid) {
        return { success: false, error: "Authentication failed: No user ID returned from Supabase Auth." };
      }

      // Fetch user profile data from paisa_user_data
      let userProfile = await userModel.getUserDataByUuidOrEmail(uuid, cleanEmail);
      if (!userProfile) {
        console.log(`[USER MODEL] Profile metadata missing for ${cleanEmail} (ID: ${uuid}) during login. Creating default profile...`);
        const defaultUser: UserAccount = {
          email: cleanEmail,
          userId: uuid,
          name: data.user?.user_metadata?.name || cleanEmail.split("@")[0] || "User",
          role: cleanEmail === "deepak.mm1301@gmail.com" ? "super_admin" : "user",
          profilePhoto: "🧑‍💼",
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
            salary: 75000,
            city: "tier2",
            maritalStatus: "dependents",
            dependentsCount: 2,
            currentSavings: 120000,
            loans: { homeLoan: 0, personalLoan: 0, carLoan: 0, otherLoan: 0 },
            investments: { mutualFunds: 0, stocks: 0, gold: 0, epf: 0, ppf: 0, nps: 0, realEstate: 0 },
            monthlyExpenses: 35000,
            healthInsuranceCover: 500000,
            termInsuranceCover: 5000000
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
              createdAt: new Date().toISOString()
            }
          ],
          createdAt: new Date().toISOString()
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

      // Update last login timestamp
      userProfile.last_login_at = new Date().toISOString();
      await userModel.saveUserData(userProfile);

      logger.info(`[SUPABASE AUTH LOGIN SUCCESS] Authenticated successfully for ${cleanEmail}`);
      return { success: true, user: userProfile, session: data.session };
    } catch (err: any) {
      logger.error(`[SUPABASE AUTH LOGIN EXCEPTION] Sign in exception for ${cleanEmail}:`, err);
      return { success: false, error: err.message || "An unexpected error occurred during login." };
    }
  },

  /**
   * Delete user account completely
   */
  deleteUser: async (email: string): Promise<boolean> => {
    const cleanEmail = email.toLowerCase().trim();

    try {
      // Find user strictly by email
      const { data: profile } = await supabase
        .from("paisa_user_data")
        .select("id")
        .eq("email", cleanEmail)
        .single();

      const uuid = profile?.id;

      // 1. Delete custom user profile data
      if (uuid) {
        await supabase.from("paisa_user_data").delete().eq("id", uuid);
      }

      // 2. Delete Supabase Auth user if UUID matches
      if (uuid) {
        await supabase.auth.admin.deleteUser(uuid);
      }

      logger.info(`[SUPABASE DELETION SUCCESS] Deleted profile and auth for ${cleanEmail}.`);
      return true;
    } catch (err: any) {
      logger.error(`[SUPABASE DELETION ERROR] Failed to completely delete user ${cleanEmail}:`, err.message);
      throw err;
    }
  }
};
