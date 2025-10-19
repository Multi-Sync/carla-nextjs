# E-commerce Store Example

A complete example of integrating Carla with a Next.js e-commerce store.

## Overview

This example shows how to enable Carla to help customers:
- Browse and search products
- Check order status and tracking
- Manage shopping cart
- Get product recommendations
- Handle returns and refunds

## Project Structure

```
app/
├── api/
│   ├── products/
│   │   ├── route.ts              # List all products
│   │   ├── [id]/route.ts         # Get product details
│   │   └── search/route.ts       # Search products
│   ├── cart/
│   │   ├── route.ts              # Get/update cart
│   │   └── add/route.ts          # Add to cart
│   ├── orders/
│   │   ├── route.ts              # Create order
│   │   ├── [id]/route.ts         # Get order status
│   │   └── [id]/tracking/route.ts # Get tracking info
│   └── returns/
│       └── route.ts              # Create return request
```

## API Routes

### Product Listing

```typescript
// app/api/products/route.ts
import { NextRequest } from 'next/server'
import { getProducts } from '@/lib/db'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const category = searchParams.get('category')
  const limit = parseInt(searchParams.get('limit') || '20')

  const products = await getProducts({
    category,
    limit,
    inStock: true
  })

  return Response.json({
    products,
    total: products.length
  })
}
```

### Product Search

```typescript
// app/api/products/search/route.ts
export async function POST(request: Request) {
  const { query, category, minPrice, maxPrice, inStock } = await request.json()

  const products = await searchProducts({
    query,
    category,
    priceRange: { min: minPrice, max: maxPrice },
    inStock
  })

  return Response.json({
    results: products,
    count: products.length,
    query
  })
}
```

**Example Conversation:**

> **User**: "Show me wireless headphones under $100"
>
> **Carla**: *Calls POST /api/products/search with query="wireless headphones", maxPrice=100*
>
> "I found 8 wireless headphones under $100. Here are the top options:
> 1. SoundMax Pro - $79.99 ⭐ 4.5/5
> 2. BeatWave Elite - $89.99 ⭐ 4.7/5
> 3. AudioPro X1 - $99.99 ⭐ 4.3/5
> Would you like details on any of these?"

### Product Details

```typescript
// app/api/products/[id]/route.ts
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const product = await getProductById(params.id)

  if (!product) {
    return Response.json(
      { error: 'Product not found' },
      { status: 404 }
    )
  }

  return Response.json({
    id: product.id,
    name: product.name,
    price: product.price,
    description: product.description,
    images: product.images,
    inStock: product.inventory > 0,
    rating: product.averageRating,
    reviews: product.totalReviews,
    specs: product.specifications
  })
}
```

### Shopping Cart

```typescript
// app/api/cart/add/route.ts
export async function POST(request: Request) {
  const { productId, quantity } = await request.json()

  // Validate product exists and is in stock
  const product = await getProductById(productId)

  if (!product || product.inventory < quantity) {
    return Response.json(
      { error: 'Product unavailable or insufficient stock' },
      { status: 400 }
    )
  }

  // Add to cart (session-based or user-based)
  const cart = await addToCart({
    productId,
    quantity,
    price: product.price
  })

  return Response.json({
    success: true,
    cart: {
      items: cart.items,
      total: cart.total,
      itemCount: cart.itemCount
    },
    message: `Added ${quantity}x ${product.name} to your cart`
  })
}
```

**Example Conversation:**

> **User**: "Add 2 of the SoundMax Pro to my cart"
>
> **Carla**: *Calls POST /api/cart/add with productId="soundmax-pro", quantity=2*
>
> "Done! I've added 2x SoundMax Pro ($79.99 each) to your cart. Your cart total is now $159.98. Ready to checkout?"

### Order Creation

