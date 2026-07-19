import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Capacitor } from "@capacitor/core";
import { SplashScreen } from "@capacitor/splash-screen";
import { Network } from "@capacitor/network";
import { Share } from "@capacitor/share";
import { App as CapApp } from "@capacitor/app";
import { 
  WifiOff, 
  RotateCw, 
  Share2, 
  AlertCircle, 
  ArrowLeft,
  Loader2
} from "lucide-react";

// @ts-ignore
import paisaLogo from "../assets/images/deep_paisa_logo_1780484307855.png";

const LotusSVG = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Central petal */}
    <path
      d="M100,10 C110,40 110,80 100,110 C90,80 90,40 100,10 Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Inner left petal */}
    <path
      d="M100,30 C80,45 70,75 85,105 C95,90 98,70 100,30 Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Inner right petal */}
    <path
      d="M100,30 C120,45 130,75 115,105 C105,90 102,70 100,30 Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Middle left petal */}
    <path
      d="M100,50 C65,60 50,90 70,110 C85,95 90,80 100,50 Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Middle right petal */}
    <path
      d="M100,50 C135,60 150,90 130,110 C115,95 110,80 100,50 Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Outer left petal */}
    <path
      d="M100,70 C50,75 30,100 55,115 C75,105 85,95 100,70 Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Outer right petal */}
    <path
      d="M100,70 C150,75 170,100 145,115 C125,105 115,95 100,70 Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Bottom support line */}
    <path
      d="M40,112 C70,118 130,118 160,112"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

interface AndroidNativeWrapperProps {
  children: React.ReactNode;
  activeWidget: string;
  setActiveWidget: (widget: any) => void;
  language: "en" | "hi";
}

