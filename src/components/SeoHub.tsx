import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Calculator, 
  BookOpen, 
  Compass, 
  TrendingUp, 
  HelpCircle, 
  ChevronRight, 
  Search, 
  Award, 
  Coins, 
  Percent, 
  ArrowRight, 
  Briefcase, 
  ShieldCheck, 
  Wallet, 
  Layers, 
  Clock, 
  Sparkles,
  RefreshCw,
  Scale,
  Users,
  Target,
  FileText,
  AlertCircle
} from "lucide-react";
import { glossaryTerms, dynamicTermsDatabase, GlossaryTerm } from "./SeoHubData";

interface SeoHubProps {
  userGrossMonthly?: number;
}

export default function SeoHub({ userGrossMonthly = 100000 }: SeoHubProps) {
  const [activeTab, setActiveTab] = useState<"calculators" | "glossary" | "guides">("calculators");
  
  // Glossary States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGlossaryLetter, setSelectedGlossaryLetter] = useState<string>("All");
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>("All");
  const [glossaryExpandedWord, setGlossaryExpandedWord] = useState<string | null>(null);

  // Active Category & Guide states
  const [selectedCalculatorsType, setSelectedCalculatorsType] = useState<string>("sip");
  const [selectedGuideId, setSelectedGuideId] = useState<string>("tax-regime");

  // Word of the Day state (cached or random)
  const [wordOfTheDayIndex, setWordOfTheDayIndex] = useState(() => {
    return Math.floor(Math.sin(new Date().getDate()) * 50) + 50 % glossaryTerms.length;
  });

  const wordOfTheDay = glossaryTerms[Math.abs(wordOfTheDayIndex) % glossaryTerms.length];

  // Alphabet search listing
  const alphabetLetters = ["All", "A", "B", "C", "D", "E", "F", "G", "H", "I", "K", "L", "M", "N", "O", "P", "R", "S", "T", "U", "V", "W", "X", "Z"];

  // Glossary Query match
  const filteredGlossary = useMemo(() => {
    return glossaryTerms.filter((term) => {
      const matchesSearch = 
        term.word.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (term.hindiWord && term.hindiWord.includes(searchQuery)) ||
        term.definition.toLowerCase().includes(searchQuery.toLowerCase());
      
      const firstLetter = term.word.charAt(0).toUpperCase();
      const matchesLetter = selectedGlossaryLetter === "All" || firstLetter === selectedGlossaryLetter;
      const matchesCategory = activeCategoryFilter === "All" || term.category === activeCategoryFilter;

      return matchesSearch && matchesLetter && matchesCategory;
    });
  }, [searchQuery, selectedGlossaryLetter, activeCategoryFilter]);

  // Extended Search suggestions for the rest of the 500 dynamic terms
  const matchedExtendedSuggestions = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) return [];
    return dynamicTermsDatabase.filter(word => 
      word.toLowerCase().includes(searchQuery.toLowerCase()) && 
      !glossaryTerms.some(t => t.word.toLowerCase() === word.toLowerCase())
    ).slice(0, 10);
  }, [searchQuery]);

  // Dynamic calculations variables
  // 1. SIP Calculator states
  const [sipMonthly, setSipMonthly] = useState(10000);
  const [sipRate, setSipRate] = useState(12);
  const [sipYears, setSipYears] = useState(15);
  // 2. Lumpsum States
  const [lumpsumAmt, setLumpsumAmt] = useState(100000);
  const [lumpsumRate, setLumpsumRate] = useState(12);
  const [lumpsumYears, setLumpsumYears] = useState(15);
  // 3. SWP States
  const [swpInitial, setSwpInitial] = useState(1000000);
  const [swpMonthlyWithdrawal, setSwpMonthlyWithdrawal] = useState(10000);
  const [swpRate, setSwpRate] = useState(8);
  const [swpYears, setSwpYears] = useState(15);
  // 4. PPF States
  const [ppfAnnual, setPpfAnnual] = useState(50000);
  const [ppfYears, setPpfYears] = useState(15);
  // 5. FD States
  const [fdAmt, setFdAmt] = useState(100000);
  const [fdRate, setFdRate] = useState(7.1);
  const [fdYears, setFdYears] = useState(5);
  // 6. RD States
  const [rdMonthly, setRdMonthly] = useState(5000);
  const [rdRate, setRdRate] = useState(6.8);
  const [rdYears, setRdYears] = useState(5);
  // 7. Salary States
  const [salaryBasicPct, setSalaryBasicPct] = useState(50);
  const [salaryHraPct, setSalaryHraPct] = useState(40);
  const [salaryBonusAmt, setSalaryBonusAmt] = useState(50000);
  // 8. Gratuity States
  const [gratuitySalaryBasic, setGratuitySalaryBasic] = useState(50000);
  const [gratuityYears, setGratuityYears] = useState(10);
  // 9. NPS States
  const [npsMonthly, setNpsMonthly] = useState(5000);
  const [npsRate, setNpsRate] = useState(10);
  const [npsCurrentAge, setNpsCurrentAge] = useState(30);
  const [npsAnnuityPct, setNpsAnnuityPct] = useState(40);
  // 10. EMI States
  const [emiPrincipal, setEmiPrincipal] = useState(3000000);
  const [emiRate, setEmiRate] = useState(8.5);
  const [emiTenureYears, setEmiTenureYears] = useState(20);

  // Custom Projections
  // 5000 SIP 20 years target
  const [customSip5kYears, setCustomSip5kYears] = useState(20);
  const [customSip5kRate, setCustomSip5kRate] = useState(12);

  // SIP vs FD Compare States
  const [compareMonthly, setCompareMonthly] = useState(10000);
  const [compareYears, setCompareYears] = useState(15);
  const [compareSipRate, setCompareSipRate] = useState(12);
  const [compareFdRate, setCompareFdRate] = useState(6.8);

  // 50-30-20 Budget state
  const [budgetIncome, setBudgetIncome] = useState(80000);

  // How much SIP is needed for 1 Crore state
  const [oneCroreTimeline, setOneCroreTimeline] = useState(15);
  const [oneCroreReturns, setOneCroreReturns] = useState(12);

  // Indian format helpers
  const fmtIndian = (num: number) => {
    return "₹" + Math.round(num).toLocaleString("en-IN");
  };

  // CALCULATORS COMPILATION
  const calcsResults = useMemo(() => {
    // 1. SIP Compilation
    const monthlyRateSip = (sipRate / 100) / 12;
    const monthsSip = sipYears * 12;
    const investedSip = sipMonthly * monthsSip;
    const valueSip = sipMonthly * ((Math.pow(1 + monthlyRateSip, monthsSip) - 1) / monthlyRateSip) * (1 + monthlyRateSip);
    const gainsSip = Math.max(0, valueSip - investedSip);

    // 2. Lumpsum Compilation
    const investedLumpsum = lumpsumAmt;
    const valueLumpsum = lumpsumAmt * Math.pow(1 + (lumpsumRate / 100), lumpsumYears);
    const gainsLumpsum = Math.max(0, valueLumpsum - investedLumpsum);

    // 3. SWP Computation
    const monthlyRateSwp = (swpRate / 100) / 12;
    const monthsSwp = swpYears * 12;
    let swpBalance = swpInitial;
    let totalWithdrawnSwp = 0;
    for (let m = 1; m <= monthsSwp; m++) {
      swpBalance = swpBalance * (1 + monthlyRateSwp);
      if (swpBalance >= swpMonthlyWithdrawal) {
        swpBalance -= swpMonthlyWithdrawal;
        totalWithdrawnSwp += swpMonthlyWithdrawal;
      } else {
        totalWithdrawnSwp += swpBalance;
        swpBalance = 0;
        break;
      }
    }

    // 4. PPF Calculation (7.1% compounded annually)
    const ppfRate = 7.1 / 100;
    let ppfBalance = 0;
    let ppfInvestedTotal = 0;
    for (let y = 1; y <= ppfYears; y++) {
      ppfInvestedTotal += ppfAnnual;
      // Compounded at the end of every year
      ppfBalance = (ppfBalance + ppfAnnual) * (1 + ppfRate);
    }
    const ppfGains = Math.max(0, ppfBalance - ppfInvestedTotal);

    // 5. FD Calculation (Quarterly Compounding is standard in India)
    const fdInvested = fdAmt;
    const fdPeriodsPerYear = 4; // quarterly
    const fdValue = fdAmt * Math.pow(1 + (fdRate / 100) / fdPeriodsPerYear, fdPeriodsPerYear * fdYears);
    const fdGains = Math.max(0, fdValue - fdInvested);

    // 6. RD Calculation (Quarterly compounding of monthly deposits)
    const rdInvested = rdMonthly * rdYears * 12;
    const r_quarterly = (rdRate / 100) / 4;
    const rdTotalMonths = rdYears * 12;
    let rdValue = 0;
    // Approximated compounding as standard banks
    const monthlyRateRd = (rdRate / 100) / 12;
    for (let m = 1; m <= rdTotalMonths; m++) {
      rdValue = (rdValue + rdMonthly) * (1 + monthlyRateRd);
    }
    const rdGains = Math.max(0, rdValue - rdInvested);

    // 7. Salary Breakdown
    const salBasic = (userGrossMonthly * salaryBasicPct) / 100;
    const salHra = (salBasic * salaryHraPct) / 100;
    const salPfDeduction = salBasic * 0.12; // EPF Standard
    const salBonusMonthly = salaryBonusAmt / 12;
    const salTotalGross = userGrossMonthly + salBonusMonthly;
    const salInHandEstimated = salTotalGross - salPfDeduction - 200; // 200 PTax

    // 8. Gratuity Calculation
    const gratuityCalculated = (15 / 26) * gratuitySalaryBasic * gratuityYears;

    // 9. NPS Calculator
    const npsMonths = (60 - npsCurrentAge) * 12;
    const npsMonthlyRate = (npsRate / 100) / 12;
    const npsInvested = npsMonthly * npsMonths;
    let npsExpectedCorpus = 0;
    if (npsMonths > 0) {
      npsExpectedCorpus = npsMonthly * ((Math.pow(1 + npsMonthlyRate, npsMonths) - 1) / npsMonthlyRate) * (1 + npsMonthlyRate);
    }
    const npsLumpCashout = npsExpectedCorpus * ((100 - npsAnnuityPct) / 100);
    const npsAnnuityCorpus = npsExpectedCorpus * (npsAnnuityPct / 100);
    const npsExpectedMonthlyPension = (npsAnnuityCorpus * 0.06) / 12; // Standard 6% annuity yield

    // 10. EMI Calculation
    const emiMonthlyRate = (emiRate / 100) / 12;
    const emiMonths = emiTenureYears * 12;
    let emiAmount = 0;
    if (emiMonthlyRate > 0) {
      emiAmount = (emiPrincipal * emiMonthlyRate * Math.pow(1 + emiMonthlyRate, emiMonths)) / (Math.pow(1 + emiMonthlyRate, emiMonths) - 1);
    } else {
      emiAmount = emiPrincipal / emiMonths;
    }
    const emiTotalPayable = emiAmount * emiMonths;
    const emiTotalInterest = Math.max(0, emiTotalPayable - emiPrincipal);

    return {
      sip: { invested: investedSip, value: valueSip, gains: gainsSip },
      lumpsum: { invested: investedLumpsum, value: valueLumpsum, gains: gainsLumpsum },
      swp: { invested: swpInitial, withdrawn: totalWithdrawnSwp, balance: swpBalance },
      ppf: { invested: ppfInvestedTotal, value: ppfBalance, gains: ppfGains },
      fd: { invested: fdInvested, value: fdValue, gains: fdGains },
      rd: { invested: rdInvested, value: rdValue, gains: rdGains },
      salary: { basic: salBasic, hra: salHra, pf: salPfDeduction, inHand: salInHandEstimated, totalGross: salTotalGross },
      gratuity: { amount: gratuityCalculated },
      nps: { corpus: npsExpectedCorpus, cashout: numpCheck(npsLumpCashout), annuity: numpCheck(npsAnnuityCorpus), pension: numpCheck(npsExpectedMonthlyPension), invested: npsInvested },
      emi: { emi: emiAmount, interest: emiTotalInterest, total: emiTotalPayable }
    };
  }, [
    sipMonthly, sipRate, sipYears,
    lumpsumAmt, lumpsumRate, lumpsumYears,
    swpInitial, swpMonthlyWithdrawal, swpRate, swpYears,
    ppfAnnual, ppfYears,
    fdAmt, fdRate, fdYears,
    rdMonthly, rdRate, rdYears,
    salaryBasicPct, salaryHraPct, salaryBonusAmt, userGrossMonthly,
    gratuitySalaryBasic, gratuityYears,
    npsMonthly, npsRate, npsCurrentAge, npsAnnuityPct,
    emiPrincipal, emiRate, emiTenureYears
  ]);

  function numpCheck(val: number) {
    return isNaN(val) || !isFinite(val) ? 0 : val;
  }

  // 11. 5000 Monthly SIPReturns over 20 years calculation
  const sip5kStats = useMemo(() => {
    const monthlyRate = (customSip5kRate / 100) / 12;
    const totalMonths = customSip5kYears * 12;
    const invested = 5000 * totalMonths;
    const maturity = 5000 * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * (1 + monthlyRate);
    const gains = Math.max(0, maturity - invested);
    return { invested, maturity, gains };
  }, [customSip5kYears, customSip5kRate]);

  // 12. SIP vs FD Visual Compilation
  const sipVsFdCompiled = useMemo(() => {
    const months = compareYears * 12;
    const invested = compareMonthly * months;
    
    // SIP Calculation
    const monthlyRateSip = (compareSipRate / 100) / 12;
    const sipMaturity = compareMonthly * ((Math.pow(1 + monthlyRateSip, months) - 1) / monthlyRateSip) * (1 + monthlyRateSip);
    
    // FD Compounding monthly/quarterly
    const fdMonthlyRate = (compareFdRate / 100) / 12;
    let fdMaturity = 0;
    for (let m = 1; m <= months; m++) {
      fdMaturity = (fdMaturity + compareMonthly) * (1 + fdMonthlyRate);
    }

    const sipNetGains = Math.max(0, sipMaturity - invested);
    const fdNetGains = Math.max(0, fdMaturity - invested);
    const wealthDifference = Math.max(0, sipMaturity - fdMaturity);

    return { invested, sipMaturity, fdMaturity, sipNetGains, fdNetGains, wealthDifference };
  }, [compareMonthly, compareYears, compareSipRate, compareFdRate]);

  // 13. Retirement Corpus Calculator
  const retirementCalculated = useMemo(() => {
    const lifeExpectancy = 85;
    const currentAge = npsCurrentAge || 30;
    const retAge = 60;
    const yearsToRetire = Math.max(1, retAge - currentAge);
    const yearsInRetirement = Math.max(1, lifeExpectancy - retAge);
    
    // Assume current monthly lifestyle expense is 35000
    const currentMonthlyExpense = 45000;
    const inflationRate = 6;
    const safeReturnsPostRetirement = 8; // Conservative mixed debt portfolio

    // Calculate future inflation-adjusted monthly expense at retirement age
    const futureMonthlyExpense = currentMonthlyExpense * Math.pow(1 + (inflationRate / 100), yearsToRetire);
    
    // Adjusted monthly return in retirement to match inflation
    const realRatePostRetirement = ((1 + safeReturnsPostRetirement/100) / (1 + inflationRate/100) - 1);
    const monthlyRealRate = realRatePostRetirement / 12;
    const totalRetirementMonths = yearsInRetirement * 12;

    // Corpus needed using Annuity Discount factor
    let corpusNeeded = 0;
    if (monthlyRealRate > 0) {
      corpusNeeded = futureMonthlyExpense * ((1 - Math.pow(1 + monthlyRealRate, -totalRetirementMonths)) / monthlyRealRate);
    } else {
      corpusNeeded = futureMonthlyExpense * totalRetirementMonths;
    }

    // Recommended monthly savings required starting now at 12% equity ROI to build this corpus
    const equityMonthlyRate = (12 / 100) / 12;
    const accumulationMonths = yearsToRetire * 12;
    const recommendedSipNeeded = corpusNeeded / (((Math.pow(1 + equityMonthlyRate, accumulationMonths) - 1) / equityMonthlyRate) * (1 + equityMonthlyRate));

    return {
      yearsToRetire,
      futureMonthlyExpense,
      corpusNeeded,
      recommendedSipNeeded
    };
  }, [npsCurrentAge]);

  // 14. 50-30-20 Rule Calculator
  const budgetSplit = useMemo(() => {
    const needs = budgetIncome * 0.50;
    const wants = budgetIncome * 0.30;
    const savings = budgetIncome * 0.20;
    return { needs, wants, savings };
  }, [budgetIncome]);

  // 15. How Much SIP for 1 Crore Calculator
  const calculatedSipForOneCrore = useMemo(() => {
    const target = 10000000; // 1 Crore
    const monthlyRate = (oneCroreReturns / 100) / 12;
    const totalMonths = oneCroreTimeline * 12;
    
    let requiredMonthlySip = 0;
    if (monthlyRate > 0) {
      requiredMonthlySip = target / (((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * (1 + monthlyRate));
    } else {
      requiredMonthlySip = target / totalMonths;
    }
    return requiredMonthlySip;
  }, [oneCroreTimeline, oneCroreReturns]);

  return (
    <div className="seohub-canvas bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-6 text-slate-800 dark:text-white overflow-hidden relative">
      <style dangerouslySetInnerHTML={{ __html: `
        /* Dynamic Light Mode overrides for Paisa Wealth Cabinets */
        html:not(.dark) .seohub-canvas {
          background-color: #ffffff !important;
          color: #0f172a !important;
          border-color: #f1f5f9 !important;
        }
        
        html:not(.dark) .seohub-canvas .bg-slate-900,
        html:not(.dark) .seohub-canvas .bg-slate-900\\/50,
        html:not(.dark) .seohub-canvas .bg-slate-900\\/60,
        html:not(.dark) .seohub-canvas .bg-slate-900\\/40,
        html:not(.dark) .seohub-canvas .bg-slate-900\\/35,
        html:not(.dark) .seohub-canvas .bg-slate-900\\/30,
        html:not(.dark) .seohub-canvas .bg-slate-900\\/20,
        html:not(.dark) .seohub-canvas .bg-slate-900\\/15,
        html:not(.dark) .seohub-canvas .bg-slate-900\\/10 {
          background-color: #f8fafc !important; /* Slate 50 */
          border-color: #e2e8f0 !important;
        }

        html:not(.dark) .seohub-canvas .bg-slate-950,
        html:not(.dark) .seohub-canvas .bg-slate-950\\/60,
        html:not(.dark) .seohub-canvas .bg-slate-950\\/50,
        html:not(.dark) .seohub-canvas .bg-slate-950\\/40,
        html:not(.dark) .seohub-canvas .bg-slate-950\\/30,
        html:not(.dark) .seohub-canvas .bg-slate-950\\/20,
        html:not(.dark) .seohub-canvas .bg-slate-950\\/10 {
          background-color: #f1f5f9 !important; /* Slate 100 */
          border-color: #e2e8f0 !important;
        }

        html:not(.dark) .seohub-canvas .bg-purple-950\\/20,
        html:not(.dark) .seohub-canvas .bg-purple-950\\/30,
        html:not(.dark) .seohub-canvas .bg-purple-950\\/40 {
          background-color: #faf5ff !important; /* Purple 50 */
          border-color: #ebd5ff !important; /* Purple 200 */
        }

        html:not(.dark) .seohub-canvas .border-slate-800,
        html:not(.dark) .seohub-canvas .border-slate-850,
        html:not(.dark) .seohub-canvas .border-slate-805,
        html:not(.dark) .seohub-canvas .border-slate-750 {
          border-color: #e2e8f0 !important; /* Slate 200 */
        }

        html:not(.dark) .seohub-canvas .text-white {
          color: #1e293b !important; /* Slate 850 */
        }

        html:not(.dark) .seohub-canvas .text-slate-400,
        html:not(.dark) .seohub-canvas .text-slate-350,
        html:not(.dark) .seohub-canvas .text-slate-450,
        html:not(.dark) .seohub-canvas .text-slate-455 {
          color: #475569 !important; /* Slate 600 */
        }

        html:not(.dark) .seohub-canvas .text-purple-300,
        html:not(.dark) .seohub-canvas .text-purple-400 {
          color: #7e22ce !important; /* Purple 600 */
        }

        html:not(.dark) .seohub-canvas .text-emerald-400 {
          color: #16a34a !important; /* Emerald 600 */
        }

        html:not(.dark) .seohub-canvas .text-orange-400 {
          color: #ea580c !important; /* Orange 600 */
        }

        html:not(.dark) .seohub-canvas input[type="range"] {
          background-color: #cbd5e1 !important; /* Slate 300 track */
        }
      ` }} />
      {/* Decorative Blur Backgrounds */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/5 dark:bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-fuchsia-500/5 dark:bg-fuchsia-600/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header Banner Section */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5 relative">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg border border-purple-400/30">
            <Calculator className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-md border border-purple-200 dark:border-purple-500/30 tracking-wider">
                Sovereign Certified
              </span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">SEO & Resources Hub</span>
            </div>
            <h2 className="text-2xl font-black font-display tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-purple-800 dark:from-white dark:via-slate-200 dark:to-purple-300">
              Paisa Wealth Cabinets
            </h2>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-slate-50 dark:bg-slate-950 p-1 rounded-2xl border border-slate-150 dark:border-slate-800 shrink-0">
          <button
            onClick={() => setActiveTab("calculators")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "calculators"
                ? "bg-purple-600 text-white shadow-md shadow-purple-900/30 font-extrabold"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-850 dark:hover:text-white"
            }`}
          >
            <Calculator className="w-4 h-4" />
            10+ Calculators
          </button>
          <button
            onClick={() => setActiveTab("glossary")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "glossary"
                ? "bg-purple-600 text-white shadow-md shadow-purple-900/30 font-extrabold"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-850 dark:hover:text-white"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            500+ Glossary
          </button>
          <button
            onClick={() => setActiveTab("guides")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "guides"
                ? "bg-purple-600 text-white shadow-md shadow-purple-900/30 font-extrabold"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-850 dark:hover:text-white"
            }`}
          >
            <Compass className="w-4 h-4" />
            Growth Guides
          </button>
        </div>
      </div>

      {/* RENDER ACTIVE TAB */}
      <AnimatePresence mode="wait">
        {activeTab === "calculators" && (
          <motion.div
            key="tab-calculators"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Left calculators navigation selector list */}
            <div className="lg:col-span-4 lg:border-r lg:border-slate-100 dark:lg:border-slate-800 lg:pr-5 space-y-2">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider block mb-2 px-2">
                Compound Engines
              </span>
              {[
                { id: "sip", label: "SIP Calculator", desc: "Systematic monthly builder" },
                { id: "lumpsum", label: "Lumpsum Calculator", desc: "One-time yield compounder" },
                { id: "swp", label: "SWP Calculator", desc: "Periodic capital retirement cash-out" },
                { id: "ppf", label: "PPF Calculator", desc: "Sovereign standard 15-year EEE" },
                { id: "fd", label: "Fixed Deposit (FD)", desc: "Quarterly compounded risk-free" },
                { id: "rd", label: "Recurring Deposit (RD)", desc: "Guaranteed monthly deposit saver" },
                { id: "salary", label: "In-hand Salary Calculator", desc: "Basic, HRA and PF structure" },
                { id: "gratuity", label: "Gratuity Calculator", desc: "Indian Loyalty tenure cashout" },
                { id: "nps", label: "NPS Pension & Cashout", desc: "Corporate & Individual annuity builder" },
                { id: "emi", label: "EMI Loan Calculator", desc: "Equated monthly mortgage check" },
                { id: "comparison", label: "SIP vs FD Compere Engine", desc: "Interactive growth disparity" },
                { id: "retirement_calc", label: "Retirement Sizing India", desc: "Inflation longevity coverage" },
                { id: "fifty_rule", label: "50-30-20 Rule Budgeter", desc: "Instant household split analyzer" }
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCalculatorsType(c.id)}
                  className={`w-full flex items-center justify-between text-left p-3 rounded-2xl border transition-all cursor-pointer ${
                    selectedCalculatorsType === c.id
                      ? "bg-purple-600/10 dark:bg-purple-600/15 border-purple-500 text-purple-900 dark:text-white"
                      : "bg-slate-50/50 dark:bg-slate-950/40 border-slate-150/80 dark:border-slate-850 hover:bg-slate-100/50 dark:hover:bg-slate-950/80 hover:border-slate-200 dark:hover:border-slate-805 text-slate-500 dark:text-slate-400"
                  }`}
                >
                  <div>
                    <h5 className={`text-xs font-black ${selectedCalculatorsType === c.id ? "text-purple-700 dark:text-purple-300" : "text-slate-800 dark:text-white"}`}>
                      {c.label}
                    </h5>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{c.desc}</p>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-transform ${selectedCalculatorsType === c.id ? "text-purple-600 dark:text-purple-400 translate-x-1" : "text-slate-400 dark:text-slate-650"}`} />
                </button>
              ))}
            </div>

            {/* Right detailed calculator workspace */}
            <div className="lg:col-span-8 bg-slate-50 dark:bg-slate-950/30 border border-slate-150 dark:border-slate-800/80 p-5 rounded-3xl space-y-6">
              
              {/* 1. SIP CALCULATOR WORKSPACE */}
              {selectedCalculatorsType === "sip" && (
                <div className="space-y-5">
                  <div className="flex items-center gap-1.5 border-b border-slate-800 pb-3">
                    <TrendingUp className="w-5 h-5 text-purple-400" />
                    <h4 className="text-base font-extrabold">Systematic Investment Plan (SIP) Calculator</h4>
                  </div>
                  
                  {/* Sliders bundle */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Monthly Deposit</span>
                        <span className="font-bold text-purple-400">{fmtIndian(sipMonthly)}</span>
                      </div>
                      <input
                        type="range" min="500" max="150000" step="500" value={sipMonthly}
                        onChange={(e) => setSipMonthly(Number(e.target.value))}
                        className="w-full accent-purple-500 h-1 rounded"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Return Rate (CAGR)</span>
                        <span className="font-bold text-purple-400">{sipRate}%</span>
                      </div>
                      <input
                        type="range" min="5" max="30" step="0.5" value={sipRate}
                        onChange={(e) => setSipRate(Number(e.target.value))}
                        className="w-full accent-purple-500 h-1 rounded"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Tenure (Years)</span>
                        <span className="font-bold text-purple-400">{sipYears} yrs</span>
                      </div>
                      <input
                        type="range" min="1" max="40" step="1" value={sipYears}
                        onChange={(e) => setSipYears(Number(e.target.value))}
                        className="w-full accent-purple-500 h-1 rounded"
                      />
                    </div>
                  </div>

                  {/* Calculations Sheet */}
                  <div className="grid grid-cols-3 gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800 text-center">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Invested capital</span>
                      <p className="text-sm font-black text-white mt-1">{fmtIndian(calcsResults.sip.invested)}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Estimated Gains</span>
                      <p className="text-sm font-black text-emerald-400 mt-1">{fmtIndian(calcsResults.sip.gains)}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Maturity Value</span>
                      <p className="text-base font-black text-purple-400 mt-1">{fmtIndian(calcsResults.sip.value)}</p>
                    </div>
                  </div>

                  {/* Aesthetic Compounding Comparison Meters */}
                  <div className="space-y-2 bg-slate-950/60 p-4 rounded-2xl border border-slate-850">
                    <span className="text-[10px] text-purple-400 font-extrabold uppercase tracking-wide">Growth Visualizer</span>
                    <div className="relative h-6 bg-slate-900 rounded-full overflow-hidden flex text-xs font-bold border border-slate-800">
                      <div style={{ width: `${Math.min(100, Math.max(10, (calcsResults.sip.invested / calcsResults.sip.value) * 100))}%` }} className="bg-purple-600 h-full flex items-center justify-center text-[9px] text-white self-center">
                        Invested ({Math.round((calcsResults.sip.invested / calcsResults.sip.value) * 100)}%)
                      </div>
                      <div className="flex-1 bg-emerald-500 h-full flex items-center justify-center text-[9px] text-slate-950 font-black">
                        Gains ({Math.round((calcsResults.sip.gains / calcsResults.sip.value) * 100)}%)
                      </div>
                    </div>
                    <p className="text-[10.5px] text-slate-400 text-center italic mt-1 font-mono">
                      *By investing {fmtIndian(sipMonthly)} monthly, compound interest yields {fmtIndian(calcsResults.sip.gains)} purely in earnings!
                    </p>
                  </div>
                </div>
              )}

              {/* 2. LUMPSUM CALCULATOR WORKSPACE */}
              {selectedCalculatorsType === "lumpsum" && (
                <div className="space-y-5">
                  <div className="flex items-center gap-1.5 border-b border-slate-800 pb-3">
                    <Coins className="w-5 h-5 text-purple-400" />
                    <h4 className="text-base font-extrabold">One-time Lumpsum yield Compounder</h4>
                  </div>
                  
                  {/* Sliders bundle */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Standard Capital</span>
                        <span className="font-bold text-purple-400">{fmtIndian(lumpsumAmt)}</span>
                      </div>
                      <input
                        type="range" min="5000" max="5000000" step="5000" value={lumpsumAmt}
                        onChange={(e) => setLumpsumAmt(Number(e.target.value))}
                        className="w-full accent-purple-500 h-1 rounded"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">CAGR Return %</span>
                        <span className="font-bold text-purple-400">{lumpsumRate}%</span>
                      </div>
                      <input
                        type="range" min="4" max="25" step="0.5" value={lumpsumRate}
                        onChange={(e) => setLumpsumRate(Number(e.target.value))}
                        className="w-full accent-purple-500 h-1 rounded"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Tenure (Years)</span>
                        <span className="font-bold text-purple-400">{lumpsumYears} yrs</span>
                      </div>
                      <input
                        type="range" min="1" max="40" step="1" value={lumpsumYears}
                        onChange={(e) => setLumpsumYears(Number(e.target.value))}
                        className="w-full accent-purple-500 h-1 rounded"
                      />
                    </div>
                  </div>

                  {/* Calculations Sheet */}
                  <div className="grid grid-cols-3 gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800 text-center">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Invested</span>
                      <p className="text-sm font-black text-white mt-1">{fmtIndian(calcsResults.lumpsum.invested)}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Profits Earned</span>
                      <p className="text-sm font-black text-emerald-400 mt-1">{fmtIndian(calcsResults.lumpsum.gains)}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Maturity Pool</span>
                      <p className="text-base font-black text-purple-400 mt-1">{fmtIndian(calcsResults.lumpsum.value)}</p>
                    </div>
                  </div>

                  <div className="space-y-2 bg-slate-950/60 p-4 rounded-2xl border border-slate-850">
                    <span className="text-[10px] text-purple-400 font-extrabold uppercase tracking-wide">Investment Ratio</span>
                    <div className="relative h-6 bg-slate-900 rounded-full overflow-hidden flex text-xs font-bold border border-slate-800">
                      <div style={{ width: `${Math.min(100, Math.max(10, (calcsResults.lumpsum.invested / calcsResults.lumpsum.value) * 100))}%` }} className="bg-purple-600 h-full flex items-center justify-center text-[9px] text-white self-center">
                        Capital ({Math.round((calcsResults.lumpsum.invested / calcsResults.lumpsum.value) * 100)}%)
                      </div>
                      <div className="flex-1 bg-emerald-500 h-full flex items-center justify-center text-[9px] text-slate-950 font-black">
                        Pure Returns ({Math.round((calcsResults.lumpsum.gains / calcsResults.lumpsum.value) * 105)}%)
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. Systematic Withdrawal Plan (SWP) */}
              {selectedCalculatorsType === "swp" && (
                <div className="space-y-5">
                  <div className="flex items-center gap-1.5 border-b border-slate-800 pb-3">
                    <RefreshCw className="w-5 h-5 text-purple-400" />
                    <h4 className="text-base font-extrabold">Systematic Withdrawal Plan (SWP) Calculator</h4>
                  </div>
                  
                  {/* Inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 bg-slate-900/50 p-3 rounded-2xl border border-slate-800">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Initial Capital Pool</span>
                        <span className="font-bold text-white">{fmtIndian(swpInitial)}</span>
                      </div>
                      <input
                        type="range" min="100000" max="10000000" step="100000" value={swpInitial}
                        onChange={(e) => setSwpInitial(Number(e.target.value))} className="w-full accent-purple-500 h-1"
                      />
                    </div>
                    <div className="space-y-2 bg-slate-900/50 p-3 rounded-2xl border border-slate-800">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Monthly SWP Cash-out</span>
                        <span className="font-bold text-white">{fmtIndian(swpMonthlyWithdrawal)}</span>
                      </div>
                      <input
                        type="range" min="1000" max="250000" step="1000" value={swpMonthlyWithdrawal}
                        onChange={(e) => setSwpMonthlyWithdrawal(Number(e.target.value))} className="w-full accent-purple-500 h-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Interest Accrual (ROI p.a.)</span>
                        <span className="font-bold text-purple-400">{swpRate}%</span>
                      </div>
                      <input
                        type="range" min="4" max="18" step="0.5" value={swpRate}
                        onChange={(e) => setSwpRate(Number(e.target.value))} className="w-full accent-purple-500 h-1 rounded"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Tenure (Years)</span>
                        <span className="font-bold text-purple-400">{swpYears} yrs</span>
                      </div>
                      <input
                        type="range" min="1" max="30" step="1" value={swpYears}
                        onChange={(e) => setSwpYears(Number(e.target.value))} className="w-full accent-purple-500 h-1 rounded"
                      />
                    </div>
                  </div>

                  {/* Results SWP */}
                  <div className="grid grid-cols-3 gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800 text-center">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Initial Deposit</span>
                      <p className="text-xs font-black text-white mt-1">{fmtIndian(calcsResults.swp.invested)}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Total Withdrawn</span>
                      <p className="text-xs font-black text-purple-400 mt-1">{fmtIndian(calcsResults.swp.withdrawn)}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Ending Balance</span>
                      <p className="text-xs font-black text-emerald-400 mt-1">{fmtIndian(calcsResults.swp.balance)}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. PPF CALCULATOR */}
              {selectedCalculatorsType === "ppf" && (
                <div className="space-y-5">
                  <div className="flex items-center gap-1.5 border-b border-slate-800 pb-3">
                    <ShieldCheck className="w-5 h-5 text-purple-400" />
                    <h4 className="text-base font-extrabold">Public Provident Fund (PPF) Calculator (Guaranteed 7.1%)</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Annual Investment (Max ₹1.5L)</span>
                        <span className="font-bold text-purple-400">{fmtIndian(ppfAnnual)}</span>
                      </div>
                      <input
                        type="range" min="500" max="150000" step="500" value={ppfAnnual}
                        onChange={(e) => setPpfAnnual(Number(e.target.value))} className="w-full accent-purple-500 h-1"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Lock-in Period (Years)</span>
                        <span className="font-bold text-purple-400">{ppfYears} Years</span>
                      </div>
                      <input
                        type="range" min="15" max="50" step="5" value={ppfYears}
                        onChange={(e) => setPpfYears(Number(e.target.value))} className="w-full accent-purple-500 h-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800 text-center">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Capital Claimed</span>
                      <p className="text-xs font-black text-white mt-1">{fmtIndian(calcsResults.ppf.invested)}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Tax-Free Interest</span>
                      <p className="text-xs font-black text-emerald-400 mt-1">{fmtIndian(calcsResults.ppf.gains)}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Total EEE Value</span>
                      <p className="text-xs font-black text-purple-400 mt-1">{fmtIndian(calcsResults.ppf.value)}</p>
                    </div>
                  </div>
                  <div className="p-3 bg-purple-950/20 rounded-2xl border border-purple-900/30 text-[10px] text-purple-300 leading-relaxed">
                    🎓 <strong>Exempt-Exempt-Exempt Status:</strong> Your PPF investment earns completely sovereign, risk-free interest compounding annually, totally immune from tax cuts.
                  </div>
                </div>
              )}

              {/* 5. Fixed Deposit (FD) */}
              {selectedCalculatorsType === "fd" && (
                <div className="space-y-5">
                  <div className="flex items-center gap-1.5 border-b border-slate-800 pb-3">
                    <Wallet className="w-5 h-5 text-purple-400" />
                    <h4 className="text-base font-extrabold">Standard Fixed Deposit (FD) Calculator</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Total Deposit</span>
                        <span className="font-bold text-purple-400">{fmtIndian(fdAmt)}</span>
                      </div>
                      <input
                        type="range" min="1000" max="5000000" step="5000" value={fdAmt}
                        onChange={(e) => setFdAmt(Number(e.target.value))} className="w-full accent-purple-500 h-1"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Interest Rate (% p.a.)</span>
                        <span className="font-bold text-purple-400">{fdRate}%</span>
                      </div>
                      <input
                        type="range" min="3" max="10" step="0.1" value={fdRate}
                        onChange={(e) => setFdRate(Number(e.target.value))} className="w-full accent-purple-500 h-1"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Tenure (Years)</span>
                        <span className="font-bold text-purple-400">{fdYears} Years</span>
                      </div>
                      <input
                        type="range" min="1" max="25" step="1" value={fdYears}
                        onChange={(e) => setFdYears(Number(e.target.value))} className="w-full accent-purple-500 h-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800 text-center">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Principal locked</span>
                      <p className="text-xs font-black text-white mt-1">{fmtIndian(calcsResults.fd.invested)}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Interest Earned</span>
                      <p className="text-xs font-black text-emerald-400 mt-1">{fmtIndian(calcsResults.fd.gains)}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Maturity cash</span>
                      <p className="text-xs font-black text-purple-400 mt-1">{fmtIndian(calcsResults.fd.value)}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* 6. Recurring Deposit (RD) */}
              {selectedCalculatorsType === "rd" && (
                <div className="space-y-5">
                  <div className="flex items-center gap-1.5 border-b border-slate-800 pb-3">
                    <Clock className="w-5 h-5 text-purple-400" />
                    <h4 className="text-base font-extrabold">Sovereign Recurring Deposit (RD) Calculator</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Monthly Savings</span>
                        <span className="font-bold text-purple-400">{fmtIndian(rdMonthly)}</span>
                      </div>
                      <input
                        type="range" min="100" max="250000" step="500" value={rdMonthly}
                        onChange={(e) => setRdMonthly(Number(e.target.value))} className="w-full accent-purple-500 h-1"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Annual Return %</span>
                        <span className="font-bold text-purple-400">{rdRate}%</span>
                      </div>
                      <input
                        type="range" min="3" max="10" step="0.1" value={rdRate}
                        onChange={(e) => setRdRate(Number(e.target.value))} className="w-full accent-purple-500 h-1"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Tenure (Years)</span>
                        <span className="font-bold text-purple-400">{rdYears} Years</span>
                      </div>
                      <input
                        type="range" min="1" max="15" step="1" value={rdYears}
                        onChange={(e) => setRdYears(Number(e.target.value))} className="w-full accent-purple-500 h-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800 text-center">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Deposited Money</span>
                      <p className="text-xs font-black text-white mt-1">{fmtIndian(calcsResults.rd.invested)}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Interest Gains</span>
                      <p className="text-xs font-black text-emerald-400 mt-1">{fmtIndian(calcsResults.rd.gains)}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Total Maturity</span>
                      <p className="text-xs font-black text-purple-400 mt-1">{fmtIndian(calcsResults.rd.value)}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* 7. Salary Breakdown */}
              {selectedCalculatorsType === "salary" && (
                <div className="space-y-5">
                  <div className="flex items-center gap-1.5 border-b border-slate-800 pb-3">
                    <Briefcase className="w-5 h-5 text-purple-400" />
                    <h4 className="text-base font-extrabold">In-hand Pay Structure Estimator</h4>
                  </div>
                  
                  <div className="text-xs text-slate-400 bg-slate-900 p-3 rounded-2xl border border-slate-800">
                    Calculated against your selected profile's gross monthly income of <strong className="text-white">{fmtIndian(userGrossMonthly)}</strong>. Adjust variables below to customize your pay slips.
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Basic Pay Allocation</span>
                        <span className="font-bold text-purple-400">{salaryBasicPct}%</span>
                      </div>
                      <input
                        type="range" min="30" max="60" step="5" value={salaryBasicPct}
                        onChange={(e) => setSalaryBasicPct(Number(e.target.value))} className="w-full accent-purple-500 h-1"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">HRA % of Basic</span>
                        <span className="font-bold text-purple-400">{salaryHraPct}%</span>
                      </div>
                      <input
                        type="range" min="30" max="50" step="10" value={salaryHraPct}
                        onChange={(e) => setSalaryHraPct(Number(e.target.value))} className="w-full accent-purple-500 h-1"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Annual Bonus</span>
                        <span className="font-bold text-purple-400">{fmtIndian(salaryBonusAmt)}</span>
                      </div>
                      <input
                        type="range" min="0" max="500000" step="10000" value={salaryBonusAmt}
                        onChange={(e) => setSalaryBonusAmt(Number(e.target.value))} className="w-full accent-purple-500 h-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-3 bg-slate-900 p-4 rounded-2xl border border-slate-800 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Calculated Basic Salary Component:</span>
                      <span className="font-bold text-white">{fmtIndian(calcsResults.salary.basic)} /mo</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Calculated House Rent Allowance (HRA):</span>
                      <span className="font-bold text-white">{fmtIndian(calcsResults.salary.hra)} /mo</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-800 pt-2 text-slate-350">
                      <span>Provident Fund (EPF) Employer/Staff deduction:</span>
                      <span className="font-bold text-orange-400">-{fmtIndian(calcsResults.salary.pf)} /mo</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-800 pt-2 text-sm">
                      <span className="font-black text-white">Estimated Monthly In-hand Cash-out:</span>
                      <span className="font-black text-purple-400">{fmtIndian(calcsResults.salary.inHand)} /mo</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 8. Gratuity Calculator */}
              {selectedCalculatorsType === "gratuity" && (
                <div className="space-y-5">
                  <div className="flex items-center gap-1.5 border-b border-slate-800 pb-3">
                    <Award className="w-5 h-5 text-purple-400" />
                    <h4 className="text-base font-extrabold">Indian Gratuity Loyalty Estimator</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Basic Wage + DA (Monthly)</span>
                        <span className="font-bold text-purple-400">{fmtIndian(gratuitySalaryBasic)}</span>
                      </div>
                      <input
                        type="range" min="10000" max="500000" step="2000" value={gratuitySalaryBasic}
                        onChange={(e) => setGratuitySalaryBasic(Number(e.target.value))} className="w-full accent-purple-500 h-1"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Years of Continuous Service (min 5)</span>
                        <span className="font-bold text-purple-400">{gratuityYears} Years</span>
                      </div>
                      <input
                        type="range" min="5" max="40" step="1" value={gratuityYears}
                        onChange={(e) => setGratuityYears(Number(e.target.value))} className="w-full accent-purple-500 h-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-900 rounded-2xl border border-slate-800 text-center items-center">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-black">Gratuity Formula</span>
                      <p className="text-[11px] text-slate-300 font-mono mt-1">15/26 × Basic Wage × Tenure</p>
                    </div>
                    <div className="border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 pl-0 md:pl-4">
                      <span className="text-[10px] text-purple-400 uppercase font-extrabold block">Estimated Gratuity Pay</span>
                      <p className="text-xl font-black text-purple-400 mt-1">{fmtIndian(calcsResults.gratuity.amount)}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* 9. NPS PENSION CALCULATOR */}
              {selectedCalculatorsType === "nps" && (
                <div className="space-y-5">
                  <div className="flex items-center gap-1.5 border-b border-slate-800 pb-3">
                    <Coins className="w-5 h-5 text-purple-400" />
                    <h4 className="text-base font-extrabold">National Pension System (NPS) Retirement Calculator</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 bg-slate-900/30 p-2.5 border border-slate-850 rounded-xl">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Monthly NPS Savings</span>
                        <span className="font-bold text-purple-400">{fmtIndian(npsMonthly)}</span>
                      </div>
                      <input
                        type="range" min="500" max="150000" step="500" value={npsMonthly}
                        onChange={(e) => setNpsMonthly(Number(e.target.value))} className="w-full accent-purple-500 h-1"
                      />
                    </div>
                    <div className="space-y-2 bg-slate-900/30 p-2.5 border border-slate-850 rounded-xl">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">NPS expected ROI %</span>
                        <span className="font-bold text-purple-400">{npsRate}%</span>
                      </div>
                      <input
                        type="range" min="6" max="15" step="0.5" value={npsRate}
                        onChange={(e) => setNpsRate(Number(e.target.value))} className="w-full accent-purple-500 h-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Current Age</span>
                        <span className="font-bold text-purple-400">{npsCurrentAge} years old</span>
                      </div>
                      <input
                        type="range" min="18" max="59" step="1" value={npsCurrentAge}
                        onChange={(e) => setNpsCurrentAge(Number(e.target.value))} className="w-full accent-purple-500 h-1"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Convert to Annuity (Min 40%)</span>
                        <span className="font-bold text-purple-400">{npsAnnuityPct}%</span>
                      </div>
                      <input
                        type="range" min="40" max="100" step="5" value={npsAnnuityPct}
                        onChange={(e) => setNpsAnnuityPct(Number(e.target.value))} className="w-full accent-purple-500 h-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800 text-center">
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-black block">NPS Corpus</span>
                      <p className="text-xs font-bold text-white mt-1">{fmtIndian(calcsResults.nps.corpus)}</p>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-black block">Tax-free cash</span>
                      <p className="text-xs font-bold text-emerald-400 mt-1">{fmtIndian(calcsResults.nps.cashout)}</p>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-black block">Annuity Trust</span>
                      <p className="text-xs font-bold text-orange-400 mt-1">{fmtIndian(calcsResults.nps.annuity)}</p>
                    </div>
                    <div>
                      <span className="text-[9px] text-purple-400 uppercase font-black block">Est Pension/mo</span>
                      <p className="text-xs font-black text-purple-400 mt-1">{fmtIndian(calcsResults.nps.pension)}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* 10. EMI LOAN CALCULATOR */}
              {selectedCalculatorsType === "emi" && (
                <div className="space-y-5">
                  <div className="flex items-center gap-1.5 border-b border-slate-800 pb-3">
                    <Layers className="w-5 h-5 text-purple-400" />
                    <h4 className="text-base font-extrabold">EMI Loan Calculator</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Loan Principal</span>
                        <span className="font-bold text-purple-400">{fmtIndian(emiPrincipal)}</span>
                      </div>
                      <input
                        type="range" min="50000" max="20000000" step="50000" value={emiPrincipal}
                        onChange={(e) => setEmiPrincipal(Number(e.target.value))} className="w-full accent-purple-500 h-1"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Annual Return (ROI)</span>
                        <span className="font-bold text-purple-400">{emiRate}%</span>
                      </div>
                      <input
                        type="range" min="5" max="20" step="0.1" value={emiRate}
                        onChange={(e) => setEmiRate(Number(e.target.value))} className="w-full accent-purple-500 h-1"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Tenure (Years)</span>
                        <span className="font-bold text-purple-400">{emiTenureYears} Years</span>
                      </div>
                      <input
                        type="range" min="1" max="30" step="1" value={emiTenureYears}
                        onChange={(e) => setEmiTenureYears(Number(e.target.value))} className="w-full accent-purple-500 h-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800 text-center">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-black">Monthly EMI</span>
                      <p className="text-sm font-black text-purple-400 mt-1">{fmtIndian(calcsResults.emi.emi)}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-black">Total Interest</span>
                      <p className="text-sm font-black text-rose-400 mt-1">{fmtIndian(calcsResults.emi.interest)}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-black">Overall Repayment</span>
                      <p className="text-sm font-black text-white mt-1">{fmtIndian(calcsResults.emi.total)}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* 11. SIP VS FD COMPARISON */}
              {selectedCalculatorsType === "comparison" && (
                <div className="space-y-5">
                  <div className="flex items-center gap-1.5 border-b border-slate-800 pb-3">
                    <Scale className="w-5 h-5 text-purple-400" />
                    <h4 className="text-base font-extrabold">SIP vs. FD Yield Comparison Machine</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 bg-slate-900/40 p-3 rounded-2xl border border-slate-850">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Monthly Contribution</span>
                        <span className="font-bold text-purple-400">{fmtIndian(compareMonthly)}</span>
                      </div>
                      <input
                        type="range" min="1000" max="250000" step="1000" value={compareMonthly}
                        onChange={(e) => setCompareMonthly(Number(e.target.value))} className="w-full accent-purple-500 h-1"
                      />
                    </div>
                    <div className="space-y-2 bg-slate-900/40 p-3 rounded-2xl border border-slate-850">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Tenure (Years)</span>
                        <span className="font-bold text-purple-400">{compareYears} yrs</span>
                      </div>
                      <input
                        type="range" min="1" max="45" step="1" value={compareYears}
                        onChange={(e) => setCompareYears(Number(e.target.value))} className="w-full accent-purple-500 h-1"
                      />
                    </div>
                  </div>

                  {/* ROI configurations */}
                  <div className="grid grid-cols-2 gap-4 bg-slate-900/20 p-3 rounded-2xl border border-slate-850 text-xs">
                    <div>
                      <label className="text-slate-400">Equity SIP CAGR: </label>
                      <input
                        type="number" value={compareSipRate} onChange={(e) => setCompareSipRate(Number(e.target.value))}
                        className="bg-slate-950 border border-slate-800 rounded px-2 py-0.5 ml-1 text-white font-bold w-16"
                      /> %
                    </div>
                    <div>
                      <label className="text-slate-400">Bank FD Yield: </label>
                      <input
                        type="number" value={compareFdRate} onChange={(e) => setCompareFdRate(Number(e.target.value))}
                        className="bg-slate-950 border border-slate-800 rounded px-2 py-0.5 ml-1 text-white font-bold w-16"
                      /> %
                    </div>
                  </div>

                  {/* Comparisons bars */}
                  <div className="space-y-4">
                    {/* SIP Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-bold text-emerald-400">Systematic SIP Growth:</span>
                        <span className="font-bold text-emerald-400">{fmtIndian(sipVsFdCompiled.sipMaturity)}</span>
                      </div>
                      <div className="w-full h-3.5 bg-slate-900 rounded-full overflow-hidden flex border border-slate-800">
                        <div style={{ width: `${Math.min(100, (sipVsFdCompiled.sipMaturity / Math.max(1, sipVsFdCompiled.sipMaturity)) * 100)}%` }} className="bg-gradient-to-r from-emerald-600 to-teal-400 h-full rounded-full" />
                      </div>
                    </div>
                    
                    {/* FD Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-bold text-orange-400">Fixed Deposit Yield:</span>
                        <span className="font-bold text-orange-400">{fmtIndian(sipVsFdCompiled.fdMaturity)}</span>
                      </div>
                      <div className="w-full h-3.5 bg-slate-900 rounded-full overflow-hidden flex border border-slate-800">
                        <div style={{ width: `${Math.min(100, (sipVsFdCompiled.fdMaturity / Math.max(1, sipVsFdCompiled.sipMaturity)) * 100)}%` }} className="bg-gradient-to-r from-orange-500 to-amber-400 h-full rounded-full" />
                      </div>
                    </div>

                    <div className="p-3.5 bg-purple-950/20 border border-purple-900/30 rounded-2xl text-[11px] text-purple-300 leading-relaxed">
                      💡 <strong>The Compounding Verdict:</strong> By selecting Equity Mutual Funds SIP instead of Fixed Deposit, you establish an extra wealth accretion of <strong className="text-white text-xs">{fmtIndian(sipVsFdCompiled.wealthDifference)}</strong> over {compareYears} years!
                    </div>
                  </div>
                </div>
              )}

              {/* 12. RETIREMENT SCENARIO SIZER */}
              {selectedCalculatorsType === "retirement_calc" && (
                <div className="space-y-5">
                  <div className="flex items-center gap-1.5 border-b border-slate-800 pb-3">
                    <Target className="w-5 h-5 text-purple-400" />
                    <h4 className="text-base font-extrabold font-display">Indian Pension Corpus & SIP Sizer</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 bg-slate-900 p-3 rounded-2xl border border-slate-800">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400 text-[11px]">Current Age</span>
                        <span className="font-bold text-white">{npsCurrentAge} yrs</span>
                      </div>
                      <input
                        type="range" min="18" max="59" step="1" value={npsCurrentAge}
                        onChange={(e) => setNpsCurrentAge(Number(e.target.value))} className="w-full accent-purple-500 h-1"
                      />
                    </div>
                    <div className="space-y-2 bg-slate-900 p-3 rounded-2xl border border-slate-800 text-xs">
                      <span className="text-purple-400 font-extrabold uppercase text-[10px] block mb-1">Longevity Estimates</span>
                      <p className="text-slate-400 leading-relaxed">Standard Retiring Age: <strong className="text-white">60</strong>. Accumulation phase is <strong className="text-purple-300">{60 - npsCurrentAge} years</strong>.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-900/50 p-4 rounded-3xl border border-slate-800 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-slate-450 uppercase font-black block">CORPUS REQUIRED</span>
                      <p className="text-base font-black text-white mt-1">{fmtIndian(retirementCalculated.corpusNeeded)}</p>
                      <span className="text-[9px] text-slate-500">at age 60</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-450 uppercase font-black block">EST EXPENSE/mo</span>
                      <p className="text-base font-black text-rose-450 mt-1">{fmtIndian(retirementCalculated.futureMonthlyExpense)}</p>
                      <span className="text-[9px] text-slate-500">inflation-adjusted</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-purple-450 uppercase font-black block">RECOMMENDED SIP</span>
                      <p className="text-base font-black text-purple-400 mt-1">{fmtIndian(retirementCalculated.recommendedSipNeeded)}/mo</p>
                      <span className="text-[9px] text-purple-500">starting today</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 13. 50-30-20 BUDGET RULE */}
              {selectedCalculatorsType === "fifty_rule" && (
                <div className="space-y-5">
                  <div className="flex items-center gap-1.5 border-b border-slate-800 pb-3">
                    <FileText className="w-5 h-5 text-purple-400" />
                    <h4 className="text-base font-extrabold font-display">50-30-20 Professional Budget Splitter</h4>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2 bg-slate-900 p-3 rounded-2xl border border-slate-850">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Monthly In-Hand Salary</span>
                        <span className="font-bold text-white">{fmtIndian(budgetIncome)}</span>
                      </div>
                      <input
                        type="range" min="10000" max="500000" step="5000" value={budgetIncome}
                        onChange={(e) => setBudgetIncome(Number(e.target.value))} className="w-full accent-purple-500 h-1"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-bold leading-normal">
                      <div className="bg-blue-950/20 border border-blue-900/30 p-4 rounded-2xl space-y-1">
                        <span className="text-[10px] text-blue-400 uppercase tracking-widest">Needs (50%)</span>
                        <p className="text-base font-black text-blue-300">{fmtIndian(budgetSplit.needs)}</p>
                        <p className="text-[10px] text-slate-400">Rent, kitchen, groceries, utility bills & basic loans.</p>
                      </div>
                      <div className="bg-orange-950/20 border border-orange-900/30 p-4 rounded-2xl space-y-1">
                        <span className="text-[10px] text-orange-400 uppercase tracking-widest">Wants (30%)</span>
                        <p className="text-base font-black text-orange-300">{fmtIndian(budgetSplit.wants)}</p>
                        <p className="text-[10px] text-slate-400">Dining, movies, short trips, premium clothing & subscriptions.</p>
                      </div>
                      <div className="bg-purple-950/20 border border-purple-900/30 p-4 rounded-2xl space-y-1">
                        <span className="text-[10px] text-purple-400 uppercase tracking-widest">Savings/SIP (20%)</span>
                        <p className="text-base font-black text-purple-300">{fmtIndian(budgetSplit.savings)}</p>
                        <p className="text-[10px] text-slate-400">Automated Direct Index SIPs, PPF, NPS & Emergency liquid fund.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* GLOSSARY ENGINE TAB */}
        {activeTab === "glossary" && (
          <motion.div
            key="tab-glossary"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Word of the Day Highlight panel */}
            <div className="bg-gradient-to-tr from-purple-100/30 via-slate-50 to-purple-50 dark:from-purple-950/40 dark:via-slate-950/80 dark:to-slate-950 border border-purple-200 dark:border-purple-500/20 p-5 rounded-3xl relative overflow-hidden flex flex-col md:flex-row gap-5 items-center justify-between">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-purple-500/10 to-transparent pointer-events-none rounded-bl-3xl" />
              <div className="space-y-2 flex-grow">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 animate-pulse" />
                  <span className="text-[10px] text-purple-700 dark:text-purple-400 font-extrabold uppercase tracking-widest">Financial Word of the Day</span>
                </div>
                <h4 className="text-xl font-black text-slate-800 dark:text-white">{wordOfTheDay.word} <span className="text-xs text-slate-500 font-medium ml-1">({wordOfTheDay.hindiWord})</span></h4>
                <p className="text-sm text-slate-605 dark:text-slate-350">{wordOfTheDay.definition}</p>
              </div>
              <button
                onClick={() => setWordOfTheDayIndex(prev => prev + 1)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-black shrink-0 cursor-pointer flex items-center gap-1.5 transition-all text-center self-stretch md:self-auto justify-center"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Next Word
              </button>
            </div>

            {/* Smart searchbar & filter array */}
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-4 top-3 text-slate-400 dark:text-slate-500 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Query financial abbreviations (e.g. PPF, ELSS, HRA, CIBIL)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-4 py-3 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 font-medium"
                />
              </div>

              {/* Extended instant direct suggestion array for remaining 500 terms */}
              {matchedExtendedSuggestions.length > 0 && (
                <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Indexed search coordinates (500+ glossary matches):</span>
                  <div className="flex flex-wrap gap-2">
                    {matchedExtendedSuggestions.map((word, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSearchQuery(word);
                          setSelectedGlossaryLetter("All");
                        }}
                        className="bg-white dark:bg-slate-900 hover:bg-purple-50/50 dark:hover:bg-purple-950/40 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-white px-2.5 py-1 rounded-lg font-bold text-[11px] cursor-pointer transition-all flex items-center gap-1"
                      >
                        <Search className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                        {word}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Category selector */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: "All", label: "All Sectors" },
                  { id: "tax", label: "Taxation & IRS Slabs" },
                  { id: "investment", label: "Equity Mutual Funds" },
                  { id: "pension", label: "NPS & Pension" },
                  { id: "banking", label: "Core Banking Deposits" },
                  { id: "credit", label: "Loans & Credit History" },
                  { id: "general", label: "General Economics" }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategoryFilter(cat.id)}
                    className={`px-3 py-1.5 rounded-full text-[11.5px] font-bold cursor-pointer transition-all border ${
                      activeCategoryFilter === cat.id
                        ? "bg-purple-600 text-white border-purple-500"
                        : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-950/80 hover:border-slate-300 dark:hover:border-slate-805 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Alphabet indexing drawer */}
              <div className="flex flex-wrap gap-1 justify-center bg-slate-50 dark:bg-slate-950/60 p-2 rounded-2xl border border-slate-150 dark:border-slate-850">
                {alphabetLetters.map((l) => (
                  <button
                    key={l}
                    onClick={() => {
                      setSelectedGlossaryLetter(l);
                      setSearchQuery(""); // Clear search query to permit clean letter browsing
                    }}
                    className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-black cursor-pointer transition-all ${
                      selectedGlossaryLetter === l
                        ? "bg-purple-600 text-white font-black scale-110"
                        : "text-slate-600 dark:text-slate-450 hover:bg-slate-200 dark:hover:bg-slate-900 hover:text-slate-800 dark:hover:text-white"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Main matching glossary search results list */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredGlossary.length > 0 ? (
                filteredGlossary.map((term) => (
                  <div
                    key={term.word}
                    className="p-4 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-150 dark:border-slate-850 hover:border-slate-300 dark:hover:border-slate-750 rounded-2xl space-y-2 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <h5 className="font-extrabold text-slate-800 dark:text-white text-sm">
                          {term.word} <span className="text-slate-550 dark:text-slate-500 text-xs">({term.hindiWord})</span>
                        </h5>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400 bg-purple-100 dark:bg-purple-500/10 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-500/20">
                          {term.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-2">{term.definition}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center p-8 bg-slate-50/50 dark:bg-slate-950/20 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl space-y-2">
                  <AlertCircle className="w-8 h-8 text-slate-400 dark:text-slate-650 mx-auto" />
                  <h6 className="font-bold text-slate-600 dark:text-slate-400">No matched dictionary entry found</h6>
                  <p className="text-xs text-slate-500">Try using simpler financial coordinate search query or clear filters.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* GUIDES AND CASES TAB */}
        {activeTab === "guides" && (
          <motion.div
            key="tab-guides"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Guide Left Indices */}
            <div className="lg:col-span-4 space-y-2">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-2 px-2">
                Knowledge Cabinets
              </span>
              {[
                { id: "tax-regime", label: "1. Income Tax Schemes Guide", category: "Taxation" },
                { id: "mutual-funds", label: "2. Mutual Funds Direct vs Regular", category: "Investments" },
                { id: "retirement", label: "3. Retirement Longevity Planning", category: "Retirement" },
                { id: "one-crore", label: "4. SIP for ₹1 Crore Target", category: "SIP Tools" },
                { id: "returns-five", label: "5. ₹5,000 Monthly SIP Returns", category: "Estimators" },
                { id: "sip-vs-fd", label: "6. SIP vs FD: Which Is Better?", category: "Comparisons" },
                { id: "ppf-vs-nps", label: "7. PPF vs NPS Comparison Slabs", category: "Comparisons" },
                { id: "tax-saving", label: "8. Best Tax Saving Investment SGB", category: "Taxation" },
                { id: "budget", label: "9. 50-30-20 Rule Deep Explanation", category: "Budgeting" },
                { id: "fire", label: "10. FIRE Early Retirement India", category: "Retirement" }
              ].map((g) => (
                <button
                  key={g.id}
                  onClick={() => setSelectedGuideId(g.id)}
                  className={`w-full flex items-center justify-between text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    selectedGuideId === g.id
                      ? "bg-purple-600/15 border-purple-500 text-white"
                      : "bg-slate-950/40 border-slate-850 hover:bg-slate-950/80 hover:border-slate-805 text-slate-450"
                  }`}
                >
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-purple-400 font-extrabold">{g.category}</span>
                    <h5 className="text-xs font-extrabold text-white mt-1">{g.label}</h5>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${selectedGuideId === g.id ? "text-purple-400" : "text-slate-650"}`} />
                </button>
              ))}
            </div>

            {/* Guide Right Sheet Workspace */}
            <div className="lg:col-span-8 bg-slate-950/30 border border-slate-800/85 p-6 rounded-3xl text-sm leading-relaxed space-y-5">
              
              {/* 1. INCOME TAX GUIDE */}
              {selectedGuideId === "tax-regime" && (
                <div className="space-y-4">
                  <h4 className="text-base font-black text-purple-300">Income Tax Old vs. New Regime Optimized Blueprint</h4>
                  <p className="text-xs text-slate-400">
                    Understanding the optimal selection between standard tax regimes is vital for Indian salaried earners. Each system has discrete advantages depending on active deduction allowances.
                  </p>
                  
                  {/* Regime table */}
                  <div className="overflow-x-auto text-[11px] font-medium border border-slate-850 rounded-xl">
                    <table className="w-full text-left bg-slate-900/60">
                      <thead>
                        <tr className="bg-slate-950 text-slate-400 border-b border-slate-805">
                          <th className="p-3">Income Slabs (Lakhs)</th>
                          <th className="p-3">Old Regime Tax Slabs</th>
                          <th className="p-3">Default New Regime (115BAC)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850">
                        <tr>
                          <td className="p-3">Up to ₹3.0 Lakhs</td>
                          <td className="p-3 text-emerald-400 font-bold">Nil</td>
                          <td className="p-3 text-emerald-400 font-bold">Nil</td>
                        </tr>
                        <tr>
                          <td className="p-3">₹3.0 - ₹7.0 Lakhs</td>
                          <td className="p-3">5%</td>
                          <td className="p-3 text-emerald-400 font-bold">Nil (Tax rebate applied)</td>
                        </tr>
                        <tr>
                          <td className="p-3">₹7.0 - ₹10.0 Lakhs</td>
                          <td className="p-3">15%-20%</td>
                          <td className="p-3 text-purple-400 font-bold">10% - 15%</td>
                        </tr>
                        <tr>
                          <td className="p-3">Above ₹15.0 Lakhs</td>
                          <td className="p-3">30%</td>
                          <td className="p-3 text-purple-400 font-bold">30%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="p-3 bg-purple-950/20 border border-purple-900/30 rounded-xl text-xs space-y-1">
                    <span className="font-bold text-purple-300">💡 Optimization Recommendation:</span>
                    <p className="text-slate-350 text-[11.5px]">
                      If you pay over ₹3,75,000 annually in home mortgage interests (24b), standard 80C deductions, and health policies (80D), the **Old Regime** remains suitable. Otherwise, the **New Regime** is the mathematical victor.
                    </p>
                  </div>
                </div>
              )}

              {/* 2. MUTUAL FUNDS GUIDE */}
              {selectedGuideId === "mutual-funds" && (
                <div className="space-y-4">
                  <h4 className="text-base font-black text-purple-300">Harness Direct Mutual Funds vs Regular Plans</h4>
                  <p className="text-xs text-slate-400">
                    Many savers are unaware that bank intermediaries lock them into Regular Mutual Funds containing recurring distributor commissions. These commissions dramatically erode your compound compounding speed.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold leading-normal">
                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                      <span className="text-purple-400 text-[10px] uppercase block tracking-wider">Direct Mutual Funds</span>
                      <p className="text-slate-400 text-[11.5px] mt-2">Bought straight from AMC houses. Zero broker payout cuts. Lower Expense Ratio (typically 0.1% - 0.5%). Compounding accelerates to its maximum.</p>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                      <span className="text-rose-400 text-[10px] uppercase block tracking-wider">Regular Mutual Plans</span>
                      <p className="text-slate-400 text-[11.5px] mt-2">Commonly bought via local bank agents. Includes 1%-1.5% recurrent commissions deducted directly from your NAV annually forever.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. RETIREMENT PLANNING GUIDE */}
              {selectedGuideId === "retirement" && (
                <div className="space-y-4">
                  <h4 className="text-base font-black text-purple-300 font-display">Indian Pension Longevity Planning Blueprint</h4>
                  <p className="text-sm text-slate-350">
                    To plan for a sustainable retirement in India, your financial targets must defend against the twin threats of <strong>Inflation</strong> and <strong>Longevity</strong>.
                  </p>
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                    <span className="text-xs font-extrabold uppercase text-purple-400 block mb-2">Longevity Golden Rules:</span>
                    <ul className="space-y-2.5 text-xs text-slate-350 list-disc list-inside">
                      <li><strong>The 4% Rule In India:</strong> Target a conservative Safe Withdrawal Rate of 3% instead of 4% to defend against modern volatile commodity inflations.</li>
                      <li><strong>Liquid Portfolio Allocation:</strong> Maintain at least 3 years of expenses in plain liquid debt assets so you don't sell volatile equities during major market drops.</li>
                      <li><strong>Sovereign Health Support:</strong> Maintain senior-citizen specific independent health insurance policies separate from active employer corporate coverage.</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* 4. SIP FOR 1 CRORE */}
              {selectedGuideId === "one-crore" && (
                <div className="space-y-4">
                  <h4 className="text-base font-black text-purple-300 text-center flex items-center justify-center gap-1.5 font-display uppercase">
                    <Target className="w-5 h-5 text-purple-400" />
                    How much SIP is needed for ₹1 Crore?
                  </h4>
                  <p className="text-xs text-slate-400 text-center max-w-md mx-auto">
                    Determine the exact systematic monthly investment required starting today to accumulate a target pool of ₹1 Crore on your custom timeline.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 bg-slate-900/40 p-3.5 rounded-2xl border border-slate-850">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Target Timeline (Years)</span>
                        <span className="font-bold text-purple-400">{oneCroreTimeline} Years</span>
                      </div>
                      <input
                        type="range" min="3" max="30" step="1" value={oneCroreTimeline}
                        onChange={(e) => setOneCroreTimeline(Number(e.target.value))} className="w-full accent-purple-500 h-1"
                      />
                    </div>
                    <div className="space-y-2 bg-slate-900/40 p-3.5 rounded-2xl border border-slate-850">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Expected ROI (CAGR)</span>
                        <span className="font-bold text-purple-400">{oneCroreReturns}%</span>
                      </div>
                      <input
                        type="range" min="8" max="22" step="0.5" value={oneCroreReturns}
                        onChange={(e) => setOneCroreReturns(Number(e.target.value))} className="w-full accent-purple-500 h-1"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-purple-950/20 border border-purple-900/40 rounded-2xl text-center">
                    <span className="text-[10px] text-purple-400 uppercase font-bold block">Required Monthly SIP Amount:</span>
                    <h5 className="text-2xl font-black text-white mt-1.5">{fmtIndian(calculatedSipForOneCrore)} /mo</h5>
                    <p className="text-[10px] text-slate-450 mt-1 italic font-mono">
                      *Investing {fmtIndian(calculatedSipForOneCrore)} monthly for {oneCroreTimeline} years compounding at {oneCroreReturns}% yield compiles a ₹1 Crore wealth index!
                    </p>
                  </div>
                </div>
              )}

              {/* 5. 5000 Monthly SIP returns */}
              {selectedGuideId === "returns-five" && (
                <div className="space-y-4">
                  <h4 className="text-base font-black text-purple-300 flex items-center gap-1.5">
                    <TrendingUp className="w-5 h-5 text-purple-400" />
                    ₹5,000 Monthly SIP Expected Returns Sizer
                  </h4>
                  <p className="text-xs text-slate-400">
                    A fixed contribution of ₹5,000 monthly can grow into a formidable wealth index if compound variables are maximized over long accumulation grids.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 bg-slate-900 p-3.5 rounded-2xl border border-slate-850">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Custom Accumulation Years</span>
                        <span className="font-bold text-purple-400">{customSip5kYears} Years</span>
                      </div>
                      <input
                        type="range" min="5" max="35" step="5" value={customSip5kYears}
                        onChange={(e) => setCustomSip5kYears(Number(e.target.value))} className="w-full accent-purple-500 h-1"
                      />
                    </div>
                    <div className="space-y-2 bg-slate-900 p-3.5 rounded-2xl border border-slate-850">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Expected ROI %</span>
                        <span className="font-bold text-purple-400">{customSip5kRate}%</span>
                      </div>
                      <input
                        type="range" min="8" max="20" step="1" value={customSip5kRate}
                        onChange={(e) => setCustomSip5kRate(Number(e.target.value))} className="w-full accent-purple-500 h-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">TOTAL CAPITAL</span>
                      <p className="text-sm font-bold text-white mt-1">{fmtIndian(sip5kStats.invested)}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-400 block font-bold">WEALTH EARNED</span>
                      <p className="text-sm font-bold text-emerald-400 mt-1">{fmtIndian(sip5kStats.gains)}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-purple-400 block font-bold">MATURITY VALUE</span>
                      <p className="text-sm font-bold text-purple-400 mt-1">{fmtIndian(sip5kStats.maturity)}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* 6. SIP VS FD WHO IS BETTER */}
              {selectedGuideId === "sip-vs-fd" && (
                <div className="space-y-4">
                  <h4 className="text-base font-black text-purple-300">Compounding Battle: SIP vs. Bank FD</h4>
                  <p className="text-xs text-slate-400">
                    Many Indian savers stick to FDs for absolute psychological safety, but inflation and taxation systematically destroy consumer buying power over decades.
                  </p>
                  
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-xs space-y-3.5 leading-relaxed">
                    <p>
                      🛡️ <strong>Fixed Deposits (FD)</strong> compound safe returns (6%-7.5% historically). However, FD interest is added straight to your annual income and taxed at your marginal tax slab rate (up to 39%).
                    </p>
                    <p>
                      📈 <strong>Index Funds/SIPs</strong> compound market equity index returns (12%-15% historically). Earnings are subject to LTCG taxes (which is a minor flat 12.5% only on profits exceeding ₹1.25 Lakhs per year).
                    </p>
                  </div>
                </div>
              )}

              {/* 7. PPF VS NPS */}
              {selectedGuideId === "ppf-vs-nps" && (
                <div className="space-y-4">
                  <h4 className="text-base font-black text-purple-300 font-display uppercase tracking-tight">Public Provident Fund (PPF) vs. NPS Slabs</h4>
                  <p className="text-xs text-slate-400">
                    Compare the discrete lock-in structures and tax exemption benchmarks between PPF and the National Pension System (NPS).
                  </p>

                  <div className="overflow-x-auto text-[11px] font-medium border border-slate-850 rounded-xl">
                    <table className="w-full text-left bg-slate-900/60">
                      <thead>
                        <tr className="bg-slate-950 text-slate-400 border-b border-slate-805">
                          <th className="p-3">Metric</th>
                          <th className="p-3">Sovereign PPF</th>
                          <th className="p-3">National Pension System (NPS)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850">
                        <tr>
                          <td className="p-3 font-bold text-white">Risk Level</td>
                          <td className="p-3 text-emerald-400 font-bold">Zero (Sovereign)</td>
                          <td className="p-3 text-orange-400 font-bold">Moderate (Equity linked)</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-bold text-white">Tenure Lock-in</td>
                          <td className="p-3">15 Years</td>
                          <td className="p-3">Locked until Age 60</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-bold text-white">Tax Exemption Code</td>
                          <td className="p-3">Sec 80C (EEE)</td>
                          <td className="p-3">Sec 80C + Sec 80CCD(1B) up to ₹50k</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-bold text-white">Historic CAGR</td>
                          <td className="p-3">7.1% (yearly updated)</td>
                          <td className="p-3 text-purple-400">9% to 12.5% (E/C/G Mix)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 8. BEST TAX SAVING INVESTMENTS */}
              {selectedGuideId === "tax-saving" && (
                <div className="space-y-4">
                  <h4 className="text-base font-black text-purple-300 font-display">Section 80C & 80D Direct Investment Matrix</h4>
                  <p className="text-xs text-slate-400">
                    Compare key tax-saving direct pipelines under section 80C to optimize salary deductibility profiles.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs leading-normal font-medium">
                    <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl relative">
                      <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 uppercase tracking-wider font-extrabold">ELSS Funds</span>
                      <p className="text-[11.5px] text-slate-400 mt-2"><strong>Lock-in:</strong> 3 Years (shortest). <strong>Return:</strong> Equity index CAGR. <strong>Tax:</strong> Exempt up to ₹1.5L.</p>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl relative">
                      <span className="text-[9px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded border border-purple-500/20 uppercase tracking-wider font-extrabold">Sovereign PPF</span>
                      <p className="text-[11.5px] text-slate-400 mt-2"><strong>Lock-in:</strong> 15 Years. <strong>Return:</strong> Risk-free. <strong>Tax Status:</strong> EEE total exempt.</p>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl relative">
                      <span className="text-[9px] bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded border border-orange-500/20 uppercase tracking-wider font-extrabold">National NPS</span>
                      <p className="text-[11.5px] text-slate-400 mt-2"><strong>Lock-in:</strong> Age 60. <strong>Return:</strong> Highly scalable CAGR. <strong>Exempt code:</strong> 80CCD Extra ₹50,000.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* 9. 50-30-20 RULE EXPLAINED */}
              {selectedGuideId === "budget" && (
                <div className="space-y-4">
                  <h4 className="text-base font-black text-purple-300">50-30-20 Financial Discipline Standard</h4>
                  <p className="text-xs text-slate-350 leading-relaxed">
                    Popularized by US Senator Elizabeth Warren, the 50-30-20 framework is an elegant budgeting blueprint for dividing salary into three core components:
                  </p>
                  <ul className="space-y-3.5 text-xs text-slate-350 list-disc list-inside bg-slate-900 p-4 rounded-3xl border border-slate-800 leading-normal font-medium">
                    <li><strong>50% NEEDS:</strong> Absolute essentials you cannot live without. Rent/Mortgage, electricity, food, medical, standard children tuition.</li>
                    <li><strong>30% WANTS:</strong> Lifestyle choices. Outings, Netflix/Spotify plans, luxury items, and holiday trip spending.</li>
                    <li><strong>20% SAVINGS & SIP:</strong> Compound wealth targets. Stash this portion into Index Mutual Funds automatically on salary day.</li>
                  </ul>
                </div>
              )}

              {/* 10. FIRE EARLY RETIREMENT */}
              {selectedGuideId === "fire" && (
                <div className="space-y-4">
                  <h4 className="text-base font-black text-purple-300 uppercase tracking-tight font-display">How to Retire Early in India (FIRE Framework)</h4>
                  <p className="text-xs text-slate-400">
                    The Financial Independence, Retire Early (FIRE) movement is gaining high traction among young Indian IT/salaried professionals who prioritize freedom over corporate cycles.
                  </p>
                  
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-3xl text-xs space-y-3 leading-relaxed">
                    <p>
                      💵 <strong>Calculate Your 'FI Number' :</strong> Save an absolute retirement corpus equal to **25x to 35x of your annual expenses**.
                    </p>
                    <p>
                      🛡️ <strong>The 'Safe Withdrawal Rate' (SWR) :</strong> Withdraw no more than **3.0% to 3.5%** of your capital annually during inflation spikes to preserve wealth principal in perpetuam.
                    </p>
                  </div>
                </div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Branding notice */}
      <div className="mt-3 text-center border-t border-slate-800 pt-4 flex flex-col md:flex-row items-center justify-between text-[11px] text-slate-500 relative">
        <span>Designed purely for Indian Salaried Professionals</span>
        <span className="font-mono text-purple-400/80">Paisa Blueprint Security Layer</span>
      </div>
    </div>
  );
}
