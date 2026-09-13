/**
 * 验证插件入口的导出结构
 *
 * 覆盖此前缺失的测试：插件主体、rules 映射、configs 预设
 */

const path = require('path');
const plugin = require('../dist/index').default;

/**
 * 获取支持 Flat Config 的 ESLint 类
 *
 * - ESLint 8.x：需使用 `eslint/use-at-your-own-risk` 中的 FlatESLint
 * - ESLint 9+：ESLint 类本身就是 Flat Config 实现
 */
function getFlatESLint() {
  const { ESLint } = require('eslint');
  try {
    const { FlatESLint } = require('eslint/use-at-your-own-risk');
    if (typeof FlatESLint === 'function') return FlatESLint;
  } catch (e) {
    // ESLint 9+ 无该入口
  }
  return ESLint;
}

function lintWith(config) {
  const FlatESLint = getFlatESLint();
  const eslint = new FlatESLint({
    cwd: path.resolve(__dirname, '..'),
    overrideConfigFile: true,
    overrideConfig: config,
  });
  return eslint.lintText("var url = 'http://example.com';\n", { filePath: 'fixture.js' });
}

describe('eslint-plugin 入口', () => {
  test('默认导出为符合 ESLint 插件规范的插件对象', () => {
    expect(plugin).toBeDefined();
    expect(plugin.meta).toBeDefined();
    expect(plugin.meta.name).toBe('@huangjunsen/eslint-plugin');
    expect(typeof plugin.rules).toBe('object');
  });

  test('meta.version 与 package.json 版本保持一致', () => {
    const pkg = require('../package.json');
    expect(plugin.meta.version).toBe(pkg.version);
  });

  test('导出全部四个规则', () => {
    expect(Object.keys(plugin.rules).sort()).toEqual([
      'no-broad-semantic-versioning',
      'no-http-url',
      'no-js-in-ts-project',
      'no-secret-info',
    ]);
  });

  test('每个规则都具备 meta 与 create', () => {
    for (const [name, rule] of Object.entries(plugin.rules)) {
      expect(rule.meta).toBeDefined();
      expect(typeof rule.create).toBe('function');
      // 便于在报告中展示与定位文档
      expect(rule.meta.docs?.description).toBeTruthy();
      expect(name).toBeTruthy();
    }
  });

  test('configs.recommended 为 Flat Config 结构', () => {
    const { recommended } = plugin.configs;
    expect(recommended).toBeDefined();
    // Flat Config 预设通过 plugins 对象注入插件实例
    expect(recommended.plugins['@huangjunsen']).toBe(plugin);
    expect(Object.keys(recommended.rules)).toContain('@huangjunsen/no-http-url');
  });

  test('configs.legacy-recommended 为 Legacy Config 结构', () => {
    const { 'legacy-recommended': legacy } = plugin.configs;
    expect(legacy).toBeDefined();
    // Legacy Config 预设通过字符串数组声明插件
    expect(Array.isArray(legacy.plugins)).toBe(true);
    expect(legacy.plugins).toContain('@huangjunsen');
  });

  test('configs 中的规则名与 rules 映射一致', () => {
    const ruleNames = Object.keys(plugin.rules);
    for (const configName of ['recommended', 'legacy-recommended']) {
      for (const ruleId of Object.keys(plugin.configs[configName].rules)) {
        const bare = ruleId.replace('@huangjunsen/', '');
        expect(ruleNames).toContain(bare);
      }
    }
  });
});

describe('eslint-plugin 实际挂载到 ESLint', () => {
  // 完整模块导出（含 default），等价于用户 require('@huangjunsen/eslint-plugin') 的结果
  const moduleExports = require('../dist/index');

  test('作为 Flat Config 插件对象使用时可正常报错', async () => {
    const [result] = await lintWith([
      {
        files: ['**/*.js'],
        ...plugin.configs.recommended,
      },
    ]);

    expect(result.messages.length).toBeGreaterThan(0);
    expect(result.messages[0].ruleId).toBe('@huangjunsen/no-http-url');
  });

  test('require() 结果可直接作为插件对象传入（含 rules）', async () => {
    // 文档推荐的接入方式：plugins: { '@huangjunsen': require('@huangjunsen/eslint-plugin') }
    expect(moduleExports.rules).toBeDefined();

    const [result] = await lintWith([
      {
        files: ['**/*.js'],
        plugins: { '@huangjunsen': moduleExports },
        rules: { '@huangjunsen/no-http-url': 'error' },
      },
    ]);

    expect(result.errorCount).toBe(1);
    expect(result.messages[0].ruleId).toBe('@huangjunsen/no-http-url');
  });
});
