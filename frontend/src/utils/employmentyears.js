import { SYSTEM_START_YEAR } from '../config/systemdates.js';

export const getEmploymentStartYear = (hireDate, fallbackYear = new Date().getFullYear()) => {
  const parsedYear = Number(String(hireDate ?? '').slice(0, 4));
  const employmentYear = Number.isInteger(parsedYear) && parsedYear >= 1900
    ? parsedYear
    : fallbackYear;
  return Math.max(SYSTEM_START_YEAR, employmentYear);
};

export const getEmploymentYears = (hireDate, currentYear = new Date().getFullYear()) => {
  const startYear = Math.min(getEmploymentStartYear(hireDate, currentYear), currentYear);
  return Array.from(
    { length: currentYear - startYear + 1 },
    (_, index) => currentYear - index,
  );
};
