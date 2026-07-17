import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { DashboardData } from "./DashboardDataStore";
import { 
  TrendingUp, ArrowDownRight, ArrowUpRight, DollarSign, Coins, Edit3, Check, X, Percent 
} from "lucide-react";

interface CashFlowProps {
  data: DashboardData;
  language: "en" | "hi";
  onUpdateData: (newData: DashboardData) => void;
}

export default function CashFlowSection({ data, language, onUpdateData }: CashFlowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formIncome, setFormIncome] = useState(data.income);
  const [formExpenses, setFormExpenses] = useState(data.expenses);

  const totalIncome = Object.values(data.income).reduce((a, b) => a + b, 0);
  const totalExpenses = Object.values(data.expenses).reduce((a, b) => a + b, 0);
  const savings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;

  const incomeLabels: Record<string, { en: string; hi: string }> = {
    salary: { en: "Monthly Salary (Net)", hi: "मासिक वेतन (नेट)" },
    rental: { en: "Rental Income", hi: "किराया आय" },
    business: { en: "Business Income", hi: "व्यवसाय / व्यापार आय" },
    other: { en: "Other Side Incomes", hi: "अन्य साइड आय" },
  };

  const expenseLabels: Record<string, { en: string; hi: string }> = {
    housing: { en: "Housing & Rent/EMI", hi: "आवास एवं किराया/EMI" },
    food: { en: "Groceries & Dining", hi: "किराने का सामान और भोजन" },
    transport: { en: "Commute & Fuel", hi: "यातायात और ईंधन" },
    education: { en: "Children Education", hi: "बच्चों की शिक्षा" },
    medical: { en: "Healthcare & Doctor", hi: "चिकित्सा और स्वास्थ्य" },
    insurance: { en: "Insurance Premiums", hi: "बीमा प्रीमियम" },
    entertainment: { en: "Lifestyle & Outings", hi: "मनोरंजन और जीवन शैली" },
    investments: { en: "SIPs & Goal Deposits", hi: "मासिक एसआईपी व निवेश" },
  };

  const handleSaveAll = () => {
    const totalIn = (formIncome.salary || 0) + (formIncome.rental || 0) + (formIncome.business || 0) + (formIncome.other || 0);
    const totalEx = (formExpenses.housing || 0) + (formExpenses.food || 0) + (formExpenses.transport || 0) + (formExpenses.education || 0) + (formExpenses.medical || 0) + (formExpenses.insurance || 0) + (formExpenses.entertainment || 0) + (formExpenses.investments || 0);
    const updated = {
      ...data,
      income: formIncome,
      expenses: formExpenses,
      timeline: [
        {
          id: `t-${Date.now()}`,
          action: `Monthly cash flow updated. Income: ₹${totalIn.toLocaleString()}, Expenses: ₹${totalEx.toLocaleString()}`,
          date: new Date().toISOString(),
          category: "Cash Flow Update",
        },
        ...data.timeline,
      ]
    };
    onUpdateData(updated);
    setIsEditing(false);
  };

  const chartData = [
    {
      name: language === "hi" ? "इनकम" : "Inflow",
      Salary: data.income.salary,
      Rental: data.income.rental,
      Business: data.income.business,
      Other: data.income.other,
    },
    {
      name: language === "hi" ? "आउटफ्लो" : "Outflow",
      Housing: data.expenses.housing,
      Food: data.expenses.food,
      Transport: data.expenses.transport,
      Education: data.expenses.education,
      Medical: data.expenses.medical,
      Insurance: data.expenses.insurance,
      Lifestyle: data.expenses.entertainment,
      Investments: data.expenses.investments,
    }
  ];

  return (
    <div id="section-cashflow" className="bg-white border border-slate-100 rounded-3xl p-6 shadow-3xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-black text-slate-900 font-display flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            <span>{language === "hi" ? "मासिक कैश फ्लो और बजट लेजर" : "Monthly Cash Flow & Smart Budget Planner"}</span>
          </h3>
          <p className="text-xs text-slate-500">
            {language === "hi" 
              ? "आय (इनकम) बनाम खर्च (आउटगोइंग) और बचत का वास्तविक समय संतुलन" 
              : "Visualize monthly income, expenses, SIP pipelines, and savings efficiency."}
          </p>
        </div>

        <button
          onClick={() => {
            if (!isEditing) {
              setFormIncome(data.income);
              setFormExpenses(data.expenses);
            }
            setIsEditing(!isEditing);
          }}
          className="px-3.5 py-1.5 bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer self-start sm:self-auto"
        >
          {isEditing ? (
            <>
              <X className="w-3.5 h-3.5" />
              <span>{language === "hi" ? "रद्द करें" : "Cancel"}</span>
            </>
          ) : (
            <>
              <Edit3 className="w-3.5 h-3.5" />
              <span>{language === "hi" ? "बजट संपादित करें" : "Adjust Budget"}</span>
            </>
          )}
        </button>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-emerald-50 border border-emerald-100/50 p-4 rounded-2xl space-y-1">
          <span className="text-[9px] font-black text-emerald-800 uppercase block tracking-wider">
            {language === "hi" ? "कुल मासिक आय" : "MONTHLY INFLOW"}
          </span>
          <div className="text-xl font-black text-emerald-950 font-mono flex items-center gap-1">
            <ArrowUpRight className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>₹{totalIncome.toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-rose-50 border border-rose-100/50 p-4 rounded-2xl space-y-1">
          <span className="text-[9px] font-black text-rose-800 uppercase block tracking-wider">
            {language === "hi" ? "कुल मासिक खर्च" : "MONTHLY OUTFLOW"}
          </span>
          <div className="text-xl font-black text-rose-950 font-mono flex items-center gap-1">
            <ArrowDownRight className="w-4 h-4 text-rose-600 shrink-0" />
            <span>₹{totalExpenses.toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-indigo-50 border border-indigo-100/50 p-4 rounded-2xl space-y-1">
          <span className="text-[9px] font-black text-indigo-800 uppercase block tracking-wider">
            {language === "hi" ? "मासिक संचयी बचत" : "NET SAVINGS FLOW"}
          </span>
          <div className="text-xl font-black text-indigo-950 font-mono">
            ₹{savings.toLocaleString()}
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-100/50 p-4 rounded-2xl space-y-1">
          <span className="text-[9px] font-black text-purple-800 uppercase block tracking-wider">
            {language === "hi" ? "मासिक बचत दर" : "SAVINGS EFFICIENCY"}
          </span>
          <div className="text-xl font-black text-purple-950 font-mono flex items-center gap-1">
            <Percent className="w-4 h-4 text-purple-600 shrink-0" />
            <span>{savingsRate.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.div
            key="editing"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-5"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Income fields */}
              <div className="space-y-3">
                <span className="text-[10px] font-black text-slate-800 uppercase tracking-wider block border-b pb-1">
                  {language === "hi" ? "मासिक आय स्रोत" : "MONTHLY INFLOW SOURCES"}
                </span>
                {Object.entries(formIncome).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between gap-3 text-xs">
                    <span className="font-semibold text-slate-700">{incomeLabels[key]?.[language] || key}</span>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1.5 text-slate-400">₹</span>
                      <input
                        type="number"
                        value={val || ""}
                        onChange={(e) => setFormIncome({ ...formIncome, [key]: parseFloat(e.target.value) || 0 })}
                        className="pl-5 pr-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold w-28 text-right focus:outline-none focus:ring-1 focus:ring-bhagwa-500"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Expense fields */}
              <div className="space-y-3">
                <span className="text-[10px] font-black text-slate-800 uppercase tracking-wider block border-b pb-1">
                  {language === "hi" ? "मासिक खर्च श्रेणियां" : "MONTHLY EXPENSE CATEGORIES"}
                </span>
                {Object.entries(formExpenses).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between gap-3 text-xs">
                    <span className="font-semibold text-slate-700">{expenseLabels[key]?.[language] || key}</span>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1.5 text-slate-400">₹</span>
                      <input
                        type="number"
                        value={val || ""}
                        onChange={(e) => setFormExpenses({ ...formExpenses, [key]: parseFloat(e.target.value) || 0 })}
                        className="pl-5 pr-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold w-28 text-right focus:outline-none focus:ring-1 focus:ring-bhagwa-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t pt-4">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all cursor-pointer"
              >
                {language === "hi" ? "रद्द करें" : "Cancel"}
              </button>
              <button
                onClick={handleSaveAll}
                className="px-5 py-2 bg-bhagwa-600 hover:bg-bhagwa-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-sm cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{language === "hi" ? "बजट सहेजें" : "Commit Adjustments"}</span>
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="display"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Visual Recharts side */}
            <div className="lg:col-span-7 bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col justify-between">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block text-center mb-4">
                {language === "hi" ? "आय बनाम खर्च घटक विश्लेषण" : "Cash Flow Components Comparative (₹)"}
              </span>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`} tickLine={false} />
                    <Tooltip formatter={(value: any) => `₹${value.toLocaleString()}`} />
                    {/* Inflow Bars */}
                    <Bar dataKey="Salary" stackId="inflow" fill="#10b981" radius={[0, 0, 0, 0]} name={language === "hi" ? "वेतन" : "Salary"} />
                    <Bar dataKey="Rental" stackId="inflow" fill="#34d399" radius={[0, 0, 0, 0]} name={language === "hi" ? "किराया आय" : "Rental"} />
                    <Bar dataKey="Business" stackId="inflow" fill="#6ee7b7" radius={[0, 0, 0, 0]} name={language === "hi" ? "व्यवसाय आय" : "Business"} />
                    <Bar dataKey="Other" stackId="inflow" fill="#a7f3d0" radius={[4, 4, 0, 0]} name={language === "hi" ? "अन्य आय" : "Other Side"} />
                    {/* Outflow Bars */}
                    <Bar dataKey="Housing" stackId="outflow" fill="#f43f5e" name={language === "hi" ? "आवास" : "Housing"} />
                    <Bar dataKey="Food" stackId="outflow" fill="#fb7185" name={language === "hi" ? "भोजन" : "Groceries"} />
                    <Bar dataKey="Transport" stackId="outflow" fill="#fda4af" name={language === "hi" ? "परिवहन" : "Commute"} />
                    <Bar dataKey="Education" stackId="outflow" fill="#fbcfe8" name={language === "hi" ? "शिक्षा" : "Education"} />
                    <Bar dataKey="Medical" stackId="outflow" fill="#ec4899" name={language === "hi" ? "चिकित्सा" : "Healthcare"} />
                    <Bar dataKey="Insurance" stackId="outflow" fill="#d946ef" name={language === "hi" ? "बीमा" : "Insurance"} />
                    <Bar dataKey="Lifestyle" stackId="outflow" fill="#a855f7" name={language === "hi" ? "मनोरंजन" : "Lifestyle"} />
                    <Bar dataKey="Investments" stackId="outflow" fill="#6366f1" radius={[4, 4, 0, 0]} name={language === "hi" ? "निवेश" : "Investments/SIP"} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* List side */}
            <div className="lg:col-span-5 space-y-4">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                {language === "hi" ? "मासिक व्यय वितरण (क्रमानुसार)" : "Outflow allocation priorities"}
              </span>
              <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
                {Object.entries(data.expenses)
                  .sort((a,b) => b[1] - a[1])
                  .map(([key, val]) => {
                    const pct = totalIncome > 0 ? (val / totalIncome) * 100 : 0;
                    return (
                      <div key={key} className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-1.5 hover:bg-slate-100/55 transition-all">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-slate-700">{expenseLabels[key]?.[language] || key}</span>
                          <span className="font-mono font-bold text-slate-900">₹{val.toLocaleString()} ({pct.toFixed(0)}%)</span>
                        </div>
                        <div className="w-full bg-slate-200/60 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${key === 'investments' ? 'bg-indigo-600' : 'bg-rose-500'}`} 
                            style={{ width: `${Math.min(100, pct)}%` }} 
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
