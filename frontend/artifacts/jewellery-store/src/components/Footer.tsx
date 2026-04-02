import { Link } from "wouter";
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export function Footer() {
  return (
    <footer className="bg-[#050505] pt-20 pb-16 relative border-t border-white/5 shadow-[0_-30px_60px_rgba(0,0,0,0.8)]">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent"></div>
      
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 mb-24">
          
          <div className="space-y-10 lg:col-span-2">
            <Link href="/" className="flex flex-col sm:flex-row items-center sm:items-start gap-5 group cursor-pointer text-center sm:text-left">
              <motion.img 
                src={`${import.meta.env.BASE_URL}images/logo.webp`}
                alt="Radhikarn Logo"
                className="w-12 h-12 md:w-14 md:h-14 object-contain"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              />
              <div className="flex flex-col items-center sm:items-start leading-none group">
                <div className="relative">
                  <span className="text-2xl sm:text-3xl md:text-4xl font-display tracking-[0.4em] font-black gold-gradient-text uppercase transition-all duration-700 group-hover:tracking-[0.45em]">
                    RADHIKARN
                  </span>
                  <div className="absolute -inset-1 bg-[#D4AF37]/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
                </div>
                <div className="flex items-center gap-3 w-full mt-2 transition-all">
                  <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-[#D4AF37]/10" />
                  <span className="text-[9px] text-[#D4AF37]/80 tracking-[0.6em] uppercase font-black transition-all duration-700">
                    JEWELLERY
                  </span>
                  <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent via-[#D4AF37]/40 to-[#D4AF37]/10" />
                </div>
              </div>
            </Link>
            <p className="text-[#888] text-sm leading-[1.8] max-w-sm font-light tracking-widest italic opacity-70 mx-auto sm:mx-0">
              Crafting dreams into gold since 1998. Every piece in our collection is a testament to the timeless heritage of Indian artistry and modern luxury.
            </p>
            <div className="flex gap-6 items-center justify-center sm:justify-start">
              {[
                { Icon: Instagram, href: "#" },
                { Icon: Facebook, href: "#" },
                { Icon: Twitter, href: "#" }
              ].map(({ Icon, href }, i) => (
                <a key={i} href={href} className="text-[#555] hover:text-[#D4AF37] transition-all duration-500 hover:-translate-y-1">
                  <Icon size={20} strokeWidth={1.5} />
                </a>
              ))}
            </div>
          </div>

          <div className="space-y-10">
            <h4 className="font-display text-xs uppercase tracking-[0.5em] text-[#F5F5F5] font-black">Quick Links</h4>
            <ul className="space-y-6">
              {[
                { name: "Exclusive Shop", path: "/shop" },
                { name: "Our Heritage", path: "/about" },
                { name: "Track Legacy", path: "/track" },
                { name: "Archive Vault", path: "/account" }
              ].map((link) => (
                <li key={link.name}>
                  <Link href={link.path} className="text-[#777] hover:text-[#D4AF37] transition-all duration-500 text-[10px] uppercase tracking-[0.3em] font-bold flex items-center gap-3 group">
                    <span className="w-0 h-[1px] bg-[#D4AF37] group-hover:w-4 transition-all duration-500"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-10">
            <h4 className="font-display text-xs uppercase tracking-[0.5em] text-[#F5F5F5] font-black">The Atelier</h4>
            <ul className="space-y-8">
              <li className="flex items-start gap-4">
                <MapPin size={18} className="text-[#D4AF37] shrink-0 opacity-60" />
                <div className="space-y-1">
                  <span className="text-[#F5F5F5] text-[10px] uppercase tracking-[0.2em] font-bold block">Grand Flagship Store</span>
                  <span className="text-[#777] text-[10px] tracking-widest leading-relaxed block">Heritage Plaza, M.G. Road<br/>New Delhi, 110001, India</span>
                </div>
              </li>
              <li className="flex items-center gap-4">
                <Phone size={18} className="text-[#D4AF37] shrink-0 opacity-60" />
                <span className="text-[#777] text-[10px] tracking-[0.2em] font-black">+91 73708 09639</span>
              </li>
              <li className="flex items-center gap-4">
                <Mail size={18} className="text-[#D4AF37] shrink-0 opacity-60" />
                <span className="text-[#777] text-[10px] tracking-[0.2em] font-black">concierge@radhikarn.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/5 pt-12 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex gap-10">
            {["Terms", "Privacy", "Shipping", "Returns"].map(item => (
              <a key={item} href="#" className="text-[9px] text-[#444] hover:text-[#777] transition-all uppercase tracking-[0.4em] font-black">
                {item}
              </a>
            ))}
          </div>
          <p className="text-[9px] text-[#444] uppercase tracking-[0.4em] font-black">
            &copy; {new Date().getFullYear()} Radhikarn Jewellery. Crafted for Eternity.
          </p>
        </div>
      </div>
    </footer>
  );
}
