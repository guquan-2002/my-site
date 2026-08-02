import profile from 'virtual:gravatar-profile';

export const SITE_URL = 'https://guquan2002.top';

export function getFullName() {
  return [profile.displayName, profile.pronunciation].filter(Boolean).join(' ');
}

export function getHomeTitle() {
  return [getFullName(), profile.description].filter(Boolean).join('｜') || 'guquan2002.top';
}

export function getHomeDescription() {
  const name = getFullName();
  const description = profile.description?.replace(/\s+/g, ' ').trim();
  return [name ? `${name} 的个人主页。` : undefined, description]
    .filter(Boolean)
    .join('');
}

export { profile };
