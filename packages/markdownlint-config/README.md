# @huangjunsen/markdownlint-config

Markdown 文档的共享检查规范，适用于 README、文档站点与技术方案等 Markdown 文件。

---

## 安装

```bash
npm install @huangjunsen/markdownlint-config markdownlint --save-dev
```

> `markdownlint` 为可选的 peer 依赖（`>=0.25.0`）。

---

## 使用

在项目根目录创建 `.markdownlint.json`：

```json
{
  "extends": "@huangjunsen/markdownlint-config"
}
```

---

## 规范内容

配置以 `markdownlint` 的 `default: true` 为基线（即开启全部规则），再按「文档写作习惯」逐项调整。

### 收紧的规则

| 规则 | 配置 | 说明 |
| --- | --- | --- |
| `ul-style` | `dash` | 无序列表统一使用 `-` |
| `no-trailing-spaces` | `br_spaces: 0`、`list_item_empty_lines: false` | 禁止行尾空格，列表项之间不留空行也不允许用行尾空格占位 |
| `fenced-code-language` | `true` | 围栏代码块必须声明语言 |

### 放宽 / 关闭的规则

| 规则 | 配置 | 原因 |
| --- | --- | --- |
| `line-length` | `false` | 中文文档按字符数限制行长意义不大 |
| `list-marker-space` | `false` | 与 Prettier 的列表输出保持一致 |
| `no-inline-html` | `false` | 允许 Badge、`<details>` 等内联 HTML |
| `no-duplicate-heading` | `false` | 允许不同章节下出现同名子标题（如 CHANGELOG 中各版本的「Patch Changes」） |
| `proper-names.code_blocks` | `false` | 不检查代码块内的专有名词大小写 |

> ⚠️ **规则名使用的是新别名**。`markdownlint` 0.36 只认 `no-duplicate-heading`，
> 旧别名 `no-duplicate-header` 会被当作无效键静默忽略，导致「关闭重复标题」实际无效。
> 若你的项目配置里用的是旧名，其对应规则仍在按默认值生效。

### `proper-names` 专有名词表

内置约 100 个前端领域的专有名词，命中错误大小写时给出提示，例如：

```text
Javascript → JavaScript      Github → GitHub
Http → HTTP                  Npm → npm
Vuejs → Vue.js               Typescript → TypeScript
```

> 💡 包名、变量名等小写专有名词容易被误报（如 `stylelint-scss` 会被要求写成 `SCSS`）。
> 用反引号包裹（`` `stylelint-scss` ``）即可跳过检查。

---

## 配置文件格式

| 格式 | 文件名 |
| --- | --- |
| 官方推荐 | `.markdownlint.{jsonc,json,yaml,yml,cjs,mjs}` |
| cli2 专用 | `.markdownlint-cli2.{jsonc,yaml,cjs,mjs}` |
| cli2 忽略 | `.markdownlint-cli2.jsonc` 中的 `ignores` 字段 |

> ⚠️ `markdownlint-cli2` **不支持** `.markdownlintrc` 与 `.markdownlintignore`。
> `encode-fe-lint` 会读取项目根目录的 `.markdownlintignore`，并与内置忽略规则合并。

---

## 与 `encode-fe-lint` 的协作方式

`encode-fe-lint` 按以下优先级确定 markdownlint 配置：

1. 项目存在 `.markdownlint.*` 或 `.markdownlint-cli2.*`
   → 加载项目配置；
2. 以上均无 → 使用 `@huangjunsen/markdownlint-config` 作为默认配置。

---

## 相关包

- [`@huangjunsen/encode-fe-lint`](https://www.npmjs.com/package/@huangjunsen/encode-fe-lint) —— 一键接入与扫描的 CLI
- [`@huangjunsen/eslint-config`](https://www.npmjs.com/package/@huangjunsen/eslint-config)
- [`@huangjunsen/stylelint-config`](https://www.npmjs.com/package/@huangjunsen/stylelint-config)
- [`@huangjunsen/prettier-config`](https://www.npmjs.com/package/@huangjunsen/prettier-config)
- [`@huangjunsen/commitlint-config`](https://www.npmjs.com/package/@huangjunsen/commitlint-config)

## 文档

完整说明见 [项目文档](https://huangjunsen0406.github.io/js-encode-fe-spec/packages/markdownlint-config.html)。
