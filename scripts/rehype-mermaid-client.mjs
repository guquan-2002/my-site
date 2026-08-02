import { visit } from 'unist-util-visit';

function textContent(node) {
  if (node.type === 'text') return node.value;
  if (!Array.isArray(node.children)) return '';
  return node.children.map(textContent).join('');
}

export default function rehypeMermaidClient() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'pre' || node.children?.length !== 1) return;

      const code = node.children[0];
      const classNames = code.properties?.className;
      const classes = Array.isArray(classNames) ? classNames : [classNames];
      if (code.tagName !== 'code' || !classes.includes('language-mermaid')) return;

      node.properties = { className: ['mermaid'] };
      node.children = [{ type: 'text', value: textContent(code) }];
    });
  };
}
