import { motion } from "framer-motion";

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  isLoading?: boolean;
}

export default function ToggleSwitch({ checked, onChange, isLoading = false }: ToggleSwitchProps) {
  return (
    <button
      onClick={() => !isLoading && onChange(!checked)}
      disabled={isLoading}
      className={`relative w-12 h-7 rounded-full transition-all duration-500 border ${
        checked 
          ? 'bg-[#D4AF37]/20 border-[#D4AF37]/40 shadow-[0_4px_15px_rgba(212,175,55,0.15)]' 
          : 'bg-white/5 border-white/10'
      } ${isLoading ? 'opacity-70 cursor-wait' : 'cursor-pointer hover:border-white/20'}`}
    >
      <motion.div
        animate={{ 
          x: checked ? 24 : 4,
          scale: isLoading ? 0.8 : 1
        }}
        initial={false}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center transition-colors duration-500 ${
          checked ? 'bg-[#D4AF37]' : 'bg-white/20'
        } ${isLoading ? 'bg-transparent' : ''}`}
      >
        {isLoading && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className={`w-4 h-4 border-2 border-t-transparent rounded-full ${
              checked ? 'border-white' : 'border-[#D4AF37]'
            }`}
          />
        )}
      </motion.div>
    </button>
  );
}
