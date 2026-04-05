import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHome as Home, FaPaw as PawPrint, FaPlus as Plus, FaTachometerAlt as Gauge, FaSignOutAlt as LogOut, FaUser as UserIcon } from 'react-icons/fa';
import { useUser } from '@/contexts/UserContext';

const navItems = [
  { to: '/', label: 'Home', Icon: Home },
  { to: '/animals', label: 'Browse', Icon: PawPrint },
  { to: '/report', label: 'Add New', Icon: Plus, accent: true },
  { to: '/dashboard', label: 'Stats', Icon: Gauge },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { user, clearUser } = useUser();

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      {/* Desktop top nav — hidden on mobile */}
      <nav className="hidden md:block sticky top-3 z-50 px-4">
        <div className="container max-w-5xl flex items-center justify-between h-12 bg-background/80 backdrop-blur-md border rounded-full px-6 shadow-sm">
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
                    {link.label}
                  </button>
                </Link>
              );
            })}

            {/* User info + Logout */}
            {user && (
              <div className="flex items-center gap-2 ml-3 pl-3 border-l border-border">
                <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                  <UserIcon className="h-3 w-3" />
                  {user.name.split(' ')[0]}
                </span>
                <button
                  onClick={clearUser}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                  title="Log out"
                >
                  <LogOut className="h-3 w-3" />
                </button>
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

          {/* User info on mobile */}
          {user && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-medium">
                {user.name.split(' ')[0]}
              </span>
              <button
                onClick={clearUser}
                className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                title="Log out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
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
          <p>Helping Sri Lanka's stray animals find loving homes.</p>
        </div>
      </footer>

      {/* Mobile bottom tab bar */}
      <div className="md:hidden bottom-nav glass-strong">
        <div className="flex items-end justify-around px-2 pt-2 pb-1">
          {navItems.map(({ to, label, Icon, accent }) => {
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
                    {label}
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
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
