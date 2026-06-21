import { memo } from 'react';
import { Link } from 'react-router-dom';
import type { Animal } from '@/hooks/useAnimals';
import { FaCat as Cat, FaCheckCircle as CheckCircle2, FaDog as Dog, FaHeart as Heart, FaMapMarkerAlt as MapPin, FaPhoneAlt as PhoneIcon, FaRegComment as Comment } from 'react-icons/fa';
import { getPrimaryPhotoUrl } from '@/utils/imageCompression';
import { getThumbnailUrl } from '@/utils/cloudinary';
import { useTranslation } from 'react-i18next';

function AnimalCard({ animal }: { animal: Animal }) {
  const { t, i18n } = useTranslation();
  const isAdopted = animal.is_adopted;
  const rawPrimaryPhoto = getPrimaryPhotoUrl(animal.photo_url);
  const primaryPhoto = getThumbnailUrl(rawPrimaryPhoto, 600);

  // Format contact number for display (e.g., "94760589218" → "+94 760 589 218")
  const formatPhone = (num: string | null) => {
    if (!num) return null;
    const withPlus = num.startsWith('+') ? num : `+${num}`;
    return withPlus;
  };

  return (
    <Link to={`/animals/${animal.id}`} className="block group h-full">
      <div className={`
        rounded-2xl overflow-hidden bg-card border transition-[transform,box-shadow] duration-300
        hover:shadow-soft hover:-translate-y-1 transform-gpu h-full flex flex-col
        ${isAdopted ? 'border-success/20' : 'border-border'}
      `}>
        {/* Image */}
        <div className="relative aspect-square sm:aspect-[4/3] bg-muted overflow-hidden shrink-0">
          {primaryPhoto ? (
            <img
              src={primaryPhoto}
              alt={t('common.animalTitle.' + animal.type, { location: animal.location_name })}
              width="400"
              height="300"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-lavender to-peach">
              {animal.type === 'dog'
                ? <Dog className="h-10 w-10 sm:h-12 sm:w-12 text-primary/40" />
                : <Cat className="h-10 w-10 sm:h-12 sm:w-12 text-primary/40" />
              }
            </div>
          )}

          {/* Smooth gradient transition & subtle blur at the bottom of image */}
          <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-card to-transparent pointer-events-none backdrop-blur-[0.5px]" />

          {/* Status pill - micro-sized */}
          <div className="absolute top-2 right-2 z-10">
            {isAdopted ? (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-semibold bg-success text-success-foreground shadow-sm">
                <CheckCircle2 className="h-2 w-2 sm:h-2.5 sm:w-2.5" />
                {t('browse.adopted')}
              </span>
            ) : (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-semibold bg-white/95 text-orange-600 shadow-sm backdrop-blur-sm border border-orange-100/50">
                <Heart className="h-2 w-2 sm:h-2.5 sm:w-2.5 text-orange-500 fill-orange-500" />
                {t('browse.waiting')}
              </span>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between space-y-2">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs sm:text-sm text-foreground font-bold truncate">
              <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary/60 shrink-0" />
              <span className="truncate">{animal.location_name}</span>
            </div>

            {animal.description && (
              <p className="text-[11px] sm:text-xs text-muted-foreground line-clamp-2 leading-relaxed break-words">
                {animal.description}
              </p>
            )}

            {/* Contact number */}
            {animal.contact_number && !isAdopted && (
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-primary font-semibold pt-0.5">
                <PhoneIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                <span className="truncate">{formatPhone(animal.contact_number)}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border/50 text-[10px] sm:text-[11px]">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <span className="inline-flex items-center gap-0.5 font-medium text-muted-foreground">
                <Heart className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${animal.reaction_count > 0 ? 'text-rose-500 fill-rose-500' : ''}`} />
                <span>{animal.reaction_count}</span>
              </span>
              <span className="inline-flex items-center gap-0.5 font-medium text-muted-foreground">
                <Comment className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                <span>{animal.comment_count}</span>
              </span>
            </div>
            <span className="text-muted-foreground shrink-0">
              {new Date(animal.created_at).toLocaleDateString(i18n.language === 'en' ? 'en-US' : (i18n.language === 'si' ? 'si-LK' : 'ta-LK'), { month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default memo(AnimalCard);
