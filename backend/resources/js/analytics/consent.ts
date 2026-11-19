export const CONSENT_STORAGE_KEY = 'conta_na_massa_cookie_consent_v1';
export const CONSENT_CHANGED_EVENT = 'conta-na-massa:consent-changed';
export const CONSENT_OPEN_PREFERENCES_EVENT = 'conta-na-massa:consent-open-preferences';

export interface CookieConsentState {
  version: 1;
  essential: true;
  analytics: boolean;
  updatedAt: string;
}

export function readCookieConsent(): CookieConsentState | null {
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CookieConsentState>;
    if (parsed.version !== 1 || typeof parsed.analytics !== 'boolean') {
      return null;
    }
    return {
      version: 1,
      essential: true,
      analytics: parsed.analytics,
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function saveCookieConsent(analytics: boolean): CookieConsentState {
  const next: CookieConsentState = {
    version: 1,
    essential: true,
    analytics,
    updatedAt: new Date().toISOString(),
  };

  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage quota/private-mode errors and still emit runtime state.
  }

  window.dispatchEvent(new CustomEvent<CookieConsentState>(CONSENT_CHANGED_EVENT, { detail: next }));
  return next;
}

export function isAnalyticsConsentGranted(): boolean {
  return readCookieConsent()?.analytics === true;
}

export function openCookiePreferences(): void {
  window.dispatchEvent(new CustomEvent(CONSENT_OPEN_PREFERENCES_EVENT));
}
