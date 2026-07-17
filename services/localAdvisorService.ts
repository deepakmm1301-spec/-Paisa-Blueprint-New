/**
 * Decoupled rule-based expert advice simulation service (fallback mode)
 */

function calculateTaxOld(grossAnnual: number, deductions: number = 250000): number {
  const taxable = Math.max(0, grossAnnual - deductions);
  if (taxable <= 500000) return 0;
  
  let tax = 0;
  const s1 = Math.min(250000, Math.max(0, taxable - 250000));
  const s2 = Math.min(500000, Math.max(0, taxable - 500000));
  const s3 = Math.max(0, taxable - 1000000);
  
  tax += s1 * 0.05;
  tax += s2 * 0.20;
  tax += s3 * 0.30;
  
  return tax * 1.04; // 4% cess
}

function calculateTaxNew(grossAnnual: number): number {
  const taxable = Math.max(0, grossAnnual - 75000); // Standard deduction 75,000 under new regime
  if (taxable <= 700000) return 0; 
  
  let tax = 0;
  const s1 = Math.min(300000, Math.max(0, taxable - 300000));
  const s2 = Math.min(300000, Math.max(0, taxable - 600000));
  const s3 = Math.min(300000, Math.max(0, taxable - 900000));
  const s4 = Math.min(300000, Math.max(0, taxable - 1200000));
  const s5 = Math.max(0, taxable - 1500000);
  
  tax += s1 * 0.05;
  tax += s2 * 0.10;
  tax += s3 * 0.15;
  tax += s4 * 0.20;
  tax += s5 * 0.30;
  
  return tax * 1.04; // 4% cess
}

function calculateCompound(monthlyAmount: number, years: number, rate: number): { totalInvested: number, totalValue: number, wealthGained: number } {
  const n = years * 12;
  const r = (rate / 100) / 12;
  const totalValue = monthlyAmount * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
  const totalInvested = monthlyAmount * n;
  return {
    totalInvested,
    totalValue,
    wealthGained: Math.max(0, totalValue - totalInvested)
  };
}

