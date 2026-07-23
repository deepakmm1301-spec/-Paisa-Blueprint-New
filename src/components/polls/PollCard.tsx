import React, { useState, useEffect } from "react";
import { 
  BarChart2, 
  CheckCircle2, 
  Clock, 
  Edit3, 
  Lock, 
  Sparkles, 
  Trophy, 
  Users, 
  Vote,
  AlertCircle
} from "lucide-react";
import { Poll, PollOption } from "../../types/poll";
import { PollLoginModal } from "./PollLoginModal";
import { safeRenderText } from "../../utils/safeRender";
import { PollShareBar } from "./PollShareBar";

interface PollCardProps {
  poll: Poll;
  currentUser?: any;
  onVoteSuccess?: (updatedPoll: Poll) => void;
  compact?: boolean;
  className?: string;
}

export const PollCard: React.FC<PollCardProps> = ({
  poll: initialPoll,
  currentUser,
  onVoteSuccess,
  compact = false,
  className = ""
}) => {
  const [poll, setPoll] = useState<Poll>(initialPoll);
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const getAuthenticatedUser = (userCandidate?: any) => {
    if (
      userCandidate &&
      userCandidate.email &&
      userCandidate.email.toLowerCase().trim() !== "guest@paisablueprint.in"
    ) {
      return userCandidate;
    }
    try {
      const saved = localStorage.getItem("paisa_active_session");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          parsed &&
          parsed.email &&
          parsed.email.toLowerCase().trim() !== "guest@paisablueprint.in"
        ) {
          return parsed;
        }
      }
    } catch {}
    return null;
  };

  const activeUser = getAuthenticatedUser(currentUser);

  useEffect(() => {
    setPoll(initialPoll);
    if (initialPoll.user_votes && initialPoll.user_votes.length > 0) {
      setSelectedOptionIds(initialPoll.user_votes);
    }
  }, [initialPoll]);

  const hasVoted = Boolean(poll.user_votes && poll.user_votes.length > 0);
  const showResults = hasVoted || poll.show_results_before_vote || isEditing;

  // Find max vote count for winning badge
  const maxVoteCount = Math.max(...(poll.options?.map(o => o.vote_count) || [0]), 0);

  const handleOptionToggle = (optionId: string) => {
    setErrorMsg(null);
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

  const handleVoteSubmit = async (overrideUser?: any) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    const userToUse = overrideUser || getAuthenticatedUser(currentUser);

    if (!userToUse) {
      setShowLoginModal(true);
      return;
    }

    if (selectedOptionIds.length === 0) {
      setErrorMsg("Please select at least one option to submit your vote.");
      return;
    }

    try {
      setIsSubmitting(true);

      const res = await fetch(`/api/polls/${poll.id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          optionIds: selectedOptionIds,
          userId: userToUse.email || userToUse.id
        })
      });

      const d = await res.json();

      if (res.ok && d.success && d.poll) {
        setPoll(d.poll);
        setIsEditing(false);
        setSuccessMsg("Vote counted successfully.");
        setTimeout(() => setSuccessMsg(null), 5000);
        if (onVoteSuccess) onVoteSuccess(d.poll);
      } else {
        if (d.requireLogin || res.status === 401 || d.code === "LOGIN_REQUIRED") {
          setShowLoginModal(true);
        } else {
          setErrorMsg(d.message || "Failed to record vote.");
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Network error while submitting vote.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerAuthModal = (mode: "login" | "signup") => {
    setShowLoginModal(false);
    window.dispatchEvent(
      new CustomEvent("paisa-trigger-auth", {
        detail: {
          feature: "Opinion Polls",
          onSuccess: (loggedUser: any) => {
            handleVoteSubmit(loggedUser);
          }
        }
      })
    );
  };

  return (
    <div className={`bg-white rounded-3xl border border-slate-150 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col ${className}`}>
      {/* Poll Image Banner if present */}
      {poll.image_url && !compact && (
        <div className="relative h-40 w-full overflow-hidden bg-slate-100">
          <img 
            src={poll.image_url} 
            alt={poll.question}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
            <span className="px-2.5 py-0.5 rounded-full bg-rose-500/90 backdrop-blur-xs text-[10px] font-extrabold uppercase tracking-wider">
              {safeRenderText(poll.category)}
            </span>
            <span className="text-[10px] font-bold bg-slate-900/60 backdrop-blur-xs px-2.5 py-0.5 rounded-full">
              {safeRenderText(poll.target_audience)}
            </span>
          </div>
        </div>
      )}

      <div className="p-5 sm:p-6 space-y-4 flex-1 flex flex-col justify-between">
        {/* Header Tags */}
        {(!poll.image_url || compact) && (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-150 text-rose-700 text-[10px] font-extrabold uppercase tracking-wider">
                {safeRenderText(poll.category)}
              </span>
              {poll.featured && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200">
                  <Sparkles className="w-3 h-3" />
                  <span>Featured Poll</span>
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              {poll.allow_multiple ? "Multiple Choice" : "Single Choice"}
            </span>
          </div>
        )}

        {/* Question & Description */}
        <div className="space-y-1.5">
          <h3 className={`font-black text-slate-900 leading-snug ${compact ? "text-base" : "text-lg"}`}>
            {safeRenderText(poll.question)}
          </h3>
          {poll.description && (
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
              {safeRenderText(poll.description)}
            </p>
          )}
        </div>

        {/* Status Banners */}
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-150 text-rose-800 text-xs font-bold rounded-xl flex items-center gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-150 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Poll Options List */}
        <div className="space-y-2.5 pt-1">
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
                className={`relative overflow-hidden rounded-2xl border transition-all cursor-pointer p-3.5 ${
                  isSelected 
                    ? "border-rose-500 bg-rose-50/30 ring-1 ring-rose-500" 
                    : isUserVoted 
                    ? "border-rose-300 bg-rose-50/20" 
                    : "border-slate-200 bg-slate-50/50 hover:bg-slate-100/80 hover:border-slate-300"
                }`}
              >
                {/* Animated Percentage Fill Bar */}
                {showResults && !isEditing && (
                  <div 
                    className={`absolute inset-y-0 left-0 transition-all duration-700 rounded-2xl ${
                      isWinning ? "bg-rose-100/80" : "bg-slate-200/50"
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                )}

                <div className="relative z-10 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {/* Checkbox / Radio Circle */}
                    {(!hasVoted || isEditing) ? (
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                        isSelected 
                          ? "border-rose-500 bg-rose-500 text-white" 
                          : "border-slate-300 bg-white"
                      }`}>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 fill-white text-rose-500" />}
                      </div>
                    ) : (
                      <div className="shrink-0">
                        {isUserVoted ? (
                          <CheckCircle2 className="w-5 h-5 text-rose-500 fill-rose-100" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-slate-300 ml-1.5" />
                        )}
                      </div>
                    )}

                    <span className={`text-xs font-bold leading-tight ${isSelected || isUserVoted ? "text-slate-900" : "text-slate-700"}`}>
                      {safeRenderText(option?.option_text || option)}
                    </span>
                  </div>

                  {/* Percentage & Winning Badge */}
                  {showResults && !isEditing && (
                    <div className="flex items-center gap-2 shrink-0">
                      {isWinning && (
                        <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-extrabold border border-amber-200">
                          <Trophy className="w-3 h-3 text-amber-600" />
                          <span>Leader</span>
                        </span>
                      )}
                      <span className="text-xs font-black font-mono text-slate-800">
                        {percentage}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Share Poll Bar */}
        <div className="pt-2">
          <PollShareBar poll={poll} compact={compact} showTitle={!compact} />
        </div>

        {/* Bottom Actions & Stats Bar */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-3 font-semibold text-[11px]">
            <span className="flex items-center gap-1 text-slate-600">
              <Users className="w-3.5 h-3.5 text-rose-500" />
              <strong className="text-slate-900">{poll.total_votes || 0}</strong> votes
            </span>
            {poll.end_date && (
              <span className="flex items-center gap-1 text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                <span>Ends {new Date(poll.end_date).toLocaleDateString()}</span>
              </span>
            )}
          </div>

          <div>
            {!activeUser && (!poll.user_votes || poll.user_votes.length === 0) ? (
              <button
                onClick={() => {
                  if (selectedOptionIds.length > 0) {
                    handleVoteSubmit();
                  } else {
                    setShowLoginModal(true);
                  }
                }}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
              >
                <Vote className="w-3.5 h-3.5" />
                <span>{selectedOptionIds.length > 0 ? "Submit Vote" : "Vote Now"}</span>
              </button>
            ) : hasVoted && !isEditing ? (
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-150 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  <span>Voted</span>
                </span>
                {poll.allow_vote_edit && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
                    title="Change your vote"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {isEditing && (
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-xs transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={handleVoteSubmit}
                  disabled={isSubmitting || selectedOptionIds.length === 0}
                  className="px-4 py-2 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                >
                  <Vote className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? "Submitting..." : isEditing ? "Update Vote" : "Submit Vote"}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

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
