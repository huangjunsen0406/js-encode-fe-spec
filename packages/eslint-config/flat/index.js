const globals = require('globals');

/**
 * 基础 JS Flat Config 配置
 */
module.exports = [
  {
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
    rules: {
      // 常见逻辑防错规则（非纯排版格式）
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
];
