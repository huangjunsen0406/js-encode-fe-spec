import path from 'path';
import fs from 'fs-extra';
import inquirer from 'inquirer';
import spawn from 'cross-spawn';
import update from './update';
import npmType from '../utils/npm-type';
import log from '../utils/log';
import conflictResolve from '../utils/conflict-resolve';
import generateTemplate from '../utils/generate-template';
import { PROJECT_TYPES, PKG_NAME } from '../utils/constants';
import type { InitOptions, PKG } from '../types';

let step = 0;  // 初始化步骤计数器

/**
 * 选择项目语言和框架
 */
const chooseEslintType = async (): Promise<string> => {
  // 使用inquirer库获取用户输入
  const { type } = await inquirer.prompt({
    type: 'list', // 输入类型为列表选择
    name: 'type', // 返回值的键名
    message: `Step ${++step}. 请选择项目的语言（JS/TS）和框架（React/Vue）类型：`, // 提示信息，步骤数自增
    choices: PROJECT_TYPES, // 选项列表
  });

  if (type === 'custom') {
    const { customPkg } = await inquirer.prompt({
      type: 'input',
      name: 'customPkg',
      message: '请输入外部 ESLint 配置包名称（例如 @antfu/eslint-config）:',
      default: '@antfu/eslint-config',
      validate: (input: string) => (input.trim() ? true : '配置包名称不能为空'),
    });
    return `custom:${customPkg.trim()}`;
  }

  return type; // 返回选择的项目类型
};

/**
 * 选择是否启用 stylelint
 * @param defaultValue 默认值
 */
const chooseEnableStylelint = async (defaultValue: boolean): Promise<boolean> => {
  const { enable } = await inquirer.prompt({
    type: 'confirm', // 确认类型输入
    name: 'enable', // 返回值的键名
    message: `Step ${++step}. 是否需要使用 stylelint（若没有样式文件则不需要）：`, // 提示信息
    default: defaultValue, // 默认值
  });

  return enable; // 返回是否启用stylelint
};

/**
 * 选择是否启用 markdownlint
 */
const chooseEnableMarkdownLint = async (): Promise<boolean> => {
  const { enable } = await inquirer.prompt({
    type: 'confirm', // 确认类型输入
    name: 'enable', // 返回值的键名
    message: `Step ${++step}. 是否需要使用 markdownlint（若没有 Markdown 文件则不需要）：`, // 提示信息
    default: true, // 默认值
  });

  return enable; // 返回是否启用markdownlint
};

/**
 * 选择是否启用 prettier
 */
const chooseEnablePrettier = async (): Promise<boolean> => {
  const { enable } = await inquirer.prompt({
    type: 'confirm', // 确认类型输入
    name: 'enable', // 返回值的键名
    message: `Step ${++step}. 是否需要使用 Prettier 格式化代码：`, // 提示信息
    default: true, // 默认值
  });

  return enable; // 返回是否启用prettier
};

