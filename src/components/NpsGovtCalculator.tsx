import React, { useState, useMemo, useEffect } from "react";
import { 
  Sparkles, 
  Share2, 
  HelpCircle, 
  Info, 
  Calculator, 
  Percent, 
  ShieldCheck, 
  Landmark, 
  TrendingUp, 
  Calendar,
  Layers,
  ArrowRight,
  FileDown,
  Bookmark
} from "lucide-react";
import { getShareableLink } from "../types";
import { generatePDFReport } from "../utils/pdfGenerator";
import { paisaFetch } from "../api";

interface NpsGovtCalculatorProps {
  language?: "en" | "hi";
}

export default function NpsGovtCalculator({ language: propLanguage }: NpsGovtCalculatorProps = {}) {
  const [activeTab, setActiveTab] = useState<"bpsc" | "custom">("custom");
  const [language, setLanguage] = useState<"en" | "hi">(() => {
    return propLanguage || (localStorage.getItem("paisa_lang_selection") as "en" | "hi") || "hi";
  });

  // Save / Load states
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

  // Synchronize internal language with prop updates
  useEffect(() => {
    if (propLanguage) {
      setLanguage(propLanguage);
    }
  }, [propLanguage]);

  // State for TAB A: BPSC Teacher Salary-based matching
  const [basicPayDa, setBasicPayDa] = useState<number>(45000); // Combined Basic + DA
  const [employeeRate, setEmployeeRate] = useState<number>(10); // Standard 10%
  const [employerRate, setEmployerRate] = useState<number>(14); // Standard 14%
  const [yearsToRetire, setYearsToRetire] = useState<number>(25); // Tenure
  const [expectedReturn, setExpectedReturn] = useState<number | "">(9.5); // Expected compound return
  const [annuityPurchasePercent, setAnnuityPurchasePercent] = useState<number>(40); 
  const [expectedAnnuityRate, setExpectedAnnuityRate] = useState<number>(6); 

  // State for TAB B: Custom Pension & NPS Planner (From PDF screenshot)
  const [customDob, setCustomDob] = useState<string>("1996-06-11");
  const [customExistingCorpus, setCustomExistingCorpus] = useState<number>(0);
  const [customMonthlyContribution, setCustomMonthlyContribution] = useState<number>(5000);
  const [customRetirementAge, setCustomRetirementAge] = useState<number>(60);
  const [customDeferAge, setCustomDeferAge] = useState<number>(60);
  const [customContributionIncrease, setCustomContributionIncrease] = useState<number>(5);
  const [customExpectedReturn, setCustomExpectedReturn] = useState<number | "">(10);
  const [customAnnuityPurchasePercent, setCustomAnnuityPurchasePercent] = useState<number>(40);
  const [customExpectedAnnuityRate, setCustomExpectedAnnuityRate] = useState<number>(6.75);

  // Load calculation listener
  useEffect(() => {
    const loadFromCalc = (calc: any) => {
      if (!calc || !calc.data) return;
      const data = calc.data;
      if (data.activeTab) setActiveTab(data.activeTab);
      
      // TAB A: BPSC
      if (data.basicPayDa) setBasicPayDa(data.basicPayDa);
      if (data.employeeRate !== undefined) setEmployeeRate(data.employeeRate);
      if (data.employerRate !== undefined) setEmployerRate(data.employerRate);
      if (data.yearsToRetire !== undefined) setYearsToRetire(data.yearsToRetire);
      if (data.expectedReturn !== undefined) setExpectedReturn(data.expectedReturn);
      if (data.annuityPurchasePercent !== undefined) setAnnuityPurchasePercent(data.annuityPurchasePercent);
      if (data.expectedAnnuityRate !== undefined) setExpectedAnnuityRate(data.expectedAnnuityRate);

      // TAB B: Custom
      if (data.customDob) setCustomDob(data.customDob);
      if (data.customExistingCorpus !== undefined) setCustomExistingCorpus(data.customExistingCorpus);
      if (data.customMonthlyContribution !== undefined) setCustomMonthlyContribution(data.customMonthlyContribution);
      if (data.customRetirementAge !== undefined) setCustomRetirementAge(data.customRetirementAge);
      if (data.customDeferAge !== undefined) setCustomDeferAge(data.customDeferAge);
      if (data.customContributionIncrease !== undefined) setCustomContributionIncrease(data.customContributionIncrease);
      if (data.customExpectedReturn !== undefined) setCustomExpectedReturn(data.customExpectedReturn);
      if (data.customAnnuityPurchasePercent !== undefined) setCustomAnnuityPurchasePercent(data.customAnnuityPurchasePercent);
      if (data.customExpectedAnnuityRate !== undefined) setCustomExpectedAnnuityRate(data.customExpectedAnnuityRate);
    };

    // Check localStorage on mount
    const loadedStr = localStorage.getItem("paisa_loaded_calculation");
    if (loadedStr) {
      try {
        const calc = JSON.parse(loadedStr);
        if (calc && (calc.type?.toLowerCase() === "nps" || calc.type?.toLowerCase() === "nps_govt")) {
          loadFromCalc(calc);
          localStorage.removeItem("paisa_loaded_calculation");
        }
      } catch (err) {
        console.error("Error loading saved NPS calculation:", err);
      }
    }

    const handleLoad = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && (customEvent.detail.type === "nps" || customEvent.detail.type === "nps_govt")) {
        loadFromCalc(customEvent.detail);
      }
    };
    window.addEventListener("paisa-load-calculation", handleLoad);
    return () => window.removeEventListener("paisa-load-calculation", handleLoad);
  }, []);

  // Save calculation handler
  const saveToLocker = async () => {
    setIsSaving(true);
    setSaveStatus("idle");
    
    const activeData = activeTab === "bpsc" ? {
      activeTab: "bpsc",
      basicPayDa,
      employeeRate,
      employerRate,
      yearsToRetire,
      expectedReturn,
      annuityPurchasePercent,
      expectedAnnuityRate,
      monthlyContribution: bpscCalculations.monthlyContribution,
      totalCorpus: bpscCalculations.totalAccumulatedCorpus,
      lumpSum: bpscCalculations.lumpsumWithdrawalCorpus,
      annuityCorpus: bpscCalculations.annuityCorpus,
      monthlyPension: bpscCalculations.monthlyPensionAmount
    } : {
      activeTab: "custom",
      customDob,
      customExistingCorpus,
      customMonthlyContribution,
      customRetirementAge,
      customDeferAge,
      customContributionIncrease,
      customExpectedReturn,
      customAnnuityPurchasePercent,
      customExpectedAnnuityRate,
      monthlyContribution: customMonthlyContribution,
      totalCorpus: customCalculations.totalAccumulatedCorpus,
      lumpSum: customCalculations.lumpsumWithdrawalCorpus,
      annuityCorpus: customCalculations.annuityCorpus,
      monthlyPension: customCalculations.monthlyPensionAmount
    };

    try {
      const res = await paisaFetch("/api/locker/save", {
        method: "POST",
        body: JSON.stringify({
          title: activeTab === "bpsc" 
            ? `NPS BPSC Teacher Plan (Basic+DA: ₹${basicPayDa.toLocaleString()})`
            : `NPS Govt Pension Plan (₹${customMonthlyContribution.toLocaleString()}/mo)`,
          type: "nps",
          data: activeData
        })
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setSaveStatus("success");
        window.dispatchEvent(new Event("paisa-locker-saved"));
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
        setSaveStatus("error");
        setTimeout(() => setSaveStatus("idle"), 3000);
        alert(data?.message || "Failed to save calculation. Please make sure you are logged in.");
      }
    } catch (err) {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
      alert("Please log in to save this plan to your financial locker.");
    } finally {
      setIsSaving(false);
    }
  };

  // Date of Birth -> Age Helper
  const calculateAge = (dobString: string): number => {
    if (!dobString) return 30;
    const birthDate = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return isNaN(age) ? 30 : Math.max(0, age);
  };

  // Tab A - BPSC Calculations
  const bpscCalculations = useMemo(() => {
    const monthlyContribution = Math.round((basicPayDa * (employeeRate + employerRate)) / 100);
    const employeeShare = Math.round((basicPayDa * employeeRate) / 100);
    const employerShare = Math.round((basicPayDa * employerRate) / 100);

    const n = yearsToRetire * 12;
    const activeReturn = expectedReturn === "" ? 0 : expectedReturn;
    const r = (activeReturn / 100) / 12;
    
    const totalAccumulatedCorpus = Math.round(
      r > 0 
        ? monthlyContribution * ((Math.pow(1 + r, n) - 1) / r) * (1 + r)
        : monthlyContribution * n
    );
    const totalInvestedAmount = monthlyContribution * n;

    const annuityCorpus = Math.round((totalAccumulatedCorpus * annuityPurchasePercent) / 100);
    const lumpsumWithdrawalCorpus = Math.round(totalAccumulatedCorpus - annuityCorpus);

    const annualAnnuityIncome = (annuityCorpus * expectedAnnuityRate) / 100;
    const monthlyPensionAmount = Math.round(annualAnnuityIncome / 12);

    const principalPct = totalAccumulatedCorpus > 0 
      ? parseFloat(((totalInvestedAmount / totalAccumulatedCorpus) * 100).toFixed(1))
      : 30;
    const gainsPct = parseFloat((100 - principalPct).toFixed(1));

    return {
      monthlyContribution,
      employeeShare,
      employerShare,
      totalAccumulatedCorpus,
      totalInvestedAmount,
      annuityCorpus,
      lumpsumWithdrawalCorpus,
      monthlyPensionAmount,
      principalPct,
      gainsPct
    };
  }, [basicPayDa, employeeRate, employerRate, yearsToRetire, expectedReturn, annuityPurchasePercent, expectedAnnuityRate]);

  // Tab B - PDF Custom Calculations
  const customCalculations = useMemo(() => {
    const currentAge = calculateAge(customDob);
    const yearsToInvest = Math.max(0, customRetirementAge - currentAge);
    const deferYears = Math.max(0, customDeferAge - customRetirementAge);
    const totalYears = yearsToInvest + deferYears;

    let balance = customExistingCorpus;
    let totalInvested = customExistingCorpus;
    let currentMonthly = customMonthlyContribution;
    const activeCustomReturn = customExpectedReturn === "" ? 0 : customExpectedReturn;
    const r = (activeCustomReturn / 100) / 12;

    // Monthly-based step-up compounding loop
    for (let year = 1; year <= yearsToInvest; year++) {
      if (year > 1) {
        currentMonthly = currentMonthly * (1 + customContributionIncrease / 100);
      }
      for (let month = 1; month <= 12; month++) {
        totalInvested += currentMonthly;
        balance = (balance + currentMonthly) * (1 + r);
      }
    }

    // Deferment phase (balance compounds further without additional deposits)
    for (let year = 1; year <= deferYears; year++) {
      for (let month = 1; month <= 12; month++) {
        balance = balance * (1 + r);
      }
    }

    const totalAccumulatedCorpus = Math.round(balance);
    const totalAmountInvested = Math.round(totalInvested);
    const gainsEarned = Math.round(Math.max(0, totalAccumulatedCorpus - totalAmountInvested));

    const annuityCorpus = Math.round((totalAccumulatedCorpus * customAnnuityPurchasePercent) / 100);
    const lumpsumWithdrawalCorpus = Math.round(totalAccumulatedCorpus - annuityCorpus);

    const annualAnnuityIncome = (annuityCorpus * customExpectedAnnuityRate) / 100;
    const monthlyPensionAmount = Math.round(annualAnnuityIncome / 12);

    const principalPct = totalAccumulatedCorpus > 0 
      ? parseFloat(((totalAmountInvested / totalAccumulatedCorpus) * 100).toFixed(1))
      : 22.4;
    const gainsPct = parseFloat((100 - principalPct).toFixed(1));

    return {
      currentAge,
      yearsToInvest,
      deferYears,
      totalAccumulatedCorpus,
      totalAmountInvested,
      gainsEarned,
      annuityCorpus,
      lumpsumWithdrawalCorpus,
      monthlyPensionAmount,
      principalPct,
      gainsPct
    };
  }, [
    customDob,
    customExistingCorpus,
    customMonthlyContribution,
    customRetirementAge,
    customDeferAge,
    customContributionIncrease,
    customExpectedReturn,
    customAnnuityPurchasePercent,
    customExpectedAnnuityRate
  ]);

  const shareToWhatsApp = () => {
    const currentUrl = getShareableLink("nps_govt", "/nps-calculator-for-government-employees");
    let text = "";

    if (activeTab === "bpsc") {
      text = `👵 *BPSC Teacher Salary-based NPS Projections*
Basic + DA: ₹${basicPayDa.toLocaleString("en-IN")}/mo
Monthly matching (10% + 14%): ₹${bpscCalculations.monthlyContribution.toLocaleString("en-IN")}/mo
Retirement Corpus: ₹${bpscCalculations.totalAccumulatedCorpus.toLocaleString("en-IN")}
Tax-free cash: ₹${bpscCalculations.lumpsumWithdrawalCorpus.toLocaleString("en-IN")}
*Lifetime Pension estimate: ₹${bpscCalculations.monthlyPensionAmount.toLocaleString("en-IN")}/month*

Map your teacher NPS retirement plan: ${currentUrl}`;
    } else {
      text = `👵 *National Pension System (NPS) Custom Pension Projections*
Age: ${customCalculations.currentAge} Years (DOB: ${customDob})
Monthly Contribution: ₹${customMonthlyContribution.toLocaleString("en-IN")} (Step-up: ${customContributionIncrease}%)
Retirement Corpus: ₹${customCalculations.totalAccumulatedCorpus.toLocaleString("en-IN")}
*Expected Monthly Pension: ₹${customCalculations.monthlyPensionAmount.toLocaleString("en-IN")}/month*

Calculate your exact lifetime pension blueprint: ${currentUrl}`;
    }

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  const downloadPDFReport = () => {
    if (activeTab === "bpsc") {
      generatePDFReport({
        title: language === "hi" ? "बीपीएससी शिक्षक एनपीएस और पेंशन रिपोर्ट" : "BPSC Teacher NPS & Pension Projection",
        subtitle: language === "hi" ? "वेतन-आधारित स्वचालित योगदान और पेंशन योजना" : "Salary-linked pension projections and compound wealth evaluation",
        language,
        sections: [
          {
            title: language === "hi" ? "मासिक वेतन और एनपीएस इनपुट" : "Monthly Salary & NPS Inputs",
            items: [
              { label: language === "hi" ? "मूल वेतन + महंगाई भत्ता" : "Basic Pay + DA", value: `INR ${basicPayDa.toLocaleString("en-IN")}` },
              { label: language === "hi" ? "कर्मचारी योगदान (10%)" : "Employee Contribution (10%)", value: `INR ${bpscCalculations.employeeShare.toLocaleString("en-IN")}` },
              { label: language === "hi" ? "नियोक्ता (सरकार) योगदान (14%)" : "Govt (Employer) Share (14%)", value: `INR ${bpscCalculations.employerShare.toLocaleString("en-IN")}` },
              { label: language === "hi" ? "कुल मासिक एनपीएस निवेश" : "Total Monthly NPS Invested", value: `INR ${bpscCalculations.monthlyContribution.toLocaleString("en-IN")}` },
              { label: language === "hi" ? "निवेश की अवधि (वर्ष)" : "Tenure (Years)", value: `${yearsToRetire} Years` }
            ]
          },
          {
            title: language === "hi" ? "अनुमानित सेवानिवृत्ति धन" : "Expected Retirement Corpus",
            items: [
              { label: language === "hi" ? "कुल संचित सेवानिवृत्ति निधि" : "Total Accumulated Wealth", value: `INR ${bpscCalculations.totalAccumulatedCorpus.toLocaleString("en-IN")}` },
              { label: language === "hi" ? "कुल निवेशित मूलधन" : "Total Invested Principal", value: `INR ${bpscCalculations.totalInvestedAmount.toLocaleString("en-IN")}` },
              { label: language === "hi" ? "अर्जित अनुमानित ब्याज" : "Estimated Returns Earned", value: `INR ${(bpscCalculations.totalAccumulatedCorpus - bpscCalculations.totalInvestedAmount).toLocaleString("en-IN")}` }
            ]
          },
          {
            title: language === "hi" ? "वार्षिकी और एकमुश्त भुगतान" : "Annuity & Lump Sum Division",
            items: [
              { label: language === "hi" ? "एकमुश्त कर-मुक्त निकासी (60%)" : "Lump Sum Tax-Free Cash (60%)", value: `INR ${bpscCalculations.lumpsumWithdrawalCorpus.toLocaleString("en-IN")}` },
              { label: language === "hi" ? "पेंशन के लिए पुनर्निवेश (40%)" : "Annuity Purchase Corpus (40%)", value: `INR ${bpscCalculations.annuityCorpus.toLocaleString("en-IN")}` },
              { label: language === "hi" ? "अनुमानित वार्षिक ब्याज दर" : "Expected Annuity Yield", value: `${expectedAnnuityRate}%` },
              { label: language === "hi" ? "अनुमानित मासिक पेंशन" : "Estimated Monthly Pension", value: `INR ${bpscCalculations.monthlyPensionAmount.toLocaleString("en-IN")}/mo` }
            ]
          }
        ],
        notes: language === "hi" ? [
          "गणना नेशनल पेंशन सिस्टम (NPS) के सरकार द्वारा तय दिशानिर्देशों के अनुरूप है।",
          "60% तक की एकमुश्त निकासी आयकर की धारा 10(12A) के तहत पूरी तरह कर-मुक्त है।"
        ] : [
          "Projections adhere strictly to National Pension System rules under Government Sector guidelines.",
          "60% lump sum withdrawal is completely tax-free under current Section 10(12A) of the IT Act."
        ]
      });
    } else {
      generatePDFReport({
        title: language === "hi" ? "एनपीएस पेंशन योजना रिपोर्ट" : "Custom National Pension System Report",
        subtitle: language === "hi" ? "व्यक्तिगत सेवानिवृत्ति बचत और वित्तीय ब्लूप्रिंट" : "Personal retirement savings summary and dynamic step-up growth projection",
        language,
        sections: [
          {
            title: language === "hi" ? "व्यक्तिगत और निवेश इनपुट" : "Personal & Investment Inputs",
            items: [
              { label: language === "hi" ? "जन्म तिथि" : "Date of Birth", value: customDob },
              { label: language === "hi" ? "वर्तमान आयु" : "Current Age", value: `${customCalculations.currentAge} Years` },
              { label: language === "hi" ? "मासिक योगदान" : "Monthly Contribution", value: `INR ${customMonthlyContribution.toLocaleString("en-IN")}` },
              { label: language === "hi" ? "वार्षिक योगदान वृद्धि" : "Annual Step-Up Increment", value: `${customContributionIncrease}%` },
              { label: language === "hi" ? "सेवानिवृत्ति की आयु" : "Retirement Age Goal", value: `${customRetirementAge} Years` }
            ]
          },
          {
            title: language === "hi" ? "पेंशन संचय और संपत्ति" : "Pension Wealth Accumulation",
            items: [
              { label: language === "hi" ? "कुल संचित राशि" : "Total Accumulated Wealth", value: `INR ${customCalculations.totalAccumulatedCorpus.toLocaleString("en-IN")}` },
              { label: language === "hi" ? "कुल निवेशित मूलधन" : "Total Invested Principal", value: `INR ${customCalculations.totalAmountInvested.toLocaleString("en-IN")}` },
              { label: language === "hi" ? "अर्जित ब्याज लाभ" : "Estimated Returns Earned", value: `INR ${customCalculations.gainsEarned.toLocaleString("en-IN")}` }
            ]
          },
          {
            title: language === "hi" ? "पेंशन और एकमुश्त भुगतान" : "Annuity Purchases & Pension",
            items: [
              { label: language === "hi" ? "एकमुश्त निकासी राशि" : "Lump Sum Withdrawal", value: `INR ${customCalculations.lumpsumWithdrawalCorpus.toLocaleString("en-IN")}` },
              { label: language === "hi" ? "वार्षिकी क्रय कोष" : "Annuity Purchased Corpus", value: `INR ${customCalculations.annuityCorpus.toLocaleString("en-IN")}` },
              { label: language === "hi" ? "मासिक आजीवन पेंशन" : "Expected Monthly Pension", value: `INR ${customCalculations.monthlyPensionAmount.toLocaleString("en-IN")}/mo` }
            ]
          }
        ],
        notes: language === "hi" ? [
          "वार्षिक रूप से योगदान में वृद्धि (Step-up) करने से दीर्घकालिक चक्रवर्ती ब्याज का लाभ मिलता है।",
          "यह रिपोर्ट काल्पनिक अनुमानों पर आधारित है, वास्तविक परिणाम बाजार की चाल और रिटर्न पर निर्भर करते हैं।"
        ] : [
          "Annual step-up growth ensures compounding creates a significant wealth cushion for retirement.",
          "Market linked rates are simulations. Actual returns are governed by PFRDA regulated fund managers."
        ]
      });
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
      
      {/* Title Header */}
      <div className="mb-6 text-center sm:text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 dark:border-slate-800/60 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-violet-100 dark:bg-violet-950 text-violet-800 dark:text-violet-300 text-xs font-black rounded-full mb-3 shadow-sm uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            NPS Core Node
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-slate-800 dark:text-white leading-tight">
            BPSC Teacher NPS & Pension Calculator 2026
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 font-medium max-w-2xl">
            Evaluate your government pension accumulation and plan voluntary contributions under the National Pension System (NPS). Supports both auto-matching tax rules and dynamic compounding models.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
          <button
            onClick={saveToLocker}
            disabled={isSaving}
            className={`bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-bold text-xs px-4 py-2.5 rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all border-0 cursor-pointer ${isSaving ? "opacity-75 cursor-not-allowed" : ""}`}
          >
            <Bookmark className="w-4 h-4 text-white" />
            <span>{isSaving ? "Saving..." : saveStatus === "success" ? (language === "hi" ? "सुरक्षित किया गया! ✓" : "Saved! ✓") : (language === "hi" ? "तिजोरी में सहेजें" : "Save to Vault")}</span>
          </button>
          <button
            onClick={downloadPDFReport}
            className="bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 active:scale-95 text-white font-bold text-xs px-4 py-2.5 rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all border-0 cursor-pointer"
          >
            <FileDown className="w-4 h-4" />
            <span>{language === "hi" ? "पीडीएफ रिपोर्ट डाउनलोड" : "Download PDF Report"}</span>
          </button>
          <button
            onClick={shareToWhatsApp}
            className="bg-[#25D366] hover:bg-[#20ba5a] active:scale-95 text-white font-bold text-xs px-4 py-2.5 rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all border-0 cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>{language === "hi" ? "व्हाट्सएप साझा" : "Share on WhatsApp"}</span>
          </button>
        </div>
      </div>

      {/* Segmented Tab Control */}
      <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl mb-8 max-w-md mx-auto sm:mx-0 border border-slate-200/40 dark:border-slate-800/40">
        <button
          type="button"
          onClick={() => setActiveTab("custom")}
          className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "custom"
              ? "bg-violet-600 text-white shadow-md dark:bg-violet-500"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>{language === "hi" ? "विस्तृत पेंशन योजनाकार" : "Detailed Pension Planner"}</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("bpsc")}
          className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "bpsc"
              ? "bg-violet-600 text-white shadow-md dark:bg-violet-500"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{language === "hi" ? "BPSC शिक्षक वेतन मिलान" : "Salary Auto-Matching"}</span>
        </button>
      </div>

      {/* Grid Inputs vs Outputs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Input sliders & params column */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-md space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Calculator className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            <h3 className="font-extrabold text-slate-800 dark:text-white text-base">
              {activeTab === "custom" ? "Calculation Parameters" : "BPSC Teacher Contribution Matrix"}
            </h3>
          </div>

          {activeTab === "bpsc" ? (
            // TAB A: BPSC Auto Matching Salary Form Inputs
            <div className="space-y-4">
              {/* Monthly Basic + DA combined input */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span className="font-black text-slate-500 uppercase tracking-wide">Monthly (Basic Pay + DA)</span>
                  <span className="text-violet-600 dark:text-violet-400 font-extrabold">₹{basicPayDa.toLocaleString("en-IN")}/mo</span>
                </div>
                <input
                  type="range"
                  min={15000}
                  max={200000}
                  step={1000}
                  value={basicPayDa}
                  onChange={(e) => setBasicPayDa(parseInt(e.target.value) || 0)}
                  className="w-full accent-violet-500 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
                />
                <p className="text-[10px] text-slate-400 mt-1 font-medium select-none leading-relaxed">
                  Enter the combined sum of your BPSC basic scale and dearness allowance.
                </p>
              </div>

              {/* Tenure - Years to retire slider */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span className="font-black text-slate-500 uppercase tracking-wide">Years Left for Retirement (Tenure)</span>
                  <span className="text-violet-600 dark:text-violet-400 font-extrabold">{yearsToRetire} Years</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={45}
                  step={1}
                  value={yearsToRetire}
                  onChange={(e) => setYearsToRetire(parseInt(e.target.value) || 0)}
                  className="w-full accent-violet-500 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Core parameter inputs */}
              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800 pt-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-wider">Employee Share %</label>
                  <input
                    type="number"
                    value={employeeRate}
                    min={1}
                    max={30}
                    onChange={(e) => setEmployeeRate(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-2 text-xs font-bold text-slate-800 dark:text-white focus:ring-1 focus:ring-violet-500 focus:outline-none"
                  />
                  <span className="text-[9px] text-slate-400 font-medium">Std: 10%</span>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-wider">Employer Share %</label>
                  <input
                    type="number"
                    value={employerRate}
                    min={1}
                    max={30}
                    onChange={(e) => setEmployerRate(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-2 text-xs font-bold text-slate-800 dark:text-white focus:ring-1 focus:ring-violet-500 focus:outline-none"
                  />
                  <span className="text-[9px] text-slate-400 font-medium">Govt Default: 14%</span>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-wider">Expected Return %</label>
                  <input
                    type="number"
                    value={expectedReturn === "" ? "" : expectedReturn}
                    step={0.1}
                    min={1}
                    max={25}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "") {
                        setExpectedReturn("");
                      } else {
                        setExpectedReturn(parseFloat(val) || 0);
                      }
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-2 text-xs font-bold text-slate-800 dark:text-white focus:ring-1 focus:ring-violet-500 focus:outline-none"
                  />
                  <span className="text-[9px] text-slate-400 font-medium">Avg Class Return: ~9-10%</span>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-wider">Annuity Purchase %</label>
                  <input
                    type="number"
                    value={annuityPurchasePercent}
                    min={40}
                    max={100}
                    onChange={(e) => setAnnuityPurchasePercent(parseInt(e.target.value) || 40)}
                    className="w-full bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-2 text-xs font-bold text-slate-800 dark:text-white focus:ring-1 focus:ring-violet-500 focus:outline-none"
                  />
                  <span className="text-[9px] text-slate-400 font-medium">Mandated Min: 40%</span>
                </div>
              </div>
            </div>
          ) : (
            // TAB B: Custom Pension & NPS Planner Inputs (Based on PDF Screenshot)
            <div className="space-y-4">
              
              {/* DOB & Age Display */}
              <div>
                <div className="flex justify-between items-center text-xs font-semibold mb-2">
                  <span className="font-black text-slate-500 uppercase tracking-wide">My Date of Birth is:</span>
                  <span className="text-violet-600 dark:text-violet-400 font-extrabold text-xs bg-violet-50 dark:bg-violet-950/40 px-2 py-0.5 rounded">
                    {calculateAge(customDob)} Yrs
                  </span>
                </div>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="date"
                    value={customDob}
                    onChange={(e) => setCustomDob(e.target.value || "1996-06-11")}
                    className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 py-2.5 pl-10 pr-4 text-xs font-bold text-slate-800 dark:text-white focus:ring-1 focus:ring-violet-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* My Existing NPS Tier 1 Corpus (₹) */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-wider">My Existing NPS Tier 1 Corpus (₹)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    value={customExistingCorpus || ""}
                    onChange={(e) => setCustomExistingCorpus(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 py-2.5 pl-7 pr-4 text-xs font-bold text-slate-800 dark:text-white focus:ring-1 focus:ring-violet-500 focus:outline-none"
                    placeholder="Enter existing corpus (if any)"
                  />
                </div>
              </div>

              {/* I would like to contribute (₹ per month) */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span className="font-black text-slate-500 uppercase tracking-wide">Monthly Contribution</span>
                  <span className="text-violet-600 dark:text-violet-400 font-extrabold">₹{customMonthlyContribution.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={500}
                    max={150000}
                    step={500}
                    value={customMonthlyContribution}
                    onChange={(e) => setCustomMonthlyContribution(parseInt(e.target.value) || 1000)}
                    className="flex-1 accent-violet-500 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="relative w-28 shrink-0">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">₹</span>
                    <input
                      type="number"
                      value={customMonthlyContribution || ""}
                      onChange={(e) => setCustomMonthlyContribution(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-1 pl-5 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-violet-500"
                    />
                  </div>
                </div>
              </div>

              {/* Additional parameters - contribution, retirement, defer, Annual Increase */}
              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800 pt-3">
                <div>
                  <label className="block text-[9px] font-black text-slate-400 mb-1 uppercase tracking-wider">Contribute till age</label>
                  <input
                    type="number"
                    value={customRetirementAge}
                    min={18}
                    max={75}
                    onChange={(e) => setCustomRetirementAge(parseInt(e.target.value) || 60)}
                    className="w-full bg-slate-50 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 p-1.5 text-xs font-bold text-slate-800 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-black text-slate-400 mb-1 uppercase tracking-wider">Exit Deferral Age</label>
                  <input
                    type="number"
                    value={customDeferAge}
                    min={customRetirementAge}
                    max={75}
                    onChange={(e) => setCustomDeferAge(parseInt(e.target.value) || customRetirementAge)}
                    className="w-full bg-slate-50 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 p-1.5 text-xs font-bold text-slate-800 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-black text-slate-400 mb-1 uppercase tracking-wider">% Annual Increase</label>
                  <input
                    type="number"
                    value={customContributionIncrease}
                    min={0}
                    max={50}
                    onChange={(e) => setCustomContributionIncrease(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 p-1.5 text-xs font-bold text-slate-800 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-black text-slate-400 mb-1 uppercase tracking-wider">Expected Return (%)</label>
                  <input
                    type="number"
                    value={customExpectedReturn === "" ? "" : customExpectedReturn}
                    step={0.1}
                    min={1}
                    max={25}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "") {
                        setCustomExpectedReturn("");
                      } else {
                        setCustomExpectedReturn(parseFloat(val) || 0);
                      }
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 p-1.5 text-xs font-bold text-slate-800 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-black text-slate-400 mb-1 uppercase tracking-wider">Annuity Purchase (%)</label>
                  <input
                    type="number"
                    value={customAnnuityPurchasePercent}
                    min={40}
                    max={100}
                    onChange={(e) => setCustomAnnuityPurchasePercent(parseInt(e.target.value) || 40)}
                    className="w-full bg-slate-50 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 p-1.5 text-xs font-bold text-slate-800 dark:text-white focus:outline-none"
                  />
                  <p className="text-[8px] text-slate-400 mt-0.5 leading-tight">Min 40%, Lumpsum remainder</p>
                </div>

                <div>
                  <label className="block text-[9px] font-black text-slate-400 mb-1 uppercase tracking-wider">Annuity Rate (%)</label>
                  <input
                    type="number"
                    value={customExpectedAnnuityRate}
                    step={0.05}
                    min={1}
                    max={20}
                    onChange={(e) => setCustomExpectedAnnuityRate(parseFloat(e.target.value) || 6.75)}
                    className="w-full bg-slate-50 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 p-1.5 text-xs font-bold text-slate-800 dark:text-white focus:outline-none"
                  />
                  <p className="text-[8px] text-slate-400 mt-0.5 leading-tight">Interest rate paid by provider</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Output Dashboard column - beautifully matching PDF */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          
          {/* Main output box */}
          <div className="bg-white border border-slate-200/80 dark:bg-slate-900 dark:border-slate-800/80 text-slate-900 dark:text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-violet-600/10 rounded-full blur-3xl text-violet-500" />

            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
              <span className="text-xs font-black text-violet-600 dark:text-violet-300 uppercase tracking-wider">
                ⚡ LIVE CALCULATION RESULT
              </span>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-extrabold flex items-center gap-1">
                <Landmark className="w-3.5 h-3.5" />
                PRAN Tier-I Account
              </div>
            </div>

            {/* expected monthly pension panel */}
            <div className="bg-violet-500/5 dark:bg-violet-950/20 border border-violet-500/15 rounded-2xl p-5.5 text-center mb-6">
              <span className="text-[10px] text-emerald-600 dark:text-emerald-300 font-extrabold uppercase tracking-widest block">
                EXPECTED MONTHLY PENSION
              </span>
              <p className="text-4xl sm:text-5xl font-black text-emerald-600 dark:text-emerald-300 mt-2 font-mono tracking-tight">
                ₹{activeTab === "custom" 
                  ? customCalculations.monthlyPensionAmount.toLocaleString("en-IN")
                  : bpscCalculations.monthlyPensionAmount.toLocaleString("en-IN")}
              </p>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 font-medium block">
                Based on an expected annuity rate of{" "}
                <strong className="text-slate-700 dark:text-slate-300">{activeTab === "custom" ? customExpectedAnnuityRate : expectedAnnuityRate}%</strong> on a{" "}
                <strong className="text-slate-700 dark:text-slate-300">{activeTab === "custom" ? customAnnuityPurchasePercent : annuityPurchasePercent}%</strong> annuity purchase.
              </span>
            </div>

            {/* Total balance accumulated & stats matching PDF top info */}
            <div className="grid grid-cols-3 gap-3 text-center mb-6 border-b border-slate-100 dark:border-slate-800 pb-6">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-150/60 dark:border-slate-800/50">
                <span className="text-[8px] sm:text-[9px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-wider block">TOTAL CORPUS</span>
                <p className="text-sm sm:text-base font-extrabold text-slate-850 dark:text-white mt-1">
                  ₹{activeTab === "custom" 
                    ? customCalculations.totalAccumulatedCorpus.toLocaleString("en-IN")
                    : bpscCalculations.totalAccumulatedCorpus.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-150/60 dark:border-slate-800/50">
                <span className="text-[8px] sm:text-[9px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-wider block">TOTAL INVESTED</span>
                <p className="text-sm sm:text-base font-extrabold text-slate-850 dark:text-white mt-1">
                  ₹{activeTab === "custom" 
                    ? customCalculations.totalAmountInvested.toLocaleString("en-IN")
                    : bpscCalculations.totalInvestedAmount.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-150/60 dark:border-slate-800/50">
                <span className="text-[8px] sm:text-[9px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-wider block">GAINS EARNED</span>
                <p className="text-sm sm:text-base font-extrabold text-emerald-600 dark:text-emerald-450 mt-1">
                  ₹{activeTab === "custom" 
                    ? customCalculations.gainsEarned.toLocaleString("en-IN")
                    : (bpscCalculations.totalAccumulatedCorpus - bpscCalculations.totalInvestedAmount).toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            {/* Visual Investment Ratio indicator */}
            <div className="mb-6 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-150/60 dark:border-slate-800/50 space-y-2">
              <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                <span>Principal: {activeTab === "custom" ? customCalculations.principalPct : bpscCalculations.principalPct}%</span>
                <span>Gains: {activeTab === "custom" ? customCalculations.gainsPct : bpscCalculations.gainsPct}%</span>
              </div>
              <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex">
                <div 
                  className="bg-violet-500 dark:bg-violet-400 h-full transition-all" 
                  style={{ width: `${activeTab === "custom" ? customCalculations.principalPct : bpscCalculations.principalPct}%` }}
                />
                <div 
                  className="bg-emerald-500 dark:bg-emerald-400 h-full flex-1 transition-all"
                />
              </div>
              <span className="text-[8px] text-slate-500 block text-center font-medium">INVESTMENT DIVISION (Principal vs Gains)</span>
            </div>

            {/* Split At Retirement block (Lumpsum vs Annuity) */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-5">
              <h5 className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-wider mb-3">NPS SPLIT AT RETIREMENT</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-150/60 dark:border-slate-800/50 rounded-xl p-4">
                  <span className="text-[9px] text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wide block">LUMP SUM WITHDRAWAL (60% Max)</span>
                  <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                    ₹{activeTab === "custom" 
                      ? customCalculations.lumpsumWithdrawalCorpus.toLocaleString("en-IN")
                      : bpscCalculations.lumpsumWithdrawalCorpus.toLocaleString("en-IN")}
                  </p>
                  <p className="text-[9px] text-slate-500 dark:text-slate-400 mt-1 font-medium flex items-center gap-1">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span> 100% Tax-Free lump-sum payout
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-150/60 dark:border-slate-800/50 rounded-xl p-4">
                  <span className="text-[9px] text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wide block">ANNUITY PURCHASE (40% Min)</span>
                  <p className="text-xl font-bold text-violet-600 dark:text-violet-400 mt-1">
                    ₹{activeTab === "custom" 
                      ? customCalculations.annuityCorpus.toLocaleString("en-IN")
                      : bpscCalculations.annuityCorpus.toLocaleString("en-IN")}
                  </p>
                  <p className="text-[9px] text-slate-500 dark:text-slate-400 mt-1 font-medium flex items-center gap-1">
                    <span className="text-violet-600 dark:text-violet-400 font-bold">✓</span> Reinvested to generate monthly pension
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Plan Overview (From Page 2 PDF) */}
            {activeTab === "custom" && (
              <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-150/60 dark:border-slate-800/50 rounded-xl p-4 mt-4 text-[10px] text-slate-600 dark:text-slate-300 font-medium space-y-2">
                <span className="text-[9px] text-violet-650 dark:text-violet-300 font-black uppercase tracking-wider block">QUICK PLAN OVERVIEW</span>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Your estimated current age is <strong className="text-slate-850 dark:text-white">{customCalculations.currentAge}</strong> completed years.</li>
                  <li>You will actively contribute for the next <strong className="text-slate-850 dark:text-white">{customCalculations.yearsToInvest}</strong> years.</li>
                  <li>Withdrawal / Pension commencement age: <strong className="text-slate-850 dark:text-white">{customDeferAge}</strong> years.</li>
                </ul>
              </div>
            )}

          </div>

          {/* Tax rebate notice info */}
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/40 p-4 rounded-2xl flex gap-3 text-xs text-amber-800 dark:text-amber-400">
            <Info className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-500 mt-0.5" />
            <div>
              <p className="font-extrabold text-amber-800 dark:text-amber-300">Employer Contribution Tax Rebate under 80CCD(2)</p>
              <p className="mt-0.5 font-medium leading-relaxed text-[11px]">
                Under Section 80CCD(2) of the Income Tax Act, the 14% matching NPS base paid by your government department/school body is 100% tax-free! BPSC teachers can also leverage Section 80CCD(1B) to save an additional ₹50k tax-free.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Formula & Deep Explanation / FAQs */}
      <div className="mt-12 border-t border-slate-200 dark:border-slate-800 pt-8 space-y-8">
        
        {/* Formula Block from PDF */}
        <section className="bg-violet-50/50 dark:bg-violet-950/10 border border-violet-100 dark:border-violet-900/40 p-5 rounded-2xl space-y-2">
          <h4 className="text-xs font-black text-violet-800 dark:text-violet-300 uppercase tracking-widest flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            Formula & Deep Explanation
          </h4>
          <p className="text-sm font-bold font-mono text-slate-800 dark:text-white bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 py-3 px-4 rounded-xl shadow-sm text-center">
            Monthly Pension = (Retirement Corpus × Annuity Purchased %) × Expected Annuity Rate / 12
          </p>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold pt-1">
            The National Pension System (NPS) is a voluntary, long-term retirement savings scheme designed to enable systematic savings. At retirement (age 60), a maximum of 60% of the accumulated corpus can be withdrawn completely tax-free as a lump sum, while a minimum of 40% must be designated to purchase an annuity to provide a regular monthly pension.
          </p>
        </section>

        <section className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 space-y-4">
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white font-display tracking-tight border-l-4 border-violet-500 pl-3">
            NPS Pension System and Tax Benefits for BPSC Teachers
          </h2>
          <p className="text-sm leading-relaxed font-medium text-justify">
            For BPSC Teachers appointed in Bihar state, NPS replaces old general provident structures. Under the terms of standard appointment, the school education department matches your contribution with a strong 14% component, which acts as a massive compounding multiplier over your service life.
          </p>
          <p className="text-sm leading-relaxed font-semibold text-violet-600 dark:text-violet-400">
            Contributions to BPSC teacher PRAN (NPS) fall under distinct direct and matching categories, with extensive tax optimization benefits.
          </p>
        </section>

        {/* FAQs derived from PDF Page 3 */}
        <section className="space-y-4">
          <h2 className="text-xl font-black text-slate-800 dark:text-white font-display tracking-tight flex items-center gap-2 mb-4">
            <HelpCircle className="w-5 h-5 text-violet-500" />
            Frequently Asked Questions (FAQ)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-600 dark:text-slate-300 font-medium">
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4.5 rounded-2xl shadow-sm">
              <h4 className="text-sm font-black text-slate-800 dark:text-white mb-1.5">Q. What is the minimum annuity purchase percentage in NPS?</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                The portion of the accumulated retirement corpus that you must allocate toward purchasing a lifetime annuity is a mandatory minimum of 40%. The remaining maximum of 60% can be tax-freely cashed out as a single lump sum.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4.5 rounded-2xl shadow-sm">
              <h4 className="text-sm font-black text-slate-800 dark:text-white mb-1.5">Q. Is NPS pension taxable?</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                The lump sum withdrawal of up to 60% of the accumulated corpus at retirement is fully tax-free. However, the recurring monthly pension income generated through your subsequent annuity scheme is treated as taxable salary in the respective financial year.
              </p>
            </div>
          </div>
        </section>

        {/* Related Calculators */}
        <section className="bg-violet-50/30 border border-violet-100/50 dark:border-violet-900/15 rounded-3xl p-6 space-y-4">
          <span className="text-[9px] font-black uppercase text-violet-600 dark:text-violet-400 tracking-widest font-mono block">
            Related Salaried Planners &amp; Checklists
          </span>
          <h4 className="text-xs font-black text-slate-800 dark:text-white leading-tight">
            Continue planning your retired passive vectors with these secondary calculators:
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs leading-none">
            <a 
              href="/sip-calculator" 
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-950 text-center font-bold text-slate-705 dark:text-slate-300 transition-all block"
            >
              SIP Growth
            </a>
            <a 
              href="/pension-calculator" 
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-950 text-center font-bold text-slate-705 dark:text-slate-300 transition-all block"
            >
              NPS Retirement
            </a>
            <a 
              href="/salary-calculator" 
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-950 text-center font-bold text-slate-705 dark:text-slate-300 transition-all block"
            >
              Salary Planner
            </a>
            <a 
              href="/da-calculator" 
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-950 text-center font-bold text-slate-705 dark:text-slate-300 transition-all block"
            >
              DA Allowance
            </a>
          </div>
        </section>

      </div>
    </div>
  );
}
