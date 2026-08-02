import { useEffect } from 'react';

export default function MermaidEnhancer() {
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('pre.mermaid'));
    if (nodes.length === 0) return;

    let cancelled = false;

    async function renderDiagrams() {
      const { default: mermaid } = await import('mermaid');
      if (cancelled) return;

      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'strict',
        theme: 'base',
        fontFamily: '"LXGW Wenkai", KaiTi, serif',
        themeVariables: {
          background: '#f6f2e9',
          primaryColor: '#f8dedb',
          primaryTextColor: '#20211e',
          primaryBorderColor: '#a73835',
          lineColor: '#6e625c',
          secondaryColor: '#eee7dc',
          tertiaryColor: '#fbf9f4',
        },
      });

      try {
        await mermaid.run({ nodes });
      } catch {
        nodes.forEach((node) => node.setAttribute('data-mermaid-error', 'true'));
      }
    }

    void renderDiagrams();
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
