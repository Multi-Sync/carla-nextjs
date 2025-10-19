# Blog Platform Example

A complete example of integrating Carla with a Next.js blog or content platform.

## Overview

This example shows how to enable Carla to help visitors with:
- Finding and reading blog posts
- Searching content by topic or keyword
- Managing comments and engagement
- Subscribing to newsletter
- Accessing author profiles

## Project Structure

```
app/
├── api/
│   ├── posts/
│   │   ├── route.ts              # List all posts
│   │   ├── [slug]/route.ts       # Get post by slug
│   │   └── search/route.ts       # Search posts
│   ├── authors/
│   │   ├── route.ts              # List authors
│   │   └── [id]/route.ts         # Get author details
│   ├── comments/
│   │   └── route.ts              # Get/create comments
│   ├── newsletter/
│   │   └── subscribe/route.ts    # Newsletter subscription
│   └── categories/
│       └── route.ts              # List categories
```

## API Routes

### Post Listing

```typescript
// app/api/posts/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const limit = parseInt(searchParams.get('limit') || '10')
  const offset = parseInt(searchParams.get('offset') || '0')

  const posts = await getPosts({
    category,
    limit,
    offset,
    status: 'published'
  })

  return Response.json({
    posts: posts.map(post => ({
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      author: post.author.name,
      publishedAt: post.publishedAt,
      readingTime: post.readingTime,
      category: post.category,
      tags: post.tags
    })),
    total: await getPostsCount({ category })
  })
}
```

**Example Conversation:**

> **User**: "Show me recent articles about Next.js"
>
> **Carla**: *Calls POST /api/posts/search with query="Next.js"*
>
> "I found 15 articles about Next.js. Here are the most recent:
>
> 1. **Building AI Agents with Next.js 15** - Oct 15, 2024
>    by Sarah Chen • 8 min read
>
> 2. **Server Actions Deep Dive** - Oct 12, 2024
>    by Mike Johnson • 12 min read
>
> 3. **Optimizing Performance in Next.js Apps** - Oct 10, 2024
>    by Alex Rodriguez • 10 min read
>
> Which one interests you?"

### Post Details

```typescript
// app/api/posts/[slug]/route.ts
export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const post = await getPostBySlug(params.slug)

  if (!post || post.status !== 'published') {
    return Response.json(
      { error: 'Post not found' },
      { status: 404 }
    )
  }

  return Response.json({
    slug: post.slug,
    title: post.title,
    content: post.content,
    excerpt: post.excerpt,
    author: {
      name: post.author.name,
      bio: post.author.bio,
      avatar: post.author.avatar
    },
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt,
    readingTime: post.readingTime,
    category: post.category,
    tags: post.tags,
    relatedPosts: await getRelatedPosts(post.id)
  })
}
```

### Post Search

```typescript
// app/api/posts/search/route.ts
export async function POST(request: Request) {
  const { query, category, tags, author } = await request.json()

  const results = await searchPosts({
    query,
    category,
    tags,
    author,
    status: 'published'
  })

  return Response.json({
    results: results.map(post => ({
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      author: post.author.name,
      publishedAt: post.publishedAt,
      relevanceScore: post.score
    })),
    count: results.length,
    query
  })
}
```

### Author Profiles

```typescript
// app/api/authors/[id]/route.ts
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const author = await getAuthor(params.id)

  if (!author) {
    return Response.json(
      { error: 'Author not found' },
      { status: 404 }
    )
  }

  const posts = await getPostsByAuthor(author.id)

  return Response.json({
    id: author.id,
    name: author.name,
    bio: author.bio,
    avatar: author.avatar,
    social: author.social,
    posts: posts.map(p => ({
      slug: p.slug,
      title: p.title,
      publishedAt: p.publishedAt
    })),
    totalPosts: posts.length
  })
}
```

**Example Conversation:**

> **User**: "Who is Sarah Chen?"
>
> **Carla**: *Calls GET /api/authors with name filter*
>
> "Sarah Chen is one of our technical writers specializing in React and Next.js. She's written 24 articles on web development, AI integration, and performance optimization. Her most popular post is 'Building AI Agents with Next.js 15'. Want to see all her articles?"

