import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, MapPin, Monitor, Clock, RefreshCw, Trash2, Square, CheckSquare, AlertTriangle, XCircle, Loader2 } from "lucide-react";
import PageLoader from "../components/PageLoader";

interface Visitor {
  _id: string;
  ip: string;
  userEmail?: string;
  userName?: string;
  city?: string;
  region?: string;
  country?: string;
  userAgent?: string;
  lastSeen: string;
  visitCount: number;
  seen: boolean;
  createdAt: string;
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function getBrowser(ua: string = '') {
  if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
  if (ua.includes('Edg')) return 'Edge';
  return 'Unknown';
}

export default function Visitors() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'logged' | 'anon'>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<string[] | null>(null);
  const [deleting, setDeleting] = useState(false);

  const token = () => localStorage.getItem('admin_token');

  const fetchVisitors = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/visitors`, {
        headers: { Authorization: `Bearer ${token()}` }
      });
      const data = await res.json();
      setVisitors(data);
      fetch(`${import.meta.env.VITE_API_URL}/api/visitors/seen`, {
        method: 'PUT', headers: { Authorization: `Bearer ${token()}` }
      });
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchVisitors(); }, []);

  const filtered = visitors.filter(v =>
    filter === 'all' ? true : filter === 'logged' ? !!v.userEmail : !v.userEmail
  );

  const allSelected = filtered.length > 0 && filtered.every(v => selectedIds.has(v._id));

  const toggleSelect = (id: string) => setSelectedIds(prev => {
    const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n;
  });

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(prev => { const n = new Set(prev); filtered.forEach(v => n.delete(v._id)); return n; });
    } else {
      setSelectedIds(prev => { const n = new Set(prev); filtered.forEach(v => n.add(v._id)); return n; });
    }
  };

  const executeDelete = async (ids: string[]) => {
    setDeleting(true);
    try {
      if (ids.length === 1) {
        await fetch(`${import.meta.env.VITE_API_URL}/api/visitors/${ids[0]}`, {
          method: 'DELETE', headers: { Authorization: `Bearer ${token()}` }
        });
      } else {
        await fetch(`${import.meta.env.VITE_API_URL}/api/visitors/bulk`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
          body: JSON.stringify({ ids })
        });
      }
      setVisitors(prev => prev.filter(v => !ids.includes(v._id)));
      setSelectedIds(new Set());
      setDeleteTarget(null);
    } catch {}
    finally { setDeleting(false); }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-10 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-rk-gold/10 pb-10">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-4 mb-4">
            <Users size={18} className="text-rk-gold" />
            <span className="text-rk-gold text-[10px] uppercase tracking-[0.5em] font-black">Site Analytics</span>
          </div>
          <h1 className="text-5xl font-display uppercase tracking-[0.1em] text-white font-black mb-3 flex items-center gap-5">
            Visitors <span className="gold-gradient-text italic font-medium lowercase font-cormorant text-[3.5rem] tracking-normal">Log</span>
          </h1>
          <p className="text-[#6A6A6A] text-[10px] uppercase tracking-[0.25em] font-bold">Everyone who visited your store.</p>
        </motion.div>
        <button onClick={fetchVisitors}
          className="flex items-center gap-2 text-[9px] uppercase tracking-widest font-black text-white/30 hover:text-rk-gold transition-colors border border-white/5 hover:border-rk-gold/30 px-4 py-2.5 rounded-xl">
          <RefreshCw size={12} /> Refresh
        </button>
      </header>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Visits', value: visitors.length, color: 'text-rk-gold' },
          { label: 'Logged In', value: visitors.filter(v => v.userEmail).length, color: 'text-emerald-400' },
          { label: 'Anonymous', value: visitors.filter(v => !v.userEmail).length, color: 'text-blue-400' },
        ].map(s => (
          <div key={s.label} className="glass-card rounded-2xl p-6 text-center">
            <p className={`text-3xl font-mono font-black ${s.color}`}>{s.value}</p>
            <p className="text-[9px] uppercase tracking-widest text-[#555] font-black mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters + bulk delete */}
      <div className="flex flex-wrap gap-3 items-center">
        {(['all', 'logged', 'anon'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-5 py-2.5 rounded-xl border text-[9px] uppercase tracking-widest font-black transition-all ${
              filter === f ? 'bg-rk-gold/10 border-rk-gold/40 text-rk-gold' : 'glass-card border-white/5 text-[#555] hover:text-white/60'
            }`}>
            {f === 'all' ? 'All' : f === 'logged' ? 'Logged In' : 'Anonymous'}
          </button>
        ))}
        <AnimatePresence>
          {selectedIds.size > 0 && (
            <motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              onClick={() => setDeleteTarget(Array.from(selectedIds))}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-red-500/30 text-red-400 bg-red-500/5 hover:bg-red-500/10 transition-all text-[9px] uppercase tracking-widest font-black">
              <Trash2 size={12} /> Delete {selectedIds.size} selected
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Table */}
      <div className="glass-card rounded-[28px] overflow-hidden border-rk-gold/10">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-rk-gold/5 bg-rk-gold/[0.02]">
                <th className="px-4 py-4">
                  <button onClick={toggleAll} className="text-[#444] hover:text-rk-gold transition-colors">
                    {allSelected ? <CheckSquare size={14} className="text-rk-gold" /> : <Square size={14} />}
                  </button>
                </th>
                <th className="px-4 py-4 text-[9px] uppercase tracking-[0.4em] text-rk-gold font-black">Visitor</th>
                <th className="px-4 py-4 text-[9px] uppercase tracking-[0.4em] text-[#666] font-black">Location</th>
                <th className="px-4 py-4 text-[9px] uppercase tracking-[0.4em] text-[#666] font-black hidden md:table-cell">IP</th>
                <th className="px-4 py-4 text-[9px] uppercase tracking-[0.4em] text-[#666] font-black hidden lg:table-cell">Browser</th>
                <th className="px-4 py-4 text-[9px] uppercase tracking-[0.4em] text-[#666] font-black text-center">Visits</th>
                <th className="px-4 py-4 text-[9px] uppercase tracking-[0.4em] text-[#666] font-black">Last Seen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rk-gold/5">
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-6 py-20 text-center text-[10px] uppercase tracking-widest text-[#333] font-black">No visitors yet</td></tr>
              ) : filtered.map(v => (
                <tr key={v._id} className={`transition-colors duration-300 ${selectedIds.has(v._id) ? 'bg-red-500/[0.03]' : !v.seen ? 'bg-rk-gold/[0.02]' : 'hover:bg-white/[0.01]'}`}>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleSelect(v._id)} className="text-[#444] hover:text-rk-gold transition-colors">
                      {selectedIds.has(v._id) ? <CheckSquare size={14} className="text-red-400" /> : <Square size={14} />}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    {v.userEmail ? (
                      <div>
                        <p className="text-sm font-display text-white font-bold uppercase tracking-widest leading-none mb-1">{v.userName || 'User'}</p>
                        <p className="text-[9px] font-mono text-[#444] lowercase">{v.userEmail}</p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                          <Users size={11} className="text-[#444]" />
                        </div>
                        <span className="text-[10px] uppercase tracking-widest text-[#444] font-black">Anonymous</span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {v.city || v.region ? (
                      <div className="flex items-center gap-1.5 text-[#555]">
                        <MapPin size={11} className="shrink-0" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{[v.city, v.region].filter(Boolean).join(', ')}</span>
                      </div>
                    ) : <span className="text-[#333] text-[9px] font-black uppercase tracking-widest">—</span>}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell"><span className="text-[10px] font-mono text-[#444]">{v.ip}</span></td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <div className="flex items-center gap-1.5 text-[#555]">
                      <Monitor size={11} />
                      <span className="text-[9px] uppercase tracking-widest font-black">{getBrowser(v.userAgent)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center"><span className="text-sm font-mono font-black text-white/60">{v.visitCount}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-[#444]">
                      <Clock size={11} />
                      <span className="text-[9px] uppercase tracking-widest font-black">{timeAgo(v.lastSeen)}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete confirm modal */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => !deleting && setDeleteTarget(null)}
              className="fixed inset-0 bg-black/90 backdrop-blur-xl" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm glass-card rounded-[28px] p-8 border border-red-500/20">
              <div className="flex justify-center mb-6">
                <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <AlertTriangle size={24} className="text-red-500" />
                </div>
              </div>
              <h3 className="text-center text-lg font-display uppercase tracking-widest text-white font-black mb-2">Delete {deleteTarget.length > 1 ? `${deleteTarget.length} Visitors` : 'Visitor'}</h3>
              <p className="text-center text-[9px] uppercase tracking-[0.3em] text-red-400/70 font-black mb-8">This action is permanent and cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteTarget(null)} disabled={deleting}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-[9px] uppercase tracking-widest font-black text-[#555] hover:text-white transition-all disabled:opacity-40">
                  Cancel
                </button>
                <button onClick={() => executeDelete(deleteTarget)} disabled={deleting}
                  className="flex-1 py-3 rounded-xl border border-red-500/30 bg-red-500/10 text-[9px] uppercase tracking-widest font-black text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-40 flex items-center justify-center gap-2">
                  {deleting ? <><Loader2 size={11} className="animate-spin" /> Deleting...</> : <><Trash2 size={11} /> Delete</>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
