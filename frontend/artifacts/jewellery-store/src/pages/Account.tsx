import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Package, 
  MapPin, 
  LogOut, 
  ChevronRight, 
  Heart, 
  ShoppingCart,
  User as UserIcon,
  ShoppingBag,
  ShieldCheck,
  X,
  Camera,
  Save,
  RotateCcw,
  MessageSquare,
  HelpCircle,
  Clock
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useStore } from "@/context/StoreContext";
import { GoldenBackground } from "@/components/GoldenBackground";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { toast } from "sonner";

const fadeInUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

interface AccountItem {
  icon: any;
  label: string;
  desc: string;
  href: string;
  color?: string;
  onClick?: () => void;
}

interface AccountSection {
  title: string;
  items: AccountItem[];
}

export default function Account() {
  const { user, logout, updateProfile } = useStore();
  const [, setLocation] = useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: "", phone: "" });
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Store the original Google avatar on first login (persisted in localStorage)
  const googleAvatar = localStorage.getItem("jewellery_google_avatar") || user?.avatar || "";

  if (!user) {
    setLocation("/login");
    return null;
  }

  const openProfileModal = () => {
    setProfileForm({ name: user.name || "", phone: user.phone || "" });
    setPreviewAvatar(null);
    // Save google avatar on first open if not already saved
    if (!localStorage.getItem("jewellery_google_avatar") && user.avatar) {
      localStorage.setItem("jewellery_google_avatar", user.avatar);
    }
    setShowProfileModal(true);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("Image must be under 2MB"); return; }
    const reader = new FileReader();
    reader.onload = () => setPreviewAvatar(reader.result as string);
    reader.readAsDataURL(file);
  };

  const uploadToCloudinary = async (base64: string): Promise<string | null> => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/api/user/avatar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64 })
      });
      const data = await res.json();
      return data.url || null;
    } catch { return null; }
  };

  const handleRestoreGoogleAvatar = () => {
    setPreviewAvatar(googleAvatar);
  };

  const handleSaveProfile = async () => {
    if (!profileForm.name.trim()) { toast.error("Name is required"); return; }
    if (profileForm.phone && profileForm.phone.length !== 10) {
      toast.error("Phone number must be exactly 10 digits");
      return;
    }
    setSavingProfile(true);
    let avatarToSave = previewAvatar || user.avatar;
    // If it's a base64, upload to Cloudinary first
    if (avatarToSave?.startsWith('data:')) {
      toast.loading("Uploading avatar...", { id: "avatar-upload" });
      const url = await uploadToCloudinary(avatarToSave);
      toast.dismiss("avatar-upload");
      if (url) {
        avatarToSave = url;
        localStorage.setItem("jewellery_google_avatar_custom", url);
      } else {
        // Cloudinary not configured — skip avatar change, keep existing
        avatarToSave = user.avatar;
        toast.warning("Avatar upload skipped — add Cloudinary config to .env");
      }
    }
    await updateProfile({ name: profileForm.name.trim(), phone: profileForm.phone.trim(), avatar: avatarToSave });
    setSavingProfile(false);
    setShowProfileModal(false);
    toast.success("Profile updated");
  };

  const sections: AccountSection[] = [
    {
      title: "Navigation",
      items: [
        { icon: ShoppingBag, label: "Your Orders", desc: "View order history", href: "/orders" },
        { icon: Clock, label: "Order Status", desc: "Track active orders", href: "/track" },
        { icon: Heart, label: "Wishlist", desc: "Your saved products", href: "/wishlist" },
        { icon: ShoppingCart, label: "View Bag", desc: "Review your cart", href: "/cart" }
      ]
    },
    {
      title: "Account & Support",
      items: [
        { icon: UserIcon, label: "Profile", desc: user.phone ? `+91 ${user.phone}` : "Manage your details", href: "#", onClick: openProfileModal },
        { icon: MapPin, label: "Addresses", desc: "Manage shipping locations", href: "/addresses" },
        { icon: MessageSquare, label: "Customer Support", desc: "Contact us on WhatsApp", href: "https://wa.me/917370809639" }, 
        { icon: ShieldCheck, label: "Policy & Safety", desc: "Terms and privacy", href: "/about" }
      ]
    }
  ];

  const performLogout = () => {
    logout();
    setLocation("/");
  };

  return (
    <div className="min-h-screen pt-28 pb-24 bg-[#050505] relative overflow-hidden">
      <GoldenBackground />
      
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-1/2 h-screen bg-[#D4AF37]/[0.02] -skew-x-12 blur-[120px]"></div>
      
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="space-y-16"
        >
          {/* Dashboard Hero Header */}
          <motion.div 
            variants={fadeInUp}
            className="glass-card rounded-[2.5rem] md:rounded-[3rem] border-[#D4AF37]/10 p-8 md:p-14 relative overflow-hidden flex flex-col md:flex-row items-center gap-8 md:gap-12 group shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
          >
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#D4AF37]/5 blur-[80px] rounded-full"></div>
            
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-[#D4AF37]/20 to-transparent blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
              <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-full p-1 border border-[#D4AF37]/20 bg-black/40 backdrop-blur-xl shadow-2xl group-hover:scale-105 transition-transform duration-700">
                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover rounded-full saturate-[1.2]" onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=1a1a1a&color=D4AF37&size=200`; }} />
              </div>
            </div>

            <div className="flex-1 text-center md:text-left space-y-3">
              <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
                <span className="text-[9px] text-[#D4AF37] uppercase tracking-[0.4em] font-black italic">Verified Vault Member</span>
                <div className="w-10 h-px bg-[#D4AF37]/20"></div>
              </div>
              <h1 className="text-3xl md:text-6xl font-display text-white leading-tight uppercase tracking-tight">
                Welcome, <span className="gold-gradient-text italic font-medium font-cormorant tracking-normal">{user.name.split(' ')[0].charAt(0).toUpperCase() + user.name.split(' ')[0].slice(1).toLowerCase()}</span>
              </h1>
              <p className="text-[#666] text-[10px] md:text-sm tracking-[0.2em] font-bold uppercase">Member since {new Date(user.joinedAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</p>
            </div>

            <div className="flex flex-col gap-4 w-full md:w-auto mt-4 md:mt-0">
               <button 
                onClick={() => setShowLogoutModal(true)}
                className="px-8 py-3.5 rounded-full border border-red-500/10 text-red-500/60 hover:bg-red-500/10 transition-all flex items-center justify-center gap-3 text-[9px] uppercase font-black tracking-[0.3em] group active:scale-95"
              >
                <LogOut size={14} className="group-hover:-translate-x-1 transition-transform" />
                Exit Vault
              </button>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {sections.map((section, idx) => (
              <motion.div key={idx} variants={fadeInUp} className="space-y-8">
                <div className="flex items-center gap-5 px-2">
                  <h3 className="text-[10px] text-[#D4AF37] uppercase tracking-[0.5em] font-black italic">{section.title}</h3>
                  <div className="flex-1 h-px bg-gradient-to-r from-[#D4AF37]/10 to-transparent"></div>
                </div>

                <div className={idx === 0 ? "grid grid-cols-2 gap-4" : "flex flex-col gap-4"}>
                  {section.items.map((item, idy) => {
                    const isExternal = item.href.startsWith('http');
                    const itemContent = idx === 0 ? (
                      /* GRID STYLE for Section 0 (Activity) - 2x2 on mobile */
                      <div className="glass-card rounded-2xl md:rounded-3xl border-white/5 p-6 md:p-8 h-full transition-all hover:bg-white/[0.04] hover:border-[#D4AF37]/30 relative overflow-hidden group/card shadow-2xl flex flex-col items-center md:items-start text-center md:text-left gap-5">
                        <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl glass-card border-white/10 flex items-center justify-center text-[#444] group-hover/card:text-[#D4AF37] group-hover/card:bg-[#D4AF37]/5 transition-all duration-500">
                           <item.icon size={20} className="md:size-[24px]" strokeWidth={1.5} />
                        </div>
                        <div className="space-y-1">
                           <h4 className="text-white text-[11px] md:text-sm font-black uppercase tracking-[0.1em] group-hover/card:gold-gradient-text transition-all duration-500">{item.label}</h4>
                           <p className="text-[#666] text-[9px] md:text-[11px] font-medium leading-relaxed italic transition-colors group-hover/card:text-white/60 line-clamp-1">
                             {item.desc}
                           </p>
                        </div>
                      </div>
                    ) : (
                      /* LIST STYLE for Section 1 (Identity) - Elegant Row on mobile */
                      <div className="glass-card rounded-2xl border-white/5 p-5 md:p-6 transition-all hover:bg-white/[0.04] hover:border-[#D4AF37]/30 flex items-center justify-between group/row shadow-xl">
                         <div className="flex items-center gap-5">
                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#555] group-hover/row:text-[#D4AF37] group-hover/row:bg-[#D4AF37]/10 transition-all">
                               <item.icon size={18} strokeWidth={1.5} />
                            </div>
                            <div className="space-y-0.5">
                               <h4 className="text-white text-[11px] font-black uppercase tracking-wider group-hover/row:gold-gradient-text transition-colors">{item.label}</h4>
                               <p className="text-[#555] text-[10px] italic font-medium group-hover/row:text-white/40 mb-0">{item.desc}</p>
                            </div>
                         </div>
                         <ChevronRight size={16} className="text-[#222] group-hover/row:text-[#D4AF37] group-hover/row:translate-x-1 transition-all" />
                      </div>
                    );

                    if (isExternal) {
                      return (
                        <a key={idy} href={item.href} target="_blank" rel="noopener noreferrer" className="group block">
                          {itemContent}
                        </a>
                      );
                    }

                    return (
                      <Link key={idy} href={item.onClick ? "#" : item.href} onClick={item.onClick} className="group">
                        {itemContent}
                      </Link>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <ConfirmationModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={performLogout}
        title="Exit Vault"
        message="Are you sure you wish to exit your private vault? Your active selection will be preserved."
        confirmText="Exit Vault"
        cancelText="Stay in Vault"
        variant="danger"
      />

      {/* Profile Data Modal */}
      <AnimatePresence>
        {showProfileModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowProfileModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="glass-card rounded-[2rem] border-[#D4AF37]/10 p-8 w-full max-w-md space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] uppercase tracking-[0.4em] text-[#D4AF37] font-black">Profile Data</h3>
                <button onClick={() => setShowProfileModal(false)} className="text-white/30 hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>

              {/* Avatar */}
              <div className="flex items-center gap-5">
                <div className="relative">
                  <img src={previewAvatar || user.avatar} alt="Avatar" className="w-16 h-16 rounded-full object-cover border border-[#D4AF37]/20" onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=1a1a1a&color=D4AF37&size=200`; }} />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#D4AF37] rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                  >
                    <Camera size={10} className="text-black" />
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </div>
                <div>
                  <p className="text-white text-sm font-bold">{user.name}</p>
                  <p className="text-[#555] text-[10px] tracking-widest">{user.email}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-[9px] text-[#D4AF37]/60 uppercase tracking-widest">
                      {(previewAvatar || user.avatar) !== googleAvatar ? "Custom avatar" : "Google avatar"}
                    </p>
                    {(previewAvatar || user.avatar) !== googleAvatar && (
                      <button
                        type="button"
                        onClick={handleRestoreGoogleAvatar}
                        className="flex items-center gap-1 text-[9px] text-white/30 hover:text-[#D4AF37] transition-colors uppercase tracking-widest"
                      >
                        <RotateCcw size={9} /> Restore Google
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-[#555] font-black">Full Name</label>
                  <input
                    value={profileForm.name}
                    onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))}
                    className="w-full bg-white/[0.02] border border-white/5 rounded-xl py-3 px-4 text-[#F5F5F5] outline-none focus:border-[#D4AF37]/40 text-sm tracking-wide transition-all"
                    placeholder="Your full name"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-[#555] font-black">Phone Number</label>
                  <div className="flex gap-2">
                    <span className="bg-white/[0.02] border border-white/5 rounded-xl py-3 px-4 text-[#555] text-sm">+91</span>
                    <input
                      value={profileForm.phone}
                      onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }))}
                      inputMode="numeric"
                      pattern="[0-9]{10}"
                      placeholder="9999988888"
                      className="flex-1 bg-white/[0.02] border border-white/5 rounded-xl py-3 px-4 text-[#F5F5F5] outline-none focus:border-[#D4AF37]/40 text-sm tracking-widest transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-[#555] font-black">Email</label>
                  <input
                    value={user.email}
                    disabled
                    className="w-full bg-white/[0.02] border border-white/5 rounded-xl py-3 px-4 text-white/20 text-sm tracking-wide cursor-not-allowed"
                  />
                  <p className="text-[9px] text-[#444] ml-1">Managed by Google</p>
                </div>
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="w-full gold-gradient text-black py-3.5 rounded-xl flex items-center justify-center gap-2 text-[10px] uppercase font-black tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                <Save size={14} />
                {savingProfile ? "Saving..." : "Save Changes"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
