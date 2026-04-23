"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Mail, Lock, ArrowRight, Fingerprint, Github, Globe } from "lucide-react";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-background flex selection:bg-primary selection:text-white">
      {/* Left Side: Visual Atmosphere */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-primary">
        <Image 
          src="/images/hero.png" 
          alt="Serenity" 
          fill 
          className="object-cover grayscale opacity-40 scale-110"
          sizes="50vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/20 to-transparent" />
        <div className="absolute bottom-20 left-20 z-10 max-w-lg">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white mb-8 border border-white/10"
          >
            <Sparkles size={24} />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-serif text-6xl text-white mb-6 leading-tight"
          >
            Your path to <br />
            <span className="italic text-primary-container">radiant</span> skin.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/70 text-lg font-medium"
          >
            Access your personalized clinical journey and monitor your restorative progress with Serene.
          </motion.p>
        </div>
        {/* Decorative Orbs */}
        <div className="absolute top-1/4 -right-20 w-96 h-96 bg-primary-container/10 rounded-full blur-[100px]" />
      </div>

      {/* Right Side: Authentication Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-24 noise-bg glow-mesh">
        <div className="w-full max-w-md">
          <div className="mb-12">
            <Link href="/" className="flex items-center gap-2 mb-12 group">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
                <Sparkles size={16} />
              </div>
              <span className="text-xl font-bold tracking-tighter text-primary">SERENE</span>
            </Link>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={isLogin ? "login-head" : "reg-head"}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4 }}
              >
                <h2 className="font-serif text-4xl text-on-surface mb-3">
                  {isLogin ? "Welcome Back" : "Begin Your Journey"}
                </h2>
                <p className="text-on-surface-variant font-medium">
                  {isLogin ? "Please enter your clinical credentials." : "Create your private patient profile."}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            {!isLogin && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-2"
              >
                <label className="text-[10px] font-bold uppercase tracking-widest text-primary ml-2">Full Name</label>
                <input 
                  type="text" 
                  placeholder="Eleanor Rigby" 
                  className="w-full px-6 py-4 rounded-2xl border border-outline-variant bg-white outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all"
                />
              </motion.div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-primary ml-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-outline" size={18} />
                <input 
                  type="email" 
                  placeholder="name@example.com" 
                  className="w-full pl-14 pr-6 py-4 rounded-2xl border border-outline-variant bg-white outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-primary">Password</label>
                {isLogin && <button className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors">Forgot?</button>}
              </div>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-outline" size={18} />
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  className="w-full pl-14 pr-6 py-4 rounded-2xl border border-outline-variant bg-white outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all"
                />
              </div>
            </div>

            <motion.button 
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => { window.location.href = isLogin ? '/dashboard' : '/patient'; }}
              className="w-full bg-primary text-white py-5 rounded-2xl font-bold uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 shadow-premium hover:shadow-2xl hover:shadow-primary/30 transition-all"
            >
              {isLogin ? "Sign In" : "Create Account"}
              <ArrowRight size={18} />
            </motion.button>
          </form>

          <div className="mt-12 text-center space-y-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-outline-variant"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-widest bg-background px-4 text-on-surface-variant font-bold">
                Or Continue With
              </div>
            </div>

            <div className="flex gap-4">
              <SocialBtn icon={<Globe size={20} />} label="Google" />
              <SocialBtn icon={<Fingerprint size={20} />} label="Biometric" />
            </div>

            <p className="text-sm font-medium text-on-surface-variant">
              {isLogin ? "New to Serene?" : "Already have a profile?"} {" "}
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary font-bold hover:underline"
              >
                {isLogin ? "Create an account" : "Sign in instead"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SocialBtn({ icon, label }) {
  return (
    <button className="flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-2xl border border-outline-variant hover:bg-white hover:border-primary transition-all group">
      <span className="text-on-surface-variant group-hover:text-primary transition-colors">{icon}</span>
      <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant group-hover:text-primary">{label}</span>
    </button>
  );
}
