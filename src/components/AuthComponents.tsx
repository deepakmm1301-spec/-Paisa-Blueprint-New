import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShieldCheck, Lock, Mail, User, Phone, Check, AlertCircle, 
  ArrowLeft, Key, KeyRound, Sparkles, RefreshCw, Eye, EyeOff, Loader2, ArrowRight
} from "lucide-react";
import { paisaFetch } from "../api";
import { supabase } from "../utils/supabaseClient";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName?: string;
  onSuccess?: (user: any) => void;
  language: "en" | "hi";
  onLogin?: () => void;
  onSignUp?: () => void;
  onGuestContinue?: () => void;
}

export function AuthModal({ 
  isOpen, 
  onClose, 
  featureName, 
  onSuccess = () => {}, 
  language,
  onLogin,
  onSignUp,
  onGuestContinue
}: AuthModalProps) {
  const [view, setView] = useState<"options" | "login" | "signup" | "forgot">("options");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (isOpen) {
      setView("options");
      setError("");
      setSuccess("");
      setPassword("");
    }
  }, [isOpen]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError(language === "hi" ? "कृपया ईमेल और पासवर्ड भरें।" : "Please fill in email and password.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await paisaFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), password })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setSuccess(language === "hi" ? "सफलतापूर्वक लॉगिन किया गया!" : "Successfully logged in!");
        setTimeout(() => {
          onSuccess(data.user);
          onClose();
        }, 1200);
      } else {
        setError(data.message || (language === "hi" ? "लॉगिन विफल। कृपया क्रेडेंशियल्स जांचें।" : "Login failed. Please check your credentials."));
      }
    } catch (err) {
      setError(language === "hi" ? "कनेक्शन त्रुटि। कृपया पुनः प्रयास करें।" : "Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) {
      setError(language === "hi" ? "कृपया सभी फ़ील्ड भरें।" : "Please fill in all fields.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await paisaFetch("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setSuccess(language === "hi" ? "पंजीकरण सफल! लॉगिन किया जा रहा है..." : "Registration successful! Logging in...");
        setTimeout(() => {
          onSuccess(data.user);
          onClose();
        }, 1200);
      } else {
        setError(data.message || (language === "hi" ? "पंजीकरण विफल। कृपया दूसरा ईमेल आज़माएं।" : "Registration failed. Please try a different email."));
      }
    } catch (err) {
      setError(language === "hi" ? "कनेक्शन त्रुटि। कृपया पुनः प्रयास करें।" : "Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError(language === "hi" ? "कृपया अपना ईमेल दर्ज करें।" : "Please enter your email.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await paisaFetch("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: email.trim() })
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess(data.message || (language === "hi" ? "पासवर्ड रीसेट लिंक भेज दिया गया है।" : "Password reset link sent successfully."));
      } else {
        setError(data.message || (language === "hi" ? "अनुरोध विफल।" : "Request failed."));
      }
    } catch (err) {
      setError(language === "hi" ? "कनेक्शन त्रुटि।" : "Connection error.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900"
        />

        {/* Modal Sheet */}
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          className="relative bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden p-6 sm:p-8 z-10 space-y-6"
        >
          {/* Header & Feature Notification */}
          <div className="text-center space-y-2">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100 shadow-3xs">
              <Lock className="w-5 h-5" />
            </div>
            
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              {language === "hi" ? "🔐 प्रमाणीकरण की आवश्यकता है" : "🔐 Authentication Required"}
            </h3>
            
            {featureName && (
              <div className="bg-purple-50 border border-purple-100 text-purple-800 text-xs font-bold px-3 py-1.5 rounded-xl inline-block">
                {language === "hi" ? `विशेषता: ${featureName}` : `Feature: ${featureName}`}
              </div>
            )}
            
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed max-w-xs mx-auto">
              {language === "hi" 
                ? "यह एक व्यक्तिगत और सुरक्षित विशेषता है। कृपया अपनी डिजिटल तिजोरी और प्राथमिकताओं को सहेजने के लिए लॉगिन करें।" 
                : "This is a personalized and secure feature. Please log in to manage your digital vault and custom records."}
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-800 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* VIEW: Options */}
          {view === "options" && (
            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={onLogin || (() => setView("login"))}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-xl text-xs sm:text-sm cursor-pointer border-0 shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                <span>{language === "hi" ? "लॉग इन करें" : "🔑 Login Now"}</span>
              </button>
              
              <button
                onClick={onSignUp || (() => setView("signup"))}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl text-xs sm:text-sm cursor-pointer border-0 shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                <span>{language === "hi" ? "नया खाता बनाएं" : "🆕 Sign Up Free"}</span>
              </button>

              <button
                onClick={onGuestContinue || onClose}
                className="w-full py-3 bg-slate-100 hover:bg-slate-150 text-slate-700 font-bold rounded-xl text-xs sm:text-sm cursor-pointer border-0 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <span>{language === "hi" ? "अतिथि के रूप में जारी रखें" : "👤 Continue as Guest"}</span>
              </button>
            </div>
          )}

          {/* VIEW: Login Form */}
          {view === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-600 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 font-semibold"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-black text-slate-600 uppercase tracking-wider">Password</label>
                  <button 
                    type="button" 
                    onClick={() => setView("forgot")}
                    className="text-xs font-bold text-purple-600 hover:underline cursor-pointer border-0 bg-transparent"
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 font-semibold"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer border-0 bg-transparent"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-black rounded-xl text-xs sm:text-sm cursor-pointer border-0 shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Sign In</span>}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setView("options")}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center justify-center gap-1 mx-auto border-0 bg-transparent cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Go Back</span>
                </button>
              </div>
            </form>
          )}

          {/* VIEW: Signup Form */}
          {view === "signup" && (
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-600 uppercase tracking-wider">Your Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 font-semibold"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-600 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 font-semibold"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-600 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 font-semibold"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer border-0 bg-transparent"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-black rounded-xl text-xs sm:text-sm cursor-pointer border-0 shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Create Account</span>}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setView("options")}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center justify-center gap-1 mx-auto border-0 bg-transparent cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Go Back</span>
                </button>
              </div>
            </form>
          )}

          {/* VIEW: Forgot Password Form */}
          {view === "forgot" && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-600 uppercase tracking-wider">Your Registered Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 font-semibold"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-black rounded-xl text-xs sm:text-sm cursor-pointer border-0 shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Send Reset Link</span>}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setView("login")}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center justify-center gap-1 mx-auto border-0 bg-transparent cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Login</span>
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

