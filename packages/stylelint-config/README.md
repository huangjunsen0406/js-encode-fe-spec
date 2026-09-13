# @huangjunsen/stylelint-config

CSS、SCSS、Less 样式代码的共享质量检查规范。

- 继承 `stylelint-config-standard` 与 `stylelint-config-standard-scss`；
- 禁止选择器重复、未知属性、简写属性覆盖详细属性等常见错误；
- **国内移动端兼容**：放宽并支持小程序的 `rpx` 等自定义单位；
- 不含排版 / 空白类规则（缩进、换行、分号、行长度等统一交给 Prettier）。

> 要求 `stylelint` `^16.0.0 || ^17.0.0`。

---

## 安装

```bash
npm install @huangjunsen/stylelint-config stylelint --save-dev
```

---

## 使用

在项目根目录创建 `stylelint.config.js`：

```javascript
module.exports = {
  extends: ['@huangjunsen/stylelint-config'],
};
```

或在 `package.json` 中：

```json
{
  "stylelint": {
    "extends": ["@huangjunsen/stylelint-config"]
  }
}
```

---

## stylelint 16 起的变更

stylelint 16 移除了全部**排版与空白类（stylistic）规则**，本配置同步清理，不再声明：

```text
indentation                          max-line-length
no-extra-semicolons                  no-eol-whitespace
no-missing-end-of-source-newline     value-list-comma-space-after
declaration-block-trailing-semicolon block-opening-brace-newline-after
block-opening-brace-space-after      block-opening-brace-space-before
block-closing-brace-newline-before   block-closing-brace-space-before
color-hex-case                       string-quotes
unicode-bom
```

在 stylelint 17 下继续声明这些规则会直接报 `Unknown rule ...`，因此若你的项目配置里还有它们，需要一并删除。缩进、换行、分号、引号等排版问题请交给 Prettier。

---

## 配置文件格式：新格式与旧格式

| 格式 | 文件名 | 状态 |
| --- | --- | --- |
| **新（官方推荐）** | `stylelint.config.{js,cjs,mjs,ts}` | 当前推荐位置 |
| 旧（仍支持） | `.stylelintrc`、`.stylelintrc.{js,cjs,mjs,ts,json,yaml,yml}` | 官方标注「we may remove these in the future」 |
| 旧（仍支持） | `package.json` 中的 `stylelint` 字段 | 同上 |

> ⚠️ **注意优先级倒置**：搜索顺序为
> `package.json` 的 `stylelint` 字段 → `.stylelintrc` → `.stylelintrc.{cjs,mjs,js,ts,json,yaml,yml}` → `stylelint.config.{cjs,mjs,js,ts}`。
>
> 即 **`.stylelintrc.*` 会遮蔽 `stylelint.config.*`**。两者同时存在时只有前者生效，建议项目内只保留一种。

---

## 与 `encode-fe-lint` 的协作方式

`encode-fe-lint` 按以下优先级确定 stylelint 配置：

1. 项目存在 `.stylelintrc.*`、`stylelint.config.{js,cjs,mjs,ts}`，或 `package.json` 中有 `stylelint` 字段
   → 交由 stylelint 自行发现并加载，**不会**被内置预设覆盖；
2. 以上均无 → 使用 `@huangjunsen/stylelint-config` 作为默认配置。

当项目有自有配置时，`encode-fe-lint` 会优先使用**项目内安装的 stylelint** 执行，
以保证 `customSyntax`（Vue 项目常用的 `postcss-html`）、`plugins`、`extends` 能按项目实际情况解析。

---

## 相关包

- [`@huangjunsen/encode-fe-lint`](https://www.npmjs.com/package/@huangjunsen/encode-fe-lint) —— 一键接入与扫描的 CLI
- [`@huangjunsen/eslint-config`](https://www.npmjs.com/package/@huangjunsen/eslint-config)
- [`@huangjunsen/prettier-config`](https://www.npmjs.com/package/@huangjunsen/prettier-config)
- [`@huangjunsen/markdownlint-config`](https://www.npmjs.com/package/@huangjunsen/markdownlint-config)
- [`@huangjunsen/commitlint-config`](https://www.npmjs.com/package/@huangjunsen/commitlint-config)

## 文档

完整说明见 [项目文档](https://huangjunsen0406.github.io/js-encode-fe-spec/packages/stylelint-config.html)。
