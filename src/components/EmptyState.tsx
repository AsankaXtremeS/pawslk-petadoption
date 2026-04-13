import { motion } from 'framer-motion';
import { FaPaw as PawPrint } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

export default function EmptyState({ message }: { message?: string }) {
  const { t } = useTranslation();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center px-6"
    >
      <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-5 animate-float">
        <PawPrint className="h-9 w-9 text-primary/50" />
      </div>
      <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
        {message || t('emptyState.defaultMessage')}
      </h3>
      <p className="text-sm text-muted-foreground max-w-xs">
        {t('emptyState.subtitle')}
      </p>
    </motion.div>
  );
}