interface CommonPageProps {
  onSuccess: (user: any) => void;
  language: "en" | "hi";
  onNavigateToWidget: (widget: string) => void;
}

export function LoginPage({ onSuccess, language, onNavigateToWidget }: CommonPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const response = await paisaFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), password })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setSuccess(language === "hi" ? "लॉगिन सफल! पुनर्निर्देशित किया जा रहा है..." : "Login successful! Redirecting...");
        setTimeout(() => {
          onSuccess(data.user);
        }, 1200);
      } else {
        setError(data.message || (language === "hi" ? "लॉगिन विफल।" : "Invalid email or password."));
      }
    } catch (err) {
      setError(language === "hi" ? "कनेक्शन त्रुटि।" : "Connection error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-3xl border border-slate-100 p-8 shadow-md space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto h-12 w-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100 shadow-3xs">
          <KeyRound className="w-5 h-5" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          {language === "hi" ? "खाते में लॉगिन करें" : "Login to Your Account"}
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm font-medium">
          {language === "hi" ? "अपनी बचत और तिजोरी की गणनाओं को सुरक्षित रूप से सहेजें" : "Access your secure financial roadmap and digital vault"}
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-800 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-black text-slate-600 uppercase tracking-wider">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 font-semibold text-slate-800"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-black text-slate-600 uppercase tracking-wider">Password</label>
            <button
              type="button"
              onClick={() => onNavigateToWidget("forgot_password")}
              className="text-xs font-bold text-purple-600 hover:underline cursor-pointer border-0 bg-transparent"
            >
              Forgot Password?
            </button>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 font-semibold text-slate-800"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer border-0 bg-transparent"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-black rounded-xl text-xs sm:text-sm cursor-pointer border-0 shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-wider"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Sign In</span>}
        </button>
      </form>

      <div className="border-t border-slate-100 pt-5 text-center text-xs sm:text-sm">
        <span className="text-slate-500 font-medium">New to Paisa Blueprint? </span>
        <button
          onClick={() => onNavigateToWidget("signup")}
          className="font-extrabold text-purple-600 hover:underline border-0 bg-transparent cursor-pointer"
        >
          Create Free Account
        </button>
      </div>
    </div>
  );
}

