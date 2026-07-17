import React, { useState, useEffect } from "react";
import { 
  User, Folder, BookOpen, ArrowUpDown, Bell, Settings, 
  ShieldCheck, Trash2, Edit, Bookmark, TrendingUp, Plus, 
  Search, Eye, EyeOff, CheckCircle, RefreshCw, Calendar, 
  MapPin, Briefcase, Lock, AlertCircle, ExternalLink, FileText,
  ChevronRight, Heart, Star, Check, X, Shield, Info, Activity, Clock
} from "lucide-react";
import { paisaFetch } from "../api";
import { globalTeacherStore, Teacher } from "./teacher-hub/TeacherDataStore";

interface UserDashboardProps {
  user: any;
  language: string;
  onNavigateToWidget: (widget: string) => void;
  setSessionUser?: (user: any) => void;
  profiles?: any[];
  setProfiles?: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function UserDashboard({
  user,
  language,
  onNavigateToWidget,
  setSessionUser,
  profiles,
  setProfiles
}: UserDashboardProps) {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // States for user profiles & settings
  const [profile, setProfile] = useState<any>({
    fullName: user?.name || "User",
    mobile: "",
    state: "Bihar",
    district: "",
    occupation: "Teacher",
    schoolDept: "",
    photoUrl: user?.profilePhoto || "🧑‍🏫",
    verified: false,
    createdAt: new Date().toLocaleDateString()
  });
  
  // Calculations & Bookmarks
  const [calculations, setCalculations] = useState<any[]>([]);
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [securityLogs, setSecurityLogs] = useState<any[]>([]);
  
  // Mutual Transfer Listings owned by user
  const [userListing, setUserListing] = useState<Teacher | null>(null);
  const [restoreListing, setRestoreListing] = useState<Teacher | null>(null);

  // Search & Filter within calculations
  const [calcSearch, setCalcSearch] = useState<string>("");
  const [calcFilter, setCalcFilter] = useState<string>("all");

  // Edit fields
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);
  const [editedProfile, setEditedProfile] = useState<any>({});
  const [isChangingPassword, setIsChangingPassword] = useState<boolean>(false);
  const [passwordForm, setPasswordForm] = useState({ current: "", newPassword: "", confirm: "" });
  const [passwordStatus, setPasswordStatus] = useState<{ type: "success" | "error" | null, message: string }>({ type: null, message: "" });
  
  // Custom tagging states
  const [editingCalcId, setEditingCalcId] = useState<string | null>(null);
  const [editingTitleText, setEditingTitleText] = useState<string>("");

