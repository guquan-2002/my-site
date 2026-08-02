import { spawnSync } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const FONT_URL =
  'https://raw.githubusercontent.com/lxgw/LxgwWenKai/main/fonts/TTF/LXGWWenKai-Regular.ttf';

function downloadFont(path) {
  const result = spawnSync(
    'curl',
    [
      '--fail',
      '--silent',
      '--show-error',
      '--location',
      '--max-time',
      '120',
      '--output',
      path,
      FONT_URL,
    ],
    { encoding: 'utf8' },
  );

  if (result.status !== 0) {
    throw new Error(result.stderr || '下载霞鹜文楷失败。');
  }
}

const tempDir = await mkdtemp(join(tmpdir(), 'guquan-og-'));

try {
  const profileCachePath = fileURLToPath(
    new URL('../.cache/gravatar-profile.json', import.meta.url),
  );
  const profile = JSON.parse(await readFile(profileCachePath, 'utf8'));
  const fontPath = join(tempDir, 'LXGWWenKai-Regular.ttf');
  downloadFont(fontPath);

  const outputPath = fileURLToPath(new URL('../public/og.png', import.meta.url));
  const name = profile.displayName || 'guquan2002.top';
  const pronunciation = profile.pronunciation || '';
  const description = profile.description?.replace(/\s+/g, ' ').trim() || '';

  const result = spawnSync(
    'convert',
    [
      '-size',
      '1200x630',
      'xc:#f6f2e9',
      '-fill',
      'rgba(205,48,43,0.10)',
      '-draw',
      'circle 1060,88 1320,348',
      '-fill',
      'none',
      '-stroke',
      'rgba(167,56,53,0.20)',
      '-strokewidth',
      '2',
      '-draw',
      'circle 1060,88 1250,278',
      '-stroke',
      'none',
      '-font',
      fontPath,
      '-fill',
      '#20211e',
      '-pointsize',
      '106',
      '-annotate',
      '+102+214',
      name,
      '-fill',
      '#a73835',
      '-pointsize',
      '28',
      '-annotate',
      '+108+266',
      pronunciation,
      '-fill',
      '#20211e',
      '-pointsize',
      '44',
      '-annotate',
      '+105+426',
      description,
      '-fill',
      '#6e625c',
      '-pointsize',
      '24',
      '-annotate',
      '+108+536',
      'guquan2002.top',
      '-fill',
      '#a73835',
      '-draw',
      'roundrectangle 105,562 235,570 4,4',
      '-strip',
      outputPath,
    ],
    { encoding: 'utf8' },
  );

  if (result.status !== 0) {
    throw new Error(result.stderr || 'ImageMagick 生成社交预览图失败。');
  }

  console.log(`已生成 ${outputPath}`);
} finally {
  await rm(tempDir, { recursive: true, force: true });
}
