import { motion } from 'framer-motion';
import { FaPaw as PawPrint } from 'react-icons/fa';

export default function EmptyState({ message = "No animals found" }: { message?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center px-6"
    >
      <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-5 animate-float">
        <PawPrint className="h-9 w-9 text-primary/50" />
      </div>
      <h3 className="font-heading text-xl font-semibold text-foreground mb-2">{message}</h3>
      <p className="text-sm text-muted-foreground max-w-xs">
        Check back later or report a stray to help a furry friend in need.
      </p>
    </motion.div>
  );
}
