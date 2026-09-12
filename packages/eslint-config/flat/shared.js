/**
 * 共享依赖加载器（Flat Config 内部使用）
 *
 * 统一在此处加载 TypeScript / Prettier 相关依赖，保证各 flat 预设行为一致。
 */

/**
 * 统一转成数组，兼容插件导出的 flat 配置可能为对象或数组
 */
function toArray(config) {
  if (!config) return [];
  return Array.isArray(config) ? config : [config];
}

/**
 * 关闭所有与 Prettier 冲突的格式化规则
 */
function prettierOverrides() {
  try {
    return toArray(require('eslint-config-prettier/flat'));
  } catch (e) {
    try {
      return toArray(require('eslint-config-prettier'));
    } catch (err) {
      return [];
    }
  }
}

module.exports = { toArray, prettierOverrides };
