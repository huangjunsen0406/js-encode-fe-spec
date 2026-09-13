import path from 'path';
import fs from 'fs-extra';
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
 * 解析 gitignore 风格的 ignore 文件内容
 *
 * - 跳过空行与 `#` 注释
 * - 跳过 `!` 反选行（fast-glob 的 ignore 不支持反选，且反选只会放宽内置默认值）
 * - `/dist` → `dist`，`dist/` → `dist`
 * - 同时产出 `pattern` 与 `pattern/**`，兼顾文件与目录两种写法
 */
function parseIgnoreContent(content: string): string[] {
  const patterns: string[] = [];

  content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#') && !line.startsWith('!'))
    .map((line) => line.replace(/^\//, '').replace(/\/+$/, ''))
    .filter(Boolean)
    .forEach((line) => {
      patterns.push(line, `${line}/**`);
    });

  return patterns;
}

/**
 * 读取项目根目录下的 ignore 文件，与内置默认忽略规则合并
 *
 * 各 lint 引擎的 Node API 均不会自行读取 ignore 文件（只有各自的 CLI 会），
 * 而本项目 init 会生成这些文件，必须在此显式读取，否则用户自定义的忽略规则会失效。
 *
 * @param cwd 项目根目录
 * @param filename 如 `.markdownlintignore`
 * @param defaults 内置默认忽略规则
 */
export function resolveIgnorePatterns(cwd: string, filename: string, defaults: string[]): string[] {
  const filePath = path.resolve(cwd, filename);
  if (!fs.existsSync(filePath)) return defaults;

  const patterns = parseIgnoreContent(fs.readFileSync(filePath, 'utf8'));
  return patterns.length > 0 ? [...defaults, ...patterns] : defaults;
}

/**
 * 生成待扫描文件的 glob pattern（相对 cwd）
 *
 * 注意：仅有单个扩展名时不能使用 `{ext}` 大括号形式，
 * fast-glob / micromatch 对单元素大括号会匹配不到任何文件（`**\/*.{md}` 恒为空）。
 */
export function getFilePattern(cwd: string, include: string | undefined, ext: string[]): string {
  const prefix = normalizeInclude(cwd, include);
  const extensions = ext.map((item) => item.replace(/^\./, ''));
  const suffix = extensions.length === 1 ? `*.${extensions[0]}` : `*.{${extensions.join(',')}}`;

  return path.join(prefix, `**/${suffix}`);
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
