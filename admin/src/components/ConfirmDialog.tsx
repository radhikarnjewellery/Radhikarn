import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, X } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = 'danger'
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-[#0a0a0a] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
          >
            {/* Header Accent */}
            <div className={`h-1.5 w-full ${
              variant === 'danger' ? 'bg-red-500' : 
              variant === 'warning' ? 'bg-[#D4AF37]' : 'bg-blue-500'
            }`} />

            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-full flex-shrink-0 ${
                  variant === 'danger' ? 'bg-red-500/10 text-red-500' : 
                  variant === 'warning' ? 'bg-[#D4AF37]/10 text-[#D4AF37]' : 'bg-blue-500/10 text-blue-500'
                }`}>
                  <AlertCircle size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{message}</p>
                </div>
                <button onClick={onClose} className="text-gray-500 hover:text-white transition">
                  <X size={20} />
                </button>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 rounded-xl bg-white/5 text-white text-sm font-bold hover:bg-white/10 transition border border-white/5"
                >
                  {cancelText}
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className={`flex-1 px-4 py-3 rounded-xl text-sm font-bold transition shadow-lg ${
                    variant === 'danger' ? 'bg-red-500 text-white hover:bg-red-600 shadow-red-500/20' : 
                    variant === 'warning' ? 'bg-[#D4AF37] text-black hover:bg-[#B8941F] shadow-[#D4AF37]/20' : 
                    'bg-blue-500 text-white hover:bg-blue-600 shadow-blue-500/20'
                  }`}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
