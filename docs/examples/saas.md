# SaaS Dashboard Example

A complete example of integrating Carla with a Next.js SaaS application.

## Overview

This example shows how to enable Carla to help users with:
- Account management and settings
- Usage analytics and insights
- Billing and subscription management
- Support ticket creation
- Team member invitations

## Project Structure

```
app/
├── api/
│   ├── user/
│   │   ├── route.ts              # Get user profile
│   │   ├── preferences/route.ts  # Update preferences
│   │   └── usage/route.ts        # Get usage stats
│   ├── billing/
│   │   ├── route.ts              # Get billing info
│   │   ├── invoices/route.ts     # List invoices
│   │   └── subscription/route.ts # Manage subscription
│   ├── team/
│   │   ├── route.ts              # List team members
│   │   └── invite/route.ts       # Invite member
│   ├── analytics/
│   │   └── route.ts              # Get analytics data
│   └── support/
│       └── tickets/route.ts      # Create/view tickets
```

## API Routes

### User Profile

```typescript
// app/api/user/route.ts
import { auth } from '@/lib/auth'

export async function GET(request: Request) {
  const session = await auth(request)

  if (!session) {
    return Response.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const user = await getUserProfile(session.userId)

  return Response.json({
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    role: user.role,
    plan: user.subscription.plan,
    joinedAt: user.createdAt
  })
}
```

### User Preferences

```typescript
// app/api/user/preferences/route.ts
export async function PUT(request: Request) {
  const session = await auth(request)
  const { notifications, theme, language, timezone } = await request.json()

  await updateUserPreferences(session.userId, {
    notifications,
    theme,
    language,
    timezone
  })

  return Response.json({
    success: true,
    message: 'Preferences updated successfully'
  })
}
```

**Example Conversation:**

> **User**: "Turn off email notifications"
>
> **Carla**: *Calls PUT /api/user/preferences with notifications.email=false*
>
> "Done! I've turned off email notifications. You'll still get in-app notifications. Want to change anything else?"

### Usage Analytics

```typescript
// app/api/user/usage/route.ts
export async function GET(request: Request) {
  const session = await auth(request)
  const searchParams = new URL(request.url).searchParams
  const period = searchParams.get('period') || '30d'

  const usage = await getUserUsage(session.userId, period)

  return Response.json({
    period,
    apiCalls: {
      current: usage.apiCalls,
      limit: usage.apiCallsLimit,
      percentUsed: (usage.apiCalls / usage.apiCallsLimit) * 100
    },
    storage: {
      current: usage.storageGB,
      limit: usage.storageLimit,
      percentUsed: (usage.storageGB / usage.storageLimit) * 100
    },
    activeUsers: usage.activeUsers,
    trend: usage.trend
  })
}
```

**Example Conversation:**

> **User**: "How much of my API quota have I used?"
>
> **Carla**: *Calls GET /api/user/usage*
>
> "You've used 7,342 of your 10,000 API calls this month (73.4%). You're on track to stay within your limit. Your usage is up 12% from last month. Need to upgrade your plan?"

### Billing Information

```typescript
// app/api/billing/route.ts
export async function GET(request: Request) {
  const session = await auth(request)

  const billing = await getBillingInfo(session.userId)

  return Response.json({
    subscription: {
      plan: billing.plan,
      status: billing.status,
      currentPeriodEnd: billing.currentPeriodEnd,
      cancelAtPeriodEnd: billing.cancelAtPeriodEnd
    },
    paymentMethod: {
      type: billing.paymentMethod.type,
      last4: billing.paymentMethod.last4,
      expiryMonth: billing.paymentMethod.expiryMonth,
      expiryYear: billing.paymentMethod.expiryYear
    },
    nextInvoice: {
      amount: billing.nextInvoiceAmount,
      date: billing.nextInvoiceDate
    }
  })
}
```

**Example Conversation:**

> **User**: "When is my next bill?"
>
> **Carla**: *Calls GET /api/billing*
>
> "Your next bill of $49.00 will be charged on November 15, 2024 to your Visa ending in 4242. Your Pro plan renews automatically. Want me to send you the upcoming invoice?"

### Subscription Management

```typescript
// app/api/billing/subscription/route.ts
export async function PUT(request: Request) {
  const session = await auth(request)
  const { action, planId } = await request.json()

  if (action === 'upgrade' || action === 'downgrade') {
    const result = await changePlan(session.userId, planId)

    return Response.json({
      success: true,
      message: `Successfully ${action}d to ${result.newPlan} plan`,
      newPlan: result.newPlan,
      effectiveDate: result.effectiveDate,
      proratedAmount: result.proratedAmount
    })
  }

  if (action === 'cancel') {
    await cancelSubscription(session.userId)

    return Response.json({
      success: true,
      message: 'Subscription will be cancelled at the end of the billing period',
      accessUntil: getBillingPeriodEnd(session.userId)
    })
  }

  return Response.json(
    { error: 'Invalid action' },
    { status: 400 }
  )
}
```

