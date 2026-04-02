import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingCart, Package, Truck, 
  CheckCircle, X, 
  Search, Eye, Filter, Mail, Phone, MapPin, Loader2, XCircle, AlertTriangle, Trash2, Square, CheckSquare,
  Copy, ExternalLink, Tag
} from "lucide-react";
import { clsx } from "clsx";
import PageLoader from "../components/PageLoader";

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  _id: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  latitude?: number;
  longitude?: number;
  items: OrderItem[];
  subtotal?: number;
  charges?: { name: string; type: string; value: number; amount: number }[];
  couponCode?: string;
  couponDiscount?: number;
  totalAmount: number;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  createdAt: string;
}

// Low-dependency Map Component with Pin Icon
function OrderMap({ lat, lng, id }: { lat: number, lng: number, id: string }) {
  useEffect(() => {
    const container = document.getElementById(`map-${id}`);
    if (!container || !(window as any).L) return;
    
    const L = (window as any).L;
    const map = L.map(container, {
      zoomControl: false,
      attributionControl: false
    }).setView([lat, lng], 16);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    
    const customIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="position: relative; width: 24px; height: 32px;">
        <svg width="24" height="32" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 20 12 20s12-11 12-20c0-6.627-5.373-12-12-12z" fill="#D4AF37"/>
          <circle cx="12" cy="12" r="4" fill="#000"/>
        </svg>
      </div>`,
      iconSize: [24, 32],
      iconAnchor: [12, 32]
    });

    L.marker([lat, lng], { icon: customIcon }).addTo(map);
    
    setTimeout(() => {
        map.invalidateSize();
    }, 400);

    return () => {
      map.remove();
    };
  }, [lat, lng, id]);

  return (
    <div className="mt-8 relative group">
       <div id={`map-${id}`} className="w-full h-48 rounded-[2rem] border border-rk-gold/10 grayscale-[0.6] hover:grayscale-0 transition-all duration-700 shadow-inner overflow-hidden" />
       <div className="absolute top-4 left-4 glass-card px-4 py-2 rounded-full border-rk-gold/20 pointer-events-none">
          <p className="text-[8px] uppercase tracking-[0.2em] font-black text-rk-gold">Delivery Location</p>
       </div>
    </div>
  );
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState('All');
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<{ ids: string[]; label: string } | null>(null);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const CONFIRM_PHRASE = "DELETE ORDERS";

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    setUpdatingOrderId(`${id}-${status}`);
    const token = localStorage.getItem('admin_token');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      
      if (!res.ok) throw new Error('Failed to update status');
      
      fetchOrders();
      if (selectedOrder?._id === id) {
        setSelectedOrder({ ...selectedOrder, status: status as any });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const filteredOrders = orders.filter(o => 
    (o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || o.orderId.toLowerCase().includes(searchTerm.toLowerCase())) && 
    (filterStatus === 'All' || o.status === filterStatus)
  );

  const allFilteredSelected = filteredOrders.length > 0 && filteredOrders.every(o => selectedIds.has(o._id));

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedIds(prev => {
        const next = new Set(prev);
        filteredOrders.forEach(o => next.delete(o._id));
        return next;
      });
    } else {
      setSelectedIds(prev => {
        const next = new Set(prev);
        filteredOrders.forEach(o => next.add(o._id));
        return next;
      });
    }
  };

  const confirmDelete = (ids: string[], label: string) => {
    setDeleteTarget({ ids, label });
    setConfirmText("");
  };

  const executeDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const token = localStorage.getItem('admin_token');
    try {
      if (deleteTarget.ids.length === 1) {
        await fetch(`${import.meta.env.VITE_API_URL}/api/orders/${deleteTarget.ids[0]}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } else {
        await fetch(`${import.meta.env.VITE_API_URL}/api/orders/bulk`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ ids: deleteTarget.ids })
        });
      }
      setSelectedIds(new Set());
      setDeleteTarget(null);
      setConfirmText("");
      if (selectedOrder && deleteTarget.ids.includes(selectedOrder._id)) setSelectedOrder(null);
      fetchOrders();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'text-amber-500 border-amber-500/20 bg-amber-500/5';
      case 'PROCESSING': return 'text-blue-500 border-blue-500/20 bg-blue-500/5';
      case 'SHIPPED': return 'text-purple-500 border-purple-500/20 bg-purple-500/5';
      case 'DELIVERED': return 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5';
      case 'CANCELLED': return 'text-red-500 border-red-500/20 bg-red-500/5';
      default: return 'text-white border-white/10';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
  };

  const openInMaps = (lat: number, lng: number) => {
    // Opens in Google Maps app on mobile, falls back to web
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-12 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 border-b border-rk-gold/10 pb-12">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="max-w-2xl"
        >
          <div className="flex items-center gap-4 mb-4">
            <ShoppingCart size={18} className="text-rk-gold" />
            <span className="text-rk-gold text-[10px] uppercase tracking-[0.5em] font-black">Orders List</span>
          </div>
          <h1 className="text-5xl font-display uppercase tracking-[0.1em] text-white font-black mb-4 flex items-center gap-6">Merchant <span className="gold-gradient-text italic font-medium lowercase font-cormorant text-[3.5rem] tracking-normal">Activity</span></h1>
          <p className="text-[#6A6A6A] text-[10px] uppercase tracking-[0.25em] font-bold leading-none">Track and manage all customer orders.</p>
        </motion.div>
      </header>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-4 items-center uppercase text-[10px] tracking-widest font-black">
        <div className="flex-1 min-w-[220px] relative group">
          <Search size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#444] group-focus-within:text-rk-gold transition-colors" />
          <input 
            type="text" 
            placeholder="Search by Customer Name or Order ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="admin-input pl-12"
          />
        </div>
        
        <div className="glass-card flex items-center px-6 rounded-xl border-rk-gold/10 hover:border-rk-gold/30 transition-all cursor-pointer">
           <Filter size={14} className="text-rk-gold/60 mr-4" />
           <select 
             value={filterStatus}
             onChange={(e) => setFilterStatus(e.target.value)}
             className="bg-transparent text-[10px] uppercase tracking-widest font-black py-4 outline-none appearance-none pr-8 cursor-pointer text-[#888] select-none"
           >
              <option value="All" className="bg-[#0A0A0A]">All Orders</option>
              <option value="PENDING" className="bg-[#0A0A0A]">Pending</option>
              <option value="PROCESSING" className="bg-[#0A0A0A]">Processing</option>
              <option value="SHIPPED" className="bg-[#0A0A0A]">Shipped</option>
              <option value="DELIVERED" className="bg-[#0A0A0A]">Delivered</option>
              <option value="CANCELLED" className="bg-[#0A0A0A]">Cancelled</option>
           </select>
        </div>

        <AnimatePresence>
          {selectedIds.size > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={() => confirmDelete(Array.from(selectedIds), `${selectedIds.size} selected order${selectedIds.size > 1 ? 's' : ''}`)}
              className="flex items-center gap-3 px-6 py-4 rounded-xl border border-red-500/30 text-red-500 bg-red-500/5 hover:bg-red-500/10 transition-all"
            >
              <Trash2 size={13} />
              Delete {selectedIds.size} selected
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <div className="glass-card rounded-[32px] overflow-hidden border-[#D4AF37]/10 shadow-4xl shadow-black/80">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
             <thead>
                <tr className="border-b border-rk-gold/5 bg-rk-gold/[0.02]">
                   <th className="px-6 py-8">
                     <button onClick={toggleSelectAll} className="text-[#444] hover:text-rk-gold transition-colors">
                       {allFilteredSelected ? <CheckSquare size={15} className="text-rk-gold" /> : <Square size={15} />}
                     </button>
                   </th>
                   <th className="px-6 py-8 text-[9px] uppercase tracking-[0.4em] text-rk-gold font-black">Order ID</th>
                   <th className="px-6 py-8 text-[9px] uppercase tracking-[0.4em] text-[#666] font-black">Customer</th>
                   <th className="px-6 py-8 text-[9px] uppercase tracking-[0.4em] text-[#666] font-black">Date</th>
                   <th className="px-6 py-8 text-[9px] uppercase tracking-[0.4em] text-[#666] font-black">Amount</th>
                   <th className="px-6 py-8 text-[9px] uppercase tracking-[0.4em] text-[#666] font-black text-center">Status</th>
                   <th className="px-6 py-8"></th>
                </tr>
             </thead>
             <tbody className="divide-y divide-rk-gold/5">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-10 py-24 text-center">
                       <p className="text-[10px] uppercase tracking-[0.5em] text-gray-700 font-black">No orders found</p>
                    </td>
                  </tr>
                ) : filteredOrders.map((order) => (
                  <tr key={order._id} className={clsx("group transition-colors duration-500", selectedIds.has(order._id) ? "bg-red-500/[0.03]" : "hover:bg-rk-gold/[0.03]")}>
                     <td className="px-6 py-8">
                       <button onClick={() => toggleSelect(order._id)} className="text-[#444] hover:text-rk-gold transition-colors">
                         {selectedIds.has(order._id) ? <CheckSquare size={15} className="text-red-400" /> : <Square size={15} />}
                       </button>
                     </td>
                     <td className="px-6 py-8">
                        <span className="text-rk-gold font-mono font-bold tracking-widest text-[11px] bg-rk-gold/5 border border-rk-gold/20 px-4 py-2 rounded-lg">{order.orderId}</span>
                     </td>
                     <td className="px-6 py-8">
                        <p className="text-sm font-display text-white font-bold uppercase tracking-widest">{order.customerName}</p>
                        <p className="text-[9px] uppercase tracking-widest text-[#555] font-black mt-2 font-mono">{order.customerEmail}</p>
                     </td>
                     <td className="px-6 py-8">
                        <p className="text-[10px] uppercase tracking-widest text-[#555] font-black">{new Date(order.createdAt).toLocaleDateString('en-GB')} <br/><span className="text-[8px] opacity-40">{new Date(order.createdAt).toLocaleTimeString()}</span></p>
                     </td>
                     <td className="px-6 py-8">
                        <span className="text-rk-gold font-mono font-black text-sm">₹{order.totalAmount.toLocaleString()}</span>
                     </td>
                     <td className="px-6 py-8 text-center">
                        <span className={clsx(
                           "inline-block px-4 py-2 rounded-full text-[8px] uppercase tracking-[0.25em] font-black border transition-all duration-500",
                           getStatusColor(order.status)
                        )}>
                           {order.status}
                        </span>
                     </td>
                     <td className="px-6 py-8 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => setSelectedOrder(order)}
                            className="w-10 h-10 rounded-xl border border-rk-gold/5 text-[#333] group-hover:text-rk-gold group-hover:border-rk-gold/30 hover:bg-rk-gold/[0.05] transition-all flex items-center justify-center"
                          >
                             <Eye size={14} />
                          </button>
                          <button 
                            onClick={() => confirmDelete([order._id], `order ${order.orderId}`)}
                            className="w-10 h-10 rounded-xl border border-red-500/10 text-[#333] hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/5 transition-all flex items-center justify-center"
                          >
                             <Trash2 size={14} />
                          </button>
                        </div>
                     </td>
                  </tr>
                ))}
             </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !deleting && setDeleteTarget(null)}
              className="fixed inset-0 bg-black/90 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md glass-card rounded-[32px] p-10 border border-red-500/20 shadow-[0_40px_100px_rgba(0,0,0,0.8)]"
            >
              {/* Warning icon */}
              <div className="flex justify-center mb-8">
                <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <AlertTriangle size={28} className="text-red-500" />
                </div>
              </div>

              <h3 className="text-center text-xl font-display uppercase tracking-widest text-white font-black mb-3">Permanent Deletion</h3>
              <p className="text-center text-[9px] uppercase tracking-[0.3em] text-red-400/80 font-black mb-8">
                You are about to delete {deleteTarget.label}
              </p>

              {/* Warning box */}
              <div className="bg-red-500/5 border border-red-500/15 rounded-2xl p-6 mb-8 space-y-2">
                <div className="flex items-start gap-3">
                  <XCircle size={13} className="text-red-400 mt-0.5 shrink-0" />
                  <p className="text-[9px] uppercase tracking-widest text-red-400/70 font-black leading-relaxed">This action is irreversible. Orders will be permanently removed from the database and will no longer be visible to customers.</p>
                </div>
                <div className="flex items-start gap-3">
                  <XCircle size={13} className="text-red-400 mt-0.5 shrink-0" />
                  <p className="text-[9px] uppercase tracking-widest text-red-400/70 font-black leading-relaxed">Order history, customer records, and all associated data will be lost.</p>
                </div>
              </div>

              {/* Confirm text input */}
              <div className="space-y-3 mb-8">
                <p className="text-[9px] uppercase tracking-[0.3em] text-[#555] font-black">
                  Type <span className="text-red-400 font-mono">DELETE ORDERS</span> to confirm
                </p>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="DELETE ORDERS"
                  className="w-full bg-white/[0.03] border border-white/10 focus:border-red-500/40 rounded-xl px-5 py-4 text-[11px] font-mono font-black uppercase tracking-widest text-white outline-none transition-colors placeholder:text-white/10"
                  autoFocus
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { setDeleteTarget(null); setConfirmText(""); }}
                  disabled={deleting}
                  className="flex-1 py-4 rounded-xl border border-white/10 text-[9px] uppercase tracking-widest font-black text-[#555] hover:text-white hover:border-white/20 transition-all disabled:opacity-40"
                >
                  Cancel
                </button>
                <button
                  onClick={executeDelete}
                  disabled={confirmText !== CONFIRM_PHRASE || deleting}
                  className="flex-1 py-4 rounded-xl border border-red-500/30 bg-red-500/10 text-[9px] uppercase tracking-widest font-black text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {deleting ? <><Loader2 size={12} className="animate-spin" /> Deleting...</> : <><Trash2 size={12} /> Confirm Delete</>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-6 sm:p-12 overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="fixed inset-0 bg-[#050505]/95 backdrop-blur-xl"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative w-full max-w-5xl glass-card rounded-[40px] shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
            >
               {/* Left Section: Status & Logistics */}
               <div className="w-full md:w-[400px] border-r border-rk-gold/10 p-12 overflow-y-auto bg-black/60 custom-scrollbar">
                  <header className="mb-14 border-b border-rk-gold/10 pb-10 text-center">
                     <p className="text-[10px] uppercase tracking-[0.5em] text-rk-gold font-black mb-4">Order ID</p>
                     <p className="text-3xl font-mono font-black gold-gradient-text tracking-widest">{selectedOrder.orderId}</p>
                  </header>

                  <div className="space-y-12">
                     <section>
                        <h4 className="text-[10px] uppercase tracking-[0.4em] text-[#666] font-black mb-6 px-1">Order Status</h4>
                        <div className="space-y-4">
                            {['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'].map((status) => (
                              <button 
                                key={status}
                                onClick={() => updateStatus(selectedOrder._id, status)}
                                disabled={!!updatingOrderId}
                                className={clsx(
                                  "w-full flex items-center justify-between px-6 py-5 rounded-2xl border transition-all duration-500 disabled:opacity-50",
                                  selectedOrder.status === status 
                                    ? "bg-rk-gold/5 border-rk-gold/40 text-rk-gold shadow-[0_10px_20px_rgba(212,175,55,0.05)]" 
                                    : "border-[#111] text-[#222] hover:border-rk-gold/20"
                                )}
                              >
                                 <div className="flex items-center gap-4">
                                    {updatingOrderId === `${selectedOrder._id}-${status}` ? (
                                      <Loader2 size={14} className="animate-spin text-rk-gold" />
                                    ) : (
                                      <>
                                        {status === 'PENDING' && <Package size={14} />}
                                        {status === 'PROCESSING' && <CheckCircle size={14} />}
                                        {status === 'SHIPPED' && <Truck size={14} />}
                                        {status === 'DELIVERED' && <ShoppingCart size={14} />}
                                      </>
                                    )}
                                    <span className="text-[9px] uppercase tracking-widest font-black">
                                       {updatingOrderId === `${selectedOrder._id}-${status}` ? "Updating..." : status}
                                    </span>
                                 </div>
                                 {selectedOrder.status === status && <div className="w-2 h-2 rounded-full bg-rk-gold shadow-[0_0_8px_#D4AF37]" />}
                              </button>
                            ))}
                        </div>
                        
                        {/* Cancel Order Button — always visible */}
                        <button 
                          onClick={() => updateStatus(selectedOrder._id, 'CANCELLED')}
                          disabled={!!updatingOrderId || selectedOrder.status === 'CANCELLED'}
                          className="w-full mt-6 flex items-center justify-center gap-3 px-6 py-5 rounded-2xl border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-all duration-500 disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-red-500/5 group"
                        >
                          {updatingOrderId === `${selectedOrder._id}-CANCELLED` ? (
                            <>
                              <Loader2 size={14} className="animate-spin" />
                              <span className="text-[9px] uppercase tracking-widest font-black">Cancelling...</span>
                            </>
                          ) : (
                            <>
                              <XCircle size={14} className="group-hover:rotate-90 transition-transform duration-500" />
                              <span className="text-[9px] uppercase tracking-widest font-black">
                                {selectedOrder.status === 'CANCELLED' ? 'Already Cancelled' : 'Cancel Order'}
                              </span>
                            </>
                          )}
                        </button>
                        
                        {/* Cancelled Status Display */}
                        {selectedOrder.status === 'CANCELLED' && (
                          <div className="mt-6 p-6 rounded-2xl border border-red-500/10 bg-red-500/5">
                            <div className="flex items-center gap-3 mb-3">
                              <XCircle size={16} className="text-red-500" />
                              <span className="text-[10px] uppercase tracking-widest font-black text-red-500">Order Cancelled</span>
                            </div>
                            <div className="flex items-start gap-2 text-red-400/80">
                              <AlertTriangle size={12} className="mt-0.5 shrink-0" />
                              <p className="text-[9px] leading-relaxed uppercase tracking-widest font-bold">Refund will be processed automatically</p>
                            </div>
                          </div>
                        )}
                     </section>

                     <section className="bg-rk-gold/[0.03] border border-rk-gold/5 rounded-3xl p-8 space-y-6">
                        <h4 className="text-[10px] uppercase tracking-[0.4em] text-[#444] font-black">Customer Info</h4>
                        <div className="space-y-4">
                           {/* Email */}
                           <div className="flex items-center justify-between gap-3 group/row">
                              <div className="flex items-center gap-3 min-w-0">
                                 <Mail size={13} className="text-rk-gold/40 shrink-0" />
                                 <span className="text-[11px] font-mono text-white/70 truncate lowercase">{selectedOrder.customerEmail}</span>
                              </div>
                              <button onClick={() => copyToClipboard(selectedOrder.customerEmail)}
                                className="opacity-0 group-hover/row:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-white/5 text-[#555] hover:text-rk-gold">
                                 <Copy size={11} />
                              </button>
                           </div>
                           {/* Phone */}
                           <div className="flex items-center justify-between gap-3 group/row">
                              <div className="flex items-center gap-3">
                                 <Phone size={13} className="text-rk-gold/40 shrink-0" />
                                 <span className="text-[12px] font-mono font-bold text-white/70">{selectedOrder.customerPhone}</span>
                              </div>
                              <button onClick={() => copyToClipboard(selectedOrder.customerPhone)}
                                className="opacity-0 group-hover/row:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-white/5 text-[#555] hover:text-rk-gold">
                                 <Copy size={11} />
                              </button>
                           </div>
                           {/* Address */}
                           <div className="flex items-start gap-3">
                              <MapPin size={13} className="text-rk-gold/40 shrink-0 mt-0.5" />
                              <span className="text-[10px] text-white/50 font-black uppercase tracking-widest leading-relaxed">{selectedOrder.address}</span>
                           </div>
                        </div>

                        {/* Maps button */}
                        {selectedOrder.latitude && selectedOrder.longitude && (
                          <button
                            onClick={() => openInMaps(selectedOrder.latitude!, selectedOrder.longitude!)}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-rk-gold/20 text-rk-gold/70 hover:text-rk-gold hover:bg-rk-gold/5 hover:border-rk-gold/40 transition-all text-[9px] uppercase tracking-[0.3em] font-black"
                          >
                            <ExternalLink size={12} /> Open in Google Maps
                          </button>
                        )}

                        {selectedOrder.latitude && selectedOrder.longitude && (
                           <OrderMap 
                             lat={selectedOrder.latitude} 
                             lng={selectedOrder.longitude} 
                             id={selectedOrder._id} 
                           />
                        )}
                     </section>
                  </div>
               </div>

               {/* Right Section: Order Items */}
               <div className="flex-1 p-12 md:p-16 overflow-y-auto custom-scrollbar">
                  <header className="flex justify-between items-start mb-16 border-b border-rk-gold/10 pb-10">
                     <div>
                        <h3 className="text-xl font-display uppercase tracking-widest text-[#F5F5F5] font-black mb-3 italic">Order <span className="gold-gradient-text tracking-normal">Items</span></h3>
                        <p className="text-[9px] uppercase tracking-[0.4em] text-[#333] font-black">Items included in this order</p>
                     </div>
                     <button onClick={() => setSelectedOrder(null)} className="w-12 h-12 rounded-full glass-card border-white/5 flex items-center justify-center text-white/20 hover:text-white transition-all hover:bg-white/10">
                        <X size={20} />
                     </button>
                  </header>

                  <div className="space-y-12 mb-16 px-2">
                     {selectedOrder.items.map((item, idx) => (
                       <div key={idx} className="flex gap-10 group items-center pt-10 first:pt-0 relative">
                          <div className="relative w-28 h-28 overflow-hidden rounded-2xl border border-rk-gold/10 bg-black/40 shadow-2xl">
                             <img src={item.image} alt={item.name} className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000" />
                             <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                          </div>
                          
                          <div className="flex-1">
                             <div className="flex justify-between items-start">
                                <div>
                                   <p className="text-[9px] uppercase tracking-[0.5em] text-rk-gold font-black mb-2 italic">Product Ref: RKP-{item.productId.slice(-8).toUpperCase()}</p>
                                   <h4 className="text-xl font-display uppercase tracking-widest text-white mb-2 leading-tight">{item.name}</h4>
                                </div>
                                <div className="text-right">
                                   <p className="text-rk-gold font-mono font-black text-xl">₹{item.price.toLocaleString()}</p>
                                   <div className="mt-2 py-1 px-3 bg-white/5 rounded-lg border border-white/5 inline-block">
                                      <p className="text-[9px] uppercase tracking-widest text-[#666] font-black">Qty: {item.quantity}</p>
                                   </div>
                                </div>
                             </div>
                          </div>
                          <div className="absolute -bottom-6 left-0 right-0 h-px bg-rk-gold/5 group-last:hidden" />
                       </div>
                     ))}
                  </div>

                  <div className="glass-card rounded-[32px] p-10 bg-white/[0.01] border-rk-gold/20 shadow-[0_30px_80px_rgba(0,0,0,0.5)] border-dashed space-y-4">
                     <p className="text-[9px] uppercase tracking-[0.5em] text-[#444] font-black mb-6">Bill Breakdown</p>

                     {/* Items subtotal */}
                     <div className="space-y-2">
                       {selectedOrder.items.map((item, i) => (
                         <div key={i} className="flex justify-between text-[10px] text-white/40 font-black uppercase tracking-widest">
                           <span className="truncate max-w-[60%]">{item.name} × {item.quantity}</span>
                           <span className="font-mono">₹{(item.price * item.quantity).toLocaleString()}</span>
                         </div>
                       ))}
                     </div>

                     <div className="h-px bg-white/5 my-2" />

                     {/* Subtotal */}
                     <div className="flex justify-between text-[10px] uppercase tracking-widest font-black text-white/50">
                       <span>Subtotal</span>
                       <span className="font-mono">₹{(selectedOrder.subtotal ?? selectedOrder.items.reduce((s, i) => s + i.price * i.quantity, 0)).toLocaleString()}</span>
                     </div>

                     {/* Charges */}
                     {selectedOrder.charges?.map((c, i) => (
                       <div key={i} className="flex justify-between text-[10px] uppercase tracking-widest font-black text-white/40">
                         <span>{c.name}{c.type === 'percentage' ? ` (${c.value}%)` : ''}</span>
                         <span className="font-mono">+₹{c.amount.toLocaleString()}</span>
                       </div>
                     ))}

                     {/* Coupon */}
                     {selectedOrder.couponCode && (selectedOrder.couponDiscount ?? 0) > 0 && (
                       <div className="flex justify-between text-[10px] uppercase tracking-widest font-black text-emerald-400">
                         <span className="flex items-center gap-1.5"><Tag size={10} /> {selectedOrder.couponCode}</span>
                         <span className="font-mono">-₹{(selectedOrder.couponDiscount ?? 0).toLocaleString()}</span>
                       </div>
                     )}

                     <div className="h-px bg-rk-gold/20 my-2" />

                     {/* Grand total */}
                     <div className="flex justify-between items-center">
                        <span className="text-[10px] uppercase tracking-[0.6em] text-[#666] font-black">Grand Total</span>
                        <span className="text-3xl font-mono font-black text-rk-gold tracking-tighter">₹{selectedOrder.totalAmount.toLocaleString()}</span>
                     </div>

                     <div className="flex items-center gap-4 justify-center pt-4">
                        <div className="h-px bg-rk-gold/20 flex-1" />
                        <p className="text-[8px] uppercase tracking-[0.8em] text-rk-gold font-black whitespace-nowrap">Order Confirmed</p>
                        <div className="h-px bg-rk-gold/20 flex-1" />
                     </div>

                     {/* Payment Screenshot */}
                     {(selectedOrder as any).paymentScreenshot && (
                       <div className="mt-4 space-y-3">
                         <p className="text-[9px] uppercase tracking-[0.4em] text-[#444] font-black">Payment Screenshot</p>
                         <a href={(selectedOrder as any).paymentScreenshot} target="_blank" rel="noopener noreferrer"
                           className="block rounded-2xl overflow-hidden border border-rk-gold/20 hover:border-rk-gold/50 transition-all group">
                           <img src={(selectedOrder as any).paymentScreenshot} alt="Payment proof"
                             className="w-full object-contain max-h-64 bg-black/40 group-hover:opacity-90 transition-opacity" />
                           <div className="py-2 text-center bg-rk-gold/5 border-t border-rk-gold/10">
                             <p className="text-[8px] uppercase tracking-widest text-rk-gold font-black">Click to view full size</p>
                           </div>
                         </a>
                       </div>
                     )}
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
