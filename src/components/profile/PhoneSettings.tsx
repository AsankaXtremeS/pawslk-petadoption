import { useState } from 'react';
import { FaPhone as Phone, FaEdit as Edit } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useUser, type UserData } from '@/contexts/UserContext';
import { friendlyError } from '@/utils/errors';
import { COUNTRY_CODES } from '@/lib/constants';
import { formatPhone } from '@/lib/utils';
import SettingsCard from './SettingsCard';

export default function PhoneSettings({ user }: { user: UserData }) {
  const { t } = useTranslation();
  const { updateUser } = useUser();
  const [editingPhone, setEditingPhone] = useState(false);
  const [newCountryCode, setNewCountryCode] = useState(user.countryCode || '+94');
  const [newMobile, setNewMobile] = useState('');
  const [phoneSaving, setPhoneSaving] = useState(false);

  const handlePhoneSave = async () => {
    let clean = newMobile.replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) {
      clean = clean.substring(1);
    }

    if (!clean) { toast.error(t('profile.phone.required')); return; }
    if (!/^[0-9]{9}$/.test(clean)) { toast.error(t('profile.phone.invalid')); return; }

    setPhoneSaving(true);
    try {
      const fullMobile = newCountryCode.replace('+', '') + clean;
      await updateUser({ mobile: fullMobile, countryCode: newCountryCode });
      toast.success(t('profile.success.phoneUpdated'));
      setEditingPhone(false);
      setNewMobile('');
    } catch (err) {
      toast.error(friendlyError(err, 'Failed to update phone number.'));
    } finally {
      setPhoneSaving(false);
    }
  };

  return (
    <SettingsCard
      icon={<Phone className="w-[18px] h-[18px]" />}
      title={t('profile.phone.title')}
      subtitle={formatPhone(user.mobile)}
      truncateSubtitle
      open={editingPhone}
      onToggle={() => { setEditingPhone(!editingPhone); setNewMobile(''); }}
      toggleIcon={<Edit className="w-3.5 h-3.5" />}
      delay={0.1}
    >
      <div className="p-4 flex flex-col gap-3">
        <div className="rf-input-wrapper rf-mobile-input">
          <select
            className="rf-country-code"
            value={newCountryCode}
            onChange={(e) => setNewCountryCode(e.target.value)}
            aria-label="Country code"
          >
            {COUNTRY_CODES.map(cc => (
              <option key={cc.code} value={cc.code}>{cc.flag} {cc.code}</option>
            ))}
          </select>
          <div className="rf-input-divider" />
          <input
            type="tel"
            className="rf-input"
            placeholder={t('profile.phone.placeholder')}
            value={newMobile}
            onChange={(e) => setNewMobile(e.target.value.replace(/[^0-9\s]/g, ''))}
            autoComplete="tel"
          />
        </div>
        <button
          className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-[hsl(173_60%_32%)] text-primary-foreground font-bold text-sm shadow-glow hover:shadow-lg hover:-translate-y-px transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:translate-y-0"
          onClick={handlePhoneSave}
          disabled={phoneSaving}
        >
          {phoneSaving ? t('profile.actions.saving') : t('profile.actions.save')}
        </button>
      </div>
    </SettingsCard>
  );
}
