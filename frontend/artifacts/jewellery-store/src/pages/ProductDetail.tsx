import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useStore, Product } from "@/context/StoreContext";
import { Heart, Minus, Plus, ShieldCheck, ChevronRight, ShoppingCart } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { motion, AnimatePresence } from "framer-motion";
import { GoldenBackground } from "@/components/GoldenBackground";

export default function ProductDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { products, cart, addToCart, toggleWishlist, isInWishlist } = useStore();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  // Match by productId (RKP-XXXXXXXX) or fallback to _id for old links
  const product = products.find(p => p.productId === id || p._id === id);
  const relatedProducts = products.filter(p => p.category === product?.category && p._id !== product?._id).slice(0, 4);
  const isWishlisted = product ? isInWishlist(product._id) : false;
  const itemInCart = product ? cart.some(item => item._id === product._id) : false;

  const handleAddToCart = () => {
    if (product) {
      if (itemInCart) {
        setLocation('/cart');
        return;
      }
      addToCart(product, quantity);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    setIsLoading(true);
    setQuantity(1);
    setActiveImage(0);
    setJustAdded(false);
    setIsDescExpanded(false);
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, [id]);

  useEffect(() => {
    if (!product) return;
    const imgs = product.coverImage
      ? [product.coverImage, ...(product.images || []).filter(img => img !== product.coverImage)]
      : (product.images || []);
    if (imgs.length <= 1) return;
    const interval = setInterval(() => {
      setActiveImage((prev) => (prev + 1) % imgs.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [product]);

  if (!product) {
    return (
      <div className="pt-32 pb-20 text-center min-h-screen flex flex-col items-center justify-center bg-[#0A0A0A]">
        <h1 className="text-4xl font-display mb-6 text-[#F5F5F5]">Masterpiece Not Found</h1>
        <Link href="/shop" className="gold-gradient text-[#0A0A0A] px-8 py-3 rounded-full uppercase tracking-widest text-sm font-bold">Return to Collection</Link>
      </div>
    );
  }

  // Build full image list after product guard: coverImage first, then gallery (deduped)
  const allImages = product.coverImage
    ? [product.coverImage, ...(product.images || []).filter(img => img !== product.coverImage)]
    : (product.images || []);

  if (isLoading) {
    return (
      <div className="pt-32 pb-16 min-h-screen bg-[#050505] relative animate-pulse overflow-hidden">
        <GoldenBackground />
        <div className="container relative z-10 mx-auto px-4 lg:px-8 max-w-7xl">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          <div className="w-full lg:w-1/2 aspect-square bg-[#161616] rounded-3xl"></div>
          <div className="w-full lg:w-1/2 py-8">
            <div className="h-6 w-32 bg-[#161616] rounded-full mb-6"></div>
            <div className="h-16 w-3/4 bg-[#161616] rounded mb-6"></div>
            <div className="h-8 w-40 bg-[#161616] rounded mb-10"></div>
            <div className="space-y-4 mb-12">
              <div className="h-4 w-full bg-[#161616] rounded"></div>
              <div className="h-4 w-full bg-[#161616] rounded"></div>
              <div className="h-4 w-2/3 bg-[#161616] rounded"></div>
            </div>
          </div>
        </div>
      </div>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-24 min-h-screen bg-[#050505] relative overflow-hidden">
      <GoldenBackground />
      <div className="container relative z-10 mx-auto px-4 lg:px-8 max-w-7xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-[#8A8A8A] mb-10 glass-card inline-flex px-6 py-3 rounded-full">
          <Link href="/" className="hover:text-[#D4AF37] transition-colors">Home</Link>
          <ChevronRight size={12} className="text-[#D4AF37]" />
          <Link href="/shop" className="hover:text-[#D4AF37] transition-colors">{product.category}</Link>
          <ChevronRight size={12} className="text-[#D4AF37]" />
          <span className="text-[#D4AF37] font-bold line-clamp-1 max-w-[200px]">{product.name}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 mb-32">
          {/* Images Gallery */}
          <div className="w-full lg:w-1/2 flex flex-col gap-6 relative">
            {/* Main Interactive Carousel */}
            <div className="w-full aspect-square bg-[#080808] border border-white/5 rounded-[2rem] relative overflow-hidden group shadow-[0_30px_60px_-15px_rgba(0,0,0,0.9)]">
              <AnimatePresence mode="wait">
                <motion.img 
                  key={activeImage}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  src={allImages[activeImage]} 
                  alt={`${product.name} detail ${activeImage + 1}`} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
              </AnimatePresence>
              
              {/* Image Edge Shadow Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none"></div>

              {/* Dynamic Dots Indicator */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/40 backdrop-blur-xl px-5 py-3 rounded-full border border-white/10 transition-all hover:bg-black/60 z-20">
                {allImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`h-1.5 rounded-full transition-all duration-500 overflow-hidden relative ${
                      activeImage === idx 
                        ? "w-8 bg-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.8)]" 
                        : "w-1.5 bg-white/30 hover:bg-white/60 hover:w-3"
                    }`}
                    aria-label={`Jump to image ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Guarantees */}
            <div className="flex flex-col sm:flex-row gap-4 mt-2">
              <div className="flex items-center gap-4 text-sm text-[#8A8A8A] bg-white/[0.02] border border-white/5 px-6 py-4 rounded-full flex-1 shadow-inner">
                <ShieldCheck size={20} className="text-[#D4AF37]" />
                <span className="uppercase tracking-[0.2em] font-bold text-[9px] text-[#AAA]">Lifetime Warranty</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-[#8A8A8A] bg-white/[0.02] border border-white/5 px-6 py-4 rounded-full flex-1 shadow-inner">
                <ShieldCheck size={20} className="text-[#D4AF37]" />
                <span className="uppercase tracking-[0.2em] font-bold text-[9px] text-[#AAA]">Free Express Shipping</span>
              </div>
            </div>
          </div>

          {/* Details Panel */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full lg:w-1/2 lg:py-4 flex flex-col"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-[#D4AF37]/10 text-[#D4AF37] px-4 py-1.5 rounded-full text-[10px] uppercase tracking-[0.3em] border border-[#D4AF37]/20 font-black backdrop-blur-sm">
                {product.category}
              </span>
              <span className="text-[#555] font-mono text-[10px] uppercase tracking-[0.3em] font-bold">
                ID: {product.productId || `RKP-${product._id.slice(-8).toUpperCase()}`}
              </span>
              {product.isNew && (
                <span className="ml-auto gold-gradient px-4 py-1.5 rounded-full text-black text-[10px] uppercase tracking-[0.3em] font-black shadow-[0_0_15px_rgba(212,175,55,0.4)]">
                  Rare Find
                </span>
              )}
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-5xl font-outfit leading-[1.1] mb-6 text-[#F5F5F5] uppercase tracking-[0.1em] font-black">{product.name}</h1>
            
            <div className="flex items-center gap-6 mb-8 border-b border-white/5 pb-8">
              <div className="flex items-center gap-2">
                {(product.orderCount ?? 0) > 0 ? (
                  <span className="text-[#D4AF37] text-[11px] font-black uppercase tracking-[0.3em]">
                    {product.orderCount} order{product.orderCount !== 1 ? 's' : ''}
                  </span>
                ) : (
                  <span className="text-[#555] text-[11px] font-black uppercase tracking-[0.3em]">No orders yet</span>
                )}
              </div>
              <div className="w-[1px] h-4 bg-white/10"></div>
              <span className="text-[#777] text-[10px] uppercase tracking-[0.3em] font-bold">Provenance Guaranteed</span>
            </div>

            <div className="mb-10">
              <div className="flex items-center text-[#D4AF37] mb-2 gap-2">
                <span className="text-4xl font-outfit font-bold opacity-95 text-[#D4AF37] leading-none translate-y-[2px]">₹</span>
                <p className="text-4xl lg:text-5xl font-outfit tracking-widest font-bold leading-none">
                  {(product.price || 0).toLocaleString('en-IN')}
                </p>
                {product.originalPrice > product.price && (
                  <span className="text-[#555] text-xl line-through ml-4">
                    ₹{(product.originalPrice || 0).toLocaleString('en-IN')}
                  </span>
                )}
              </div>
              <p className="text-[#555] text-[10px] uppercase tracking-[0.2em] font-bold">Inclusive of bespoke packaging & worldwide insured delivery</p>
            </div>
            
            <div className="mb-12 bg-white/[0.02] border border-white/5 rounded-2xl p-6 shadow-inner">
              <p className={`text-[#AAA] leading-[1.8] font-light text-sm tracking-wide ${!isDescExpanded && "line-clamp-3"}`}>
                {product.description}
              </p>
              <button 
                onClick={() => setIsDescExpanded(!isDescExpanded)}
                className="text-[#D4AF37] uppercase tracking-widest text-xs font-bold mt-4 hover:underline"
              >
                {isDescExpanded ? "Read Less" : "Read More"}
              </button>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-6 mb-12">
              <div className="bg-[#0A0A0A] border border-white/10 flex items-center rounded-full p-2 w-full sm:w-auto shadow-inner">
                <button 
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-12 h-12 rounded-full flex items-center justify-center text-[#AAA] hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] transition-all"
                >
                  <Minus size={14} />
                </button>
                <div className="w-14 text-center flex flex-col items-center justify-center">
                  <span className="font-mono text-sm tracking-widest font-black text-[#F5F5F5]">{quantity}</span>
                </div>
                <button 
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-12 h-12 rounded-full flex items-center justify-center text-[#AAA] hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] transition-all"
                >
                  <Plus size={14} />
                </button>
              </div>
              
              <button 
                onClick={handleAddToCart}
                className={`flex-[2] ${itemInCart ? 'bg-black border border-[#D4AF37] text-[#D4AF37]' : 'bg-gradient-to-r from-[#C59B27] via-[#FFF3A3] to-[#A37B1B] text-black shadow-[0_15px_30px_-10px_rgba(212,175,55,0.4)]'} rounded-full uppercase tracking-[0.2em] text-[12px] font-black hover:brightness-110 transition-all py-4 px-8 transform active:scale-[0.98] flex items-center justify-center gap-3 cursor-pointer`}
              >
                <ShoppingCart size={16} className="stroke-[2.5px]" />
                {justAdded ? "Added to Cart!" : (itemInCart ? "In Your Cart" : "Add to Cart")}
              </button>

              <button 
                onClick={() => toggleWishlist(product)}
                className="w-[72px] h-[72px] shrink-0 rounded-full flex items-center justify-center bg-white/[0.02] border border-white/5 text-[#AAA] hover:border-[#D4AF37]/50 hover:text-[#D4AF37] hover:bg-[#D4AF37]/5 transition-all group shadow-inner"
                aria-label="Secure to wishlist"
              >
                <Heart size={20} strokeWidth={2} className={`${isWishlisted ? "fill-[#D4AF37] text-[#D4AF37]" : "group-hover:scale-110 transition-transform duration-500"}`} />
              </button>
            </div>

            {/* Specifications */}
            <div className="glass-card rounded-2xl p-6 mb-8">
              <h3 className="font-display uppercase tracking-widest text-[#F5F5F5] mb-4 pb-4 border-b border-[#D4AF37]/10">Specifications</h3>
              <div className="grid grid-cols-2 gap-y-4 text-sm">
                <div className="text-[#8A8A8A]">Material</div>
                <div className="text-[#F5F5F5] font-medium text-right">Premium Grade</div>
                <div className="text-[#8A8A8A]">Craftsmanship</div>
                <div className="text-[#F5F5F5] font-medium text-right">100% Handcrafted</div>
                <div className="text-[#8A8A8A]">Collection</div>
                <div className="text-[#F5F5F5] font-medium text-right">{product.category}</div>
                <div className="text-[#8A8A8A]">Authenticity</div>
                <div className="text-[#F5F5F5] font-medium text-right">Hallmark Certified</div>
              </div>
            </div>

          </motion.div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="pt-24 border-t border-[#D4AF37]/10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-display uppercase tracking-widest text-[#F5F5F5]">Related Masterpieces</h2>
              <div className="w-16 h-[1px] gold-gradient mx-auto mt-6"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map(p => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
