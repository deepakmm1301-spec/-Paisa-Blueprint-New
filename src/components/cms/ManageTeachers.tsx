import React, { useState, useEffect, useMemo } from "react";
import {
  Search, Eye, Edit2, Trash2, Check, RefreshCw, X, AlertCircle,
  Download, CheckCircle, ChevronLeft, ChevronRight, Filter, ShieldAlert, FileSpreadsheet
} from "lucide-react";

interface Teacher {
  id: string;
  name: string;
  gender: "Male" | "Female" | "Other";
  mobile: string;
  email: string;
  photoUrl: string;
  employeeId: string;
  teacherType: string;
  subject: string;
  classCategory: string;
  yearsOfService: number;
  joiningDate: string;
  currentDistrict: string;
  currentBlock: string;
  currentSchool: string;
  udiseCode: string;
  desiredDistrict: string;
  desiredBlock: string;
  preferredSchools: string;
  additionalNotes: string;
  isVerified: boolean;
  isOnline: boolean;
  registeredAt: string;
  status?: "Active" | "Completed" | "Hidden";
}

interface ManageTeachersProps {
  language?: "en" | "hi";
  userRole?: string;
}

export default function ManageTeachers({ language = "hi", userRole = "admin" }: ManageTeachersProps) {
  const isSuperAdmin = userRole === "super_admin" || userRole === "super admin";

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDistrict, setFilterDistrict] = useState("All");
  const [filterType, setFilterType] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterVerification, setFilterVerification] = useState("All");

  // Selection state for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modals state
  const [viewingTeacher, setViewingTeacher] = useState<Teacher | null>(null);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [deletingTeacher, setDeletingTeacher] = useState<Teacher | null>(null);
  const [bulkConfirmAction, setBulkConfirmAction] = useState<"delete" | "verify" | null>(null);

  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch all teachers from teacher-hub API
  const fetchTeachers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/teacher-hub/data");
      const d = await res.json();
      if (res.ok && d.teachers) {
        setTeachers(d.teachers);
      } else {
        throw new Error(d.message || "Failed to load teachers data.");
      }
    } catch (err: any) {
      setError(err.message || "Could not retrieve teacher records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const showToast = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  // Unique lists for dropdown filters
  const districtsList = useMemo(() => {
    const list = new Set<string>();
    teachers.forEach(t => {
      if (t.currentDistrict) list.add(t.currentDistrict);
    });
    return ["All", ...Array.from(list).sort()];
  }, [teachers]);

  const teacherTypesList = useMemo(() => {
    const list = new Set<string>();
    teachers.forEach(t => {
      if (t.teacherType) list.add(t.teacherType);
    });
    return ["All", ...Array.from(list).sort()];
  }, [teachers]);

  const categoriesList = useMemo(() => {
    const list = new Set<string>();
    teachers.forEach(t => {
      if (t.classCategory) list.add(t.classCategory);
    });
    return ["All", ...Array.from(list).sort()];
  }, [teachers]);

  // Filtered teachers list
  const filteredTeachers = useMemo(() => {
    return teachers.filter(t => {
      const matchSearch =
        t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.mobile?.includes(searchTerm) ||
        t.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.currentSchool?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchDistrict = filterDistrict === "All" || t.currentDistrict === filterDistrict;
      const matchType = filterType === "All" || t.teacherType === filterType;
      const matchCategory = filterCategory === "All" || t.classCategory === filterCategory;
      
      let matchVerification = true;
      if (filterVerification === "Verified") matchVerification = t.isVerified === true;
      if (filterVerification === "Unverified") matchVerification = !t.isVerified;

      return matchSearch && matchDistrict && matchType && matchCategory && matchVerification;
    });
  }, [teachers, searchTerm, filterDistrict, filterType, filterCategory, filterVerification]);

  // Paginated teachers
  const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage);
  const paginatedTeachers = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredTeachers.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredTeachers, currentPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds([]);
  }, [searchTerm, filterDistrict, filterType, filterCategory, filterVerification]);

  // Handle selection checkboxes
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const pageIds = paginatedTeachers.map(t => t.id);
      setSelectedIds(prev => Array.from(new Set([...prev, ...pageIds])));
    } else {
      const pageIds = paginatedTeachers.map(t => t.id);
      setSelectedIds(prev => prev.filter(id => !pageIds.includes(id)));
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(item => item !== id));
    }
  };

  const isAllPageSelected = useMemo(() => {
    if (paginatedTeachers.length === 0) return false;
    return paginatedTeachers.every(t => selectedIds.includes(t.id));
  }, [paginatedTeachers, selectedIds]);

  // Row Delete
  const handleDeleteTeacher = async (teacherId: string) => {
    if (!isSuperAdmin) {
      setError(language === "hi" ? "त्रुटि: केवल सुपर एडमिन ही डिलीट कर सकते हैं।" : "Error: Only super_admin is allowed to delete records.");
      return;
    }
    try {
      setIsSubmitting(true);
      setError(null);
      const res = await fetch(`/api/admin/teachers/${teacherId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(language === "hi" ? "शिक्षक को सफलतापूर्वक हटा दिया गया है।" : "Teacher removed successfully along with all dependents.");
        setDeletingTeacher(null);
        setSelectedIds(prev => prev.filter(id => id !== teacherId));
        await fetchTeachers();
      } else {
        throw new Error(data.message || "Failed to delete teacher.");
      }
    } catch (err: any) {
      setError(err.message || "Could not delete teacher.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Row Edit / Save Update
  const handleSaveTeacherEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin || !editingTeacher) return;

    try {
      setIsSubmitting(true);
      setError(null);
      const res = await fetch(`/api/admin/teachers/${editingTeacher.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingTeacher)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(language === "hi" ? "शिक्षक का विवरण सफलतापूर्वक अपडेट किया गया।" : "Teacher profile updated successfully!");
        setEditingTeacher(null);
        await fetchTeachers();
      } else {
        throw new Error(data.message || "Failed to update teacher profile.");
      }
    } catch (err: any) {
      setError(err.message || "Could not update teacher.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (!isSuperAdmin) return;
    try {
      setIsSubmitting(true);
      setError(null);
      const res = await fetch("/api/admin/teachers/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(language === "hi" ? `सफलतापूर्वक ${selectedIds.length} शिक्षकों को हटाया गया।` : `Successfully deleted ${selectedIds.length} teachers and cascade cleared their records.`);
        setSelectedIds([]);
        setBulkConfirmAction(null);
        await fetchTeachers();
      } else {
        throw new Error(data.message || "Failed to execute bulk deletion.");
      }
    } catch (err: any) {
      setError(err.message || "Error performing bulk delete.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Bulk Verify
  const handleBulkVerify = async () => {
    if (!isSuperAdmin) return;
    try {
      setIsSubmitting(true);
      setError(null);
      const res = await fetch("/api/admin/teachers/bulk-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(language === "hi" ? `सफलतापूर्वक ${selectedIds.length} शिक्षकों को सत्यापित किया गया।` : `Successfully verified ${selectedIds.length} selected teachers.`);
        setSelectedIds([]);
        setBulkConfirmAction(null);
        await fetchTeachers();
      } else {
        throw new Error(data.message || "Failed to execute bulk verification.");
      }
    } catch (err: any) {
      setError(err.message || "Error performing bulk verification.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Export CSV Action
  const handleExportCSV = () => {
    if (!isSuperAdmin) {
      setError(language === "hi" ? "त्रुटि: केवल सुपर एडमिन ही निर्यात कर सकते हैं।" : "Error: Only super_admin is allowed to export records.");
      return;
    }

    // Export selected, or export all matching current filters if none are selected
    const targetTeachers = selectedIds.length > 0 
      ? teachers.filter(t => selectedIds.includes(t.id))
      : filteredTeachers;

    if (targetTeachers.length === 0) {
      setError(language === "hi" ? "निर्यात करने के लिए कोई डेटा नहीं है।" : "No data available to export.");
      return;
    }

    const headers = [
      "ID", "Name", "Gender", "Mobile", "Email", "Employee ID", 
      "Teacher Type", "Subject", "Class Category", "Years of Service", 
      "Joining Date", "Current District", "Current Block", "Current School", 
      "UDISE Code", "Desired District", "Desired Block", "Preferred Schools", "Verified"
    ];

    const csvRows = [headers.join(",")];

    for (const t of targetTeachers) {
      const values = [
        t.id || "",
        `"${(t.name || "").replace(/"/g, '""')}"`,
        t.gender || "",
        t.mobile || "",
        t.email || "",
        t.employeeId || "",
        `"${(t.teacherType || "").replace(/"/g, '""')}"`,
        `"${(t.subject || "").replace(/"/g, '""')}"`,
        `"${(t.classCategory || "").replace(/"/g, '""')}"`,
        t.yearsOfService || 0,
        t.joiningDate || "",
        t.currentDistrict || "",
        t.currentBlock || "",
        `"${(t.currentSchool || "").replace(/"/g, '""')}"`,
        t.udiseCode || "",
        t.desiredDistrict || "",
        t.desiredBlock || "",
        `"${(t.preferredSchools || "").replace(/"/g, '""')}"`,
        t.isVerified ? "Yes" : "No"
      ];
      csvRows.push(values.join(","));
    }

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Paisa_Blueprint_Teachers_Export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast(language === "hi" ? `${targetTeachers.length} शिक्षकों की सूची निर्यात की गई।` : `Successfully exported ${targetTeachers.length} records to CSV file.`);
  };

  return (
    <div className="space-y-6">
      {/* Floating Success Alert Toast */}
      {successMessage && (
        <div className="fixed top-6 right-6 bg-slate-900 border-l-4 border-emerald-500 text-white text-xs font-bold px-5 py-4 rounded-xl shadow-2xl flex items-center gap-3 z-50 animate-bounce">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Access Denied banner for non super admins */}
      {!isSuperAdmin && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-2xl flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-extrabold">{language === "hi" ? "सुरक्षा प्रतिबंध" : "Administrative Restriction"}</p>
            <p className="text-amber-700">
              {language === "hi" 
                ? "आप इस सूची को देख सकते हैं, लेकिन डेटा संपादन, विलोपन, थोक संपादन और सीएसवी निर्यात जैसी क्रियाएं केवल super_admin उपयोगकर्ताओं के लिए ही प्रतिबंधित हैं।" 
                : "You have viewing rights. However, write privileges (including edit, delete, bulk verify/delete, and CSV export actions) are exclusively restricted to super_admin roles."}
            </p>
          </div>
        </div>
      )}

      {/* Search and Filters Bento Grid */}
      <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-3xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Main search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={language === "hi" ? "शिक्षक का नाम, मोबाइल नंबर, स्कूल या कर्मचारी आईडी खोजें..." : "Search by teacher name, mobile, school, employee ID..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
            />
          </div>

          {/* Quick Clear Filter Button */}
          {(searchTerm || filterDistrict !== "All" || filterType !== "All" || filterCategory !== "All" || filterVerification !== "All") && (
            <button
              onClick={() => {
                setSearchTerm("");
                setFilterDistrict("All");
                setFilterType("All");
                setFilterCategory("All");
                setFilterVerification("All");
              }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              {language === "hi" ? "फ़िल्टर हटाएं" : "Clear Filters"}
            </button>
          )}
        </div>

        {/* Dropdown filters row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">{language === "hi" ? "जिला" : "District"}</label>
            <select
              value={filterDistrict}
              onChange={(e) => setFilterDistrict(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none"
            >
              <option value="All">{language === "hi" ? "सभी जिले" : "All Districts"}</option>
              {districtsList.filter(d => d !== "All").map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">{language === "hi" ? "शिक्षक श्रेणी" : "Teacher Type"}</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none"
            >
              <option value="All">{language === "hi" ? "सभी प्रकार" : "All Types"}</option>
              {teacherTypesList.filter(t => t !== "All").map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">{language === "hi" ? "कक्षा श्रेणी" : "Class Category"}</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none"
            >
              <option value="All">{language === "hi" ? "सभी कक्षाएं" : "All Categories"}</option>
              {categoriesList.filter(c => c !== "All").map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">{language === "hi" ? "सत्यापन स्थिति" : "Verification"}</label>
            <select
              value={filterVerification}
              onChange={(e) => setFilterVerification(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none"
            >
              <option value="All">{language === "hi" ? "सभी सत्यापन" : "All Status"}</option>
              <option value="Verified">{language === "hi" ? "केवल सत्यापित" : "Verified Only"}</option>
              <option value="Unverified">{language === "hi" ? "गैर-सत्यापित" : "Unverified Only"}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Action Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-150">
        <div className="flex items-center gap-2">
          <span className="text-xs font-extrabold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl">
            {language === "hi" ? `${selectedIds.length} शिक्षक चयनित` : `${selectedIds.length} selected`}
          </span>
          {selectedIds.length > 0 && isSuperAdmin && (
            <button
              onClick={() => setSelectedIds([])}
              className="text-xs font-bold text-rose-500 hover:underline cursor-pointer"
            >
              {language === "hi" ? "चयन रद्द करें" : "Deselect All"}
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Export CSV Button (Restricted) */}
          <button
            onClick={handleExportCSV}
            disabled={!isSuperAdmin && selectedIds.length === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              isSuperAdmin 
                ? "bg-slate-900 border-slate-900 text-white hover:bg-slate-800 cursor-pointer"
                : "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
            }`}
            title={!isSuperAdmin ? "Requires super_admin role" : "Export current data to CSV"}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{language === "hi" ? "CSV निर्यात करें" : "Export CSV"}</span>
          </button>

          {/* Verify Selected (Restricted) */}
          {selectedIds.length > 0 && isSuperAdmin && (
            <button
              onClick={() => setBulkConfirmAction("verify")}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-600 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{language === "hi" ? "चयनित सत्यापित करें" : "Verify Selected"}</span>
            </button>
          )}

          {/* Delete Selected (Restricted) */}
          {selectedIds.length > 0 && isSuperAdmin && (
            <button
              onClick={() => setBulkConfirmAction("delete")}
              className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white border border-rose-600 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>{language === "hi" ? "चयनित हटाएं" : "Delete Selected"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Table View */}
      <div className="bg-white rounded-3xl border border-slate-150 shadow-3xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-150 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                <th className="p-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={isAllPageSelected}
                    onChange={handleSelectAll}
                    className="rounded text-rose-500 focus:ring-rose-500 cursor-pointer"
                  />
                </th>
                <th className="p-4">{language === "hi" ? "शिक्षक विवरण" : "Teacher Details"}</th>
                <th className="p-4">{language === "hi" ? "कर्मचारी आईडी" : "Employee ID"}</th>
                <th className="p-4">{language === "hi" ? "श्रेणी और विषय" : "Category & Subject"}</th>
                <th className="p-4">{language === "hi" ? "वर्तमान स्थान" : "Current Location"}</th>
                <th className="p-4">{language === "hi" ? "सत्यापित स्थिति" : "Verification"}</th>
                <th className="p-4 text-center">{language === "hi" ? "कार्रवाई" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-16">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-rose-500" />
                      <span className="text-slate-400 font-bold">{language === "hi" ? "डेटा लोड किया जा रहा है..." : "Fetching registered profiles..."}</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedTeachers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-slate-400">
                    <div className="max-w-xs mx-auto space-y-1">
                      <AlertCircle className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="font-extrabold text-slate-500">{language === "hi" ? "कोई शिक्षक नहीं मिला" : "No teachers found"}</p>
                      <p className="text-[11px] text-slate-400">{language === "hi" ? "आपकी खोज से मेल खाता कोई रिकॉर्ड नहीं मिला।" : "Adjust search filters or criteria."}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedTeachers.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition-all">
                    <td className="p-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(t.id)}
                        onChange={(e) => handleSelectRow(t.id, e.target.checked)}
                        className="rounded text-rose-500 focus:ring-rose-500 cursor-pointer"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-sm overflow-hidden border border-slate-200 shrink-0">
                          {t.photoUrl ? (
                            <img src={t.photoUrl} alt={t.name} className="w-full h-full object-cover" onError={(e)=>{(e.target as any).src=''; (e.target as any).className='hidden'}} />
                          ) : (
                            t.name ? t.name[0] : "👨"
                          )}
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-950 text-xs flex items-center gap-1.5">
                            {t.name}
                            {t.isVerified && (
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-500 fill-emerald-50" title="Verified Profile" />
                            )}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">{t.mobile} · {t.email || "No email"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono font-bold text-slate-600">{t.employeeId || "N/A"}</td>
                    <td className="p-4">
                      <div>
                        <p className="font-bold text-slate-800 text-[11px]">{t.teacherType}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{t.classCategory} | <span className="font-extrabold text-slate-500">{t.subject}</span></p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-extrabold text-slate-800 text-[11px] truncate max-w-[180px]" title={t.currentSchool}>{t.currentSchool}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{t.currentDistrict} ({t.currentBlock})</p>
                      </div>
                    </td>
                    <td className="p-4">
                      {t.isVerified ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-black px-2.5 py-1 rounded-full border border-emerald-150">
                          <Check className="w-3 h-3" />
                          <span>{language === "hi" ? "सत्यापित" : "Verified"}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-500 text-[10px] font-bold px-2.5 py-1 rounded-full border border-slate-200">
                          <span>{language === "hi" ? "लंबित" : "Pending"}</span>
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* View Details Button */}
                        <button
                          onClick={() => setViewingTeacher(t)}
                          className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-lg transition-all cursor-pointer"
                          title="View detailed record"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Edit Button (Restricted) */}
                        <button
                          onClick={() => setEditingTeacher(t)}
                          disabled={!isSuperAdmin}
                          className={`p-1.5 rounded-lg transition-all ${
                            isSuperAdmin
                              ? "hover:bg-slate-100 text-slate-600 hover:text-rose-600 cursor-pointer"
                              : "text-slate-300 cursor-not-allowed"
                          }`}
                          title={isSuperAdmin ? "Edit teacher profile" : "Requires super_admin role"}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Delete Button (Restricted) */}
                        <button
                          onClick={() => setDeletingTeacher(t)}
                          disabled={!isSuperAdmin}
                          className={`p-1.5 rounded-lg transition-all ${
                            isSuperAdmin
                              ? "hover:bg-slate-100 text-slate-600 hover:text-rose-600 cursor-pointer"
                              : "text-slate-300 cursor-not-allowed"
                          }`}
                          title={isSuperAdmin ? "Delete teacher record" : "Requires super_admin role"}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        {!loading && filteredTeachers.length > 0 && (
          <div className="p-4 bg-slate-50 border-t border-slate-150 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-bold text-slate-500">
            <div>
              {language === "hi" 
                ? `कुल ${filteredTeachers.length} में से ${(currentPage - 1) * itemsPerPage + 1}-${Math.min(currentPage * itemsPerPage, filteredTeachers.length)} दिखाया जा रहा है`
                : `Showing ${(currentPage - 1) * itemsPerPage + 1} to ${Math.min(currentPage * itemsPerPage, filteredTeachers.length)} of ${filteredTeachers.length} records`}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }).map((_, idx) => {
                const pNo = idx + 1;
                // Only show a limited subset of page numbers for aesthetic neatness
                if (totalPages > 5 && Math.abs(pNo - currentPage) > 1 && pNo !== 1 && pNo !== totalPages) {
                  if (pNo === 2 || pNo === totalPages - 1) {
                    return <span key={pNo} className="px-1 text-slate-400">...</span>;
                  }
                  return null;
                }

                return (
                  <button
                    key={pNo}
                    onClick={() => setCurrentPage(pNo)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      currentPage === pNo
                        ? "bg-rose-500 text-white shadow-3xs"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {pNo}
                  </button>
                );
              })}

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* --- VIEW MODAL --- */}
      {viewingTeacher && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-2xl border border-slate-200 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-rose-500" />
                <h3 className="font-extrabold text-slate-900 text-sm">{language === "hi" ? "शिक्षक प्रोफ़ाइल विवरण" : "Teacher Profile Details"}</h3>
              </div>
              <button onClick={() => setViewingTeacher(null)} className="p-1 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {/* Header profile badge */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 pb-6 border-b border-slate-100">
                <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-extrabold text-slate-600 text-2xl overflow-hidden shrink-0 shadow-inner">
                  {viewingTeacher.photoUrl ? (
                    <img src={viewingTeacher.photoUrl} alt={viewingTeacher.name} className="w-full h-full object-cover" />
                  ) : (
                    "👨‍🏫"
                  )}
                </div>
                <div className="text-center sm:text-left space-y-1">
                  <h4 className="text-base font-black text-slate-950 flex items-center justify-center sm:justify-start gap-1.5">
                    {viewingTeacher.name}
                    {viewingTeacher.isVerified && (
                      <span className="inline-flex bg-emerald-100 text-emerald-800 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">{language === "hi" ? "सत्यापित" : "Verified"}</span>
                    )}
                  </h4>
                  <p className="text-xs font-bold text-slate-500 font-mono">{viewingTeacher.mobile} · {viewingTeacher.email || "No email"}</p>
                  <p className="text-[10px] text-slate-400">Registered on: {new Date(viewingTeacher.registeredAt || Date.now()).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Data attributes grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-0.5">{language === "hi" ? "कर्मचारी आईडी" : "Employee ID"}</p>
                  <p className="font-extrabold text-slate-800">{viewingTeacher.employeeId || "N/A"}</p>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-0.5">{language === "hi" ? "लिंग" : "Gender"}</p>
                  <p className="font-extrabold text-slate-800">{viewingTeacher.gender || "N/A"}</p>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-0.5">{language === "hi" ? "शिक्षक प्रकार" : "Teacher Type"}</p>
                  <p className="font-extrabold text-slate-800">{viewingTeacher.teacherType || "N/A"}</p>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-0.5">{language === "hi" ? "कक्षा श्रेणी और विषय" : "Category & Subject"}</p>
                  <p className="font-extrabold text-slate-800">{viewingTeacher.classCategory} - <span className="text-rose-500 font-black">{viewingTeacher.subject}</span></p>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-0.5">{language === "hi" ? "सेवा के वर्ष" : "Years of Service"}</p>
                  <p className="font-extrabold text-slate-800">{viewingTeacher.yearsOfService} years (Joined {viewingTeacher.joiningDate || "N/A"})</p>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-0.5">{language === "hi" ? "यूडीआईएसई कोड" : "UDISE Code"}</p>
                  <p className="font-extrabold text-slate-800 font-mono">{viewingTeacher.udiseCode || "N/A"}</p>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 sm:col-span-2">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-0.5">{language === "hi" ? "वर्तमान विद्यालय और स्थान" : "Current School & Location"}</p>
                  <p className="font-extrabold text-slate-800">{viewingTeacher.currentSchool}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">District: <span className="font-bold">{viewingTeacher.currentDistrict}</span> | Block: <span className="font-bold">{viewingTeacher.currentBlock}</span></p>
                </div>

                <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-100 sm:col-span-2">
                  <p className="text-[9px] font-black text-amber-600 uppercase tracking-wider mb-0.5">{language === "hi" ? "वांछित स्थान (म्युचुअल ट्रांसफर हेतु)" : "Target Swap Desired Location"}</p>
                  <p className="font-extrabold text-slate-800">District: <span className="text-rose-600 font-black">{viewingTeacher.desiredDistrict}</span></p>
                  <p className="text-[11px] text-slate-600 mt-0.5">Desired Block: <span className="font-bold">{viewingTeacher.desiredBlock || "Any"}</span></p>
                  <p className="text-[11px] text-slate-600 mt-0.5">Preferred Schools: <span className="font-bold text-slate-700">{viewingTeacher.preferredSchools || "Any School"}</span></p>
                </div>

                {viewingTeacher.additionalNotes && (
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 sm:col-span-2">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-0.5">{language === "hi" ? "अतिरिक्त टिप्पणी" : "Additional Notes"}</p>
                    <p className="text-slate-600 leading-relaxed font-bold">{viewingTeacher.additionalNotes}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setViewingTeacher(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
              >
                {language === "hi" ? "ठीक है" : "Close Details"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- EDIT MODAL (RESTRICTED TO SUPER ADMIN) --- */}
      {editingTeacher && isSuperAdmin && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-2xl border border-slate-200 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <form onSubmit={handleSaveTeacherEdit} className="flex flex-col h-full">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-3">
                  <Edit2 className="w-5 h-5 text-rose-500" />
                  <h3 className="font-extrabold text-slate-900 text-sm">{language === "hi" ? "शिक्षक जानकारी संपादित करें" : "Edit Teacher Profile Record"}</h3>
                </div>
                <button type="button" onClick={() => setEditingTeacher(null)} className="p-1 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-slate-600">
                  <div className="space-y-1">
                    <label className="block text-[10px] text-slate-400 uppercase tracking-wider">{language === "hi" ? "शिक्षक का नाम" : "Teacher Name"}</label>
                    <input
                      type="text"
                      required
                      value={editingTeacher.name || ""}
                      onChange={(e) => setEditingTeacher({ ...editingTeacher, name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-slate-800 font-extrabold focus:outline-none focus:ring-1 focus:ring-rose-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] text-slate-400 uppercase tracking-wider">{language === "hi" ? "लिंग" : "Gender"}</label>
                    <select
                      value={editingTeacher.gender || "Male"}
                      onChange={(e) => setEditingTeacher({ ...editingTeacher, gender: e.target.value as any })}
                      className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-slate-800 font-extrabold focus:outline-none focus:ring-1 focus:ring-rose-500"
                    >
                      <option value="Male">{language === "hi" ? "पुरुष" : "Male"}</option>
                      <option value="Female">{language === "hi" ? "महिला" : "Female"}</option>
                      <option value="Other">{language === "hi" ? "अन्य" : "Other"}</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] text-slate-400 uppercase tracking-wider">{language === "hi" ? "मोबाइल नंबर" : "Mobile Number"}</label>
                    <input
                      type="tel"
                      required
                      value={editingTeacher.mobile || ""}
                      onChange={(e) => setEditingTeacher({ ...editingTeacher, mobile: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-slate-800 font-extrabold focus:outline-none focus:ring-1 focus:ring-rose-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] text-slate-400 uppercase tracking-wider">{language === "hi" ? "ईमेल पता" : "Email Address"}</label>
                    <input
                      type="email"
                      value={editingTeacher.email || ""}
                      onChange={(e) => setEditingTeacher({ ...editingTeacher, email: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-slate-800 font-extrabold focus:outline-none focus:ring-1 focus:ring-rose-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] text-slate-400 uppercase tracking-wider">{language === "hi" ? "कर्मचारी आईडी" : "Employee ID"}</label>
                    <input
                      type="text"
                      value={editingTeacher.employeeId || ""}
                      onChange={(e) => setEditingTeacher({ ...editingTeacher, employeeId: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-slate-800 font-extrabold focus:outline-none focus:ring-1 focus:ring-rose-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] text-slate-400 uppercase tracking-wider">{language === "hi" ? "शिक्षक श्रेणी" : "Teacher Category Type"}</label>
                    <input
                      type="text"
                      required
                      value={editingTeacher.teacherType || ""}
                      onChange={(e) => setEditingTeacher({ ...editingTeacher, teacherType: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-slate-800 font-extrabold focus:outline-none"
                      placeholder="e.g. BPSC TRE 3.0"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] text-slate-400 uppercase tracking-wider">{language === "hi" ? "कक्षा श्रेणी" : "Class Category"}</label>
                    <input
                      type="text"
                      required
                      value={editingTeacher.classCategory || ""}
                      onChange={(e) => setEditingTeacher({ ...editingTeacher, classCategory: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-slate-800 font-extrabold focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] text-slate-400 uppercase tracking-wider">{language === "hi" ? "विषय" : "Subject"}</label>
                    <input
                      type="text"
                      required
                      value={editingTeacher.subject || ""}
                      onChange={(e) => setEditingTeacher({ ...editingTeacher, subject: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-slate-800 font-extrabold focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] text-slate-400 uppercase tracking-wider">{language === "hi" ? "यूडीआईएसई कोड" : "UDISE Code"}</label>
                    <input
                      type="text"
                      value={editingTeacher.udiseCode || ""}
                      onChange={(e) => setEditingTeacher({ ...editingTeacher, udiseCode: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-slate-800 font-extrabold focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] text-slate-400 uppercase tracking-wider">{language === "hi" ? "सेवा के वर्ष" : "Years of Service"}</label>
                    <input
                      type="number"
                      value={editingTeacher.yearsOfService || 0}
                      onChange={(e) => setEditingTeacher({ ...editingTeacher, yearsOfService: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-slate-800 font-extrabold focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="block text-[10px] text-slate-400 uppercase tracking-wider">{language === "hi" ? "वर्तमान विद्यालय नाम" : "Current School Name"}</label>
                    <input
                      type="text"
                      required
                      value={editingTeacher.currentSchool || ""}
                      onChange={(e) => setEditingTeacher({ ...editingTeacher, currentSchool: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-slate-800 font-extrabold focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] text-slate-400 uppercase tracking-wider">{language === "hi" ? "वर्तमान जिला" : "Current District"}</label>
                    <input
                      type="text"
                      required
                      value={editingTeacher.currentDistrict || ""}
                      onChange={(e) => setEditingTeacher({ ...editingTeacher, currentDistrict: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-slate-800 font-extrabold focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] text-slate-400 uppercase tracking-wider">{language === "hi" ? "वर्तमान ब्लॉक" : "Current Block"}</label>
                    <input
                      type="text"
                      required
                      value={editingTeacher.currentBlock || ""}
                      onChange={(e) => setEditingTeacher({ ...editingTeacher, currentBlock: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-slate-800 font-extrabold focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] text-slate-400 uppercase tracking-wider">{language === "hi" ? "वांछित जिला (ट्रांसफर)" : "Desired District (Swap Target)"}</label>
                    <input
                      type="text"
                      required
                      value={editingTeacher.desiredDistrict || ""}
                      onChange={(e) => setEditingTeacher({ ...editingTeacher, desiredDistrict: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-slate-800 font-extrabold focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] text-slate-400 uppercase tracking-wider">{language === "hi" ? "वांछित ब्लॉक" : "Desired Block"}</label>
                    <input
                      type="text"
                      value={editingTeacher.desiredBlock || ""}
                      onChange={(e) => setEditingTeacher({ ...editingTeacher, desiredBlock: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-slate-800 font-extrabold focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="block text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={editingTeacher.isVerified || false}
                        onChange={(e) => setEditingTeacher({ ...editingTeacher, isVerified: e.target.checked })}
                        className="rounded text-rose-500 focus:ring-rose-500 cursor-pointer"
                      />
                      <span>{language === "hi" ? "सत्यापित प्रोफाइल के रूप में चिह्नित करें" : "Mark as Verified Profile"}</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingTeacher(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  {language === "hi" ? "रद्द करें" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  {isSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{language === "hi" ? "बदलाव सहेजें" : "Save Changes"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- DELETE CONFIRMATION DIALOG (SINGLE) --- */}
      {deletingTeacher && isSuperAdmin && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md border border-slate-200 overflow-hidden shadow-2xl">
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-500 mx-auto">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-slate-900 text-sm">{language === "hi" ? "शिक्षक को हटाने की पुष्टि करें?" : "Confirm Record Deletion?"}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {language === "hi" 
                    ? `क्या आप वाकई शिक्षक ${deletingTeacher.name} को हटाने के लिए तैयार हैं? इस कार्रवाई से शिक्षक के सभी संबंधित म्युचुअल ट्रांसफर आवेदन, सूचनाएं और डेटा हमेशा के लिए समाप्त हो जाएंगे।` 
                    : `Are you absolutely sure you want to delete teacher ${deletingTeacher.name}? This action is irreversible and will also delete all related mutual transfer requests, notifications, and dependent records while maintaining database integrity.`}
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2.5 text-xs font-bold">
              <button
                onClick={() => setDeletingTeacher(null)}
                disabled={isSubmitting}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl transition-all cursor-pointer"
              >
                {language === "hi" ? "रद्द करें" : "Cancel"}
              </button>
              <button
                onClick={() => handleDeleteTeacher(deletingTeacher.id)}
                disabled={isSubmitting}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                {isSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{language === "hi" ? "हाँ, हटाएं" : "Yes, Delete Record"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- BULK ACTIONS CONFIRMATION DIALOG --- */}
      {bulkConfirmAction && isSuperAdmin && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md border border-slate-200 overflow-hidden shadow-2xl">
            <div className="p-6 text-center space-y-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto border ${
                bulkConfirmAction === "delete" 
                  ? "bg-rose-50 border-rose-200 text-rose-500" 
                  : "bg-emerald-50 border-emerald-200 text-emerald-500"
              }`}>
                {bulkConfirmAction === "delete" ? <Trash2 className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-slate-900 text-sm">
                  {bulkConfirmAction === "delete" 
                    ? (language === "hi" ? `${selectedIds.length} शिक्षकों को हटाने की पुष्टि करें?` : `Delete ${selectedIds.length} Selected Records?`)
                    : (language === "hi" ? `${selectedIds.length} शिक्षकों को सत्यापित करने की पुष्टि करें?` : `Verify ${selectedIds.length} Selected Records?`)}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {bulkConfirmAction === "delete" 
                    ? (language === "hi" 
                      ? "क्या आप वाकई इन सभी चयनित शिक्षक प्रोफाइल को हमेशा के लिए हटाने के लिए सहमत हैं? इससे उनसे संबंधित सभी ट्रांसफर अनुरोध, सूचनाएं आदि नष्ट हो जाएंगे।" 
                      : `Are you completely sure you want to perform a bulk delete of ${selectedIds.length} teachers? This will purge all related database records, transfer requests, and notifications dynamically for all selected items.`)
                    : (language === "hi" 
                      ? "क्या आप चयनित शिक्षकों के प्रोफाइल को सत्यापित करने के लिए सहमत हैं?" 
                      : `Are you sure you want to verify all ${selectedIds.length} selected teachers? Verified profiles will be highlighted in search results with a verified checkmark badge.`)}
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2.5 text-xs font-bold">
              <button
                onClick={() => setBulkConfirmAction(null)}
                disabled={isSubmitting}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl transition-all cursor-pointer"
              >
                {language === "hi" ? "रद्द करें" : "Cancel"}
              </button>
              <button
                onClick={bulkConfirmAction === "delete" ? handleBulkDelete : handleBulkVerify}
                disabled={isSubmitting}
                className={`px-5 py-2 text-white rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm ${
                  bulkConfirmAction === "delete" ? "bg-rose-600 hover:bg-rose-700" : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {isSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>
                  {bulkConfirmAction === "delete" 
                    ? (language === "hi" ? "हाँ, हटाएं" : "Confirm Delete")
                    : (language === "hi" ? "हाँ, सत्यापित करें" : "Confirm Verify")}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
