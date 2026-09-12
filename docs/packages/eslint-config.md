# @huangjunsen/eslint-config

提供给前端工程开箱即用的 ESLint 共享配置集。

---

## 特性亮点

- **全框架支持**：内置 ES5、ES6+、React、Vue、Node.js 与 TypeScript 完整预设；
- **现代化架构**：同时支持传统的 `.eslintrc.js` 与 ESLint 9/10 **Flat Config 扁平配置（`eslint.config.mjs`）**；
- **样式冲突解耦**：移除已废弃的手写格式化规则，将排版彻底交由 Prettier 保障。

---

## 1. 现代 Flat Config 接入（推荐，ESLint 9+）

在项目根目录创建 `eslint.config.mjs`：

```javascript
import baseConfig from '@huangjunsen/eslint-config/flat';
// 若为 TS 项目：import tsConfig from '@huangjunsen/eslint-config/flat/typescript';
// 若为 React 项目：import reactConfig from '@huangjunsen/eslint-config/flat/react';
// 若为 Vue 项目：import vueConfig from '@huangjunsen/eslint-config/flat/vue';

export default [
  ...baseConfig,
  // ...tsConfig,
];
```

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
