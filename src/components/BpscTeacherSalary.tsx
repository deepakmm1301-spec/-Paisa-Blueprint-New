import React, { useState, useMemo, useEffect } from "react";
import { Sparkles, ArrowLeft, Info, HelpCircle, Share2, Calculator, CheckCircle, Percent, ShieldCheck, FileDown, Bookmark } from "lucide-react";
import { getShareableLink } from "../types";
import { generatePDFReport } from "../utils/pdfGenerator";
import { paisaFetch } from "../api";

interface BpscTeacherSalaryProps {
  language?: "en" | "hi";
}

export default function BpscTeacherSalary({ language = "en" }: BpscTeacherSalaryProps = {}) {
  const [teacherGrade, setTeacherGrade] = useState<"primary" | "middle" | "secondary" | "higher_secondary">("primary");
  const [customBasicPay, setCustomBasicPay] = useState<number | "">("");
  const [daPercent, setDaPercent] = useState<number>(50); // Current DA rate is 50%
  const [hraPercent, setHraPercent] = useState<number | "">(8); // State HRA rates typically 4%, 6%, 8%, 16%, 20%
  const [medicalAllowance, setMedicalAllowance] = useState<number | "">(1000); // Fixed Rs 1000 for Bihar Gov
  const [otherAllowances, setOtherAllowances] = useState<number | "">(2000); // CTA or specific school allowance
  const [gpfNpsPercent, setGpfNpsPercent] = useState<number | "">(10); // Standard employee contribution is 10% for NPS

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

  // Load saved calculation state if event received or on mount
  useEffect(() => {
    const loadFromCalc = (calc: any) => {
      if (!calc || !calc.data) return;
      const data = calc.data;
      if (data.teacherGrade) setTeacherGrade(data.teacherGrade);
      if (data.customBasicPay !== undefined) setCustomBasicPay(data.customBasicPay);
      if (data.daPercent !== undefined) setDaPercent(data.daPercent);
      if (data.hraPercent !== undefined) setHraPercent(data.hraPercent);
      if (data.medicalAllowance !== undefined) setMedicalAllowance(data.medicalAllowance);
      if (data.otherAllowances !== undefined) setOtherAllowances(data.otherAllowances);
      if (data.gpfNpsPercent !== undefined) setGpfNpsPercent(data.gpfNpsPercent);
    };

    // Check localStorage on mount
    const loadedStr = localStorage.getItem("paisa_loaded_calculation");
    if (loadedStr) {
      try {
        const calc = JSON.parse(loadedStr);
        if (calc && (calc.data?.teacherGrade || calc.title?.toLowerCase().includes("bpsc"))) {
          loadFromCalc(calc);
          localStorage.removeItem("paisa_loaded_calculation");
        }
      } catch (err) {
        console.error("Error loading saved BPSC calculation:", err);
      }
    }

    const handleLoad = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && (customEvent.detail.type === "salary" || customEvent.detail.type === "bpsc")) {
        loadFromCalc(customEvent.detail);
      }
    };
    window.addEventListener("paisa-load-calculation", handleLoad);
    return () => window.removeEventListener("paisa-load-calculation", handleLoad);
  }, []);

  // Bihar BPSC Teacher Pay Commission Matrix Core Constants
  // Basic Pay for grades as of Bihar BPSC TRE 2026/Recent Rules
  const standardBasicPay = {
    primary: 25000,          // Primary (Class 1-5): Basic Pay Rs 25,000
    middle: 28000,           // Middle (Class 6-8): Basic Pay Rs 28,000
    secondary: 31000,        // Secondary (Class 9-10): Basic Pay Rs 31,000
    higher_secondary: 32000  // Higher Secondary (Class 11-12): Basic Pay Rs 32,000
  };

  const basicPay = (customBasicPay === "" || customBasicPay === 0) ? standardBasicPay[teacherGrade] : customBasicPay;

  const calculations = useMemo(() => {
    const activeBasicPay = typeof basicPay === "string" ? 0 : basicPay;
    const activeDaPercent = typeof daPercent === "string" ? 0 : daPercent;
    const activeHraPercent = typeof hraPercent === "string" ? 0 : hraPercent;
    const activeMedicalAllowance = typeof medicalAllowance === "string" ? 0 : medicalAllowance;
    const activeOtherAllowances = typeof otherAllowances === "string" ? 0 : otherAllowances;
    const activeGpfNpsPercent = typeof gpfNpsPercent === "string" ? 0 : gpfNpsPercent;

    const daAmount = Math.round((activeBasicPay * activeDaPercent) / 100);
    const hraAmount = Math.round((activeBasicPay * activeHraPercent) / 100);
    const grossSalary = activeBasicPay + daAmount + hraAmount + activeMedicalAllowance + activeOtherAllowances;

    // Deductions: NPS (10% of Basic + DA), GIS (Group Insurance Scheme ~Rs 30), GIS/LIC/PF/Tax (~Rs 150)
    const npsDeduction = Math.round(((activeBasicPay + daAmount) * activeGpfNpsPercent) / 100);
    const stateTaxPro = 150; // Bihar Professional Tax typically
    const groupInsurance = 30; // standard GIS Bihar Govt
    const totalDeductions = npsDeduction + stateTaxPro + groupInsurance;
    const inHandSalary = Math.max(0, grossSalary - totalDeductions);

    // Employer Contribution (14% NPS Bihar State Government)
    const govtNpsContribution = Math.round(((activeBasicPay + daAmount) * 14) / 100);

    return {
      basicPay: activeBasicPay,
      daAmount,
      hraAmount,
      grossSalary,
      npsDeduction,
      stateTaxPro,
      groupInsurance,
      totalDeductions,
      inHandSalary,
      govtNpsContribution,
      medicalAllowance: activeMedicalAllowance,
      otherAllowances: activeOtherAllowances
    };
  }, [basicPay, daPercent, hraPercent, medicalAllowance, otherAllowances, gpfNpsPercent]);

  // Save calculation handler
  const saveToLocker = async () => {
    setIsSaving(true);
    setSaveStatus("idle");
    try {
      const translatedGrade = teacherGrade === "primary" ? (language === "hi" ? "प्राथमिक (Primary 1-5)" : "Primary (1-5)")
        : teacherGrade === "middle" ? (language === "hi" ? "मध्य (Middle 6-8)" : "Middle (6-8)")
        : teacherGrade === "secondary" ? (language === "hi" ? "माध्यमिक (Secondary 9-10)" : "Secondary (9-10)")
        : (language === "hi" ? "उच्च माध्यमिक (Higher Secondary 11-12)" : "Higher Secondary (11-12)");

      const res = await paisaFetch("/api/locker/save", {
        method: "POST",
        body: JSON.stringify({
          title: language === "hi" 
            ? `बीपीएससी शिक्षक वेतन - ${translatedGrade} (मूल: ₹${basicPay.toLocaleString()})`
            : `BPSC Teacher Salary - ${translatedGrade} (Basic: ₹${basicPay.toLocaleString()})`,
          type: "salary",
          data: {
            teacherGrade,
            customBasicPay,
            daPercent,
            hraPercent,
            medicalAllowance,
            otherAllowances,
            gpfNpsPercent,
            netSalary: calculations.inHandSalary,
            grossSalary: calculations.grossSalary
          }
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
        alert(data?.message || (language === "hi" ? "गणना सहेजने में विफल। कृपया सुनिश्चित करें कि आप लॉग इन हैं।" : "Failed to save calculation. Please make sure you are logged in."));
      }
    } catch (error) {
      console.error(error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
      alert(language === "hi" ? "सहेजते समय एक अप्रत्याशित त्रुटि हुई।" : "An unexpected error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Share to WhatsApp
  const shareToWhatsApp = async () => {
    const currentUrl = getShareableLink("bpsc_salary", "/");
    
    const translatedGrade = teacherGrade === "primary" ? "प्राथमिक (Primary 1-5)" 
      : teacherGrade === "middle" ? "मध्य (Middle 6-8)" 
      : teacherGrade === "secondary" ? "माध्यमिक (Secondary 9-10)" 
      : "उच्च माध्यमिक (Higher Secondary 11-12)";

    const text = language === "hi"
      ? `🎯 *BPSC बिहार शिक्षक वेतन संरचना 2026 (7वें वेतन आयोग)*\nश्रेणी: ${translatedGrade}\nमूल वेतन (Basic Pay): ₹${calculations.basicPay.toLocaleString("en-IN")}\nसकल मासिक आय (Gross): ₹${calculations.grossSalary.toLocaleString("en-IN")}\nएनपीएस कटौती (NPS Deduction): ₹${calculations.npsDeduction.toLocaleString("en-IN")}\n*शुद्ध इन-हैंड वेतन (Net In-Hand): ₹${calculations.inHandSalary.toLocaleString("en-IN")}*\nसरकारी पेंशन योगदान (14% NPS): ₹${calculations.govtNpsContribution.toLocaleString("en-IN")}\n\nअपना लाइव वेतन यहाँ देखें:`
      : `🎯 *BPSC Teacher Salary Structure 2026 (7th CPC)*\nGrade: ${teacherGrade.toUpperCase().replace("_", " ")}\nBasic Pay: ₹${calculations.basicPay.toLocaleString("en-IN")}\nGross Monthly Income: ₹${calculations.grossSalary.toLocaleString("en-IN")}\nNPS Deduction: ₹${calculations.npsDeduction.toLocaleString("en-IN")}\n*Net In-Hand (Net Pay): ₹${calculations.inHandSalary.toLocaleString("en-IN")}*\nGovt Contribution (14%): ₹${calculations.govtNpsContribution.toLocaleString("en-IN")}\n\nCalculate yours instantly here:`;
      
    if ((window as any).triggerNativeShare) {
      const title = language === "hi" ? "शिक्षक वेतन संरचना" : "Teacher Salary";
      const handled = await (window as any).triggerNativeShare(title, `${text} ${currentUrl}`, currentUrl);
      if (handled) return;
    }
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text + " " + currentUrl)}`, "_blank");
  };

  const downloadPDFReport = () => {
    const translatedGrade = teacherGrade === "primary" ? "प्राथमिक (Primary 1-5)" 
      : teacherGrade === "middle" ? "मध्य (Middle 6-8)" 
      : teacherGrade === "secondary" ? "माध्यमिक (Secondary 9-10)" 
      : "उच्च माध्यमिक (Higher Secondary 11-12)";

    generatePDFReport({
      title: language === "hi" ? "बीपीएससी शिक्षक वेतन रिपोर्ट 2026" : "BPSC Teacher Salary Report 2026",
      subtitle: language === "hi" ? "बिहार सरकार के नियमों के तहत विस्तृत वित्तीय विवरण" : "Detailed salary calculation summary based on Bihar State Govt regulations",
      language,
      sections: [
        {
          title: language === "hi" ? "कर्मचारी और श्रेणी विवरण" : "Employee & Grade Parameters",
          items: [
            { label: language === "hi" ? "शिक्षक श्रेणी" : "Teacher Grade Level", value: translatedGrade },
            { label: language === "hi" ? "मूल वेतन" : "Basic Pay", value: `INR ${calculations.basicPay.toLocaleString("en-IN")}` },
            { label: language === "hi" ? "महंगाई भत्ता दर" : "Dearness Allowance Rate", value: `${daPercent}%` },
            { label: language === "hi" ? "एचआरए दर" : "HRA Rate", value: `${hraPercent}%` }
          ]
        },
        {
          title: language === "hi" ? "मासिक भत्ते विवरण" : "Monthly Allowances Breakdown",
          items: [
            { label: language === "hi" ? "महंगाई भत्ता राशि" : "Dearness Allowance (DA)", value: `INR ${calculations.daAmount.toLocaleString("en-IN")}` },
            { label: language === "hi" ? "गृह किराया भत्ता" : "House Rent Allowance (HRA)", value: `INR ${calculations.hraAmount.toLocaleString("en-IN")}` },
            { label: language === "hi" ? "चिकित्सा भत्ता" : "Medical Allowance", value: `INR ${calculations.medicalAllowance.toLocaleString("en-IN")}` },
            { label: language === "hi" ? "अन्य भत्ते (CTA/Other)" : "Other Allowances", value: `INR ${calculations.otherAllowances.toLocaleString("en-IN")}` },
            { label: language === "hi" ? "सकल मासिक वेतन" : "Gross Monthly Salary", value: `INR ${calculations.grossSalary.toLocaleString("en-IN")}` }
          ]
        },
        {
          title: language === "hi" ? "मासिक कटौतियाँ" : "Monthly Deductions Breakdown",
          items: [
            { label: language === "hi" ? "एनपीएस योगदान (कर्मचारी 10%)" : "NPS Employee Contribution (10%)", value: `INR ${calculations.npsDeduction.toLocaleString("en-IN")}` },
            { label: language === "hi" ? "व्यावसायिक कर" : "Professional Tax", value: `INR ${calculations.stateTaxPro.toLocaleString("en-IN")}` },
            { label: language === "hi" ? "समूह बीमा योजना (GIS)" : "Group Insurance (GIS)", value: `INR ${calculations.groupInsurance.toLocaleString("en-IN")}` },
            { label: language === "hi" ? "कुल मासिक कटौती" : "Total Monthly Deductions", value: `INR ${calculations.totalDeductions.toLocaleString("en-IN")}` }
          ]
        },
        {
          title: language === "hi" ? "अंतिम वेतन और सेवानिवृत्ति निधि" : "Final Net Pay & Pension Funds",
          items: [
            { label: language === "hi" ? "शुद्ध इन-हैंड वेतन" : "Net In-Hand Salary (Take-home)", value: `INR ${calculations.inHandSalary.toLocaleString("en-IN")}` },
            { label: language === "hi" ? "सरकार का एनपीएस योगदान (14%)" : "Govt NPS Contribution (14%)", value: `INR ${calculations.govtNpsContribution.toLocaleString("en-IN")}` }
          ]
        }
      ],
      notes: language === "hi" ? [
        "वेतन की गणना सातवें वेतन आयोग के नवीनतम नियमों के अनुसार की गई है।",
        "सरकारी एनपीएस पेंशन योगदान (14%) सीधे आपके नेशनल पेंशन सिस्टम खाते में जमा किया जाता है, यह इन-हैंड वेतन में शामिल नहीं होता है।",
        "यह रिपोर्ट केवल एक शैक्षणिक अनुमान है। आधिकारिक वेतन विसंगतियों के लिए डीडीओ (DDO) से संपर्क करें।"
      ] : [
        "Salary structure formulated strictly based on the 7th Central Pay Commission (CPC) recommendations for Bihar State Government Employees.",
        "The 14% Government NPS contribution is directly credited to your PRAN account and does not affect the monthly cash-in-hand.",
        "Calculations are mock projections based on standard DDO templates. Actual figures may vary depending on local rules."
      ]
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
      {/* Title Header */}
      <div className="mb-8 text-center sm:text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 dark:border-slate-800/60 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-black rounded-full mb-3 shadow-sm uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Specialized BPSC Page
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-slate-800 dark:text-white leading-tight">
            BPSC Teacher Salary Calculator 2026
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 font-medium max-w-2xl">
            Assess Bihar state government teacher basic pay, dearness allowance, HRA tiers, monthly NPS deductions, and Net Take-home salary.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
          <button
            onClick={saveToLocker}
            disabled={isSaving}
            className={`bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-bold text-xs px-4 py-2.5 rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all border-0 cursor-pointer ${isSaving ? "opacity-75 cursor-not-allowed" : ""}`}
          >
            <Bookmark className="w-4 h-4 text-white" />
            <span>{isSaving ? (language === "hi" ? "सहेजा जा रहा है..." : "Saving...") : saveStatus === "success" ? (language === "hi" ? "सहेजा गया! ✓" : "Saved! ✓") : (language === "hi" ? "तिजोरी में सहेजें" : "Save to Vault")}</span>
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
            <span>{language === "hi" ? "व्हाट्सऐप साझा" : "Share on WhatsApp"}</span>
          </button>
        </div>
      </div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Input Form Column */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-md space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Calculator className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-extrabold text-slate-800 dark:text-white text-base">Salary Parameter Matrix</h3>
          </div>

          {/* Teacher Grade Select */}
          <div>
            <label className="block text-xs font-black text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
              Bihar Teacher Grade
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "primary", val: "Primary (1-5)" },
                { id: "middle", val: "Middle (6-8)" },
                { id: "secondary", val: "Secondary (9-10)" },
                { id: "higher_secondary", val: "Higher Sec. (11-12)" }
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setTeacherGrade(item.id as any);
                    setCustomBasicPay(""); // Reset custom pay to default grade pay
                  }}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition-all ${
                    teacherGrade === item.id && (customBasicPay === "" || customBasicPay === 0)
                      ? "bg-slate-900 text-white border-slate-900 dark:bg-slate-200 dark:text-slate-900 dark:border-slate-200"
                      : "bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100 dark:bg-slate-800/55 dark:text-slate-300 dark:border-slate-700/60"
                  }`}
                >
                  {item.val}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Basic Pay Slider & Manual Input */}
          <div>
            <div className="flex justify-between items-center text-xs font-medium mb-2">
              <span className="font-black text-slate-500 uppercase tracking-wide">Basic Pay (नियुक्त पे)</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-extrabold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">₹{basicPay.toLocaleString("en-IN")}/mo</span>
            </div>
            <div className="flex items-center gap-3 mb-1">
              <input
                type="range"
                min={18000}
                max={65000}
                step={500}
                value={customBasicPay === "" ? standardBasicPay[teacherGrade] : customBasicPay}
                onChange={(e) => setCustomBasicPay(parseInt(e.target.value) || 0)}
                className="flex-1 accent-emerald-500 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="relative w-28 shrink-0">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  value={customBasicPay}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCustomBasicPay(val === "" ? "" : parseInt(val) || 0);
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-1 pl-5 pr-1 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  min={0}
                  placeholder={standardBasicPay[teacherGrade].toLocaleString("en-IN")}
                />
              </div>
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-medium">
              <span>Min: ₹18k</span>
              <span>Primary Std: ₹25,000</span>
              <span>Max: ₹65k</span>
            </div>
          </div>

          {/* Dearness Allowance Growth */}
          <div>
            <div className="flex justify-between text-xs font-medium mb-2">
              <span className="font-black text-slate-500 uppercase tracking-wide">Dearness Allowance (महंगाई भत्ता)</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{daPercent}% DA</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={daPercent}
              onChange={(e) => setDaPercent(parseInt(e.target.value) || 0)}
              className="w-full accent-emerald-500 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* HRA Ratio selection with Slider & Manual Input */}
          <div>
            <div className="flex justify-between items-center text-xs font-medium mb-2">
              <span className="font-black text-slate-500 uppercase tracking-wide">
                House Rent Allowance (HRA % class)
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-extrabold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                {hraPercent}% HRA
              </span>
            </div>

            {/* Slider and Manual number input */}
            <div className="flex items-center gap-3 mb-1">
              <input
                type="range"
                min={0}
                max={30}
                step={0.5}
                value={hraPercent === "" ? 0 : hraPercent}
                onChange={(e) => setHraPercent(parseFloat(e.target.value) || 0)}
                className="flex-1 accent-emerald-500 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="relative w-28 shrink-0">
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">%</span>
                <input
                  type="number"
                  value={hraPercent}
                  step={0.1}
                  onChange={(e) => {
                    const val = e.target.value;
                    setHraPercent(val === "" ? "" : parseFloat(val) || 0);
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-1 pl-2 pr-5 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  min={0}
                  max={100}
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Allowances Toggles */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                Medical Allowance
              </label>
              <input
                type="number"
                value={medicalAllowance}
                onChange={(e) => {
                  const val = e.target.value;
                  setMedicalAllowance(val === "" ? "" : parseInt(val) || 0);
                }}
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-bold"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                Other Allowance
              </label>
              <input
                type="number"
                value={otherAllowances}
                onChange={(e) => {
                  const val = e.target.value;
                  setOtherAllowances(val === "" ? "" : parseInt(val) || 0);
                }}
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-bold"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Output Dashboard Column */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          <div className="bg-white border border-slate-200/80 dark:bg-slate-900 dark:border-slate-800/80 text-slate-900 dark:text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
            {/* Visual background accents */}
            <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl" />
            <div className="absolute left-0 bottom-0 w-32 h-32 bg-emerald-600/5 rounded-full blur-3xl" />
 
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Salary Computation Output</span>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-extrabold flex items-center gap-1">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                DDO Bihar state formula
              </div>
            </div>
 
            {/* Income Display cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-150/60 dark:border-slate-800/50 rounded-2xl p-4">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wide">Basic Pay (मूल वेतन)</span>
                <p className="text-2xl font-black text-slate-800 dark:text-white mt-1">₹{calculations.basicPay.toLocaleString("en-IN")}</p>
                <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-800/50 text-[9px] text-slate-500 dark:text-slate-400 font-medium">
                  Grade scale based on TRE notification rules.
                </div>
              </div>
 
              <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-150/60 dark:border-slate-800/50 rounded-2xl p-4">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wide">Gross Salary (सकल वेतन)</span>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">₹{calculations.grossSalary.toLocaleString("en-IN")}</p>
                <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-800/50 text-[9px] text-slate-500 dark:text-slate-400 font-medium">
                  {`Basic + DA(₹${calculations.daAmount.toLocaleString("en-IN")}) + HRA(₹${calculations.hraAmount.toLocaleString("en-IN")}) + Allowances`}
                </div>
              </div>

            </div>

            {/* Large Nett In Hand pay Display */}
            <div className="bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/15 rounded-2xl p-5.5 mt-4 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-center md:text-left">
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-wider block">Estimated Net In-Hand Salary (हाथ में वेतन)</span>
                <p className="text-3xl sm:text-4xl font-extrabold mt-1 text-slate-800 dark:text-white">₹{calculations.inHandSalary.toLocaleString("en-IN")}</p>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-medium block">This is your direct monthly home take-away salary credit.</span>
              </div>
              <div className="shrink-0 flex items-center justify-center bg-emerald-500/10 p-2.5 rounded-full border border-emerald-500/20">
                <ShieldCheck className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>

            {/* Detailed Salary Bill Breakdown */}
            <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 mt-6 mb-3 uppercase tracking-wider">Salary Bill Breakdown</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/50 font-medium">
                <span className="text-slate-500 dark:text-slate-400">Dearness Allowance (DA - {daPercent}%)</span>
                <span className="text-slate-850 dark:text-slate-200 font-bold">+ ₹{calculations.daAmount.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/50 font-medium">
                <span className="text-slate-500 dark:text-slate-400">{`House Rent Allowance (HRA - ${hraPercent}%)`}</span>
                <span className="text-slate-850 dark:text-slate-200 font-bold">+ ₹{calculations.hraAmount.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/50 font-medium">
                <span className="text-slate-500 dark:text-slate-400">Total Deductions (Group State Tax + NPS)</span>
                <span className="text-rose-600 dark:text-rose-400 font-black">- ₹{calculations.totalDeductions.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/50 font-medium">
                <span className="text-slate-500 dark:text-slate-400">Of which Govt NPS Employee Share (10%)</span>
                <span className="text-slate-700 dark:text-slate-300 font-bold">₹{calculations.npsDeduction.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between py-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                <span>Bihar Gov Additional Contribution (14% NPS)</span>
                <span className="font-extrabold">+ ₹{calculations.govtNpsContribution.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          {/* Quick Notice */}
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/40 p-4 rounded-2xl flex gap-3 text-xs text-amber-800 dark:text-amber-400">
            <Info className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-500 mt-0.5" />
            <div>
              <p className="font-extrabold">National Pension System (NPS) Advantage</p>
              <p className="mt-0.5 font-medium leading-relaxed">
                As a state government teacher, apart from your ₹{calculations.npsDeduction.toLocaleString("en-IN")} NPS employee cut, the government credits an extra 14% (₹{calculations.govtNpsContribution.toLocaleString("en-IN")} in your case) inside your centralized PRAN account every month, compiling massive tax-deferred wealth.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Structured Content (600 - 1000 words info) */}
      <div className="mt-12 border-t border-slate-200 dark:border-slate-800 pt-8 space-y-8">
        
        {/* Salary Structure section */}
        <section className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 space-y-4">
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white font-display tracking-tight border-l-4 border-emerald-500 pl-3">
            BPSC Teacher Salary Structure 2026: 7th Pay Commission Guidelines
          </h2>
          <p className="text-sm leading-relaxed font-medium">
            The Bihar Public Service Commission (BPSC) recruits teachers for Primary, Middle, Secondary, and Higher Secondary schools through the Bihar Teacher Recruitment Exam (TRE). These recruitment scales operate under the Seventh Central Pay Commission rules but correspond to custom state teacher cadres established by the education department of Bihar. 
          </p>
          <p className="text-sm leading-relaxed font-semibold text-emerald-600 dark:text-emerald-400">
            The salary of Bihar BPSC teachers comprises three core pillars: Basic Pay Scale, Allowances (Dearness allowance, HRA, Medical allowance), and National Pension System (NPS) savings deduction.
          </p>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 mt-4 shadow-sm bg-white dark:bg-slate-900">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-xs sm:text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 font-extrabold">
                <tr>
                  <th className="px-4 py-3">Teacher Category</th>
                  <th className="px-4 py-3">Basic Pay</th>
                  <th className="px-4 py-3">DA (Current 50%)</th>
                  <th className="px-4 py-3">Avg HRA (8%)</th>
                  <th className="px-4 py-3">Approx Gross Salary</th>
                  <th className="px-4 py-3">NPS Deduction</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                <tr>
                  <td className="px-4 py-3 font-semibold text-slate-800 dark:text-white">Primary Teacher (1st to 5th)</td>
                  <td className="px-4 py-3">₹25,000</td>
                  <td className="px-4 py-3">₹12,500</td>
                  <td className="px-4 py-3">₹2,000</td>
                  <td className="px-4 py-3 font-semibold text-emerald-600">₹40,500</td>
                  <td className="px-4 py-3">₹3,750</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold text-slate-800 dark:text-white">Middle School Teacher (6th to 8th)</td>
                  <td className="px-4 py-3">₹28,000</td>
                  <td className="px-4 py-3">₹14,000</td>
                  <td className="px-4 py-3">₹2,240</td>
                  <td className="px-4 py-3 font-semibold text-emerald-600">₹45,240</td>
                  <td className="px-4 py-3">₹4,200</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold text-slate-800 dark:text-white">Secondary Teacher (9th to 10th)</td>
                  <td className="px-4 py-3">₹31,000</td>
                  <td className="px-4 py-3">₹15,500</td>
                  <td className="px-4 py-3">₹2,480</td>
                  <td className="px-4 py-3 font-semibold text-emerald-600">₹49,980</td>
                  <td className="px-4 py-3">₹4,650</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold text-slate-800 dark:text-white">Higher Secondary Teacher (11th & 12th)</td>
                  <td className="px-4 py-3">₹32,000</td>
                  <td className="px-4 py-3">₹16,000</td>
                  <td className="px-4 py-3">₹2,560</td>
                  <td className="px-4 py-3 font-semibold text-emerald-600">₹51,560</td>
                  <td className="px-4 py-3">₹4,800</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* DA rates & HRA Class structure explanation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/75 dark:border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <Percent className="w-4 h-4 text-emerald-500" />
              Dearness Allowance (DA) Updates in Bihar
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              Dearness Allowance is a compensatory living adjustment revised twice annually by government cabinets depending on CPI inflation indexes. As of 2026, the Bihar government implements <strong>50% DA rates</strong> matching Central cabinets. When DA rates exceed key milestones like 50%, specific associated allowance packages automatically scale up dynamically.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/75 dark:border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              House Rent Allowance (HRA) Classification
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">
              The HRA rate in Bihar depends on school location parameters:
            </p>
            <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1 font-medium list-disc pl-4">
              <li><strong>Class Z / Metro Patna:</strong> 16% of Basic Pay.</li>
              <li><strong>District Headquarters / Class Y Towns:</strong> 8% of Basic Pay.</li>
              <li><strong>Rural Block / Village schools:</strong> 6% or 4% of Basic pay.</li>
            </ul>
          </div>
        </div>

        {/* Frequently Asked Questions */}
        <section className="space-y-4">
          <h2 className="text-xl font-black text-slate-800 dark:text-white font-display tracking-tight flex items-center gap-2 mb-4">
            <HelpCircle className="w-5 h-5 text-emerald-500" />
            Frequently Asked Questions (FAQs)
          </h2>
          <div className="space-y-4 text-slate-600 dark:text-slate-300 font-medium">
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4.5 rounded-2xl shadow-sm">
              <h4 className="text-sm font-black text-slate-800 dark:text-white mb-1.5">Q1: What is the probation period salary of BPSC TRE teachers?</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Initially, hired teachers serve a 2-year probation period. During this period, the current complete salary (including complete basic pay, active dearness allowance, HRA, and fixed medical allowances) is paid fully, deducting only structural NPS and tax liabilities.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4.5 rounded-2xl shadow-sm">
              <h4 className="text-sm font-black text-slate-800 dark:text-white mb-1.5">Q2: How much salary deduction takes place under BPSC?</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                The primary deduction is 10% computed on (Basic Pay + DA Amount) credited to your PRAN account under the National Pension System (NPS). Additionally, there is a ₹150 Professional Tax deduction of Bihar State government and a small ₹30 central Group Insurance Scheme contribution.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4.5 rounded-2xl shadow-sm">
              <h4 className="text-sm font-black text-slate-800 dark:text-white mb-1.5">Q3: Do Bihar teachers get annual salary increments?</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Yes, BPSC teachers receive a standard 3% basic pay annual increments calculated based on the cumulative matrix line items of the 7th CPC schedule alongside matching dearness allowance adjustments twice a year.
              </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
