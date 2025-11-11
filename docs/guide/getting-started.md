# Getting Started

This guide will walk you through integrating Carla into your Next.js application. You'll be up and running with **free performance monitoring, error tracking, and analytics** in just a few minutes.

## Prerequisites

Before you begin, make sure you have:

- **Node.js 18+** installed on your machine
- A **Next.js 14+** project (App Router or Pages Router)
- An **Interworky account with API key** - Don't have one? See [Step 1](#step-1-create-your-account-get-api-key) below to create your free account

::: tip 🆓 Free Forever - No Credit Card Required
The free tier includes performance monitoring, error tracking, and analytics with **unlimited usage**. No credit card needed to get started. You can upgrade to premium features ($19.99/month with 7-day free trial) later if you want AI-powered Auto-Fix or the Customer Support widget.
:::

## Quick Start

### Step 1: Create Your Account & Get API Key

::: info 🎯 First Time Setup
Before you can use Carla, you need to create a free account on Interworky and get your API key. This takes about 2 minutes and requires no credit card.
:::

**Create your account:**

1. **Visit [interworky.com](https://interworky.com)**
   - Click the **"Sign Up"** button in the top right
   - Or go directly to the signup page: [interworky.com/signup](https://interworky.com/signup)

2. **Complete registration**
   - Enter your email address
   - Create a password
   - Agree to terms and click "Create Account"

3. **Verify your email**
   - Check your inbox for a verification email from Interworky
   - Click the verification link
   - You'll be redirected to the dashboard

4. **Get your API key**
   - Once logged in, navigate to **Dashboard → Integrations** (look in the left sidebar)
   - Your API key will be displayed at the top of the page
   - Click the **"Copy"** button to copy your API key
   - Keep this key safe - you'll need it in the next step

::: warning Keep Your API Key Safe
Your API key is like a password - don't commit it to version control or share it publicly. The Carla CLI will automatically add it to your `.env.local` file (which should be in `.gitignore`).
:::

### Step 2: Initialize Carla in Your Project

From your Next.js project directory, run:

```bash
npx @interworky/carla-nextjs init
```

This will:
- Prompt you to enter your API key
- Create `.carla/` directory for configuration
- Automatically add `NEXT_PUBLIC_CARLA_API_KEY` to your `.env.local`
- Authenticate your project with Interworky

::: warning Important
After running `init`, you'll be directed to the dashboard to choose your integration path. Continue to Step 3.
:::

### Step 3: Choose Your Integration Path

In the dashboard, you'll see two options for plugin setup:

#### Option A: Manual Integration (Free Tier) ✨

**Best for:** Getting started quickly, trying out Carla, free monitoring

**What you get:**
- ✅ Performance monitoring (real-time)
- ✅ Error detection with stack traces
- ✅ Analytics and visitor insights
- ✅ 10,000+ device awareness
- ❌ No GitHub integration required
- ❌ No credit card required

**Setup steps:**
1. Click "Continue with Manual Setup" in the dashboard
2. Run the widget installation command:
   ```bash
   npx @interworky/carla-nextjs install
   ```
3. Scan your API routes:
   ```bash
   npx @interworky/carla-nextjs scan
   ```
4. Sync tools to dashboard:
   ```bash
   npx @interworky/carla-nextjs sync
   ```
5. Start your dev server and verify the widget appears

#### Option B: GitHub Integration (Premium - 7-Day Trial) 🚀

**Best for:** Teams wanting AI-powered Auto-Fix and Customer Support

**What you get:**
- ✅ Everything in Free Tier
- ✅ AI-Powered Auto-Fix (AI detects errors and creates GitHub PRs)
- ✅ GitHub OAuth integration
- ✅ Automated pull request creation
- ✅ AI Customer Support widget (voice & text)
- 💳 Requires credit card for 7-day free trial
- 💰 $19.99/month after trial (cancel anytime)

**Setup steps:**
1. Click "Start Free Trial" in the dashboard
2. Complete checkout (credit card required, **free for 7 days**)
3. Connect your GitHub account via OAuth
4. Select the repository for your Next.js app
5. The dashboard will guide you through:
   - Installing the widget component
   - Scanning API routes
   - Enabling Auto-Fix for error detection
6. Start your dev server and verify everything works

::: tip Which Should I Choose?
- **Start with Manual (Free)** if you want to try Carla's monitoring features without commitment
- **Choose GitHub (Premium Trial)** if you want AI to automatically fix errors and create PRs
- You can **upgrade from Free to Premium anytime** from Dashboard → Settings → Billing
:::

## Detailed Setup: Manual Integration (Free)

### 1. Install the Widget Component

```bash
npx @interworky/carla-nextjs install
```

This will:
- Detect whether you're using TypeScript or JavaScript
- Detect whether you're using App Router or Pages Router
- Generate the appropriate widget component
- Add it to your layout or `_app` file

The widget enables:
- Performance monitoring dashboard
- Error tracking in real-time
- Analytics data collection

#### Installation Options

```bash
# Install on specific pages only
npx @interworky/carla-nextjs install --pages "/,/products,/pricing"

# Add a custom delay (in milliseconds)
npx @interworky/carla-nextjs install --delay 2000

# Use landing page mode (minimal UI)
npx @interworky/carla-nextjs install --landing
```

### 2. Scan Your API Routes

Carla can convert your Next.js API routes into tools:

```bash
npx @interworky/carla-nextjs scan
```

This will:
- Analyze all your API routes using TypeScript AST
- Extract parameters, request bodies, and response types
- Generate tool definitions in `.carla/tools.json`
- Provide a summary of discovered routes

#### Scan Options

```bash
# Scan a specific directory
npx @interworky/carla-nextjs scan --path ./src/app/api

# Force rescan (ignore cache)
npx @interworky/carla-nextjs scan --force

# Verbose output
npx @interworky/carla-nextjs scan --verbose
```

### 3. Review and Sync Tools

Review the generated tools:

```bash
npx @interworky/carla-nextjs status
```

Sync enabled tools to Interworky dashboard:

```bash
npx @interworky/carla-nextjs sync
```

::: tip
Only tools marked as `enabled: true` in `.carla/tools.json` will be synced. You can manually edit this file to enable/disable specific tools.
:::

### 4. Verify Installation

1. Start your Next.js dev server:
   ```bash
   npm run dev
   ```

2. Open your app in a browser (usually `http://localhost:3000`)

3. Check for the Carla widget in the bottom-right corner

4. Visit your dashboard at [interworky.com/dashboard](https://interworky.com/dashboard) to see:
   - Performance metrics
   - Error tracking
   - Analytics data

## Detailed Setup: GitHub Integration (Premium)

### 1. Start Your Free Trial

From the dashboard plugin setup page:

1. Click **"Start 7-Day Free Trial"**
2. Enter credit card information (required for trial)
3. Review trial terms:
   - **Free for 7 days**
   - **$19.99/month after trial**
   - **Cancel anytime during trial at no charge**
4. Complete checkout

### 2. Connect GitHub

1. Click **"Connect GitHub"** in the dashboard
2. Authorize Interworky OAuth app
3. Grant repository access (you can limit to specific repos)
4. Select your Next.js project repository

### 3. Complete Setup

Follow the dashboard prompts to:

```bash
# Install widget (if not already done)
npx @interworky/carla-nextjs install

# Scan API routes
npx @interworky/carla-nextjs scan

# Sync tools
npx @interworky/carla-nextjs sync
```

### 4. Enable Auto-Fix

In your dashboard:

1. Go to **Dashboard → Home**
2. Find the **Auto-Fix** module
3. Click **"Enable Auto-Fix"**
4. Configure which types of errors should trigger automatic PRs

### 5. Enable Customer Support Widget

In your dashboard:

1. Go to **Dashboard → Home**
2. Find the **Chat Widget** module
3. Click **"Enable Customer Support"**
4. Customize widget appearance and behavior
5. The AI widget will now appear on your website for customer interactions

## Verify Premium Features

### Test Auto-Fix

1. Introduce an intentional error in your app (e.g., syntax error, undefined variable)
2. Deploy or run locally
3. Check your dashboard for error detection
4. Within minutes, Auto-Fix should create a GitHub PR with a suggested fix
5. Review the PR and merge if the fix is correct

### Test Customer Support Widget

1. Visit your website where the widget is installed
2. Open the chat widget
3. Ask a question about your product/service
4. The AI should respond intelligently based on your website content
5. Test both text and voice chat (if enabled)

## Managing Your Subscription

### Trial Management

During your 7-day trial:

- **Check days remaining:** Visit Dashboard → Settings → Billing
- **Trial banner:** Shows countdown in your dashboard
- **Email reminders:** Sent at 3 days, 1 day, and day of trial end
- **Cancel anytime:** No charge if you cancel before trial expires

### After Trial

**If you keep the subscription:**
- Automatic charge of $19.99/month on day 8
- Premium features remain active
- Month-to-month billing (no long-term contract)

**If you cancel during trial:**
- Premium features disabled after trial ends
- Free tier features remain active forever
- No charges applied
- Can re-subscribe anytime

### Upgrading from Free to Premium

If you started with the free tier and want premium features:

1. Go to **Dashboard → Settings → Billing**
2. Click **"Start 7-Day Free Trial"**
3. Complete checkout
4. Connect GitHub (if using Auto-Fix)
5. Enable premium features in your dashboard

## Next Steps

Now that you have Carla set up, explore these topics:

### For Free Tier Users
- [Performance Monitoring Guide](/guide/performance-monitoring) - Track your app's performance
- [Analytics Guide](/guide/analytics) - Understand visitor behavior and insights
- [How It Works](/guide/how-it-works) - Understand the architecture
- [Widget Customization](/guide/widget) - Customize the widget appearance
- [Pricing & Features](/guide/pricing) - Learn about premium features

### For Premium Tier Users
- [Auto-Fix Guide](/guide/auto-fix) - Configure AI-powered error fixing and GitHub PR automation
- [Customer Support Widget](/guide/customer-support) - Set up the AI chat widget
- [Tool Generation](/guide/tool-generation) - Learn about tool definitions
- [Configuration](/guide/configuration) - Advanced configuration options

## Troubleshooting

### Widget Not Showing Up?

1. Check that `NEXT_PUBLIC_CARLA_API_KEY` is set in your `.env.local`
2. Make sure you've restarted your dev server after adding the env variable
3. Check the browser console for errors
4. Verify the widget component is imported in your layout/`_app` file
5. Ensure your API key is valid in Dashboard → Integrations

### Tools Not Syncing?

1. Make sure tools are marked as `enabled: true` in `.carla/tools.json`
2. Check that your API key has the correct permissions
3. Run `npx @interworky/carla-nextjs status --verbose` for detailed output
4. Try running `npx @interworky/carla-nextjs fix` to auto-fix common issues

### Premium Features Not Working?

1. **Auto-Fix not creating PRs:**
   - Verify you're on an active trial or paid subscription (Dashboard → Settings → Billing)
   - Check GitHub OAuth connection is active
   - Ensure Auto-Fix is enabled in Dashboard → Home
   - Verify repository permissions in GitHub

2. **Customer Support widget not responding:**
   - Confirm premium subscription is active
   - Check that Customer Support is enabled in dashboard
   - Ensure the widget script has loaded (check browser console)
   - Verify your website content has been scraped for AI training

3. **Trial expired but still showing premium features:**
   - The dashboard may take a few minutes to update after trial expiration
   - Log out and log back in to refresh subscription status
   - Contact support if features remain incorrectly enabled

### Billing Issues?

- **Can't cancel trial:** Visit Dashboard → Settings → Billing → "Cancel Subscription"
- **Unexpected charges:** Email support@interworky.com with your account details
- **Payment failed:** Update payment method in Dashboard → Settings → Billing
- **Refund request:** Contact support@interworky.com within 30 days

### Need More Help?

- [Full Troubleshooting Guide](/guide/troubleshooting)
- [Pricing & Features FAQ](/guide/pricing#pricing-faqs)
- [Discord Community](https://discord.com/invite/YHmsekzMV5)
- [GitHub Issues](https://github.com/Multi-Sync/carla-nextjs/issues)
- [Email Support](mailto:support@interworky.com)
