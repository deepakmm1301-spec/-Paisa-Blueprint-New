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
            className="fixed inset-0 z-[100000] bg-[#0b021d] flex flex-col items-center justify-between py-12 px-6 text-center select-none pointer-events-auto overflow-hidden"
          >
            {/* Ambient Lighting / Halos */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[450px] h-[450px] bg-purple-600/15 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-indigo-900/10 rounded-full blur-[80px] pointer-events-none" />

            {/* Sparkles / Stars */}
            <div className="absolute top-[15%] left-[20%] text-[10px] text-purple-400/40 animate-pulse pointer-events-none">✦</div>
            <div className="absolute top-[25%] right-[15%] text-xs text-purple-300/30 animate-pulse pointer-events-none" style={{ animationDelay: "0.5s" }}>✦</div>
            <div className="absolute top-[45%] left-[10%] text-sm text-purple-400/25 animate-pulse pointer-events-none" style={{ animationDelay: "1.2s" }}>✦</div>
            <div className="absolute top-[65%] right-[25%] text-[11px] text-purple-500/30 animate-pulse pointer-events-none" style={{ animationDelay: "0.8s" }}>✦</div>
            <div className="absolute bottom-[20%] left-[25%] text-xs text-purple-400/40 animate-pulse pointer-events-none" style={{ animationDelay: "1.5s" }}>✦</div>

            {/* Top Language Badge */}
            <div className="relative z-10 pt-4">
              <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-purple-500/20 bg-purple-950/20 backdrop-blur-md text-purple-200/90 text-[10px] font-bold tracking-[0.25em] font-mono shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                <span className="text-purple-400/80">✦</span>
                <span>{language === "hi" ? "हिंदी" : "ENGLISH"}</span>
                <span className="text-purple-400/80">✦</span>
              </div>
            </div>

            {/* Center Content Group */}
            <div className="flex flex-col items-center relative z-10 my-auto">
              {/* Logo with Outer Ring Halo */}
              <div className="relative mb-6">
                <div className="absolute -inset-4 bg-purple-500/25 rounded-full blur-2xl animate-pulse" />
                <div className="relative w-32 h-32 md:w-36 md:h-36 rounded-[2.2rem] bg-gradient-to-b from-[#150a2e] to-[#0a0015] border-2 border-purple-500/60 flex items-center justify-center shadow-[0_0_35px_rgba(168,85,247,0.4)] overflow-hidden">
                  <div className="absolute inset-0 bg-radial-gradient from-purple-500/20 to-transparent opacity-60" />
                  <img 
                    src={paisaLogo} 
                    alt="Paisa Blueprint" 
                    className="w-22 h-22 md:w-26 md:h-26 object-contain relative z-10"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>

              {/* Heavy Stylish Typography Title */}
              <div className="mb-4">
                {language === "hi" ? (
                  <div className="space-y-1">
                    <h2 className="text-3.5xl md:text-4.5xl font-black text-white tracking-wider leading-none">पैसा</h2>
                    <h2 className="text-3.5xl md:text-4.5xl font-black text-purple-400 tracking-wider leading-none mt-1">ब्लूप्रिंट</h2>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-[0.15em] font-sans leading-none uppercase">PAISA</h2>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-purple-400 tracking-[0.15em] font-sans leading-none uppercase mt-1">BLUEPRINT</h2>
                  </div>
                )}
              </div>

              {/* Elegant central lotus divider */}
              <div className="flex items-center justify-center w-40 my-3.5">
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-purple-500/30" />
                <LotusSVG className="w-5 h-5 mx-3 text-purple-400/50" />
                <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-purple-500/30" />
              </div>

              {/* Pill Badge for Salaried */}
              <div className="mb-5 relative inline-flex items-center gap-1.5 px-6 py-1 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 shadow-[0_0_20px_rgba(124,58,237,0.35)] text-[10px] font-black uppercase tracking-widest text-white border border-purple-400/20">
                <span>SALARIED</span>
                <span className="text-[11px]">💳</span>
              </div>

              {/* Bilingual Subtitle */}
              <div className="flex items-center justify-center gap-3 px-4 max-w-sm">
                <span className="text-purple-500/50 text-xs animate-pulse">✦</span>
                <p className="text-[11px] md:text-xs font-semibold text-purple-200/85 tracking-wide leading-relaxed font-sans">
                  {language === "hi" 
                    ? "स्मार्ट प्लानिंग आज, आर्थिक स्वतंत्रता कल." 
                    : "Smart Planning Today, Financial Freedom Tomorrow."}
                </p>
                <span className="text-purple-500/50 text-xs animate-pulse">✦</span>
              </div>
            </div>

            {/* Giant Bottom Lotus Vector Background */}
            <div className="absolute bottom-[4%] left-1/2 -translate-x-1/2 w-full max-w-[280px] md:max-w-[340px] opacity-20 pointer-events-none z-0 text-purple-500">
              <LotusSVG className="w-full h-auto" />
            </div>

            {/* Bottom Section - Progress Bar */}
            <div className="w-full max-w-[240px] md:max-w-[280px] space-y-3.5 relative z-10 mb-6">
              {/* Progress track */}
              <div className="w-full h-[3px] bg-purple-950/50 rounded-full overflow-hidden border border-purple-500/10 shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)]">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.9, ease: "easeInOut" }}
                  className="h-full bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500 shadow-[0_0_10px_#d946ef]"
                />
              </div>
              {/* Loading status text */}
              <p className="text-[9px] font-bold text-purple-300/70 uppercase tracking-[0.3em] font-mono animate-pulse flex items-center justify-center gap-1">
                <span className="text-[8px] opacity-60">✦</span>
                <span>{language === "hi" ? "लोड हो रहा है . . ." : "L o a d i n g . . ."}</span>
                <span className="text-[8px] opacity-60">✦</span>
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
