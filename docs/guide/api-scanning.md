# API Route Scanning

Learn how Carla Next.js automatically discovers and analyzes your Next.js API routes using TypeScript AST parsing.

## What is API Route Scanning?

API route scanning is the first step in the tool generation pipeline. The scanner:

- **Discovers** all API route files in your Next.js project
- **Analyzes** the code structure using TypeScript's Abstract Syntax Tree (AST)
- **Extracts** metadata about endpoints, parameters, and authentication
- **Detects** both App Router and Pages Router patterns

## Quick Start

Scan your project with a single command:

```bash
npx @interworky/carla-nextjs scan
```

This will:
1. Find all API route files
2. Parse and analyze each file
3. Generate tool definitions
4. Save results to `.carla/tools.json`

## Supported Route Patterns

The scanner automatically detects routes in these locations:

### App Router (Next.js 13+)

```
app/api/**/route.{ts,js,tsx,jsx}
src/app/api/**/route.{ts,js,tsx,jsx}
```

**Examples:**
```
app/api/users/route.ts
app/api/products/[id]/route.ts
app/api/organizations/[orgId]/members/route.ts
```

### Pages Router (Next.js 12 and earlier)

```
pages/api/**/*.{ts,js,tsx,jsx}
src/pages/api/**/*.{ts,js,tsx,jsx}
```

**Examples:**
```
pages/api/users.ts
pages/api/products/[id].ts
pages/api/auth/[...nextauth].ts
```

::: tip
The scanner works with both TypeScript and JavaScript files, but TypeScript provides better type inference.
:::

## How Scanning Works

### 1. File Discovery

The scanner uses glob patterns to find all API route files:

```typescript
const patterns = [
  'app/api/**/route.{ts,js,tsx,jsx}',
  'src/app/api/**/route.{ts,js,tsx,jsx}',
  'pages/api/**/*.{ts,js,tsx,jsx}',
  'src/pages/api/**/*.{ts,js,tsx,jsx}',
]

for (const pattern of patterns) {
  const files = await glob(pattern, { cwd: projectRoot })
  // Process each file...
}
```

### 2. TypeScript AST Parsing

Each file is parsed into an Abstract Syntax Tree:

```typescript
import * as ts from 'typescript'

const source = fs.readFileSync(filePath, 'utf-8')
const sourceFile = ts.createSourceFile(
  filePath,
  source,
  ts.ScriptTarget.Latest,
  true
)
```

### 3. Method Extraction

The scanner looks for exported HTTP method functions:

```typescript
// These functions are detected
export async function GET(request: Request) { }
export async function POST(request: Request) { }
export async function PUT(request: Request) { }
export async function DELETE(request: Request) { }
export async function PATCH(request: Request) { }
```

### 4. Metadata Extraction

For each method, the scanner extracts:
- **Endpoint path** (from file structure)
- **Path parameters** (from `[param]` segments)
- **Body parameters** (from `request.json()` calls)
- **Authentication** (from common auth patterns)

## Route Information Structure

The scanner produces a `RouteInfo` object for each file:

```typescript
interface RouteInfo {
  filePath: string        // Absolute path to file
  relativePath: string    // Path relative to project root
  methods: MethodInfo[]   // Detected HTTP methods
}

interface MethodInfo {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  endpoint: string        // API endpoint (e.g., "/api/users/:id")
  params: ParamInfo[]     // Path parameters
  bodyParams: ParamInfo[] // Request body parameters
  hasAuth: boolean        // Whether auth was detected
}

interface ParamInfo {
  name: string            // Parameter name
  type: string            // TypeScript type
  required: boolean       // Whether parameter is required
  description?: string    // Auto-generated description
}
```

## Endpoint Path Conversion

The scanner converts file paths to API endpoints:

### App Router Examples

| File Path | Converted Endpoint |
|-----------|-------------------|
| `app/api/users/route.ts` | `/api/users` |
| `app/api/users/[id]/route.ts` | `/api/users/:id` |
| `app/api/posts/[postId]/comments/route.ts` | `/api/posts/:postId/comments` |
| `src/app/api/products/route.ts` | `/api/products` |

