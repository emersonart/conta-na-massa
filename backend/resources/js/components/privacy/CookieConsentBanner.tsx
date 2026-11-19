import React, { useEffect, useState } from 'react';
import { ShieldCheck, SlidersHorizontal, X } from 'lucide-react';
import {
  CONSENT_OPEN_PREFERENCES_EVENT,
  readCookieConsent,
  saveCookieConsent,
} from '../../analytics/consent';
import { trackEvent } from '../../analytics/umami';
import { Button } from '../ui/Button';

export const CookieConsentBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const [hasExistingChoice, setHasExistingChoice] = useState(false);

  useEffect(() => {
    const existing = readCookieConsent();
    if (!existing) {
      setIsVisible(true);
      setHasExistingChoice(false);
      setAnalyticsEnabled(false);
    } else {
      setHasExistingChoice(true);
      setAnalyticsEnabled(existing.analytics);
    }

    const handleOpenPreferences = () => {
      const current = readCookieConsent();
      setHasExistingChoice(Boolean(current));
      setAnalyticsEnabled(current?.analytics ?? false);
      setShowPreferences(true);
      setIsVisible(true);
    };

    window.addEventListener(CONSENT_OPEN_PREFERENCES_EVENT, handleOpenPreferences);
    return () => {
      window.removeEventListener(CONSENT_OPEN_PREFERENCES_EVENT, handleOpenPreferences);
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  const applyChoice = (analytics: boolean) => {
    saveCookieConsent(analytics);
    setHasExistingChoice(true);
    setAnalyticsEnabled(analytics);
    setShowPreferences(false);
    setIsVisible(false);
    if (analytics) {
      trackEvent('consent_analytics_accepted');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-consent-title"
      className="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-5 pointer-events-none"
    >
      <div className="pointer-events-auto mx-auto max-w-3xl rounded-2xl bg-white border border-[#E5DDD0] shadow-soft-lg overflow-hidden">
        <div className="h-1 bg-[#E85D04]" />
        <div className="p-4 sm:p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FDFBF7] border border-[#E5DDD0] text-[#2D6A4F]">
                <ShieldCheck className="h-4.5 w-4.5" />
              </div>
              <div>
                <h2
                  id="cookie-consent-title"
                  className="font-heading text-base font-bold text-[#212529]"
                >
                  Privacidade e cookies (LGPD)
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-[#495057] leading-relaxed">
                  Usamos cookies essenciais para manter sua sessão segura e, com a sua permissão,
                  métricas opcionais do Umami para entender o uso das telas e melhorar o Conta na
                  Massa. Nenhum dado pessoal é vendido ou compartilhado.
                </p>
              </div>
            </div>

            {hasExistingChoice && (
              <button
                type="button"
                onClick={() => {
                  setShowPreferences(false);
                  setIsVisible(false);
                }}
                aria-label="Fechar preferências de cookies"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {showPreferences && (
            <div className="space-y-2.5 rounded-xl bg-[#FDFBF7] border border-[#E5DDD0] p-3.5">
              <div className="flex items-start justify-between gap-4 pb-2.5 border-b border-[#F0EAE1]">
                <div>
                  <p className="text-sm font-semibold text-[#212529]">Cookies essenciais</p>
                  <p className="text-xs text-[#495057] mt-0.5">
                    Necessários para autenticação, segurança da conta e funcionamento básico do
                    sistema.
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-[#D8F3DC] px-2.5 py-1 text-[11px] font-semibold text-[#1B4332]">
                  Sempre ativos
                </span>
              </div>

              <div className="flex items-start justify-between gap-4 pt-1">
                <div>
                  <label
                    htmlFor="cookie-analytics-toggle"
                    className="text-sm font-semibold text-[#212529] cursor-pointer"
                  >
                    Cookies opcionais de análise (Umami)
                  </label>
                  <p className="text-xs text-[#495057] mt-0.5">
                    Mede visitas e eventos de uso de forma agregada, sem rastreamento publicitário.
                    Você pode alterar ou revogar a qualquer momento.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                  <input
                    id="cookie-analytics-toggle"
                    type="checkbox"
                    checked={analyticsEnabled}
                    onChange={(event) => setAnalyticsEnabled(event.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-6 bg-[#E5DDD0] rounded-full peer peer-focus-visible:outline-2 peer-focus-visible:outline-[#E85D04] peer-checked:bg-[#2D6A4F] transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-transform peer-checked:translate-x-4" />
                </label>
              </div>
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2">
            {!showPreferences ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowPreferences(true)}
                leftIcon={<SlidersHorizontal className="h-3.5 w-3.5" />}
              >
                Preferências
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => applyChoice(analyticsEnabled)}
              >
                Salvar preferências
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => applyChoice(false)}
            >
              Apenas essenciais
            </Button>

            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => applyChoice(true)}
            >
              Aceitar todos
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
