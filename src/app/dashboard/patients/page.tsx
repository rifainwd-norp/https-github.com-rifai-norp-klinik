"use client";

import Sidebar from "@/components/Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  Search, 
  Filter, 
  MoreHorizontal, 
  ChevronRight,
  Plus,
  Trash2,
  FileText
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useMemo } from "react";

const INITIAL_PATIENTS = [
  { id: "#PT-8832", name: "Eleanor Rigby", skinType: "III", lastVisit: "Oct 10, 2024", status: "Active", email: "eleanor@example.com" },
  { id: "#PT-4190", name: "Julian Casablancas", skinType: "II", lastVisit: "Sep 28, 2024", status: "Active", email: "julian@strokes.com" },
  { id: "#PT-2201", name: "Sia Furler", skinType: "I", lastVisit: "Aug 15, 2024", status: "Inactive", email: "sia@titanium.com" },
  { id: "#PT-9912", name: "David Bowie", skinType: "IV", lastVisit: "Oct 01, 2024", status: "Active", email: "stardust@mars.com" },
  { id: "#PT-1023", name: "Amy Winehouse", skinType: "II", lastVisit: "Oct 20, 2024", status: "Active", email: "amy@rehab.com" },
];

export default function PatientsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [patients, setPatients] = useState(INITIAL_PATIENTS);

  const filteredPatients = useMemo(() => {
    return patients.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           p.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "All" || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter, patients]);

  const deletePatient = (id: string) => {
    if (confirm("Are you sure you want to archive this patient record?")) {
      setPatients(prev => prev.filter(p => p.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-mesh flex">
      <Sidebar />

      <main className="flex-1 md:ml-72 p-8 md:p-16 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="font-serif text-4xl md:text-5xl text-on-surface mb-4">Patient Registry</h1>
            <p className="text-lg text-on-surface-variant font-medium">Manage and monitor {patients.length} clinical patient records.</p>
          </div>
          <Link 
            href="/dashboard/patients/new" 
            className="bg-primary text-white px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-95"
          >
            <Plus size={18} />
            Add Patient
          </Link>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-outline" size={20} />
            <input 
              type="text" 
              placeholder="Search by name or Patient ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-4 rounded-2xl border border-outline-variant bg-white outline-primary shadow-sm transition-all focus:ring-4 focus:ring-primary/5"
            />
          </div>
          <div className="flex gap-2">
            {["All", "Active", "Inactive"].map(status => (
              <button 
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-6 py-4 rounded-2xl border font-bold text-xs uppercase tracking-widest transition-all ${
                  statusFilter === status 
                  ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                  : "bg-white border-outline-variant text-on-surface hover:bg-surface-variant"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Patient Table */}
        <motion.div 
          layout
          className="glass-panel rounded-[40px] overflow-hidden shadow-premium border border-outline-variant/30"
        >
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant bg-primary/5">
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Patient Details</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Skin Profile</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Last Visit</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Status</th>
                <th className="px-8 py-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              <AnimatePresence>
                {filteredPatients.map((p) => (
                  <motion.tr 
                    key={p.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="group hover:bg-primary/5 transition-colors cursor-pointer"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs overflow-hidden relative">
                           <Image src="/images/hero.png" alt={p.name} fill className="object-cover grayscale opacity-30" sizes="40px" />
                           <span className="relative z-10">{p.name[0]}</span>
                        </div>
                        <div>
                          <p className="font-bold text-on-surface">{p.name}</p>
                          <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">{p.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-3 py-1 rounded-lg bg-surface-variant text-on-surface-variant font-bold text-[10px]">Type {p.skinType}</span>
                    </td>
                    <td className="px-8 py-6 text-sm text-on-surface-variant font-medium">
                      {p.lastVisit}
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                        p.status === 'Active' ? 'bg-primary-container text-primary' : 'bg-outline-variant text-on-surface-variant'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-3 items-center">
                        <button 
                          onClick={(e) => { e.stopPropagation(); deletePatient(p.id); }}
                          className="p-2 text-outline-variant hover:text-error transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={18} />
                        </button>
                        <button className="p-2 text-outline-variant hover:text-primary transition-colors">
                          <FileText size={18} />
                        </button>
                        <ChevronRight size={18} className="text-outline-variant" />
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          
          {filteredPatients.length === 0 && (
            <div className="py-20 text-center space-y-4">
              <div className="w-16 h-16 bg-surface-variant rounded-full flex items-center justify-center mx-auto text-outline-variant">
                <Search size={32} />
              </div>
              <p className="text-on-surface-variant font-medium">No patients found matching your criteria.</p>
              <button onClick={() => { setSearchTerm(""); setStatusFilter("All"); }} className="text-primary font-bold text-sm underline">Clear all filters</button>
            </div>
          )}

          <div className="px-8 py-6 bg-white border-t border-outline-variant flex justify-between items-center text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
             <span>Showing {filteredPatients.length} of {patients.length} Patients</span>
             <div className="flex gap-6">
                <button className="hover:text-primary transition-colors disabled:opacity-30">Previous</button>
                <button className="hover:text-primary transition-colors">Next</button>
             </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
