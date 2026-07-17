import React, { useState, useEffect } from "react";
import { 
  ShieldAlert, 
  HelpCircle, 
  Undo2, 
  Calculator, 
  ArrowUpRight, 
  ExternalLink,
  BookOpen,
  PlayCircle,
  FileSpreadsheet,
  PieChart,
  Grid,
  Info,
  Share2,
  FileDown,
  Bookmark
} from "lucide-react";
import { getShareableLink } from "../types";
import { generatePDFReport } from "../utils/pdfGenerator";
import { paisaFetch } from "../api";

export default function PensionCalculator() {
  // Subscriber Details
  const [subscriberSector, setSubscriberSector] = useState<"Government" | "Non-Government">("Government");
  const [scheme, setScheme] = useState<string>("Central Government");
  const [dob, setDob] = useState<string>("1996-01-01"); // Default approx age 30
  const [calculatedAge, setCalculatedAge] = useState<number>(30);

  // Financial inputs (Slider + manual input support!)
  const [existingCorpus, setExistingCorpus] = useState<number>(50000);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(5000);
  const [contributionAge, setContributionAge] = useState<number>(60);
  const [withdrawalAge, setWithdrawalAge] = useState<number>(60);
  const [annualIncrease, setAnnualIncrease] = useState<number>(5); // % annual increase in contribution
  const [annuityRatio, setAnnuityRatio] = useState<number>(40); // % of corpus to buy annuity (min 40%)
  const [expectedAnnuityRate, setExpectedAnnuityRate] = useState<number>(6.75); // Annuity return rate
  const [expectedGrowthRate, setExpectedGrowthRate] = useState<number>(10); // Accumulation phase return rate

  // String states for seamless text input typing without snapping issues
  const [existingCorpusStr, setExistingCorpusStr] = useState<string>("50000");
  const [monthlyContributionStr, setMonthlyContributionStr] = useState<string>("5000");
  const [contributionAgeStr, setContributionAgeStr] = useState<string>("60");
  const [withdrawalAgeStr, setWithdrawalAgeStr] = useState<string>("60");
  const [annualIncreaseStr, setAnnualIncreaseStr] = useState<string>("5");
  const [annuityRatioStr, setAnnuityRatioStr] = useState<string>("40");
  const [expectedAnnuityRateStr, setExpectedAnnuityRateStr] = useState<string>("6.75");
  const [expectedGrowthRateStr, setExpectedGrowthRateStr] = useState<string>("10");

  // Results state
  const [results, setResults] = useState({
    totalContribution: 0,
    accumulationYears: 0,
    totalAccumulatedCorpus: 0,
    lumpSumWithdrawn: 0,
    annuityCorpus: 0,
    expectedMonthlyPension: 0,
    growthRateUsed: 10
  });

  // Save / Load states
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

  // Load calculation listener
  useEffect(() => {
    const loadFromCalc = (calc: any) => {
      if (!calc || !calc.data) return;
      const data = calc.data;
      if (data.subscriberSector) setSubscriberSector(data.subscriberSector);
      if (data.scheme) setScheme(data.scheme);
      if (data.dob) setDob(data.dob);
      if (data.existingCorpus) {
        setExistingCorpus(data.existingCorpus);
        setExistingCorpusStr(String(data.existingCorpus));
      }
      if (data.monthlyContribution) {
        setMonthlyContribution(data.monthlyContribution);
        setMonthlyContributionStr(String(data.monthlyContribution));
      }
      if (data.contributionAge) {
        setContributionAge(data.contributionAge);
        setContributionAgeStr(String(data.contributionAge));
      }
      if (data.withdrawalAge) {
        setWithdrawalAge(data.withdrawalAge);
        setWithdrawalAgeStr(String(data.withdrawalAge));
      }
      if (data.annualIncrease) {
        setAnnualIncrease(data.annualIncrease);
        setAnnualIncreaseStr(String(data.annualIncrease));
      }
      if (data.annuityRatio) {
        setAnnuityRatio(data.annuityRatio);
        setAnnuityRatioStr(String(data.annuityRatio));
      }
      if (data.expectedAnnuityRate) {
        setExpectedAnnuityRate(data.expectedAnnuityRate);
        setExpectedAnnuityRateStr(String(data.expectedAnnuityRate));
      }
      if (data.expectedGrowthRate) {
        setExpectedGrowthRate(data.expectedGrowthRate);
        setExpectedGrowthRateStr(String(data.expectedGrowthRate));
      }
    };

    // Check localStorage on mount
    const loadedStr = localStorage.getItem("paisa_loaded_calculation");
    if (loadedStr) {
      try {
        const calc = JSON.parse(loadedStr);
        if (calc && calc.type?.toLowerCase() === "pension") {
          loadFromCalc(calc);
          localStorage.removeItem("paisa_loaded_calculation");
        }
      } catch (err) {
        console.error("Error loading saved pension calculation:", err);
      }
    }

    const handleLoad = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && (customEvent.detail.type?.startsWith("pension"))) {
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
          title: `NPS Pension Plan (${subscriberSector} Sector - ₹${monthlyContribution.toLocaleString()}/mo)`,
          type: "pension",
          data: {
            subscriberSector,
            scheme,
            dob,
            existingCorpus,
            monthlyContribution,
            contributionAge,
            withdrawalAge,
            annualIncrease,
            annuityRatio,
            expectedAnnuityRate,
            expectedGrowthRate,
            totalContribution: results.totalContribution,
            totalCorpus: results.totalAccumulatedCorpus,
            lumpSumWithdrawn: results.lumpSumWithdrawn,
            annuityCorpus: results.annuityCorpus,
            monthlyPension: results.expectedMonthlyPension,
            gratuity: 0 // backward-compatible
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

  // Calculate age based on Date of Birth
  useEffect(() => {
    if (!dob) return;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    // Min age in NPS is 18, so cap nicely
    setCalculatedAge(Math.max(18, age));
  }, [dob]);

  // Handle constraints: Withdrawal age must be >= contribution age, etc.
  useEffect(() => {
    if (withdrawalAge < contributionAge) {
      setWithdrawalAge(contributionAge);
      setWithdrawalAgeStr(contributionAge.toString());
    }
  }, [contributionAge, withdrawalAge]);

  useEffect(() => {
    if (contributionAge < calculatedAge) {
      const targetAge = Math.min(85, Math.max(calculatedAge + 1, 60));
      setContributionAge(targetAge);
      setContributionAgeStr(targetAge.toString());
    }
  }, [calculatedAge, contributionAge]);

  const handleReset = () => {
    setSubscriberSector("Government");
    setScheme("Central Government");
    setDob("1996-01-01");
    setExistingCorpus(50000);
    setExistingCorpusStr("50000");
    setMonthlyContribution(5000);
    setMonthlyContributionStr("5000");
    setContributionAge(60);
    setContributionAgeStr("60");
    setWithdrawalAge(60);
    setWithdrawalAgeStr("60");
    setAnnualIncrease(5);
    setAnnualIncreaseStr("5");
    setAnnuityRatio(40);
    setAnnuityRatioStr("40");
    setExpectedAnnuityRate(6.75);
    setExpectedAnnuityRateStr("6.75");
    setExpectedGrowthRate(10);
    setExpectedGrowthRateStr("10");
  };

  const calculatePension = () => {
    const yearsToContribute = Math.max(0, contributionAge - calculatedAge);
    let totalPaid = 0;
    let accumulatedCorpus = existingCorpus;
    const monthlyRate = expectedGrowthRate / 100 / 12;

    // Simulate contribution month-by-month to accurately handle Expected growth rate and annual step-up increment
    let currentMonthlyContr = monthlyContribution;

    for (let year = 1; year <= yearsToContribute; year++) {
      for (let month = 1; month <= 12; month++) {
        // Add monthly contribution and compound at accumulation growth rate
        accumulatedCorpus = (accumulatedCorpus + currentMonthlyContr) * (1 + monthlyRate);
        totalPaid += currentMonthlyContr;
      }
      // Step up the monthly contribution at the end of each year
      currentMonthlyContr = Math.round(currentMonthlyContr * (1 + annualIncrease / 100));
    }

    // Handle deferment/withdrawal age if it's strictly greater than the contribution age
    const defermentYears = Math.max(0, withdrawalAge - contributionAge);
    if (defermentYears > 0) {
      // Compounds during the deferment period without extra contributions
      accumulatedCorpus = accumulatedCorpus * Math.pow(1 + expectedGrowthRate / 100, defermentYears);
    }

    const totalAccumulatedCorpus = Math.round(accumulatedCorpus);
    const annuityCorpus = Math.round(totalAccumulatedCorpus * (annuityRatio / 100));
    const lumpSumWithdrawn = Math.max(0, totalAccumulatedCorpus - annuityCorpus);
    
    // Pension calculation: expected annuity rate per year divided by 12 months
    const expectedMonthlyPension = Math.round((annuityCorpus * (expectedAnnuityRate / 100)) / 12);

    setResults({
      totalContribution: totalPaid,
      accumulationYears: yearsToContribute,
      totalAccumulatedCorpus,
      lumpSumWithdrawn,
      annuityCorpus,
      expectedMonthlyPension,
      growthRateUsed: expectedGrowthRate
    });
  };

  // Run automatically on mount or whenever keys change so it works instantly too!
  useEffect(() => {
    calculatePension();
  }, [
    subscriberSector,
    dob,
    calculatedAge,
    existingCorpus,
    monthlyContribution,
    contributionAge,
    withdrawalAge,
    annualIncrease,
    annuityRatio,
    expectedAnnuityRate,
    expectedGrowthRate
  ]);

  const shareToWhatsApp = () => {
    const currentUrl = getShareableLink("pension", "/pension-calculator");
    if (!results) return;
    
    const text = `👵 *NPS Retirement Pension Calculator Projections*
Subscriber Sector: ${subscriberSector}
Monthly Contribution: ₹${monthlyContribution.toLocaleString("en-IN")}/mo (Step-Up: ${annualIncrease}%)
Investment Period: ${results.accumulationYears} years
-----------------------------------
*Total Contribution: ₹${results.totalContribution.toLocaleString("en-IN")}*
*NPS Accumulated Corpus: ₹${results.totalAccumulatedCorpus.toLocaleString("en-IN")}*
*Tax-free Lump-sum: ₹${results.lumpSumWithdrawn.toLocaleString("en-IN")}*
*Monthly Lifetime Pension: ₹${results.expectedMonthlyPension.toLocaleString("en-IN")}/month*

Map your exact NPS pension blueprint here: ${currentUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  const downloadPDFReport = () => {
    generatePDFReport({
      title: "NPS Pension Planner Report",
      subtitle: `National Pension System (NPS) projections for ${subscriberSector} Sector subscribers`,
      sections: [
        {
          title: "Subscription & Profile Parameters",
          items: [
            { label: "Subscriber Sector", value: subscriberSector },
            { label: "Date of Birth / Calculated Age", value: `${dob} / ${calculatedAge} Years` },
            { label: "Scheme Selected", value: scheme },
            { label: "Existing Pension Corpus", value: `INR ${existingCorpus.toLocaleString("en-IN")}` }
          ]
        },
        {
          title: "Voluntary Contributions & Investment Model",
          items: [
            { label: "Initial Monthly Contribution", value: `INR ${monthlyContribution.toLocaleString("en-IN")}` },
            { label: "Annual Step-up Increment", value: `${annualIncrease}%` },
            { label: "Contribution Period (Years)", value: `${results.accumulationYears} Years (to Age ${contributionAge})` },
            { label: "Expected Accumulation Growth Rate", value: `${expectedGrowthRate}%` }
          ]
        },
        {
          title: "Accumulated Retirement Pension Corpus",
          items: [
            { label: "Total Invested Principal", value: `INR ${results.totalContribution.toLocaleString("en-IN")}` },
            { label: "Estimated Compound Interest Earned", value: `INR ${Math.max(0, results.totalAccumulatedCorpus - results.totalContribution).toLocaleString("en-IN")}` },
            { label: "Total Accumulated Retirement Corpus", value: `INR ${results.totalAccumulatedCorpus.toLocaleString("en-IN")}` }
          ]
        },
        {
          title: "Annuity and Monthly Pension Payout",
          items: [
            { label: "Lump Sum Tax-Free Withdrawal (60%)", value: `INR ${results.lumpSumWithdrawn.toLocaleString("en-IN")}` },
            { label: "Annuity Reinvestment (40%)", value: `INR ${results.annuityCorpus.toLocaleString("en-IN")}` },
            { label: "Expected Annuity Return Rate", value: `${expectedAnnuityRate}%` },
            { label: "Estimated Monthly Lifetime Pension", value: `INR ${results.expectedMonthlyPension.toLocaleString("en-IN")}/mo` }
          ]
        }
      ],
      notes: [
        "Estimates are simulated based on standard compounding and National Pension System Rules.",
        "Under current guidelines, a minimum of 40% of the accumulated corpus must be reinvested into IRDAI regulated annuity schemes.",
        "The remaining 60% is paid out as a lump-sum, which is fully exempt from income tax."
      ]
    });
  };

  return (
    <div id="pension-calculator-section" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
      {/* Input controls form (8 cols) */}
      <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm dark:shadow-xl dark:shadow-slate-950/40 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 gap-4">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 font-display">
              NPS Pension Parameters
            </h3>
            <p className="text-xs text-slate-500 mt-1">Based on the National Pension System Trust guidelines</p>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button 
              onClick={handleReset}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30 px-2.5 py-1.5 rounded-lg border border-purple-200/50 dark:border-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors cursor-pointer"
            >
              <Undo2 className="w-3.5 h-3.5" />
              Reset
            </button>
            <button
              onClick={saveToLocker}
              disabled={isSaving}
              className={`bg-purple-600 hover:bg-purple-700 disabled:opacity-75 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition-all border-0 cursor-pointer ${isSaving ? "opacity-75 cursor-not-allowed" : ""}`}
            >
              <Bookmark className="w-3.5 h-3.5 text-white" />
              <span>{isSaving ? "Saving..." : saveStatus === "success" ? "Saved!" : "Save to Vault"}</span>
            </button>
            <button
              onClick={downloadPDFReport}
              className="bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 active:scale-95 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition-all border-0 cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={shareToWhatsApp}
              className="bg-[#25D366] hover:bg-[#20ba5a] active:scale-95 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition-all border-0 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Subscriber Sector Type */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
              Subscriber Sector
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setSubscriberSector("Government");
                  setScheme("Central Government");
                }}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold border transition-all ${
                  subscriberSector === "Government"
                    ? "bg-purple-600 border-purple-600 text-white shadow-sm"
                    : "bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                Government
              </button>
              <button
                type="button"
                onClick={() => {
                  setSubscriberSector("Non-Government");
                  setScheme("All Citizens Model");
                }}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold border transition-all ${
                  subscriberSector === "Non-Government"
                    ? "bg-purple-600 border-purple-600 text-white shadow-sm"
                    : "bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                Non-Government
              </button>
            </div>
          </div>

          {/* Scheme choice */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
              Scheme Available
            </label>
            <select
              value={scheme}
              onChange={(e) => setScheme(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {subscriberSector === "Government" ? (
                <>
                  <option value="Central Government">Central Government</option>
                  <option value="State Government">State Government</option>
                </>
              ) : (
                <>
                  <option value="All Citizens Model">All Citizens Scheme</option>
                  <option value="Corporate Sector">Corporate Sector Scheme</option>
                </>
              )}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-5">
          {/* DOB Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex justify-between">
              <span>My Date of Birth</span>
              <span className="text-purple-600 dark:text-purple-400 font-mono text-[10px] uppercase font-black bg-purple-50 dark:bg-purple-950/40 px-1.5 py-0.5 rounded">
                {calculatedAge} Yrs Old
              </span>
            </label>
            <input
              type="date"
              value={dob}
              max="2008-01-01" // Min 18 yrs old in 2026
              min="1955-01-01"
              onChange={(e) => setDob(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Expected Growth Rate */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
              Accumulation Growth Rate (CAGR)
            </label>
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 shadow-2xs">
              <input
                type="text"
                value={expectedGrowthRateStr}
                onChange={(e) => {
                  const original = e.target.value;
                  const sanitized = original.replace(/[^0-9.]/g, "");
                  const parts = sanitized.split(".");
                  const finalVal = parts.length > 2 ? parts[0] + "." + parts.slice(1).join("") : sanitized;
                  setExpectedGrowthRateStr(finalVal);
                  if (finalVal !== "" && finalVal !== ".") {
                    setExpectedGrowthRate(Number(finalVal));
                  }
                }}
                className="w-full bg-transparent font-bold text-purple-600 dark:text-purple-400 focus:outline-none text-xs text-right"
              />
              <span className="text-slate-400 text-xs font-bold">%</span>
            </div>
          </div>
        </div>

        {/* Inputs (Sliders + text editable boxes) */}
        <div className="space-y-4">
          
          {/* Existing Corpus */}
          <div>
            <div className="flex justify-between items-center text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
              <span>My Existing NPS Tier 1 Corpus (₹)</span>
              <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-2 py-1 shadow-2xs focus-within:ring-1 focus-within:ring-purple-500">
                <span className="text-slate-400 text-xs font-semibold">₹</span>
                <input
                  type="text"
                  value={existingCorpusStr}
                  onChange={(e) => {
                    const original = e.target.value;
                    const sanitized = original.replace(/[^0-9]/g, "");
                    setExistingCorpusStr(sanitized);
                    if (sanitized !== "") {
                      setExistingCorpus(Number(sanitized));
                    } else {
                      setExistingCorpus(0);
                    }
                  }}
                  className="w-24 bg-transparent text-right font-black text-purple-600 dark:text-purple-400 focus:outline-none text-xs p-0 border-0"
                />
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="2000000"
              step="5000"
              value={existingCorpus}
              onChange={(e) => {
                const val = Number(e.target.value);
                setExistingCorpus(val);
                setExistingCorpusStr(val.toString());
              }}
              className="w-full accent-purple-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
              <span>₹0</span>
              <span>₹10,00,000</span>
              <span>₹20,00,000+</span>
            </div>
          </div>

          {/* Monthly Contribution */}
          <div>
            <div className="flex justify-between items-center text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
              <span>I would like to contribute (₹ / Month)</span>
              <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-2 py-1 shadow-2xs focus-within:ring-1 focus-within:ring-purple-500">
                <span className="text-slate-400 text-xs font-semibold">₹</span>
                <input
                  type="text"
                  value={monthlyContributionStr}
                  onChange={(e) => {
                    const original = e.target.value;
                    const sanitized = original.replace(/[^0-9]/g, "");
                    setMonthlyContributionStr(sanitized);
                    if (sanitized !== "") {
                      setMonthlyContribution(Number(sanitized));
                    } else {
                      setMonthlyContribution(0);
                    }
                  }}
                  className="w-24 bg-transparent text-right font-black text-purple-600 dark:text-purple-400 focus:outline-none text-xs p-0 border-0"
                />
              </div>
            </div>
            <input
              type="range"
              min="500"
              max="150000"
              step="500"
              value={monthlyContribution}
              onChange={(e) => {
                const val = Number(e.target.value);
                setMonthlyContribution(val);
                setMonthlyContributionStr(val.toString());
              }}
              className="w-full accent-purple-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
              <span>₹500</span>
              <span>₹75,000</span>
              <span>₹1,50,000+</span>
            </div>
          </div>

          {/* Double slider equivalent row for Contribution Age & Deferment Age */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <div className="flex justify-between items-center text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                <span>Contribute Till Age (In Years)</span>
                <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-2 py-1 shadow-2xs focus-within:ring-1 focus-within:ring-purple-500">
                  <input
                    type="text"
                    value={contributionAgeStr}
                    onChange={(e) => {
                      const original = e.target.value;
                      const sanitized = original.replace(/[^0-9]/g, "");
                      setContributionAgeStr(sanitized);
                      if (sanitized !== "") {
                        setContributionAge(Number(sanitized));
                      }
                    }}
                    className="w-12 bg-transparent text-right font-bold text-purple-600 dark:text-purple-400 focus:outline-none text-xs p-0 border-0"
                  />
                </div>
              </div>
              <input
                type="range"
                min="60"
                max="85"
                step="1"
                value={contributionAge}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setContributionAge(val);
                  setContributionAgeStr(val.toString());
                }}
                className="w-full accent-purple-600 cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-slate-400 mt-1">
                <span>60 Yrs</span>
                <span>72 Yrs</span>
                <span>85 Yrs</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                <span>Withdrawal/Exit Age (In Years)</span>
                <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-2 py-1 shadow-2xs focus-within:ring-1 focus-within:ring-purple-500">
                  <input
                    type="text"
                    value={withdrawalAgeStr}
                    onChange={(e) => {
                      const original = e.target.value;
                      const sanitized = original.replace(/[^0-9]/g, "");
                      setWithdrawalAgeStr(sanitized);
                      if (sanitized !== "") {
                        setWithdrawalAge(Number(sanitized));
                      }
                    }}
                    className="w-12 bg-transparent text-right font-bold text-purple-600 dark:text-purple-400 focus:outline-none text-xs p-0 border-0"
                  />
                </div>
              </div>
              <input
                type="range"
                min={contributionAge}
                max="85"
                step="1"
                value={withdrawalAge}
                onChange={(e) => {
                  const val = Math.max(contributionAge, Number(e.target.value));
                  setWithdrawalAge(val);
                  setWithdrawalAgeStr(val.toString());
                }}
                className="w-full accent-purple-600 cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-slate-400 mt-1">
                <span>{contributionAge} Yrs</span>
                <span>72 Yrs</span>
                <span>85 Yrs</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Annual Increase in contributions */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                <span>Annual Contribution Increase (%)</span>
                <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-2 py-1 shadow-2xs focus-within:ring-1 focus-within:ring-purple-500">
                  <input
                    type="text"
                    value={annualIncreaseStr}
                    onChange={(e) => {
                      const original = e.target.value;
                      const sanitized = original.replace(/[^0-9.]/g, "");
                      const parts = sanitized.split(".");
                      const finalVal = parts.length > 2 ? parts[0] + "." + parts.slice(1).join("") : sanitized;
                      setAnnualIncreaseStr(finalVal);
                      if (finalVal !== "" && finalVal !== ".") {
                        setAnnualIncrease(Number(finalVal));
                      }
                    }}
                    className="w-12 bg-transparent text-right font-bold text-purple-600 dark:text-purple-400 focus:outline-none text-xs p-0 border-0"
                  />
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                step="1"
                value={annualIncrease}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setAnnualIncrease(val);
                  setAnnualIncreaseStr(val.toString());
                }}
                className="w-full accent-purple-600 cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-slate-400 mt-0.5 font-mono">
                <span>0%</span>
                <span>10%</span>
                <span>20%</span>
              </div>
            </div>

            {/* Annuity purchase ratio */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                <span>Annuity Purchase Ratio (%)</span>
                <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-2 py-1 shadow-2xs focus-within:ring-1 focus-within:ring-purple-500">
                  <input
                    type="text"
                    value={annuityRatioStr}
                    onChange={(e) => {
                      const original = e.target.value;
                      const sanitized = original.replace(/[^0-9]/g, "");
                      setAnnuityRatioStr(sanitized);
                      if (sanitized !== "") {
                        setAnnuityRatio(Number(sanitized));
                      }
                    }}
                    className="w-12 bg-transparent text-right font-bold text-purple-600 dark:text-purple-400 focus:outline-none text-xs p-0 border-0"
                  />
                </div>
              </div>
              <input
                type="range"
                min="40"
                max="100"
                step="5"
                value={annuityRatio}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setAnnuityRatio(val);
                  setAnnuityRatioStr(val.toString());
                }}
                className="w-full accent-purple-600 cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-slate-400 mt-0.5 font-mono">
                <span>40% (Min)</span>
                <span>70%</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          {/* Expected Annuity returns rate */}
          <div className="pt-2">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
              <span>Expected Annuity Rate / Return (%)</span>
              <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-2 py-1 shadow-2xs focus-within:ring-1 focus-within:ring-purple-500">
                <input
                  type="text"
                  value={expectedAnnuityRateStr}
                  onChange={(e) => {
                    const original = e.target.value;
                    const sanitized = original.replace(/[^0-9.]/g, "");
                    const parts = sanitized.split(".");
                    const finalVal = parts.length > 2 ? parts[0] + "." + parts.slice(1).join("") : sanitized;
                    setExpectedAnnuityRateStr(finalVal);
                    if (finalVal !== "" && finalVal !== ".") {
                      setExpectedAnnuityRate(Number(finalVal));
                    }
                  }}
                  className="w-16 bg-transparent text-right font-black text-purple-600 dark:text-purple-400 focus:outline-none text-xs p-0 border-0"
                />
                <span className="text-slate-400 text-xs font-bold">%</span>
              </div>
            </div>
            <input
              type="range"
              min="4"
              max="10"
              step="0.05"
              value={expectedAnnuityRate}
              onChange={(e) => {
                const val = Number(e.target.value);
                setExpectedAnnuityRate(val);
                setExpectedAnnuityRateStr(val.toString());
              }}
              className="w-full accent-purple-600 cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-slate-400 mt-0.5 font-mono">
              <span>4%</span>
              <span>6.75%</span>
              <span>10%</span>
            </div>
          </div>

        </div>

        {/* Manual Calculation Action Bar */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-pulse" />
            <span className="text-xs font-bold text-slate-500 font-mono uppercase tracking-wider">
              NPS Trust Active Trust Model
            </span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={calculatePension}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-xs py-2.5 px-6 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg active:scale-98"
            >
              <Calculator className="w-4 h-4" />
              Calculate Now
            </button>
          </div>
        </div>
      </div>

      {/* Output Results panel (5 cols) */}
      <div className="lg:col-span-5 flex flex-col gap-6 w-full">
        <div className="bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex-1 border border-purple-900/40">
          {/* Subtle background graphics */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-12 left-0 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-black tracking-widest text-purple-300 uppercase font-mono bg-purple-900/60 border border-purple-800/50 px-2 py-0.5 rounded-md">
                  NPS Projection Detail
                </span>
                <h4 className="text-lg font-black text-white mt-1.5 font-display">Pension Summary</h4>
              </div>
              <div className="bg-purple-900/40 p-2 rounded-xl border border-purple-800/45">
                <FileSpreadsheet className="w-5 h-5 text-purple-300" />
              </div>
            </div>

            {/* Expected Monthly Pension Metric Highlight! */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
              <span className="text-xs text-purple-200 block tracking-wide font-medium">Expected Monthly Pension</span>
              <div id="expected-pension-amount" className="text-3xl sm:text-4xl font-extrabold text-purple-300 tracking-tight mt-1 font-display">
                ₹{results.expectedMonthlyPension.toLocaleString("en-IN")}
                <span className="text-xs text-purple-400 font-bold block sm:inline sm:ml-1 mt-0.5 sm:mt-0 font-sans">/ Month</span>
              </div>
              <p className="text-[10px] text-purple-400 mt-2 italic">
                From annuity corpus of ₹{results.annuityCorpus.toLocaleString("en-IN")} at {expectedAnnuityRate}% rate
              </p>
            </div>

            {/* Core Metrics list */}
            <div className="space-y-3.5 border-t border-white/10 pt-4 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-400">Total Contribution Years:</span>
                <span className="text-white font-bold">{results.accumulationYears} years</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-400">Total Principal Saved:</span>
                <span className="text-white font-bold">₹{results.totalContribution.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-400">Total Accumulated Corpus:</span>
                <span className="text-purple-300 font-extrabold">₹{results.totalAccumulatedCorpus.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-400">Annuity Reinvested ({annuityRatio}%):</span>
                <span className="text-white font-bold">₹{results.annuityCorpus.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Tax-Free Lump Sum (Max {100-annuityRatio}%):</span>
                <span className="text-emerald-400 font-extrabold">₹{results.lumpSumWithdrawn.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Visual corpus breakdown split ratio graph progress bar */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                <span>Annuity ({annuityRatio}%)</span>
                <span>Lump Sum ({100 - annuityRatio}%)</span>
              </div>
              <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden flex border border-slate-700/60">
                <div 
                  className="bg-purple-500 h-full transition-all duration-300"
                  style={{ width: `${annuityRatio}%` }}
                />
                <div 
                  className="bg-emerald-500 h-full transition-all duration-300"
                  style={{ width: `${100 - annuityRatio}%` }}
                />
              </div>
            </div>

            {/* Call to actions matching NPS Trust manual */}
            <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <a 
                href="https://epension.npstrust.org.in/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-2.5 px-4 rounded-xl shadow-md transition-all text-center leading-normal"
              >
                <span>Open NPS Account</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>

              <div className="flex flex-col gap-1.5">
                <a 
                  href="https://www.npstrust.org.in/pension-calculator-nps" 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center justify-center gap-1 text-[11px] font-bold text-purple-300 hover:text-white transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                  User Manual PDF
                </a>
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); alert("National Pension System tutorial presentation is available online on official NPS Trust portals."); }} 
                  className="flex items-center justify-center gap-1 text-[11px] font-bold text-purple-300 hover:text-white transition-colors"
                >
                  <PlayCircle className="w-3.5 h-3.5 text-purple-400" />
                  Video Presentation
                </a>
              </div>
            </div>

          </div>
        </div>

        {/* Disclaimer exactly representing the authentic NPS disclaimer */}
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 rounded-2xl p-4 sm:p-5">
          <div className="flex gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h5 className="text-xs font-black text-amber-800 dark:text-amber-400 font-mono uppercase tracking-wider">
                Disclaimer Summary
              </h5>
              <p className="text-[10px] leading-relaxed text-amber-900/80 dark:text-amber-300/80 font-sans">
                The pension calculator on the NPS Trust website is meant for informational purposes only. Past performance does not guarantee future returns. National Pension System (NPS) products are subject to market risks. Real results may vary based on actual annuity providers chosen and policy revisions.
              </p>
            </div>
          </div>
        </div>

        {/* Explanation, FAQs, and Related Links Section */}
        <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800 space-y-8 text-left bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-slate-800">
          {/* Explanation Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-extrabold text-slate-800 font-display">
              Understanding NPS &amp; Retirement Pension Accumulation
            </h3>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              Retirement planning in India involves building a resilient corpus that can counter the eroding effects of long-term retail inflation. The **National Pension System (NPS)** is a government-regulated retirement accumulation scheme structured around dual goals: building a high-growth capital asset via market-linked funds, and securing an uninterrupted monthly pension via specialized Annuity Service Providers (ASPs).
            </p>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              When you deposit funds into NPS, your capital is distributed across Equity (E), Corporate Bonds (C), and Government Securities (G) depending on your selected risk profile (Active vs Auto Choice). Upon reaching 60 years of age, you are legally permitted to withdraw up to **60%** of your accumulated corpus tax-free, while the remaining **40%** (minimum requirement) is mandatorily utilized to buy an annuity policy that releases a lifelong monthly pension.
            </p>
          </div>

          {/* FAQ Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-extrabold text-slate-800 font-display">
              Retirement &amp; Pension FAQs
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100/80 dark:border-slate-800 space-y-1">
                <span className="block font-bold text-xs text-indigo-950 dark:text-indigo-300">
                  Q1: Is the lump-sum withdrawal from NPS tax-free?
                </span>
                <p className="text-[11px] leading-relaxed text-slate-550 dark:text-slate-405">
                  Yes, under current Income Tax laws in India, the lump-sum withdrawal of up to 60% of your accumulated corpus at age 60/retirement is entirely tax-exempt under Section 10(12A).
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100/80 dark:border-slate-800 space-y-1">
                <span className="block font-bold text-xs text-indigo-950 dark:text-indigo-300">
                  Q2: Can I choose to purchase more than 40% annuity?
                </span>
                <p className="text-[11px] leading-relaxed text-slate-550 dark:text-slate-405">
                  Definitely. The regulations mandate that a *minimum* of 40% must be allocated for buying a pension annuity. You can freely choose to allocate up to 100% of the corpus to increase your safe lifelong monthly pension.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100/80 dark:border-slate-800 space-y-1">
                <span className="block font-bold text-xs text-indigo-950 dark:text-indigo-300">
                  Q3: Who manages the assets in a National Pension account?
                </span>
                <p className="text-[11px] leading-relaxed text-slate-550 dark:text-slate-405">
                  Your funds are managed by PFRDA-registered Pension Fund Managers (PFMs) such as SBI Pension Funds, LIC Pension Fund, and HDFC Pension Fund with exceptionally low fund management fees.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100/80 dark:border-slate-800 space-y-1">
                <span className="block font-bold text-xs text-indigo-950 dark:text-indigo-300">
                  Q4: How does inflation affect my pension's purchasing power?
                </span>
                <p className="text-[11px] leading-relaxed text-slate-550 dark:text-slate-405">
                  As prices rise, a flat monthly pension will buy fewer goods over time. It is highly recommended to plan for an index-linked or inflation-adjusted supplement using Step-up SIPs alongside your standard NPS core pension.
                </p>
              </div>
            </div>
          </div>

          {/* Related Calculators */}
          <div className="bg-purple-50/45 dark:bg-purple-950/10 border border-purple-100/60 dark:border-purple-900/30 rounded-2xl p-5 space-y-3">
            <span className="text-[10px] font-black uppercase text-purple-600 dark:text-purple-400 tracking-wider font-mono block">Related Utilities</span>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-350">Optimize your future-proof ledger with related Paisa planners:</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <a href="/sip-calculator" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl hover:border-purple-400 text-center font-bold text-slate-700 dark:text-slate-300 block">SIP Calculator</a>
              <a href="/nps-calculator" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl hover:border-purple-400 text-center font-bold text-slate-700 dark:text-slate-300 block">NPS Tax Planner</a>
              <a href="/salary-calculator" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl hover:border-purple-400 text-center font-bold text-slate-700 dark:text-slate-300 block">Salary Calculator</a>
              <a href="/da-calculator" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl hover:border-purple-400 text-center font-bold text-slate-700 dark:text-slate-300 block">DA Allowance</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
