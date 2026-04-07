import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaPaw as PawPrint,
  FaPhone as Phone,
  FaGlobeAsia as Globe,
  FaList as ListIcon,
  FaTrash as Trash,
  FaEdit as Edit,
  FaSignOutAlt as LogOut,
  FaExclamationTriangle as AlertTriangle,
  FaCheckCircle as CheckCircle,
  FaHeart as Heart,
  FaEye as Eye,
  FaTimes as X,
  FaCat as Cat,
  FaDog as Dog,
  FaChevronRight as ChevronRight,
} from 'react-icons/fa';
import { useUser } from '@/contexts/UserContext';
import { useUserAnimals, useDeleteAnimal, type Animal } from '@/hooks/useAnimals';
import { parsePhotoUrls } from '@/utils/imageCompression';
import { friendlyError } from '@/utils/errors';
import { toast } from 'sonner';
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

const countryCodes = [
  { code: '+94', country: 'Sri Lanka', flag: '🇱🇰' },
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+1', country: 'USA', flag: '🇺🇸' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬' },
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
  { code: '+82', country: 'South Korea', flag: '🇰🇷' },
  { code: '+81', country: 'Japan', flag: '🇯🇵' },
];

const languages = [
  { code: 'en' as const, label: 'English', nativeLabel: 'English', flag: '🇬🇧' },
  { code: 'si' as const, label: 'Sinhala', nativeLabel: 'සිංහල', flag: '🇱🇰' },
  { code: 'ta' as const, label: 'Tamil', nativeLabel: 'தமிழ்', flag: '🇱🇰' },
];

