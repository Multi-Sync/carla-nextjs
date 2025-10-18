# What is Carla?

Carla is an AI agent for websites that combines customer support, analytics, performance monitoring, and bug detection into a single intelligent assistant.

## The Problem

Traditional chatbots can only provide canned responses based on pre-written scripts or documentation. They can't interact with your application's backend, access real-time data, or perform actions on behalf of users.

## The Solution

Carla integrates directly with your Next.js API routes, giving it the ability to:

- **Read real data** from your database through your APIs
- **Perform actions** like creating records, updating settings, or processing requests
- **Answer questions** with accurate, real-time information
- **Monitor performance** and detect issues automatically
- **Analyze user behavior** and provide insights

## How It Works with Your APIs

Instead of just answering questions, Carla can actually use your application's functionality:

### Example: E-commerce Store

```typescript
// Your existing API route: /api/orders/[id]/route.ts
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const order = await getOrderById(params.id)
  return Response.json(order)
}
```

With Carla Next.js, this API becomes a tool that Carla can use:

**User**: "What's the status of my order #12345?"

**Carla**: *Calls `/api/orders/12345`* → "Your order is currently being prepared and will ship tomorrow. Expected delivery is Dec 15th."

## Key Capabilities

### 1. Customer Support

Carla can handle customer inquiries by accessing your data:

- Order status and tracking
- Account information
- Product availability
- Return requests
- FAQ and documentation

### 2. Analytics

Track and analyze user interactions:

- Most asked questions
- Common user journeys
- Conversion patterns
- Drop-off points
- Feature usage

### 3. Performance Monitoring

Monitor your application in real-time:

- API response times
- Error rates
- User experience metrics
- System health
- Resource usage

### 4. Bug Detection

Automatically detect and report issues:

- Failed API calls
- User-reported errors
- Unexpected behavior
- Data validation errors
- Integration failures

## Why Next.js?

Next.js is the perfect platform for Carla because:

- **API Routes** - Built-in API endpoints that Carla can use as tools
- **TypeScript** - Strong typing helps Carla understand your APIs
- **Server Components** - Seamless integration between frontend and backend
- **Deployment** - Easy to deploy on Vercel, AWS, or any platform

## The Carla Next.js Package

This package (`@interworky/carla-nextjs`) bridges the gap between your Next.js application and Carla:

1. **Scans** your API routes automatically
2. **Generates** tool definitions with proper types
3. **Syncs** tools to the Interworky platform
4. **Embeds** the Carla widget on your site
5. **Enables** real-time AI interactions with your backend

## Comparison

| Feature | Traditional Chatbot | Carla with Next.js |
|---------|-------------------|-------------------|
| Answer FAQs | ✅ | ✅ |
| Access real-time data | ❌ | ✅ |
| Perform actions | ❌ | ✅ |
| Use your APIs | ❌ | ✅ |
| Monitor performance | ❌ | ✅ |
| Track analytics | Basic | Advanced |
| TypeScript support | ❌ | ✅ |
| Auto-sync with backend | ❌ | ✅ |

## Getting Started

Ready to integrate Carla with your Next.js app?

- [Installation Guide](/guide/getting-started)
- [See Examples](/examples/)
- [Join Discord](https://discord.com/invite/YHmsekzMV5)
