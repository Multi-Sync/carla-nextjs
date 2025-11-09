# Widget Integration

Learn how to install, customize, and optimize the Carla widget in your Next.js application.

## What is the Carla Widget?

The Carla widget is a lightweight, embeddable chat interface that:

- **Connects your users** to the AI assistant powered by your API routes
- **Loads asynchronously** to avoid blocking page load
- **Works with all pages** or specific routes you choose
- **Auto-cleans up** when navigating between pages
- **Supports TypeScript** and JavaScript projects

## Quick Installation

Install the widget with a single command:

```bash
npx @interworky/carla-nextjs install
```

This will:
1. Detect your project type (TypeScript/JavaScript)
2. Create a `InterworkyWidget` component in your `components/` directory
3. Add the widget to your root layout
4. Configure it with your API key from `.env.local`

## Installation Options

### Interactive Setup (Recommended)

The interactive wizard guides you through configuration:

```bash
npx @interworky/carla-nextjs interactive
```

You'll be prompted for:
- Which pages to display Carla on (all or specific)
- Load delay timing
- Landing page mode (minimal UI)

### Command Line Options

Install with specific options:

```bash
# Install on all pages (default)
npx @interworky/carla-nextjs install

# Install on specific pages only
npx @interworky/carla-nextjs install --pages "/,/products,/pricing"

# Custom delay (in milliseconds)
npx @interworky/carla-nextjs install --delay 2000

# Landing page mode (minimal UI)
npx @interworky/carla-nextjs install --landing

# Combine options
npx @interworky/carla-nextjs install --pages "/,/docs" --delay 1000 --landing
```

## How It Works

### Installation Process

1. **Finds your layout file:**
   ```
   src/app/layout.tsx  (or .js)
   app/layout.tsx      (or .js)
   ```

2. **Creates widget component:**
   ```
   src/components/InterworkyWidget.tsx  (or .jsx)
   components/InterworkyWidget.tsx      (or .jsx)
   ```

3. **Updates your layout:**
   - Adds import statement
   - Inserts `<InterworkyWidget />` in the body

### Generated Widget Component

**TypeScript version:**
```typescript
'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const SCRIPT_SRC = 'https://storage.googleapis.com/multisync/interworky/production/interworky.js';
const API_KEY = process.env.NEXT_PUBLIC_CARLA_API_KEY!;

export default function InterworkyWidget() {
  const pathname = usePathname();

  useEffect(() => {
    // Delay script loading to prioritize core content rendering
    const timeoutId = setTimeout(() => {
      const script = document.createElement('script');
      script.src = SCRIPT_SRC;
      script.dataset.apiKey = API_KEY;
      script.dataset.position = 'bottom-50 right-50';
      script.async = true;
      script.defer = true;

      script.onload = () => {
        setTimeout(() => {
          window.Interworky?.init?.();
        }, 100);
      };

      script.onerror = (e) => {
        console.error('Interworky Plugin failed to load', e);
      };

      document.body.appendChild(script);
    }, 1500); // Delay loading until after critical content is rendered

    return () => {
      clearTimeout(timeoutId);
      window.Interworky?.remove?.();
      document.querySelectorAll('script[data-api-key]').forEach(s => s.remove());
    };
  }, [pathname]);

  return null;
}
```

### Updated Layout File

**Before:**
```tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```

**After:**
```tsx
import InterworkyWidget from '../components/InterworkyWidget';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <InterworkyWidget />
        {children}
      </body>
    </html>
  )
}
```

## Configuration

### Environment Variables

The widget requires your Carla API key:

```bash
# .env.local or .env
NEXT_PUBLIC_CARLA_API_KEY="your-api-key-here"
```

::: tip
The `NEXT_PUBLIC_` prefix makes the key available to client-side code. This is safe because the key is scoped to your domain.
:::

