# @huangjunsen/eslint-config

## 1.0.8

### Patch Changes

- 补充 `files` 字段：此前会把 `__tests__/` 与 `.eslintrc.js`、`.editorconfig` 等开发配置一并发布
- 补齐完整的版本变更记录，并将 CHANGELOG 纳入发布内容

## 1.0.7

### Patch Changes

- 测试超时由 5s 放宽至 30s：并行执行时校验 TS / Vue 配置的用例偶发超时
- `homepage` 与 `repository` 指向新的文档站点与仓库地址

## 1.0.6

### Patch Changes

- 重写 README：补齐 Flat Config 与 legacy 双入口说明、Vue 预设档位说明、新旧配置格式对照

## 1.0.5

### Minor Changes

- 兼容 ESLint 9 / 10 的 Flat Config
- 规则插件全家桶升级：`eslint-config-egg` 14、`eslint-import-resolver-typescript` 4、`eslint-plugin-react-hooks` 7、`globals` 17

### Patch Changes

- `react-hooks` 7 的 `recommended` 预设由 2 条扩至 16 条（含 React Compiler 规则），改为显式内联 `rules-of-hooks` 与 `exhaustive-deps`
- 移除 `eslint-plugin-jsx-plus` 死依赖与 `eslint-plugin-react` 中已删除的规则配置

## 1.0.4

### Patch Changes

- Vue 预设由 `flat/recommended` 降为 `flat/essential`，并显式关闭 `attributes-order`、`attribute-hyphenation`、`require-default-prop`、`multi-word-component-names` 等无法自动修复的格式类规则
- 清理 `@typescript-eslint` v8 已移除的格式化规则（`indent`、`semi`、`quotes`、`ban-types`、`camelcase` 等）

## 1.0.3

### Patch Changes

- 修复 Flat Config 未生效的问题
- 重构 `flat/` 预设：新增 `flat/node`、`flat/shared`，完善 `flat/react`、`flat/typescript`、`flat/vue`

## 1.0.2

### Patch Changes

- 补齐核心插件依赖，注入 `resolvePluginsRelativeTo`

## 1.0.1

### Minor Changes

- 支持 ESLint Flat Config
- 支持 cz-git 交互式提交，新增 `@huangjunsen/prettier-config` 与第三方预设接入

## 1.0.0

### Minor Changes

- 首个版本：提供 ES5 / ES6+ / React / Vue / Node.js / TypeScript 的 legacy 共享配置
