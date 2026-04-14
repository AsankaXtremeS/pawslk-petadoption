import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useWaitingAnimals, useAnimalStats } from '@/hooks/useAnimals';
import AnimalCard from '@/components/AnimalCard';
import AnimatedCounter from '@/components/AnimatedCounter';
import EmptyState from '@/components/EmptyState';
import { motion, useScroll, useTransform } from 'framer-motion';
import { FaArrowRight as ArrowRight, FaHeart as HeartPulse, FaPaw as PawPrint, FaUsers as Users, FaPlus as Plus } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

export default function Index() {
  const { t } = useTranslation();
  const { data: animals, isLoading } = useWaitingAnimals();
  const { data: stats } = useAnimalStats();
  const recentAnimals = animals?.slice(0, 6) || [];
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 60], [1, 0]);
  const pointerEvents = useTransform(scrollY, [0, 60], ["auto", "none"] as any);
  const y = useTransform(scrollY, [0, 60], [0, 10]);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden min-h-[85dvh] md:min-h-[calc(100vh-4rem)] flex flex-col justify-center pb-20 md:pb-0 md:py-16 bg-background">
        {/* Decorative Paws */}
        <div className="absolute top-20 left-[10%] opacity-5 text-primary rotate-12 -z-0">
          <PawPrint size={120} />
        </div>
        <div className="absolute bottom-20 right-[15%] opacity-5 text-primary -rotate-12 -z-0">
          <PawPrint size={160} />
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] text-primary rotate-45 -z-0">
          <PawPrint size={320} />
        </div>


        <div className="relative z-10 px-5 md:px-0 md:container flex-1 flex flex-col justify-center">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-4 lg:gap-8 w-full mt-8 md:mt-0">
            {/* Left side for desktop: Text content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex-1 text-center md:text-left w-full md:max-w-md lg:max-w-lg"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6"
              >
                <PawPrint className="h-3 w-3" />
                <span className="hidden md:inline">{t('home.heroBadge')}</span>
                <span className="md:hidden">Paw Connect</span>
              </motion.div>

              <h1 className="text-4xl md:text-5xl lg:text-7xl font-heading font-bold leading-[1.1] mb-5">
                {t('home.heroTitle')}
                <br />
                <span className="text-gradient">{t('home.heroTitleGradient')}</span>
              </h1>

              <p className="text-base md:text-lg text-muted-foreground mx-auto md:mx-0 mb-8 leading-relaxed">
                {t('home.heroSubtitle')}
              </p>

              <div className="flex flex-row gap-3 md:gap-4 justify-center md:justify-start items-center w-full">
                <Link to="/animals" className="flex-1 sm:flex-none">
                  <Button variant="hero" size="lg" className="w-full sm:w-auto px-4 md:px-8 py-6 md:py-7 text-sm md:text-base">
                    <PawPrint className="mr-1.5 h-4 w-4 md:h-5 md:w-5" />
                    {t('home.animalsBtn')}
                  </Button>
                </Link>
                <Link to="/report" className="flex-1 sm:flex-none">
                  <Button variant="hero-outline" size="lg" className="w-full sm:w-auto px-4 md:px-8 py-6 md:py-7 text-sm md:text-base">
                    <Plus className="mr-1.5 h-4 w-4 md:h-5 md:w-5" />
                    {t('home.addNewBtn')}
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Middle for desktop / Middle for mobile: Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="w-full max-w-[480px] sm:w-3/5 md:w-auto md:flex-shrink-0 flex justify-center py-4 sm:py-3 md:py-0"
            >
              <img 
                src="/Hero.png" 
                alt="Happy stray pet" 
                className="object-contain w-full max-h-[390px] sm:max-h-[400px] md:max-h-[430px] lg:max-h-[500px] animate-float drop-shadow-2xl"
              />
            </motion.div>

            {/* Right side for desktop / Hidden on mobile: Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden md:flex flex-col gap-3 items-end"
            >
              <div className="bg-white rounded-2xl border shadow-sm w-[210px] z-10">
                <AnimatedCounter
                  end={stats?.adopted || 0}
                  label={t('home.stats.saved')}
                  icon={<PawPrint className="h-5 w-5" />}
                  iconColorClass=" text-emerald-600"
                />
              </div>
              <div className="bg-white rounded-2xl border shadow-sm w-[210px] z-20">
                <AnimatedCounter
                  end={stats?.waiting || 0}
                  label={t('home.stats.waiting')}
                  icon={<HeartPulse className="h-5 w-5" />}
                  iconColorClass=" text-rose-400"
                />
              </div>
              <div className="bg-white rounded-2xl border shadow-sm w-[210px] z-30">
                <AnimatedCounter
                  end={stats?.total || 0}
                  label={t('home.stats.rescuers')}
                  icon={<Users className="h-5 w-5" />}
                  iconColorClass=" text-blue-600"
                />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Mobile Floating Statistics Bar (Glassmorphism) - Floating above Nav */}
        <motion.div 
          style={{ opacity, pointerEvents, y }}
          className="md:hidden fixed bottom-[95px] left-4 right-4 z-40"
        >
          <div 
            className="flex items-center justify-around py-2.5 px-4 rounded-full bg-white/80 backdrop-blur-xl border border-white/70 shadow-2xl overflow-hidden"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-600 shrink-0">
                <PawPrint className="h-4 w-4" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-sm font-bold text-foreground">{stats?.adopted || 0}</span>
                <span className="text-[8px] uppercase tracking-tighter font-bold text-muted-foreground/80">{t('home.stats.saved').split(' ')[0]}</span>
              </div>
            </div>
            
            <div className="w-[1px] h-6 bg-black/5" />

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                <HeartPulse className="h-4 w-4" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-sm font-bold text-foreground">{stats?.waiting || 0}</span>
                <span className="text-[8px] uppercase tracking-tighter font-bold text-muted-foreground/80">{t('home.stats.waiting').split(' ')[0]}</span>
              </div>
            </div>

            <div className="w-[1px] h-6 bg-black/5" />

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-600 shrink-0">
                <Users className="h-4 w-4" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-sm font-bold text-foreground">{stats?.total || 0}</span>
                <span className="text-[8px] uppercase tracking-tighter font-bold text-muted-foreground/80 leading-none">{t('home.stats.rescuers').split(' ')[0]}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Recent Animals (Waiting only) */}
      <section className="px-4 md:px-0 md:container pb-12 pt-6 md:pt-16">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-heading font-bold">{t('home.recent.title')}</h2>
            <p className="text-sm text-muted-foreground mt-1">{t('home.recent.subtitle')}</p>
          </div>
          {recentAnimals.length > 0 && (
            <Link to="/animals" className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
              {t('home.recent.viewAll')}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-muted animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : recentAnimals.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
              {recentAnimals.map((animal, i) => (
                <motion.div
                  key={animal.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
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

      
    </div>
  );
}
