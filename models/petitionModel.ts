import { createClient } from "@supabase/supabase-js";
import { logger } from "../utils/logger";

// -------------------------------------------------------------
// TYPES DEFINITIONS
// -------------------------------------------------------------
export interface Petition {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  category: string;
  bannerImage: string;
  featuredImage: string;
  govDepartment: string;
  petitionGoal: number;
  currentSignatures: number;
  status: "draft" | "published" | "closed" | "archived";
  startDate: string;
  endDate: string;
  seoTitle: string;
  seoDescription: string;
  featured: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
}

export interface PetitionSignature {
  id: string;
  petitionId: string;
  userEmail: string;
  name: string;
  district: string;
  block: string;
  school: string;
  teacherCategory: string;
  phone?: string;
  consent: boolean;
  signatureNumber: number;
  createdAt: string;
}

export interface PetitionUpdate {
  id: string;
  petitionId: string;
  title: string;
  content: string;
  createdAt: string;
  createdBy: string;
}

export interface PetitionComment {
  id: string;
  petitionId: string;
  userEmail: string;
  userName: string;
  content: string;
  status: "pending" | "approved" | "deleted" | "hidden" | "spam";
  isPinned: boolean;
  createdAt: string;
}

export interface PetitionCategory {
  id: string;
  name: string;
  slug: string;
}

export interface PetitionDocument {
  id: string;
  petitionId: string;
  title: string;
  fileUrl: string;
  fileType: string;
}

// -------------------------------------------------------------
// SUPABASE CLIENT INITIALIZATION
// -------------------------------------------------------------
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase: any = null;

if (!supabaseUrl || !supabaseKey) {
  logger.warn("[PETITION MODEL ERROR] Missing Supabase environment variables! Petition database operations will fail on invocation.");
} else {
  supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false }
  });
  logger.info("[PETITION MODEL] Supabase client initialized cleanly in strict database mode.");
}

