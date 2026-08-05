export const passwordChecks = [
  ['At least 10 characters', (value) => value.length >= 10],
  ['At least one uppercase letter', (value) => /[A-Z]/.test(value)],
  ['At least one lowercase letter', (value) => /[a-z]/.test(value)],
  ['At least one number', (value) => /[0-9]/.test(value)],
  ['At least one special character', (value) => /[^A-Za-z0-9]/.test(value)],
  ['No spaces', (value) => !/\s/.test(value)],
];

export function passwordMeetsPolicy(value, identity = {}) {
  const normalizedValue = value.toLowerCase();
  const username = String(identity.username || '').trim().toLowerCase();
  const email = String(identity.email || '').trim().toLowerCase();

  return passwordChecks.every(([, check]) => check(value)) &&
    (!username || normalizedValue !== username) &&
    (!email || normalizedValue !== email);
}
