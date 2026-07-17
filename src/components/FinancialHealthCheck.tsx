import React, { useState } from "react";
import { UserProfile, getShareableLink } from "../types";
import { ShieldCheck, HeartPulse, Sparkles, TrendingUp, DollarSign, Wallet, Percent, Users, Landmark, AlertTriangle, Share2, FileDown } from "lucide-react";
import { generatePDFReport } from "../utils/pdfGenerator";

interface Props {
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
}

export default function FinancialHealthCheck({ profile, onUpdateProfile }: Props) {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<UserProfile>({ ...profile });

  // Handle form changes
  const handleInputChange = (field: keyof UserProfile, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLoanChange = (field: string, value: number) => {
    setFormData((prev) => ({
      ...prev,
      loans: { ...prev.loans, [field]: value },
    }));
  };

  const handleInvestmentChange = (field: string, value: number) => {
    setFormData((prev) => ({
      ...prev,
      investments: { ...prev.investments, [field]: value },
    }));
  };

  const handleSave = () => {
    onUpdateProfile(formData);
    setEditMode(false);
  };

  // Calculations
  const annualSalary = profile.salary * 12;
  const currentTotalInvestments = 
    profile.investments.mutualFunds +
    profile.investments.stocks +
    profile.investments.gold +
    profile.investments.epf +
    profile.investments.ppf +
    profile.investments.nps +
    profile.investments.realEstate;

  const totalLoans = 
    profile.loans.homeLoan +
    profile.loans.personalLoan +
    profile.loans.carLoan +
    profile.loans.otherLoan;

  // 1. Emergency Fund Score
  const monthlyCommitments = profile.monthlyExpenses + (totalLoans > 0 ? (totalLoans * 0.01) : 0); // Approx monthly commitments/EMI
  const requiredEmergency = monthlyCommitments * 6;
  const emergencyScore = Math.min(Math.round((profile.currentSavings / (requiredEmergency || 1)) * 100), 100);

  // 2. Insurance Score (Based on pure health security + term policy)
  const hasDependents = profile.maritalStatus !== "single";
  const termCover = profile.termInsuranceCover !== undefined ? profile.termInsuranceCover : 5000000;
  const healthCover = profile.healthInsuranceCover !== undefined ? profile.healthInsuranceCover : 500000;
  const termTarget = annualSalary * (hasDependents ? 15 : 10);
  const healthTarget = hasDependents ? 1000000 : 500000;

  const termInsuranceScore = Math.min(Math.round((termCover / (termTarget || 1)) * 100), 100);
  const healthInsuranceScore = Math.min(Math.round((healthCover / (healthTarget || 1)) * 100), 100);
  const insuranceScore = Math.round((termInsuranceScore * 0.5) + (healthInsuranceScore * 0.5));

  // 3. Retirement Score
  // Ideal savings milestone at age: (Age - 22) * Annual salary * 0.15
  const savingYears = Math.max(1, profile.age - 22);
  const targetRetirementAccumulation = savingYears * annualSalary * 0.18;
  const retirementAssets = profile.investments.epf + profile.investments.ppf + profile.investments.nps + (profile.investments.mutualFunds * 0.7);
  const retirementScore = Math.min(Math.round((retirementAssets / (targetRetirementAccumulation || 1)) * 100), 100);

  // 4. Debt Score
  // Debt to assets ratio. High debt is bad.
  const debtToAssetRatio = totalLoans / ((currentTotalInvestments + profile.currentSavings) || 1);
  const debtScore = Math.max(0, Math.min(100, Math.round(100 - (debtToAssetRatio * 50))));

  // 5. Wealth Score
  // Ratio of net worth compared to peer standard net worth
  const netWorth = (currentTotalInvestments + profile.currentSavings) - totalLoans;
  const targetNetWorth = Math.max(50000, (profile.age - 22) * annualSalary * 0.12);
  const netWorthRatio = netWorth / (targetNetWorth || 1);
  const wealthScore = Math.max(10, Math.min(100, Math.round(netWorthRatio * 60 + 40)));

  // Overall Financial Score (weighted average)
  const financialScore = Math.round(
    (emergencyScore * 0.25) +
    (insuranceScore * 0.2) +
    (retirementScore * 0.25) +
    (debtScore * 0.15) +
    (wealthScore * 0.15)
  );

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (score >= 50) return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-rose-600 bg-rose-50 border-rose-200";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent (Prudent)";
    if (score >= 60) return "Healthy (Stable)";
    if (score >= 40) return "Vulnerable (Needs Planning)";
    return "Critical Correction Required";
  };

  // Recommendations generator
  const getRecommendations = () => {
    const list = [];
    if (emergencyScore < 80) {
      list.push({
        id: "rec-emerg",
        title: "Build Emergency Reserve",
        desc: `Your liquid emergency fund (₹${profile.currentSavings.toLocaleString("en-IN")}) is short of the recommended 6-month safety net of ₹${Math.round(requiredEmergency).toLocaleString("en-IN")}. Park this in a Sweep-in Fixed Deposit or Arbitrage Mutual Fund.`,
        urgency: "High",
      });
    }
    if (healthCover < healthTarget) {
      list.push({
        id: "rec-health-ins",
        title: "Upgrade Health Insurance Coverage",
        desc: `Your health insurance sum-insured (₹${healthCover.toLocaleString("en-IN")}) is below the suggested target of ₹${healthTarget.toLocaleString("en-IN")} for your demographic. Medical inflation runs high in India; look for independent family floaters or Super Top-up plans.`,
        urgency: "High",
      });
    }
    if (termCover < termTarget) {
      list.push({
        id: "rec-term-ins",
        title: "Secure Pure Term Insurance",
        desc: `Your life insurance cover of ₹${termCover.toLocaleString("en-IN")} is short of your safety protection limit of ₹${termTarget.toLocaleString("en-IN")} (${hasDependents ? "15x" : "10x"} annual salary). Pure term schemes are extremely affordable and safeguard dependents completely.`,
        urgency: "High",
      });
    }
    if (profile.investments.nps === 0 && profile.age < 55) {
      list.push({
        id: "rec-nps",
        title: "Activate NPS for Extra Tax Savings",
        desc: "You are currently not contributing to NPS. Under Section 80CCD(1B), you can save tax on an additional ₹50,000 investment over and above the Section 80C limit.",
        urgency: "Medium",
      });
    }
    if (debtToAssetRatio > 0.5) {
      list.push({
        id: "rec-debt",
        title: "Accelerate Debt Reduction",
        desc: `Your total liabilities (₹${totalLoans.toLocaleString("en-IN")}) represent a significant portion of your portfolio. Consider prepaying loans with higher interest rate options first (e.g. Personal loans).`,
        urgency: "High",
      });
    }
    if (retirementScore < 50) {
      list.push({
        id: "rec-ret",
        title: "Boost Long-term Compounding",
        desc: "Based on your age ( " + profile.age + " ), your accumulated retirement base is behind. Accelerate your retirement compounding by opening or increasing direct equity mutual fund SIP contributions.",
        urgency: "High",
      });
    }
    if (profile.investments.mutualFunds === 0) {
      list.push({
        id: "rec-mf",
        title: "Start an Equity Index SIP",
        desc: "Harness the economic growth of India. Set up an automated monthly SIP in a Nifty 50 Index Fund or a Large & Midcap Fund for long-term compounding.",
        urgency: "Medium",
      });
    }
    if (list.length === 0) {
      list.push({
        id: "rec-congrat",
        title: "All Parameters look Prudent!",
        desc: "Excellent discipline! Keep up the regular automated SIPs and continue rebalancing your asset allocations annually.",
        urgency: "Low",
      });
    }
    return list;
  };

  const shareToWhatsApp = () => {
    const currentUrl = getShareableLink("health", "/health-scorecard");
    const scoreLabel = getScoreLabel(financialScore);
    
    const text = `🎯 *My Paisa Financial Health Scorecard*
Overall Score: *${financialScore}/100* (${scoreLabel})
-----------------------------------
🚨 Liquid Emergency Fund Score: ${emergencyScore}/100
🛡️ Protection & Insurance Score: ${insuranceScore}/100
👵 Retirement Readiness Score: ${retirementScore}/100
📑 Debt Burden Index Score: ${debtScore}/100
💰 Capital Wealth Accumulation: ${wealthScore}/100

Measure your instant financial health scorecard here: ${currentUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  const downloadPDFReport = () => {
    const scoreLabel = getScoreLabel(financialScore);
    const recommendations = getRecommendations().map((r, i) => ({
      label: `Recommendation ${i + 1}: ${r.title} [Urgency: ${r.urgency}]`,
      value: r.desc
    }));

    generatePDFReport({
      title: "Financial Health Scorecard & Assessment",
      subtitle: `Comprehensive diagnostics and blueprint summary for ${profile.name || "Subscriber"}`,
      sections: [
        {
          title: "Demographics & Earnings Profile",
          items: [
            { label: "Subscriber Name", value: profile.name || "N/A" },
            { label: "Current Age", value: `${profile.age} Years` },
            { label: "Location Classification", value: profile.city ? profile.city.toUpperCase() : "N/A" },
            { label: "Gross Monthly Salary", value: `INR ${profile.salary.toLocaleString("en-IN")}/mo` },
            { label: "Declared Monthly Living Expenses", value: `INR ${profile.monthlyExpenses.toLocaleString("en-IN")}/mo` }
          ]
        },
        {
          title: "Financial Security Health Indicators",
          items: [
            { label: "Overall Financial Health Score", value: `${financialScore}/100 (${scoreLabel})` },
            { label: "Emergency Reserve Security Index", value: `${emergencyScore}/100` },
            { label: "Risk Protection (Insurance) Score", value: `${insuranceScore}/100` },
            { label: "Retirement Compounding Readiness Score", value: `${retirementScore}/100` },
            { label: "Debt-to-Income / FOIR Score", value: `${debtScore}/100` },
            { label: "Net Asset Wealth Accumulation Score", value: `${wealthScore}/100` }
          ]
        },
        {
          title: "Asset and Liability Statement",
          items: [
            { label: "Liquid Emergency Savings Balance", value: `INR ${profile.currentSavings.toLocaleString("en-IN")}` },
            { label: "Total Asset Investments (Mutual Funds/Stocks/EPF/PPF/etc.)", value: `INR ${currentTotalInvestments.toLocaleString("en-IN")}` },
            { label: "Total Outstanding Loan Liabilities", value: `INR ${totalLoans.toLocaleString("en-IN")}` },
            { label: "Net Worth Calculation", value: `INR ${netWorth.toLocaleString("en-IN")}` }
          ]
        },
        {
          title: "Actionable Optimization Recommendations",
          items: recommendations
        }
      ],
      notes: [
        "Calibrated based on industry-standard financial health parameters, including 6 months of emergency reserves and 10-15x term coverage multipliers.",
        "Your financial health score is a projection. Periodic review and asset reallocation are advised to stay aligned with market factors.",
        "Insurance targets are based on Indian private healthcare escalation and average life expectancy indexes."
      ]
    });
  };

  return (
    <div id="financial-health-check" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 md:p-8 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-100 dark:border-slate-800 pb-5 mb-6 gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-bhagwa-600 bg-bhagwa-50 dark:bg-bhagwa-950/30 px-2.5 py-1 rounded-full">Scorecard</span>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mt-2 font-display">Financial Health & Readiness</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Standard wealth & risk scoring calibrated for salaried employees in India.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={downloadPDFReport}
            className="flex items-center gap-1.5 bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 active:scale-95 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-xs transition-all border-0 cursor-pointer"
          >
            <FileDown className="w-4 h-4" /> Download PDF Report
          </button>
          <button
            onClick={shareToWhatsApp}
            className="flex items-center gap-1.5 bg-[#25D366] hover:bg-[#20ba5a] active:scale-95 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-xs transition-all border-0 cursor-pointer"
          >
            <Share2 className="w-4 h-4" /> Share on WhatsApp
          </button>
          <button
            id="btn-edit-profile"
            onClick={() => {
              if (editMode) handleSave();
              else {
                setFormData({ ...profile });
                setEditMode(true);
              }
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              editMode 
                ? "bg-bhagwa-600 hover:bg-bhagwa-700 text-white shadow-xs" 
                : "bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-750"
            }`}
          >
            {editMode ? "Save Changes" : "Update Financial Inputs"}
          </button>
        </div>
      </div>

      {editMode ? (
        <div id="settings-form" className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-sm">
          {/* Section 1: Demographics */}
          <div className="bg-slate-50/50 p-5 rounded-xl border border-slate-100">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Users className="w-4 h-4 text-slate-500" /> Demographics
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-bhagwa-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Age (Years)</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleInputChange("age", Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Retire Age</label>
                  <input
                    type="number"
                    value={formData.retirementAge}
                    onChange={(e) => handleInputChange("retirementAge", Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Monthly Gross Salary (₹)</label>
                <input
                  type="number"
                  value={formData.salary}
                  onChange={(e) => handleInputChange("salary", Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Est. Monthly Expenses (₹)</label>
                <input
                  type="number"
                  value={formData.monthlyExpenses}
                  onChange={(e) => handleInputChange("monthlyExpenses", Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">City Location Category</label>
                <select
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
                >
                  <option value="tier1">Tier 1 Metro (Mumbai, Delhi, Bangalore)</option>
                  <option value="tier2">Tier 2 Tech City / Town (Patna, Pune, Jaipur)</option>
                  <option value="tier3">Tier 3 Rural / Semi-Urban</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Marital Status</label>
                <select
                  value={formData.maritalStatus}
                  onChange={(e) => handleInputChange("maritalStatus", e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
                >
                  <option value="single">Single (Unmarried)</option>
                  <option value="married">Married (No kids/dependents)</option>
                  <option value="dependents">Married with dependents / kids</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Financial Assets */}
          <div className="bg-slate-50/50 p-5 rounded-xl border border-slate-100">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Wallet className="w-4 h-4 text-emerald-500" /> Liquid & Invested Wealth
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Savings Account / Cash / FD (₹)</label>
                <input
                  type="number"
                  value={formData.currentSavings}
                  onChange={(e) => handleInputChange("currentSavings", Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Mutual Funds Equity (₹)</label>
                <input
                  type="number"
                  value={formData.investments.mutualFunds}
                  onChange={(e) => handleInvestmentChange("mutualFunds", Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Stocks / Equities (₹)</label>
                  <input
                    type="number"
                    value={formData.investments.stocks}
                    onChange={(e) => handleInvestmentChange("stocks", Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Gold (₹)</label>
                  <input
                    type="number"
                    value={formData.investments.gold}
                    onChange={(e) => handleInvestmentChange("gold", Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">EPF Balance (₹)</label>
                  <input
                    type="number"
                    value={formData.investments.epf}
                    onChange={(e) => handleInvestmentChange("epf", Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">PPF Accumulation (₹)</label>
                  <input
                    type="number"
                    value={formData.investments.ppf}
                    onChange={(e) => handleInvestmentChange("ppf", Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">NPS (National Pension Scheme) (₹)</label>
                <input
                  type="number"
                  value={formData.investments.nps}
                  onChange={(e) => handleInvestmentChange("nps", Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
                />
              </div>

              <div className="border-t border-slate-200/60 pt-3 mt-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">Coverage Policies</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Health Sum Insured (₹)</label>
                    <input
                      type="number"
                      step={50000}
                      value={formData.healthInsuranceCover !== undefined ? formData.healthInsuranceCover : 500000}
                      onChange={(e) => handleInputChange("healthInsuranceCover", Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 font-mono focus:outline-none focus:border-bhagwa-500 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Term Life Cover (₹)</label>
                    <input
                      type="number"
                      step={500000}
                      value={formData.termInsuranceCover !== undefined ? formData.termInsuranceCover : 5000000}
                      onChange={(e) => handleInputChange("termInsuranceCover", Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 font-mono focus:outline-none focus:border-bhagwa-500 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Loans & Liabilities */}
          <div className="bg-slate-50/50 p-5 rounded-xl border border-slate-100">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Landmark className="w-4 h-4 text-rose-500" /> Loans & Liabilities
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Home Loan Outstanding (₹)</label>
                <input
                  type="number"
                  value={formData.loans.homeLoan}
                  onChange={(e) => handleLoanChange("homeLoan", Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Car / Vehicle Loan outstanding (₹)</label>
                <input
                  type="number"
                  value={formData.loans.carLoan}
                  onChange={(e) => handleLoanChange("carLoan", Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Personal Loan (₹)</label>
                <input
                  type="number"
                  value={formData.loans.personalLoan}
                  onChange={(e) => handleLoanChange("personalLoan", Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Other Debts (₹)</label>
                <input
                  type="number"
                  value={formData.loans.otherLoan}
                  onChange={(e) => handleLoanChange("otherLoan", Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div id="health-dashboard-view" className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          {/* Left: Overall Dial & Grade */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 bg-slate-50 border border-slate-100 rounded-2xl text-center">
            <span className="text-sm font-medium text-slate-500 mb-2">Overall Blueprint Health Score</span>
            
            {/* SVG Circular Gauge */}
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="68"
                  className="stroke-slate-200 fill-none"
                  strokeWidth="10"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="68"
                  className={`fill-none transition-all duration-1000 ${
                    financialScore >= 80 
                      ? "stroke-emerald-500" 
                      : financialScore >= 60 
                      ? "stroke-amber-500" 
                      : "stroke-rose-500"
                  }`}
                  strokeWidth="10"
                  strokeDasharray={`${2 * Math.PI * 68}`}
                  strokeDashoffset={`${2 * Math.PI * 68 * (1 - financialScore / 100)}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-extrabold text-slate-800 font-display">{financialScore}</span>
                <span className="text-xs text-slate-400">out of 100</span>
              </div>
            </div>

            <div className={`mt-5 px-3 py-1.5 rounded-full text-xs font-semibold border ${getScoreColor(financialScore)}`}>
              {getScoreLabel(financialScore)}
            </div>

            <p className="text-slate-500 text-xs mt-4 max-w-xs leading-relaxed">
              Calculated on active savings velocity, asset diversification, debt liabilities overhead, and safety buffering margins.
            </p>
          </div>

          {/* Right: Sub scores bar indicators */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-5">
            <h3 className="font-semibold text-slate-700 text-sm tracking-wide uppercase">Performance Categories</h3>
            
            {/* Category 1: Emergency Fund */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-600 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-sky-500" /> Emergency Buffer
                </span>
                <span className="text-slate-800">{emergencyScore}% ({profile.currentSavings >= requiredEmergency ? "Protected" : "Deficit"})</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-sky-500 rounded-full transition-all duration-700" style={{ width: `${emergencyScore}%` }}></div>
              </div>
            </div>

            {/* Category 2: Insurance Buffer */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-600 flex items-center gap-1.5">
                  <HeartPulse className="w-4 h-4 text-emerald-500" /> Risk Mitigation
                </span>
                <span className="text-slate-800">
                  {insuranceScore}% 
                  <span className="ml-1 text-[10px] text-slate-400 font-normal">
                    (Health: ₹{termCover ? (healthCover / 100000).toFixed(0) : "0"}L | Term: ₹{termCover ? (termCover / 10000000).toFixed(1) : "0"}Cr)
                  </span>
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all duration-700" style={{ width: `${insuranceScore}%` }}></div>
              </div>
            </div>

            {/* Category 3: Retirement Prep */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-600 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-bhagwa-500" /> Retirement Horizon
                </span>
                <span className="text-slate-800">{retirementScore}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-bhagwa-500 rounded-full transition-all duration-700" style={{ width: `${retirementScore}%` }}></div>
              </div>
            </div>

            {/* Category 4: Debt Health */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-600 flex items-center gap-1.5">
                  <Percent className="w-4 h-4 text-violet-500" /> Leverage Index (Debt Level)
                </span>
                <span className="text-slate-800">{debtScore}% (High is Healthy/Low Debt)</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-violet-500 rounded-full transition-all duration-700" style={{ width: `${debtScore}%` }}></div>
              </div>
            </div>

            {/* Category 5: Wealth Velocity */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-600 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" /> Net Worth Multiplier
                </span>
                <span className="text-slate-800">{wealthScore}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full transition-all duration-700" style={{ width: `${wealthScore}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actionable Recommendations */}
      <div id="ai-recommendations-sec" className="border-t border-slate-100 pt-6">
        <h3 className="font-bold text-slate-800 text-md mb-4 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-bhagwa-600" /> Urgent Action Blueprint Items
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {getRecommendations().map((rec) => (
            <div
              key={rec.id}
              className={`p-4 border rounded-xl flex items-start gap-3 transition-colors ${
                rec.urgency === "High"
                  ? "bg-rose-50/40 border-rose-100"
                  : rec.urgency === "Medium"
                  ? "bg-amber-50/40 border-amber-100"
                  : "bg-emerald-50/40 border-emerald-100"
              }`}
            >
              <div className="mt-1">
                {rec.urgency === "High" ? (
                  <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
                ) : (
                  <ShieldCheck className="w-5 h-5 text-bhagwa-500 shrink-0" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-800 text-sm">{rec.title}</h4>
                  <span
                    className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-sm ${
                      rec.urgency === "High"
                        ? "bg-rose-100 text-rose-700"
                        : rec.urgency === "Medium"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {rec.urgency}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{rec.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
