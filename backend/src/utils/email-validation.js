const emailAtom = "[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+"
const emailPattern = new RegExp(
  `^${emailAtom}(?:\\.${emailAtom})*@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\\.[A-Za-z]{2,63})+$`,
)

export function isValidEmail(value) {
  const normalizedEmail = String(value ?? '').trim()
  return normalizedEmail.length > 0
    && normalizedEmail.length <= 100
    && emailPattern.test(normalizedEmail)
}
