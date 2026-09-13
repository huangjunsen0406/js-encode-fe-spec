# @huangjunsen/encode-fe-lint

前端编码规范工程化脚手架。为项目提供 **一键接入、一键扫描、一键修复、一键升级**，并配置 Git commit 卡点，降低落地规范的成本。

内置四套检查引擎：**ESLint**、**stylelint**、**markdownlint**、**Prettier**。

> 环境要求：**Node.js >= 22.12.0**（依赖的 `@commitlint/cli`、`stylelint`、`glob` 等已不再支持更低版本）

---

## 安装

```bash
# 作为项目依赖（推荐，可锁定版本）
npm install @huangjunsen/encode-fe-lint --save-dev

# 或全局安装
npm install -g @huangjunsen/encode-fe-lint
```

---

## 快速开始

```bash
# 1. 在项目根目录执行，按提示选择要接入的规范
npx encode-fe-lint init

# 2. 扫描
npx encode-fe-lint scan

# 3. 自动修复可修复的问题
npx encode-fe-lint fix
```

---

## 命令说明

| 命令 | 说明 |
| --- | --- |
| `init` | 一键接入：初始化规范工具与配置文件，写入 npm scripts 与 Git 卡点 |
| `scan` | 一键扫描：对项目做代码规范问题扫描 |
| `fix` | 一键修复：自动修复可自动修复的规范问题 |
| `exec` | 调用内置的 lint 工具，参数原样透传 |
| `commit-msg-scan` | 检查 commit message（由 Git `commit-msg` 钩子调用） |
| `commit-file-scan` | 检查本次提交的代码（由 Git `pre-commit` 钩子调用） |
| `update` | 更新 `encode-fe-lint` 自身到最新版本 |

### init

```bash
encode-fe-lint init            # 交互式选择项目类型与要启用的规范
encode-fe-lint init --vscode   # 仅基于已有 encode-fe-lint.config.js 写入 .vscode/settings.json
```

执行后会：

- 生成对应工具的配置文件（`eslint.config.mjs`、`stylelint.config.js`、`.markdownlint.json`、`prettier.config.js` 等）；
- 在 `package.json` 中写入 `encode-fe-lint-scan`、`encode-fe-lint-fix` 两个 scripts；
- 写入 `husky.hooks` 的 `pre-commit` 与 `commit-msg` 卡点。

> **不会覆盖项目已有的同类配置。** 若项目已存在 `.prettierrc.js`、`stylelint.config.js`、`.eslintrc.js` 等任一形式，
> 该工具会跳过对应配置的生成并给出提示，避免因优先级差异导致项目配置被静默遮蔽。

### scan / fix

```bash
encode-fe-lint scan                 # 扫描整个项目
encode-fe-lint scan -q              # 仅报告 error
encode-fe-lint scan -i src          # 只扫描指定目录
encode-fe-lint scan -o              # 输出扫描报告文件
encode-fe-lint scan --no-ignore     # 忽略项目的 ignore 配置

encode-fe-lint fix -i src           # 只修复指定目录
```

| 选项 | 说明 |
| --- | --- |
| `-q, --quiet` | 仅报告 error 信息 |
| `-o, --output-report` | 输出扫描出的规范问题日志（仅 `scan`） |
| `-i, --include <dirpath>` | 指定要扫描 / 修复的目录 |
| `--no-ignore` | 忽略项目的 ignore 配置文件和 ignore 规则 |

### commit-file-scan

```bash
encode-fe-lint commit-file-scan          # 仅对 error 卡口（默认）
encode-fe-lint commit-file-scan --strict # 对 warn 和 error 都卡口
```

### exec

直接调用内置的 lint 工具，参数原样透传。适合在 npm scripts 中固定工具版本，
或临时用某个工具排查问题：

```bash
encode-fe-lint exec eslint src            # 等价于 npx eslint src
encode-fe-lint exec eslint --fix src      # 所有参数都会原样透传
encode-fe-lint exec stylelint "src/**/*.scss"
encode-fe-lint exec prettier --check .
encode-fe-lint exec commitlint --from HEAD~1
encode-fe-lint exec --help                # 列出可用工具
```

可用工具：`eslint`、`stylelint`、`prettier`、`commitlint`、`markdownlint`。

- **优先使用项目内安装的版本**，项目未安装时才回退到本包内置的版本；
  `markdownlint` 的命令行由 `markdownlint-cli` 提供，需要项目自行安装（`npm i -D markdownlint-cli`）。
- 工具的退出码会原样返回，可直接用于 CI 卡口。
- `exec` 只是原样转发参数，不会套用本工具的内置预设；如需使用内置预设请用 `scan` / `fix`。

---

## 配置文件

在项目根目录创建 `encode-fe-lint.config.js`，可覆盖默认行为：

```javascript
module.exports = {
  // 是否启用各检查引擎，默认全部启用
  enableESLint: true,
  enableStylelint: true,
  enableMarkdownlint: true,
  enablePrettier: true,

  // 各引擎的原始配置项，会与内置配置合并
  eslintOptions: {},
  stylelintOptions: {},
  markdownlintOptions: {},
};
```

生成的 `encode-fe-lint.config.js` 仅供 `init` 读取；`scan` / `fix` 也会自动加载它。

---

## 规则来源

`encode-fe-lint` 本身不维护规则，规则来自同仓库的共享配置包：

| 工具 | 配置包 |
| --- | --- |
| ESLint | [`@huangjunsen/eslint-config`](https://www.npmjs.com/package/@huangjunsen/eslint-config) |
| Stylelint | [`@huangjunsen/stylelint-config`](https://www.npmjs.com/package/@huangjunsen/stylelint-config) |
| markdownlint | [`@huangjunsen/markdownlint-config`](https://www.npmjs.com/package/@huangjunsen/markdownlint-config) |
| Prettier | [`@huangjunsen/prettier-config`](https://www.npmjs.com/package/@huangjunsen/prettier-config) |
| commitlint | [`@huangjunsen/commitlint-config`](https://www.npmjs.com/package/@huangjunsen/commitlint-config) |

### 配置发现的优先级

各引擎**优先使用项目自有的配置**，仅在项目没有任何配置时才回退到内置预设：

1. **ESLint**：识别 `eslint.config.*` 与 `.eslintrc.*`，自动区分 Flat Config 与旧格式；
2. **Stylelint**：识别 `stylelint.config.*`、`.stylelintrc*` 与 `package.json` 的 `stylelint` 字段；
   项目内有配置时，会优先使用项目内安装的 stylelint 执行，保证 `customSyntax`（如 `postcss-html`）、`plugins`、`extends` 按项目实际情况解析；
3. **markdownlint**：识别 `.markdownlint.*` 与 `.markdownlint-cli2.*`；
4. **Prettier**：由 Prettier 自行发现配置。

`.eslintignore` / `.stylelintignore` / `.markdownlintignore` 会被显式读取，与内置忽略规则合并生效。

---

## 使用 Node.js API

```javascript
const { init, scan, fix } = require('@huangjunsen/encode-fe-lint');

await init({
  cwd: process.cwd(),
  checkVersionUpdate: false,
  eslintType: 'index',
  enableESLint: true,
  enableStylelint: true,
  enableMarkdownlint: true,
  enablePrettier: true,
  enableFlatConfig: true,
});

const { results, errorCount, warningCount } = await scan({ cwd: process.cwd(), fix: false });
```

---

## 文档

完整说明见 [项目文档](https://huangjunsen0406.github.io/js-encode-fe-spec/)。
