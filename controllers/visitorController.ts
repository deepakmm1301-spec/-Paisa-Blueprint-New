import { Request, Response, NextFunction } from "express";
import { visitorModel } from "../models/visitorModel";
import { logger } from "../utils/logger";

export const visitorController = {
  getVisitors: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const count = await visitorModel.getVisitorCount();
      res.json({ count });
    } catch (err) {
      next(err);
    }
  },

  hitVisitor: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const nextCount = await visitorModel.incrementVisitorCount();
      logger.info(`Visitor hit recorded. New count: ${nextCount}`);
      res.json({ success: true, count: nextCount });
    } catch (err) {
      next(err);
    }
  }
};
