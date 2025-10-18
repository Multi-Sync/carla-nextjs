# Getting Started

This guide will help you integrate Carla into your Next.js application in just a few minutes.

## Prerequisites

Before you begin, make sure you have:

- **Node.js 18+** installed on your machine
- A **Next.js 14+** project (App Router or Pages Router)
- An **Interworky account** with an API key

::: tip
Don't have an API key yet? Get one at [interworky.com](https://interworky.com) - it's free to get started!
:::

## Installation

### Step 1: Get Your API Key

1. Visit [interworky.com](https://interworky.com)
2. Sign up or log in to your account
3. Go to **Integrations** from the sidebar
4. Copy your API key

### Step 2: Add API Key to Your Project

Add your API key to your environment variables:

::: code-group

```bash [.env.local]
NEXT_PUBLIC_CARLA_API_KEY="your-api-key-here"
```

```bash [.env.development]
NEXT_PUBLIC_CARLA_API_KEY="your-api-key-here"
```

:::

::: warning
Make sure to use the `NEXT_PUBLIC_` prefix so the key is available on the client side for the widget.
:::

### Step 3: Install the Widget

Run the install command to add the Carla widget to your app:

```bash
npx @interworky/carla-nextjs install
```

This will:
- Detect whether you're using TypeScript or JavaScript
- Detect whether you're using App Router or Pages Router
- Generate the appropriate widget component
- Add it to your layout or `_app` file

#### Installation Options

You can customize the installation with these flags:

```bash
# Install on specific pages only
npx @interworky/carla-nextjs install --pages "/,/products,/pricing"

# Add a custom delay (in milliseconds)
npx @interworky/carla-nextjs install --delay 2000

# Use landing page mode (minimal UI)
npx @interworky/carla-nextjs install --landing

# Interactive setup wizard
npx @interworky/carla-nextjs interactive
```

### Step 4: Scan Your API Routes

Scan your API routes to generate tool definitions:

```bash
npx @interworky/carla-nextjs scan
```

This will:
- Analyze all your API routes using TypeScript AST
- Extract parameters, request bodies, and response types
- Generate tool definitions in `.carla/tools.json`
- Provide a summary of what was found

#### Scan Options

```bash
# Scan a specific directory
npx @interworky/carla-nextjs scan --path ./src/app/api

# Force rescan (ignore cache)
npx @interworky/carla-nextjs scan --force

# Verbose output
npx @interworky/carla-nextjs scan --verbose
```

### Step 5: Review and Sync

Review the generated tools:

```bash
npx @interworky/carla-nextjs status
```

Sync enabled tools to Interworky:

```bash
npx @interworky/carla-nextjs sync
```

::: tip
Only tools marked as `enabled: true` in `.carla/tools.json` will be synced. You can manually edit this file to enable/disable specific tools.
:::

## Verify Installation

### Check the Widget

1. Start your Next.js dev server:
   ```bash
   npm run dev
   ```

2. Open your app in a browser (usually `http://localhost:3000`)

3. Look for the Carla widget in the bottom-right corner

### Test the Tools

1. Open the widget
2. Ask Carla to perform an action that uses one of your API routes
3. Carla should be able to call your APIs and return results

## Next Steps

Now that you have Carla set up, explore these topics:

- [How It Works](/guide/how-it-works) - Understand the architecture
- [Widget Customization](/guide/widget) - Customize the widget appearance
- [Tool Generation](/guide/tool-generation) - Learn about tool definitions
- [Configuration](/guide/configuration) - Advanced configuration options
- [Examples](/examples/) - See real-world examples

## Troubleshooting

### Widget Not Showing Up?

1. Check that `NEXT_PUBLIC_CARLA_API_KEY` is set in your `.env.local`
2. Make sure you've restarted your dev server after adding the env variable
3. Check the browser console for errors
4. Verify the widget component is imported in your layout/`_app` file

### Tools Not Syncing?

1. Make sure tools are marked as `enabled: true` in `.carla/tools.json`
2. Check that your API key has the correct permissions
3. Run `npx @interworky/carla-nextjs status --verbose` for detailed output
4. Try running `npx @interworky/carla-nextjs fix` to auto-fix common issues

### Need More Help?

- [Troubleshooting Guide](/guide/troubleshooting)
- [Discord Community](https://discord.com/invite/YHmsekzMV5)
- [GitHub Issues](https://github.com/Multi-Sync/carla-nextjs/issues)
