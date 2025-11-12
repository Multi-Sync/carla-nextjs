# Analytics & Insights

**Free Feature** - Available on all tiers with unlimited usage

Carla's Analytics provides comprehensive insights into visitor behavior, user journeys, and engagement metrics for your Next.js application - completely free with no usage limits.

## Overview

Analytics is **always free** and includes:

- ✅ Visitor tracking and demographics
- ✅ Page view analytics
- ✅ User journey mapping
- ✅ Device and browser detection (10,000+ devices)
- ✅ Geographic data and heatmaps
- ✅ Conversion tracking
- ✅ Session replay
- ✅ Custom event tracking
- ✅ Real-time visitor monitoring
- ✅ Historical data (90 days on free tier, unlimited on premium)

No credit card required, no page view limits, no hidden fees.

## Getting Started

Analytics is automatically enabled once you install the Carla widget:

```bash
# Install widget to start tracking
npx @interworky/carla-nextjs install

# Analytics begins immediately
npm run dev
```

Visit your dashboard at [interworky.com/dashboard/analytics](https://interworky.com/dashboard/analytics) to see visitor data.

## Key Metrics

### Visitor Overview

Track who's visiting your application:

- **Total Visitors** - Unique visitors over selected time period
- **New vs Returning** - First-time vs repeat visitors
- **Active Users** - Currently browsing (real-time)
- **Session Duration** - Average time spent on site
- **Bounce Rate** - Percentage leaving after one page

**Example Dashboard:**

```
Today's Metrics:
👥 Visitors: 1,234 (↑ 12% vs yesterday)
🆕 New: 845 (68%)
🔁 Returning: 389 (32%)
⏱️ Avg Session: 4m 32s
📊 Bounce Rate: 42%
```

### Page View Analytics

Understand which pages are most popular:

| Page      | Views | Unique | Avg Time | Bounce % |
| --------- | ----- | ------ | -------- | -------- |
| /         | 5,234 | 3,456  | 1m 24s   | 38%      |
| /products | 2,345 | 1,890  | 3m 12s   | 24%      |
| /pricing  | 1,234 | 987    | 2m 45s   | 56%      |
| /blog     | 876   | 654    | 5m 32s   | 18%      |

**Insights:**

- **High bounce on /pricing** - May need clearer pricing or CTA
- **Long time on /blog** - Content is engaging
- **/products has good engagement** - Low bounce, decent time

### User Journey Mapping

Visualize how users navigate through your app:

```
Common User Paths:

1. Home → Products → Checkout (45% of conversions)
   👥 1,234 users | 💰 $45,678 revenue

2. Home → Pricing → Signup (32% of conversions)
   👥 876 users | 💰 $17,352 revenue

3. Blog → Product → Checkout (12% of conversions)
   👥 345 users | 💰 $8,901 revenue

4. Home → Exit (high bounce)
   👥 2,345 users | ⚠️ No conversion
```

**Action items:** Optimize high-bounce paths, replicate successful journeys.

### Device & Browser Analytics

Comprehensive device detection covering 10,000+ devices:

#### Device Type

- **Desktop:** 52% (↑ 3%)
- **Mobile:** 42% (↓ 2%)
- **Tablet:** 6% (↔ 0%)

#### Operating Systems

- **Windows:** 35%
- **macOS:** 17%
- **iOS:** 28%
- **Android:** 18%
- **Other:** 2%

#### Browsers

- **Chrome:** 58%
- **Safari:** 24%
- **Firefox:** 10%
- **Edge:** 6%
- **Other:** 2%

#### Screen Resolutions

- **1920x1080** - 32%
- **1366x768** - 18%
- **375x667** (iPhone) - 14%
- **414x896** (iPhone) - 12%
- **Other** - 24%

**Use case:** Prioritize testing on most common configurations.

### Geographic Insights

Track visitor locations worldwide:

#### Top Countries

```
🇺🇸 United States    - 45% (2,345 visitors)
🇬🇧 United Kingdom   - 18% (934 visitors)
🇨🇦 Canada           - 12% (623 visitors)
🇦🇺 Australia        - 8% (415 visitors)
🇩🇪 Germany          - 7% (363 visitors)
```

#### Top Cities

```
🏙️ New York, US      - 8% (415 visitors)
🏙️ London, GB        - 6% (312 visitors)
🏙️ Toronto, CA       - 4% (208 visitors)
🏙️ San Francisco, US - 3% (156 visitors)
```

#### Geographic Heatmap

Interactive map showing:

- Visitor concentration by region
- Click-through rates by location
- Conversion rates by geography
- Performance metrics by region

**Business insights:**

- Focus marketing on high-converting regions
- Identify expansion opportunities
- Optimize CDN for top locations
- Localize content for key markets

## Real-Time Analytics

### Live Visitor Monitoring

See who's on your site right now:

```
🟢 Live Now: 42 active visitors

Current Pages:
  /products         - 18 visitors
  /                 - 12 visitors
  /checkout         - 7 visitors
  /pricing          - 5 visitors

Recent Activity:
  • User from New York viewed /products (2s ago)
  • User from London signed up (12s ago)
  • User from Toronto added to cart (23s ago)
```

**Use cases:**

- Monitor launch events
- Track campaign traffic in real-time
- Identify sudden traffic spikes
- Watch conversion funnel live

### Real-Time Events

Track custom events as they happen:

```
Recent Events:
  ✅ Purchase completed - $49.99 (5s ago)
  🛒 Added to cart - Product #123 (18s ago)
  👤 User signup - Premium tier (35s ago)
  📧 Newsletter subscription (1m ago)
  🔍 Search - "next.js monitoring" (2m ago)
```

## Advanced Analytics Features

### Conversion Tracking

Set up conversion goals and track completion:

#### Example Goals:

1. **Signup Conversion**
   - Goal: User completes signup
   - Current Rate: 3.2%
   - Target: 5%

2. **Purchase Conversion**
   - Goal: User completes checkout
   - Current Rate: 1.8%
   - Target: 2.5%

3. **Newsletter Signup**
   - Goal: User subscribes to newsletter
   - Current Rate: 12.5%
   - Target: 15%

#### Conversion Funnels

Visualize drop-off points in your conversion process:

```
Signup Funnel:
  Landing Page       → 100% (1,000 visitors)
  View Pricing       → 45% (450 visitors)    -55% drop
  Start Signup       → 28% (280 visitors)    -38% drop
  Complete Signup    → 18% (180 visitors)    -36% drop

Total Conversion: 18%
```

**Optimization focus:** Reduce drop-off between pricing and signup.

### Session Replay

Watch recorded sessions to understand user behavior:

- **Replay user sessions** - See exactly what users did
- **Click tracking** - Where users clicked (and didn't click)
- **Scroll depth** - How far users scrolled
- **Form interactions** - Field completion and abandonment
- **Error encounters** - When users hit errors

**Privacy:** Sensitive data (passwords, credit cards) automatically masked.

**Example use case:**

```
Session #12345 (3m 45s):
  1. Landed on homepage (0:00)
  2. Scrolled 60% down (0:15)
  3. Clicked "View Pricing" (0:32)
  4. Hovered over Premium plan (1:10)
  5. Started signup form (1:45)
  6. Abandoned at email field (2:30) ⚠️
  7. Exited site (3:45)

Insight: Users abandoning at email field - simplify form?
```

### Custom Event Tracking

Track custom events specific to your application:

```tsx
// Track custom events in your Next.js app
import { trackEvent } from '@interworky/carla-nextjs';

// Button click
trackEvent('button_click', {
  button: 'Start Free Trial',
  location: 'hero_section',
});

// Feature usage
trackEvent('feature_used', {
  feature: 'export_data',
  format: 'csv',
});

// Error encountered
trackEvent('error_encountered', {
  error_type: 'payment_failed',
  error_message: 'Card declined',
});

// Purchase completed
trackEvent('purchase', {
  product_id: '123',
  amount: 49.99,
  currency: 'USD',
});
```

View custom events in the dashboard under **Analytics → Custom Events**.

### Cohort Analysis

Group users by behavior and track retention:

#### Example Cohorts:

1. **Users who signed up in October**
   - Week 1 retention: 85%
   - Week 2 retention: 62%
   - Week 4 retention: 45%

2. **Users from social media**
   - Conversion rate: 4.2%
   - Avg session: 5m 12s
   - Bounce rate: 38%

3. **Mobile users**
   - Bounce rate: 48% (higher than desktop 35%)
   - Avg session: 2m 45s
   - Pages per session: 2.1

**Insights:** Focus on improving mobile experience to reduce bounce.

## Traffic Sources

Understand where your visitors come from:

### Source Breakdown

```
Traffic Sources:
  🔍 Organic Search    - 42% (2,184 visitors)
  🔗 Direct           - 28% (1,456 visitors)
  📱 Social Media     - 18% (936 visitors)
  📧 Email            - 8% (416 visitors)
  💰 Paid Ads         - 4% (208 visitors)
```

### Top Referrers

```
Referral Traffic:
  1. google.com           - 1,234 visitors
  2. twitter.com          - 567 visitors
  3. linkedin.com         - 345 visitors
  4. producthunt.com      - 234 visitors
  5. dev.to               - 123 visitors
```

### Campaign Tracking

Track marketing campaigns with UTM parameters:

```tsx
// Your campaign links:
https://yoursite.com?utm_source=twitter&utm_medium=social&utm_campaign=launch

// Dashboard shows:
Campaign: "launch"
  - Source: Twitter (social)
  - Visitors: 1,234
  - Conversions: 45 (3.6%)
  - Revenue: $2,234
  - ROI: 445%
```

## Engagement Metrics

### Page Engagement

Track how users interact with your content:

- **Scroll Depth** - How far users scroll (25%, 50%, 75%, 100%)
- **Time on Page** - Actual reading/viewing time
- **Clicks per Page** - User interaction level
- **Form Completion** - Field-by-field completion rates

**Example:**

```
Page: /products
  Avg Scroll Depth: 68%
  Avg Time: 3m 12s
  Clicks per Visit: 4.2
  ⚠️ Most users don't scroll to pricing table (below fold)

Action: Move pricing higher on page
```

### Content Performance

Identify your best and worst performing content:

#### Top Performing Pages

- High time on page
- Low bounce rate
- High conversion rate
- Strong engagement metrics

#### Underperforming Pages

- Low time on page
- High bounce rate
- Low conversion rate
- Weak engagement

**Optimization strategy:**

1. Analyze top performers to understand what works
2. Apply successful patterns to underperforming pages
3. Consider deprecating or heavily revising worst pages

## Exporting Analytics Data

Export data for external analysis or reporting:

1. Go to **Dashboard → Analytics**
2. Select metrics and date range
3. Click **"Export Data"**
4. Choose format:
   - **CSV** - For spreadsheet analysis
   - **JSON** - For programmatic access
   - **PDF** - For stakeholder reports

**Example exports:**

- Monthly traffic reports for executives
- Campaign performance for marketing team
- User behavior data for product decisions
- Geographic data for expansion planning

## Analytics Dashboard Customization

### Custom Dashboards

Create custom views for different roles:

**For Marketing Team:**

- Traffic sources
- Campaign performance
- Conversion rates
- Geographic data

**For Product Team:**

- User journeys
- Feature usage
- Session replays
- Error rates

**For Executive Team:**

- High-level metrics (visitors, revenue, conversion)
- Trends over time
- Goal completion
- Key performance indicators

### Alerts & Notifications

Set up alerts for important metrics:

```
Alert Examples:
  📈 Traffic spike: +50% vs yesterday
  📉 Conversion drop: -20% vs last week
  🎯 Goal achieved: 1,000 signups this month
  🚨 High bounce: >60% on pricing page
```

Configure delivery:

- Email notifications
- Dashboard notifications
- Slack integration (coming soon)

## Privacy & Compliance

Carla is designed with privacy in mind:

### GDPR Compliance

- ✅ Cookie consent integration
- ✅ Data anonymization options
- ✅ Right to deletion
- ✅ Data export capabilities
- ✅ Transparent data collection

### Data Anonymization

Option to anonymize visitor data:

```typescript
// In your config
{
  analytics: {
    anonymizeIPs: true,
    maskUserData: true,
    respectDoNotTrack: true
  }
}
```

### Cookie Consent

Integrate with cookie consent managers:

```tsx
// Only track after consent
import { initAnalytics } from '@interworky/carla-nextjs';

function handleConsent() {
  if (userConsented) {
    initAnalytics();
  }
}
```

## Analytics Best Practices

### 1. Set Clear Goals

Define what success looks like:

- Conversion rate targets
- Engagement benchmarks
- Traffic growth goals

### 2. Monitor Regularly

- **Daily:** Check traffic and real-time metrics
- **Weekly:** Review user journeys and conversion funnels
- **Monthly:** Analyze trends and adjust strategy

### 3. Act on Insights

Don't just collect data—use it:

- Fix high-bounce pages
- Optimize conversion funnels
- Improve mobile experience
- Enhance top-performing content

### 4. A/B Test Changes

Use analytics to validate improvements:

- Test headline changes
- Compare button placements
- Experiment with page layouts
- Measure impact of optimizations

## Frequently Asked Questions

### How accurate is the device detection?

Carla's device database covers **10,000+ devices** with 99%+ accuracy, including:

- All major smartphones and tablets
- Desktop configurations
- Browsers and operating systems
- Screen resolutions

### Does analytics tracking affect performance?

Minimal impact:

- Analytics bundle: ~12KB gzipped
- Async loading, non-blocking
- Batched event sending
- < 30ms overhead

### How does Carla compare to Google Analytics?

| Feature             | Carla        | Google Analytics                 |
| ------------------- | ------------ | -------------------------------- |
| Real-time analytics | ✅ Yes       | ✅ Yes                           |
| Session replay      | ✅ Yes       | ❌ No (requires GA4 + debugging) |
| Device detection    | ✅ 10,000+   | ⚠️ Limited                       |
| Next.js integration | ✅ Native    | ⚠️ Manual setup                  |
| Custom events       | ✅ Unlimited | ✅ Unlimited                     |
| Free tier limits    | ✅ None      | ✅ None                          |
| Privacy-focused     | ✅ Yes       | ⚠️ Google-owned                  |

**Recommendation:** Use both for comprehensive insights.

### Can I track authenticated users?

Yes! Track logged-in users with custom IDs:

```tsx
import { identifyUser } from '@interworky/carla-nextjs';

// After user login
identifyUser({
  userId: '12345',
  email: 'user@example.com',
  name: 'John Doe',
  plan: 'premium',
});
```

This enables:

- User-specific journey tracking
- Segmentation by user properties
- Personalized insights

### How long is analytics data retained?

- **Free tier:** 90 days of historical data
- **Premium tier:** Unlimited retention

### Can I filter by date range?

Yes, all analytics support custom date ranges:

- Today / Yesterday
- Last 7 / 30 / 90 days
- Custom date range picker
- Compare to previous period

## Next Steps

- **[Performance Monitoring](/guide/performance-monitoring)** - Track app performance and errors
- **[Pricing](/guide/pricing)** - Learn about premium features
- **[Configuration](/guide/configuration)** - Customize analytics settings

## Need Help?

- 📧 Email: [support@interworky.com](mailto:support@interworky.com)
- 💬 Discord: [Join our community](https://discord.com/invite/YHmsekzMV5)
- 📖 Docs: [Full documentation](https://carla.interworky.com)
