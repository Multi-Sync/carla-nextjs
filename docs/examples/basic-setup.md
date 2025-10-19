# Basic Setup Example

A minimal example to get Carla working with your Next.js app in minutes.

## Quick Start

This is the fastest way to add Carla to your Next.js application with minimal configuration.

## Step 1: Get Your API Key

1. Visit [interworky.com](https://interworky.com)
2. Create an account (or sign in)
3. Navigate to **Integrations** from the sidebar
4. Copy your API key

## Step 2: Add API Key to Environment

```bash
# .env.local
NEXT_PUBLIC_CARLA_API_KEY="your-api-key-here"
```

## Step 3: Install Carla

```bash
npx @interworky/carla-nextjs install
```

That's it! The CLI will:
- ✅ Detect your Next.js version (App Router or Pages Router)
- ✅ Detect TypeScript or JavaScript
- ✅ Generate the widget component
- ✅ Add it to your layout
- ✅ Scan your API routes

## Step 4: Start Your App

```bash
npm run dev
```

Visit your app and you'll see Carla's widget in the bottom-right corner!

## What You Get Out of the Box

### 1. Chat Widget

A floating button that opens Carla's chat interface:
- Voice and text support
- Multilingual (100+ languages)
- Mobile-responsive
- Customizable position and colors

### 2. API Route Tools

If you have existing API routes, Carla can already use them! For example:

```typescript
// app/api/hello/route.ts
export async function GET() {
  return Response.json({ message: 'Hello from Next.js!' })
}
```

**User**: "Call the hello API"
**Carla**: *Calls GET /api/hello* → "The API responded with: 'Hello from Next.js!'"

### 3. Dashboard Access

Log in to your Interworky dashboard to:
- View all conversations
- See analytics
- Customize Carla's appearance
- Manage tools

## Simple API Route Example

Let's create a basic API route that Carla can use:

```typescript
// app/api/time/route.ts
export async function GET() {
  const now = new Date()

  return Response.json({
    time: now.toLocaleTimeString(),
    date: now.toLocaleDateString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  })
}
```

Now run:

```bash
npx @interworky/carla-nextjs scan
npx @interworky/carla-nextjs sync
```

**User**: "What time is it?"
**Carla**: *Calls GET /api/time* → "It's 3:45 PM (Pacific Time)"

## Customizing the Widget

You can customize Carla's appearance in the generated component:

```typescript
// src/components/CarlaWidget.tsx (or .js)
<script
  src="https://storage.googleapis.com/multisync/interworky/production/interworky.js"
  data-api-key={process.env.NEXT_PUBLIC_CARLA_API_KEY}
  data-position="bottom-right"  // or "bottom-left", "top-right", "top-left"
  data-color="#058A7C"           // Your brand color
></script>
```

## Adding More Tools

As you build more API routes, just re-run the scan:

```bash
# After adding new routes
npx @interworky/carla-nextjs scan
npx @interworky/carla-nextjs sync
```

Carla will automatically discover and sync your new endpoints!

## Example Conversations

With just the basic setup, users can already:

### General Questions

> **User**: "What is this site about?"
>
> **Carla**: "This is a Next.js application powered by Carla AI. I can help answer questions and assist with tasks. What brings you here today?"

### Voice Support

> **User**: *clicks microphone* "Hey Carla, can you help me?"
>
> **Carla**: *responds via voice* "Of course! I'm here to help. What do you need?"

### API Interactions

> **User**: "Show me the current time"
>
> **Carla**: *Calls your /api/time endpoint* "It's 3:45 PM, October 18, 2024 in Pacific Time"

## Next Steps

### 1. Add More API Routes

Build out your app's functionality with API routes. Carla will be able to use them automatically!

**Simple examples:**
- `/api/weather` - Get weather information
- `/api/status` - Check system status
- `/api/search` - Search your content

### 2. Configure Tool Permissions

Review which tools Carla can use:

```bash
npx @interworky/carla-nextjs status
```

Edit `.carla/tools.json` to enable/disable specific endpoints.

### 3. Explore Advanced Examples

Check out these complete examples:
- [E-commerce Store](/examples/ecommerce)
- [SaaS Dashboard](/examples/saas)
- [Blog Platform](/examples/blog)

## Common Commands

```bash
# Check current status
npx @interworky/carla-nextjs status

# Scan for new API routes
npx @interworky/carla-nextjs scan

# Sync tools to dashboard
npx @interworky/carla-nextjs sync

# Auto-fix common issues
npx @interworky/carla-nextjs fix

# Start MCP server (for AI editor integration)
npx @interworky/carla-nextjs mcp
```

## Troubleshooting

### Widget Not Showing?

1. Check your API key is set in `.env.local`
2. Make sure you restarted your dev server after adding the key
3. Check browser console for errors

### Carla Can't Call My APIs?

1. Run `npx @interworky/carla-nextjs scan` to detect routes
2. Run `npx @interworky/carla-nextjs sync` to push to dashboard
3. Check `.carla/tools.json` - make sure tools are `enabled: true`

### Need Help?

- [Full Documentation](https://multi-sync.github.io/carla-nextjs)
- [Discord Community](https://discord.com/invite/YHmsekzMV5)
- [GitHub Issues](https://github.com/Multi-Sync/carla-nextjs/issues)

## Complete Minimal Example

Here's a complete, minimal Next.js 14 app with Carla:

```
my-app/
├── .env.local                 # NEXT_PUBLIC_CARLA_API_KEY="..."
├── app/
│   ├── layout.tsx             # Includes CarlaWidget
│   ├── page.tsx               # Your homepage
│   ├── api/
│   │   └── hello/
│   │       └── route.ts       # Simple GET endpoint
│   └── components/
│       └── CarlaWidget.tsx    # Auto-generated by CLI
└── package.json
```

**Total setup time**: ~2 minutes
**Lines of code**: ~10 (generated for you)
**Ready for**: Production use!

## What's Next?

Now that Carla is installed, you can:

1. **Build your app** - Add features with API routes
2. **Carla learns automatically** - Scan and sync as you build
3. **Users get help** - Via voice or text, in any language
4. **You get insights** - View conversations and analytics in dashboard

## Production Deployment

Carla works the same in production! Just make sure:

1. ✅ `NEXT_PUBLIC_CARLA_API_KEY` is set in your hosting environment
2. ✅ Your app is deployed (Vercel, Netlify, etc.)
3. ✅ Tools are synced via `npx @interworky/carla-nextjs sync`

That's it! Carla scales with your app automatically.

## Related Resources

- [Getting Started Guide](/guide/getting-started) - Detailed walkthrough
- [CLI Reference](/reference/cli) - All available commands
- [How It Works](/guide/how-it-works) - Technical deep-dive

---

**Questions?** Join our [Discord](https://discord.com/invite/YHmsekzMV5) - we're here to help!
