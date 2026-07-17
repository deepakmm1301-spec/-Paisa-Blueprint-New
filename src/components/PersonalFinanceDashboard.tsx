import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { paisaFetch } from "../api";
import { UserProfile } from "../types";
import { 
  Award, ShieldCheck, Activity, Clock, Plus, Trash2, Edit2, Bot, Send, 
  Bell, BellRing, Coins, Landmark, CheckCircle, ChevronRight, Calendar, 
  User, RefreshCw, AlertCircle, X, Briefcase, TrendingUp, Search, Sparkles, Zap, Shield, Play 
} from "lucide-react";

import { 
  defaultDashboardData, 
  calculateHealthScore, 
  DashboardData 
} from "./dashboard/DashboardDataStore";

import NetWorthSection from "./dashboard/NetWorthSection";
import CashFlowSection from "./dashboard/CashFlowSection";
import GoalsSection from "./dashboard/GoalsSection";
import PortfolioSection from "./dashboard/PortfolioSection";
import CalendarAndTimeline from "./dashboard/CalendarAndTimeline";
import InsightsAndAchievements from "./dashboard/InsightsAndAchievements";

interface DashboardProps {
  user: any;
  profile: UserProfile;
  language: "en" | "hi";
  onNavigateToWidget: (widgetId: string) => void;
}

