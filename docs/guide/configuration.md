# Configuration

Learn how to configure Carla Next.js tools and customize the widget appearance.

## Tools Configuration

After running `npx @interworky/carla-nextjs scan`, a configuration file is created at `.carla/tools.json`. This file contains all discovered API routes and their tool definitions.

### File Structure

```json
{
  "version": "1.0.0",
  "generatedAt": "2024-01-20T10:30:00.000Z",
  "tools": [
    {
      "id": "get_users",
      "name": "get_users",
      "description": "Retrieves a list of users",
      "instruction": "Use this to fetch user data from the database",
      "source": "src/app/api/users/route.ts",
      "enabled": true,
      "method": "GET",
      "endpoint": "/api/users",
      "parameters": {
        "type": "object",
        "properties": {
          "limit": {
            "type": "number",
            "description": "Maximum number of users to return"
          },
          "page": {
            "type": "number",
            "description": "Page number for pagination"
          }
        },
        "required": ["limit"]
      },
      "fixed_params": [],
      "auth": "bearer",
      "issues": []
    }
  ],
  "settings": {
    "mcpEndpoint": "http://localhost:3000"
  }
}
```

### Tool Properties

Each tool in the configuration has the following properties:

| Property | Type | Description |
|----------|------|-------------|
| `id` | string | Unique identifier for the tool |
| `name` | string | Display name of the tool |
| `description` | string | Short description of what the tool does |
| `instruction` | string | Detailed instructions for when and how to use the tool |
| `source` | string | File path where the API route is defined |
| `enabled` | boolean | Whether this tool is active and available to the AI |
| `method` | string | HTTP method (GET, POST, PUT, DELETE, PATCH) |
| `endpoint` | string | API endpoint path |
| `parameters` | object | JSON Schema defining the tool's parameters |
| `fixed_params` | array | Parameters with fixed values (optional) |
| `auth` | string | Authentication type (e.g., "bearer") (optional) |
| `issues` | array | Any detected issues with the tool definition (optional) |

### Enabling/Disabling Tools

You can manually enable or disable tools by editing the `enabled` property:

```json
{
  "id": "delete_user",
  "name": "delete_user",
  "enabled": false,  // Disabled - AI won't use this tool
  // ... other properties
}
```

::: tip
Disable sensitive tools (like delete operations) by default and only enable them when needed.
:::

### Parameters

The `parameters` object follows JSON Schema format and defines what inputs the tool accepts:

```json
{
  "parameters": {
    "type": "object",
    "properties": {
      "userId": {
        "type": "string",
        "description": "The unique identifier of the user"
      },
      "email": {
        "type": "string",
        "description": "User's email address"
      },
      "role": {
        "type": "string",
        "description": "User role (admin, member, viewer)"
      }
    },
    "required": ["userId", "email"]
  }
}
```

**Supported parameter types:**
- `string` - Text values
- `number` - Numeric values
- `boolean` - True/false values
- `array` - Lists of values
- `object` - Nested objects

### Fixed Parameters

Fixed parameters are values that are always sent with the request, regardless of user input:

```json
{
  "fixed_params": [
    {
      "field_name": "api_version",
      "field_value": "v2"
    },
    {
      "field_name": "include_metadata",
      "field_value": true
    }
  ]
}
```

These are useful for:
- Setting API versions
- Including authentication tokens
- Adding default values

### Syncing Configuration

After modifying tools.json, sync your changes to the Interworky dashboard:

```bash
npx @interworky/carla-nextjs sync
```

This uploads your tool definitions to make them available to your AI assistant.

### Best Practices

::: tip Configuration Tips
1. **Descriptive Names**: Use clear, action-oriented names (e.g., `create_user`, not `user`)
2. **Detailed Instructions**: Provide context about when to use each tool
3. **Security First**: Disable sensitive operations by default
4. **Keep in Sync**: Run `scan` and `sync` after API changes
5. **Version Control**: Commit `.carla/tools.json` to track changes over time
:::

## Widget Customization

