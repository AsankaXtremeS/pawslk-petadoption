import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes as X } from 'react-icons/fa';

interface SettingsCardProps {
  icon: ReactNode;
  title: string;
  subtitle: ReactNode;
  truncateSubtitle?: boolean;
  open: boolean;
  onToggle: () => void;
  /** Icon shown on the toggle button while the card is closed */
  toggleIcon: ReactNode;
  delay: number;
  children: ReactNode;
}

/** Collapsible settings row used on the Profile page. */
export default function SettingsCard({
  icon,
  title,
  subtitle,
  truncateSubtitle = false,
  open,
  onToggle,
  toggleIcon,
  delay,
  children,
}: SettingsCardProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="bg-card border rounded-2xl overflow-hidden transition-shadow hover:shadow-sm">
      <div className="flex items-center gap-3 p-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center text-primary flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold">{title}</h3>
          <p className={`text-xs text-muted-foreground ${truncateSubtitle ? 'truncate ' : ''}mt-0.5`}>{subtitle}</p>
        </div>
        <button
          className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all flex-shrink-0"
          onClick={onToggle}
        >
          {open ? <X className="w-3.5 h-3.5" /> : toggleIcon}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
