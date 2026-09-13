import path from 'path';
import markdownLint from 'markdownlint';
import markdownLintConfig from '@huangjunsen/markdownlint-config';
import fs from 'fs-extra';
import type { ScanOptions, PKG, Config } from '../../types';

type LintOptions = markdownLint.Options & { fix?: boolean };

/**
 * markdownlint 配置文件，按官方优先级排列
 * @link https://github.com/DavidAnson/markdownlint-cli2#configuration
 */
const MARKDOWNLINT_CONFIG_FILES: string[] = [
  '.markdownlint.jsonc',
  '.markdownlint.json',
  '.markdownlint.yaml',
  '.markdownlint.yml',
  '.markdownlint.cjs',
  '.markdownlint.mjs',
  '.markdownlint-cli2.jsonc',
  '.markdownlint-cli2.yaml',
  '.markdownlint-cli2.cjs',
  '.markdownlint-cli2.mjs',
];

/**
 * 读取 .cjs / .mjs 形式的 markdownlint 配置
 *
 * - .markdownlint.cjs / .markdownlint.mjs 直接导出 markdownlint config 对象
 * - .markdownlint-cli2.* 导出的是 cli2 的选项对象，规则位于其 config 字段
 */
function resolveModuleConfig(filePath: string): Record<string, any> {
  const loaded = require(filePath);
  const exported = loaded && loaded.__esModule ? loaded.default : loaded;
  const resolved = typeof exported === 'function' ? exported() : exported;
  if (resolved && typeof resolved === 'object' && 'config' in resolved) {
    return resolved.config || {};
  }
  return resolved || {};
}

/**
 * 获取 Markdownlint 配置
 */
export function getMarkdownlintConfig(
  opts: ScanOptions,
  pkg: PKG,
  config: Config = {},
): LintOptions {
  const { cwd } = opts;
  const lintConfig: LintOptions = {
    fix: Boolean(opts.fix),
    resultVersion: 3,
  };

  if (config.markdownlintOptions) {
    // 若用户传入了 markdownlintOptions，则用用户的
    Object.assign(lintConfig, config.markdownlintOptions);
  } else {
    // 与官方一致的优先级：
    // .markdownlint.* 单独描述规则，优先级高于 .markdownlint-cli2.*（后者把规则放在 config 字段）
    const configFile = MARKDOWNLINT_CONFIG_FILES.map((name) => path.resolve(cwd, name)).find(
      (filePath) => fs.existsSync(filePath),
    );

    if (!configFile) {
      // 内置配置来自 JSON 文件，其字面量类型会被推断为宽泛的 string，
      // 与 markdownlint 的联合字面量类型不兼容，此处按配置对象断言
      lintConfig.config = markdownLintConfig as markdownLint.Configuration;
    } else if (/\.(cjs|mjs)$/.test(configFile)) {
      // .cjs / .mjs 由模块导出，需自行 require；cli2 形式下规则位于 config 字段
      lintConfig.config = resolveModuleConfig(configFile) as markdownLint.Configuration;
    } else {
      lintConfig.config = markdownLint.readConfigSync(configFile);
    }
  }

  return lintConfig;
}
