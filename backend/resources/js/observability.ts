import type { Event } from '@sentry/react';

type SentryModule = typeof import('@sentry/react');

const root = document.getElementById('root');
const dsn = root?.dataset.sentryDsn?.trim();
let sentry: SentryModule | null = null;

function safeUrl(value: string): string {
  try {
    const url = new URL(value, window.location.origin);
    // Query strings may contain reset/verification tokens or user input.
    url.search = '';
    url.hash = '';
    url.pathname = url.pathname.replace(/\/(reset-password|confirm-email-change)\/[^/]+/gi, '/$1/[redacted]');
    return `${url.origin}${url.pathname}`;
  } catch {
    return '[redacted-url]';
  }
}

function scrubSpanName(value: string): string {
  const withoutQueryOrHash = value.split(/[?#]/, 1)[0];
  return withoutQueryOrHash.replace(/\/(reset-password|confirm-email-change)\/[^/]+/gi, '/$1/[redacted]');
}

function scrubEvent<T extends Event>(event: T): T {
  if (event.transaction) {
    event.transaction = event.transaction.replace(/\/(reset-password|confirm-email-change)\/[^/?]+/gi, '/$1/[redacted]');
  }
  if (event.request) {
    if (event.request.url) event.request.url = safeUrl(event.request.url);
    delete event.request.query_string;
    delete event.request.data;
    if (event.request.headers) {
      const headers = { ...event.request.headers };
      for (const key of Object.keys(headers)) {
        if (/authorization|cookie|token|password/i.test(key)) delete headers[key];
      }
      event.request.headers = headers;
    }
  }
  return event;
}

export function initializeTelemetry(): Promise<SentryModule | null> {
  // Do not load the browser SDK at all when no DSN is configured.
  if (!dsn) return Promise.resolve(null);

  const tracesSampleRate = Number(root?.dataset.sentryTracesSampleRate?.trim() || '0.01');

  return import('@sentry/react').then((sdk) => {
    sentry = sdk;
    sdk.init({
      dsn,
      environment: root?.dataset.sentryEnvironment || undefined,
      release: root?.dataset.sentryRelease || undefined,
      tracesSampleRate: Number.isFinite(tracesSampleRate) ? tracesSampleRate : 0.01,
      tracePropagationTargets: [`${window.location.origin}/api/v1/`],
      integrations: [sdk.browserTracingIntegration()],
      beforeSend: scrubEvent,
      beforeSendSpan: (span) => {
        if (span.is_segment) span.name = scrubSpanName(span.name);

        for (const [key, value] of Object.entries(span.attributes)) {
          if (/authorization|cookie|token|password|request\.body|response\.body/i.test(key)) {
            delete span.attributes[key];
          } else if (typeof value === 'string' && /(^|[._])url($|[._])/i.test(key)) {
            span.attributes[key] = safeUrl(value);
          }
        }

        return span;
      },
    });
    return sdk;
  });
}

export function setTelemetryUser(id: number | string | null | undefined): void {
  if (sentry) sentry.setUser(id == null ? null : { id: String(id) });
}

export function addApiBreadcrumb(method: string, url: string, status?: number): void {
  if (!sentry) return;
  sentry.addBreadcrumb({
    category: 'api',
    type: 'http',
    level: status && status >= 500 ? 'error' : status && status >= 400 ? 'warning' : 'info',
    message: `${method.toUpperCase()} ${safeUrl(url)}${status ? ` → ${status}` : ''}`,
  });
}

export function captureApiFailure(method: string, url: string, status?: number): void {
  if (!sentry) return;
  sentry.withScope((scope) => {
    scope.setContext('api', { method: method.toUpperCase(), status: status ?? 'network_error', url: safeUrl(url) });
    scope.setLevel('error');
    // Do not send AxiosError itself: it can retain request headers and payloads.
    sentry?.captureException(new Error('API request failed'));
  });
}

export const telemetryLog = {
  info(message: string, attributes: Record<string, unknown> = {}) {
    if (sentry) sentry.logger.info(message, attributes);
  },
  warn(message: string, attributes: Record<string, unknown> = {}) {
    if (sentry) sentry.logger.warn(message, attributes);
  },
  error(message: string, attributes: Record<string, unknown> = {}) {
    if (sentry) sentry.logger.error(message, attributes);
  },
};
