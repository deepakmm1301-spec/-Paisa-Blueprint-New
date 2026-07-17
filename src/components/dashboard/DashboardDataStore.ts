export interface DashboardData {
  income: {
    salary: number;
    rental: number;
    business: number;
    other: number;
  };
  expenses: {
    housing: number;
    food: number;
    transport: number;
    education: number;
    medical: number;
    insurance: number;
    entertainment: number;
    investments: number;
  };
  assets: {
    cash: number;
    bankBalance: number;
    epf: number;
    ppf: number;
    nps: number;
    mutualFunds: number;
    stocks: number;
    gold: number;
    property: number;
    vehicles: number;
    otherAssets: number;
  };
  liabilities: {
    homeLoan: number;
    carLoan: number;
    personalLoan: number;
    creditCard: number;
    educationLoan: number;
  };
  goals: {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    monthlyContribution: number;
    expectedDate: string;
    category: "emergency" | "house" | "car" | "retirement" | "education" | "marriage" | "vacation" | "business" | "other";
  }[];
  calendarEvents: {
    id: string;
    title: string;
    date: string; // YYYY-MM-DD or Day number "05"
    type: "sip" | "emi" | "insurance" | "tax" | "reminder" | "other";
    amount?: number;
  }[];
  timeline: {
    id: string;
    action: string;
    date: string;
    category: string;
  }[];
}

export const defaultDashboardData: DashboardData = {
  income: {
    salary: 120000,
    rental: 15000,
    business: 0,
    other: 5000,
  },
  expenses: {
    housing: 25000,
    food: 15000,
    transport: 8000,
    education: 12000,
    medical: 5000,
    insurance: 4000,
    entertainment: 6000,
    investments: 25000,
  },
  assets: {
    cash: 20000,
    bankBalance: 150000,
    epf: 340000,
    ppf: 120500,
    nps: 85000,
    mutualFunds: 450000,
    stocks: 210000,
    gold: 350000,
    property: 3500000,
    vehicles: 650000,
    otherAssets: 50000,
  },
  liabilities: {
    homeLoan: 1800000,
    carLoan: 250000,
    personalLoan: 0,
    creditCard: 45000,
    educationLoan: 0,
  },
  goals: [
    {
      id: "goal-1",
      name: "Emergency Fund",
      targetAmount: 600000,
      currentAmount: 170000,
      monthlyContribution: 15000,
      expectedDate: "2027-06-30",
      category: "emergency",
    },
    {
      id: "goal-2",
      name: "Retirement Gold Cover",
      targetAmount: 35000000,
      currentAmount: 1196000,
      monthlyContribution: 25000,
      expectedDate: "2045-12-31",
      category: "retirement",
    },
    {
      id: "goal-3",
      name: "New Family Electric SUV",
      targetAmount: 1200000,
      currentAmount: 350000,
      monthlyContribution: 10000,
      expectedDate: "2029-03-31",
      category: "car",
    },
  ],
  calendarEvents: [
    { id: "cal-1", title: "SIP Mutual Funds Auto-Debit", date: "05", type: "sip", amount: 25000 },
    { id: "cal-2", title: "Home Loan EMI Auto-Debit", date: "10", type: "emi", amount: 18500 },
    { id: "cal-3", title: "Car Loan EMI Auto-Debit", date: "12", type: "emi", amount: 8200 },
    { id: "cal-4", title: "Term Insurance Renewal", date: "2026-11-15", type: "insurance", amount: 15400 },
    { id: "cal-5", title: "PPF Deposit Deadline", date: "2026-03-25", type: "reminder", amount: 150000 },
    { id: "cal-6", title: "Salary Credit Expected", date: "30", type: "reminder", amount: 120000 },
    { id: "cal-7", title: "ITR Filing Deadline", date: "2026-07-31", type: "tax" },
  ],
  timeline: [
    { id: "t-1", action: "Paisa Personal Finance Dashboard initiated", date: "2026-07-01T09:00:00Z", category: "System" },
    { id: "t-2", action: "Salary & 8th Pay structures evaluated", date: "2026-07-02T10:15:00Z", category: "Calculations" },
    { id: "t-3", action: "Savings goals calibrated to ₹3.5Cr targets", date: "2026-07-02T14:40:00Z", category: "Goals" },
  ],
};

export interface HealthScoreResult {
  score: number;
  level: "Excellent" | "Good" | "Average" | "Needs Improvement";
  color: string;
  badgeBg: string;
  suggestions: { en: string; hi: string }[];
}

