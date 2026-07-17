import React, { useState, useRef, useEffect } from "react";
import { UserProfile, ChatMessage } from "../types";
import { paisaFetch } from "../api";
import { Sparkles, Send, Bot, User, Trash2, HelpCircle, Loader2, AlertCircle, Key, Eye, EyeOff, Save } from "lucide-react";

interface Props {
  profile: UserProfile;
}

export default function AICoach({ profile }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-msg",
      role: "assistant",
      content: `Namaste ${profile.name || "friend"}! I am your **Paisa Blueprint AI Financial Coach** 🇮🇳. 

I specialize in Indian salaried personal finance, 7th Pay scales (BPSC/KVS), direct equity index mutual fund SIP compounding, and regime tax optimization.

Here are some helpful presets you can ask me, or type your own question below:`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [chatMode, setChatMode] = useState<"gemini" | "local">("gemini");

  const [customApiKey, setCustomApiKey] = useState(() => localStorage.getItem("paisa_user_gemini_key") || "");
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [inputKey, setInputKey] = useState(customApiKey);
  const [showKeyText, setShowKeyText] = useState(false);
  
  const bottomRef = useRef<HTMLDivElement>(null);

  const [serverHasKey, setServerHasKey] = useState<boolean | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    paisaFetch("/api/chat/status")
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.hasApiKey === "boolean") {
          setServerHasKey(data.hasApiKey);
          if (!data.hasApiKey && !customApiKey) {
            setChatMode("local");
          }
        }
      })
      .catch((err) => {
        console.warn("Error checking assistant server status:", err);
      });
  }, [customApiKey]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    setErrorStatus(null);
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setLoading(true);

    try {
      const response = await paisaFetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
          userProfile: profile,
          customApiKey: customApiKey || undefined,
          forceLocal: chatMode === "local",
        }),
      });

      if (!response.ok) {
        let serverErrorMsg = "";
        try {
          const errorText = await response.text();
          if (errorText.includes("GEMINI_API_KEY") || errorText.includes("ApiKey")) {
            serverErrorMsg = "The Gemini API Key is missing or invalid on the server. Access the key icon 🔑 at the top right of this coach panel to add your own personal Gemini API key.";
          } else {
            try {
              const parsed = JSON.parse(errorText);
              serverErrorMsg = parsed.error || "Failed to parse error description.";
            } catch (jsonErr) {
              serverErrorMsg = "Failed to connect to AI server. This usually happens when the Gemini API key is not configured of the server host. Please click the key icon 🔑 at the top right to use your own personal API key.";
            }
          }
        } catch (readErr) {
          serverErrorMsg = "Failed to match AI server response. Click the key icon 🔑 at the top right of this panel to provide your own Gemini API key.";
        }
        throw new Error(serverErrorMsg);
      }

      const data = await response.json();
      const botMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content: data.content,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error(err);
      setErrorStatus(
        err.message?.includes("GEMINI_API_KEY") || err.message?.includes("key") || err.message?.includes("Key")
          ? "The Gemini API Key is missing or invalid. Please click the key icon 🔑 at the top right of this Coach panel to configure your own personal API key and try again."
          : err.message || "Something went wrong. Please check your network connection or try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: "welcome-msg",
        role: "assistant",
        content: `Chat cleared! Ask me anything regarding your customized Paisa personal finance roadmap.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setErrorStatus(null);
  };

  const quickPrompts = [
    {
      label: "SIP Plan for ₹50,000 salary",
      text: "I earn ₹50,000 monthly in Bihar. How should I distribute my safe emergency fund vs index mutual fund SIPs?",
    },
    {
      label: "BPSC Teacher tax optimization",
      text: "As a primary BPSC school teacher, how can I save maximum tax under Section 80C and the NPS scheme?",
    },
    {
      label: "Why is Term insurance preferred?",
      text: "Why do Indian finance communities advise purchasing Term Life Insurance over Endowment or ULIP cash schemes?",
    },
  ];

  return (
    <div id="ai-coach-module" className="bg-white rounded-2xl border border-slate-100 shadow-xs flex flex-col h-[650px] overflow-hidden text-sm">
      {/* Head */}
      <div className="bg-slate-950 text-white p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-bhagwa-500/20 rounded-xl border border-bhagwa-500/30">
            <Bot className="w-5 h-5 text-bhagwa-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-100 font-display text-sm leading-tight">AI Finance Specialist</h3>
              <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-mono font-bold tracking-tight">Active</span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium tracking-wide flex items-center gap-1 mt-0.5">
              Powered by Google Gemini Models • Local Rules
            </span>
          </div>
        </div>

        {/* Dynamic Model Switch - Beautiful Purple/Bhagwa selector tag mirroring user reference pic */}
        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl shrink-0 self-start md:self-center gap-1 items-center">
          <button
            type="button"
            onClick={() => setChatMode("gemini")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer select-none ${
              chatMode === "gemini" 
                ? "bg-bhagwa-600 text-white shadow-md scale-[1.02]" 
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Gemini AI
          </button>
          <button
            type="button"
            onClick={() => setChatMode("local")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer select-none ${
              chatMode === "local" 
                ? "bg-bhagwa-600 text-white shadow-md scale-[1.02]" 
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            Instant Local
          </button>
        </div>

        <div className="flex items-center gap-2 self-end md:self-center">
          <button
            onClick={() => {
              setShowKeyInput(!showKeyInput);
              setInputKey(customApiKey);
            }}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer relative ${
              customApiKey 
                ? "text-emerald-400 hover:text-emerald-300 hover:bg-slate-800" 
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
            title="Configure Custom Gemini API Key"
          >
            <Key className="w-4 h-4" />
            {customApiKey && (
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-emerald-400 rounded-full" />
            )}
          </button>
          <button
            onClick={clearChat}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Clear Conversation"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Custom Key Dropdown Panel */}
      {showKeyInput && (
        <div className="bg-slate-900 border-b border-slate-800 text-slate-100 p-4 transition-all animate-fadeIn">
          <div className="flex items-start gap-2.5 mb-2.5 text-xs text-slate-300">
            <Key className="w-4.5 h-4.5 text-bhagwa-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-100">Optional: Custom Gemini API Key</span>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                If the shared server API key is temporary, missing or invalid on this device, you can enter your personal Gemini API key. It is saved <strong>only locally</strong> in this browser memory.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type={showKeyText ? "text" : "password"}
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-3 pr-8 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-bhagwa-500"
              />
              <button
                type="button"
                onClick={() => setShowKeyText(!showKeyText)}
                className="absolute right-2 top-1.5 text-slate-500 hover:text-slate-300"
              >
                {showKeyText ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                const trimmed = inputKey.trim();
                setCustomApiKey(trimmed);
                if (trimmed) {
                  localStorage.setItem("paisa_user_gemini_key", trimmed);
                } else {
                  localStorage.removeItem("paisa_user_gemini_key");
                }
                setShowKeyInput(false);
                setErrorStatus(null);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            >
              Save
            </button>
            {customApiKey && (
              <button
                type="button"
                onClick={() => {
                  setCustomApiKey("");
                  setInputKey("");
                  localStorage.removeItem("paisa_user_gemini_key");
                  setShowKeyInput(false);
                  setErrorStatus(null);
                }}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1.5 rounded-lg text-xs font-semibold hover:text-white transition-colors cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {/* Embedded API key instructions when missing both on server and locally */}
      {chatMode === "gemini" && serverHasKey === false && !customApiKey && (
        <div className="bg-amber-50 border-b border-amber-200 p-4 text-xs text-amber-800 animate-fade-in shrink-0">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold text-amber-950 block">AI Financial Coach Offline (API Key Needed)</span>
              <p className="text-slate-600 mt-1 leading-relaxed">
                The hosting server's <code>GEMINI_API_KEY</code> environment secret is not configured yet. 
                Configure it in <strong>Settings → Secrets</strong>, or enter your personal Gemini API Key below to activate the coach immediately:
              </p>
              <div className="flex gap-2 mt-3 max-w-md">
                <input
                  type="password"
                  placeholder="Paste your API key here (AIzaSy...)"
                  className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs flex-1 focus:outline-none focus:border-bhagwa-500 font-mono text-slate-800"
                  onChange={(e) => setInputKey(e.target.value)}
                  value={inputKey}
                />
                <button
                  type="button"
                  onClick={() => {
                    const trimmed = inputKey.trim();
                    if (trimmed) {
                      setCustomApiKey(trimmed);
                      localStorage.setItem("paisa_user_gemini_key", trimmed);
                      setErrorStatus(null);
                    }
                  }}
                  className="bg-bhagwa-600 hover:bg-bhagwa-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0"
                >
                  Save Key
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instant Local Mode Indicator Banner */}
      {chatMode === "local" && (
        <div className="bg-emerald-50 border-b border-emerald-100 p-3 text-xs text-emerald-800 animate-fade-in shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-emerald-100 rounded-lg text-emerald-600 shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-emerald-950 block">⚡ Instant Local Advisor Active</span>
              <p className="text-slate-600 mt-0.5 leading-relaxed">
                Running in safe visitor-friendly offline mode. No API key or cloud connection required. Enjoy continuous personal financial coaching!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/40">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : ""}`}
          >
            <div
              className={`p-2.5 rounded-xl shrink-0 h-9 w-9 flex items-center justify-center border ${
                msg.role === "user" 
                  ? "bg-bhagwa-50 border-bhagwa-100 text-bhagwa-600" 
                  : "bg-white border-slate-100 text-slate-600"
              }`}
            >
              {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div className="space-y-1">
              <div
                className={`p-4 rounded-2xl leading-relaxed text-xs break-words ${
                  msg.role === "user"
                    ? "bg-bhagwa-600 text-white rounded-tr-none"
                    : "bg-white border border-slate-100 text-slate-800 rounded-tl-none"
                }`}
              >
                {/* Parse basic bold markdown spacing */}
                {msg.content.split("\n").map((line, lIdx) => {
                  // Basic formatting for lines with bold **
                  let displayLine: React.ReactNode = line;
                  if (line.includes("**")) {
                    const parts = line.split("**");
                    displayLine = parts.map((part, pIdx) => {
                      if (pIdx % 2 === 1) {
                        const isPaisa = part.toLowerCase().includes("paisa blueprint");
                        return (
                          <strong key={pIdx} className={msg.role === "user" ? "text-white underline" : `${isPaisa ? "text-purple-600 dark:text-purple-400 font-extrabold" : "text-bhagwa-950"} font-bold`}>
                            {part}
                          </strong>
                        );
                      }
                      return part;
                    });
                  }
                  return (
                    <span key={lIdx} className="block mt-1">
                      {displayLine}
                    </span>
                  );
                })}
              </div>
              <span className={`text-[9px] text-slate-400 block ${msg.role === "user" ? "text-right" : ""}`}>
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

        {/* Floating Quick Action presets when chat is at standard start */}
        {messages.length === 1 && (
          <div className="grid grid-cols-1 gap-2.5 max-w-sm pl-12 pt-1">
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(qp.text)}
                className="text-left bg-white border border-slate-100 hover:border-bhagwa-100 hover:bg-slate-50 p-3 rounded-xl text-xs text-bhagwa-950 font-semibold shadow-2xs transition-all cursor-pointer"
              >
                {qp.label} →
              </button>
            ))}
          </div>
        )}

        {loading && (
          <div className="flex gap-3 max-w-[80%]">
            <div className="p-2.5 rounded-xl shrink-0 h-9 w-9 flex items-center justify-center border bg-white border-slate-100 text-slate-400">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-none flex items-center gap-2 text-xs text-slate-500">
              <span>Paisa Coach is thinking...</span>
            </div>
          </div>
        )}

        {/* Error notice */}
        {errorStatus && (
          <div className="p-4 bg-rose-50 border border-rose-100 text-rose-800 text-xs rounded-xl flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Execution Hold-up</p>
              <p className="mt-0.5 leading-relaxed">{errorStatus}</p>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Foot Input form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(inputValue);
        }}
        className="p-4 bg-white border-t border-slate-100 flex gap-2.5"
      >
        <input
          type="text"
          value={inputValue}
          disabled={loading}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={`Ask about taxes, SIP calculators, NPS vs EPF...`}
          className="flex-1 bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-slate-800 text-xs focus:outline-none focus:border-bhagwa-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || loading}
          className="bg-bhagwa-600 hover:bg-bhagwa-700 text-white p-2.5 rounded-xl flex items-center justify-center transition-all disabled:opacity-50 disabled:bg-slate-300 cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
