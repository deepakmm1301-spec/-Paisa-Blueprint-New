import { Request, Response, NextFunction } from "express";
import { PollModel } from "../models/pollModel";
import { logger } from "../utils/logger";

interface AuthenticatedRequest extends Request {
  user?: {
    id?: string;
    email: string;
    name: string;
    role: string;
  };
}

export const pollController = {
  /**
   * GET /api/polls
   * List polls (Public/Filtered)
   */
  getAllPolls: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { category, status, featured, search, userId } = req.query;

      const filters: any = {};
      if (category) filters.category = String(category);
      if (status) filters.status = String(status);
      if (featured !== undefined) filters.featured = featured === "true";
      if (search) filters.search = String(search);
      if (userId) filters.userId = String(userId);

      const polls = await PollModel.getAllPolls(filters);
      res.json({ success: true, polls });
    } catch (err) {
      logger.error("Error in getAllPolls controller:", err);
      next(err);
    }
  },

  /**
   * GET /api/polls/featured
   * Get featured poll for Homepage/Teacher Hub/Petitions
   */
  getFeaturedPoll: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { category, userId } = req.query;
      const poll = await PollModel.getFeaturedPoll(category ? String(category) : undefined, userId ? String(userId) : undefined);
      res.json({ success: true, poll });
    } catch (err) {
      logger.error("Error in getFeaturedPoll controller:", err);
      next(err);
    }
  },

  /**
   * GET /api/polls/analytics
   * Analytics summary for Admin CMS
   */
  getAnalytics: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const analytics = await PollModel.getAnalytics();
      res.json({ success: true, analytics });
    } catch (err) {
      logger.error("Error in getAnalytics controller:", err);
      next(err);
    }
  },

  /**
   * GET /api/polls/:id
   * Single poll detail
   */
  getPollById: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { userId } = req.query;
      const poll = await PollModel.getPollById(id, userId ? String(userId) : undefined);

      if (!poll) {
        res.status(404).json({ success: false, message: "Poll not found" });
        return;
      }
      res.json({ success: true, poll });
    } catch (err) {
      logger.error("Error in getPollById controller:", err);
      next(err);
    }
  },

  /**
   * POST /api/polls/:id/vote
   * Cast a vote (Authenticated only)
   */
  castVote: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { optionIds, userId: bodyUserId } = req.body;

      const userId = req.user?.email || req.user?.id || bodyUserId;

      if (!userId || userId.toLowerCase().trim() === "guest@paisablueprint.in") {
        res.status(401).json({
          success: false,
          requireLogin: true,
          code: "LOGIN_REQUIRED",
          message: "Please log in to participate in this poll. One account can vote only once to maintain fair and accurate results."
        });
        return;
      }

      if (!optionIds || !Array.isArray(optionIds) || optionIds.length === 0) {
        res.status(400).json({ success: false, message: "Please select at least one option to vote." });
        return;
      }

      const result = await PollModel.castVote(id, optionIds, userId);

      if (!result.success) {
        res.status(400).json({ success: false, message: result.message || "Failed to cast vote." });
        return;
      }

      res.json({
        success: true,
        message: "Vote recorded successfully!",
        poll: result.poll
      });
    } catch (err) {
      logger.error("Error in castVote controller:", err);
      next(err);
    }
  },

  /**
   * POST /api/polls
   * Create a new poll (Admin)
   */
  createPoll: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { question, description, category, allow_multiple, show_results_before_vote, allow_vote_edit, featured, status, priority, target_audience, image_url, start_date, end_date, options } = req.body;

      if (!question || !options || !Array.isArray(options) || options.length < 2) {
        res.status(400).json({ success: false, message: "Question and at least 2 options are required to create a poll." });
        return;
      }

      const createdBy = req.user?.name || req.user?.email || "Admin";

      const poll = await PollModel.createPoll({
        question,
        description,
        category,
        allow_multiple,
        show_results_before_vote,
        allow_vote_edit,
        featured,
        status,
        priority,
        target_audience,
        image_url,
        start_date,
        end_date
      }, options, createdBy);

      res.status(201).json({
        success: true,
        message: "Poll created successfully!",
        poll
      });
    } catch (err) {
      logger.error("Error in createPoll controller:", err);
      next(err);
    }
  },

  /**
   * PUT /api/polls/:id
   * Update a poll (Admin)
   */
  updatePoll: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { question, description, category, allow_multiple, show_results_before_vote, allow_vote_edit, featured, status, priority, target_audience, image_url, start_date, end_date, options } = req.body;

      const poll = await PollModel.updatePoll(id, {
        question,
        description,
        category,
        allow_multiple,
        show_results_before_vote,
        allow_vote_edit,
        featured,
        status,
        priority,
        target_audience,
        image_url,
        start_date,
        end_date
      }, options);

      if (!poll) {
        res.status(404).json({ success: false, message: "Poll not found" });
        return;
      }

      res.json({
        success: true,
        message: "Poll updated successfully!",
        poll
      });
    } catch (err) {
      logger.error("Error in updatePoll controller:", err);
      next(err);
    }
  },

  /**
   * POST /api/polls/:id/duplicate
   * Duplicate poll (Admin)
   */
  duplicatePoll: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const poll = await PollModel.duplicatePoll(id);

      if (!poll) {
        res.status(404).json({ success: false, message: "Original poll not found to duplicate" });
        return;
      }

      res.json({
        success: true,
        message: "Poll duplicated successfully!",
        poll
      });
    } catch (err) {
      logger.error("Error in duplicatePoll controller:", err);
      next(err);
    }
  },

  /**
   * POST /api/polls/:id/archive
   * Archive poll (Admin)
   */
  archivePoll: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const success = await PollModel.archivePoll(id);

      if (!success) {
        res.status(404).json({ success: false, message: "Poll not found" });
        return;
      }

      res.json({
        success: true,
        message: "Poll archived successfully!"
      });
    } catch (err) {
      logger.error("Error in archivePoll controller:", err);
      next(err);
    }
  },

  /**
   * DELETE /api/polls/:id
   * Delete poll (Admin)
   */
  deletePoll: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const success = await PollModel.deletePoll(id);

      res.json({
        success: true,
        message: "Poll deleted successfully!"
      });
    } catch (err) {
      logger.error("Error in deletePoll controller:", err);
      next(err);
    }
  }
};