export function calculateHealthScore(data: DashboardData): HealthScoreResult {
  let score = 40; // baseline
  const suggestions: { en: string; hi: string }[] = [];

  const totalIncome = Object.values(data.income).reduce((a, b) => a + b, 0);
  const totalExpenses = Object.values(data.expenses).reduce((a, b) => a + b, 0);
  const totalAssets = Object.values(data.assets).reduce((a, b) => a + b, 0);
  const totalLiabilities = Object.values(data.liabilities).reduce((a, b) => a + b, 0);

  // 1. Savings Rate index (Target > 30%)
  const savings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;
  if (savingsRate >= 35) {
    score += 15;
  } else if (savingsRate >= 20) {
    score += 10;
  } else if (savingsRate >= 10) {
    score += 5;
  } else {
    suggestions.push({
      en: "Your monthly savings rate is below 10%. Work on budgeting and reducing discretionary spending.",
      hi: "आपकी मासिक बचत दर 10% से कम है। बजट बनाने और अनावश्यक खर्चों को कम करने पर काम करें।",
    });
  }

  // 2. Emergency Fund Ratio (Target >= 6 months expenses in Cash+Bank)
  const liquidCash = data.assets.cash + data.assets.bankBalance;
  const emCoverageMonths = totalExpenses > 0 ? liquidCash / totalExpenses : 0;
  if (emCoverageMonths >= 6) {
    score += 15;
  } else if (emCoverageMonths >= 3) {
    score += 8;
    suggestions.push({
      en: "Your emergency fund covers about 3-5 months of expenses. Aim to extend this to 6 months.",
      hi: "आपका आपातकालीन कोष 3-5 महीने के खर्च को कवर करता है। इसे बढ़ाकर 6 महीने करने का लक्ष्य रखें।",
    });
  } else {
    suggestions.push({
      en: `Your emergency fund covers only ${emCoverageMonths.toFixed(1)} months of expenses. Save ₹${Math.round(totalExpenses * 6 - liquidCash).toLocaleString()} more to build a 6-month buffer.`,
      hi: `आपका आपातकालीन कोष केवल ${emCoverageMonths.toFixed(1)} महीने का खर्च कवर करता है। 6 महीने का सुरक्षा बफर बनाने के लिए ₹${Math.round(totalExpenses * 6 - liquidCash).toLocaleString()} और बचाएं।`,
    });
  }

  // 3. Debt Ratio (Target: Debt repayments / Income < 30%)
  // Approximated EMIs based on liabilities: home loan at 8.5%, car at 9.5%, credit card at 5% min due
  const homeLoanEmi = data.liabilities.homeLoan * 0.0075;
  const carLoanEmi = data.liabilities.carLoan * 0.015;
  const personalLoanEmi = data.liabilities.personalLoan * 0.025;
  const educationLoanEmi = data.liabilities.educationLoan * 0.012;
  const creditCardMin = data.liabilities.creditCard * 0.05;
  const estimatedEMI = homeLoanEmi + carLoanEmi + personalLoanEmi + educationLoanEmi + creditCardMin;
  const emiRatio = totalIncome > 0 ? (estimatedEMI / totalIncome) * 100 : 0;

  if (emiRatio === 0) {
    score += 15;
  } else if (emiRatio <= 30) {
    score += 10;
  } else if (emiRatio <= 45) {
    score += 5;
    suggestions.push({
      en: "Debt obligations occupy 30%-45% of your income. Avoid any new loans or credit cards.",
      hi: "ऋण दायित्व आपकी आय का 30%-45% हिस्सा लेते हैं। किसी भी नए ऋण या क्रेडिट कार्ड से बचें।",
    });
  } else {
    suggestions.push({
      en: "High Debt Warning! Over 45% of your income goes into paying EMIs. Prioritize prepaying high-interest personal loans or credit cards.",
      hi: "उच्च ऋण चेतावनी! आपकी आय का 45% से अधिक हिस्सा ईएमआई चुकाने में जाता है। उच्च ब्याज वाले व्यक्तिगत ऋण या क्रेडिट कार्ड को चुकाने को प्राथमिकता दें।",
    });
  }

  // 4. Insurance Coverage
  const hasGoodTerm = data.assets.otherAssets > 0 || totalIncome > 0; // Term Insurance isn't directly stored, but lets assume if we configured it in calendar or assets
  const insurancePayment = data.expenses.insurance;
  if (insurancePayment >= 2000) {
    score += 15;
  } else if (insurancePayment > 0) {
    score += 8;
    suggestions.push({
      en: "Consider getting adequate standalone term life insurance (at least 15x annual income) and family floater health cover.",
      hi: "पर्याप्त स्टैंडअलोन टर्म लाइफ इंश्योरेंस (कम से कम 15 गुना वार्षिक आय) और फैमिली फ्लोटर हेल्थ कवर लेने पर विचार करें।",
    });
  } else {
    suggestions.push({
      en: "No active life or health insurance expense detected. Secure your family with a term cover and medical policy immediately.",
      hi: "कोई सक्रिय जीवन या स्वास्थ्य बीमा व्यय नहीं मिला। तुरंत टर्म कवर और मेडिकल पॉलिसी के साथ अपने परिवार को सुरक्षित करें।",
    });
  }

  // 5. Investment Diversification
  const investments = [
    data.assets.mutualFunds,
    data.assets.stocks,
    data.assets.gold,
    data.assets.epf,
    data.assets.ppf,
    data.assets.nps
  ];
  const activeInvestmentsCount = investments.filter(v => v > 0).length;
  if (activeInvestmentsCount >= 4) {
    score += 10;
  } else if (activeInvestmentsCount >= 2) {
    score += 5;
    suggestions.push({
      en: "Increase your portfolio diversification. Spread savings across low-risk debt (PPF, EPF) and equities (mutual funds, stocks).",
      hi: "अपने पोर्टफोलियो विविधीकरण को बढ़ाएं। कम जोखिम वाले ऋण (PPF, EPF) और इक्विटी (म्यूचुअल फंड, शेयर) में बचत फैलाएं।",
    });
  } else {
    suggestions.push({
      en: "Extremely low portfolio diversification! You are mostly holding plain cash/savings. Set up an automated monthly SIP in dynamic equities.",
      hi: "अत्यधिक कम पोर्टफोलियो विविधीकरण! आप ज्यादातर साधारण नकद/बचत रख रहे हैं। इक्विटी में एक स्वचालित मासिक एसआईपी स्थापित करें।",
    });
  }

  // 6. Retirement Planning
  const retirementAssets = data.assets.epf + data.assets.ppf + data.assets.nps;
  if (retirementAssets > 500000) {
    score += 10;
  } else if (retirementAssets > 100000) {
    score += 6;
  } else {
    suggestions.push({
      en: "Your retirement specific assets (EPF, PPF, NPS) are low. Maximize your monthly NPS and PPF contributions for safe long-term compounding.",
      hi: "आपके सेवानिवृत्ति विशिष्ट संपत्ति (EPF, PPF, NPS) कम हैं। सुरक्षित दीर्घकालिक चक्रवृद्धि के लिए मासिक एनपीएस और पीपीएफ योगदान को अधिकतम करें।",
    });
  }

  // 7. Tax Efficiency
  const taxDeductionsUtilized = data.assets.ppf + data.assets.nps;
  if (taxDeductionsUtilized > 150000) {
    score += 10;
  } else {
    suggestions.push({
      en: "Optimize your taxes. Utilize maximum ₹1.5L Section 80C deductions (PPF, ELSS) and an additional ₹50,000 under Section 80CCD(1B) via NPS.",
      hi: "अपने करों को अनुकूलित करें। अधिकतम ₹1.5L धारा 80C कटौती (PPF, ELSS) और NPS के माध्यम से धारा 80CCD(1B) के तहत अतिरिक्त ₹50,000 का उपयोग करें।",
    });
  }

  // 8. Goal Progress
  const goalCount = data.goals.length;
  if (goalCount > 0) {
    const totalProgress = data.goals.reduce((acc, g) => acc + (g.currentAmount / g.targetAmount), 0);
    const avgProgress = totalProgress / goalCount;
    if (avgProgress >= 0.25) {
      score += 10;
    } else {
      score += 5;
      suggestions.push({
        en: "Your financial goals are set but average completion is below 25%. Try to increase monthly goal contributions.",
        hi: "आपके वित्तीय लक्ष्य निर्धारित हैं लेकिन औसत पूरा होना 25% से कम है। मासिक लक्ष्य योगदान बढ़ाने का प्रयास करें।",
      });
    }
  } else {
    suggestions.push({
      en: "No financial goals defined in your tracker! Define short and long term goals to stay disciplined.",
      hi: "ट्रैकर में कोई वित्तीय लक्ष्य परिभाषित नहीं है! अनुशासित रहने के लिए लघु और दीर्घकालिक लक्ष्यों को परिभाषित करें।",
    });
  }

  const finalScore = Math.min(100, Math.max(0, score));
  let level: "Excellent" | "Good" | "Average" | "Needs Improvement" = "Average";
  let color = "text-orange-600";
  let badgeBg = "bg-orange-50 border-orange-200";

  if (finalScore >= 90) {
    level = "Excellent";
    color = "text-emerald-600";
    badgeBg = "bg-emerald-50 border-emerald-200 text-emerald-800";
  } else if (finalScore >= 75) {
    level = "Good";
    color = "text-sky-600";
    badgeBg = "bg-sky-50 border-sky-200 text-sky-800";
  } else if (finalScore >= 60) {
    level = "Average";
    color = "text-orange-600";
    badgeBg = "bg-orange-50 border-orange-200 text-orange-800";
  } else {
    level = "Needs Improvement";
    color = "text-rose-600";
    badgeBg = "bg-rose-50 border-rose-200 text-rose-800";
  }

  if (suggestions.length === 0) {
    suggestions.push({
      en: "Awesome! Your financial scores are pristine. Maintain compounding and monitor inflation.",
      hi: "बहुत बढ़िया! आपका वित्तीय स्कोर प्राचीन है। चक्रवृद्धि बनाए रखें और मुद्रास्फीति की निगरानी करें।",
    });
  }

  return { score: finalScore, level, color, badgeBg, suggestions };
}

