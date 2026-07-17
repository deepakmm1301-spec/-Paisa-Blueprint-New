import React, { useState, useMemo, useEffect } from "react";
import { 
  TrendingUp, 
  HelpCircle, 
  ArrowUpDown, 
  Target, 
  CheckCircle2, 
  Coins, 
  Scale, 
  PiggyBank, 
  Compass, 
  ChevronRight, 
  Calculator, 
  AlertCircle, 
  Sparkles, 
  BookOpen, 
  Info,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  Check,
  AlertTriangle,
  FileDown
} from "lucide-react";
import { generatePDFReport } from "../utils/pdfGenerator";

interface PaiseToRupeeProps {
  userGrossMonthly?: number;
  language?: "hi" | "en";
}

export default function PaiseToRupee({ userGrossMonthly = 75000, language: propLanguage }: PaiseToRupeeProps) {
  const [activeQuestion, setActiveQuestion] = useState<string>("returns");
  const [language, setLanguage] = useState<"hi" | "en">(() => {
    return propLanguage || (localStorage.getItem("paisa_lang_selection") as "hi" | "en") || "hi";
  });

  // Synchronize internal language with prop updates
  useEffect(() => {
    if (propLanguage) {
      setLanguage(propLanguage);
    }
  }, [propLanguage]);

  // 1. ₹5,000 SIP FOR 20 YEARS STATES
  const [sip5kAmount, setSip5kAmount] = useState<number>(5000);
  const [sip5kYears, setSip5kYears] = useState<number>(20);
  const [sip5kRate, setSip5kRate] = useState<number>(12);
  const [sip5kStepUp, setSip5kStepUp] = useState<number>(0);

  // 2. SIP VS FD STATES
  const [compareAmount, setCompareAmount] = useState<number>(10000);
  const [compareYears, setCompareYears] = useState<number>(10);
  const [compareSipRate, setCompareSipRate] = useState<number>(13.5);
  const [compareFdRate, setCompareFdRate] = useState<number>(7.1);

  // 3. TARGET CORPUS STATES
  const [targetCorpus, setTargetCorpus] = useState<number>(10000000); // 1 Crore
  const [targetYears, setTargetYears] = useState<number>(15);
  const [targetRate, setTargetRate] = useState<number>(12.0);
  const [targetStepUp, setTargetStepUp] = useState<number>(10);

  // 4. PPF VS NPS STATES
  const [ppfNpsAmount, setPpfNpsAmount] = useState<number>(100000); // Yearly
  const [ppfNpsYears, setPpfNpsYears] = useState<number>(20);
  const [npsEquityReturn, setNpsEquityReturn] = useState<number>(11.5);

  // 5. TAX SAVER PLANNER STATES
  const [taxSlab, setTaxSlab] = useState<number>(20); // 10%, 20%, 30%
  const [elssAmt, setElssAmt] = useState<number>(50000);
  const [ppfAmt, setPpfAmt] = useState<number>(50000);
  const [nscAmt, setNscAmt] = useState<number>(20000);
  const [npsAmt, setNpsAmt] = useState<number>(30000); // Section 80CCD
  const [healthAmt, setHealthAmt] = useState<number>(15000);

  // 6. 50-30-20 BUDGET STATES
  const [budgetIncome, setBudgetIncome] = useState<number>(userGrossMonthly);
  const [actualNeeds, setActualNeeds] = useState<number>(Math.round(userGrossMonthly * 0.55));
  const [actualWants, setActualWants] = useState<number>(Math.round(userGrossMonthly * 0.25));
  const [actualSavings, setActualSavings] = useState<number>(Math.round(userGrossMonthly * 0.20));

  // 7. RETIRE EARLY (FIRE) STATES
  const [currentAge, setCurrentAge] = useState<number>(30);
  const [retireAge, setRetireAge] = useState<number>(45);
  const [monthlyExpense, setMonthlyExpense] = useState<number>(40000);
  const [inflationRate, setInflationRate] = useState<number>(6);
  const [preRetireReturn, setPreRetireReturn] = useState<number>(12);
  const [postRetireReturn, setPostRetireReturn] = useState<number>(8);

  const formatCurrency = (val: number) => {
    return "₹" + Math.round(val).toLocaleString("en-IN");
  };

  const formatCurrencyCompact = (val: number) => {
    if (val >= 10000000) {
      return `₹${(val / 10000000).toFixed(2)} Cr`;
    }
    if (val >= 100000) {
      return `₹${(val / 100000).toFixed(2)} Lakh`;
    }
    return `₹${Math.round(val).toLocaleString("en-IN")}`;
  };

  // --- MATHS COMPILING ---

  // 1. Expected Returns compiled
  const sip5kComp = useMemo(() => {
    const monthlyRate = sip5kRate / 100 / 12;
    let totalValue = 0;
    let totalInvested = 0;
    let currentSip = sip5kAmount;

    for (let y = 1; y <= sip5kYears; y++) {
      for (let m = 1; m <= 12; m++) {
        totalInvested += currentSip;
        totalValue = (totalValue + currentSip) * (1 + monthlyRate);
      }
      currentSip = Math.round(currentSip * (1 + sip5kStepUp / 100));
    }
    const gains = Math.max(0, totalValue - totalInvested);
    const multiplier = (totalValue / Math.max(1, totalInvested)).toFixed(1);
    return {
      invested: totalInvested,
      maturity: totalValue,
      gains,
      multiplier
    };
  }, [sip5kAmount, sip5kYears, sip5kRate, sip5kStepUp]);

  // 2. SIP vs FD compiled
  const sipVsFdComp = useMemo(() => {
    const months = compareYears * 12;
    // SIP Calculation
    const monthlySipRate = compareSipRate / 100 / 12;
    let sipMaturity = 0;
    let totalInvested = compareAmount * months;
    for (let i = 0; i < months; i++) {
      sipMaturity = (sipMaturity + compareAmount) * (1 + monthlySipRate);
    }

    // RD/FD Compounding (Recurrent Monthly FD equivalent)
    const monthlyFdRate = compareFdRate / 100 / 12;
    let fdMaturity = 0;
    for (let i = 0; i < months; i++) {
      fdMaturity = (fdMaturity + compareAmount) * (1 + monthlyFdRate);
    }

    const wealthGap = Math.max(0, sipMaturity - fdMaturity);
    const sipGains = Math.max(0, sipMaturity - totalInvested);
    const fdGains = Math.max(0, fdMaturity - totalInvested);

    return {
      totalInvested,
      sipMaturity,
      fdMaturity,
      wealthGap,
      sipGains,
      fdGains
    };
  }, [compareAmount, compareYears, compareSipRate, compareFdRate]);

  // 3. SIP Needed for 1 Crore compiled
  const sipFor1CrComp = useMemo(() => {
    const target = targetCorpus;
    const rate = targetRate / 100;
    const monthlyRate = rate / 12;
    const totalMonths = targetYears * 12;

    // Normal flat SIP formula: FV = P * [((1+i)^n - 1)/i] * (1+i)
    const factorNormal = ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * (1 + monthlyRate);
    const sipNeededNormal = target / factorNormal;

    // Numerical solver for step-up SIP to find starting monthly SIP
    // FV = starting_sip * sum_months_y ( (1 + stepUp_y) * (1 + i)^(n - m) ... )
    let startingSipLow = 1;
    let startingSipHigh = target;
    let iterations = 100;
    let sipNeededWithStepUp = 0;

    const stepUpRate = targetStepUp / 100;

    while (iterations > 0) {
      const midSip = (startingSipLow + startingSipHigh) / 2;
      let totalValueComputed = 0;
      let currentSip = midSip;

      for (let y = 1; y <= targetYears; y++) {
        const remainingMonths = (targetYears - y + 1) * 12;
        // compound return factor for y-th year's lump
        // simplified standard step up calculation:
        for (let m = 1; m <= 12; m++) {
          const exponentOfComp = totalMonths - ((y - 1) * 12 + m) + 1;
          totalValueComputed += currentSip * Math.pow(1 + monthlyRate, exponentOfComp);
        }
        currentSip = currentSip * (1 + stepUpRate);
      }

      if (Math.abs(totalValueComputed - target) < 10) {
        sipNeededWithStepUp = midSip;
        break;
      } else if (totalValueComputed > target) {
        startingSipHigh = midSip;
      } else {
        startingSipLow = midSip;
      }
      iterations--;
      if (iterations === 1) {
        sipNeededWithStepUp = midSip;
      }
    }

    return {
      sipNeededNormal: Math.max(100, Math.round(sipNeededNormal)),
      sipNeededWithStepUp: Math.max(100, Math.round(sipNeededWithStepUp))
    };
  }, [targetCorpus, targetYears, targetRate, targetStepUp]);

  // 4. PPF vs NPS Comparison compiled
  const ppfVsNpsComp = useMemo(() => {
    const rPPF = 7.1 / 100; // PPF fixed rate
    const rNPS = npsEquityReturn / 100; // NPS adjustable rate

    let ppfMaturity = 0;
    let npsMaturity = 0;
    let totalPaid = ppfNpsAmount * ppfNpsYears;

    for (let y = 1; y <= ppfNpsYears; y++) {
      // Annual compounding (PPF adds yearly, standard model)
      ppfMaturity = (ppfMaturity + ppfNpsAmount) * (1 + rPPF);
      npsMaturity = (npsMaturity + ppfNpsAmount) * (1 + rNPS);
    }

    const ppfGains = Math.max(0, ppfMaturity - totalPaid);
    const npsGains = Math.max(0, npsMaturity - totalPaid);
    const npsTaxFreeLumpsum = npsMaturity * 0.60;
    const npsAnnuityRequired = npsMaturity * 0.40;
    const estimatedYearlyAnnuityIncome = npsAnnuityRequired * 0.06; // Standard 6% annuity yield 

    return {
      totalPaid,
      ppfMaturity,
      npsMaturity,
      ppfGains,
      npsGains,
      npsTaxFreeLumpsum,
      npsAnnuityRequired,
      estimatedYearlyAnnuityIncome
    };
  }, [ppfNpsAmount, ppfNpsYears, npsEquityReturn]);

  // 5. Tax Optimizer compiled
  const taxOptimizerComp = useMemo(() => {
    // Section 80C check (capped at 1,50,005 limit)
    const total80CProposed = elssAmt + ppfAmt + nscAmt;
    const active80CAllowed = Math.min(150000, total80CProposed);

    // Section 80CCD(1B) NPS extra savings (capped at 50,005)
    const active80CCDAllowed = Math.min(50000, npsAmt);

    // Section 80D Health Premiums check (capped at 25,005 for general)
    const active80DAllowed = Math.min(25000, healthAmt);

    const totalDeductions = active80CAllowed + active80CCDAllowed + active80DAllowed;
    const realTaxSaved = totalDeductions * (taxSlab / 100);

    return {
      total80CProposed,
      active80CAllowed,
      active80CCDAllowed,
      active80DAllowed,
      totalDeductions,
      realTaxSaved
    };
  }, [elssAmt, ppfAmt, nscAmt, npsAmt, healthAmt, taxSlab]);

  // 6. 50-30-20 Budget rule compiled
  const budgetComp = useMemo(() => {
    const idealNeeds = budgetIncome * 0.50;
    const idealWants = budgetIncome * 0.30;
    const idealSavings = budgetIncome * 0.20;

    const actualTotalSpendRate = actualNeeds + actualWants + actualSavings;
    const needsPercent = Math.round((actualNeeds / Math.max(1, budgetIncome)) * 100);
    const wantsPercent = Math.round((actualWants / Math.max(1, budgetIncome)) * 100);
    const savingsPercent = Math.round((actualSavings / Math.max(1, budgetIncome)) * 100);

    let statusType: "excellent" | "needs-heavy" | "wants-heavy" | "unbalanced" = "excellent";
    if (savingsPercent < 15) {
      statusType = "unbalanced";
    } else if (needsPercent > 55) {
      statusType = "needs-heavy";
    } else if (wantsPercent > 35) {
      statusType = "wants-heavy";
    }

    return {
      idealNeeds,
      idealWants,
      idealSavings,
      needsPercent,
      wantsPercent,
      savingsPercent,
      actualTotalSpendRate,
      statusType
    };
  }, [budgetIncome, actualNeeds, actualWants, actualSavings]);

  // 7. FIRE Early retirement compiled
  const fireComp = useMemo(() => {
    const yearsToAccumulate = retireAge - currentAge;
    const yearsRetired = Math.max(10, 85 - retireAge);
    const annualExpenseCurrent = monthlyExpense * 12;

    // Inflation rate multiplier post retirement
    // Future expense = Current Expense * (1 + inflation)^yearsToAccumulate
    const adjustedAnnualExpenseRetire = annualExpenseCurrent * Math.pow(1 + inflationRate / 100, Math.max(0, yearsToAccumulate));
    const adjustedMonthlyExpense = adjustedAnnualExpenseRetire / 12;

    // Safe Withdrawal Rate: Standard rule is 4%, but inside highly inflationary India we usually use 3.33% (~30x expense)
    const fireCorpusNeeded = adjustedAnnualExpenseRetire * 30; // 30 Years expenses multiplier

    // Monthly compound accumulation target to find starting SIP required
    const monthlyAccumRate = preRetireReturn / 100 / 12;
    const accumulationMonths = Math.max(1, yearsToAccumulate * 12);
    
    let requiredSipStarting = 0;
    if (yearsToAccumulate > 0) {
      const factorAcc = ((Math.pow(1 + monthlyAccumRate, accumulationMonths) - 1) / monthlyAccumRate) * (1 + monthlyAccumRate);
      requiredSipStarting = fireCorpusNeeded / factorAcc;
    }

    return {
      yearsToAccumulate,
      yearsRetired,
      adjustedAnnualExpenseRetire,
      adjustedMonthlyExpense,
      fireCorpusNeeded,
      requiredSipStarting
    };
  }, [currentAge, retireAge, monthlyExpense, inflationRate, preRetireReturn]);

  const shareText = useMemo(() => {
    let text = "";
    if (activeQuestion === "returns") {
      text = language === "hi" 
        ? `🔥 पैसे से पैसा बनाना सीखो! ₹${sip5kAmount.toLocaleString("en-IN")} मासिक एसआईपी से ${sip5kYears} वर्षों में ${formatCurrencyCompact(sip5kComp.maturity)} बन सकता है! (निवेश: ${formatCurrencyCompact(sip5kComp.invested)})\nअपना वेल्थ कैलकुलेट करें:`
        : `🔥 Learn to Grow Money! A monthly SIP of ₹${sip5kAmount.toLocaleString("en-IN")} over ${sip5kYears} years can mature to ${formatCurrencyCompact(sip5kComp.maturity)}! (Invested: ${formatCurrencyCompact(sip5kComp.invested)})\nCalculate your wealth here:`;
    } else if (activeQuestion === "sip-vs-fd") {
      text = language === "hi"
        ? `📈 SIP बनाम FD संग्राम: मासिक ₹${compareAmount.toLocaleString("en-IN")} से ${compareYears} वर्षों में SIP मैच्योरिटी ${formatCurrencyCompact(sipVsFdComp.sipMaturity)} और FD मैच्योरिटी ${formatCurrencyCompact(sipVsFdComp.fdMaturity)} होगी। SIP ने ${formatCurrencyCompact(sipVsFdComp.wealthGap)} अधिक बनाया!\nयहाँ कंपेयर करें:`
        : `📈 SIP vs FD Battle: Monthly ₹${compareAmount.toLocaleString("en-IN")} for ${compareYears} years gives SIP maturity ${formatCurrencyCompact(sipVsFdComp.sipMaturity)} vs FD maturity ${formatCurrencyCompact(sipVsFdComp.fdMaturity)}. SIP generated ${formatCurrencyCompact(sipVsFdComp.wealthGap)} extra!\nCompare now:`;
    } else if (activeQuestion === "crore-sip") {
      text = language === "hi"
        ? `🎯 ₹${(targetCorpus / 10000000).toFixed(1)} करोड़ के लक्ष्य के लिए ${targetYears} वर्ष में सामान्यतः ${formatCurrency(sipFor1CrComp.sipNeededNormal)}/माह या ${targetStepUp}% वार्षिक स्टेप-अप के साथ ${formatCurrency(sipFor1CrComp.sipNeededWithStepUp)}/माह की शुरुआत चाहिए!\nअपनी करोड़पति योजना बनाएं:`
        : `🎯 To achieve ₹${(targetCorpus / 10000000).toFixed(1)} Crore in ${targetYears} years, you need a starting SIP of ${formatCurrency(sipFor1CrComp.sipNeededNormal)}/mo normally, or ${formatCurrency(sipFor1CrComp.sipNeededWithStepUp)}/mo with a ${targetStepUp}% annual step-up!\nPlan your Crore goal:`;
    } else if (activeQuestion === "ppf-vs-nps") {
      text = language === "hi"
        ? `⚖️ PPF बनाम NPS तुलना: सालाना ₹${ppfNpsAmount.toLocaleString("en-IN")} निवेश से ${ppfNpsYears} वर्षों में PPF से ${formatCurrencyCompact(ppfVsNpsComp.ppfMaturity)} और NPS से ${formatCurrencyCompact(ppfVsNpsComp.npsMaturity)} मिल सकता है!\nदोनों को यहाँ कंपेयर करें:`
        : `⚖️ PPF vs NPS: Saving ₹${ppfNpsAmount.toLocaleString("en-IN")}/yr over ${ppfNpsYears} years can yield PPF maturity of ${formatCurrencyCompact(ppfVsNpsComp.ppfMaturity)} vs NPS maturity of ${formatCurrencyCompact(ppfVsNpsComp.npsMaturity)}!\nCompare PPF & NPS:`;
    } else if (activeQuestion === "tax-opt") {
      text = language === "hi"
        ? `💰 आयकर निवारण गाइड: मैंने 80C, 80D और NPS योजनाकारों का उपयोग करके कुल ${formatCurrency(taxOptimizerComp.totalDeductions)} की टैक्स छूट की गणना की, जिससे ${formatCurrency(taxOptimizerComp.realTaxSaved)} कर की सीधी बचत होगी!\nअपना टैक्स सेविंग्स प्लानर देखें:`
        : `💰 Direct Tax Savings Planner: I computed a total tax exemption of ${formatCurrency(taxOptimizerComp.totalDeductions)} saving me ${formatCurrency(taxOptimizerComp.realTaxSaved)} in income tax!\nExempt your income tax:`;
    } else if (activeQuestion === "budget") {
      text = language === "hi"
        ? `📊 50-30-20 बजट नियम विश्लेषण: मासिक आय ${formatCurrency(budgetIncome)} में से मेरा बजट Target - Needs: ${budgetComp.needsPercent}%, Wants: ${budgetComp.wantsPercent}%, Savings: ${budgetComp.savingsPercent}% है।\nअपने बजट का संतुलन जाँचें:`
        : `📊 50-30-20 Budget Optimizer: On a monthly income of ${formatCurrency(budgetIncome)}, my allocation is Needs: ${budgetComp.needsPercent}%, Wants: ${budgetComp.wantsPercent}%, Savings: ${budgetComp.savingsPercent}%.\nCheck your budget allocation:`;
    } else if (activeQuestion === "fire-retire") {
      text = language === "hi"
        ? `🌴 भारत में समय से पहले रिटायरमेंट (Early FIRE): मात्र ${retireAge} वर्ष की आयु में रिटायर होने के लिए ${formatCurrencyCompact(fireComp.fireCorpusNeeded)} संपदा की जरूरत है। आज ही ${formatCurrency(fireComp.requiredSipStarting)}/माह की SIP शुरू करें!\nअपना FIRE कॉर्पस यहाँ ढूंढें:`
        : `🌴 Early Retirement in India (FIRE): To retire early at age ${retireAge}, I need a corpus of ${formatCurrencyCompact(fireComp.fireCorpusNeeded)}. Starting SIP required: ${formatCurrency(fireComp.requiredSipStarting)}/mo today!\nCalculate your FIRE index:`;
    }
    const currentUrl = typeof window !== "undefined"
      ? `${window.location.origin}/?widget=learning`
      : "https://paisablueprint.in/?widget=learning";
    return encodeURIComponent(`${text}\n${currentUrl}`);
  }, [
    activeQuestion, language, sip5kAmount, sip5kYears, sip5kComp,
    compareAmount, compareYears, sipVsFdComp, targetCorpus, targetYears,
    sipFor1CrComp, ppfNpsAmount, ppfNpsYears, ppfVsNpsComp, taxOptimizerComp,
    budgetIncome, budgetComp, retireAge, fireComp
  ]);

  const questionsList = [
    {
      id: "returns",
      icon: <TrendingUp className="w-4 h-4" />,
      hiLabel: "₹5,000 SIP: 20 साल के रिटर्न्स",
      enLabel: "₹5,000 SIP: 20 Year Returns",
      hiDesc: "₹5,000 की मासिक किस्त 12% से लेकर 15% की दर से 20 वर्षों में क्या बना सकती है?",
      enDesc: "What can a monthly installment of ₹5,000 compound into over 20 years?"
    },
    {
      id: "sip-vs-fd",
      icon: <ArrowUpDown className="w-4 h-4" />,
      hiLabel: "SIP vs FD: कौन सा बेहतर है?",
      enLabel: "SIP vs FD: Which is Better?",
      hiDesc: "म्यूचुअल फंड एसआईपी बनाम बैंक फिक्स्ड डिपॉजिट: स्पष्ट आंकड़े, जोखिम और टैक्स तुलना",
      enDesc: "SIP vs Fixed Deposit: Growth rate, safety, locking and tax comparisons"
    },
    {
      id: "crore-sip",
      icon: <Target className="w-4 h-4" />,
      hiLabel: "₹1 करोड़ के लिए कितना SIP चाहिए?",
      enLabel: "SIP Required for ₹1 Crore?",
      hiDesc: "यदि आपका लक्ष्य ₹1 करोड़ की संप्रभु संपत्ति जोड़ना है तो कितना निवेश करें?",
      enDesc: "Calculate how much starting SIP is needed to reach a corpus of ₹1 Crore"
    },
    {
      id: "ppf-vs-nps",
      icon: <Scale className="w-4 h-4" />,
      hiLabel: "PPF v/s NPS: पेंशन व निवेश तुलना",
      enLabel: "PPF vs NPS: Comparison Guide",
      hiDesc: "सुरक्षित पीपीएफ 7.1% टैक्स-फ्री रिटर्न बनाम बाजार समर्थित राष्ट्रीय पेंशन प्रणाली का यथार्थ आकलन",
      enDesc: "PPF vs NPS: Tax benefits under Section 80C and Section 80CCD, returns & rules"
    },
    {
      id: "tax-opt",
      icon: <Coins className="w-4 h-4" />,
      hiLabel: "सर्वश्रेष्ठ टैक्स बचत निवेश मार्ग",
      enLabel: "Best Tax Saving Investments",
      hiDesc: "धारा 80C (ELSS, PPF), 80D और NPS के जरिये कैसे बचाएं लाखों रुपये का आयकर?",
      enDesc: "Optimize ELSS, NPS and health premium allocations to maximize tax refunds"
    },
    {
      id: "budget",
      icon: <PiggyBank className="w-4 h-4" />,
      hiLabel: "50-30-20 बजट नियम का सच",
      enLabel: "50-30-20 Budget Rule Explained",
      hiDesc: "अपनी जेब के खर्चों को सुव्यवस्थित करें: क्या आपका नीड्स (Needs), वांट्स (Wants) और सेविंग्स (Savings) संतुलित है?",
      enDesc: "Apply the 50/30/20 monthly asset rule to streamline your income allocation"
    },
    {
      id: "fire-retire",
      icon: <Compass className="w-4 h-4" />,
      hiLabel: "भारत में समय से पहले रिटायरमेंट",
      enLabel: "How to Retire Early in India (FIRE)",
      hiDesc: "FIRE (वित्तीय स्वतंत्रता, शीघ्र सेवानिवृत्ति) फॉर्मूले का उपयोग करके संचित फंड की गणना करें",
      enDesc: "Calculate your early retirement FIRE corpus based on inflation and savings rate"
    }
  ];

  const downloadPDFReport = () => {
    let title = "";
    let subtitle = "";
    let sections: any[] = [];
    let notes: string[] = [];

    if (activeQuestion === "returns") {
      title = "Systematic Investment Plan (SIP) Projection Report";
      subtitle = "Systematic long-term capital compounding and wealth estimation";
      sections = [
        {
          title: "Investment Input Specifications",
          items: [
            { label: "Monthly Contribution (Starting)", value: `INR ${sip5kAmount.toLocaleString("en-IN")}/mo` },
            { label: "Planning Period (Tenure)", value: `${sip5kYears} Years` },
            { label: "Assumed Annual Return Rate (CAGR)", value: `${sip5kRate}%` },
            { label: "Annual Step-Up Increment Rate", value: `${sip5kStepUp}%` }
          ]
        },
        {
          title: "Maturity & Growth Compilation",
          items: [
            { label: "Total Amount Invested Over Period", value: `INR ${sip5kComp.invested.toLocaleString("en-IN")}` },
            { label: "Estimated Compound Growth Gains", value: `INR ${sip5kComp.gains.toLocaleString("en-IN")}` },
            { label: "Estimated Future Maturity Value", value: `INR ${sip5kComp.maturity.toLocaleString("en-IN")}` },
            { label: "Asset Growth Multiplier Index", value: `${sip5kComp.multiplier}x times investment` }
          ]
        }
      ];
      notes = [
        "Returns on Mutual Fund equity SIPs are indicative of historic market performance averages and are subject to market volatility.",
        "Step-Up SIP plans allow you to increase monthly allocations in sync with salary increments, compounding your wealth much faster.",
        "LTCG (Long Term Capital Gains) taxes are applicable on mutual fund returns over 1.25 Lakhs per financial year."
      ];
    } else if (activeQuestion === "sip-vs-fd") {
      title = "SIP Equity vs. Fixed Deposit (FD) Comparative Analysis";
      subtitle = "Compounding growth comparison: Inflation-protected equity vs. guaranteed debt returns";
      sections = [
        {
          title: "Investment Comparison Specs",
          items: [
            { label: "Monthly Allocation (Same for both)", value: `INR ${compareAmount.toLocaleString("en-IN")}/mo` },
            { label: "Comparison Tenure Period", value: `${compareYears} Years` },
            { label: "Assumed Equity SIP Growth Rate (CAGR)", value: `${compareSipRate}%` },
            { label: "Standard Bank Fixed Deposit (FD) Rate", value: `${compareFdRate}%` }
          ]
        },
        {
          title: "Equity Mutual Fund Projections (SIP)",
          items: [
            { label: "Total Cumulative Investment", value: `INR ${sipVsFdComp.totalInvested.toLocaleString("en-IN")}` },
            { label: "Estimated Mutual Fund Gains", value: `INR ${sipVsFdComp.sipGains.toLocaleString("en-IN")}` },
            { label: "Expected SIP Maturity Amount", value: `INR ${sipVsFdComp.sipMaturity.toLocaleString("en-IN")}` }
          ]
        },
        {
          title: "Guaranteed Bank Fixed Deposit (FD)",
          items: [
            { label: "Total Cumulative Investment", value: `INR ${sipVsFdComp.totalInvested.toLocaleString("en-IN")}` },
            { label: "Guaranteed Interest Gains", value: `INR ${sipVsFdComp.fdGains.toLocaleString("en-IN")}` },
            { label: "Expected FD Maturity Amount", value: `INR ${sipVsFdComp.fdMaturity.toLocaleString("en-IN")}` }
          ]
        },
        {
          title: "Wealth Growth Summary",
          items: [
            { label: "Incremental Equity Premium (Wealth Gap)", value: `INR ${sipVsFdComp.wealthGap.toLocaleString("en-IN")}` }
          ]
        }
      ];
      notes = [
        "Fixed Deposits yield guaranteed nominal returns but rarely outcompete long-term compounding inflation indices.",
        "Equity mutual fund investments carry standard capital market risks but offer substantial inflation premiums over standard debt.",
        "Taxation is different: FD interest is taxed at slab rates yearly, whereas equity mutual fund returns are taxed as capital gains upon redemption."
      ];
    } else if (activeQuestion === "crore-sip") {
      title = "Milestone Goal Tracker: Target Corpus Roadmap";
      subtitle = "Systematic roadmap to achieve your target milestone capital";
      sections = [
        {
          title: "Milestone Target Scope",
          items: [
            { label: "Desired Target Goal Corpus Value", value: `INR ${targetCorpus.toLocaleString("en-IN")}` },
            { label: "Desired Year Timeline", value: `${targetYears} Years` },
            { label: "Assumed Investment Annual Growth (CAGR)", value: `${targetRate}%` },
            { label: "Yearly Step-Up Rate Selected", value: `${targetStepUp}%` }
          ]
        },
        {
          title: "Required Monthly Allocation Strategies",
          items: [
            { label: "Fixed Monthly SIP (Zero Step-Up)", value: `INR ${sipFor1CrComp.sipNeededNormal.toLocaleString("en-IN")}/mo` },
            { label: "Optimized Step-Up Monthly SIP (Starting Year 1)", value: `INR ${sipFor1CrComp.sipNeededWithStepUp.toLocaleString("en-IN")}/mo` }
          ]
        }
      ];
      notes = [
        "An optimized step-up investment strategy lowers the required initial savings burden by matching your contribution increases with income growth.",
        "Projections do not represent formal guarantees of yield, but highlight mathematical systematic compounding formulas."
      ];
    } else if (activeQuestion === "ppf-vs-nps") {
      title = "PPF vs. NPS Comparative Retirement Diagnostics";
      subtitle = "Public Provident Fund (Debt) vs. National Pension System (Mixed Asset Class)";
      sections = [
        {
          title: "Retirement Contributions Specs",
          items: [
            { label: "Yearly Contribution Amount", value: `INR ${ppfNpsAmount.toLocaleString("en-IN")}/yr` },
            { label: "Retirement Contribution Tenure", value: `${ppfNpsYears} Years` },
            { label: "PPF Sovereign Fixed Rate", value: "7.1% (Tax Free)" },
            { label: "Estimated NPS Average Annual Return", value: `${npsEquityReturn}%` }
          ]
        },
        {
          title: "Public Provident Fund (PPF) Growth",
          items: [
            { label: "Total Contributed PPF Capital", value: `INR ${ppfVsNpsComp.totalPaid.toLocaleString("en-IN")}` },
            { label: "Guaranteed Tax-free Interest earned", value: `INR ${ppfVsNpsComp.ppfGains.toLocaleString("en-IN")}` },
            { label: "Total PPF Maturity (Tax Free Lumpsum)", value: `INR ${ppfVsNpsComp.ppfMaturity.toLocaleString("en-IN")}` }
          ]
        },
        {
          title: "National Pension System (NPS) Projections",
          items: [
            { label: "Total Contributed NPS Capital", value: `INR ${ppfVsNpsComp.totalPaid.toLocaleString("en-IN")}` },
            { label: "Estimated Investment Interest Gains", value: `INR ${ppfVsNpsComp.npsGains.toLocaleString("en-IN")}` },
            { label: "Estimated NPS Total Corpus at Retirement", value: `INR ${ppfVsNpsComp.npsMaturity.toLocaleString("en-IN")}` },
            { label: "Max 60% Tax-Free Lumpsum Withdrawal", value: `INR ${ppfVsNpsComp.npsTaxFreeLumpsum.toLocaleString("en-IN")}` },
            { label: "Mandatory 40% Annuity Investment Core", value: `INR ${ppfVsNpsComp.npsAnnuityRequired.toLocaleString("en-IN")}` },
            { label: "Indicative Monthly Pension From Annuity", value: `INR ${Math.round(ppfVsNpsComp.estimatedYearlyAnnuityIncome / 12).toLocaleString("en-IN")}/mo` }
          ]
        }
      ];
      notes = [
        "PPF enjoys fully exempt-exempt-exempt (EEE) sovereign status, but capped maximum investments of 1.5 Lakhs per financial year apply.",
        "NPS offers additional tax deduction under Section 80CCD(1B) of up to 50,000 INR. 60% of retirement maturity corpus is tax-free while the remaining 40% must purchase standard pension annuity schemes.",
        "NPS equity schemes generally yield higher inflation-adjusted returns than fixed-debt channels."
      ];
    } else if (activeQuestion === "tax-opt") {
      title = "Income Tax Deductions Optimization Roadmap";
      subtitle = "Optimized deductions allocation under Section 80C, 80D, and 80CCD";
      sections = [
        {
          title: "Proposed Deductions Matrix",
          items: [
            { label: "Declared Section 80C - ELSS Mutual Funds", value: `INR ${elssAmt.toLocaleString("en-IN")}` },
            { label: "Declared Section 80C - PPF Deposits", value: `INR ${ppfAmt.toLocaleString("en-IN")}` },
            { label: "Declared Section 80C - NSC Certs/EPF/FDs", value: `INR ${nscAmt.toLocaleString("en-IN")}` },
            { label: "Declared Section 80CCD - Extra NPS", value: `INR ${npsAmt.toLocaleString("en-IN")}` },
            { label: "Declared Section 80D - Health Insurance Premiums", value: `INR ${healthAmt.toLocaleString("en-IN")}` }
          ]
        },
        {
          title: "Deductions & Refunding Synthesis",
          items: [
            { label: "Total Deductions Claimed", value: `INR ${taxOptimizerComp.totalDeductions.toLocaleString("en-IN")}` },
            { label: "Tax Bracket Rate Slab", value: `${taxSlab}%` },
            { label: "Estimated Annual Income Tax Saved", value: `INR ${taxOptimizerComp.realTaxSaved.toLocaleString("en-IN")}` }
          ]
        }
      ];
      notes = [
        "The Section 80C tax deduction limit is strictly capped at a maximum of 1,50,000 INR per financial year across all components.",
        "Section 80CCD(1B) allows for an additional tax deduction of up to 50,000 INR strictly for NPS contributions.",
        "Section 80D covers health insurance premiums for self, spouse, and dependents, with standard limits of 25,000 INR (increased to 50,000 INR for senior citizens)."
      ];
    } else if (activeQuestion === "budget") {
      const needsDelta = budgetComp.idealNeeds - actualNeeds;
      const wantsDelta = budgetComp.idealWants - actualWants;
      const savingsDelta = actualSavings - budgetComp.idealSavings;

      title = "50-30-20 Monthly Budget Allocation Audit";
      subtitle = "Personal cash flow optimization matching standard household budgeting guidelines";
      sections = [
        {
          title: "Monthly Cash Flow Matrix",
          items: [
            { label: "Gross Monthly Disposable Income", value: `INR ${budgetIncome.toLocaleString("en-IN")}` },
            { label: "Spent on Essential Needs (Food/Rent/EMIs)", value: `INR ${actualNeeds.toLocaleString("en-IN")} (${budgetComp.needsPercent}%)` },
            { label: "Spent on Lifestyle Wants (Vacations/Gadgets/Dining)", value: `INR ${actualWants.toLocaleString("en-IN")} (${budgetComp.wantsPercent}%)` },
            { label: "Saved for Investments & Goals", value: `INR ${actualSavings.toLocaleString("en-IN")} (${budgetComp.savingsPercent}%)` }
          ]
        },
        {
          title: "Standard Budgeting Audit & Recommendations",
          items: [
            { label: "Essential Needs Balance Status", value: needsDelta >= 0 ? "Under limit (Prudent)" : "Needs tightening" },
            { label: "Lifestyle Wants Balance Status", value: wantsDelta >= 0 ? "Under limit (Prudent)" : "Wants portion is elevated" },
            { label: "Systematic Investments Balance Status", value: savingsDelta >= 0 ? "Great saving rate!" : "Investment portion should be scaled up" }
          ]
        }
      ];
      notes = [
        "The standard 50-30-20 model suggests spending up to 50% on Essential Needs, up to 30% on discretionary Wants, and saving at least 20% for future goals.",
        "Debt EMIs should ideally be counted as part of essential needs, though minimizing them frees up cash directly into systematic savings."
      ];
    } else if (activeQuestion === "fire-retire") {
      title = "Early Retirement FIRE Feasibility Assessment";
      subtitle = "Financial Independence, Retire Early (FIRE) target corpus analysis";
      sections = [
        {
          title: "Demographics & Expenditure Inputs",
          items: [
            { label: "Current Age", value: `${currentAge} Years` },
            { label: "Early Retirement Target Age", value: `${retireAge} Years` },
            { label: "Current Monthly Living Costs", value: `INR ${monthlyExpense.toLocaleString("en-IN")}/mo` },
            { label: "Assumed Compounding Inflation Rate", value: `${inflationRate}%` },
            { label: "Assumed Pre-Retirement Return Rate", value: `${preRetireReturn}%` },
            { label: "Assumed Conservative Post-Retirement Return", value: `${postRetireReturn}%` }
          ]
        },
        {
          title: "FIRE Target Outputs & Timeline",
          items: [
            { label: "Accumulation Years Remaining", value: `${fireComp.yearsToAccumulate} Years` },
            { label: "Adjusted Future Monthly Cost (At retirement)", value: `INR ${fireComp.adjustedMonthlyExpense.toLocaleString("en-IN")}/mo` },
            { label: "Required Total FIRE Corpus Fund", value: `INR ${fireComp.fireCorpusNeeded.toLocaleString("en-IN")}` },
            { label: "Required Monthly SIP Starting Today", value: fireComp.requiredSipStarting > 0 ? `INR ${fireComp.requiredSipStarting.toLocaleString("en-IN")}/mo` : "Goal achieved! 🎉" }
          ]
        }
      ];
      notes = [
        "Early retirement (FIRE) requires a substantial accumulation multiplier, typically 25x to 35x your future annual household costs.",
        "Post-retirement investments should focus on high safety indices like hybrid funds and SWPs (Systematic Withdrawal Plans) to guarantee capital longevity."
      ];
    }

    generatePDFReport({
      title,
      subtitle,
      sections,
      notes
    });
  };

  return (
    <div className="seohub-canvas bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-6 text-slate-800 dark:text-white overflow-hidden relative">
      <style dangerouslySetInnerHTML={{ __html: `
        /* Dynamic Light Mode overrides for Paisa Wealth Lab */
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
          border-color: #cbd5e1 !important;
        }

        html:not(.dark) .seohub-canvas .bg-slate-950,
        html:not(.dark) .seohub-canvas .bg-slate-950\\/60,
        html:not(.dark) .seohub-canvas .bg-slate-950\\/50,
        html:not(.dark) .seohub-canvas .bg-slate-950\\/40,
        html:not(.dark) .seohub-canvas .bg-slate-950\\/30,
        html:not(.dark) .seohub-canvas .bg-slate-950\\/20,
        html:not(.dark) .seohub-canvas .bg-slate-950\\/10 {
          background-color: #f1f5f9 !important; /* Slate 100 */
          border-color: #cbd5e1 !important;
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

      {/* Background Decoratives BLUR */}
      <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-tr from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-gradient-to-tr from-purple-500/10 to-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Heading Header Panel */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg border border-emerald-400/30">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 px-2.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-500/30 tracking-wider">
                Wealth Wisdom Lab
              </span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Paisa Masterclass</span>
            </div>
            <h2 className="text-2xl font-black font-display tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-emerald-800 dark:from-white dark:via-slate-200 dark:to-emerald-300" style={{ wordSpacing: "0.25em" }}>
              पैसे से पैसा बनाना सीखो
            </h2>
          </div>
        </div>

        {/* Language Toggler */}
        <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-850 shrink-0">
          <button
            onClick={() => setLanguage("hi")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              language === "hi"
                ? "bg-emerald-600 text-white shadow-sm font-extrabold"
                : "text-slate-505 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            हिंदी (Devanagari)
          </button>
          <button
            onClick={() => setLanguage("en")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              language === "en"
                ? "bg-emerald-600 text-white shadow-sm font-extrabold"
                : "text-slate-505 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            English
          </button>
        </div>
      </div>

      {/* Main Work grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* Left selector menu - 7 questions */}
        <div className="lg:col-span-4 lg:border-r lg:border-slate-100 dark:lg:border-slate-800 lg:pr-6 space-y-2.5">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-widest block mb-1.5 px-1.5">
            {language === "hi" ? "बुनियादी भारतीय वित्तीय प्रश्न" : "INDIAN FINANCIAL MASTERCLASS"}
          </span>
          {questionsList.map((q) => {
            const isSel = activeQuestion === q.id;
            return (
              <button
                key={q.id}
                onClick={() => setActiveQuestion(q.id)}
                className={`w-full flex items-start gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer text-left ${
                  isSel
                    ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-400 dark:border-emerald-500/80 text-emerald-900 dark:text-white"
                    : "bg-slate-50/50 dark:bg-slate-950/40 border-slate-150 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-950/70 hover:border-slate-300 dark:hover:border-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                  isSel ? "bg-emerald-600 text-white" : "bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400"
                }`}>
                  {q.icon}
                </div>
                <div>
                  <h5 className={`font-black tracking-tight text-xs sm:text-sm ${isSel ? "text-emerald-900 dark:text-emerald-400" : "text-slate-850 dark:text-white"}`}>
                    {language === "hi" ? q.hiLabel : q.enLabel}
                  </h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-405 mt-1 line-clamp-2 leading-relaxed">
                    {language === "hi" ? q.hiDesc : q.enDesc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right workspace: Answer & calculators */}
        <div className="lg:col-span-8 bg-slate-50/80 dark:bg-slate-950/30 border border-slate-150 dark:border-slate-800 p-5 rounded-3xl space-y-6">
          
          {/* 1. ₹5000 SIP 20 YEARS VIEW */}
          {activeQuestion === "returns" && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-dashed border-emerald-300/40 p-4 bg-emerald-500/5">
                <h4 className="text-sm font-extrabold uppercase text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4" />
                  {language === "hi" ? "प्रश्न: ₹5,000 प्रति माह SIP में 20 साल तक जमा करने पर क्या बनेगा?" : "Q: If I do a ₹5,000 monthly SIP for 20 years, what's my expected wealth?"}
                </h4>
                <p className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed mt-2.5 font-medium">
                  {language === "hi" ? (
                    <>
                      नियमित म्यूचुअल फंड एसआईपी (SIP) के जादुई चक्रवृद्धि सिद्धांत के कारण, <strong className="text-emerald-600 dark:text-emerald-400">₹12 लाख</strong> का आपका संचयी निवेश ऐतिहासिक बाजार दर <strong className="text-emerald-650 dark:text-teal-400">12% - 15%</strong> के औसत से बढ़कर <strong className="text-emerald-650 dark:text-teal-400">₹50 लाख से ₹1.1 करोड़</strong> तक पहुँच सकता है!
                    </>
                  ) : (
                    <>
                      Through the miracle of compounding, your cumulative net investment of <strong className="text-emerald-650 dark:text-teal-400">₹12 Lakhs</strong> can potentially balloon up to anywhere between <strong className="text-emerald-650 dark:text-teal-400">₹50 Lakhs and ₹1.1 Crores</strong> over 20 years at historical Indian index CAGR averages of <strong className="text-emerald-605">12% to 15%</strong>.
                    </>
                  )}
                </p>
              </div>

              {/* Calculator Panel */}
              <div className="space-y-4 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-4 rounded-2xl">
                <span className="text-xs font-black tracking-widest uppercase text-emerald-650 dark:text-emerald-400 block mb-1">
                  {language === "hi" ? "चक्रवृद्धि सिम्युलेटर" : "COMPOUNDING SIMULATOR"}
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="flex justify-between font-bold">
                      <span>{language === "hi" ? "मासिक एसआईपी (SIP):" : "Monthly SIP Amount:"}</span>
                      <span className="text-emerald-650 dark:text-emerald-400 font-extrabold">{formatCurrency(sip5kAmount)}</span>
                    </label>
                    <input 
                      type="range" 
                      min="1000" 
                      max="100000" 
                      step="500" 
                      value={sip5kAmount} 
                      onChange={(e) => setSip5kAmount(Number(e.target.value))}
                      className="w-full accent-emerald-600"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="flex justify-between font-bold">
                      <span>{language === "hi" ? "समय अवधि (वर्ष):" : "Tenure (Years):"}</span>
                      <span className="text-emerald-650 dark:text-emerald-400 font-extrabold">{sip5kYears} {language === "hi" ? "साल" : "Yrs"}</span>
                    </label>
                    <input 
                      type="range" 
                      min="5" 
                      max="40" 
                      step="1" 
                      value={sip5kYears} 
                      onChange={(e) => setSip5kYears(Number(e.target.value))}
                      className="w-full accent-emerald-600"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="flex justify-between font-bold">
                      <span>{language === "hi" ? "अपेक्षित वार्षिक रिटर्न (%):" : "Expected Annual Return (%):"}</span>
                      <span className="text-emerald-650 dark:text-emerald-400 font-extrabold">{sip5kRate}%</span>
                    </label>
                    <input 
                      type="range" 
                      min="8" 
                      max="24" 
                      step="0.5" 
                      value={sip5kRate} 
                      onChange={(e) => setSip5kRate(Number(e.target.value))}
                      className="w-full accent-emerald-600"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="flex justify-between font-bold">
                      <span>{language === "hi" ? "वार्षिक स्टेप-अप बढ़ोतरी (%):" : "Expected Annual Step-Up (%):"}</span>
                      <span className="text-emerald-650 dark:text-emerald-400 font-extrabold">{sip5kStepUp}%</span>
                    </label>
                    <input 
                      type="range" 
                      min="0" 
                      max="25" 
                      step="1" 
                      value={sip5kStepUp} 
                      onChange={(e) => setSip5kStepUp(Number(e.target.value))}
                      className="w-full accent-emerald-600"
                    />
                  </div>
                </div>

                {/* Outputs Panel */}
                <div className="grid grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-950 p-4 border border-slate-150 dark:border-slate-850 rounded-xl text-center">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">{language === "hi" ? "कुल निवेश" : "TOTAL INVESTED"}</span>
                    <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">{formatCurrency(sip5kComp.invested)}</span>
                  </div>
                  <div className="space-y-1 border-x border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-emerald-650 dark:text-emerald-405 uppercase font-bold block">{language === "hi" ? "अनुमानित वेल्थ गेन" : "WEALTH CREATED"}</span>
                    <span className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(sip5kComp.gains)}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">{language === "hi" ? "कुल मैच्योरिटी" : "TOTAL VALUATION"}</span>
                    <span className="text-xs sm:text-sm font-black text-teal-600 dark:text-teal-400">{formatCurrency(sip5kComp.maturity)}</span>
                  </div>
                </div>

                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300 font-semibold">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    {language === "hi" ? (
                      <>
                        आपकी संपत्ति निवेशित राशि की <span className="font-extrabold text-base text-emerald-650 dark:text-emerald-400">{sip5kComp.multiplier}x</span> गुनी हो जाएगी! इसे "पावर ऑफ कंपाउंडिंग" कहते हैं।
                      </>
                    ) : (
                      <>
                        Your wealth grows to <span className="font-extrabold text-base text-emerald-650 dark:text-emerald-400">{sip5kComp.multiplier}x</span> of your total saved principal. This is compounding work at play.
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 2. SIP VS FD COMP */}
          {activeQuestion === "sip-vs-fd" && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-dashed border-emerald-300/40 p-4 bg-emerald-500/5">
                <h4 className="text-sm font-extrabold uppercase text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4" />
                  {language === "hi" ? "प्रश्न: SIP vs FD: दोनों में से क्या बेहतर है?" : "Q: SIP vs Fixed Deposit: Which is truly superior?"}
                </h4>
                <p className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed mt-2.5 font-medium">
                  {language === "hi" ? (
                    <>
                      दोनों के उद्देश्य भिन्न हैं: <strong className="text-bold">FD सुरक्षित है</strong> और अल्पकालिक लक्ष्यों के लिए उत्तम है (गारंटीकृत रिटर्न 6-7%), लेकिन महंगाई को मात देने में असमर्थ है। <strong className="text-emerald-650 dark:text-emerald-400">म्यूचुअल फंड एसआईपी (SIP)</strong> दीर्घकालिक (3-5+ वर्ष) निवेश के लिए सर्वोत्कृष्ट है जो 12-15% दे सकता है, हालाँकि इसमें शेयर बाजार का उतार-चढ़ाव शामिल है।
                    </>
                  ) : (
                    <>
                      They serve distinct targets. <strong className="text-semibold">Fixed Deposits (FD)</strong> are entirely secure with guaranteed returns (6-7.5%) but lose purchasing power to actual inflation. <strong className="text-emerald-650 dark:text-emerald-400">SIPs</strong> leverage diversified Indian equities yielding 12-15% over long frames, though they carries mutual market risks.
                    </>
                  )}
                </p>
              </div>

              {/* Calculator Compare Panel */}
              <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-4 rounded-2xl space-y-4">
                <span className="text-xs font-black tracking-widest uppercase text-emerald-650 dark:text-emerald-400 block mb-1">
                  {language === "hi" ? "आमने-सामने तुलना सिम्युलेटर" : "SIDE BY SIDE BATTLE SIMULATOR"}
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="flex justify-between font-bold">
                      <span>{language === "hi" ? "मासिक किस्त (वैकल्पिक):" : "Monthly Installment Amt:"}</span>
                      <span className="text-emerald-650 dark:text-emerald-400 font-extrabold">{formatCurrency(compareAmount)}</span>
                    </label>
                    <input 
                      type="range" 
                      min="2000" 
                      max="100000" 
                      step="1000" 
                      value={compareAmount} 
                      onChange={(e) => setCompareAmount(Number(e.target.value))}
                      className="w-full accent-emerald-600"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="flex justify-between font-bold">
                      <span>{language === "hi" ? "निवेश अवधि (वर्ष):" : "Duration of Investment:"}</span>
                      <span className="text-emerald-650 dark:text-emerald-400 font-extrabold">{compareYears} {language === "hi" ? "साल" : "Years"}</span>
                    </label>
                    <input 
                      type="range" 
                      min="3" 
                      max="25" 
                      step="1" 
                      value={compareYears} 
                      onChange={(e) => setCompareYears(Number(e.target.value))}
                      className="w-full accent-emerald-600"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="flex justify-between font-bold">
                      <span>{language === "hi" ? "मासिक SIP अपेक्षित दर %:" : "Expected SIP Return Rate %:"}</span>
                      <span className="text-emerald-650 dark:text-emerald-400 font-bold">{compareSipRate}%</span>
                    </label>
                    <input 
                      type="range" 
                      min="8" 
                      max="22" 
                      step="0.5" 
                      value={compareSipRate} 
                      onChange={(e) => setCompareSipRate(Number(e.target.value))}
                      className="w-full accent-emerald-600"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="flex justify-between font-bold">
                      <span>{language === "hi" ? "सुरक्षित FD ब्याज दर %:" : "Fixed Deposit Interest Rate %:"}</span>
                      <span className="text-amber-500 font-bold">{compareFdRate}%</span>
                    </label>
                    <input 
                      type="range" 
                      min="5" 
                      max="9" 
                      step="0.1" 
                      value={compareFdRate} 
                      onChange={(e) => setCompareFdRate(Number(e.target.value))}
                      className="w-full accent-emerald-600"
                    />
                  </div>
                </div>

                {/* Outputs dual comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* SIP side */}
                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 text-xs space-y-2">
                    <span className="font-extrabold text-emerald-700 dark:text-emerald-450 uppercase tracking-wider block text-center">
                      📈 EQUITIES MUTUAL FUND (SIP)
                    </span>
                    <hr className="border-emerald-500/10" />
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">{language === "hi" ? "कुल निवेश" : "Amount Paid:"}</span>
                      <span className="font-bold">{formatCurrency(sipVsFdComp.totalInvested)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">{language === "hi" ? "कमाया गया ब्याज" : "Growth Yield:"}</span>
                      <span className="font-bold text-emerald-650 dark:text-emerald-400">{formatCurrency(sipVsFdComp.sipGains)}</span>
                    </div>
                    <div className="flex justify-between border-t border-dashed border-emerald-500/20 pt-1">
                      <span className="font-extrabold">{language === "hi" ? "मैच्योरिटी कुल मूल्य:" : "Maturity Fund:"}</span>
                      <span className="font-black text-sm text-emerald-600 dark:text-emerald-400">{formatCurrency(sipVsFdComp.sipMaturity)}</span>
                    </div>
                  </div>

                  {/* FD side */}
                  <div className="bg-orange-500/5 border border-orange-500/25 rounded-2xl p-4 text-xs space-y-2">
                    <span className="font-extrabold text-orange-700 dark:text-orange-450 uppercase tracking-wider block text-center">
                      🏦 BANK DEPOSIT / RD (FD)
                    </span>
                    <hr className="border-orange-500/10" />
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">{language === "hi" ? "कुल निवेश" : "Amount Paid:"}</span>
                      <span className="font-bold">{formatCurrency(sipVsFdComp.totalInvested)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">{language === "hi" ? "कमाया गया ब्याज" : "Interest Yield:"}</span>
                      <span className="font-bold text-orange-650 dark:text-orange-400">{formatCurrency(sipVsFdComp.fdGains)}</span>
                    </div>
                    <div className="flex justify-between border-t border-dashed border-orange-500/20 pt-1">
                      <span className="font-extrabold">{language === "hi" ? "मैच्योरिटी कुल मूल्य:" : "Maturity Fund:"}</span>
                      <span className="font-black text-sm text-orange-650 dark:text-orange-400">{formatCurrency(sipVsFdComp.fdMaturity)}</span>
                    </div>
                  </div>

                </div>

                {/* Verdict Panel */}
                <div className="p-3.5 bg-purple-500/10 border border-purple-500/20 rounded-xl text-xs flex justify-between gap-3 text-purple-800 dark:text-purple-300 leading-relaxed">
                  <div className="flex gap-2 font-bold">
                    <Info className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                    <span>
                      {language === "hi" ? (
                        <>
                          एसआईपी ने फिक्स्ड डिपॉजिट से <span className="text-sm font-extrabold text-purple-700 dark:text-purple-400">{formatCurrency(sipVsFdComp.wealthGap)}</span> अधिक धन अर्जित किया! अधिक लाभ पाने के लिए दीर्घकालिक SIP अनुशासन बनाए रखें।
                        </>
                      ) : (
                        <>
                          SIP outshined Fixed Deposit by creating <span className="text-sm font-extrabold text-purple-750 dark:text-purple-400">{formatCurrency(sipVsFdComp.wealthGap)}</span> more wealth! Long maturities amplify this compounding delta.
                        </>
                      )}
                    </span>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* 3. HOW MUCH SIP FOR 1 CRORE */}
          {activeQuestion === "crore-sip" && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-dashed border-emerald-300/40 p-4 bg-emerald-500/5">
                <h4 className="text-sm font-extrabold uppercase text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4" />
                  {language === "hi" ? "प्रश्न: ₹1 करोड़ का संचित लक्ष्य हासिल करने के लिए कितनी मासिक SIP की आवश्यकता होगी?" : "Q: How much monthly SIP is needed to accumulate ₹1 Crore?"}
                </h4>
                <p className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed mt-2.5 font-medium">
                  {language === "hi" ? (
                    <>
                      यह सीधे आपकी <strong className="text-bold">निवेश समय-सीमा</strong> पर निर्भर करता है। यदि आप 15 साल के लिए 12% की दर से निवेश करते हैं, तो आपको लगभग <strong className="text-emerald-650 dark:text-teal-400">₹20,000 प्रति माह</strong> की आवश्यकता होगी। परंतु यदि आप हर साल SIP राशि में 10% की बढ़ोतरी (Step-up) करते हैं, तो मात्र <strong className="text-emerald-650 dark:text-teal-450">₹11,000 रुपये</strong> से शुरुआत करके भी लक्ष्य प्राप्त कर सकते हैं!
                    </>
                  ) : (
                    <>
                      This depends directly on your <strong className="text-semibold">time investment frame</strong>. To hit ₹1 Crore in 15 years averaging a 12% return, you require ~<strong className="text-emerald-650 dark:text-teal-400">₹20,000/month</strong> normally. However, using a 10% annual Step-Up, you can initiate with just ~<strong className="text-emerald-650 dark:text-teal-400">₹11,000/month</strong>!
                    </>
                  )}
                </p>
              </div>

              {/* Target SIP required calculator */}
              <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-4 rounded-2xl space-y-4">
                <span className="text-xs font-black tracking-widest uppercase text-emerald-650 dark:text-emerald-400 block mb-1">
                  {language === "hi" ? "करोड़पति एसआईपी योजनाकार" : "CORPUS REVERSE CALCULATOR"}
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="flex justify-between font-bold">
                      <span>{language === "hi" ? "लक्ष्य कोष रकम (Target Corpus):" : "Target Corpus Needed:"}</span>
                      <span className="text-emerald-650 dark:text-emerald-400 font-extrabold">{formatCurrencyCompact(targetCorpus)}</span>
                    </label>
                    <select 
                      value={targetCorpus} 
                      onChange={(e) => setTargetCorpus(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 text-xs font-bold"
                    >
                      <option value="2500000">₹25 Lakhs</option>
                      <option value="5000000">₹50 Lakhs</option>
                      <option value="10000000">₹1 Crore (10 Million)</option>
                      <option value="20000000">₹2 Crores</option>
                      <option value="50000000">₹5 Crores</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="flex justify-between font-bold">
                      <span>{language === "hi" ? "प्राप्ति के वर्ष (Horizon):" : "Investment Frame (Years):"}</span>
                      <span className="text-emerald-650 dark:text-emerald-400 font-extrabold">{targetYears} {language === "hi" ? "साल" : "Years"}</span>
                    </label>
                    <input 
                      type="range" 
                      min="5" 
                      max="30" 
                      step="1" 
                      value={targetYears} 
                      onChange={(e) => setTargetYears(Number(e.target.value))}
                      className="w-full accent-emerald-600"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="flex justify-between font-bold">
                      <span>{language === "hi" ? "अपेक्षित रिटर्न दर (%):" : "Expected CAGR Return %:"}</span>
                      <span className="text-emerald-650 dark:text-emerald-400 font-extrabold">{targetRate}%</span>
                    </label>
                    <input 
                      type="range" 
                      min="8" 
                      max="20" 
                      step="0.5" 
                      value={targetRate} 
                      onChange={(e) => setTargetRate(Number(e.target.value))}
                      className="w-full accent-emerald-600"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="flex justify-between font-bold">
                      <span>{language === "hi" ? "वार्षिक वेतन वृद्धि स्टेप-अप %:" : "Annual Step-Up growth %:"}</span>
                      <span className="text-emerald-650 dark:text-emerald-400 font-extrabold">{targetStepUp}%</span>
                    </label>
                    <input 
                      type="range" 
                      min="0" 
                      max="25" 
                      step="1" 
                      value={targetStepUp} 
                      onChange={(e) => setTargetStepUp(Number(e.target.value))}
                      className="w-full accent-emerald-600"
                    />
                  </div>
                </div>

                {/* Split required values side-by-side */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-150 dark:border-slate-850 text-center text-xs space-y-1.5">
                    <span className="text-slate-500 uppercase font-black">{language === "hi" ? "सामान्य स्थिर (Flat) SIP" : "NORMAL FLAT SIP REQUIRED"}</span>
                    <h3 className="text-xl font-black text-rose-600 dark:text-rose-405">{formatCurrency(sipFor1CrComp.sipNeededNormal)} / {language === "hi" ? "माह" : "mo"}</h3>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      {language === "hi" ? "जहाँ SIP राशि हर साल हमेशा स्थिर रहेगी" : "Sip amount remains constant across all years"}
                    </p>
                  </div>
                  <div className="p-4 bg-emerald-500/5 dark:bg-emerald-950/20 rounded-2xl border border-emerald-500/25 text-center text-xs space-y-1.5">
                    <span className="text-emerald-700 dark:text-emerald-405 uppercase font-black flex items-center justify-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      {language === "hi" ? "स्मार्ट स्टेप-अप (Step-Up) SIP" : "SMART STEP-UP SIP"}
                    </span>
                    <h3 className="text-xl font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(sipFor1CrComp.sipNeededWithStepUp)} / {language === "hi" ? "माह" : "mo"}</h3>
                    <p className="text-[10px] text-emerald-600/80 dark:text-emerald-350/80 leading-relaxed">
                      {language === "hi" ? `शुरुआती राशि छोटी, जिसे आप हर साल ${targetStepUp}% बढ़ाएंगे` : `Starts small, adjusts up by ${targetStepUp}% every year`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. PPF VS NPS */}
          {activeQuestion === "ppf-vs-nps" && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-dashed border-emerald-300/40 p-4 bg-emerald-500/5">
                <h4 className="text-sm font-extrabold uppercase text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4" />
                  {language === "hi" ? "प्रश्न: PPF vs NPS: दोनों टैक्स बचत योजनाओं में से कौन सर्वोपरि है?" : "Q: PPF vs NPS: Which retirement tax bucket is optimal?"}
                </h4>
                <p className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed mt-2.5 font-medium">
                  {language === "hi" ? (
                    <>
                      <strong className="text-bold">PPF (पब्लिक प्रोविडेंट फंड)</strong> 100% रिस्क-फ्री है, जिस पर अभी 7.1% टैक्स-मुफ्त (EEE) वार्षिक रिटर्न मिलता है। वहीं <strong className="text-emerald-650 dark:text-emerald-400">NPS (राष्ट्रीय पेंशन प्रणाली)</strong> मार्केट आधारित इक्विटी फंड्स का मिश्रण है जो 10% से 12% तक औसत रिटर्न दे सकता है। इसमें धारा 80CCD(1B) के तहत ₹50,000 की विशेष अतिरिक्त टैक्स छूट भी मिलती है।
                    </>
                  ) : (
                    <>
                      <strong className="text-semibold">PPF (7.1% guaranteed)</strong> is 100% sovereign-backed, offering tax-free maturity (EEE), perfect for risk-averse savers. <strong className="text-emerald-60s">NPS (9-12% expected)</strong> blends index equity exposure with retirement locks, unlocking an exclusive extra tax rebate up to <strong className="text-emerald-650 dark:text-emerald-400">₹50,000</strong> annually under Section 80CCD(1B).
                    </>
                  )}
                </p>
              </div>

              {/* PPF & NPS comparison widgets */}
              <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-4 rounded-2xl space-y-4">
                <span className="text-xs font-black tracking-widest uppercase text-emerald-650 dark:text-emerald-400 block mb-1">
                  {language === "hi" ? "दीर्घकालिक पेंशन बचत तुलना" : "RETIREMENT ACCUMULATION COMPARATOR"}
                </span>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="space-y-1.5 col-span-1 md:col-span-1">
                    <label className="font-bold flex justify-between">
                      <span>{language === "hi" ? "वार्षिक निवेश:" : "Yearly Deposit Amount:"}</span>
                    </label>
                    <input 
                      type="number" 
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-2.5 py-1.5 font-bold"
                      value={ppfNpsAmount}
                      step={5000}
                      onChange={(e) => setPpfNpsAmount(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-1.5 col-span-1">
                    <label className="flex justify-between font-bold">
                      <span>{language === "hi" ? "अवधि (वर्ष):" : "Years block:"}</span>
                      <span className="text-emerald-650 font-extrabold">{ppfNpsYears} {language === "hi" ? "साल" : "Yrs"}</span>
                    </label>
                    <input 
                      type="range" 
                      min="5" 
                      max="35" 
                      step="1" 
                      value={ppfNpsYears} 
                      onChange={(e) => setPpfNpsYears(Number(e.target.value))}
                      className="w-full accent-emerald-600"
                    />
                  </div>
                  <div className="space-y-1.5 col-span-1">
                    <label className="flex justify-between font-bold">
                      <span>{language === "hi" ? "NPS अनुमानित दर %:" : "Expected NPS Rate %:"}</span>
                      <span className="text-emerald-655 font-extrabold">{npsEquityReturn}%</span>
                    </label>
                    <input 
                      type="range" 
                      min="7" 
                      max="15" 
                      step="0.5" 
                      value={npsEquityReturn} 
                      onChange={(e) => setNpsEquityReturn(Number(e.target.value))}
                      className="w-full accent-emerald-600"
                    />
                  </div>
                </div>

                {/* Comparison Details Side by Side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* PPF Result block */}
                  <div className="bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 p-4 rounded-2xl text-xs space-y-2">
                    <span className="text-orange-650 dark:text-orange-400 font-extrabold uppercase block text-center tracking-wider">
                      🛡️ PPF (GUARANTEED PPF)
                    </span>
                    <hr className="border-slate-200 dark:border-slate-800" />
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-semibold">{language === "hi" ? "स्थिर शासकीय ब्याज:" : "Guaranteed sovereign rate:"}</span>
                      <span className="font-extrabold text-orange-600">7.1% EEE</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-semibold">{language === "hi" ? "कुल जमा पूंजी:" : "Total Principal Deposited:"}</span>
                      <span className="font-bold">{formatCurrency(ppfVsNpsComp.totalPaid)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-semibold">{language === "hi" ? "कर-मुक्त ब्याज लाभ:" : "Tax-Free Compound Interest:"}</span>
                      <span className="font-bold text-orange-600">{formatCurrency(ppfVsNpsComp.ppfGains)}</span>
                    </div>
                    <div className="flex justify-between border-t border-dashed border-slate-200 dark:border-slate-800 pt-2 font-bold text-slate-800 dark:text-white">
                      <span>{language === "hi" ? "कुल मैच्योरिटी निधि:" : "Net Maturity Fund:"}</span>
                      <span className="text-emerald-600 text-sm font-black">{formatCurrency(ppfVsNpsComp.ppfMaturity)}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 border-t border-dashed border-slate-200 dark:border-slate-800 pt-1 leading-normal italic text-center">
                      * {language === "hi" ? "कोई मैच्योरिटी टैक्स नहीं देना होगा।" : "Zero maturity withdrawals tax liabilities."}
                    </div>
                  </div>

                  {/* NPS Result block */}
                  <div className="bg-emerald-500/5 dark:bg-emerald-950/10 border border-emerald-500/20 p-4 rounded-2xl text-xs space-y-2">
                    <span className="text-emerald-650 dark:text-emerald-400 font-extrabold uppercase block text-center tracking-wider">
                      📈 NPS (MARKET LINKED NPS)
                    </span>
                    <hr className="border-emerald-500/10" />
                    <div className="flex justify-between">
                      <span className="text-slate-450 font-semibold">{language === "hi" ? "अनुमानित दर (मार्केट):" : "Projected market CAGR:"}</span>
                      <span className="font-extrabold text-emerald-600">{npsEquityReturn}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-450 font-semibold">{language === "hi" ? "कुल जमा पूंजी:" : "Total Principal Deposited:"}</span>
                      <span className="font-bold">{formatCurrency(ppfVsNpsComp.totalPaid)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-800 dark:text-white">
                      <span>{language === "hi" ? "कुल परिपक्वता राशि:" : "Expected Maturity Fund:"}</span>
                      <span className="text-emerald-600 text-sm font-black">{formatCurrency(ppfVsNpsComp.npsMaturity)}</span>
                    </div>
                    <hr className="border-emerald-505/10" />
                    <div className="space-y-1 text-[10px] text-slate-500 leading-normal">
                      <div className="flex justify-between">
                        <span>{language === "hi" ? "60% एकमुश्त टैक्स फ्री निकासी:" : "60% Tax-Free Lumpsum limit:"}</span>
                        <span className="font-bold">{formatCurrency(ppfVsNpsComp.npsTaxFreeLumpsum)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{language === "hi" ? "40% अनिवार्य एन्युटी (Annuity):" : "40% Mandatory Annuity reinvestment:"}</span>
                        <span className="font-bold">{formatCurrency(ppfVsNpsComp.npsAnnuityRequired)}</span>
                      </div>
                      <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                        <span>{language === "hi" ? "अनुमानित मासिक पेंशन (6%):" : "Est. Monthly Pension (at 6%):"}</span>
                        <span>{formatCurrency(ppfVsNpsComp.estimatedYearlyAnnuityIncome / 12)} / {language === "hi" ? "माह" : "mo"}</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* 5. BEST TAX SAVING INVESTMENTS */}
          {activeQuestion === "tax-opt" && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-dashed border-emerald-300/40 p-4 bg-emerald-500/5">
                <h4 className="text-sm font-extrabold uppercase text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4" />
                  {language === "hi" ? "प्रश्न: भारत में सर्वश्रेष्ठ टैक्स बचाने वाले निवेश मार्ग कौन से हैं?" : "Q: What are the best tax-saving options under the Income Tax Act?"}
                </h4>
                <p className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed mt-2.5 font-medium">
                  {language === "hi" ? (
                    <>
                      धारा 80C के तहत सर्वश्रेष्ठ बाजार-लिंक्ड विकल्प <strong className="text-bold">ELSS (इक्विटी लिंक्ड सेविंग स्कीम्स)</strong> है, जिसमें न्यूनतम 3 साल की लॉक-इन अवधि और बेहतरीन रिटर्न्स (14-16%) मिलते हैं। इसके अलावा रिस्क-मुक्त बचत चाहने वाले <strong className="text-bold">PPF (7.1%)</strong> ले सकते हैं। धारा 80CCD(1B) के माध्यम से NPS में अतिरिक्त ₹50,000 की बचत एवं 80D के तहत ₹25,000 तक का हेल्थ इंश्योरेंस भी उपलब्ध है।
                    </>
                  ) : (
                    <>
                      Under Section 80C, <strong className="text-semibold">ELSS Mutual Funds</strong> offer the shortest lock-in (only 3 years) alongside high compounding yields (14-16% historic). Combine this with risk-free EEE assets like <strong className="text-semibold">PPF</strong>. Additionally, secure exclusive Section 80CCD(1B) benefits with <strong className="text-semibold">NPS</strong> (up to ₹50,000) and medical covers up to ₹25,000 under Section 80D.
                    </>
                  )}
                </p>
              </div>

              {/* Tax optimizer allocation tool */}
              <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-4 rounded-2xl space-y-4">
                <span className="text-xs font-black tracking-widest uppercase text-emerald-650 dark:text-emerald-400 block mb-1">
                  {language === "hi" ? "वार्षिक आयकर अनुकूलक" : "80C & DEDUCTIONS TAX OPTIMIZER"}
                </span>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold">{language === "hi" ? "आपका टैक्स ब्रैकेट slab %:" : "Income Tax Slab Rate:"}</label>
                    <select 
                      value={taxSlab} 
                      onChange={(e) => setTaxSlab(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-2.5 py-1.5 font-bold"
                    >
                      <option value="5">5% (Slight earners)</option>
                      <option value="10">10% (Medium slab)</option>
                      <option value="20">20% (Mid Bracket)</option>
                      <option value="30">30% (High Earner slab)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold">{language === "hi" ? "ELSS (म्यूचुअल फंड ८०C):" : "ELSS Allocations:"}</label>
                    <input 
                      type="number" 
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-2.5 py-1.5 font-bold text-xs"
                      value={elssAmt}
                      step={1000}
                      onChange={(e) => setElssAmt(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold">{language === "hi" ? "PPF जमा (८०C):" : "PPF Deposits:"}</label>
                    <input 
                      type="number" 
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-2.5 py-1.5 font-bold text-xs"
                      value={ppfAmt}
                      step={1000}
                      onChange={(e) => setPpfAmt(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold">{language === "hi" ? "टैक्स FD / NSC (८०C):" : "Tax Saving FD/NSC:"}</label>
                    <input 
                      type="number" 
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-2.5 py-1.5 font-bold text-xs"
                      value={nscAmt}
                      step={1000}
                      onChange={(e) => setNscAmt(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold">{language === "hi" ? "NPS स्वैच्छिक (80CCD):" : "NPS Sec 80CCD(1B):"}</label>
                    <input 
                      type="number" 
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-2.5 py-1.5 font-bold text-xs"
                      value={npsAmt}
                      step={1000}
                      onChange={(e) => setNpsAmt(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold">{language === "hi" ? "स्वास्थ्य प्रीमियम (80D):" : "Health Premiums Sec 80D:"}</label>
                    <input 
                      type="number" 
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-2.5 py-1.5 font-bold text-xs"
                      value={healthAmt}
                      step={500}
                      onChange={(e) => setHealthAmt(Number(e.target.value))}
                    />
                  </div>
                </div>

                {/* Compile Deductions results */}
                <div className="bg-slate-50 dark:bg-slate-950/80 p-4 border border-slate-150 dark:border-slate-850 rounded-2xl text-xs space-y-3">
                  <span className="font-extrabold uppercase text-slate-500 block tracking-wider text-center">{language === "hi" ? "आपके कर-कटौती सारांश" : "TAX DEDUCTION ELIGIBILITY WORKS"}</span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-white dark:bg-slate-900 p-2.5 border rounded-xl relative">
                      <span className="text-[9px] font-extrabold text-orange-500 block uppercase">SECTION 80C</span>
                      <div className="flex justify-between items-center mt-1">
                        <span className="font-bold">{formatCurrency(taxOptimizerComp.active80CAllowed)}</span>
                        <span className="text-[10px] text-slate-400">({language === "hi" ? "अधिकतम ₹1.5L" : "Max ₹1.5L Limit"})</span>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-2.5 border rounded-xl relative">
                      <span className="text-[9px] font-extrabold text-emerald-600 block uppercase">SECTION 80CCD(1B)</span>
                      <div className="flex justify-between items-center mt-1">
                        <span className="font-bold">{formatCurrency(taxOptimizerComp.active80CCDAllowed)}</span>
                        <span className="text-[10px] text-slate-400">({language === "hi" ? "अधिकतम ₹50K" : "Max ₹50K NPS"})</span>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-2.5 border rounded-xl relative">
                      <span className="text-[9px] font-extrabold text-blue-500 block uppercase">SECTION 80D</span>
                      <div className="flex justify-between items-center mt-1">
                        <span className="font-bold">{formatCurrency(taxOptimizerComp.active80DAllowed)}</span>
                        <span className="text-[10px] text-slate-400">({language === "hi" ? "अधिकतम ₹25K" : "Max ₹25K Health"})</span>
                      </div>
                    </div>
                  </div>

                  <hr className="border-slate-200 dark:border-slate-800" />

                  <div className="flex flex-col md:flex-row justify-between items-center gap-3 bg-emerald-500/10 p-3.5 border border-emerald-500/25 rounded-xl">
                    <div className="text-left">
                      <span className="text-slate-500 text-[10px] uppercase font-bold">{language === "hi" ? "कुल स्वीकृत टैक्स कटौती:" : "Total Deductions Allowed:"}</span>
                      <h4 className="text-base font-black text-slate-900 dark:text-white leading-none mt-1">{formatCurrency(taxOptimizerComp.totalDeductions)}</h4>
                    </div>
                    <div className="text-right md:text-right">
                      <span className="text-emerald-700 dark:text-emerald-450 text-[10px] uppercase font-bold flex items-center justify-end gap-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        {language === "hi" ? "जेब में बची कुल शुद्ध टैक्स बचत!" : "NET INCOME TAX SAVED!"}
                      </span>
                      <h3 className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400 leading-none mt-1">{formatCurrency(taxOptimizerComp.realTaxSaved)}</h3>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* 6. 50-30-20 BUDGET RULE */}
          {activeQuestion === "budget" && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-dashed border-emerald-300/40 p-4 bg-emerald-500/5">
                <h4 className="text-sm font-extrabold uppercase text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4" />
                  {language === "hi" ? "प्रश्न: 50-30-20 बजट नियम क्या है और यह मेरे वेतन को कैसे व्यवस्थित करता है?" : "Q: What is the 50-30-20 budget formula and why is it essential?"}
                </h4>
                <p className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed mt-2.5 font-medium">
                  {language === "hi" ? (
                    <>
                      यह वित्तीय स्वास्थ्य की रीढ़ की हड्डी है! इसके अनुसार आपकी मासिक शुद्ध आय इस प्रकार विभाजित होनी चाहिए: <strong className="text-bold">50% बुनियादी आवश्यकताएं (Needs)</strong> जैसे घर का किराया, बिजली बिल, राशन और सक्रिय लोन ईएमआई; <strong className="text-bold">30% व्यक्तिगत इच्छाएं (Wants)</strong> जैसे घूमना-फिरना, सिनेमा टिकट, शॉपिंग, रेस्तरां; और <strong className="text-emerald-650 dark:text-emerald-400">20% शुद्ध बचत और सुरक्षित निवेश (Savings)</strong> जैसे आपातकालीन फंड, म्यूचुअल फंड एसआईपी, और शेयर निवेश।
                    </>
                  ) : (
                    <>
                      It's the ultimate cornerstone of personal budgeting alignment. Break down your monthly post-tax salary into three discrete buckets: <strong className="text-semibold">50% for vital Needs</strong> (essential rentals, EMI, utilities, health groceries), <strong className="text-semibold">30% for desired Wants</strong> (recreational movie tickets, travel hops, restaurant dinners), and <strong className="text-emerald-605 font-bold">20% dedicated to robust Savings</strong> (emergency safe vaults, index mutual fund SIPs, high yield retirement assets).
                    </>
                  )}
                </p>
              </div>

              {/* Personal Budget tracker */}
              <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-4 rounded-2xl space-y-4">
                <span className="text-xs font-black tracking-widest uppercase text-emerald-650 dark:text-emerald-400 block mb-1">
                  {language === "hi" ? "व्यक्तिगत बजट विज़ुअलाइज़र" : "BUDGET HEALTH CALIBRATOR"}
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5 col-span-1 md:col-span-2">
                    <label className="font-bold flex justify-between">
                      <span>{language === "hi" ? "आपकी मासिक शुद्ध (Take-home) आय:" : "Monthly Net Take-Home Salary:"}</span>
                      <span className="text-emerald-650 font-extrabold">{formatCurrency(budgetIncome)}</span>
                    </label>
                    <input 
                      type="range" 
                      min="15000" 
                      max="300000" 
                      step="5000" 
                      value={budgetIncome} 
                      onChange={(e) => {
                        const newInc = Number(e.target.value);
                        setBudgetIncome(newInc);
                        setActualNeeds(Math.round(newInc * 0.5));
                        setActualWants(Math.round(newInc * 0.3));
                        setActualSavings(Math.round(newInc * 0.2));
                      }}
                      className="w-full accent-emerald-600"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="flex justify-between font-bold">
                      <span>{language === "hi" ? "आपकी आवश्यकताएं (Needs - 50%):" : "Your actual NeedsSpend (Ideal 50%):"}</span>
                      <span className={`font-extrabold ${actualNeeds > budgetIncome*0.55 ? "text-rose-500" : "text-emerald-600"}`}>{formatCurrency(actualNeeds)} ({budgetComp.needsPercent}%)</span>
                    </label>
                    <input 
                      type="range" 
                      min="5000" 
                      max={budgetIncome} 
                      step="1000" 
                      value={actualNeeds} 
                      onChange={(e) => setActualNeeds(Number(e.target.value))}
                      className="w-full accent-emerald-600"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="flex justify-between font-bold">
                      <span>{language === "hi" ? "आपकी इच्छाएं (Wants - 30%):" : "Your actual WantsSpend (Ideal 30%):"}</span>
                      <span className={`font-extrabold ${actualWants > budgetIncome*0.35 ? "text-rose-500" : "text-emerald-600"}`}>{formatCurrency(actualWants)} ({budgetComp.wantsPercent}%)</span>
                    </label>
                    <input 
                      type="range" 
                      min="1000" 
                      max={budgetIncome} 
                      step="1000" 
                      value={actualWants} 
                      onChange={(e) => setActualWants(Number(e.target.value))}
                      className="w-full accent-emerald-600"
                    />
                  </div>
                  <div className="space-y-1.5 col-span-1 md:col-span-2">
                    <label className="flex justify-between font-bold">
                      <span>{language === "hi" ? "आपकी बचत (Savings - 20%):" : "Your actual monthly Savings (Ideal 20%):"}</span>
                      <span className={`font-extrabold ${actualSavings < budgetIncome*0.15 ? "text-rose-500" : "text-emerald-600"}`}>{formatCurrency(actualSavings)} ({budgetComp.savingsPercent}%)</span>
                    </label>
                    <input 
                      type="range" 
                      min="0" 
                      max={budgetIncome} 
                      step="1000" 
                      value={actualSavings} 
                      onChange={(e) => setActualSavings(Number(e.target.value))}
                      className="w-full accent-emerald-600"
                    />
                  </div>
                </div>

                {/* Ideal vs Actual Comparison matrix */}
                <div className="border border-slate-150 dark:border-slate-800 rounded-3xl p-4 space-y-3.5 bg-slate-50 dark:bg-slate-950/60 text-xs text-slate-800 dark:text-slate-300">
                  <span className="font-extrabold text-slate-500 block uppercase text-center tracking-wider">{language === "hi" ? "बजट स्वास्थ्य विश्लेषण चार्ट" : "BUDGET HEALTH ALIGNMENT DEED"}</span>

                  <div className="space-y-3">
                    {/* Needs Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between font-semibold">
                        <span>🏷️ {language === "hi" ? "किराया, आवश्यक ईएमआई व भोजन (Needs)" : "Needs (Rent, Bills, Food)"}</span>
                        <span>{language === "hi" ? "लक्ष्य:" : "Ideal Limit:"} {formatCurrency(budgetComp.idealNeeds)} (50%)</span>
                      </div>
                      <div className="relative h-4 bg-slate-200 dark:bg-slate-850 rounded-full overflow-hidden flex border border-slate-300 dark:border-slate-800">
                        <div style={{ width: `${Math.min(100, budgetComp.needsPercent)}%` }} className={`h-full ${budgetComp.needsPercent > 55 ? "bg-gradient-to-r from-red-500 to-orange-400" : "bg-gradient-to-r from-emerald-500 to-teal-400"}`} />
                      </div>
                    </div>

                    {/* Wants Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between font-semibold">
                        <span>✈️ {language === "hi" ? "शॉपिंग, यात्रा व मूवीज़ (Wants)" : "Wants (Dining out, Travel)"}</span>
                        <span>{language === "hi" ? "लक्ष्य:" : "Ideal Limit:"} {formatCurrency(budgetComp.idealWants)} (30%)</span>
                      </div>
                      <div className="relative h-4 bg-slate-200 dark:bg-slate-850 rounded-full overflow-hidden flex border border-slate-300 dark:border-slate-800">
                        <div style={{ width: `${Math.min(100, budgetComp.wantsPercent)}%` }} className={`h-full ${budgetComp.wantsPercent > 35 ? "bg-gradient-to-r from-red-400 to-amber-400" : "bg-gradient-to-r from-emerald-500 to-teal-400"}`} />
                      </div>
                    </div>

                    {/* Savings Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between font-semibold">
                        <span>💰 {language === "hi" ? "एसआईपी, भविष्य निधि व सोना (Savings)" : "Savings (Mutual Funds, Equity, Gold)"}</span>
                        <span>{language === "hi" ? "लक्ष्य न्यूनतम:" : "Ideal Floor:"} {formatCurrency(budgetComp.idealSavings)} (20%)</span>
                      </div>
                      <div className="relative h-4 bg-slate-200 dark:bg-slate-850 rounded-full overflow-hidden flex border border-slate-300 dark:border-slate-800">
                        <div style={{ width: `${Math.min(100, budgetComp.savingsPercent)}%` }} className={`h-full ${budgetComp.savingsPercent < 15 ? "bg-gradient-to-r from-red-500 to-orange-500" : "bg-gradient-to-r from-emerald-500 to-teal-400"}`} />
                      </div>
                    </div>
                  </div>

                  {/* Verdict comment based on budget status */}
                  <div className={`p-3 border rounded-xl flex items-start gap-2.5 leading-relaxed font-bold ${
                    budgetComp.statusType === "excellent" 
                      ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-800 dark:text-emerald-300"
                      : "bg-amber-500/10 border-amber-500/25 text-amber-800 dark:text-amber-300"
                  }`}>
                    {budgetComp.statusType === "excellent" ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>
                          {language === "hi" ? "शानदार बजट! आप 20% से ज्यादा की बचत कर रहे हैं। लंबे समय में यह आपकी वित्तीय स्वतंत्रता सुनिश्चित करेगा।" : "Excellent budgeting parameters! You're saving a robust 20%+ of your income. Accelerating towards wealth goals."}
                        </span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <span>
                          {language === "hi" ? "चेतावनी: आपके खर्च असंतुलित हैं। इच्छाएं कम करें या आवश्यकताओं को नियंत्रित करें ताकि निवेश 20% पर पहुंच सके।" : "Urgent action: Savings rate is compressed. Reduce non-vital wants spends or lock utility overheads to hit the ideal 20% Savings floor."}
                        </span>
                      </>
                    )}
                  </div>

                </div>

              </div>
            </div>
          )}

          {/* 7. HOW TO RETIRE EARLY IN INDIA */}
          {activeQuestion === "fire-retire" && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-dashed border-emerald-300/40 p-4 bg-emerald-500/5">
                <h4 className="text-sm font-extrabold uppercase text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4" />
                  {language === "hi" ? "प्रश्न: भारत में समय से पहले रिटायर होने (FIRE) के लिए कितने रुपयों की आवश्यकता होगी?" : "Q: Realistically, how do I achieve early retirement (FIRE) in India?"}
                </h4>
                <p className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed mt-2.5 font-medium">
                  {language === "hi" ? (
                    <>
                      जल्दी रिटायर होने के लिए आपको <strong className="text-bold">'FIRE' टारगेट कोष</strong> का निर्धारण करना होगा, जो आपकी वार्षिक भारतीय जीवनशैली खर्च का लगभग <strong className="text-emerald-650 dark:text-emerald-405">30 गुना</strong> होना चाहिए (3.33% सुरक्षित निकासी नियम)। उदाहरण के लिए, यदि वर्तमान मासिक खर्च ₹40,000 है, तो महंगाई दर और दीर्घायु आवश्यकताओं के कारण आपको समय से पहले रिटायर होने के लिए लगभग <strong className="text-emerald-650 dark:text-teal-400">₹2.8 करोड़</strong> का फंड जोड़ना होगा।
                    </>
                  ) : (
                    <>
                      To achieve FIRE (Financial Independence Retire Early) in India, you must amass a target fund equal to roughly <strong className="text-semibold">30x of your inflation-adjusted annual expenditures</strong>. If you spend ₹40,000 monthly today, accounting for a 6% long-term inflation rate, you will require approx ~<strong className="text-emerald-650 dark:text-teal-400">₹2.8 Crores</strong> to retire early inside 15 years securely.
                    </>
                  )}
                </p>
              </div>

              {/* FI/RE Early retirement calculator */}
              <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-4 rounded-2xl space-y-4">
                <span className="text-xs font-black tracking-widest uppercase text-emerald-650 dark:text-emerald-400 block mb-1">
                  {language === "hi" ? "सॉवरेन फायर रोडमैप प्लानर" : "SOVEREIGN FIRE RETIREMENT COMPUTER"}
                </span>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5 col-span-1">
                    <label className="flex justify-between font-bold">
                      <span>{language === "hi" ? "आपकी वर्तमान आयु:" : "Your Current Age:"}</span>
                      <span className="text-emerald-650 font-extrabold">{currentAge} Years</span>
                    </label>
                    <input 
                      type="range" 
                      min="18" 
                      max="55" 
                      step="1" 
                      value={currentAge} 
                      onChange={(e) => {
                        const newAge = Number(e.target.value);
                        setCurrentAge(newAge);
                        if (newAge >= retireAge) {
                          setRetireAge(newAge + 5);
                        }
                      }}
                      className="w-full accent-emerald-600"
                    />
                  </div>
                  <div className="space-y-1.5 col-span-1">
                    <label className="flex justify-between font-bold">
                      <span>{language === "hi" ? "जल्दी रिटायर होने का लक्ष्य आयु:" : "Early Retire Age Target:"}</span>
                      <span className="text-emerald-650 font-extrabold">{retireAge} Years</span>
                    </label>
                    <input 
                      type="range" 
                      min={currentAge + 1} 
                      max="65" 
                      step="1" 
                      value={retireAge} 
                      onChange={(e) => setRetireAge(Number(e.target.value))}
                      className="w-full accent-emerald-600"
                    />
                  </div>

                  <div className="space-y-1.5 col-span-2">
                    <label className="flex justify-between font-bold">
                      <span>{language === "hi" ? "वर्तमान मासिक घरेलू खर्च:" : "Current Standard Monthly Spends:"}</span>
                      <span className="text-emerald-650 font-extrabold">{formatCurrency(monthlyExpense)}</span>
                    </label>
                    <input 
                      type="range" 
                      min="10000" 
                      max="200000" 
                      step="2500" 
                      value={monthlyExpense} 
                      onChange={(e) => setMonthlyExpense(Number(e.target.value))}
                      className="w-full accent-emerald-600"
                    />
                  </div>
                </div>

                {/* Outputs detail card */}
                <div className="bg-slate-50 dark:bg-slate-950/80 p-4 border border-slate-150 dark:border-slate-850 rounded-2xl text-xs space-y-3.5">
                  <span className="text-slate-500 font-extrabold text-center block uppercase tracking-wider">{language === "hi" ? "आपका वित्तीय स्वतंत्रता (FIRE) लक्ष्य" : "YOUR ROADMAP TO FREEDOM DEED"}</span>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-center">
                    <div className="p-3 bg-white dark:bg-slate-900 border rounded-xl space-y-1">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">{language === "hi" ? "बचाने के लिए वर्ष" : "YEARS TO ACCUMULATE"}</span>
                      <h4 className="text-base font-black text-rose-500">{fireComp.yearsToAccumulate} {language === "hi" ? "साल" : "Yrs"}</h4>
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-900 border rounded-xl space-y-1">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">{language === "hi" ? "भविष्य का मासिक खर्च" : "FUTURE MONTHLY SPEND"}</span>
                      <h4 className="text-base font-black text-slate-800 dark:text-white">{formatCurrency(fireComp.adjustedMonthlyExpense)}</h4>
                    </div>
                    <div className="p-3 bg-emerald-500/5 border border-emerald-500/25 rounded-xl space-y-1">
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-450 block uppercase font-bold">{language === "hi" ? "एन्युटी लाइफ स्पैन साल" : "YEARS RETIRED"}</span>
                      <h4 className="text-base font-black text-emerald-600 dark:text-emerald-400">{fireComp.yearsRetired} {language === "hi" ? "वर्ष कवर" : "Yrs covered"}</h4>
                    </div>
                  </div>

                  <hr className="border-slate-200 dark:border-slate-800" />

                  {/* FIRE Corpus summary */}
                  <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-emerald-500/10 p-4 border border-emerald-500/25 rounded-2xl">
                    <div className="text-left">
                      <span className="text-slate-500 text-[10px] uppercase font-black tracking-wider block">{language === "hi" ? "आवश्यक FIRE कुल संपदा कोष:" : "REQUIRED NET EARLY FIRE CORPUS:"}</span>
                      <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-none mt-1.5">{formatCurrencyCompact(fireComp.fireCorpusNeeded)}</h3>
                    </div>
                    <div className="text-right md:text-right">
                      <span className="text-emerald-700 dark:text-emerald-450 text-[10px] uppercase font-black tracking-wider block flex items-center justify-end gap-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        {language === "hi" ? "मासिक निवेश बचत (SIP) आज से:" : "REQUIRED STARTING MONTHLY SIP:"}
                      </span>
                      <h3 className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400 leading-none mt-1.5">
                        {fireComp.requiredSipStarting > 0 ? `${formatCurrency(fireComp.requiredSipStarting)} / mo` : "Already retired! 🎉"}
                      </h3>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Dynamic WhatsApp Share Action for Active Question */}
          <div className="mt-6 border-t border-slate-200 dark:border-slate-800 pt-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
              <div className="h-2 w-2 rounded-full bg-[#25D366] animate-pulse shrink-0" />
              <span className="leading-snug">
                {language === "hi" 
                  ? "क्या यह जानकारी मददगार लगी? इसे अपने परिवार और मित्रों के साथ साझा करें!" 
                  : "Found this helpful? Share this calculation and guide with family & friends!"}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
              <button
                onClick={downloadPDFReport}
                className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 active:scale-95 text-white text-xs sm:text-sm font-black px-5 py-2.5 rounded-2xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-2 hover:shadow-lg border-0 shrink-0"
              >
                <FileDown className="w-4 h-4" />
                <span>{language === "hi" ? "पीडीएफ रिपोर्ट डाउनलोड करें" : "Download PDF Report"}</span>
              </button>
              <a
                href={`https://api.whatsapp.com/send?text=${shareText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#20ba5a] hover:to-[#0e6f63] active:scale-95 text-white text-xs sm:text-sm font-black px-5 py-2.5 rounded-2xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-2 hover:shadow-lg no-underline shrink-0"
              >
                <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.417 9.863-9.848.002-2.63-1.023-5.101-2.884-6.963C16.58 1.952 14.108.928 11.48.928c-5.44 0-9.866 4.416-9.87 9.848-.002 1.79.479 3.541 1.39 5.1l-.479 1.754 1.83-.48.116.069zM17.151 14.28c-.282-.142-1.67-.824-1.928-.918-.258-.095-.447-.142-.635.142-.188.283-.729.918-.893 1.107-.164.188-.328.213-.61.071-.282-.142-1.192-.44-2.271-1.402-.839-.75-1.407-1.675-1.571-1.958-.164-.283-.018-.435.123-.576.127-.127.282-.329.423-.495.141-.165.188-.283.282-.472.094-.188.047-.354-.024-.495-.07-.142-.635-1.529-.87-2.094-.229-.553-.46-.477-.635-.486-.164-.008-.353-.01-.541-.01s-.494.07-.753.354c-.259.283-.988.966-.988 2.358 0 1.392 1.012 2.735 1.153 2.924.141.189 1.992 3.041 4.825 4.258.674.29 1.201.463 1.61.593.677.215 1.293.185 1.78.113.543-.081 1.67-.682 1.905-1.34s.235-1.226.165-1.34c-.07-.114-.282-.208-.564-.35z"/>
                </svg>
                <span>{language === "hi" ? "व्हाट्सएप पर साझा करें" : "Share on WhatsApp"}</span>
              </a>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
