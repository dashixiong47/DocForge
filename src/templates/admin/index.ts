// Re-export shared layout helpers
export { adminLayout, esc, setSysI18n, setSysLocales } from './layout';

// Re-export standalone pages
export { pluginEditor } from './editor';
export { cssEditor } from './css-editor';

// Import page functions to assemble the adminPage object
import { login, notFound } from './page-login';
import { dashboard } from './page-dashboard';
import { plugins } from './page-plugins';
import { sections, editSection } from './page-sections';
import { translationsList, systemTranslations, pluginTranslations } from './page-translations';
import { media } from './page-media';
import { settings, accountSettings } from './page-settings';
import { pluginEditor } from './editor';

// Assembled adminPage object — same shape as the original admin_page.ts export
export const adminPage = {
  login,
  notFound,
  dashboard,
  plugins,
  sections,
  editSection,
  pluginTranslations,
  settings,
  accountSettings,
  media,
  pluginEditor,
  translationsList,
  systemTranslations,
};
