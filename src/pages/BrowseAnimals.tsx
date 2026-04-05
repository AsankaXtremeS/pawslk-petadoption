import { useState } from 'react';
import { useAnimals } from '@/hooks/useAnimals';
import AnimalCard from '@/components/AnimalCard';
import EmptyState from '@/components/EmptyState';
import { motion } from 'framer-motion';
import { FaCat as Cat, FaCheckCircle as CheckCircle2, FaDog as Dog, FaHeart as HeartPulse, FaMars as Mars, FaPaw as PawPrint, FaSearch as Search, FaVenus as Venus } from 'react-icons/fa';

type FilterChip = { key: string; label: string; icon?: React.ReactNode };

export default function BrowseAnimals() {
  const [type, setType] = useState('all');
  const [gender, setGender] = useState('all');
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');

  const { data: animals, isLoading } = useAnimals({
    type: type !== 'all' ? type : undefined,
    gender: gender !== 'all' ? gender : undefined,
    status: status !== 'all' ? status : undefined,
    search: search || undefined,
  });

  const typeFilters: FilterChip[] = [
    { key: 'all', label: 'All', icon: <PawPrint className="h-3.5 w-3.5" /> },
    { key: 'dog', label: 'Dogs', icon: <Dog className="h-3.5 w-3.5" /> },
    { key: 'cat', label: 'Cats', icon: <Cat className="h-3.5 w-3.5" /> },
  ];

  const statusFilters: FilterChip[] = [
    { key: 'all', label: 'All' },
    { key: 'waiting', label: 'Waiting', icon: <HeartPulse className="h-3.5 w-3.5" /> },
    { key: 'adopted', label: 'Adopted', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  ];

  const genderFilters: FilterChip[] = [
    { key: 'all', label: 'Any' },
    { key: 'male', label: 'Male', icon: <Mars className="h-3.5 w-3.5" /> },
    { key: 'female', label: 'Female', icon: <Venus className="h-3.5 w-3.5" /> },
  ];

  const renderChips = (
    items: FilterChip[],
    active: string,
    onSelect: (key: string) => void,
  ) => (
    <div className="flex gap-2">
      {items.map(item => (
        <button
          key={item.key}
          onClick={() => onSelect(item.key)}
          className={`chip ${active === item.key ? 'active' : ''}`}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="px-4 md:px-0 md:container py-6 md:py-10">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-heading font-bold">Browse Animals</h1>
        <p className="text-sm text-muted-foreground mt-1">Find a furry friend waiting for love</p>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          placeholder="Search by location..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full h-12 pl-11 pr-4 rounded-xl border bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
        />
      </div>

      {/* Horizontal scrollable filter sections */}
      <div className="space-y-3 mb-6">
        <div className="overflow-x-auto hide-scrollbar -mx-4 px-4">
          {renderChips(typeFilters, type, setType)}
        </div>
        <div className="overflow-x-auto hide-scrollbar -mx-4 px-4">
          <div className="flex gap-2">
            {renderChips(statusFilters, status, setStatus)}
            <div className="w-px bg-border mx-1 self-stretch" />
            {renderChips(genderFilters, gender, setGender)}
          </div>
        </div>
      </div>

      {/* Results count */}
      {!isLoading && animals && (
        <p className="text-xs text-muted-foreground mb-4">
          {animals.length} {animals.length === 1 ? 'animal' : 'animals'} found
        </p>
      )}

      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-muted animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : animals && animals.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
          {animals.map((animal, i) => (
            <motion.div
              key={animal.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <AnimalCard animal={animal} />
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}
