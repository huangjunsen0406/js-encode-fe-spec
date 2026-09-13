const vue = require('eslint-plugin-vue');
const vueParser = require('vue-eslint-parser');
const tsParser = require('@typescript-eslint/parser');
const { toArray, prettierOverrides } = require('./shared');

/**
 * Vue Flat Config 配置
 *
 * 规则档位选择 essential（而非 recommended）：
 * eslint-plugin-vue 的 strongly-recommended / recommended 混入了大量格式类规则
 * （attributes-order、attribute-hyphenation 等），它们无法被 Prettier 修复，
 * 只会在扫描报告中长期堆积；真正有价值的正确性 / 安全规则已在下文显式开启。
 *
 * <script> 按 lang 自动选择子解析器，JS / TS / TSX 项目均可直接使用。
 */
module.exports = [
  ...require('./index'),
  ...toArray(vue.configs['flat/essential']),
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
  {
    name: 'fe-spec/vue/rules',
    files: ['**/*.vue'],
    rules: {
      // 【保留】v-html 存在 XSS 风险，需显式确认
      'vue/no-v-html': 'warn',
      // 【保留】emits 显式声明，影响类型推导与可维护性
      'vue/require-explicit-emits': 'warn',

      // 【关闭】组件名常由路由 / 目录结构决定，index、App 类入口组件
      // 必然为单词，强制多词会产生大量误报
      'vue/multi-word-component-names': 'off',
      // 【关闭】Vue2 时代规则：要求每个 prop 都有默认值。
      // Vue3 使用 withDefaults(defineProps<T>())，可选 prop 由类型 `?` 表达
      'vue/require-default-prop': 'off',
      // 【关闭】属性命名风格（kebab-case）属团队约定，非正确性问题
      'vue/attribute-hyphenation': 'off',
      // 【关闭】属性排序属格式问题，Prettier 不处理，
      // 开启会产生大量无法自动修复的告警
      'vue/attributes-order': 'off',
    },
  },
  ...prettierOverrides(),
];
