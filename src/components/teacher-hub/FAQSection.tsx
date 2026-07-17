import React, { useState } from "react";
import { HelpCircle, ChevronDown, ChevronUp, BookOpen, Scale, Sparkles } from "lucide-react";

interface FAQSectionProps {
  language: "en" | "hi";
}

interface FAQItem {
  qEn: string;
  qHi: string;
  aEn: string;
  aHi: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    qEn: "What is a Mutual Transfer in Bihar BPSC Teacher rules?",
    qHi: "बिहार बीपीएससी शिक्षक नियमों में आपसी स्थानांतरण (Mutual Transfer) क्या है?",
    aEn: "Mutual Transfer is a reciprocal swap arrangement where two teachers working in different districts, blocks, or schools within the same class category and teaching the same subject agree to swap their postings. This is permitted by the Education Department of Bihar subject to clean service records and submission of NOCs.",
    aHi: "आपसी स्थानांतरण (Mutual Transfer) एक पारस्परिक अदला-बदली व्यवस्था है जहां एक ही वर्ग श्रेणी (Class category) और एक ही विषय पढ़ाने वाले दो अलग-अलग जिलों, प्रखंडों या स्कूलों के शिक्षक अपने पदों की अदला-बदली करने के लिए सहमत होते हैं। इसे बिहार शिक्षा विभाग द्वारा सेवा रिकॉर्ड सही होने और अनापत्ति प्रमाण पत्र (NOC) जमा करने पर अनुमति दी जाती है।"
  },
  {
    qEn: "Am I eligible for mutual transfer if I am a BPSC TRE 1.0 or TRE 2.0 teacher?",
    qHi: "यदि मैं बीपीएससी टीआरई 1.0 या टीआरई 2.0 शिक्षक हूं तो क्या मैं आपसी स्थानांतरण के लिए पात्र हूं?",
    aEn: "Yes! Both BPSC TRE 1.0, TRE 2.0, and TRE 3.0 teachers are eligible to apply for mutual transfer, provided they have completed their probation period or have completed physical verification and possess valid permanent teacher employee IDs (PRAN/Employee ID).",
    aHi: "हाँ! बीपीएससी टीआरई 1.0, टीआरई 2.0 और टीआरई 3.0 तीनों शिक्षक आपसी स्थानांतरण के लिए आवेदन करने के पात्र हैं, बशर्ते उन्होंने अपनी परिवीक्षा अवधि (probation period) पूरी कर ली हो या उनका भौतिक सत्यापन पूरा हो चुका हो और उनके पास वैध स्थायी शिक्षक कर्मचारी आईडी (PRAN/Employee ID) हो।"
  },
  {
    qEn: "Can a Primary Teacher (Class 1-5) swap with a Middle School Teacher (Class 6-8)?",
    qHi: "क्या प्राथमिक शिक्षक (कक्षा 1-5) मध्य विद्यालय शिक्षक (कक्षा 6-8) के साथ स्थानांतरण कर सकता है?",
    aEn: "No, mutual transfers can only take place between teachers of the exact same class category (e.g., Primary with Primary, Middle with Middle, Secondary with Secondary). Swapping across levels is strictly prohibited.",
    aHi: "नहीं, आपसी स्थानांतरण केवल एक ही वर्ग श्रेणी के शिक्षकों के बीच हो सकता है (जैसे प्राथमिक का प्राथमिक से, मध्य विद्यालय का मध्य से, माध्यमिक का माध्यमिक से)। स्तरों के बीच अदला-बदली की सख्त मनाही है।"
  },
  {
    qEn: "Is it mandatory to have the exact same subject for a Mutual Transfer?",
    qHi: "क्या आपसी स्थानांतरण के लिए दोनों शिक्षकों का विषय समान होना अनिवार्य है?",
    aEn: "Yes. For Secondary (9-10) and Senior Secondary (11-12) teachers, both mutual transfer partners must be appointed under the exact same teaching subject (e.g., Mathematics with Mathematics). For Primary (1-5) general teachers, they can swap with any other Primary general teacher.",
    aHi: "हाँ। माध्यमिक (9-10) और उच्च माध्यमिक (11-12) शिक्षकों के लिए, दोनों आपसी स्थानांतरण भागीदारों को समान शिक्षण विषय (जैसे गणित का गणित के साथ) के तहत नियुक्त किया जाना चाहिए। प्राथमिक (1-5) सामान्य शिक्षकों के लिए, वे किसी अन्य प्राथमिक सामान्य शिक्षक के साथ अदला-बदली कर सकते हैं।"
  },
  {
    qEn: "What is the step-by-step physical process to finalize the transfer after finding a partner?",
    qHi: "पार्टनर मिलने के बाद ट्रांसफर को अंतिम रूप देने की भौतिक प्रक्रिया क्या है?",
    aEn: "1. Mutually accept proposal on Paisa Blueprint and download the matching document.\n2. Write a joint application for Mutual Transfer address to the District Education Officer (DEO) of both districts.\n3. Secure No-Objection Certificates (NOC) from your respective school Headmasters.\n4. Submit the joint file along with your BPSC joining letter, recommendation letters, and PRAN records to the DEO office.\n5. Upon DEO clearance and Bihar Education Department orders, release letters are issued for immediate joining.",
    aHi: "1. पैसा ब्लूप्रिंट पर आपसी प्रस्ताव स्वीकार करें और मैचिंग विवरण डाउनलोड करें।\n2. दोनों जिलों के जिला शिक्षा अधिकारी (DEO) को संबोधित आपसी स्थानांतरण के लिए एक संयुक्त आवेदन पत्र लिखें।\n3. अपने-अपने स्कूल के प्रधानाध्यापकों (HM) से अनापत्ति प्रमाण पत्र (NOC) प्राप्त करें।\n4. अपनी बीपीएससी जॉइनिंग लेटर, प्रधानाध्यापक की अनुशंसा और प्राण (PRAN) रिकॉर्ड के साथ संयुक्त फाइल डीईओ कार्यालय में जमा करें।\n5. डीईओ की मंजूरी और बिहार शिक्षा विभाग के अंतिम आदेश पर, तत्काल कार्यमुक्ति और नए स्कूल में योगदान पत्र जारी कर दिया जाता है।"
  },
  {
    qEn: "How does Paisa Blueprint protect teacher privacy?",
    qHi: "पैसा ब्लूप्रिंट शिक्षकों की गोपनीयता की रक्षा कैसे करता है?",
    aEn: "We strictly hide all private identifiers (Phone Number, Email, Employee ID, and Exact Address) from our public directories. Other teachers can only see your name, subject, current school, current block, and your desired district/block. Your contact number is ONLY revealed after BOTH you and the other teacher explicitly click 'Accept Proposal' on the dashboard. This ensures absolute safety from spam and unsolicited calls.",
    aHi: "हम अपनी सार्वजनिक सूचियों से सभी निजी पहचानकर्ताओं (फोन नंबर, ईमेल, कर्मचारी आईडी और सटीक पता) को पूरी तरह से छिपाकर रखते हैं। अन्य शिक्षक केवल आपका नाम, विषय, वर्तमान स्कूल, वर्तमान प्रखंड और आपकी वांछित जिला/प्रखंड देख सकते हैं। आपका संपर्क नंबर केवल तभी प्रदर्शित होता है जब आप और दूसरे शिक्षक दोनों डैशबोर्ड पर स्पष्ट रूप से 'स्वीकार करें' पर क्लिक करते हैं। यह स्पैम और अवांछित कॉल से पूर्ण सुरक्षा सुनिश्चित करता है।"
  }
];

