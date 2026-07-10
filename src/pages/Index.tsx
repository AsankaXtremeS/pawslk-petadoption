import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useWaitingAnimals, useAnimalStats, useLostAnimals } from '@/hooks/useAnimals';
import AnimalCard from '@/components/AnimalCard';
import AnimatedCounter from '@/components/AnimatedCounter';
import EmptyState from '@/components/EmptyState';
import { useState, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { FaArrowRight as ArrowRight, FaHeart as HeartPulse, FaPaw as PawPrint, FaUsers as Users, FaPlus as Plus, FaSearch as Search, FaCamera as Camera, FaChartLine as Chart, FaGlobeAsia as Globe, FaQuestionCircle as Question, FaChevronLeft as ChevronLeft, FaChevronRight as ChevronRight, FaExclamationCircle as ExclamationCircle, FaMapMarkerAlt as MapMarker } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

// Heart Outline Doodle component
const HeartDoodle = ({ className, delay = 0 }: { className?: string; delay?: number }) => (
  <motion.svg
    animate={{ 
      y: [0, -6, 0],
      rotate: [0, 4, -4, 0]
    }}
    transition={{
      duration: 3.5,
      repeat: Infinity,
      repeatType: "reverse",
      ease: "easeInOut",
      delay
    }}
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </motion.svg>
);
import { getPrimaryPhotoUrl } from '@/utils/imageCompression';
import { getThumbnailUrl } from '@/utils/cloudinary';

export default function Index() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const { t } = useTranslation();
  const { data: animals, isLoading } = useWaitingAnimals();
  const { data: lostAnimals } = useLostAnimals();
  const { data: stats } = useAnimalStats();
  const recentAnimals = animals?.slice(0, 9) || [];
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 60], [1, 0]);
  const pointerEvents = useTransform(scrollY, [0, 60], ["auto", "none"] as string[]);
  const y = useTransform(scrollY, [0, 60], [0, 10]);

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
    <div>
      {/* Top Dashboard Section */}
      <section className="relative overflow-hidden pt-1 pb-5 md:py-8 bg-[#fafdfc] md:bg-white border-b border-border/20">
        {/* Soft decorative background glow */}
        <div className="absolute top-0 right-0 w-[45%] h-[45%] rounded-full bg-[#f4faf7] filter blur-3xl -z-10 opacity-75" />

        {/* Mobile-Only Background Decorative Paw Icon */}
        <div className="md:hidden absolute top-[10%] left-[-30px] text-primary/[0.04] -z-10 -rotate-12 pointer-events-none">
          <PawPrint className="w-36 h-36" />
        </div>

        <div className="px-5 md:px-0 md:container">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 lg:gap-12 items-center">
            
            {/* Left Column: Hero Text & Quick Action Cards */}
            <div className="col-span-1 md:col-span-7 lg:col-span-7 flex flex-col justify-center gap-4 md:gap-6 lg:gap-8">
              
              {/* Hero Text */}
              <div className="w-full">
                {/* Text Block */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-center md:text-left flex flex-col items-center md:items-start"
                >
                  {/* Be their hero badge */}
                  <div className="mb-2.5 md:mb-4">
                    <Link to="/animals" className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors text-primary text-[10px] sm:text-xs font-bold">
                      <HeartPulse className="h-3 w-3 sm:h-3.5 sm:w-3.5 animate-pulse" />
                      <span>Paw Connect</span>
                    </Link>
                  </div>

                  <h1 className="text-4xl xs:text-5xl md:text-5xl lg:text-6xl xl:text-7xl font-heading font-black leading-[1.12] text-slate-800 tracking-tight">
                    {t('home.heroTitle')}
                    <br />
                    <span className="text-primary font-extrabold">{t('home.heroTitleGradient')}</span>
                  </h1>

                  <p className="text-xs xs:text-sm md:text-lg text-slate-500 mt-1.5 md:mt-4 max-w-xs md:max-w-xl lg:max-w-2xl leading-relaxed">
                    {t('home.heroSubtitle')}
                  </p>
                </motion.div>
              </div>

              {/* Mobile-Only Illustration (Vertical Stack, Inline, Centered, Large, Overlapping buttons) */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.10 }}
                className="md:hidden w-full max-w-[260px] xs:max-w-[320px] aspect-square flex items-center justify-center mx-auto -mb-10 xs:-mb-14 relative z-0 pointer-events-none"
              >
                <img 
                  src="/Hero.webp" 
                  alt="" 
                  className="object-contain w-full h-full drop-shadow-md"
                />
              </motion.div>

              {/* Quick Action Cards Grid (3 Columns on mobile and desktop) */}
              <div className="grid grid-cols-3 gap-2 md:gap-4 lg:gap-6 mt-2 md:mt-0 relative z-10">
                
                {/* Card 1: Animals */}
                <Link 
                  to="/animals" 
                  className="bg-[#f0f9f6] rounded-[20px] md:rounded-3xl p-3 md:p-5 relative flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group border border-emerald-500/5"
                >
                  <div className="pb-8">
                    <div className="w-8 h-8 md:w-11 md:h-11 rounded-full bg-primary flex items-center justify-center text-white mb-2 md:mb-4 shadow-sm">
                      <PawPrint className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                    <h3 className="font-heading text-xs sm:text-sm md:text-lg font-black text-slate-800 mb-0.5 md:mb-1">Animals</h3>
                    <p className="text-[9px] md:text-xs text-slate-500 leading-snug md:leading-relaxed pr-4 md:pr-8">Browse all animals waiting for homes</p>
                  </div>
                  <div className="absolute bottom-2.5 right-2.5 md:bottom-5 md:right-5 w-6 h-6 md:w-8 md:h-8 rounded-full bg-[#ccfbf1] text-primary flex items-center justify-center group-hover:translate-x-0.5 transition-transform shadow-sm">
                    <ArrowRight className="w-3 md:w-3.5 h-3 md:h-3.5" />
                  </div>
                </Link>

                {/* Card 2: Add New */}
                <Link 
                  to="/report" 
                  className="bg-[#f4f7f6] rounded-[20px] md:rounded-3xl p-3 md:p-5 relative flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group border border-slate-500/5"
                >
                  <div className="pb-8">
                    <div className="w-8 h-8 md:w-11 md:h-11 rounded-full bg-teal-800 flex items-center justify-center text-white mb-2 md:mb-4 shadow-sm">
                      <Plus className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                    <h3 className="font-heading text-xs sm:text-sm md:text-lg font-black text-slate-800 mb-0.5 md:mb-1">Add New</h3>
                    <p className="text-[9px] md:text-xs text-slate-500 leading-snug md:leading-relaxed pr-4 md:pr-8">Report or add a new animal</p>
                  </div>
                  <div className="absolute bottom-2.5 right-2.5 md:bottom-5 md:right-5 w-6 h-6 md:w-8 md:h-8 rounded-full bg-teal-50 text-teal-800 flex items-center justify-center group-hover:translate-x-0.5 transition-transform shadow-sm">
                    <ArrowRight className="w-3 md:w-3.5 h-3 md:h-3.5" />
                  </div>
                </Link>

                {/* Card 3: Report Lost */}
                <Link 
                  to="/report?type=lost" 
                  className="bg-[#fdf2f2] rounded-[20px] md:rounded-3xl p-3 md:p-5 relative flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group border border-rose-500/5"
                >
                  <div className="pb-8">
                    <div className="w-8 h-8 md:w-11 md:h-11 rounded-full bg-rose-600 flex items-center justify-center text-white mb-2 md:mb-4 shadow-sm">
                      <ExclamationCircle className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                    <h3 className="font-heading text-xs sm:text-sm md:text-lg font-black text-slate-800 mb-0.5 md:mb-1">Report Lost</h3>
                    <p className="text-[9px] md:text-xs text-slate-500 leading-snug md:leading-relaxed pr-4 md:pr-8">Report a lost or missing pet</p>
                  </div>
                  <div className="absolute bottom-2.5 right-2.5 md:bottom-5 md:right-5 w-6 h-6 md:w-8 md:h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center group-hover:translate-x-0.5 transition-transform shadow-sm">
                    <ArrowRight className="w-3 md:w-3.5 h-3 md:h-3.5" />
                  </div>
                </Link>

              </div>

              {/* Mobile-Only Horizontal Stats Banner */}
              <div className="md:hidden mt-2 w-full bg-[#0f5143] rounded-2xl p-3.5 text-white shadow-md">
                <div className="flex items-center justify-between w-full gap-2">
                  
                  {/* Stat 1: Waiting */}
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#ccfbf1]/20 text-[#ccfbf1] flex items-center justify-center shrink-0">
                      <HeartPulse className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs sm:text-sm font-black leading-none">
                        {stats?.waiting || 0}
                      </span>
                      <span className="text-[8px] text-slate-200 uppercase font-bold mt-0.5 leading-none">
                        {t('home.stats.waiting') || "Waiting"}
                      </span>
                    </div>
                  </div>

                  <div className="h-6 border-r border-white/15" />

                  {/* Stat 2: Adopted */}
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#fef3c7]/20 text-[#fef3c7] flex items-center justify-center shrink-0">
                      <PawPrint className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs sm:text-sm font-black leading-none">
                        {stats?.adopted || 0}
                      </span>
                      <span className="text-[8px] text-slate-200 uppercase font-bold mt-0.5 leading-none">
                        {t('home.stats.saved') || "Adopted"}
                      </span>
                    </div>
                  </div>

                  <div className="h-6 border-r border-white/15" />

                  {/* Stat 3: Active Users */}
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#e0f2fe]/20 text-[#e0f2fe] flex items-center justify-center shrink-0">
                      <Users className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs sm:text-sm font-black leading-none">
                        100+
                      </span>
                      <span className="text-[8px] text-slate-200 uppercase font-bold mt-0.5 leading-none">
                        Active Users
                      </span>
                    </div>
                  </div>

                </div>
              </div>
            </div>

             {/* Right Column: Pet Illustration & Compact Stats (Desktop Only) */}
            <div className="hidden md:flex md:col-span-5 lg:col-span-5 flex-col items-center justify-center gap-2 lg:gap-0">
              
              {/* Desktop Pet Illustration */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="flex justify-center relative w-full pt-2 pb-0 z-0"
              >
                <div className="relative w-full max-w-[340px] lg:max-w-[420px] xl:max-w-[460px] aspect-square flex items-center justify-center">
                  {/* Circle backdrop */}
                  <div className="absolute inset-0 rounded-full bg-[#ecf7f4]/80 shadow-[0_0_50px_rgba(236,247,244,0.6)] -z-10 scale-[1.05]" />
                  
                  {/* Decorative Dotted pattern */}
                  <div className="absolute top-6 right-6 w-14 h-14 bg-[radial-gradient(#0f766e_1.5px,transparent_1.5px)] [background-size:8px_8px] opacity-25 -z-10" />

                  {/* Hero image */}
                  <img 
                    src="/Hero.webp" 
                    alt="Happy stray pet" 
                    width="616"
                    height="560"
                    fetchpriority="high"
                    className="object-contain w-full h-full max-h-[300px] lg:max-h-[380px] xl:max-h-[420px] drop-shadow-2xl animate-float"
                  />

                  {/* Subtle Background Heart Doodle (positioned out of the way) */}
                  <HeartDoodle className="absolute top-[8%] left-[8%] w-5 h-5 text-primary/30" delay={0.5} />
                </div>
              </motion.div>

              {/* Desktop Compact Horizontal Stats Card */}
              <div className="w-full max-w-[340px] lg:max-w-[420px] xl:max-w-[460px] bg-[#0f5143] rounded-[20px] p-3 text-white shadow-md flex items-center justify-around gap-2 lg:gap-4 -mt-5 lg:-mt-7 relative z-10">
                
                {/* Stat 1: Animals Waiting */}
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#ccfbf1]/20 text-[#ccfbf1] flex items-center justify-center shrink-0 shadow-inner">
                    <HeartPulse className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm lg:text-base font-black leading-none">
                      {stats?.waiting || 0}
                    </span>
                    <span className="text-[8px] lg:text-[9px] text-[#a7f3d0] uppercase font-bold tracking-wider mt-0.5">
                      {t('home.stats.waiting') || "Waiting"}
                    </span>
                  </div>
                </div>
                
                <div className="h-6 border-r border-white/10" />

                {/* Stat 2: Animals Adopted */}
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#fef3c7]/20 text-[#fef3c7] flex items-center justify-center shrink-0 shadow-inner">
                    <PawPrint className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm lg:text-base font-black leading-none">
                      {stats?.adopted || 0}
                    </span>
                    <span className="text-[8px] lg:text-[9px] text-[#fef3c7] uppercase font-bold tracking-wider mt-0.5">
                      {t('home.stats.saved') || "Adopted"}
                    </span>
                  </div>
                </div>

                <div className="h-6 border-r border-white/10" />

                {/* Stat 3: Active Users */}
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#e0f2fe]/20 text-[#e0f2fe] flex items-center justify-center shrink-0 shadow-inner">
                    <Users className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm lg:text-base font-black leading-none">
                      100+
                    </span>
                    <span className="text-[8px] lg:text-[9px] text-[#e0f2fe] uppercase font-bold tracking-wider mt-0.5">
                      Active
                    </span>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      </section>

      {/* Lost Pets Carousel - Thin, catchy alerts before stray listings */}
      {lostAnimals && lostAnimals.length > 0 && (
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
            {lostAnimals.map((animal) => {
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
      )}

      {/* Recent Animals (Waiting only) */}
      <section className="px-4 md:px-0 md:container pb-12 pt-6 md:pt-16">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-heading font-bold">{t('home.recent.title')}</h2>
            <p className="text-sm text-muted-foreground mt-1">{t('home.recent.subtitle')}</p>
          </div>
          {recentAnimals.length > 0 && (
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
        ) : recentAnimals.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5 contain-layout">
              {recentAnimals.map((animal, i) => (
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



      {/* Optimized About & FAQ Section */}
      <section className="px-4 md:px-0 md:container pb-20 pt-8 md:pt-12">
        <div className="max-w-6xl mx-auto lg:grid lg:grid-cols-2 lg:gap-16 items-start">
          
          {/* Left Column: About & Features */}
          <div className="space-y-8 mb-16 lg:mb-0">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
                <Globe className="h-3 w-3" />
                <span>{t('home.about.badge')}</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4 leading-tight">
                {t('home.about.title')}
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed max-w-xl">
                {t('home.about.subtitle')}
              </p>
            </div>

            {/* Features compact grid */}
            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  icon: <Search className="h-5 w-5" />,
                  title: t('home.about.features.browse.title'),
                  desc: t('home.about.features.browse.desc'),
                  link: '/animals',
                  color: 'bg-blue-500/10 text-blue-600',
                },
                {
                  icon: <Camera className="h-5 w-5" />,
                  title: t('home.about.features.report.title'),
                  desc: t('home.about.features.report.desc'),
                  link: '/report',
                  color: 'bg-rose-500/10 text-rose-500',
                },
                {
                  icon: <Chart className="h-5 w-5" />,
                  title: t('home.about.features.impact.title'),
                  desc: t('home.about.features.impact.desc'),
                  link: '/dashboard',
                  color: 'bg-emerald-500/10 text-emerald-600',
                },
                {
                  icon: <PawPrint className="h-5 w-5" />,
                  title: t('home.about.features.free.title'),
                  desc: t('home.about.features.free.desc'),
                  link: '/about',
                  color: 'bg-purple-500/10 text-purple-600',
                },
              ].map((feature, i) => (
                <Link
                  key={i}
                  to={feature.link}
                  className="group p-4 rounded-2xl bg-card border shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className={`w-10 h-10 rounded-xl ${feature.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-sm font-bold font-heading mb-1">{feature.title}</h3>
                  <p className="text-[11px] text-muted-foreground leading-snug">{feature.desc}</p>
                </Link>
              ))}
            </div>
          </div>

          {/* Right Column: FAQ */}
          <div className="bg-muted/30 rounded-[2.5rem] border p-6 md:p-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
                <Question className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-heading font-bold">{t('home.faq.title')}</h2>
            </div>

            <div className="space-y-3">
              {[
                { q: t('home.faq.q1'), a: t('home.faq.a1') },
                { q: t('home.faq.q2'), a: t('home.faq.a2') },
                { q: t('home.faq.q3'), a: t('home.faq.a3') },
                { q: t('home.faq.q4'), a: t('home.faq.a4') },
                { q: t('home.faq.q5'), a: t('home.faq.a5') },
              ].map((faq, i) => (
                <div
                  key={i}
                  className="group bg-card rounded-2xl border px-6 py-4 cursor-pointer hover:border-primary/30 transition-colors shadow-sm"
                  onClick={() => setOpenFaqIndex(openFaqIndex === i ? null : i)}
                >
                  <div className="flex items-center justify-between text-sm font-bold text-foreground list-none">
                    <span>{faq.q}</span>
                    <motion.span 
                      className="ml-4 text-primary text-lg"
                      animate={{ rotate: openFaqIndex === i ? 45 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      +
                    </motion.span>
                  </div>
                  <AnimatePresence>
                    {openFaqIndex === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <p className="mt-4 text-sm text-muted-foreground leading-relaxed pr-6 border-t pt-4 border-border/50">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Schema — FAQPage JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": t('home.faq.q1'),
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": t('home.faq.a1')
                }
              },
              {
                "@type": "Question",
                "name": t('home.faq.q2'),
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": t('home.faq.a2')
                }
              },
              {
                "@type": "Question",
                "name": t('home.faq.q3'),
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": t('home.faq.a3')
                }
              },
              {
                "@type": "Question",
                "name": t('home.faq.q4'),
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": t('home.faq.a4')
                }
              },
              {
                "@type": "Question",
                "name": t('home.faq.q5'),
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": t('home.faq.a5')
                }
              }
            ]
          })
        }}
      />

    </div>
  );
}
