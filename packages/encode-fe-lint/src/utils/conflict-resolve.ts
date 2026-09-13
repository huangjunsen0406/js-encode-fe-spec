import path from 'path';
import fs from 'fs-extra';
import { globSync } from 'glob';
import inquirer from 'inquirer';
import log from './log';
import { PKG_NAME } from './constants';
import type { PKG } from '../types';

// 精确移除依赖
const packageNamesToRemove = [
  '@babel/eslint-parser',
  '@commitlint/cli',
  '@iceworks/spec',
  'babel-eslint',
  'eslint',
  'husky',
  'markdownlint',
  'prettier',
  'stylelint',
  'tslint',
];

// 按前缀移除依赖
const packagePrefixesToRemove = [
  '@commitlint/',
  '@typescript-eslint/',
  'eslint-',
  'stylelint-',
  'markdownlint-',
  'commitlint-',
];

/**
 * 与规范包功能重叠、且已被本工具同名配置取代的历史格式文件
 *
 * 注意：这里**不包含** prettier.config.js / stylelint.config.js / eslint.config.*，
 * 它们是项目自有配置，本工具不会删除（除非用户明确选择覆盖）
 */
const LEGACY_CONFIG_PATTERNS: string[] = [
  '.eslintrc?(.@(yaml|yml|json))',
  '.stylelintrc?(.@(yaml|yml|json))',
  '.markdownlint@(rc|.@(yaml|yml|jsonc))',
  '.prettierrc?(.@(cjs|config.js|config.cjs|yaml|yml|json|json5|toml))',
  'tslint.@(yaml|yml|json)',
  '.kylerc?(.@(yaml|yml|json))',
];

/**
 * 始终由本工具管理、可安全覆盖的文件
 */
const TOOL_OWNED_FILES: string[] = [
  '.vscode/settings.json',
  `${PKG_NAME.split('/').pop()}.config.js`,
];

/**
 * 历史格式的配置文件
 * @param cwd
 */
const checkLegacyConfig = (cwd: string): string[] =>
  LEGACY_CONFIG_PATTERNS.reduce<string[]>(
    (list, pattern) => list.concat(globSync(pattern, { cwd })),
    [],
  );

/**
 * 本工具会生成、且项目中已存在的配置文件
 * @param cwd
 */
const checkExistingConfig = (cwd: string): string[] => {
  return globSync('**/*.ejs', { cwd: path.resolve(__dirname, '../config') })
    .map((name) => name.replace(/\.ejs$/, '').replace(/^_/, '.'))
    .filter((filename) => !TOOL_OWNED_FILES.includes(filename))
    .filter((filename) => fs.existsSync(path.resolve(cwd, filename)));
};

export interface ConflictResolveResult {
  pkg: PKG;
  // 是否覆盖项目已有配置并移除冲突依赖
  overwrite: boolean;
}

export default async (cwd: string, rewriteConfig?: boolean): Promise<ConflictResolveResult> => {
  const pkgPath = path.resolve(cwd, 'package.json');
  const pkg: PKG = fs.readJSONSync(pkgPath);
  const dependencies: string[] = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
  ];
  const willRemovePackage = dependencies.filter(
    (name) =>
      packageNamesToRemove.includes(name) ||
      packagePrefixesToRemove.some((prefix) => name.startsWith(prefix)),
  );
  const legacyConfig = checkLegacyConfig(cwd);
  const existingConfig = checkExistingConfig(cwd);
  const willChangeCount = willRemovePackage.length + legacyConfig.length + existingConfig.length;
  let overwrite = false;

  // 默认保留项目现有配置：仅提示，不删除、不覆盖
  if (willChangeCount > 0) {
    log.warn(`检测到项目中存在可能与 ${PKG_NAME} 冲突的依赖和配置：`);

    if (willRemovePackage.length > 0) {
      log.warn('与本工具功能重叠的依赖：');
      log.warn(JSON.stringify(willRemovePackage, null, 2));
    }

    if (existingConfig.length > 0) {
      log.warn('项目已有的配置文件（默认保留，不会被覆盖）：');
      log.warn(JSON.stringify(existingConfig, null, 2));
    }

    if (legacyConfig.length > 0) {
      log.warn('历史格式的配置文件（仅在覆盖模式下删除）：');
      log.warn(JSON.stringify(legacyConfig, null, 2));
    }

    if (typeof rewriteConfig === 'undefined') {
      const { isOverWrite } = await inquirer.prompt({
        type: 'confirm',
        name: 'isOverWrite',
        message: '是否改用规范包配置（覆盖上述文件并移除冲突依赖）？选择 No 将保留项目现有配置：',
        default: false,
      });

      overwrite = Boolean(isOverWrite);
    } else {
      overwrite = rewriteConfig;
    }
  }

  if (!overwrite) {
    if (willChangeCount > 0) {
      log.info('已保留项目现有配置与依赖，本次初始化不会改动它们 :D');
    }
    return { pkg, overwrite };
  }

  // 删除历史格式配置
  for (const name of legacyConfig) {
    fs.removeSync(path.resolve(cwd, name));
  }

  // 修正 package.json
  delete pkg.eslintConfig;
  delete pkg.eslintIgnore;
  delete pkg.stylelint;
  for (const name of willRemovePackage) {
    delete (pkg.dependencies || {})[name];
    delete (pkg.devDependencies || {})[name];
  }
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2), 'utf8');

  return { pkg, overwrite };
};