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
  CheckCircle2, 
  User, 
  Phone, 
  Briefcase, 
  BookOpen, 
  GraduationCap, 
  MapPin, 
  FileText, 
  HelpCircle,
  AlertCircle
} from "lucide-react";

interface RegistrationWizardProps {
  language: "en" | "hi";
  onComplete: (registeredTeacher: Teacher) => void;
  onCancel: () => void;
  onNavigateToSearch?: () => void;
}

export default function RegistrationWizard({ 
  language, 
  onComplete, 
  onCancel, 
  onNavigateToSearch 
}: RegistrationWizardProps) {
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [registeredDetails, setRegisteredDetails] = useState<Teacher | null>(null);

  // Authentication & Edit State
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isGuest, setIsGuest] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTeacherId, setEditingTeacherId] = useState("");

  // Form Fields State (strictly following prompt constraints)
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    teacherType: TEACHER_TYPES[0], // e.g. BPSC TRE 1.0
    classCategory: CLASS_CATEGORIES[0], // e.g. Primary (1-5)
    subject: SUBJECTS[0],
    currentDistrict: "Patna",
    currentBlock: "",
    currentSchool: "",
    desiredDistrict: "Gaya",
    desiredBlock: "Any Block",
    remarks: ""
  });

  // Load session and check if there's an existing registration under their email
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const sessStr = localStorage.getItem("paisa_active_session");
      if (sessStr) {
        const session = JSON.parse(sessStr);
        if (session && session.email && session.email.toLowerCase() !== "guest@paisablueprint.in") {
          setCurrentUser(session);
          setIsGuest(false);

          // Find registration
          const myEmail = session.email.toLowerCase();
          const existing = globalTeacherStore.getTeachers().find(
            t => t.email && t.email.toLowerCase() === myEmail
          );

          if (existing) {
            setIsEditing(true);
            setEditingTeacherId(existing.id);
            setFormData({
              name: existing.name || "",
              mobile: existing.mobile || "",
              teacherType: existing.teacherType || TEACHER_TYPES[0],
              classCategory: existing.classCategory || CLASS_CATEGORIES[0],
              subject: existing.subject || SUBJECTS[0],
              currentDistrict: existing.currentDistrict || "Patna",
              currentBlock: existing.currentBlock || "",
              currentSchool: existing.currentSchool || "",
              desiredDistrict: existing.desiredDistrict || "Gaya",
              desiredBlock: existing.desiredBlock || "Any Block",
              remarks: existing.additionalNotes || ""
            });
          } else {
            // Pre-fill name if new registration
            setFormData(prev => ({
              ...prev,
              name: session.name || ""
            }));
            const initBlocks = getBlocksForDistrict("Patna");
            setFormData(prev => ({
              ...prev,
              currentBlock: initBlocks[0] || ""
            }));
          }
        }
      }
    } catch (e) {
      console.warn("Error initializing RegistrationWizard:", e);
    }
  }, []);

  // Dynamically compute blocks for selected current district safely (no side-effects)
  const availableCurrentBlocks = useMemo(() => {
    return getBlocksForDistrict(formData.currentDistrict);
  }, [formData.currentDistrict]);

  // Dynamically compute blocks for selected desired district safely (no side-effects)
  const availableDesiredBlocks = useMemo(() => {
    return ["Any Block", ...getBlocksForDistrict(formData.desiredDistrict)];
  }, [formData.desiredDistrict]);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Safe cascaded selection updates
      if (field === "currentDistrict") {
        const blocks = getBlocksForDistrict(value);
        updated.currentBlock = blocks[0] || "";
      }
      if (field === "desiredDistrict") {
        updated.desiredBlock = "Any Block";
      }
      
      return updated;
    });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validations
    if (!formData.name.trim()) {
      setError(language === "hi" ? "कृपया शिक्षक का नाम दर्ज करें।" : "Please enter Teacher Name.");
      return;
    }
    if (!formData.mobile.match(/^[6-9]\d{9}$/)) {
      setError(language === "hi" ? "कृपया एक वैध 10-अंकीय मोबाइल नंबर दर्ज करें।" : "Please enter a valid 10-digit Indian Mobile Number.");
      return;
    }
    if (!formData.currentSchool.trim()) {
      setError(language === "hi" ? "कृपया अपने वर्तमान स्कूल का नाम दर्ज करें।" : "Please enter Current School name.");
      return;
    }
    if (formData.currentDistrict === formData.desiredDistrict && formData.currentBlock === formData.desiredBlock && formData.currentBlock !== "Any Block") {
      setError(language === "hi" ? "वर्तमान और वांछित ब्लॉक समान नहीं हो सकते।" : "Current and Desired Block/District cannot be identical.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      if (isEditing) {
        globalTeacherStore.updateTeacher(editingTeacherId, {
          name: formData.name,
          mobile: formData.mobile,
          teacherType: formData.teacherType,
          subject: formData.subject,
          classCategory: formData.classCategory,
          currentDistrict: formData.currentDistrict,
          currentBlock: formData.currentBlock,
          currentSchool: formData.currentSchool,
          desiredDistrict: formData.desiredDistrict,
          desiredBlock: formData.desiredBlock,
          additionalNotes: formData.remarks
        });
        const updatedTeacher = globalTeacherStore.getTeachers().find(t => t.id === editingTeacherId);
        if (updatedTeacher) {
          setRegisteredDetails(updatedTeacher);
        }
        setSuccess(true);
      } else {
        // Register with central store and await server synchronization
        const registered = await globalTeacherStore.registerTeacher({
          name: formData.name,
          gender: "Male", // Default
          mobile: formData.mobile,
          email: currentUser?.email || `${(formData.name || "").toString().toLowerCase().replace(/\s+/g, "") || "teacher"}@bihar.gov.in`,
          photoUrl: "https://i.pravatar.cc/150?img=1",
          employeeId: "BPSC-" + Math.floor(Math.random() * 900000 + 100000),
          teacherType: formData.teacherType,
          subject: formData.subject,
          classCategory: formData.classCategory,
          yearsOfService: 1,
          joiningDate: new Date().toISOString().split("T")[0],
          currentDistrict: formData.currentDistrict,
          currentBlock: formData.currentBlock,
          currentSchool: formData.currentSchool,
          udiseCode: "10" + Math.floor(Math.random() * 900000000 + 100000000),
          desiredDistrict: formData.desiredDistrict,
          desiredBlock: formData.desiredBlock,
          preferredSchools: formData.desiredBlock + " Schools",
          additionalNotes: formData.remarks
        });

        // Verification of backend persistence
        setRegisteredDetails(registered);
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || "Registration failed. This mobile number might already be registered.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isGuest) {
    return (
      <div id="auth-required-wizard" className="max-w-md mx-auto bg-white rounded-3xl border border-slate-100 p-8 shadow-lg text-center space-y-6 my-8">
        <div className="mx-auto h-16 w-16 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-sm">
          <AlertCircle className="w-8 h-8" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-black text-slate-900 tracking-tight">
            {language === "hi" ? "🔐 प्रमाणीकरण आवश्यक है" : "🔐 Authentication Required"}
          </h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            {language === "hi"
              ? "आपसी स्थानांतरण के लिए पंजीकरण करने या अपने विवरण को संपादित करने के लिए कृपया पहले अपने पैसा ब्लूप्रिंट खाते में लॉग इन करें।"
              : "To register or edit a mutual transfer listing, please log in to your Paisa Blueprint account first."}
          </p>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <button
            onClick={() => {
              window.history.pushState({}, "", "/login");
              window.dispatchEvent(new PopStateEvent("popstate"));
            }}
            className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white font-extrabold rounded-xl text-xs cursor-pointer border-0 shadow-sm transition-all active:scale-[0.98]"
          >
            {language === "hi" ? "लॉग इन करें" : "Log In Now"}
          </button>
          
          <button
            onClick={() => {
              window.history.pushState({}, "", "/signup");
              window.dispatchEvent(new PopStateEvent("popstate"));
            }}
            className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold rounded-xl text-xs cursor-pointer border-0 transition-all active:scale-[0.98]"
          >
            {language === "hi" ? "नया खाता बनाएं" : "Create Free Account"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="registration-container" className="max-w-2xl mx-auto">
      {success ? (
        /* PROFESSIONAL SUCCESS POPUP CONTAINER */
        <div id="success-popup" className="bg-white rounded-3xl border border-slate-100 p-8 shadow-xl text-center space-y-6 animate-fadeIn">
          <div className="mx-auto h-20 w-20 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 border border-teal-100 shadow-sm animate-bounce">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              {language === "hi" ? "✅ पंजीकरण सफल!" : "✅ Registration Successful"}
            </h3>
            <p className="text-sm font-bold text-teal-700 uppercase tracking-widest">
              {language === "hi" ? "धन्यवाद!" : "Thank You!"}
            </p>
            <p className="text-slate-600 text-sm max-w-md mx-auto leading-relaxed">
              {language === "hi" 
                ? "आपका पंजीकरण सफलतापूर्वक सबमिट कर दिया गया है। आपका विवरण पैसा ब्लूप्रिंट म्यूचुअल ट्रांसफर पोर्टल में सुरक्षित सहेज लिया गया है।"
                : "Your registration has been submitted successfully. Your details have been saved in the Paisa Blueprint Mutual Transfer Portal."}
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-5 max-w-sm mx-auto border border-slate-100 text-xs font-bold text-slate-700 text-left space-y-2.5 shadow-inner">
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-400 font-bold uppercase">{language === "hi" ? "शिक्षक का नाम" : "Teacher Name"}</span>
              <span className="text-slate-900 font-black">{registeredDetails?.name}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-400 font-bold uppercase">{language === "hi" ? "मोबाइल नंबर" : "Mobile Number"}</span>
              <span className="text-slate-900 font-black">{registeredDetails?.mobile}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-400 font-bold uppercase">{language === "hi" ? "वर्तमान स्थान" : "Current Location"}</span>
              <span className="text-slate-900 font-black text-right">{registeredDetails?.currentBlock}, {registeredDetails?.currentDistrict}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-400 font-bold uppercase">{language === "hi" ? "वांछित स्थान" : "Desired Location"}</span>
              <span className="text-emerald-700 font-black text-right">{registeredDetails?.desiredBlock}, {registeredDetails?.desiredDistrict}</span>
            </div>
            <div className="flex justify-between pt-1 text-[10px]">
              <span className="text-slate-400 font-bold uppercase">{language === "hi" ? "पंजीकरण स्थिति" : "Registration Status"}</span>
              <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-black uppercase">
                {language === "hi" ? "पूर्ण" : "Completed"}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              onClick={() => {
                if (onNavigateToSearch) {
                  onNavigateToSearch();
                }
              }}
              className="px-6 py-3 bg-teal-700 hover:bg-teal-800 active:scale-[0.98] text-white font-black rounded-xl text-xs sm:text-sm cursor-pointer border-0 shadow-md transition-all uppercase tracking-wider"
            >
              {language === "hi" ? "🔍 शिक्षक खोजें" : "🔍 Search Teachers"}
            </button>
            <button
              onClick={() => {
                setFormData({
                  name: "",
                  mobile: "",
                  teacherType: TEACHER_TYPES[0],
                  classCategory: CLASS_CATEGORIES[0],
                  subject: SUBJECTS[0],
                  currentDistrict: "Patna",
                  currentBlock: "",
                  currentSchool: "",
                  desiredDistrict: "Gaya",
                  desiredBlock: "Any Block",
                  remarks: ""
                });
                setSuccess(false);
                setRegisteredDetails(null);
              }}
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 active:scale-[0.98] text-slate-700 font-bold rounded-xl text-xs sm:text-sm cursor-pointer border-0 transition-all uppercase"
            >
              {language === "hi" ? "दूसरा शिक्षक पंजीकृत करें" : "Register Another Teacher"}
            </button>
            <button
              onClick={onCancel}
              className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs sm:text-sm cursor-pointer border-0 transition-all"
            >
              {language === "hi" ? "बंद करें" : "Close"}
            </button>
          </div>
        </div>
      ) : (
        /* SIMPLE ONE-PAGE REGISTRATION FORM */
        <div id="registration-form-card" className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              {isEditing 
                ? (language === "hi" ? "⚙️ अपना आपसी स्थानांतरण पंजीकरण संपादित करें" : "⚙️ Edit Your Mutual Transfer Registration")
                : (language === "hi" ? "🟢 आपसी स्थानांतरण के लिए पंजीकरण करें" : "🟢 Register Yourself for Mutual Transfer")}
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 font-semibold">
              {language === "hi" 
                ? "कृपया निम्नलिखित आवश्यक विवरण भरें। आपका पंजीकरण पूरी तरह से निःशुल्क है।"
                : "Please fill in the following required details. Registration is completely free."}
            </p>
          </div>

          {error && (
            <div id="form-error-alert" className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex items-start gap-3 text-rose-900 text-xs font-semibold animate-fadeIn">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-extrabold">{language === "hi" ? "पंजीकरण विफल" : "Registration Error"}</p>
                <p className="text-[11px] text-rose-700 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 text-xs font-bold text-slate-700">
            {/* Step 1: Personal details fields */}
            <div className="space-y-4">
              <h4 className="text-[10px] text-teal-700 uppercase tracking-widest border-l-2 border-teal-600 pl-2">
                {language === "hi" ? "१. व्यक्तिगत जानकारी" : "1. Personal Information"}
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="teacherName" className="text-slate-600 font-bold block">
                    {language === "hi" ? "शिक्षक का नाम *" : "Teacher Name *"}
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      id="teacherName"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder={language === "hi" ? "जैसे: रमेश कुमार पाठक" : "e.g., Ramesh Kumar Pathak"}
                      className="w-full pl-10 pr-3.5 py-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="teacherMobile" className="text-slate-600 font-bold block">
                    {language === "hi" ? "मोबाइल नंबर (अद्वितीय) *" : "Mobile Number (Unique) *"}
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      id="teacherMobile"
                      type="tel"
                      required
                      maxLength={10}
                      value={formData.mobile}
                      onChange={(e) => handleInputChange("mobile", e.target.value.replace(/\D/g, ""))}
                      placeholder="e.g., 9876543210"
                      className="w-full pl-10 pr-3.5 py-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 block font-semibold mt-1">
                    {language === "hi" ? "इस नंबर का उपयोग अन्य शिक्षक आपसे संपर्क करने के लिए करेंगे।" : "This number will be used by other teachers to call or WhatsApp you."}
                  </span>
                </div>
              </div>
            </div>

            {/* Step 2: Teaching Profile fields */}
            <div className="space-y-4">
              <h4 className="text-[10px] text-teal-700 uppercase tracking-widest border-l-2 border-teal-600 pl-2">
                {language === "hi" ? "२. शिक्षण प्रोफ़ाइल" : "2. Teaching Profile"}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label htmlFor="teacherType" className="text-slate-600 font-bold block">
                    {language === "hi" ? "शिक्षक प्रकार *" : "Teacher Type *"}
                  </label>
                  <select
                    id="teacherType"
                    value={formData.teacherType}
                    onChange={(e) => handleInputChange("teacherType", e.target.value)}
                    className="w-full px-3 py-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none bg-white cursor-pointer"
                  >
                    {TEACHER_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label htmlFor="classCategory" className="text-slate-600 font-bold block">
                    {language === "hi" ? "कक्षा वर्ग *" : "Class *"}
                  </label>
                  <select
                    id="classCategory"
                    value={formData.classCategory}
                    onChange={(e) => handleInputChange("classCategory", e.target.value)}
                    className="w-full px-3 py-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none bg-white cursor-pointer"
                  >
                    {CLASS_CATEGORIES.map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label htmlFor="subject" className="text-slate-600 font-bold block">
                    {language === "hi" ? "विषय *" : "Subject *"}
                  </label>
                  <select
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => handleInputChange("subject", e.target.value)}
                    className="w-full px-3 py-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none bg-white cursor-pointer"
                  >
                    {SUBJECTS.map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Step 3: Current school Details */}
            <div className="space-y-4">
              <h4 className="text-[10px] text-teal-700 uppercase tracking-widest border-l-2 border-teal-600 pl-2">
                {language === "hi" ? "३. वर्तमान स्कूल पोस्टिंग" : "3. Current School Posting"}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label htmlFor="currentDistrict" className="text-slate-600 font-bold block">
                    {language === "hi" ? "वर्तमान जिला *" : "Current District *"}
                  </label>
                  <select
                    id="currentDistrict"
                    value={formData.currentDistrict}
                    onChange={(e) => handleInputChange("currentDistrict", e.target.value)}
                    className="w-full px-3 py-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none bg-white cursor-pointer"
                  >
                    {BIHAR_DISTRICTS.map(dist => (
                      <option key={dist} value={dist}>{dist}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label htmlFor="currentBlock" className="text-slate-600 font-bold block">
                    {language === "hi" ? "वर्तमान ब्लॉक *" : "Current Block *"}
                  </label>
                  <select
                    id="currentBlock"
                    value={formData.currentBlock}
                    onChange={(e) => handleInputChange("currentBlock", e.target.value)}
                    className="w-full px-3 py-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none bg-white cursor-pointer"
                  >
                    {availableCurrentBlocks.map(blk => (
                      <option key={blk} value={blk}>{blk}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label htmlFor="currentSchool" className="text-slate-600 font-bold block">
                    {language === "hi" ? "वर्तमान स्कूल *" : "Current School *"}
                  </label>
                  <input
                    id="currentSchool"
                    type="text"
                    required
                    value={formData.currentSchool}
                    onChange={(e) => handleInputChange("currentSchool", e.target.value)}
                    placeholder={language === "hi" ? "जैसे: उत्क्रमित मध्य विद्यालय..." : "e.g., Govt Middle School..."}
                    className="w-full px-3.5 py-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Step 4: Transfer Preferences */}
            <div className="space-y-4">
              <h4 className="text-[10px] text-teal-700 uppercase tracking-widest border-l-2 border-teal-600 pl-2">
                {language === "hi" ? "४. वांछित स्थानांतरण प्राथमिकताएं" : "4. Desired Transfer Preferences"}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="desiredDistrict" className="text-slate-600 font-bold block">
                    {language === "hi" ? "वांछित स्थानांतरण जिला *" : "Desired District *"}
                  </label>
                  <select
                    id="desiredDistrict"
                    value={formData.desiredDistrict}
                    onChange={(e) => handleInputChange("desiredDistrict", e.target.value)}
                    className="w-full px-3 py-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none bg-white cursor-pointer"
                  >
                    {BIHAR_DISTRICTS.map(dist => (
                      <option key={dist} value={dist}>{dist}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label htmlFor="desiredBlock" className="text-slate-600 font-bold block">
                    {language === "hi" ? "वांछित ब्लॉक *" : "Desired Block *"}
                  </label>
                  <select
                    id="desiredBlock"
                    value={formData.desiredBlock}
                    onChange={(e) => handleInputChange("desiredBlock", e.target.value)}
                    className="w-full px-3 py-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none bg-white cursor-pointer"
                  >
                    {availableDesiredBlocks.map(blk => (
                      <option key={blk} value={blk}>{blk}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="additionalRemarks" className="text-slate-600 font-bold block">
                  {language === "hi" ? "अतिरिक्त टिप्पणी (वैकल्पिक)" : "Additional Remarks (Optional)"}
                </label>
                <textarea
                  id="additionalRemarks"
                  rows={3}
                  value={formData.remarks}
                  onChange={(e) => handleInputChange("remarks", e.target.value)}
                  placeholder={language === "hi" ? "कोई अतिरिक्त जानकारी (जैसे: चिकित्सा आधार, माता-पिता की देखभाल, आदि)" : "Any extra details (e.g., medical grounds, family care, spouse posting...)"}
                  className="w-full px-3.5 py-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none resize-none font-medium"
                />
              </div>
            </div>

            {/* Form Action Buttons */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
              <button
                type="button"
                onClick={onCancel}
                className="px-5 py-3 border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold rounded-xl cursor-pointer transition-colors"
              >
                {language === "hi" ? "रद्द करें" : "Cancel"}
              </button>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white font-black rounded-xl cursor-pointer shadow-md shadow-teal-700/10 transition-all text-xs flex items-center gap-2 uppercase tracking-wide"
              >
                {isSubmitting ? (
                  <span>{language === "hi" ? "सर्वर से सिंक हो रहा है..." : "Syncing & Saving..."}</span>
                ) : (
                  <span>
                    {isEditing 
                      ? (language === "hi" ? "पंजीकरण अपडेट करें" : "Update Registration")
                      : (language === "hi" ? "पंजीकरण सबमिट करें" : "Submit Registration")}
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
