const react = require('eslint-plugin-react');
const reactHooks = require('eslint-plugin-react-hooks');
const jsxA11y = require('eslint-plugin-jsx-a11y');
const tsParser = require('@typescript-eslint/parser');
const { prettierOverrides } = require('./shared');

/**
 * React Hooks 经典规则
 *
 * eslint-plugin-react-hooks v7 的 `recommended` 预设新增了 14 条 React Compiler
 * 相关规则（purity / immutability / refs / set-state-in-effect …），且大多为 error 级别。
 * 这些规则用于配合 React Compiler 使用，在既有项目上会产生大量改动量极大的告警，
 * 因此此处仅保留长期稳定、业界公认的两条经典规则；
 * 需要启用编译器规则的项目可自行 extend：
 *
 *   import reactHooks from 'eslint-plugin-react-hooks';
 *   export default [
 *     ...vueConfig,
 *     { plugins: { 'react-hooks': reactHooks }, rules: reactHooks.configs.recommended.rules },
 *   ];
 */
const reactHooksRules = {
  'react-hooks/rules-of-hooks': 'error',
  'react-hooks/exhaustive-deps': 'warn',
};

/**
 * React Flat Config 配置
 */
module.exports = [
  ...require('./index'),
  {
    name: 'fe-spec/react/setup',
    files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooksRules,
      ...jsxA11y.configs.recommended.rules,
    },
  },
  {
    name: 'fe-spec/react/typescript',
    files: ['**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
  },
  ...prettierOverrides(),
];
