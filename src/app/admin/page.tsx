"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import {
  getAllAppointments,
  adminUpdateAppointmentStatus,
  adminUpdateAppointmentNotes,
  adminCreateInvoice,
  adminIncrementPoints,
  adminDeductInventory,
} from "@/app/actions/admin";
import { 
  Users, Calendar, Clock, LogOut, Sparkles, Loader2, Stethoscope, X, Droplets, 
  AlertCircle, FileText, Save, CreditCard, Receipt, Scissors, UserX, Package, 
  Layers, ShieldAlert, BarChart3, Settings, Tag, ChevronRight, LayoutDashboard,
  ExternalLink, TrendingUp, Wallet, ArrowUpRight, Search
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

type Appointment = {
  id: string;
  user_id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  notes: string;
  guest_name: string | null;
  guest_email: string | null;
  profiles: { 
    full_name: string;
    skin_type: string;
    allergies: string;
    phone: string;
    loyalty_points: number;
    member_status: string;
    member_id?: string;
  } | null;
  services: { 
    name: string, 
    price: string,
    category: string,
    materials_used: string;
    promo_discount_percent: number;
  } | null;
  specialists: { name: string } | null;
};

type Profile = {
  id: string;
  full_name: string;
  role: string;
};

export default function AdminDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [clinicalNotes, setClinicalNotes] = useState("");
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();

  const fetchData = useCallback(async () => {
    try {
      const appts = await getAllAppointments();
      if (appts) setAppointments(appts as unknown as Appointment[]);
    } catch (e) {
      console.error("Failed to fetch dashboard data:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    async function checkAdminAndFetch() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (!profile || (profile.role !== "admin" && profile.role !== "staff")) { router.push("/dashboard"); return; }
      setUserProfile(profile as Profile);
      fetchData();
    }
    checkAdminAndFetch();
  }, [supabase, router, fetchData]);

  const updateStatus = async (id: string, newStatus: string) => {
    setIsProcessing(true);
    try {
      await adminUpdateAppointmentStatus(id, newStatus);
      await fetchData();
    } catch (e) { console.error(e); }
    setIsProcessing(false);
  };

  const getDiscountAmount = (price: number, service: Appointment['services']) => {
    if (!service) return 0;
    const promoRate = service.promo_discount_percent || 0;
    return price * (promoRate / 100);
  };

  const handleCheckout = async (paymentMethod: string) => {
    if (!selectedAppt) return;
    setIsProcessing(true);
    try {
      const basePrice = parseInt(selectedAppt.services?.price || "0");
      const discount = getDiscountAmount(basePrice, selectedAppt.services);
      const finalAmount = basePrice - discount;

      const tier = (selectedAppt.profiles?.member_status || "basic").toLowerCase();
      let pointRate = 0.005;
      if (tier === 'silver') pointRate = 0.01;
      if (tier === 'gold') pointRate = 0.02;
      if (tier === 'platinum') pointRate = 0.03;
      const earnedPoints = Math.floor(finalAmount * pointRate);

      await adminCreateInvoice({
        appointment_id: selectedAppt.id,
        total_amount: finalAmount,
        discount_amount: discount,
        payment_method: paymentMethod,
        payment_status: 'paid',
      });

      if (selectedAppt.user_id) {
        await adminIncrementPoints(selectedAppt.user_id, earnedPoints);
      }

      await adminUpdateAppointmentStatus(selectedAppt.id, 'completed');
      await adminDeductInventory(selectedAppt.id);

      setIsCheckoutOpen(false);
      setSelectedAppt(null);
      await fetchData();
    } catch (e) { console.error("Checkout error:", e); }
    setIsProcessing(false);
  };

  const saveDiagnosis = async () => {
    if (!selectedAppt) return;
    setIsProcessing(true);
    try {
      await adminUpdateAppointmentNotes(selectedAppt.id, clinicalNotes);
      await fetchData();
      setSelectedAppt(null);
    } catch (e) { console.error(e); }
    setIsProcessing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'consultation': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'treatment': return 'bg-violet-50 text-violet-700 border-violet-100';
      case 'completed': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'no_show': return 'bg-slate-900 text-white border-slate-900';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]"><motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }} className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white"><Sparkles className="animate-pulse"/></motion.div></div>;

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col lg:flex-row font-sans text-slate-900">
      {/* SIDEBAR - PREMIUM REFACTORED */}
      <aside className={`fixed inset-y-0 left-0 w-80 bg-white border-r border-slate-100 flex flex-col z-50 transition-all duration-500 lg:translate-x-0 ${isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}`}>
        <div className="p-10 flex flex-col grow">
          <div className="flex justify-between items-center mb-12">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg shadow-slate-200">
                <Sparkles size={20} />
              </div>
              <span className="text-2xl font-serif font-black tracking-tighter text-slate-900">SERENE</span>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-slate-400 hover:text-slate-900"><X size={24} /></button>
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
            
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-300 mt-10 mb-4 px-4">Navigation</p>
            <Link href="/"><NavItem icon={<ArrowUpRight size={20} />} label="Back to Website" active={false} /></Link>
          </nav>

          <div className="mt-auto">
             <div className="bg-slate-50 p-6 rounded-4xl mb-8 group cursor-pointer hover:bg-slate-900 transition-all duration-500">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-900 group-hover:bg-slate-800 group-hover:text-white group-hover:border-transparent transition-all">{userProfile?.full_name?.[0]}</div>
                   <div>
                      <p className="text-xs font-black text-slate-900 group-hover:text-white transition-colors uppercase tracking-widest">{userProfile?.full_name}</p>
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
               <h1 className="font-serif text-5xl lg:text-6xl text-slate-900 tracking-tighter">Queue Control</h1>
               <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.25em]">Live Clinical Operations</p>
               </div>
            </div>
            
            <div className="flex items-center gap-4">
               <div className="bg-amber-50 px-6 py-3 rounded-2xl border border-amber-100 flex items-center gap-3 shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Waiting: </span>
                  <span className="text-sm font-black text-amber-900">{appointments.filter(a => a.status === 'waiting').length}</span>
               </div>
               <div className="bg-violet-50 px-6 py-3 rounded-2xl border border-violet-100 flex items-center gap-3 shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
                  <span className="text-[10px] font-black text-violet-700 uppercase tracking-widest">In Treatment: </span>
                  <span className="text-sm font-black text-violet-900">{appointments.filter(a => a.status === 'treatment' || a.status === 'consultation').length}</span>
               </div>
               <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-4 bg-white rounded-2xl border border-slate-100 shadow-sm text-slate-900"><Layers size={20}/></button>
            </div>
        </header>

        <div className="relative mb-12">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
          <input 
            type="text" 
            placeholder="Search queue by name or Member ID..." 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)} 
            className="w-full pl-16 pr-8 py-6 rounded-3xl border border-slate-100 bg-white focus:border-slate-900 outline-none text-sm transition-all shadow-sm" 
          />
        </div>



        {(() => {
          const filtered = appointments.filter(a => {
            const name = (a.profiles?.full_name || a.guest_name || "").toLowerCase();
            const mId = (a.profiles?.member_id || "").toLowerCase();
            const q = searchQuery.toLowerCase();
            return name.includes(q) || mId.includes(q);
          });
          
          return (
            <div className="bg-white rounded-4xl lg:rounded-5xl border border-slate-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)] overflow-hidden">
              {/* MOBILE CARD VIEW */}
              <div className="block lg:hidden divide-y divide-slate-50">
                 {filtered.map((appt) => (
                    <div key={appt.id} className="p-6 space-y-6 active:bg-slate-50 transition-colors" onClick={() => { setSelectedAppt(appt); setClinicalNotes(appt.notes || ""); }}>
                       <div className="flex justify-between items-start">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 font-serif text-lg">
                                {appt.profiles?.full_name?.[0] || appt.guest_name?.[0] || 'G'}
                             </div>
                             <div>
                                <div className="flex items-center gap-2">
                                   <p className="text-sm font-black text-slate-900">{appt.profiles?.full_name || appt.guest_name}</p>
                                   {appt.profiles?.member_id && <span className="text-[8px] font-black bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 uppercase">{appt.profiles.member_id}</span>}
                                </div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{appt.appointment_time}</p>
                             </div>
                          </div>
                          <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm ${getStatusColor(appt.status)}`}>{appt.status}</span>
                       </div>
                       
                       <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50">
                          <p className="text-xs font-black text-slate-900 mb-1">{appt.services?.name}</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{appt.profiles?.member_status || "Guest Patient"}</p>
                       </div>

                       <div className="flex items-center justify-between gap-3 pt-2">
                          <div className="flex bg-slate-50 p-1.5 rounded-xl border border-slate-100 grow justify-around">
                              <button onClick={(e) => { e.stopPropagation(); updateStatus(appt.id, 'waiting'); }} className={`p-2 rounded-lg ${appt.status === 'waiting' ? 'bg-white shadow-sm' : 'text-slate-300'}`}><Clock size={16}/></button>
                              <button onClick={(e) => { e.stopPropagation(); updateStatus(appt.id, 'consultation'); }} className={`p-2 rounded-lg ${appt.status === 'consultation' ? 'bg-white shadow-sm' : 'text-slate-300'}`}><Stethoscope size={16}/></button>
                              <button onClick={(e) => { e.stopPropagation(); updateStatus(appt.id, 'treatment'); }} className={`p-2 rounded-lg ${appt.status === 'treatment' ? 'bg-white shadow-sm' : 'text-slate-300'}`}><Scissors size={16}/></button>
                          </div>
                          {appt.status !== 'completed' && (
                             <button onClick={(e) => { e.stopPropagation(); setSelectedAppt(appt); setIsCheckoutOpen(true); }} className="w-12 h-12 bg-emerald-600 text-white rounded-2xl shadow-lg flex items-center justify-center shrink-0"><Receipt size={20}/></button>
                          )}
                       </div>
                    </div>
                 ))}
              </div>

              {/* DESKTOP TABLE VIEW */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-left min-w-[1100px]">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Patient Identity</th>
                      <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Treatment Plan</th>
                      <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Current Phase</th>
                      <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 text-right">Operational Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filtered.map((appt) => (
                      <tr key={appt.id} className="hover:bg-slate-50/30 transition-all cursor-pointer group" onClick={() => { setSelectedAppt(appt); setClinicalNotes(appt.notes || ""); }}>
                        <td className="px-10 py-8">
                          <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 font-serif text-xl group-hover:bg-white group-hover:shadow-md transition-all">
                               {appt.profiles?.full_name?.[0] || appt.guest_name?.[0] || 'G'}
                            </div>
                            <div>
                               <div className="flex items-center gap-3 mb-1">
                                  <p className="text-base font-black text-slate-900">{appt.profiles?.full_name || appt.guest_name}</p>
                                  {appt.profiles?.member_id && <span className="text-[9px] font-black bg-slate-100 px-2 py-0.5 rounded-md text-slate-600 uppercase tracking-tighter">{appt.profiles.member_id}</span>}
                               </div>
                               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                                  {appt.profiles?.member_status || "Guest"} <ChevronRight size={10}/> {appt.appointment_time}
                               </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-8">
                          <p className="text-sm font-black text-slate-900 mb-2">{appt.services?.name}</p>
                          <div className="flex flex-wrap gap-2">
                             {appt.services?.promo_discount_percent ? (
                               <div className="flex items-center gap-1.5 text-[9px] font-black text-red-600 uppercase tracking-widest bg-red-50 px-3 py-1 rounded-full border border-red-100"><Tag size={12}/> Promo {appt.services.promo_discount_percent}% Off</div>
                             ) : null}
                             {appt.services?.materials_used && <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-500 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full"><ShieldAlert size={12}/> Materials Verified</div>}
                          </div>
                        </td>
                        <td className="px-10 py-8">
                          <span className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border shadow-sm ${getStatusColor(appt.status)}`}>{appt.status}</span>
                        </td>
                        <td className="px-10 py-8 text-right">
                          <div className="flex justify-end gap-3" onClick={(e) => e.stopPropagation()}>
                            <div className="flex bg-slate-50 p-2 rounded-2xl border border-slate-100">
                                <ActionBtn active={appt.status === 'waiting'} onClick={() => updateStatus(appt.id, 'waiting')} icon={<Clock size={16} />} label="Wait" />
                                <ActionBtn active={appt.status === 'consultation'} onClick={() => updateStatus(appt.id, 'consultation')} icon={<Stethoscope size={16} />} label="Cons" />
                                <ActionBtn active={appt.status === 'treatment'} onClick={() => updateStatus(appt.id, 'treatment')} icon={<Scissors size={16} />} label="Treat" />
                                <ActionBtn active={appt.status === 'no_show'} onClick={() => updateStatus(appt.id, 'no_show')} icon={<UserX size={16} />} label="Miss" />
                            </div>
                            {appt.status !== 'completed' && appt.status !== 'cancelled' && appt.status !== 'no_show' && (
                               <button onClick={() => { setSelectedAppt(appt); setIsCheckoutOpen(true); }} className="w-12 h-12 bg-emerald-600 text-white rounded-2xl shadow-xl shadow-emerald-200 flex items-center justify-center hover:scale-110 active:scale-95 transition-all"><Receipt size={20}/></button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })()}

        {/* MODAL CHECKOUT - POLISHED */}
        <AnimatePresence>
           {isCheckoutOpen && selectedAppt && (
              <div className="fixed inset-0 z-100 flex items-center justify-center p-6">
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCheckoutOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
                 <motion.div initial={{ opacity: 0, y: 100, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 100, scale: 0.9 }} className="relative w-full max-w-xl bg-white rounded-[40px] lg:rounded-[64px] shadow-2xl p-8 lg:p-16 overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-bl-[200px] -mr-32 -mt-32 opacity-50" />
                    
                    <div className="relative text-center mb-12">
                       <div className="w-20 h-20 bg-emerald-600 rounded-4xl flex items-center justify-center text-white mx-auto mb-6 shadow-2xl shadow-emerald-200"><Receipt size={40}/></div>
                       <h2 className="font-serif text-4xl mb-2 text-slate-900">Final Settlement</h2>
                       <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.25em]">Review and Complete Transaction</p>
                    </div>
                    
                    <div className="bg-slate-50 p-10 rounded-[40px] mb-12 space-y-6">
                       <div className="flex justify-between items-center">
                          <span className="text-sm font-black text-slate-500 uppercase tracking-widest">{selectedAppt.services?.name}</span>
                          <span className="text-lg font-serif">Rp {parseInt(selectedAppt.services?.price || "0").toLocaleString('id-ID')}</span>
                       </div>
                       
                       {(() => {
                          const base = parseInt(selectedAppt.services?.price || "0");
                          const discount = getDiscountAmount(base, selectedAppt.services);
                          return (
                            <>
                              {discount > 0 && (
                                <div className="flex justify-between items-center text-red-600 bg-red-50 px-5 py-3 rounded-2xl border border-red-100">
                                   <span className="text-[10px] font-black uppercase tracking-widest">Promotional Benefit</span>
                                   <span className="font-serif">- Rp {discount.toLocaleString('id-ID')}</span>
                                </div>
                              )}
                              <div className="flex justify-between items-end pt-8 border-t border-slate-200/50">
                                 <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-2">Total Amount Due</p>
                                    <h3 className="text-5xl font-serif text-slate-900 tracking-tighter">Rp {(base - discount).toLocaleString('id-ID')}</h3>
                                 </div>
                                 <Sparkles className="text-emerald-500 mb-2" size={24}/>
                              </div>
                            </>
                          )
                       })()}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       {['Cash', 'Transfer', 'Card', 'E-Wallet'].map(method => (
                         <button key={method} onClick={() => handleCheckout(method)} disabled={isProcessing} className="py-5 rounded-3xl border border-slate-100 hover:border-slate-900 hover:bg-slate-900 hover:text-white transition-all text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-3 group">
                            <CreditCard size={18} className="text-slate-400 group-hover:text-white transition-colors"/> {method}
                         </button>
                       ))}
                    </div>
                 </motion.div>
              </div>
           )}

           {selectedAppt && !isCheckoutOpen && (
             <div className="fixed inset-0 z-100 flex items-center justify-center p-6">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedAppt(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-3xl bg-white rounded-[40px] lg:rounded-[56px] shadow-2xl flex flex-col max-h-[90vh] lg:max-h-[85vh] overflow-hidden">
                   <div className="p-12 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center relative">
                      <div className="flex items-center gap-6">
                         <div className="w-16 h-16 rounded-[28px] bg-slate-900 text-white flex items-center justify-center shadow-2xl shadow-slate-200"><Stethoscope size={32}/></div>
                         <div>
                            <h2 className="font-serif text-3xl text-slate-900 mb-1">{selectedAppt.profiles?.full_name || selectedAppt.guest_name}</h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Clinical Session Record</p>
                         </div>
                      </div>
                      <button onClick={() => setSelectedAppt(null)} className="p-3 bg-white rounded-2xl hover:text-red-500 transition-all border border-slate-100 shadow-sm"><X size={24}/></button>
                   </div>
                   
                   <div className="p-12 overflow-y-auto space-y-8 no-scrollbar">
                      <div className="grid grid-cols-2 gap-6">
                         <DetailCard label="Skin Analysis" value={selectedAppt.profiles?.skin_type || "Awaiting Scan"} icon={<Droplets className="text-blue-500"/>} color="bg-blue-50 text-blue-700"/>
                         <DetailCard label="Health Alerts" value={selectedAppt.profiles?.allergies || "Clear / No Allergies"} icon={<AlertCircle className="text-red-500"/>} color="bg-red-50 text-red-700"/>
                      </div>
                      
                      <div className="space-y-4">
                         <div className="flex justify-between items-center">
                            <p className="text-[10px] font-black text-slate-900 uppercase tracking-[0.25em] flex items-center gap-3"><FileText size={18} className="text-slate-400"/> Medical Findings</p>
                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Confidential Record</span>
                         </div>
                         <textarea 
                           value={clinicalNotes} 
                           onChange={(e) => setClinicalNotes(e.target.value)} 
                           className="w-full h-56 p-10 rounded-[40px] border border-slate-100 bg-slate-50/30 outline-none focus:border-slate-900 focus:bg-white transition-all text-base font-medium leading-relaxed" 
                           placeholder="Describe clinical observations, findings, and prescribed aftercare..." 
                         />
                      </div>
                   </div>

                   <div className="p-12 border-t border-slate-50 bg-slate-50/30 flex justify-end gap-4">
                      <button onClick={saveDiagnosis} disabled={isProcessing} className="bg-slate-900 text-white px-12 py-5 rounded-[28px] font-black uppercase tracking-[0.2em] text-[10px] flex items-center gap-3 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.2)] hover:scale-105 active:scale-95 transition-all">
                         {isProcessing ? <Loader2 className="animate-spin" size={18}/> : <><Save size={18}/> Sign & Archive Record</>}
                      </button>
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

function ActionBtn({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button onClick={(e) => { e.stopPropagation(); onClick(); }} className={`px-4 py-2 rounded-xl transition-all flex flex-col items-center gap-1 group/btn ${active ? "bg-white text-slate-900 shadow-sm border border-slate-100 scale-110" : "text-slate-300 hover:text-slate-900 hover:bg-white"}`}>
       {icon}
       <span className="text-[8px] font-black uppercase tracking-tighter">{label}</span>
    </button>
  );
}

function StatCard({ label, value, icon, color, isCurrency = false }: any) {
   return (
      <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
         <div className="flex justify-between items-start mb-6">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>{icon}</div>
            <ExternalLink size={14} className="text-slate-200 group-hover:text-slate-400 transition-colors"/>
         </div>
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-2">{label}</p>
         <h3 className="text-3xl font-serif text-slate-900">{isCurrency ? `Rp ${value.toLocaleString()}` : value}</h3>
      </div>
   )
}

function DetailCard({ label, value, icon, color }: any) {
   return (
      <div className="p-8 rounded-[36px] border border-slate-50 bg-slate-50/20 group hover:bg-white hover:shadow-xl transition-all duration-500">
         <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${color}`}>{icon}</div>
         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
         <p className="text-sm font-black text-slate-900">{value}</p>
      </div>
   )
}
