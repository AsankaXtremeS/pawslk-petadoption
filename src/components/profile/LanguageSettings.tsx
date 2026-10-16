import { useState } from 'react';
import { FaGlobeAsia as Globe, FaChevronRight as ChevronRight, FaCheckCircle as CheckCircle } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useUser, type UserData } from '@/contexts/UserContext';
import { friendlyError } from '@/utils/errors';
import { LANGUAGES, type Language } from '@/lib/constants';
import SettingsCard from './SettingsCard';

export default function LanguageSettings({ user }: { user: UserData }) {
  const { t, i18n } = useTranslation();
  const { updateUser } = useUser();
  const [editingLang, setEditingLang] = useState(false);
  const [langSaving, setLangSaving] = useState(false);

  const handleLanguageChange = async (lang: Language) => {
    if (lang === user.language) return;
    setLangSaving(true);
    try {
      await i18n.changeLanguage(lang);
      await updateUser({ language: lang });
      toast.success(t('profile.language.updated'));
      setEditingLang(false);
    } catch (err) {
      toast.error(friendlyError(err, 'Failed to update language.'));
    } finally {
      setLangSaving(false);
    }
  };

  const currentLang = LANGUAGES.find(l => l.code === user.language) || LANGUAGES[0];

  return (
    <SettingsCard
      icon={<Globe className="w-[18px] h-[18px]" />}
      title={t('profile.language.title')}
      subtitle={<>{currentLang.flag} {currentLang.nativeLabel}</>}
      open={editingLang}
      onToggle={() => setEditingLang(!editingLang)}
      toggleIcon={<ChevronRight className="w-3.5 h-3.5" />}
      delay={0.15}
    >
      <div className="p-4 flex flex-col gap-2">
        {LANGUAGES.map(lang => (
          <button
            key={lang.code}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border-[1.5px] w-full text-left transition-all ${
              user.language === lang.code
                ? 'border-primary bg-primary/5'
                : 'border-border bg-background hover:border-primary/30 hover:bg-primary/[0.02]'
            }`}
            onClick={() => handleLanguageChange(lang.code)}
            disabled={langSaving}
          >
            <span className="text-lg">{lang.flag}</span>
            <span className="text-sm font-bold flex-1">{lang.nativeLabel}</span>
            {user.language === lang.code && <CheckCircle className="w-4 h-4 text-primary" />}
          </button>
        ))}
      </div>
    </SettingsCard>
  );
}
