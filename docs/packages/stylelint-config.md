# @huangjunsen/stylelint-config

CSS、SCSS、Less 样式代码的共享质量检查规范。

---

## 包含规范

- 继承自标准的 `stylelint-config-standard` 与 `stylelint-config-standard-scss`；
- 禁止选择器重复与未知的属性；
- 避免属性简写覆盖详细属性；
- **国内移动端兼容**：放宽并支持小程序的 `rpx` 等自定义单位。

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

1. 项目中存在 `.stylelintrc.*`、`stylelint.config.{js,cjs,mjs}`，或 `package.json` 中有 `stylelint` 字段
   → 交由 stylelint 自行发现并加载，**不会**被内置预设覆盖；
2. 以上均无 → 使用 `@huangjunsen/stylelint-config` 作为默认配置。

> 自 `encode-fe-lint@1.0.15` 起支持 `stylelint.config.js`。
> 在此之前，项目自带该文件时会被内置预设静默覆盖，导致项目配置失效。
