import { Fragment, type ComponentType } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowRight as ArrowRight, FaHeart as HeartPulse, FaPaw as PawPrint, FaUsers as Users, FaPlus as Plus, FaExclamationCircle as ExclamationCircle } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

type IconType = ComponentType<{ className?: string }>;

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

const QUICK_ACTIONS: { to: string; title: string; desc: string; icon: IconType; cardClass: string; iconClass: string; arrowClass: string }[] = [
  {
    to: '/animals',
    title: 'Animals',
    desc: 'Browse all animals waiting for homes',
    icon: PawPrint,
    cardClass: 'bg-[#f0f9f6] border-emerald-500/5',
    iconClass: 'bg-primary',
    arrowClass: 'bg-[#ccfbf1] text-primary',
  },
  {
    to: '/report',
    title: 'Add New',
    desc: 'Report or add a new animal',
    icon: Plus,
    cardClass: 'bg-[#f4f7f6] border-slate-500/5',
    iconClass: 'bg-teal-800',
    arrowClass: 'bg-teal-50 text-teal-800',
  },
  {
    to: '/report?type=lost',
    title: 'Report Lost',
    desc: 'Report a lost or missing pet',
    icon: ExclamationCircle,
    cardClass: 'bg-[#fdf2f2] border-rose-500/5',
    iconClass: 'bg-rose-600',
    arrowClass: 'bg-rose-100 text-rose-600',
  },
];

interface HeroStat {
  icon: IconType;
  value: number | string;
  label: string;
  iconClass: string;
  desktopLabelClass: string;
}

interface HeroSectionProps {
  stats?: { waiting?: number; adopted?: number };
}

export default function HeroSection({ stats }: HeroSectionProps) {
  const { t } = useTranslation();

  const heroStats: HeroStat[] = [
    {
      icon: HeartPulse,
      value: stats?.waiting || 0,
      label: t('home.stats.waiting') || "Waiting",
      iconClass: 'bg-[#ccfbf1]/20 text-[#ccfbf1]',
      desktopLabelClass: 'text-[#a7f3d0]',
    },
    {
      icon: PawPrint,
      value: stats?.adopted || 0,
      label: t('home.stats.saved') || "Adopted",
      iconClass: 'bg-[#fef3c7]/20 text-[#fef3c7]',
      desktopLabelClass: 'text-[#fef3c7]',
    },
    {
      icon: Users,
      value: '170+',
      label: 'Active Users',
      iconClass: 'bg-[#e0f2fe]/20 text-[#e0f2fe]',
      desktopLabelClass: 'text-[#e0f2fe]',
    },
  ];

  return (
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
              {QUICK_ACTIONS.map(({ to, title, desc, icon: Icon, cardClass, iconClass, arrowClass }) => (
                <Link
                  key={to}
                  to={to}
                  className={`${cardClass} rounded-[20px] md:rounded-3xl p-3 md:p-5 relative flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group border`}
                >
                  <div className="pb-8">
                    <div className={`w-8 h-8 md:w-11 md:h-11 rounded-full ${iconClass} flex items-center justify-center text-white mb-2 md:mb-4 shadow-sm`}>
                      <Icon className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                    <h3 className="font-heading text-xs sm:text-sm md:text-lg font-black text-slate-800 mb-0.5 md:mb-1">{title}</h3>
                    <p className="text-[9px] md:text-xs text-slate-500 leading-snug md:leading-relaxed pr-4 md:pr-8">{desc}</p>
                  </div>
                  <div className={`absolute bottom-2.5 right-2.5 md:bottom-5 md:right-5 w-6 h-6 md:w-8 md:h-8 rounded-full ${arrowClass} flex items-center justify-center group-hover:translate-x-0.5 transition-transform shadow-sm`}>
                    <ArrowRight className="w-3 md:w-3.5 h-3 md:h-3.5" />
                  </div>
                </Link>
              ))}
            </div>

            {/* Mobile-Only Horizontal Stats Banner */}
            <div className="md:hidden mt-2 w-full bg-[#0f5143] rounded-2xl p-3.5 text-white shadow-md">
              <div className="flex items-center justify-between w-full gap-2">
                {heroStats.map(({ icon: Icon, value, label, iconClass }, i) => (
                  <Fragment key={label}>
                    {i > 0 && <div className="h-6 border-r border-white/15" />}
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full ${iconClass} flex items-center justify-center shrink-0`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs sm:text-sm font-black leading-none">
                          {value}
                        </span>
                        <span className="text-[8px] text-slate-200 uppercase font-bold mt-0.5 leading-none">
                          {label}
                        </span>
                      </div>
                    </div>
                  </Fragment>
                ))}
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
              {heroStats.map(({ icon: Icon, value, label, iconClass, desktopLabelClass }, i) => (
                <Fragment key={label}>
                  {i > 0 && <div className="h-6 border-r border-white/10" />}
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-full ${iconClass} flex items-center justify-center shrink-0 shadow-inner`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm lg:text-base font-black leading-none">
                        {value}
                      </span>
                      <span className={`text-[8px] lg:text-[9px] ${desktopLabelClass} uppercase font-bold tracking-wider mt-0.5`}>
                        {label}
                      </span>
                    </div>
                  </div>
                </Fragment>
              ))}
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
