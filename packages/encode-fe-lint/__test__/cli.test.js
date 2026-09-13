const path = require('path');
const fs = require('fs-extra');
// execa 10 起移除了 default 导出（纯 ESM），改为具名导入
const { execa } = require('execa');
const packageJson = require('../package.json');

const cli = (args, options) => {
  return execa('node', [path.resolve(__dirname, '../lib/cli.js'), ...args], options);
};

test('--version should output right version', async () => {
  const { stdout } = await cli(['--version']);
  expect(stdout).toBe(packageJson.version);
});

describe(`'fix' command`, () => {
  const dir = path.resolve(__dirname, './fixtures/autofix');
  const outputFilePath = path.resolve(dir, './temp/temp.js');
  const errorFileContent = fs.readFileSync(path.resolve(dir, './semi-error.js'), 'utf8');
  const expectedFileContent = fs.readFileSync(path.resolve(dir, './semi-expected.js'), 'utf8');

  beforeEach(() => {
    fs.outputFileSync(outputFilePath, errorFileContent, 'utf8');
  });

  test('should autofix problematic code', async () => {
    await cli(['fix'], {
      cwd: path.dirname(`${dir}/result`),
    });
    expect(fs.readFileSync(outputFilePath, 'utf8')).toEqual(expectedFileContent);
  });

  afterEach(() => {
    fs.removeSync(`${dir}/temp`);
  });
});

describe('命令面', () => {
  test('--help 应列出全部已实现的命令', async () => {
    const { stdout } = await cli(['--help']);

    for (const command of ['init', 'scan', 'fix', 'exec', 'commit-msg-scan', 'commit-file-scan', 'update']) {
      expect(stdout).toContain(command);
    }
  });

  test('未知命令应报错而非静默通过', async () => {
    // 注意不能带 --version，否则会被 commander 的 --version 选项截获并以 0 退出
    await expect(cli(['not-a-command'])).rejects.toThrow(/unknown command 'not-a-command'/);
  });
});

describe(`'exec' command`, () => {
  const semverRegex = /\d+\.\d+\.\d+/;

  // exec 必须把 --version 原样透传给目标工具，而不是被本 CLI 的 --version 截获，
  // 因此这里断言的是「工具自己的版本号」而非本 CLI 的版本号
  test.each(['eslint', 'stylelint', 'prettier'])(
    `exec %s --version 应输出目标工具自身的版本号`,
    async (tool) => {
      const { stdout } = await cli(['exec', tool, '--version']);

      expect(stdout).toMatch(semverRegex);
      expect(stdout.trim()).not.toBe(packageJson.version);
    },
  );

  test(`exec commitlint --version 应输出目标工具自身的版本号`, async () => {
    const { stdout } = await cli(['exec', 'commitlint', '--version']);

    expect(stdout).toMatch(semverRegex);
    expect(stdout.trim()).not.toBe(packageJson.version);
  });

  test('未知工具应给出可选列表并以非 0 退出', async () => {
    const result = await cli(['exec', 'no-such-tool']).catch((error) => error);

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('eslint');
  });

  test('无参数时应列出可用工具', async () => {
    const { stdout } = await cli(['exec', '--help']);

    for (const tool of ['eslint', 'stylelint', 'prettier', 'commitlint', 'markdownlint']) {
      expect(stdout).toContain(tool);
    }
  });

  test('工具的退出码应透传给调用方', async () => {
    // 对不存在的文件执行检查，prettier 会以非 0 退出
    const result = await cli(['exec', 'prettier', '--check', './__no_such_file__.js']).catch(
      (error) => error,
    );

    expect(result.exitCode).toBe(2);
  });
});
