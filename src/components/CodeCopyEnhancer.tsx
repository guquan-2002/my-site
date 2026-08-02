import { useEffect } from 'react';

export default function CodeCopyEnhancer() {
  useEffect(() => {
    const cleanups: Array<() => void> = [];
    const codeBlocks = document.querySelectorAll<HTMLElement>(
      '.prose pre:not(.mermaid)',
    );

    codeBlocks.forEach((block) => {
      const code = block.querySelector('code');
      if (!code) return;

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'copy-code';
      button.textContent = '复制';
      button.setAttribute('aria-label', '复制代码');

      let resetTimer = 0;
      const handleClick = async () => {
        try {
          await navigator.clipboard.writeText(code.textContent || '');
          button.textContent = '已复制';
        } catch {
          button.textContent = '未复制';
        }

        window.clearTimeout(resetTimer);
        resetTimer = window.setTimeout(() => {
          button.textContent = '复制';
        }, 2200);
      };

      button.addEventListener('click', handleClick);
      block.append(button);

      cleanups.push(() => {
        window.clearTimeout(resetTimer);
        button.removeEventListener('click', handleClick);
        button.remove();
      });
    });

    return () => cleanups.forEach((cleanup) => cleanup());
  }, []);

  return null;
}
