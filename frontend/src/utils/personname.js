const invalidPersonNameCharacterPattern = /[^A-Za-z\u0E01-\u0E2E\u0E30-\u0E3A\u0E40-\u0E4E ]/gu;
const personNamePattern = /^[A-Za-z\u0E01-\u0E2E\u0E30-\u0E3A\u0E40-\u0E4E ]+$/u;

export const sanitizePersonName = (value) =>
  String(value ?? '').replace(invalidPersonNameCharacterPattern, '');

export const isPersonName = (value) => {
  const normalizedValue = String(value ?? '').trim();
  return normalizedValue.length > 0
    && normalizedValue.length <= 100
    && personNamePattern.test(normalizedValue);
};

export const isFullPersonName = (value) => {
  const nameParts = String(value ?? '').trim().split(/\s+/);
  return nameParts.length >= 2 && nameParts.every(isPersonName);
};
