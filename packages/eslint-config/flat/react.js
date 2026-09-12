const base = require('./index');

/**
 * React Flat Config 配置
 */
module.exports = [
  ...base,
  {
    files: ['**/*.jsx', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {},
  },
];
