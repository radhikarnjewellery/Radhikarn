import { Link } from "wouter";
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail } from "lucide-react";
import { motion } from "framer-motion";

export function Footer() {
  return (
    <footer className="bg-[#050505] pt-16 pb-10 relative border-t border-white/5 shadow-[0_-30px_60px_rgba(0,0,0,0.8)]">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent"></div>
      
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-16 mb-14">
          
          <div className="space-y-7 sm:col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center gap-4 group cursor-pointer">
              <motion.img 
                src={`${import.meta.env.BASE_URL}images/logo.webp`}
                alt="Radhikarn Logo"
                className="w-11 h-11 md:w-14 md:h-14 object-contain"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              />
              <div className="flex flex-col leading-none">
                <span className="text-2xl md:text-3xl font-display tracking-[0.4em] font-black gold-gradient-text uppercase">
                  RADHIKARN
                </span>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex-1 h-[1px] bg-gradient-to-r from-[#D4AF37]/40 to-transparent" />
                  <span className="text-[8px] text-[#D4AF37]/80 tracking-[0.5em] uppercase font-black">JEWELLERY</span>
                  <div className="flex-1 h-[1px] bg-gradient-to-l from-[#D4AF37]/40 to-transparent" />
                </div>
              </div>
            </Link>
            <p className="text-[#888] text-sm leading-[1.8] max-w-sm font-light tracking-widest italic opacity-70">
              Crafting dreams into gold since 1998. Every piece in our collection is a testament to the timeless heritage of Indian artistry and modern luxury.
            </p>
            <div className="flex gap-6 items-center">
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
            <h4 className="font-display text-xs uppercase tracking-[0.5em] text-[#F5F5F5] font-black">Contact</h4>
            <ul className="space-y-8">
              <li className="flex items-start gap-4">
                <MapPin size={18} className="text-[#D4AF37] shrink-0 opacity-60 mt-0.5" />
                <span className="text-[#777] text-[10px] tracking-widest leading-relaxed block">IIEST Shibpur, Howrah</span>
              </li>
              <li className="flex items-center gap-4">
                <Phone size={18} className="text-[#D4AF37] shrink-0 opacity-60" />
                <span className="text-[#777] text-[10px] tracking-[0.2em] font-black">+91 73708 09639</span>
              </li>
              <li className="flex items-center gap-4">
                <Mail size={18} className="text-[#D4AF37] shrink-0 opacity-60" />
                <span className="text-[#777] text-[10px] tracking-[0.2em] font-black">radhikarnjewellery@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/5 pt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-6 justify-center md:justify-start">
            {["Terms", "Privacy", "Shipping", "Returns"].map(item => (
              <a key={item} href="#" className="text-[9px] text-[#444] hover:text-[#777] transition-all uppercase tracking-[0.4em] font-black">
                {item}
              </a>
            ))}
          </div>
          <p className="text-[9px] text-[#444] uppercase tracking-[0.4em] font-black text-center md:text-right">
            &copy; {new Date().getFullYear()} Radhikarn Jewellery. Crafted for Eternity.
          </p>
        </div>
      </div>
    </footer>
  );
}