```typescript
// app/api/orders/route.ts
export async function POST(request: Request) {
  const { items, shippingAddress, paymentMethod } = await request.json()

  // Validate items and calculate total
  const orderItems = await validateOrderItems(items)
  const total = calculateTotal(orderItems)

  // Create order
  const order = await createOrder({
    items: orderItems,
    total,
    shippingAddress,
    paymentMethod,
    status: 'pending'
  })

  // Process payment (simplified)
  const payment = await processPayment({
    orderId: order.id,
    amount: total,
    method: paymentMethod
  })

  if (payment.success) {
    await updateOrderStatus(order.id, 'confirmed')

    return Response.json({
      success: true,
      order: {
        id: order.id,
        total: order.total,
        estimatedDelivery: calculateDeliveryDate(),
        trackingUrl: `https://yourstore.com/track/${order.id}`
      },
      message: 'Order placed successfully!'
    })
  }

  return Response.json(
    { error: 'Payment failed' },
    { status: 400 }
  )
}
```

### Order Status

```typescript
// app/api/orders/[id]/route.ts
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const order = await getOrder(params.id)

  if (!order) {
    return Response.json(
      { error: 'Order not found' },
      { status: 404 }
    )
  }

  return Response.json({
    id: order.id,
    status: order.status,
    items: order.items,
    total: order.total,
    orderDate: order.createdAt,
    estimatedDelivery: order.estimatedDelivery,
    shippingAddress: order.shippingAddress
  })
}
```

**Example Conversation:**

> **User**: "What's the status of my order?"
>
> **Carla**: *Calls GET /api/orders/recent to find user's latest order*
>
> "Your order #ORD-12345 (placed Oct 15) is currently out for delivery! It should arrive today by 8 PM. You ordered:
> - 2x SoundMax Pro Headphones
> - 1x Charging Cable
>
> Track it here: [tracking link]"

### Order Tracking

```typescript
// app/api/orders/[id]/tracking/route.ts
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const tracking = await getTrackingInfo(params.id)

  return Response.json({
    orderId: params.id,
    carrier: tracking.carrier,
    trackingNumber: tracking.trackingNumber,
    status: tracking.status,
    estimatedDelivery: tracking.estimatedDelivery,
    updates: tracking.updates.map(update => ({
      date: update.timestamp,
      location: update.location,
      status: update.status,
      description: update.description
    }))
  })
}
```

### Returns & Refunds

```typescript
// app/api/returns/route.ts
export async function POST(request: Request) {
  const { orderId, items, reason } = await request.json()

  // Validate order exists and is eligible for return
  const order = await getOrder(orderId)
  const isEligible = await checkReturnEligibility(order)

  if (!isEligible) {
    return Response.json(
      { error: 'Order not eligible for return' },
      { status: 400 }
    )
  }

  // Create return request
  const returnRequest = await createReturn({
    orderId,
    items,
    reason,
    status: 'pending',
    refundAmount: calculateRefund(items)
  })

  return Response.json({
    success: true,
    returnId: returnRequest.id,
    refundAmount: returnRequest.refundAmount,
    returnLabel: returnRequest.shippingLabel,
    message: 'Return request created. You will receive a refund within 5-7 business days after we receive the items.'
  })
}
```

**Example Conversation:**

> **User**: "I want to return the headphones from my last order"
>
> **Carla**: *Calls POST /api/returns with orderId and items*
>
> "I've started a return for your SoundMax Pro Headphones from order #ORD-12345. You'll get a refund of $79.99. I'll email you a prepaid return label. Ship it back within 30 days and you'll receive your refund in 5-7 business days. Need anything else?"

## Tool Configuration

After running `npx @interworky/carla-nextjs scan`, review and enable appropriate tools:

```json
{
  "tools": [
    {
      "name": "get_products",
      "method": "GET",
      "path": "/api/products",
      "enabled": true,
      "description": "Get list of available products with optional category filter"
    },
    {
      "name": "search_products",
      "method": "POST",
      "path": "/api/products/search",
      "enabled": true,
      "description": "Search products by query, category, price range, and availability"
    },
    {
      "name": "get_product_details",
      "method": "GET",
      "path": "/api/products/[id]",
      "enabled": true,
      "description": "Get detailed information about a specific product"
    },
    {
      "name": "add_to_cart",
      "method": "POST",
      "path": "/api/cart/add",
      "enabled": true,
      "description": "Add a product to the shopping cart"
    },
    {
      "name": "create_order",
      "method": "POST",
      "path": "/api/orders",
      "enabled": true,
      "description": "Create a new order with items and shipping information"
    },
    {
      "name": "get_order_status",
      "method": "GET",
      "path": "/api/orders/[id]",
      "enabled": true,
      "description": "Get the current status and details of an order"
    },
    {
      "name": "get_tracking",
      "method": "GET",
      "path": "/api/orders/[id]/tracking",
      "enabled": true,
      "description": "Get detailed tracking information for a shipped order"
    },
    {
      "name": "create_return",
      "method": "POST",
      "path": "/api/returns",
      "enabled": true,
      "description": "Create a return request for order items"
    }
  ]
}
```

## Complete Workflow Example

Here's a complete customer journey:

### 1. Product Discovery

> **User**: "I need wireless headphones for the gym"
>
> **Carla**: "I'll find some great options for you!" *[searches products]*
>
> "For the gym, I recommend these sweat-resistant wireless headphones:
> 1. **SoundMax Pro** - $79.99 - Sweat-proof, 8hr battery, great reviews
> 2. **FitBeats Sport** - $59.99 - Waterproof, secure fit, 6hr battery
> 3. **AudioPro X1** - $99.99 - Premium sound, 10hr battery, noise-canceling
>
> Which sounds good?"

### 2. Product Details & Cart

> **User**: "Tell me more about the SoundMax"
>
> **Carla**: *[gets product details]*
>
> "The SoundMax Pro has:
> - IPX7 waterproof rating
> - 8-hour battery life
> - Bluetooth 5.0
> - Rated 4.5/5 stars (2,341 reviews)
> - In stock, ships today!
>
> Want me to add it to your cart?"
>
> **User**: "Yes, add 1"
>
> **Carla**: *[adds to cart]* "Added! Your cart total is $79.99. Ready to checkout?"

### 3. Order Placement

> **User**: "Yes, checkout"
>
> **Carla**: *[initiates checkout flow]*
>
> "Great! I'll need your shipping address and payment method. Use your saved info or enter new details?"
>
> *[customer provides info]*
>
> **Carla**: *[creates order]*
>
> "Order confirmed! 🎉
> - Order #: ORD-12345
> - Total: $79.99
> - Ships: Today
> - Arrives: Oct 20
>
> I'll send you tracking info via email when it ships!"

### 4. Order Tracking

> **User**: "Where's my order?" *(next day)*
>
> **Carla**: *[checks order status]*
>
> "Your SoundMax Pro shipped yesterday! It's currently in transit and will arrive tomorrow (Oct 20) by 8 PM. Track it here: [link]"

### 5. Post-Purchase Support

> **User**: "How do I pair these with my phone?"
>
> **Carla**: "Easy! Here's how:
> 1. Hold power button for 3 seconds until LED flashes blue
> 2. Go to Bluetooth settings on your phone
> 3. Select 'SoundMax Pro' from the list
> 4. You're connected!
>
> Having trouble? I can create a support ticket for you."

## Best Practices

### 1. Authentication

For user-specific operations (cart, orders), implement proper authentication:

```typescript
import { auth } from '@/lib/auth'

