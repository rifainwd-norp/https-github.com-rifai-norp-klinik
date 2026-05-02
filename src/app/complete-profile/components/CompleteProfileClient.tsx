"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { 
  User, 
  Phone, 
  Calendar, 
  Droplets, 
  AlertCircle,
  ArrowRight,
  Sparkles,
  Loader2,
  MapPin,
  VenusAndMars
} from "lucide-react";
import { motion } from "framer-motion";

export default function CompleteProfileClient() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    gender: "Female",
    birth_date: "",
    skin_type: "Normal",
    allergies: "",
    address: ""
  });

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function checkProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (profile?.phone && profile?.address) {
        router.push("/dashboard");
      } else {
        setFormData(prev => ({ ...prev, full_name: profile?.full_name || "" }));
      }
    }
    checkProfile();
  }, [supabase, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase.from("profiles").update({ ...formData }).eq("id", user.id);
      if (!error) router.push("/dashboard");
      else alert("Error: " + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-3xl w-full bg-white rounded-[40px] shadow-premium p-10 lg:p-16">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mx-auto mb-6"><Sparkles size={32} /></div>
          <h1 className="font-serif text-4xl text-on-surface mb-2">Patient Intake Form</h1>
          <p className="text-on-surface-variant font-medium">Lengkapi data Anda untuk pelayanan terbaik kami.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-primary ml-2">Full Name</label>
              <div className="relative"><User className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} /><input required type="text" value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} className="w-full pl-12 pr-6 py-4 rounded-2xl border border-outline-variant outline-none focus:border-primary bg-surface-variant/10 text-sm font-bold" /></div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-primary ml-2">WhatsApp Number</label>
              <div className="relative"><Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} /><input required type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full pl-12 pr-6 py-4 rounded-2xl border border-outline-variant outline-none focus:border-primary bg-surface-variant/10 text-sm font-bold" /></div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-primary ml-2">Gender</label>
              <div className="relative"><VenusAndMars className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} /><select value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} className="w-full pl-12 pr-6 py-4 rounded-2xl border border-outline-variant outline-none focus:border-primary bg-surface-variant/10 text-sm font-bold appearance-none"><option>Female</option><option>Male</option><option>Other</option></select></div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-primary ml-2">Date of Birth</label>
              <div className="relative"><Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} /><input required type="date" value={formData.birth_date} onChange={(e) => setFormData({...formData, birth_date: e.target.value})} className="w-full pl-12 pr-6 py-4 rounded-2xl border border-outline-variant outline-none focus:border-primary bg-surface-variant/10 text-sm font-bold" /></div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-primary ml-2">Skin Type</label>
              <div className="relative"><Droplets className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} /><select value={formData.skin_type} onChange={(e) => setFormData({...formData, skin_type: e.target.value})} className="w-full pl-12 pr-6 py-4 rounded-2xl border border-outline-variant outline-none focus:border-primary bg-surface-variant/10 text-sm font-bold appearance-none"><option>Normal</option><option>Dry</option><option>Oily</option><option>Combination</option><option>Sensitive</option></select></div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-primary ml-2">Home Address</label>
              <div className="relative"><MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} /><input required type="text" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full pl-12 pr-6 py-4 rounded-2xl border border-outline-variant outline-none focus:border-primary bg-surface-variant/10 text-sm font-bold" placeholder="Street name, City..." /></div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-primary ml-2">Allergies & Medical History</label>
            <div className="relative"><AlertCircle className="absolute left-4 top-4 text-on-surface-variant" size={18} /><textarea value={formData.allergies} onChange={(e) => setFormData({...formData, allergies: e.target.value})} className="w-full pl-12 pr-6 py-4 rounded-2xl border border-outline-variant outline-none focus:border-primary bg-surface-variant/10 text-sm h-32" placeholder="List any known allergies or skin conditions..." /></div>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-primary text-white py-5 rounded-3xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all">{loading ? <Loader2 className="animate-spin" size={20} /> : <>Register & Continue to Dashboard <ArrowRight size={18} /></>}</button>
        </form>
      </motion.div>
    </div>
  );
}
