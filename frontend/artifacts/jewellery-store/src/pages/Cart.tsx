import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useStore } from "@/context/StoreContext";
import {
  Trash2, Minus, Plus, ArrowRight, ShoppingBag,
  ShieldCheck, Sparkles, Tag, ChevronRight,
  Heart, AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GoldenBackground } from "@/components/GoldenBackground";
import { useStockCheck } from "@/hooks/useStockCheck";



// ─── Trust Badges ─────────────────────────────────────────────────────────────
// ─── Empty Cart ───────────────────────────────────────────────────────────────
function EmptyCart() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center relative z-10 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="text-center max-w-md w-full"
      >
        {/* Glow ring icon */}
        <div className="relative mx-auto w-36 h-36 mb-10">
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 70%)" }}
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <div className="absolute inset-3 rounded-full border border-[#D4AF37]/20 bg-[#0d0d0d]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <ShoppingBag size={44} className="text-[#D4AF37]" strokeWidth={1.2} />
          </div>
          {/* Corner sparkles */}
          <Sparkles size={14} className="absolute top-2 right-4 text-[#D4AF37]/60 animate-pulse" />
          <Sparkles size={10} className="absolute bottom-4 left-2 text-[#D4AF37]/40 animate-pulse" style={{ animationDelay: "0.5s" }} />
        </div>

        <h1 className="text-3xl md:text-4xl font-display uppercase tracking-[0.2em] text-[#F5F5F5] mb-4">
          Your Bag is Empty
        </h1>
        <div className="w-16 h-px gold-gradient mx-auto mb-6" />
        <p className="text-[#6A6A6A] leading-relaxed mb-10 text-sm tracking-wide">
          You haven't added any luxury pieces yet. Explore our curated collection to discover your next treasure.
        </p>

        <Link
          href="/shop"
          className="group inline-flex items-center gap-3 gold-gradient text-[#0A0A0A] px-10 py-4 rounded-full uppercase tracking-[0.2em] text-xs font-black transition-all hover:shadow-[0_0_40px_rgba(212,175,55,0.4)] active:scale-95"
        >
          Explore Collection
          <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
        </Link>

        {/* Quick links */}
        <div className="mt-12 flex items-center justify-center gap-6">
          {["Rings", "Necklaces", "Bridal", "Antique"].map((cat) => (
            <Link
              key={cat}
              href={`/shop?category=${cat}`}
              className="text-[9px] uppercase tracking-[0.3em] text-[#555] hover:text-[#D4AF37] transition-colors font-bold"
            >
              {cat}
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Promo Code Input ─────────────────────────────────────────────────────────
function PromoCode() {
  const [promo, setPromo] = useState("");
  const [applied, setApplied] = useState(false);
  const [shaking, setShaking] = useState(false);

  const handleApply = () => {
    if (promo.trim().toUpperCase() === "GOLD10") {
      setApplied(true);
    } else if (promo.trim()) {
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
    }
  };

  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 mb-3">
        <Tag size={13} className="text-[#D4AF37]/60" />
        <span className="text-[10px] uppercase tracking-[0.25em] text-[#666] font-bold">Promo Code</span>
      </div>
      {applied ? (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between border border-[#D4AF37]/30 rounded-xl px-4 py-3 bg-[#D4AF37]/5"
        >
          <span className="text-[#D4AF37] text-xs font-black uppercase tracking-widest">GOLD10 Applied ✓</span>
          <button
            onClick={() => { setApplied(false); setPromo(""); }}
            className="text-[#555] text-[9px] uppercase tracking-wider hover:text-[#D4AF37] transition-colors"
          >
            Remove
          </button>
        </motion.div>
      ) : (
        <motion.div
          animate={shaking ? { x: [-8, 8, -6, 6, -4, 4, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="flex gap-2"
        >
          <input
            value={promo}
            onChange={(e) => setPromo(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && handleApply()}
            placeholder="Enter code..."
            className="flex-1 bg-[#111] border border-[#2A2A2A] hover:border-[#D4AF37]/20 focus:border-[#D4AF37]/40 rounded-xl px-4 py-3 text-xs text-white placeholder:text-[#444] outline-none transition-all font-mono tracking-widest uppercase"
          />
          <button
            onClick={handleApply}
            className="text-[10px] uppercase tracking-widest font-black border border-[#D4AF37]/30 text-[#D4AF37] px-5 rounded-xl hover:bg-[#D4AF37]/10 transition-all"
          >
            Apply
          </button>
        </motion.div>
      )}
      {shaking && (
        <p className="text-red-400 text-[9px] uppercase tracking-wider mt-2 font-bold">Invalid promo code</p>
      )}
    </div>
  );
}

// ─── Main Cart ────────────────────────────────────────────────────────────────
export default function Cart() {
  const { cart, removeFromCart, updateCartQuantity, cartTotal, toggleWishlist, isInWishlist, refreshProducts } = useStore();
  const [, setLocation] = useLocation();
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [charges, setCharges] = useState<{ _id: string; name: string; type: "fixed" | "percentage"; value: number }[]>([]);

  const { isOutOfStock, checked } = useStockCheck(cart.map(i => i._id));

  // Refresh stock on cart page mount
  useEffect(() => { refreshProducts(); }, []);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/charges/active`)
      .then(r => r.json())
      .then(data => setCharges(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const effectiveCartTotal = cart.filter(i => !isOutOfStock(i._id)).reduce((sum, i) => sum + i.price * i.quantity, 0);
  const chargesTotal = effectiveCartTotal === 0 ? 0 : charges.reduce((sum, c) => {
    return sum + (c.type === "percentage" ? Math.round(effectiveCartTotal * c.value / 100) : c.value);
  }, 0);
  const grandTotal = Math.round(effectiveCartTotal + chargesTotal);

  const handleRemove = (id: string) => {
    setRemovingId(id);
    setTimeout(() => {
      removeFromCart(id);
      setRemovingId(null);
    }, 300);
  };

  const itemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="relative min-h-screen pt-28 pb-24">
      <GoldenBackground />

      <div className="relative z-10 container mx-auto px-4 max-w-7xl">

        {/* ── Page Title ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-14 text-center"
        >
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 border border-[#D4AF37]/20 bg-[#D4AF37]/5 rounded-full px-5 py-2">
              <ShoppingBag size={12} className="text-[#D4AF37]" />
              <span className="text-[9px] uppercase tracking-[0.35em] text-[#D4AF37] font-black">
                {itemCount} {itemCount === 1 ? "Item" : "Items"} in Bag
              </span>
            </div>
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-display uppercase tracking-[0.2em] text-[#F5F5F5] mb-4">
            Shopping Bag
          </h1>

        </motion.div>

        {cart.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="flex flex-col xl:flex-row gap-10 xl:gap-16 items-start">

            {/* ── LEFT: Cart Items ── */}
            <div className="flex-1 w-full">

              {/* Column Headers (desktop) */}
              <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b border-[#D4AF37]/10 text-[9px] uppercase tracking-[0.3em] text-[#555] font-black mb-6">
                <div className="col-span-6">Masterpiece</div>
                <div className="col-span-2 text-center">Unit Price</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-right">Subtotal</div>
              </div>

              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {cart.map((item, idx) => (
                    <motion.div
                      key={item._id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: removingId === item._id ? 0 : 1, y: 0, scale: removingId === item._id ? 0.97 : 1 }}
                      exit={{ opacity: 0, x: -40, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1], delay: idx * 0.05 }}
                      className="group relative"
                    >
                      {/* Gold side accent on hover */}
                      <div className="absolute left-0 top-4 bottom-4 w-[2px] rounded-r bg-gradient-to-b from-transparent via-[#D4AF37] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      <div className={`glass-card rounded-2xl transition-all duration-500 p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-5 items-center overflow-hidden relative ${isOutOfStock(item._id) ? 'border border-red-500/30 bg-red-500/[0.03]' : 'border-[#D4AF37]/10 group-hover:border-[#D4AF37]/25'}`}>
                        {/* Out of stock banner */}
                        {isOutOfStock(item._id) && (
                          <div className="col-span-full flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5 mb-1">
                            <AlertTriangle size={12} className="text-red-400 shrink-0" />
                            <span className="text-[9px] uppercase tracking-[0.3em] font-black text-red-400">This item is now out of stock — remove it before checkout</span>
                          </div>
                        )}
                        {/* Subtle shimmer on hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#D4AF37]/[0.02] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />

                        {/* Product Info */}
                        <div className="col-span-1 md:col-span-6 flex items-center gap-5">
                          {/* Image */}
                          <div className="relative shrink-0">
                            <div className="w-20 h-20 md:w-28 md:h-28 rounded-xl overflow-hidden border border-[#D4AF37]/10 group-hover:border-[#D4AF37]/30 transition-all duration-500">
                              <img
                                src={item.images[0]}
                                alt={item.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                              />
                            </div>
                            {/* Badge */}
                            {item.isNew && (
                              <span className="absolute -top-2 -right-2 gold-gradient text-[#0A0A0A] text-[7px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-lg">
                                New
                              </span>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <span className="text-[9px] uppercase tracking-[0.3em] text-[#D4AF37]/70 font-bold mb-1.5 block">
                              {item.category}
                            </span>
                            <Link
                              href={`/product/${item.productId || item._id}`}
                              className="block font-display text-base md:text-lg text-[#F0F0F0] hover:text-[#D4AF37] transition-colors line-clamp-2 leading-snug mb-3"
                            >
                              {item.name}
                            </Link>
                            {/* Mobile price */}
                            <div className="md:hidden text-sm font-mono font-bold text-[#F5F5F5] mb-3">
                              ₹{item.price.toLocaleString()}
                            </div>
                            {/* Actions */}
                            <div className="flex items-center gap-4">
                              <button
                                onClick={() => handleRemove(item._id)}
                                disabled={removingId === item._id}
                                className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest font-black text-[#444] hover:text-red-400 transition-colors group/btn disabled:opacity-40"
                              >
                                {removingId === item._id ? (
                                  <div className="w-3 h-3 border border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                                ) : (
                                  <Trash2 size={12} className="group-hover/btn:scale-110 transition-transform" />
                                )}
                                {removingId === item._id ? "Removing..." : "Remove"}
                              </button>
                              <span className="w-px h-3 bg-[#2A2A2A]" />
                              <button
                                onClick={() => toggleWishlist(item)}
                                className={`flex items-center gap-1.5 text-[9px] uppercase tracking-widest font-black transition-colors group/btn ${
                                  isInWishlist(item._id) ? "text-[#D4AF37]" : "text-[#444] hover:text-[#D4AF37]"
                                }`}
                              >
                                <Heart 
                                  size={12} 
                                  className={`transition-all duration-300 ${isInWishlist(item._id) ? "fill-[#D4AF37] scale-110" : "group-hover/btn:scale-110"}`} 
                                />
                                {isInWishlist(item._id) ? "Saved" : "Save"}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Unit Price (desktop) */}
                        <div className="hidden md:flex col-span-2 justify-center">
                          <span className="text-sm font-mono text-[#888]">
                            ₹{item.price.toLocaleString()}
                          </span>
                        </div>

                        {/* Quantity */}
                        <div className="col-span-1 md:col-span-2 flex items-center justify-between md:justify-center gap-4">
                          <span className="md:hidden text-[9px] uppercase tracking-widest text-[#555] font-bold">Qty</span>
                          <div className="flex items-center border border-[#2A2A2A] hover:border-[#D4AF37]/30 rounded-xl overflow-hidden transition-all">
                            <button
                              onClick={() => updateCartQuantity(item._id, item.quantity - 1)}
                              className="w-8 h-8 flex items-center justify-center text-[#666] hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-8 text-center text-sm font-mono font-black text-[#F5F5F5]">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateCartQuantity(item._id, item.quantity + 1)}
                              disabled={item.quantity >= (item.stock ?? Infinity)}
                              className="w-8 h-8 flex items-center justify-center text-[#666] hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          {item.stock !== undefined && item.stock <= 5 && item.stock > 0 && (
                            <span className="text-[8px] uppercase tracking-widest text-red-400 font-black">{item.stock} left</span>
                          )}
                        </div>

                        {/* Line Total */}
                        <div className="col-span-1 md:col-span-2 flex items-center justify-between md:justify-end">
                          <span className="md:hidden text-[9px] uppercase tracking-widest text-[#555] font-bold">Total</span>
                          <span className="text-lg md:text-xl font-mono font-black gold-gradient-text">
                            ₹{(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Continue Shopping */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-8 flex items-center gap-4"
              >
                <Link
                  href="/shop"
                  className="group inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] font-black text-[#555] hover:text-[#D4AF37] transition-colors"
                >
                  <ChevronRight size={14} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
                  Continue Shopping
                </Link>
              </motion.div>


            </div>

            {/* ── RIGHT: Order Summary ── */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="w-full xl:w-[420px] shrink-0"
            >
              <div className="sticky top-28">

                {/* Summary Card */}
                <div
                  className="rounded-2xl overflow-hidden relative"
                  style={{
                    background: "linear-gradient(135deg, rgba(18,18,18,0.95) 0%, rgba(10,10,10,0.98) 100%)",
                    border: "1px solid rgba(212,175,55,0.2)",
                    boxShadow: "0 30px 80px rgba(0,0,0,0.6), 0 0 60px rgba(212,175,55,0.05), inset 0 0 0 1px rgba(255,255,255,0.02)",
                  }}
                >
                  {/* Top accent bar */}
                  <div className="h-[2px] gold-gradient" />

                  <div className="p-7">
                    {/* Title */}
                    <div className="flex items-center justify-between mb-7">
                      <h2 className="text-xl font-display uppercase tracking-[0.2em] text-[#F5F5F5]">
                        Order Summary
                      </h2>
                      <span className="text-[9px] font-black uppercase tracking-widest text-[#D4AF37]/60 border border-[#D4AF37]/20 rounded-full px-3 py-1 whitespace-nowrap flex-shrink-0">
                        {itemCount} {itemCount === 1 ? "piece" : "pieces"}
                      </span>
                    </div>

                    {/* Line items */}
                    <div className="space-y-4 text-sm mb-6">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] uppercase tracking-[0.25em] text-[#666] font-bold">Subtotal</span>
                        <span className="font-mono font-bold text-[#E0E0E0]">₹{effectiveCartTotal.toLocaleString()}</span>
                      </div>

                      {effectiveCartTotal > 0 && charges.map(c => (
                        <div key={c._id} className="flex justify-between items-center">
                          <span className="text-[10px] uppercase tracking-[0.25em] text-[#666] font-bold">{c.name}</span>
                          <span className="font-mono text-[#888] text-xs">
                            {c.type === "percentage"
                              ? `₹${Math.round(effectiveCartTotal * c.value / 100).toLocaleString()} (${c.value}%)`
                              : `₹${c.value.toLocaleString()}`}
                          </span>
                        </div>
                      ))}


                    </div>

                    {/* Divider */}
                    <div className="my-7 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/20 to-transparent" />

                    {/* Grand Total */}
                    <div className="flex items-end justify-between mb-8">
                      <div>
                        <p className="text-[9px] uppercase tracking-[0.3em] text-[#555] font-black mb-1">Grand Total</p>
                        <p className="text-[9px] text-[#444] tracking-wider">(incl. all taxes)</p>
                      </div>
                      <motion.div
                        key={grandTotal}
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-right"
                      >
                        <span className="text-3xl font-mono font-black gold-gradient-text leading-none">
                          ₹{grandTotal.toLocaleString()}
                        </span>
                      </motion.div>
                    </div>

                    {/* CTA */}
                    {(() => {
                      const hasOOS = checked && cart.some(i => isOutOfStock(i._id));
                      return hasOOS ? (
                        <div className="w-full mb-4 space-y-2">
                          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                            <AlertTriangle size={13} className="text-red-400 shrink-0" />
                            <span className="text-[9px] uppercase tracking-[0.25em] font-black text-red-400">Remove out-of-stock items to proceed</span>
                          </div>
                          <button disabled className="w-full relative overflow-hidden bg-white/5 border border-white/10 text-white/20 py-5 rounded-xl flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-xs font-black cursor-not-allowed">
                            Proceed to Checkout
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setLocation("/checkout")}
                          className="w-full relative overflow-hidden gold-gradient text-[#0A0A0A] py-5 rounded-xl flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-xs font-black transition-all hover:shadow-[0_0_50px_rgba(212,175,55,0.35)] active:scale-[0.98] group shadow-[0_0_20px_rgba(212,175,55,0.2)] mb-4"
                        >
                          <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                          Proceed to Checkout
                          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                      );
                    })()}

                    {/* OR divider */}
                    <div className="flex items-center gap-3 my-4">
                      <div className="flex-1 h-px bg-[#1E1E1E]" />
                      <span className="text-[9px] uppercase tracking-widest text-[#444] font-bold">or</span>
                      <div className="flex-1 h-px bg-[#1E1E1E]" />
                    </div>

                    <Link
                      href="/shop"
                      className="w-full block text-center border border-[#2A2A2A] hover:border-[#D4AF37]/30 text-[#666] hover:text-[#D4AF37] py-4 rounded-xl text-[10px] uppercase tracking-[0.2em] font-black transition-all"
                    >
                      Continue Shopping
                    </Link>

                    {/* Security note */}
                    <div className="mt-6 flex items-center justify-center gap-2">
                      <ShieldCheck size={13} className="text-[#D4AF37]/60" />
                      <span className="text-[9px] uppercase tracking-[0.25em] text-[#4A4A4A] font-bold">
                        256-bit SSL Encrypted Checkout
                      </span>
                    </div>
                  </div>
                </div>


              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
