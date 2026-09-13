import path from 'path';
import fs from 'fs-extra';
import _ from 'lodash';
import { globSync } from 'glob';
import ejs from 'ejs';
import {
  ESLINT_IGNORE_PATTERN,
  STYLELINT_FILE_EXT,
  STYLELINT_IGNORE_PATTERN,
  MARKDOWN_LINT_IGNORE_PATTERN,
  PKG_NAME,
} from './constants';

/**
 * 始终由本工具管理、可安全覆盖的文件
 */
const TOOL_OWNED_FILES: string[] = [
  '.vscode/settings.json',
  `${PKG_NAME.split('/').pop()}.config.js`,
];

/**
 * 同类配置文件
 *
 * 作用：项目已经用其中任意一种形式描述规范时，就不再生成本工具的对应文件，
 * 否则会因优先级差异（如 .prettierrc.js 高于 prettier.config.js）导致项目配置被静默遮蔽
 */
const CONFIG_KINDS: Record<string, string[]> = {
  prettier: [
    '.prettierrc',
    '.prettierrc.json',
    '.prettierrc.json5',
    '.prettierrc.yaml',
    '.prettierrc.yml',
    '.prettierrc.toml',
    '.prettierrc.js',
    '.prettierrc.cjs',
    '.prettierrc.mjs',
    '.prettierrc.ts',
    '.prettierrc.cts',
    '.prettierrc.mts',
    'prettier.config.js',
    'prettier.config.cjs',
    'prettier.config.mjs',
    'prettier.config.ts',
    'prettier.config.cts',
    'prettier.config.mts',
  ],
  stylelint: [
    '.stylelintrc',
    '.stylelintrc.json',
    '.stylelintrc.yaml',
    '.stylelintrc.yml',
    '.stylelintrc.js',
    '.stylelintrc.cjs',
    '.stylelintrc.mjs',
    'stylelint.config.js',
    'stylelint.config.cjs',
    'stylelint.config.mjs',
    'stylelint.config.ts',
  ],
  eslint: [
    '.eslintrc',
    '.eslintrc.json',
    '.eslintrc.yaml',
    '.eslintrc.yml',
    '.eslintrc.js',
    '.eslintrc.cjs',
    'eslint.config.js',
    'eslint.config.cjs',
    'eslint.config.mjs',
    'eslint.config.ts',
    'eslint.config.cts',
    'eslint.config.mts',
  ],
  markdownlint: [
    '.markdownlint.json',
    '.markdownlint.jsonc',
    '.markdownlint.yaml',
    '.markdownlint.yml',
    '.markdownlint.cjs',
    '.markdownlint.mjs',
    '.markdownlint-cli2.jsonc',
    '.markdownlint-cli2.yaml',
    '.markdownlint-cli2.cjs',
    '.markdownlint-cli2.mjs',
  ],
  commitlint: [
    '.commitlintrc',
    '.commitlintrc.json',
    '.commitlintrc.yaml',
    '.commitlintrc.yml',
    '.commitlintrc.js',
    '.commitlintrc.cjs',
    '.commitlintrc.mjs',
    '.commitlintrc.ts',
    '.commitlintrc.cts',
    '.commitlintrc.mts',
    'commitlint.config.js',
    'commitlint.config.cjs',
    'commitlint.config.mjs',
    'commitlint.config.ts',
    'commitlint.config.cts',
    'commitlint.config.mts',
  ],
  editorconfig: ['.editorconfig'],
  eslintignore: ['.eslintignore'],
  stylelintignore: ['.stylelintignore'],
  markdownlintignore: ['.markdownlintignore'],
};

/**
 * 模板文件与配置种类的对应关系
 */
const TEMPLATE_KINDS: Record<string, string> = {
  '_prettierrc.js.ejs': 'prettier',
  '_stylelintrc.js.ejs': 'stylelint',
  'eslint.config.mjs.ejs': 'eslint',
  '_eslintrc.js.ejs': 'eslint',
  '_markdownlint.json.ejs': 'markdownlint',
  'commitlint.config.js.ejs': 'commitlint',
  '_editorconfig.ejs': 'editorconfig',
  '_eslintignore.ejs': 'eslintignore',
  '_stylelintignore.ejs': 'stylelintignore',
  '_markdownlintignore.ejs': 'markdownlintignore',
};

/**
 * 判断配置文件是否由本工具生成
 */
const isOwnConfig = (filepath: string): boolean => {
  try {
    return fs.readFileSync(filepath, 'utf8').includes('@huangjunsen/');
  } catch (e) {
    return false;
  }
};

