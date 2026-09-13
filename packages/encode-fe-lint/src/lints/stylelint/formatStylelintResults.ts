import { LintResult } from 'stylelint';
import type { ScanResult } from '../../types';
import { getStylelintRuleDocUrl } from './getStylelintDocUrl';

/**
 * 格式化 Stylelint 输出结果
 */
export function formatStylelintResults(results: LintResult[], quiet = false): ScanResult[] {
  return results.map(({ source, warnings }) => {
    let errorCount = 0;
    let warningCount = 0;
    const messages = warnings
      .filter((item) => !quiet || item.severity === 'error')
      .map((item) => {
        const { line = 0, column = 0, rule, severity, text } = item;
        if (severity === 'error') {
          errorCount++;
        } else {
          warningCount++;
        }
        return {
          line,
          column,
          rule,
          url: getStylelintRuleDocUrl(rule),
          message: text.replace(/([^ ])\.$/u, '$1').replace(new RegExp(`\\(${rule}\\)`), ''),
          errored: severity === 'error',
        };
      });

    return {
      // stylelint 的 source 在部分场景（如仅传 code）下为 undefined
      filePath: source ?? '',
      messages,
      errorCount,
      warningCount,
      fixableErrorCount: 0,
      fixableWarningCount: 0,
    };
  });
}
