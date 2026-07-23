import React, { useState, useMemo } from "react";
import { Sparkles, Share2, Info, Percent, Calculator, ListCollapse, BookOpen, AlertCircle, Coins, FileDown } from "lucide-react";
import { getShareableLink } from "../types";
import { generatePDFReport } from "../utils/pdfGenerator";

interface BiharDaCalculatorProps {
  language?: "en" | "hi";
}

export default function BiharDaCalculator({ language = "en" }: BiharDaCalculatorProps = {}) {
  const [basicPay, setBasicPay] = useState<number | "">(35400); // Standard Level 6 basic pay
  const [daPercent, setDaPercent] = useState<number>(50); // Current rate 50%
  const [hraPercent, setHraPercent] = useState<number | "">(8); // Typical town rate

  const computedData = useMemo(() => {
    const activeBasicPay = typeof basicPay === "string" ? 0 : basicPay;
    const activeDaPercent = typeof daPercent === "string" ? 0 : daPercent;
    const activeHraPercent = typeof hraPercent === "string" ? 0 : hraPercent;

    const daAmount = Math.round((activeBasicPay * activeDaPercent) / 100);
    
    const hraRate = activeHraPercent;
    const hraAmount = Math.round((activeBasicPay * hraRate) / 100);

    const medicalAllowance = 1000; // Bihar state standard
    const grossSalary = activeBasicPay + daAmount + hraAmount + medicalAllowance;

    // NPS Deduction (10% of Basic + DA)
    const npsDeduction = Math.round(((activeBasicPay + daAmount) * 10) / 100);
    const professionalTax = 150;
    const totalDeductions = npsDeduction + professionalTax;
    const inHandSalary = grossSalary - totalDeductions;

    // 14% Government NPS Contribution
    const govtNpsContribution = Math.round(((activeBasicPay + daAmount) * 14) / 100);

    return {
      daAmount,
      hraAmount,
      hraRate,
      medicalAllowance,
      grossSalary,
      npsDeduction,
      totalDeductions,
      inHandSalary,
      govtNpsContribution
    };
  }, [basicPay, daPercent, hraPercent]);

  const shareToWhatsApp = async () => {
    const currentUrl = getShareableLink("bihar_da", "/bihar-da-calculator");
    const text = language === "hi"
      ? `📊 *BPSC बिहार शिक्षक महंगाई भत्ता (DA) कैलकुलेटर 2026*\nदर्ज मूल वेतन (Basic Pay): ₹${basicPay.toLocaleString("en-IN")}\nवर्तमान डीए (DA) दर: ${daPercent}%\n*परिणाम स्वरूप कुल डीए राशि: ₹${computedData.daAmount.toLocaleString("en-IN")}*\nसकल मासिक वेतन (Gross Pay): ₹${computedData.grossSalary.toLocaleString("en-IN")}\nशुद्ध इन-हैंड वेतन (Net In-Hand): ₹${computedData.inHandSalary.toLocaleString("en-IN")}\n\nतुरंत गणना करें:`
      : `📊 *BPSC Teacher Dearness Allowance (DA) Calculator 2026*\nBasic Pay entered: ₹${basicPay.toLocaleString("en-IN")}\nCurrent DA Rate: ${daPercent}%\n*Formulated DA Amount: ₹${computedData.daAmount.toLocaleString("en-IN")}*\nMonthly Gross Pay: ₹${computedData.grossSalary.toLocaleString("en-IN")}\nNet In-Hand (After Deductions): ₹${computedData.inHandSalary.toLocaleString("en-IN")}\n\nCalculate yours instantly:`;

    if ((window as any).triggerNativeShare) {
      const title = language === "hi" ? "महंगाई भत्ता गणना" : "DA Calculation";
      const handled = await (window as any).triggerNativeShare(title, `${text} ${currentUrl}`, currentUrl);
      if (handled) return;
    }
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text + " " + currentUrl)}`, "_blank");
  };

  const downloadPDFReport = () => {
    generatePDFReport({
      title: language === "hi" ? "बिहार शिक्षक महंगाई भत्ता (DA) रिपोर्ट" : "BPSC Teacher DA Calculation Report",
      subtitle: language === "hi" ? "मूल वेतन और महंगाई भत्ता गणना का विस्तृत विवरण" : "Detailed Dearness Allowance (DA) and monthly salary adjustments",
      language,
      sections: [
        {
          title: language === "hi" ? "इनपुट विवरण" : "Input Parameters",
          items: [
            { label: language === "hi" ? "मूल वेतन" : "Basic Pay", value: `INR ${(typeof basicPay === "string" ? 0 : basicPay).toLocaleString("en-IN")}` },
            { label: language === "hi" ? "महंगाई भत्ता दर" : "Dearness Allowance Rate", value: `${daPercent}%` },
            { label: language === "hi" ? "गृह किराया भत्ता दर (HRA)" : "HRA Rate Selected", value: `${hraPercent}%` }
          ]
        },
        {
          title: language === "hi" ? "मासिक भत्ता गणना" : "Allowance Calculations",
          items: [
            { label: language === "hi" ? "महंगाई भत्ता राशि" : "Calculated DA Amount", value: `INR ${computedData.daAmount.toLocaleString("en-IN")}` },
            { label: language === "hi" ? "गृह किराया भत्ता राशि" : "Calculated HRA Amount", value: `INR ${computedData.hraAmount.toLocaleString("en-IN")}` },
            { label: language === "hi" ? "चिकित्सा भत्ता" : "Medical Allowance", value: `INR ${computedData.medicalAllowance.toLocaleString("en-IN")}` },
            { label: language === "hi" ? "सकल मासिक वेतन" : "Gross Monthly Salary", value: `INR ${computedData.grossSalary.toLocaleString("en-IN")}` }
          ]
        },
        {
          title: language === "hi" ? "मासिक कटौती विवरण" : "Monthly Deductions",
          items: [
            { label: language === "hi" ? "एनपीएस कटौती (10%)" : "NPS Employee Share (10% of Basic+DA)", value: `INR ${computedData.npsDeduction.toLocaleString("en-IN")}` },
            { label: language === "hi" ? "व्यावसायिक कर" : "Professional Tax", value: `INR ${professionalTax.toLocaleString("en-IN")}` },
            { label: language === "hi" ? "कुल कटौती" : "Total Monthly Deductions", value: `INR ${computedData.totalDeductions.toLocaleString("en-IN")}` }
          ]
        },
        {
          title: language === "hi" ? "अंतिम शुद्ध भुगतान" : "Net Take-Home Summary",
          items: [
            { label: language === "hi" ? "इन-हैंड वेतन" : "Net In-Hand Salary (Take-home)", value: `INR ${computedData.inHandSalary.toLocaleString("en-IN")}` },
            { label: language === "hi" ? "सरकार का एनपीएस योगदान" : "Govt NPS Contribution (14%)", value: `INR ${computedData.govtNpsContribution.toLocaleString("en-IN")}` }
          ]
        }
      ],
      notes: language === "hi" ? [
        "महंगाई भत्ता दरें राज्य सरकार के हालिया प्रस्तावों के अनुरूप हैं।",
        "कुल कटौती में एनपीएस (10%) और बिहार व्यावसायिक कर शामिल हैं।",
        "यह गणना एक शैक्षणिक अनुमान मात्र है।"
      ] : [
        "Calculated based on Bihar Government finance department norms for teacher DA enhancements.",
        "NPS employee contribution is exactly 10% of (Basic Pay + Dearness Allowance).",
        "This report is a mock calculation sheet."
      ]
    });
  };

  const professionalTax = 150;

  return (
    <div id="da-calculator" className="w-full max-w-5xl mx-auto p-4 sm:p-6 bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
      
      {/* Title Header */}
      <div className="mb-8 text-center sm:text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 dark:border-slate-800/60 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-xs font-black rounded-full mb-3 shadow-sm uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            BPSC Teacher DA Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-slate-800 dark:text-white leading-tight">
            BPSC Teacher Dearness Allowance (DA) Calculator 2026
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 font-medium max-w-2xl">
            Quickly calculate your revised Dearness Allowance amount, see how it elevates your basic pay, and view the resultant BPSC teacher salary structure adjustments.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
          <button
            onClick={downloadPDFReport}
            className="bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 active:scale-95 text-white font-bold text-xs px-4 py-2.5 rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all border-0 cursor-pointer"
          >
            <FileDown className="w-4 h-4" />
            <span>{language === "hi" ? "पीडीएफ रिपोर्ट डाउनलोड" : "Download PDF Report"}</span>
          </button>
          <button
            onClick={shareToWhatsApp}
            className="bg-[#25D366] hover:bg-[#20ba5a] active:scale-95 text-white font-bold text-xs px-4 py-2.5 rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all border-0 cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>{language === "hi" ? "व्हाट्सऐप साझा" : "Share on WhatsApp"}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Input Parameters Column */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-md space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Calculator className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <h3 className="font-extrabold text-slate-800 dark:text-white text-base">State DA Inputs</h3>
          </div>

          {/* Basic Pay Numerical Input */}
          <div>
            <label className="block text-xs font-black text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
              Basic Pay (मूल वेतन)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-extrabold">₹</span>
              <input
                type="number"
                value={basicPay}
                onChange={(e) => {
                  const val = e.target.value;
                  setBasicPay(val === "" ? "" : parseInt(val) || 0);
                }}
                placeholder="35,400"
                className="w-full bg-slate-50 dark:bg-slate-850 text-slate-800 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 pl-8 pr-4 py-3 text-sm font-black focus:outline-emerald-500"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1 font-medium">
              Enter your current basic pay on the 7th pay commission matrix.
            </p>
          </div>

          {/* DA Percentage Range */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-2">
              <span className="font-black text-slate-500 uppercase tracking-wide">Dearness Allowance (DA %)</span>
              <span className="text-teal-600 dark:text-teal-400 font-extrabold">{daPercent}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={daPercent}
              onChange={(e) => setDaPercent(parseInt(e.target.value) || 0)}
              className="w-full accent-teal-500 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-medium">
              <span>Min: 0%</span>
              <span>Current (50% Milestone)</span>
              <span>Max: 100%</span>
            </div>
          </div>

          {/* HRA Ratio selection with Slider & Manual Input */}
          <div>
            <div className="flex justify-between items-center text-xs font-medium mb-2">
              <span className="font-black text-slate-500 uppercase tracking-wide">
                House Rent Allowance (HRA % class)
              </span>
              <span className="text-teal-600 dark:text-teal-400 font-extrabold bg-teal-50 dark:bg-teal-950/40 px-2 py-0.5 rounded-md">
                {hraPercent}% HRA
              </span>
            </div>

            {/* Slider and Manual number input */}
            <div className="flex items-center gap-3 mb-1">
              <input
                type="range"
                min={0}
                max={30}
                step={0.5}
                value={hraPercent === "" ? 0 : hraPercent}
                onChange={(e) => setHraPercent(parseFloat(e.target.value) || 0)}
                className="flex-1 accent-teal-500 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="relative w-28 shrink-0">
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">%</span>
                <input
                  type="number"
                  value={hraPercent}
                  step={0.1}
                  onChange={(e) => {
                    const val = e.target.value;
                    setHraPercent(val === "" ? "" : parseFloat(val) || 0);
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-1 pl-2 pr-5 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                  min={0}
                  max={100}
                  placeholder="0"
                />
              </div>
            </div>
            <p className="text-[9px] text-slate-400 mt-1.5 font-medium leading-relaxed">
              Standard state scales: 16% (Patna), 8% (Towns), 6% (Rural areas).
            </p>
          </div>
        </div>

        {/* Output Dashboard column */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          <div className="bg-white border border-slate-200/80 dark:bg-slate-900 dark:border-slate-800/80 text-slate-900 dark:text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 w-24 h-24 bg-teal-500/10 rounded-full blur-2xl" />

            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
              <span className="text-xs font-black text-teal-600 dark:text-teal-400 uppercase tracking-wider">Dearness Compensation Balance Sheet</span>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-extrabold">Active 7th Pay Formula</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Computed DA Amount */}
              <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-150/60 dark:border-slate-800/50 rounded-2xl p-4.5">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wide">DA Component Net Pay</span>
                <p className="text-3xl font-black text-teal-600 dark:text-teal-400 mt-1">₹{computedData.daAmount.toLocaleString("en-IN")}</p>
                <p className="text-[9px] text-slate-500 dark:text-slate-400 mt-1.5 font-medium">Adds up directly to your baseline Basic Pay weight.</p>
              </div>

              {/* Combined Basic + DA */}
              <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-150/60 dark:border-slate-800/50 rounded-2xl p-4.5">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wide">New Basic + DA Salary Weight</span>
                <p className="text-2xl font-black text-slate-850 dark:text-white mt-1">₹{(basicPay + computedData.daAmount).toLocaleString("en-IN")}</p>
                <p className="text-[9px] text-slate-500 dark:text-slate-400 mt-1.5 font-medium">The key base metric used to calculate NPS & Insurance.</p>
              </div>
            </div>

            {/* In hand output summary */}
            <div className="bg-teal-500/5 dark:bg-teal-950/20 border border-teal-500/15 rounded-2xl p-4 mt-4 flex justify-between items-center">
              <div>
                <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold uppercase tracking-wide block">Estimated Ultimate In-Hand Salary</span>
                <p className="text-2xl font-black text-slate-850 dark:text-white mt-0.5">₹{computedData.inHandSalary.toLocaleString("en-IN")}/mo</p>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 text-right">
                <p className="font-extrabold text-slate-700 dark:text-slate-300">Gross: ₹{computedData.grossSalary.toLocaleString("en-IN")}</p>
                <p className="text-rose-600 dark:text-rose-400 font-medium">Deductions: ₹{computedData.totalDeductions.toLocaleString("en-IN")}</p>
              </div>
            </div>

            {/* Step-by-Step State formulas */}
            <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 mt-6 mb-3.5 uppercase tracking-wider">Salary Adjustments Summary</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/50">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Baseline Basic Pay Entered</span>
                <span className="text-slate-800 dark:text-slate-200 font-bold">₹{basicPay.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/50">
                <span className="text-slate-500 dark:text-slate-400 font-medium">{`House Rent Allowance (${computedData.hraRate}%)`}</span>
                <span className="text-slate-800 dark:text-slate-200 font-bold">+ ₹{computedData.hraAmount.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/50">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Medical Allowance (Fixed)</span>
                <span className="text-slate-800 dark:text-slate-200 font-bold">+ ₹{computedData.medicalAllowance.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/50 text-rose-600 dark:text-rose-400 font-bold">
                <span>NPS Account Employee Contribution (10%)</span>
                <span>- ₹{computedData.npsDeduction.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between py-1 text-teal-600 dark:text-teal-400 font-black">
                <span>Government of Bihar NPS contribution (14%)</span>
                <span>+ ₹{computedData.govtNpsContribution.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          {/* Quick Informational Note */}
          <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/40 p-4.5 rounded-2xl flex gap-3 text-xs text-emerald-800 dark:text-emerald-400">
            <Coins className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-500 mt-0.5" />
            <div>
              <p className="font-extrabold">Dearness Merger Rules</p>
              <p className="mt-0.5 font-medium leading-relaxed">
                Under traditional Central and Bihar state Pay commission schedules, when DA rates cross the critical <strong>50% boundary</strong>, other key dependent benefits (e.g. Gratuity milestones up to Rs 25 Lakhs, City Compensatory, Hostel allowances, Children's Education payouts) are upgraded to automatically adjust with cost of living indicators!
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Guide Content Section */}
      <div className="mt-12 border-t border-slate-200 dark:border-slate-800 pt-8 space-y-8">
        
        <section className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 space-y-4">
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white font-display tracking-tight border-l-4 border-teal-500 pl-3">
            What is Dearness Allowance (DA) and How is it Computed in Bihar?
          </h2>
          <p className="text-sm leading-relaxed font-medium">
            Dearness Allowance (महंगाई भत्ता) is a life-maintenance allowance paid of State and Central cabinet employers to public service officials, BPSC educational faculty, and public pensioners. The objective of DA is to neutralize the erosion of real salaries caused by general retail market price inflation of commodities.
          </p>
          <p className="text-sm leading-relaxed font-semibold">
            In Bihar, dearness allowance rates operate in complete tandem with the cabinet revisions of the Union government under the recommendations of the Seventh Central Pay Commission rules. As of the current financial year update, both Union and state departments are implementing a <strong>50% dearness allowance</strong> rate.
          </p>
          
          <h3 className="text-base font-black text-slate-800 dark:text-white pt-2">Formula for Computing Bihar State Dearness Allowance (DA)</h3>
          <p className="text-sm leading-relaxed font-medium">
            For government personnel operating under 7th CPC guidelines (implemented centrally since 1st Jan 2016), the mathematical formula is:
          </p>
          <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-xl font-mono text-center text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-extrabold border border-slate-200 dark:border-slate-800">
            DA Amount = [Basic Pay of the Employee] × [Applicable DA Percentage Rate / 100]
          </div>
          <p className="text-sm leading-relaxed font-medium mt-2">
            For example, if your Basic Pay is ₹35,400 (corresponds to Seventh CPC Pay matrix Level-6) and the prevailing Dearness Allowance rate is 50%, your calculated monthly DA amount is:
          </p>
          <div className="bg-slate-100 dark:bg-slate-900 p-3 rounded-xl font-mono text-center text-xs text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-800/60">
            ₹35,400 × (50 / 100) = ₹17,700 per month
          </div>
        </section>

        {/* FAQs */}
        <section className="space-y-4">
          <h2 className="text-xl font-black text-slate-800 dark:text-white font-display tracking-tight flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-teal-600" />
            Frequently Asked Questions regarding Bihar DA
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-600 dark:text-slate-300 font-medium">
            
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-xl shadow-sm">
              <h4 className="text-xs font-black text-slate-800 dark:text-white mb-1.5">When is DA revised in the Bihar Government?</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                The dearness allowance undergoes a biannual evaluation: the first half takes effect from January (usually approved around March), and the second half starts from July (generally approved around October). Pay arrears for past buffer months are credited separately.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-xl shadow-sm">
              <h4 className="text-xs font-black text-slate-800 dark:text-white mb-1.5">What is the difference between DA and HRA?</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Dearness allowance adjusts for general price inflation of daily consumption commodities. House Rent Allowance (HRA) is specifically allocated to compensate for housing costs and varies dynamically according to the classification of the municipal city.
              </p>
            </div>

          </div>
        </section>

        {/* Related Calculators */}
        <section className="bg-bhagwa-50/20 border border-bhagwa-100/40 dark:border-bhagwa-900/15 rounded-3xl p-6 space-y-4 text-left">
          <span className="text-[9px] font-black uppercase text-bhagwa-700 dark:text-bhagwa-300 tracking-widest font-mono block">
            Related Salaried Planners &amp; Checklists
          </span>
          <h4 className="text-xs font-black text-slate-800 dark:text-white leading-tight">
            Continue matching your allowances with these complementary calculators:
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs leading-none">
            <a 
              href="/sip-calculator" 
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-950 text-center font-bold text-slate-705 dark:text-slate-300 transition-all block"
            >
              SIP Growth
            </a>
            <a 
              href="/nps-calculator" 
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-950 text-center font-bold text-slate-705 dark:text-slate-300 transition-all block"
            >
              NPS Tax Saver
            </a>
            <a 
              href="/pension-calculator" 
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-950 text-center font-bold text-slate-705 dark:text-slate-300 transition-all block"
            >
              NPS Retirement
            </a>
            <a 
              href="/salary-calculator" 
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-950 text-center font-bold text-slate-705 dark:text-slate-300 transition-all block"
            >
              Salary Planner
            </a>
          </div>
        </section>

      </div>
    </div>
  );
}
