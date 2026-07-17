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
            className="fixed inset-0 z-[100000] bg-slate-900 flex flex-col items-center justify-between p-8 text-center select-none pointer-events-auto"
          >
            {/* Ambient Lighting */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

            <div /> {/* Spacer */}

            {/* Core Logo & Branding */}
            <div className="flex flex-col items-center space-y-6 relative z-10">
              <div className="relative">
                <div className="absolute inset-0 bg-purple-500/20 rounded-3xl blur-lg animate-pulse" />
                <div className="relative h-24 w-24 rounded-3xl bg-slate-950 flex items-center justify-center border border-purple-500/35 shadow-2xl">
                  <img 
                    src={paisaLogo} 
                    alt="Paisa Blueprint" 
                    className="w-16 h-16 object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <h1 className="text-3xl font-black text-white tracking-tight uppercase font-display">
                  Paisa Blueprint
                </h1>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-[10px] font-black uppercase bg-purple-600 text-white px-2.5 py-0.5 rounded-full tracking-wider border border-purple-500/30">
                    Salaried 🇮🇳
                  </span>
                  <span className="text-xs font-bold text-slate-350 tracking-wide">
                    {language === "hi" ? "विवेकपूर्ण भारतीय वित्तीय नियम" : "The Salaried Financial Blueprint"}
                  </span>
                </div>
              </div>
            </div>

            {/* Loading progress bar indicator */}
            <div className="w-full max-w-xs space-y-3 relative z-10 mb-8">
              <div className="w-full h-1 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80 shadow-inner">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.8, ease: "easeInOut" }}
                  className="h-full bg-gradient-to-r from-purple-600 via-bhagwa-500 to-emerald-500"
                />
              </div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                {language === "hi" ? "इंजन सक्रिय हो रहा है..." : "Synchronizing Secure Ledger..."}
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
