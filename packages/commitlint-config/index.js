module.exports = {
  parserPreset: 'conventional-changelog-conventionalcommits', // 使用 conventional-changelog-conventionalcommits 解析器预设
  rules: {
    'body-leading-blank': [1, 'always'], // 正文之前必须始终有空行
    'body-max-line-length': [2, 'always', 100], // 正文每行长度必须始终不超过 100 个字符
    'footer-leading-blank': [1, 'always'], // 页脚之前必须始终有空行
    'footer-max-line-length': [2, 'always', 100], // 页脚每行长度必须始终不超过 100 个字符
    'header-max-length': [2, 'always', 100], // 标题长度必须始终不超过 100 个字符
    'scope-case': [2, 'always', 'lower-case'], // 作用域必须始终为小写
    'subject-case': [0], // 主题不做大小写校验
    'subject-empty': [2, 'never'], // 主题不能为空
    'subject-full-stop': [2, 'never', '.'], // 主题末尾不应包含句号
    'type-case': [2, 'always', 'lower-case'], // 类型必须始终为小写
    'type-empty': [2, 'never'], // 类型不能为空
    'type-enum': [2, 'always', ['feat', 'fix', 'docs', 'style', 'test', 'refactor', 'chore', 'revert', 'perf', 'build', 'ci']], // 类型必须是预定义的枚举值之一
  },
  prompt: {
    messages: {
      type: '选择你要提交的类型 :',
      scope: '选择一个提交范围 (可选):',
      customScope: '请输入自定义的提交范围 :',
      subject: '填写简短精炼的变更描述 :\n',
      body: '填写更加详细的变更描述 (可选)。使用 "|" 换行 :\n',
      breaking: '列举非兼容性重大的变更 (可选)。使用 "|" 换行 :\n',
      footerPrefixesSelect: '选择关联issue前缀 (可选):',
      customFooterPrefix: '输入自定义issue前缀 :',
      footer: '列举关联issue (可选) 例如: #31, #I3244 :\n',
      confirmCommit: '是否提交或修改commit ?',
    },
    types: [
      { value: 'feat', name: 'feat:     ✨  新增功能 | A new feature' },
      { value: 'fix', name: 'fix:      🐛  修复缺陷 | A bug fix' },
      { value: 'docs', name: 'docs:     📝  文档更新 | Documentation only changes' },
      { value: 'style', name: 'style:    💄  代码格式 | Changes that do not affect the meaning of the code' },
      { value: 'refactor', name: 'refactor: ♻️   代码重构 | A code change that neither fixes a bug nor adds a feature' },
      { value: 'perf', name: 'perf:     ⚡️  性能提升 | A code change that improves performance' },
      { value: 'test', name: 'test:     ✅  测试相关 | Adding missing tests or correcting existing tests' },
      { value: 'build', name: 'build:    📦️  构建流程 | Changes that affect the build system or external dependencies' },
      { value: 'ci', name: 'ci:       🎡  持续集成 | Changes to our CI configuration files and scripts' },
      { value: 'revert', name: 'revert:   ⏪️  回退代码 | Revert to a commit' },
      { value: 'chore', name: 'chore:    🔨  其他修改 | Other changes that don\'t modify src or test files' },
    ],
    useEmoji: true,
    emojiAlign: 'center',
    themeColorCode: '',
    scopes: [],
    allowCustomScopes: true,
    allowEmptyScopes: true,
    customScopesAlign: 'bottom',
    customScopesAlias: 'custom',
    emptyScopesAlias: 'empty',
    upperCaseSubject: false,
    markBreakingChangeNodes: ['!'],
    breaklineNumber: 100,
    breaklineChar: '|',
    skipQuestions: [],
    issuePrefixes: [{ value: 'closed', name: 'closed:   ISSUES has been resolved' }],
    customIssuePrefixAlign: 'top',
    emptyIssuePrefixAlias: 'skip',
    confirmColorActive: 'green',
    confirmColorReset: 'reset',
    defaultHeader: '',
    defaultBody: '',
    defaultFooter: '',
    defaultIssues: '',
    defaultScope: '',
    defaultSubject: '',
  },
};
