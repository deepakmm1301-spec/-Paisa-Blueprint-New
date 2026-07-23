import { createClient } from "@supabase/supabase-js";
import { logger } from "../utils/logger";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    })
  : null;

export interface PollOptionRecord {
  id: string;
  poll_id: string;
  option_text: string;
  display_order: number;
  vote_count: number;
}

export interface PollRecord {
  id: string;
  question: string;
  description?: string;
  category: string;
  allow_multiple: boolean;
  show_results_before_vote: boolean;
  allow_vote_edit: boolean;
  require_login: boolean;
  featured: boolean;
  status: string;
  priority: string;
  target_audience: string;
  image_url?: string;
  start_date: string;
  end_date?: string;
  total_votes: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
  options?: PollOptionRecord[];
  user_votes?: string[];
}

// Fallback seed polls if database is fresh
const SEED_POLLS: PollRecord[] = [
  {
    id: "a1010101-1111-4444-8888-111111111111",
    question: "Which Bihar BPSC Teacher Mutual Transfer Rule improvement is most critical?",
    description: "Cast your official vote on the top structural policy reform needed for the 2026 Bihar Teacher Mutual Transfer schedule.",
    category: "Teacher Hub",
    allow_multiple: true,
    show_results_before_vote: false,
    allow_vote_edit: true,
    require_login: true,
    featured: true,
    status: "Published",
    priority: "High",
    target_audience: "Teachers",
    image_url: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=800",
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    total_votes: 1420,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    options: [
      {
        id: "b1010101-1111-4444-8888-111111111111",
        poll_id: "a1010101-1111-4444-8888-111111111111",
        option_text: "Instant Online Verification & Auto Match",
        display_order: 1,
        vote_count: 620
      },
      {
        id: "b2020202-2222-4444-8888-222222222222",
        poll_id: "a1010101-1111-4444-8888-111111111111",
        option_text: "Home District Choice Preference",
        display_order: 2,
        vote_count: 450
      },
      {
        id: "b3030303-3333-4444-8888-333333333333",
        poll_id: "a1010101-1111-4444-8888-111111111111",
        option_text: "Transparent Point-Based Seniority Ranks",
        display_order: 3,
        vote_count: 230
      },
      {
        id: "b4040404-4444-4444-8888-444444444444",
        poll_id: "a1010101-1111-4444-8888-111111111111",
        option_text: "Special Consideration for Medical & Women Teachers",
        display_order: 4,
        vote_count: 120
      }
    ]
  },
  {
    id: "a2020202-2222-4444-8888-222222222222",
    question: "What Fitment Factor do you support for the upcoming 8th Pay Commission?",
    description: "Share your opinion on the projected salary scale fitment multiplier for central and state government employees.",
    category: "Homepage",
    allow_multiple: false,
    show_results_before_vote: false,
    allow_vote_edit: true,
    require_login: true,
    featured: true,
    status: "Published",
    priority: "High",
    target_audience: "Government Employees",
    image_url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800",
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    total_votes: 2840,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    options: [
      {
        id: "c1010101-1111-4444-8888-111111111111",
        poll_id: "a2020202-2222-4444-8888-222222222222",
        option_text: "2.57 Fitment Factor (Standard 7th CPC baseline)",
        display_order: 1,
        vote_count: 410
      },
      {
        id: "c2020202-2222-4444-8888-222222222222",
        poll_id: "a2020202-2222-4444-8888-222222222222",
        option_text: "2.86 Fitment Factor (Recommended Inflation Benchmark)",
        display_order: 2,
        vote_count: 1720
      },
      {
        id: "c3030303-3333-4444-8888-333333333333",
        poll_id: "a2020202-2222-4444-8888-222222222222",
        option_text: "3.00 Fitment Factor (Maximum Demand Benchmark)",
        display_order: 3,
        vote_count: 710
      }
    ]
  }
];

// Helper for fallback state store
async function getFallbackState(): Promise<{ polls: PollRecord[]; votes: any[] }> {
  if (!supabase) {
    return { polls: SEED_POLLS, votes: [] };
  }
  try {
    const { data } = await supabase
      .from("teacher_hub_data")
      .select("payload")
      .eq("id", "polls_global_state")
      .maybeSingle();

    if (data && data.payload) {
      return data.payload;
    }
  } catch (err) {
    logger.warn("Error reading fallback poll state:", err);
  }
  return { polls: SEED_POLLS, votes: [] };
}

