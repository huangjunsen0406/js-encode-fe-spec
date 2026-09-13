/**
 * Vue 单文件组件的 <style> 解析器
 *
 * 用 require.resolve 取绝对路径，避免 stylelint 从自身安装目录解析裸模块名而失败
 */
const postcssHtml = require.resolve('postcss-html');

module.exports = {
    defaultSeverity: 'warning',  // 设置所有规则的默认严重性级别。
    plugins: ['stylelint-scss'], // 引入 stylelint-scss 插件，启用 SCSS 特定的规则。
    extends: ['stylelint-config-standard','stylelint-config-standard-scss'], // 继承 stylelint-config-standard 配置。
    rules: {
      /**
       * 可能的错误
       * @link https://stylelint.io/user-guide/rules/#possible-errors
       */
      'at-rule-no-unknown': null, // 禁用未知的 at 规则检查。
      'scss/at-rule-no-unknown': true, // 启用 SCSS 特定的未知 at 规则验证。
      'block-no-empty': null, // 禁用空块规则。
      'color-no-invalid-hex': true, // 确保十六进制颜色值有效。
      'comment-no-empty': true, // 禁止空注释。
      'declaration-block-no-duplicate-properties': [
        true,
        {
          ignore: ['consecutive-duplicates-with-different-values'],
        },
      ], // 允许连续重复属性，如果它们的值不同。
      'declaration-block-no-shorthand-property-overrides': true, // 防止简写属性覆盖详细属性。
      'font-family-no-duplicate-names': true, // 确保字体族名称不重复。
      'function-calc-no-unspaced-operator': true, // 确保 calc 函数中的操作符周围有空格。
      'function-linear-gradient-no-nonstandard-direction': true, // 防止线性渐变中使用非标准方向。
      'keyframe-declaration-no-important': true, // 禁止在关键帧声明中使用 !important。
      'media-feature-name-no-unknown': true, // 禁止未知的媒体特性名称。
      'no-descending-specificity': null, // 禁用；忽略选择器优先级降序的规则。
      'no-duplicate-at-import-rules': true, // 禁止重复的 @import 规则。
      'no-duplicate-selectors': true, // 禁止选择器重复。
      'no-empty-source': null, // 允许空的源文件。
      'no-invalid-double-slash-comments': true, // 禁止无效的双斜杠注释（CSS 中不支持）。
      'property-no-unknown': true, // 禁止未知的属性。
      'selector-pseudo-class-no-unknown': [
        true,
        {
          ignorePseudoClasses: ['global', 'local', 'export'],
        },
      ], // 允许特定的自定义伪类。
      'selector-pseudo-element-no-unknown': true, // 禁止未知的伪元素。
      'string-no-newline': true, // 禁止字符串中的换行符。
      'unit-no-unknown': [
        true,
        {
          ignoreUnits: ['rpx'],
        },
      ], // 允许特定的自定义单位，如 rpx。
      /**
       * 规范约束
       *
       * stylelint 16 起移除了全部排版与空白类（stylistic）规则：
       * indentation / block-*-brace-* / max-line-length / declaration-block-trailing-semicolon /
       * value-list-comma-space-after / no-extra-semicolons 等在 stylelint 17 下会直接报
       * "Unknown rule"，因此不再声明。
       * 缩进、换行、分号、行长度等统一交给 Prettier 处理，避免两套工具互相覆盖。
       */
      'color-hex-length': 'short', // 强制使用简短形式的十六进制值。
      'comment-whitespace-inside': 'always', // 注释内部必须有空白。
      'declaration-block-single-line-max-declarations': 1, // 单行声明块中的最大声明数为1。
      'length-zero-no-unit': [
        true,
        {
          ignore: ['custom-properties'],
        },
      ], // 零长度值不得带单位，自定义属性除外。
      'selector-max-id': 0, // 禁止在选择器中使用 ID。

      /**
       * stylelint-scss 规则
       * @link https://www.npmjs.com/package/stylelint-scss
       */
      'scss/double-slash-comment-whitespace-inside': 'always', // SCSS 中双斜杠注释内必须有空白。
    },
    ignoreFiles: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'], // 指定 stylelint 忽略的文件类型。

    /**
     * Vue 单文件组件支持
     *
     * .vue 不是标准 CSS 语法，必须先由 postcss-html 取出 <style> 块，
     * 否则 stylelint 会报 CssSyntaxError（把模板里的插值当成 CSS 解析）。
     */
    overrides: [
      {
        files: ['**/*.vue'],
        customSyntax: postcssHtml,
      },
    ],
  };
  