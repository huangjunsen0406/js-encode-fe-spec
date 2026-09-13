# @huangjunsen/commitlint-config

Git commit message 规范，基于 [Conventional Commits](https://www.conventionalcommits.org/)，并内置 **cz-git** 交互式提交配置（带 emoji 的类型选择）。

> `@commitlint/cli` 为可选 peer 依赖（`>=16.0.0`）。

---

## 安装

```bash
npm install @huangjunsen/commitlint-config @commitlint/cli cz-git --save-dev
```

---

## 使用

在项目根目录创建 `commitlint.config.js`：

```javascript
module.exports = {
  extends: ['@huangjunsen/commitlint-config'],
};
```

### 配合 husky 卡点

```json
{
  "husky": {
    "hooks": {
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
    }
  }
}
```

### 交互式提交（cz-git）

`package.json` 中加入：

```json
{
  "scripts": {
    "commit": "cz"
  },
  "config": {
    "commitizen": {
      "path": "node_modules/cz-git"
    }
  }
}
```

之后执行 `npm run commit`，即可按提示选择类型、范围并填写描述。

---

## 规范内容

### 提交类型

| 类型 | 含义 |
| --- | --- |
| `feat` | ✨ 新增功能 |
| `fix` | 🐛 修复缺陷 |
| `docs` | 📝 文档更新 |
| `style` | 💄 代码格式（不影响逻辑） |
| `refactor` | ♻️ 代码重构 |
| `perf` | ⚡️ 性能提升 |
| `test` | ✅ 测试相关 |
| `build` | 📦️ 构建流程 / 外部依赖 |
| `ci` | 🎡 持续集成配置 |
| `revert` | ⏪️ 回退提交 |
| `chore` | 🔨 其他修改 |

### 校验规则

| 规则 | 级别 | 说明 |
| --- | --- | --- |
| `type-enum` | error | 类型必须是上表枚举值之一 |
| `type-case` / `scope-case` | error | 类型与范围必须小写 |
| `type-empty` / `subject-empty` | error | 类型与描述不能为空 |
| `subject-full-stop` | error | 描述末尾不能有句号 |
| `header-max-length` | error | 首行不超过 **100** 字符 |
| **`body-max-line-length`** | error | 正文每行不超过 **100** 字符 |
| **`footer-max-line-length`** | error | footer 每行不超过 **100** 字符 |
| `body-leading-blank` | warn | 正文前需有空行 |
| `footer-leading-blank` | warn | footer 前需有空行 |
| `subject-case` | off | 描述不做大小写校验 |

> ⚠️ **正文与 footer 的行长限制按字符数计算，中文同样计入。** 写多行说明时请主动折行，
> 否则 commit 会被直接拒绝（`body's lines must not be longer than 100 characters`）。

### 提交示例

```text
feat(eslint): 支持 ESLint 9/10 的 Flat Config

- 新增 flat/vue 与 flat/typescript 入口
- 清理已废弃的格式化规则

closed #123
```

---

## 配置文件格式

| 格式 | 文件名 |
| --- | --- |
| 官方推荐 | `commitlint.config.{js,cjs,mjs,ts,cts,mts}` |
| 旧（仍支持） | `.commitlintrc`、`.commitlintrc.{json,yaml,yml,js,cjs,mjs,ts,cts,mts}` |
| 旧（仍支持） | `package.json` 中的 `commitlint` 字段 |

新旧格式均由 cosmiconfig 解析，官方均支持。

---

## 相关包

- [`@huangjunsen/encode-fe-lint`](https://www.npmjs.com/package/@huangjunsen/encode-fe-lint) —— 一键接入与扫描的 CLI
- [`@huangjunsen/eslint-config`](https://www.npmjs.com/package/@huangjunsen/eslint-config)
- [`@huangjunsen/stylelint-config`](https://www.npmjs.com/package/@huangjunsen/stylelint-config)
- [`@huangjunsen/markdownlint-config`](https://www.npmjs.com/package/@huangjunsen/markdownlint-config)
- [`@huangjunsen/prettier-config`](https://www.npmjs.com/package/@huangjunsen/prettier-config)

## 文档

完整说明见 [项目文档](https://huangjunsen0406.github.io/js-encode-fe-spec/packages/commitlint-config.html)。
