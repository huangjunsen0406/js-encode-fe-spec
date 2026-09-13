import { ESLint } from 'eslint';
import fs from 'fs-extra';
import { extname, join } from 'path';
import { Config, PKG, ScanOptions } from '../../types';
import { ESLINT_FILE_EXT, ESLINT_IGNORE_PATTERN } from '../../utils/constants';
import { globFiles } from '../../utils/glob';
import { formatESLintResults } from './formatESLintResults';
import { getESLintConfig } from './getESLintConfig';

export interface DoESLintOptions extends ScanOptions {
  pkg: PKG;
  config?: Config;
}

/**
 * ESLint Flat Config 的配置文件
 */
const FLAT_CONFIG_FILES: string[] = [
  'eslint.config.js',
  'eslint.config.mjs',
  'eslint.config.cjs',
  'eslint.config.ts',
];

type ESLintConstructor = (new (options?: any) => ESLint) & {
  outputFixes: (results: ESLint.LintResult[]) => Promise<void>;
};

/**
 * 获取 ESLint 类
 *
 * - ESLint 8.x：Flat Config 需使用 `eslint/use-at-your-own-risk` 中导出的 FlatESLint
 * - ESLint 9+：ESLint 类本身就是 Flat Config 实现
 */
export function getESLintClass(useFlatConfig: boolean): ESLintConstructor {
  if (useFlatConfig) {
    try {
      const risky: any = require('eslint/use-at-your-own-risk');
      if (risky && typeof risky.FlatESLint === 'function') {
        return risky.FlatESLint as ESLintConstructor;
      }
    } catch (e) {
      // ESLint 9+ 已无该入口，直接使用 ESLint 类即可
    }
  }

  return ESLint as unknown as ESLintConstructor;
}

export async function doESLint(options: DoESLintOptions) {
  let files: string[];
  if (options.files) {
    files = options.files.filter((name) => ESLINT_FILE_EXT.includes(extname(name)));
  } else {
    files = await globFiles(options.cwd, options.include, ESLINT_FILE_EXT, ESLINT_IGNORE_PATTERN);
  }

  // 检测是否存在 Flat Config 配置文件 (eslint.config.*)
  const hasFlatConfig: boolean = FLAT_CONFIG_FILES.some((file) =>
    fs.existsSync(join(options.cwd, file)),
  );
  const ESLintClass = getESLintClass(hasFlatConfig);

  // 若项目存在 Flat Config，交给 ESLint 自动解析本地扁平配置；否则回退至传统的 Legacy 配置初始化
  const eslintConfig = hasFlatConfig
    ? {
        fix: options.fix,
        cwd: options.cwd,
        // 扫描时按扩展名枚举文件，被项目 ignores 命中的文件会逐个产生
        // "File ignored because of a matching ignore pattern" 警告，
        // 但「被项目配置忽略」本属预期，不应作为问题上报
        warnIgnored: false,
      }
    : getESLintConfig(options, options.pkg, options.config);

  const eslint = new ESLintClass(eslintConfig as any);
  const reports = await eslint.lintFiles(files);
  if (options.fix) {
    await ESLintClass.outputFixes(reports);
  }

  return formatESLintResults(reports, options.quiet, eslint);
}
