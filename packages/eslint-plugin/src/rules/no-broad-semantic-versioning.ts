import type { Rule } from 'eslint';
import path from 'path';

export const noBroadSemanticVersioning: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow broad semantic versioning in package.json',
      category: 'Best Practices',
      recommended: true,
    },
    schema: [],
    messages: {
      noBroadSemanticVersioning:
        'The "{{dependencyName}}" is not recommended to use "{{versioning}}"',
    },
  },
  create(context) {
    const filename = typeof context.filename === 'string' ? context.filename : (context as any).getFilename?.();
    if (filename && path.basename(filename) !== 'package.json') {
      return {};
    }

    return {
      Property(node: any) {
        if (
          node.key &&
          node.key.value &&
          (node.key.value === 'dependencies' || node.key.value === 'devDependencies') &&
          node.value &&
          node.value.properties
        ) {
          node.value.properties.forEach((property: any) => {
            if (property.key && property.key.value && property.value && property.value.value) {
              const dependencyName = property.key.value;
              const dependencyVersion = String(property.value.value);
              if (
                dependencyVersion.indexOf('*') > -1 ||
                dependencyVersion.indexOf('x') > -1 ||
                dependencyVersion.indexOf('>') > -1
              ) {
                context.report({
                  loc: property.loc,
                  messageId: 'noBroadSemanticVersioning',
                  data: {
                    dependencyName,
                    versioning: dependencyVersion,
                  },
                });
              }
            }
          });
        }
      },
    };
  },
};
