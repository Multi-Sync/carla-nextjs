# Pricing & Tiers

Carla offers a **freemium model** designed to get you started quickly with essential monitoring features, while premium AI-powered capabilities are available through a paid subscription.

## Overview

```
┌─────────────────────────────────────────────────────┐
│                    FREE TIER                        │
│  ✅ Performance Monitoring                          │
│  ✅ Error Detection & Tracking                      │
│  ✅ Analytics & Visitor Insights                    │
│  ✅ 10,000+ Device Awareness                        │
│  ✅ Stack Traces & Error Details                    │
│  ✅ Real-time Monitoring Dashboard                  │
│                                                     │
│  💳 No credit card required                         │
│  🚀 Start immediately after signup                  │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│             PREMIUM TIER - $19.99/month             │
│  🎉 7-day free trial available                      │
│                                                     │
│  🤖 AI-Powered Auto-Fix                             │
│     • Automatic error detection                     │
│     • GitHub PR creation with fixes                 │
│     • Integration update automation                 │
│                                                     │
│  💬 AI Customer Support Chat Widget                 │
│     • Voice & text chat capabilities                │
│     • Intelligent customer assistance               │
│     • Embeddable on your website                    │
│                                                     │
│  🔗 GitHub Integration                              │
│     • OAuth-based authentication                    │
│     • Automated pull request creation               │
│     • Branch management                             │
│                                                     │
│  🔌 MCP Server for API Routes                       │
│     • Model Context Protocol support                │
│     • API route tool generation                     │
│                                                     │
│  ✨ All Free Tier Features Included                 │
└─────────────────────────────────────────────────────┘
```

## Free Tier

### What's Included

The free tier provides **essential monitoring and analytics** for your Next.js application at no cost:

#### Performance Monitoring
- Real-time performance tracking
- Page load times
- API response times
- Resource usage metrics
- Historical performance data

#### Error Detection & Tracking
- Automatic error capture
- Stack traces with source mapping
- Error frequency and trends
- Browser and device context
- Session replay capabilities

#### Analytics & Insights
- Visitor tracking and demographics
- Page view analytics
- User journey mapping
- Device and browser detection (10,000+ devices)
- Geographic data

#### Dashboard Access
- Comprehensive monitoring dashboard
- Real-time alerts and notifications
- Custom date range filtering
- Export capabilities

### Getting Started (Free)

```bash
# Install and authenticate
npx @interworky/carla-nextjs init

# Scan your API routes
npx @interworky/carla-nextjs scan

# Sync to dashboard
npx @interworky/carla-nextjs sync
```

**No credit card required** - Start monitoring your application immediately after signing up.

## Premium Tier - $19.99/month

### Why Premium Features Require Payment

Premium features use **advanced AI services** to provide intelligent automation and support capabilities:

- **Auto-Fix** uses AI to analyze errors, understand your codebase context, and generate accurate code fixes
- **Customer Support Widget** uses AI to provide real-time, intelligent responses to customer inquiries
- These AI services have ongoing operational costs (compute, API usage, model hosting)

### 7-Day Free Trial

Try all premium features completely free for 7 days:

- ✅ Full access to Auto-Fix and AI Customer Support
- 💳 Credit card required to start trial
- 🔄 Cancel anytime during trial at no charge
- 💰 After trial: $19.99/month unless you cancel
- 📧 Reminder emails sent before trial ends

### Premium Features Explained

#### 🤖 AI-Powered Auto-Fix

Automatically detect errors in your Next.js application and create GitHub pull requests with suggested fixes:

**How It Works:**
1. Carla monitors your application for errors
2. When an error is detected, AI analyzes the stack trace and codebase
3. Auto-Fix generates a code fix addressing the root cause
4. A pull request is automatically created in your GitHub repository
5. You review and merge the PR (or request changes)

**Benefits:**
- Reduce time spent debugging
- Get fixes even when you're offline
- Learn from AI-generated solutions
- Maintain code quality with PR review process

**Requirements:**
- Premium subscription (or active trial)
- GitHub repository connected via OAuth
- Next.js 14+ application

**Learn more:** [Auto-Fix Guide](./auto-fix.md)

#### 💬 AI Customer Support Chat Widget

Embed an intelligent AI-powered chat widget on your website to handle customer inquiries:

**Features:**
- Voice and text chat support
- Trained on your website content
- Intelligent response generation
- Customizable appearance
- Mobile-responsive design
- Real-time conversation handling

**Use Cases:**
- Answer common customer questions
- Provide product information
- Guide users through onboarding
- Collect customer feedback
- Escalate complex issues to human support

**Setup:**
```bash
# Install the widget component
npx @interworky/carla-nextjs install
```

The widget is added to your Next.js app and can be customized through the dashboard.

**Learn more:** [Customer Support Widget Guide](./customer-support.md)

#### 🔗 GitHub Integration

Premium tier includes seamless GitHub integration for Auto-Fix:

- **OAuth Authentication** - Secure, one-click GitHub connection
- **Repository Access** - Read and write access to create PRs
- **Branch Management** - Automatic branch creation for fixes
- **PR Creation** - Detailed PR descriptions with fix explanations
- **Status Updates** - Real-time PR status in dashboard

#### 🔌 MCP Server for API Routes

The Model Context Protocol server enables AI coding assistants to discover and use your Next.js API routes:

