import { ESLint } from 'eslint';
import fs from 'fs-extra';
import { globSync } from 'glob';
import path from 'path';
import type { Config, PKG, ScanOptions } from '../../types';
import { ESLINT_FILE_EXT, ESLINT_IGNORE_PATTERN } from '../../utils/constants';
import { getESLintConfigType } from './getESLintConfigType';

/**
 * 将 extends 条目解析为绝对路径
 *
 * eslintrc 解析共享配置时以「被扫描项目的 cwd」为基准，而内置回退路径发生在
 * 项目尚未安装任何依赖的场景，按包名无法解析。因此这里统一解析为本包依赖的绝对路径。
 */
const resolveExtendPath = (name: string): string => {
  // 相对路径与 eslint 内置写法保持原样
  if (name.startsWith('.') || name.startsWith('eslint:') || name.startsWith('plugin:')) {
    return name;
  }
  // 无后缀的包名（如 prettier）补齐为 eslint-config- 前缀的形式
  const request = name.startsWith('@') || name.includes('/') ? name : `eslint-config-${name}`;
  // 兜底：部分配置包不导出 `/index` 子路径，去掉后重试
  const candidates = [request, request.replace(/\/index$/, '')];

  for (const candidate of candidates) {
    try {
      return require.resolve(candidate);
    } catch (e) {
      // 尝试下一个候选
    }
  }

  return name;
};

/**
 * 获取 ESLint 配置
 */
export function getESLintConfig(opts: ScanOptions, pkg: PKG, config: Config): ESLint.Options {
  const { cwd, fix, ignore } = opts;
  const lintConfig: ESLint.Options = {
    cwd,
    fix,
    ignore,
    extensions: ESLINT_FILE_EXT,
    errorOnUnmatchedPattern: false,
    resolvePluginsRelativeTo: cwd,
  };

  if (config.eslintOptions) {
    // 若用户传入了 eslintOptions，则用用户的
    Object.assign(lintConfig, config.eslintOptions);
  } else {
    // 根据扫描目录下有无lintrc文件，若无则使用默认的 lint 配置
    const lintConfigFiles = globSync('.eslintrc?(.@(js|yaml|yml|json))', { cwd });
    if (lintConfigFiles.length === 0 && !pkg.eslintConfig) {
      lintConfig.resolvePluginsRelativeTo = path.resolve(__dirname, '../../');
      lintConfig.useEslintrc = false;
      lintConfig.baseConfig = {
        extends: [
          resolveExtendPath(getESLintConfigType(cwd, pkg)),
          //  ESLint 不再管格式问题，直接使用 Prettier 进行格式化
          //  与 actions/scan 保持一致：未显式关闭即视为启用
          ...(config.enablePrettier !== false ? [resolveExtendPath('prettier')] : []),
        ],
      };
    }

    // 根据扫描目录下有无 lintignore 文件，若无则使用默认的 ignore 配置
    // ESLint 的 ESLint 类已移除 ignorePattern 选项，需通过 overrideConfig.ignorePatterns 传入
    const lintIgnoreFile = path.resolve(cwd, '.eslintignore');
    if (!fs.existsSync(lintIgnoreFile) && !pkg.eslintIgnore) {
      lintConfig.overrideConfig = {
        ...(lintConfig.overrideConfig as Record<string, any>),
        ignorePatterns: ESLINT_IGNORE_PATTERN,
      };
    }
  }

  return lintConfig;
}
