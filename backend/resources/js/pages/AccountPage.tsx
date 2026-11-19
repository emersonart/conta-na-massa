import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Mail, ShieldCheck } from 'lucide-react';
import { apiClient } from '../api/client';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { useAuthStore } from '../stores/authStore';
import { openCookiePreferences } from '../analytics/consent';
import { trackEvent } from '../analytics/umami';
import type { User } from '../types';

function getErrorMessage(error: any): string {
  const errors = error.response?.data?.errors as Record<string, string[]> | undefined;
  return (errors ? Object.values(errors).flat()[0] : undefined)
    || error.response?.data?.message
    || 'Não foi possível salvar as alterações. Tente novamente.';
}

export const AccountPage: React.FC = () => {
  const { user, setUser } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.pending_email || user?.email || '');
  const [profilePassword, setProfilePassword] = useState('');
  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.pending_email || user.email);
    }
  }, [user]);

  const updateProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setProfileMessage('');
    setProfileError('');
    setProfileLoading(true);
    try {
      const response = await apiClient.put('/auth/profile', {
        name,
        email,
        current_password: profilePassword,
      });
      const updatedUser = response.data.user as User;
      setUser(updatedUser);
      setProfileMessage(response.data.message);
      setProfilePassword('');
      trackEvent(
        updatedUser.pending_email ? 'account_email_change_requested' : 'account_profile_updated'
      );
    } catch (error: any) {
      setProfileError(getErrorMessage(error));
    } finally {
      setProfileLoading(false);
    }
  };

  const updatePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setPasswordMessage('');
    setPasswordError('');
    setPasswordLoading(true);
    try {
      const response = await apiClient.put('/auth/password', {
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: passwordConfirmation,
      });
      setPasswordMessage(response.data.message);
      setCurrentPassword('');
      setNewPassword('');
      setPasswordConfirmation('');
      trackEvent('account_password_updated');
    } catch (error: any) {
      setPasswordError(getErrorMessage(error));
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold font-heading text-[#212529]">Minha conta</h2>
        <p className="mt-1 text-sm text-slate-600">Gerencie seus dados cadastrais e proteja seu acesso.</p>
      </div>

      <Card>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#E85D04] flex items-center justify-center"><Mail className="w-5 h-5" /></div>
          <div><h3 className="font-semibold text-[#212529]">Dados cadastrais</h3><p className="text-xs text-slate-500">Alterar a senha atual é exigido para salvar.</p></div>
        </div>
        {profileMessage && <div role="status" className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex gap-2"><CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />{profileMessage}</div>}
        {profileError && <div role="alert" className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex gap-2"><AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />{profileError}</div>}
        {user?.pending_email && <div className="mb-4 rounded-xl bg-amber-50 border border-amber-200 p-3 text-sm text-amber-900">Aguardando confirmação de <strong>{user.pending_email}</strong>. Seu e-mail atual permanece ativo. Para reenviar o link, salve novamente o mesmo endereço com sua senha atual.</div>}
        <form onSubmit={updateProfile} className="space-y-4">
          <Input label="Nome" value={name} onChange={(event) => setName(event.target.value)} required maxLength={255} autoComplete="name" />
          <Input label="E-mail" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" helperText={user?.pending_email ? `E-mail atual: ${user.email}` : 'Para trocar o e-mail, confirme o link enviado ao novo endereço.'} />
          <Input label="Senha atual" type="password" value={profilePassword} onChange={(event) => setProfilePassword(event.target.value)} required autoComplete="current-password" />
          <Button type="submit" isLoading={profileLoading}>Salvar dados</Button>
        </form>
      </Card>

      <Card>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#2D6A4F] flex items-center justify-center"><ShieldCheck className="w-5 h-5" /></div>
          <div><h3 className="font-semibold text-[#212529]">Alterar senha</h3><p className="text-xs text-slate-500">As outras sessões serão encerradas ao salvar.</p></div>
        </div>
        {passwordMessage && <div role="status" className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex gap-2"><CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />{passwordMessage}</div>}
        {passwordError && <div role="alert" className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex gap-2"><AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />{passwordError}</div>}
        <form onSubmit={updatePassword} className="space-y-4">
          <Input label="Senha atual" type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required autoComplete="current-password" />
          <Input label="Nova senha" type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required minLength={12} autoComplete="new-password" helperText="Use pelo menos 12 caracteres." />
          <Input label="Confirmar nova senha" type="password" value={passwordConfirmation} onChange={(event) => setPasswordConfirmation(event.target.value)} required minLength={12} autoComplete="new-password" />
          <Button type="submit" variant="secondary" isLoading={passwordLoading}>Atualizar senha</Button>
        </form>
      </Card>

      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="font-semibold text-[#212529]">Privacidade e cookies (LGPD)</h3>
            <p className="text-xs text-slate-500 mt-1">
              Revise ou revogue o consentimento de métricas opcionais de uso a qualquer momento.
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={openCookiePreferences}>
            Gerenciar cookies
          </Button>
        </div>
      </Card>
    </div>
  );
};
