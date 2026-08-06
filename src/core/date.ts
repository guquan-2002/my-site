import { siteConfig } from '../../site.config.mjs';

const dateFormatter = new Intl.DateTimeFormat(siteConfig.locale, {
  timeZone: siteConfig.timeZone,
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

export function formatDate(date: Date) {
  return dateFormatter.format(date);
}
