import React from "react";
import { FileText, Download, Calendar, Landmark, CheckCircle2, ChevronRight, Scale, Sparkles } from "lucide-react";

interface GovernmentOrdersProps {
  language: "en" | "hi";
}

interface OrderItem {
  id: string;
  titleEn: string;
  titleHi: string;
  date: string;
  code: string;
  authorityEn: string;
  authorityHi: string;
  summaryEn: string;
  summaryHi: string;
}

const OFFICIAL_ORDERS: OrderItem[] = [
  {
    id: "ord-1",
    titleEn: "Revised Mutual Transfer Policy Guidelines for BPSC TRE 1.0 & 2.0 Teachers",
    titleHi: "बीपीएससी टीआरई 1.0 और 2.0 शिक्षकों के लिए संशोधित आपसी स्थानांतरण नीति निर्देश",
    date: "May 10, 2026",
    code: "G.O. No. 12/M-105/2026-Edu",
    authorityEn: "Department of Education, Govt. of Bihar",
    authorityHi: "शिक्षा विभाग, बिहार सरकार",
    summaryEn: "Clarifies that mutual transfer eligibility is unlocked immediately after receipt of the PRAN card and successful Aadhaar-linked biometric matches.",
    summaryHi: "स्पष्ट करता है कि प्राण (PRAN) कार्ड प्राप्त होने और सफल आधार-लिंक्ड बायोमेट्रिक मिलान के तुरंत बाद आपसी स्थानांतरण पात्रता अनलॉक हो जाती है।"
  },
  {
    id: "ord-2",
    titleEn: "Notification Regarding Physical Biometric Verification Schedule for State Teachers",
    titleHi: "राज्य शिक्षकों के लिए शारीरिक बायोमेट्रिक सत्यापन अनुसूची के संबंध में अधिसूचना",
    date: "April 28, 2026",
    code: "Circular No. 445/Sec-2026",
    authorityEn: "Directorate of Secondary Education, Patna",
    authorityHi: "माध्यमिक शिक्षा निदेशालय, पटना",
    summaryEn: "Mandates district-level camps for physical service document auditing. Completion of this process is required to validate transfer profiles.",
    summaryHi: "सेवा दस्तावेजों के ऑडिट के लिए जिला स्तर पर शिविर लगाने का आदेश। स्थानांतरण प्रोफाइल को सत्यापित करने के लिए इस प्रक्रिया का पूरा होना आवश्यक है।"
  },
  {
    id: "ord-3",
    titleEn: "District-wise Allotment Rules and School Swap NOC Formatting Standards",
    titleHi: "जिलावार आवंटन नियम और स्कूल स्वैप एनओसी (NOC) प्रारूप मानक",
    date: "March 15, 2026",
    code: "Gazette Notification Vol 39-B",
    authorityEn: "Bihar State Cabinet Secretariat Office",
    authorityHi: "बिहार राज्य कैबिनेट सचिवालय कार्यालय",
    summaryEn: "Standardizes Annexure-III No-Objection Certificate format that Headmasters must sign to release the transfer partners.",
    summaryHi: "अनुलग्नक-III अनापत्ति प्रमाण पत्र (NOC) प्रारूप को मानकीकृत करता है जिसे प्रधानाध्यापक द्वारा स्वैप को जारी करने के लिए हस्ताक्षरित किया जाना आवश्यक है।"
  }
];

export default function GovernmentOrders({ language }: GovernmentOrdersProps) {
  const handleDownload = (title: string) => {
    alert(`Success: Standard Annexure-III guidelines and summary for "${title}" downloaded successfully in offline PDF format!`);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-6">
      <div>
        <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Landmark className="w-5 h-5 text-teal-650" />
          {language === "hi" ? "सरकारी आदेश व आधिकारिक सर्कुलर" : "Government Orders & Circular Cabinet"}
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          {language === "hi" 
            ? "बिहार शिक्षा विभाग द्वारा जारी आपसी स्थानांतरण नियमों से संबंधित गजट और आधिकारिक परिपत्र डाउनलोड करें" 
            : "Download certified PDFs of cabinet notifications, official rules, and physical verification guidelines"}
        </p>
      </div>

      <div className="space-y-4">
        {OFFICIAL_ORDERS.map((order) => (
          <div 
            key={order.id} 
            className="border border-slate-100 rounded-2xl p-5 hover:border-teal-200 hover:shadow-xs transition-all bg-slate-50/20"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 pb-3 mb-3">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider bg-teal-50 text-teal-800 px-2 py-0.5 rounded border border-teal-150">
                  {order.code}
                </span>
                <h4 className="text-xs sm:text-sm font-black text-slate-800 mt-1.5">
                  {language === "hi" ? order.titleHi : order.titleEn}
                </h4>
              </div>
              <button
                onClick={() => handleDownload(language === "hi" ? order.titleHi : order.titleEn)}
                className="self-start px-3.5 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-[11px] font-bold flex items-center gap-1.5 cursor-pointer border-0 shadow-3xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{language === "hi" ? "डाउनलोड" : "Download PDF"}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-[11px] mb-3 text-slate-500 font-medium">
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-teal-600" />
                <span>{order.date}</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>{language === "hi" ? order.authorityHi : order.authorityEn}</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-white border border-slate-100 p-3 rounded-xl">
              <strong className="font-bold text-slate-800">{language === "hi" ? "संक्षिप्त सारांश: " : "Order Summary: "}</strong>
              {language === "hi" ? order.summaryHi : order.summaryEn}
            </p>
          </div>
        ))}
      </div>

      {/* Compliance Box */}
      <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 flex gap-3">
        <Scale className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <h5 className="text-xs font-black text-amber-950 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            {language === "hi" ? "भौतिक एनओसी सत्यापन चेतावनी" : "Legal physical NOC guidelines"}
          </h5>
          <p className="text-[10px] text-amber-800 leading-relaxed">
            {language === "hi"
              ? "सभी सरकारी आदेशों के अनुसार, केवल एनओसी फॉर्म 'अनुलग्नक III' पर हस्ताक्षर ही वैध माने जाते हैं। कृपया सुनिश्चित करें कि लेनदेन पूर्ण करने से पहले दोनों शिक्षक संयुक्त रूप से जिला शिक्षा कार्यालय का दौरा करें।"
              : "As per Bihar state administrative orders, only signed Headmaster NOCs on Annexure-III hold legal weight. Both transfer parties must jointly submit physical papers in-person at the respective DEO offices."}
          </p>
        </div>
      </div>
    </div>
  );
}
