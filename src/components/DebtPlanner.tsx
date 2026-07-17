import React, { useState, useEffect, useMemo } from "react";
import { 
  CreditCard, 
  TrendingDown, 
  Plus, 
  Trash2, 
  Percent, 
  AlertTriangle, 
  Clock, 
  Coins, 
  HelpCircle, 
  TrendingUp, 
  CheckCircle,
  Lightbulb,
  Sparkles,
  RefreshCw,
  Gauge,
  Share2,
  FileDown
} from "lucide-react";
import { UserProfile, LoanDetails, getShareableLink } from "../types";
import { generatePDFReport } from "../utils/pdfGenerator";
import { paisaFetch } from "../api";

interface DebtItem {
  id: string;
  name: string;
  balance: number;
  interestRate: number;
  minimumMonthlyPayment: number;
  // Temporary string states for seamless editing in text inputs
  balanceStr: string;
  interestRateStr: string;
  minimumMonthlyPaymentStr: string;
  active?: boolean;
}

// Indian standard EMI calculator formula
const calculateEmi = (principal: number, annualRate: number, tenureYears: number): number => {
  if (principal <= 0 || annualRate <= 0 || tenureYears <= 0) return 0;
  const monthlyRate = annualRate / 12 / 100;
  const totalMonths = tenureYears * 12;
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
  return Math.round(emi);
};

const DEBT_COLORS = [
  "bg-purple-500",
  "bg-amber-500",
  "bg-blue-500",
  "bg-rose-500",
  "bg-emerald-500",
  "bg-indigo-500",
  "bg-cyan-500",
];

const DEBT_COLOR_TEXTS = [
  "text-purple-600 dark:text-purple-400",
  "text-amber-600 dark:text-amber-400",
  "text-blue-600 dark:text-blue-400",
  "text-rose-600 dark:text-rose-400",
  "text-emerald-600 dark:text-emerald-400",
  "text-indigo-600 dark:text-indigo-400",
  "text-cyan-600 dark:text-cyan-400",
];

interface DebtPlannerProps {
  profile: UserProfile;
}