async function saveFallbackState(state: { polls: PollRecord[]; votes: any[] }): Promise<void> {
  if (!supabase) return;
  try {
    await supabase
      .from("teacher_hub_data")
      .upsert({
        id: "polls_global_state",
        payload: state,
        updated_at: new Date().toISOString()
      }, { onConflict: "id" });
  } catch (err) {
    logger.error("Error saving fallback poll state:", err);
  }
}

export class PollModel {
  /**
   * Fetch all polls with options and user votes
   */
  static async getAllPolls(filters?: {
    category?: string;
    status?: string;
    featured?: boolean;
    search?: string;
    userId?: string;
  }): Promise<PollRecord[]> {
    if (!supabase) {
      const state = await getFallbackState();
      return this.filterPollsLocally(state.polls, filters, state.votes);
    }

    try {
      let query = supabase.from("polls").select("*");

      if (filters?.category && filters.category !== "All") {
        query = query.eq("category", filters.category);
      }
      if (filters?.status && filters.status !== "All") {
        query = query.eq("status", filters.status);
      }
      if (filters?.featured !== undefined) {
        query = query.eq("featured", filters.featured);
      }
      if (filters?.search) {
        query = query.ilike("question", `%${filters.search}%`);
      }

      query = query.order("created_at", { ascending: false });

      const { data: pollsData, error: pollsError } = await query;

      if (pollsError || !pollsData) {
        logger.warn("Supabase query on polls table failed or empty, falling back:", pollsError?.message);
        const state = await getFallbackState();
        return this.filterPollsLocally(state.polls, filters, state.votes);
      }

      // Fetch options for all returned polls
      const pollIds = pollsData.map(p => p.id);
      let optionsMap: Record<string, PollOptionRecord[]> = {};

      if (pollIds.length > 0) {
        const { data: optionsData } = await supabase
          .from("poll_options")
          .select("*")
          .in("poll_id", pollIds)
          .order("display_order", { ascending: true });

        if (optionsData) {
          optionsData.forEach((opt: PollOptionRecord) => {
            if (!optionsMap[opt.poll_id]) optionsMap[opt.poll_id] = [];
            optionsMap[opt.poll_id].push(opt);
          });
        }
      }

      // Fetch user votes if userId provided
      let userVotesMap: Record<string, string[]> = {};
      if (filters?.userId && pollIds.length > 0) {
        const { data: votesData } = await supabase
          .from("poll_votes")
          .select("poll_id, option_id")
          .eq("user_id", filters.userId)
          .in("poll_id", pollIds);

        if (votesData) {
          votesData.forEach((v: any) => {
            if (!userVotesMap[v.poll_id]) userVotesMap[v.poll_id] = [];
            userVotesMap[v.poll_id].push(v.option_id);
          });
        }
      }

      return pollsData.map(poll => ({
        ...poll,
        options: optionsMap[poll.id] || [],
        user_votes: userVotesMap[poll.id] || []
      }));
    } catch (err: any) {
      logger.error("Failed to fetch polls, using fallback state:", err);
      const state = await getFallbackState();
      return this.filterPollsLocally(state.polls, filters, state.votes);
    }
  }

  private static filterPollsLocally(polls: PollRecord[], filters?: any, votes?: any[]): PollRecord[] {
    let result = [...polls];
    if (filters?.category && filters.category !== "All") {
      result = result.filter(p => p.category === filters.category);
    }
    if (filters?.status && filters.status !== "All") {
      result = result.filter(p => p.status === filters.status);
    }
    if (filters?.featured !== undefined) {
      result = result.filter(p => p.featured === filters.featured);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(p => p.question.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q));
    }

    // Attach user votes if userId provided
    if (filters?.userId && votes) {
      result = result.map(p => {
        const uVotes = votes.filter(v => v.poll_id === p.id && v.user_id === filters.userId).map(v => v.option_id);
        return { ...p, user_votes: uVotes };
      });
    }

