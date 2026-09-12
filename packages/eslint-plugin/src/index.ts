import type { ESLint, Rule } from 'eslint';
import { noHttpUrl } from './rules/no-http-url';
import { noSecretInfo } from './rules/no-secret-info';
import { noBroadSemanticVersioning } from './rules/no-broad-semantic-versioning';
import { noJsInTsProject } from './rules/no-js-in-ts-project';

export const rules: Record<string, Rule.RuleModule> = {
  'no-http-url': noHttpUrl,
  'no-secret-info': noSecretInfo,
  'no-broad-semantic-versioning': noBroadSemanticVersioning,
  'no-js-in-ts-project': noJsInTsProject,
};

// 兼容 Flat Config 插件对象
const plugin: ESLint.Plugin = {
  meta: {
    name: '@huangjunsen/eslint-plugin',
    version: '2.0.0',
  },
  rules,
};

export const configs = {
  // Flat Config recommended 预设
  recommended: {
    plugins: {
      '@huangjunsen': plugin,
    },
    rules: {
      '@huangjunsen/no-http-url': 'warn',
      '@huangjunsen/no-secret-info': 'error',
    },
  },
  // Legacy Config 兼容预设
  'legacy-recommended': {
    plugins: ['@huangjunsen'],
    rules: {
      '@huangjunsen/no-http-url': 'warn',
      '@huangjunsen/no-secret-info': 'error',
    },
  },
};

(plugin as any).configs = configs;

export default plugin;
