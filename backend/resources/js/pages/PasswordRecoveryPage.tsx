import React, { useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { apiClient } from '../api/client';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Logo } from '../components/ui/Logo';
import { useAuthStore } from '../stores/authStore';

export const PasswordRecoveryPage: React.FC = () => {
  const isReset = useLocation().pathname === '/reset-password';
  const [params] = useSearchParams();
  const [email, setEmail] = useState(params.get('email') || '');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const token = params.get('token') || '';

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');
    setError('');
    setIsLoading(true);

    try {
      if (isReset) {
        if (!token) throw new Error('Link inválido. Solicite uma nova redefinição.');
        const response = await apiClient.post('/auth/reset-password', {
          token,
          email,
          password,
          password_confirmation: passwordConfirmation,
        });
        useAuthStore.getState().clearSession();
        window.history.replaceState({}, document.title, '/reset-password');
        setMessage(response.data.message);
      } else {
        const response = await apiClient.post('/auth/forgot-password', { email });
        setMessage(response.data.message);
      }
    } catch (requestError: any) {
      const errors = requestError.response?.data?.errors as Record<string, string[]> | undefined;
      const firstError = errors ? Object.values(errors).flat()[0] : undefined;
      setError(requestError.message && !requestError.response
        ? requestError.message
        : firstError || requestError.response?.data?.message || 'Não foi possível concluir. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6F0] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <div className="flex justify-center"><Logo size="lg" showText={false} /></div>
        <h1 className="text-2xl font-extrabold font-heading text-[#212529]">{isReset ? 'Criar nova senha' : 'Recuperar senha'}</h1>
      </div>

      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="shadow-soft border border-[#E5DDD0]">
          <p className="mb-5 text-sm text-slate-600">
            {isReset
              ? 'Escolha uma senha nova com pelo menos 12 caracteres.'
              : 'Informe seu e-mail. Se houver uma conta, enviaremos um link seguro para redefinir sua senha.'}
          </p>

          {message && (
            <div role="status" className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> <span>{message}</span>
            </div>
          )}
          {error && (
            <div role="alert" className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> <span>{error}</span>
            </div>
          )}
          {isReset && !token && (
            <div role="alert" className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
              Link inválido. Solicite uma nova redefinição de senha.
            </div>
          )}

          {!message && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="Endereço de e-mail" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" />
              {isReset && <>
                <Input label="Nova senha" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={12} autoComplete="new-password" helperText="Use pelo menos 12 caracteres." />
                <Input label="Confirmar nova senha" type="password" value={passwordConfirmation} onChange={(event) => setPasswordConfirmation(event.target.value)} required minLength={12} autoComplete="new-password" />
              </>}
              <Button type="submit" size="lg" className="w-full" isLoading={isLoading} disabled={isReset && !token}>
                {isReset ? 'Redefinir senha' : 'Enviar link de redefinição'}
              </Button>
            </form>
          )}

          <div className="mt-5 text-center">
            <Link to="/login" className="text-sm font-medium text-[#2D6A4F] hover:text-[#1B4332] underline underline-offset-2">Voltar para entrar</Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
