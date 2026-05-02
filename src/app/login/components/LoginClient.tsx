"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  Sparkles,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginClient() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const supabase = createClient();
  const router = useRouter();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      if (isRegistering) {
        if (!fullName.trim()) throw new Error("Please enter your full name.");
        
        const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName }
          }
        });
        if (signUpErr) throw signUpErr;

        if (signUpData.user && signUpData.session) {
           router.push("/complete-profile");
        } else {
           setErrorMsg("Account created successfully. Please check your inbox for confirmation.");
           setIsRegistering(false);
        }
      } else {
        const { data, error: signInErr } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInErr) {
          if (signInErr.message.toLowerCase().includes("email not confirmed")) {
            setErrorMsg("Email not confirmed. Please check your inbox.");
          } else if (signInErr.message.toLowerCase().includes("invalid login credentials")) {
            setErrorMsg("Incorrect email or password.");
          } else {
            throw signInErr;
          }
          return;
        }
        
        if (data.user) {
          const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single();
          
          if (profile?.role === "admin" || profile?.role === "staff") {
            router.push("/admin");
          } else {
            if (!profile?.phone) {
              router.push("/complete-profile");
            } else {
              router.push("/dashboard");
            }
          }
        }
      }
    } catch (err) {
      const error = err as Error;
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-6 font-sans text-slate-900 selection:bg-slate-900 selection:text-white">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)] p-10 lg:p-14 border border-slate-100"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-slate-200">
            <Sparkles size={32} />
          </div>
          <h1 className="font-serif text-3xl md:text-4xl text-slate-900 mb-2 tracking-tight">
            {isRegistering ? "Join Serene" : "Welcome Back"}
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
            Clinical excellence, personalized.
          </p>
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-6">
          <AnimatePresence>
            {isRegistering && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-2 overflow-hidden">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Full Name</label>
                <div className="relative">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </div>
                  <input 
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-14 pr-6 py-5 rounded-3xl border border-slate-100 outline-none focus:border-slate-900 focus:bg-white bg-slate-50/50 text-sm font-bold transition-all"
                    placeholder="Your Full Name"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                required
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-14 pr-6 py-5 rounded-3xl border border-slate-100 outline-none focus:border-slate-900 focus:bg-white bg-slate-50/50 text-sm font-bold transition-all"
                placeholder="your.email@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Security Password</label>
            <div className="relative">
              <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                required
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-14 pr-14 py-5 rounded-3xl border border-slate-100 outline-none focus:border-slate-900 focus:bg-white bg-slate-50/50 text-sm font-bold transition-all"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {errorMsg && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-red-50 text-red-600 p-5 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest border border-red-100"
              >
                <AlertCircle size={20} className="shrink-0" />
                {errorMsg}
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 shadow-2xl shadow-slate-200 hover:scale-[1.02] active:scale-95 transition-all mt-4"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (
              <>
                {isRegistering ? "Create Account" : "Access Portal"} <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-slate-50 text-center">
          <button 
            onClick={() => { setIsRegistering(!isRegistering); setErrorMsg(null); }}
            className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
          >
            {isRegistering ? "Already have an account? Login" : "New patient? Create profile"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
