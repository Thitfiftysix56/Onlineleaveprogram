const personNamePattern = /^[A-Za-z\u0E01-\u0E2E\u0E30-\u0E3A\u0E40-\u0E4E ]+$/u

export function isPersonName(value) {
  const normalizedValue = String(value ?? '').trim()
  return normalizedValue.length > 0
    && normalizedValue.length <= 100
    && personNamePattern.test(normalizedValue)
}
