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
    <Link to={`/animals/${animal.id}`} className="block group">
      <div className={`
        rounded-2xl overflow-hidden bg-card border transition-[transform,box-shadow] duration-300
        hover:shadow-soft hover:-translate-y-1 transform-gpu
        ${isAdopted ? 'border-success/20' : 'border-border'}
      `}>
        {/* Image */}
        <div className="relative aspect-[4/3] bg-muted overflow-hidden">
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
                ? <Dog className="h-12 w-12 text-primary/40" />
                : <Cat className="h-12 w-12 text-primary/40" />
              }
            </div>
          )}

          {/* Status pill */}
          <div className="absolute top-3 right-3">
            {isAdopted ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-success text-success-foreground shadow-sm">
                <CheckCircle2 className="h-3 w-3" />
                {t('browse.adopted')}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white md:bg-white/90 text-orange-600 shadow-sm md:backdrop-blur-sm">
                <Heart className="h-3 w-3" />
                {t('browse.waiting')}
              </span>
            )}
          </div>

          {/* Type icon */}
          <div className="absolute bottom-3 left-3">
            <div className="w-8 h-8 rounded-full bg-white md:bg-white/80 md:backdrop-blur-sm flex items-center justify-center shadow-sm">
              {animal.type === 'dog'
                ? <Dog className="h-4 w-4 text-primary" />
                : <Cat className="h-4 w-4 text-primary" />
              }
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="p-4 space-y-1.5">
          <div className="flex items-center gap-1.5 text-sm text-foreground font-bold truncate">
            <MapPin className="w-3.5 h-3.5 text-primary/60 shrink-0" />
            <span className="truncate">{animal.location_name}</span>
          </div>

          {animal.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed break-words">
              {animal.description}
            </p>
          )}

          {/* Contact number */}
          {animal.contact_number && !isAdopted && (
            <div className="flex items-center gap-1.5 text-xs text-primary font-semibold">
              <PhoneIcon className="w-3 h-3" />
              <span>{formatPhone(animal.contact_number)}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-1 border-t border-border/50">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                <Heart className={`w-2.5 h-2.5 ${animal.reaction_count > 0 ? 'text-rose-500 fill-rose-500' : ''}`} />
                {animal.reaction_count}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                <Comment className="w-2.5 h-2.5" />
                {animal.comment_count}
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground">
              {new Date(animal.created_at).toLocaleDateString(i18n.language === 'en' ? 'en-US' : (i18n.language === 'si' ? 'si-LK' : 'ta-LK'), { month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default memo(AnimalCard);