export function SignupPage({ onSuccess, language, onNavigateToWidget }: CommonPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const response = await paisaFetch("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setSuccess(language === "hi" ? "पंजीकरण सफल! लॉगिन किया जा रहा है..." : "Account created successfully! Auto-logging in...");
        setTimeout(() => {
          onSuccess(data.user);
        }, 1200);
      } else {
        setError(data.message || (language === "hi" ? "पंजीकरण विफल।" : "Failed to create account. Email might be in use."));
      }
    } catch (err) {
      setError(language === "hi" ? "कनेक्शन त्रुटि।" : "Connection error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-3xl border border-slate-100 p-8 shadow-md space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto h-12 w-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100 shadow-3xs">
          <Sparkles className="w-5 h-5 animate-pulse" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          {language === "hi" ? "नया निःशुल्क खाता बनाएं" : "Create Free Account"}
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm font-medium">
          {language === "hi" ? "अपनी डिजिटल तिजोरी और सुरक्षित गणनाओं को सुरक्षित करें" : "Save your planning snapshots, portfolios, and chat with AI advisor"}
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-800 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSignup} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-black text-slate-600 uppercase tracking-wider">Your Full Name</label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Anchal Priya"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 font-semibold text-slate-800"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-black text-slate-600 uppercase tracking-wider">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 font-semibold text-slate-800"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-black text-slate-600 uppercase tracking-wider">Secure Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 font-semibold text-slate-800"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer border-0 bg-transparent"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-black rounded-xl text-xs sm:text-sm cursor-pointer border-0 shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-wider"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Create Account</span>}
        </button>
      </form>

      <div className="border-t border-slate-100 pt-5 text-center text-xs sm:text-sm">
        <span className="text-slate-500 font-medium">Already have an account? </span>
        <button
          onClick={() => onNavigateToWidget("login")}
          className="font-extrabold text-purple-600 hover:underline border-0 bg-transparent cursor-pointer"
        >
          Sign In Instead
        </button>
      </div>
    </div>
  );
}

export function ForgotPasswordPage({ language, onNavigateToWidget }: { language: "en" | "hi"; onNavigateToWidget: (widget: string) => void }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const response = await paisaFetch("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: email.trim() })
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess(data.message || (language === "hi" ? "पासवर्ड रीसेट लिंक भेज दिया गया है।" : "Reset instruction has been sent to your email."));
      } else {
        setError(data.message || "Failed to process forgot password request.");
      }
    } catch (err) {
      setError("Connection error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-3xl border border-slate-100 p-8 shadow-md space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto h-12 w-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100 shadow-3xs">
          <Mail className="w-5 h-5" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          {language === "hi" ? "पासवर्ड भूल गए?" : "Forgot Your Password?"}
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm font-medium">
          Enter your registered email address to receive password recovery instructions
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-800 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-black text-slate-600 uppercase tracking-wider">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 font-semibold text-slate-800"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-black rounded-xl text-xs sm:text-sm cursor-pointer border-0 shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-wider"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Send Reset Link</span>}
        </button>
      </form>

      <div className="text-center pt-2">
        <button
          onClick={() => onNavigateToWidget("login")}
          className="text-xs font-bold text-purple-600 hover:underline border-0 bg-transparent cursor-pointer flex items-center justify-center gap-1 mx-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sign In</span>
        </button>
      </div>
    </div>
  );
}

