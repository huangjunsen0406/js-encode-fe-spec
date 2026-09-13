/**
 * 验证 Flat Config 预设
 *
 * 重点覆盖 Vue3 + TypeScript 场景：
 * - 泛型箭头函数（<T,>）能被正常解析
 * - 不会退回 espree 解析器
 * - 噪音型风格规则保持关闭
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs-extra');
const { FlatESLint } = require('eslint/use-at-your-own-risk');

const cwd = path.resolve(__dirname, '..');
const fixtures = path.resolve(__dirname, './fixtures');
const tmpDir = path.resolve(__dirname, './.tmp-flat');

const VUE_FIXTURE = path.join(tmpDir, 'Generic.vue');
const TS_FIXTURE = path.join(tmpDir, 'generic.ts');

const VUE_SOURCE = `<template>
  <div>{{ label }}</div>
</template>

<script lang="ts" setup>
const buildList = <T,>(list: T[] | undefined, getter: (item: T) => string) => {
  return (list || []).map((item) => ({ name: getter(item) }));
};

const label = buildList([1, 2], (item) => String(item)).length;
</script>
`;

const TS_SOURCE = `export const toName = <T,>(item: T, getter: (value: T) => string): string => {
  return getter(item);
};
`;

describe('Validate Flat configs', () => {
  before(() => {
    fs.outputFileSync(VUE_FIXTURE, VUE_SOURCE, 'utf8');
    fs.outputFileSync(TS_FIXTURE, TS_SOURCE, 'utf8');
  });

  after(() => {
    fs.removeSync(tmpDir);
  });

  it('flat/vue 能解析 TS 泛型与 Vue SFC', async () => {
    const overrideConfig = [...require('../flat/vue.js'), ...require('../flat/typescript.js')];
    const cli = new FlatESLint({ cwd, overrideConfigFile: true, overrideConfig });

    const results = await cli.lintFiles([VUE_FIXTURE, TS_FIXTURE]);
    assert.strictEqual(results.length, 2);

    for (const result of results) {
      const fatal = result.messages.filter((message) => message.fatal);
      assert.strictEqual(
        fatal.length,
        0,
        `${path.basename(result.filePath)} 出现解析错误：${fatal.map((m) => m.message).join('; ')}`,
      );
    }
  });

  it('flat/vue 关闭了无法自动修复的格式类规则', () => {
    const configs = require('../flat/vue.js');
    const rules = Object.assign({}, ...configs.filter((config) => config.rules).map((c) => c.rules));

    // 这些规则属于 eslint-plugin-vue 的 strongly-recommended / recommended 档位，
    // 会产生大量无法被 Prettier 修复的告警，因此显式关闭
    for (const rule of [
      'vue/attributes-order',
      'vue/attribute-hyphenation',
      'vue/require-default-prop',
      'vue/multi-word-component-names',
    ]) {
      assert.strictEqual(rules[rule], 'off', `${rule} 应保持关闭`);
    }

    // 正确性与安全性规则应保留
    assert.strictEqual(rules['vue/no-v-html'], 'warn');
    assert.strictEqual(rules['vue/no-mutating-props'], 'error');
  });
});