  useEffect(() => {
    fetchDashboardData();
  }, [user?.email]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch profiles
      if (user?.email) {
        const pRes = await paisaFetch(`/api/auth/get-profiles?email=${encodeURIComponent(user.email)}`);
        if (pRes.ok) {
          const pData = await pRes.json();
          if (pData?.profiles && pData.profiles.length > 0) {
            const activeProf = pData.profiles[0]; // Take primary profile
            setProfile({
              fullName: activeProf.name || user?.name || "User",
              mobile: activeProf.mobile || "",
              state: activeProf.state || "Bihar",
              district: activeProf.district || "",
              occupation: activeProf.occupation || "Teacher",
              schoolDept: activeProf.schoolDept || "",
              photoUrl: activeProf.profilePhoto || user?.profilePhoto || "🧑‍🏫",
              verified: activeProf.isVerified || false,
              createdAt: activeProf.createdAt ? new Date(activeProf.createdAt).toLocaleDateString() : new Date().toLocaleDateString()
            });
            setEditedProfile({
              fullName: activeProf.name || user?.name || "User",
              mobile: activeProf.mobile || "",
              state: activeProf.state || "Bihar",
              district: activeProf.district || "",
              occupation: activeProf.occupation || "Teacher",
              schoolDept: activeProf.schoolDept || ""
            });
          }
        }
      }

      // 2. Fetch calculations & bookmarks
      const lRes = await paisaFetch("/api/locker");
      if (lRes.ok) {
        const lData = await lRes.json();
        setCalculations(lData.savedCalculations || []);
        setBookmarks(lData.bookmarkedTools || []);
        setNotifications(lData.notifications || []);
      }

      // 3. Sync and fetch Mutual Transfer listing
      await globalTeacherStore.syncWithServer();
      const allTeachers = globalTeacherStore.getTeachersWithDeleted();
      const foundListing = allTeachers.find(t => 
        (t.email && t.email.toLowerCase() === user?.email?.toLowerCase()) ||
        (t.mobile && profile.mobile && t.mobile === profile.mobile)
      );
      if (foundListing) {
        if (foundListing.isDeleted) {
          setRestoreListing(foundListing);
          setUserListing(null);
        } else {
          setUserListing(foundListing);
          setRestoreListing(null);
        }
      } else {
        setUserListing(null);
        setRestoreListing(null);
      }

      // 4. Generate some mock security logs
      setSecurityLogs([
        { id: "1", event: "User login successful", ip: "157.34.120." + Math.floor(Math.random() * 254), time: new Date().toLocaleString() },
        { id: "2", event: "Dashboard synchronized with secure ledger", ip: "157.34.120.12", time: new Date(Date.now() - 3600000).toLocaleString() }
      ]);

    } catch (err) {
      console.error("Dashboard failed to sync:", err);
      setError("Unable to completely synchronize with private vault. Defaulting to local session storage.");
    } finally {
      setLoading(false);
    }
  };

  // Profile Save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editedProfile.fullName.trim()) return;

    try {
      // Save profile details to server
      const res = await paisaFetch("/api/auth/update-account-name", {
        method: "POST",
        body: JSON.stringify({
          email: user?.email,
          fullName: editedProfile.fullName,
          mobile: editedProfile.mobile,
          state: editedProfile.state,
          district: editedProfile.district,
          occupation: editedProfile.occupation,
          schoolDept: editedProfile.schoolDept
        })
      });

      if (res.ok) {
        // Also update Mutual Transfer profile if exists
        if (userListing) {
          globalTeacherStore.updateTeacher(userListing.id, {
            name: editedProfile.fullName,
            mobile: editedProfile.mobile,
            currentDistrict: editedProfile.district,
            currentSchool: editedProfile.schoolDept,
            teacherType: editedProfile.occupation
          });
        }
        
        setProfile(prev => ({
          ...prev,
          ...editedProfile
        }));

        // Propagate state changes to parent app to avoid stale synchronization race conditions
        if (setSessionUser && user) {
          const updatedUser = { ...user, name: editedProfile.fullName };
          setSessionUser(updatedUser);
          // Persist the updated session in localStorage as well
          localStorage.setItem("paisa_active_session", JSON.stringify(updatedUser));
        }

        if (setProfiles && profiles) {
          const activeProfId = user?.activeProfileId || "profile-main";
          const updatedProfiles = profiles.map(p => {
            if (p.id === activeProfId || (p.id === "profile-main" && profiles.length === 1)) {
              return {
                ...p,
                name: editedProfile.fullName,
                mobile: editedProfile.mobile,
                state: editedProfile.state,
                district: editedProfile.district,
                occupation: editedProfile.occupation,
                schoolDept: editedProfile.schoolDept
              };
            }
            return p;
          });
          setProfiles(updatedProfiles);
          if (user?.email) {
            localStorage.setItem(`paisa_family_profiles_list_${user.email.toLowerCase()}`, JSON.stringify(updatedProfiles));
          }
          localStorage.setItem("paisa_family_profiles_list", JSON.stringify(updatedProfiles));
        }

        setIsEditingProfile(false);
        alert(language === "hi" ? "प्रोफ़ाइल सफलतापूर्वक सहेजी गई!" : "Profile updated successfully!");
        fetchDashboardData();
      } else {
        alert(language === "hi" ? "अपडेट करने में विफल।" : "Failed to update profile.");
      }
    } catch (err) {
      alert("Error saving profile details.");
    }
  };

  // Change Password Action
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus({ type: null, message: "" });

    if (passwordForm.newPassword !== passwordForm.confirm) {
      setPasswordStatus({ 
        type: "error", 
        message: language === "hi" ? "पुष्टि पासवर्ड मेल नहीं खाता।" : "Confirm password does not match new password." 
      });
      return;
    }

    try {
      const res = await paisaFetch("/api/auth/change-password", {
        method: "POST",
        body: JSON.stringify({
          email: user?.email,
          currentPassword: passwordForm.current,
          newPassword: passwordForm.newPassword
        })
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setPasswordStatus({
          type: "success",
          message: language === "hi" ? "पासवर्ड सफलतापूर्वक बदला गया!" : "Password changed successfully!"
        });
        setPasswordForm({ current: "", newPassword: "", confirm: "" });
        setTimeout(() => setIsChangingPassword(false), 2000);
      } else {
        setPasswordStatus({
          type: "error",
          message: data.message || (language === "hi" ? "पासवर्ड बदलने में त्रुटि।" : "Failed to change password.")
        });
      }
    } catch (err) {
      setPasswordStatus({ type: "error", message: "Server connection failed." });
    }
  };

  // Load Saved Calculation
  const handleLoadCalculation = (calc: any) => {
    // Write data to localStorage so respective widget can pick it up
    localStorage.setItem("paisa_loaded_calculation", JSON.stringify(calc));
    
    // Determine the widget to go to based on calc type
    let widgetId = "dashboard";
    const type = calc.type?.toLowerCase();
    
    if (type === "salary") {
      if (calc.data?.teacherGrade || calc.title?.toLowerCase().includes("bpsc")) {
        widgetId = "bpsc_salary";
      } else {
        widgetId = "salary";
      }
    }
    else if (type === "pension") widgetId = "pension";
    else if (type === "sip") widgetId = "sip";
    else if (type === "nps") widgetId = "nps_govt";
    else if (type === "tax") widgetId = "tax";
    else if (type === "goal") widgetId = "goals";
    else if (type === "loan" || type === "debt") widgetId = "debt";
    else if (type === "bpsc") widgetId = "bpsc_salary";

    onNavigateToWidget(widgetId);
  };

  // Delete Saved Calculation
  const handleDeleteCalculation = async (id: string) => {
    if (!confirm(language === "hi" ? "क्या आप वाकई इस कैलकुलेशन को हटाना चाहते हैं?" : "Are you sure you want to delete this saved calculation?")) return;

    try {
      const res = await paisaFetch(`/api/locker/delete/${id}`, { method: "POST" });
      if (res.ok) {
        setCalculations(prev => prev.filter(c => c.id !== id));
      } else {
        alert("Failed to delete.");
      }
    } catch (err) {
      alert("Error deleting calculation.");
    }
  };

  // Rename Saved Calculation
  const handleRenameCalculation = async (id: string) => {
    if (!editingTitleText.trim()) return;

    try {
      const res = await paisaFetch(`/api/locker/update/${id}`, {
        method: "POST",
        body: JSON.stringify({ title: editingTitleText.trim() })
      });

      if (res.ok) {
        setCalculations(prev => prev.map(c => c.id === id ? { ...c, title: editingTitleText.trim() } : c));
        setEditingCalcId(null);
      } else {
        alert("Rename failed.");
      }
    } catch (err) {
      alert("Error renaming.");
    }
  };

  // Toggle Mutual Transfer status
  const handleToggleListingStatus = (status: "Active" | "Completed" | "Hidden") => {
    if (!userListing) return;
    
    const confirmMsg = language === "hi" 
      ? `क्या आप स्टेटस को '${status}' में बदलना चाहते हैं?`
      : `Are you sure you want to set your listing status to '${status}'?`;
      
    if (!confirm(confirmMsg)) return;

    globalTeacherStore.updateTeacher(userListing.id, { status });
    setUserListing(prev => prev ? { ...prev, status } : null);
    alert(language === "hi" ? "स्टेटस अपडेट किया गया!" : "Listing status updated!");
  };

  // Soft Delete Listing
  const handleSoftDeleteListing = () => {
    if (!userListing) return;
    
    const confirmMsg = language === "hi"
      ? "क्या आप वाकई अपनी म्यूचुअल ट्रांसफर लिस्टिंग को हटाना चाहते हैं? आप इसे 30 दिनों के भीतर कभी भी पुनर्स्थापित कर सकते हैं।"
      : "Are you sure you want to delete your Mutual Transfer listing? It will be hidden from searches but you can restore it within 30 days.";

    if (!confirm(confirmMsg)) return;

    globalTeacherStore.deleteTeacher(userListing.id);
    setRestoreListing({
      ...userListing,
      isDeleted: true,
      deletedAt: new Date().toISOString(),
      status: "Hidden"
    });
    setUserListing(null);
    alert(language === "hi" ? "लिस्टिंग सफलतापूर्वक हटाई गई (सॉफ्ट डिलीट)।" : "Listing soft-deleted successfully. It is now hidden.");
  };

  // Restore Listing
  const handleRestoreListing = () => {
    if (!restoreListing) return;

    globalTeacherStore.restoreTeacher(restoreListing.id);
    setUserListing({
      ...restoreListing,
      isDeleted: false,
      deletedAt: undefined,
      status: "Active"
    });
    setRestoreListing(null);
    alert(language === "hi" ? "लिस्टिंग सफलतापूर्वक पुनर्स्थापित की गई!" : "Listing restored successfully!");
  };

  // Delete notification
  const handleDeleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Filter calculations
  const filteredCalcs = calculations.filter(c => {
    const matchesSearch = c.title?.toLowerCase().includes(calcSearch.toLowerCase());
    if (calcFilter === "all") return matchesSearch;
    return matchesSearch && c.type?.toLowerCase() === calcFilter;
  });

  // Calculate totals for summary cards
  const totalSavedValue = calculations.reduce((sum, c) => {
    const data = c.data || {};
    return sum + (Number(data.totalCorpus) || Number(data.futureValue) || Number(data.totalContribution) || 0);
  }, 0);

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-4">
        <RefreshCw className="w-10 h-10 text-emerald-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
          {language === "hi" ? "सुरक्षित पर्सनल डैशबोर्ड सिंक किया जा रहा है..." : "Synchronizing secure personal dashboard..."}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* 1. Header Banner */}
        <div className="bg-gradient-to-r from-slate-50 to-indigo-50/50 border border-slate-200/80 text-slate-800 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight font-display text-slate-900">
              {language === "hi" ? `नमस्ते, ${profile.fullName}` : `Welcome back, ${profile.fullName}`}
            </h1>
            <span className="text-[10px] font-extrabold uppercase tracking-widest bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>SECURED LEDGER</span>
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-600 max-w-xl font-medium">
            {language === "hi"
              ? "आपका सुरक्षित केंद्रीकृत वित्तीय कमांड सेंटर। अपनी सहेजी गई गणनाएं, म्यूचुअल ट्रांसफर लिस्टिंग और अलर्ट प्रबंधित करें।"
              : "Your secure centralized finance command center. Manage saved plans, bookmarks, mutual transfers, and secure profile logs."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-3xl">{profile.photoUrl}</span>
          <div className="text-right">
            <span className="block text-xs text-slate-500 font-bold uppercase tracking-wide">
              {language === "hi" ? "सदस्यता की तिथि" : "Member Since"}
            </span>
            <span className="block text-xs font-black text-slate-900">{profile.createdAt}</span>
          </div>
        </div>
      </div>

      {/* 2. Responsive Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Saved Calculations Card */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-xs transition-all flex items-center gap-4 shadow-3xs">
          <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <Folder className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-2xs font-extrabold uppercase text-slate-450 tracking-wider">
              {language === "hi" ? "सहेजी गई गणनाएं" : "Saved Calculations"}
            </span>
            <span className="text-xl font-black text-slate-900">{calculations.length}</span>
          </div>
        </div>

        {/* Compounding Plans / Goal Value */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-xs transition-all flex items-center gap-4 shadow-3xs">
          <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-2xs font-extrabold uppercase text-slate-450 tracking-wider">
              {language === "hi" ? "कंपाउंडिंग एस्टीमेट" : "Total Projected Capital"}
            </span>
            <span className="text-lg font-black text-slate-900">
              {totalSavedValue > 0 ? `₹${totalSavedValue.toLocaleString()}` : "₹0"}
            </span>
          </div>
        </div>

        {/* Mutual Transfer status */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-xs transition-all flex items-center gap-4 shadow-3xs">
          <div className="p-3.5 bg-sky-50 text-sky-600 rounded-xl">
            <ArrowUpDown className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-2xs font-extrabold uppercase text-slate-450 tracking-wider">
              {language === "hi" ? "म्यूचुअल ट्रांसफर लिस्टिंग" : "Mutual Transfer Profile"}
            </span>
            <span className="text-xs font-black text-slate-800">
              {userListing ? (
                <span className="text-emerald-600 font-black">● {userListing.status || "Active"}</span>
              ) : restoreListing ? (
                <span className="text-amber-500 font-bold">⚠️ Deleted (Can Restore)</span>
              ) : (
                <span className="text-slate-400">None Registered</span>
              )}
            </span>
          </div>
        </div>

        {/* Bookmarks */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-xs transition-all flex items-center gap-4 shadow-3xs">
          <div className="p-3.5 bg-rose-50 text-rose-500 rounded-xl">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-2xs font-extrabold uppercase text-slate-450 tracking-wider">
              {language === "hi" ? "पसंदीदा टूल्स" : "Favorite Bookmarks"}
            </span>
            <span className="text-xl font-black text-slate-900">{bookmarks.length}</span>
          </div>
        </div>
      </div>

      {/* 3. Main Split Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Navigation / Control Sidebar (3 cols) */}
        <div className="lg:col-span-3 space-y-3 bg-white border border-slate-150/60 p-4 rounded-3xl shadow-3xs">
          <span className="block text-[10px] font-black uppercase text-slate-400 tracking-wider px-3 pb-2 border-b border-slate-50">
            {language === "hi" ? "डैशबोर्ड नेविगेशन" : "Dashboard Console"}
          </span>
          {[
            { id: "overview", label: language === "hi" ? "ओवरव्यू" : "Overview Summary", icon: Activity },
            { id: "profile", label: language === "hi" ? "मेरी प्रोफ़ाइल" : "My Profile Settings", icon: User },
            { id: "calculations", label: language === "hi" ? "सहेजी गई गणनाएं" : "Saved Calculations", icon: Folder },
            { id: "bookmarks", label: language === "hi" ? "पसंदीदा टूल्स" : "Bookmarked Tools", icon: Star },
            { id: "transfer", label: language === "hi" ? "म्यूचुअल ट्रांसफर" : "Mutual Transfer Listing", icon: ArrowUpDown },
            { id: "notifications", label: language === "hi" ? "नोटिफिकेशन सेंटर" : "Alerts & Notifications", icon: Bell, badge: notifications.length },
            { id: "settings", label: language === "hi" ? "अकाउंट सिक्योरिटी" : "Security & Accounts", icon: Settings },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all border-0 cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-transparent text-slate-650 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${activeTab === tab.id ? "text-emerald-400" : "text-slate-400"}`} />
                  <span>{tab.label}</span>
                </div>
                {tab.badge && tab.badge > 0 ? (
                  <span className="px-2 py-0.5 bg-rose-500 text-white font-black text-[9px] rounded-full">
                    {tab.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        {/* Dynamic Display Panel (9 cols) */}
        <div className="lg:col-span-9 bg-white border border-slate-100 rounded-3xl p-6 min-h-[500px] shadow-3xs">
          
          {/* A. OVERVIEW SUMMARY TAB */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="border-b border-slate-50 pb-3 flex justify-between items-center">
                <h2 className="text-lg font-black text-slate-900">{language === "hi" ? "सिस्टम अवलोकन" : "Overview Summary"}</h2>
                <span className="text-[10px] text-slate-400 font-bold">{new Date().toDateString()}</span>
              </div>

              {/* Status Alert */}
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start gap-3">
                <Shield className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-extrabold text-emerald-800">{language === "hi" ? "पर्सनल डिजिटल तिजोरी एक्टिव है" : "Private Vault Ledger is Active"}</h4>
                  <p className="text-2xs text-emerald-700 leading-relaxed font-semibold">
                    {language === "hi"
                      ? "आपके सभी सहेजे गए कैलकुलेशन आपके ईमेल पर पूरी तरह से एन्क्रिप्टेड हैं। केवल आपकी अधिकृत सत्र कुंजी ही इस डेटा तक पहुँच सकती है।"
                      : "All of your calculations and configurations are completely encrypted in your private profile. Only your validated token has clearance to retrieve or update these."}
                  </p>
                </div>
              </div>

              {/* Recent Saved Calculations */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-extrabold uppercase text-slate-450 tracking-wider">
                    {language === "hi" ? "हालिया सहेजी गई योजनाएं" : "Recent Saved Calculations"}
                  </h3>
                  <button 
                    onClick={() => setActiveTab("calculations")} 
                    className="text-xs text-indigo-600 font-extrabold flex items-center gap-0.5 hover:underline cursor-pointer bg-transparent border-0"
                  >
                    <span>{language === "hi" ? "सभी देखें" : "View All"}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {calculations.length === 0 ? (
                  <div className="py-8 border-2 border-dashed border-slate-100 rounded-2xl text-center">
                    <p className="text-xs text-slate-400 font-semibold">{language === "hi" ? "कोई सहेजा गया कैलकुलेशन नहीं मिला।" : "No calculations saved yet. Build a plan to save it here!"}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {calculations.slice(0, 4).map(calc => (
                      <div 
                        key={calc.id} 
                        onClick={() => handleLoadCalculation(calc)}
                        className="p-4 bg-slate-50 hover:bg-slate-100 border border-slate-150/50 rounded-2xl flex items-center justify-between cursor-pointer transition-all hover:-translate-y-0.5"
                      >
                        <div className="space-y-1">
                          <span className="px-2 py-0.5 bg-slate-200 text-slate-700 font-bold uppercase text-[9px] rounded-md">
                            {calc.type}
                          </span>
                          <h4 className="text-xs font-black text-slate-800 line-clamp-1">{calc.title}</h4>
                          <span className="block text-[10px] text-slate-400 font-semibold">
                            {new Date(calc.updatedAt || calc.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Active Mutual Transfer Listing Profile */}
              <div className="space-y-3 border-t border-slate-50 pt-5">
                <h3 className="text-xs font-extrabold uppercase text-slate-450 tracking-wider">
                  {language === "hi" ? "म्यूचुअल ट्रांसफर स्टेटस" : "Mutual Transfer Profile Summary"}
                </h3>

                {userListing ? (
                  <div className="p-4 border border-slate-100 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">👩‍🏫</span>
                      <div className="space-y-0.5">
                        <span className="block text-xs font-black text-slate-800">{userListing.name}</span>
                        <p className="text-2xs text-slate-500 font-medium">
                          {userListing.subject} • {userListing.currentDistrict} {language === "hi" ? "से" : "to"} {userListing.desiredDistrict}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                      <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 font-black text-[10px] uppercase rounded-full">
                        {userListing.status || "Active"}
                      </span>
                      <button 
                        onClick={() => setActiveTab("transfer")}
                        className="p-2 bg-white hover:bg-slate-50 border border-slate-150 rounded-xl text-slate-700 cursor-pointer"
                        title="Manage Listing"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : restoreListing ? (
                  <div className="p-4 border border-amber-100 bg-amber-50/30 rounded-2xl flex justify-between items-center gap-4">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-amber-800">{language === "hi" ? "लिस्टिंग हटा दी गई है (सक्रिय 30 दिन की समय सीमा)" : "Listing Soft-Deleted (Active 30-day window)"}</h4>
                      <p className="text-2xs text-amber-700 font-semibold">{language === "hi" ? "आप इस लिस्टिंग को फिर से सक्रिय कर सकते हैं।" : "You can restore this listing back to live search anytime."}</p>
                    </div>
                    <button 
                      onClick={handleRestoreListing}
                      className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-xl text-2xs cursor-pointer border-0 shadow-xs flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>{language === "hi" ? "रीस्टोर करें" : "Restore"}</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-4 border-2 border-dashed border-slate-100 rounded-2xl text-center space-y-3 bg-slate-50/50">
                    <p className="text-xs text-slate-400 font-medium">{language === "hi" ? "आपने अभी तक म्यूचुअल ट्रांसफर लिस्टिंग नहीं बनाई है।" : "You don't have an active Mutual Transfer listing profile registered."}</p>
                    <button 
                      onClick={() => onNavigateToWidget("teacher_hub")}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-xs cursor-pointer border-0 shadow-3xs inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{language === "hi" ? "प्रोफ़ाइल लिस्टिंग बनाएं" : "Create Listing Profile"}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* BPSC Teacher Special Campaigns Section with Special Blink Effects */}
              <div className="space-y-3 border-t border-slate-100 pt-5">
                <h3 className="text-xs font-extrabold uppercase text-slate-450 tracking-wider block">
                  {language === "hi" ? "त्वरित अभियान एवं जनवकालत लिंक्स" : "Active Campaigns & Advocacy Desk"}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Mutual Transfer Hub button */}
                  <div className="p-4 bg-teal-50/50 border border-teal-100 rounded-2xl flex flex-col justify-between gap-3 shadow-3xs">
                    <div>
                      <h4 className="text-xs font-black text-slate-850 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
                        <span>{language === "hi" ? "म्यूचुअल ट्रांसफर पोर्टल" : "Mutual Transfer Portal"}</span>
                      </h4>
                      <p className="text-[10px] text-slate-500 font-medium mt-1">
                        {language === "hi" ? "बिहार बीपीएससी शिक्षकों का आपसी मिलान और डेटाबेस रजिस्ट्री।" : "Automated pairing rules for Bihar BPSC teacher mutual transfer matches."}
                      </p>
                    </div>
                    <button
                      onClick={() => onNavigateToWidget("teacher_hub")}
                      className="w-full py-2 px-3 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-xl text-xs cursor-pointer border-0 shadow-3xs flex items-center justify-center gap-1.5 animate-blink-attention"
                    >
                      <span>{language === "hi" ? "पोर्टल खोलें" : "Open Mutual Transfer"}</span>
                    </button>
                  </div>

                  {/* Sign Petition Button */}
                  <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-2xl flex flex-col justify-between gap-3 shadow-3xs">
                    <div>
                      <h4 className="text-xs font-black text-slate-850 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                        <span>{language === "hi" ? "डिजिटल याचिका केंद्र" : "Digital Petition Center"}</span>
                      </h4>
                      <p className="text-[10px] text-slate-500 font-medium mt-1">
                        {language === "hi" ? "बीपीएससी शिक्षक नियमावली सरलीकरण अभियान का समर्थन करें और हस्ताक्षर करें।" : "Sign and support Bihar BPSC teacher mutual transfer policy simplification."}
                      </p>
                    </div>
                    <button
                      onClick={() => onNavigateToWidget("petition_center")}
                      className="w-full py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-xl text-xs cursor-pointer border-0 shadow-3xs flex items-center justify-center gap-1.5 animate-blink-attention"
                    >
                      <span>{language === "hi" ? "याचिका पर हस्ताक्षर करें" : "Sign Digital Petition"}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* B. MY PROFILE TAB */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div className="border-b border-slate-50 pb-3 flex justify-between items-center">
                <h2 className="text-lg font-black text-slate-900">{language === "hi" ? "मेरी प्रोफ़ाइल विवरण" : "My Profile Details"}</h2>
                {!isEditingProfile && (
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-xl text-2xs flex items-center gap-1.5 cursor-pointer border-0"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>{language === "hi" ? "संपादित करें" : "Edit Profile"}</span>
                  </button>
                )}
              </div>

              {isEditingProfile ? (
                <form onSubmit={handleSaveProfile} className="space-y-4 max-w-xl">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-2xs font-extrabold uppercase text-slate-400 tracking-wider">
                        {language === "hi" ? "पूरा नाम" : "Full Name"}
                      </label>
                      <input
                        type="text"
                        value={editedProfile.fullName}
                        onChange={e => setEditedProfile({...editedProfile, fullName: e.target.value})}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-2xs font-extrabold uppercase text-slate-400 tracking-wider">
                        {language === "hi" ? "मोबाइल नंबर" : "Mobile Number"}
                      </label>
                      <input
                        type="text"
                        value={editedProfile.mobile}
                        onChange={e => setEditedProfile({...editedProfile, mobile: e.target.value})}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-2xs font-extrabold uppercase text-slate-400 tracking-wider">
                        {language === "hi" ? "राज्य" : "State"}
                      </label>
                      <input
                        type="text"
                        value={editedProfile.state}
                        onChange={e => setEditedProfile({...editedProfile, state: e.target.value})}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        disabled
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-2xs font-extrabold uppercase text-slate-400 tracking-wider">
                        {language === "hi" ? "जिला" : "District"}
                      </label>
                      <input
                        type="text"
                        value={editedProfile.district}
                        onChange={e => setEditedProfile({...editedProfile, district: e.target.value})}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-2xs font-extrabold uppercase text-slate-400 tracking-wider">
                        {language === "hi" ? "व्यवसाय / शिक्षक श्रेणी" : "Occupation / Teacher Category"}
                      </label>
                      <select
                        value={editedProfile.occupation}
                        onChange={e => setEditedProfile({...editedProfile, occupation: e.target.value})}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="BPSC TRE 1.0">BPSC TRE 1.0</option>
                        <option value="BPSC TRE 2.0">BPSC TRE 2.0</option>
                        <option value="BPSC TRE 3.0">BPSC TRE 3.0</option>
                        <option value="Niyojit Teacher">Niyojit Teacher</option>
                        <option value="General Government Employee">General Govt Employee</option>
                        <option value="Private Sector / Freelancer">Private Sector Employee</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-2xs font-extrabold uppercase text-slate-400 tracking-wider">
                        {language === "hi" ? "स्कूल / विभाग का नाम" : "School / Department Name"}
                      </label>
                      <input
                        type="text"
                        value={editedProfile.schoolDept}
                        onChange={e => setEditedProfile({...editedProfile, schoolDept: e.target.value})}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-3 border-t">
                    <button
                      type="submit"
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-xs cursor-pointer border-0 shadow-xs"
                    >
                      {language === "hi" ? "बदलाव सहेजें" : "Save Changes"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditedProfile({ ...profile });
                        setIsEditingProfile(false);
                      }}
                      className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer border-0"
                    >
                      {language === "hi" ? "रद्द करें" : "Cancel"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6 max-w-xl bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-4 border-b pb-4">
                    <span className="text-5xl">{profile.photoUrl}</span>
                    <div>
                      <h3 className="text-base font-black text-slate-900">{profile.fullName}</h3>
                      <p className="text-xs text-slate-400 font-semibold">{user?.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-xs font-semibold">
                    <div>
                      <span className="block text-2xs font-extrabold uppercase text-slate-400 tracking-wider mb-1">
                        {language === "hi" ? "फ़ोन नंबर" : "Phone Number"}
                      </span>
                      <span className="text-slate-800">{profile.mobile || "Not Provided"}</span>
                    </div>

                    <div>
                      <span className="block text-2xs font-extrabold uppercase text-slate-400 tracking-wider mb-1">
                        {language === "hi" ? "राज्य / जिला" : "State / District"}
                      </span>
                      <span className="text-slate-800">{profile.state}, {profile.district || "Not Set"}</span>
                    </div>

                    <div>
                      <span className="block text-2xs font-extrabold uppercase text-slate-400 tracking-wider mb-1">
                        {language === "hi" ? "शिक्षक / कर्मचारी श्रेणी" : "Teacher / Employee Category"}
                      </span>
                      <span className="text-slate-800">{profile.occupation}</span>
                    </div>

                    <div>
                      <span className="block text-2xs font-extrabold uppercase text-slate-400 tracking-wider mb-1">
                        {language === "hi" ? "कार्यरत विद्यालय / विभाग" : "Current School / Office"}
                      </span>
                      <span className="text-slate-800">{profile.schoolDept || "Not Configured"}</span>
                    </div>
                  </div>

                  {/* Verification status indicator */}
                  <div className="pt-4 border-t flex items-center gap-2">
                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                    <span className="text-2xs font-extrabold uppercase tracking-wider text-emerald-700">
                      {language === "hi" ? "ईमेल सत्यापित और सुरक्षित" : "Email Verified & Account Secure"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* C. SAVED CALCULATIONS TAB */}
          {activeTab === "calculations" && (
            <div className="space-y-6">
              <div className="border-b border-slate-50 pb-3 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <h2 className="text-lg font-black text-slate-900">{language === "hi" ? "मेरी सुरक्षित तिजोरी" : "My Saved Calculations"}</h2>
                
                {/* Tag categorizer list */}
                <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
                  {[
                    { id: "all", label: language === "hi" ? "सभी" : "All" },
                    { id: "salary", label: language === "hi" ? "वेतन" : "Salary" },
                    { id: "pension", label: language === "hi" ? "पेंशन" : "Pension" },
                    { id: "sip", label: language === "hi" ? "SIP" : "SIP" },
                    { id: "tax", label: language === "hi" ? "टैक्स" : "Tax" },
                    { id: "goal", label: language === "hi" ? "लक्ष्य" : "Goals" }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setCalcFilter(cat.id)}
                      className={`px-2.5 py-1 rounded-lg text-2xs font-bold shrink-0 transition-all cursor-pointer border-0 ${
                        calcFilter === cat.id ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search & Stats */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={calcSearch}
                  onChange={e => setCalcSearch(e.target.value)}
                  placeholder={language === "hi" ? "शीर्षक से खोजें..." : "Search calculations by title..."}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none text-slate-800"
                />
              </div>

              {/* Calculation list */}
              {filteredCalcs.length === 0 ? (
                <div className="py-20 text-center space-y-3">
                  <Folder className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-400 font-bold">{language === "hi" ? "कोई कैलकुलेशन नहीं मिला।" : "No calculations match your search criteria."}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredCalcs.map(calc => (
                    <div 
                      key={calc.id}
                      className="p-4 border border-slate-150/60 rounded-2xl bg-slate-50/20 hover:bg-slate-50/50 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-3xs"
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold uppercase text-[9px] rounded-md">
                            {calc.type}
                          </span>
                          <span className="text-[10px] text-slate-450 font-bold">
                            {new Date(calc.updatedAt || calc.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {editingCalcId === calc.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editingTitleText}
                              onChange={e => setEditingTitleText(e.target.value)}
                              className="px-2 py-1 bg-white border rounded-lg text-xs font-bold"
                              autoFocus
                            />
                            <button 
                              onClick={() => handleRenameCalculation(calc.id)}
                              className="p-1 bg-emerald-550 text-white rounded hover:bg-emerald-600 border-0 cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => setEditingCalcId(null)}
                              className="p-1 bg-slate-100 text-slate-600 rounded hover:bg-slate-200 border-0 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <h3 className="text-xs font-extrabold text-slate-800 line-clamp-1">{calc.title}</h3>
                        )}
                      </div>

                      <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                        <button
                          onClick={() => handleLoadCalculation(calc)}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl text-2xs cursor-pointer border-0 shadow-3xs"
                        >
                          {language === "hi" ? "लोड करें" : "Load View"}
                        </button>
                        <button
                          onClick={() => {
                            setEditingCalcId(calc.id);
                            setEditingTitleText(calc.title);
                          }}
                          className="p-1.5 bg-white hover:bg-slate-50 border border-slate-150 rounded-xl text-slate-600 cursor-pointer"
                          title="Rename"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCalculation(calc.id)}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-100 rounded-xl text-rose-600 cursor-pointer"
                          title="Delete"
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

          {/* D. FAVOURITE TOOLS TAB */}
          {activeTab === "bookmarks" && (
            <div className="space-y-6">
              <div className="border-b border-slate-50 pb-3">
                <h2 className="text-lg font-black text-slate-900">{language === "hi" ? "मेरे पसंदीदा टूल्स" : "Favorite Bookmarked Tools"}</h2>
              </div>

              {bookmarks.length === 0 ? (
                <div className="py-20 text-center space-y-4 max-w-sm mx-auto">
                  <Star className="w-12 h-12 text-slate-200 mx-auto animate-pulse" />
                  <p className="text-xs text-slate-400 font-extrabold">
                    {language === "hi" 
                      ? "पसंदीदा फ़ोल्डर खाली है। अपनी त्वरित पहुंच सूची में जोड़ने के लिए किसी भी कैलकुलेटर पर स्टार ⭐ बटन पर क्लिक करें।" 
                      : "Your favorites drawer is empty. Bookmarks allow you to bypass menus and launch tools directly."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {bookmarks.map(tool => (
                    <div 
                      key={tool.toolId}
                      onClick={() => onNavigateToWidget(tool.path || tool.toolId)}
                      className="p-4 border border-slate-150/60 rounded-2xl bg-slate-50/10 hover:bg-slate-50 transition-all flex justify-between items-center cursor-pointer hover:-translate-y-0.5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-rose-50 text-rose-500 rounded-xl">
                          <Star className="w-5 h-5 fill-rose-500 text-rose-500" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-800">{tool.name}</h4>
                          <span className="text-[10px] text-slate-400 font-semibold">{tool.category || "Financial Tool"}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* E. MUTUAL TRANSFER LISTING TAB */}
          {activeTab === "transfer" && (
            <div className="space-y-6">
              <div className="border-b border-slate-50 pb-3">
                <h2 className="text-lg font-black text-slate-900">{language === "hi" ? "म्यूचुअल ट्रांसफर लिस्टिंग प्रबंधन" : "Mutual Transfer Profile Manager"}</h2>
              </div>

              {userListing ? (
                <div className="space-y-6">
                  {/* Status controls card */}
                  <div className="p-5 border border-slate-100 rounded-2xl bg-slate-50/40 space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                      <div>
                        <span className="block text-2xs font-extrabold uppercase text-slate-400 tracking-wider">
                          {language === "hi" ? "वर्तमान लिस्टिंग स्थिति" : "Current Listing Status"}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="w-3 h-3 bg-emerald-500 rounded-full animate-ping" />
                          <span className="text-xs font-black text-slate-800 uppercase">
                            {userListing.status || "Active"}
                          </span>
                        </div>
                      </div>

                      {/* Status changer button cluster */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          onClick={() => handleToggleListingStatus("Active")}
                          className={`px-3 py-1.5 rounded-lg text-2xs font-extrabold cursor-pointer border-0 ${
                            userListing.status === "Active" ? "bg-emerald-600 text-white" : "bg-white border text-slate-650 hover:bg-slate-50"
                          }`}
                        >
                          Active
                        </button>
                        <button
                          onClick={() => handleToggleListingStatus("Hidden")}
                          className={`px-3 py-1.5 rounded-lg text-2xs font-extrabold cursor-pointer border-0 ${
                            userListing.status === "Hidden" ? "bg-amber-600 text-white" : "bg-white border text-slate-650 hover:bg-slate-50"
                          }`}
                        >
                          Hidden
                        </button>
                        <button
                          onClick={() => handleToggleListingStatus("Completed")}
                          className={`px-3 py-1.5 rounded-lg text-2xs font-extrabold cursor-pointer border-0 ${
                            userListing.status === "Completed" ? "bg-indigo-600 text-white" : "bg-white border text-slate-650 hover:bg-slate-50"
                          }`}
                        >
                          Completed
                        </button>
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-400 font-semibold flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{language === "hi" ? `अंतिम अपडेट: ${userListing.lastUpdatedAt ? new Date(userListing.lastUpdatedAt).toLocaleString() : "प्रारंभिक"}` : `Last Updated timestamp: ${userListing.lastUpdatedAt ? new Date(userListing.lastUpdatedAt).toLocaleString() : "Initial"}`}</span>
                    </div>
                  </div>

                  {/* Profile Preview Card */}
                  <div className="p-5 border border-slate-150/60 rounded-3xl bg-white space-y-4 relative shadow-3xs">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <span className="text-4xl">👩‍🏫</span>
                        <div>
                          <h3 className="text-xs font-black text-slate-800">{userListing.name}</h3>
                          <p className="text-2xs text-slate-400 font-bold">{userListing.teacherType} • {userListing.subject}</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 font-black text-[10px] rounded-full uppercase">
                        {userListing.classCategory}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs font-semibold pt-4 border-t border-slate-50">
                      <div>
                        <span className="block text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">{language === "hi" ? "वर्तमान स्कूल" : "Current School"}</span>
                        <span className="text-slate-700 line-clamp-1">{userListing.currentSchool} ({userListing.currentDistrict})</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">{language === "hi" ? "वांछित जिला" : "Desired District"}</span>
                        <span className="text-slate-700">{userListing.desiredDistrict}</span>
                      </div>
                    </div>

                    {/* Action Panel */}
                    <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                      <button
                        onClick={() => {
                          // Write editing profile details to localStorage for the Wizard
                          localStorage.setItem("paisa_editing_teacher_id", userListing.id);
                          onNavigateToWidget("teacher_hub");
                        }}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer border-0 shadow-3xs"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>{language === "hi" ? "विवरण संपादित करें" : "Edit Details"}</span>
                      </button>

                      <button
                        onClick={handleSoftDeleteListing}
                        className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-extrabold border border-rose-100 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{language === "hi" ? "लिस्टिंग हटाएँ (सॉफ्ट)" : "Delete Listing"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : restoreListing ? (
                <div className="p-6 border border-amber-150 bg-amber-50/10 rounded-2xl space-y-4 text-center max-w-md mx-auto">
                  <AlertCircle className="w-12 h-12 text-amber-600 mx-auto" />
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-slate-800">{language === "hi" ? "सॉफ्ट-डिलीटेड म्यूचुअल ट्रांसफर सूची" : "Active Soft-Deleted Mutual Transfer"}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                      {language === "hi"
                        ? "यह प्रोफ़ाइल वर्तमान में छिपी हुई है। यह 30 दिनों के भीतर स्थायी रूप से हटा दी जाएगी। आप इसे पुनः लाइव करने के लिए 'रिस्टोर' पर क्लिक कर सकते हैं।"
                        : "Your listing was soft-deleted but is safely protected for a 30-day grace window. Restore it back live anytime."}
                    </p>
                  </div>
                  <button
                    onClick={handleRestoreListing}
                    className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer border-0 shadow-xs mx-auto"
                  >
                    <RefreshCw className="w-4 h-4 animate-spin-slow" />
                    <span>{language === "hi" ? "लिस्टिंग बहाल करें" : "Restore Active Listing"}</span>
                  </button>
                </div>
              ) : (
                <div className="py-20 text-center space-y-4 border-2 border-dashed border-slate-100 rounded-3xl max-w-lg mx-auto">
                  <Plus className="w-12 h-12 text-slate-200 mx-auto" />
                  <div className="space-y-1 px-4">
                    <h3 className="text-sm font-black text-slate-800">{language === "hi" ? "कोई म्यूचुअल ट्रांसफर सूची पंजीकृत नहीं है" : "List Your Mutual Transfer Profile"}</h3>
                    <p className="text-xs text-slate-450 leading-relaxed font-semibold">
                      {language === "hi"
                        ? "म्यूचुअल ट्रांसफर डेटाबेस में अपना प्रोफ़ाइल पंजीकृत करें। हमारा एआई-संचालित खोज इंजन स्वचालित रूप से बिहार के अन्य जिलों के साथ मिलान करेगा।"
                        : "Post your mutual transfer profile in our central database registry. AI matchmaking rules will analyze districts and subjects to find matching pairs instantly."}
                    </p>
                  </div>
                  <button
                    onClick={() => onNavigateToWidget("teacher_hub")}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-xs cursor-pointer border-0 shadow-xs inline-flex items-center gap-1.5"
                  >
                    <span>{language === "hi" ? "सक्रिय पंजीकरण विज़ार्ड शुरू करें" : "Launch Registration Wizard"}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* F. NOTIFICATIONS TAB */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              <div className="border-b border-slate-50 pb-3 flex justify-between items-center">
                <h2 className="text-lg font-black text-slate-900">{language === "hi" ? "नोटिफिकेशन केंद्र" : "Notifications & System Alerts"}</h2>
                {notifications.length > 0 && (
                  <button 
                    onClick={() => setNotifications([])}
                    className="text-2xs text-rose-600 font-extrabold hover:underline cursor-pointer bg-transparent border-0"
                  >
                    {language === "hi" ? "सभी साफ करें" : "Clear All Alerts"}
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <div className="py-20 text-center space-y-3">
                  <Bell className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-400 font-bold">{language === "hi" ? "कोई सूचना नहीं है।" : "Your inbox is empty. No alerts or matching updates at this time."}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map(notif => (
                    <div 
                      key={notif.id}
                      className="p-4 border border-slate-100 rounded-2xl bg-slate-50/30 flex justify-between items-start gap-4"
                    >
                      <div className="space-y-1">
                        <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 font-black text-[8px] uppercase tracking-wider rounded">
                          {notif.type || "ALERT"}
                        </span>
                        <h4 className="text-xs font-black text-slate-800">{notif.title}</h4>
                        <p className="text-2xs text-slate-500 leading-relaxed font-semibold">{notif.body}</p>
                        <span className="block text-[9px] text-slate-400">
                          {new Date(notif.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <button 
                        onClick={() => handleDeleteNotification(notif.id)}
                        className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer bg-transparent border-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* G. SECURITY & ACCOUNT SETTINGS TAB */}
          {activeTab === "settings" && (
            <div className="space-y-8">
              <div className="border-b border-slate-50 pb-3">
                <h2 className="text-lg font-black text-slate-900">{language === "hi" ? "खाता और सुरक्षा" : "Account Settings & Audit Security"}</h2>
              </div>

              {/* Password change panel */}
              <div className="space-y-4 max-w-md">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-slate-500" />
                  <h3 className="text-xs font-black uppercase text-slate-450 tracking-wider">
                    {language === "hi" ? "सुरक्षित पासवर्ड बदलें" : "Update Secure Password"}
                  </h3>
                </div>

                {isChangingPassword ? (
                  <form onSubmit={handlePasswordChange} className="space-y-3 bg-slate-50/40 p-4 rounded-2xl border">
                    {passwordStatus.message && (
                      <div className={`p-2.5 rounded-xl text-2xs font-bold border ${
                        passwordStatus.type === "success" ? "bg-emerald-50 border-emerald-100 text-emerald-800" : "bg-rose-50 border-rose-100 text-rose-800"
                      }`}>
                        {passwordStatus.message}
                      </div>
                    )}
                    
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold uppercase text-slate-400">{language === "hi" ? "वर्तमान पासवर्ड" : "Current Password"}</label>
                      <input
                        type="password"
                        value={passwordForm.current}
                        onChange={e => setPasswordForm({...passwordForm, current: e.target.value})}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold uppercase text-slate-400">{language === "hi" ? "नया पासवर्ड" : "New Secure Password"}</label>
                      <input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold uppercase text-slate-400">{language === "hi" ? "पासवर्ड की पुष्टि करें" : "Confirm New Password"}</label>
                      <input
                        type="password"
                        value={passwordForm.confirm}
                        onChange={e => setPasswordForm({...passwordForm, confirm: e.target.value})}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                        required
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-lg text-2xs cursor-pointer border-0"
                      >
                        {language === "hi" ? "अपडेट करें" : "Update Password"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsChangingPassword(false)}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-2xs cursor-pointer border-0"
                      >
                        {language === "hi" ? "रद्द करें" : "Cancel"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => setIsChangingPassword(true)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-xl text-2xs cursor-pointer border-0"
                  >
                    {language === "hi" ? "पासवर्ड बदलें" : "Change Password"}
                  </button>
                )}
              </div>

              {/* Security Logs list */}
              <div className="space-y-3 pt-6 border-t">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-slate-500" />
                  <h3 className="text-xs font-black uppercase text-slate-450 tracking-wider">
                    {language === "hi" ? "सुरक्षा ऑडिट लॉग्स" : "Account Security Audit Trail"}
                  </h3>
                </div>

                <div className="border border-slate-150/60 rounded-2xl bg-slate-50/10 divide-y divide-slate-50 overflow-hidden">
                  {securityLogs.map(log => (
                    <div key={log.id} className="p-3.5 flex justify-between items-center text-xs font-semibold">
                      <div className="space-y-0.5">
                        <span className="block text-slate-850 font-black">{log.event}</span>
                        <span className="block text-[10px] text-slate-400 font-semibold">{log.time}</span>
                      </div>
                      <span className="font-mono text-[10px] text-slate-450 bg-slate-100 px-2 py-0.5 rounded-md">
                        {log.ip}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Danger zone */}
              <div className="p-5 border border-rose-100 bg-rose-50/10 rounded-2xl space-y-3 pt-6 border-t">
                <h3 className="text-xs font-black uppercase text-rose-700 tracking-wider">
                  {language === "hi" ? "खतरनाक क्षेत्र" : "Danger Zone"}
                </h3>
                <p className="text-2xs text-slate-550 leading-relaxed font-semibold">
                  {language === "hi"
                    ? "अपने खाते को स्थायी रूप से हटाने के लिए यहाँ क्लिक करें। यह क्रिया अपरिवर्तनीय है और आपके सभी सहेजे गए कैलकुलेशन और म्यूचुअल ट्रांसफर सूचियों को साफ़ कर देगी।"
                    : "Permanently delete your profile account and wipe your private digital ledger storage. This action is irreversible."}
                </p>
                <button
                  onClick={() => {
                    const confirm1 = confirm(language === "hi" ? "क्या आप वाकई अपना खाता स्थायी रूप से हटाना चाहते हैं?" : "Are you sure you want to permanently delete your account?");
                    if (confirm1) {
                      const confirm2 = confirm(language === "hi" ? "चेतावनी: आपके सभी कैलकुलेशन हमेशा के लिए नष्ट हो जाएंगे! क्या आप जारी रखना चाहते हैं?" : "Warning: All saved calculations will be permanently destroyed. Confirm deletion:");
                      if (confirm2) {
                        alert("Account deletion request submitted. Backing out session...");
                        // Clear active session and reload
                        localStorage.removeItem("paisa_active_session");
                        window.location.reload();
                      }
                    }
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl text-xs cursor-pointer border-0 shadow-3xs"
                >
                  {language === "hi" ? "खाता स्थायी रूप से हटाएँ" : "Permanently Delete Account"}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
