const base = require('./index');

/**
 * TypeScript Flat Config 配置
 */
module.exports = [
  ...base,
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'],
    rules: {
      'no-unused-vars': 'off',
      // TS 规范
    },
  },
];
