"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import { 
  FileText, Download, TrendingUp, DollarSign, Users, Calendar, 
  ArrowLeft, Loader2, Receipt, PieChart, BarChart3, TrendingDown,
  LayoutDashboard, Stethoscope, Package, Layers, LogOut, ChevronRight, Sparkles, Printer
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { getFinancialReport } from "@/app/actions/admin";

type Invoice = {
  id: string;
  total_amount: number;
  discount_amount: number;
  payment_method: string;
  created_at: string;
  patient_name: string;
  appointments: {
    profiles: { full_name: string };
    services: { name: string; category: string };
  };
};

export default function FinancialReports() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [dateRange, setDateRange] = useState("all");

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
      fetchReports();
    }
    init();
  }, [dateRange]);

  async function fetchReports() {
    setLoading(true);
    try {
      const data = await getFinancialReport();
      setInvoices(data as any);
    } catch (e) {
      console.error("Report fetch error:", e);
    }
    setLoading(false);
  }

  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total_amount, 0);
  const totalDiscount = invoices.reduce((sum, inv) => sum + inv.discount_amount, 0);
  const avgTransaction = invoices.length > 0 ? totalRevenue / invoices.length : 0;

  if (loading && invoices.length === 0) return <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]"><Loader2 className="animate-spin text-slate-900" size={40} /></div>;

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col lg:flex-row font-sans text-slate-900">
      {/* SHARED PREMIUM SIDEBAR */}
      <aside className="fixed inset-y-0 left-0 w-80 bg-white border-r border-slate-100 z-50 hidden lg:flex flex-col print:hidden">
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
        {/* PRINT HEADER - RESTORED & POLISHED */}
        <div className="hidden print:block mb-10 border-b-2 border-slate-900 pb-8">
           <div className="flex justify-between items-end">
              <div>
                 <h1 className="text-4xl font-serif font-black tracking-tighter mb-2 italic">SERENE</h1>
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Aesthetic Performance Statement</p>
              </div>
              <div className="text-right">
                 <p className="text-sm font-black text-slate-900 mb-1">{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                 <p className="text-[9px] text-slate-400 font-medium">Jl. Serene Beauty No. 88, Jakarta Selatan | Telp: (021) 555-0123</p>
              </div>
           </div>
           <div className="mt-8 flex justify-between items-center px-1">
              <p className="text-[10px] text-slate-900 font-black uppercase tracking-[0.4em] italic">Official Financial Record</p>
              <div className="h-px flex-1 bg-slate-100 mx-8" />
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest whitespace-nowrap">Report Ref: {new Date().getTime()}</p>
           </div>
        </div>

        {/* SCREEN HEADER */}
        <header className="mb-16 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 print:hidden">
            <div className="space-y-2">
               <h1 className="font-serif text-5xl lg:text-6xl text-slate-900 tracking-tighter">Financial Intelligence</h1>
               <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.25em]">Economic Performance Data</p>
            </div>
            
            <button onClick={() => window.print()} className="bg-slate-900 text-white px-10 py-5 rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 shadow-2xl shadow-slate-200 active:scale-95 transition-all">
               <Printer size={18} /> Export Statement
            </button>
        </header>

        {/* KPI CARDS - GRID REFINED */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 print:grid-cols-3 print:gap-4 print:mb-10 print:border-b print:border-slate-100 print:pb-10">
           <ReportStatCard label="Gross Revenue" value={totalRevenue} icon={<DollarSign className="text-emerald-500"/>} color="bg-emerald-50 text-emerald-700" />
           <ReportStatCard label="Loyalty Savings" value={totalDiscount} icon={<TrendingDown className="text-amber-500"/>} color="bg-amber-50 text-amber-700" />
           <ReportStatCard label="Avg Transaction" value={avgTransaction} icon={<TrendingUp className="text-blue-500"/>} color="bg-blue-50 text-blue-700" />
        </div>

        {/* TRANSACTIONS TABLE - MASTER DESIGN */}
        <div className="bg-white rounded-5xl border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden print:shadow-none print:border-none print:rounded-none">
           <div className="p-12 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6 print:hidden">
              <h2 className="font-serif text-3xl text-slate-900">Settlement Ledger</h2>
              <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                 {['all', 'monthly', 'weekly'].map(r => (
                   <button key={r} onClick={() => setDateRange(r)} className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${dateRange === r ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>{r}</button>
                 ))}
              </div>
           </div>
           
           {/* TABLE TITLE FOR PRINT */}
           <div className="hidden print:block mb-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">Settlement Transactions Detail</h3>
           </div>

           <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[1000px] print:min-w-full">
                 <thead>
                    <tr className="bg-slate-50/50 print:bg-transparent print:border-b-2 print:border-slate-900">
                       <th className="px-12 py-8 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 print:px-2 print:py-4 print:text-slate-900">Date & Time</th>
                       <th className="px-12 py-8 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 print:px-2 print:py-4 print:text-slate-900">Patient & Category</th>
                       <th className="px-12 py-8 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 print:px-2 print:py-4 print:text-slate-900">Method</th>
                       <th className="px-12 py-8 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 text-right print:px-2 print:py-4 print:text-slate-900">Settlement</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50 print:divide-slate-100">
                    {invoices.map((inv, index) => (
                       <tr key={inv.id || index} className="hover:bg-slate-50/20 transition-all group print:hover:bg-transparent">
                          <td className="px-12 py-8 print:px-2 print:py-6">
                             <p className="text-sm font-black text-slate-900 mb-1">{new Date(inv.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}</p>
                             <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{new Date(inv.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                          </td>
                          <td className="px-12 py-8 print:px-2 print:py-6">
                             <p className="text-sm font-black text-slate-900 mb-1">{inv.patient_name || "Guest Patient"}</p>
                             <div className="flex items-center gap-2">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{inv.appointments?.services?.category}</span>
                                <ChevronRight size={10} className="text-slate-200 print:hidden"/>
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate max-w-[120px] print:max-w-none">{inv.appointments?.services?.name}</span>
                             </div>
                          </td>
                          <td className="px-12 py-8 print:px-2 print:py-6">
                             <span className="text-[9px] font-black text-slate-500 bg-slate-50 border border-slate-100 px-4 py-1.5 rounded-full uppercase tracking-widest print:bg-transparent print:border-none print:px-0">{inv.payment_method}</span>
                          </td>
                          <td className="px-12 py-8 text-right print:px-2 print:py-6">
                             <div className="flex flex-col items-end">
                                <p className="text-lg font-serif text-slate-900 print:text-base">Rp {inv.total_amount.toLocaleString('id-ID')}</p>
                                {inv.discount_amount > 0 && (
                                   <p className="text-[9px] font-black text-red-400 uppercase tracking-widest">- Rp {inv.discount_amount.toLocaleString('id-ID')} Saved</p>
                                )}
                             </div>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
        
        {/* FOOTER PRINT - PREMIUM */}
        <footer className="hidden print:flex justify-between items-center mt-20 pt-10 border-t border-slate-100">
           <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-900 mb-1">Clinic Director Signature</p>
              <div className="h-16 w-48 border-b border-slate-900/10 mb-4" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Authorized Financial Audit</p>
           </div>
           <div className="text-right">
              <p className="font-serif text-2xl text-slate-900 mb-2 tracking-tighter italic">Serene Beauty & Clinical Care</p>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.3em] italic">Precision in Aesthetic Performance</p>
           </div>
        </footer>
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

function ReportStatCard({ label, value, icon, color }: any) {
   return (
      <div className="bg-white p-10 rounded-5xl border border-slate-100 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden print:border-none print:p-0 print:rounded-none">
         <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[100px] -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-all duration-700 print:hidden" />
         <div className="relative">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 ${color} shadow-sm print:hidden`}>{icon}</div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-3 print:text-slate-900 print:mb-1">{label}</p>
            <h3 className="text-4xl font-serif text-slate-900 tracking-tighter print:text-2xl">Rp {value.toLocaleString('id-ID')}</h3>
         </div>
      </div>
   )
}
