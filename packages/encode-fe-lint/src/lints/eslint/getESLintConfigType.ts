import { globSync } from 'glob';
import type { PKG } from '../../types';

/** 共享配置包名 */
export const ESLINT_CONFIG_PKG = '@huangjunsen/eslint-config';

/**
 * 获取 ESLint 配置类型
 *
 * 返回值必须与 @huangjunsen/eslint-config 的 exports 子路径一一对应：
 * `.`、`/typescript`、`/react`、`/vue`、`/node` 及其组合。
 * 特别地，基础入口就是包名本身，不存在 `/index` 子路径（旧实现在无 dsl / 无 language
 * 时会拼出 `/index`、`typescript/index`，导致 ESLint 报 Failed to load config）。
 *
 * @param cwd
 * @param pkg
 * @returns @huangjunsen/eslint-config 及其子路径
 */
export function getESLintConfigType(cwd: string, pkg: PKG): string {
  const tsFiles = globSync('./!(node_modules)/**/*.@(ts|tsx)', { cwd });
  const reactFiles = globSync('./!(node_modules)/**/*.@(jsx|tsx)', { cwd });
  const vueFiles = globSync('./!(node_modules)/**/*.vue', { cwd });
  const dependencies = Object.keys(pkg.dependencies || {});
  const language = tsFiles.length > 0 ? 'typescript' : '';
  let dsl = '';

  // dsl判断
  if (reactFiles.length > 0 || dependencies.some((name) => /^react(-|$)/.test(name))) {
    dsl = 'react';
  } else if (vueFiles.length > 0 || dependencies.some((name) => /^vue(-|$)/.test(name))) {
    dsl = 'vue';
  }

  const subpath = [language, dsl].filter(Boolean).join('/');

  return subpath ? `${ESLINT_CONFIG_PKG}/${subpath}` : ESLINT_CONFIG_PKG;
}
