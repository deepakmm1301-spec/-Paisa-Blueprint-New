import React, { useState, useEffect } from "react";
import { 
  CreditCard, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  Info, 
  Calendar, 
  ShieldAlert, 
  Sparkles, 
  RefreshCw, 
  Award, 
  HelpCircle, 
  Activity, 
  FileText, 
  ChevronRight,
  TrendingDown,
  Percent,
  Calculator,
  FileDown
} from "lucide-react";
import { UserProfile } from "../types";
import { generatePDFReport } from "../utils/pdfGenerator";

interface CibilCheckProps {
  profile: UserProfile;
}

export default function CibilCheck({ profile }: CibilCheckProps) {
  // 1. Payment History States (35% weight)
  const [latePayments, setLatePayments] = useState<number>(0); // 0, 1, 2, 3+
  
  // 2. Credit Card Limit & average monthly spend (30% weight)
  const [hasCreditCard, setHasCreditCard] = useState<boolean>(true);
  const [cardLimit, setCardLimit] = useState<number>(150000);
  const [cardSpend, setCardSpend] = useState<number>(35000);

  // 3. Credit Age (15% weight)
  const [creditAge, setCreditAge] = useState<number>(4); // Years: 0.5, 2, 4, 7, 10

  // 4. Hard inquiries in last 6 months (10% weight)
  const [hardInquiries, setHardInquiries] = useState<number>(1);

  // 5. Active loans mix pulled from profile or customized (10% weight)
  const hasHomeLoan = (profile.loans?.homeLoan || 0) > 0;
  const hasPersonalLoan = (profile.loans?.personalLoan || 0) > 0;
  const hasCarLoan = (profile.loans?.carLoan || 0) > 0;

  // Manual additional loans adjustment
  const [customSecuredCount, setCustomSecuredCount] = useState<number>(hasHomeLoan || hasCarLoan ? 1 : 0);
  const [customUnsecuredCount, setCustomUnsecuredCount] = useState<number>(hasPersonalLoan ? 1 : 0);

  // Simulation Habits (Add-on/Offset prediction effects)
  const [habitAutoPay, setHabitAutoPay] = useState<boolean>(false);
  const [habitIncreaseLimit, setHabitIncreaseLimit] = useState<boolean>(false);
  const [habitLimitInquiries, setHabitLimitInquiries] = useState<boolean>(false);

  // Score calculations
  const [cibilScore, setCibilScore] = useState<number>(750);
  const [scoreCategory, setScoreCategory] = useState<string>("Excellent");
  const [scoreColor, setScoreColor] = useState<string>("text-emerald-650");
  const [bgColor, setBgColor] = useState<string>("bg-emerald-50");
  const [borderColor, setBorderColor] = useState<string>("border-emerald-100");

  const calculateScore = () => {
    let score = 300; // Base score

    // Factor 1: Payment History (Max 210 points)
    let paymentPoints = 210;
    if (latePayments === 1) paymentPoints = 160;
    else if (latePayments === 2) paymentPoints = 100;
    else if (latePayments >= 3) paymentPoints = 35;
    score += paymentPoints;

    // Factor 2: Credit @ Utilization (Max 180 points)
    let utilizationPoints = 180;
    if (hasCreditCard) {
      const ratio = cardLimit > 0 ? (cardSpend / cardLimit) * 100 : 100;
      if (ratio <= 15) utilizationPoints = 180;
      else if (ratio <= 30) utilizationPoints = 160;
      else if (ratio <= 50) utilizationPoints = 110;
      else if (ratio <= 75) utilizationPoints = 60;
      else utilizationPoints = 15;
    } else {
      // No credit history with utilization (neutral but limits max score)
      utilizationPoints = 120;
    }
    score += utilizationPoints;

    // Factor 3: Credit Age (Max 90 points)
    let agePoints = 10;
    if (creditAge >= 8) agePoints = 90;
    else if (creditAge >= 5) agePoints = 75;
    else if (creditAge >= 3) agePoints = 55;
    else if (creditAge >= 1) agePoints = 35;
    score += agePoints;

    // Factor 4: Credit Mix (Max 60 points)
    // Secured (home, car) vs Unsecured (personal, card)
    const securedTotal = (hasHomeLoan ? 1 : 0) + (hasCarLoan ? 1 : 0) + customSecuredCount;
    const unsecuredTotal = (hasCreditCard ? 1 : 0) + (hasPersonalLoan ? 1 : 0) + customUnsecuredCount;
    
    let mixPoints = 40;
    if (securedTotal > 0 && unsecuredTotal > 0) {
      mixPoints = 60; // Perfect mix
    } else if (unsecuredTotal > 0) {
      mixPoints = 35; // All unsecured is considered a bit risky in India
    } else if (securedTotal > 0) {
      mixPoints = 45; // All secured is secure but low active transaction variety
    }
    score += mixPoints;

    // Factor 5: Inquiries (Max 60 points)
    let inquiryPoints = 60;
    if (hardInquiries === 1) inquiryPoints = 50;
    else if (hardInquiries === 2) inquiryPoints = 35;
    else if (hardInquiries >= 3) inquiryPoints = 5;
    score += inquiryPoints;

    // Apply Simulated Improvements (Add offsets politely, capped @ 900)
    if (habitAutoPay) score += 25;
    if (habitIncreaseLimit) score += 15;
    if (habitLimitInquiries && hardInquiries > 0) score += 10;

    // Enforce limits
    if (score > 900) score = 900;
    if (score < 300) score = 300;

    setCibilScore(Math.round(score));
  };

  useEffect(() => {
    calculateScore();
  }, [
    latePayments, 
    hasCreditCard, 
    cardLimit, 
    cardSpend, 
    creditAge, 
    hardInquiries, 
    customSecuredCount, 
    customUnsecuredCount,
    habitAutoPay,
    habitIncreaseLimit,
    habitLimitInquiries,
    profile
  ]);

  // Update classification properties when CIBIL score recalculates
  useEffect(() => {
    if (cibilScore >= 775) {
      setScoreCategory("Excellent (Ideal for Top-Tier Interest Discounts)");
      setScoreColor("text-emerald-600");
      setBgColor("bg-emerald-50/70 text-emerald-800");
      setBorderColor("border-emerald-200");
    } else if (cibilScore >= 700) {
      setScoreCategory("Good Credit Range (Pre-approved Loan Offers)");
      setScoreColor("text-teal-600");
      setBgColor("bg-teal-50/70 text-teal-800");
      setBorderColor("border-teal-200");
    } else if (cibilScore >= 620) {
      setScoreCategory("Average Credit (Standard Rates applied)");
      setScoreColor("text-amber-600");
      setBgColor("bg-amber-50/70 text-amber-800");
      setBorderColor("border-amber-200");
    } else {
      setScoreCategory("Poor Credit Health (Potential Loan Rejections)");
      setScoreColor("text-rose-600");
      setBgColor("bg-rose-50/70 text-rose-800");
      setBorderColor("border-rose-200");
    }
  }, [cibilScore]);

  // Utility to determine credit utilization percentage safely
  const currentUtilizationPct = hasCreditCard && cardLimit > 0 ? Math.round((cardSpend / cardLimit) * 100) : 0;

  const downloadPDFReport = () => {
    const paymentStatus = latePayments === 0 ? "Excellent (No Delayed EMIs)" : latePayments === 1 ? "1 Delayed EMI" : latePayments === 2 ? "2 Delayed EMIs" : "3+ Delayed EMIs (High Default Risk)";
    const utilizationText = hasCreditCard ? `${currentUtilizationPct}% Utilization` : "No Credit Card History";
    const mixStatus = `Secured: ${customSecuredCount + (hasHomeLoan ? 1 : 0) + (hasCarLoan ? 1 : 0)} | Unsecured: ${customUnsecuredCount + (hasCreditCard ? 1 : 0) + (hasPersonalLoan ? 1 : 0)}`;

    generatePDFReport({
      title: "CIBIL Credit Score Diagnostic Report",
      subtitle: "Credit health assessment, risk analysis, and score projections",
      sections: [
        {
          title: "Credit Health Score Overview",
          items: [
            { label: "Estimated CIBIL Score", value: `${cibilScore} / 900` },
            { label: "Credit Band Status", value: scoreCategory },
            { label: "Lending Feasibility Rating", value: cibilScore >= 750 ? "Highly Pre-approved / Premium terms" : cibilScore >= 700 ? "Standard Eligibility / Competitive Rates" : "Surcharged Pricing / Elevated Default Threat" }
          ]
        },
        {
          title: "Diagnostic Parameters & Credit Behavior",
          items: [
            { label: "Payment History Discipline", value: paymentStatus },
            { label: "Credit Card Limit & Usage", value: hasCreditCard ? `INR ${cardLimit.toLocaleString("en-IN")} Limit | INR ${cardSpend.toLocaleString("en-IN")} Spent` : "N/A" },
            { label: "Credit Card Utilization Ratio", value: utilizationText },
            { label: "Credit Profile Maturity (Credit Age)", value: `${creditAge} Years` },
            { label: "Hard Inquiry Volatility (Last 6 Months)", value: `${hardInquiries} Hard Inquiries` },
            { label: "Asset Borrowing Mix (Secured/Unsecured)", value: mixStatus }
          ]
        },
        {
          title: "Simulated Habits & Proactive Improvements",
          items: [
            { label: "Enforced Payment Automation (ECS/Auto-Debit)", value: habitAutoPay ? "Active (+15-20 points expected)" : "Inactive" },
            { label: "Credit Limit Expansion (Lowering CUR)", value: habitIncreaseLimit ? "Active (+10-15 points expected)" : "Inactive" },
            { label: "Strict Hard Inquiry Curbs (Digital applications cooling)", value: habitLimitInquiries ? "Active (+5-10 points expected)" : "Inactive" }
          ]
        }
      ],
      notes: [
        "Payment history represents 35% of your final CIBIL rating. Even a single delayed EMI or credit card due of >30 days severely dampens scores.",
        "An ideal Credit Utilization Ratio (CUR) should be kept under 30% of total shared credit card limit allocations.",
        "Projections are simulation-based guidelines mimicking CIBIL TransUnion v3.0 mathematical frameworks. Actual scores can only be fetched via verified credit bureau channels."
      ]
    });
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-xs animate-fade-in space-y-8" id="cibil-scorecard-section">
      {/* Visual Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-1 text-[9px] font-extrabold tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-md uppercase">
              CREDIT INSIGHTS
            </span>
            <span className="px-2.5 py-1 text-[9px] font-extrabold tracking-widest bg-blue-50 text-blue-700 border border-blue-100 rounded-md uppercase">
              RBI Compliance Framework
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-800 font-display tracking-tight flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-bhagwa-600" />
            CIBIL Score Diagnostic Center
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Simulate credit score estimates based on payment discipline, card usage structures, active borrowing channels, and standard Indian lenders' requirements.
          </p>
          <button
            onClick={downloadPDFReport}
            className="mt-3 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all border-0 cursor-pointer shadow-sm"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Download CIBIL Diagnostic Report</span>
          </button>
        </div>

        {/* Highlight Score badge */}
        <div className={`p-4 rounded-2xl border ${borderColor} ${bgColor} flex flex-col items-center justify-center text-center min-w-[200px] shadow-3xs`}>
          <span className="text-[10px] uppercase font-bold tracking-wider opacity-85 block">Estimated Score</span>
          <span className="text-3xl font-black font-mono tracking-tight my-1">{cibilScore}</span>
          <span className="text-[10px] font-bold block">{scoreCategory}</span>
        </div>
      </div>

      {/* Main Grid: Left Side Controls, Right Side Radial Score and Improvements */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left column: Diagnostics Input Panel (Span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Calculator className="w-4 h-4 text-slate-400 animate-pulse" />
              1. Credit Behavior Parameters
            </h3>
            <button 
              onClick={() => {
                setLatePayments(0);
                setHasCreditCard(true);
                setCardLimit(200000);
                setCardSpend(40000);
                setCreditAge(5);
                setHardInquiries(0);
                setCustomSecuredCount(0);
                setCustomUnsecuredCount(0);
                setHabitAutoPay(false);
                setHabitIncreaseLimit(false);
                setHabitLimitInquiries(false);
              }}
              className="text-[10px] text-bhagwa-600 hover:text-bhagwa-800 font-bold flex items-center gap-1 transition-all"
            >
              <RefreshCw className="w-3 h-3" /> Reset Simulator
            </button>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-6">
            
            {/* Fact 1: Payment Delays */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 block">
                  Payment History History & Delays
                </span>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${latePayments === 0 ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
                  {latePayments === 0 ? "No late payments" : `${latePayments} Delayed`}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mb-2">
                Have you missed any EMI payments or credit card minimum payments inside the last 24 months? (Most weighted factor - 35%)
              </p>
              <div className="grid grid-cols-4 gap-2">
                {[0, 1, 2, 3].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setLatePayments(val)}
                    className={`p-2.5 rounded-xl border text-center transition-all text-xs font-bold cursor-pointer ${
                      latePayments === val 
                        ? "bg-slate-800 text-white border-slate-800 shadow-xs" 
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {val === 0 ? "0 Delays" : val === 3 ? "3+ Delays" : `${val} delay${val > 1 ? "s" : ""}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Fact 2: Credit Card and Utilization */}
            <div className="border-t border-slate-200/60 pt-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 block">
                  Credit Card Usage & Monthly Swipes
                </span>
                <div className="flex items-center gap-2">
                  <label className="text-[10px] font-semibold text-slate-450 cursor-pointer">Do you use credit cards?</label>
                  <input 
                    type="checkbox" 
                    checked={hasCreditCard} 
                    onChange={(e) => setHasCreditCard(e.target.checked)}
                    className="accent-bhagwa-600 rounded cursor-pointer"
                  />
                </div>
              </div>

              {hasCreditCard ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-slate-400 font-extrabold uppercase tracking-wide mb-1">
                        Total Monthly Credit Limit (₹)
                      </label>
                      <input 
                        type="number"
                        min={10000}
                        step={10000}
                        value={cardLimit}
                        onChange={(e) => setCardLimit(Number(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 font-extrabold uppercase tracking-wide mb-1">
                        Average Monthly Outstanding Bills (₹)
                      </label>
                      <input 
                        type="number"
                        min={0}
                        step={5000}
                        value={cardSpend}
                        onChange={(e) => setCardSpend(Number(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800"
                      />
                    </div>
                  </div>

                  {/* Utilization status bar */}
                  <div className="p-3 bg-white border border-slate-150 rounded-xl">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-bold text-slate-600">Calculated Credit Utilization Ratio (CUR):</span>
                      <span className={`text-[11px] font-black font-mono ${
                        currentUtilizationPct <= 30 ? "text-emerald-600" : currentUtilizationPct <= 50 ? "text-amber-600" : "text-rose-600"
                      }`}>
                        {currentUtilizationPct}%
                      </span>
                    </div>
                    
                    {/* Visual bar */}
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-350 ${
                          currentUtilizationPct <= 30 ? "bg-emerald-500" : currentUtilizationPct <= 50 ? "bg-amber-500" : "bg-rose-500"
                        }`}
                        style={{ width: `${Math.min(currentUtilizationPct, 100)}%` }}
                      />
                    </div>
                    
                    <p className="text-[9px] text-slate-400 mt-1.5 leading-snug">
                      {currentUtilizationPct <= 30 
                        ? "🟢 Perfect discipline. Lenders consider < 30% CUR as low risk for personal defaults." 
                        : currentUtilizationPct <= 50 
                        ? "🟡 Warning: Approaching credit hungry threshold. Try paying twice monthly." 
                        : "🔴 Credit Hunger Alert: Higher credit hunger can lower your score quickly. Pay before statement date."
                      }
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-xl text-center">
                  <span className="text-amber-800 text-[11px] font-bold block mb-1">💡 No active credit cards?</span>
                  <p className="text-[10px] text-slate-500 leading-snug">
                    Having no credit cards or EMI history results in a "No History" (NH / CIBIL -1) status. Lenders may struggle to assess risk. Consider starting with a secure card (FD-backed) to build base scores easily.
                  </p>
                </div>
              )}
            </div>

            {/* Fact 3: Credit Age & Hard Inquiries */}
            <div className="border-t border-slate-205/60 pt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Credit Age */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Earliest Credit Account Age
                </label>
                <p className="text-[10px] text-slate-500 mb-2 leading-relaxed">
                  Time elapsed since oldest active bank credit card/mortgage. Older is safer.
                </p>
                <select
                  value={creditAge}
                  onChange={(e) => setCreditAge(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-750 font-bold focus:outline-none"
                >
                  <option value={0.5}>New Credit (&lt; 1 Year)</option>
                  <option value={2}>Early History (1 - 3 Years)</option>
                  <option value={4}>Established History (3 - 5 Years)</option>
                  <option value={7}>Mature Portfolio (5 - 8 Years)</option>
                  <option value={10}>Seasoned Veteran (8+ Years)</option>
                </select>
              </div>

              {/* Inquiries */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Hard Inquiries (Last 6 Months)
                </label>
                <p className="text-[10px] text-slate-500 mb-2 leading-relaxed">
                  Checks made by lenders when you apply for cards/loans. Frequent searches look desperate.
                </p>
                <select
                  value={hardInquiries}
                  onChange={(e) => setHardInquiries(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-750 font-bold focus:outline-none"
                >
                  <option value={0}>0 Inquiries (Clean State)</option>
                  <option value={1}>1 Inquiry (Normal standard)</option>
                  <option value={2}>2 - 3 Inquiries (Aggressive search)</option>
                  <option value={4}>4+ Inquiries (High risks flagged)</option>
                </select>
              </div>
            </div>

            {/* Fact 4: Live Loan Mix Pull */}
            <div className="border-t border-slate-205/60 pt-5">
              <span className="text-xs font-bold text-slate-700 block mb-2">
                Active Loan Mix (Balance Index)
              </span>
              <p className="text-[11px] text-slate-500 mb-3">
                Lenders want you to maintain healthy credit diversification (Secured collateral assets vs unstable unsecured liquid loans).
              </p>

              <div className="space-y-2 mb-3">
                <div className="flex justify-between items-center p-2.5 bg-slate-100/60 border border-slate-200 rounded-xl text-xs">
                  <span className="font-semibold text-slate-650">Pulled Live from Profile:</span>
                  <div className="flex gap-2 font-mono font-bold text-[10px]">
                    <span className={`px-2 py-0.5 rounded ${hasHomeLoan ? "bg-emerald-50 text-emerald-700" : "bg-slate-200 text-slate-400"}`}>
                      Home: {hasHomeLoan ? `₹${profile.loans?.homeLoan.toLocaleString()}` : "None"}
                    </span>
                    <span className={`px-2 py-0.5 rounded ${hasCarLoan ? "bg-emerald-50 text-emerald-700" : "bg-slate-200 text-slate-400"}`}>
                      Car: {hasCarLoan ? `₹${profile.loans?.carLoan.toLocaleString()}` : "None"}
                    </span>
                    <span className={`px-2 py-0.5 rounded ${hasPersonalLoan ? "bg-amber-50 text-amber-700" : "bg-slate-200 text-slate-400"}`}>
                      Personal: {hasPersonalLoan ? `₹${profile.loans?.personalLoan.toLocaleString()}` : "None"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Manual adjustors for other active accounts */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border border-slate-150 p-3 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="block text-[10px] font-bold text-slate-750">Extra Secured (Car/Gold Loan)</span>
                    <span className="text-[9px] text-slate-400">Backing collateral</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      type="button" 
                      onClick={() => setCustomSecuredCount(Math.max(0, customSecuredCount - 1))}
                      className="w-6 h-6 rounded bg-slate-100 font-bold text-xs text-slate-600 flex items-center justify-center cursor-pointer"
                    >
                      -
                    </button>
                    <span className="text-xs font-mono font-black">{customSecuredCount}</span>
                    <button 
                      type="button" 
                      onClick={() => setCustomSecuredCount(customSecuredCount + 1)}
                      className="w-6 h-6 rounded bg-slate-100 font-bold text-xs text-slate-600 flex items-center justify-center cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="bg-white border border-slate-150 p-3 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="block text-[10px] font-bold text-slate-750">Extra Unsecured (Personal/BNPL)</span>
                    <span className="text-[9px] text-slate-400">Consumer finance/BNPL cards</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      type="button" 
                      onClick={() => setCustomUnsecuredCount(Math.max(0, customUnsecuredCount - 1))}
                      className="w-6 h-6 rounded bg-slate-100 font-bold text-xs text-slate-600 flex items-center justify-center cursor-pointer"
                    >
                      -
                    </button>
                    <span className="text-xs font-mono font-black">{customUnsecuredCount}</span>
                    <button 
                      type="button" 
                      onClick={() => setCustomUnsecuredCount(customUnsecuredCount + 1)}
                      className="w-6 h-6 rounded bg-slate-100 font-bold text-xs text-slate-600 flex items-center justify-center cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Right column: Graphic Gauge, Improvements (Span 5) */}
        <div className="lg:col-span-12 xl:col-span-5 space-y-6">
          <h3 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-slate-500" />
            2. score scorecard & optimization
          </h3>

          <div className="border border-slate-100 rounded-3xl p-6 flex flex-col items-center justify-center bg-gradient-to-b from-slate-50/50 to-white shadow-3xs text-center">
            
            {/* SVG Arc Gauge */}
            <div className="relative w-48 h-28 flex items-center justify-center mt-2">
              <svg className="w-full h-full transform -rotate-180" viewBox="0 0 100 50">
                {/* Background Track */}
                <path
                  d="M 10 50 A 40 40 0 0 1 90 50"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                {/* Simulated Colorful Gauge parts (Red -> Amber -> Green) */}
                <path
                  d="M 10 50 A 40 40 0 0 1 90 50"
                  fill="none"
                  stroke={`url(#gauge-grad-cibil)`}
                  strokeWidth="8.2"
                  strokeLinecap="round"
                  strokeDasharray="125.6"
                  /* 300 to 900 maps to 0 to 100% of length (125.6 is full semicircle) */
                  strokeDashoffset={125.6 - (125.6 * ((cibilScore - 300) / 600))}
                  className="transition-all duration-700 ease-out"
                />
                
                <defs>
                  <linearGradient id="gauge-grad-cibil" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="50%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Absolute core score center display */}
              <div className="absolute bottom-0 text-center select-none">
                <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-slate-800 leading-none">
                  {cibilScore}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block mt-1">
                  CIBIL Estimator
                </span>
              </div>
            </div>

            {/* Ranges tracker */}
            <div className="grid grid-cols-4 gap-1 w-full text-[9px] font-bold text-slate-400 mt-4 border-t border-slate-100 pt-4 pb-2">
              <div className="border-r border-slate-100">
                <span className="block text-rose-500">Poor</span>
                <span>300 - 549</span>
              </div>
              <div className="border-r border-slate-100">
                <span className="block text-amber-500">Average</span>
                <span>550 - 649</span>
              </div>
              <div className="border-r border-slate-100">
                <span className="block text-teal-500">Good</span>
                <span>650 - 749</span>
              </div>
              <div>
                <span className="block text-emerald-500">Excellent</span>
                <span>750 - 900</span>
              </div>
            </div>

            {/* Customized verdict advice */}
            <div className="w-full text-left mt-3">
              <div className="p-3 bg-white border border-slate-150 rounded-2xl">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Impact Analysis:</span>
                
                {cibilScore >= 775 ? (
                  <p className="text-[11px] text-slate-650 leading-relaxed">
                    🌟 <strong>Top Tier Client Status:</strong> You are eligible for the absolute lowest ROI on loans (savings of ~0.5% vs standard cards). Auto-approvals for unsecured credit with minimal background paperwork is likely.
                  </p>
                ) : cibilScore >= 700 ? (
                  <p className="text-[11px] text-slate-650 leading-relaxed">
                    ✅ <strong>Healthy Borrower Credit:</strong> Good probability of housing and car loans with standard bank rates. Limit multiple loan inquiries back-to-back to secure approval quickly.
                  </p>
                ) : cibilScore >= 620 ? (
                  <p className="text-[11px] text-slate-655 leading-relaxed text-amber-900">
                    ⚠️ <strong>Restricted Access:</strong> Lenders may ask for a higher co-signer support, lower credit card limit bounds, or push home loan rates up by 1% to mitigate defaults risks.
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-655 leading-relaxed text-rose-900">
                    ❌ <strong>Severe Deficit Warning:</strong> Immediate attention required. Clear all past outstanding, restrict new inquiry logs immediately, and contact active card issuers to secure automated settlement windows.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* SIMULATE HABIT BOOSTER (Extremely interactive) */}
          <div className="bg-bhagwa-50/40 border border-bhagwa-100/70 p-5 rounded-2xl space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-bhagwa-950 block">🚀 Indian Habits Optimization Simulator</span>
                <span className="bg-bhagwa-150 text-bhagwa-900 font-extrabold text-[9px] px-1.5 py-0.5 rounded uppercase">BOOSTS</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1 leading-snug">
                Toggle these credit repair habits to preview the potential lift in CIBIL points within 3–6 months.
              </p>
            </div>

            <div className="space-y-2.5 text-xs">
              <label className="flex items-start gap-2.5 p-3.5 bg-white rounded-xl border border-bhagwa-100/30 hover:border-bhagwa-100 shadow-3xs cursor-pointer select-none transition-all">
                <input 
                  type="checkbox"
                  checked={habitAutoPay}
                  onChange={(e) => setHabitAutoPay(e.target.checked)}
                  className="rounded accent-bhagwa-600 mt-0.5 cursor-pointer"
                />
                <div>
                  <span className="block font-bold text-slate-800 text-[11px]">Deploy NACH Autopay mandates (+25 pts)</span>
                  <span className="block text-[10px] text-slate-450 mt-0.5 leading-snug">
                    Linking national automated clearing to primary salary account ensures 100% on-time EMI logs.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-3.5 bg-white rounded-xl border border-bhagwa-100/30 hover:border-bhagwa-100 shadow-3xs cursor-pointer select-none transition-all">
                <input 
                  type="checkbox"
                  checked={habitIncreaseLimit}
                  onChange={(e) => setHabitIncreaseLimit(e.target.checked)}
                  className="rounded accent-bhagwa-600 mt-0.5 cursor-pointer"
                />
                <div>
                  <span className="block font-bold text-slate-800 text-[11px]">Request Card Credit Limit Enhancement (+15 pts)</span>
                  <span className="block text-[10px] text-slate-450 mt-0.5 leading-snug">
                    Increasing maximum limits without spending more naturally lowers CUR% below 20%.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-3.5 bg-white rounded-xl border border-bhagwa-100/30 hover:border-bhagwa-100 shadow-3xs cursor-pointer select-none transition-all">
                <input 
                  type="checkbox"
                  checked={habitLimitInquiries}
                  onChange={(e) => setHabitLimitInquiries(e.target.checked)}
                  disabled={hardInquiries === 0}
                  className={`rounded accent-bhagwa-600 mt-0.5 cursor-pointer ${hardInquiries === 0 ? "opacity-40" : ""}`}
                />
                <div className={hardInquiries === 0 ? "opacity-50" : ""}>
                  <span className="block font-bold text-slate-800 text-[11px]">Execute Credit Inquiry Freeze (+10 pts)</span>
                  <span className="block text-[10px] text-slate-450 mt-0.5 leading-snug">
                    Commit to 0 new loan card requests for 6 full months to wipe off hard inquiry history penalties.
                  </span>
                </div>
              </label>
            </div>
          </div>

        </div>

      </div>

      {/* Credit Educational Matrix Tabs & Info cards */}
      <div className="border-t border-slate-100 pt-6 space-y-4">
        <h3 className="font-bold text-xs text-slate-800 uppercase tracking-widest flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-orange-500 animate-bounce" />
          Pro-Tips to scale to &gt; 800 CIBIL score in India
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
            <span className="font-bold text-slate-850 block mb-1">🏦 Watch the "Settled" status label</span>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Never accept a "settled" agreement with active lenders if you can scrape funds to pay off. A "Settled" status stays for 7 full years as a marker of defaulted compromise on your CIBIL profile. Pay the final due for a "Closed" NOC certificate.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
            <span className="font-bold text-slate-850 block mb-1">💳 Retain Oldest active card</span>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              If you have an old credit card with ₹0 anual maintenance fees, never close it out of frustration. Closing it reduces your credit age, destroying years of positive payment tenure evidence instantly. Use it annually once contentedly.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
            <span className="font-bold text-slate-850 block mb-1">🕵️ Regular co-signer audits</span>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              If you co-signed a car loan or educational loan for flatmates or relatives, their delays reflect directly on YOUR credit report as a solid penalty. Check your statements twice annually for potential co-owner damage leaks.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
