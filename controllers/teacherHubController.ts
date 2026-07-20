import { Request, Response, NextFunction } from "express";
import { teacherHubModel } from "../models/teacherHubModel";
import { logger } from "../utils/logger";

export const teacherHubController = {
  getData: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await teacherHubModel.getData();
      if (!data) {
        res.json({ exists: false });
        return;
      }
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      res.json({ exists: true, ...data });
    } catch (err) {
      next(err);
    }
  },

  saveData: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { teachers, requests, notifications, successStories, auditLogs } = req.body;
      
      const success = await teacherHubModel.saveData({
        teachers: Array.isArray(teachers) ? teachers : [],
        requests: Array.isArray(requests) ? requests : [],
        notifications: Array.isArray(notifications) ? notifications : [],
        successStories: Array.isArray(successStories) ? successStories : [],
        auditLogs: Array.isArray(auditLogs) ? auditLogs : []
      });

      if (success) {
        logger.info(`Teacher Hub centralized database synced successfully with ${teachers?.length || 0} profiles.`);
        res.json({ success: true });
      } else {
        res.status(500).json({ success: false, error: "Failed to write database file." });
      }
    } catch (err) {
      next(err);
    }
  },

  adminUpdateTeacher: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const user = (req as any).user;
      if (user?.role !== "super_admin" && user?.role !== "super admin") {
        res.status(403).json({ success: false, error: "Forbidden", message: "Only super_admin can edit teacher records." });
        return;
      }

      const updatedFields = req.body;
      const data = await teacherHubModel.getData();
      if (!data) {
        res.status(404).json({ success: false, message: "Database state not found." });
        return;
      }

      const teachers = data.teachers.map(t => t.id === id ? { ...t, ...updatedFields } : t);
      const payload = { ...data, teachers };

      const success = await teacherHubModel.overwriteState(payload);
      if (success) {
        logger.info(`[ADMIN UPDATE SUCCESS] Teacher ${id} updated by super_admin ${user.email}`);
        res.json({ success: true, message: "Teacher details updated successfully." });
      } else {
        res.status(500).json({ success: false, message: "Failed to update database." });
      }
    } catch (err) {
      next(err);
    }
  },

  adminDeleteTeacher: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const user = (req as any).user;
      if (user?.role !== "super_admin" && user?.role !== "super admin") {
        res.status(403).json({ success: false, error: "Forbidden", message: "Only super_admin can perform deletion." });
        return;
      }

      const data = await teacherHubModel.getData();
      if (!data) {
        res.status(404).json({ success: false, message: "Database state not found." });
        return;
      }

      // Filter out the teacher
      const teachers = data.teachers.filter(t => t.id !== id);

      // Cascade delete mutual transfer requests and notifications referencing this teacher
      const requests = data.requests.filter(r => r.fromTeacherId !== id && r.toTeacherId !== id);
      const notifications = data.notifications.filter(n => n.teacherId !== id);

      const payload = {
        ...data,
        teachers,
        requests,
        notifications
      };

      const success = await teacherHubModel.overwriteState(payload);
      if (success) {
        logger.info(`[ADMIN DELETE SUCCESS] Teacher ${id} and all related requests/notifications deleted by super_admin ${user.email}`);
        res.json({ success: true, message: "Teacher and all related requests and notifications deleted successfully." });
      } else {
        res.status(500).json({ success: false, message: "Failed to update database." });
      }
    } catch (err) {
      next(err);
    }
  },

  adminBulkDelete: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { ids } = req.body;
      const user = (req as any).user;
      if (user?.role !== "super_admin" && user?.role !== "super admin") {
        res.status(403).json({ success: false, error: "Forbidden", message: "Only super_admin can perform bulk deletion." });
        return;
      }

      if (!Array.isArray(ids) || ids.length === 0) {
        res.status(400).json({ success: false, message: "No teacher IDs provided for bulk deletion." });
        return;
      }

      const data = await teacherHubModel.getData();
      if (!data) {
        res.status(404).json({ success: false, message: "Database state not found." });
        return;
      }

      // Filter out deleted teachers
      const teachers = data.teachers.filter(t => !ids.includes(t.id));

      // Cascade delete mutual transfer requests and notifications
      const requests = data.requests.filter(r => !ids.includes(r.fromTeacherId) && !ids.includes(r.toTeacherId));
      const notifications = data.notifications.filter(n => !ids.includes(n.teacherId));

      const payload = {
        ...data,
        teachers,
        requests,
        notifications
      };

      const success = await teacherHubModel.overwriteState(payload);
      if (success) {
        logger.info(`[ADMIN BULK DELETE] ${ids.length} teachers and all related requests/notifications deleted by super_admin ${user.email}`);
        res.json({ success: true, message: `Successfully deleted ${ids.length} teachers and their related transfer requests and notification logs.` });
      } else {
        res.status(500).json({ success: false, message: "Failed to update database." });
      }
    } catch (err) {
      next(err);
    }
  },

  adminBulkVerify: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { ids } = req.body;
      const user = (req as any).user;
      if (user?.role !== "super_admin" && user?.role !== "super admin") {
        res.status(403).json({ success: false, error: "Forbidden", message: "Only super_admin can perform bulk verification." });
        return;
      }

      if (!Array.isArray(ids) || ids.length === 0) {
        res.status(400).json({ success: false, message: "No teacher IDs provided for bulk verification." });
        return;
      }

      const data = await teacherHubModel.getData();
      if (!data) {
        res.status(404).json({ success: false, message: "Database state not found." });
        return;
      }

      // Mark as verified
      const teachers = data.teachers.map(t => ids.includes(t.id) ? { ...t, isVerified: true } : t);
      const payload = { ...data, teachers };

      const success = await teacherHubModel.overwriteState(payload);
      if (success) {
        logger.info(`[ADMIN BULK VERIFY] ${ids.length} teachers verified by super_admin ${user.email}`);
        res.json({ success: true, message: `Successfully verified ${ids.length} teacher profiles.` });
      } else {
        res.status(500).json({ success: false, message: "Failed to update database." });
      }
    } catch (err) {
      next(err);
    }
  }
};