export async function GET(request: Request) {
  const session = await auth(request)

  if (!session) {
    return Response.json(
      { error: 'Please sign in to view orders' },
      { status: 401 }
    )
  }

  const orders = await getUserOrders(session.userId)
  return Response.json(orders)
}
```

### 2. Error Handling

Provide clear, actionable error messages:

```typescript
if (product.inventory < quantity) {
  return Response.json({
    error: 'Insufficient stock',
    available: product.inventory,
    requested: quantity,
    message: `Only ${product.inventory} units available`
  }, { status: 400 })
}
```

### 3. Response Format

Keep responses consistent and informative:

```typescript
return Response.json({
  success: true,
  data: result,
  message: 'Human-readable success message',
  metadata: {
    timestamp: new Date().toISOString(),
    requestId: generateId()
  }
})
```

## Next Steps

1. **Add more tools**: Reviews, wishlists, product comparisons
2. **Enhance analytics**: Track which products Carla recommends most
3. **Personalization**: Use Carla's conversation history for better recommendations
4. **Multi-language**: Carla automatically handles international customers

## Related Examples

- [SaaS Dashboard](/examples/saas) - User management and billing
- [Blog Platform](/examples/blog) - Content management

## Get Help

- [Discord Community](https://discord.com/invite/YHmsekzMV5)
- [GitHub Issues](https://github.com/Multi-Sync/carla-nextjs/issues)