### Comments

```typescript
// app/api/comments/route.ts
export async function POST(request: Request) {
  const { postSlug, author, content, email } = await request.json()

  // Validate post exists
  const post = await getPostBySlug(postSlug)
  if (!post) {
    return Response.json(
      { error: 'Post not found' },
      { status: 404 }
    )
  }

  // Create comment (pending moderation)
  const comment = await createComment({
    postId: post.id,
    author,
    content,
    email,
    status: 'pending'
  })

  return Response.json({
    success: true,
    message: 'Comment submitted and awaiting moderation',
    comment: {
      id: comment.id,
      author: comment.author,
      content: comment.content,
      createdAt: comment.createdAt
    }
  })
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const postSlug = searchParams.get('post')

  if (!postSlug) {
    return Response.json(
      { error: 'Post slug required' },
      { status: 400 }
    )
  }

  const post = await getPostBySlug(postSlug)
  const comments = await getComments(post.id, { status: 'approved' })

  return Response.json({
    comments: comments.map(c => ({
      id: c.id,
      author: c.author,
      content: c.content,
      createdAt: c.createdAt
    })),
    total: comments.length
  })
}
```

**Example Conversation:**

> **User**: "Leave a comment on the Next.js 15 article: This was super helpful!"
>
> **Carla**: *Creates comment*
>
> "Thanks! I've submitted your comment on 'Building AI Agents with Next.js 15'. It will appear after moderation (usually within 24 hours). Want to subscribe to comment replies?"

### Newsletter Subscription

```typescript
// app/api/newsletter/subscribe/route.ts
export async function POST(request: Request) {
  const { email, name, interests } = await request.json()

  // Validate email
  if (!email || !isValidEmail(email)) {
    return Response.json(
      { error: 'Valid email required' },
      { status: 400 }
    )
  }

  // Check if already subscribed
  const existing = await getSubscriber(email)
  if (existing) {
    return Response.json({
      success: true,
      message: 'You are already subscribed!',
      alreadySubscribed: true
    })
  }

  // Create subscription
  const subscriber = await createSubscriber({
    email,
    name,
    interests,
    status: 'pending',
    confirmationToken: generateToken()
  })

  // Send confirmation email
  await sendConfirmationEmail(subscriber)

  return Response.json({
    success: true,
    message: 'Please check your email to confirm your subscription',
    subscriber: {
      email: subscriber.email,
      interests: subscriber.interests
    }
  })
}
```

**Example Conversation:**

> **User**: "I want to subscribe to your newsletter"
>
> **Carla**: "Great! I'll sign you up. What's your email address?"
>
> **User**: "sarah@example.com"
>
> **Carla**: *Creates subscription*
>
> "Perfect! I've sent a confirmation email to sarah@example.com. Click the link in that email to complete your subscription. You'll get weekly updates on Next.js, React, and web development!"

### Categories

```typescript
// app/api/categories/route.ts
export async function GET() {
  const categories = await getCategories()

  return Response.json({
    categories: categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      postCount: cat.postCount
    }))
  })
}
```

## Tool Configuration

```json
{
  "tools": [
    {
      "name": "list_posts",
      "method": "GET",
      "path": "/api/posts",
      "enabled": true,
      "description": "List blog posts with optional category filter"
    },
    {
      "name": "get_post",
      "method": "GET",
      "path": "/api/posts/[slug]",
      "enabled": true,
      "description": "Get detailed content of a specific blog post"
    },
    {
      "name": "search_posts",
      "method": "POST",
      "path": "/api/posts/search",
      "enabled": true,
      "description": "Search blog posts by keyword, category, tags, or author"
    },
    {
      "name": "get_author",
      "method": "GET",
      "path": "/api/authors/[id]",
      "enabled": true,
      "description": "Get author profile and their posts"
    },
    {
      "name": "get_comments",
      "method": "GET",
      "path": "/api/comments",
      "enabled": true,
      "description": "Get comments for a specific post"
    },
    {
      "name": "create_comment",
      "method": "POST",
      "path": "/api/comments",
      "enabled": true,
      "description": "Submit a new comment on a blog post"
    },
    {
      "name": "subscribe_newsletter",
      "method": "POST",
      "path": "/api/newsletter/subscribe",
      "enabled": true,
      "description": "Subscribe to the newsletter"
    },
    {
      "name": "get_categories",
      "method": "GET",
      "path": "/api/categories",
      "enabled": true,
      "description": "List all blog categories"
    }
  ]
}
```

