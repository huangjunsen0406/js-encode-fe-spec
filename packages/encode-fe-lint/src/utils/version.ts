import { OWN_DEPENDENCIES, PKG_NAME, PKG_VERSION } from './constants';

export interface SpecPackage {
  name: string;
  version: string;
}

/**
 * 比较两个 x.y.z 版本号
 * @param a 版本号
 * @param b 版本号
 * @returns a 大于 b 返回 1，相等返回 0，a 小于 b 返回 -1
 */
export const compareVersion = (a: string, b: string): number => {
  const partsA = String(a).split('.').map((n) => parseInt(n, 10) || 0);
  const partsB = String(b).split('.').map((n) => parseInt(n, 10) || 0);
  const len = Math.max(partsA.length, partsB.length);

  for (let i = 0; i < len; i++) {
    const numA = partsA[i] ?? 0;
    const numB = partsB[i] ?? 0;
    if (numA !== numB) return numA > numB ? 1 : -1;
  }

  return 0;
};

/**
 * 生成「带版本号」的依赖安装描述符
 *
 * init 安装依赖时若不指定版本，最终解析结果就完全交给包管理器的供应链策略：
 * pnpm 11 默认 minimumReleaseAge 为 24 小时，会把刚发布的版本判定为「过新」
 * 而回退到历史版本（实测 @huangjunsen/encode-fe-lint 从 1.0.21 退到 1.0.6，
 * 其余规范包退到 2024 年的 1.0.0），本次升级修好的问题会全部复现。
 * 因此这里始终显式带上与当前 CLI 配套的版本范围。
 * @param name 包名
 * @param manifest 依赖清单，默认为本包自身的 dependencies
 * @param self 本包信息
 */
export const resolveSpecDependency = (
  name: string,
  manifest: Record<string, string> = OWN_DEPENDENCIES,
  self: SpecPackage = { name: PKG_NAME, version: PKG_VERSION },
): string => {
  // 本工具自身：与当前运行的版本保持一致，避免 CLI 把自己降级
  if (name === self.name) return `${name}@^${self.version}`;

  const range = manifest[name];

  // 未声明的依赖（如社区预设）或本地开发时的 workspace 协议：不限定版本
  if (!range || range.startsWith('workspace:')) return name;

  return `${name}@${range}`;
};
