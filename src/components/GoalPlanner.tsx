import React, { useState, useEffect } from "react";
import { Sparkles, Calendar, Plus, Trash2, HelpCircle, GraduationCap, Home, Car, Heart, Palmtree, Compass, AlertCircle, Pencil, Check, X, Share2, FileDown, Bookmark } from "lucide-react";
import { Goal, getShareableLink } from "../types";
import { generatePDFReport } from "../utils/pdfGenerator";
import { paisaFetch } from "../api";

export default function GoalPlanner() {
  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem("paisa_goal_planner_list");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved goals", e);
      }
    }
    return [
      {
        id: "goal-1",
        name: "Child Higher Education",
        category: "education",
        targetAmount: 2500000,
        yearsLeft: 12,
        expectedReturn: 12,
        inflationRate: 6,
      },
      {
        id: "goal-2",
        name: "House Purchase Downpayment",
        category: "house",
        targetAmount: 3500000,
        yearsLeft: 7,
        expectedReturn: 12,
        inflationRate: 6,
      },
      {
        id: "goal-3",
        name: "New SUV Car Purchase",
        category: "car",
        targetAmount: 1200000,
        yearsLeft: 4,
        expectedReturn: 10,
        inflationRate: 6,
      },
      {
        id: "goal-4",
        name: "Annual Vacation",
        category: "vacation",
        targetAmount: 400000,
        yearsLeft: 2,
        expectedReturn: 8,
        inflationRate: 5,
      }
    ];
  });

  // Persist goals to localized storage
  useEffect(() => {
    localStorage.setItem("paisa_goal_planner_list", JSON.stringify(goals));
  }, [goals]);

  // Save / Load states
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

  // Load calculation listener
  useEffect(() => {
    const loadFromCalc = (calc: any) => {
      if (!calc || !calc.data) return;
      const data = calc.data;
      if (data && data.goals) {
        setGoals(data.goals);
      } else if (data && data.id) {
        // If they selected a single saved goal, add or update it in the list!
        setGoals((prev) => {
          const exists = prev.some((g) => g.id === data.id);
          if (exists) {
            return prev.map((g) => g.id === data.id ? data : g);
          } else {
            return [...prev, data];
          }
        });
      }
    };

    // Check localStorage on mount
    const loadedStr = localStorage.getItem("paisa_loaded_calculation");
    if (loadedStr) {
      try {
        const calc = JSON.parse(loadedStr);
        if (calc && (calc.type?.toLowerCase() === "goal" || calc.type?.toLowerCase() === "financialgoals")) {
          loadFromCalc(calc);
          localStorage.removeItem("paisa_loaded_calculation");
        }
      } catch (err) {
        console.error("Error loading saved goals:", err);
      }
    }

    const handleLoad = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && (customEvent.detail.type === "goal" || customEvent.detail.type === "financialGoals")) {
        loadFromCalc(customEvent.detail);
      }
    };
    window.addEventListener("paisa-load-calculation", handleLoad);
    return () => window.removeEventListener("paisa-load-calculation", handleLoad);
  }, []);

  // Save calculation handler
  const saveToLocker = async () => {
    setIsSaving(true);
    setSaveStatus("idle");
    try {
      const res = await paisaFetch("/api/locker/save", {
        method: "POST",
        body: JSON.stringify({
          title: `Goal Targets Checklist (${goals.length} active targets)`,
          type: "goal",
          data: {
            goals
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
        alert(data?.message || "Failed to save goals. Please make sure you are logged in.");
      }
    } catch (err) {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
      alert("Please log in to save this plan to your financial locker.");
    } finally {
      setIsSaving(false);
    }
  };

  // Form states for creating custom goal
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCat, setNewCat] = useState<Goal["category"]>("other");
  const [newAmount, setNewAmount] = useState<number>(500000);
  const [newYears, setNewYears] = useState<number>(5);
  const [newReturn, setNewReturn] = useState<number>(12);
  const [newInflation, setNewInflation] = useState<number>(6);

  // States for live Editing capabilities
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState<Goal["category"]>("other");
  const [editTargetAmount, setEditTargetAmount] = useState<number>(0);
  const [editYearsLeft, setEditYearsLeft] = useState<number>(0);
  const [editExpectedReturn, setEditExpectedReturn] = useState<number>(0);
  const [editInflationRate, setEditInflationRate] = useState<number>(0);

  const startEditing = (goal: Goal) => {
    setEditingGoalId(goal.id);
    setEditName(goal.name);
    setEditCategory(goal.category);
    setEditTargetAmount(goal.targetAmount);
    setEditYearsLeft(goal.yearsLeft);
    setEditExpectedReturn(goal.expectedReturn);
    setEditInflationRate(goal.inflationRate);
  };

  const handleSaveEdit = (id: string) => {
    if (!editName.trim()) return;
    setGoals((prev) =>
      prev.map((g) =>
        g.id === id
          ? {
              ...g,
              name: editName.trim(),
              category: editCategory,
              targetAmount: editTargetAmount,
              yearsLeft: editYearsLeft,
              expectedReturn: editExpectedReturn,
              inflationRate: editInflationRate,
            }
          : g
      )
    );
    setEditingGoalId(null);
  };

  const handleCancelEdit = () => {
    setEditingGoalId(null);
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newGoal: Goal = {
      id: "goal-" + Date.now(),
      name: newName,
      category: newCat,
      targetAmount: newAmount,
      yearsLeft: newYears,
      expectedReturn: newReturn,
      inflationRate: newInflation,
    };

    setGoals((prev) => [...prev, newGoal]);
    setNewName("");
    setNewCat("other");
    setShowAddForm(false);
  };

  const handleDeleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  // Math for specific Goal
  const calculateGoalSip = (goal: Goal) => {
    // Inflate target amount according to inflation and years left
    const inflatedTarget = Math.round(goal.targetAmount * Math.pow(1 + goal.inflationRate / 100, goal.yearsLeft));
    
    // Monthly annuity calculation
    const rMonthly = (goal.expectedReturn / 100) / 12;
    const nMonths = goal.yearsLeft * 12;
    const compoundFactor = ((Math.pow(1 + rMonthly, nMonths) - 1) / rMonthly) * (1 + rMonthly);
    const monthlySip = Math.round(inflatedTarget / (compoundFactor || 1));

    return {
      inflatedTarget,
      monthlySip,
    };
  };

  const getCategoryIcon = (cat: Goal["category"]) => {
    switch (cat) {
      case "education":
        return <GraduationCap className="w-5 h-5 text-bhagwa-600" />;
      case "house":
        return <Home className="w-5 h-5 text-emerald-600" />;
      case "car":
        return <Car className="w-5 h-5 text-sky-600" />;
      case "marriage":
        return <Heart className="w-5 h-5 text-rose-500" />;
      case "vacation":
        return <Palmtree className="w-5 h-5 text-amber-500" />;
      default:
        return <Compass className="w-5 h-5 text-violet-500" />;
    }
  };

  const downloadPDFReport = () => {
    if (goals.length === 0) return;

    const sections = goals.map((g, idx) => {
      const inflatedTarget = Math.round(g.targetAmount * Math.pow(1 + g.inflationRate / 100, g.yearsLeft));
      const rMonthly = (g.expectedReturn / 100) / 12;
      const nMonths = g.yearsLeft * 12;
      const compoundFactor = ((Math.pow(1 + rMonthly, nMonths) - 1) / rMonthly) * (1 + rMonthly);
      const sipNeeded = Math.round(inflatedTarget / (compoundFactor || 1));

      return {
        title: `${idx + 1}. ${g.name} (${g.category.toUpperCase()})`,
        items: [
          { label: "Target Goal Amount (Today Value)", value: `INR ${g.targetAmount.toLocaleString("en-IN")}` },
          { label: "Years Left to Achieve", value: `${g.yearsLeft} Years` },
          { label: "Assumed Annual Inflation", value: `${g.inflationRate}%` },
          { label: "Expected Investment Annual Return", value: `${g.expectedReturn}%` },
          { label: "Inflation-Adjusted Future Goal Cost", value: `INR ${inflatedTarget.toLocaleString("en-IN")}` },
          { label: "Required Monthly SIP Investment", value: `INR ${sipNeeded.toLocaleString("en-IN")}/mo` }
        ]
      };
    });

    generatePDFReport({
      title: "Milestones and Financial Goals Report",
      subtitle: "Inflation-protected goal planning and systematic investment roadmap",
      sections,
      notes: [
        "Inflation acts as an erosion factor on currency values. Standard education and house purchase costs are estimated with a 6% compounding inflation index.",
        "Systematic Investment Plan (SIP) returns are based on estimated historical compound growth metrics and are not guaranteed mutual fund yields.",
        "Regular rebalancing is recommended as you draw closer to the milestone target date."
      ]
    });
  };

  const shareToWhatsApp = () => {
    const currentUrl = getShareableLink("goal_planner", "/goals");
    if (goals.length === 0) return;
    
    let text = `🎯 *My Milestones & Goal Planner* (Paisa Blueprint)\n\n`;
    goals.slice(0, 3).forEach((g, idx) => {
      const inflatedTarget = Math.round(g.targetAmount * Math.pow(1 + g.inflationRate / 100, g.yearsLeft));
      const rMonthly = (g.expectedReturn / 100) / 12;
      const nMonths = g.yearsLeft * 12;
      const compoundFactor = ((Math.pow(1 + rMonthly, nMonths) - 1) / rMonthly) * (1 + rMonthly);
      const sipNeeded = Math.round(inflatedTarget / (compoundFactor || 1));
      
      text += `${idx + 1}. *${g.name}*\n`;
      text += `⏱️ Years Left: ${g.yearsLeft} Yr | Expected Return: ${g.expectedReturn}%\n`;
      text += `💰 Target: ₹${g.targetAmount.toLocaleString("en-IN")}\n`;
      text += `📈 Inflated Target: ₹${inflatedTarget.toLocaleString("en-IN")}\n`;
      text += `📝 Required Monthly SIP: *₹${sipNeeded.toLocaleString("en-IN")}/mo*\n\n`;
    });
    
    if (goals.length > 3) {
      text += `And ${goals.length - 3} more goals trackable on my dashboard...\n\n`;
    }
    
    text += `Calculate your inflation-protected milestone targets instantly: ${currentUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div id="goal-planner-module" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 md:p-8 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-100 dark:border-slate-800 pb-5 mb-6 gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-bhagwa-600 bg-bhagwa-50 dark:bg-bhagwa-950/30 px-2.5 py-1 rounded-full">Target Based Investing</span>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mt-2 font-display">My Goal Planner</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Map out life's biggest milestones. Enter targets today, and calculate exact inflation-protected SIP requirements.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={saveToLocker}
            disabled={isSaving}
            className={`flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-xs transition-all border-0 cursor-pointer ${isSaving ? "opacity-75 cursor-not-allowed" : ""}`}
          >
            <Bookmark className="w-4 h-4 text-white" />
            <span>{isSaving ? "Saving..." : saveStatus === "success" ? "Saved!" : "Save Goals to Vault"}</span>
          </button>
          <button
            onClick={downloadPDFReport}
            disabled={goals.length === 0}
            className="flex items-center gap-1.5 bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 active:scale-95 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-xs transition-all border-0 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          >
            <FileDown className="w-4 h-4" /> Download PDF Report
          </button>
          <button
            onClick={shareToWhatsApp}
            disabled={goals.length === 0}
            className="flex items-center gap-1.5 bg-[#25D366] hover:bg-[#20ba5a] active:scale-95 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-xs transition-all border-0 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          >
            <Share2 className="w-4 h-4" /> Share on WhatsApp
          </button>
          <button
            id="btn-add-goal"
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 bg-bhagwa-600 hover:bg-bhagwa-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Goal Target
          </button>
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddGoal} className="mb-8 p-5 bg-slate-50 border border-slate-100 rounded-xl text-sm space-y-4">
          <h3 className="font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-200 pb-2">
            <Sparkles className="w-4 h-4 text-bhagwa-600" /> New Life Goal Target Setup
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Goal Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Higher Studies, Kid's Marriage"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Category Category</label>
              <select
                value={newCat}
                onChange={(e) => setNewCat(e.target.value as Goal["category"])}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
              >
                <option value="education">Child Education</option>
                <option value="marriage">Marriage / Weddings</option>
                <option value="house">House Downpayment / Buy</option>
                <option value="car">Car Purchase</option>
                <option value="vacation">Vacation / Travel</option>
                <option value="other">Other Milestones</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Today's Target cost (₹)</label>
              <input
                type="number"
                required
                min="10000"
                value={newAmount}
                onChange={(e) => setNewAmount(Math.max(0, Number(e.target.value)))}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Years to accomplish goal</label>
              <input
                type="number"
                required
                min="1"
                max="40"
                value={newYears}
                onChange={(e) => setNewYears(Math.max(1, Number(e.target.value)))}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Expected Return CAGR (%)</label>
              <input
                type="number"
                required
                min="5"
                max="25"
                step="0.5"
                value={newReturn}
                onChange={(e) => setNewReturn(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Assumed Cost Inflation (%)</label>
              <input
                type="number"
                required
                min="0"
                max="15"
                step="0.5"
                value={newInflation}
                onChange={(e) => setNewInflation(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-200">
            <button
               type="button"
               onClick={() => setShowAddForm(false)}
               className="px-4 py-2 border border-slate-200 text-slate-500 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-bhagwa-600 text-white rounded-lg hover:bg-bhagwa-700 transition-colors cursor-pointer"
            >
              Create Goal
            </button>
          </div>
        </form>
      )}

      {/* Goal Cards Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal) => {
          const isEditing = editingGoalId === goal.id;
          const { inflatedTarget, monthlySip } = calculateGoalSip(
            isEditing
              ? {
                  id: goal.id,
                  name: editName,
                  category: editCategory,
                  targetAmount: editTargetAmount,
                  yearsLeft: editYearsLeft,
                  expectedReturn: editExpectedReturn,
                  inflationRate: editInflationRate,
                }
              : goal
          );

          if (isEditing) {
            return (
              <div
                key={goal.id}
                className="p-5 border border-bhagwa-300 rounded-2xl flex flex-col justify-between space-y-4 hover:shadow-xs transition-all bg-gradient-to-b from-slate-50 to-white"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-bhagwa-600 uppercase tracking-wider flex items-center gap-1.5">
                      <Pencil className="w-3.5 h-3.5" /> Edit Goal
                    </span>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(goal.id)}
                        className="p-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition-colors flex items-center gap-1 cursor-pointer"
                        title="Save Changes"
                      >
                        <Check className="w-3 h-3" /> Save
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="p-1 px-2.5 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-lg text-[10px] font-bold transition-colors flex items-center gap-1 cursor-pointer"
                        title="Cancel Editing"
                      >
                        <X className="w-3 h-3" /> Cancel
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div>
                      <label className="block text-[9px] font-semibold uppercase tracking-wider text-slate-500 mb-0.5">Goal Name</label>
                      <input
                        type="text"
                        required
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-bhagwa-500 font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[9px] font-semibold uppercase tracking-wider text-slate-500 mb-0.5">Category</label>
                        <select
                          value={editCategory}
                          onChange={(e) => setEditCategory(e.target.value as Goal["category"])}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-bhagwa-500"
                        >
                          <option value="education">Education</option>
                          <option value="marriage">Marriage</option>
                          <option value="house">House</option>
                          <option value="car">Car</option>
                          <option value="vacation">Vacation</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9px] font-semibold uppercase tracking-wider text-slate-500 mb-0.5">Today Cost (₹)</label>
                        <input
                          type="number"
                          required
                          min="1000"
                          value={editTargetAmount}
                          onChange={(e) => setEditTargetAmount(Math.max(0, Number(e.target.value)))}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-bhagwa-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5">
                      <div>
                        <label className="block text-[9px] font-semibold uppercase tracking-wider text-slate-500 mb-0.5" title="Years Left">Years</label>
                        <input
                          type="number"
                          required
                          min="1"
                          max="40"
                          value={editYearsLeft}
                          onChange={(e) => setEditYearsLeft(Math.max(1, Number(e.target.value)))}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-bhagwa-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-semibold uppercase tracking-wider text-slate-500 mb-0.5" title="Expected CAGR">CAGR %</label>
                        <input
                          type="number"
                          required
                          min="1"
                          max="30"
                          step="0.5"
                          value={editExpectedReturn}
                          onChange={(e) => setEditExpectedReturn(Number(e.target.value))}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-bhagwa-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-semibold uppercase tracking-wider text-slate-500 mb-0.5" title="Inflation Rate">Inflation %</label>
                        <input
                          type="number"
                          required
                          min="0"
                          max="20"
                          step="0.5"
                          value={editInflationRate}
                          onChange={(e) => setEditInflationRate(Number(e.target.value))}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-bhagwa-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Required Monthly SIP</span>
                    <span className="block text-md font-extrabold text-bhagwa-600 font-mono">₹{monthlySip.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="text-[9px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded">
                    Editing
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div
              key={goal.id}
              className="p-5 border border-slate-100 hover:border-slate-200/80 rounded-2xl flex flex-col justify-between space-y-4 hover:shadow-xs transition-all bg-slate-50/20"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="p-2.5 bg-white border border-slate-100/80 rounded-xl shadow-xs">
                    {getCategoryIcon(goal.category)}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => startEditing(goal)}
                      className="p-1.5 text-slate-400 hover:text-bhagwa-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                      title="Edit Goal Target"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Remove Goal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-slate-800 text-md leading-snug">{goal.name}</h3>
                  <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-400 font-medium font-mono">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>In {goal.yearsLeft} Years (@{goal.inflationRate}% Inflation)</span>
                  </div>
                </div>

                {/* Costs details comparison list */}
                <div className="pt-2 text-xs space-y-1 bg-white p-3 rounded-xl border border-slate-100/50">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Current Cost:</span>
                    <span className="font-bold text-slate-700">₹{goal.targetAmount.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between pb-1 text-[11px] leading-relaxed">
                    <span className="text-rose-500/80 font-medium">Inflated Cost Target:</span>
                    <span className="font-bold text-rose-500 font-mono">₹{inflatedTarget.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              {/* Action Plan Required Monthly SIP display */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Required Monthly SIP</span>
                  <span className="block text-lg font-extrabold text-bhagwa-600 font-mono">₹{monthlySip.toLocaleString("en-IN")}</span>
                </div>
                <div className="text-[10px] text-slate-400 font-semibold bg-bhagwa-50 border border-bhagwa-100 px-2 py-1 rounded-md text-right">
                  Yield: {goal.expectedReturn}%
                </div>
              </div>
            </div>
          );
        })}

        {goals.length === 0 && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-400 space-y-2 border border-dashed border-slate-200 rounded-2xl">
            <AlertCircle className="w-8 h-8 text-slate-300" />
            <p className="text-sm font-semibold">No active goals found in your current session.</p>
            <p className="text-xs">Click "Add Goal Target" above to draft a custom life plan!</p>
          </div>
        )}
      </div>
    </div>
  );
}
