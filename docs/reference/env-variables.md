# Environment Variables

Configuration for Carla Next.js widget and CLI.

## NEXT_PUBLIC_CARLA_API_KEY

This is the API key that connects your Next.js application to the Interworky platform. It enables the Carla widget to authenticate and access your assistant's configuration.

### Where to Get It

1. Go to [Interworky Dashboard](https://interworky.com)
2. Sign up or log in to your account
3. Navigate to **Integrations** page
4. Copy your API key from the **Carla API Key** section

### How to Use It

Add the environment variable to your Next.js project:

**`.env.local`** (recommended for local development):
```bash
NEXT_PUBLIC_CARLA_API_KEY=your_api_key_here
```

**`.env.production`** (for production deployments):
```bash
NEXT_PUBLIC_CARLA_API_KEY=your_api_key_here
```

::: tip
Environment variables prefixed with `NEXT_PUBLIC_` are exposed to the browser in Next.js. This is necessary for the client-side widget to authenticate with Interworky.
:::

### Usage in Widget Component

After running `npx @interworky/carla-nextjs install`, the widget component will automatically use this environment variable:

```tsx
// src/app/components/InterworkyWidget.tsx
'use client';

import { useEffect } from 'react';

export default function InterworkyWidget() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://storage.googleapis.com/multisync/interworky/production/interworky.js';
    script.dataset.apiKey = process.env.NEXT_PUBLIC_CARLA_API_KEY || '';

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return null;
}
```

### Security Considerations

::: warning Important
- **Never commit** `.env.local` or `.env.production` to version control
- Add `.env*.local` to your `.gitignore` file
- Use different API keys for development and production environments
- Rotate your API keys if they are ever exposed publicly
:::

### Deployment

When deploying to platforms like Vercel, Netlify, or others:

1. Add the environment variable in your platform's dashboard
2. Set the variable name as `NEXT_PUBLIC_CARLA_API_KEY`
3. Paste your API key as the value
4. Redeploy your application

**Example for Vercel:**
1. Go to your project settings
2. Navigate to **Environment Variables**
3. Add `NEXT_PUBLIC_CARLA_API_KEY` with your key
4. Select which environments to apply it to (Production, Preview, Development)

**Example for Netlify:**
1. Go to **Site settings** → **Environment variables**
2. Click **Add a variable**
3. Key: `NEXT_PUBLIC_CARLA_API_KEY`
4. Value: Your API key
5. Save and redeploy

### Verification

To verify the API key is properly configured:

```bash
# In your Next.js project directory
echo $NEXT_PUBLIC_CARLA_API_KEY

# Or check in your application
console.log(process.env.NEXT_PUBLIC_CARLA_API_KEY)
```

### Troubleshooting

**Widget not appearing?**
- Check that `NEXT_PUBLIC_CARLA_API_KEY` is set in your environment
- Verify the API key is correct in your Interworky dashboard
- Make sure you restarted your development server after adding the environment variable
- Check the browser console for authentication errors

**Environment variable undefined in browser?**
- Ensure the variable name starts with `NEXT_PUBLIC_`
- Restart your Next.js development server (`npm run dev`)
- Clear your browser cache and hard reload

### Additional Resources

- [Next.js Environment Variables Documentation](https://nextjs.org/docs/basic-features/environment-variables)
- [Interworky Dashboard](https://interworky.com)
- [Getting Started Guide](/guide/getting-started)
