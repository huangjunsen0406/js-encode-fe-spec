const tseslint = require('typescript-eslint');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const { toArray, prettierOverrides } = require('./shared');

/**
 * TypeScript 文件
 */
const tsFiles = ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'];

/**
 * TypeScript Flat Config 配置
 *
 * - ts/tsx 文件使用 @typescript-eslint/parser
 * - 规则同时作用于 .vue（单文件组件中的 <script lang="ts"> 由 vue-eslint-parser 调用 TS parser 解析）
 */
module.exports = [
  ...require('./index'),
  ...toArray(tseslint.configs.recommended).map((config) => ({
    ...config,
    files: config.files || tsFiles,
  })),
  {
    name: 'fe-spec/typescript/vue-plugin',
    files: ['**/*.vue'],
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
  },
  {
    name: 'fe-spec/typescript/tsx',
    files: ['**/*.tsx'],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  },
  {
    name: 'fe-spec/typescript/rules',
    files: [...tsFiles, '**/*.vue'],
    rules: {
      // TS 由编译器与 @typescript-eslint 检查，关闭 ESLint 原生规则避免误报
      'no-unused-vars': 'off',
      'no-undef': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  ...prettierOverrides(),
];
