const vue = require('eslint-plugin-vue');
const vueParser = require('vue-eslint-parser');
const tsParser = require('@typescript-eslint/parser');
const { toArray, prettierOverrides } = require('./shared');

/**
 * Vue Flat Config 配置
 *
 * - 使用 eslint-plugin-vue 官方的 flat/recommended 规则集
 * - <script> 按 lang 自动选择子解析器，因此 JS / TS 项目均可直接使用
 */
module.exports = [
  ...require('./index'),
  ...toArray(vue.configs['flat/recommended']),
  {
    name: 'fe-spec/vue/parser',
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        // 支持 <script lang="tsx"> 中的 JSX 写法
        ecmaFeatures: {
          jsx: true,
        },
        // https://github.com/vuejs/vue-eslint-parser#parseroptionsparser
        parser: {
          js: 'espree',
          jsx: 'espree',
          ts: tsParser,
          tsx: tsParser,
        },
        extraFileExtensions: ['.vue'],
      },
    },
  },
  ...prettierOverrides(),
];
