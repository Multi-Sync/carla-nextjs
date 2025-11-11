# AI Customer Support Widget

**Premium Feature** - Requires active subscription ($19.99/month) or 7-day free trial

The AI Customer Support Widget provides intelligent, real-time customer support through an embeddable voice & text chat interface. Trained on your website content, it can answer questions, guide users, and handle inquiries 24/7.

## Overview

The Customer Support Widget includes:

- 💬 **Text Chat** - Real-time text-based conversations
- 🎤 **Voice Chat** - Speech-to-text and text-to-speech capabilities
- 🤖 **AI-Powered Responses** - Intelligent answers based on your content
- 🎨 **Customizable Appearance** - Match your brand colors and style
- 📱 **Mobile Responsive** - Works seamlessly on all devices
- 🌍 **Multi-Language Support** - Automatically detects user language
- 📊 **Conversation Analytics** - Track chat metrics and user satisfaction
- 🔄 **Live Handoff** - Transfer to human support when needed

## Requirements

### Subscription
- ✅ **Active premium subscription** ($19.99/month) OR
- ✅ **Active 7-day free trial**

[Start your free trial →](https://interworky.com/checkout?feature=customer_support)

### Technical Requirements
- **Next.js 14+** application
- **Carla widget** installed
- **Website content** for AI training

## Getting Started

### Step 1: Subscribe to Premium

If you're on the free tier, you'll need to upgrade:

1. Go to **Dashboard → Settings → Billing**
2. Click **"Start 7-Day Free Trial"**
3. Enter credit card information (required, **free for 7 days**)
4. Complete checkout

**Trial details:**
- Free for first 7 days
- $19.99/month after trial
- Cancel anytime during trial at no charge
- Customer Support widget enabled immediately

### Step 2: Install Carla Widget (If Not Already Done)

The Customer Support widget requires the base Carla widget:

```bash
# Install widget
npx @interworky/carla-nextjs install
```

This adds the widget component to your Next.js application.

::: tip Already Installed?
If you already installed the widget for free tier features (performance monitoring, analytics), you're all set! Just enable the Customer Support feature.
:::

### Step 3: Enable Customer Support

1. Go to **Dashboard → Home**
2. Find the **Chat Widget (Customer Support)** module
3. Click **"Enable Customer Support"**
4. The widget will now appear on your website

### Step 4: Train the AI

The AI needs to learn about your business:

#### Automatic Website Scraping

Carla automatically scrapes your public website:

1. Go to **Dashboard → Customer Support → Training**
2. Enter your website URL (e.g., `https://yoursite.com`)
3. Click **"Start Scraping"**
4. Carla will crawl your site and extract content

**What gets scraped:**
- Page content and headings
- Product descriptions
- Pricing information
- FAQ pages
- About pages
- Documentation

**What doesn't get scraped:**
- Password-protected pages
- Dynamic content requiring JavaScript
- Forms and user inputs
- Private data behind authentication

**Scraping time:** 5-20 minutes depending on site size

#### Manual Content Upload (Optional)

For content not available publicly:

1. **Dashboard → Customer Support → Training → Upload**
2. Upload documents:
   - PDF files (product docs, manuals)
   - Markdown files (documentation)
   - Plain text files (FAQs, policies)
   - CSV files (product data)

**File size limits:**
- Individual file: 10MB max
- Total content: 100MB max (free tier), unlimited (premium)

### Step 5: Test the Widget

1. Visit your website
2. Look for the chat widget (bottom-right corner by default)
3. Click to open
4. Ask a question about your product/service
5. Verify AI provides accurate responses

**Example test questions:**
- "What products do you offer?"
- "How much does pricing start at?"
- "Do you have a free trial?"
- "How do I contact support?"

## Widget Features

### Text Chat

Real-time text-based conversations:

**User experience:**
1. User clicks chat widget icon
2. Chat window opens
3. User types message
4. AI responds within 1-3 seconds
5. Conversation continues naturally

**AI capabilities:**
- Understands natural language
- Handles follow-up questions
- Remembers conversation context
- Provides links to relevant pages
- Offers multiple response options

**Example conversation:**
```
User: What's included in the free tier?

AI: The free tier of Carla includes:
• Real-time performance monitoring
• Error detection with stack traces
• Analytics and visitor insights
• 10,000+ device awareness

No credit card required! Would you like to know about premium features?

[Yes, tell me more] [No, thanks]
```

### Voice Chat

Speech-to-text and text-to-speech:

**How to use:**
1. Click microphone icon in chat
2. Speak your question
3. AI transcribes and responds
4. Response can be read aloud

**Features:**
- **Speech recognition** - Converts speech to text
- **Text-to-speech** - Reads responses aloud
- **Voice selection** - Choose AI voice (male/female)
- **Language detection** - Automatically detects spoken language

**Best for:**
- Mobile users
- Accessibility
- Hands-free interaction
- Multitasking users

**Example:**
```
User: [speaks] "How do I integrate Carla with my Next.js app?"

AI: [text response] "To integrate Carla with your Next.js app:
1. Run 'npx @interworky/carla-nextjs init'
2. Install the widget with 'npx @interworky/carla-nextjs install'
3. Your app is now monitored!

Would you like step-by-step instructions sent to your email?"

[response also read aloud if voice enabled]
```

### Conversation Context

AI maintains conversation history:

**Context retention:**
- Remembers previous questions in same session
- Understands pronouns ("it", "that", "them")
- Recalls user preferences mentioned earlier
- Builds on previous answers

**Example contextual conversation:**
```
User: Tell me about your pricing

AI: We have two tiers:
- Free: Performance monitoring, analytics (always free)
- Premium: Auto-Fix, AI Support ($19.99/mo with 7-day trial)

User: What happens after the trial?

AI: [understands "trial" refers to premium tier mentioned above]
After your 7-day free trial, you'll be charged $19.99/month unless you cancel...

User: Can I cancel it?

AI: [understands "it" refers to premium subscription]
Yes! You can cancel anytime from Dashboard → Settings → Billing...
```

### Smart Features

#### Link Insertion

AI includes relevant links:

```
AI: To get started with Carla, visit our Getting Started guide:
👉 https://carla.interworky.com/guide/getting-started

Or watch our 5-minute setup video:
👉 https://youtu.be/...
```

#### Code Snippets

AI can show code examples:

```
User: How do I track custom events?

AI: You can track custom events with this code:

```tsx
import { trackEvent } from '@interworky/carla-nextjs'

trackEvent('button_click', {
  button: 'Start Trial',
  location: 'hero'
})
```

Would you like more examples?
```

#### Quick Replies

AI suggests quick response options:

```
AI: Would you like to:

[📊 See pricing details]
[🚀 Start free trial]
[📧 Contact sales]
[📖 Read documentation]
```

Clicking a button sends that message automatically.

#### Escalation to Human

For complex questions, AI offers human handoff:

```
AI: This question requires specific technical details about your setup.
Would you like me to connect you with our support team?

[Yes, connect me] [No, keep chatting]
```

**If user clicks "Yes, connect me":**
1. Conversation transcript sent to your support team
2. Email notification to support inbox
3. User provided with support email/form
4. Option to continue with AI while waiting

## Customization

### Appearance

Customize the widget to match your brand:

**Dashboard → Customer Support → Appearance**

#### Widget Position
- Bottom right (default)
- Bottom left
- Top right
- Top left
- Custom position (CSS)

#### Colors
- **Primary color** - Widget background, buttons
- **Text color** - Message text
- **User message color** - User's chat bubbles
- **AI message color** - AI's chat bubbles
- **Accent color** - Links, highlights

**Example:**
```json
{
  "primaryColor": "#0070f3",
  "textColor": "#ffffff",
  "userMessageColor": "#0070f3",
  "aiMessageColor": "#f1f3f5",
  "accentColor": "#ff6b6b"
}
```

#### Widget Icon
- Upload custom icon (SVG, PNG)
- Or choose from library
- Size: 40x40px to 60x60px

#### Welcome Message
Customize the first message users see:

```
Default: "Hi! How can I help you today?"

Custom examples:
- "👋 Welcome to Acme! Ask me anything about our products."
- "Need help? I'm here 24/7 to answer questions!"
- "🎉 New here? Let me show you around!"
```

#### Greeting Delay
Set delay before showing welcome message:
- **Immediate** - Shows right away when page loads
- **3 seconds** - Gives user time to browse first
- **5 seconds** - User has scrolled/interacted
- **Never** - Only shows when user opens widget

**Best practice:** 3-5 seconds to avoid being intrusive

### Behavior

Configure widget behavior:

#### Availability Hours

Set when the widget is available:

```
Monday - Friday: 9 AM - 5 PM EST
Saturday - Sunday: Closed

(AI still responds outside hours, but shows "Human support available 9-5 EST" message)
```

#### Auto-Open

Automatically open widget for certain users:

- **First-time visitors** - Greet new users
- **Returning visitors** - Welcome back message
- **Specific pages** - Auto-open on pricing, checkout
- **After N seconds** - Open after user spends time on page
- **On exit intent** - Open when user moves to close tab

**Example: Exit intent**
```
User moves mouse toward close button

Widget auto-opens: "Wait! Need help with anything before you go?"
```

#### Conversation Starters

Show suggested questions:

```
Widget opens showing:

"👋 Hi! I can help you with:

- 📊 Pricing and plans
- 🚀 Getting started guide
- ❓ Frequently asked questions
- 💬 Technical support

What would you like to know?"
```

### Advanced Settings

#### Rate Limiting

Prevent abuse:

```
Max messages per session: 50
Max sessions per IP per day: 10
Ban abusive users: Enabled
```

#### Content Filtering

Filter inappropriate content:

- Block profanity
- Detect spam
- Flag sensitive topics
- Prevent malicious links

#### Privacy Settings

Configure data collection:

```
□ Store conversation history (for training)
□ Include user IP address
☑ Anonymize user data
☑ GDPR compliance mode
☑ Allow users to delete their data
```

#### Integration Webhooks

Send chat events to external systems:

```
POST https://yourapi.com/webhooks/chat
{
  "event": "conversation_started",
  "user_id": "anonymous_12345",
  "timestamp": "2025-11-10T14:32:15Z",
  "page": "/pricing"
}
```

**Available events:**
- `conversation_started`
- `conversation_ended`
- `message_sent`
- `escalation_requested`
- `satisfaction_rated`

## Analytics & Insights

### Conversation Metrics

Track widget performance:

**Dashboard → Customer Support → Analytics**

#### Volume Metrics
- **Total conversations:** 1,234 this month
- **Average messages per conversation:** 4.2
- **Total messages:** 5,185
- **Active users now:** 12

#### Engagement Metrics
- **Response time:** Avg 1.2 seconds
- **Conversation duration:** Avg 3m 45s
- **Satisfaction score:** 4.5/5 (based on ratings)
- **Resolution rate:** 78% (AI resolved without escalation)

#### Common Questions

Top 10 questions asked:

```
1. "What's included in the free tier?" - 234 times
2. "How much does it cost?" - 187 times
3. "How do I cancel my subscription?" - 145 times
4. "Do you have a refund policy?" - 98 times
5. "How do I integrate with Next.js?" - 87 times
```

**Use insights to:**
- Improve documentation for common questions
- Update website content
- Identify missing information
- Train AI better

#### Sentiment Analysis

Understand user emotions:

- **Positive:** 68% (happy, satisfied users)
- **Neutral:** 24% (factual questions)
- **Negative:** 8% (frustrated, confused users)

**Example negative sentiment:**
```
User: "This is confusing, I can't figure out how to cancel"
Sentiment: Negative (frustration)

Action: Improve cancellation documentation
```

### User Satisfaction

Rate AI responses:

Users can rate each AI response:
- 👍 Helpful
- 👎 Not helpful

Or provide detailed feedback:
```
How was this response?

⭐⭐⭐⭐⭐ (5 stars)

"Very clear explanation, exactly what I needed!"
```

**Dashboard shows:**
- Overall satisfaction score
- Percentage of positive ratings
- Common complaints
- Best-performing responses

### Conversation Transcripts

View full conversation history:

**Dashboard → Customer Support → Conversations**

| ID | Date | Duration | Messages | Status | Rating |
|----|------|----------|----------|--------|--------|
| #1234 | Nov 10 | 4m 32s | 8 | Resolved | ⭐⭐⭐⭐⭐ |
| #1235 | Nov 10 | 2m 15s | 4 | Resolved | ⭐⭐⭐⭐ |
| #1236 | Nov 10 | 6m 45s | 12 | Escalated | ⭐⭐ |

Click any conversation to view full transcript:

```
Conversation #1234
Started: Nov 10, 2025 at 2:30 PM
Duration: 4m 32s
Pages visited: /pricing, /checkout
Status: Resolved

---

User: What's the difference between free and premium?

AI: Great question! Here's a quick comparison:

Free Tier (Always FREE):
• Performance monitoring
• Error tracking
• Analytics

Premium Tier ($19.99/month with 7-day free trial):
• Everything in Free
• AI-Powered Auto-Fix (creates GitHub PRs)
• AI Customer Support Widget
• GitHub Integration

Would you like to try premium with our free trial?

User: Yes, how do I start the trial?

AI: To start your 7-day free trial:
1. Visit your Dashboard → Settings → Billing
2. Click "Start 7-Day Free Trial"
3. Enter credit card info (required but free for 7 days)
4. That's it! Premium features activate immediately

Cancel anytime during the trial at no charge.

[Start Free Trial] button

User: Thanks!

---

User rated this conversation: ⭐⭐⭐⭐⭐
"Super helpful, exactly what I needed!"
```

## Training & Improvement

### Content Updates

Keep AI knowledge up-to-date:

**Dashboard → Customer Support → Training → Refresh**

1. Re-scrape website to detect content changes
2. Upload new documents (product updates, policies)
3. AI automatically retrains on new content
4. Changes live within 5-10 minutes

**Best practice:** Refresh after major website updates

### Manual Training

Teach AI specific responses:

**Dashboard → Customer Support → Training → Custom Responses**

**Add custom Q&A:**
```
Question: "Do you offer enterprise plans?"

Response: "Yes! For teams needing advanced features and dedicated support,
we offer custom enterprise plans. Contact sales@yourcompany.com or schedule
a call: [Calendar Link]"
```

AI will recognize similar questions and provide your custom response.

### Feedback Loop

Improve AI from user feedback:

**When user rates response as "Not helpful":**

1. You receive notification
2. Review the conversation
3. Provide correct answer:
   ```
   Question: "Can I use Carla with Vue.js?"
   AI said: "Yes, Carla works with all frameworks"
   User rated: 👎 Not helpful

   Correct answer: "Carla is designed specifically for Next.js and
   is not currently compatible with Vue.js."
   ```

4. AI learns from correction
5. Future similar questions get correct answer

### A/B Testing Responses

Test different response styles:

**Test:** Formal vs Casual tone

**Variant A (Formal):**
```
"Thank you for your inquiry. Our premium tier costs $19.99 per month
and includes AI-powered Auto-Fix and Customer Support features."
```

**Variant B (Casual):**
```
"Great question! 😊 Premium is $19.99/month and gets you Auto-Fix
(AI creates PRs to fix bugs) plus this AI chat widget."
```

**Dashboard shows:**
- Which variant gets better satisfaction scores
- Conversion rate by variant
- User engagement by variant

## Integration

### Email Notifications

Get notified of important chat events:

**Dashboard → Customer Support → Notifications**

**Notify me when:**
- ☑ User rates conversation poorly (< 3 stars)
- ☑ User requests human support
- ☑ AI confidence is low (< 60%)
- ☑ User asks about pricing/sales
- □ Every conversation (not recommended)

**Send to:**
- support@yourcompany.com
- sales@yourcompany.com
- Custom email addresses

### CRM Integration

Connect with your CRM:

**Supported integrations:**
- Salesforce
- HubSpot
- Intercom
- Zendesk
- Custom webhook

**What syncs:**
- Conversation transcripts
- User contact information (if provided)
- Satisfaction ratings
- Conversation tags/categories

**Example: HubSpot**
```
Conversation with lead who asked about pricing
→ Creates HubSpot contact
→ Adds note with transcript
→ Tags as "interested in premium"
→ Triggers sales follow-up sequence
```

### Live Chat Handoff

Integrate with live chat platforms:

When AI escalates to human:

1. Conversation transcript sent to your live chat tool
2. Human agent sees full context
3. Agent takes over conversation
4. User continues in same chat window

**Supported platforms:**
- Intercom
- Zendesk Chat
- Drift
- LiveChat
- Custom integration

## Troubleshooting

### Widget Not Appearing

**Check:**
1. ✅ Premium subscription active
2. ✅ Customer Support enabled in dashboard
3. ✅ Carla widget installed (`npx @interworky/carla-nextjs install`)
4. ✅ `NEXT_PUBLIC_CARLA_API_KEY` in `.env.local`
5. ✅ Dev server restarted after widget installation
6. ✅ Browser console shows no errors

### AI Giving Wrong Answers

**Solutions:**
1. **Refresh training data:**
   - Dashboard → Customer Support → Training → Refresh
   - Re-scrape website for updated content

2. **Add custom responses:**
   - Dashboard → Training → Custom Responses
   - Manually add correct Q&A pairs

3. **Upload more content:**
   - Provide PDFs, docs with detailed information
   - More content = better AI accuracy

4. **Report bad responses:**
   - Forward conversation ID to support@interworky.com
   - We'll investigate and improve AI

### Slow Response Times

**Usual response time:** 1-3 seconds

**If slower (> 5 seconds):**
1. Check your website/API server performance
2. Verify Carla's status: [status.interworky.com](https://status.interworky.com)
3. Try different browser/device
4. Contact support if persistent

### Widget Conflicts with Other Widgets

If multiple widgets on your site conflict:

**Option 1: Adjust z-index**
```css
/* In your global CSS */
.carla-widget {
  z-index: 9999 !important;
}
```

**Option 2: Reposition widget**
- Dashboard → Appearance → Position
- Move to different corner

**Option 3: Disable other widgets**
- Consider consolidating to just Carla

## Best Practices

### 1. Keep Content Updated

- Refresh training data monthly
- Update after major product changes
- Remove outdated information
- Add new product documentation

### 2. Monitor Conversations Regularly

- Review weekly conversation summaries
- Identify common questions
- Look for gaps in AI knowledge
- Train AI on new patterns

### 3. Respond to Low Ratings

When users rate conversations poorly:
1. Read the transcript
2. Understand what went wrong
3. Add custom response if needed
4. Update training content

### 4. Use Conversation Starters

Guide users to ask better questions:
```
"I can help you with:
- 📦 Product features
- 💰 Pricing and plans
- 🚀 Getting started
- 💬 Technical support"
```

### 5. Don't Over-Automate

Balance AI and human support:
- Use AI for common questions
- Escalate complex issues to humans
- Always offer human option
- Monitor escalation rates

**Good balance:**
- 70-80% resolved by AI
- 20-30% escalated to human

## Frequently Asked Questions

### How does AI learn about my business?

AI learns from:
1. **Website scraping** - Automatic crawling of public pages
2. **Document uploads** - PDFs, markdown, text files you provide
3. **Custom Q&A** - Manual question/answer pairs you add
4. **Conversation feedback** - Learning from user ratings

### Can the widget speak multiple languages?

**Yes!** Widget automatically:
- Detects user's browser language
- Responds in that language
- Translates your content if needed

**Supported languages:** 50+ including English, Spanish, French, German, Chinese, Japanese, etc.

### Does the widget work on mobile?

**Yes, fully responsive:**
- Adapts to screen size
- Touch-friendly interface
- Mobile-optimized layout
- Works on all modern mobile browsers

### Can I hide the widget on certain pages?

**Yes:**

```tsx
// In specific page component
import { useEffect } from 'react'

export default function CheckoutPage() {
  useEffect(() => {
    // Hide widget on this page
    if (window.Carla) {
      window.Carla.hideWidget()
    }

    // Show again when leaving page
    return () => {
      if (window.Carla) {
        window.Carla.showWidget()
      }
    }
  }, [])

  return <div>Checkout page content</div>
}
```

Or configure in dashboard:
- Dashboard → Appearance → Page Rules
- Add pages to hide widget: `/checkout`, `/admin/*`

### How is user data handled?

- **Anonymous by default** - No personal data collected unless user provides it
- **GDPR compliant** - Respects privacy regulations
- **Opt-out available** - Users can delete their conversation data
- **Encrypted** - All conversations encrypted in transit and at rest

### Can I see who I'm chatting with?

**Limited identification:**
- Anonymous ID (e.g., `user_12345`)
- Browser/device info
- Pages visited
- Geographic location (city level)

**If user provides:**
- Name (if they tell AI)
- Email (if they share)
- Account info (if they log in)

### What if AI can't answer a question?

AI will:
1. Admit it doesn't know
2. Offer to escalate to human support
3. Suggest related resources
4. Ask clarifying questions

**Example:**
```
User: What's your data retention policy for GDPR?

AI: I don't have specific details about our GDPR data retention policy
in my current training data. This is important information, so I'd recommend:

1. Contacting our legal team: legal@yourcompany.com
2. Checking our privacy policy: [link]
3. Scheduling a call with our compliance team: [calendar link]

Would you like me to have someone from our team reach out to you?
```

## Pricing

Customer Support Widget is included in premium:

| | Free Tier | Premium Tier |
|---|---|---|
| **Price** | FREE | **$19.99/month** |
| **Trial** | N/A | ✅ 7 days free |
| **AI Customer Support** | ❌ | ✅ Unlimited conversations |
| **Voice Chat** | ❌ | ✅ Included |
| **Custom Training** | ❌ | ✅ Unlimited uploads |
| **Conversation History** | N/A | ✅ Unlimited retention |

**[View full pricing comparison →](/guide/pricing)**

## Next Steps

- **[Auto-Fix Guide](/guide/auto-fix)** - AI-powered error fixing
- **[Analytics](/guide/analytics)** - Track widget performance
- **[Configuration](/guide/configuration)** - Advanced customization
- **[Pricing](/guide/pricing)** - Full pricing details

## Need Help?

- 📧 Email: [support@interworky.com](mailto:support@interworky.com)
- 💬 Discord: [Join our community](https://discord.com/invite/YHmsekzMV5)
- 📖 Docs: [Full documentation](https://carla.interworky.com)
