import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "primary";
  isLoading?: boolean;
  loadingText?: string;
}

export const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "primary",
  isLoading = false,
  loadingText = "Processing..."
}: ConfirmationModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md glass-card rounded-[2.5rem] border-[#D4AF37]/20 p-8 md:p-10 shadow-2xl overflow-hidden text-center"
          >
            {/* Background Decor */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#D4AF37]/5 blur-[60px] rounded-full"></div>
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-[#D4AF37]/5 blur-[60px] rounded-full"></div>

            <div className="relative space-y-8">
              {/* Icon */}
              <div className="flex justify-center">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-inner ${
                  variant === "danger" 
                    ? "bg-red-500/10 text-red-500 border border-red-500/20" 
                    : "bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20"
                }`}>
                  <AlertCircle size={32} strokeWidth={1.5} />
                </div>
              </div>

              {/* Text Content */}
              <div className="space-y-4">
                <h3 className="text-2xl font-display text-white uppercase tracking-tight leading-tight">
                  {title}
                </h3>
                <p className="text-[#888] text-xs font-medium leading-relaxed tracking-wider italic px-4">
                  {message}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 pt-4">
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className={`w-full py-4 rounded-full text-[10px] uppercase font-black tracking-[0.3em] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg flex items-center justify-center gap-3 ${
                    isLoading 
                      ? "opacity-60 cursor-not-allowed bg-[#222] text-white" 
                      : variant === "danger"
                        ? "bg-red-500 text-white shadow-red-500/20"
                        : "bg-[#D4AF37] text-black shadow-[#D4AF37]/20"
                  }`}
                >
                  {isLoading ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      {loadingText}
                    </>
                  ) : confirmText}
                </button>
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="w-full py-4 rounded-full bg-white/[0.02] border border-white/10 text-white/40 text-[10px] uppercase font-black tracking-[0.3em] hover:bg-white/5 transition-all disabled:opacity-0"
                >
                  {cancelText}
                </button>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 text-white/20 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
