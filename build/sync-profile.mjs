import { mkdir, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import { EnvHttpProxyAgent, fetch as undiciFetch } from 'undici';

import { siteConfig } from '../site.config.mjs';

const dispatcher = new EnvHttpProxyAgent();

function request(url, options = {}) {
  return undiciFetch(url, {
    ...options,
    dispatcher,
  });
}

function firstVisibleAccount(accounts, serviceType) {
  return accounts?.find(
    (account) => account?.service_type === serviceType && !account?.is_hidden,
  );
}

async function fetchProfile(apiKey) {
  const response = await request(
    `https://api.gravatar.com/v3/profiles/${siteConfig.profileIdentifier}`,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Gravatar API 返回 ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function syncAvatar(profile) {
  const generatedDir = fileURLToPath(new URL('../public/generated/', import.meta.url));
  const avatarFile = `${generatedDir}/avatar.png`;

  await mkdir(generatedDir, { recursive: true });

  if (!profile.avatar_url) {
    await rm(avatarFile, { force: true });
    return undefined;
  }

  const avatarUrl = new URL(profile.avatar_url);
  avatarUrl.searchParams.set('s', '256');
  avatarUrl.searchParams.set('d', '404');

  const response = await request(avatarUrl);
  if (!response.ok) {
    throw new Error(`Gravatar 头像返回 ${response.status} ${response.statusText}`);
  }

  await writeFile(avatarFile, Buffer.from(await response.arrayBuffer()));
  return '/generated/avatar.png';
}

function selectProfile(raw, avatarPath) {
  const displayName = typeof raw.display_name === 'string' ? raw.display_name.trim() : '';
  if (!displayName) {
    throw new Error('Gravatar 公开资料缺少 display_name，无法同步个人资料。');
  }

  const github = firstVisibleAccount(raw.verified_accounts, 'github');
  const x = firstVisibleAccount(raw.verified_accounts, 'twitter');

  return {
    displayName,
    pronunciation: raw.pronunciation || undefined,
    description: raw.description || undefined,
    email: raw.contact_info?.email || undefined,
    profileUrl: raw.profile_url || undefined,
    avatarPath,
    avatarAlt: raw.avatar_alt_text || raw.display_name || undefined,
    github: github
      ? { label: github.service_label || 'GitHub', url: github.url }
      : undefined,
    x: x ? { label: x.service_label || 'X', url: x.url } : undefined,
  };
}

const apiKey = process.env.GRAVATAR_API_KEY;
if (!apiKey) {
  throw new Error('缺少 GRAVATAR_API_KEY，无法同步个人资料。');
}

const rawProfile = await fetchProfile(apiKey);
const avatarPath = await syncAvatar(rawProfile);
const profile = selectProfile(rawProfile, avatarPath);
const outputPath = fileURLToPath(
  new URL('../src/generated/profile.json', import.meta.url),
);

await writeFile(outputPath, `${JSON.stringify(profile, null, 2)}\n`);
console.log(`已同步个人资料至 ${outputPath}`);