// -------------------------------------------------------------
// PETITIONS MODEL OBJECT
// -------------------------------------------------------------
export const petitionModel = {
  /**
   * Fetch all petitions (or matching filters)
   */
  getPetitions: async (): Promise<Petition[]> => {
    try {
      console.log("[DATABASE QUERY AUDIT] Executing select query on table 'petitions'");
      const { data, error } = await supabase
        .from("petitions")
        .select("*")
        .eq("is_deleted", false);
      
      if (error) {
        throw error;
      }
      if (data) {
        return data.map(p => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          shortDescription: p.short_description,
          fullDescription: p.full_description,
          category: p.category,
          bannerImage: p.banner_image,
          featuredImage: p.featured_image,
          govDepartment: p.gov_department,
          petitionGoal: p.petition_goal,
          currentSignatures: p.current_signatures,
          status: p.status,
          startDate: p.start_date,
          endDate: p.end_date,
          seoTitle: p.seo_title,
          seoDescription: p.seo_description,
          featured: p.featured,
          createdBy: p.created_by,
          createdAt: p.created_at,
          updatedAt: p.updated_at
        }));
      }
    } catch (err: any) {
      logger.error("[PETITION MODEL ERROR] Failed to fetch petitions from Supabase:", err.message);
      throw err;
    }
    return [];
  },

  /**
   * Fetch individual petition by slug
   */
  getPetitionBySlug: async (slug: string): Promise<Petition | null> => {
    try {
      console.log(`[DATABASE QUERY AUDIT] Executing select query on table 'petitions' for slug: ${slug}`);
      const { data, error } = await supabase
        .from("petitions")
        .select("*")
        .eq("slug", slug)
        .eq("is_deleted", false)
        .single();
      
      if (error) {
        if (error.code === "PGRST116") {
          return null; // not found is expected
        }
        throw error;
      }

      if (data) {
        return {
          id: data.id,
          title: data.title,
          slug: data.slug,
          shortDescription: data.short_description,
          fullDescription: data.full_description,
          category: data.category,
          bannerImage: data.banner_image,
          featuredImage: data.featured_image,
          govDepartment: data.gov_department,
          petitionGoal: data.petition_goal,
          currentSignatures: data.current_signatures,
          status: data.status,
          startDate: data.start_date,
          endDate: data.end_date,
          seoTitle: data.seo_title,
          seoDescription: data.seo_description,
          featured: data.featured,
          createdBy: data.created_by,
          createdAt: data.created_at,
          updatedAt: data.updated_at
        };
      }
    } catch (err: any) {
      logger.error(`[PETITION MODEL ERROR] Failed to fetch petition by slug ${slug}:`, err.message);
      throw err;
    }
    return null;
  },

  /**
   * Create a new petition
   */
  createPetition: async (petition: Petition): Promise<boolean> => {
    try {
      const payload = {
        id: petition.id,
        title: petition.title,
        slug: petition.slug,
        short_description: petition.shortDescription,
        full_description: petition.fullDescription,
        category: petition.category,
        banner_image: petition.bannerImage,
        featured_image: petition.featuredImage,
        gov_department: petition.govDepartment,
        petition_goal: petition.petitionGoal,
        current_signatures: petition.currentSignatures,
        status: petition.status,
        start_date: petition.startDate,
        end_date: petition.endDate,
        seo_title: petition.seoTitle,
        seo_description: petition.seoDescription,
        featured: petition.featured,
        created_by: petition.createdBy,
        is_deleted: false,
        created_at: petition.createdAt || new Date().toISOString(),
        updated_at: petition.updatedAt || new Date().toISOString()
      };

      console.log(`[DATABASE QUERY AUDIT] Executing insert query on table 'petitions' for ID: ${petition.id}`);
      const { error } = await supabase
        .from("petitions")
        .insert(payload);

      if (error) {
        throw error;
      }
      logger.info(`[SUPABASE PETITION CREATE SUCCESS] Created petition ${petition.id}`);
      return true;
    } catch (err: any) {
      logger.error(`[PETITION MODEL ERROR] Failed to create petition ${petition.id}:`, err.message);
      throw err;
    }
  },

  /**
   * Update an existing petition
   */
  updatePetition: async (id: string, petition: Partial<Petition>): Promise<boolean> => {
    try {
      const updates: any = {};
      if (petition.title !== undefined) updates.title = petition.title;
      if (petition.slug !== undefined) updates.slug = petition.slug;
      if (petition.shortDescription !== undefined) updates.short_description = petition.shortDescription;
      if (petition.fullDescription !== undefined) updates.full_description = petition.fullDescription;
      if (petition.category !== undefined) updates.category = petition.category;
      if (petition.bannerImage !== undefined) updates.banner_image = petition.bannerImage;
      if (petition.featuredImage !== undefined) updates.featured_image = petition.featuredImage;
      if (petition.govDepartment !== undefined) updates.gov_department = petition.govDepartment;
      if (petition.petitionGoal !== undefined) updates.petition_goal = petition.petitionGoal;
      if (petition.currentSignatures !== undefined) updates.current_signatures = petition.currentSignatures;
      if (petition.status !== undefined) updates.status = petition.status;
      if (petition.startDate !== undefined) updates.start_date = petition.startDate;
      if (petition.endDate !== undefined) updates.end_date = petition.endDate;
      if (petition.seoTitle !== undefined) updates.seo_title = petition.seoTitle;
      if (petition.seoDescription !== undefined) updates.seo_description = petition.seoDescription;
      if (petition.featured !== undefined) updates.featured = petition.featured;
      if (petition.createdBy !== undefined) updates.created_by = petition.createdBy;
      updates.updated_at = new Date().toISOString();

      console.log(`[DATABASE QUERY AUDIT] Executing update query on table 'petitions' for ID: ${id}`);
      const { error } = await supabase
        .from("petitions")
        .update(updates)
        .eq("id", id);

      if (error) {
        throw error;
      }
      logger.info(`[SUPABASE PETITION UPDATE SUCCESS] Updated petition ${id}`);
      return true;
    } catch (err: any) {
      logger.error(`[PETITION MODEL ERROR] Failed to update petition ${id}:`, err.message);
      throw err;
    }
  },

  /**
   * Soft-delete petition
   */
  deletePetition: async (id: string): Promise<boolean> => {
    try {
      console.log(`[DATABASE QUERY AUDIT] Executing soft delete query on table 'petitions' for ID: ${id}`);
      const { error } = await supabase
        .from("petitions")
        .update({ is_deleted: true, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) {
        throw error;
      }
      logger.info(`[SUPABASE PETITION SOFT DELETE] Soft deleted petition ${id}`);
      return true;
    } catch (err: any) {
      logger.error(`[PETITION MODEL ERROR] Failed to soft-delete petition ${id}:`, err.message);
      throw err;
    }
  },

  /**
   * Add a signature to a petition and return the final sequence number
   */
  addSignature: async (signature: PetitionSignature): Promise<number> => {
    try {
      // Get current max signature number or count
      const { count, error: countErr } = await supabase
        .from("petition_signatures")
        .select("*", { count: "exact", head: true })
        .eq("petition_id", signature.petitionId);

      const nextNumber = (count || 0) + 1;

      const payload = {
        id: signature.id,
        petition_id: signature.petitionId,
        user_email: signature.userEmail,
        name: signature.name,
        district: signature.district,
        block: signature.block,
        school: signature.school,
        teacher_category: signature.teacherCategory,
        phone: signature.phone,
        consent: signature.consent,
        signature_number: nextNumber,
        created_at: signature.createdAt || new Date().toISOString()
      };

      console.log(`[DATABASE QUERY AUDIT] Executing insert query on table 'petition_signatures' for signature: ${signature.id}`);
      
      const { error: insError } = await supabase
        .from("petition_signatures")
        .insert(payload);

      if (insError) {
        throw insError;
      }

      // Update petition count
      await supabase
        .from("petitions")
        .update({ current_signatures: nextNumber, updated_at: new Date().toISOString() })
        .eq("id", signature.petitionId);

      logger.info(`[SUPABASE SIGNATURE SUCCESS] Registered signature on petition ${signature.petitionId} for email ${signature.userEmail}`);
      return nextNumber;
    } catch (err: any) {
      logger.error(`[PETITION MODEL ERROR] Failed to register signature:`, err.message);
      throw err;
    }
  },

  /**
   * Check if a user has already signed a specific petition
   */
  hasSigned: async (petitionId: string, email: string): Promise<boolean> => {
    try {
      console.log(`[DATABASE QUERY AUDIT] Checking signature existence for ${email} on petition ${petitionId}`);
      const { data, error } = await supabase
        .from("petition_signatures")
        .select("id")
        .eq("petition_id", petitionId)
        .eq("user_email", email.toLowerCase().trim())
        .limit(1);

      if (error) throw error;
      return Array.isArray(data) && data.length > 0;
    } catch (err: any) {
      logger.error(`[PETITION MODEL ERROR] Failed to check if user ${email} signed:`, err.message);
      throw err;
    }
  },

  /**
   * Create or update a petition (saves state)
   */
  savePetition: async (petition: Petition): Promise<boolean> => {
    try {
      const payload = {
        id: petition.id,
        title: petition.title,
        slug: petition.slug,
        short_description: petition.shortDescription,
        full_description: petition.fullDescription,
        category: petition.category,
        banner_image: petition.bannerImage,
        featured_image: petition.featuredImage,
        gov_department: petition.govDepartment,
        petition_goal: petition.petitionGoal,
        current_signatures: petition.currentSignatures,
        status: petition.status,
        start_date: petition.startDate,
        end_date: petition.endDate,
        seo_title: petition.seoTitle,
        seo_description: petition.seoDescription,
        featured: petition.featured,
        created_by: petition.createdBy,
        is_deleted: false,
        created_at: petition.createdAt || new Date().toISOString(),
        updated_at: petition.updatedAt || new Date().toISOString()
      };

      console.log(`[DATABASE QUERY AUDIT] Executing upsert query on table 'petitions' for ID: ${petition.id}`);
      const { error } = await supabase
        .from("petitions")
        .upsert(payload);

      if (error) {
        throw error;
      }
      logger.info(`[SUPABASE PETITION SAVE SUCCESS] Saved petition ${petition.id}`);
      return true;
    } catch (err: any) {
      logger.error(`[PETITION MODEL ERROR] Failed to save petition ${petition.id}:`, err.message);
      throw err;
    }
  },

  /**
   * Update comment status and pinned flag
   */
  updateCommentStatus: async (commentId: string, status: string, isPinned?: boolean): Promise<boolean> => {
    try {
      const updates: any = { status };
      if (isPinned !== undefined) {
        updates.is_pinned = isPinned;
      }

      console.log(`[DATABASE QUERY AUDIT] Executing update query on 'petition_comments' for ID: ${commentId}`);
      const { error } = await supabase
        .from("petition_comments")
        .update(updates)
        .eq("id", commentId);

      if (error) {
        throw error;
      }
      logger.info(`[SUPABASE COMMENT STATUS UPDATE] Updated comment ${commentId} to status ${status}`);
      return true;
    } catch (err: any) {
      logger.error(`[PETITION MODEL ERROR] Failed to update comment status for ${commentId}:`, err.message);
      throw err;
    }
  },

  /**
   * Controller alias: get signatures by petition ID
   */
  getSignaturesByPetitionId: async (petitionId: string): Promise<PetitionSignature[]> => {
    return petitionModel.getSignatures(petitionId);
  },

  /**
   * Controller alias: get comments by petition ID
   */
  getCommentsByPetitionId: async (petitionId: string): Promise<PetitionComment[]> => {
    return petitionModel.getComments(petitionId);
  },

  /**
   * Controller alias: get documents by petition ID
   */
  getDocumentsByPetitionId: async (petitionId: string): Promise<PetitionDocument[]> => {
    return petitionModel.getDocuments(petitionId);
  },

  /**
   * Retrieve all announcements/updates for a petition
   */
  getUpdatesByPetitionId: async (petitionId: string): Promise<PetitionUpdate[]> => {
    try {
      console.log(`[DATABASE QUERY AUDIT] Executing select query on 'petition_updates' for petition ID: ${petitionId}`);
      const { data, error } = await supabase
        .from("petition_updates")
        .select("*")
        .eq("petition_id", petitionId)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        return data.map(u => ({
          id: u.id,
          petitionId: u.petition_id,
          title: u.title,
          content: u.content,
          createdAt: u.created_at,
          createdBy: u.created_by
        }));
      }
    } catch (err: any) {
      logger.error(`[PETITION MODEL ERROR] Failed to fetch updates for ${petitionId}:`, err.message);
      throw err;
    }
    return [];
  },

  /**
   * Get all signatures for a petition
   */
  getSignatures: async (petitionId: string): Promise<PetitionSignature[]> => {
    try {
      console.log(`[DATABASE QUERY AUDIT] Executing select query on 'petition_signatures' for petition ID: ${petitionId}`);
      const { data, error } = await supabase
        .from("petition_signatures")
        .select("*")
        .eq("petition_id", petitionId)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        return data.map(s => ({
          id: s.id,
          petitionId: s.petition_id,
          userEmail: s.user_email,
          name: s.name,
          district: s.district,
          block: s.block,
          school: s.school,
          teacherCategory: s.teacher_category,
          phone: s.phone,
          consent: s.consent,
          signatureNumber: s.signature_number,
          createdAt: s.created_at
        }));
      }
    } catch (err: any) {
      logger.error(`[PETITION MODEL ERROR] Failed to fetch signatures for ${petitionId}:`, err.message);
      throw err;
    }
    return [];
  },

  /**
   * Add a petition update/announcement
   */
  addUpdate: async (update: PetitionUpdate): Promise<boolean> => {
    try {
      const payload = {
        id: update.id,
        petition_id: update.petitionId,
        title: update.title,
        content: update.content,
        created_by: update.createdBy,
        created_at: update.createdAt || new Date().toISOString()
      };

      console.log(`[DATABASE QUERY AUDIT] Executing insert query on 'petition_updates' for: ${update.id}`);
      const { error } = await supabase
        .from("petition_updates")
        .insert(payload);

      if (error) {
        throw error;
      }
      logger.info(`[SUPABASE UPDATE SUCCESS] Added update to petition ${update.petitionId}`);
      return true;
    } catch (err: any) {
      logger.error(`[PETITION MODEL ERROR] Failed to add update:`, err.message);
      throw err;
    }
  },

  /**
   * Add comment to petition
   */
  addComment: async (comment: PetitionComment): Promise<boolean> => {
    try {
      const payload = {
        id: comment.id,
        petition_id: comment.petitionId,
        user_email: comment.userEmail,
        user_name: comment.userName,
        content: comment.content,
        status: comment.status || "approved",
        is_pinned: comment.isPinned || false,
        created_at: comment.createdAt || new Date().toISOString()
      };

      console.log(`[DATABASE QUERY AUDIT] Executing insert query on 'petition_comments' for comment: ${comment.id}`);
      const { error } = await supabase
        .from("petition_comments")
        .insert(payload);

      if (error) {
        throw error;
      }
      logger.info(`[SUPABASE COMMENT SUCCESS] Added comment to petition ${comment.petitionId}`);
      return true;
    } catch (err: any) {
      logger.error(`[PETITION MODEL ERROR] Failed to add comment:`, err.message);
      throw err;
    }
  },

  /**
   * Fetch comments for a petition
   */
  getComments: async (petitionId: string): Promise<PetitionComment[]> => {
    try {
      console.log(`[DATABASE QUERY AUDIT] Executing select query on 'petition_comments' for petition ID: ${petitionId}`);
      const { data, error } = await supabase
        .from("petition_comments")
        .select("*")
        .eq("petition_id", petitionId)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        return data.map(c => ({
          id: c.id,
          petitionId: c.petition_id,
          userEmail: c.user_email,
          userName: c.user_name,
          content: c.content,
          status: c.status,
          isPinned: c.is_pinned,
          createdAt: c.created_at
        }));
      }
    } catch (err: any) {
      logger.error(`[PETITION MODEL ERROR] Failed to fetch comments for ${petitionId}:`, err.message);
      throw err;
    }
    return [];
  },

  /**
   * Get all categories for petition center
   */
  getCategories: async (): Promise<PetitionCategory[]> => {
    try {
      console.log("[DATABASE QUERY AUDIT] Executing select query on table 'petition_categories'");
      const { data, error } = await supabase
        .from("petition_categories")
        .select("*");

      if (error) {
        throw error;
      }

      if (data) {
        return data.map(cat => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug
        }));
      }
    } catch (err: any) {
      logger.error("[PETITION MODEL ERROR] Failed to fetch categories:", err.message);
      throw err;
    }
    return [];
  },

  /**
   * Get all documents attached to a petition
   */
  getDocuments: async (petitionId: string): Promise<PetitionDocument[]> => {
    try {
      console.log(`[DATABASE QUERY AUDIT] Executing select query on 'petition_documents' for petition ID: ${petitionId}`);
      const { data, error } = await supabase
        .from("petition_documents")
        .select("*")
        .eq("petition_id", petitionId);

      if (error) {
        throw error;
      }

      if (data) {
        return data.map(doc => ({
          id: doc.id,
          petitionId: doc.petition_id,
          title: doc.title,
          fileUrl: doc.file_url,
          fileType: doc.file_type
        }));
      }
    } catch (err: any) {
      logger.error(`[PETITION MODEL ERROR] Failed to fetch documents for ${petitionId}:`, err.message);
      throw err;
    }
    return [];
  },

  /**
   * Attach a document to a petition
   */
  addDocument: async (doc: PetitionDocument): Promise<boolean> => {
    try {
      const payload = {
        id: doc.id,
        petition_id: doc.petitionId,
        title: doc.title,
        file_url: doc.fileUrl,
        file_type: doc.fileType
      };

      console.log(`[DATABASE QUERY AUDIT] Executing insert query on 'petition_documents' for: ${doc.id}`);
      const { error } = await supabase
        .from("petition_documents")
        .insert(payload);

      if (error) {
        throw error;
      }
      logger.info(`[SUPABASE DOCUMENT SUCCESS] Attached document to petition ${doc.petitionId}`);
      return true;
    } catch (err: any) {
      logger.error(`[PETITION MODEL ERROR] Failed to attach document:`, err.message);
      throw err;
    }
  }
};
