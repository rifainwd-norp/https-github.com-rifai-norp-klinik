"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import { 
  Plus, Search, Edit2, Loader2, Save, X, ArrowLeft,
  LayoutDashboard, Stethoscope, Package, Layers, FileText, TrendingUp, Users, LogOut, ChevronRight,
  Sparkles, ShieldCheck, User, CreditCard, Award, CheckCircle2, AlertCircle, HeartPulse,
  Calendar, AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { getAllProfiles, updateMemberStatus as updateStatusAction } from "@/app/actions/admin";

type Profile = {
  id: string;
  full_name: string;
  role: string;
  member_status: string;
  loyalty_points: number;
  member_id?: string;
  total_spend?: number;
  last_visit?: string;
  skin_type?: string;
  allergies?: string;
  birth_date?: string;
};

export default function UsersClient() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
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
      loadData();
    }
    init();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const formatted = await getAllProfiles();
      setProfiles(formatted as Profile[]);
    } catch (err) { console.error(err); }
    setLoading(false);
  }

  const handleUpdateMemberStatus = async (userId: string, newStatus: string) => {
    setIsProcessing(true);
    try {
      await updateStatusAction(userId, newStatus);
      setProfiles(prev => prev.map(p => p.id === userId ? { ...p, member_status: newStatus } : p));
      showStatus('success', `Tier upgraded to ${newStatus}`);
    } catch (err) { showStatus('error', "Update failed"); }
    setIsProcessing(false);
  };

  const showStatus = (type: 'success' | 'error', text: string) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const getTierSuggestion = (spend: number) => {
    if (spend >= 10000000) return "platinum";
    if (spend >= 5000000) return "gold";
    if (spend >= 3000000) return "silver";
    return "basic";
  };

  const filtered = profiles.filter(p => 
    p.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (p.member_id && p.member_id.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading && profiles.length === 0) return <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]"><Loader2 className="animate-spin text-slate-900" size={40} /></div>;

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col lg:flex-row font-sans text-slate-900">
      {/* SHARED PREMIUM SIDEBAR */}
      <aside className="fixed inset-y-0 left-0 w-80 bg-white border-r border-slate-100 z-50 hidden lg:flex flex-col">
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
               <h1 className="font-serif text-5xl lg:text-6xl text-slate-900 tracking-tighter">Personnel Intelligence</h1>
               <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.25em]">Member Segmentation & Clinical Insights</p>
            </div>
            
            <div className="flex items-center gap-4">
               <div className="bg-white px-8 py-4 rounded-3xl border border-slate-100 shadow-sm">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Registry: </span>
                  <span className="text-sm font-black text-slate-900">{profiles.length}</span>
               </div>
            </div>
        </header>

        <div className="relative mb-12">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
          <input type="text" placeholder="Search by name, Member ID, or tier..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-16 pr-8 py-6 rounded-3xl border border-slate-100 bg-white focus:border-slate-900 outline-none text-sm transition-all shadow-sm" />
        </div>

        {/* PROFILE LIST - EXECUTIVE POLISH */}
        <div className="space-y-6">
          {filtered.map((profile) => (
            <motion.div layout key={profile.id} className="bg-white rounded-5xl p-10 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group flex flex-col lg:flex-row items-center gap-10">
              <div className="flex items-center gap-8 grow w-full">
                <div className="w-20 h-20 rounded-4xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 font-serif text-2xl relative shadow-inner group-hover:bg-slate-900 group-hover:text-white transition-all duration-500">
                  {profile.full_name?.[0]}
                  {profile.role === 'admin' && (
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-slate-900 text-white rounded-full border-4 border-white flex items-center justify-center shadow-lg group-hover:bg-white group-hover:text-slate-900 transition-colors">
                       <ShieldCheck size={14}/>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4 grow">
                   <div>
                      <div className="flex items-center gap-3 mb-1">
                         <h3 className="font-serif text-3xl text-slate-900">{profile.full_name}</h3>
                         <span className="text-[10px] font-black bg-slate-100 text-slate-900 px-3 py-1 rounded-lg uppercase tracking-widest">{profile.member_id || `SRN-${profile.id.slice(0,4).toUpperCase()}`}</span>
                         <span className="text-[9px] font-black text-slate-400 border border-slate-100 px-3 py-1 rounded-full uppercase tracking-widest">{profile.role}</span>
                      </div>
                      <div className="flex items-center gap-2">
                         <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${profile.member_status === 'platinum' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                            {profile.member_status} Tier
                         </span>
                         {profile.birth_date && <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-1 ml-2"><Calendar size={12}/> {profile.birth_date}</span>}
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-50">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500"><HeartPulse size={14}/></div>
                         <div>
                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Skin Profile</p>
                            <p className="text-xs font-black text-slate-700">{profile.skin_type || "Awaiting Scan"}</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center text-red-500"><AlertCircle size={14}/></div>
                         <div>
                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Allergies</p>
                            <p className="text-xs font-black text-red-600 truncate max-w-[150px]">{profile.allergies || "Clear / None"}</p>
                         </div>
                      </div>
                   </div>
                </div>
              </div>

              {/* SPEND ANALYTICS */}
              <div className="flex items-center gap-12 px-12 border-l border-slate-50 w-full lg:w-auto justify-between lg:justify-start">
                 <div className="text-center lg:text-left">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1 flex items-center gap-2 justify-center lg:justify-start"><CreditCard size={12}/> Gross Spend</p>
                    <p className="text-2xl font-serif text-slate-900">Rp {profile.total_spend?.toLocaleString('id-ID') || "0"}</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">ID: {profile.member_id || `SRN-${profile.id.slice(0,4).toUpperCase()}`}</p>
                 </div>
                 <div className="text-center lg:text-left">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1 flex items-center gap-2 justify-center lg:justify-start"><TrendingUp size={12}/> Growth Sug.</p>
                    <p className={`text-xs font-black uppercase tracking-widest ${getTierSuggestion(profile.total_spend || 0) !== profile.member_status ? 'text-primary' : 'text-slate-300'}`}>
                       {getTierSuggestion(profile.total_spend || 0) !== profile.member_status ? `Upgrade: ${getTierSuggestion(profile.total_spend || 0)}` : 'Optimal Level'}
                    </p>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Last: {profile.last_visit || 'No Record'}</p>
                 </div>
              </div>

              {/* TIER CONTROL */}
              <div className="flex flex-col gap-2 w-full lg:w-56 bg-slate-50 p-4 rounded-4xl border border-slate-100">
                 <div className="grid grid-cols-2 gap-2">
                    {["basic", "silver", "gold", "platinum"].map(tier => (
                        <button 
                          key={tier} 
                          onClick={() => handleUpdateMemberStatus(profile.id, tier)}
                          disabled={isProcessing}
                          className={`px-4 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${profile.member_status === tier ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' : 'bg-white text-slate-400 hover:text-slate-900'}`}
                        >
                          {tier}
                        </button>
                    ))}
                 </div>
              </div>
            </motion.div>
          ))}
        </div>

        <AnimatePresence>
           {statusMsg && (
             <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className={`fixed bottom-12 right-12 z-100 px-10 py-6 rounded-4xl shadow-2xl flex items-center gap-5 border ${statusMsg.type === 'success' ? 'bg-slate-900 text-white border-slate-800' : 'bg-red-600 text-white border-red-500'}`}>
                {statusMsg.type === 'success' ? <CheckCircle2 className="text-emerald-400" size={24}/> : <AlertTriangle size={24}/>}
                <span className="text-[10px] font-black uppercase tracking-[0.25em]">{statusMsg.text}</span>
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