export function generateLocalAdvisorReply(messages: any[], userProfile: any): string {
  const lastUserMsg = [...messages].reverse().find(m => m.role === "user")?.content || "";
  const query = lastUserMsg.toLowerCase();
  
  const profile = userProfile || {
    name: "Financier",
    age: 32,
    retirementAge: 60,
    salary: 80000,
    city: "tier2",
    maritalStatus: "single",
    dependentsCount: 0,
    currentSavings: 150000,
    monthlyExpenses: 30000,
    loans: { homeLoan: 0, personalLoan: 0, carLoan: 0, otherLoan: 0 },
    investments: { mutualFunds: 50000, stocks: 20000, gold: 10000, epf: 30000, ppf: 15000, nps: 0, realEstate: 0 },
    customSip: 10000,
    healthInsuranceCover: 300000,
    termInsuranceCover: 0
  };

  const name = profile.name || "friend";
  const salary = profile.salary || 0;
  const annualGross = salary * 12;
  const expenses = profile.monthlyExpenses || (salary * 0.4) || 20000;
  const currentSavings = profile.currentSavings || 0;
  
  // Compute loans
  const loans = profile.loans || {};
  const homeLoan = loans.homeLoan || 0;
  const personalLoan = loans.personalLoan || 0;
  const carLoan = loans.carLoan || 0;
  const otherLoan = loans.otherLoan || 0;
  const totalLoans = homeLoan + personalLoan + carLoan + otherLoan;

  // Compute investments
  const investments = profile.investments || {};
  const mutualFunds = investments.mutualFunds || 0;
  const stocks = investments.stocks || 0;
  const gold = investments.gold || 0;
  const epf = investments.epf || 0;
  const ppf = investments.ppf || 0;
  const nps = investments.nps || 0;
  const realEstate = investments.realEstate || 0;
  const totalInvestments = mutualFunds + stocks + gold + epf + ppf + nps + realEstate;

  // Default / Greeting
  if (query.match(/\b(hello|hi|hey|greetings|namaste|start|get started)\b/) || lastUserMsg.trim() === "") {
    return `### Namaste, **${name}**! 👋 
    
I am your **Paisa Blueprint Local Expert System** 🇮🇳. Since your cloud Gemini API Key is currently unregistered or we are functioning in air-gap local configuration mode, I've booted my high-fidelity rule-based advice advice bank to guide you instantly!

Here is a quick summary of your financial portfolio markers:
- **Income Base (Gross Monthly):** ₹${salary.toLocaleString('en-IN')}
- **Active Borrowing/Locker Debts:** ₹${totalLoans.toLocaleString('en-IN')}
- **Total Invested Capital:** ₹${totalInvestments.toLocaleString('en-IN')}
- **Monthly Expenses Cushion:** ₹${expenses.toLocaleString('en-IN')}

I am fully operational with local algorithmic financial intelligence! Ask me about:
1. 📊 **Old vs New Tax Regime** comparison for your income bracket (just type **"Tax"**).
2. 📈 **SIP Compounding Wealth Projection** (type **"SIP"**).
3. 🚨 **Emergency Reserve Buffer** assessment (type **"Emergency"**).
4. 🛡️ **Insurance Cover adequacy audit** (type **"Insurance"**).
5. 📉 **Loan paydown strategy** (type **"Loan"**).

How shall we navigate your compounding plan today? Just enter a keyword or ask a customized question!`;
  }

  // TAX / REGIME Slabs calculation
  if (query.match(/\b(tax|regime|old|new|slab|deduction|80c|80d|standard deduction)\b/)) {
    const oldTax = calculateTaxOld(annualGross);
    const newTax = calculateTaxNew(annualGross);
    const taxDiff = Math.abs(oldTax - newTax);
    const recommendation = oldTax < newTax ? "Old Tax Regime" : "New Tax Regime";
    const recommendedRegimeStr = taxDiff === 0 
      ? `Both Old and New regimes yield ₹0 tax liability for you! However, the **New Tax Regime** is typically simpler since you do not need to lock up capital in tax-saving instruments.`
      : `Based on your Gross Salary of ₹${salary.toLocaleString('en-IN')}/mo (₹${annualGross.toLocaleString('en-IN')}/year), the **${recommendation}** will save you approximately **₹${Math.round(taxDiff).toLocaleString('en-IN')}** per year in taxes.`;

    return `### 📊 Indian Income Tax Regime Assessment
    
Let's analyze your personal tax slab for your gross annual salary of **₹${annualGross.toLocaleString('en-IN')}**:

1. **Old Tax Regime Estimates:**
   - **Assumed Deductions & Exemptions:** ₹2,50,000 (Section 80C: ₹1.5L such as EPF/PPF/ELSS, NPS Section 80CCD(1B): ₹50k, Standard Deduction: ₹50k).
   - **Calculated Tax Liability:** ₹${Math.round(oldTax).toLocaleString('en-IN')} per annum.

2. **New Tax Regime Estimates:**
   - **Deductions:** ₹75,000 Section 16(ia) Standard Deduction only. No Section 80C exemptions allowed.
   - **Calculated Tax Liability:** ₹${Math.round(newTax).toLocaleString('en-IN')} per annum.

---

### **💡 Recommendation:**
**${recommendedRegimeStr}**

* **If opting for the Old Regime:** Ensure your Section 80C investments (including your PPF contribution of ₹${ppf.toLocaleString('en-IN')} and EPF contribution of ₹${epf.toLocaleString('en-IN')}) are fully deployed before March 31st to avail of the rebate!
* **If opting for the New Regime:** You enjoy zero filing complexity and higher month-on-month liquidity, which you can redirect into active SIP compounding.`;
  }

  // SIP compounding
  if (query.match(/\b(sip|compound|interest|grow|wealth|future|mutual|fund|invest|stock|gold)\b/)) {
    const defaultSip = profile.customSip || Math.round(salary * 0.20) || 12000;
    
    // Calculate for 10, 15, and 20 years at 12% and 15%
    const sip10_12 = calculateCompound(defaultSip, 10, 12);
    const sip10_15 = calculateCompound(defaultSip, 10, 15);
    const sip15_12 = calculateCompound(defaultSip, 15, 12);
    const sip15_15 = calculateCompound(defaultSip, 15, 15);
    const sip20_12 = calculateCompound(defaultSip, 20, 12);
    const sip20_15 = calculateCompound(defaultSip, 20, 15);

    return `### 📈 Mutual Fund SIP Wealth Accumulation Chart (Local Simulation)
    
Compounding is the 8th wonder of the world! Let's project how your SIP grows over time.
We will assume you start a dedicated Monthly SIP of **₹${defaultSip.toLocaleString('en-IN')}** (about ${Math.round((defaultSip/salary)*100)}% of your monthly gross income):

#### 📅 10-Year Runway
* **Total Invested Cost:** ₹${sip10_12.totalInvested.toLocaleString('en-IN')}
* **Value at 12% CAGR (Conservative Index):** ₹${Math.round(sip10_12.totalValue).toLocaleString('en-IN')} *(Wealth Gained: +₹${Math.round(sip10_12.wealthGained).toLocaleString('en-IN')})*
* **Value at 15% CAGR (Aggressive Mid/Smallcap):** ₹${Math.round(sip10_15.totalValue).toLocaleString('en-IN')} *(Wealth Gained: +₹${Math.round(sip10_15.wealthGained).toLocaleString('en-IN')})*

#### 📅 15-Year Runway
* **Total Invested Cost:** ₹${sip15_12.totalInvested.toLocaleString('en-IN')}
* **Value at 12% CAGR:** ₹${Math.round(sip15_12.totalValue).toLocaleString('en-IN')} *(Wealth Gained: +₹${Math.round(sip15_12.wealthGained).toLocaleString('en-IN')})*
* **Value at 15% CAGR:** ₹${Math.round(sip15_15.totalValue).toLocaleString('en-IN')} *(Wealth Gained: +₹${Math.round(sip15_15.wealthGained).toLocaleString('en-IN')})*

#### 📅 20-Year Runway *(Compounding hockey stick curve)*
* **Total Invested Cost:** ₹${sip20_12.totalInvested.toLocaleString('en-IN')}
* **Value at 12% CAGR:** **₹${Math.round(sip20_12.totalValue).toLocaleString('en-IN')}** *(Wealth Gained: +₹${Math.round(sip20_12.wealthGained).toLocaleString('en-IN')})*
* **Value at 15% CAGR:** **₹${Math.round(sip20_15.totalValue).toLocaleString('en-IN')}** *(Wealth Gained: +₹${Math.round(sip20_15.wealthGained).toLocaleString('en-IN')})*

---

### **💡 Action Plan for ${name}:**
1. **Automate It:** Set up automatic monthly NACH mandates on your bank account for mutual fund SIPs as it keeps discipline.
2. **Recommended Basket:** 
   - **50% Core Index:** Nifty 50 Index Mutual Fund for stable compounding.
   - **30% Next Tier:** Nifty LargeMidcap 250 Index Fund or Active Midcap fund.
   - **20% Smallcap Satellite:** Smallcap mutual fund if your retirement run allows a 15+ year timeline.
3. **Step-Up:** Try to step-up your SIP by 10% every year as your salary increases to reach your retirement goals twice as fast!`;
  }

  // EMERGENCY / EXPENSE / SAVINGS
  if (query.match(/\b(emergency|expense|buffer|cushion|savings|liquid|backup|fd)\b/)) {
    const recBuffer = expenses * 6;
    const isAdequate = currentSavings >= recBuffer;
    const diff = recBuffer - currentSavings;

    return `### 🚨 Emergency Reserve Buffer Audit for **${name}**
    
In the blueprint of Indian personal finance, an emergency fund is your primary moat.
- **Your Monthly Cash Outflows:** ₹${expenses.toLocaleString('en-IN')}
- **Ideal 6-Month Emergency Fund size:** **₹${recBuffer.toLocaleString('en-IN')}**
- **Your Enrolled Liquid Cash/Savings Balance:** ₹${currentSavings.toLocaleString('en-IN')}

---

### **⚖️ Safety Adequacy Assessment:**
${isAdequate 
  ? `✔️ **EXCELLENT STABILITY!** Your current liquid reserves of **₹${currentSavings.toLocaleString('en-IN')}** cover approximately **${(currentSavings/expenses).toFixed(1)} months** of complete expenditure. This keeps you safe from job interruptions or temporary pay delays.` 
  : `⚠️ **BUFFERS ARE INSUFFICIENT!** You are short by **₹${diff.toLocaleString('en-IN')}** of the ideal 6-month safety net. Your current cash lasts only **${(currentSavings/expenses).toFixed(1)} months**.`}

---

### **💡 Master Blueprint Recommendations:**
1. **Where to park this reservoir:**
   - **50% in a Sweep-in Fixed Deposit** tied to your primary bank account (earns higher interest than savings, instantly withdrawable).
   - **50% in an Arbitrage/Liquid Mutual Fund** (very low risk, highly tax-efficient compared to normal FDs for high-slab earners).
2. **Immediate Step:** If under-covered, pause or reduce your stock investments temporarily and direct all monthly surplus (Gross income of ₹${salary.toLocaleString('en-IN')} minus ₹${expenses.toLocaleString('en-IN')} expenses) into building this buffer first.`;
  }

  // INSURANCE / TERM / HEALTH
  if (query.match(/\b(insurance|term|health|lic|cover|medical|adequacy|audit)\b/)) {
    const idealTerm = annualGross * 15;
    const pathTerm = profile.termInsuranceCover || 0;
    const pathHealth = profile.healthInsuranceCover || 0;
    
    const isTermAdequate = pathTerm >= idealTerm;
    const isHealthAdequate = pathHealth >= 500000;

    return `### 🛡️ Insurance Cover Adequacy Check
    
Insurance exists to protect dependencies, not to act as investment vehicles. Let's inspect your risk-management boundaries:

#### 1. Term Life Insurance (Pure Protection)
- **Rule of Thumb:** 10x - 15x of Gross Annual Salary. 
- **Your Recommended pure-term cover:** **₹${idealTerm.toLocaleString('en-IN')}**
- **Your Registered pure-term cover:** ₹${pathTerm.toLocaleString('en-IN')}
- **Assessment:** ${isTermAdequate 
  ? `✔️ **Fully Covered!** Your pure term cover of ₹${pathTerm.toLocaleString('en-IN')} shields your family robustly.` 
  : `⚠️ **Under-Covered!** Your active term cover of ₹${pathTerm.toLocaleString('en-IN')} is below the recommended safety cap. If you have dependents, you should purchase a pure-term structure immediately (HDFC Life, Max Life, or ICICI Pru). Avoid LIC endowment or ULIPs, which charge high fees and yield only 5-6% returns!`}

#### 2. Health Medical Insurance
- **Recommended base Cover:** Minimum ₹5,00,000 (5 Lakhs) for yourself, plus dedicated corporate coverage.
- **Your Enrolled Health Cover:** ₹${pathHealth.toLocaleString('en-IN')}
- **Assessment:** ${isHealthAdequate 
  ? `✔️ **Adequate base health insurance!** Keeping a private cover of ₹${pathHealth.toLocaleString('en-IN')} ensures you remain safe even during corporate career shifts.` 
  : `⚠️ **Refine Health Protection:** Your cover of ₹${pathHealth.toLocaleString('en-IN')} might be low for metro hospital expenses. Consider taking a base cover of 5 Lakhs or adding a high-deductible super-top-up helper policy containing a low premium.`}`;
  }

  // LOAN / DEBT
  if (query.match(/\b(loan|debt|emi|borrow|home loan|car loan|personal loan|avalanche|snowball)\b/)) {
    if (totalLoans === 0) {
      return `### 🩺 Debt & Leverage Health Report
      
**Status:** 🎉 **COMPLETE LIABILITY FREEDOM!**
You have registered ₹0 outstanding long-term liabilities! This is an exceptional personal finance feat. With zero monthly EMIs pulling down your cash flow, you should route at least **35% of your income (₹${Math.round(salary*0.35).toLocaleString('en-IN')})** straight into active SIP index mutual funds to let compound interest work for you!`;
    }

    const loanCount = [homeLoan, personalLoan, carLoan, otherLoan].filter(l => l > 0).length;
    return `### 📉 Debt Reduction paydown Strategy (${loanCount} Active Liabilities)
    
Your registered long-term liabilities sum up to **₹${totalLoans.toLocaleString('en-IN')}**:
${homeLoan > 0 ? `- 🏠 **Home Loan Principal:** ₹${homeLoan.toLocaleString('en-IN')}\n` : ""}${personalLoan > 0 ? `- 💳 **High-Risk Personal Loan:** ₹${personalLoan.toLocaleString('en-IN')} *(Urgent Category)*\n` : ""}${carLoan > 0 ? `- 🚗 **Car Loan principal:** ₹${carLoan.toLocaleString('en-IN')}\n` : ""}${otherLoan > 0 ? `- 📂 **Other auxiliary loan:** ₹${otherLoan.toLocaleString('en-IN')}\n` : ""}

---

### **💡 Strategic Leverage Roadmap:**
1. **Nuke High-Interest First (Avalanche Method):**
   - Personal loans typically charge **12% to 18% interest**, car loans **9% to 11%**, home loans **8% to 9%**. 
   - **Immediately prioritize** clearing your ${personalLoan > 0 ? `**Personal Loan of ₹${personalLoan.toLocaleString('en-IN')}**` : "highest interest loan"} by prepaying as much of your monthly gross (₹${salary.toLocaleString('en-IN')}) surplus into it. This is a guaranteed 14% tax-free savings return on your money!
2. **Prepay Home Loan Principle:** 
   - If you have an active Home Loan, make a pledge to prepay **1 extra EMI every year**, or increase your monthly EMI by **5% annually**. This simple step trims a 20-year run down to just **12 to 13 years**, saving you lakhs in interest costs!`;
  }

  // GOVERNMENT / 7th PAY / PAYSCALE / BPSC / KVS
  if (query.match(/\b(7th pay|pay scale|basic|da|hra|allowance|government|salary|salary structure)\b/)) {
    const computedBasic = Math.round(salary * 0.40);
    const computedDA = Math.round(computedBasic * 0.50);
    return `### 🏛️ Government Salary Architecture (7th Pay Commission)
    
Since you are analyzing structured salaried scales (often aligned with Central or State pay rules):

- **Gross registered scale:** ₹${salary.toLocaleString('en-IN')} / month
- **Assumed Basic Pay (typically ~40-50%):** ₹${computedBasic.toLocaleString('en-IN')}
- **Dearness Allowance (current 50% DA):** ₹${computedDA.toLocaleString('en-IN')}
- **HRA Bracket allocation:** Aligned to your city tier (${profile.city === 'tier1' ? 'Metro 27% HRA' : profile.city === 'tier2' ? 'Town 18% HRA' : 'Rural 9% HRA'}).

---

### **💡 Optimizing Government Allowances:**
1. **NPS Under Section 80CCD(2):** 
   - The Employer's NPS contribution (14% of Basic + DA) is fully tax-free under both tax regimes! Ensure your department files this to lower your taxable net.
2. **LTA (Leave Travel Allowance) & Fuel Reimbursements:** Ensure you submit rent receipts (HRA exemption under Old Regime) and other declarations directly to your DDO (Drawing and Disbursing Officer) before January to prevent heavy TDS tax deductions!`;
  }

  // Default Fallback
  return `### 💡 Holistic Paisa Blueprint Advice for **${name}**
  
I have analyzed your entire financial ledger and here is your core optimize path:

1. **Compounding Force:** You have **₹${totalInvestments.toLocaleString('en-IN')}** invested across mutual funds, stocks, and fixed income. Keeping an active Nifty 50 SIP will double this amount dynamically behind the scenes.
2. **Risk Barrier:** Your current liquid savings are **₹${currentSavings.toLocaleString('en-IN')}** against a target emergency buffer of **₹${(expenses * 6).toLocaleString('en-IN')}**. Fill this up before expanding stock operations.
3. **Debt Drag:** Your active liabilities total **₹${totalLoans.toLocaleString('en-IN')}**. Leverage prepayments of the high-rate segments to unlock massive cash flow.
4. **Tax Leakage:** At gross ₹${salary.toLocaleString('en-IN')}/mo, you are likely in a high-bracket. Use the tax tab to compare regimes precisely and maximize direct index funds.

*Feel free to ask me something specific, like **"Compare tax old vs new"** or **"How much will ₹10,000 monthly grow to?"**!*`;
}

