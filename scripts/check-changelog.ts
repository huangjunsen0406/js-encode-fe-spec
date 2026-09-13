/**
 * 校验各包的 CHANGELOG 与 package.json 版本是否同步
 *
 * 背景：手工维护多包仓库时，很容易出现「改了代码、发了版，却忘了写 CHANGELOG」，
 * 导致使用者看不到变更内容。本脚本把这类遗漏变成可检测的错误。
 *
 * 校验项：
 * 1. 每个包都必须有 CHANGELOG.md
 * 2. CHANGELOG 的一级标题必须与包名一致
 * 3. CHANGELOG 必须包含 package.json 中的当前版本
 * 4. CHANGELOG 中的版本号不得重复、不得高于当前版本
 *
 * 用法：
 *   pnpm check:changelog
 */

import fs from 'fs-extra';
import path from 'path';

const ROOT = path.resolve(__dirname, '..');
const PACKAGES_DIR = path.join(ROOT, 'packages');

interface Problem {
  pkg: string;
  message: string;
}

/**
 * 解析版本号，返回可比较的数字数组
 */
const parseVersion = (version: string): number[] =>
  version.split('.').map((part) => Number.parseInt(part, 10));

/**
 * 依次比较版本号大小，a > b 返回正数，a < b 返回负数
 */
const compareVersion = (a: string, b: string): number => {
  const left = parseVersion(a);
  const right = parseVersion(b);

  for (let i = 0; i < Math.max(left.length, right.length); i++) {
    const diff = (left[i] || 0) - (right[i] || 0);
    if (diff !== 0) return diff;
  }

  return 0;
};

/**
 * 提取 CHANGELOG 中记录的版本号（## x.y.z 形式）
 */
const extractVersions = (content: string): string[] =>
  [...content.matchAll(/^##\s+(\S+)\s*$/gm)].map((match) => match[1]);

const checkPackage = (pkgName: string, pkgDir: string): Problem[] => {
  const problems: Problem[] = [];
  const pkgJsonPath = path.join(pkgDir, 'package.json');
  const changelogPath = path.join(pkgDir, 'CHANGELOG.md');

  if (!fs.existsSync(pkgJsonPath)) return problems;

  const pkg = fs.readJSONSync(pkgJsonPath);
  const { version } = pkg;

  if (!fs.existsSync(changelogPath)) {
    problems.push({ pkg: pkgName, message: '缺少 CHANGELOG.md' });
    return problems;
  }

  const content = fs.readFileSync(changelogPath, 'utf8');

  // 一级标题应与包名一致
  const titleMatch = content.match(/^#\s+(\S+)\s*$/m);
  if (!titleMatch) {
    problems.push({ pkg: pkgName, message: 'CHANGELOG 缺少一级标题' });
  } else if (titleMatch[1] !== pkg.name) {
    problems.push({
      pkg: pkgName,
      message: `CHANGELOG 标题为「${titleMatch[1]}」，与包名「${pkg.name}」不一致`,
    });
  }

  const versions = extractVersions(content);

  // 当前版本必须被记录
  if (!versions.includes(version)) {
    problems.push({
      pkg: pkgName,
      message: `CHANGELOG 未记录当前版本 ${version}（共记录 ${versions.length} 个版本）`,
    });
  }

  // 版本号不得重复
  const duplicated = versions.filter((item, index) => versions.indexOf(item) !== index);
  if (duplicated.length > 0) {
    problems.push({
      pkg: pkgName,
      message: `版本号重复：${[...new Set(duplicated)].join(', ')}`,
    });
  }

  // 不得记录高于当前版本的版本号
  const ahead = versions.filter((item) => compareVersion(item, version) > 0);
  if (ahead.length > 0) {
    problems.push({
      pkg: pkgName,
      message: `记录了高于当前版本 ${version} 的版本号：${ahead.join(', ')}`,
    });
  }

  return problems;
};

const main = (): void => {
  const packageDirs = fs
    .readdirSync(PACKAGES_DIR)
    .filter((name) => fs.existsSync(path.join(PACKAGES_DIR, name, 'package.json')));

  const problems = packageDirs.flatMap((name) => checkPackage(name, path.join(PACKAGES_DIR, name)));

  if (problems.length === 0) {
    console.log(`✓ ${packageDirs.length} 个包的 CHANGELOG 均与 package.json 版本同步`);
    return;
  }

  console.error(`✖ 发现 ${problems.length} 个 CHANGELOG 问题：\n`);
  problems.forEach(({ pkg, message }) => console.error(`  ${pkg.padEnd(22)} ${message}`));
  console.error('\n请在发版前补齐对应的 CHANGELOG 条目。');
  process.exitCode = 1;
};

main();
