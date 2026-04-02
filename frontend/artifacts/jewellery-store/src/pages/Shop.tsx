import { useState, useMemo, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import { useStore, Product } from "@/context/StoreContext";
import { Filter, X, ChevronDown, ChevronRight, ChevronLeft, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GoldenBackground } from "@/components/GoldenBackground";

const SORTS = [
  { label: "Popularity", value: "popular" },
  { label: "Newest", value: "new" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
];
const ITEMS_PER_PAGE = 12;

export default function Shop() {
  const { searchQuery, setSearchQuery, products, categories, loading: storeLoading, refreshProducts } = useStore();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const CATEGORY_NAMES = ["All", ...categories.map(c => c.name)];

  // Parse URL params — only used for intentional external links (e.g. homepage category buttons)
  const [location] = useLocation();
  const queryParams = new URLSearchParams(window.location.search);
  const initialCat = queryParams.get('category') || "All";

  // State
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("popular");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [localPriceRange, setLocalPriceRange] = useState<[number, number]>([0, 100000]);
  const [page, setPage] = useState(1);
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);

  // Close sort dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fake loading effect — only re-trigger on filter/sort/page changes, NOT on stock refresh
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, [category, sort, priceRange, searchQuery, page]);

  // Smart scroll to gallery top
  useEffect(() => {
    const gridEl = document.getElementById("gallery-start");
    if (gridEl) {
      const currentScroll = window.scrollY;
      const targetY = gridEl.getBoundingClientRect().top + currentScroll - 120;
      if (currentScroll > targetY || page > 1) {
        window.scrollTo({ top: targetY, behavior: 'smooth' });
      }
    }
  }, [category, sort, priceRange, searchQuery, page]);

  // Adjust sidebar bottom when footer is visible
  useEffect(() => {
    const footer = document.querySelector("footer");
    if (!footer) return;
    const update = () => {
      if (!sidebarRef.current) return;
      const footerTop = footer.getBoundingClientRect().top;
      const windowH = window.innerHeight;
      const navH = 80;
      if (footerTop < windowH) {
        const newHeight = footerTop - navH;
        sidebarRef.current.style.height = `${Math.max(0, newHeight)}px`;
      } else {
        sidebarRef.current.style.height = `${windowH - navH}px`;
      }
    };
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  // Fetch fresh stock once on mount + on tab refocus (not on every render)
  useEffect(() => {
    refreshProducts();
    const onVisible = () => { if (document.visibilityState === 'visible') refreshProducts(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync state when URL changes externally
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const urlCat = queryParams.get('category');
    if (urlCat && urlCat !== category) {
      setCategory(urlCat);
      setPage(1);
    }
  }, [location]);

  // Handle local search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (localSearch) {
      setCategory("All");
      setPriceRange([0, 100000]);
      setLocalPriceRange([0, 100000]);
    }
    setSearchQuery(localSearch);
    setPage(page);
    setPage(1);
  };

  // Filtering & Sorting
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (searchQuery) {
      result = result.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    if (category !== "All") {
      result = result.filter(p => p.category === category);
    }

    result = result.filter(p => p.price >= priceRange[0] && (priceRange[1] >= 100000 ? p.price >= priceRange[0] : p.price <= priceRange[1]));

    switch (sort) {
      case "price_asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "new":
        result.sort((a, b) => (a.isNew === b.isNew ? 0 : a.isNew ? -1 : 1));
        break;
      case "popular":
      default:
        result.sort((a, b) => (a.isPopular === b.isPopular ? 0 : a.isPopular ? -1 : 1));
        break;
    }

    return result;
  }, [category, sort, priceRange, searchQuery, products]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const currentProducts = filteredProducts.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);


  return (
    <div className="relative min-h-screen bg-transparent">
      <GoldenBackground />

      {/* Full page layout: sidebar fixed left, content offset right */}
      <div className="flex min-h-screen pt-20">

        {/* ── SIDEBAR ── truly fixed on desktop, slide-in on mobile */}
        <aside ref={sidebarRef} className={`
          fixed inset-0 z-50 bg-[#050505]/98 backdrop-blur-3xl overflow-y-auto
          lg:fixed lg:top-20 lg:left-0 lg:h-[calc(100vh-80px)] lg:overflow-y-auto
          lg:w-[280px] xl:w-[300px]
          lg:bg-[#0a0a0a]
          lg:border-r lg:border-[#D4AF37]/10
          lg:translate-x-0 lg:opacity-100
          lg:z-30
          transition-all duration-300
          ${isFilterOpen ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0 lg:translate-x-0 lg:opacity-100"}
        `}>
          {/* Gold top accent line */}
          <div className="hidden lg:block h-[2px] w-full bg-gradient-to-r from-transparent via-[#D4AF37]/60 to-transparent" />

          <div className="p-6 flex flex-col gap-7">
            {/* Mobile close */}
            <div className="flex justify-between items-center lg:hidden">
              <h2 className="font-display text-4xl tracking-tighter text-[#F5F5F5] font-black italic">Refine</h2>
              <button onClick={() => setIsFilterOpen(false)} className="text-[#D4AF37] p-2">
                <X size={32} />
              </button>
            </div>

            {/* Sidebar brand label - desktop only */}
            <div className="hidden lg:flex flex-col gap-1 pt-2">
              <span className="text-[9px] text-[#D4AF37]/50 uppercase tracking-[0.6em] font-black">Filter Gallery</span>
              <div className="h-[1px] w-full bg-gradient-to-r from-[#D4AF37]/20 to-transparent" />
            </div>

            {/* Search */}
            <div className="flex flex-col gap-2">
              <span className="text-[9px] text-[#555] uppercase tracking-[0.5em] font-black">Search</span>
              <form onSubmit={handleSearch} className="relative group">
                <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#D4AF37]/40 group-focus-within:text-[#D4AF37]/70 transition-colors pointer-events-none" />
                <input
                  type="text"
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  placeholder="Search jewellery..."
                  className="w-full bg-white/[0.03] border border-white/8 rounded-lg py-2.5 pl-9 pr-9 text-[#F5F5F5] placeholder:text-[#333] outline-none focus:border-[#D4AF37]/40 focus:bg-white/[0.05] transition-all text-[11px] tracking-wider"
                />
                {localSearch && (
                  <button type="button" onClick={() => { setLocalSearch(""); setSearchQuery(""); setPage(1); }} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#555] hover:text-[#D4AF37] transition-colors">
                    <X size={12} />
                  </button>
                )}
              </form>
            </div>

            {/* Divider */}
            <div className="h-[1px] bg-white/5" />

            {/* Categories */}
            <div className="flex flex-col gap-2">
              <span className="text-[9px] text-[#555] uppercase tracking-[0.5em] font-black">Collections</span>
              <div className="flex flex-col gap-0.5">
                {CATEGORY_NAMES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => {
                      setCategory(cat);
                      if (cat !== "All") { setSearchQuery(""); setLocalSearch(""); setPriceRange([0, 100000]); setLocalPriceRange([0, 100000]); }
                      setPage(1);
                      setIsFilterOpen(false);
                    }}
                    className={`w-full flex items-center justify-between py-2.5 px-3 text-[10px] uppercase tracking-[0.35em] font-black transition-all relative rounded-lg ${
                      category === cat
                        ? "text-[#D4AF37] bg-[#D4AF37]/8"
                        : "text-[#3a3a3a] hover:text-[#888] hover:bg-white/[0.02]"
                    }`}
                  >
                    {category === cat && (
                      <motion.div layoutId="activeCat" className="absolute inset-0 rounded-lg border border-[#D4AF37]/20 bg-gradient-to-r from-[#D4AF37]/8 to-transparent" />
                    )}
                    <span className="relative z-10">{cat}</span>
                    {category === cat && (
                      <span className="relative z-10 w-1.5 h-1.5 rounded-full bg-[#D4AF37] shadow-[0_0_6px_#D4AF37]" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="h-[1px] bg-white/5" />

            {/* Price Range */}
            <div className="flex flex-col gap-3">
              <span className="text-[9px] text-[#555] uppercase tracking-[0.5em] font-black">Price Range</span>
              <div className="flex flex-col gap-4 bg-white/[0.02] border border-white/5 rounded-xl p-4">
                {/* Slider */}
                <div className="relative w-full h-[2px] bg-white/8 mt-5 rounded-full">
                  <div className="absolute h-full bg-gradient-to-r from-[#D4AF37]/60 to-[#D4AF37] rounded-full shadow-[0_0_8px_rgba(212,175,55,0.4)]" style={{ width: `${(localPriceRange[1] / 100000) * 100}%` }} />
                  <input
                    type="range" min="0" max="100000" step="500"
                    value={localPriceRange[1]}
                    onChange={(e) => setLocalPriceRange([localPriceRange[0], parseInt(e.target.value)])}
                    className="absolute inset-0 w-full opacity-0 cursor-pointer h-full z-10"
                  />
                  {(() => {
                    const pct = (localPriceRange[1] / 100000) * 100;
                    return (
                      <div className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-[#D4AF37] rounded-full shadow-[0_0_12px_rgba(212,175,55,0.7)] pointer-events-none border-2 border-[#050505]" style={{ left: `calc(${pct}% - 7px)` }}>
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#111] border border-[#D4AF37]/30 px-1.5 py-0.5 rounded text-[#D4AF37] text-[8px] font-black whitespace-nowrap">
                          ₹{localPriceRange[1].toLocaleString()}{localPriceRange[1] >= 100000 ? "+" : ""}
                        </div>
                      </div>
                    );
                  })()}
                </div>
                <div className="flex justify-between text-[9px] text-[#333] font-black tracking-widest">
                  <span>₹0</span>
                  <span>₹1L+</span>
                </div>
                <button
                  onClick={() => { setPriceRange(localPriceRange); setPage(1); setIsFilterOpen(false); }}
                  className="w-full py-2 bg-[#D4AF37]/8 border border-[#D4AF37]/25 hover:bg-[#D4AF37] hover:text-black text-[#D4AF37] transition-all text-[9px] uppercase tracking-[0.4em] font-black rounded-lg"
                >
                  Apply
                </button>
              </div>
            </div>

            {/* Reset */}
            <button
              onClick={() => { setCategory("All"); setPriceRange([0, 100000]); setLocalPriceRange([0, 100000]); setLocalSearch(""); setSearchQuery(""); setPage(1); setIsFilterOpen(false); }}
              className="w-full py-2.5 text-[#2a2a2a] hover:text-[#666] border border-white/5 hover:border-white/10 transition-all text-[9px] uppercase tracking-[0.4em] font-black rounded-lg"
            >
              Reset All
            </button>
          </div>

          {/* Bottom gold accent */}
          <div className="hidden lg:block h-[1px] w-full bg-gradient-to-r from-transparent via-[#D4AF37]/20 to-transparent mt-auto" />
        </aside>

        {/* ── MAIN CONTENT ── offset by sidebar width on desktop */}
        <div id="gallery-start" className="flex-1 flex flex-col px-4 lg:pl-[296px] xl:pl-[316px] lg:pr-8 pb-16 min-w-0 relative z-10">

          {/* Mobile filter button */}
          <div className="lg:hidden flex items-center pt-6 pb-4">
            <button
              onClick={() => setIsFilterOpen(true)}
              className="flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-3 uppercase tracking-[0.3em] text-[10px] text-[#F5F5F5] font-black rounded-xl"
            >
              <Filter size={13} className="text-[#D4AF37]" /> Filters
            </button>
          </div>

          {/* Control bar */}
          <div className="sticky top-20 z-40 bg-[#050505]/90 backdrop-blur-xl rounded-2xl border border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] mb-8 px-6 py-4 flex justify-between items-center gap-4">
            <div className="flex items-center gap-5">
              <div>
                <span className="text-[10px] text-[#555] tracking-[0.4em] uppercase font-bold block mb-0.5">
                  {searchQuery ? (
                    <div className="flex items-center gap-2">
                       Search: <span className="text-[#D4AF37]">"{searchQuery}"</span>
                    </div>
                  ) : (
                    category !== "All" ? category : "All Collections"
                  )}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-[#D4AF37] text-[11px] uppercase tracking-[0.3em] font-black">
                    {(isLoading || storeLoading) ? (
                      <span className="text-[#555]">Loading...</span>
                    ) : (
                      `${filteredProducts.length} Items Found`
                    )}
                  </span>
                  {(priceRange[0] > 0 || priceRange[1] < 100000) && (
                    <>
                      <div className="w-[1px] h-3 bg-white/10" />
                      <span className="text-[9px] text-[#777] uppercase tracking-[0.2em] font-black">
                        Range: <span className="text-[#D4AF37]/80">₹{priceRange[0].toLocaleString()} - ₹{priceRange[1].toLocaleString()}{priceRange[1] >= 100000 ? "+" : ""}</span>
                      </span>
                    </>
                  )}
                </div>
              </div>
              {totalPages > 1 && (
                <div className="h-8 w-[1px] bg-white/10 hidden sm:block" />
              )}
              {totalPages > 1 && (
                <div className="hidden sm:block">
                  <span className="text-[9px] text-[#555] tracking-[0.3em] uppercase font-bold block mb-0.5">Current Page</span>
                  <span className="text-[#F5F5F5] text-[10px] uppercase tracking-[0.2em] font-black">
                    Page <span className="text-[#D4AF37]">{page}</span> of {totalPages}
                  </span>
                </div>
              )}
            </div>

            <div ref={sortRef} className="relative">
              <button
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="flex items-center gap-3 bg-white/[0.02] border border-white/5 hover:border-white/10 px-5 py-2.5 rounded-lg transition-all"
              >
                <span className="text-[10px] text-[#AAA] uppercase tracking-[0.3em] font-black">
                  Sort: <span className="text-[#D4AF37]">{SORTS.find(s => s.value === sort)?.label}</span>
                </span>
                <ChevronDown size={13} className={`text-[#D4AF37] transition-transform ${isSortOpen ? "rotate-180" : ""}`} />
              </button>
              <div className={`absolute top-full right-0 mt-2 w-48 bg-[#080808]/98 backdrop-blur-2xl border border-white/10 rounded-xl overflow-hidden shadow-2xl transition-all ${isSortOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2"}`}>
                {SORTS.map(s => (
                  <button key={s.value} onClick={() => { setSort(s.value); setPage(1); setIsSortOpen(false); }}
                    className={`w-full text-left px-5 py-3 text-[9px] uppercase tracking-[0.3em] font-black transition-all border-l-2 ${sort === s.value ? "border-[#D4AF37] text-[#D4AF37] bg-white/[0.03]" : "border-transparent text-[#666] hover:text-[#DDD] hover:bg-white/[0.03]"}`}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Grid */}
          {(isLoading || storeLoading) ? (
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 9 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            </motion.div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-32">
              <Search size={40} className="mx-auto text-[#D4AF37]/30 mb-6" strokeWidth={1} />
              {products.length === 0 ? (
                <>
                  <h2 className="text-2xl font-display uppercase tracking-[0.3em] mb-4 text-[#F5F5F5] font-black">No Products Yet</h2>
                  <p className="text-[#555] text-xs uppercase tracking-[0.2em]">The catalog is empty — check back soon</p>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-display uppercase tracking-[0.3em] mb-4 text-[#F5F5F5] font-black">No Results</h2>
                  <p className="text-[#555] text-xs uppercase tracking-[0.2em] mb-8">Try adjusting your filters</p>
                  <button onClick={() => { setCategory("All"); setPriceRange([0, 100000]); setSearchQuery(""); setLocalSearch(""); }}
                    className="px-10 py-4 border border-[#D4AF37]/30 text-[#D4AF37] uppercase text-[10px] tracking-[0.4em] font-black hover:bg-[#D4AF37] hover:text-black transition-all">
                    Reset Filters
                  </button>
                </>
              )}
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {currentProducts.map((product, i) => (
                <motion.div key={product._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04, duration: 0.6 }}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-20 mb-16 py-10 gap-4 bg-gradient-to-b from-[#0a0a0a] to-[#050505] rounded-3xl border border-[#D4AF37]/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              <button 
                disabled={page === 1} 
                onClick={() => setPage(p => p - 1)}
                className="w-12 h-12 border border-[#D4AF37]/40 flex items-center justify-center disabled:opacity-10 disabled:cursor-not-allowed hover:bg-[#D4AF37]/10 hover:border-[#D4AF37] text-[#D4AF37] transition-all rounded-xl relative group overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-[#D4AF37]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <ChevronLeft size={20} strokeWidth={2.5} />
              </button>

              <div className="flex items-center gap-2 px-6 py-2 bg-white/[0.02] border border-white/5 rounded-2xl mx-2">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button 
                    key={i} 
                    onClick={() => setPage(i + 1)}
                    className={`w-10 h-10 border transition-all text-[12px] font-black rounded-xl relative group overflow-hidden ${
                      page === i + 1 
                        ? "bg-[#D4AF37] border-[#D4AF37] text-black shadow-[0_8px_20px_rgba(212,175,55,0.3)]" 
                        : "border-[#D4AF37]/20 text-[#D4AF37]/70 hover:border-[#D4AF37]/60 hover:text-[#D4AF37] hover:bg-white/[0.05]"
                    }`}
                  >
                    <span className="relative z-10">{i + 1}</span>
                    {page !== i + 1 && (
                      <div className="absolute inset-0 bg-gradient-to-tr from-[#D4AF37]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </button>
                ))}
              </div>

              <button 
                disabled={page === totalPages} 
                onClick={() => setPage(p => p + 1)}
                className="w-12 h-12 border border-[#D4AF37]/40 flex items-center justify-center disabled:opacity-10 disabled:cursor-not-allowed hover:bg-[#D4AF37]/10 hover:border-[#D4AF37] text-[#D4AF37] transition-all rounded-xl relative group overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-[#D4AF37]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <ChevronRight size={20} strokeWidth={2.5} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
