import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  Award, 
  HelpCircle, 
  DollarSign, 
  ArrowRight, 
  ShieldCheck, 
  BarChart3 as BarChartIcon, 
  PieChart as PieChartIcon, 
  Info, 
  Calendar, 
  Percent,
  TrendingDown,
  Share2,
  FileDown,
  Bookmark
} from "lucide-react";
import { getShareableLink } from "../types";
import { generatePDFReport } from "../utils/pdfGenerator";
import { paisaFetch } from "../api";

export default function SIPCalculator() {
  const [monthlySip, setMonthlySip] = useState<number>(10000);
  const [annualStepUp, setAnnualStepUp] = useState<number>(10); // Standard recommended 10% annual increase
  const [expectedReturn, setExpectedReturn] = useState<number>(12); // Standard equity mutual fund returns
  const [years, setYears] = useState<number | "">(15);
  const [inflationRate, setInflationRate] = useState<number>(6); // 6% average Indian inflation
  
  // Save / Load states
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

  // Load calculation listener
  useEffect(() => {
    const loadFromCalc = (calc: any) => {
      if (!calc || !calc.data) return;
      const data = calc.data;
      if (data.monthlySip) setMonthlySip(data.monthlySip);
      if (data.annualStepUp !== undefined) setAnnualStepUp(data.annualStepUp);
      if (data.expectedReturn !== undefined) setExpectedReturn(data.expectedReturn);
      if (data.years !== undefined) setYears(data.years);
      if (data.inflationRate !== undefined) setInflationRate(data.inflationRate);
    };

    // Check localStorage on mount
    const loadedStr = localStorage.getItem("paisa_loaded_calculation");
    if (loadedStr) {
      try {
        const calc = JSON.parse(loadedStr);
        if (calc && calc.type?.toLowerCase() === "sip") {
          loadFromCalc(calc);
          localStorage.removeItem("paisa_loaded_calculation");
        }
      } catch (err) {
        console.error("Error loading saved SIP calculation:", err);
      }
    }

    const handleLoad = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && (customEvent.detail.type.startsWith("sip"))) {
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
    try {
      const res = await paisaFetch("/api/locker/save", {
        method: "POST",
        body: JSON.stringify({
          title: `SIP Investment Plan (₹${monthlySip.toLocaleString()}/mo @ ${expectedReturn}%)`,
          type: "sip",
          data: {
            monthlySip,
            annualStepUp,
            expectedReturn,
            years,
            inflationRate,
            investedAmount,
            futureValue,
            wealthCreated,
            inflationAdjusted
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
  
  // Dashboard tab states
  const [visualizationTab, setVisualizationTab] = useState<"growth" | "breakdown">("growth");
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);

  // Year-by-year modeling for BOTH Normal (Flat) SIP and Step-Up SIP
  let totalInvestedNormal = 0;
  let totalValueNormal = 0;

  let totalInvestedStepUp = 0;
  let totalValueStepUp = 0;
  let currentMonthlySipStepUp = monthlySip;

  const yearRecords = [];
  const monthlyReturnRate = (expectedReturn / 100) / 12;

  const activeYears = years === "" ? 0 : years;
  for (let year = 1; year <= activeYears; year++) {
    let yearInvestedNormal = 0;
    let yearInvestedStepUp = 0;

    // Inside the year, calculate compound returns monthly
    // SIP paid at start of each month
    for (let month = 1; month <= 12; month++) {
      // Normal SIP
      yearInvestedNormal += monthlySip;
      totalValueNormal = (totalValueNormal + monthlySip) * (1 + monthlyReturnRate);

      // Step-Up SIP
      yearInvestedStepUp += currentMonthlySipStepUp;
      totalValueStepUp = (totalValueStepUp + currentMonthlySipStepUp) * (1 + monthlyReturnRate);
    }

    totalInvestedNormal += yearInvestedNormal;
    totalInvestedStepUp += yearInvestedStepUp;

    const wealthEarnedNormal = Math.max(0, Math.round(totalValueNormal - totalInvestedNormal));
    const wealthEarnedStepUp = Math.max(0, Math.round(totalValueStepUp - totalInvestedStepUp));

    yearRecords.push({
      year,
      // Step-Up SIP stats
      monthlySipStepUp: currentMonthlySipStepUp,
      investedStepUp: totalInvestedStepUp,
      futureValueStepUp: Math.round(totalValueStepUp),
      wealthEarnedStepUp,
      inflationAdjustedStepUp: Math.round(totalValueStepUp / Math.pow(1 + inflationRate / 100, year)),

      // Normal (Flat) SIP stats
      monthlySipNormal: monthlySip,
      investedNormal: totalInvestedNormal,
      futureValueNormal: Math.round(totalValueNormal),
      wealthEarnedNormal,
      inflationAdjustedNormal: Math.round(totalValueNormal / Math.pow(1 + inflationRate / 100, year)),
    });

    // Apply step-up for the next year
    currentMonthlySipStepUp = Math.round(currentMonthlySipStepUp * (1 + annualStepUp / 100));
  }

  // Final records for statistics cards
  const finalRecord = yearRecords[yearRecords.length - 1] || {
    investedStepUp: 0,
    futureValueStepUp: 0,
    wealthEarnedStepUp: 0,
    inflationAdjustedStepUp: 0,
    investedNormal: 0,
    futureValueNormal: 0,
    wealthEarnedNormal: 0,
    inflationAdjustedNormal: 0,
  };

  // Default display represents the selected Step-Up plan
  const investedAmount = finalRecord.investedStepUp;
  const wealthCreated = finalRecord.wealthEarnedStepUp;
  const futureValue = finalRecord.futureValueStepUp;
  const inflationAdjusted = finalRecord.inflationAdjustedStepUp;

  // Normal comparison
  const normalInvested = finalRecord.investedNormal;
  const normalFutureValue = finalRecord.futureValueNormal;
  const outperformanceGains = Math.max(0, futureValue - normalFutureValue);

  const multiplierRatio = (futureValue / (investedAmount || 1)).toFixed(1);

  // Helper formatting for localized Indian currency in graphs
  const formatIndianCompact = (num: number) => {
    if (num >= 10000000) {
      return `₹${(num / 10000000).toFixed(1).replace(/\.0$/, "")} Cr`;
    }
    if (num >= 100000) {
      return `₹${(num / 100000).toFixed(1).replace(/\.0$/, "")} L`;
    }
    if (num >= 1000) {
      return `₹${(num / 1000).toFixed(1).replace(/\.0$/, "")} K`;
    }
    return `₹${num}`;
  };

  // --- SVG Compounding Graph Dimensions ---
  const svgW = 500;
  const svgH = 220;
  const padLeft = 55;
  const padRight = 15;
  const padTop = 15;
  const padBottom = 35;

  const chartW = svgW - padLeft - padRight;
  const chartH = svgH - padTop - padBottom;

  // Maximum ceiling should count step-up value
  const maxVal = Math.max(futureValue, normalFutureValue, 1);
  const recCount = yearRecords.length;

  const colWidth = chartW / recCount;
  const yearGroupWidth = colWidth * 0.75;
  const barWidth = Math.max(1.5, (yearGroupWidth / 2) - 1);

  const getGroupCentroid = (index: number) => {
    return padLeft + (index + 0.5) * colWidth;
  };

  const getBarCoords = (val: number) => {
    const h = (val / maxVal) * chartH;
    return {
      height: Math.max(0.5, h),
      y: padTop + chartH - h
    };
  };

  // Determine grid levels
  const gridLevels = [0, 0.25, 0.5, 0.75, 1];

  // Specific selected year ratios for hover display
  const hoverRecord = hoveredYear !== null ? yearRecords[hoveredYear] : null;

  const shareToWhatsApp = async () => {
    const currentUrl = getShareableLink("sip", "/sip-calculator");
    const text = `📈 *Systematic Investment Plan (SIP) Projections*
Monthly SIP: ₹${monthlySip.toLocaleString("en-IN")}/mo
Step-Up SIP (with ${annualStepUp}% annual hike)
Tenure: ${years} Years @ ${expectedReturn}% p.a.
-----------------------------------
*Total Invested: ₹${investedAmount.toLocaleString("en-IN")}*
*Est. Future Value: ₹${futureValue.toLocaleString("en-IN")}*
*Wealth Created: ₹${wealthCreated.toLocaleString("en-IN")}*

Calculate your compounding potential instantly:`;

    if ((window as any).triggerNativeShare) {
      const handled = await (window as any).triggerNativeShare("SIP Projections", `${text} ${currentUrl}`, currentUrl);
      if (handled) return;
    }
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text + " " + currentUrl)}`, "_blank");
  };

  const downloadPDFReport = () => {
    generatePDFReport({
      title: "Systematic Investment Plan (SIP) Report",
      subtitle: "Compounding simulation comparing standard and step-up monthly investments",
      sections: [
        {
          title: "Investment Input Matrix",
          items: [
            { label: "Initial Monthly SIP Contribution", value: `INR ${monthlySip.toLocaleString("en-IN")}` },
            { label: "Annual Step-up Increment Rate", value: `${annualStepUp}%` },
            { label: "Expected Annual Returns (CAGR)", value: `${expectedReturn}%` },
            { label: "Investment Duration (Years)", value: `${years} Years` },
            { label: "Simulated Inflation Rate", value: `${inflationRate}%` }
          ]
        },
        {
          title: "Step-Up Compounding Projections (Recommended)",
          items: [
            { label: "Total Invested Principal", value: `INR ${investedAmount.toLocaleString("en-IN")}` },
            { label: "Estimated Wealth Created (Gains)", value: `INR ${wealthCreated.toLocaleString("en-IN")}` },
            { label: "Total Estimated Future Value", value: `INR ${futureValue.toLocaleString("en-IN")}` },
            { label: "Inflation-Adjusted Future Value", value: `INR ${inflationAdjusted.toLocaleString("en-IN")}` }
          ]
        },
        {
          title: "Traditional Flat SIP Projections (Comparative)",
          items: [
            { label: "Total Invested Principal (Flat)", value: `INR ${normalInvested.toLocaleString("en-IN")}` },
            { label: "Total Estimated Future Value (Flat)", value: `INR ${normalFutureValue.toLocaleString("en-IN")}` },
            { label: "Step-Up Bonus Gains (Outperformance)", value: `INR ${outperformanceGains.toLocaleString("en-IN")}` },
            { label: "Wealth Multiplier Ratio", value: `${multiplierRatio}x Principal` }
          ]
        }
      ],
      notes: [
        "A Step-Up SIP involves increasing your monthly contribution annually by a fixed percentage (e.g., 10%), helping you align investments with salary hikes.",
        "Inflation-adjusted purchasing power decreases the future value of your money. Real yield is simulated at standard rates.",
        "Projections do not account for capital gains taxes or exit loads; please review SEBI guidelines for mutual funds."
      ]
    });
  };

  return (
    <div id="sip-calculator-module" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 md:p-8 shadow-xs">
      {/* Header Banner */}
      <div className="border-b border-slate-100 dark:border-slate-800 pb-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 rounded-full">
            Step-Up SIP Planner
          </span>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mt-2 font-display">Systematic Investment Plan (SIP) Calculator</h2>
          <p className="text-slate-500 dark:text-slate-405 text-sm mt-1">
            Compare flat traditional SIPs with compounding Step-Up SIPs to trace pure capital gains over time.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
          <button
            onClick={saveToLocker}
            disabled={isSaving}
            className={`bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-bold text-xs px-4 py-2.5 rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all border-0 cursor-pointer ${isSaving ? "opacity-75 cursor-not-allowed" : ""}`}
          >
            <Bookmark className="w-4 h-4 text-white" />
            <span>{isSaving ? "Saving..." : saveStatus === "success" ? "Saved!" : "Save to Vault"}</span>
          </button>
          <button
            onClick={downloadPDFReport}
            className="bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 active:scale-95 text-white font-bold text-xs px-4 py-2.5 rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all border-0 cursor-pointer"
          >
            <FileDown className="w-4 h-4" />
            <span>Download PDF Report</span>
          </button>
          <button
            onClick={shareToWhatsApp}
            className="bg-[#25D366] hover:bg-[#20ba5a] active:scale-95 text-white font-bold text-xs px-4 py-2.5 rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all border-0 cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>Share on WhatsApp</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left column: Controls */}
        <div className="lg:col-span-5 bg-slate-50 dark:bg-slate-950 border border-slate-100/50 dark:border-slate-800/60 p-5 rounded-2xl space-y-6 text-sm">
          <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-1.5 border-b border-slate-200/50 dark:border-slate-800/60 pb-2">
            <TrendingUp className="w-4 h-4 text-emerald-500 dark:text-emerald-400" /> Inputs & Configurations
          </h3>

          <div>
            <div className="flex justify-between items-center text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
              <span>Initial Monthly Investment</span>
              <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-1.5 py-0.5 shadow-2xs">
                <span className="text-slate-400">₹</span>
                <input
                  type="number"
                  value={monthlySip || ""}
                  onChange={(e) => setMonthlySip(Number(e.target.value))}
                  className="w-20 bg-transparent text-right font-bold text-emerald-600 dark:text-emerald-400 focus:outline-none focus:ring-0 border-0 p-0 text-xs"
                />
              </div>
            </div>
            <input
              type="range"
              min="1000"
              max="200000"
              step="1"
              value={monthlySip}
              onChange={(e) => setMonthlySip(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-505 mt-0.5">
              <span>₹1,000</span>
              <span>₹1,00,000</span>
              <span>₹2,00,000</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
              <span>Annual SIP Step-Up % (Increase each year)</span>
              <div className="flex items-center gap-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-1.5 py-0.5 shadow-2xs">
                <input
                  type="number"
                  value={annualStepUp || ""}
                  onChange={(e) => setAnnualStepUp(Number(e.target.value))}
                  className="w-10 bg-transparent text-right font-bold text-emerald-600 dark:text-emerald-400 focus:outline-none focus:ring-0 border-0 p-0 text-xs"
                />
                <span className="text-slate-400">%</span>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              step="1"
              value={annualStepUp}
              onChange={(e) => setAnnualStepUp(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-505 mt-0.5">
              <span>0% (Flat SIP)</span>
              <span>10% Recommended (Std)</span>
              <span>30% Cap</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
              <span>Expected Annual Return (CAGR %)</span>
              <div className="flex items-center gap-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-1.5 py-0.5 shadow-2xs">
                <input
                  type="number"
                  step="0.1"
                  value={expectedReturn || ""}
                  onChange={(e) => setExpectedReturn(Number(e.target.value))}
                  className="w-10 bg-transparent text-right font-bold text-emerald-600 dark:text-emerald-400 focus:outline-none focus:ring-0 border-0 p-0 text-xs"
                />
                <span className="text-slate-400">%</span>
              </div>
            </div>
            <input
              type="range"
              min="5"
              max="25"
              step="0.1"
              value={expectedReturn}
              onChange={(e) => setExpectedReturn(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-505 mt-0.5">
              <span>5% (Debt funds)</span>
              <span>12%-15% (Equity Index)</span>
              <span>25% (High Cap)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Duration (Years)</label>
              <input
                type="number"
                min="1"
                max="40"
                value={years}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "") {
                    setYears("");
                  } else {
                    const parsed = parseInt(val, 10);
                    setYears(isNaN(parsed) ? "" : Math.min(40, Math.max(1, parsed)));
                  }
                }}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Inflation Rate (%)</label>
              <input
                type="number"
                min="0"
                max="15"
                value={inflationRate}
                onChange={(e) => setInflationRate(Math.min(15, Math.max(0, Number(e.target.value))))}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
              />
            </div>
          </div>

          {outperformanceGains > 0 && (
            <div className="bg-amber-50/70 dark:bg-amber-955/20 border border-amber-100 dark:border-amber-900/60 rounded-xl p-3.5 flex gap-2.5 text-amber-900 dark:text-amber-450 text-xs">
              <Award className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Step-Up Bonus Generated!</strong>
                <p className="text-[11px] text-amber-800/90 dark:text-amber-300/80 mt-0.5">
                  Your customized {annualStepUp}% step-up raises your total corpus by <span className="font-mono font-bold text-amber-950 dark:text-amber-300">₹{outperformanceGains.toLocaleString("en-IN")}</span> compared to standard flat investing.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right column: Outputs, dynamic graphs & details */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          
          {/* Key outputs row card stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/85 rounded-xl">
              <span className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-505 uppercase font-bold tracking-wider block">Total Invested</span>
              <span className="block text-md sm:text-lg font-bold text-slate-800 dark:text-slate-200 mt-1 font-mono">₹{investedAmount.toLocaleString("en-IN")}</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">with {annualStepUp}% annual increases</span>
            </div>

            <div className="p-4 bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-100/50 dark:border-emerald-900/40 rounded-xl">
              <span className="text-[10px] sm:text-xs text-emerald-600 dark:text-emerald-450 uppercase font-bold tracking-wider block">Wealth Created</span>
              <span className="block text-md sm:text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1 font-mono">+₹{wealthCreated.toLocaleString("en-IN")}</span>
              <span className="text-[10px] text-emerald-500/80 dark:text-emerald-400/80 font-bold block mt-0.5">Pure capital expansion</span>
            </div>

            <div className="p-4 bg-bhagwa-50/40 dark:bg-bhagwa-950/15 border border-bhagwa-100/50 dark:border-bhagwa-900/30 rounded-xl">
              <span className="text-[10px] sm:text-xs text-bhagwa-600 dark:text-bhagwa-400 uppercase font-bold tracking-wider font-display block">Est. Future Value</span>
              <span className="block text-lg sm:text-xl font-black text-bhagwa-750 dark:text-bhagwa-300 mt-1 font-mono">₹{futureValue.toLocaleString("en-IN")}</span>
              <span className="text-[10px] text-bhagwa-500/80 dark:text-bhagwa-450 mt-0.5 block">
                ≒ ₹{inflationAdjusted.toLocaleString("en-IN")} (Real Value)
              </span>
            </div>
          </div>

          {/* Visual Interactive Charting Workspace */}
          <div className="border border-slate-100 dark:border-slate-800/80 rounded-2xl p-4 space-y-4">
            
            {/* Toggler Tabs & Legend Box */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-3 gap-3">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setVisualizationTab("growth")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    visualizationTab === "growth"
                      ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 px-3.5"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  <BarChartIcon className="w-3.5 h-3.5" />
                  <span>Interactive Bar Chart</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVisualizationTab("breakdown")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    visualizationTab === "breakdown"
                      ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 px-3.5"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  <PieChartIcon className="w-3.5 h-3.5" />
                  <span>Breakdown Donut</span>
                </button>
              </div>

              <div className="text-[10px] text-slate-400 dark:text-slate-505 font-bold uppercase tracking-wider flex items-center gap-1 bg-slate-50 dark:bg-slate-950/60 px-2.5 py-1 rounded-md self-start">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>{years || 0} Yr Timeline</span>
              </div>
            </div>

            {/* Custom Interactive Legend (Visible in growth bar chart tab) */}
            {visualizationTab === "growth" && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-medium border-b border-slate-50 dark:border-slate-850 pb-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-emerald-500 rounded-xs block shrink-0" />
                  <span className="text-slate-600 dark:text-slate-300 font-bold">Step-Up Growth</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-emerald-300 dark:bg-emerald-800 block shrink-0 rounded-xs" />
                  <span className="text-slate-600 dark:text-slate-350">Step-Up Capital</span>
                </div>
                <div className="flex items-center gap-1.5 font-normal">
                  <span className="w-3 h-3 bg-slate-405 dark:bg-slate-650 block shrink-0 rounded-xs" />
                  <span className="text-slate-550 dark:text-slate-350 font-bold">Normal Growth</span>
                </div>
                <div className="flex items-center gap-1.5 font-normal">
                  <span className="w-3 h-3 bg-slate-300 dark:bg-slate-700 block shrink-0 rounded-xs" />
                  <span className="text-slate-500 dark:text-slate-400">Normal Capital</span>
                </div>
              </div>
            )}

            {/* Rendering Tab content */}
            {visualizationTab === "growth" ? (
              <div id="compounding-wave-view" className="space-y-3 relative">
                {/* Embedded SVG chart */}
                <div className="relative w-full overflow-hidden bg-slate-50/30 dark:bg-slate-950/10 rounded-xl border border-slate-50/50 dark:border-slate-850/40 p-2">
                  <svg 
                    viewBox={`0 0 ${svgW} ${svgH}`} 
                    className="w-full h-auto overflow-visible select-none"
                  >
                    {/* Horizontal grid guide levels */}
                    {gridLevels.map((lvl, index) => {
                      const val = maxVal * lvl;
                      const y = padTop + chartH - lvl * chartH;
                      return (
                        <g key={index} className="opacity-70">
                          <line 
                            x1={padLeft} 
                            y1={y} 
                            x2={padLeft + chartW} 
                            y2={y} 
                            className="stroke-slate-100 dark:stroke-slate-800" 
                            strokeDasharray="4 4" 
                            strokeWidth="1"
                          />
                          <text 
                            x={padLeft - 6} 
                            y={y + 3} 
                            className="text-[9px] font-mono fill-slate-400 dark:fill-slate-500 font-semibold" 
                            textAnchor="end"
                          >
                            {formatIndianCompact(val)}
                          </text>
                        </g>
                      );
                    })}

                    {/* soft hover background indicator segment (rendered behind bars) */}
                    {hoveredYear !== null && yearRecords[hoveredYear] && (
                      <rect
                        x={getGroupCentroid(hoveredYear) - colWidth / 2 + 1}
                        y={padTop}
                        width={colWidth - 2}
                        height={chartH}
                        className="fill-slate-100/60 dark:fill-slate-800/25 pointer-events-none"
                        rx="4"
                      />
                    )}

                    {/* Stacked Grouped Columns representing comparative savings and compounding growth */}
                    {recCount > 0 && yearRecords.map((r, idx) => {
                      const groupX = getGroupCentroid(idx);
                      
                      // Coordinates for Normal SIP stacked bar (Left Bar)
                      const normalX = groupX - barWidth - 0.75;
                      const normalInvestedCoords = getBarCoords(r.investedNormal);
                      const normalTotalCoords = getBarCoords(r.futureValueNormal);
                      const normalGrowthHeight = Math.max(0, normalInvestedCoords.y - normalTotalCoords.y);
                      
                      // Coordinates for Step-Up SIP stacked bar (Right Bar)
                      const stepUpX = groupX + 0.75;
                      const stepUpInvestedCoords = getBarCoords(r.investedStepUp);
                      const stepUpTotalCoords = getBarCoords(r.futureValueStepUp);
                      const stepUpGrowthHeight = Math.max(0, stepUpInvestedCoords.y - stepUpTotalCoords.y);

                      const isHovered = hoveredYear === idx;

                      return (
                        <g key={idx} className={`transition-all duration-200 ${isHovered ? "opacity-100" : "opacity-90 hover:opacity-100"}`}>
                          {/* Normal Bar: Capital (Bottom) */}
                          <rect
                            x={normalX}
                            y={normalInvestedCoords.y}
                            width={barWidth}
                            height={normalInvestedCoords.height}
                            className={`${isHovered ? "fill-slate-400 dark:fill-slate-650" : "fill-slate-300 dark:fill-slate-700"} transition-colors duration-200`}
                            rx="1"
                          />
                          {/* Normal Bar: Growth (Top) */}
                          {normalGrowthHeight > 0 && (
                            <rect
                              x={normalX}
                              y={normalTotalCoords.y}
                              width={barWidth}
                              height={normalGrowthHeight}
                              className={`${isHovered ? "fill-slate-500 dark:fill-slate-550" : "fill-slate-400/85 dark:fill-slate-600/85"} transition-colors duration-200`}
                              rx="1"
                            />
                          )}

                          {/* Step-Up Bar: Capital (Bottom) */}
                          <rect
                            x={stepUpX}
                            y={stepUpInvestedCoords.y}
                            width={barWidth}
                            height={stepUpInvestedCoords.height}
                            className={`${isHovered ? "fill-emerald-400 dark:fill-emerald-700" : "fill-emerald-300 dark:fill-emerald-800"} transition-colors duration-200`}
                            rx="1"
                          />
                          {/* Step-Up Bar: Growth (Top) */}
                          {stepUpGrowthHeight > 0 && (
                            <rect
                              x={stepUpX}
                              y={stepUpTotalCoords.y}
                              width={barWidth}
                              height={stepUpGrowthHeight}
                              className={`${isHovered ? "fill-emerald-600 dark:fill-emerald-300" : "fill-emerald-500 dark:fill-emerald-400"} transition-colors duration-200`}
                              rx="1"
                            />
                          )}
                        </g>
                      );
                    })}

                    {/* X Axis Years Text labels */}
                    {recCount > 1 && (() => {
                      const xLabelIndices: number[] = [];
                      const step = Math.max(1, Math.ceil(recCount / 5)); // cap around 5 year blocks
                      for (let i = 0; i < recCount; i += step) {
                        xLabelIndices.push(i);
                      }
                      // force last one
                      if (!xLabelIndices.includes(recCount - 1)) {
                        xLabelIndices.push(recCount - 1);
                      }

                      return xLabelIndices.map((idx) => {
                        const r = yearRecords[idx];
                        if (!r) return null;
                        return (
                          <text
                            key={idx}
                            x={getGroupCentroid(idx)}
                            y={padTop + chartH + 16}
                            className="text-[9px] fill-slate-400 dark:fill-slate-500 font-bold"
                            textAnchor="middle"
                          >
                            Yr {r.year}
                          </text>
                        );
                      });
                    })()}

                    {/* Transparent hover catcher segments */}
                    {yearRecords.map((r, idx) => {
                      const currentX = getGroupCentroid(idx);
                      return (
                        <rect
                          key={idx}
                          x={currentX - colWidth / 2}
                          y={padTop}
                          width={colWidth}
                          height={chartH}
                          fill="transparent"
                          className="cursor-crosshair pointer-events-auto"
                          onMouseEnter={() => setHoveredYear(idx)}
                          onMouseMove={() => setHoveredYear(idx)}
                          onMouseLeave={() => setHoveredYear(null)}
                        />
                      );
                    })}
                  </svg>
                </div>

                {/* Highly Scannable hover side-by-side comparative panel */}
                <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 transition-all text-xs flex flex-wrap flex-col sm:flex-row sm:items-center sm:justify-between gap-3 min-h-[50px]">
                  {hoverRecord ? (
                    <>
                      <div className="space-y-0.5">
                        <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-400 font-extrabold rounded text-[10px] inline-block mb-1">
                          Year {hoverRecord.year} comparison
                        </span>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          Step-Up saving: <span className="font-bold text-emerald-600 dark:text-emerald-405 font-mono">₹{hoverRecord.monthlySipStepUp.toLocaleString("en-IN")}/mo</span> VS Flat: <span className="font-semibold text-slate-600 dark:text-slate-300 font-mono">₹{hoverRecord.monthlySipNormal.toLocaleString("en-IN")}/mo</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-6 grow sm:grow-0 justify-between sm:justify-end border-t sm:border-t-0 border-slate-200/50 dark:border-slate-800 pt-2 sm:pt-0">
                        {/* Flat Statistics */}
                        <div>
                          <span className="text-slate-405 dark:text-slate-500 text-[9px] uppercase font-bold block">Normal Traditional</span>
                          <div className="space-y-0.5">
                            <span className="text-[11px] font-mono text-slate-500 block">Saved: ₹{hoverRecord.investedNormal.toLocaleString("en-IN")}</span>
                            <span className="text-[12px] font-mono font-bold text-slate-700 dark:text-slate-300 block">Value: ₹{hoverRecord.futureValueNormal.toLocaleString("en-IN")}</span>
                          </div>
                        </div>

                        {/* Step-Up Statistics */}
                        <div>
                          <span className="text-emerald-555 dark:text-emerald-400 text-[9px] uppercase font-black block">Step-Up Future-Proof</span>
                          <div className="space-y-0.5">
                            <span className="text-[11px] font-mono text-emerald-500 block">Saved: ₹{hoverRecord.investedStepUp.toLocaleString("en-IN")}</span>
                            <span className="text-[12px] font-mono font-black text-emerald-600 dark:text-emerald-400 block">Value: ₹{hoverRecord.futureValueStepUp.toLocaleString("en-IN")}</span>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-slate-400 dark:text-slate-505 flex items-center gap-1.5 py-1">
                      <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Hover or drag over the interactive bar chart to inspect side-by-side returns and outperformance gains!</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Breakdown Donut Visual Layout
              <div id="compounding-breakdown-view" className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center py-2">
                <div className="relative flex items-center justify-center">
                  
                  {/* Concentric Circle Dual Arc Donut */}
                  <svg viewBox="0 0 160 160" className="w-36 h-36 select-none overflow-visible">
                    {/* Inner Track (Total Invested Ratio relative to Future value) */}
                    <circle 
                      cx="80" 
                      cy="80" 
                      r="40" 
                      fill="transparent" 
                      className="stroke-slate-100 dark:stroke-slate-800" 
                      strokeWidth="10" 
                    />
                    <circle 
                      cx="80" 
                      cy="80" 
                      r="40" 
                      fill="transparent" 
                      className="stroke-slate-400 dark:stroke-slate-500 transition-all duration-700" 
                      strokeWidth="10" 
                      strokeDasharray="251.3"
                      strokeDashoffset={251.3 - (251.3 * (investedAmount / maxVal))}
                      transform="rotate(-90 80 80)"
                      strokeLinecap="round"
                    />

                    {/* Outer Track (Pure Compound Gains Ratio relative to Future value) */}
                    <circle 
                      cx="80" 
                      cy="80" 
                      r="54" 
                      fill="transparent" 
                      className="stroke-slate-100 dark:stroke-slate-800" 
                      strokeWidth="10" 
                    />
                    <circle 
                      cx="80" 
                      cy="80" 
                      r="54" 
                      fill="transparent" 
                      className="stroke-emerald-500 dark:stroke-emerald-400 transition-all duration-700" 
                      strokeWidth="10" 
                      strokeDasharray="339.3"
                      strokeDashoffset={339.3 - (339.3 * (wealthCreated / maxVal))}
                      transform="rotate(-90 80 80)"
                      strokeLinecap="round"
                    />
                  </svg>

                  {/* Centered multi status value */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-widest leading-none">Compounded</span>
                    <span className="text-xl font-black text-slate-800 dark:text-white font-mono leading-none my-0.5">{multiplierRatio}x</span>
                    <span className="text-[10px] text-emerald-500 dark:text-emerald-400 font-bold block leading-none">Multiplier</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Compounding Distribution</h4>
                  
                  <div className="space-y-2 text-xs">
                    <div className="flex items-start gap-2.5 p-2 bg-slate-50 dark:bg-slate-950 rounded-lg">
                      <span className="w-3 h-3 rounded-full bg-slate-400 dark:bg-slate-500 shrink-0 mt-0.5" />
                      <div>
                        <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-350">
                          <span>Out-of-Pocket Principle</span>
                          <span className="text-[11px] text-slate-450 font-bold font-mono">({Math.round((investedAmount / maxVal) * 100)}%)</span>
                        </div>
                        <span className="font-mono text-slate-500 block">₹{investedAmount.toLocaleString("en-IN")}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 p-2 bg-emerald-50/30 dark:bg-emerald-950/10 rounded-lg">
                      <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <div className="flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-450">
                          <span>Compounded Growth Gains</span>
                          <span className="text-[11px] font-bold font-mono text-emerald-500 dark:text-emerald-400">({Math.round((wealthCreated / maxVal) * 100)}%)</span>
                        </div>
                        <span className="font-mono text-emerald-600 dark:text-emerald-400 block font-semibold text-left">₹{wealthCreated.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed italic">
                    By implementing an annual {annualStepUp}% step-up, compound elements grow to constitute the absolute majority of your accumulated wealth over the timeline!
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Visual Progress Bar Ratio Component indicator */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-505 dark:text-slate-400 font-semibold">
              <span>Invested Capital Ratio</span>
              <span>Compounded Interest Ratio</span>
            </div>
            <div className="w-full h-4 bg-slate-100 dark:bg-slate-955 rounded-full overflow-hidden flex border border-slate-200/20 dark:border-slate-800">
              <div 
                className="bg-slate-400 dark:bg-slate-500 h-full text-[10px] font-bold text-white flex items-center justify-center transition-all duration-700" 
                style={{ width: `${Math.round((investedAmount / (futureValue || 1)) * 100)}%` }}
              >
                {Math.round((investedAmount / (futureValue || 1)) * 100)}%
              </div>
              <div 
                className="bg-emerald-500 h-full text-[10px] font-bold text-white flex items-center justify-center transition-all duration-700"
                style={{ width: `${Math.round((wealthCreated / (futureValue || 1)) * 100)}%` }}
              >
                {Math.round((wealthCreated / (futureValue || 1)) * 100)}%
              </div>
            </div>
          </div>

          {/* Annual growth table breakdown */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-455 dark:text-slate-500 mb-2.5">Year-on-Year Comparative Growth Grid</h4>
            <div className="max-h-48 overflow-y-auto border border-slate-100 dark:border-slate-800/80 rounded-xl">
              <table className="w-full text-xs text-left text-slate-500 dark:text-slate-400 divide-y divide-slate-100 dark:divide-slate-800">
                <thead className="bg-slate-50 dark:bg-slate-950 text-[10px] uppercase font-bold text-slate-600 dark:text-slate-400 sticky top-0 z-10 border-b border-slate-100 dark:border-slate-850">
                  <tr>
                    <th className="px-4 py-2 bg-slate-50 dark:bg-slate-950">Year</th>
                    <th className="px-4 py-2 bg-slate-50 dark:bg-slate-950 text-right font-bold">Step-Up Corpus</th>
                    <th className="px-4 py-2 bg-slate-50 dark:bg-slate-950 text-right">Normal Corpus</th>
                    <th className="px-4 py-2 text-right bg-slate-50 dark:bg-slate-950">Step-Up Saved</th>
                    <th className="px-4 py-2 text-right bg-slate-50 dark:bg-slate-950">Outperformance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-900/40 font-mono">
                  {yearRecords.map((rec) => {
                    const diff = Math.max(0, rec.futureValueStepUp - rec.futureValueNormal);
                    return (
                      <tr key={rec.year} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 text-[11px]">
                        <td className="px-4 py-2.5 font-bold font-sans text-slate-700 dark:text-slate-350">Yr {rec.year}</td>
                        <td className="px-4 py-2.5 text-right font-bold text-emerald-600 dark:text-emerald-400">₹{rec.futureValueStepUp.toLocaleString("en-IN")}</td>
                        <td className="px-4 py-2.5 text-right text-slate-600 dark:text-slate-400">₹{rec.futureValueNormal.toLocaleString("en-IN")}</td>
                        <td className="px-4 py-2.5 text-right text-slate-455 dark:text-slate-500">₹{rec.investedStepUp.toLocaleString("en-IN")}</td>
                        <td className="px-4 py-2.5 text-right font-extrabold text-amber-650 dark:text-amber-500">
                          {diff > 0 ? `+₹${diff.toLocaleString("en-IN")}` : "₹0"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* SEO Explanation, FAQs, and Internal Links Section */}
          <div className="mt-12 pt-10 border-t border-slate-100 dark:border-slate-850 space-y-10">
            {/* Explanation Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-extrabold text-slate-800 font-display">
                How Does Compounding Work in a Systematic Investment Plan (SIP)?
              </h3>
              <p className="text-xs leading-relaxed text-slate-650">
                A Systematic Investment Plan (SIP) is a disciplined method of investing a fixed sum of money at regular intervals (typically monthly) into mutual funds. Rather than attempting to time the volatile market, SIP allows you to accumulate units over time, averaging your purchase costs (Rupee Cost Averaging).
              </p>
              <p className="text-xs leading-relaxed text-slate-655">
                The absolute cornerstone of long-term SIP success is the **Power of Compounding**. As your mutual fund investments generate returns, those returns are reinvested to purchase more units, which then earn further returns. Over a 15 to 30-year horizon, the compound interest generated begins to exponentially surpass the out-of-pocket principal you contributed.
              </p>
              
              {/* Dynamic Step-Up SIP formula callout */}
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-5 space-y-2 mt-4">
                <span className="text-[10px] font-black tracking-widest text-emerald-700 font-mono block uppercase">Compound Interest Math formula</span>
                <span className="block text-sm font-bold text-slate-800">
                  FV = P &times; [ ( (1 + i)^n - 1 ) / i ] &times; (1 + i)
                </span>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Where <strong className="text-slate-700">P</strong> represents your periodic contribution, <strong className="text-slate-700">i</strong> represents the periodic rate of return, and <strong className="text-slate-700">n</strong> represents the total number of periods. For a **Step-Up SIP**, your contributor variable <strong className="text-emerald-700">P</strong> increases by a defined percentage (e.g. 5% or 10%) every 12 months, allowing your portfolio compounding to multiply at dual speeds.
                </p>
              </div>
            </div>

            {/* Structured FAQ Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-extrabold text-slate-800 font-display">
                Frequently Asked Key Questions (FAQs)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-55/40 hover:bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-2 transition-all">
                  <span className="block font-bold text-xs text-indigo-950 font-sans">
                    Q1: What is a Step-Up SIP and why should I use it?
                  </span>
                  <p className="text-[11px] leading-relaxed text-slate-600">
                    A Step-Up SIP allows you to automatically increase your monthly investment amount by a fixed percentage or absolute rupee amount every year (e.g., in line with salary hikes). This small annual increment dramatically accelerates your path to a ₹1 Crore corpus by future-proofing your wealth.
                  </p>
                </div>

                <div className="bg-slate-55/40 hover:bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-2 transition-all">
                  <span className="block font-bold text-xs text-indigo-950 font-sans">
                    Q2: How accurate are mutual fund SIP projections?
                  </span>
                  <p className="text-[11px] leading-relaxed text-slate-600">
                    Calculations are based on fixed compounding models matching selected interest rates. Real mutual funds generate variable daily returns depending on market conditions, but a historical 10-15 year scale has safely averaged 12% in major diversified equity indices in India.
                  </p>
                </div>

                <div className="bg-slate-55/40 hover:bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-2 transition-all">
                  <span className="block font-bold text-xs text-indigo-950 font-sans">
                    Q3: Does Paisa Blueprint charge any fees?
                  </span>
                  <p className="text-[11px] leading-relaxed text-slate-600">
                    No. Paisa Blueprint is an independent, 100% free-to-use software suite designed strictly for educational calculations. We do not store or sell your financial data.
                  </p>
                </div>

                <div className="bg-slate-55/40 hover:bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-2 transition-all">
                  <span className="block font-bold text-xs text-indigo-950 font-sans">
                    Q4: Can government employees invest in Equity SIPs?
                  </span>
                  <p className="text-[11px] leading-relaxed text-slate-600">
                    Yes. Under CCS (Conduct) rules, government employees and public school teachers are permitted to invest regular savings into mutual funds or direct equity portfolios, provided they avoid active, high-frequency day-trading or speculation.
                  </p>
                </div>
              </div>
            </div>

            {/* Internal Links/Related Calculators Area */}
            <div className="bg-indigo-50/30 border border-indigo-100 rounded-3xl p-6 space-y-4">
              <span className="text-[9px] font-black uppercase text-indigo-600 tracking-widest font-mono block">
                Related Salaried Planners &amp; Checklists
              </span>
              <h4 className="text-xs font-extrabold text-slate-800">
                Continue organizing your portfolio blueprint with these related calculators:
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs leading-none">
                <a 
                  href="/salary-calculator" 
                  className="bg-white border border-slate-150 p-3 rounded-xl hover:bg-slate-50 hover:border-indigo-400 text-center font-bold text-slate-700 transition-all block"
                >
                  Salary Calculator
                </a>
                <a 
                  href="/nps-calculator" 
                  className="bg-white border border-slate-150 p-3 rounded-xl hover:bg-slate-50 hover:border-indigo-400 text-center font-bold text-slate-700 transition-all block"
                >
                  NPS Tax Saver
                </a>
                <a 
                  href="/pension-calculator" 
                  className="bg-white border border-slate-150 p-3 rounded-xl hover:bg-slate-50 hover:border-indigo-400 text-center font-bold text-slate-700 transition-all block"
                >
                  Pension Retirement
                </a>
                <a 
                  href="/da-calculator" 
                  className="bg-white border border-slate-150 p-3 rounded-xl hover:bg-slate-50 hover:border-indigo-400 text-center font-bold text-slate-700 transition-all block"
                >
                  DA Allowance
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
