"use client";

import Sidebar from "@/components/Sidebar";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, 
  Search, 
  ArrowRight, 
  MoreVertical, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  Syringe,
  ShieldCheck,
  Stethoscope,
  X
} from "lucide-react";
import { useState, useMemo } from "react";

const INITIAL_APPOINTMENTS = [
  { id: 1, patient: "Eleanor Rigby", service: "Microneedling RF", time: "09:00 AM", status: "Checked In", room: "Suite 02" },
  { id: 2, patient: "Julian Casablancas", service: "BOTOX® Cosmetic", time: "10:30 AM", status: "Upcoming", room: "Suite 04" },
  { id: 3, patient: "Sia Furler", service: "Chemical Peel", time: "01:00 PM", status: "In Progress", room: "Suite 01" },
  { id: 4, patient: "David Bowie", service: "Laser Resurfacing", time: "02:30 PM", status: "Upcoming", room: "Suite 03" },
];

const INITIAL_ALERTS = [
  { id: 1, type: "inventory", title: "Low Stock: Botox 100u", desc: "3 vials remaining. Typical weekly usage is 8 vials.", priority: "High" },
  { id: 2, type: "system", title: "EMR Audit Required", desc: "12 records pending practitioner sign-off.", priority: "Medium" },
];

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [appointments, setAppointments] = useState(INITIAL_APPOINTMENTS);
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);

  const filteredAppointments = useMemo(() => {
    return appointments.filter(a => 
      a.patient.toLowerCase().includes(searchTerm.toLowerCase()) || 
      a.service.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, appointments]);

  const dismissAlert = (id: number) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const updateStatus = (id: number, newStatus: string) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
  };

  return (
    <div className="min-h-screen bg-mesh flex">
      <Sidebar />

      <main className="flex-1 md:ml-72 p-8 md:p-16 max-w-7xl mx-auto w-full">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-8">
          <div>
            <h1 className="font-serif text-4xl md:text-5xl text-on-surface mb-2">Clinical Overview</h1>
            <p className="text-on-surface-variant font-medium">Monitoring clinic performance for Oct 22, 2024.</p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative hidden lg:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={18} />
              <input 
                type="text" 
                placeholder="Search schedule..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-6 py-3 rounded-2xl border border-outline-variant bg-white outline-none focus:border-primary transition-all shadow-sm"
              />
            </div>
            <div className="flex items-center gap-4 bg-white p-2 rounded-full border border-outline-variant shadow-sm pr-6">
              <div className="w-10 h-10 rounded-full border-2 border-primary-container overflow-hidden relative">
                <Image src="/images/hero.png" alt="Admin" fill className="object-cover grayscale" sizes="40px" />
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-bold text-on-surface">Dr. Elena Rossi</p>
                <p className="text-[10px] uppercase tracking-widest text-primary font-bold">Lead Admin</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <StatCard icon={<CheckCircle />} label="Daily Revenue" value="$8,420" sub="+12% from yesterday" />
          <StatCard icon={<RefreshCw />} label="Room Utilization" value="84%" sub="4 of 5 suites active" />
          <StatCard icon={<AlertCircle />} label="Stock Alerts" value={alerts.length.toString()} sub="Critical supplies low" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
          {/* Schedule */}
          <section className="xl:col-span-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-serif text-2xl text-on-surface">Today's Schedule</h2>
              <button className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                Full Calendar <ArrowRight size={14} />
              </button>
            </div>
            
            <div className="space-y-4">
              <AnimatePresence>
                {filteredAppointments.map((apt) => (
                  <motion.div 
                    key={apt.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="glass-panel p-6 rounded-3xl flex flex-col sm:flex-row justify-between items-center gap-6 border border-outline-variant/30 hover:shadow-premium transition-all group"
                  >
                    <div className="flex items-center gap-6">
                      <div className="text-center min-w-[80px]">
                        <p className="text-xl font-serif text-on-surface">{apt.time.split(' ')[0]}</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-primary">{apt.time.split(' ')[1]}</p>
                      </div>
                      <div className="w-px h-12 bg-outline-variant/30 hidden sm:block" />
                      <div>
                        <h4 className="font-bold text-on-surface text-lg">{apt.patient}</h4>
                        <p className="text-sm text-on-surface-variant font-medium">{apt.service} • {apt.room}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                       <select 
                        value={apt.status}
                        onChange={(e) => updateStatus(apt.id, e.target.value)}
                        className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border-none outline-none cursor-pointer ${
                          apt.status === 'Checked In' ? 'bg-primary text-white' : 
                          apt.status === 'In Progress' ? 'bg-tertiary text-white' : 
                          'bg-surface-variant text-on-surface-variant'
                        }`}
                       >
                         <option>Upcoming</option>
                         <option>Checked In</option>
                         <option>In Progress</option>
                         <option>Completed</option>
                       </select>
                       <button className="p-2 text-outline-variant hover:text-primary transition-colors opacity-0 group-hover:opacity-100">
                         <MoreVertical size={20} />
                       </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {filteredAppointments.length === 0 && (
                <div className="py-20 text-center glass-panel rounded-3xl border border-dashed border-outline-variant">
                   <p className="text-on-surface-variant font-medium italic">No appointments match your search.</p>
                </div>
              )}
            </div>
          </section>

          {/* Sidebar: Alerts & Tasks */}
          <aside className="xl:col-span-4 space-y-12">
            <div>
              <h2 className="font-serif text-2xl text-on-surface mb-8">Clinical Alerts</h2>
              <div className="space-y-4">
                <AnimatePresence>
                  {alerts.map((alert) => (
                    <motion.div 
                      key={alert.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className={`p-6 rounded-3xl border ${alert.priority === 'High' ? 'bg-error/5 border-error/20' : 'bg-primary/5 border-primary/20'} relative group`}
                    >
                      <button 
                        onClick={() => dismissAlert(alert.id)}
                        className="absolute top-4 right-4 text-outline-variant hover:text-on-surface opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={16} />
                      </button>
                      <div className="flex gap-4 items-start">
                        <div className={`mt-1 ${alert.priority === 'High' ? 'text-error' : 'text-primary'}`}>
                          {alert.type === 'inventory' ? <Syringe size={20} /> : <ShieldCheck size={20} />}
                        </div>
                        <div>
                          <h4 className="font-bold text-on-surface text-sm mb-1">{alert.title}</h4>
                          <p className="text-xs text-on-surface-variant leading-relaxed font-medium">{alert.desc}</p>
                          <button className={`mt-4 text-[10px] font-bold uppercase tracking-widest ${alert.priority === 'High' ? 'text-error' : 'text-primary'} hover:underline`}>
                            {alert.type === 'inventory' ? 'Order Supplies' : 'Resolve Task'}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {alerts.length === 0 && (
                  <div className="p-8 text-center bg-primary/5 rounded-3xl border border-dashed border-primary/20">
                     <CheckCircle className="mx-auto text-primary mb-3" size={32} />
                     <p className="text-sm font-bold text-primary uppercase tracking-widest">All Clear</p>
                  </div>
                )}
              </div>
            </div>

            <div className="glass-panel p-8 rounded-4xl border border-outline-variant/30">
               <div className="flex items-center gap-3 mb-6 text-primary">
                 <Stethoscope size={20} />
                 <h3 className="font-bold text-sm uppercase tracking-widest">EMR Audit Path</h3>
               </div>
               <p className="text-sm text-on-surface-variant font-medium leading-relaxed mb-6">
                 Routine system audit scheduled for 11:00 PM. No manual action required.
               </p>
               <div className="w-full h-2 bg-outline-variant/20 rounded-full overflow-hidden">
                 <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "65%" }}
                  className="h-full bg-primary"
                 />
               </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon, label, value, sub }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="glass-panel p-8 rounded-4xl border border-outline-variant/30 shadow-premium"
    >
      <div className="flex justify-between items-start mb-6">
        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
          {icon}
        </div>
      </div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">{label}</p>
      <h3 className="text-4xl font-serif text-on-surface mb-2">{value}</h3>
      <p className="text-xs font-bold text-primary">{sub}</p>
    </motion.div>
  );
}
