import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { LogIn, Sparkles, MapPin, ShieldCheck, Heart, ChevronRight } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useStore } from "@/context/StoreContext";
import { GoldenBackground } from "@/components/GoldenBackground";
import { toast } from "sonner";

export default function Login() {
  const { loginWithGoogle, user } = useStore();
  const [, setLocation] = useLocation();
  const googleBtnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      setLocation("/account");
      return;
    }

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.warn("VITE_GOOGLE_CLIENT_ID is missing from the chronicles (.env)");
      return;
    }

    // @ts-ignore
    if (window.google) {
      // @ts-ignore
      google.accounts.id.initialize({
        client_id: clientId,
        callback: (response: any) => {
          loginWithGoogle(response.credential);
          setLocation("/account");
        }
      });

      if (googleBtnRef.current) {
        // @ts-ignore
        google.accounts.id.renderButton(googleBtnRef.current, {
          theme: "outline",
          size: "large",
          shape: "pill",
          width: window.innerWidth < 640 ? "280" : "340",
          text: "continue_with"
        });
      }
    }
  }, [user]);

  return (
    <div className="min-h-screen pt-40 pb-20 bg-[#050505] relative overflow-hidden flex items-center justify-center">
      <GoldenBackground />
      
      <div className="container mx-auto px-4 relative z-10 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">
          {/* Brand Side - Optimized for Desktop */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="hidden lg:block space-y-12"
          >
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-px gold-gradient"></div>
                <span className="text-[#D4AF37] uppercase tracking-[0.4em] text-[10px] font-black">Authorized Access</span>
              </div>
              <h1 className="text-6xl font-display text-white leading-tight">
                Enter the <br />
                <span className="gold-gradient-text italic font-medium font-cormorant lowercase tracking-normal">Radhikarn</span> <br />
                Vault
              </h1>
              <p className="text-[#888] text-lg font-light leading-relaxed max-w-md italic">
                Experience a more personalized journey, secure your bespoke masterpieces, and access exclusive privileges.
              </p>
            </div>

            <div className="space-y-6 pt-10 border-t border-white/5">
              {[
                { icon: ShieldCheck, text: "Secured Digital Identity" },
                { icon: MapPin, text: "Stored Sanctuary Addresses" },
                { icon: Heart, text: "Curated Bespoke Wishlists" },
                { icon: Sparkles, text: "Privileged Early Access" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 text-[#F5F5F5] opacity-60 hover:opacity-100 transition-opacity">
                  <div className="w-10 h-10 rounded-full glass-card border-white/5 flex items-center justify-center shrink-0">
                    <item.icon size={16} className="text-[#D4AF37]" />
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.3em] font-black">{item.text}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Form Side - Center focus on Mobile */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-[420px] mx-auto"
          >
            <div className="glass-card rounded-[2.5rem] border-[#D4AF37]/10 p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-2xl bg-white/[0.02]">
              <div className="absolute -top-20 -right-20 w-80 h-80 bg-[#D4AF37]/5 blur-[100px] rounded-full opacity-60"></div>
              
              <div className="text-center mb-10">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full glass-card border-[#D4AF37]/20 flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-xl">
                  <LogIn className="text-[#D4AF37]" size={28} />
                </div>
                <h2 className="text-xl sm:text-2xl font-display text-white uppercase tracking-[0.2em] mb-3">Identity Verification</h2>
                <p className="text-[#888] text-[9px] uppercase tracking-[0.3em] font-black">Secure authentication required</p>
              </div>

              <div className="space-y-8">
                <div className="w-full">
                  <div 
                    ref={googleBtnRef}
                    className="w-full flex justify-center min-h-[50px] items-center"
                  >
                    {!import.meta.env.VITE_GOOGLE_CLIENT_ID && (
                      <div className="text-[9px] text-red-500/80 uppercase tracking-widest font-black text-center p-4 border border-red-500/10 rounded-2xl bg-red-500/5 backdrop-blur-xl leading-relaxed">
                        Credentials Required in Sanctuary Chronicles (.env)
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 py-2">
                  <div className="flex-1 h-px bg-white/5"></div>
                  <span className="text-[8px] uppercase tracking-[0.5em] text-white/20 font-black">Private & Secured</span>
                  <div className="flex-1 h-px bg-white/5"></div>
                </div>

                <Link
                  href="/"
                  className="block text-center text-white/40 hover:text-[#D4AF37] transition-all text-[9px] uppercase tracking-[0.4em] font-black"
                >
                  Return to Home
                </Link>
              </div>

              <div className="mt-12 lg:mt-16 pt-8 border-t border-white/5 text-center">
                <p className="text-[8px] text-white/30 uppercase tracking-[0.2em] leading-relaxed">
                  By accessing the vault, you agree to our <br />
                  <span className="text-white/60">Privacy Mandate</span> & <span className="text-white/60">Security Terms</span>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