### Pages Router Examples

| File Path | Converted Endpoint |
|-----------|-------------------|
| `pages/api/users.ts` | `/api/users` |
| `pages/api/users/[id].ts` | `/api/users/:id` |
| `pages/api/orders/index.ts` | `/api/orders` |

### Conversion Logic

```typescript
function pathToEndpoint(relativePath: string): string {
  let endpoint = relativePath
    .replace(/\.(ts|js|tsx|jsx)$/, '')  // Remove extension
    .replace(/\/route$/, '')             // Remove "route" filename
    .replace(/\/index$/, '')             // Remove "index" filename

  // Remove app/api or pages/api prefix
  endpoint = endpoint
    .replace(/^(src\/)?app\/api\//, '/')
    .replace(/^(src\/)?pages\/api\//, '/')

  // Convert [param] to :param
  endpoint = endpoint.replace(/\[([^\]]+)\]/g, ':$1')

  // Ensure it starts with /api
  if (!endpoint.startsWith('/api')) {
    endpoint = '/api' + endpoint
  }

  return endpoint || '/api'
}
```

## Parameter Detection

### Path Parameters

Path parameters are extracted from the file structure:

```typescript
// File: app/api/products/[productId]/reviews/[reviewId]/route.ts
// Detected params: productId, reviewId
```

```json
{
  "params": [
    {
      "name": "productId",
      "type": "string",
      "required": true,
      "description": "The productId parameter"
    },
    {
      "name": "reviewId",
      "type": "string",
      "required": true,
      "description": "The reviewId parameter"
    }
  ]
}
```

### Body Parameters

The scanner analyzes code to detect request body parameters:

**Pattern 1: Direct destructuring with types**
```typescript
export async function POST(request: Request) {
  const { name, email }: { name: string; email: string } =
    await request.json()
}
```

**Pattern 2: Variable assignment**
```typescript
export async function POST(request: Request) {
  const body = await request.json()
  const { title, content } = body
}
```

**Pattern 3: Type interfaces**
```typescript
interface CreateUserRequest {
  name: string
  email: string
  age?: number
}

export async function POST(request: Request) {
  const data: CreateUserRequest = await request.json()
}
```

::: tip
For best results, use inline type annotations with destructuring. This provides the clearest signal to the scanner.
:::

## Authentication Detection

The scanner looks for common authentication patterns in the code:

### NextAuth.js

```typescript
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }
  // ...
}
```

### Custom JWT Verification

```typescript
export async function POST(request: Request) {
  const token = request.headers.get('Authorization')
  const verified = await verifyToken(token)
  if (!verified) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }
  // ...
}
```

### Middleware Authentication

```typescript
export async function DELETE(request: Request) {
  await requireAuth(request)
  // ...
}
```

### Detected Patterns

The scanner recognizes these auth-related keywords:

- `getServerSession`
- `auth()`
- `authenticate`
- `verifyToken`
- `checkAuth`
- `requireAuth`
- `Authorization` (header)
- `Bearer` (token)

When any of these are found, `hasAuth: true` is set on the method.

## Scan Command Options

### Force Rescan

By default, scanning is skipped if tools already exist:

```bash
# Force a fresh scan
npx @interworky/carla-nextjs scan --force
```

### Custom Path

Scan a specific directory:

```bash
npx @interworky/carla-nextjs scan --path ./src/app/api
```

### Output Format

Get JSON output for programmatic use:

```bash
npx @interworky/carla-nextjs scan --format json
```

**Output:**
```json
{
  "success": true,
  "filesScanned": 12,
  "toolsGenerated": 18,
  "toolsEnabled": 17,
  "toolsDisabled": 1,
  "tools": [...],
  "recommendations": [...]
}
```

## Examples

### Example 1: Simple GET Route

