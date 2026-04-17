import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPaw as PawPrint, FaArrowLeft as ArrowLeft, FaArrowRight as ArrowRight, FaGlobeAsia as Globe, FaShieldAlt as Shield } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

type Language = 'en' | 'si' | 'ta';

interface RegisterFlowProps {
  onComplete: (userData: { name: string; mobile: string; countryCode: string; language: Language; password: string }) => void;
  onBack: () => void;
}

const languagesList: { code: Language; label: string; nativeLabel: string; flag: string }[] = [
  { code: 'en', label: 'English', nativeLabel: 'English', flag: '🇬🇧' },
  { code: 'si', label: 'Sinhala', nativeLabel: 'සිංහල', flag: '🇱🇰' },
  { code: 'ta', label: 'Tamil', nativeLabel: 'தமிழ்', flag: '🇱🇰' },
];

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

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
};

export default function RegisterFlow({ onComplete, onBack }: RegisterFlowProps) {
  const { t, i18n } = useTranslation();
  const [step, setStep] = useState<1 | 2>(1);
  const [direction, setDirection] = useState(1);
  const [name, setName] = useState('');
  const [countryCode, setCountryCode] = useState('+94');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ name?: string; mobile?: string; password?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const handleLanguageSelect = (lang: Language) => {
    i18n.changeLanguage(lang);
    setDirection(1);
    setStep(2);
  };

  const handleBack = () => {
    if (step === 2) {
      setDirection(-1);
      setStep(1);
    } else {
      onBack();
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { name?: string; mobile?: string; password?: string } = {};
    
    if (!name.trim()) {
      newErrors.name = t('auth.errors.nameRequired');
    }
    
    if (!mobile.trim()) {
      newErrors.mobile = t('auth.errors.mobileRequired');
    } else if (!/^[0-9]{7,15}$/.test(mobile.replace(/\s/g, ''))) {
      newErrors.mobile = t('auth.errors.mobileInvalid');
    }

    if (!password) {
      newErrors.password = t('auth.errors.passwordRequired') || 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = t('auth.errors.passwordTooShort') || 'Min 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setShowTerms(true);
  };

  const handleAgree = () => {
    setShowTerms(false);
    setIsSubmitting(true);
    
    // Build full mobile: strip + from country code, concat with local number
    // e.g. "+94" + "760589218" → "94760589218"
    const cleanMobile = mobile.replace(/\s/g, '');
    const fullMobile = countryCode.replace('+', '') + cleanMobile;
    
    onComplete({
      name: name.trim(),
      mobile: fullMobile,
      countryCode,
      language: i18n.language as Language,
      password: password,
    });
    
    setIsSubmitting(false);
  };

  return (
    <div className="register-flow-page">
      {/* Background pattern */}
      <div className="rf-bg-pattern" />

      {/* Top bar */}
      <div className="rf-topbar">
        <motion.button
          className="rf-back-btn"
          onClick={handleBack}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft />
          <span>{step === 1 ? '' : t('common.back')}</span>
        </motion.button>

        <div className="rf-logo">
          <PawPrint />
          <span>PawConnect</span>
        </div>

        {/* Step indicator */}
        <div className="rf-steps">
          <div className={`rf-step-dot ${step >= 1 ? 'active' : ''}`} />
          <div className="rf-step-line" />
          <div className={`rf-step-dot ${step >= 2 ? 'active' : ''}`} />
        </div>
      </div>

      {/* Terms & Conditions Modal */}
      <AnimatePresence>
        {showTerms && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-[#1a1c1e] border-none shadow-2xl rounded-[2rem] max-w-lg w-full overflow-hidden"
            >
              <div className="p-8 space-y-6">
                <div className="flex items-center gap-4 text-primary">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Shield className="text-3xl" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold font-heading">{t('auth.termsTitle')}</h3>
                    <p className="text-sm opacity-60 uppercase tracking-wider font-medium">{t('auth.termsAndPrivacy')}</p>
                  </div>
                </div>

                <div className="bg-muted/10 p-6 rounded-2xl border border-dashed border-primary/20 text-sm leading-relaxed">
                  <p className="font-bold text-lg mb-3">📢 Public Display & Privacy</p>
                  <p className="opacity-80">{t('auth.termsWarning')}</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <button
                    onClick={() => setShowTerms(false)}
                    className="flex-1 py-4 px-6 rounded-2xl border-2 border-muted font-bold hover:bg-muted transition-all active:scale-95"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    onClick={handleAgree}
                    className="flex-[2] py-4 px-6 rounded-2xl bg-primary text-white font-black hover:brightness-110 transition-all shadow-xl shadow-primary/30 active:scale-95"
                  >
                    {t('auth.iAgree')}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Content area */}
      <div className="rf-content">
        <AnimatePresence mode="wait" custom={direction}>
          {step === 1 && (
            <motion.div
              key="step-1"
              className="rf-step-content"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <div className="rf-step-header">
                <div className="rf-step-icon">
                  <Globe />
                </div>
                <h2 className="rf-step-title">{t('auth.chooseLanguage')}</h2>
              </div>

              <div className="rf-lang-grid">
                {languagesList.map((lang) => (
                  <motion.button
                    key={lang.code}
                    className={`rf-lang-card ${i18n.language === lang.code ? 'selected' : ''}`}
                    onClick={() => handleLanguageSelect(lang.code)}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <span className="rf-lang-flag">{lang.flag}</span>
                    <span className="rf-lang-native">{lang.nativeLabel}</span>
                    <span className="rf-lang-label">{lang.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step-2"
              className="rf-step-content"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <div className="rf-step-header">
                <div className="rf-step-icon">
                  <PawPrint />
                </div>
                <h2 className="rf-step-title">{t('auth.yourDetails')}</h2>
              </div>

              <div className="rf-form">
                {/* Name Input */}
                <div className="rf-field">
                  <label className="rf-label" htmlFor="register-name">{t('auth.name')}</label>
                  <div className={`rf-input-wrapper ${errors.name ? 'error' : ''}`}>
                    <input
                      id="register-name"
                      type="text"
                      className="rf-input"
                      placeholder={t('auth.namePlaceholder')}
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
                      }}
                      autoComplete="name"
                    />
                  </div>
                  {errors.name && (
                    <motion.p
                      className="rf-error"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {errors.name}
                    </motion.p>
                  )}
                </div>

                {/* Mobile Input */}
                <div className="rf-field">
                  <label className="rf-label" htmlFor="register-mobile">{t('auth.mobile')}</label>
                  <div className={`rf-input-wrapper rf-mobile-input ${errors.mobile ? 'error' : ''}`}>
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
                      id="register-mobile"
                      type="tel"
                      className="rf-input"
                      placeholder={t('auth.mobilePlaceholder')}
                      value={mobile}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9\s]/g, '');
                        setMobile(val);
                        if (errors.mobile) setErrors(prev => ({ ...prev, mobile: undefined }));
                      }}
                      autoComplete="tel"
                    />
                  </div>
                  {errors.mobile && (
                    <motion.p
                      className="rf-error"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {errors.mobile}
                    </motion.p>
                  )}
                </div>

                {/* Password Input */}
                <div className="rf-field">
                  <label className="rf-label" htmlFor="register-password">{t('auth.password') || 'Password'}</label>
                  <div className={`rf-input-wrapper ${errors.password ? 'error' : ''}`}>
                    <input
                      id="register-password"
                      type="password"
                      className="rf-input"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
                      }}
                      autoComplete="new-password"
                    />
                  </div>
                  {errors.password && (
                    <motion.p
                      className="rf-error"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {errors.password}
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
                      <span>{t('auth.createAccount')}</span>
                      <ArrowRight />
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
