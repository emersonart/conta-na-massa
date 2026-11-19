import { CONSENT_CHANGED_EVENT, isAnalyticsConsentGranted } from './consent';

const UMAMI_SCRIPT_ELEMENT_ID = 'conta-na-massa-umami-script';
const MAX_QUEUED_EVENTS = 25;

export type UmamiEventValue = string | number | boolean;
export type UmamiEventData = Record<string, UmamiEventValue>;

interface UmamiClient {
  track: (eventName?: string, eventData?: UmamiEventData) => void;
  identify?: (uniqueId: string | Record<string, UmamiEventValue>, data?: UmamiEventData) => void;
}

interface UmamiRuntimeConfig {
  scriptUrl: string;
  websiteId: string;
  hostUrl: string;
  domains: string;
}

interface QueuedEvent {
  name: string;
  data?: UmamiEventData;
}

declare global {
  interface Window {
    umami?: UmamiClient;
  }
}

let isInitialized = false;
let pendingEvents: QueuedEvent[] = [];
let pendingUserId: string | null = null;

function readUmamiConfig(): UmamiRuntimeConfig {
  const root = document.getElementById('root');
  return {
    scriptUrl: root?.dataset.umamiScriptUrl?.trim() || '',
    websiteId: root?.dataset.umamiWebsiteId?.trim() || '',
    hostUrl: root?.dataset.umamiHostUrl?.trim() || '',
    domains: root?.dataset.umamiDomains?.trim() || '',
  };
}

function isValidScriptUrl(url: string): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url, window.location.origin);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

function sanitizeEventData(data?: Record<string, unknown>): UmamiEventData | undefined {
  if (!data) return undefined;
  const clean: UmamiEventData = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null) continue;
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      clean[key] = value;
    }
  }
  return Object.keys(clean).length > 0 ? clean : undefined;
}

function flushQueue(): void {
  if (!isAnalyticsConsentGranted() || !window.umami) {
    return;
  }

  if (pendingUserId && typeof window.umami.identify === 'function') {
    window.umami.identify(pendingUserId);
  }

  const eventsToSend = pendingEvents;
  pendingEvents = [];
  for (const event of eventsToSend) {
    if (event.data) {
      window.umami.track(event.name, event.data);
    } else {
      window.umami.track(event.name);
    }
  }
}

function setUmamiDisabledFlag(disabled: boolean): void {
  try {
    if (disabled) {
      window.localStorage.setItem('umami.disabled', '1');
    } else {
      window.localStorage.removeItem('umami.disabled');
    }
  } catch {
    // Ignore storage errors in restricted browsing modes.
  }
}

function removeUmamiScript(): void {
  setUmamiDisabledFlag(true);
  const existing = document.getElementById(UMAMI_SCRIPT_ELEMENT_ID);
  if (existing) {
    existing.remove();
  }
  pendingEvents = [];
}

export function syncUmamiWithConsent(): void {
  if (!isAnalyticsConsentGranted()) {
    removeUmamiScript();
    return;
  }

  setUmamiDisabledFlag(false);

  const config = readUmamiConfig();
  if (!config.websiteId || !isValidScriptUrl(config.scriptUrl)) {
    return;
  }

  if (document.getElementById(UMAMI_SCRIPT_ELEMENT_ID)) {
    flushQueue();
    return;
  }

  const script = document.createElement('script');
  script.id = UMAMI_SCRIPT_ELEMENT_ID;
  script.defer = true;
  script.src = config.scriptUrl;
  script.setAttribute('data-website-id', config.websiteId);
  if (config.hostUrl) {
    script.setAttribute('data-host-url', config.hostUrl);
  }
  if (config.domains) {
    script.setAttribute('data-domains', config.domains);
  }
  script.onload = () => {
    flushQueue();
  };

  document.head.appendChild(script);
}

export function initAnalytics(): void {
  if (isInitialized) return;
  isInitialized = true;

  syncUmamiWithConsent();
  window.addEventListener(CONSENT_CHANGED_EVENT, () => {
    syncUmamiWithConsent();
  });
}

/**
 * Identify the current user in Umami v3 using ONLY an opaque account UUID
 * (never e-mail, name, or secrets) and only when LGPD analytics consent is granted.
 */
export function identifyAnalyticsUser(opaqueUserId?: string | null): void {
  pendingUserId = opaqueUserId ? String(opaqueUserId) : null;

  if (!pendingUserId || !isAnalyticsConsentGranted()) {
    return;
  }

  if (window.umami && typeof window.umami.identify === 'function') {
    window.umami.identify(pendingUserId);
  }
}

/**
 * Track a custom Umami v3 event with optional non-PII properties.
 * Drops silently when LGPD analytics consent has not been granted.
 */
export function trackEvent(name: string, data?: Record<string, unknown>): void {
  if (!name || !isAnalyticsConsentGranted()) {
    return;
  }

  const sanitized = sanitizeEventData(data);
  if (window.umami && typeof window.umami.track === 'function') {
    if (sanitized) {
      window.umami.track(name, sanitized);
    } else {
      window.umami.track(name);
    }
    return;
  }

  if (pendingEvents.length < MAX_QUEUED_EVENTS) {
    pendingEvents.push({ name, data: sanitized });
  }
}
