import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, HelpCircle, ShieldCheck, Heart } from "lucide-react";

export default function ContactCard() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "Feedback & Bug Report",
    message: ""
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      alert("Please fill in all fields.");
      return;
    }
    // Simulate successful form dispatch
    setIsSubmitted(true);
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4 sm:px-6">
      {/* Title */}
      <div className="text-center space-y-4 mb-12">
        <span className="text-[10px] font-black tracking-widest text-[#d85c18] uppercase font-mono bg-amber-50 border border-amber-100 rounded-full px-3 py-1 inline-block">
          Support Center
        </span>
        <h1 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tight font-display">
          Connect With Our <br />
          <span className="bg-gradient-to-r from-orange-500 via-rose-500 to-indigo-600 bg-clip-text text-transparent">
            Blueprint Advisory Team
          </span>
        </h1>
        <p className="text-slate-600 max-w-2xl mx-auto text-base">
          Have an inquiry, feedback regarding salary calculations, or want to suggest new indicators for the 8th Pay commission model? Send us your message!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
        {/* Contact Form Details Column (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-100 rounded-3xl p-6 sm:p-10 shadow-xs">
          {isSubmitted ? (
            <div className="text-center space-y-4 py-8 animate-fade-in">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 border border-emerald-100 mx-auto">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Message Received Securely!</h3>
              <p className="text-slate-500 text-xs leading-relaxed max-w-md mx-auto">
                Dhanyavad, **{formData.name}**! Our advisory helpdesk has logged your ticket. We typically analyze government models and respond via email within 24 working hours.
              </p>
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setFormData({ name: "", email: "", subject: "Feedback & Bug Report", message: "" });
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <h3 className="text-base font-black text-slate-850 font-mono uppercase tracking-widest border-b border-slate-50 pb-3">
                Advisory Correspondence
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">Your Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your name"
                    className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-200/50 focus:border-indigo-500 focus:bg-white rounded-xl transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@gmail.com"
                    className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-200/50 focus:border-indigo-500 focus:bg-white rounded-xl transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">Topic of Inquiry</label>
                <select
                  value={formData.subject}
                  onChange={e => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-200/50 focus:border-indigo-500 focus:bg-white rounded-xl transition-all"
                >
                  <option value="Feedback & Bug Report">Feedback & Bug Report</option>
                  <option value="8th Pay Commission Projections">8th Pay Commission Projections</option>
                  <option value="Custom Retirement Advisory">Custom Retirement Advisory</option>
                  <option value="Business & Partnership">Business & Partnership</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">Your Message</label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Draft your detailed message or feedback here..."
                  className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-200/50 focus:border-indigo-500 focus:bg-white rounded-xl transition-all"
                />
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-rose-600 text-white text-xs font-black py-3 px-6 rounded-xl hover:shadow-lg active:scale-98 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Dispatch Correspondence</span>
              </button>
            </form>
          )}
        </div>

        {/* Contact Info Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-gradient-to-b from-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-md border border-indigo-900/30">
            <h3 className="text-lg font-black font-display text-indigo-300">Quick Directory</h3>
            <p className="text-slate-400 text-xs mt-1.5">Have immediate inquiries? Reach us via:</p>

            <div className="space-y-5 mt-6 text-xs border-t border-indigo-900/40 pt-6">
              <div className="flex gap-3">
                <Mail className="w-5 h-5 text-indigo-400 shrink-0" />
                <div>
                  <span className="block text-slate-400 uppercase font-mono text-[9px] tracking-wider font-bold">Advisory Mailbox</span>
                  <a href="mailto:advisor@paisa.in" className="text-white hover:text-indigo-300 underline font-mono tracking-tight text-sm">
                    advisor@paisa.in
                  </a>
                </div>
              </div>

              <div className="flex gap-3">
                <Phone className="w-5 h-5 text-indigo-400 shrink-0" />
                <div>
                  <span className="block text-slate-400 uppercase font-mono text-[9px] tracking-wider font-bold">Helpline</span>
                  <span className="text-white font-mono text-sm">
                    +91 (0) 11 2611-3000
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <MapPin className="w-5 h-5 text-indigo-400 shrink-0" />
                <div>
                  <span className="block text-slate-400 uppercase font-mono text-[9px] tracking-wider font-bold">National Secretariat</span>
                  <span className="text-white leading-relaxed font-sans text-xs">
                    Connaught Place, Financial Hub Distt-1<br />
                    New Delhi, Pin 110001, India
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-150 rounded-2xl p-6 text-center space-y-2">
            <div className="flex items-center justify-center gap-1.5 text-xs text-rose-600 font-bold">
              <Heart className="w-4 h-4 fill-rose-600" />
              <span>Free Forever Software</span>
            </div>
            <p className="text-[10px] leading-relaxed text-slate-500 max-w-xs mx-auto">
              Our tools are fully open-source and operated via public volunteers. All computations are locally compiled to protect your assets.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
