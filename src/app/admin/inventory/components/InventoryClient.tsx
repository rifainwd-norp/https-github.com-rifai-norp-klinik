"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import { 
  Plus, Search, Edit2, Trash2, Loader2, Save, X, ArrowLeft,
  Package, Tag, List as ListIcon, LayoutGrid, AlertTriangle, 
  LayoutDashboard, Stethoscope, Layers, FileText, TrendingUp, Users, LogOut, ChevronRight,
  Sparkles, Link2, Archive, RefreshCw, CheckCircle2, TrendingDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { 
  adminSaveInventory, 
  adminDeleteInventory, 
  adminSaveRelation, 
  adminDeleteRelation,
  getInventoryData
} from "@/app/actions/admin";

type InventoryItem = {
  id: string;
  name: string;
  category: string;
  stock_quantity: number;
  min_threshold: number;
  unit: string;
  price_per_unit: number;
};

type Service = {
  id: string;
  name: string;
  category: string;
};

type ServiceInventoryLink = {
  id: string;
  service_id: string;
  inventory_id: string;
  qty_per_treatment: number;
  unit: string;
  services?: { name: string };
  inventory?: { name: string; unit: string };
};

export default function InventoryClient() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [links, setLinks] = useState<ServiceInventoryLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<"stock" | "relations">("stock");
  const [userProfile, setUserProfile] = useState<any>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Form states
  const [isAddingStock, setIsAddingStock] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [stockForm, setStockForm] = useState({
    name: "", category: "Consumables", stock_quantity: 0,
    min_threshold: 5, unit: "pcs", price_per_unit: 0
  });

  const [isAddingLink, setIsAddingLink] = useState(false);
  const [linkForm, setLinkForm] = useState({
    service_id: "", inventory_id: "", qty_per_treatment: 1, unit: "pcs"
  });

  const [deleteTarget, setDeleteTarget] = useState<{ id: string, type: 'stock' | 'relation' } | null>(null);

  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        setUserProfile(data);
      }
      fetchData();
    }
    init();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getInventoryData();
      setItems(data.items);
      setServices(data.services as any);
      setLinks(data.links as any);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleSaveStock = async () => {
    setIsProcessing(true);
    try {
      const payload = editingId ? { ...stockForm, id: editingId } : stockForm;
      await adminSaveInventory(payload);
      await fetchData();
      showStatus('success', "Stock update confirmed");
      resetStockForm();
    } catch (e) { showStatus('error', "Failed to sync inventory"); }
    setIsProcessing(false);
  };

  const executeDelete = async () => {
    if (!deleteTarget) return;
    setIsProcessing(true);
    try {
      if (deleteTarget.type === 'stock') await adminDeleteInventory(deleteTarget.id);
      else await adminDeleteRelation(deleteTarget.id);
      await fetchData();
      showStatus('success', "Archived successfully");
    } catch (e) { showStatus('error', "Deletion failed"); }
    finally { setIsProcessing(false); setDeleteTarget(null); }
  };

  const handleSaveLink = async () => {
    setIsProcessing(true);
    try {
      await adminSaveRelation(linkForm);
      await fetchData();
      setIsAddingLink(false);
      setLinkForm({ service_id: "", inventory_id: "", qty_per_treatment: 1, unit: "pcs" });
      showStatus('success', "Clinical relation established");
    } catch (e) { showStatus('error', "Relation already exists"); }
    setIsProcessing(false);
  };

  const showStatus = (type: 'success' | 'error', text: string) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const resetStockForm = () => {
    setIsAddingStock(false);
    setEditingId(null);
    setStockForm({ name: "", category: "Consumables", stock_quantity: 0, min_threshold: 5, unit: "pcs", price_per_unit: 0 });
  };

  if (loading && items.length === 0) return <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]"><Loader2 className="animate-spin text-slate-900" size={40} /></div>;

  const lowStockCount = items.filter(i => i.stock_quantity <= i.min_threshold).length;

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col lg:flex-row font-sans text-slate-900">
      {/* SHARED PREMIUM SIDEBAR */}
      <aside className="fixed inset-y-0 left-0 w-80 bg-white border-r border-slate-100 flex-col z-50 hidden lg:flex">
        <div className="p-10 flex flex-col grow">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg"><Sparkles size={20} /></div>
            <span className="text-2xl font-serif font-black tracking-tighter">SERENE</span>
          </div>

          <nav className="space-y-1.5 mb-10">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-300 mb-4 px-4">Core Operations</p>
            <Link href="/admin"><NavItem icon={<LayoutDashboard size={20} />} label="Patient Queue" active={pathname === '/admin'} /></Link>
            <Link href="/admin/treatments"><NavItem icon={<Stethoscope size={20} />} label="Treatments" active={pathname === '/admin/treatments'} /></Link>
            <Link href="/admin/products"><NavItem icon={<Package size={20} />} label="Products" active={pathname === '/admin/products'} /></Link>
            <Link href="/admin/inventory"><NavItem icon={<Layers size={20} />} label="Stock Control" active={pathname === '/admin/inventory'} /></Link>
            
            {userProfile?.role === 'admin' && (
              <>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-300 mt-10 mb-4 px-4">Intelligence</p>
                <Link href="/admin/reports"><NavItem icon={<FileText size={20} />} label="Financial Intelligence" active={pathname === '/admin/reports'} /></Link>
                <Link href="/admin/statistics"><NavItem icon={<TrendingUp size={20} />} label="Clinic Analytics" active={pathname === '/admin/statistics'} /></Link>
                <Link href="/admin/users"><NavItem icon={<Users size={20} />} label="Staff Access" active={pathname === '/admin/users'} /></Link>
              </>
            )}
          </nav>

          <div className="mt-auto">
             <div className="bg-slate-50 p-6 rounded-4xl mb-8 group cursor-pointer hover:bg-slate-900 transition-all duration-500">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center font-bold group-hover:bg-slate-800 transition-all">{userProfile?.full_name?.[0]}</div>
                   <div>
                      <p className="text-xs font-black group-hover:text-white transition-colors uppercase tracking-widest">{userProfile?.full_name}</p>
                      <p className="text-[10px] font-bold text-slate-400 group-hover:text-slate-500 transition-colors uppercase tracking-widest">{userProfile?.role}</p>
                   </div>
                </div>
             </div>
             <button onClick={async () => { await supabase.auth.signOut(); router.push("/login"); }} className="w-full flex items-center justify-between px-6 py-4 rounded-2xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all text-[10px] font-black uppercase tracking-[0.2em]">
                Logout System <LogOut size={16} />
             </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-6 lg:p-16 lg:ml-80 transition-all duration-500">
        <header className="mb-16 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="space-y-2">
               <h1 className="font-serif text-5xl lg:text-6xl text-slate-900 tracking-tighter">Stock Intelligence</h1>
               <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.25em]">Warehouse & Clinical Materials</p>
            </div>
            
            <div className="flex items-center gap-4">
               <Link href="/admin/inventory/report" className="bg-white border border-slate-100 text-slate-900 px-8 py-4 rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 shadow-sm hover:bg-slate-50 transition-all">
                  <Archive size={16} /> Export
               </Link>
               <button onClick={() => activeTab === "stock" ? setIsAddingStock(true) : setIsAddingLink(true)} className="bg-slate-900 text-white px-10 py-4 rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 shadow-2xl shadow-slate-200 active:scale-95 transition-all">
                  <Plus size={18} /> {activeTab === "stock" ? "New Item" : "New Relation"}
               </button>
            </div>
        </header>

        {/* STATS - EXECUTIVE POLISH */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <InvStatCard label="Total Inventory" value={items.length} icon={<Package className="text-slate-500"/>} color="bg-slate-50 text-slate-700"/>
            <InvStatCard label="Low Stock Alert" value={lowStockCount} icon={<AlertTriangle className={lowStockCount > 0 ? "text-red-500" : "text-emerald-500"}/>} color={lowStockCount > 0 ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"} />
            <InvStatCard label="Active Relations" value={links.length} icon={<Link2 className="text-blue-500"/>} color="bg-blue-50 text-blue-700" />
        </div>

        {/* TABS - MASTER DESIGN */}
        <div className="flex bg-white rounded-3xl p-2 border border-slate-100 mb-12 w-fit shadow-sm">
           <button onClick={() => setActiveTab("stock")} className={`px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === "stock" ? "bg-slate-900 text-white shadow-xl shadow-slate-200" : "text-slate-400 hover:text-slate-900"}`}>
              <Package size={14} className="inline mr-2" /> Stock Management
           </button>
           <button onClick={() => setActiveTab("relations")} className={`px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === "relations" ? "bg-slate-900 text-white shadow-xl shadow-slate-200" : "text-slate-400 hover:text-slate-900"}`}>
              <Link2 size={14} className="inline mr-2" /> Clinical Protocol
           </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "stock" ? (
             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} key="stock" className="bg-white rounded-5xl border border-slate-100 shadow-xl shadow-slate-100 overflow-hidden overflow-x-auto">
               <table className="w-full text-left min-w-[1000px]">
                  <thead className="bg-slate-50/50 border-b border-slate-100">
                     <tr>
                        <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Inventory Item</th>
                        <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Status & Stock</th>
                        <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Inventory Value</th>
                        <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {items.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/30 transition-all text-sm group">
                           <td className="px-10 py-8">
                              <p className="font-black text-slate-900 text-base mb-1">{item.name}</p>
                              <p className="text-[9px] font-black text-primary bg-primary/5 w-fit px-3 py-1 rounded-full uppercase tracking-widest">{item.category}</p>
                           </td>
                           <td className="px-10 py-8">
                              <div className="flex items-center gap-3">
                                 <div className={`w-2.5 h-2.5 rounded-full ${item.stock_quantity > item.min_threshold ? 'bg-emerald-500' : 'bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`} />
                                 <span className={`font-black ${item.stock_quantity <= item.min_threshold ? 'text-red-600' : 'text-slate-700'}`}>{item.stock_quantity} {item.unit}</span>
                                 <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">/ Min {item.min_threshold}</span>
                              </div>
                           </td>
                           <td className="px-10 py-8">
                              <p className="text-sm font-black text-slate-900">Rp {(item.stock_quantity * item.price_per_unit).toLocaleString('id-ID')}</p>
                              <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">Rate: Rp {item.price_per_unit.toLocaleString('id-ID')}</p>
                           </td>
                           <td className="px-10 py-8 text-right">
                              <div className="flex justify-end gap-2">
                                 <button onClick={() => { setEditingId(item.id); setStockForm({...item}); setIsAddingStock(true); }} className="p-4 text-slate-300 hover:text-slate-900 transition-all"><Edit2 size={20}/></button>
                                 <button onClick={() => setDeleteTarget({ id: item.id, type: 'stock' })} className="p-4 text-slate-300 hover:text-red-500 transition-all"><Trash2 size={20}/></button>
                              </div>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </motion.div>
          ) : (
             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} key="relations" className="space-y-8">
               <div className="p-8 bg-blue-50/50 rounded-4xl border border-blue-100/50 flex items-start gap-5">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-500 shadow-sm"><RefreshCw size={24} className="animate-spin-slow" /></div>
                  <div>
                     <p className="text-sm font-black text-blue-900 uppercase tracking-widest mb-1">Clinical Automation Logic</p>
                     <p className="text-xs text-blue-700 leading-relaxed max-w-2xl font-medium">These relations govern automatic stock depletion. When a treatment phase concludes at the dashboard, the linked materials will be deducted from warehouse inventory automatically.</p>
                  </div>
               </div>

                <div className="bg-white rounded-5xl border border-slate-100 shadow-xl shadow-slate-100 overflow-hidden overflow-x-auto">
                  <table className="w-full text-left min-w-[800px]">
                     <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                           <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Clinical Service</th>
                           <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Material Linked</th>
                           <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Consumption Rate</th>
                           <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 text-right">Actions</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        {links.map((link) => (
                           <tr key={link.id} className="hover:bg-slate-50/30 transition-all text-sm group">
                              <td className="px-10 py-8">
                                 <p className="font-black text-slate-900 text-base">{link.services?.name}</p>
                              </td>
                              <td className="px-10 py-8">
                                 <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-primary transition-colors"><Layers size={20}/></div>
                                    <p className="font-black text-slate-900">{link.inventory?.name}</p>
                                 </div>
                              </td>
                              <td className="px-10 py-8">
                                 <div className="bg-slate-50 px-5 py-2 rounded-2xl border border-slate-100 w-fit">
                                    <span className="text-primary font-black text-sm">{link.qty_per_treatment}</span>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-2">{link.unit || link.inventory?.unit}</span>
                                 </div>
                              </td>
                              <td className="px-10 py-8 text-right">
                                 <button onClick={() => setDeleteTarget({ id: link.id, type: 'relation' })} className="p-4 text-slate-300 hover:text-red-500 transition-all"><Trash2 size={20}/></button>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MODALS - MASTER STYLE */}
        <AnimatePresence>
           {isAddingStock && (
             <div className="fixed inset-0 z-100 flex items-center justify-center p-6">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={resetStockForm} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
                <motion.div initial={{ opacity: 0, y: 100, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 100, scale: 0.9 }} className="relative w-full max-w-2xl bg-white rounded-[56px] shadow-2xl p-16 overflow-y-auto max-h-[90vh]">
                   <div className="flex justify-between items-center mb-12">
                      <h2 className="font-serif text-4xl text-slate-900">{editingId ? "Refine Item" : "New Material Entry"}</h2>
                      <button onClick={resetStockForm} className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-red-500 transition-all"><X size={24}/></button>
                   </div>
                   <div className="space-y-8">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Item Identity</label>
                          <input type="text" value={stockForm.name} onChange={e => setStockForm({...stockForm, name: e.target.value})} className="w-full px-8 py-5 rounded-3xl border border-slate-100 bg-slate-50/50 outline-none focus:bg-white focus:border-slate-900 transition-all text-sm font-black" placeholder="e.g. Clinical Serum-X" />
                       </div>
                       <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Category</label><select value={stockForm.category} onChange={e => setStockForm({...stockForm, category: e.target.value})} className="w-full px-8 py-5 rounded-3xl border border-slate-100 bg-slate-50/50 outline-none focus:bg-white focus:border-slate-900 transition-all text-sm font-black appearance-none"><option>Skincare</option><option>Tools</option><option>Consumables</option><option>Supplies</option></select></div>
                          <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Unit Type</label><input type="text" value={stockForm.unit} onChange={e => setStockForm({...stockForm, unit: e.target.value})} className="w-full px-8 py-5 rounded-3xl border border-slate-100 bg-slate-50/50 outline-none focus:bg-white focus:border-slate-900 transition-all text-sm font-black" placeholder="pcs / ml" /></div>
                       </div>
                       <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">{editingId ? "Adjust Qty" : "Initial Qty"}</label><input type="number" value={stockForm.stock_quantity} onChange={e => setStockForm({...stockForm, stock_quantity: parseFloat(e.target.value) || 0})} className="w-full px-8 py-5 rounded-3xl border border-slate-100 bg-slate-50/50 outline-none focus:bg-white focus:border-slate-900 transition-all text-sm font-black" /></div>
                          <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Safety Level</label><input type="number" value={stockForm.min_threshold} onChange={e => setStockForm({...stockForm, min_threshold: parseFloat(e.target.value) || 0})} className="w-full px-8 py-5 rounded-3xl border border-slate-100 bg-slate-50/50 outline-none focus:bg-white focus:border-slate-900 transition-all text-sm font-black" /></div>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Unit Cost (IDR)</label>
                          <input type="number" value={stockForm.price_per_unit} onChange={e => setStockForm({...stockForm, price_per_unit: parseInt(e.target.value) || 0})} className="w-full px-8 py-5 rounded-3xl border border-slate-100 bg-slate-50/50 outline-none focus:bg-white focus:border-slate-900 transition-all text-sm font-black" />
                       </div>
                      <button onClick={handleSaveStock} className="w-full bg-slate-900 text-white py-6 rounded-[28px] font-black uppercase tracking-[0.25em] text-[10px] flex items-center justify-center gap-3 shadow-2xl shadow-slate-200 hover:scale-[1.02] active:scale-95 transition-all"><Save size={18} /> Finalize Inventory Update</button>
                   </div>
                </motion.div>
             </div>
           )}

           {isAddingLink && (
             <div className="fixed inset-0 z-100 flex items-center justify-center p-6">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddingLink(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
                <motion.div initial={{ opacity: 0, y: 100, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 100, scale: 0.9 }} className="relative w-full max-w-md bg-white rounded-[56px] shadow-2xl p-16">
                   <div className="flex justify-between items-center mb-12">
                      <h2 className="font-serif text-3xl">Material Link</h2>
                      <button onClick={() => setIsAddingLink(false)} className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-red-500 transition-all"><X size={24}/></button>
                   </div>
                   <div className="space-y-8">
                    <div className="space-y-8">
                       <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Clinical Service</label><select value={linkForm.service_id} onChange={e => setLinkForm({...linkForm, service_id: e.target.value})} className="w-full px-8 py-5 rounded-3xl border border-slate-100 bg-slate-50/50 outline-none focus:bg-white focus:border-slate-900 transition-all text-sm font-black appearance-none"><option value="">Select Service</option>{services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                       <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Material to Deduct</label><select value={linkForm.inventory_id} onChange={e => setLinkForm({...linkForm, inventory_id: e.target.value})} className="w-full px-8 py-5 rounded-3xl border border-slate-100 bg-slate-50/50 outline-none focus:bg-white focus:border-slate-900 transition-all text-sm font-black appearance-none"><option value="">Select Inventory</option>{items.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}</select></div>
                       <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Qty</label><input type="number" step="0.1" value={linkForm.qty_per_treatment} onChange={e => setLinkForm({...linkForm, qty_per_treatment: parseFloat(e.target.value)})} className="w-full px-8 py-5 rounded-3xl border border-slate-100 bg-slate-50/50 outline-none focus:bg-white focus:border-slate-900 transition-all text-sm font-black" /></div>
                          <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Unit</label><input type="text" value={linkForm.unit} onChange={e => setLinkForm({...linkForm, unit: e.target.value})} className="w-full px-8 py-5 rounded-3xl border border-slate-100 bg-slate-50/50 outline-none focus:bg-white focus:border-slate-900 transition-all text-sm font-black" /></div>
                       </div></div>
                       <button onClick={handleSaveLink} disabled={!linkForm.service_id || !linkForm.inventory_id} className="w-full bg-slate-900 text-white py-6 rounded-[28px] font-black uppercase tracking-[0.25em] text-[10px] flex items-center justify-center gap-3 shadow-2xl shadow-slate-200 active:scale-95 transition-all disabled:opacity-30"><Link2 size={18} /> Establish Protocol</button>
                   </div>
                </motion.div>
             </div>
           )}

           {statusMsg && (
             <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className={`fixed bottom-12 right-12 z-100 px-10 py-6 rounded-4xl shadow-2xl flex items-center gap-5 border ${statusMsg.type === 'success' ? 'bg-slate-900 text-white border-slate-800' : 'bg-red-600 text-white border-red-500'}`}>
                {statusMsg.type === 'success' ? <CheckCircle2 className="text-emerald-400" size={24}/> : <AlertTriangle size={24}/>}
                <span className="text-[10px] font-black uppercase tracking-[0.25em]">{statusMsg.text}</span>
             </motion.div>
           )}
        </AnimatePresence>

        <DeleteConfirmationModal 
          isOpen={!!deleteTarget} 
          onClose={() => setDeleteTarget(null)} 
          onConfirm={executeDelete} 
          isProcessing={isProcessing} 
          title="Archive Record?" 
          description={deleteTarget?.type === 'stock' ? "Permanent removal of this material will also invalidate all existing clinical protocols linked to it." : "Remove this material requirement from the service protocol? Stock levels will remain unaffected."} 
        />
      </main>
    </div>
  );
}

function NavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <div className={`flex items-center gap-5 px-6 py-4 rounded-2xl transition-all duration-300 cursor-pointer group ${active ? "bg-slate-900 text-white shadow-2xl shadow-slate-200" : "text-slate-400 hover:bg-slate-50 hover:text-slate-900"}`}>
      <span className={active ? "text-white" : "text-slate-400 group-hover:text-slate-900 transition-colors"}>{icon}</span>
      <span className="text-[11px] font-black uppercase tracking-[0.2em]">{label}</span>
      {active && <motion.div layoutId="activeNav" className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]" />}
    </div>
  );
}

