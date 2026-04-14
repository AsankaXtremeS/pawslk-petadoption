import { useAnimalStats } from '@/hooks/useAnimals';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { FaCat as Cat, FaCheckCircle as CheckCircle2, FaClock as Clock3, FaDog as Dog, FaMapMarkerAlt as MapPin, FaPaw as PawPrint, FaRegStar as Sparkles, FaChartLine as TrendingUp } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const COLORS = ['hsl(262, 52%, 56%)', 'hsl(24, 90%, 58%)'];

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const { data: stats, isLoading } = useAnimalStats();

  if (isLoading) {
    return (
      <div className="px-4 md:px-0 md:container py-6 space-y-4">
        <div className="h-8 bg-muted animate-pulse rounded-lg w-1/3" />
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const pieData = [
    { name: t('dashboard.dogs'), value: stats.dogs },
    { name: t('dashboard.cats'), value: stats.cats },
  ];

  const statCards = [
    { label: t('dashboard.total'), value: stats.total, icon: <PawPrint className="h-5 w-5" />, color: 'bg-lavender text-primary' },
    { label: t('dashboard.adopted'), value: stats.adopted, icon: <CheckCircle2 className="h-5 w-5" />, color: 'bg-mint text-success' },
    { label: t('dashboard.waiting'), value: stats.waiting, icon: <Clock3 className="h-5 w-5" />, color: 'bg-peach text-orange-500' },
    { label: t('dashboard.rate'), value: `${stats.adoptionRate}%`, icon: <TrendingUp className="h-5 w-5" />, color: 'bg-sky text-blue-500' },
  ];

  return (
    <div className="px-4 md:px-0 md:container py-6 md:py-10 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-heading font-bold">{t('dashboard.title')}</h1>
        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
          <PawPrint className="h-3.5 w-3.5 text-primary" />
          {t('dashboard.subtitle')}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-card rounded-2xl border p-4 flex flex-col items-center text-center"
          >
            <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center mb-3`}>
              {s.icon}
            </div>
            <div className="text-2xl font-heading font-bold tabular-nums">{s.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Bar chart */}
        <div className="bg-card rounded-2xl border p-5">
          <h3 className="font-heading text-base font-semibold mb-4">{t('dashboard.last6Months')}</h3>
          {stats.monthlyData.some(d => d.count > 0) ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.monthlyData}>
                <XAxis dataKey="month" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid hsl(240, 6%, 90%)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="hsl(262, 52%, 56%)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">{t('dashboard.noData')}</div>
          )}
        </div>

        {/* Donut chart */}
        <div className="bg-card rounded-2xl border p-5">
          <h3 className="font-heading text-base font-semibold mb-4">{t('dashboard.dogsVsCats')}</h3>
          {stats.total > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={74}
                    paddingAngle={4}
                    dataKey="value"
                    label={false}
                    labelLine={false}
                    style={{ fontSize: '12px' }}
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid hsl(240, 6%, 90%)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {pieData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center justify-between rounded-lg bg-muted/40 px-2.5 py-1.5 text-xs">
                    <span className="inline-flex items-center gap-2 text-muted-foreground">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                      {entry.name}
                    </span>
                    <span className="font-semibold tabular-nums">{entry.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">{t('dashboard.noData')}</div>
          )}
        </div>
      </div>

      {/* Bottom lists */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Recently adopted */}
        <div className="bg-card rounded-2xl border p-5">
          <h3 className="font-heading text-base font-semibold inline-flex items-center gap-2 mb-4">
            <Sparkles className="h-4 w-4 text-secondary" />
            {t('dashboard.recentlyAdopted')}
          </h3>
          {stats.recentlyAdopted.length > 0 ? (
            <div className="space-y-2.5">
              {stats.recentlyAdopted.map(a => (
                <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl bg-success/5 border border-success/10">
                  <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
                    {a.type === 'dog' ? <Dog className="h-4 w-4 text-success" /> : <Cat className="h-4 w-4 text-success" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{a.location_name}</p>
                    <p className="text-xs text-muted-foreground">{a.adopted_at ? new Date(a.adopted_at).toLocaleDateString(i18n.language === 'en' ? 'en-US' : (i18n.language === 'si' ? 'si-LK' : 'ta-LK'), { month: 'short', day: 'numeric' }) : ''}</p>
                  </div>
                  <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">{t('dashboard.noAdoptions')}</p>
          )}
        </div>

        {/* Top locations */}
        <div className="bg-card rounded-2xl border p-5">
          <h3 className="font-heading text-base font-semibold inline-flex items-center gap-2 mb-4">
            <MapPin className="h-4 w-4 text-primary" />
            {t('dashboard.topLocations')}
          </h3>
          {stats.topLocations.length > 0 ? (
            <div className="space-y-2.5">
              {stats.topLocations.map((loc, i) => (
                <div key={loc.name} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                  <span className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{loc.name}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs shrink-0">{loc.count}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">{t('dashboard.noLocations')}</p>
          )}
        </div>
      </div>
    </div>
  );
}
