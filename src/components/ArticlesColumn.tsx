import React, { useState } from "react";
import { BookOpen, Sparkles, Flame, Search, ArrowRight, X, Clock, HelpCircle, HeartPulse, Percent, Coins, Milestone, Languages, Share2 } from "lucide-react";
import { getShareableLink } from "../types";

interface Article {
  id: string;
  category: "Investment" | "Tax" | "Saving" | "Retirement";
  readTime: "3 mins read" | "4 mins read" | "5 mins read" | "3 मिनट" | "4 मिनट" | "5 मिनट";
  importance: "High" | "Critical" | "Standard";
  targetedWidget: "tax" | "sip" | "salary" | "health" | "retirement";
  icon: React.ReactNode;
  
  // Bilingual structures
  en: {
    title: string;
    summary: string;
    content: string[];
  };
  hi: {
    title: string;
    summary: string;
    content: string[];
  };
}

interface ArticlesColumnProps {
  onNavigateToWidget: (widgetId: any) => void;
  userMonthlySalary: number;
  language?: "en" | "hi";
  onLanguageChange?: (lang: "en" | "hi") => void;
}

export default function ArticlesColumn({ onNavigateToWidget, userMonthlySalary, language: propLanguage, onLanguageChange }: ArticlesColumnProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [internalLanguage, setInternalLanguage] = useState<"en" | "hi">(() => {
    return (localStorage.getItem("paisa_lang_selection") as "en" | "hi") || "hi";
  });

  const language = propLanguage || internalLanguage;
  const setLanguage = (lang: "en" | "hi") => {
    localStorage.setItem("paisa_lang_selection", lang);
    localStorage.setItem("paisa_language", lang);
    if (onLanguageChange) {
      onLanguageChange(lang);
    } else {
      setInternalLanguage(lang);
    }
  };

  const articles: Article[] = [
    {
      id: "bpsc-teach-1",
      category: "Saving",
      readTime: language === "hi" ? "4 मिनट" : "4 mins read",
      importance: "Critical",
      targetedWidget: "salary",
      icon: <Milestone className="w-4 h-4 text-emerald-500" />,
      en: {
        title: "BPSC Teacher Salary Structure (Classes 1 to 8): Complete Breakdown",
        summary: "Are you preparing for or recruited in Bihar BPSC TRE Class 1-8? Learn about basic pay (₹25k-₹28k), Dearness Allowance (DA), HRA, Medical allowance, and NPS savings.",
        content: [
          "BPSC Primary Teachers (Classes 1-5) start with a Basic Pay of ₹25,000, while Middle School Teachers (Classes 6-8) have a Basic Pay of ₹28,000.",
          "On top of the Basic Pay, Bihar Government pays Dearness Allowance (DA) (currently at 50% of basic pay), House Rent Allowance (HRA) (ranging between 4%, 8%, 16% depending on rural, semi-urban, or metro posting), and a fixed Medical Allowance of ₹1,000 per month.",
          "Let's calculate the Gross and In-hand Salary structures:",
          "• For Primary Teacher (Classes 1-5): Basic ₹25,000 + DA ₹12,500 + HRA (at 8% urban rate) ₹2,000 + Medical ₹1,000 = Gross Salary of ₹40,500.",
          "• For Middle Teacher (Classes 6-8): Basic ₹28,000 + DA ₹14,000 + HRA (at 8% urban rate) ₹2,240 + Medical ₹1,000 = Gross Salary of ₹45,240.",
          "Deductions: Contribution to the National Pension Scheme (NPS) is mandatory at 10% of (Basic + DA), which amounts to ₹3,750 for primary teachers and ₹4,200 for middle schools. State insurance (GIS) of ₹30 is also deducted.",
          "Net In-Hand Payouts: Approximately ₹36,720 for Primary Teachers and ₹41,010 for Middle School Teachers under rural-to-urban standard post. Learn how to allocate these earnings in our Salary Planner!"
        ]
      },
      hi: {
        title: "BPSC शिक्षक वेतन संरचना (कक्षा 1 से 8): मूल वेतन, महंगाई भत्ता (DA) और पूरी गणना",
        summary: "क्या आप बिहार BPSC TRE 1-8 परीक्षा की तैयारी कर रहे हैं? जानिए मूल वेतन (₹25,000-₹28,000), महंगाई भत्ता (DA), मकान किराया (HRA), चिकित्सा भत्ता और NPS कटौती का विवरण।",
        content: [
          "BPSC प्राथमिक शिक्षकों (कक्षा 1-5) का मूल वेतन ₹25,000 से शुरू होता है, जबकि मध्य विद्यालय शिक्षकों (कक्षा 6-8) का शुरुआती मूल वेतन ₹28,000 है।",
          "इस मूल वेतन के अलावा, बिहार सरकार महंगाई भत्ता (DA) (वर्तमान में मूल वेतन का 50%), मकान किराया भत्ता (HRA) (ग्रामीण, अर्ध-शहरी या मेट्रो स्तर के आधार पर 4%, 8%, 16%) और ₹1,000 मासिक चिकित्सा भत्ता देती है।",
          "आइए कुल ग्रॉस तथा इन-हैंड वेतन संरचना की गणना देखें (8% शहरी HRA मानते हुए):",
          "• प्राथमिक शिक्षक (कक्षा 1-5): मूल वेतन ₹25,000 + DA ₹12,500 + HRA ₹2,000 + चिकित्सा ₹1,000 = कुल ग्रॉस वेतन ₹40,500।",
          "• मध्य शिक्षक (कक्षा 6-8): मूल वेतन ₹28,000 + DA ₹14,000 + HRA ₹2,240 + चिकित्सा ₹1,000 = कुल ग्रॉस वेतन ₹45,240।",
          "कटौतियां: राष्ट्रीय पेंशन योजना (NPS) में योगदान (मूल वेतन + DA का 10%) अनिवार्य है, जो प्राथमिक शिक्षकों के लिए ₹3,750 और मध्य विद्यालय शिक्षकों के लिए ₹4,200 है। ₹30 का राज्य समूह बीमा (GIS) भी काटा जाता है।",
          "वास्तविक इन-हैंड सैलरी: प्राथमिक शिक्षकों को लगभग ₹36,720 और मध्य विद्यालय शिक्षकों को लगभग ₹41,010 मिलते हैं। इस सैलरी को बेहतर तरीके से प्रबंधित करने के लिए हमारे सैलरी प्लानर का उपयोग करें!"
        ]
      }
    },
    {
      id: "bpsc-teach-2",
      category: "Retirement",
      readTime: language === "hi" ? "4 मिनट" : "4 mins read",
      importance: "Critical",
      targetedWidget: "salary",
      icon: <Sparkles className="w-4 h-4 text-amber-500" />,
      en: {
        title: "BPSC TGT & PGT High School Teacher Salary Breakdown (Classes 9 to 12)",
        summary: "Discover the detailed pay structure for Class 9-10 (TGT) and Class 11-12 (PGT) teachers recruited under BPSC TRE. Includes NPS pensions and HRA perks.",
        content: [
          "BPSC Secondary School Teachers (TGT Classes 9-10) start with a Basic Pay of ₹31,000, while Higher Secondary Teachers (PGT Classes 11-12) command a Basic Pay of ₹32,000.",
          "Just like primary schools, high school teachers enjoy a 50% Dearness Allowance (DA), HRA (4% to 16%), and ₹1,000 medical allowances, yielding stronger cash compensation.",
          "Let's compute the monthly earning ledger (assuming standard 8% HRA zone):",
          "• TGT High School Teacher (Classes 9-10): Basic ₹31,000 + DA ₹15,500 + HRA ₹2,480 + Medical ₹1,000 = Gross Salary of ₹49,980.",
          "• PGT Higher Secondary Teacher (Classes 11-12): Basic ₹32,000 + DA ₹16,000 + HRA ₹2,560 + Medical ₹1,000 = Gross Salary of ₹51,560.",
          "Compulsory Pension Deductions: NPS deduction at 10% of (Basic + DA) accounts for ₹4,650 for TGTs and ₹4,800 for PGTs. Additionally, the Government of Bihar matches with a generous 14% NPS contribution (added directly to your Tier 1 pension ledger).",
          "Total Net In-Hand Salary: TGT teachers take home approx ₹45,300 per month, while higher secondary PGT post-holders clean up approx ₹46,730 per month. Check your compounding pension corpus using our Retirement limits tab."
        ]
      },
      hi: {
        title: "BPSC TGT और PGT हाई स्कूल शिक्षक वेतन: कक्षा 9 से 12 तक पूरा ब्यौरा",
        summary: "BPSC TRE के तहत नियुक्त होने वाले कक्षा 9-10 (TGT) और कक्षा 11-12 (PGT) शिक्षकों के वेतनमान, महंगाई भत्ता, एनपीएस पेंशन स्कीम तथा मकान किराए भत्ते की संपूर्ण जानकारी।",
        content: [
          "BPSC माध्यमिक विद्यालय शिक्षकों (TGT कक्षा 9-10) का मूल वेतन ₹31,000 से शुरू होता है, जबकि उच्च माध्यमिक शिक्षकों (PGT कक्षा 11-12) का मूल वेतन ₹32,000 है।",
          "हाई स्कूल शिक्षकों को 50% महंगाई भत्ता (DA) मिलता है, तथा नियुक्ति स्थान के अनुसार 4% से 16% तक मकान किराया भत्ता (HRA) व ₹1,000 चिकित्सा भत्ता प्रदान किया जाता है।",
          "आइए मासिक ग्रॉस वेतन की विस्तृत गणना देखें (8% शहरी HRA के अनुसार):",
          "• TGT हाई स्कूल शिक्षक (कक्षा 9-10): मूल वेतन ₹31,000 + DA ₹15,500 + HRA ₹2,480 + चिकित्सा ₹1,000 = ग्रॉस सैलरी ₹49,980।",
          "• PGT उच्च माध्यमिक शिक्षक (कक्षा 11-12): मूल वेतन ₹32,000 + DA ₹16,000 + HRA ₹2,560 + चिकित्सा ₹1,000 = ग्रॉस सैलरी ₹51,560।",
          "एनपीएस पेंशन कटौती: मूल वेतन + DA का 10% अनिवार्य एनपीएस खाता कटौती है। यानी TGT के खाते से ₹4,650 तथा PGT के खाते से ₹4,800 कटते हैं। इसके संरेखित बिहार सरकार भी 14% अतिरिक्त नियोक्ता योगदान सीधे आपके NPS खाते में जमा करती है।",
          "वास्तविक इन-हैंड नेट सैलरी: TGT शिक्षकों को लगभग ₹45,300 और PGT शिक्षकों को लगभग ₹46,730 मासिक प्राप्त होते हैं। भविष्य की बचत और निवेश की योजना बनाने के लिए हमारे टूल्स का लाभ लें!"
        ]
      }
    },
    {
      id: "art-1",
      category: "Investment",
      readTime: language === "hi" ? "4 मिनट" : "4 mins read",
      importance: "Critical",
      targetedWidget: "sip",
      icon: <Coins className="w-4 h-4 text-emerald-500" />,
      en: {
        title: "Direct Mutual Funds Over Regular: The ₹1.5 Cr Wealth Multiplier",
        summary: "Skip banking distributors and advisors who charge 1% in commissions. See how small recurring fees compound to drain millions from your retirement corpus.",
        content: [
          "In India, direct mutual funds have no distributor commissions, resulting in a lower expense ratio—often 0.75% to 1.5% lower than regular funds.",
          "While a difference of 1% a year sounds negligible, under the rule of continuous fractional compounding, it works against your corpus for 20 to 30 years.",
          "Example calculation: If you invest ₹25,000 monthly for 25 years at an expected CAGR of 12%:",
          "• With Direct Funds (12% CAGR): Your final portfolio compounds to approximately ₹4.70 Crores.",
          "• With Regular Funds representing 1% extra charges (11% CAGR): Your final portfolio compounds to only ₹3.75 Crores.",
          "• That is a staggering loss of ₹95 Lakhs paid solely in background commissions!",
          "Always search for mutual funds containing the word 'Direct' in their name rather than 'Regular'. Use the SIP Calculator to plan your step-up compounding goals without leaks."
        ]
      },
      hi: {
        title: "डायरेक्ट म्यूचुअल फंड बनाम रेगुलर: ₹1.5 करोड़ की वेल्थ का सीक्रेट कम्पाउंडिंग गणित",
        summary: "बैंकों और डिस्ट्रीब्यूटर्स के 1% कमीशन से बचें। देखें कि कैसे छोटे-छोटे सालाना चार्ज आपके रिटायरमेंट कॉर्पस को लाखों-करोड़ों रुपये तक नुकसान पहुँचा सकते हैं।",
        content: [
          "भारत में डायरेक्ट म्यूचुअल फंड में कोई डिस्ट्रीब्यूटर कमीशन या एजेंट फीस नहीं होती है, जिसके कारण इनका एक्सपेंस रेशियो (Expense Ratio) अक्सर रेगुलर फंड से 0.75% से 1.5% तक कम होता है।",
          "हालांकि प्रति वर्ष 1% का अंतर बहुत छोटा लगता है, लेकिन लगातार चक्रवृद्धि (fractional compounding) के प्रभाव के कारण यह 20 से 30 वर्षों में आपके कुल फंड को बहुत कम कर देता है।",
          "उदाहरण गणना: यदि आप ₹25,000 मासिक एसआईपी (SIP) निवेश 25 वर्षों के लिए 12% की अपेक्षित सालाना दर (CAGR) से करते हैं:",
          "• डायरेक्ट म्यूचुअल फंड के साथ (12% CAGR): आपका फाइनल पोर्टफोलियो लगभग ₹4.70 करोड़ हो जाता है।",
          "• रेगुलर फंड के साथ (जिसमें 1% कमीशन शुल्क शामिल है - 11% CAGR): आपका फाइनल पोर्टफोलियो केवल ₹3.75 करोड़ ही बन पाता है।",
          "• यानी बिना किसी वजह के बैकग्राउंड कमीशन में आपकी गाढ़ी कमाई से लगभग ₹95 लाख का सीधा नुकसान!",
          "हमेशा उन म्यूचुअल फंड्स को चुनें जिनके नाम में 'Regular' के बजाय 'Direct' शब्द लिखा हो। अपने लक्ष्यों की ठीक से गणना करने के लिए हमारे SIP Calculator का उपयोग करें।"
        ]
      }
    },
    {
      id: "art-2",
      category: "Tax",
      readTime: language === "hi" ? "5 मिनट" : "5 mins read",
      importance: "Critical",
      targetedWidget: "tax",
      icon: <Percent className="w-4 h-4 text-orange-500" />,
      en: {
        title: "Decoupling the Regime Conundrum: New vs. Old Tax Regime Slabs",
        summary: "With FY 2024-25 updates, the New Tax regime is the standard default. Calculate when standard Old regime deductions can save you more money.",
        content: [
          "The standard default tax regime in India now has highly compressed slabs with lower peak rates, alongside a standard deduction of ₹75,000 for salaried employees.",
          "However, the Old Tax Regime allows extensive deductions that remain incredibly powerful for certain brackets:",
          "• Section 80C limit: Up to ₹1.5 Lakhs (EPF, PPF, ELSS, School fees, principal house loan repayment).",
          "• Section 24b House Loan Interest: Up to ₹2 Lakhs on home loan interest payments.",
          "• Section 80D Mediclaim: Up to ₹75,050 (for self, dependents, and senior citizen parents' healthcare premium).",
          "• HRA component exemption: Complete deduction on house rent paid according to metro or non-metro formulas.",
          "Rule of thumb: If your combined tax-saving deductions exceed ₹3,75,000 a year, the Old Tax Regime will likely save you more taxes. Go to the Tax Planner to run a side-by-side simulation tailored to your active profile salary."
        ]
      },
      hi: {
        title: "टैक्स का सही चुनाव: नई बनाम पुरानी टैक्स प्रणाली (New vs Old Tax Regime Slabs)",
        summary: "वित्त वर्ष 2024-25 के अपडेट के साथ, नया टैक्स स्लैब डिफॉल्ट हो गया है। जानें कि निवेश और छूट के साथ पुरानी प्रणाली कब आपके लिए फायदेमंद हो सकती है।",
        content: [
          "भारत में नई कर प्रणाली (New Tax Regime) में कम टैक्स दरें और वेतनभोगी कर्मचारियों के लिए ₹75,000 की मानक कटौती (Standard Deduction) दी गई है।",
          "इसके विपरीत, पुरानी कर प्रणाली (Old Tax Regime) उन लोगों के लिए बेहद शक्तिशाली है जो विभिन्न टैक्स-बचत धाराओं (deductions) में निवेश करते हैं:",
          "• धारा 80C की सीमा: ₹1.5 लाख तक की छूट (EPF, PPF, ELSS, बच्चों की ट्यूशन फीस, आदि)।",
          "• धारा 24b गृह ऋण ब्याज: होम लोन के ब्याज भुगतान पर ₹2 लाख तक की वार्षिक छूट।",
          "• धारा 80D स्वास्थ्य बीमा: स्वयं, परिवार व वरिष्ठ नागरिक माता-पिता के लिए ₹75,000 तक की छूट।",
          "• एचआरए (HRA) किराया छूट: मेट्रो या नॉन-मेट्रो शहरों के नियमानुसार मकान किराया भुगतान पर शानदार छूट।",
          "सिद्धांत यह है: यदि आपकी कुल टैक्स-बचत कटौतियां सालाना ₹3,75,000 से अधिक हैं, तो पुरानी टैक्स व्यवस्था आपके लिए अधिक फायदेमंद रहेगी। टैक्स प्लानर (Tax Planner) टूल का उपयोग करके तुरंत दोनों पद्धतियों की तुलना करें।"
        ]
      }
    },
    {
      id: "art-3",
      category: "Saving",
      readTime: language === "hi" ? "3 मिनट" : "3 mins read",
      importance: "High",
      targetedWidget: "health",
      icon: <HeartPulse className="w-4 h-4 text-rose-500" />,
      en: {
        title: "Why Traditional ULIPs and Endowment Policies are Wealth Destroyers",
        summary: "Combining protection & investment often returns worse than savings accounts. Break the cycle of lock-ins and embrace Direct Mutual Funds plus Direct Term Insurance.",
        content: [
          "Unit Linked Insurance Plans (ULIPs) and traditional LIC endowment policies often promise guaranteed moneyback returns or market upsides with insurance coverage. This is a suboptimal arrangement.",
          "These plans suffer from heavy upfront charges (premium allocation fees, policy admin charges, and high mortality fees) that eat up your principal in the first 5 years.",
          "The average net yield on endowment policies hovers at an underwhelming 4.5% to 6%, lagging well behind inflation.",
          "A cleaner, safer, and far more lethal alternative is to keep Insurance and Investment strictly separate:",
          "1. Buy a pure, low-cost Term Insurance plan that covers at least 15x to 20x of your annual salary in standard contingencies.",
          "2. Allocate your actual savings directly to Nifty 50 Index Mutual Funds and Smallcap/Midcap equity plans.",
          "This split approach guarantees superior security and double-digit average compound annual growth."
        ]
      },
      hi: {
        title: "पारम्परिक यूलिप (ULIP) और एंडोमेंट पॉलिसियां क्यों हैं वेल्थ डिस्ट्रॉयर?",
        summary: "बीमा व निवेश को मिलाना अक्सर घाटे का सौदा होता है। यूलिप के लॉक-इन चक्र को तोड़ें और 'टर्म इंश्योरेंस + डायरेक्ट म्यूचुअल फंड' की बेहतरीन रणनीति अपनाएं।",
        content: [
          "यूनिट लिंक्ड इंश्योरेंस प्लान (ULIP) और पारंपरिक मनीबैक पॉलिसियां सुरक्षा के साथ गारंटीड रिटर्न का वादा करती हैं, लेकिन ये बहुत कम मुनाफा देती हैं।",
          "इन योजनाओं में शुरुआती 5 वर्षों में पॉलिसी एडमिनिस्ट्रेशन, मृत्यु दर शुल्क (Mortality charges) व आवंटन शुल्क काफी अधिक काटे जाते हैं, जिससे आपका मूलधन बहुत कम रह जाता है।",
          "ऐसी पॉलिसियों का औसत सालाना रिटर्न केवल 4.5% से 6% के आसपास रहता है, जो महंगाई दर को भी मात नहीं दे पाता।",
          "इसका सबसे सरल, सुरक्षित और पावरफुल विकल्प इंश्योरेंस व इन्वेस्टमेंट को हमेशा अलग रखना है:",
          "1. अपने सालाना पैकेज/वेतन का कम से कम 15 से 20 गुना का एक प्योर टर्म इंश्योरेंस लें (जो बहुत कम खर्च में मिल जाता है)।",
          "2. बचे हुए पैसे को सीधे निफ्टी 50 इंडेक्स या अन्य किसी डायरेक्ट म्यूचुअल फंड में निवेश करें।",
          "इस दोहरे दृष्टिकोण से आपको बेहतरीन जीवन सुरक्षा और दो अंकों (Double digit) में कम्पाउंडिंग रिटर्न मिलता है।"
        ]
      }
    },
    {
      id: "art-4",
      category: "Tax",
      readTime: language === "hi" ? "3 मिनट" : "3 mins read",
      importance: "Standard",
      targetedWidget: "salary",
      icon: <Milestone className="w-4 h-4 text-sky-500" />,
      en: {
        title: "Unlocking the NPS Section 80CCD(1B) ₹50,000 Tax Waiver Bonus",
        summary: "Most salaried professionals ignore the exclusive additional retirement deduction beyond the ₹1.5L umbrella of 80C. Learn how NPS Tier 1 delivers.",
        content: [
          "National Pension System (NPS) Tier-1 offers an exclusive deduction under Section 80CCD(1B) of the Income Tax Act.",
          "This deduction permits a maximum waiver of up to ₹50,000 annually. Crucially, this benefit is completely over and above the traditional Section 80C limit of ₹1,50,000.",
          "For a salaried taxpayer sitting in the peak 30% tax bracket, investing ₹50,000 in NPS yields immediate cash savings of ₹15,600 each financial year in taxes.",
          "NPS also lets you control asset allocation classes (Equity, Corporate Debt, and Government Securities).",
          "Optimize your future wage breakdowns on the Salary Planner list to review take-home modifications and allocation patterns."
        ]
      },
      hi: {
        title: "एनपीएस धारा 80CCD(1B): पाइए ₹50,000 की एक्स्ट्रा टैक्स छूट का बोनस",
        summary: "ज्यादातर नौकरीपेशा लोग धारा 80C के ₹1.5 लाख के अतिरिक्त मिलने वाले ₹50,000 के खास पेंशन निवेश लाभ को नजरअंदाज कर देते हैं। जानिए एनपीएस कैसे काम करता है।",
        content: [
          "राष्ट्रीय पेंशन प्रणाली (NPS) के टियर-1 खाते में निवेश करने पर इनकम टैक्स एक्ट की धारा 80CCD(1B) के तहत अतिरिक्त टैक्स छूट मिलती है।",
          "यह कटौती आपको सालाना ₹50,000 तक की अतिरिक्त छूट प्रदान करती है, जो कि धारा 80C की ₹1.5 लाख की सीमा से बिल्कुल अलग है।",
          "यदि आप 30% वाले टैक्स स्लैब में आते हैं, तो एनपीएस के माध्यम से ₹50,000 निवेश करने पर आप हर साल ₹15,600 का टैक्स सीधे बचा सकते हैं।",
          "एनपीएस आपको अपने निवेश में इक्विटी और डेट (कर्ज) के अनुपात को अपनी पसंद के अनुसार चुनने की सहूलियत भी देता है।",
          "वेतन नियोजक (Salary Planner) में जाकर अपने वेतन संरचना और टैक्स कटौती के लाभ की तुरंत गणना करें।"
        ]
      }
    },
    {
      id: "art-5",
      category: "Investment",
      readTime: language === "hi" ? "4 मिनट" : "4 mins read",
      importance: "High",
      targetedWidget: "retirement",
      icon: <Sparkles className="w-4 h-4 text-amber-500" />,
      en: {
        title: "The Compounding Step-Up Cheat Sheet: Rule of 72 & Raising SIPs",
        summary: "Do not keep your SIP amount flat. Discover how adding a 10% annual increase matching your corporate promotion cycle completely alters your final estate.",
        content: [
          "Many investors start a standard monthly SIP of ₹10,000 and leave it unchanged for 20 years, ignoring that their salary scale naturally increases with career progressions.",
          "By enforcing a Step-Up SIP (boosting your investment magnitude by just 10% annually to match salary appraisals), you compound wealth exponentially faster.",
          "Let's observe the multiplier over 20 years at a 12% CAGR rate:",
          "• Scenario A (Flat SIP of ₹10,000/month): Total invested capital is ₹24 Lakhs, and the final maturity value is ₹99.9 Lakhs.",
          "• Scenario B (10% Annual Step-up): Your initial SIP starts at ₹10,000, rising to ₹11,000 in Year 2, ₹12,100 in Year 3, etc. Total invested capital becomes ₹68.7 Lakhs, and the final compounded portfolio is a massive ₹2.07 Crores!",
          "A humble 10% annual upgrade produces more than double the final wealth outcome. Learn to balance long-term compounding milestones in the Retirement Planner."
        ]
      },
      hi: {
        title: "कम्पाउंडिंग स्टेप-अप सीक्रेट: हर साल 10% एसआईपी (SIP) बढ़ाकर पाएं दोगुनी वेल्थ",
        summary: "अपने मासिक एसआईपी (SIP) की राशि को कभी भी स्थिर न रखें। हर साल अपने इंक्रीमेंट या प्रमोशन के अनुसार मात्र 10% की बढ़ोतरी करके अपने रिटायरमेंट कॉर्पस को दोगुना से अधिक बढ़ाएं।",
        content: [
          "कई निवेशक सालों-साल ₹10,000 की फ्लैट मासिक एसआईपी जारी रखते हैं, जबकि उनके करियर की प्रगति के साथ उनकी सैलरी लगातार बढ़ती जाती है।",
          "अपनी एसआईपी राशि में मात्र 10% की वार्षिक बढ़ोतरी (Step-up SIP) करके आप अपनी पूंजी को आश्चर्यजनक रूप से तेजी से बढ़ा सकते हैं।",
          "आइए 20 वर्षों के लिए 12% वार्षिक रिटर्न (CAGR) पर तुलना करें:",
          "• विकल्प अ (स्थिर ₹10,000/माह): कुल निवेश ₹24 लाख होगा, तथा मैच्योरिटी वैल्यू लगभग ₹99.9 लाख होगी।",
          "• विकल्प ब (10% वार्षिक स्टेप-अप): आपकी किस्त पहले वर्ष ₹10,000, दूसरे वर्ष ₹11,000, तीसरे वर्ष ₹12,100 होगी। इससे कुल निवेश ₹68.7 लाख होगा और अंतिम कॉपर्स ₹2.07 करोड़ की भारी-भरकम राशि बन जाएगा!",
          "एक छोटा सा 10% का वार्षिक अपग्रेड आपके अंतिम कॉर्पस को दोगुने से भी अधिक बढ़ा देता है। इसके कैलकुलेशन की जांच आज ही हमारे रिटायरमेंट प्लानर (Retirement Planner) में करें।"
        ]
      }
    },
    {
      id: "art-6",
      category: "Saving",
      readTime: language === "hi" ? "4 मिनट" : "4 mins read",
      importance: "High",
      targetedWidget: "health",
      icon: <Milestone className="w-4 h-4 text-sky-500" />,
      en: {
        title: "Renting vs Buying a House in India: The Real Opportunity Cost",
        summary: "Most middle-class families lock major wealth in high-cost real estate. Explore the rent-and-invest strategy vs standard home loan EMIs.",
        content: [
          "In metropolitan India, the rental yield of residential property is extremely low—hovering around 2% to 3% annually.",
          "In comparison, home loan interest rates usually sit around 8.5% to 9.5% per annum, creating a massive 6% 'interest-yield deficit'.",
          "If you buy a house worth ₹1 Crore, your monthly EMI for 20 years at 8.5% is approximately ₹86,700, and you pay about ₹1.08 Crores in total interest alone.",
          "However, renting the same ₹1 Crore house would cost around ₹20,000 to ₹25,000 monthly.",
          "If you rent the house and invest the monthly difference of ₹60,000 in a diversified Nifty index fund (earning ~12% CAGR), your compounding corpus over 20 years swells to nearly ₹6 Crores!",
          "While buying a house offers emotional stability, doing so early using expensive debt can seriously damage your compounding capacity. Evaluate carefully before committing to decades of EMIs."
        ]
      },
      hi: {
        title: "किराए पर रहना बनाम खुद का घर खरीदना: भारतीय शहरों का सच्चा वित्तीय गणित",
        summary: "ज्यादातर मध्यमवर्गीय परिवार भारी होम लोन में अपनी संपत्ति फंसा देते हैं। जानें क्यों किराया देकर बाकी पैसे को निवेश करना घर खरीदने से अधिक पैसा कमा सकता है।",
        content: [
          "भारतीय मेट्रो शहरों में आवासीय संपत्ति का वार्षिक रेंटल यील्ड (किराए से होने वाली वास्तविक कमाई) बहुत कम है—यह केवल 2% से 3% के बीच ही रहता है।",
          "इसकी तुलना में, होम लोन की ब्याज दरें आमतौर पर 8.5% से 9.5% सालाना के बीच होती हैं, जो एक भारी वास्तविक नुकसान पैदा करती हैं।",
          "यदि आप ₹1 करोड़ का घर खरीदते हैं, तो 8.5% ब्याज पर 20 वर्षों के लिए आपकी मासिक ईएमआई (EMI) लगभग ₹86,700 होगी, और आप केवल ब्याज में ₹1.08 करोड़ अतिरिक्त चुकाएंगे।",
          "जबकि उसी ₹1 करोड़ के घर को किराए पर लेने का खर्च केवल ₹20,000 से ₹25,000 मासिक होगा।",
          "यदि आप किराए पर रहकर बची हुई ₹60,000 की राशि को किसी इंडेक्स फंड (12% सालाना रिटर्न) में निवेश करते हैं, तो 20 वर्षों में आपका अंतिम कॉपर्स लगभग ₹6 करोड़ बन सकता है।",
          "घर खरीदना भावनात्मक सुरक्षा जरूर देता है, लेकिन जल्दबाजी में महंगा होम लोन लेकर ऐसा करने से आपकी कम्पाउंडिंग क्षमता पर गंभीर असर पड़ सकता है।"
        ]
      }
    },
    {
      id: "art-7",
      category: "Investment",
      readTime: language === "hi" ? "3 मिनट" : "3 mins read",
      importance: "High",
      targetedWidget: "sip",
      icon: <Coins className="w-4 h-4 text-emerald-500" />,
      en: {
        title: "Sovereign Gold Bonds (SGB): Earn Extra 2.5% Annual Interest Bonus",
        summary: "Stop buying physical gold or digital gold with high making charges. Learn why RBI-backed SGBs offer premium tax-free compounding.",
        content: [
          "Sovereign Gold Bonds are government-backed securities issued by the Reserve Bank of India representing gold weights.",
          "Unlike physical gold, you pay zero lockers charges, zero GST, and zero making charges. Furthermore, SGBs offer an additional guaranteed 2.5% interest per year on your initial investment, disbursed bi-annually.",
          "The biggest advantage: Under Section 47(viib) of the Income Tax Act, the capital gains tax at the time of maturity (8 years) is 100% tax-free.",
          "This makes SGB the absolute cleanest and most high-yielding way to hold gold in your portfolio as an inflation hedge. Keep gold exposure capped at 5% to 10% of total wealth."
        ]
      },
      hi: {
        title: "सॉवरेन गोल्ड बॉन्ड (SGB): सोने के भाव बढ़ने के साथ हर साल पाएं 2.5% सुरक्षित सरकारी ब्याज",
        summary: "मेकिंग चार्ज और जीएसटी वाले पारंपरिक भौतिक सोने से बचें। जानिए आरबीआई (RBI) के सॉवरेन गोल्ड बॉन्ड क्यों निवेश का सबसे शानदार और टैक्स-फ्री माध्यम हैं।",
        content: [
          "सॉवरेन गोल्ड बॉन्ड भारत सरकार की ओर से रिज़र्व बैंक (RBI) द्वारा जारी की जाने वाली सुरक्षित स्वर्ण प्रतिभूतियां हैं।",
          "भौतिक सोने के विपरीत, इसमें कोई लॉकर चार्ज, जीएसटी (GST) या मेकिंग चार्ज नहीं देना होता है और इस पर आपकी शुरुआती निवेश राशि पर प्रति वर्ष 2.5% अतिरिक्त ब्याज भी मिलता है।",
          "सबसे बड़ा लाभ: आयकर अधिनियम की धारा 47(viib) के तहत, मैच्योरिटी (8 वर्ष) के समय होने वाला पूरा कैपिटल गेन टैक्स (पूंजीगत लाभ कर) 100% टैक्स-फ्री होता है।",
          "अपने कुल पोर्टफोलियो में सोने की हिस्सेदारी को 5% से 10% तक सीमित रखें, तथा निवेश के लिए SGB को ही प्राथमिकता दें।"
        ]
      }
    },
    {
      id: "art-8",
      category: "Tax",
      readTime: language === "hi" ? "4 मिनट" : "4 mins read",
      importance: "Standard",
      targetedWidget: "tax",
      icon: <Percent className="w-4 h-4 text-orange-500" />,
      en: {
        title: "Tax Harvesting under Section 112A: Save ₹10,000 on Equities Yearly",
        summary: "Are you paying 12.5% LTCG on all equity profits? Learn how to book and reinvest your ₹1.25 Lakhs tax-exempt quota every financial year.",
        content: [
          "As per the latest tax rules, Long-Term Capital Gains (LTCG) on equity mutual funds and stocks are exempt up to ₹1.25 Lakhs in a financial year. Any profit beyond this is taxed at 12.5%.",
          "Tax Harvesting is the technique of selling mutual funds every year to book profits up to ₹1.25 Lakhs, and immediately buying them back.",
          "By doing this, you step-up your purchase acquisition cost without paying a single rupee of LTCG tax, effectively wiping out future tax burdens.",
          "For instance, if you have ₹1.2 Lakh profit, redeem it and reinvest immediately. This keeps your taxable capital gains ledger clean. Track your total portfolio yields in the Net Worth tracker."
        ]
      },
      hi: {
        title: "धारा 112A के तहत टैक्स हार्वेस्टिंग: इक्विटी प्रॉफिट पर हर साल बचाएं टैक्स",
        summary: "क्या आप सभी इक्विटी मुनाफे पर LTCG टैक्स दे रहे हैं? जानिए कैसे हर साल ₹1.25 लाख की कर-मुक्त सीमा का फायदा उठाकर भारी टैक्स बचाया जा सकता है।",
        content: [
          "नए नियमों के अनुसार, भारत में इक्विटी म्यूचुअल फंड और शेयरों पर हर वित्त वर्ष में ₹1.25 लाख तक लॉन्ग-टर्म资本गेंस (LTCG) टैक्स-फ्री है। इसके ऊपर के लाभ पर 12.5% टैक्स लगता है।",
          "टैक्स हार्वेस्टिंग एक कमाल की तकनीक है जिसमें आप हर साल ₹1.25 लाख तक के शेयर बेचकर अपना मुनाफा पक्का करते हैं और उसे तुरंत फिर से निवेश कर देते हैं।",
          "ऐसा करने से बिना कोई टैक्स चुकाए आपके पोर्टफोलियो की खरीद लागत (acquisition cost) बढ़ जाती है, जिससे भविष्य में मैच्योरिटी के समय टैक्स बहुत कम हो जाता है।",
          "यदि आपके पास ₹1.2 लाख का अनरियलाइज्ड प्रॉफिट है, तो उसे बेचकर तुरंत फिर से निवेश करना समझदारी है।"
        ]
      }
    },
    {
      id: "art-9",
      category: "Saving",
      readTime: language === "hi" ? "3 मिनट" : "3 mins read",
      importance: "High",
      targetedWidget: "salary",
      icon: <HelpCircle className="w-4 h-4 text-sky-500" />,
      en: {
        title: "The Power of Voluntary Provident Fund (VPF) for Debt Allocations",
        summary: "Tired of falling fixed deposit returns? See how salaried employees can safely push extra funds into VPF to secure a high government interest rate.",
        content: [
          "Voluntary Provident Fund (VPF) is an extension of your Employee Provident Fund (EPF), allowing you to contribute beyond the mandatory 12% of basic salary, up to 100% of basic and DA.",
          "VPF offers the exact interest rate as EPF—typically around 8.15% to 8.25%—which is significantly superior to normal banking FDs and debt mutual funds.",
          "The interest earned on contributions up to ₹2.5 Lakhs per year is completely tax-free under section 10(11).",
          "For salaried professionals looking for risk-free, safe retirement assets, VPF is one of the most brilliant tools available. Check the Salary Planner to see your monthly basic pay status."
        ]
      },
      hi: {
        title: "वॉलंटरी प्रोविडेंट फंड (VPF): सरकारी सुरक्षा के साथ कमाएं सबसे ज्यादा फिक्स्ड रिटर्न",
        summary: "फिक्स डिपॉजिट (FD) की गिरती ब्याज दरों से परेशान हैं? जानिए नौकरीपेशा लोग सरकारी ब्याज दर पर सुरक्षित पैसे जोड़ने के लिए कैसे वीपीएफ (VPF) का फायदा उठा सकते हैं।",
        content: [
          "वॉलंटरी प्रोविडेंट फंड (VPF) आपके सामान्य पीएफ (EPF) का ही एक हिस्सा है, जिसमें आप मूल वेतन के अनिवार्य 12% से अधिक (मूल वेतन का 100% तक) स्वैच्छिक योगदान कर सकते हैं।",
          "वीपीएफ (VPF) पर ईपीएफ (EPF) के बराबर ही ब्याज मिलता है—आमतौर पर 8.15% से 8.25%—जो सामान्य बैंक एफडी या सरकारी बॉन्ड्स से काफी बेहतर है।",
          "सालाना ₹2.5 लाख तक के पीएफ योगदान पर मिलने वाला पूरा ब्याज पूरी तरह से टैक्स-फ्री होता है।",
          "जो लोग सुरक्षित और तय रिटर्न वाले फिक्स्ड एसेट्स की तलाश में हैं, उनके लिए वीपीएफ सबसे बेहतरीन साधन है।"
        ]
      }
    },
    {
      id: "art-10",
      category: "Saving",
      readTime: language === "hi" ? "3 मिनट" : "3 mins read",
      importance: "High",
      targetedWidget: "sip",
      icon: <Coins className="w-4 h-4 text-emerald-500" />,
      en: {
        title: "Demystifying PPF: The Exempt-Exempt-Exempt (EEE) Sovereign Giant",
        summary: "No market risk, zero taxes, and absolute safety. Read how the Public Provident Fund remains the premier wealth anchor for long-term goals.",
        content: [
          "Public Provident Fund (PPF) is a 15-year government savings scheme designed to encourage long-term wealth compounding with 100% principal protection.",
          "PPF enjoys the rare Exempt-Exempt-Exempt (EEE) tax designation:",
          "• Deduction: Contribution up to ₹1.5 Lakhs is deductible under Section 80C.",
          "• Accumulation: Yearly compounded interest earned is completely tax-exempt.",
          "• Withdrawal: The entire maturity amount after 15 years is tax-free.",
          "You can open a PPF account at any leading bank or post office. To avoid missing interest compounding, always deposit your annual PPF contribution between the 1st and 5th of April each financial year."
        ]
      },
      hi: {
        title: "पब्लिक प्रोविडेंट फंड (PPF): ट्रिपल टैक्स-फ्री (EEE) का सबसे बड़ा सरकारी राजा",
        summary: "बिना किसी मार्केट रिस्क के टैक्स-फ्री मुनाफा। जानिए पब्लिक प्रोविडेंट फंड कैसे मध्यमवर्गीय भारतीयों का सबसे पसंदीदा सुरक्षा-कवच बना हुआ है।",
        content: [
          "पब्लिक प्रोविडेंट फंड (PPF) 15 साल की एक बेहद लोकप्रिय सरकारी योजना है जो 100% सुरक्षा के साथ लंबी अवधि के निवेश को बढ़ावा देती है।",
          "पीपीएफ को भारत की चुनिंदा ट्रिपल टैक्स-फ्री (EEE) योजनाओं का दर्जा प्राप्त है:",
          "• पहली छूट: धारा 80C के तहत ₹1.5 लाख तक के सालाना निवेश पर सीधी कर छूट।",
          "• दूसरी छूट: हर साल चक्रवर्ती ब्याज के रूप में जमा होने वाली पूरी राशि टैक्स-फ्री।",
          "• तीसरी छूट: 15 साल के बाद मिलने वाली मैच्योरिटी और निकासी की पूरी राशि पर कोई टैक्स नहीं।",
          "याद रखें: ब्याज का अधिकतम लाभ प्राप्त करने के लिए हर साल 1 से 5 अप्रैल के बीच ही अपनी पीपीएफ किस्त जमा कर दें।"
        ]
      }
    },
    {
      id: "art-11",
      category: "Saving",
      readTime: language === "hi" ? "3 मिनट" : "3 mins read",
      importance: "Critical",
      targetedWidget: "health",
      icon: <HeartPulse className="w-4 h-4 text-rose-500" />,
      en: {
        title: "Emergency Fund Architecture: Shorter Path to Financial Peace",
        summary: "A single medical crisis or job loss can drag a middle-class family into toxic debt. Learn to compute and secure 6 months of absolute expenses.",
        content: [
          "An Emergency Fund acts as a financial shock absorber. It prevents you from liquidating long-term equity plans or taking expensive personal/credit card loans.",
          "How to compute your fund block:",
          "• Essential Survival Expenses = rent + food/groceries + child's fee + utilities + mandatory EMIs + insurance premium.",
          "• Target Corpus: At least 6 months of these essential survival components.",
          "Where to store it: Keep 20% in standard cash/savings bank account for instant withdrawal, 40% in instant-redemption liquid mutual funds, and 40% in secure sweep-in banking FDs.",
          "Never deploy this money into volatile stock accounts. Ensure this safety cushion in Paisa Blueprints' health dashboard."
        ]
      },
      hi: {
        title: "आपातकालीन फंड (Emergency Fund): अचानक नौकरी जाने या बीमारी से निपटने का सुरक्षा चक्र",
        summary: "एक अकेली मेडिकल इमरजेंसी या अचानक नौकरी खोना किसी भी परिवार को कर्ज में डुबो सकता है। सीखें कैसे बनाएं 6 महीने का मजबूत इमर्जेंसी बैंक बैकअप।",
        content: [
          "इमर्जेंसी फंड आपके वित्तीय जीवन का सबसे बड़ा शॉक एब्जॉर्बर है। यह आपको संकट के समय होम लोन म्यूचुअल फंड को घाटे में बेचने या क्रेडिट कार्ड के कर्ज में फंसने से बचाता है।",
          "मजबूत फंड के निर्धारण का साधारण सूत्र:",
          "• आवश्यक मासिक खर्च = किराया + राशन/भोजन + बच्चों की फीस + लोन की ईएमआई + इंश्योरेंस प्रीमियम।",
          "• लक्ष्य: कम से कम 6 महीने के बराबर के आवश्यक खर्च का संचय।",
          "कहाँ रखें: 20% तुरंत निकासी के लिए बचत खाते में, 40% इंस्टेंट रिडेम्पशन वाले लिक्विड म्यूचुअल फंड में, तथा 40% को बैंक की स्वीप-इन एफडी (FD) में रखें।",
          "इस आपातकालीन पैसे को कभी भी जोखिम भरे इक्विटी या स्टॉक मार्केट में निवेश न करें।"
        ]
      }
    },
    {
      id: "art-12",
      category: "Saving",
      readTime: language === "hi" ? "4 मिनट" : "4 mins read",
      importance: "Critical",
      targetedWidget: "health",
      icon: <HelpCircle className="w-4 h-4 text-rose-500" />,
      en: {
        title: "Direct Term Insurance vs. Agent Rider Policies: Avoiding Mis-selling",
        summary: "Do not buy insurance that promises to pay money back if you survive. Discover why clean, pure online Term Insurance is 10x cheaper.",
        content: [
          "Agents constantly push 'Return of Premium' or endowment riders because they carry massive hidden commissions of up to 40% in Year 1.",
          "A regular Term plan covering ₹1 Crore usually costs around ₹1,000 to ₹1,500 monthly for a healthy 30-year-old.",
          "If you buy a 'Return of Premium' option, the cost swells to ₹3,000 to ₹4,000 for the same coverage, defeating the purpose of cheap safety.",
          "Buy a pure vanilla online term policy from the insurer direct. Declare all health metrics (drinking, smoking, existing diseases) with absolute honesty to ensure seamless claim payouts for your family."
        ]
      },
      hi: {
        title: "ऑनलाइन टर्म इंश्योरेंस बनाम एजेंट्स के महंगे प्लान: सही पॉलिसी कैसे चुनें",
        summary: "वापसी का लालच देने वाली बीमा पॉलिसियों के झांसे में न आएं। जानें क्यों रिस्क-फ्री ऑनलाइन टर्म इंश्योरेंस आपके बजट में 10 गुना सस्ता और भरोसेमंद पड़ता है।",
        content: [
          "बीमा एजेंट्स अक्सर प्रीमियम वापसी की गारंटी वाले प्लान बेचते हैं क्योंकि इन पर कंपनी से उन्हें 30-40% तक का भारी कमीशन मिलता है।",
          "एक स्वस्थ 30 वर्षीय व्यक्ति के लिए ₹1 करोड़ का शुद्ध टर्म प्लान केवल ₹1,000 से ₹1,500 प्रति माह में आसानी से ऑनलाइन मिल जाता है।",
          "वहीं प्रीमियम वापसी वाले टर्म प्लान के लिए आपको उसी ₹1 करोड़ की सुरक्षा के लिए ₹3,000 से ₹4,000 प्रतिमाह चुकाने पड़ते हैं।",
          "पॉलिसी लेते समय अपनी स्वास्थ्य आदतों (बीड़ी, सिगरेट, शराब या बीमारी) की जानकारी बीमा कंपनी से बिल्कुल भी न छुपाएं ताकि क्लेम आसानी से मिल सके।"
        ]
      }
    },
    {
      id: "art-13",
      category: "Retirement",
      readTime: language === "hi" ? "3 मिनट" : "3 mins read",
      importance: "Standard",
      targetedWidget: "retirement",
      icon: <Milestone className="w-4 h-4 text-sky-500" />,
      en: {
        title: "Unpacking Gratuity Laws: Calculation Formulas, Limits and Tax Exemptions",
        summary: "Completed 5 consecutive years in your private or government firm? Learn to calculate your statutory tax-exempt retirement payout.",
        content: [
          "Gratuity is a lump sum statutory monetary benefit paid by employers under the Payment of Gratuity Act, 1972, to employees who complete 5 or more years of continuous service.",
          "How to compute your Gratuity payoff:",
          "• Formula: (15 * Last Drawn Basic Salary along with Dearness Allowance * Total Completed Years of Service) / 26.",
          "• Tax rules: Gratuity earned up to ₹20 Lakhs (tax-exempt limit increased to ₹25 Lakhs as per recent updates for central/salaried employees) is entirely exempt from income tax.",
          "This serves as an excellent lump-sum retirement buffer. Run scenarios on our Retirement Planner to align your absolute net worth targets."
        ]
      },
      hi: {
        title: "ग्रेच्युटी (Gratuity) नियम और गणना: नौकरी बदलने या रिटायरमेंट पर एक्स्ट्रा बोनस",
        summary: "क्या आपने एक ही कंपनी में लगातार 5 साल पूरे कर लिए हैं? जानिए कानूनन कितना बोनस/ग्रेच्युटी चुकाना आपकी कंपनी का कर्तव्य है और इसकी टैक्स छूट के क्या नियम हैं।",
        content: [
          "ग्रेच्युटी अधिनियम 1972 के अनुसार, कंपनियों में लगातार 5 वर्ष या उससे अधिक समय तक काम करने वाले सभी कर्मचारी एकमुश्त ग्रेच्युटी राशि के हकदार होते हैं।",
          "ग्रेच्युटी निकालने का सरल फार्मूला:",
          "• सूत्र: (15 * आखिरी मूल वेतन + महंगाई भत्ता * कंपनी में सेवा के कुल वर्ष) / 26।",
          "• टैक्स छूट के नियम: वेतनभोगी कर्मचारियों के लिए कुल प्राप्त ग्रेच्युटी राशि ₹25 लाख तक आयकर से पूरी तरह कर-मुक्त होती है।",
          "अगर आप 5 साल बाद नौकरी बदल रहे हैं, तो कंपनी एचआर से इस कानूनी सेटलमेंट बोनस के दावे के बारे में अवश्य चर्चा करें।"
        ]
      }
    },
    {
      id: "art-14",
      category: "Saving",
      readTime: language === "hi" ? "4 मिनट" : "4 mins read",
      importance: "High",
      targetedWidget: "health",
      icon: <Flame className="w-4 h-4 text-rose-500" />,
      en: {
        title: "Home Loan Prepays: The '1 Extra EMI Every Year' Financial Hack",
        summary: "Wiping out a 20-year home debt in 10-12 years is remarkably easy. Explore simple prepayment schedules that save you lakhs in future interest.",
        content: [
          "Due to front-loaded amortization schedules, banks collect nearly 70% of their interest in the first half of your loan duration. A ₹50 Lakh home loan easily costs ₹1.05 Crores over 20 years.",
          "A simple hack to bypass this is paying just 1 additional EMI every calendar year directly towards the loan principal.",
          "By prepaying 1 extra EMI annually, you pull down your loan tenure from 20 years to a brisk 16 years, saving almost ₹12 Lakhs in net interest payments.",
          "If you also increase your monthly EMI by offset of just 5% every year as your salary increases, you will settle the entire 20-year loan in less than 11 years!",
          "Use the Home Loan amortization and balance simulators to trace out potential prepayment gains."
        ]
      },
      hi: {
        title: "होम लोन से जल्दी आज़ादी: 'हर साल 1 अतिरिक्त EMI' देने वाली जादुई तकनीक",
        summary: "20 साल का भारी होम लोन 10 से 12 साल में चुकाना बेहद आसान है। जानें कैसे केवल 1 अतिरिक्त ईएमआई देकर लाखों रुपयों का ब्याज बचाया जा सकता है।",
        content: [
          "अमोर्टाइजेशन शेड्यूल के नियम के कारण, बैंक होम लोन के शुरुआती 8-10 सालों में आपसे 70% तक सिर्फ ब्याज वसूलते हैं। ₹50 लाख का लोन 20 साल में ब्याज जोड़कर ₹1 करोड़ से अधिक का बन जाता है।",
          "इससे बचने का शानदार तरीका है: हर वित्तीय वर्ष में बैंक को अपनी नियमित किस्तों के अलावा केवल 1 अतिरिक्त ईएमआई का एकमुश्त भुगतान करें।",
          "हर साल सिर्फ 1 अतिरिक्त EMI देने से आपका 20 साल का लोन घटकर मात्र 16 साल रह जाएगा और आप ₹12 लाख से ज्यादा का शुद्ध ब्याज बचाएंगे।",
          "यदि आप नौकरी बढ़ने के साथ अपनी किस्त 5% बढ़ा दें, तो आप पूरा लोन 11 वर्षों से पहले चुका देंगे।"
        ]
      }
    },
    {
      id: "art-15",
      category: "Tax",
      readTime: language === "hi" ? "3 मिनट" : "3 mins read",
      importance: "Standard",
      targetedWidget: "tax",
      icon: <Percent className="w-4 h-4 text-orange-500" />,
      en: {
        title: "ELSS Mutual Funds: The 3-Year Lock-In Under Section 80C",
        summary: "Still locking capital in 5-year FDs or 15-year insurance policies for 80C? Learn why Equity Linked Savings Schemes offer maximum compounding power.",
        content: [
          "Under Section 80C of the Old Tax Regime, you can deduct up to ₹1.5 Lakhs by investing in tax-saving instruments.",
          "Equity Linked Savings Schemes (ELSS) are diversified equity mutual funds with the shortest lock-in period of only 3 years.",
          "In comparison, Tax-Saving FDs lock your capital for 5 years at a low return of 7%, while PPF locks you for 15 years.",
          "ELSS funds historical 10-year average yield sits at an impressive 14% to 16% CAGR, easily beating traditional fixed assets.",
          "Always remember that while ELSS carries equity market risk, it's one of the finest vehicles to compound tax-saving capital. Plan Section 80C in our Tax Planner dashboard."
        ]
      },
      hi: {
        title: "ELSS म्यूचुअल फंड्स: केवल 3 साल के लॉक-इन वाला सबसे तेज कंपाउंडिंग टैक्स सेवर",
        summary: "टैक्स बचाने के लिए क्या पीपीएफ (PPF) या 5 साल की बैंक एफडी (FD) में पैसा फंसा रहे हैं? जानिए क्यों ELSS फंड्स में वेल्थ बढ़ाने की बेहतरीन क्षमता छिपी है।",
        content: [
          "पुरानी टैक्स प्रणाली की धारा 80C के तहत टैक्स-बचत करने के लिए ₹1.5 लाख तक के निवेश निवेश की अनुमति है।",
          "ELSS (इक्विटी लिंक्ड सेविंग्स स्कीम्स) वे टैक्स-सेविंग म्यूचुअल फंड्स हैं जिनमें सबसे कम लॉक-इन अवधि सिर्फ 3 साल की होती है।",
          "इसकी तुलना में, टैक्स-सेविंग बैंक एफडी आपके पैसे को 5 साल के लिए लॉक करती है और पीपीएफ 15 साल के लिए लॉक करता है।",
          "ऐतिहासिक रूप से, बेहतरीन ELSS फंड्स ने 14% से 16% तक का औसत वार्षिक रिटर्न प्रदान किया है, जो इंफ्लेशन को पछाड़ने में सबसे आगे है।",
          "म्यूचुअल फंड्स बाजार जोखिमों के अधीन हैं, परंतु पुरानी व्यवस्था में कर छूट पाने का यह सबसे स्मार्ट जरिया है।"
        ]
      }
    },
    {
      id: "art-16",
      category: "Saving",
      readTime: language === "hi" ? "4 मिनट" : "4 mins read",
      importance: "Standard",
      targetedWidget: "health",
      icon: <HelpCircle className="w-4 h-4 text-sky-500" />,
      en: {
        title: "Pre-EMI vs Full-EMI: Crucial Traps in Under-Construction Flats",
        summary: "Taking a builder-subvention loan for a modern flat? Learn the hidden interest costs of choosing Pre-EMI over full EMIs during delays.",
        content: [
          "When you book an under-construction apartment, the bank disburses the loan directly to the builder in staggered installments depending on completion phases.",
          "The bank offers you two repayment structures during construction:",
          "1. Pre-EMI option: You only pay interest on the money disbursed so far. While your monthly outflow is small, your principal is NOT reduced, and the 20-year term hasn't even started yet!",
          "2. Full-EMI option: You pay a larger monthly installment containing both principal and interest components.",
          "Choosing Pre-EMI is a severe trap if construction is delayed: you could pay lakhs in interest for 5 years without dropping your actual debt by a single rupee.",
          "For maximum safety, always choose Full-EMI or pay extra block amounts to suppress builder delays."
        ]
      },
      hi: {
        title: "प्री-ईएमआई (Pre-EMI) बनाम फुल-ईएमआई (Full-EMI): नए मकान क्रेताओं के लिए बड़ा जाल",
        summary: "निर्माणाधीन या अंडर-कंस्ट्रक्शन फ्लैट ले रहे हैं? प्री-ईएमआई और फुल-ईएमआई का सही फर्क जानें ताकि बिल्डर की लेट-लतीफी में आपका ब्याज व्यर्थ न बहे।",
        content: [
          "जब आप नया फ्लैट बुक करते हैं, तो बैंक कंस्ट्रक्शन के स्तर के अनुसार बिल्डर को किस्तों में पैसा देता है।",
          "कंस्ट्रक्शन अवधि के दौरान बैंक आपको भुगतान के दो मुख्य रास्ते प्रदान करता है:",
          "1. प्री-ईएमआई का विकल्प: इसमें आप केवल जारी किए गए पैसों पर केवल ब्याज चुकाते हैं। हालांकि पॉकेट फ्रेंडली लगता है, लेकिन इससे आपका लोन रत्ती भर भी कम नहीं होता!",
          "2. फुल-ईएमआई का विकल्प: इसमें आप पहले दिन से वास्तविक लोन की पूरी किस्त चुकाना शुरू करते हैं जिसमें मूलधन (principal) भी घटता है।",
          "यदि बिल्डर डिलीवरी में देरी करता है, तो प्री-ईएमआई चुनने से आपका लाखों रुपया सिर्फ ब्याज में डूब जाएगा और कर्ज जस के तस बना रहेगा।"
        ]
      }
    },
    {
      id: "art-17",
      category: "Saving",
      readTime: language === "hi" ? "3 मिनट" : "3 mins read",
      importance: "High",
      targetedWidget: "health",
      icon: <HeartPulse className="w-4 h-4 text-rose-500" />,
      en: {
        title: "Why Corporate Health Insurance is Never Enough: Super Top-Ups",
        summary: "Relying on your employer's ₹5 Lakh group mediclaim policy is highly dangerous. Learn how Super Top-Up plans offer ₹20L safety at dirt-cheap prices.",
        content: [
          "Group corporate health insurances offered by employers are brilliant, but they disappear the instant you switch jobs or face corporate restructuring.",
          "Moreover, a standard base capacity of ₹3L to ₹5L is simply insufficient for complex organ surgeries, ICU admissions, or prolonged treatments.",
          "You do not need to buy an expensive secondary private policy. Instead, buy a dedicated private Base Policy of ₹5 Lakhs along with a Super Top-Up plan of ₹20 Lakhs.",
          "A Super Top-Up policy is incredibly cheap because it has a 'deductible' equal to your base policy limit. If your hospital bill is ₹15L, your corporate/base policy pays first ₹5L, and the Top-Up pays the remaining ₹10L.",
          "This hybrid insurance architecture ensures premium multi-million survival plans on a highly optimized budget."
        ]
      },
      hi: {
        title: "कंपनी की मेडिकल पॉलिसी क्यों काफी नहीं है? सुपर टॉप-अप प्लान का जादू",
        summary: "क्या आप सिर्फ कंपनी के ₹5 लाख वाले ग्रुप इंश्योरेंस पर निर्भर हैं? जानिए कैसे सुपर टॉप-अप लेकर बेहद कम खर्च में पा सकते हैं ₹20 लाख की बड़ी सुरक्षा।",
        content: [
          "कंपनी द्वारा दिया गया ग्रुप हेल्थ इंश्योरेंस अच्छा होता है, लेकिन नौकरी बदलने, छूटने या मंदी के समय यह तुरंत अमान्य हो जाता है।",
          "इसके अलावा, आज के दौर में ₹3 से ₹5 लाख का कवर गंभीर बीमारियों, आईसीयू (ICU) के खर्चों को पूरी तरह नहीं संभाल पाता।",
          "कवर बढ़ाने के लिए नया महंगा इंश्योरेंस लेने के बजाय, एक ₹5 लाख की पर्सनल ... पर्सनल पॉलिसी लेकर उसके ऊपर ₹20 लाख का 'सुपर टॉप-अप (Super Top-up)' लें।",
          "सुपर टॉप-अप प्लान बहुत सस्ते होते हैं क्योंकि ये शुरुआती सीमा तक का खर्च बेस कवर से चुकता होने के बाद ही एक्टिवेट होते हैं। इससे आपको कम से कम प्रीमियम में लाखों का हेल्थ कवर मिल जाता है।"
        ]
      }
    },
    {
      id: "art-18",
      category: "Saving",
      readTime: language === "hi" ? "3 मिनट" : "3 mins read",
      importance: "Standard",
      targetedWidget: "salary",
      icon: <HelpCircle className="w-4 h-4 text-emerald-500" />,
      en: {
        title: "The Balanced 50-30-20 Rule: Designed for Indian Metropolitan Costs of Living",
        summary: "Struggling to budget while paying high EMIs, inflation, and lifestyle expenses? Fit your salary into three simple, rigid compartments.",
        content: [
          "The traditional 50-30-20 rule formulated by Elizabeth Warren is a robust foundation to manage take-home income:",
          "• 50% for Needs: Absolute essentials (house rent, utilities, food, school fees, current minimum EMIs).",
          "• 30% for Wants: Personal style, electronics, weekend dining, travel, OTT subscriptions.",
          "• 20% for Savings: Direct step-up SIPs, EPF/PPF contributions, emergency blocks, equity index investments.",
          "In high-cost Indian cities like Bangalore, Mumbai, or Delhi, house rent can push Needs up to 60%. In such scenarios, aggressively pull down 'Wants' to 20% to keep your 20% compounding savings rate untouched.",
          "Input your current figures in the Salary Planner to evaluate your personal structural health ratios."
        ]
      },
      hi: {
        title: "फ्यूचर-प्रूफ बजटिंग का 50-30-20 नियम: भारतीय शहरों के रहन-सहन का सही गणित",
        summary: "महंगाई और फिजूलखर्ची के शोर में बजट बनाने में दिक्कत आ रही है? सीखें अपने वेतन को 3 बुनियादी हिस्सों में बांटने की सबसे सरल और असरदार वैज्ञानिक विधि।",
        content: [
          "दुनिया भर के वित्तीय विशेषज्ञों द्वारा सुझाया गया 50-30-20 नियम आपके वेतन को संतुलित करने का सबसे मजबूत पैमाना है:",
          "• 50% 'जरूरतें' (Needs): अनिवार्य खर्च (किराया, राशन, बच्चों की फीस, न्यूनतम ईएमआई और इंश्योरेंस)।",
          "• 30% 'चाहतें' (Wants): मनोरंजन, शौक, नए गैजेट्स, वीकेंड डिनर, यात्राएं और सब्सक्रिप्शन पैकेज।",
          "• 20% 'बचत' (Savings): भविष्य की वेल्थ के लिए डायरेक्ट एसआईपी, पीपीएफ निवेश और गोल्ड सेविंग्स।",
          "यदि मुंबई या बेंगलुरु जैसे महंगे शहरों में रहने के कारण आपका किराया जरूरत के हिस्से को 60% तक बढ़ा देता है, तो अपने 'चाहतों' के बजट को तुरंत घटाकर 10-15% करें ताकि आपकी 20% कम्पाउंडिंग बचत दर कतई प्रभावित न हो।"
        ]
      }
    },
    {
      id: "art-19",
      category: "Retirement",
      readTime: language === "hi" ? "4 मिनट" : "4 mins read",
      importance: "High",
      targetedWidget: "retirement",
      icon: <Sparkles className="w-4 h-4 text-amber-500" />,
      en: {
        title: "The EPFO Higher Pension Conundrum: Demystifying the Complex Options",
        summary: "Should you opt for EPFO's higher pension plan by diverting massive funds from EPF? Review the critical trade-offs between cash-in-hand and regular pensions.",
        content: [
          "Under the EPFO Higher Pension scheme, employees can divert 8.33% of their actual basic salary (instead of a static capped wage ceiling of ₹15,000) directly to the Pension Scheme (EPS).",
          "Pros: You secure a highly stable, life-long guaranteed pension linked heavily to your average salary drawn during the last 60 months of employment.",
          "Cons: High diversion means a major reduction in your lump-sum tax-free EPF withdrawal corpus at age 58. Furthermore, EPS has no return-of-capital feature—if both employee and spouse pass away, the accumulated reserves vanish instead of passing to heirs as standard inheritance.",
          "If you prefer absolute control over your retirement wealth, keeping money in EPF and investing independently in high-CAGR mutual funds is often the superior financial pathway."
        ]
      },
      hi: {
        title: "EPFO की अधिक पेंशन योजना (Higher Pension Option): फायदे और असल नुकसान की कड़वी सच्चाई",
        summary: "क्या आपको जीवन भर की पेंशन के लालच में पीएफ से ज्यादा पैसा डाइवर्ट करना चाहिए? जानिए क्यों यह पेंशन स्कीम आपके बच्चों और उत्तराधिकारियों के लिए नुकसानदेह हो सकती है।",
        content: [
          "ईपीएफओ (EPFO) की अधिक पेंशन स्कीम में कर्मचारियों को बेसिक सैलरी के वास्तविक अनुपात (₹15,000 की वैधानिक सीमा से हटकर) में ईपीएस (EPS) पेंशन खाते में योगदान करने की स्वीकृति दी जाती है।",
          "फायदा: इससे आपको रिटायरमेंट के समय आपके सर्विस के अंतिम 5 सालों की बेसिक सैलरी के आधार पर आजीवन बड़ी सरकारी पेंशन मिलना तय हो जाता है।",
          "नुकसान: पेंशन के चक्कर में आपके रिटायरमेंट पर मिलने वाला एकमुश्त पीएफ पॉकेट का पैसा बेहद कम हो जाता है। इसके अलावा, दुर्भाग्यवश कर्मचारी और जीवनसाथी के निधन के बाद यह जमा पूंजी आपके बच्चों में नहीं बांटी जाती बल्कि समाप्त हो जाती है।",
          "स्वतंत्र होकर वेल्थ कम्पाउंड करने और अपने वारिसों को मजबूत वसीयत सौंपने की इच्छा रखने वालों के लिए ईपीएफ फंड के साथ डायरेक्ट म्यूचुअल फंड का मेल सबसे बढ़िया विकल्प है।"
        ]
      }
    },
    {
      id: "art-20",
      category: "Retirement",
      readTime: language === "hi" ? "4 मिनट" : "4 mins read",
      importance: "High",
      targetedWidget: "retirement",
      icon: <Flame className="w-4 h-4 text-orange-500" />,
      en: {
        title: "The Indian FIRE Movement: Accelerate Financial Independence for Techies",
        summary: "Burned out in software cycles? Discover how a disciplined 50%+ savings rate coupled with Nifty CAGR can trigger retirement in your 40s.",
        content: [
          "FIRE (Financial Independence, Retire Early) is rapidly expanding among Indian software graduates, corporate consultants, and private professionals.",
          "To secure early retirement, you must compute your 'FIRE number' representing 30x to 40x of your actual annual expenses.",
          "The Core Engine: If your annual expenses are ₹10 Lakhs, your fire corpus target is ₹3 to ₹4 Crores.",
          "By lifestyle optimization and maintaining a strict 50% savings rate (meaning you save half of your take-home pay every month directly in low-cost index funds), you reach early retirement in less than 15-18 years.",
          "Keep checking the Retirement Planner index to run multiple simulations of inflation adjustments and survival rates."
        ]
      },
      hi: {
        title: "भारतीय युवाओं के लिए तेजी से रिटायर होने (FIRE) का मार्ग: सपनों से हकीकत तक",
        summary: "जॉब की थकान और कॉर्पोरेट प्रेशर से तंग आ चुके हैं? सीखें 40-45 वर्ष की आयु में वित्तीय आजादी और जॉब छोड़ने की वो अनूठी 'फायर' आंदोलन की रणनीति।",
        content: [
          "वित्तीय स्वतंत्रता और समय से पूर्व रिटायरमेंट (FIRE - Financial Independence, Retire Early) का विचार भारत के आईटी प्रोफेशनल्स और नौकरीपेशा युवाओं में तेजी से लोकप्रिय हो रहा है।",
          "समय से पहले रिटायरमेंट लेने का मूल फार्मूला: आपके वार्षिक पारिवारिक खर्च का कम से कम 30 से 40 गुना कॉर्पस इकट्ठा होना अनिवार्य है।",
          "यदि आपका सालाना खर्च ₹10 लाख है, तो आपकी वित्तीय आजादी का कड़ा लक्ष्य ₹3 से ₹4 करोड़ की संचित पूंजी का निर्माण होगा।",
          "यदि आप वेतन मिलते ही कम से कम 50% भाग को अनुशासित रूप से इंडैक्स फंड्स में सीधे निवेश करते हैं, तो आप मात्र 15 से 16 वर्षों में पूर्ण वित्तीय आजादी प्राप्त कर सकते हैं।"
        ]
      }
    },
    {
      id: "art-21",
      category: "Investment",
      readTime: language === "hi" ? "3 मिनट" : "3 mins read",
      importance: "Standard",
      targetedWidget: "health",
      icon: <HelpCircle className="w-4 h-4 text-rose-500" />,
      en: {
        title: "Deciphering the CIBIL Score Algorithm: Raising It Above 780 Safely",
        summary: "High credit card balances and missing EMIs can block future house/car loans. Discover simple habits that optimize your financial health reputation.",
        content: [
          "In India, a credit rating score from CIBIL (Credit Information Bureau India Limited) over 750 is considered good, while 780+ guarantees peak interest discounts on home loans.",
          "How to safely structure and push your rating upward:",
          "• Paying on time (35% impact): Set up auto-debit loops on all EMIs and credit cards. A single delay can drop your rating score by 40-50 points.",
          "• Credit Utilization Ratio (30% impact): Keep card usage strictly capped below 30% of total limit. If your limit is ₹1 Lakh, do not cross ₹30,000 in monthly spends.",
          "• Hard Enquiries: Avoid applying for multiple loan products simultaneously. Each rejection triggers a hard inquiry log that flags desperate behavior.",
          "Calibrate credit cards with extreme discipline, and verify your buffer scores inside our CIBIL Tracker dashboard module."
        ]
      },
      hi: {
        title: "सिबिल (CIBIL) स्कोर सुधारने का पक्का तरीका: जानिए इसे 780 से ऊपर कैसे रखें",
        summary: "क्रेडिट कार्ड का अधिक उपयोग और लोन न चुकाना आपके भविष्य के सस्ते कर्ज मिलने को ब्लॉक कर सकता है। सीक्रेट आदतों से सुधारें अपना फाइनेंशियल रिकॉर्ड।",
        content: [
          "भारत में सिबिल (CIBIL) स्कोर सिमुलेशन में 750 से ऊपर का स्कोर उत्तम माना जाता है, तथा 780 से अधिक रहने पर बैंकों द्वारा गोल्ड क्लास कैटेगरी का सबसे सस्ता होम लोन ब्याज मिलता है।",
          "स्कोर सुधारने की वैज्ञानिक आदतें:",
          "• समय पर भुगतान (35% महत्वपूर्ण): सभी मासिक किस्तों (EMI) और कार्ड भुगतानों को ऑटो-डेबिट मोड पर रखें। एक ही लेट पेमेंट सिबिल को 50 पॉइंट तक गिरा सकती है।",
          "• क्रेडिट उपयोग अनुपात (30% महत्वपूर्ण): क्रेडिट सीमा के 30% से कम का ही उपयोग करें। अगर आपकी सीमा ₹1 लाख है, तो महीने में ₹30,000 से अधिक न खर्च करें।",
          "पार्टनर टूल्स में जाकर अपने क्रेडिट रिकॉर्ड एवं सिबिल सिमुलेटर की तत्काल जांच करें।"
        ]
      }
    }
  ];

  const categories = ["All", "Investment", "Tax", "Saving", "Retirement"];
  
  const categoryLabels: Record<string, string> = {
    All: language === "hi" ? "सभी श्रेणी" : "All Advice",
    Investment: language === "hi" ? "निवेश" : "Investment",
    Tax: language === "hi" ? "कर / टैक्स" : "Tax",
    Saving: language === "hi" ? "बचत" : "Saving",
    Retirement: language === "hi" ? "रिटायरमेंट" : "Retirement"
  };

  const filteredArticles = articles.filter((art) => {
    const titleText = language === "en" ? art.en.title : art.hi.title;
    const summaryText = language === "en" ? art.en.summary : art.hi.summary;
    
    const matchesSearch = 
      titleText.toLowerCase().includes(searchQuery.toLowerCase()) || 
      summaryText.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "All" || art.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div id="articles-advisor-panel" className="bg-white border border-slate-100 rounded-2xl p-5 shadow-3xs space-y-4">
      
      {/* Header section with Cabinet name & total reads flag */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4.5 h-4.5 text-bhagwa-600 animate-pulse" />
          <h3 className="font-extrabold text-xs text-slate-800 tracking-wider uppercase">
            {language === "hi" ? "पैसा मार्गदर्शन कैबिनेट" : "Paisa Guidance Cabinet"}
          </h3>
        </div>
        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono font-bold">
          {articles.length} {language === "hi" ? "मार्गदर्शन" : "reads Available"}
        </span>
      </div>

      {/* Prominent Bilingual Language Selector Button Unit */}
      <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl p-1.5">
        <div className="flex items-center gap-1.5 text-slate-500 pl-1">
          <Languages className="w-3.5 h-3.5 text-bhagwa-600" />
          <span className="text-[10px] font-bold">
            {language === "hi" ? "भाषा बदलें:" : "Language:"}
          </span>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setLanguage("en")}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wide transition-all cursor-pointer ${
              language === "en"
                ? "bg-white text-bhagwa-600 shadow-3xs border border-slate-150 font-extrabold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            English
          </button>
          <button
            onClick={() => setLanguage("hi")}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wide transition-all cursor-pointer ${
              language === "hi"
                ? "bg-bhagwa-600 text-white shadow-3xs font-extrabold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            हिन्दी (Hindi)
          </button>
        </div>
      </div>

      <p className="text-[11px] text-slate-500 leading-relaxed">
        {language === "hi"
          ? "नौकरीपेशा भारतीयों के लिए विशेषज्ञ वित्तीय सलाह, व्यावहारिक योजनाएं और वेतन से बचत बढ़ाने के आसान तथा सटीक मार्गदर्शन।"
          : "Expert bites, simplified calculators, tax strategies calibrated specifically to help Indian salaried professionals leverage compounding."}
      </p>

      {/* Filter and Search controls */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder={
              language === "hi"
                ? "टैक्स छूट, एसआईपी, म्यूचुअल फंड खोजें..."
                : "Search tax advice, SIP wisdom..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-850 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-bhagwa-500 transition-all font-medium"
          />
        </div>

        {/* Categories Pills */}
        <div className="flex flex-wrap gap-1 pt-1 overflow-x-auto no-scrollbar scroll-smooth">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2 py-1 rounded-lg text-[9px] font-bold tracking-tight cursor-pointer uppercase select-none transition-all ${
                selectedCategory === cat
                  ? "bg-bhagwa-600 text-white shadow-3xs"
                  : "bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-800 border border-slate-100"
              }`}
            >
              {categoryLabels[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Feed */}
      <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
        {filteredArticles.length === 0 ? (
          <div className="p-6 text-center text-slate-400 border border-dashed border-slate-100 rounded-xl bg-slate-50">
            <span className="block text-xs font-semibold">
              {language === "hi" ? "कोई मेल नहीं मिला" : "No matched advice"}
            </span>
            <span className="block text-[10px] text-slate-450 mt-1">
              {language === "hi" ? "कृपया कुछ अन्य शब्द लिखकर खोजें" : "Try other tags or words"}
            </span>
          </div>
        ) : (
          filteredArticles.map((art) => {
            const currentData = language === "en" ? art.en : art.hi;
            return (
              <div
                key={art.id}
                onClick={() => setSelectedArticle(art)}
                className="p-3 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-xl transition-all hover:border-bhagwa-200 cursor-pointer flex gap-3 text-left group"
              >
                <div className="h-8 w-8 rounded-lg bg-white border border-slate-150 flex items-center justify-center shrink-0 shadow-3xs group-hover:scale-105 transition-all">
                  {art.icon}
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="text-[9px] uppercase tracking-wider text-slate-450 font-extrabold group-hover:text-bhagwa-600 transition-all">
                      {language === "hi" && art.category === "Investment" ? "निवेश" :
                       language === "hi" && art.category === "Tax" ? "टैक्स" :
                       language === "hi" && art.category === "Saving" ? "बचत" :
                       language === "hi" && art.category === "Retirement" ? "रिटायरमेंट" : art.category}
                    </span>
                    <div className="flex items-center gap-1 text-[9px] text-slate-400 font-medium">
                      <Clock className="w-3 h-3 text-slate-300" />
                      <span>{art.readTime}</span>
                    </div>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 leading-tight group-hover:text-slate-950 transition-colors line-clamp-2">
                    {currentData.title}
                  </h4>
                  <p className="text-[10px] text-slate-450 line-clamp-2 leading-relaxed">
                    {currentData.summary}
                  </p>
                  <div className="flex items-center justify-between gap-1.5 pt-1.5 border-t border-slate-100 mt-1">
                    <span className="text-[10px] text-bhagwa-600 group-hover:text-bhagwa-700 font-bold inline-flex items-center gap-0.5">
                      {language === "hi" ? "मार्गदर्शन फ़ाइल पढ़ें" : "Read blueprint counsel"}{" "}
                      <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const message = `*${currentData.title}*\n\n${currentData.summary}\n\nRead more on Paisa Blueprint: ${getShareableLink()}`;
                        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, "_blank");
                      }}
                      className="text-[9px] text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 font-extrabold px-1.5 py-0.5 rounded flex items-center gap-1 transition-all cursor-pointer"
                      title="Share to WhatsApp"
                    >
                      <Share2 className="w-2.5 h-2.5" />
                      <span>{language === "hi" ? "साझा करें" : "Share"}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>



      {/* Beautiful Modal Article Reader */}
      {selectedArticle && (() => {
        const currentData = language === "en" ? selectedArticle.en : selectedArticle.hi;
        return (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
            <div
              id="article-detail-sheet"
              className="bg-white border border-slate-100 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col justify-between max-h-[85vh]"
            >
              {/* Header section with Category & actions */}
              <div className="p-5 md:p-6 bg-gradient-to-r from-slate-900 to-slate-950 text-white flex items-center justify-between shrink-0">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-emerald-500 text-white rounded text-[9px] uppercase tracking-wider font-extrabold">
                      {language === "hi" && selectedArticle.category === "Investment" ? "निवेश" :
                       language === "hi" && selectedArticle.category === "Tax" ? "टैक्स" :
                       language === "hi" && selectedArticle.category === "Saving" ? "बचत" :
                       language === "hi" && selectedArticle.category === "Retirement" ? "रिटायरमेंट" : selectedArticle.category}{" "}
                      {language === "hi" ? "सलाह" : "Advice"}
                    </span>
                    {selectedArticle.importance === "Critical" && (
                      <span className="px-2 py-0.5 bg-rose-500 text-white rounded text-[9px] uppercase tracking-wider font-extrabold flex items-center gap-0.5">
                        <Flame className="w-2.5 h-2.5 shrink-0" /> {language === "hi" ? "महत्वपूर्ण" : "Important"}
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400 font-mono">
                      {selectedArticle.readTime}
                    </span>
                  </div>
                  <h3 className="text-base md:text-lg font-black tracking-tight leading-snug">
                    {currentData.title}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="p-1 px-2.5 bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-300 rounded-xl transition-all cursor-pointer focus:outline-none"
                  title="Close read sheet"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="p-6 md:p-8 overflow-y-auto space-y-4 text-xs text-slate-700 leading-relaxed">
                <p className="font-bold text-slate-950 text-xs italic border-l-3 border-bhagwa-500 pl-3">
                  {currentData.summary}
                </p>

                <hr className="border-slate-100" />

                <div className="space-y-4">
                  {currentData.content.map((para, index) => (
                    <p key={index} className="text-slate-600 whitespace-pre-line text-xs font-normal">
                      {para}
                    </p>
                  ))}
                </div>

                {/* Alert standard reminder box */}
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start gap-2.5 mt-2">
                  <Sparkles className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                      {language === "hi" ? "सलाहकार की सीधी अनुशंसा" : "Adviser Direct Recommendation"}
                    </span>
                    <span className="text-[11px] text-emerald-700">
                      {language === "hi"
                        ? "आप ऊपर बताए गए वित्तीय मापदंडों की जांच सीधे इसके समतुल्य टूल/कैलकुलेटर को खोलकर तुरंत कर सकते हैं।"
                        : "Your financial parameters can be validated instantly inside the calibrated companion suite widget."}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sticky Actions Footer */}
              <div className="p-5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center sm:justify-between gap-3 shrink-0">
                <span className="text-[10px] text-slate-400">
                  {language === "hi"
                    ? "संदर्भ: भारतीय आयकर स्लैब, प्रत्यक्ष निवेश और कम्पाउंडिंग सिमुलेशन गणना।"
                    : "Ref: Indian Income Tax Slabs & direct compounding simulations."}
                </span>
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-1.5 w-full sm:w-auto">
                  <button
                    onClick={() => setSelectedArticle(null)}
                    className="w-full sm:w-auto px-3.5 py-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 font-bold rounded-xl text-xs transition-colors cursor-pointer text-center"
                  >
                    {language === "hi" ? "बंद करें" : "Close Advice"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const message = `*${currentData.title}*\n\n${currentData.summary}\n\nRead more on Paisa Blueprint: ${getShareableLink()}`;
                      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, "_blank");
                    }}
                    className="w-full sm:w-auto px-3.5 py-2 bg-emerald-650 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs transition-all shadow-xs active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5"
                    title="Share this article to WhatsApp"
                  >
                    <Share2 className="w-3.5 h-3.5 shrink-0" />
                    <span>{language === "hi" ? "व्हाट्सएप" : "Share"}</span>
                  </button>
                  <button
                    onClick={() => {
                      onNavigateToWidget(selectedArticle.targetedWidget);
                      setSelectedArticle(null);
                    }}
                    className="w-full sm:w-auto px-3.5 py-2 bg-bhagwa-600 hover:bg-bhagwa-700 text-white font-extrabold rounded-xl text-xs transition-all shadow-md shadow-bhagwa-600/10 hover:shadow-bhagwa-600/20 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap"
                  >
                    {language === "hi" ? "टूल शुरू करें" : "Launch Companion Tool"}{" "}
                    <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
