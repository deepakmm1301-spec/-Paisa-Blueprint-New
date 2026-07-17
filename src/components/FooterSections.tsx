import React, { useState, useEffect } from "react";
import { paisaFetch } from "../api";
import { 
  X, 
  Info, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldAlert, 
  FileText, 
  Clock, 
  Heart, 
  ArrowRight,
  Sparkles,
  Award,
  Users
} from "lucide-react";
import { getShareableLink } from "../types";

type FooterTab = "about" | "contact" | "privacy" | "disclaimer" | "terms" | null;

export function FooterSections({ language = "en" }: { language?: "en" | "hi" } = {}) {
  const [activeTab, setActiveTab] = useState<FooterTab>(null);
  const [visitorCount, setVisitorCount] = useState<number | null>(null);

  const closeModal = () => setActiveTab(null);

  useEffect(() => {
    // Record page view on load
    paisaFetch("/api/visitors/hit", { method: "POST" })
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.count === "number") {
          setVisitorCount(data.count);
        }
      })
      .catch((err) => {
        console.warn("Failed to post visitor hit, fetching count via GET fallback...", err);
        paisaFetch("/api/visitors")
          .then((res) => res.json())
          .then((data) => {
            if (typeof data.count === "number") {
              setVisitorCount(data.count);
            }
          })
          .catch((e) => console.warn("Could not fetch visitors", e));
      });
  }, []);

  // Render content dynamically based on the clicked link
  const renderContent = () => {
    switch (activeTab) {
      case "about":
        return (
          <div className="space-y-4 text-sm leading-relaxed text-slate-300">
            <div className="flex items-center gap-2 text-emerald-450 border-b border-slate-800 pb-2 mb-2">
              <Info className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-base font-sans tracking-tight text-white">About Paisa Blueprint</h3>
            </div>
            <p>
              <strong>Paisa Blueprint</strong> is an advanced offline-first financial modeling and portfolio simulation simulator designed specifically for standard Indian Union Income Tax regulations, the 7th Pay Commission pay structures, and prudent local investment portfolios.
            </p>
            <p>
              Our mission is to democratize financial literacy across India. By offering zero-barrier, sandbox-mode simulations of dynamic salaries, step-up SIPs, EPF/PPF compounding, custom loan amortizations, and smart Union tax deductions, we empower individuals to plan their wealth pathways with complete privacy and data security.
            </p>
            <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 space-y-2 font-mono text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
                <Award className="w-4 h-4" /> Core Value Architecture:
              </div>
              <ul className="list-disc pl-4 space-y-1">
                <li><strong>100% Privacy-First:</strong> No signup trackers or servers inspect your numbers.</li>
                <li><strong>Dynamic Calculators:</strong> Real-time Indian Tax regime selection (Old vs New).</li>
                <li><strong>Future Projection:</strong> Dynamic CIBIL buffers, compounding run-rates, and Retirement glidepaths.</li>
              </ul>
            </div>
          </div>
        );
      case "contact":
        return (
          <div className="space-y-4 text-sm leading-relaxed text-slate-300">
            <div className="flex items-center gap-2 text-emerald-450 border-b border-slate-800 pb-2 mb-2">
              <Mail className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-base font-sans tracking-tight text-white">Contact Us</h3>
            </div>
            <p>
              If you have queries, feedback, or would like to suggest new calculators, please feel free to reach out. Our offline developer simulator team is always looking to polish user experiences!
            </p>
            <div className="space-y-3 pt-2 font-mono text-xs">
              <div className="flex items-center gap-3 bg-slate-900/50 p-2.5 rounded-lg border border-slate-850">
                <Mail className="w-4 h-4 text-emerald-450" />
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Developer support</span>
                  <a href="mailto:support@paisablueprint.in" className="text-emerald-400 hover:underline">support@paisablueprint.in</a>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-slate-900/50 p-2.5 rounded-lg border border-slate-850">
                <Phone className="w-4 h-4 text-emerald-450" />
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Phone / Helpline</span>
                  <span className="text-slate-300">+91 (11) 2467-9000 (Mon-Fri, 10 AM - 5 PM)</span>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-slate-900/50 p-2.5 rounded-lg border border-slate-850">
                <MapPin className="w-4 h-4 text-emerald-450" />
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Headquarters Workspace</span>
                  <span className="text-slate-300">Netaji Subhash Place, Pitampura, New Delhi - 110034, India</span>
                </div>
              </div>
            </div>
          </div>
        );
      case "privacy":
        return (
          <div className="space-y-4 text-sm leading-relaxed text-slate-300">
            <div className="flex items-center gap-2 text-emerald-450 border-b border-slate-800 pb-2 mb-2">
              <ShieldAlert className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-base font-sans tracking-tight text-white">Privacy Policy</h3>
            </div>
            <p>
              Your financial data is yours alone. At <strong>Paisa Blueprint</strong>, privacy is not an option; it is our foundation.
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>
                <strong>No Server Storage:</strong> Any financial assets, salary parameters, savings, credit logs, and tax numbers entered into the simulator reside exclusively inside your device's web browser storage (<code className="bg-slate-900 px-1 py-0.5 rounded text-rose-450 text-xs font-mono">localStorage</code>).
              </li>
              <li>
                <strong>Local Persistence:</strong> No network payloads transmit your personal wealth metrics to any third-party clouds. Click <code className="bg-slate-900 px-1 py-0.5 rounded text-xs text-white">Config Folders</code> to clear or export custom portfolios at any time.
              </li>
              <li>
                <strong>Third-party APIs:</strong> If you use our advanced AI Coach, only aggregated conceptual prompt questions are queried against secure sandboxed models without identifying keys.
              </li>
            </ul>
            <p className="text-xs text-slate-500 pt-2 font-mono">
              Last Updated: June 2026. Compliant with standard Information Technology Act rules.
            </p>
          </div>
        );
      case "disclaimer":
        return (
          <div className="space-y-4 text-sm leading-relaxed text-slate-300">
            <div className="flex items-center gap-2 text-emerald-450 border-b border-slate-800 pb-2 mb-2">
              <ShieldAlert className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-base font-sans tracking-tight text-white">Disclaimer</h3>
            </div>
            <p className="font-semibold text-rose-400">
              ⚠️ Educational Simulation Only.
            </p>
            <p>
              All projections, savings multipliers on mutual funds, compound interest plans, EPFO rate scenarios, retirement simulations, and income tax estimations shown in <strong>Paisa Blueprint</strong> are completely mock calculations. They are for educational visualization purposes only.
            </p>
            <p>
              Any recommendations surfaced by our charts or AI Assistant do not constitute professional certified wealth advice. We recommend consulting a licensed Chartered Accountant (CA) or a SEBI-registered Investment Advisor before committing to real financial policies, tax payments, or capital market assets.
            </p>
          </div>
        );
      case "terms":
        return (
          <div className="space-y-4 text-sm leading-relaxed text-slate-300">
            <div className="flex items-center gap-2 text-emerald-450 border-b border-slate-800 pb-2 mb-2">
              <FileText className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-base font-sans tracking-tight text-white">Terms & Conditions</h3>
            </div>
            <p>
              By accessing the offline simulation dashboards, customizable wealth paths, and interactive calculators of <strong>Paisa Blueprint</strong>, you agree to the following conditions:
            </p>
            <ol className="list-decimal pl-5 space-y-2 mt-2">
              <li>
                <strong>Permitted Use:</strong> You may run unlimited simulated scenarios for personal study. Redistribution of any compiled output for commercial purposes without attribution is prohibited.
              </li>
              <li>
                <strong>No Financial Assurances:</strong> The platform offers zero warranty regarding the future reliability of tax codes, pay commission amendments, or market returns shown here.
              </li>
              <li>
                <strong>Browser Dependencies:</strong> Since files are executed client-side, any cleared cookies or hard cache resets might wipe your active directory paths. Please backup your config folders.
              </li>
            </ol>
            <p className="text-xs text-slate-500 pt-2 font-mono">
              Use of this app indicates consent to standard educational sandbox usage rules.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-slate-950 border-t border-slate-900 py-12 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top block structure inside footer */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 border-b border-slate-900 pb-8">
          
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-emerald-500/10 rounded-lg flex items-center justify-center border border-emerald-400/20">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <span className="text-xs font-black tracking-widest text-white font-mono">
                PAISA BLUEPRINT
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-500 font-sans">
              Prudent Indian Financial Mandates, direct SIP appraiser, and 7th Pay Commission simulation cockpit. Crafted to protect data privacy.
            </p>
          </div>

          {/* Practical Links Sections */}
          <div className="space-y-2">
            <h5 className="text-[9px] font-black uppercase tracking-widest text-white font-mono">
              INFORMATION HUB
            </h5>
            <ul className="text-xs space-y-1.5 font-medium">
              <li>
                <button 
                  onClick={() => setActiveTab("about")}
                  className="hover:text-emerald-400 text-slate-400 text-left transition-all cursor-pointer inline-flex items-center gap-1 hover:translate-x-0.5"
                >
                  <ArrowRight className="w-2.5 h-2.5 opacity-60" />
                  <span>About Us</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab("contact")}
                  className="hover:text-emerald-400 text-slate-400 text-left transition-all cursor-pointer inline-flex items-center gap-1 hover:translate-x-0.5"
                >
                  <ArrowRight className="w-2.5 h-2.5 opacity-60" />
                  <span>Contact Us</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    const message = language === "hi"
                      ? "Paisa Blueprint देखें - भारतीय वेतनभोगी कर्मचारियों के लिए स्वतंत्र वित्तीय सलाहकार! अपना पोर्टफोलियो बनाएं, टैक्स बचाएं, SIP और रिटायरमेंट लक्ष्य जांचें। इसे यहाँ लाइव उपयोग करें: " + getShareableLink()
                      : "Check out Paisa Blueprint - The Indian salaried personal finance adviser! Formulate your portfolio, optimize tax, simulate SIP and retirement targets. Try it live at: " + getShareableLink();
                    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, "_blank");
                  }}
                  className="hover:text-emerald-400 text-slate-400 text-left transition-all cursor-pointer inline-flex items-center gap-1 hover:translate-x-0.5"
                >
                  <ArrowRight className="w-2.5 h-2.5 opacity-60 text-emerald-450" />
                  <span className="text-emerald-450 font-extrabold">
                    {language === "hi" ? "व्हाट्सऐप पर ऐप साझा करें 🚀" : "Share App to WhatsApp 🚀"}
                  </span>
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h5 className="text-[9px] font-black uppercase tracking-widest text-white font-mono">
              LEGAL COMPLIANCE
            </h5>
            <ul className="text-xs space-y-1.5 font-medium">
              <li>
                <button 
                  onClick={() => setActiveTab("privacy")}
                  className="hover:text-emerald-400 text-slate-400 text-left transition-all cursor-pointer inline-flex items-center gap-1 hover:translate-x-0.5"
                >
                  <ArrowRight className="w-2.5 h-2.5 opacity-60" />
                  <span>Privacy Policy</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab("terms")}
                  className="hover:text-emerald-400 text-slate-400 text-left transition-all cursor-pointer inline-flex items-center gap-1 hover:translate-x-0.5"
                >
                  <ArrowRight className="w-2.5 h-2.5 opacity-60" />
                  <span>Terms & Conditions</span>
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h5 className="text-[9px] font-black uppercase tracking-widest text-white font-mono">
              ASSURANCES
            </h5>
            <ul className="text-xs space-y-1.5 font-medium">
              <li>
                <button 
                  onClick={() => setActiveTab("disclaimer")}
                  className="hover:text-amber-400 text-slate-400 text-left transition-all cursor-pointer inline-flex items-center gap-1 hover:translate-x-0.5"
                >
                  <ArrowRight className="w-2.5 h-2.5 opacity-60 text-amber-500" />
                  <span>Disclaimer</span>
                </button>
              </li>
              <li className="text-[10px] text-slate-600 leading-relaxed font-mono mt-1 select-none">
                🇮🇳 Regulated by custom client-side offline engines.
              </li>
            </ul>
          </div>

        </div>

        {/* Visitor Counter Section */}
        <div id="footer-visitors-section" className="mb-8 pt-6 border-t border-slate-900/65 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left">
            <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-emerald-400 font-mono block">
              THANK YOU FOR VISITING US
            </span>
            <span className="text-[10px] text-slate-500 font-sans mt-0.5 block">
              Your personalized, private salaried income helper cockpit.
            </span>
          </div>

          <div className="flex items-center gap-3 bg-slate-900/40 px-4 py-2.5 rounded-2xl border border-slate-900 shadow-lg">
            <div className="flex flex-col items-end">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-450 font-mono">
                TOTAL VISITORS
              </span>
              <span className="text-[8px] text-slate-500 font-mono uppercase">
                (as counting)
              </span>
            </div>
            <div className="h-6 w-[1px] bg-slate-800" />
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
              {visitorCount !== null ? (
                <div className="flex gap-1 animate-fadeIn">
                  {String(visitorCount)
                    .split("")
                    .map((digit, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center justify-center w-5.5 h-7 bg-slate-950 text-emerald-400 rounded-md border border-slate-800 font-mono text-xs font-black shadow-md"
                      >
                        {digit}
                      </span>
                    ))}
                </div>
              ) : (
                <span className="text-[10px] text-slate-500 font-mono animate-pulse">Counting...</span>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-600 font-medium">
          <div className="flex items-center gap-1 text-center sm:text-left">
            <span>Salary Calculator • NPS Calculator Pension Calculator SIP Calculator</span>
          </div>
          <div className="flex items-center gap-1 text-slate-500 text-center sm:text-right">
            <span>Visit India's Own Salaried Personal Calculator</span>
          </div>
        </div>

      </div>

      {/* Glassmorphic interactive Dialog Modal Overlay */}
      {activeTab && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Ambient indicator */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-cyan-400 to-emerald-500" />
            
            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              title="Close Panel"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Scroll Content */}
            <div className="overflow-y-auto pr-1 py-1 mt-2">
              {renderContent()}
            </div>

            {/* Modal action button */}
            <div className="mt-5 pt-4 border-t border-slate-800/60 flex justify-end">
              <button
                onClick={closeModal}
                className="py-1.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold font-mono transition-all hover:shadow-[0_0_10px_rgba(16,185,129,0.3)] active:scale-95 cursor-pointer"
              >
                CLOSE READOUT
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
