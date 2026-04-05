import { useEffect, useState, useRef, type ReactNode } from 'react';
import { motion, useInView } from 'framer-motion';

interface AnimatedCounterProps {
  end: number;
  duration?: number;
  label: string;
  icon: ReactNode;
  iconColorClass?: string;
}

export default function AnimatedCounter({ end, duration = 2000, label, icon, iconColorClass = "bg-primary/10 text-primary" }: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress >= 1) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration, isInView]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 15 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      className="flex flex-row items-center gap-2 md:gap-4 p-2.5 md:p-4 w-full"
    >
      <div className={`w-9 h-9 md:w-12 md:h-12 rounded-full flex items-center justify-center shrink-0 border-2 md:border-[3px] border-background shadow-sm ${iconColorClass}`}>
        <div className="scale-75 md:scale-100">{icon}</div>
      </div>
      <div className="flex flex-col items-start leading-tight">
        <div className="text-lg md:text-2xl font-bold text-foreground tabular-nums tracking-tight">
          {count}
        </div>
        <div className="text-[10px] md:text-xs text-muted-foreground font-medium capitalize mt-0.5">
          {label}
        </div>
      </div>
    </motion.div>
  );
}
