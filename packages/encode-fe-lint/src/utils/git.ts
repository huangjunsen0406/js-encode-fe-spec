import { execa, type Options } from 'execa';

/**
 * execa 选项（文本模式）
 *
 * execa 10 的 Options 是按 `encoding` 区分的「文本 | 二进制」联合类型，
 * 直接透传会让 stdout/stderr 退化为 `Uint8Array` 等联合类型。
 * git 命令的输出始终是文本，这里排除二进制编码模式。
 */
type BinaryEncoding = 'buffer' | 'hex' | 'base64' | 'base64url' | 'latin1' | 'ascii';
type TextOptions = Exclude<Options, { encoding: BinaryEncoding }>;

/**
 * 获取此次 commit 修改的文件列表
 * @param options
 */
export const getCommitFiles = async (options: TextOptions = {}): Promise<string[]> => {
  try {
    const { stdout } = await execa(
      'git',
      [
        'diff',
        '--staged', // 比较 暂缓区 与 last commit 的差别
        '--diff-filter=ACMR', // 只显示 added、copied、modified、renamed
        '--name-only', // 只显示更改文件的名称
        '--ignore-submodules',
      ],
      {
        ...options,
        all: true,
        cwd: options.cwd || process.cwd(),
        encoding: 'utf8',
      },
    );

    // stdout 配置为 'inherit' 等时不再是字符串，此处做一次守卫
    return typeof stdout === 'string' && stdout ? stdout.split(/\s/).filter(Boolean) : [];
  } catch (e) {
    return [];
  }
};

/**
 * 获取未 add 的修改文件数量
 * @param options
 */
export const getAmendFiles = async (options: TextOptions = {}): Promise<string> => {
  try {
    const { stdout } = await execa(
      'git',
      [
        'diff', // 比较 工作区 与 暂缓区的差别
        '--name-only',
      ],
      {
        ...options,
        all: true,
        cwd: options.cwd || process.cwd(),
        encoding: 'utf8',
      },
    );

    // stdout 配置为 'inherit' 等时不再是字符串，此处做一次守卫
    return typeof stdout === 'string' ? stdout : '';
  } catch (e) {
    return '';
  }
};
