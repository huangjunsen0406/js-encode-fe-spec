/**
 * 引擎健壮性回归
 *
 * 覆盖几个「静默失效 / 噪音」场景：
 * - markdownlint 的自动修复（applyFixes 实际由 markdownlint 导出）
 * - 无匹配文件时 stylelint 不应退化为扫描整个项目
 * - 内置回退配置的 extends 路径必须能被解析
 */

const path = require('path');
const fs = require('fs-extra');
const { getESLintConfigType } = require('../lib/lints/eslint/getESLintConfigType');

const resolveOrError = (request) => {
  try {
    return { resolved: require.resolve(request) };
  } catch (error) {
    return { error: error.code || error.message };
  }
};

describe('getESLintConfigType 生成的 extends 路径可被解析', () => {
  const cwd = path.resolve(__dirname, './fixtures/config-type');

  beforeEach(() => {
    fs.emptyDirSync(cwd);
  });

  afterAll(() => {
    fs.removeSync(cwd);
  });

  test.each([
    ['纯 JS', {}, '@huangjunsen/eslint-config'],
    ['React', { dependencies: { react: '^18.0.0' } }, '@huangjunsen/eslint-config/react'],
    ['Vue', { dependencies: { vue: '^3.0.0' } }, '@huangjunsen/eslint-config/vue'],
  ])('%s 项目解析为 %s', (label, pkg, expected) => {
    fs.outputFileSync(path.join(cwd, 'src/index.js'), 'export const a = 1;\n');

    expect(getESLintConfigType(cwd, pkg)).toBe(expected);
  });

  test.each([
    ['TS', {}, '@huangjunsen/eslint-config/typescript'],
    ['TS + Vue', { dependencies: { vue: '^3.0.0' } }, '@huangjunsen/eslint-config/typescript/vue'],
    ['TS + React', { dependencies: { react: '^18.0.0' } }, '@huangjunsen/eslint-config/typescript/react'],
  ])('%s 项目解析为 %s', (label, pkg, expected) => {
    fs.outputFileSync(path.join(cwd, 'src/index.ts'), 'export const a = 1;\n');

    expect(getESLintConfigType(cwd, pkg)).toBe(expected);
  });

  test('全部取值都能被 require 解析（基础入口不存在 /index 子路径）', () => {
    const variants = [
      {},
      { dependencies: { vue: '^3.0.0' } },
      { dependencies: { react: '^18.0.0' } },
    ];

    fs.outputFileSync(path.join(cwd, 'src/index.js'), 'export const a = 1;\n');
    const jsVariants = variants.map((pkg) => getESLintConfigType(cwd, pkg));

    fs.removeSync(path.join(cwd, 'src/index.js'));
    fs.outputFileSync(path.join(cwd, 'src/index.ts'), 'export const a = 1;\n');
    const tsVariants = variants.map((pkg) => getESLintConfigType(cwd, pkg));

    for (const name of [...jsVariants, ...tsVariants]) {
      expect(resolveOrError(name).error).toBeUndefined();
      expect(name).not.toMatch(/\/index$/);
    }
  });
});

describe('无匹配文件时各引擎的行为', () => {
  const cwd = path.resolve(__dirname, './fixtures/empty-project');

  beforeEach(() => {
    fs.emptyDirSync(cwd);
    fs.outputJsonSync(path.join(cwd, 'package.json'), { name: 'empty', version: '1.0.0' });
    // 放一个非样式文件，验证 stylelint 不会把它当 CSS 解析
    fs.outputFileSync(path.join(cwd, 'README.md'), '# Title\n\ntext\n');
  });

  afterAll(() => {
    fs.removeSync(cwd);
  });

  test('stylelint 在无样式文件时返回空结果，而不是扫描整个项目', async () => {
    const { doStylelint } = require('../lib/lints/stylelint/doStylelint');

    const results = await doStylelint({ cwd, include: cwd, pkg: {}, config: {} });

    expect(results).toEqual([]);
  });

  test('eslint 在无源码文件时不应因内置配置解析失败而抛错', async () => {
    const { doESLint } = require('../lib/lints/eslint/doEslint');

    const results = await doESLint({ cwd, include: cwd, pkg: {}, config: {} });

    expect(Array.isArray(results)).toBe(true);
  });

  // config 是 ScanOptions 上的可选字段：直接调用引擎（不经过 actions/scan）时
  // 往往不传 config，早期实现会在 `config.eslintOptions` 处抛
  // TypeError: Cannot read properties of undefined
  test.each([
    ['eslint', () => require('../lib/lints/eslint/doEslint').doESLint],
    ['stylelint', () => require('../lib/lints/stylelint/doStylelint').doStylelint],
    ['markdownlint', () => require('../lib/lints/markdownlint/doMarkdownlint').doMarkdownlint],
  ])('%s 引擎在未传 config 时不应抛错', async (name, load) => {
    const engine = load();

    await expect(engine({ cwd, include: cwd, pkg: {} })).resolves.toBeDefined();
  });
});

describe('markdownlint 自动修复', () => {
  const cwd = path.resolve(__dirname, './fixtures/markdown-fix');

  beforeEach(() => {
    fs.emptyDirSync(cwd);
    // 多余空行（MD012）属于可自动修复的问题
    fs.outputFileSync(path.join(cwd, 'README.md'), '# Title\n\n\n\n## Second\n\ntext\n');
  });

  afterAll(() => {
    fs.removeSync(cwd);
  });

  test('fix 模式应真正改写文件（applyFixes 来自 markdownlint 而非 rule-helpers）', async () => {
    const { doMarkdownlint } = require('../lib/lints/markdownlint/doMarkdownlint');
    const originalCwd = process.cwd();

    process.chdir(cwd);
    try {
      await doMarkdownlint({ cwd, include: cwd, fix: true, pkg: {}, config: {} });
    } finally {
      process.chdir(originalCwd);
    }

    expect(fs.readFileSync(path.join(cwd, 'README.md'), 'utf8')).toBe(
      '# Title\n\n## Second\n\ntext\n',
    );
  });
});
