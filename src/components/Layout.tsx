import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHome as Home, FaPaw as PawPrint, FaPlus as Plus, FaTachometerAlt as Gauge, FaSignOutAlt as LogOut, FaUser as UserIcon, FaSignInAlt as LogIn, FaUserPlus as UserPlus } from 'react-icons/fa';
import { useUser } from '@/contexts/UserContext';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

const navItems = [
  { to: '/', labelKey: 'nav.home', Icon: Home },
  { to: '/animals', labelKey: 'nav.browse', Icon: PawPrint },
  { to: '/report', labelKey: 'nav.addNew', Icon: Plus, accent: true },
  { to: '/dashboard', labelKey: 'nav.stats', Icon: Gauge },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const location = useLocation();
  const { user, isRegistered, clearUser } = useUser();

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      {/* Desktop top nav — hidden on mobile */}
      <nav className="hidden md:block sticky top-3 z-50 px-4">
        <div className="container max-w-6xl flex items-center justify-between h-12 bg-background/80 backdrop-blur-md border rounded-full px-6 shadow-sm">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <PawPrint className="h-4 w-4 text-primary" />
            </div>
            <span className="font-heading text-lg font-bold text-foreground">PawConnect</span>
          </Link>

          <div className="flex items-center gap-1">
            {navItems.map(link => {
              const isActive = location.pathname === link.to;
              return (
                <Link key={link.to} to={link.to}>
                  <button
                    className={`
                      inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200
                      ${isActive
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                      }
                    `}
                  >
                    <link.Icon className="h-3.5 w-3.5" />
                    {t(link.labelKey)}
                  </button>
                </Link>
              );
            })}

            <div className="mx-2 h-4 w-[1px] bg-border" />
            <LanguageSwitcher />

            {/* Auth section */}
            {isRegistered && user ? (
              <div className="flex items-center gap-2 ml-3 pl-3 border-l border-border">
                <Link
                  to="/profile"
                  className="text-xs text-muted-foreground font-medium flex items-center gap-1 hover:text-primary transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  {user.name.split(' ')[0]}
                </Link>
                <button
                  onClick={clearUser}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                  title={t('common.logout')}
                >
                  <LogOut className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 ml-3 pl-3 border-l border-border">
                <Link to="/login">
                  <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-200">
                    <LogIn className="h-3.5 w-3.5" />
                    {t('common.login')}
                  </button>
                </Link>
                <Link to="/register">
                  <button className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 transition-all duration-200">
                    <UserPlus className="h-3.5 w-3.5" />
                    {t('common.signup')}
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile top bar */}
      <div className="md:hidden sticky top-3 z-50 px-4">
        <div className="flex items-center justify-between h-11 bg-background/80 backdrop-blur-md border rounded-full px-4 shadow-sm">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-primary/10 flex items-center justify-center">
              <PawPrint className="h-4 w-4 text-primary" />
            </div>
            <span className="font-heading text-lg font-bold tracking-tight">PawConnect</span>
          </Link>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            
            {/* Auth section — mobile */}
            {isRegistered && user ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/profile"
                  className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold"
                >
                  {user.name.charAt(0).toUpperCase()}
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <Link to="/login">
                  <button className="px-2 py-1 rounded-full text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors">
                    {t('common.login')}
                  </button>
                </Link>
                <Link to="/register">
                  <button className="px-3 py-1 rounded-full text-[10px] font-semibold bg-primary text-primary-foreground shadow-sm">
                    {t('common.signup')}
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Page content */}
      <main className="flex-1 pb-20 md:pb-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer — desktop only */}
      <footer className="hidden md:block border-t py-8 bg-muted/30">
        <div className="container text-center text-sm text-muted-foreground space-y-2">
          <div className="flex items-center justify-center gap-2">
            <PawPrint className="h-5 w-5 text-primary" />
            <span className="font-heading text-base font-semibold text-foreground">PawConnect</span>
          </div>
          <p>{t('footer.tagline')}</p>
        </div>
      </footer>

      {/* Mobile bottom tab bar */}
      <div className="md:hidden bottom-nav glass-strong">
        <div className="flex items-end justify-around px-2 pt-2 pb-1">
          {navItems.map(({ to, labelKey, Icon, accent }) => {
            const isActive = location.pathname === to;

            if (accent) {
              return (
                <Link key={to} to={to} className="flex flex-col items-center -mt-5">
                  <div className={`
                    w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-200
                    ${isActive ? 'bg-primary shadow-glow scale-105' : 'bg-primary/90'}
                  `}>
                    <Icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <span className={`text-[10px] mt-1 font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                    {t(labelKey)}
                  </span>
                </Link>
              );
            }

            return (
              <Link key={to} to={to} className="flex flex-col items-center py-1 px-3">
                <div className={`
                  w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200
                  ${isActive ? 'bg-primary/10' : ''}
                `}>
                  <Icon className={`h-5 w-5 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <span className={`text-[10px] mt-0.5 font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                  {t(labelKey)}
                </span>
              </Link>
            );
          })}

          {/* Profile tab */}
          <Link to={isRegistered ? '/profile' : '/register'} className="flex flex-col items-center py-1 px-3">
            <div className={`
              w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200
              ${location.pathname === '/profile' ? 'bg-primary/10' : ''}
            `}>
              {isRegistered && user ? (
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors
                  ${location.pathname === '/profile' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}
                `}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
              ) : (
                <UserIcon className={`h-5 w-5 transition-colors ${location.pathname === '/profile' ? 'text-primary' : 'text-muted-foreground'}`} />
              )}
            </div>
            <span className={`text-[10px] mt-0.5 font-medium ${location.pathname === '/profile' ? 'text-primary' : 'text-muted-foreground'}`}>
              {isRegistered ? t('common.profile') : t('common.login')}
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
