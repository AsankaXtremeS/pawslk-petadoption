import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaPaw as PawPrint, FaArrowLeft as ArrowLeft, FaArrowRight as ArrowRight, FaPhone as Phone } from 'react-icons/fa';

const countryCodes = [
  { code: '+94', country: 'Sri Lanka', flag: '🇱🇰' },
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+1', country: 'USA', flag: '🇺🇸' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬' },
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
  { code: '+82', country: 'South Korea', flag: '🇰🇷' },
  { code: '+81', country: 'Japan', flag: '🇯🇵' },
];

interface LoginFlowProps {
  onComplete: (mobile: string) => void;
  onBack: () => void;
  onRegister: () => void;
}

export default function LoginFlow({ onComplete, onBack, onRegister }: LoginFlowProps) {
  const [countryCode, setCountryCode] = useState('+94');
  const [mobile, setMobile] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const clean = mobile.replace(/\s/g, '');
    if (!clean) {
      setError('Mobile number is required');
      return;
    }
    if (!/^[0-9]{7,15}$/.test(clean)) {
      setError('Enter a valid mobile number');
      return;
    }

    setIsSubmitting(true);
    setError('');

    // Build full number without the +  (e.g., "94760589218")
    const fullMobile = countryCode.replace('+', '') + clean;
    await onComplete(fullMobile);

    setIsSubmitting(false);
  };

  return (
    <div className="register-flow-page">
      <div className="rf-bg-pattern" />

      {/* Top bar */}
      <div className="rf-topbar">
        <motion.button
          className="rf-back-btn"
          onClick={onBack}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft />
        </motion.button>

        <div className="rf-logo">
          <PawPrint />
          <span>PawsLK</span>
        </div>

        <div style={{ width: 40 }} />
      </div>

      {/* Content */}
      <div className="rf-content">
        <motion.div
          className="rf-step-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="rf-step-header">
            <div className="rf-step-icon">
              <Phone />
            </div>
            <h2 className="rf-step-title">Welcome back</h2>
            <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.9rem', marginTop: '-0.5rem' }}>
              Enter your mobile number to log in
            </p>
          </div>

          <div className="rf-form">
            {/* Mobile Input */}
            <div className="rf-field">
              <label className="rf-label" htmlFor="login-mobile">Mobile Number</label>
              <div className={`rf-input-wrapper rf-mobile-input ${error ? 'error' : ''}`}>
                <select
                  className="rf-country-code"
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  aria-label="Country code"
                >
                  {countryCodes.map(cc => (
                    <option key={cc.code} value={cc.code}>
                      {cc.flag} {cc.code}
                    </option>
                  ))}
                </select>
                <div className="rf-input-divider" />
                <input
                  id="login-mobile"
                  type="tel"
                  className="rf-input"
                  placeholder="7X XXX XXXX"
                  value={mobile}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9\s]/g, '');
                    setMobile(val);
                    if (error) setError('');
                  }}
                  autoComplete="tel"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSubmit();
                  }}
                />
              </div>
              {error && (
                <motion.p
                  className="rf-error"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {error}
                </motion.p>
              )}
            </div>

            {/* Submit Button */}
            <motion.button
              className="rf-submit-btn"
              onClick={handleSubmit}
              disabled={isSubmitting}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSubmitting ? (
                <div className="rf-spinner" />
              ) : (
                <>
                  <span>Log In</span>
                  <ArrowRight />
                </>
              )}
            </motion.button>

            {/* Register link */}
            <p className="gs-login-link" style={{ textAlign: 'center', marginTop: '0.5rem' }}>
              Don't have an account?{' '}
              <button onClick={onRegister} className="gs-login-btn">
                Sign up
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
