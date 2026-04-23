import { useEffect, useState, useRef, type ReactNode } from 'react';
import { motion, useInView } from 'framer-motion';

interface AnimatedCounterProps {
  end: number;
  duration?: number;
  label: string;
  icon: ReactNode;
  iconColorClass?: string;
  className?: string;
}

export default function AnimatedCounter({ end, duration = 2000, label, icon, iconColorClass = "bg-primary/10 text-primary", className = "" }: AnimatedCounterProps) {
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
      className="flex flex-row items-center gap-3 p-2 md:p-3.5 w-full"
    >
      <div className={`w-8 h-8 md:w-11 md:h-11 rounded-full flex items-center justify-center shrink-0 border-2 border-background shadow-sm ${iconColorClass}`}>
        <div className="scale-75 md:scale-100">{icon}</div>
      </div>
      <div className="flex flex-col items-start leading-none gap-0.5">
        <div className="text-base md:text-xl font-bold text-foreground tabular-nums tracking-tight">
          {count}
        </div>
        <div className="text-[9px] md:text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
          {label}
        </div>
      </div>
    </motion.div>
  );
}
