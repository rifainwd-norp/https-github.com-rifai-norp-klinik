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
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  
  const supabase = createClient();
  const router = useRouter();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      if (isRegistering) {
        const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: email.split("@")[0] }
          }
        });
        if (signUpErr) throw signUpErr;

        if (signUpData.user && signUpData.session) {
           // Auto-login worked (email confirmation disabled)
           router.push("/complete-profile");
        } else {
           // Email confirmation required
           setErrorMsg("✅ Akun berhasil dibuat! Silakan cek inbox email Anda untuk melakukan konfirmasi sebelum login.");
           setIsRegistering(false); // Balik ke login mode
        }
      } else {
        const { data, error: signInErr } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInErr) {
          if (signInErr.message.toLowerCase().includes("email not confirmed")) {
            setErrorMsg("📧 Email belum dikonfirmasi. Cek inbox Anda, atau minta admin untuk menonaktifkan konfirmasi email di Supabase Dashboard → Authentication → Providers → Email.");
          } else if (signInErr.message.toLowerCase().includes("invalid login credentials")) {
            setErrorMsg("❌ Email atau password salah. Silakan coba lagi.");
          } else {
            throw signInErr;
          }
          return;
        }
        
        if (data.user) {
          // Fetch user profile to determine redirect
          const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single();
          
          if (profile?.role === "admin" || profile?.role === "staff") {
            router.push("/admin");
          } else {
            // Redirect to intake form if clinical profile is incomplete
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
    <div className="min-h-screen bg-mesh flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-[40px] shadow-premium p-10 lg:p-14"
      >
        <div className="text-center mb-10">
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-4">
            <Sparkles size={28} />
          </div>
          <h1 className="font-serif text-3xl text-on-surface mb-2">
            {isRegistering ? "Join Serene" : "Welcome Back"}
          </h1>
          <p className="text-on-surface-variant text-sm font-medium">
            Clinical excellence, personalized for you.
          </p>
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-primary ml-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
              <input 
                required
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-6 py-4 rounded-2xl border border-outline-variant outline-none focus:border-primary bg-surface-variant/10 text-sm font-bold"
                placeholder="doctor@serene.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-primary ml-2">Security Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
              <input 
                required
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-6 py-4 rounded-2xl border border-outline-variant outline-none focus:border-primary bg-surface-variant/10 text-sm font-bold"
                placeholder="••••••••"
              />
            </div>
          </div>

          <AnimatePresence>
            {errorMsg && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-error/10 text-error p-4 rounded-2xl flex items-start gap-3 text-xs font-bold leading-relaxed border border-error/20"
              >
                <AlertCircle size={16} className="shrink-0" />
                {errorMsg}
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-5 rounded-3xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (
              <>
                {isRegistering ? "Create Account" : "Access Portal"} <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-outline-variant/30 text-center">
          <button 
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors"
          >
            {isRegistering ? "Already have an account? Login" : "New patient? Create your profile"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
