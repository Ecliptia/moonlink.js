export type NyxLogLevel = 'silent' | 'error' | 'warn' | 'info' | 'debug' | 'trace';

export const consolaLevels: Record<NyxLogLevel, number> = {
  silent: -999,
  error: 0,
  warn: 1,
  info: 3,
  debug: 4,
  trace: 5,
};

export const logColors: Record<string, number> = {
  TRACE: 90,
  DEBUG: 94,
  LOG: 37,
  INFO: 96,
  START: 96,
  READY: 92,
  SUCCESS: 92,
  WARN: 93,
  ERROR: 91,
  FATAL: 91,
  FAIL: 91,
  BOX: 95,
};
