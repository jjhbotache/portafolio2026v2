import type { Lang } from '../i18n/utils';
import { resolveBilingual } from '../i18n/utils';

// ─── helpers used by every section component ─────────────────────────────────
// These functions normalise the frontmatter shape from the content collections
// (which use either a plain string or a `{ es, en }` object) into a single
// resolved string for the requested language. Centralising the resolution
// keeps the components small and consistent.

export type Bilingual = string | { es: string; en: string };

export const resolve = (v: Bilingual | undefined, lang: Lang): string =>
  resolveBilingual<string>(v, lang, '');

export const monthName = (month: number, lang: Lang): string => {
  const esNames = [
    'ene', 'feb', 'mar', 'abr', 'may', 'jun',
    'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
  ];
  const enNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  const list = lang === 'en' ? enNames : esNames;
  return list[Math.max(0, Math.min(11, month - 1))];
};

export const formatPeriod = (
  start: { month: number; year: string },
  end: { month: number; year: string } | undefined,
  lang: Lang,
  currentLabel = lang === 'en' ? 'Present' : 'Actualidad',
): string => {
  const a = `${monthName(start.month, lang)} ${start.year}`;
  if (!end) return `${a} — ${currentLabel}`;
  const b = `${monthName(end.month, lang)} ${end.year}`;
  return `${a} — ${b}`;
};
