import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { products } from "@/data/products";
import { ProductCard } from "@/components/ProductCard";
import { GoldenBackground } from "@/components/GoldenBackground";
import { useStore, Category } from "@/context/StoreContext";

const fadeInUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };
const staggerChildren = { visible: { transition: { staggerChildren: 0.1 } } };

export default function Home() {
  const { categories, products: allProducts } = useStore();
  const [featuredIds, setFeaturedIds] = useState<string[]>([]);
  const [signatureCollections, setSignatureCollections] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/homepage`)
      .then(r => r.json())
      .then(d => {
        if (d.featuredProductIds?.length) setFeaturedIds(d.featuredProductIds);
        if (d.signatureCollections?.length) setSignatureCollections(d.signatureCollections);
      })
      .catch(() => {});
  }, []);

  // Only show admin-selected products — no fallback to avoid showing random items
  const trendingProducts = featuredIds.length > 0
    ? allProducts.filter(p => featuredIds.includes(p._id))
    : [];

  // Signature collections: use admin config or fallback to defaults
  const defaultCollections = [
    { name: "Royal Rings", url: "/shop?category=Rings", tag: "Ethereal", image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800", skew: "[clip-path:polygon(0_0,100%_0,92%_100%,0_100%)]", hoverSkew: "[clip-path:polygon(0_0,100%_0,100%_100%,0_100%)]" },
    { name: "Necklaces", url: "/shop?category=Necklaces", tag: "Celestial", image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800", skew: "[clip-path:polygon(8%_0,100%_0,100%_100%,0_100%)]", hoverSkew: "[clip-path:polygon(0_0,100%_0,100%_100%,0_100%)]" },
    { name: "Bracelets", url: "/shop?category=Bracelets", tag: "Artisan", image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800", skew: "[clip-path:polygon(0_0,92%_0,100%_100%,0_100%)]", hoverSkew: "[clip-path:polygon(0_0,100%_0,100%_100%,0_100%)]" },
    { name: "Earrings", url: "/shop?category=Earrings", tag: "Divine", image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800", skew: "[clip-path:polygon(0_0,100%_0,100%_100%,8%_100%)]", hoverSkew: "[clip-path:polygon(0_0,100%_0,100%_100%,0_100%)]" }
  ];
  const skewStyles = [
    { skew: "[clip-path:polygon(0_0,100%_0,92%_100%,0_100%)]", hoverSkew: "[clip-path:polygon(0_0,100%_0,100%_100%,0_100%)]" },
    { skew: "[clip-path:polygon(8%_0,100%_0,100%_100%,0_100%)]", hoverSkew: "[clip-path:polygon(0_0,100%_0,100%_100%,0_100%)]" },
    { skew: "[clip-path:polygon(0_0,92%_0,100%_100%,0_100%)]", hoverSkew: "[clip-path:polygon(0_0,100%_0,100%_100%,0_100%)]" },
    { skew: "[clip-path:polygon(0_0,100%_0,100%_100%,8%_100%)]", hoverSkew: "[clip-path:polygon(0_0,100%_0,100%_100%,0_100%)]" }
  ];
  const activeCollections = signatureCollections.length > 0
    ? signatureCollections.map((c, i) => ({
        ...defaultCollections[i],
        ...c,
        image: c.image || defaultCollections[i]?.image || '',
        ...skewStyles[i]
      }))
    : defaultCollections;

  return (
    <main className="w-full flex flex-col bg-transparent selection:bg-[#D4AF37] selection:text-black relative overflow-x-hidden">
      <GoldenBackground />
      {/* Hero Section */}
      <section className="relative h-screen min-h-[750px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={`${import.meta.env.BASE_URL}images/hero-bg.webp`}
            alt="Radhikarn Jewellery"
            className="w-full h-full object-cover scale-110 animate-[ken-burns_20s_ease_infinite_alternate] blur-[2px] brightness-75"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/40"></div>
          <div className="absolute inset-0 bg-[#050505]/30"></div>
        </div>
        
        {/* Floating Gold Silk (Integrated) */}
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden opacity-30">
          {[...Array(15)].map((_, i) => (
            <motion.div 
              key={i} 
              initial={{ x: "-100%", y: Math.random() * 100 + "%" }}
              animate={{ x: "200%" }}
              transition={{
                duration: Math.random() * 10 + 15,
                repeat: Infinity,
                delay: Math.random() * 10,
                ease: "linear"
              }}
              className="absolute h-px w-64 bg-gradient-to-r from-transparent via-rk-gold/30 to-transparent rotate-[-15deg]"
            />
          ))}
        </div>

        <div className="container mx-auto px-6 relative z-20 text-center flex flex-col items-center pt-32 md:pt-48 pb-24">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerChildren}
            className="max-w-6xl w-full"
          >
            <motion.h1 
              className="text-5xl sm:text-7xl lg:text-[8rem] xl:text-[10rem] font-display font-medium leading-[0.9] mb-8 text-white items-center justify-center flex flex-col relative tracking-widest uppercase"
            >
              <div className="overflow-hidden flex relative">
                {"Elegance".split("").map((char, i) => (
                  <motion.span
                    key={i}
                    custom={i}
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ 
                      delay: 0.5 + (i * 0.08), 
                      duration: 1, 
                      ease: "easeOut" 
                    }}
                    className="inline-block relative hover:text-rk-gold transition-colors duration-500"
                  >
                    {char}
                  </motion.span>
                ))}
              </div>
              <div className="flex flex-col items-center -mt-2 md:-mt-10">
                <motion.span 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.5, duration: 1.5, ease: "easeOut" }}
                  className="gold-gradient-text italic font-medium tracking-normal font-cormorant lowercase text-4xl sm:text-6xl lg:text-7xl xl:text-8xl relative inline-block drop-shadow-xl"
                >
                  redefined
                </motion.span>
              </div>
            </motion.h1>
            
            <motion.p 
              variants={fadeInUp} 
              className="text-[#F5F5F5] text-sm md:text-lg lg:text-xl font-cormorant font-light tracking-[0.25em] mb-12 max-w-3xl mx-auto leading-tight italic drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] px-4"
            >
              Crafting dreams into gold. Discover the ultimate expression of luxury and timeless heritage.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/shop" className="group overflow-hidden rounded-full">
                <div className="gold-gradient text-black font-black uppercase tracking-[0.25em] text-[10px] px-10 py-4 transition-all duration-500 shadow-[0_15px_30px_rgba(212,175,55,0.15)] hover:scale-105 active:scale-95">
                  Explore Mastery
                </div>
              </Link>
              <Link href="/about" className="group">
                <div className="rounded-full backdrop-blur-md border border-[#D4AF37]/60 text-white font-black uppercase tracking-[0.25em] text-[10px] px-10 py-4 transition-all duration-500 hover:bg-[#D4AF37]/10 hover:border-[#D4AF37] hover:scale-105 active:scale-95 text-center">
                  Our Heritage
                </div>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Narrative Hint */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3, duration: 1.5 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-4 hidden md:flex"
        >
          <div className="w-[1px] h-12 bg-gradient-to-b from-rk-gold to-transparent"></div>
          <span className="text-[8px] uppercase tracking-[0.5em] text-rk-gold/50 font-black">Descend to Discovery</span>
        </motion.div>

        <style>{`
          @keyframes ken-burns {
            0% { transform: scale(1); }
            100% { transform: scale(1.15); }
          }
        `}</style>
      </section>

      <section className="py-12 md:py-20 relative overflow-hidden bg-transparent">
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#D4AF37] blur-[120px] rounded-full opacity-[0.08]"></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col items-center mb-16 md:mb-24 text-center">
            {/* Corner Bracket (Top-Left) */}
            <div className="absolute -top-10 -left-10 w-24 h-24 border-t border-l border-[#D4AF37]/20 rounded-none pointer-events-none hidden lg:block"></div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
              className="flex items-center gap-4 mb-6"
            >
              <div className="w-8 h-[1px] bg-[#D4AF37]/60"></div>
              <span className="text-[#D4AF37] text-[10px] uppercase tracking-[0.6em] font-black opacity-80">Curated Masterpieces</span>
              <div className="w-8 h-[1px] bg-[#D4AF37]/60"></div>
            </motion.div>
            <h2 className="text-4xl sm:text-5xl lg:text-7xl font-display uppercase tracking-tight text-[#F5F5F5] font-black leading-none">
              Signature <br/>
              <span className="gold-gradient-text italic font-medium lowercase tracking-normal font-cormorant text-4xl sm:text-5xl lg:text-[6rem]">Collections</span>
            </h2>
          </div>

          <div className="relative max-w-4xl mx-auto py-8 pb-8 md:py-20 md:pb-40">
            <div className="grid grid-cols-2 gap-4 md:gap-10 md:gap-14 relative z-10">
              {/* True Mathematical Gap Lattice */}
              <div className="absolute inset-0 pointer-events-none z-0">
                {/* 1. Horizontal Thread (Properly Masked & Contained Shimmer) */}
                <div 
                  className="absolute top-1/2 left-0 right-0 h-[1.5px] -translate-y-1/2 overflow-hidden pointer-events-none"
                  style={{ maskImage: "linear-gradient(to right, transparent 5%, black 20%, black 80%, transparent 95%)", WebkitMaskImage: "linear-gradient(to right, transparent 5%, black 20%, black 80%, transparent 95%)" }}
                >
                  <div className="absolute inset-0 bg-[#D4AF37]/30"></div>
                  <motion.div 
                    animate={{ left: ["-30%", "100%"] }}
                    transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
                    className="absolute top-0 bottom-0 w-1/4 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent shadow-[0_0_20px_#D4AF37]"
                  />
                </div>

                {/* 2. Precision Vertical Lines & Jewel Hub */}
                <svg className="w-full h-full absolute inset-0" style={{ overflow: "visible" }}>
                  <defs>
                    <linearGradient id="goldLatticeV" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="transparent" />
                      <stop offset="50%" stopColor="#D4AF37" />
                      <stop offset="100%" stopColor="transparent" />
                    </linearGradient>
                    <filter id="glowLattice">
                      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>

                  {/* Top Vertical Facet Thread */}
                  <line 
                    x1="51.9%" y1="0" 
                    x2="48.1%" y2="calc(50% - 28px)" 
                    stroke="url(#goldLatticeV)" strokeWidth="1.5"
                    filter="url(#glowLattice)"
                  />
                  {/* Middle Gap Thread */}
                  <line 
                    x1="48.1%" y1="calc(50% - 28px)" 
                    x2="48.1%" y2="calc(50% + 28px)" 
                    stroke="#D4AF37" strokeWidth="1.5"
                    strokeOpacity="0.8"
                    filter="url(#glowLattice)"
                  />
                  {/* Bottom Vertical Facet Thread */}
                  <line 
                    x1="48.1%" y1="calc(50% + 28px)" 
                    x2="51.9%" y2="100%" 
                    stroke="url(#goldLatticeV)" strokeWidth="1.5"
                    filter="url(#glowLattice)"
                  />

                  {/* 3. Perfect Jewel Hub (Nested SVG guarantees 100% sub-pixel mathematical centering) */}
                  <svg x="48.1%" y="50%" style={{ overflow: "visible" }}>
                    <g filter="url(#glowLattice)">
                      {/* Delicate crosshairs spanning outwards slightly */}
                      <line x1="-18" y1="0" x2="18" y2="0" stroke="#D4AF37" strokeWidth="0.5" />
                      <line x1="0" y1="-18" x2="0" y2="18" stroke="#D4AF37" strokeWidth="0.5" />
                      
                      {/* Dark Outer Hub Frame */}
                      <polygon points="0,-10 10,0 0,10 -10,0" fill="#0A0A0A" stroke="#D4AF37" strokeWidth="1.5" />
                      
                      {/* Inner Gold Hub Core */}
                      <motion.polygon 
                        points="0,-4 4,0 0,4 -4,0" 
                        fill="#D4AF37"
                        animate={{ scale: [0.7, 1.1, 0.7], opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      />
                    </g>
                  </svg>
                </svg>
              </div>

              {activeCollections.map((col, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: i * 0.1 }}
                  whileHover={{ scale: 1.02, zIndex: 40 }}
                  className="relative group cursor-pointer"
                >
                  <Link href={col.url} className="absolute inset-0 z-40" />
                  
                  {/* Precision Clipped Golden Border (The 'Lattice') */}
                  <div className={`absolute -inset-[1px] bg-gradient-to-tr from-[#D4AF37]/20 via-[#D4AF37]/60 to-[#D4AF37]/20 transition-all duration-1000 ${col.skew} group-hover:${col.hoverSkew} -z-10`}></div>
                  
                  {/* Main Faceted Card */}
                  <div className={`relative h-[200px] md:h-[420px] w-full overflow-hidden bg-[#0A0A0A] transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${col.skew} group-hover:${col.hoverSkew} shadow-2xl`}>
                    
                    {/* Parallax Image Engine */}
                    {col.image && (
                    <motion.img 
                      src={col.image} 
                      alt={col.name} 
                      className="absolute inset-0 w-full h-full object-cover grayscale-[0.8] group-hover:grayscale-0 group-hover:scale-110 brightness-[0.35] group-hover:brightness-[0.75] transition-all duration-[3s] ease-out" 
                    />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-80 group-hover:opacity-40 transition-opacity duration-1000"></div>
                    
                    {/* Boutique Content Overlay */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-10 text-center">
                      <motion.span 
                        className="text-[#D4AF37] text-[9px] uppercase tracking-[0.7em] mb-4 font-black opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-6 transition-all duration-1000"
                      >
                        {col.tag}
                      </motion.span>
                      <h3 className="text-lg md:text-4xl font-display text-white uppercase tracking-widest font-black leading-none drop-shadow-[0_0_15px_rgba(0,0,0,0.5)] group-hover:gold-gradient-text transition-all duration-1000 transform group-hover:scale-110">
                        {col.name}
                      </h3>
                      <div className="mt-6 w-0 h-[1px] bg-[#D4AF37] group-hover:w-16 transition-all duration-1000"></div>
                    </div>

                    {/* Elite Multi-Layer Flare */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[#D4AF37]/10 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-[3s] ease-in-out pointer-events-none"></div>
                  </div>

                  {/* Glassmorphic Interaction Light */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#D4AF37]/5 blur-[120px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 -z-20"></div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories (Elevated Dynamic Design) */}
      <section className="py-12 md:py-20 relative overflow-hidden bg-transparent">
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-28">
            <h2 className="text-4xl md:text-5xl lg:text-7xl font-display uppercase tracking-[0.4em] text-[#F5F5F5] font-black drop-shadow-2xl">
              THE BOUTIQUE <br className="md:hidden" />
              <span className="gold-gradient-text italic font-medium lowercase tracking-normal font-cormorant">Archive</span>
            </h2>
            <div className="mt-8 flex items-center justify-center gap-4">
               <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#D4AF37]/50" />
               <span className="text-[#D4AF37] text-[8px] uppercase tracking-[0.6em] font-black opacity-60">Discover curated excellence</span>
               <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#D4AF37]/50" />
            </div>
          </div>
          
          {categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center mb-6">
                <Sparkles size={24} className="text-[#D4AF37]/40" />
              </div>
              <p className="text-[#444] text-[10px] uppercase tracking-[0.5em] font-black">No collections available yet</p>
            </div>
          ) : (
            <>
              <div className="flex flex-row overflow-x-auto gap-8 md:flex-wrap md:justify-center md:gap-10 lg:gap-20 w-full mb-4 md:mb-12 pb-4 md:pb-0 no-scrollbar -mx-6 px-6 md:mx-0 md:px-0">
                {categories.map((cat: Category, i: number) => (
                  <motion.div
                    key={cat._id || i}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 1, ease: "easeOut" }}
                  >
                    <Link
                      href={`/shop?category=${cat.name}`}
                      className="group flex flex-col items-center"
                    >
                      <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full shrink-0 glass-card border-[0.5px] border-[#D4AF37]/20 flex items-center justify-center group-hover:border-[#D4AF37]/60 transition-all duration-700 relative overflow-hidden group-hover:-translate-y-6 group-hover:shadow-[0_40px_80px_rgba(212,175,55,0.25)] group-active:scale-95">
                        <div className="absolute inset-0 z-0">
                           <img 
                            src={cat.image.startsWith('http') ? cat.image : `http://localhost:5000${cat.image}`} 
                            alt={cat.name} 
                            className="w-full h-full object-cover grayscale-[0.6] group-hover:grayscale-0 group-hover:scale-125 transition-all duration-1000 brightness-[0.4] group-hover:brightness-[0.7]" 
                           />
                           <div className="absolute inset-0 bg-gradient-to-tr from-black via-transparent to-[#D4AF37]/10 opacity-60 group-hover:opacity-40 transition-opacity duration-1000"></div>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[#D4AF37]/5 to-[#D4AF37]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 z-10"></div>
                      </div>
                      <div className="mt-10 text-center">
                        <h3 className="font-display uppercase tracking-[0.3em] text-[10px] text-[#D4AF37] mb-2 font-black group-hover:gold-gradient-text transition-all duration-700 translate-y-3 group-hover:translate-y-0">{cat.name}</h3>
                        <p className="text-[9px] uppercase tracking-[0.4em] text-[#555] group-hover:text-[#F5F5F5]/60 transition-colors duration-500 font-bold whitespace-nowrap">
                           {cat.count ? `${cat.count} Masterpieces` : "Explore Archive"}
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Mobile scroll indicator */}
              <div className="flex md:hidden justify-center items-center gap-2 mb-8 opacity-60">
                <div className="h-px w-8 bg-gradient-to-r from-transparent to-[#D4AF37]/60"></div>
                <span className="text-[#D4AF37] text-[8px] uppercase tracking-[0.4em] font-black">Scroll to explore</span>
                <div className="h-px w-8 bg-gradient-to-l from-transparent to-[#D4AF37]/60"></div>
              </div>
            </>
          )}

        </div>
      </section>

      {/* Trending (Cinematic Discovery Carousel) */}
      <section className="py-12 md:py-24 relative bg-transparent overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
           <div className="absolute top-1/2 left-0 w-96 h-96 bg-[#D4AF37]/5 blur-[150px] -translate-x-1/2 -translate-y-1/2"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 md:mb-24 gap-4 md:gap-8">
            <div className="max-w-2xl">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="flex items-center gap-4 mb-8"
              >
                <div className="h-[1px] w-12 bg-rk-gold/50" />
                <span className="text-rk-gold text-[10px] uppercase tracking-[0.5em] font-black">Trending Excellence</span>
              </motion.div>
              <h2 className="text-5xl md:text-8xl font-display uppercase tracking-tighter text-[#F5F5F5] leading-[0.85] font-black">
                Living <br/><span className="gold-gradient-text italic font-medium lowercase font-cormorant tracking-normal text-6xl md:text-[7.5rem]">Masterpieces</span>
              </h2>
            </div>
            
            <Link href="/shop?sort=popular" className="group flex items-center gap-6 mb-4">
              <span className="text-[10px] uppercase tracking-[0.5em] text-[#D4AF37] font-black group-hover:text-white transition-colors">Digital Catalogue</span>
              <div className="w-12 h-12 rounded-full border border-rk-gold/30 flex items-center justify-center group-hover:bg-rk-gold transition-all duration-500">
                 <ArrowRight size={16} className="text-rk-gold group-hover:text-black transition-colors" />
              </div>
            </Link>
          </div>

          {trendingProducts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col items-center justify-center py-20 text-center border border-[#D4AF37]/10 rounded-3xl bg-[#D4AF37]/[0.02]"
            >
              <div className="w-16 h-16 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center mb-6">
                <Sparkles size={24} className="text-[#D4AF37]/40" />
              </div>
              <p className="text-white text-lg font-display uppercase tracking-widest mb-2">No Featured Products</p>
              <p className="text-[#444] text-[10px] uppercase tracking-[0.4em] font-black mb-8">Featured products haven't been set yet</p>
              <Link href="/shop" className="flex items-center gap-3 px-8 py-3 border border-[#D4AF37]/30 text-[#D4AF37] text-[10px] uppercase tracking-[0.3em] font-black hover:bg-[#D4AF37] hover:text-black transition-all rounded-full">
                Browse All Products <ArrowRight size={13} />
              </Link>
            </motion.div>
          ) : (
            <div 
              id="trending-scroll"
              className="overflow-x-auto pb-24 -mx-6 px-6 md:-mx-10 md:px-10 snap-x snap-mandatory luxury-scrollbar scroll-smooth"
            >
              <div className="flex gap-4 md:gap-12 w-max px-4">
                 {trendingProducts.map((product: any, i: number) => (
                   <motion.div
                     key={product._id || product.id || i}
                     initial={{ opacity: 0, x: 100 }}
                     whileInView={{ opacity: 1, x: 0 }}
                     viewport={{ once: true, margin: "0px 0px -100px 0px" }}
                     transition={{ 
                       delay: i * 0.1, 
                       duration: 1.2, 
                       ease: [0.22, 1, 0.36, 1] 
                     }}
                     className="w-[160px] sm:w-[280px] md:w-[420px] snap-center shrink-0"
                   >
                     <ProductCard product={product} />
                   </motion.div>
                 ))}
                 <div className="w-[10vw]" />
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="py-24 relative bg-[#050505] overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-16 md:gap-24">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
              className="flex-1 space-y-10"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-px bg-rk-gold" />
                <span className="text-rk-gold text-[10px] uppercase tracking-[0.6em] font-black italic">The Legacy Narrative</span>
              </div>
              <h3 className="text-4xl md:text-6xl font-display text-white leading-tight uppercase tracking-tighter">
                Crafting the Soul of <br/><span className="gold-gradient-text italic font-medium font-cormorant tracking-normal lowercase text-5xl md:text-7xl">Tradition</span>
              </h3>
              <p className="text-[#888] text-lg max-w-xl font-light italic leading-relaxed tracking-wide">
                Since our inception in the heart of artistry, every grain of gold and every faceted stone has been a testament to our pursuit of absolute perfection.
              </p>
            </motion.div>

            <div className="flex flex-wrap items-center gap-12 md:gap-24">
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2 }}
                viewport={{ once: true }}
                className="flex flex-col gap-4 text-center group"
              >
                <span className="text-7xl md:text-[9rem] font-luxury-num font-black tracking-normal gold-gradient-text leading-none group-hover:scale-105 transition-transform duration-1000">1998</span>
                <div className="flex flex-col items-center">
                  <div className="h-px w-10 bg-rk-gold/30 mb-4" />
                  <span className="text-rk-gold/60 text-[10px] uppercase tracking-[0.6em] font-black">Established</span>
                </div>
              </motion.div>

              <div className="hidden lg:block w-px h-32 bg-gradient-to-b from-transparent via-rk-gold/20 to-transparent" />

              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, delay: 0.2 }}
                viewport={{ once: true }}
                className="flex flex-col gap-4 text-center group"
              >
                <span className="text-7xl md:text-[9rem] font-luxury-num font-black tracking-normal gold-gradient-text leading-none group-hover:scale-105 transition-transform duration-1000">25K+</span>
                <div className="flex flex-col items-center">
                  <div className="h-px w-10 bg-rk-gold/30 mb-4" />
                  <span className="text-rk-gold/60 text-[10px] uppercase tracking-[0.6em] font-black">Masterpieces Crafted</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Ambient Light */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-rk-gold opacity-[0.03] blur-[150px] rounded-full pointer-events-none overflow-hidden"></div>
      </section>

      {/* Heritage Showcase Section */}
      <section className="py-16 md:py-20 relative overflow-hidden bg-transparent">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] bg-[#D4AF37]/5 blur-[150px] rounded-full opacity-50"></div>
          <div className="absolute inset-0 opacity-[0.02] bg-[url('https://www.transparenttextures.com/patterns/black-linen.png')]"></div>
        </div>
        <div className="container mx-auto px-10 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerChildren}
            className="flex flex-col lg:flex-row items-center gap-12 lg:gap-32"
          >
            <motion.div variants={fadeInUp} className="flex-1 relative order-2 lg:order-1 select-none w-full">
              <div className="w-full aspect-[4/5] max-w-[550px] mx-auto relative group overflow-hidden sm:overflow-visible">
                <div className="absolute -inset-2 sm:-inset-8 border-[0.5px] border-[#D4AF37]/10 group-hover:border-[#D4AF37]/40 transition-all duration-[2s] rounded-sm"></div>
                <div className="absolute -inset-1 sm:-inset-4 border-[0.5px] border-[#D4AF37]/20 group-hover:border-[#D4AF37]/60 transition-all duration-[1.5s] rounded-sm"></div>
                <div className="w-full h-full overflow-hidden relative shadow-2xl">
                  <img 
                    src={`${import.meta.env.BASE_URL}images/about-craft.png`} 
                    alt="Master Artisan" 
                    className="w-full h-full object-cover transition-all duration-[3s] grayscale-[0.8] brightness-75 group-hover:grayscale-0 group-hover:brightness-100 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
                </div>
                <div className="absolute -bottom-6 -right-6 sm:-bottom-10 sm:-right-10 glass-card p-6 sm:p-10 hidden md:block border-[#D4AF37]/30 transform group-hover:-translate-x-4 group-hover:-translate-y-4 transition-transform duration-1000">
                  <span className="text-2xl sm:text-4xl font-display text-[#D4AF37] block mb-2 font-black">Est. 1998</span>
                  <span className="text-[8px] sm:text-[10px] uppercase tracking-[0.4em] text-[#F5F5F5] font-bold">Heritage in Gold</span>
                </div>
              </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="flex-1 text-left order-1 lg:order-2 w-full">
              <div className="flex items-center gap-5 mb-8 md:mb-10">
                <div className="h-[0.5px] w-12 bg-[#D4AF37]"></div>
                <span className="text-[#D4AF37] text-[10px] uppercase tracking-[0.6em] font-black block">The Legacy</span>
              </div>
              <h2 className="text-4xl sm:text-5xl lg:text-[6rem] font-display mb-8 md:mb-12 leading-[0.9] text-[#F5F5F5] font-black tracking-tighter">
                Ancestral <br className="hidden md:block" /> Hands, <br/><span className="gold-gradient-text italic font-bold">Divine Soul</span>
              </h2>
              <p className="text-[#B5B5B5] text-lg md:text-xl leading-relaxed mb-12 md:mb-16 font-light tracking-widest max-w-xl italic opacity-80">
                Each curve of gold tells a thousand-year story. Since 1998, Radhikarn Jewellery hasn't just crafted art; we've preserved the soul of Indian artistry, passing down masterpieces from one generation's heart to another's beauty.
              </p>
              <div className="flex flex-col sm:flex-row gap-10 items-center">
                <Link
                  href="/about"
                  className="inline-block py-6 px-16 gold-gradient text-black uppercase tracking-[0.5em] text-[11px] font-black transition-all hover:glow-gold saturate-150 rounded-none w-full sm:w-auto text-center"
                >
                  Our Philosophy
                </Link>
                <div className="hidden sm:block h-[1px] w-24 bg-gradient-to-r from-[#D4AF37] to-transparent"></div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Feature Pillars (Luxury Version) */}
      <section className="py-12 md:py-16 bg-transparent relative">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16">
            {[
              { title: "Hallmark Sovereign", icon: "✦", desc: "100% BIS Hallmarked authentic 22kt & 24kt gold and certified diamonds." },
              { title: "Imperial Shipping", icon: "❖", desc: "Complimentary, fully insured global delivery with real-time white-glove tracking." },
              { title: "Eternal Warranty", icon: "✧", desc: "Hassle-free 30-day exchange and lifetime buyback guarantee on every piece." }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.8 }}
                className="group relative flex flex-col items-center bg-transparent border-none p-6 md:p-10 text-center"
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#111] to-[#050505] border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] text-3xl mb-8 md:mb-10 shadow-2xl group-hover:scale-110 group-hover:border-[#D4AF37] group-hover:glow-gold transition-all duration-700 relative overflow-hidden">
                  <div className="absolute inset-0 gold-gradient opacity-0 group-hover:opacity-10 transition-opacity"></div>
                  {feature.icon}
                </div>
                <h3 className="font-display uppercase tracking-[0.4em] text-sm text-[#F5F5F5] mb-4 font-black group-hover:gold-gradient-text transition-all duration-700">{feature.title}</h3>
                <p className="text-[#888] text-[10px] uppercase tracking-[0.2em] leading-relaxed max-w-[250px] group-hover:text-[#AAA] transition-colors">{feature.desc}</p>
                <div className="mt-8 h-[0.5px] w-8 bg-[#D4AF37]/30 group-hover:w-16 transition-all duration-700"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* Enhanced Footer Divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rotate-45 border border-[#D4AF37]/50 bg-[#050505]"></div>
      </div>
    </main>
  );
}
