import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRoute, Link } from "wouter";
import {
  Package, ChevronRight, Clock, MapPin, Phone, Mail,
  User, ShoppingCart, CheckCircle2, Truck, PackageCheck, Circle, XCircle, AlertTriangle, CreditCard
} from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { GoldenBackground } from "@/components/GoldenBackground";

const fadeInUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

const STATUS_STEPS = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"];
const STATUS_SHORT = ["Placed", "Process", "Shipped", "Done"];

const statusIcon = (s: string) => {
  if (s === "DELIVERED") return CheckCircle2;
  if (s === "SHIPPED") return Truck;
  if (s === "PROCESSING") return Package;
  return Circle;
};

export default function OrderDetail() {
  const [, params] = useRoute("/orders/:id");
  const { getOrder } = useStore();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params?.id) return;
    getOrder(params.id)
      .then(setOrder)
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [params?.id]);

  const currentStep = order ? STATUS_STEPS.indexOf(order.status) : 0;

  return (
    <div className="min-h-screen pt-28 pb-24 bg-[#050505] relative overflow-hidden">
      <GoldenBackground />
      <div className="container mx-auto px-6 max-w-5xl relative z-10">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#555] mb-10">
          <Link href="/orders" className="hover:text-[#D4AF37] transition-colors">Orders</Link>
          <ChevronRight size={12} className="text-[#D4AF37]" />
          <span className="text-[#D4AF37] font-black">{order?.orderId || "..."}</span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-6">
            <div className="w-16 h-16 border-t-2 border-[#D4AF37] rounded-full animate-spin" />
            <span className="text-[#D4AF37] text-[10px] uppercase tracking-[0.5em] font-black animate-pulse">Loading Order...</span>
          </div>
        ) : !order ? (
          <div className="glass-card rounded-[3rem] p-24 text-center border-white/5">
            <Package size={48} className="text-[#333] mx-auto mb-8" />
            <h3 className="text-3xl font-display text-white uppercase tracking-widest mb-4">Order Not Found</h3>
            <Link href="/orders" className="gold-gradient text-black px-12 py-4 rounded-full font-black uppercase tracking-[0.3em] text-[10px] mt-8 inline-block">
              Back to Orders
            </Link>
          </div>
        ) : (
          <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-8">

            {/* Header */}
            <motion.div variants={fadeInUp} className="glass-card rounded-[2.5rem] border-[#D4AF37]/10 p-8 md:p-12">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <p className="text-[10px] text-[#555] uppercase tracking-[0.4em] font-black mb-2">Order Reference</p>
                  <h1 className="text-3xl md:text-4xl font-mono font-black gold-gradient-text tracking-widest">{order.orderId}</h1>
                  <p className="text-[#555] text-[11px] mt-2 flex items-center gap-2">
                    <Clock size={12} className="text-[#D4AF37]/60" />
                    {new Date(order.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <div className="flex items-center gap-3 bg-[#D4AF37]/5 border border-[#D4AF37]/20 px-8 py-4 rounded-full self-start md:self-auto">
                  <div className={`w-2 h-2 rounded-full ${order.status === "DELIVERED" ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-[#D4AF37] animate-pulse shadow-[0_0_8px_#D4AF37]"}`} />
                  <span className="text-[10px] uppercase tracking-[0.3em] font-black text-[#D4AF37]">{order.status}</span>
                </div>
              </div>
            </motion.div>
            
            {/* Payment Proof Reminder */}
            {order.paymentStatus !== "PAID" && order.status !== "CANCELLED" && (
              <motion.div variants={fadeInUp} className="glass-card rounded-[2rem] border-[#D4AF37]/30 bg-[#D4AF37]/5 p-8 flex flex-col md:flex-row items-center gap-6 shadow-2xl">
                <div className="w-16 h-16 rounded-full bg-[#D4AF37]/10 flex items-center justify-center shrink-0 border border-[#D4AF37]/20">
                  <CreditCard size={28} className="text-[#D4AF37]" strokeWidth={1.5} />
                </div>
                <div className="flex-1 text-center md:text-left space-y-1">
                  <h4 className="text-[10px] text-[#D4AF37] uppercase tracking-[0.4em] font-black italic">Payment Confirmation Required</h4>
                  <p className="text-white/80 text-sm font-medium leading-relaxed">
                    Please send the payment screenshot to our official WhatsApp with your Order ID <span className="text-[#D4AF37] font-black">{order.orderId}</span> to confirm your purchase.
                  </p>
                </div>
                <a 
                  href={`https://wa.me/917370809639?text=Hello, I've made the payment for Order ${order.orderId}. Here is the screenshot.`}
                  target="_blank"
                  className="px-8 py-4 rounded-full bg-[#D4AF37] text-black text-[10px] uppercase font-black tracking-[0.3em] shadow-xl hover:scale-105 active:scale-95 transition-all whitespace-nowrap"
                >
                  Send Screenshot
                </a>
              </motion.div>
            )}

            {/* Status Timeline */}
            <motion.div variants={fadeInUp} className="glass-card rounded-[2.5rem] border-[#D4AF37]/10 p-4 sm:p-8 md:p-12">
              {order.status === 'CANCELLED' ? (
                /* Cancelled Order Display */
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/10 border-2 border-red-500/20 mb-6">
                    <XCircle size={40} className="text-red-500" />
                  </div>
                  <h3 className="text-2xl font-display uppercase tracking-widest text-red-500 mb-4 font-black">Order Cancelled</h3>
                  <div className="max-w-md mx-auto bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
                    <div className="flex items-start gap-3 text-red-400/90">
                      <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                      <p className="text-sm leading-relaxed text-left">
                        This order has been cancelled. Your refund will be processed and credited to your original payment method within 24 hours.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Normal Progress Bar */
                <>
                  <div className="flex items-center gap-6 mb-10 justify-center">
                    <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#D4AF37]/40"></div>
                    <h3 className="font-display uppercase tracking-[0.4em] text-xs text-[#D4AF37] font-black text-center">Order Status</h3>
                    <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#D4AF37]/40"></div>
                  </div>
                  
                  <div className="relative mb-12 max-w-2xl mx-auto px-2">
                    {/* Progress Line — always visible */}
                    <div className="absolute top-5 sm:top-7 left-0 right-0 h-[1px] bg-white/5"></div>
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(Math.max(0, currentStep) / (STATUS_STEPS.length - 1)) * 100}%` }}
                      transition={{ duration: 1.5, ease: "circOut", delay: 0.5 }}
                      className="absolute top-5 sm:top-7 left-0 h-[1px] gold-gradient shadow-[0_0_15px_#D4AF37]"
                    ></motion.div>

                    <div className="flex flex-row justify-between relative z-10">
                      {STATUS_STEPS.map((step, i) => {
                        const Icon = statusIcon(step);
                        const isCompleted = i <= currentStep;
                        const isCurrent = i === currentStep;
                        
                        return (
                          <div key={step} className="flex flex-col items-center gap-2 flex-1 min-w-0">
                            <motion.div 
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: 0.5 + (i * 0.15), type: "spring", stiffness: 100 }}
                              className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-1000 shrink-0 relative z-20
                                ${isCompleted 
                                  ? 'gold-gradient text-black shadow-[0_0_20px_rgba(212,175,55,0.3)] saturate-150' 
                                  : 'bg-black/40 border border-white/5 text-[#444] backdrop-blur-xl'}
                              `}
                            >
                              {isCurrent && (
                                <div className="absolute inset-[-4px] rounded-full border border-[#D4AF37]/40 animate-[ping_2s_infinite]"></div>
                              )}
                              <Icon size={14} className="sm:size-5" strokeWidth={isCompleted ? 2.5 : 1.5} />
                            </motion.div>
                            
                            <div className="text-center w-full px-0.5">
                              <h4 className={`text-[8px] sm:text-[9px] uppercase tracking-[0.1em] sm:tracking-[0.2em] font-black mb-1 transition-all duration-700 truncate leading-tight ${isCompleted ? 'text-white' : 'text-[#444]'}`}>
                                <span className="hidden sm:inline">{step}</span>
                                <span className="sm:hidden">{STATUS_SHORT[i]}</span>
                              </h4>
                              {isCurrent && (
                                <motion.span 
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  className="gold-gradient-text text-[7px] uppercase tracking-[0.1em] font-black block"
                                >
                                  Active
                                </motion.span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Items */}
              <motion.div variants={fadeInUp} className="glass-card rounded-[2.5rem] border-[#D4AF37]/10 p-8">
                <p className="text-[10px] text-[#D4AF37] uppercase tracking-[0.4em] font-black mb-6 flex items-center gap-2">
                  <ShoppingCart size={12} /> Items Ordered
                </p>
                <div className="space-y-4">
                  {order.items.map((item: any, i: number) => (
                    <div key={i} className="flex items-center gap-4 border-b border-white/5 pb-4 last:border-0 last:pb-0">
                      <div className="w-14 h-14 rounded-xl overflow-hidden border border-white/5 shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[#F5F5F5] text-xs font-bold uppercase tracking-widest truncate">{item.name}</p>
                        <p className="text-[#555] text-[10px] mt-0.5">{item.quantity} × ₹{item.price.toLocaleString()}</p>
                      </div>
                      <p className="text-[#D4AF37] text-sm font-black shrink-0">₹{(item.quantity * item.price).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t border-white/5">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] uppercase tracking-widest text-[#555] font-black">Total</span>
                    <span className="text-2xl font-mono font-black gold-gradient-text">₹{order.totalAmount?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] uppercase tracking-widest text-[#555] font-black">Payment</span>
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[8px] uppercase font-black tracking-widest ${order.paymentStatus === "PAID" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
                      <PackageCheck size={9} /> {order.paymentStatus}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Customer & Delivery */}
              <motion.div variants={fadeInUp} className="glass-card rounded-[2.5rem] border-[#D4AF37]/10 p-8 space-y-6">
                <p className="text-[10px] text-[#D4AF37] uppercase tracking-[0.4em] font-black flex items-center gap-2">
                  <User size={12} /> Customer Details
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User size={14} className="text-[#D4AF37]/60 shrink-0" />
                    <span className="text-[#F5F5F5] text-sm tracking-wide">{order.customerName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail size={14} className="text-[#D4AF37]/60 shrink-0" />
                    <span className="text-[#555] text-sm tracking-wide">{order.customerEmail}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone size={14} className="text-[#D4AF37]/60 shrink-0" />
                    <span className="text-[#555] text-sm tracking-wide">{order.customerPhone}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin size={14} className="text-[#D4AF37]/60 shrink-0 mt-0.5" />
                    <span className="text-[#555] text-sm tracking-wide leading-relaxed">{order.address}</span>
                  </div>
                </div>
              </motion.div>
            </div>

            <motion.div variants={fadeInUp} className="flex justify-center">
              <Link href="/orders" className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#555] hover:text-[#D4AF37] transition-colors font-black">
                <ChevronRight size={12} className="rotate-180" /> Back to All Orders
              </Link>
            </motion.div>

          </motion.div>
        )}
      </div>
    </div>
  );
}
