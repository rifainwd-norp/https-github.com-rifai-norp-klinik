"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Printer, 
  BarChart3, 
  AlertTriangle, 
  Archive, 
  Layers,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { getInventoryReport } from "@/app/actions/admin";

type InventoryItem = {
  id: string;
  name: string;
  category: string;
  stock_quantity: number;
  min_threshold: number;
  price_per_unit: number;
  unit: string;
  related_services?: string[];
};

export default function InventoryReport() {
  const [items, setItems] = useState<InventoryItem[]>([]);
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
        const data = await getInventoryReport();
        setItems(data as unknown as InventoryItem[]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadReport();
  }, [supabase, router]);

  const totalItems = items.length;
  const lowStockItems = items.filter(i => i.stock_quantity <= i.min_threshold).length;
  const inventoryValue = items.reduce((acc, curr) => acc + (curr.stock_quantity * curr.price_per_unit), 0);

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
              <h1 className="font-serif text-4xl text-on-surface mb-2">Inventory Audit</h1>
              <p className="text-on-surface-variant text-sm font-medium">Real-time Stock & Asset Valuation</p>
            </div>
          </div>
          <button onClick={handlePrint} className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-bold uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:scale-[1.02] transition-all">
            <Printer size={18} /> Export PDF Report
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
                 <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">Inventory Audit</h2>
                 <p className="text-xs font-medium text-slate-500">{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
           </div>
           <div className="mt-4 flex justify-between items-center px-1">
              <p className="text-[9px] text-slate-400 font-medium">Jl. Serene Beauty No. 88, Jakarta Selatan | Telp: (021) 555-0123</p>
              <p className="text-[9px] text-slate-900 font-black uppercase tracking-widest italic">Confidential Report</p>
           </div>
        </div>

        {/* KPI Summary (Balanced Grid) */}
        <div className="hidden print:block mb-12 border-b border-slate-100 pb-10">
           <div className="grid grid-cols-3 gap-0">
              <div className="border-r border-slate-100 pr-10">
                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">Total SKU</p>
                 <div className="flex items-baseline gap-2">
                    <h3 className="text-xl font-black text-slate-900 leading-none">{totalItems.toLocaleString('id-ID')}</h3>
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Items</span>
                 </div>
              </div>
              <div className="border-r border-slate-100 px-10">
                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">Low Stock</p>
                 <div className="flex items-baseline gap-2">
                    <h3 className="text-xl font-black text-red-600 leading-none">{lowStockItems.toLocaleString('id-ID')}</h3>
                    <span className="text-[9px] font-bold text-red-300 uppercase tracking-widest">Alerts</span>
                 </div>
              </div>
              <div className="pl-10 text-right">
                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">Asset Valuation</p>
                 <h3 className="text-xl font-black text-slate-900 leading-none">Rp {inventoryValue.toLocaleString('id-ID')}</h3>
              </div>
           </div>
        </div>

        {/* Category Summary (Organized Column Layout) */}
        <div className="hidden print:block mb-12">
           <div className="flex items-center gap-4 mb-6">
              <p className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em]">Asset Distribution</p>
              <div className="flex-1 h-px bg-slate-100" />
           </div>
           <div className="grid grid-cols-4 gap-y-6 gap-x-12">
              {Object.entries(
                items.reduce((acc, item) => {
                  const cat = item.category || 'Uncategorized';
                  const val = (Number(item.stock_quantity) || 0) * (item.price_per_unit || 0);
                  acc[cat] = (acc[cat] || 0) + val;
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

        {/* Inventory Table (Perfect Alignment) */}
        <div className="print:mt-12">
           <div className="flex items-center justify-between mb-4 border-b border-slate-900 pb-2">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Stock Inventory Ledger</h3>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em]">Data Verified per {new Date().toLocaleDateString('id-ID')}</p>
           </div>
           <table className="w-full text-left border-collapse">
              <thead>
                 <tr className="border-b border-slate-200">
                    <th className="py-4 text-[10px] font-black uppercase tracking-widest text-slate-900 w-[40%]">Item Description</th>
                    <th className="py-4 text-[10px] font-black uppercase tracking-widest text-slate-900 w-[20%]">Category</th>
                    <th className="py-4 text-[10px] font-black uppercase tracking-widest text-center text-slate-900 w-[15%]">Stock</th>
                    <th className="py-4 text-[10px] font-black uppercase tracking-widest text-right text-slate-900 w-[25%]">Asset Value</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                 {items.map((item) => {
                    const currentStock = Number(item.stock_quantity) || 0;
                    const itemValue = currentStock * item.price_per_unit;

                    return (
                     <tr key={item.id} className="print:break-inside-avoid">
                         <td className="py-5 pr-4">
                           <p className="text-[11px] font-black text-slate-900">{item.name}</p>
                           {item.related_services && item.related_services.length > 0 && (
                             <p className="text-[8px] text-slate-400 mt-1 font-medium italic">Integrated for: {item.related_services.join(' • ')}</p>
                           )}
                           {currentStock <= item.min_threshold && <p className="text-[8px] font-black text-red-600 uppercase mt-1 tracking-tighter">! Critical Stock Level</p>}
                         </td>
                         <td className="py-5">
                            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">{item.category}</span>
                         </td>
                         <td className="py-5 text-center">
                           <p className="text-[11px] font-black text-slate-900">{currentStock.toLocaleString('id-ID')} <span className="text-[9px] text-slate-400 font-bold uppercase pl-0.5">{item.unit}</span></p>
                         </td>
                         <td className="py-5 text-right">
                           <p className="text-[11px] font-black text-slate-900">Rp {itemValue.toLocaleString('id-ID')}</p>
                           <p className="text-[8px] text-slate-400 font-medium">unit price @ {item.price_per_unit.toLocaleString('id-ID')}</p>
                         </td>
                     </tr>
                    );
                 })}
              </tbody>
           </table>
        </div>

        {/* Footer & Signatures - Only on Print */}
        <div className="hidden print:block mt-12 space-y-8">
           <div className="border-t border-slate-200 pt-6">
              <p className="text-[9px] font-bold text-slate-900 uppercase tracking-widest mb-4 italic underline">Catatan & Persetujuan Audit:</p>
              <div className="grid grid-cols-3 gap-8">
                 <div className="space-y-1 text-center">
                    <p className="text-[8px] font-bold text-slate-400 uppercase">Dibuat Oleh,</p>
                    <div className="h-20 border-b border-slate-200" />
                    <p className="text-[10px] font-bold text-slate-900 pt-2">Logistics Staff</p>
                 </div>
                 <div className="space-y-1 text-center">
                    <p className="text-[8px] font-bold text-slate-400 uppercase">Diperiksa Oleh,</p>
                    <div className="h-20 border-b border-slate-200" />
                    <p className="text-[10px] font-bold text-slate-900 pt-2">Clinic Manager</p>
                 </div>
                 <div className="space-y-1 text-center">
                    <p className="text-[8px] font-bold text-slate-400 uppercase">Disetujui Oleh,</p>
                    <div className="h-20 border-b border-slate-200" />
                    <p className="text-[10px] font-bold text-slate-900 pt-2">Operational Director</p>
                 </div>
              </div>
           </div>
           <div className="flex justify-between items-center text-[8px] text-slate-400 border-t pt-4">
              <p>Dicetak pada: {new Date().toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })} | Dokumen Internal Rahasia</p>
              <p>Serene Clinical Inventory Management System</p>
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

function ReportKpiCard({ icon, label, value, sub, color }: { icon: any, label: string, value: string, sub: string, color: string }) {
  const bgMap: Record<string, string> = { slate: 'bg-slate-50', red: 'bg-red-50', indigo: 'bg-indigo-50' };
  return (
    <div className="bg-white p-10 rounded-[40px] border border-outline-variant shadow-sm relative overflow-hidden flex items-center gap-8">
       <div className={`w-16 h-16 rounded-3xl ${bgMap[color] || 'bg-surface-variant/20'} flex items-center justify-center shrink-0`}>
          {icon}
       </div>
       <div>
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">{label}</p>
          <h3 className="text-2xl font-serif text-on-surface whitespace-nowrap">{value}</h3>
          <p className="text-[9px] text-on-surface-variant font-bold uppercase tracking-tighter opacity-60">{sub}</p>
       </div>
    </div>
  );
}
