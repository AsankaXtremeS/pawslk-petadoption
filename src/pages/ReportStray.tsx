import { useState, useEffect } from 'react';
import { useReportAnimal, useUploadPhoto, useAnimal, useUpdateAnimal } from '@/hooks/useAnimals';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCamera as Camera, FaCat as Cat, FaDog as Dog, FaMapMarkerAlt as MapPin, FaMars as Mars, FaPaw as PawPrint, FaVenus as Venus, FaCrosshairs as Crosshairs, FaTimes as X, FaPlus as Plus } from 'react-icons/fa';
import { parsePhotoUrls } from '@/utils/imageCompression';
import { useTranslation } from 'react-i18next';

const MAX_PHOTOS = 3;

export default function ReportStray() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const isEditing = !!editId;
  const paramType = searchParams.get('type');

  const { user } = useUser();
  const reportAnimal = useReportAnimal();
  const updateAnimal = useUpdateAnimal();
  const uploadPhoto = useUploadPhoto();

  // If editing, fetch existing animal data
  const { data: existingAnimal } = useAnimal(editId || '');

  const [step, setStep] = useState<'choose' | 'form'>(
    isEditing || paramType === 'adopt' || paramType === 'lost' ? 'form' : 'choose'
  );

  const [form, setForm] = useState({
    type: 'dog' as 'dog' | 'cat',
    gender: 'male' as 'male' | 'female',
    location_name: '',
    description: '',
    reporter_name: user?.name || '',
    post_type: (paramType === 'lost' ? 'lost' : 'adopt') as 'adopt' | 'lost',
  });
  // Up to 3 photos — each slot has a File (new) or null (empty/existing)
  const [photos, setPhotos] = useState<(File | null)[]>([null, null, null]);
  const [photoPreviews, setPhotoPreviews] = useState<(string | null)[]>([null, null, null]);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Track existing URLs (for edit mode — slots that haven't changed)
  const [existingUrls, setExistingUrls] = useState<(string | null)[]>([null, null, null]);

  // Pre-fill form data for editing
  useEffect(() => {
    if (isEditing && existingAnimal) {
      setStep('form');
      // Security check: only owner can edit
      if (user && existingAnimal.user_id !== user.id) {
        toast.error(t('report.errors.editOwnOnly'));
        navigate('/animals');
        return;
      }
      setForm({
        type: existingAnimal.type,
        gender: existingAnimal.gender,
        location_name: existingAnimal.location_name,
        description: existingAnimal.description || '',
        reporter_name: existingAnimal.reporter_name || user?.name || '',
        post_type: existingAnimal.post_type || 'adopt',
      });
      if (existingAnimal.photo_url) {
        const urls = parsePhotoUrls(existingAnimal.photo_url);
        const previews: (string | null)[] = [null, null, null];
        const existing: (string | null)[] = [null, null, null];
        urls.forEach((url, i) => {
          if (i < MAX_PHOTOS) {
            previews[i] = url;
            existing[i] = url;
          }
        });
        setPhotoPreviews(previews);
        setExistingUrls(existing);
      }
    }
  }, [existingAnimal, isEditing, user, navigate, t]);

  // Auto-fill reporter name from user context
  useEffect(() => {
    if (user?.name && !isEditing) {
      setForm(f => ({ ...f, reporter_name: user.name }));
    }
  }, [user, isEditing]);

  const filledCount = photoPreviews.filter(p => p !== null).length;

  const handlePhotoChange = (startTimeIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    const newPhotos = [...photos];
    const newPreviews = [...photoPreviews];
    const newExisting = [...existingUrls];

    // Loop through selected files and fill slots starting from the clicked index
    Array.from(selectedFiles).forEach((file, i) => {
      const targetIndex = startTimeIndex + i;
      if (targetIndex < MAX_PHOTOS) {
        // Validate size for each file
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name}: ${t('report.errors.sizeLimit')}`);
          return;
        }

        // Revoke old object URL if exists
        if (newPreviews[targetIndex] && newPhotos[targetIndex]) {
          URL.revokeObjectURL(newPreviews[targetIndex]!);
        }

        newPhotos[targetIndex] = file;
        newPreviews[targetIndex] = URL.createObjectURL(file);
        newExisting[targetIndex] = null;
      }
    });

    setPhotos(newPhotos);
    setPhotoPreviews(newPreviews);
    setExistingUrls(newExisting);
    
    // Clear input so same files can be selected again if needed
    e.target.value = '';
  };

  const removePhoto = (index: number) => {
    const newPhotos = [...photos];
    const newPreviews = [...photoPreviews];
    const newExisting = [...existingUrls];

    // Revoke object URL if it was a local file preview
    if (newPreviews[index] && newPhotos[index]) {
      URL.revokeObjectURL(newPreviews[index]!);
    }

    newPhotos[index] = null;
    newPreviews[index] = null;
    newExisting[index] = null;
    setPhotos(newPhotos);
    setPhotoPreviews(newPreviews);
    setExistingUrls(newExisting);
  };

  const getNearestLocation = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
        {
          headers: {
            'User-Agent': 'PawConnect-PetAdoptionApp/1.0',
          },
        }
      );
      if (!response.ok) throw new Error('Reverse geocode failed');
      const data = await response.json();
      return (
        data.address?.city ||
        data.address?.town ||
        data.address?.village ||
        data.address?.hamlet ||
        data.address?.county ||
        data.address?.state ||
        'Current location'
      );
    } catch {
      return 'Current location';
    }
  };

  const handleFetchLocation = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }
    setIsFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async position => {
        const nearestLocation = await getNearestLocation(
          position.coords.latitude,
          position.coords.longitude,
        );
        setForm(f => ({ ...f, location_name: f.location_name.trim() || nearestLocation }));
        toast.success(t('report.success.locationFound'));
        setIsFetchingLocation(false);
      },
      () => {
        toast.error('Unable to fetch location. Please allow location access and try again.');
        setIsFetchingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.location_name.trim()) {
      toast.error(t('report.errors.locationRequired'));
      return;
    }

    // At least one photo required
    const hasAnyPhoto = photos.some(p => p !== null) || existingUrls.some(u => u !== null);
    if (!hasAnyPhoto) {
      toast.error(t('report.errors.photoRequired'));
      return;
    }

    setIsSubmitting(true);
    try {
      // Upload all new photos & collect final URLs
      const finalUrls: string[] = [];
      for (let i = 0; i < MAX_PHOTOS; i++) {
        if (photos[i]) {
          // New file — upload with compression
          const url = await uploadPhoto.mutateAsync(photos[i]!);
          finalUrls.push(url);
        } else if (existingUrls[i]) {
          // Keep existing URL
          finalUrls.push(existingUrls[i]!);
        }
      }

      // Store as JSON array
      const photo_url = finalUrls.length > 0 ? JSON.stringify(finalUrls) : undefined;

      if (isEditing && editId) {
        // Update existing animal
        await updateAnimal.mutateAsync({
          id: editId,
          userToken: user?.userToken || '',
          updates: {
            type: form.type,
            gender: form.gender,
            location_name: form.location_name.trim(),
            description: form.description.trim() || undefined,
            post_type: form.post_type,
            ...(photo_url ? { photo_url } : {}),
          },
        });
        toast.success(t('report.success.updated'));
        navigate(`/animals/${editId}`);
      } else {
        // Create new animal with user_id and contact_number
        await reportAnimal.mutateAsync({
          type: form.type,
          gender: form.gender,
          location_name: form.location_name.trim(),
          description: form.description.trim() || undefined,
          reporter_name: form.reporter_name.trim() || undefined,
          photo_url,
          user_id: user?.id,
          contact_number: user?.mobile || undefined,
          post_type: form.post_type,
        });
        toast.success(t('report.success.reported'));
        navigate('/animals');
      }
    } catch {
      toast.error(t('report.errors.genericError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === 'choose') {
    return (
      <div className="px-4 md:px-0 md:container py-12 md:py-20 flex items-center justify-center min-h-[70vh]">
        <div className="max-w-2xl w-full text-center space-y-8">
          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-heading font-black tracking-tight text-foreground">
              What would you like to report?
            </h1>
            <p className="text-sm md:text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
              Choose the listing type that best describes the pet you are reporting.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6 mt-8">
            {/* Option 1: Stray for Adoption */}
            <motion.button
              whileHover={{ y: -6, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setForm(f => ({ ...f, post_type: 'adopt' }));
                setStep('form');
              }}
              className="group flex flex-col items-center text-center p-6 md:p-8 rounded-3xl bg-white/60 dark:bg-card/60 backdrop-blur-md border border-white/20 dark:border-border/10 shadow-soft hover:shadow-glow hover:shadow-success/5 transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-green-400 to-emerald-500" />
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <PawPrint className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-black font-heading text-foreground mb-2">Report a Stray</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Found a stray dog or cat in need of a home? Submit details to help connect them with loving families.
              </p>
            </motion.button>

            {/* Option 2: Lost Pet */}
            <motion.button
              whileHover={{ y: -6, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setForm(f => ({ ...f, post_type: 'lost' }));
                setStep('form');
              }}
              className="group flex flex-col items-center text-center p-6 md:p-8 rounded-3xl bg-white/60 dark:bg-card/60 backdrop-blur-md border border-white/20 dark:border-border/10 shadow-soft hover:shadow-glow hover:shadow-red-500/5 transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-red-400 to-rose-500" />
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 relative">
                <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-red-500 border-2 border-background animate-ping" />
                <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-red-500 border-2 border-background" />
                <Dog className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-black font-heading text-foreground mb-2">Report a Lost Pet</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Lost your family pet? Share their details here so the local community can help you find and reunite them.
              </p>
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-0 md:container py-6 md:py-10">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          {!isEditing && (
            <button
              type="button"
              onClick={() => setStep('choose')}
              className="inline-flex items-center gap-1.5 text-xs text-primary font-bold hover:underline mb-3"
            >
              ← Change listing type ({form.post_type === 'lost' ? 'Lost Pet' : 'For Adoption'})
            </button>
          )}
          <h1 className="text-2xl md:text-3xl font-heading font-bold">
            {isEditing ? t('report.editTitle') : (form.post_type === 'lost' ? 'Report a Lost Pet' : t('report.title'))}
          </h1>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
            <PawPrint className="h-3.5 w-3.5 text-primary" />
            {isEditing 
              ? t('report.editSubtitle') 
              : (form.post_type === 'lost' ? 'Provide details to help find your missing pet' : t('report.subtitle'))}
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Photo upload — 3 slots */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium text-foreground">{t('report.photos')}</Label>
              <span className="text-xs text-muted-foreground">{filledCount}/{MAX_PHOTOS}</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[0, 1, 2].map((index) => (
                <div key={index} className="relative">
                  <input
                    id={`photo-input-${index}`}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handlePhotoChange(index, e)}
                    className="hidden"
                  />
                  <AnimatePresence mode="wait">
                    {photoPreviews[index] ? (
                      <motion.div
                        key="preview"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="relative aspect-square rounded-2xl overflow-hidden border-2 border-primary/20 group cursor-pointer"
                        onClick={() => document.getElementById(`photo-input-${index}`)?.click()}
                      >
                        <img
                          src={photoPreviews[index]!}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {/* Primary badge */}
                        {index === 0 && (
                          <div className="absolute top-1.5 left-1.5">
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-primary text-primary-foreground rounded-full shadow-sm">
                              {t('report.cover')}
                            </span>
                          </div>
                        )}
                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                        {/* Remove button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removePhoto(index);
                          }}
                          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={`
                          aspect-square rounded-2xl border-2 border-dashed cursor-pointer
                          flex flex-col items-center justify-center gap-1.5
                          transition-all duration-200
                          ${index === 0
                            ? 'border-primary/30 bg-primary/5 hover:border-primary/50 hover:bg-primary/10'
                            : 'border-border bg-muted/30 hover:border-primary/30 hover:bg-muted/50'
                          }
                        `}
                        onClick={() => document.getElementById(`photo-input-${index}`)?.click()}
                      >
                        {index === 0 ? (
                          <>
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                              <Camera className="w-5 h-5 text-primary/60" />
                            </div>
                            <span className="text-[11px] font-medium text-primary/70">{t('report.coverPhoto')}</span>
                          </>
                        ) : (
                          <>
                            <div className="w-8 h-8 rounded-lg bg-muted/60 flex items-center justify-center">
                              <Plus className="w-4 h-4 text-muted-foreground/60" />
                            </div>
                            <span className="text-[10px] text-muted-foreground">{t('report.photoSlot', { count: index + 1 })}</span>
                          </>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground mt-2">
              {t('report.photoHelp')}
            </p>
          </div>

          {/* Animal type */}
          <div>
            <Label className="text-sm font-medium text-foreground">{t('report.animalType')}</Label>
            <div className="flex gap-3 mt-2">
              {([['dog', Dog, t('report.dog')], ['cat', Cat, t('report.cat')]] as const).map(([value, Icon, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, type: value }))}
                  className={`
                    flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200
                    ${form.type === value
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted border border-transparent hover:border-border'
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Gender */}
          <div>
            <Label className="text-sm font-medium text-foreground">{t('report.gender')}</Label>
            <div className="flex gap-3 mt-2">
              {([['male', Mars, t('report.male')], ['female', Venus, t('report.female')]] as const).map(([value, Icon, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, gender: value }))}
                  className={`
                    flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200
                    ${form.gender === value
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted border border-transparent hover:border-border'
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              {form.post_type === 'lost' ? 'Last Seen Location' : t('report.location')}
            </label>
            <div className="relative group">
              <input
                id="report-location"
                placeholder={form.post_type === 'lost' ? 'e.g. Mattegoda, near petrol station' : t('report.locationPlaceholder')}
                value={form.location_name}
                onChange={e => setForm(f => ({ ...f, location_name: e.target.value }))}
                className="w-full pl-11 pr-4 py-3 bg-muted/30 border-2 border-transparent focus:border-primary/30 rounded-2xl outline-none transition-all duration-300 group-hover:bg-muted/50"
                required
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                <MapPin className="w-5 h-5" />
              </div>
            </div>
            <button
              type="button"
              onClick={handleFetchLocation}
              disabled={isFetchingLocation}
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline disabled:opacity-50"
            >
              <Crosshairs className="h-3 w-3" />
              {isFetchingLocation ? t('report.fetchingLocation') : t('report.useCurrentLocation')}
            </button>
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-foreground">{t('report.description')}</Label>
              <span className="text-xs text-muted-foreground">{form.description.length}/300</span>
            </div>
            <textarea
              id="report-description"
              placeholder={form.post_type === 'lost' ? 'Please describe distinct features, collar details, color, date lost, etc.' : t('report.descriptionPlaceholder')}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value.slice(0, 300) }))}
              maxLength={300}
              rows={3}
              className="mt-2 w-full rounded-xl border bg-card px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow resize-none"
            />
          </div>

          {/* Name — auto-filled from user context */}
          <div>
            <Label className="text-sm font-medium text-foreground">{t('report.yourName')}</Label>
            <input
              placeholder={t('report.namePlaceholder')}
              value={form.reporter_name}
              onChange={e => setForm(f => ({ ...f, reporter_name: e.target.value }))}
              className="mt-2 w-full h-12 px-4 rounded-xl border bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
              readOnly={!!user?.name}
            />
            {user?.name && (
              <p className="text-xs text-muted-foreground mt-1">{t('report.autoFilled')}</p>
            )}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            variant="hero"
            size="lg"
            className="w-full"
            disabled={isSubmitting}
          >
            <PawPrint className="h-5 w-5 mr-2" />
            {isSubmitting
              ? (isEditing ? t('report.updating') : t('report.submitting'))
              : (isEditing ? t('report.update') : (form.post_type === 'lost' ? 'Post Lost Report' : t('report.submit')))
            }
          </Button>
        </motion.form>
      </div>
    </div>
  );
}
