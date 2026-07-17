import React from "react";
import { DashboardData, generateDynamicInsights, checkUnlockedAchievements } from "./DashboardDataStore";
import { Sparkles, Award, ShieldCheck, Zap, AlertCircle, HelpCircle, CheckCircle } from "lucide-react";

interface InsightsAndAchievementsProps {
  data: DashboardData;
  language: "en" | "hi";
}

export default function InsightsAndAchievements({ data, language }: InsightsAndAchievementsProps) {
  const insights = generateDynamicInsights(data);
  const achievements = checkUnlockedAchievements(data);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Dynamic Insights & Recommendations (7 cols) */}
      <div id="section-insights" className="lg:col-span-7 bg-white border border-slate-100 rounded-3xl p-6 shadow-3xs space-y-5">
        <div>
          <h3 className="text-base font-black text-slate-900 font-display flex items-center gap-1.5">
            <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" />
            <span>{language === "hi" ? "एआई वित्तीय अंतर्दृष्टि और सिफारिशें" : "AI Financial Insights & Strategic Counsel"}</span>
          </h3>
          <p className="text-xs text-slate-400 font-medium">
            {language === "hi" ? "बचत, कर देनदारियों और निवेशों के अनुकूलन के लिए एल्गोरिथम आधारित सुझाव" : "Dynamic rule-based recommendations tailored to your active ledger profiles."}
          </p>
        </div>

        <div className="space-y-3.5 max-h-[360px] overflow-y-auto pr-1">
          {insights.map((ins, idx) => {
            const isAlert = ins.type === "alert";
            const isSuccess = ins.type === "success";

            return (
              <div 
                key={idx} 
                className={`p-4 border rounded-2xl flex items-start gap-3 transition-all hover:scale-[1.01] ${
                  isAlert 
                    ? "bg-rose-50 border-rose-100/60" 
                    : isSuccess 
                      ? "bg-emerald-50 border-emerald-100/60" 
                      : "bg-indigo-50/50 border-indigo-100/50"
                }`}
              >
                {/* Dynamic Icon */}
                <span className="p-1.5 rounded-xl shrink-0">
                  {isAlert ? (
                    <AlertCircle className="w-5 h-5 text-rose-600" />
                  ) : isSuccess ? (
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Zap className="w-5 h-5 text-indigo-600" />
                  )}
                </span>

                <div className="space-y-1">
                  <span className={`text-[9px] font-black uppercase tracking-wider block ${
                    isAlert ? "text-rose-700" : isSuccess ? "text-emerald-700" : "text-indigo-700"
                  }`}>
                    {ins.tag}
                  </span>
                  <h4 className="text-xs font-black text-slate-900">
                    {ins.title}
                  </h4>
                  <p className="text-[11px] text-slate-700 font-medium leading-relaxed">
                    {ins.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gamified Achievements (5 cols) */}
      <div id="section-achievements" className="lg:col-span-5 bg-white border border-slate-100 rounded-3xl p-6 shadow-3xs space-y-4">
        <div>
          <h3 className="text-base font-black text-slate-900 font-display flex items-center gap-1.5">
            <Award className="w-5 h-5 text-pink-600" />
            <span>{language === "hi" ? "वित्तीय अनुशासन पदक केस" : "Financial Milestones & Achievements"}</span>
          </h3>
          <p className="text-xs text-slate-400 font-medium">
            {language === "hi" ? "बचत और निवेश लक्ष्यों तक पहुँचने पर अनलॉक किए गए पदक" : "Unlock visual badges by meeting absolute safety and saving criteria."}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1">
          {achievements.map((ach) => (
            <div 
              key={ach.id} 
              className="bg-slate-50 border border-slate-100/70 p-3.5 rounded-2xl flex flex-col items-center text-center space-y-2 hover:bg-slate-100/60 transition-all cursor-default"
            >
              <span className="text-3xl filter drop-shadow-sm select-none" role="img" aria-label="achievement">
                {ach.icon}
              </span>
              <div className="space-y-0.5">
                <h4 className="text-[11px] font-black text-slate-800 leading-tight">
                  {ach.name}
                </h4>
                <p className="text-[9px] text-slate-500 font-bold leading-tight">
                  {ach.desc}
                </p>
              </div>
              <span className="text-[8px] font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full uppercase tracking-wider block">
                {ach.date}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
