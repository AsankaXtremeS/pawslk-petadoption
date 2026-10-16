import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowRight as ArrowRight } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import AnimalCard from '@/components/AnimalCard';
import EmptyState from '@/components/EmptyState';
import type { Animal } from '@/hooks/useAnimals';

interface RecentAnimalsProps {
  animals: Animal[];
  isLoading: boolean;
}

export default function RecentAnimals({ animals, isLoading }: RecentAnimalsProps) {
  const { t } = useTranslation();

  return (
    <section className="px-4 md:px-0 md:container pb-12 pt-6 md:pt-16">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-heading font-bold">{t('home.recent.title')}</h2>
          <p className="text-sm text-muted-foreground mt-1">{t('home.recent.subtitle')}</p>
        </div>
        {animals.length > 0 && (
          <Link to="/animals" className="hidden sm:inline-flex">
            <Button variant="outline" size="sm" className="rounded-full px-5 font-bold border-primary/20 text-primary hover:bg-primary hover:text-white transition-all shadow-sm">
              {t('home.recent.viewAll')}
              <ArrowRight className="ml-2 h-3.5 w-3.5" />
            </Button>
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-muted animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : animals.length > 0 ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5 contain-layout">
            {animals.map((animal, i) => (
              <motion.div
                key={animal.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, ease: "easeOut" }}
                className="transform-gpu will-change-[transform,opacity] h-full"
              >
                <AnimalCard animal={animal} />
              </motion.div>
            ))}
          </div>

          {/* Mobile "View all" button */}
          <div className="sm:hidden text-center mt-6">
            <Link to="/animals">
              <Button variant="hero-outline" size="lg" className="w-full">
                {t('home.recent.viewAll')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </>
      ) : (
        <EmptyState message={t('home.recent.empty')} />
      )}
    </section>
  );
}
