# @huangjunsen/eslint-plugin

自研的 ESLint 规则插件，用于业务安全与架构防错。基于 TypeScript 编写，同时提供 **Flat Config** 与 legacy `.eslintrc` 两种预设。

> 要求 `eslint` `^8.57.0 || ^9.0.0 || ^10.0.0`。

---

## 安装

```bash
npm install @huangjunsen/eslint-plugin eslint --save-dev
```

---

## 包含规则

| 规则 | 预设级别 | 类型 | 说明 |
| :--- | :--- | :--- | :--- |
| `no-secret-info` | error | 🛡️ 安全防错 | 禁止硬编码 `secret` / `token` / `password` 等敏感信息 |
| `no-http-url` | warn | 🔒 传输安全 | 禁止硬编码明文 `http://` 链接，建议改用 HTTPS |
| `no-broad-semantic-versioning` | — | 📦 依赖安全 | 禁止 `package.json` 中使用 `*`、`>` 等宽泛版本范围 |
| `no-js-in-ts-project` | — | 📐 架构规范 | TypeScript 工程中禁止混入未经加白的 `.js` 文件 |

> 预设仅默认开启前两条；后两条需按项目情况显式开启（见下方示例）。

---

## 使用

### Flat Config（推荐，ESLint 9+）

```javascript
// eslint.config.mjs
import plugin from '@huangjunsen/eslint-plugin';

export default [
  plugin.configs.recommended,
  // 按需追加其余规则
  {
    plugins: { '@huangjunsen': plugin },
    rules: {
      '@huangjunsen/no-broad-semantic-versioning': 'error',
      '@huangjunsen/no-js-in-ts-project': 'warn',
    },
  },
];
```

`plugin.configs.recommended` 等价于：

```javascript
{
  plugins: { '@huangjunsen': plugin },
  rules: {
    '@huangjunsen/no-http-url': 'warn',
    '@huangjunsen/no-secret-info': 'error',
  },
}
```

### 传统 `.eslintrc.js`（ESLint 8 / 9）

```javascript
// .eslintrc.js
module.exports = {
  extends: ['plugin:@huangjunsen/legacy-recommended'],
  // 或手动声明规则
  plugins: ['@huangjunsen'],
  rules: {
    '@huangjunsen/no-secret-info': 'error',
    '@huangjunsen/no-http-url': 'warn',
    '@huangjunsen/no-broad-semantic-versioning': 'error',
    '@huangjunsen/no-js-in-ts-project': 'warn',
  },
};
```

> ESLint 10 已彻底移除 `.eslintrc` 支持，新项目请直接使用 Flat Config。

---

## 规则选项

### `no-secret-info`

检测赋值语句中疑似敏感信息的键名。

```javascript
// 默认即可命中
const token = 'xxxxxx';
const password = 'xxxxxx';
const secret = 'xxxxxx';
```

| 选项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `dangerousKeys` | `string[]` | `['secret', 'token', 'password']` | 追加自定义敏感键名 |
| `autoMerge` | `boolean` | `true` | 为 `true` 时与默认键名合并；为 `false` 时**仅**使用 `dangerousKeys` |

```javascript
'@huangjunsen/no-secret-info': ['error', { dangerousKeys: ['accessKey', 'privateKey'] }],
```

### `no-http-url`

检测字符串字面量中的 `http://` 链接（`https://`、`http://localhost` 等不受影响）。

```javascript
const api = 'http://example.com/api'; // ✖ 建议改为 https://
```

### `no-broad-semantic-versioning`

检测 `package.json` 的 `dependencies` / `devDependencies` 中过于宽泛的版本范围。

```json
{
  "dependencies": {
    "lodash": "*",       // ✖
    "dayjs": ">1.0.0",   // ✖
    "vue": "^3.4.0"      // ✓
  }
}
```

### `no-js-in-ts-project`

在 TypeScript 工程中，检测不符合命名约定、且未加白的普通 `.js` 文件。

| 选项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `whiteList` | `string[]` | 见下 | 允许存在的 `.js` 文件名 |
| `autoMerge` | `boolean` | `true` | 为 `true` 时与默认白名单合并；为 `false` 时**仅**使用 `whiteList` |

默认白名单：

```text
commitlint.config.js
eslintrc.js
prettierrc.js
stylelintrc.js
```

```javascript
'@huangjunsen/no-js-in-ts-project': ['warn', { whiteList: ['babel.config.js'] }],
```

---

## 相关包

- [`@huangjunsen/encode-fe-lint`](https://www.npmjs.com/package/@huangjunsen/encode-fe-lint) —— 一键接入与扫描的 CLI
- [`@huangjunsen/eslint-config`](https://www.npmjs.com/package/@huangjunsen/eslint-config)
- [`@huangjunsen/stylelint-config`](https://www.npmjs.com/package/@huangjunsen/stylelint-config)
- [`@huangjunsen/markdownlint-config`](https://www.npmjs.com/package/@huangjunsen/markdownlint-config)
- [`@huangjunsen/prettier-config`](https://www.npmjs.com/package/@huangjunsen/prettier-config)
- [`@huangjunsen/commitlint-config`](https://www.npmjs.com/package/@huangjunsen/commitlint-config)

## 文档

完整说明见 [项目文档](https://huangjunsen0406.github.io/js-encode-fe-spec/packages/eslint-plugin.html)。
