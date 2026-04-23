"use client";

import Sidebar from "@/components/Sidebar";
import { motion } from "framer-motion";
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Stethoscope, 
  FileText,
  Save,
  ArrowLeft,
  Info
} from "lucide-react";
import Link from "next/link";

export default function NewPatientPage() {
  return (
    <div className="min-h-screen bg-mesh flex">
      <Sidebar />

      <main className="flex-1 md:ml-72 p-8 md:p-16 max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="mb-12 flex justify-between items-center">
          <div>
            <Link href="/dashboard" className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-4 hover:opacity-70 transition-opacity">
              <ArrowLeft size={14} /> Back to Dashboard
            </Link>
            <h1 className="font-serif text-4xl md:text-5xl text-on-surface">Create New Patient</h1>
          </div>
        </div>

        {/* Form Container */}
        <form className="space-y-10 pb-20">
          {/* Section 1: Personal Info */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel rounded-[40px] p-10 shadow-premium"
          >
            <div className="flex items-center gap-3 mb-8 text-primary">
              <User size={20} />
              <h3 className="font-serif text-2xl text-on-surface">Personal Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={18} />
                  <input type="text" placeholder="e.g. Eleanor Rigby" className="w-full pl-12 pr-4 py-4 rounded-2xl border border-outline-variant outline-primary bg-background/50" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-2">Date of Birth</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={18} />
                  <input type="date" className="w-full pl-12 pr-4 py-4 rounded-2xl border border-outline-variant outline-primary bg-background/50" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={18} />
                  <input type="email" placeholder="eleanor@example.com" className="w-full pl-12 pr-4 py-4 rounded-2xl border border-outline-variant outline-primary bg-background/50" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-2">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={18} />
                  <input type="tel" placeholder="+44 20 7123 4567" className="w-full pl-12 pr-4 py-4 rounded-2xl border border-outline-variant outline-primary bg-background/50" />
                </div>
              </div>
            </div>
          </motion.section>

          {/* Section 2: Clinical Details */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-panel rounded-[40px] p-10 shadow-premium"
          >
            <div className="flex items-center gap-3 mb-8 text-primary">
              <Stethoscope size={20} />
              <h3 className="font-serif text-2xl text-on-surface">Clinical Profile</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-2">Skin Type (Fitzpatrick Scale)</label>
                <select className="w-full px-5 py-4 rounded-2xl border border-outline-variant outline-primary bg-background/50 appearance-none">
                  <option>Type I (Very Fair)</option>
                  <option>Type II (Fair)</option>
                  <option>Type III (Medium)</option>
                  <option>Type IV (Olive)</option>
                  <option>Type V (Brown)</option>
                  <option>Type VI (Black)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-2">Primary Concerns</label>
                <input type="text" placeholder="e.g. Pigmentation, Texture" className="w-full px-5 py-4 rounded-2xl border border-outline-variant outline-primary bg-background/50" />
              </div>
            </div>
            <div className="mt-8 p-6 bg-primary/5 rounded-3xl flex gap-4 items-start">
               <Info className="text-primary mt-1" size={20} />
               <p className="text-xs text-on-surface-variant leading-relaxed">
                 Accurate skin typing is essential for laser safety and chemical peel efficacy. Please ensure the Fitzpatrick assessment is verified during the initial consultation.
               </p>
            </div>
          </motion.section>

          {/* Section 3: Notes */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-panel rounded-[40px] p-10 shadow-premium"
          >
            <div className="flex items-center gap-3 mb-8 text-primary">
              <FileText size={20} />
              <h3 className="font-serif text-2xl text-on-surface">Medical Notes</h3>
            </div>
            <textarea 
              rows={5} 
              placeholder="Enter clinical notes, allergies, or current medications..." 
              className="w-full p-6 rounded-3xl border border-outline-variant outline-primary bg-background/50"
            />
          </motion.section>

          {/* Submit Button */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex justify-end gap-4"
          >
            <button type="button" className="px-10 py-5 rounded-2xl font-bold text-xs uppercase tracking-widest text-on-surface-variant hover:bg-surface-variant transition-all">Discard</button>
            <button 
              type="submit" 
              onClick={(e) => { e.preventDefault(); alert('Patient Profile Created!'); window.location.href = '/dashboard'; }}
              className="bg-primary text-white px-12 py-5 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:shadow-2xl hover:shadow-primary/30 transition-all active:scale-95"
            >
              <Save size={18} />
              Save Patient Profile
            </button>
          </motion.div>
        </form>
      </main>

      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" />
    </div>
  );
}
