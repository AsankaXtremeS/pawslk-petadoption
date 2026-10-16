import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaTrash as Trash,
  FaEdit as Edit,
  FaExclamationTriangle as AlertTriangle,
  FaCheckCircle as CheckCircle,
  FaHeart as Heart,
  FaEye as Eye,
  FaCat as Cat,
  FaDog as Dog,
  FaUndo as Undo,
} from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import type { Animal } from '@/hooks/useAnimals';
import { parsePhotoUrls } from '@/utils/imageCompression';
import { getDateLocale } from '@/lib/utils';
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

const ProfileListingCard = memo(function ProfileListingCard({ animal, onDelete, onToggleStatus }: { 
  animal: Animal; 
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, currentStatus: boolean) => void;
}) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const photoUrls = parsePhotoUrls(animal.photo_url);
  const coverUrl = photoUrls[0];
  const TypeIcon = animal.type === 'dog' ? Dog : Cat;

  return (
    <motion.div
      className="flex items-center gap-3 p-2 rounded-2xl border bg-background mb-2 transition-[border-color,shadow] hover:border-primary/20 hover:shadow-sm transform-gpu will-change-transform"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, transition: { duration: 0.2 } }}
      layout
    >
      {/* Thumbnail */}
      <div
        className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 relative cursor-pointer bg-muted transform-gpu"
        onClick={() => navigate(`/animals/${animal.id}`)}
      >
        {coverUrl ? (
          <img src={coverUrl} alt={`${animal.type} at ${animal.location_name}`} className="w-full h-full object-cover hover:scale-105 transition-transform" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-warm-gradient text-primary/30">
            <TypeIcon className="w-6 h-6" />
          </div>
        )}
        {/* Status badge */}
        <div className={`absolute bottom-0.5 left-0.5 inline-flex items-center gap-[2px] px-1.5 py-[1px] rounded-md text-[9px] font-bold ${animal.is_adopted ? 'bg-success text-success-foreground' : 'bg-waiting text-waiting-foreground'}`}>
          {animal.is_adopted ? <CheckCircle className="w-[7px] h-[7px]" /> : <Heart className="w-[7px] h-[7px]" />}
          <span>{animal.is_adopted ? t('browse.adopted') : t('browse.waiting')}</span>
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 text-sm font-bold truncate">
          <TypeIcon className="w-3.5 h-3.5 text-primary/60 flex-shrink-0" />
          <span className="capitalize truncate">{t('common.animalTitle.' + animal.type, { location: animal.location_name })}</span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <p className="text-[11px] text-muted-foreground font-medium">
            {new Date(animal.created_at).toLocaleDateString(getDateLocale(i18n.language), { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
          <div className="w-[1px] h-2.5 bg-border" />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="text-[11px] font-bold text-destructive/70 hover:text-destructive flex items-center gap-1 transition-colors" title={t('common.delete')}>
                <Trash className="w-2.5 h-2.5" />
                <span>{t('common.delete')}</span>
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-2xl w-[calc(100%-2rem)]">
              <AlertDialogHeader>
                <AlertDialogTitle className="font-heading inline-flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  {t('profile.listings.deleteTitle')}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {t('profile.listings.deleteDesc', { type: t('common.animalTitle.' + animal.type, { location: animal.location_name }), location: animal.location_name })}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-xl">{t('profile.actions.cancel')}</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(animal.id)}
                  className="rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                >
                  {t('profile.actions.delete')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-1 flex-shrink-0">
        <button
          className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
          onClick={() => navigate(`/animals/${animal.id}`)}
          title={t('common.view')}
        >
          <Eye className="w-3 h-3" />
        </button>
        {animal.is_adopted ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                className="w-8 h-8 rounded-lg flex items-center justify-center text-success hover:bg-success/10 transition-colors"
                title={t('detail.undoAdoption')}
              >
                <Undo className="w-3 h-3" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-2xl w-[calc(100%-2rem)]">
              <AlertDialogHeader>
                <AlertDialogTitle className="font-heading">
                  {t('detail.confirmUndoTitle')}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {t('detail.confirmUndoDesc')}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-xl">{t('profile.actions.cancel')}</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => onToggleStatus(animal.id, animal.is_adopted)} 
                  className="rounded-xl bg-primary hover:bg-primary/90"
                >
                  {t('detail.yesUndo')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : (
          <button
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
            onClick={() => navigate(`/report?edit=${animal.id}`)}
            title={t('common.edit')}
          >
            <Edit className="w-3 h-3" />
          </button>
        )}
      </div>
    </motion.div>
  );
});

export default ProfileListingCard;
