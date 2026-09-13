# 常见问题排查

接入 `encode-fe-lint` 后遇到的典型问题与处理方式。

---

## 1. 扫描结果里全是 `Parsing error`

**现象**：`scan` 输出大量 `Parsing error: The keyword 'import' is reserved`、`Unexpected token <`、`Unexpected token module` 等报错，几乎覆盖所有 `.ts` / `.vue` / `.d.ts` 文件。

**原因**：项目中使用的是 Flat Config（`eslint.config.*`），但 ESLint 没有加载它，导致退回默认的 espree 解析器（ES5 + script 模式），所有 ESM / TS / Vue 语法都无法解析。

**处理**：

1. 将 `@huangjunsen/eslint-config` 升级到 `>=1.0.3`，其中包含可用的 Flat Config 预设；
2. 将 `@huangjunsen/encode-fe-lint` 升级到 `>=1.0.12`，该版本会在检测到 `eslint.config.*` 时自动启用 FlatESLint；
3. 确认 `eslint.config.mjs` 的入口与项目类型匹配（见 [ESLint 规则配置](/packages/eslint-config)）。

> 自 `1.0.12` 起，CLI 会优先探测项目根目录的 `eslint.config.js/mjs/cjs/ts`，存在时交由 ESLint 自行加载扁平配置，否则继续使用传统的 `.eslintrc.*` 初始化逻辑。

---

## 2. `fix` 时报 `Cannot find module 'xxx/prettier-config'` 并中断

**现象**：

```text
Error: Cannot find module '@sxzz/prettier-config'
    at Object.transform (.../prettier/index.js)
```

**原因**：早期版本在生成待处理文件列表时使用了绝对路径，导致 `fast-glob` 的 `ignore` 规则失效，把 `node_modules` 中第三方依赖的 `README.md` / 配置一并纳入格式化范围。这些依赖的 `package.json` 里可能声明了未安装的 `prettier` 配置包，从而触发模块解析失败并中断整个进程。

**处理**：升级 `@huangjunsen/encode-fe-lint` 到 `>=1.0.12`。

该版本做了三处修复：

- 待扫描路径统一归一化为「相对 cwd」，保证 ignore 规则正常生效；
- `node_modules` 忽略规则调整为 `**/node_modules/**`，覆盖 monorepo 中的嵌套依赖目录；
- 单个文件的格式化失败不再中断整体流程，而是作为异常统一上报。

---

## 3. 样式文件报 `Unknown rule xxx`

**现象**：stylelint 输出 `Unknown rule indentation`、`Unknown rule max-line-length` 之类的错误。

**原因**：项目配置里声明了 stylelint **16 起已移除**的排版与空白类（stylistic）规则。

stylelint 16 把全部排版规则移交给了 Prettier，下列规则已不存在：

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

**处理**：从项目配置中删除上述规则，缩进、换行、分号、引号等排版问题交给 Prettier。

若报的是其他规则名，则可能是 `encode-fe-lint` 内置 stylelint 版本低于配置所引用的
`stylelint-config-standard`，升级 `@huangjunsen/encode-fe-lint` 即可（`>=1.0.18` 内置 stylelint 17）。

---

## 4. 格式化后出现 `Parsing error: Unexpected token. Did you mean {''>''}`

**现象**：`.vue` 文件中使用了泛型写法，`fix` 之后扫描突然报解析错误，位置指向箭头函数的 `=>`。

```text
91:25  error  Parsing error: Unexpected token. Did you mean `{'>'}` or `&gt;`?
```

**原因**：Vue 单文件组件中，泛型箭头函数必须写成 `<T,>(...)` 这种带尾逗号的形式，用于和 JSX 标签区分。

早期版本内置 Prettier 2.x，它在处理 `.vue` 文件时会把 `<T,>` 规范化为 `<T>`，于是代码变成了：

```typescript
// 修复前（可正常解析）
const buildList = <T,>(list: T[]) => list;
// 被 Prettier 2 改写后（被当成 JSX 标签，解析失败）
const buildList = <T>(list: T[]) => list;
```

**处理**：升级 `@huangjunsen/encode-fe-lint` 到 `>=1.0.14`（内置 Prettier 3.x，会保留 `<T,>`）。

---

## 5. 扫描时把第三方打包产物也算了进来

**现象**：报告中出现大量来自 `node_modules` 之外的压缩 / 打包文件的告警，例如 vendored 进源码目录的 UMD 产物。

**原因**：这类文件是构建产物，不应对其做规范检查。

**处理**：升级 `@huangjunsen/encode-fe-lint` 到 `>=1.0.14`（默认忽略已包含 `**/*.umd.js`）。

对于其他约定俗成的产物路径（如 `**/vendor/**`），请在项目根目录的 `.eslintignore` 中自行补充。

---

## 6. 项目原有的 prettier / stylelint 配置疑似失效

两个工具都存在「新旧两种文件名」并存时的**优先级倒置**问题，且顺序并不直观：

**Prettier**（实测 `prettier@3.9.6`）：

```text
package.json 的 prettier 字段
  → .prettierrc / .prettierrc.json / .yaml / .yml / .json5 / .toml
    → .prettierrc.js / .mjs / .cjs / .ts / .cts / .mts
      → prettier.config.js / .mjs / .cjs / .ts / .cts / .mts
```

即 **`.prettierrc.js` 会遮蔽 `prettier.config.js`**。

**Stylelint**（来自 stylelint 自带 CLI 帮助文本）：

```text
package.json 的 stylelint 字段
  → .stylelintrc
    → .stylelintrc.{cjs,mjs,js,ts,json,yaml,yml}
      → stylelint.config.{cjs,mjs,js,ts}
```

即 **`.stylelintrc.*` 会遮蔽 `stylelint.config.*`**——虽然官方文档推荐的是后者。

**处理建议**：项目内只保留一种配置文件。若希望使用规范包提供的配置，删除项目自有配置后重新执行 `encode-fe-lint init`。
`encode-fe-lint` 自 `1.0.16` 起默认**不再删除、不再覆盖**项目已有的配置文件，只在日志中提示。

---

## 7. 扫描耗时过长

排查顺序：

1. 确认 `node_modules`、`dist`、`build` 等产物目录已被忽略（检查 `.eslintignore` 与项目根目录的 ignore 配置）；
2. 使用 `encode-fe-lint scan --include src` 缩小扫描范围；
3. 若项目为 monorepo，留意子包目录下的 `node_modules` 是否被正确排除。
