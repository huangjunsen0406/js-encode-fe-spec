# @huangjunsen/stylelint-config

## 1.0.4

### Patch Changes

- 补齐完整的版本变更记录，并将 CHANGELOG 纳入发布内容

## 1.0.3

### Minor Changes

- 升级至 stylelint 17：`stylelint-config-standard` 34 → 40、`stylelint-config-standard-scss` 11 → 17、`stylelint-scss` 5 → 7
- `peerDependencies` 放宽为 `^16.0.0 || ^17.0.0`

### Patch Changes

- 移除 stylelint 16 起已删除的排版与空白类规则（`indentation`、`max-line-length`、`no-extra-semicolons`、`block-*-brace-*`、`declaration-block-trailing-semicolon`、`value-list-comma-space-after` 等），避免 `Unknown rule` 报错
- 测试运行器改用 Jest 30 + `--experimental-vm-modules` 以加载纯 ESM 的 stylelint
- 新增配置有效性测试，断言规则均存在且未声明已移除的排版规则
- 重写 README

## 1.0.2

### Patch Changes

- 补充 `stylelint` peerDependencies 与发布文件声明

## 1.0.1

### Patch Changes

- 修复脚手架场景下缺少 `configBasedir` 导致的 `extends` 解析失败

## 1.0.0

### Minor Changes

- 首个版本：继承 `stylelint-config-standard` 与 `stylelint-config-standard-scss`，并放宽支持小程序的 `rpx` 等自定义单位