/**
 * 查找项目自有的全部同类配置（排除本工具生成的）
 */
const findUserConfigs = (cwd: string, kind: string): string[] => {
  const patterns = CONFIG_KINDS[kind];
  if (!patterns) return [];

  return patterns.filter(
    (name) => fs.existsSync(path.resolve(cwd, name)) && !isOwnConfig(path.resolve(cwd, name)),
  );
};

/**
 * 查找项目自有的同类配置
 *
 * 若找到的文件全部由本工具生成（仅含规范包引用），则视为可安全覆盖，返回 undefined
 * @returns 因项目自有而被保留的文件名，无则返回 undefined
 */
const findUserConfig = (cwd: string, kind: string): string | undefined =>
  findUserConfigs(cwd, kind)[0];

/**
 * vscode 配置合并
 * @param filepath
 * @param content
 */
const mergeVSCodeConfig = (filepath: string, content: string) => {
  // 不需要 merge
  if (!fs.existsSync(filepath)) return content;

  try {
    const targetData = fs.readJSONSync(filepath);
    const sourceData = JSON.parse(content);
    return JSON.stringify(
      _.mergeWith(targetData, sourceData, (target, source) => {
        if (Array.isArray(target) && Array.isArray(source)) {
          return [...new Set(source.concat(target))];
        }
      }),
      null,
      2,
    );
  } catch (e) {
    return '';
  }
};

export interface GenerateTemplateOptions {
  // 仅生成 vscode 配置
  vscode?: boolean;
  // 是否覆盖已存在的配置文件（默认 false，保留项目原有配置）
  overwrite?: boolean;
}

export interface GenerateTemplateResult {
  // 因项目已有而被保留的配置文件
  preserved: string[];
  // 覆盖模式下被清理的同类配置
  removed: string[];
}

/**
 * 实例化模板
 * @param cwd
 * @param data
 * @param options
 */
export default (
  cwd: string,
  data: Record<string, any>,
  options: GenerateTemplateOptions = {},
): GenerateTemplateResult => {
  const { vscode = false, overwrite = false } = options;
  const preserved: string[] = [];
  const removed: string[] = [];
  const templatePath = path.resolve(__dirname, '../config');
  const templates = globSync(`${vscode ? '_vscode' : '**'}/*.ejs`, { cwd: templatePath });
  for (const name of templates) {
    const relativePath = name.replace(/\.ejs$/, '').replace(/^_/, '.');
    const filepath = path.resolve(cwd, relativePath);
    let content = ejs.render(fs.readFileSync(path.resolve(templatePath, name), 'utf8'), {
      eslintIgnores: ESLINT_IGNORE_PATTERN,
      stylelintExt: STYLELINT_FILE_EXT,
      stylelintIgnores: STYLELINT_IGNORE_PATTERN,
      markdownLintIgnores: MARKDOWN_LINT_IGNORE_PATTERN,
      ...data,
    });

    // 若未启用 Flat Config，则不生成 eslint.config.mjs
    if (name === 'eslint.config.mjs.ejs' && !data.enableFlatConfig) {
      continue;
    }
    // 若启用了 Flat Config，则不生成传统 .eslintrc.js
    if (name === '_eslintrc.js.ejs' && data.enableFlatConfig) {
      continue;
    }

    // 合并 vscode config
    if (/^_vscode/.test(name)) {
      content = mergeVSCodeConfig(filepath, content);
    }

    // 跳过空文件
    if (!content.trim()) continue;

    const kind = TEMPLATE_KINDS[name];

    if (!overwrite && !TOOL_OWNED_FILES.includes(relativePath)) {
      // 项目已用其他形式描述同类规范 → 保留项目配置
      if (kind && findUserConfig(cwd, kind)) {
        preserved.push(findUserConfig(cwd, kind) as string);
        continue;
      }
      // 同名文件已存在，且不是本工具生成的内容 → 保留用户内容
      // （本工具早期生成的配置允许刷新，否则模板升级后无法生效）
      if (fs.existsSync(filepath) && !isOwnConfig(filepath)) {
        preserved.push(relativePath);
        continue;
      }
    }

    // 覆盖模式：清理同类的其他形式配置，避免新旧配置并存造成规则来源混乱
    if (overwrite && kind) {
      for (const name of findUserConfigs(cwd, kind)) {
        if (name === relativePath) continue;
        fs.removeSync(path.resolve(cwd, name));
        removed.push(name);
      }
    }

    fs.outputFileSync(filepath, content, 'utf8');
  }

  return { preserved, removed };
};
