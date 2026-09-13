/**
 * 验证 init 不会破坏项目已有的配置与依赖
 *
 * 背景：早期实现会把 prettier.config.js / stylelint.config.js / eslint.config.mjs
 * 当作「冲突配置」直接删除，导致用户自定义规则丢失。
 */

const path = require('path');
const fs = require('fs-extra');
const generateTemplate = require('../lib/utils/generate-template').default;

describe('generate-template 保护项目已有配置', () => {
  const outputPath = path.resolve(__dirname, './fixtures/template/preserve');

  const baseConfig = {
    eslintType: 'typescript/vue',
    enableESLint: true,
    enableStylelint: true,
    enableMarkdownlint: true,
    enablePrettier: true,
    enableFlatConfig: true,
  };

  const PRESERVED_FILES = {
    'prettier.config.js': `module.exports = { semi: false, singleQuote: true };\n`,
    'stylelint.config.js': `module.exports = { extends: ['stylelint-config-standard'] };\n`,
    'eslint.config.mjs': `import vue from 'eslint-plugin-vue';\nexport default [...vue.configs['flat/essential']];\n`,
  };

  beforeEach(() => {
    fs.removeSync(outputPath);
    fs.outputJsonSync(path.join(outputPath, 'package.json'), { name: 'preserve', version: '1.0.0' });
    for (const [name, content] of Object.entries(PRESERVED_FILES)) {
      fs.outputFileSync(path.join(outputPath, name), content, 'utf8');
    }
  });

  afterEach(() => {
    fs.removeSync(outputPath);
  });

  test('默认不覆盖项目已有配置，也不生成会遮蔽它的同名配置', () => {
    const { preserved } = generateTemplate(outputPath, baseConfig, { overwrite: false });

    // 项目原有配置必须原样保留
    for (const [name, content] of Object.entries(PRESERVED_FILES)) {
      expect(fs.readFileSync(path.join(outputPath, name), 'utf8')).toBe(content);
    }

    // 不能生成优先级更高的 .prettierrc.js / .stylelintrc.js，
    // 否则项目的 prettier.config.js / stylelint.config.js 会被静默遮蔽
    expect(fs.existsSync(path.join(outputPath, '.prettierrc.js'))).toBe(false);
    expect(fs.existsSync(path.join(outputPath, '.stylelintrc.js'))).toBe(false);

    // 保留的文件应被如实上报
    for (const name of Object.keys(PRESERVED_FILES)) {
      expect(preserved).toContain(name);
    }

    // 项目原本没有的配置仍应正常生成
    expect(fs.existsSync(path.join(outputPath, 'commitlint.config.js'))).toBe(true);
    expect(fs.existsSync(path.join(outputPath, 'encode-fe-lint.config.js'))).toBe(true);
  });

  test('全新项目仍会生成完整的默认配置', () => {
    for (const name of Object.keys(PRESERVED_FILES)) {
      fs.removeSync(path.join(outputPath, name));
    }

    const { preserved, removed } = generateTemplate(outputPath, baseConfig, { overwrite: false });

    expect(preserved).toEqual([]);
    expect(removed).toEqual([]);
    for (const name of [
      '.editorconfig',
      '.stylelintignore',
      '.markdownlintignore',
      '.markdownlint.json',
      'commitlint.config.js',
      'encode-fe-lint.config.js',
      '.prettierrc.js',
      '.stylelintrc.js',
      'eslint.config.mjs',
      '.vscode/settings.json',
    ]) {
      expect(fs.existsSync(path.join(outputPath, name))).toBe(true);
    }

    // Flat Config 已不再支持 .eslintignore，忽略规则改写入 eslint.config.mjs，
    // 否则 ESLint 会因该文件发出 "no longer supported" 警告
    expect(fs.existsSync(path.join(outputPath, '.eslintignore'))).toBe(false);
    const flatConfig = fs.readFileSync(path.join(outputPath, 'eslint.config.mjs'), 'utf8');
    expect(flatConfig).toContain('ignores: [');
    expect(flatConfig).toContain("'**/node_modules/**'");
  });

  test('传统配置模式下仍会生成 .eslintignore', () => {
    for (const name of Object.keys(PRESERVED_FILES)) {
      fs.removeSync(path.join(outputPath, name));
    }

    generateTemplate(
      outputPath,
      { ...baseConfig, enableFlatConfig: false },
      { overwrite: false },
    );

    expect(fs.existsSync(path.join(outputPath, '.eslintignore'))).toBe(true);
    expect(fs.existsSync(path.join(outputPath, '.eslintrc.js'))).toBe(true);
    expect(fs.existsSync(path.join(outputPath, 'eslint.config.mjs'))).toBe(false);
  });

  test('显式覆盖模式会清理同类配置并改用规范包配置', () => {
    const { removed } = generateTemplate(outputPath, baseConfig, { overwrite: true });

    expect(fs.existsSync(path.join(outputPath, '.prettierrc.js'))).toBe(true);
    expect(fs.existsSync(path.join(outputPath, '.stylelintrc.js'))).toBe(true);

    // 同类但不同名的配置会被清理，避免新旧配置并存
    expect(removed).toContain('prettier.config.js');
    expect(removed).toContain('stylelint.config.js');
    expect(fs.existsSync(path.join(outputPath, 'prettier.config.js'))).toBe(false);
    expect(fs.existsSync(path.join(outputPath, 'stylelint.config.js'))).toBe(false);

    // eslint.config.mjs 与被生成的同名，内容应被替换为规范包配置
    const eslintConfig = fs.readFileSync(path.join(outputPath, 'eslint.config.mjs'), 'utf8');
    expect(eslintConfig).toContain('@huangjunsen/eslint-config/flat');
  });

  test('已由本工具生成的配置可被安全刷新', () => {
    generateTemplate(outputPath, baseConfig, { overwrite: true });
    // 此时 .prettierrc.js 已是本工具生成的内容
    const { preserved } = generateTemplate(outputPath, baseConfig, { overwrite: false });

    // 不应把自己生成的文件当成「项目自有配置」而拒绝写入
    expect(preserved).not.toContain('.prettierrc.js');
    expect(preserved).not.toContain('.stylelintrc.js');
  });
});
