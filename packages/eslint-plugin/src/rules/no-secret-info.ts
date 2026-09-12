import type { Rule } from 'eslint';

const DEFAULT_DANGEROUS_KEYS = ['secret', 'token', 'password'];

export const noSecretInfo: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow secret keys in code',
      category: 'Security',
      recommended: true,
    },
    schema: [
      {
        type: 'object',
        properties: {
          dangerousKeys: {
            type: 'array',
            items: { type: 'string' },
          },
          autoMerge: {
            type: 'boolean',
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      noSecretInfo: 'Detect that the "{{secret}}" might be a secret token, Please check!',
    },
  },
  create(context) {
    const ruleOptions = (context.options[0] as any) || {};
    let { dangerousKeys = [], autoMerge = true } = ruleOptions;
    if (dangerousKeys.length === 0) {
      dangerousKeys = DEFAULT_DANGEROUS_KEYS;
    } else if (autoMerge) {
      dangerousKeys = Array.from(new Set([...DEFAULT_DANGEROUS_KEYS, ...dangerousKeys]));
    }
    const reg = new RegExp(dangerousKeys.join('|'), 'i');

    return {
      Literal(node: any) {
        if (
          node.value &&
          node.parent &&
          ((node.parent.type === 'VariableDeclarator' &&
            node.parent.id &&
            node.parent.id.name &&
            reg.test(node.parent.id.name.toLocaleLowerCase())) ||
            (node.parent.type === 'Property' &&
              node.parent.key &&
              node.parent.key.name &&
              reg.test(node.parent.key.name.toLocaleLowerCase())))
        ) {
          context.report({
            node,
            messageId: 'noSecretInfo',
            data: {
              secret: String(node.value),
            },
          });
        }
      },
    };
  },
};
