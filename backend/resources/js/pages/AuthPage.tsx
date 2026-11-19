import React, { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Logo } from '../components/ui/Logo';
import { AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
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
    <div className="min-h-screen bg-[#F8F6F0] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-4">
        <div className="flex justify-center">
          <Logo size="lg" showText={false} />
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#212529] tracking-tight">
            Conta na Massa
          </h1>
          <p className="text-sm text-[#495057] max-w-sm mx-auto mt-1">
            Gestão de custos reais e precificação para sua confeitaria ou padaria.
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="bg-white border border-[#E5DDD0] shadow-soft rounded-2xl" variant="elevated">
          {/* Toggle Tabs */}
          <div className="flex bg-[#F0EAE1]/80 p-1 rounded-xl mb-6 border border-[#E5DDD0]/70">
            <button
              type="button"
              onClick={() => {
                setIsRegister(false);
                clearError();
              }}
              className={`flex-1 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                !isRegister
                  ? 'bg-white text-[#212529] shadow-warm'
                  : 'text-[#495057] hover:text-[#212529]'
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegister(true);
                clearError();
              }}
              className={`flex-1 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                isRegister
                  ? 'bg-white text-[#212529] shadow-warm'
                  : 'text-[#495057] hover:text-[#212529]'
              }`}
            >
              Criar Conta
            </button>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
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
              placeholder="Mínimo 12 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={isRegister ? 12 : undefined}
              helperText={isRegister ? 'Use pelo menos 12 caracteres.' : undefined}
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
                minLength={12}
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
                {isRegister ? 'Criar Conta' : 'Entrar'}
              </Button>
            </div>
          </form>

          {!isRegister && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-sm font-medium text-[#2D6A4F] hover:text-[#1B4332] underline underline-offset-2 cursor-pointer"
              >
                Esqueci minha senha
              </button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
