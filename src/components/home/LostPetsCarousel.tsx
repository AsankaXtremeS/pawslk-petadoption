import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaPaw as PawPrint, FaChevronLeft as ChevronLeft, FaChevronRight as ChevronRight } from 'react-icons/fa';
import type { Animal } from '@/hooks/useAnimals';
import { getPrimaryPhotoUrl } from '@/utils/imageCompression';
import { getThumbnailUrl } from '@/utils/cloudinary';

/** Thin horizontal strip of lost-pet alerts shown on the home page. */
export default function LostPetsCarousel({ animals }: { animals: Animal[] }) {
  const lostScrollRef = useRef<HTMLDivElement>(null);

  const scrollLost = (direction: 'left' | 'right') => {
    if (lostScrollRef.current) {
      const scrollAmount = 240; // width of thin card + gap
      lostScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="px-4 md:px-0 md:container py-8 border-b border-border/40 bg-rose-500/[0.01] relative overflow-hidden">
      <div className="flex items-center justify-between mb-5">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            Active Alerts
          </span>
          <h2 className="text-xl md:text-2xl font-heading font-black tracking-tight mt-1">Lost & Found Pets</h2>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => scrollLost('left')}
            className="w-8 h-8 rounded-full border border-border bg-card flex items-center justify-center text-foreground hover:bg-muted transition-colors shadow-sm"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => scrollLost('right')}
            className="w-8 h-8 rounded-full border border-border bg-card flex items-center justify-center text-foreground hover:bg-muted transition-colors shadow-sm"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Carousel container */}
      <div
        ref={lostScrollRef}
        className="flex gap-3 md:gap-4 overflow-x-auto pb-3 scrollbar-none snap-x snap-mandatory scroll-smooth px-4 md:px-0"
      >
        {animals.map((animal) => {
          const rawPrimaryPhoto = getPrimaryPhotoUrl(animal.photo_url);
          const primaryPhoto = getThumbnailUrl(rawPrimaryPhoto, 400); // smaller size for thin carousel
          return (
            <Link
              key={animal.id}
              to={`/animals/${animal.id}`}
              className="w-36 sm:w-44 shrink-0 snap-start group relative aspect-[3/4] rounded-xl overflow-hidden border border-rose-500/20 shadow-sm hover:shadow-md hover:border-rose-500/40 hover:-translate-y-0.5 transition-all duration-300 transform-gpu bg-muted"
            >
              {primaryPhoto ? (
                <img
                  src={primaryPhoto}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <PawPrint className="w-8 h-8 text-muted-foreground/30" />
                </div>
              )}

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/20 pointer-events-none" />

              {/* Top Alert Badge */}
              <div className="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-rose-600 text-white font-black text-[9px] uppercase shadow-sm">
                <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
                Lost
              </div>

              {/* Location info */}
              <div className="absolute bottom-2.5 inset-x-2 text-white">
                <p className="text-[8px] font-black uppercase text-rose-300 tracking-widest mb-0.5">Last Seen</p>
                <p className="text-xs font-bold leading-tight truncate">{animal.location_name}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
