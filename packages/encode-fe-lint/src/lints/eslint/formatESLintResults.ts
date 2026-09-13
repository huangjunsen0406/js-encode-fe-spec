import { ESLint } from 'eslint';
import type { ScanResult } from '../../types';

/**
 * 格式化 ESLint 输出结果
 */
export function formatESLintResults(
  results: ESLint.LintResult[],
  quiet = false,
  eslint: ESLint,
): ScanResult[] {
  const rulesMeta = eslint.getRulesMetaForResults(results);

  return results
    .filter(({ warningCount, errorCount }) => errorCount || warningCount)
    .map(
      ({
        filePath,
        messages,
        errorCount,
        warningCount,
        fixableErrorCount,
        fixableWarningCount,
      }) => ({
        filePath,
        errorCount,
        warningCount: quiet ? 0 : warningCount,
        fixableErrorCount,
        fixableWarningCount: quiet ? 0 : fixableWarningCount,
        messages: messages
          .map(({ line = 0, column = 0, ruleId, message, fatal, severity }) => {
            return {
              line,
              column,
              // ruleId 可为 null（解析失败等场景，见下方链接），统一归一化为空字符串
              rule: ruleId ?? '',
              url: (ruleId && rulesMeta[ruleId]?.docs?.url) || '',
              message: message.replace(/([^ ])\.$/u, '$1'),
              errored: fatal || severity === 2,
            };
          })
          .filter(({ errored }) => (quiet ? errored : true)),
      }),
    );
}
