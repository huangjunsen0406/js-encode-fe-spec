# @huangjunsen/stylelint-config

CSS、SCSS、Less 样式代码的共享质量检查规范。

---

## 包含规范

- 继承自标准的 `stylelint-config-standard` 与 `stylelint-config-standard-scss`；
- 禁止选择器重复与未知的属性；
- 避免属性简写覆盖详细属性；
- **国内移动端兼容**：放宽并支持小程序的 `rpx` 等自定义单位。

---

## 使用方式

在项目根目录创建 `.stylelintrc.js`：

```javascript
module.exports = {
  extends: ['@huangjunsen/stylelint-config'],
};
```
