import React, { useState, useMemo, useEffect } from "react";
import { 
  BIHAR_DISTRICTS, 
  getBlocksForDistrict, 
  SUBJECTS, 
  TEACHER_TYPES, 
  CLASS_CATEGORIES, 
  Teacher, 
  globalTeacherStore 
} from "./TeacherDataStore";
import { 
  Search, 
  RotateCcw, 
  MapPin, 
  GraduationCap, 
  BookOpen, 
  Users, 
  Send, 
  CheckCircle2, 
  Sparkles,
  Info,
  Share2
} from "lucide-react";

interface DistrictAnalyticsProps {
  language: "en" | "hi";
  loggedInTeacher?: Teacher | null;
  onSendInterest?: (toId: string) => void;
  onNavigateToRegister?: () => void;
}

const TeacherAvatar = ({ gender }: { gender?: string }) => (
  <div className="h-12 w-12 rounded-full border-2 border-white bg-amber-400 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
    <svg className="w-8 h-8 text-slate-800" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Head */}
      <circle cx="32" cy="24" r="14" fill="#fed7aa" />
      {/* Hair for female/male */}
      {gender === "Female" ? (
        <path d="M18 20C18 11 25 10 32 10C39 10 46 11 46 20C46 25 44 28 42 28C40 28 39 25 32 25C25 25 24 28 22 28C20 28 18 25 18 20Z" fill="#7c2d12" />
      ) : (
        <path d="M18 20C18 12 24 10 32 10C40 10 46 12 46 20C44 19 41 18 32 18C23 18 20 19 18 20Z" fill="#1e293b" />
      )}
      {/* Glasses */}
      <circle cx="26" cy="24" r="4" stroke="#1e293b" strokeWidth="2" />
      <circle cx="38" cy="24" r="4" stroke="#1e293b" strokeWidth="2" />
      <line x1="30" y1="24" x2="34" y2="24" stroke="#1e293b" strokeWidth="2" />
      {/* Smile */}
      <path d="M28 31C29.5 32.5 34.5 32.5 36 31" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
      {/* Clothes / Body */}
      <path d="M14 50C14 42 22 40 32 40C42 40 50 42 50 50V56H14V50Z" fill={gender === "Female" ? "#0d9488" : "#2563eb"} />
      <path d="M32 40L28 46H36L32 40Z" fill="#fed7aa" />
    </svg>
  </div>
);

