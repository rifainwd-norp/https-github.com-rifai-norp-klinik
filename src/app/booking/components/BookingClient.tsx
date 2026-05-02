"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronRight, 
  Sparkles, 
  User, 
  Clock, 
  UserPlus,
  Loader2,
  CalendarCheck,
  AlertCircle,
  Star,
  Calendar,
  ArrowLeft
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getServices } from "@/app/actions/services";
import { getSpecialists } from "@/app/actions/specialists";
import { createAppointment } from "@/app/actions/appointments";

export type Service = {
  id: string;
  name: string;
  price: string;
  category: string;
  image_url: string;
  duration_minutes: number;
};

export type Specialist = {
  id: string;
  name: string;
  role: string;
  bio: string;
  image_url: string;
  rating?: number;
};

export type BookingData = {
  service_id: string;
  service: string;
  price: string;
  duration_minutes: number;
  specialist_id: string;
  specialist: string;
  date: string;
  time: string;
  email: string;
  name: string;
};

const OPERATING_TIMES = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];

export default function BookingClient() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isGuest, setIsGuest] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const [bookingData, setBookingData] = useState<BookingData>({
    service_id: "", service: "", price: "", duration_minutes: 60,
    specialist_id: "", specialist: "", date: "", time: "", email: "", name: "",
  });

  const [services, setServices] = useState<Service[]>([]);
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      const sData = await getServices();
      const specData = await getSpecialists();
      if (sData) setServices(sData as any[]);
      if (specData) setSpecialists(specData as any[]);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setIsLoggedIn(true);
        setIsGuest(false);
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        setBookingData(prev => ({
          ...prev,
          email: user.email || "",
          name: profile?.full_name || ""
        }));
      }
    }
    fetchData();
  }, [supabase]);

  const nextStep = () => setCurrentStep((s) => Math.min(s + 1, 4));
  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 1));

  const isStepComplete = () => {
    if (currentStep === 1) return !!bookingData.service_id;
    if (currentStep === 2) return !!bookingData.specialist_id;
    if (currentStep === 3) return !!bookingData.date && !!bookingData.time;
    if (currentStep === 4) return !!bookingData.email && (isGuest ? !!bookingData.name : true);
    return true;
  };

  const handleFinalize = async () => {
    setIsSubmitting(true);
    setBookingError(null);
    try {
      const { data: userData } = await supabase.auth.getUser();
      await createAppointment({
        user_id: userData.user?.id || null,
        service_id: bookingData.service_id,
        specialist_id: bookingData.specialist_id,
        appointment_date: bookingData.date,
        appointment_time: bookingData.time,
        status: "pending",
        guest_name: !userData.user ? bookingData.name : null,
        guest_email: !userData.user ? bookingData.email : null,
      });
      setIsSuccess(true);
    } catch (error: any) {
      setBookingError(error.message || "An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const STEPS = [
    { id: 1, label: "Session", icon: <Sparkles size={16} /> },
    { id: 2, label: "Expert", icon: <User size={16} /> },
    { id: 3, label: "Schedule", icon: <Clock size={16} /> },
    { id: 4, label: "Review", icon: <UserPlus size={16} /> },
  ];

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full bg-white rounded-5xl p-10 md:p-16 text-center shadow-2xl border border-slate-50 space-y-8">
          <div className="w-20 h-20 bg-slate-900 text-white rounded-3xl flex items-center justify-center mx-auto shadow-xl"><CalendarCheck size={40} /></div>
          <div>
            <h1 className="font-serif text-3xl md:text-4xl text-slate-900 mb-4 tracking-tight">Booking Confirmed</h1>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">
              Appointment for <strong className="text-slate-900">{bookingData.service}</strong> with <strong className="text-slate-900">{bookingData.specialist}</strong> has been secured.
            </p>
          </div>
          <Link href="/dashboard" className="block w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-slate-200">Go to My Portal</Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans text-slate-900 selection:bg-slate-900 selection:text-white">
      <main className="max-w-6xl mx-auto px-4 py-8 md:p-16">
        <header className="mb-10 md:mb-16 flex items-center gap-4 md:gap-8">
           <button onClick={() => router.back()} className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl md:rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-900 hover:shadow-xl transition-all border border-slate-50 shrink-0">
              <ArrowLeft size={20} className="md:w-6 md:h-6" />
           </button>
           <div className="space-y-1">
              <h1 className="font-serif text-2xl md:text-5xl text-slate-900 tracking-tighter">New Appointment</h1>
              <p className="text-slate-300 text-[8px] md:text-[10px] font-black uppercase tracking-[0.25em]">Reserve Your Clinical Session</p>
           </div>
        </header>

        {/* COMPACT STEP INDICATOR */}
        <div className="flex justify-center mb-10 md:mb-16 overflow-x-auto py-2">
          <div className="flex items-center gap-3 md:gap-6">
            {STEPS.map((step, idx) => (
              <div key={step.id} className="flex items-center gap-3 md:gap-6">
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-8 h-8 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center transition-all duration-500 ${currentStep >= step.id ? "bg-slate-900 text-white shadow-xl md:shadow-2xl shadow-slate-200" : "bg-slate-50 text-slate-300"}`}>
                    <span className="md:hidden text-[10px] font-black">{step.id}</span>
                    <span className="hidden md:block">{step.icon}</span>
                  </div>
                  <span className={`text-[7px] md:text-[10px] font-black uppercase tracking-[0.15em] transition-colors ${currentStep >= step.id ? "text-slate-900" : "text-slate-200"}`}>{step.label}</span>
                </div>
                {idx < STEPS.length - 1 && <div className={`w-4 md:w-12 h-0.5 rounded-full transition-colors duration-500 ${currentStep > step.id ? "bg-slate-900" : "bg-slate-50"}`} />}
              </div>
            ))}
          </div>
        </div>

        <div className="min-h-[450px]">
          <AnimatePresence mode="wait">
            {currentStep === 1 && <ServiceStep key="step1" services={services} data={bookingData} setData={setBookingData} onNext={nextStep} />}
            {currentStep === 2 && <SpecialistStep key="step2" specialists={specialists} data={bookingData} setData={setBookingData} onNext={nextStep} />}
            {currentStep === 3 && <TimeStep key="step3" data={bookingData} setData={setBookingData} onNext={nextStep} />}
            {currentStep === 4 && <DetailsStep key="step4" data={bookingData} setData={setBookingData} isGuest={isGuest} setIsGuest={setIsGuest} isLoggedIn={isLoggedIn} bookingError={bookingError} />}
          </AnimatePresence>
        </div>

        <footer className="fixed bottom-0 left-0 right-0 p-4 md:relative md:p-0 md:mt-16 z-50">
           <div className="max-w-6xl mx-auto p-6 md:p-10 flex justify-center items-center">
              {currentStep === 4 && (
                <button onClick={handleFinalize} disabled={!isStepComplete() || isSubmitting} className="bg-slate-900 text-white px-8 md:px-10 py-4 md:py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[9px] md:text-[10px] flex items-center gap-3 shadow-xl active:scale-95 transition-all">
                  {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : "Complete Booking"}
                  {!isSubmitting && <ChevronRight size={16} />}
                </button>
              )}
           </div>
        </footer>
        {/* Spacer for fixed footer on mobile */}
        <div className="h-24 md:hidden" />
      </main>
    </div>
  );
}

function ServiceStep({ services, data, setData, onNext }: any) {
  const categories = [...new Set(services.map((s:any) => s.category))];
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const filtered = activeCategory === "all" ? services : services.filter((s:any) => s.category === activeCategory);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6 md:space-y-10">
      <div className="flex flex-wrap justify-center gap-2 md:gap-3 px-2">
        <button onClick={() => setActiveCategory("all")} className={`px-4 md:px-6 py-2 md:py-2.5 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all ${activeCategory === "all" ? "bg-slate-900 text-white shadow-lg" : "bg-slate-50 text-slate-400 hover:text-slate-900"}`}>All</button>
        {categories.map((cat:any) => (
          <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-4 md:px-6 py-2 md:py-2.5 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all ${activeCategory === cat ? "bg-slate-900 text-white shadow-lg" : "bg-slate-50 text-slate-400 hover:text-slate-900"}`}>{cat}</button>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
        {filtered.map((s:any) => (
          <div key={s.id} onClick={() => { setData({ ...data, service_id: s.id, service: s.name, price: s.price, duration_minutes: s.duration_minutes || 60 }); onNext(); }} className="group relative bg-white rounded-3xl md:rounded-4xl border border-slate-50 overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-500">
            <div className="aspect-video md:aspect-4/5 relative overflow-hidden">
              <Image src={s.image_url || "/images/facials.png"} alt={s.name} fill sizes="400px" className="object-cover group-hover:scale-110 transition-transform duration-1000" />
              <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl font-serif text-[10px] md:text-sm shadow-lg">Rp {parseInt(s.price).toLocaleString('id-ID')}</div>
            </div>
            <div className="p-5 md:p-8">
              <span className="text-[8px] font-black uppercase tracking-widest text-emerald-500 mb-1 block">{s.category}</span>
              <h3 className="font-serif text-xl md:text-2xl text-slate-900 leading-tight">{s.name}</h3>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function SpecialistStep({ specialists, data, setData, onNext }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 max-w-5xl mx-auto">
      {specialists.map((spec:any) => (
        <div key={spec.id} onClick={() => { setData({ ...data, specialist_id: spec.id, specialist: spec.name }); onNext(); }} className="group bg-white rounded-3xl md:rounded-5xl border border-slate-50 p-6 md:p-10 text-center cursor-pointer hover:shadow-2xl transition-all duration-500">
          <div className="w-20 h-20 md:w-28 md:h-28 mx-auto mb-4 md:mb-8 rounded-2xl md:rounded-[40px] overflow-hidden border-4 border-slate-50 shadow-lg relative"><Image src={spec.image_url || "/images/hero.png"} alt={spec.name} fill sizes="112px" className="object-cover group-hover:scale-110 transition-transform duration-700" /></div>
          <h3 className="font-serif text-xl md:text-3xl text-slate-900 mb-1">{spec.name}</h3>
          <p className="text-emerald-500 font-black text-[8px] md:text-[10px] uppercase tracking-widest mb-4">{spec.role}</p>
          <div className="flex justify-center gap-0.5 mb-4 md:mb-6">{[...Array(5)].map((_, i) => <Star key={i} size={12} className={i < 4 ? "text-amber-400 fill-amber-400" : "text-slate-100"} />)}</div>
          <p className="text-slate-400 text-[10px] leading-relaxed italic line-clamp-2 md:line-clamp-none">{spec.bio}</p>
        </div>
      ))}
    </motion.div>
  );
}

function TimeStep({ data, setData, onNext }: any) {
  // Generate next 14 days
  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return {
      full: d.toISOString().split('T')[0],
      day: d.toLocaleDateString('id-ID', { weekday: 'short' }),
      date: d.getDate(),
      month: d.toLocaleDateString('id-ID', { month: 'short' })
    };
  });

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8 md:space-y-12 max-w-5xl mx-auto">
      <div className="bg-white p-6 md:p-10 rounded-3xl md:rounded-5xl border border-slate-50">
        <h3 className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.25em] text-slate-300 mb-6 flex items-center gap-2"><Calendar size={14}/> 1. Select Date</h3>
        <div className="flex gap-3 overflow-x-auto pb-4 px-1 scrollbar-hide">
          {dates.map((d) => (
            <button key={d.full} onClick={() => setData({ ...data, date: d.full })} className={`flex flex-col items-center justify-center min-w-[70px] md:min-w-[90px] p-4 md:p-6 rounded-2xl md:rounded-3xl border transition-all duration-300 ${data.date === d.full ? "bg-slate-900 border-slate-900 text-white shadow-xl scale-105" : "bg-slate-50/50 border-slate-50 text-slate-400 hover:border-slate-200"}`}>
               <span className="text-[7px] md:text-[9px] font-black uppercase tracking-widest mb-1">{d.day}</span>
               <span className="font-serif text-xl md:text-3xl leading-none mb-1">{d.date}</span>
               <span className="text-[7px] md:text-[9px] font-bold uppercase">{d.month}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 md:p-10 rounded-3xl md:rounded-5xl border border-slate-50">
        <h3 className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.25em] text-slate-300 mb-6 flex items-center gap-2"><Clock size={14}/> 2. Preferred Time</h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 md:gap-4">
          {OPERATING_TIMES.map((t) => (
            <button key={t} onClick={() => { setData({ ...data, time: t }); if(data.date) onNext(); }} className={`py-4 md:py-6 rounded-xl md:rounded-2xl border font-black text-[8px] md:text-[10px] uppercase tracking-widest transition-all ${data.time === t ? "bg-slate-900 text-white border-slate-900 shadow-lg" : "border-slate-50 bg-slate-50/50 hover:border-slate-200"}`}>{t}</button>
          ))}
        </div>
        {!data.date && <p className="mt-6 text-center text-red-400 text-[8px] md:text-[10px] font-black uppercase tracking-widest animate-pulse">Please select a date first</p>}
      </div>
    </motion.div>
  );
}

function DetailsStep({ data, setData, isGuest, setIsGuest, isLoggedIn, bookingError }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-2xl mx-auto space-y-6 md:space-y-10">
      <div className="bg-white p-6 md:p-16 rounded-[40px] md:rounded-[56px] border border-slate-50 shadow-2xl space-y-6 md:space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 md:pb-10 border-b border-slate-50 gap-4">
           <div>
              <p className="text-[8px] md:text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1 md:mb-2">{data.service}</p>
              <h3 className="font-serif text-2xl md:text-3xl text-slate-900 tracking-tight">{data.specialist}</h3>
           </div>
           <div className="md:text-right w-full md:w-auto p-4 md:p-0 bg-slate-50 md:bg-transparent rounded-2xl">
              <p className="font-serif text-2xl md:text-3xl text-slate-900">Rp {parseInt(data.price || "0").toLocaleString('id-ID')}</p>
              <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Clinical Rate</p>
           </div>
        </div>

        <div className="grid grid-cols-2 gap-4 py-4">
           <div className="space-y-1"><p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Date</p><p className="text-sm md:text-lg font-black text-slate-900">{data.date}</p></div>
           <div className="space-y-1"><p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Time</p><p className="text-sm md:text-lg font-black text-slate-900">{data.time} WIB</p></div>
        </div>

        <div className="pt-6 md:pt-10 border-t border-slate-50 space-y-4 md:space-y-6">
           <div className="space-y-1">
              <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest ml-4">Patient Name</p>
              <input type="text" value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} disabled={isLoggedIn} className="w-full px-6 py-4 md:py-5 rounded-2xl md:rounded-3xl border border-slate-50 bg-slate-50/50 outline-none focus:border-slate-900 focus:bg-white transition-all text-xs font-bold" />
           </div>
           <div className="space-y-1">
              <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest ml-4">Email Contact</p>
              <input type="email" value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })} disabled={isLoggedIn} className="w-full px-6 md:px-8 py-4 md:py-5 rounded-2xl md:rounded-3xl border border-slate-50 bg-slate-50/50 outline-none focus:border-slate-900 focus:bg-white transition-all text-xs font-bold" />
           </div>
        </div>

        {bookingError && <div className="p-4 md:p-6 bg-red-50 border border-red-100 rounded-2xl text-[8px] md:text-[10px] font-black text-red-600 uppercase tracking-widest flex items-center gap-3"><AlertCircle size={18}/> {bookingError}</div>}
      </div>
    </motion.div>
  );
}
