/// <reference types="astro/client" />

declare module 'virtual:gravatar-profile' {
  export interface SocialAccount {
    label: string;
    url: string;
  }

  export interface GravatarProfile {
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

  const profile: GravatarProfile;
  export default profile;
}
