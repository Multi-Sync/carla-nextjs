# Troubleshooting

Common issues and their solutions.

## Widget Issues

### Widget Not Appearing

**Symptoms:** The Carla widget doesn't show up on your site.

**Solutions:**

1. **Check API key:**
   ```bash
   # Verify it's set
   echo $NEXT_PUBLIC_CARLA_API_KEY
   ```

2. **Restart dev server:**
   ```bash
   # Environment variables require restart
   npm run dev
   ```

3. **Check browser console:**
   - Look for script loading errors
   - Check network tab for failed requests

4. **Verify widget component:**
   - Check it's imported in your layout/`_app`
   - Ensure component is rendering (add console.log)

### Widget Loads But Doesn't Work

**Symptoms:** Widget appears but can't connect or respond.

**Solutions:**

1. **Verify API key is valid:**
   - Go to [interworky.com](https://interworky.com)
   - Check Integrations page
   - Generate new key if needed

2. **Check network connectivity:**
   - Open browser DevTools Network tab
   - Look for failed WebSocket connections
   - Check for CORS errors

3. **Clear browser cache:**
   ```bash
   # Hard refresh
   Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
   ```

## Scanning Issues

### No Routes Found

**Symptoms:** `scan` command finds 0 routes.

**Solutions:**

1. **Check API directory:**
   ```bash
   # Verify the path
   npx @interworky/carla-nextjs scan --path ./app/api
   ```

2. **Verify file structure:**
   ```
   app/api/
   └── route.ts  # ✓ Correct

   app/api/
   └── handler.ts  # ✗ Wrong - must be route.ts
   ```

3. **Check file exports:**
   ```typescript
   // ✓ Correct
   export async function GET() { }

   // ✗ Wrong
   const handler = async () => { }
   export default handler
   ```

### Incomplete Tool Definitions

**Symptoms:** Tools generated but missing parameters or types.

**Solutions:**

1. **Add TypeScript types:**
   ```typescript
   // Better type inference
   export async function POST(request: Request) {
     const body: { name: string; email: string } = await request.json()
     // ...
   }
   ```

2. **Run fix command:**
   ```bash
   npx @interworky/carla-nextjs fix
   ```

3. **Manual editing:**
   - Edit `.carla/tools.json`
   - Add missing descriptions and types
   - Run sync again

## Sync Issues

### Sync Fails

**Symptoms:** `sync` command fails with error.

**Solutions:**

1. **Check API key:**
   ```bash
   # Verify it's set correctly
   grep CARLA_API_KEY .env.local
   ```

2. **Check network:**
   ```bash
   # Test connectivity
   curl https://api.interworky.com/health
   ```

3. **Verbose output:**
   ```bash
   # See detailed error
   npx @interworky/carla-nextjs sync --verbose
   ```

4. **Check rate limits:**
   - Wait a few minutes
   - Try again

### Tools Not Updating

**Symptoms:** Changes don't appear in Interworky dashboard.

**Solutions:**

1. **Force rescan:**
   ```bash
   npx @interworky/carla-nextjs scan --force
   npx @interworky/carla-nextjs sync
   ```

2. **Check enabled status:**
   ```json
   {
     "name": "my_tool",
     "enabled": true  // Must be true
   }
   ```

3. **Clear cache:**
   ```bash
   rm -rf .carla/
   npx @interworky/carla-nextjs scan
   npx @interworky/carla-nextjs sync
   ```

## Build Issues

### TypeScript Errors

**Symptoms:** Build fails with type errors.

**Solutions:**

1. **Update types:**
   ```bash
   npm install -D @types/node@latest
   ```

2. **Check tsconfig.json:**
   ```json
   {
     "compilerOptions": {
       "moduleResolution": "bundler",
       "module": "ESNext"
     }
   }
   ```

3. **Ignore if needed:**
   ```typescript
   // @ts-ignore
   ```

### Build Size Too Large

**Symptoms:** Bundle size increased significantly.

**Solutions:**

1. **Check widget loading:**
   ```typescript
   // Widget should load async
   useEffect(() => {
     setTimeout(() => {
       // Load script
     }, 1500)
   }, [])
   ```

2. **Verify imports:**
   - Don't import Carla CLI in frontend
   - Keep widget component minimal

## Performance Issues

### Slow API Responses

**Symptoms:** Carla responses are slow.

**Solutions:**

1. **Check API performance:**
   ```typescript
   export async function GET() {
     const start = Date.now()
     const data = await getData()
     console.log(`Took ${Date.now() - start}ms`)
     return Response.json(data)
   }
   ```

2. **Add caching:**
   ```typescript
   export const revalidate = 60 // Cache for 60s
   ```

3. **Optimize queries:**
   - Add database indexes
   - Reduce data returned
   - Use pagination

### High Memory Usage

**Symptoms:** Node process uses too much memory.

**Solutions:**

1. **Limit scan scope:**
   ```bash
   # Only scan necessary routes
   npx @interworky/carla-nextjs scan --path ./app/api/public
   ```

2. **Clear old data:**
   ```bash
   rm -rf .carla/debug.json
   ```

## Common Errors

### `ENOENT: no such file or directory`

**Cause:** File or directory doesn't exist.

**Solution:**
```bash
# Make sure you're in the project root
pwd

# Check if package.json exists
ls package.json
```

### `Cannot find module`

**Cause:** Missing dependency.

**Solution:**
```bash
npm install
```

### `Invalid API key`

**Cause:** API key is wrong or expired.

**Solution:**
1. Go to [interworky.com](https://interworky.com)
2. Navigate to Integrations
3. Generate new API key
4. Update `.env.local`

### `Permission denied`

**Cause:** No write permissions.

**Solution:**
```bash
# On Linux/Mac
chmod +w .carla/

# Or run with sudo (not recommended)
sudo npx @interworky/carla-nextjs scan
```

## Getting Help

If you're still stuck:

1. **Check Documentation:**
   - [Getting Started](/guide/getting-started)
   - [Configuration](/guide/configuration)
   - [CLI Reference](/reference/cli)

2. **Search Issues:**
   - [GitHub Issues](https://github.com/Multi-Sync/carla-nextjs/issues)
   - Someone may have had the same problem

3. **Ask for Help:**
   - [Discord Community](https://discord.com/invite/YHmsekzMV5)
   - [GitHub Discussions](https://github.com/Multi-Sync/carla-nextjs/discussions)

4. **Report a Bug:**
   - [Create an Issue](https://github.com/Multi-Sync/carla-nextjs/issues/new)
   - Include error messages and reproduction steps

## Debug Mode

Enable debug mode for more information:

```bash
# Set debug env var
DEBUG=carla:* npx @interworky/carla-nextjs scan

# Or check debug.json
cat .carla/debug.json
```

This will provide detailed logs to help diagnose issues.
