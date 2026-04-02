import { motion } from "framer-motion";
import { Gem, ShieldCheck, HeartHandshake, Award } from "lucide-react";
import { Link } from "wouter";
import { GoldenBackground } from "@/components/GoldenBackground";

const fadeInUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };
const staggerChildren = { visible: { transition: { staggerChildren: 0.2 } } };

export default function About() {
  return (
    <div className="pt-24 min-h-screen bg-[#0A0A0A] relative overflow-hidden">
      <GoldenBackground />
      {/* Hero */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={`${import.meta.env.BASE_URL}images/about-craft.png`}
            alt="Craftsmanship"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(10,10,10,0.8) 0%, rgba(10,10,10,0.5) 50%, #0A0A0A 100%)' }}></div>
        </div>
        <div className="relative z-10 text-center max-w-4xl px-4">
          <motion.div initial="hidden" animate="visible" variants={staggerChildren}>
            <motion.span variants={fadeInUp} className="inline-block glass-card px-6 py-2 rounded-full text-[#D4AF37] font-bold uppercase tracking-[0.3em] text-xs mb-8 border-[#D4AF37]/30">
              Our Heritage
            </motion.span>
            <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl lg:text-8xl font-display leading-none mb-6 text-[#F5F5F5]">
              The Art of <br /> <span className="gold-gradient-text italic">Perfection</span>
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-[#8A8A8A] text-lg max-w-2xl mx-auto font-light">
              Since December 2025, Radhikarn Jewellery has defined luxury, weaving timeless traditions with breathtaking contemporary design.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Story */}
      <section className="py-32 relative">
        <div className="absolute top-0 left-0 w-full h-[1px] gold-gradient opacity-20"></div>
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col lg:flex-row gap-20 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="w-full lg:w-1/2 space-y-8"
            >
              <h2 className="text-4xl md:text-5xl font-display uppercase tracking-widest text-[#F5F5F5]">A Legacy Etched in Gold</h2>
              <div className="w-20 h-[2px] gold-gradient"></div>
              
              <div className="space-y-6 text-[#8A8A8A] leading-relaxed font-light text-lg">
                <p>
                  Founded by Kaushal Gupta in the vibrant heart of India, our atelier was born out of a profound passion for unparalleled craftsmanship and the mesmerizing beauty of natural gemstones.
                </p>
                <p>
                  What began in December 2025 as an intimate workshop has blossomed into a celebrated sanctuary of luxury. Every masterpiece we create is a testament to our dedication—a harmonious blend of ancient Kundan and Polki techniques, elevated by innovative modern design.
                </p>
                <p>
                  We believe that jewelry is far more than an accessory. It is a profound expression of emotion, a luminous marker of monumental life moments, and a cherished heirloom destined to transcend time.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-10 md:gap-20 pt-16 border-t border-rk-gold/10">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className="flex flex-col gap-3 group"
                >
                  <h4 className="text-5xl md:text-7xl font-luxury-num gold-gradient-text font-black tracking-normal group-hover:scale-105 transition-transform duration-700">2025</h4>
                  <div className="flex items-center gap-3">
                     <div className="h-[1px] w-6 bg-rk-gold/40" />
                     <p className="text-[10px] uppercase tracking-[0.5em] text-rk-gold/60 font-black">Established</p>
                  </div>
                </motion.div>
                
                <div className="hidden md:block h-20 w-px bg-gradient-to-b from-transparent via-rk-gold/20 to-transparent" />
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="flex flex-col gap-3 group"
                >
                  <h4 className="text-5xl md:text-7xl font-luxury-num gold-gradient-text font-black tracking-normal group-hover:scale-105 transition-transform duration-700">25K+</h4>
                  <div className="flex items-center gap-3">
                     <div className="h-[1px] w-6 bg-rk-gold/40" />
                     <p className="text-[10px] uppercase tracking-[0.5em] text-rk-gold/60 font-black">Masterpieces Crafted</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="w-full lg:w-1/2 relative"
            >
              <div className="absolute inset-0 bg-[#D4AF37]/20 blur-[100px] rounded-full"></div>
              <div className="aspect-[4/5] glass-card p-3 rounded-[40px] relative z-10 border-[#D4AF37]/30 transform rotate-2 hover:rotate-0 transition-transform duration-700">
                <img 
                  src="https://images.unsplash.com/photo-1599643478514-4a4e03164a2b?w=1000&q=80" 
                  alt="Jewelry Details" 
                  className="w-full h-full object-cover rounded-[30px]"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="py-32 bg-[#111111] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiNENEFGMzciIGZpbGwtb3BhY2l0eT0iMC4xIi8+PC9zdmc+')]"></div>
        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-display uppercase tracking-widest text-[#F5F5F5] mb-6">Our Pillars of Excellence</h2>
            <div className="w-24 h-[1px] gold-gradient mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Gem, title: "Ethical Sourcing", desc: "Every gem and metal is strictly traced, ensuring conflict-free origins and environmental responsibility." },
              { icon: ShieldCheck, title: "Uncompromising Quality", desc: "We hold ourselves to the highest global standards, offering lifetime warranties on our craftsmanship." },
              { icon: HeartHandshake, title: "Bespoke Service", desc: "Our concierge team provides a highly personalized experience, tailored to your unique desires." },
              { icon: Award, title: "Master Artisanship", desc: "Our jewelers possess decades of experience, employing techniques that machines simply cannot replicate." },
            ].map((pillar, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="glass-card p-10 rounded-3xl border-[#D4AF37]/10 hover:border-[#D4AF37]/40 transition-colors group flex flex-col items-center text-center"
              >
                <div className="w-20 h-20 rounded-full glass-card border-[#D4AF37]/30 flex items-center justify-center mb-8 group-hover:glow-gold transition-all duration-500 text-[#D4AF37]">
                  <pillar.icon size={32} />
                </div>
                <h3 className="font-display uppercase tracking-widest text-lg mb-4 text-[#F5F5F5]">{pillar.title}</h3>
                <p className="text-[#8A8A8A] text-sm leading-relaxed">{pillar.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder */}
      <section className="py-32 relative">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-16">
            <span className="text-rk-gold text-[10px] uppercase tracking-[0.5em] font-black">The Visionary</span>
            <h2 className="text-4xl md:text-5xl font-display uppercase tracking-widest text-[#F5F5F5] mt-4">Meet the Founder</h2>
            <div className="w-16 h-[1px] gold-gradient mx-auto mt-6" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="glass-card rounded-[40px] border-rk-gold/15 p-10 md:p-16 flex flex-col md:flex-row items-center gap-12"
          >
            <div className="relative shrink-0">
              <div className="absolute inset-0 bg-rk-gold/20 blur-[60px] rounded-full" />
              <div className="relative w-48 h-48 rounded-full overflow-hidden border-2 border-rk-gold/30 shadow-[0_0_40px_rgba(212,175,55,0.15)]">
                <img
                  src="/founder.webp"
                  alt="Kaushal Gupta"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="flex-1 text-center md:text-left space-y-5">
              <div>
                <h3 className="text-3xl font-display uppercase tracking-widest text-[#F5F5F5] mb-1">Kaushal Gupta</h3>
                <p className="text-rk-gold text-[10px] uppercase tracking-[0.4em] font-black">Founder & Director</p>
              </div>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <span className="glass-card px-4 py-2 rounded-full text-[9px] uppercase tracking-[0.3em] font-black text-rk-gold/80 border-rk-gold/20">Civil Engineer</span>
                <span className="glass-card px-4 py-2 rounded-full text-[9px] uppercase tracking-[0.3em] font-black text-rk-gold/80 border-rk-gold/20">IIEST Shibpur</span>
              </div>
              <p className="text-[#8A8A8A] leading-relaxed text-sm font-light">
                With an engineering mind and an artist's soul, Kaushal Gupta founded Radhikarn Jewellery in December 2025 with a singular vision — to bring precision, purity, and passion together in every piece. His background in civil engineering instilled in him an obsession with structure and detail, qualities that now define every masterpiece that leaves our atelier.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 relative">
        <div className="absolute inset-0 gold-gradient opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl">
          <h2 className="text-4xl md:text-6xl font-display mb-8 text-[#F5F5F5]">Experience the <br/><span className="gold-gradient-text italic">Extraordinary</span></h2>
          <p className="text-[#8A8A8A] text-lg mb-12">Discover the perfect piece that reflects your unique elegance, or collaborate with our master jewelers to bring your bespoke vision to life.</p>
          <Link 
            href="/shop" 
            className="gold-gradient text-[#0A0A0A] px-12 py-5 rounded-full uppercase tracking-widest text-sm font-bold transition-all hover:glow-gold inline-block"
          >
            Explore the Collection
          </Link>
        </div>
      </section>
    </div>
  );
}
