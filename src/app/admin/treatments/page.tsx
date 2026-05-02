"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import { 
  Plus, Search, Edit2, Trash2, Loader2, Save, X, ArrowLeft,
  Scissors, Stethoscope, Sparkles, Droplets, Tag, LayoutGrid, List as ListIcon,
  LayoutDashboard, Package, Layers, FileText, TrendingUp, Users, LogOut, ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DeleteConfirmationModal } from "../inventory/page";
import Link from "next/link";

type Treatment = {
  id: string;
  name: string;
  category: string;
  price: string;
  duration_minutes: number;
  promo_discount_percent: number;
};

export default function TreatmentManagement() {
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [userProfile, setUserProfile] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: "", category: "Facial", price: "", duration_minutes: 60, promo_discount_percent: 0
  });

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
      fetchTreatments();
    }
    init();
  }, []);

  async function fetchTreatments() {
    const { data, error } = await supabase.from("services").select("*").neq("category", "Skincare").order("name");
    if (error) console.error(error);
    else setTreatments(data || []);
    setLoading(false);
  }

  const handleSave = async () => {
    setLoading(true);
    const payload = { ...formData, price: parseInt(formData.price) };
    if (editingId) await supabase.from("services").update(payload).eq("id", editingId);
    else await supabase.from("services").insert([payload]);
    await fetchTreatments();
    resetForm();
  };

  const handleInlineUpdate = async (id: string, updates: any) => {
    setTreatments(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    await supabase.from("services").update(updates).eq("id", id);
  };

  const resetForm = () => { setIsAdding(false); setEditingId(null); setFormData({ name: "", category: "Facial", price: "", duration_minutes: 60, promo_discount_percent: 0 }); };

  const filtered = treatments.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()));

  if (loading && treatments.length === 0) return <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]"><Loader2 className="animate-spin text-slate-900" size={40} /></div>;

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col lg:flex-row font-sans text-slate-900">
      {/* SHARED PREMIUM SIDEBAR */}
      <aside className="fixed inset-y-0 left-0 w-80 bg-white border-r border-slate-100 flex flex-col z-50 hidden lg:flex">
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
               <h1 className="font-serif text-5xl lg:text-6xl text-slate-900 tracking-tighter">Treatments</h1>
               <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.25em]">Clinical Procedure Protocol</p>
            </div>
            
            <div className="flex items-center gap-4">
               <div className="bg-white p-1.5 rounded-2xl border border-slate-100 flex items-center gap-1 shadow-sm">
                  <button onClick={() => setViewMode("grid")} className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}><LayoutGrid size={18}/></button>
                  <button onClick={() => setViewMode("table")} className={`p-2.5 rounded-xl transition-all ${viewMode === 'table' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}><ListIcon size={18}/></button>
               </div>
               <button onClick={() => setIsAdding(true)} className="bg-slate-900 text-white px-10 py-4 rounded-[20px] text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 shadow-2xl shadow-slate-200 active:scale-95 transition-all">
                  <Plus size={18} /> New Entry
               </button>
            </div>
        </header>

        <div className="relative mb-16">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
          <input type="text" placeholder="Search clinical catalog..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-16 pr-8 py-6 rounded-3xl border border-slate-100 bg-white focus:border-slate-900 outline-none text-sm transition-all shadow-sm" />
        </div>

        <AnimatePresence mode="wait">
          {viewMode === "grid" ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((t, i) => (
                <motion.div layout key={t.id || i} className="bg-white rounded-[48px] p-12 border border-slate-100 hover:border-slate-900/10 transition-all shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 relative overflow-hidden group">
                   <div className="flex justify-between items-start mb-10">
                      <div className="w-16 h-16 rounded-[24px] bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all duration-500 shadow-inner">
                         {t.category === 'Laser' ? <Sparkles size={32}/> : t.category === 'Peeling' ? <Droplets size={32}/> : <Stethoscope size={32}/>}
                      </div>
                      <button onClick={() => { setEditingId(t.id); setFormData({ ...t, price: t.price.toString() }); setIsAdding(true); }} className="p-4 text-slate-300 hover:text-slate-900 hover:bg-slate-50 rounded-2xl transition-all"><Edit2 size={18}/></button>
                   </div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-2">{t.category}</p>
                   <h3 className="font-serif text-3xl text-slate-900 mb-6 group-hover:translate-x-1 transition-transform">{t.name}</h3>
                   <div className="flex items-baseline gap-1 mb-10">
                      <span className="text-xs font-black text-slate-300 uppercase tracking-widest">IDR</span>
                      <span className="text-4xl font-serif text-slate-900">{parseInt(t.price).toLocaleString('id-ID')}</span>
                   </div>
                   <div className="pt-10 border-t border-slate-50 flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t.duration_minutes} MINS CLINICAL</span>
                      {t.promo_discount_percent > 0 && <span className="text-red-600 bg-red-50 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-100 shadow-sm animate-pulse">PROMO {t.promo_discount_percent}% OFF</span>}
                   </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white rounded-[48px] border border-slate-100 shadow-xl shadow-slate-100 overflow-hidden overflow-x-auto">
               <table className="w-full text-left min-w-[900px]">
                  <thead className="bg-slate-50/50 border-b border-slate-100">
                     <tr>
                        <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Treatment Identity</th>
                        <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Base Price (Rp)</th>
                        <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 text-center">Benefit (%)</th>
                        <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {filtered.map((t, i) => (
                        <tr key={t.id || i} className="hover:bg-slate-50/30 transition-all text-sm group">
                           <td className="px-10 py-8">
                              <p className="font-black text-slate-900 text-base mb-1">{t.name}</p>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t.category}</p>
                           </td>
                           <td className="px-10 py-8">
                              <div className="flex items-center gap-2 group-hover:translate-x-2 transition-transform">
                                 <span className="text-[10px] font-black text-slate-300">Rp</span>
                                 <input type="number" value={t.price} onChange={e => handleInlineUpdate(t.id, { price: e.target.value })} className="bg-transparent font-serif text-xl outline-none focus:text-slate-900 text-slate-500 w-40" />
                              </div>
                           </td>
                           <td className="px-10 py-8 text-center">
                              <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 px-5 py-2.5 rounded-2xl border border-red-100 shadow-sm">
                                 <input type="number" value={t.promo_discount_percent} onChange={e => handleInlineUpdate(t.id, { promo_discount_percent: parseInt(e.target.value) || 0 })} className="bg-transparent font-black text-sm w-12 text-center outline-none" />
                                 <span className="text-[10px] font-black uppercase tracking-widest">%</span>
                              </div>
                           </td>
                           <td className="px-10 py-8 text-right">
                              <button onClick={() => { setEditingId(t.id); setFormData({ ...t, price: t.price.toString() }); setIsAdding(true); }} className="p-4 text-slate-300 hover:text-slate-900 transition-all"><Edit2 size={20}/></button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isAdding && (
            <div className="fixed inset-0 z-100 flex items-center justify-center p-6">
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={resetForm} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
               <motion.div initial={{ opacity: 0, y: 100, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 100, scale: 0.9 }} className="relative w-full max-w-2xl bg-white rounded-[56px] shadow-2xl p-16 overflow-y-auto max-h-[90vh]">
                  <div className="flex justify-between items-center mb-12">
                     <h2 className="font-serif text-4xl text-slate-900">{editingId ? "Refine Treatment" : "New Catalog Entry"}</h2>
                     <button onClick={resetForm} className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-red-500 transition-all"><X size={24}/></button>
                  </div>
                  <div className="space-y-8">
                     <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Treatment Name</label><input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-8 py-5 rounded-[24px] border border-slate-100 bg-slate-50/50 outline-none focus:bg-white focus:border-slate-900 transition-all text-sm font-black" /></div>
                        <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Clinical Category</label><select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-8 py-5 rounded-[24px] border border-slate-100 bg-slate-50/50 outline-none focus:bg-white focus:border-slate-900 transition-all text-sm font-black appearance-none"><option>Facial</option><option>Peeling</option><option>Injection</option><option>Laser</option></select></div>
                     </div>
                     <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Price (IDR)</label><input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full px-8 py-5 rounded-[24px] border border-slate-100 bg-slate-50/50 outline-none focus:bg-white focus:border-slate-900 transition-all text-sm font-black" /></div>
                        <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Duration (Mins)</label><input type="number" value={formData.duration_minutes} onChange={e => setFormData({...formData, duration_minutes: parseInt(e.target.value)})} className="w-full px-8 py-5 rounded-[24px] border border-slate-100 bg-slate-50/50 outline-none focus:bg-white focus:border-slate-900 transition-all text-sm font-black" /></div>
                     </div>
                     <div className="p-8 bg-red-50 rounded-[32px] border border-red-100 shadow-inner">
                        <label className="text-[10px] font-black uppercase tracking-widest text-red-600 mb-4 block">Promotional Benefit (%)</label>
                        <div className="flex items-center gap-4">
                           <input type="number" value={formData.promo_discount_percent} onChange={e => setFormData({...formData, promo_discount_percent: parseInt(e.target.value) || 0})} className="w-full px-8 py-5 rounded-[24px] border border-red-200 bg-white font-black text-red-600 outline-none focus:border-red-500 shadow-sm" />
                           <span className="text-3xl font-serif text-red-300">%</span>
                        </div>
                     </div>
                     <button onClick={handleSave} className="w-full bg-slate-900 text-white py-6 rounded-[28px] font-black uppercase tracking-[0.25em] text-[10px] flex items-center justify-center gap-3 shadow-2xl shadow-slate-200 hover:scale-[1.02] active:scale-95 transition-all"><Save size={18} /> Finalize Changes</button>
                  </div>
               </motion.div>
            </div>
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
