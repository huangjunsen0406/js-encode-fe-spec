# 快速开始

`@huangjunsen/encode-fe-lint` 是前端编码规范工程化的一体化配套脚手架。提供对项目编码规范的**一键接入**、**一键扫描**、**一键修复**与**版本升级**。

---

## 1. 全局安装 CLI

你可以全局安装脚手架，在任意前端工程中快速使用：

```bash
npm install @huangjunsen/encode-fe-lint -g
# 或使用 pnpm
pnpm add @huangjunsen/encode-fe-lint -g
```

---

## 2. 一键初始化项目

进入你的前端项目根目录，运行：

```bash
encode-fe-lint init
```

执行后将自动启动交互式向导：
1. **选择项目框架与语言**：支持纯 JavaScript/TypeScript、React、Vue、Node.js，或接入外部社区预设（如 `@antfu/eslint-config`）；
2. **选择样式检查（Stylelint）**：是否对 CSS/SCSS/Less 进行样式规范检查；
3. **选择文档检查（Markdownlint）**：是否开启 Markdown 文档格式规范；
4. **选择代码格式化（Prettier）**：是否启用团队一致的 Prettier 排版规范；
5. **配置 Git 提交卡点与 cz-git 交互**：自动在 `package.json` 配置 commitizen 适配器，并设置 `pre-commit` 与 `commit-msg` 钩子。

---

## 3. 代码检查与一键修复

脚手架提供了开箱即用的扫描与修复指令：

```bash
# 检查当前项目代码规范（输出汇总报告）
encode-fe-lint scan

# 一键自动修复可修复的格式与语法问题
encode-fe-lint fix
```

初始化时脚手架也会自动向 `package.json` 注入快捷脚本：

```json
{
  "scripts": {
    "encode-fe-lint-scan": "encode-fe-lint scan",
    "encode-fe-lint-fix": "encode-fe-lint fix"
  }
}
```

---

## 4. 直接调用内置工具（exec）

需要单独使用某个 lint 工具时，用 `exec` 直接调起，参数会原样透传：

```bash
encode-fe-lint exec eslint --fix src
encode-fe-lint exec stylelint "src/**/*.scss"
encode-fe-lint exec prettier --check .
encode-fe-lint exec commitlint --from HEAD~1
```

可用工具：`eslint`、`stylelint`、`prettier`、`commitlint`、`markdownlint`。
**优先使用项目内安装的版本**，未安装时才回退到内置版本；退出码原样返回，可直接用于 CI 卡口。

> 与 `scan` / `fix` 的区别：`scan` / `fix` 会套用本工具的内置预设并汇总报告，
> `exec` 只是原样转发参数，完全按项目自身的配置执行。

---

## 5. 规范式 Git 提交（cz-git）

项目初始化后，已配置好 `cz-git` 交互式提示。在项目根目录下运行：

```bash
pnpm commit
# 或 npx cz
```

即可调出全中文带 Emoji 的交互式提交菜单（支持 `feat`、`fix`、`docs` 等类型导航）。
