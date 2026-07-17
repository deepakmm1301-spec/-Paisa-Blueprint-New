import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./authController";
import { userModel, SavedCalculation } from "../models/userModel";
import { logger } from "../utils/logger";

export const lockerController = {
  /**
   * Get all user saved calculations, bookmarks, and notifications
   */
  getLocker: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
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
  saveCalculation: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
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

      const now = new Date().toISOString();
      const newCalculation: SavedCalculation = {
        id: "calc-" + Math.random().toString(36).substring(2, 15),
        title: title.trim(),
        type: type.trim(),
        createdAt: now,
        updatedAt: now,
        data: data
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
      } catch (saveErr: any) {
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
  updateCalculation: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
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

      const item = account.savedCalculations?.find(c => c.id === id);
      if (!item) {
        res.status(404).json({ error: "Not Found", message: "Calculation not found." });
        return;
      }

      if (title !== undefined) item.title = title.trim();
      if (data !== undefined) item.data = data;
      item.updatedAt = new Date().toISOString();

      await userModel.saveUserData(account);
      res.json(item);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Delete saved calculation
   */
  deleteCalculation: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
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

      account.savedCalculations = account.savedCalculations?.filter(c => c.id !== id) || [];

      await userModel.saveUserData(account);
      res.json({ success: true, message: "Calculation plan deleted successfully." });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Toggle Bookmark for a tool/calculator
   */
  toggleBookmark: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const email = req.user?.email;
      const { toolId, name, category, path } = req.body;

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

      const exists = account.bookmarkedTools.some(b => b.toolId === toolId);
      if (exists) {
        // Remove bookmark
        account.bookmarkedTools = account.bookmarkedTools.filter(b => b.toolId !== toolId);
      } else {
        // Add bookmark
        account.bookmarkedTools.push({
          toolId,
          name: name.trim(),
          category: category || "Calculator",
          path: path || "/",
          createdAt: new Date().toISOString()
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
  markNotificationRead: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
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

      const notification = account.notifications?.find(n => n.id === id);
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
  deleteNotification: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
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

      account.notifications = account.notifications?.filter(n => n.id !== id) || [];
      await userModel.saveUserData(account);

      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Toggle favourite status of a saved calculation
   */
  toggleFavourite: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
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

      const item = account.savedCalculations?.find(c => c.id === id);
      if (!item) {
        res.status(404).json({ error: "Not Found", message: "Calculation not found." });
        return;
      }

      item.isFavourite = !item.isFavourite;
      item.updatedAt = new Date().toISOString();

      await userModel.saveUserData(account);
      res.json(item);
    } catch (err) {
      next(err);
    }
  }
};
