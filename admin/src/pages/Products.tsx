import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
import { 
  Package, Plus, Trash2, Edit3, 
  Search, Eye, Filter, ChevronRight, X, Image as ImageIcon,
  CircleCheck, AlertCircle, ShieldCheck, Save, Loader2, Square, CheckSquare, AlertTriangle
} from "lucide-react";
import PageLoader from "../components/PageLoader";
import ConfirmDialog from "../components/ConfirmDialog";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  category: string;
  images: string[];
  coverImage: string;
  stock: number;
  isNew: boolean;
  isPopular: boolean;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({ category: 'All', stock: 'All' });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [targetId, setTargetId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);

  // Form State
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    originalPrice: 0,
    category: "",
    images: [] as string[], 
    coverImage: "",
    stock: 10,
    isNew: true,
    isPopular: false
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products`);
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('admin_token');
    
    // Construct FormData
    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('price', String(formData.price));
    data.append('originalPrice', String(formData.originalPrice));
    data.append('category', formData.category);
    data.append('stock', String(formData.stock));
    data.append('isNew', String(formData.isNew));
    data.append('isPopular', String(formData.isPopular));

    if (coverFile) {
      data.append('coverImage', coverFile);
    }
    
    if (galleryFiles.length > 0) {
      galleryFiles.forEach(file => {
        data.append('images', file);
      });
    }

    setSaving(true);
    try {
      const url = editingProduct
        ? `${import.meta.env.VITE_API_URL}/api/products/${editingProduct._id}`
        : `${import.meta.env.VITE_API_URL}/api/products`;

      const res = await fetch(url, {
        method: editingProduct ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: data
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to save product');
      }

      fetchProducts();
      setShowModal(false);
      resetForm();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!targetId) return;
    const id = targetId;
    const token = localStorage.getItem('admin_token');
    setDeletingId(id);
    setShowConfirm(false);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to delete product');
      }

      fetchProducts();
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
      setTargetId(null);
    }
  };

  const handleBulkDelete = async () => {
    setBulkDeleting(true);
    setShowBulkConfirm(false);
    const token = localStorage.getItem('admin_token');
    try {
      await Promise.all(Array.from(selectedIds).map(id =>
        fetch(`${import.meta.env.VITE_API_URL}/api/products/${id}`, {
          method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
        })
      ));
      setProducts(prev => prev.filter(p => !selectedIds.has(p._id)));
      setSelectedIds(new Set());
    } catch (err) { console.error(err); }
    finally { setBulkDeleting(false); }
  };

  const toggleSelect = (id: string) => setSelectedIds(prev => {
    const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n;
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: 0,
      originalPrice: 0,
      category: "",
      images: [],
      coverImage: "",
      stock: 10,
      isNew: true,
      isPopular: false
    });
    setCoverFile(null);
    setGalleryFiles([]);
    setEditingProduct(null);
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filters.category === 'All' || p.category === filters.category;
    const matchesStock =
      filters.stock === 'All' ? true :
      filters.stock === 'out' ? p.stock === 0 :
      filters.stock === 'low' ? p.stock > 0 && p.stock <= 5 : true;
    return matchesSearch && matchesCategory && matchesStock;
  });

  const allFilteredSelected = filteredProducts.length > 0 && filteredProducts.every(p => selectedIds.has(p._id));
  const toggleSelectAll = () => {
    if (allFilteredSelected) setSelectedIds(prev => { const n = new Set(prev); filteredProducts.forEach(p => n.delete(p._id)); return n; });
    else setSelectedIds(prev => { const n = new Set(prev); filteredProducts.forEach(p => n.add(p._id)); return n; });
  };

  return (
    <div className="space-y-12 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 border-b border-rk-gold/10 pb-12">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="max-w-2xl"
        >
          <div className="flex items-center gap-4 mb-4">
            <Package size={18} className="text-rk-gold" />
            <span className="text-rk-gold text-[10px] uppercase tracking-[0.5em] font-black">Products List</span>
          </div>
          <h1 className="text-5xl font-display uppercase tracking-[0.1em] text-white font-black mb-4">Product <span className="gold-gradient-text italic font-medium lowercase font-cormorant text-[3.5rem] tracking-normal ml-4">Catalog</span></h1>
          <p className="text-[#6A6A6A] text-[10px] uppercase tracking-[0.25em] font-bold leading-none">Manage your jewellery collection and inventory.</p>
        </motion.div>

        <button 
          onClick={() => { resetForm(); setShowModal(true); }}
          className="admin-btn-primary group flex items-center gap-3 pr-10 cursor-pointer"
        >
          <Plus size={16} className="text-black group-hover:rotate-90 transition-transform duration-500" />
          <span>Add New Product</span>
        </button>
      </header>

      {/* Control Bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between flex-wrap">
        <div className="relative w-full lg:w-[400px] group">
          <Search size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#444] group-focus-within:text-rk-gold transition-colors" />
          <input 
            type="text" 
            placeholder="Search products by name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="admin-input pl-12 focus:shadow-[0_0_20px_rgba(212,175,55,0.05)]"
          />
        </div>
        
        <div className="flex gap-4 w-full lg:w-auto flex-wrap">
          <div className="glass-card flex items-center px-6 rounded-xl border-rk-gold/10 hover:border-rk-gold/30 transition-all cursor-pointer group">
             <Filter size={14} className="text-rk-gold/60 mr-4" />
             <select 
               value={filters.category}
               onChange={(e) => setFilters({...filters, category: e.target.value})}
               className="bg-transparent text-[10px] uppercase tracking-widest font-black py-4 outline-none appearance-none pr-8 cursor-pointer text-[#888] select-none"
             >
                <option value="All" className="bg-[#0A0A0A]">All Collections</option>
                <option value="Rings" className="bg-[#0A0A0A]">Rings</option>
                <option value="Necklaces" className="bg-[#0A0A0A]">Necklaces</option>
                <option value="Bracelets" className="bg-[#0A0A0A]">Bracelets</option>
                <option value="Earrings" className="bg-[#0A0A0A]">Earrings</option>
             </select>
          </div>

          {/* Stock filter chips */}
          {[
            { key: 'All', label: 'All Stock' },
            { key: 'low', label: `Low Stock (${products.filter(p => p.stock > 0 && p.stock <= 5).length})` },
            { key: 'out', label: `Out of Stock (${products.filter(p => p.stock === 0).length})` },
          ].map(opt => (
            <button
              key={opt.key}
              onClick={() => setFilters({...filters, stock: opt.key})}
              className={`px-5 py-3 rounded-xl border text-[9px] uppercase tracking-widest font-black transition-all ${
                filters.stock === opt.key
                  ? opt.key === 'out' ? 'bg-red-500/15 border-red-500/40 text-red-400'
                    : opt.key === 'low' ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                    : 'bg-rk-gold/10 border-rk-gold/40 text-rk-gold'
                  : 'glass-card border-white/5 text-[#555] hover:border-white/20 hover:text-white/60'
              }`}
            >
              {opt.label}
            </button>
          ))}

          {/* Select all + bulk delete */}
          <button onClick={toggleSelectAll}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-[9px] uppercase tracking-widest font-black transition-all ${
              allFilteredSelected ? 'bg-rk-gold/10 border-rk-gold/40 text-rk-gold' : 'glass-card border-white/5 text-[#555] hover:text-white/60'
            }`}>
            {allFilteredSelected ? <CheckSquare size={13} className="text-rk-gold" /> : <Square size={13} />}
            {allFilteredSelected ? 'Deselect All' : 'Select All'}
          </button>

          <AnimatePresence>
            {selectedIds.size > 0 && (
              <motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                onClick={() => setShowBulkConfirm(true)}
                disabled={bulkDeleting}
                className="flex items-center gap-2 px-4 py-3 rounded-xl border border-red-500/30 text-red-400 bg-red-500/5 hover:bg-red-500/10 transition-all text-[9px] uppercase tracking-widest font-black disabled:opacity-40">
                {bulkDeleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                Delete {selectedIds.size} selected
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Product List */}
      {loading ? (
        <PageLoader fullScreen={false} />
      ) : filteredProducts.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-32 text-center glass-card rounded-3xl border border-white/5">
          <div className="w-16 h-16 rounded-full bg-rk-gold/10 border border-rk-gold/20 flex items-center justify-center mb-6">
            <Package size={28} className="text-rk-gold" />
          </div>
          <p className="text-white text-lg font-display uppercase tracking-widest mb-2">
            {products.length === 0 ? 'No Products Yet' : 'No Results Found'}
          </p>
          <p className="text-[#555] text-[11px] uppercase tracking-widest mb-8">
            {products.length === 0 ? 'Add your first product to the catalog' : 'Try adjusting your search or filters'}
          </p>
          {products.length === 0 && (
            <button onClick={() => { resetForm(); setShowModal(true); }}
              className="flex items-center gap-2 admin-btn-primary text-[10px] uppercase tracking-widest">
              <Plus size={16} className="text-black" /> Add First Product
            </button>
          )}
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-8">
          <AnimatePresence>
            {filteredProducts.map((product, i) => (
              <motion.div
                key={product._id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: i * 0.05 }}
                className={`group relative glass-card p-1 rounded-3xl overflow-hidden transition-all duration-700 shadow-xl shadow-black/80 ${selectedIds.has(product._id) ? 'border-red-500/30' : 'hover:border-rk-gold/40'}`}
              >
                {/* Checkbox */}
                <button
                  onClick={() => toggleSelect(product._id)}
                  className="absolute top-4 right-4 z-30 w-7 h-7 rounded-lg bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center transition-all hover:border-rk-gold/50"
                >
                  {selectedIds.has(product._id) ? <CheckSquare size={14} className="text-red-400" /> : <Square size={14} className="text-white/40" />}
                </button>

                <div className="relative aspect-[4/3] overflow-hidden rounded-[calc(1.5rem-1px)]">
                  <img src={product.coverImage || product.images[0]} alt={product.name} className="w-full h-full object-cover transition-all duration-[2s] group-hover:scale-110 grayscale-[0.3] group-hover:grayscale-0 brightness-75 group-hover:brightness-100" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
                  
                  {/* Badges */}
                  <div className="absolute top-5 left-5 flex gap-2 flex-wrap max-w-[80%]">
                    {product.isNew && (
                      <span className="bg-rk-gold text-black text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-2xl">New</span>
                    )}
                    {product.isPopular && (
                      <span className="bg-white/10 backdrop-blur-md border border-white/20 text-white text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-2xl">Trending</span>
                    )}
                    {product.stock === 0 && (
                      <span className="bg-red-500/80 backdrop-blur-md text-white text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-2xl">Out of Stock</span>
                    )}
                    {product.stock > 0 && product.stock <= 5 && (
                      <span className="bg-amber-500/80 backdrop-blur-md text-white text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-2xl">Low Stock</span>
                    )}
                  </div>
                </div>

                <div className="p-8 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex-1 pr-4">
                      <p className="text-[9px] uppercase tracking-[0.4em] text-rk-gold font-black mb-1">{product.category}</p>
                      <h3 className="text-xl font-display uppercase tracking-widest text-white leading-tight line-clamp-2">{product.name}</h3>
                    </div>
                    <div className="text-right">
                       <p className="text-rk-gold font-mono font-bold text-lg leading-none mb-1">₹{product.price.toLocaleString()}</p>
                       <p className="text-[#444] font-mono text-[10px] line-through">₹{product.originalPrice.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className={`border rounded-2xl p-4 mb-8 flex justify-between items-center transition-all ${
                    product.stock === 0 ? 'bg-red-500/5 border-red-500/20' :
                    product.stock <= 5 ? 'bg-amber-500/5 border-amber-500/20' :
                    'bg-[#0A0A0A]/60 border-rk-gold/5 group-hover:border-rk-gold/20'
                  }`}>
                     <div className="flex gap-3 items-center">
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          product.stock === 0 ? 'bg-red-500' :
                          product.stock <= 5 ? 'bg-amber-400 animate-pulse' :
                          'bg-rk-gold animate-pulse shadow-[0_0_5px_#D4AF37]'
                        }`} />
                        <span className={`text-[9px] uppercase tracking-widest font-bold ${
                          product.stock === 0 ? 'text-red-400' :
                          product.stock <= 5 ? 'text-amber-400' : 'text-[#666]'
                        }`}>
                          {product.stock === 0 ? 'Out of Stock' : product.stock <= 5 ? 'Low Stock' : 'In Stock'}
                        </span>
                     </div>
                     <span className={`font-mono text-sm font-bold uppercase ${
                       product.stock === 0 ? 'text-red-400' :
                       product.stock <= 5 ? 'text-amber-400' : 'text-white'
                     }`}>{product.stock} units</span>
                  </div>

                  <div className="flex gap-4 mt-auto">
                    <button 
                      onClick={() => { setEditingProduct(product); setFormData({...product}); setShowModal(true); }}
                      className="flex-1 flex items-center justify-center gap-3 border border-rk-gold/20 hover:border-rk-gold text-white/60 hover:text-rk-gold h-14 rounded-xl text-[9px] uppercase tracking-widest font-black transition-all group/btn cursor-pointer"
                    >
                      <Edit3 size={14} className="group-hover/btn:rotate-12 transition-transform" />
                      Edit Product
                    </button>
                    <button 
                      onClick={() => { setTargetId(product._id); setShowConfirm(true); }}
                      disabled={deletingId === product._id}
                      className="w-16 h-14 flex items-center justify-center text-[#333] hover:text-red-500 border border-rk-gold/5 hover:border-red-500/30 rounded-xl transition-all group/del cursor-pointer disabled:opacity-50"
                    >
                      {deletingId === product._id ? (
                        <Loader2 size={14} className="animate-spin text-rk-gold" />
                      ) : (
                        <Trash2 size={14} className="group-hover/del:scale-125 transition-transform" />
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-12 overflow-hidden">
             <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowModal(false)}
               className="fixed inset-0 bg-[#050505]/98 backdrop-blur-3xl"
             />
             
             <motion.div
               initial={{ opacity: 0, scale: 0.96, y: 40 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.96, y: 40 }}
               transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
               className="relative w-full max-w-4xl glass-card rounded-[28px] shadow-[0_40px_100px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[92vh]"
             >
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-5 border-b border-rk-gold/10 bg-black/40 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-rk-gold/10 border border-rk-gold/20 flex items-center justify-center">
                      <Package size={14} className="text-rk-gold" />
                    </div>
                    <div>
                      <p className="text-[8px] uppercase tracking-[0.4em] text-rk-gold/60 font-black">{editingProduct ? 'Editing Product' : 'New Product'}</p>
                      <h2 className="text-base font-display uppercase tracking-widest text-white font-black leading-none">
                        {editingProduct ? editingProduct.name : 'Add to Catalog'}
                      </h2>
                    </div>
                  </div>
                  <button onClick={() => setShowModal(false)} className="w-9 h-9 rounded-xl glass-card border-white/5 flex items-center justify-center text-white/30 hover:text-white transition-all hover:bg-white/10">
                    <X size={15} />
                  </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  <form onSubmit={handleCreate}>
                    <div className="p-8 space-y-6">

                      {/* Name */}
                      <div className="space-y-2">
                        <label className="text-[9px] uppercase tracking-[0.4em] text-[#555] font-black">Product Name</label>
                        <input required placeholder="e.g. Royal Gold Necklace..." value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="admin-input" />
                      </div>

                      {/* Category + Stock + Prices */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <label className="text-[9px] uppercase tracking-[0.4em] text-[#555] font-black">Category</label>
                          <select required value={formData.category}
                            onChange={(e) => setFormData({...formData, category: e.target.value})}
                            className="admin-input cursor-pointer text-[10px] uppercase tracking-[0.2em] font-black">
                            <option value="" className="bg-[#0A0A0A]">Select...</option>
                            <option value="Rings" className="bg-[#0A0A0A]">Rings</option>
                            <option value="Necklaces" className="bg-[#0A0A0A]">Necklaces</option>
                            <option value="Bracelets" className="bg-[#0A0A0A]">Bracelets</option>
                            <option value="Earrings" className="bg-[#0A0A0A]">Earrings</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] uppercase tracking-[0.4em] text-[#555] font-black">Stock</label>
                          <input type="number" required min={0} value={formData.stock}
                            onChange={(e) => setFormData({...formData, stock: Number(e.target.value)})}
                            className="admin-input font-mono" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] uppercase tracking-[0.4em] text-[#555] font-black">Selling Price (₹)</label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-rk-gold text-sm pointer-events-none font-bold">₹</span>
                            <input type="number" required min={0} value={formData.price}
                              onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                              className="admin-input pl-8 font-mono text-rk-gold" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] uppercase tracking-[0.4em] text-[#555] font-black">
                            MRP (₹)
                            {formData.originalPrice > formData.price && formData.price > 0 && (
                              <span className="ml-2 text-emerald-400">{Math.round(((formData.originalPrice - formData.price) / formData.originalPrice) * 100)}% off</span>
                            )}
                          </label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#444] text-sm pointer-events-none font-bold">₹</span>
                            <input type="number" required min={0} value={formData.originalPrice}
                              onChange={(e) => setFormData({...formData, originalPrice: Number(e.target.value)})}
                              className="admin-input pl-8 font-mono" />
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <div className="space-y-2">
                        <label className="text-[9px] uppercase tracking-[0.4em] text-[#555] font-black">Description</label>
                        <textarea required rows={3} placeholder="Describe the product..."
                          value={formData.description}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                          className="admin-input resize-none text-sm leading-relaxed" />
                      </div>

                      {/* Tags */}
                      <div className="space-y-2">
                        <label className="text-[9px] uppercase tracking-[0.4em] text-[#555] font-black">Tags</label>
                        <div className="flex gap-3">
                          <button type="button" onClick={() => setFormData({...formData, isNew: !formData.isNew})}
                            className={clsx("flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all text-[9px] uppercase tracking-widest font-black",
                              formData.isNew ? "bg-rk-gold/15 border-rk-gold/50 text-rk-gold" : "bg-white/[0.03] border-white/10 text-[#444] hover:border-white/20")}>
                            <div className={clsx("w-1.5 h-1.5 rounded-full", formData.isNew ? "bg-rk-gold" : "bg-[#333]")} />
                            New Arrival
                          </button>
                          <button type="button" onClick={() => setFormData({...formData, isPopular: !formData.isPopular})}
                            className={clsx("flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all text-[9px] uppercase tracking-widest font-black",
                              formData.isPopular ? "bg-white/10 border-white/30 text-white" : "bg-white/[0.03] border-white/10 text-[#444] hover:border-white/20")}>
                            <div className={clsx("w-1.5 h-1.5 rounded-full", formData.isPopular ? "bg-white" : "bg-[#333]")} />
                            Trending
                          </button>
                        </div>
                      </div>

                      {/* Images */}
                      <div className="space-y-4 pt-4 border-t border-white/5">
                        <label className="text-[9px] uppercase tracking-[0.4em] text-[#555] font-black block">Cover Image</label>
                        <label className={cn("relative h-36 rounded-2xl border border-dashed flex flex-col items-center justify-center transition-all cursor-pointer group overflow-hidden",
                          coverFile ? "border-rk-gold/40 bg-rk-gold/5" : "border-white/10 hover:border-rk-gold/30 hover:bg-rk-gold/[0.03]")}>
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} />
                          {coverFile ? (
                            <div className="absolute inset-0">
                              <img src={URL.createObjectURL(coverFile)} className="w-full h-full object-cover opacity-40" onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)} />
                              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
                                <CircleCheck size={18} className="text-rk-gold mb-1.5" />
                                <span className="text-[9px] uppercase tracking-widest font-black text-white">{coverFile.name}</span>
                              </div>
                            </div>
                          ) : editingProduct?.coverImage ? (
                            <div className="absolute inset-0">
                              <img src={editingProduct.coverImage} className="w-full h-full object-cover opacity-25" />
                              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
                                <ImageIcon size={16} className="text-rk-gold/50 mb-1.5" />
                                <span className="text-[9px] uppercase tracking-widest font-black text-[#555]">Click to replace</span>
                              </div>
                            </div>
                          ) : (
                            <>
                              <ImageIcon size={20} className="text-[#333] group-hover:text-rk-gold transition-colors mb-2" />
                              <span className="text-[9px] uppercase tracking-widest font-black text-[#444] group-hover:text-rk-gold">Upload Cover Image</span>
                            </>
                          )}
                        </label>

                        <label className="text-[9px] uppercase tracking-[0.4em] text-[#555] font-black block">Gallery</label>

                        {editingProduct && formData.images?.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-[8px] uppercase tracking-widest text-[#333] font-black">Current — hover to delete</p>
                            <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                              {formData.images.map((url, i) => (
                                <div key={i} className="aspect-square rounded-xl overflow-hidden relative group/item border border-white/5">
                                  <img src={url} className="w-full h-full object-cover" />
                                  <button type="button"
                                    onClick={async (e) => {
                                      e.preventDefault();
                                      const token = localStorage.getItem('admin_token');
                                      await fetch(`${import.meta.env.VITE_API_URL}/api/products/${editingProduct._id}/image`, {
                                        method: 'DELETE',
                                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                        body: JSON.stringify({ imageUrl: url })
                                      });
                                      setFormData(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }));
                                    }}
                                    className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-all">
                                    <Trash2 size={13} className="text-red-400" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <label className={cn("relative h-20 rounded-2xl border border-dashed flex items-center justify-center gap-3 transition-all cursor-pointer group",
                          galleryFiles.length > 0 ? "border-rk-gold/30 bg-rk-gold/[0.03]" : "border-white/10 hover:border-rk-gold/20")}>
                          <input type="file" multiple className="hidden" accept="image/*"
                            onChange={(e) => { if (e.target.files) setGalleryFiles(Array.from(e.target.files)); }} />
                          <Plus size={14} className="text-[#444] group-hover:text-rk-gold transition-colors" />
                          <span className="text-[9px] uppercase tracking-widest font-black text-[#444] group-hover:text-rk-gold">
                            {galleryFiles.length > 0 ? `${galleryFiles.length} image${galleryFiles.length > 1 ? 's' : ''} selected` : editingProduct ? 'Add more images' : 'Select gallery images'}
                          </span>
                        </label>

                        {galleryFiles.length > 0 && (
                          <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                            {galleryFiles.map((f, i) => (
                              <div key={i} className="aspect-square rounded-xl bg-white/5 border border-white/10 overflow-hidden relative group/item">
                                <img src={URL.createObjectURL(f)} className="w-full h-full object-cover opacity-60"
                                  onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)} />
                                <button type="button" onClick={(e) => { e.preventDefault(); setGalleryFiles(prev => prev.filter((_, idx) => idx !== i)); }}
                                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-all z-10">
                                  <X size={9} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex gap-3 px-8 py-5 border-t border-white/5 bg-black/30 shrink-0">
                      <button type="submit" disabled={saving}
                        className="flex-1 admin-btn-primary flex items-center justify-center gap-2 !h-11 disabled:opacity-50 disabled:cursor-not-allowed">
                        {saving ? <Loader2 size={14} className="animate-spin text-black" /> : <Save size={14} className="text-black" />}
                        {saving ? (editingProduct ? 'Updating...' : 'Saving...') : (editingProduct ? 'Save Changes' : 'Create Product')}
                      </button>
                      <button type="button" onClick={() => setShowModal(false)} className="px-8 h-11 rounded-xl border border-rk-gold/20 text-[9px] uppercase tracking-widest font-black text-white/50 hover:text-white hover:border-rk-gold/40 transition-all flex items-center justify-center">
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bulk Delete Confirm */}
      <AnimatePresence>
        {showBulkConfirm && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowBulkConfirm(false)} className="fixed inset-0 bg-black/90 backdrop-blur-xl" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm glass-card rounded-[28px] p-8 border border-red-500/20">
              <div className="flex justify-center mb-5">
                <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <AlertTriangle size={24} className="text-red-500" />
                </div>
              </div>
              <h3 className="text-center text-lg font-display uppercase tracking-widest text-white font-black mb-2">Delete {selectedIds.size} Products</h3>
              <p className="text-center text-[9px] uppercase tracking-[0.3em] text-red-400/70 font-black mb-8">This is permanent and cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowBulkConfirm(false)}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-[9px] uppercase tracking-widest font-black text-[#555] hover:text-white transition-all">
                  Cancel
                </button>
                <button onClick={handleBulkDelete} disabled={bulkDeleting}
                  className="flex-1 py-3 rounded-xl border border-red-500/30 bg-red-500/10 text-[9px] uppercase tracking-widest font-black text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-40 flex items-center justify-center gap-2">
                  {bulkDeleting ? <><Loader2 size={11} className="animate-spin" /> Deleting...</> : <><Trash2 size={11} /> Delete</>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmDialog 
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action is irreversible."
      />
    </div>
  );
}