    return result;
  }

  /**
   * Get single poll by ID or Slug
   */
  static async getPollById(idOrSlug: string, userId?: string): Promise<PollRecord | null> {
    const list = await this.getAllPolls({ userId });
    const match = list.find(p => {
      if (p.id === idOrSlug) return true;
      if ((p as any).slug === idOrSlug) return true;
      const slugified = p.question
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .substring(0, 70);
      return slugified === idOrSlug;
    });
    return match || null;
  }

  /**
   * Get featured poll for a specific category or global
   */
  static async getFeaturedPoll(category?: string, userId?: string): Promise<PollRecord | null> {
    const list = await this.getAllPolls({ category, featured: true, status: "Published", userId });
    if (list.length > 0) return list[0];
    
    // Fallback: get latest published poll in category
    const publishedList = await this.getAllPolls({ category, status: "Published", userId });
    return publishedList.length > 0 ? publishedList[0] : null;
  }

  /**
   * Vote on a poll
   */
  static async castVote(pollId: string, optionIds: string[], userId: string): Promise<{ success: boolean; poll?: PollRecord; message?: string }> {
    if (!userId) {
      return { success: false, message: "Authentication required to cast a vote." };
    }

    if (!supabase) {
      return this.castVoteFallback(pollId, optionIds, userId);
    }

    try {
      // Check poll rules
      const { data: poll, error: pollErr } = await supabase.from("polls").select("*").eq("id", pollId).single();
      if (pollErr || !poll) {
        return this.castVoteFallback(pollId, optionIds, userId);
      }

      if (poll.status !== "Published") {
        return { success: false, message: "This poll is not active or has been archived." };
      }

      if (poll.end_date && new Date(poll.end_date) < new Date()) {
        return { success: false, message: "This poll has ended." };
      }

      if (!poll.allow_multiple && optionIds.length > 1) {
        return { success: false, message: "Single choice poll only allows selecting 1 option." };
      }

      // Check existing votes by this user
      const { data: existingVotes } = await supabase
        .from("poll_votes")
        .select("id, option_id")
        .eq("poll_id", pollId)
        .eq("user_id", userId);

      const hasVotedBefore = existingVotes && existingVotes.length > 0;

      if (hasVotedBefore && !poll.allow_vote_edit) {
        return { success: false, message: "Vote editing is disabled for this poll. You have already voted." };
      }

      // If updating vote, delete previous votes first
      if (hasVotedBefore) {
        for (const oldVote of existingVotes) {
          await supabase.from("poll_votes").delete().eq("id", oldVote.id);
          // Decrement old option vote_count
          const { data: opt } = await supabase.from("poll_options").select("vote_count").eq("id", oldVote.option_id).single();
          if (opt && opt.vote_count > 0) {
            await supabase.from("poll_options").update({ vote_count: opt.vote_count - 1 }).eq("id", oldVote.option_id);
          }
        }
      }

      // Insert new votes
      for (const optId of optionIds) {
        await supabase.from("poll_votes").insert({
          poll_id: pollId,
          option_id: optId,
          user_id: userId
        });

        // Increment option vote_count
        const { data: opt } = await supabase.from("poll_options").select("vote_count").eq("id", optId).single();
        const currentCount = opt ? opt.vote_count : 0;
        await supabase.from("poll_options").update({ vote_count: currentCount + 1 }).eq("id", optId);
      }

      // Recalculate total votes for poll
      const { data: allVotes } = await supabase.from("poll_votes").select("user_id").eq("poll_id", pollId);
      const uniqueVoters = new Set(allVotes?.map(v => v.user_id) || []).size;
      await supabase.from("polls").update({ total_votes: uniqueVoters, updated_at: new Date().toISOString() }).eq("id", pollId);

      const updatedPoll = await this.getPollById(pollId, userId);
      return { success: true, poll: updatedPoll || undefined };
    } catch (err: any) {
      logger.error("Error casting vote via Supabase, trying fallback:", err);
      return this.castVoteFallback(pollId, optionIds, userId);
    }
  }

  private static async castVoteFallback(pollId: string, optionIds: string[], userId: string): Promise<{ success: boolean; poll?: PollRecord; message?: string }> {
    const state = await getFallbackState();
    const pollIndex = state.polls.findIndex(p => p.id === pollId);
    if (pollIndex === -1) {
      return { success: false, message: "Poll not found." };
    }

    const poll = state.polls[pollIndex];
    if (poll.status !== "Published") {
      return { success: false, message: "Poll is not active." };
    }

    // Filter existing votes
    const userVotes = state.votes.filter(v => v.poll_id === pollId && v.user_id === userId);
    if (userVotes.length > 0 && !poll.allow_vote_edit) {
      return { success: false, message: "You have already voted and editing is disabled." };
    }

    // Remove old votes from fallback state
    state.votes = state.votes.filter(v => !(v.poll_id === pollId && v.user_id === userId));

    // Add new votes
    optionIds.forEach(optId => {
      state.votes.push({
        id: `vote-${Date.now()}-${Math.random()}`,
        poll_id: pollId,
        option_id: optId,
        user_id: userId,
        voted_at: new Date().toISOString()
      });
    });

    // Recalculate option vote counts & total votes
    poll.options?.forEach(opt => {
      const cnt = state.votes.filter(v => v.poll_id === pollId && v.option_id === opt.id).length;
      opt.vote_count = cnt;
    });

    const uniqueVoters = new Set(state.votes.filter(v => v.poll_id === pollId).map(v => v.user_id)).size;
    poll.total_votes = Math.max(uniqueVoters, poll.options?.reduce((acc, o) => acc + o.vote_count, 0) || 0);
    poll.updated_at = new Date().toISOString();

    state.polls[pollIndex] = poll;
    await saveFallbackState(state);

    poll.user_votes = optionIds;
    return { success: true, poll };
  }

  /**
   * Create a new poll with options
   */
  static async createPoll(pollData: Partial<PollRecord>, optionsList: string[], createdBy: string = "Admin"): Promise<PollRecord> {
    const newPollId = `poll-${Date.now()}`;
    const now = new Date().toISOString();

    const newPoll: PollRecord = {
      id: newPollId,
      question: pollData.question || "Untitled Poll Question",
      description: pollData.description || "",
      category: pollData.category || "General",
      allow_multiple: pollData.allow_multiple ?? false,
      show_results_before_vote: pollData.show_results_before_vote ?? false,
      allow_vote_edit: pollData.allow_vote_edit ?? true,
      require_login: true,
      featured: pollData.featured ?? false,
      status: pollData.status || "Published",
      priority: pollData.priority || "Medium",
      target_audience: pollData.target_audience || "Everyone",
      image_url: pollData.image_url || "",
      start_date: pollData.start_date || now,
      end_date: pollData.end_date || undefined,
      total_votes: 0,
      created_by: createdBy,
      created_at: now,
      updated_at: now,
      options: optionsList.map((txt, idx) => ({
        id: `opt-${Date.now()}-${idx}`,
        poll_id: newPollId,
        option_text: txt,
        display_order: idx + 1,
        vote_count: 0
      }))
    };

    if (supabase) {
      try {
        const { data: createdPoll, error: pErr } = await supabase.from("polls").insert({
          question: newPoll.question,
          description: newPoll.description,
          category: newPoll.category,
          allow_multiple: newPoll.allow_multiple,
          show_results_before_vote: newPoll.show_results_before_vote,
          allow_vote_edit: newPoll.allow_vote_edit,
          require_login: true,
          featured: newPoll.featured,
          status: newPoll.status,
          priority: newPoll.priority,
          target_audience: newPoll.target_audience,
          image_url: newPoll.image_url,
          start_date: newPoll.start_date,
          end_date: newPoll.end_date || null,
          total_votes: 0,
          created_by: createdBy
        }).select().single();

        if (createdPoll) {
          const optInserts = optionsList.map((txt, idx) => ({
            poll_id: createdPoll.id,
            option_text: txt,
            display_order: idx + 1,
            vote_count: 0
          }));
          await supabase.from("poll_options").insert(optInserts);
          const full = await this.getPollById(createdPoll.id);
          if (full) return full;
        }
      } catch (err) {
        logger.error("Supabase poll creation error, using fallback state:", err);
      }
    }

    // Fallback store
    const state = await getFallbackState();
    state.polls.unshift(newPoll);
    await saveFallbackState(state);
    return newPoll;
  }

  /**
   * Update an existing poll and options
   */
  static async updatePoll(pollId: string, pollData: Partial<PollRecord>, optionsList?: { id?: string; option_text: string }[]): Promise<PollRecord | null> {
    const now = new Date().toISOString();

    if (supabase) {
      try {
        await supabase.from("polls").update({
          question: pollData.question,
          description: pollData.description,
          category: pollData.category,
          allow_multiple: pollData.allow_multiple,
          show_results_before_vote: pollData.show_results_before_vote,
          allow_vote_edit: pollData.allow_vote_edit,
          featured: pollData.featured,
          status: pollData.status,
          priority: pollData.priority,
          target_audience: pollData.target_audience,
          image_url: pollData.image_url,
          start_date: pollData.start_date,
          end_date: pollData.end_date || null,
          updated_at: now
        }).eq("id", pollId);

        if (optionsList && optionsList.length > 0) {
          // Delete old options and recreate for clean display_order
          await supabase.from("poll_options").delete().eq("poll_id", pollId);
          const optInserts = optionsList.map((opt, idx) => ({
            poll_id: pollId,
            option_text: opt.option_text,
            display_order: idx + 1,
            vote_count: 0
          }));
          await supabase.from("poll_options").insert(optInserts);
        }

        return await this.getPollById(pollId);
      } catch (err) {
        logger.error("Supabase update poll error, using fallback state:", err);
      }
    }

    const state = await getFallbackState();
    const idx = state.polls.findIndex(p => p.id === pollId);
    if (idx !== -1) {
      const updated = {
        ...state.polls[idx],
        ...pollData,
        updated_at: now
      };
      if (optionsList) {
        updated.options = optionsList.map((opt, i) => ({
          id: opt.id || `opt-${Date.now()}-${i}`,
          poll_id: pollId,
          option_text: opt.option_text,
          display_order: i + 1,
          vote_count: 0
        }));
      }
      state.polls[idx] = updated;
      await saveFallbackState(state);
      return updated;
    }
    return null;
  }

  /**
   * Duplicate a poll
   */
  static async duplicatePoll(pollId: string): Promise<PollRecord | null> {
    const original = await this.getPollById(pollId);
    if (!original) return null;

    const dupData: Partial<PollRecord> = {
      ...original,
      question: `${original.question} (Copy)`,
      total_votes: 0,
      featured: false,
      status: "Draft"
    };

    const optTexts = original.options?.map(o => o.option_text) || ["Option 1", "Option 2"];
    return this.createPoll(dupData, optTexts, original.created_by || "Admin");
  }

  /**
   * Archive poll
   */
  static async archivePoll(pollId: string): Promise<boolean> {
    const updated = await this.updatePoll(pollId, { status: "Archived" });
    return !!updated;
  }

  /**
   * Delete poll permanently
   */
  static async deletePoll(pollId: string): Promise<boolean> {
    if (supabase) {
      try {
        await supabase.from("polls").delete().eq("id", pollId);
        return true;
      } catch (err) {
        logger.error("Error deleting poll from Supabase, trying fallback:", err);
      }
    }

    const state = await getFallbackState();
    state.polls = state.polls.filter(p => p.id !== pollId);
    state.votes = state.votes.filter(v => v.poll_id !== pollId);
    await saveFallbackState(state);
    return true;
  }

  /**
   * Generate Analytics Dashboard Data
   */
  static async getAnalytics(): Promise<any> {
    const allPolls = await this.getAllPolls();

    const totalPolls = allPolls.length;
    const activePolls = allPolls.filter(p => p.status === "Published").length;
    const totalVotes = allPolls.reduce((acc, p) => acc + (p.total_votes || 0), 0);
    const avgParticipation = totalPolls > 0 ? Math.round(totalVotes / totalPolls) : 0;

    // Most Active Poll
    const sorted = [...allPolls].sort((a, b) => (b.total_votes || 0) - (a.total_votes || 0));
    const mostActive = sorted[0] ? {
      id: sorted[0].id,
      question: sorted[0].question,
      total_votes: sorted[0].total_votes
    } : undefined;

    // Most Selected Option
    let topOption: any = undefined;
    let maxVotes = -1;
    allPolls.forEach(p => {
      p.options?.forEach(opt => {
        if (opt.vote_count > maxVotes) {
          maxVotes = opt.vote_count;
          topOption = {
            pollQuestion: p.question,
            optionText: opt.option_text,
            voteCount: opt.vote_count
          };
        }
      });
    });

    // Category breakdown
    const categoryBreakdown: Record<string, number> = {};
    allPolls.forEach(p => {
      categoryBreakdown[p.category] = (categoryBreakdown[p.category] || 0) + 1;
    });

    // Voting trend (mock/calculated timeline)
    const votingTrend = [
      { date: "Day 1", votes: Math.round(totalVotes * 0.15) },
      { date: "Day 2", votes: Math.round(totalVotes * 0.25) },
      { date: "Day 3", votes: Math.round(totalVotes * 0.20) },
      { date: "Day 4", votes: Math.round(totalVotes * 0.22) },
      { date: "Today", votes: Math.round(totalVotes * 0.18) }
    ];

    return {
      totalPolls,
      activePolls,
      totalVotes,
      avgParticipation,
      mostActivePoll: mostActive,
      mostSelectedOption: topOption,
      categoryBreakdown,
      votingTrend
    };
  }
}
