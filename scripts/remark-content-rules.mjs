import { visit } from 'unist-util-visit';

export default function remarkContentRules() {
  return (tree, file) => {
    visit(tree, 'heading', (node) => {
      if (node.depth === 1) {
        file.fail('近记正文不能使用一级标题，请从 ## 开始。', node);
      }
    });

    visit(tree, 'image', (node) => {
      if (!node.alt?.trim()) {
        file.fail('每张正文图片都必须填写替代文字。', node);
      }
    });
  };
}
