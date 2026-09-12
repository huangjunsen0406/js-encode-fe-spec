import path from 'path';
import fg from 'fast-glob';

/**
 * 将扫描目录归一化为「相对 cwd」的 glob 前缀
 *
 * fast-glob 的 ignore 规则始终按相对 cwd 的路径匹配：
 * 若 pattern 使用绝对路径，返回结果也会是绝对路径，ignore 将完全失效，
 * 从而把 node_modules 中的第三方依赖一并扫描（会导致 Prettier 崩溃、扫描耗时暴涨）。
 *
 * @param cwd 扫描目录
 * @param include 用户指定的扫描目录，可为绝对路径或相对路径
 */
export function normalizeInclude(cwd: string, include?: string): string {
  const target = include && include.trim() ? include : cwd;

  if (!path.isAbsolute(target)) return target;

  const relative = path.relative(cwd, target);
  return relative || '.';
}

/**
 * 生成待扫描文件的 glob pattern（相对 cwd）
 */
export function getFilePattern(cwd: string, include: string | undefined, ext: string[]): string {
  const prefix = normalizeInclude(cwd, include);
  const extensions = ext.map((item) => item.replace(/^\./, '')).join(',');

  return path.join(prefix, `**/*.{${extensions}}`);
}

/**
 * 扫描符合扩展名要求的文件，返回相对 cwd 的文件路径
 */
export async function globFiles(
  cwd: string,
  include: string | undefined,
  ext: string[],
  ignore: string[],
): Promise<string[]> {
  return fg(getFilePattern(cwd, include, ext), {
    cwd,
    ignore,
    dot: false,
    onlyFiles: true,
  });
}
