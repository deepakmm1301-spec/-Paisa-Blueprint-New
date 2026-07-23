import React, { useState } from "react";
import { 
  Share2, 
  Copy, 
  Check, 
  MessageCircle, 
  Send, 
  Facebook, 
  Sliders, 
  ExternalLink 
} from "lucide-react";
import { Poll } from "../../types/poll";
import { getPollSlug } from "../../lib/pollUtils";
import { safeRenderText } from "../../utils/safeRender";

interface PollShareBarProps {
  poll: Poll;
  language?: "en" | "hi";
  compact?: boolean;
  className?: string;
  showTitle?: boolean;
}

export const PollShareBar: React.FC<PollShareBarProps> = ({
  poll,
  language = "hi",
  compact = false,
  className = "",
  showTitle = true
}) => {
  const [copied, setCopied] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [isOpen, setIsOpen] = useState(!compact);

  // Platform Visibility Toggles (User controlled)
  const [showWhatsApp, setShowWhatsApp] = useState(true);
  const [showFacebook, setShowFacebook] = useState(true);
  const [showTelegram, setShowTelegram] = useState(true);

  const slug = getPollSlug(poll);
  
  // Direct URL that opens this exact poll page
  const getPollUrl = () => {
    if (typeof window === "undefined") return `https://paisablueprint.in/polls/${slug}`;
    const origin = window.location.origin;
    return `${origin}/polls/${slug}`;
  };

  const shareUrl = getPollUrl();
  const pollQuestionText = safeRenderText(poll.question, "Opinion Poll");

  const shareMessage = language === "hi" 
    ? `🗳️ *जनमत सर्वेक्षण में अपना मत दें*: "${pollQuestionText}"\n\nसीधे इस लिंक पर क्लिक करके अपना वोट दर्ज करें:\n👉 ${shareUrl}`
    : `🗳️ *Cast your vote in this Opinion Poll*: "${pollQuestionText}"\n\nClick the link to participate directly:\n👉 ${shareUrl}`;

  const handleCopy = () => {
    try {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (e) {
      console.error("Failed to copy URL:", e);
    }
  };

  const handleWhatsAppShare = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleFacebookShare = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleTelegramShare = () => {
    const text = language === "hi" 
      ? `🗳️ जनमत सर्वेक्षण: "${pollQuestionText}"`
      : `🗳️ Opinion Poll: "${pollQuestionText}"`;
    const url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({
        title: pollQuestionText,
        text: `Vote now on Paisa Blueprint: ${pollQuestionText}`,
        url: shareUrl
      }).catch(() => {});
    } else {
      handleCopy();
    }
  };

  return (
    <div className={`bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-3 sm:p-4 border border-slate-200/80 dark:border-slate-700/80 space-y-3 transition-all ${className}`}>
      {/* Top Title & Toggle Controls Bar */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button 
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1.5 text-xs font-black text-slate-800 dark:text-slate-100 hover:text-amber-600 transition-colors cursor-pointer"
          >
            <Share2 className="w-4 h-4 text-amber-500" />
            {showTitle && (
              <span>{language === "hi" ? "जनमत साझा करें (Share Poll)" : "Share Opinion Poll"}</span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Platform Settings Toggle Trigger */}
          <button
            type="button"
            onClick={() => setShowConfig(!showConfig)}
            className={`p-1.5 rounded-lg border text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
              showConfig 
                ? "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-200" 
                : "bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-100"
            }`}
            title="Toggle Sharing Platforms (WhatsApp, Facebook, Telegram)"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{language === "hi" ? "प्लेटफॉर्म फ़िल्टर" : "Platforms"}</span>
          </button>

          {compact && (
            <button
              type="button"
              onClick={handleNativeShare}
              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-lg text-xs flex items-center gap-1 shadow-2xs cursor-pointer"
            >
              <Share2 className="w-3 h-3" />
              <span>Share</span>
            </button>
          )}
        </div>
      </div>

      {/* Platform Toggles Config Panel (when user clicks settings icon) */}
      {showConfig && (
        <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-2 animate-fadeIn">
          <p className="font-extrabold text-slate-700 dark:text-slate-200 text-[11px] uppercase tracking-wider">
            {language === "hi" ? "शेयरिंग प्लेटफॉर्म चालू / बंद करें (Sharing Platform Toggles):" : "Toggle Social Sharing Platforms:"}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            {/* WhatsApp Toggle */}
            <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={showWhatsApp}
                onChange={(e) => setShowWhatsApp(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
              />
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <MessageCircle className="w-3.5 h-3.5" />
                WhatsApp
              </span>
            </label>

            {/* Facebook Toggle */}
            <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={showFacebook}
                onChange={(e) => setShowFacebook(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 accent-blue-600 cursor-pointer"
              />
              <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                <Facebook className="w-3.5 h-3.5" />
                Facebook
              </span>
            </label>

            {/* Telegram Toggle */}
            <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={showTelegram}
                onChange={(e) => setShowTelegram(e.target.checked)}
                className="w-4 h-4 rounded text-sky-500 focus:ring-sky-500 accent-sky-500 cursor-pointer"
              />
              <span className="flex items-center gap-1 text-sky-500 dark:text-sky-400">
                <Send className="w-3.5 h-3.5" />
                Telegram
              </span>
            </label>
          </div>
        </div>
      )}

      {/* Main Buttons Tray */}
      {isOpen && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {/* Copy Link Button */}
          <button
            type="button"
            onClick={handleCopy}
            className={`flex-1 sm:flex-none px-3 py-2 border text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              copied
                ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300"
                : "bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100"
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? (language === "hi" ? "कॉपी हो गया!" : "Copied!") : (language === "hi" ? "कॉपी लिंक" : "Copy Link")}</span>
          </button>

          {/* WhatsApp Share Button */}
          {showWhatsApp && (
            <button
              type="button"
              onClick={handleWhatsAppShare}
              className="flex-1 sm:flex-none px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-current" />
              <span>WhatsApp</span>
            </button>
          )}

          {/* Facebook Share Button */}
          {showFacebook && (
            <button
              type="button"
              onClick={handleFacebookShare}
              className="flex-1 sm:flex-none px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <Facebook className="w-3.5 h-3.5 fill-current" />
              <span>Facebook</span>
            </button>
          )}

          {/* Telegram Share Button */}
          {showTelegram && (
            <button
              type="button"
              onClick={handleTelegramShare}
              className="flex-1 sm:flex-none px-3.5 py-2 bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Telegram</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
