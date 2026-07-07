import { track } from '@vercel/analytics';

const BLOCKED_PROPERTY_PATTERNS = [
  /address/i,
  /email/i,
  /name/i,
  /phone/i,
  /postal/i,
  /coordinate/i,
  /center/i,
  /preview/i,
  /image/i,
  /user/i,
  /design/i,
  /matId/i,
];

const isAllowedValue = (value) => (
  value == null
  || typeof value === 'string'
  || typeof value === 'number'
  || typeof value === 'boolean'
);

const sanitizeProperties = (properties = {}) => Object.fromEntries(
  Object.entries(properties).filter(([key, value]) => (
    isAllowedValue(value)
    && !BLOCKED_PROPERTY_PATTERNS.some((pattern) => pattern.test(key))
  ))
);

export const trackEvent = (name, properties = {}) => {
  try {
    track(name, sanitizeProperties(properties));
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('Analytics event failed:', name, error);
    }
  }
};
