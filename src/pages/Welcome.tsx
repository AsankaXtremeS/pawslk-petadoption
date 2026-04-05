import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import GetStarted from './GetStarted';
import RegisterFlow from './RegisterFlow';
import LoginFlow from './LoginFlow';
import { useUser } from '@/contexts/UserContext';
import { toast } from 'sonner';

type Screen = 'welcome' | 'register' | 'login';

export default function Welcome() {
  const [screen, setScreen] = useState<Screen>('welcome');
  const { registerUser, loginByMobile } = useUser();

  const handleGetStarted = () => {
    setScreen('register');
  };

  const handleLoginClick = () => {
    setScreen('login');
  };

  const handleRegisterComplete = async (userData: { name: string; mobile: string; countryCode: string; language: 'en' | 'si' | 'ta' }) => {
    try {
      await registerUser(userData);
      toast.success('Welcome to PawsLK! 🐾');
    } catch (err: any) {
      toast.error(err.message || 'Registration failed. Please try again.');
    }
  };

  const handleLoginComplete = async (mobile: string) => {
    try {
      await loginByMobile(mobile);
      toast.success('Welcome back! 🐾');
    } catch (err: any) {
      toast.error(err.message || 'Login failed. Please check your number.');
    }
  };

  const handleBack = () => {
    setScreen('welcome');
  };

  return (
    <AnimatePresence mode="wait">
      {screen === 'welcome' && (
        <motion.div
          key="welcome"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <GetStarted onGetStarted={handleGetStarted} onLogin={handleLoginClick} />
        </motion.div>
      )}

      {screen === 'register' && (
        <motion.div
          key="register"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <RegisterFlow
            onComplete={handleRegisterComplete}
            onBack={handleBack}
          />
        </motion.div>
      )}

      {screen === 'login' && (
        <motion.div
          key="login"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <LoginFlow
            onComplete={handleLoginComplete}
            onBack={handleBack}
            onRegister={() => setScreen('register')}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
