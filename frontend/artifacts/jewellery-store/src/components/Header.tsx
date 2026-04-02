import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Search, ShoppingCart, Heart, Menu, X, User as UserIcon, Phone, MapPin, Instagram, Facebook, Twitter, ArrowRight } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { motion, AnimatePresence } from "framer-motion";

export function Header() {
  const [location, setLocation] = useLocation();
  const { cart, wishlist, searchQuery, setSearchQuery, user } = useStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsMobileMenuOpen(false);
    };
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
       document.body.style.overflow = "hidden";
       document.documentElement.style.overflow = "hidden";
    } else {
       document.body.style.overflow = "auto";
       document.documentElement.style.overflow = "auto";
    }
  }, [isMobileMenuOpen]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
  }, [location, setLocation]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    if (isSearchOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSearchOpen]);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
    { name: "About", path: "/about" },
    ...(!user ? [{ name: "Track order", path: "/track" }] : []),
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      setIsMobileMenuOpen(false);
      setLocation("/shop");
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 overflow-visible ${
          isScrolled || isMobileMenuOpen
            ? "bg-[#050505]/95 backdrop-blur-xl border-b border-[#D4AF37]/10 py-3"
            : "bg-transparent border-b border-transparent py-5"
        }`}
      >
        <div className="container mx-auto px-6 md:px-10 flex items-center justify-between">
          
          {/* Mobile Toggle - LEFT */}
          <button
            className="lg:hidden text-[#D4AF37] p-2.5 rounded-xl bg-[#D4AF37]/5 border border-[#D4AF37]/20 flex flex-col gap-1.5 items-start shrink-0 active:scale-95 transition-all"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <div className="w-6 h-[1.2px] bg-current" />
            <div className="w-4 h-[1.2px] bg-current" />
          </button>

          {/* Brand Logo - CENTER on Mobile */}
          <div className="flex-1 flex justify-center lg:justify-start lg:flex-initial overflow-hidden">
            <Link href="/" className="flex items-center gap-3 md:gap-4 group cursor-pointer truncate max-w-full">
              <img src={`${import.meta.env.BASE_URL}images/logo.webp`} className="w-8 h-8 md:w-12 md:h-12 object-contain shrink-0" alt="Logo" />
              <div className="flex flex-col items-center leading-none uppercase font-display font-black">
                <span className="text-base md:text-2xl gold-gradient-text tracking-[0.4em]">RADHIKARN</span>
                <div className="flex items-center gap-3 w-full mt-1">
                  <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-[#D4AF37]/10" />
                  <span className="text-[6px] md:text-[8px] text-[#D4AF37]/80 tracking-[0.5em] font-black">JEWELLERY</span>
                  <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent via-[#D4AF37]/40 to-[#D4AF37]/10" />
                </div>
              </div>
            </Link>
          </div>

            <div className="hidden lg:flex items-center gap-2 flex-1 justify-center relative">
              {navLinks.map((link) => {
                const isActive = location === link.path;
                return (
                  <Link 
                    key={link.name} 
                    href={link.path} 
                    className={`relative group px-8 py-2.5 transition-all duration-500 rounded-full overflow-visible`}
                  >
                    {/* Sliding Vault Pill - High-Clarity Architecture */}
                    {isActive && (
                      <motion.div
                        layoutId="activeNavTab"
                        className="absolute inset-x-1 inset-y-1 bg-white/[0.04] border border-white/10 rounded-full -z-10 shadow-[0_0_20px_rgba(0,0,0,0.5)]"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      >
                         {/* Centered Jewel Indicator */}
                         <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
                            <div className="w-1.5 h-1.5 bg-[#D4AF37] rotate-45 shadow-[0_0_10px_#D4AF37] opacity-80" />
                         </div>
                      </motion.div>
                    )}

                    {/* Hover Ghost Pill */}
                    {!isActive && (
                      <div className="absolute inset-0 bg-white/0 group-hover:bg-white/[0.03] rounded-full transition-all duration-500 -z-20" />
                    )}
                    
                    <span className={`text-[10px] uppercase font-display font-black transition-all duration-500 relative z-10 block ${isActive ? "gold-gradient-text tracking-[0.4em] scale-105" : "text-white/40 tracking-[0.3em] group-hover:text-white"}`}>
                      {link.name}
                    </span>
                  </Link>
                );
              })}
            </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 md:gap-5 shrink-0">
            <div className="relative" ref={searchRef}>
              <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="text-[#D4AF37] p-2 hover:bg-white/5 rounded-full transition-all">
                <Search size={22} strokeWidth={1.5} />
              </button>
              <AnimatePresence>
                {isSearchOpen && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute top-14 right-0 w-64 bg-[#0f0f0f] border border-[#D4AF37]/20 rounded-2xl p-4 shadow-2xl glass-card">
                    <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
                       <Search size={14} className="text-[#D4AF37]/50" />
                       <input autoFocus type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..." className="bg-transparent text-xs text-white outline-none w-full placeholder:text-white/20" />
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="hidden lg:flex items-center gap-7">
              <Link href="/wishlist" className="text-[#D4AF37]/80 hover:text-[#D4AF37] relative transition-all">
                <Heart size={20} strokeWidth={1.5} />
                {wishlist.length > 0 && <span className="absolute -top-1.5 -right-1.5 gold-gradient text-black text-[8px] font-black h-4 w-4 rounded-full flex items-center justify-center">{wishlist.length}</span>}
              </Link>
              <Link href="/cart" className="flex items-center gap-3 group">
                <div className="relative p-2 border border-white/10 rounded-full group-hover:border-[#D4AF37]/50 transition-all">
                   <ShoppingCart size={18} strokeWidth={2} className="text-[#D4AF37]" />
                   {cart.length > 0 && <span className="absolute -top-1 -right-1 gold-gradient text-black text-[8px] font-black h-4 w-4 rounded-full flex items-center justify-center">{cart.length}</span>}
                </div>
                <div className="flex flex-col leading-none">
                   <span className="text-[10px] font-black gold-gradient-text uppercase">₹{cart.reduce((acc, i) => acc + i.price * i.quantity, 0).toLocaleString()}</span>
                </div>
              </Link>
              <Link 
                href={user ? "/account" : "/login"} 
                className={`flex items-center gap-2.5 rounded-full transition-all duration-500 overflow-hidden ${
                  user 
                    ? "bg-[#D4AF37]/5 border border-[#D4AF37]/10 pl-1 pr-5 py-1 hover:bg-[#D4AF37]/10 hover:border-[#D4AF37]/30" 
                    : "bg-[#D4AF37]/10 border border-[#D4AF37]/20 px-5 py-2 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black"
                }`}
              >
                {user ? (
                  <>
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-[#D4AF37]/30 shrink-0">
                       {user.avatar ? (
                         <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=1a1a1a&color=D4AF37&size=200`; }} />
                       ) : (
                         <div className="w-full h-full bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
                            <UserIcon size={12} />
                         </div>
                       )}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/90">
                      {user.name.split(" ")[0]}
                    </span>
                  </>
                ) : (
                  "Login"
                )}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE NAVIGATION MENU - STRICTLY 100VW / NO SCROLL */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 w-screen h-screen bg-[#050505] z-[999] lg:hidden flex flex-col pt-24 px-6 pb-6 overflow-x-hidden overflow-y-hidden select-none"
          >
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-full h-[30vh] bg-gradient-to-b from-[#D4AF37]/5 to-transparent pointer-events-none" />
            
            {/* Menu Top Bar */}
            <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10 h-12 overflow-hidden">
               <div className="flex flex-col items-center leading-none uppercase font-display font-black">
                  <span className="text-base gold-gradient-text tracking-[0.4em]">RADHIKARN</span>
                  <div className="flex items-center gap-3 w-full mt-1">
                     <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-[#D4AF37]/10" />
                     <span className="text-[6px] text-[#D4AF37]/80 tracking-[0.5em] font-black">JEWELLERY</span>
                     <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent via-[#D4AF37]/40 to-[#D4AF37]/10" />
                  </div>
               </div>
               <button onClick={() => setIsMobileMenuOpen(false)} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#D4AF37] active:scale-90 transition-all shrink-0 ml-4">
                  <X size={20} />
               </button>
            </div>

            {/* Content Body - Viewport Locked */}
            <div className="flex-1 flex flex-col justify-between mt-4 overflow-hidden w-full">
               
               {/* Search Bar */}
               <form onSubmit={handleSearchSubmit} className="relative mb-6 shrink-0 w-full">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Jewellery..."
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3.5 px-5 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#D4AF37]/40 transition-all font-bold"
                  />
                  <Search size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-[#D4AF37]/40" />
               </form>

               {/* Nav Links */}
               <nav className="flex flex-col gap-0.5 mb-6 overflow-hidden w-full">
                  <p className="text-[8px] font-black text-[#D4AF37]/40 uppercase tracking-[0.4em] mb-2 px-1">Navigation</p>
                  {navLinks.map((link, i) => (
                    <motion.div key={link.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="w-full">
                      <Link 
                        href={link.path} 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center justify-between text-2xl font-display uppercase font-bold py-2 px-1 w-full transition-all ${location === link.path ? "text-[#D4AF37]" : "text-white/90 hover:text-[#D4AF37]"}`}
                      >
                        {link.name}
                        <ArrowRight size={18} className={`transition-all duration-300 ${location === link.path ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}`} />
                      </Link>
                    </motion.div>
                  ))}
               </nav>

               {/* Grid Actions */}
               <div className="flex flex-col gap-2 mb-6 overflow-hidden w-full">
                  <p className="text-[8px] font-black text-[#D4AF37]/40 uppercase tracking-[0.4em] mb-1 px-1">Access</p>
                  
                  <div className="grid grid-cols-2 gap-2 w-full">
                     <Link href="/cart" onClick={() => setIsMobileMenuOpen(false)} className="bg-white/[0.03] border border-white/5 p-4 rounded-xl flex items-center justify-between group active:bg-white/[0.08] transition-all overflow-hidden w-full">
                        <div className="flex items-center gap-2 truncate">
                           <ShoppingCart key={cart.length} size={15} className="text-[#D4AF37] shrink-0" />
                           <span className="text-white text-[10px] font-bold tracking-widest uppercase truncate">Cart</span>
                        </div>
                        {cart.length > 0 && <span className="text-[8px] font-black gold-gradient-text px-1.5 py-0.5 bg-[#D4AF37]/10 rounded-full shrink-0">{cart.length}</span>}
                     </Link>
                     <Link href="/wishlist" onClick={() => setIsMobileMenuOpen(false)} className="bg-white/[0.03] border border-white/5 p-4 rounded-xl flex items-center justify-between group active:bg-white/[0.08] transition-all overflow-hidden w-full">
                        <div className="flex items-center gap-2 truncate">
                           <Heart key={wishlist.length} size={15} className="text-[#D4AF37] shrink-0" />
                           <span className="text-white text-[10px] font-bold tracking-widest uppercase truncate">Wish</span>
                        </div>
                        {wishlist.length > 0 && <span className="text-[8px] font-black gold-gradient-text px-1.5 py-0.5 bg-[#D4AF37]/10 rounded-full shrink-0">{wishlist.length}</span>}
                     </Link>
                  </div>

                  <Link href={user ? "/account" : "/login"} onClick={() => setIsMobileMenuOpen(false)} className="bg-white/[0.03] border border-white/5 p-4 rounded-xl flex items-center justify-between group active:bg-white/[0.08] transition-all w-full">
                     <div className="flex items-center gap-3 truncate">
                        <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] shrink-0 overflow-hidden border border-[#D4AF37]/20">
                           {user?.avatar ? (
                             <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                           ) : (
                             <UserIcon size={16} />
                           )}
                        </div>
                        <span className="text-white text-[10px] font-bold tracking-widest uppercase truncate">{user ? user.name.split(' ')[0] : "Account Login"}</span>
                     </div>
                     <ArrowRight size={14} className="text-[#D4AF37]/20 shrink-0" />
                  </Link>
               </div>

               {/* Footer */}
               <div className="mt-auto pt-4 border-t border-white/5 flex flex-col gap-4 w-full">
                  <div className="flex justify-between items-center text-white/30 w-full">
                     <div className="flex items-center gap-2">
                        <Phone size={11} className="text-[#D4AF37]/50 shrink-0" />
                        <span className="text-[9px] font-black tracking-widest">+91 98765 43210</span>
                     </div>
                     <div className="flex gap-4 shrink-0">
                        {[Instagram, Facebook, Twitter].map((Icon, i) => (
                          <Icon key={i} size={15} className="text-white/20 hover:text-[#D4AF37] transition-all" />
                        ))}
                     </div>
                  </div>
                  <p className="text-[8px] text-white/10 font-bold tracking-[0.25em] uppercase text-center w-full">Radhikarn Heritage Atelier, New Delhi</p>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
