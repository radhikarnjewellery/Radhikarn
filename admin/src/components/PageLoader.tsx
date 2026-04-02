import { motion } from "framer-motion";

interface PageLoaderProps {
  fullScreen?: boolean;
}

export default function PageLoader({ fullScreen = true }: PageLoaderProps) {
  return (
    <div className={`flex flex-col items-center justify-center ${fullScreen ? 'fixed inset-0 z-[999] bg-[#050505]/95 backdrop-blur-xl' : 'py-20 w-full bg-transparent'}`}>
      <div className="relative w-20 h-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          className="absolute inset-0 rounded-full border-4 border-[#D4AF37]/10 border-t-[#D4AF37] shadow-[0_0_30px_rgba(212,175,55,0.15)]"
        />
        <motion.div
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
            className="absolute inset-2 rounded-full border-2 border-white/5 border-t-white/20"
        />
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] shadow-[0_0_15px_#D4AF37]" />
        </div>
      </div>
      
      <motion.p 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-[10px] text-[#555] uppercase tracking-[0.5em] font-black italic ml-2"
      >
        Syncing Metadata...
      </motion.p>
    </div>
  );
}
