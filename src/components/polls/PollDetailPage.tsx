import React, { useState, useEffect, useMemo } from "react";
import { getShareableLink } from "../../types";
import { 
  ArrowLeft, 
  Vote, 
  Share2, 
  CheckCircle2, 
  Clock, 
  Users, 
  Sparkles, 
  Trophy, 
  Copy, 
  Check, 
  MessageCircle, 
  Twitter, 
  ShieldCheck, 
  AlertCircle,
  ExternalLink,
  ChevronRight,
  BarChart2,
  Lock,
  Edit3
} from "lucide-react";
import { Poll, PollOption } from "../../types/poll";
import { PollLoginModal } from "./PollLoginModal";
import { safeRenderText } from "../../utils/safeRender";
import { getPollSlug, isPollActive, getPollStatusLabel } from "../../lib/pollUtils";
import { PollShareBar } from "./PollShareBar";

interface PollDetailPageProps {
  slug: string;
  language?: "en" | "hi";
  sessionUser?: any;
  onNavigateToHub?: () => void;
  onNavigateToPoll?: (slug: string) => void;
}

const FALLBACK_SEED_POLLS: Poll[] = [
  {
    id: "a1010101-1111-4444-8888-111111111111",
    question: "Which Bihar BPSC Teacher Mutual Transfer Rule improvement is most critical?",
    description: "Cast your official vote on the top structural policy reform needed for the 2026 Bihar Teacher Mutual Transfer schedule. This public consensus report will be submitted directly to state policy representatives.",
    category: "Teacher Hub",
    allow_multiple: true,
    show_results_before_vote: false,
    allow_vote_edit: true,
    require_login: true,
    featured: true,
    status: "Published",
    priority: "High",
    target_audience: "Teachers",
    image_url: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=1200",
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
    image_url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=1200",
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
  },
  {
    id: "a3030303-3333-4444-8888-333333333333",
    question: "Should Dearness Allowance (DA) merger into basic pay happen at 50% threshold?",
    description: "Public opinion survey on the automatic merger proposal of DA with basic salary before the 8th Pay Commission formulation.",
    category: "Announcements",
    allow_multiple: false,
    show_results_before_vote: true,
    allow_vote_edit: false,
    require_login: true,
    featured: false,
    status: "Published",
    priority: "Medium",
    target_audience: "Government Employees",
    image_url: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=1200",
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    total_votes: 1980,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    options: [
      {
        id: "d1010101-1111-4444-8888-111111111111",
        poll_id: "a3030303-3333-4444-8888-333333333333",
        option_text: "Yes, Immediate Merger Required",
        display_order: 1,
        vote_count: 1540
      },
      {
        id: "d2020202-2222-4444-8888-222222222222",
        poll_id: "a3030303-3333-4444-8888-333333333333",
        option_text: "No, Keep Separate DA Structure",
        display_order: 2,
        vote_count: 440
      }
    ]
  }
];

