# @huangjunsen/encode-fe-lint

## 1.0.21

### Patch Changes

- 补齐完整的版本变更记录，并将 CHANGELOG 纳入发布内容

## 1.0.20

### Patch Changes

- 修复直接调用引擎（Node API）且未传 `config` 时的 `TypeError`：`config` 是可选字段，此前会直接读取 `config.eslintOptions`
- 修复 ESLint 结果的 `ruleId` 为 `null`、stylelint 结果的 `source` 为 `undefined` 时的取值问题
- 开启 TypeScript `strict`，使编译器与编辑器判定保持一致

## 1.0.19

### Minor Changes

- 新增 `exec` 命令：可直接调用内置的 eslint / stylelint / prettier / commitlint / markdownlint，参数与退出码原样透传，优先使用项目内安装的版本

### Patch Changes

- 修复 markdownlint 自动修复恒抛 `TypeError`：`applyFixes` 由 `markdownlint` 导出，`markdownlint-rule-helpers` 自 0.2x 起已不再提供
- 修复无样式文件时 stylelint 退化为扫描整个项目、把 `README.md` 当作 CSS 解析的问题
- 修复内置 `extends` 拼出不存在的 `/index`、`typescript/index` 子路径导致的 `Failed to load config`
- Flat Config 下不再生成已废弃的 `.eslintignore`，忽略规则改写入 `eslint.config.mjs` 的 `ignores` 字段
- Flat Config 扫描时关闭 `warnIgnored`，消除被项目 `ignores` 命中文件产生的噪音告警
- 移除已失效的依赖 `markdownlint-rule-helpers`

## 1.0.18

### Minor Changes

- 升级 stylelint 至 17，并解锁全部纯 ESM 依赖：chalk 6、ora 9、execa 10、strip-ansi 7、is-docker 4、terminal-link 5（基于 Node 22.12+ 的 `require(esm)`，无需迁移 ESM）
- 项目存在自有 stylelint 配置时改用项目内安装的 stylelint 执行，修复 `customSyntax`（如 `postcss-html`）解析失败

### Patch Changes

- TypeScript 升级至 5.9 并切换 `nodenext` 模块解析

## 1.0.17

### Minor Changes

- 依赖升级至当前大版本：commitlint 21、commander 14、glob 13、inquirer 12、markdownlint 0.36、@typescript-eslint 8、eslint-plugin-vue 10、Prettier 3 等
- glob 阶段改为读取项目自身的 `.markdownlintignore` 与 `.stylelintignore`

### Patch Changes

- 修复单扩展名 glob 模式恒为空导致的 markdownlint 引擎从未检查任何文件
- 修复 `extends` 按包名在项目目录解析失败、ignore 指向 EJS 模板文件的问题
- 统一 `enablePrettier` 的默认值判定，与 `scan` 行为保持一致
- 移除 `husky`、`stylelint-scss` 等未使用依赖

## 1.0.16

### Patch Changes

- `init` 默认不再删除、不再覆盖项目已有的配置文件，仅在日志中提示

## 1.0.15

### Patch Changes

- 修复项目自有 `stylelint.config.js` 被内置预设静默覆盖的问题
- 修复内置 stylelint 配置的 `configBasedir` 指向错误导致 `extends` 解析失败

## 1.0.14

### Patch Changes

- Vue3 + TS 场景下调优内置规则，消除无法自动修复的格式类噪音
- 内置 Prettier 升级至 3.x，修复其将 `.vue` 中的 `<T,>` 改写为 `<T>` 导致的解析错误

## 1.0.13

### Patch Changes

- 对齐内置 stylelint 版本，并补全配置冲突检测

## 1.0.12

### Patch Changes

- 修复 Flat Config 未生效的问题（ESLint 8 需使用 `FlatESLint`）
- 修复待扫描路径使用绝对路径导致忽略规则失效、误扫 `node_modules` 的问题
- `node_modules` 忽略规则调整为 `**/node_modules/**`，覆盖 monorepo 中的嵌套依赖
- 将 `eslint.config.*` 纳入配置冲突检测

## 1.0.11

### Patch Changes

- 补齐 `@huangjunsen/eslint-config` 所需的核心插件依赖，并注入 `resolvePluginsRelativeTo`

## 1.0.10

### Patch Changes

- 恢复以 semver 范围声明内部依赖，确保发布产物可正常安装

## 1.0.9

### Patch Changes

- 修复脚手架缺少 `eslint-config-prettier` 依赖的问题

## 1.0.8

### Patch Changes

- 修复 `init` 未自动安装规范依赖、stylelint 缺少 `configBasedir` 的问题

## 1.0.7

### Minor Changes

- 支持 ESLint Flat Config（`eslint.config.mjs`）
- 支持 cz-git 交互式提交，新增 `@huangjunsen/prettier-config` 与第三方预设接入
- 适配 husky 9，移除废弃脚本

## 1.0.6

### Patch Changes

- 修复 `encode-fe-lint fix` 执行异常

## 1.0.5

### Patch Changes

- 恢复 `commitlint -E HUSKY_GIT_PARAMS` 的调用方式

## 1.0.4

### Patch Changes

- 修复 `commit-msg-scan` 报错

## 1.0.3

### Patch Changes

- 内部调整与版本发布

## 1.0.2

### Patch Changes

- 修复 bin 引导错误

## 1.0.1

### Patch Changes

- 补充 CHANGELOG 与包元信息

## 1.0.0

### Minor Changes

- 首个版本：提供 `init` / `scan` / `fix` / `commit-msg-scan` / `commit-file-scan` / `update` 命令