function InvStatCard({ label, value, icon, color }: any) {
    return (
       <div className="bg-white p-10 rounded-5xl border border-slate-100 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden">
         <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[100px] -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-all duration-700" />
         <div className="relative">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 ${color} shadow-sm`}>{icon}</div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-3">{label}</p>
            <h3 className="text-4xl font-serif text-slate-900 tracking-tighter">{value}</h3>
         </div>
      </div>
   )
}

export function DeleteConfirmationModal({ isOpen, onClose, onConfirm, title, description, isProcessing }: any) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
           <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-sm bg-white rounded-[56px] p-16 shadow-2xl text-center">
             <div className="w-20 h-20 bg-red-50 rounded-4xl flex items-center justify-center text-red-500 mx-auto mb-8 shadow-inner"><AlertTriangle size={40} /></div>
            <h3 className="font-serif text-3xl text-slate-900 mb-4 tracking-tighter">{title}</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed mb-10">{description}</p>
            <div className="flex flex-col gap-3">
               <button onClick={onConfirm} disabled={isProcessing} className="w-full bg-red-600 text-white py-5 rounded-3xl font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-red-200 active:scale-95 transition-all">
                  {isProcessing ? <Loader2 className="animate-spin mx-auto" size={18}/> : "Execute Removal"}
               </button>
               <button onClick={onClose} className="w-full bg-slate-50 text-slate-400 py-5 rounded-3xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-slate-100 transition-all">Cancel</button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
