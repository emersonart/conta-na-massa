import React, { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Sparkles, ShieldCheck } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');

  const { login, register, isLoading, error, clearError } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (isRegister) {
      await register(name, email, password, passwordConfirmation);
    } else {
      await login(email, password);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDFBF7] via-[#F8F6F0] to-[#F0EAE1] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        {/* Brand Icon */}
        <div className="inline-flex w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#E85D04] to-[#F4A261] items-center justify-center text-3xl shadow-xl shadow-orange-500/25 animate-bounce-slow">
          🥐
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-[#212529] tracking-tight">
          Conta na Massa
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-sm mx-auto">
          O controle real de custos e precificação justa para sua confeitaria e panificação.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="shadow-soft-lg border border-[#E5DDD0]">
          {/* Toggle Tabs */}
          <div className="flex bg-[#F0EAE1]/80 p-1 rounded-xl mb-6 border border-[#E5DDD0]/60">
            <button
              type="button"
              onClick={() => {
                setIsRegister(false);
                clearError();
              }}
              className={`flex-1 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                !isRegister
                  ? 'bg-white text-[#212529] shadow-sm'
                  : 'text-slate-600 hover:text-[#212529]'
              }`}
            >
              Entrar na Conta
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegister(true);
                clearError();
              }}
              className={`flex-1 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                isRegister
                  ? 'bg-white text-[#212529] shadow-sm'
                  : 'text-slate-600 hover:text-[#212529]'
              }`}
            >
              Criar Conta Grátis
            </button>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-medium flex items-center gap-2">
              <span className="shrink-0">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <Input
                label="Seu Nome Completo"
                type="text"
                placeholder="Ex: Chef Juliana Santos"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            )}

            <Input
              label="Endereço de E-mail"
              type="email"
              placeholder="exemplo@confeitaria.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

            <Input
              label="Sua Senha"
              type="password"
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={isRegister ? 'new-password' : 'current-password'}
            />

            {isRegister && (
              <Input
                label="Confirmar Senha"
                type="password"
                placeholder="Repita a mesma senha"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                required
                autoComplete="new-password"
              />
            )}

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={isLoading}
              >
                {isRegister ? 'Criar Minha Conta no Conta na Massa' : 'Entrar no Sistema'}
              </Button>
            </div>
          </form>

          {/* Open Source / Security Guarantee */}
          <div className="mt-6 pt-5 border-t border-[#E5DDD0]/70 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-[#2D6A4F]" /> Isolamento Total de Dados
            </span>
            <span className="flex items-center gap-1 font-semibold text-[#E85D04]">
              <Sparkles className="w-3.5 h-3.5" /> Modo Vibe IA Incluso
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
};
