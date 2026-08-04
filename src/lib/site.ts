import profile from 'virtual:gravatar-profile';

export function getFullName() {
  return [profile.displayName, profile.pronunciation].filter(Boolean).join(' ');
}

export function getHomeTitle() {
  return [profile.displayName, profile.description].filter(Boolean).join('｜');
}

export function getHomeDescription() {
  const name = getFullName();
  const description = profile.description?.replace(/\s+/g, ' ').trim();
  return [`${name} 的个人主页。`, description].filter(Boolean).join('');
}

export { profile };
