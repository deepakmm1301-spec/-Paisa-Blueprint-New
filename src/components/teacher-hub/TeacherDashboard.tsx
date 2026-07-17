import React, { useState, useEffect, useMemo } from "react";
import { 
  Teacher, 
  TransferRequest, 
  Notification, 
  SavedSearch, 
  calculateMatchScore, 
  getMatchGrade, 
  globalTeacherStore 
} from "./TeacherDataStore";
import { 
  Users, 
  Send, 
  Inbox, 
  Bell, 
  Bookmark, 
  UserCheck, 
  ShieldCheck, 
  LogOut, 
  PhoneCall, 
  CheckCircle2, 
  XCircle,
  HelpCircle,
  Clock,
  Sparkles,
  MapPin,
  MessageSquare,
  Share2,
  Search
} from "lucide-react";
import SearchPage from "./SearchPage";

interface TeacherDashboardProps {
  language: "en" | "hi";
  teacher: Teacher;
  onLogout: () => void;
  onNavigateToSearch: () => void;
}

const TeacherAvatar = ({ gender }: { gender?: string }) => (
  <div className="h-12 w-12 rounded-full border-2 border-white bg-amber-400 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
    <svg className="w-8 h-8 text-slate-800" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Head */}
      <circle cx="32" cy="24" r="14" fill="#fed7aa" />
      {/* Hair for female/male */}
      {gender === "Female" ? (
        <path d="M18 20C18 11 25 10 32 10C39 10 46 11 46 20C46 25 44 28 42 28C40 28 39 25 32 25C25 25 24 28 22 28C20 28 18 25 18 20Z" fill="#7c2d12" />
      ) : (
        <path d="M18 20C18 12 24 10 32 10C40 10 46 12 46 20C44 19 41 18 32 18C23 18 20 19 18 20Z" fill="#1e293b" />
      )}
      {/* Glasses */}
      <circle cx="26" cy="24" r="4" stroke="#1e293b" strokeWidth="2" />
      <circle cx="38" cy="24" r="4" stroke="#1e293b" strokeWidth="2" />
      <line x1="30" y1="24" x2="34" y2="24" stroke="#1e293b" strokeWidth="2" />
      {/* Smile */}
      <path d="M28 31C29.5 32.5 34.5 32.5 36 31" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
      {/* Clothes / Body */}
      <path d="M14 50C14 42 22 40 32 40C42 40 50 42 50 50V56H14V50Z" fill={gender === "Female" ? "#0d9488" : "#2563eb"} />
      <path d="M32 40L28 46H36L32 40Z" fill="#fed7aa" />
    </svg>
  </div>
);

