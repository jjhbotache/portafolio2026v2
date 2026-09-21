// Type-safe language selector.
// The portfolio ships in two locales: Spanish (default) and English.
export type Lang = 'es' | 'en';

export const DEFAULT_LANG: Lang = 'es';
export const SUPPORTED_LANGS: readonly Lang[] = ['es', 'en'] as const;

/** Look up a translation key. Throws in dev when the key is missing. */
export function t(lang: Lang, key: string): string {
  const dict = dictionaries[lang] ?? dictionaries[DEFAULT_LANG];
  const value = dict[key];
  if (value == null) {
    if (import.meta.env.DEV) {
      console.warn(`[i18n] missing key "${key}" for lang "${lang}"`);
    }
    return key;
  }
  return value;
}

/**
 * Resolve a value that may be either:
 *   - a plain string (used for both languages)
 *   - a `{ es, en }` object (one per language)
 */
export function resolveBilingual<T = string>(
  value: string | { es: T; en: T } | undefined,
  lang: Lang,
  fallback: T = '' as T,
): T {
  if (value == null) return fallback;
  if (typeof value === 'string') return value as unknown as T;
  return (value as { es: T; en: T })[lang] ?? fallback;
}

// ─── dictionaries ────────────────────────────────────────────────────────────
// Flat dot-notation keys, kept centralized so the rest of the app only ever
// has to call `t(lang, 'sections.about.body')` instead of juggling JSON files.
const es = {
  'site.title': 'Juan Jose Huertas · Portafolio',
  'site.description': 'Portafolio de Juan Jose Huertas — desarrollador full-stack especializado en JavaScript y Python.',
  'lang.label': 'EN',
  'lang.switchTo': 'EN',

  'splash.name': 'Juan Jose Huertas',
  'splash.profession': 'Javascript & Python Developer',

  'sections.experience.title': 'Mi experiencia',
  'experience.viewMore': 'Ver más',
  'experience.closeDetail': 'Cerrar detalle',
  'experience.seeAll': 'Ver todas las experiencias',
  'experience.collapse': 'Mostrar menos',
  'experience.noImages': 'Sin imágenes disponibles',

  'sections.about.title': 'Sobre mí',
  'sections.about.body': 'Soy un desarrollador apasionado por la tecnología y el software. Me encanta simplificar la vida mediante la tecnología y sus mejores prácticas.',
  'sections.about.body2': 'Es por eso que me he especializado en Javascript y Python, tecnologías con las que la mayoría de problemas, es posible solucionar.',
  'sections.about.techLabel': 'Tecnologías',

  'sections.projects.title': 'Mis proyectos',
  "sections.projects.hover": "Ver el proyecto",
  'project.viewDemo': 'Ver demo',
  'project.viewRepo': 'Repositorio',
  'project.links': 'Enlaces',
  'project.video': 'Video',
  'project.technologies': 'Tecnologías',

  'sections.contact.body': '¿Te interesa mi trabajo? Escríbeme y charlemos sobre cómo puedo ayudarte a construir tu próximo proyecto.',
  'sections.contact.emailLabel': 'Escríbeme a',
  'sections.contact.phoneLabel': 'o al teléfono',
  'sections.contact.title': 'Contacto',

  'nav.menu.toggle': 'Menú',
  'nav.menu.home': 'Inicio',
  'nav.menu.homeAria': 'Volver al inicio',
  'nav.lang.fullLabel': 'Idioma',
  'nav.lang.shortLabel': 'ES',
};

const en: typeof es = {
  'site.title': 'Juan Jose Huertas · Portfolio',
  'site.description': 'Portfolio of Juan Jose Huertas — full-stack developer specialised in JavaScript and Python.',
  'lang.label': 'ES',
  'lang.switchTo': 'ES',

  'splash.name': 'Juan Jose Huertas',
  'splash.profession': 'Javascript & Python Developer',

  'sections.experience.title': 'My experience',
  'experience.viewMore': 'View more',
  'experience.closeDetail': 'Close detail',
  'experience.seeAll': 'See all experiences',
  'experience.collapse': 'Show less',
  'experience.noImages': 'No images available',

  'sections.about.title': 'About me',
  'sections.about.body': "I'm a developer passionate about technology and software. I love simplifying life through technology and its best practices.",
  'sections.about.body2': 'That is why I have specialised in JavaScript and Python, technologies that make it possible, for most problems, find out a solution.',
  'sections.about.techLabel': 'Technologies',

  'sections.projects.title': 'My projects',
  "sections.projects.hover": "View project",
  'project.viewDemo': 'Live demo',
  'project.viewRepo': 'Repository',
  'project.links': 'Links',
  'project.video': 'Video',
  'project.technologies': 'Technologies',

  'sections.contact.body': 'Interested in my work? Drop me a line and let us talk about how I can help you build your next project.',
  'sections.contact.emailLabel': 'Email me at',
  'sections.contact.phoneLabel': 'or by phone',
  'sections.contact.title': 'Contact',

  'nav.menu.toggle': 'Menu',
  'nav.menu.home': 'Home',
  'nav.menu.homeAria': 'Back to home',
  'nav.lang.fullLabel': 'Language',
  'nav.lang.shortLabel': 'EN',
};

const dictionaries: Record<Lang, Record<string, string>> = { es, en };
