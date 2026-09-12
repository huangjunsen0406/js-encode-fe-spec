const globals = require('globals');
const { prettierOverrides } = require('./shared');

/**
 * Node.js Flat Config 配置
 */
module.exports = [
  ...require('./index'),
  {
    name: 'fe-spec/node/language-options',
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  ...prettierOverrides(),
];
