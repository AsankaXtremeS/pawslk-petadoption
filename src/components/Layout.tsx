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
        <div className="container max-w-6xl flex items-center justify-between h-14 bg-white/70 backdrop-blur-xl border border-white/40 rounded-full px-6 shadow-[0_8px_32px_-4px_rgba(0,0,0,0.1)] ring-1 ring-black/5">
          <Link to="/" className="flex items-center gap-2 group transition-transform hover:scale-105 active:scale-95" aria-label="Home">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-glow shadow-primary/20 group-hover:rotate-12 transition-all">
              <PawPrint className="h-4.5 w-4.5 text-primary-foreground" />
            </div>
            <span className="font-heading text-xl font-black text-foreground tracking-tight">PawConnect</span>
          </Link>

          <div className="flex items-center gap-1.5">
            {navItems.map(link => {
              const isActive = location.pathname === link.to;
              return (
                <Link key={link.to} to={link.to} className="relative">
                  <button
                    className={`
                      relative z-10 inline-flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-bold transition-colors duration-300
                      ${isActive ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}
                    `}
                  >
                    <link.Icon className={`h-4 w-4 ${isActive ? 'animate-pulse' : ''}`} />
                    {t(link.labelKey)}
                  </button>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-primary rounded-full shadow-glow shadow-primary/30"
                      transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                    />
                  )}
                </Link>
              );
            })}

            <div className="mx-3 h-6 w-[1.5px] bg-border/50" />
            <LanguageSwitcher />

            {/* Auth section */}
            {isRegistered && user ? (
              <div className="flex items-center gap-3 ml-2 pl-3 border-l border-border/50">
                <NotificationDropdown />
                <Link
                  to="/profile"
                  className="group flex items-center gap-2.5 bg-muted/40 hover:bg-muted/80 px-2.5 py-1 rounded-full transition-all border border-transparent hover:border-primary/10"
                >
                  <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[11px] font-black shadow-sm group-hover:scale-110 transition-transform">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-bold text-foreground pr-1">{user.name.split(' ')[0]}</span>
                </Link>
                <button
                  onClick={clearUser}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all active:scale-90"
                  title={t('common.logout')}
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-3 pl-3 border-l border-border/50">
                <Link to="/login">
                  <button className="px-4 py-2 rounded-full text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all">
                    {t('common.login')}
                  </button>
                </Link>
                <Link to="/register">
                  <button className="px-5 py-2 rounded-full text-xs font-black bg-primary text-primary-foreground shadow-glow shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
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
        <div className="flex items-center justify-between h-12 bg-white border border-border/40 rounded-full px-4 shadow-[0_4px_16px_-2px_rgba(0,0,0,0.08)] ring-1 ring-black/5">
          <Link to="/" className="flex items-center gap-2 group active:scale-95 transition-transform" aria-label="Home">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-glow shadow-primary/20">
              <PawPrint className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-heading text-lg font-black tracking-tight text-foreground hidden xs:inline-block">PawConnect</span>
          </Link>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <NotificationDropdown />
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
                <span className="font-heading text-lg font-bold text-foreground">PawConnect</span>
              </Link>
              <p className="text-[13px] text-muted-foreground leading-relaxed max-w-xs">
                PawConnect (pawconnect.lk) empowers communities across Sri Lanka to rescue, report, and adopt stray animals. Together, we find every pet a home.
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
              <span className="text-primary font-bold">PawConnect</span>
              <span>© {new Date().getFullYear()} All rights reserved.</span>
            </div>
            <div className="flex items-center gap-1">
              Developed & Maintained by <span className="text-foreground font-bold">Asanka Sampath</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile simple footer */}
      <footer className="md:hidden bg-muted/20 border-t py-8 px-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-2">
            <PawPrint className="h-4.5 w-4.5 text-primary" />
            <span className="font-heading font-bold text-base">PawConnect</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed max-w-xs">
            PawConnect (pawconnect.lk) empowers communities across Sri Lanka to rescue, report, and adopt stray animals.
          </p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[11px] text-muted-foreground font-semibold">
            <Link to="/about" className="hover:text-primary transition-colors">About Us</Link>
            <Link to="/contact" className="hover:text-primary transition-colors">Contact Us</Link>
            <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
          </div>
          <div className="space-y-1 mt-2">
            <p className="text-[10px] text-muted-foreground font-medium">
              © {new Date().getFullYear()} All rights reserved.
            </p>
            <p className="text-[9px] text-muted-foreground/60">
              Developed by <span className="font-bold">Asanka Sampath</span>
            </p>
          </div>
        </div>
      </footer>

      {/* Mobile bottom tab bar */}
      <div className="md:hidden bottom-nav bg-white rounded-t-[32px] shadow-[0_-8px_32px_-6px_rgba(0,0,0,0.12)] border-t border-border/30 safe-bottom">
        <div className="flex items-end h-16 px-1 pb-1">
          {navItems.map(({ to, labelKey, Icon, accent }) => {
            const isActive = location.pathname === to;

            if (accent) {
              return (
                <div key={to} className="flex-1 flex justify-center">
                  <Link to={to} className="flex flex-col items-center -mt-8" aria-label={t(labelKey)}>
                    <div className={`
                      w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-300 transform-gpu
                      ${isActive ? 'bg-primary shadow-glow scale-110 -translate-y-1' : 'bg-primary shadow-lg hover:scale-105 active:scale-95'}
                    `}>
                      <Icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <span className={`text-[10px] mt-2 font-black tracking-tight text-center w-full px-1 line-clamp-1 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
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
                    w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200 active:scale-90
                    ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/50'}
                  `}>
                    <Icon className={`h-5 w-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                  </div>
                  <span className={`text-[10px] mt-1 font-bold text-center w-full px-1 line-clamp-1 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                    {t(labelKey)}
                  </span>
                </Link>
              </div>
            );
          })}

          <div className="flex-1 flex justify-center h-full">
            <Link to={isRegistered ? '/profile' : '/register'} className="flex flex-col items-center justify-center w-full h-full py-1">
              <div className={`
                w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200 active:scale-90
                ${location.pathname === '/profile' ? 'bg-primary/10' : 'hover:bg-muted/50'}
              `}>
                {isRegistered && user ? (
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all shadow-sm
                    ${location.pathname === '/profile' ? 'bg-primary text-primary-foreground ring-4 ring-primary/10' : 'bg-muted text-muted-foreground'}
                  `}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                ) : (
                  <UserIcon className={`h-5 w-5 transition-colors ${location.pathname === '/profile' ? 'text-primary' : 'text-muted-foreground'}`} />
                )}
              </div>
              <span className={`text-[10px] mt-1 font-bold text-center w-full px-1 line-clamp-1 ${location.pathname === '/profile' ? 'text-primary' : 'text-muted-foreground'}`}>
                {isRegistered ? t('common.profile') : t('common.login')}
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
