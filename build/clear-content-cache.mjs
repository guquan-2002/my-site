import { rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const dataStoreFile = fileURLToPath(
  new URL('../node_modules/.astro/data-store.json', import.meta.url),
);
const dataStoreDir = fileURLToPath(
  new URL('../node_modules/.astro/data-store/', import.meta.url),
);

await Promise.all([
  rm(dataStoreFile, { force: true }),
  rm(dataStoreDir, { recursive: true, force: true }),
]);
console.log('已清理 Astro 内容缓存，避免删除最后一篇笔记后旧页面残留。');
