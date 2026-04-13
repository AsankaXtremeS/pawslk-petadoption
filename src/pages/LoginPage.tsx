import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaPaw as PawPrint, FaArrowLeft as ArrowLeft, FaArrowRight as ArrowRight, FaPhone as Phone, FaLock as Lock, FaEye as Eye, FaEyeSlash as EyeSlash } from 'react-icons/fa';
import { useUser } from '@/contexts/UserContext';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

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

export default function LoginPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';
  
  const { loginByMobile, isRegistered } = useUser();

  const [countryCode, setCountryCode] = useState('+94');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already logged in, redirect immediately
  if (isRegistered) {
    navigate(decodeURIComponent(redirectTo), { replace: true });
    return null;
  }

  const handleSubmit = async () => {
    let clean = mobile.replace(/[^0-9]/g, '');
    
    // Automatically strip leading zero if present (e.g. 076... -> 76...)
    if (clean.startsWith('0')) {
      clean = clean.substring(1);
    }
    
    if (!clean) {
      setError(t('auth.errors.mobileRequired'));
      return;
    }
    if (!/^[0-9]{9}$/.test(clean)) {
      setError(t('auth.errors.mobileInvalid'));
      return;
    }
    if (!password) {
      setError(t('auth.errors.passwordRequired'));
      return;
    }

    setIsSubmitting(true);
    setError('');

    const fullMobile = countryCode.replace('+', '') + clean;
    try {
      await loginByMobile(fullMobile, password);
      toast.success('Welcome back! 🐾');
      navigate(decodeURIComponent(redirectTo), { replace: true });
    } catch (err) {
      const msg = (err as Error).message || t('auth.errors.loginFailed');
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-flow-page">
      <div className="rf-bg-pattern" />

      {/* Top bar */}
      <div className="rf-topbar">
        <motion.button
          className="rf-back-btn"
          onClick={() => navigate(-1)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft />
        </motion.button>

        <div className="rf-logo">
          <PawPrint />
          <span>PawConnect</span>
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
            <h2 className="rf-step-title">{t('auth.welcomeBack')}</h2>
            <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.85rem', marginTop: '-0.25rem' }}>
              {t('auth.loginSubtitle')}
            </p>
          </div>

          <div className="rf-form">
            {/* Mobile Input */}
            <div className="rf-field">
              <label className="rf-label" htmlFor="login-mobile">{t('auth.mobile')}</label>
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

            {/* Password Input */}
            <div className="rf-field">
              <label className="rf-label" htmlFor="login-password">{t('auth.password')}</label>
              <div className={`rf-input-wrapper ${error === t('auth.errors.passwordRequired') || error === 'Invalid password' ? 'error' : ''}`} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ paddingLeft: '1rem', color: 'hsl(var(--muted-foreground))' }}>
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  className="rf-input"
                  placeholder={t('auth.passwordPlaceholder')}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  autoComplete="current-password"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSubmit();
                  }}
                  style={{ paddingLeft: '0.75rem' }}
                />
                <button
                  type="button"
                  className="rf-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                  style={{ padding: '0 1rem', color: 'hsl(var(--muted-foreground))', display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  {showPassword ? <EyeSlash className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
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
                  <span>{t('common.login')}</span>
                  <ArrowRight />
                </>
              )}
            </motion.button>

            {/* Register link */}
            <p className="gs-login-link" style={{ textAlign: 'center', marginTop: '0.5rem' }}>
              {t('auth.noAccount')}{' '}
              <Link
                to={`/register?lang=${i18n.language}${redirectTo !== '/' ? `&redirect=${encodeURIComponent(redirectTo)}` : ''}`}
                className="gs-login-btn"
              >
                {t('common.signup')}
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
