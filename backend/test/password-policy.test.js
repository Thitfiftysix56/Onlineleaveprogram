import assert from 'node:assert/strict'
import test from 'node:test'

import { validateNewPassword } from '../src/auth/password-policy.js'

test('accepts a password that satisfies every rule', () => {
  assert.equal(validateNewPassword('Secure123!'), null)
})

test('rejects passwords that miss a required character class', () => {
  assert.match(validateNewPassword('Short1!'), /at least 8/)
  assert.match(validateNewPassword('UPPERCASE1!'), /lowercase/)
  assert.match(validateNewPassword('lowercase1!'), /uppercase/)
  assert.match(validateNewPassword('NoNumbers!'), /number/)
  assert.match(validateNewPassword('NoSpecial123'), /special/)
})

