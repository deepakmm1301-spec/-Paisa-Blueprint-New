import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { userModel, UserAccount, supabase } from "../models/userModel";
import { env } from "../config/env";
import { logger } from "../utils/logger";

// Intercept all outgoing fetch calls to audit the Supabase auth requests
const originalFetch = globalThis.fetch;
globalThis.fetch = async function (this: any, input: any, init?: any) {
  const url = typeof input === "string" ? input : (input as any)?.url || "";
  if (url.includes("/auth/v1/recover")) {
    console.log("=====================================================");
    console.log("[OUTGOING SUPABASE AUDIT] Intercepted /auth/v1/recover");
    console.log("[OUTGOING SUPABASE AUDIT] Request URL:", url);
    console.log("[OUTGOING SUPABASE AUDIT] Request Headers:", init?.headers);
    if (init?.body) {
      try {
        const bodyStr = typeof init.body === "string" ? init.body : new TextDecoder().decode(init.body as any);
        console.log("[OUTGOING SUPABASE AUDIT] Request Body:", bodyStr);
      } catch (e) {
        console.log("[OUTGOING SUPABASE AUDIT] Request Body (failed to decode):", init.body);
      }
    }
    console.log("=====================================================");
  }
  return originalFetch.apply(this, arguments as any);
};

const ACCESS_COOKIE_NAME = "paisa_access_token";

interface AuthTokenPayload {
  email: string;
  name: string;
  role: string;
  userId?: string;
}

// Generates access token
function generateAccessToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: "7d" });
}

// Extends Request with user details
export interface AuthenticatedRequest extends Request {
  user?: AuthTokenPayload;
}

