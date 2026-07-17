import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { DashboardData } from "./DashboardDataStore";
import { Briefcase, AlertTriangle, Gauge, CheckCircle, Shield, Award } from "lucide-react";

interface PortfolioSectionProps {
  data: DashboardData;
  language: "en" | "hi";
}

export default function PortfolioSection({ data, language }: PortfolioSectionProps) {
  // Aggregate assets for portfolio allocation
  const categories = [
    { name: language === "hi" ? "म्यूचुअल फंड" : "Mutual Funds", val: data.assets.mutualFunds, color: "#8b5cf6" },
    { name: language === "hi" ? "डायरेक्ट स्टॉक्स" : "Direct Stocks", val: data.assets.stocks, color: "#3b82f6" },
    { name: language === "hi" ? "ईपीएफ सेवानिवृत्ति" : "EPF (Provident)", val: data.assets.epf, color: "#10b981" },
    { name: language === "hi" ? "पीपीएफ सुरक्षित कोष" : "PPF (Secured)", val: data.assets.ppf, color: "#059669" },
    { name: language === "hi" ? "एनपीएस संचय" : "NPS Pension", val: data.assets.nps, color: "#f59e0b" },
    { name: language === "hi" ? "डिजिटल व भौतिक सोना" : "Gold Assets", val: data.assets.gold, color: "#fbbf24" },
    { name: language === "hi" ? "बैंक एवं नकद आरक्षित" : "Cash & Bank Balance", val: data.assets.cash + data.assets.bankBalance, color: "#06b6d4" },
    { name: language === "hi" ? "अचल संपत्ति (प्रॉपर्टी)" : "Property Holdings", val: data.assets.property, color: "#ec4899" },
  ];

  const activeCategories = categories.filter(c => c.val > 0);
  const totalPortfolioValue = categories.reduce((acc, curr) => acc + curr.val, 0);

  // Radar chart data to evaluate Asset Class Strengths
  const radarData = [
    { subject: language === "hi" ? "इक्विटी विकास" : "Equities", A: data.assets.mutualFunds + data.assets.stocks > 0 ? 100 : 20, fullMark: 100 },
    { subject: language === "hi" ? "पेंशन सुरक्षा" : "Retirement", A: data.assets.epf + data.assets.nps > 0 ? 90 : 10, fullMark: 100 },
    { subject: language === "hi" ? "कर बचत" : "Tax Saving", A: data.assets.ppf + data.assets.nps > 0 ? 85 : 30, fullMark: 100 },
    { subject: language === "hi" ? "तरलता (कैश)" : "Liquidity", A: data.assets.cash + data.assets.bankBalance > 200000 ? 100 : 50, fullMark: 100 },
    { subject: language === "hi" ? "सुरक्षित निवेश" : "Safety (Gold)", A: data.assets.gold > 100000 ? 95 : 40, fullMark: 100 },
  ];

  // Risk profile meter calculations
  const equities = data.assets.mutualFunds + data.assets.stocks;
  const debtFixed = data.assets.epf + data.assets.ppf + data.assets.nps;
  const equityRatio = totalPortfolioValue > 0 ? (equities / totalPortfolioValue) * 100 : 0;

  let riskLabel = language === "hi" ? "संतुलित" : "Moderate (Balanced)";
  let riskDesc = language === "hi" ? "आपका निवेश इक्विटी और डेट इंस्ट्रूमेंट्स में अच्छी तरह संतुलित है।" : "Your portfolio stands in a prudent mix of compounding growth and debt safety nets.";
  let riskColor = "text-emerald-600 bg-emerald-50 border-emerald-100";
  let riskValue = 50; // out of 100

  if (equityRatio > 70) {
    riskLabel = language === "hi" ? "आक्रामक (उच्च विकास जोखिम)" : "Aggressive (High Equity Growth)";
    riskDesc = language === "hi" ? "70% से अधिक निवेश इक्विटी में होने से बाजार के झटके लग सकते हैं। स्वर्ण या निश्चित ब्याज दर वाले निवेश बढ़ाएं।" : "Heavy equity weightings yield outstanding gains but increase short-term volatility risks.";
    riskColor = "text-rose-600 bg-rose-50 border-rose-100";
    riskValue = 85;
  } else if (equityRatio < 25) {
    riskLabel = language === "hi" ? "अत्यधिक रूढ़िवादी (कम विकास)" : "Conservative (Inflation Drag)";
    riskDesc = language === "hi" ? "कम इक्विटी होने से आपका पैसा महंगाई से हार सकता है। म्यूचुअल फंड में व्यवस्थित एसआईपी बढ़ाएं।" : "Excessive fixed income shields from crashes but struggles to beat real lifestyle inflation.";
    riskColor = "text-amber-600 bg-amber-50 border-amber-100";
    riskValue = 20;
  }

  // Calculate Diversification Score
  const uniqueHoldingTypes = categories.filter(c => c.val > 10000).length;
  const diversificationScore = Math.min(100, Math.round((uniqueHoldingTypes / 8) * 100));

  return (
    <div id="section-portfolio" className="bg-white border border-slate-100 rounded-3xl p-6 shadow-3xs space-y-6">
      <div>
        <h3 className="text-lg font-black text-slate-900 font-display flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-purple-600" />
          <span>{language === "hi" ? "इन्वेस्टमेंट पोर्टफोलियो डायवर्सिफायर" : "Investment Portfolio Diversification Matrix"}</span>
        </h3>
        <p className="text-xs text-slate-500">
          {language === "hi" 
            ? "इक्विटी, डेट, पेंशन, रियल एस्टेट और गोल्ड एसेट्स का समग्र जोखिम और आवंटन विश्लेषण" 
            : "Evaluate total investment allocations, risk structures, and diversification indices."}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Recharts allocation pie */}
        <div className="lg:col-span-5 bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col items-center">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block text-center mb-2">
            {language === "hi" ? "पोर्टफोलियो आवंटन विभाजन" : "Cumulative Holdings Distribution"}
          </span>
          <div className="h-56 w-full flex items-center justify-center">
            {activeCategories.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={activeCategories}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="val"
                  >
                    {activeCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => `₹${value.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <span className="text-xs text-slate-400 italic">No investments registered.</span>
            )}
          </div>
          <span className="text-xs font-mono font-black text-slate-800">
            {language === "hi" ? "कुल मूल्य:" : "Cumulative Book Value:"} ₹{totalPortfolioValue.toLocaleString()}
          </span>
        </div>

        {/* Radar and Risk Profile on right side */}
        <div className="lg:col-span-7 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Diversification Index card */}
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl space-y-2">
              <span className="text-[10px] font-black text-slate-450 uppercase tracking-wider block">
                {language === "hi" ? "विविधीकरण स्कोर (DIVERSIFICATION)" : "PORTFOLIO DIVERSIFICATION"}
              </span>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-black text-purple-600 font-mono">
                  {diversificationScore}%
                </div>
                <span className="text-[10px] px-2 py-0.5 bg-purple-100/50 border border-purple-200 text-purple-800 rounded-md font-bold">
                  {diversificationScore >= 75 ? (language === "hi" ? "उत्कृष्ट" : "Prudent") : (language === "hi" ? "मध्यम" : "Unbalanced")}
                </span>
              </div>
              <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${diversificationScore}%` }} />
              </div>
              <span className="text-[10px] text-slate-400 block font-medium">
                {language === "hi" ? "8 संप्रदायों में फैले परिसंपत्ति वर्ग" : `Holding ${uniqueHoldingTypes} out of 8 core asset classes`}
              </span>
            </div>

            {/* Equities Exposure weight card */}
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl space-y-2">
              <span className="text-[10px] font-black text-slate-450 uppercase tracking-wider block">
                {language === "hi" ? "इक्विटी जोखिम अनुपात (EQUITY MIX)" : "EQUITY RISK EXPOSURE"}
              </span>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-black text-indigo-600 font-mono">
                  {equityRatio.toFixed(0)}%
                </div>
                <span className="text-[10px] px-2 py-0.5 bg-indigo-100/50 border border-indigo-200 text-indigo-800 rounded-md font-bold">
                  {equityRatio > 65 ? (language === "hi" ? "आक्रामक" : "Aggressive") : (language === "hi" ? "संतुलित" : "Conservative")}
                </span>
              </div>
              <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${equityRatio}%` }} />
              </div>
              <span className="text-[10px] text-slate-400 block font-medium">
                {language === "hi" ? "डायरेक्ट स्टॉक्स + म्यूचुअल फंड" : "Mutual funds & stocks combined"}
              </span>
            </div>
          </div>

          {/* Risk Profile Detailed Warning Banner */}
          <div className={`p-4 border rounded-2xl space-y-2 ${riskColor}`}>
            <h4 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-4 h-4 shrink-0" />
              <span>{language === "hi" ? "जोखिम प्रोफ़ाइल स्थिति:" : "Allocated Risk Status:"} {riskLabel}</span>
            </h4>
            <p className="text-[11px] font-semibold text-slate-700 leading-relaxed">
              {riskDesc}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
