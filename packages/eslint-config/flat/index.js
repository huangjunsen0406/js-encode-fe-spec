const globals = require('globals');
const { prettierOverrides } = require('./shared');

/**
 * 基础 Flat Config（JavaScript）
 *
 * 只包含语言选项与通用的逻辑防错规则，不含格式化规则，
 * 格式化统一交给 Prettier 完成。
 */
module.exports = [
  {
    name: 'fe-spec/base/language-options',
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'warn',
    },
  },
  {
    name: 'fe-spec/base/rules',
    rules: {
      'no-var': 'error',
      'prefer-const': ['error', { destructuring: 'all' }],
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-constant-condition': 'warn',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-duplicate-imports': 'error',
      eqeqeq: ['warn', 'always', { null: 'ignore' }],
    },
  },
  ...prettierOverrides(),
];
