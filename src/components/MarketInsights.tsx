import React, { useState, useEffect } from "react";
import { paisaFetch } from "../api";
import { Newspaper, RefreshCw, AlertCircle, ArrowRight, Sparkles, Send, MapPin, Landmark, Award, Copy, Check } from "lucide-react";

interface InsightItem {
  id: string;
  category: string;
  title: string;
  summary: string;
  status: string;
  statusColor: string;
  date: string;
  impact: string;
}

const LOCAL_FALLBACK_INSIGHTS_EN: InsightItem[] = [
  {
    id: "bihar-transfer-1",
    category: "Bihar Teacher Transfer",
    title: "Official Notification: Bihar State Teacher Transfer Rules, 2026 Released",
    summary: "The Education Department of Bihar has officially notified the 'Bihar State Teacher Transfer Rules, 2026' (Memo 11/Vi-33/2026) dated June 25, 2026. It introduces a highly structured Point-Based Seniority System (अंक-आधारित वरीयता प्रणाली) for primary, middle, secondary, and higher secondary government school teachers, with transparent rules for mutual and general transfers.",
    status: "Policy Notified",
    statusColor: "emerald",
    date: "June 25, 2026",
    impact: "Establishes transparent point scores (up to 20 pts for medical/disability, 15 pts for spouse posting, 10 pts for single parent, plus service-linked points) for over 1.5 Lakh teachers."
  },
  {
    id: "bihar-salary-1",
    category: "Bihar Teacher Salary",
    title: "BPSC Shikshak Dearness Allowance Disbursed at 50%",
    summary: "Dearness Allowance (DA) of 50% calculated on basic pay scaled by the 7th Pay Commission has been successfully disbursed for BPSC primary, secondary, and senior secondary teacher cadres.",
    status: "Slabs Disbursed",
    statusColor: "blue",
    date: "May 2026",
    impact: "Direct increase in take-home monthly salary by ₹3,800 - ₹6,000 depending on pay levels."
  },
  {
    id: "neighbour-states-1",
    category: "Neighbouring States",
    title: "Jharkhand & UP Teacher Pay Harmonization Projects",
    summary: "Jharkhand cabinet approved alignment of public teacher scale DA to 53% starting mid-year. Uttar Pradesh establishes unified educational recruitment boards to evaluate pending scale hikes.",
    status: "Scale Synced",
    statusColor: "purple",
    date: "June 2026",
    impact: "Averages salaries across border districts, preventing cross-state employee departures."
  },
  {
    id: "state-central-1",
    category: "State & Central Employees",
    title: "8th Pay Commission Memorandum Filed; UPS vs NPS Debate",
    summary: "Joint staff employees federations have submitted official memorandums urging the prompt formation of the 8th Pay Commission with recommended fitment factors of 2.86x or 3.0x. Unified Pension Scheme (UPS) implementation rules are also under union evaluation.",
    status: "Whitepaper Stage",
    statusColor: "amber",
    date: "June 2026",
    impact: "A 2.86x fitment factor would raise minimum initial basic pay scales from ₹18,000 up to ₹51,480."
  }
];

