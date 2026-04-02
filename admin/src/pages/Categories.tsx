import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { List, Plus, Trash2, Edit3, X, Image as ImageIcon, Save, AlertCircle, CircleCheck, Loader2 } from "lucide-react";
import { clsx } from "clsx";
import PageLoader from "../components/PageLoader";
import ConfirmDialog from "../components/ConfirmDialog";

interface Category {
  _id: string;
  name: string;
  image: string;
  count: number;
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [targetId, setTargetId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    image: ""
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/categories`);
      if (!res.ok) throw new Error('Failed to fetch categories');
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('admin_token');
    setError("");
    setSaving(true);
    
    try {
      const url = editingCategory 
        ? `${import.meta.env.VITE_API_URL}/api/categories/${editingCategory._id}`
        : `${import.meta.env.VITE_API_URL}/api/categories`;
      
      const data = new FormData();
      data.append('name', formData.name);
      
      if (file) {
        data.append('image', file);
      } else {
        data.append('image', formData.image);
      }

      const res = await fetch(url, {
        method: editingCategory ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: data
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to save');
      }

      fetchCategories();
      setShowModal(false);
      setFile(null);
      resetForm();
    } catch (err: any) {
      setError(err.message || "Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!targetId) return;
    const id = targetId;
    const token = localStorage.getItem('admin_token');
    setError("");
    setDeletingId(id);
    setShowConfirm(false);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/categories/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to delete category');
      }
      
      fetchCategories();
    } catch (err: any) {
      setError(err.message || "Cannot delete category: Products are still using it.");
      setTimeout(() => setError(""), 5000);
    } finally {
      setDeletingId(null);
      setTargetId(null);
    }
  };

  const resetForm = () => {
    setFormData({ name: "", image: "" });
    setFile(null);
    setEditingCategory(null);
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 border-b border-rk-gold/10 pb-12">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="max-w-2xl"
        >
          <div className="flex items-center gap-4 mb-4">
            <List size={18} className="text-rk-gold" />
            <span className="text-rk-gold text-[10px] uppercase tracking-[0.5em] font-black">Categories</span>
          </div>
          <h1 className="text-5xl font-display uppercase tracking-[0.1em] text-white font-black mb-4">Category <span className="gold-gradient-text italic font-medium lowercase font-cormorant text-[3.5rem] tracking-normal ml-4">Catalog</span></h1>
          <p className="text-[#6A6A6A] text-[10px] uppercase tracking-[0.25em] font-bold leading-none">Manage your jewellery collections and categories.</p>
        </motion.div>

        <button 
          onClick={() => { resetForm(); setShowModal(true); }}
          className="admin-btn-primary group flex items-center gap-3 pr-10"
        >
          <Plus size={16} className="text-black group-hover:rotate-90 transition-transform duration-500" />
          <span>Add New Category</span>
        </button>
      </header>

      {error && (
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-red-500/10 border border-red-500/30 text-red-500 text-[10px] uppercase tracking-[0.3em] font-black p-6 rounded-2xl flex items-center gap-4 max-w-2xl mx-auto"
        >
          <AlertCircle size={18} />
          {error}
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        <AnimatePresence>
          {categories.length === 0 ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="col-span-full flex flex-col items-center justify-center py-32 text-center glass-card rounded-3xl border border-white/5">
              <div className="w-16 h-16 rounded-full bg-rk-gold/10 border border-rk-gold/20 flex items-center justify-center mb-6">
                <List size={28} className="text-rk-gold" />
              </div>
              <p className="text-white text-lg font-display uppercase tracking-widest mb-2">No Categories Yet</p>
              <p className="text-[#555] text-[11px] uppercase tracking-widest mb-8">Create your first jewellery collection</p>
              <button onClick={() => { resetForm(); setShowModal(true); }}
                className="flex items-center gap-2 admin-btn-primary text-[10px] uppercase tracking-widest">
                <Plus size={16} className="text-black" /> Add First Category
              </button>
            </motion.div>
          ) : categories.map((cat, i) => (
            <motion.div
              key={cat._id}
              layout
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: i * 0.1 }}
              className="group relative glass-card p-1 rounded-3xl overflow-hidden hover:border-rk-gold/30 transition-all duration-700 shadow-2xl shadow-black/40"
            >
              <div className="relative h-[240px] overflow-hidden rounded-[calc(1.5rem-1px)]">
                <img 
                  src={cat.image.startsWith('http') ? cat.image : `${import.meta.env.VITE_API_URL}${cat.image}`} 
                  alt={cat.name} 
                  className="w-full h-full object-cover grayscale-[0.6] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-[3s]" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                
                <div className="absolute inset-0 p-8 flex flex-col justify-between">
                   <div className="flex justify-end">
                     <div className="bg-black/80 backdrop-blur-md px-4 py-3 rounded-xl border border-rk-gold/10">
                        <p className="text-rk-gold font-mono text-sm font-bold">{cat.count} Items</p>
                     </div>
                   </div>
                   
                   <div className="relative">
                      <h3 className="text-2xl font-display uppercase tracking-[0.2em] text-white font-black group-hover:gold-gradient-text transition-all duration-700 leading-tight pr-32 break-words items-end flex min-h-[64px]">
                        {cat.name}
                      </h3>
                      <div className="absolute bottom-0 right-0 flex gap-4 opacity-0 group-hover:opacity-100 transition-all duration-500 z-20">
                         <button 
                           onClick={(e) => { e.stopPropagation(); resetForm(); setEditingCategory(cat); setFormData({ name: cat.name, image: cat.image }); setShowModal(true); }}
                           className="w-12 h-12 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-rk-gold hover:bg-rk-gold hover:text-black hover:border-rk-gold transition-all shadow-xl"
                         >
                           <Edit3 size={16} />
                         </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setTargetId(cat._id); setShowConfirm(true); }}
                            disabled={deletingId === cat._id}
                            className="w-12 h-12 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-xl disabled:opacity-50"
                          >
                            {deletingId === cat._id ? (
                              <Loader2 size={16} className="animate-spin text-rk-gold" />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                      </div>
                   </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>      {/* Category Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-6 sm:p-12 overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="fixed inset-0 bg-[#050505]/95 backdrop-blur-xl"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative w-full max-w-2xl glass-card rounded-[40px] shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[90vh]"
            >
               <div className="p-12 md:p-16 overflow-y-auto custom-scrollbar">
                  <header className="mb-12 border-b border-rk-gold/10 pb-10">
                     <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.4em] text-rk-gold font-black mb-4">Details</p>
                          <h2 className="text-4xl font-display uppercase tracking-widest text-[#F5F5F5] font-black leading-none">
                            {editingCategory ? "Edit" : "Add"} <br/>
                            <span className="gold-gradient-text italic font-medium lowercase font-cormorant text-[3rem] tracking-normal">Category</span>
                          </h2>
                        </div>
                        <button 
                          onClick={() => setShowModal(false)}
                          className="w-12 h-12 rounded-full glass-card border-white/5 flex items-center justify-center text-white/20 hover:text-white transition-all hover:bg-white/10"
                        >
                          <X size={20} />
                        </button>
                     </div>
                  </header>

                  <form onSubmit={handleSave} className="space-y-12 pb-10">
                     <div>
                        <label className="text-[10px] uppercase tracking-[0.5em] text-[#666] font-black block mb-4 px-1">Category Name</label>
                        <input 
                          required
                          placeholder="e.g. Bridal Jewellery..."
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="admin-input !text-lg !font-display !tracking-widest capitalize px-1 !bg-transparent border-x-0 border-t-0 border-b-rk-gold/20 focus:border-b-rk-gold !rounded-none focus:glow-gold/10 transition-all"
                        />
                     </div>

                     <div className="space-y-8">
                        <div>
                           <label className="text-[10px] uppercase tracking-[0.5em] text-[#666] font-black block mb-6 px-1">Category Image</label>
                           <div className="grid grid-cols-1 gap-8">
                              {/* File Upload Option */}
                              <label className={clsx(
                                "relative h-64 rounded-2xl border border-dashed flex flex-col items-center justify-center transition-all cursor-pointer group hover:bg-rk-gold/5 overflow-hidden",
                                file ? "border-rk-gold bg-rk-gold/10" : "border-white/10 hover:border-rk-gold/40"
                              )}>
                                 <input 
                                   type="file" 
                                   className="hidden" 
                                   accept="image/*"
                                   onChange={(e) => setFile(e.target.files?.[0] || null)}
                                 />
                                 {file ? (
                                   <div className="absolute inset-0 w-full h-full">
                                      <img 
                                        src={URL.createObjectURL(file)} 
                                        className="w-full h-full object-cover opacity-60" 
                                        onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                                      />
                                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
                                         <CircleCheck size={24} className="text-rk-gold mb-2" />
                                         <span className="text-[10px] uppercase tracking-widest font-black text-white">{file.name}</span>
                                      </div>
                                   </div>
                                 ) : (
                                   <>
                                     <ImageIcon size={28} className="text-[#444] group-hover:text-rk-gold transition-colors" />
                                     <div className="text-center mt-4">
                                        <span className="text-[10px] uppercase tracking-widest font-black block text-[#888] group-hover:text-rk-gold transition-colors">
                                           Select Image
                                        </span>
                                        <span className="text-[9px] uppercase tracking-wider font-bold mt-1 text-[#444] block">
                                           Upload category cover
                                        </span>
                                     </div>
                                   </>
                                 )}
                                 
                                 {file && (
                                   <button 
                                     type="button"
                                     onClick={(e) => { e.preventDefault(); setFile(null); }}
                                     className="absolute top-4 right-4 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-all z-20"
                                   >
                                      <X size={12} />
                                   </button>
                                 )}
                              </label>
                           </div>
                        </div>
                     </div>

                     <div className="pt-10 flex gap-6">
                        <button 
                          type="submit" 
                          disabled={saving}
                          className="flex-1 admin-btn-primary flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed h-16"
                        >
                           {saving ? (
                              <Loader2 size={16} className="animate-spin text-black" />
                           ) : (
                              <Save size={16} className="text-black" />
                           )}
                           <span>{saving ? "Saving..." : (editingCategory ? "Save Changes" : "Create Category")}</span>
                        </button>
                        <button type="button" onClick={() => setShowModal(false)} className="admin-btn-outline px-12 h-16">Cancel</button>
                     </div>
                  </form>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmDialog 
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Category"
        message="Are you sure you want to delete this category? This cannot be undone."
      />
    </div>
  );
}
