export interface SocialAccount {
  label: string;
  url: string;
}

export interface Profile {
  displayName: string;
  pronunciation?: string;
  description?: string;
  email?: string;
  profileUrl?: string;
  avatarPath?: string;
  avatarAlt?: string;
  github?: SocialAccount;
  x?: SocialAccount;
}

export function getFullName(profile: Profile) {
  return [profile.displayName, profile.pronunciation].filter(Boolean).join(' ');
}

export function getHomeTitle(profile: Profile) {
  return [profile.displayName, profile.description].filter(Boolean).join('｜');
}

export function getHomeDescription(profile: Profile) {
  const name = getFullName(profile);
  const description = profile.description?.replace(/\s+/g, ' ').trim();
  return [`${name} 的个人主页。`, description].filter(Boolean).join('');
}
