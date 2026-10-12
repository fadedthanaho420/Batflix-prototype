import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

const HeartbeatGauge = () => {
  const [load, setLoad] = useState(30);

  useEffect(() => {
    const interval = setInterval(() => {
      setLoad(prev => Math.min(Math.max(prev + (Math.random() - 0.5) * 10, 10), 90));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-3 bg-neutral-950/50 px-3 py-1.5 rounded-full border border-neutral-800">
      <div className="flex items-end gap-0.5 h-4">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="w-1 bg-emerald-500/80"
            animate={{
              height: [4, 8 + Math.random() * 8, 4],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.1,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      <span className="font-mono text-[10px] text-zinc-400">
        SYS_LOAD: {Math.round(load)}%
      </span>
    </div>
  );
};

export default HeartbeatGauge;