export default function DistrictAnalytics({ 
  language, 
  loggedInTeacher = null,
  onSendInterest,
  onNavigateToRegister 
}: DistrictAnalyticsProps) {
  // Search Filters
  const [selectedDistrict, setSelectedDistrict] = useState("All");
  const [selectedBlock, setSelectedBlock] = useState("All");
  const [selectedClass, setSelectedClass] = useState("All");
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [selectedTeacherType, setSelectedTeacherType] = useState("All");

  const [hasSearched, setHasSearched] = useState(false);
  const [searchResults, setSearchResults] = useState<Teacher[]>([]);
  const [proposalSentList, setProposalSentList] = useState<string[]>([]);

  // Stateful list of teachers loaded from global store and synced in real-time
  const [teachers, setTeachers] = useState(() => globalTeacherStore.getTeachers());

  useEffect(() => {
    globalTeacherStore.syncWithServer();
    const unsubscribe = globalTeacherStore.subscribe(() => {
      setTeachers(globalTeacherStore.getTeachers());
    });
    return unsubscribe;
  }, []);

  // Calculate dynamic list of blocks based on selected district
  const availableBlocks = useMemo(() => {
    if (selectedDistrict === "All") return [];
    return getBlocksForDistrict(selectedDistrict);
  }, [selectedDistrict]);

  // Total registered teachers count (baseline 6730 + mock teachers size)
  const totalTeachersCount = useMemo(() => {
    return 6730 + (teachers.length - 12);
  }, [teachers]);

  // Handle Search Execution
  const handleSearch = () => {
    // Filter out currently logged in teacher (if any)
    const candidates = teachers.filter(t => !loggedInTeacher || t.id !== loggedInTeacher.id);

    const filtered = candidates.filter(t => {
      if (selectedDistrict !== "All" && t.currentDistrict !== selectedDistrict) return false;
      if (selectedBlock !== "All" && t.currentBlock !== selectedBlock) return false;
      if (selectedClass !== "All" && t.classCategory !== selectedClass) return false;
      if (selectedSubject !== "All" && t.subject !== selectedSubject) return false;
      if (selectedTeacherType !== "All" && t.teacherType !== selectedTeacherType) return false;
      return true;
    });

    setSearchResults(filtered);
    setHasSearched(true);
  };

  // Handle Reset of all filters
  const handleReset = () => {
    setSelectedDistrict("All");
    setSelectedBlock("All");
    setSelectedClass("All");
    setSelectedSubject("All");
    setSelectedTeacherType("All");
    setHasSearched(false);
    setSearchResults([]);
  };

  // Handle proposal sending
  const handleProposalAction = (toId: string, toName: string) => {
    if (!loggedInTeacher) {
      alert(
        language === "hi"
          ? "पंजीकरण आवश्यक: कृपया अपना वर्तमान पोस्टिंग पंजीकृत करें ताकि आप आपसी प्रस्ताव भेज सकें!"
          : "Registration Required: Please register your current government posting to initiate a mutual transfer proposal swap!"
      );
      if (onNavigateToRegister) {
        onNavigateToRegister();
      }
      return;
    }

    if (onSendInterest) {
      onSendInterest(toId);
    } else {
      globalTeacherStore.sendInterest(loggedInTeacher.id, toId);
    }

    setProposalSentList(prev => [...prev, toId]);
    alert(
      language === "hi"
        ? `सफलतापूर्वक भेजा गया: आपका स्थानांतरण प्रस्ताव ${toName} को भेज दिया गया है!`
        : `Proposal Sent: Your mutual transfer swap invitation has been sent to ${toName} successfully!`
    );
  };

  const shareSearchResultsToWhatsApp = () => {
    let criteriaText = "";
    if (selectedDistrict !== "All") criteriaText += `District: ${selectedDistrict}, `;
    if (selectedBlock !== "All") criteriaText += `Block: ${selectedBlock}, `;
    if (selectedSubject !== "All") criteriaText += `Subject: ${selectedSubject}, `;
    if (selectedClass !== "All") criteriaText += `Class: ${selectedClass}, `;
    if (selectedTeacherType !== "All") criteriaText += `Type: ${selectedTeacherType}, `;
    
    if (criteriaText.endsWith(", ")) criteriaText = criteriaText.slice(0, -2);
    if (!criteriaText) criteriaText = "All Bihar govt schools";

    const text = language === "hi"
      ? `बीपीएससी शिक्षक आपसी स्थानांतरण खोज परिणाम 🧑‍🏫\n\n🔍 खोज मानदंड: ${criteriaText}\n📊 कुल मिलान उम्मीदवार: ${searchResults.length} शिक्षक\n\nबिहार शिक्षक आपसी स्थानांतरण पोर्टल पर अपना ट्रांसफर साथी खोजें। रजिस्टर करें और संपर्क करें: ${window.location.origin}${window.location.pathname}`
      : `BPSC Teacher Mutual Transfer Search Results 🧑‍🏫\n\n🔍 Search Criteria: ${criteriaText}\n📊 Matched Candidates: ${searchResults.length} teachers found\n\nFind your perfect mutual transfer partner on our portal. Register & connect: ${window.location.origin}${window.location.pathname}`;
    
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  const shareIndividualTeacherToWhatsApp = (teacher: Teacher) => {
    const text = language === "hi"
      ? `बिहार शिक्षक आपसी स्थानांतरण प्रस्ताव 🧑‍🏫\n\n📌 शिक्षक का नाम: ${teacher.name}\n🏫 वर्तमान स्कूल: ${teacher.currentSchool}, ${teacher.currentBlock} (${teacher.currentDistrict})\n📚 विषय: ${teacher.subject}\n🎓 कक्षा श्रेणी: ${teacher.classCategory}\n💼 शिक्षक प्रकार: ${teacher.teacherType}\n🎯 इच्छित जिला: ${teacher.desiredDistrict}\n\nक्या आप इस शिक्षक के साथ म्यूचुअल ट्रांसफर करना चाहते हैं? अभी संपर्क करें: ${window.location.origin}${window.location.pathname}`
      : `Bihar Teacher Mutual Transfer Posting Swap 🧑‍🏫\n\n📌 Teacher Name: ${teacher.name}\n🏫 Current School: ${teacher.currentSchool}, ${teacher.currentBlock} (${teacher.currentDistrict})\n📚 Subject: ${teacher.subject}\n🎓 Class Category: ${teacher.classCategory}\n💼 Teacher Type: ${teacher.teacherType}\n🎯 Desired District: ${teacher.desiredDistrict}\n\nWant to initiate mutual transfer with this teacher? Connect now: ${window.location.origin}${window.location.pathname}`;
    
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Top Statistic Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Left Card: Blue Background */}
        <div className="bg-[#2563eb] text-white rounded-3xl p-6 text-center shadow-sm relative overflow-hidden flex flex-col justify-center min-h-[120px]">
          <p className="text-4xl sm:text-5xl font-black tracking-tight">{totalTeachersCount}</p>
          <p className="text-xs sm:text-sm font-bold text-blue-100 mt-2">
            {language === "hi" ? "कुल पंजीकृत शिक्षक" : "Total Registered Teachers"}
          </p>
        </div>

        {/* Right Card: Green Background */}
        <div className="bg-[#10b981] text-white rounded-3xl p-6 text-center shadow-sm relative overflow-hidden flex flex-col justify-center min-h-[120px]">
          <p className="text-4xl sm:text-5xl font-black tracking-tight">
            {hasSearched ? searchResults.length : "-"}
          </p>
          <p className="text-xs sm:text-sm font-bold text-emerald-100 mt-2">
            {language === "hi" ? "खोज के परिणाम" : "Search Results"}
          </p>
        </div>
      </div>

      {/* Criteria Selection Form Container */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* District Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700 block">
              {language === "hi" ? "जिला" : "District"}
            </label>
            <select
              value={selectedDistrict}
              onChange={(e) => {
                setSelectedDistrict(e.target.value);
                setSelectedBlock("All"); // Reset block on district change
              }}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-slate-50/50 font-bold text-slate-700"
            >
              <option value="All">{language === "hi" ? "सभी जिले" : "All Districts"}</option>
              {BIHAR_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Posting Block Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700 block">
              {language === "hi" ? "पोस्टिंग ब्लॉक" : "Posting Block"}
            </label>
            <select
              value={selectedBlock}
              disabled={selectedDistrict === "All"}
              onChange={(e) => setSelectedBlock(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-slate-50/50 font-bold text-slate-700 disabled:opacity-50"
            >
              <option value="All">{language === "hi" ? "सभी ब्लॉक" : "All Blocks"}</option>
              {availableBlocks.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Class Category Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700 block">
              {language === "hi" ? "कक्षा श्रेणी" : "Class"}
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-slate-50/50 font-bold text-slate-700"
            >
              <option value="All">{language === "hi" ? "सभी कक्षाएं" : "All Classes"}</option>
              {CLASS_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Subject Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700 block">
              {language === "hi" ? "विषय" : "Subject"}
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-slate-50/50 font-bold text-slate-700"
            >
              <option value="All">{language === "hi" ? "विषय चुनें" : "Select Subject"}</option>
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Teacher Type Dropdown */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-black text-slate-700 block">
              {language === "hi" ? "शिक्षक प्रकार" : "Type of Teacher"}
            </label>
            <select
              value={selectedTeacherType}
              onChange={(e) => setSelectedTeacherType(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-slate-50/50 font-bold text-slate-700"
            >
              <option value="All">{language === "hi" ? "सभी प्रकार" : "All Types"}</option>
              {TEACHER_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {/* Search Button */}
          <button
            onClick={handleSearch}
            className="w-full sm:w-auto px-6 py-3 bg-[#1d4ed8] hover:bg-[#1e40af] active:scale-[0.98] text-white font-extrabold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm border-0"
          >
            <Search className="w-4 h-4 text-white" />
            <span>{language === "hi" ? "शिक्षक खोजें" : "Search Teacher"}</span>
          </button>

          {/* Reset Button */}
          <button
            onClick={handleReset}
            className="w-full sm:w-auto px-6 py-3 bg-[#dc2626] hover:bg-[#b91c1c] active:scale-[0.98] text-white font-extrabold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm border-0"
          >
            <RotateCcw className="w-4 h-4 text-white" />
            <span>{language === "hi" ? "रीसेट करें" : "Reset"}</span>
          </button>
        </div>

        {/* Results / Status Area */}
        <div className="pt-4 border-t border-slate-100">
          {!hasSearched ? (
            /* Banner Card before search is clicked */
            <div className="border-l-4 border-blue-500 bg-blue-50/40 p-5 rounded-r-2xl space-y-1">
              <h4 className="text-xs sm:text-sm font-black text-blue-900 flex items-center gap-1.5">
                <span className="text-base">🧑‍🏫</span>
                {language === "hi" ? "बिहार शिक्षक आपसी स्थानांतरण पोर्टल" : "Bihar Teacher Mutual Transfer Portal"}
              </h4>
              <p className="text-[11px] sm:text-xs text-blue-700 font-bold">
                {language === "hi" 
                  ? "कृपया अपने खोज मापदंड का चयन करें और 'शिक्षक खोजें' पर क्लिक करें।" 
                  : "Please select your search criteria and click Search Teacher."}
              </p>
            </div>
          ) : (
            /* Results list when search is performed */
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                  {language === "hi" ? "मिलान परिणाम" : "Matching Candidates"} ({searchResults.length})
                </h4>
                {searchResults.length > 0 && (
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="text-[10px] text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full font-black uppercase shrink-0">
                      {language === "hi" ? "सक्रिय सूची" : "Active Pool"}
                    </span>
                    <button
                      onClick={shareSearchResultsToWhatsApp}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-extrabold rounded-lg text-[10px] flex items-center gap-1 transition-all cursor-pointer border-0 shadow-3xs shrink-0"
                      title={language === "hi" ? "खोज परिणाम व्हाट्सएप पर साझा करें" : "Share results to WhatsApp"}
                    >
                      <Share2 className="w-3 h-3 text-emerald-100 fill-current" />
                      <span>{language === "hi" ? "परिणाम साझा करें" : "Share Results"}</span>
                    </button>
                  </div>
                )}
              </div>

              {searchResults.length === 0 ? (
                <div className="text-center py-10 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-xs font-bold text-slate-500">
                    {language === "hi"
                      ? "आपके विशिष्ट खोज मापदंड से कोई शिक्षक नहीं मिला। कृपया फ़िल्टर बदलें।"
                      : "No teachers matched your specific search criteria. Try broadening your filter selections."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {searchResults.map((teacher) => {
                    const isProposalSent = proposalSentList.includes(teacher.id);
                    return (
                      <div 
                        key={teacher.id} 
                        className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md hover:border-blue-400 transition-all flex flex-col justify-between"
                      >
                        {/* Blue Header Banner */}
                        <div className="bg-[#2563eb] text-white p-4 flex items-center gap-3.5">
                          {/* Teacher Photo/Avatar (Now using default custom teacher avatar) */}
                          <div className="relative shrink-0">
                            <TeacherAvatar gender={teacher.gender} />
                            {teacher.isVerified && (
                              <span className="absolute -bottom-1 -right-1 bg-teal-600 text-white rounded-full p-0.5 shadow-2xs">
                                <CheckCircle2 className="w-3.5 h-3.5 text-white fill-current" />
                              </span>
                            )}
                          </div>

                          <div className="min-w-0">
                            <h5 className="text-sm sm:text-base font-black text-white leading-tight truncate">{teacher.name}</h5>
                            <span className="inline-block mt-1 text-[10px] font-bold text-blue-100 bg-white/10 px-2 py-0.5 rounded-full border border-white/10">
                              {teacher.teacherType || "School Teacher"}
                            </span>
                          </div>
                        </div>

                        {/* Card Contents */}
                        <div className="p-4 flex-1 flex flex-col justify-between">
                          <table className="w-full text-xs font-semibold text-slate-700">
                            <tbody>
                              <tr className="border-b border-slate-100">
                                <td className="py-2.5 text-slate-400 font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                                  <span>📚</span> {language === "hi" ? "विषय" : "Subject"}
                                </td>
                                <td className="py-2.5 text-right font-black text-slate-800">{teacher.subject}</td>
                              </tr>
                              <tr className="border-b border-slate-100">
                                <td className="py-2.5 text-slate-400 font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                                  <span>🏫</span> {language === "hi" ? "कक्षा श्रेणी" : "Class"}
                                </td>
                                <td className="py-2.5 text-right font-black text-slate-800">
                                  {(teacher.classCategory || "").toString().replace("Primary ", "").replace("Middle ", "").replace("Secondary ", "").replace("Senior Secondary ", "")}
                                </td>
                              </tr>
                              <tr className="border-b border-slate-100">
                                <td className="py-2.5 text-slate-400 font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                                  <span>📍</span> {language === "hi" ? "वर्तमान जिला" : "District"}
                                </td>
                                <td className="py-2.5 text-right font-black text-slate-800">{teacher.currentDistrict}</td>
                              </tr>
                              <tr className="border-b border-slate-100">
                                <td className="py-2.5 text-slate-400 font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                                  <span>🏢</span> {language === "hi" ? "वर्तमान ब्लॉक" : "Block"}
                                </td>
                                <td className="py-2.5 text-right font-black text-slate-800">{teacher.currentBlock}</td>
                              </tr>
                              <tr className="border-b border-slate-100">
                                <td className="py-2.5 text-slate-400 font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                                  <span>🏫</span> {language === "hi" ? "स्कूल का नाम" : "School"}
                                </td>
                                <td className="py-2.5 text-right font-black text-slate-800 truncate max-w-[180px] sm:max-w-[240px]">{teacher.currentSchool}</td>
                              </tr>
                            </tbody>
                          </table>

                          {/* Teacher Comment Section */}
                          <div className="mt-4 pt-3.5 border-t border-slate-100">
                            <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider flex items-center gap-1">
                              <span>💬</span> {language === "hi" ? "शिक्षक टिप्पणी" : "Teacher Comment"}
                            </p>
                            <p className="mt-1.5 text-xs text-slate-600 font-extrabold bg-blue-50/50 p-3 rounded-xl border border-blue-100/50 italic min-h-[44px]">
                              {teacher.additionalNotes || (language === "hi" ? "कोई टिप्पणी नहीं" : "No comments provided.")}
                            </p>
                          </div>

                          {/* Buttons Action Bar */}
                          <div className="grid grid-cols-3 gap-2 mt-4 pt-2">
                            {/* Call Button */}
                            <a 
                              href={`tel:${teacher.mobile}`}
                              className="px-3 py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] active:scale-[0.98] text-white text-xs font-black rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer border-0 shadow-3xs select-none"
                            >
                              <span>📞</span>
                              <span>{language === "hi" ? "कॉल" : "Call"}</span>
                            </a>

                            {/* WhatsApp Button */}
                            <button
                              onClick={() => {
                                const text = language === "hi"
                                  ? `नमस्ते ${teacher.name}, मैंने आपकी बिहार शिक्षक आपसी स्थानांतरण प्रोफ़ाइल देखी।\n📚 विषय: ${teacher.subject}\n🏫 स्कूल: ${teacher.currentSchool}\n\nक्या आप मुझसे ट्रांसफर के संबंध में चर्चा करना चाहते हैं?`
                                  : `Hello ${teacher.name}, I saw your Bihar Teacher Mutual Transfer profile.\n📚 Subject: ${teacher.subject}\n🏫 School: ${teacher.currentSchool}\n\nAre you interested in coordinating a mutual transfer?`;
                                window.open(`https://api.whatsapp.com/send?phone=91${teacher.mobile}&text=${encodeURIComponent(text)}`, "_blank");
                              }}
                              className="px-3 py-2.5 bg-[#22c55e] hover:bg-[#16a34a] active:scale-[0.98] text-white text-xs font-black rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer border-0 shadow-3xs"
                            >
                              <span>💬</span>
                              <span>{language === "hi" ? "व्हाट्सएप" : "WhatsApp"}</span>
                            </button>

                            {/* Share Button */}
                            <button
                              onClick={() => shareIndividualTeacherToWhatsApp(teacher)}
                              className="px-3 py-2.5 bg-[#4b5563] hover:bg-[#374151] active:scale-[0.98] text-white text-xs font-black rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer border-0 shadow-3xs"
                            >
                              <span>🔗</span>
                              <span>{language === "hi" ? "शेयर" : "Share"}</span>
                            </button>
                          </div>

                          {/* Optional Swap Proposal Invitation */}
                          <div className="mt-3 text-center">
                            {isProposalSent ? (
                              <span className="text-[10px] text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg font-black inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                                {language === "hi" ? "आपसी प्रस्ताव भेजा जा चुका है" : "Proposal Swap Sent"}
                              </span>
                            ) : (
                              <button
                                onClick={() => handleProposalAction(teacher.id, teacher.name)}
                                className="text-[10px] text-blue-600 hover:text-blue-800 hover:underline font-black focus:outline-none bg-transparent border-0 cursor-pointer"
                              >
                                {language === "hi" ? "✦ आधिकारिक आपसी प्रस्ताव भेजें" : "✦ Send Official Swap Proposal"}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
