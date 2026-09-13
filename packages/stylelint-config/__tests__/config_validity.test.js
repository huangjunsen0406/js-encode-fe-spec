const assert = require('assert');
const fs = require('fs');
const path = require('path');
const stylelint = require('stylelint');

const configFile = path.join(__dirname, '../index.js');
const fixturesDir = path.join(__dirname, './fixtures');

const fixtureFiles = fs
  .readdirSync(fixturesDir)
  .filter((name) => /\.(css|scss|less)$/.test(name))
  .map((name) => path.join(fixturesDir, name));

/**
 * stylelint 16 起移除的排版类（stylistic）规则
 *
 * 这些规则一旦重新出现在配置中，stylelint 会直接报 "Unknown rule"，
 * 因此显式列出，避免后续被误加回来。
 * @link https://stylelint.io/migration-guide/to-16
 */
const REMOVED_STYLISTIC_RULES = [
  'indentation',
  'max-line-length',
  'no-extra-semicolons',
  'no-eol-whitespace',
  'no-missing-end-of-source-newline',
  'value-list-comma-space-after',
  'declaration-block-trailing-semicolon',
  'block-opening-brace-newline-after',
  'block-opening-brace-space-after',
  'block-opening-brace-space-before',
  'block-closing-brace-newline-before',
  'block-closing-brace-space-before',
  'color-hex-case',
  'string-quotes',
  'unicode-bom',
];

describe('stylelint-config 配置有效性', () => {
  it('fixtures 目录下存在待校验文件', () => {
    assert.ok(fixtureFiles.length > 0, 'fixtures 目录为空');
  });

  it('所有内置规则均为当前 stylelint 已知规则', () => {
    const config = require(configFile);
    const unknown = Object.keys(config.rules || {}).filter(
      (name) => !name.includes('/') && !(name in stylelint.rules),
    );

    assert.deepStrictEqual(
      unknown,
      [],
      `以下规则在当前 stylelint 版本中已不存在，会导致 "Unknown rule" 报错：\n  ${unknown.join('\n  ')}`,
    );
  });

  it('未声明 stylelint 16 起已移除的排版规则', () => {
    const config = require(configFile);
    const declared = Object.keys(config.rules || {});
    const offending = declared.filter((name) => REMOVED_STYLISTIC_RULES.includes(name));

    assert.deepStrictEqual(offending, [], `不应声明已移除的规则：\n  ${offending.join('\n  ')}`);
  });

  fixtureFiles.forEach((filePath) => {
    it(`可正常校验 ${path.basename(filePath)} 且无无效规则`, async () => {
      const result = await stylelint.lint({ configFile, files: [filePath], fix: false });
      const warnings = (result.results || []).flatMap((item) => item.warnings || []);
      const invalid = warnings.filter((item) =>
        /unknown rule|could not find|is not a valid|invalid config/i.test(item.text),
      );

      assert.deepStrictEqual(
        invalid.map((item) => item.text),
        [],
        `${path.basename(filePath)} 命中了无效配置`,
      );
    });
  });
});

/**
 * Vue 单文件组件的 <style> 需要 postcss-html 才能解析
 *
 * 缺少该 override 时 stylelint 会把 <template> 里的插值当作 CSS 解析，
 * 直接报 CssSyntaxError —— 表现为「Vue 项目的样式完全无法检查」。
 */
describe('Vue 单文件组件支持', () => {
  const vueFixture = path.join(fixturesDir, 'vue-sfc.vue');

  const lintVueFixture = async () => {
    const result = await stylelint.lint({ configFile, files: [vueFixture], fix: false });
    return (result.results || []).flatMap((item) => item.warnings || []);
  };

  it('fixtures 目录下存在 .vue 用例', () => {
    assert.ok(fs.existsSync(vueFixture), '缺少 vue-sfc.vue 用例');
  });

  it('可解析 <style> 块，不再报 CssSyntaxError', async () => {
    const warnings = await lintVueFixture();
    const syntaxErrors = warnings.filter((item) => item.rule === 'CssSyntaxError');

    assert.deepStrictEqual(
      syntaxErrors.map((item) => item.text),
      [],
      '.vue 需要 overrides 中配置 customSyntax: postcss-html',
    );
  });

  it('.vue 中 <style> 的规则确实生效', async () => {
    const warnings = await lintVueFixture();
    const rules = new Set(warnings.map((item) => item.rule));

    assert.ok(rules.has('color-hex-length'), '应命中 color-hex-length');
    assert.ok(rules.has('length-zero-no-unit'), '应命中 length-zero-no-unit');
  });
});
