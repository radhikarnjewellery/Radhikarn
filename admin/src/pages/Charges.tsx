import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Zap, Percent, IndianRupee } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Charge {
  _id: string;
  name: string;
  type: 'fixed' | 'percentage';
  value: number;
  isActive: boolean;
}

export default function Charges() {
  const [charges, setCharges] = useState<Charge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCharge, setEditingCharge] = useState<Charge | null>(null);
  const [formData, setFormData] = useState({ name: '', type: 'fixed' as 'fixed' | 'percentage', value: 0, isActive: true });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => { fetchCharges(); }, []);

  const fetchCharges = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/charges`, { headers: { 'Authorization': `Bearer ${token}` } });
      setCharges(await res.json());
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    try {
      const token = localStorage.getItem('admin_token');
      const url = editingCharge ? `${import.meta.env.VITE_API_URL}/api/charges/${editingCharge._id}` : `${import.meta.env.VITE_API_URL}/api/charges`;
      const res = await fetch(url, { method: editingCharge ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(formData) });
      if (res.ok) { fetchCharges(); setShowModal(false); resetForm(); }
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem('admin_token');
    await fetch(`${import.meta.env.VITE_API_URL}/api/charges/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    setDeleteId(null);
    fetchCharges();
  };

  const handleEdit = (charge: Charge) => {
    setEditingCharge(charge);
    setFormData({ name: charge.name, type: charge.type, value: charge.value, isActive: charge.isActive });
    setShowModal(true);
  };

  const resetForm = () => { setFormData({ name: '', type: 'fixed', value: 0, isActive: true }); setEditingCharge(null); };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-4 mb-3">
            <div className="w-8 h-[1px] gold-gradient" />
            <span className="text-rk-gold text-[10px] uppercase tracking-[0.5em] font-black">Fee Management</span>
          </div>
          <h1 className="text-5xl font-display uppercase tracking-[0.1em] text-white font-black mb-3">
            Charges <span className="gold-gradient-text italic font-medium lowercase font-cormorant text-[3.5rem] tracking-normal ml-2">&amp; Fees</span>
          </h1>
          <p className="text-[#6A6A6A] text-[10px] uppercase tracking-[0.25em] font-bold">Set delivery, GST and other fees applied at checkout.</p>
        </motion.div>
        <button onClick={() => { resetForm(); setShowModal(true); }} className="flex items-center gap-3 px-8 py-4 rounded-2xl gold-gradient text-black text-[10px] uppercase font-black tracking-[0.3em] hover:scale-105 transition-all shadow-lg shadow-rk-gold/10">
          <Plus size={16} /> Add Charge
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-2 border-rk-gold/20 border-t-rk-gold rounded-full animate-spin" />
        </div>
      ) : charges.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center glass-card rounded-3xl border border-white/5">
          <div className="w-16 h-16 rounded-full bg-rk-gold/10 border border-rk-gold/20 flex items-center justify-center mb-6">
            <Zap size={28} className="text-rk-gold" />
          </div>
          <p className="text-white text-lg font-display uppercase tracking-widest mb-2">No Charges Yet</p>
          <p className="text-[#555] text-[11px] uppercase tracking-widest mb-8">Add delivery fees, GST or any custom charge</p>
          <button onClick={() => { resetForm(); setShowModal(true); }} className="flex items-center gap-2 gold-gradient text-black px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all">
            <Plus size={16} /> Add First Charge
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {charges.map((charge, i) => (
            <motion.div key={charge._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="glass-card rounded-3xl border-white/5 hover:border-rk-gold/20 transition-all p-8 flex flex-col gap-6">
              <div className="flex items-start justify-between">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${charge.isActive ? 'bg-rk-gold/10 text-rk-gold' : 'bg-white/5 text-white/20'}`}>
                  {charge.type === 'fixed' ? <IndianRupee size={20} /> : <Percent size={20} />}
                </div>
                <span className={`text-[9px] px-3 py-1 rounded-full uppercase tracking-widest font-black ${charge.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-white/20'}`}>
                  {charge.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div>
                <p className="text-white font-black text-lg uppercase tracking-widest mb-1">{charge.name}</p>
                <p className="text-rk-gold text-2xl font-display font-black">
                  {charge.type === 'fixed' ? `₹${charge.value}` : `${charge.value}%`}
                </p>
              </div>
              <div className="flex gap-3 pt-2 border-t border-white/5">
                <button onClick={() => handleEdit(charge)} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-rk-gold/10 hover:text-rk-gold text-white/40 transition-all text-[10px] uppercase font-black tracking-widest">
                  <Edit2 size={13} /> Edit
                </button>
                <button onClick={() => setDeleteId(charge._id)} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-red-500/10 hover:text-red-400 text-white/40 transition-all text-[10px] uppercase font-black tracking-widest">
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => { setShowModal(false); resetForm(); }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="glass-card rounded-3xl border-rk-gold/10 p-10 w-full max-w-md space-y-8">
              <h2 className="text-2xl font-display uppercase tracking-widest text-white">
                {editingCharge ? 'Edit' : 'New'} <span className="gold-gradient-text italic font-cormorant font-medium lowercase">Charge</span>
              </h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.3em] text-[#555] font-black">Charge Name</label>
                  <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Delivery Fee, GST"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-3.5 text-white text-sm outline-none focus:border-rk-gold/40 transition-all placeholder:text-white/20" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.3em] text-[#555] font-black">Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    {(['fixed', 'percentage'] as const).map(t => (
                      <button key={t} type="button" onClick={() => setFormData({ ...formData, type: t })}
                        className={`py-3 rounded-xl border text-[10px] uppercase font-black tracking-widest transition-all ${formData.type === t ? 'bg-rk-gold/10 border-rk-gold text-rk-gold' : 'bg-white/[0.02] border-white/10 text-white/30 hover:border-white/20'}`}>
                        {t === 'fixed' ? '₹ Fixed Amount' : '% Percentage'}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.3em] text-[#555] font-black">Value {formData.type === 'percentage' && '(%)'}</label>
                  <input type="number" value={formData.value} onChange={e => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                    min="0" step="0.01"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-3.5 text-white text-sm outline-none focus:border-rk-gold/40 transition-all" />
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-[10px] uppercase tracking-[0.3em] text-white/60 font-black">Active</span>
                  <button type="button" onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                    className={`w-12 h-6 rounded-full transition-all relative ${formData.isActive ? 'bg-rk-gold' : 'bg-white/10'}`}>
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.isActive ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => { setShowModal(false); resetForm(); }}
                    className="flex-1 py-3.5 rounded-xl border border-white/10 text-white/40 text-[10px] uppercase font-black tracking-widest hover:bg-white/5 transition-all">Cancel</button>
                  <button type="submit"
                    className="flex-1 py-3.5 rounded-xl gold-gradient text-black text-[10px] uppercase font-black tracking-widest hover:scale-[1.02] transition-all">
                    {editingCharge ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={() => setDeleteId(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="glass-card rounded-3xl border-red-500/20 p-8 w-full max-w-sm space-y-6 text-center">
              <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
                <Trash2 size={22} className="text-red-400" />
              </div>
              <div>
                <p className="text-white font-display text-xl uppercase tracking-widest mb-2">Delete Charge?</p>
                <p className="text-[#555] text-[11px] uppercase tracking-widest">This action cannot be undone.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-white/40 text-[10px] uppercase font-black tracking-widest hover:bg-white/5 transition-all">Keep</button>
                <button onClick={() => handleDelete(deleteId)}
                  className="flex-1 py-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-[10px] uppercase font-black tracking-widest hover:bg-red-500/30 transition-all">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