export function generateDynamicInsights(data: DashboardData): { title: string; desc: string; type: "alert" | "info" | "success"; tag: string }[] {
  const insights: { title: string; desc: string; type: "alert" | "info" | "success"; tag: string }[] = [];

  const totalIncome = Object.values(data.income).reduce((a, b) => a + b, 0);
  const totalExpenses = Object.values(data.expenses).reduce((a, b) => a + b, 0);

  // NPS Tax saving insight
  if (data.assets.nps < 50000) {
    insights.push({
      tag: "Tax Saver",
      title: "Save up to ₹15,600 more under 80CCD(1B)",
      desc: "By investing ₹50,000 annually in NPS tier-1, you save direct extra taxes above 80C limits.",
      type: "info",
    });
  }

  // Emergency coverage warning
  const liquidCash = data.assets.cash + data.assets.bankBalance;
  const emCoverageMonths = totalExpenses > 0 ? liquidCash / totalExpenses : 0;
  if (emCoverageMonths < 6) {
    insights.push({
      tag: "Risk Alert",
      title: `Emergency fund covers only ${emCoverageMonths.toFixed(1)} months`,
      desc: "Prudent Indian guidelines mandate having 6 months of absolute expenses secured in high-yield savings accounts.",
      type: "alert",
    });
  } else {
    insights.push({
      tag: "Safety Met",
      title: "Strong Emergency Buffer Secured!",
      desc: `Your bank reserves support ${emCoverageMonths.toFixed(1)} months of absolute outflows. You can safely invest more in equities.`,
      type: "success",
    });
  }

  // SIP Step-up potential
  const savings = totalIncome - totalExpenses;
  if (savings > 10000) {
    insights.push({
      tag: "Wealth Booster",
      title: "You have uninvested monthly surplus!",
      desc: `We noticed an extra surplus of ₹${savings.toLocaleString()} remaining. Increase your mutual fund SIPs by ₹3,000 to fast-track your ₹1Cr goals.`,
      type: "info",
    });
  }

  // Portfolio debt-to-equity ratio
  const debtAssets = data.assets.epf + data.assets.ppf + data.assets.nps;
  const equityAssets = data.assets.mutualFunds + data.assets.stocks;
  const ratio = debtAssets > 0 ? equityAssets / debtAssets : 1;
  if (ratio > 3) {
    insights.push({
      tag: "High Risk Asset Mix",
      title: "Equity heavy portfolio structure",
      desc: "Your equity exposure is extremely aggressive compared to debt. Consider raising PPF or gold allocations to balance market shocks.",
      type: "alert",
    });
  } else if (ratio < 0.3) {
    insights.push({
      tag: "Conservative Drag",
      title: "Debt heavy retirement structures",
      desc: "Your money is compounding at flat inflation rates. Direct an extra 15% of salary into equity mutual funds to fight long-term inflation.",
      type: "info",
    });
  }

  // Debt warning
  const debtTotal = Object.values(data.liabilities).reduce((a, b) => a + b, 0);
  if (debtTotal > 3000000) {
    insights.push({
      tag: "Leverage Risk",
      title: "High mortgage leverage checked",
      desc: "Your absolute loan outstanding is substantial. Prioritize 10% annual prepayments to compress a 20-year home loan into 12 years.",
      type: "alert",
    });
  }

  // Goal probability checks
  data.goals.forEach(goal => {
    const yearsLeft = Math.max(1, (new Date(goal.expectedDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 365));
    const projectedAmount = goal.currentAmount + (goal.monthlyContribution * 12 * yearsLeft);
    if (projectedAmount < goal.targetAmount) {
      insights.push({
        tag: "Goal Shortfall",
        title: `Retirement or ${goal.name} target falls short`,
        desc: `At ₹${goal.monthlyContribution.toLocaleString()}/mo, you will accumulate ₹${Math.round(projectedAmount).toLocaleString()} out of ₹${goal.targetAmount.toLocaleString()}. Boost contributions.`,
        type: "alert",
      });
    }
  });

  return insights.slice(0, 5);
}

export function checkUnlockedAchievements(data: DashboardData): { id: string; name: string; desc: string; icon: string; date: string }[] {
  const achievements: { id: string; name: string; desc: string; icon: string; date: string }[] = [];

  const totalIncome = Object.values(data.income).reduce((a, b) => a + b, 0);
  const totalExpenses = Object.values(data.expenses).reduce((a, b) => a + b, 0);
  const totalAssets = Object.values(data.assets).reduce((a, b) => a + b, 0);
  const totalLiabilities = Object.values(data.liabilities).reduce((a, b) => a + b, 0);
  const netWorth = totalAssets - totalLiabilities;

  // 1. First SIP Added
  if (data.expenses.investments > 0) {
    achievements.push({
      id: "ach-sip",
      name: "First SIP Started",
      desc: "Initiated a compounding monthly investment channel.",
      icon: "🚀",
      date: "Unlocked",
    });
  }

  // 2. Emergency Fund Created
  const liquidCash = data.assets.cash + data.assets.bankBalance;
  if (liquidCash >= totalExpenses * 3) {
    achievements.push({
      id: "ach-em",
      name: "Emergency Shield Active",
      desc: "Secured over 3 months of emergency expenses in bank reserves.",
      icon: "🛡️",
      date: "Unlocked",
    });
  }

  // 3. Goal Completed check
  if (data.goals.length > 0) {
    const hasPartiallyCompletedGoal = data.goals.some(g => (g.currentAmount / g.targetAmount) >= 0.5);
    if (hasPartiallyCompletedGoal) {
      achievements.push({
        id: "ach-goal-50",
        name: "Halfway Milestone Crusher",
        desc: "Crossed 50% target completion on at least one financial goal.",
        icon: "🏆",
        date: "Unlocked",
      });
    }
  }

  // 4. ₹10 Lakh Net Worth
  if (netWorth >= 1000000) {
    achievements.push({
      id: "ach-millionaire",
      name: "Million-Scale Net Worth",
      desc: "Crossed ₹10 Lakhs in cumulative net worth assets over liabilities.",
      icon: "💎",
      date: "Unlocked",
    });
  }

  // 5. 12 Month Saving Streak (Always unlocked as a gamification for guest)
  if (totalIncome > totalExpenses) {
    achievements.push({
      id: "ach-streak",
      name: "Financial Discipline Champion",
      desc: "Unlocked a 12-month budget savings rate streak.",
      icon: "🔥",
      date: "Active",
    });
  }

  // 6. Tax Saver
  if (data.assets.ppf > 100000 || data.assets.nps > 50000) {
    achievements.push({
      id: "ach-tax",
      name: "Smart Tax Optimizer",
      desc: "Effectively reduced direct tax deductions via Section 80C and Section 80CCD.",
      icon: "💸",
      date: "Unlocked",
    });
  }

  // 7. Debt free check
  if (totalLiabilities === 0) {
    achievements.push({
      id: "ach-debtfree",
      name: "Absolute Debt Freedom",
      desc: "Operated 100% credit-clear with zero outstanding loans or credit liabilities.",
      icon: "🕊️",
      date: "Active",
    });
  }

  return achievements;
}
