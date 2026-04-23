"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  CalendarDays, 
  Users, 
  Package, 
  Stethoscope, 
  Settings, 
  PlusCircle,
  Sparkles,
  LogOut,
  ChevronRight,
  Activity,
  History,
  FileText
} from "lucide-react";

const ADMIN_MENU = [
  { label: "Overview", icon: <LayoutDashboard size={20} />, href: "/dashboard" },
  { label: "Schedule", icon: <CalendarDays size={20} />, href: "#" },
  { label: "Patients", icon: <Users size={20} />, href: "/dashboard/patients" },
  { label: "Inventory", icon: <Package size={20} />, href: "#" },
  { label: "EMR Audit", icon: <Stethoscope size={20} />, href: "#" },
  { label: "Settings", icon: <Settings size={20} />, href: "#" },
];

const PATIENT_MENU = [
  { label: "My Journey", icon: <Sparkles size={20} />, href: "/patient" },
  { label: "Appointments", icon: <CalendarDays size={20} />, href: "#" },
  { label: "Recovery Plan", icon: <Activity size={20} />, href: "#" },
  { label: "Treatment History", icon: <History size={20} />, href: "#" },
  { label: "Medical Documents", icon: <FileText size={20} />, href: "#" },
  { label: "Settings", icon: <Settings size={20} />, href: "#" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/dashboard");
  const menuItems = isAdmin ? ADMIN_MENU : PATIENT_MENU;

  return (
    <nav className="h-full w-72 fixed left-0 top-0 z-40 bg-white border-r border-outline-variant/30 hidden md:flex flex-col p-8 gap-10">
      <div className="px-2">
        <Link href="/" className="flex items-center gap-3 group">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white group-hover:rotate-180 transition-transform duration-700 ${isAdmin ? "bg-primary" : "bg-tertiary"}`}>
            <Sparkles size={20} />
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tighter text-on-surface">SERENE</h1>
            <p className={`text-[10px] uppercase tracking-[0.2em] font-bold ${isAdmin ? "text-primary" : "text-tertiary"}`}>
              {isAdmin ? "Clinical Portal" : "Patient Portal"}
            </p>
          </div>
        </Link>
      </div>

      <div className="flex-1 flex flex-col gap-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.label} href={item.href}>
              <motion.div 
                whileHover={{ x: 5 }}
                className={`flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-300 ${
                  isActive 
                  ? `${isAdmin ? "bg-primary" : "bg-tertiary"} text-white shadow-lg font-bold` 
                  : "text-on-surface-variant hover:bg-surface-variant hover:text-on-surface font-medium"
                }`}
              >
                <div className="flex items-center gap-4">
                  {item.icon}
                  <span className="text-sm tracking-wide">{item.label}</span>
                </div>
                {isActive && <motion.div layoutId="active-pill" className="w-1.5 h-1.5 bg-white rounded-full" />}
              </motion.div>
            </Link>
          );
        })}
      </div>

      <div className="space-y-4">
        {isAdmin && (
          <Link href="/dashboard/patients/new">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-primary text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 hover:shadow-2xl hover:shadow-primary/30 transition-all"
            >
              <PlusCircle size={16} />
              New Patient
            </motion.button>
          </Link>
        )}
        
        {!isAdmin && (
          <Link href="/booking">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-tertiary text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 hover:shadow-2xl hover:shadow-tertiary/30 transition-all"
            >
              <CalendarDays size={16} />
              Book Appointment
            </motion.button>
          </Link>
        )}
        
        <button className="w-full flex items-center justify-between px-5 py-4 rounded-2xl text-on-surface-variant hover:bg-error/5 hover:text-error transition-all group">
          <div className="flex items-center gap-4">
            <LogOut size={20} />
            <span className="text-sm font-medium tracking-wide">Logout</span>
          </div>
          <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>
    </nav>
  );
}
