import { useParams, useNavigate } from 'react-router-dom';
import { useAnimal, useMarkAdopted } from '@/hooks/useAnimals';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { FaArrowLeft as ArrowLeft, FaCalendarAlt as Calendar, FaCat as Cat, FaCheckCircle as CheckCircle2, FaDog as Dog, FaEdit as Edit, FaHeart as Heart, FaMapMarkerAlt as MapPin, FaMars as Mars, FaPhoneAlt as PhoneIcon, FaSearch as Search, FaRegCheckCircle as CircleCheck, FaUser as User, FaVenus as Venus, FaChevronLeft as ChevronLeft, FaChevronRight as ChevronRight, FaChartLine as Chart } from 'react-icons/fa';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { parsePhotoUrls } from '@/utils/imageCompression';
import { useTranslation } from 'react-i18next';
import { friendlyError } from '@/utils/errors';
import { useReactionStatus, useToggleReaction } from '@/hooks/useReactions';
import { useComments, useAddComment, useDeleteComment } from '@/hooks/useComments';
import { FaRegComment as CommentIcon, FaHeart as HeartSolid, FaRegHeart as HeartOutline, FaPaperPlane as SendIcon, FaTrashAlt as TrashIcon } from 'react-icons/fa';
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
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: animal, isLoading } = useAnimal(id!);
  const markAdopted = useMarkAdopted();
  const { user } = useUser();
  const [justAdopted, setJustAdopted] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Reactions & Comments
  const { data: hasReacted } = useReactionStatus(id!, user?.id);
  const toggleReaction = useToggleReaction();
  const { data: comments } = useComments(id!);
  const addComment = useAddComment();
  const deleteComment = useDeleteComment();
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Check if the current user is the post owner
  const isOwner = user && animal && animal.user_id === user.id;

  // Parse multiple photo URLs
  const photoUrls = animal ? parsePhotoUrls(animal.photo_url) : [];
  const hasMultiplePhotos = photoUrls.length > 1;

  // Touch/swipe handling
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentSlide < photoUrls.length - 1) {
      setCurrentSlide(prev => prev + 1);
    }
    if (isRightSwipe && currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  const goNext = useCallback(() => {
    setCurrentSlide(prev => (prev < photoUrls.length - 1 ? prev + 1 : 0));
  }, [photoUrls.length]);

  const goPrev = useCallback(() => {
    setCurrentSlide(prev => (prev > 0 ? prev - 1 : photoUrls.length - 1));
  }, [photoUrls.length]);

  // Reset slide when animal changes
  useEffect(() => {
    setCurrentSlide(0);
  }, [animal?.id]);

  const handleAdopt = async (targetAdopted: boolean = true) => {
    if (!user) {
      toast.error(t('detail.loginRequired'));
      return;
    }
    try {
      await markAdopted.mutateAsync({ 
        id: id!, 
        userId: user.id, 
        userToken: user.userToken,
        isAdopted: targetAdopted
      });
      
      if (targetAdopted) {
        setJustAdopted(true);
        toast.success(t('detail.adoptedSuccess'));
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#a855f7', '#f97316', '#4ade80', '#3b82f6'],
        });
      } else {
        setJustAdopted(false);
        toast.success(t('detail.undoSuccess'));
      }
    } catch (err) {
      toast.error(friendlyError(err, t('detail.genericError')));
    }
  };

  const handleToggleReaction = async () => {
    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}&message=detail.loginRequired`);
      return;
    }
    try {
      await toggleReaction.mutateAsync({
        animalId: id!,
        userId: user.id,
        userToken: user.userToken,
        hasReacted: !!hasReacted
      });
    } catch (err) {
      toast.error(friendlyError(err, t('detail.genericError')));
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}&message=detail.loginRequired`);
      return;
    }
    if (!commentText.trim()) return;

    try {
      setIsSubmittingComment(true);
      await addComment.mutateAsync({
        animalId: id!,
        userId: user.id,
        userToken: user.userToken,
        content: commentText.trim()
      });
      setCommentText('');
      toast.success(t('detail.commentAdded'));
    } catch (err) {
      toast.error(friendlyError(err, t('detail.genericError')));
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!user) return;
    try {
      await deleteComment.mutateAsync({ id: commentId, userToken: user.userToken });
      toast.success(t('detail.commentDeleted'));
    } catch (err) {
      toast.error(friendlyError(err, t('detail.genericError')));
    }
  };

  const formatPhone = (num: string | null) => {
    if (!num) return null;
    return num.startsWith('+') ? num : `+${num}`;
  };

  const getLocalDate = (date: string) => {
    return new Date(date).toLocaleDateString(i18n.language === 'en' ? 'en-US' : (i18n.language === 'si' ? 'si-LK' : 'ta-LK'), { month: 'long', day: 'numeric', year: 'numeric' });
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
        <h2 className="font-heading text-xl font-bold">{t('detail.notFound')}</h2>
        <p className="text-sm text-muted-foreground mt-2">{t('detail.notFoundDesc')}</p>
      </div>
    );
  }

  const isAdopted = animal.is_adopted || justAdopted;
  const TypeIcon = animal.type === 'dog' ? Dog : Cat;

  return (
    <div className="pb-6">
      {/* Photo carousel section */}
      <div className="relative">
        <div className={`relative aspect-[4/3] md:aspect-video bg-muted overflow-hidden md:max-w-2xl md:mx-auto md:mt-6 md:rounded-2xl ${isAdopted ? 'md:ring-4 md:ring-success/20' : ''}`}>
          {photoUrls.length > 0 ? (
            <div
              className="relative w-full h-full"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              {/* Slides */}
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentSlide}
                  src={photoUrls[currentSlide]}
                  alt={`${t('common.animalTitle.' + animal.type, { location: animal.location_name })} - ${t('detail.photo')} ${currentSlide + 1}`}
                  className="absolute inset-0 w-full h-full object-cover"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </AnimatePresence>

              {/* Desktop arrow navigation */}
              {hasMultiplePhotos && (
                <>
                  <button
                    onClick={goPrev}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/50 transition-colors z-10 hidden md:flex"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={goNext}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/50 transition-colors z-10 hidden md:flex"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </>
              )}

              {/* Dot indicators */}
              {hasMultiplePhotos && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
                  {photoUrls.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`
                        rounded-full transition-all duration-300
                        ${currentSlide === index
                          ? 'w-6 h-2 bg-white shadow-md'
                          : 'w-2 h-2 bg-white/50 hover:bg-white/80'
                        }
                      `}
                      aria-label={`${t('detail.photo')} ${index + 1}`}
                    />
                  ))}
                </div>
              )}

              {/* Photo counter */}
              {hasMultiplePhotos && (
                <div className="absolute top-4 left-14 md:left-4 z-10">
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-black/40 text-white backdrop-blur-sm">
                    {t('detail.photoCounter', { current: currentSlide + 1, total: photoUrls.length })}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-lavender to-peach">
              <TypeIcon className="h-16 w-16 text-primary/30" />
            </div>
          )}

          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/50 transition-colors z-20"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          {/* Status badge */}
          <div className="absolute top-4 right-4 z-20">
            {isAdopted ? (
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold bg-success text-success-foreground shadow-md">
                <CheckCircle2 className="h-4 w-4" />
                {t('browse.adopted')}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold bg-white/90 text-orange-600 shadow-md backdrop-blur-sm">
                <HeartSolid className="h-4 w-4" />
                {t('browse.waiting')}
              </span>
            )}
          </div>

          {/* Reaction button - mobile floating or fixed */}
          <div className="absolute bottom-4 left-4 z-20">
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={handleToggleReaction}
              className={`
                flex items-center gap-2 px-5 h-11 rounded-full border-2 font-bold transition-all active:scale-95
                ${hasReacted 
                  ? 'bg-rose-50 text-rose-500 border-rose-200' 
                  : 'bg-white/20 text-white border-white/30 backdrop-blur-md'
                }
              `}
            >
              {hasReacted ? <HeartSolid className="h-4 w-4" /> : <HeartOutline className="h-4 w-4" />}
              {animal.reaction_count || 0}
            </motion.button>
          </div>

          {/* Owner badge */}
          {isOwner && (
            <div className="absolute bottom-3 right-4 z-20">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary text-primary-foreground shadow-md">
                {t('detail.yourPost')}
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
              {t('common.animalTitle.' + animal.type, { location: animal.location_name })}
            </h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground mt-1">
              <span className="inline-flex items-center gap-1">
                {animal.gender === 'male' ? <Mars className="w-3.5 h-3.5" /> : <Venus className="w-3.5 h-3.5" />}
                <span className="capitalize">{animal.gender === 'male' ? t('report.male') : t('report.female')}</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {getLocalDate(animal.created_at)}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        {animal.description && (
          <p className="text-foreground/80 leading-relaxed break-words whitespace-pre-wrap">{animal.description}</p>
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
              <span className="text-sm truncate">{t('common.by')} {animal.reporter_name.split(' ')[0]}</span>
            </div>
          )}
        </div>

        {/* Contact number — shown for non-adopted animals to non-owners */}
        {animal.contact_number && !isAdopted && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <PhoneIcon className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground font-medium">{t('detail.contactToAdopt')}</p>
              <p className="text-sm font-bold text-foreground">{formatPhone(animal.contact_number)}</p>
            </div>
            <Button
              size="sm"
              variant="default"
              className="rounded-xl h-9 px-4 font-bold shadow-sm"
              asChild
            >
              <a href={`tel:${animal.contact_number}`}>
                <PhoneIcon className="w-3 h-3 mr-2" />
                {t('common.call')}
              </a>
            </Button>
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
              {t('common.edit')}
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="success" size="lg" className="w-full text-base">
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  {t('detail.markAsAdopted')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-2xl w-[calc(100%-2rem)]">
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-heading inline-flex items-center gap-2">
                    <CircleCheck className="h-5 w-5 text-success" />
                    {t('detail.confirmAdoption')}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('detail.confirmDesc')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-xl">{t('profile.actions.cancel')}</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleAdopt(true)} disabled={markAdopted.isPending} className="rounded-xl bg-success hover:bg-success/90">
                    {markAdopted.isPending ? t('profile.actions.updating') : t('detail.yesMark')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}

        {/* Stats Notice */}
        {!isAdopted && (
          <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 flex items-start gap-3">
            <Chart className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t('detail.statsNotice')}
            </p>
          </div>
        )}

        {/* Non-owner sees a message for waiting animals */}
        {!isOwner && !isAdopted && animal.contact_number && (
          <div className="bg-muted/50 rounded-2xl p-4 text-center">
            <p className="text-sm text-muted-foreground">
              {t('detail.interested')}
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
              {t('detail.animalAdopted')}
            </p>
            {animal.adopted_at && (
              <p className="text-sm text-muted-foreground mt-1">
                {t('detail.adoptedOn', { date: getLocalDate(animal.adopted_at) })}
              </p>
            )}

            {isOwner && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="mt-4 border-success/30 hover:bg-success/5 text-success">
                    {t('detail.undoAdoption')}
                  </Button>
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
                    <AlertDialogAction onClick={() => handleAdopt(false)} disabled={markAdopted.isPending} className="rounded-xl bg-primary hover:bg-primary/90">
                      {markAdopted.isPending ? t('profile.actions.updating') : t('detail.yesUndo')}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </motion.div>
        )}

        {/* Comments Section */}
        <div className="pt-8 pb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-heading text-xl font-bold inline-flex items-center gap-2">
              <CommentIcon className="text-primary" />
              {t('detail.comments')}
              <span className="text-sm font-normal text-muted-foreground ml-1">
                ({animal.comment_count || 0})
              </span>
            </h3>
          </div>

          {/* Comment List */}
          <div className="space-y-4 mb-8">
            {comments && comments.length > 0 ? (
              comments.map((comment) => (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={comment.id}
                  className="flex gap-3 group"
                >
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold shrink-0">
                    {comment.user?.name.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 bg-muted/40 rounded-2xl p-3 relative">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-foreground">
                        {comment.user?.name || t('common.user')}
                      </span>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(comment.created_at).toLocaleDateString(i18n.language === 'en' ? 'en-US' : (i18n.language === 'si' ? 'si-LK' : 'ta-LK'), { month: 'short', day: 'numeric' })}
                        </span>
                        {user && comment.user_id === user.id && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                            title={t('common.delete')}
                          >
                            <TrashIcon className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8 bg-muted/20 rounded-2xl border border-dashed">
                <p className="text-sm text-muted-foreground">{t('detail.noComments')}</p>
              </div>
            )}
          </div>

          {/* Add Comment Form */}
          <form onSubmit={handleAddComment} className="relative">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={t('detail.addCommentPlaceholder')}
              className="w-full min-h-[100px] bg-muted/30 border rounded-2xl p-4 text-sm resize-none focus:ring-2 focus:ring-primary/20 transition-all outline-none pb-12"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAddComment(e);
                }
              }}
            />
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <Button
                type="submit"
                size="sm"
                disabled={!commentText.trim() || isSubmittingComment}
                className="rounded-xl px-4 py-2 h-9 font-bold"
              >
                {isSubmittingComment ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <SendIcon className="w-3 h-3 mr-2" />
                    {t('common.send')}
                  </>
                )}
              </Button>
            </div>
            {!user && (
              <div 
                className="absolute inset-0 bg-background/40 backdrop-blur-[1px] flex items-center justify-center rounded-2xl cursor-pointer group"
                onClick={() => navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}&message=detail.loginRequired`)}
              >
                <div className="bg-background border shadow-md px-4 py-2 rounded-full text-xs font-bold text-primary group-hover:scale-105 transition-transform">
                  {t('detail.loginToComment')}
                </div>
              </div>
            )}
          </form>
        </div>
      </motion.div>
    </div>
  );
}
