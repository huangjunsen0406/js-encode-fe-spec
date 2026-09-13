# @huangjunsen/stylelint-config

CSS、SCSS、Less 样式代码的共享质量检查规范。

---

## 包含规范

- 继承自标准的 `stylelint-config-standard` 与 `stylelint-config-standard-scss`；
- 禁止选择器重复与未知的属性；
- 避免属性简写覆盖详细属性；
- **国内移动端兼容**：放宽并支持小程序的 `rpx` 等自定义单位；
- 不含排版与空白类规则（缩进、换行、分号、行长度等统一交给 Prettier）。

> 要求 `stylelint` `^16.0.0 || ^17.0.0`。

---

## stylelint 16 起：排版规则已移除

stylelint 16 把全部**排版与空白类（stylistic）规则**移交给了 Prettier，本配置已同步清理，不再声明：

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

在 stylelint 17 下继续声明这些规则会直接报 `Unknown rule ...`。若项目配置里还留着它们，需要一并删除。

---

## 使用方式

在项目根目录创建 `stylelint.config.js`：

```javascript
module.exports = {
  extends: ['@huangjunsen/stylelint-config'],
};
```

### 配置文件位置：新格式与旧格式

| 格式 | 文件名 | 状态 |
| --- | --- | --- |
| **新（官方推荐）** | `stylelint.config.{js,cjs,mjs,ts}` | 当前推荐位置 |
| 旧（仍支持） | `.stylelintrc`、`.stylelintrc.{js,cjs,mjs,ts,json,yaml,yml}` | 官方明确标注「we may remove these in the future」 |
| 旧（仍支持） | `package.json` 中的 `stylelint` 字段 | 同上 |

> ⚠️ **注意优先级倒置**：根据 stylelint 自带的 CLI 帮助文本，搜索顺序为
> `package.json` 的 `stylelint` 字段 → `.stylelintrc` → `.stylelintrc.{cjs,mjs,js,ts,json,yaml,yml}` → `stylelint.config.{cjs,mjs,js,ts}`。
>
> 也就是说 **`.stylelintrc.*` 会遮蔽 `stylelint.config.*`**。两者同时存在时只有前者生效，
> 建议项目内只保留一种。

### 与 `encode-fe-lint` 的协作方式

`encode-fe-lint` 按以下优先级确定 stylelint 配置：

1. 项目中存在 `.stylelintrc.*`、`stylelint.config.{js,cjs,mjs,ts}`，或 `package.json` 中有 `stylelint` 字段
   → 交由 stylelint 自行发现并加载，**不会**被内置预设覆盖；
2. 以上均无 → 使用 `@huangjunsen/stylelint-config` 作为默认配置。

当项目有自有配置时，`encode-fe-lint` 会优先使用**项目内安装的 stylelint** 执行。
因为 stylelint 16 起，配置里裸模块名形式的 `customSyntax`（Vue 项目常用的 `postcss-html`）
是从 stylelint 自身所在位置解析的，而不是从项目目录解析 —— 用本包内置的 stylelint
会找不到项目里安装的这些模块，从而报
`Cannot resolve custom syntax module "postcss-html"`。

> 自 `encode-fe-lint@1.0.18` 起支持该行为。
> 此前版本请确保项目内也安装了 stylelint，或把 `customSyntax` 改为 `require.resolve(...)` 的绝对路径。
>
> 自 `encode-fe-lint@1.0.15` 起支持 `stylelint.config.js`。
> 在此之前，项目自带该文件时会被内置预设静默覆盖，导致项目配置失效。
