import { Request, Response, NextFunction } from "express";
import { cmsModel, CmsDbSchema, Suggestion } from "../models/cmsModel";
import { logger } from "../utils/logger";

interface AuthenticatedRequest extends Request {
  user?: {
    email: string;
    name: string;
    role: string;
  };
}

export const cmsController = {
  /**
   * Retrieves the current full CMS database state
   */
  getCmsData: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const db = await cmsModel.readDb();
      res.json({ success: true, data: db });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Retrieves safe, public CMS database modules for public frontend display
   */
  getPublicCmsData: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const db = await cmsModel.readDb();
      const publicData = {
        homepage: db.homepage,
        announcements: db.announcements || [],
        circulars: db.circulars || [],
        blogs: db.blogs || [],
        faqs: db.faqs || [],
        downloads: db.downloads || [],
        banners: db.banners || [],
        navigation: db.navigation || [],
        footer: db.footer
      };
      res.json({ success: true, data: publicData });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Unified updater for any standard CMS module
   */
  updateModule: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { moduleId } = req.params;
      const { payload, publish, actionName } = req.body;
      const user = req.user;

      if (!user) {
        res.status(401).json({ success: false, message: "Unauthenticated user" });
        return;
      }

      if (!payload) {
        res.status(400).json({ success: false, message: "Payload is required" });
        return;
      }

      const db = await cmsModel.readDb();
      const currentModuleData = (db as any)[moduleId];

      if (currentModuleData === undefined) {
        res.status(404).json({ success: false, message: `Module '${moduleId}' not found in DB schema` });
        return;
      }

      const ip = req.ip || req.headers["x-forwarded-for"] || "127.0.0.1";
      const userAgent = req.headers["user-agent"] || "Unknown Browser";

      // Role check: Admin/Super Admin can directly publish/save draft
      if (user.role === "admin" || user.role === "super_admin" || user.role === "super admin") {
        const oldValue = JSON.parse(JSON.stringify(currentModuleData));
        
        // Update DB
        (db as any)[moduleId] = payload;
        
        // Log Activity
        const cleanActionName = actionName || `Updated content of ${moduleId}`;
        await cmsModel.logActivity(
          user.name,
          user.email,
          cleanActionName,
          moduleId,
          oldValue,
          payload,
          Array.isArray(ip) ? ip[0] : (ip as string),
          userAgent
        );

        // Version Control (Revision)
        const revisionStatus = publish ? "published" : "draft";
        await cmsModel.createRevision(
          moduleId,
          cleanActionName,
          payload,
          revisionStatus,
          user.email
        );

        await cmsModel.writeDb(db);
        res.json({ 
          success: true, 
          message: publish ? "Content published successfully!" : "Draft saved successfully!",
          data: payload 
        });
      } 
      // Moderator can only suggest changes
      else if (user.role === "moderator") {
        const cleanActionName = actionName || `Moderator suggestion for ${moduleId}`;
        const suggestion = await cmsModel.addSuggestion(
          moduleId,
          user.email,
          user.name,
          cleanActionName,
          payload
        );

        res.json({ 
          success: true, 
          message: "Your changes have been submitted as a suggestion for Admin approval.",
          suggestion 
        });
      } else {
        res.status(403).json({ success: false, message: "Forbidden: Insufficient privileges to modify CMS content" });
      }
    } catch (err) {
      next(err);
    }
  },

  /**
   * Upload a base64 media asset directly into the Media Library
   */
  uploadMedia: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, base64Data, size, category, mimeType } = req.body;
      const user = req.user;

      if (!user) {
        res.status(401).json({ success: false, message: "Unauthenticated user" });
        return;
      }

      if (user.role !== "admin" && user.role !== "super_admin" && user.role !== "super admin") {
        res.status(403).json({ success: false, message: "Only administrators can upload files to the media library." });
        return;
      }

      if (!name || !base64Data) {
        res.status(400).json({ success: false, message: "Name and base64Data are required" });
        return;
      }

      const db = await cmsModel.readDb();
      const mediaId = "med-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5);
      
      const newMediaItem = {
        id: mediaId,
        name: name.trim(),
        url: base64Data, // In this Cloud Run env, storing Base64 inline guarantees absolute persistence
        size: size || "N/A",
        category: category || "Uncategorized",
        uploadedAt: new Date().toISOString(),
        mimeType: mimeType || "image/jpeg",
        usageCount: 0,
        usedInPages: []
      };

      db.media.unshift(newMediaItem);
      
      // Log activity
      const ip = req.ip || req.headers["x-forwarded-for"] || "127.0.0.1";
      const userAgent = req.headers["user-agent"] || "Unknown Browser";
      await cmsModel.logActivity(
        user.name,
        user.email,
        `Uploaded media asset: ${name}`,
        "media",
        null,
        { id: mediaId, name },
        Array.isArray(ip) ? ip[0] : (ip as string),
        userAgent
      );

      await cmsModel.writeDb(db);
      res.json({ success: true, message: "Asset uploaded to Media Library", asset: newMediaItem });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Rename or recategorize a Media Library asset
   */
  updateMediaItem: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { mediaId } = req.params;
      const { name, category } = req.body;
      const user = req.user;

      if (!user) {
        res.status(401).json({ success: false, message: "Unauthenticated user" });
        return;
      }

      if (user.role !== "admin" && user.role !== "super_admin" && user.role !== "super admin") {
        res.status(403).json({ success: false, message: "Permission Denied." });
        return;
      }

      const db = await cmsModel.readDb();
      const item = db.media.find(m => m.id === mediaId);

      if (!item) {
        res.status(404).json({ success: false, message: "Media asset not found" });
        return;
      }

      const oldValue = { name: item.name, category: item.category };
      if (name) item.name = name.trim();
      if (category) item.category = category.trim();

      const ip = req.ip || req.headers["x-forwarded-for"] || "127.0.0.1";
      const userAgent = req.headers["user-agent"] || "Unknown Browser";
      await cmsModel.logActivity(
        user.name,
        user.email,
        `Updated media metadata: ${item.name}`,
        "media",
        oldValue,
        { name: item.name, category: item.category },
        Array.isArray(ip) ? ip[0] : (ip as string),
        userAgent
      );

      await cmsModel.writeDb(db);
      res.json({ success: true, message: "Media asset updated", asset: item });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Remove an asset from Media Library
   */
  deleteMediaItem: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { mediaId } = req.params;
      const user = req.user;

      if (!user) {
        res.status(401).json({ success: false, message: "Unauthenticated user" });
        return;
      }

      if (user.role !== "admin" && user.role !== "super_admin" && user.role !== "super admin") {
        res.status(403).json({ success: false, message: "Permission Denied" });
        return;
      }

      const db = await cmsModel.readDb();
      const index = db.media.findIndex(m => m.id === mediaId);

      if (index === -1) {
        res.status(404).json({ success: false, message: "Asset not found" });
        return;
      }

      const deletedItem = db.media[index];
      db.media.splice(index, 1);

      const ip = req.ip || req.headers["x-forwarded-for"] || "127.0.0.1";
      const userAgent = req.headers["user-agent"] || "Unknown Browser";
      await cmsModel.logActivity(
        user.name,
        user.email,
        `Deleted media asset: ${deletedItem.name}`,
        "media",
        { id: mediaId, name: deletedItem.name },
        null,
        Array.isArray(ip) ? ip[0] : (ip as string),
        userAgent
      );

      await cmsModel.writeDb(db);
      res.json({ success: true, message: "Media asset deleted successfully." });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Restores a previously saved version from Revision History
   */
  restoreRevision: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { revisionId } = req.params;
      const user = req.user;

      if (!user) {
        res.status(401).json({ success: false, message: "Unauthenticated user" });
        return;
      }

      if (user.role !== "admin" && user.role !== "super_admin" && user.role !== "super admin") {
        res.status(403).json({ success: false, message: "Only administrators can restore content revisions" });
        return;
      }

      const db = await cmsModel.readDb();
      const rev = db.revisions.find(r => r.id === revisionId);

      if (!rev) {
        res.status(404).json({ success: false, message: "Revision version not found" });
        return;
      }

      const moduleId = rev.moduleId;
      const oldValue = JSON.parse(JSON.stringify((db as any)[moduleId]));
      
      // Restore the content to active DB
      (db as any)[moduleId] = rev.content;

      // Update statuses of previous revisions for this module
      db.revisions.forEach(r => {
        if (r.moduleId === moduleId) {
          r.status = r.id === revisionId ? "published" : "previous";
        }
      });

      const ip = req.ip || req.headers["x-forwarded-for"] || "127.0.0.1";
      const userAgent = req.headers["user-agent"] || "Unknown Browser";
      
      await cmsModel.logActivity(
        user.name,
        user.email,
        `Restored module '${moduleId}' to Version ${rev.version}`,
        moduleId,
        oldValue,
        rev.content,
        Array.isArray(ip) ? ip[0] : (ip as string),
        userAgent
      );

      await cmsModel.writeDb(db);
      res.json({ success: true, message: `Successfully restored content to version ${rev.version}!`, data: rev.content });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Action for admin to moderate suggestions submitted by moderators
   */
  moderateSuggestion: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { suggestionId } = req.params;
      const { status } = req.body; // "approved" or "rejected"
      const user = req.user;

      if (!user) {
        res.status(401).json({ success: false, message: "Unauthenticated" });
        return;
      }

      if (user.role !== "admin" && user.role !== "super_admin" && user.role !== "super admin") {
        res.status(403).json({ success: false, message: "Access Denied. Admin permissions required to moderate suggestions" });
        return;
      }

      if (status !== "approved" && status !== "rejected") {
        res.status(400).json({ success: false, message: "Status must be 'approved' or 'rejected'" });
        return;
      }

      const db = await cmsModel.readDb();
      const index = db.suggestions.findIndex(s => s.id === suggestionId);

      if (index === -1) {
        res.status(404).json({ success: false, message: "Suggestion not found" });
        return;
      }

      const suggestion = db.suggestions[index];
      suggestion.status = status;

      const ip = req.ip || req.headers["x-forwarded-for"] || "127.0.0.1";
      const userAgent = req.headers["user-agent"] || "Unknown Browser";

      if (status === "approved") {
        const moduleId = suggestion.moduleId;
        const oldValue = JSON.parse(JSON.stringify((db as any)[moduleId]));
        
        // Apply changes
        (db as any)[moduleId] = suggestion.content;

        // Log active content overwrite
        await cmsModel.logActivity(
          user.name,
          user.email,
          `Approved and applied change: ${suggestion.action}`,
          moduleId,
          oldValue,
          suggestion.content,
          Array.isArray(ip) ? ip[0] : (ip as string),
          userAgent
        );

        // Save a revision
        await cmsModel.createRevision(
          moduleId,
          `Approved Suggestion from ${suggestion.suggestedByName}: ${suggestion.action}`,
          suggestion.content,
          "published",
          user.email
        );
      } else {
        await cmsModel.logActivity(
          user.name,
          user.email,
          `Rejected moderator suggestion: ${suggestion.action}`,
          suggestion.moduleId,
          null,
          null,
          Array.isArray(ip) ? ip[0] : (ip as string),
          userAgent
        );
      }

      await cmsModel.writeDb(db);
      res.json({ success: true, message: `Suggestion successfully ${status}!`, suggestion });
    } catch (err) {
      next(err);
    }
  }
};
