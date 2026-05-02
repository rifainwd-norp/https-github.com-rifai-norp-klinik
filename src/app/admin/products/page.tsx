"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import { 
  Plus, Search, Edit2, Loader2, Save, X, ArrowLeft,
  Package, Tag, List as ListIcon, LayoutGrid, AlertCircle, ShoppingBag,
  LayoutDashboard, Stethoscope, Layers, FileText, TrendingUp, Users, LogOut, ChevronRight,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

type Product = {
  inventory_id: string;
  name: string;
  stock: number;
  unit: string;
  category: string;
  selling_price: number;
  promo_discount: number;
  service_id: string | null;
};

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
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
      fetchProducts();
    }
    init();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    try {
      const { data: inventory } = await supabase.from("inventory").select("*").order("name");
      const { data: services } = await supabase.from("services").select("*").eq("category", "Skincare");

      const merged: Product[] = (inventory || []).map(inv => {
        const match = services?.find(s => s.name === inv.name);
        return {
          inventory_id: inv.id,
          name: inv.name,
          stock: inv.stock_quantity,
          unit: inv.unit,
          category: inv.category,
          selling_price: match ? parseInt(match.price) : 0,
          promo_discount: match ? match.promo_discount_percent : 0,
          service_id: match ? match.id : null
        };
      });

      setProducts(merged);
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  const handleUpdatePrice = async (p: Product, newPrice: number) => {
    setProducts(prev => prev.map(item => item.inventory_id === p.inventory_id ? { ...item, selling_price: newPrice } : item));
    if (p.service_id) {
      await supabase.from("services").update({ price: newPrice }).eq("id", p.service_id);
    } else {
      await supabase.from("services").insert([{ name: p.name, category: "Skincare", price: newPrice, promo_discount_percent: p.promo_discount, description: "Direct sync" }]);
    }
  };

  const handleUpdateDiscount = async (p: Product, newDisc: number) => {
    setProducts(prev => prev.map(item => item.inventory_id === p.inventory_id ? { ...item, promo_discount: newDisc } : item));
    if (p.service_id) {
      await supabase.from("services").update({ promo_discount_percent: newDisc }).eq("id", p.service_id);
    } else {
      await supabase.from("services").insert([{ name: p.name, category: "Skincare", price: p.selling_price, promo_discount_percent: newDisc, description: "Direct sync" }]);
    }
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  if (loading && products.length === 0) return <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]"><Loader2 className="animate-spin text-slate-900" size={40} /></div>;

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col lg:flex-row font-sans text-slate-900">
      {/* SHARED PREMIUM SIDEBAR */}
      <aside className="fixed inset-y-0 left-0 w-80 bg-white border-r border-slate-100 lg:flex flex-col z-50 hidden transition-all duration-500">
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
             <div className="bg-slate-50 p-6 rounded-[32px] mb-8 group cursor-pointer hover:bg-slate-900 transition-all duration-500">
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

      <main className="flex-1 p-6 lg:p-16 lg:ml-80 transition-all duration-500">
        <header className="mb-16 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="space-y-2">
               <h1 className="font-serif text-5xl lg:text-6xl text-slate-900 tracking-tighter">Products</h1>
               <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.25em]">Retail & Skincare Solutions</p>
            </div>
            
            <div className="flex items-center gap-4">
               <div className="bg-white p-1.5 rounded-2xl border border-slate-100 flex items-center gap-1 shadow-sm">
                  <button onClick={() => setViewMode("grid")} className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}><LayoutGrid size={18}/></button>
                  <button onClick={() => setViewMode("table")} className={`p-2.5 rounded-xl transition-all ${viewMode === 'table' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}><ListIcon size={18}/></button>
               </div>
               <button onClick={() => router.push("/admin/inventory")} className="bg-slate-900 text-white px-10 py-4 rounded-[20px] text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 shadow-2xl shadow-slate-200 active:scale-95 transition-all">
                  <Layers size={18} /> Manage Warehouse
               </button>
            </div>
        </header>

        <div className="relative mb-16">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
          <input type="text" placeholder="Search product line..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-16 pr-8 py-6 rounded-3xl border border-slate-100 bg-white focus:border-slate-900 outline-none text-sm transition-all shadow-sm" />
        </div>

        <AnimatePresence mode="wait">
          {viewMode === "table" ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white rounded-[48px] border border-slate-100 shadow-xl shadow-slate-100 overflow-hidden overflow-x-auto">
               <table className="w-full text-left min-w-[1000px]">
                  <thead className="bg-slate-50/50 border-b border-slate-100">
                     <tr>
                        <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Product Identity</th>
                        <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Warehouse Stock</th>
                        <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Retail Price (Rp)</th>
                        <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 text-center">Promo (%)</th>
                        <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 text-right">Status</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {filtered.map((p, i) => (
                        <tr key={p.inventory_id || i} className="hover:bg-slate-50/30 transition-all text-sm group">
                           <td className="px-10 py-8">
                              <p className="font-black text-slate-900 text-base mb-1">{p.name}</p>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{p.category}</p>
                           </td>
                           <td className="px-10 py-8">
                              <div className="flex items-center gap-3">
                                 <div className={`w-2.5 h-2.5 rounded-full ${p.stock > 10 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`} />
                                 <span className="font-black text-slate-700">{p.stock} <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{p.unit}</span></span>
                              </div>
                           </td>
                           <td className="px-10 py-8">
                              <div className="flex items-center gap-2 group-hover:translate-x-2 transition-transform">
                                 <span className="text-[10px] font-black text-slate-300">Rp</span>
                                 <input type="number" value={p.selling_price} onChange={e => handleUpdatePrice(p, parseInt(e.target.value) || 0)} className="bg-transparent font-serif text-xl outline-none focus:text-slate-900 text-slate-500 w-40" />
                              </div>
                           </td>
                           <td className="px-10 py-8 text-center">
                              <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 px-5 py-2.5 rounded-2xl border border-red-100 shadow-sm">
                                 <input type="number" value={p.promo_discount} onChange={e => handleUpdateDiscount(p, parseInt(e.target.value) || 0)} className="bg-transparent font-black text-sm w-12 text-center outline-none" />
                                 <span className="text-[10px] font-black uppercase tracking-widest">%</span>
                              </div>
                           </td>
                           <td className="px-10 py-8 text-right">
                              {p.selling_price > 0 ? (
                                <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full uppercase tracking-[0.2em] border border-emerald-100 flex items-center justify-end gap-2 w-fit ml-auto shadow-sm"><ShoppingBag size={10}/> FOR SALE</span>
                              ) : (
                                <span className="text-[9px] font-black text-slate-400 bg-slate-50 px-4 py-1.5 rounded-full uppercase tracking-[0.2em] border border-slate-100 flex items-center justify-end gap-2 w-fit ml-auto"><AlertCircle size={10}/> INTERNAL ONLY</span>
                              )}
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((p, i) => (
                <motion.div layout key={p.inventory_id || i} className="bg-white rounded-[48px] p-12 border border-slate-100 hover:border-slate-900/10 transition-all shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 relative overflow-hidden group">
                   <div className="w-16 h-16 rounded-[24px] bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all duration-500 shadow-inner mb-10">
                      <Package size={32}/>
                   </div>
                   <h3 className="font-serif text-3xl text-slate-900 mb-2 group-hover:translate-x-1 transition-transform">{p.name}</h3>
                   <div className="flex items-center gap-3 mb-10">
                      <div className={`w-2 h-2 rounded-full ${p.stock > 10 ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Stock: {p.stock} {p.unit}</p>
                   </div>
                   
                   <div className="space-y-5 pt-8 border-t border-slate-50">
                      <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                         <span>Retail Price</span>
                         <span className="text-slate-900 text-lg font-serif">Rp {p.selling_price.toLocaleString('id-ID')}</span>
                      </div>
                      {p.promo_discount > 0 && (
                        <div className="flex justify-between items-center text-[10px] font-black text-red-600 bg-red-50 px-4 py-2 rounded-xl border border-red-100 uppercase tracking-widest shadow-sm">
                           <span className="flex items-center gap-2"><Tag size={12}/> Limited Promo</span>
                           <span>{p.promo_discount}% Benefit</span>
                        </div>
                      )}
                   </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
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
