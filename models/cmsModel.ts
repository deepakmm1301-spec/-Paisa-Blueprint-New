import { createClient } from "@supabase/supabase-js";
import { logger } from "../utils/logger";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    })
  : null;

// Define types for CMS
export interface HomepageSection {
  id: string;
  name: string;
  visible: boolean;
  order: number;
}

export interface HomepageConfig {
  heroBanner: {
    imageUrl: string;
    headline: string;
    description: string;
    ctaText: string;
    ctaLink: string;
  };
  sections: HomepageSection[];
}

export interface Announcement {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  startDate: string;
  endDate: string;
  backgroundColor: string;
  icon: string;
  targetAudience: string;
  published: boolean;
}

export interface OfficialCircular {
  id: string;
  title: string;
  department: string;
  category: string;
  circularNumber: string;
  publishDate: string;
  effectiveDate: string;
  fileUrl: string; // Base64 or reference URL
  thumbnail: string;
  tags: string[];
  description: string;
  featured: boolean;
  downloadCount: number;
  viewCount: number;
  status: "active" | "archived";
}

export interface Blog {
  id: string;
  featuredImage: string;
  title: string;
  slug: string;
  category: string;
  author: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  tags: string[];
  publishDate: string;
  content: string;
  status: "draft" | "published" | "scheduled";
  scheduledDate?: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
}

export interface DownloadFile {
  id: string;
  title: string;
  description: string;
  category: string;
  fileUrl: string;
  fileType: "pdf" | "docx" | "xlsx" | "zip" | "image";
  version: string;
  publishDate: string;
  downloadCount: number;
  viewCount: number;
}

export interface Banner {
  id: string;
  imageUrl: string;
  title: string;
  description: string;
  ctaText: string;
  targetLink: string;
  priority: number;
  startDate: string;
  endDate: string;
  enabled: boolean;
  homepagePosition: "top" | "middle" | "sidebar" | "bottom";
}

export interface PetitionContent {
  petitionId: string;
  title: string;
  description: string;
  imageUrl: string;
  enableCountdown: boolean;
  enableProgressBar: boolean;
  enableComments: boolean;
  enableSharing: boolean;
  featured: boolean;
  archived: boolean;
}

export interface MenuItem {
  id: string;
  label: string;
  path: string;
  icon: string;
  visible: boolean;
  order: number;
}

export interface FooterConfig {
  contact: {
    email: string;
    phone: string;
    address: string;
  };
  socialLinks: {
    facebook: string;
    twitter: string;
    youtube: string;
    telegram: string;
  };
  copyright: string;
  quickLinks: { label: string; url: string }[];
  privacyPolicyUrl: string;
  termsUrl: string;
}

export interface MediaItem {
  id: string;
  name: string;
  url: string; // Base64 content
  size: string;
  category: string;
  uploadedAt: string;
  mimeType: string;
  usageCount: number;
  usedInPages: string[];
}

export interface PageSEO {
  pagePath: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  canonicalUrl: string;
  ogImage: string;
  twitterCard: string;
  schemaMarkup: string;
}

export interface SEOConfig {
  pages: PageSEO[];
  sitemap: string;
  robotsTxt: string;
}

export interface Revision {
  id: string;
  moduleId: string; // e.g. "homepage", "announcements", etc.
  title: string;
  content: any;
  status: "draft" | "published" | "previous";
  version: number;
  createdAt: string;
  createdBy: string;
}

export interface ActivityLog {
  id: string;
  userName: string;
  userEmail: string;
  action: string;
  moduleId: string;
  oldValue: any;
  newValue: any;
  ipAddress: string;
  browser: string;
  createdAt: string;
}

