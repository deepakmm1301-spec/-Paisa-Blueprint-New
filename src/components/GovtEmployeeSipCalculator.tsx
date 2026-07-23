import React, { useState, useMemo } from "react";
import { Sparkles, Share2, HelpCircle, Info, Calculator, Percent, ShieldCheck, ArrowUpRight, TrendingUp, FileDown } from "lucide-react";
import { getShareableLink } from "../types";
import { generatePDFReport } from "../utils/pdfGenerator";

interface GovtEmployeeSipCalculatorProps {
  language?: "en" | "hi";
}

export default function GovtEmployeeSipCalculator({ language = "en" }: GovtEmployeeSipCalculatorProps = {}) {
  const [currentSalary, setCurrentSalary] = useState<number>(60000); // Gross monthly
  const [annualIncrement, setAnnualIncrement] = useState<number | "">(3); // Government increment is usually 3% basic
  const [daGrowth, setDaGrowth] = useState<number | "">(4); // Average DA increases 4% annually
  const [monthlySip, setMonthlySip] = useState<number>(6000); // Starting SIP
  const [investmentYears, setInvestmentYears] = useState<number>(20); // Years to retirement
  const [sipReturnRate, setSipReturnRate] = useState<number | "">(12); // Mutual fund conservative CAGR
  const [stepUpPercent, setStepUpPercent] = useState<number | "">(8); // Auto step-up matching salary hike

  // Calculations for retirement corpus and Pension + SIP Combined projections
  const projectionData = useMemo(() => {
    const activeSipReturnRate = typeof sipReturnRate === "string" ? 0 : sipReturnRate;
    const activeStepUpPercent = typeof stepUpPercent === "string" ? 0 : stepUpPercent;
    const activeAnnualIncrement = typeof annualIncrement === "string" ? 0 : annualIncrement;
    const activeDaGrowth = typeof daGrowth === "string" ? 0 : daGrowth;

    let salary = currentSalary;
    let activeSip = monthlySip;
    let npsBalance = 0; // Accumulated NPS estimate
    let sipBalance = 0; // Step-up SIP balance
    let totalSipInvested = 0;
    let totalNpsInvested = 0;

    // We assume 10% employee NPS + 14% Employer NPS = 24% of Basic + DA (approx 16% of gross salary)
    // with 9% moderate NPS compounding return (mostly bonds & some equity)
    const npsMonthlyRate = 9 / 12 / 100;
    const sipMonthlyRate = activeSipReturnRate / 12 / 100;

    const yearlyDataPoints: Array<{
      year: number;
      salary: number;
      monthlySip: number;
      sipValue: number;
      npsValue: number;
      combinedValue: number;
    }> = [];

    for (let yr = 1; yr <= investmentYears; yr++) {
      // 12 months step execution
      for (let m = 0; m < 12; m++) {
        // NPS Employee + Employer Contribution approx 16% of current monthly gross salary
        const monthlyNpsContribution = salary * 0.16;
        npsBalance = (npsBalance + monthlyNpsContribution) * (1 + npsMonthlyRate);
        totalNpsInvested += monthlyNpsContribution;

        // SIP Compounding
        sipBalance = (sipBalance + activeSip) * (1 + sipMonthlyRate);
        totalSipInvested += activeSip;
      }

      yearlyDataPoints.push({
        year: yr,
        salary,
        monthlySip: activeSip,
        sipValue: Math.round(sipBalance),
        npsValue: Math.round(npsBalance),
        combinedValue: Math.round(sipBalance + npsBalance)
      });

      // Annual increments take place at the end of every year
      const totalHike = activeAnnualIncrement + activeDaGrowth;
      salary = Math.round(salary * (1 + totalHike / 100));
      
      // Step Up monthly SIP matching stepUpPercent
      activeSip = Math.round(activeSip * (1 + activeStepUpPercent / 100));
    }

    // Annuity projections for combined Pension + SIP
    // Safe withdrawal rate or annuity rate of 6% on retirement corpus
    const finalSipBalance = Math.round(sipBalance);
    const finalNpsBalance = Math.round(npsBalance);
    const combinedCorpus = finalSipBalance + finalNpsBalance;

    // Gratuity estimate: Basic * 15/30 * years (capped at Rs 25 Lakhs)
    const estBasic = Math.round((salary / 1.5)); // Approx basic
    const estimatedGratuity = Math.min(2500000, Math.round(((estBasic) * 15 * investmentYears) / 30));

    // Combined Monthly Income Projection post-retirement:
    // NPS mandates 40% annuity conversion minimum
    const annuityRatio = 0.40;
    const annuityCorpus = finalNpsBalance * annuityRatio;
    const lumpsumNpsCorpus = finalNpsBalance * (1 - annuityRatio);

    // Dynamic Monthly Pension out of annuity (assumed 6% annuity yield rate)
    const monthlyNpsPension = Math.round((annuityCorpus * 0.06) / 12);
    
    // Monthly safe payout from mutual fund SIP and NPS lumpsum combined (at 5% SWP rate)
    const monthlySipSafeWithdrawal = Math.round(((finalSipBalance + lumpsumNpsCorpus) * 0.05) / 12);

    const totalEstimatedMonthlyRetirementIncome = monthlyNpsPension + monthlySipSafeWithdrawal;

    return {
      finalSipBalance,
      finalNpsBalance,
      combinedCorpus,
      totalSipInvested,
      totalNpsInvested,
      estimatedGratuity,
      monthlyNpsPension,
      monthlySipSafeWithdrawal,
      totalEstimatedMonthlyRetirementIncome,
      yearlyDataPoints
    };
  }, [currentSalary, annualIncrement, daGrowth, monthlySip, investmentYears, sipReturnRate, stepUpPercent]);

  const shareToWhatsApp = () => {
    const currentUrl = getShareableLink("govt_sip", "/government-employee-sip-calculator");
    const text = language === "hi"
      ? `🌴 *BPSC शिक्षक एसआईपी + सेवानिवृत्ति योजना अनुमान*\nप्रारंभिक सकल वेतन: ₹${currentSalary.toLocaleString("en-IN")}/माह\nमासिक एसआईपी: ₹${monthlySip.toLocaleString("en-IN")}/माह (${stepUpPercent}% सालाना वृद्धि के साथ)\nअवधि: ${investmentYears} वर्ष\n-----------------------------------\n*एसआईपी संचित धन: ₹${projectionData.finalSipBalance.toLocaleString("en-IN")}*\nएनपीएस (NPS) कोष: ₹${projectionData.finalNpsBalance.toLocaleString("en-IN")}\n*कुल मिलाकर नेट फंड संपदा: ₹${projectionData.combinedCorpus.toLocaleString("en-IN")}*\n*अपेक्षित मासिक पेंशन + SWP आय: ₹${projectionData.totalEstimatedMonthlyRetirementIncome.toLocaleString("en-IN")}/माह*\n\nअपनी शिक्षक एसआईपी व वेल्थ वेव की गणना यहाँ करें: ${currentUrl}`
      : `🌴 *BPSC Teacher SIP + Retirement Planner Projections*\nStarting Gross: ₹${currentSalary.toLocaleString("en-IN")}/mo\nMonthly SIP: ₹${monthlySip.toLocaleString("en-IN")}/mo (with ${stepUpPercent}% hike)\nTenure: ${investmentYears} Years\n-----------------------------------\n*Wealth Corpus: ₹${projectionData.finalSipBalance.toLocaleString("en-IN")}*\nNPS Balance: ₹${projectionData.finalNpsBalance.toLocaleString("en-IN")}\n*Combined Net Corpus: ₹${projectionData.combinedCorpus.toLocaleString("en-IN")}*\n*Est. Max Pension + SWP: ₹${projectionData.totalEstimatedMonthlyRetirementIncome.toLocaleString("en-IN")}/mo*\n\nChart your teacher compounding roadmap here: ${currentUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  const downloadPDFReport = () => {
    generatePDFReport({
      title: language === "hi" ? "सरकारी कर्मचारी एसआईपी और सेवानिवृत्ति रिपोर्ट" : "Govt Employee SIP & Retirement Report",
      subtitle: language === "hi" ? "वेतन वृद्धि, एनपीएस और एसआईपी संयुक्त विश्लेषण" : "Detailed salary progression, step-up SIP and NPS pension simulation",
      language,
      sections: [
        {
          title: language === "hi" ? "प्रारंभिक वित्तीय विवरण" : "Initial Financial Parameters",
          items: [
            { label: language === "hi" ? "प्रारंभिक मासिक सकल वेतन" : "Starting Gross Monthly Salary", value: `INR ${currentSalary.toLocaleString("en-IN")}` },
            { label: language === "hi" ? "प्रारंभिक मासिक निवेश (SIP)" : "Initial Monthly SIP Amount", value: `INR ${monthlySip.toLocaleString("en-IN")}` },
            { label: language === "hi" ? "वार्षिक वेतन वृद्धि दर (Basic)" : "Annual Basic Pay Increment", value: `${annualIncrement}%` },
            { label: language === "hi" ? "वार्षिक महंगाई भत्ता वृद्धि (DA)" : "Annual DA Expansion Rate", value: `${daGrowth}%` },
            { label: language === "hi" ? "वार्षिक एसआईपी वृद्धि (Step-up)" : "Annual SIP Step-up Rate", value: `${stepUpPercent}%` }
          ]
        },
        {
          title: language === "hi" ? "दीर्घकालिक संचय विवरण (20 वर्ष)" : "Long-Term Wealth Accumulation (20 Years)",
          items: [
            { label: language === "hi" ? "कुल एसआईपी संचित धन" : "Accumulated SIP Mutual Funds", value: `INR ${projectionData.finalSipBalance.toLocaleString("en-IN")}` },
            { label: language === "hi" ? "कुल संचित एनपीएस राशि" : "Accumulated NPS Pension Corpus", value: `INR ${projectionData.finalNpsBalance.toLocaleString("en-IN")}` },
            { label: language === "hi" ? "ग्रेच्युटी अनुमान (Gratuity)" : "Estimated State Gratuity Pay", value: `INR ${projectionData.estimatedGratuity.toLocaleString("en-IN")}` },
            { label: language === "hi" ? "कुल संयुक्त संपत्ति (Corpus)" : "Combined Net Wealth Corpus", value: `INR ${projectionData.combinedCorpus.toLocaleString("en-IN")}` }
          ]
        },
        {
          title: language === "hi" ? "मासिक सेवानिवृत्ति आय अनुमान" : "Monthly Retirement Income Projection",
          items: [
            { label: language === "hi" ? "एनपीएस संचित वार्षिकी पेंशन (40% वार्षिकी)" : "NPS Monthly Pension (from 40% Annuity)", value: `INR ${projectionData.monthlyNpsPension.toLocaleString("en-IN")}/mo` },
            { label: language === "hi" ? "सुरक्षित निकासी दर (SWP) मासिक आय" : "Safe SWP Payout (from SIP + 60% NPS)", value: `INR ${projectionData.monthlySipSafeWithdrawal.toLocaleString("en-IN")}/mo` },
            { label: language === "hi" ? "कुल अनुमानित मासिक सेवानिवृत्ति आय" : "Total Estimated Monthly Income", value: `INR ${projectionData.totalEstimatedMonthlyRetirementIncome.toLocaleString("en-IN")}/mo` }
          ]
        }
      ],
      notes: language === "hi" ? [
        "वेतन वृद्धि की दर राज्य कर्मचारी नियमावली के 3% वार्षिक मानक बुनियादी ढांचे पर आधारित है।",
        "एनपीएस का 40% अनिवार्य रूप से वार्षिकी में निवेश किया जाता है जो आजीवन मासिक पेंशन प्रदान करता है।",
        "एसआईपी तथा 60% एनपीएस एकमुश्त राशि पर 5% सुरक्षित निकासी दर (SWP) लागू करके मासिक आय को अधिकतम किया गया है।"
      ] : [
        "Annual increments map to the 3% standard base salary hikes mandated for Bihar State Government employees.",
        "NPS regulations enforce a minimum of 40% annuity conversion to generate monthly life-long pensions.",
        "Safe SWP is computed at a highly conservative 5% annual payout on mutual funds and tax-free lumpsum NPS."
      ]
    });
  };

  return (
    <div id="govt-sip-calculator" className="w-full max-w-5xl mx-auto p-4 sm:p-6 bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
      
      {/* Title Header */}
      <div className="mb-8 text-center sm:text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 dark:border-slate-800/60 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 text-xs font-black rounded-full mb-3 shadow-sm uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Compounding Blueprint
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-slate-800 dark:text-white leading-tight">
            BPSC Teacher SIP Calculator & Retirement Planner
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 font-medium max-w-2xl">
            A state-of-the-art calculator tuned specifically for BPSC Teachers & state officers. Computes the combined effect of basic pay increments, DA hikes, step-up SIPs, and NPS balance.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
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
            <span>{language === "hi" ? "सहेजें और साझा करें" : "Save & Share on WhatsApp"}</span>
          </button>
        </div>
      </div>

      {/* Inputs vs Outputs panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sliders Input column */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-md space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Calculator className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-extrabold text-slate-800 dark:text-white text-base">Hike & SIP Parameters</h3>
          </div>

          {/* Starting Monthly Salary Slider */}
          <div>
            <div className="flex justify-between items-center text-xs font-semibold mb-2">
              <span className="font-black text-slate-500 uppercase tracking-wide">Gross Monthly Salary</span>
              <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-0.5">
                <span className="text-slate-450 dark:text-slate-400 font-bold text-[10px]">₹</span>
                <input
                  type="number"
                  value={currentSalary || ""}
                  onChange={(e) => {
                    const val = e.target.value === "" ? 0 : parseInt(e.target.value);
                    setCurrentSalary(isNaN(val) ? 0 : val);
                  }}
                  className="w-20 text-right bg-transparent text-indigo-600 dark:text-indigo-400 font-extrabold text-xs border-0 p-0 focus:ring-0 focus:outline-none"
                  placeholder="25000"
                />
                <span className="text-slate-450 dark:text-slate-400 font-bold text-[9px] uppercase">/mo</span>
              </div>
            </div>
            <input
              type="range"
              min={25000}
              max={250000}
              step={5000}
              value={currentSalary}
              onChange={(e) => setCurrentSalary(parseInt(e.target.value))}
              className="w-full accent-indigo-505 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Starting Monthly Mutual Fund SIP */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-2">
              <span className="font-black text-slate-500 uppercase tracking-wide">Starting Monthly SIP</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">₹{monthlySip.toLocaleString("en-IN")}/mo</span>
            </div>
            <input
              type="range"
              min={1000}
              max={50000}
              step={500}
              value={monthlySip}
              onChange={(e) => setMonthlySip(parseInt(e.target.value))}
              className="w-full accent-indigo-505 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Investment Tenure until retirement */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-2">
              <span className="font-black text-slate-500 uppercase tracking-wide">Runway till Retirement</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">{investmentYears} Years</span>
            </div>
            <input
              type="range"
              min={5}
              max={40}
              step={1}
              value={investmentYears}
              onChange={(e) => setInvestmentYears(parseInt(e.target.value))}
              className="w-full accent-indigo-505 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Estimated Core Parameters Grid */}
          <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800 pt-4">
            
            <div>
              <label className="block text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-wider">SIP Return CAGR %</label>
              <input
                type="number"
                value={sipReturnRate}
                min={0}
                max={30}
                onChange={(e) => {
                  const val = e.target.value;
                  setSipReturnRate(val === "" ? "" : parseFloat(val) || 0);
                }}
                className="w-full bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-750 p-2 text-xs font-bold text-slate-800 dark:text-white"
                placeholder="12"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-wider">Annual SIP Step Up %</label>
              <input
                type="number"
                value={stepUpPercent}
                min={0}
                max={100}
                onChange={(e) => {
                  const val = e.target.value;
                  setStepUpPercent(val === "" ? "" : parseInt(val) || 0);
                }}
                className="w-full bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-750 p-2 text-xs font-bold text-slate-800 dark:text-white"
                placeholder="8"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-wider">Basic Increment %</label>
              <input
                type="number"
                value={annualIncrement}
                min={0}
                max={50}
                onChange={(e) => {
                  const val = e.target.value;
                  setAnnualIncrement(val === "" ? "" : parseInt(val) || 0);
                }}
                className="w-full bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-750 p-2 text-xs font-bold text-slate-800 dark:text-white"
                placeholder="3"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-wider">Est. Annual DA Hike %</label>
              <input
                type="number"
                value={daGrowth}
                min={0}
                max={50}
                onChange={(e) => {
                  const val = e.target.value;
                  setDaGrowth(val === "" ? "" : parseInt(val) || 0);
                }}
                className="w-full bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-750 p-2 text-xs font-bold text-slate-800 dark:text-white"
                placeholder="4"
              />
            </div>

          </div>
        </div>

        {/* Dynamic Display Outputs */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          <div className="bg-white border border-slate-200/80 dark:bg-slate-900 dark:border-slate-800/80 text-slate-900 dark:text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />

            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
              <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Compound Retirement Forecast</span>
              <span className="text-[9px] bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-extrabold px-2 py-0.5 rounded-full">
                {`After ${investmentYears} Years Run`}
              </span>
            </div>

            {/* Combined Corpus */}
            <div className="bg-indigo-500/5 dark:bg-indigo-950/20 border border-indigo-500/15 rounded-2xl p-5 mb-5 text-center">
              <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-wider block">Combined Projected Capital Corpus</span>
              <p className="text-3xl sm:text-4xl font-extrabold text-slate-850 dark:text-white mt-1.5 font-sans">
                ₹{projectionData.combinedCorpus.toLocaleString("en-IN")}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-medium select-none">
                {`Consists of Mutual Fund SIP: ₹${projectionData.finalSipBalance.toLocaleString("en-IN")} + Accumulated NPS: ₹${projectionData.finalNpsBalance.toLocaleString("en-IN")}`}
              </p>
            </div>

            {/* Pension vs Withdrawal Breakdown Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-150/60 dark:border-slate-800/50 rounded-2xl p-4">
                <span className="text-[10px] text-indigo-600 dark:text-indigo-300 font-extrabold uppercase tracking-wide block">NPS Monthly Annuity Pension</span>
                <p className="text-xl font-black text-slate-850 dark:text-white mt-1">₹{projectionData.monthlyNpsPension.toLocaleString("en-IN")}</p>
                <p className="text-[9px] text-slate-500 dark:text-slate-400 mt-1 font-medium leading-normal">
                  Based on 40% NPS capital purchase with 6% safe annuity rate.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-150/60 dark:border-slate-800/50 rounded-2xl p-4">
                <span className="text-[10px] text-indigo-600 dark:text-indigo-300 font-extrabold uppercase tracking-wide block">SWP Monthly Safe Payout</span>
                <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">₹{projectionData.monthlySipSafeWithdrawal.toLocaleString("en-IN")}</p>
                <p className="text-[9px] text-slate-500 dark:text-slate-400 mt-1 font-medium leading-normal">
                  Based on a sustainable 5% Safe Withdrawal Rate from your mutual fund nest-egg.
                </p>
              </div>

            </div>

            {/* Total Combined Monthly Cash flow projection */}
            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-150/60 dark:border-slate-800/50 rounded-2xl p-4.5 mt-4 flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] text-indigo-600 dark:text-indigo-300 font-black uppercase tracking-wider block">Total Estimated Monthly Retirement cashflow</span>
                <p className="text-2xl font-black text-slate-850 dark:text-white mt-0.5">₹{projectionData.totalEstimatedMonthlyRetirementIncome.toLocaleString("en-IN")}</p>
              </div>
              <div className="text-right shrink-0">
                <div className="font-extrabold text-emerald-600 dark:text-emerald-450 flex items-center gap-1 justify-end text-xs">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Combined Power
                </div>
                <span className="text-[9px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 block">Estimated Gratuity bonus: ₹{projectionData.estimatedGratuity.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Breakdown lines */}
            <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 mt-6 mb-3 uppercase tracking-wider">Retirement Savings Architecture</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/50 font-medium">
                <span className="text-slate-500 dark:text-slate-400">Total Capital Invested (SIP+NPS)</span>
                <span className="text-slate-800 dark:text-slate-200 font-bold">₹{Math.round(projectionData.totalSipInvested + projectionData.totalNpsInvested).toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/50 font-medium">
                <span className="text-slate-500 dark:text-slate-400">Earned Compound Interest Wealth Gained</span>
                <span className="text-emerald-600 dark:text-emerald-450 font-bold">+ ₹{Math.round(projectionData.combinedCorpus - (projectionData.totalSipInvested + projectionData.totalNpsInvested)).toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between py-1 font-semibold text-indigo-600 dark:text-indigo-400">
                <span>Monthly SIP at final retirement age</span>
                <span className="font-bold">₹{projectionData.yearlyDataPoints[projectionData.yearlyDataPoints.length - 1]?.monthlySip.toLocaleString("en-IN")}/mo</span>
              </div>
            </div>

          </div>

          {/* Practical Planning Advice */}
          <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200/50 dark:border-indigo-900/40 p-4 rounded-2xl flex gap-3 text-xs text-indigo-800 dark:text-indigo-400">
            <TrendingUp className="w-5 h-5 shrink-0 text-indigo-600 dark:text-indigo-550 mt-0.5" />
            <div>
              <p className="font-extrabold text-indigo-900 dark:text-indigo-300">The Power of the Increment Step-Up Mutual Fund</p>
              <p className="mt-0.5 font-medium leading-relaxed">
                By investing your yearly basic pay increment (3%) and biannual DA raises (averaging 4-5%) directly into a systematic 8% step-up SIP, you maintain lifestyle parity while exponentially multiplying your terminal nest-egg compared to keeping a flat SIP profile!
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Narrative Guide */}
      <div className="mt-12 border-t border-slate-200 dark:border-slate-800 pt-8 space-y-8">
        
        <section className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 space-y-4">
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white font-display tracking-tight border-l-4 border-indigo-500 pl-3">
            Why Government Employees Need a Dedicated SIP Compounding Plan?
          </h2>
          <p className="text-sm leading-relaxed font-semibold text-indigo-600 dark:text-indigo-400">
            For employees joining the central government or state departments (such as railways, defense, banking, or KVS educational boards) post-1st Jan 2004, the safe safety net of the Old Pension Scheme (OPS) is replaced by the National Pension System (NPS). 
          </p>
          <p className="text-sm leading-relaxed font-medium text-justify">
            While NPS provides tax-saving incentives and reliable exposure to hybrid debt/equity models, the returns are typically optimized at a modest 8-10% rate to reflect capital preservation guidelines. To counter the long-term impact of health consumer inflation and fully achieve financial milestones like child education, marriage, and early retirement, public service officials require a parallel compound SIP index portfolio.
          </p>

          <h3 className="text-base font-black text-slate-800 dark:text-white pt-2">Combining Pension (NPS) + Lumpsum SIP Mutual Funds</h3>
          <p className="text-sm leading-relaxed font-medium">
            A dynamic retirement plan builds two robust bridges:
          </p>
          <ol className="text-sm text-slate-600 dark:text-slate-400 pl-5 list-decimal space-y-2 font-medium">
            <li><strong>The Pension Bridge (NPS Annuity):</strong> Reinvests 40% of accumulated retirement NPS balance inside certified insurance annuity funds yielding a steady, predictable monthly lifestyle check.</li>
            <li><strong>The Growth Bridge (SIP Mutual Funds Nest-egg):</strong> Unlocks direct compounding in index, large-cap, or mid-cap funds (experiencing typical historical growth rates of 12-15%). You can safely withdraw 4-5% annually out of this nest-egg using a Systematic Withdrawal Plan (SWP), generating a massive, inflation-proof monthly yield!</li>
          </ol>
        </section>

        {/* FAQs */}
        <section className="space-y-4">
          <h2 className="text-xl font-black text-slate-800 dark:text-white font-display tracking-tight flex items-center gap-2 mb-4">
            <HelpCircle className="w-5 h-5 text-indigo-500" />
            Frequently Asked Questions regarding Government SIP Plans
          </h2>
          <div className="space-y-4 text-slate-600 dark:text-slate-300 font-medium">
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4.5 rounded-2xl shadow-sm">
              <h4 className="text-sm font-black text-slate-800 dark:text-white mb-1.5">Can a state government employee invest in Mutual Funds?</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Absolutely yes! There are no legal obstacles under code of conduct guidelines for any government official to buy mutual fund units or register systematic SIP portfolios, provided the transaction is conducted through clean banking channels and is not active intra-day stock speculation.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4.5 rounded-2xl shadow-sm">
              <h4 className="text-sm font-black text-slate-800 dark:text-white mb-1.5">How is the pension calculated for employees under NPS?</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                By guidelines, at retirement age (60), up to 60% of the total NPS balance is lump-sum withdrawable tax-free. The remaining 40% must be converted to an annuity plan under an IRDAI-approved life insurer (e.g. LIC, SBI Life, HDFC Life) to receive regular monthly pension payments.
              </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