export default function DebtPlanner({ profile }: DebtPlannerProps) {
  // Extract initial debts from active profile loans if any exist
  const getInitialDebts = (): DebtItem[] => {
    const list: DebtItem[] = [];
    const { loans } = profile;

    if (loans.homeLoan > 0) {
      const rate = loans.homeLoanRate || 8.5;
      const tenure = loans.homeLoanTenure || 20;
      const emi = calculateEmi(loans.homeLoan, rate, tenure) || Math.round(loans.homeLoan * 0.0085);
      list.push({
        id: "home-loan",
        name: "Home Loan",
        balance: loans.homeLoan,
        interestRate: rate,
        minimumMonthlyPayment: emi,
        balanceStr: loans.homeLoan.toString(),
        interestRateStr: rate.toString(),
        minimumMonthlyPaymentStr: emi.toString(),
        active: true
      });
    }

    if (loans.carLoan > 0) {
      const rate = loans.carLoanRate || 9.5;
      const tenure = loans.carLoanTenure || 7;
      const emi = calculateEmi(loans.carLoan, rate, tenure) || Math.round(loans.carLoan * 0.016);
      list.push({
        id: "car-loan",
        name: "Car Loan",
        balance: loans.carLoan,
        interestRate: rate,
        minimumMonthlyPayment: emi,
        balanceStr: loans.carLoan.toString(),
        interestRateStr: rate.toString(),
        minimumMonthlyPaymentStr: emi.toString(),
        active: true
      });
    }

    if (loans.personalLoan > 0) {
      const rate = loans.personalLoanRate || 12.5;
      const tenure = loans.personalLoanTenure || 5;
      const emi = calculateEmi(loans.personalLoan, rate, tenure) || Math.round(loans.personalLoan * 0.022);
      list.push({
        id: "personal-loan",
        name: "Personal Loan",
        balance: loans.personalLoan,
        interestRate: rate,
        minimumMonthlyPayment: emi,
        balanceStr: loans.personalLoan.toString(),
        interestRateStr: rate.toString(),
        minimumMonthlyPaymentStr: emi.toString(),
        active: true
      });
    }

    if (loans.otherLoan > 0) {
      const rate = 11.0;
      const tenure = 5;
      const emi = calculateEmi(loans.otherLoan, rate, tenure) || Math.round(loans.otherLoan * 0.021);
      list.push({
        id: "other-loan",
        name: "Other Loan / Hand Loan",
        balance: loans.otherLoan,
        interestRate: rate,
        minimumMonthlyPayment: emi,
        balanceStr: loans.otherLoan.toString(),
        interestRateStr: rate.toString(),
        minimumMonthlyPaymentStr: emi.toString(),
        active: true
      });
    }

    // Default fallbacks if no loans are active in profile
    if (list.length === 0) {
      list.push({
        id: "debt-creditcard",
        name: "Credit Card Bill",
        balance: 45000,
        interestRate: 42.0, // Credit card rate are high!
        minimumMonthlyPayment: 2250,
        balanceStr: "45000",
        interestRateStr: "42",
        minimumMonthlyPaymentStr: "2250",
        active: true
      });
      list.push({
        id: "debt-personal",
        name: "Personal Loan",
        balance: 150000,
        interestRate: 13.5,
        minimumMonthlyPayment: 4500,
        balanceStr: "150000",
        interestRateStr: "13.5",
        minimumMonthlyPaymentStr: "4500",
        active: true
      });
    }

    return list;
  };

  const [debts, setDebts] = useState<DebtItem[]>(getInitialDebts);
  const [useCustomSalary, setUseCustomSalary] = useState<boolean>(false);
  const [customSalary, setCustomSalary] = useState<number>(profile.salary > 0 ? profile.salary : 75000);
  const [customSalaryStr, setCustomSalaryStr] = useState<string>((profile.salary > 0 ? profile.salary : 75000).toString());
  const [extraMonthlyPayment, setExtraMonthlyPayment] = useState<number>(10000);
  const [extraMonthlyPaymentStr, setExtraMonthlyPaymentStr] = useState<string>("10000");
  const [selectedStrategy, setSelectedStrategy] = useState<"avalanche" | "snowball">("avalanche");

  // New debt form state
  const [newDebtName, setNewDebtName] = useState<string>("");
  const [newDebtBalance, setNewDebtBalance] = useState<number>(50000);
  const [newDebtBalanceStr, setNewDebtBalanceStr] = useState<string>("50000");
  const [newDebtRate, setNewDebtRate] = useState<number>(12);
  const [newDebtRateStr, setNewDebtRateStr] = useState<string>("12");
  const [newDebtMinEmi, setNewDebtMinEmi] = useState<number>(1500);
  const [newDebtMinEmiStr, setNewDebtMinEmiStr] = useState<string>("1500");

  const [activeTab, setActiveTab] = useState<"strategy" | "customizer" | "ifin" | "faq">("strategy");
  const [ifinMultiplier, setIfinMultiplier] = useState<number>(25);
  const [snowballRolloverEnabled, setSnowballRolloverEnabled] = useState<boolean>(true);
  const [timelineMonth, setTimelineMonth] = useState<number>(0);

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

  const saveToLocker = async () => {
    setIsSaving(true);
    setSaveStatus("idle");
    try {
      const res = await paisaFetch("/api/locker/save", {
        method: "POST",
        body: JSON.stringify({
          title: `Debt Repayment Plan (${debts.length} Debts - ₹${debts.reduce((sum, d) => sum + d.balance, 0).toLocaleString()} Total)`,
          type: "loan",
          data: {
            debts,
            extraMonthlyPayment,
            selectedStrategy,
            snowballRolloverEnabled,
            useCustomSalary,
            customSalary
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
        alert(data?.message || "Please log in to save your plan to your financial locker.");
      }
    } catch (err) {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
      alert("Please log in to save this plan to your financial locker.");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const loadedStr = localStorage.getItem("paisa_loaded_calculation");
    if (loadedStr) {
      try {
        const calc = JSON.parse(loadedStr);
        if (calc && calc.type?.toLowerCase() === "loan" && calc.data) {
          const data = calc.data;
          if (Array.isArray(data.debts)) {
            setDebts(data.debts);
          }
          if (data.extraMonthlyPayment !== undefined) {
            setExtraMonthlyPayment(data.extraMonthlyPayment);
            setExtraMonthlyPaymentStr(String(data.extraMonthlyPayment));
          }
          if (data.selectedStrategy !== undefined) {
            setSelectedStrategy(data.selectedStrategy);
          }
          if (data.snowballRolloverEnabled !== undefined) {
            setSnowballRolloverEnabled(data.snowballRolloverEnabled);
          }
          if (data.useCustomSalary !== undefined) {
            setUseCustomSalary(data.useCustomSalary);
          }
          if (data.customSalary !== undefined) {
            setCustomSalary(data.customSalary);
            setCustomSalaryStr(String(data.customSalary));
          }
        }
      } catch (e) {
        console.error("Failed to parse loaded debt calculation", e);
      } finally {
        localStorage.removeItem("paisa_loaded_calculation");
      }
    }
  }, []);

  // Sync state if profile changes
  const handleResetToProfile = () => {
    const list = getInitialDebts();
    setDebts(list);
  };

  // Reset timeline slider when inputs change
  useEffect(() => {
    setTimelineMonth(0);
  }, [debts, selectedStrategy, extraMonthlyPayment, snowballRolloverEnabled]);

  // Safe manual inputs for existing debts
  const handleUpdateDebtField = (id: string, field: "name" | "balance" | "interestRate" | "minimumMonthlyPayment", valueStr: string) => {
    setDebts(prev => prev.map(debt => {
      if (debt.id !== id) return debt;

      const updated = { ...debt };
      if (field === "name") {
        updated.name = valueStr;
      } else if (field === "balance") {
        updated.balanceStr = valueStr;
        const s = valueStr.replace(/[^0-9]/g, "");
        updated.balance = s === "" ? 0 : Number(s);
      } else if (field === "interestRate") {
        updated.interestRateStr = valueStr;
        const s = valueStr.replace(/[^0-9.]/g, "");
        const parts = s.split(".");
        const finalVal = parts.length > 2 ? parts[0] + "." + parts.slice(1).join("") : s;
        updated.interestRate = finalVal === "" || finalVal === "." ? 0 : Number(finalVal);
      } else if (field === "minimumMonthlyPayment") {
        updated.minimumMonthlyPaymentStr = valueStr;
        const s = valueStr.replace(/[^0-9]/g, "");
        updated.minimumMonthlyPayment = s === "" ? 0 : Number(s);
      }
      return updated;
    }));
  };

  const handleUpdateDebtSlider = (id: string, field: "balance" | "interestRate" | "minimumMonthlyPayment", val: number) => {
    setDebts(prev => prev.map(debt => {
      if (debt.id !== id) return debt;
      const updated = { ...debt };
      if (field === "balance") {
        updated.balance = val;
        updated.balanceStr = val.toString();
      } else if (field === "interestRate") {
        updated.interestRate = val;
        updated.interestRateStr = val.toString();
      } else if (field === "minimumMonthlyPayment") {
        updated.minimumMonthlyPayment = val;
        updated.minimumMonthlyPaymentStr = val.toString();
      }
      return updated;
    }));
  };

  const handleAddDebt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDebtName.trim()) return;

    const newId = "custom-debt-" + Date.now();
    const newItem: DebtItem = {
      id: newId,
      name: newDebtName,
      balance: newDebtBalance,
      interestRate: newDebtRate,
      minimumMonthlyPayment: newDebtMinEmi,
      balanceStr: newDebtBalanceStr,
      interestRateStr: newDebtRateStr,
      minimumMonthlyPaymentStr: newDebtMinEmiStr
    };

    setDebts(prev => [...prev, newItem]);
    setNewDebtName("");
    setNewDebtBalance(50000);
    setNewDebtBalanceStr("50000");
    setNewDebtRate(12);
    setNewDebtRateStr("12");
    setNewDebtMinEmi(1500);
    setNewDebtMinEmiStr("1500");
  };

  const handleDeleteDebt = (id: string) => {
    setDebts(prev => prev.filter(d => d.id !== id));
  };

  // Prepay values slider sync
  const handleExtraPaymentChange = (val: number) => {
    setExtraMonthlyPayment(val);
    setExtraMonthlyPaymentStr(val.toString());
  };

  const handleExtraPaymentStrChange = (str: string) => {
    const sanitized = str.replace(/[^0-9]/g, "");
    setExtraMonthlyPaymentStr(sanitized);
    if (sanitized !== "") {
      setExtraMonthlyPayment(Number(sanitized));
    } else {
      setExtraMonthlyPayment(0);
    }
  };

  // -------------------------------------------------------------
  // iFIN (Indian Financial Independence) Index Calculations
  // -------------------------------------------------------------
  const ifinAssets = useMemo(() => {
    const { investments, currentSavings } = profile;
    const invTotal = 
      (investments.mutualFunds || 0) +
      (investments.stocks || 0) +
      (investments.gold || 0) +
      (investments.epf || 0) +
      (investments.ppf || 0) +
      (investments.nps || 0) +
      (investments.realEstate || 0);
    return invTotal + (currentSavings || 0);
  }, [profile]);

  const totalActiveDebt = useMemo(() => {
    return debts.filter(d => d.active !== false).reduce((sum, d) => sum + d.balance, 0);
  }, [debts]);

  const ifinNetWorth = ifinAssets - totalActiveDebt;

  const ifinTarget = useMemo(() => {
    const annualExpenses = (profile.monthlyExpenses || 35000) * 12;
    return annualExpenses * ifinMultiplier;
  }, [profile.monthlyExpenses, ifinMultiplier]);

  const ifinIndex = useMemo(() => {
    if (ifinTarget <= 0) return 0;
    return Math.round((ifinNetWorth / ifinTarget) * 1000) / 10;
  }, [ifinNetWorth, ifinTarget]);

  const potentialIfinIndex = useMemo(() => {
    if (ifinTarget <= 0) return 0;
    return Math.round((ifinAssets / ifinTarget) * 1000) / 10;
  }, [ifinAssets, ifinTarget]);

  const debtDragPercent = useMemo(() => {
    if (ifinTarget <= 0) return 0;
    return Math.round((totalActiveDebt / ifinTarget) * 1000) / 10;
  }, [totalActiveDebt, ifinTarget]);

  const debtToAssetLeverageRatio = useMemo(() => {
    if (ifinAssets <= 0) return 0;
    return Math.round((totalActiveDebt / ifinAssets) * 1000) / 10;
  }, [totalActiveDebt, ifinAssets]);

  const freedMonthlyEMI = useMemo(() => {
    return debts.filter(d => d.active !== false).reduce((sum, d) => sum + d.minimumMonthlyPayment, 0);
  }, [debts]);

  const calculateSipFutureValue = (monthly: number, years: number, rate: number) => {
    const months = years * 12;
    const r = (rate / 100) / 12;
    if (r === 0) return monthly * months;
    return Math.round(monthly * ((Math.pow(1 + r, months) - 1) / r) * (1 + r));
  };

  // Salary for FOIR threshold calculations (default 75k gross)
  const monthlySalary = useCustomSalary ? customSalary : (profile.salary > 0 ? profile.salary : 75000);
  const totalMinEmi = debts.reduce((sum, d) => sum + (d.active !== false ? d.minimumMonthlyPayment : 0), 0);
  const foirRatio = monthlySalary > 0 ? (totalMinEmi / monthlySalary) * 100 : 0;

  // Simulate monthly paydown schedules for:
  // 1. Avalanche (Highest Interest First)
  // 2. Snowball (Lowest Balance First)
  // 3. Minimum Payments Only
  const simulationResults = useMemo(() => {
    if (debts.length === 0) {
      return {
        avalanche: { months: 0, totalInterest: 0, schedule: [] },
        snowball: { months: 0, totalInterest: 0, schedule: [] },
        minOnly: { months: 0, totalInterest: 0, schedule: [] }
      };
    }

    const simulate = (strategy: "avalanche" | "snowball" | "min-only") => {
      // Deep copy debts state
      let activeDebts = debts.map(d => ({
        id: d.id,
        name: d.name,
        balance: d.balance,
        interestRate: d.interestRate,
        minPay: d.minimumMonthlyPayment,
        active: d.active !== false
      })).filter(d => d.balance > 0 && d.active);

      if (activeDebts.length === 0) {
        return {
          months: 0,
          totalInterest: 0,
          schedule: []
        };
      }

      // Track the list of active debts at the start of simulation
      const initialActiveDebts = activeDebts.map(d => ({ ...d }));

      const schedule: { month: number; totalRemaining: number; balances: Record<string, number> }[] = [];
      let month = 0;
      let totalInterestPaid = 0;
      const maxMonths = 360; // 30 years limit

      // Initial state
      let currentTotalDebt = activeDebts.reduce((sum, d) => sum + d.balance, 0);
      const initialBalances: Record<string, number> = {};
      debts.forEach(d => {
        initialBalances[d.id] = d.active !== false ? d.balance : 0;
      });
      schedule.push({ month: 0, totalRemaining: currentTotalDebt, balances: initialBalances });

      while (activeDebts.length > 0 && month < maxMonths) {
        month++;
        let interestThisMonth = 0;

        // 1. Accrue interest first
        activeDebts.forEach(d => {
          const monthlyRate = d.interestRate / 12 / 100;
          const accrued = d.balance * monthlyRate;
          d.balance += accrued;
          interestThisMonth += accrued;
          totalInterestPaid += accrued;
        });

        // 2. Determine target monthly paydown cash budget
        // Total cash is sum of minimums of active debts + extra prepaid cash
        const activeMinsSum = activeDebts.reduce((sum, d) => sum + d.minPay, 0);
        const extraPaymentCash = strategy === "min-only" ? 0 : extraMonthlyPayment;
        let availableCash = activeMinsSum + extraPaymentCash;
        let savedAmount = 0;

        // If snowball effect (payment rollover) toggle is enabled, calculate the "saved amount"
        // from any paid-off loans and add it to our available cash.
        if (snowballRolloverEnabled && strategy !== "min-only") {
          const paidOffDebts = initialActiveDebts.filter(
            initD => !activeDebts.some(activeD => activeD.id === initD.id)
          );
          savedAmount = paidOffDebts.reduce((sum, d) => sum + d.minPay, 0);
          availableCash += savedAmount;
        }

        // 3. Pay Minimums on all active debts first
        // If balance + interest is less than minimum, pay only the balance & release remainder to cash pool
        const monthlyPayments = new Map<string, number>();
        activeDebts.forEach(d => {
          const payment = Math.min(d.balance, d.minPay);
          monthlyPayments.set(d.id, payment);
          d.balance -= payment;
          availableCash -= payment;
        });

        // 4. Implement prompt logic:
        // "decides to apply the full monthly 'saved amount' from a paid-off loan to the next highest interest loan."
        let eligibleDebts = [...activeDebts].filter(d => d.balance > 0);

        if (snowballRolloverEnabled && savedAmount > 0 && availableCash > 0 && strategy !== "min-only") {
          // Sort remaining active debts by highest interest rate
          const sortedByInterestDesc = [...eligibleDebts].sort((a, b) => b.interestRate - a.interestRate);
          const highestInterestTarget = sortedByInterestDesc[0];
          if (highestInterestTarget) {
            const extraApplied = Math.min(highestInterestTarget.balance, savedAmount, availableCash);
            highestInterestTarget.balance -= extraApplied;
            availableCash -= extraApplied;
            monthlyPayments.set(highestInterestTarget.id, (monthlyPayments.get(highestInterestTarget.id) || 0) + extraApplied);
            
            // Re-filter eligible debts in case it gets paid off
            eligibleDebts = eligibleDebts.filter(d => d.balance > 0);
          }
        }

        // 5. If there is leftover extra cash available, allocate it to target debts based on chosen strategy
        if (availableCash > 0 && strategy !== "min-only") {
          if (strategy === "avalanche") {
            // Sort by interest rate descending
            eligibleDebts.sort((a, b) => b.interestRate - a.interestRate);
          } else if (strategy === "snowball") {
            // Sort by remaining balance ascending
            eligibleDebts.sort((a, b) => a.balance - b.balance);
          }

          for (let i = 0; i < eligibleDebts.length; i++) {
            if (availableCash <= 0) break;
            const target = eligibleDebts[i];
            const extraApplied = Math.min(target.balance, availableCash);
            target.balance -= extraApplied;
            availableCash -= extraApplied;
            monthlyPayments.set(target.id, (monthlyPayments.get(target.id) || 0) + extraApplied);
          }
        }

        // Remove fully paid debts
        activeDebts = activeDebts.filter(d => d.balance > 1); // Keep if remaining balance > 1 Rupee

        currentTotalDebt = activeDebts.reduce((sum, d) => sum + d.balance, 0);
        const currentBalances: Record<string, number> = {};
        debts.forEach(d => {
          const found = activeDebts.find(ad => ad.id === d.id);
          currentBalances[d.id] = found ? Math.max(0, Math.round(found.balance)) : 0;
        });
        schedule.push({ month, totalRemaining: Math.round(currentTotalDebt), balances: currentBalances });
      }

      return {
        months: month === maxMonths ? 360 : month,
        totalInterest: Math.round(totalInterestPaid),
        schedule
      };
    };

    return {
      avalanche: simulate("avalanche"),
      snowball: simulate("snowball"),
      minOnly: simulate("min-only")
    };
  }, [debts, extraMonthlyPayment, snowballRolloverEnabled]);

  // Selected payment strategy data
  const chosenStrategyData = useMemo(() => {
    return selectedStrategy === "avalanche" 
      ? simulationResults.avalanche 
      : simulationResults.snowball;
  }, [selectedStrategy, simulationResults]);

  // Comparative metrics
  const minOnlyMonths = simulationResults.minOnly.months;
  const minOnlyInterest = simulationResults.minOnly.totalInterest;

  const strategyMonths = chosenStrategyData.months;
  const strategyInterest = chosenStrategyData.totalInterest;

  const monthsSaved = Math.max(0, minOnlyMonths - strategyMonths);
  const interestSaved = Math.max(0, minOnlyInterest - strategyInterest);

  const formattedCurrency = (val: number) => {
    return "₹" + val.toLocaleString("en-IN");
  };

  const getFoirBadge = (ratio: number) => {
    if (ratio === 0) return { text: "No Debt Obligations", color: "bg-emerald-50 text-emerald-700 border-emerald-100", advice: "Excellent! You are credit burden-free. Maintain this state." };
    if (ratio < 30) return { text: "Perfect Healthy", color: "bg-emerald-50 text-emerald-700 border-emerald-100", advice: "Healthy debt ratio! This leaves substantial headroom for savings and makes you highly creditworthy." };
    if (ratio <= 45) return { text: "Manageable", color: "bg-amber-50 text-amber-700 border-amber-100", advice: "Moderate credit burden. Try to avoid taking on any new EMIs and focus on accelerated pre-payments." };
    return { text: "High Stress Risk", color: "bg-red-50 text-red-700 border-red-100", advice: "Critical Threshold! Over 45% Fixed Obligation to Income (FOIR) limits your loan eligibility and triggers liquidity distress." };
  };

  const foirMeta = getFoirBadge(foirRatio);

  const shareToWhatsApp = () => {
    const currentUrl = getShareableLink("debt_planner", "/debt");
    const totalDebtAmount = debts.reduce((sum, d) => sum + d.balance, 0);
    
    const text = `💸 *Debt Freedom Projections*
Total Active Loans/Card Debts: ${debts.length}
Total Debt Balance: ₹${totalDebtAmount.toLocaleString("en-IN")}
Current FOIR EMI Ratio: ${foirRatio.toFixed(1)}% (${foirMeta.text})
-----------------------------------
*Accelerated Repayment Strategy:* ${selectedStrategy === "avalanche" ? "Avalanche (High Interest rate first)" : "Snowball (Lowest Balance first)"}
*Time Saved to Debt-Free:* ${monthsSaved} Months
*Total Interest Saved:* ₹${interestSaved.toLocaleString("en-IN")}

Design your custom debt-prepayment roadmap instantly: ${currentUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  const downloadPDFReport = () => {
    if (debts.length === 0) return;

    const totalDebtAmount = debts.reduce((sum, d) => sum + d.balance, 0);

    const activeDebtsList = debts.filter(d => d.active !== false).map((d) => ({
      label: `${d.name} (${d.interestRate}% interest)`,
      value: `Balance: INR ${d.balance.toLocaleString("en-IN")} | Min EMI: INR ${d.minimumMonthlyPayment.toLocaleString("en-IN")}`
    }));

    generatePDFReport({
      title: "Debt Repayment & Freedom Plan",
      subtitle: "Accelerated debt reduction roadmap & payoff comparison",
      sections: [
        {
          title: "Current Debt Profile Matrix",
          items: [
            { label: "Total Active Debt Accounts", value: `${debts.filter(d => d.active !== false).length} Accounts` },
            { label: "Total Outstanding Principal Owed", value: `INR ${totalDebtAmount.toLocaleString("en-IN")}` },
            { label: "Total Minimum Monthly EMIs Due", value: `INR ${totalMinEmi.toLocaleString("en-IN")}` },
            { label: "Gross Monthly Income Level", value: `INR ${monthlySalary.toLocaleString("en-IN")}` },
            { label: "Current Debt-to-Income (DTI / FOIR) Ratio", value: `${foirRatio.toFixed(1)}% (${foirMeta.text})` }
          ]
        },
        {
          title: "Debt Breakdown",
          items: activeDebtsList
        },
        {
          title: "Prepayment Strategy Comparison",
          items: [
            { label: "Selected Acceleration Strategy", value: selectedStrategy === "avalanche" ? "Avalanche (High Interest rate first)" : "Snowball (Lowest Balance first)" },
            { label: "Additional Monthly Prepayment Added", value: `INR ${extraMonthlyPayment.toLocaleString("en-IN")}` },
            { label: "Rolling Paid-off EMIs (Rollover Effect)", value: snowballRolloverEnabled ? "Enabled (Recommended)" : "Disabled" },
            { label: "Months Saved to Zero-Debt State", value: `${monthsSaved} Months` },
            { label: "Estimated Compound Interest Saved", value: `INR ${interestSaved.toLocaleString("en-IN")}` },
            { label: "Revised Timeframe to Debt-Free State", value: `${strategyMonths} Months` }
          ]
        }
      ],
      notes: [
        "The Debt Avalanche strategy prioritizes high-interest-rate loans first, mathematically saving the maximum amount of compounding interest.",
        "The Debt Snowball strategy prioritizes low-balance accounts first, giving quick psychological victories to build momentum.",
        "Rolling over paid-off EMI amounts into active debt targets acts as an exponential catalyst to accelerate your timeline to debt freedom."
      ]
    });
  };

  return (
    <div id="debt-repayment-planner-app" className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden transition-all duration-300">
      
      {/* Premium Header */}
      <div className="relative overflow-hidden bg-radial-gradient p-6 sm:p-8 border-b border-purple-50 dark:border-purple-950/40">
        <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl" />
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-purple-50 dark:bg-purple-950/55 px-3 py-1 rounded-full border border-purple-100 dark:border-purple-900/30 text-purple-600 dark:text-purple-400 font-extrabold text-[10px] uppercase tracking-wider mb-2">
              <CreditCard className="w-3.5 h-3.5" />
              Debt Optimizer
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Debt Freedom Planner
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
              Accelerate your debt payoff schedules. Compare the <strong className="text-purple-600 dark:text-purple-400">Avalanche</strong> and <strong className="text-purple-600 dark:text-purple-400">Snowball</strong> techniques to wipe out EMIs with smart prepayments.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={downloadPDFReport}
              disabled={debts.length === 0}
              className="bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 active:scale-95 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all border-0 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            >
              <FileDown className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={shareToWhatsApp}
              disabled={debts.length === 0}
              className="bg-[#25D366] hover:bg-[#20ba5a] active:scale-95 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl flex items-center justify-center gap-2 transition-all border-0 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            >
              <Share2 className="w-4 h-4" />
              <span>Share on WhatsApp</span>
            </button>
            <button
              onClick={saveToLocker}
              disabled={debts.length === 0 || isSaving}
              className={`font-bold text-xs px-3.5 py-1.5 rounded-xl flex items-center justify-center gap-2 transition-all border-0 cursor-pointer disabled:opacity-50 disabled:pointer-events-none ${
                saveStatus === "success" 
                  ? "bg-emerald-600 text-white" 
                  : saveStatus === "error" 
                    ? "bg-rose-600 text-white" 
                    : "bg-purple-600 hover:bg-purple-700 text-white"
              }`}
            >
              {isSaving ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCircle className="w-3.5 h-3.5" />
              )}
              <span>
                {saveStatus === "success" 
                  ? "Saved!" 
                  : saveStatus === "error" 
                    ? "Error" 
                    : "Save Plan"}
              </span>
            </button>
            <button
              onClick={handleResetToProfile}
              className="bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 transition-all cursor-pointer shadow-3xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reload from Profile
            </button>
          </div>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex border-b border-slate-100 dark:border-slate-800/60 px-4 sm:px-6 bg-slate-50/50 dark:bg-slate-900/10">
        <button
          onClick={() => setActiveTab("strategy")}
          className={`px-4 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 -mb-[1px] ${
            activeTab === "strategy"
              ? "border-purple-600 text-purple-600 dark:text-purple-400 font-extrabold"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
          }`}
        >
          <TrendingDown className="w-4 h-4" />
          Payoff Optimizer
        </button>
        <button
          onClick={() => setActiveTab("customizer")}
          className={`px-4 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 -mb-[1px] ${
            activeTab === "customizer"
              ? "border-purple-600 text-purple-600 dark:text-purple-400 font-extrabold"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
          }`}
        >
          <Plus className="w-4 h-4" />
          Edit & Add Debts ({debts.length})
        </button>
        <button
          onClick={() => setActiveTab("ifin")}
          className={`px-4 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 -mb-[1px] ${
            activeTab === "ifin"
              ? "border-purple-600 text-purple-600 dark:text-purple-400 font-extrabold"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          iFIN Index & Leverage
        </button>
        <button
          onClick={() => setActiveTab("faq")}
          className={`px-4 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 -mb-[1px] ${
            activeTab === "faq"
              ? "border-purple-600 text-purple-600 dark:text-purple-400 font-extrabold"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          Debt Mechanics FAQ
        </button>
      </div>

      {/* Main Panel Content */}
      <div className="p-6">
        
        {/* FOIR Risk Banner (Present on all views for financial advice context) */}
        <div className="mb-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex gap-3">
            <div className="p-2.5 h-10 w-10 flex items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 shrink-0">
              <Gauge className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="text-xs font-black text-slate-800 dark:text-white flex items-center gap-2">
                Monthly Debt Burn Ratio (DTI / FOIR)
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${foirMeta.color}`}>
                  {foirMeta.text}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-400 mt-1">
                {foirMeta.advice}
              </p>
            </div>
          </div>
          <div className="text-right shrink-0 border-t md:border-t-0 border-slate-200 dark:border-slate-800 pt-3 md:pt-0 flex flex-col items-end">
            <div className="text-[10px] font-bold text-slate-400">Total EMIs Balance</div>
            <div className="text-lg font-black text-slate-800 dark:text-white mt-0.5 flex items-center justify-end gap-1.5 flex-wrap">
              <span>{formattedCurrency(totalMinEmi)}</span>
              <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-700 rounded px-2 py-0.5 shadow-3xs" title="Customize Gross Monthly Salary">
                <span className="text-slate-400 text-xs font-semibold">/ ₹</span>
                <input
                  type="text"
                  value={useCustomSalary ? customSalaryStr : monthlySalary.toString()}
                  onChange={(e) => {
                    const original = e.target.value;
                    const sanitized = original.replace(/[^0-9]/g, "");
                    setCustomSalaryStr(sanitized);
                    setUseCustomSalary(true);
                    if (sanitized !== "") {
                      setCustomSalary(Number(sanitized));
                    } else {
                      setCustomSalary(0);
                    }
                  }}
                  className="w-16 bg-transparent text-right font-black text-purple-600 dark:text-purple-400 focus:outline-none text-xs p-0 border-0"
                />
                <span className="text-[9px] font-black uppercase text-slate-500">salary</span>
              </div>
            </div>
            <div className="text-[8px] text-slate-400 mt-1 font-semibold italic">Gross Monthly Salary (Type to customize)</div>
          </div>
        </div>

        {/* Tab: Repayment Strategy Simulator */}
        {activeTab === "strategy" && (
          <div className="space-y-6">
            
            {/* Strategy Select & Prepay Budget */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Extra Payment Input */}
              <div className="bg-purple-50/40 dark:bg-purple-950/10 rounded-2xl p-4 border border-purple-100/40 dark:border-purple-950/20">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-350 mb-2">
                  <span className="flex items-center gap-1.5 text-purple-800 dark:text-purple-400">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    Custom Extra Prepayment (₹ / Month)
                  </span>
                  <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-900/40 rounded px-2 py-1 shadow-2xs focus-within:ring-1 focus-within:ring-purple-500">
                    <span className="text-slate-400 text-xs font-semibold">₹</span>
                    <input
                      type="text"
                      id="extra-prepayment-man-input"
                      value={extraMonthlyPaymentStr}
                      onChange={(e) => handleExtraPaymentStrChange(e.target.value)}
                      className="w-20 bg-transparent text-right font-black text-purple-600 dark:text-purple-400 focus:outline-none text-xs p-0 border-0"
                    />
                  </div>
                </div>
                
                <input
                  type="range"
                  id="extra-prepayment-slider"
                  min="0"
                  max="100000"
                  step="1000"
                  value={extraMonthlyPayment}
                  onChange={(e) => handleExtraPaymentChange(Number(e.target.value))}
                  className="w-full accent-purple-600 cursor-pointer mt-2"
                />
                
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                  <span>₹0 (Min Only)</span>
                  <span className="text-purple-600 dark:text-purple-400 font-bold">Recommended: {formattedCurrency(Math.max(5000, Math.round(monthlySalary * 0.15)))}</span>
                  <span>₹1,00,000</span>
                </div>
              </div>

              {/* Strategy Cards */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSelectedStrategy("avalanche")}
                  className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                    selectedStrategy === "avalanche"
                      ? "border-purple-500 bg-purple-50/30 dark:bg-purple-950/20 ring-1 ring-purple-500"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-350"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-black text-slate-900 dark:text-white">Debt Avalanche</span>
                    <span className="bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[8px] font-black uppercase px-1.5 py-0.5 rounded">
                      Mathematical Win
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Target maximum interest rates first. Saves the absolute highest interest over time.
                  </p>
                </button>

                <button
                  onClick={() => setSelectedStrategy("snowball")}
                  className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                    selectedStrategy === "snowball"
                      ? "border-purple-500 bg-purple-50/30 dark:bg-purple-950/20 ring-1 ring-purple-500"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-350"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-black text-slate-900 dark:text-white">Debt Snowball</span>
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[8px] font-black uppercase px-1.5 py-0.5 rounded">
                      Psychological Win
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Target smallest balances first. Builds quick mental momentum as accounts get wiped out.
                  </p>
                </button>
              </div>

            </div>

            {/* Snowball Effect Rollover Toggle card */}
            <div className="p-4 rounded-2xl border border-amber-200/60 dark:border-amber-950/40 bg-amber-500/5 dark:bg-amber-950/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-sans shadow-3xs">
              <div className="flex gap-3">
                <div className="p-2.5 h-10 w-10 flex items-center justify-center rounded-xl bg-amber-100/60 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 shrink-0">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-800 dark:text-white flex items-center gap-1.5 uppercase tracking-wide">
                    Snowball Effect (Payment Rollover)
                    <span className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[8px] font-black uppercase px-1.5 py-0.5 rounded">
                      Accelerated Path
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                    When any loan is paid off, its minimum monthly payment (EMI) gets freed up. With this toggle active, that full "saved amount" is automatically directed to accelerate paying off the remaining debt with the <strong>highest interest rate</strong> representing high compounding returns.
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-850 justify-end">
                <span className={`text-xs font-black uppercase tracking-wider transition-colors ${snowballRolloverEnabled ? "text-amber-600 dark:text-amber-450" : "text-slate-400"}`}>
                  {snowballRolloverEnabled ? "Enabled" : "Disabled"}
                </span>
                <button
                  onClick={() => setSnowballRolloverEnabled(!snowballRolloverEnabled)}
                  className={`w-12 h-6.5 rounded-full p-1 transition-all duration-300 focus:outline-none flex cursor-pointer ${
                    snowballRolloverEnabled ? "bg-amber-500 justify-end" : "bg-slate-300 dark:bg-slate-700 justify-start"
                  }`}
                  aria-label="Toggle Snowball Effect Rollover"
                >
                  <span className="w-4.5 h-4.5 rounded-full bg-white shadow-md transition-all duration-300" />
                </button>
              </div>
            </div>

            {/* Strategy Analytics Block */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              <div className="bg-slate-55 dark:bg-slate-950/50 p-4 border border-slate-100 dark:border-slate-850 rounded-2xl flex items-center gap-3">
                <div className="p-2.5 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-xl">
                  <CheckCircle className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500">Freedom Timeline</div>
                  <div className="text-base font-black text-slate-900 dark:text-white mt-1">
                    {strategyMonths === 360 ? "30+ Years / Slow" : `${strategyMonths} Months`}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 font-bold">
                    {monthsSaved > 0 ? `Saved ${monthsSaved} months!` : "Doing Minimum Pays Only"}
                  </div>
                </div>
              </div>

              <div className="bg-slate-55 dark:bg-slate-950/50 p-4 border border-slate-100 dark:border-slate-850 rounded-2xl flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
                  <TrendingDown className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500">Total Interest to Pay</div>
                  <div className="text-base font-black text-slate-900 dark:text-white mt-1">
                    {formattedCurrency(strategyInterest)}
                  </div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-black">
                    {interestSaved > 0 ? `Saved ${formattedCurrency(interestSaved)}!` : "No prepayment benefits"}
                  </div>
                </div>
              </div>

              <div className="bg-slate-55 dark:bg-slate-950/50 p-4 border border-slate-100 dark:border-slate-850 rounded-2xl flex items-center gap-3">
                <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500">Total Paid Over Lifetime</div>
                  <div className="text-base font-black text-slate-900 dark:text-white mt-1">
                    {formattedCurrency(debts.reduce((sum, d) => sum + d.balance, 0) + strategyInterest)}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Principal + Accrued Interest
                  </div>
                </div>
              </div>

            </div>

            {/* Custom SVG payoff trajectory chart */}
            <div className="bg-slate-50 dark:bg-slate-950 p-4 border border-slate-100 dark:border-slate-800 rounded-2xl">
              <h3 className="text-xs font-black text-slate-800 dark:text-white mb-4 flex items-center gap-1.5 uppercase font-sans tracking-wide">
                <TrendingDown className="w-4 h-4 text-purple-600" />
                Remaining Debt Trajectory (Selected Strategy vs. Minimum Pays)
              </h3>

              {chosenStrategyData.schedule.length > 0 ? (
                <div className="h-44 w-full relative">
                  {/* SVG Chart Trajectory */}
                  <svg className="w-full h-full" viewBox="0 0 400 120" preserveAspectRatio="none">
                    {/* Trajectory GridLines */}
                    <line x1="0" y1="10" x2="400" y2="10" stroke="rgba(148, 163, 184, 0.15)" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1="0" y1="60" x2="400" y2="60" stroke="rgba(148, 163, 184, 0.15)" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1="0" y1="110" x2="400" y2="110" stroke="rgba(148, 163, 184, 0.15)" strokeWidth="1" strokeDasharray="3 3" />

                    {/* Minimum Payments Only line (Red/Amber trajectory) */}
                    {(() => {
                      const minSchedule = simulationResults.minOnly.schedule;
                      if (minSchedule.length < 2) return null;
                      const maxSimMonths = Math.max(1, simulationResults.minOnly.months, chosenStrategyData.months);
                      const maxSimDebt = Math.max(1, minSchedule[0]?.totalRemaining || 1);

                      const points = minSchedule.map((pt) => {
                        const x = (pt.month / maxSimMonths) * 400;
                        const y = 110 - (pt.totalRemaining / maxSimDebt) * 100;
                        return `${x},${y}`;
                      }).join(" ");

                      return (
                        <polyline
                          fill="none"
                          stroke="#ef4444"
                          strokeWidth="2"
                          strokeDasharray="4 2"
                          points={points}
                        />
                      );
                    })()}

                    {/* Selected Active Strategy line (Solid Violet Line) */}
                    {(() => {
                      const activeSchedule = chosenStrategyData.schedule;
                      if (activeSchedule.length < 2) return null;
                      const maxSimMonths = Math.max(1, simulationResults.minOnly.months, chosenStrategyData.months);
                      const maxSimDebt = Math.max(1, activeSchedule[0]?.totalRemaining || 1);

                      const points = activeSchedule.map((pt) => {
                        const x = (pt.month / maxSimMonths) * 400;
                        const y = 110 - (pt.totalRemaining / maxSimDebt) * 100;
                        return `${x},${y}`;
                      }).join(" ");

                      return (
                        <>
                          <polyline
                            fill="none"
                            stroke="#8b5cf6"
                            strokeWidth="3.5"
                            points={points}
                          />
                          {/* Shaded Area */}
                          <polygon
                            fill="url(#violet-gradient-fill)"
                            opacity="0.1"
                            points={`0,110 ${points} 400,110`}
                          />
                        </>
                      );
                    })()}

                    {/* Gradients */}
                    <defs>
                      <linearGradient id="violet-gradient-fill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>

                  {/* Trajectory Labels */}
                  <div className="absolute top-1 right-2 text-[8px] font-mono text-slate-400 bg-white/70 dark:bg-slate-900/60 p-1 rounded border border-slate-100 dark:border-slate-800">
                    <span className="inline-block w-2.5 h-1.5 bg-red-500 mr-1" /> Minimum Only (Proj. Timeline: {minOnlyMonths} months)
                    <br />
                    <span className="inline-block w-2.5 h-1.5 bg-purple-600 mr-1 mt-1" /> {selectedStrategy === "avalanche" ? "Avalanche" : "Snowball"} (Proj. Timeline: {strategyMonths} months)
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-slate-400">
                  No active debts to map. Enter some remaining balances.
                </div>
              )}
              
              <div className="flex justify-between text-[9px] text-slate-400 mt-2 font-mono">
                <span>Month 0</span>
                <span>Debt Paydown Progress Timeline</span>
                <span>Month {Math.max(12, simulationResults.minOnly.months, chosenStrategyData.months)}</span>
              </div>
            </div>

            {/* Interactive Debt Payoff Progress Visualizer */}
            {chosenStrategyData.schedule.length > 0 && (
              <div className="bg-slate-50 dark:bg-slate-950 p-6 border border-slate-100 dark:border-slate-800/80 rounded-3xl space-y-6 font-sans">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-purple-600 animate-pulse" />
                      Dynamic Debt Payoff Simulator & Progress Visual
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
                      Slide through the months to see how your active loans shrink block-by-block under the <span className="text-purple-600 dark:text-purple-400 font-extrabold uppercase">{selectedStrategy}</span> strategy with prepayments.
                    </p>
                  </div>
                  
                  {/* Monthly balance indicator */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 px-4 py-2.5 rounded-2xl shrink-0 flex items-center gap-3.5 shadow-3xs">
                    <div className="text-right">
                      <div className="text-[9px] uppercase font-bold text-slate-400">Total remaining balance</div>
                      <div className="text-base font-black text-rose-500 mt-0.5">
                        {(() => {
                          const pt = chosenStrategyData.schedule.find(p => p.month === timelineMonth) || chosenStrategyData.schedule[chosenStrategyData.schedule.length - 1];
                          return formattedCurrency(pt?.totalRemaining ?? 0);
                        })()}
                      </div>
                    </div>
                    <div className="border-l border-slate-100 dark:border-slate-800 pl-3.5 text-center">
                      <div className="text-[9px] uppercase font-bold text-slate-400">Timeline Month</div>
                      <div className="text-lg font-black text-purple-600 dark:text-purple-400 mt-0.5">
                        M{timelineMonth}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timeline Scrubber Card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 p-5 rounded-2xl shadow-3xs space-y-4">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-350 font-sans">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-purple-600" />
                      Interactive Timeline Scrubber
                    </span>
                    <span className="text-slate-400 text-[10px] font-mono">
                      Step: Month {timelineMonth} of {chosenStrategyData.months}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <button
                      disabled={timelineMonth === 0}
                      onClick={() => setTimelineMonth(m => Math.max(0, m - 1))}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-sans font-bold flex items-center justify-center disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
                      title="Previous Month"
                    >
                      ← M-1
                    </button>

                    <input
                      type="range"
                      min="0"
                      max={chosenStrategyData.months}
                      value={timelineMonth}
                      onChange={(e) => setTimelineMonth(Number(e.target.value))}
                      className="flex-1 accent-purple-600 cursor-pointer h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none"
                    />

                    <button
                      disabled={timelineMonth >= chosenStrategyData.months}
                      onClick={() => setTimelineMonth(m => Math.min(chosenStrategyData.months, m + 1))}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-sans font-bold flex items-center justify-center disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
                      title="Next Month"
                    >
                      M+1 →
                    </button>
                  </div>

                  <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                    <span>Month 0 (Initial)</span>
                    <span className="text-purple-600 dark:text-purple-400 font-bold bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-full">
                      Showing month {timelineMonth} status
                    </span>
                    <span>Month {chosenStrategyData.months} (Debt-free!)</span>
                  </div>
                </div>

                {/* Segmented Proportional Allocation Bar */}
                <div className="space-y-2">
                  <div className="text-[10px] uppercase font-black tracking-wider text-slate-400 flex items-center justify-between font-sans">
                    <span>Owed Balances Allocation Split</span>
                    <span className="text-slate-500 font-mono">M{timelineMonth} weight visual</span>
                  </div>
                  
                  {(() => {
                    const pt = chosenStrategyData.schedule.find(p => p.month === timelineMonth) || chosenStrategyData.schedule[chosenStrategyData.schedule.length - 1];
                    const ptBalances = pt?.balances ?? {};
                    const totalRemaining = pt?.totalRemaining ?? 0;

                    if (totalRemaining === 0) {
                      return (
                        <div className="w-full h-6 bg-emerald-500 rounded-full flex items-center justify-center text-[10px] text-white font-extrabold uppercase tracking-widest shadow-2xs animate-pulse">
                          🎉 Fully Sovereign & Debt-Free! 🎉
                        </div>
                      );
                    }

                    const activeDebtsForMonth = debts
                      .filter(d => d.active !== false)
                      .map((debt) => ({
                        id: debt.id,
                        name: debt.name,
                        balance: ptBalances[debt.id] ?? 0
                      }));

                    return (
                      <div className="w-full h-4 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden flex shadow-inner">
                        {activeDebtsForMonth.map((item, idx) => {
                          const percentage = totalRemaining > 0 ? (item.balance / totalRemaining) * 100 : 0;
                          if (percentage === 0) return null;
                          const colorClass = DEBT_COLORS[idx % DEBT_COLORS.length];
                          return (
                            <div
                              key={item.id}
                              className={`h-full ${colorClass} transition-all duration-300 first:rounded-l-full last:rounded-r-full hover:brightness-105 cursor-help border-r last:border-0 border-white/10`}
                              style={{ width: `${percentage}%` }}
                              title={`${item.name}: ${formattedCurrency(Math.round(item.balance))} (${Math.round(percentage)}%)`}
                            />
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>

                {/* Grid of Dynamic Shrinking Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(() => {
                    const pt = chosenStrategyData.schedule.find(p => p.month === timelineMonth) || chosenStrategyData.schedule[chosenStrategyData.schedule.length - 1];
                    const ptBalances = pt?.balances ?? {};
                    const initialPt = chosenStrategyData.schedule[0];
                    const initialPtBalances = initialPt?.balances ?? {};

                    return debts
                      .filter(d => d.active !== false)
                      .map((debt, idx) => {
                        const originalBal = initialPtBalances[debt.id] || debt.balance;
                        const remainingBal = ptBalances[debt.id] ?? 0;
                        const isPaid = remainingBal <= 0;
                        const paidOffPercentage = originalBal > 0 
                          ? Math.round(((originalBal - remainingBal) / originalBal) * 100)
                          : 100;

                        const colorClass = DEBT_COLORS[idx % DEBT_COLORS.length];
                        const textClass = DEBT_COLOR_TEXTS[idx % DEBT_COLORS.length];

                        return (
                          <div 
                            key={debt.id} 
                            className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                              isPaid 
                                ? "bg-emerald-500/5 border-emerald-500/20 dark:border-emerald-500/10 opacity-75 animate-fade-in" 
                                : "bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800 hover:shadow-xs"
                            }`}
                          >
                            <div>
                              <div className="flex justify-between items-start gap-1.5">
                                <span className="text-xs font-black text-slate-800 dark:text-white flex items-center gap-1.5">
                                  <span className={`w-2.5 h-2.5 rounded-full ${colorClass}`} />
                                  {debt.name}
                                </span>
                                {isPaid ? (
                                  <span className="bg-emerald-50 dark:bg-emerald-950/45 text-emerald-700 dark:text-emerald-300 text-[8px] font-black uppercase px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-900">
                                    Paid Off 🎉
                                  </span>
                                ) : (
                                  <span className="bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[8px] font-mono font-black uppercase px-1.5 py-0.5 rounded">
                                    {debt.interestRate}% Int
                                  </span>
                                )}
                              </div>

                              <div className="mt-3.5 flex justify-between items-baseline">
                                <div className="text-[9px] uppercase font-bold text-slate-400">Remaining Balance</div>
                                <div className={`text-base font-black ${isPaid ? "text-emerald-600 dark:text-emerald-450 line-through" : "text-slate-900 dark:text-white"}`}>
                                  {formattedCurrency(remainingBal)}
                                </div>
                              </div>

                              {/* Progress bar and numeric tracking */}
                              <div className="mt-3 space-y-1">
                                <div className="flex justify-between items-center text-[9px] text-slate-400 font-mono">
                                  <span>{paidOffPercentage}% Paid Down</span>
                                  <span>Orig: {formattedCurrency(originalBal)}</span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full transition-all duration-300 ${isPaid ? "bg-emerald-500" : colorClass}`} 
                                    style={{ width: `${paidOffPercentage}%` }} 
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="mt-4 pt-2.5 border-t border-slate-50 dark:border-slate-800/80 flex justify-between text-[10px] text-slate-400">
                              <span>Min EMI: {formattedCurrency(debt.minimumMonthlyPayment)}</span>
                              {!isPaid && (
                                <span className={`font-semibold ${textClass}`}>
                                  Active Drag
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      });
                  })()}
                </div>
              </div>
            )}

            {/* List of active debts with repayment breakdown */}
            <div>
              <h3 className="text-xs font-black text-slate-800 dark:text-white mb-3 flex items-center gap-1.5 uppercase font-sans tracking-wide">
                <Coins className="w-4 h-4 text-purple-600" />
                Current Liability Breakdown ({debts.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-450 text-[10px] uppercase font-bold tracking-wider">
                      <th className="py-2.5 px-3 w-16">Include</th>
                      <th className="py-2.5 px-3">Debt Name</th>
                      <th className="py-2.5 px-3 text-right">Remaining Principal</th>
                      <th className="py-2.5 px-3 text-right">Interest Rate (Annual)</th>
                      <th className="py-2.5 px-3 text-right">Min Monthly (EMI)</th>
                      <th className="py-2.5 px-3 text-right">Calculated Payoff Priority</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...debts]
                      .sort((a, b) => {
                        const aActive = a.active !== false;
                        const bActive = b.active !== false;
                        if (aActive !== bActive) {
                          return aActive ? -1 : 1;
                        }
                        if (selectedStrategy === "avalanche") {
                          return b.interestRate - a.interestRate; // Highest rate priority
                        } else {
                          return a.balance - b.balance; // Smallest balance priority
                        }
                      })
                      .map((debt) => {
                        const isDebtActive = debt.active !== false;
                        const sortedActiveDebts = [...debts]
                          .filter(d => d.active !== false)
                          .sort((a, b) => {
                            if (selectedStrategy === "avalanche") {
                              return b.interestRate - a.interestRate;
                            } else {
                              return a.balance - b.balance;
                            }
                          });
                        const activeIndex = sortedActiveDebts.findIndex(d => d.id === debt.id);

                        return (
                          <tr key={debt.id} className={`border-b border-slate-50 dark:border-slate-900 hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-all ${
                            !isDebtActive ? "opacity-40 bg-slate-50/50 dark:bg-slate-900/10 animate-fade-in" : ""
                          }`}>
                            <td className="py-3 px-3">
                              <input
                                type="checkbox"
                                checked={isDebtActive}
                                onChange={() => {
                                  setDebts(prev => prev.map(d => {
                                    if (d.id === debt.id) {
                                      return { ...d, active: !isDebtActive };
                                    }
                                    return d;
                                  }));
                                }}
                                className="w-4 h-4 text-purple-600 rounded bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 focus:ring-purple-500 cursor-pointer accent-purple-600"
                              />
                            </td>
                            <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">
                              {debt.name}
                              {!isDebtActive && (
                                <span className="text-[9px] font-medium text-slate-400 dark:text-slate-500 ml-1.5 italic">
                                  (Sim Excluded)
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                              {formattedCurrency(debt.balance)}
                            </td>
                            <td className="py-3 px-3 text-right font-mono font-bold text-purple-600 dark:text-purple-400">
                              {debt.interestRate}%
                            </td>
                            <td className="py-3 px-3 text-right font-mono">
                              {formattedCurrency(debt.minimumMonthlyPayment)}
                            </td>
                            <td className="py-3 px-3 text-right">
                              {isDebtActive ? (
                                <span className={`inline-block text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                                  activeIndex === 0 
                                    ? "bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900" 
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                                }`}>
                                  {activeIndex === 0 ? "🔥 Primary payoff target" : `Priority #${activeIndex + 1}`}
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-400 italic">Excluded</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Indian Specific Advice on Accelerated Prepayments */}
            <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex gap-3 text-xs leading-relaxed">
              <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-800 dark:text-amber-300 font-extrabold">Accelerated Prepayment Rule of thumb:</strong> In India, adding just <strong className="text-amber-700 dark:text-amber-400">one extra EMI prepayment every year</strong> (or routing ~10% extra each month as extra payment) on a 20-year home loan can reduce your overall principal duration to 15 years, saving you up to 5-10 lakhs in long-term compound interest charges. Act on credit cards first, as card roll-overs compound daily at ~42%!
              </div>
            </div>

          </div>
        )}

        {/* Tab: Customize & Add Debts Form */}
        {activeTab === "customizer" && (
          <div className="space-y-8">
            
            {/* Form to Add New Debt Liability */}
            <div>
              <h3 className="text-xs font-black text-slate-800 dark:text-white mb-3 uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-purple-600" />
                Add New Loan or Credit Obligation
              </h3>
              
              <form onSubmit={handleAddDebt} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-slate-50 dark:bg-slate-950 p-4 border border-slate-100 dark:border-slate-800/80 rounded-2xl">
                
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                    Debt / Account Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newDebtName}
                    onChange={(e) => setNewDebtName(e.target.value)}
                    placeholder="e.g. SBI Education Loan"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-purple-500 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                    Owed Principal (₹)
                  </label>
                  <input
                    type="text"
                    required
                    value={newDebtBalanceStr}
                    onChange={(e) => {
                      const original = e.target.value;
                      const sanitized = original.replace(/[^0-9]/g, "");
                      setNewDebtBalanceStr(sanitized);
                      if (sanitized !== "") {
                        setNewDebtBalance(Number(sanitized));
                      }
                    }}
                    placeholder="50000"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-purple-500 text-right dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                    Interest Rate (Annual %)
                  </label>
                  <input
                    type="text"
                    required
                    value={newDebtRateStr}
                    onChange={(e) => {
                      const original = e.target.value;
                      const sanitized = original.replace(/[^0-9.]/g, "");
                      const parts = sanitized.split(".");
                      const finalVal = parts.length > 2 ? parts[0] + "." + parts.slice(1).join("") : sanitized;
                      setNewDebtRateStr(finalVal);
                      if (finalVal !== "" && finalVal !== ".") {
                        setNewDebtRate(Number(finalVal));
                      }
                    }}
                    placeholder="12"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-purple-500 text-right dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                    Min Monthly Payment (₹)
                  </label>
                  <input
                    type="text"
                    required
                    value={newDebtMinEmiStr}
                    onChange={(e) => {
                      const original = e.target.value;
                      const sanitized = original.replace(/[^0-9]/g, "");
                      setNewDebtMinEmiStr(sanitized);
                      if (sanitized !== "") {
                        setNewDebtMinEmi(Number(sanitized));
                      }
                    }}
                    placeholder="1500"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-purple-500 text-right dark:text-white font-mono"
                  />
                </div>

                <div className="md:col-span-4 flex justify-end">
                  <button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-700 active:scale-[0.98] text-white font-extrabold px-5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Add Debt to Strategy
                  </button>
                </div>

              </form>
            </div>

            {/* Existing Debts Editing Panel */}
            <div>
              <h3 className="text-xs font-black text-slate-800 dark:text-white mb-3 uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-purple-600" />
                Manually Adjust Existing Debts Outstanding ({debts.length})
              </h3>
              
              <div className="space-y-6">
                {debts.map((debt) => {
                  const isDebtActive = debt.active !== false;
                  return (
                    <div 
                      key={debt.id} 
                      className={`p-4 rounded-2xl border ${isDebtActive ? "border-slate-200 dark:border-slate-800/80" : "border-slate-100 dark:border-slate-900 opacity-60 bg-slate-50/20"} bg-white dark:bg-slate-900 shadow-3xs transition-all`}
                    >
                      <div className="flex justify-between items-center mb-3 text-xs">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isDebtActive}
                            onChange={() => {
                              setDebts(prev => prev.map(d => {
                                if (d.id === debt.id) {
                                  return { ...d, active: !isDebtActive };
                                }
                                return d;
                              }));
                            }}
                            className="w-4 h-4 text-purple-600 rounded bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 focus:ring-purple-500 cursor-pointer accent-purple-600"
                          />
                          <input
                            type="text"
                            value={debt.name}
                            onChange={(e) => handleUpdateDebtField(debt.id, "name", e.target.value)}
                            className="font-black text-slate-900 dark:text-white text-xs bg-slate-50 dark:bg-slate-800/40 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-purple-500 border border-transparent"
                          />
                          {!isDebtActive && (
                            <span className="text-[10px] text-slate-400 italic">Excluded</span>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteDebt(debt.id)}
                          className="p-1.5 hover:bg-red-50 hover:text-red-650 rounded-lg text-slate-400 cursor-pointer transition-colors"
                          title="Delete this debt"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        
                        {/* Principal Input */}
                        <div>
                          <div className="flex justify-between text-[11px] font-semibold text-slate-550 mb-1.5">
                            <span>Principal Balance :</span>
                            <div className="flex items-center gap-0.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 text-[10px]">
                              <span className="text-slate-400 font-bold">₹</span>
                              <input
                                type="text"
                                value={debt.balanceStr}
                                onChange={(e) => handleUpdateDebtField(debt.id, "balance", e.target.value)}
                                className="w-16 bg-transparent text-right font-black text-purple-600 dark:text-purple-400 focus:outline-none"
                              />
                            </div>
                          </div>
                          <input
                            type="range"
                            min="1000"
                            max="5000000"
                            step="5000"
                            value={debt.balance}
                            onChange={(e) => handleUpdateDebtSlider(debt.id, "balance", Number(e.target.value))}
                            className="w-full accent-purple-600 cursor-pointer"
                          />
                        </div>

                        {/* Rate Input */}
                        <div>
                          <div className="flex justify-between text-[11px] font-semibold text-slate-550 mb-1.5">
                            <span>Interest Rate :</span>
                            <div className="flex items-center gap-0.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 text-[10px]">
                              <input
                                type="text"
                                value={debt.interestRateStr}
                                onChange={(e) => handleUpdateDebtField(debt.id, "interestRate", e.target.value)}
                                className="w-12 bg-transparent text-right font-black text-purple-600 dark:text-purple-400 focus:outline-none"
                              />
                              <span className="text-slate-400 font-bold">%</span>
                            </div>
                          </div>
                          <input
                            type="range"
                            min="5"
                            max="45"
                            step="0.1"
                            value={debt.interestRate}
                            onChange={(e) => handleUpdateDebtSlider(debt.id, "interestRate", Number(e.target.value))}
                            className="w-full accent-purple-600 cursor-pointer"
                          />
                        </div>

                        {/* Min Monthly EMI Input */}
                        <div>
                          <div className="flex justify-between text-[11px] font-semibold text-slate-550 mb-1.5">
                            <span>Min Monthly EMI :</span>
                            <div className="flex items-center gap-0.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 text-[10px]">
                              <span className="text-slate-400 font-bold">₹</span>
                              <input
                                type="text"
                                value={debt.minimumMonthlyPaymentStr}
                                onChange={(e) => handleUpdateDebtField(debt.id, "minimumMonthlyPayment", e.target.value)}
                                className="w-16 bg-transparent text-right font-black text-purple-600 dark:text-purple-400 focus:outline-none"
                              />
                            </div>
                          </div>
                          <input
                            type="range"
                            min="500"
                            max="250000"
                            step="500"
                            value={debt.minimumMonthlyPayment}
                            onChange={(e) => handleUpdateDebtSlider(debt.id, "minimumMonthlyPayment", Number(e.target.value))}
                            className="w-full accent-purple-600 cursor-pointer"
                          />
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* Tab: iFIN Index & Leverage Analysis */}
        {activeTab === "ifin" && (
          <div className="space-y-6">
            
            {/* Header / Intro Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-purple-500/5 to-transparent border border-amber-500/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl" />
              <div className="flex gap-4.5">
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-2xl shrink-0 h-12 w-12 flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider font-sans">
                    iFIN (Indian Financial Independence Number) Index
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    The <strong className="text-purple-600 dark:text-purple-400">iFIN Index</strong> measures your net worth (assets minus active debts) against your standard financial independence requirement (rule of 25x annual expenses). Outstanding loans act as a direct "drag factor" on your iFIN freedom status.
                  </p>
                </div>
              </div>
            </div>

            {/* Core Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Card 1: Assets vs Debt (The Leverage Meter) */}
              <div className="bg-slate-50/75 dark:bg-slate-950/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-850 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] uppercase font-black tracking-wider text-slate-400 flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-blue-500" /> Net Owed Leverage Ratio
                  </div>
                  <div className="mt-4 flex justify-between items-baseline">
                    <span className="text-xl font-black text-slate-900 dark:text-white">
                      {debtToAssetLeverageRatio}%
                    </span>
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                      debtToAssetLeverageRatio <= 10 
                        ? "bg-emerald-50 border-emerald-100 text-emerald-600"
                        : debtToAssetLeverageRatio <= 35
                        ? "bg-amber-50 border-amber-100 text-amber-600"
                        : "bg-red-50 border-red-100 text-red-600"
                    }`}>
                      {debtToAssetLeverageRatio <= 10 ? "Prudent" : debtToAssetLeverageRatio <= 35 ? "Moderate" : "Leveraged!"}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 leading-normal">
                    This represents your total active debt against total assets ({formattedCurrency(ifinAssets)}). Keeps debts under 10% of your total asset corpus to remain highly liquid and immune to credit market fluctuations.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-850 flex justify-between text-[11px] font-mono text-slate-500">
                  <span>Total Owed:</span>
                  <span className="font-extrabold text-slate-800 dark:text-slate-200">{formattedCurrency(totalActiveDebt)}</span>
                </div>
              </div>

              {/* Card 2: Financial Independence Target Configurer */}
              <div className="bg-slate-50/75 dark:bg-slate-950/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-850 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] uppercase font-black tracking-wider text-slate-400 flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-purple-500" /> iFIN Multiplier Goal
                  </div>
                  <div className="mt-4 flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1.5 rounded-xl">
                    <button
                      onClick={() => setIfinMultiplier(20)}
                      className={`flex-1 text-center text-[10px] font-extrabold py-1 rounded-lg transition-all ${
                        ifinMultiplier === 20 
                          ? "bg-amber-500 text-white" 
                          : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      Lean (20x)
                    </button>
                    <button
                      onClick={() => setIfinMultiplier(25)}
                      className={`flex-1 text-center text-[10px] font-extrabold py-1 rounded-lg transition-all ${
                        ifinMultiplier === 25 
                          ? "bg-purple-600 text-white" 
                          : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      Standard (25x)
                    </button>
                    <button
                      onClick={() => setIfinMultiplier(30)}
                      className={`flex-1 text-center text-[10px] font-extrabold py-1 rounded-lg transition-all ${
                        ifinMultiplier === 30 
                          ? "bg-indigo-600 text-white" 
                          : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      Safest (30x)
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2.5 leading-normal">
                    Adjusts your multiplier target. Standard FIRE calculates safe reserves as 25 times your annual expenses to safely live off a 4% standard annual asset withdrawal rate indefinitely.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-850 flex justify-between text-[11px] font-mono text-slate-500">
                  <span>FIN Target Corpus:</span>
                  <span className="font-extrabold text-purple-600 dark:text-purple-400">{formattedCurrency(ifinTarget)}</span>
                </div>
              </div>

              {/* Card 3: Debt Drag Statistics */}
              <div className="bg-slate-50/75 dark:bg-slate-950/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-850 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] uppercase font-black tracking-wider text-slate-400 flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-amber-500" /> Active Debt Impact Drag
                  </div>
                  <div className="mt-4 flex justify-between items-baseline">
                    <span className="text-xl font-black text-rose-600">
                      -{debtDragPercent}%
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">Goal Delay</span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 leading-normal">
                    Outstanding active debts of {formattedCurrency(totalActiveDebt)} directly reduce your net assets under management, subtracting exactly {debtDragPercent}% from your ultimate progress scorecard toward financial retirement.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-850 flex justify-between text-[11px] font-mono text-slate-500">
                  <span>Net Asset Value (Net Worth):</span>
                  <span className="font-extrabold text-slate-800 dark:text-slate-200">{formattedCurrency(ifinNetWorth)}</span>
                </div>
              </div>

            </div>

            {/* Visual iFIN Index Progress Bar / Gauge */}
            <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 font-sans">
              <h4 className="text-xs font-black text-slate-800 dark:text-white mb-4 uppercase tracking-wider flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-purple-600" /> Your Freedom Pathway Analyzer
              </h4>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
                <div>
                  <div className="text-[11px] text-slate-400 font-semibold">Current Debt-Adjusted Progress</div>
                  <div className="text-2xl font-black text-slate-850 dark:text-white mt-1 flex items-baseline gap-1.5">
                    <span>{ifinIndex}%</span>
                    <span className="text-xs text-slate-400 font-bold">of iFIN Goal</span>
                  </div>
                </div>
                
                <div className="md:text-right">
                  <div className="text-[11px] text-slate-400 font-semibold">Immediate Potential Index (Debt-free)</div>
                  <div className="text-lg font-black text-slate-800 dark:text-white mt-1 flex md:justify-end items-center gap-1">
                    <span className="text-emerald-600 font-black">{potentialIfinIndex}%</span>
                    <span className="text-[10px] italic text-emerald-500 font-bold">(+{debtDragPercent}% bump)</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar (Dual Stacked Segmented) */}
              <div className="space-y-1.5">
                <div className="w-full h-4 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden flex relative">
                  {/* Positive Net Worth bar (Green) */}
                  {ifinIndex > 0 && (
                    <div 
                      className="h-full bg-emerald-500 rounded-l-full transition-all duration-700" 
                      style={{ width: `${Math.min(100, ifinIndex)}%` }} 
                    />
                  )}
                  {/* Debt Drag bar representing negative correction (Amber/Rose striped) */}
                  {debtDragPercent > 0 && ifinIndex < 100 && (
                    <div 
                      className="h-full bg-rose-500/35 border-l border-white/20 transition-all duration-700" 
                      style={{ width: `${Math.min(100 - Math.max(0, ifinIndex), debtDragPercent)}%` }} 
                      title={`Debt drag adds ${debtDragPercent}% block`}
                    />
                  )}
                </div>
                <div className="flex justify-between text-[8px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                  <span>0% (Owed)</span>
                  <span>50% (Standard Half-FI)</span>
                  <span>100% (Independence Achieved)</span>
                </div>
              </div>

              {/* Current Slab Status Badge */}
              <div className="mt-5 p-3.5 rounded-xl bg-purple-500/5 border border-purple-500/10 flex items-center justify-between text-xs">
                <div className="flex gap-2">
                  <span className="text-purple-600 dark:text-purple-400">🚀</span>
                  <div>
                    <span className="font-extrabold text-slate-800 dark:text-slate-200">
                      Your Career Freedom Stage:{" "}
                    </span>
                    <strong className="text-purple-700 dark:text-purple-400 uppercase font-black tracking-wide">
                      {ifinIndex < 10 && "Debt Cage"}
                      {ifinIndex >= 10 && ifinIndex < 25 && "Financial Security Core"}
                      {ifinIndex >= 25 && ifinIndex < 50 && "Coast FIRE Pilot"}
                      {ifinIndex >= 50 && ifinIndex < 100 && "Emerging Independence Half-FI"}
                      {ifinIndex >= 100 && "Fully Sovereign (iFIN Achieved! 🎉)"}
                    </strong>
                  </div>
                </div>
                <div className="text-[10px] font-bold text-slate-400 max-w-xs text-right leading-tight">
                  {ifinIndex < 10 && "Focus intensely on clearing credit card debts and small loans. Your current debt makes up too high a percent of your total freedom reserves."}
                  {ifinIndex >= 10 && ifinIndex < 25 && "You have solid roots! Your financial foundations are emerging. Wiping out the remaining debts will act as solid fuel."}
                  {ifinIndex >= 25 && "Excellent progress. You can easily accelerate retirement by shifting more cash flow from minimum EMI obligations to compound equity indexes."}
                </div>
              </div>

            </div>

            {/* Freed EMIs - Shifting from Leverage to Compounding SIP Index */}
            <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-black text-slate-800 dark:text-white mb-3 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-5 h-5 text-emerald-600" /> Shifting Owed EMIs to Standard Index Compounding SIP
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-5">
                What happens if you clear these debts and redirect the freed minimum EMIs (<strong className="text-slate-750 dark:text-white">{formattedCurrency(freedMonthlyEMI)}</strong>) plus your extra pre-payment monthly budget (<strong className="text-slate-750 dark:text-white">{formattedCurrency(extraMonthlyPayment)}</strong>) directly into a compounding equity SIP plan? Supposing an average Indian benchmark index (e.g. Nifty 50 Index Mutual Fund) compounding at <strong className="text-purple-600 dark:text-purple-400">12% CAGR</strong>, here is your future cash reserve projections:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* 5 Years */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 p-4.5 rounded-2xl flex flex-col justify-between">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">In 5 Years</div>
                    <div className="text-lg font-black text-slate-900 dark:text-white mt-2">
                      {formattedCurrency(calculateSipFutureValue(freedMonthlyEMI + extraMonthlyPayment, 5, 12))}
                    </div>
                  </div>
                  <div className="text-[9px] text-emerald-600 dark:text-emerald-400 mt-2 font-mono">
                    Compounding ₹{(freedMonthlyEMI + extraMonthlyPayment).toLocaleString()}/Mo
                  </div>
                </div>

                {/* 10 Years */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 p-4.5 rounded-2xl flex flex-col justify-between">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">In 10 Years (Decade)</div>
                    <div className="text-lg font-black text-purple-600 dark:text-purple-400 mt-2">
                      {formattedCurrency(calculateSipFutureValue(freedMonthlyEMI + extraMonthlyPayment, 10, 12))}
                    </div>
                  </div>
                  <div className="text-[9px] text-purple-500 mt-2 font-mono">
                    Freedom catalyst SIP portfolio
                  </div>
                </div>

                {/* 15 Years */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 p-4.5 rounded-2xl flex flex-col justify-between text-yellow-600">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">In 15 Years</div>
                    <div className="text-lg font-black text-slate-900 dark:text-white mt-2">
                      {formattedCurrency(calculateSipFutureValue(freedMonthlyEMI + extraMonthlyPayment, 15, 12))}
                    </div>
                  </div>
                  <div className="text-[9px] text-amber-500 mt-2 font-bold font-mono">
                    Accelerates goal target by 9.5 years!
                  </div>
                </div>

              </div>

              <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl flex gap-3 text-[10px] leading-relaxed mt-4.5 text-amber-800 dark:text-amber-350">
                <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>The iFIN Wealth Paradox:</strong> Interest paid on debts represents standard daily compounding in favor of the bank (deprecating your value). Shifting that exact cash flow to equity index funds reverts the direction of compounding in <i>your</i> favor. Clearing credit card balances and hand loans instantly grants a risk-free 13-42% equivalent compound return!
                </span>
              </div>
            </div>

          </div>
        )}

        {/* Tab: FAQ / Guide */}
        {activeTab === "faq" && (
          <div className="space-y-4 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
            
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-850">
              <h4 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1.5">
                <CheckCircle className="w-4 h-4 text-purple-600" />
                What is the Debt Avalanche Strategy?
              </h4>
              <p>
                The Debt Avalanche method prioritizes paying extra cash toward the account with the **highest annual interest rate (%),** regardless of its balance. While you continue to make minimum payments on all other loans/cards, any additional pre-payment/rollover funds are directed aggressively to the highest interest rate debt. Mathematically, this minimizes lifetime interest paid and completes your debt-free timeline fastest.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-850">
              <h4 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1.5">
                <CheckCircle className="w-4 h-4 text-purple-600" />
                What is the Debt Snowball Strategy?
              </h4>
              <p>
                The Debt Snowball method prioritizes paying extra cash toward the account with the **smallest remaining balance (₹),** regardless of its interest rate. This strategy is driven by psychological momentum: quickly wiping out smaller bills first triggers quick wins and motivates you to keep going. As small obligations are paid off, their entire minimum budget gets "snowballed" into the next smallest debt.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-850">
              <h4 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                What is FOIR and why is it crucial in India?
              </h4>
              <p>
                **Fixed Obligation to Income Ratio (FOIR)** is the benchmark metric financial institutions and banks use during credit appraisal to determine your loan eligibility. A FOIR of over 45-50% signifies heavy debt distress, which will cause lenders to decline or heavily limit any future home loan or credit card applications, viewing you as a default risk. Keep your FOIR under 30% for a pristine credit health profile.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-850">
              <h4 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1.5">
                <Lightbulb className="w-4 h-4 text-purple-600" />
                Should I prepay my Indian Home Loan or invest?
              </h4>
              <p>
                As a standard index (like Nifty 50) compounds at ~12-14% CAGR in India, and home loans are priced at ~8.5% p.a., investing excess cash into mutual funds can sometimes yield higher long-term wealth, especially with home loan tax benefits (Section 24b for interest deduction up to 2 lakhs). However, if your home loan rate climbs or you have other personal loans/credit cards (accruing at 13-40%), you should always prioritize pre-paying those high-interest debts first.
              </p>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
