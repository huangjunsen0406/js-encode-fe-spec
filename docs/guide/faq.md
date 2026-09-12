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

```
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

**现象**：stylelint 输出 `Unknown rule selector-anb-no-unmatchable` 之类的错误。

**原因**：`encode-fe-lint` 内置的 stylelint 版本低于 `@huangjunsen/stylelint-config` 所引用的 `stylelint-config-standard`。

**处理**：升级 `@huangjunsen/encode-fe-lint` 到 `>=1.0.13`（内置 stylelint 15）。

---

## 4. 项目原有的 prettier / stylelint 配置疑似失效

`prettier.config.js` 与 `stylelint.config.js` 的解析优先级**低于** `.prettierrc.js` 与 `.stylelintrc.js`。当项目同时存在两者时，后者的规则会生效。

`encode-fe-lint init` 会把这两类同名文件列为「与工具冲突的配置」并在覆盖前给出提示（`>=1.0.13`）。若你希望保留项目原有配置，请在初始化完成后删除工具生成的 `.prettierrc.js` / `.stylelintrc.js`。

---

## 5. 扫描耗时过长

排查顺序：

1. 确认 `node_modules`、`dist`、`build` 等产物目录已被忽略（检查 `.eslintignore` 与项目根目录的 ignore 配置）；
2. 使用 `encode-fe-lint scan --include src` 缩小扫描范围；
3. 若项目为 monorepo，留意子包目录下的 `node_modules` 是否被正确排除。
