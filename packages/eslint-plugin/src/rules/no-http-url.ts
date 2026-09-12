import type { Rule } from 'eslint';

export const noHttpUrl: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow http urls, recommend https',
      category: 'Possible Errors',
      recommended: true,
    },
    schema: [],
    messages: {
      noHttpUrl: 'Recommended "{{url}}" switch to HTTPS',
    },
  },
  create(context) {
    return {
      Literal(node: any) {
        if (node.value && typeof node.value === 'string' && node.value.startsWith('http:')) {
          context.report({
            node,
            messageId: 'noHttpUrl',
            data: {
              url: node.value,
            },
          });
        }
      },
    };
  },
};
