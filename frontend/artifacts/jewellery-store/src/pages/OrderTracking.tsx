import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Search, Package, Clock, Truck, Home, CheckCircle2, AlertCircle, Sparkles, MapPin, CreditCard, ShieldCheck, XCircle, AlertTriangle } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { motion, AnimatePresence } from "framer-motion";
import { GoldenBackground } from "@/components/GoldenBackground";

const fadeInUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

// Types for better safety and fixing lints
interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface Order {
  _id: string;
  orderId: string;
  createdAt: string;
  customerName: string;
  address: string;
  status: string;
  totalAmount: number;
  items: OrderItem[];
}

export default function OrderTracking() {
  const [searchInput, setSearchInput] = useState("");
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const { getOrder } = useStore();
  const [location] = useLocation();

  // Ephemeral State: No URL persistence for maximum privacy
  useEffect(() => {
    setOrderId("");
    setSearchInput("");
    setOrder(null);
  }, []);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;
      setIsLoading(true);
      setIsError(false);
      try {
        const data = await getOrder(orderId);
        setOrder(data);
      } catch (err) {
        setIsError(true);
        setOrder(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, getOrder]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setOrderId(searchInput.trim().toUpperCase());
    }
  };

  const steps = [
    { id: 'pending', label: 'Placed', shortLabel: 'Placed', icon: Package, message: "Your order has been placed and confirmed." },
    { id: 'processing', label: 'Processing', shortLabel: 'Process', icon: Clock, message: "We are preparing your order and checking for quality." },
    { id: 'shipped', label: 'Shipped', shortLabel: 'Shipped', icon: Truck, message: "Your order has been shipped and is on its way." },
    { id: 'delivered', label: 'Delivered', shortLabel: 'Done', icon: CheckCircle2, message: "Your order has been successfully delivered." },
  ];

  const getStepIndex = (status: string | undefined) => {
    if (!status) return -1;
    const statusMap: Record<string, string> = {
      'pending': 'pending',
      'processing': 'processing',
      'shipped': 'shipped',
      'delivered': 'delivered'
    };
    const mapped = statusMap[status.toLowerCase()] || 'pending';
    return steps.findIndex(s => s.id === mapped);
  };

  const currentStep = order ? getStepIndex(order.status) : -1;
  const currentStepData = currentStep >= 0 ? steps[currentStep] : steps[0];

  return (
    <div className="pt-40 pb-32 min-h-screen bg-[#050505] relative overflow-hidden selection:bg-[#D4AF37] selection:text-black">
      <GoldenBackground />
      
      {/* Decorative Ornaments */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#D4AF37]/20 to-transparent"></div>
      <div className="absolute top-40 -left-20 w-96 h-96 bg-[#D4AF37]/5 blur-[120px] rounded-full opacity-40"></div>
      <div className="absolute bottom-40 -right-20 w-96 h-96 bg-[#D4AF37]/5 blur-[120px] rounded-full opacity-40"></div>

      <div className="container mx-auto px-5 max-w-6xl relative z-10">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="text-center mb-16 lg:mb-24"
        >
          <motion.div variants={fadeInUp} className="flex items-center justify-center gap-4 mb-6">
            <div className="w-10 h-[0.5px] bg-[#D4AF37]/40"></div>
            <Sparkles size={14} className="text-[#D4AF37] animate-pulse" />
            <span className="text-[#D4AF37] uppercase tracking-[0.5em] text-[9px] font-black italic">Order Tracking</span>
            <div className="w-10 h-[0.5px] bg-[#D4AF37]/40"></div>
          </motion.div>
          <motion.h1 
            variants={fadeInUp} 
            className="text-4xl md:text-7xl font-display uppercase tracking-widest mb-6 text-white font-black leading-tight"
          >
            Track Your <br className="sm:hidden" />
            <span className="gold-gradient-text italic font-medium lowercase font-cormorant tracking-normal">Treasure</span>
          </motion.h1>
          <motion.p variants={fadeInUp} className="text-[#888] max-w-2xl mx-auto text-base lg:text-lg font-light leading-relaxed italic px-2">
            Track your order status and estimated delivery time.
          </motion.p>
        </motion.div>

        {/* Cinematic Search Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="max-w-3xl mx-auto mb-20 md:mb-24 relative"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-[#D4AF37]/0 via-[#D4AF37]/10 to-[#D4AF37]/0 blur-md opacity-50"></div>
          <form 
            onSubmit={handleSearch} 
            className="relative glass-card p-2 sm:p-3 rounded-2xl sm:rounded-full border border-[#D4AF37]/20 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] flex flex-col sm:flex-row items-center gap-2 sm:gap-0"
          >
            <div className="w-full flex-1 flex items-center px-6">
              <Search size={20} className="text-[#D4AF37] mr-4 opacity-50 shrink-0" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Order ID (e.g. RK12345)"
                className="w-full bg-transparent border-none outline-none text-[#F5F5F5] font-outfit uppercase tracking-[0.2em] py-4 placeholder:text-[#555] text-[10px] md:text-sm font-black"
              />
            </div>
            <button 
              type="submit"
              className="w-full sm:w-auto gold-gradient text-black px-10 md:px-14 py-4 md:py-5 rounded-xl sm:rounded-full font-black uppercase tracking-[0.3em] text-[9px] md:text-[10px] hover:glow-gold transition-all transform active:scale-95 shadow-xl saturate-150"
            >
              Track Order
            </button>
          </form>
        </motion.div>

        <AnimatePresence mode="wait">
          {isLoading && (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center my-32 gap-6"
            >
              <div className="relative w-24 h-24">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-[0.5px] border-[#D4AF37]/20 rounded-full"
                ></motion.div>
                <motion.div 
                  animate={{ rotate: -360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-2 border-t-2 border-l-2 border-[#D4AF37] rounded-full"
                ></motion.div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles size={20} className="text-[#D4AF37] animate-pulse" />
                </div>
              </div>
              <span className="text-[#D4AF37] text-[10px] uppercase tracking-[0.5em] font-black animate-pulse">Finding Order...</span>
            </motion.div>
          )}

          {isError && (
            <motion.div 
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card border-red-500/20 p-12 text-center max-w-xl mx-auto rounded-[2.5rem] relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-red-500/20"></div>
              <AlertCircle size={48} className="text-red-500/60 mx-auto mb-6" />
              <h3 className="text-2xl font-display text-white mb-4 uppercase tracking-widest">Order Not Found</h3>
              <p className="text-[#888] leading-relaxed">
                We couldn't find an order with ID <span className="text-white font-mono">{orderId}</span>. <br/>
                Please check your order confirmation and try again.
              </p>
            </motion.div>
          )}

          {order && !isLoading && !isError && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto w-full px-4"
            >
              <div className="glass-card rounded-[2.5rem] border-[#D4AF37]/10 p-4 sm:p-8 lg:p-12 relative overflow-hidden shadow-2xl flex flex-col items-center">
                <div className="absolute -top-20 -right-20 w-80 h-80 bg-[#D4AF37]/5 blur-[100px] rounded-full opacity-60"></div>
                
                {order.status === 'CANCELLED' ? (
                  /* Cancelled Order Display */
                  <div className="w-full text-center py-12">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-500/10 border-2 border-red-500/20 mb-8">
                      <XCircle size={48} className="text-red-500" />
                    </div>
                    <h3 className="text-3xl font-display uppercase tracking-widest text-red-500 mb-6 font-black">Order Cancelled</h3>
                    <p className="text-[#888] text-base mb-8 max-w-xl mx-auto leading-relaxed">
                      Your order <span className="text-white font-mono">{order.orderId}</span> has been cancelled.
                    </p>
                    <div className="max-w-lg mx-auto bg-red-500/5 border border-red-500/20 rounded-2xl p-8">
                      <div className="flex items-start gap-4 text-red-400/90 mb-6">
                        <AlertTriangle size={20} className="mt-1 shrink-0" />
                        <p className="text-sm leading-relaxed text-left">
                          Your refund will be processed and credited to your original payment method within 24 hours.
                        </p>
                      </div>
                      <div className="pt-6 border-t border-red-500/10">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] uppercase tracking-widest text-[#555] font-black">Refund Amount</span>
                          <span className="text-2xl font-mono font-black text-red-400">₹{order.totalAmount?.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Normal Order Tracking */
                  <>
                    {/* 1. Stepper Section */}
                    <div className="w-full mb-12">
                  <div className="flex items-center gap-6 mb-8 justify-center">
                    <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#D4AF37]/40"></div>
                    <h3 className="font-display uppercase tracking-[0.4em] text-xs text-[#D4AF37] font-black text-center">Order Status</h3>
                    <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#D4AF37]/40"></div>
                  </div>
                  
                  <div className="relative mb-8 max-w-2xl mx-auto px-2">
                    {/* Progress Line — always visible */}
                    <div className="absolute top-5 sm:top-7 left-0 right-0 h-[1px] bg-white/5"></div>
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(Math.max(0, currentStep) / (steps.length - 1)) * 100}%` }}
                      transition={{ duration: 1.5, ease: "circOut", delay: 0.5 }}
                      className="absolute top-5 sm:top-7 left-0 h-[1px] gold-gradient shadow-[0_0_15px_#D4AF37]"
                    ></motion.div>

                    <div className="flex flex-row justify-between relative z-10">
                      {steps.map((step, index) => {
                        const isCompleted = index <= currentStep;
                        const isCurrent = index === currentStep;
                        const Icon = step.icon;
                        
                        return (
                          <div key={step.id} className="flex flex-col items-center gap-2 flex-1 min-w-0">
                            <motion.div 
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: 0.5 + (index * 0.15), type: "spring", stiffness: 100 }}
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
                              <h4 className={`text-[8px] sm:text-[9px] uppercase tracking-[0.1em] sm:tracking-[0.2em] font-black transition-all duration-700 truncate leading-tight ${isCompleted ? 'text-white' : 'text-[#444]'}`}>
                                <span className="hidden sm:inline">{step.label}</span>
                                <span className="sm:hidden">{step.shortLabel}</span>
                              </h4>
                              {isCurrent && (
                                <motion.span 
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  className="text-[7px] uppercase tracking-[0.1em] font-black gold-gradient-text block mt-0.5"
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

                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="text-center p-5 rounded-2xl border border-[#D4AF37]/10 bg-white/[0.01] max-w-2xl mx-auto"
                  >
                     <p className="text-sm sm:text-lg text-white font-medium mb-2 tracking-wide">{currentStepData.message}</p>
                     <div className="flex items-center justify-center gap-3 mt-4 pt-4 border-t border-white/5 flex-wrap">
                        <Clock size={12} className="text-[#D4AF37]" />
                        <span className="text-[9px] uppercase tracking-[0.2em] text-[#888]">Estimated Arrival:</span>
                        <span className="text-[10px] sm:text-xs font-black text-[#D4AF37] uppercase tracking-[0.1em]">
                          {order?.createdAt 
                            ? new Date(new Date(order.createdAt).getTime() + 5*24*60*60*1000).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
                            : "---"}
                        </span>
                     </div>
                  </motion.div>
                </div>

                {/* Atmospheric Separator */}
                <div className="hidden sm:flex w-full items-center gap-6 px-10 mb-10 opacity-30">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white to-transparent"></div>
                  <Sparkles size={14} className="text-[#D4AF37]" />
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white to-transparent"></div>
                </div>

                {/* 2. Archive Details Section */}
                <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-12">
                   <div className="space-y-8">
                     <div className="flex items-center gap-4 mb-2">
                        <CreditCard size={14} className="text-[#D4AF37]" />
                        <h4 className="font-display uppercase tracking-[0.3em] text-[10px] text-white font-black">Order Details</h4>
                     </div>
                     <div className="space-y-6">
                        <div>
                          <span className="text-[8px] uppercase tracking-[0.4em] text-[#555] block mb-2 font-black">Order ID</span>
                          <span className="text-xl tracking-widest font-black gold-gradient-text">{order?.orderId}</span>
                        </div>
                        <div className="flex gap-10">
                           <div>
                             <span className="text-[8px] uppercase tracking-[0.4em] text-[#555] block mb-2 font-black">Items</span>
                             <span className="text-base text-white font-black tracking-widest">{(order?.items ?? []).length}</span>
                           </div>
                           <div className="w-px h-10 bg-white/5"></div>
                           <div>
                             <span className="text-[8px] uppercase tracking-[0.4em] text-[#555] block mb-2 font-black">Order Date</span>
                             <span className="text-[10px] text-white/80 font-black uppercase tracking-widest">
                                {order?.createdAt ? new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : "---"}
                             </span>
                           </div>
                        </div>
                     </div>
                   </div>

                   <div className="space-y-6">
                     <div className="flex items-center gap-4 mb-2">
                        <MapPin size={14} className="text-[#D4AF37]" />
                        <h4 className="font-display uppercase tracking-[0.3em] text-[10px] text-white font-black">Shipping Address</h4>
                     </div>
                     <div className="text-[9px] sm:text-[10px] text-[#F5F5F5]/80 leading-relaxed font-black tracking-widest uppercase bg-white/[0.01] p-6 rounded-xl border border-white/5 min-h-[120px] flex flex-col justify-center">
                        <span className="text-[#D4AF37] block mb-1 font-display tracking-[0.2em]">{order?.customerName}</span>
                        {order?.address}
                     </div>
                   </div>
                </div>
                </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
