import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, ChevronRight, Search, ShoppingBag } from "lucide-react";
import { Link } from "wouter";
import { useStore } from "@/context/StoreContext";
import { GoldenBackground } from "@/components/GoldenBackground";

const fadeInUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

export default function MyOrders() {
  const { user, getUserOrders } = useStore();
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (user?.email) {
        setIsLoading(true);
        try {
          const data = await getUserOrders(user.email);
          setUserOrders(data);
        } catch (err) {
          console.error("Failed to fetch orders:", err);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, [user, getUserOrders]);

  return (
    <div className="min-h-screen pt-32 pb-24 bg-[#050505] relative overflow-hidden">
      <GoldenBackground />
      
      <div className="container mx-auto px-6 max-w-5xl relative z-10">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="space-y-16"
        >
          <motion.div variants={fadeInUp} className="text-center md:text-left">
            <div className="flex items-center gap-4 mb-6 justify-center md:justify-start">
              <div className="w-12 h-[0.5px] gold-gradient"></div>
              <span className="text-[#D4AF37] uppercase tracking-[0.6em] text-[10px] font-black italic">Order History</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-display text-white uppercase tracking-tight mb-8 leading-none">
              Your <span className="gold-gradient-text italic font-medium font-cormorant lowercase tracking-normal">Orders</span>
            </h1>
            <p className="text-[#888] font-light leading-relaxed max-w-xl italic text-lg opacity-80">
              A history of all your orders with us.
            </p>
          </motion.div>

          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-40 gap-6"
              >
                <div className="w-16 h-16 border-t-2 border-[#D4AF37] rounded-full animate-spin"></div>
                <span className="text-[#D4AF37] text-[10px] uppercase tracking-[0.5em] font-black animate-pulse">Loading Orders...</span>
              </motion.div>
            ) : userOrders.length === 0 ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card rounded-[3rem] p-24 text-center border-white/5"
              >
                <ShoppingBag size={48} className="text-[#333] mx-auto mb-8" />
                <h3 className="text-3xl font-display text-white uppercase tracking-widest mb-6">No Orders Found</h3>
                <p className="text-[#555] text-sm italic mb-12 max-w-sm mx-auto leading-relaxed">
                  You haven't placed any orders yet. Explore our collection to find something you love.
                </p>
                <Link 
                  href="/shop"
                  className="gold-gradient text-black px-16 py-5 rounded-full font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl hover:scale-110 active:scale-95 transition-all"
                >
                  Discover Collection
                </Link>
              </motion.div>
            ) : (
              <motion.div 
                key="list"
                variants={fadeInUp}
                className="space-y-5"
              >
                {userOrders.map((order) => {
                  const imgs = (order.items || []).map((i: any) => i.image).filter(Boolean);
                  const firstImg = imgs[0];
                  const isCancelled = order.status?.toUpperCase() === 'CANCELLED';
                  const isDelivered = order.status?.toUpperCase() === 'DELIVERED';

                  const statusColor = isCancelled
                    ? 'text-red-400 border-red-500/20 bg-red-500/5'
                    : isDelivered
                    ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5'
                    : 'text-[#D4AF37] border-[#D4AF37]/20 bg-[#D4AF37]/5';

                  const dotColor = isCancelled
                    ? 'bg-red-500'
                    : isDelivered
                    ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]'
                    : 'bg-[#D4AF37] animate-pulse shadow-[0_0_8px_#D4AF37]';

                  return (
                    <Link key={order._id} href={`/orders/${order.orderId}`} className="group block">
                      <div className="glass-card rounded-2xl border-white/5 hover:border-[#D4AF37]/20 transition-all duration-500 hover:bg-white/[0.02] overflow-hidden shadow-xl">
                        <div className="flex items-center gap-5 p-5">

                          {/* Image */}
                          <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden shrink-0 border border-white/5 bg-white/5 relative">
                            {firstImg
                              ? <img src={firstImg} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                              : <div className="w-full h-full flex items-center justify-center"><Package size={24} className="text-[#333]" /></div>
                            }
                            {imgs.length > 1 && (
                              <div className="absolute bottom-1 right-1 bg-black/70 backdrop-blur-sm text-[#D4AF37] text-[9px] font-black px-1.5 py-0.5 rounded-md leading-none">
                                +{imgs.length - 1}
                              </div>
                            )}
                          </div>

                          {/* Main Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-[9px] text-[#555] uppercase tracking-[0.3em] font-black mb-1">Order ID</p>
                            <p className="text-sm md:text-base font-mono font-black text-[#D4AF37] tracking-wider truncate">{order.orderId}</p>
                            <div className="flex items-center gap-3 mt-2 flex-wrap">
                              <span className="text-[10px] text-[#555] font-medium">
                                {new Date(order.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                              <span className="text-[#333]">·</span>
                              <span className="text-sm font-mono font-black text-white">₹{order.totalAmount?.toLocaleString()}</span>
                            </div>
                          </div>

                          {/* Status + Arrow */}
                          <div className="flex items-center gap-3 shrink-0">
                            <span className={`hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full text-[9px] uppercase tracking-[0.2em] font-black border ${statusColor}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
                              {order.status}
                            </span>
                            <div className="w-9 h-9 rounded-full border border-white/5 flex items-center justify-center text-[#444] group-hover:text-[#D4AF37] group-hover:border-[#D4AF37]/20 transition-all">
                              <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                            </div>
                          </div>
                        </div>

                        {/* Mobile-only status bar */}
                        <div className={`sm:hidden px-5 pb-4`}>
                          <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] uppercase tracking-[0.2em] font-black border ${statusColor}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Track Prompt */}
          <motion.div variants={fadeInUp}>
            <Link href="/track" className="group flex items-center justify-between gap-4 border border-[#D4AF37]/20 hover:border-[#D4AF37]/50 bg-[#D4AF37]/[0.03] hover:bg-[#D4AF37]/[0.06] rounded-2xl px-6 py-4 transition-all duration-300">
              <div className="flex items-center gap-3">
                <Search size={15} className="text-[#D4AF37] shrink-0" />
                <span className="text-[#D4AF37] text-[11px] uppercase tracking-[0.3em] font-black">Track an order</span>
              </div>
              <ChevronRight size={15} className="text-[#D4AF37]/60 group-hover:translate-x-1 transition-transform shrink-0" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
