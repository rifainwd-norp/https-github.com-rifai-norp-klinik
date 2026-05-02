"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Printer, 
  BarChart3, 
  DollarSign, 
  TrendingUp, 
  Receipt,
  Loader2,
  Calendar,
  Wallet
} from "lucide-react";
import Link from "next/link";
import { getFinancialReport } from "@/app/actions/admin";

type Invoice = {
  id: string;
  total_amount: number;
  discount_amount: number;
  payment_method: string;
  created_at: string;
  patient_name: string;
  appointments?: {
    services?: { name: string; category: string };
  };
};

export default function FinancialAuditReport() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function loadReport() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      if (profile?.role !== "admin") { router.push("/dashboard"); return; }

      try {
        const data = await getFinancialReport();
        setInvoices(data as any);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadReport();
  }, [supabase, router]);

  const totalRevenue = invoices.reduce((acc, curr) => acc + (curr.total_amount || 0), 0);
  const totalDiscounts = invoices.reduce((acc, curr) => acc + (curr.discount_amount || 0), 0);
  const transactionCount = invoices.length;

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin text-primary" size={40} /></div>;

  return (
    <div className="min-h-screen bg-[#FDFDFD] p-6 lg:p-16 print:p-0 print:bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header - Hidden on Print */}
        <header className="flex flex-col md:flex-row md:justify-between md:items-center mb-12 gap-6 print:hidden">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => router.back()} 
              className="w-12 h-12 rounded-full bg-white border border-outline-variant flex items-center justify-center text-on-surface-variant hover:text-primary transition-all shadow-sm"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="font-serif text-4xl text-on-surface mb-2">Financial Audit</h1>
              <p className="text-on-surface-variant text-sm font-medium">Official Settlement & Revenue Ledger</p>
            </div>
          </div>
          <button onClick={handlePrint} className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-bold uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:scale-[1.02] transition-all">
            <Printer size={18} /> Export Financial PDF
          </button>
        </header>

        {/* Report Header - Only on Print (Highly Aligned) */}
        <div className="hidden print:block mb-12">
           <div className="flex justify-between items-end border-b-2 border-slate-900 pb-8">
              <div className="flex items-center gap-5">
                 {/* Custom Serene Logo (SVG) */}
                 <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white shrink-0">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-8 h-8">
                       <path d="M12 3c4.97 0 9 4.03 9 9s-4.03 9-9 9-9-4.03-9-9 4.03-9 9-9z" />
                       <path d="M12 8v8M8 12h8" />
                    </svg>
                 </div>
                 <div className="space-y-0.5">
                    <h1 className="text-2xl font-black text-slate-900 tracking-tighter leading-none">SERENE CLINICAL</h1>
                    <p className="text-[10px] text-slate-500 font-bold tracking-[0.4em] uppercase">Aesthetics & Wellness</p>
                 </div>
              </div>
              <div className="text-right space-y-1">
                 <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">Financial Audit</h2>
                 <p className="text-xs font-medium text-slate-500">{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
           </div>
           <div className="mt-4 flex justify-between items-center px-1">
              <p className="text-[9px] text-slate-400 font-medium">Jl. Serene Beauty No. 88, Jakarta Selatan | Telp: (021) 555-0123</p>
              <p className="text-[9px] text-slate-900 font-black uppercase tracking-widest italic">Confidential Audit Statement</p>
           </div>
        </div>

        {/* KPI Summary (Balanced Grid) */}
        <div className="hidden print:block mb-12 border-b border-slate-100 pb-10">
           <div className="grid grid-cols-3 gap-0">
              <div className="border-r border-slate-100 pr-10">
                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">Gross Revenue</p>
                 <div className="flex items-baseline gap-2">
                    <h3 className="text-xl font-black text-slate-900 leading-none">Rp {totalRevenue.toLocaleString('id-ID')}</h3>
                 </div>
              </div>
              <div className="border-r border-slate-100 px-10">
                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">Loyalty Savings</p>
                 <div className="flex items-baseline gap-2">
                    <h3 className="text-xl font-black text-red-600 leading-none">Rp {totalDiscounts.toLocaleString('id-ID')}</h3>
                 </div>
              </div>
              <div className="pl-10 text-right">
                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">Transactions</p>
                 <div className="flex items-baseline justify-end gap-2">
                    <h3 className="text-xl font-black text-slate-900 leading-none">{transactionCount.toLocaleString('id-ID')}</h3>
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Orders</span>
                 </div>
              </div>
           </div>
        </div>

        {/* Category Summary (Organized Column Layout) */}
        <div className="hidden print:block mb-12">
           <div className="flex items-center gap-4 mb-6">
              <p className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em]">Revenue Distribution</p>
              <div className="flex-1 h-px bg-slate-100" />
           </div>
           <div className="grid grid-cols-4 gap-y-6 gap-x-12">
              {Object.entries(
                invoices.reduce((acc, inv) => {
                  const cat = inv.appointments?.services?.category || 'General';
                  acc[cat] = (acc[cat] || 0) + inv.total_amount;
                  return acc;
                }, {} as Record<string, number>)
              ).map(([category, total]) => (
                <div key={category} className="space-y-1">
                   <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block">{category}</span>
                   <span className="text-xs font-black text-slate-900 block">Rp {total.toLocaleString('id-ID')}</span>
                </div>
              ))}
           </div>
        </div>

        {/* Financial Table (Perfect Alignment) */}
        <div className="print:mt-12">
           <div className="flex items-center justify-between mb-4 border-b border-slate-900 pb-2">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Official Settlement Ledger</h3>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em]">Data Verified per {new Date().toLocaleDateString('id-ID')}</p>
           </div>
           <table className="w-full text-left border-collapse">
              <thead>
                 <tr className="border-b border-slate-200">
                    <th className="py-4 text-[10px] font-black uppercase tracking-widest text-slate-900 w-[40%]">Patient & Service Description</th>
                    <th className="py-4 text-[10px] font-black uppercase tracking-widest text-slate-900 w-[20%]">Payment Method</th>
                    <th className="py-4 text-[10px] font-black uppercase tracking-widest text-center text-slate-900 w-[15%]">Time</th>
                    <th className="py-4 text-[10px] font-black uppercase tracking-widest text-right text-slate-900 w-[25%]">Settlement Value</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                 {invoices.map((inv) => (
                  <tr key={inv.id} className="print:break-inside-avoid">
                      <td className="py-5 pr-4">
                        <p className="text-[11px] font-black text-slate-900">{inv.patient_name}</p>
                        <p className="text-[8px] text-slate-400 mt-1 font-medium italic">Treatment: {inv.appointments?.services?.name || "N/A"}</p>
                        {inv.discount_amount > 0 && <p className="text-[8px] font-black text-emerald-600 uppercase mt-1 tracking-tighter">! Promo Discount Applied</p>}
                      </td>
                      <td className="py-5">
                         <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">{inv.payment_method}</span>
                      </td>
                      <td className="py-5 text-center">
                        <p className="text-[11px] font-black text-slate-900">{new Date(inv.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                        <p className="text-[8px] text-slate-400 font-bold uppercase">{new Date(inv.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}</p>
                      </td>
                      <td className="py-5 text-right">
                        <p className="text-[11px] font-black text-slate-900">Rp {inv.total_amount.toLocaleString('id-ID')}</p>
                        <p className="text-[8px] text-slate-400 font-medium">settled via {inv.payment_method}</p>
                      </td>
                  </tr>
                 ))}
              </tbody>
           </table>
        </div>

        {/* Footer & Signatures - Only on Print */}
        <div className="hidden print:block mt-12 space-y-8">
           <div className="border-t border-slate-200 pt-6">
              <p className="text-[9px] font-bold text-slate-900 uppercase tracking-widest mb-4 italic underline">Pernyataan & Persetujuan Audit:</p>
              <div className="grid grid-cols-3 gap-8">
                 <div className="space-y-1 text-center">
                    <p className="text-[8px] font-bold text-slate-400 uppercase">Dibuat Oleh,</p>
                    <div className="h-20 border-b border-slate-200" />
                    <p className="text-[10px] font-bold text-slate-900 pt-2">Finance Staff</p>
                 </div>
                 <div className="space-y-1 text-center">
                    <p className="text-[8px] font-bold text-slate-400 uppercase">Diperiksa Oleh,</p>
                    <div className="h-20 border-b border-slate-200" />
                    <p className="text-[10px] font-bold text-slate-900 pt-2">Audit Manager</p>
                 </div>
                 <div className="space-y-1 text-center">
                    <p className="text-[8px] font-bold text-slate-400 uppercase">Disetujui Oleh,</p>
                    <div className="h-20 border-b border-slate-200" />
                    <p className="text-[10px] font-bold text-slate-900 pt-2">Finance Director</p>
                 </div>
              </div>
           </div>
           <div className="flex justify-between items-center text-[8px] text-slate-400 border-t pt-4">
              <p>Dicetak pada: {new Date().toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })} | Dokumen Keuangan Rahasia</p>
              <p>Serene Clinical Financial Intelligence System</p>
           </div>
        </div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap');

        @media print {
          @page { size: A4 portrait; margin: 15mm; }
          * { position: static !important; overflow: visible !important; float: none !important; box-shadow: none !important; }
          body, html { background: white !important; color: black !important; width: 100% !important; margin: 0 !important; padding: 0 !important; font-family: 'Inter', sans-serif !important; }
          aside, nav, button, header.print\\:hidden, .print\\:hidden { display: none !important; }
          main { margin: 0 !important; padding: 0 !important; width: 100% !important; }
          .max-w-7xl { max-width: 100% !important; width: 100% !important; }
          
          .grid { display: grid !important; width: 100% !important; }
          .grid-cols-3 { grid-template-columns: repeat(3, 1fr) !important; }
        }
        body { font-family: 'Inter', sans-serif; }
        .font-serif { font-family: 'Playfair Display', serif; }
      `}</style>
    </div>
  );
}
