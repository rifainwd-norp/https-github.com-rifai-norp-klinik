"use client";

import { useState, useEffect } from "react";
export const dynamic = 'force-dynamic';
import { createClient } from "@/utils/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import { 
  Plus, Search, Edit2, Trash2, Loader2, Save, X, ArrowLeft,
  LayoutDashboard, Stethoscope, Package, Layers, FileText, TrendingUp, Users, LogOut, ChevronRight,
  Sparkles, Star, MessageSquare, AlertTriangle, CheckCircle2, UserPlus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

type Specialist = {
  id: string;
  name: string;
  role: string;
  bio: string;
  image_url: string;
  avg_rating?: number;
  total_reviews?: number;
};

export default function SpecialistManagement() {
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [formData, setFormData] = useState({
    name: "", role: "", bio: "", image_url: ""
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
      fetchSpecialists();
    }
    init();
  }, []);

  async function fetchSpecialists() {
    setLoading(true);
    const { data: specs } = await supabase.from("specialists").select("*").order('name', { ascending: true });
    const { data: ratings } = await supabase.from("appointments").select("specialist_id, rating").not("rating", "is", null);
    
    if (specs) {
      const formatted = specs.map(s => {
        const sRatings = ratings?.filter(r => r.specialist_id === s.id) || [];
        const avg = sRatings.length > 0 ? sRatings.reduce((acc, curr) => acc + (curr.rating || 0), 0) / sRatings.length : 0;
        return { ...s, avg_rating: avg, total_reviews: sRatings.length };
      });
      setSpecialists(formatted);
    }
    setLoading(false);
  }

  const handleSave = async () => {
    setIsProcessing(true);
    if (editingId) {
      await supabase.from("specialists").update(formData).eq("id", editingId);
      showStatus('success', "Expert profile refined");
    } else {
      await supabase.from("specialists").insert([formData]);
      showStatus('success', "New clinical expert onboarded");
    }
    resetForm();
    await fetchSpecialists();
    setIsProcessing(false);
  };

  const executeDelete = async () => {
    if (!deleteTarget) return;
    setIsProcessing(true);
    await supabase.from("specialists").delete().eq("id", deleteTarget);
    showStatus('success', "Specialist archived");
    await fetchSpecialists();
    setIsProcessing(false);
    setDeleteTarget(null);
  };

  const showStatus = (type: 'success' | 'error', text: string) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const resetForm = () => { setIsAdding(false); setEditingId(null); setFormData({ name: "", role: "", bio: "", image_url: "" }); };

  if (loading && specialists.length === 0) return <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]"><Loader2 className="animate-spin text-slate-900" size={40} /></div>;

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col lg:flex-row font-sans text-slate-900">
      {/* SHARED PREMIUM SIDEBAR */}
      <aside className="fixed inset-y-0 left-0 w-80 bg-white border-r border-slate-100 flex-col z-50 hidden lg:flex">
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

      <main className="flex-1 p-6 lg:p-16 lg:ml-80 transition-all duration-500">
        <header className="mb-16 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="space-y-2">
               <h1 className="font-serif text-5xl lg:text-6xl text-slate-900 tracking-tighter">Clinical Experts</h1>
               <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.25em]">Medical Personnel Performance</p>
            </div>
            
            <button onClick={() => setIsAdding(true)} className="bg-slate-900 text-white px-10 py-4 rounded-[20px] text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 shadow-2xl shadow-slate-200 active:scale-95 transition-all">
               <UserPlus size={18} /> Onboard Expert
            </button>
        </header>

        {/* SPECIALIST GRID - EXECUTIVE POLISH */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {specialists.map((spec) => (
            <motion.div key={spec.id} layout className="bg-white rounded-[56px] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden flex flex-col">
              <div className="aspect-4/5 relative overflow-hidden">
                <Image src={spec.image_url || "/images/hero.png"} alt={spec.name} fill sizes="400px" className="object-cover group-hover:scale-110 transition-transform duration-1000 grayscale group-hover:grayscale-0" />
                
                <div className="absolute top-8 right-8 flex gap-3 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                  <button onClick={() => { setEditingId(spec.id); setFormData({...spec}); setIsAdding(true); }} className="p-4 bg-white/90 backdrop-blur-xl rounded-2xl text-slate-900 shadow-2xl hover:bg-slate-900 hover:text-white transition-all"><Edit2 size={18}/></button>
                  <button onClick={() => setDeleteTarget(spec.id)} className="p-4 bg-white/90 backdrop-blur-xl rounded-2xl text-red-500 shadow-2xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={18}/></button>
                </div>

                <div className="absolute bottom-8 left-8 right-8 p-6 bg-white/10 backdrop-blur-md rounded-4xl border border-white/20 shadow-2xl">
                   <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                         <Star size={16} className="text-amber-400" fill="currentColor" />
                         <span className="text-sm font-black text-white">{spec.avg_rating?.toFixed(1) || "5.0"}</span>
                      </div>
                      <span className="text-[10px] text-white/60 font-black uppercase tracking-widest">{spec.total_reviews} SESSIONS</span>
                   </div>
                </div>
              </div>

              <div className="p-10 text-center">
                <h3 className="font-serif text-3xl text-slate-900 mb-2 group-hover:text-primary transition-colors">{spec.name}</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-6">{spec.role}</p>
                <div className="flex items-center justify-center gap-4 pt-6 border-t border-slate-50">
                   <div className="flex items-center gap-1 text-[9px] font-black text-slate-900 uppercase tracking-widest"><TrendingUp size={12} className="text-emerald-500"/> Performance High</div>
                   <div className="w-1 h-1 rounded-full bg-slate-200" />
                   <div className="flex items-center gap-1 text-[9px] font-black text-slate-900 uppercase tracking-widest"><MessageSquare size={12} className="text-blue-500"/> Certified Expert</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* MODAL - MASTER STYLE */}
        <AnimatePresence>
           {isAdding && (
             <div className="fixed inset-0 z-100 flex items-center justify-center p-6">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={resetForm} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
                <motion.div initial={{ opacity: 0, y: 100, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 100, scale: 0.9 }} className="relative w-full max-w-2xl bg-white rounded-[56px] shadow-2xl p-16 overflow-y-auto max-h-[90vh]">
                   <div className="flex justify-between items-center mb-12">
                      <h2 className="font-serif text-4xl text-slate-900">{editingId ? "Refine Expert" : "New Expert Profile"}</h2>
                      <button onClick={resetForm} className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-red-500 transition-all"><X size={24}/></button>
                   </div>
                   <div className="space-y-8">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Full Name & Title</label>
                          <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-8 py-5 rounded-3xl border border-slate-100 bg-slate-50/50 outline-none focus:bg-white focus:border-slate-900 transition-all text-sm font-black" placeholder="Dr. Sarah Johnson, Sp.KK" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Clinical Specialty</label>
                          <input type="text" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full px-8 py-5 rounded-3xl border border-slate-100 bg-slate-50/50 outline-none focus:bg-white focus:border-slate-900 transition-all text-sm font-black" placeholder="Lead Dermatologist" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Professional Biography</label>
                          <textarea value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} className="w-full px-8 py-5 rounded-3xl border border-slate-100 bg-slate-50/50 outline-none focus:bg-white focus:border-slate-900 transition-all text-sm font-medium h-32 resize-none" placeholder="Clinical expertise, background and certifications..." />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Profile Image Asset URL</label>
                          <input type="text" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} className="w-full px-8 py-5 rounded-3xl border border-slate-100 bg-slate-50/50 outline-none focus:bg-white focus:border-slate-900 transition-all text-sm font-black" placeholder="https://cloud.storage/specialist-01.png" />
                       </div>
                      <button onClick={handleSave} disabled={isProcessing} className="w-full bg-slate-900 text-white py-6 rounded-[28px] font-black uppercase tracking-[0.25em] text-[10px] flex items-center justify-center gap-3 shadow-2xl shadow-slate-200 hover:scale-[1.02] active:scale-95 transition-all">
                         {isProcessing ? <Loader2 className="animate-spin" size={18}/> : <><Save size={18} /> Update Professional Registry</>}
                      </button>
                   </div>
                </motion.div>
             </div>
           )}

           {statusMsg && (
             <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className={`fixed bottom-12 right-12 z-100 px-10 py-6 rounded-4xl shadow-2xl flex items-center gap-5 border ${statusMsg.type === 'success' ? 'bg-slate-900 text-white border-slate-800' : 'bg-red-600 text-white border-red-500'}`}>
                {statusMsg.type === 'success' ? <CheckCircle2 className="text-emerald-400" size={24}/> : <AlertTriangle size={24}/>}
                <span className="text-[10px] font-black uppercase tracking-[0.25em]">{statusMsg.text}</span>
             </motion.div>
           )}
        </AnimatePresence>

        {/* DELETE MODAL - MASTER STYLE */}
        <AnimatePresence>
          {deleteTarget && (
            <div className="fixed inset-0 z-100 flex items-center justify-center p-6">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteTarget(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-sm bg-white rounded-[56px] p-16 shadow-2xl text-center">
                <div className="w-20 h-20 bg-red-50 rounded-4xl flex items-center justify-center text-red-500 mx-auto mb-8 shadow-inner"><AlertTriangle size={40} /></div>
                <h3 className="font-serif text-3xl text-slate-900 mb-4 tracking-tighter">Archive Expert?</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed mb-10">This will remove the specialist from the clinical registry. Historical session data will be preserved but the profile will no longer be active.</p>
                <div className="flex flex-col gap-3">
                   <button onClick={executeDelete} disabled={isProcessing} className="w-full bg-red-600 text-white py-5 rounded-3xl font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-red-200 active:scale-95 transition-all">
                      {isProcessing ? <Loader2 className="animate-spin mx-auto" size={18}/> : "Decommission Expert"}
                   </button>
                   <button onClick={() => setDeleteTarget(null)} className="w-full bg-slate-50 text-slate-400 py-5 rounded-3xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-slate-100 transition-all">Cancel</button>
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
