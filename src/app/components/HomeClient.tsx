"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import NextLink from "next/link";
import { 
  Sparkles, 
  ArrowRight, 
  LogOut,
  LayoutDashboard,
  User as UserIcon,
  X,
  Loader2,
  Camera,
  Share2,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  ChevronRight,
  Stethoscope,
  Heart,
  Menu,
  AlertCircle,
  ChevronDown,
  UserCircle,
  Settings,
  Calendar,
  User,
  CreditCard,
  History
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { User as SupabaseUser } from "@supabase/supabase-js";

// Types
type Service = {
  id: string;
  name: string;
  price: string;
  category: string;
  image_url: string;
  description: string;
};

type Specialist = {
  id: string;
  name: string;
  role: string;
  bio: string;
  image_url: string;
};

export default function HomeClient() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPortalDropdownOpen, setIsPortalDropdownOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  const [services, setServices] = useState<Service[]>([]);
  const [specialists, setSpecialists] = useState<Specialist[]>([]);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      const { data: sData } = await supabase.from("services").select("*").limit(4);
      const { data: specData } = await supabase.from("specialists").select("*").limit(3);
      if (sData) setServices(sData as Service[]);
      if (specData) setSpecialists(specData as Specialist[]);

      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        setUser(currentUser);
        const { data: profile } = await supabase.from("profiles").select("role, full_name").eq("id", currentUser.id).single();
        setUserRole(profile?.role || "patient");
        setUserName(profile?.full_name || currentUser.email);
      }
    }
    fetchData();

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsPortalDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [supabase]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single();
        if (profile?.role === "admin" || profile?.role === "staff") {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } }
        });
        if (error) throw error;
        alert("Registration successful! Please login.");
        setIsLogin(true);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserRole(null);
    setIsPortalDropdownOpen(false);
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] selection:bg-slate-900 selection:text-white font-sans text-slate-900 overflow-x-hidden">
      {/* EXECUTIVE NAVIGATION */}
      <nav className="fixed top-0 w-full z-50 px-4 md:px-6 py-6 md:py-8 flex justify-center pointer-events-none">
        <div className="max-w-7xl w-full bg-white/80 backdrop-blur-3xl border border-white/20 shadow-2xl rounded-3xl md:rounded-4xl px-6 md:px-8 h-16 md:h-20 flex justify-between items-center pointer-events-auto">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => router.push("/")}>
            <div className="w-8 h-8 md:w-10 md:h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-xl shadow-slate-200 group-hover:rotate-12 transition-transform duration-500">
              <Sparkles size={18} className="md:w-5 md:h-5" />
            </div>
            <span className="text-xl md:text-2xl font-serif font-black tracking-tighter uppercase">Serene</span>
          </div>

          <div className="hidden lg:flex items-center gap-12">
            {["Treatments", "Specialists", "Technology", "Contact"].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 hover:text-slate-900 transition-colors">{item}</a>
            ))}
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {user ? (
               /* PORTAL DROPDOWN - HIDDEN ON MOBILE */
               <div className="relative hidden sm:block" ref={dropdownRef}>
                  <button 
                    onClick={() => setIsPortalDropdownOpen(!isPortalDropdownOpen)}
                    className="flex items-center gap-4 bg-slate-900 text-white pl-3 pr-6 py-2 rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all"
                  >
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-white/10 flex items-center justify-center font-black text-xs md:text-sm border border-white/10 uppercase">{userName?.[0] || 'U'}</div>
                    <div className="text-left">
                       <p className="text-[8px] font-black uppercase tracking-[0.2em] text-white/50 leading-none mb-1">Accessing Portal</p>
                       <p className="text-[10px] font-black uppercase tracking-widest leading-none">My Account</p>
                    </div>
                    <ChevronDown size={14} className={`transition-transform duration-500 ${isPortalDropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {isPortalDropdownOpen && (
                      <motion.div initial={{ opacity: 0, y: 15, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 15, scale: 0.95 }} className="absolute right-0 mt-4 w-80 bg-white/95 backdrop-blur-3xl border border-slate-50 shadow-[0_40px_80px_-16px_rgba(0,0,0,0.15)] rounded-4xl overflow-hidden p-4 z-50">
                         <div className="p-5 bg-slate-900 rounded-3xl mb-4 flex items-center gap-4 shadow-xl">
                            <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center font-black text-sm border border-white/10 uppercase">{userName?.[0] || 'U'}</div>
                            <div>
                               <p className="text-sm font-black text-white truncate max-w-[140px] leading-none mb-1">{userName}</p>
                               <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest leading-none">Verified Profile</p>
                            </div>
                         </div>
                         <div className="space-y-1">
                            <DropdownItem href={userRole === 'admin' || userRole === 'staff' ? '/admin' : '/dashboard'} icon={<LayoutDashboard size={18} />} label="My Portal Dashboard" />
                            <DropdownItem href="/booking" icon={<Calendar size={18} />} label="Reserve Clinical Session" />
                            <DropdownItem href="/dashboard" icon={<History size={18} />} label="Treatment History" />
                            <DropdownItem href="/dashboard" icon={<CreditCard size={18} />} label="Serene Rewards" />
                            <div className="h-px bg-slate-50 my-4" />
                            <button onClick={handleSignOut} className="w-full flex items-center justify-between px-5 py-4 rounded-2xl text-red-500 hover:bg-red-50 transition-all text-[10px] font-black uppercase tracking-[0.3em] group">
                               End Session <LogOut size={16} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                         </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
               </div>
            ) : (
              /* LOGIN BUTTON - HIDDEN ON MOBILE */
              <button 
                onClick={() => setIsLoginModalOpen(true)}
                className="hidden sm:block bg-slate-900 text-white px-6 md:px-10 py-3 md:py-4 rounded-xl md:rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all"
              >
                Access Portal
              </button>
            )}
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-3 text-slate-900 hover:bg-slate-50 rounded-2xl transition-colors">
               <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE MENU OVERLAY */}
      <AnimatePresence>
         {isMobileMenuOpen && (
            <motion.div initial={{ opacity: 0, x: "100%" }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: "100%" }} className="fixed inset-0 z-100 bg-white p-8 flex flex-col">
               <div className="flex justify-between items-center mb-16">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white"><Sparkles size={20} /></div>
                     <span className="text-2xl font-serif font-black tracking-tighter uppercase">Serene</span>
                  </div>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-900"><X size={32} /></button>
               </div>
               
               <div className="space-y-12 overflow-y-auto pb-20">
                  <nav className="flex flex-col gap-6">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Explore Clinic</p>
                    {["Treatments", "Specialists", "Technology", "Contact"].map((item) => (
                      <a key={item} onClick={() => setIsMobileMenuOpen(false)} href={`#${item.toLowerCase()}`} className="text-5xl font-serif text-slate-900 tracking-tight">{item}</a>
                    ))}
                  </nav>

                  {user && (
                    <div className="space-y-4">
                       <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Member Account</p>
                       <div className="grid grid-cols-1 gap-3">
                          <MobilePortalLink href={userRole === 'admin' || userRole === 'staff' ? '/admin' : '/dashboard'} icon={<LayoutDashboard size={20}/>} label="My Portal Dashboard" />
                          <MobilePortalLink href="/booking" icon={<Calendar size={20}/>} label="New Clinical Session" />
                          <MobilePortalLink href="/complete-profile" icon={<UserCircle size={20}/>} label="Clinical Analysis" />
                          <button onClick={handleSignOut} className="flex items-center justify-between p-6 rounded-3xl bg-red-50 text-red-600 font-black text-[10px] uppercase tracking-widest mt-4">Sign Out <LogOut size={20}/></button>
                       </div>
                    </div>
                  )}
               </div>

               {!user && (
                  <div className="mt-auto flex flex-col gap-4">
                     <button onClick={() => { setIsMobileMenuOpen(false); setIsLoginModalOpen(true); }} className="w-full bg-slate-900 text-white py-6 rounded-[28px] text-[11px] font-black uppercase tracking-[0.25em] text-center shadow-2xl">Access Login</button>
                     <NextLink href="/booking" onClick={() => setIsMobileMenuOpen(false)} className="w-full border border-slate-100 py-6 rounded-[28px] text-[11px] font-black uppercase tracking-[0.25em] text-center">Book Now</NextLink>
                  </div>
               )}
            </motion.div>
         )}
      </AnimatePresence>

      {/* HERO SECTION */}
      <section className="relative min-h-[90vh] md:min-h-screen flex items-center pt-32 md:pt-40 pb-20 px-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] md:w-[800px] h-[400px] md:h-[800px] bg-slate-100 rounded-full -mr-48 md:-mr-96 -mt-48 md:-mt-96 opacity-30 blur-3xl -z-10" />
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-20 items-center">
           <div className="lg:col-span-7 space-y-8 md:space-y-12">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="inline-flex items-center gap-3 px-5 md:px-6 py-2 md:py-2.5 rounded-full bg-slate-50 border border-slate-100 text-slate-400">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.25em]">ISO 9001 Certified Clinical Care</span>
              </motion.div>
              
              <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="font-serif text-6xl sm:text-8xl md:text-9xl text-slate-900 leading-[0.95] tracking-tighter">
                Elegance in <br /> 
                <span className="italic font-normal text-slate-400">Precision.</span>
              </motion.h1>

              <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="max-w-xl text-slate-400 text-lg md:text-2xl font-medium leading-relaxed">
                Experience the convergence of medical excellence and aesthetic artistry. Redefining clinical care with a touch of tranquility.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-col sm:flex-row items-center gap-6 pt-4">
                <NextLink href="/booking" className="w-full sm:w-auto bg-slate-900 text-white px-10 md:px-12 py-5 md:py-6 rounded-3xl md:rounded-[28px] text-[10px] md:text-[11px] font-black uppercase tracking-[0.25em] flex items-center justify-center gap-4 shadow-2xl hover:scale-105 active:scale-95 transition-all">
                  Book Appointment <ArrowRight size={20} />
               </NextLink>
                <div className="flex items-center gap-4">
                   <div className="flex -space-x-3">
                      {[1,2,3].map(i => <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-slate-100 overflow-hidden shadow-lg"><Image src={`/images/hero.png`} alt="Client" width={40} height={40} className="object-cover" /></div>)}
                   </div>
                   <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">2k+ Happy<br/>Patients</p>
                </div>
              </motion.div>
           </div>

           <div className="lg:col-span-5 relative mt-12 lg:mt-0">
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.5, ease: "circOut" }} className="relative aspect-4/5 rounded-5xl md:rounded-5xl overflow-hidden shadow-2xl">
                 <Image src="/images/hero.png" alt="Clinical Treatment" fill className="object-cover" priority />
                 <div className="absolute inset-0 bg-linear-to-t from-slate-900/40 to-transparent" />
              </motion.div>
           </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="py-16 md:py-20 bg-slate-900 text-white">
         <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-12 text-center">
            <StatItem label="Experience" value="12+" />
            <StatItem label="Specialists" value="24" />
            <StatItem label="Modern Rooms" value="15" />
            <StatItem label="Results" value="99%" />
         </div>
      </section>

      {/* TREATMENTS */}
      <section id="treatments" className="py-24 md:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 md:mb-20 gap-8">
            <div className="space-y-4">
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">Service Portfolio</span>
              <h2 className="font-serif text-5xl md:text-6xl text-slate-900 tracking-tighter">Signature Expertise</h2>
            </div>
            <NextLink href="/booking" className="flex items-center gap-3 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 border-b-2 border-slate-900 pb-2 hover:gap-6 transition-all">Full Menu <ArrowUpRight size={18}/></NextLink>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
            {services.map((service, idx) => (
              <motion.div key={service.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} viewport={{ once: true }} className="group relative flex flex-col h-full bg-white rounded-4xl border border-slate-50 shadow-sm hover:shadow-2xl transition-all duration-700">
                <div className="aspect-4/5 relative overflow-hidden rounded-4xl m-3 md:m-4">
                  <Image src={service.image_url || "/images/facials.png"} alt={service.name} fill sizes="400px" className="object-cover group-hover:scale-110 transition-transform duration-[2s]" />
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-4 py-2 rounded-xl font-serif text-xs shadow-xl">Rp {parseInt(service.price).toLocaleString('id-ID')}</div>
                </div>
                <div className="p-6 md:p-8 pt-2 flex-1 flex flex-col">
                  <span className="text-[9px] font-black uppercase tracking-[0.25em] text-emerald-500 mb-2 block">{service.category}</span>
                  <h3 className="font-serif text-2xl md:text-3xl text-slate-900 mb-4 leading-tight">{service.name}</h3>
                  <p className="text-slate-400 text-sm font-medium leading-relaxed mb-6 line-clamp-2">{service.description}</p>
                  <NextLink href="/booking" className="mt-auto flex items-center justify-between group/btn text-[9px] font-black uppercase tracking-[0.2em] text-slate-300 hover:text-slate-900 transition-colors">
                     Book Now <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover/btn:bg-slate-900 group-hover/btn:text-white transition-all"><ChevronRight size={14}/></div>
                  </NextLink>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white pt-24 md:pt-32 pb-12 md:pb-16 border-t border-slate-50">
        <div className="max-w-7xl mx-auto px-6 text-center lg:text-left">
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 md:gap-20 mb-24 md:mb-32">
              <div className="lg:col-span-5 space-y-8 md:space-y-10">
                 <div className="flex items-center justify-center lg:justify-start gap-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-xl"><Sparkles size={24} /></div>
                    <span className="text-2xl md:text-3xl font-serif font-black tracking-tighter uppercase">SERENE</span>
                 </div>
                 <p className="text-lg md:text-xl text-slate-400 font-medium leading-relaxed max-w-sm mx-auto lg:mx-0">Crafting aesthetic brilliance through clinical precision and soulful care.</p>
                 <div className="flex justify-center lg:justify-start gap-4">
                    <SocialBtn icon={<Camera size={20}/>} />
                    <SocialBtn icon={<Share2 size={20}/>} />
                 </div>
              </div>
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-12">
                 <FooterList title="Menu" items={["Treatments", "Experts", "Analysis", "Points"]} />
                 <FooterList title="Legal" items={["Privacy", "Terms", "Audits"]} />
                 <div className="space-y-6">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8">Clinical Aesthetic Protocol</p>
                    <p className="text-sm text-slate-400 font-bold leading-relaxed uppercase tracking-[0.15em]">Jl. Serene Beauty No. 88<br/>Jakarta Selatan</p>
                 </div>
              </div>
           </div>
           <div className="pt-10 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6 text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">
              <p>&copy; 2026 Serene clinical suite</p>
              <div className="flex gap-8">
                 <a href="#" className="hover:text-slate-900 transition-colors">Privacy Policy</a>
                 <a href="#" className="hover:text-slate-900 transition-colors">Audit 2026</a>
              </div>
           </div>
        </div>
      </footer>

      {/* AUTH MODAL */}
      <AnimatePresence>
        {isLoginModalOpen && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4 md:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsLoginModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 50 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 50 }} className="relative w-full max-w-xl bg-white rounded-5xl md:rounded-[56px] p-8 md:p-16 shadow-2xl overflow-hidden border border-white/20">
              <button onClick={() => setIsLoginModalOpen(false)} className="absolute top-6 md:top-10 right-6 md:right-10 text-slate-300 hover:text-slate-900 transition-colors"><X size={28} /></button>
              <div className="text-center mb-10 md:mb-12">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-slate-900 text-white rounded-3xl flex items-center justify-center mx-auto mb-6 md:mb-8"><UserIcon size={32} /></div>
                <h2 className="font-serif text-4xl md:text-5xl mb-3 text-slate-900 tracking-tight">{isLogin ? "Welcome" : "Join Us"}</h2>
                <p className="text-slate-400 text-[9px] md:text-[10px] font-black uppercase tracking-[0.25em]">{isLogin ? "Access Your Clinical Portal" : "Begin Your Skin Journey"}</p>
              </div>
              {error && <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-[9px] font-black text-red-600 uppercase tracking-widest flex items-center gap-3"><AlertCircle size={18}/> {error}</div>}
              <form onSubmit={handleAuth} className="space-y-5 md:space-y-6">
                {!isLogin && <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="w-full px-6 md:px-8 py-4 md:py-5 rounded-3xl md:rounded-3xl border border-slate-50 bg-slate-50/50 outline-none focus:border-slate-900 focus:bg-white transition-all text-sm font-bold" placeholder="Full Name" />}
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-6 md:px-8 py-4 md:py-5 rounded-3xl md:rounded-3xl border border-slate-50 bg-slate-50/50 outline-none focus:border-slate-900 focus:bg-white transition-all text-sm font-bold" placeholder="Email Address" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-6 md:px-8 py-4 md:py-5 rounded-3xl md:rounded-3xl border border-slate-50 bg-slate-50/50 outline-none focus:border-slate-900 focus:bg-white transition-all text-sm font-bold" placeholder="Security Password" />
                <button disabled={loading} className="w-full bg-slate-900 text-white py-5 md:py-6 rounded-3xl md:rounded-[28px] font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all mt-4">
                  {loading ? <Loader2 className="animate-spin" size={20} /> : (isLogin ? "Authorized Sign-In" : "Finalize Enrollment")}
                </button>
              </form>
              <p className="text-center mt-10 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-300">
                {isLogin ? "No account?" : "Enrolled?"} <button onClick={() => setIsLogin(!isLogin)} className="text-slate-900 hover:underline ml-2">{isLogin ? "Register" : "Login"}</button>
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DropdownItem({ href, icon, label }: { href: string, icon: React.ReactNode, label: string }) {
   return (
      <NextLink href={href} className="flex items-center gap-5 px-5 py-4 rounded-2xl text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-all text-[10px] font-black uppercase tracking-[0.2em] group">
         <span className="group-hover:scale-110 transition-transform">{icon}</span>
         <span className="flex-1">{label}</span>
         <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
      </NextLink>
   );
}

function MobilePortalLink({ href, icon, label }: any) {
   return (
      <NextLink href={href} className="flex items-center justify-between p-6 rounded-3xl bg-slate-50 text-slate-900">
         <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-900">{icon}</div>
            <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
         </div>
         <ChevronRight size={20} className="text-slate-300" />
      </NextLink>
   );
}

function StatItem({ label, value }: { label: string, value: string }) {
   return (
      <div className="space-y-1">
         <h4 className="text-4xl md:text-5xl font-serif tracking-tighter">{value}</h4>
         <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">{label}</p>
      </div>
   );
}

function FeatureItem({ icon, title, desc }: any) {
   return (
      <div className="flex gap-5 md:gap-6 items-start">
         <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-sm border border-slate-100">{icon}</div>
         <div>
            <h4 className="text-lg md:text-xl font-serif text-slate-900 mb-1">{title}</h4>
            <p className="text-slate-400 text-xs md:text-sm font-medium leading-relaxed">{desc}</p>
         </div>
      </div>
   );
}

function SocialBtn({ icon }: any) {
   return <button className="w-12 h-12 md:w-14 md:h-14 rounded-2xl border border-slate-100 flex items-center justify-center text-slate-300 hover:bg-slate-900 hover:text-white transition-all duration-500 shadow-sm">{icon}</button>;
}

function FooterList({ title, items }: any) {
   return (
      <div className="space-y-6 md:space-y-8">
         <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900">{title}</h4>
         <ul className="space-y-3 md:space-y-4">
            {items.map((item: any) => (
               <li key={item}><a href="#" className="text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest">{item}</a></li>
            ))}
         </ul>
      </div>
   );
}
