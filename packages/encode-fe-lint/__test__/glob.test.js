const path = require('path');
const fs = require('fs-extra');
const { getFilePattern, globFiles, normalizeInclude, resolveIgnorePatterns } = require('../lib/utils/glob');

describe('utils/glob', () => {
  const cwd = path.resolve(__dirname, './fixtures/glob');

  beforeAll(() => {
    fs.emptyDirSync(cwd);
    fs.outputFileSync(path.join(cwd, 'README.md'), '# Title\n');
    fs.outputFileSync(path.join(cwd, 'src/index.ts'), 'export const a = 1;\n');
    fs.outputFileSync(path.join(cwd, 'src/style.css'), 'a { color: red; }\n');
    fs.outputFileSync(path.join(cwd, 'node_modules/dep/README.md'), '# Dep\n');
  });

  afterAll(() => {
    fs.removeSync(cwd);
  });

  describe('normalizeInclude', () => {
    // fast-glob 的 ignore 按相对 cwd 的路径匹配，绝对路径 pattern 会让 ignore 完全失效
    test('绝对路径归一化为相对路径', () => {
      expect(normalizeInclude(cwd, cwd)).toBe('.');
      expect(normalizeInclude(cwd, path.join(cwd, 'src'))).toBe('src');
    });

    test('相对路径原样返回，空值回退到 cwd', () => {
      expect(normalizeInclude(cwd, 'src')).toBe('src');
      expect(normalizeInclude(cwd, undefined)).toBe('.');
    });
  });

  describe('getFilePattern', () => {
    test('多扩展名使用大括号展开', () => {
      expect(getFilePattern(cwd, cwd, ['.js', '.ts'])).toBe('**/*.{js,ts}');
    });

    // 单元素大括号 `{md}` 在 fast-glob / micromatch 下匹配不到任何文件，
    // 曾导致 markdownlint 引擎实际上从未检查过任何文件
    test('单扩展名不使用大括号', () => {
      expect(getFilePattern(cwd, cwd, ['.md'])).toBe('**/*.md');
    });
  });

  describe('globFiles', () => {
    test('单扩展名可匹配到根目录与子目录文件', async () => {
      const files = await globFiles(cwd, cwd, ['.md'], ['**/node_modules/**']);

      expect(files).toContain('README.md');
      expect(files).not.toContain('node_modules/dep/README.md');
    });

    test('多扩展名可同时匹配', async () => {
      const files = await globFiles(cwd, cwd, ['.ts', '.css'], []);

      expect(files).toEqual(expect.arrayContaining(['src/index.ts', 'src/style.css']));
    });

    test('ignore 规则对绝对路径 include 同样生效', async () => {
      const files = await globFiles(cwd, cwd, ['.md'], ['**/node_modules/**']);

      expect(files).toContain('README.md');
      expect(files.filter((name) => name.includes('node_modules'))).toHaveLength(0);
    });
  });

  describe('resolveIgnorePatterns', () => {
    afterEach(() => {
      fs.removeSync(path.join(cwd, '.markdownlintignore'));
    });

    test('文件不存在时返回内置默认值', () => {
      expect(resolveIgnorePatterns(cwd, '.markdownlintignore', ['DEFAULT'])).toEqual(['DEFAULT']);
    });

    test('与内置默认值合并，并跳过注释、反选行', () => {
      fs.outputFileSync(
        path.join(cwd, '.markdownlintignore'),
        '# 注释\nnode_modules/\n/dist\n!keep.md\n\n',
      );

      const patterns = resolveIgnorePatterns(cwd, '.markdownlintignore', ['DEFAULT']);

      expect(patterns).toContain('DEFAULT');
      expect(patterns).toContain('node_modules');
      expect(patterns).toContain('node_modules/**');
      expect(patterns).toContain('dist/**');
      expect(patterns).not.toContain('!keep.md');
    });
  });
});
