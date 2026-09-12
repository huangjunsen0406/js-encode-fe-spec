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
