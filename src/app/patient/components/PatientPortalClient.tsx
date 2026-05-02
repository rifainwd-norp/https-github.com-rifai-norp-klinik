"use client";

import Image from "next/image";
import Sidebar from "@/components/Sidebar";
import { motion } from "framer-motion";
import { 
  Verified, 
  CalendarDays, 
  Clock, 
  Droplets, 
  Sun, 
  Dumbbell, 
  History, 
  Upload,
  ArrowRight,
  ShieldCheck,
  Activity
} from "lucide-react";

export default function PatientPortalClient() {
  return (
    <div className="min-h-screen bg-mesh flex">
      <Sidebar />

      <main className="flex-1 md:ml-72 p-8 md:p-16 max-w-7xl mx-auto w-full">
        {/* Header Section */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-outline-variant pb-10"
        >
          <div>
            <h2 className="font-serif text-4xl md:text-5xl text-on-surface mb-4">Welcome Back, Eleanor.</h2>
            <p className="text-lg text-on-surface-variant font-medium">Your journey to clinical serenity continues.</p>
          </div>
          <div className="flex items-center gap-3 px-5 py-2.5 bg-primary-container text-primary rounded-full text-xs font-bold border border-primary-container/30">
            <Verified size={16} />
            Patient Status: Active
          </div>
        </motion.header>

        {/* Top Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
          {/* Upcoming Appointment Card */}
          <motion.section 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-5 glass-panel rounded-4xl p-10 flex flex-col justify-between shadow-premium hover:shadow-hover transition-all duration-500 border border-outline-variant/30"
          >
            <div>
              <div className="flex justify-between items-start mb-8">
                <h3 className="font-serif text-2xl text-on-surface">Next Appointment</h3>
                <span className="bg-primary text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest">Confirmed</span>
              </div>
              
              <div className="bg-primary/5 rounded-3xl p-8 mb-8 border border-primary/10 relative overflow-hidden group">
                <Image
                  src="/images/hero.png"
                  alt="Upcoming"
                  fill
                  className="object-cover opacity-10 group-hover:scale-110 transition-transform duration-1000"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="relative z-10">
                  <h4 className="text-xl font-bold text-on-surface mb-2">HydraFacial Elite & LED Therapy</h4>
                  <p className="text-on-surface-variant font-medium mb-6">with Dr. Sarah Jenkins</p>
                  <div className="flex items-center gap-6 text-primary font-bold text-sm">
                    <span className="flex items-center gap-2">
                      <CalendarDays size={18} />
                      Oct 24, 2024
                    </span>
                    <span className="flex items-center gap-2">
                      <Clock size={18} />
                      2:00 PM
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4">
              <button className="flex-1 bg-primary text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:shadow-lg transition-all active:scale-95">Reschedule</button>
              <button className="flex-1 border-2 border-primary/20 text-primary py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-primary/5 transition-all">Pre-care Guide</button>
            </div>
          </motion.section>

          {/* Post-Care Instructions */}
          <motion.section 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-7 glass-panel rounded-4xl p-10 relative overflow-hidden shadow-premium border border-outline-variant/30"
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[100px] -mr-20 -mt-20 pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <Activity size={28} />
                </div>
                <h3 className="font-serif text-2xl text-on-surface">Active Recovery</h3>
              </div>
              <p className="text-on-surface-variant font-medium mb-10">Essential post-care for your recent <strong className="text-primary">Microneedling RF</strong> session.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <RecoveryItem icon={<Droplets />} title="Hydration" text="Apply calming serum every 4h. No retinol for 72h." />
                <RecoveryItem icon={<Sun />} title="Sun Block" text="SPF 50+ mineral sunscreen is mandatory." />
                <RecoveryItem icon={<Dumbbell />} title="Activity" text="No heavy sweating or saunas for 48 hours." />
              </div>
            </div>
          </motion.section>
        </div>

        {/* Bottom Grid: History & Gallery */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Clinical Journey */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-5 glass-panel rounded-4xl p-10 shadow-premium border border-outline-variant/30"
          >
            <div className="flex items-center gap-4 mb-10">
              <History className="text-primary" />
              <h3 className="font-serif text-2xl text-on-surface">Clinical Journey</h3>
            </div>
            
            <div className="space-y-12 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-outline-variant/30">
              <TimelineItem date="Oct 10, 2024" title="Microneedling RF" text="Lower face collagen induction. Patient tolerated procedure well. Erythema present, expected to resolve in 24h." active />
              <TimelineItem date="Sep 15, 2024" title="Chemical Peel" text="Focus on T-zone congestion. Mild flaking observed at day 3 follow-up." />
              <TimelineItem date="Aug 02, 2024" title="Initial Consultation" text="Comprehensive skin analysis. Formulated 6-month treatment plan focusing on texture and tone." />
            </div>

            <button className="mt-12 text-primary font-bold text-xs uppercase tracking-widest flex items-center gap-2 group hover:opacity-70 transition-opacity">
              View Full History 
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.section>

          {/* Progress Gallery */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-7 glass-panel rounded-4xl p-10 shadow-premium border border-outline-variant/30"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
              <div>
                <h3 className="font-serif text-2xl text-on-surface">Progress Gallery</h3>
                <p className="text-on-surface-variant font-medium text-sm">Visualizing your treatment outcomes.</p>
              </div>
              <button className="flex items-center gap-2 border-2 border-outline-variant text-on-surface px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-surface-variant transition-all">
                <Upload size={18} />
                Upload Progress
              </button>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-center opacity-60">Before (Aug '24)</p>
                <div className="aspect-square relative rounded-4xl overflow-hidden border border-outline-variant group">
                  <Image src="/images/hero.png" alt="Before" fill className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700" sizes="(max-width: 768px) 100vw, 33vw" />
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary text-center">Current (Oct '24)</p>
                <div className="aspect-square relative rounded-4xl overflow-hidden border-2 border-primary group">
                  <Image src="/images/hero.png" alt="Current" fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 33vw" />
                </div>
              </div>
            </div>
            
            <div className="mt-10 p-6 bg-primary/5 rounded-3xl text-center">
              <p className="text-on-surface-variant text-sm font-medium italic">
                "Visible improvement in skin texture and reduction of hyperpigmentation following the initial treatment phase."
              </p>
            </div>
          </motion.section>
        </div>
      </main>

      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" />
    </div>
  );
}

function RecoveryItem({ icon, title, text }: { icon: any, title: any, text: any }) {
  return (
    <div className="flex gap-4 items-start group">
      <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
        {icon}
      </div>
      <div>
        <h4 className="font-bold text-on-surface text-sm mb-1">{title}</h4>
        <p className="text-xs text-on-surface-variant leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

function TimelineItem({ date, title, text, active = false }: { date: any, title: any, text: any, active?: any }) {
  return (
    <div className="relative pl-10">
      <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-4 border-background z-10 transition-colors ${active ? "bg-primary shadow-lg shadow-primary/30" : "bg-outline-variant"}`} />
      <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${active ? "text-primary" : "text-on-surface-variant"}`}>{date}</p>
      <h4 className="font-bold text-on-surface text-lg mb-2">{title}</h4>
      <p className="text-sm text-on-surface-variant font-medium leading-relaxed">{text}</p>
    </div>
  );
}
