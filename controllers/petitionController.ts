import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { petitionModel, Petition, PetitionSignature, PetitionComment, PetitionUpdate } from "../models/petitionModel";
import { userModel } from "../models/userModel";
import { logger } from "../utils/logger";

interface AuthenticatedRequest extends Request {
  user?: {
    email: string;
    name: string;
    role: string;
  };
}

export const petitionController = {
  // -------------------------------------------------------------
  // PUBLIC VIEWING ENDPOINTS
  // -------------------------------------------------------------
  
  /**
   * List all active petitions
   */
  getPetitions: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const petitions = await petitionModel.getPetitions();
      res.json({ success: true, petitions });
    } catch (err) {
      logger.error("[PETITION CONTROLLER] Error getting petitions:", err);
      next(err);
    }
  },

  /**
   * Get single petition details by slug
   */
  getPetitionBySlug: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { slug } = req.params;
      const userEmail = req.query.email as string; // Optional to check if user signed

      const petition = await petitionModel.getPetitionBySlug(slug);
      if (!petition) {
        res.status(404).json({ error: "Not Found", message: "Petition not found" });
        return;
      }

      const signatures = await petitionModel.getSignaturesByPetitionId(petition.id);
      const comments = await petitionModel.getCommentsByPetitionId(petition.id);
      const updates = await petitionModel.getUpdatesByPetitionId(petition.id);
      const documents = await petitionModel.getDocumentsByPetitionId(petition.id);

      // Check if current user signed
      let hasSigned = false;
      if (userEmail) {
        hasSigned = await petitionModel.hasSigned(petition.id, userEmail);
      }

      res.json({
        success: true,
        petition,
        hasSigned,
        stats: {
          totalSignatures: signatures.length,
          recentSignatures: signatures.slice(-10).reverse() // Latest 10
        },
        comments: comments.filter(c => c.status === "approved" || c.status === "pending"), // Filter deleted/spam
        updates,
        documents
      });
    } catch (err) {
      logger.error("[PETITION CONTROLLER] Error getting petition details:", err);
      next(err);
    }
  },

  // -------------------------------------------------------------
  // SIGNING & PUBLIC INTERACTION ENDPOINTS
  // -------------------------------------------------------------

  /**
   * Sign a petition (Double-signing protection)
   */
  signPetition: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { name, district, block, school, teacherCategory, phone, consent, userEmail } = req.body;

      const emailToUse = (userEmail || req.user?.email || "").toLowerCase().trim();

      if (!emailToUse) {
        res.status(400).json({ error: "Bad Request", message: "User email is required to sign the petition." });
        return;
      }

      if (!name || !district || !block || !teacherCategory || !consent) {
        res.status(400).json({ error: "Bad Request", message: "All form fields are required to sign the petition." });
        return;
      }

      // 1. Double signing protection
      const alreadySigned = await petitionModel.hasSigned(id, emailToUse);
      if (alreadySigned) {
        res.status(409).json({ error: "Conflict", message: "You have already signed this petition." });
        return;
      }

      // 2. Load petition to verify existence
      const petitions = await petitionModel.getPetitions();
      const petition = petitions.find(p => p.id === id);
      if (!petition) {
        res.status(404).json({ error: "Not Found", message: "Petition not found" });
        return;
      }

      // 3. Create signature object
      const signature: PetitionSignature = {
        id: "sig-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5),
        petitionId: id,
        userEmail: emailToUse,
        name: name.trim(),
        district: district.trim(),
        block: block.trim(),
        school: school ? school.trim() : "",
        teacherCategory: teacherCategory.trim(),
        phone: phone ? phone.trim() : undefined,
        consent: !!consent,
        signatureNumber: 0, // Assigned by model
        createdAt: new Date().toISOString()
      };

      const finalSigNumber = await petitionModel.addSignature(signature);

      res.status(201).json({
        success: true,
        message: "Thank you! Your signature has been recorded successfully.",
        signatureNumber: finalSigNumber
      });
    } catch (err) {
      logger.error("[PETITION CONTROLLER] Error signing petition:", err);
      next(err);
    }
  },

  /**
   * Get all signatures for a petition
   */
  getSignatures: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const signatures = await petitionModel.getSignaturesByPetitionId(id);
      res.json({ success: true, count: signatures.length, signatures });
    } catch (err) {
      logger.error("[PETITION CONTROLLER] Error getting signatures:", err);
      next(err);
    }
  },

  /**
   * Submit a comment to a petition
   */
  addComment: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { content, userName, userEmail } = req.body;

      const emailToUse = (userEmail || req.user?.email || "anonymous@paisablueprint.in").toLowerCase().trim();
      const nameToUse = (userName || req.user?.name || "Anonymous Teacher").trim();

      if (!content || content.trim().length < 3) {
        res.status(400).json({ error: "Bad Request", message: "Comment content must be at least 3 characters long." });
        return;
      }

      const comment: PetitionComment = {
        id: "com-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5),
        petitionId: id,
        userEmail: emailToUse,
        userName: nameToUse,
        content: content.trim(),
        status: "approved", // default approved, admin can moderate later
        isPinned: false,
        createdAt: new Date().toISOString()
      };

      await petitionModel.addComment(comment);

      res.status(201).json({
        success: true,
        message: "Comment posted successfully.",
        comment
      });
    } catch (err) {
      logger.error("[PETITION CONTROLLER] Error posting comment:", err);
      next(err);
    }
  },

  // -------------------------------------------------------------
  // ADMINISTRATIVE PETITION CRUD & MODERATION ENDPOINTS
  // -------------------------------------------------------------

  /**
   * Admin: Create or Edit a petition
   */
  savePetition: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id, title, slug, shortDescription, fullDescription, category, bannerImage, featuredImage, govDepartment, petitionGoal, status, seoTitle, seoDescription, featured } = req.body;

      if (!title || !slug || !shortDescription || !fullDescription) {
        res.status(400).json({ error: "Bad Request", message: "Title, slug, short description, and full description are required." });
        return;
      }

      const cleanSlug = slug.toLowerCase().trim().replace(/[^a-z0-9-_]/g, "-");

      const petitionId = id || "pet-" + Date.now();
      const creatorEmail = req.user?.email || "deepak.mm1301@gmail.com";

      // If editing, check if it exists
      let existing: Petition | null = null;
      if (id) {
        existing = await petitionModel.getPetitionBySlug(cleanSlug);
      }

      const petition: Petition = {
        id: petitionId,
        title: title.trim(),
        slug: cleanSlug,
        shortDescription: shortDescription.trim(),
        fullDescription: fullDescription,
        category: category || "Education",
        bannerImage: bannerImage || "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=1200",
        featuredImage: featuredImage || "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=400",
        govDepartment: govDepartment || "Education Department, Government of Bihar",
        petitionGoal: Number(petitionGoal) || 5000,
        currentSignatures: existing ? existing.currentSignatures : 0,
        status: status || "draft",
        startDate: existing ? existing.startDate : new Date().toISOString(),
        endDate: req.body.endDate || (existing ? existing.endDate : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()),
        seoTitle: seoTitle || title.trim() + " | Paisa Blueprint",
        seoDescription: seoDescription || shortDescription.trim(),
        featured: !!featured,
        createdBy: existing ? existing.createdBy : creatorEmail,
        createdAt: existing ? existing.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await petitionModel.savePetition(petition);

      res.json({
        success: true,
        message: id ? "Petition updated successfully." : "Petition created successfully.",
        petition
      });
    } catch (err) {
      logger.error("[PETITION CONTROLLER] Error saving petition:", err);
      next(err);
    }
  },

  /**
   * Admin: Add an update update to a petition
   */
  addPetitionUpdate: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { title, content } = req.body;

      if (!title || !content) {
        res.status(400).json({ error: "Bad Request", message: "Update title and content are required." });
        return;
      }

      const update: PetitionUpdate = {
        id: "upd-" + Date.now(),
        petitionId: id,
        title: title.trim(),
        content: content.trim(),
        createdAt: new Date().toISOString(),
        createdBy: req.user?.email || "deepak.mm1301@gmail.com"
      };

      await petitionModel.addUpdate(update);

      res.status(201).json({
        success: true,
        message: "Petition update posted successfully.",
        update
      });
    } catch (err) {
      logger.error("[PETITION CONTROLLER] Error adding update:", err);
      next(err);
    }
  },

  /**
   * Admin: Moderate a petition comment
   */
  moderateComment: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { commentId } = req.params;
      const { status, isPinned } = req.body;

      if (!status) {
        res.status(400).json({ error: "Bad Request", message: "Moderation status is required." });
        return;
      }

      await petitionModel.updateCommentStatus(commentId, status, isPinned);

      res.json({
        success: true,
        message: "Comment moderated successfully."
      });
    } catch (err) {
      logger.error("[PETITION CONTROLLER] Error moderating comment:", err);
      next(err);
    }
  },

  /**
   * Admin: Delete a petition
   */
  deletePetition: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await petitionModel.deletePetition(id);
      res.json({ success: true, message: "Petition soft-deleted successfully." });
    } catch (err) {
      logger.error("[PETITION CONTROLLER] Error deleting petition:", err);
      next(err);
    }
  },

  // -------------------------------------------------------------
  // CENTRAL ADMIN SYSTEM METRICS & USER CONTROL ENDPOINTS
  // -------------------------------------------------------------

  /**
   * Admin: Get general metrics dashboard stats
   */
  getAdminStats: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const users = await userModel.getAllUsers();
      const petitions = await petitionModel.getPetitions();
      
      let totalSignaturesCount = 0;
      petitions.forEach(p => {
        totalSignaturesCount += p.currentSignatures;
      });

      const activePetitions = petitions.filter(p => p.status === "published").length;
      const draftPetitions = petitions.filter(p => p.status === "draft").length;

      // Compile recent activity list for dashboard
      const recentActivities: any[] = [];
      
      // 1. User Signups
      users.slice(-5).forEach(u => {
        recentActivities.push({
          type: "signup",
          message: `New user registration: ${u.name} (${u.email})`,
          time: u.createdAt,
          badge: "bg-teal-50 text-teal-700"
        });
      });

      // 2. Signatures (load Bihar signatures)
      const bpscSignatures = await petitionModel.getSignaturesByPetitionId("pet-bpsc-transfer-2026");
      bpscSignatures.slice(-5).forEach(s => {
        recentActivities.push({
          type: "signature",
          message: `${s.name} signed "Bihar BPSC Teacher Mutual Transfer"`,
          time: s.createdAt,
          badge: "bg-blue-50 text-blue-700"
        });
      });

      // Sort activities descending by time
      recentActivities.sort((a, b) => b.time.localeCompare(a.time));

      res.json({
        success: true,
        stats: {
          totalUsers: users.length,
          totalSignatures: totalSignaturesCount,
          activePetitions,
          draftPetitions,
          recentActivities: recentActivities.slice(0, 10) // Top 10 activities
        }
      });
    } catch (err) {
      logger.error("[PETITION CONTROLLER] Error compiling admin dashboard stats:", err);
      next(err);
    }
  },

  /**
   * Admin: User Directory (list, search, filter)
   */
  getAdminUsers: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const users = await userModel.getAllUsers();
      res.json({ success: true, users });
    } catch (err) {
      logger.error("[PETITION CONTROLLER] Error compiling user list:", err);
      next(err);
    }
  },

  /**
   * Admin: Update User Role (User, Moderator, Admin, Super Admin)
   */
  updateUserRole: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.params;
      const { role } = req.body;

      if (!role) {
        res.status(400).json({ error: "Bad Request", message: "Role value is required." });
        return;
      }

      const success = await userModel.updateUserRole(email, role);
      if (!success) {
        res.status(403).json({ error: "Forbidden", message: "Cannot alter permissions of this user account." });
        return;
      }

      res.json({ success: true, message: `Successfully updated user role to ${role}` });
    } catch (err) {
      logger.error("[PETITION CONTROLLER] Error updating user role:", err);
      next(err);
    }
  },

  /**
   * Admin: Suspend or Activate user account
   */
  updateUserStatus: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.params;
      const { status } = req.body;

      if (!status || (status !== "active" && status !== "suspended")) {
        res.status(400).json({ error: "Bad Request", message: "Valid status ('active' or 'suspended') is required." });
        return;
      }

      const success = await userModel.updateUserStatus(email, status);
      if (!success) {
        res.status(403).json({ error: "Forbidden", message: "Cannot alter status of this user account." });
        return;
      }

      res.json({ success: true, message: `Successfully updated user status to ${status}` });
    } catch (err) {
      logger.error("[PETITION CONTROLLER] Error updating user status:", err);
      next(err);
    }
  },

  /**
   * Admin: Administrative push password reset for a user
   */
  adminResetPassword: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.params;
      const { newPassword } = req.body;

      if (!newPassword || newPassword.trim().length < 6) {
        res.status(400).json({ error: "Bad Request", message: "A secure password of at least 6 characters is required." });
        return;
      }

      const hashedPassword = bcrypt.hashSync(newPassword.trim(), 10);
      const success = await userModel.adminResetPassword(email, hashedPassword);

      if (!success) {
        res.status(404).json({ error: "Not Found", message: "User account not found." });
        return;
      }

      res.json({ success: true, message: `Successfully pushed administrative password reset for ${email}.` });
    } catch (err) {
      logger.error("[PETITION CONTROLLER] Error in administrative reset:", err);
      next(err);
    }
  }
};
