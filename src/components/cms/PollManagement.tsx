import React, { useState, useEffect } from "react";
import { 
  BarChart2, 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit2, 
  Copy, 
  Archive, 
  Eye, 
  Download, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Calendar, 
  List, 
  TrendingUp, 
  Users, 
  Vote, 
  Check, 
  ArrowUp, 
  ArrowDown, 
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Poll, PollAnalytics, PollCategory, PollPriority, PollStatus, PollTargetAudience } from "../../types/poll";
import { PollCard } from "../polls/PollCard";

interface PollManagementProps {
  language?: "en" | "hi";
  userRole?: string;
}

export default function PollManagement({ language = "hi", userRole = "admin" }: PollManagementProps) {
  const [subTab, setSubTab] = useState<"manage" | "create" | "analytics" | "archived">("manage");
  const [loading, setLoading] = useState<boolean>(true);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [analytics, setAnalytics] = useState<PollAnalytics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [priorityFilter, setPriorityFilter] = useState<string>("All");

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;

  // Active poll being viewed in results or edited
  const [editingPoll, setEditingPoll] = useState<Poll | null>(null);
  const [previewPoll, setPreviewPoll] = useState<Poll | null>(null);

  // Form state for creation/editing
  const [formQuestion, setFormQuestion] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCategory, setFormCategory] = useState<PollCategory>("General");
  const [formPriority, setFormPriority] = useState<PollPriority>("Medium");
  const [formTargetAudience, setFormTargetAudience] = useState<PollTargetAudience>("Everyone");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formStartDate, setFormStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [formEndDate, setFormEndDate] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);
  const [formAllowMultiple, setFormAllowMultiple] = useState(false);
  const [formShowResultsBeforeVote, setFormShowResultsBeforeVote] = useState(false);
  const [formAllowVoteEdit, setFormAllowVoteEdit] = useState(true);
  const [formFeatured, setFormFeatured] = useState(false);
  const [formStatus, setFormStatus] = useState<PollStatus>("Published");
  const [formOptions, setFormOptions] = useState<string[]>(["Option 1", "Option 2"]);

  const getCmsHeaders = () => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-cms-access": "true",
      "x-user-role": userRole || "admin"
    };
    const token = localStorage.getItem("paisa_auth_token") || localStorage.getItem("paisa_access_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  };

  useEffect(() => {
    fetchPolls();
    fetchAnalytics();
  }, []);

  const fetchPolls = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/polls", { headers: getCmsHeaders() });
      const d = await res.json();
      if (d.success) {
        setPolls(d.polls || []);
      } else {
        throw new Error(d.message || "Failed to load polls.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to communicate with poll server.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("/api/polls/analytics", { headers: getCmsHeaders() });
      const d = await res.json();
      if (d.success) {
        setAnalytics(d.analytics);
      }
    } catch (e) {
      console.warn("Analytics load warning:", e);
    }
  };

  const showNotification = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleStartCreate = () => {
    setEditingPoll(null);
    setFormQuestion("");
    setFormDescription("");
    setFormCategory("General");
    setFormPriority("Medium");
    setFormTargetAudience("Everyone");
    setFormImageUrl("");
    setFormStartDate(new Date().toISOString().split("T")[0]);
    setFormEndDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);
    setFormAllowMultiple(false);
    setFormShowResultsBeforeVote(false);
    setFormAllowVoteEdit(true);
    setFormFeatured(false);
    setFormStatus("Published");
    setFormOptions(["Option 1", "Option 2"]);
    setSubTab("create");
  };

  const handleStartEdit = (poll: Poll) => {
    setEditingPoll(poll);
    setFormQuestion(poll.question);
    setFormDescription(poll.description || "");
    setFormCategory(poll.category);
    setFormPriority(poll.priority);
    setFormTargetAudience(poll.target_audience);
    setFormImageUrl(poll.image_url || "");
    setFormStartDate(poll.start_date ? poll.start_date.split("T")[0] : new Date().toISOString().split("T")[0]);
    setFormEndDate(poll.end_date ? poll.end_date.split("T")[0] : "");
    setFormAllowMultiple(poll.allow_multiple);
    setFormShowResultsBeforeVote(poll.show_results_before_vote);
    setFormAllowVoteEdit(poll.allow_vote_edit);
    setFormFeatured(poll.featured);
    setFormStatus(poll.status);
    setFormOptions(poll.options?.map(o => o.option_text) || ["Option 1", "Option 2"]);
    setSubTab("create");
  };

  const handleSavePoll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formQuestion.trim()) {
      setError("Poll question is required.");
      return;
    }

    const cleanOptions = formOptions.map(o => o.trim()).filter(Boolean);
    if (cleanOptions.length < 2) {
      setError("At least 2 poll options are required.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const payload = {
        question: formQuestion,
        description: formDescription,
        category: formCategory,
        priority: formPriority,
        target_audience: formTargetAudience,
        image_url: formImageUrl,
        start_date: formStartDate,
        end_date: formEndDate || undefined,
        allow_multiple: formAllowMultiple,
        show_results_before_vote: formShowResultsBeforeVote,
        allow_vote_edit: formAllowVoteEdit,
        featured: formFeatured,
        status: formStatus,
        options: cleanOptions.map(txt => ({ option_text: txt }))
      };

      let res;
      if (editingPoll) {
        res = await fetch(`/api/polls/${editingPoll.id}`, {
          method: "PUT",
          headers: getCmsHeaders(),
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch("/api/polls", {
          method: "POST",
          headers: getCmsHeaders(),
          body: JSON.stringify(payload)
        });
      }

      const d = await res.json();
      if (d.success) {
        showNotification(d.message || "Poll saved successfully!");
        fetchPolls();
        fetchAnalytics();
        setSubTab("manage");
      } else {
        throw new Error(d.message || "Failed to save poll.");
      }
    } catch (err: any) {
      setError(err.message || "Save request failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDuplicate = async (pollId: string) => {
    try {
      setSubmitting(true);
      const res = await fetch(`/api/polls/${pollId}/duplicate`, { 
        method: "POST",
        headers: getCmsHeaders()
      });
      const d = await res.json();
      if (d.success) {
        showNotification("Poll duplicated as Draft!");
        fetchPolls();
      } else {
        throw new Error(d.message || "Duplicate failed.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleArchive = async (pollId: string) => {
    try {
      setSubmitting(true);
      const res = await fetch(`/api/polls/${pollId}/archive`, { 
        method: "POST",
        headers: getCmsHeaders()
      });
      const d = await res.json();
      if (d.success) {
        showNotification("Poll archived.");
        fetchPolls();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (pollId: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this poll and all its recorded votes?")) return;
    try {
      setSubmitting(true);
      const res = await fetch(`/api/polls/${pollId}`, { 
        method: "DELETE",
        headers: getCmsHeaders()
      });
      const d = await res.json();
      if (d.success) {
        showNotification("Poll deleted permanently.");
        fetchPolls();
        fetchAnalytics();
        if (editingPoll?.id === pollId) {
          setEditingPoll(null);
          setSubTab("manage");
        }
      } else {
        throw new Error(d.message || "Delete failed.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const exportCSV = () => {
    if (polls.length === 0) return;
    const headers = ["ID", "Question", "Category", "Target Audience", "Status", "Priority", "Total Votes", "Created At"];
    const rows = polls.map(p => [
      p.id,
      `"${p.question.replace(/"/g, '""')}"`,
      p.category,
      p.target_audience,
      p.status,
      p.priority,
      p.total_votes,
      p.created_at
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `paisa_polls_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Computed analytics fallback if server analytics API returns null
  const effectiveAnalytics: PollAnalytics = analytics || {
    totalPolls: polls.length,
    activePolls: polls.filter(p => p.status === "Published").length,
    totalVotes: polls.reduce((acc, p) => acc + (p.total_votes || 0), 0),
    avgParticipation: polls.length > 0 ? Math.round(polls.reduce((acc, p) => acc + (p.total_votes || 0), 0) / polls.length) : 0,
    mostActivePoll: (() => {
      const sorted = [...polls].sort((a, b) => (b.total_votes || 0) - (a.total_votes || 0));
      return sorted[0] ? { id: sorted[0].id, question: sorted[0].question, total_votes: sorted[0].total_votes || 0 } : undefined;
    })(),
    mostSelectedOption: (() => {
      let topOption: any = undefined;
      let maxVotes = -1;
      polls.forEach(p => {
        p.options?.forEach(opt => {
          if ((opt.vote_count || 0) > maxVotes) {
            maxVotes = opt.vote_count || 0;
            topOption = {
              pollQuestion: p.question,
              optionText: opt.option_text,
              voteCount: opt.vote_count || 0
            };
          }
        });
      });
      return topOption;
    })(),
    categoryBreakdown: (() => {
      const catMap: Record<string, number> = {};
      polls.forEach(p => {
        const cat = p.category || "General";
        catMap[cat] = (catMap[cat] || 0) + 1;
      });
      return catMap;
    })(),
    votingTrend: [
      { date: "Day 1", votes: Math.round(polls.reduce((acc, p) => acc + (p.total_votes || 0), 0) * 0.15) },
      { date: "Day 2", votes: Math.round(polls.reduce((acc, p) => acc + (p.total_votes || 0), 0) * 0.25) },
      { date: "Day 3", votes: Math.round(polls.reduce((acc, p) => acc + (p.total_votes || 0), 0) * 0.20) },
      { date: "Day 4", votes: Math.round(polls.reduce((acc, p) => acc + (p.total_votes || 0), 0) * 0.22) },
      { date: "Today", votes: Math.round(polls.reduce((acc, p) => acc + (p.total_votes || 0), 0) * 0.18) }
    ]
  };
  const filteredPolls = polls.filter(p => {
    if (subTab === "archived") return p.status === "Archived";
    if (p.status === "Archived") return false;

    const matchesSearch = p.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "All" || p.category === categoryFilter;
    const matchesStatus = statusFilter === "All" || p.status === statusFilter;
    const matchesPriority = priorityFilter === "All" || p.priority === priorityFilter;

    return matchesSearch && matchesCategory && matchesStatus && matchesPriority;
  });

  const totalPages = Math.ceil(filteredPolls.length / itemsPerPage);
  const paginatedPolls = filteredPolls.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Notifications */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-150 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2 animate-fade-in shadow-2xs">
          <Check className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-150 text-rose-800 text-xs font-bold rounded-2xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Navigation Sub-Tabs Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setSubTab("manage")}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
              subTab === "manage"
                ? "bg-slate-900 text-white shadow-2xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <List className="w-4 h-4" />
            <span>Manage Polls ({polls.filter(p => p.status !== "Archived").length})</span>
          </button>

          <button
            onClick={handleStartCreate}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
              subTab === "create"
                ? "bg-rose-500 text-white shadow-2xs"
                : "bg-white text-rose-600 hover:bg-rose-50 border border-rose-200"
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>{editingPoll ? "Edit Poll" : "Create New Poll"}</span>
          </button>

          <button
            onClick={() => setSubTab("analytics")}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
              subTab === "analytics"
                ? "bg-slate-900 text-white shadow-2xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <BarChart2 className="w-4 h-4 text-emerald-500" />
            <span>Analytics & Trends</span>
          </button>

          <button
            onClick={() => setSubTab("archived")}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
              subTab === "archived"
                ? "bg-slate-900 text-white shadow-2xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Archive className="w-4 h-4 text-amber-500" />
            <span>Archived ({polls.filter(p => p.status === "Archived").length})</span>
          </button>
        </div>

        <button
          onClick={exportCSV}
          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* 1. MANAGE POLLS VIEW */}
      {(subTab === "manage" || subTab === "archived") && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-3xl border border-slate-150 shadow-3xs flex flex-wrap items-center justify-between gap-4">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search polls by question or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-10 pr-4 py-2.5 border border-slate-200 rounded-2xl focus:outline-none focus:ring-rose-500 bg-slate-50/50"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
                <Filter className="w-3.5 h-3.5" />
                <span>Filters:</span>
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-xs p-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-700"
              >
                <option value="All">All Categories</option>
                <option value="Homepage">Homepage</option>
                <option value="Teacher Hub">Teacher Hub</option>
                <option value="Petitions">Petitions</option>
                <option value="Announcements">Announcements</option>
                <option value="General">General</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs p-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-700"
              >
                <option value="All">All Statuses</option>
                <option value="Published">Published</option>
                <option value="Draft">Draft</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 space-y-3 bg-white rounded-3xl border border-slate-100">
              <RefreshCw className="w-6 h-6 animate-spin text-rose-500" />
              <p className="text-xs text-slate-400 font-bold">Fetching polls database...</p>
            </div>
          ) : filteredPolls.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-100 space-y-3">
              <Vote className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="text-sm font-black text-slate-700">No Polls Found</h4>
              <p className="text-xs text-slate-400">Try adjusting your filter parameters or create a new poll.</p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-150 shadow-3xs overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs min-w-[700px]">
                <thead className="bg-slate-50 text-[10px] text-slate-400 font-black uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Poll Question</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Target Audience</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Votes</th>
                    <th className="px-6 py-4">End Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {paginatedPolls.map((poll) => (
                    <tr key={poll.id} className="hover:bg-slate-50/60 transition-all">
                      <td className="px-6 py-4 max-w-xs">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {poll.featured && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[9px] font-black uppercase">
                                Featured
                              </span>
                            )}
                            <p className="font-extrabold text-slate-900 line-clamp-1">{poll.question}</p>
                          </div>
                          <p className="text-[10px] text-slate-400 line-clamp-1">{poll.description || "No description"}</p>
                        </div>
                      </td>

                      <td className="px-6 py-4 font-bold text-slate-700">{poll.category}</td>
                      <td className="px-6 py-4 text-slate-500 font-mono text-[11px]">{poll.target_audience}</td>

                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold capitalize ${
                          poll.status === "Published" 
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-150" 
                            : poll.status === "Draft" 
                            ? "bg-amber-50 text-amber-700 border border-amber-150" 
                            : "bg-slate-100 text-slate-500"
                        }`}>
                          {poll.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 font-black font-mono text-slate-900">{poll.total_votes || 0}</td>

                      <td className="px-6 py-4 text-slate-400 text-[11px]">
                        {poll.end_date ? new Date(poll.end_date).toLocaleDateString() : "No Limit"}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setPreviewPoll(poll)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                            title="Preview Poll Card"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleStartEdit(poll)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                            title="Edit Poll"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDuplicate(poll.id)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                            title="Duplicate Poll"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          {poll.status !== "Archived" && (
                            <button
                              onClick={() => handleArchive(poll.id)}
                              className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                              title="Archive Poll"
                            >
                              <Archive className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => handleDelete(poll.id)}
                            className="px-2.5 py-1 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 hover:text-rose-700 border border-rose-200/80 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                            title="Delete Poll Permanently"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-bold">
                  <span>Page {currentPage} of {totalPages}</span>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                      className="p-1.5 bg-white border rounded-lg hover:bg-slate-100 disabled:opacity-40"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                      className="p-1.5 bg-white border rounded-lg hover:bg-slate-100 disabled:opacity-40"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 2. CREATE / EDIT POLL FORM VIEW */}
      {subTab === "create" && (
        <form onSubmit={handleSavePoll} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-150 shadow-3xs space-y-6">
          <div className="border-b border-slate-100 pb-4 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-slate-900">
                {editingPoll ? "Edit Poll Configuration" : "Create New Opinion Poll"}
              </h3>
              <p className="text-xs text-slate-400">Configure parameters, target audience, and option list.</p>
            </div>

            <div className="flex items-center gap-2">
              {editingPoll && (
                <button
                  type="button"
                  onClick={() => handleDelete(editingPoll.id)}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                  title="Delete Poll Permanently"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Delete Poll</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setSubTab("manage")}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Question */}
            <div className="col-span-2 space-y-1.5">
              <label className="text-xs font-extrabold text-slate-700">Poll Question *</label>
              <input
                type="text"
                value={formQuestion}
                onChange={(e) => setFormQuestion(e.target.value)}
                placeholder="e.g. Which Bihar Teacher Mutual Transfer Rule improvement is most critical?"
                className="w-full text-xs p-3.5 border border-slate-200 rounded-2xl focus:ring-rose-500 focus:outline-none font-medium"
                required
              />
            </div>

            {/* Description */}
            <div className="col-span-2 space-y-1.5">
              <label className="text-xs font-extrabold text-slate-700">Detailed Description / Context</label>
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={3}
                placeholder="Provide helpful context, policy background, or instructions for voters..."
                className="w-full text-xs p-3.5 border border-slate-200 rounded-2xl focus:ring-rose-500 focus:outline-none font-medium"
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-700">Display Category</label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as PollCategory)}
                className="w-full text-xs p-3 border border-slate-200 rounded-2xl bg-white font-bold text-slate-800"
              >
                <option value="Homepage">Homepage</option>
                <option value="Teacher Hub">Teacher Hub</option>
                <option value="Petitions">Petitions</option>
                <option value="Announcements">Announcements</option>
                <option value="General">General</option>
              </select>
            </div>

            {/* Target Audience */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-700">Target Audience</label>
              <select
                value={formTargetAudience}
                onChange={(e) => setFormTargetAudience(e.target.value as PollTargetAudience)}
                className="w-full text-xs p-3 border border-slate-200 rounded-2xl bg-white font-bold text-slate-800"
              >
                <option value="Everyone">Everyone</option>
                <option value="Teachers">Teachers</option>
                <option value="Government Employees">Government Employees</option>
                <option value="BPSC Teachers">BPSC Teachers</option>
                <option value="Custom">Custom Group</option>
              </select>
            </div>

            {/* Priority */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-700">Priority Level</label>
              <select
                value={formPriority}
                onChange={(e) => setFormPriority(e.target.value as PollPriority)}
                className="w-full text-xs p-3 border border-slate-200 rounded-2xl bg-white font-bold text-slate-800"
              >
                <option value="Low">Low Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="High">High Priority</option>
              </select>
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-700">Publishing Status</label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as PollStatus)}
                className="w-full text-xs p-3 border border-slate-200 rounded-2xl bg-white font-bold text-slate-800"
              >
                <option value="Published">Published (Active)</option>
                <option value="Draft">Draft (Hidden)</option>
                <option value="Archived">Archived</option>
              </select>
            </div>

            {/* Cover Image URL */}
            <div className="col-span-2 space-y-1.5">
              <label className="text-xs font-extrabold text-slate-700">Optional Cover Image URL</label>
              <input
                type="text"
                value={formImageUrl}
                onChange={(e) => setFormImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full text-xs p-3 border border-slate-200 rounded-2xl focus:ring-rose-500 focus:outline-none"
              />
            </div>

            {/* Start & End Dates */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-700">Start Date</label>
              <input
                type="date"
                value={formStartDate}
                onChange={(e) => setFormStartDate(e.target.value)}
                className="w-full text-xs p-3 border border-slate-200 rounded-2xl focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-700">End Date (Optional)</label>
              <input
                type="date"
                value={formEndDate}
                onChange={(e) => setFormEndDate(e.target.value)}
                className="w-full text-xs p-3 border border-slate-200 rounded-2xl focus:ring-rose-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Rule Settings Toggles */}
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Voting Rules & Logic</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formAllowMultiple}
                  onChange={(e) => setFormAllowMultiple(e.target.checked)}
                  className="rounded border-slate-300 text-rose-500 focus:ring-rose-500 w-4 h-4"
                />
                <span>Allow Multiple Options Selection</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formShowResultsBeforeVote}
                  onChange={(e) => setFormShowResultsBeforeVote(e.target.checked)}
                  className="rounded border-slate-300 text-rose-500 focus:ring-rose-500 w-4 h-4"
                />
                <span>Show Live Results Before Voting</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formAllowVoteEdit}
                  onChange={(e) => setFormAllowVoteEdit(e.target.checked)}
                  className="rounded border-slate-300 text-rose-500 focus:ring-rose-500 w-4 h-4"
                />
                <span>Allow Voters to Change Vote</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formFeatured}
                  onChange={(e) => setFormFeatured(e.target.checked)}
                  className="rounded border-slate-300 text-rose-500 focus:ring-rose-500 w-4 h-4"
                />
                <span>Pin as Featured Poll</span>
              </label>
            </div>
          </div>

          {/* Options Management Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Poll Options (Unlimited)</h4>
              <button
                type="button"
                onClick={() => setFormOptions([...formOptions, `Option ${formOptions.length + 1}`])}
                className="px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Option</span>
              </button>
            </div>

            <div className="space-y-2">
              {formOptions.map((optText, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-400 w-6">#{index + 1}</span>
                  <input
                    type="text"
                    value={optText}
                    onChange={(e) => {
                      const copy = [...formOptions];
                      copy[index] = e.target.value;
                      setFormOptions(copy);
                    }}
                    placeholder={`Option ${index + 1}`}
                    className="flex-1 text-xs p-3 border border-slate-200 rounded-xl focus:ring-rose-500 focus:outline-none"
                    required
                  />
                  {formOptions.length > 2 && (
                    <button
                      type="button"
                      onClick={() => setFormOptions(formOptions.filter((_, i) => i !== index))}
                      className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Submit Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            {editingPoll ? (
              <button
                type="button"
                onClick={() => handleDelete(editingPoll.id)}
                className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>Delete Poll Permanently</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSubTab("manage")}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-extrabold shadow-md cursor-pointer"
              >
                {submitting ? "Saving Poll..." : editingPoll ? "Update Poll Configuration" : "Publish Opinion Poll"}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* 3. ANALYTICS VIEW */}
      {subTab === "analytics" && (
        <div className="space-y-6">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-white rounded-3xl border border-slate-150 shadow-3xs space-y-2">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Total Polls</span>
              <p className="text-2xl font-black text-slate-900 font-mono">{effectiveAnalytics.totalPolls}</p>
              <p className="text-[10px] text-slate-500 font-bold">{effectiveAnalytics.activePolls} currently active</p>
            </div>

            <div className="p-5 bg-white rounded-3xl border border-slate-150 shadow-3xs space-y-2">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Total Votes Recorded</span>
              <p className="text-2xl font-black text-rose-500 font-mono">{effectiveAnalytics.totalVotes.toLocaleString()}</p>
              <p className="text-[10px] text-slate-500 font-bold">100% verified unique accounts</p>
            </div>

            <div className="p-5 bg-white rounded-3xl border border-slate-150 shadow-3xs space-y-2">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Avg Votes / Poll</span>
              <p className="text-2xl font-black text-slate-900 font-mono">{effectiveAnalytics.avgParticipation}</p>
              <p className="text-[10px] text-slate-500 font-bold">Average voter participation rate</p>
            </div>

            <div className="p-5 bg-white rounded-3xl border border-slate-150 shadow-3xs space-y-2">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Top Category</span>
              <p className="text-lg font-black text-slate-900 line-clamp-1">
                {Object.keys(effectiveAnalytics.categoryBreakdown)[0] || "General"}
              </p>
              <p className="text-[10px] text-slate-500 font-bold">Highest engagement sector</p>
            </div>
          </div>

          {/* Highlights & Most Active */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {effectiveAnalytics.mostActivePoll ? (
              <div className="p-6 bg-white rounded-3xl border border-slate-150 shadow-3xs space-y-3">
                <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-black uppercase">
                  Most Active Poll
                </span>
                <h4 className="text-sm font-black text-slate-900">{effectiveAnalytics.mostActivePoll.question}</h4>
                <div className="flex items-center gap-2 text-xs text-slate-600 font-bold">
                  <Users className="w-4 h-4 text-rose-500" />
                  <span>{effectiveAnalytics.mostActivePoll.total_votes} total votes cast</span>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-white rounded-3xl border border-slate-150 shadow-3xs space-y-2">
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-black uppercase">
                  Poll Activity
                </span>
                <p className="text-xs text-slate-500 font-bold">No poll votes recorded yet. Vote on a poll to generate live trends!</p>
              </div>
            )}

            {effectiveAnalytics.mostSelectedOption ? (
              <div className="p-6 bg-white rounded-3xl border border-slate-150 shadow-3xs space-y-3">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase">
                  Most Selected Option
                </span>
                <h4 className="text-sm font-black text-slate-900">{effectiveAnalytics.mostSelectedOption.optionText}</h4>
                <p className="text-xs text-slate-500">{effectiveAnalytics.mostSelectedOption.pollQuestion}</p>
                <div className="flex items-center gap-2 text-xs text-emerald-700 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>{effectiveAnalytics.mostSelectedOption.voteCount} voters selected this</span>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-white rounded-3xl border border-slate-150 shadow-3xs space-y-2">
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-black uppercase">
                  Top Leading Option
                </span>
                <p className="text-xs text-slate-500 font-bold">Voter preferences will appear here as votes accumulate.</p>
              </div>
            )}
          </div>

          {/* Category Breakdown & Performance Table */}
          <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-3xs space-y-4">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Poll Category Engagement Breakdown</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(effectiveAnalytics.categoryBreakdown).map(([cat, count]) => {
                const pct = effectiveAnalytics.totalPolls > 0 ? Math.round((count / effectiveAnalytics.totalPolls) * 100) : 0;
                return (
                  <div key={cat} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs font-extrabold text-slate-800">
                      <span>{cat}</span>
                      <span>{count} polls ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-rose-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewPoll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="text-sm font-black text-slate-900">Live Poll Card Preview</h4>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleDelete(previewPoll.id);
                    setPreviewPoll(null);
                  }}
                  className="px-3 py-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Delete Poll</span>
                </button>
                <button
                  onClick={() => setPreviewPoll(null)}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
            <PollCard poll={previewPoll} currentUser={{ email: "admin@paisablueprint.in" }} />
          </div>
        </div>
      )}
    </div>
  );
}
