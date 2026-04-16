import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHome as Home, FaPaw as PawPrint, FaPlus as Plus, FaTachometerAlt as Gauge, FaSignOutAlt as LogOut, FaUser as UserIcon, FaSignInAlt as LogIn, FaUserPlus as UserPlus, FaBell as Bell } from 'react-icons/fa';
import { useUser } from '@/contexts/UserContext';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import { FaPhoneAlt as Phone, FaEnvelope as Email, FaMapMarkerAlt as MapMarker } from 'react-icons/fa';
import NotificationDropdown from './NotificationDropdown';

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
          <Link to="/" className="flex items-center gap-2 group" aria-label="Home">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <PawPrint className="h-4 w-4 text-primary" />
            </div>
            <span className="font-heading text-lg font-bold text-foreground">Paw Connect</span>
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
              <div className="flex items-center gap-2 ml-2 pl-2 border-l border-border">
                <NotificationDropdown />
                <div className="mx-1 h-4 w-[1px] bg-border/50" />
                <Link
                  to="/profile"
                  className="text-xs text-muted-foreground font-medium flex items-center gap-1 hover:text-primary transition-colors relative"
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
          <Link to="/" className="flex items-center gap-2 group" aria-label="Home">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center transition-colors group-hover:bg-primary/20">
              <PawPrint className="h-4.5 w-4.5 text-primary" />
            </div>
            <span className="font-heading text-lg font-bold tracking-tight hidden xs:inline-block">Paw Connect</span>
          </Link>

          <div className="flex items-center gap-1.5">
            <LanguageSwitcher />
            
            {/* Auth section — mobile */}
            {isRegistered && user ? (
              <div className="flex items-center gap-1.5">
                <NotificationDropdown />
                <Link
                  to="/profile"
                  className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold"
                >
                  {user.name.charAt(0).toUpperCase()}
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 ml-1">
                <Link to="/login">
                  <button className="px-2.5 py-1.5 rounded-full text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all">
                    {t('common.login')}
                  </button>
                </Link>
                <Link to="/register">
                  <button className="px-3.5 py-1.5 rounded-full text-[11px] font-semibold bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 transition-all">
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
      <footer className="hidden md:block bg-muted/30 border-t pt-10 pb-8">
        <div className="container max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Branding Column */}
            <div className="space-y-4">
              <Link to="/" className="flex items-center gap-2 group w-fit">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center transition-colors group-hover:bg-primary/20">
                  <PawPrint className="h-4.5 w-4.5 text-primary" />
                </div>
                <span className="font-heading text-lg font-bold text-foreground">Paw Connect</span>
              </Link>
              <p className="text-[13px] text-muted-foreground leading-relaxed max-w-xs">
                Empowering communities across Sri Lanka to rescue, report, and adopt stray animals. Together, we can find every pet a home.
              </p>
            </div>

            {/* Navigation Column */}
            <div className="space-y-4">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Platform</h4>
              <ul className="space-y-2">
                {navItems.map(item => (
                  <li key={item.to}>
                    <Link to={item.to} className="text-[13px] text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                      <item.Icon className="h-3 w-3" />
                      {t(item.labelKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Information Column */}
            <div className="space-y-4">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Resources</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/about" className="text-[13px] text-muted-foreground hover:text-primary transition-colors">About Us</Link>
                </li>
                <li>
                  <Link to="/contact" className="text-[13px] text-muted-foreground hover:text-primary transition-colors">Contact Us</Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-[13px] text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link>
                </li>
              </ul>
            </div>

            {/* Contact Column */}
            <div className="space-y-4">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Contact</h4>
              <ul className="space-y-2 text-[13px] text-muted-foreground">
                <li className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-primary/5 flex items-center justify-center text-primary shrink-0">
                    <MapMarker className="h-3.5 w-3.5" />
                  </div>
                  <span>Galle, Sri Lanka</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-primary/5 flex items-center justify-center text-primary shrink-0">
                    <Email className="h-3.5 w-3.5" />
                  </div>
                  <span className="break-all">assankasampath@gmail.com</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-primary/5 flex items-center justify-center text-primary shrink-0">
                    <Phone className="h-3.5 w-3.5" />
                  </div>
                  <span>0760589218</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright Section */}
          <div className="pt-6 border-t flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-muted-foreground font-medium">
            <div className="flex items-center gap-2">
              <span className="text-primary font-bold">Paw Connect</span>
              <span>© 2024 All rights reserved.</span>
            </div>
            <div className="flex items-center gap-1">
              Developed & Maintained by <span className="text-foreground font-bold">Asanka Sampath</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile bottom tab bar */}
      <div className="md:hidden bottom-nav glass-strong border-t">
        <div className="flex items-end h-16 px-1 pb-1">
          {navItems.map(({ to, labelKey, Icon, accent }) => {
            const isActive = location.pathname === to;

            if (accent) {
              return (
                <div key={to} className="flex-1 flex justify-center">
                  <Link to={to} className="flex flex-col items-center -mt-6" aria-label={t(labelKey)}>
                    <div className={`
                      w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300
                      ${isActive ? 'bg-primary shadow-glow scale-105' : 'bg-primary/90 hover:bg-primary group-hover:scale-105 shadow-md'}
                    `}>
                      <Icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <span className={`text-[10px] sm:text-[11px] mt-1.5 font-bold tracking-tight text-center w-full px-1 line-clamp-1 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                      {t(labelKey)}
                    </span>
                  </Link>
                </div>
              );
            }

            return (
              <div key={to} className="flex-1 flex justify-center h-full">
                <Link to={to} className="flex flex-col items-center justify-center w-full h-full py-1" aria-label={t(labelKey)}>
                  <div className={`
                    w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200
                    ${isActive ? 'bg-primary/10' : 'hover:bg-muted/50'}
                  `}>
                    <Icon className={`h-5 w-5 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <span className={`text-[10px] sm:text-[11px] mt-1 font-medium text-center w-full px-1 line-clamp-1 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                    {t(labelKey)}
                  </span>
                </Link>
              </div>
            );
          })}

          <div className="flex-1 flex justify-center h-full">
            <Link to={isRegistered ? '/profile' : '/register'} className="flex flex-col items-center justify-center w-full h-full py-1">
              <div className={`
                w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200
                ${location.pathname === '/profile' ? 'bg-primary/10' : 'hover:bg-muted/50'}
              `}>
                {isRegistered && user ? (
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all shadow-sm
                    ${location.pathname === '/profile' ? 'bg-primary text-primary-foreground ring-4 ring-primary/10' : 'bg-muted text-muted-foreground'}
                  `}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                ) : (
                  <UserIcon className={`h-5 w-5 transition-colors ${location.pathname === '/profile' ? 'text-primary' : 'text-muted-foreground'}`} />
                )}
              </div>
              <span className={`text-[10px] sm:text-[11px] mt-1 font-medium text-center w-full px-1 line-clamp-1 ${location.pathname === '/profile' ? 'text-primary' : 'text-muted-foreground'}`}>
                {isRegistered ? t('common.profile') : t('common.login')}
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
