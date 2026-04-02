import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Save, Plus, Trash2, Upload, LayoutGrid, Star, Image } from "lucide-react";

interface Product { _id: string; name: string; images: string[]; category: string; }
interface Category { _id: string; name: string; }
interface SignatureItem { name: string; tag: string; image: string; url: string; gridPosition: number; }

export default function Homepage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredIds, setFeaturedIds] = useState<string[]>([]);
  const [collections, setCollections] = useState<SignatureItem[]>([
    { name: '', tag: '', image: '', url: '/shop', gridPosition: 0 },
    { name: '', tag: '', image: '', url: '/shop', gridPosition: 1 },
    { name: '', tag: '', image: '', url: '/shop', gridPosition: 2 },
    { name: '', tag: '', image: '', url: '/shop', gridPosition: 3 },
  ]);
  const [saving, setSaving] = useState(false);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const [tab, setTab] = useState<'featured' | 'signature'>('featured');
  const fileRefs = useRef<(HTMLInputElement | null)[]>([]);

  const token = () => localStorage.getItem('admin_token');

  useEffect(() => {
    // Fetch all products
    fetch(`${import.meta.env.VITE_API_URL}/api/products`, { headers: { Authorization: `Bearer ${token()}` } })
      .then(r => r.json()).then(d => setProducts(Array.isArray(d.products) ? d.products : Array.isArray(d) ? d : []));
    // Fetch categories
    fetch(`${import.meta.env.VITE_API_URL}/api/categories`, { headers: { Authorization: `Bearer ${token()}` } })
      .then(r => r.json()).then(d => setCategories(Array.isArray(d) ? d : []));
    // Fetch current settings
    fetch(`${import.meta.env.VITE_API_URL}/api/homepage`, { headers: { Authorization: `Bearer ${token()}` } })
      .then(r => r.json()).then(d => {
        if (d.featuredProductIds) setFeaturedIds(d.featuredProductIds);
        if (d.signatureCollections?.length) {
          const filled = [...d.signatureCollections];
          while (filled.length < 4) filled.push({ name: '', tag: '', image: '', url: '/shop', gridPosition: filled.length });
          setCollections(filled.slice(0, 4));
        }
      });
  }, []);

  const toggleFeatured = (id: string) => {
    setFeaturedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const saveFeatured = async () => {
    setSaving(true);
    await fetch(`${import.meta.env.VITE_API_URL}/api/homepage/featured`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` }, body: JSON.stringify({ productIds: featuredIds }) });
    setSaving(false);
  };

  const saveSignature = async () => {
    setSaving(true);
    await fetch(`${import.meta.env.VITE_API_URL}/api/homepage/signature`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` }, body: JSON.stringify({ collections }) });
    setSaving(false);
  };

  const handleImageUpload = async (idx: number, file: File) => {
    setUploadingIdx(idx);
    const reader = new FileReader();
    reader.onload = async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/homepage/upload`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` }, body: JSON.stringify({ image: reader.result }) });
      const data = await res.json();
      if (data.url) {
        setCollections(prev => prev.map((c, i) => i === idx ? { ...c, image: data.url } : c));
      }
      setUploadingIdx(null);
    };
    reader.readAsDataURL(file);
  };

  const handleImageRemove = async (idx: number) => {
    const imageUrl = collections[idx]?.image;
    if (!imageUrl) return;
    setCollections(prev => prev.map((c, i) => i === idx ? { ...c, image: '' } : c));
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/homepage/delete-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ imageUrl })
      });
    } catch (e) { console.error(e); }
  };

  const updateCollection = (idx: number, field: keyof SignatureItem, value: string | number) => {
    setCollections(prev => prev.map((c, i) => i === idx ? { ...c, [field]: value } : c));
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-4 mb-3">
            <div className="w-8 h-[1px] gold-gradient" />
            <span className="text-rk-gold text-[10px] uppercase tracking-[0.5em] font-black">Site Customization</span>
          </div>
          <h1 className="text-5xl font-display uppercase tracking-[0.1em] text-white font-black mb-3">
            Homepage <span className="gold-gradient-text italic font-medium lowercase font-cormorant text-[3.5rem] tracking-normal ml-2">Settings</span>
          </h1>
          <p className="text-[#6A6A6A] text-[10px] uppercase tracking-[0.25em] font-bold">Control featured products and signature collection grid.</p>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/5 pb-0">
        {([['featured', Star, 'Featured Products'], ['signature', LayoutGrid, 'Signature Collections']] as const).map(([key, Icon, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-6 py-3.5 text-[10px] uppercase font-black tracking-widest border-b-2 transition-all ${tab === key ? 'border-rk-gold text-rk-gold' : 'border-transparent text-white/30 hover:text-white/60'}`}>
            <Icon size={14} />{label}
          </button>
        ))}
      </div>

      {/* Featured Products Tab */}
      {tab === 'featured' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-widest text-white/40 font-black">{featuredIds.length} selected — shown in Trending section</p>
            <button onClick={saveFeatured} disabled={saving}
              className="flex items-center gap-2 px-6 py-3 rounded-xl gold-gradient text-black text-[10px] uppercase font-black tracking-widest hover:scale-105 transition-all disabled:opacity-50">
              <Save size={14} />{saving ? 'Saving...' : 'Save'}
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-20 text-center glass-card rounded-3xl border border-white/5">
                <div className="w-14 h-14 rounded-full bg-rk-gold/10 border border-rk-gold/20 flex items-center justify-center mb-4">
                  <Star size={22} className="text-rk-gold/40" />
                </div>
                <p className="text-white text-base font-display uppercase tracking-widest mb-1">No Products Found</p>
                <p className="text-[#444] text-[10px] uppercase tracking-widest font-black">Add products first to feature them here</p>
              </div>
            ) : products.map(p => {
              const selected = featuredIds.includes(p._id);
              return (
                <button key={p._id} onClick={() => toggleFeatured(p._id)}
                  className={`relative rounded-2xl overflow-hidden border-2 transition-all group ${selected ? 'border-rk-gold shadow-lg shadow-rk-gold/10' : 'border-white/5 hover:border-white/20'}`}>
                  <div className="aspect-square">
                    <img src={p.images?.[0]} alt={p.name} className="w-full h-full object-cover" />
                    <div className={`absolute inset-0 transition-all ${selected ? 'bg-rk-gold/20' : 'bg-black/40 group-hover:bg-black/20'}`} />
                    {selected && (
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-rk-gold flex items-center justify-center">
                        <Star size={12} className="text-black fill-black" />
                      </div>
                    )}
                  </div>
                  <div className="p-3 bg-[#0e0e0e] text-left">
                    <p className="text-[10px] uppercase tracking-widest font-black text-white/70 truncate">{p.name}</p>
                    <p className="text-[9px] text-rk-gold/60 uppercase tracking-widest">{p.category}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {tab === 'signature' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-widest text-white/40 font-black">4 grid slots — configure each card</p>
            <button onClick={saveSignature} disabled={saving}
              className="flex items-center gap-2 px-6 py-3 rounded-xl gold-gradient text-black text-[10px] uppercase font-black tracking-widest hover:scale-105 transition-all disabled:opacity-50">
              <Save size={14} />{saving ? 'Saving...' : 'Save'}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {collections.map((col, idx) => (
              <div key={idx} className="glass-card rounded-2xl border-white/5 p-6 space-y-4">
                <p className="text-[10px] uppercase tracking-[0.4em] text-rk-gold font-black">Grid Slot {idx + 1}</p>

                {/* Image upload */}
                <div className="relative aspect-video rounded-xl overflow-hidden bg-white/[0.02] border border-white/10 group">
                  <div className="w-full h-full cursor-pointer" onClick={() => fileRefs.current[idx]?.click()}>
                    {col.image ? (
                      <img src={col.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full gap-2 text-white/20">
                        <Image size={28} />
                        <span className="text-[9px] uppercase tracking-widest font-black">Click to upload</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center pointer-events-none">
                      {uploadingIdx === idx ? (
                        <div className="w-8 h-8 border-2 border-rk-gold/20 border-t-rk-gold rounded-full animate-spin" />
                      ) : (
                        <Upload size={20} className="text-rk-gold" />
                      )}
                    </div>
                  </div>
                  {col.image && (
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); handleImageRemove(idx); }}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/70 border border-red-500/40 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-all z-10 opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                  <input ref={el => { fileRefs.current[idx] = el }} type="file" accept="image/*" className="hidden"
                    onChange={e => e.target.files?.[0] && handleImageUpload(idx, e.target.files[0])} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase tracking-[0.3em] text-[#555] font-black">Display Name</label>
                    <input value={col.name} onChange={e => updateCollection(idx, 'name', e.target.value)}
                      placeholder="e.g. Royal Rings"
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-rk-gold/40 transition-all placeholder:text-white/20" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase tracking-[0.3em] text-[#555] font-black">Category</label>
                    <select
                      value={col.tag}
                      onChange={e => {
                        const cat = e.target.value;
                        setCollections(prev => prev.map((c, i) => i === idx ? { ...c, tag: cat, url: cat ? `/shop?category=${encodeURIComponent(cat)}` : '/shop' } : c));
                      }}
                      className="w-full bg-[#0e0e0e] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-rk-gold/40 transition-all appearance-none cursor-pointer">
                      <option value="" className="bg-[#0e0e0e]">Select category...</option>
                      {categories.map(c => (
                        <option key={c._id} value={c.name} className="bg-[#0e0e0e]">{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