**Example Conversation:**

> **User**: "I want to upgrade to the Pro plan"
>
> **Carla**: *Calls PUT /api/billing/subscription with action="upgrade", planId="pro"*
>
> "Great choice! I've upgraded you to the Pro plan. Changes are effective immediately. You'll be charged a prorated amount of $23.45 today, and then $49/month starting next billing cycle. Your new features are already active!"

### Invoices

```typescript
// app/api/billing/invoices/route.ts
export async function GET(request: Request) {
  const session = await auth(request)

  const invoices = await getInvoices(session.userId)

  return Response.json({
    invoices: invoices.map(inv => ({
      id: inv.id,
      date: inv.date,
      amount: inv.amount,
      status: inv.status,
      pdfUrl: inv.pdfUrl,
      description: inv.description
    }))
  })
}
```

### Team Management

```typescript
// app/api/team/route.ts
export async function GET(request: Request) {
  const session = await auth(request)

  const team = await getTeamMembers(session.userId)

  return Response.json({
    members: team.map(member => ({
      id: member.id,
      name: member.name,
      email: member.email,
      role: member.role,
      status: member.status,
      joinedAt: member.joinedAt
    })),
    invitations: await getPendingInvitations(session.userId)
  })
}
```

### Team Invitations

```typescript
// app/api/team/invite/route.ts
export async function POST(request: Request) {
  const session = await auth(request)
  const { email, role } = await request.json()

  // Check if user has permission to invite
  const canInvite = await checkInvitePermission(session.userId)

  if (!canInvite) {
    return Response.json(
      { error: 'Insufficient permissions to invite team members' },
      { status: 403 }
    )
  }

  const invitation = await inviteTeamMember({
    invitedBy: session.userId,
    email,
    role
  })

  return Response.json({
    success: true,
    message: `Invitation sent to ${email}`,
    invitation: {
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      expiresAt: invitation.expiresAt
    }
  })
}
```

**Example Conversation:**

> **User**: "Invite john@example.com to the team as a developer"
>
> **Carla**: *Calls POST /api/team/invite with email and role*
>
> "Done! I've sent an invitation to john@example.com with Developer access. They'll have 7 days to accept. I'll notify you when they join!"

### Analytics Dashboard

```typescript
// app/api/analytics/route.ts
export async function GET(request: Request) {
  const session = await auth(request)
  const searchParams = new URL(request.url).searchParams

  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')
  const metrics = searchParams.get('metrics')?.split(',')

  const analytics = await getAnalytics(session.userId, {
    startDate,
    endDate,
    metrics
  })

  return Response.json({
    period: { startDate, endDate },
    data: analytics
  })
}
```

**Example Conversation:**

> **User**: "Show me my analytics for last week"
>
> **Carla**: *Calls GET /api/analytics with date range*
>
> "Here's your analytics from Oct 10-17:
> - **Total Users**: 1,234 (↑ 15% from previous week)
> - **API Calls**: 45,231 (↑ 8%)
> - **Active Sessions**: 892 avg
> - **Error Rate**: 0.3% (↓ 0.1%)
>
> Great week! Traffic is trending up. Want me to show specific metrics?"

### Support Tickets

```typescript
// app/api/support/tickets/route.ts
export async function POST(request: Request) {
  const session = await auth(request)
  const { subject, description, priority, category } = await request.json()

  const ticket = await createSupportTicket({
    userId: session.userId,
    subject,
    description,
    priority: priority || 'medium',
    category,
    status: 'open'
  })

  return Response.json({
    success: true,
    ticket: {
      id: ticket.id,
      subject: ticket.subject,
      status: ticket.status,
      priority: ticket.priority,
      createdAt: ticket.createdAt
    },
    message: 'Support ticket created. We typically respond within 24 hours.'
  })
}

export async function GET(request: Request) {
  const session = await auth(request)

  const tickets = await getUserTickets(session.userId)

  return Response.json({
    tickets: tickets.map(t => ({
      id: t.id,
      subject: t.subject,
      status: t.status,
      priority: t.priority,
      createdAt: t.createdAt,
      lastUpdate: t.updatedAt
    }))
  })
}
```

**Example Conversation:**

> **User**: "I'm having trouble with the API integration"
>
> **Carla**: "I can help! Let me create a support ticket for you. Can you describe the issue in more detail?"
>
> **User**: "The authentication keeps failing with error 401"
>
> **Carla**: *Creates ticket*
>
> "I've created ticket #SUPP-12345 for the API authentication issue. Our engineering team will investigate and respond within 24 hours. In the meantime, have you checked that your API key is active in Settings?"

## Tool Configuration

