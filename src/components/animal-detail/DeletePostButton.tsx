import { FaTrashAlt as TrashIcon } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { Button, type ButtonProps } from '@/components/ui/button';
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

interface DeletePostButtonProps {
  isPending: boolean;
  onConfirm: () => void;
  size: ButtonProps['size'];
  className: string;
  iconClassName: string;
}

/** Delete button with a confirmation dialog, shown to the post owner. */
export default function DeletePostButton({ isPending, onConfirm, size, className, iconClassName }: DeletePostButtonProps) {
  const { t } = useTranslation();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size={size} className={className}>
          {isPending ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              {t('profile.actions.deleting')}
            </>
          ) : (
            <>
              <TrashIcon className={iconClassName} />
              {t('profile.actions.delete')}
            </>
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="rounded-3xl w-[calc(100%-2rem)]">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-heading text-foreground font-bold">
            {t('profile.listings.deleteTitle')}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            {t('profile.listings.deleteDesc')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel className="rounded-2xl">{t('profile.actions.cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="rounded-2xl bg-destructive hover:bg-destructive/90"
          >
            <TrashIcon className="h-4 w-4 mr-2" />
            {t('profile.actions.delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