## Complete Workflow Example

### Content Discovery Journey

> **User**: "Hi! I'm looking for tutorials on React hooks"
>
> **Carla**: *Searches posts*
>
> "I found several great tutorials on React hooks! Here are the top ones:
>
> 1. **React Hooks Complete Guide** (beginner-friendly)
>    by Sarah Chen • 15 min read • Oct 2024
>
> 2. **Advanced Hooks Patterns** (intermediate)
>    by Mike Johnson • 20 min read • Sep 2024
>
> 3. **Building Custom Hooks** (advanced)
>    by Alex Rodriguez • 18 min read • Sep 2024
>
> Which level are you at?"
>
> **User**: "I'm a beginner"
>
> **Carla**: "Perfect! I recommend starting with Sarah Chen's 'React Hooks Complete Guide'. It covers useState, useEffect, and useContext with practical examples. Want me to open it for you?"
>
> **User**: "Yes please"
>
> **Carla**: *Opens post* "Here's the article! It's a 15-minute read. Let me know if you have questions while reading. By the way, Sarah has also written a follow-up on 'Custom Hooks for Beginners' if you want to continue learning after this one!"

### Engagement Flow

> **User**: "This article is amazing! How can I get more like this?"
>
> **Carla**: "Glad you enjoyed it! I have a few suggestions:
> 1. Follow Sarah Chen (she writes about React weekly)
> 2. Subscribe to our newsletter (weekly React & Next.js tutorials)
> 3. Browse the 'React' category (42 articles)
>
> What sounds good?"
>
> **User**: "I'll subscribe to the newsletter"
>
> **Carla**: *Initiates subscription*
>
> "Great choice! What's your email?"
>
> **User**: "john@example.com"
>
> **Carla**: *Completes subscription*
>
> "You're all set! Check john@example.com for a confirmation link. Once confirmed, you'll get our weekly digest every Monday with the best React and Next.js content. Want to customize what topics you're interested in?"

## Best Practices

### 1. Content Recommendations

Use conversation context for better recommendations:

```typescript
// Track what user reads
const userInterests = analyzeConversation(chatHistory)

// Recommend similar content
const recommendations = await getRecommendations({
  interests: userInterests,
  exclude: alreadyRead
})
```

### 2. Reading Time

Always include reading time estimates:

```typescript
function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const wordCount = content.split(/\s+/).length
  return Math.ceil(wordCount / wordsPerMinute)
}
```

### 3. SEO-Friendly Responses

Help Carla understand SEO metadata:

```typescript
return Response.json({
  title: post.title,
  description: post.metaDescription,
  keywords: post.keywords,
  canonicalUrl: `https://yourblog.com/posts/${post.slug}`
})
```

## Advanced Features

### Personalized Content Feed

```typescript
// Carla learns user preferences
"Based on what you've read, I think you'd love these:
- 'TypeScript Best Practices' (you enjoyed Sarah's writing style)
- 'Next.js App Router Guide' (you read 3 Next.js articles)
- 'React Performance Tips' (matches your skill level)"
```

### Content Summaries

```typescript
// Carla can summarize long articles
User: "Can you summarize this article?"
Carla: "Sure! This 20-minute article covers:
1. Introduction to React Server Components
2. Benefits over traditional client components
3. How to migrate existing code
4. Common pitfalls and solutions
5. Performance benchmarks

Want the full article or just a specific section?"
```

## Related Examples

- [E-commerce Store](/examples/ecommerce) - Product search and orders
- [SaaS Dashboard](/examples/saas) - User management and analytics

## Get Help

- [Discord Community](https://discord.com/invite/YHmsekzMV5)
- [GitHub Issues](https://github.com/Multi-Sync/carla-nextjs/issues)
