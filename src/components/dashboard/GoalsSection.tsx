import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { DashboardData } from "./DashboardDataStore";
import { 
  Award, Plus, Trash2, Calendar, Landmark, CheckCircle2, AlertTriangle, ArrowRight, HelpCircle, X
} from "lucide-react";

interface GoalsSectionProps {
  data: DashboardData;
  language: "en" | "hi";
  onUpdateData: (newData: DashboardData) => void;
}

export default function GoalsSection({ data, language, onUpdateData }: GoalsSectionProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [goalName, setGoalName] = useState("");
  const [targetAmt, setTargetAmt] = useState("");
  const [currentAmt, setCurrentAmt] = useState("");
  const [monthlyContr, setMonthlyContr] = useState("");
  const [expectedDate, setExpectedDate] = useState("");
  const [category, setCategory] = useState<any>("education");

  const categoryLabels: Record<string, { en: string; hi: string; color: string; bg: string }> = {
    emergency: { en: "Emergency Cover", hi: "आपातकालीन सुरक्षा कोष", color: "text-emerald-700 border-emerald-200", bg: "bg-emerald-50" },
    house: { en: "Dream House", hi: "सपनों का आशियाना", color: "text-blue-700 border-blue-200", bg: "bg-blue-50" },
    car: { en: "Car Purchase", hi: "नया वाहन", color: "text-amber-700 border-amber-200", bg: "bg-amber-50" },
    retirement: { en: "Retirement Gold Cover", hi: "रिटायरमेंट फंड", color: "text-purple-700 border-purple-200", bg: "bg-purple-50" },
    education: { en: "Children Education", hi: "उच्च शिक्षा योजना", color: "text-pink-700 border-pink-200", bg: "bg-pink-50" },
    marriage: { en: "Marriage Planner", hi: "पारिवारिक विवाह", color: "text-indigo-700 border-indigo-200", bg: "bg-indigo-50" },
    vacation: { en: "Dream Vacation", hi: "विदेश यात्रा", color: "text-teal-700 border-teal-200", bg: "bg-teal-50" },
    business: { en: "Business Venture", hi: "नया व्यापार उद्यम", color: "text-orange-700 border-orange-200", bg: "bg-orange-50" },
    other: { en: "Other Priority Target", hi: "अन्य वित्तीय लक्ष्य", color: "text-slate-700 border-slate-200", bg: "bg-slate-50" },
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalName || !targetAmt) return;

    const newGoal = {
      id: "goal-" + Date.now(),
      name: goalName,
      targetAmount: parseFloat(targetAmt) || 0,
      currentAmount: parseFloat(currentAmt) || 0,
      monthlyContribution: parseFloat(monthlyContr) || 0,
      expectedDate: expectedDate || new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      category,
    };

    const updated = {
      ...data,
      goals: [...data.goals, newGoal],
      timeline: [
        {
          id: `t-${Date.now()}`,
          action: `New financial goal "${goalName}" set at ₹${newGoal.targetAmount.toLocaleString()} target`,
          date: new Date().toISOString(),
          category: "Goals Management",
        },
        ...data.timeline,
      ],
    };

    onUpdateData(updated);
    setShowAddForm(false);
    setGoalName("");
    setTargetAmt("");
    setCurrentAmt("");
    setMonthlyContr("");
    setExpectedDate("");
  };

  const handleDeleteGoal = (goalId: string, name: string) => {
    const updated = {
      ...data,
      goals: data.goals.filter(g => g.id !== goalId),
      timeline: [
        {
          id: `t-${Date.now()}`,
          action: `Financial goal "${name}" removed from active checklist`,
          date: new Date().toISOString(),
          category: "Goals Management",
        },
        ...data.timeline,
      ],
    };
    onUpdateData(updated);
  };

  const calculateSuccessProbability = (current: number, monthly: number, target: number, dateStr: string) => {
    const today = new Date();
    const targetDate = new Date(dateStr);
    const diffTime = targetDate.getTime() - today.getTime();
    const yearsLeft = Math.max(0.1, diffTime / (1000 * 60 * 60 * 24 * 365.25));

    // Assume 12% compounding return for goals in equity mutual funds
    const rate = 0.12;
    const compoundFrequency = 12; // monthly
    const totalMonths = yearsLeft * 12;

    // Compounding growth of current capital
    const grownCurrent = current * Math.pow(1 + rate/compoundFrequency, totalMonths);

    // Future value of monthly contributions
    let grownMonthly = 0;
    if (monthly > 0) {
      grownMonthly = monthly * ((Math.pow(1 + rate/compoundFrequency, totalMonths) - 1) / (rate/compoundFrequency)) * (1 + rate/compoundFrequency);
    }

    const totalProjected = grownCurrent + grownMonthly;
    const ratio = totalProjected / target;

    if (ratio >= 1.0) return { label: language === "hi" ? "अत्यधिक उच्च (100%)" : "Very High (100%)", color: "text-emerald-600 bg-emerald-50 border-emerald-100" };
    if (ratio >= 0.8) return { label: language === "hi" ? "उच्च (85%)" : "High (85%)", color: "text-emerald-500 bg-emerald-50 border-emerald-100" };
    if (ratio >= 0.5) return { label: language === "hi" ? "मध्यम (60%)" : "Medium (60%)", color: "text-sky-600 bg-sky-50 border-sky-100" };
    if (ratio >= 0.25) return { label: language === "hi" ? "कम (35%)" : "Low (35%)", color: "text-orange-600 bg-orange-50 border-orange-100" };
    return { label: language === "hi" ? "अपर्याप्त निवेश (10%)" : "Underfunded (10%)", color: "text-rose-600 bg-rose-50 border-rose-100" };
  };

  return (
    <div id="section-goals" className="bg-white border border-slate-100 rounded-3xl p-6 shadow-3xs space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-slate-900 font-display flex items-center gap-2">
            <Award className="w-5 h-5 text-pink-600" />
            <span>{language === "hi" ? "वित्तीय लक्ष्य संचय नियंत्रक" : "Financial Goal Target Matrix"}</span>
          </h3>
          <p className="text-xs text-slate-500">
            {language === "hi" 
              ? "चक्रवृद्धि विकास दर और मासिक बचत दरों के आधार पर लक्ष्यों की सटीक सफलता" 
              : "Track unlimited financial milestones with live compounding probability projections."}
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-3.5 py-1.5 bg-bhagwa-600 hover:bg-bhagwa-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-sm cursor-pointer"
        >
          {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{showAddForm ? (language === "hi" ? "रद्द करें" : "Cancel") : (language === "hi" ? "नया लक्ष्य जोड़ें" : "New Target")}</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {showAddForm && (
          <motion.form
            onSubmit={handleAddGoal}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase block">
                  {language === "hi" ? "लक्ष्य का नाम" : "Target Goal Name"}
                </label>
                <input
                  type="text"
                  required
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                  placeholder="e.g. Retirement, Child Higher Education"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase block">
                  {language === "hi" ? "लक्ष्य श्रेणी" : "Target Category"}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                >
                  {Object.entries(categoryLabels).map(([key, item]) => (
                    <option key={key} value={key}>{item[language]}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase block">
                  {language === "hi" ? "लक्ष्य राशि (₹)" : "Target Capital (₹)"}
                </label>
                <input
                  type="number"
                  required
                  value={targetAmt}
                  onChange={(e) => setTargetAmt(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold focus:outline-none"
                  placeholder="₹"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase block">
                  {language === "hi" ? "सहेजी गई राशि (₹)" : "Current Savings Secured (₹)"}
                </label>
                <input
                  type="number"
                  value={currentAmt}
                  onChange={(e) => setCurrentAmt(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold focus:outline-none"
                  placeholder="₹"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase block">
                  {language === "hi" ? "मासिक योगदान (₹)" : "Proposed Monthly SIP (₹)"}
                </label>
                <input
                  type="number"
                  value={monthlyContr}
                  onChange={(e) => setMonthlyContr(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold focus:outline-none"
                  placeholder="₹"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase block">
                  {language === "hi" ? "अपेक्षित तिथि" : "Target Completion Date"}
                </label>
                <input
                  type="date"
                  required
                  value={expectedDate}
                  onChange={(e) => setExpectedDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="submit"
                className="px-5 py-2 bg-bhagwa-600 hover:bg-bhagwa-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-sm cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>{language === "hi" ? "लक्ष्य स्थापित करें" : "Set Target Goal"}</span>
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Goals grid display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.goals.map((goal) => {
          const progressPct = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
          const prob = calculateSuccessProbability(goal.currentAmount, goal.monthlyContribution, goal.targetAmount, goal.expectedDate);
          const categoryDetail = categoryLabels[goal.category] || categoryLabels.other;

          return (
            <div key={goal.id} className="bg-slate-50 border border-slate-100 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:shadow-3xs transition-all relative group">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className={`text-[9px] font-extrabold px-2.5 py-0.5 border rounded-full ${categoryDetail.color} ${categoryDetail.bg}`}>
                    {categoryDetail[language]}
                  </span>
                  <h4 className="text-sm font-black text-slate-900 leading-tight block pt-1">
                    {goal.name}
                  </h4>
                  <div className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{language === "hi" ? "अपेक्षित:" : "Target date:"} {new Date(goal.expectedDate).toLocaleDateString(language === "hi" ? "hi-IN" : "en-US", { year: 'numeric', month: 'short' })}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteGoal(goal.id, goal.name)}
                  className="p-1.5 text-slate-350 hover:text-rose-600 bg-white hover:bg-rose-50 border border-slate-100 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                  title="Remove goal"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Progress and Ledger */}
              <div className="space-y-2">
                <div className="flex justify-between items-baseline text-[11px]">
                  <span className="text-slate-500 font-semibold">{language === "hi" ? "प्रगति:" : "Funded:"} <strong className="font-mono text-slate-800">₹{goal.currentAmount.toLocaleString()}</strong></span>
                  <span className="text-slate-400 font-medium">/ ₹{goal.targetAmount.toLocaleString()}</span>
                </div>

                {/* Real-time bar */}
                <div className="w-full bg-slate-200/60 h-2.5 rounded-full overflow-hidden">
                  <motion.div 
                    className="bg-gradient-to-r from-pink-500 to-indigo-600 h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, progressPct)}%` }}
                    transition={{ duration: 1.2 }}
                  />
                </div>

                <div className="flex justify-between items-center text-[10px] pt-1">
                  <span className="text-slate-400 font-bold">{progressPct.toFixed(0)}% {language === "hi" ? "पूरा" : "completed"}</span>
                  <span className="text-indigo-600 font-mono font-extrabold">₹{goal.monthlyContribution.toLocaleString()}/mo SIP</span>
                </div>
              </div>

              {/* Success Probability Meter */}
              <div className={`p-3 border rounded-xl flex items-center justify-between text-xs font-semibold ${prob.color}`}>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>{language === "hi" ? "सफलता की संभावना:" : "Probability of Success:"}</span>
                </span>
                <span className="font-bold">{prob.label}</span>
              </div>
            </div>
          );
        })}

        {data.goals.length === 0 && (
          <div className="col-span-2 bg-slate-50 border border-slate-100 rounded-2xl p-8 text-center flex flex-col items-center justify-center space-y-2 text-slate-400">
            <Landmark className="w-8 h-8 text-slate-350" />
            <span className="text-xs font-semibold">{language === "hi" ? "कोई सक्रिय लक्ष्य नहीं" : "No active savings goals tracked."}</span>
          </div>
        )}
      </div>
    </div>
  );
}
