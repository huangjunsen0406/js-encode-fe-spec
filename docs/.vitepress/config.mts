import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "js-encode-fe-spec",
  description: "前端编码规范工程化标准解决方案，集成 ESLint, Stylelint, Prettier, Markdownlint, Commitlint 与 CLI",
  base: '/js-encode-fe-spec/',
  themeConfig: {
    search: {
      provider: 'local'
    },
    nav: [
      { text: '首页', link: '/' },
      { text: '快速开始', link: '/guide/getting-started' },
      { text: '规范包矩阵', link: '/packages/eslint-config' },
      { text: '架构介绍', link: '/introduced' },
    ],

    sidebar: [
      {
        text: '使用指南',
        items: [
          { text: '快速开始', link: '/guide/getting-started' },
          { text: '常见问题排查', link: '/guide/faq' },
          { text: '体系与架构设计', link: '/introduced' },
        ]
      },
      {
        text: '核心规范包',
        items: [
          { text: 'ESLint 规则配置', link: '/packages/eslint-config' },
          { text: 'ESLint 自研插件', link: '/packages/eslint-plugin' },
          { text: 'Commitlint 与 cz-git', link: '/packages/commitlint-config' },
          { text: 'Prettier 排版配置', link: '/packages/prettier-config' },
          { text: 'Stylelint 样式规范', link: '/packages/stylelint-config' },
          { text: 'Markdownlint 文档规范', link: '/packages/markdownlint-config' },
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/huangjunsen0406/js-encode-fe-spec' }
    ],

    footer: {
      message: 'Released under the ISC License.',
      copyright: 'Copyright © 2024-present Junsen'
    }
  }
})
