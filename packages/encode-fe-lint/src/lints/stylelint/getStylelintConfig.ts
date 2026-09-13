import fs from 'fs-extra';
import { globSync } from 'glob';
import path from 'path';
import { LinterOptions } from 'stylelint';
import type { Config, PKG, ScanOptions } from '../../types';
import { STYLELINT_IGNORE_PATTERN } from '../../utils/constants';

/**
 * 项目自带的 stylelint 配置文件（stylelint 15 起支持）
 */
const USER_CONFIG_FILES: string[] = [
  'stylelint.config.js',
  'stylelint.config.cjs',
  'stylelint.config.mjs',
];

/**
 * 获取内置 stylelint 配置所在目录
 *
 * 内置配置自身通过 extends 引用了 stylelint-config-standard 等依赖，
 * 这些依赖需要以「本包目录」为基准解析，否则会报
 * Could not find "stylelint-config-standard"
 */
const getBundledConfigDir = (): string => {
  try {
    return path.dirname(require.resolve('@huangjunsen/stylelint-config'));
  } catch (e) {
    return path.resolve(__dirname, '../../..');
  }
};

/**
 * 项目是否存在自有 stylelint 配置
 *
 * stylelint.config.js 与 .stylelintrc 同属用户自有配置，同样交由 stylelint 自行发现，
 * 避免被内置配置覆盖而导致项目配置静默失效。
 */
export function hasUserStylelintConfig(cwd: string, pkg: PKG): boolean {
  const lintConfigFiles = globSync('.stylelintrc?(.@(js|yaml|yml|json))', { cwd });

  return (
    lintConfigFiles.length > 0 ||
    Boolean(pkg.stylelint) ||
    USER_CONFIG_FILES.some((file) => fs.existsSync(path.resolve(cwd, file)))
  );
}

/**
 * 获取 Stylelint 配置
 */
export function getStylelintConfig(opts: ScanOptions, pkg: PKG, config: Config = {}): LinterOptions {
  const { cwd, fix } = opts;
  if (config.enableStylelint === false) return {} as any;

  const lintConfig: any = {
    fix: Boolean(fix),
    allowEmptyInput: true,
    configBasedir: cwd,
  };

  if (config.stylelintOptions) {
    // 若用户传入了 stylelintOptions，则用用户的
    Object.assign(lintConfig, config.stylelintOptions);
  } else {
    const hasUserConfig = hasUserStylelintConfig(cwd, pkg);

    if (!hasUserConfig) {
      lintConfig.config = {
        extends: '@huangjunsen/stylelint-config',
      };
      lintConfig.configBasedir = getBundledConfigDir();
    }

    // 根据扫描目录下有无lintignore文件，若无则使用默认的 ignore 配置
    const ignoreFilePath = path.resolve(cwd, '.stylelintignore');
    if (!fs.existsSync(ignoreFilePath)) {
      lintConfig.ignorePattern = STYLELINT_IGNORE_PATTERN;
    }
  }

  return lintConfig;
}
