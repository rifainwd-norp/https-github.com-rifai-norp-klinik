"use client";

import { useEffect, useState } from "react";
import { Monitor, Smartphone, AlertCircle } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const checkSize = () => {
      setIsMobile(window.innerWidth < 1024); // 1024px is usually the threshold for desktop
    };
    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  if (isMobile === null) return null;

  if (isMobile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8 text-center">
        <div className="max-w-sm w-full bg-white rounded-[48px] p-12 shadow-2xl border border-slate-100">
           <div className="w-20 h-20 bg-slate-900 text-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl">
              <Smartphone size={40} className="text-slate-400 opacity-50" />
              <div className="absolute w-24 h-24 border-2 border-red-500 rounded-full flex items-center justify-center">
                 <AlertCircle size={48} className="text-red-500" />
              </div>
           </div>
           <h1 className="font-serif text-3xl text-slate-900 mb-4 tracking-tight">Desktop Only</h1>
           <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-10 leading-relaxed">
             Administrative controls are restricted to high-resolution desktop environments for operational safety.
           </p>
           <div className="p-6 bg-slate-50 rounded-3xl flex items-center gap-4 text-left border border-slate-100">
              <Monitor size={24} className="text-slate-900" />
              <div>
                 <p className="text-[9px] font-black uppercase text-slate-900">Switch to Terminal</p>
                 <p className="text-[8px] font-bold text-slate-400 uppercase">Use Laptop/PC for Management</p>
              </div>
           </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
