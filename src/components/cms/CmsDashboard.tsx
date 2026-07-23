import React, { useState, useEffect } from "react";
import {
  FileText, Megaphone, HelpCircle, Download, Image as ImageIcon,
  Layout, Menu, Navigation, Settings, History, Clipboard, AlertCircle,
  Plus, Trash2, Edit2, Check, RefreshCw, Eye, ArrowUp, ArrowDown,
  Upload, Sparkles, Shield, User, Copy, FilePlus, Search, ExternalLink, Filter, Vote
} from "lucide-react";
import ManageTeachers from "./ManageTeachers";
import PollManagement from "./PollManagement";

interface CmsDashboardProps {
  language?: "en" | "hi";
  userRole?: string;
  onClose?: () => void;
}

export default function CmsDashboard({ language = "hi", userRole = "admin", onClose }: CmsDashboardProps) {
  const [activeTab, setActiveTab] = useState<string>("homepage");
  const [loading, setLoading] = useState<boolean>(true);
  const [cmsData, setCmsData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Search filter inside lists
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Local state edit items
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);

  // Compress image helper
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith("image/")) {
        // Non-image files like PDFs can just be read directly as Base64 without canvas resizing
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        return;
      }
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 800;
          const scaleSize = img.width > MAX_WIDTH ? MAX_WIDTH / img.width : 1;
          canvas.width = img.width * scaleSize;
          canvas.height = img.height * scaleSize;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", 0.7)); // 70% quality compression
        };
      };
      reader.onerror = reject;
    });
  };

  useEffect(() => {
    fetchCmsData();
  }, []);

  const fetchCmsData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/cms/data");
      const d = await res.json();
      if (d.success) {
        setCmsData(d.data);
      } else {
        throw new Error(d.message || "Failed to load CMS database.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to communicate with back-end CMS router.");
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  // Generic Save module content
  const handleSaveModule = async (moduleId: string, payload: any, actionName: string, publish: boolean = true) => {
    try {
      setSubmitting(true);
      setError(null);
      const res = await fetch(`/api/cms/update/${moduleId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload, publish, actionName })
      });
      const d = await res.json();
      if (d.success) {
        showNotification(d.message || "Changes updated successfully.");
        fetchCmsData();
        setEditingItem(null);
        setIsAddingNew(false);
      } else {
        throw new Error(d.message || "Update request failed.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during save.");
    } finally {
      setSubmitting(false);
    }
  };

  // Media upload handler
  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setSubmitting(true);
      const compressedData = await compressImage(file);
      const res = await fetch("/api/cms/media/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: file.name,
          base64Data: compressedData,
          size: `${(file.size / 1024).toFixed(1)} KB`,
          category: file.type.startsWith("image/") ? "Images" : "Documents",
          mimeType: file.type
        })
      });
      const d = await res.json();
      if (d.success) {
        showNotification("File uploaded to media library!");
        fetchCmsData();
      } else {
        alert(d.message || "Failed to upload.");
      }
    } catch (err: any) {
      alert("Error uploading media asset: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Restore Revision Version
  const handleRestoreRevision = async (revisionId: string) => {
    if (!window.confirm("Are you sure you want to restore this revision? Your current active version will be saved as a previous version.")) return;
    try {
      setSubmitting(true);
      const res = await fetch(`/api/cms/revisions/${revisionId}/restore`, {
        method: "POST"
      });
      const d = await res.json();
      if (d.success) {
        showNotification(d.message || "Revision restored successfully.");
        fetchCmsData();
      } else {
        throw new Error(d.message || "Restore request failed.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Moderate suggestion (Admin/Super Admin approval of Moderator suggestions)
  const handleModerateSuggestion = async (suggestionId: string, status: "approved" | "rejected") => {
    try {
      setSubmitting(true);
      const res = await fetch(`/api/cms/suggestions/${suggestionId}/moderate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      const d = await res.json();
      if (d.success) {
        showNotification(`Suggestion ${status} successfully.`);
        fetchCmsData();
      } else {
        throw new Error(d.message || "Failed to moderate suggestion.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Copy helper
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    showNotification("URL copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <RefreshCw className="w-8 h-8 animate-spin text-rose-500" />
        <p className="text-slate-400 font-medium text-xs">Paisa Blueprint CMS initializing...</p>
      </div>
    );
  }

  const isSuperAdmin = userRole === "super_admin" || userRole === "super admin";

  const tabs = [
    { id: "homepage", label: "Homepage Manager", icon: <Layout className="w-4 h-4" /> },
    { id: "polls", label: "Poll Management", icon: <Vote className="w-4 h-4" /> },
    ...(isSuperAdmin ? [{ id: "teachers", label: "Manage Teachers", icon: <User className="w-4 h-4" /> }] : []),
    { id: "announcements", label: "Announcements Board", icon: <Megaphone className="w-4 h-4" /> },
    { id: "circulars", label: "Govt Circulars", icon: <FileText className="w-4 h-4" /> },
    { id: "blogs", label: "Blog Manager", icon: <Sparkles className="w-4 h-4" /> },
    { id: "faqs", label: "FAQ Board", icon: <HelpCircle className="w-4 h-4" /> },
    { id: "downloads", label: "Downloads Manager", icon: <Download className="w-4 h-4" /> },
    { id: "banners", label: "Banner Ads", icon: <ImageIcon className="w-4 h-4" /> },
    { id: "petitions", label: "Petitions Manager", icon: <Clipboard className="w-4 h-4" /> },
    { id: "navigation", label: "Navigation Menus", icon: <Navigation className="w-4 h-4" /> },
    { id: "footer", label: "Footer Designer", icon: <Menu className="w-4 h-4" /> },
    { id: "media", label: "Media Library", icon: <ImageIcon className="w-4 h-4" /> },
    { id: "seo", label: "SEO Configs", icon: <Settings className="w-4 h-4" /> },
    { id: "revisions", label: "Version Control", icon: <History className="w-4 h-4" /> },
    { id: "suggestions", label: "Mod Suggestions", icon: <Shield className="w-4 h-4" /> },
    { id: "activityLogs", label: "Activity Tracker", icon: <History className="w-4 h-4" /> }
  ];

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 flex flex-col md:flex-row rounded-3xl overflow-hidden border border-slate-200">
      {/* CMS Side Sidebar Navigation */}
      <div className="w-full md:w-64 bg-white border-r border-slate-150 flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-150 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-rose-500 fill-rose-500/10" />
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">Content Studio</h2>
          </div>
          <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full capitalize">
            {userRole === "moderator" ? "Viewer/Suggest" : "Publisher"}
          </span>
        </div>

        <nav className="p-4 space-y-1 overflow-y-auto max-h-[80vh]">
          <p className="text-[10px] font-bold text-slate-400 px-3 pb-2 uppercase tracking-wider">CMS Modules</p>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setEditingItem(null);
                setIsAddingNew(false);
                setSearchQuery("");
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-rose-500 text-white shadow-3xs"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main CMS Display area */}
      <div className="flex-1 p-6 sm:p-8 space-y-6 overflow-y-auto max-h-screen">
        {/* Banner messages */}
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

        {/* Action Header bar */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h1 className="text-xl font-black text-slate-900">{tabs.find(t => t.id === activeTab)?.label}</h1>
            <p className="text-xs text-slate-400">Manage real-time state for system module & track history.</p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all"
            >
              Close CMS
            </button>
          )}
        </div>

        {/* Render Tab Contents */}
        {activeTab === "polls" && (
          <PollManagement language={language} userRole={userRole} />
        )}

        {activeTab === "teachers" && (
          <ManageTeachers language={language} userRole={userRole} />
        )}

        {activeTab === "homepage" && cmsData && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-3xs space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 border-b pb-2">Hero Banner Configuration</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Headline</label>
                  <input
                    type="text"
                    defaultValue={cmsData.homepage.heroBanner.headline}
                    id="hero-headline"
                    className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:ring-rose-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Banner Image URL</label>
                  <input
                    type="text"
                    defaultValue={cmsData.homepage.heroBanner.imageUrl}
                    id="hero-image"
                    className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:ring-rose-500 focus:outline-none"
                  />
                </div>
                <div className="col-span-1 sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-500">Description Paragraph</label>
                  <textarea
                    defaultValue={cmsData.homepage.heroBanner.description}
                    id="hero-desc"
                    rows={3}
                    className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:ring-rose-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">CTA Button Text</label>
                  <input
                    type="text"
                    defaultValue={cmsData.homepage.heroBanner.ctaText}
                    id="hero-cta-text"
                    className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:ring-rose-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">CTA Destination Link</label>
                  <input
                    type="text"
                    defaultValue={cmsData.homepage.heroBanner.ctaLink}
                    id="hero-cta-link"
                    className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:ring-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  disabled={submitting}
                  onClick={() => {
                    const headline = (document.getElementById("hero-headline") as HTMLInputElement).value;
                    const imageUrl = (document.getElementById("hero-image") as HTMLInputElement).value;
                    const description = (document.getElementById("hero-desc") as HTMLTextAreaElement).value;
                    const ctaText = (document.getElementById("hero-cta-text") as HTMLInputElement).value;
                    const ctaLink = (document.getElementById("hero-cta-link") as HTMLInputElement).value;

                    const updated = {
                      ...cmsData.homepage,
                      heroBanner: { headline, imageUrl, description, ctaText, ctaLink }
                    };
                    handleSaveModule("homepage", updated, "Updated Homepage Hero Banner");
                  }}
                  className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  {submitting ? "Saving..." : "Publish Hero Changes"}
                </button>
              </div>
            </div>

            {/* Homepage Sections Manager */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-3xs space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 border-b pb-2">Layout Section Priority & Reordering</h3>
              <div className="space-y-2">
                {cmsData.homepage.sections.map((sect: any, idx: number) => (
                  <div key={sect.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl hover:bg-slate-50 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-slate-400">#{idx + 1}</span>
                      <span className="font-bold text-slate-800">{sect.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const list = [...cmsData.homepage.sections];
                          if (idx > 0) {
                            const tmp = list[idx - 1];
                            list[idx - 1] = list[idx];
                            list[idx] = tmp;
                            handleSaveModule("homepage", { ...cmsData.homepage, sections: list }, "Reordered Layout Sections");
                          }
                        }}
                        disabled={idx === 0}
                        className="p-1.5 bg-slate-100 rounded-lg text-slate-500 hover:bg-slate-200"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          const list = [...cmsData.homepage.sections];
                          if (idx < list.length - 1) {
                            const tmp = list[idx + 1];
                            list[idx + 1] = list[idx];
                            list[idx] = tmp;
                            handleSaveModule("homepage", { ...cmsData.homepage, sections: list }, "Reordered Layout Sections");
                          }
                        }}
                        disabled={idx === cmsData.homepage.sections.length - 1}
                        className="p-1.5 bg-slate-100 rounded-lg text-slate-500 hover:bg-slate-200"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          const list = cmsData.homepage.sections.map((s: any) =>
                            s.id === sect.id ? { ...s, visible: !s.visible } : s
                          );
                          handleSaveModule("homepage", { ...cmsData.homepage, sections: list }, `${sect.visible ? "Hid" : "Showed"} section: ${sect.name}`);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold ${
                          sect.visible ? "bg-emerald-50 text-emerald-700 border border-emerald-150" : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {sect.visible ? "Active" : "Hidden"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Announcements list */}
        {activeTab === "announcements" && cmsData && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <input
                type="text"
                placeholder="Search announcements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-xs p-2.5 border border-slate-200 rounded-xl focus:outline-none w-64 bg-white"
              />
              <button
                onClick={() => {
                  setEditingItem({
                    id: "ann-" + Date.now(),
                    title: "",
                    description: "",
                    priority: "medium",
                    startDate: new Date().toISOString().split("T")[0],
                    endDate: new Date(Date.now() + 30*24*60*60*1000).toISOString().split("T")[0],
                    backgroundColor: "#fef3c7",
                    icon: "Megaphone",
                    targetAudience: "All Teachers",
                    published: true
                  });
                  setIsAddingNew(true);
                }}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>New Announcement</span>
              </button>
            </div>

            {editingItem ? (
              <div className="bg-white p-6 rounded-3xl border border-slate-150 space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900">{isAddingNew ? "Add" : "Edit"} Announcement Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Title</label>
                    <input
                      type="text"
                      value={editingItem.title}
                      onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                      className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:ring-rose-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Target Audience</label>
                    <input
                      type="text"
                      value={editingItem.targetAudience}
                      onChange={(e) => setEditingItem({ ...editingItem, targetAudience: e.target.value })}
                      className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:ring-rose-500 focus:outline-none"
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="text-xs font-bold text-slate-500">Description</label>
                    <textarea
                      value={editingItem.description}
                      onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                      rows={2}
                      className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:ring-rose-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Priority</label>
                    <select
                      value={editingItem.priority}
                      onChange={(e) => setEditingItem({ ...editingItem, priority: e.target.value })}
                      className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:ring-rose-500 focus:outline-none bg-white"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Background Color</label>
                    <input
                      type="color"
                      value={editingItem.backgroundColor}
                      onChange={(e) => setEditingItem({ ...editingItem, backgroundColor: e.target.value })}
                      className="w-full h-11 p-1 border border-slate-200 rounded-xl cursor-pointer"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Start Date</label>
                    <input
                      type="date"
                      value={editingItem.startDate ? editingItem.startDate.split("T")[0] : ""}
                      onChange={(e) => setEditingItem({ ...editingItem, startDate: e.target.value })}
                      className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:ring-rose-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">End Date</label>
                    <input
                      type="date"
                      value={editingItem.endDate ? editingItem.endDate.split("T")[0] : ""}
                      onChange={(e) => setEditingItem({ ...editingItem, endDate: e.target.value })}
                      className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:ring-rose-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingItem.published}
                      id="ann-pub"
                      onChange={(e) => setEditingItem({ ...editingItem, published: e.target.checked })}
                      className="rounded border-slate-300 text-rose-500 focus:ring-rose-500"
                    />
                    <label htmlFor="ann-pub" className="text-xs font-bold text-slate-600">Publish Immediately</label>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingItem(null)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        let updatedList = [];
                        if (isAddingNew) {
                          updatedList = [...cmsData.announcements, editingItem];
                        } else {
                          updatedList = cmsData.announcements.map((a: any) => a.id === editingItem.id ? editingItem : a);
                        }
                        handleSaveModule("announcements", updatedList, `${isAddingNew ? "Created" : "Modified"} Announcement: ${editingItem.title}`);
                      }}
                      className="px-5 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold"
                    >
                      Save Details
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {cmsData.announcements
                  .filter((a: any) => a.title.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((ann: any) => (
                    <div key={ann.id} className="p-5 bg-white rounded-3xl border border-slate-100 shadow-3xs flex items-start justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                            ann.priority === "high" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
                          }`}>
                            {ann.priority} Priority
                          </span>
                          <span className="text-xs font-mono text-slate-400">Target: {ann.targetAudience}</span>
                        </div>
                        <h4 className="text-sm font-extrabold text-slate-900">{ann.title}</h4>
                        <p className="text-xs text-slate-500 leading-relaxed">{ann.description}</p>
                        <p className="text-[10px] text-slate-400 font-semibold">Active: {new Date(ann.startDate).toLocaleDateString()} to {new Date(ann.endDate).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingItem(ann);
                            setIsAddingNew(false);
                          }}
                          className="p-2 bg-slate-50 text-slate-500 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm("Delete this announcement permanently?")) {
                              const filtered = cmsData.announcements.filter((a: any) => a.id !== ann.id);
                              handleSaveModule("announcements", filtered, `Deleted Announcement: ${ann.title}`);
                            }
                          }}
                          className="p-2 bg-slate-50 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Circulars Module */}
        {activeTab === "circulars" && cmsData && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <input
                type="text"
                placeholder="Search official circulars..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-xs p-2.5 border border-slate-200 rounded-xl focus:outline-none w-64 bg-white"
              />
              <button
                onClick={() => {
                  setEditingItem({
                    id: "circ-" + Date.now(),
                    title: "",
                    department: "Education Department",
                    category: "Transfer Policy",
                    circularNumber: "",
                    publishDate: new Date().toISOString().split("T")[0],
                    effectiveDate: new Date().toISOString().split("T")[0],
                    fileUrl: "#",
                    thumbnail: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=300",
                    tags: [],
                    description: "",
                    featured: false,
                    downloadCount: 0,
                    viewCount: 0,
                    status: "active"
                  });
                  setIsAddingNew(true);
                }}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>New Circular Record</span>
              </button>
            </div>

            {editingItem ? (
              <div className="bg-white p-6 rounded-3xl border border-slate-150 space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900">{isAddingNew ? "Create" : "Edit"} Circular Meta</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Circular Title</label>
                    <input
                      type="text"
                      value={editingItem.title}
                      onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                      className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-rose-500"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Circular Memo Number</label>
                    <input
                      type="text"
                      value={editingItem.circularNumber}
                      onChange={(e) => setEditingItem({ ...editingItem, circularNumber: e.target.value })}
                      className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-rose-500"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Government Department</label>
                    <input
                      type="text"
                      value={editingItem.department}
                      onChange={(e) => setEditingItem({ ...editingItem, department: e.target.value })}
                      className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-rose-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Policy Category</label>
                    <input
                      type="text"
                      value={editingItem.category}
                      onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                      className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-rose-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Publish Date</label>
                    <input
                      type="date"
                      value={editingItem.publishDate}
                      onChange={(e) => setEditingItem({ ...editingItem, publishDate: e.target.value })}
                      className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-rose-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Effective Date</label>
                    <input
                      type="date"
                      value={editingItem.effectiveDate}
                      onChange={(e) => setEditingItem({ ...editingItem, effectiveDate: e.target.value })}
                      className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none"
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="text-xs font-bold text-slate-500">Brief Overview Description</label>
                    <textarea
                      value={editingItem.description}
                      onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                      rows={3}
                      className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Circular Link / URL (PDF file)</label>
                    <input
                      type="text"
                      value={editingItem.fileUrl}
                      onChange={(e) => setEditingItem({ ...editingItem, fileUrl: e.target.value })}
                      className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Thumbnail URL</label>
                    <input
                      type="text"
                      value={editingItem.thumbnail}
                      onChange={(e) => setEditingItem({ ...editingItem, thumbnail: e.target.value })}
                      className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-150">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                      <input
                        type="checkbox"
                        checked={editingItem.featured}
                        onChange={(e) => setEditingItem({ ...editingItem, featured: e.target.checked })}
                        className="rounded text-rose-500 focus:ring-rose-500 border-slate-300"
                      />
                      <span>Pin as Featured</span>
                    </label>
                    <select
                      value={editingItem.status}
                      onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value })}
                      className="text-xs border border-slate-200 p-2 rounded-xl bg-white focus:outline-none"
                    >
                      <option value="active">Active</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingItem(null)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        let list = [];
                        if (isAddingNew) list = [...cmsData.circulars, editingItem];
                        else list = cmsData.circulars.map((c: any) => c.id === editingItem.id ? editingItem : c);
                        handleSaveModule("circulars", list, `${isAddingNew ? "Uploaded" : "Modified"} Govt Circular: ${editingItem.title}`);
                      }}
                      className="px-5 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Save Circular
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-3xs overflow-hidden">
                <table className="w-full border-collapse text-left text-xs">
                  <thead className="bg-slate-50 text-[10px] text-slate-400 font-bold uppercase tracking-wider border-b">
                    <tr>
                      <th className="px-6 py-4">Title & department</th>
                      <th className="px-6 py-4">Memo ID</th>
                      <th className="px-6 py-4">Publish Date</th>
                      <th className="px-6 py-4">Downloads</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {cmsData.circulars
                      .filter((c: any) => c.title.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map((circ: any) => (
                        <tr key={circ.id} className="hover:bg-slate-50/50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img src={circ.thumbnail} className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-100" />
                              <div>
                                <p className="font-extrabold text-slate-900">{circ.title}</p>
                                <p className="text-[10px] text-slate-400">{circ.department} • {circ.category}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-mono font-bold text-slate-600">{circ.circularNumber}</td>
                          <td className="px-6 py-4 text-slate-400">{circ.publishDate}</td>
                          <td className="px-6 py-4 text-slate-400">{circ.downloadCount || 0} hits</td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setEditingItem(circ);
                                  setIsAddingNew(false);
                                }}
                                className="p-1.5 hover:text-rose-600 bg-slate-50 text-slate-500 rounded-lg"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm("Delete circular entry?")) {
                                    const filtered = cmsData.circulars.filter((c: any) => c.id !== circ.id);
                                    handleSaveModule("circulars", filtered, `Deleted Govt Circular: ${circ.title}`);
                                  }
                                }}
                                className="p-1.5 hover:text-rose-600 bg-slate-50 text-slate-500 rounded-lg"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Blog Manager Module */}
        {activeTab === "blogs" && cmsData && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-xs p-2.5 border border-slate-200 rounded-xl focus:outline-none w-64 bg-white"
              />
              <button
                onClick={() => {
                  setEditingItem({
                    id: "blog-" + Date.now(),
                    title: "",
                    slug: "",
                    category: "General",
                    author: "Central Editor",
                    featuredImage: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&q=80&w=800",
                    metaTitle: "",
                    metaDescription: "",
                    keywords: [],
                    tags: [],
                    publishDate: new Date().toISOString().split("T")[0],
                    content: "",
                    status: "draft"
                  });
                  setIsAddingNew(true);
                }}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Write New Article</span>
              </button>
            </div>

            {editingItem ? (
              <div className="bg-white p-6 rounded-3xl border border-slate-150 space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900">{isAddingNew ? "Compose" : "Modify"} Article</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Article Title</label>
                    <input
                      type="text"
                      value={editingItem.title}
                      onChange={(e) => {
                        const title = e.target.value;
                        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                        setEditingItem({ ...editingItem, title, slug });
                      }}
                      className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-rose-500"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">URL Slug</label>
                    <input
                      type="text"
                      value={editingItem.slug}
                      onChange={(e) => setEditingItem({ ...editingItem, slug: e.target.value })}
                      className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Category</label>
                    <input
                      type="text"
                      value={editingItem.category}
                      onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                      className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Author Name</label>
                    <input
                      type="text"
                      value={editingItem.author}
                      onChange={(e) => setEditingItem({ ...editingItem, author: e.target.value })}
                      className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none"
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="text-xs font-bold text-slate-500">Featured Image URL</label>
                    <input
                      type="text"
                      value={editingItem.featuredImage}
                      onChange={(e) => setEditingItem({ ...editingItem, featuredImage: e.target.value })}
                      className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none"
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="text-xs font-bold text-slate-500">Article Content (HTML supported)</label>
                    <textarea
                      value={editingItem.content}
                      onChange={(e) => setEditingItem({ ...editingItem, content: e.target.value })}
                      rows={8}
                      className="w-full text-xs p-3 font-mono border border-slate-200 rounded-xl focus:outline-none focus:ring-rose-500"
                      placeholder="<p>Write your HTML or markdown text...</p>"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">SEO Meta Title</label>
                    <input
                      type="text"
                      value={editingItem.metaTitle}
                      onChange={(e) => setEditingItem({ ...editingItem, metaTitle: e.target.value })}
                      className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">SEO Meta Description</label>
                    <input
                      type="text"
                      value={editingItem.metaDescription}
                      onChange={(e) => setEditingItem({ ...editingItem, metaDescription: e.target.value })}
                      className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-150">
                  <select
                    value={editingItem.status}
                    onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value })}
                    className="text-xs border border-slate-200 p-2.5 rounded-xl bg-white"
                  >
                    <option value="draft">Save Draft</option>
                    <option value="published">Publish Now</option>
                    <option value="scheduled">Schedule Article</option>
                  </select>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingItem(null)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        let list = [];
                        if (isAddingNew) list = [...cmsData.blogs, editingItem];
                        else list = cmsData.blogs.map((b: any) => b.id === editingItem.id ? editingItem : b);
                        handleSaveModule("blogs", list, `${isAddingNew ? "Created" : "Modified"} Article: ${editingItem.title}`);
                      }}
                      className="px-5 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Publish Article
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {cmsData.blogs
                  .filter((b: any) => b.title.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((post: any) => (
                    <div key={post.id} className="bg-white rounded-3xl border border-slate-100 shadow-3xs overflow-hidden flex flex-col justify-between">
                      <img src={post.featuredImage} className="h-44 w-full object-cover bg-slate-100 border-b" />
                      <div className="p-5 flex-1 space-y-3 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-rose-500 uppercase">{post.category}</span>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                              post.status === "published" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                            }`}>
                              {post.status}
                            </span>
                          </div>
                          <h4 className="text-sm font-extrabold text-slate-900 leading-snug">{post.title}</h4>
                          <p className="text-[11px] text-slate-400">Written by: <span className="font-bold">{post.author}</span> on {post.publishDate}</p>
                        </div>
                        <div className="flex items-center justify-end gap-2 pt-3 border-t">
                          <button
                            onClick={() => {
                              setEditingItem(post);
                              setIsAddingNew(false);
                            }}
                            className="p-1.5 hover:text-rose-500 bg-slate-50 rounded-lg text-slate-400"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm("Delete blog article permanently?")) {
                                const filtered = cmsData.blogs.filter((b: any) => b.id !== post.id);
                                handleSaveModule("blogs", filtered, `Deleted Article: ${post.title}`);
                              }
                            }}
                            className="p-1.5 hover:text-rose-600 bg-slate-50 rounded-lg text-slate-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* FAQs list */}
        {activeTab === "faqs" && cmsData && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <input
                type="text"
                placeholder="Search FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-xs p-2.5 border border-slate-200 rounded-xl focus:outline-none w-64 bg-white"
              />
              <button
                onClick={() => {
                  setEditingItem({
                    id: "faq-" + Date.now(),
                    question: "",
                    answer: "",
                    category: "General",
                    order: cmsData.faqs.length + 1
                  });
                  setIsAddingNew(true);
                }}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add FAQ</span>
              </button>
            </div>

            {editingItem ? (
              <div className="bg-white p-6 rounded-3xl border border-slate-150 space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900">{isAddingNew ? "Add" : "Edit"} FAQ</h3>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">FAQ Question</label>
                    <input
                      type="text"
                      value={editingItem.question}
                      onChange={(e) => setEditingItem({ ...editingItem, question: e.target.value })}
                      className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500">Category Name</label>
                      <input
                        type="text"
                        value={editingItem.category}
                        onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                        className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500">Sort Priority Order</label>
                      <input
                        type="number"
                        value={editingItem.order}
                        onChange={(e) => setEditingItem({ ...editingItem, order: parseInt(e.target.value) || 1 })}
                        className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Detailed Answer</label>
                    <textarea
                      value={editingItem.answer}
                      onChange={(e) => setEditingItem({ ...editingItem, answer: e.target.value })}
                      rows={3}
                      className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <button
                    onClick={() => setEditingItem(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      let list = [];
                      if (isAddingNew) list = [...cmsData.faqs, editingItem];
                      else list = cmsData.faqs.map((f: any) => f.id === editingItem.id ? editingItem : f);
                      // Auto-sort by order
                      list.sort((a: any, b: any) => a.order - b.order);
                      handleSaveModule("faqs", list, `${isAddingNew ? "Created" : "Modified"} FAQ: ${editingItem.question}`);
                    }}
                    className="px-5 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Save FAQ
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {cmsData.faqs
                  .filter((f: any) => f.question.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((faq: any) => (
                    <div key={faq.id} className="p-5 bg-white border border-slate-100 rounded-3xl hover:bg-slate-50/50 flex items-start justify-between gap-4 shadow-3xs">
                      <div>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full">{faq.category} • Order: {faq.order}</span>
                        <h4 className="text-xs font-extrabold text-slate-950 mt-1">{faq.question}</h4>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{faq.answer}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => {
                            setEditingItem(faq);
                            setIsAddingNew(false);
                          }}
                          className="p-1.5 bg-slate-100 hover:text-rose-500 text-slate-400 rounded-lg"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm("Remove this FAQ permanently?")) {
                              const filtered = cmsData.faqs.filter((f: any) => f.id !== faq.id);
                              handleSaveModule("faqs", filtered, `Deleted FAQ: ${faq.question}`);
                            }
                          }}
                          className="p-1.5 bg-slate-100 hover:text-rose-600 text-slate-400 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Downloads Manager Module */}
        {activeTab === "downloads" && cmsData && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <input
                type="text"
                placeholder="Search download files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-xs p-2.5 border border-slate-200 rounded-xl focus:outline-none w-64 bg-white"
              />
              <button
                onClick={() => {
                  setEditingItem({
                    id: "dl-" + Date.now(),
                    title: "",
                    description: "",
                    category: "General",
                    fileUrl: "#",
                    fileType: "pdf",
                    version: "1.0",
                    publishDate: new Date().toISOString().split("T")[0],
                    downloadCount: 0,
                    viewCount: 0
                  });
                  setIsAddingNew(true);
                }}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Download Item</span>
              </button>
            </div>

            {editingItem ? (
              <div className="bg-white p-6 rounded-3xl border border-slate-150 space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900">{isAddingNew ? "Add" : "Edit"} Download Resource</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">File Display Title</label>
                    <input
                      type="text"
                      value={editingItem.title}
                      onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                      className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-rose-500"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">File Category</label>
                    <input
                      type="text"
                      value={editingItem.category}
                      onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                      className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-rose-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">File Type Extension</label>
                    <select
                      value={editingItem.fileType}
                      onChange={(e) => setEditingItem({ ...editingItem, fileType: e.target.value })}
                      className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none bg-white"
                    >
                      <option value="pdf">PDF (.pdf)</option>
                      <option value="docx">Microsoft Word (.docx)</option>
                      <option value="xlsx">Microsoft Excel (.xlsx)</option>
                      <option value="zip">ZIP Archive (.zip)</option>
                      <option value="image">Graphic Image (.png/.jpg)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Version Tag</label>
                    <input
                      type="text"
                      value={editingItem.version}
                      onChange={(e) => setEditingItem({ ...editingItem, version: e.target.value })}
                      className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-rose-500"
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="text-xs font-bold text-slate-500">Resource Description</label>
                    <textarea
                      value={editingItem.description}
                      onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                      rows={2}
                      className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none"
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="text-xs font-bold text-slate-500">Source Link / File URL</label>
                    <input
                      type="text"
                      value={editingItem.fileUrl}
                      onChange={(e) => setEditingItem({ ...editingItem, fileUrl: e.target.value })}
                      className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-rose-500"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <button
                    onClick={() => setEditingItem(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      let list = [];
                      if (isAddingNew) list = [...cmsData.downloads, editingItem];
                      else list = cmsData.downloads.map((d: any) => d.id === editingItem.id ? editingItem : d);
                      handleSaveModule("downloads", list, `${isAddingNew ? "Created" : "Modified"} Download file: ${editingItem.title}`);
                    }}
                    className="px-5 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Save File Resource
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-3xs overflow-hidden">
                <table className="w-full border-collapse text-left text-xs text-slate-500">
                  <thead className="bg-slate-50 text-[10px] text-slate-400 font-bold uppercase tracking-wider border-b">
                    <tr>
                      <th className="px-6 py-4">Title & Description</th>
                      <th className="px-6 py-4">Format / version</th>
                      <th className="px-6 py-4">Downloads Count</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {cmsData.downloads
                      .filter((d: any) => d.title.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map((dl: any) => (
                        <tr key={dl.id} className="hover:bg-slate-50/50">
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-extrabold text-slate-900">{dl.title}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">{dl.description}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-slate-100 rounded-full text-[10px] font-bold text-slate-600 uppercase">
                              {dl.fileType} • v{dl.version}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-mono font-bold text-slate-500">{dl.downloadCount || 0} hits</td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setEditingItem(dl);
                                  setIsAddingNew(false);
                                }}
                                className="p-1.5 bg-slate-50 text-slate-500 hover:text-rose-500 rounded-lg"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm("Delete download item?")) {
                                    const filtered = cmsData.downloads.filter((d: any) => d.id !== dl.id);
                                    handleSaveModule("downloads", filtered, `Deleted Download file: ${dl.title}`);
                                  }
                                }}
                                className="p-1.5 bg-slate-50 text-slate-500 hover:text-rose-600 rounded-lg"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Banner Manager Module */}
        {activeTab === "banners" && cmsData && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <input
                type="text"
                placeholder="Search promotional banners..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-xs p-2.5 border border-slate-200 rounded-xl focus:outline-none w-64 bg-white"
              />
              <button
                onClick={() => {
                  setEditingItem({
                    id: "ban-" + Date.now(),
                    imageUrl: "https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&q=80&w=800",
                    title: "",
                    description: "",
                    ctaText: "Explore Now",
                    targetLink: "#",
                    priority: 1,
                    startDate: new Date().toISOString().split("T")[0],
                    endDate: new Date(Date.now() + 60*24*60*60*1000).toISOString().split("T")[0],
                    enabled: true,
                    homepagePosition: "sidebar"
                  });
                  setIsAddingNew(true);
                }}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>New Banner Ad</span>
              </button>
            </div>

            {editingItem ? (
              <div className="bg-white p-6 rounded-3xl border border-slate-150 space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900">{isAddingNew ? "Create" : "Edit"} Promotional Banner</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Banner Header Title</label>
                    <input
                      type="text"
                      value={editingItem.title}
                      onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                      className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-rose-500"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Target Link URL</label>
                    <input
                      type="text"
                      value={editingItem.targetLink}
                      onChange={(e) => setEditingItem({ ...editingItem, targetLink: e.target.value })}
                      className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-rose-500"
                      required
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="text-xs font-bold text-slate-500">Banner Description</label>
                    <textarea
                      value={editingItem.description}
                      onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                      rows={2}
                      className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Image Asset URL</label>
                    <input
                      type="text"
                      value={editingItem.imageUrl}
                      onChange={(e) => setEditingItem({ ...editingItem, imageUrl: e.target.value })}
                      className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">CTA Button Text</label>
                    <input
                      type="text"
                      value={editingItem.ctaText}
                      onChange={(e) => setEditingItem({ ...editingItem, ctaText: e.target.value })}
                      className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Homepage Layout Position</label>
                    <select
                      value={editingItem.homepagePosition}
                      onChange={(e) => setEditingItem({ ...editingItem, homepagePosition: e.target.value })}
                      className="w-full text-xs p-3 border border-slate-200 rounded-xl bg-white focus:outline-none"
                    >
                      <option value="top">Top Header Banner</option>
                      <option value="middle">Middle Content Ribbon</option>
                      <option value="sidebar">Right Sidebar Panel</option>
                      <option value="bottom">Bottom Footer Area</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Priority Weight</label>
                    <input
                      type="number"
                      value={editingItem.priority}
                      onChange={(e) => setEditingItem({ ...editingItem, priority: parseInt(e.target.value) || 1 })}
                      className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                    <input
                      type="checkbox"
                      checked={editingItem.enabled}
                      onChange={(e) => setEditingItem({ ...editingItem, enabled: e.target.checked })}
                      className="rounded text-rose-500 focus:ring-rose-500 border-slate-300"
                    />
                    <span>Active Ad Banner</span>
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingItem(null)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        let list = [];
                        if (isAddingNew) list = [...cmsData.banners, editingItem];
                        else list = cmsData.banners.map((b: any) => b.id === editingItem.id ? editingItem : b);
                        handleSaveModule("banners", list, `${isAddingNew ? "Created" : "Modified"} Banner Ad: ${editingItem.title}`);
                      }}
                      className="px-5 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Save Banner Ad
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {cmsData.banners
                  .filter((b: any) => b.title.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((ban: any) => (
                    <div key={ban.id} className="bg-white rounded-3xl border border-slate-100 shadow-3xs overflow-hidden flex flex-col justify-between">
                      <img src={ban.imageUrl} className="h-36 w-full object-cover bg-slate-100 border-b" />
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-rose-500">Position: {ban.homepagePosition}</span>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                              ban.enabled ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-400"
                            }`}>
                              {ban.enabled ? "Live" : "Disabled"}
                            </span>
                          </div>
                          <h4 className="text-xs font-extrabold text-slate-900 mt-1">{ban.title}</h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">{ban.description}</p>
                        </div>
                        <div className="flex items-center justify-end gap-1.5 pt-3 border-t">
                          <button
                            onClick={() => {
                              setEditingItem(ban);
                              setIsAddingNew(false);
                            }}
                            className="p-1.5 bg-slate-50 text-slate-400 hover:text-rose-500 rounded-lg"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm("Remove promotional banner?")) {
                                const filtered = cmsData.banners.filter((b: any) => b.id !== ban.id);
                                handleSaveModule("banners", filtered, `Deleted Banner Ad: ${ban.title}`);
                              }
                            }}
                            className="p-1.5 bg-slate-50 text-slate-400 hover:text-rose-600 rounded-lg"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Petition Content Manager Module */}
        {activeTab === "petitions" && cmsData && (
          <div className="space-y-6">
            {cmsData.petitions.map((pet: any) => (
              <div key={pet.petitionId} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-3xs space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="text-sm font-extrabold text-slate-900">Campaign: {pet.title}</h3>
                  <span className="text-[10px] font-mono text-slate-400">ID: {pet.petitionId}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Overwrite Campaign Title</label>
                    <input
                      type="text"
                      defaultValue={pet.title}
                      id={`pet-title-${pet.petitionId}`}
                      className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Campaign Cover Image URL</label>
                    <input
                      type="text"
                      defaultValue={pet.imageUrl}
                      id={`pet-image-${pet.petitionId}`}
                      className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none"
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="text-xs font-bold text-slate-500">Advocacy Mission Description Override</label>
                    <textarea
                      defaultValue={pet.description}
                      id={`pet-desc-${pet.petitionId}`}
                      rows={3}
                      className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none"
                    />
                  </div>
                </div>

                {/* Features toggles */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                    <input
                      type="checkbox"
                      defaultChecked={pet.enableCountdown}
                      id={`pet-count-${pet.petitionId}`}
                      className="rounded text-rose-500 border-slate-300"
                    />
                    <span>Active Countdown</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                    <input
                      type="checkbox"
                      defaultChecked={pet.enableProgressBar}
                      id={`pet-progress-${pet.petitionId}`}
                      className="rounded text-rose-500 border-slate-300"
                    />
                    <span>Progress Bar</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                    <input
                      type="checkbox"
                      defaultChecked={pet.enableComments}
                      id={`pet-comments-${pet.petitionId}`}
                      className="rounded text-rose-500 border-slate-300"
                    />
                    <span>User Comments</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                    <input
                      type="checkbox"
                      defaultChecked={pet.enableSharing}
                      id={`pet-sharing-${pet.petitionId}`}
                      className="rounded text-rose-500 border-slate-300"
                    />
                    <span>Share Buttons</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                    <input
                      type="checkbox"
                      defaultChecked={pet.featured}
                      id={`pet-feat-${pet.petitionId}`}
                      className="rounded text-rose-500 border-slate-300"
                    />
                    <span>Featured Petition</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                    <input
                      type="checkbox"
                      defaultChecked={pet.archived}
                      id={`pet-archived-${pet.petitionId}`}
                      className="rounded text-rose-500 border-slate-300"
                    />
                    <span>Archive Petition</span>
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <button
                    onClick={() => {
                      const title = (document.getElementById(`pet-title-${pet.petitionId}`) as HTMLInputElement).value;
                      const imageUrl = (document.getElementById(`pet-image-${pet.petitionId}`) as HTMLInputElement).value;
                      const description = (document.getElementById(`pet-desc-${pet.petitionId}`) as HTMLTextAreaElement).value;
                      const enableCountdown = (document.getElementById(`pet-count-${pet.petitionId}`) as HTMLInputElement).checked;
                      const enableProgressBar = (document.getElementById(`pet-progress-${pet.petitionId}`) as HTMLInputElement).checked;
                      const enableComments = (document.getElementById(`pet-comments-${pet.petitionId}`) as HTMLInputElement).checked;
                      const enableSharing = (document.getElementById(`pet-sharing-${pet.petitionId}`) as HTMLInputElement).checked;
                      const featured = (document.getElementById(`pet-feat-${pet.petitionId}`) as HTMLInputElement).checked;
                      const archived = (document.getElementById(`pet-archived-${pet.petitionId}`) as HTMLInputElement).checked;

                      const updatedList = cmsData.petitions.map((p: any) =>
                        p.petitionId === pet.petitionId
                          ? { ...p, title, imageUrl, description, enableCountdown, enableProgressBar, enableComments, enableSharing, featured, archived }
                          : p
                      );
                      handleSaveModule("petitions", updatedList, `Configured Petition Metadata: ${title}`);
                    }}
                    className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Save Campaign Rules
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Navigation Manager Module */}
        {activeTab === "navigation" && cmsData && (
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-3xs space-y-6">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-extrabold text-slate-900">Configure Application Header Menus</h3>
              <button
                onClick={() => {
                  const id = "nav-" + Date.now();
                  const list = [...cmsData.navigation, { id, label: "New Link", path: "/", icon: "Link", visible: true, order: cmsData.navigation.length + 1 }];
                  handleSaveModule("navigation", list, "Added Navigation Link Item");
                }}
                className="px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Navigation Menu</span>
              </button>
            </div>

            <div className="space-y-3">
              {cmsData.navigation.map((nav: any, idx: number) => (
                <div key={nav.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 border rounded-xl hover:bg-slate-50 gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1 w-full">
                    <input
                      type="text"
                      defaultValue={nav.label}
                      id={`nav-label-${nav.id}`}
                      placeholder="Label"
                      className="text-xs p-2 border rounded-lg focus:outline-none bg-white"
                    />
                    <input
                      type="text"
                      defaultValue={nav.path}
                      id={`nav-path-${nav.id}`}
                      placeholder="Redirect Path"
                      className="text-xs p-2 border rounded-lg focus:outline-none bg-white"
                    />
                    <input
                      type="text"
                      defaultValue={nav.icon}
                      id={`nav-icon-${nav.id}`}
                      placeholder="Lucide Icon Name"
                      className="text-xs p-2 border rounded-lg focus:outline-none bg-white"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                    <button
                      onClick={() => {
                        const list = [...cmsData.navigation];
                        if (idx > 0) {
                          const tmp = list[idx - 1];
                          list[idx - 1] = list[idx];
                          list[idx] = tmp;
                          handleSaveModule("navigation", list, "Reordered Navigation Items");
                        }
                      }}
                      disabled={idx === 0}
                      className="p-1.5 bg-slate-100 rounded text-slate-500 disabled:opacity-40"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        const list = [...cmsData.navigation];
                        if (idx < list.length - 1) {
                          const tmp = list[idx + 1];
                          list[idx + 1] = list[idx];
                          list[idx] = tmp;
                          handleSaveModule("navigation", list, "Reordered Navigation Items");
                        }
                      }}
                      disabled={idx === cmsData.navigation.length - 1}
                      className="p-1.5 bg-slate-100 rounded text-slate-500 disabled:opacity-40"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        const list = cmsData.navigation.map((item: any) =>
                          item.id === nav.id ? { ...item, visible: !item.visible } : item
                        );
                        handleSaveModule("navigation", list, `${nav.visible ? "Hid" : "Showed"} Navigation Item: ${nav.label}`);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold ${
                        nav.visible ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {nav.visible ? "Active" : "Hidden"}
                    </button>
                    <button
                      onClick={() => {
                        const label = (document.getElementById(`nav-label-${nav.id}`) as HTMLInputElement).value;
                        const path = (document.getElementById(`nav-path-${nav.id}`) as HTMLInputElement).value;
                        const icon = (document.getElementById(`nav-icon-${nav.id}`) as HTMLInputElement).value;

                        const list = cmsData.navigation.map((item: any) =>
                          item.id === nav.id ? { ...item, label, path, icon } : item
                        );
                        handleSaveModule("navigation", list, `Updated Navigation Item: ${label}`);
                      }}
                      className="p-1.5 hover:text-emerald-600 bg-slate-100 rounded-lg text-slate-500"
                      title="Save modifications"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm("Remove menu item?")) {
                          const list = cmsData.navigation.filter((item: any) => item.id !== nav.id);
                          handleSaveModule("navigation", list, `Deleted Navigation Item: ${nav.label}`);
                        }
                      }}
                      className="p-1.5 hover:text-rose-600 bg-slate-100 rounded-lg text-slate-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Designer Module */}
        {activeTab === "footer" && cmsData && (
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-3xs space-y-6">
            <h3 className="text-sm font-extrabold text-slate-900 border-b pb-2">Footer Contact & Social Media Links</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Contact Email</label>
                <input
                  type="email"
                  defaultValue={cmsData.footer.contact.email}
                  id="foot-email"
                  className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Contact Telephone Number</label>
                <input
                  type="text"
                  defaultValue={cmsData.footer.contact.phone}
                  id="foot-phone"
                  className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-xs font-bold text-slate-500">Office Mailing Address</label>
                <input
                  type="text"
                  defaultValue={cmsData.footer.contact.address}
                  id="foot-address"
                  className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Telegram Link</label>
                <input
                  type="text"
                  defaultValue={cmsData.footer.socialLinks.telegram}
                  id="foot-social-tg"
                  className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Twitter Handle Link</label>
                <input
                  type="text"
                  defaultValue={cmsData.footer.socialLinks.twitter}
                  id="foot-social-tw"
                  className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-xs font-bold text-slate-500">Copyright Banner Text</label>
                <input
                  type="text"
                  defaultValue={cmsData.footer.copyright}
                  id="foot-copyright"
                  className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <button
                onClick={() => {
                  const email = (document.getElementById("foot-email") as HTMLInputElement).value;
                  const phone = (document.getElementById("foot-phone") as HTMLInputElement).value;
                  const address = (document.getElementById("foot-address") as HTMLInputElement).value;
                  const telegram = (document.getElementById("foot-social-tg") as HTMLInputElement).value;
                  const twitter = (document.getElementById("foot-social-tw") as HTMLInputElement).value;
                  const copyright = (document.getElementById("foot-copyright") as HTMLInputElement).value;

                  const updated = {
                    ...cmsData.footer,
                    contact: { email, phone, address },
                    socialLinks: { ...cmsData.footer.socialLinks, telegram, twitter },
                    copyright
                  };
                  handleSaveModule("footer", updated, "Updated App Footer Contact Info");
                }}
                className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Publish Footer Changes
              </button>
            </div>
          </div>
        )}

        {/* Media Library Module */}
        {activeTab === "media" && cmsData && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-3xs space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-rose-500" />
                  <span>Interactive Upload Area</span>
                </h3>
                <span className="text-[10px] text-slate-400 font-semibold font-mono">Durable Base64 Cloud Persistence</span>
              </div>
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center bg-slate-50 hover:bg-rose-50/20 hover:border-rose-300 transition-all cursor-pointer relative">
                <input
                  type="file"
                  onChange={handleMediaUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  accept="image/*,application/pdf,.docx,.xlsx,.zip"
                />
                <ImageIcon className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-xs font-extrabold text-slate-700">Drag & Drop file or click to choose from system</p>
                <p className="text-[10px] text-slate-400 mt-1">Supports PNG, JPEG, PDF, ZIP, DOCX, XLSX with automatic client-side compression before upload</p>
              </div>
            </div>

            {/* Media directory list */}
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {cmsData.media.map((med: any) => (
                <div key={med.id} className="bg-white rounded-3xl border border-slate-100 shadow-3xs overflow-hidden flex flex-col justify-between">
                  <div className="relative aspect-video bg-slate-50 border-b flex items-center justify-center overflow-hidden">
                    {med.mimeType.startsWith("image/") ? (
                      <img src={med.url} className="w-full h-full object-cover" />
                    ) : (
                      <FileText className="w-10 h-10 text-rose-300" />
                    )}
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-slate-900/60 backdrop-blur-xs text-[9px] text-white font-bold rounded-md">
                      {med.category}
                    </span>
                  </div>
                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-xs font-extrabold text-slate-900 truncate" title={med.name}>{med.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{med.size} • {new Date(med.uploadedAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center justify-between gap-1.5 pt-2 border-t">
                      <button
                        onClick={() => handleCopy(med.url)}
                        className="p-1.5 bg-slate-100 hover:text-rose-500 rounded-lg text-slate-500 shrink-0 cursor-pointer"
                        title="Copy direct Base64 Data URL"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm("Remove file permanently from storage library?")) {
                            fetch(`/api/cms/media/${med.id}`, { method: "DELETE" })
                              .then(r => r.json())
                              .then(d => {
                                if (d.success) {
                                  showNotification("Asset deleted successfully.");
                                  fetchCmsData();
                                }
                              });
                          }
                        }}
                        className="p-1.5 bg-slate-100 hover:text-rose-600 rounded-lg text-slate-400 shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SEO configs Module */}
        {activeTab === "seo" && cmsData && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-3xs space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 border-b pb-2">Page Meta Headers & Schema SEO</h3>
              {cmsData.seo.pages.map((page: any, idx: number) => (
                <div key={page.pagePath} className="p-4 border rounded-2xl bg-slate-50/30 space-y-3 text-xs">
                  <div className="flex items-center justify-between font-extrabold text-slate-900 border-b pb-2">
                    <span>Route path: {page.pagePath}</span>
                    <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full uppercase">Meta config</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400">Meta Title</label>
                      <input
                        type="text"
                        defaultValue={page.metaTitle}
                        id={`seo-title-${idx}`}
                        className="w-full text-xs p-2 border rounded-lg focus:outline-none bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400">Open Graph Social Image</label>
                      <input
                        type="text"
                        defaultValue={page.ogImage}
                        id={`seo-image-${idx}`}
                        className="w-full text-xs p-2 border rounded-lg focus:outline-none bg-white"
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <label className="text-[10px] font-bold text-slate-400">Meta Description</label>
                      <textarea
                        defaultValue={page.metaDescription}
                        id={`seo-desc-${idx}`}
                        rows={2}
                        className="w-full text-xs p-2 border rounded-lg focus:outline-none bg-white"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => {
                        const metaTitle = (document.getElementById(`seo-title-${idx}`) as HTMLInputElement).value;
                        const ogImage = (document.getElementById(`seo-image-${idx}`) as HTMLInputElement).value;
                        const metaDescription = (document.getElementById(`seo-desc-${idx}`) as HTMLTextAreaElement).value;

                        const updatedPages = cmsData.seo.pages.map((p: any, i: number) =>
                          i === idx ? { ...p, metaTitle, ogImage, metaDescription } : p
                        );
                        handleSaveModule("seo", { ...cmsData.seo, pages: updatedPages }, `Updated SEO Tags for path: ${page.pagePath}`);
                      }}
                      className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                    >
                      Publish SEO Tags
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* sitemaps & robots.txt */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-3xs space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 border-b pb-2">Robots.txt & Sitemap Console</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">robots.txt</label>
                  <textarea
                    defaultValue={cmsData.seo.robotsTxt}
                    id="seo-robots"
                    rows={6}
                    className="w-full text-xs p-3 font-mono border rounded-xl focus:outline-none bg-slate-50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Sitemap XML Content</label>
                  <textarea
                    defaultValue={cmsData.seo.sitemap}
                    id="seo-sitemap"
                    rows={6}
                    className="w-full text-xs p-3 font-mono border rounded-xl focus:outline-none bg-slate-50"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-4 border-t">
                <button
                  onClick={() => {
                    const robotsTxt = (document.getElementById("seo-robots") as HTMLTextAreaElement).value;
                    const sitemap = (document.getElementById("seo-sitemap") as HTMLTextAreaElement).value;
                    handleSaveModule("seo", { ...cmsData.seo, robotsTxt, sitemap }, "Configured robots.txt & Sitemap metadata");
                  }}
                  className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Save SEO Directives
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Version Control Revisions list */}
        {activeTab === "revisions" && cmsData && (
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-3xs space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 border-b pb-2">Revision Version History</h3>
            <div className="space-y-3">
              {cmsData.revisions.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">No version backups recorded yet. Edit other modules to spawn a backup automatically!</div>
              ) : (
                cmsData.revisions.map((rev: any) => (
                  <div key={rev.id} className="p-4 border rounded-2xl hover:bg-slate-50 flex items-center justify-between gap-4 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900">Module: {rev.moduleId.toUpperCase()}</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          rev.status === "published" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                        }`}>
                          {rev.status} (v{rev.version})
                        </span>
                      </div>
                      <p className="text-slate-500 mt-1">{rev.title}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Backed up by: <span className="font-bold">{rev.createdBy}</span> on {new Date(rev.createdAt).toLocaleString("en-IN")}</p>
                    </div>
                    {rev.status !== "published" && (
                      <button
                        onClick={() => handleRestoreRevision(rev.id)}
                        className="px-3.5 py-1.5 bg-indigo-55 hover:bg-indigo-600 hover:text-white rounded-lg text-[10px] font-bold border border-indigo-200 text-indigo-700 transition-all cursor-pointer"
                      >
                        Restore Version
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Suggestions list (Moderator suggests changes, Admin approves/rejects) */}
        {activeTab === "suggestions" && cmsData && (
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-3xs space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 border-b pb-2">Moderator Change Suggestions</h3>
            <div className="space-y-4">
              {cmsData.suggestions.length === 0 ? (
                <div className="p-10 text-center text-slate-400 text-xs">No pending moderator suggestion requests exist.</div>
              ) : (
                cmsData.suggestions.map((sug: any) => (
                  <div key={sug.id} className="p-5 border rounded-2xl bg-slate-50/50 space-y-3 text-xs">
                    <div className="flex items-center justify-between border-b pb-2">
                      <div>
                        <span className="font-extrabold text-slate-900">Module: {sug.moduleId.toUpperCase()}</span>
                        <p className="text-[10px] text-slate-400">Proposed by: <span className="font-bold">{sug.suggestedByName}</span> ({sug.suggestedByEmail})</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        sug.status === "pending" ? "bg-amber-100 text-amber-800" : sug.status === "approved" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                      }`}>
                        {sug.status}
                      </span>
                    </div>
                    <div className="p-3 bg-slate-150 rounded-xl font-mono text-[10px] text-slate-700 max-h-40 overflow-y-auto">
                      <strong>Action:</strong> {sug.action}<br/>
                      <strong>Payload Proposed:</strong>
                      <pre className="mt-1 whitespace-pre-wrap">{JSON.stringify(sug.content, null, 2)}</pre>
                    </div>

                    {sug.status === "pending" && (userRole === "admin" || userRole === "super_admin" || userRole === "super admin") && (
                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          onClick={() => handleModerateSuggestion(sug.id, "rejected")}
                          className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg font-bold"
                        >
                          Reject Proposal
                        </button>
                        <button
                          onClick={() => handleModerateSuggestion(sug.id, "approved")}
                          className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg font-bold"
                        >
                          Approve & Deploy
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Activity Logs Module */}
        {activeTab === "activityLogs" && cmsData && (
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-3xs space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 border-b pb-2">CMS System Action Audit logs</h3>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {cmsData.activityLogs.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">No active logging records found. Your edits will be audited in this panel.</div>
              ) : (
                cmsData.activityLogs.map((log: any) => (
                  <div key={log.id} className="p-3 border rounded-xl hover:bg-slate-50 flex items-start justify-between gap-4 text-[11px]">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900">{log.userName}</span>
                        <span className="text-slate-400 font-mono">({log.userEmail})</span>
                      </div>
                      <p className="text-slate-600 font-bold">{log.action}</p>
                      <p className="text-[10px] text-slate-400">Browser: {log.browser} • IP Address: {log.ipAddress}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0 font-mono">{new Date(log.createdAt).toLocaleString("en-IN")}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
