export const CONSENT_STORAGE_KEY = 'conta_na_massa_cookie_consent_v1';
export const CONSENT_CHANGED_EVENT = 'conta-na-massa:consent-changed';
export const CONSENT_OPEN_PREFERENCES_EVENT = 'conta-na-massa:consent-open-preferences';

export interface CookieConsentState {
  version: 1;
  essential: true;
  analytics: boolean;
  updatedAt: string;
}

let inMemoryConsent: CookieConsentState | null = null;

export function readCookieConsent(): CookieConsentState | null {
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return inMemoryConsent;
    const parsed = JSON.parse(raw) as Partial<CookieConsentState>;
    if (parsed.version !== 1 || typeof parsed.analytics !== 'boolean') {
      return inMemoryConsent;
    }
    const state: CookieConsentState = {
      version: 1,
      essential: true,
      analytics: parsed.analytics,
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : new Date().toISOString(),
    };
    inMemoryConsent = state;
    return state;
  } catch {
    return inMemoryConsent;
  }
}

export function saveCookieConsent(analytics: boolean): CookieConsentState {
  const next: CookieConsentState = {
    version: 1,
    essential: true,
    analytics,
    updatedAt: new Date().toISOString(),
  };

  inMemoryConsent = next;

  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage quota/private-mode errors and rely on in-memory fallback for this session.
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
