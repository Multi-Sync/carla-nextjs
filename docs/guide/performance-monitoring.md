# Performance Monitoring

**Free Feature** - Available on all tiers with unlimited usage

Carla's Performance Monitoring provides real-time insights into your Next.js application's performance, helping you identify bottlenecks, track load times, and ensure optimal user experience.

## Overview

Performance monitoring is **completely free** and includes:

- ✅ Real-time performance tracking
- ✅ Page load time analysis
- ✅ API response time monitoring
- ✅ Resource usage metrics
- ✅ Historical performance data (90 days on free tier, unlimited on premium)
- ✅ Device and browser performance breakdown
- ✅ Geographic performance insights
- ✅ Custom date range filtering

No credit card required, no usage limits.

## Getting Started

Performance monitoring is automatically enabled once you install the Carla widget:

```bash
# Install widget
npx @interworky/carla-nextjs install

# Start monitoring immediately
npm run dev
```

Visit your dashboard at [interworky.com/dashboard/performance](https://interworky.com/dashboard/performance) to see real-time metrics.

## Key Metrics

### Page Load Times

Track how fast your pages load for real users:

- **First Contentful Paint (FCP)** - Time until first content appears
- **Largest Contentful Paint (LCP)** - Time until main content loads
- **Time to Interactive (TTI)** - Time until page is fully interactive
- **Total Page Load** - Complete page load duration

**Why it matters:** Slow page loads increase bounce rates. Google recommends LCP under 2.5 seconds.

### API Response Times

Monitor your Next.js API route performance:

- Average response time per endpoint
- Slowest endpoints identification
- Response time trends over time
- Error rate per endpoint

**Example:**
```
/api/users      - Avg 45ms  (✓ Good)
/api/products   - Avg 1.2s  (⚠️ Slow)
/api/checkout   - Avg 320ms (✓ Good)
```

### Core Web Vitals

Google's key performance indicators:

- **LCP (Largest Contentful Paint)** - Loading performance
  - Good: ≤ 2.5s
  - Needs Improvement: 2.5s - 4s
  - Poor: > 4s

- **FID (First Input Delay)** - Interactivity
  - Good: ≤ 100ms
  - Needs Improvement: 100ms - 300ms
  - Poor: > 300ms

- **CLS (Cumulative Layout Shift)** - Visual stability
  - Good: ≤ 0.1
  - Needs Improvement: 0.1 - 0.25
  - Poor: > 0.25

**Impact:** Core Web Vitals affect Google search rankings and user experience.

### Resource Usage

Track client-side resource consumption:

- **Memory Usage** - JavaScript heap size
- **CPU Usage** - Script execution time
- **Network Bandwidth** - Data transferred per page
- **Cache Hit Rate** - How often cached resources are used

## Dashboard Features

### Real-Time Performance View

The main dashboard shows:

1. **Performance Score (0-100)** - Overall health indicator
2. **Current Metrics** - Live data from active users
3. **Trend Charts** - Performance over last 24 hours, 7 days, 30 days
4. **Geographic Breakdown** - Performance by user location
5. **Device Breakdown** - Performance on mobile vs desktop vs tablet

### Performance Trends

Analyze performance changes over time:

- **Daily Trends** - Hour-by-hour performance
- **Weekly Trends** - Day-by-day comparison
- **Monthly Trends** - Week-by-week analysis
- **Custom Ranges** - Select any date range

**Use case:** Identify if a recent deployment degraded performance.

### Slowest Pages

Identifies pages with performance issues:

| Page | Avg Load Time | Visits | Score |
|------|---------------|--------|-------|
| /checkout | 4.2s | 1,234 | 45 ⚠️ |
| /dashboard | 1.8s | 5,678 | 78 ✓ |
| /products | 1.2s | 12,345 | 92 ✓ |

Click any page to see detailed metrics and recommendations.

### Performance Alerts

Set up alerts for performance degradation:

- Notify when page load time exceeds threshold
- Alert on API response time spikes
- Warn when Core Web Vitals fall below "Good" range
- Email or dashboard notifications

**Example:**
```
⚠️ Alert: /api/users response time increased to 2.1s (threshold: 500ms)
Triggered: Nov 10, 2025 at 2:45 PM
```

## Performance by Device

Understand how your app performs across devices:

### Mobile Performance
- Typically slower due to network constraints
- Focus on optimizing critical rendering path
- Reduce JavaScript bundle size
- Lazy load images and components

### Desktop Performance
- Usually faster, more processing power
- Watch for memory leaks in long sessions
- Monitor CPU usage during heavy interactions

### Tablet Performance
- Sits between mobile and desktop
- Consider responsive design impact
- Test both portrait and landscape orientations

## Performance by Location

Geographic performance insights:

- Identify slow regions
- Consider CDN optimization
- Understand global user experience
- Plan infrastructure improvements

**Example:**
```
🇺🇸 United States  - Avg 1.2s (✓ Good)
🇬🇧 United Kingdom - Avg 1.8s (✓ Good)
🇦🇺 Australia      - Avg 3.5s (⚠️ Needs improvement)
🇮🇳 India          - Avg 4.2s (❌ Poor)
```

**Action:** Consider adding CDN edge locations in slower regions.

## Interpreting Performance Data

### Identifying Bottlenecks

**Slow Page Loads:**
1. Check LCP - Is main content loading slowly?
2. Review Network tab - Are there large resources?
3. Check TTI - Is JavaScript blocking?
4. Analyze CLS - Are elements shifting?

**Slow API Responses:**
1. Identify slow endpoints in dashboard
2. Check database query performance
3. Look for N+1 query problems
4. Consider caching strategies

### Performance Score Breakdown

Carla calculates an overall performance score (0-100) based on:

- **40%** - Core Web Vitals (LCP, FID, CLS)
- **30%** - Page Load Times
- **20%** - API Response Times
- **10%** - Resource Efficiency

**Score Ranges:**
- **90-100** - Excellent performance
- **75-89** - Good performance
- **50-74** - Needs improvement
- **0-49** - Poor performance

## Optimization Recommendations

Based on performance data, Carla provides actionable recommendations:

### Common Recommendations

1. **Optimize Images**
   - Use Next.js Image component
   - Enable automatic WebP conversion
   - Implement lazy loading

   ```tsx
   import Image from 'next/image'

   <Image
     src="/hero.jpg"
     width={800}
     height={600}
     loading="lazy"
     alt="Hero"
   />
   ```

2. **Code Splitting**
   - Use dynamic imports for heavy components
   - Split vendor bundles
   - Implement route-based code splitting

   ```tsx
   import dynamic from 'next/dynamic'

   const HeavyComponent = dynamic(() => import('./HeavyComponent'))
   ```

3. **API Optimization**
   - Add caching headers
   - Use database indexes
   - Implement pagination
   - Consider API route handlers

   ```ts
   // app/api/users/route.ts
   export async function GET(request: Request) {
     return NextResponse.json(data, {
       headers: {
         'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
       }
     })
   }
   ```

4. **Font Optimization**
   - Use Next.js font optimization
   - Preload critical fonts
   - Use font-display: swap

   ```tsx
   import { Inter } from 'next/font/google'

   const inter = Inter({
     subsets: ['latin'],
     display: 'swap',
   })
   ```

## Exporting Performance Data

Export performance data for further analysis:

1. Go to **Dashboard → Performance**
2. Select date range
3. Click **"Export Data"**
4. Choose format: CSV, JSON, or PDF report

**Use cases:**
- Share reports with stakeholders
- Analyze trends in external tools
- Archive historical data
- Create custom visualizations

## Performance Monitoring Best Practices

### Regular Monitoring

- **Daily:** Check performance score and recent trends
- **Weekly:** Review slowest pages and API endpoints
- **Monthly:** Analyze long-term trends and improvements
- **After Deployments:** Verify no performance regressions

### Setting Baselines

Establish performance baselines for your application:

1. Deploy to production
2. Monitor for 1-2 weeks to establish baseline
3. Set alert thresholds 20% above baseline
4. Track improvements over time

**Example Baselines:**
```
Homepage Load Time: 1.2s (baseline)
  → Alert if exceeds: 1.5s
  → Goal: Reduce to 1.0s

/api/users Response: 85ms (baseline)
  → Alert if exceeds: 120ms
  → Goal: Reduce to 50ms
```

### Testing in Different Conditions

Consider performance under various conditions:

- **Network Speed:** Test on 3G, 4G, WiFi
- **Device Types:** Test on low-end and high-end devices
- **Geographic Locations:** Test from different regions
- **Load Conditions:** Test under normal and peak traffic

## Integration with Development Workflow

### CI/CD Integration

Monitor performance in your development pipeline:

1. Set performance budgets
2. Fail builds if performance regresses
3. Compare before/after deployment metrics
4. Automate performance testing

**Example performance budget:**
```json
{
  "timings": {
    "firstContentfulPaint": 2000,
    "largestContentfulPaint": 2500,
    "timeToInteractive": 3500
  },
  "resourceSizes": {
    "script": 200000,
    "stylesheet": 50000,
    "image": 500000
  }
}
```

### Local Development

While developing, use Carla to:

1. Test performance impact of new features
2. Identify slow components early
3. Validate optimizations before deployment
4. Compare local vs production performance

## Frequently Asked Questions

### How often is performance data updated?

Real-time metrics are updated **every 30 seconds**. Historical data is aggregated hourly.

### Does the monitoring widget impact performance?

The Carla widget is optimized for minimal performance impact:
- Async loading with 1.5s delay
- ~15KB gzipped bundle size
- Non-blocking script execution
- Lazy initialization

**Performance overhead:** < 50ms on page load.

### How long is performance data retained?

- **Free tier:** 90 days of historical data
- **Premium tier:** Unlimited retention

### Can I monitor staging environments?

Yes! Create separate projects for staging and production:

1. Generate separate API keys for each environment
2. Install widget in both environments
3. View data separately in dashboard

### What about Server-Side Rendering (SSR) performance?

Carla tracks both client-side and server-side metrics:

- Server-side rendering time
- Time to First Byte (TTFB)
- Hydration time
- Client-side interactive time

### How does Carla compare to Google Analytics?

| Feature | Carla | Google Analytics |
|---------|-------|------------------|
| Real-time metrics | ✅ Yes | ✅ Yes |
| Core Web Vitals | ✅ Yes | ✅ Yes |
| API monitoring | ✅ Yes | ❌ No |
| Error tracking | ✅ Yes | ⚠️ Limited |
| Next.js specific | ✅ Yes | ❌ No |
| Free tier | ✅ Unlimited | ✅ Unlimited |

**Use both:** Carla for Next.js-specific insights, GA for broader analytics.

## Next Steps

- **[Analytics Guide](/guide/analytics)** - Track user behavior and insights
- **[Auto-Fix Guide](/guide/auto-fix)** - AI-powered error fixing with GitHub PRs
- **[Configuration](/guide/configuration)** - Customize performance settings
- **[Pricing](/guide/pricing)** - Learn about premium features

## Need Help?

- 📧 Email: [support@interworky.com](mailto:support@interworky.com)
- 💬 Discord: [Join our community](https://discord.com/invite/YHmsekzMV5)
- 📖 Docs: [Full documentation](https://carla.interworky.com)