```json
{
  "tools": [
    {
      "name": "get_user_profile",
      "method": "GET",
      "path": "/api/user",
      "enabled": true,
      "description": "Get current user's profile information"
    },
    {
      "name": "update_preferences",
      "method": "PUT",
      "path": "/api/user/preferences",
      "enabled": true,
      "description": "Update user preferences like notifications, theme, language"
    },
    {
      "name": "get_usage_stats",
      "method": "GET",
      "path": "/api/user/usage",
      "enabled": true,
      "description": "Get current usage statistics and quota information"
    },
    {
      "name": "get_billing_info",
      "method": "GET",
      "path": "/api/billing",
      "enabled": true,
      "description": "Get billing information and subscription details"
    },
    {
      "name": "manage_subscription",
      "method": "PUT",
      "path": "/api/billing/subscription",
      "enabled": true,
      "description": "Upgrade, downgrade, or cancel subscription"
    },
    {
      "name": "get_invoices",
      "method": "GET",
      "path": "/api/billing/invoices",
      "enabled": true,
      "description": "List all past invoices"
    },
    {
      "name": "get_team_members",
      "method": "GET",
      "path": "/api/team",
      "enabled": true,
      "description": "Get list of team members and pending invitations"
    },
    {
      "name": "invite_team_member",
      "method": "POST",
      "path": "/api/team/invite",
      "enabled": true,
      "description": "Send invitation to new team member"
    },
    {
      "name": "get_analytics",
      "method": "GET",
      "path": "/api/analytics",
      "enabled": true,
      "description": "Get analytics data for specified date range and metrics"
    },
    {
      "name": "create_support_ticket",
      "method": "POST",
      "path": "/api/support/tickets",
      "enabled": true,
      "description": "Create a new support ticket"
    },
    {
      "name": "get_support_tickets",
      "method": "GET",
      "path": "/api/support/tickets",
      "enabled": true,
      "description": "List all support tickets for current user"
    }
  ]
}
```

## Complete Workflow Example

### User Onboarding Flow

> **User**: "Hi, I just signed up. What can I do?"
>
> **Carla**: "Welcome! 🎉 I'm Carla, your AI assistant. I can help you with:
> - Setting up your account
> - Understanding your usage and billing
> - Managing your team
> - Getting analytics insights
> - Creating support tickets
>
> What would you like to start with?"
>
> **User**: "How do I invite my team?"
>
> **Carla**: "Easy! Just give me the email addresses and roles. For example: 'Invite sarah@company.com as a developer' or I can show you all available roles first."
>
> **User**: "What roles are available?"
>
> **Carla**: "We have these roles:
> - **Admin** - Full access to everything
> - **Developer** - Access to API keys, integrations, team management
> - **Analyst** - Read-only access to analytics and reports
> - **Support** - Access to support tickets and user data
>
> Who would you like to invite?"

## Best Practices

### 1. Permission Checks

Always verify user permissions before performing actions:

```typescript
export async function POST(request: Request) {
  const session = await auth(request)
  const hasPermission = await checkPermission(session.userId, 'manage_billing')

  if (!hasPermission) {
    return Response.json(
      { error: 'You don\'t have permission to manage billing' },
      { status: 403 }
    )
  }

  // Proceed with action...
}
```

### 2. Usage Limits

Implement and communicate usage limits clearly:

```typescript
const usage = await getUserUsage(userId)

if (usage.apiCalls >= usage.apiCallsLimit) {
  return Response.json({
    error: 'API quota exceeded',
    current: usage.apiCalls,
    limit: usage.apiCallsLimit,
    resetDate: usage.quotaResetDate,
    upgradeUrl: '/billing/upgrade'
  }, { status: 429 })
}
```

### 3. Audit Logging

Log important actions for security and compliance:

```typescript
await auditLog({
  userId: session.userId,
  action: 'subscription_upgraded',
  details: { from: 'basic', to: 'pro' },
  timestamp: new Date()
})
```

## Advanced Features

### Automated Insights

Carla can proactively notify users about important events:

```typescript
// Carla detects approaching quota limit
"⚠️ Heads up! You've used 90% of your API quota this month. You have 1,000 calls remaining until your limit resets on Nov 1. Want to upgrade to avoid interruptions?"

// Carla notices unusual activity
"📊 Your API usage spiked 300% today compared to your average. Everything okay? This might affect your quota."

// Carla reminds about expiring payment method
"💳 Your payment method ending in 4242 expires next month. Want me to help you update it?"
```

## Related Examples

- [E-commerce Store](/examples/ecommerce) - Product and order management
- [Blog Platform](/examples/blog) - Content management

## Get Help

- [Discord Community](https://discord.com/invite/YHmsekzMV5)
- [GitHub Issues](https://github.com/Multi-Sync/carla-nextjs/issues)
