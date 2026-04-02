import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, User, ShieldCheck, ArrowRight, Sparkles, Loader2 } from 'lucide-react';

interface LoginProps {
  onLogin: (token: string) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');

      if (data.token) {
        onLogin(data.token);
      }
    } catch (err: any) {
      setError(err.message || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative p-6 overflow-hidden bg-[#020202]">
      {/* Cinematic Background */}
      <div className="absolute inset-0 bg-black" />
      <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-rk-gold/[0.03] blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-rk-gold/[0.03] blur-[120px]" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-card p-12 rounded-[2.5rem] border-rk-gold/10 relative overflow-hidden backdrop-blur-3xl shadow-[0_50px_100px_-20px_rgba(0,0,0,1)]">
          {/* Top Decorative Line */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-rk-gold/30 to-transparent" />
          
          <div className="flex flex-col items-center mb-12 text-center">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="relative mb-8"
            >
              <div className="w-20 h-20 rounded-full border border-rk-gold/30 flex items-center justify-center relative z-10 bg-black/40 shadow-[0_0_40px_rgba(212,175,55,0.15)]">
                 <Lock size={28} className="text-rk-gold" strokeWidth={1.5} />
              </div>
              <div className="absolute inset-[-15px] border border-rk-gold/10 rounded-full animate-[spin_10s_linear_infinite]" />
              <div className="absolute inset-[-8px] border border-rk-gold/5 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
            </motion.div>
            
            <h1 className="text-4xl font-display font-black uppercase tracking-[0.2em] text-[#F5F5F5] mb-3 leading-tight">
              RK <span className="gold-gradient-text italic font-medium font-cormorant lowercase tracking-normal">Admin</span>
            </h1>
            <div className="flex items-center gap-3">
              <div className="h-px w-6 bg-rk-gold/20" />
              <p className="text-[9px] uppercase tracking-[0.4em] text-[#666] font-black">Admin Login</p>
              <div className="h-px w-6 bg-rk-gold/20" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-500/5 border border-red-500/20 text-red-500 text-[10px] uppercase tracking-[0.2em] font-black p-4 rounded-xl text-center flex items-center justify-center gap-3"
                >
                  <Sparkles size={12} className="opacity-60" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-6">
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-rk-gold/30 group-focus-within:text-rk-gold transition-all duration-500">
                  <User size={16} strokeWidth={1.5} />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="admin-input !pl-16 !bg-white/[0.02] !border-white/5 focus:!border-rk-gold/40 focus:!bg-white/[0.04]"
                />
              </div>

              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-rk-gold/30 group-focus-within:text-rk-gold transition-all duration-500">
                  <Lock size={16} strokeWidth={1.5} />
                </div>
                <input
                  type="password"
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="admin-input !pl-16 !bg-white/[0.02] !border-white/5 focus:!border-rk-gold/40 focus:!bg-white/[0.04]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full relative group/btn overflow-hidden"
            >
              <div className="admin-btn-primary w-full flex items-center justify-center gap-4 group-disabled:opacity-40 h-[64px]">
                 {loading ? (
                   <Loader2 size={18} className="animate-spin text-black" />
                 ) : (
                   <span className="relative z-10">
                     Login
                   </span>
                 )}
                 {loading && <span className="text-[10px] font-black uppercase tracking-widest text-black">Authenticating...</span>}
                 {!loading && <ArrowRight size={16} className="relative z-10 group-hover/btn:translate-x-2 transition-transform duration-500" />}
              </div>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-700" />
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-rk-gold/5 flex flex-col items-center gap-4">
             <div className="flex items-center gap-4 text-[#333]">
                <ShieldCheck size={14} className="text-[#444]" />
                <span className="text-[8px] uppercase tracking-[0.5em] font-black">Secure Admin Access</span>
             </div>
             <p className="text-[7px] text-[#222] uppercase tracking-[0.2em] font-bold">Radhikarn Jewellery Control System v4.2.0</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