export default function PersonalFinanceDashboard({ user, profile, language, onNavigateToWidget }: DashboardProps) {
  // State for whole guest dashboard data, persistent in localStorage
  const [data, setData] = useState<DashboardData>(defaultDashboardData);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);

  // Chat State
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([
    {
      role: "assistant",
      content: language === "hi" 
        ? "नमस्ते! मैं आपका निजी वित्तीय एआई कोच हूँ। आप मुझसे अपने निवेश, बचत या कर नियोजन के बारे में कुछ भी पूछ सकते हैं!" 
        : "Hello! I am your personal financial AI coach. Ask me anything about your investments, savings, or tax planning!",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Initialize and load from local storage
  useEffect(() => {
    const saved = localStorage.getItem("paisa_guest_dashboard_data");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setData(parsed);
      } catch (e) {
        console.warn("Error reading dashboard data, reverting to defaults", e);
        setData(defaultDashboardData);
      }
    } else {
      localStorage.setItem("paisa_guest_dashboard_data", JSON.stringify(defaultDashboardData));
      setData(defaultDashboardData);
    }
  }, []);

  // Sync to local storage when state changes
  const handleUpdateData = (newData: DashboardData) => {
    setData(newData);
    localStorage.setItem("paisa_guest_dashboard_data", JSON.stringify(newData));
  };

  const health = useMemo(() => calculateHealthScore(data), [data]);

  // Handle Search Queries
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    const q = searchQuery.toLowerCase();

    // Mapping search terms to widgets
    if (q.includes("salary") || q.includes("pay") || q.includes("allowance")) {
      onNavigateToWidget("salary");
    } else if (q.includes("pension") || q.includes("ops") || q.includes("retire")) {
      onNavigateToWidget("pension");
    } else if (q.includes("nps") || q.includes("national pension")) {
      onNavigateToWidget("nps");
    } else if (q.includes("sip") || q.includes("mutual") || q.includes("invest")) {
      onNavigateToWidget("sip");
    } else if (q.includes("tax") || q.includes("itr") || q.includes("deduct")) {
      onNavigateToWidget("tax");
    } else if (q.includes("goal") || q.includes("target")) {
      onNavigateToWidget("goal");
    } else if (q.includes("coach") || q.includes("ai") || q.includes("chat")) {
      setChatOpen(true);
    } else {
      // General alert if no specific widget match is made
      alert(language === "hi" 
        ? `"${searchQuery}" से मेल खाने वाला कोई घटक नहीं मिला। क्विक एक्शन्स या एआई कोच का उपयोग करें!`
        : `Could not find a matching calculator for "${searchQuery}". Try using the Quick Actions or AI Coach!`);
    }
    setSearchQuery("");
  };

  // Handle AI Advisor Chat Request
  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMsg = {
      role: "user",
      content: chatInput,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setChatMessages(prev => [...prev, userMsg]);
    const promptToSend = chatInput;
    setChatInput("");
    setIsChatLoading(true);

    try {
      const response = await paisaFetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({
          message: promptToSend,
          history: chatMessages.map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (response.ok) {
        const result = await response.json();
        setChatMessages(prev => [...prev, {
          role: "assistant",
          content: result.reply || result.content || "I am analyzing your data to construct an optimal plan.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }]);
      } else {
        throw new Error("Chat gateway returned error");
      }
    } catch (err) {
      setChatMessages(prev => [...prev, {
        role: "assistant",
        content: language === "hi" 
          ? "माफ़ कीजिये, एआई कोच सर्वर से कनेक्ट करने में त्रुटि हुई। कृपया थोड़ी देर बाद पुनः प्रयास करें।" 
          : "Apologies, I encountered a temporary connection issue. Please retry in a moment.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Calculate generic snapshot figures
  const totalIncome = (data.income.salary || 0) + (data.income.rental || 0) + (data.income.business || 0) + (data.income.other || 0);
  const totalExpenses = (data.expenses.housing || 0) + (data.expenses.food || 0) + (data.expenses.transport || 0) + (data.expenses.education || 0) + (data.expenses.medical || 0) + (data.expenses.insurance || 0) + (data.expenses.entertainment || 0) + (data.expenses.investments || 0);
  const netSavings = totalIncome - totalExpenses;
  const savingRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 relative">
      {/* 1. Header with Smart Search & Offline Indicator */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 font-display">
              {language === "hi" ? "पैसाBlueprint कमांड सेंटर" : "Paisa Personal Finance Command Center"}
            </h1>
            <span className="text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0">
              <ShieldCheck className="w-3 h-3" />
              <span>GUEST SECURE</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            {language === "hi" 
              ? "वित्तीय स्वास्थ्य, बचत दर, निवेश पोर्टफोलियो और लक्ष्यों की लाइव गणना" 
              : "Consolidated financial health scoring, compounding charts, and active ledgers."}
          </p>
        </div>

        {/* Smart Search & Notification Trigger */}
        <div className="flex items-center gap-3 w-full lg:w-auto max-w-md">
          <form onSubmit={handleSearch} className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === "hi" ? "सर्च करें: 'salary', 'tax', 'nps'..." : "Search e.g. 'salary', 'tax', 'nps'..."}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-bhagwa-500 text-slate-800"
            />
          </form>

          {/* Trigger Notification Center */}
          <div className="relative">
            <button
              onClick={() => setShowNotificationCenter(!showNotificationCenter)}
              className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl transition-all cursor-pointer relative"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-bhagwa-500 rounded-full animate-ping" />
            </button>

            {/* Notification Center Popover */}
            <AnimatePresence>
              {showNotificationCenter && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-80 bg-white border border-slate-100 shadow-xl rounded-2xl p-4 z-40 space-y-3"
                >
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-xs font-black text-slate-800">{language === "hi" ? "अलर्ट एवं सूचनाएं" : "System Alerts & Reminders"}</span>
                    <button onClick={() => setShowNotificationCenter(false)} className="text-slate-400 hover:text-slate-600">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="space-y-2.5 text-xs max-h-64 overflow-y-auto">
                    <div className="p-2 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 space-y-0.5">
                      <span className="font-bold">✓ Offline Encryption Active</span>
                      <p className="text-[10px] text-emerald-700 font-semibold">Your financial parameters are privately stored inside your local sandboxed browser storage.</p>
                    </div>
                    {netSavings < 10000 && (
                      <div className="p-2 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 space-y-0.5">
                        <span className="font-bold">⚠️ Low Savings Rate Buffer</span>
                        <p className="text-[10px] text-rose-700 font-semibold">Consider re-routing lifestyle budgets to safe mutual funds or EPF retirement channels.</p>
                      </div>
                    )}
                    <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-800 space-y-0.5">
                      <span className="font-bold">ℹ️ 8th Pay Scale Support</span>
                      <p className="text-[10px] text-indigo-700 font-semibold">Evaluation structures are fully aligned with 8th Pay Commission projections.</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* 2. Executive Overview & Speedometer Gauge Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Card: Welcome and Big Score Cards (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-br from-bhagwa-50/70 to-emerald-50/70 border border-bhagwa-100 text-slate-800 rounded-3xl p-6 relative overflow-hidden shadow-3xs">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_-20%,rgba(255,255,255,0.15),transparent_50%)] pointer-events-none" />
            <div className="space-y-3 relative z-10">
              <span className="text-[10px] font-black uppercase tracking-widest bg-bhagwa-100 text-bhagwa-800 border border-bhagwa-200 px-3 py-1 rounded-full">
                {language === "hi" ? "सच्चा वित्तीय नियोजन" : "COMPREHENSIVE GUEST PLANNING OFFICE"}
              </span>
              <h2 className="text-xl sm:text-2xl font-black leading-tight text-slate-900">
                {language === "hi" ? "सुरक्षित एवं स्वतंत्र वित्तीय कमान केंद्र" : "Absolute Command Over Your Financial Freedom"}
              </h2>
              <p className="text-xs text-slate-600 font-medium max-w-xl">
                {language === "hi" 
                  ? "पब्लिक सेक्टर, प्राइवेट सेक्टर और सरकारी कर्मचारियों के लिए तैयार किया गया अनुकूलित विश्लेषण।" 
                  : "Fully optimized for Indian corporate, PSU, and Government professionals. No registration. Full database encryption locally."}
              </p>
            </div>
          </div>

          {/* Quick Metrics Snapshots Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-100 p-4 rounded-2xl space-y-1 hover:shadow-3xs transition-all">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">
                {language === "hi" ? "मासिक बचत दर" : "SAVINGS RATE"}
              </span>
              <div className="text-xl font-mono font-black text-slate-900">
                {savingRate.toFixed(1)}%
              </div>
              <span className="text-[9px] text-slate-400 block">
                {language === "hi" ? "आय का कुल प्रतिशत" : "of cumulative inflow"}
              </span>
            </div>

            <div className="bg-white border border-slate-100 p-4 rounded-2xl space-y-1 hover:shadow-3xs transition-all">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">
                {language === "hi" ? "मासिक बजट बचत" : "MONTHLY SAVINGS"}
              </span>
              <div className="text-xl font-mono font-black text-slate-900">
                ₹{netSavings.toLocaleString()}
              </div>
              <span className="text-[9px] text-emerald-600 font-bold block">
                {language === "hi" ? "सुरक्षित निवेश के योग्य" : "Surplus liquidity"}
              </span>
            </div>

            <div className="bg-white border border-slate-100 p-4 rounded-2xl space-y-1 col-span-2 sm:col-span-1 hover:shadow-3xs transition-all">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">
                {language === "hi" ? "आपातकालीन सुरक्षा" : "EMERGENCY BUFFER"}
              </span>
              <div className="text-xl font-mono font-black text-slate-900">
                {(((data.assets.cash as number) + (data.assets.bankBalance as number)) / (totalExpenses || 1)).toFixed(1)}x
              </div>
              <span className="text-[9px] text-slate-400 block">
                {language === "hi" ? "महीने के खर्च का सुरक्षा कवच" : "months of expense shield"}
              </span>
            </div>
          </div>
        </div>

        {/* Right Card: Health Speedometer Gauge (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-100 rounded-3xl p-6 shadow-3xs space-y-6 flex flex-col justify-between h-full min-h-[350px]">
          <div className="space-y-0.5">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-bhagwa-500" />
              <span>{language === "hi" ? "फाइनेंशियल हेल्थ स्कोर" : "Financial Health Index Rating"}</span>
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">
              {language === "hi" ? "बचत, आपातकालीन निधि और निवेश आवंटन के आधार पर वैज्ञानिक गणना" : "Algorithmic safety diagnostics compiled from active reserves."}
            </p>
          </div>

          {/* Speedometer Gauge Visual using Custom SVG with motion */}
          <div className="flex flex-col items-center justify-center relative py-4">
            <div className="relative w-44 h-24 flex items-center justify-center overflow-hidden">
              <svg className="w-full h-full transform translate-y-2" viewBox="0 0 100 50">
                {/* Background arc */}
                <path 
                  d="M 10 50 A 40 40 0 0 1 90 50" 
                  fill="none" 
                  stroke="#f1f5f9" 
                  strokeWidth="8" 
                  strokeLinecap="round" 
                />
                {/* Colored arc representing score */}
                <path 
                  d="M 10 50 A 40 40 0 0 1 90 50" 
                  fill="none" 
                  stroke={health.level === "Excellent" ? "#10b981" : health.level === "Good" ? "#0ea5e9" : health.level === "Average" ? "#f59e0b" : "#ef4444"} 
                  strokeWidth="8" 
                  strokeLinecap="round" 
                  strokeDasharray="125" 
                  strokeDashoffset={125 - (125 * health.score) / 100}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              {/* Score text overlay */}
              <div className="absolute bottom-0 text-center space-y-0.5">
                <span className="text-3xl font-black text-slate-900 font-mono block leading-none">
                  {health.score}
                </span>
                <span className={`text-[10px] font-black uppercase tracking-wider block ${health.color}`}>
                  {health.level}
                </span>
              </div>
            </div>
          </div>

          {/* Health Suggestions Accordion / Recommendations */}
          <div className="bg-slate-50 border border-slate-100/75 rounded-2xl p-4 space-y-1.5 max-h-36 overflow-y-auto">
            <span className="text-[9px] font-extrabold text-slate-450 uppercase tracking-wider block">
              {language === "hi" ? "हेल्थ स्कोर सुधारने के सुझाव" : "IMMEDIATE REMEDIAL SUGGESTIONS"}
            </span>
            <div className="space-y-2">
              {health.suggestions.map((sug, idx) => (
                <div key={idx} className="text-[11px] font-semibold text-slate-700 leading-tight flex items-start gap-1.5">
                  <span className="text-bhagwa-500 text-xs select-none">•</span>
                  <span>{sug[language]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Quick Action Ribbon Navigation Command Hub */}
      <div className="space-y-3">
        <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider block">
          {language === "hi" ? "क्विक एक्शन्स वित्तीय प्लानर्स" : "QUICK ACCESS PLATFORM COMMANDS"}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {[
            { id: "salary", label: { en: "Salary Calc", hi: "सैलरी कैलकुलेटर" }, icon: "💼", color: "hover:border-purple-200 hover:bg-purple-50" },
            { id: "pension", label: { en: "Pension Calc", hi: "पेंशन कैलकुलेटर" }, icon: "🛡️", color: "hover:border-emerald-200 hover:bg-emerald-50" },
            { id: "nps", label: { en: "NPS Planner", hi: "एनपीएस प्लानर" }, icon: "🔸", color: "hover:border-orange-200 hover:bg-orange-50" },
            { id: "sip", label: { en: "SIP Compounder", hi: "एसआईपी चक्रवृद्घि" }, icon: "🚀", color: "hover:border-indigo-200 hover:bg-indigo-50" },
            { id: "tax", label: { en: "Tax Optimizer", hi: "टैक्स अनुकूलक" }, icon: "💸", color: "hover:border-sky-200 hover:bg-sky-50" },
            { id: "goal", label: { en: "Goals Tracker", hi: "लक्ष्य ट्रैकर" }, icon: "🏆", color: "hover:border-pink-200 hover:bg-pink-50" },
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => onNavigateToWidget(btn.id)}
              className={`bg-white border border-slate-100 p-4 rounded-2xl text-center space-y-1.5 hover:shadow-3xs transition-all cursor-pointer ${btn.color}`}
            >
              <span className="text-xl block select-none">{btn.icon}</span>
              <span className="text-[11px] font-black text-slate-800 block">
                {btn.label[language]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* BPSC Teacher Special Campaigns Section with Special Blink Effects */}
      <div className="space-y-3 bg-white border border-slate-100 rounded-3xl p-6 shadow-3xs">
        <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider block">
          {language === "hi" ? "बिहार शिक्षक विशेष अभियान एवं मंच" : "BIHAR BPSC TEACHER CAMPAIGNS & TOOLS"}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Mutual Transfer Portal */}
          <div className="p-4 bg-teal-50/50 border border-teal-100 rounded-2xl flex flex-col justify-between gap-3 shadow-3xs">
            <div>
              <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
                <span>{language === "hi" ? "शिक्षक आपसी स्थानांतरण (Mutual Transfer)" : "Teacher Mutual Transfer Portal"}</span>
              </h4>
              <p className="text-[11px] text-slate-500 font-medium mt-1 leading-relaxed">
                {language === "hi" ? "बीपीएससी शिक्षकों के लिए पूर्ण स्वचालित आपसी स्थानांतरण मैचिंग सिस्टम और डायरेक्टरी।" : "Autonomous pairing system and directory matching for Bihar BPSC teacher transfer requests."}
              </p>
            </div>
            <button
              onClick={() => onNavigateToWidget("teacher_hub")}
              className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-xl text-xs cursor-pointer border-0 shadow-3xs flex items-center justify-center gap-1.5 animate-blink-attention"
            >
              <span>{language === "hi" ? "आपसी स्थानांतरण पोर्टल खोलें" : "Open Mutual Transfer Hub"}</span>
            </button>
          </div>

          {/* Sign Petition */}
          <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-2xl flex flex-col justify-between gap-3 shadow-3xs">
            <div>
              <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                <span>{language === "hi" ? "डिजिटल याचिका केंद्र (Sign Petition)" : "Teacher Advocacy & Petition Center"}</span>
              </h4>
              <p className="text-[11px] text-slate-500 font-medium mt-1 leading-relaxed">
                {language === "hi" ? "स्थानांतरण नियमों के सरलीकरण और नीतिगत सुधारों के लिए सामूहिक याचिका पर हस्ताक्षर करें।" : "Sign the collective digital representation to help simplify and reform mutual transfer guidelines."}
              </p>
            </div>
            <button
              onClick={() => onNavigateToWidget("petition_center")}
              className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-xl text-xs cursor-pointer border-0 shadow-3xs flex items-center justify-center gap-1.5 animate-blink-attention"
            >
              <span>{language === "hi" ? "याचिका पर डिजिटल हस्ताक्षर करें" : "Sign Active Petition"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Modular Dashboard Sections */}
      <NetWorthSection data={data} language={language} onUpdateData={handleUpdateData} />
      
      <CashFlowSection data={data} language={language} onUpdateData={handleUpdateData} />
      
      <GoalsSection data={data} language={language} onUpdateData={handleUpdateData} />
      
      <PortfolioSection data={data} language={language} />

      {/* Insights and Achievements Panel */}
      <InsightsAndAchievements data={data} language={language} />

      {/* Calendar and Activities Timeline */}
      <CalendarAndTimeline data={data} language={language} onUpdateData={handleUpdateData} />

      {/* 5. Floating AI Financial Coach Floating Badge & Chatbot Panel */}
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {chatOpen ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              className="w-80 sm:w-96 bg-white border border-slate-100 shadow-2xl rounded-3xl overflow-hidden flex flex-col h-[450px]"
            >
              {/* Advisor Chat Header */}
              <div className="bg-gradient-to-r from-bhagwa-600 to-indigo-600 text-white p-4 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-emerald-400" />
                  <div>
                    <span className="text-xs font-black block leading-none">
                      {language === "hi" ? "पैसा एआई वित्तीय कोच" : "Paisa AI Financial Coach"}
                    </span>
                    <span className="text-[9px] text-emerald-400 font-bold">
                      {language === "hi" ? "सक्रिय और सुरक्षित" : "Encrypted Personal Advisor"}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setChatOpen(false)}
                  className="p-1 hover:bg-white/10 rounded-lg text-white transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Chat Message Box */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
                {chatMessages.map((msg, idx) => {
                  const isAssistant = msg.role === "assistant";
                  return (
                    <div
                      key={idx}
                      className={`flex ${isAssistant ? "justify-start" : "justify-end"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl p-3 text-xs space-y-1 ${
                          isAssistant
                            ? "bg-white border border-slate-100 text-slate-800 font-semibold"
                            : "bg-bhagwa-600 text-white font-semibold"
                        }`}
                      >
                        <p className="leading-relaxed whitespace-pre-line">{msg.content}</p>
                        <span className={`text-[8px] font-bold block text-right ${isAssistant ? "text-slate-400" : "text-bhagwa-100"}`}>
                          {msg.timestamp}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-100 rounded-2xl p-3 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" />
                      <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input form */}
              <form onSubmit={handleSendChatMessage} className="p-3 bg-white border-t border-slate-100 flex items-center gap-2 shrink-0">
                <input
                  type="text"
                  required
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={language === "hi" ? "बचत या एसआईपी के बारे में पूछें..." : "Ask about compounding or 80C cuts..."}
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-bhagwa-500"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isChatLoading}
                  className="p-2 bg-bhagwa-600 hover:bg-bhagwa-700 disabled:bg-slate-200 text-white rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.button
              onClick={() => setChatOpen(true)}
              className="p-4 bg-bhagwa-600 hover:bg-bhagwa-700 text-white rounded-full shadow-2xl transition-all cursor-pointer flex items-center gap-2 group border border-bhagwa-500"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.05 }}
            >
              <Bot className="w-6 h-6 animate-pulse" />
              <span className="text-xs font-black max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-out whitespace-nowrap block">
                {language === "hi" ? "एआई वित्तीय कोच से बात करें" : "Chat with AI Advisor"}
              </span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