**Getting your API key:**
1. Visit [interworky.com](https://interworky.com)
2. Sign in or create an account
3. Navigate to **Integrations** in the sidebar
4. Copy your API key

### Page-Specific Display

Show Carla only on specific pages:

**During installation:**
```bash
npx @interworky/carla-nextjs install --pages "/,/products,/pricing"
```

**Manual configuration:**
Edit the generated widget component:

```typescript
export default function InterworkyWidget() {
  const pathname = usePathname();

  useEffect(() => {
    // Only show on home, products, and pricing pages
    if (pathname === '/' || pathname === '/products' || pathname === '/pricing') {
      const timeoutId = setTimeout(() => {
        // ... widget loading code
      }, 1500);

      return () => {
        clearTimeout(timeoutId);
        window.Interworky?.remove?.();
      };
    }
  }, [pathname]);

  return null;
}
```

### Load Delay

Control when the widget loads:

```typescript
// Default: 1500ms (1.5 seconds)
const timeoutId = setTimeout(() => {
  // Load widget
}, 1500);
```

**Recommended delays:**
- **Fast connection:** 1000ms (1 second)
- **Balanced (default):** 1500ms (1.5 seconds)
- **Slow connection/heavy page:** 2000-3000ms (2-3 seconds)

::: tip
The delay ensures your main content loads first, improving perceived performance.
:::

### Widget Position

Customize the widget position via data attributes:

```typescript
script.dataset.position = 'bottom-50 right-50';
```

**Position options:**
- `bottom-right` (default)
- `bottom-left`
- `top-right`
- `top-left`
- Custom: `bottom-50 right-50` (pixels from edge)

### Landing Page Mode

Enable minimal UI for landing pages:

```bash
npx @interworky/carla-nextjs install --landing
```

Or manually:
```typescript
script.dataset.landing = 'true';
```

This creates a more subtle widget appearance suitable for marketing pages.

## Customization

### Custom Styling

Override default styles in your global CSS:

```css
/* Custom widget button styling */
[data-interworky-button] {
  background: #your-brand-color !important;
  border-radius: 50% !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}

/* Custom chat window styling */
[data-interworky-chat] {
  border-radius: 12px !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2) !important;
}

/* Custom header color */
[data-interworky-header] {
  background: linear-gradient(135deg, #your-color-1, #your-color-2) !important;
}
```

### Conditional Loading

Load based on user authentication status:

```typescript
'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function InterworkyWidget() {
  const pathname = usePathname();
  const { data: session } = useSession();

  useEffect(() => {
    // Only show to authenticated users
    if (!session) return;

    const timeoutId = setTimeout(() => {
      // ... widget loading code
    }, 1500);

    return () => {
      clearTimeout(timeoutId);
      window.Interworky?.remove?.();
    };
  }, [pathname, session]);

  return null;
}
```

### User Context

Pass user information to the widget:

```typescript
useEffect(() => {
  const timeoutId = setTimeout(() => {
    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.dataset.apiKey = API_KEY;

    // Add user context
    if (session?.user) {
      script.dataset.userId = session.user.id;
      script.dataset.userName = session.user.name || '';
      script.dataset.userEmail = session.user.email || '';
    }

    document.body.appendChild(script);
  }, 1500);

  return () => {
    clearTimeout(timeoutId);
    window.Interworky?.remove?.();
  };
}, [pathname, session]);
```

## Performance Optimization

### Loading Strategy

The widget uses several optimizations:

1. **Async + Defer:**
   ```typescript
   script.async = true;
   script.defer = true;
   ```
   Doesn't block page rendering or parsing

2. **Delayed Loading:**
   ```typescript
   setTimeout(() => { /* load widget */ }, 1500)
   ```
   Waits for critical content to load first

3. **Lazy Initialization:**
   ```typescript
   script.onload = () => {
     setTimeout(() => {
       window.Interworky?.init?.();
     }, 100);
   };
   ```
   Initializes after script loads, with additional delay

### Bundle Size

The widget script is:
- **Compressed:** ~45KB gzipped
- **Cached:** Browser caches after first load
- **CDN-delivered:** Fast global delivery via Google Cloud Storage

### Impact on Lighthouse Score

Typical impact on Lighthouse metrics:
- **Performance:** -1 to -3 points (minimal)
- **First Contentful Paint:** No impact (async loading)
- **Time to Interactive:** +0.1-0.2s (negligible)
- **Cumulative Layout Shift:** 0 (no layout shift)

::: tip
The 1.5s delay ensures the widget doesn't affect your initial page load metrics.
:::

## Cleanup and Unmounting

The widget automatically cleans up on page navigation:

```typescript
return () => {
  clearTimeout(timeoutId);              // Cancel delayed loading
  window.Interworky?.remove?.();        // Remove widget UI
  document.querySelectorAll('script[data-api-key]')
    .forEach(s => s.remove());          // Remove script tags
};
```

This prevents:
- Memory leaks
- Duplicate widgets
- Stale event listeners

## Troubleshooting

### Widget Not Appearing

**Problem:** Widget doesn't show on your page

**Solutions:**

1. **Check API key:**
   ```bash
   echo $NEXT_PUBLIC_CARLA_API_KEY
   ```
   Make sure it's set in `.env.local`

2. **Restart dev server:**
   ```bash
   # Environment changes require restart
   npm run dev
   ```

3. **Check browser console:**
   Look for errors related to Interworky

4. **Verify script loading:**
   Open DevTools → Network tab → Look for `interworky.js`

### Widget Loads Too Slowly

**Problem:** Widget appears too late

**Solutions:**

1. **Reduce delay:**
   ```typescript
   setTimeout(() => { /* load */ }, 1000) // Reduced from 1500ms
   ```

2. **Check network speed:**
   Slow connections may take longer to download the script

### Multiple Widgets Appear

**Problem:** Widget duplicates on navigation

**Solutions:**

1. **Check cleanup function:**
   Ensure the `return () => {}` cleanup is present

2. **Verify component structure:**
   Widget should be in layout, not individual pages

3. **Clear cache and reload:**
   ```bash
   rm -rf .next
   npm run dev
   ```

### Widget Doesn't Update After Changes

**Problem:** Changes to widget component aren't reflected

**Solutions:**

1. **Hard refresh browser:**
   - Mac: `Cmd + Shift + R`
   - Windows/Linux: `Ctrl + Shift + R`

2. **Clear Next.js cache:**
   ```bash
   rm -rf .next
   npm run dev
   ```

### TypeScript Errors

**Problem:** TypeScript complains about `window.Interworky`

**Solution:**

Add global type declaration to your widget:

```typescript
declare global {
  interface Window {
    Interworky?: {
      init?: () => void;
      remove?: () => void;
    };
  }
}
```

Or create a `types/interworky.d.ts` file:

```typescript
interface Window {
  Interworky?: {
    init?: () => void;
    remove?: () => void;
    open?: () => void;
    close?: () => void;
  };
}
```

## Advanced Usage

### Programmatic Control

Control the widget programmatically:

```typescript
'use client';

import { useEffect, useRef } from 'react';

export default function CustomWidget() {
  const widgetLoadedRef = useRef(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const script = document.createElement('script');
      script.src = 'https://storage.googleapis.com/multisync/interworky/production/interworky.js';
      script.dataset.apiKey = process.env.NEXT_PUBLIC_CARLA_API_KEY!;

      script.onload = () => {
        widgetLoadedRef.current = true;
      };

      document.body.appendChild(script);
    }, 1500);

    return () => clearTimeout(timeoutId);
  }, []);

  // Open widget programmatically
  const openWidget = () => {
    if (widgetLoadedRef.current) {
      window.Interworky?.open?.();
    }
  };

  // Close widget programmatically
  const closeWidget = () => {
    if (widgetLoadedRef.current) {
      window.Interworky?.close?.();
    }
  };

  return (
    <div>
      <button onClick={openWidget}>Open Chat</button>
      <button onClick={closeWidget}>Close Chat</button>
    </div>
  );
}
```

### Event Tracking

Track widget interactions:

```typescript
useEffect(() => {
  const handleMessage = (event: MessageEvent) => {
    if (event.data?.type === 'interworky:opened') {
      // Track widget open
      analytics.track('Widget Opened');
    }
    if (event.data?.type === 'interworky:closed') {
      // Track widget close
      analytics.track('Widget Closed');
    }
  };

  window.addEventListener('message', handleMessage);

  return () => {
    window.removeEventListener('message', handleMessage);
  };
}, []);
```

### A/B Testing

Test different widget configurations:

```typescript
'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function InterworkyWidget() {
  const pathname = usePathname();

  useEffect(() => {
    // A/B test: 50% get 1s delay, 50% get 2s delay
    const delay = Math.random() < 0.5 ? 1000 : 2000;

    const timeoutId = setTimeout(() => {
      const script = document.createElement('script');
      script.src = 'https://storage.googleapis.com/multisync/interworky/production/interworky.js';
      script.dataset.apiKey = process.env.NEXT_PUBLIC_CARLA_API_KEY!;
      script.dataset.variant = delay === 1000 ? 'fast' : 'slow';

      document.body.appendChild(script);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [pathname]);

  return null;
}
```

## Best Practices

### 1. Use Appropriate Delays

```typescript
// ✅ Good - Balanced
setTimeout(() => { /* load */ }, 1500)

// ❌ Too fast - May affect page load metrics
setTimeout(() => { /* load */ }, 100)

// ❌ Too slow - Poor user experience
setTimeout(() => { /* load */ }, 5000)
```

### 2. Place in Layout, Not Pages

```typescript
// ✅ Good - In app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <InterworkyWidget />
        {children}
      </body>
    </html>
  )
}

// ❌ Bad - In individual pages
export default function HomePage() {
  return (
    <div>
      <InterworkyWidget /> {/* Don't do this */}
      {/* Page content */}
    </div>
  )
}
```

### 3. Always Include Cleanup

```typescript
// ✅ Good - Proper cleanup
useEffect(() => {
  const timeoutId = setTimeout(() => { /* load */ }, 1500);

  return () => {
    clearTimeout(timeoutId);
    window.Interworky?.remove?.();
  };
}, [pathname]);

// ❌ Bad - No cleanup
useEffect(() => {
  setTimeout(() => { /* load */ }, 1500);
  // Missing cleanup!
}, [pathname]);
```

### 4. Handle Errors Gracefully

```typescript
// ✅ Good - Error handling
script.onerror = (e) => {
  console.error('Interworky Plugin failed to load', e);
  // Optionally: report to error tracking service
};

// ❌ Bad - No error handling
script.onload = () => {
  window.Interworky?.init?.();
};
```

### 5. Keep API Key Secure

```bash
# ✅ Good - In environment variable
NEXT_PUBLIC_CARLA_API_KEY="sk_..."

# ❌ Bad - Hardcoded in component
const API_KEY = 'sk_...'  // Never do this!
```

## Next Steps

Now that your widget is installed:

- **[Tool Generation](/guide/tool-generation)** - Add AI capabilities
- **[API Scanning](/guide/api-scanning)** - Connect your API routes
- **[Customization](/guide/configuration)** - Tailor Carla to your brand
- **[Dashboard](https://interworky.com)** - Manage and monitor your assistant
