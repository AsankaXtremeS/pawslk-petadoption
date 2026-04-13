import { Link } from 'react-router-dom';
import type { Animal } from '@/hooks/useAnimals';
import { FaCat as Cat, FaCheckCircle as CheckCircle2, FaDog as Dog, FaHeart as Heart, FaMapMarkerAlt as MapPin, FaPhoneAlt as PhoneIcon } from 'react-icons/fa';
import { getPrimaryPhotoUrl } from '@/utils/imageCompression';
import { useTranslation } from 'react-i18next';

export default function AnimalCard({ animal }: { animal: Animal }) {
  const { t, i18n } = useTranslation();
  const isAdopted = animal.is_adopted;
  const primaryPhoto = getPrimaryPhotoUrl(animal.photo_url);

  // Format contact number for display (e.g., "94760589218" → "+94 760 589 218")
  const formatPhone = (num: string | null) => {
    if (!num) return null;
    const withPlus = num.startsWith('+') ? num : `+${num}`;
    return withPlus;
  };

  return (
    <Link to={`/animals/${animal.id}`} className="block group">
      <div className={`
        rounded-2xl overflow-hidden bg-card border transition-all duration-300
        hover:shadow-soft hover:-translate-y-1
        ${isAdopted ? 'border-success/20' : 'border-border'}
      `}>
        {/* Image */}
        <div className="relative aspect-[4/3] bg-muted overflow-hidden">
          {primaryPhoto ? (
            <img
              src={primaryPhoto}
              alt={`${animal.type === 'dog' ? t('report.dog') : t('report.cat')} ${t('common.at')} ${animal.location_name}`}
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
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-orange-600 shadow-sm backdrop-blur-sm">
                <Heart className="h-3 w-3" />
                {t('browse.waiting')}
              </span>
            )}
          </div>

          {/* Type icon */}
          <div className="absolute bottom-3 left-3">
            <div className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm">
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
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
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

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-muted-foreground font-medium">
              {animal.gender === 'male' ? t('report.male') : t('report.female')} • {animal.type === 'dog' ? t('report.dog') : t('report.cat')}
            </span>
            <span className="text-[11px] text-muted-foreground">
              {new Date(animal.created_at).toLocaleDateString(i18n.language === 'en' ? 'en-US' : (i18n.language === 'si' ? 'si-LK' : 'ta-LK'), { month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
