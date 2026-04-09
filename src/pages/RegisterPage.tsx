import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPaw as PawPrint, FaArrowLeft as ArrowLeft, FaArrowRight as ArrowRight, FaGlobeAsia as Globe, FaLock as Lock, FaEye as Eye, FaEyeSlash as EyeSlash } from 'react-icons/fa';
import { useUser } from '@/contexts/UserContext';
import { toast } from 'sonner';

type Language = 'en' | 'si' | 'ta';

const languages: { code: Language; label: string; nativeLabel: string; flag: string }[] = [
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

const i18n: Record<Language, {
  chooseLanguage: string;
  yourDetails: string;
  name: string;
  namePlaceholder: string;
  mobile: string;
  mobilePlaceholder: string;
  password: string;
  passwordPlaceholder: string;
  continue: string;
  back: string;
  nameRequired: string;
  mobileRequired: string;
  mobileInvalid: string;
  passwordRequired: string;
  passwordLength: string;
  alreadyHaveAccount: string;
  login: string;
}> = {
  en: {
    chooseLanguage: 'Choose your language',
    yourDetails: 'Your Details',
    name: 'Full Name',
    namePlaceholder: 'Enter your name',
    mobile: 'Mobile Number',
    mobilePlaceholder: '7XXXXXXXX',
    password: 'Password',
    passwordPlaceholder: 'Create a password',
    continue: 'Create Account',
    back: 'Back',
    nameRequired: 'Name is required',
    mobileRequired: 'Mobile number is required',
    mobileInvalid: 'Enter a valid 9-digit mobile number (e.g. 76xxxxxxx)',
    passwordRequired: 'Password is required',
    passwordLength: 'Password must be at least 6 characters',
    alreadyHaveAccount: 'Already have an account? ',
    login: 'Login',
  },
  si: {
    chooseLanguage: 'ඔබේ භාෂාව තෝරන්න',
    yourDetails: 'ඔබේ විස්තර',
    name: 'සම්පූර්ණ නම',
    namePlaceholder: 'ඔබේ නම ඇතුළත් කරන්න',
    mobile: 'ජංගම දුරකථන අංකය',
    mobilePlaceholder: '7XXXXXXXX',
    password: 'මුරපදය',
    passwordPlaceholder: 'මුරපදයක් සාදන්න',
    continue: 'ගිණුම සාදන්න',
    back: 'ආපසු',
    nameRequired: 'නම අවශ්‍යයි',
    mobileRequired: 'ජංගම අංකය අවශ්‍යයි',
    mobileInvalid: 'වලංගු අංක 9ක ජංගම දුරකථන අංකයක් ඇතුළත් කරන්න',
    passwordRequired: 'මුරපදයක් අවශ්‍යයි',
    passwordLength: 'මුරපදය අවම වශයෙන් අක්ෂර 6ක් විය යුතුය',
    alreadyHaveAccount: 'දැනටමත් ගිණුමක් තිබේද? ',
    login: 'ඇතුල් වන්න',
  },
  ta: {
    chooseLanguage: 'உங்கள் மொழியை தேர்ந்தெடுக்கவும்',
    yourDetails: 'உங்கள் விவரங்கள்',
    name: 'முழு பெயர்',
    namePlaceholder: 'உங்கள் பெயரை உள்ளிடவும்',
    mobile: 'கைபேசி எண்',
    mobilePlaceholder: '7XXXXXXXX',
    password: 'கடவுச்சொல்',
    passwordPlaceholder: 'கடவுச்சொல்லை உருவாக்கவும்',
    continue: 'கணக்கை உருவாக்கு',
    back: 'பின்னால்',
    nameRequired: 'பெயர் தேவை',
    mobileRequired: 'கைபேசி எண் தேவை',
    mobileInvalid: 'சரியான 9-இலக்க கைபேசி எண்ணை உள்ளிடவும்',
    passwordRequired: 'கடவுச்சொல் தேவை',
    passwordLength: 'கடவுச்சொல் குறைந்தபட்சம் 6 எழுத்துக்களாக இருக்க வேண்டும்',
    alreadyHaveAccount: 'ஏற்கனவே ஒரு கணக்கு உள்ளதா? ',
    login: 'உள்நுழைய',
  },
};

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

export default function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';
  const { registerUser, isRegistered } = useUser();

  const [step, setStep] = useState<1 | 2>(1);
  const [direction, setDirection] = useState(1);
  const [selectedLang, setSelectedLang] = useState<Language | null>(null);
  const [name, setName] = useState('');
  const [countryCode, setCountryCode] = useState('+94');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; mobile?: string; password?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-select language if passed in query params
  useEffect(() => {
    const lang = searchParams.get('lang') as Language;
    if (lang && i18n[lang]) {
      setSelectedLang(lang);
      setStep(2);
    }
  }, [searchParams]);

  // If already logged in, redirect immediately
  if (isRegistered) {
    navigate(decodeURIComponent(redirectTo), { replace: true });
    return null;
  }

  const t = i18n[selectedLang || 'en'];

  const handleLanguageSelect = (lang: Language) => {
    setSelectedLang(lang);
    setDirection(1);
    setStep(2);
  };

  const handleBack = () => {
    if (step === 2) {
      setDirection(-1);
      setStep(1);
    } else {
      navigate(-1);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { name?: string; mobile?: string; password?: string } = {};

    if (!name.trim()) {
      newErrors.name = t.nameRequired;
    }

    let cleanMobile = mobile.replace(/[^0-9]/g, '');
    if (cleanMobile.startsWith('0')) {
      cleanMobile = cleanMobile.substring(1);
    }

    if (!cleanMobile) {
      newErrors.mobile = t.mobileRequired;
    } else if (!/^[0-9]{9}$/.test(cleanMobile)) {
      newErrors.mobile = t.mobileInvalid;
    }

    if (!password) {
      newErrors.password = t.passwordRequired;
    } else if (password.length < 6) {
      newErrors.password = t.passwordLength;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !selectedLang) return;

    setIsSubmitting(true);

    let cleanMobile = mobile.replace(/[^0-9]/g, '');
    if (cleanMobile.startsWith('0')) cleanMobile = cleanMobile.substring(1);
    
    const fullMobile = countryCode.replace('+', '') + cleanMobile;

    try {
      await registerUser({
        name: name.trim(),
        mobile: fullMobile,
        password,
        countryCode,
        language: selectedLang,
      });
      toast.success('Welcome to PawConnect! 🐾');
      navigate(decodeURIComponent(redirectTo), { replace: true });
    } catch (err: any) {
      toast.error(err.message || 'Registration failed. Please try again.');
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
          onClick={handleBack}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft />
          <span>{step === 1 ? '' : t.back}</span>
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
                <h2 className="rf-step-title">{t.chooseLanguage}</h2>
              </div>

              <div className="rf-lang-grid">
                {languages.map((lang) => (
                  <motion.button
                    key={lang.code}
                    className={`rf-lang-card ${selectedLang === lang.code ? 'selected' : ''}`}
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
                <h2 className="rf-step-title">{t.yourDetails}</h2>
                <p className="rf-step-subtitle" style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.85rem', marginTop: '-0.25rem' }}>
                  {t.alreadyHaveAccount}
                  <Link 
                    to={`/login?lang=${selectedLang}${redirectTo !== '/' ? `&redirect=${encodeURIComponent(redirectTo)}` : ''}`}
                    className="text-primary hover:underline font-medium"
                  >
                    {t.login}
                  </Link>
                </p>
              </div>

              <div className="rf-form">
                {/* Name Input */}
                <div className="rf-field">
                  <label className="rf-label" htmlFor="register-name">{t.name}</label>
                  <div className={`rf-input-wrapper ${errors.name ? 'error' : ''}`}>
                    <input
                      id="register-name"
                      type="text"
                      className="rf-input"
                      placeholder={t.namePlaceholder}
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
                  <label className="rf-label" htmlFor="register-mobile">{t.mobile}</label>
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
                      placeholder={t.mobilePlaceholder}
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
                  <label className="rf-label" htmlFor="register-password">{t.password}</label>
                  <div className={`rf-input-wrapper ${errors.password ? 'error' : ''}`} style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ paddingLeft: '1rem', color: 'hsl(var(--muted-foreground))' }}>
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="register-password"
                      type={showPassword ? "text" : "password"}
                      className="rf-input"
                      placeholder={t.passwordPlaceholder}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
                      }}
                      autoComplete="new-password"
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
                      <span>{t.continue}</span>
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
