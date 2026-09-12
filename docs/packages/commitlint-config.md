# @huangjunsen/commitlint-config

团队统一的 Git 提交信息（Commit Message）校验配置与 `cz-git` 交互式提交引导。

---

## 特性

- **严格遵循 Conventional Commits 规范**：对 Git 提交信息进行类型（type）、作用域（scope）与描述长度约束；
- **内置 `cz-git` 全中文交互式提示**：自动集成 Emoji 表情与友好的终端多选引导；
- **免二次配置**：与 Commitizen 深度打通。

---

## 接入方式

### 1. 配置 Commitlint
在项目根目录创建 `commitlint.config.js`：

```javascript
module.exports = {
  extends: ['@huangjunsen/commitlint-config'],
};
```

### 2. 配置交互式提交（cz-git）
在 `package.json` 中配置：

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

现在只需在终端执行：
```bash
pnpm commit
# 或 git cz
```
即可唤起交互式提交面板！
