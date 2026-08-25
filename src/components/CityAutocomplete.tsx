import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMapMarkerAlt as MapPin, FaTimes as X, FaSearch as Search } from 'react-icons/fa';
import { searchSriLankanCities, CitySuggestion } from '@/utils/sriLankaAddress';

interface CityAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelectCity?: (city: string, suggestion: CitySuggestion) => void;
  placeholder?: string;
  id?: string;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  icon?: 'search' | 'pin';
  autoFocus?: boolean;
}

export const CityAutocomplete: React.FC<CityAutocompleteProps> = ({
  value,
  onChange,
  onSelectCity,
  placeholder = 'Search city or location...',
  id,
  name,
  required = false,
  disabled = false,
  className = '',
  inputClassName = '',
  icon = 'search',
  autoFocus = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch suggestions ONLY when user has typed text
  const suggestions = useMemo(() => {
    const trimmed = (value || '').trim();
    if (!trimmed) return [];
    return searchSriLankanCities(trimmed, 8);
  }, [value]);

  // Reset highlight when suggestions change
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [suggestions]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, []);

  const handleSelect = (suggestion: CitySuggestion) => {
    onChange(suggestion.city);
    onSelectCity?.(suggestion.city, suggestion);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        e.preventDefault();
        handleSelect(suggestions[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  // Helper to highlight matching text in city name
  const renderHighlightedCity = (cityName: string, query: string) => {
    if (!query) return <span className="font-bold text-foreground">{cityName}</span>;
    const lowerCity = cityName.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const matchIndex = lowerCity.indexOf(lowerQuery);

    if (matchIndex === -1) {
      return <span className="font-bold text-foreground">{cityName}</span>;
    }

    const before = cityName.slice(0, matchIndex);
    const match = cityName.slice(matchIndex, matchIndex + query.length);
    const after = cityName.slice(matchIndex + query.length);

    return (
      <span className="font-medium text-foreground">
        {before}
        <span className="text-primary font-black underline decoration-primary/40 underline-offset-2">
          {match}
        </span>
        {after}
      </span>
    );
  };

  const hasSuggestions = isOpen && value.trim().length > 0 && suggestions.length > 0;

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Input container */}
      <div className="relative w-full flex items-center">
        {/* Leading Icon */}
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none transition-colors">
          {icon === 'search' ? (
            <Search className="w-4 h-4" />
          ) : (
            <MapPin className="w-4 h-4 text-primary" />
          )}
        </div>

        {/* Text Input */}
        <input
          ref={inputRef}
          id={id}
          name={name}
          type="text"
          autoComplete="off"
          autoFocus={autoFocus}
          disabled={disabled}
          required={required}
          placeholder={placeholder}
          value={value}
          onChange={e => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (value.trim().length > 0) {
              setIsOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          className={
            inputClassName ||
            `w-full pl-10 pr-9 py-2.5 bg-card border border-border/80 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all duration-200 shadow-xs`
          }
        />

        {/* Clear Button */}
        {value && !disabled && (
          <button
            type="button"
            onClick={() => {
              onChange('');
              onSelectCity?.('', { city: '' });
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-muted/80 hover:bg-primary/20 text-muted-foreground hover:text-primary flex items-center justify-center transition-all duration-150"
            aria-label="Clear location"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Dropdown Suggestions List (Only appears when typing) */}
      <AnimatePresence>
        {hasSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="absolute left-0 right-0 top-full mt-1.5 z-50 overflow-hidden rounded-2xl bg-card/95 dark:bg-card/95 backdrop-blur-xl border border-border/80 dark:border-border/40 shadow-xl shadow-black/5 dark:shadow-black/20"
          >
            {/* Suggestions list */}
            <ul className="max-h-64 overflow-y-auto py-1 divide-y divide-border/20">
              {suggestions.map((item, index) => {
                const isSelected = highlightedIndex === index;
                return (
                  <li
                    key={`${item.city}-${index}`}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`
                      group flex items-center justify-between px-3.5 py-2.5 cursor-pointer transition-all duration-150
                      ${isSelected ? 'bg-primary/10 text-primary' : 'hover:bg-muted/50 text-foreground'}
                    `}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`
                          w-7 h-7 rounded-xl flex items-center justify-center transition-transform duration-200
                          ${isSelected ? 'bg-primary text-primary-foreground scale-105 shadow-xs' : 'bg-primary/10 text-primary group-hover:scale-105'}
                        `}
                      >
                        <MapPin className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="text-sm font-semibold truncate">
                          {renderHighlightedCity(item.city, value)}
                        </div>
                        {(item.district || item.province) && (
                          <div className="text-[11px] text-muted-foreground truncate">
                            {item.district && `${item.district} District`}
                            {item.district && item.province && ' • '}
                            {item.province}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* District Badge */}
                    {item.district && (
                      <span
                        className={`
                          ml-2 flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border transition-colors
                          ${isSelected ? 'bg-primary/20 text-primary border-primary/30' : 'bg-muted text-muted-foreground border-border/50 group-hover:border-primary/20 group-hover:text-primary'}
                        `}
                      >
                        {item.district}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CityAutocomplete;