export const authController = {
  /**
   * Middleware to protect secure API routes
   */
  requireAuth: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
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

      let email: string | null = null;
      let nameFallback: string = "";
      let roleFallback: string = "user";
      let userIdFallback: string | undefined = undefined;

      // Try local JWT verify first (extremely fast, zero network overhead)
      try {
        console.log("[BACKEND AUTH AUDIT] Attempting local JWT verification...");
        const decoded = jwt.verify(token, env.JWT_SECRET) as AuthTokenPayload;
        console.log("[BACKEND AUTH SUCCESS] User verified via Local JWT:", decoded.email);
        email = decoded.email;
        nameFallback = decoded.name;
        roleFallback = decoded.role;
        userIdFallback = decoded.userId;
      } catch (localErr: any) {
        console.log("[BACKEND AUTH INFO] Local JWT verification failed or bypassed:", localErr.message || localErr);
      }

      // If local JWT verify fails, try Supabase Auth if client is configured
      if (!email && supabase) {
        try {
          console.log("[BACKEND AUTH AUDIT] Attempting Supabase token verification with official getUser...");
          const { data: { user }, error } = await supabase.auth.getUser(token);
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
        } catch (sbErr: any) {
          console.error("[BACKEND AUTH WARNING] Supabase token check exception:", sbErr.message || sbErr);
          res.status(401).json({ error: "Unauthorized", message: "Supabase authorization failed", details: sbErr.message || sbErr });
          return;
        }
      }

      if (email) {
        const cleanEmail = email.toLowerCase().trim();
        // Fetch using custom userModel which resolves UUID or email correctly
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

      // If we got here, both verification methods failed
      console.error("[BACKEND AUTH ERROR] All verification methods failed. Denying access.");
      res.status(401).json({ error: "Unauthorized", message: "Invalid or expired token. Please log in again." });
    } catch (err: any) {
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
  requireAdmin: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = req.headers.authorization?.split(" ")[1] || req.cookies[ACCESS_COOKIE_NAME];

      if (!token) {
        res.status(401).json({ error: "Unauthorized", message: "Access denied. Admin authorization required." });
        return;
      }

      let email: string | null = null;
      let nameFallback: string = "";
      let roleFallback: string = "user";
      let userIdFallback: string | undefined = undefined;

      // Try local JWT verify first
      try {
        const decoded = jwt.verify(token, env.JWT_SECRET) as AuthTokenPayload;
        email = decoded.email;
        nameFallback = decoded.name;
        roleFallback = decoded.role;
        userIdFallback = decoded.userId;
      } catch (localErr) {
        // Fallback to Supabase if available
      }

      if (!email && supabase) {
        const { data: { user }, error } = await supabase.auth.getUser(token);
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
    } catch (err: any) {
      logger.warn(`[AUTH MIDDLEWARE WARNING] Admin verification failed: ${err}`);
      res.status(401).json({ error: "Unauthorized", message: "Session expired or invalid token. Please log in again." });
    }
  },

  /**
   * Email/Password sign up
   */
  signUp: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

      // Set JWT in HttpOnly secure cookie with sameSite=none for iframe compatibility
      res.cookie(ACCESS_COOKIE_NAME, token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.status(201).json({
        success: true,
        token: token,
        supabaseSession: result.session,
        user: {
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
          profilePhoto: result.user.profilePhoto || "🧑‍💼",
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
  login: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

      // Set cookie with sameSite=none for iframe compatibility
      res.cookie(ACCESS_COOKIE_NAME, token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.json({
        success: true,
        token: token,
        supabaseSession: result.session,
        user: {
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
          profilePhoto: result.user.profilePhoto || "🧑‍💼",
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
  logout: async (req: Request, res: Response): Promise<void> => {
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
  getMe: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = req.headers.authorization?.split(" ")[1] || req.cookies[ACCESS_COOKIE_NAME];
      if (!token) {
        // Safe Guest-Fallback to prevent page block for public views
        res.json({ user: null });
        return;
      }

      let email: string | null = null;
      let userIdFallback: string | undefined = undefined;

      // 1. Try local JWT verify first
      try {
        const decoded = jwt.verify(token, env.JWT_SECRET) as AuthTokenPayload;
        email = decoded.email;
        userIdFallback = decoded.userId;
      } catch (localErr) {
        // fallback to Supabase
      }

      // 2. Try Supabase getUser if local JWT failed and supabase client is available
      if (!email && supabase) {
        try {
          const { data: { user }, error } = await supabase.auth.getUser(token);
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
          profilePhoto: account.profilePhoto || "🧑‍💼"
        },
        profilesList: account.profilesList,
        profiles: account.profilesList, // for UserDashboard compatibility
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
  changePassword: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { currentPassword, newPassword } = req.body;
      const email = req.user?.email;

      if (!email || !currentPassword || !newPassword) {
        res.status(400).json({ error: "Bad Request", message: "Current and new passwords are required." });
        return;
      }

      if (!supabase) {
        res.status(500).json({ error: "Database offline", message: "Supabase connection is not available." });
        return;
      }

      // 1. Verify current password by signing in with password
      const { data: signInData, error: verifyError } = await supabase.auth.signInWithPassword({
        email: email,
        password: currentPassword
      });

      if (verifyError) {
        res.status(400).json({ error: "Invalid Current Password", message: "The current password provided is incorrect." });
        return;
      }

      // 2. Change password via Supabase Auth Admin
      const { error: updateError } = await supabase.auth.admin.updateUserById(signInData.user.id, {
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
  forgotPassword: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.body;
      if (!email) {
        res.status(400).json({ error: "Bad Request", message: "Email is required." });
        return;
      }

      if (supabase) {
        const rawOrigin = req.get("origin") || process.env.APP_URL || "https://paisablueprint.in";
        // Clean trailing slashes to avoid double slashes like https://paisablueprint.in//reset-password
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

        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
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
  resetPassword: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, newPassword } = req.body;
      if (!email || !newPassword) {
        res.status(400).json({ error: "Bad Request", message: "Email and new password are required." });
        return;
      }

      if (!supabase) {
        res.status(500).json({ error: "Database offline", message: "Supabase connection is not available." });
        return;
      }

      // Find user Auth record in list of users
      const { data: authData, error: listError } = await supabase.auth.admin.listUsers();
      if (listError) {
        res.status(500).json({ error: "Error", message: listError.message });
        return;
      }

      const usersList = (authData as any)?.users || [];
      const user = usersList.find((u: any) => u.email?.toLowerCase() === email.toLowerCase().trim());
      if (!user) {
        res.status(404).json({ error: "Not Found", message: "Account not found." });
        return;
      }

      const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
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
  updateProfile: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
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
          profilePhoto: account.profilePhoto || "🧑‍💼"
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Delete Account
   */
  deleteAccount: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
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
  updateProfilesList: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
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
  updateAccountName: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
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

      // Update main account name
      account.name = displayName.trim();

      // Also update the active profile inside profilesList!
      if (!Array.isArray(account.profilesList)) {
        account.profilesList = [];
      }

      const activeProfileId = account.activeProfileId || "profile-main";
      let profileIndex = account.profilesList.findIndex((p: any) => p.id === activeProfileId);
      
      if (profileIndex === -1 && account.profilesList.length > 0) {
        // Fallback to first profile if activeProfileId not found
        profileIndex = 0;
      }

      if (profileIndex !== -1) {
        // Update details on existing profile
        const prof = account.profilesList[profileIndex];
        prof.name = displayName.trim();
        if (mobile !== undefined) prof.mobile = mobile;
        if (state !== undefined) prof.state = state;
        if (district !== undefined) prof.district = district;
        if (occupation !== undefined) prof.occupation = occupation;
        if (schoolDept !== undefined) prof.schoolDept = schoolDept;
      } else {
        // Create a new default profile with these details
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
  getProfiles: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const lookupKey = (req.query.email as string) || req.user?.userId || req.user?.email;
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
