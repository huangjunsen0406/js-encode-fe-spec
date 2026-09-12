# @huangjunsen/prettier-config

团队统一的代码格式化基准规范，保持整个团队代码风格高度一致。

---

## 规则预设

```javascript
module.exports = {
  printWidth: 100,       // 单行最大字符数 100
  tabWidth: 2,           // 缩进 2 个空格
  semi: true,            // 结尾保留分号
  singleQuote: true,     // 使用单引号
  trailingComma: 'all',  // 多行时始终加上末尾逗号
  arrowParens: 'always', // 箭头函数参数始终保留括号
  bracketSpacing: true,  // 对象字面量大括号两侧空格
  endOfLine: 'lf',       // 统一换行符为 LF
};
```

---

## 使用方式

在你的项目根目录创建 `.prettierrc.js`：

```javascript
module.exports = {
  ...require('@huangjunsen/prettier-config'),
};
```
