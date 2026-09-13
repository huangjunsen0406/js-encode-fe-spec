import { createRequire } from 'module';
import { extname } from 'path';
import path from 'path';
import stylelint from 'stylelint';
import { PKG, ScanOptions } from '../../types';
import { STYLELINT_FILE_EXT, STYLELINT_IGNORE_PATTERN } from '../../utils/constants';
import { globFiles, resolveIgnorePatterns } from '../../utils/glob';
import { formatStylelintResults } from './formatStylelintResults';
import { getStylelintConfig, hasUserStylelintConfig } from './getStylelintConfig';

export interface DoStylelintOptions extends ScanOptions {
  pkg: PKG;
}

type StylelintApi = typeof stylelint;

/**
 * 加载项目内安装的 stylelint
 *
 * stylelint 16 起，配置里裸模块名形式的 customSyntax（Vue 项目常用的 postcss-html 等）
 * 会从 stylelint 自身所在位置解析，而不是从项目目录解析，导致本包内置的 stylelint
 * 找不到项目里安装的这些模块。
 *
 * 因此在项目存在自有 stylelint 配置时，优先使用项目内的 stylelint 执行，
 * 这样 customSyntax / plugins / extends 都能按项目实际情况解析。
 *
 * @param cwd 项目根目录
 * @returns 项目内的 stylelint，未安装或加载失败时返回 undefined
 */
function resolveProjectStylelint(cwd: string): StylelintApi | undefined {
  try {
    // createRequire 需要一个路径占位，文件不必真实存在
    const projectRequire = createRequire(path.join(cwd, '__encode_fe_lint__.js'));
    const loaded = projectRequire('stylelint');

    // stylelint 16+ 为纯 ESM：Node 的 require(esm) 可能返回模块命名空间，
    // 也可能通过 module.exports 互操作直接返回 API 对象，两种形态都兼容
    return (loaded?.default ?? loaded) as StylelintApi;
  } catch (e) {
    return undefined;
  }
}

export async function doStylelint(options: DoStylelintOptions) {
  let files: string[];
  if (options.files) {
    files = options.files.filter((name) => STYLELINT_FILE_EXT.includes(extname(name)));
  } else {
    files = await globFiles(
      options.cwd,
      options.include,
      STYLELINT_FILE_EXT,
      resolveIgnorePatterns(options.cwd, '.stylelintignore', STYLELINT_IGNORE_PATTERN),
    );
  }
  const useProjectStylelint = hasUserStylelintConfig(options.cwd, options.pkg);
  const linter: StylelintApi =
    (useProjectStylelint && resolveProjectStylelint(options.cwd)) || stylelint;

  const data = await linter.lint({
    ...getStylelintConfig(options, options.pkg, options.config),
    files,
  });
  return formatStylelintResults(data.results, options.quiet);
}
