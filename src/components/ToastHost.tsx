import { AnimatePresence, motion } from 'framer-motion';
import { useToastStore } from '../store/toastStore';

export default function ToastHost() {
  const message = useToastStore((s) => s.message);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex justify-center px-4">
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="glow-cyan rounded-full border border-cyan-dim bg-surface-2 px-4 py-2.5 text-xs font-semibold text-text shadow-lg"
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