export default async (options: InitOptions) => {
  const cwd = options.cwd || process.cwd();  // 获取当前工作目录
  const isTest = process.env.NODE_ENV === 'test';  // 检查是否为测试环境
  const checkVersionUpdate = options.checkVersionUpdate || false;  // 是否检查版本更新
  const disableNpmInstall = options.disableNpmInstall || false;  // 是否禁止安装npm依赖
  const config: Record<string, any> = {};  // 初始化配置对象
  const pkgPath = path.resolve(cwd, 'package.json');  // 解析package.json的路径
  let pkg: PKG = fs.readJSONSync(pkgPath);  // 同步读取package.json文件

  // 版本检查，非测试环境且需要检查时执行
  if (!isTest && checkVersionUpdate) {
    await update(false);  // 执行更新检查
  }

  // 初始化 `enableESLint`，默认为 true，无需让用户选择
  if (typeof options.enableESLint === 'boolean') {
    config.enableESLint = options.enableESLint;  // 使用提供的选项
  } else {
    config.enableESLint = true;  // 默认启用ESLint
  }

  // 初始化 `eslintType`
  if (options.eslintType && PROJECT_TYPES.find((choice) => choice.value === options.eslintType)) {
    config.eslintType = options.eslintType;  // 使用提供的ESLint类型
  } else {
    config.eslintType = await chooseEslintType();  // 询问用户选择ESLint类型
  }

  // 初始化 `enableStylelint`
  if (typeof options.enableStylelint === 'boolean') {
    config.enableStylelint = options.enableStylelint;  // 使用提供的选项
  } else {
    config.enableStylelint = await chooseEnableStylelint(!/node/.test(config.eslintType));  // 询问用户是否启用Stylelint
  }

  // 初始化 `enableMarkdownlint`
  if (typeof options.enableMarkdownlint === 'boolean') {
    config.enableMarkdownlint = options.enableMarkdownlint;  // 使用提供的选项
  } else {
    config.enableMarkdownlint = await chooseEnableMarkdownLint();  // 询问用户是否启用Markdownlint
  }

  // 初始化 `enablePrettier`
  if (typeof options.enablePrettier === 'boolean') {
    config.enablePrettier = options.enablePrettier;  // 使用提供的选项
  } else {
    config.enablePrettier = await chooseEnablePrettier();  // 询问用户是否启用Prettier
  }

  if (!isTest) {
    log.info(`Step ${++step}. 检查并处理项目中可能存在的依赖和配置冲突`);  // 记录日志
    pkg = await conflictResolve(cwd, options.rewriteConfig);  // 解决依赖和配置冲突
    log.success(`Step ${step}. 已完成项目依赖和配置冲突检查处理 :D`);  // 记录成功日志

    if (!disableNpmInstall) {
      log.info(`Step ${++step}. 安装依赖`);  // 记录安装依赖日志
      const npm = await npmType;  // 获取npm类型
      const depsToInstall = [
        PKG_NAME,
        '@huangjunsen/commitlint-config',
      ];

      if (config.enableESLint !== false) {
        if (config.eslintType && config.eslintType.startsWith('custom:')) {
          const customPkg = config.eslintType.replace('custom:', '');
          depsToInstall.push(customPkg);
        } else {
          depsToInstall.push('@huangjunsen/eslint-config');
        }
      }

      if (config.enableStylelint) {
        depsToInstall.push('@huangjunsen/stylelint-config');
      }

      if (config.enablePrettier) {
        depsToInstall.push('@huangjunsen/prettier-config');
        depsToInstall.push('eslint-config-prettier');
      }

      if (config.enableMarkdownlint) {
        depsToInstall.push('@huangjunsen/markdownlint-config');
      }

      spawn.sync(npm, ['i', '-D', ...depsToInstall], { stdio: 'inherit', cwd });  // 同步执行npm安装命令
      log.success(`Step ${step}. 安装依赖成功 :D`);  // 记录成功日志
    }
  }

  // 更新 pkg.json
  pkg = fs.readJSONSync(pkgPath);  // 重新读取最新的package.json
  // 在 `package.json` 中写入 `scripts`
  if (!pkg.scripts) {
    pkg.scripts = {};  // 如果没有scripts字段，初始化为空对象
  }
  if (!pkg.scripts[`${PKG_NAME.split("/").pop()}-scan`]) {
    pkg.scripts[`${PKG_NAME.split("/").pop()}-scan`] = `${PKG_NAME.split("/").pop()} scan`;  // 添加scan脚本
  }
  if (!pkg.scripts[`${PKG_NAME.split("/").pop()}-fix`]) {
    pkg.scripts[`${PKG_NAME.split("/").pop()}-fix`] = `${PKG_NAME.split("/").pop()} fix`;  // 添加fix脚本
  }

  // 配置 commit 卡点
  log.info(`Step ${++step}. 配置 git commit 卡点`);  // 记录配置git钩子的日志
  if (!pkg.husky) pkg.husky = {};  // 如果没有husky字段，初始化为空对象
  if (!pkg.husky.hooks) pkg.husky.hooks = {};  // 如果没有hooks字段，初始化为空对象
  pkg.husky.hooks['pre-commit'] = `${PKG_NAME.split("/").pop()} commit-file-scan`;  // 设置pre-commit钩子
  pkg.husky.hooks['commit-msg'] = `${PKG_NAME.split("/").pop()} commit-msg-scan`;  // 设置commit-msg钩子

  // 配置 cz-git
  if (!pkg.config) pkg.config = {};
  if (!pkg.config.commitizen) {
    pkg.config.commitizen = {
      path: 'node_modules/cz-git',
    };
  }

  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));  // 写入修改后的package.json
  log.success(`Step ${step}. 配置 git commit 卡点成功 :D`);  // 记录成功日志

  log.info(`Step ${++step}. 写入配置文件`);  // 记录写入配置文件的日志
  generateTemplate(cwd, config);  // 生成配置文件
  log.success(`Step ${step}. 写入配置文件成功 :D`);  // 记录成功日志

  // 完成信息
  const logs = [`${PKG_NAME} 初始化完成 :D`].join('\r\n');  // 构建完成信息
  log.success(logs);  // 输出完成日志
};
