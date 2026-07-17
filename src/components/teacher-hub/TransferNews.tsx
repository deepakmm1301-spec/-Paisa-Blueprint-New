import React, { useState } from "react";
import { Sparkles, Calendar, Tag, Radio, Search, ChevronRight } from "lucide-react";

interface TransferNewsProps {
  language: "en" | "hi";
}

interface NewsItem {
  id: string;
  titleEn: string;
  titleHi: string;
  date: string;
  categoryEn: string;
  categoryHi: string;
  contentEn: string;
  contentHi: string;
  isFlash: boolean;
}

const NEWS_FEED: NewsItem[] = [
  {
    id: "news-1",
    titleEn: "Education Department to Setup Joint DEO Help Desks for Mutual Verification",
    titleHi: "शिक्षा विभाग आपसी सत्यापन के लिए संयुक्त डीईओ सहायता डेस्क स्थापित करेगा",
    date: "July 05, 2026",
    categoryEn: "Administrative",
    categoryHi: "प्रशासनिक",
    contentEn: "Special joint help desks are being established at Patna Sadar, Gaya Sadar, and Samastipur Zila offices starting next week. These desks will fast-track the physical authentication of mutual swap requests within 3 working days.",
    contentHi: "अगले सप्ताह से पटना सदर, गया सदर और समस्तीपुर जिला कार्यालयों में विशेष संयुक्त सहायता डेस्क स्थापित किए जा रहे हैं। ये डेस्क 3 कार्य दिवसों के भीतर आपसी अदला-बदली आवेदनों के भौतिक प्रमाणीकरण को गति देंगे।",
    isFlash: true
  },
  {
    id: "news-2",
    titleEn: "Over 15,000 BPSC TRE 2.0 Teachers Submit Portal Interests Across 38 Districts",
    titleHi: "38 जिलों में 15,000 से अधिक बीपीएससी टीआरई 2.0 शिक्षकों ने आवेदन जमा किए",
    date: "June 25, 2026",
    categoryEn: "Statistics",
    categoryHi: "सांख्यिकी",
    contentEn: "A massive surge in digital mutual transfer applications has been observed. Primary mathematics and secondary science subjects continue to report the highest match percentages this season, bringing relief to hundreds of families.",
    contentHi: "डिजिटल आपसी स्थानांतरण आवेदनों में भारी उछाल देखा गया है। प्राथमिक गणित और माध्यमिक विज्ञान विषयों में इस सीजन में सबसे अधिक मिलान (Match) प्रतिशत दर्ज किया जा रहा है, जिससे सैकड़ों परिवारों को राहत मिली है।",
    isFlash: false
  },
  {
    id: "news-3",
    titleEn: "Bihar Cabinet Approves Digital Mutual Swap Submissions on e-Shikshakosh",
    titleHi: "बिहार कैबिनेट ने ई-शिक्षाकोष पर डिजिटल म्यूचुअल ट्रांसफर आवेदन को दी मंजूरी",
    date: "June 18, 2026",
    categoryEn: "Cabinet Decision",
    categoryHi: "कैबिनेट निर्णय",
    contentEn: "In a historic move, the Government of Bihar has enabled paperless online submissions for mutual transfer on the e-Shikshakosh Portal. Verified pairs can now upload joint NOC files directly to trigger automated release approvals.",
    contentHi: "एक ऐतिहासिक कदम में, बिहार सरकार ने ई-शिक्षाकोष पोर्टल पर आपसी स्थानांतरण के लिए पेपरलेस ऑनलाइन आवेदन सक्षम किया है। सत्यापित जोड़े अब सीधे ऑटोमेटेड रिलीज मंजूरियों को ट्रिगर करने के लिए संयुक्त एनओसी फाइल अपलोड कर सकते हैं।",
    isFlash: true
  },
  {
    id: "news-4",
    titleEn: "Biometric Aadhaar Matches Mandatory For Inter-District Mutual Swaps",
    titleHi: "अंतर-जिला आपसी स्थानांतरण के लिए बायोमेट्रिक आधार मिलान अनिवार्य",
    date: "May 30, 2026",
    categoryEn: "Guidelines",
    categoryHi: "दिशानिर्देश",
    contentEn: "To prevent fraudulent proxy filings, both teachers in a mutual agreement must complete an automated Aadhaar-linked biometric scan at their local block resource centres before physical NOC certificates are accepted.",
    contentHi: "धोखाधड़ी रोकने के लिए, आपसी समझौते में शामिल दोनों शिक्षकों को शारीरिक एनओसी प्रमाण पत्र स्वीकार किए जाने से पहले अपने स्थानीय ब्लॉक संसाधन केंद्रों (BRC) पर आधार-लिंक्ड बायोमेट्रिक स्कैन पूरा करना होगा।",
    isFlash: false
  }
];

export default function TransferNews({ language }: TransferNewsProps) {
  const [search, setSearch] = useState("");

  const filteredNews = NEWS_FEED.filter(item => {
    const term = search.toLowerCase();
    return (
      item.titleEn.toLowerCase().includes(term) ||
      item.titleHi.toLowerCase().includes(term) ||
      item.categoryEn.toLowerCase().includes(term) ||
      item.categoryHi.toLowerCase().includes(term)
    );
  });

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-1.5">
              {language === "hi" ? "नवीनतम स्थानांतरण समाचार बुलेटिन" : "Transfer Bulletin & Live News"}
            </h3>
            <p className="text-xs text-slate-500">
              {language === "hi" ? "बिहार शिक्षक स्थानांतरण प्रक्रिया से संबंधित दैनिक लाइव अपडेट" : "Daily live directives, physical camp dates and e-Shikshakosh announcements"}
            </p>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={language === "hi" ? "समाचार खोजें..." : "Search news..."}
            className="pl-3 pr-8 py-1.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none w-full sm:w-48"
          />
          <Search className="absolute right-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
        </div>
      </div>

      <div className="space-y-4">
        {filteredNews.length === 0 ? (
          <div className="text-center py-10 text-xs text-slate-450">
            No news articles found.
          </div>
        ) : (
          filteredNews.map((news) => (
            <div 
              key={news.id} 
              className={`border rounded-2xl p-5 hover:border-teal-200 hover:shadow-2xs transition-all relative overflow-hidden ${
                news.isFlash ? "border-red-100 bg-red-50/10" : "border-slate-100 bg-white"
              }`}
            >
              {news.isFlash && (
                <div className="absolute top-0 right-0 bg-red-500 text-white font-black uppercase text-[8px] tracking-wider px-2.5 py-0.5 rounded-bl">
                  FLASH NEWS
                </div>
              )}

              <div className="flex items-center gap-3.5 text-[10px] text-slate-450 mb-2.5 font-bold">
                <span className="flex items-center gap-1 text-teal-700">
                  <Tag className="w-3.5 h-3.5" />
                  <span>{language === "hi" ? news.categoryHi : news.categoryEn}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{news.date}</span>
                </span>
              </div>

              <h4 className="text-xs sm:text-sm font-black text-slate-800 leading-snug">
                {language === "hi" ? news.titleHi : news.titleEn}
              </h4>
              
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {language === "hi" ? news.contentHi : news.contentEn}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
