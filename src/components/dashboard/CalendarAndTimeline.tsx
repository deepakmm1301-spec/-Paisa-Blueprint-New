import React, { useState } from "react";
import { DashboardData } from "./DashboardDataStore";
import { Calendar, Clock, Landmark, Coins, Plus, Trash2, ShieldAlert, CheckCircle, BellRing } from "lucide-react";

interface CalendarAndTimelineProps {
  data: DashboardData;
  language: "en" | "hi";
  onUpdateData: (newData: DashboardData) => void;
}

export default function CalendarAndTimeline({ data, language, onUpdateData }: CalendarAndTimelineProps) {
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventType, setEventType] = useState<"sip" | "emi" | "insurance" | "tax" | "reminder">("reminder");
  const [eventAmount, setEventAmount] = useState("");

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle || !eventDate) return;

    const newEvent = {
      id: "cal-" + Date.now(),
      title: eventTitle,
      date: eventDate,
      type: eventType as any,
      amount: eventAmount ? parseFloat(eventAmount) : undefined,
    };

    const updated = {
      ...data,
      calendarEvents: [...data.calendarEvents, newEvent],
      timeline: [
        {
          id: `t-${Date.now()}`,
          action: `Calendar event "${eventTitle}" scheduled for ${eventDate}`,
          date: new Date().toISOString(),
          category: "Calendar Scheduling",
        },
        ...data.timeline,
      ],
    };

    onUpdateData(updated);
    setShowEventForm(false);
    setEventTitle("");
    setEventDate("");
    setEventAmount("");
  };

  const handleDeleteEvent = (id: string, title: string) => {
    const updated = {
      ...data,
      calendarEvents: data.calendarEvents.filter(e => e.id !== id),
      timeline: [
        {
          id: `t-${Date.now()}`,
          action: `Calendar event "${title}" cancelled`,
          date: new Date().toISOString(),
          category: "Calendar Scheduling",
        },
        ...data.timeline,
      ],
    };
    onUpdateData(updated);
  };

  // Icon selector helper
  const getEventBadge = (type: string) => {
    switch (type) {
      case "sip": return { label: "SIP Outflow", bg: "bg-purple-100/50 text-purple-800 border-purple-200" };
      case "emi": return { label: "Loan EMI", bg: "bg-rose-100/50 text-rose-800 border-rose-200" };
      case "insurance": return { label: "Insurance Premium", bg: "bg-sky-100/50 text-sky-800 border-sky-200" };
      case "tax": return { label: "Tax Obligation", bg: "bg-orange-100/50 text-orange-800 border-orange-200" };
      default: return { label: "Reminder", bg: "bg-slate-100/50 text-slate-800 border-slate-200" };
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Calendar Section (7 cols) */}
      <div id="section-calendar" className="lg:col-span-7 bg-white border border-slate-100 rounded-3xl p-6 shadow-3xs space-y-5">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-base font-black text-slate-900 font-display flex items-center gap-1.5">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <span>{language === "hi" ? "आने वाली वित्तीय तिथि पत्रक" : "Unified Financial Calendar Agenda"}</span>
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              {language === "hi" ? "मासिक ईएमआई, एसआईपी ऑटो-डेबिट, प्रीमियम और रिटर्न फाइलिंग रिमाइंडर" : "Never miss custom SIP triggers, EMI debits, or policy renewals."}
            </p>
          </div>

          <button
            onClick={() => setShowEventForm(!showEventForm)}
            className="px-3 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
          >
            {showEventForm ? "Cancel" : "Add Event"}
          </button>
        </div>

        {showEventForm && (
          <form onSubmit={handleAddEvent} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 block">Event Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Life Insurance, Mutual Fund SIP"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 block">Date (Day or YYYY-MM-DD)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 05 (monthly) or 2026-03-31"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 block">Event Category</label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value as any)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                >
                  <option value="reminder">Reminder Notification</option>
                  <option value="sip">SIP Outflow Auto-Debit</option>
                  <option value="emi">EMI Outflow Auto-Debit</option>
                  <option value="insurance">Insurance Premium Renewal</option>
                  <option value="tax">Tax Compliance Deadline</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 block">Amount Outflow (₹, Optional)</label>
                <input
                  type="number"
                  placeholder="₹"
                  value={eventAmount}
                  onChange={(e) => setEventAmount(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-4 py-1.5 bg-bhagwa-600 hover:bg-bhagwa-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                Schedule Event
              </button>
            </div>
          </form>
        )}

        <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
          {data.calendarEvents.map((evt) => {
            const badge = getEventBadge(evt.type);
            const isMonthly = evt.date.length <= 2;

            return (
              <div key={evt.id} className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex justify-between items-center hover:bg-slate-100/50 transition-all group">
                <div className="flex items-center gap-3">
                  {/* Visual calendar block */}
                  <div className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex flex-col items-center justify-center shrink-0 shadow-3xs">
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 block leading-none">
                      {isMonthly ? (language === "hi" ? "मासिक" : "MONTH") : "DATE"}
                    </span>
                    <span className="text-xs font-black text-slate-900 font-mono leading-tight">
                      {evt.date}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-slate-800 leading-tight">
                      {evt.title}
                    </h4>
                    <span className={`text-[8px] font-extrabold px-2 py-0.5 border rounded-full ${badge.bg}`}>
                      {badge.label}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {evt.amount && (
                    <span className="text-xs font-mono font-bold text-slate-800">
                      ₹{evt.amount.toLocaleString()}
                    </span>
                  )}
                  <button
                    onClick={() => handleDeleteEvent(evt.id, evt.title)}
                    className="p-1 text-slate-350 hover:text-rose-600 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                    title="Remove appointment"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Activity Timeline (5 cols) */}
      <div id="section-timeline" className="lg:col-span-5 bg-white border border-slate-100 rounded-3xl p-6 shadow-3xs space-y-4">
        <div>
          <h3 className="text-base font-black text-slate-900 font-display flex items-center gap-1.5">
            <Clock className="w-5 h-5 text-emerald-600" />
            <span>{language === "hi" ? "वित्तीय घटनाक्रम लॉग" : "Command History Activity Log"}</span>
          </h3>
          <p className="text-xs text-slate-400 font-medium">
            {language === "hi" ? "सुरक्षित स्थानीय स्टोरेज में दर्ज किए गए आपके सभी वित्तीय बदलाव और घटनाक्रम" : "Audit trail of calculated metrics and balance revisions."}
          </p>
        </div>

        <div className="relative border-l border-slate-200 pl-4 ml-2.5 py-1 space-y-5 max-h-[350px] overflow-y-auto pr-1">
          {data.timeline.map((item) => (
            <div key={item.id} className="relative space-y-1">
              {/* Point Indicator */}
              <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white ring-4 ring-emerald-50" />

              <span className="text-[9px] font-black uppercase text-slate-400 block tracking-wider">
                {new Date(item.date).toLocaleTimeString(language === "hi" ? "hi-IN" : "en-US", { hour: "numeric", minute: "2-digit" })} • {item.category}
              </span>
              <p className="text-xs font-semibold text-slate-700 leading-tight">
                {item.action}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
