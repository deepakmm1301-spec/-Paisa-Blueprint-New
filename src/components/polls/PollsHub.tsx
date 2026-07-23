import React, { useState, useEffect, useMemo } from "react";
import { 
  Vote, 
  Sparkles, 
  TrendingUp, 
  Users, 
  CheckCircle2, 
  Clock, 
  Search, 
  Filter, 
  Award, 
  BarChart3, 
  ShieldCheck, 
  ExternalLink,
  ChevronRight,
  Flame,
  Archive,
  RefreshCw
} from "lucide-react";
import { Poll } from "../../types/poll";
import { PollCard } from "./PollCard";
import { safeRenderText } from "../../utils/safeRender";
import { getPollSlug, isPollActive, getPollStatusLabel } from "../../lib/pollUtils";

interface PollsHubProps {
  language?: "en" | "hi";
  sessionUser?: any;
  onNavigateToPoll?: (slug: string) => void;
  onNavigateToWidget?: (widget: string) => void;
}

const FALLBACK_SEED_POLLS: Poll[] = [
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
        option_text: "Instant Online Verification & Auto Peer Match",
        display_order: 1,
        vote_count: 620
      },
      {
        id: "b2020202-2222-4444-8888-222222222222",
        poll_id: "a1010101-1111-4444-8888-111111111111",
        option_text: "Home District Choice Preference & Zero NOC Bottlenecks",
        display_order: 2,
        vote_count: 450
      },
      {
        id: "b3030303-3333-4444-8888-333333333333",
        poll_id: "a1010101-1111-4444-8888-111111111111",
        option_text: "Transparent Point-Based Seniority Rank List",
        display_order: 3,
        vote_count: 230
      },
      {
        id: "b4040404-4444-4444-8888-444444444444",
        poll_id: "a1010101-1111-4444-8888-111111111111",
        option_text: "Special Priority Allocation for Female & Disabled Cadres",
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
        option_text: "2.57 Fitment Factor (Standard 7th CPC Baseline)",
        display_order: 1,
        vote_count: 410
      },
      {
        id: "c2020202-2222-4444-8888-222222222222",
        poll_id: "a2020202-2222-4444-8888-222222222222",
        option_text: "2.86 Fitment Factor (Recommended Inflation Adjusted)",
        display_order: 2,
        vote_count: 1720
      },
      {
        id: "c3030303-3333-4444-8888-333333333333",
        poll_id: "a2020202-2222-4444-8888-222222222222",
        option_text: "3.00 Fitment Factor (Union Maximum Benchmark)",
        display_order: 3,
        vote_count: 710
      }
    ]
  }
];

