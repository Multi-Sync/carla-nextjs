# Installation

Detailed installation instructions for Carla Next.js.

## System Requirements

- **Node.js** 18.0.0 or higher
- **Next.js** 14.0.0 or higher
- **React** 18.0.0 or higher

## Package Manager Support

Carla Next.js works with all major package managers:

- npm
- yarn
- pnpm
- bun

## Installation Methods

### Using npx (Recommended)

No installation required - run directly:

```bash
npx @interworky/carla-nextjs install
```

### Install as Dev Dependency

For repeated use in your project:

```bash
npm install -D @interworky/carla-nextjs
```

Then use via npm scripts or directly:

```bash
npm run carla-nextjs scan
# or
npx carla-nextjs scan
```

### Global Installation

Not recommended, but possible:

```bash
npm install -g @interworky/carla-nextjs
```

## Project Types

### App Router (Next.js 13+)

Carla Next.js automatically detects App Router:

```
app/
├── api/           # Your API routes
├── layout.tsx     # Widget added here
└── page.tsx
```

### Pages Router (Next.js 12-)

Also fully supported:

```
pages/
├── api/           # Your API routes
├── _app.tsx       # Widget added here
└── index.tsx
```

## TypeScript vs JavaScript

Both are fully supported:

- **TypeScript** - Better type inference, more accurate tool generation
- **JavaScript** - Works fine, uses JSDoc for types

## Monorepo Support

Works in monorepo setups:

```bash
# Run from specific package
cd packages/web
npx @interworky/carla-nextjs install
```

## Verification

Verify installation:

```bash
npx @interworky/carla-nextjs --version
```

## Next Steps

Continue to [Getting Started](/guide/getting-started) to set up Carla.
