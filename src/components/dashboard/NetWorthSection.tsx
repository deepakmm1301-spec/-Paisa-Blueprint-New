import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { DashboardData } from "./DashboardDataStore";
import { 
  TrendingUp, TrendingDown, Landmark, Coins, Plus, Trash2, Edit2, Check, X, ShieldAlert 
} from "lucide-react";

interface NetWorthProps {
  data: DashboardData;
  language: "en" | "hi";
  onUpdateData: (newData: DashboardData) => void;
}

export default function NetWorthSection({ data, language, onUpdateData }: NetWorthProps) {
  const [activeTab, setActiveTab] = useState<"visuals" | "balance-sheet" | "history">("visuals");
  const [editType, setEditType] = useState<"asset" | "liability" | null>(null);
  const [editKey, setEditKey] = useState<string>("");
  const [editValue, setEditValue] = useState<string>("");

  const totalAssets = Object.values(data.assets).reduce((a, b) => a + b, 0);
  const totalLiabilities = Object.values(data.liabilities).reduce((a, b) => a + b, 0);
  const netWorth = totalAssets - totalLiabilities;

  const assetLabels: Record<string, { en: string; hi: string; color: string }> = {
    cash: { en: "Cash in Hand", hi: "नकद हाथ में", color: "#3b82f6" },
    bankBalance: { en: "Bank Balance", hi: "बैंक शेष", color: "#2563eb" },
    epf: { en: "Employees Provident Fund (EPF)", hi: "कर्मचारी भविष्य निधि (EPF)", color: "#10b981" },
    ppf: { en: "Public Provident Fund (PPF)", hi: "सार्वजनिक भविष्य निधि (PPF)", color: "#059669" },
    nps: { en: "National Pension Scheme (NPS)", hi: "राष्ट्रीय पेंशन योजना (NPS)", color: "#d97706" },
    mutualFunds: { en: "Mutual Funds", hi: "म्यूचुअल फंड", color: "#8b5cf6" },
    stocks: { en: "Direct Stocks", hi: "प्रत्यक्ष शेयर", color: "#6366f1" },
    gold: { en: "Digital & Physical Gold", hi: "सोना (डिजिटल और भौतिक)", color: "#fbbf24" },
    property: { en: "Real Estate Property", hi: "अचल संपत्ति (प्रॉपर्टी)", color: "#ec4899" },
    vehicles: { en: "Vehicles Assets", hi: "वाहनों की कीमत", color: "#14b8a6" },
    otherAssets: { en: "Other Assets & Cash", hi: "अन्य संपत्ति और नकद", color: "#6b7280" },
  };

  const liabilityLabels: Record<string, { en: string; hi: string; color: string }> = {
    homeLoan: { en: "Home Loan Outstanding", hi: "गृह ऋण (होम लोन)", color: "#f43f5e" },
    carLoan: { en: "Car Loan Outstanding", hi: "कार ऋण (कार लोन)", color: "#fb7185" },
    personalLoan: { en: "Personal Loan Outstanding", hi: "व्यक्तिगत ऋण", color: "#fda4af" },
    creditCard: { en: "Credit Card Overdues", hi: "क्रेडिट कार्ड का बकाया", color: "#e11d48" },
    educationLoan: { en: "Education Loan Outstanding", hi: "शिक्षा ऋण", color: "#be123c" },
  };

  const handleEditClick = (category: "asset" | "liability", key: string, currentVal: number) => {
    setEditType(category);
    setEditKey(key);
    setEditValue(currentVal.toString());
  };

  const handleSaveEdit = () => {
    const numValue = parseFloat(editValue) || 0;
    const updated = { ...data };
    if (editType === "asset") {
      updated.assets = { ...updated.assets, [editKey]: numValue };
      // Push timeline entry
      updated.timeline = [
        {
          id: `t-${Date.now()}`,
          action: `Asset [${assetLabels[editKey]?.[language] || editKey}] updated to ₹${numValue.toLocaleString()}`,
          date: new Date().toISOString(),
          category: "Asset Update",
        },
        ...updated.timeline,
      ];
    } else if (editType === "liability") {
      updated.liabilities = { ...updated.liabilities, [editKey]: numValue };
      updated.timeline = [
        {
          id: `t-${Date.now()}`,
          action: `Liability [${liabilityLabels[editKey]?.[language] || editKey}] updated to ₹${numValue.toLocaleString()}`,
          date: new Date().toISOString(),
          category: "Liability Update",
        },
        ...updated.timeline,
      ];
    }
    onUpdateData(updated);
    setEditType(null);
    setEditKey("");
    setEditValue("");
  };

  // Recharts Data Sets
  const pieDataAssets = Object.entries(data.assets)
    .filter(([_, value]) => value > 0)
    .map(([key, value]) => ({
      name: assetLabels[key]?.[language] || key,
      value,
      color: assetLabels[key]?.color || "#cbd5e1",
    }));

  const pieDataLiabilities = Object.entries(data.liabilities)
    .filter(([_, value]) => value > 0)
    .map(([key, value]) => ({
      name: liabilityLabels[key]?.[language] || key,
      value,
      color: liabilityLabels[key]?.color || "#ef4444",
    }));

  // Net Worth growth projections for visual AreaChart
  const netWorthHistoryData = [
    { year: language === "hi" ? "2022 वास्तविक" : "2022 Act", Assets: totalAssets * 0.7, Liabilities: totalLiabilities * 0.9, NetWorth: totalAssets * 0.7 - totalLiabilities * 0.9 },
    { year: language === "hi" ? "2023 वास्तविक" : "2023 Act", Assets: totalAssets * 0.8, Liabilities: totalLiabilities * 0.95, NetWorth: totalAssets * 0.8 - totalLiabilities * 0.95 },
    { year: language === "hi" ? "2024 वास्तविक" : "2024 Act", Assets: totalAssets * 0.9, Liabilities: totalLiabilities * 0.98, NetWorth: totalAssets * 0.9 - totalLiabilities * 0.98 },
    { year: language === "hi" ? "वर्तमान" : "Current", Assets: totalAssets, Liabilities: totalLiabilities, NetWorth: netWorth },
    { year: language === "hi" ? "2027 अनुमान" : "2027 Proj", Assets: totalAssets * 1.25, Liabilities: totalLiabilities * 0.8, NetWorth: totalAssets * 1.25 - totalLiabilities * 0.8 },
    { year: language === "hi" ? "2028 अनुमान" : "2028 Proj", Assets: totalAssets * 1.55, Liabilities: totalLiabilities * 0.6, NetWorth: totalAssets * 1.55 - totalLiabilities * 0.6 },
    { year: language === "hi" ? "2029 अनुमान" : "2029 Proj", Assets: totalAssets * 1.95, Liabilities: totalLiabilities * 0.4, NetWorth: totalAssets * 1.95 - totalLiabilities * 0.4 },
  ];

  return (
    <div id="section-networth" className="bg-white border border-slate-100 rounded-3xl p-6 shadow-3xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-black text-slate-900 font-display flex items-center gap-2">
            <Landmark className="w-5 h-5 text-emerald-600" />
            <span>{language === "hi" ? "सच्ची कुल संपत्ति (नेट वर्थ) ट्रैकर" : "Comprehensive Net Worth Tracker"}</span>
          </h3>
          <p className="text-xs text-slate-500">
            {language === "hi" 
              ? "आपकी परिसंपत्तियों (एसेट्स) और देनदारियों (लायबिलिटीज) का रीयल-टाइम लेखा-जोखा" 
              : "Consolidated, interactive balance sheet of all financial holdings."}
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("visuals")}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              activeTab === "visuals" ? "bg-white text-slate-900 shadow-3xs" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            {language === "hi" ? "विज़ुअल्स" : "Visual Charts"}
          </button>
          <button
            onClick={() => setActiveTab("balance-sheet")}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              activeTab === "balance-sheet" ? "bg-white text-slate-900 shadow-3xs" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            {language === "hi" ? "बैलेंस शीट" : "Balance Sheet"}
          </button>
        </div>
      </div>

      {/* Net Worth Scorecard banner */}
      <div className="bg-gradient-to-r from-slate-950 to-slate-900 text-white rounded-2xl p-6 grid grid-cols-1 md:grid-cols-3 gap-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_120%,rgba(16,185,129,0.15),transparent_60%)]" />
        <div className="space-y-1 relative z-10">
          <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">
            {language === "hi" ? "कुल संपत्ति (NET WORTH)" : "ESTIMATED NET WORTH"}
          </span>
          <div className="text-3xl font-black text-white font-mono flex items-baseline gap-1">
            ₹{netWorth.toLocaleString()}
          </div>
          <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{language === "hi" ? "विविध संपत्तियों के साथ सुरक्षित विकास" : "Secured inflation beating growth"}</span>
          </span>
        </div>

        <div className="space-y-1 relative z-10 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
            {language === "hi" ? "कुल संपत्तियां (ASSETS)" : "TOTAL ASSETS"}
          </span>
          <div className="text-2xl font-black text-white font-mono">
            ₹{totalAssets.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-400 block">
            {language === "hi" ? "लिक्विड, रियल एस्टेट व फंड" : "Liquids, EPF, Gold & Real Estate"}
          </span>
        </div>

        <div className="space-y-1 relative z-10 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6">
          <span className="text-[10px] font-black uppercase text-rose-400 tracking-wider">
            {language === "hi" ? "कुल देनदारियां (LIABILITIES)" : "TOTAL DEBTS"}
          </span>
          <div className="text-2xl font-black text-white font-mono">
            ₹{totalLiabilities.toLocaleString()}
          </div>
          <span className="text-[11px] text-rose-400 font-bold flex items-center gap-1">
            <span>{language === "hi" ? "ऋण-संपत्ति अनुपात:" : "Debt-to-Asset:"}</span>
            <span>{totalAssets > 0 ? ((totalLiabilities / totalAssets) * 100).toFixed(0) : 0}%</span>
          </span>
        </div>
      </div>

      {/* Main Content switcher */}
      <AnimatePresence mode="wait">
        {activeTab === "visuals" && (
          <motion.div
            key="visuals"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="space-y-6"
          >
            {/* Net worth Growth Trend Chart using AreaChart */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
              <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider block mb-4 text-center">
                {language === "hi" ? "कुल संपत्ति विकास एवं दीर्घकालिक अनुमान (₹)" : "Net Worth Compounding Projections & Mortgage Declines (₹)"}
              </span>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={netWorthHistoryData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="networthGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="liabGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="year" stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`} tickLine={false} />
                    <Tooltip 
                      formatter={(value: any) => [`₹${parseInt(value).toLocaleString()}`, ""]}
                      contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", border: "none", color: "#fff", fontSize: "11px" }}
                    />
                    <Area type="monotone" dataKey="Assets" stroke="#6366f1" strokeWidth={2} fill="transparent" name={language === "hi" ? "संपत्तियां" : "Assets"} />
                    <Area type="monotone" dataKey="Liabilities" stroke="#f43f5e" strokeWidth={2} fill="url(#liabGrad)" name={language === "hi" ? "देनदारियां" : "Liabilities"} />
                    <Area type="monotone" dataKey="NetWorth" stroke="#10b981" strokeWidth={3} fill="url(#networthGrad)" name={language === "hi" ? "नेट वर्थ" : "Net Worth"} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Asset Allocation Pie Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Assets Pie Chart */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col items-center">
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider block mb-4 text-center">
                  {language === "hi" ? "संपत्ति विविधीकरण (परिसंपत्ति वर्ग)" : "Asset Classes Portfolio Mix"}
                </span>
                <div className="h-48 w-full flex items-center justify-center">
                  {pieDataAssets.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieDataAssets}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={75}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {pieDataAssets.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: any) => `₹${value.toLocaleString()}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-xs text-slate-400 italic">No assets registered.</div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 justify-center mt-2 max-h-24 overflow-y-auto w-full">
                  {pieDataAssets.map((asset, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 bg-white border border-slate-100 px-2 py-0.5 rounded-lg shadow-3xs">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: asset.color }} />
                      <span>{asset.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Liabilities Pie Chart */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col items-center">
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider block mb-4 text-center">
                  {language === "hi" ? "ऋण जोखिम विभाजन (देनदारियां)" : "Debt Profile Outstanding Mix"}
                </span>
                <div className="h-48 w-full flex items-center justify-center">
                  {pieDataLiabilities.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieDataLiabilities}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={75}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {pieDataLiabilities.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: any) => `₹${value.toLocaleString()}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-xs text-emerald-600 font-bold flex flex-col items-center gap-1">
                      <Landmark className="w-8 h-8 text-emerald-500" />
                      <span>{language === "hi" ? "बधाई हो! आप 100% कर्ज-मुक्त हैं।" : "Stellar! You are 100% Debt-Free."}</span>
                    </div>
                  )}
                </div>
                {pieDataLiabilities.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-center mt-2 max-h-24 overflow-y-auto w-full">
                    {pieDataLiabilities.map((liab, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 bg-white border border-slate-100 px-2 py-0.5 rounded-lg shadow-3xs">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: liab.color }} />
                        <span>{liab.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "balance-sheet" && (
          <motion.div
            key="balance-sheet"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="space-y-6"
          >
            {/* Balance Sheet layout with inline edit triggers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Assets Section */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-200/50 pb-2">
                  <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-emerald-600" />
                    <span>{language === "hi" ? "परिसंपत्तियां (ASSETS)" : "Assets Portfolio Ledger"}</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-600">₹{totalAssets.toLocaleString()}</span>
                </div>

                <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {Object.entries(data.assets).map(([key, val]) => (
                    <div key={key} className="bg-white border border-slate-100 rounded-xl p-3 flex justify-between items-center hover:shadow-3xs transition-all group">
                      <div className="space-y-0.5">
                        <span className="text-xs font-semibold text-slate-800 block">
                          {assetLabels[key]?.[language] || key}
                        </span>
                        <span className="text-[10px] font-mono text-emerald-600 font-bold block">
                          ₹{val.toLocaleString()}
                        </span>
                      </div>

                      <button
                        onClick={() => handleEditClick("asset", key, val)}
                        className="p-1.5 bg-slate-50 hover:bg-emerald-50 rounded-lg text-slate-400 group-hover:text-emerald-600 transition-all cursor-pointer border border-transparent hover:border-emerald-100"
                        title="Edit value"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Liabilities Section */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-200/50 pb-2">
                  <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-500" />
                    <span>{language === "hi" ? "देनदारियां (LIABILITIES)" : "Liabilities & Mortgages Ledger"}</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-rose-600">₹{totalLiabilities.toLocaleString()}</span>
                </div>

                <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {Object.entries(data.liabilities).map(([key, val]) => (
                    <div key={key} className="bg-white border border-slate-100 rounded-xl p-3 flex justify-between items-center hover:shadow-3xs transition-all group">
                      <div className="space-y-0.5">
                        <span className="text-xs font-semibold text-slate-800 block">
                          {liabilityLabels[key]?.[language] || key}
                        </span>
                        <span className="text-[10px] font-mono text-rose-600 font-bold block">
                          ₹{val.toLocaleString()}
                        </span>
                      </div>

                      <button
                        onClick={() => handleEditClick("liability", key, val)}
                        className="p-1.5 bg-slate-50 hover:bg-rose-50 rounded-lg text-slate-400 group-hover:text-rose-600 transition-all cursor-pointer border border-transparent hover:border-rose-100"
                        title="Edit value"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Inline edit panel if active */}
            <AnimatePresence>
              {editType && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-bhagwa-50/50 border border-bhagwa-100 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-bhagwa-800 uppercase block tracking-wider">
                      {language === "hi" ? "खाता अद्यतन" : "QUICK LEDGER AMENDMENT"}
                    </span>
                    <p className="text-xs text-slate-700 font-semibold">
                      {language === "hi" ? "संशोधन करें:" : "Updating:"}{" "}
                      <strong className="text-slate-900">
                        {editType === "asset" ? assetLabels[editKey]?.[language] : liabilityLabels[editKey]?.[language]}
                      </strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">₹</span>
                      <input
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="pl-6 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold w-44 focus:outline-none focus:ring-1 focus:ring-bhagwa-500"
                        placeholder="Enter amount"
                      />
                    </div>

                    <button
                      onClick={handleSaveEdit}
                      className="px-3.5 py-2 bg-bhagwa-600 hover:bg-bhagwa-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-sm cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>{language === "hi" ? "सहेजें" : "Save"}</span>
                    </button>
                    <button
                      onClick={() => setEditType(null)}
                      className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-slate-600 rounded-xl transition-all cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
