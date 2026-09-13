const packageJson = require('../package.json');
const { compareVersion, resolveSpecDependency } = require('../lib/utils/version');

describe('compareVersion', () => {
  test('按数字而非字典序比较', () => {
    // 字典序比较会得出 '1.0.6' > '1.0.21' 的错误结论
    expect(compareVersion('1.0.6', '1.0.21')).toBe(-1);
    expect(compareVersion('1.0.21', '1.0.6')).toBe(1);
  });

  test('版本相同时返回 0', () => {
    expect(compareVersion(packageJson.version, packageJson.version)).toBe(0);
  });

  test('位数不齐时按缺位补 0', () => {
    expect(compareVersion('1.0', '1.0.0')).toBe(0);
    expect(compareVersion('1.1', '1.0.9')).toBe(1);
  });
});

describe('resolveSpecDependency', () => {
  test('本工具自身带上当前运行的版本，避免 CLI 被降级', () => {
    expect(resolveSpecDependency(packageJson.name)).toBe(
      `${packageJson.name}@^${packageJson.version}`,
    );
  });

  test('规范包带上本包声明依赖的版本范围', () => {
    const manifest = {
      '@huangjunsen/eslint-config': '^1.0.8',
      '@huangjunsen/stylelint-config': '^1.0.4',
    };

    expect(resolveSpecDependency('@huangjunsen/eslint-config', manifest)).toBe(
      '@huangjunsen/eslint-config@^1.0.8',
    );
    expect(resolveSpecDependency('@huangjunsen/stylelint-config', manifest)).toBe(
      '@huangjunsen/stylelint-config@^1.0.4',
    );
  });

  test('未声明版本范围时退化为包名（如社区预设）', () => {
    expect(resolveSpecDependency('@antfu/eslint-config', {})).toBe('@antfu/eslint-config');
  });

  test('本地开发时的 workspace 协议不做版本约束', () => {
    const manifest = { '@huangjunsen/eslint-config': 'workspace:^' };

    expect(resolveSpecDependency('@huangjunsen/eslint-config', manifest)).toBe(
      '@huangjunsen/eslint-config',
    );
  });

  test('本包实际依赖清单中的规范包都能解析出版本', () => {
    const specPackages = Object.keys(packageJson.dependencies || {}).filter((name) =>
      name.startsWith('@huangjunsen/'),
    );

    expect(specPackages.length).toBeGreaterThan(0);
    specPackages.forEach((name) => {
      const spec = resolveSpecDependency(name);
      const isWorkspace = (packageJson.dependencies[name] || '').startsWith('workspace:');

      // 发布后的清单里 workspace:^ 会被替换为真实范围，此处即应带上版本号
      if (isWorkspace) {
        expect(spec).toBe(name);
      } else {
        expect(spec).toMatch(new RegExp(`^${name.replace(/[/@]/g, '\\$&')}@.+$`));
      }
    });
  });
});
