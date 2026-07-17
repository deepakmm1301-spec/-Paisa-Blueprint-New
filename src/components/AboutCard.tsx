import React from "react";
import { Award, Landmark, TrendingUp, Sparkles, Building2, HelpCircle } from "lucide-react";

export default function AboutCard() {
  const stats = [
    { value: "10+", label: "Financial Planners" },
    { value: "50,000+", label: "Monthly Calculations" },
    { value: "100%", label: "Local & Safe Data" },
    { value: "No Cost", label: "Always Free to Use" },
  ];

  const values = [
    {
      icon: <Sparkles className="w-6 h-6 text-indigo-500" />,
      title: "Compounding First",
      description: "We design tools that demonstrate the force of compounding, guiding you towards achieving long-term financial freedom.",
    },
    {
      icon: <Landmark className="w-6 h-6 text-purple-500" />,
      title: "Government & Salaried Focus",
      description: "Specially calibrated algorithms for 7th Pay scale structures, dearness allowances (DA), state teachers, and standard salary structures.",
    },
    {
      icon: <Award className="w-6 h-6 text-teal-600" />,
      title: "Simplicity & Integrity",
      description: "No confusing advisor speak or hidden signups. Visual charts and calculators that let numbers speak for themselves.",
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4 sm:px-6">
      {/* Hero Section */}
      <div className="text-center space-y-4 mb-12">
        <span className="text-[10px] font-black tracking-widest text-indigo-600 uppercase font-mono bg-indigo-50 border border-indigo-100 rounded-full px-3 py-1 inline-block">
          Our Blueprint
        </span>
        <h1 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tight font-display">
          Crafting India's Premium <br />
          <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-teal-600 bg-clip-text text-transparent">
            Financial Empowerment Suite
          </span>
        </h1>
        <p className="text-slate-600 max-w-2xl mx-auto text-base sm:text-lg">
          Paisa Blueprint is a premium suite of highly calibrated calculators designed to help Indian salaried professionals, state teachers, and government employees model their financial pathways.
        </p>
      </div>

      {/* Grid: Main Story & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-16">
        <div className="md:col-span-7 bg-white border border-slate-100 rounded-3xl p-6 sm:p-10 shadow-xs space-y-6">
          <h2 className="text-2xl font-extrabold text-slate-800 font-display">The Vision Behind Paisa Blueprint</h2>
          <p className="text-sm leading-relaxed text-slate-600">
            For decades, average households have struggled with generic planners that do not account for distinct Indian tax regimes, pension models like the National Pension System (NPS), dearness allowance adjustments, and specialized commission factors.
          </p>
          <p className="text-sm leading-relaxed text-slate-600">
            Our mission is to replace confusing excels with elite standalone tools. All calculations run entirely client-side, or use secure, high-integrity servers with zero data sales, ensuring complete personal financial confidentiality.
          </p>
          
          <div className="border-t border-slate-50 pt-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-extrabold">
              🇮🇳
            </div>
            <div>
              <span className="block text-xs font-black text-slate-800">Designed with National Pride</span>
              <span className="block text-[11px] text-slate-500 font-mono mt-0.5">By and for the active Indian workforce</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-5 grid grid-cols-2 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="bg-gradient-to-tr from-slate-900 to-indigo-950 p-6 rounded-3xl text-center text-white border border-indigo-900/30 flex flex-col justify-center">
              <span className="block text-2xl md:text-3xl font-black text-indigo-300 font-display">
                {stat.value}
              </span>
              <span className="block text-[11px] text-indigo-200 mt-1 uppercase font-mono font-bold tracking-wider">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Trust Values Section */}
      <div className="space-y-6 mb-16">
        <h3 className="text-center text-xl font-bold font-display text-slate-800">Our Core Principles</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {values.map((v, i) => (
            <div key={i} className="bg-white border border-slate-150/50 hover:border-slate-250 rounded-2xl p-6 shadow-3xs transition-all space-y-3">
              <div className="p-3 bg-slate-50 rounded-xl w-fit border border-slate-100">
                {v.icon}
              </div>
              <h4 className="text-sm font-semibold text-slate-800">{v.title}</h4>
              <p className="text-xs leading-relaxed text-slate-500">{v.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Internal Links Navigation Area */}
      <div className="bg-indigo-50/40 border border-indigo-100 p-6 rounded-3xl text-center max-w-3xl mx-auto space-y-4">
        <h4 className="text-sm font-extrabold text-indigo-955 uppercase tracking-wider font-mono">
          Ready to chart your flight pathway?
        </h4>
        <div className="flex flex-wrap justify-center gap-3 text-xs font-bold">
          <a href="/salary-calculator" className="text-indigo-600 hover:text-indigo-805 bg-white border border-indigo-100 px-4 py-2 rounded-xl transition-all shadow-3xs">
            Salary Calculator
          </a>
          <a href="/sip-calculator" className="text-indigo-600 hover:text-indigo-805 bg-white border border-indigo-100 px-4 py-2 rounded-xl transition-all shadow-3xs">
            SIP Calculator
          </a>
          <a href="/nps-calculator" className="text-indigo-600 hover:text-indigo-805 bg-white border border-indigo-100 px-4 py-2 rounded-xl transition-all shadow-3xs">
            NPS Pension Calcs
          </a>
        </div>
      </div>
    </div>
  );
}
