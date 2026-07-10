import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { FaGlobeAsia as Globe, FaChevronDown as ChevronDown } from 'react-icons/fa';
import { useUser } from '@/contexts/UserContext';

const languages = [
  { code: 'en', label: 'English', native: 'English', flag: '🇬🇧' },
  { code: 'si', label: 'Sinhala', native: 'සිංහල', flag: '🇱🇰' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்', flag: '🇱🇰' },
];

export default function LanguageSwitcher({ mini = false }: { mini?: boolean }) {
  const { i18n } = useTranslation();
  const { user, updateUser } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = languages.find(l => l.code === i18n.language) || languages[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = async (code: string) => {
    i18n.changeLanguage(code);
    setIsOpen(false);
    
    // If user is logged in, sync with database
    if (user && user.language !== code) {
      try {
        await updateUser({ language: code as 'en' | 'si' | 'ta' });
      } catch (err) {
        console.error('Failed to update language preference:', err);
      }
    }
  };

  if (mini) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-10 h-10 rounded-xl flex items-center justify-center bg-muted/60 text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary"
        >
          <span className="text-lg">{currentLanguage.flag}</span>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="absolute bottom-full right-0 mb-3 bg-background border rounded-2xl shadow-xl overflow-hidden min-w-[140px] z-50 p-1.5"
            >
              <div className="text-[10px] font-bold text-muted-foreground px-3 py-1 uppercase tracking-wider">Language</div>
              {languages.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all
                    ${i18n.language === lang.code ? 'bg-primary/10 text-primary' : 'hover:bg-muted font-medium text-foreground'}
                  `}
                >
                  <span className="text-base">{lang.flag}</span>
                  <span className="text-xs">{lang.native}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-border/60 hover:bg-muted/35 transition-all text-xs font-bold text-foreground"
      >
        <Globe className="h-3.5 w-3.5 text-primary" />
        <span>{currentLanguage.code.toUpperCase()}</span>
        <ChevronDown className={`h-2.5 w-2.5 text-muted-foreground/80 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            className="absolute top-full right-0 mt-2 bg-background border rounded-2xl shadow-xl overflow-hidden min-w-[160px] z-50 p-1.5"
          >
            {languages.map(lang => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`
                  w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all
                  ${i18n.language === lang.code ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-muted text-muted-foreground font-medium'}
                `}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg leading-none">{lang.flag}</span>
                  <div className="flex flex-col items-start leading-none">
                    <span className="text-[11px] font-bold">{lang.native}</span>
                    <span className="text-[9px] opacity-70">{lang.label}</span>
                  </div>
                </div>
                {i18n.language === lang.code && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
