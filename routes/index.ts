import { Router } from "express";
import { chatController } from "../controllers/chatController";
import { insightController } from "../controllers/insightController";
import { visitorController } from "../controllers/visitorController";
import { teacherHubController } from "../controllers/teacherHubController";
import { authController } from "../controllers/authController";
import { lockerController } from "../controllers/lockerController";
import { petitionController } from "../controllers/petitionController";
import { cmsController } from "../controllers/cmsController";
import { apiLimiter, heavyLimiter } from "../middleware/rateLimiter";

const router = Router();

// General API Rate Limiting applied to all routes in this sub-router
router.use(apiLimiter);

// Helper middleware for CMS access (Admin/Super Admin/Moderator)
const requireCmsAccess = async (req: any, res: any, next: any) => {
  authController.requireAuth(req, res, () => {
    const role = req.user?.role;
    if (role === "admin" || role === "super_admin" || role === "super admin" || role === "moderator") {
      next();
    } else {
      res.status(403).json({ error: "Forbidden", message: "CMS access is restricted to Administrators and Moderators." });
    }
  });
};

// Health check
router.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// -------------------------------------------------------------
// AUTHENTICATION ENDPOINTS
// -------------------------------------------------------------
router.post("/auth/signup", authController.signUp);
router.post("/auth/login", authController.login);
router.post("/auth/logout", authController.logout);
router.get("/auth/me", authController.getMe);
router.get("/auth/get-profiles", authController.requireAuth, authController.getProfiles);
router.post("/auth/change-password", authController.requireAuth, authController.changePassword);
router.post("/auth/forgot-password", authController.forgotPassword);
router.post("/auth/reset-password", authController.resetPassword);
router.post("/auth/profile/update", authController.requireAuth, authController.updateProfile);
router.delete("/auth/profile/delete", authController.requireAuth, authController.deleteAccount);

// Sync handlers called by frontend to save user profile lists
router.post("/auth/update-profiles", authController.requireAuth, authController.updateProfilesList);
router.post("/auth/update-profile", authController.requireAuth, authController.updateProfilesList);
router.post("/auth/update-account-name", authController.requireAuth, authController.updateAccountName);

// -------------------------------------------------------------
// PETITIONS & PUBLIC ENGAGEMENT ENDPOINTS
// -------------------------------------------------------------
router.get("/petitions", petitionController.getPetitions);
router.get("/petitions/:slug", petitionController.getPetitionBySlug);
router.get("/petitions/:id/signatures", petitionController.getSignatures);
router.get("/petitions/:id/comments", petitionController.addComment); // list comments falls back to details, but we register here for complete API layout

// Secure signature & comment submission (requires authentication)
router.post("/petitions/:id/sign", authController.requireAuth, petitionController.signPetition);
router.post("/petitions/:id/comments", authController.requireAuth, petitionController.addComment);

// -------------------------------------------------------------
// ADMIN PORTAL & DATA MODERATION ENDPOINTS (Strictly protected by requireAdmin)
// -------------------------------------------------------------
router.get("/admin/stats", authController.requireAdmin, petitionController.getAdminStats);
router.get("/admin/users", authController.requireAdmin, petitionController.getAdminUsers);
router.put("/admin/users/:email/role", authController.requireAdmin, petitionController.updateUserRole);
router.put("/admin/users/:email/status", authController.requireAdmin, petitionController.updateUserStatus);
router.post("/admin/users/:email/reset-password", authController.requireAdmin, petitionController.adminResetPassword);

// Administrative Petition CRUD
router.post("/petitions", authController.requireAdmin, petitionController.savePetition);
router.post("/petitions/:id/updates", authController.requireAdmin, petitionController.addPetitionUpdate);
router.post("/petitions/comments/:commentId/status", authController.requireAdmin, petitionController.moderateComment);
router.delete("/petitions/:id", authController.requireAdmin, petitionController.deletePetition);

// -------------------------------------------------------------
// CONTENT MANAGEMENT SYSTEM (CMS) ENDPOINTS
// -------------------------------------------------------------
router.get("/cms/data", requireCmsAccess, cmsController.getCmsData);
router.post("/cms/update/:moduleId", requireCmsAccess, cmsController.updateModule);
router.post("/cms/media/upload", requireCmsAccess, cmsController.uploadMedia);
router.put("/cms/media/:mediaId", requireCmsAccess, cmsController.updateMediaItem);
router.delete("/cms/media/:mediaId", requireCmsAccess, cmsController.deleteMediaItem);
router.post("/cms/revisions/:revisionId/restore", requireCmsAccess, cmsController.restoreRevision);
router.post("/cms/suggestions/:suggestionId/moderate", requireCmsAccess, cmsController.moderateSuggestion);

// -------------------------------------------------------------
// SECURE USER DATA LOCKER ENDPOINTS
// -------------------------------------------------------------
router.get("/locker", authController.requireAuth, lockerController.getLocker);
router.post("/locker/save", authController.requireAuth, lockerController.saveCalculation);
router.post("/locker/update/:id", authController.requireAuth, lockerController.updateCalculation);
router.post("/locker/delete/:id", authController.requireAuth, lockerController.deleteCalculation);
router.delete("/locker/delete/:id", authController.requireAuth, lockerController.deleteCalculation);
router.post("/locker/favourite/:id", authController.requireAuth, lockerController.toggleFavourite);
router.post("/locker/bookmark", authController.requireAuth, lockerController.toggleBookmark);

// Notifications management
router.post("/locker/notifications/:id/read", authController.requireAuth, lockerController.markNotificationRead);
router.post("/locker/notifications/:id/delete", authController.requireAuth, lockerController.deleteNotification);

// -------------------------------------------------------------
// PUBLIC VISITOR & DATA ENDPOINTS
// -------------------------------------------------------------
router.get("/visitors", visitorController.getVisitors);
router.post("/visitors/hit", visitorController.hitVisitor);

// Teacher Hub sync endpoints
router.get("/teacher-hub/data", teacherHubController.getData);
router.post("/teacher-hub/save", teacherHubController.saveData);

// AI Advisor chat endpoints (Heavy rate limiter applied to safeguard Gemini usage)
router.post("/chat", heavyLimiter, chatController.chat);
router.get("/chat/status", chatController.getStatus);

// Market Insights endpoint
router.get("/market-insights", insightController.getMarketInsights);

export default router;

