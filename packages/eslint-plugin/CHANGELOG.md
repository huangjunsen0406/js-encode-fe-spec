# @huangjunsen/eslint-plugin

## 1.0.6

### Patch Changes

- 补齐完整的版本变更记录，并将 CHANGELOG 纳入发布内容

## 1.0.5

### Patch Changes

- 补上 `@types/eslint`：此前 `eslint` 无类型声明，规则实现中的 `context` 全部退化为 `any`，规则代码没有类型保护
- 开启 TypeScript `strict`

## 1.0.4

### Patch Changes

- 重写 README：改为新包名，补齐 Flat Config 与 legacy 双用法及全部规则选项说明
- `homepage` 与 `repository` 指向新的文档站点与仓库地址
- 修正版本号为 `1.0.4`（`1.0.3` 在 registry 上被记为 staged 状态，未提升为 latest）

## 1.0.3

### Patch Changes

- 补充 `eslint` peerDependencies，并将 `dist/` 与 README 声明为发布内容

## 1.0.2

### Patch Changes

- 清理重构遗留代码：删除根目录的 `rules/*.js`、`index.js`、`configs/recommended.js`，统一以 `src/` 为唯一源码入口
- 版本号改为从 `package.json` 读取，避免与发布版本脱节
- 移除 `fs-extra`、`require-all` 等未使用依赖
- 测试改为消费 `dist/` 产物，Jest 升级至 30

## 1.0.1

### Minor Changes

- 支持 ESLint Flat Config，提供 `recommended` 与 `legacy-recommended` 预设
- 使用 TypeScript 重构，源码迁移至 `src/`

## 1.0.0

### Minor Changes

- 首个版本：提供 `no-http-url`、`no-secret-info`、`no-broad-semantic-versioning`、`no-js-in-ts-project` 四条规则