export default function AndroidNativeWrapper({
  children,
  activeWidget,
  setActiveWidget,
  language
}: AndroidNativeWrapperProps) {
  const isAndroid = Capacitor.getPlatform() === "android" || Capacitor.isNativePlatform();

  // 1. Splash Screen State
  const [showSplash, setShowSplash] = useState(true);

  // 2. Offline Experience States
  const [isOffline, setIsOffline] = useState(false);
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);

  // 3. Pull-To-Refresh States
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStartRef = useRef<number | null>(null);
  const isPullingRef = useRef<boolean>(false);
  const pullThreshold = 85; // px to trigger refresh
  const maxPullDistance = 140; // px cap

  // 4. Route Loading Indicator State
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showLoadingBar, setShowLoadingBar] = useState(false);
  const prevWidgetRef = useRef<string>(activeWidget);

  // --- Splash Screen Auto-Hide & Back Button Handling ---
  useEffect(() => {
    // Hide Native Splash Screen immediately so our React animation takes over
    if (isAndroid) {
      SplashScreen.hide().catch(err => console.log("Splash hide err:", err));
    }

    // Trigger local splash timeout of 2.2 seconds for beautiful transition
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 2200);

    // Hardware back button navigation for Android
    let backListener: any = null;
    if (isAndroid) {
      CapApp.addListener("backButton", (data) => {
        if (activeWidget !== "bpsc_salary" && activeWidget !== "dashboard") {
          // Navigate back to home/dashboard if in another widget
          setActiveWidget("bpsc_salary");
        } else {
          // If on home/dashboard, exit app
          CapApp.exitApp();
        }
      }).then(listener => {
        backListener = listener;
      });
    }

    return () => {
      clearTimeout(splashTimer);
      if (backListener) {
        backListener.remove();
      }
    };
  }, [isAndroid, activeWidget, setActiveWidget]);

  // --- Network Connection Detection ---
  useEffect(() => {
    const checkNetwork = async () => {
      try {
        const status = await Network.getStatus();
        setIsOffline(!status.connected);
      } catch (e) {
        setIsOffline(!navigator.onLine);
      }
    };

    checkNetwork();

    const listener = Network.addListener("networkStatusChange", (status) => {
      setIsOffline(!status.connected);
    });

    return () => {
      listener.then(l => l.remove());
    };
  }, []);

  const handleManualConnectionCheck = async () => {
    setIsCheckingConnection(true);
    // Simulate active scanning
    await new Promise((resolve) => setTimeout(resolve, 1000));
    try {
      const status = await Network.getStatus();
      setIsOffline(!status.connected);
    } catch (e) {
      setIsOffline(!navigator.onLine);
    }
    setIsCheckingConnection(false);
  };

  // --- External Links Interception ---
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");

      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // Check if it's external, native-protocol, or PDF
      const isPdf = href.toLowerCase().endsWith(".pdf") || href.toLowerCase().includes(".pdf?");
      const isWhatsApp = href.includes("wa.me") || href.includes("api.whatsapp.com") || href.includes("whatsapp://");
      const isYouTube = href.includes("youtube.com") || href.includes("youtu.be");
      const isMaps = href.includes("maps.google.com") || href.includes("geo:");
      const isMailto = href.startsWith("mailto:");
      const isTel = href.startsWith("tel:");
      
      const isExternal = href.startsWith("http") && !href.includes("paisablueprint.in") && !href.startsWith("/");

      if (isPdf || isWhatsApp || isYouTube || isMaps || isMailto || isTel || isExternal) {
        // Prevent default in-app router/browser load
        e.preventDefault();
        
        // Open inside standard native system browser or handler
        if (isAndroid) {
          window.open(href, "_system");
        } else {
          window.open(href, "_blank");
        }
      }
    };

    document.addEventListener("click", handleDocumentClick);
    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, [isAndroid]);

  // --- Pull-To-Refresh Handling ---
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY > 5 || isRefreshing || showSplash || isOffline) return;
      
      touchStartRef.current = e.touches[0].clientY;
      isPullingRef.current = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPullingRef.current || touchStartRef.current === null || isRefreshing) return;

      const currentY = e.touches[0].clientY;
      const diffY = currentY - touchStartRef.current;

      if (diffY > 0) {
        // Apply resistance curve (damping)
        const dampingFactor = 0.45;
        const pulled = Math.min(maxPullDistance, diffY * dampingFactor);
        
        // Prevent default scrolling only when pulling down from top
        if (window.scrollY === 0) {
          if (e.cancelable) e.preventDefault();
          setPullDistance(pulled);
        }
      } else {
        isPullingRef.current = false;
        setPullDistance(0);
      }
    };

    const handleTouchEnd = () => {
      if (!isPullingRef.current || isRefreshing) return;
      isPullingRef.current = false;

      if (pullDistance >= pullThreshold) {
        triggerRefresh();
      } else {
        // Spring back
        setPullDistance(0);
      }
      touchStartRef.current = null;
    };

    const triggerRefresh = () => {
      setIsRefreshing(true);
      setPullDistance(pullThreshold);

      // Perform system refresh
      setTimeout(() => {
        window.location.reload();
      }, 700);
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: false });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);
    window.addEventListener("touchcancel", handleTouchEnd);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [pullDistance, isRefreshing, showSplash, isOffline]);

  // --- Page Route Transition Loading Indicator ---
  useEffect(() => {
    if (prevWidgetRef.current !== activeWidget) {
      prevWidgetRef.current = activeWidget;
      
      // Page has changed! Show native loading progress bar
      setShowLoadingBar(true);
      setLoadingProgress(10);

      // Step 1: Smoothly increment to 40%
      const t1 = setTimeout(() => setLoadingProgress(45), 150);
      // Step 2: Increment to 85%
      const t2 = setTimeout(() => setLoadingProgress(85), 450);
      // Step 3: Complete and fade out after 1000ms
      const t3 = setTimeout(() => {
        setLoadingProgress(100);
        setTimeout(() => {
          setShowLoadingBar(false);
          setLoadingProgress(0);
        }, 200);
      }, 1000);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [activeWidget]);

  // Expose global native sharing support for calculators, petitions, or hub pages
  useEffect(() => {
    // Overwrite standard share if called
    (window as any).triggerNativeShare = async (title: string, text: string, url: string) => {
      if (isAndroid) {
        try {
          await Share.share({
            title: title,
            text: text,
            url: url,
            dialogTitle: language === "hi" ? "साझा करें" : "Share via"
          });
          return true;
        } catch (e) {
          console.error("Native share failed, fallback:", e);
        }
      }
      return false;
    };
  }, [isAndroid, language]);

  return (
    <div className="relative min-h-screen w-full select-none overflow-x-hidden">
      
      {/* 1. Page Route Top Loading Bar */}
      {showLoadingBar && (
        <div className="fixed top-0 left-0 right-0 h-1 z-[99999] bg-slate-100 pointer-events-none">
          <motion.div 
            className="h-full bg-gradient-to-r from-purple-600 via-bhagwa-500 to-emerald-500"
            initial={{ width: "0%" }}
            animate={{ width: `${loadingProgress}%` }}
            transition={{ ease: "easeInOut", duration: 0.2 }}
          />
        </div>
      )}

      {/* 2. Pull-To-Refresh Indicator Badge Overlay */}
      {pullDistance > 0 && (
        <div 
          className="fixed top-4 left-0 right-0 flex justify-center z-[80] pointer-events-none"
          style={{ transform: `translateY(${Math.min(60, pullDistance - 20)}px)` }}
        >
          <div className="bg-white border border-slate-100/90 dark:bg-slate-900 dark:border-slate-800 p-2.5 rounded-full shadow-lg flex items-center justify-center pointer-events-auto transition-transform">
            <RotateCw 
              className={`w-5 h-5 text-purple-600 dark:text-purple-400 ${isRefreshing ? "animate-spin" : ""}`}
              style={{ transform: `rotate(${pullDistance * 3}deg)` }}
            />
          </div>
        </div>
      )}

      {/* 3. Render Offline Fullscreen Blocking Canvas */}
      <AnimatePresence>
        {isOffline && (
          <motion.div 
            id="offline-blocking-screen"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="fixed inset-0 z-[9999] bg-slate-900 flex flex-col items-center justify-center p-6 text-center select-none"
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative flex flex-col items-center max-w-sm w-full space-y-7">
              {/* Logo Halo */}
              <div className="relative">
                <div className="absolute inset-0 bg-red-500/15 rounded-3xl blur-md" />
                <div className="relative h-20 w-20 rounded-3xl bg-slate-950 flex items-center justify-center border border-slate-800 shadow-xl">
                  <img 
                    src={paisaLogo} 
                    alt="Paisa Blueprint" 
                    className="w-14 h-14 object-cover shrink-0 grayscale"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-red-500 text-white p-1 rounded-full border border-slate-900 shadow-md">
                    <WifiOff className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              {/* Offline Typography */}
              <div className="space-y-3">
                <h2 className="text-2xl font-black text-white tracking-tight uppercase font-display">
                  {language === "hi" ? "कोई इंटरनेट कनेक्शन नहीं" : "No Internet Connection"}
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed px-2">
                  {language === "hi" 
                    ? "डैशबोर्ड और गणनाओं को पुनः लोड करने के लिए अपना इंटरनेट कनेक्शन सक्रिय करें और पुनः प्रयास करें।"
                    : "Paisa Blueprint requires an active internet connection to download secure modules and real-time updates."
                  }
                </p>
              </div>

              {/* Action Retry button */}
              <button
                type="button"
                onClick={handleManualConnectionCheck}
                disabled={isCheckingConnection}
                className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 active:scale-[0.98] disabled:opacity-50 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-lg hover:shadow-purple-600/20 cursor-pointer flex items-center justify-center gap-2 border-0"
              >
                {isCheckingConnection ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>{language === "hi" ? "स्कैनिंग हो रही है..." : "Checking Link..."}</span>
                  </>
                ) : (
                  <>
                    <RotateCw className="w-4 h-4 text-purple-100" />
                    <span>{language === "hi" ? "पुनः प्रयास करें" : "Retry Connection"}</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Render Launch Splash Screen with Elegant Brand Aesthetics */}
      <AnimatePresence>
        {showSplash && (
          <motion.div 
            id="launch-splash-overlay"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="fixed inset-0 z-[100000] bg-gradient-to-b from-[#140028] via-[#1c0038] to-[#25004a] flex flex-col items-center justify-between py-12 px-6 text-center select-none pointer-events-auto overflow-hidden"
          >
            {/* Lighter, brighter purple radial spotlights behind the logo & title for ultra-high contrast and readability */}
            <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-500/35 rounded-full blur-[130px] pointer-events-none z-0 animate-pulse" />
            <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-500/25 rounded-full blur-[110px] pointer-events-none z-0" />
            <div className="absolute top-[35%] left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-[#B84DFF]/25 rounded-full blur-[90px] pointer-events-none z-0" />

            {/* Sparkles / Stars */}
            <div className="absolute top-[12%] left-[18%] text-sm text-purple-300/60 animate-pulse pointer-events-none">✦</div>
            <div className="absolute top-[22%] right-[12%] text-base text-purple-300/50 animate-pulse pointer-events-none" style={{ animationDelay: "0.5s" }}>✦</div>
            <div className="absolute top-[48%] left-[8%] text-lg text-purple-300/40 animate-pulse pointer-events-none" style={{ animationDelay: "1.2s" }}>✦</div>
            <div className="absolute top-[62%] right-[22%] text-sm text-purple-400/50 animate-pulse pointer-events-none" style={{ animationDelay: "0.8s" }}>✦</div>
            <div className="absolute bottom-[22%] left-[22%] text-base text-purple-300/60 animate-pulse pointer-events-none" style={{ animationDelay: "1.5s" }}>✦</div>

            {/* Top Language Badge */}
            <div className="relative z-10 pt-6">
              <div className="inline-flex items-center gap-3 px-6 py-1.5 rounded-full border border-purple-400/30 bg-purple-950/40 backdrop-blur-md text-purple-50 text-xs md:text-sm font-bold tracking-[0.3em] font-mono shadow-[0_0_20px_rgba(168,85,247,0.25)]">
                <span className="text-purple-300 text-xs animate-pulse">✦</span>
                <span>{language === "hi" ? "हिंदी" : "ENGLISH"}</span>
                <span className="text-purple-300 text-xs animate-pulse">✦</span>
              </div>
            </div>

            {/* Center Content Group */}
            <div className="flex flex-col items-center relative z-10 my-auto">
              {/* Logo with Outer Ring Halo & Vibrant Glow */}
              <div className="relative mb-8 flex items-center justify-center">
                {/* Vibrant background glow spotlight behind the logo block */}
                <div className="absolute w-52 h-52 md:w-60 md:h-60 rounded-full bg-[#B84DFF]/50 blur-3xl animate-pulse pointer-events-none" />
                
                {/* Concentric bright purple glowing rings matching the mockup */}
                <div className="absolute -inset-4 rounded-full border-2 border-[#B84DFF]/50 shadow-[0_0_35px_rgba(184,77,255,0.6)] pointer-events-none scale-105" />
                <div className="absolute -inset-8 rounded-full border border-[#7B2EFF]/30 pointer-events-none scale-110" />
                
                <div className="absolute w-52 h-52 md:w-60 md:h-60 rounded-full border-2 border-purple-400/40 shadow-[0_0_25px_rgba(168,85,247,0.3)] flex items-center justify-center pointer-events-none animate-pulse">
                  <div className="w-48 h-48 md:w-56 md:h-56 rounded-full border border-dashed border-purple-500/35" />
                </div>

                {/* Main rounded square logo block matching premium fintech look */}
                <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-3xl bg-gradient-to-b from-[#24124e] to-[#0a011a] border-2 border-[#B84DFF] flex items-center justify-center shadow-[0_0_50px_rgba(184,77,255,0.85)] overflow-hidden z-10">
                  <div className="absolute inset-0 bg-radial-gradient from-purple-500/40 to-transparent opacity-95" />
                  <img 
                    src={paisaLogo} 
                    alt="Paisa Blueprint" 
                    className="w-18 h-18 md:w-22 md:h-22 object-contain relative z-10 filter drop-shadow-[0_0_12px_rgba(245,179,53,0.5)]"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>

              {/* Heavy Stylish Typography Title - Slight big size for maximum legibility */}
              <div className="mb-6">
                {language === "hi" ? (
                  <div className="space-y-1">
                    <h2 className="text-[44px] md:text-[56px] font-black text-white tracking-wider leading-none drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)]">पैसा</h2>
                    <h2 className="text-[44px] md:text-[56px] font-black bg-gradient-to-r from-[#FFFFFF] to-[#B84DFF] bg-clip-text text-transparent tracking-wider leading-none mt-2 drop-shadow-[0_2px_15px_rgba(168,85,247,0.7)]">ब्लूप्रिंट</h2>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <h2 className="text-[42px] md:text-[52px] font-extrabold text-white tracking-[0.15em] font-sans leading-none uppercase drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)]">PAISA</h2>
                    <h2 className="text-[42px] md:text-[52px] font-extrabold bg-gradient-to-r from-[#FFFFFF] to-[#B84DFF] bg-clip-text text-transparent tracking-[0.15em] font-sans leading-none uppercase mt-2 drop-shadow-[0_2px_15px_rgba(168,85,247,0.7)]">BLUEPRINT</h2>
                  </div>
                )}
              </div>

              {/* Elegant central lotus divider */}
              <div className="flex items-center justify-center w-52 my-5">
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-purple-400/50" />
                <LotusSVG className="w-6 h-6 mx-4 text-purple-300/80" />
                <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-purple-400/50" />
              </div>

              {/* Pill Badge for Salaried with exact requested gradient (#8A2BE2 → #C84DFF) */}
              <div className="mb-6 relative inline-flex items-center gap-2.5 px-8 py-2 rounded-full bg-gradient-to-r from-[#8A2BE2] to-[#C84DFF] shadow-[0_0_25px_rgba(200,77,255,0.6)] text-xs md:text-sm font-black uppercase tracking-[0.25em] text-white border border-white/20">
                <span>SALARIED</span>
                <span>🇮🇳</span>
              </div>

              {/* Bilingual Subtitle - Slight big font and clearly visible */}
              <div className="flex flex-col items-center justify-center gap-2 px-6 max-w-lg">
                <p className="text-[16px] md:text-[19px] font-bold text-white tracking-wide leading-relaxed font-sans drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)]">
                  {language === "hi" 
                    ? "स्मार्ट योजना आज," 
                    : "Smart Planning Today."}
                </p>
                <p className="text-[16px] md:text-[19px] font-bold text-white tracking-wide leading-relaxed font-sans drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)]">
                  {language === "hi" 
                    ? "आर्थिक स्वतंत्रता कल।" 
                    : "Financial Freedom Tomorrow."}
                </p>
              </div>
            </div>

            {/* Giant Bottom Lotus Vector Background - strictly 10% opacity as requested */}
            <div className="absolute bottom-[4%] left-1/2 -translate-x-1/2 w-full max-w-[320px] md:max-w-[400px] opacity-[0.10] pointer-events-none z-0 text-purple-400">
              <LotusSVG className="w-full h-auto" />
            </div>

            {/* Bottom Section - Progress Bar & Wording */}
            <div className="w-full max-w-[280px] md:max-w-[340px] space-y-4 relative z-10 mb-8">
              {/* Progress track with glowing loading line */}
              <div className="w-full h-[4px] bg-purple-950/60 rounded-full overflow-hidden border border-purple-500/20 shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)]">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.9, ease: "easeInOut" }}
                  className="h-full bg-gradient-to-r from-[#7B2EFF] to-[#B84DFF] shadow-[0_0_18px_#B84DFF,0_0_8px_#7B2EFF]"
                />
              </div>
              {/* Loading status text with exact requested wording & big visible font size */}
              <p className="text-[13px] md:text-[15px] font-extrabold text-purple-200 uppercase tracking-[0.25em] font-sans animate-pulse flex items-center justify-center gap-2 drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">
                <span className="text-purple-400 text-xs">✦</span>
                <span>
                  {language === "hi" 
                    ? "आपकी वित्तीय यात्रा शुरू हो रही है..." 
                    : "Loading your financial journey..."}
                </span>
                <span className="text-purple-400 text-xs">✦</span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main website view context */}
      <div className={showSplash ? "hidden" : "block"}>
        {children}
      </div>
    </div>
  );
}
