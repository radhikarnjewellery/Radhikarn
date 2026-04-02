import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, ShoppingBag, List, 
  ShoppingCart, LogOut,
  ChevronRight, Menu, X, Zap, Tag, Bell, Home, Users, Eye
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";

interface SidebarProps {
  onLogout: () => void;
}

export default function Sidebar({ onLogout }: SidebarProps) {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [unseenVisitors, setUnseenVisitors] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;
    const fetchUnseen = () => {
      fetch(`${import.meta.env.VITE_API_URL}/api/visitors/unseen`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(d => setUnseenVisitors(d.count || 0))
        .catch(() => {});
    };
    fetchUnseen();
    const interval = setInterval(fetchUnseen, 60000); // poll every minute
    return () => clearInterval(interval);
  }, []);

  const menuItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Products", href: "/products", icon: ShoppingBag },
    { name: "Categories", href: "/categories", icon: List },
    { name: "Orders", href: "/orders", icon: ShoppingCart },
    { name: "Users", href: "/users", icon: Users },
    { name: "Visitors", href: "/visitors", icon: Eye, badge: unseenVisitors },
    { name: "Charges", href: "/charges", icon: Zap },
    { name: "Coupons", href: "/coupons", icon: Tag },
    { name: "Notifications", href: "/notifications", icon: Bell },
    { name: "Homepage", href: "/homepage", icon: Home },
  ];

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        onClick={toggleSidebar}
        className="lg:hidden fixed top-6 right-6 z-[60] w-14 h-14 rounded-full glass-card border-rk-gold/30 flex items-center justify-center text-rk-gold active:scale-95"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Main Sidebar */}
      <AnimatePresence>
        {(isOpen || window.innerWidth >= 1024) && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-y-0 left-0 w-72 bg-black border-r border-rk-gold/10 z-50 flex flex-col p-8"
          >
            {/* Branding */}
            <div className="mb-14 text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <img src="/logo.webp" alt="RK Logo" className="w-8 h-8 object-contain rounded" />
                <span className="text-lg font-display font-black uppercase tracking-[0.3em] gold-gradient-text">Admin</span>
              </div>
              <div className="w-12 h-px gold-gradient mx-auto" />
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-3">
              {menuItems.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => { setIsOpen(false); if (item.href === '/visitors') setUnseenVisitors(0); }}>
                  <span className={clsx(
                    "flex items-center justify-between px-6 py-5 rounded-2xl transition-all duration-500 group",
                    location === item.href 
                      ? "glass-card border-rk-gold/40 text-rk-gold shadow-[0_10px_30px_rgba(212,175,55,0.08)]" 
                      : "text-white/40 hover:text-white/80"
                  )}>
                    <div className="flex items-center gap-4">
                      <item.icon size={16} className={clsx(
                        "transition-all duration-500 group-hover:scale-110",
                        location === item.href ? "text-rk-gold" : "text-current"
                      )} />
                      <span className="text-[10px] uppercase tracking-[0.4em] font-black">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {(item as any).badge > 0 && (
                        <span className="bg-rk-gold text-black text-[8px] font-black px-2 py-0.5 rounded-full min-w-[18px] text-center">
                          {(item as any).badge}
                        </span>
                      )}
                      {location === item.href && (
                        <motion.div layoutId="activeDot" className="w-1.5 h-1.5 rounded-full bg-rk-gold shadow-[0_0_8px_#D4AF37]" />
                      )}
                    </div>
                  </span>
                </Link>
              ))}
            </nav>

            {/* Footer / Logout */}
            <div className="mt-10 pt-8 border-t border-rk-gold/10">
              <button 
                onClick={onLogout}
                className="w-full flex items-center justify-between px-6 py-5 rounded-2xl text-white/40 hover:text-red-400 hover:bg-red-400/5 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
                  <span className="text-[10px] uppercase tracking-[0.4em] font-black">Logout</span>
                </div>
                <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              
              <div className="mt-10 text-center opacity-30">
                <p className="text-[8px] uppercase tracking-[0.3em] font-black font-cormorant text-rk-gold">made by tejas pawar</p>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          onClick={toggleSidebar}
          className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-40 transition-opacity" 
        />
      )}
    </>
  );
}
