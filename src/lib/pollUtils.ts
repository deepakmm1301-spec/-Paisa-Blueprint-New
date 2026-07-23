import { Poll } from "../types/poll";

/**
 * Generates an SEO-friendly URL slug for a poll based on its question or explicit slug.
 */
export function getPollSlug(poll: { id: string; question: string; slug?: string }): string {
  if (poll.slug) return poll.slug;
  const slugified = poll.question
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .substring(0, 70);
  return slugified || poll.id;
}

/**
 * Checks whether a poll is active (published and not past its end date).
 */
export function isPollActive(poll: Poll | { status: string; end_date?: string }): boolean {
  if (poll.status !== "Published") return false;
  if (poll.end_date) {
    const end = new Date(poll.end_date);
    if (!isNaN(end.getTime()) && end < new Date()) {
      return false;
    }
  }
  return true;
}

/**
 * Returns formatted status badge label for a poll.
 */
export function getPollStatusLabel(poll: Poll | { status: string; end_date?: string }, language: "en" | "hi" = "hi"): {
  label: string;
  isActive: boolean;
  colorClass: string;
} {
  const active = isPollActive(poll);
  if (active) {
    return {
      label: language === "hi" ? "सक्रिय वोटिंग (Active)" : "Active Poll",
      isActive: true,
      colorClass: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-400"
    };
  } else if (poll.status === "Archived") {
    return {
      label: language === "hi" ? "आर्काइव्ड (Archived)" : "Archived",
      isActive: false,
      colorClass: "bg-slate-500/10 text-slate-600 border-slate-500/30 dark:bg-slate-500/20 dark:text-slate-400"
    };
  } else {
    return {
      label: language === "hi" ? "समाप्त / बंद (Closed)" : "Poll Closed",
      isActive: false,
      colorClass: "bg-rose-500/10 text-rose-600 border-rose-500/30 dark:bg-rose-500/20 dark:text-rose-400"
    };
  }
}
