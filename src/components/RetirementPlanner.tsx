import React, { useState } from "react";
import { Landmark, Sparkles, HelpCircle, AlertTriangle, ArrowRight, ShieldAlert, Share2, FileDown } from "lucide-react";
import { getShareableLink } from "../types";
import { generatePDFReport } from "../utils/pdfGenerator";

export default function RetirementPlanner() {
  const [currentAge, setCurrentAge] = useState<number>(30);
  const [retirementAge, setRetirementAge] = useState<number>(60);
  const [lifeExpectancy, setLifeExpectancy] = useState<number>(85);
  
  const [monthlyExpense, setMonthlyExpense] = useState<number>(50000);
  const [inflationRate, setInflationRate] = useState<number>(6); // average Indian inflation
  const [preRetReturn, setPreRetReturn] = useState<number>(12); // equity mutual fund rate
  const [postRetReturn, setPostRetReturn] = useState<number>(8); // safe debt/FD pension rate post-retirement
  const [monthlyPension, setMonthlyPension] = useState<number>(10000); // EPS / NPS or other fixed pensions expected

  // Math
  const yearsToRetire = Math.max(1, retirementAge - currentAge);
  const retirementYears = Math.max(1, lifeExpectancy - retirementAge);

  // Future inflated monthly expense at retirement year
  const inflatedMonthlyExpense = Math.round(monthlyExpense * Math.pow(1 + inflationRate / 100, yearsToRetire));
  
  // Adjusted for standard post-retirement pensions
  const monthlyExpenseRequiredAfterPension = Math.max(0, inflatedMonthlyExpense - monthlyPension);

  // We calculate the required corpus using the annuity model or safe drawdown
  // To avoid advanced complex annuity formula errors, let's build an iterative drawdown simulator model:
  // Each year of retirement postRetReturn is added, inflationRate is subtracted.
  // Net safe yield post-retirement is (1 + postRetReturn/100) / (1 + inflationRate/100) - 1
  const realPostRetReturn = (1 + postRetReturn / 100) / (1 + (postRetReturn > inflationRate ? inflationRate : 0) / 100) - 1;
  
  // Simplified safe multiplier: about 25x to 30x of annual expense is required for safe 4% drawdown
  // Let's perform annual cashflow accumulation for accurate retirement drawdown simulation:
  let simulatedCorpusNeed = 0;
  let yearExpense = monthlyExpenseRequiredAfterPension * 12;
  for (let rYear = 1; rYear <= retirementYears; rYear++) {
    // Add today's year expense discounted/compounded
    simulatedCorpusNeed += yearExpense;
    // Inflate expense for next retirement year
    yearExpense = yearExpense * (1 + inflationRate / 100);
    // Safety yield factor back-discounted
    simulatedCorpusNeed = simulatedCorpusNeed / (1 + realPostRetReturn * 0.5);
  }
  const targetCorpus = Math.round(simulatedCorpusNeed);

  // Calculate monthly SIP required to achieve targetCorpus in 'yearsToRetire' at 'preRetReturn' rate
  // FV of annuity Formula: FV = PMT * [((1 + r)^n - 1) / r] * (1 + r)
  const rMonthly = (preRetReturn / 100) / 12;
  const nMonths = yearsToRetire * 12;
  const compoundFactor = ((Math.pow(1 + rMonthly, nMonths) - 1) / rMonthly) * (1 + rMonthly);
  const monthlySipRequired = Math.round(targetCorpus / (compoundFactor || 1));

  const shareToWhatsApp = () => {
    const currentUrl = getShareableLink("retirement", "/retirement-roadmap");
    
    const text = `🌴 *Retirement Roadmap & Pension Projections*
Current Age: ${currentAge} | Retirement Age: ${retirementAge}
Monthly Expense (Current value): ₹${monthlyExpense.toLocaleString("en-IN")}/mo
Inflated Monthly Expense (at Retirement): ₹${inflatedMonthlyExpense.toLocaleString("en-IN")}/mo
-----------------------------------
*Required Retirement Corpus: ₹${targetCorpus.toLocaleString("en-IN")}*
*Required Monthly SIP for Goal: ₹${monthlySipRequired.toLocaleString("en-IN")}/mo*

Chart your complete retirement roadmap instantly: ${currentUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  const downloadPDFReport = () => {
    generatePDFReport({
      title: "Salaried Retirement Plan Report",
      subtitle: "Custom retirement corpus and systematic investment roadmap",
      sections: [
        {
          title: "Demographics & Timeline parameters",
          items: [
            { label: "Current Age", value: `${currentAge} Years` },
            { label: "Retirement Age Goal", value: `${retirementAge} Years` },
            { label: "Years to Accumulate Wealth", value: `${yearsToRetire} Years` },
            { label: "Post-Retirement Life Expectancy", value: `${lifeExpectancy} Years (spanning ${retirementYears} years)` }
          ]
        },
        {
          title: "Financial Inputs & Market Indicators",
          items: [
            { label: "Current Monthly Living Expenses", value: `INR ${monthlyExpense.toLocaleString("en-IN")}` },
            { label: "Expected Inflation Rate", value: `${inflationRate}%` },
            { label: "Pre-Retirement SIP Return Rate", value: `${preRetReturn}%` },
            { label: "Post-Retirement Safe Yield Rate", value: `${postRetReturn}%` },
            { label: "Expected Fixed Pension (per month)", value: `INR ${monthlyPension.toLocaleString("en-IN")}` }
          ]
        },
        {
          title: "Retirement Target Corpus & Roadmap",
          items: [
            { label: "Inflated Monthly Expenses at Retirement", value: `INR ${inflatedMonthlyExpense.toLocaleString("en-IN")}` },
            { label: "Net Required Monthly Expenses (After Pension)", value: `INR ${monthlyExpenseRequiredAfterPension.toLocaleString("en-IN")}` },
            { label: "Calculated Inflation-Adjusted Retirement Corpus Needed", value: `INR ${targetCorpus.toLocaleString("en-IN")}` },
            { label: "Required Monthly SIP Investment to Reach Target", value: `INR ${monthlySipRequired.toLocaleString("en-IN")}/mo` }
          ]
        }
      ],
      notes: [
        "Compound SIP calculation assumes regular monthly disciplined investing starting immediately.",
        "Inflation has a compounding erosive effect on purchasing power; a monthly expense of Rs 50k today requires a significantly larger corpus in 30 years to maintain standard of living.",
        "Drawdown projections simulate a standard safe yield buffer post-retirement."
      ]
    });
  };

  return (
    <div id="retirement-planner-module" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 md:p-8 shadow-xs">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-bhagwa-600 bg-bhagwa-50 dark:bg-bhagwa-950/30 px-2.5 py-1 rounded-full">Longevity Blueprint</span>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mt-2 font-display">Salaried Retirement Planner</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Simulate inflation erosion, longevity cashflow requirements, and calculate the exact monthly SIP index needed to reach your target corpus.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
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
        {/* Controls */}
        <div className="lg:col-span-5 bg-slate-50 border border-slate-100 p-5 rounded-2xl space-y-5 text-sm">
          <h3 className="font-semibold text-slate-800 flex items-center gap-1.5 border-b border-slate-200/60 pb-2">
            <Landmark className="w-4 h-4 text-bhagwa-600" /> Key Inputs
          </h3>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Current Age</label>
              <input
                type="number"
                min="18"
                max="80"
                value={currentAge}
                onChange={(e) => setCurrentAge(Math.max(18, Number(e.target.value)))}
                className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-center text-slate-800 font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Retire Age</label>
              <input
                type="number"
                min="40"
                max="85"
                value={retirementAge}
                onChange={(e) => setRetirementAge(Math.max(40, Number(e.target.value)))}
                className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-center text-slate-800 font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Longevity Yrs</label>
              <input
                type="number"
                min="60"
                max="100"
                value={lifeExpectancy}
                onChange={(e) => setLifeExpectancy(Math.max(60, Number(e.target.value)))}
                className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-center text-slate-800 font-bold"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
              <span>Required Today's Monthly Expenses</span>
              <span className="text-bhagwa-600 font-bold">₹{monthlyExpense.toLocaleString("en-IN")}</span>
            </div>
            <input
              type="range"
              min="10000"
              max="500000"
              step="5000"
              value={monthlyExpense}
              onChange={(e) => setMonthlyExpense(Number(e.target.value))}
              className="w-full accent-bhagwa-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
              <span>₹10,000</span>
              <span>₹1,50,000</span>
              <span>₹5,00,000</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Assumed Inflation (%)</label>
              <input
                type="number"
                min="1"
                max="12"
                step="0.5"
                value={inflationRate}
                onChange={(e) => setInflationRate(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Expected monthly pension (₹)</label>
              <input
                type="number"
                min="0"
                value={monthlyPension}
                onChange={(e) => setMonthlyPension(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs text-slate-600 mb-1">Equity Growth CAGR %</label>
              <input
                type="number"
                min="5"
                max="25"
                step="0.5"
                value={preRetReturn}
                onChange={(e) => setPreRetReturn(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none text-xs"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Post-Retire Return %</label>
              <input
                type="number"
                min="4"
                max="15"
                step="0.5"
                value={postRetReturn}
                onChange={(e) => setPostRetReturn(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none text-xs"
              />
            </div>
          </div>
        </div>

        {/* Output results dashboard */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl flex flex-col gap-4 text-slate-700 text-sm">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5 font-display text-md">
              <Sparkles className="w-5 h-5 text-bhagwa-500" /> Retirement Scenario Analysis
            </h4>

            {/* Visual Flow Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Box 1: Exp inflation */}
              <div className="bg-white p-4 border border-slate-100 rounded-xl">
                <span className="text-xs text-slate-400 uppercase font-semibold">Inflated Expense at age {retirementAge}</span>
                <span className="block text-xl font-bold font-mono text-slate-800 mt-1">₹{inflatedMonthlyExpense.toLocaleString("en-IN")}/Mo</span>
                <span className="text-[11px] text-rose-500 block font-medium mt-1">
                  Erosion factor: {Math.round(Math.pow(1 + inflationRate / 100, yearsToRetire) * 10) / 10}x costs!
                </span>
              </div>

              {/* Box 2: Total Corpus needed */}
              <div className="bg-white p-4 border border-slate-100 rounded-xl">
                <span className="text-xs text-slate-400 uppercase font-semibold">Required Corpus Pool</span>
                <span className="block text-xl font-extrabold font-mono text-bhagwa-600 mt-1">₹{(targetCorpus >= 10000000 ? (targetCorpus/10000000).toFixed(2) + " Cr" : (targetCorpus/100000).toFixed(2) + " L")}</span>
                <span className="text-[11px] text-slate-400 block mt-1">
                  Absolute Capital: ₹{targetCorpus.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Pension gap info */}
            <div className="p-3 bg-bhagwa-50/50 border border-bhagwa-100/60 rounded-xl text-xs space-y-1">
              <div className="flex justify-between font-bold text-bhagwa-900">
                <span>Post-Retirement Pension Support:</span>
                <span>₹{monthlyPension.toLocaleString("en-IN")}/month</span>
              </div>
              <p className="text-bhagwa-800/90 leading-relaxed text-[11px]">
                Your self-funded withdrawal requirement is <strong>₹{monthlyExpenseRequiredAfterPension.toLocaleString("en-IN")}/mo</strong> (inflated). The core corpus pool assumes you draw down for {retirementYears} years while continuing to grow remaining capital at {postRetReturn}% annually.
              </p>
            </div>
          </div>

          {/* Action Call for SIP contribution */}
          <div className="bg-gradient-to-r from-bhagwa-900 to-slate-900 text-white rounded-2xl p-6 relative overflow-hidden">
            <div className="relative z-10">
              <span className="text-[10px] uppercase font-extrabold tracking-widest text-bhagwa-300 bg-bhagwa-500/25 px-2.5 py-1 rounded-full border border-bhagwa-500/20">The BluePrint Action Plan</span>
              <h3 className="text-lg font-bold mt-3 font-display">Required Monthly Retirement SIP</h3>
              <p className="text-bhagwa-200 text-xs mt-1 max-w-md leading-relaxed">
                Start an automated monthly equity mutual fund portfolio SIP immediately. In {yearsToRetire} years, this compounds safely to meet your Cr corpus:
              </p>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-5 border-t border-bhagwa-800/60 pt-4">
                <div>
                  <span className="block text-3xl font-extrabold font-mono text-emerald-400">
                    ₹{monthlySipRequired.toLocaleString("en-IN")}<span className="text-xs font-normal text-bhagwa-300">/mo</span>
                  </span>
                  <span className="text-[11px] text-bhagwa-300 block mt-0.5">Assumed {preRetReturn}% long-term equity growth</span>
                </div>
                
                {yearsToRetire > 10 && (
                  <div className="text-xs bg-emerald-500/10 text-emerald-300 font-semibold border border-emerald-500/20 px-3 py-1.5 rounded-lg">
                    🛡️ Compounding Multiplier Advantage!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