**File:** `app/api/products/route.ts`

```typescript
export async function GET() {
  const products = await db.products.findMany()
  return Response.json(products)
}
```

**Scanned info:**
```json
{
  "filePath": "/project/app/api/products/route.ts",
  "relativePath": "app/api/products/route.ts",
  "methods": [
    {
      "method": "GET",
      "endpoint": "/api/products",
      "params": [],
      "bodyParams": [],
      "hasAuth": false
    }
  ]
}
```

### Example 2: Dynamic Route with Auth

**File:** `app/api/users/[userId]/route.ts`

```typescript
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await db.users.findUnique({
    where: { id: params.userId }
  })

  return Response.json(user)
}

export async function DELETE(
  request: Request,
  { params }: { params: { userId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  await db.users.delete({
    where: { id: params.userId }
  })

  return Response.json({ success: true })
}
```

**Scanned info:**
```json
{
  "filePath": "/project/app/api/users/[userId]/route.ts",
  "relativePath": "app/api/users/[userId]/route.ts",
  "methods": [
    {
      "method": "GET",
      "endpoint": "/api/users/:userId",
      "params": [
        {
          "name": "userId",
          "type": "string",
          "required": true,
          "description": "The userId parameter"
        }
      ],
      "bodyParams": [],
      "hasAuth": true
    },
    {
      "method": "DELETE",
      "endpoint": "/api/users/:userId",
      "params": [
        {
          "name": "userId",
          "type": "string",
          "required": true,
          "description": "The userId parameter"
        }
      ],
      "bodyParams": [],
      "hasAuth": true
    }
  ]
}
```

### Example 3: POST with Body Parameters

**File:** `app/api/orders/route.ts`

```typescript
export async function POST(request: Request) {
  const {
    customerId,
    items,
    shippingAddress
  }: {
    customerId: string
    items: Array<{ productId: string; quantity: number }>
    shippingAddress: string
  } = await request.json()

  const order = await db.orders.create({
    data: {
      customerId,
      items,
      shippingAddress,
      status: 'pending'
    }
  })

  return Response.json(order, { status: 201 })
}
```

**Scanned info:**
```json
{
  "filePath": "/project/app/api/orders/route.ts",
  "relativePath": "app/api/orders/route.ts",
  "methods": [
    {
      "method": "POST",
      "endpoint": "/api/orders",
      "params": [],
      "bodyParams": [
        {
          "name": "customerId",
          "type": "string",
          "required": true,
          "description": "The customerId field"
        },
        {
          "name": "items",
          "type": "array",
          "required": true,
          "description": "The items field"
        },
        {
          "name": "shippingAddress",
          "type": "string",
          "required": true,
          "description": "The shippingAddress field"
        }
      ],
      "hasAuth": false
    }
  ]
}
```

## TypeScript AST Deep Dive

### AST Node Types

The scanner looks for specific TypeScript node types:

```typescript
// Function declarations
ts.isFunctionDeclaration(node)

// Await expressions (for request.json())
ts.isAwaitExpression(node)

// Call expressions (for function calls)
ts.isCallExpression(node)

// Variable declarations (for const/let/var)
ts.isVariableDeclaration(node)
```

### Walking the AST

The scanner recursively traverses the syntax tree:

```typescript
function visit(node: ts.Node) {
  // Check if this is an HTTP method function
  if (ts.isFunctionDeclaration(node) && node.name) {
    const methodName = node.name.text
    if (['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].includes(methodName)) {
      // Extract method information
      extractMethodInfo(node)
    }
  }

  // Continue traversing child nodes
  ts.forEachChild(node, visit)
}

visit(sourceFile)
```

### Example AST Analysis

**Source code:**
```typescript
export async function GET(request: Request) {
  const data = await request.json()
  return Response.json(data)
}
```

