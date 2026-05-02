"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import { 
  LogOut, 
  Sparkles,
  Loader2,
  Plus,
  Activity,
  Star,
  MessageSquare,
  Save,
  AlertCircle,
  LayoutDashboard,
  Calendar,
  History,
  Award,
  ChevronRight,
  HeartPulse,
  Droplets,
  X,
  ArrowUpRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

type Appointment = {
  id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  rating: number | null;
  feedback: string | null;
  services: { name: string, price: string, category: string } | null;
  specialists: { name: string } | null;
};

type UserProfile = {
  full_name: string;
  member_status: string;
  loyalty_points: number;
  member_id?: string;
  id: string;
  skin_type: string | null;
  allergies: string | null;
  role: string;
};

export default function PatientDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();

  const fetchDashboardData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { data: pData } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    if (pData) setProfile(pData as UserProfile);

    const { data: appts } = await supabase.from("appointments").select(`
      id, appointment_date, appointment_time, status, rating, feedback,
      services:service_id (name, price, category),
      specialists:specialist_id (name)
    `).eq("user_id", user.id).order('appointment_date', { ascending: false });

    if (appts) setAppointments(appts as unknown as Appointment[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const submitRating = async () => {
    if (!selectedAppt) return;
    setIsSubmitting(true);
    const { error } = await supabase.from("appointments").update({ rating, feedback }).eq("id", selectedAppt.id);
    if (!error) {
       setSelectedAppt(null);
       fetchDashboardData();
    }
    setIsSubmitting(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'cancelled': return 'bg-red-50 text-red-700 border-red-100';
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'treatment': return 'bg-violet-50 text-violet-700 border-violet-100';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]"><Loader2 className="animate-spin text-slate-900" size={40} /></div>;

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col lg:flex-row font-sans text-slate-900">
      {/* SHARED PREMIUM SIDEBAR (PATIENT VERSION) */}
      <aside className={`fixed inset-y-0 left-0 w-80 bg-white border-r border-slate-100 flex flex-col z-50 transition-all duration-500 lg:translate-x-0 ${isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}`}>
        <div className="p-10 flex flex-col grow">
          <div className="flex justify-between items-center mb-12">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg shadow-slate-200"><Sparkles size={20} /></div>
              <span className="text-2xl font-serif font-black tracking-tighter text-slate-900 uppercase">SERENE</span>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-slate-400 hover:text-slate-900"><X size={24} /></button>
          </div>

          <nav className="space-y-1.5 mb-10">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-300 mb-4 px-4">My Journey</p>
            <Link href="/dashboard"><NavItem icon={<LayoutDashboard size={20} />} label="My Portal" active={pathname === '/dashboard'} /></Link>
            <Link href="/booking"><NavItem icon={<Calendar size={20} />} label="New Booking" active={pathname === '/booking'} /></Link>
            <Link href="/specialist"><NavItem icon={<HeartPulse size={20} />} label="Clinical Experts" active={pathname === '/specialist'} /></Link>
            
            <Link href="/complete-profile"><NavItem icon={<Droplets size={20} />} label="Skin Analysis" active={pathname === '/complete-profile'} /></Link>

            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-300 mt-10 mb-4 px-4">Navigation</p>
            <Link href="/"><NavItem icon={<ArrowUpRight size={20} />} label="Back to Website" active={false} /></Link>
          </nav>

          <div className="mt-auto">
             <div className="bg-slate-50 p-6 rounded-4xl mb-8 group cursor-pointer hover:bg-slate-900 transition-all duration-500">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-900 group-hover:bg-slate-800 group-hover:text-white group-hover:border-transparent transition-all">{profile?.full_name?.[0]}</div>
                   <div>
                      <p className="text-xs font-black text-slate-900 group-hover:text-white transition-colors uppercase tracking-widest truncate max-w-[120px]">{profile?.full_name}</p>
                      <p className="text-[10px] font-bold text-slate-400 group-hover:text-slate-500 transition-colors uppercase tracking-widest">{profile?.member_status} Member</p>
                   </div>
                </div>
             </div>
             <button onClick={async () => { await supabase.auth.signOut(); router.push("/login"); }} className="w-full flex items-center justify-between px-6 py-4 rounded-2xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all text-[10px] font-black uppercase tracking-[0.2em]">
                Logout Portal <LogOut size={16} />
             </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-6 lg:p-16 lg:ml-80 transition-all duration-500">
        <header className="mb-16 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="space-y-2">
               <h1 className="font-serif text-5xl lg:text-6xl text-slate-900 tracking-tighter">Welcome Back, {profile?.full_name?.split(' ')[0]}</h1>
               <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.25em]">{profile?.member_status} Status Verified</p>
               </div>
            </div>
            <div className="flex gap-4">
               <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-4 bg-white rounded-2xl border border-slate-100 shadow-sm text-slate-900"><Activity size={20}/></button>
               <Link href="/booking" className="bg-slate-900 text-white px-10 py-5 rounded-[24px] text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 shadow-2xl shadow-slate-200 active:scale-95 transition-all">
                  <Plus size={18} /> Schedule Treatment
               </Link>
            </div>
        </header>

        {/* KPI GRID - EXECUTIVE STYLE */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
           <StatCard label="Member Identity" value={profile?.member_id || `SRN-${profile?.id.slice(0,4).toUpperCase()}`} sub="Unique Clinical ID" icon={<Award className="text-amber-500"/>} color="bg-amber-50" />
           <StatCard label="Clinical Profile" value={profile?.skin_type || "Awaiting Scan"} sub="Analysis Status" icon={<Droplets className="text-blue-500"/>} color="bg-blue-50" />
           <StatCard label="Current Status" value={profile?.member_status || "Basic"} sub="Membership Tier" icon={<Sparkles className="text-violet-500"/>} color="bg-violet-50" />
        </div>

        {profile?.skin_type === null && (
           <Link href="/complete-profile">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-16 p-10 bg-amber-50 border border-amber-100 rounded-[40px] flex flex-col md:flex-row items-center justify-between gap-8 group cursor-pointer hover:bg-amber-100 transition-all">
                 <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-amber-500 shadow-sm"><AlertCircle size={28}/></div>
                    <div>
                       <h3 className="font-serif text-xl text-amber-900 mb-1">Incomplete Medical Data</h3>
                       <p className="text-xs font-bold text-amber-700/60 uppercase tracking-widest">Complete your skin analysis for personalized treatment plans</p>
                    </div>
                 </div>
                 <ChevronRight className="text-amber-400 group-hover:translate-x-2 transition-transform" size={24}/>
              </motion.div>
           </Link>
        )}

        <div className="space-y-8">
           <div className="flex items-center justify-between mb-2">
              <h3 className="font-serif text-3xl text-slate-900">Treatment History</h3>
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Secure Records</p>
           </div>

           <div className="bg-white rounded-4xl lg:rounded-5xl border border-slate-100 shadow-sm overflow-hidden">
              {/* MOBILE CARD VIEW */}
              <div className="block lg:hidden divide-y divide-slate-50">
                 {appointments.map((appt) => (
                    <div key={appt.id} className="p-8 space-y-6">
                       <div className="flex justify-between items-start">
                          <div>
                             <p className="text-xs font-black text-slate-300 uppercase tracking-widest mb-1">{appt.appointment_date}</p>
                             <h4 className="text-lg font-black text-slate-900">{appt.services?.name}</h4>
                          </div>
                          <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${getStatusColor(appt.status)}`}>{appt.status}</span>
                       </div>
                       <div className="flex items-center justify-between pt-2">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Specialist: <span className="text-slate-900">{appt.specialists?.name}</span></p>
                          {appt.status === 'completed' && !appt.rating && (
                             <button onClick={() => setSelectedAppt(appt)} className="text-primary font-black text-[9px] uppercase tracking-widest border-b-2 border-primary border-dotted pb-0.5">Rate Session</button>
                          )}
                       </div>
                    </div>
                 ))}
              </div>

              {/* DESKTOP TABLE VIEW */}
              <div className="hidden lg:block overflow-x-auto">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="bg-slate-50/50 border-b border-slate-100">
                          <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Date & Session</th>
                          <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Status</th>
                          <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Clinical Expert</th>
                          <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 text-right">Feedback</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {appointments.map((appt) => (
                          <tr key={appt.id} className="hover:bg-slate-50/30 transition-colors">
                             <td className="px-10 py-8">
                                <p className="text-sm font-black text-slate-900 mb-1">{appt.services?.name}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{appt.appointment_date} • {appt.appointment_time}</p>
                             </td>
                             <td className="px-10 py-8">
                                <span className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border shadow-sm ${getStatusColor(appt.status)}`}>{appt.status}</span>
                             </td>
                             <td className="px-10 py-8 text-sm font-bold text-slate-500">{appt.specialists?.name}</td>
                             <td className="px-10 py-8 text-right">
                                {appt.status === 'completed' && !appt.rating ? (
                                   <button onClick={() => setSelectedAppt(appt)} className="bg-slate-900 text-white px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">Submit Feedback</button>
                                ) : (
                                   <div className="flex justify-end gap-1 text-amber-500">
                                      {[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < (appt.rating || 0) ? "currentColor" : "none"} />)}
                                   </div>
                                )}
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>

        {/* FEEDBACK MODAL */}
        <AnimatePresence>
           {selectedAppt && (
              <div className="fixed inset-0 z-100 flex items-center justify-center p-6">
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedAppt(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
                 <motion.div initial={{ opacity: 0, y: 100, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 100, scale: 0.9 }} className="relative w-full max-w-xl bg-white rounded-5xl lg:rounded-[64px] shadow-2xl p-10 lg:p-16 overflow-hidden">
                    <div className="text-center mb-12">
                       <div className="w-16 h-16 bg-amber-50 rounded-3xl flex items-center justify-center text-amber-500 mx-auto mb-6 shadow-sm"><Star size={32} fill="currentColor"/></div>
                       <h2 className="font-serif text-4xl mb-2 text-slate-900 tracking-tight">Rate Your Experience</h2>
                       <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.25em]">Session with {selectedAppt.specialists?.name}</p>
                    </div>

                    <div className="flex justify-center gap-3 mb-10">
                       {[1, 2, 3, 4, 5].map(s => (
                          <button key={s} onClick={() => setRating(s)} className={`w-14 h-14 lg:w-16 lg:h-16 rounded-[24px] transition-all flex items-center justify-center ${rating >= s ? "bg-amber-100 text-amber-500" : "bg-slate-50 text-slate-300"}`}><Star size={24} fill={rating >= s ? "currentColor" : "none"} /></button>
                       ))}
                    </div>

                    <div className="space-y-4 mb-10">
                       <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-4">Clinical Feedback (Optional)</p>
                       <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} className="w-full h-32 p-8 rounded-[32px] border border-slate-100 bg-slate-50/50 outline-none focus:border-slate-900 focus:bg-white transition-all text-sm font-medium leading-relaxed" placeholder="Share your experience with the treatment..." />
                    </div>

                    <button onClick={submitRating} disabled={isSubmitting} className="w-full bg-slate-900 text-white py-6 rounded-[28px] font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 shadow-2xl shadow-slate-200 active:scale-95 transition-all">
                       {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <><Save size={18}/> Finalize Review</>}
                    </button>
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

function StatCard({ label, value, sub, icon, color }: any) {
  return (
    <div className="bg-white p-10 rounded-5xl border border-slate-100 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-bl-[100px] -mr-16 -mt-16 opacity-10 group-hover:opacity-20 transition-all duration-700 ${color}`} />
      <div className="relative">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 ${color} shadow-sm`}>{icon}</div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-2">{label}</p>
        <h3 className="text-3xl font-serif text-slate-900 tracking-tighter mb-1">{value}</h3>
        <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{sub}</p>
      </div>
    </div>
  );
}
