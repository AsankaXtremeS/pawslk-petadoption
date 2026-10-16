import { useState } from 'react';
import { FaLock as Lock, FaChevronRight as ChevronRight, FaEye as Eye, FaEyeSlash as EyeSlash } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useUser } from '@/contexts/UserContext';
import SettingsCard from './SettingsCard';

interface PasswordFieldProps {
  label: string;
  labelClassName: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}

function PasswordField({ label, labelClassName, placeholder, value, onChange }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="rf-field">
      <label className={labelClassName}>{label}</label>
      <div className="rf-input-wrapper flex items-center">
        <input
          type={visible ? "text" : "password"}
          className="rf-input w-full bg-transparent border-none focus:outline-none"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ paddingLeft: '0.75rem' }}
        />
        <button
          type="button"
          className="p-2 text-muted-foreground"
          onClick={() => setVisible(!visible)}
        >
          {visible ? <EyeSlash className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

export default function PasswordSettings() {
  const { t } = useTranslation();
  const { updatePassword } = useUser();
  const [editingPassword, setEditingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);

  const handlePasswordSave = async () => {
    if (!currentPassword) { toast.error(t('profile.password.required')); return; }
    if (newPassword.length < 6) { toast.error(t('profile.password.length')); return; }

    setPasswordSaving(true);
    try {
      await updatePassword(currentPassword, newPassword);
      toast.success(t('profile.password.updated'));
      setEditingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      toast.error((err as Error).message || 'Failed to update password.');
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <SettingsCard
      icon={<Lock className="w-[18px] h-[18px]" />}
      title={t('profile.password.title')}
      subtitle={t('profile.password.subtitle')}
      open={editingPassword}
      onToggle={() => {
        setEditingPassword(!editingPassword);
        setCurrentPassword('');
        setNewPassword('');
      }}
      toggleIcon={<ChevronRight className="w-3.5 h-3.5" />}
      delay={0.18}
    >
      <div className="p-4 flex flex-col gap-3">
        <PasswordField
          label={t('profile.password.current')}
          labelClassName="text-xs font-bold text-muted-foreground mb-1 block"
          placeholder={t('profile.password.currentPlaceholder')}
          value={currentPassword}
          onChange={setCurrentPassword}
        />
        <PasswordField
          label={t('profile.password.new')}
          labelClassName="text-xs font-bold text-muted-foreground mb-1 block border-t pt-2"
          placeholder={t('profile.password.newPlaceholder')}
          value={newPassword}
          onChange={setNewPassword}
        />

        <button
          className="w-full py-3 mt-1 rounded-xl bg-gradient-to-r from-primary to-[hsl(173_60%_32%)] text-primary-foreground font-bold text-sm shadow-glow hover:shadow-lg hover:-translate-y-px transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:translate-y-0"
          onClick={handlePasswordSave}
          disabled={passwordSaving}
        >
          {passwordSaving ? t('profile.actions.updating') : t('profile.actions.update')}
        </button>
      </div>
    </SettingsCard>
  );
}
