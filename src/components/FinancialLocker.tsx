import React, { useState, useEffect } from "react";
import {
  Shield,
  Search,
  Star,
  Trash2,
  Clock,
  ExternalLink,
  Sliders,
  ChevronRight,
  TrendingUp,
  FileText,
  Bookmark,
  Briefcase,
  AlertCircle,
  HelpCircle,
  Calendar,
  Coins,
  DollarSign
} from "lucide-react";
import { paisaFetch } from "../api";
import { AnimatePresence, motion } from "motion/react";

interface SavedItem {
  id: string;
  title: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  data: any;
  isFavourite: boolean;
}

interface LockerData {
  salaryCalculations: SavedItem[];
  pensionCalculations: SavedItem[];
  sipPlans: SavedItem[];
  npsPlans: SavedItem[];
  taxCalculations: SavedItem[];
  financialGoals: SavedItem[];
  favourites: SavedItem[];
  recentlyViewed: SavedItem[];
}

interface FinancialLockerProps {
  onNavigateToWidget?: (widget: string) => void;
  language?: "en" | "hi";
}

export default function FinancialLocker({ onNavigateToWidget, language = "en" }: FinancialLockerProps) {
  const [locker, setLocker] = useState<LockerData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<SavedItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Load entire locker on mount
  const fetchLockerData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await paisaFetch("/api/locker");
      if (response.ok) {
        const data = await response.json();
        setLocker(data);
      } else {
        const data = await response.json().catch(() => ({}));
        setError(data?.message || "Failed to load locker items.");
      }
    } catch (err: any) {
      setError("Unable to connect to the locker server. Please ensure you are logged in.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLockerData();
  }, []);

  // Listen to any save events to auto-refresh the locker list in real-time
  useEffect(() => {
    const handleRefresh = () => {
      fetchLockerData();
    };
    window.addEventListener("paisa-locker-saved", handleRefresh);
    return () => window.removeEventListener("paisa-locker-saved", handleRefresh);
  }, []);

  // Toggle Favourite
  const handleToggleFavourite = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      const res = await paisaFetch(`/api/locker/favourite/${id}`, {
        method: "POST"
      });
      if (res.ok) {
        // Optimistic / Simple update of state
        fetchLockerData();
      }
    } catch (err) {
      console.error("Failed to toggle favourite state", err);
    }
  };

  // Delete Item
  const handleDeleteItem = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      const res = await paisaFetch(`/api/locker/delete/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setDeleteConfirmId(null);
        if (selectedItem?.id === id) {
          setSelectedItem(null);
        }
        fetchLockerData();
      }
    } catch (err) {
      console.error("Failed to delete locker item", err);
    }
  };

  // Load saved item back into the calculator tool
  const handleLoadItem = (item: SavedItem) => {
    // Determine target widget ID based on calculation type
    let targetWidget = "";
    const type = item.type.toLowerCase();
    if (type === "salary" || type === "salarycalculations" || type === "salary_calculations") {
      targetWidget = item.data?.teacherGrade ? "bpsc_salary" : "salary";
    }
    else if (type === "pension" || type === "pensioncalculations" || type === "pension_calculations") targetWidget = "pension";
    else if (type === "sip" || type === "sipplans" || type === "sip_plans") targetWidget = "sip";
    else if (type === "nps" || type === "npsplans" || type === "nps_plans") targetWidget = "nps";
    else if (type === "tax" || type === "taxcalculations" || type === "tax_calculations") targetWidget = "tax_calculator"; // or tax
    else if (type === "goal" || type === "financialgoals" || type === "financial_goals") targetWidget = "goal_planner";

    if (!targetWidget) return;

    // Trigger redirection inside the SPA
    if (onNavigateToWidget) {
      onNavigateToWidget(targetWidget);
    }

    // Broadcast a custom event carrying the state data so the active tool listens and loads it
    setTimeout(() => {
      const event = new CustomEvent("paisa-load-calculation", {
        detail: {
          type: item.type,
          data: item.data
        }
      });
      window.dispatchEvent(event);
    }, 150);

    setSelectedItem(null);
  };

  // Extract all items for sorting and filtering in memory (Part 8 Requirement)
  const getAllItems = (): SavedItem[] => {
    if (!locker) return [];
    
    // Use a Map to prevent duplicates between different category lists
    const itemsMap = new Map<string, SavedItem>();
    
    const lists = [
      locker.salaryCalculations,
      locker.pensionCalculations,
      locker.sipPlans,
      locker.npsPlans,
      locker.taxCalculations,
      locker.financialGoals
    ];

    lists.forEach(list => {
      if (Array.isArray(list)) {
        list.forEach(item => itemsMap.set(item.id, item));
      }
    });

    return Array.from(itemsMap.values());
  };

  const allItems = getAllItems();

  // Filter and Search
  const getFilteredItems = (): SavedItem[] => {
    let items = [...allItems];

    // Sort by updatedAt descending by default (Part 8 requirement)
    items.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    // Filter by Tab
    if (activeTab === "recent") {
      items = locker?.recentlyViewed || items.slice(0, 10);
    } else if (activeTab === "salary") {
      items = items.filter(i => i.type.toLowerCase().startsWith("salary"));
    } else if (activeTab === "pension") {
      items = items.filter(i => i.type.toLowerCase().startsWith("pension"));
    } else if (activeTab === "sip") {
      items = items.filter(i => i.type.toLowerCase().startsWith("sip"));
    } else if (activeTab === "nps") {
      items = items.filter(i => i.type.toLowerCase().startsWith("nps"));
    } else if (activeTab === "tax") {
      items = items.filter(i => i.type.toLowerCase().startsWith("tax"));
    } else if (activeTab === "goals") {
      items = items.filter(i => i.type.toLowerCase().startsWith("goal"));
    } else if (activeTab === "favourites") {
      items = items.filter(i => i.isFavourite);
    }

    // In-memory Search by title (Part 8 requirement)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(i => i.title.toLowerCase().includes(q));
    }

    return items;
  };

  const filteredItems = getFilteredItems();

  // Helper to get formatted relative or absolute date
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString(language === "hi" ? "hi-IN" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Helper to render type icons and color badge
  const getTypeMeta = (typeStr: string) => {
    const t = typeStr.toLowerCase();
    if (t.startsWith("salary")) {
      return {
        label: language === "hi" ? "वेतन गणना" : "Salary Calc",
        color: "bg-purple-50 text-purple-700 border-purple-100",
        icon: <Briefcase className="w-4 h-4 text-purple-600" />
      };
    }
    if (t.startsWith("pension")) {
      return {
        label: language === "hi" ? "पेंशन गणना" : "Pension Calc",
        color: "bg-emerald-50 text-emerald-700 border-emerald-100",
        icon: <Coins className="w-4 h-4 text-emerald-600" />
      };
    }
    if (t.startsWith("sip")) {
      return {
        label: language === "hi" ? "एसआईपी योजना" : "SIP Plan",
        color: "bg-sky-50 text-sky-700 border-sky-100",
        icon: <TrendingUp className="w-4 h-4 text-sky-600" />
      };
    }
    if (t.startsWith("nps")) {
      return {
        label: language === "hi" ? "एनपीएस गणना" : "NPS Calc",
        color: "bg-orange-50 text-orange-700 border-orange-100",
        icon: <DollarSign className="w-4 h-4 text-orange-600" />
      };
    }
    if (t.startsWith("tax")) {
      return {
        label: language === "hi" ? "टैक्स योजना" : "Tax Plan",
        color: "bg-red-50 text-red-700 border-red-100",
        icon: <FileText className="w-4 h-4 text-red-600" />
      };
    }
    if (t.startsWith("goal")) {
      return {
        label: language === "hi" ? "वित्तीय लक्ष्य" : "Financial Goal",
        color: "bg-pink-50 text-pink-700 border-pink-100",
        icon: <Bookmark className="w-4 h-4 text-pink-600" />
      };
    }
    return {
      label: typeStr,
      color: "bg-slate-50 text-slate-700 border-slate-100",
      icon: <HelpCircle className="w-4 h-4 text-slate-600" />
    };
  };

  // Helper to render summarized data of saved calculations
  const renderItemSummary = (item: SavedItem) => {
    const t = item.type.toLowerCase();
    const data = item.data || {};
    
    if (t.startsWith("salary")) {
      return (
        <div className="space-y-1 text-xs text-slate-600 font-medium">
          <div>{language === "hi" ? "मूल वेतन" : "Basic Pay"}: <span className="font-bold text-slate-900">₹{(data.basicPay || 0).toLocaleString()}</span></div>
          <div>{language === "hi" ? "महंगाई भत्ता" : "DA"}: <span className="font-bold text-slate-900">{(data.daPercent || 0)}%</span></div>
          <div>{language === "hi" ? "शुद्ध वेतन" : "Net Take Home"}: <span className="font-extrabold text-purple-600">₹{(data.netSalary || 0).toLocaleString()}</span></div>
        </div>
      );
    }
    if (t.startsWith("pension")) {
      return (
        <div className="space-y-1 text-xs text-slate-600 font-medium">
          <div>{language === "hi" ? "अंतिम मूल वेतन" : "Last Basic Pay"}: <span className="font-bold text-slate-900">₹{(data.lastBasicPay || 0).toLocaleString()}</span></div>
          <div>{language === "hi" ? "मासिक पेंशन" : "Monthly Pension"}: <span className="font-extrabold text-emerald-600">₹{(data.monthlyPension || 0).toLocaleString()}</span></div>
          <div>{language === "hi" ? "ग्रेच्युटी" : "Gratuity Benefit"}: <span className="font-bold text-slate-900">₹{(data.gratuity || 0).toLocaleString()}</span></div>
        </div>
      );
    }
    if (t.startsWith("sip")) {
      return (
        <div className="space-y-1 text-xs text-slate-600 font-medium">
          <div>{language === "hi" ? "मासिक एसआईपी" : "Monthly Investment"}: <span className="font-bold text-slate-900">₹{(data.monthlySip || data.monthlyInvestment || 0).toLocaleString()}</span></div>
          <div>{language === "hi" ? "अनुमानित रिटर्न" : "Expected Return"}: <span className="font-bold text-slate-900">{(data.expectedReturn || data.interestRate || 0)}%</span></div>
          <div>{language === "hi" ? "कुल भावी मूल्य" : "Total Future Value"}: <span className="font-extrabold text-sky-600">₹{(data.futureValue || data.totalValue || 0).toLocaleString()}</span></div>
        </div>
      );
    }
    if (t.startsWith("nps")) {
      return (
        <div className="space-y-1 text-xs text-slate-600 font-medium">
          <div>{language === "hi" ? "मासिक योगदान" : "Monthly Contribution"}: <span className="font-bold text-slate-900">₹{(data.monthlyContribution || 0).toLocaleString()}</span></div>
          <div>{language === "hi" ? "संचित कोष" : "Total Corpus Accumulated"}: <span className="font-extrabold text-orange-600">₹{(data.totalCorpus || 0).toLocaleString()}</span></div>
          <div>{language === "hi" ? "अनुमानित मासिक पेंशन" : "Est. Monthly Pension"}: <span className="font-bold text-slate-900">₹{(data.monthlyPension || 0).toLocaleString()}</span></div>
        </div>
      );
    }
    if (t.startsWith("tax")) {
      return (
        <div className="space-y-1 text-xs text-slate-600 font-medium">
          <div>{language === "hi" ? "वार्षिक सकल आय" : "Gross Annual Income"}: <span className="font-bold text-slate-900">₹{(data.grossIncome || data.annualSalary || 0).toLocaleString()}</span></div>
          <div>{language === "hi" ? "कुल कटौती" : "Total Deductions"}: <span className="font-bold text-slate-900">₹{(data.totalDeductions || 0).toLocaleString()}</span></div>
          <div>{language === "hi" ? "देय टैक्स" : "Net Tax Payable"}: <span className="font-extrabold text-red-600">₹{(data.netTaxPayable || data.taxPayable || 0).toLocaleString()}</span></div>
        </div>
      );
    }
    if (t.startsWith("goal")) {
      return (
        <div className="space-y-1 text-xs text-slate-600 font-medium">
          <div>{language === "hi" ? "लक्ष्य लागत" : "Target Amount"}: <span className="font-extrabold text-pink-600">₹{(data.targetAmount || data.cost || 0).toLocaleString()}</span></div>
          <div>{language === "hi" ? "समय सीमा" : "Time Horizon"}: <span className="font-bold text-slate-900">{(data.years || 0)} {language === "hi" ? "वर्ष" : "years"}</span></div>
          <div>{language === "hi" ? "आवश्यक मासिक बचत" : "Req. Monthly Savings"}: <span className="font-bold text-slate-900">₹{(data.requiredSavings || data.monthlySavings || 0).toLocaleString()}</span></div>
        </div>
      );
    }
    return <div className="text-xs text-slate-450 italic">{language === "hi" ? "कोई अतिरिक्त विवरण उपलब्ध नहीं है" : "No additional summary details available"}</div>;
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl shadow-xs overflow-hidden">
      {/* Banner / Title Header */}
      <div className="p-6 sm:p-8 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(147,51,234,0.15),transparent_40%)]" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-wider text-purple-300">
              <Shield className="w-3 h-3 text-purple-400" />
              <span>{language === "hi" ? "एंटरप्राइज सुरक्षित वित्तीय तिजोरी" : "Enterprise Secure Financial Locker"}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight font-display">
              {language === "hi" ? "वित्तीय गणना लॉकर" : "Financial Locker"}
            </h2>
            <p className="text-xs text-slate-350 leading-relaxed font-medium">
              {language === "hi"
                ? "अपनी गणनाओं, सेवानिवृत्ति योजनाओं, और वित्तीय लक्ष्यों को सुरक्षित रूप से क्लाउड लॉकर में सहेजें।"
                : "Securely save, organize, and reload your custom pension calculations, salary projections, NPS, and tax plans."}
            </p>
          </div>
        </div>
      </div>

      {/* Control Actions Panel (Search & Tabs) */}
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === "hi" ? "सहेजी गई गणना खोजें..." : "Search saved calculations by title..."}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-100 rounded-2xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-purple-500 shadow-3xs"
            />
          </div>

          <button
            onClick={fetchLockerData}
            className="px-4 py-2.5 bg-white border border-slate-100 hover:bg-slate-50 text-slate-700 font-extrabold rounded-2xl text-xs transition-all flex items-center justify-center gap-2 shadow-3xs cursor-pointer border-0"
          >
            <Clock className="w-3.5 h-3.5 text-slate-500 animate-spin" style={{ animationDuration: isLoading ? "2s" : "0s" }} />
            <span>{language === "hi" ? "रिफ्रेश करें" : "Refresh"}</span>
          </button>
        </div>

        {/* Directory Categorized Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 -mx-6 px-6 scrollbar-none">
          {[
            { id: "all", label: language === "hi" ? "सभी योजनाएं" : "All Plans", count: allItems.length },
            { id: "recent", label: language === "hi" ? "हालिया" : "Recent", count: locker?.recentlyViewed?.length || 0 },
            { id: "salary", label: language === "hi" ? "वेतन" : "Salary", count: locker?.salaryCalculations?.length || 0 },
            { id: "pension", label: language === "hi" ? "पेंशन" : "Pension", count: locker?.pensionCalculations?.length || 0 },
            { id: "sip", label: language === "hi" ? "एसआईपी" : "SIP", count: locker?.sipPlans?.length || 0 },
            { id: "nps", label: language === "hi" ? "एनपीएस" : "NPS", count: locker?.npsPlans?.length || 0 },
            { id: "tax", label: language === "hi" ? "टैक्स" : "Tax", count: locker?.taxCalculations?.length || 0 },
            { id: "goals", label: language === "hi" ? "लक्ष्य" : "Goals", count: locker?.financialGoals?.length || 0 },
            { id: "favourites", label: language === "hi" ? "पसंदीदा ⭐" : "Favourites ⭐", count: locker?.favourites?.length || 0 }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer border-0 flex items-center gap-1.5 shadow-3xs ${
                activeTab === tab.id
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-650 hover:bg-slate-50 border border-slate-100"
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${activeTab === tab.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Locker Grid Area */}
      <div className="p-6">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
            <p className="text-xs font-black text-slate-500 uppercase tracking-wider">
              {language === "hi" ? "सुरक्षित तिजोरी लोड की जा रही है..." : "Loading secure financial vault..."}
            </p>
          </div>
        ) : error ? (
          <div className="py-12 px-4 border-2 border-dashed border-red-100 bg-red-50/30 rounded-2xl text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
            <h3 className="text-sm font-black text-slate-800">{language === "hi" ? "पहुंच अस्वीकृत" : "Access Denied"}</h3>
            <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">{error}</p>
            <p className="text-[10px] text-red-500 font-bold uppercase">{language === "hi" ? "कृपया जारी रखने के लिए लॉग इन करें।" : "Please sign in to continue."}</p>
          </div>
        ) : filteredItems.length === 0 ? (
          /* Empty State */
          <div className="py-20 text-center space-y-4 max-w-sm mx-auto">
            <div className="w-16 h-16 bg-slate-50 rounded-full border border-slate-100 flex items-center justify-center mx-auto shadow-3xs">
              <Shield className="w-8 h-8 text-slate-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-black text-slate-800">
                {language === "hi" ? "कोई गणना नहीं मिली" : "No saved items found"}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                {searchQuery
                  ? (language === "hi" ? "आपके खोज मानदंडों से मेल खाने वाली कोई गणना नहीं मिली।" : "No calculations matched your current search query.")
                  : (language === "hi"
                    ? "इस श्रेणी में आपके पास कोई सहेजी गई गणना नहीं है। उन्हें सहेजने के लिए कैलकुलेटर का उपयोग करें।"
                    : "Your private financial vault is empty for this filter. Use any calculator below and click 'Save to Vault' to persist your configurations.")}
              </p>
            </div>
          </div>
        ) : (
          /* Cards Grid list */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredItems.map((item) => {
              const meta = getTypeMeta(item.type);
              const isFav = item.isFavourite;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className="bg-white border border-slate-100 hover:border-slate-200/80 rounded-2xl p-5 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group relative overflow-hidden"
                >
                  <div className="space-y-4">
                    {/* Top status bar */}
                    <div className="flex items-center justify-between gap-2">
                      <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${meta.color}`}>
                        {meta.icon}
                        <span>{meta.label}</span>
                      </div>
                      <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100">
                        {/* Favourite toggle star */}
                        <button
                          onClick={(e) => handleToggleFavourite(e, item.id)}
                          className={`p-1.5 rounded-full bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer border-0 ${isFav ? "text-amber-500" : "text-slate-350 hover:text-slate-450"}`}
                          title={isFav ? "Remove from favourites" : "Mark as favourite"}
                        >
                          <Star className="w-3.5 h-3.5 fill-current" />
                        </button>

                        {/* Delete confirmation triggered */}
                        {deleteConfirmId === item.id ? (
                          <div className="flex items-center gap-1 z-10">
                            <button
                              onClick={(e) => handleDeleteItem(e, item.id)}
                              className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-lg text-[9px] border-0 cursor-pointer"
                            >
                              {language === "hi" ? "हाँ" : "Yes"}
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(null); }}
                              className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-extrabold rounded-lg text-[9px] border-0 cursor-pointer"
                            >
                              {language === "hi" ? "नहीं" : "No"}
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(item.id); }}
                            className="p-1.5 rounded-full bg-slate-50 hover:bg-red-50 text-slate-350 hover:text-red-600 transition-all cursor-pointer border-0"
                            title="Delete configuration"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Title */}
                    <div className="space-y-1">
                      <h4 className="text-xs font-black text-slate-800 leading-snug line-clamp-2">
                        {item.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{language === "hi" ? "अंतिम संशोधन" : "Last updated"}: {formatDate(item.updatedAt)}</span>
                      </p>
                    </div>

                    {/* Styled parameters summary */}
                    <div className="p-3.5 bg-slate-50/50 border border-slate-100/70 rounded-xl">
                      {renderItemSummary(item)}
                    </div>
                  </div>

                  <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-black uppercase text-slate-500 group-hover:text-purple-600 transition-colors">
                    <span>{language === "hi" ? "विवरण खोलें" : "Open Detail"}</span>
                    <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Details Side Drawer Modal Overlay */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white border border-slate-100 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="p-6 bg-slate-900 text-white flex items-center justify-between relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(147,51,234,0.1),transparent_40%)]" />
                <div className="relative space-y-1">
                  <div className="inline-flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-full text-[9px] font-black text-purple-300 border border-white/5 uppercase">
                    {getTypeMeta(selectedItem.type).label}
                  </div>
                  <h3 className="text-sm font-black leading-snug">{selectedItem.title}</h3>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all border-0 cursor-pointer font-bold text-xs"
                >
                  ✕
                </button>
              </div>

              {/* Data Breakdown list */}
              <div className="p-6 overflow-y-auto space-y-5 flex-1 bg-slate-50/50">
                <div className="bg-white border border-slate-100 rounded-2xl p-4 space-y-3.5 shadow-3xs">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-50 pb-2 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-purple-600" />
                    <span>{language === "hi" ? "सहेजे गए गणना पैरामीटर" : "Saved Calculation Parameters"}</span>
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                    {Object.entries(selectedItem.data || {}).map(([key, val]) => {
                      if (typeof val === "object" && val !== null) {
                        return (
                          <div key={key} className="col-span-2 bg-slate-50/40 p-2.5 rounded-xl border border-slate-100/50">
                            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block mb-1.5">{key}</span>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {Object.entries(val).map(([subK, subV]) => (
                                <div key={subK}>
                                  <span className="text-[9px] font-bold text-slate-400 uppercase block">{subK}</span>
                                  <span className="font-extrabold text-slate-800 mt-0.5 block truncate">
                                    {typeof subV === "number" ? `₹${subV.toLocaleString()}` : String(subV)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }
                      
                      // Filter out technical fields if any
                      if (key === "id" || key === "userId") return null;

                      // Format keys into descriptive headers
                      const friendlyKey = key
                        .replace(/([A-Z])/g, " $1")
                        .replace(/^./, (str) => str.toUpperCase());

                      return (
                        <div key={key} className="space-y-0.5">
                          <span className="text-[9px] font-bold text-slate-450 uppercase tracking-wider block">{friendlyKey}</span>
                          <span className="text-xs font-black text-slate-800 block truncate">
                            {typeof val === "number" && !key.toLowerCase().includes("percent") && !key.toLowerCase().includes("rate") && !key.toLowerCase().includes("factor") && !key.toLowerCase().includes("years") && !key.toLowerCase().includes("age") && !key.toLowerCase().includes("count")
                              ? `₹${val.toLocaleString()}` 
                              : String(val)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Additional Info / Security info */}
                <div className="flex items-center gap-2.5 p-3.5 bg-purple-50/50 border border-purple-100/60 rounded-2xl">
                  <Shield className="w-5 h-5 text-purple-600 shrink-0" />
                  <p className="text-[10px] text-slate-600 font-medium leading-relaxed">
                    {language === "hi"
                      ? "यह योजना विशेष रूप से आपके प्रमाणित खाते में एन्क्रिप्टेड और सुरक्षित है।"
                      : "This plan is secured inside your private locker vault. Only you have authorized credentials to access or modify it."}
                  </p>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-4 bg-white border-t border-slate-100 flex gap-3">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-xl text-xs cursor-pointer border-0 transition-all text-center"
                >
                  {language === "hi" ? "बंद करें" : "Close"}
                </button>
                <button
                  onClick={() => handleLoadItem(selectedItem)}
                  className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-extrabold rounded-xl text-xs cursor-pointer border-0 transition-all flex items-center justify-center gap-2 shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-white" />
                  <span>{language === "hi" ? "टूल में लोड करें" : "Load into Tool"}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
