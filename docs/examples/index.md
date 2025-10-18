# Examples

Real-world examples of integrating Carla with Next.js applications.

## Quick Examples

### Basic E-commerce

A simple e-commerce store with product and order management:

- **Tools**: Get products, create orders, track shipping
- **Features**: Product search, order status, inventory checks
- **[View Example →](/examples/ecommerce)**

### SaaS Dashboard

A SaaS application with user management and analytics:

- **Tools**: User CRUD, usage analytics, billing info
- **Features**: Account management, usage tracking, support tickets
- **[View Example →](/examples/saas)**

### Blog Platform

A content management system for bloggers:

- **Tools**: Post management, comments, analytics
- **Features**: Content search, publishing, engagement metrics
- **[View Example →](/examples/blog)**

## Common Use Cases

### Customer Support

Enable Carla to handle common support requests:

```typescript
// app/api/support/ticket/route.ts
export async function POST(request: Request) {
  const { subject, description, priority } = await request.json()

  const ticket = await createSupportTicket({
    subject,
    description,
    priority,
    status: 'open'
  })

  return Response.json(ticket)
}
```

**User**: "I need help with my order"
**Carla**: *Creates support ticket* → "I've created ticket #12345 for you. Our team will respond within 24 hours."

### Order Management

Let customers check and manage orders:

```typescript
// app/api/orders/[id]/route.ts
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const order = await getOrder(params.id)
  return Response.json(order)
}
```

**User**: "What's the status of order #789?"
**Carla**: *Calls GET /api/orders/789* → "Your order shipped yesterday and will arrive on Friday. Track it here: [link]"

### Product Search

Enable natural language product search:

```typescript
// app/api/products/search/route.ts
export async function POST(request: Request) {
  const { query, category, priceRange } = await request.json()

  const products = await searchProducts({
    query,
    category,
    minPrice: priceRange?.min,
    maxPrice: priceRange?.max
  })

  return Response.json(products)
}
```

**User**: "Show me blue shirts under $50"
**Carla**: *Calls search API* → "I found 12 blue shirts in your price range. Here are the top matches..."

### Account Management

Allow users to manage their accounts via Carla:

```typescript
// app/api/user/preferences/route.ts
export async function PUT(request: Request) {
  const { notifications, theme, language } = await request.json()

  await updateUserPreferences({
    notifications,
    theme,
    language
  })

  return Response.json({ success: true })
}
```

**User**: "Turn off email notifications"
**Carla**: *Updates preferences* → "Done! I've disabled email notifications for your account."

## Code Snippets

### Error Handling

```typescript
export async function POST(request: Request) {
  try {
    const data = await request.json()
    const result = await processData(data)
    return Response.json(result)
  } catch (error) {
    if (error instanceof ValidationError) {
      return Response.json(
        { error: error.message },
        { status: 400 }
      )
    }
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

Carla will handle errors gracefully and inform users appropriately.

### Authentication

```typescript
import { auth } from '@/lib/auth'

export async function GET(request: Request) {
  const session = await auth(request)

  if (!session) {
    return Response.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const data = await getUserData(session.userId)
  return Response.json(data)
}
```

Carla respects your authentication and only accesses authorized data.

### Rate Limiting

```typescript
import { rateLimit } from '@/lib/rate-limit'

export async function POST(request: Request) {
  const identifier = request.headers.get('x-forwarded-for') || 'anonymous'

  const { success } = await rateLimit.check(identifier)

  if (!success) {
    return Response.json(
      { error: 'Too many requests' },
      { status: 429 }
    )
  }

  // Process request...
}
```

Your rate limiting applies to Carla's requests too.

## Tool Patterns

### CRUD Operations

```json
{
  "tools": [
    {
      "name": "create_product",
      "method": "POST",
      "path": "/api/products"
    },
    {
      "name": "get_product",
      "method": "GET",
      "path": "/api/products/[id]"
    },
    {
      "name": "update_product",
      "method": "PUT",
      "path": "/api/products/[id]"
    },
    {
      "name": "delete_product",
      "method": "DELETE",
      "path": "/api/products/[id]",
      "enabled": false  // Disabled for safety
    }
  ]
}
```

### Search & Filter

```json
{
  "name": "search_products",
  "method": "POST",
  "path": "/api/products/search",
  "parameters": {
    "type": "object",
    "properties": {
      "query": { "type": "string" },
      "category": { "type": "string" },
      "minPrice": { "type": "number" },
      "maxPrice": { "type": "number" },
      "inStock": { "type": "boolean" }
    }
  }
}
```

### Analytics

```json
{
  "name": "get_analytics",
  "method": "GET",
  "path": "/api/analytics",
  "parameters": {
    "type": "object",
    "properties": {
      "startDate": { "type": "string", "format": "date" },
      "endDate": { "type": "string", "format": "date" },
      "metrics": {
        "type": "array",
        "items": { "type": "string" }
      }
    }
  }
}
```

## Best Practices

### 1. Descriptive Names

```json
// ❌ Bad
{ "name": "api_1" }

// ✅ Good
{ "name": "get_user_order_history" }
```

### 2. Clear Descriptions

```json
// ❌ Bad
{ "description": "Gets stuff" }

// ✅ Good
{ "description": "Retrieves the complete order history for a specific user, including order status, items, and tracking information" }
```

### 3. Proper Validation

```typescript
// ✅ Good
export async function POST(request: Request) {
  const body = await request.json()

  // Validate input
  if (!body.email || !isValidEmail(body.email)) {
    return Response.json(
      { error: 'Valid email required' },
      { status: 400 }
    )
  }

  // Process...
}
```

### 4. Meaningful Responses

```typescript
// ✅ Good
return Response.json({
  success: true,
  message: 'Order placed successfully',
  order: {
    id: '12345',
    total: 99.99,
    estimatedDelivery: '2024-12-15'
  }
})
```

## Full Examples

Explore complete example projects:

- [**E-commerce Store**](/examples/ecommerce) - Product catalog, shopping cart, order management
- [**SaaS Dashboard**](/examples/saas) - User management, billing, analytics
- [**Blog Platform**](/examples/blog) - Content management, comments, SEO

## Community Examples

Check out these projects built by the community:

- **Booking System** - Hotel/appointment booking with Carla
- **Educational Platform** - Course management and student support
- **Inventory Management** - Stock tracking and reordering

Want to share your example? [Open a PR](https://github.com/Multi-Sync/carla-nextjs/pulls) or share in [Discord](https://discord.com/invite/YHmsekzMV5)!