export default function TeacherDashboard({ language, teacher, onLogout, onNavigateToSearch }: TeacherDashboardProps) {
  const [activeTab, setActiveTab] = useState<"matches" | "search" | "inbound" | "outbound" | "notifications" | "searches">("matches");
  
  // Local reactive states loaded from global store
  const [requests, setRequests] = useState<TransferRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [privacyHidden, setPrivacyHidden] = useState(false);
  const [teachers, setTeachers] = useState(() => globalTeacherStore.getTeachers());

  useEffect(() => {
    globalTeacherStore.syncWithServer();
    loadDashboardData();
    const unsubscribe = globalTeacherStore.subscribe(() => {
      loadDashboardData();
      setTeachers(globalTeacherStore.getTeachers());
    });
    return unsubscribe;
  }, [teacher.id]);

  const loadDashboardData = () => {
    setRequests(globalTeacherStore.getRequestsForTeacher(teacher.id));
    setNotifications(globalTeacherStore.getNotifications(teacher.id));
    setSavedSearches(globalTeacherStore.getSavedSearches(teacher.id));
  };

  // 1. Calculate Active Matches (other teachers matching our desired district, sorted by score)
  const matches = useMemo(() => {
    const all = teachers.filter(t => t.id !== teacher.id);
    
    return all.map(t => {
      const { score, details } = calculateMatchScore(teacher, t);
      const matchGrade = getMatchGrade(score);
      return { teacher: t, score, details, matchGrade };
    })
    .filter(m => m.score >= 50) // Show compatible matches scoring above 50%
    .sort((a, b) => b.score - a.score);
  }, [teacher, requests, teachers]);

  // 2. Inbound pending interests
  const inboundRequests = useMemo(() => {
    return requests.filter(r => r.toTeacherId === teacher.id && r.status === "Pending");
  }, [requests, teacher.id]);

  // 3. Outbound pending/accepted interests
  const outboundRequests = useMemo(() => {
    return requests.filter(r => r.fromTeacherId === teacher.id);
  }, [requests, teacher.id]);

  // Handle Accept Transfer Interest Proposal
  const handleAcceptProposal = (requestId: string) => {
    globalTeacherStore.respondToInterest(requestId, "Accepted");
    globalTeacherStore.logAudit(teacher.name, `Accepted swap proposal request ID: ${requestId}`);
    loadDashboardData();
    alert("Congratulations: Proposal Accepted! Both contact numbers have been securely disclosed below. Please call each other to coordinate physical NOC papers.");
  };

  // Handle Decline Transfer Interest Proposal
  const handleDeclineProposal = (requestId: string) => {
    if (window.confirm("Are you sure you want to decline this transfer proposal?")) {
      globalTeacherStore.respondToInterest(requestId, "Declined");
      globalTeacherStore.logAudit(teacher.name, `Declined swap proposal request ID: ${requestId}`);
      loadDashboardData();
    }
  };

  // Delete Saved Search
  const handleDeleteSearch = (id: string) => {
    globalTeacherStore.deleteSavedSearch(id);
    globalTeacherStore.logAudit(teacher.name, "Deleted saved filter matching query.");
    loadDashboardData();
  };

  // Clear Notifications
  const handleClearNotifications = () => {
    globalTeacherStore.clearAllNotifications(teacher.id);
    loadDashboardData();
  };

  const handleTogglePrivacy = () => {
    setPrivacyHidden(!privacyHidden);
    globalTeacherStore.logAudit(teacher.name, `Toggled public visibility to: ${!privacyHidden ? "Hidden" : "Public"}`);
    alert(`Privacy settings updated. Your profile is now ${!privacyHidden ? "Hidden (Not discoverable)" : "Public (Active matching)"}.`);
  };

  const handleSendInterestFromSearch = (toId: string) => {
    globalTeacherStore.sendInterest(teacher.id, toId);
    loadDashboardData();
  };

  return (
    <div className="space-y-6">
      {/* Quick Profile Summary Banner */}
      <div className="bg-gradient-to-r from-teal-800 to-teal-900 text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-teal-700/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <TeacherAvatar gender={teacher.gender} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight">{teacher.name}</h3>
                <span className="bg-amber-400 text-teal-950 font-black text-[9px] uppercase px-2 py-0.5 rounded-full border border-amber-300 shadow-3xs">
                  Active Member
                </span>
              </div>
              <p className="text-xs text-teal-100 font-medium mt-0.5">
                {teacher.subject} • {teacher.currentSchool}
              </p>
              <p className="text-[10px] text-teal-200 mt-0.5 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-amber-400" />
                <span>Current: <strong>{teacher.currentDistrict}</strong> &rarr; Desired: <strong className="text-amber-400">{teacher.desiredDistrict} ({teacher.desiredBlock || "Any"})</strong></span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Share to WhatsApp Button */}
            <button
              onClick={() => {
                const text = language === "hi"
                  ? `मेरा बिहार शिक्षक आपसी स्थानांतरण प्रोफ़ाइल 🧑‍🏫\n\n📌 नाम: ${teacher.name}\n🏫 वर्तमान स्कूल: ${teacher.currentSchool} (${teacher.currentDistrict})\n📚 विषय: ${teacher.subject}\n🎓 कक्षा: ${teacher.classCategory}\n💼 शिक्षक प्रकार: ${teacher.teacherType}\n🎯 इच्छित जिला: ${teacher.desiredDistrict}\n\nयदि आप आपसी स्थानांतरण में रुचि रखते हैं, तो कृपया मुझसे संपर्क करें। अभी वेबसाइट देखें: ${window.location.origin}${window.location.pathname}`
                  : `My Bihar BPSC Teacher Mutual Transfer Profile 🧑‍🏫\n\n📌 Name: ${teacher.name}\n🏫 Current School: ${teacher.currentSchool} (${teacher.currentDistrict})\n📚 Subject: ${teacher.subject}\n🎓 Class: ${teacher.classCategory}\n💼 Teacher Type: ${teacher.teacherType}\n🎯 Desired District: ${teacher.desiredDistrict}\n\nConnect with me for a mutual transfer! Check the portal: ${window.location.origin}${window.location.pathname}`;
                window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
              }}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border-0 shadow-3xs"
              title={language === "hi" ? "व्हाट्सएप पर शेयर करें" : "Share profile on WhatsApp"}
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-100" />
              <span>{language === "hi" ? "व्हाट्सएप शेयर" : "WhatsApp Share"}</span>
            </button>

            <button
              onClick={handleTogglePrivacy}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border-0 cursor-pointer ${
                privacyHidden 
                  ? "bg-amber-500 text-teal-950 hover:bg-amber-600" 
                  : "bg-white/10 hover:bg-white/25 text-white"
              }`}
            >
              {privacyHidden ? "Unhide Profile" : "Go Private / Hide"}
            </button>

            <button
              onClick={onLogout}
              className="px-3.5 py-1.5 bg-red-650 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border-0 shadow-3xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard Sub Tab bar */}
      <div className="bg-white border border-slate-100 rounded-2xl p-1.5 flex flex-wrap gap-1 shadow-3xs">
        <button
          onClick={() => setActiveTab("matches")}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer border-0 ${
            activeTab === "matches" ? "bg-teal-700 text-white shadow-xs" : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>{language === "hi" ? "स्मार्ट मैच" : "Matches"} ({matches.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("search")}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer border-0 ${
            activeTab === "search" ? "bg-teal-700 text-white shadow-xs" : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Search className="w-4 h-4" />
          <span>{language === "hi" ? "जिला/ब्लॉक खोजें" : "Search Partner"}</span>
        </button>

        <button
          onClick={() => setActiveTab("inbound")}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer border-0 ${
            activeTab === "inbound" ? "bg-teal-700 text-white shadow-xs" : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Inbox className="w-4 h-4" />
          <span>{language === "hi" ? "आए आमंत्रण" : "Inbound Requests"} ({inboundRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("outbound")}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer border-0 ${
            activeTab === "outbound" ? "bg-teal-700 text-white shadow-xs" : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Send className="w-4 h-4" />
          <span>{language === "hi" ? "भेजे अनुरोध" : "My Proposals"} ({outboundRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("notifications")}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer border-0 ${
            activeTab === "notifications" ? "bg-teal-700 text-white shadow-xs" : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>{language === "hi" ? "अलर्ट" : "Alerts"} ({notifications.filter(n => !n.isRead).length})</span>
        </button>

        <button
          onClick={() => setActiveTab("searches")}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer border-0 ${
            activeTab === "searches" ? "bg-teal-700 text-white shadow-xs" : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>{language === "hi" ? "सहेजे फ़िल्टर" : "Saved Searches"} ({savedSearches.length})</span>
        </button>
      </div>

      {/* Dynamic Tab Body Sheet */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm min-h-[300px]">
        {/* Tab 1: AI Mutual Matches */}
        {activeTab === "matches" && (
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3 mb-4">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                AI Real-Time Bihar Partner Matches
              </h4>
              <p className="text-[11px] text-slate-500 mt-1">
                The scoring engine automatically calculates weight compatibility based on subjects, teacher types, class categories, and reciprocal district posting interests.
              </p>
            </div>

            {matches.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs space-y-3">
                <Users className="w-10 h-10 mx-auto opacity-40 text-teal-700" />
                <p className="font-extrabold text-slate-700">No high-compatibility mutual matching partners located yet.</p>
                <p className="max-w-xs mx-auto text-[11px]">We continue running daily scans as new Bihar teachers register from other blocks. Try expanding your filters!</p>
                <button
                  onClick={onNavigateToSearch}
                  className="px-4 py-2 bg-teal-700 text-white font-bold rounded-xl text-xs cursor-pointer border-0 shadow-3xs mt-2"
                >
                  Browse Global Directory
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {matches.map((item) => (
                  <div key={item.teacher.id} className="border border-slate-150 rounded-2xl p-4.5 bg-slate-50/10 hover:border-teal-200 transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-100 mb-3">
                      <div className="flex items-center gap-3">
                        <TeacherAvatar gender={item.teacher.gender} />
                        <div>
                          <h5 className="text-xs font-black text-slate-800">{item.teacher.name}</h5>
                          <p className="text-[10px] text-slate-500 font-bold mt-0.5">{item.teacher.teacherType} • {item.teacher.subject}</p>
                        </div>
                      </div>

                      <div className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border text-center ${item.matchGrade.color}`}>
                        {item.matchGrade.text}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs font-medium mb-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold uppercase block">Current Location</span>
                        <span className="font-extrabold text-slate-800 mt-0.5 block">{item.teacher.currentSchool} ({item.teacher.currentDistrict})</span>
                        <span className="text-[10px] text-slate-500 block">Block: {item.teacher.currentBlock}</span>
                      </div>
                      <div className="border-l border-slate-200 pl-3">
                        <span className="text-[9px] text-slate-400 font-bold uppercase block">Desired Location</span>
                        <span className="font-extrabold text-teal-800 mt-0.5 block">{item.teacher.desiredDistrict}</span>
                        <span className="text-[10px] text-slate-500 block">Block: {item.teacher.desiredBlock || "Any"}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <div className="text-slate-400 font-semibold italic">
                        Why it matches: {item.details.slice(0, 2).join(", ")}
                      </div>

                      <button
                        onClick={() => {
                          globalTeacherStore.sendInterest(teacher.id, item.teacher.id);
                          alert(`Mutual transfer swap invitation proposal sent to "${item.teacher.name}"!`);
                          loadDashboardData();
                        }}
                        className="px-3.5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-bold flex items-center gap-1 border-0 cursor-pointer text-xs"
                      >
                        <Send className="w-3 h-3 text-amber-300" />
                        <span>Send Proposal</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Search Partners by District & Block */}
        {activeTab === "search" && (
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3 mb-4">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5 text-teal-800">
                <Search className="w-4 h-4 text-teal-700 animate-pulse" />
                Search Partners by District & Block
              </h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Filter and browse all registered government teachers across Bihar. Narrow down matches by specific current district, posting block, subject, class category, or TRE recruitment levels.
              </p>
            </div>

            <SearchPage 
              language={language}
              loggedInTeacher={teacher}
              onSendInterest={handleSendInterestFromSearch}
              onNavigateToRegister={() => {}}
            />
          </div>
        )}

        {/* Tab 3: Inbound Requests */}
        {activeTab === "inbound" && (
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3 mb-4">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Inbox className="w-4 h-4 text-teal-700" />
                Incoming Swap Proposals
              </h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Accepting a proposal instantly grants reciprocal access to both phone numbers and email contacts. Unaccepted profiles protect privacy automatically.
              </p>
            </div>

            {inboundRequests.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No active incoming swap requests at this time. Browse other teachers and propose swaps to receive replies!
              </div>
            ) : (
              <div className="space-y-4">
                {inboundRequests.map((req) => {
                  const sender = globalTeacherStore.getTeachers().find(t => t.id === req.fromTeacherId);
                  if (!sender) return null;

                  return (
                    <div key={req.id} className="border border-teal-100 rounded-2xl p-4.5 bg-teal-50/10">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-100 mb-3">
                        <div className="flex items-center gap-3">
                          <TeacherAvatar gender={sender.gender} />
                          <div>
                            <h5 className="text-xs font-black text-slate-800">{sender.name}</h5>
                            <p className="text-[10px] text-slate-500 font-bold mt-0.5">{sender.teacherType} • {sender.subject}</p>
                          </div>
                        </div>
                        <span className="text-[9px] bg-amber-100 border border-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-bold uppercase self-start">
                          Awaiting Action
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-xs font-medium mb-3 bg-white p-2.5 rounded-xl border border-slate-100 shadow-3xs">
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold uppercase block">Their School</span>
                          <span className="font-extrabold text-slate-800 mt-0.5 block">{sender.currentSchool} ({sender.currentDistrict})</span>
                        </div>
                        <div className="border-l border-slate-200 pl-3">
                          <span className="text-[9px] text-slate-400 font-bold uppercase block">Their Target Area</span>
                          <span className="font-extrabold text-teal-800 mt-0.5 block">{sender.desiredDistrict}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-4 pt-1">
                        <p className="text-[10px] text-slate-500 italic max-w-sm">
                          &ldquo;{sender.additionalNotes || "Ready for immediate transfer. Please accept proposal to coordinate paperwork."}&rdquo;
                        </p>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleDeclineProposal(req.id)}
                            className="px-3.5 py-2 border border-red-200 hover:bg-red-50 text-red-700 rounded-xl text-xs font-bold cursor-pointer bg-transparent"
                          >
                            Decline
                          </button>
                          <button
                            onClick={() => handleAcceptProposal(req.id)}
                            className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-black flex items-center gap-1 border-0 cursor-pointer shadow-3xs"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />
                            <span>Accept Swap</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Outbound Requests */}
        {activeTab === "outbound" && (
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3 mb-4">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Send className="w-4 h-4 text-teal-700" />
                Submitted Swap Proposals
              </h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Track status of transfer proposals you have sent to other teachers. Once accepted, contact parameters are instantly disclosed here.
              </p>
            </div>

            {outboundRequests.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                You have not submitted any mutual swap invitations yet. Visit the searchable directory to find compatible matches!
              </div>
            ) : (
              <div className="space-y-4">
                {outboundRequests.map((req) => {
                  const receiver = globalTeacherStore.getTeachers().find(t => t.id === req.toTeacherId);
                  if (!receiver) return null;

                  const isAccepted = req.status === "Accepted";

                  return (
                    <div 
                      key={req.id} 
                      className={`border rounded-2xl p-4.5 ${
                        isAccepted ? "border-emerald-200 bg-emerald-50/10" : "border-slate-100 bg-white"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-100 mb-3">
                        <div className="flex items-center gap-3">
                          <TeacherAvatar gender={receiver.gender} />
                          <div>
                            <h5 className="text-xs font-black text-slate-800">{receiver.name}</h5>
                            <p className="text-[10px] text-slate-500 font-bold mt-0.5">{receiver.teacherType} • {receiver.subject}</p>
                          </div>
                        </div>

                        <span className={`text-[9px] px-2.5 py-1 rounded-full font-bold uppercase self-start border ${
                          isAccepted 
                            ? "bg-emerald-100 border-emerald-200 text-emerald-800" 
                            : req.status === "Declined"
                            ? "bg-red-100 border-red-200 text-red-800"
                            : "bg-amber-100 border-amber-200 text-amber-800"
                        }`}>
                          {req.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-xs font-medium mb-3 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold uppercase block">Their School</span>
                          <span className="font-extrabold text-slate-800 mt-0.5 block">{receiver.currentSchool} ({receiver.currentDistrict})</span>
                        </div>
                        <div className="border-l border-slate-200 pl-3">
                          <span className="text-[9px] text-slate-400 font-bold uppercase block">Their Target Area</span>
                          <span className="font-extrabold text-teal-800 mt-0.5 block">{receiver.desiredDistrict}</span>
                        </div>
                      </div>

                      {isAccepted ? (
                        <div className="bg-emerald-55 border border-emerald-150 p-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-emerald-900 mt-2">
                          <div className="flex items-center gap-2">
                            <PhoneCall className="w-5 h-5 text-emerald-600 animate-bounce" />
                            <div>
                              <p className="text-xs font-black uppercase tracking-wider">Contact Details Disclosed</p>
                              <p className="text-sm font-black mt-0.5">Phone: {receiver.mobile} <span className="text-xs font-normal opacity-80">(WhatsApp)</span></p>
                              <p className="text-[11px] font-semibold opacity-95">Email: {receiver.email}</p>
                            </div>
                          </div>
                          <a
                            href={`https://wa.me/91${receiver.mobile}?text=${encodeURIComponent(`Hello ${receiver.name}, our mutual transfer request matches on Paisa Blueprint! We should coordinate school NOC papers for ${teacher.subject} transfer.`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-3.5 py-2 rounded-xl text-xs flex items-center justify-center gap-1 transition-all shadow-3xs border-0 no-underline"
                          >
                            <MessageSquare className="w-3.5 h-3.5 fill-current" />
                            <span>WhatsApp Coordinator</span>
                          </a>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-[10px] text-slate-450 mt-2">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Submitted on {new Date(req.sentAt).toLocaleDateString("en-IN")}. Contact number will unlock as soon as they accept.</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Notifications */}
        {activeTab === "notifications" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-teal-700" />
                Notification Alerts Feed
              </h4>
              {notifications.length > 0 && (
                <button
                  onClick={handleClearNotifications}
                  className="text-[10px] text-red-600 hover:text-red-700 font-bold border-0 bg-transparent cursor-pointer"
                >
                  Clear All Alerts
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No active notification alerts in your mailbox.
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    className={`p-3.5 rounded-xl border flex items-start gap-3 transition-colors ${
                      notif.isRead ? "border-slate-100 bg-white" : "border-teal-150 bg-teal-50/10"
                    }`}
                  >
                    <div className="h-2 w-2 rounded-full bg-teal-600 mt-2 shrink-0" />
                    <div className="space-y-0.5 flex-1">
                      <div className="flex items-center justify-between">
                        <h5 className="text-xs font-black text-slate-800">{notif.title}</h5>
                        <span className="text-[9px] text-slate-400 font-medium">
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{notif.body}</p>
                    </div>
                    {!notif.isRead && (
                      <button
                        onClick={() => {
                          globalTeacherStore.markNotificationAsRead(notif.id);
                          loadDashboardData();
                        }}
                        className="text-[9px] text-teal-700 hover:text-teal-800 font-bold border-0 bg-transparent cursor-pointer ml-2"
                      >
                        Dismiss
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Saved Searches */}
        {activeTab === "searches" && (
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3 mb-4">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Bookmark className="w-4 h-4 text-teal-700" />
                Saved Filter Subscriptions
              </h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Your saved query parameters are preserved here. We monitor daily state registrations and alert you automatically if a perfect match lands!
              </p>
            </div>

            {savedSearches.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                You have no active saved search subscriptions. Set up some filters on the Directory page and click &ldquo;Save This Filter&rdquo;.
              </div>
            ) : (
              <div className="space-y-3">
                {savedSearches.map((s) => (
                  <div key={s.id} className="border border-slate-100 rounded-xl p-3.5 bg-slate-50/50 flex items-center justify-between gap-4">
                    <div>
                      <h5 className="text-xs font-black text-slate-800">{s.name}</h5>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-slate-450 mt-1 font-semibold">
                        {s.filters.district && <span>District: {s.filters.district}</span>}
                        {s.filters.subject && <span>Subject: {s.filters.subject}</span>}
                        {s.filters.classCategory && <span>Level: {s.filters.classCategory}</span>}
                        {s.filters.teacherType && <span>Recruitment: {s.filters.teacherType}</span>}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteSearch(s.id)}
                      className="px-2.5 py-1 text-red-650 hover:bg-red-50 hover:text-red-700 rounded-lg text-[10px] font-bold border-0 bg-transparent cursor-pointer"
                    >
                      Unsubscribe
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
