import { useState, useEffect } from 'react';
import { useReportAnimal, useUploadPhoto, useAnimal, useUpdateAnimal } from '@/hooks/useAnimals';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCamera as Camera, FaCat as Cat, FaDog as Dog, FaMapMarkerAlt as MapPin, FaMars as Mars, FaPaw as PawPrint, FaVenus as Venus, FaCrosshairs as Crosshairs } from 'react-icons/fa';

export default function ReportStray() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const isEditing = !!editId;

  const { user } = useUser();
  const reportAnimal = useReportAnimal();
  const updateAnimal = useUpdateAnimal();
  const uploadPhoto = useUploadPhoto();

  // If editing, fetch existing animal data
  const { data: existingAnimal } = useAnimal(editId || '');

  const [form, setForm] = useState({
    type: 'dog' as 'dog' | 'cat',
    gender: 'male' as 'male' | 'female',
    location_name: '',
    description: '',
    reporter_name: user?.name || '',
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill form data for editing
  useEffect(() => {
    if (isEditing && existingAnimal) {
      // Security check: only owner can edit
      if (user && existingAnimal.user_id !== user.id) {
        toast.error('You can only edit your own posts.');
        navigate('/animals');
        return;
      }
      setForm({
        type: existingAnimal.type,
        gender: existingAnimal.gender,
        location_name: existingAnimal.location_name,
        description: existingAnimal.description || '',
        reporter_name: existingAnimal.reporter_name || user?.name || '',
      });
      if (existingAnimal.photo_url) {
        setPhotoPreview(existingAnimal.photo_url);
      }
    }
  }, [existingAnimal, isEditing, user, navigate]);

  // Auto-fill reporter name from user context
  useEffect(() => {
    if (user?.name && !isEditing) {
      setForm(f => ({ ...f, reporter_name: user.name }));
    }
  }, [user, isEditing]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const getNearestLocation = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
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
        toast.success('Location found and suggested.');
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
      toast.error("Please enter a location name");
      return;
    }
    setIsSubmitting(true);
    try {
      let photo_url: string | undefined;
      if (photo) {
        photo_url = await uploadPhoto.mutateAsync(photo);
      }

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
            ...(photo_url ? { photo_url } : {}),
          },
        });
        toast.success('Post updated successfully!');
        navigate(`/animals/${editId}`);
      } else {
        // Create new animal with user_id and contact_number
        // user.mobile already includes country code digits (e.g. "94760589218")
        await reportAnimal.mutateAsync({
          type: form.type,
          gender: form.gender,
          location_name: form.location_name.trim(),
          description: form.description.trim() || undefined,
          reporter_name: form.reporter_name.trim() || undefined,
          photo_url,
          user_id: user?.id,
          contact_number: user?.mobile || undefined,
        });
        toast.success('Thank you! You may have just saved a life.');
        navigate('/animals');
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="px-4 md:px-0 md:container py-6 md:py-10">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl md:text-3xl font-heading font-bold">
            {isEditing ? 'Edit Post' : 'Report a Stray'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
            <PawPrint className="h-3.5 w-3.5 text-primary" />
            {isEditing ? 'Update the details of your post' : 'Help us rescue a furry friend in need'}
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Photo upload */}
          <div>
            <Label className="text-sm font-medium text-foreground">Photo</Label>
            <div
              className="mt-2 border-2 border-dashed border-border rounded-2xl overflow-hidden cursor-pointer hover:border-primary/40 transition-colors bg-muted/30"
              onClick={() => document.getElementById('photo-input')?.click()}
            >
              {photoPreview ? (
                <div className="relative aspect-[4/3]">
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center">
                    <span className="opacity-0 hover:opacity-100 text-white text-sm font-medium bg-black/50 px-4 py-2 rounded-full">
                      Change photo
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
                    <Camera className="w-6 h-6 text-primary/60" />
                  </div>
                  <p className="text-sm font-medium text-foreground/70">Tap to upload a photo</p>
                  <p className="text-xs text-muted-foreground mt-1">JPG, PNG up to 5MB</p>
                </div>
              )}
              <input
                id="photo-input"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Animal type */}
          <div>
            <Label className="text-sm font-medium text-foreground">Animal Type</Label>
            <div className="flex gap-3 mt-2">
              {([['dog', Dog, 'Dog'], ['cat', Cat, 'Cat']] as const).map(([value, Icon, label]) => (
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
            <Label className="text-sm font-medium text-foreground">Gender</Label>
            <div className="flex gap-3 mt-2">
              {([['male', Mars, 'Male'], ['female', Venus, 'Female']] as const).map(([value, Icon, label]) => (
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

          {/* Location */}
          <div>
            <Label className="text-sm font-medium text-foreground">Location *</Label>
            <div className="relative mt-2">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                placeholder="e.g. Nugegoda Junction"
                value={form.location_name}
                onChange={e => setForm(f => ({ ...f, location_name: e.target.value }))}
                className="w-full h-12 pl-11 pr-4 rounded-xl border bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
                required
              />
            </div>
            <button
              type="button"
              onClick={handleFetchLocation}
              disabled={isFetchingLocation}
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline disabled:opacity-50"
            >
              <Crosshairs className="h-3 w-3" />
              {isFetchingLocation ? 'Fetching…' : 'Use my current location'}
            </button>
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-foreground">Description</Label>
              <span className="text-xs text-muted-foreground">{form.description.length}/300</span>
            </div>
            <textarea
              placeholder="Describe the animal's condition, color, size..."
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value.slice(0, 300) }))}
              maxLength={300}
              rows={3}
              className="mt-2 w-full rounded-xl border bg-card px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow resize-none"
            />
          </div>

          {/* Name — auto-filled from user context */}
          <div>
            <Label className="text-sm font-medium text-foreground">Your Name</Label>
            <input
              placeholder="Your first name"
              value={form.reporter_name}
              onChange={e => setForm(f => ({ ...f, reporter_name: e.target.value }))}
              className="mt-2 w-full h-12 px-4 rounded-xl border bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
              readOnly={!!user?.name}
            />
            {user?.name && (
              <p className="text-xs text-muted-foreground mt-1">Auto-filled from your profile</p>
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
              ? (isEditing ? 'Updating...' : 'Submitting...')
              : (isEditing ? 'Update Post' : 'Submit Report')
            }
          </Button>
        </motion.form>
      </div>
    </div>
  );
}
