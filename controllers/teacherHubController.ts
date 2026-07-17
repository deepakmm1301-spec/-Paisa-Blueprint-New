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
  }
};