export const offlineInsightsEn = [
  {
    id: "bihar-transfer-1",
    category: "Bihar Teacher Transfer",
    title: "Official Notification: Bihar State Teacher Transfer Rules, 2026 Released",
    summary: "The Education Department of Bihar has officially notified the 'Bihar State Teacher Transfer Rules, 2026' (Memo 11/Vi-33/2026) dated June 25, 2026. It introduces a highly structured Point-Based Seniority System (अंक-आधारित वरीयता प्रणाली) for primary, middle, secondary, and higher secondary government school teachers, with transparent rules for mutual and general transfers.",
    status: "Policy Notified",
    statusColor: "emerald",
    date: "June 25, 2026",
    impact: "Establishes transparent point scores (up to 20 pts for medical/disability, 15 pts for spouse posting, 10 pts for single parent, plus service-linked points) for over 1.5 Lakh teachers."
  },
  {
    id: "bihar-salary-1",
    category: "Bihar Teacher Salary",
    title: "BPSC Shikshak Dearness Allowance Disbursed at 50%",
    summary: "Dearness Allowance (DA) of 50% calculated on basic pay scaled by the 7th Pay Commission has been successfully disbursed for BPSC primary, secondary, and senior secondary teacher cadres.",
    status: "Slabs Disbursed",
    statusColor: "blue",
    date: "May 2026",
    impact: "Direct increase in take-home monthly salary by ₹3,800 - ₹6,000 depending on pay levels."
  },
  {
    id: "neighbour-states-1",
    category: "Neighbouring States",
    title: "Jharkhand & UP Teacher Pay Harmonization Projects",
    summary: "Jharkhand cabinet approved alignment of public teacher scale DA to 53% starting mid-year. Uttar Pradesh establishes unified educational recruitment boards to evaluate pending scale hikes.",
    status: "Scale Synced",
    statusColor: "purple",
    date: "June 2026",
    impact: "Averages salaries across border districts, preventing cross-state employee departures."
  },
  {
    id: "state-central-1",
    category: "State & Central Employees",
    title: "8th Pay Commission Memorandum Filed; UPS vs NPS Debate",
    summary: "Joint staff employees federations have submitted official memorandums urging the prompt formation of the 8th Pay Commission with recommended fitment factors of 2.86x or 3.0x. Unified Pension Scheme (UPS) implementation rules are also under union evaluation.",
    status: "Whitepaper Stage",
    statusColor: "amber",
    date: "June 2026",
    impact: "A 2.86x fitment factor would raise minimum initial basic pay scales from ₹18,000 up to ₹51,480."
  }
];

