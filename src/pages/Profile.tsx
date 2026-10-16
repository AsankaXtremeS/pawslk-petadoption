import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaPaw as PawPrint,
  FaList as ListIcon,
  FaSignOutAlt as LogOut,
} from 'react-icons/fa';
import { useUser } from '@/contexts/UserContext';
import { useUserAnimals, useDeleteAnimal, useMarkAdopted } from '@/hooks/useAnimals';
import { friendlyError } from '@/utils/errors';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { formatPhone } from '@/lib/utils';
import ProfileListingCard from '@/components/profile/ProfileListingCard';
import PhoneSettings from '@/components/profile/PhoneSettings';
import LanguageSettings from '@/components/profile/LanguageSettings';
import PasswordSettings from '@/components/profile/PasswordSettings';
import DangerZone from '@/components/profile/DangerZone';

export default function Profile() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, clearUser } = useUser();
  const { data: userAnimals, isLoading: animalsLoading } = useUserAnimals(user?.id);
  const deleteAnimal = useDeleteAnimal();
  const toggleStatus = useMarkAdopted();

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleDeleteListing = async (animalId: string) => {
    try {
      await deleteAnimal.mutateAsync({ id: animalId, userToken: user.userToken });
      toast.success('Listing deleted');
    } catch (err) {
      toast.error(friendlyError(err, 'Failed to delete listing.'));
    }
  };

  const handleToggleStatus = async (animalId: string, currentStatus: boolean) => {
    try {
      await toggleStatus.mutateAsync({
        id: animalId,
        userId: user!.id,
        userToken: user!.userToken,
        isAdopted: !currentStatus
      });
      toast.success(currentStatus ? t('detail.undoSuccess') : t('detail.adoptedSuccess'));
    } catch (err) {
      toast.error(friendlyError(err, 'Failed to update status.'));
    }
  };

  const waitingCount = userAnimals?.filter(a => !a.is_adopted).length || 0;
  const adoptedCount = userAnimals?.filter(a => a.is_adopted).length || 0;

  return (
    <div className="px-4 md:px-0 md:container py-6 md:py-10">
      <div className="max-w-lg mx-auto">

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-6"
        >
          <div className="w-[60px] h-[60px] rounded-full bg-gradient-to-br from-primary to-[hsl(173_60%_30%)] flex items-center justify-center flex-shrink-0 shadow-glow">
            <span className="text-primary-foreground text-2xl font-extrabold leading-none">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-heading font-extrabold truncate">{user.name}</h1>
            <p className="text-sm text-muted-foreground font-medium mt-0.5">{formatPhone(user.mobile)}</p>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="flex items-center justify-center p-4 bg-card border rounded-2xl mb-6"
        >
          <div className="flex-1 flex flex-col items-center gap-0.5">
            <span className="text-2xl font-extrabold">{userAnimals?.length || 0}</span>
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{t('profile.stats.total')}</span>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="flex-1 flex flex-col items-center gap-0.5">
            <span className="text-2xl font-extrabold text-orange-500">{waitingCount}</span>
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{t('profile.stats.waiting')}</span>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="flex-1 flex flex-col items-center gap-0.5">
            <span className="text-2xl font-extrabold text-emerald-500">{adoptedCount}</span>
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{t('profile.stats.adopted')}</span>
          </div>
        </motion.div>

        {/* Settings Sections */}
        <div className="flex flex-col gap-3">

          <PhoneSettings user={user} />
          <LanguageSettings user={user} />
          <PasswordSettings />

          {/* My Listings */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card border rounded-2xl overflow-hidden">
            <div className="flex items-center gap-3 p-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center text-primary flex-shrink-0">
                <ListIcon className="w-[18px] h-[18px]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold">{t('profile.listings.title')}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{t('profile.listings.posts', { count: userAnimals?.length || 0 })}</p>
              </div>
              <Link to="/report" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-bold no-underline hover:bg-primary/15 transition-all flex-shrink-0">
                <PawPrint className="w-3 h-3" />
                <span>{t('profile.listings.addNew')}</span>
              </Link>
            </div>

            <div className="px-4 pb-4 contain-layout">
              {animalsLoading ? (
                <div className="space-y-2">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="h-[72px] bg-muted/50 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : userAnimals && userAnimals.length > 0 ? (
                <AnimatePresence>
                  {userAnimals.map(animal => (
                    <ProfileListingCard
                      key={animal.id}
                      animal={animal}
                      onDelete={handleDeleteListing}
                      onToggleStatus={handleToggleStatus}
                    />
                  ))}
                </AnimatePresence>
              ) : (
                <div className="flex flex-col items-center gap-2 py-6 text-center">
                  <PawPrint className="w-8 h-8 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground font-medium">{t('profile.listings.noListings')}</p>
                  <Link to="/report" className="text-xs font-bold text-primary underline underline-offset-2">
                    {t('profile.listings.reportLink')}
                  </Link>
                </div>
              )}
            </div>
          </motion.div>

          {/* Logout */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <button
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl border bg-card text-muted-foreground font-bold text-sm hover:bg-muted hover:text-foreground transition-all"
              onClick={clearUser}
            >
              <LogOut className="w-4 h-4" />
              <span>{t('profile.actions.logout')}</span>
            </button>
          </motion.div>

          <DangerZone />

        </div>
      </div>
    </div>
  );
}
