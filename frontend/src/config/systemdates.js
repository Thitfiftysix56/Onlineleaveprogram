const configuredStartYear = Number(import.meta.env.VITE_SYSTEM_START_YEAR);

export const SYSTEM_START_YEAR = Number.isInteger(configuredStartYear) && configuredStartYear > 2000
  ? configuredStartYear
  : 2025;
