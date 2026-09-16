const emailAtom = "[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+";
const emailPattern = new RegExp(
  `^${emailAtom}(?:\\.${emailAtom})*@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\\.[A-Za-z]{2,63})+$`,
);

export const isValidEmail = (value) => {
  const normalizedEmail = String(value ?? '').trim();
  return normalizedEmail.length > 0
    && normalizedEmail.length <= 100
    && emailPattern.test(normalizedEmail);
};

export const sanitizeEmailInput = (value) =>
  String(value ?? '').replace(/[^A-Za-z0-9.!#$%&'*+/=?^_`{|}~@-]/g, '');

export const getEmailInputError = (value) => {
  const text = String(value ?? '');
  if (/[฀-๿]/u.test(text)) return 'อีเมลต้องใช้ตัวอักษรภาษาอังกฤษเท่านั้น ไม่สามารถใช้ภาษาไทยได้';
  if (/\s/u.test(text)) return 'อีเมลต้องไม่มีช่องว่าง';
  return 'อีเมลมีอักขระที่ไม่อนุญาต';
};
