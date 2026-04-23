"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Sparkles, 
  User, 
  Calendar, 
  Clock, 
  CreditCard, 
  X,
  UserPlus,
  LogIn,
  Loader2,
  CalendarCheck
} from "lucide-react";

const STEPS = [
  { id: 1, label: "Service", icon: <Sparkles size={16} /> },
  { id: 2, label: "Specialist", icon: <User size={16} /> },
  { id: 3, label: "Time", icon: <Clock size={16} /> },
  { id: 4, label: "Details", icon: <UserPlus size={16} /> },
];

export default function BookingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isGuest, setIsGuest] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [bookingData, setBookingData] = useState({
    service: "",
    price: "",
    specialist: "",
    date: "",
    time: "",
    email: "",
    name: "",
  });

  const nextStep = () => setCurrentStep((s) => Math.min(s + 1, 4));
  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 1));

  const isStepComplete = () => {
    if (currentStep === 1) return !!bookingData.service;
    if (currentStep === 2) return !!bookingData.specialist;
    if (currentStep === 3) return !!bookingData.date && !!bookingData.time;
    if (currentStep === 4) return !!bookingData.email && (isGuest ? !!bookingData.name : true);
    return true;
  };

  const handleFinalize = async () => {
    setIsSubmitting(true);
    // Simulate API Call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-mesh glow-mesh flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-xl w-full glass-panel rounded-[48px] p-16 text-center shadow-premium space-y-8"
        >
          <div className="w-24 h-24 bg-primary text-white rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-primary/40">
            <CalendarCheck size={48} />
          </div>
          <div>
            <h1 className="font-serif text-4xl text-on-surface mb-4">Clinical Appointment Reserved</h1>
            <p className="text-on-surface-variant font-medium leading-relaxed">
              Thank you, {bookingData.name || 'Eleanor'}. Your reservation for <strong className="text-primary">{bookingData.service}</strong> with <strong className="text-primary">{bookingData.specialist}</strong> has been received. 
              A confirmation and clinical pre-care guide have been sent to <span className="underline">{bookingData.email}</span>.
            </p>
          </div>
          <div className="bg-primary/5 rounded-3xl p-8 space-y-3">
             <p className="text-xs font-bold uppercase tracking-widest text-primary">Your Schedule</p>
             <p className="text-2xl font-serif text-on-surface">{bookingData.date}</p>
             <p className="text-sm font-bold text-on-surface-variant uppercase tracking-widest">{bookingData.time}</p>
          </div>
          <div className="pt-4 flex flex-col gap-4">
            <Link href="/" className="bg-primary text-white py-5 rounded-2xl font-bold uppercase tracking-widest text-xs">Return to Home</Link>
            <Link href="/patient" className="text-primary font-bold text-xs uppercase tracking-widest hover:underline">Go to Patient Portal</Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mesh glow-mesh flex flex-col selection:bg-primary selection:text-white">
      {/* Transactional Header */}
      <header className="fixed top-0 w-full z-50 py-6 px-6 md:px-12">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
              <Sparkles size={18} />
            </div>
            <span className="text-xl font-bold tracking-tighter text-primary">SERENE</span>
          </Link>
          <Link href="/" className="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-on-surface-variant hover:text-error transition-colors">
            <X size={20} />
          </Link>
        </div>
      </header>

      <main className="flex-grow pt-32 pb-40 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Progress Path */}
          <div className="mb-20">
            <div className="flex justify-between items-center max-w-3xl mx-auto relative">
              <div className="absolute top-1/2 left-0 w-full h-[1px] bg-outline-variant -translate-y-1/2 z-0" />
              <motion.div 
                className="absolute top-1/2 left-0 h-[2px] bg-primary -translate-y-1/2 z-10"
                initial={{ width: "0%" }}
                animate={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              />
              {STEPS.map((step) => {
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                return (
                  <div key={step.id} className="relative z-20 flex flex-col items-center gap-3">
                    <motion.div
                      animate={{ 
                        scale: isActive ? 1.2 : 1,
                        backgroundColor: isCompleted || isActive ? "var(--color-primary)" : "white",
                        color: isCompleted || isActive ? "white" : "var(--color-on-surface-variant)"
                      }}
                      className={`w-10 h-10 rounded-full flex items-center justify-center border border-outline-variant shadow-premium transition-all`}
                    >
                      {isCompleted ? <CheckCircle2 size={18} /> : step.icon}
                    </motion.div>
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${isActive ? "text-primary" : "text-on-surface-variant opacity-60"}`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step Transitions */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              {currentStep === 1 && <ServiceStep data={bookingData} setData={setBookingData} />}
              {currentStep === 2 && <SpecialistStep data={bookingData} setData={setBookingData} />}
              {currentStep === 3 && <TimeStep data={bookingData} setData={setBookingData} />}
              {currentStep === 4 && <DetailsStep data={bookingData} setData={setBookingData} isGuest={isGuest} setIsGuest={setIsGuest} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Floating Action Bar */}
      <footer className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-lg px-6 z-50">
        <div className="glass-panel rounded-3xl p-4 shadow-2xl flex justify-between items-center">
          <button 
            onClick={prevStep}
            disabled={isSubmitting}
            className={`p-4 rounded-2xl text-on-surface-variant hover:bg-surface-variant transition-all ${currentStep === 1 || isSubmitting ? "opacity-0 pointer-events-none" : ""}`}
          >
            <ChevronLeft size={24} />
          </button>
          
          <button 
            onClick={() => {
              if (currentStep === 4) {
                handleFinalize();
              } else {
                nextStep();
              }
            }}
            disabled={!isStepComplete() || isSubmitting}
            className="flex-grow ml-4 bg-primary text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 hover:shadow-xl hover:shadow-primary/20 transition-all disabled:opacity-30 active:scale-95"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Finalizing clinical path...
              </>
            ) : (
              <>
                {currentStep === 4 ? "Complete Booking" : "Next Step"}
                <ChevronRight size={18} />
              </>
            )}
          </button>
        </div>
      </footer>
    </div>
  );
}

function ServiceStep({ data, setData }) {
  const services = [
    { name: "Signature Hydrafacial", price: "250", cat: "Skin", img: "/images/facials.png", large: true },
    { name: "Neuromodulators", price: "12/unit", cat: "Injectables", img: "/images/laser.png" },
    { name: "BBL Photofacial", price: "450", cat: "Laser", img: "/images/hero.png" },
  ];

  return (
    <div className="space-y-10">
      <div className="text-center">
        <h2 className="font-serif text-4xl mb-4">Choose Your Treatment</h2>
        <p className="text-on-surface-variant font-medium">Select a service to begin your personalized care path.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {services.map((s) => (
          <motion.div
            key={s.name}
            whileHover={{ scale: 1.02 }}
            onClick={() => setData({ ...data, service: s.name, price: s.price })}
            className={`cursor-pointer rounded-[40px] p-8 border-2 transition-all duration-500 flex flex-col group ${
              data.service === s.name ? "border-primary bg-primary-container/10 shadow-premium" : "border-outline-variant bg-white"
            } ${s.large ? "md:col-span-2" : ""}`}
          >
            <div className="relative h-48 mb-8 rounded-[32px] overflow-hidden">
              <Image src={s.img} alt={s.name} fill className="object-cover group-hover:scale-110 transition-transform duration-1000" sizes="(max-width: 768px) 100vw, 50vw" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-3">{s.cat}</span>
            <h3 className="font-serif text-2xl mb-4">{s.name}</h3>
            <div className="mt-auto flex justify-between items-center">
              <span className="text-lg font-bold">{s.price.includes("/") ? s.price : `$${s.price}`}</span>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${data.service === s.name ? "bg-primary text-white" : "border border-outline-variant text-outline-variant"}`}>
                <CheckCircle2 size={20} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function SpecialistStep({ data, setData }) {
  const specialists = [
    { name: "Dr. Elena Rossi", role: "Aesthetic Physician", bio: "Board-certified in facial rejuvenation." },
    { name: "Sarah Jenkins", role: "Senior Aesthetician", bio: "Expert in clinical skin transformation." },
    { name: "Dr. Marcus Thorne", role: "Dermatologist", bio: "Specialist in advanced laser therapies." },
  ];

  return (
    <div className="space-y-10">
      <div className="text-center">
        <h2 className="font-serif text-4xl mb-4">Select Your Specialist</h2>
        <p className="text-on-surface-variant font-medium">Every clinician at Serene is board-certified and expert-trained.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {specialists.map((spec) => (
          <motion.div
            key={spec.name}
            whileHover={{ scale: 1.02 }}
            onClick={() => setData({ ...data, specialist: spec.name })}
            className={`cursor-pointer p-10 rounded-[40px] border-2 text-center transition-all ${
              data.specialist === spec.name ? "border-primary bg-primary-container/10 shadow-premium" : "border-outline-variant bg-white"
            }`}
          >
            <div className="w-28 h-28 rounded-full bg-surface-variant mx-auto mb-8 overflow-hidden border-4 border-white shadow-lg relative">
              <Image src="/images/hero.png" alt={spec.name} fill className="object-cover grayscale" sizes="112px" />
            </div>
            <h3 className="font-serif text-2xl mb-2">{spec.name}</h3>
            <p className="text-primary font-bold text-xs uppercase tracking-widest mb-4">{spec.role}</p>
            <p className="text-on-surface-variant text-sm font-medium leading-relaxed mb-8">{spec.bio}</p>
            <div className={`text-[10px] font-bold uppercase tracking-widest ${data.specialist === spec.name ? "text-primary" : "text-outline-variant"}`}>
              {data.specialist === spec.name ? "Selected Specialist" : "Select Expert"}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function TimeStep({ data, setData }) {
  return (
    <div className="space-y-10">
      <div className="text-center">
        <h2 className="font-serif text-4xl mb-4">Date & Time</h2>
        <p className="text-on-surface-variant font-medium">Select a slot that fits your schedule.</p>
      </div>
      <div className="max-w-2xl mx-auto bg-white p-12 rounded-[48px] border border-outline-variant shadow-premium">
        <div className="mb-12">
          <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary mb-6">
            <Calendar size={14} />
            Pick a Date
          </label>
          <input 
            type="date" 
            onChange={(e) => setData({ ...data, date: e.target.value })}
            className="w-full p-6 rounded-2xl border border-outline-variant bg-mesh text-xl font-bold focus:border-primary focus:ring-0 transition-all outline-none" 
          />
        </div>
        
        <div>
          <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary mb-6">
            <Clock size={14} />
            Available Slots
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {["09:00 AM", "10:30 AM", "01:00 PM", "02:30 PM", "04:00 PM", "05:30 PM"].map(t => (
              <button 
                key={t}
                onClick={() => setData({ ...data, time: t })}
                className={`p-6 rounded-2xl border-2 text-sm font-bold transition-all active:scale-95 ${
                  data.time === t ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "border-outline-variant hover:border-primary bg-white"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailsStep({ data, setData, isGuest, setIsGuest }) {
  return (
    <div className="space-y-10">
      <div className="text-center">
        <h2 className="font-serif text-4xl mb-4">Finalize Appointment</h2>
        <p className="text-on-surface-variant font-medium">Please provide your details to confirm the booking.</p>
      </div>

      <div className="max-w-xl mx-auto">
        <div className="flex bg-surface-variant/30 p-2 rounded-2xl mb-10">
           <button 
            onClick={() => setIsGuest(true)}
            className={`flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${isGuest ? "bg-white shadow-sm text-primary" : "text-on-surface-variant hover:text-on-surface"}`}
           >
             New Patient (Guest)
           </button>
           <button 
            onClick={() => setIsGuest(false)}
            className={`flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${!isGuest ? "bg-white shadow-sm text-primary" : "text-on-surface-variant hover:text-on-surface"}`}
           >
             Returning Member
           </button>
        </div>

        <motion.div 
          layout
          className="bg-white p-12 rounded-[48px] border border-outline-variant shadow-premium space-y-8"
        >
          <AnimatePresence mode="wait">
            {isGuest ? (
              <motion.div 
                key="guest"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-primary ml-2">Full Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Eleanor Rigby"
                    value={data.name}
                    onChange={(e) => setData({ ...data, name: e.target.value })}
                    className="w-full px-6 py-4 rounded-2xl border border-outline-variant outline-none focus:border-primary transition-all bg-background/30"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-primary ml-2">Email Address</label>
                  <input 
                    type="email" 
                    placeholder="name@example.com"
                    value={data.email}
                    onChange={(e) => setData({ ...data, email: e.target.value })}
                    className="w-full px-6 py-4 rounded-2xl border border-outline-variant outline-none focus:border-primary transition-all bg-background/30"
                  />
                </div>
                <p className="text-[10px] text-on-surface-variant text-center px-4 leading-relaxed italic">
                  * No account required. We'll send your clinical confirmation and pre-care guide via email.
                </p>
              </motion.div>
            ) : (
              <motion.div 
                key="member"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="p-8 bg-primary/5 rounded-3xl border border-primary/10 text-center space-y-4">
                  <LogIn className="mx-auto text-primary" size={32} />
                  <p className="text-sm font-medium text-on-surface-variant">Sign in to sync with your medical history and saved preferences.</p>
                  <Link href="/login" className="inline-block bg-primary text-white px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest">
                    Member Login
                  </Link>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-primary ml-2">Confirm Email</label>
                  <input 
                    type="email" 
                    placeholder="Enter member email"
                    value={data.email}
                    onChange={(e) => setData({ ...data, email: e.target.value })}
                    className="w-full px-6 py-4 rounded-2xl border border-outline-variant outline-none focus:border-primary transition-all bg-background/30"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        
        <div className="mt-10 p-8 bg-surface-variant/20 rounded-4xl space-y-4">
          <div className="flex justify-between items-center text-sm">
             <span className="font-medium text-on-surface-variant">{data.service || 'No service selected'}</span>
             <span className="font-bold text-primary">{data.price}</span>
          </div>
          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
             <span>{data.date || 'Pick a date'}</span>
             <span>{data.time || 'Pick a time'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
