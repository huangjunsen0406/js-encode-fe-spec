import { readFile, writeFile } from 'fs-extra';
import { extname, isAbsolute, resolve } from 'path';
import prettier from 'prettier';
import { ScanOptions } from '../../types';
import { PRETTIER_FILE_EXT, PRETTIER_IGNORE_PATTERN } from '../../utils/constants';
import { globFiles } from '../../utils/glob';

export interface DoPrettierOptions extends ScanOptions {}

export async function doPrettier(options: DoPrettierOptions): Promise<Error[]> {
  let files: string[] = [];
  if (options.files) {
    files = options.files.filter((name) => PRETTIER_FILE_EXT.includes(extname(name)));
  } else {
    files = await globFiles(
      options.cwd,
      options.include,
      PRETTIER_FILE_EXT,
      PRETTIER_IGNORE_PATTERN,
    );
  }

  const errors: Error[] = [];
  await Promise.all(files.map((filepath) => formatFile(options.cwd, filepath, errors)));

  return errors;
}

async function formatFile(cwd: string, filepath: string, errors: Error[]) {
  const absolutePath = isAbsolute(filepath) ? filepath : resolve(cwd, filepath);

  try {
    const text = await readFile(absolutePath, 'utf8');
    const config = (await prettier.resolveConfig(absolutePath)) || {};
    // 兼容 Prettier 2.x (同步/异步) 与 Prettier 3.x (纯异步返回 Promise)
    const formatted = await prettier.format(text, { ...config, filepath: absolutePath });

    if (formatted !== text) {
      await writeFile(absolutePath, formatted, 'utf8');
    }
  } catch (e) {
    // 单个文件处理失败不应中断整个扫描流程
    errors.push(e as Error);
  }
}
