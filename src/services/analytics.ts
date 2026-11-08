// Security & Privacy compliance (mandatory-secure-web-skills):
// - Strict Opt-In Consent: Google Analytics 4 (G-8G4WWQX7N4) is NEVER loaded until the user
//   explicitly clicks "Allow Analytics" in the consent banner.
// - Child-Directed & Privacy Hardened: Configures anonymize_ip: true, allow_google_signals: false,
//   allow_ad_personalization_signals: false, and restricted_data_processing: true.
// - Non-Sensitive Storage Only: localStorage stores only the 'granted' | 'denied' consent preference
//   (no auth tokens, session IDs, or PII).

export type ConsentState = 'granted' | 'denied' | 'unset';

const GA_MEASUREMENT_ID = 'G-8G4WWQX7N4';
const CONSENT_STORAGE_KEY = 'tf-analytics-consent';
const SAFE_EVENT_REGEX = /^[a-z0-9_]{2,40}$/;
const SAFE_VALUE_REGEX = /^[a-zA-Z0-9_\-\s]{1,64}$/;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    __tfGaLoaded?: boolean;
  }
}

export function readConsentState(): ConsentState {
  if (typeof window === 'undefined') return 'unset';
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (raw === 'granted' || raw === 'denied') return raw;
  } catch {
    // Fail closed if storage is unavailable
  }
  return 'unset';
}

export function saveConsentState(decision: 'granted' | 'denied'): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, decision);
  } catch {
    // Ignore storage quota / privacy mode errors
  }
  if (decision === 'granted') {
    loadGa4IfConsented();
  }
}

export function loadGa4IfConsented(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  if (readConsentState() !== 'granted') return;
  if (window.__tfGaLoaded) return;

  window.__tfGaLoaded = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer!.push(args);
  };

  window.gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'granted',
  });
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    anonymize_ip: true,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    restricted_data_processing: true,
  });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);
}

export function trackAtlasEvent(
  eventName: string,
  params: Record<string, string> = {}
): void {
  if (typeof window === 'undefined') return;
  if (readConsentState() !== 'granted' || typeof window.gtag !== 'function') {
    return;
  }
  if (!SAFE_EVENT_REGEX.test(eventName)) return;

  const cleanParams: Record<string, string> = {};
  for (const [k, v] of Object.entries(params)) {
    if (SAFE_EVENT_REGEX.test(k) && SAFE_VALUE_REGEX.test(v)) {
      cleanParams[k] = v;
    }
  }
  window.gtag('event', eventName, cleanParams);
}