function ProfileListingCard({ animal, onDelete }: { animal: Animal; onDelete: (id: string) => void }) {
  const navigate = useNavigate();
  const photoUrls = parsePhotoUrls(animal.photo_url);
  const coverUrl = photoUrls[0];
  const TypeIcon = animal.type === 'dog' ? Dog : Cat;

  return (
    <motion.div
      className="flex items-center gap-3 p-2 rounded-2xl border bg-background mb-2 transition-all hover:border-primary/20 hover:shadow-sm"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, transition: { duration: 0.2 } }}
      layout
    >
      {/* Thumbnail */}
      <div
        className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 relative cursor-pointer bg-muted"
        onClick={() => navigate(`/animals/${animal.id}`)}
      >
        {coverUrl ? (
          <img src={coverUrl} alt={`${animal.type} at ${animal.location_name}`} className="w-full h-full object-cover hover:scale-105 transition-transform" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-warm-gradient text-primary/30">
            <TypeIcon className="w-6 h-6" />
          </div>
        )}
        {/* Status badge */}
        <div className={`absolute bottom-0.5 left-0.5 inline-flex items-center gap-[2px] px-1.5 py-[1px] rounded-md text-[9px] font-bold ${animal.is_adopted ? 'bg-success text-success-foreground' : 'bg-waiting text-waiting-foreground'}`}>
          {animal.is_adopted ? <CheckCircle className="w-[7px] h-[7px]" /> : <Heart className="w-[7px] h-[7px]" />}
          <span>{animal.is_adopted ? 'Adopted' : 'Waiting'}</span>
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 text-sm font-bold truncate">
          <TypeIcon className="w-3.5 h-3.5 text-primary/60 flex-shrink-0" />
          <span className="capitalize truncate">{animal.type} in {animal.location_name}</span>
        </div>
        <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
          {new Date(animal.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-1 flex-shrink-0">
        <button
          className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all"
          onClick={() => navigate(`/animals/${animal.id}`)}
          title="View"
        >
          <Eye className="w-3 h-3" />
        </button>
        {!animal.is_adopted && (
          <button
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all"
            onClick={() => navigate(`/report?edit=${animal.id}`)}
            title="Edit"
          >
            <Edit className="w-3 h-3" />
          </button>
        )}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all" title="Delete">
              <Trash className="w-3 h-3" />
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent className="mx-4 rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-heading inline-flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Delete Listing
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to permanently delete this {animal.type} listing from {animal.location_name}? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(animal.id)}
                className="rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </motion.div>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const { user, updateUser, deleteAccount, clearUser } = useUser();
  const { data: userAnimals, isLoading: animalsLoading } = useUserAnimals(user?.id);
  const deleteAnimal = useDeleteAnimal();

  // Edit states
  const [editingPhone, setEditingPhone] = useState(false);
  const [newCountryCode, setNewCountryCode] = useState(user?.countryCode || '+94');
  const [newMobile, setNewMobile] = useState('');
  const [phoneSaving, setPhoneSaving] = useState(false);

  const [editingLang, setEditingLang] = useState(false);
  const [langSaving, setLangSaving] = useState(false);

  const [deletingAccount, setDeletingAccount] = useState(false);

  if (!user) {
    navigate('/login');
    return null;
  }

  const formatDisplayMobile = (mobile: string) => {
    if (!mobile) return '';
    return mobile.startsWith('+') ? mobile : `+${mobile}`;
  };

  const handlePhoneSave = async () => {
    const clean = newMobile.replace(/\s/g, '');
    if (!clean) { toast.error('Phone number is required'); return; }
    if (!/^[0-9]{7,15}$/.test(clean)) { toast.error('Enter a valid phone number'); return; }

    setPhoneSaving(true);
    try {
      const fullMobile = newCountryCode.replace('+', '') + clean;
      await updateUser({ mobile: fullMobile, countryCode: newCountryCode });
      toast.success('Phone number updated!');
      setEditingPhone(false);
      setNewMobile('');
    } catch (err) {
      toast.error(friendlyError(err, 'Failed to update phone number.'));
    } finally {
      setPhoneSaving(false);
    }
  };

  const handleLanguageChange = async (lang: 'en' | 'si' | 'ta') => {
    if (lang === user.language) return;
    setLangSaving(true);
    try {
      await updateUser({ language: lang });
      toast.success('Language updated!');
      setEditingLang(false);
    } catch (err) {
      toast.error(friendlyError(err, 'Failed to update language.'));
    } finally {
      setLangSaving(false);
    }
  };

  const handleDeleteListing = async (animalId: string) => {
    try {
      await deleteAnimal.mutateAsync({ id: animalId, userToken: user.userToken });
      toast.success('Listing deleted');
    } catch (err) {
      toast.error(friendlyError(err, 'Failed to delete listing.'));
    }
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      await deleteAccount();
      toast.success('Account deleted. We\'re sorry to see you go.');
      navigate('/', { replace: true });
    } catch (err) {
      toast.error(friendlyError(err, 'Failed to delete account.'));
    } finally {
      setDeletingAccount(false);
    }
  };

  const currentLang = languages.find(l => l.code === user.language) || languages[0];
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
          <div className="w-[60px] h-[60px] rounded-full bg-gradient-to-br from-primary to-[hsl(173_58%_28%)] flex items-center justify-center flex-shrink-0 shadow-glow">
            <span className="text-primary-foreground text-2xl font-extrabold leading-none">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-heading font-extrabold truncate">{user.name}</h1>
            <p className="text-sm text-muted-foreground font-medium mt-0.5">{formatDisplayMobile(user.mobile)}</p>
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
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Total</span>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="flex-1 flex flex-col items-center gap-0.5">
            <span className="text-2xl font-extrabold text-orange-500">{waitingCount}</span>
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Waiting</span>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="flex-1 flex flex-col items-center gap-0.5">
            <span className="text-2xl font-extrabold text-emerald-500">{adoptedCount}</span>
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Adopted</span>
          </div>
        </motion.div>

        {/* Settings Sections */}
        <div className="flex flex-col gap-3">

          {/* Phone Number */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border rounded-2xl overflow-hidden transition-shadow hover:shadow-sm">
            <div className="flex items-center gap-3 p-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center text-primary flex-shrink-0">
                <Phone className="w-[18px] h-[18px]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold">Phone Number</h3>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{formatDisplayMobile(user.mobile)}</p>
              </div>
              <button
                className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all flex-shrink-0"
                onClick={() => { setEditingPhone(!editingPhone); setNewMobile(''); }}
              >
                {editingPhone ? <X className="w-3.5 h-3.5" /> : <Edit className="w-3.5 h-3.5" />}
              </button>
            </div>

            <AnimatePresence>
              {editingPhone && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden border-t"
                >
                  <div className="p-4 flex flex-col gap-3">
                    <div className="rf-input-wrapper rf-mobile-input">
                      <select
                        className="rf-country-code"
                        value={newCountryCode}
                        onChange={(e) => setNewCountryCode(e.target.value)}
                        aria-label="Country code"
                      >
                        {countryCodes.map(cc => (
                          <option key={cc.code} value={cc.code}>{cc.flag} {cc.code}</option>
                        ))}
                      </select>
                      <div className="rf-input-divider" />
                      <input
                        type="tel"
                        className="rf-input"
                        placeholder="7X XXX XXXX"
                        value={newMobile}
                        onChange={(e) => setNewMobile(e.target.value.replace(/[^0-9\s]/g, ''))}
                        autoComplete="tel"
                      />
                    </div>
                    <button
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-[hsl(173_58%_32%)] text-primary-foreground font-bold text-sm shadow-glow hover:shadow-lg hover:-translate-y-px transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:translate-y-0"
                      onClick={handlePhoneSave}
                      disabled={phoneSaving}
                    >
                      {phoneSaving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Language */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-card border rounded-2xl overflow-hidden transition-shadow hover:shadow-sm">
            <div className="flex items-center gap-3 p-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center text-primary flex-shrink-0">
                <Globe className="w-[18px] h-[18px]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold">Language</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{currentLang.flag} {currentLang.nativeLabel}</p>
              </div>
              <button
                className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all flex-shrink-0"
                onClick={() => setEditingLang(!editingLang)}
              >
                {editingLang ? <X className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            </div>

            <AnimatePresence>
              {editingLang && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden border-t"
                >
                  <div className="p-4 flex flex-col gap-2">
                    {languages.map(lang => (
                      <button
                        key={lang.code}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border-[1.5px] w-full text-left transition-all ${
                          user.language === lang.code
                            ? 'border-primary bg-primary/5'
                            : 'border-border bg-background hover:border-primary/30 hover:bg-primary/[0.02]'
                        }`}
                        onClick={() => handleLanguageChange(lang.code)}
                        disabled={langSaving}
                      >
                        <span className="text-lg">{lang.flag}</span>
                        <span className="text-sm font-bold flex-1">{lang.nativeLabel}</span>
                        {user.language === lang.code && <CheckCircle className="w-4 h-4 text-primary" />}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* My Listings */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card border rounded-2xl overflow-hidden">
            <div className="flex items-center gap-3 p-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center text-primary flex-shrink-0">
                <ListIcon className="w-[18px] h-[18px]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold">My Listings</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{userAnimals?.length || 0} posts</p>
              </div>
              <Link to="/report" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-bold no-underline hover:bg-primary/15 transition-all flex-shrink-0">
                <PawPrint className="w-3 h-3" />
                <span>Add New</span>
              </Link>
            </div>

            <div className="px-4 pb-4">
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
                    />
                  ))}
                </AnimatePresence>
              ) : (
                <div className="flex flex-col items-center gap-2 py-6 text-center">
                  <PawPrint className="w-8 h-8 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground font-medium">No listings yet</p>
                  <Link to="/report" className="text-xs font-bold text-primary underline underline-offset-2">
                    Report a stray
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
              <span>Log Out</span>
            </button>
          </motion.div>

          {/* Danger Zone */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-destructive/[0.03] border border-destructive/15 rounded-2xl p-5"
          >
            <h4 className="flex items-center gap-2 text-sm font-extrabold text-destructive mb-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Danger Zone</span>
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
              Permanently delete your account and all your animal listings. This action cannot be undone.
            </p>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-[1.5px] border-destructive/30 text-destructive text-sm font-bold hover:bg-destructive/[0.08] hover:border-destructive transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={deletingAccount}
                >
                  <Trash className="w-3.5 h-3.5" />
                  <span>{deletingAccount ? 'Deleting...' : 'Delete Account'}</span>
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent className="mx-4 rounded-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-heading inline-flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                    Delete Account Permanently
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete your account, all your animal listings and their photos.
                    <strong> This cannot be undone.</strong>
                    <br /><br />
                    Are you absolutely sure?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                  >
                    Yes, Delete Everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