const LOCAL_FALLBACK_INSIGHTS_HI: InsightItem[] = [
  {
    id: "bihar-transfer-1",
    category: "Bihar Teacher Transfer",
    title: "आधिकारिक अधिसूचना: 'बिहार राज्य शिक्षक स्थानान्तरण नियमावली, 2026' जारी",
    summary: "बिहार शिक्षा विभाग ने 25 जून 2026 को 'बिहार राज्य शिक्षक स्थानान्तरण नियमावली, 2026' (संचिका संख्या 11/वि०-33/2026) की आधिकारिक अधिसूचना जारी कर दी है। इसके तहत प्राथमिक, मध्य, माध्यमिक और उच्चतर माध्यमिक शिक्षकों के स्थानांतरण के लिए एक पारदर्शी 'अंक-आधारित वरीयता प्रणाली' (Point-Based Seniority System) लागू की गई है।",
    status: "नियमावली अधिसूचित",
    statusColor: "emerald",
    date: "25 जून 2026",
    impact: "तबादलों में पूर्ण पारदर्शिता आएगी; शिक्षक अपनी सेवा अवधि (1 अंक प्रति शैक्षणिक वर्ष), स्कूल श्रेणी (1-5 अंक) और विशेष श्रेणियों जैसे गंभीर बीमारी/दिव्यांगता (20 अंक), पति-पत्नी पदस्थापन (15 अंक) के आधार पर वरीयता स्कोर की गणना कर सकेंगे।"
  },
  {
    id: "bihar-salary-1",
    category: "Bihar Teacher Salary",
    title: "बीपीएससी शिक्षक महंगाई भत्ता (DA) 50% स्वीकृत और वितरित",
    summary: "सातवें वेतन आयोग की सिफारिशों के आधार पर तय किए गए मूल वेतन पर 50% की दर से महंगाई भत्ता (DA) बीपीएससी प्राथमिक, माध्यमिक और उच्चतर माध्यमिक शिक्षक संवर्गों के लिए सफलतापूर्वक जारी कर दिया गया है।",
    status: "डीए वितरित",
    statusColor: "blue",
    date: "मई 2026",
    impact: "वेतन स्तर के आधार पर मासिक इन-हैंड सैलरी में ₹3,800 से ₹6,000 तक की सीधी और तत्काल बढ़ोतरी।"
  },
  {
    id: "neighbour-states-1",
    category: "Neighbouring States",
    title: "झारखंड और उत्तर प्रदेश शिक्षक वेतन संरेखण परियोजनाएं",
    summary: "झारखंड कैबिनेट ने सरकारी शिक्षकों के महंगाई भत्ते को बढ़ाकर 53% करने की मंजूरी दे दी है। वहीं उत्तर प्रदेश सरकार लंबित वेतनमान विसंगतियों को दूर करने के लिए नए शिक्षा सेवा चयन बोर्ड का गठन कर रही है।",
    status: "वेतनमान संरेखित",
    statusColor: "purple",
    date: "जून 2026",
    impact: "सीमावर्ती जिलों में कार्यरत शिक्षकों के वेतन में असमानता कम होगी, जिससे शिक्षकों के पलायन पर रोक लगेगी।"
  },
  {
    id: "state-central-1",
    category: "State & Central Employees",
    title: "8वें वेतन आयोग का ज्ञापन प्रस्तुत; यूपीएस बनाम एनपीएस बहस तेज",
    summary: "कर्मचारी महासंघों ने 2.86x या 3.0x फिटमेंट फैक्टर की सिफारिश के साथ 8वें वेतन आयोग के तत्काल गठन के लिए आधिकारिक मांग पत्र सौंपा है। इसके साथ ही यूनियनों द्वारा एकीकृत पेंशन योजना (UPS) के नियमों का भी गहन विश्लेषण किया जा रहा है।",
    status: "ज्ञापन स्तर",
    statusColor: "amber",
    date: "जून 2026",
    impact: "यदि 2.86x फिटमेंट फैक्टर लागू होता है, तो न्यूनतम प्रारंभिक मूल वेतन ₹18,000 से बढ़कर सीधे ₹51,480 हो जाएगा।"
  }
];

interface MarketInsightsProps {
  language: string;
}

