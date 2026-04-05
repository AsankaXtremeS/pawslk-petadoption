import { motion } from 'framer-motion';
import { FaPaw as PawPrint } from 'react-icons/fa';

interface GetStartedProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

export default function GetStarted({ onGetStarted, onLogin }: GetStartedProps) {
  return (
    <div className="get-started-page">
      {/* Floating decorative paw prints */}
      <div className="gs-decor gs-decor-1"><PawPrint /></div>
      <div className="gs-decor gs-decor-2"><PawPrint /></div>
      <div className="gs-decor gs-decor-3"><PawPrint /></div>
      <div className="gs-decor gs-decor-4"><PawPrint /></div>

      <div className="gs-content">
        {/* Logo */}
        <motion.div
          className="gs-logo"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="gs-logo-icon">
            <PawPrint />
          </div>
          <span className="gs-logo-text">PawsLK</span>
        </motion.div>

        {/* Large paw icon as the visual centerpiece */}
        <motion.div
          className="gs-paw-hero"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <PawPrint />
        </motion.div>

        {/* Text Content */}
        <motion.div
          className="gs-text"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h1 className="gs-title">
            Every paw
            <br />
            <span className="gs-title-accent">deserves a home.</span>
          </h1>
          <p className="gs-subtitle">
            Report, rescue, and adopt stray animals across Sri Lanka.
          </p>
        </motion.div>

        {/* CTA Button */}
        <motion.button
          className="gs-cta-button"
          onClick={onGetStarted}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="gs-cta-arrow">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
          <span>Get Started</span>
        </motion.button>

        {/* Login link */}
        <motion.p
          className="gs-login-link"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.65 }}
        >
          Already have an account?{' '}
          <button onClick={onLogin} className="gs-login-btn">
            Log in
          </button>
        </motion.p>
      </div>
    </div>
  );
}
