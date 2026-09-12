# @huangjunsen/eslint-plugin

基于 TypeScript 重构的自研定制化 ESLint 规则插件，用于业务安全与架构防错。

---

## 包含规则

| 规则名称 | 严重级别 | 类别 | 说明 |
| :--- | :--- | :--- | :--- |
| `no-secret-info` | Error | 🛡️ 安全防错 | 禁止在代码中硬编码 Secret、Token、密码或明文密钥 |
| `no-http-url` | Warn | 🔒 传输安全 | 禁止在源码中硬编码明文 `http://` 资源或 API 链接 |
| `no-broad-semantic-versioning` | Error | 📦 依赖安全 | 禁止在 `package.json` 的依赖声明中使用 `*`、`>` 等宽泛版本 |
| `no-js-in-ts-project` | Warn | 📐 架构规范 | 在 TypeScript 工程中禁止混入未经加白的普通 `.js` 源码 |

---

## 使用方式

### 现代 Flat Config
```javascript
import plugin from '@huangjunsen/eslint-plugin';

export default [
  plugin.configs.recommended,
];
```

### 传统 .eslintrc.js
```javascript
module.exports = {
  plugins: ['@huangjunsen'],
  rules: {
    '@huangjunsen/no-secret-info': 'error',
    '@huangjunsen/no-http-url': 'warn',
    '@huangjunsen/no-broad-semantic-versioning': 'error',
    '@huangjunsen/no-js-in-ts-project': 'warn',
  },
};
```
