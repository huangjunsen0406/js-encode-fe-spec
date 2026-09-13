# @huangjunsen/eslint-config

提供给前端工程开箱即用的 ESLint 共享配置集。

---

## 特性亮点

- **全框架支持**：内置 ES5、ES6+、React、Vue、Node.js 与 TypeScript 完整预设；
- **现代化架构**：同时支持传统的 `.eslintrc.js` 与 ESLint 9/10 **Flat Config 扁平配置（`eslint.config.mjs`）**；
- **样式冲突解耦**：移除已废弃的手写格式化规则，将排版彻底交由 Prettier 保障。

---

## 1. 现代 Flat Config 接入（推荐，ESLint 9+）

按项目类型选择对应入口，在项目根目录创建 `eslint.config.mjs`：

| 项目类型 | 入口 |
| --- | --- |
| JavaScript | `@huangjunsen/eslint-config/flat` |
| TypeScript | `@huangjunsen/eslint-config/flat/typescript` |
| React（含 TSX） | `@huangjunsen/eslint-config/flat/react` |
| Vue（含 `lang="ts"` / `lang="tsx"` 的 SFC） | `@huangjunsen/eslint-config/flat/vue` |
| Node.js | `@huangjunsen/eslint-config/flat/node` |

Vue / React 项目若使用 TypeScript，把 `flat/typescript` 一并引入，并放在**最后**（保证 TypeScript 的规则覆盖前置预设）：

```javascript
import vueConfig from '@huangjunsen/eslint-config/flat/vue';
import tsConfig from '@huangjunsen/eslint-config/flat/typescript';

export default [
  ...vueConfig,
  // 放在最后，保证 TypeScript 的规则能覆盖前置预设
  ...tsConfig,
];
```

> 所有 Flat Config 预设都已内置 `eslint-config-prettier`，不会与 Prettier 产生规则冲突；
> 支持 ESLint 8.57 / 9 / 10，`encode-fe-lint` 会自动识别项目中的 `eslint.config.*` 并启用扁平配置。

### Vue 预设的规则档位

Vue 预设基于 `eslint-plugin-vue` 的 `flat/essential`，而非 `recommended`。

原因：`strongly-recommended` 及以上档位混入了大量**格式类**规则，它们无法被 Prettier 修复，
只会在扫描报告中长期堆积。以真实项目实测，`attributes-order`、`attribute-hyphenation`、
`require-default-prop`、`multi-word-component-names` 四条规则贡献了约 98% 的 Vue 告警。

以下规则被显式关闭，如需开启可在自己的配置中覆盖：

| 规则 | 关闭原因 |
| --- | --- |
| `vue/attributes-order` | 属性排序属格式问题，Prettier 不处理 |
| `vue/attribute-hyphenation` | 属性命名风格属团队约定，非正确性问题 |
| `vue/require-default-prop` | Vue 2 时代规则；Vue 3 用 `withDefaults(defineProps<T>())`，可选 prop 由类型 `?` 表达 |
| `vue/multi-word-component-names` | 组件名常由路由 / 目录决定，`index.vue` 等入口组件必然为单词 |

同时显式保留了以下正确性与安全规则：

- `vue/no-mutating-props`（error）
- `vue/no-v-html`（warn）
- `vue/require-explicit-emits`（warn）

---

## 2. 传统 Legacy Config 接入（ESLint 8.x / 老项目）

在项目根目录创建 `.eslintrc.js`：

### JavaScript 项目
```javascript
module.exports = {
  extends: ['@huangjunsen/eslint-config'],
};
```

### TypeScript 项目
```javascript
module.exports = {
  extends: ['@huangjunsen/eslint-config/typescript'],
};
```

### React / Vue 项目
```javascript
// React 项目
module.exports = {
  extends: ['@huangjunsen/eslint-config/react'],
};

// Vue 项目
module.exports = {
  extends: ['@huangjunsen/eslint-config/vue'],
};
```
