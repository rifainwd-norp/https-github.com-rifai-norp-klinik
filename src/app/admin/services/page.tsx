"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Loader2, 
  Save, 
  X, 
  ArrowLeft,
  Scissors,
  Stethoscope,
  Sparkles,
  Droplets,
  Package,
  Tag,
  LayoutGrid,
  List as ListIcon,
  Filter,
  Download
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DeleteConfirmationModal } from "../inventory/page";

type Service = {
  id: string;
  name: string;
  category: string;
  price: string;
  description: string;
  duration_minutes: number;
  materials_used: string;
  promo_discount_percent: number;
};

type InventoryItem = {
  id: string;
  name: string;
  category: string;
  price_per_unit: number;
};

type ViewMode = "grid" | "table";

export default function ServiceManagement() {
  const [services, setServices] = useState<Service[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedImports, setSelectedImports] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    name: "",
    category: "Facial",
    price: "",
    description: "",
    duration_minutes: 60,
    materials_used: "",
    promo_discount_percent: 0
  });

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const [svcRes, invRes] = await Promise.all([
      supabase.from("services").select("*").order("name"),
      supabase.from("inventory").select("id, name, category, price_per_unit").order("name")
    ]);
    
    if (svcRes.data) setServices(svcRes.data);
    if (invRes.data) setInventory(invRes.data);
    setLoading(false);
  }

  const handleSave = async () => {
    setLoading(true);
    const payload = { ...formData, price: parseInt(formData.price) };
    
    if (editingId) {
      await supabase.from("services").update(payload).eq("id", editingId);
    } else {
      await supabase.from("services").insert([payload]);
    }
    
    await fetchData();
    resetForm();
  };

  const handleImport = async () => {
    setLoading(true);
    const itemsToImport = inventory.filter(i => selectedImports.includes(i.id));
    
    const newServices = itemsToImport.map(item => ({
      name: item.name,
      category: "Skincare",
      price: item.price_per_unit || 0,
      description: `Product imported from inventory: ${item.name}`,
      duration_minutes: 0,
      promo_discount_percent: 0
    }));

    const { error } = await supabase.from("services").insert(newServices);
    if (error) console.error(error);
    
    await fetchData();
    setIsImporting(false);
    setSelectedImports([]);
  };

  const handleInlineUpdate = async (id: string, updates: Partial<Service>) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    const { error } = await supabase.from("services").update(updates).eq("id", id);
    if (error) {
      console.error(error);
      fetchData();
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from("services").delete().eq("id", id);
    await fetchData();
    setIsDeleting(null);
  };

  const resetForm = () => { 
    setIsAdding(false); 
    setEditingId(null); 
    setFormData({ 
      name: "", 
      category: "Facial", 
      price: "", 
      description: "", 
      duration_minutes: 60, 
      materials_used: "", 
      promo_discount_percent: 0 
    }); 
  };

  if (loading && services.length === 0) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin text-primary" size={40} /></div>;

  const categories = ["All", ...Array.from(new Set(services.map(s => s.category)))];

  const filteredServices = services.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || s.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const availableInventory = inventory.filter(inv => !services.some(svc => svc.name === inv.name));

  return (
    <div className="min-h-screen bg-[#FDFDFD] p-6 lg:p-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div className="flex items-center gap-6">
           <button onClick={() => router.back()} className="w-12 h-12 rounded-full bg-white border border-outline-variant flex items-center justify-center text-on-surface-variant hover:text-primary transition-all shadow-sm"><ArrowLeft size={20} /></button>
           <div>
              <h1 className="font-serif text-4xl text-on-surface mb-2">Service Catalog</h1>
              <p className="text-on-surface-variant text-sm font-medium">Manage treatments and product promotions</p>
           </div>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="bg-white p-1.5 rounded-2xl border border-outline-variant flex items-center gap-1 shadow-sm">
              <button onClick={() => setViewMode("grid")} className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}><LayoutGrid size={18}/></button>
              <button onClick={() => setViewMode("table")} className={`p-2.5 rounded-xl transition-all ${viewMode === 'table' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}><ListIcon size={18}/></button>
           </div>
           <button onClick={() => setIsImporting(true)} className="bg-white border border-slate-900 text-slate-900 px-8 py-4 rounded-2xl text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all"><Download size={18} /> Import</button>
           <button onClick={() => setIsAdding(true)} className="bg-primary text-white px-8 py-4 rounded-2xl text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"><Plus size={18} /> New Entry</button>
        </div>
      </header>

      {/* SEARCH & FILTER BAR */}
      <div className="flex flex-col lg:flex-row gap-6 mb-12 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-on-surface-variant" size={20} />
          <input type="text" placeholder="Search by name..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-16 pr-8 py-5 rounded-2xl border border-outline-variant bg-white focus:border-primary outline-none text-sm transition-all shadow-sm" />
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-2 w-full lg:w-auto no-scrollbar">
           <div className="flex items-center gap-2 text-slate-400 mr-2"><Filter size={16}/> <span className="text-[10px] font-bold uppercase tracking-widest">Filter:</span></div>
           {categories.map(cat => (
             <button 
               key={cat} 
               onClick={() => setSelectedCategory(cat)} 
               className={`px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap border ${selectedCategory === cat ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20' : 'bg-white text-slate-500 border-outline-variant hover:border-slate-300'}`}
             >
               {cat}
             </button>
           ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === "grid" ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} key="grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredServices.map((service, index) => (
              <motion.div layout key={service.id || `service-${index}`} className="group bg-white rounded-[40px] p-10 border border-outline-variant hover:border-primary/30 transition-all shadow-sm hover:shadow-xl hover:shadow-primary/5 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                 
                 <div className="relative">
                    <div className="flex justify-between items-start mb-8">
                       <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-primary group-hover:bg-primary/10 transition-all duration-500">
                          {service.category === 'Facial' ? <Sparkles size={28}/> : service.category === 'Peeling' ? <Droplets size={28}/> : service.category === 'Skincare' ? <Package size={28}/> : <Stethoscope size={28}/>}
                       </div>
                       <div className="flex gap-2">
                          <button onClick={() => { setEditingId(service.id); setFormData({ ...service, price: service.price.toString() }); setIsAdding(true); }} className="p-3 rounded-xl hover:bg-primary/10 text-slate-400 hover:text-primary transition-all"><Edit2 size={18} /></button>
                          <button onClick={() => setIsDeleting(service.id)} className="p-3 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-600 transition-all"><Trash2 size={18} /></button>
                       </div>
                    </div>
                    
                    <div className="mb-6">
                       <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-2">{service.category}</p>
                       <h3 className="font-serif text-2xl text-on-surface mb-2 group-hover:text-primary transition-colors">{service.name}</h3>
                       {service.promo_discount_percent > 0 && (
                          <div className="flex items-center gap-1.5 text-[10px] font-black text-red-600 uppercase tracking-widest bg-red-50 px-3 py-1 rounded-full w-fit">
                             <Tag size={12}/> Promo {service.promo_discount_percent}% Off
                          </div>
                       )}
                    </div>

                    <div className="flex items-baseline gap-1 mb-8">
                       <span className="text-xs font-bold text-on-surface-variant">Rp</span>
                       <span className="text-3xl font-serif text-on-surface">{parseInt(service.price).toLocaleString('id-ID')}</span>
                    </div>

                    <div className="pt-8 border-t border-outline-variant flex justify-between items-center">
                       <div className="flex items-center gap-2 text-on-surface-variant">
                          <Package size={14}/>
                          <span className="text-[10px] font-bold uppercase tracking-widest">{service.materials_used ? "Supplies Linked" : "No Supplies"}</span>
                       </div>
                       <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-full">{service.duration_minutes} MIN</span>
                    </div>
                 </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} key="table" className="bg-white rounded-[40px] border border-outline-variant shadow-sm overflow-hidden">
             <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[1000px]">
                   <thead>
                      <tr className="bg-slate-50 border-b">
                         <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Name & Category</th>
                         <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Base Price (Rp)</th>
                         <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Discount (%)</th>
                         <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Final Price</th>
                         <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Actions</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-outline-variant">
                      {filteredServices.map((service, index) => {
                         const base = parseInt(service.price);
                         const disc = service.promo_discount_percent || 0;
                         const final = base - (base * disc / 100);
                         
                         return (
                           <tr key={service.id || `row-${index}`} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-8 py-6">
                                 <p className="text-sm font-bold text-slate-900 mb-1">{service.name}</p>
                                 <p className="text-[9px] font-black text-primary uppercase tracking-widest">{service.category}</p>
                              </td>
                              <td className="px-8 py-6">
                                 <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-slate-300">Rp</span>
                                    <input 
                                      type="number" 
                                      value={service.price} 
                                      onChange={(e) => handleInlineUpdate(service.id, { price: e.target.value })}
                                      className="bg-transparent font-serif text-lg text-slate-700 outline-none focus:text-primary w-28"
                                    />
                                 </div>
                              </td>
                              <td className="px-8 py-6">
                                 <div className="flex items-center justify-center gap-2 bg-red-50/50 rounded-2xl px-4 py-2 border border-red-100/50">
                                    <input 
                                      type="number" 
                                      value={service.promo_discount_percent} 
                                      onChange={(e) => handleInlineUpdate(service.id, { promo_discount_percent: parseInt(e.target.value) || 0 })}
                                      className="bg-transparent font-serif text-lg text-red-600 outline-none text-center w-12"
                                    />
                                    <span className="text-red-300 font-serif text-lg">%</span>
                                 </div>
                              </td>
                              <td className="px-8 py-6 text-right">
                                 <p className="text-sm font-bold text-slate-400 line-through text-[10px] mb-1">Rp {base.toLocaleString('id-ID')}</p>
                                 <p className="font-serif text-xl text-slate-900">Rp {final.toLocaleString('id-ID')}</p>
                              </td>
                              <td className="px-8 py-6 text-right">
                                 <div className="flex justify-end gap-2">
                                    <button onClick={() => { setEditingId(service.id); setFormData({ ...service, price: service.price.toString() }); setIsAdding(true); }} className="p-3 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-all"><Edit2 size={16} /></button>
                                    <button onClick={() => setIsDeleting(service.id)} className="p-3 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-600 transition-all"><Trash2 size={16} /></button>
                                 </div>
                              </td>
                           </tr>
                         );
                      })}
                   </tbody>
                </table>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* IMPORT MODAL */}
      <AnimatePresence>
         {isImporting && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsImporting(false)} className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm" />
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl p-10 flex flex-col max-h-[80vh]">
                 <div className="flex justify-between items-center mb-8">
                    <div>
                       <h2 className="font-serif text-3xl">Import from Inventory</h2>
                       <p className="text-xs text-slate-500 font-medium">Select warehouse items to sell in catalog</p>
                    </div>
                    <button onClick={() => setIsImporting(false)} className="text-slate-400 hover:text-red-500"><X size={24}/></button>
                 </div>
                 
                 <div className="flex-1 overflow-y-auto space-y-2 mb-8 pr-2">
                    {availableInventory.length === 0 ? (
                      <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                         <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">All inventory items are already in catalog</p>
                      </div>
                    ) : (
                      availableInventory.map(item => (
                        <div 
                          key={item.id} 
                          onClick={() => setSelectedImports(prev => prev.includes(item.id) ? prev.filter(id => id !== item.id) : [...prev, item.id])}
                          className={`p-5 rounded-3xl border transition-all cursor-pointer flex justify-between items-center ${selectedImports.includes(item.id) ? 'bg-primary/5 border-primary shadow-sm' : 'bg-white border-slate-100 hover:border-slate-300'}`}
                        >
                           <div className="flex items-center gap-4">
                              <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${selectedImports.includes(item.id) ? 'bg-primary border-primary text-white' : 'border-slate-200'}`}>
                                 {selectedImports.includes(item.id) && <Plus size={14}/>}
                              </div>
                              <div>
                                 <p className="text-sm font-bold text-slate-900">{item.name}</p>
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.category}</p>
                              </div>
                           </div>
                           <div className="text-right">
                              <p className="text-xs font-bold text-slate-400 mb-1">Stock Ref Price</p>
                              <p className="text-sm font-serif text-slate-900">Rp {(item.price_per_unit || 0).toLocaleString('id-ID')}</p>
                           </div>
                        </div>
                      ))
                    )}
                 </div>

                 <button 
                   onClick={handleImport}
                   disabled={selectedImports.length === 0}
                   className="w-full bg-slate-900 text-white py-5 rounded-3xl font-bold uppercase tracking-widest text-xs shadow-xl shadow-slate-900/20 active:scale-95 transition-all disabled:opacity-30 flex items-center justify-center gap-2"
                 >
                    <Download size={18}/> Import {selectedImports.length} Items to Catalog
                 </button>
              </motion.div>
           </div>
         )}
      </AnimatePresence>

      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={resetForm} className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm" />
             <motion.div initial={{ opacity: 0, y: 50, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 50, scale: 0.95 }} className="relative w-full max-w-xl bg-white rounded-5xl shadow-2xl p-12 overflow-y-auto max-h-[90vh]">
                <div className="flex justify-between items-center mb-10">
                   <h2 className="font-serif text-3xl text-on-surface">{editingId ? "Edit Item" : "New Entry"}</h2>
                   <button onClick={resetForm} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-red-600 transition-all"><X size={20} /></button>
                </div>

                <div className="space-y-6">
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-2">Name</label>
                        <input type="text" placeholder="e.g. SilkPeel Dermalinfusion" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-6 py-4 rounded-2xl border border-outline-variant focus:border-primary outline-none transition-all text-sm font-medium" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-2">Category</label>
                        <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-6 py-4 rounded-2xl border border-outline-variant focus:border-primary outline-none transition-all text-sm font-medium appearance-none bg-white">
                           <option>Facial</option><option>Peeling</option><option>Injection</option><option>Laser</option><option>Skincare</option>
                        </select>
                      </div>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-2">Price (Rp)</label>
                        <input type="number" placeholder="500000" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full px-6 py-4 rounded-2xl border border-outline-variant focus:border-primary outline-none transition-all text-sm font-bold" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-2">Duration (Min)</label>
                        <input type="number" value={formData.duration_minutes} onChange={e => setFormData({...formData, duration_minutes: parseInt(e.target.value)})} className="w-full px-6 py-4 rounded-2xl border border-outline-variant focus:border-primary outline-none transition-all text-sm font-medium" />
                      </div>
                   </div>
                   <div className="space-y-1">
                     <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-2">Description</label>
                     <textarea placeholder="Clinical outcomes and procedure details..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-6 py-4 rounded-2xl border border-outline-variant focus:border-primary outline-none transition-all text-sm h-32 resize-none font-medium" />
                   </div>
                   
                   <div className="p-6 bg-red-50 rounded-3xl border border-red-100">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-red-600 mb-2 block">Promo Discount (%)</label>
                      <div className="flex items-center gap-4">
                        <input 
                          type="number" 
                          min="0" 
                          max="100" 
                          value={formData.promo_discount_percent} 
                          onChange={e => setFormData({...formData, promo_discount_percent: parseInt(e.target.value) || 0})} 
                          className="w-full px-6 py-4 rounded-2xl border border-red-200 bg-white font-bold text-red-600 focus:border-red-500 outline-none" 
                        />
                        <span className="text-xl font-serif text-red-300">%</span>
                      </div>
                   </div>

                   <button onClick={handleSave} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 shadow-xl shadow-slate-900/20 transition-all active:scale-95 mt-4 hover:bg-slate-800"><Save size={18} /> Update Catalog</button>
                </div>
             </motion.div>
          </div>
        )}

        <DeleteConfirmationModal 
          isOpen={!!isDeleting} 
          onClose={() => setIsDeleting(null)} 
          onConfirm={() => isDeleting && handleDelete(isDeleting)} 
          title="Archive Item?"
          description="Are you sure you want to remove this item from the catalog? Past records will be preserved."
        />
      </AnimatePresence>
    </div>
  );
}
