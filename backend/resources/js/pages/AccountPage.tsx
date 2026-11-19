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
    <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8 animate-fadeIn">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold font-heading text-[#212529] tracking-tight">
          Minha conta
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-[#495057]">
          Gerencie seus dados cadastrais, e-mail de acesso e credenciais de segurança.
        </p>
      </div>

      <Card className="bg-white border border-[#E5DDD0] shadow-warm space-y-6" variant="elevated">
        <div className="flex items-center gap-3 border-b border-[#E5DDD0]/70 pb-4">
          <div className="w-10 h-10 rounded-xl bg-[#FFF4ED] text-[#E85D04] flex items-center justify-center shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-[#212529] font-heading text-base">Dados cadastrais</h3>
            <p className="text-xs text-[#495057]">Informe sua senha atual para autorizar as alterações de cadastro.</p>
          </div>
        </div>

        {profileMessage && (
          <div role="status" className="p-3.5 rounded-xl bg-[#D8F3DC]/80 border border-[#74C69D]/40 text-[#1B4332] text-xs sm:text-sm font-medium flex gap-2 items-center animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#2D6A4F]" />
            <span>{profileMessage}</span>
          </div>
        )}

        {profileError && (
          <div role="alert" className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-medium flex gap-2 items-center">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{profileError}</span>
          </div>
        )}

        {user?.pending_email && (
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-3.5 text-xs sm:text-sm text-amber-900 leading-relaxed">
            Aguardando confirmação de <strong>{user.pending_email}</strong>. Seu e-mail atual permanece ativo. Para reenviar o link, salve novamente o mesmo endereço com sua senha atual.
          </div>
        )}

        <form onSubmit={updateProfile} className="space-y-4">
          <Input label="Nome Completo" value={name} onChange={(event) => setName(event.target.value)} required maxLength={255} autoComplete="name" />
          <Input label="Endereço de E-mail" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" helperText={user?.pending_email ? `E-mail atual: ${user.email}` : 'Para trocar o e-mail, confirme o link enviado ao novo endereço.'} />
          <Input label="Sua Senha Atual" type="password" value={profilePassword} onChange={(event) => setProfilePassword(event.target.value)} required autoComplete="current-password" helperText="Necessária para confirmar alterações de perfil." />
          <div className="pt-2">
            <Button type="submit" variant="primary" isLoading={profileLoading}>
              Salvar dados cadastrais
            </Button>
          </div>
        </form>
      </Card>

      <Card className="bg-white border border-[#E5DDD0] shadow-warm space-y-6" variant="elevated">
        <div className="flex items-center gap-3 border-b border-[#E5DDD0]/70 pb-4">
          <div className="w-10 h-10 rounded-xl bg-[#D8F3DC]/80 text-[#1B4332] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-[#2D6A4F]" />
          </div>
          <div>
            <h3 className="font-bold text-[#212529] font-heading text-base">Segurança & Senha</h3>
            <p className="text-xs text-[#495057]">As outras sessões serão encerradas automaticamente ao salvar uma nova senha.</p>
          </div>
        </div>

        {passwordMessage && (
          <div role="status" className="p-3.5 rounded-xl bg-[#D8F3DC]/80 border border-[#74C69D]/40 text-[#1B4332] text-xs sm:text-sm font-medium flex gap-2 items-center animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#2D6A4F]" />
            <span>{passwordMessage}</span>
          </div>
        )}

        {passwordError && (
          <div role="alert" className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-medium flex gap-2 items-center">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{passwordError}</span>
          </div>
        )}

        <form onSubmit={updatePassword} className="space-y-4">
          <Input label="Senha Atual" type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required autoComplete="current-password" />
          <Input label="Nova Senha" type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required minLength={12} autoComplete="new-password" helperText="Use pelo menos 12 caracteres com boa complexidade." />
          <Input label="Confirmar Nova Senha" type="password" value={passwordConfirmation} onChange={(event) => setPasswordConfirmation(event.target.value)} required minLength={12} autoComplete="new-password" />
          <div className="pt-2">
            <Button type="submit" variant="secondary" isLoading={passwordLoading}>
              Atualizar senha de acesso
            </Button>
          </div>
        </form>
      </Card>

      <Card className="bg-white border border-[#E5DDD0] shadow-warm" variant="elevated">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="font-bold text-[#212529] font-heading text-base">Privacidade e cookies (LGPD)</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Revise ou revogue o consentimento de métricas opcionais de uso a qualquer momento conforme a Lei 13.709/2018.
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={openCookiePreferences} className="shrink-0 self-start sm:self-auto">
            Gerenciar cookies
          </Button>
        </div>
      </Card>
    </div>
  );
};
