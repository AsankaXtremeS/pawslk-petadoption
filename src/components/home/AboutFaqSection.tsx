import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPaw as PawPrint, FaSearch as Search, FaCamera as Camera, FaChartLine as Chart, FaGlobeAsia as Globe, FaQuestionCircle as Question } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const FAQ_KEYS = [1, 2, 3, 4, 5];

/** About/features grid and FAQ accordion, plus the FAQPage JSON-LD for SEO. */
export default function AboutFaqSection() {
  const { t } = useTranslation();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const features = [
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
  ];

  const faqs = FAQ_KEYS.map(n => ({ q: t(`home.faq.q${n}`), a: t(`home.faq.a${n}`) }));

  return (
    <>
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
              {features.map((feature, i) => (
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
              {faqs.map((faq, i) => (
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
            "mainEntity": faqs.map(faq => ({
              "@type": "Question",
              "name": faq.q,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.a
              }
            }))
          })
        }}
      />
    </>
  );
}
