import { useState, useCallback, type ComponentType } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronLeft as ChevronLeft, FaChevronRight as ChevronRight } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

interface PhotoCarouselProps {
  photoUrls: string[];
  /** Base alt text; the photo number is appended */
  alt: string;
  fallbackIcon: ComponentType<{ className?: string }>;
}

const minSwipeDistance = 50;

/**
 * Swipeable photo slider for the animal detail page.
 * Remount it (via `key`) to reset to the first slide.
 */
export default function PhotoCarousel({ photoUrls, alt, fallbackIcon: FallbackIcon }: PhotoCarouselProps) {
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const hasMultiplePhotos = photoUrls.length > 1;

  // Touch/swipe handling
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

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

  const goNext = useCallback(() => {
    setCurrentSlide(prev => (prev < photoUrls.length - 1 ? prev + 1 : 0));
  }, [photoUrls.length]);

  const goPrev = useCallback(() => {
    setCurrentSlide(prev => (prev > 0 ? prev - 1 : photoUrls.length - 1));
  }, [photoUrls.length]);

  if (photoUrls.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-lavender to-peach">
        <FallbackIcon className="h-16 w-16 text-primary/30" />
      </div>
    );
  }

  return (
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
          alt={`${alt} - ${t('detail.photo')} ${currentSlide + 1}`}
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
              onClick={() => setCurrentSlide(index)}
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
        <div className="absolute top-4 left-14 z-10">
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-black/40 text-white backdrop-blur-sm">
            {t('detail.photoCounter', { current: currentSlide + 1, total: photoUrls.length })}
          </span>
        </div>
      )}
    </div>
  );
}
