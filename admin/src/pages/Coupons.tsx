import { useState, useEffect, useRef } from "react";
import { Plus, Edit2, Trash2, Tag, Calendar, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, parse, isValid, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isBefore, startOfDay, isSameDay } from "date-fns";

interface Coupon {
  _id: string;
  code: string;
  type: 'fixed' | 'percentage';
  value: number;
  minOrderValue?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  expiresAt?: string;
}

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function MiniCalendar({ selected, onSelect }: { selected?: Date; onSelect: (d: Date) => void }) {
  const [viewDate, setViewDate] = useState(selected || new Date());
  const today = startOfDay(new Date());
  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(viewDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPad = getDay(monthStart); // 0=Sun

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button type="button" onClick={() => setViewDate(subMonths(viewDate, 1))}
          className="w-8 h-8 rounded-xl bg-white/5 hover:bg-rk-gold/20 hover:text-rk-gold text-white/30 flex items-center justify-center transition-all">
          <ChevronLeft size={14} />
        </button>
        <span className="text-[11px] uppercase tracking-[0.3em] font-black text-white">
          {format(viewDate, 'MMMM yyyy')}
        </span>
        <button type="button" onClick={() => setViewDate(addMonths(viewDate, 1))}
          className="w-8 h-8 rounded-xl bg-white/5 hover:bg-rk-gold/20 hover:text-rk-gold text-white/30 flex items-center justify-center transition-all">
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-2">
        {DAYS.map(d => (
          <div key={d} className="text-center text-[9px] uppercase tracking-widest text-white/20 font-black py-1">{d}</div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-y-1">
        {Array.from({ length: startPad }).map((_, i) => <div key={`pad-${i}`} />)}
        {days.map(day => {
          const isPast = isBefore(day, today);
          const isSelected = selected && isSameDay(day, selected);
          const isToday = isSameDay(day, today);
          return (
            <button key={day.toISOString()} type="button"
              disabled={isPast}
              onClick={() => onSelect(day)}
              className={`
                mx-auto w-9 h-9 rounded-xl text-sm font-bold transition-all flex items-center justify-center
                ${isSelected ? 'bg-[#D4AF37] text-black shadow-lg shadow-rk-gold/20' :
                  isToday ? 'border border-rk-gold/40 text-rk-gold' :
                  isPast ? 'text-white/10 cursor-not-allowed' :
                  'text-white/60 hover:bg-rk-gold/15 hover:text-rk-gold'}
              `}>
              {format(day, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function Coupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState({ code: '', type: 'percentage' as 'fixed' | 'percentage', value: 0, minOrderValue: 0, maxDiscount: 0, usageLimit: 0, isActive: true, expiresAt: '' });
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const selectedDate = formData.expiresAt ? parse(formData.expiresAt, 'yyyy-MM-dd', new Date()) : undefined;
  const displayDate = selectedDate && isValid(selectedDate) ? format(selectedDate, 'dd/MM/yyyy') : '';

  useEffect(() => { fetchCoupons(); }, []);

  useEffect(() => {
    if (!showCalendar) return;
    const handler = (e: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
        setShowCalendar(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showCalendar]);

  const fetchCoupons = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/coupons`, { headers: { 'Authorization': `Bearer ${token}` } });
      setCoupons(await res.json());
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim()) return;
    try {
      const token = localStorage.getItem('admin_token');
      const url = editingCoupon ? `${import.meta.env.VITE_API_URL}/api/coupons/${editingCoupon._id}` : `${import.meta.env.VITE_API_URL}/api/coupons`;
      const payload = { ...formData, minOrderValue: formData.minOrderValue || undefined, maxDiscount: formData.maxDiscount || undefined, usageLimit: formData.usageLimit || undefined, expiresAt: formData.expiresAt || undefined };
      const res = await fetch(url, { method: editingCoupon ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(payload) });
      if (res.ok) { fetchCoupons(); setShowModal(false); resetForm(); }
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem('admin_token');
    await fetch(`${import.meta.env.VITE_API_URL}/api/coupons/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    setDeleteId(null);
    fetchCoupons();
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({ code: coupon.code, type: coupon.type, value: coupon.value, minOrderValue: coupon.minOrderValue || 0, maxDiscount: coupon.maxDiscount || 0, usageLimit: coupon.usageLimit || 0, isActive: coupon.isActive, expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().split('T')[0] : '' });
    setShowModal(true);
  };

  const resetForm = () => { setFormData({ code: '', type: 'percentage', value: 0, minOrderValue: 0, maxDiscount: 0, usageLimit: 0, isActive: true, expiresAt: '' }); setEditingCoupon(null); };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-4 mb-3">
            <div className="w-8 h-[1px] gold-gradient" />
            <span className="text-rk-gold text-[10px] uppercase tracking-[0.5em] font-black">Discount Management</span>
          </div>
          <h1 className="text-5xl font-display uppercase tracking-[0.1em] text-white font-black mb-3">
            Coupon <span className="gold-gradient-text italic font-medium lowercase font-cormorant text-[3.5rem] tracking-normal ml-2">Codes</span>
          </h1>
          <p className="text-[#6A6A6A] text-[10px] uppercase tracking-[0.25em] font-bold">Create and manage discount codes for customers.</p>
        </motion.div>
        <button onClick={() => { resetForm(); setShowModal(true); }} className="flex items-center gap-3 px-8 py-4 rounded-2xl gold-gradient text-black text-[10px] uppercase font-black tracking-[0.3em] hover:scale-105 transition-all shadow-lg shadow-rk-gold/10">
          <Plus size={16} /> Add Coupon
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-2 border-rk-gold/20 border-t-rk-gold rounded-full animate-spin" />
        </div>
      ) : coupons.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center glass-card rounded-3xl border border-white/5">
          <div className="w-16 h-16 rounded-full bg-rk-gold/10 border border-rk-gold/20 flex items-center justify-center mb-6">
            <Tag size={28} className="text-rk-gold" />
          </div>
          <p className="text-white text-lg font-display uppercase tracking-widest mb-2">No Coupons Yet</p>
          <p className="text-[#555] text-[11px] uppercase tracking-widest mb-8">Create discount codes for your customers</p>
          <button onClick={() => { resetForm(); setShowModal(true); }} className="flex items-center gap-2 gold-gradient text-black px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all">
            <Plus size={16} /> Add First Coupon
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {coupons.map((coupon, i) => (
            <motion.div key={coupon._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="glass-card rounded-3xl border-white/5 hover:border-rk-gold/20 transition-all p-8 flex flex-col gap-5">
              <div className="flex items-start justify-between">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${coupon.isActive ? 'bg-rk-gold/10 text-rk-gold' : 'bg-white/5 text-white/20'}`}>
                  <Tag size={20} />
                </div>
                <span className={`text-[9px] px-3 py-1 rounded-full uppercase tracking-widest font-black ${coupon.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-white/20'}`}>
                  {coupon.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div>
                <p className="text-rk-gold font-black text-xl font-mono tracking-widest mb-1">{coupon.code}</p>
                <p className="text-white text-2xl font-display font-black">
                  {coupon.type === 'fixed' ? `₹${coupon.value} off` : `${coupon.value}% off`}
                </p>
              </div>
              <div className="space-y-2 text-[10px] text-white/30 uppercase tracking-widest font-black">
                {coupon.minOrderValue ? <p>Min order: ₹{coupon.minOrderValue}</p> : null}
                {coupon.maxDiscount ? <p>Max discount: ₹{coupon.maxDiscount}</p> : null}
                {coupon.usageLimit ? (
                  <div className="flex items-center gap-2"><Users size={11} /><p>Used: {coupon.usedCount}/{coupon.usageLimit}</p></div>
                ) : null}
                {coupon.expiresAt ? (
                  <div className="flex items-center gap-2"><Calendar size={11} /><p>Expires: {new Date(coupon.expiresAt).toLocaleDateString()}</p></div>
                ) : null}
              </div>
              <div className="flex gap-3 pt-2 border-t border-white/5">
                <button onClick={() => handleEdit(coupon)} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-rk-gold/10 hover:text-rk-gold text-white/40 transition-all text-[10px] uppercase font-black tracking-widest">
                  <Edit2 size={13} /> Edit
                </button>
                <button onClick={() => setDeleteId(coupon._id)} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-red-500/10 hover:text-red-400 text-white/40 transition-all text-[10px] uppercase font-black tracking-widest">
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
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => { setShowModal(false); resetForm(); }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="glass-card rounded-3xl border-rk-gold/10 p-10 w-full max-w-lg space-y-8 my-8">
              <h2 className="text-2xl font-display uppercase tracking-widest text-white">
                {editingCoupon ? 'Edit' : 'New'} <span className="gold-gradient-text italic font-cormorant font-medium lowercase">Coupon</span>
              </h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.3em] text-[#555] font-black">Coupon Code</label>
                  <input value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. SAVE20"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-3.5 text-white font-mono text-sm outline-none focus:border-rk-gold/40 transition-all placeholder:text-white/20" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.3em] text-[#555] font-black">Discount Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    {(['percentage', 'fixed'] as const).map(t => (
                      <button key={t} type="button" onClick={() => setFormData({ ...formData, type: t })}
                        className={`py-3 rounded-xl border text-[10px] uppercase font-black tracking-widest transition-all ${formData.type === t ? 'bg-rk-gold/10 border-rk-gold text-rk-gold' : 'bg-white/[0.02] border-white/10 text-white/30 hover:border-white/20'}`}>
                        {t === 'fixed' ? '₹ Fixed Amount' : '% Percentage'}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.3em] text-[#555] font-black">Discount Value</label>
                    <input type="number" value={formData.value} onChange={e => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })} min="0" step="0.01"
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-3.5 text-white text-sm outline-none focus:border-rk-gold/40 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.3em] text-[#555] font-black">Min Order (₹)</label>
                    <input type="number" value={formData.minOrderValue} onChange={e => setFormData({ ...formData, minOrderValue: parseFloat(e.target.value) || 0 })} min="0"
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-3.5 text-white text-sm outline-none focus:border-rk-gold/40 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.3em] text-[#555] font-black">Max Discount (₹)</label>
                    <input type="number" value={formData.maxDiscount} onChange={e => setFormData({ ...formData, maxDiscount: parseFloat(e.target.value) || 0 })} min="0"
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-3.5 text-white text-sm outline-none focus:border-rk-gold/40 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.3em] text-[#555] font-black">Usage Limit</label>
                    <input type="number" value={formData.usageLimit} onChange={e => setFormData({ ...formData, usageLimit: parseInt(e.target.value) || 0 })} min="0"
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-3.5 text-white text-sm outline-none focus:border-rk-gold/40 transition-all" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.3em] text-[#555] font-black">Expiry Date</label>
                  <div className="relative" ref={calendarRef}>
                    <button type="button" onClick={() => setShowCalendar(v => !v)}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-3.5 text-sm outline-none focus:border-rk-gold/40 transition-all flex items-center justify-between group hover:border-rk-gold/30">
                      <span className={displayDate ? 'text-white' : 'text-white/20'}>{displayDate || 'DD/MM/YYYY'}</span>
                      <Calendar size={15} className="text-white/30 group-hover:text-rk-gold transition-colors" />
                    </button>
                    <AnimatePresence>
                      {showCalendar && (
                        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                          className="absolute z-50 bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[#0e0e0e] border border-rk-gold/20 rounded-2xl p-5 shadow-2xl w-[300px]">
                          <MiniCalendar
                            selected={selectedDate && isValid(selectedDate) ? selectedDate : undefined}
                            onSelect={(date) => {
                              setFormData({ ...formData, expiresAt: format(date, 'yyyy-MM-dd') });
                              setShowCalendar(false);
                            }}
                          />
                          {formData.expiresAt && (
                            <button type="button" onClick={() => { setFormData({ ...formData, expiresAt: '' }); setShowCalendar(false); }}
                              className="w-full mt-3 py-2 rounded-lg text-[9px] uppercase tracking-widest font-black text-white/20 hover:text-red-400 hover:bg-red-400/5 transition-all border border-white/5">
                              Clear
                            </button>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
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
                    {editingCoupon ? 'Update' : 'Create'}
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
                <p className="text-white font-display text-xl uppercase tracking-widest mb-2">Delete Coupon?</p>
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