- Expose API routes as MCP tools
- Works with Cursor, Claude Code, and other MCP-compatible tools
- Automatic tool definition generation
- Real-time synchronization

**Learn more:** [MCP Guide](./mcp.md)

## Subscription Management

### Starting Your Premium Trial

1. **From Dashboard:**
   - Navigate to Settings → Billing
   - Click "Start 7-Day Free Trial"
   - Enter credit card information
   - Trial begins immediately

2. **During Onboarding:**
   - Choose "Connect GitHub" during plugin setup
   - Click "Start Free Trial" when prompted
   - Complete checkout process

### During Trial Period

- **Days Remaining:** Visible in dashboard banner
- **Full Access:** All premium features unlocked
- **Reminders:** Email notifications at 3 days, 1 day, and day of trial end
- **Cancel Anytime:** No charge if you cancel before trial ends

### After Trial

**If You Keep Subscription:**
- Automatic charge of $19.99/month
- Premium features remain active
- Month-to-month billing (no long-term contract)
- Cancel anytime

**If You Cancel:**
- Premium features disabled (Auto-Fix, Customer Support)
- Free tier features remain active
- Historical data preserved
- Can re-subscribe anytime

### Managing Your Subscription

Access subscription management in **Dashboard → Settings → Billing**:

- View current plan and billing date
- Update payment method
- View billing history
- Cancel subscription
- Restart trial (if eligible)

## Pricing FAQs

### Can I start with the free tier and upgrade later?

**Yes!** Start with the free tier to monitor your app's performance and analytics. When you need Auto-Fix or the Customer Support widget, upgrade to premium with a 7-day free trial.

### What happens if I cancel my premium subscription?

Auto-Fix and AI Customer Support features will be disabled. You'll still have full access to the free tier features (performance monitoring, error tracking, analytics). Your historical data is preserved.

### Is there a long-term contract?

**No.** Pay month-to-month and cancel anytime. No hidden fees or cancellation penalties.

### Can I use GitHub integration without premium?

GitHub **OAuth connection** is available on free tier for repository linking. However, **Auto-Fix** (the feature that creates pull requests with error fixes) requires a premium subscription because it uses AI services.

### What if I need Auto-Fix for multiple projects?

One premium subscription covers **all projects** in your Interworky account. Auto-Fix works across all connected Next.js applications.

### Do free tier features have usage limits?

**No hard limits** on core functionality (error tracking, performance monitoring, analytics). Reasonable fair-use policies apply to prevent abuse.

### How does billing work for the trial?

- **Day 0-7:** Free trial period - no charges
- **Day 8:** First charge of $19.99 (if not canceled)
- **Each month thereafter:** $19.99 on the same day of the month

Reminder emails sent before the first charge.

### Can I get a refund?

If you're not satisfied within the first 30 days of paid service, contact support@interworky.com for a full refund.

### What payment methods do you accept?

We use **Stripe** for secure payment processing:
- Credit cards (Visa, Mastercard, Amex, Discover)
- Debit cards
- Apple Pay / Google Pay
- Additional payment methods vary by region

### Is my payment information secure?

Yes. All payments are processed through **Stripe**, a PCI-compliant payment processor. Carla never stores your credit card details.

### What if my trial expires but I'm not ready to decide?

If your trial expires and you're not ready to commit, you can:
1. Let it expire - revert to free tier with no charge
2. Contact support for a trial extension (case-by-case basis)
3. Re-start a trial later (eligibility varies)

## Feature Comparison Matrix

| Feature | Free Tier | Premium Tier |
|---------|-----------|--------------|
| **Performance Monitoring** | ✅ Unlimited | ✅ Included |
| **Error Detection & Tracking** | ✅ Unlimited | ✅ Included |
| **Analytics & Insights** | ✅ Unlimited | ✅ Included |
| **10,000+ Device Awareness** | ✅ Yes | ✅ Yes |
| **Dashboard Access** | ✅ Full Access | ✅ Full Access |
| **Real-time Alerts** | ✅ Yes | ✅ Yes |
| **Stack Traces** | ✅ Yes | ✅ Yes |
| **Historical Data** | ✅ 90 days | ✅ Unlimited |
| **GitHub OAuth Connection** | ✅ Yes | ✅ Yes |
| **AI-Powered Auto-Fix** | ❌ No | ✅ Yes |
| **Auto PR Creation** | ❌ No | ✅ Yes |
| **AI Customer Support Widget** | ❌ No | ✅ Yes |
| **Voice Chat Support** | ❌ No | ✅ Yes |
| **MCP Server** | ⚠️ Limited | ✅ Full |
| **Priority Support** | ❌ No | ✅ Yes |
| **Price** | **FREE** | **$19.99/month** |
| **Credit Card Required** | ❌ No | ✅ Yes |
| **Free Trial Available** | N/A | ✅ 7 days |

## Next Steps

### Start with Free Tier
```bash
npx @interworky/carla-nextjs init
```

### Try Premium Features
Visit your [Dashboard Settings](https://interworky.com/dashboard/settings?tab=billing) to start your 7-day free trial.

### Questions?
- 📧 Email: support@interworky.com
- 💬 Discord: [Join our community](https://discord.com/invite/YHmsekzMV5)
- 📖 Documentation: [Full Guides](./index.md)
