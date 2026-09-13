import { createRequire } from 'module';
import path from 'path';
import fs from 'fs-extra';

/**
 * 可被 `exec` 调用的工具
 *
 * `bin` 为包内可执行文件在 package.json 中的键名，用于读取 `bin` 字段。
 * markdownlint 的 CLI 由独立的 markdownlint-cli 提供（markdownlint 包本身
 * 只是库，没有 bin 字段），因此需要分别声明包名。
 */
export interface ExecTool {
  // 命令行中输入的名称
  name: string;
  // 提供 CLI 的 npm 包名
  pkg: string;
  // package.json 中 bin 字段的键名
  bin: string;
  // 未找到时的提示语
  hint?: string;
}

export const EXEC_TOOLS: ExecTool[] = [
  { name: 'eslint', pkg: 'eslint', bin: 'eslint' },
  { name: 'stylelint', pkg: 'stylelint', bin: 'stylelint' },
  { name: 'prettier', pkg: 'prettier', bin: 'prettier' },
  { name: 'commitlint', pkg: '@commitlint/cli', bin: 'commitlint' },
  {
    name: 'markdownlint',
    pkg: 'markdownlint-cli',
    bin: 'markdownlint',
    hint: 'markdownlint 的命令行由 markdownlint-cli 提供，请先在项目中安装：npm i -D markdownlint-cli',
  },
];

export const EXEC_TOOL_NAMES: string[] = EXEC_TOOLS.map((tool) => tool.name);

/**
 * 读取包的 bin 字段得到可执行文件绝对路径
 */
const readBinPath = (pkgJsonPath: string, pkgName: string, binName: string): string | undefined => {
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
    const bin = typeof pkg.bin === 'string' ? pkg.bin : (pkg.bin || {})[binName];

    return bin ? path.resolve(path.dirname(pkgJsonPath), bin) : undefined;
  } catch (e) {
    return undefined;
  }
};

/**
 * 解析某个 tool 的可执行文件路径
 *
 * 优先读取 package.json 的 bin 字段（最准确）；部分包在 exports 中
 * 未导出 package.json（如 markdownlint），此时退化为从主入口向上查找包目录。
 *
 * @param req 用于解析的 require，传入项目维度的 require 可优先命中项目内的版本
 * @param pkgName 包名
 * @param binName bin 字段的键名
 */
const resolveByRequire = (
  req: NodeRequire,
  pkgName: string,
  binName: string,
): string | undefined => {
  try {
    const pkgJsonPath = req.resolve(`${pkgName}/package.json`);
    const binPath = readBinPath(pkgJsonPath, pkgName, binName);
    if (binPath && fs.existsSync(binPath)) return binPath;
  } catch (e) {
    // 该包未导出 package.json，走下面的兜底逻辑
  }

  try {
    const entry = req.resolve(pkgName);
    let dir = path.dirname(entry);

    // 从主入口所在目录向上找到包根目录
    while (dir !== path.dirname(dir)) {
      const pkgJsonPath = path.join(dir, 'package.json');
      if (fs.existsSync(pkgJsonPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
        if (pkg.name === pkgName) {
          const binPath = readBinPath(pkgJsonPath, pkgName, binName);
          return binPath && fs.existsSync(binPath) ? binPath : undefined;
        }
      }
      dir = path.dirname(dir);
    }
  } catch (e) {
    // 未安装
  }

  return undefined;
};

/**
 * 解析待执行的工具入口
 *
 * 顺序与 ESLint / stylelint 保持一致：**优先使用项目内安装的版本**，
 * 这样项目自行升级工具版本或插件后能立即生效；项目未安装时才回退到本包内置的版本。
 *
 * @param tool exec 的目标工具
 * @param cwd 项目根目录
 * @returns 可执行文件绝对路径，未找到时返回 undefined
 */
export function resolveToolEntry(tool: ExecTool, cwd: string): string | undefined {
  // createRequire 需要一个路径占位，文件不必真实存在
  const projectRequire = createRequire(path.join(cwd, '__encode_fe_lint__.js'));

  return resolveByRequire(projectRequire, tool.pkg, tool.bin) || resolveByRequire(require, tool.pkg, tool.bin);
}

/**
 * 按名称查找工具定义
 */
export function findTool(name: string): ExecTool | undefined {
  return EXEC_TOOLS.find((tool) => tool.name === name);
}
