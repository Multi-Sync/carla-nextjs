---
layout: home

hero:
  name: Carla Next.js
  text: AI Agent for Your Website
  tagline: Turn your Next.js API routes into AI-powered tools for Carla - Customer Support + Analytics + Performance Monitoring + Bug Fixes
  image:
    src: /hero-image.svg
    alt: Carla Next.js
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/Multi-Sync/carla-nextjs

features:
  - icon: 🔍
    title: Auto-Discovery
    details: Automatically scans your API routes and generates tool definitions using TypeScript AST analysis.

  - icon: 🤖
    title: AI-Ready
    details: Works seamlessly with OpenAI Realtime API for both text and voice interactions.

  - icon: 📦
    title: Zero Config
    details: One command to install the widget and get started. No complex configuration needed.

  - icon: 🔄
    title: Smart Sync
    details: Push your tools to the Interworky dashboard and keep them in sync effortlessly.

  - icon: 🛠️
    title: Auto-Fix
    details: Automatically detects and fixes common issues in your tool definitions.

  - icon: 🎯
    title: Type-Safe
    details: Full TypeScript support with type inference and validation.

  - icon: 🚀
    title: MCP Protocol
    details: Built-in support for Model Context Protocol for AI editor integration.

  - icon: 💬
    title: Real-time Chat
    details: Embed the Carla widget for real-time customer support with access to your APIs.

  - icon: 📊
    title: Analytics & Monitoring
    details: Track performance, monitor bugs, and analyze customer interactions.
---

## Quick Start

::: code-group

```bash [npm]
# Add your API key
echo 'NEXT_PUBLIC_CARLA_API_KEY="your-api-key"' >> .env.local

# Install the widget
npx @interworky/carla-nextjs install

# Scan and sync your API routes
npx @interworky/carla-nextjs scan
npx @interworky/carla-nextjs sync
```

```bash [yarn]
# Add your API key
echo 'NEXT_PUBLIC_CARLA_API_KEY="your-api-key"' >> .env.local

# Install the widget
yarn dlx @interworky/carla-nextjs install

# Scan and sync your API routes
yarn dlx @interworky/carla-nextjs scan
yarn dlx @interworky/carla-nextjs sync
```

```bash [pnpm]
# Add your API key
echo 'NEXT_PUBLIC_CARLA_API_KEY="your-api-key"' >> .env.local

# Install the widget
pnpm dlx @interworky/carla-nextjs install

# Scan and sync your API routes
pnpm dlx @interworky/carla-nextjs scan
pnpm dlx @interworky/carla-nextjs sync
```

:::

## What's Included?

### CLI Tool
A powerful command-line interface for scanning, generating, and syncing your API tools.

### Widget Component
A ready-to-use React component that embeds Carla on your website with zero configuration.

### MCP Integration
Full Model Context Protocol support for integration with AI editors like Cursor and Claude Desktop.

### TypeScript Support
First-class TypeScript support with automatic type inference and validation.

## Get Your API Key

1. Go to [interworky.com](https://interworky.com)
2. Create an account (or sign in)
3. Navigate to **Integrations** from the sidebar
4. Copy your API key

## Community

Join our community to get help, share your projects, and stay updated:

- [Discord Community](https://discord.com/invite/YHmsekzMV5) - Chat with the team and community
- [GitHub Discussions](https://github.com/Multi-Sync/carla-nextjs/discussions) - Ask questions and share ideas
- [GitHub Issues](https://github.com/Multi-Sync/carla-nextjs/issues) - Report bugs and request features

## Why Carla?

Carla is an AI agent that goes beyond simple chatbots. It provides:

- **Customer Support** - Answer questions, handle inquiries, and resolve issues
- **Analytics** - Track user behavior and gather insights
- **Performance Monitoring** - Monitor your app's performance in real-time
- **Bug Fixes** - Automatically detect and help fix issues

By integrating your Next.js API routes, Carla becomes a powerful assistant that can actually interact with your application's backend, not just provide canned responses.
