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
  RefreshCw, 
  Phone, 
  MessageSquare, 
  MapPin, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  CheckCircle2
} from "lucide-react";

interface SearchPageProps {
  language: "en" | "hi";
  loggedInTeacher?: Teacher | null;
  onSendInterest?: (toId: string) => void;
  onNavigateToRegister?: () => void;
}

export default function SearchPage({ 
  language, 
  loggedInTeacher, 
  onSendInterest, 
  onNavigateToRegister 
}: SearchPageProps) {
  // Filter States
  const [filterDistrict, setFilterDistrict] = useState("");
  const [filterBlock, setFilterBlock] = useState("");
  const [filterTeacherType, setFilterTeacherType] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [filterSubject, setFilterSubject] = useState("");

  // All teachers list from global store
  const [teachersList, setTeachersList] = useState<Teacher[]>([]);

  // Page index for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Active User Email State
  const [currentUserEmail, setCurrentUserEmail] = useState<string>("");

  useEffect(() => {
    const sessStr = localStorage.getItem("paisa_active_session");
    if (sessStr) {
      try {
        const session = JSON.parse(sessStr);
        if (session && session.email) {
          setCurrentUserEmail(session.email.toLowerCase());
        }
      } catch (e) {}
    }
  }, []);

  const handleDeleteListing = async (teacherId: string) => {
    const confirmMsg = language === "hi" 
      ? "क्या आप वाकई अपना आपसी ट्रांसफर पंजीकरण हटाना चाहते हैं?" 
      : "Are you sure you want to delete your mutual transfer listing?";
    if (window.confirm(confirmMsg)) {
      try {
        globalTeacherStore.deleteTeacher(teacherId);
        setTeachersList([...globalTeacherStore.getTeachers()]);
        const alertMsg = language === "hi"
          ? "आपका पंजीकरण सफलतापूर्वक हटा दिया गया है।"
          : "Your listing has been successfully deleted.";
        alert(alertMsg);
      } catch (err) {
        alert("Failed to delete listing: " + err);
      }
    }
  };

  // Refresh data from global store on mount & subscribe to store updates
  useEffect(() => {
    const updateData = () => {
      setTeachersList(globalTeacherStore.getTeachers());
    };
    updateData();
    const unsubscribe = globalTeacherStore.subscribe(updateData);
    return unsubscribe;
  }, []);

  // Compute available blocks dynamically based on the filtered district
  const availableBlocks = useMemo(() => {
    if (!filterDistrict) return [];
    return getBlocksForDistrict(filterDistrict);
  }, [filterDistrict]);

  // Reset block filter when district filter changes
  useEffect(() => {
    setFilterBlock("");
  }, [filterDistrict]);

  // Filtered teachers list computed dynamically
  const filteredTeachers = useMemo(() => {
    const results = teachersList.filter(teacher => {
      // Filter by district (matches either current or desired district to ensure robust search results)
      if (filterDistrict) {
        const matchesCurrent = teacher.currentDistrict && teacher.currentDistrict.toLowerCase() === filterDistrict.toLowerCase();
        const matchesDesired = teacher.desiredDistrict && teacher.desiredDistrict.toLowerCase() === filterDistrict.toLowerCase();
        if (!matchesCurrent && !matchesDesired) return false;
      }
      
      // Filter by block
      if (filterBlock) {
        const matchesCurrentBlock = teacher.currentBlock && teacher.currentBlock.toLowerCase() === filterBlock.toLowerCase();
        const matchesDesiredBlock = teacher.desiredBlock && teacher.desiredBlock.toLowerCase() === filterBlock.toLowerCase();
        if (!matchesCurrentBlock && !matchesDesiredBlock) return false;
      }

      // Filter by Teacher Type
      if (filterTeacherType && teacher.teacherType !== filterTeacherType) {
        return false;
      }

      // Filter by Class Category
      if (filterClass && teacher.classCategory !== filterClass) {
        return false;
      }

      // Filter by Subject
      if (filterSubject && teacher.subject !== filterSubject) {
        return false;
      }

      return true;
    });
    console.log("[SEARCH RESULT COUNT] Search completed. Showing", results.length, "matching teachers out of", teachersList.length);
    return results;
  }, [teachersList, filterDistrict, filterBlock, filterTeacherType, filterClass, filterSubject]);

  // Handle resets
  const handleReset = () => {
    setFilterDistrict("");
    setFilterBlock("");
    setFilterTeacherType("");
    setFilterClass("");
    setFilterSubject("");
    setCurrentPage(1);
  };

  // Pagination logic
  const totalItems = filteredTeachers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  
  // Ensure active page is within bounds
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const displayedTeachers = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredTeachers.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredTeachers, currentPage]);

  return (
    <div id="search-page-container" className="space-y-6">
      
      {/* SIMPLE SEARCH FILTERS CARD */}
      <div id="search-filters-card" className="bg-white rounded-3xl border border-slate-100 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Filter className="w-5 h-5 text-teal-700" />
          <h3 className="text-base font-black text-slate-900">
            {language === "hi" ? "🔍 शिक्षक खोज फ़िल्टर" : "🔍 Search Filter Directory"}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3.5 text-xs font-bold text-slate-700">
          {/* District Filter */}
          <div className="space-y-1">
            <label htmlFor="filterDistrict" className="text-slate-500">{language === "hi" ? "जिला" : "District"}</label>
            <select
              id="filterDistrict"
              value={filterDistrict}
              onChange={(e) => { setFilterDistrict(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none bg-white cursor-pointer"
            >
              <option value="">{language === "hi" ? "-- सभी जिला --" : "-- All Districts --"}</option>
              {BIHAR_DISTRICTS.map(dist => (
                <option key={dist} value={dist}>{dist}</option>
              ))}
            </select>
          </div>

          {/* Block Filter */}
          <div className="space-y-1">
            <label htmlFor="filterBlock" className="text-slate-500">{language === "hi" ? "ब्लॉक" : "Block"}</label>
            <select
              id="filterBlock"
              value={filterBlock}
              disabled={!filterDistrict}
              onChange={(e) => { setFilterBlock(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none bg-white disabled:opacity-50 cursor-pointer"
            >
              <option value="">{language === "hi" ? "-- सभी ब्लॉक --" : "-- All Blocks --"}</option>
              {availableBlocks.map(blk => (
                <option key={blk} value={blk}>{blk}</option>
              ))}
            </select>
          </div>

          {/* Teacher Type Filter */}
          <div className="space-y-1">
            <label htmlFor="filterTeacherType" className="text-slate-500">{language === "hi" ? "शिक्षक प्रकार" : "Teacher Type"}</label>
            <select
              id="filterTeacherType"
              value={filterTeacherType}
              onChange={(e) => { setFilterTeacherType(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none bg-white cursor-pointer"
            >
              <option value="">{language === "hi" ? "-- सभी शिक्षक --" : "-- All Types --"}</option>
              {TEACHER_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Class Filter */}
          <div className="space-y-1">
            <label htmlFor="filterClass" className="text-slate-500">{language === "hi" ? "कक्षा वर्ग" : "Class"}</label>
            <select
              id="filterClass"
              value={filterClass}
              onChange={(e) => { setFilterClass(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none bg-white cursor-pointer"
            >
              <option value="">{language === "hi" ? "-- सभी कक्षा --" : "-- All Classes --"}</option>
              {CLASS_CATEGORIES.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>

          {/* Subject Filter */}
          <div className="space-y-1">
            <label htmlFor="filterSubject" className="text-slate-500">{language === "hi" ? "विषय" : "Subject"}</label>
            <select
              id="filterSubject"
              value={filterSubject}
              onChange={(e) => { setFilterSubject(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none bg-white cursor-pointer"
            >
              <option value="">{language === "hi" ? "-- सभी विषय --" : "-- All Subjects --"}</option>
              {SUBJECTS.map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer border-0 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{language === "hi" ? "रीसेट करें" : "Reset Filter"}</span>
          </button>
        </div>
      </div>

      {/* SEARCH RESULTS DIRECTORY CARDS */}
      <div id="search-results-section" className="space-y-5">
        <div className="flex justify-between items-center px-1">
          <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
            {language === "hi" ? `कुल मिले शिक्षक: ${totalItems}` : `Found ${totalItems} Registered Teachers`}
          </span>
          <span className="text-xs font-mono text-slate-500 font-bold">
            {language === "hi" ? `पृष्ठ ${currentPage} का ${totalPages}` : `Page ${currentPage} of ${totalPages}`}
          </span>
        </div>

        {displayedTeachers.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center space-y-4">
            <Search className="w-12 h-12 text-slate-300 mx-auto animate-pulse" />
            <h4 className="font-black text-slate-700">
              {language === "hi" ? "कोई पंजीकृत शिक्षक नहीं मिला" : "No Registered Teachers Found"}
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              {language === "hi" 
                ? "कृपया अन्य जिला या विषय का चयन करके पुनः प्रयास करें अथवा स्वयं को अभी पंजीकृत करें!"
                : "Try relaxing your search parameters or register yourself so others can contact you!"}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              {onNavigateToRegister && (
                <button
                  onClick={onNavigateToRegister}
                  className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-extrabold rounded-xl text-xs cursor-pointer border-0 shadow-sm flex items-center justify-center gap-1.5"
                >
                  <span>{language === "hi" ? "🟢 अभी पंजीकृत करें" : "🟢 Register Yourself Now"}</span>
                </button>
              )}
              <button
                onClick={() => {
                  const message = `Bihar BPSC Teacher Mutual Transfer Portal 🧑🏫\n\nFind your perfect mutual transfer partner across Bihar districts based on your category, TRE type, and subject.\n\nRegister and find your partner now: https://www.paisablueprint.in/`;
                  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, "_blank");
                }}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs cursor-pointer border-0 shadow-sm flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
              >
                <MessageSquare className="w-3.5 h-3.5 fill-current shrink-0" />
                <span>{language === "hi" ? "WhatsApp पर शेयर करें" : "Share Portal on WhatsApp"}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayedTeachers.map((teacher) => {
              const cleanedMobile = teacher.mobile.replace(/\D/g, "");
              const callHref = `tel:${cleanedMobile}`;
              
              const whatsappText = language === "hi"
                ? `नमस्ते ${teacher.name}, मैंने आपका प्रोफाइल Paisa Blueprint आपसी स्थानांतरण पोर्टल पर देखा। क्या आप आपसी ट्रांसफर (Current: ${teacher.currentSchool}, ${teacher.currentDistrict} -> Desired: ${teacher.desiredDistrict}) के लिए इच्छुक हैं?`
                : `Hello ${teacher.name}, I found your mutual transfer post on Paisa Blueprint. Are you interested in a swap from ${teacher.currentSchool}, ${teacher.currentDistrict} to ${teacher.desiredDistrict}?`;
              
              const whatsappHref = `https://api.whatsapp.com/send?phone=91${cleanedMobile}&text=${encodeURIComponent(whatsappText)}`;

              const isOwnListing = teacher.email && currentUserEmail && teacher.email.toLowerCase() === currentUserEmail.toLowerCase();

              return (
                <div 
                  key={teacher.id}
                  id={`teacher-card-${teacher.id}`} 
                  className={`bg-white rounded-2xl border p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${
                    isOwnListing ? "border-emerald-500/30 bg-emerald-50/5" : "border-slate-100/95"
                  }`}
                >
                  <div className="space-y-3.5">
                    {/* Header: Teacher Name & Type */}
                    <div className="flex justify-between items-start border-b border-slate-50 pb-2.5">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-black text-slate-900">{teacher.name}</h4>
                          <span className="h-4 w-4 bg-teal-50 text-teal-700 rounded-full flex items-center justify-center border border-teal-100" title="Verified Professional">
                            <CheckCircle2 className="w-3.5 h-3.5 fill-teal-100" />
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wide">
                          {teacher.teacherType}
                        </span>
                      </div>
                      {isOwnListing && (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-extrabold uppercase tracking-wider rounded-md border border-emerald-200">
                          {language === "hi" ? "मेरी प्रविष्टि" : "My Listing"}
                        </span>
                      )}
                    </div>

                    {/* Meta info block */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs font-semibold text-slate-700">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">{language === "hi" ? "विषय" : "Subject"}</span>
                        <span className="text-slate-800 font-bold text-[11px]">{teacher.subject}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">{language === "hi" ? "कक्षा वर्ग" : "Class"}</span>
                        <span className="text-slate-800 font-bold text-[11px]">{teacher.classCategory}</span>
                      </div>
                      
                      <div className="col-span-2 bg-slate-50/50 rounded-xl p-2.5 border border-slate-100/40 space-y-2">
                        {/* Current posting details */}
                        <div className="flex items-start gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">{language === "hi" ? "वर्तमान पोस्टिंग" : "Current Posting"}</span>
                            <span className="text-slate-900 font-black text-[11px] block">{teacher.currentSchool}</span>
                            <span className="text-slate-500 font-bold text-[10px] block">{teacher.currentBlock}, {teacher.currentDistrict}</span>
                          </div>
                        </div>

                        {/* Desired posting details */}
                        <div className="flex items-start gap-1.5 border-t border-slate-150 pt-2">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-[10px] text-emerald-700 font-bold block uppercase tracking-wider">{language === "hi" ? "वांछित स्थानांतरण" : "Desired Transfer"}</span>
                            <span className="text-slate-900 font-black text-[11px] block">{teacher.desiredBlock}, {teacher.desiredDistrict}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Remarks if any */}
                    {teacher.additionalNotes && (
                      <div className="bg-amber-50/20 border border-amber-500/10 rounded-xl p-2.5">
                        <span className="text-[9px] text-amber-800 font-black uppercase tracking-wider block mb-0.5">{language === "hi" ? "विशेष टिप्पणी" : "Remarks"}</span>
                        <p className="text-[10.5px] text-slate-600 font-semibold italic leading-relaxed">
                          "{teacher.additionalNotes}"
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Call & Whatsapp action buttons (strictly following BRVAS style directory) */}
                  {isOwnListing ? (
                    <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100">
                      <button
                        onClick={onNavigateToRegister}
                        className="py-2 px-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] border-0 cursor-pointer text-center no-underline shadow-3xs"
                      >
                        <span>{language === "hi" ? "संपादित करें" : "Edit Profile"}</span>
                      </button>
                      
                      <button
                        onClick={() => handleDeleteListing(teacher.id)}
                        className="py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] border-0 cursor-pointer text-center no-underline shadow-3xs"
                      >
                        <span>{language === "hi" ? "हटाएं" : "Delete"}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100">
                      <a
                        href={callHref}
                        className="py-2 px-3 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] border-0 cursor-pointer text-center no-underline shadow-3xs"
                      >
                        <Phone className="w-3.5 h-3.5 fill-current" />
                        <span>{language === "hi" ? "कॉल करें" : "Call"}</span>
                      </a>
                      
                      <a
                        href={whatsappHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] border-0 cursor-pointer text-center no-underline shadow-3xs"
                      >
                        <MessageSquare className="w-3.5 h-3.5 fill-current" />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* PAGINATION NAVIGATION BUTTONS */}
        {totalPages > 1 && (
          <div id="search-pagination" className="flex items-center justify-center gap-3 pt-4">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="p-2 bg-white border border-slate-200 text-slate-700 rounded-xl disabled:opacity-40 cursor-pointer transition-colors"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-black text-slate-600">
              {language === "hi" ? `${currentPage} / ${totalPages} पृष्ठ` : `${currentPage} of ${totalPages}`}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="p-2 bg-white border border-slate-200 text-slate-700 rounded-xl disabled:opacity-40 cursor-pointer transition-colors"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
