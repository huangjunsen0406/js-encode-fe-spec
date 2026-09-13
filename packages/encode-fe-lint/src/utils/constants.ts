import path from 'path';
import fs from 'fs-extra';

// 读取 package.json
const pkg: Record<string, any> = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../package.json'), 'utf8'),
);

export enum UNICODE {
  success = '\u2714', // ✔
  failure = '\u2716', // ✖
}

/**
 * 包名
 */
export const PKG_NAME: string = pkg.name;

/**
 * 包版本号
 */
export const PKG_VERSION: string = pkg.version;

/**
 * 本包自身声明的依赖版本范围
 *
 * 发布时 pnpm 会把 workspace:^ 替换为真实范围（如 ^1.0.8），
 * 因此用户项目里读到的就是可直接安装的版本范围。
 */
export const OWN_DEPENDENCIES: Record<string, string> = pkg.dependencies || {};

/**
 * 项目类型
 */
export const PROJECT_TYPES: Array<{ name: string; value: string }> = [
  {
    name: '未使用 React、Vue、Node.js 的项目（JavaScript）',
    value: 'index',
  },
  {
    name: '未使用 React、Vue、Node.js 的项目（TypeScript）',
    value: 'typescript',
  },
  {
    name: 'React 项目（JavaScript）',
    value: 'react',
  },
  {
    name: 'React 项目（TypeScript）',
    value: 'typescript/react',
  },
  {
    name: 'Vue 项目（JavaScript）',
    value: 'vue',
  },
  {
    name: 'Vue 项目（TypeScript）',
    value: 'typescript/vue',
  },
  {
    name: 'Node.js 项目（JavaScript）',
    value: 'node',
  },
  {
    name: 'Node.js 项目（TypeScript）',
    value: 'typescript/node',
  },
  {
    name: '使用 ES5 及之前版本 JavaScript 的老项目',
    value: 'es5',
  },
  {
    name: '使用自定义/社区预设（如 @antfu/eslint-config 等）',
    value: 'custom',
  },
];

/**
 * eslint 扫描文件扩展名
 */
export const ESLINT_FILE_EXT: string[] = ['.js', '.jsx', '.ts', '.tsx', '.vue'];

/**
 * eslint 扫描忽略的文件或文件目录
 * 需要同步到 config/.eslintignore.ejs
 */
export const ESLINT_IGNORE_PATTERN: string[] = [
  // 使用 **/ 前缀，避免 monorepo 中子包的 node_modules 被扫描
  '**/node_modules/**',
  'build',
  'dist',
  'coverage',
  'es',
  'lib',
  '**/*.min.js',
  '**/*-min.js',
  '**/*.bundle.js',
  // UMD 打包产物（常被 vendored 进源码目录）
  '**/*.umd.js',
];

/**
 * stylelint 扫描文件扩展名
 *
 * 含 .vue：Vue 单文件组件的 <style> 同样是待规范的样式代码。
 * 其解析依赖 @huangjunsen/stylelint-config 内置的 postcss-html override。
 */
export const STYLELINT_FILE_EXT: string[] = ['.css', '.scss', '.less', '.acss', '.vue'];

/**
 * stylelint 扫描忽略的文件或文件目录
 */
export const STYLELINT_IGNORE_PATTERN: string[] = [
  '**/node_modules/**',
  'build/**',
  'dist/**',
  'coverage/**',
  'es/**',
  'lib/**',
  '**/*.min.css',
  '**/*-min.css',
  '**/*.bundle.css',
];

/**
 * markdownLint 扫描文件扩展名
 */
export const MARKDOWN_LINT_FILE_EXT: string[] = ['.md'];

/**
 * markdownLint 扫描忽略的文件或文件目录
 */
export const MARKDOWN_LINT_IGNORE_PATTERN: string[] = [
  '**/node_modules/**',
  'build/**',
  'dist/**',
  'coverage/**',
  'es/**',
  'lib/**',
];

/**
 * Prettier 扫描文件扩展名
 */
export const PRETTIER_FILE_EXT = [
  ...STYLELINT_FILE_EXT,
  ...ESLINT_FILE_EXT,
  ...MARKDOWN_LINT_FILE_EXT,
];

/**
 * Prettier 扫描忽略的文件或文件目录
 */
export const PRETTIER_IGNORE_PATTERN: string[] = [
  '**/node_modules/**',
  'build/**/*',
  'dist/**/*',
  'lib/**/*',
  'es/**/*',
  'coverage/**/*',
];