export const offlineInsightsHi = [
  {
    id: "bihar-transfer-1",
    category: "Bihar Teacher Transfer",
    title: "आधिकारिक अधिसूचना: 'बिहार राज्य शिक्षक स्थानान्तरण नियमावली, 2026' जारी",
    summary: "बिहार शिक्षा विभाग ने 25 जून 2026 को 'बिहार राज्य शिक्षक स्थानान्तरण नियमावली, 2026' (संचिका संख्या 11/वि०-33/2026) की आधिकारिक अधिसूचना जारी कर दी है। इसके तहत प्राथमिक, मध्य, माध्यमिक और उच्चतर माध्यमिक शिक्षकों के स्थानांतरण के लिए एक पारदर्शी 'अंक-आधारित वरीयता प्रणाली' (Point-Based Seniority System) लागू की गई है।",
    status: "नियमावली अधिसूचित",
    statusColor: "emerald",
    date: "25 जून 2026",
    impact: "तबादलों में पूर्ण पारदर्शिता आएगी; शिक्षक अपनी सेवा अवधि (1 अंक प्रति शैक्षणिक वर्ष), स्कूल श्रेणी (1-5 अंक) और विशेष श्रेणियों जैसे गंभीर बीमारी/दिव्यांगता (20 अंक), पति-पत्नी पदस्थापन (15 अंक) के आधार पर वरीयता स्कोर की गणना कर सकेंगे।"
  },
  {
    id: "bihar-salary-1",
    category: "Bihar Teacher Salary",
    title: "बीपीएससी शिक्षक महंगाई भत्ता (DA) 50% स्वीकृत और वितरित",
    summary: "सातवें वेतन आयोग की सिफारिशों के आधार पर तय किए गए मूल वेतन पर 50% की दर से महंगाई भत्ता (DA) बीपीएससी प्राथमिक, माध्यमिक और उच्चतर माध्यमिक शिक्षक संवर्गों के लिए सफलतापूर्वक जारी कर दिया गया है।",
    status: "डीए वितरित",
    statusColor: "blue",
    date: "मई 2026",
    impact: "वेतन स्तर के आधार पर मासिक इन-हैंड सैलरी में ₹3,800 से ₹6,000 तक की सीधी और तत्काल बढ़ोतरी।"
  },
  {
    id: "neighbour-states-1",
    category: "Neighbouring States",
    title: "झारखंड और उत्तर प्रदेश शिक्षक वेतन संरेखण परियोजनाएं",
    summary: "झारखंड कैबिनेट ने सरकारी शिक्षकों के महंगाई भत्ते को बढ़ाकर 53% करने की मंजूरी दे दी है। वहीं उत्तर प्रदेश सरकार लंबित वेतनमान विसंगतियों को दूर करने के लिए नए शिक्षा सेवा चयन बोर्ड का गठन कर रही है।",
    status: "वेतनमान संरेखित",
    statusColor: "purple",
    date: "जून 2026",
    impact: "सीमावर्ती जिलों में कार्यरत शिक्षकों के वेतन में असमानता कम होगी, जिससे शिक्षकों के पलायन पर रोक लगेगी।"
  },
  {
    id: "state-central-1",
    category: "State & Central Employees",
    title: "8वें वेतन आयोग का ज्ञापन प्रस्तुत; यूपीएस बनाम एनपीएस बहस तेज",
    summary: "कर्मचारी महासंघों ने 2.86x या 3.0x फिटमेंट फैक्टर की सिफारिश के साथ 8वें वेतन आयोग के तत्काल गठन के लिए आधिकारिक मांग पत्र सौंपा है। इसके साथ ही यूनियनों द्वारा एकीकृत पेंशन योजना (UPS) के नियमों का भी गहन विश्लेषण किया जा रहा है।",
    status: "ज्ञापन स्तर",
    statusColor: "amber",
    date: "जून 2026",
    impact: "यदि 2.86x फिटमेंट फैक्टर लागू होता है, तो न्यूनतम प्रारंभिक मूल वेतन ₹18,000 से बढ़कर सीधे ₹51,480 हो जाएगा।"
  }
];
