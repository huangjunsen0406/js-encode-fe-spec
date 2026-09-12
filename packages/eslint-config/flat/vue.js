const base = require('./index');

/**
 * Vue Flat Config 配置
 */
module.exports = [
  ...base,
  {
    files: ['**/*.vue'],
    rules: {},
  },
];
