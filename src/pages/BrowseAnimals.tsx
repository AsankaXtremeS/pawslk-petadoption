import { useState, useMemo } from 'react';
import { useAnimals } from '@/hooks/useAnimals';
import AnimalCard from '@/components/AnimalCard';
import EmptyState from '@/components/EmptyState';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaCat as Cat,
  FaCheckCircle as CheckCircle2,
  FaDog as Dog,
  FaHeart as HeartPulse,
  FaMars as Mars,
  FaPaw as PawPrint,
  FaSearch as Search,
  FaVenus as Venus,
  FaTimes as X,
  FaSlidersH as SlidersH,
} from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

export default function BrowseAnimals() {
  const { t } = useTranslation();
  const [type, setType] = useState('all');
  const [gender, setGender] = useState('all');
  const [status, setStatus] = useState('waiting');
  const [search, setSearch] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const { data: animals, isLoading } = useAnimals({
    type: type !== 'all' ? type : undefined,
    gender: gender !== 'all' ? gender : undefined,
    status: status !== 'all' ? status : undefined,
    search: search || undefined,
  });

  // Count active filters (excluding defaults)
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (type !== 'all') count++;
    if (gender !== 'all') count++;
    if (status !== 'waiting') count++;
    return count;
  }, [type, gender, status]);

  const clearAllFilters = () => {
    setType('all');
    setGender('all');
    setStatus('waiting');
    setSearch('');
  };

  // -- Segmented control renderer (pill-style toggle group) --
  const SegmentedControl = ({
    options,
    value,
    onChange,
  }: {
    options: { key: string; label: string; icon?: React.ReactNode }[];
    value: string;
    onChange: (v: string) => void;
  }) => (
    <div className="browse-segment-group">
      {options.map(opt => (
        <button
          key={opt.key}
          onClick={() => onChange(opt.key)}
          className={`browse-segment-btn ${value === opt.key ? 'active' : ''}`}
        >
          {opt.icon}
          <span>{opt.label}</span>
        </button>
      ))}
    </div>
  );

  // -- Filter section --
  const FilterSection = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="browse-filter-section">
      <span className="browse-filter-label">{label}</span>
      {children}
    </div>
  );

  return (
    <div className="px-4 md:px-0 md:container py-6 md:py-10">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-2xl md:text-3xl font-heading font-bold">
          {status === 'adopted' ? t('browse.adoptedTitle') : t('browse.title')}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {status === 'adopted'
            ? t('browse.adoptedSubtitle')
            : t('browse.subtitle')}
        </p>
      </div>

      {/* ===== SEARCH + FILTER CONTROLS ===== */}
      <div className="browse-controls">
        {/* Search bar */}
        <div className="browse-search">
          <Search className="browse-search-icon" />
          <input
            placeholder={t('browse.searchPlaceholder')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="browse-search-input"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="browse-search-clear"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Mobile: Filter toggle button */}
        <button
          className="browse-filter-toggle md:hidden"
          onClick={() => setShowMobileFilters(!showMobileFilters)}
        >
          <SlidersH className="w-4 h-4" />
          <span>{t('browse.filters')}</span>
          {activeFilterCount > 0 && (
            <span className="browse-filter-badge">{activeFilterCount}</span>
          )}
        </button>
      </div>

      {/* ===== DESKTOP FILTER BAR ===== */}
      <div className="browse-desktop-filters hidden md:flex">
        <FilterSection label={t('browse.status')}>
          <SegmentedControl
            options={[
              { key: 'waiting', label: t('browse.waiting'), icon: <HeartPulse className="w-3.5 h-3.5" /> },
              { key: 'adopted', label: t('browse.adopted'), icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
              { key: 'all', label: t('browse.all') },
            ]}
            value={status}
            onChange={setStatus}
          />
        </FilterSection>

        <div className="browse-filter-divider" />

        <FilterSection label={t('browse.type')}>
          <SegmentedControl
            options={[
              { key: 'all', label: t('browse.all'), icon: <PawPrint className="w-3.5 h-3.5" /> },
              { key: 'dog', label: t('browse.dogs'), icon: <Dog className="w-3.5 h-3.5" /> },
              { key: 'cat', label: t('browse.cats'), icon: <Cat className="w-3.5 h-3.5" /> },
            ]}
            value={type}
            onChange={setType}
          />
        </FilterSection>

        <div className="browse-filter-divider" />

        <FilterSection label={t('browse.gender')}>
          <SegmentedControl
            options={[
              { key: 'all', label: t('browse.any') },
              { key: 'male', label: t('browse.male'), icon: <Mars className="w-3.5 h-3.5" /> },
              { key: 'female', label: t('browse.female'), icon: <Venus className="w-3.5 h-3.5" /> },
            ]}
            value={gender}
            onChange={setGender}
          />
        </FilterSection>

        {activeFilterCount > 0 && (
          <button className="browse-clear-all" onClick={clearAllFilters}>
            <X className="w-3 h-3" />
            {t('browse.clear')}
          </button>
        )}
      </div>

      {/* ===== MOBILE FILTER PANEL (Slide-down) ===== */}
      <AnimatePresence>
        {showMobileFilters && (
          <motion.div
            className="browse-mobile-filters md:hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <div className="browse-mobile-filters-inner">
              <FilterSection label={t('browse.status')}>
                <SegmentedControl
                  options={[
                    { key: 'waiting', label: t('browse.waiting'), icon: <HeartPulse className="w-3.5 h-3.5" /> },
                    { key: 'adopted', label: t('browse.adopted'), icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
                    { key: 'all', label: t('browse.all') },
                  ]}
                  value={status}
                  onChange={setStatus}
                />
              </FilterSection>

              <FilterSection label={t('browse.type')}>
                <SegmentedControl
                  options={[
                    { key: 'all', label: t('browse.all'), icon: <PawPrint className="w-3.5 h-3.5" /> },
                    { key: 'dog', label: t('browse.dogs'), icon: <Dog className="w-3.5 h-3.5" /> },
                    { key: 'cat', label: t('browse.cats'), icon: <Cat className="w-3.5 h-3.5" /> },
                  ]}
                  value={type}
                  onChange={setType}
                />
              </FilterSection>

              <FilterSection label={t('browse.gender')}>
                <SegmentedControl
                  options={[
                    { key: 'all', label: t('browse.any') },
                    { key: 'male', label: t('browse.male'), icon: <Mars className="w-3.5 h-3.5" /> },
                    { key: 'female', label: t('browse.female'), icon: <Venus className="w-3.5 h-3.5" /> },
                  ]}
                  value={gender}
                  onChange={setGender}
                />
              </FilterSection>

              {activeFilterCount > 0 && (
                <button className="browse-clear-all mobile" onClick={clearAllFilters}>
                  <X className="w-3 h-3" />
                  {t('browse.clearAll')}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== ACTIVE FILTER TAGS (mobile — shown when panel closed) ===== */}
      {!showMobileFilters && (status !== 'waiting' || type !== 'all' || gender !== 'all') && (
        <div className="browse-active-tags md:hidden">
          {status !== 'waiting' && (
            <span className="browse-tag">
              {status === 'adopted' ? t('browse.adopted') : t('browse.all')}
              <button onClick={() => setStatus('waiting')}><X className="w-2.5 h-2.5" /></button>
            </span>
          )}
          {type !== 'all' && (
            <span className="browse-tag">
              {type === 'dog' ? t('browse.dogs') : t('browse.cats')}
              <button onClick={() => setType('all')}><X className="w-2.5 h-2.5" /></button>
            </span>
          )}
          {gender !== 'all' && (
            <span className="browse-tag">
              {gender === 'male' ? t('browse.male') : t('browse.female')}
              <button onClick={() => setGender('all')}><X className="w-2.5 h-2.5" /></button>
            </span>
          )}
        </div>
      )}

      {/* Results count */}
      {!isLoading && animals && (
        <div className="browse-results-bar">
          <p className="text-xs text-muted-foreground">
            {t('browse.found', { count: animals.length })}
          </p>
        </div>
      )}

      {/* Results grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-muted animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : animals && animals.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5 contain-layout">
          {animals.map((animal, i) => (
            <motion.div
              key={animal.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, ease: "easeOut" }}
              className="transform-gpu will-change-[transform,opacity] h-full"
            >
              <AnimalCard animal={animal} />
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyState
          message={status === 'adopted'
            ? t('browse.noAdoptedYet')
            : undefined}
        />
      )}
    </div>
  );
}
