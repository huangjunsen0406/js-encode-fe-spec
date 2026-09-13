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
  // 历史遗留：这里曾有 `exec eslint/stylelint/commitlint --version` 三个用例，
  // 但 CLI 从未实现 exec 命令，参数被 commander 的 --version 截获，
  // 断言到的其实是本 CLI 自己的版本号，属于恒真断言。
  test('--help 应列出全部已实现的命令', async () => {
    const { stdout } = await cli(['--help']);

    for (const command of ['init', 'scan', 'fix', 'commit-msg-scan', 'commit-file-scan', 'update']) {
      expect(stdout).toContain(command);
    }
  });

  test('未知命令应报错而非静默通过', async () => {
    // 注意不能带 --version，否则会被 commander 的 --version 选项截获并以 0 退出
    await expect(cli(['exec'])).rejects.toThrow(/unknown command 'exec'/);
  });
});