Customize the appearance and behavior of your Carla widget through the [Interworky Dashboard](https://interworky.com).

### Accessing Widget Settings

1. Log in to [Interworky Dashboard](https://interworky.com)
2. Navigate to your **Assistant**
3. Go to **Settings** or **Appearance** section

### View Types

Choose how the widget appears on your website:

#### Circle (Classic)
The default circular button view that appears in the corner of your page.

**Best for:**
- Most websites
- Non-intrusive presence
- Standard chat interface

**Appearance:**
- Circular floating button
- Customizable position
- Expands to chat window on click

#### Agent (Landing Page)
A full character landing page view that showcases your AI assistant prominently.

**Best for:**
- Landing pages
- Product showcases
- Marketing pages
- Dedicated assistant pages

**Appearance:**
- Full-width character display
- Prominent call-to-action
- Integrated chat interface

#### Badge
A compact badge positioned in the center-right of the screen.

**Best for:**
- Minimal designs
- Mobile-optimized sites
- Subtle assistant presence

**Appearance:**
- Small badge format
- Center-right positioning
- Quick access to chat

### Personality Settings

Configure how your assistant communicates with visitors:

#### Welcoming
Friendly and inviting tone, perfect for customer-facing applications.

**Characteristics:**
- Warm greetings
- Helpful and patient
- Conversational style

**Example:** "Hi there! I'm here to help you find what you need. What can I assist you with today?"

#### Efficient
Direct and to-the-point, ideal for productivity tools and dashboards.

**Characteristics:**
- Brief responses
- Task-focused
- Minimal small talk

**Example:** "How can I help? I can search products, check orders, or answer questions."

#### Clear Cut
Straightforward and professional, great for business applications.

**Characteristics:**
- Professional tone
- Clear explanations
- Structured responses

**Example:** "I can assist with: 1) Product information, 2) Order status, 3) Technical support. Which would you like?"

#### Funny
Light-hearted and entertaining, perfect for casual or creative brands.

**Characteristics:**
- Playful language
- Occasional humor
- Engaging personality

**Example:** "Hey! I'm your friendly AI sidekick. Ready to find some awesome stuff together? 🚀"

### Position Customization

Control where the widget appears on your page:

**Available Options:**
- **Bottom Right** (default) - Classic position
- **Bottom Left** - Alternative corner placement
- **Custom Position** - Drag to exact pixel coordinates

**Settings:**
- `bottom`: Distance from bottom of page (in pixels)
- `right`: Distance from right edge (in pixels)
- `left`: Distance from left edge (in pixels)

**Example:**
```javascript
// Widget positioned 20px from bottom, 20px from right
{
  bottom: 20,
  right: 20
}
```

::: warning Mobile Responsiveness
Position settings automatically adjust for mobile devices to ensure the widget remains accessible and doesn't obstruct content.
:::

### Color Theme

Customize the widget's color scheme to match your brand:

**Customizable Elements:**
- Primary color (button, headers)
- Secondary color (accents, highlights)
- Text colors (messages, labels)
- Background colors (chat window, bubbles)

::: tip
Choose colors that contrast well with your website's design for better visibility and accessibility.
:::

### Advanced Settings

Additional customization options available in the dashboard:

**Display Options:**
- Show/hide avatar
- Enable/disable sound notifications
- Auto-open on page load
- Greeting message customization

**Behavior:**
- Response delay timing
- Typing indicator
- Message history length
- Session persistence

**Integration:**
- Custom welcome message
- Pre-filled conversation starters
- Contextual triggers (URL-based display)
- Analytics tracking

### Example Configuration

Here's a complete example of widget customization:

```javascript
{
  "view": "circle",
  "personality": "welcoming",
  "position": {
    "bottom": 24,
    "right": 24
  },
  "colors": {
    "primary": "#5f67ee",
    "secondary": "#4a52d8",
    "text": "#ffffff",
    "background": "#f9fafb"
  },
  "behavior": {
    "autoOpen": false,
    "showAvatar": true,
    "enableSound": true,
    "greetingMessage": "Hi! How can I help you today?"
  }
}
```

### Testing Changes

After customizing your widget:

1. Save changes in the Interworky Dashboard
2. Refresh your website
3. Test the widget appearance and behavior
4. Verify on both desktop and mobile devices

::: tip Live Preview
Most customization changes are reflected immediately in the dashboard's live preview. Use this to experiment before publishing.
:::

### Programmatic Customization

For advanced use cases, you can also customize the widget programmatically in your `InterworkyWidget` component:

```tsx
// src/app/components/InterworkyWidget.tsx
'use client';

import { useEffect } from 'react';

export default function InterworkyWidget() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://storage.googleapis.com/multisync/interworky/production/interworky.js';
    script.dataset.apiKey = process.env.NEXT_PUBLIC_CARLA_API_KEY || '';

    // Additional customization via data attributes
    script.dataset.position = 'bottom-right';
    script.dataset.theme = 'light';
    script.dataset.delay = '1500'; // 1.5s delay before showing

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return null;
}
```

## Next Steps

- [Environment Variables](/reference/env-variables) - Configure your API key
- [CLI Commands](/reference/cli) - Learn all available commands
- [Troubleshooting](/guide/troubleshooting) - Common issues and solutions
