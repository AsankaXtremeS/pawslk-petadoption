import { useState, useMemo } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAnimals } from '@/hooks/useAnimals';
import AnimalCard from '@/components/AnimalCard';
import EmptyState from '@/components/EmptyState';
import CityAutocomplete from '@/components/CityAutocomplete';
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
import { usePageMeta } from '@/hooks/usePageMeta';
import { DISTRICTS, PAGE_META, findDistrict, type PageMeta } from '@/lib/seo';
import { districtOf } from '@/utils/districtMatch';
import NotFound from './NotFound';

/**
 * One listing page per indexable URL, so each can rank on its own:
 *   /animals            all pets for adoption
 *   /adopt/dogs|cats    one species
 *   /adopt/:district    pets for adoption (incl. reported strays) in a district, e.g. /adopt/galle
 *   /lost-pets          lost & found alerts
 *   /lost-pets/:district  lost & found alerts in a district
 */
type BrowsePage = {
  path: string;
  postType: 'adopt' | 'lost';
  species?: 'dog' | 'cat';
  district?: { name: string; slug: string };
};

function resolvePage(pathname: string, slug: string | undefined): BrowsePage | null {
  if (pathname.startsWith('/lost-pets/')) {
    const district = findDistrict(slug?.toLowerCase());
    return district ? { path: `/lost-pets/${district.slug}`, postType: 'lost', district } : null;
  }
  if (pathname.startsWith('/lost-pets')) return { path: '/lost-pets', postType: 'lost' };
  if (pathname.startsWith('/adopt/dogs')) return { path: '/adopt/dogs', postType: 'adopt', species: 'dog' };
  if (pathname.startsWith('/adopt/cats')) return { path: '/adopt/cats', postType: 'adopt', species: 'cat' };
  if (pathname.startsWith('/adopt/')) {
    const district = findDistrict(slug?.toLowerCase());
    return district ? { path: `/adopt/${district.slug}`, postType: 'adopt', district } : null;
  }
  return { path: '/animals', postType: 'adopt' };
}

export default function BrowseAnimals() {
  const { pathname } = useLocation();
  const { district } = useParams<{ district?: string }>();
  const page = resolvePage(pathname, district);
  if (!page) return <NotFound />;
  // Keyed by page so filters reset when moving between listing pages.
  return <BrowseView key={page.path} page={page} />;
}

