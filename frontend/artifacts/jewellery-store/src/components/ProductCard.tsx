import { Heart, ShoppingBag, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useStore, Product } from "@/context/StoreContext";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { cart, addToCart, toggleWishlist, isInWishlist } = useStore();
  const getImageUrl = (url?: string) => {
    if (!url) return "https://images.unsplash.com/photo-1599643478118-d02f85389680?w=800&q=80"; // Luxury placeholder
    if (url.startsWith('http')) return url;
    return `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${url}`;
  };

  const primaryImage = getImageUrl(product.coverImage || (product.images && product.images[0]));
  const secondaryImage = getImageUrl(product.images && product.images[1] ? product.images[1] : (product.images && product.images[0]));

  const itemInCart = cart.some(item => item._id === product._id);
  const [justAdded, setJustAdded] = useState(false);
  const [, setLocation] = useLocation();
  const isWishlisted = isInWishlist(product._id);

  const handleAddToCart = () => {
    if (itemInCart) {
      setLocation('/cart');
      return;
    }
    addToCart(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };
  return (
    <div className="group flex flex-col bg-transparent backdrop-blur-sm border border-white/5 hover:border-[#D4AF37]/30 transition-all duration-1000 overflow-hidden relative shadow-2xl rounded-3xl">
      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-[#D4AF37]/0 group-hover:border-[#D4AF37]/50 transition-all duration-700 z-20" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-[#D4AF37]/0 group-hover:border-[#D4AF37]/50 transition-all duration-700 z-20" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-[#D4AF37]/0 group-hover:border-[#D4AF37]/50 transition-all duration-700 z-20" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-[#D4AF37]/0 group-hover:border-[#D4AF37]/50 transition-all duration-700 z-20" />

      {/* Image container */}
      <div className="relative h-[380px] overflow-hidden">
        {/* Out of stock overlay */}
        {product.stock === 0 && (
          <div className="absolute inset-0 z-20 bg-black/70 backdrop-blur-[2px] flex items-center justify-center pointer-events-none">
            <span className="text-red-400 text-[11px] font-black uppercase tracking-[0.4em] border border-red-400/40 px-5 py-2 bg-black/60">
              Out of Stock
            </span>
          </div>
        )}

        {/* Chips — top-left, horizontal row */}
        <div className="absolute top-5 left-5 z-10 flex flex-wrap gap-1.5 max-w-[calc(100%-60px)]">
          {product.isNew && (
            <span className="gold-gradient text-[#050505] text-[8px] font-black uppercase tracking-[0.25em] px-3 py-1 shadow-lg whitespace-nowrap">
              New
            </span>
          )}
          {product.isPopular && (
            <span className="bg-white/10 backdrop-blur-md border border-white/20 text-white text-[8px] font-black uppercase tracking-[0.25em] px-3 py-1 shadow-lg whitespace-nowrap">
              Trending
            </span>
          )}
          {typeof product.stock === 'number' && product.stock > 0 && product.stock <= 5 && (
            <span className="bg-black/60 backdrop-blur-md border border-red-400/40 text-red-400 text-[8px] font-black uppercase tracking-[0.25em] px-3 py-1 whitespace-nowrap">
              {product.stock} left
            </span>
          )}
        </div>
        
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product);
          }}
          className={`absolute top-6 right-6 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 backdrop-blur-xl border ${
            isWishlisted 
              ? "bg-[#D4AF37] border-[#D4AF37] text-black shadow-[0_0_20px_rgba(212,175,55,0.4)]" 
              : "bg-black/40 border-white/10 text-white/70 hover:text-[#D4AF37] hover:border-[#D4AF37]/50"
          }`}
        >
          <Heart size={18} strokeWidth={isWishlisted ? 2.5 : 1.5} className={isWishlisted ? "fill-black" : ""} />
        </button>
        
        <Link href={`/product/${product.productId || product._id}`} className="block h-full relative group/img overflow-hidden">
          <div className="absolute inset-0 bg-[#D4AF37]/5 z-10 pointer-events-none opacity-0 group-hover/img:opacity-100 transition-opacity duration-1000"></div>
          <img
            src={primaryImage}
            alt={product.name}
            className="w-full h-full object-cover transition-all duration-[2s] group-hover:scale-110 group-hover:brightness-75"
            loading="lazy"
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none"></div>
          
          {/* Decorative Inner Frame - Appears on Hover */}
          <div className="absolute inset-6 border border-[#D4AF37]/0 group-hover:border-[#D4AF37]/20 transition-all duration-1000 z-10 pointer-events-none scale-105 group-hover:scale-100"></div>
          
          {/* Quick View Overlay */}
          <div className="absolute inset-0 flex items-center justify-center translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-1000 z-20 pointer-events-none">
            <span className="px-10 py-4 bg-black/70 backdrop-blur-xl border border-[#D4AF37]/30 text-[#D4AF37] text-[10px] uppercase tracking-[0.5em] font-black shadow-[0_0_50px_rgba(0,0,0,0.8)]">
              View Masterpiece
            </span>
          </div>
        </Link>
      </div>

      {/* Info Content */}
      <div className="p-8 flex flex-col items-center text-center relative z-10 min-h-[220px]">
        <div className="mb-3">
          <span className="text-[#D4AF37] text-[10px] uppercase tracking-[0.5em] font-bold opacity-60">
            {product.category}
          </span>
        </div>
        
        <Link 
          href={`/product/${product.productId || product._id}`} 
          className="font-outfit text-2xl mb-3 text-[#F5F5F5] font-black hover:gold-gradient-text transition-all duration-700 line-clamp-1 uppercase tracking-tight w-full"
        >
          {product.name}
        </Link>
        
        <div className="flex flex-col items-center flex-1">
          <div className="flex items-center gap-2 mb-1">
            {product.originalPrice > product.price && (
              <span className="text-[10px] text-[#555] uppercase tracking-[0.2em] line-through">
                ₹{(product.originalPrice || 0).toLocaleString()}
              </span>
            )}
            <span className="gold-gradient-text text-2xl font-black tracking-tighter">
              ₹{(product.price || 0).toLocaleString()}
            </span>
          </div>
          <div className="h-[0.5px] w-12 bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent"></div>
          {product.orderCount && product.orderCount > 0 ? (
            <span className="mt-1.5 text-[9px] uppercase tracking-[0.3em] text-[#555] font-black">
              {product.orderCount} order{product.orderCount !== 1 ? 's' : ''}
            </span>
          ) : <span className="mt-1.5 text-[9px] invisible select-none">·</span>}
        </div>
        
        <div className="w-full mt-5">
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className={`w-full py-5 ${
              product.stock === 0
                ? 'bg-black border border-white/10 text-[#444] cursor-not-allowed'
                : itemInCart
                  ? 'bg-black border border-[#D4AF37] text-[#D4AF37]'
                  : 'bg-gradient-to-r from-[#C59B27] via-[#FFF3A3] to-[#A37B1B] text-black shadow-[0_15px_30px_-10px_rgba(212,175,55,0.4)]'
            } rounded-full uppercase tracking-[0.4em] text-[10px] font-black group/btn relative overflow-hidden active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer`}
          >
            <ShoppingCart size={14} strokeWidth={2.5} />
            {product.stock === 0 ? "Out of Stock" : justAdded ? "Added to Cart!" : itemInCart ? "In Your Cart" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col glass-card bg-[rgba(17,17,17,0.9)] overflow-hidden animate-pulse">
      <div className="h-[280px] bg-[#161616] rounded-t-[16px]"></div>
      <div className="p-6 flex flex-col items-center">
        <div className="h-3 w-24 bg-[#161616] rounded-full -mt-4 mb-4 border border-[#D4AF37]/20"></div>
        <div className="h-6 w-3/4 bg-[#161616] mb-3 rounded"></div>
        <div className="h-6 w-1/2 bg-[#161616] mb-6 rounded"></div>
        <div className="h-10 w-full bg-[#161616] rounded-full"></div>
      </div>
    </div>
  );
}
