import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useStore, Product } from "@/context/StoreContext";
import { Heart, ShoppingCart, Trash2, ArrowRight, Sparkles, CheckCircle2, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GoldenBackground } from "@/components/GoldenBackground";
import { useStockCheck } from "@/hooks/useStockCheck";

const fadeInUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.08 } } };

function WishlistCard({ product, onRemove, outOfStock }: { product: Product; onRemove: () => void; outOfStock: boolean }) {
  const { cart, addToCart } = useStore();
  const [, setLocation] = useLocation();
  const [justAdded, setJustAdded] = useState(false);
  const itemInCart = cart.some(item => item._id === product._id);

  const handleCartClick = () => {
    if (outOfStock) return;
    if (itemInCart) { setLocation("/cart"); return; }
    addToCart(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  return (
    <div className="group relative">
      <div className={`glass-card rounded-[2rem] overflow-hidden transition-all duration-500 hover:shadow-[0_20px_60px_rgba(212,175,55,0.08)] ${outOfStock ? 'border border-red-500/20' : 'border-white/5 hover:border-[#D4AF37]/20'}`}>
        {/* Image */}
        <div className="relative aspect-square overflow-hidden">
          <img
            src={product.images[0]}
            alt={product.name}
            className={`w-full h-full object-cover scale-100 group-hover:scale-110 transition-transform duration-700 ${outOfStock ? 'grayscale-[0.6]' : ''}`}
          />
          {outOfStock && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-red-400 text-[10px] font-black uppercase tracking-[0.3em] border border-red-400/40 px-4 py-2 bg-black/60 backdrop-blur-sm">Out of Stock</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>

          {/* Remove Button */}
          <button
            onClick={onRemove}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-[#555] hover:text-red-400 hover:border-red-400/30 hover:bg-red-400/10 transition-all duration-300 opacity-0 group-hover:opacity-100 -translate-y-2 group-hover:translate-y-0"
          >
            <Trash2 size={14} />
          </button>

          {/* Heart Tag */}
          <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-black/40 backdrop-blur-md border border-[#D4AF37]/20 px-3 py-1.5 rounded-full">
            <Heart size={10} className="text-[#D4AF37] fill-[#D4AF37]" />
            <span className="text-[8px] text-[#D4AF37] uppercase tracking-[0.3em] font-black">Saved</span>
          </div>

          <div className="absolute bottom-4 left-4">
            <span className="text-[8px] text-[#888] uppercase tracking-[0.3em] font-black">{product.category}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <div>
            <Link href={`/product/${product.productId || product._id}`}>
              <h3 className="text-white font-outfit font-bold text-base leading-snug mb-2 group-hover:gold-gradient-text transition-all duration-500 line-clamp-2">
                {product.name}
              </h3>
            </Link>
            <span className="text-2xl font-outfit font-black gold-gradient-text tracking-tight">
              ₹{(product.price || 0).toLocaleString()}
            </span>
          </div>

          {outOfStock ? (
            <div className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-red-500/20 bg-red-500/5 text-[10px] uppercase tracking-[0.3em] font-black text-red-400">
              <AlertTriangle size={13} /> Out of Stock
            </div>
          ) : (
            <button
              onClick={handleCartClick}
              className={`w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl text-[10px] uppercase tracking-[0.3em] font-black transition-all duration-500 group/btn ${
                itemInCart
                  ? "bg-black border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10"
                  : "border border-[#D4AF37]/20 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black"
              }`}
            >
              {itemInCart ? <CheckCircle2 size={14} /> : <ShoppingCart size={14} className="group-hover/btn:scale-110 transition-transform" />}
              {justAdded ? "Added!" : itemInCart ? "In Your Cart" : "Add to Cart"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Wishlist() {
  const { wishlist, toggleWishlist } = useStore();
  const [removingId, setRemovingId] = useState<string | null>(null);
  const { isOutOfStock } = useStockCheck(wishlist.map(p => p._id));

  const handleRemove = (product: Product) => {
    setRemovingId(product._id);
    setTimeout(() => {
      toggleWishlist(product);
      setRemovingId(null);
    }, 300);
  };

  return (
    <div className="min-h-screen pt-40 pb-24 bg-[#050505] relative overflow-hidden">
      <GoldenBackground />

      <div className="container mx-auto px-5 max-w-7xl relative z-10">
        {/* Header - Responsive Scaling */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="mb-16 md:mb-20 px-2"
        >
          <motion.div variants={fadeInUp} className="flex items-center gap-4 mb-5">
            <div className="w-10 h-px gold-gradient"></div>
            <span className="text-[#D4AF37] uppercase tracking-[0.5em] text-[10px] font-black italic">Favorites</span>
          </motion.div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <motion.h1 variants={fadeInUp} className="text-4xl sm:text-6xl md:text-8xl font-display text-white uppercase tracking-tight leading-[1.1]">
              My <span className="gold-gradient-text italic font-medium font-cormorant lowercase tracking-normal">Wishlist</span>
            </motion.h1>
            {wishlist.length > 0 && (
              <motion.div variants={fadeInUp} className="flex items-center justify-between sm:justify-start gap-4 sm:gap-8 border-t sm:border-t-0 border-white/5 pt-6 sm:pt-0">
                <span className="text-[#555] text-[9px] uppercase tracking-[0.3em] font-black">
                   {wishlist.length} Item{wishlist.length !== 1 ? "s" : ""} Saved
                </span>
                <Link
                  href="/shop"
                  className="flex items-center gap-2.5 text-[#D4AF37] hover:text-white text-[9px] uppercase tracking-[0.2em] font-black transition-all group"
                >
                  Browse More
                  <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Empty State */}
        {wishlist.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 lg:py-40 text-center px-4"
          >
            <div className="relative mb-10">
              <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-full bg-[#D4AF37]/5 border border-[#D4AF37]/10 flex items-center justify-center">
                <Heart size={40} className="text-[#D4AF37]/20" strokeWidth={1} />
              </div>
              <div className="absolute inset-0 bg-[#D4AF37]/5 rounded-full blur-3xl -z-10"></div>
            </div>
            <h2 className="text-2xl lg:text-4xl font-display text-white uppercase tracking-widest mb-4">Your Wishlist is Empty</h2>
            <p className="text-[#666] text-xs lg:text-sm leading-relaxed max-w-sm mb-10 italic">
              Explore our collection and add your favorite items here to find them later.
            </p>
            <Link
              href="/shop"
              className="gold-gradient text-black px-12 py-4 lg:px-14 lg:py-5 rounded-full font-black uppercase tracking-[0.3em] text-[9px] lg:text-[10px] shadow-2xl hover:scale-105 active:scale-95 transition-all"
            >
              Discover Masterpieces
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
              {wishlist.map((product) => (
                <div
                  key={product._id}
                  className={`transition-all duration-300 ${removingId === product._id ? "opacity-0 scale-90 -translate-y-4" : "opacity-100 scale-100"}`}
                >
                  <WishlistCard product={product} onRemove={() => handleRemove(product)} outOfStock={isOutOfStock(product._id)} />
                </div>
              ))}
          </div>
        )}

        {/* Bottom CTA if items exist - Mobile Optimized */}
        {wishlist.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-20 md:mt-32 text-center glass-card rounded-[2.5rem] md:rounded-[3rem] border-[#D4AF37]/10 p-8 md:p-16 relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.4)]"
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#D4AF37]/5 blur-[100px] rounded-full pointer-events-none opacity-60"></div>
            <Sparkles size={24} className="text-[#D4AF37]/30 mx-auto mb-6" />
            <h3 className="text-xl md:text-3xl font-display text-white uppercase tracking-widest mb-3">Continue the Journey</h3>
            <p className="text-[#888] text-[9px] md:text-[10px] uppercase tracking-[0.4em] font-black mb-10">Discover more pieces matching your taste</p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-4 gold-gradient text-black px-10 md:px-14 py-4 md:py-5 rounded-full font-black uppercase tracking-[0.3em] text-[9px] md:text-[10px] shadow-2xl hover:scale-105 active:scale-95 transition-all text-center"
            >
              Explore Collection
              <ArrowRight size={14} className="hidden sm:block" />
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
