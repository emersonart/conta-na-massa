import React, { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { apiClient } from '../api/client';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Logo } from '../components/ui/Logo';
import { useAuthStore } from '../stores/authStore';

type TokenStatus = 'checking' | 'valid' | 'invalid';

export const ConfirmEmailChangePage: React.FC = () => {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tokenStatus, setTokenStatus] = useState<TokenStatus>('checking');
  const confirmedRef = useRef(false);

  useEffect(() => {
    if (confirmedRef.current) {
      return;
    }

    if (!token) {
      setTokenStatus('invalid');
      setError('Este link é inválido, expirou ou já foi usado. Solicite a alteração novamente.');
      window.history.replaceState({}, document.title, '/confirm-email-change');
      return;
    }

    let cancelled = false;
    setTokenStatus('checking');
    setError('');

    apiClient
      .post('/auth/email-change/validate', { token })
      .then(() => {
        if (!cancelled) {
          setTokenStatus('valid');
        }
      })
      .catch((requestError: any) => {
        if (!cancelled) {
          setTokenStatus('invalid');
          setError(
            requestError.response?.data?.message ||
              'Este link é inválido, expirou ou já foi usado. Solicite a alteração novamente.'
          );
          window.history.replaceState({}, document.title, '/confirm-email-change');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const confirm = async () => {
    setError('');
    setIsLoading(true);
    try {
      const response = await apiClient.post('/auth/email-change/confirm', { token });
      confirmedRef.current = true;
      setMessage(response.data.message);
      useAuthStore.getState().clearSession();
      window.history.replaceState({}, document.title, '/confirm-email-change');
    } catch (requestError: any) {
      setError(requestError.response?.data?.message || 'Não foi possível confirmar este endereço.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6F0] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <div className="flex justify-center">
          <Logo size="lg" showText={false} />
        </div>
        <h1 className="text-2xl font-extrabold font-heading text-[#212529]">Confirmar novo e-mail</h1>
      </div>
      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="shadow-soft border border-[#E5DDD0]">
          {tokenStatus === 'valid' && !message && (
            <p className="mb-5 text-sm text-slate-600">
              Confirme que você tem acesso ao novo endereço. O link expira em 60 minutos e só pode ser usado uma vez.
            </p>
          )}

          {tokenStatus === 'checking' && !message && (
            <div role="status" className="py-6 flex flex-col items-center justify-center gap-3 text-slate-600 text-sm">
              <Loader2 className="w-5 h-5 animate-spin text-[#E85D04]" />
              <span>Validando link de confirmação...</span>
            </div>
          )}

          {message && (
            <div role="status" className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              {message}
            </div>
          )}

          {error && (
            <div role="alert" className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          {!message && tokenStatus === 'valid' && (
            <Button type="button" size="lg" className="w-full" onClick={confirm} isLoading={isLoading}>
              Confirmar e-mail
            </Button>
          )}

          <div className="mt-5 text-center">
            <Link to="/login" className="text-sm font-medium text-[#2D6A4F] hover:text-[#1B4332] underline underline-offset-2">
              Ir para entrar
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