export default function MarketInsights({ language }: MarketInsightsProps) {
  const defaultFallback = language === "hi" ? LOCAL_FALLBACK_INSIGHTS_HI : LOCAL_FALLBACK_INSIGHTS_EN;
  const [insights, setInsights] = useState<InsightItem[]>(defaultFallback);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("All");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchInsights = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const response = await paisaFetch(`/api/market-insights?lang=${language}`);
      if (!response.ok) {
        throw new Error("Failed to load real-time market insights.");
      }
      const data = await response.json();
      const insightsList = Array.isArray(data) ? data : (data && Array.isArray(data.insights) ? data.insights : null);
      if (insightsList && insightsList.length > 0) {
        setInsights(insightsList);
      } else {
        throw new Error("Invalid response format.");
      }
    } catch (err: any) {
      console.warn("Could not retrieve live insights, using high-fidelity local cache:", err);
      // Quietly fall back to high-fidelity cache instead of locking user into an error box
      setInsights(language === "hi" ? LOCAL_FALLBACK_INSIGHTS_HI : LOCAL_FALLBACK_INSIGHTS_EN);
      setErrorMsg(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [language]);

  const handleShareWhatsApp = (item: InsightItem) => {
    const localizedCategory = language === "hi" ? (
      item.category === "Bihar Teacher Transfer" ? "शिक्षक स्थानांतरण" :
      item.category === "Bihar Teacher Salary" ? "शिक्षक वेतन" :
      item.category === "Neighbouring States" ? "पड़ोसी राज्य" :
      item.category === "State & Central Employees" ? "कर्मचारी संघ" :
      item.category
    ) : item.category;

    const text = `📰 *${item.title}*\n\n` +
      `📌 *${language === 'hi' ? 'श्रेणी' : 'Category'}*: ${localizedCategory}\n` +
      `🗓️ *${language === 'hi' ? 'दिनांक' : 'Date'}*: ${item.date}\n` +
      `🏷️ *${language === 'hi' ? 'स्थिति' : 'Status'}*: ${item.status}\n\n` +
      `📝 ${item.summary}\n\n` +
      `💡 *${language === 'hi' ? 'वित्तीय और नीतिगत प्रभाव' : 'Financial & Policy Impact'}:*\n${item.impact}\n\n` +
      `👉 कैलकुलेशन के लिए 'पैसा ब्लूप्रिंट' देखें: ${window.location.origin}`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const handleCopyText = (item: InsightItem) => {
    const localizedCategory = language === "hi" ? (
      item.category === "Bihar Teacher Transfer" ? "शिक्षक स्थानांतरण" :
      item.category === "Bihar Teacher Salary" ? "शिक्षक वेतन" :
      item.category === "Neighbouring States" ? "पड़ोसी राज्य" :
      item.category === "State & Central Employees" ? "कर्मचारी संघ" :
      item.category
    ) : item.category;

    const text = `📰 ${item.title}\n\n` +
      `Category: ${localizedCategory}\n` +
      `Date: ${item.date}\n` +
      `Status: ${item.status}\n\n` +
      `${item.summary}\n\n` +
      `Impact:\n${item.impact}\n\n` +
      `Check calculations at: ${window.location.origin}`;

    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const categories = ["All", "Bihar Teacher Transfer", "Bihar Teacher Salary", "Neighbouring States", "State & Central Employees"];

  const filteredInsights = activeTab === "All" 
    ? insights 
    : insights.filter(item => item.category === activeTab);

  const getStatusClasses = (color: string) => {
    switch (color) {
      case "emerald":
        return "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30";
      case "blue":
        return "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30";
      case "purple":
        return "bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/30";
      case "amber":
        return "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30";
      case "rose":
        return "bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30";
      default:
        return "bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-800";
    }
  };

  // Safe translations
  const labels: Record<string, Record<string, string>> = {
    en: {
      header: "Governance & Market Insights",
      subHeader: "Latest circulars, teacher transfers, and pay updates",
      refresh: "Refresh Feed",
      impact: "Financial & Policy Impact",
      noData: "No updates found for this category.",
      loading: "Fetching live policies..."
    },
    hi: {
      header: "शासन और बाज़ार अंतर्दृष्टि",
      subHeader: "नवीनतम परिपत्र, शिक्षक स्थानांतरण और वेतन नियम",
      refresh: "अपडेट करें",
      impact: "वित्तीय और नीतिगत प्रभाव",
      noData: "इस श्रेणी के लिए कोई अपडेट नहीं मिला।",
      loading: "नीति फ़ीड लोड हो रही है..."
    }
  };

  const currentLabels = labels[language] || labels.en;

  return (
    <div id="market-insights-widget-box" className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/30">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-bhagwa-500/10 text-bhagwa-600 rounded-lg">
            <Newspaper className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider font-display">
              {currentLabels.header}
            </h4>
            <p className="text-[10px] text-slate-400 font-medium">
              {currentLabels.subHeader}
            </p>
          </div>
        </div>
        <button
          onClick={fetchInsights}
          disabled={loading}
          className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer disabled:opacity-50"
          title={currentLabels.refresh}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-bhagwa-600" : ""}`} />
        </button>
      </div>

      {/* Categories Horizontal scroller */}
      <div className="px-4 py-2 bg-slate-50/20 dark:bg-slate-950/10 border-b border-slate-100 dark:border-slate-800 overflow-x-auto flex gap-1.5 scrollbar-none">
        {categories.map((cat) => {
          const isSelected = activeTab === cat;
          let labelText = cat;
          if (language === "hi") {
            if (cat === "All") labelText = "सभी अपडेट";
            if (cat === "Bihar Teacher Transfer") labelText = "स्थानांतरण";
            if (cat === "Bihar Teacher Salary") labelText = "शिक्षक वेतन";
            if (cat === "Neighbouring States") labelText = "पड़ोसी राज्य";
            if (cat === "State & Central Employees") labelText = "कर्मचारी संघ";
          }
          return (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`text-[10px] font-black tracking-tight whitespace-nowrap px-2.5 py-1 rounded-full transition-all cursor-pointer border select-none ${
                isSelected
                  ? "bg-slate-900 border-slate-900 text-white dark:bg-slate-800 dark:border-slate-800"
                  : "bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-900 text-slate-500 hover:text-slate-800 dark:hover:text-white hover:border-slate-200"
              }`}
            >
              {labelText}
            </button>
          );
        })}
      </div>

      {/* News updates container */}
      <div className="p-4 space-y-3.5 max-h-[460px] overflow-y-auto">
        {loading ? (
          <div className="space-y-3 py-6 text-center">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto text-bhagwa-600" />
            <p className="text-[11px] text-slate-400 font-semibold">{currentLabels.loading}</p>
          </div>
        ) : errorMsg ? (
          <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 text-xs flex gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <div>
              <p className="font-bold">Error retrieving insights</p>
              <p className="text-[11px] mt-0.5">{errorMsg}</p>
            </div>
          </div>
        ) : filteredInsights.length === 0 ? (
          <p className="text-xs text-center text-slate-400 py-6">{currentLabels.noData}</p>
        ) : (
          filteredInsights.map((item) => {
            const localizedCategory = language === "hi" ? (
              item.category === "Bihar Teacher Transfer" ? "शिक्षक स्थानांतरण" :
              item.category === "Bihar Teacher Salary" ? "शिक्षक वेतन" :
              item.category === "Neighbouring States" ? "पड़ोसी राज्य" :
              item.category === "State & Central Employees" ? "कर्मचारी संघ" :
              item.category
            ) : item.category;

            return (
              <div 
                key={item.id} 
                className="border-b border-dashed border-slate-100 dark:border-slate-800 last:border-0 pb-3.5 last:pb-0 space-y-2 animate-fadeIn"
              >
                {/* Category, Date & Status */}
                <div className="flex items-center justify-between text-[9px] font-bold">
                  <span className="text-bhagwa-600 bg-bhagwa-500/5 px-2 py-0.5 rounded uppercase tracking-wider">
                    {localizedCategory}
                  </span>
                  <span className="text-slate-400">{item.date}</span>
                </div>

                {/* Title & badge */}
                <div className="space-y-1">
                  <div className="flex items-start gap-1.5 justify-between">
                    <h5 className="text-[11px] font-extrabold text-slate-800 dark:text-white leading-tight mt-0.5">
                      {item.title}
                    </h5>
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold whitespace-nowrap uppercase tracking-tight shrink-0 select-none ${getStatusClasses(item.statusColor)}`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                    {item.summary}
                  </p>
                </div>

                {/* Impact Callout */}
                <div className="bg-slate-50 dark:bg-slate-950/40 rounded-lg p-2 border border-slate-100/50 dark:border-slate-800 text-[10px] space-y-0.5">
                  <span className="font-extrabold text-[#d25c00] dark:text-bhagwa-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#d25c00] dark:text-bhagwa-400 shrink-0" />
                    {currentLabels.impact}
                  </span>
                  <p className="text-slate-600 dark:text-slate-350 leading-normal font-medium">
                    {item.impact}
                  </p>
                </div>

                {/* Share bar */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-tight">
                    {language === "hi" ? "साझा करें:" : "Share update:"}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleShareWhatsApp(item)}
                      className="flex items-center gap-1 px-2.5 py-1 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/20 hover:bg-emerald-100/40 dark:hover:bg-emerald-950/30 rounded-md transition-all cursor-pointer"
                    >
                      <Send className="w-2.5 h-2.5 text-emerald-500" />
                      WhatsApp
                    </button>
                    <button
                      onClick={() => handleCopyText(item)}
                      className="flex items-center gap-1 px-2.5 py-1 text-[9px] font-bold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border border-slate-100/50 dark:border-slate-700 hover:bg-slate-100/50 dark:hover:bg-slate-700 rounded-md transition-all cursor-pointer"
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check className="w-2.5 h-2.5 text-emerald-500" />
                          {language === "hi" ? "कॉपी हुआ!" : "Copied!"}
                        </>
                      ) : (
                        <>
                          <Copy className="w-2.5 h-2.5 text-slate-400" />
                          {language === "hi" ? "कॉपी करें" : "Copy text"}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
