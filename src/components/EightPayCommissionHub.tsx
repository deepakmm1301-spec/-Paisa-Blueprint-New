import React, { useState } from "react";
import { 
  BarChart3, 
  BookOpen, 
  Calendar, 
  ChevronRight, 
  Coins, 
  FileText, 
  Info, 
  IndianRupee, 
  Newspaper, 
  TrendingUp, 
  Users, 
  Sparkles, 
  ArrowLeftRight,
  TrendingDown,
  HelpCircle,
  FileSpreadsheet,
  Share2
} from "lucide-react";
import { getShareableLink } from "../types";
import { generatePDFReport } from "../utils/pdfGenerator";

interface EightPayCommissionHubProps {
  activeSubPage: string;
  onNavigate: (subPage: string) => void;
  language: "en" | "hi";
}

export default function EightPayCommissionHub({ activeSubPage, onNavigate, language }: EightPayCommissionHubProps) {
  // Calculator States
  const [basicPay, setBasicPay] = useState<number>(35400); // Level 6 GP 4200 (eg. Standard BPSC Middle Teacher basic / GP 4200 entry)
  const [customBasic, setCustomBasic] = useState<string>("35400");
  const [fitmentFactor, setFitmentFactor] = useState<number>(2.86); // Union demand
  const [customFitment, setCustomFitment] = useState<string>("2.86");
  
  // Salary / Hike calculator state
  const [currentSelectedLevel, setCurrentSelectedLevel] = useState<string>("Level 6 (GP 4200)");
  const [currentDaPercent, setCurrentDaPercent] = useState<number>(60); // Defaulting current DA to 60% as requested
  const [hraClass, setHraClass] = useState<string>("Y"); // Class Y (20% or 16%)
  const [manualHraPercent, setManualHraPercent] = useState<string>("15"); // State for custom manual HRA percentage
  const [expectedDa8th, setExpectedDa8th] = useState<number>(0); // Starts at 0%
  const [otherAllowances, setOtherAllowances] = useState<number>(1000); // Medical, etc.

  // Pension state
  const [retiringBasic, setRetiringBasic] = useState<number>(67700); // eg. Level 11

  // Parse state from URL search params at mount
  React.useEffect(() => {
    if (typeof window === "undefined" || !window.location.search) return;
    try {
      const params = new URLSearchParams(window.location.search);
      
      const bp = params.get("bp") || params.get("basic");
      if (bp) {
        const val = parseInt(bp);
        if (!isNaN(val) && val > 0) {
          setBasicPay(val);
          setCustomBasic(val.toString());
        }
      }
      const ff = params.get("ff") || params.get("factor");
      if (ff) {
        const val = parseFloat(ff);
        if (!isNaN(val) && val > 0) {
          setFitmentFactor(val);
          setCustomFitment(ff);
        }
      }
      const da = params.get("da");
      if (da) {
        const val = parseInt(da);
        if (!isNaN(val) && val >= 0) {
          setCurrentDaPercent(val);
        }
      }
      const eda = params.get("eda");
      if (eda) {
        const val = parseInt(eda);
        if (!isNaN(val) && val >= 0) {
          setExpectedDa8th(val);
        }
      }
      const hra = params.get("hra");
      if (hra) {
        setHraClass(hra);
      }
      const mhra = params.get("mhra") || params.get("manual_hra");
      if (mhra) {
        setManualHraPercent(mhra);
      }
      const rb = params.get("rb") || params.get("retBasic");
      if (rb) {
        const val = parseInt(rb);
        if (!isNaN(val) && val > 0) {
          setRetiringBasic(val);
        }
      }
    } catch (e) {
      console.warn("Could not load initial 8th Pay states from query parameters", e);
    }
  }, []);

  // Serialize states to URL search params in real-time
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const params = new URLSearchParams(window.location.search);
      let changed = false;

      const setParamWithChange = (key: string, value: string) => {
        if (params.get(key) !== value) {
          params.set(key, value);
          changed = true;
        }
      };

      setParamWithChange("bp", basicPay.toString());
      setParamWithChange("ff", fitmentFactor.toString());
      setParamWithChange("da", currentDaPercent.toString());
      setParamWithChange("eda", expectedDa8th.toString());
      setParamWithChange("hra", hraClass);
      setParamWithChange("mhra", manualHraPercent);
      setParamWithChange("rb", retiringBasic.toString());

      if (changed) {
        const newSearch = params.toString();
        const currentSearch = window.location.search.replace(/^\?/, "");
        if (newSearch !== currentSearch) {
          const newUrl = `${window.location.pathname}?${newSearch}`;
          window.history.replaceState(null, "", newUrl);
        }
      }
    } catch (e) {
      console.warn("Could not serialize 8th Pay states to URL parameters", e);
    }
  }, [basicPay, fitmentFactor, currentDaPercent, expectedDa8th, hraClass, manualHraPercent, retiringBasic]);

  // Handle standard pay levels
  const payLevels = [
    { name: "Level 1 (GP 1800)", basic: 18000, desc: "Peon / Multi-Tasking Staff" },
    { name: "Level 2 (GP 1900)", basic: 19900, desc: "Lower Division Clerk" },
    { name: "Level 3 (GP 2000)", basic: 21700, desc: "Upper Division Clerk" },
    { name: "Level 4 (GP 2400)", basic: 25500, desc: "Tax Assistant / BPSC Primary Basic" },
    { name: "Level 5 (GP 2800)", basic: 29200, desc: "Auditor / Accountant / Bihar Clerk" },
    { name: "Level 6 (GP 4200)", basic: 35400, desc: "BPSC Middle School Teacher / Sub-Inspector" },
    { name: "Level 7 (GP 4600)", basic: 44900, desc: "BPSC Secondary Teacher / Senior Inspector" },
    { name: "Level 8 (GP 4800)", basic: 47600, desc: "BPSC Headmaster / Senior Gazette Officer" },
    { name: "Level 9 (GP 5400)", basic: 53100, desc: "Assistant Professor / SDM" },
    { name: "Level 10 (GP 5400 PB3)", basic: 56100, desc: "DSP / Under Secretary" },
    { name: "Level 11 (GP 6600)", basic: 67700, desc: "Deputy Secretary / Senior State Officers" },
    { name: "Level 12 (GP 7600)", basic: 78800, desc: "Joint Secretary / Director level" },
  ];

  // Helper to format currency
  const formatCurrency = (amount: number) => {
    return "₹" + Math.round(amount).toLocaleString("en-IN");
  };

  // Warning Banner component
  const DisclaimerBanner = () => (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4.5 text-slate-800 text-xs sm:text-sm leading-relaxed mb-6 shadow-3xs flex items-start gap-3 print:hidden">
      <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5 animate-pulse" />
      <div>
        <p className="font-extrabold text-amber-800 uppercase tracking-wide text-[10px] mb-1">
          {language === "hi" ? "महत्वपूर्ण नोट व अस्वीकरण" : "Important Note & Official Disclaimer"}
        </p>
        <p className="font-medium text-slate-700">
          {language === "hi" 
            ? "चूंकि 8वें वेतन आयोग (8th Pay Commission) की अंतिम सिफारिशें अभी तक केंद्र सरकार द्वारा आधिकारिक रूप से लागू नहीं की गई हैं, इसलिए सभी आंकड़े और गणनाएँ पूर्वानुमानित/काल्पनिक फिटमेंट फैक्टर पर आधारित हैं। हम बिना किसी आधिकारिक पुष्टि के केवल सैद्धांतिक मॉडल और संभावित फिटमेंट फैक्टर्स के अनुमान दिखा रहे हैं। (काल्पनिक फिटमेंट फैक्टर के आधार पर अनुमानित वेतन)"
            : "Since the final recommendations of the 8th Pay Commission are not yet officially implemented by the Central Government, all calculations and figures are indicative estimates based on assumed fitment factors and standard expectations. No speculative numbers are presented as absolute facts. Estimated salary based on assumed fitment factor."
          }
        </p>
      </div>
    </div>
  );

  // Sub navigation links helper
  const tabs = [
    { id: "calculator", label: language === "hi" ? "8वां वेतन कैलकुलेटर" : "8th Pay Calculator", icon: <Coins className="w-4 h-4" /> },
    { id: "fitment", label: language === "hi" ? "फिटमेंट फैक्टर गणना" : "Fitment Factor Calc", icon: <ArrowLeftRight className="w-4 h-4" /> },
    { id: "hike", label: language === "hi" ? "वेतन वृद्धि सिम्युलेटर" : "Salary Hike Calc", icon: <BarChart3 className="w-4 h-4" /> },
    { id: "pension", label: language === "hi" ? "8वें वेतन पेंशन" : "Pension Estimator", icon: <FileText className="w-4 h-4" /> },
  ];

  const contentTabs = [
    { id: "latest-news", label: language === "hi" ? "नवीनतम समाचार & अपडेट" : "Latest News & Updates", icon: <Newspaper className="w-4 h-4" /> },
    { id: "fitment-factor", label: language === "hi" ? "फिटमेंट फैक्टर गाइड" : "Fitment Factor Guide", icon: <Info className="w-4 h-4" /> },
    { id: "salary-chart", label: language === "hi" ? "पे मैट्रिक्स चार्ट" : "Estimated Salary Chart", icon: <FileSpreadsheet className="w-4 h-4" /> },
    { id: "date", label: language === "hi" ? "लागू होने की संभावित तारीख" : "Implementation Date", icon: <Calendar className="w-4 h-4" /> },
    { id: "for-teachers", label: language === "hi" ? "शिक्षकों के लिए लाभ" : "Benefits for Teachers", icon: <Users className="w-4 h-4" /> },
  ];

  // Calculations for Calculator 1: 8th Pay Commission Salary Calculator 2026
  const getRevisedBasic = (currentBasic: number, factor: number) => {
    const raw = currentBasic * factor;
    // Pay Commission always rounds basic pay upwards or to closest cell in Pay Matrix (usually nearest ₹100)
    return Math.ceil(raw / 100) * 100;
  };

  const calculatedRevisedBasic = getRevisedBasic(basicPay, fitmentFactor);
  
  // HRA calculation helper
  const getHraRate = (hraClassParam: string, isRevised: boolean) => {
    if (hraClassParam === "X") return isRevised ? 0.30 : 0.27;
    if (hraClassParam === "Y") return isRevised ? 0.20 : 0.18;
    if (hraClassParam === "Z") return isRevised ? 0.10 : 0.09;
    
    // Custom manual HRA
    const parsed = parseFloat(manualHraPercent);
    if (!isNaN(parsed)) {
      // For maximum accuracy, the user-defined percentage is divided by 100.
      return parsed / 100;
    }
    return isRevised ? 0.10 : 0.09;
  };

  const hraOld = basicPay * getHraRate(hraClass, false);
  const hraNew = calculatedRevisedBasic * getHraRate(hraClass, true);

  const daOld = basicPay * (currentDaPercent / 100);
  const daNew = calculatedRevisedBasic * (expectedDa8th / 100);

  const grossOld = basicPay + daOld + hraOld + otherAllowances;
  const grossNew = calculatedRevisedBasic + daNew + hraNew + otherAllowances;

  // NPS deduction: Employee 10% of Basic + DA
  const npsOld = (basicPay + daOld) * 0.10;
  const npsNew = (calculatedRevisedBasic + daNew) * 0.10;

  // Govt NPS contribution (14% under National Pension Scheme)
  const govtNpsOld = (basicPay + daOld) * 0.14;
  const govtNpsNew = (calculatedRevisedBasic + daNew) * 0.14;

  const inHandOld = grossOld - npsOld;
  const inHandNew = grossNew - npsNew;

  const shareToWhatsApp = () => {
    const currentUrl = getShareableLink("eight_pay_calc", "/8th-pay-commission-calculator");
    const text = language === "hi"
      ? `📊 *8वां वेतन आयोग (8th Pay Commission) सैलरी कैलकुलेटर*\n\nवर्तमान मूल वेतन: ₹${basicPay.toLocaleString("en-IN")}\nअनुमानित फिटमेंट फैक्टर: ${fitmentFactor}x\n*अनुमानित संशोधित 8वां मूल वेतन: ₹${calculatedRevisedBasic.toLocaleString("en-IN")}*\nअनुमानित संशोधित सकल मासिक वेतन (Gross): ₹${Math.round(grossNew).toLocaleString("en-IN")}/माह (+₹${Math.round(grossNew - grossOld).toLocaleString("en-IN")} यानी +${((grossNew - grossOld) / grossOld * 100).toFixed(1)}% की वृद्धि)\nअनुमानित इन-हैंड वेतन (Net In-Hand): ₹${Math.round(inHandNew).toLocaleString("en-IN")}/माह\n\nअपने 8वें वेतन आयोग के वेतन, कुल बढ़ोतरी और पेंशन की तुरंत गणना करें: ${currentUrl}`
      : `📊 *8th Pay Commission Salary Calculator 2026*\n\nCurrent Basic Pay: ₹${basicPay.toLocaleString("en-IN")}\nAssumed Fitment Factor: ${fitmentFactor}x\n*Estimated Revised 8th CPC Basic Pay: ₹${calculatedRevisedBasic.toLocaleString("en-IN")}*\nEstimated Revised Gross Salary: ₹${Math.round(grossNew).toLocaleString("en-IN")}/month (+₹${Math.round(grossNew - grossOld).toLocaleString("en-IN")} | +${((grossNew - grossOld) / grossOld * 100).toFixed(1)}% hike)\nEstimated Net In-Hand Salary: ₹${Math.round(inHandNew).toLocaleString("en-IN")}/month\n\nCalculate your 8th Pay basic, gross, hike & pension instantly here: ${currentUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  const downloadPDFReport = () => {
    generatePDFReport({
      title: language === "hi" ? "8वां वेतन आयोग अनुमान रिपोर्ट 2026" : "8th Pay Commission Projections Report 2026",
      subtitle: language === "hi" ? "8वें वेतन आयोग के तहत संभावित वेतन वृद्धि एवं पेंशन विश्लेषण" : "Indicative salary hike & pension estimations under 8th CPC",
      language,
      sections: [
        {
          title: language === "hi" ? "वेतन आयोग मूल मानक" : "Salary Commission Parameters",
          items: [
            { label: language === "hi" ? "वर्तमान मूल वेतन (7th CPC)" : "Current Basic Pay (7th CPC)", value: `INR ${basicPay.toLocaleString("en-IN")}` },
            { label: language === "hi" ? "प्रस्तावित फिटमेंट फैक्टर" : "Assumed Fitment Factor", value: `${fitmentFactor}x` },
            { label: language === "hi" ? "नया संशोधित मूल वेतन (8th CPC)" : "Revised Basic Pay (8th CPC)", value: `INR ${calculatedRevisedBasic.toLocaleString("en-IN")}` }
          ]
        },
        {
          title: language === "hi" ? "भत्ते और तुलनात्मक सकल वेतन" : "Allowances & Gross Salary Comparison",
          items: [
            { label: language === "hi" ? "महंगाई भत्ता (7th CPC)" : "Dearness Allowance (7th CPC)", value: `INR ${daOld.toLocaleString("en-IN")} (${currentDaPercent}%)` },
            { label: language === "hi" ? "महंगाई भत्ता (8th CPC)" : "Dearness Allowance (8th CPC)", value: `INR ${daNew.toLocaleString("en-IN")} (${expectedDa8th}%)` },
            { label: language === "hi" ? "मकान किराया भत्ता (7th CPC)" : "HRA (7th CPC)", value: `INR ${hraOld.toLocaleString("en-IN")}` },
            { label: language === "hi" ? "मकान किराया भत्ता (8th CPC)" : "HRA (8th CPC)", value: `INR ${hraNew.toLocaleString("en-IN")}` },
            { label: language === "hi" ? "सकल मासिक वेतन (7th CPC)" : "Gross Monthly Salary (7th CPC)", value: `INR ${grossOld.toLocaleString("en-IN")}` },
            { label: language === "hi" ? "सकल मासिक वेतन (8th CPC)" : "Gross Monthly Salary (8th CPC)", value: `INR ${grossNew.toLocaleString("en-IN")}` }
          ]
        },
        {
          title: language === "hi" ? "शुद्ध इन-हैंड वेतन तुलना (कटौती के बाद)" : "Net Take-Home Salary Comparison",
          items: [
            { label: language === "hi" ? "एनपीएस कटौती (7th CPC)" : "NPS Deduction (7th CPC)", value: `INR ${npsOld.toLocaleString("en-IN")}` },
            { label: language === "hi" ? "एनपीएस कटौती (8th CPC)" : "NPS Deduction (8th CPC)", value: `INR ${npsNew.toLocaleString("en-IN")}` },
            { label: language === "hi" ? "शुद्ध इन-हैंड वेतन (7th CPC)" : "In-Hand Salary (7th CPC)", value: `INR ${inHandOld.toLocaleString("en-IN")}` },
            { label: language === "hi" ? "शुद्ध इन-हैंड वेतन (8th CPC)" : "In-Hand Salary (8th CPC)", value: `INR ${inHandNew.toLocaleString("en-IN")}` }
          ]
        },
        {
          title: language === "hi" ? "वेतन वृद्धि एवं सेवानिवृत्ति योगदान" : "Salary Growth & Pension Benefits",
          items: [
            { label: language === "hi" ? "मासिक सकल वेतन वृद्धि" : "Monthly Gross Hike", value: `INR ${(grossNew - grossOld).toLocaleString("en-IN")} (+${((grossNew - grossOld) / grossOld * 100).toFixed(1)}%)` },
            { label: language === "hi" ? "सरकार का एनपीएस योगदान (8th CPC)" : "Govt NPS Contribution (8th CPC)", value: `INR ${govtNpsNew.toLocaleString("en-IN")}` }
          ]
        }
      ],
      notes: language === "hi" ? [
        "यह रिपोर्ट प्रस्तावित/काल्पनिक फिटमेंट फैक्टर पर आधारित सांकेतिक गणना है।",
        "सरकारी एनपीएस पेंशन योगदान (14%) सीधे आपके नेशनल पेंशन सिस्टम खाते में जमा किया जाता है, यह इन-हैंड वेतन में शामिल नहीं होता है।",
        "यह रिपोर्ट केवल एक शैक्षणिक अनुमान है।"
      ] : [
        "These calculations are indicative estimates based on expected/assumed fitment factors of the 8th Central Pay Commission.",
        "The 14% Government NPS contribution is directly credited to your pension account and is not part of take-home pay.",
        "This report is for educational projection purposes only."
      ]
    });
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen">
      {/* 8th Pay Banner Hub Header */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-700 text-white py-10 px-6 rounded-3xl shadow-lg mb-8 text-center relative overflow-hidden print:hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <BookOpen className="w-48 h-48 scroll-smooth" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <span className="bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-2xs">
            🌟 {language === "hi" ? "विशेष 8वां वेतन आयोग केंद्र" : "8th Pay Commission Special Hub"}
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold mt-3 tracking-tight">
            {language === "hi" ? "8वें वेतन आयोग का पूरा लेखा-जोखा" : "8th Pay Commission Blueprint 2026"}
          </h1>
          <p className="text-xs sm:text-base text-violet-100 mt-2 font-medium">
            {language === "hi" 
              ? "वेतन वृद्धि, न्यूनतम वेतन संशोधन, फिटमेंट फैक्टर और सेवानिवृत्ति पेंशन का विश्वसनीय अनुमान"
              : "Calibrated projections for Basic Pay revisions, expected fitment factor hikes, and pension rules"}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-20">
        <DisclaimerBanner />

        {/* Categories Tab bar */}
        <div className="mb-8 print:hidden">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-450 dark:text-slate-400 mb-3 flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-violet-500" />
            {language === "hi" ? "8वें वेतन के 4 स्वतंत्र कैलकुलेटर" : "4 Dedicated 8th Pay Commission Calculators"}
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            {tabs.map((tab) => {
              const isActive = activeSubPage === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onNavigate(tab.id)}
                  className={`flex items-center gap-2 p-3 sm:p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                    isActive 
                      ? "bg-violet-600 border-violet-600 text-white shadow-md active:scale-95" 
                      : "bg-white dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
                  }`}
                >
                  <div className={`p-1.5 rounded-lg ${isActive ? "bg-violet-700 text-white" : "bg-violet-50 dark:bg-slate-800 text-violet-600"}`}>
                    {tab.icon}
                  </div>
                  <span className="font-extrabold text-[11px] sm:text-xs leading-none">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Tabs bar */}
        <div className="mb-8 print:hidden">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-450 dark:text-slate-400 mb-3 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
            {language === "hi" ? "8वां वेतन आयोग - संपूर्ण गाइड और चार्ट" : "8th Pay Commission Guides & Reference Charts"}
          </h3>
          <div className="flex flex-wrap gap-2">
            {contentTabs.map((ct) => {
              const isActive = activeSubPage === ct.id;
              return (
                <button
                  key={ct.id}
                  onClick={() => onNavigate(ct.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs cursor-pointer transition-all ${
                    isActive
                      ? "bg-indigo-600 border-indigo-600 text-white font-black shadow-3xs"
                      : "bg-white dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350"
                  }`}
                >
                  {ct.icon}
                  <span className="font-bold">{ct.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* VIEW 1: Basic 8th Pay Salary Calculator */}
        {activeSubPage === "calculator" && (
          <div className="space-y-6">
            {/* Header with WhatsApp Share button */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                  <Coins className="w-5 h-5 text-violet-600" />
                  {language === "hi" ? "8वां वेतन आयोग वेतन कैलकुलेटर" : "8th Pay Commission Salary Calculator"}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
                  {language === "hi"
                    ? "नए मूल वेतन, महंगाई भत्ता (DA), मकान किराया भत्ता (HRA) और शुद्ध सकल वेतन वृद्धि की गणना करें।"
                    : "Simulate revised basic pay, revised DA, revised HRA, and final gross salary increase."}
                </p>
              </div>
              <div className="self-start sm:self-center shrink-0 flex flex-wrap gap-2">
                <button
                  onClick={downloadPDFReport}
                  className="bg-violet-600 hover:bg-violet-500 active:scale-95 text-white font-bold text-xs px-4 py-2.5 rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all border-0 cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-white" />
                  <span>{language === "hi" ? "डाउनलोड पीडीएफ" : "Download PDF Report"}</span>
                </button>
                <button
                  onClick={shareToWhatsApp}
                  className="bg-[#25D366] hover:bg-[#20ba5a] active:scale-95 text-white font-bold text-xs px-4 py-2.5 rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all border-0 cursor-pointer"
                >
                  <Share2 className="w-4 h-4 text-white" />
                  <span>{language === "hi" ? "व्हाट्सऐप साझा" : "Share on WhatsApp"}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Calculation controller */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-xl text-white">
                  <Coins className="w-5 h-5" />
                </div>
                <h2 className="text-base sm:text-lg font-black text-slate-800 dark:text-white">
                  {language === "hi" ? "8वां पे-कमीशन मूल वेतन निर्माता" : "8th CPC Basic Estimator"}
                </h2>
              </div>

              {/* Set Basic Pay */}
              <div className="mb-6">
                <div className="flex justify-between items-center text-xs font-bold mb-2">
                  <span className="text-slate-500 uppercase tracking-wide">
                    {language === "hi" ? "वर्तमान 7वां वेतन मूल (Basic Pay)" : "Current 7th CPC Basic Pay"}
                  </span>
                  <div className="flex items-center gap-1 border border-slate-200 rounded-lg px-2 py-0.5 bg-slate-50">
                    <span className="text-slate-400 font-bold text-[10px]">₹</span>
                    <input
                      type="number"
                      value={customBasic}
                      onChange={(e) => {
                        setCustomBasic(e.target.value);
                        const num = parseInt(e.target.value);
                        if (!isNaN(num)) setBasicPay(num);
                      }}
                      className="w-20 text-right bg-transparent border-0 p-0 text-violet-600 font-black text-xs focus:ring-0 focus:outline-none"
                    />
                  </div>
                </div>

                <input
                  type="range"
                  min="18000"
                  max="150000"
                  step="500"
                  value={basicPay}
                  onChange={(e) => {
                    setBasicPay(parseInt(e.target.value));
                    setCustomBasic(e.target.value);
                  }}
                  className="w-full accent-violet-600"
                />
                
                <div className="mt-3 bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-100 dark:border-slate-850">
                  <span className="text-[10px] text-slate-450 dark:text-slate-400 font-bold uppercase tracking-wider block mb-1">
                    {language === "hi" ? "त्वरित चयन (पे-मैट्रिक्स ग्रेड स्तर)" : "Quick Selector (Standard Pay Levels)"}
                  </span>
                  <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto pr-1">
                    {payLevels.map((lvl) => (
                      <button
                        key={lvl.name}
                        onClick={() => {
                          setBasicPay(lvl.basic);
                          setCustomBasic(lvl.basic.toString());
                        }}
                        className={`text-[10px] text-left p-1.5 rounded-lg border font-bold transition-all ${
                          basicPay === lvl.basic
                            ? "bg-violet-50 border-violet-300 text-violet-700"
                            : "bg-white dark:bg-slate-900 border-slate-150 hover:bg-slate-50 text-slate-650"
                        }`}
                      >
                        <div className="truncate">{lvl.name}</div>
                        <div className="text-violet-600 font-extrabold">{formatCurrency(lvl.basic)}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Set Fitment Factor */}
              <div className="mb-6">
                <div className="flex justify-between items-center text-xs font-bold mb-2">
                  <span className="text-slate-500 uppercase tracking-wide">
                    {language === "hi" ? "प्रस्तावित फिटमेंट फैक्टर" : "Assumed Fitment Factor"}
                  </span>
                  <div className="flex items-center gap-1 border border-slate-200 rounded-lg px-2 py-0.5 bg-slate-50">
                    <input
                      type="text"
                      value={customFitment}
                      onChange={(e) => {
                        setCustomFitment(e.target.value);
                        const flut = parseFloat(e.target.value);
                        if (!isNaN(flut)) setFitmentFactor(flut);
                      }}
                      className="w-12 text-right bg-transparent border-0 p-0 text-violet-600 font-black text-xs focus:ring-0 focus:outline-none"
                    />
                    <span className="text-slate-400 font-bold text-[10px]">x</span>
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-1.5 mb-3">
                  {[1.92, 2.57, 2.72, 2.86, 3.00].map((f) => (
                    <button
                      key={f}
                      onClick={() => {
                        setFitmentFactor(f);
                        setCustomFitment(f.toString());
                      }}
                      className={`py-1.5 px-0.5 rounded-xl border text-xs font-black text-center cursor-pointer transition-all ${
                        fitmentFactor === f
                          ? "bg-violet-600 border-violet-600 text-white"
                          : "bg-white dark:bg-slate-900 border-slate-200 hover:bg-slate-50 text-slate-800 dark:text-slate-300"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                <input
                  type="range"
                  min="1.8"
                  max="3.7"
                  step="0.01"
                  value={fitmentFactor}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setFitmentFactor(val);
                    setCustomFitment(e.target.value);
                  }}
                  className="w-full accent-violet-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-1">
                  <span>1.92 (New Option)</span>
                  <span>2.57 (7th Pay)</span>
                  <span>2.86 (Unified Demand)</span>
                  <span>3.68 (Max Demand)</span>
                </div>
              </div>

              {/* Set HRA & DA */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                    {language === "hi" ? "मकान किराया (HRA Class)" : "HRA City Category"}
                  </label>
                  <select
                    value={hraClass}
                    onChange={(e) => setHraClass(e.target.value)}
                    className="w-full text-xs font-bold border border-slate-200 bg-slate-50 rounded-xl p-2.5 focus:ring-1 focus:ring-violet-500"
                  >
                    <option value="X">Class X (Metros - revised 30%)</option>
                    <option value="Y">Class Y (Cities - revised 20%)</option>
                    <option value="Z">Class Z (Rural - revised 10%)</option>
                    <option value="custom">{language === "hi" ? "✍️ मैन्युअल कस्टम %" : "✍️ Custom Manual %"}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                    {language === "hi" ? "अनुमानित शुरुआती DA (%)" : "Initial 8th CPC DA %"}
                  </label>
                  <select
                    value={expectedDa8th}
                    onChange={(e) => setExpectedDa8th(parseInt(e.target.value))}
                    className="w-full text-xs font-bold border border-slate-200 bg-slate-50 rounded-xl p-2.5 focus:ring-1 focus:ring-violet-500"
                  >
                    <option value="0">0% (Standard reset on merge)</option>
                    <option value="3">3% (Initial projected merger)</option>
                    <option value="6">6% (Typical level 1 timeline)</option>
                  </select>
                </div>
              </div>

              {hraClass === "custom" && (
                <div className="mb-4 bg-violet-55 bg-violet-50/50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-violet-100 transition-all">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                    {language === "hi" ? "मैन्युअल HRA लिखें (%)" : "Enter Manual HRA percentage (%)"}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={manualHraPercent}
                      onChange={(e) => setManualHraPercent(e.target.value)}
                      className="w-full text-xs font-bold border border-slate-200 bg-white dark:bg-slate-900 rounded-xl p-2.5 focus:ring-1 focus:ring-violet-500 text-violet-750"
                      placeholder="e.g. 15"
                    />
                    <span className="text-xs font-black text-slate-400">%</span>
                  </div>
                </div>
              )}
            </div>

            {/* Calculations and comparisons right panel */}
            <div className="lg:col-span-7 space-y-6">
              {/* Main Comparison Card */}
              <div className="bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm relative overflow-hidden">
                <span className="absolute top-0 right-0 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 font-extrabold text-[9px] uppercase tracking-widest px-3 py-1 rounded-bl-xl">
                  {language === "hi" ? "आरोही तुलनात्मक वित्तीय विश्लेषण" : "Financial Hike Breakdown"}
                </span>

                <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider mb-4 border-b pb-2">
                  {language === "hi" ? "मासिक वेतन तुलना ब्योरा (अनुमानित)" : "Estimated Monthly Salary Comparison"}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                  {/* old setup 7th */}
                  <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-100">
                    <div className="text-[10px] text-slate-450 uppercase tracking-wide font-black">7th Pay Commission Scale</div>
                    <div className="text-xl font-bold text-slate-700 mt-1">{formatCurrency(basicPay)} <span className="text-xs text-slate-450 font-medium">Basic</span></div>
                    
                    <div className="mt-3.5 space-y-1.5 text-xs text-slate-600 font-medium">
                      <div className="flex justify-between">
                        <span>Dearness Allowance ({currentDaPercent}%):</span>
                        <span className="font-extrabold">{formatCurrency(daOld)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>HRA cities estimate:</span>
                        <span className="font-extrabold">{formatCurrency(hraOld)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Medical/Other allow:</span>
                        <span className="font-extrabold">{formatCurrency(otherAllowances)}</span>
                      </div>
                      <div className="border-t pt-1.5 flex justify-between font-extrabold text-slate-800">
                        <span>Gross Salary:</span>
                        <span>{formatCurrency(grossOld)}</span>
                      </div>
                      <div className="flex justify-between text-rose-600 text-[11px]">
                        <span>NPS contribution (10%):</span>
                        <span>-{formatCurrency(npsOld)}</span>
                      </div>
                      <div className="border-t pt-1.5 flex justify-between font-black text-slate-900">
                        <span>Net In-Hand salary:</span>
                        <span>{formatCurrency(inHandOld)}</span>
                      </div>
                    </div>
                  </div>

                  {/* new setup 8th */}
                  <div className="bg-gradient-to-br from-violet-50/50 to-indigo-50/20 dark:from-violet-950/20 dark:to-slate-900 p-4 rounded-2xl border border-violet-100">
                    <div className="text-[10px] text-violet-600 uppercase tracking-wide font-black">8th Pay Commission Projections</div>
                    <div className="text-xl font-black text-violet-700 dark:text-violet-300 mt-1">
                      {formatCurrency(calculatedRevisedBasic)} <span className="text-xs text-violet-500 font-medium">New Basic</span>
                    </div>

                    <div className="mt-3.5 space-y-1.5 text-xs text-slate-600 font-medium">
                      <div className="flex justify-between text-violet-850">
                        <span>Dearness Allowance ({expectedDa8th}%):</span>
                        <span className="font-extrabold text-violet-700">{formatCurrency(daNew)}</span>
                      </div>
                      <div className="flex justify-between text-violet-850">
                        <span>HRA cities estimate:</span>
                        <span className="font-extrabold text-violet-700">{formatCurrency(hraNew)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Medical/Other allow:</span>
                        <span className="font-bold">{formatCurrency(otherAllowances)}</span>
                      </div>
                      <div className="border-t pt-1.5 flex justify-between font-black text-indigo-700 dark:text-indigo-300">
                        <span>Expected Gross:</span>
                        <span>{formatCurrency(grossNew)}</span>
                      </div>
                      <div className="flex justify-between text-rose-600 text-[11px]">
                        <span>NPS contribution (10%):</span>
                        <span>-{formatCurrency(npsNew)}</span>
                      </div>
                      <div className="border-t pt-1.5 flex justify-between font-black text-indigo-900 dark:text-indigo-100 text-sm">
                        <span>Projected In-Hand:</span>
                        <span>{formatCurrency(inHandNew)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Growth and details */}
                <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-150 rounded-2xl p-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-black tracking-wider text-emerald-700">Estimated Basic Salary Hike</p>
                    <p className="text-xs text-slate-600 font-medium">Based on assumed fitment factor of <span className="font-bold text-slate-800">{fitmentFactor}x</span></p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg sm:text-xl font-black text-emerald-700">
                      +{formatCurrency(calculatedRevisedBasic - basicPay)}
                    </div>
                    <div className="text-xs font-extrabold text-emerald-600">
                      +{(((calculatedRevisedBasic - basicPay) / basicPay) * 100).toFixed(1)}% {language === "hi" ? "मूल वेतन वृद्धि" : "Basic Rise"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Informational Box */}
              <div className="bg-slate-100 dark:bg-slate-850 rounded-2xl p-4 border border-slate-200 text-slate-600 text-xs leading-relaxed font-medium">
                <p className="font-extrabold text-slate-800 mb-1">🔍 Why does Basic Pay round up to 100?</p>
                <p>As per the standard formula implemented in previous 7th CPC revisions, once the fitment factor is applied to current Basic Pay, the final score represents the introductory base cell. It gets matched or rounded upward to the nearest index block cell in the next pay matrix. Calculations above apply nearest ₹100 ceiling rounding for optimal estimations.</p>
              </div>
            </div>
          </div>
        </div>
      )}

        {/* VIEW 2: 8th Pay Commission Fitment Factor Calculator */}
        {activeSubPage === "fitment" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 bg-white dark:bg-slate-850 border border-slate-200 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-indigo-500 rounded-xl text-white">
                  <ArrowLeftRight className="w-5 h-5" />
                </div>
                <h2 className="text-base sm:text-lg font-black text-slate-800 dark:text-white">
                  {language === "hi" ? "फिटमेंट फैक्टर कैलकुलेटर" : "Fitment Factor Estimator"}
                </h2>
              </div>

              <div className="mb-6">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wide mb-2">
                  {language === "hi" ? "वर्तमान बेसिक वेतन दर्ज करें" : "Enter Current Basic Pay (₹)"}
                </label>
                <input
                  type="number"
                  value={basicPay}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setBasicPay(isNaN(val) ? 0 : val);
                  }}
                  className="w-full text-base font-extrabold border border-slate-200 bg-slate-50 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. 35400"
                />
              </div>

              <div className="mb-6">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wide mb-2">
                  {language === "hi" ? "अपेक्षित/लक्षित फिटमेंट फैक्टर" : "Expected Fitment Factor"}
                </label>
                <input
                  type="range"
                  min="1.80"
                  max="3.68"
                  step="0.01"
                  value={fitmentFactor}
                  onChange={(e) => {
                    setFitmentFactor(parseFloat(e.target.value));
                    setCustomFitment(e.target.value);
                  }}
                  className="w-full accent-indigo-600 mb-3"
                />
                
                <div className="space-y-2">
                  {[1.92, 2.57, 2.72, 2.86, 3.00, 3.25, 3.68].map((fac) => (
                    <button
                      key={fac}
                      onClick={() => {
                        setFitmentFactor(fac);
                        setCustomFitment(fac.toString());
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl border text-left cursor-pointer transition-all ${
                        fitmentFactor === fac
                        ? "bg-indigo-600 border-indigo-600 text-white font-extrabold"
                        : "bg-white dark:bg-slate-900 border-slate-150 hover:bg-slate-50 text-slate-800 dark:text-slate-350"
                      }`}
                    >
                      <span className="font-bold">
                        {fac === 1.92 ? "1.92 (Accurate Custom fitment factor)" :
                         fac === 2.57 ? "2.57 (Standard 7th CPC default)" :
                         fac === 2.86 ? "2.86 (Unified JCM demand)" :
                         fac === 3.00 ? "3.00 (Proposed round-off factor)" :
                         fac === 3.68 ? "3.68 (Aggressive employee union demand)" :
                         `${fac}x (Custom Assumed Ratio)`}
                      </span>
                      <span>{fac}x</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white dark:bg-slate-850 border border-slate-200 rounded-3xl p-6 shadow-sm">
                <h3 className="text-base font-black text-slate-800 dark:text-white uppercase tracking-wider mb-4 border-b pb-2">
                  {language === "hi" ? "फिटमेंट परिणाम व मैट्रिक्स प्रभाव" : "Fitment Factor Results & Matrix Impact"}
                </h3>

                <div className="mb-6 text-center py-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-xs text-slate-450 dark:text-slate-400 font-bold uppercase tracking-wider">Estimated Revised Basic Pay</p>
                  <div className="text-3xl sm:text-4xl font-black text-indigo-600 dark:text-indigo-400 mt-2">
                    {formatCurrency(calculatedRevisedBasic)}
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium mt-1">
                    (Rounded to nearest ₹100 automatically from accurate product value {formatCurrency(basicPay * fitmentFactor)})
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest block">
                    {language === "hi" ? "विभिन्न फिटमेंट फैक्टर्स की तुलना" : "Comparison of Revisions Under Multiple Factors"}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {[1.92, 2.57, 2.72, 2.86, 3.00, 3.25, 3.68].map((f) => {
                      const estimated = getRevisedBasic(basicPay, f);
                      const increaseAmount = estimated - basicPay;
                      const isCurrentActive = fitmentFactor === f;

                      return (
                        <div 
                          key={f} 
                          className={`p-3.5 rounded-2xl border transition-all ${
                            isCurrentActive 
                              ? "bg-slate-900 border-slate-900 text-white dark:bg-slate-800 dark:border-slate-700" 
                              : "bg-slate-50 dark:bg-slate-900 border-slate-100 text-slate-800 dark:text-slate-200"
                          }`}
                        >
                          <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-wide">
                            <span className={isCurrentActive ? "text-indigo-400" : "text-slate-550"}>Factor: {f}x</span>
                            {isCurrentActive && <span className="bg-indigo-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full">ACTIVE Selection</span>}
                          </div>
                          
                          <div className="flex justify-between items-end mt-2">
                            <div>
                              <div className="text-xs font-bold text-slate-450">Revised Basic:</div>
                              <div className="text-base font-black">{formatCurrency(estimated)}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-[10px] text-emerald-555 font-extrabold text-emerald-600">+{formatCurrency(increaseAmount)}</div>
                              <div className="text-[10px] font-bold text-slate-450 mt-0.5">+{((increaseAmount/basicPay)*100).toFixed(0)}% hike</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: 8th Pay Commission Salary Hike Calculator */}
        {activeSubPage === "hike" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 bg-white dark:bg-slate-850 border border-slate-200 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-emerald-500 rounded-xl text-white">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h2 className="text-base sm:text-lg font-black text-slate-800 dark:text-white">
                  {language === "hi" ? "वेतन वृद्धि सिम्युलेटर" : "Expected Salary Hike Planner"}
                </h2>
              </div>

              {/* Input for monthly Salary params */}
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wide mb-2">
                    7th CPC Basic Pay (₹)
                  </label>
                  <input
                    type="number"
                    value={basicPay}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setBasicPay(isNaN(val) ? 0 : val);
                    }}
                    className="w-full text-sm font-bold border border-slate-200 bg-slate-50 rounded-xl p-2.5 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wide mb-2">
                    Current Dearness Allowance (DA) %
                  </label>
                  <input
                    type="range"
                    min="38"
                    max="60"
                    step="1"
                    value={currentDaPercent}
                    onChange={(e) => setCurrentDaPercent(parseInt(e.target.value))}
                    className="w-full accent-emerald-600 mb-1"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                    <span>38% (2023)</span>
                    <span className="text-emerald-600 font-black">Current: {currentDaPercent}%</span>
                    <span>60% (Future merger limit)</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wide mb-1.5">
                      Expected Fitment Factor
                    </label>
                    <select
                      value={fitmentFactor}
                      onChange={(e) => setFitmentFactor(parseFloat(e.target.value))}
                      className="w-full text-xs font-bold border border-slate-200 bg-slate-50 rounded-xl p-2 focus:ring-1"
                    >
                      <option value="1.92">1.92x (Custom Option)</option>
                      <option value="2.57">2.57x (Base Ratio)</option>
                      <option value="2.72">2.72x (Mid Ratio)</option>
                      <option value="2.86">2.86x (Preferred)</option>
                      <option value="3.00">3.00x (High Goal)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wide mb-1.5">
                      Other Allowances (₹/mo)
                    </label>
                    <input
                      type="number"
                      value={otherAllowances}
                      onChange={(e) => setOtherAllowances(parseInt(e.target.value) || 0)}
                      className="w-full text-xs font-bold border border-slate-200 bg-slate-50 rounded-xl p-2"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white dark:bg-slate-850 border border-slate-200 rounded-3xl p-6 shadow-sm">
                <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider mb-4 border-b pb-2">
                  {language === "hi" ? "सकल और शुद्ध इन-हैंड वृद्धि चार्ट" : "Gross & Net In-Hand Hike Analysis"}
                </h3>

                <div className="space-y-4">
                  {/* Gross Salary comparison */}
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1.5 text-slate-700">
                      <span>Monthly Gross Estimations:</span>
                      <span>7th CPC ({formatCurrency(grossOld)}) vs Projected 8th CPC ({formatCurrency(grossNew)})</span>
                    </div>
                    <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                      <div 
                        className="bg-slate-400 text-white text-[9px] font-black flex items-center justify-center transition-all" 
                        style={{ width: `${Math.round((grossOld / (grossOld + grossNew)) * 100)}%` }}
                      >
                        {Math.round((grossOld / (grossOld + grossNew)) * 100)}%
                      </div>
                      <div 
                        className="bg-emerald-500 text-white text-[9px] font-black flex items-center justify-center transition-all" 
                        style={{ width: `${Math.round((grossNew / (grossOld + grossNew)) * 100)}%` }}
                      >
                        {Math.round((grossNew / (grossOld + grossNew)) * 100)}%
                      </div>
                    </div>
                  </div>

                  {/* Net Hand comparison */}
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1.5 text-slate-700">
                      <span>Monthly Net In-Hand Estimations:</span>
                      <span>7th CPC ({formatCurrency(inHandOld)}) vs Projected 8th CPC ({formatCurrency(inHandNew)})</span>
                    </div>
                    <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                      <div 
                        className="bg-slate-500 text-white text-[9px] font-black flex items-center justify-center transition-all" 
                        style={{ width: `${Math.round((inHandOld / (inHandOld + inHandNew)) * 100)}%` }}
                      >
                        Before: {formatCurrency(inHandOld)}
                      </div>
                      <div 
                        className="bg-violet-600 text-white text-[9px] font-black flex items-center justify-center transition-all" 
                        style={{ width: `${Math.round((inHandNew / (inHandOld + inHandNew)) * 100)}%` }}
                      >
                        After: {formatCurrency(inHandNew)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Summary block */}
                <div className="mt-8 grid grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 border rounded-2xl text-center">
                    <p className="text-[9px] text-slate-450 uppercase font-black">Gross Change</p>
                    <p className="text-sm font-black text-slate-800 mt-1">+{formatCurrency(grossNew - grossOld)}</p>
                    <span className="text-[9px] text-emerald-600 font-extrabold">+{(((grossNew - grossOld)/grossOld)*100).toFixed(1)}% Hike</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 border rounded-2xl text-center">
                    <p className="text-[9px] text-slate-450 uppercase font-black">In-Hand Change</p>
                    <p className="text-sm font-black text-slate-800 mt-1">+{formatCurrency(inHandNew - inHandOld)}</p>
                    <span className="text-[9px] text-emerald-600 font-extrabold">+{(((inHandNew - inHandOld)/inHandOld)*100).toFixed(1)}% Hike</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 border rounded-2xl text-center">
                    <p className="text-[9px] text-slate-450 uppercase font-black">NPS Growth</p>
                    <p className="text-sm font-black text-slate-800 mt-1">+{formatCurrency(npsNew - npsOld)}</p>
                    <span className="text-[9px] text-violet-600 font-extrabold">Added Pension</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 4: 8th Pay Commission Pension Calculator */}
        {activeSubPage === "pension" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 bg-white dark:bg-slate-850 border border-slate-200 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-purple-500 rounded-xl text-white">
                  <Coins className="w-5 h-5" />
                </div>
                <h2 className="text-base sm:text-lg font-black text-slate-800 dark:text-white">
                  {language === "hi" ? "8वां पेंशन अनुमानक" : "8th Pay Pension Calculator"}
                </h2>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wide mb-2">
                    {language === "hi" ? "सेवानिवृत्ति के समय अंतिम मूल वेतन (7 CPC Basic)" : "Last Drawn Basic Pay on Retirement (₹)"}
                  </label>
                  <input
                    type="number"
                    value={retiringBasic}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setRetiringBasic(isNaN(val) ? 0 : val);
                    }}
                    className="w-full text-base font-extrabold border border-slate-200 bg-slate-50 rounded-xl p-3 focus:ring-1 focus:ring-purple-500"
                    placeholder="e.g. 67700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wide mb-2">
                    Assumed Fitment Factor (For Pensions)
                  </label>
                  <select
                    value={fitmentFactor}
                    onChange={(e) => setFitmentFactor(parseFloat(e.target.value))}
                    className="w-full text-xs font-bold border border-slate-200 bg-slate-50 rounded-xl p-2.5 focus:ring-1"
                  >
                    <option value="1.92">1.92x (Custom Option)</option>
                    <option value="2.57">2.57x (Default Factor)</option>
                    <option value="2.86">2.86x (Sought-After)</option>
                    <option value="3.00">3.00x (Optimal Scheme)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white dark:bg-slate-850 border border-slate-200 rounded-3xl p-6 shadow-sm">
                <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider mb-4 border-b pb-2">
                  {language === "hi" ? "पेंशन संशोधन तुलना विश्लेषण" : "Superannuation & Revised Pension Projections"}
                </h3>

                {/* 50% basic rule */}
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 rounded-2xl">
                    <div className="text-[10px] text-slate-450 uppercase font-black tracking-wide">Revised 8th CPC Basic pay</div>
                    <div className="text-xl font-bold text-slate-800 mt-1">{formatCurrency(getRevisedBasic(retiringBasic, fitmentFactor))} <span className="text-xs text-slate-450 font-medium">(Merged/Approved Base)</span></div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 rounded-2xl">
                      <div className="text-[10px] text-purple-700 uppercase font-black tracking-wide">Monthly Basic Pension (50%)</div>
                      <div className="text-lg font-black text-purple-900 dark:text-purple-300 mt-1">
                        {formatCurrency(getRevisedBasic(retiringBasic, fitmentFactor) * 0.50)}
                      </div>
                      <p className="text-[9px] text-slate-500 font-medium mt-1">Est. 7th CPC pension was {formatCurrency(retiringBasic * 0.50)}</p>
                    </div>

                    <div className="p-4 bg-violet-50/50 dark:bg-violet-950/20 border border-violet-100 rounded-2xl">
                      <div className="text-[10px] text-violet-700 uppercase font-black tracking-wide">Family Pension (30%)</div>
                      <div className="text-lg font-black text-violet-900 dark:text-violet-300 mt-1">
                        {formatCurrency(getRevisedBasic(retiringBasic, fitmentFactor) * 0.30)}
                      </div>
                      <p className="text-[9px] text-slate-500 font-medium mt-1">Est. 7th CPC pension was {formatCurrency(retiringBasic * 0.30)}</p>
                    </div>
                  </div>

                  <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-150 p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-[9px] text-emerald-700 uppercase font-black tracking-wider">Increase in Monthly Retirement pay</p>
                      <p className="text-[11px] text-slate-650 font-medium">Estimated salary based on assumed fitment factor</p>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-black text-emerald-700">
                        +{formatCurrency((getRevisedBasic(retiringBasic, fitmentFactor) * 0.50) - (retiringBasic * 0.50))}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 5: Content - Latest News */}
        {activeSubPage === "latest-news" && (
          <div className="bg-white dark:bg-slate-850 border border-slate-200 rounded-3xl p-6 shadow-sm max-w-4xl mx-auto">
            <div className="flex items-center gap-2.5 mb-4 pb-2 border-b">
              <Newspaper className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-black text-slate-800 dark:text-white">
                {language === "hi" ? "8वें वेतन आयोग से जुड़े नवीनतम समाचार व अपडेट्स" : "8th Pay Commission Latest News & Projections"}
              </h2>
            </div>
            
            <div className="space-y-6 text-xs sm:text-sm leading-relaxed text-slate-650 dark:text-slate-300 font-medium">
              <div className="bg-indigo-50/50 dark:bg-indigo-950/10 p-4 rounded-2xl border border-indigo-100">
                <p className="font-extrabold text-indigo-950 dark:text-indigo-200 mb-1">📅 Latest Status as of June 2026:</p>
                <p>Employee federations and Joint Consultative Machinery (JCM) representing millions of central government staff and railway unions have formally submitted detailed memoranda to the Union Cabinet Secretary demanding the immediate formulation of the 8th Pay Commission panel committees.</p>
              </div>

              <div className="space-y-4">
                <h4 className="font-black text-slate-800 dark:text-white text-sm sm:text-base">1. Expectations on Fitment Factor:</h4>
                <p>While the 7th Pay Commission recommended an initial fitment factor of 2.57, employee federations are demanding a fitment factor of 2.86 or 3.00, which will increase the entry-level salary of central government employees significantly. For instance, the minimum pay would jump from ₹18,000 to approximately ₹51,480 at a 2.86x factor, or ₹54,000 at a 3.00x factor.</p>

                <h4 className="font-black text-slate-800 dark:text-white text-sm sm:text-base">2. Union Budget Announcements:</h4>
                <p>The Ministry of Finance has received administrative requests outlining the timeline for establishing the Pay Commission. Historically, Pay Commissions take about 18 to 24 months to submit their detailed study reports. Therefore, establishing the commission early remains a critical demand for timely implementation.</p>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 6: Content - Fitment Factor */}
        {activeSubPage === "fitment-factor" && (
          <div className="bg-white dark:bg-slate-850 border border-slate-200 rounded-3xl p-6 shadow-sm max-w-4xl mx-auto">
            <div className="flex items-center gap-2.5 mb-4 pb-2 border-b">
              <Info className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-black text-slate-800 dark:text-white">
                {language === "hi" ? "फिटमेंट फैक्टर क्या है और इसकी गणना कैसे की जाती है?" : "8th Pay Commission Fitment Factor Explained"}
              </h2>
            </div>

            <div className="space-y-6 text-xs sm:text-sm leading-relaxed text-slate-650 dark:text-slate-300 font-medium">
              <div>
                <h4 className="font-black text-slate-800 dark:text-white mb-2">What is the Fitment Factor?</h4>
                <p>The Fitment Factor is a crucial multiplier applied to an employee's existing 7th CPC Basic Pay to determine their new revised entry Basic Pay under the 8th Pay Commission framework. It helps bridge the gap created by cumulative inflation and living cost increments since the last commission's enforcement in 2016.</p>
              </div>

              <div className="bg-slate-100 p-4 rounded-xl border">
                <p className="font-extrabold text-slate-800 mb-1">Standard Formula:</p>
                <code className="text-xs font-mono font-bold block text-indigo-700 bg-slate-50 p-2 rounded">
                  Revised 8th CPC Basic Pay = (Current 7th CPC Basic Pay) × (Expected Fitment Factor)
                </code>
                <span className="text-[10px] text-slate-500 font-bold block mt-1.5">* This revised Basic is further matched and rounded to the closest cell or next higher pay tier index cell.</span>
              </div>

              <div>
                <h4 className="font-black text-slate-800 dark:text-white mb-2">Historical Fitment Factors:</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="p-2.5 font-extrabold">Pay Commission</th>
                        <th className="p-2.5 font-extrabold">Implementation Year</th>
                        <th className="p-2.5 font-extrabold">Fitment Factor</th>
                        <th className="p-2.5 font-extrabold">Minimum Basic Pay</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      <tr>
                        <td className="p-2.5">5th CPC</td>
                        <td className="p-2.5">1996</td>
                        <td className="p-2.5">1.40x</td>
                        <td className="p-2.5">₹2,550</td>
                      </tr>
                      <tr>
                        <td className="p-2.5">6th CPC</td>
                        <td className="p-2.5">2006</td>
                        <td className="p-2.5">1.86x (plus GP)</td>
                        <td className="p-2.5">₹7,000</td>
                      </tr>
                      <tr>
                        <td className="p-2.5">7th CPC</td>
                        <td className="p-2.5">2016</td>
                        <td className="p-2.5">2.57x</td>
                        <td className="p-2.5">₹18,000</td>
                      </tr>
                      <tr className="bg-indigo-50/20 text-indigo-700 font-bold">
                        <td className="p-2.5">8th CPC (Assumed)</td>
                        <td className="p-2.5">2026 (Projected)</td>
                        <td className="p-2.5">2.86x to 3.00x</td>
                        <td className="p-2.5">₹51,480 to ₹54,000</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 7: Content - Salary Chart */}
        {activeSubPage === "salary-chart" && (
          <div className="bg-white dark:bg-slate-850 border border-slate-200 rounded-3xl p-6 shadow-sm max-w-4xl mx-auto">
            <div className="flex items-center gap-2.5 mb-4 pb-2 border-b">
              <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-black text-slate-800 dark:text-white">
                {language === "hi" ? "संभावित 8वें वेतन आयोग पे-मैट्रिक्स और मूल वेतन चार्ट" : "Estimated 8th CPC Pay Matrix & Salary Scale"}
              </h2>
            </div>
            
            <p className="text-xs text-slate-550 mb-4 italic font-medium">
              * The table below shows projected Basic Pay increments using a standard assumed fitment factor of <span className="font-extrabold text-indigo-600">2.86x</span>, rounded to the nearest ₹100 cell. Actual official implementation matrix may differ.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-2.5 font-extrabold text-slate-800">Grade Matrix Scale</th>
                    <th className="p-2.5 font-extrabold text-slate-800">7th CPC Entry Basic</th>
                    <th className="p-2.5 font-extrabold text-slate-700">Projected 8th CPC Basic (2.86x)</th>
                    <th className="p-2.5 font-extrabold text-slate-700">Estimated Basic Jump</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {payLevels.map((lvl) => {
                    const estRevised = getRevisedBasic(lvl.basic, 2.86);
                    return (
                      <tr key={lvl.name} className="hover:bg-slate-50">
                        <td className="p-2.5 font-bold text-slate-800">{lvl.name}<span className="block text-[9px] text-slate-450 font-medium">{lvl.desc}</span></td>
                        <td className="p-2.5">{formatCurrency(lvl.basic)}</td>
                        <td className="p-2.5 font-black text-indigo-600">{formatCurrency(estRevised)}</td>
                        <td className="p-2.5 text-emerald-600 font-bold">+{formatCurrency(estRevised - lvl.basic)} (+186%)</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW 8: Content - Implementation Date */}
        {activeSubPage === "date" && (
          <div className="bg-white dark:bg-slate-850 border border-slate-200 rounded-3xl p-6 shadow-sm max-w-4xl mx-auto">
            <div className="flex items-center gap-2.5 mb-4 pb-2 border-b">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-black text-slate-800 dark:text-white">
                {language === "hi" ? "8वें वेतन आयोग के लागू होने की संभावित तारीख" : "8th Pay Commission Expected Implementation Dates"}
              </h2>
            </div>

            <div className="space-y-6 text-xs sm:text-sm leading-relaxed text-slate-650 dark:text-slate-300 font-medium">
              <p>Historically, a new Central Pay Commission is constituted every 10 years to review government employees' basic scale salaries. Since the 7th Pay Commission recommendations were enforced starting January 1, 2016, the 8th Pay Commission recommendations are expected to be due for implementation starting <span className="font-black text-indigo-600">January 1, 2026</span>.</p>

              <div>
                <h4 className="font-black text-slate-800 dark:text-white mb-2">Estimated Timeline Breakdown:</h4>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Panel Setup Request:</strong> Submitted by Joint consultative frameworks to Union Cabinet Secretary.</li>
                  <li><strong>Official Commission formation:</strong> Likely to take place during forthcoming parliament sessions.</li>
                  <li><strong>Committee Study duration:</strong> Usually spans 12-18 months.</li>
                  <li><strong>Pay Scale Retrospective benefits:</strong> Once implemented, benefits are typically made effective retrospectively from January 1, 2026, meaning employees will get key arrears back-payments.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 9: Content - Teachers */}
        {activeSubPage === "for-teachers" && (
          <div className="bg-white dark:bg-slate-850 border border-slate-200 rounded-3xl p-6 shadow-sm max-w-4xl mx-auto">
            <div className="flex items-center gap-2.5 mb-4 pb-2 border-b">
              <Users className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-black text-slate-800 dark:text-white">
                {language === "hi" ? "बिहार BPSC शिक्षकों के लिए 8वें वेतन आयोग के लाभ" : "How 8th CPC Benefits Bihar BPSC State Teachers"}
              </h2>
            </div>

            <div className="space-y-6 text-xs sm:text-sm leading-relaxed text-slate-650 dark:text-slate-300 font-medium font-medium">
              <p>Bihar public teachers recruited under BPSC teacher cadres operate under formal state government pay structures derived from central 7th pay commission matrix templates. Consequently, once standard pay revisions are finalized in the union budget, matching state employee benefits will apply to school teachers as well.</p>

              <div className="bg-emerald-50 dark:bg-emerald-500/10 p-4 rounded-xl border border-emerald-150">
                <p className="font-extrabold text-emerald-950 mb-1.5">Expected Salary Growth for Teachers (Fitment Assumed 2.86x):</p>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between border-b pb-1">
                    <span><strong>Primary Teacher (Class 1-5):</strong> 7th Basic is ₹25,000</span>
                    <span className="font-bold text-emerald-800">New Est. Basic: ₹71,500</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span><strong>Middle Teacher (Class 6-8):</strong> 7th Basic is ₹28,000</span>
                    <span className="font-bold text-emerald-800">New Est. Basic: ₹80,100</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span><strong>Secondary Teacher (Class 9-10):</strong> 7th Basic is ₹31,000</span>
                    <span className="font-bold text-emerald-800">New Est. Basic: ₹88,700</span>
                  </div>
                  <div className="flex justify-between">
                    <span><strong>Senior Secondary (Class 11-12):</strong> 7th Basic is ₹32,000</span>
                    <span className="font-bold text-emerald-800">New Est. Basic: ₹91,600</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
