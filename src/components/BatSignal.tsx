import React from 'react';
import { motion } from 'motion/react';

export default function BatSignal({ isDegraded }: { isDegraded: boolean }) {
  if (!isDegraded) return null;

  return (
    <div className="absolute top-6 left-6 z-40">
      <motion.div
        animate={{ opacity: [0.2, 0.8, 0.2], scale: [0.9, 1.1, 0.9] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="h-16 w-16 rounded-full bg-yellow-500/30 flex items-center justify-center shadow-[0_0_25px_rgba(234,179,8,0.5)]"
      >
        <svg className="h-8 w-12 text-yellow-500 fill-current" viewBox="0 0 24 12">
          <path d="M12 1.5c.3 1.2 1 2.2 2 2.8.8.5 1.7.6 2.5.5.9-.1 1.8-.4 2.5-.9.4.6.6 1.3.6 2.1 0 2.2-2.2 4-5 4.5-.8.1-1.6.1-2.4-.1-1.1-.3-2-.9-2.5-1.7-.5.8-1.4 1.4-2.5 1.7-.8.2-1.6.2-2.4.1-2.8-.5-5-2.3-5-4.5 0-.8.2-1.5.6-2.1.7.5 1.6.8 2.5.9.8.1 1.7 0 2.5-.5 1-.6 1.7-1.6 2-2.8.2.8.5 1.5 1 2.1.5-.6.8-1.3 1-2.1z" />
        </svg>
      </motion.div>
    </div>
  );
}
