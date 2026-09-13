# @huangjunsen/eslint-config

提供给前端工程开箱即用的 ESLint 共享配置集。内置 **ES5 / ES6+ / React / Vue / Node.js / TypeScript** 完整预设，同时支持 **Flat Config** 与传统的 `.eslintrc`。

排版与格式规则已全部交由 Prettier 负责，本配置集不含格式化规则，不会与之冲突。

> 支持 `eslint` `^8.57.0 || ^9.0.0 || ^10.0.0`。

---

## 安装

```bash
npm install @huangjunsen/eslint-config eslint --save-dev

# TypeScript 项目额外安装
npm install typescript --save-dev

# React 项目额外安装
npm install eslint-plugin-react eslint-plugin-react-hooks --save-dev

# Vue 项目额外安装
npm install eslint-plugin-vue vue-eslint-parser --save-dev
```

---

## 1. Flat Config（推荐，ESLint 9+）

在项目根目录创建 `eslint.config.mjs`：

| 项目类型 | 入口 |
| --- | --- |
| JavaScript | `@huangjunsen/eslint-config/flat` |
| TypeScript | `@huangjunsen/eslint-config/flat/typescript` |
| React（含 TSX） | `@huangjunsen/eslint-config/flat/react` |
| Vue（含 `lang="ts"` / `lang="tsx"` 的 SFC） | `@huangjunsen/eslint-config/flat/vue` |
| Node.js | `@huangjunsen/eslint-config/flat/node` |

Vue / React 项目若使用 TypeScript，把 `flat/typescript` 一并引入，并放在**最后**：

```javascript
import vueConfig from '@huangjunsen/eslint-config/flat/vue';
import tsConfig from '@huangjunsen/eslint-config/flat/typescript';

export default [
  ...vueConfig,
  // 放在最后，保证 TypeScript 的规则能覆盖前置预设
  ...tsConfig,
];
```

纯 JavaScript 项目：

```javascript
import config from '@huangjunsen/eslint-config/flat';

export default [...config];
```

> 所有 Flat Config 预设都已内置 `eslint-config-prettier`，不会与 Prettier 产生规则冲突。
> ESLint 8.57 使用 Flat Config 时需要 `FlatESLint`（`encode-fe-lint` 已自动处理）。

### Vue 预设的规则档位

Vue 预设基于 `eslint-plugin-vue` 的 `flat/essential`，而非 `recommended`。

`recommended` 中包含 `vue/attributes-order`、`vue/attribute-hyphenation` 等**格式类**规则，Prettier 无法修复，会在存量项目产生数千条长期告警。因此本预设降到 `essential` 并显式关闭以下噪音规则：

```text
vue/attributes-order
vue/attribute-hyphenation
vue/require-default-prop
vue/multi-word-component-names
```

同时保留 `vue/no-v-html`（warn）、`vue/require-explicit-emits`（warn）、`vue/no-mutating-props`（error）。

---

## 2. 传统 `.eslintrc`（ESLint 8 / 9）

```javascript
// .eslintrc.js
module.exports = {
  extends: ['@huangjunsen/eslint-config'],
};
```

| 项目类型 | 入口 |
| --- | --- |
| JavaScript | `@huangjunsen/eslint-config` |
| ES5 | `@huangjunsen/eslint-config/es5` |
| React | `@huangjunsen/eslint-config/react` |
| Vue | `@huangjunsen/eslint-config/vue` |
| Node.js | `@huangjunsen/eslint-config/node` |
| TypeScript | `@huangjunsen/eslint-config/typescript` |
| TypeScript + React | `@huangjunsen/eslint-config/typescript/react` |
| TypeScript + Vue | `@huangjunsen/eslint-config/typescript/vue` |
| TypeScript + Node.js | `@huangjunsen/eslint-config/typescript/node` |

> ESLint 10 已彻底移除 `.eslintrc` 支持，新项目请直接使用 Flat Config。

---

## 配置文件格式：新旧对照

| 工具 | ✅ 新（推荐） | ⚠️ 旧（仍支持但不建议新增） |
| --- | --- | --- |
| **ESLint** | `eslint.config.{js,mjs,cjs,ts,mts,cts}` | `.eslintrc.*`、`package.json` 的 `eslintConfig` |
| **Stylelint** | `stylelint.config.{js,cjs,mjs,ts}` | `.stylelintrc*`（旧格式**优先级更高**，会遮蔽新格式） |
| **Prettier** | `.prettierrc.*` 与 `prettier.config.*` 同等 | —（无「旧格式」概念） |
| **markdownlint** | `.markdownlint.{jsonc,json,yaml,yml,cjs,mjs}` | — |
| **commitlint** | `commitlint.config.{js,cjs,mjs,ts,cts,mts}` | `.commitlintrc*` |

---

## 相关包

- [`@huangjunsen/encode-fe-lint`](https://www.npmjs.com/package/@huangjunsen/encode-fe-lint) —— 一键接入与扫描的 CLI
- [`@huangjunsen/stylelint-config`](https://www.npmjs.com/package/@huangjunsen/stylelint-config)
- [`@huangjunsen/prettier-config`](https://www.npmjs.com/package/@huangjunsen/prettier-config)
- [`@huangjunsen/markdownlint-config`](https://www.npmjs.com/package/@huangjunsen/markdownlint-config)
- [`@huangjunsen/commitlint-config`](https://www.npmjs.com/package/@huangjunsen/commitlint-config)

## 文档

完整说明见 [项目文档](https://huangjunsen0406.github.io/js-encode-fe-spec/packages/eslint-config.html)。