**AST structure:**
```
SourceFile
└── FunctionDeclaration (name: "GET")
    ├── Modifier (export)
    ├── Modifier (async)
    ├── Parameter (name: "request", type: Request)
    └── Block
        ├── VariableDeclaration (name: "data")
        │   └── AwaitExpression
        │       └── CallExpression (request.json)
        └── ReturnStatement
            └── CallExpression (Response.json)
```

## Best Practices

### 1. Use Consistent File Structure

```typescript
// ✅ Good - Clear structure
app/api/users/route.ts
app/api/users/[id]/route.ts
app/api/products/route.ts
app/api/products/[id]/route.ts

// ❌ Confusing - Mixed patterns
app/api/getUsers.ts
app/api/user-details/[id].ts
```

### 2. Add Type Annotations

```typescript
// ✅ Good - Scanner can detect parameters
const { name, email }: { name: string; email: string } =
  await request.json()

// ❌ Limited - Scanner may miss parameters
const body = await request.json()
const name = body.name
```

### 3. Use Standard HTTP Methods

```typescript
// ✅ Good - Standard methods
export async function GET() { }
export async function POST() { }

// ❌ Won't be detected
export async function getUsers() { }
export async function fetchData() { }
```

### 4. Keep Auth Patterns Visible

```typescript
// ✅ Good - Auth is in the same function
export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })
  // ...
}

// ❌ May not be detected
async function checkAuth(request: Request) { }

export async function POST(request: Request) {
  checkAuth(request) // Auth in separate function
  // ...
}
```

### 5. Avoid Dynamic Routes

```typescript
// ✅ Good - Static, scannable
app/api/users/[id]/route.ts

// ❌ Can't be scanned
app/api/[...catch-all]/route.ts
app/api/[[...optional]]/route.ts
```

## Troubleshooting

### No Routes Found

**Problem:** Scanner reports 0 API routes found

**Solutions:**
1. Check your route files are in the correct location:
   ```
   app/api/  or  pages/api/
   ```

2. Verify file naming:
   - App Router: Files must be named `route.ts/js`
   - Pages Router: Any `.ts/.js` filename works

3. Check for TypeScript/JavaScript syntax errors

4. Run from project root directory

### Parameters Not Detected

**Problem:** Body parameters aren't showing up in scanned results

**Solutions:**
1. Add explicit type annotations:
   ```typescript
   const { name }: { name: string } = await request.json()
   ```

2. Use destructuring directly in the await statement

3. Check for typos in `request.json()` call

### Auth Not Detected

**Problem:** Authentication is implemented but `hasAuth: false`

**Solutions:**
1. Use recognized auth patterns (see [Authentication Detection](#authentication-detection))

2. Ensure auth code is in the route handler function, not imported functions

3. Manually add `auth: "required"` to tools.json after scanning

### Multiple HTTP Methods

**Problem:** Only one method detected when multiple exist

**Solutions:**
1. Ensure each method is a separate exported function:
   ```typescript
   export async function GET() { }
   export async function POST() { }
   export async function DELETE() { }
   ```

2. Don't use conditional logic to handle multiple methods:
   ```typescript
   // ❌ Won't work
   export async function handler(request: Request) {
     if (request.method === 'GET') { }
     if (request.method === 'POST') { }
   }
   ```

## Performance

### Scan Speed

Typical scan times:
- **Small project** (< 10 routes): < 1 second
- **Medium project** (10-50 routes): 1-3 seconds
- **Large project** (50+ routes): 3-10 seconds

### Optimizations

The scanner is optimized for performance:

1. **Concurrent file reading** - Files are read in parallel
2. **AST caching** - TypeScript compiler results are cached
3. **Early termination** - Stops analyzing when all methods are found
4. **Smart pattern matching** - Only scans relevant directories

## Next Steps

Now that you understand API scanning:

- **[Tool Generation](/guide/tool-generation)** - Learn how tools are generated from scanned routes
- **[CLI Reference](/reference/cli)** - Full command documentation
- **[Configuration](/guide/configuration)** - Customize scanning behavior
- **[Troubleshooting](/guide/troubleshooting)** - Common issues and solutions
