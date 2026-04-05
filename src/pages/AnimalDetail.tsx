import { useParams, useNavigate } from 'react-router-dom';
import { useAnimal, useMarkAdopted } from '@/hooks/useAnimals';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { FaArrowLeft as ArrowLeft, FaCalendarAlt as Calendar, FaCat as Cat, FaCheckCircle as CheckCircle2, FaDog as Dog, FaEdit as Edit, FaHeart as Heart, FaMapMarkerAlt as MapPin, FaMars as Mars, FaPhoneAlt as PhoneIcon, FaSearch as Search, FaRegCheckCircle as CircleCheck, FaUser as User, FaVenus as Venus } from 'react-icons/fa';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { useState } from 'react';
import { motion } from 'framer-motion';
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

export default function AnimalDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: animal, isLoading } = useAnimal(id!);
  const markAdopted = useMarkAdopted();
  const { user } = useUser();
  const [justAdopted, setJustAdopted] = useState(false);

  // Check if the current user is the post owner
  const isOwner = user && animal && animal.user_id === user.id;

  const handleAdopt = async () => {
    if (!user) {
      toast.error('You must be logged in to do this.');
      return;
    }
    try {
      await markAdopted.mutateAsync({ id: id!, userId: user.id, userToken: user.userToken });
      setJustAdopted(true);
      toast.success('This animal has been marked as adopted! Thank you!');
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#a855f7', '#f97316', '#4ade80', '#3b82f6'],
      });
    } catch {
      toast.error('Something went wrong. Only the post creator can change status.');
    }
  };

  const formatPhone = (num: string | null) => {
    if (!num) return null;
    return num.startsWith('+') ? num : `+${num}`;
  };

  if (isLoading) {
    return (
      <div className="px-4 md:px-0 md:container py-6">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="h-72 bg-muted animate-pulse rounded-2xl" />
          <div className="h-6 bg-muted animate-pulse rounded-lg w-2/3" />
          <div className="h-16 bg-muted animate-pulse rounded-xl" />
        </div>
      </div>
    );
  }

  if (!animal) {
    return (
      <div className="px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
          <Search className="h-7 w-7 text-muted-foreground" />
        </div>
        <h2 className="font-heading text-xl font-bold">Animal not found</h2>
        <p className="text-sm text-muted-foreground mt-2">It might have been removed or the link is incorrect.</p>
      </div>
    );
  }

  const isAdopted = animal.is_adopted || justAdopted;
  const TypeIcon = animal.type === 'dog' ? Dog : Cat;

  return (
    <div className="pb-6">
      {/* Full-width image on mobile */}
      <div className="relative">
        <div className={`relative aspect-[4/3] md:aspect-video bg-muted overflow-hidden md:max-w-2xl md:mx-auto md:mt-6 md:rounded-2xl ${isAdopted ? 'md:ring-4 md:ring-success/20' : ''}`}>
          {animal.photo_url ? (
            <img
              src={animal.photo_url}
              alt={`${animal.type} at ${animal.location_name}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-lavender to-peach">
              <TypeIcon className="h-16 w-16 text-primary/30" />
            </div>
          )}

          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          {/* Status badge */}
          <div className="absolute top-4 right-4">
            {isAdopted ? (
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold bg-success text-success-foreground shadow-md">
                <CheckCircle2 className="h-4 w-4" />
                Adopted
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold bg-white/90 text-orange-600 shadow-md backdrop-blur-sm">
                <Heart className="h-4 w-4" />
                Waiting
              </span>
            )}
          </div>

          {/* Owner badge */}
          {isOwner && (
            <div className="absolute bottom-4 right-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary text-primary-foreground shadow-md">
                Your Post
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Info section */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="px-5 md:px-0 md:max-w-2xl md:mx-auto mt-5 space-y-5"
      >
        {/* Title row */}
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
            <TypeIcon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold capitalize">
              {animal.type} in {animal.location_name}
            </h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground mt-1">
              <span className="inline-flex items-center gap-1">
                {animal.gender === 'male' ? <Mars className="w-3.5 h-3.5" /> : <Venus className="w-3.5 h-3.5" />}
                <span className="capitalize">{animal.gender}</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(animal.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        {animal.description && (
          <p className="text-foreground/80 leading-relaxed">{animal.description}</p>
        )}

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-muted/50">
            <MapPin className="w-4 h-4 text-primary/60 shrink-0" />
            <span className="text-sm truncate">{animal.location_name}</span>
          </div>
          {animal.reporter_name && (
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-muted/50">
              <User className="w-4 h-4 text-primary/60 shrink-0" />
              <span className="text-sm truncate">By {animal.reporter_name.split(' ')[0]}</span>
            </div>
          )}
        </div>

        {/* Contact number — shown for non-adopted animals to non-owners */}
        {animal.contact_number && !isAdopted && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <PhoneIcon className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Contact to adopt</p>
              <p className="text-sm font-bold text-foreground">{formatPhone(animal.contact_number)}</p>
            </div>
          </div>
        )}

        {/* Owner actions: Edit + Mark Adopted */}
        {isOwner && !isAdopted && (
          <div className="space-y-3">
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() => navigate(`/report?edit=${animal.id}`)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Post
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="success" size="lg" className="w-full text-base">
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  Mark as Adopted
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="mx-4 rounded-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-heading inline-flex items-center gap-2">
                    <CircleCheck className="h-5 w-5 text-success" />
                    Confirm Adoption
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure this animal has been adopted? This will move the post to the adopted section and remove it from the main view.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleAdopt} disabled={markAdopted.isPending} className="rounded-xl bg-success hover:bg-success/90">
                    {markAdopted.isPending ? 'Updating...' : 'Yes, Mark as Adopted!'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}

        {/* Non-owner sees a message for waiting animals */}
        {!isOwner && !isAdopted && animal.contact_number && (
          <div className="bg-muted/50 rounded-2xl p-4 text-center">
            <p className="text-sm text-muted-foreground">
              Interested in adopting? Contact the reporter using the phone number above.
            </p>
          </div>
        )}

        {/* Adopted banner */}
        {isAdopted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-success/10 border border-success/20 rounded-2xl p-5 text-center"
          >
            <p className="text-lg font-heading font-semibold text-success inline-flex items-center justify-center gap-2">
              <CircleCheck className="h-5 w-5" />
              This animal has been adopted!
            </p>
            {animal.adopted_at && (
              <p className="text-sm text-muted-foreground mt-1">
                Adopted on {new Date(animal.adopted_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