export interface Suggestion {
  id: string;
  moduleId: string;
  suggestedByEmail: string;
  suggestedByName: string;
  action: string; // e.g. "Edit Homepage", "Add Announcement"
  content: any;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface CmsDbSchema {
  homepage: HomepageConfig;
  announcements: Announcement[];
  circulars: OfficialCircular[];
  blogs: Blog[];
  faqs: FAQ[];
  downloads: DownloadFile[];
  banners: Banner[];
  petitions: PetitionContent[];
  navigation: MenuItem[];
  footer: FooterConfig;
  media: MediaItem[];
  seo: SEOConfig;
  revisions: Revision[];
  activityLogs: ActivityLog[];
  suggestions: Suggestion[];
}

// Default Seed Data
const defaultCmsDb: CmsDbSchema = {
  homepage: {
    heroBanner: {
      imageUrl: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=1200",
      headline: "Bihar BPSC Teacher Advocacy & Financial Intelligence Hub",
      description: "Access high-fidelity salary calculators, Bihar State Teacher Transfer Rules, dearness allowance forecasts, and secure advocacy petitions for our mutual transfer rights.",
      ctaText: "Sign the Mutual Transfer Petition",
      ctaLink: "/petitions/bihar-bpsc-teacher-mutual-transfer"
    },
    sections: [
      { id: "hero", name: "Hero Banner", visible: true, order: 1 },
      { id: "announcements", name: "Announcements Board", visible: true, order: 2 },
      { id: "calculators", name: "Financial Calculators Grid", visible: true, order: 3 },
      { id: "circulars", name: "Bihar Govt Official Circulars", visible: true, order: 4 },
      { id: "petitions", name: "Active Petitions Landing", visible: true, order: 5 },
      { id: "blog", name: "Teacher Insights & Blogs", visible: true, order: 6 },
      { id: "faqs", name: "FAQ Board", visible: true, order: 7 }
    ]
  },
  announcements: [
    {
      id: "ann-1",
      title: "Urgent Update: Point-Based Seniority Guidelines Released",
      description: "The Bihar Education Department has finalized the draft transfer points policy. Check your score now in our transfer analysis modules.",
      priority: "high",
      startDate: "2026-07-10T00:00:00.000Z",
      endDate: "2026-08-10T23:59:59.000Z",
      backgroundColor: "#fee2e2",
      icon: "Megaphone",
      targetAudience: "BPSC TRE 1.0 & 2.0 Teachers",
      published: true
    }
  ],
  circulars: [
    {
      id: "circ-1",
      title: "Bihar State Teacher Transfer Rules, 2026 (Memo 11/Vi-33/2026)",
      department: "Education Department",
      category: "Transfer Policy",
      circularNumber: "Memo 11/Vi-33/2026",
      publishDate: "2026-06-25",
      effectiveDate: "2026-07-01",
      fileUrl: "#",
      thumbnail: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=300",
      tags: ["Transfer", "Bihar Govt", "Rules"],
      description: "Official notification detailing the Point-Based Seniority System for general and mutual teacher transfers.",
      featured: true,
      downloadCount: 412,
      viewCount: 1250,
      status: "active"
    }
  ],
  blogs: [
    {
      id: "blog-1",
      featuredImage: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&q=80&w=800",
      title: "Understanding Bihar Teacher Point-Based Seniority System",
      slug: "understanding-bihar-teacher-point-based-seniority-system",
      category: "Transfer Policy",
      author: "Aditya Narayan",
      metaTitle: "Bihar Teacher Point System Demystified | Paisa Blueprint",
      metaDescription: "A deep dive explanation of how the 2026 teacher transfer points are calculated including spouse posting, medical options and service tenure.",
      keywords: ["transfer rules", "point-based seniority", "bihar bpsc teacher"],
      tags: ["Seniority Points", "Mutual Transfer", "Bihar Education"],
      publishDate: "2026-07-12",
      content: "<p>The new Bihar State Teacher Transfer Rules introduce a <strong>Point-Based Seniority System</strong>. Teachers can score up to 100 points based on various criteria. Our analysis breaks down exactly how to claim points for spouse postings, medical priorities, and tenure.</p>",
      status: "published"
    }
  ],
  faqs: [
    {
      id: "faq-1",
      question: "What is the point eligibility threshold for mutual transfers?",
      answer: "For mutual transfers, both teachers must be in the same pay-grade and subject category. Standard seniority points act as tie-breakers but are not highly restrictive if a mutual peer is matched.",
      category: "Mutual Transfer",
      order: 1
    },
    {
      id: "faq-2",
      question: "Are there special transfer quotas for women or disabled teachers?",
      answer: "Yes, female teachers and disabled candidates are awarded up to 20 points of medical/priority seniority, allowing them priority slots in transfer rounds.",
      category: "General Rules",
      order: 2
    }
  ],
  downloads: [
    {
      id: "dl-1",
      title: "Mutual Transfer NOC No-Objection Template",
      description: "The official draft declaration template for mutual peer matching to be submitted to district educational authorities.",
      category: "Templates",
      fileUrl: "#",
      fileType: "pdf",
      version: "1.1",
      publishDate: "2026-07-01",
      downloadCount: 890,
      viewCount: 2201
    }
  ],
  banners: [
    {
      id: "ban-1",
      imageUrl: "https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&q=80&w=800",
      title: "Join the BPSC Teacher Telegram Support Portal",
      description: "Connect with over 25,000 Bihar teachers for immediate peer matching, school reviews and salary discussions.",
      ctaText: "Join Telegram Portal",
      targetLink: "https://t.me/paisablueprint",
      priority: 1,
      startDate: "2026-07-01T00:00:00.000Z",
      endDate: "2026-12-31T23:59:59.000Z",
      enabled: true,
      homepagePosition: "sidebar"
    }
  ],
  petitions: [
    {
      petitionId: "pet-bpsc-transfer-2026",
      title: "Simplification of Bihar BPSC Teacher Mutual Transfer Rules",
      description: "Join the collective demand of 1.5 Lakh BPSC TRE teachers seeking simplified, unconditional, and immediate online mutual transfer policies with home-district provisions.",
      imageUrl: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=1200",
      enableCountdown: true,
      enableProgressBar: true,
      enableComments: true,
      enableSharing: true,
      featured: true,
      archived: false
    }
  ],
  navigation: [
    { id: "nav-1", label: "Salary Calculator", path: "/salary-calculator", icon: "Calculator", visible: true, order: 1 },
    { id: "nav-2", label: "NPS & Pension", path: "/nps-calculator", icon: "PiggyBank", visible: true, order: 2 },
    { id: "nav-3", label: "DA Calculator", path: "/bihar-da-calculator", icon: "TrendingUp", visible: true, order: 3 },
    { id: "nav-4", label: "Mutual Transfer Hub", path: "/teacher-hub", icon: "Users", visible: true, order: 4 },
    { id: "nav-5", label: "Petitions Center", path: "/petitions", icon: "FileText", visible: true, order: 5 }
  ],
  footer: {
    contact: {
      email: "support@paisablueprint.in",
      phone: "+91 612 222 3456",
      address: "Advocacy & Support Desk, Frazer Road, Patna, Bihar, 800001"
    },
    socialLinks: {
      facebook: "https://facebook.com/paisablueprint",
      twitter: "https://twitter.com/paisablueprint",
      youtube: "https://youtube.com/paisablueprint",
      telegram: "https://t.me/paisablueprint"
    },
    copyright: "© 2026 Paisa Blueprint. Independent advocacy platform built for Bihar Government State Teachers.",
    quickLinks: [
      { label: "BPSC Teacher Salary", url: "/bpsc-teacher-salary-calculator" },
      { label: "8th Pay Commission Guide", url: "/8th-pay-commission-salary-calculator" },
      { label: "Mutual Transfer Guidelines", url: "/teacher-hub" },
      { label: "Sign Demands Petition", url: "/petitions" }
    ],
    privacyPolicyUrl: "/privacy",
    termsUrl: "/terms"
  },
  media: [],
  seo: {
    pages: [
      {
        pagePath: "/",
        metaTitle: "Paisa Blueprint | Bihar BPSC Teacher Salary & advocacy Portal",
        metaDescription: "Calculate Bihar teacher salaries under 7th pay commission, explore 8th CPC forecasts, and support mutual transfer simplification.",
        keywords: ["BPSC teacher salary", "Bihar teacher transfer", "8th pay commission"],
        canonicalUrl: "https://paisablueprint.in/",
        ogImage: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=1200",
        twitterCard: "summary_large_image",
        schemaMarkup: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Paisa Blueprint",
          "url": "https://paisablueprint.in/"
        })
      }
    ],
    sitemap: "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n  <url><loc>https://paisablueprint.in/</loc><priority>1.0</priority></url>\n</urlset>",
    robotsTxt: "User-agent: *\nAllow: /\nSitemap: https://paisablueprint.in/sitemap.xml"
  },
  revisions: [],
  activityLogs: [],
  suggestions: []
};