export default function FAQSection({ language }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
          <HelpCircle className="w-5 h-5 text-teal-600" />
        </div>
        <div>
          <h3 className="text-lg font-black text-slate-900 tracking-tight">
            {language === "hi" ? "आपसी स्थानांतरण सामान्य प्रश्न (FAQ)" : "Mutual Transfer Help & FAQ"}
          </h3>
          <p className="text-xs text-slate-500">
            {language === "hi" 
              ? "बिहार बीपीएससी शिक्षक नियमावली 2024-2026 के अनुसार आपसी स्थानांतरण की पूरी मार्गदर्शिका" 
              : "Everything you need to know about eligibility, department guidelines, and compliance"}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {FAQ_ITEMS.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div 
              key={idx} 
              className={`border border-slate-100 rounded-2xl transition-all overflow-hidden ${
                isOpen ? "bg-slate-50/50 border-teal-200" : "bg-white"
              }`}
            >
              <button
                onClick={() => toggleItem(idx)}
                className="w-full flex items-center justify-between p-4 text-left font-bold text-xs sm:text-sm text-slate-800 hover:text-teal-700 transition-colors"
              >
                <span>{language === "hi" ? item.qHi : item.qEn}</span>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-teal-650 shrink-0 ml-2" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                )}
              </button>

              {isOpen && (
                <div className="p-4 pt-0 border-t border-slate-100 text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {language === "hi" ? item.aHi : item.aEn}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Compliance Box */}
      <div className="mt-6 p-4 bg-teal-50/60 border border-teal-150 rounded-2xl flex gap-3">
        <Scale className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h5 className="text-xs font-black text-teal-900 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            {language === "hi" ? "बिहार सरकारी राजपत्र अनुपालन" : "Bihar Education Department Rules Compliant"}
          </h5>
          <p className="text-[11px] text-teal-800 leading-relaxed">
            {language === "hi"
              ? "यह पोर्टल शिक्षकों के आपसी सहमति फॉर्म (Mutual Form Annexure III) के आवश्यक मानदंडों के अनुसार कार्य करता है। यह किसी भी रूप में आधिकारिक सरकारी आवेदन का स्थान नहीं लेता है, बल्कि दोनों पक्षों को मिलाने का माध्यम है।"
              : "This tool strictly operates as a matchmaking portal to help Bihar state teachers locate each other. It does not replace the official department submission on the Bihar e-Shikshakosh Portal."}
          </p>
        </div>
      </div>
    </div>
  );
}
