import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaExclamationTriangle as AlertTriangle, FaTrash as Trash } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useUser } from '@/contexts/UserContext';
import { friendlyError } from '@/utils/errors';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function DangerZone() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { deleteAccount } = useUser();
  const [deletingAccount, setDeletingAccount] = useState(false);

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      await deleteAccount();
      toast.success(t('profile.success.accountDeleted'));
      navigate('/', { replace: true });
    } catch (err) {
      toast.error(friendlyError(err, 'Failed to delete account.'));
    } finally {
      setDeletingAccount(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-destructive/[0.03] border border-destructive/15 rounded-2xl p-5"
    >
      <h4 className="flex items-center gap-2 text-sm font-extrabold text-destructive mb-2">
        <AlertTriangle className="w-4 h-4" />
        <span>{t('profile.dangerZone.title')}</span>
      </h4>
      <p className="text-xs text-muted-foreground leading-relaxed mb-4">
        {t('profile.dangerZone.desc')}
      </p>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-[1.5px] border-destructive/30 text-destructive text-sm font-bold hover:bg-destructive/[0.08] hover:border-destructive transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={deletingAccount}
          >
            <Trash className="w-3.5 h-3.5" />
            <span>{deletingAccount ? t('profile.actions.deleting') : t('profile.actions.deleteAccount')}</span>
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent className="rounded-2xl w-[calc(100%-2rem)]">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading inline-flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              {t('profile.dangerZone.dialogTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('profile.dangerZone.dialogDesc')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">{t('profile.actions.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {t('profile.dangerZone.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
