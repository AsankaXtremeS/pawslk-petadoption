import { motion } from 'framer-motion';
import { FaPaw as PawPrint } from 'react-icons/fa';

/**
 * A sleek, centered loading screen for use with React Suspense.
 */
export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 min-h-screen w-full flex flex-col items-center justify-center bg-background z-[100]">
      <motion.div
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 1, 0.3],
          rotate: [0, 10, -10, 0]
        }}
        transition={{ 
          duration: 1.5, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="text-primary mb-4"
      >
        <PawPrint size={64} />
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-muted-foreground font-medium animate-pulse"
      >
        Loading Paws...
      </motion.p>
    </div>
  );
}