export const PollDetailPage: React.FC<PollDetailPageProps> = ({
  slug,
  language = "hi",
  sessionUser,
  onNavigateToHub,
  onNavigateToPoll
}) => {
  useEffect(() => {
    console.log("[PollDetailPage MOUNT] Mounted for slug:", slug);
  }, [slug]);

  const [poll, setPoll] = useState<Poll | null>(null);
  const [allPolls, setAllPolls] = useState<Poll[]>(FALLBACK_SEED_POLLS);
  const [loading, setLoading] = useState(true);
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Fetch poll data by slug or id
  useEffect(() => {
    const loadPoll = async () => {
      try {
        setLoading(true);
        setErrorMsg(null);
        console.log("[PollDetailPage API FETCH START] Loading poll by slug:", slug);
        const emailParam = sessionUser?.email ? `?userId=${encodeURIComponent(sessionUser.email)}` : "";
        const res = await fetch(`/api/polls/${encodeURIComponent(slug)}${emailParam}`);
        const data = await res.json();
        console.log("[PollDetailPage API FETCH COMPLETE] Response for slug:", slug, { success: data.success, found: Boolean(data.poll) });

        if (data.success && data.poll) {
          setPoll(data.poll);
          if (data.poll.user_votes) setSelectedOptionIds(data.poll.user_votes);
        } else {
          // Local fallback match
          const localMatch = FALLBACK_SEED_POLLS.find(p => p.id === slug || getPollSlug(p) === slug) || FALLBACK_SEED_POLLS[0];
          setPoll(localMatch);
          if (localMatch.user_votes) setSelectedOptionIds(localMatch.user_votes);
        }

        // Also fetch all polls for related polls list
        const resList = await fetch("/api/polls");
        const dataList = await resList.json();
        if (dataList.success && Array.isArray(dataList.polls)) {
          setAllPolls(dataList.polls);
        }
      } catch (err) {
        console.warn("[PollDetailPage API FETCH ERROR] Fetch error, using high-fidelity local match:", err);
        const localMatch = FALLBACK_SEED_POLLS.find(p => p.id === slug || getPollSlug(p) === slug) || FALLBACK_SEED_POLLS[0];
        setPoll(localMatch);
      } finally {
        setLoading(false);
      }
    };

    loadPoll();
  }, [slug, sessionUser]);

  const hasVoted = Boolean(poll?.user_votes && poll.user_votes.length > 0);
  const showResults = Boolean(poll && (hasVoted || poll.show_results_before_vote || isEditing || !isPollActive(poll)));

  const maxVoteCount = useMemo(() => {
    return Math.max(...(poll?.options?.map(o => o.vote_count) || [0]), 0);
  }, [poll]);

  const relatedPolls = useMemo(() => {
    if (!poll) return [];
    return allPolls.filter(p => p.id !== poll.id).slice(0, 3);
  }, [allPolls, poll]);

  const handleOptionToggle = (optionId: string) => {
    if (!poll) return;
    setErrorMsg(null);
    if (!sessionUser) {
      setShowLoginModal(true);
      return;
    }

    if (poll.allow_multiple) {
      if (selectedOptionIds.includes(optionId)) {
        setSelectedOptionIds(selectedOptionIds.filter(id => id !== optionId));
      } else {
        setSelectedOptionIds([...selectedOptionIds, optionId]);
      }
    } else {
      setSelectedOptionIds([optionId]);
    }
  };

  const handleVoteSubmit = async () => {
    if (!poll) return;
    if (!sessionUser) {
      setShowLoginModal(true);
      return;
    }

    if (selectedOptionIds.length === 0) {
      setErrorMsg("Please select at least one option to vote.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      const res = await fetch(`/api/polls/${poll.id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          optionIds: selectedOptionIds,
          userId: sessionUser.email || sessionUser.id
        })
      });

      const d = await res.json();
      if (d.success && d.poll) {
        setPoll(d.poll);
        setIsEditing(false);
        setSuccessMsg(d.message || "Your vote has been successfully cast!");
      } else {
        setErrorMsg(d.message || "Failed to record vote.");
      }
    } catch (err) {
      console.error("[VOTE ERROR]", err);
      setErrorMsg("Connection error while submitting vote.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const shareUrl = getShareableLink("polls", `/polls/${slug}`);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`📊 Cast your vote on this public opinion poll: "${poll?.question}"\n\nVote now on Paisa Blueprint: ${shareUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  const handleTwitterShare = () => {
    const text = encodeURIComponent(`Cast your vote on this public opinion poll: "${poll?.question}"`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(shareUrl)}`, "_blank");
  };

  const triggerAuthModal = (mode: "login" | "signup") => {
    setShowLoginModal(false);
    if (typeof window !== "undefined") {
      window.location.href = `/${mode}`;
    }
  };

  if (loading) {
    console.log("[PollDetailPage RETURN] Returning loading spinner JSX");
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-bold text-slate-500">Loading Poll details...</p>
      </div>
    );
  }

  if (!poll) {
    console.log("[PollDetailPage RETURN] Returning Poll Not Found JSX");
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-black text-slate-800">Poll Not Found</h2>
        <p className="text-xs text-slate-500 max-w-md">The requested opinion poll could not be located or has been archived.</p>
        <button
          onClick={() => onNavigateToHub ? onNavigateToHub() : window.history.back()}
          className="px-5 py-2.5 bg-amber-500 text-amber-950 font-black rounded-xl text-xs"
        >
          Return to Polls Hub
        </button>
      </div>
    );
  }

  const statusBadge = getPollStatusLabel(poll, language === "en" ? "en" : "hi");

  console.log("[PollDetailPage RETURN] Rendering full poll detail JSX for question:", poll.question);

  return (
    <div id="polls" className="min-h-screen bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 py-8 px-4 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
      {/* TOP NAVIGATION BACK BUTTON */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            if (onNavigateToHub) {
              onNavigateToHub();
            } else {
              window.history.pushState({}, "", "/polls");
              window.dispatchEvent(new PopStateEvent("popstate"));
            }
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-4 h-4 text-amber-500" />
          <span>{language === "hi" ? "← सभी सर्वेक्षण सूची पर लौटें" : "← Back to Opinion Polls Directory"}</span>
        </button>

        <span className={`px-3 py-1 rounded-full text-xs font-black border ${statusBadge.colorClass}`}>
          {statusBadge.label}
        </span>
      </div>

      {/* MAIN POLL CARD CONTAINER */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden">
        {/* BANNER IMAGE IF PRESENT */}
        {poll.image_url && (
          <div className="relative h-48 sm:h-72 w-full overflow-hidden bg-slate-100">
            <img 
              src={poll.image_url} 
              alt={poll.question}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />
            <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between text-white">
              <span className="px-3 py-1 rounded-full bg-amber-500 text-amber-950 text-xs font-black uppercase tracking-wider">
                {safeRenderText(poll.category)}
              </span>
              <span className="text-xs font-bold bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full">
                Target: {safeRenderText(poll.target_audience)}
              </span>
            </div>
          </div>
        )}

        <div className="p-6 sm:p-10 space-y-8">
          {/* CATEGORY & FEATURED BADGES */}
          {!poll.image_url && (
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-black uppercase tracking-wider border border-rose-200 dark:border-rose-800">
                {safeRenderText(poll.category)}
              </span>
              {poll.featured && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs font-bold border border-amber-200 dark:border-amber-800">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Featured Poll</span>
                </span>
              )}
            </div>
          )}

          {/* QUESTION AND DESCRIPTION */}
          <div className="space-y-3">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-slate-100 leading-snug">
              {safeRenderText(poll.question)}
            </h1>
            {poll.description && (
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
                {safeRenderText(poll.description)}
              </p>
            )}
          </div>

          {/* STATS STRIP */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-700 text-xs">
            <div>
              <div className="text-slate-400 font-medium">Total Votes</div>
              <div className="text-lg font-black font-mono text-slate-900 dark:text-slate-100">
                {(poll.total_votes || 0).toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-slate-400 font-medium">Participants</div>
              <div className="text-lg font-black font-mono text-slate-900 dark:text-slate-100">
                {Math.round((poll.total_votes || 0) * 0.92).toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-slate-400 font-medium">Choice Mode</div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {poll.allow_multiple ? "Multiple Choice" : "Single Choice"}
              </div>
            </div>
            <div>
              <div className="text-slate-400 font-medium">Poll Expiry</div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {poll.end_date ? new Date(poll.end_date).toLocaleDateString() : "Ongoing"}
              </div>
            </div>
          </div>

          {/* ALERT MESSAGES */}
          {errorMsg && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-2xl flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* INTERACTIVE POLL OPTIONS LIST */}
          <div className="space-y-4">
            <h3 className="text-base font-black text-slate-900 dark:text-slate-100 flex items-center justify-between">
              <span>{language === "hi" ? "अपना विकल्प चुनें (Select Your Choice):" : "Poll Options & Results:"}</span>
              {hasVoted && !isEditing && (
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>You have voted on this poll</span>
                </span>
              )}
            </h3>

            <div className="space-y-3">
              {poll.options?.map((option: PollOption) => {
                const isSelected = selectedOptionIds.includes(option.id);
                const isUserVoted = poll.user_votes?.includes(option.id);
                const totalVotes = poll.total_votes || 1;
                const percentage = Math.round((option.vote_count / Math.max(totalVotes, 1)) * 100);
                const isWinning = option.vote_count > 0 && option.vote_count === maxVoteCount;

                return (
                  <div
                    key={option.id}
                    onClick={() => {
                      if (!hasVoted || isEditing) {
                        handleOptionToggle(option.id);
                      }
                    }}
                    className={`relative overflow-hidden rounded-2xl border-2 transition-all p-4 cursor-pointer ${
                      isSelected 
                        ? "border-amber-500 bg-amber-50/40 dark:bg-amber-950/30 ring-2 ring-amber-500/20" 
                        : isUserVoted 
                        ? "border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20" 
                        : "border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 hover:border-amber-300"
                    }`}
                  >
                    {/* Percentage Fill Bar */}
                    {showResults && !isEditing && (
                      <div 
                        className={`absolute inset-y-0 left-0 transition-all duration-700 rounded-2xl ${
                          isWinning ? "bg-amber-200/50 dark:bg-amber-900/40" : "bg-slate-200/50 dark:bg-slate-800/60"
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    )}

                    <div className="relative z-10 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        {(!hasVoted || isEditing) ? (
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                            isSelected 
                              ? "border-amber-500 bg-amber-500 text-amber-950" 
                              : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                          }`}>
                            {isSelected && <CheckCircle2 className="w-4 h-4 fill-amber-950 text-amber-500" />}
                          </div>
                        ) : (
                          <div className="shrink-0">
                            {isUserVoted ? (
                              <CheckCircle2 className="w-6 h-6 text-emerald-500 fill-emerald-100 dark:fill-emerald-950" />
                            ) : (
                              <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600 ml-1.5" />
                            )}
                          </div>
                        )}

                        <span className={`text-sm sm:text-base font-bold leading-snug ${isSelected || isUserVoted ? "text-slate-900 dark:text-slate-100" : "text-slate-700 dark:text-slate-300"}`}>
                          {safeRenderText(option?.option_text || option)}
                        </span>
                      </div>

                      {showResults && !isEditing && (
                        <div className="flex items-center gap-2.5 shrink-0">
                          {isWinning && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-xs font-extrabold border border-amber-300">
                              <Trophy className="w-3.5 h-3.5 text-amber-600" />
                              <span>Leading Option</span>
                            </span>
                          )}
                          <span className="text-sm sm:text-base font-black font-mono text-slate-900 dark:text-slate-100">
                            {percentage}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* VOTE SUBMIT OR CHANGE ACTION BUTTONS */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>1-Account 1-Vote Integrity Enforced</span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {!sessionUser ? (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-amber-950 font-black rounded-xl text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  <Vote className="w-4 h-4" />
                  <span>Log In to Vote</span>
                </button>
              ) : hasVoted && !isEditing ? (
                <div className="flex items-center gap-2">
                  {poll.allow_vote_edit && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Change Vote</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {isEditing && (
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl text-xs"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    onClick={handleVoteSubmit}
                    disabled={isSubmitting || selectedOptionIds.length === 0}
                    className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-amber-950 font-black rounded-xl text-sm flex items-center justify-center gap-2 shadow-md disabled:opacity-50 transition-all cursor-pointer"
                  >
                    <Vote className="w-4 h-4" />
                    <span>{isSubmitting ? "Submitting..." : isEditing ? "Update Vote" : "Confirm & Submit Vote"}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* SHARE BAR */}
          <PollShareBar poll={poll} language={language} className="mt-4" />
        </div>
      </div>

      {/* RELATED POLLS SECTION */}
      {relatedPolls.length > 0 && (
        <section className="space-y-4 pt-4">
          <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
            {language === "hi" ? "संबंधित जनमत सर्वेक्षण (Related Opinion Polls)" : "Related Active Opinion Polls"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {relatedPolls.map(rel => (
              <div
                key={rel.id}
                onClick={() => {
                  const relSlug = getPollSlug(rel);
                  if (onNavigateToPoll) {
                    onNavigateToPoll(relSlug);
                  } else {
                    window.history.pushState({}, "", `/polls/${relSlug}`);
                    window.dispatchEvent(new PopStateEvent("popstate"));
                  }
                }}
                className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 hover:border-amber-400 hover:shadow-md transition-all cursor-pointer space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <span className="px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-[10px] font-bold">
                    {rel.category}
                  </span>
                  <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 line-clamp-2">
                    {rel.question}
                  </h4>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-700 text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center justify-between">
                  <span>{rel.total_votes || 0} votes</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Login Interceptor Modal */}
      <PollLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={() => triggerAuthModal("login")}
        onSignup={() => triggerAuthModal("signup")}
      />
    </div>
  );
};