/** Crawlable links to every listing page (species, lost pets, all 25 districts) plus a report CTA. */
function ExploreLinks({ page }: { page: BrowsePage }) {
  const { t } = useTranslation();
  const current = page.path;
  const lost = page.postType === 'lost';
  const districtBase = lost ? '/lost-pets' : '/adopt';
  const linkClass = (to: string) =>
    `text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
      to === current
        ? 'bg-primary text-primary-foreground border-primary'
        : 'border-border bg-card text-muted-foreground hover:text-primary hover:border-primary/40'
    }`;
  return (
    <nav aria-labelledby="explore-heading" className="mt-12 pt-8 border-t border-border/50 space-y-5">
      <h2 id="explore-heading" className="text-lg md:text-xl font-heading font-bold">{t('browse.exploreTitle')}</h2>
      <div className="flex flex-wrap gap-2">
        <Link to="/adopt/dogs" className={linkClass('/adopt/dogs')}>{t('browse.adoptDog')}</Link>
        <Link to="/adopt/cats" className={linkClass('/adopt/cats')}>{t('browse.adoptCat')}</Link>
        <Link to="/lost-pets" className={linkClass('/lost-pets')}>{t('browse.lostTab')}</Link>
        <Link
          to={lost ? '/report?type=lost' : '/report'}
          className="text-xs font-bold px-3 py-1.5 rounded-full border border-rose-500/30 bg-rose-500/5 text-rose-600 hover:bg-rose-500/10 transition-colors"
        >
          {t('browse.reportCta')}
        </Link>
      </div>
      <h3 className="text-sm font-bold text-muted-foreground">{lost ? t('browse.lostByDistrict') : t('browse.byDistrict')}</h3>
      <ul className="flex flex-wrap gap-2">
        {DISTRICTS.map(({ name, slug }) => (
          <li key={slug}>
            <Link to={`${districtBase}/${slug}`} className={linkClass(`${districtBase}/${slug}`)}>{name}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function BrowseView({ page }: { page: BrowsePage }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const postType = page.postType;
  // On /animals, /adopt/dogs and /adopt/cats the species filter *is* the page, so
  // changing it navigates to that page. Elsewhere it's an ordinary filter.
  const typeLocked = postType === 'adopt' && !page.district;
  const [typeState, setTypeState] = useState<string>(page.species ?? 'all');
  const type = typeLocked ? (page.species ?? 'all') : typeState;
  const onTypeChange = (value: string) => {
    if (!typeLocked) return setTypeState(value);
    navigate(value === 'dog' ? '/adopt/dogs' : value === 'cat' ? '/adopt/cats' : '/animals');
  };
  const [gender, setGender] = useState('all');
  const [status, setStatus] = useState('waiting');
  const [search, setSearch] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const { data: allAnimals, isLoading } = useAnimals({
    type: type !== 'all' ? type : undefined,
    gender: gender !== 'all' ? gender : undefined,
    status: status !== 'all' ? status : undefined,
    search: search || undefined,
    post_type: postType,
  });
  // Locations are free text ("Kulupana, horana", "මාලබේ"), so district pages match them client-side.
  const districtName = page.district?.name;
  const animals = useMemo(
    () => (districtName ? allAnimals?.filter((a) => districtOf(a.location_name) === districtName) : allAnimals),
    [allAnimals, districtName],
  );

  // An empty district page is thin content: keep it out of search results until it has listings.
  const emptyDistrictPage =
    !!page.district && !isLoading && animals?.length === 0 &&
    status === 'waiting' && type === 'all' && gender === 'all' && !search;
  const meta: PageMeta = PAGE_META[page.path];
  usePageMeta(emptyDistrictPage ? { ...meta, noindex: true } : meta);

  // Count active filters (excluding defaults)
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (!typeLocked && type !== 'all') count++;
    if (gender !== 'all') count++;
    if (status !== 'waiting') count++;
    return count;
  }, [typeLocked, type, gender, status]);

  const clearAllFilters = () => {
    setTypeState('all');
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

  const statusOptions = postType === 'lost' ? [
    { key: 'waiting', label: t('browse.stillMissing'), icon: <HeartPulse className="w-3.5 h-3.5" /> },
    { key: 'adopted', label: t('browse.foundReunited'), icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
    { key: 'all', label: t('browse.all') },
  ] : [
    { key: 'waiting', label: t('browse.waiting'), icon: <HeartPulse className="w-3.5 h-3.5" /> },
    { key: 'adopted', label: t('browse.adopted'), icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
    { key: 'all', label: t('browse.all') },
  ];

  return (
    <div className="px-4 md:px-0 md:container py-6 md:py-10">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-2xl md:text-3xl font-heading font-bold">
          {postType === 'lost'
            ? (status === 'adopted'
                ? t('browse.reunitedTitle')
                : page.district ? t('browse.lostDistrictTitle', { district: page.district.name }) : t('browse.lostTitle'))
            : status === 'adopted'
              ? t('browse.adoptedTitle')
              : page.district
                ? t('browse.districtTitle', { district: page.district.name })
                : page.species === 'dog'
                  ? t('browse.dogsTitle')
                  : page.species === 'cat'
                    ? t('browse.catsTitle')
                    : t('browse.allTitle')}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {postType === 'lost'
            ? (status === 'adopted'
                ? t('browse.reunitedSubtitle')
                : page.district ? t('browse.lostDistrictSubtitle', { district: page.district.name }) : t('browse.lostSubtitle'))
            : status === 'adopted'
              ? t('browse.adoptedSubtitle')
              : page.district
                ? t('browse.districtSubtitle', { district: page.district.name })
                : page.species === 'dog'
                  ? t('browse.dogsSubtitle')
                  : page.species === 'cat'
                    ? t('browse.catsSubtitle')
                    : t('browse.subtitle')}
        </p>
      </div>

      {/* Tab Selector */}
      <div className="flex border-b border-border/50 mb-6 gap-6 relative">
        <Link
          to={page.district ? `/adopt/${page.district.slug}` : '/animals'}
          aria-current={postType === 'adopt' ? 'page' : undefined}
          className={`pb-3 text-sm font-black tracking-tight relative transition-colors ${postType === 'adopt' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
        >
          {t('browse.adoptTab')}
          {postType === 'adopt' && (
            <motion.div 
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              className="absolute bottom-0 inset-x-0 h-0.5 bg-primary origin-left"
              transition={{ duration: 0.2 }}
            />
          )}
        </Link>
        <Link
          to={page.district ? `/lost-pets/${page.district.slug}` : '/lost-pets'}
          aria-current={postType === 'lost' ? 'page' : undefined}
          className={`pb-3 text-sm font-black tracking-tight relative transition-colors ${postType === 'lost' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
        >
          {t('browse.lostTab')}
          {postType === 'lost' && (
            <motion.div 
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              className="absolute bottom-0 inset-x-0 h-0.5 bg-primary origin-left"
              transition={{ duration: 0.2 }}
            />
          )}
        </Link>
      </div>

      {/* ===== SEARCH + FILTER CONTROLS ===== */}
      <div className="browse-controls">
        {/* Search bar with City Auto-suggestions */}
        <div className="browse-search">
          <CityAutocomplete
            value={search}
            onChange={setSearch}
            placeholder={t('browse.searchPlaceholder')}
            icon="search"
            inputClassName="browse-search-input"
          />
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
            options={statusOptions}
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
            onChange={onTypeChange}
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
                  options={statusOptions}
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
                  onChange={onTypeChange}
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
      {!showMobileFilters && (status !== 'waiting' || (!typeLocked && type !== 'all') || gender !== 'all') && (
        <div className="browse-active-tags md:hidden">
          {status !== 'waiting' && (
            <span className="browse-tag">
              {status === 'adopted' ? (postType === 'lost' ? t('browse.reunited') : t('browse.adopted')) : t('browse.all')}
              <button onClick={() => setStatus('waiting')}><X className="w-2.5 h-2.5" /></button>
            </span>
          )}
          {!typeLocked && type !== 'all' && (
            <span className="browse-tag">
              {type === 'dog' ? t('browse.dogs') : t('browse.cats')}
              <button onClick={() => setTypeState('all')}><X className="w-2.5 h-2.5" /></button>
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
          message={postType === 'lost'
            ? (status === 'adopted' ? t('browse.noReunitedYet') : t('browse.noLostPets'))
            : (status === 'adopted' ? t('browse.noAdoptedYet') : undefined)}
        />
      )}

      <ExploreLinks page={page} />
    </div>
  );
}
