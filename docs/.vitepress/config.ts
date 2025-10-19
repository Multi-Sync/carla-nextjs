import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Carla Next.js',
  description: 'Turn your Next.js API routes into AI-powered tools for Carla',
  base: '/',

  themeConfig: {
    logo: '/logo.svg',

    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Reference', link: '/reference/cli' },
      { text: 'Examples', link: '/examples/' },
      {
        text: 'v1.0.7',
        items: [
          { text: 'Changelog', link: 'https://github.com/Multi-Sync/carla-nextjs/releases' },
          { text: 'Contributing', link: '/guide/contributing' }
        ]
      }
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'What is Carla?', link: '/guide/what-is-carla' },
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Installation', link: '/guide/installation' },
          ]
        },
        {
          text: 'Core Concepts',
          items: [
            { text: 'How It Works', link: '/guide/how-it-works' },
            { text: 'API Route Scanning', link: '/guide/api-scanning' },
            { text: 'Tool Generation', link: '/guide/tool-generation' },
            { text: 'Widget Integration', link: '/guide/widget' },
          ]
        },
        {
          text: 'AI Integration',
          items: [
            { text: 'Cursor & Claude Code', link: '/guide/ai-assistants' },
            { text: 'MCP Protocol', link: '/guide/mcp' },
          ]
        },
        {
          text: 'Advanced',
          items: [
            { text: 'Configuration', link: '/guide/configuration' },
            { text: 'MCP Integration', link: '/guide/mcp' },
            { text: 'Troubleshooting', link: '/guide/troubleshooting' },
            { text: 'Contributing', link: '/guide/contributing' },
          ]
        }
      ],
      '/reference/': [
        {
          text: 'Reference',
          items: [
            { text: 'CLI Commands', link: '/reference/cli' },
            { text: 'Configuration', link: '/reference/configuration' },
            { text: 'Environment Variables', link: '/reference/env-variables' },
            { text: 'API Reference', link: '/reference/api' },
          ]
        }
      ],
      '/examples/': [
        {
          text: 'Examples',
          items: [
            { text: 'Overview', link: '/examples/' },
            { text: 'Basic Setup', link: '/examples/basic-setup' },
            { text: 'E-commerce Store', link: '/examples/ecommerce' },
            { text: 'SaaS Dashboard', link: '/examples/saas' },
            { text: 'Blog Platform', link: '/examples/blog' },
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/Multi-Sync/carla-nextjs' },
      { icon: 'discord', link: 'https://discord.com/invite/YHmsekzMV5' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present Interworky'
    },

    search: {
      provider: 'local'
    },

    editLink: {
      pattern: 'https://github.com/Multi-Sync/carla-nextjs/edit/main/docs/:path',
      text: 'Edit this page on GitHub'
    }
  },

  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#5f67ee' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:locale', content: 'en' }],
    ['meta', { property: 'og:title', content: 'Carla Next.js | AI Agent for Websites' }],
    ['meta', { property: 'og:site_name', content: 'Carla Next.js' }],
    ['meta', { property: 'og:url', content: 'https://carla.interworky.com' }],
  ]
})
