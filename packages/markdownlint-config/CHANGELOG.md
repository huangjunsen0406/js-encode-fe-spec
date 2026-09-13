# @huangjunsen/markdownlint-config

## 1.0.3

### Patch Changes

- 修复 `no-duplicate-heading` 的规则名：配置中使用的旧别名 `no-duplicate-header` 在 markdownlint 0.36 中已失效，导致「允许不同章节下出现同名子标题」实际未生效
- 补齐完整的版本变更记录，并将 CHANGELOG 纳入发布内容

## 1.0.2

### Patch Changes

- 重写 README：补齐规范内容说明、专有名词表与 `encode-fe-lint` 协作方式

## 1.0.1

### Patch Changes

- 声明发布文件（`files`）与 `markdownlint` peerDependencies（可选）

## 1.0.0

### Minor Changes

- 首个版本：以 `markdownlint` 的 `default: true` 为基线，统一无序列表符号、禁止行尾空格与空列表项、要求围栏代码块声明语言，并内置常见前端专有名词表