let cachedCmsDb: CmsDbSchema | null = null;

export const cmsModel = {
  /**
   * Reads all data from Supabase PostgreSQL (teacher_hub_data under id 'cms_global_state')
   */
  readDb: async (): Promise<CmsDbSchema> => {
    if (cachedCmsDb) {
      return cachedCmsDb;
    }

    if (supabase) {
      try {
        console.log("[DATABASE QUERY AUDIT] Executing select query on table 'teacher_hub_data' for 'cms_global_state'");
        const { data, error } = await supabase
          .from("teacher_hub_data")
          .select("payload")
          .eq("id", "cms_global_state")
          .single();

        if (!error && data && data.payload) {
          console.log("[DATABASE QUERY SUCCESS] Successfully retrieved 'cms_global_state' from Supabase.");
          const parsed = data.payload as any;
          cachedCmsDb = {
            homepage: parsed.homepage || defaultCmsDb.homepage,
            announcements: parsed.announcements || defaultCmsDb.announcements,
            circulars: parsed.circulars || defaultCmsDb.circulars,
            blogs: parsed.blogs || defaultCmsDb.blogs,
            faqs: parsed.faqs || defaultCmsDb.faqs,
            downloads: parsed.downloads || defaultCmsDb.downloads,
            banners: parsed.banners || defaultCmsDb.banners,
            petitions: parsed.petitions || defaultCmsDb.petitions,
            navigation: parsed.navigation || defaultCmsDb.navigation,
            footer: parsed.footer || defaultCmsDb.footer,
            media: parsed.media || defaultCmsDb.media,
            seo: parsed.seo || defaultCmsDb.seo,
            revisions: parsed.revisions || defaultCmsDb.revisions,
            activityLogs: parsed.activityLogs || defaultCmsDb.activityLogs,
            suggestions: parsed.suggestions || defaultCmsDb.suggestions
          };
          return cachedCmsDb;
        } else if (error && error.code === "PGRST116") {
          console.log("[DATABASE QUERY INFO] 'cms_global_state' row not found. Initializing with default seed...");
          cachedCmsDb = JSON.parse(JSON.stringify(defaultCmsDb));
          await cmsModel.writeDb(cachedCmsDb!);
          return cachedCmsDb!;
        } else {
          logger.warn(`[CMS MODEL] Non-fatal issue loading CMS state from Supabase, using defaults: ${error?.message}`);
        }
      } catch (err: any) {
        logger.error("[CMS MODEL] Exception loading CMS state from Supabase:", err.message || err);
      }
    }

    cachedCmsDb = JSON.parse(JSON.stringify(defaultCmsDb));
    return cachedCmsDb!;
  },

  /**
   * Writes data back to Supabase PostgreSQL (teacher_hub_data under id 'cms_global_state')
   */
  writeDb: async (data: CmsDbSchema): Promise<boolean> => {
    cachedCmsDb = data;
    if (supabase) {
      try {
        console.log("[DATABASE QUERY AUDIT] Executing upsert query on table 'teacher_hub_data' for 'cms_global_state'");
        const { error } = await supabase
          .from("teacher_hub_data")
          .upsert({
            id: "cms_global_state",
            payload: data,
            updated_at: new Date().toISOString()
          });

        if (error) {
          logger.error("[CMS MODEL] Supabase upsert failed for 'cms_global_state':", error);
          return false;
        }
        console.log("[DATABASE QUERY SUCCESS] Successfully upserted 'cms_global_state' to Supabase.");
        return true;
      } catch (err: any) {
        logger.error("[CMS MODEL] Exception during CMS write:", err.message || err);
        return false;
      }
    }
    return true;
  },

  /**
   * Log an activity
   */
  logActivity: async (
    userName: string,
    userEmail: string,
    action: string,
    moduleId: string,
    oldValue: any,
    newValue: any,
    ipAddress: string,
    browser: string
  ): Promise<void> => {
    const db = await cmsModel.readDb();
    const log: ActivityLog = {
      id: "log-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5),
      userName,
      userEmail,
      action,
      moduleId,
      oldValue,
      newValue,
      ipAddress: ipAddress || "127.0.0.1",
      browser: browser || "Unknown Browser",
      createdAt: new Date().toISOString()
    };
    db.activityLogs.unshift(log);
    // Keep last 500 logs only to conserve space
    if (db.activityLogs.length > 500) {
      db.activityLogs = db.activityLogs.slice(0, 500);
    }
    await cmsModel.writeDb(db);
  },

  /**
   * Creates a revision of a module
   */
  createRevision: async (
    moduleId: string,
    title: string,
    content: any,
    status: "draft" | "published" | "previous",
    createdBy: string
  ): Promise<void> => {
    const db = await cmsModel.readDb();
    
    // Deactivate previous "published" or "draft" statuses depending on action
    if (status === "published") {
      db.revisions.forEach(rev => {
        if (rev.moduleId === moduleId && rev.status === "published") {
          rev.status = "previous";
        }
      });
    } else if (status === "draft") {
      db.revisions.forEach(rev => {
        if (rev.moduleId === moduleId && rev.status === "draft") {
          rev.status = "previous";
        }
      });
    }

    const currentModuleRevisions = db.revisions.filter(r => r.moduleId === moduleId);
    const nextVersion = currentModuleRevisions.length > 0 
      ? Math.max(...currentModuleRevisions.map(r => r.version)) + 1 
      : 1;

    const revision: Revision = {
      id: "rev-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5),
      moduleId,
      title,
      content,
      status,
      version: nextVersion,
      createdAt: new Date().toISOString(),
      createdBy
    };

    db.revisions.unshift(revision);
    await cmsModel.writeDb(db);
  },

  /**
   * Submits a suggestion (for moderators)
   */
  addSuggestion: async (
    moduleId: string,
    suggestedByEmail: string,
    suggestedByName: string,
    action: string,
    content: any
  ): Promise<Suggestion> => {
    const db = await cmsModel.readDb();
    const suggestion: Suggestion = {
      id: "sug-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5),
      moduleId,
      suggestedByEmail,
      suggestedByName,
      action,
      content,
      status: "pending",
      createdAt: new Date().toISOString()
    };
    db.suggestions.unshift(suggestion);
    await cmsModel.writeDb(db);
    return suggestion;
  }
};
