import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Bell, GripVertical } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Notification { _id: string; text: string; isActive: boolean; order: number; }

export default function Notifications() {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Notification | null>(null);
  const [formData, setFormData] = useState({ text: '', isActive: true });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/notifications`, { headers: { 'Authorization': `Bearer ${token}` } });
      setItems(await res.json());
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.text.trim()) return;
    const token = localStorage.getItem('admin_token');
    const url = editing ? `${import.meta.env.VITE_API_URL}/api/notifications/${editing._id}` : `${import.meta.env.VITE_API_URL}/api/notifications`;
    await fetch(url, { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(formData) });
    fetchItems(); setShowModal(false); reset();
  };

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem('admin_token');
    await fetch(`${import.meta.env.VITE_API_URL}/api/notifications/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    setDeleteId(null);
    fetchItems();
  };

  const toggleActive = async (item: Notification) => {
    const token = localStorage.getItem('admin_token');
    await fetch(`${import.meta.env.VITE_API_URL}/api/notifications/${item._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ isActive: !item.isActive }) });
    fetchItems();
  };

  const reset = () => { setFormData({ text: '', isActive: true }); setEditing(null); };

  const openEdit = (item: Notification) => { setEditing(item); setFormData({ text: item.text, isActive: item.isActive }); setShowModal(true); };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-4 mb-3">
            <div className="w-8 h-[1px] gold-gradient" />
            <span className="text-rk-gold text-[10px] uppercase tracking-[0.5em] font-black">Site Banner</span>
          </div>
          <h1 className="text-5xl font-display uppercase tracking-[0.1em] text-white font-black mb-3">
            Notifications <span className="gold-gradient-text italic font-medium lowercase font-cormorant text-[3.5rem] tracking-normal ml-2">Banner</span>
          </h1>
          <p className="text-[#6A6A6A] text-[10px] uppercase tracking-[0.25em] font-bold">Scrolling announcements shown on the homepage hero.</p>
        </motion.div>
        <button onClick={() => { reset(); setShowModal(true); }} className="flex items-center gap-3 px-8 py-4 rounded-2xl gold-gradient text-black text-[10px] uppercase font-black tracking-[0.3em] hover:scale-105 transition-all shadow-lg shadow-rk-gold/10">
          <Plus size={16} /> Add Notification
        </button>
      </div>

      {/* Preview */}
      {items.filter(i => i.isActive).length > 0 && (
        <div className="glass-card rounded-2xl border-rk-gold/10 p-4 overflow-hidden">
          <p className="text-[9px] uppercase tracking-[0.4em] text-rk-gold font-black mb-3">Live Preview</p>
          <div className="bg-black/40 rounded-xl py-2.5 overflow-hidden relative">
            <div className="flex gap-16 animate-[marquee_20s_linear_infinite] whitespace-nowrap">
              {[...items.filter(i => i.isActive), ...items.filter(i => i.isActive)].map((item, i) => (
                <span key={i} className="text-[11px] text-[#D4AF37] font-black uppercase tracking-[0.2em] inline-flex items-center gap-3">
                  <span className="w-1 h-1 rounded-full bg-rk-gold inline-block" />
                  {item.text}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-2 border-rk-gold/20 border-t-rk-gold rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center glass-card rounded-3xl border border-white/5">
          <div className="w-16 h-16 rounded-full bg-rk-gold/10 border border-rk-gold/20 flex items-center justify-center mb-6">
            <Bell size={28} className="text-rk-gold" />
          </div>
          <p className="text-white text-lg font-display uppercase tracking-widest mb-2">No Notifications</p>
          <p className="text-[#555] text-[11px] uppercase tracking-widest mb-8">Add scrolling announcements for your homepage</p>
          <button onClick={() => { reset(); setShowModal(true); }} className="flex items-center gap-2 gold-gradient text-black px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all">
            <Plus size={16} /> Add First Notification
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, i) => (
            <motion.div key={item._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="glass-card rounded-2xl border-white/5 hover:border-rk-gold/20 transition-all px-6 py-5 flex items-center gap-5">
              <GripVertical size={16} className="text-white/10 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold truncate ${item.isActive ? 'text-white' : 'text-white/30'}`}>{item.text}</p>
              </div>
              <button onClick={() => toggleActive(item)}
                className={`w-11 h-6 rounded-full transition-all relative shrink-0 ${item.isActive ? 'bg-rk-gold' : 'bg-white/10'}`}>
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${item.isActive ? 'left-6' : 'left-1'}`} />
              </button>
              <button onClick={() => openEdit(item)} className="w-9 h-9 rounded-xl bg-white/5 hover:bg-rk-gold/10 hover:text-rk-gold text-white/30 flex items-center justify-center transition-all shrink-0">
                <Edit2 size={14} />
              </button>
              <button onClick={() => setDeleteId(item._id)} className="w-9 h-9 rounded-xl bg-white/5 hover:bg-red-500/10 hover:text-red-400 text-white/30 flex items-center justify-center transition-all shrink-0">
                <Trash2 size={14} />
              </button>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => { setShowModal(false); reset(); }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="glass-card rounded-3xl border-rk-gold/10 p-10 w-full max-w-md space-y-8">
              <h2 className="text-2xl font-display uppercase tracking-widest text-white">
                {editing ? 'Edit' : 'New'} <span className="gold-gradient-text italic font-cormorant font-medium lowercase">Notification</span>
              </h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.3em] text-[#555] font-black">Message Text</label>
                  <textarea value={formData.text} onChange={e => setFormData({ ...formData, text: e.target.value })}
                    placeholder="e.g. Free shipping on orders above ₹5000 · Use code GOLD10 for 10% off"
                    rows={3}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-3.5 text-white text-sm outline-none focus:border-rk-gold/40 transition-all placeholder:text-white/20 resize-none" />
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-[10px] uppercase tracking-[0.3em] text-white/60 font-black">Active</span>
                  <button type="button" onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                    className={`w-12 h-6 rounded-full transition-all relative ${formData.isActive ? 'bg-rk-gold' : 'bg-white/10'}`}>
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.isActive ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => { setShowModal(false); reset(); }}
                    className="flex-1 py-3.5 rounded-xl border border-white/10 text-white/40 text-[10px] uppercase font-black tracking-widest hover:bg-white/5 transition-all">Cancel</button>
                  <button type="submit"
                    className="flex-1 py-3.5 rounded-xl gold-gradient text-black text-[10px] uppercase font-black tracking-widest hover:scale-[1.02] transition-all">
                    {editing ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {deleteId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setDeleteId(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="glass-card rounded-3xl border-red-500/20 p-10 w-full max-w-sm space-y-6 text-center">
              <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
                <Trash2 size={24} className="text-red-400" />
              </div>
              <div>
                <p className="text-white font-display text-xl uppercase tracking-widest mb-2">Delete Notification?</p>
                <p className="text-[#555] text-[11px] uppercase tracking-widest">This action cannot be undone.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)}
                  className="flex-1 py-3.5 rounded-xl border border-white/10 text-white/40 text-[10px] uppercase font-black tracking-widest hover:bg-white/5 transition-all">Keep</button>
                <button onClick={() => handleDelete(deleteId)}
                  className="flex-1 py-3.5 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-[10px] uppercase font-black tracking-widest hover:bg-red-500/30 transition-all">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
