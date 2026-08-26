# 梏权的个人主页

这是 `guquan2002.top` 的源码。站点使用 Astro 静态生成；个人资料通过 `npm run sync:profile` 从 Gravatar 同步，结果保存在 `src/generated/profile.json`。

## 本地开发

需要 Node.js 22.19.0（以 `.nvmrc` 为准）和 npm。先安装依赖：

```sh
npm install
```

复制环境变量示例，把真实密钥填入 `.env`：

```sh
cp .env.example .env
```

`.env` 中需要的变量是：

```dotenv
GRAVATAR_API_KEY=your_gravatar_api_key
```

启动本地开发服务：

```sh
npm run dev
```

执行类型检查和生产构建：

```sh
npm run build
```

`npm run build` 本身不访问 Gravatar API；只有运行 `npm run sync:profile` 或 `npm run generate:assets` 时才需要能访问 Gravatar API。公开资料必须包含显示名称；其他资料字段可选，缺少就省略。

社交预览图是 `public/og.png` 里的静态图片。Gravatar 姓名或简介变化后，先运行 `npm run sync:profile` 同步资料，再运行 `npm run generate:og` 重新生成；也可以直接运行 `npm run generate:assets` 一次完成。

## 写一篇近记

把 Markdown 文件放入 `src/content/notes/`。文件名会成为网址短名，例如 `trying-a-new-tool.md` 对应 `/notes/trying-a-new-tool/`。可以从 `templates/note.md` 开始。

文章必须有标题和日期，摘要可选。正文从 `##` 开始，图片必须提供替代文字。支持脚注、KaTeX 数学公式和 Mermaid 图表。

图片放在 `public/images/notes/<文章短名>/` 中，然后在 Markdown 里用站内路径引用。

## Cloudflare Pages

Cloudflare Pages 的生产分支是 `main`，构建命令是 `npm run build`，输出目录是 `dist`。若需要在云端构建时同步资料，请把构建命令改为 `npm run generate:assets && npm run build`，并在 Cloudflare Pages 的加密环境变量中配置 `GRAVATAR_API_KEY`，同时确保构建环境有 ImageMagick（`convert`）和网络；否则无需配置该变量。
