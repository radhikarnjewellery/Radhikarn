import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users as UsersIcon, Search, ShoppingCart, IndianRupee, MapPin, Phone, Crown, X, Trash2, AlertTriangle, Loader2, Square, CheckSquare } from "lucide-react";
import PageLoader from "../components/PageLoader";

interface Address {
  _id?: string;
  label?: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
}

interface UserStat {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  phone: string | null;
  joinedAt: string;
  addresses: Address[];
  addressCount: number;
  orderCount: number;
  totalSpent: number;
}

export default function Users() {
  const [users, setUsers] = useState<UserStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserStat | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<string[] | null>(null);
  const [deleting, setDeleting] = useState(false);

  const token = () => localStorage.getItem('admin_token');

  const fetchUsers = () => {
    fetch(`${import.meta.env.VITE_API_URL}/api/user/admin/all`, {
      headers: { 'Authorization': `Bearer ${token()}` }
    })
      .then(r => r.json())
      .then(setUsers)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalRevenue = users.reduce((s, u) => s + u.totalSpent, 0);
  const totalOrders = users.reduce((s, u) => s + u.orderCount, 0);

  const allSelected = filtered.length > 0 && filtered.every(u => selectedIds.has(u._id));
  const toggleSelect = (id: string) => setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll = () => {
    if (allSelected) setSelectedIds(prev => { const n = new Set(prev); filtered.forEach(u => n.delete(u._id)); return n; });
    else setSelectedIds(prev => { const n = new Set(prev); filtered.forEach(u => n.add(u._id)); return n; });
  };

  const executeDelete = async (ids: string[]) => {
    setDeleting(true);
    try {
      await Promise.all(ids.map(id =>
        fetch(`${import.meta.env.VITE_API_URL}/api/user/admin/${id}`, {
          method: 'DELETE', headers: { 'Authorization': `Bearer ${token()}` }
        })
      ));
      setUsers(prev => prev.filter(u => !ids.includes(u._id)));
      setSelectedIds(new Set());
      setDeleteTarget(null);
    } catch (e) { console.error(e); }
    finally { setDeleting(false); }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-12 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 border-b border-rk-gold/10 pb-12">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="max-w-2xl">
          <div className="flex items-center gap-4 mb-4">
            <UsersIcon size={18} className="text-rk-gold" />
            <span className="text-rk-gold text-[10px] uppercase tracking-[0.5em] font-black">Registered Users</span>
          </div>
          <h1 className="text-5xl font-display uppercase tracking-[0.1em] text-white font-black mb-4 flex items-center gap-6">
            Customer <span className="gold-gradient-text italic font-medium lowercase font-cormorant text-[3.5rem] tracking-normal">Registry</span>
          </h1>
          <p className="text-[#6A6A6A] text-[10px] uppercase tracking-[0.25em] font-bold leading-none">All users who signed in via Google.</p>
        </motion.div>
      </header>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Total Users", value: users.length, icon: UsersIcon, color: "text-purple-400" },
          { label: "Total Orders", value: totalOrders, icon: ShoppingCart, color: "text-emerald-400" },
          { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString()}`, icon: IndianRupee, color: "text-rk-gold" },
        ].map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card rounded-2xl p-8 flex items-center gap-6"
          >
            <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center">
              <c.icon size={18} className={c.color} />
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-[0.4em] text-[#555] font-black mb-1">{c.label}</p>
              <p className="text-2xl font-mono font-black text-white">{c.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search + bulk delete */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative group flex-1 min-w-[220px]">
          <Search size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#444] group-focus-within:text-rk-gold transition-colors" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          className="admin-input pl-12"
          />
        </div>
        <AnimatePresence>
          {selectedIds.size > 0 && (
            <motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              onClick={() => setDeleteTarget(Array.from(selectedIds))}
              className="flex items-center gap-2 px-5 py-3 rounded-xl border border-red-500/30 text-red-400 bg-red-500/5 hover:bg-red-500/10 transition-all text-[9px] uppercase tracking-widest font-black">
              <Trash2 size={12} /> Delete {selectedIds.size} user{selectedIds.size > 1 ? 's' : ''}
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Table */}
      <div className="glass-card rounded-[32px] overflow-hidden border-[#D4AF37]/10">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-rk-gold/5 bg-rk-gold/[0.02]">
                <th className="px-6 py-7">
                  <button onClick={toggleAll} className="text-[#444] hover:text-rk-gold transition-colors">
                    {allSelected ? <CheckSquare size={14} className="text-rk-gold" /> : <Square size={14} />}
                  </button>
                </th>
                <th className="px-6 py-7 text-[9px] uppercase tracking-[0.4em] text-rk-gold font-black">User</th>
                <th className="px-8 py-7 text-[9px] uppercase tracking-[0.4em] text-[#666] font-black">Contact</th>
                <th className="px-8 py-7 text-[9px] uppercase tracking-[0.4em] text-[#666] font-black text-center">Orders</th>
                <th className="px-8 py-7 text-[9px] uppercase tracking-[0.4em] text-[#666] font-black text-right">Total Spent</th>
                <th className="px-8 py-7 text-[9px] uppercase tracking-[0.4em] text-[#666] font-black text-center">Addresses</th>
                <th className="px-8 py-7 text-[9px] uppercase tracking-[0.4em] text-[#666] font-black">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rk-gold/5">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-10 py-24 text-center">
                    <p className="text-[10px] uppercase tracking-[0.5em] text-gray-700 font-black">No users found</p>
                  </td>
                </tr>
              ) : filtered.map((user, i) => (
                <motion.tr
                  key={user._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className={`group transition-colors duration-300 ${selectedIds.has(user._id) ? 'bg-red-500/[0.03]' : 'hover:bg-rk-gold/[0.02]'}`}
                >
                  {/* Checkbox */}
                  <td className="px-6 py-5">
                    <button onClick={() => toggleSelect(user._id)} className="text-[#444] hover:text-rk-gold transition-colors">
                      {selectedIds.has(user._id) ? <CheckSquare size={14} className="text-red-400" /> : <Square size={14} />}
                    </button>
                  </td>

                  {/* User */}
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-rk-gold/10" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-rk-gold/10 border border-rk-gold/20 flex items-center justify-center">
                            <span className="text-rk-gold text-xs font-black">{user.name[0]?.toUpperCase()}</span>
                          </div>
                        )}
                        {user.totalSpent > 50000 && (
                          <Crown size={10} className="absolute -top-1 -right-1 text-rk-gold" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-display text-white font-bold uppercase tracking-widest leading-none mb-1">{user.name}</p>
                        <p className="text-[9px] uppercase tracking-widest text-[#444] font-black font-mono">{user.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="px-6 py-5">
                    {user.phone ? (
                      <div className="flex items-center gap-2 text-[#555]">
                        <Phone size={11} />
                        <span className="text-[10px] font-mono font-black">{user.phone}</span>
                      </div>
                    ) : (
                      <span className="text-[9px] uppercase tracking-widest text-[#333] font-black">—</span>
                    )}
                  </td>

                  {/* Orders */}
                  <td className="px-6 py-5 text-center">
                    <span className={`text-lg font-mono font-black ${user.orderCount > 0 ? 'text-emerald-400' : 'text-[#333]'}`}>
                      {user.orderCount}
                    </span>
                  </td>

                  {/* Total Spent */}
                  <td className="px-6 py-5 text-right">
                    <span className={`font-mono font-black text-sm ${user.totalSpent > 0 ? 'text-rk-gold' : 'text-[#333]'}`}>
                      {user.totalSpent > 0 ? `₹${user.totalSpent.toLocaleString()}` : '—'}
                    </span>
                  </td>

                  {/* Addresses */}
                  <td className="px-6 py-5 text-center">
                    <button
                      onClick={() => user.addressCount > 0 && setSelectedUser(user)}
                      className={`flex items-center justify-center gap-1.5 transition-colors ${user.addressCount > 0 ? 'text-rk-gold/60 hover:text-rk-gold cursor-pointer' : 'text-[#333] cursor-default'}`}
                    >
                      <MapPin size={11} />
                      <span className="text-[10px] font-mono font-black">{user.addressCount}</span>
                    </button>
                  </td>

                  {/* Joined */}
                  <td className="px-6 py-5">
                    <p className="text-[10px] uppercase tracking-widest text-[#444] font-black">
                      {new Date(user.joinedAt).toLocaleDateString('en-GB')}
                    </p>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => !deleting && setDeleteTarget(null)}
              className="fixed inset-0 bg-black/90 backdrop-blur-xl" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm glass-card rounded-[28px] p-8 border border-red-500/20">
              <div className="flex justify-center mb-5">
                <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <AlertTriangle size={24} className="text-red-500" />
                </div>
              </div>
              <h3 className="text-center text-lg font-display uppercase tracking-widest text-white font-black mb-2">
                Delete {deleteTarget.length > 1 ? `${deleteTarget.length} Users` : 'User'}
              </h3>
              <p className="text-center text-[9px] uppercase tracking-[0.3em] text-red-400/70 font-black mb-2">This will permanently delete the user{deleteTarget.length > 1 ? 's' : ''} and all their orders.</p>
              <p className="text-center text-[9px] uppercase tracking-[0.3em] text-[#444] font-black mb-8">This action cannot be undone.</p>
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

      {/* Address Popup */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedUser(null)}
              className="fixed inset-0 bg-black/85 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              className="relative w-full max-w-lg glass-card rounded-[32px] p-10 border border-rk-gold/15 shadow-[0_40px_100px_rgba(0,0,0,0.8)]"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    {selectedUser.avatar
                      ? <img src={selectedUser.avatar} className="w-8 h-8 rounded-full border border-rk-gold/20 object-cover" />
                      : <div className="w-8 h-8 rounded-full bg-rk-gold/10 border border-rk-gold/20 flex items-center justify-center text-rk-gold text-xs font-black">{selectedUser.name[0]}</div>
                    }
                    <p className="text-sm font-display uppercase tracking-widest text-white font-black">{selectedUser.name}</p>
                  </div>
                  <p className="text-[9px] uppercase tracking-[0.3em] text-rk-gold font-black ml-11">
                    {selectedUser.addressCount} saved address{selectedUser.addressCount !== 1 ? 'es' : ''}
                  </p>
                </div>
                <button onClick={() => setSelectedUser(null)} className="w-10 h-10 rounded-full glass-card border-white/5 flex items-center justify-center text-white/20 hover:text-white transition-all">
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
                {selectedUser.addresses.map((addr, i) => (
                  <div key={addr._id || i} className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin size={12} className="text-rk-gold" />
                        <span className="text-[9px] uppercase tracking-[0.4em] font-black text-rk-gold">
                          {addr.label || `Address ${i + 1}`}
                        </span>
                      </div>
                      {addr.phone && (
                        <div className="flex items-center gap-1.5 text-[#555]">
                          <Phone size={10} />
                          <span className="text-[9px] font-mono font-black">{addr.phone}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] text-white/70 font-black uppercase tracking-widest leading-relaxed">
                      {addr.street}
                    </p>
                    <p className="text-[10px] text-[#555] font-black uppercase tracking-widest">
                      {[addr.city, addr.state, addr.pincode].filter(Boolean).join(', ')}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
