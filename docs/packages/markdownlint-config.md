# @huangjunsen/markdownlint-config

团队文档、开发手册与 README 的 Markdown 排版与格式检查规范。

---

## 优化规则说明

- **`ul-style`**：无序列表统一样式为短横线 `-`；
- **`line-length: false`**：关闭单行最大字数限制，避免长句子或超链接报错；
- **`no-inline-html: false`**：允许在 Markdown 中合理使用 HTML 标签（如居中容器、徽章图片）；
- **专有名词大小写约束**：内置了 `JavaScript`、`HTML`、`CSS`、`Babel`、`TypeScript` 等标准大小写字典。

---

## 使用方式

在项目根目录创建 `.markdownlint.json`：

```json
{
  "extends": "@huangjunsen/markdownlint-config"
}
```
