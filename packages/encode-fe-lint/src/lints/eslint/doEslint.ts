import { ESLint } from 'eslint';
import fg from 'fast-glob';
import fs from 'fs-extra';
import { extname, join } from 'path';
import { Config, PKG, ScanOptions } from '../../types';
import { ESLINT_FILE_EXT, ESLINT_IGNORE_PATTERN } from '../../utils/constants';
import { formatESLintResults } from './formatESLintResults';
import { getESLintConfig } from './getESLintConfig';

export interface DoESLintOptions extends ScanOptions {
  pkg: PKG;
  config?: Config;
}

export async function doESLint(options: DoESLintOptions) {
  let files: string[];
  if (options.files) {
    files = options.files.filter((name) => ESLINT_FILE_EXT.includes(extname(name)));
  } else {
    files = await fg(`**/*.{${ESLINT_FILE_EXT.map((t) => t.replace(/^\./, '')).join(',')}}`, {
      cwd: options.cwd,
      ignore: ESLINT_IGNORE_PATTERN,
    });
  }

  // 检测是否存在 Flat Config 配置文件 (eslint.config.*)
  const hasFlatConfig = [
    'eslint.config.js',
    'eslint.config.mjs',
    'eslint.config.cjs',
    'eslint.config.ts',
  ].some((file) => fs.existsSync(join(options.cwd, file)));

  // 若项目存在 Flat Config，允许 ESLint 自动解析本地扁平配置；否则回退至传统的 Legacy 配置初始化
  const eslintConfig = hasFlatConfig
    ? {
        fix: options.fix,
        cwd: options.cwd,
      }
    : getESLintConfig(options, options.pkg, options.config);

  const eslint = new ESLint(eslintConfig as any);
  const reports = await eslint.lintFiles(files);
  if (options.fix) {
    await ESLint.outputFixes(reports);
  }

  return formatESLintResults(reports, options.quiet, eslint);
}
