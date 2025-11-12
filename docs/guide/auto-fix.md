# AI-Powered Auto-Fix

**Premium Feature** - Requires active subscription ($19.99/month) or 7-day free trial

Auto-Fix is Carla's AI-powered feature that automatically detects errors in your Next.js application and creates GitHub pull requests with suggested fixes. Let AI handle the tedious debugging work while you focus on building features.

## Overview

Auto-Fix provides:

- 🤖 **AI-Powered Error Analysis** - Advanced AI analyzes stack traces and codebase context
- 🔧 **Automatic Fix Generation** - AI generates code fixes addressing root causes
- 🔀 **GitHub PR Creation** - Automatic pull request creation with detailed explanations
- 🔍 **Error Detection** - Real-time monitoring of errors across your application
- 📊 **Fix Success Tracking** - Analytics on fix success rates and patterns
- ⚙️ **Customizable Rules** - Configure which errors trigger Auto-Fix

## Requirements

### Subscription

- ✅ **Active premium subscription** ($19.99/month) OR
- ✅ **Active 7-day free trial**

[Start your free trial →](https://interworky.com/checkout?feature=auto_fix)

### Technical Requirements

- **GitHub account** with repository access
- **Next.js 14+** application
- **Git repository** hosted on GitHub
- **Repository permissions** (read/write access)

## Getting Started

### Step 1: Start Your Trial or Subscribe

If you're on the free tier, you'll need to upgrade:

1. Go to **Dashboard → Settings → Billing**
2. Click **"Start 7-Day Free Trial"**
3. Enter credit card information (required, **free for 7 days**)
4. Complete checkout

**Trial details:**

- Free for first 7 days
- $19.99/month after trial
- Cancel anytime during trial at no charge
- Auto-Fix enabled immediately

### Step 2: Connect GitHub

#### 2.1. Navigate to GitHub Integration

1. Go to **Dashboard → Integrations** or **Dashboard → Home**
2. Find the **GitHub Integration** card
3. Click **"Connect GitHub"**

#### 2.2. Authorize Carla

You'll be redirected to GitHub:

1. Review permissions requested:
   - ✅ Read repository contents
   - ✅ Create branches
   - ✅ Create pull requests
   - ✅ Read commit history
2. Click **"Authorize Interworky"**
3. Select repositories to grant access (or all repositories)

::: tip Repository Access
You can limit Carla to specific repositories for security. You can always add more repositories later from your GitHub settings.
:::

#### 2.3. Select Repository

Back in the Carla dashboard:

1. Select your Next.js project repository from dropdown
2. Choose default branch (usually `main` or `master`)
3. Click **"Connect Repository"**

### Step 3: Enable Auto-Fix

1. Go to **Dashboard → Home**
2. Find the **Auto-Fix** module
3. Click **"Enable Auto-Fix"**
4. Configure settings (see Configuration section below)

::: warning Important
Auto-Fix will only create PRs for errors that occur **after** it's enabled. Historical errors won't trigger automatic fixes.
:::

## How Auto-Fix Works

### 1. Error Detection

When an error occurs in your application:

```
Frontend Error Detected:
  Type: TypeError
  Message: Cannot read property 'name' of undefined
  File: components/UserProfile.tsx
  Line: 42
  Stack Trace: [full stack trace]
  User Agent: Chrome 119 on macOS
  Timestamp: 2025-11-10 14:32:15
```

### 2. AI Analysis

Carla's AI analyzes the error:

- **Reads the stack trace** to understand error context
- **Examines the source code** around the error location
- **Reviews related files** that might be involved
- **Identifies the root cause** (null reference, type mismatch, logic error, etc.)
- **Generates a fix** that addresses the underlying issue

**AI Analysis Example:**

```
Analysis:
  Root Cause: Accessing property 'name' on potentially undefined user object

  Context: The user prop may be undefined when component first renders
  before data fetching completes.

  Recommended Fix: Add null check before accessing user.name

  Confidence: 92%
```

### 3. Fix Generation

AI generates the code fix:

**Before (Broken Code):**

```tsx
// components/UserProfile.tsx
export default function UserProfile({ user }) {
  return (
    <div className="profile">
      <h1>{user.name}</h1> {/* Error here: user might be undefined */}
      <p>{user.email}</p>
    </div>
  );
}
```

**After (AI-Generated Fix):**

```tsx
// components/UserProfile.tsx
export default function UserProfile({ user }) {
  // Early return if user is undefined
  if (!user) {
    return <div className="profile">Loading...</div>;
  }

  return (
    <div className="profile">
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}
```

### 4. Branch Creation

Carla automatically:

1. Creates a new branch: `carla/fix-user-profile-undefined-error`
2. Applies the fix to the problematic file(s)
3. Commits the changes with a descriptive message

**Commit message example:**

```
Fix: Add null check for user prop in UserProfile component

- Added guard clause to check if user is defined before rendering
- Returns loading state while user data is being fetched
- Prevents TypeError when accessing undefined user properties

Fixes error: "Cannot read property 'name' of undefined"
Location: components/UserProfile.tsx:42

🤖 Generated by Carla Auto-Fix
```

### 5. Pull Request Creation

A pull request is automatically created:

#### PR Title

```
🤖 Auto-Fix: Handle undefined user in UserProfile component
```

#### PR Description

```markdown
## Error Fixed

**Type:** TypeError
**Message:** Cannot read property 'name' of undefined
**File:** components/UserProfile.tsx:42
**First Seen:** Nov 10, 2025 at 2:32 PM
**Occurrences:** 15 times in the last hour

## Root Cause Analysis

The `UserProfile` component was attempting to access properties on the `user` object
without first checking if it exists. This occurs when the component renders before
data fetching completes, resulting in `user` being `undefined`.

## Changes Made

- ✅ Added null check for `user` prop before accessing properties
- ✅ Added loading state for better user experience
- ✅ Prevents future TypeError occurrences

## Testing Recommendations

- [ ] Verify component displays loading state correctly
- [ ] Confirm component renders properly once user data loads
- [ ] Test with slow network to ensure loading state appears
- [ ] Check that error no longer occurs in production

## AI Confidence

Confidence: 92% - High confidence this fix addresses the root cause

---

🤖 This PR was automatically generated by [Carla Auto-Fix](https://carla.interworky.com).
Review the changes and merge if they look correct, or request modifications.
```

### 6. Notification

You're notified about the PR:

- **Dashboard notification:** "Auto-Fix created PR #42"
- **Email notification:** "Auto-Fix created a pull request for UserProfile error"
- **GitHub notification:** Standard PR notification from GitHub

### 7. Review & Merge

You review the PR like any other:

1. **Review the code changes**
2. **Run tests** (if you have CI/CD setup)
3. **Request changes** if the fix isn't quite right
4. **Merge the PR** if everything looks good

::: tip AI Learning
When you merge an Auto-Fix PR, Carla learns from it. When you request changes or close a PR, Carla learns what not to do. This improves fix quality over time.
:::

## Configuration

### Error Types to Auto-Fix

Configure which error types trigger Auto-Fix:

**Dashboard → Home → Auto-Fix → Configure**

- ✅ **TypeError** - Undefined properties, null references (Recommended)
- ✅ **ReferenceError** - Undefined variables, missing imports (Recommended)
- ⚠️ **Logic Errors** - Business logic issues (Use with caution)
- ❌ **Syntax Errors** - Parse errors, invalid code (Usually caught in dev)
- ❌ **Network Errors** - API failures, timeouts (Not code issues)

::: warning Logic Errors
Logic errors are more subjective. AI may not understand your business requirements. Review these PRs carefully.
:::

### Frequency Threshold

Set minimum error occurrences before Auto-Fix triggers:

```
Trigger Auto-Fix when error occurs:
  ○ First occurrence (most aggressive)
  ○ 3+ times in 1 hour
  ● 5+ times in 1 hour (recommended)
  ○ 10+ times in 1 hour
  ○ Custom threshold
```

**Why threshold?:** Prevents creating PRs for one-off errors that might not be reproducible.

### Files to Include/Exclude

Configure which files Auto-Fix should modify:

**Include patterns:**

```
src/**/*.{ts,tsx,js,jsx}
components/**/*.{ts,tsx}
pages/**/*.{ts,tsx}
app/**/*.{ts,tsx}
```

**Exclude patterns:**

```
node_modules/**
.next/**
dist/**
build/**
*.test.{ts,tsx,js,jsx}
*.spec.{ts,tsx,js,jsx}
```

::: tip Best Practice
Exclude test files from Auto-Fix. Tests should be manually updated to reflect the new implementation.
:::

### PR Settings

Customize pull request behavior:

**Auto-merge:** ⚠️ Not recommended

- Automatically merge PRs that pass CI checks
- High risk - only enable if you have comprehensive test coverage

**Draft PRs:** ✅ Recommended

- Create PRs as drafts for review before marking ready
- Safer option for production repositories

**PR Labels:**

- `auto-fix` (automatically added)
- `bug` (automatically added)
- Custom labels (optional)

**Reviewers:**

- Automatically request reviews from specified team members
- Useful for requiring human approval before merge

## Error Dashboard

View all errors and Auto-Fix activity:

### Dashboard → Auto-Fix

#### Recent Auto-Fixes

| Error                       | Status    | PR  | Created | Merged |
| --------------------------- | --------- | --- | ------- | ------ |
| TypeError in UserProfile    | ✅ Merged | #42 | 2h ago  | 1h ago |
| ReferenceError in Dashboard | 🔄 Open   | #43 | 1h ago  | -      |
| Logic error in checkout     | ❌ Closed | #44 | 3h ago  | -      |

#### Auto-Fix Statistics

```
This Month:
  🤖 PRs Created: 28
  ✅ PRs Merged: 24 (86% success rate)
  🔄 PRs Pending: 3
  ❌ PRs Rejected: 1

Time Saved: ~14 hours (30min avg per fix)
Errors Fixed: 24 unique issues
```

#### Top Fixed Errors

1. **TypeError: undefined properties** - 8 fixes
2. **ReferenceError: undefined variables** - 6 fixes
3. **Logic errors in forms** - 4 fixes
4. **Missing null checks** - 3 fixes
5. **Incorrect type usage** - 3 fixes

## Advanced Features

### Multi-File Fixes

Some errors require changes across multiple files. Auto-Fix handles this:

**Example:** Import missing component

**Files changed:**

1. `components/Dashboard.tsx` - Import statement added
2. `components/index.ts` - Export added
3. `types/dashboard.ts` - Type definition updated

**Single PR** contains all necessary changes.

### Integration Updates

Auto-Fix can update package dependencies when needed:

**Example:** Outdated library causing errors

**Changes:**

1. `package.json` - Update dependency version
2. `package-lock.json` - Lock file updated
3. `components/Chart.tsx` - Update import/usage to match new API

### Regression Detection

Auto-Fix tracks if a fix introduces new errors:

**Scenario:**

1. Auto-Fix creates PR #42 to fix TypeError
2. PR #42 is merged
3. New ReferenceError appears in the same component

**Action:**

- Dashboard shows warning: "PR #42 may have introduced new error"
- Auto-Fix creates PR #43 to address the new issue
- You're notified to review both PRs

## Best Practices

### 1. Start with Strict Settings

Begin conservatively:

- Higher error occurrence threshold (5+)
- Limit to TypeError and ReferenceError only
- Use draft PRs
- Require manual review

**Reason:** Build confidence in Auto-Fix before loosening restrictions.

### 2. Monitor PR Quality

Regularly review Auto-Fix PRs:

- Are fixes correct?
- Do they address root causes?
- Are there better solutions?

Provide feedback by:

- ✅ Merging good PRs quickly
- 💬 Commenting on PRs that need changes
- ❌ Closing incorrect PRs

### 3. Integrate with CI/CD

Ensure Auto-Fix PRs run through your CI pipeline:

```yaml
# .github/workflows/ci.yml
name: CI
on:
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm install
      - run: npm test
      - run: npm run build
```

**Auto-Fix PRs will fail CI** if the fix breaks tests or build. This is good!

### 4. Review Before Merging

Even with high AI confidence, always:

- Read the changes
- Understand what the fix does
- Consider edge cases
- Think about test coverage

**Never blindly merge** Auto-Fix PRs to production.

### 5. Use Draft PRs for Production

For production repositories:

1. Enable "Create as draft PRs"
2. Auto-Fix creates draft PR
3. CI runs automatically
4. You review and mark "Ready for review"
5. Team reviews and merges

**Extra safety layer** for critical applications.

## Troubleshooting

### Auto-Fix Not Creating PRs

**Check:**

1. ✅ Premium subscription is active (Dashboard → Settings → Billing)
2. ✅ Auto-Fix is enabled (Dashboard → Home → Auto-Fix)
3. ✅ GitHub is connected and authorized
4. ✅ Repository has correct permissions (write access)
5. ✅ Errors meet configured thresholds
6. ✅ Error type is included in Auto-Fix settings

### PRs Not Appearing in GitHub

**Possible causes:**

1. **Branch protection rules** preventing PR creation
   - **Fix:** Add Carla's GitHub app to bypass protections
2. **Repository permissions** insufficient
   - **Fix:** Re-authorize with write access
3. **Network/API issues**
   - **Fix:** Check dashboard for error messages

### Low Fix Quality

**If AI fixes aren't good:**

1. **Provide feedback:**
   - Comment on PRs explaining why fix isn't ideal
   - Close PRs that are incorrect

2. **Adjust error types:**
   - Disable logic errors if they're not working well
   - Focus on simpler error types (TypeError, ReferenceError)

3. **Increase occurrence threshold:**
   - Higher threshold = more context for AI to analyze

4. **Contact support:**
   - Email support@interworky.com with specific examples
   - We can adjust AI parameters for your account

### Merge Conflicts

If Auto-Fix PR has merge conflicts:

1. Locally pull the Auto-Fix branch
2. Merge main into the branch
3. Resolve conflicts manually
4. Push resolved branch
5. PR will update automatically

Or:

1. Close the Auto-Fix PR
2. Manually apply the fix
3. Auto-Fix won't create duplicate PR for same error

## Managing Your Subscription

### During Trial

Your 7-day trial includes full Auto-Fix access:

- Check days remaining: Dashboard shows trial banner
- Cancel anytime: Dashboard → Settings → Billing → "Cancel"
- No charges if you cancel before trial ends

### After Trial

**If you keep subscription:**

- $19.99/month charged automatically
- Auto-Fix remains active
- Cancel anytime (month-to-month)

**If you cancel:**

- Auto-Fix disabled immediately
- Existing PRs remain open
- Can re-subscribe anytime to re-enable

### Upgrading from Free Tier

Already on free tier? Upgrade to add Auto-Fix:

1. Dashboard → Settings → Billing
2. Click "Start 7-Day Free Trial"
3. Complete checkout
4. Connect GitHub
5. Enable Auto-Fix

## Frequently Asked Questions

### Does Auto-Fix work for server-side errors?

**Yes!** Auto-Fix works for both:

- Client-side errors (browser errors)
- Server-side errors (API route errors, server component errors)

### Can I disable Auto-Fix temporarily?

**Yes:**

1. Dashboard → Home → Auto-Fix
2. Click "Disable Auto-Fix"
3. Re-enable anytime

Useful when:

- Performing major refactoring
- Expecting temporary errors
- Testing new features

### What if I don't want Auto-Fix for a specific error?

**Option 1: Close the PR**

- Closing a PR tells AI not to create fixes for this specific error pattern

**Option 2: Add to ignore list**

- Dashboard → Auto-Fix → Settings → "Ignored Errors"
- Add error message or file pattern to ignore

### Does Auto-Fix modify my code directly?

**No.** Auto-Fix:

- ✅ Creates a separate branch
- ✅ Opens a pull request
- ❌ Never commits directly to main/master
- ❌ Never modifies your code without PR review

**You always have final control** over what gets merged.

### Can I use Auto-Fix with private repositories?

**Yes!** Auto-Fix works with:

- Public repositories
- Private repositories
- Organization repositories

Just ensure Carla has appropriate access permissions.

### How does AI understand my codebase?

Carla's AI:

1. Reads the error stack trace
2. Examines files mentioned in stack trace
3. Reviews nearby code for context
4. Analyzes import statements and dependencies
5. Understands Next.js patterns and conventions
6. Generates fix based on comprehensive understanding

**Note:** AI doesn't have access to:

- Private environment variables
- External databases
- Business requirements documents
- Your full codebase (only relevant files)

### What happens if two errors occur in the same file?

Auto-Fix creates separate PRs:

**Example:**

- Error 1: TypeError in UserProfile.tsx → PR #42
- Error 2: ReferenceError in UserProfile.tsx → PR #43

You can:

- Merge them separately
- Merge one, let Auto-Fix adjust the other
- Close both and fix manually

### Can I request specific types of fixes?

Currently, Auto-Fix is fully automatic based on detected errors. Manual fix requests are coming soon.

**Workaround:** Intentionally trigger an error you want fixed, and Auto-Fix will create a PR.

## Pricing

Auto-Fix is included in the premium tier:

|                         | Free Tier     | Premium Tier          |
| ----------------------- | ------------- | --------------------- |
| **Price**               | FREE          | **$19.99/month**      |
| **Trial**               | N/A           | ✅ 7 days free        |
| **Auto-Fix**            | ❌            | ✅ Unlimited          |
| **GitHub Integration**  | ⚠️ OAuth only | ✅ Full (OAuth + PRs) |
| **AI Customer Support** | ❌            | ✅ Included           |

**[View full pricing comparison →](/guide/pricing)**

## Next Steps

- **[Customer Support Widget](/guide/customer-support)** - Set up AI chat widget
- **[Performance Monitoring](/guide/performance-monitoring)** - Track app performance
- **[Pricing](/guide/pricing)** - Full pricing details

## Need Help?

- 📧 Email: [support@interworky.com](mailto:support@interworky.com)
- 💬 Discord: [Join our community](https://discord.com/invite/YHmsekzMV5)
- 📖 Docs: [Full documentation](https://carla.interworky.com)