export function ResetPasswordPage({ language, onNavigateToWidget }: { language: "en" | "hi"; onNavigateToWidget: (widget: string) => void }) {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    // Attempt to handle recovery session from url hash or query params
    const parseSession = async () => {
      try {
        const hash = window.location.hash || "";
        const search = window.location.search || "";
        
        let accessToken = "";
        let refreshToken = "";

        if (hash.startsWith("#")) {
          const params = new URLSearchParams(hash.substring(1));
          accessToken = params.get("access_token") || "";
          refreshToken = params.get("refresh_token") || "";
        }

        if (!accessToken && search) {
          const params = new URLSearchParams(search);
          accessToken = params.get("access_token") || params.get("token") || "";
          refreshToken = params.get("refresh_token") || "";
        }

        if (accessToken) {
          console.log("[ResetPasswordPage] Found access token. Restoring recovery session...");
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || accessToken
          });
          
          if (sessionError) {
            console.error("[ResetPasswordPage] Failed to set recovery session:", sessionError);
          } else {
            console.log("[ResetPasswordPage] Recovery session established.");
            const { data: { user } } = await supabase.auth.getUser();
            if (user && user.email) {
              setEmail(user.email);
            }
          }
        }
      } catch (err) {
        console.warn("[ResetPasswordPage] Error in parseSession:", err);
      }
    };

    parseSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      let isSupabaseActive = false;

      // 1. Try to see if we have an active Supabase recovery session
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          isSupabaseActive = true;
        } else {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            isSupabaseActive = true;
          }
        }
      } catch (_) {
        // Supabase client might not be fully configured or active
      }

      // 2. If Supabase session is active, update the password via Supabase Auth
      if (isSupabaseActive) {
        console.log("[ResetPasswordPage] Supabase active. Updating password...");
        const { error: updateError } = await supabase.auth.updateUser({
          password: newPassword
        });
        if (updateError) {
          console.error("[ResetPasswordPage] Supabase update password failed:", updateError);
          setError(updateError.message || "Failed to update Supabase password.");
          setLoading(false);
          return;
        }
        console.log("[ResetPasswordPage] Supabase password update successful.");
      }

      // 3. Update the password on our backend DB / local file system
      const response = await paisaFetch("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), newPassword })
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess(data.message || (language === "hi" ? "पासवर्ड रीसेट सफल रहा!" : "Your password has been successfully reset."));
        setTimeout(() => {
          onNavigateToWidget("login");
        }, 1500);
      } else {
        setError(data.message || "Failed to reset password.");
      }
    } catch (err: any) {
      setError(err?.message || "Connection error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-3xl border border-slate-100 p-8 shadow-md space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto h-12 w-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100 shadow-3xs">
          <Key className="w-5 h-5 animate-spin" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          {language === "hi" ? "नया पासवर्ड बनाएं" : "Reset Your Password"}
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm font-medium">
          Choose a strong password to recover access to your secure digital safe
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-800 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-black text-slate-600 uppercase tracking-wider">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 font-semibold text-slate-800"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-black text-slate-600 uppercase tracking-wider">New Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 font-semibold text-slate-800"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-black rounded-xl text-xs sm:text-sm cursor-pointer border-0 shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-wider"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Update Password</span>}
        </button>
      </form>
    </div>
  );
}

export function VerifyEmailPage({ language, onNavigateToWidget }: { language: "en" | "hi"; onNavigateToWidget: (widget: string) => void }) {
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="max-w-md mx-auto bg-white rounded-3xl border border-slate-100 p-8 shadow-md text-center space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto h-12 w-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100 shadow-3xs">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          {language === "hi" ? "ईमेल सत्यापन" : "Verify Your Email"}
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm font-medium">
          {language === "hi" ? "अपने पैसा ब्लूप्रिंट खाते को सुरक्षित करने के लिए सत्यापित करें" : "Ensuring your contact credibility to lock down persistent safe vaults"}
        </p>
      </div>

      {loading ? (
        <div className="py-8 flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
          <span className="text-xs font-bold text-slate-500">Verifying security token keys...</span>
        </div>
      ) : (
        <div className="space-y-6 pt-2">
          <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-800 text-xs sm:text-sm font-bold flex items-center justify-center gap-2">
            <Check className="w-5 h-5 text-emerald-600" />
            <span>Email verification completed successfully!</span>
          </div>

          <button
            onClick={() => onNavigateToWidget("login")}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-xl text-xs sm:text-sm cursor-pointer border-0 shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 uppercase tracking-wider"
          >
            <span>Proceed to Login</span>
            <ArrowRight className="w-4 h-4 text-purple-200" />
          </button>
        </div>
      )}
    </div>
  );
}
