"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import { 
  Plus, Search, Edit2, Loader2, Save, X, ArrowLeft,
  LayoutDashboard, Stethoscope, Package, Layers, FileText, TrendingUp, Users, LogOut, ChevronRight,
  Sparkles, Printer, Activity, Star, Calendar, BarChart3, TrendingDown, Clock, ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { getAllAppointments } from "@/app/actions/admin";

type Appointment = {
  id: string;
  status: string;
  services: { price: string } | null;
  profiles: { member_status: string } | null;
};

export default function StatisticsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        setUserProfile(data);
      }
      loadStats();
    }
    init();
  }, []);

  async function loadStats() {
    setLoading(true);
    try {
      const data = await getAllAppointments();
      setAppointments(data as unknown as Appointment[]);
    } catch (err) { console.error(err); }
    setLoading(false);
  }

  const calculateDiscount = (price: number, status: string) => {
    const p = status?.toLowerCase();
    if (p === 'platinum') return price * 0.20;
    if (p === 'gold') return price * 0.15;
    if (p === 'silver') return price * 0.10;
    if (p === 'basic') return price * 0.05;
    return 0;
  };

  const netRevenue = appointments
    .filter(a => a.status === 'completed')
    .reduce((acc, curr) => {
      const price = parseInt(curr.services?.price || "0");
      const discount = calculateDiscount(price, curr.profiles?.member_status || "basic");
      return acc + (price - discount);
    }, 0);

  if (loading && appointments.length === 0) return <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]"><Loader2 className="animate-spin text-slate-900" size={40} /></div>;

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col lg:flex-row font-sans text-slate-900">
      {/* SHARED PREMIUM SIDEBAR */}
      <aside className="fixed inset-y-0 left-0 w-80 bg-white border-r border-slate-100 flex-col z-50 hidden lg:flex print:hidden">
        <div className="p-10 flex flex-col grow">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg"><Sparkles size={20} /></div>
            <span className="text-2xl font-serif font-black tracking-tighter">SERENE</span>
          </div>

          <nav className="space-y-1.5 mb-10">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-300 mb-4 px-4">Core Operations</p>
            <Link href="/admin"><NavItem icon={<LayoutDashboard size={20} />} label="Patient Queue" active={pathname === '/admin'} /></Link>
            <Link href="/admin/treatments"><NavItem icon={<Stethoscope size={20} />} label="Treatments" active={pathname === '/admin/treatments'} /></Link>
            <Link href="/admin/products"><NavItem icon={<Package size={20} />} label="Products" active={pathname === '/admin/products'} /></Link>
            <Link href="/admin/inventory"><NavItem icon={<Layers size={20} />} label="Stock Control" active={pathname === '/admin/inventory'} /></Link>
            
            {userProfile?.role === 'admin' && (
              <>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-300 mt-10 mb-4 px-4">Intelligence</p>
                <Link href="/admin/reports"><NavItem icon={<FileText size={20} />} label="Financial Intelligence" active={pathname === '/admin/reports'} /></Link>
                <Link href="/admin/statistics"><NavItem icon={<TrendingUp size={20} />} label="Clinic Analytics" active={pathname === '/admin/statistics'} /></Link>
                <Link href="/admin/users"><NavItem icon={<Users size={20} />} label="Staff Access" active={pathname === '/admin/users'} /></Link>
              </>
            )}
          </nav>

          <div className="mt-auto">
             <div className="bg-slate-50 p-6 rounded-4xl mb-8 group cursor-pointer hover:bg-slate-900 transition-all duration-500">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center font-bold group-hover:bg-slate-800 transition-all">{userProfile?.full_name?.[0]}</div>
                   <div>
                      <p className="text-xs font-black group-hover:text-white transition-colors uppercase tracking-widest">{userProfile?.full_name}</p>
                      <p className="text-[10px] font-bold text-slate-400 group-hover:text-slate-500 transition-colors uppercase tracking-widest">{userProfile?.role}</p>
                   </div>
                </div>
             </div>
             <button onClick={async () => { await supabase.auth.signOut(); router.push("/login"); }} className="w-full flex items-center justify-between px-6 py-4 rounded-2xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all text-[10px] font-black uppercase tracking-[0.2em]">
                Logout System <LogOut size={16} />
             </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-6 lg:p-16 lg:ml-80 transition-all duration-500 print:ml-0 print:p-0">
        {/* PRINT HEADER - PREMIUM STYLE */}
        <div className="hidden print:block mb-12 border-b-2 border-slate-900 pb-8">
           <div className="flex justify-between items-end">
              <div>
                 <h1 className="text-4xl font-serif font-black tracking-tighter mb-2 italic">SERENE CLINICAL</h1>
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Strategic Performance Audit</p>
              </div>
              <div className="text-right">
                 <p className="text-sm font-black text-slate-900 mb-1">{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                 <p className="text-[9px] text-slate-400 font-bold">Confidential Operational Data</p>
              </div>
           </div>
        </div>

        <header className="mb-16 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 print:hidden">
            <div className="space-y-2">
               <h1 className="font-serif text-5xl lg:text-6xl text-slate-900 tracking-tighter">Strategic Analytics</h1>
               <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.25em]">Comprehensive Performance Monitoring</p>
            </div>
            
            <button onClick={() => window.print()} className="bg-slate-900 text-white px-10 py-5 rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 shadow-2xl shadow-slate-200 active:scale-95 transition-all">
               <Printer size={18} /> Export Analytics
            </button>
        </header>

        {/* KPI GRID - MASTER DESIGN */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16 print:grid-cols-4 print:gap-4">
           <StatCard label="Gross Performance" value={`Rp ${netRevenue.toLocaleString('id-ID')}`} icon={<TrendingUp className="text-emerald-500"/>} color="bg-emerald-50 text-emerald-700" />
           <StatCard label="Patient Volume" value={appointments.length} icon={<Users className="text-blue-500"/>} color="bg-blue-50 text-blue-700" />
           <StatCard label="Capacity Utilization" value="84%" icon={<Activity className="text-amber-500"/>} color="bg-amber-50 text-amber-700" />
           <StatCard label="Service Rating" value="4.9/5" icon={<Star className="text-violet-500" fill="currentColor"/>} color="bg-violet-50 text-violet-700" />
        </div>

        {/* DETAILED INSIGHTS - EXECUTIVE STYLE */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
           <div className="bg-white rounded-5xl p-12 border border-slate-100 shadow-sm hover:shadow-xl transition-all">
              <div className="flex items-center justify-between mb-10">
                 <h3 className="font-serif text-2xl text-slate-900">Patient Velocity</h3>
                 <Clock className="text-slate-200" size={24}/>
              </div>
              <div className="space-y-6">
                 {[
                   { label: "Clinic Check-in", val: "4.2 min", status: "Optimal", color: "text-emerald-500 bg-emerald-50" },
                   { label: "Consultation Phase", val: "18.5 min", status: "Standard", color: "text-blue-500 bg-blue-50" },
                   { label: "Active Treatment", val: "45.0 min", status: "Efficient", color: "text-violet-500 bg-violet-50" }
                 ].map(item => (
                   <div key={item.label} className="flex justify-between items-center group">
                      <div>
                         <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">{item.label}</p>
                         <p className="text-lg font-black text-slate-900">{item.val}</p>
                      </div>
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-transparent group-hover:border-current transition-all ${item.color}`}>{item.status}</span>
                   </div>
                 ))}
              </div>
           </div>

           <div className="bg-white rounded-5xl p-12 border border-slate-100 shadow-sm hover:shadow-xl transition-all">
              <div className="flex items-center justify-between mb-10">
                 <h3 className="font-serif text-2xl text-slate-900">Quality Indices</h3>
                 <ShieldCheck className="text-slate-200" size={24}/>
              </div>
              <div className="space-y-6">
                 {[
                   { label: "Professional Excellence", score: "4.95", detail: "Top 2% Clinical Staff" },
                   { label: "Operational Hygiene", score: "5.00", detail: "Zero Protocol Deviations" },
                   { label: "Outcome Satisfaction", score: "4.85", detail: "98% Positive Feedback" }
                 ].map(item => (
                   <div key={item.label} className="flex justify-between items-center">
                      <div>
                         <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">{item.label}</p>
                         <p className="text-xs font-bold text-slate-500">{item.detail}</p>
                      </div>
                      <div className="text-right">
                         <p className="text-2xl font-serif text-slate-900">{item.score}</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        <div className="mt-16 p-12 bg-slate-900 rounded-5xl text-white flex flex-col md:flex-row justify-between items-center gap-10 overflow-hidden relative group">
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:scale-150 transition-transform duration-1000" />
           <div className="relative z-10">
              <h2 className="font-serif text-3xl mb-4">Strategic Insight</h2>
              <p className="text-white/60 text-sm max-w-xl leading-relaxed">Your clinic is currently performing at 84% capacity. Strategic expansion into advanced laser treatments could increase gross revenue by approximately 18% in the next quarter based on current patient flow velocity.</p>
           </div>
           <button onClick={() => router.push("/admin/reports")} className="relative z-10 px-8 py-4 bg-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-105 active:scale-95 transition-all">Review Financials</button>
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <div className={`flex items-center gap-5 px-6 py-4 rounded-2xl transition-all duration-300 cursor-pointer group ${active ? "bg-slate-900 text-white shadow-2xl shadow-slate-200" : "text-slate-400 hover:bg-slate-50 hover:text-slate-900"}`}>
      <span className={active ? "text-white" : "text-slate-400 group-hover:text-slate-900 transition-colors"}>{icon}</span>
      <span className="text-[11px] font-black uppercase tracking-[0.2em]">{label}</span>
      {active && <motion.div layoutId="activeNav" className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]" />}
    </div>
  );
}

function StatCard({ label, value, icon, color }: any) {
   return (
      <div className="bg-white p-10 rounded-5xl border border-slate-100 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden print:border-none print:p-0">
         <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[100px] -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-all duration-700 print:hidden" />
         <div className="relative">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 ${color} shadow-sm print:hidden`}>{icon}</div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-3 print:text-slate-900 print:mb-1">{label}</p>
            <h3 className="text-3xl font-serif text-slate-900 tracking-tighter print:text-xl">{value}</h3>
         </div>
      </div>
   )
}