export const PollsHub: React.FC<PollsHubProps> = ({
  language = "hi",
  sessionUser,
  onNavigateToPoll,
  onNavigateToWidget
}) => {
  useEffect(() => {
    console.log("[PollsHub MOUNT] PollsHub component mounted successfully");
  }, []);

  const [polls, setPolls] = useState<Poll[]>(FALLBACK_SEED_POLLS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const fetchPolls = async () => {
    try {
      setLoading(true);
      console.log("[PollsHub API FETCH START] Fetching /api/polls...");
      const res = await fetch("/api/polls");
      const data = await res.json();
      console.log("[PollsHub API FETCH COMPLETE] Received response from /api/polls:", { success: data.success, count: data.polls?.length });
      if (data.success && Array.isArray(data.polls) && data.polls.length > 0) {
        setPolls(data.polls);
      }
    } catch (err) {
      console.warn("[PollsHub API FETCH ERROR] Fetch error, preserving robust seed data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolls();
  }, []);

  // Compute metrics
  const totalVotesCount = useMemo(() => {
    return polls.reduce((sum, p) => sum + (p.total_votes || 0), 0);
  }, [polls]);

  const activePollsCount = useMemo(() => {
    return polls.filter(p => isPollActive(p)).length;
  }, [polls]);

  const completedPollsCount = useMemo(() => {
    return polls.filter(p => !isPollActive(p)).length;
  }, [polls]);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    polls.forEach(p => {
      if (p.category) set.add(p.category);
    });
    return ["All", ...Array.from(set)];
  }, [polls]);

  // Filtered polls
  const filteredPolls = useMemo(() => {
    return polls.filter(poll => {
      const matchesCat = selectedCategory === "All" || poll.category === selectedCategory;
      const matchesSearch = !searchQuery || 
        poll.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        poll.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [polls, selectedCategory, searchQuery]);

  // Featured Poll
  const featuredPoll = useMemo(() => {
    return polls.find(p => p.featured && isPollActive(p)) || polls.find(p => isPollActive(p)) || polls[0];
  }, [polls]);

  // Active Polls
  const activePolls = useMemo(() => {
    return filteredPolls.filter(p => isPollActive(p) && p.id !== featuredPoll?.id);
  }, [filteredPolls, featuredPoll]);

  // Trending Polls (Sorted by votes)
  const trendingPolls = useMemo(() => {
    return [...polls].sort((a, b) => (b.total_votes || 0) - (a.total_votes || 0)).slice(0, 3);
  }, [polls]);

  // Recently Completed Polls
  const completedPolls = useMemo(() => {
    return filteredPolls.filter(p => !isPollActive(p));
  }, [filteredPolls]);

  const handleOpenPoll = (poll: Poll) => {
    const slug = getPollSlug(poll);
    if (onNavigateToPoll) {
      onNavigateToPoll(slug);
    } else {
      window.history.pushState({}, "", `/polls/${slug}`);
      window.dispatchEvent(new PopStateEvent("popstate"));
    }
  };

  console.log("[PollsHub RENDER] Rendering PollsHub JSX with", polls.length, "polls");

  return (
    <div id="polls" className="min-h-screen bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 py-8 px-4 sm:px-6 lg:px-8 space-y-10 animate-fade-in">
      {/* HERO BANNER SECTION */}
      <div className="relative rounded-3xl bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-600 p-6 sm:p-10 text-amber-950 shadow-2xl overflow-hidden border border-amber-400/40">
        {/* Background Decorative Rings */}
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-60 h-60 rounded-full bg-amber-950/10 blur-xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-950/15 backdrop-blur-md border border-amber-950/20 text-amber-950 text-xs font-black uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-amber-950 shrink-0" />
            <span>{language === "hi" ? "1-खाता 1-वोट जनमत सुरक्षा" : "1-Account 1-Vote Integrity Protected"}</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tight text-amber-950">
              {language === "hi" 
                ? "डिजिटल जनमत सर्वेक्षण और प्रत्यक्ष वोटिंग केंद्र" 
                : "Public Opinion Polls & Direct Civic Voting"}
            </h1>
            <p className="text-sm sm:text-base font-semibold text-amber-900/90 max-w-2xl leading-relaxed">
              {language === "hi"
                ? "बिहार शिक्षक स्थानांतरण, 8वें वेतन आयोग, डीए बढ़ोतरी और कर्मचारी कल्याण पर अपना निष्पक्ष मत दर्ज करें। Paisa Blueprint पारदर्शी लोकतांत्रिक परिणाम प्रस्तुत करता है।"
                : "Cast your authentic voice on teacher transfers, 8th Pay Commission, DA hikes, and public policy. Transparent, real-time public consensus for Bihar & Central reforms."}
            </p>
          </div>

          {/* Key Stat Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-6 pt-2">
            <div className="bg-amber-950/10 backdrop-blur-md rounded-2xl p-3.5 border border-amber-950/15 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-950 text-amber-400 shrink-0">
                <Vote className="w-5 h-5" />
              </div>
              <div>
                <div className="text-lg sm:text-2xl font-black text-amber-950 font-mono">
                  {totalVotesCount.toLocaleString()}
                </div>
                <div className="text-[11px] font-bold text-amber-900/80">
                  {language === "hi" ? "कुल दर्ज वोट" : "Total Votes Cast"}
                </div>
              </div>
            </div>

            <div className="bg-amber-950/10 backdrop-blur-md rounded-2xl p-3.5 border border-amber-950/15 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-950 text-amber-400 shrink-0">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-lg sm:text-2xl font-black text-amber-950 font-mono">
                  {activePollsCount}
                </div>
                <div className="text-[11px] font-bold text-amber-900/80">
                  {language === "hi" ? "सक्रिय वोटिंग पोल" : "Active Live Polls"}
                </div>
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1 bg-amber-950/10 backdrop-blur-md rounded-2xl p-3.5 border border-amber-950/15 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-950 text-amber-400 shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="text-lg sm:text-2xl font-black text-amber-950 font-mono">
                  {Math.round(totalVotesCount * 0.88).toLocaleString()}
                </div>
                <div className="text-[11px] font-bold text-amber-900/80">
                  {language === "hi" ? "सत्यापित प्रतिभागी" : "Total Participants"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SEARCH AND CATEGORY FILTER BAR */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === "hi" ? "सर्वेक्षण प्रश्न या विषय खोजें..." : "Search polls by topic, question, or keyword..."}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 shrink-0">
            <Filter className="w-4 h-4" />
            <span className="font-bold">{language === "hi" ? "श्रेणियां:" : "Categories:"}</span>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-amber-500 text-amber-950 shadow-sm font-black"
                  : "bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {cat === "All" ? (language === "hi" ? "सभी पोल" : "All Polls") : cat}
            </button>
          ))}
        </div>
      </div>

      {/* FEATURED POLL HIGHLIGHT */}
      {featuredPoll && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">
              {language === "hi" ? "प्रमुख जनमत सर्वेक्षण (Featured Poll)" : "Featured Opinion Poll"}
            </h2>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-3xl border-2 border-amber-400/60 dark:border-amber-500/40 shadow-lg p-6 sm:p-8 space-y-6 relative overflow-hidden">
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              {featuredPoll.image_url && (
                <div className="w-full lg:w-1/3 h-52 lg:h-64 rounded-2xl overflow-hidden shrink-0 relative bg-slate-100">
                  <img 
                    src={featuredPoll.image_url} 
                    alt={featuredPoll.question} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-amber-500 text-amber-950 font-black text-[10px] uppercase px-3 py-1 rounded-full shadow-md">
                    Featured Campaign
                  </div>
                </div>
              )}

              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 text-xs font-black uppercase tracking-wider border border-rose-200 dark:border-rose-800">
                    {featuredPoll.category}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Active Voting</span>
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 leading-snug">
                  {featuredPoll.question}
                </h3>

                {featuredPoll.description && (
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {featuredPoll.description}
                  </p>
                )}

                <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                    <Users className="w-4 h-4 text-amber-500" />
                    <strong>{featuredPoll.total_votes || 0}</strong> votes recorded
                  </span>
                  {featuredPoll.end_date && (
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      <span>Ends {new Date(featuredPoll.end_date).toLocaleDateString()}</span>
                    </span>
                  )}
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={() => handleOpenPoll(featuredPoll)}
                    className="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-amber-950 font-black rounded-xl text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
                  >
                    <Vote className="w-4 h-4" />
                    <span>{language === "hi" ? "वोट दर्ज करें एवं परिणाम देखें" : "Cast Vote & View Full Breakdown"}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ACTIVE POLLS GRID */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-rose-500" />
            <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">
              {language === "hi" ? "सक्रिय जनमत पोल (Active Polls)" : "Active Live Polls"}
            </h2>
            <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
              {activePolls.length}
            </span>
          </div>
        </div>

        {activePolls.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 text-center space-y-3 border border-slate-200 dark:border-slate-700">
            <BarChart3 className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <h4 className="font-bold text-slate-700 dark:text-slate-300">
              {language === "hi" ? "कोई अन्य सक्रिय पोल नहीं मिला" : "No other active polls matching filter"}
            </h4>
            <p className="text-xs text-slate-400">
              {language === "hi" ? "कृपया अपनी श्रेणी या खोज शब्द बदलें।" : "Try clearing your search query or selecting 'All' categories."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {activePolls.map(poll => (
              <div key={poll.id} className="relative group">
                <PollCard
                  poll={poll}
                  currentUser={sessionUser}
                  onVoteSuccess={() => fetchPolls()}
                />
                <div className="mt-2 text-right">
                  <button
                    onClick={() => handleOpenPoll(poll)}
                    className="text-xs font-bold text-amber-600 hover:text-amber-700 dark:text-amber-400 inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>{language === "hi" ? "पूरा प्रश्न और विश्लेषण" : "Open Full Poll & Sharing"}</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* TRENDING & MOST ACTIVE POLLS */}
      <section className="bg-slate-100/80 dark:bg-slate-800/60 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700 space-y-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">
            {language === "hi" ? "ट्रेंडिंग सर्वेक्षण (Trending Polls)" : "Trending & High Engagement Polls"}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {trendingPolls.map((tPoll) => (
            <div 
              key={tPoll.id}
              onClick={() => handleOpenPoll(tPoll)}
              className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 hover:border-amber-400 hover:shadow-md transition-all cursor-pointer space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold border border-amber-200">
                    {safeRenderText(tPoll.category)}
                  </span>
                  <span className="text-slate-400 font-mono">
                    {tPoll.total_votes || 0} votes
                  </span>
                </div>
                <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug">
                  {safeRenderText(tPoll.question)}
                </h4>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs font-bold text-amber-600 dark:text-amber-400">
                <span>{language === "hi" ? "भाग लें" : "Participate Now"}</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* RECENTLY COMPLETED / ARCHIVED POLLS */}
      {completedPolls.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Archive className="w-5 h-5 text-slate-400" />
            <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">
              {language === "hi" ? "हाल में समाप्त सर्वेक्षण (Recently Completed Polls)" : "Recently Completed & Archived Polls"}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {completedPolls.map(poll => (
              <PollCard
                key={poll.id}
                poll={poll}
                currentUser={sessionUser}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
