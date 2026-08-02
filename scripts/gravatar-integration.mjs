import { spawnSync } from 'node:child_process';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import { fetch as undiciFetch } from 'undici';
import { loadEnv } from 'vite';

const PROFILE_IDENTIFIER = 'guquan2002';
const VIRTUAL_MODULE_ID = 'virtual:gravatar-profile';
const RESOLVED_VIRTUAL_MODULE_ID = `\0${VIRTUAL_MODULE_ID}`;
const proxyUrl =
  process.env.HTTPS_PROXY ||
  process.env.https_proxy ||
  process.env.HTTP_PROXY ||
  process.env.http_proxy;
function curlConfigValue(value) {
  return String(value).replaceAll('\\', '\\\\').replaceAll('"', '\\"');
}

function request(url, options = {}) {
  if (proxyUrl) {
    const headers = Object.entries(options.headers || {}).map(
      ([name, value]) =>
        `header = "${curlConfigValue(`${name}: ${value}`)}"`,
    );
    const curl = spawnSync(
      'curl',
      ['--config', '-'],
      {
        input: [
          'silent',
          'show-error',
          'location',
          'http1.1',
          'doh-url = "https://1.1.1.1/dns-query"',
          'max-time = 30',
          'retry = 2',
          'retry-all-errors',
          'retry-delay = 1',
          `url = "${curlConfigValue(url)}"`,
          ...headers,
          'write-out = "%{http_code}"',
        ].join('\n'),
        maxBuffer: 32 * 1024 * 1024,
      },
    );

    const output = curl.stdout || Buffer.alloc(0);
    const statusText = output.subarray(-3).toString('utf8');
    const status = Number(statusText);

    if (!Number.isInteger(status) || status < 100) {
      const detail = curl.stderr?.toString('utf8').trim();
      throw new Error(detail || 'Gravatar 网络请求失败。');
    }

    return Promise.resolve(
      new Response(output.subarray(0, -3), {
        status,
      }),
    );
  }

  return undiciFetch(url, {
    ...options,
  });
}

function firstVisibleAccount(accounts, serviceType) {
  return accounts?.find(
    (account) => account?.service_type === serviceType && !account?.is_hidden,
  );
}

async function fetchProfile(apiKey) {
  const response = await request(
    `https://api.gravatar.com/v3/profiles/${PROFILE_IDENTIFIER}`,
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

async function syncAvatar(profile, publicDir) {
  const generatedDir = fileURLToPath(new URL('./generated/', publicDir));
  const avatarFile = `${generatedDir}/avatar.png`;

  await mkdir(generatedDir, { recursive: true });
  await rm(`${generatedDir}/avatar.jpg`, { force: true });

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
  const github = firstVisibleAccount(raw.verified_accounts, 'github');
  const x = firstVisibleAccount(raw.verified_accounts, 'twitter');

  return {
    displayName: raw.display_name || undefined,
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

export default function gravatarSync() {
  return {
    name: 'guquan-gravatar-sync',
    hooks: {
      'astro:config:setup': async ({ config, mode, updateConfig, logger }) => {
        const rootPath = fileURLToPath(config.root);
        const fileEnv = loadEnv(mode, rootPath, '');
        const apiKey = process.env.GRAVATAR_API_KEY || fileEnv.GRAVATAR_API_KEY;

        if (!apiKey) {
          throw new Error('缺少 GRAVATAR_API_KEY，无法同步个人资料。');
        }

        const rawProfile = await fetchProfile(apiKey);
        const avatarPath = await syncAvatar(rawProfile, config.publicDir);
        const profile = selectProfile(rawProfile, avatarPath);
        const source = `export default ${JSON.stringify(profile)};`;
        const cacheDir = `${rootPath}/.cache`;

        await mkdir(cacheDir, { recursive: true });
        await writeFile(
          `${cacheDir}/gravatar-profile.json`,
          `${JSON.stringify(profile, null, 2)}\n`,
        );

        updateConfig({
          vite: {
            plugins: [
              {
                name: 'guquan-gravatar-profile-module',
                resolveId(id) {
                  return id === VIRTUAL_MODULE_ID
                    ? RESOLVED_VIRTUAL_MODULE_ID
                    : undefined;
                },
                load(id) {
                  return id === RESOLVED_VIRTUAL_MODULE_ID ? source : undefined;
                },
              },
            ],
          },
        });

        logger.info('已从 Gravatar 同步公开资料。');
      },
    },
  };
}
